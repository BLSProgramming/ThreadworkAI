from flask import Blueprint, request, jsonify, Response, session
from db_connection import get_db_connection
import os
from openai import OpenAI
from dotenv import load_dotenv
import concurrent.futures
import json
import time
import re

load_dotenv()

chat_routes = Blueprint('chat', __name__)

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ.get("HF_TOKEN"),
)

# ---------------- MEMORY HELPERS ---------------- #

def get_recent_memory(user_id, limit=5):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT user_message, model_response
        FROM chats
        WHERE user_id = %(user_id)s
        ORDER BY created_at DESC
        LIMIT %(limit)s
    """, {"user_id": user_id, "limit": limit})

    rows = cursor.fetchall()
    cursor.close()
    connection.close()

    if not rows:
        return ""

    return "\n".join(
        f"User: {r[0]}\nAssistant: {r[1]}"
        for r in reversed(rows)
    )


def condense_memory(raw_memory):
    if not raw_memory.strip():
        return ""

    prompt = f"""
Summarize this conversation history into stable memory only:
- User preferences
- Long-term goals
- Important constraints

Rules:
- Under 150 tokens
- No fluff
- Ignore one-off questions

CONVERSATION:
{raw_memory}
"""

    completion = client.chat.completions.create(
        model="openai/gpt-oss-20b:novita",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        timeout=60
    )

    return completion.choices[0].message.content.strip()


def strip_repetition(text):
    sentences = re.split(r'(?<=[.!?])\s+', text)
    seen = set()
    output = []
    for s in sentences:
        key = s.lower().strip()
        if key not in seen:
            seen.add(key)
            output.append(s)
    return " ".join(output)


# ---------------- CHAT ROUTE ---------------- #

@chat_routes.route('/api/chat', methods=['POST'])
def chat():
    user_id = session['user_id']
    data = request.json

    user_message = f"{data.get('message', '').strip()}. English only."
    selected_models = data.get('models', ['deepseek', 'llama', 'glm'])
    enable_synthesis = data.get('synthesize', True)
    min_for_synthesis = data.get('min_for_synthesis', 2)

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    # -------- MEMORY LOAD -------- #
    raw_memory = get_recent_memory(user_id)
    memory_context = condense_memory(raw_memory)

    model_configs = {
        "deepseek": {"label": "DeepSeek", "hf_model": "deepseek-ai/DeepSeek-V3.2:novita"},
        "llama": {"label": "Llama", "hf_model": "meta-llama/Llama-3.1-8B-Instruct:novita"},
        "glm": {"label": "GLM", "hf_model": "zai-org/GLM-4.6:novita"},
    }

    def invoke_model(cfg):
        completion = client.chat.completions.create(
            model=cfg["hf_model"],
            messages=[
                {
                    "role": "system",
                    "content": f"Relevant user context:\n{memory_context}" if memory_context else "No prior context."
                },
                {"role": "user", "content": user_message}
            ],
            timeout=90,
        )

        return {
            "model": cfg["label"],
            "response": completion.choices[0].message.content,
            "success": True
        }

    def generate():
        results = []

        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures = [
                executor.submit(invoke_model, model_configs[m])
                for m in selected_models if m in model_configs
            ]

            for f in concurrent.futures.as_completed(futures):
                r = f.result()
                results.append(r)
                yield f"data: {json.dumps({'type': 'model_response', 'data': r})}\n\n"

        if enable_synthesis and len(results) >= min_for_synthesis:
            formatted = "\n".join(
                f"[{r['model']}]\n{r['response']}"
                for r in results
            )

            synthesis_prompt = f"""
USER QUESTION:
{user_message}

RELEVANT USER MEMORY:
{memory_context}

MODEL RESPONSES:
{formatted}

TASK:
Produce ONE correct, internally consistent answer using only the model responses.
"""

            completion = client.chat.completions.create(
                model="openai/gpt-oss-20b:novita",
                messages=[{"role": "user", "content": synthesis_prompt}],
                max_tokens=2048,
                timeout=90
            )

            synthesis_response = strip_repetition(
                completion.choices[0].message.content
            )

            # -------- MEMORY WRITE-BACK -------- #
            memory_prompt = f"""
Extract long-term memory from this exchange.
Return NONE if nothing stable.

User: {user_message}
Assistant: {synthesis_response}
"""

            memory_result = client.chat.completions.create(
                model="openai/gpt-oss-20b:novita",
                messages=[{"role": "user", "content": memory_prompt}],
                max_tokens=150
            )

            new_memory = memory_result.choices[0].message.content.strip()

            connection = get_db_connection()
            cursor = connection.cursor()

            cursor.execute("""
                INSERT INTO chats (user_id, user_message, model_response, memory_summary)
                VALUES (%s, %s, %s, %s)
            """, (
                user_id,
                user_message,
                synthesis_response,
                None if new_memory.upper() == "NONE" else new_memory
            ))

            connection.commit()
            cursor.close()
            connection.close()

            yield f"data: {json.dumps({'type': 'synthesis', 'data': synthesis_response})}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return Response(generate(), mimetype='text/event-stream')


# ---------------- HISTORY ROUTES ---------------- #

@chat_routes.route('/api/chats/save', methods=['POST'])
def update_chat_name():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = session['user_id']
    data = request.json

    chat_name = data.get("title")
    if not chat_name:
        return jsonify({"error": "Missing chat_name"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE chats
        SET chat_name = %(chat_name)s
        WHERE user_id = %(user_id)s
    """, {
        "chat_name": chat_name,
        "user_id": user_id
    })

    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"success": True, "chat_name": chat_name})


@chat_routes.route('/api/chats', methods=['GET'])
def chat_history():
    user_id = session['user_id']
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, user_message, model_response, created_at
        FROM chats
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 50
    """, (user_id,))

    chats = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify({"success": True, "chats": chats})


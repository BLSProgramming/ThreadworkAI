from flask import Blueprint, request, jsonify, Response
import os
from openai import OpenAI
from dotenv import load_dotenv
import concurrent.futures
import json
import time
import re

load_dotenv()

trial_chat_routes = Blueprint('trials', __name__)

def strip_repetition(text, min_repeat_len=20):
    if not text or len(text) < min_repeat_len * 2:
        return text

    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    if len(sentences) <= 2:
        return text

    seen = set()
    unique = []
    repeats = 0

    for s in sentences:
        norm = s.strip().lower()
        if norm in seen:
            repeats += 1
        else:
            seen.add(norm)
            unique.append(s)

    if repeats > len(sentences) * 0.3:
        return " ".join(unique)

    return text


# -------------------------
# OpenAI client via HF router
# -------------------------
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ.get("HF_TOKEN"),
)

# -------------------------
# Model configuration
# -------------------------
MODEL_CONFIGS = {
    "deepseek": {
        "label": "DeepSeek",
        "hf_model": "deepseek-ai/DeepSeek-V3.2:novita",
    },
    "llama": {
        "label": "Llama",
        "hf_model": "meta-llama/Llama-3.1-8B-Instruct:novita",
    },
}

VALID_MODELS = set(MODEL_CONFIGS.keys())


# -------------------------
# API Route
# -------------------------
@trial_chat_routes.route("/api/trial-chat", methods=["POST"])
def trial_chat():
    try:
        data = request.json or {}

        base_message = data.get("message", "").strip()
        if not base_message:
            return jsonify({"error": "Message cannot be empty"}), 400

        user_message = base_message + "\n\nRespond in English only."

        selected_models = data.get("models", list(VALID_MODELS))
        selected_models = [m for m in selected_models if m in VALID_MODELS][:4]

        if not selected_models:
            return jsonify({"error": "No valid models selected"}), 400

        enable_synthesis = data.get("synthesize", True)
        min_for_synthesis = max(1, int(data.get("min_for_synthesis", 2)))

        # -------------------------
        # Model invocation
        # -------------------------
        def invoke_model(cfg):
            def call_once():
                start = time.time()
                completion = client.chat.completions.create(
                    model=cfg["hf_model"],
                    messages=[{"role": "user", "content": user_message}],
                    timeout=90,
                )
                text = completion.choices[0].message.content
                if not text or not text.strip():
                    raise ValueError("Empty response")
                return text, time.time() - start

            try:
                response, elapsed = call_once()
                print(f"[{cfg['label']}] OK ({elapsed:.2f}s)")
                return {
                    "model": cfg["label"],
                    "response": response,
                    "success": True,
                    "elapsed": elapsed,
                }
            except Exception as e:
                print(f"[{cfg['label']}] Retry after error: {e}")
                try:
                    time.sleep(0.3)
                    response, elapsed = call_once()
                    return {
                        "model": cfg["label"],
                        "response": response,
                        "success": True,
                        "elapsed": elapsed,
                        "retried": True,
                    }
                except Exception as e2:
                    return {
                        "model": cfg["label"],
                        "success": False,
                        "error": str(e2),
                    }

        # -------------------------
        # Streaming generator (SSE)
        # -------------------------
        def generate():
            successful = []
            failed = []

            with concurrent.futures.ThreadPoolExecutor(
                max_workers=len(selected_models)
            ) as executor:
                futures = {
                    executor.submit(invoke_model, MODEL_CONFIGS[m]): m
                    for m in selected_models
                }

                for future in concurrent.futures.as_completed(futures):
                    result = future.result()
                    if result.get("success"):
                        successful.append(result)
                        payload = {
                            "type": "model_response",
                            "data": result,
                        }
                        yield f"data: {json.dumps(payload)}\n\n"
                    else:
                        failed.append(result)
                        print("[MODEL FAILED]", result.get("error"))

            # -------------------------
            # Synthesis step
            # -------------------------
            if enable_synthesis and len(successful) >= min_for_synthesis:
                formatted = "\n".join(
                    f"===== {r['model']} =====\n{r['response']}\n"
                    for r in successful
                )

                synthesis_prompt = f"""
You are synthesizing multiple AI responses into ONE correct answer.

USER QUESTION:
{base_message}

MODEL RESPONSES:
{formatted}

RULES:
- Use only information from the model responses
- Resolve conflicts logically
- Do not invent facts

OUTPUT FORMAT:

===REASONING===
(short explanation)

===ANSWER===
(final answer)
"""

                try:
                    completion = client.chat.completions.create(
                        model="openai/gpt-oss-20b:novita",
                        messages=[{"role": "user", "content": synthesis_prompt}],
                        max_tokens=1500,
                        timeout=90,
                        frequency_penalty=1.2,
                    )

                    synthesis_text = strip_repetition(
                        completion.choices[0].message.content
                    )

                    payload = {
                        "type": "synthesis",
                        "data": {
                            "model": "GPT-OSS",
                            "response": synthesis_text,
                        },
                    }
                    yield f"data: {json.dumps(payload)}\n\n"

                except Exception as e:
                    payload = {
                        "type": "synthesis",
                        "data": {
                            "model": "GPT-OSS",
                            "error": True,
                            "response": str(e),
                        },
                    }
                    yield f"data: {json.dumps(payload)}\n\n"

            # -------------------------
            # Done
            # -------------------------
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        return Response(
            generate(),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except Exception as err:
        print("Fatal error:", err)
        return jsonify({"success": False, "error": str(err)}), 500

from flask import Blueprint, request, jsonify, session
from db_connection import get_db_connection
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

trial_chat = Blueprint('trial_chat_route', __name__)

# Client used to send chat messages to different models
client = OpenAI(
    base_url="https://router.huggingface.co/v1",  # Points to Hugging Face's OpenAI-compatible API router
    api_key=os.getenv("HF_TOKEN"),
)


@trial_chat.route('/api/trial-chat', methods=['POST'])
def trial_chat_route():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        selected_models = data.get('models') or ['llama', 'qwen']

        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400

        if not selected_models:
            return jsonify({"error": "At least one model must be selected"}), 400

        responses = []
        available_responses = []

        model_configs = {
            "llama": {
                "label": "Llama",
                "hf_model": "meta-llama/Llama-3.1-8B-Instruct:novita",
            },
            "qwen": {
                "label": "Qwen",
                "hf_model": "Qwen/Qwen3-Coder-30B-A3B-Instruct:nebius",
            },
        }

        # Helper to invoke a model
        def invoke_model(config):
            # Sends a chat request to the Hugging Face hosted model
            completion = client.chat.completions.create(
                model=config["hf_model"],
                messages=[
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
            )
            return completion.choices[0].message.content

        # Call each selected model
        for model_key in selected_models:
            # Get model dict information
            config = model_configs.get(model_key)
            if not config:
                continue
            try:
                # Calls the model and gets its answer
                model_response = invoke_model(config).strip()  # Sends json
                responses.append({
                    "model": config["label"],
                    "response": model_response
                })
                # Adds to avail. responses = Good responses
                if model_response:
                    available_responses.append((config["label"], model_response))
            except Exception as model_err:
                print(f"Error calling {config['label']}: {model_err}")
                # Adds fail as a response so front end can get it
                responses.append({
                    "model": config["label"],
                    "response": f"Error: {str(model_err)}"
                })

        for m in available_responses:
            connection = get_db_connection()
            cursor = connection.cursor()

            cursor.execute("""
                INSERT INTO chats (user_id, model_name, user_message,  model_response)
                VALUES (%(user_id)s, %(model_name)s, %(user_message)s, %(model_response)s)
                """, {
                'user_id': user_id,
                'model_name': m[0],
                'user_message': user_message,
                'model_response': m[1]
            })

            connection.commit()
            cursor.close()
            connection.close()

        # Create prompt for GPT-OSS by combining available model responses
        gpt_oss_prompt = user_message
        if available_responses:
            combined = "\n\n".join([
                f"{label} Response:\n{resp}" for label, resp in available_responses
            ])
            gpt_oss_prompt = f"""You are a synthesis assistant. Read the user question and the model responses. Produce a single, concise, and actionable answer.
User question:
{user_message}

Model responses:
{combined}

Synthesis instructions:
- Combine the strongest points; resolve disagreements with reasoning.
- If facts conflict, prefer the more specific, evidenced, and consistent statements.
- Remove fluff; be direct and organized with short paragraphs or bullets.
- Do not mention model names or show any raw responses.
- If there are gaps or uncertainty, note them briefly with a suggested next step.
- If the question is step-by-step, give an ordered list; otherwise provide 1-2 short paragraphs.
- Keep the answer under 180 words unless brevity would harm clarity.
- Filter any response out that is not English
"""

        # Call GPT-OSS model with the combined prompt
        try:
            # noinspection PyTypeChecker
            gpt_oss_completion = client.chat.completions.create(
                model="openai/gpt-oss-20b:novita",
                messages=[
                    {
                        "role": "user",
                        "content": gpt_oss_prompt
                    }
                ],
            )
            gpt_oss_response = gpt_oss_completion.choices[0].message.content
            responses.append({
                "model": "GPT-OSS",
                "response": gpt_oss_response
            })
        except Exception as gpt_oss_err:
            print(f"Error calling GPT-OSS: {gpt_oss_err}")
            responses.append({
                "model": "GPT-OSS",
                "response": f"Error: {str(gpt_oss_err)}"
            })

        # Return both responses
        return jsonify({
            "responses": responses,
            "success": True
        }), 200

    except Exception as err:
        print(f"Error in chat endpoint: {err}")
        return jsonify({
            "error": str(err),
            "success": False
        }), 500
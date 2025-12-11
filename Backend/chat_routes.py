from flask import Blueprint, request, jsonify
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

chat_routes = Blueprint('chat', __name__)

# Initialize OpenAI client with Hugging Face token
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ.get("HF_TOKEN"),
)

@chat_routes.route('/api/chat', methods=['POST'])
def chat():
    """
    Handle chat messages from the frontend.
    Expects JSON: { "message": "user message here", "models": ["deepseek", "llama", "glm", "qwen"] }
    Returns JSON: { "responses": [{ "model": "model_name", "response": "response text" }] }
    """
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        selected_models = data.get('models') or ['deepseek', 'llama', 'glm', 'qwen']
        selected_models = [m for m in selected_models if m in ['deepseek', 'llama', 'glm', 'qwen']]
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400

        if not selected_models:
            return jsonify({"error": "At least one model must be selected"}), 400
        
        responses = []
        available_responses = []

        model_configs = {
            "deepseek": {
                "label": "DeepSeek",
                "hf_model": "deepseek-ai/DeepSeek-V3.2:novita",
            },
            "llama": {
                "label": "Llama",
                "hf_model": "meta-llama/Llama-3.1-8B-Instruct:novita",
            },
            "glm": {
                "label": "GLM",
                "hf_model": "zai-org/GLM-4.6:novita",
            },
            "qwen": {
                "label": "Qwen",
                "hf_model": "Qwen/Qwen3-Coder-30B-A3B-Instruct:nebius",
            },
        }

        # Helper to invoke a model
        def invoke_model(cfg):
            completion = client.chat.completions.create(
                model=cfg["hf_model"],
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
            cfg = model_configs.get(model_key)
            if not cfg:
                continue
            try:
                model_response = invoke_model(cfg)
                responses.append({
                    "model": cfg["label"],
                    "response": model_response
                })
                if model_response:
                    available_responses.append((cfg["label"], model_response))
            except Exception as model_err:
                print(f"Error calling {cfg['label']}: {model_err}")
                responses.append({
                    "model": cfg["label"],
                    "response": f"Error: {str(model_err)}"
                })

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
"""
        
        # Call GPT-OSS model with the combined prompt
        try:
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
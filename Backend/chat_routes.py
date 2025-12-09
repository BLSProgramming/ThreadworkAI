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
    Expects JSON: { "message": "user message here" }
    Returns JSON: { "responses": [{ "model": "model_name", "response": "response text" }] }
    """
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        responses = []
        
        # Call DeepSeek model
        try:
            deepseek_completion = client.chat.completions.create(
                model="deepseek-ai/DeepSeek-V3.2:novita",
                messages=[
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
            )
            deepseek_response = deepseek_completion.choices[0].message.content
            responses.append({
                "model": "DeepSeek",
                "response": deepseek_response
            })
        except Exception as deepseek_err:
            print(f"Error calling DeepSeek: {deepseek_err}")
            responses.append({
                "model": "DeepSeek",
                "response": f"Error: {str(deepseek_err)}"
            })
            deepseek_response = None
        
        # Call Llama model
        try:
            llama_completion = client.chat.completions.create(
                model="meta-llama/Llama-3.1-8B-Instruct:novita",
                messages=[
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
            )
            llama_response = llama_completion.choices[0].message.content
            responses.append({
                "model": "Llama",
                "response": llama_response
            })
        except Exception as llama_err:
            print(f"Error calling Llama: {llama_err}")
            responses.append({
                "model": "Llama",
                "response": f"Error: {str(llama_err)}"
            })
            llama_response = None
        
        # Create prompt for GPT-OSS by combining DeepSeek and Llama responses
        gpt_oss_prompt = user_message
        if deepseek_response and llama_response:
            gpt_oss_prompt = f"""DeepSeek Response:\n{deepseek_response}\n\nLlama Response:\n{llama_response}\n\nUSE THIS INFORMATION TO COMPARE AND CONTRAST BETWEEN THE DIFFERENT ANSWERS, TO PROVIDE A CLEAR PRECISE SUMMARY ANSWER TO THE USER QUESTION ABOVE. THE OUTPUT SHOULD TAKE BOTH RESPONSES FROM THE AI AND COMBINE THEM TOGETHER TO FORM THE BEST POSSIBLE ANSWER TO THE USER QUESTION. THE OUTPUT SHOULD NOT INCLUDE EITHER OF THE RAW RESPONSES FROM DEEPSEEK OR LLAMA, JUST THE COMBINED ANSWER TO THE USER QUESTION. THE OUTPUT SHOULD NOT NAME EITHER OF THE MODELS, JUST PROVIDE THE FINAL ANSWER TO THE USER QUESTION."""
        
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

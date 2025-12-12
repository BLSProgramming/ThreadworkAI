from flask import Blueprint, request, jsonify, Response
import os
from openai import OpenAI
from dotenv import load_dotenv
import concurrent.futures
import json
import time

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
    Handle chat messages with streaming responses.
    Expects JSON: { "message": "user message here", "models": ["deepseek", "llama", "glm", "qwen"], "stream": true }
    Returns: Server-Sent Events stream with responses as they're generated
    """
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        selected_models = data.get('models') or ['deepseek', 'llama', 'glm', 'qwen']
        selected_models = [m for m in selected_models if m in ['deepseek', 'llama', 'glm', 'qwen', 'essential', 'moonshot']]
        enable_synthesis = data.get('synthesize', True)
        
        # Enforce max 4 models
        if len(selected_models) > 4:
            selected_models = selected_models[:4]
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400

        if not selected_models:
            return jsonify({"error": "At least one model must be selected"}), 400
        
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
            "essential": {
                "label": "Essential",
                "hf_model": "EssentialAI/rnj-1-instruct:together",
            },
            "moonshot": {
                "label": "Moonshot",
                "hf_model": "moonshotai/Kimi-K2-Thinking:novita",
            }
        }

        # Helper to invoke a model with a single retry on transient error
        def invoke_model(cfg):
            def _call_once():
                start_time = time.time()
                completion = client.chat.completions.create(
                    model=cfg["hf_model"],
                    messages=[{"role": "user", "content": user_message}],
                    timeout=90,
                )
                elapsed = time.time() - start_time
                response_text = completion.choices[0].message.content
                return response_text, elapsed

            try:
                response_text, elapsed = _call_once()
                print(f"[{cfg['label']}] Completed in {elapsed:.2f}s ({len(response_text)} chars)")
                return {
                    "model": cfg["label"],
                    "response": response_text,
                    "success": True,
                    "elapsed": elapsed,
                    "response_len": len(response_text),
                }
            except Exception as e:
                error_msg = str(e)
                print(f"[{cfg['label']}] Error (first attempt): {error_msg}")
                # Brief backoff then retry once
                try:
                    time.sleep(0.3)
                    response_text, elapsed = _call_once()
                    print(f"[{cfg['label']}] Completed after retry in {elapsed:.2f}s ({len(response_text)} chars)")
                    return {
                        "model": cfg["label"],
                        "response": response_text,
                        "success": True,
                        "elapsed": elapsed,
                        "response_len": len(response_text),
                        "retried": True,
                    }
                except Exception as e2:
                    error_msg2 = str(e2)
                    print(f"[{cfg['label']}] Error (retry): {error_msg2}")
                    return {
                        "model": cfg["label"],
                        "response": f"Error: {error_msg2}",
                        "success": False,
                        "elapsed": 0,
                        "response_len": 0,
                    }

        def generate():
            # Call all models concurrently using ThreadPoolExecutor
            responses = []
            available_responses = []
            
            max_workers = max(1, min(4, len(selected_models)))
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                # Submit all model requests
                futures = {}
                for model_key in selected_models:
                    cfg = model_configs.get(model_key)
                    if cfg:
                        future = executor.submit(invoke_model, cfg)
                        futures[future] = model_key

                # Yield responses as they complete
                for future in concurrent.futures.as_completed(futures):
                    result = future.result()
                    responses.append(result)
                    available_responses.append((result["model"], result["response"], result.get("success", False)))
                    
                    # Send response immediately
                    yield f"data: {json.dumps({'type': 'model_response', 'data': result})}\n\n"

            # Optional synthesis step
            if enable_synthesis:
                # Filter successful responses for synthesis (skip errors)
                successful_responses = [(label, resp) for label, resp, ok in available_responses if ok and not resp.startswith("Error:")]
                
                if successful_responses:
                    # Format responses clearly with brackets for visual separation
                    formatted_responses = "\n".join([
                        f"[{label}]\n{resp}\n"
                        for label, resp in successful_responses
                    ])
                    
                    synthesis_prompt = f"""ROLE: You are a synthesis expert with authority to validate responses against domain standards. Cross-check multiple model responses, identify errors, and produce one accurate, actionable answer using canonical knowledge when needed.

USER QUESTION:
{user_message}

MODEL RESPONSES (treat as independent claims requiring validation):
{formatted_responses}

SYNTHESIS METHOD:
1. Extract key claims and compare for agreement, contradiction, and gaps.
2. For each claim, assign support count (e.g., "3/4 models agree").
3. VALIDATE PLAUSIBILITY: If consensus contradicts well-established domain knowledge (e.g., recipe proportions, standard procedures, widely known facts), apply a CANONICAL OVERRIDE with justification.
4. For recipes: validate core ingredient ratios, temperatures, and techniques against classic published recipes. Common red velvet standards: 1¾–2 cups sugar, ½ cup oil, 2–3 Tbsp cocoa, 2 cups flour, buttermilk+acid+baking soda chemistry.
5. For technical/procedural questions: check against authoritative references or first principles.
6. Label corrections as "canonical override" and briefly explain the standard used.
7. Singletons are low-confidence unless they match a known standard missing from other responses.

OUTPUT STRUCTURE (MANDATORY - ALL FOUR SECTIONS REQUIRED):

REASONING

1) Consensus
- List claims supported by 2+ models with counts (e.g., "supported by 3/4")
- Flag any that are implausible despite support

2) Conflicts  
- List disagreements with support counts for each side
- State which side is chosen and why (plausibility, domain knowledge, verifiability)
- Note any canonical overrides applied

3) Evidence & Checks
- Provide 3–4 testable validations, heuristics, or external checks
- Include observable cues (texture, timing, measurements) users can verify

VERDICT

4) Final Answer
- Provide complete, step-by-step guidance incorporating all canonical corrections
- For recipes: full ingredient list with corrected quantities, complete method
- Length: 200–300 words minimum to ensure completeness
- Use numbered steps, bullet points for clarity
- Must be self-contained and immediately actionable

CRITICAL RULES:
- DO NOT TRUNCATE. Complete all four sections fully.
- Apply canonical overrides when consensus is implausible.
- Anonymize: never mention model names.
- If uncertain, state uncertainty and provide validation method.
- Professional, direct tone.

Generate the complete output now:"""
                    
                    try:
                        start_time = time.time()
                        completion = client.chat.completions.create(
                            model="openai/gpt-oss-20b:novita",
                            messages=[
                                {
                                    "role": "user",
                                    "content": synthesis_prompt
                                }
                            ],
                            timeout=60,
                        )
                        elapsed = time.time() - start_time
                        synthesis_response = completion.choices[0].message.content
                        print(f"[GPT-OSS] Synthesis completed in {elapsed:.2f}s ({len(synthesis_response)} chars)")
                        yield f"data: {json.dumps({'type': 'synthesis', 'data': {'model': 'GPT-OSS', 'response': synthesis_response}})}\n\n"
                    except Exception as e:
                        error_msg = str(e)
                        print(f"[GPT-OSS] Synthesis error: {error_msg}")
                        yield f"data: {json.dumps({'type': 'synthesis', 'data': {'model': 'GPT-OSS', 'response': f'Synthesis error: {error_msg}', 'error': True}})}\n\n"
                else:
                    # Always emit a synthesis event explaining why it's skipped
                    reason = "No successful model responses; synthesis skipped"
                    yield f"data: {json.dumps({'type': 'synthesis', 'data': {'model': 'GPT-OSS', 'response': reason, 'error': True, 'skipped': True}})}\n\n"
            
            # Send completion signal
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        return Response(generate(), mimetype='text/event-stream')
        
    except Exception as err:
        print(f"Error in chat endpoint: {err}")
        return jsonify({
            "error": str(err),
            "success": False
        }), 500
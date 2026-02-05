from flask import Blueprint, request, jsonify, Response, session
from db_connection import get_db_connection
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
    user_id = session['user_id']
    """
    Handle chat messages with streaming responses.
    Expects JSON: { "message": "user message here", "models": ["deepseek", "llama", "glm", "qwen"], "stream": true }
    Returns: Server-Sent Events stream with responses as they're generated
    """
    try:
        data = request.json
        user_message = f"{data.get('message', '').strip()}. English only. Do not mention in your response that I asked this"
        selected_models = data.get('models') or ['deepseek', 'llama', 'glm', 'qwen']
        valid_model_names = {'deepseek', 'llama', 'glm', 'qwen', 'essential', 'moonshot'}
        selected_models = [m for m in selected_models if m in valid_model_names]
        enable_synthesis = data.get('synthesize', True)
        min_for_synthesis = data.get('min_for_synthesis', 2)  # Require at least 2 responses to synthesize
        
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
                # Validate response quality: must be non-empty and not just whitespace
                if not response_text or not response_text.strip():
                    raise ValueError("Model returned empty response")
                return response_text, elapsed


            try:
                response_text, elapsed = _call_once()
                print(f"[{cfg['label']}] Success: {elapsed:.2f}s ({len(response_text)} chars)")
                return {
                    "model": cfg["label"],
                    "response": response_text,
                    "success": True,
                    "elapsed": elapsed,
                    "response_len": len(response_text),
                }
            except Exception as e:
                error_msg = str(e)
                print(f"[{cfg['label']}] Failed (attempt 1): {error_msg}")
                # Retry once with brief backoff
                try:
                    time.sleep(0.3)
                    response_text, elapsed = _call_once()
                    print(f"[{cfg['label']}] Success after retry: {elapsed:.2f}s ({len(response_text)} chars)")
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
                    print(f"[{cfg['label']}] Failed after retry: {error_msg2}")
                    return {
                        "model": cfg["label"],
                        "response": None,
                        "success": False,
                        "error": error_msg2,
                        "elapsed": 0,
                    }

        # noinspection PyTypeChecker
        def generate():
            successful_results = []  
            failed_results = []  
            
            max_workers = max(1, min(4, len(selected_models)))
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                # Submit all model requests
                futures = {}
                for model_key in selected_models:
                    cfg = model_configs.get(model_key)
                    if cfg:
                        future = executor.submit(invoke_model, cfg)
                        futures[future] = model_key


                # Yield responses as they complete (only send successful ones to frontend)
                for future in concurrent.futures.as_completed(futures):
                    result = future.result()
                    if result.get("success", False):
                        successful_results.append(result)
                        # Send successful response to frontend
                        yield f"data: {json.dumps({'type': 'model_response', 'data': result})}\n\n"
                    else:
                        failed_results.append(result)
                        print(f"[{result['model']}] Skipped from stream (failed): {result.get('error', 'unknown')}")


            # Optional synthesis step (requires minimum responses)
            if enable_synthesis and len(successful_results) >= min_for_synthesis:
                num_models = len(successful_results)
                num_failed = len(failed_results)
                
                # Log synthesis metadata
                print(f"[Synthesis] Starting with {num_models} successful models (min required: {min_for_synthesis}), {num_failed} failed")
                if failed_results:
                    failed_names = [r['model'] for r in failed_results]
                    print(f"[Synthesis] Failed models: {', '.join(failed_names)}")
                    
                # Format responses with clear boundaries and model attribution
                formatted_responses = "\n".join([
                    f"{'='*60}\n[MODEL: {result['model']}]\n{'='*60}\n{result['response']}\n"
                    for result in successful_results
                ])
                
                # Detect if this is a simple factual question
                user_message_lower = user_message.lower()
                simple_question_indicators = [
                    'what is', 'what are', 'who is', 'who are', 'when is', 'when was',
                    'where is', 'where are', 'capital of', 'how many', 'how much',
                    'define', 'definition of', 'meaning of'
                ]
                is_simple_question = (
                    len(user_message.split()) <= 15 and  # Short question
                    any(indicator in user_message_lower for indicator in simple_question_indicators)
                )
                
                if is_simple_question:
                    # Simplified prompt for factual questions
                    synthesis_prompt = f"""You are synthesizing {num_models} model responses to answer a factual question.

USER QUESTION:
{user_message}

MODEL RESPONSES:
{formatted_responses}

INSTRUCTIONS:
1. If all models agree, provide a concise, direct answer (1-3 sentences)
2. If models disagree on key facts, explain which is correct and why (2-4 sentences)
3. Only include information explicitly stated in the model responses
4. Do not add extra details, history, or context unless the models provided it

OUTPUT FORMAT:
===REASONING===
[Brief 2-3 line summary of consensus or conflict resolution]

===ANSWER===
[Direct, concise answer matching the question's scope - typically 1-3 sentences for simple facts]"""
                else:
                    # Original detailed prompt for complex questions
                    synthesis_prompt = f"""You are a world-class synthesis expert. Your job is to cross-check {num_models} model responses and produce ONE accurate, trustworthy answer.

CRITICAL PRINCIPLES:
- Consensus is helpful context, but CORRECTNESS is paramount
- If all models agree on something physically impossible, REJECT it and explain why
- If models conflict, choose based on domain logic, not voting
- Never average values or split the difference on critical parameters
- Always choose the SAFER/MORE CONSERVATIVE option for health/safety

STRICT SOURCE-OF-TRUTH RULES (NO HALLUCINATIONS):
- You may ONLY use facts explicitly stated in the MODEL RESPONSES below.
- Do NOT invent places, names, dates, quantities, steps, or justifications that are absent from the model responses.
- If a detail is missing in all responses, say "Not provided by models" rather than guessing.
- If numbers/units differ, pick ONE during conflict resolution and use it consistently everywhere. Do not create new values.
- Every concrete claim in ANSWER/REASONING must trace back to at least one model response. No extra flourishes.

CRITICAL: CHECK FOR INTERNAL CONSISTENCY
- Title/header must match the described scope, components, and final answer
- All quantities, measurements, and specifications must be consistent throughout
- If something contradicts itself (e.g., "2-part system" needing "3 components"), REJECT it
- If quantities or values conflict, choose the logically consistent version with strongest rationale
- All referenced items/steps must be mentioned and accounted for
- Fix/adjustment advice must be directionally correct (e.g., to thicken add dry ingredients/chill; to thin add liquid/warm)
- Flag any contradictions in the Conflicts section

USER QUESTION:
{user_message}

MODEL RESPONSES:
{formatted_responses}

SYNTHESIS PROCESS:

STEP 1: IDENTIFY CLAIMS
List 5-8 key claims made by the models. Note which models made each claim.

STEP 2: CHECK INTERNAL CONSISTENCY (BEFORE CONSENSUS)
Do all parts of the answer align? Examples of problems across domains:
- Title says "2-part system" but instructions reference 3 components
- Quantities conflict: says "20% of total" in one section, "40%" in another
- Scope mismatch: claims "covers A and B" but instructions only mention A
- Timeline issues: says "takes 2 hours" but steps total 4 hours
- Dependency broken: says "optional step 3" but step 4 depends on it
If you find inconsistencies, note them for Step 3 conflict resolution.

STEP 3: FIND CONSENSUS
Which claims appear in 2+ models AND are internally consistent?

STEP 4: IDENTIFY CONFLICTS
Which important details do models disagree on? List each disagreement. ALSO include any internal consistency issues found in Step 2.

STEP 5: RESOLVE CONFLICTS
For each conflict:
  a) Which option is more plausible based on domain knowledge?
  b) Which option is internally consistent with the rest of the recipe/answer?
  c) Which option is safer (if applicable)?
  d) What's the actual correct answer?
  e) Why did the models diverge here? (hallucination, ambiguous question, different interpretation?)

STEP 6: VALIDATE AGAINST DOMAIN STANDARDS
- CONSISTENCY: All numeric values, quantities, and component counts match throughout
- COMPLETENESS: All referenced items/steps/processes are defined
- LOGIC: The answer follows a clear, rational flow without gaps
- SAFETY: For health/technical topics, ensure recommendations meet safety standards
- FEASIBILITY: The proposed solution is actually achievable with stated resources/constraints
 - FIX-IT LOGIC: Corrections are physically/logically correct (e.g., to thicken add dry/chill; to thin add liquid/heat)

STEP 7: BUILD FINAL ANSWER
Synthesize into ONE clear, complete answer using only validated, internally-consistent information.

OUTPUT FORMAT - Use EXACTLY these markers with === signs:

===REASONING===

**Consensus** (3-5 key points 2+ models agree on AND are internally consistent)
• [specific claim] — in [Model A] and [Model B]
• [specific claim] — in [Model A], [Model B], [Model C]

**Conflicts** (important disagreements, inconsistencies, and how they were resolved)
• [disagreement]: [Model A] said X, [Model B] said Y → chose [option] because [domain logic]
• [disagreement]: [Model A] said X, [Model B] said Y, [Model C] said Z → chose [option] because [reasoning]

**Checks** (validation proving the answer is sound)
• [specific sanity check with numbers/ratios if applicable]
• [how to verify this works in practice]
• [common mistake to avoid]

===ANSWER===

[250+ words. Complete, ready-to-use answer. For recipes: ingredients with exact quantities and order, all steps numbered. For technical: step-by-step with clarity. Include ANY caveats from conflicts.]

===TIPS===

• [actionable tip 1]
• [actionable tip 2]

RULES:
- Output MUST use === delimiters exactly as shown
- Use bullet points (•) for lists, not numbered, not tables
- Be thorough—never truncate, provide complete answer
- Never mention model names in the ANSWER section
- If you override consensus, explain clearly in Conflicts why
- Be specific enough to execute/follow, with exact values where applicable
- Flag any uncertainties or assumptions made
- **CRITICAL**: Pick ONE configuration/approach when contradictions exist and use it EVERYWHERE throughout the answer:
  • Title/header must match the described approach
  • All supporting details must reference the same approach (no alternatives mid-answer)
  • All quantities/values must align with the chosen approach
  • All steps/components must be consistent with that configuration
  This prevents answers that contradict themselves, like "2-part system" requiring "3 components"."""

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
                        timeout=90,
                    )
                    elapsed = time.time() - start_time
                    synthesis_response = completion.choices[0].message.content

                    # user_id = session['user_id']
                    connection = get_db_connection()
                    cursor = connection.cursor()

                    cursor.execute("""
                                INSERT INTO chats (user_id, user_message, model_response)
                                VALUES (%(user_id)s, %(user_message)s, %(model_response)s)
                                """, {
                        'user_id': user_id,
                        'user_message': user_message.split(".English")[0].strip(),
                        'model_response': synthesis_response
                    })

                    connection.commit()
                    cursor.close()
                    connection.close()

                    # Log synthesis quality metrics
                    synthesis_len = len(synthesis_response)
                    has_reasoning = "===REASONING===" in synthesis_response
                    has_answer = "===ANSWER===" in synthesis_response
                    has_tips = "===TIPS===" in synthesis_response
                    has_consensus = "**Consensus**" in synthesis_response
                    has_conflicts = "**Conflicts**" in synthesis_response
                    has_checks = "**Checks**" in synthesis_response
                    
                    print(f"[GPT-OSS] Synthesis completed in {elapsed:.2f}s ({synthesis_len} chars)")
                    print(f"[GPT-OSS] Format check: Reasoning={has_reasoning}, Answer={has_answer}, Tips={has_tips}")
                    print(f"[GPT-OSS] Content check: Consensus={has_consensus}, Conflicts={has_conflicts}, Checks={has_checks}")
                    
                    yield f"data: {json.dumps({'type': 'synthesis', 'data': {'model': 'GPT-OSS', 'response': synthesis_response}})}\n\n"
                except Exception as e:
                    error_msg = str(e)
                    print(f"[GPT-OSS] Synthesis error: {error_msg}")
                    yield f"data: {json.dumps({'type': 'synthesis', 'data': {'model': 'GPT-OSS', 'response': f'Synthesis error: {error_msg}', 'error': True}})}\n\n"
            elif enable_synthesis:
                successful_count = len(successful_results)
                total_requested = len(selected_models)
                min_needed = max(1, min_for_synthesis)
                reason = f"Synthesis skipped: {successful_count}/{total_requested} successful (need {min_needed}+)"
                print(f"[Synthesis] {reason}")
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

@chat_routes.route('/api/chats', methods=['GET'])
def chat_history():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = session['user_id']

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
            SELECT id, user_message, model_response, created_at
            FROM chats
            WHERE user_id = %(user_id)s
            ORDER BY created_at DESC
            LIMIT 50
        """, {
                'user_id': user_id
            })

    chats = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({
        "success": True,
        "chats": chats
    })

@chat_routes.route('/api/chats/save', methods=['POST'])
def update_chat_name():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = session['user_id']
    data = request.json

    chat_name = data.get("title")  # frontend sends new name
    if not chat_name:
        return jsonify({"error": "Missing chat_name"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    # Update the chat_name for this user
    cursor.execute("""
        UPDATE chats
        SET chat_name = %(chat_name)s
        WHERE user_id = %(user_id)s
    """,
        {"chat_name": chat_name,
         "user_id": user_id
         })

    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"success": True, "chat_name": chat_name})


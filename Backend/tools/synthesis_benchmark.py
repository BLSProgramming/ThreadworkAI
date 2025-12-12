import time, json, csv, requests
from typing import List

BASE = "http://localhost:5000/api/chat"  # adjust if backend port differs
PROMPTS: List[str] = [
    "Explain quicksort in 5 bullet points.",
    "Translate this to Spanish: The sky is clear and blue.",
    "Write a Python function to merge two sorted lists.",
    "Summarize the key causes of WW1 in under 150 words.",
]
MODELS = ["deepseek", "llama", "glm", "qwen"]  # add 'essential','moonshot' as needed
TRIALS = 3
TIMEOUT_S = 90


def run_trial(prompt: str):
    start_all = time.time()
    try:
        r = requests.post(
            BASE,
            json={"message": prompt, "models": MODELS, "synthesize": True},
            stream=True,
            timeout=TIMEOUT_S,
        )
    except Exception as e:
        return {
            "prompt": prompt,
            "trial": None,
            "status": "request_error",
            "error": str(e),
        }

    if r.status_code != 200:
        return {
            "prompt": prompt,
            "trial": None,
            "status": "http_error",
            "code": r.status_code,
        }

    first_model_time = None
    synthesis_time = None
    models_done = set()

    for raw in r.iter_lines(decode_unicode=True):
        if not raw:
            continue
        if not raw.startswith("data: "):
            continue
        payload = raw[6:]
        try:
            event = json.loads(payload)
        except Exception:
            continue
        etype = event.get("type")
        if etype == "model_response":
            model = event.get("data", {}).get("model")
            if first_model_time is None:
                first_model_time = time.time() - start_all
            if model:
                models_done.add(model)
        elif etype == "synthesis":
            synthesis_time = time.time() - start_all
        elif etype == "done":
            break

    total_time = time.time() - start_all
    return {
        "status": "ok",
        "models_count": len(models_done),
        "first_model_s": round(first_model_time or -1, 3),
        "synthesis_s": round(synthesis_time or -1, 3),
        "total_s": round(total_time, 3),
    }


def main():
    rows = []
    for prompt in PROMPTS:
        for t in range(TRIALS):
            res = run_trial(prompt)
            res["prompt"] = prompt
            res["trial"] = t
            rows.append(res)
            print(
                f"[{t}] {prompt[:40]}... -> status={res['status']} first={res.get('first_model_s')}s syn={res.get('synthesis_s')}s total={res.get('total_s')}s"
            )

    # write CSV
    csv_path = "synthesis_benchmark.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(
            f,
            fieldnames=[
                "prompt",
                "trial",
                "status",
                "models_count",
                "first_model_s",
                "synthesis_s",
                "total_s",
                "code",
                "error",
            ],
        )
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {csv_path}")

    # simple aggregate
    from collections import defaultdict

    agg = defaultdict(lambda: {"count": 0, "first": 0.0, "syn": 0.0, "total": 0.0})
    for r in rows:
        if r.get("status") != "ok":
            continue
        k = r["prompt"]
        agg[k]["count"] += 1
        agg[k]["first"] += r.get("first_model_s", 0) or 0
        agg[k]["syn"] += r.get("synthesis_s", 0) or 0
        agg[k]["total"] += r.get("total_s", 0) or 0

    print("\nPrompt, trials, avg_first_model_s, avg_synthesis_s, avg_total_s")
    for k, v in agg.items():
        n = v["count"] or 1
        print(
            f"- {k[:50]}..., {n}, {round(v['first']/n,3)}, {round(v['syn']/n,3)}, {round(v['total']/n,3)}"
        )


if __name__ == "__main__":
    main()

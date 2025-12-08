import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
 
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ.get("HF_TOKEN"),
)
 
completion = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V3.2:novita",
    messages=[
        {
            "role": "user",
            "content": "What is the capital of United States of America?"
        }
    ],
)
 
print(completion.choices[0].message)
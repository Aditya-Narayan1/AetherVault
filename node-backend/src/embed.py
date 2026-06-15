import json
import sys
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

payload = json.loads(sys.stdin.read())
text = payload.get("text", "")
embedding = model.encode(text).tolist()
print(json.dumps(embedding))

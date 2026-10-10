"""
PROJECT AURA 3.0 — PYTHON AI ENGINE
RAG & VECTOR SIMILARITY ENGINE
Provides TF-IDF based vectorization and cosine similarity scoring for document grounding.
"""

import math
import re
from typing import List, Dict, Any

def tokenize(text: str) -> List[str]:
    return re.findall(r'\b[a-zA-Z0-9_-]{2,}\b', text.lower())

def compute_tf(tokens: List[str]) -> Dict[str, float]:
    tf: Dict[str, float] = {}
    total = max(1, len(tokens))
    for t in tokens:
        tf[t] = tf.get(t, 0.0) + 1.0
    for t in tf:
        tf[t] /= total
    return tf

def compute_similarity(query: str, chunk_text: str) -> float:
    q_tokens = tokenize(query)
    c_tokens = tokenize(chunk_text)
    if not q_tokens or not c_tokens:
        return 0.0

    q_tf = compute_tf(q_tokens)
    c_tf = compute_tf(c_tokens)

    # Cosine similarity between term frequency vectors
    all_terms = set(q_tf.keys()).union(set(c_tf.keys()))
    dot_product = 0.0
    q_norm = 0.0
    c_norm = 0.0

    for term in all_terms:
        qv = q_tf.get(term, 0.0)
        cv = c_tf.get(term, 0.0)
        dot_product += qv * cv
        q_norm += qv * qv
        c_norm += cv * cv

    if q_norm == 0 or c_norm == 0:
        return 0.0

    return dot_product / (math.sqrt(q_norm) * math.sqrt(c_norm))

def rank_chunks(query: str, chunks: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    scored = []
    for chunk in chunks:
        text = chunk.get("text", "")
        sim = compute_similarity(query, text)
        if sim > 0:
            scored.append({**chunk, "score": round(sim, 4)})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]

def build_grounded_context(query: str, ranked_chunks: List[Dict[str, Any]]) -> str:
    if not ranked_chunks:
        return ""
    lines = ["--- GROUNDED KNOWLEDGE RETRIEVAL ---"]
    for i, c in enumerate(ranked_chunks):
        lines.append(f"[SOURCE NODE {i+1}] (Relevance: {c.get('score', 0)}):")
        lines.append(c.get("text", ""))
        lines.append("")
    lines.append("--- END GROUNDED KNOWLEDGE ---")
    return "\n".join(lines)

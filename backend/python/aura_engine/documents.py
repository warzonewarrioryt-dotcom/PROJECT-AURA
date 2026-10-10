"""
PROJECT AURA 3.0 — PYTHON AI ENGINE
DOCUMENTS MODULE
Handles document chunking and text normalization for multi-format knowledge indexing.
"""

import re
from typing import List, Dict, Any

def clean_document_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'\r', '', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def chunk_document(text: str, chunk_size: int = 1000, overlap: int = 150) -> List[Dict[str, Any]]:
    cleaned = clean_document_text(text)
    if not cleaned:
        return []

    chunks = []
    start = 0
    idx = 0
    length = len(cleaned)

    while start < length and idx < 10000:
        end = min(start + chunk_size, length)
        chunk_str = cleaned[start:end].strip()
        if chunk_str:
            chunks.append({
                "index": idx,
                "text": chunk_str,
                "start": start,
                "end": end,
                "length": len(chunk_str)
            })
        if end >= length:
            break
        start = max(end - overlap, start + 1)
        idx += 1

    return chunks

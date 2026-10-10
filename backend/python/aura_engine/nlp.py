"""
PROJECT AURA 3.0 — PYTHON AI ENGINE
NLP MODULE
Provides language identification (English, Tamil, Thanglish), text normalization, and keyword extraction.
"""

import re
from typing import Dict, Any, List

TAMIL_UNICODE_PATTERN = re.compile(r'[\u0B80-\u0BFF]')

THANGLISH_KEYWORDS = {
    "vanakam", "vanakkam", "enna", "pandra", "pandringa", "solra", "solunga",
    "epdi", "eppadi", "iruka", "irukinga", "iruken", "irukom", "nanba", "nanbaa",
    "thala", "machan", "machi", "bro", "romba", "nalla", "pannu", "pannunga",
    "kudunga", "kudu", "theriyuma", "puriyala", "purinjidhu", "solli", "theriyum",
    "enga", "inga", "vaanga", "ponga", "amma", "appa", "thambi", "thangachi",
    "sapdutiya", "saptingala", "pesanum", "pesunga", "konjam", "seekiram",
    "edhukku", "aama", "illa", "seri", "sari", "super", "mass", "vera", "level"
}

STOP_WORDS = {
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "of", "with",
    "is", "are", "was", "were", "be", "been", "it", "this", "that", "these",
    "those", "what", "which", "who", "whom", "why", "how", "when", "where",
    "can", "could", "should", "would", "do", "does", "did", "have", "has", "had",
    "me", "my", "we", "our", "you", "your", "he", "she", "they", "them", "i"
}

def detect_language(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        return {"language": "english", "confidence": 1.0, "details": "empty"}

    cleaned = text.strip()
    # Check for Tamil script
    tamil_chars = TAMIL_UNICODE_PATTERN.findall(cleaned)
    if tamil_chars and len(tamil_chars) >= 2:
        return {
            "language": "tamil",
            "confidence": 0.95,
            "details": f"{len(tamil_chars)} Tamil characters detected"
        }

    # Tokenize words for Thanglish
    tokens = re.findall(r'\b[a-zA-Z]+\b', cleaned.lower())
    thanglish_matches = [t for t in tokens if t in THANGLISH_KEYWORDS]

    if thanglish_matches:
        ratio = len(thanglish_matches) / max(1, len(tokens))
        return {
            "language": "thanglish",
            "confidence": min(1.0, 0.6 + ratio * 0.4),
            "matches": thanglish_matches
        }

    return {"language": "english", "confidence": 0.9, "details": "Standard English"}


def extract_keywords(text: str, top_n: int = 10) -> List[str]:
    tokens = re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', text.lower())
    filtered = [t for t in tokens if t not in STOP_WORDS]
    freq: Dict[str, int] = {}
    for t in filtered:
        freq[t] = freq.get(t, 0) + 1
    sorted_tokens = sorted(freq.items(), key=lambda item: item[1], reverse=True)
    return [t[0] for t in sorted_tokens[:top_n]]


def analyze_text(text: str) -> Dict[str, Any]:
    lang_info = detect_language(text)
    keywords = extract_keywords(text)
    char_count = len(text)
    word_count = len(text.split())
    
    return {
        "language": lang_info["language"],
        "confidence": lang_info.get("confidence", 0.9),
        "charCount": char_count,
        "wordCount": word_count,
        "keywords": keywords
    }

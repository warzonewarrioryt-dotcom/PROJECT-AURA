"""
PROJECT AURA 3.0 — PYTHON AI ENGINE
INTENT CLASSIFIER & MULTI-STEP TASK DECOMPOSITION
"""

import re
from typing import Dict, Any, List

INTENT_RULES = {
    "MULTI_STEP_AGENT": [
        r"(and then|then save|and save|save .* to my notes and create a quiz|search .* and .* save)",
        r"(find .* and .* save .* quiz)",
        r"(research .* and save .* to my notes)",
        r"(search youtube .* save .* quiz)"
    ],
    "YOUTUBE_ENGINE": [
        r"\b(youtube|yt|video|videos|channel|stream|play video|watch)\b",
        r"(search youtube|find on youtube|youtube tutorial|youtube course)"
    ],
    "RESEARCH_ENGINE": [
        r"\b(tavily|web search|google|latest news|current news|search the web|browse|live data|who won|latest updates)\b",
        r"(research the latest|find news about|search web for)"
    ],
    "QUIZ_ENGINE": [
        r"\b(quiz|quizzes|mcq|multiple choice|test me|evaluate|questions for test|practice test|generate a quiz)\b",
        r"(create a quiz|take a quiz|quiz from this)"
    ],
    "MEMORY_ENGINE": [
        r"\b(remember this|save this|keep in mind|recall|what is my|do you remember|my saved|show my saved)\b",
        r"(remember that|save to notes|add to memory|stored notes)"
    ],
    "NOTES_ENGINE": [
        r"\b(notes|summarize notes|create notes|take notes|lecture notes|revision notes)\b"
    ],
    "FILE_ENGINE": [
        r"\b(pdf|docx|txt|file|document|uploaded|vault|analyze this pdf|read this file|attachment)\b",
        r"(from this document|summarize this file)"
    ],
    "STUDY_ENGINE": [
        r"\b(study|explain|doubt|concept|what is|how does|learn|teach me|revision|flashcard|weak topic)\b",
        r"(explain recursion|explain decorators|how does work)"
    ],
    "ENGINEERING_MODE": [
        r"\b(engineering|csbs|cse|ece|mechanical|viva|semester|data structures|algorithms|operating system|dbms|compiler|computer networks)\b",
        r"(engineering quiz|viva preparation|assignment help)"
    ],
    "CREATOR_ENGINE": [
        r"\b(create|generate script|write a script|youtube script|caption|article|story|creative|art idea)\b"
    ],
    "VISUAL_ENGINE": [
        r"\b(image|picture|photo|generate image|draw|sketch|visualize|render image)\b"
    ],
    "VOICE_ENGINE": [
        r"\b(speak|voice|read aloud|say this|text to speech|tts|listen)\b"
    ]
}

def classify_intent(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        return {
            "module": "GENERAL_AI",
            "confidence": 0.5,
            "intent": "Empty or default query",
            "isMultiStep": False,
            "steps": []
        }

    cleaned = text.lower().strip()

    # 1. Multi-Step Check
    for pattern in INTENT_RULES["MULTI_STEP_AGENT"]:
        if re.search(pattern, cleaned):
            steps = plan_multi_step(cleaned)
            return {
                "module": "MULTI_STEP_AGENT",
                "confidence": 0.95,
                "intent": "Decomposed multi-step task",
                "isMultiStep": True,
                "steps": steps
            }

    # 2. Check other modules
    scores: Dict[str, float] = {}
    for module, patterns in INTENT_RULES.items():
        if module == "MULTI_STEP_AGENT":
            continue
        score = 0.0
        for pattern in patterns:
            matches = len(re.findall(pattern, cleaned))
            if matches > 0:
                score += matches * 0.4
        if score > 0:
            scores[module] = min(0.99, score)

    if scores:
        best_module = max(scores.items(), key=lambda x: x[1])
        return {
            "module": best_module[0],
            "confidence": round(best_module[1], 2),
            "intent": f"Routed to {best_module[0]} based on semantic tokens",
            "isMultiStep": False,
            "steps": []
        }

    return {
        "module": "GENERAL_AI",
        "confidence": 0.85,
        "intent": "General AI conversation or explanation",
        "isMultiStep": False,
        "steps": []
    }


def plan_multi_step(command: str) -> List[Dict[str, Any]]:
    steps = []
    
    # Check if YouTube search is requested
    if "youtube" in command or "video" in command:
        query = command
        # Extract subject
        m = re.search(r'(?:search youtube for|find youtube|find on youtube|youtube for)\s+([^,]+)', command)
        if m:
            query = m.group(1).strip()
        steps.append({
            "step": 1,
            "tool": "youtube_search",
            "action": "Search YouTube for educational videos",
            "params": {"query": query}
        })
    elif "research" in command or "web" in command:
        steps.append({
            "step": 1,
            "tool": "web_research",
            "action": "Perform live web research",
            "params": {"query": command}
        })

    # Processing & Notes
    if "save" in command or "note" in command or "remember" in command:
        steps.append({
            "step": len(steps) + 1,
            "tool": "memory_save",
            "action": "Extract key points and save to Memory Core notes",
            "params": {"title": "AURA Auto-Extracted Notes"}
        })

    # Quiz creation
    if "quiz" in command:
        steps.append({
            "step": len(steps) + 1,
            "tool": "quiz_generate",
            "action": "Generate practice quiz from the processed content",
            "params": {"count": 5, "difficulty": "Standard"}
        })

    # Synthesis
    steps.append({
        "step": len(steps) + 1,
        "tool": "ai_synthesize",
        "action": "Synthesize comprehensive mission report for user"
    })

    return steps

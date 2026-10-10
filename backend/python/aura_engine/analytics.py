"""
PROJECT AURA 3.0 — PYTHON AI ENGINE
ANALYTICS & WEAK-TOPIC DETECTION MODULE
"""

from typing import Dict, Any, List

def analyze_quiz_performance(quiz_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not quiz_results:
        return {
            "totalQuizzes": 0,
            "averageScore": 0.0,
            "weakTopics": [],
            "masteredTopics": []
        }

    topic_stats: Dict[str, Dict[str, int]] = {}
    total_score = 0
    total_possible = 0

    for result in quiz_results:
        score = result.get("score", 0)
        total = result.get("total", 1)
        topic = result.get("topic", "General")

        total_score += score
        total_possible += total

        if topic not in topic_stats:
            topic_stats[topic] = {"correct": 0, "total": 0}
        topic_stats[topic]["correct"] += score
        topic_stats[topic]["total"] += total

    weak_topics = []
    mastered_topics = []

    for topic, stats in topic_stats.items():
        percentage = (stats["correct"] / max(1, stats["total"])) * 100
        if percentage < 60:
            weak_topics.append({"topic": topic, "accuracy": round(percentage, 1)})
        elif percentage >= 85:
            mastered_topics.append({"topic": topic, "accuracy": round(percentage, 1)})

    avg = round((total_score / max(1, total_possible)) * 100, 1)

    return {
        "totalQuizzes": len(quiz_results),
        "averageScore": avg,
        "weakTopics": weak_topics,
        "masteredTopics": mastered_topics
    }

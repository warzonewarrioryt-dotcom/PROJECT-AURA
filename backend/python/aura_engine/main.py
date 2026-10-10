"""
PROJECT AURA 3.0 — PYTHON AI ENGINE
MICROSERVICE SERVER
Fast HTTP API on port 5050 using standard Python libraries.
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any

from nlp import analyze_text, detect_language
from intent import classify_intent, plan_multi_step
from rag import rank_chunks, build_grounded_context
from documents import chunk_document
from analytics import analyze_quiz_performance

PORT = int(os.environ.get("PORT", 5050))

class AuraEngineHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path in ("/", "/health", "/api/health"):
            self._set_headers(200)
            res = {
                "success": True,
                "system": "PROJECT AURA 3.0",
                "service": "Python AI Intelligence Core",
                "status": "ONLINE",
                "port": PORT,
                "capabilities": [
                    "NLP Language Detection",
                    "Semantic Intent Classification",
                    "Multi-Step Agent Task Planning",
                    "RAG Vector Similarity",
                    "Document Processing",
                    "Analytics & Weak-Topic Detection"
                ]
            }
            self.wfile.write(json.dumps(res).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length)
        
        try:
            body = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception:
            body = {}

        path = self.path

        if path == "/intent":
            text = body.get("text", "")
            result = classify_intent(text)
            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "data": result}).encode("utf-8"))

        elif path == "/nlp":
            text = body.get("text", "")
            result = analyze_text(text)
            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "data": result}).encode("utf-8"))

        elif path == "/rag/chunk":
            text = body.get("text", "")
            chunk_size = body.get("chunkSize", 1000)
            overlap = body.get("overlap", 150)
            chunks = chunk_document(text, chunk_size, overlap)
            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "chunks": chunks, "count": len(chunks)}).encode("utf-8"))

        elif path == "/rag/similarity":
            query = body.get("query", "")
            chunks = body.get("chunks", [])
            top_k = body.get("topK", 5)
            ranked = rank_chunks(query, chunks, top_k)
            context = build_grounded_context(query, ranked)
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "success": True,
                "ranked": ranked,
                "context": context
            }).encode("utf-8"))

        elif path == "/analytics":
            quiz_results = body.get("quizResults", [])
            result = analyze_quiz_performance(quiz_results)
            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "data": result}).encode("utf-8"))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": f"Path {path} not recognized"}).encode("utf-8"))

    def log_message(self, format, *args):
        # Keep logs clean
        sys.stderr.write(f"[PYTHON AURA ENGINE] {args[0]} - {args[1]}\n")

# Vercel Serverless / Service Handler Exports
handler = AuraEngineHandler
app = AuraEngineHandler

def run_server():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, AuraEngineHandler)
    print(f"========================================")
    print(f"       PROJECT AURA 3.0")
    print(f"    PYTHON AI INTELLIGENCE CORE")
    print(f"========================================")
    print(f"Status: ONLINE on http://0.0.0.0:{PORT}")
    print(f"========================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()
        print("Python AURA Engine stopped.")

if __name__ == "__main__":
    run_server()

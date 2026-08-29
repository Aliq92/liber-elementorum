#!/usr/bin/env python3
"""Tiny local receiver: browser POSTs {name, dataUrl} JSON, we decode and write
the file to disk. Keeps large binary payloads out of the agent's own context
entirely — the browser talks directly to this process."""
import json
import os
import base64
from http.server import BaseHTTPRequestHandler, HTTPServer

OUT_DIR = os.path.join(os.path.dirname(__file__), "out")
os.makedirs(OUT_DIR, exist_ok=True)


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        payload = json.loads(body)
        name = payload["name"]
        data_url = payload["dataUrl"]
        _, b64 = data_url.split(",", 1)
        raw = base64.b64decode(b64)
        target = os.path.join(OUT_DIR, name)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "wb") as f:
            f.write(raw)
        print(f"saved {name}: {len(raw)} bytes")
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(b"ok")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    with HTTPServer(("127.0.0.1", 5180), Handler) as httpd:
        print("receiver listening on 127.0.0.1:5180")
        httpd.serve_forever()

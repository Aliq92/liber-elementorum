#!/usr/bin/env python3
"""
Static server for Arcane Interface.

Plain `python -m http.server` sends Last-Modified and no Cache-Control, so
browsers aggressively cache ES modules and you end up testing stale code after
an edit. This sends no-store and strips conditional-request headers so you
always get the file on disk. Serves the same static files a real deployment
would.

    python serve.py [port]
"""

import http.server
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5173


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_head(self):
        # Drop conditional headers so we never answer with 304 while developing.
        for header in ("If-Modified-Since", "If-None-Match"):
            if header in self.headers:
                del self.headers[header]
        return super().send_head()

    def log_message(self, fmt, *args):
        # keep the dev log to one short line per request
        sys.stderr.write("%s %s\n" % (self.command, self.path))


if __name__ == "__main__":
    # ThreadingHTTPServer, not TCPServer: a single-threaded server stalls on
    # the browser's keep-alive connections and the page never finishes loading.
    with http.server.ThreadingHTTPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"Arcane Interface serving on http://localhost:{PORT}")
        httpd.serve_forever()

#!/usr/bin/env python3
"""Server locale per vedere il sito. Nessuna dipendenza, serve solo Python 3.

    python3 serve.py

Poi apri http://localhost:8137
Ctrl+C per fermarlo.
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8137


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # In sviluppo la cache serve solo a farti vedere la versione vecchia
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    os.chdir(ROOT)
    print('IDROS — http://localhost:%d   (Ctrl+C per fermare)' % PORT)
    try:
        ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        print('\nfermato.')

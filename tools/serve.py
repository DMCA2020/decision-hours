#!/usr/bin/env python3
"""Static server for the site with HTTP Range support (needed to seek inside audio clips).
Usage: python3 tools/serve.py [port]"""
import http.server, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def send_head(self):
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        m = re.match(r'bytes=(\d*)-(\d*)$', rng or '')
        if not m or not os.path.isfile(path):
            return super().send_head()
        size = os.path.getsize(path)
        start = int(m.group(1)) if m.group(1) else max(0, size - int(m.group(2)))
        end = int(m.group(2)) if m.group(1) and m.group(2) else size - 1
        if start >= size:
            self.send_error(416); return None
        end = min(end, size - 1)
        f = open(path, 'rb'); f.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        self._remaining = end - start + 1
        return f

    def copyfile(self, src, dst):
        n = getattr(self, '_remaining', None)
        if n is None:
            return super().copyfile(src, dst)
        while n > 0:
            buf = src.read(min(64 * 1024, n))
            if not buf:
                break
            dst.write(buf); n -= len(buf)
        self._remaining = None


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4720
    http.server.ThreadingHTTPServer(('', port), Handler).serve_forever()

from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import io

class UnityWebGLHandler(SimpleHTTPRequestHandler):

    GZ_TYPES = {
        '.wasm.gz': 'application/wasm',
        '.js.gz':   'application/javascript',
        '.data.gz': 'application/octet-stream',
    }

    def do_GET(self):
        path = self.translate_path(self.path)
        gz_ctype = None
        for ext, ctype in self.GZ_TYPES.items():
            if path.endswith(ext):
                gz_ctype = ctype
                break

        if gz_ctype and os.path.isfile(path):
            try:
                f = open(path, 'rb')
            except OSError:
                self.send_error(404)
                return
            fsize = os.fstat(f.fileno()).st_size
            self.send_response(200)
            self.send_header('Content-Type', gz_ctype)
            self.send_header('Content-Encoding', 'gzip')
            self.send_header('Content-Length', str(fsize))
            self.end_headers()
            try:
                self.copyfile(f, self.wfile)
            finally:
                f.close()
        else:
            super().do_GET()

    def do_HEAD(self):
        path = self.translate_path(self.path)
        gz_ctype = None
        for ext, ctype in self.GZ_TYPES.items():
            if path.endswith(ext):
                gz_ctype = ctype
                break

        if gz_ctype and os.path.isfile(path):
            fsize = os.path.getsize(path)
            self.send_response(200)
            self.send_header('Content-Type', gz_ctype)
            self.send_header('Content-Encoding', 'gzip')
            self.send_header('Content-Length', str(fsize))
            self.end_headers()
        else:
            super().do_HEAD()

    def guess_type(self, path):
        if path.endswith('.wasm'):
            return 'application/wasm'
        return super().guess_type(path)

os.chdir(os.path.dirname(os.path.abspath(__file__)))
print("Serving Unity WebGL at http://localhost:8080")
HTTPServer(('', 8080), UnityWebGLHandler).serve_forever()

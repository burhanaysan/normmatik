# -*- coding: utf-8 -*-
"""
Yerel test sunucusu — uygulamayı gerçek bir tarayıcıda açmak için.

01_uygulama klasörünü statik olarak yayınlar. Hiçbir dosyayı değiştirmez,
sadece okur. Canlı siteyle aynı dosyalar, aynı davranış.

Kullanım:  python -X utf8 tools/sunucu_baslat.py [port]
"""
import os, sys, functools, http.server, socketserver

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # 01_uygulama
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8817


class Sunucu(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Test sırasında önbellek yanıltmasın: her istek taze gelsin.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, bicim, *args):
        # 404'ler önemli (eksik dosya = hata), gerisi gürültü.
        ileti = bicim % args
        if " 404 " in ileti or " 500 " in ileti:
            sys.stderr.write("EKSIK/HATA: %s\n" % ileti)


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(
        ("127.0.0.1", PORT),
        functools.partial(Sunucu, directory=KOK)) as httpd:
    print("Sunucu calisiyor: http://localhost:%d/index.html" % PORT)
    print("Kok klasor: %s" % KOK)
    sys.stdout.flush()
    httpd.serve_forever()

# -*- coding: utf-8 -*-
"""
js/surum.js icindeki surum numarasini ekrana basar. Baska hicbir sey yapmaz.

NEDEN VAR (13.09.2026): yukleme araci (4_Canliya_Yukle.bat) basarili bir
gonderimden sonra o surum icin git etiketi atiyor. Etiketin adini buradan
alir; numara TEK KAYNAKTA (js/surum.js) durur, .bat dosyasina kopyalanmaz.

KULLANIM: python tools/surum_numarasi.py      ->  2.1.0
Bulamazsa hicbir sey basmaz ve 1 ile cikar; .bat bunu gorup etiketi atlar.
"""
import io
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
YOL = os.path.join(KOK, "js", "surum.js")

try:
    metin = io.open(YOL, encoding="utf-8").read()
except Exception:
    sys.exit(1)

m = re.search(r'surum:\s*"(\d+\.\d+\.\d+)"', metin)
if not m:
    sys.exit(1)

sys.stdout.write(m.group(1))

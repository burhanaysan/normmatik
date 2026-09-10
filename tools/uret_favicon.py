# -*- coding: utf-8 -*-
"""NormMatik marka ikonu (mavi kare + beyaz N) uretici.

NEDEN VAR (kullanici istegi, 10.09.2026)
----------------------------------------
Google arama sonucunda site adinin yaninda cikan kucuk logo, kokteki
`favicon.ico` dosyasindan geliyordu -- o da eski "MEB NORM" kitap/kep
gorseliydi. index.html'de bir favicon etiketi vardi ama icerigi `data:` URI
seklinde bir emoji (grafik emojisi) idi; Google data URI favicon'lari
kullanmaz, bu yuzden kok dizindeki .ico dosyasina dusuyordu.

Artik ikon, sitenin USTUNDEKI marka isaretiyle ayni: --mavi zeminde beyaz N.
Boyle bir dosya yoktu, cunku basliktaki isaret CSS ile ciziliyor
(.marka-im: 30px kare, 7px kose yaricapi, var(--mavi), beyaz 800 agirlik).
Bu betik o goruntuyu birebir dosyaya donusturur.

Google'in favicon kurallari (bu yuzden bu boyutlar):
  - kare olmali ve 48'in kati bir boyutta sunulmali
  - .ico / .png / .svg / .gif / .jpg kabul edilir
  - robots.txt ile engellenmemis olmali
  - Google favicon'lari SEYREK yeniden tarar; degisiklik gunler surebilir

Calistirma:  python tools/uret_favicon.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# landing.css --mavi ile birebir ayni. Marka rengi tek yerden gelsin diye
# buraya elle yazildi; degisirse ikisi birlikte degismeli.
MAVI = (11, 92, 171)          # #0b5cab
BEYAZ = (255, 255, 255)
HARF = "N"

# .marka-im: 30px kutuda 7px yaricap -> %23,3. Buyuk boyutlarda ayni oran.
KOSE_ORANI = 7.0 / 30.0

YAZI_TIPI = [
    r"C:\Windows\Fonts\segoeuib.ttf",     # Segoe UI Bold -- sitenin yazi tipi
    r"C:\Windows\Fonts\arialbd.ttf",      # yedek
]


def _yazi_tipi(boy):
    for y in YAZI_TIPI:
        if os.path.exists(y):
            return ImageFont.truetype(y, boy)
    raise SystemExit("Kalin yazi tipi bulunamadi: " + ", ".join(YAZI_TIPI))


def ikon(kenar):
    """Tek bir kare ikon uretir (RGBA)."""
    # 4 kat buyuk cizip kucultuyoruz: kose ve harf kenarlari yumusak ciksin.
    o = 4
    b = kenar * o
    g = Image.new("RGBA", (b, b), (0, 0, 0, 0))
    d = ImageDraw.Draw(g)
    d.rounded_rectangle([0, 0, b - 1, b - 1], int(b * KOSE_ORANI), fill=MAVI + (255,))

    # Harfi GERCEK sinirlarina gore ortala. Yazi tiplerinde ust bosluk
    # (ascender) harften buyuk oldugu icin metin kutusuna gore ortalamak
    # harfi asagi kaydirir; bu yuzden anchor degil, olculen kutu kullanildi.
    f = _yazi_tipi(int(b * 0.62))
    sol, ust, sag, alt = d.textbbox((0, 0), HARF, font=f)
    x = (b - (sag - sol)) / 2 - sol
    y = (b - (alt - ust)) / 2 - ust
    d.text((x, y), HARF, font=f, fill=BEYAZ + (255,))

    return g.resize((kenar, kenar), Image.LANCZOS)


def uret():
    uretilen = []

    # 1) Kok favicon.ico -- GOOGLE BUNU OKUYOR. Cok boyutlu.
    ico_boylari = [16, 32, 48, 64, 128, 256]
    en_buyuk = ikon(256)
    ico_yolu = os.path.join(KOK, "favicon.ico")
    en_buyuk.save(ico_yolu, format="ICO",
                  sizes=[(b, b) for b in ico_boylari])
    uretilen.append(ico_yolu)

    # 2) PNG'ler. 48'in katlari (Google onerisi) + PWA boyutlari.
    for kenar, ad in [(48, "icons/normmatik-48.png"),
                      (96, "icons/normmatik-96.png"),
                      (180, "icons/apple-touch-icon.png"),
                      (192, "icons/normmatik-192.png"),
                      (512, "icons/normmatik-512.png")]:
        yol = os.path.join(KOK, ad.replace("/", os.sep))
        os.makedirs(os.path.dirname(yol), exist_ok=True)
        ikon(kenar).save(yol, format="PNG", optimize=True)
        uretilen.append(yol)

    return uretilen


if __name__ == "__main__":
    for y in uret():
        print("%8d bayt  %s" % (os.path.getsize(y), os.path.relpath(y, KOK)))

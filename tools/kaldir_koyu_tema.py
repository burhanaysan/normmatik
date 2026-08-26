# -*- coding: utf-8 -*-
"""
KOYU TEMAYI KALDIRMA (tek seferlik geçiş betiği)
================================================
Karar (2026-08-26, kullanıcı): uygulama tek temayla, açık temayla devam eder.

GEREKÇE
-------
1. Ürünün çıktısı kâğıt. Yedi raporun hepsi beyaz A4'e basılıyor; koyu
   temada çalışan kullanıcı ekranda gördüğüyle kâğıda çıkanı hiç aynı
   göremiyordu.
2. Her renk kararı iki kez veriliyordu ve ikincisi denetlenmiyordu. Kontrast
   denetimi koyu temada turuncunun 2,91:1'e düştüğünü ölçtü (WCAG 4,5:1
   ister) — kimse fark etmemişti; 168 kural bloğunun hiçbirinin testi yoktu.
3. Sırf "koyu temada yazdırınca kâğıt beyaz olur ama renkler koyu kalır"
   tuzağını kapatmak için ayrı bir yazdırma bloğu gerekmişti. Tek temada
   bu karmaşanın tamamı ortadan kalkıyor.

NE YAPAR
--------
- css/app.css içindeki tüm `[data-theme="dark"]` kural bloklarını siler
- Koyu temaya özgü `--durum-*` değişken bloğunu siler
- Artık gereksiz kalan yazdırma `!important` bloğunu siler

Yedek: css/_yedek_app_koyutema_20260826.css

Çalıştırma (bir kez):
    python -X utf8 tools/kaldir_koyu_tema.py
"""
import io
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(KOK, "css", "app.css")
YEDEK = os.path.join(KOK, "css", "_yedek_app_koyutema_20260826.css")

HEDEF = '[data-theme="dark"]'


def yorum_araliklari(s):
    """/* ... */ aralıklarını döndürür; seçici araması bunların dışında yapılır."""
    return [(m.start(), m.end()) for m in re.finditer(r"/\*.*?\*/", s, re.S)]


def yorumda_mi(i, araliklar):
    return any(a <= i < b for a, b in araliklar)


def blok_sil(s):
    """`[data-theme="dark"]` ile başlayan her kural bloğunu siler."""
    silinen = 0
    while True:
        araliklar = yorum_araliklari(s)
        yer = -1
        for m in re.finditer(re.escape(HEDEF), s):
            if not yorumda_mi(m.start(), araliklar):
                yer = m.start()
                break
        if yer < 0:
            break

        # Seçicinin başı: önceki '}' ya da '*/' ya da dosya başı
        bas = 0
        for isaret in ("}", "*/", ";"):
            p = s.rfind(isaret, 0, yer)
            if p > bas:
                bas = p + len(isaret)

        # Bloğun sonu: eşleşen kapanış parantezi
        ac = s.find("{", yer)
        if ac < 0:
            break
        derinlik, i = 1, ac + 1
        while i < len(s) and derinlik > 0:
            if s[i] == "{":
                derinlik += 1
            elif s[i] == "}":
                derinlik -= 1
            i += 1

        s = s[:bas] + s[i:]
        silinen += 1

    return s, silinen


def main():
    if not os.path.exists(YEDEK):
        print("!! Yedek yok: %s" % YEDEK)
        print("   Önce yedek alın, sonra çalıştırın.")
        return 2

    s = io.open(CSS, encoding="utf-8").read()
    onceki_satir = s.count("\n")
    onceki_kural = s.count(HEDEF)

    # 1) Koyu temaya özgü değişken bloğu (kendi eklediğimiz) da dahil,
    #    tüm [data-theme="dark"] kuralları
    s, silinen = blok_sil(s)

    # 2) Artık gereksiz: yazdırmada açık paleti zorlayan blok.
    #    Tek tema kaldığı için değişkenler zaten hep açık tema değeri.
    gereksiz = re.search(
        r"\n\s*/\* KOYU TEMADA YAZDIRMA TUZAĞI.*?\*/\s*"
        r":root,\s*\n?\s*\{[^}]*\}", s, re.S)
    if gereksiz:
        s = s[:gereksiz.start()] + s[gereksiz.end():]
        print("   + gereksiz yazdırma bloğu silindi")
    else:
        # blok_sil, seçici listesindeki [data-theme="dark"] kısmını çıkarmış
        # olabilir; kalan ":root { --durum-*: ... !important }" da gereksiz.
        kalan = re.search(
            r"\n\s*/\* KOYU TEMADA YAZDIRMA TUZAĞI.*?\*/", s, re.S)
        if kalan:
            s = s[:kalan.start()] + s[kalan.end():]
            print("   + gereksiz yazdırma yorumu silindi")

    # 3) Fazla boş satırları toparla
    s = re.sub(r"\n{4,}", "\n\n\n", s)

    io.open(CSS, "w", encoding="utf-8", newline="\n").write(s)

    kalan_kural = s.count(HEDEF)
    print("KOYU TEMA KALDIRILDI")
    print("  silinen kural bloğu : %d" % silinen)
    print("  satır               : %d -> %d  (%d satır eksildi)"
          % (onceki_satir, s.count("\n"), onceki_satir - s.count("\n")))
    print("  kalan [data-theme=\"dark\"] geçişi: %d %s"
          % (kalan_kural, "(yalnızca yorum içinde)" if kalan_kural else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())

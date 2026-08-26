# -*- coding: utf-8 -*-
"""
RENK DENETİMİ — ayırt edilebilirlik ve kontrast  (Cephe 4)
==========================================================
NormMatik'te norm durumu üç renkle gösteriliyor:

    Tam      yeşil    #15803d
    Fazla    turuncu  #c2410c
    İhtiyaç  kırmızı  #dc2626

(2026-08-26: koyu tema kaldırıldı, palet tek temaya indirildi ve
 kontrast ölçülerek düzeltildi.)

Kullanıcı kitlesi okul idarecileri. Kırmızı-yeşil renk körlüğü erkeklerde
yaklaşık %8 görülür — yani her 12-13 erkek idareciden biri bu ayrımı
göremiyor olabilir. Renk körü bir müdür bu tabloyu okuyabiliyor mu?

Bu betik iki şeyi ÖLÇER:

  1. AYIRT EDİLEBİLİRLİK — renkler protanopi / döteranopi / tritanopi
     benzetiminden geçirilir, sonra ikili renk farkları (CIE76 ΔE*ab)
     hesaplanır. ΔE < 10 ise iki renk pratikte aynı görünür.

  2. KONTRAST — her rengin zemine karşı WCAG kontrast oranı. Normal metin
     için 4,5:1, iri metin için 3:1 gerekir.

Çalıştırma:
    python -X utf8 tools/denetim_renk.py
"""
import sys

# ---------------------------------------------------------------------
# Uygulamada kullanılan durum renkleri (css/app.css + js/uiComponents.js)
# ---------------------------------------------------------------------
DURUM_RENKLERI = {
    "Tam (yeşil)":       "#15803d",
    "Fazla (turuncu)":   "#c2410c",
    "İhtiyaç (kırmızı)": "#dc2626",
}

# Metnin üzerine bindiği zeminler
ZEMINLER = {
    "beyaz kâğıt":      "#ffffff",
    "açık tema kartı":  "#f8fafc",
}


def coz(hx):
    hx = hx.lstrip("#")
    return tuple(int(hx[i:i + 2], 16) for i in (0, 2, 4))


def dogrusal(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def parlaklik(rgb):
    r, g, b = (dogrusal(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def kontrast(rgb1, rgb2):
    l1, l2 = parlaklik(rgb1), parlaklik(rgb2)
    if l1 < l2:
        l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)


# ---------------------------------------------------------------------
# Renk körlüğü benzetimi (Brettel/Viénot yaklaşımı, LMS uzayında)
# ---------------------------------------------------------------------
def _rgb2lms(rgb):
    r, g, b = (dogrusal(x) for x in rgb)
    return (17.8824 * r + 43.5161 * g + 4.11935 * b,
            3.45565 * r + 27.1554 * g + 3.86714 * b,
            0.0299566 * r + 0.184309 * g + 1.46709 * b)


def _lms2rgb(lms):
    l, m, s = lms
    r = 0.0809444479 * l - 0.130504409 * m + 0.116721066 * s
    g = -0.0102485335 * l + 0.0540193266 * m - 0.113614708 * s
    b = -0.000365296938 * l - 0.00412161469 * m + 0.693511405 * s

    def geri(c):
        c = max(0.0, min(1.0, c))
        c = 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055
        return int(round(max(0.0, min(1.0, c)) * 255))

    return (geri(r), geri(g), geri(b))


def renk_koru(rgb, tur):
    l, m, s = _rgb2lms(rgb)
    if tur == "protanopi":       # L konisi yok (kırmızı algısı)
        l = 2.02344 * m - 2.52581 * s
    elif tur == "doteranopi":    # M konisi yok (yeşil algısı)
        m = 0.494207 * l + 1.24827 * s
    elif tur == "tritanopi":     # S konisi yok (mavi algısı)
        s = -0.395913 * l + 0.801109 * m
    return _lms2rgb((l, m, s))


# ---------------------------------------------------------------------
# CIE76 ΔE*ab — iki rengin algısal farkı
# ---------------------------------------------------------------------
def _lab(rgb):
    r, g, b = (dogrusal(x) for x in rgb)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 1.00000
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883

    def f(t):
        return t ** (1 / 3) if t > 0.008856 else (7.787 * t + 16 / 116)

    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def delta_e(rgb1, rgb2):
    l1, a1, b1 = _lab(rgb1)
    l2, a2, b2 = _lab(rgb2)
    return ((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2) ** 0.5


# ---------------------------------------------------------------------
def main():
    sorun = []
    print("RENK DENETİMİ")
    print("=" * 76)

    # -----------------------------------------------------------------
    print("\n1. AYIRT EDİLEBİLİRLİK (ΔE*ab · 10'un altı = pratikte aynı renk)")
    print("-" * 76)

    adlar = list(DURUM_RENKLERI)
    for tur in ["normal görme", "protanopi", "doteranopi", "tritanopi"]:
        print("\n   %s" % tur.upper())
        goruntu = {}
        for ad, hx in DURUM_RENKLERI.items():
            rgb = coz(hx)
            goruntu[ad] = rgb if tur == "normal görme" else renk_koru(rgb, tur)

        for i in range(len(adlar)):
            for j in range(i + 1, len(adlar)):
                a, b = adlar[i], adlar[j]
                # İki "Fazla" tonunu birbiriyle kıyaslamak anlamsız.
                if "Fazla" in a and "Fazla" in b:
                    continue
                d = delta_e(goruntu[a], goruntu[b])
                if d < 10:
                    isaret, not_ = "!!", "AYIRT EDİLEMİYOR"
                elif d < 20:
                    isaret, not_ = " ?", "zayıf"
                else:
                    isaret, not_ = "  ", "ayırt ediliyor"
                print("     %s %-18s vs %-18s ΔE=%5.1f  %s"
                      % (isaret, a, b, d, not_))
                if d < 10 and tur != "normal görme":
                    sorun.append("%s: '%s' ile '%s' ayırt edilemiyor (ΔE=%.1f)"
                                 % (tur, a, b, d))

    # -----------------------------------------------------------------
    print("\n\n2. KONTRAST (WCAG · normal metin 4,5:1 · iri metin 3:1)")
    print("-" * 76)
    for zad, zhx in ZEMINLER.items():
        print("\n   Zemin: %s (%s)" % (zad, zhx))
        for ad, hx in DURUM_RENKLERI.items():
            k = kontrast(coz(hx), coz(zhx))
            if k >= 4.5:
                isaret, not_ = "  ", "AA geçer"
            elif k >= 3.0:
                isaret, not_ = " ?", "yalnız iri metinde geçer"
            else:
                isaret, not_ = "!!", "GEÇMEZ"
            print("     %s %-18s %s  %5.2f:1  %s" % (isaret, ad, hx, k, not_))
            if k < 3.0:
                sorun.append("%s zemininde '%s' kontrastı %.2f:1 (en az 3:1 gerekir)"
                             % (zad, ad, k))

    # -----------------------------------------------------------------
    print("\n\n3. ÖNERİLEN RENKLER (aynı ton ailesi, yeterli kontrast)")
    print("-" * 76)
    print("   Ton korunur, yalnızca AÇIKLIK değiştirilir; böylece yeşil yeşil,")
    print("   kırmızı kırmızı kalır ama metin okunur hale gelir.")

    import colorsys

    def ton_koruyarak_bul(hx, zemin_hx, hedef=4.5):
        """Aynı ton ve doygunlukta, zemine karşı hedef kontrastı sağlayan
        en yakın açıklığı bulur."""
        r, g, b = (x / 255 for x in coz(hx))
        h, l0, s = colorsys.rgb_to_hls(r, g, b)
        zemin = coz(zemin_hx)
        adaylar = []
        for i in range(0, 1001):
            l = i / 1000
            rr, gg, bb = colorsys.hls_to_rgb(h, l, s)
            aday = (int(round(rr * 255)), int(round(gg * 255)), int(round(bb * 255)))
            if kontrast(aday, zemin) >= hedef:
                adaylar.append((abs(l - l0), aday, kontrast(aday, zemin)))
        if not adaylar:
            return None
        adaylar.sort()
        _, rgb, k = adaylar[0]
        return "#%02x%02x%02x" % rgb, k

    for zad, zhx in [("açık tema / kâğıt", "#ffffff"), ("uygulama kartı", "#f8fafc")]:
        print("\n   %s (%s)" % (zad, zhx))
        for ad, hx in DURUM_RENKLERI.items():
            simdi = kontrast(coz(hx), coz(zhx))
            if simdi >= 4.5:
                print("     [OK]  %-18s %s  %.2f:1 — değişiklik gerekmiyor" % (ad, hx, simdi))
                continue
            sonuc = ton_koruyarak_bul(hx, zhx)
            if sonuc:
                yeni, k = sonuc
                print("     ->    %-18s %s (%.2f:1)  ==>  %s (%.2f:1)"
                      % (ad, hx, simdi, yeni, k))
            else:
                print("     !!    %-18s %s — bu tonda 4,5:1 sağlanamıyor" % (ad, hx))

    print("\n   NOT: Ton (kırmızı/turuncu/yeşil) DEĞİŞTİRİLMEDİ. Döteranopide")
    print("   turuncu ile kırmızının ayrışmaması ton değişikliği gerektirir; ancak")
    print("   uygulamada renk hiçbir zaman TEK BAŞINA bilgi taşımıyor — yanında")
    print("   her zaman 'Tam' / 'N Fazla' / 'N İhtiyaç' yazısı var. Bu yüzden ton")
    print("   değiştirmek, normal gören %92 için tanıdık düzeni bozmaya değmez.")

    # -----------------------------------------------------------------
    print("\n" + "=" * 76)
    if not sorun:
        print("SONUC: renk ayrimi ve kontrast yeterli.")
        kod = 0
    else:
        print("BULGULAR (%d):" % len(sorun))
        for s in sorun:
            print("   • " + s)
        kod = 1
    print("=" * 76)
    return kod


if __name__ == "__main__":
    sys.exit(main())

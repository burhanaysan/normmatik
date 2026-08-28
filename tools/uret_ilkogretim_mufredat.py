# -*- coding: utf-8 -*-
"""
İLKÖĞRETİM (İLKOKUL + ORTAOKUL) ÇİZELGE ÇÖZÜMLEYİCİSİ
=====================================================

NEDEN VAR
---------
Uygulamadaki İLKOKUL_CURRICULUM ve ORTAOKUL_CURRICULUM da elle yazılmıştı ve
karşılaştırılacak resmî bir kaynak dosyası HİÇ üretilmemişti. Sebebi, bu PDF'in
çapraz filigran taşıması ve filigranın rakamlarının başlık hücresine karışıp
7. sınıf sütununu bozmasıydı.

Çözüm: metin parçalarının yön (dir) bilgisine bakmak. Filigran eğik yazılır;
eksene paralel olmayan her satır atılır. Sayfadaki dik (90°) yazılmış satır
başlıkları meşrudur, onlar korunur.

Çıktı, çizelgenin KENDİ toplam satırlarıyla doğrulanır. Tutmazsa üretim durur.

KAYNAK
    03_meb_mevzuat_ve_cizelgeler/ttkb_haftalik_ders_cizelgeleri/01_ilkogretim/
    2025-05-16__...__4nolukarar...pdf   (TTKB Sayı 04, 09/05/2025)

ÇALIŞTIRMA
    python -X utf8 tools/uret_ilkogretim_mufredat.py
    python -X utf8 tools/uret_ilkogretim_mufredat.py --yaz
"""
import argparse
import json
import os
import re
import sys

import fitz

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJE = os.path.dirname(KOK)

PDF = os.path.join(
    PROJE, "03_meb_mevzuat_ve_cizelgeler", "ttkb_haftalik_ders_cizelgeleri",
    "01_ilkogretim",
    "2025-05-16__ilkogretim-kurumlari-ilkokul-ve-ortaokul-haftalik-ders-cizel"
    "__16094742_4nolukararilkogretimkurumlariilkokulveortaokulhaftalikderscizelgesi.pdf")
CIKTI = os.path.join(KOK, "data", "kaynak_cizelgeler", "temel_egitim",
                     "ilkogretim_ilkokul_ortaokul.json")

SINIFLAR = ["1", "2", "3", "4", "5", "6", "7", "8"]

# Çizelgenin kendi toplam satırı. Üretilen veri buna uymak zorunda.
BEKLENEN_ZORUNLU = [26, 28, 28, 30, 30, 30, 30, 29]


def cizelge_oku():
    sayfa = fitz.open(PDF)[1]
    parcalar = []
    egik = 0
    for blok in sayfa.get_text("dict")["blocks"]:
        for l in blok.get("lines", []):
            dx, dy = l.get("dir", (1, 0))
            yatay = abs(dx) > .99 and abs(dy) < .01
            dik = abs(dy) > .99 and abs(dx) < .01
            if not (yatay or dik):
                egik += 1                      # FİLİGRAN — atılır
                continue
            for sp in l["spans"]:
                m = sp["text"].strip()
                if m:
                    x0, y0, x1, y1 = sp["bbox"]
                    parcalar.append((x0, y0, x1, y1, m, dik))

    # Sınıf başlıkları: 1..8, en üstteki satırda
    adaylar = [p for p in parcalar if re.fullmatch(r"[1-8]", p[4]) and not p[5]]
    adaylar.sort(key=lambda p: p[1])
    ust_y = adaylar[0][1]
    baslik = sorted([p for p in adaylar if abs(p[1] - ust_y) < 6],
                    key=lambda p: p[0])
    if len(baslik) != 8 or [p[4] for p in baslik] != SINIFLAR:
        raise SystemExit("!! sınıf başlığı satırı bulunamadı: %s"
                         % [p[4] for p in baslik])
    sutun = [round((p[0] + p[2]) / 2) for p in baslik]
    genislik = min(sutun[i + 1] - sutun[i] for i in range(7))

    def hangi_sutun(x0, x1):
        xm = (x0 + x1) / 2
        for i, s in enumerate(sutun):
            if abs(xm - s) < genislik * .45:
                return i
        return None

    satirlar = []
    for p in sorted(parcalar, key=lambda p: (p[1], p[0])):
        ym = (p[1] + p[3]) / 2
        for s in satirlar:
            if abs(s["y"] - ym) < 5:
                s["p"].append(p)
                break
        else:
            satirlar.append({"y": ym, "p": [p]})

    sol_sinir = sutun[0] - genislik * .5

    # Seçmeli bölümde SOLDA İKİ SÜTUN vardır: grup adı ("Kültür, Sanat ve
    # Spor") x=86'dan, ders adı x=163'ten başlar. Ayrılmazsa grup adı ders
    # adına yapışır ve "Spor Dijital Sanatlar" gibi olmayan bir ders doğar.
    # Zorunlu bölümde grup sütunu yoktur; ders adı orada da x=86'dadır.
    DERS_SUTUNU_X = 150

    # Grup adı sütunundaki BÜTÜN metin parçaları (saatsiz oldukları için
    # satır olarak çıkmazlar; ayrıca toplanmaları gerekir).
    sol_parcalar = []

    cikti = []
    for s in satirlar:
        if s["y"] <= ust_y + 4:
            continue                            # başlık satırının kendisi
        sol, sag, saat = [], [], [None] * 8
        for p in sorted(s["p"], key=lambda p: p[0]):
            x0, y0, x1, y1, m, dik = p
            c = hangi_sutun(x0, x1)
            if c is not None:
                if re.fullmatch(r"\d+", m):
                    saat[c] = int(m)
                elif re.fullmatch(r"(\(\d+\))+", m):
                    # SEÇENEKLİ SAAT: "(1)(2)" = 1 veya 2 saat.
                    #
                    # Bu biçim 28.08.2026'ya kadar hiç tanınmıyordu; hücre
                    # görmezden geliniyor, satırda tek saat kalmazsa SATIRIN
                    # TAMAMI sessizce düşüyordu. Ölçüldü: 5 seçmeli ders
                    # (Proje Tasarımı ve Uygulamaları, Afet Bilinci, Oyun ve
                    # Oyun Etkinlikleri, Dijital Sanatlar, Geleneksel
                    # Sanatlar) hiç üretilmiyor, 7 dersin de saatleri eksik
                    # çıkıyordu. Zorunlu dersler etkilenmiyordu; hepsi düz
                    # rakam yazılmış.
                    saat[c] = [int(x) for x in re.findall(r"\d+", m)]
            elif x0 < sol_sinir and not dik:
                if x0 >= DERS_SUTUNU_X:
                    sag.append(m)
                else:
                    sol.append(m)
                    sol_parcalar.append((s["y"], m))
        temizle = lambda parts: re.sub(r"\s+", " ", " ".join(parts)).strip()
        ad = temizle(sag) or temizle(sol)
        if ad and any(x is not None for x in saat):
            cikti.append((s["y"], ad, saat))

    return cikti, sol_parcalar, egik


def secmeli_gruplarini_coz(satirlar, sol_parcalar):
    """
    Seçmeli derslerin hangi ders grubuna ait olduğunu bulur.

    NEDEN GEOMETRİ: Grup adı ("Kültür, Sanat ve Spor") birleştirilmiş bir
    hücrede yazılıdır ve kendi satırı yoktur — saati olmadığı için ders
    satırı olarak da çıkmaz. Hangi dersin hangi gruba ait olduğu PDF'te
    yalnızca KONUMDAN bellidir.

    YÖNTEM: Birleştirilmiş hücrenin metni dikey olarak ORTALANIR. Bu yüzden
    bir grubun etiket y'si, o gruptaki derslerin ortalama y'sine eşit olmalı.
    Ders listesi üç bitişik bloğa bölünür ve blok ortalamaları etiketlere en
    çok uyan bölünme seçilir.

    KESİNLİK: Bu çizelgede en iyi bölünmenin sapması 0,49 punto, ikincininki
    12,35 punto — 25 kat fark. Karar tereddütsüz. Sapma büyürse üretim durur;
    yanlış grup atamak, "her gruptan en az bir ders" kuralını uygulayan bir
    müdürü yanıltır.
    """
    if not satirlar:
        return {}

    def y_bul(anahtar):
        for y, ad, _ in satirlar:
            if anahtar in ad.upper():
                return y
        return None

    bas = y_bul("ZORUNLU DERS SAATİ TOPLAMI")
    son = y_bul("SEÇMELİ DERS SAATİ TOPLAMI")
    if bas is None or son is None:
        raise SystemExit("!! seçmeli bölgenin sınırları bulunamadı")

    dersler = [(y, ad) for y, ad, _ in satirlar if bas < y < son]
    if not dersler:
        raise SystemExit("!! seçmeli bölgede ders bulunamadı")

    # Grup etiketleri: ardışık satırlar tek etiketin parçalarıdır
    # ("Kültür, Sanat ve" + "Spor").
    parcalar = sorted(p for p in sol_parcalar if bas < p[0] < son)
    etiketler = []
    for y, m in parcalar:
        if etiketler and y - etiketler[-1][-1][0] < 16:
            etiketler[-1].append((y, m))
        else:
            etiketler.append([(y, m)])
    gruplar = [(sum(y for y, _ in g) / len(g),
                re.sub(r"\s+", " ", " ".join(m for _, m in g)).strip())
               for g in etiketler]
    if len(gruplar) != 3:
        raise SystemExit("!! 3 seçmeli ders grubu bekleniyordu, %d bulundu: %s"
                         % (len(gruplar), [g[1] for g in gruplar]))

    ys = [y for y, _ in dersler]
    n = len(ys)
    sonuclar = []
    for i in range(1, n - 1):
        for j in range(i + 1, n):
            bloklar = [ys[:i], ys[i:j], ys[j:]]
            sapma = sum(abs(sum(b) / len(b) - gruplar[k][0])
                        for k, b in enumerate(bloklar))
            sonuclar.append((sapma, i, j))
    sonuclar.sort()
    en_iyi, ikinci = sonuclar[0], sonuclar[1]
    if en_iyi[0] > 3.0 or ikinci[0] < en_iyi[0] * 3:
        raise SystemExit(
            "!! grup bölünmesi kesin değil (en iyi %.2f, ikinci %.2f punto). "
            "Yanlış grup atamaktansa duruyorum." % (en_iyi[0], ikinci[0]))

    _, i, j = en_iyi
    atama = {}
    for k, (a, b) in enumerate([(0, i), (i, j), (j, n)]):
        for _, ad in dersler[a:b]:
            atama[ad] = gruplar[k][1]
    return atama


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true")
    arg = ap.parse_args()

    satirlar, sol_parcalar, egik = cizelge_oku()
    grup_atamasi = secmeli_gruplarini_coz(satirlar, sol_parcalar)

    print("İLKÖĞRETİM ÇİZELGESİ — TTKB Sayı 04, 09/05/2025")
    print("=" * 78)
    print("atılan eğik (filigran) satır: %d" % egik)
    print()
    print("%-42s %s" % ("DERS", "  ".join(s.rjust(2) for s in SINIFLAR)))
    print("-" * 78)

    def hucre_yaz(x):
        if x is None:
            return " -"
        if isinstance(x, list):
            return "/".join(str(k) for k in x)
        return str(x)

    zorunlu, secmeli, toplam_satiri = [], [], None
    # bolge: 0 = zorunlu, 1 = seçmeli, 2 = seçmeliden sonrası
    # Eskiden tek bir "seçmeli bölge" bayrağı vardı ve seçmeli tablosu bittikten
    # sonraki satırlar da seçmeli sayılıyordu: "SERBEST ETKİNLİKLER DERS SAATİ"
    # bir ders gibi listeye giriyordu.
    bolge = 0
    for y, ad, saat in satirlar:
        AD = ad.upper()
        print("%-42s %s" % (ad[:42], "  ".join(
            hucre_yaz(x).rjust(4) for x in saat)))
        if "TOPLAM" in AD or "SAYISI" in AD or "SEÇİLECEK" in AD:
            if "ZORUNLU" in AD:
                bolge = 1
            elif "SEÇMELİ" in AD:
                if toplam_satiri is None:
                    toplam_satiri = saat
                bolge = 2
            continue
        if bolge == 2:
            continue                            # seçmeli tablosundan sonrası
        if bolge == 0:
            # Zorunlu bölümde seçenekli saat beklenmiyor; çıkarsa sessizce
            # yanlış toplam üretmektense durmalı.
            if any(isinstance(x, list) for x in saat):
                raise SystemExit(
                    "!! zorunlu derste seçenekli saat: %s" % ad)
            zorunlu.append({"ders_adi": ad,
                            "saatler": {SINIFLAR[i]: {"saat": saat[i]}
                                        for i in range(8) if saat[i]}})
            continue

        # --- SEÇMELİ BÖLÜM ---
        grup = grup_atamasi.get(ad, "")
        if not grup:
            raise SystemExit("!! seçmeli dersin grubu çözülemedi: %s" % ad)
        # Ders adının sonundaki "(4)" kaç kez seçilebileceğini gösterir.
        kac_kez = 1
        m = re.search(r"\((\d+)\)\s*$", ad)
        if m:
            kac_kez = int(m.group(1))
            ad = ad[:m.start()].strip()
        saatler = {}
        for i in range(8):
            v = saat[i]
            if v is None:
                continue
            saatler[SINIFLAR[i]] = ({"tip": "secenekli", "secenekler": v}
                                    if isinstance(v, list)
                                    else {"tip": "sabit", "saat": v})
        if saatler:
            secmeli.append({"ders_adi": ad, "grup": grup,
                            "kac_kez_secilebilir": kac_kez,
                            "saatler": saatler})

    print("-" * 78)
    uretilen = [sum(d["saatler"].get(s, {}).get("saat", 0) for d in zorunlu)
                for s in SINIFLAR]
    print("%-42s %s" % ("ÜRETİLEN ZORUNLU TOPLAM",
                        "  ".join(str(x).rjust(2) for x in uretilen)))
    print("%-42s %s" % ("ÇİZELGENİN KENDİ TOPLAMI",
                        "  ".join(str(x).rjust(2) for x in BEKLENEN_ZORUNLU)))

    tamam = uretilen == BEKLENEN_ZORUNLU
    print()
    print("DOĞRULAMA: %s" % ("✓ TUTUYOR" if tamam else "✗ TUTMUYOR — üretim geçersiz"))

    if arg.yaz:
        if not tamam:
            print("Doğrulama tutmadığı için YAZILMADI.")
            return 1
        os.makedirs(os.path.dirname(CIKTI), exist_ok=True)
        with open(CIKTI, "w", encoding="utf-8") as f:
            json.dump({
                "belge_adi": "İlköğretim Kurumları (İlkokul ve Ortaokul) "
                             "Haftalık Ders Çizelgesi",
                "karar": "TTKB Sayı 04, 09/05/2025",
                "yururluk": "2025-2026 eğitim ve öğretim yılından itibaren",
                "kaynak_pdf": os.path.basename(PDF),
                "uretim_notu": "ELLE DÜZENLEMEYİN. "
                               "tools/uret_ilkogretim_mufredat.py üretir.",
                "ana_cizelge": {"zorunlu_dersler": zorunlu},
                "secmeli_dersler": secmeli,
                "cizelge_zorunlu_toplami": dict(zip(SINIFLAR, BEKLENEN_ZORUNLU)),
            }, f, ensure_ascii=False, indent=1)
        print("yazıldı: %s" % CIKTI)

    print("=" * 78)
    return 0 if tamam else 1


if __name__ == "__main__":
    sys.exit(main())

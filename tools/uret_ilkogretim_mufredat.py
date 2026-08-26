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
    cikti = []
    for s in satirlar:
        if s["y"] <= ust_y + 4:
            continue                            # başlık satırının kendisi
        etiket, saat = [], [None] * 8
        for p in sorted(s["p"], key=lambda p: p[0]):
            x0, y0, x1, y1, m, dik = p
            c = hangi_sutun(x0, x1)
            if c is not None and re.fullmatch(r"\d+", m):
                saat[c] = int(m)
            elif x0 < sol_sinir and not dik:
                etiket.append(m)
        ad = re.sub(r"\s+", " ", " ".join(etiket)).strip()
        if ad and any(x is not None for x in saat):
            cikti.append((ad, saat))
    return cikti, egik


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true")
    arg = ap.parse_args()

    satirlar, egik = cizelge_oku()

    print("İLKÖĞRETİM ÇİZELGESİ — TTKB Sayı 04, 09/05/2025")
    print("=" * 78)
    print("atılan eğik (filigran) satır: %d" % egik)
    print()
    print("%-42s %s" % ("DERS", "  ".join(s.rjust(2) for s in SINIFLAR)))
    print("-" * 78)

    zorunlu, toplam_satiri, secmeli_bolge = [], None, False
    for ad, saat in satirlar:
        AD = ad.upper()
        yazi = "%-42s %s" % (ad[:42], "  ".join(
            (str(x) if x is not None else " -").rjust(2) for x in saat))
        print(yazi)
        if "TOPLAM" in AD or "SAYISI" in AD or "SEÇİLECEK" in AD:
            if toplam_satiri is None and "ZORUNLU" not in AD:
                toplam_satiri = saat
            secmeli_bolge = True
            continue
        if not secmeli_bolge:
            zorunlu.append({"ders_adi": ad,
                            "saatler": {SINIFLAR[i]: {"saat": saat[i]}
                                        for i in range(8) if saat[i]}})

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
                "cizelge_zorunlu_toplami": dict(zip(SINIFLAR, BEKLENEN_ZORUNLU)),
            }, f, ensure_ascii=False, indent=1)
        print("yazıldı: %s" % CIKTI)

    print("=" * 78)
    return 0 if tamam else 1


if __name__ == "__main__":
    sys.exit(main())

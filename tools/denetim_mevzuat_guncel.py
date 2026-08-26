# -*- coding: utf-8 -*-
"""
MEVZUAT GÜNCELLİK VE ÖZDEŞLİK DENETİMİ
======================================
Uygulamanın kural motoru, `data/kaynak_cizelgeler/mevzuat/
norm_kadro_yonetmeligi.json` dosyasına dayanır. Bu JSON, bir PDF'ten
çıkarılmıştır. Soru şu: **o çıkarım hâlâ resmî metinle birebir mi?**

Bu betik, mevzuat.gov.tr'den indirilen güncel PDF ile elimizdeki JSON'u
madde madde karşılaştırır. İki şeye bakar:

  1. Değişiklik tablosu — resmî metin bizimkinden daha yeni mi?
  2. Madde metinleri — JSON'daki her fıkra, PDF'te birebir geçiyor mu?

PDF satır sonlarında tireleme yapar ("yönet-\nmelik"); karşılaştırmadan
önce bu birleştirilir, yoksa her madde farklı görünür.

Çalıştırma:
    python -X utf8 tools/denetim_mevzuat_guncel.py
"""
import json
import os
import re
import sys

import fitz

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEVZUAT = os.path.join(KOK, "data", "kaynak_cizelgeler", "mevzuat")

JSON_YOL = os.path.join(MEVZUAT, "norm_kadro_yonetmeligi.json")
PDF_ADAYLARI = [
    "norm_kadro_yonetmeligi_GUNCEL.pdf.pdf",
    "norm_kadro_yonetmeligi_GUNCEL.pdf",
]


def pdf_bul():
    for ad in PDF_ADAYLARI:
        y = os.path.join(MEVZUAT, ad)
        if os.path.exists(y):
            return y
    for ad in os.listdir(MEVZUAT):
        if ad.lower().endswith(".pdf") and "norm" in ad.lower():
            return os.path.join(MEVZUAT, ad)
    return None


def sadelestir(s):
    """Karşılaştırma için metni tekilleştir.

    - PDF'in satır sonu tirelemesini birleştirir ("yönet-\nmelik" -> "yönetmelik")
    - Tüm boşlukları kaldırır
    - Tırnak, kesme ve tire çeşitlerini tek biçime indirger
    """
    s = re.sub(r"-\s*\n\s*", "", s)          # satır sonu tirelemesi
    s = s.replace("’", "'").replace("‘", "'")
    s = s.replace("“", '"').replace("”", '"')
    s = s.replace("–", "-").replace("—", "-").replace("‐", "-")
    s = s.replace("\xa0", " ")
    return re.sub(r"\s+", "", s)


def fikra_metinleri(madde):
    """Bir maddedeki tüm metin parçalarını (fıkra + bent) düz listeye çevirir."""
    parcalar = []
    for f in (madde.get("fikralar") or []):
        if f.get("metin"):
            parcalar.append(("fıkra %s" % f.get("no", "?"), f["metin"]))
        for b in (f.get("bentler") or []):
            m = b.get("metin") if isinstance(b, dict) else str(b)
            if m:
                parcalar.append(("fıkra %s bent %s" % (f.get("no", "?"),
                                                       (b.get("harf") or b.get("no") or "?")
                                                       if isinstance(b, dict) else "?"), m))
        if f.get("bentler_kapanis"):
            parcalar.append(("fıkra %s kapanış" % f.get("no", "?"), f["bentler_kapanis"]))
    return parcalar


def main():
    pdf_yol = pdf_bul()
    if not pdf_yol:
        print("!! Güncel PDF bulunamadı. Beklenen konum:")
        print("   %s" % os.path.join(MEVZUAT, PDF_ADAYLARI[0]))
        return 2

    print("MEVZUAT GÜNCELLİK VE ÖZDEŞLİK DENETİMİ")
    print("=" * 74)
    print("Resmî metin : %s" % os.path.basename(pdf_yol))
    print("Bizim nüsha : %s" % os.path.basename(JSON_YOL))
    print()

    belge = fitz.open(pdf_yol)
    ham = "\n".join(s.get_text() for s in belge)
    pdf_sade = sadelestir(ham)

    with open(JSON_YOL, encoding="utf-8") as f:
        veri = json.load(f)

    # ---------------------------------------------------------------
    # 1. Değişiklik tablosu
    # ---------------------------------------------------------------
    print("1. DEĞİŞİKLİK TABLOSU")
    print("-" * 74)
    # Yıllar YALNIZCA değişiklik tablosundan alınır. Belgenin başındaki
    # "Dayandığı KHK'nin Tarihi: 25/8/2011" bir değişiklik değildir; tüm
    # metinden tarih toplanınca 2011 sahte bir "yeni değişiklik" gibi görünür.
    j = ham.find("EK VE DEĞİŞİKLİK GETİREN")
    tablo = ham[j:] if j > 0 else ham
    yillar_pdf = sorted(set(re.findall(r"\d{1,2}/\d{1,2}/(20\d\d)", tablo)))
    yillar_biz = sorted(set(re.findall(r"\d{1,2}/\d{1,2}/(20\d\d)",
                                       json.dumps(veri, ensure_ascii=False))))
    print("   resmî metindeki değişiklik yılları : %s" % ", ".join(yillar_pdf))
    print("   bizim nüshadaki yıllar             : %s" % ", ".join(yillar_biz))
    son = re.findall(r"(\d{1,2}/\d{1,2}/20\d\d)", tablo)
    if son:
        print("   resmî tablodaki EN SON değişiklik   : %s" % son[-1])

    yeni = [y for y in yillar_pdf if y not in yillar_biz]
    if yeni:
        print("   !! RESMÎ METİNDE BİZDE OLMAYAN YIL(LAR): %s" % ", ".join(yeni))
    else:
        print("   [OK] resmî metinde bizde olmayan değişiklik yılı yok")
    print()

    # ---------------------------------------------------------------
    # 2. Madde metinleri birebir mi?
    # ---------------------------------------------------------------
    print("2. MADDE METİNLERİ (JSON -> resmî PDF içinde birebir geçiyor mu?)")
    print("-" * 74)

    toplam = 0
    tutmayan = []
    for madde in veri.get("maddeler", []):
        no = madde.get("madde_no", "?")
        baslik = madde.get("baslik", "")
        for etiket, metin in fikra_metinleri(madde):
            toplam += 1
            if sadelestir(metin) not in pdf_sade:
                tutmayan.append((no, baslik, etiket, metin))

    for no, baslik, etiket, metin in tutmayan:
        print("   !! Madde %s (%s) %s" % (no, baslik[:44], etiket))
        print("      bizde: %s..." % re.sub(r"\s+", " ", metin)[:110])

    print()
    print("   %d metin parçası denendi, %d tanesi resmî metinde bulunamadı"
          % (toplam, len(tutmayan)))
    print()

    # ---------------------------------------------------------------
    # 3. Motorun dayandığı kritik maddeler
    # ---------------------------------------------------------------
    print("3. MOTORUN DOĞRUDAN DAYANDIĞI MADDELER")
    print("-" * 74)
    kritik = {
        "5": "müdür normu", "6": "müdür başyardımcısı", "7": "müdür yardımcısı",
        "14": "müdür yardımcısı kademeleri", "18": "genel bilgi/meslek dersleri normu",
        "19": "atölye ve laboratuvar normu", "21": "rehberlik alan öğretmeni normu",
        "22": "grup bölünmeleri ve istisnalar"
    }
    sorunlu = {n for n, _, _, _ in tutmayan}
    for no, ad in kritik.items():
        var = any(str(m.get("madde_no")) == no for m in veri.get("maddeler", []))
        if not var:
            print("   !! Madde %-3s (%s) JSON'da YOK" % (no, ad))
        elif no in sorunlu:
            print("   !! Madde %-3s (%s) metni TUTMUYOR" % (no, ad))
        else:
            print("   [OK] Madde %-3s %s" % (no, ad))

    print()
    print("=" * 74)
    if not yeni and not tutmayan:
        print("SONUC: Elimizdeki mevzuat GUNCEL ve resmî metinle BIREBIR.")
        kod = 0
    else:
        print("SONUC: FARK VAR — yukaridaki maddeler incelenmeli.")
        kod = 1
    print("=" * 74)
    return kod


if __name__ == "__main__":
    sys.exit(main())

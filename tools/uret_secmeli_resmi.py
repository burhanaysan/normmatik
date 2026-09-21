# -*- coding: utf-8 -*-
"""
NormMatik™ — Meslekî kurumların seçmeli ders listeleri (resmî kaynaktan)
==============================================================================
NE ÜRETİR: js/secmeli_resmi.js  ->  const SECMELI_RESMI

NEDEN VAR (16.09.2026, 05_dokumantasyon/secmeli_dersler/1_ENVANTER.md)
    Seçmeli havuzu 17 okul türünde resmî çizelgeden üretiliyordu; aşağıdaki
    türler ise yedek kaynaklara düşüyordu:
      - Meslek lisesi / ATP : kültür seçmelileri eski OGM dosyalarından (51-104
        ders, saatleri ilk görülen dosyadan); seçmeli meslek dersleri sınıf
        süzgeci olmadan 9-10. sınıfa da gösteriliyordu.
      - MESEM               : ad benzerliğiyle eşleşen MTAL meslek listesi + eski OGM.
      - Meslek ortaokulu    : elle yazılmış 16 ders + eski OGM.
      - Özel eğitim meslek / uygulama okulu : eski OGM (resmî çizelgede seçmeli YOK).

KAYNAKLAR (03_meb_mevzuat_ve_cizelgeler)
    mtal_kultur["2026-62"] : TTKB 16/07/2026-62 "Mesleki ve Teknik Ortaöğretim Okul ve
                             Kurumlarında Uygulanacak Seçmeli Dersler Tablosu"
                             (temel_egitim_ortaokul/SECIMLI_DERSLER_KURUL_KARARI.pdf s.3)
    mtal_kultur["2024-41"] : TTKB 03/09/2024-41 aynı tablo (…_2024-41.pdf s.4)
        İKİ TABLO DA TARANMIŞ GÖRÜNTÜDÜR. Değerler 200 dpi görüntüden okunup
        filigranın geçtiği hücreler 300 dpi kırpımla ikinci kez doğrulandı
        (16.09.2026). Sağlama: iki tablonun 9-12. sınıf sütunları, aşağıda
        BEKLENEN_FARK'ta sayılan hücreler dışında birebir aynı olmalı; değilse
        üretim DURUR (tek tablodaki okuma hatası diğeriyle çelişir).
    mtal_meslek            : MTAL ÇÖP "SEÇMELİ MESLEK DERSLERİ TABLOSU" — her sınıf kendi
                             klasöründeki (sınıfın tabi olduğu) ÇÖP'ten, satırın "Sınıf
                             Seviyesi" o sınıfı içeriyorsa
    mesem                  : MESEM ÇÖP "SEÇMELİ DERSLER TABLOSU"
    meslek_ortaokulu       : Meslek Ortaokulu ÇÖP (TTKB 04/09/2025-74) "SEÇMELİ DERSLER TABLOSU"

KULLANIM
    python -X utf8 tools/uret_secmeli_resmi.py   (ardından tools/build_bundle.py)
==============================================================================
"""
import glob
import io
import json
import os
import re
import sys

import fitz

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARSIV = os.path.join(os.path.dirname(KOK), "03_meb_mevzuat_ve_cizelgeler")
CIKTI = os.path.join(KOK, "js", "secmeli_resmi.js")

A = "Akademik Çalışmalar, İnsan, Toplum ve Bilim"
B = "Din, Ahlak ve Değer"
C = "Kültür, Sanat ve Spor"

# --------------------------------------------------------------------------
# TTKB 2026-62 — sütunlar: hazırlık, 9, 10, 11, 12. "-" okutulmaz; "2" sabit;
# "(1)(2)" seçenekli. Ad yanındaki (k) kaç kez alınabileceğidir.
# --------------------------------------------------------------------------
TABLO_62 = [
    (A, "Seçmeli Matematik", 2, "- - - 6 6"),
    (A, "Temel Matematik", 2, "- - - 2 2"),
    (A, "Seçmeli Fizik", 2, "- - - 4 4"),
    (A, "Seçmeli Kimya", 2, "- - - 4 4"),
    (A, "Seçmeli Biyoloji", 2, "- - - 4 4"),
    (A, "Seçmeli Türk Dili ve Edebiyatı", 2, "- - - (3)(5) (3)(5)"),
    (A, "Seçmeli Tarih", 1, "- - - (2)(4) (2)(4)"),
    (A, "Çağdaş Türk ve Dünya Tarihi", None, "- - - - 2"),
    (A, "Seçmeli Coğrafya", 2, "- - - (2)(4) (2)(4)"),
    (A, "Psikoloji", 1, "- - - 2 2"),
    (A, "Sosyoloji", 1, "- - - 2 2"),
    (A, "Mantık", 1, "- - - 2 2"),
    (A, "Seçmeli Birinci Yabancı Dil", 2, "- - - (2)(10)(12) (2)(10)(12)"),
    (A, "Fen Bilimleri Uygulamaları", 2, "- - - (2)(3) (2)(3)"),
    (A, "Matematik Uygulamaları", 2, "- - - (2)(3) (2)(3)"),
    (A, "Astronomi ve Uzay Bilimleri", 1, "- (1)(2) (1)(2) (1)(2) (1)(2)"),
    (A, "Sosyal Bilim Çalışmaları", 2, "- (2) (2) (2)(3) (2)(3)"),
    (A, "Bilişim Teknolojileri ve Yazılım", 4, "- 1 (1)(2) (1)(2)(3) (1)(2)(3)"),
    (A, "Proje Tasarımı ve Uygulamaları", 4, "(2) (2) (2) (2)(3)(4) (2)(3)(4)"),
    (A, "Düşünme Eğitimi", 1, "(1)(2) (1)(2) (1)(2) - -"),
    (A, "Demokrasi ve İnsan Hakları", 1, "(1)(2) 1 1 1 1"),
    (A, "Sürdürülebilir Tarım ve Gıda Güvenliği", 1, "- - (1)(2) (1)(2) -"),
    (A, "İklim, Çevre ve Yenilikçi Çözümler", 1, "- - (1)(2) (1)(2) -"),
    (A, "Temel Hukuk Bilgisi", 1, "- - (1)(2) (1)(2) (1)(2)"),
    (A, "Metin Tahlilleri", 2, "(1)(2) (1)(2) (1)(2) (1)(2) -"),
    (A, "Seçmeli İkinci Yabancı Dil", 4, "(1)(2) (2) (2) (2)(4) (2)(4)"),
    (A, "Osmanlı Türkçesi", 3, "- 2 2 2 2"),
    (A, "Türk Dünyası Coğrafyası", 1, "- - (1)(2) (1)(2) -"),
    (A, "Ortak Türk Edebiyatı", 1, "- - (1)(2) (1)(2) -"),
    (A, "Ortak Türk Tarihi", 1, "- - (1)(2) (1)(2) -"),
    (A, "Hedef Temelli Destek Eğitimi", None, "- - - - (3)(4)(5)(6)"),
    (B, "Kur'an-ı Kerim", 4, "2 2 2 2 2"),
    (B, "Kur'an-ı Kerim'in Anlam Dünyası", 2, "- - - 2 2"),
    (B, "Peygamberimizin Hayatı", 4, "(1)(2) (1)(2) (1)(2) (1)(2) (1)(2)"),
    (B, "Temel Dinî Bilgiler", 2, "(1)(2) (1)(2) (1)(2) (1)(2) (1)(2)"),
    (B, "Türk Düşünce Tarihi", 1, "- - (1)(2) (1)(2) (1)(2)"),
    (B, "Klasik Ahlak Metinleri", 3, "- - (1)(2) (1)(2) (1)(2)"),
    (C, "Adabımuaşeret", 1, "- 1 1 - -"),
    (C, "Türk Sosyal Hayatında Aile", 1, "(1)(2) (1)(2) (1)(2) (1)(2) (1)(2)"),
    (C, "Tezhip", 1, "- - - (1)(2) (1)(2)"),
    (C, "Ebru", 1, "- - - (1)(2) (1)(2)"),
    (C, "Hüsnühat", 1, "- - - (1)(2) (1)(2)"),
    (C, "Dinî Musiki", 1, "- - - (1)(2) (1)(2)"),
    (C, "Fütüvvet", 1, "- 1 1 1 1"),
    (C, "Ahilik Kültürü ve Girişimcilik", 1, "- 1 1 1 1"),
    (C, "İslam Bilim Tarihi", 1, "(1)(2) (1)(2) (1)(2) (1)(2) (1)(2)"),
    (C, "Türk Kültür ve Medeniyet Tarihi", 1, "- (2) (2) (2)(4) (2)(4)"),
    (C, "İslam Kültür ve Medeniyeti", 1, "(1)(2) (1)(2) (1)(2) (1)(2) (1)(2)"),
    (C, "Spor Eğitimi", 3, "(1)(2) (1)(2) (1)(2) (1)(2) (1)(2)"),
    (C, "Sanat Eğitimi", 3, "(1)(2) (1)(2) (1)(2) (1)(2) (1)(2)"),
]

# TTKB 2024-41 — sütunlar: 9, 10, 11, 12 (hazırlık sütunu yok)
TABLO_41 = [
    (A, "Seçmeli Matematik", 2, "- - 6 6"),
    (A, "Temel Matematik", 2, "- - 2 2"),
    (A, "Seçmeli Fizik", 2, "- - 4 4"),
    (A, "Seçmeli Kimya", 2, "- - 4 4"),
    (A, "Seçmeli Biyoloji", 2, "- - 4 4"),
    (A, "Seçmeli Türk Dili ve Edebiyatı", 2, "- - (3)(5) (3)(5)"),
    (A, "Seçmeli Tarih", 1, "- - (2)(4) (2)(4)"),
    (A, "Çağdaş Türk ve Dünya Tarihi", None, "- - - (2)(4)"),
    (A, "Seçmeli Coğrafya", 2, "- - (2)(4) (2)(4)"),
    (A, "Psikoloji", 1, "- - 2 2"),
    (A, "Sosyoloji", 1, "- - 2 2"),
    (A, "Mantık", 1, "- - 2 2"),
    (A, "Seçmeli Birinci Yabancı Dil", 2, "- - (2)(10)(12) (2)(10)(12)"),
    (A, "Fen Bilimleri Uygulamaları", 2, "- - (2)(3) (2)(3)"),
    (A, "Matematik Uygulamaları", 2, "- - (2)(3) (2)(3)"),
    (A, "Astronomi ve Uzay Bilimleri", 1, "(1)(2) (1)(2) (1)(2) (1)(2)"),
    (A, "Sosyal Bilim Çalışmaları", 2, "(2)(3) (2) (2)(3) (2)(3)"),
    (A, "Bilişim Teknolojileri ve Yazılım", 4, "1 (1)(2) (1)(2)(3) (1)(2)(3)"),
    (A, "Proje Tasarımı ve Uygulamaları", 4, "(2)(3) (2) (2)(3)(4) (2)(3)(4)"),
    (A, "Düşünme Eğitimi", 1, "(1)(2) (1)(2) - -"),
    (A, "Demokrasi ve İnsan Hakları", 1, "1 1 1 1"),
    (A, "Sürdürülebilir Tarım ve Gıda Güvenliği", 1, "- (1)(2) (1)(2) -"),
    (A, "İklim, Çevre ve Yenilikçi Çözümler", 1, "- (1)(2) (1)(2) -"),
    (A, "Temel Hukuk Bilgisi", 1, "- (1)(2) (1)(2) (1)(2)"),
    (A, "Metin Tahlilleri", 2, "(1)(2) (1)(2) (1)(2) -"),
    (A, "Seçmeli İkinci Yabancı Dil", 4, "(2) (2) (2)(4) (2)(4)"),
    (A, "Osmanlı Türkçesi", 3, "2 2 2 2"),
    (A, "Türk Dünyası Coğrafyası", 1, "- (1)(2) (1)(2) -"),
    (A, "Ortak Türk Edebiyatı", 1, "- (1)(2) (1)(2) -"),
    (A, "Ortak Türk Tarihi", 1, "- (1)(2) (1)(2) -"),
    (B, "Kur'an-ı Kerim", 4, "2 2 2 2"),
    (B, "Kur'an-ı Kerim'in Anlam Dünyası", 2, "- - 2 2"),
    (B, "Peygamberimizin Hayatı", 4, "(1)(2) (1)(2) (1)(2) (1)(2)"),
    (B, "Temel Dinî Bilgiler", 2, "(1)(2) (1)(2) (1)(2) (1)(2)"),
    (B, "Türk Düşünce Tarihi", 1, "- (1)(2) (1)(2) (1)(2)"),
    (B, "Klasik Ahlak Metinleri", 3, "- (1)(2) (1)(2) (1)(2)"),
    (C, "Adabımuaşeret", 1, "1 1 - -"),
    (C, "Türk Sosyal Hayatında Aile", 1, "(1)(2) (1)(2) (1)(2) (1)(2)"),
    (C, "Tezhip", 1, "- - (1)(2) (1)(2)"),
    (C, "Ebru", 1, "- - (1)(2) (1)(2)"),
    (C, "Hüsnühat", 1, "- - (1)(2) (1)(2)"),
    (C, "Dinî Musiki", 1, "- - (1)(2) (1)(2)"),
    (C, "Fütüvvet", 1, "1 1 1 1"),
    (C, "Ahilik Kültürü ve Girişimcilik", 1, "1 1 1 1"),
    (C, "İslam Bilim Tarihi", 1, "(1)(2) (1)(2) (1)(2) (1)(2)"),
    (C, "Türk Kültür ve Medeniyet Tarihi", 1, "(2) (2) (2)(4) (2)(4)"),
    (C, "İslam Kültür ve Medeniyeti", 1, "(1)(2) (1)(2) (1)(2) (1)(2)"),
    (C, "Spor Eğitimi", 3, "(1)(2)(3) (1)(2) (1)(2) (1)(2)"),
    (C, "Sanat Eğitimi", 3, "(1)(2)(3) (1)(2) (1)(2) (1)(2)"),
]

# İki kararın 9-12. sınıf sütunlarında bilinen farklar (görüntülerden ayrı ayrı okundu).
BEKLENEN_FARK = {
    ("Çağdaş Türk ve Dünya Tarihi", "12"),
    ("Sosyal Bilim Çalışmaları", "9"),
    ("Proje Tasarımı ve Uygulamaları", "9"),
    ("Spor Eğitimi", "9"),
    ("Sanat Eğitimi", "9"),
    ("Hedef Temelli Destek Eğitimi", "12"),   # yalnız 2026-62'de
}


def hucre(h):
    h = h.strip()
    if h == "-":
        return None
    sec = re.findall(r"\((\d+)\)", h)
    if sec:
        return [int(x) for x in sec]
    if re.fullmatch(r"\d+", h):
        return [int(h)]
    raise SystemExit("HATA: çözülemeyen hücre %r" % h)


def ttkb_tablosu(satirlar, siniflar):
    cikti = {s: [] for s in siniflar}
    for grup, ders, kez, hucreler in satirlar:
        parca = re.findall(r"\(\d+\)(?:\(\d+\))*|\d+|-", hucreler)
        if len(parca) != len(siniflar):
            raise SystemExit("HATA: %s -> %d hücre, beklenen %d" % (ders, len(parca), len(siniflar)))
        for s, h in zip(siniflar, parca):
            saat = hucre(h)
            if saat:
                cikti[s].append({"ders": ders, "grup": grup, "saatler": saat, "kacKez": kez})
    return cikti


def mtal_kultur():
    t62 = ttkb_tablosu(TABLO_62, ["hazirlik", "9", "10", "11", "12"])
    t41 = ttkb_tablosu(TABLO_41, ["9", "10", "11", "12"])
    # SAĞLAMA: iki bağımsız okuma yalnızca bilinen hücrelerde ayrışabilir
    bulunan = set()
    for s in ["9", "10", "11", "12"]:
        a = {d["ders"]: d["saatler"] for d in t62[s]}
        b = {d["ders"]: d["saatler"] for d in t41[s]}
        for ders in set(a) | set(b):
            if a.get(ders) != b.get(ders):
                bulunan.add((ders, s))
    if bulunan != BEKLENEN_FARK:
        raise SystemExit("HATA: 2026-62 / 2024-41 farkı beklenenden farklı:\n  fazla: %s\n  eksik: %s"
                         % (sorted(bulunan - BEKLENEN_FARK), sorted(BEKLENEN_FARK - bulunan)))
    return {
        "2026-62": {"karar": "TTKB 16/07/2026-62", "siniflar": t62,
                    "kaynak": "temel_egitim_ortaokul/SECIMLI_DERSLER_KURUL_KARARI.pdf (s.3, görüntü)"},
        "2024-41": {"karar": "TTKB 03/09/2024-41", "siniflar": t41,
                    "kaynak": "temel_egitim_ortaokul/SECMELI_DERSLER_KURUL_KARARI_2024-41.pdf (s.4, görüntü)"},
        "kural": "Tüm sınıf seviyelerinde seçmeli ders gruplarının her birinden en az bir ders seçilmesi zorunludur; "
                 "hazırlık sınıfında gruplardan toplam 2 ders saati (2026-62 açıklamaları).",
        "gruplar": [A, B, C],
    }


# --------------------------------------------------------------------------
def tr_baslik(metin):
    """BÜYÜK HARFLİ ders adını Türkçe başlık biçimine çevirir (Python .title() 'İ' harfini bozar)."""
    KUCUK = {"ve", "ile", "veya", "için"}
    kelimeler = []
    for i, k in enumerate(metin.split()):
        alt = k.replace("İ", "i").replace("I", "ı").lower()
        if i and alt in KUCUK:
            kelimeler.append(alt)
            continue
        ilk = alt[0].replace("i", "İ").replace("ı", "I").upper() if alt[0] in "iı" else alt[0].upper()
        kelimeler.append(ilk + alt[1:])
    return " ".join(kelimeler).replace("Kur'an-ı", "Kur'an-ı")


def satir_listesi(metin):
    return [x.strip() for x in metin.split("\n") if x.strip()]


def mtal_meslek():
    """Her sınıf klasöründeki ÇÖP'ün seçmeli meslek dersleri tablosu, o sınıfa süzülmüş."""
    cikti, rapor = {}, {"tablo_yok": [], "satir": 0}
    for sinif in ["9", "10", "11", "12"]:
        for f in sorted(glob.glob(os.path.join(ARSIV, "mtegm_mesleki_ve_teknik", "sinif_" + sinif, "*.pdf"))):
            kok = re.sub(r"(_\d+)?\.pdf$", "", os.path.basename(f))
            d = fitz.open(f)
            sayfalar = [i for i, p in enumerate(d)
                        if re.search(r"SEÇMELİ MESLEK DERSLERİ TABLOSU\s*\n", p.get_text()) and "....." not in p.get_text()]
            if not sayfalar:
                rapor["tablo_yok"].append("%s/%s" % (sinif, os.path.basename(f)))
                continue
            i = sayfalar[0]
            metin = d[i].get_text()
            if i + 1 < d.page_count:
                metin += "\n" + d[i + 1].get_text()
            s = satir_listesi(metin[metin.index("SEÇMELİ MESLEK DERSLERİ TABLOSU"):])
            # Başlık satırına kadar (Ders Adı / DERS ADI) açıklama notları atlanır (ör. Yiyecek İçecek:
            # "(*) Seçmeli yabancı dil dersinde ... sadece biri seçilir.").
            kucuk = lambda x: x.replace("İ", "i").replace("I", "ı").lower().strip()
            basliklar = [i for i, x in enumerate(s) if kucuk(x) == "ders adı"]
            j = (basliklar[0] + 1) if basliklar else 1
            dersler, ad = [], []
            while j < len(s):
                x = s[j]
                # başlık hücreleri; "Ders / Saati" iki satıra bölünebilir (Kuyumculuk 12)
                if kucuk(x) in ("sınıf seviyesi", "ders saati", "süre", "ders", "saati", "sınıf", "seviyesi"):
                    j += 1
                    continue
                if re.fullmatch(r"\d{1,2}(\s*-\s*\d{1,2})*", x) and ad and j + 1 < len(s) and re.fullmatch(r"\d{1,2}", s[j + 1]):
                    seviye = [v.strip() for v in x.split("-")]
                    dersler.append({"ders": " ".join(ad), "seviye": seviye, "saat": int(s[j + 1])})
                    ad = []
                    j += 2
                    continue
                # Sayfa numarası: tablo SAYFA KIRILMASIYLA sonraki sayfada sürebilir (7. adım denetimi,
                # 17.09.2026: 12. sınıf ÇÖP'lerinin 12 alanında ikinci sayfadaki dersler düşüyordu,
                # ör. Gazetecilik 16 dersin 5'i). Numara atlanır; tablo sonu yalnız ders tanım
                # başlığı ("… DERSİ"), "Dersin Amacı" ya da uzun metinle belirlenir.
                if re.fullmatch(r"\d{1,3}", x) and not ad:
                    j += 1
                    continue
                if re.search(r"DERSİ\s*$", x) or len(x) > 80 or x.startswith("Dersin Amacı"):
                    if dersler:
                        break
                    j += 1
                    continue
                ad.append(x)
                j += 1
            secilen = [{"ders": k["ders"], "saat": k["saat"], "seviye": "-".join(k["seviye"])}
                       for k in dersler if sinif in k["seviye"]]
            if secilen:
                cikti.setdefault(kok, {})[sinif] = secilen
                rapor["satir"] += len(secilen)
    # Aynı ÇÖP'ün uygulamadaki ikinci kimlikleri (strict_pdf_curriculum_db ile aynı veri):
    # basim=matbaa, otomotiv=motorluarac, sh=aile; grafikpro'nun 11. sınıf dosyası yok, grafik kullanılır.
    for takma, asil in (("basim", "matbaa"), ("otomotiv", "motorluarac"), ("sh", "aile"), ("grafikpro", "grafik")):
        for sinif, liste in cikti.get(asil, {}).items():
            cikti.setdefault(takma, {}).setdefault(sinif, liste)
    return cikti, rapor


# --------------------------------------------------------------------------
def mesem():
    kaynak_alan = {}
    mesem_db = open(os.path.join(KOK, "js", "mesem_curriculum_db.js"), encoding="utf-8").read()
    for alan, dosyalar in re.findall(r'"(\w+)": \{\s*"alan_adi".*?"kaynak": \[([^\]]*)\]', mesem_db, flags=re.S):
        for dosya in re.findall(r'"([^"]+)"', dosyalar):
            kaynak_alan[dosya] = alan
    cikti, rapor = {}, {"eslesmeyen_pdf": [], "tablo_yok": []}
    gorulen = set()
    for f in sorted(glob.glob(os.path.join(ARSIV, "mtegm_mesleki_ve_teknik", "mesem_cop", "SINIF_*", "*.pdf"))):
        ad = os.path.basename(f)
        if ad in gorulen:
            continue
        gorulen.add(ad)
        alan = kaynak_alan.get(ad)
        if not alan:
            rapor["eslesmeyen_pdf"].append(ad)
            continue
        d = fitz.open(f)
        metin = None
        for p in d:
            t = p.get_text()
            if re.search(r"SEÇMELİ DERSLER TABLOSU\s*\n", t) and "....." not in t:
                metin = t
                break
        if metin is None:
            rapor["tablo_yok"].append(ad)
            continue
        s = satir_listesi(metin)
        # başlık satırlarının sonundan ("SINIF") itibaren
        bas = max(i for i, x in enumerate(s) if "SINIF" in x) + 1
        s = s[bas:]
        # Grup adları kaynaktaki gibi (7. adım denetimi: üç grup iki gruba indirgenmişti)
        GRUP = {"DİN, AHLAK VE DEĞERLER": "Din, Ahlak ve Değerler", "SPOR VE SOSYAL ETKİNLİK": "Spor ve Sosyal Etkinlik",
                "GÜZEL SANATLAR": "Güzel Sanatlar"}
        deger = re.compile(r"^(-|\d+|(\(\d+\)\s*)+)$")
        tampon, grup, siniflar = [], None, {}
        j = 0
        while j < len(s):
            if not deger.match(s[j]):
                tampon.append(s[j])
                j += 1
                continue
            hucreler = s[j:j + 4]
            if not tampon and len(hucreler) < 4:
                break                     # sayfa numarası: tablo bitti
            if len(hucreler) < 4 or not all(deger.match(h) for h in hucreler):
                raise SystemExit("HATA: MESEM %s -> 4 hücre okunamadı: %r" % (ad, hucreler))
            metin_ad = " ".join(tampon)
            for g in GRUP:
                if metin_ad.startswith(g):
                    grup, metin_ad = GRUP[g], metin_ad[len(g):].strip()
                elif metin_ad.replace("SEÇMELİ DERSLER", "").strip().startswith(g):
                    grup, metin_ad = GRUP[g], metin_ad.replace("SEÇMELİ DERSLER", "").strip()[len(g):].strip()
            metin_ad = metin_ad.replace("SEÇMELİ DERSLER", "").strip()
            for sn, h in zip(["9", "10", "11", "12"], hucreler):
                saat = hucre(h.replace(" ", ""))
                if saat:
                    siniflar.setdefault(sn, []).append({"ders": tr_baslik(metin_ad),
                                                        "adHam": metin_ad, "grup": grup, "saatler": saat})
            tampon = []
            j += 4
        if sum(len(v) for v in siniflar.values()) != 7:
            raise SystemExit("HATA: MESEM %s -> 7 ders bekleniyordu, %d okundu" % (ad, sum(len(v) for v in siniflar.values())))
        onceki = cikti.get(alan)
        if onceki and onceki != siniflar:
            raise SystemExit("HATA: MESEM alanı %s için farklı tablolar (%s)" % (alan, ad))
        cikti[alan] = siniflar
    return cikti, rapor


# --------------------------------------------------------------------------
def meslek_ortaokulu():
    d = fitz.open(os.path.join(ARSIV, "temel_egitim_ortaokul", "MESLEK_ORTAOKULU_COP.pdf"))
    metin = next(p.get_text() for p in d if re.search(r"SEÇMELİ DERSLER TABLOSU", p.get_text()) and "....." not in p.get_text())
    s = satir_listesi(metin[metin.index("SEÇMELİ DERSLER TABLOSU") + len("SEÇMELİ DERSLER TABLOSU"):])
    GRUPLAR = {"İnsan, Toplum ve Bilim": "İnsan, Toplum ve Bilim", "Din, Ahlak ve Değer": B, "Kültür, Sanat ve Spor": C}
    deger = re.compile(r"^(-|\d+|(\(\d+\)\s*)+)$")
    cikti, grup = {}, None
    j = 0
    while j < len(s):
        x = s[j]
        if x.startswith("ÇİZELGENİN UYGULANMASI"):
            break
        if x in GRUPLAR:
            grup = GRUPLAR[x]
            j += 1
            continue
        m = re.fullmatch(r"(.+?)\s*\((\d+)\)", x)
        if not m or grup is None:
            raise SystemExit("HATA: meslek ortaokulu tablosunda beklenmeyen satır: %r" % x)
        hucreler = s[j + 1:j + 5]
        if len(hucreler) < 4 or not all(deger.match(h) for h in hucreler):
            raise SystemExit("HATA: meslek ortaokulu %s -> hücreler %r" % (x, hucreler))
        for sn, h in zip(["5", "6", "7", "8"], hucreler):
            saat = hucre(h.replace(" ", ""))
            if saat:
                cikti.setdefault(sn, []).append({"ders": m.group(1).replace("“", "\"").replace("”", "\""),
                                                 "grup": grup, "saatler": saat, "kacKez": int(m.group(2))})
        j += 5
    toplam = sum(len(v) for v in cikti.values())
    return cikti, toplam


def js_yaz(veri):
    s = ["/* ===========================================================================",
         "   OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN",
         "   Üreteç : tools/uret_secmeli_resmi.py",
         "   Meslekî kurumların seçmeli ders listeleri, resmî kaynaktan:",
         "     mtal_kultur      TTKB 2026-62 ve 2024-41 seçmeli dersler tabloları (görüntüden okundu, çapraz sağlama)",
         "     mtal_meslek      MTAL ÇÖP seçmeli meslek dersleri tablosu (sınıfın kendi ÇÖP'ü, sınıfa süzülmüş)",
         "     mesem            MESEM ÇÖP seçmeli dersler tablosu",
         "     meslek_ortaokulu Meslek Ortaokulu ÇÖP (TTKB 2025-74) seçmeli dersler tablosu",
         "   ======================================================================== */",
         "const SECMELI_RESMI = " + json.dumps(veri, ensure_ascii=False, indent=1) + ";", ""]
    with io.open(CIKTI, "w", encoding="utf-8") as f:
        f.write("\n".join(s))


def main():
    kultur = mtal_kultur()
    meslek, r_meslek = mtal_meslek()
    ms, r_mesem = mesem()
    mo, mo_say = meslek_ortaokulu()
    veri = {"mtal_kultur": kultur, "mtal_meslek": meslek, "mesem": ms,
            "meslek_ortaokulu": {"karar": "TTKB 04/09/2025-74 (5 ve 6. sınıftan kademeli)", "siniflar": mo,
                                 "kural": "İnsan, Toplum ve Bilim / Din, Ahlak ve Değer / Kültür, Sanat ve Spor gruplarının her birinden her yıl birer ders seçmesi zorunludur."}}
    print("MTAL kültür 2026-62:", {k: len(v) for k, v in kultur["2026-62"]["siniflar"].items()})
    print("MTAL kültür 2024-41:", {k: len(v) for k, v in kultur["2024-41"]["siniflar"].items()}, "— çapraz sağlama GEÇTİ")
    print("MTAL meslek: %d alan, %d satır; tablosu olmayan PDF: %d" % (len(meslek), r_meslek["satir"], len(r_meslek["tablo_yok"])))
    for s in ["9", "10", "11", "12"]:
        print("   sınıf %s: %d alanda seçmeli meslek dersi var" % (s, sum(1 for a in meslek.values() if s in a)))
    print("   tablosu olmayan:", r_meslek["tablo_yok"])
    print("MESEM: %d alan; eşleşmeyen PDF: %s; tablosuz: %s" % (len(ms), r_mesem["eslesmeyen_pdf"], r_mesem["tablo_yok"]))
    print("Meslek ortaokulu: %d sınıf kaydı %s" % (mo_say, {k: len(v) for k, v in mo.items()}))
    js_yaz(veri)
    print("yazıldı:", CIKTI)


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""
strict_pdf_curriculum_db.js YENIDEN URETICI
===========================================

TEK GERCEK KAYNAK:  data/kaynak_cizelgeler/mtegm/sinif_{9,10,11,12}.json
CIKTI            :  js/strict_pdf_curriculum_db.js

Bu dosya, uygulamanin MTEGM (meslek lisesi) haftalik ders cizelgelerini
tuttugu tek yerdir. curriculumEngine.js satir ~736 dogrudan bunu okur;
kullanicinin ekranda gordugu ders listesi buradan gelir.

NEDEN YENIDEN URETIYORUZ (2026-08-22 tespitleri):
  1) 12. SINIF AMP/ATP KARISIMI. Kaynak PDF'te 12. sinifta tek tablo icinde
     iki sutun vardir (Anadolu Meslek / Anadolu Teknik). Eski ayiklayici bu
     tabloyu TEK kayda indirmis; sonucta Anadolu TEKNIK subesine de 24 saat
     "Isletmelerde Mesleki Egitim" yazilmis. ATP'de bu ders YOKTUR (onun
     yerine 31 saat akademik destek dersi vardir). Madde 19 atolye normu
     dogrudan bu saatten hesaplandigi icin norm ciddi sekilde sisiyordu.
  2) AMP/ATP FILTRESI SESSIZCE DEVRE DISI. curriculumEngine su testi yapar:
        titleIsAtp = baslik "anadolu teknik programi" icerir VE
                     "anadolu meslek programi" ICERMEZ
     Eski basliklarda PDF'in ust basligi ("... ANADOLU MESLEK VE ANADOLU
     TEKNIK PROGRAMI HAFTALIK DERS CIZELGELERI") de yapistigi icin 1329
     cizelgenin 182'sinde iki ifade birden bulunuyor, filtre calismiyordu.
     Bu uretici, baslikta iki ifadeden SADECE BIRININ gecmesini garanti eder.
  3) ALAN ADI DEGISIKLIKLERI. MEB yeni 9. sinif programlarinda bazi alanlarin
     adini/dosya adini degistirdi. Uygulama alani tek anahtarla aradigi icin
     bu alanlarda 9. sinif ya da 10-12 bosta kaliyordu. Asagidaki
     ALAN_BIRLESTIRME haritasi dal listeleri karsilastirilarak dogrulandi.
  4) REHBERLIK VE YONLENDIRME saati eski veride "ALAN VE DAL MESLEK DERSLERI"
     kategorisinde duruyordu; curriculumEngine `kategori.includes("MESLEK")`
     testiyle isAtolye=true isaretledigi icin rehberlik saati atolye yuku
     sayiliyordu. Burada ayri "REHBERLIK" kategorisi veriyoruz.

CALISTIRMA:
    python tools/rebuild_curriculum_db.py
Ardindan MUTLAKA:
    python tools/build_bundle.py
    (ve app.html icindeki ?v= etiketi + sw.js CACHE_NAME artirilmali)
"""

import json
import os
import re
import sys
from collections import defaultdict, OrderedDict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE_DIR, "data", "kaynak_cizelgeler", "mtegm")
OUT_FILE = os.path.join(BASE_DIR, "js", "strict_pdf_curriculum_db.js")
GRADES = ["9", "10", "11", "12"]

# ---------------------------------------------------------------------------
# ALAN BIRLESTIRME
# MEB'in ad/dosya degisiklikleri. Her satir, DAL LISTELERI karsilastirilarak
# dogrulandi (ornek: otomotiv_9 ve motorluarac_10 ayni 5 dali tasiyor).
# Sol taraftaki anahtarin verisi, sag taraftaki anahtarin eksik siniflarini
# doldurur ve tersi de gecerlidir (birlesik havuz).
# ---------------------------------------------------------------------------
ALAN_BIRLESTIRME = [
    # (yeni_ad_anahtari, eski_ad_anahtari, aciklama)
    ("otomotiv", "motorluarac", "Motorlu Araclar Teknolojisi -> Otomotiv Teknolojileri"),
    ("basim", "matbaa", "Matbaa Teknolojisi -> Basim Teknolojileri"),
    ("sh", "aile", "Aile ve Tuketici Hizmetleri -> Sosyal Hizmetler"),
    ("endkalite", "endustriyel_kalite_kontrol", "Endustriyel Kalite Kontrol (iki dosya adi)"),
]

# "pro" (protokol kapsamindaki okullar) dosyalari bazi siniflarda eksik.
# Eksik sinifi ana alandan doldur.
PRO_TABAN = {
    "grafikpro": "grafik",
    "muhasebepro": "muhasebe",
    "denizcilikpro": "denizcilik",
    "gazetecilikpro": "gazetecilik",
    "konaklamapro": "konaklama",
    "radyotvpro": "radyotv",
    "yiyecekpro": "yiyecek",
    "ayakkabipro": "ayakkabipro",
    "seramikpro": "seramikpro",
    "havacilikveuzaypro": "havacilikveuzaypro",
    "plastiksanatlar": "plastiksanatlar",
}

VARYANT_ETIKET = {
    "isletmelerde_mesleki_egitime_11_sinifta_baslayan_okullar_icin":
        "ISLETMELERDE MESLEKI EGITIME 11. SINIFTA BASLAYAN OKULLAR ICIN",
    "protokol_kapsamindaki_okullar_icin":
        "PROTOKOL KAPSAMINDAKI OKULLAR ICIN",
}

PROGRAM_ETIKET = {
    "AMP": "ANADOLU MESLEK PROGRAMI",
    "ATP": "ANADOLU TEKNİK PROGRAMI",
}


def alan_koku(dosya_adi):
    return re.sub(r"_\d+\.pdf$", "", str(dosya_adi or ""))


def sayfa_no(p):
    if isinstance(p, list):
        return p[0] if p else 0
    return p or 0


# Ders sayilmayip disarida birakilan "isletmelerde mesleki egitim" satirlari.
# Sessizce dusmesinler diye toplanip ozette sayilari basilir.
ISLETME_SATIRLARI = []


def kategori_duzelt(k):
    """Kaynak PDF ayiklamasindan gelen bosluk hatalarini duzeltir."""
    k = str(k or "").strip().upper()
    k = k.replace("MESLEKDERSLERİ", "MESLEK DERSLERİ")
    k = re.sub(r"\s+", " ", k)
    return k or "ORTAK DERSLER"


# Yalnizca yildizdan olusan dipnot isareti: (*) (**) (***) (****)
# "(YIYECEK ICECEK HIZMETLERI)" gibi aciklamalar adin gercek parcasidir,
# bu desen onlara dokunmaz.
_DIPNOT_RE = re.compile(r"\s*\(\*+\)")


def ders_temizle(ad):
    """
    Dipnot isaretlerini addan ayirir; baraj bilgisini dondurur.

    BARAJ YALNIZCA (*) DEMEKTIR. Kaynak PDF'in kendi dipnotu:
    "(*) Milli Egitim Bakanligi Ortaogretim Kurumlari Yonetmeligi uyarinca
    yilsonu basari puani ile basarili sayilamayacak derslerdir."
    242 PDF'in TAMAMINDAKI dipnotlar tarandi; isaretlerin anlami sabittir:
      (**)  "Secmeli meslek dersleri ... Cerceve Ogretim Programinin Uygulama
            Esaslari'nda yer almaktadir." (1126 dipnotun ~%97'si.)
      (***) "Il istihdam ve mesleki egitim kurulu tarafindan belirlenen
            alan/dallarda 11. SINIFTA Isletmelerde Mesleki Egitim dersi
            uygulanir." (345 dipnotun ~%85'i.) Bu bir KURALDIR; ayri bir
            cizelge olarak zaten yakalanir, bkz. varyant alani =
            "isletmelerde_mesleki_egitime_11_sinifta_baslayan_okullar_icin".
    Ikisi de baraj DEGILDIR ama ADIN da parcasi degildir.

    ADDAN HEPSI SILINIR. Once yalnizca "(*)" siliniyordu; geriye kalan
    "(***)" yuzunden ayni ders veri tabaninda UC AYRI AD olarak duruyordu
    ("ISLETMELERDE MESLEKI EGITIM" 121, "... (***)" 107, "... (****)" 1).
    Ad bir ANAHTAR: curriculumEngine dersi adiyla eslestirir, yuk boylece
    var olmayan derslere bolunur.
    """
    ham = str(ad or "").strip()
    baraj = "(*)" in ham
    temiz = _DIPNOT_RE.sub("", ham).strip()
    temiz = re.sub(r"\s+", " ", temiz)
    return temiz, baraj


def dal_adi_duzelt(dal_adi):
    """
    Dal adini butun siniflarda AYNI bicime getirir: "... DALI" ile biter.

    NEDEN: Kaynak PDF'lerde tutarsizlik var. Ornek: Saglik Hizmetleri
    "SAGLIK BAKIM TEKNISYENLIGI DALI" (9-11. sinif) ama 12. sinifta
    "SAGLIK BAKIM TEKNISYENLIGI" (DALI yok). Uygulama dal adini 9. siniftan
    okuyup 12. sinifta ariyor; ek "DALI" kelimesi yuzunden
    curriculumEngine.js:761'deki tam eslesme (200 puan) kaciriliyor ve
    eslestirme yalnizca token yedegine kaliyor. Kaynagi degil, uretilen
    basligi normallestiriyoruz.
    """
    d = re.sub(r"\s+", " ", str(dal_adi or "").strip()).upper()
    if not d:
        return d
    # "ALAN ORTAK" gibi dal olmayan etiketlere DALI eklenmez.
    if d in ("ALAN ORTAK",):
        return d
    if not d.endswith("DALI"):
        d += " DALI"
    return d


def baslik_uret(alan_adi, dal_adi, program, varyant):
    """
    curriculumEngine'in eslestiricisiyle UYUMLU baslik uretir:
      - "ANADOLU MESLEK PROGRAMI" veya "ANADOLU TEKNİK PROGRAMI" ifadelerinden
        SADECE BIRI gecer (AMP/ATP filtresi ancak boyle calisir).
      - Ilk parantez DAL adidir (hem curriculumEngine hem database.js ilk
        parantezi okur) ve daima "DALI" ile biter.
    """
    prog = PROGRAM_ETIKET.get(program, "ANADOLU MESLEK PROGRAMI")
    parca = "%s %s (%s) HAFTALIK DERS ÇİZELGESİ" % (prog, alan_adi, dal_adi_duzelt(dal_adi))
    etiket = VARYANT_ETIKET.get(varyant)
    if etiket:
        parca += " - " + etiket
    return parca


def kayit_to_cizelge(rec, alan_adi, program):
    dersler = []
    for c in rec.get("dersler", []):
        # KATEGORISI None OLAN SATIR DERS DEGILDIR. Ayristirici bunu bilerek
        # bos birakir: satir cizelgenin TOPLAM DERS SAATI satirinin ALTINDA
        # basilmistir ve cizelgenin kendi toplamina DAHIL DEGILDIR. Kulliyatta
        # tek ornegi var: protokol cizelgelerindeki "ISLETMELERDE MESLEKI
        # EGITIM" (24 saat, 9 PDF'de 17 satir).
        #
        # Kategori bosken kategori_duzelt() bunu "ORTAK DERSLER" yapardi ve
        # 24 saat siniftaki ders yukune eklenirdi: 43 saatlik cizelge 67 saat
        # gorunur, o dallarin normu sisirilirdi. Isletmede mesleki egitim
        # sinifta okutulan ders degil, KOORDINATORLUK gorevidir ve ayri
        # kurallara tabidir; ders yuku olarak sayilamaz.
        if c.get("kategori") is None:
            ISLETME_SATIRLARI.append(
                (rec.get("kaynak_dosya"), rec.get("kaynak_sayfa"),
                 c.get("ders_adi"), c.get("haftalik_saat")))
            continue
        temiz, baraj = ders_temizle(c.get("ders_adi"))
        if not temiz:
            continue
        try:
            saat = int(c.get("haftalik_saat") or 0)
        except (TypeError, ValueError):
            saat = 0
        if saat <= 0:
            continue
        dersler.append(OrderedDict([
            ("ders", temiz),
            ("saat", saat),
            ("kategori", kategori_duzelt(c.get("kategori"))),
            ("baraj_ders", bool(baraj)),
        ]))

    # Rehberlik ve Yonlendirme: ozet blogunda ayri tutuluyor, ders listesinde yok.
    ozet = rec.get("ozet") or {}
    try:
        reh = int(ozet.get("rehberlik_ve_yonlendirme") or 0)
    except (TypeError, ValueError):
        reh = 0
    if reh > 0:
        dersler.append(OrderedDict([
            ("ders", "REHBERLİK VE YÖNLENDİRME"),
            ("saat", reh),
            ("kategori", "REHBERLİK"),   # <- MESLEK icermez, isAtolye=false olur
            ("baraj_ders", False),
        ]))

    return OrderedDict([
        ("page", sayfa_no(rec.get("kaynak_sayfa"))),
        ("title", baslik_uret(alan_adi, rec.get("dal_adi") or "ALAN ORTAK",
                              program, rec.get("varyant"))),
        ("grade", str(rec.get("sinif_seviyesi") or "")),
        ("program", program),
        ("varyant", rec.get("varyant")),
        ("courses", dersler),
    ])


def main():
    ham = defaultdict(lambda: defaultdict(list))   # [alan][sinif] -> [rec, ...]
    alan_adlari = {}
    atlanan_tablo = 0

    for g in GRADES:
        yol = os.path.join(SRC_DIR, "sinif_%s.json" % g)
        with open(yol, encoding="utf-8") as f:
            kayitlar = json.load(f)
        for rec in kayitlar:
            # `tablo_turu` tasiyan kayitlar haftalik ders cizelgesi DEGIL;
            # alanin tum dal derslerini listeleyen ek tablolardir. Cizelge
            # olarak kullanilirsa ders yuku katlanir.
            if "tablo_turu" in rec or not rec.get("dal_adi"):
                atlanan_tablo += 1
                continue
            kok = alan_koku(rec.get("kaynak_dosya"))
            rec["sinif_seviyesi"] = g
            ham[kok][g].append(rec)
            ad = str(rec.get("alan_adi") or "").strip()
            # "ANADOLU MESLEK PROGRAMI" gibi bozuk alan_adi degerlerini alma
            if ad and "PROGRAMI" not in ad and kok not in alan_adlari:
                alan_adlari[kok] = ad

    # --- alan adi bulunamayanlar icin dosya kokunden turet
    for kok in ham:
        alan_adlari.setdefault(kok, kok.replace("_", " ").upper() + " ALANI")

    # --- birlestirme havuzlari: hangi anahtar hangi anahtardan eksik sinif alir
    esdeger = {}
    for a, b, _ in ALAN_BIRLESTIRME:
        esdeger.setdefault(a, set()).add(b)
        esdeger.setdefault(b, set()).add(a)
    for pro, taban in PRO_TABAN.items():
        if pro != taban:
            esdeger.setdefault(pro, set()).add(taban)

    db = OrderedDict()
    rapor_doldurma = []
    for kok in sorted(ham):
        alan_adi = alan_adlari[kok]
        db[kok] = OrderedDict()
        for g in GRADES:
            kaynak_kok = kok
            kayitlar = ham[kok].get(g, [])
            if not kayitlar:
                for alt in sorted(esdeger.get(kok, [])):
                    if ham.get(alt, {}).get(g):
                        kayitlar = ham[alt][g]
                        kaynak_kok = alt
                        rapor_doldurma.append((kok, g, alt))
                        break
            if not kayitlar:
                continue

            cizelgeler = []
            for rec in sorted(kayitlar, key=lambda r: sayfa_no(r.get("kaynak_sayfa"))):
                prog = rec.get("program_turu")
                ad = alan_adlari.get(kaynak_kok, alan_adi)
                if prog in ("AMP", "ATP"):
                    cizelgeler.append(kayit_to_cizelge(rec, ad, prog))
                else:
                    # Kaynak tabloda program ayrimi yok -> ikisi icin de gecerli.
                    cizelgeler.append(kayit_to_cizelge(rec, ad, "AMP"))
                    cizelgeler.append(kayit_to_cizelge(rec, ad, "ATP"))
            # AMP kayitlari once gelsin: eslestirici puan esitliginde ILK
            # bulduğunu secer; AMP okul icin AMP, ATP okul icin ATP kalir.
            cizelgeler.sort(key=lambda c: (0 if c["program"] == "AMP" else 1,
                                           1 if c["varyant"] else 0,
                                           c["page"]))
            db[kok][g] = cizelgeler

        if not db[kok]:
            del db[kok]

    # --- eski dosyadaki bosluklar: DEVRALINMAZ --------------------------------
    # Eski dosyada bizde karsiligi olmayan (alan, sinif) hucrelerinin tamami
    # BASKA BIR ALANIN mufredatiyla doldurulmustu (dogrulandi 2026-08-22):
    #     dogugastro/marmaragastro 10-12  -> Yiyecek Icecek Hizmetleri verisi
    #     endkalite 11-12                 -> Makine ve Tasarim Teknolojisi verisi
    #     yapayzeka 11-12                 -> Bilisim Teknolojileri verisi
    # Bunlar MEB'in henuz cerceve programini yayimlamadigi YENI alanlardir;
    # komsu PDF'ten dolan veri sessiz ve buyuk bir norm hatasi uretir.
    # Dolayisiyla devralmiyoruz, yalnizca raporluyoruz.
    bosluklar = []
    if os.path.exists(OUT_FILE):
        with open(OUT_FILE, encoding="utf-8") as f:
            eski_metin = f.read()
        try:
            eski = json.loads(eski_metin[eski_metin.index("{"):eski_metin.rindex("}") + 1])
        except ValueError:
            eski = {}
        for kok, siniflar in eski.items():
            for g, lst in (siniflar or {}).items():
                if not lst:
                    continue
                if kok in db and g in db[kok]:
                    continue
                bosluklar.append((kok, g, len(lst)))

    db = OrderedDict(sorted(db.items()))
    for kok in db:
        db[kok] = OrderedDict(sorted(db[kok].items(), key=lambda kv: int(kv[0])))

    govde = json.dumps(db, ensure_ascii=False, indent=2)
    with open(OUT_FILE, "w", encoding="utf-8", newline="\n") as f:
        f.write("// OTOMATIK URETILDI - tools/rebuild_curriculum_db.py\n")
        f.write("// Kaynak: data/kaynak_cizelgeler/mtegm/sinif_{9,10,11,12}.json\n")
        f.write("// ELLE DUZENLEMEYIN. Kaynak JSON'u duzeltip ureticiyi yeniden calistirin.\n")
        f.write("export const STRICT_PDF_CURRICULUM_DB = ")
        f.write(govde)
        f.write(";\n")

    # ------------------------------- rapor ----------------------------------
    top_cizelge = sum(len(v) for s in db.values() for v in s.values())
    top_ders = sum(len(c["courses"]) for s in db.values() for v in s.values() for c in v)
    print("=" * 68)
    print("strict_pdf_curriculum_db.js yeniden uretildi")
    print("=" * 68)
    print("  alan anahtari      : %d" % len(db))
    print("  cizelge            : %d" % top_cizelge)
    print("  ders satiri        : %d" % top_ders)
    print("  atlanan ek tablo   : %d  (tablo_turu / dal_adi yok)" % atlanan_tablo)
    print("  isletmede mes.eg.  : %d satir  (ders yuku disi, koordinatorluk)"
          % len(ISLETME_SATIRLARI))
    print("  dosya boyutu       : %.2f MB" % (os.path.getsize(OUT_FILE) / 1048576.0))
    if rapor_doldurma:
        print("\n  ALAN ADI DEGISIKLIGI NEDENIYLE DOLDURULAN SINIFLAR:")
        for kok, g, alt in rapor_doldurma:
            print("    %-30s %2s. sinif  <-  %s" % (kok, g, alt))
    if bosluklar:
        print("\n  ESKI DOSYADA VARDI, ARTIK YOK (kasitli - baska alanin verisiydi):")
        for kok, g, n in bosluklar:
            print("    %-30s %2s. sinif  (eskiden %d hatali cizelge)" % (kok, g, n))

    # --------------------------- dogrulama ----------------------------------
    hata = 0
    for kok, siniflar in db.items():
        for g, lst in siniflar.items():
            for c in lst:
                t = c.get("title", "").upper().replace("İ", "I")
                amp = "ANADOLU MESLEK PROGRAMI" in t
                atp = "ANADOLU TEKNIK PROGRAMI" in t
                if amp == atp:
                    hata += 1
                    if hata <= 5:
                        print("  ! BASLIK BELIRSIZ:", kok, g, c.get("title")[:80])
    print("\n  AMP/ATP filtre testi : %s (%d belirsiz baslik)"
          % ("GECTI" if hata == 0 else "KALDI", hata))
    return 0 if hata == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

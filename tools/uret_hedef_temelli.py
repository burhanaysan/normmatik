# -*- coding: utf-8 -*-
"""
NormMatik™ — "Hedef Temelli Destek Eğitimi" kapsam listesi üreteci
==============================================================================
NE ÜRETİR: js/hedef_temelli_dersler.js -> const HEDEF_TEMELLI

NEDEN VAR
    12. sınıf çizelgelerinde "Hedef Temelli Destek Eğitimi" dersi 3/4/5/6 saat
    seçenekli olarak yer alır ve çizelgenin açıklaması şöyle der:

      "Hedef temelli destek eğitimi ... öğrenci seçimine bağlı olarak OKUL
       İDARELERİNCE planlamanın yapılacağı derstir. ... içeriğinde Türk dili ve
       edebiyatı, fizik, kimya, biyoloji, tarih, coğrafya, felsefe, matematik,
       sosyoloji, psikoloji, mantık, birinci yabancı dil, çağdaş Türk ve dünya
       tarihi, T.C. inkılap tarihi ve Atatürkçülük, din kültürü ve ahlak
       bilgisi ile Türk kültür ve medeniyeti tarihi derslerinden DERS BAŞINA
       EN AZ 1, EN FAZLA 3 SAAT verilerek ... program uygulanır."

    Yani şubenin 3-6 saatlik hakkı, bu listeden seçilen derslere PAYLAŞTIRILIR.
    Okul müdürü bildirimi (28.08.2026) ve teyidi: 3 saat, üç ayrı branşa 1'er
    saat verilerek kullanılıyor; okulun toplam yükü 3 saat olarak kalıyor
    (çarpılmıyor).

    Uygulamada bu ders bugüne kadar "Hedef Temelli Destek Eğitimi" adında
    SAHTE BİR BRANŞA yazılıyordu. Böyle bir öğretmen branşı yok; saatler
    hiçbir öğretmenin yüküne sayılmıyordu.

KAYNAK — TASLAK OLMAYAN BELGE
    Hüküm, Özel Program Sosyal Bilimler çizelgesinde de geçiyor ama O BELGE
    TASLAK damgalıdır. Bu yüzden liste, damgasız iki belgeden okunur:
        spor_lisesi_haftalik_ders_cizelgesi.pdf
        ozel_program_uygulayan_fen_lisesi_haftalik_ders_cizelgesi.pdf
    İkisinin metni birebir aynıdır; üreteç ikisini KARŞILAŞTIRIR ve
    uyuşmazlarsa yazmaz.

    NOT: Belgelerde ifade iki türlü geçiyor — "kapsamında" ve "içeriğinde".
    Yalnızca birini aramak, hükmü taşıyan belgelerin çoğunu kaçırır; ilk
    taramada tam olarak bu oldu ve hüküm yalnızca taslak belgede sanıldı.

KULLANIM
    python -X utf8 tools/uret_hedef_temelli.py
==============================================================================
"""

import io
import os
import re
import sys

try:
    import fitz  # PyMuPDF
except ImportError:
    raise SystemExit("HATA: PyMuPDF (fitz) gerekli.")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_KOK = os.path.join(os.path.expanduser("~"), "Desktop",
                       "03_meb_mevzuat_ve_cizelgeler", "ogm_anadolu_ve_fen")
CIKTI = os.path.join(BASE_DIR, "js", "hedef_temelli_dersler.js")

KAYNAKLAR = [
    "spor_lisesi_haftalik_ders_cizelgesi.pdf",
    "ozel_program_uygulayan_fen_lisesi_haftalik_ders_cizelgesi.pdf",
]

# Cümlenin başı ve sonu. Ders listesi ikisinin arasındadır.
BAS = re.compile(r"hedef temelli destek eğitimi\s+(?:içeriğinde|kapsamında)",
                 re.IGNORECASE)
SON = re.compile(r"derslerinden\s+ders\s+başına", re.IGNORECASE)
SAAT = re.compile(r"ders\s+başına\s+en\s+az\s+(\d+)[,\s]+en\s+fazla\s+(\d+)\s+saat",
                  re.IGNORECASE)


def tr_kucuk(s):
    return "".join({"İ": "i", "I": "i"}.get(c, c) for c in s).lower()


def pdf_metni(yol):
    d = fitz.open(yol)
    tam = " ".join(s.get_text() for s in d)
    d.close()
    return re.sub(r"\s+", " ", tam)


def listeyi_cikar(metin):
    """Cümledeki ders adlarını ve saat sınırlarını döndürür."""
    kucuk = tr_kucuk(metin)
    m1 = BAS.search(kucuk)
    if not m1:
        return None, None
    m2 = SON.search(kucuk, m1.end())
    if not m2:
        return None, None

    ham = metin[m1.end():m2.start()]
    # "... bilgisi ile Türk kültür ve medeniyeti tarihi" -> son öge "ile" ile bağlı
    ham = re.sub(r"\s+ile\s+", ", ", ham)
    adlar = [x.strip(" ,.") for x in ham.split(",")]
    adlar = [re.sub(r"\s+", " ", a) for a in adlar if len(a.strip(" ,.")) > 2]

    ms = SAAT.search(kucuk)
    sinir = (int(ms.group(1)), int(ms.group(2))) if ms else None
    return adlar, sinir


def main():
    sonuclar = []
    for f in KAYNAKLAR:
        yol = os.path.join(PDF_KOK, f)
        if not os.path.exists(yol):
            print("  ! kaynak yok: %s" % f)
            continue
        adlar, sinir = listeyi_cikar(pdf_metni(yol))
        if not adlar:
            print("  ! hüküm bulunamadı: %s" % f)
            continue
        sonuclar.append((f, adlar, sinir))

    if len(sonuclar) < 2:
        raise SystemExit(
            "HATA: hukum en az IKI damgasiz belgeden okunamadi (%d bulundu). "
            "Tek belgeye dayanmiyoruz; yazmiyorum." % len(sonuclar))

    # İKİ BELGE KARŞILAŞTIRMASI
    # Aynı hükmü iki ayrı çizelgeden okuyup karşılaştırmak, ayrıştırma
    # hatasına karşı en ucuz korumadır: bir belgede kayan bir kelime,
    # diğerinde kaymaz.
    a_ad = [tr_kucuk(x) for x in sonuclar[0][1]]
    b_ad = [tr_kucuk(x) for x in sonuclar[1][1]]
    if a_ad != b_ad:
        print("  ! LİSTELER UYUŞMUYOR")
        print("    %s: %s" % (sonuclar[0][0][:34], sonuclar[0][1]))
        print("    %s: %s" % (sonuclar[1][0][:34], sonuclar[1][1]))
        raise SystemExit("HATA: iki belge ayni listeyi vermiyor; yazmiyorum.")
    if sonuclar[0][2] != sonuclar[1][2]:
        raise SystemExit("HATA: saat sinirlari uyusmuyor: %r / %r"
                         % (sonuclar[0][2], sonuclar[1][2]))

    adlar, sinir = sonuclar[0][1], sonuclar[0][2]
    if len(adlar) < 12 or not sinir:
        raise SystemExit("HATA: %d ders / sinir %r okundu; beklenen >=12 ve (1,3)."
                         % (len(adlar), sinir))

    satirlar = []
    satirlar.append("/* ===========================================================================")
    satirlar.append("   OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN")
    satirlar.append("   Üreteç : tools/uret_hedef_temelli.py")
    satirlar.append("   Kaynak : TTKB haftalık ders çizelgeleri (taslak DAMGASIZ iki belge)")
    for f, _, _ in sonuclar:
        satirlar.append("            " + f)
    satirlar.append("")
    satirlar.append("   12. sınıf \"Hedef Temelli Destek Eğitimi\" dersinin kapsamı.")
    satirlar.append("   Şubenin 3-6 saatlik hakkı, aşağıdaki derslere PAYLAŞTIRILIR;")
    satirlar.append("   ders başına en az %d, en fazla %d saat verilir." % sinir)
    satirlar.append("   Toplam çarpılmaz: 3 saat üç branşa 1'er saat olarak dağıtılırsa")
    satirlar.append("   okulun yükü yine 3 saattir (okul müdürü teyidi, 28.08.2026).")
    satirlar.append("   ======================================================================== */")
    satirlar.append("const HEDEF_TEMELLI = {")
    satirlar.append('    dersAdi: "Hedef Temelli Destek Eğitimi",')
    satirlar.append("    enAzSaat: %d," % sinir[0])
    satirlar.append("    enFazlaSaat: %d," % sinir[1])
    satirlar.append("    kapsamDersleri: [")
    for a in adlar:
        satirlar.append('        "%s",' % a.replace('"', '\\"'))
    satirlar.append("    ]")
    satirlar.append("};")
    satirlar.append("")

    with io.open(CIKTI, "w", encoding="utf-8") as f:
        f.write("\n".join(satirlar))

    print("Hedef Temelli Destek Eğitimi — kapsam listesi")
    print("=" * 66)
    for i, a in enumerate(adlar, 1):
        print("  %2d. %s" % (i, a))
    print("-" * 66)
    print("  ders başına: en az %d, en fazla %d saat" % sinir)
    print("  doğrulama  : %d belge, listeler birebir aynı" % len(sonuclar))
    print("  çıktı      : %s" % CIKTI)
    print()
    print("  UNUTMAYIN: build_bundle.py listesine ekleyin ve paketi yenileyin.")


if __name__ == "__main__":
    if not os.path.isdir(PDF_KOK):
        print("HATA: PDF klasoru yok: %s" % PDF_KOK)
        sys.exit(1)
    main()

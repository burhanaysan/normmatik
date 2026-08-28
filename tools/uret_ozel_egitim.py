# -*- coding: utf-8 -*-
"""
NormMatik™ — Özel eğitim haftalık ders çizelgeleri üreteci
==============================================================================
NE ÜRETİR
    data/kaynak_cizelgeler/ozel_egitim/*.json   (resmî PDF'ten çıkarılmış veri)

NEDEN VAR
    Özel eğitim müfredatı 28.08.2026'ya kadar curriculumEngine.js içinde
    ELLE YAZILMIŞ 8 dersti ve hiçbir resmî çizelgeden üretilmemişti. Resmî
    çizelgeyle karşılaştırıldığında yanlış olduğu görüldü:

        elle yazılan                        resmî çizelge
        ------------------------------      -----------------------------
        Din Kültürü 2 saat                  1 saat
        "Görsel Sanatlar ve Müzik" tek       Görsel Sanatlar + Müzik AYRI
        ders, 2 saat                         (9-10'da 2+2, 11-12'de 1+1)
        Beden Eğitimi sabit 2                2/2/1/1
        Rehberlik 2 saat                     1 saat
        (yok)                                Sosyal, Kültürel ve Sportif
                                             Faaliyetler 3 saat (11-12)

    Hatalar birbirini götürdüğü için TOPLAM yine 30 saat çıkıyordu; okul
    toplamı doğru görünüyor, branş dağılımı yanlış oluyordu. Müzik
    öğretmeninin yükü hiç görünmüyordu.

KAYNAK
    https://orgm.meb.gov.tr/www/haftalik-ders-cizelgeleri/icerik/3106
    (Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü, 27.08.2026 güncel)
    İndirilen PDF'ler: 03_meb_mevzuat_ve_cizelgeler/orgm_ozel_egitim/

YÖNTEM
    Değerler, PDF'in kendi koordinatlarından okunur ve SINIF BAŞLIKLARININ
    altına hizalanır. Okuma sırasına güvenilmez: "Beden Eğitimi ve Oyun
    4 4 4 1" satırında hangi değerin hangi sınıfa ait olduğu ancak x
    konumundan anlaşılır.

KULLANIM
    python -X utf8 tools/uret_ozel_egitim.py
==============================================================================
"""

import io
import json
import os
import re
import sys

try:
    import fitz  # PyMuPDF
except ImportError:
    raise SystemExit("HATA: PyMuPDF (fitz) gerekli.")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_KOK = os.path.join(os.path.expanduser("~"), "Desktop",
                       "03_meb_mevzuat_ve_cizelgeler", "orgm_ozel_egitim")
CIKTI_KOK = os.path.join(BASE_DIR, "data", "kaynak_cizelgeler", "ozel_egitim")


def metni_duzelt(s):
    """PDF font kusurlarını onarır.

    Bu belgelerde büyük İ harfi 'Ġ' (U+0120) olarak gömülmüş: 'SEÇMELĠ',
    'Ġnsan'. Düzeltilmezse ders adları bozuk kaydedilir ve hiçbir eşleştirme
    tutmaz.
    """
    return (s.replace("Ġ", "İ").replace("ġ", "ı")
             .replace("Ģ", "Ş").replace("ģ", "ş")
             .replace("Ğ", "Ğ"))


def yatay_parcalar(sayfa):
    """Eksen dışı (filigran) metni eleyerek yatay metin parçalarını döndürür."""
    par, egik = [], 0
    for blok in sayfa.get_text("dict")["blocks"]:
        for satir in blok.get("lines", []):
            dx, dy = satir.get("dir", (1, 0))
            if not (abs(dx) > .99 and abs(dy) < .01):
                egik += 1
                continue
            for sp in satir["spans"]:
                t = metni_duzelt(sp["text"]).strip()
                if t:
                    par.append({
                        "x0": sp["bbox"][0], "x1": sp["bbox"][2],
                        "ym": (sp["bbox"][1] + sp["bbox"][3]) / 2,
                        "t": t,
                    })
    return par, egik


def sinif_sutunlari(par, siniflar):
    """Sınıf başlıklarını bulur, x merkezlerini döndürür: [(merkez, '9'), ...]"""
    adaylar = [p for p in par if p["t"] in siniflar]
    if not adaylar:
        return []
    # En üstteki, TAM SAYIDA başlık içeren satır
    for aday in sorted(adaylar, key=lambda p: p["ym"]):
        satir = [p for p in adaylar if abs(p["ym"] - aday["ym"]) < 4]
        adlar = [p["t"] for p in sorted(satir, key=lambda p: p["x0"])]
        if adlar == siniflar:
            return [((p["x0"] + p["x1"]) / 2, p["t"])
                    for p in sorted(satir, key=lambda p: p["x0"])]
    return []


def satirlari_kur(par, tolerans=6.0):
    """Aynı yatay banttaki parçaları gruplar.

    TOLERANS NEDEN 6: Bu belgede ders ADI ile SAAT DEĞERLERİ farklı taban
    çizgilerinde duruyor ve fark 3,6 puntoya kadar çıkıyor (Türkçe 154,72 /
    158,08; Beden Eğitimi 271,12 / 274,72). İlk denemede tolerans 3,0'dı ve
    bu satırlar ikiye bölündüğü için 10 dersin yalnızca 3'ü okunabildi.
    Satır aralığı ~18-21 punto olduğundan 6 hem yeterli hem güvenli.

    Yanlışlıkla iki satırın birleşmesi, aşağıdaki TOPLAM DENETİMİNDE
    yakalanır: ders saatleri toplamı çizelgenin kendi toplam satırını
    tutmazsa dosya yazılmaz.
    """
    satirlar = []
    for p in sorted(par, key=lambda p: (p["ym"], p["x0"])):
        for s in satirlar:
            if abs(s["ym"] - p["ym"]) < tolerans:
                s["p"].append(p)
                s["ym"] = (s["ym"] * (len(s["p"]) - 1) + p["ym"]) / len(s["p"])
                break
        else:
            satirlar.append({"ym": p["ym"], "p": [p]})
    return satirlar


def cizelge_oku(pdf_yolu, sayfa_no, siniflar):
    d = fitz.open(pdf_yolu)
    par, egik = yatay_parcalar(d[sayfa_no])
    sut = sinif_sutunlari(par, siniflar)
    if len(sut) != len(siniflar):
        d.close()
        raise SystemExit(
            "HATA: %s sayfa %d -> sinif basligi satiri bulunamadi (beklenen %s)"
            % (os.path.basename(pdf_yolu), sayfa_no + 1, siniflar))

    genislik = min(sut[i + 1][0] - sut[i][0] for i in range(len(sut) - 1))
    sol_sinir = sut[0][0] - genislik * .6
    ust = min(p["ym"] for p in par if p["t"] in siniflar)

    kayitlar = []
    for s in satirlari_kur(par):
        if s["ym"] <= ust + 4:
            continue                      # başlık satırı ve üstü
        etiket, saatler = [], {}
        for p in sorted(s["p"], key=lambda p: p["x0"]):
            xm = (p["x0"] + p["x1"]) / 2
            if xm < sol_sinir:
                etiket.append(p["t"])
                continue
            for cx, ad in sut:
                if abs(xm - cx) < genislik * .45:
                    saatler[ad] = p["t"]
                    break
        ad = re.sub(r"\s+", " ", " ".join(etiket)).strip()
        if ad and saatler:
            kayitlar.append({"ders_adi": ad, "ham_saatler": saatler})
    d.close()
    return kayitlar, egik


def saat_cevir(ham):
    """'2' -> {sabit,2} ; '(1)(2)' -> {secenekli,[1,2]} ; '-' -> None"""
    h = (ham or "").strip()
    if not h or h == "-":
        return None
    secenekler = re.findall(r"\((\d+)\)", h)
    if secenekler:
        return {"tip": "secenekli", "secenekler": [int(x) for x in secenekler]}
    if re.fullmatch(r"\d+", h):
        return {"tip": "sabit", "saat": int(h)}
    return None                            # sayı değil; tablo dışı metin


def json_yaz(ad, veri):
    if not os.path.isdir(CIKTI_KOK):
        os.makedirs(CIKTI_KOK)
    yol = os.path.join(CIKTI_KOK, ad)
    with io.open(yol, "w", encoding="utf-8") as f:
        f.write(json.dumps(veri, ensure_ascii=False, indent=1))
    return yol


def meslek_okulu():
    pdf = os.path.join(PDF_KOK, "meslek_okulu_hafif_zihinsel_otizm.pdf")
    kayitlar, egik = cizelge_oku(pdf, 0, ["9", "10", "11", "12"])

    dersler, toplam = [], None
    for k in kayitlar:
        ad = k["ders_adi"]
        adk = ad.replace("İ", "i").replace("I", "i").lower()
        saatler = {s: saat_cevir(v) for s, v in k["ham_saatler"].items()}
        if not any(saatler.values()):
            continue
        if "toplam" in adk:
            toplam = {s: (v or {}).get("saat") for s, v in saatler.items()}
            continue
        if len(ad) > 60:                   # açıklama paragrafı, ders değil
            continue
        dersler.append({"ders_adi": ad, "saatler": saatler})

    return {
        "belge_adi": "Özel Eğitim Meslek Okulu Haftalık Ders Çizelgesi "
                     "(Hafif Düzeyde Zihinsel Yetersizliği/Otizmi Olan Öğrenciler İçin)",
        "kaynak": "https://orgm.meb.gov.tr/www/haftalik-ders-cizelgeleri/icerik/3106",
        "kaynak_pdf": os.path.basename(pdf),
        "uretim_notu": "ELLE DÜZENLEMEYİN. tools/uret_ozel_egitim.py üretir.",
        "sinif_seviyeleri": ["9", "10", "11", "12"],
        "atilan_egik_satir": egik,
        "dersler": dersler,
        "cizelge_toplami": toplam,
    }


def ilkokul_ortaokul():
    """Özel Eğitim İlkokulları ve Ortaokulları (1-8. sınıf).

    Uygulamada ilkokul yok; yine de çizelgenin TAMAMI çıkarılır. Yalnızca
    ortaokul sütunlarını almak, toplam denetimini imkânsız kılardı: çizelgenin
    kendi TOPLAM satırı sekiz sınıfın hepsini veriyor.
    """
    pdf = os.path.join(PDF_KOK, "ilkokul_ortaokul_hafif_zihinsel_otizm.pdf")
    siniflar = ["1", "2", "3", "4", "5", "6", "7", "8"]
    kayitlar, egik = cizelge_oku(pdf, 1, siniflar)

    zorunlu, secmeli, toplam = [], [], None
    bolum = "zorunlu"
    for k in kayitlar:
        ad = k["ders_adi"]
        adk = ad.replace("İ", "i").replace("I", "i").lower()
        saatler = {s: saat_cevir(v) for s, v in k["ham_saatler"].items()}

        if "secmeli dersler" in adk.replace("ç", "c"):
            bolum = "secmeli"
            continue
        if "zorunlu ders toplami" in adk.replace("ç", "c"):
            toplam = {s: (v or {}).get("saat") for s, v in saatler.items()}
            bolum = "secmeli"
            continue
        if not any(saatler.values()) or len(ad) > 70:
            continue
        (zorunlu if bolum == "zorunlu" else secmeli).append(
            {"ders_adi": ad, "saatler": saatler})

    return {
        "belge_adi": "Özel Eğitim İlkokulları ve Ortaokulları Haftalık Ders Çizelgesi "
                     "(Hafif Düzeyde Zihinsel Yetersizliği/Otizm Spektrum Bozukluğu "
                     "Olan Öğrenciler İçin)",
        "kaynak": "https://orgm.meb.gov.tr/www/haftalik-ders-cizelgeleri/icerik/3106",
        "kaynak_pdf": os.path.basename(pdf),
        "uretim_notu": "ELLE DÜZENLEMEYİN. tools/uret_ozel_egitim.py üretir.",
        "sinif_seviyeleri": siniflar,
        "atilan_egik_satir": egik,
        "dersler": zorunlu,
        "secmeli_dersler": secmeli,
        "cizelge_toplami": toplam,
    }


def toplam_denetle(veri):
    """Ders saatleri toplamı, çizelgenin kendi TOPLAM satırını tutuyor mu?

    Tutmuyorsa bir satır kaçmış ya da yanlış sütuna düşmüştür. Sessizce eksik
    veri yazmak, bu projede en pahalı hata sınıfı.
    """
    hatalar = []
    for sinif in veri["sinif_seviyeleri"]:
        t = 0
        for d in veri["dersler"]:
            s = d["saatler"].get(sinif)
            if not s:
                continue
            t += s["saat"] if s["tip"] == "sabit" else max(s["secenekler"])
        bek = (veri.get("cizelge_toplami") or {}).get(sinif)
        if bek is not None and t != bek:
            hatalar.append("%s. sinif: dersler toplami %d, cizelge %d" % (sinif, t, bek))
    return hatalar


def yaz_ve_bildir(veri, dosya, baslik, minimum):
    dersler = veri["dersler"]
    if len(dersler) < minimum:
        raise SystemExit("HATA: %s -> yalnizca %d ders okundu (beklenen >=%d); yazmiyorum."
                         % (baslik, len(dersler), minimum))
    siniflar = veri["sinif_seviyeleri"]

    def g(d, s):
        v = d["saatler"].get(s)
        if not v:
            return "-"
        return (str(v["saat"]) if v["tip"] == "sabit"
                else "/".join(str(x) for x in v["secenekler"]))

    print(baslik)
    print("=" * (46 + 5 * len(siniflar)))
    print("  %-42s %s" % ("DERS", " ".join(s.rjust(4) for s in siniflar)))
    print("-" * (46 + 5 * len(siniflar)))
    for d in dersler:
        print("  %-42s %s" % (d["ders_adi"][:42],
                              " ".join(g(d, s).rjust(4) for s in siniflar)))
    print("-" * (46 + 5 * len(siniflar)))
    print("  çizelge toplamı: %s" % veri.get("cizelge_toplami"))
    if veri.get("secmeli_dersler") is not None:
        print("  seçmeli ders sayısı: %d" % len(veri["secmeli_dersler"]))
    print("  atılan eğik (filigran) satır: %d" % veri["atilan_egik_satir"])

    hatalar = toplam_denetle(veri)
    if hatalar:
        print()
        for h in hatalar:
            print("  ! TOPLAM TUTMUYOR -> %s" % h)
        raise SystemExit("HATA: %s -> cizelge toplami tutmuyor; yazmiyorum." % baslik)

    print("  yazıldı: %s" % json_yaz(dosya, veri))
    print()


# --------------------------------------------------------------------------
# BRANŞ ATAMALARI
#
# Meslek okulu çizelgesinin KENDİ AÇIKLAMALARI branşı söylüyor:
#   Madde 1: "Türkçe, Matematik, Sosyal Hayat dersleri özel eğitim öğretmeni
#            tarafından okutulur."
#   Madde 3: "Rehberlik dersi, özel eğitim öğretmeni tarafından okutulur.
#            Sosyal, Kültürel ve Sportif Faaliyetler dersi ... özel yetenek
#            gerektiren faaliyetlerin seçilmesi durumunda branş öğretmenleri
#            tarafından okutulur."
# Adı geçmeyen dersler (Din Kültürü, Müzik, Görsel Sanatlar, Beden Eğitimi)
# kendi branşlarına atanır.
#
# İLKOKUL/ORTAOKUL çizelgesi branş kuralı VERMİYOR. Bu yüzden dersler kendi
# branşlarına atanır; uydurma yapılmaz. İdareci her dersin branşını zaten
# değiştirebiliyor (kullanıcı kararı: "sorumluluk idarecide").
MESLEK_OKULU_BRANS = {
    "türkçe": "Özel Eğitim",
    "matematik": "Özel Eğitim",
    "sosyal hayat": "Özel Eğitim",
    "rehberlik": "Özel Eğitim",
    "sosyal, kültürel ve sportif faaliyetler": "Özel Eğitim",
    "iş eğitimi ve meslek ahlakı": "Özel Eğitim",
    "din kültürü ve ahlak bilgisi": "Din Kültürü ve Ahlak Bilgisi",
    "müzik": "Müzik",
    "görsel sanatlar": "Görsel Sanatlar",
    "beden eğitimi": "Beden Eğitimi",
}

GENEL_BRANS = {
    "türkçe": "Türkçe",
    "matematik": "Matematik",
    "hayat bilgisi": "Sınıf Öğretmenliği",
    "fen bilimleri": "Fen Bilimleri",
    "sosyal bilgiler": "Sosyal Bilgiler",
    "t.c. inkılâp tarihi ve atatürkçülük": "T.C. İnkılap Tarihi ve Atatürkçülük",
    "din kültürü ve ahlak bilgisi": "Din Kültürü ve Ahlak Bilgisi",
    "görsel sanatlar": "Görsel Sanatlar",
    "müzik": "Müzik",
    "beden eğitimi ve oyun": "Beden Eğitimi",
    "beden eğitimi ve spor": "Beden Eğitimi",
    "toplumsal uyum becerileri": "Özel Eğitim",
    "teknoloji ve tasarım": "Teknoloji ve Tasarım",
    "trafik güvenliği": "Sınıf Öğretmenliği",
    "bilişim teknolojileri ve yazılım": "Bilişim Teknolojileri",
    "rehberlik ve yönlendirme": "Rehberlik",
    "insan hakları, vatandaşlık ve demokrasi": "Sosyal Bilgiler",
}

# 15 saatlik İş Eğitimi ve Meslek Ahlakı, atölye niteliğindedir (Madde 7:
# haftada üç gün işletmede). normEngine atölye derslerini ayrı sayar.
ATOLYE_DERSLERI = {"iş eğitimi ve meslek ahlakı"}


def brans_bul(ders_adi, tablo):
    k = ders_adi.replace("İ", "i").replace("I", "ı").lower().strip()
    return tablo.get(k, "Özel Eğitim")


def js_yaz(meslek, ilk_orta):
    """js/ozel_egitim_cizelgeleri.js üretir."""
    def dersleri_cikar(veri, brans_tablosu):
        cikti = {}
        for sinif in veri["sinif_seviyeleri"]:
            liste = []
            for d in veri["dersler"]:
                s = d["saatler"].get(sinif)
                if not s:
                    continue
                saat = s["saat"] if s["tip"] == "sabit" else max(s["secenekler"])
                k = d["ders_adi"].replace("İ", "i").replace("I", "ı").lower().strip()
                liste.append({
                    "ders": d["ders_adi"],
                    "saat": saat,
                    "atananBrans": brans_bul(d["ders_adi"], brans_tablosu),
                    "kategori": "ORTAK DERSLER",
                    "baraj_ders": False,
                    "isAtolye": k in ATOLYE_DERSLERI,
                })
            if liste:
                cikti[sinif] = liste
        return cikti

    tablolar = {
        "meslek_okulu": dersleri_cikar(meslek, MESLEK_OKULU_BRANS),
        "ilkokul_ortaokul": dersleri_cikar(ilk_orta, GENEL_BRANS),
    }

    s = []
    s.append("/* ===========================================================================")
    s.append("   OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN")
    s.append("   Üreteç : tools/uret_ozel_egitim.py")
    s.append("   Kaynak : ORGM resmî haftalık ders çizelgeleri (27.08.2026)")
    s.append("            https://orgm.meb.gov.tr/www/haftalik-ders-cizelgeleri/icerik/3106")
    s.append("")
    s.append("   Özel eğitim müfredatı 28.08.2026'ya kadar curriculumEngine.js içinde")
    s.append("   ELLE YAZILMIŞ 8 dersti ve hiçbir resmî çizelgeden üretilmemişti.")
    s.append("   Yanlışları birbirini götürdüğü için TOPLAM 30 saat çıkıyor, okul")
    s.append("   toplamı doğru görünüyordu; branş dağılımı ise yanlıştı — Müzik")
    s.append("   öğretmeninin yükü hiç görünmüyordu.")
    s.append("")
    s.append("   Yapı: OZEL_EGITIM_CIZELGELERI[çizelge][sınıf] = [ ders kayıtları ]")
    s.append("     meslek_okulu      -> 9-12. sınıf (Özel Eğitim Meslek Okulu)")
    s.append("     ilkokul_ortaokul  -> 1-8. sınıf")
    s.append("   ======================================================================== */")
    s.append("const OZEL_EGITIM_CIZELGELERI = {")
    adlar = list(tablolar.keys())
    for ti, tad in enumerate(adlar):
        s.append('    "%s": {' % tad)
        siniflar = list(tablolar[tad].keys())
        for si, sinif in enumerate(siniflar):
            s.append('        "%s": [   // %d ders' % (sinif, len(tablolar[tad][sinif])))
            for d in tablolar[tad][sinif]:
                s.append('            { ders: %s, saat: %d, atananBrans: %s, '
                         'kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: %s },'
                         % (json.dumps(d["ders"], ensure_ascii=False), d["saat"],
                            json.dumps(d["atananBrans"], ensure_ascii=False),
                            "true" if d["isAtolye"] else "false"))
            s.append("        ]%s" % ("," if si < len(siniflar) - 1 else ""))
        s.append("    }%s" % ("," if ti < len(adlar) - 1 else ""))
    s.append("};")
    s.append("")

    yol = os.path.join(BASE_DIR, "js", "ozel_egitim_cizelgeleri.js")
    with io.open(yol, "w", encoding="utf-8") as f:
        f.write("\n".join(s))
    return yol, tablolar


def main():
    meslek = meslek_okulu()
    ilk_orta = ilkokul_ortaokul()

    yaz_ve_bildir(meslek,
                  "meslek_okulu_hafif_zihinsel.json",
                  "Özel Eğitim Meslek Okulu (Hafif Zihinsel/Otizm) — 9-12",
                  minimum=8)
    yaz_ve_bildir(ilk_orta,
                  "ilkokul_ortaokul_hafif_zihinsel.json",
                  "Özel Eğitim İlkokul ve Ortaokul (Hafif Zihinsel/Otizm) — 1-8",
                  minimum=12)

    yol, tablolar = js_yaz(meslek, ilk_orta)
    print("JS tablosu")
    print("=" * 66)
    for tad, t in tablolar.items():
        print("  %-20s %d sınıf, %d ders kaydı"
              % (tad, len(t), sum(len(v) for v in t.values())))
    print("  yazıldı: %s" % yol)
    print()
    print("  UNUTMAYIN: build_bundle.py listesine ekleyin ve paketi yenileyin.")


if __name__ == "__main__":
    if not os.path.isdir(PDF_KOK):
        print("HATA: PDF klasoru bulunamadi: %s" % PDF_KOK)
        sys.exit(1)
    main()

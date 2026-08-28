# -*- coding: utf-8 -*-
"""
NormMatik™ — Özel Program Uygulayan Lise çizelgesi üreteci
==============================================================================
NE ÜRETİR
    data/kaynak_cizelgeler/ogm/ozel_program_<tur>.json

NEDEN VAR — ELDEKİ KAYNAK JSON'UN TEMA ATAMASI YANLIŞTI
    Bu okullarda dersler bir TEMAYA bağlıdır (Bilişim Teknolojileri ve
    Yazılım / Havacılık ve Uzay Teknolojileri / Temel Bilimler). Tema adı,
    çizelgede birleştirilmiş bir hücrede ve çoğu zaman İKİ SATIRA bölünmüş
    yazılıdır ("BİLİŞİM TEKNOLOJİLERİ VE" + "YAZILIM").

    Elimizdeki sayi24 JSON'unda tema, etiketin denk geldiği satırdan itibaren
    İLERİ DOĞRU kopyalanmıştı. Sonuç sessizce yanlıştı:

        "HAVACILIK VE UZAYIN TEMELLERİ"  -> Yazılım teması (yanlış)
        "FİZİK/KİMYA/BİYOLOJİ LABORATUVARI" -> Havacılık teması (yanlış)

    Ayrıca tema adları iki ayrı tema sanılmıştı ("BİLİŞİM TEKNOLOJİLERİ VE"
    diye bir tema yok).

    Bu üreteç tema sınırlarını TAHMİN ETMEZ: PDF'in kendi TABLO ÇİZGİLERİNİ
    okur. Tema sütununu boydan boya kesen yatay çizgiler, birleştirilmiş
    hücrelerin gerçek sınırlarıdır. Ölçüldü (Fen Lisesi): 177,7 / 198,2 /
    273,5 / 355,6 / 499,2 -> dört hücre, dört tema. Etiket metinlerinin
    dikey ortası da bu hücrelerin içine düşüyor; iki bağımsız işaret uyuşuyor.

SAAT BİÇİMİ
    "3"        -> sabit
    "(2)(3)"   -> seçenekli (2 veya 3 saat)
    "-"        -> o sınıfta okutulmuyor

KULLANIM
    python -X utf8 tools/uret_ozel_program.py            (ekrana döker)
    python -X utf8 tools/uret_ozel_program.py --yaz      (JSON yazar)
==============================================================================
"""

import argparse
import io
import json
import os
import re
import sys

try:
    import fitz
except ImportError:
    print("HATA: PyMuPDF (fitz) gerekli.")
    sys.exit(1)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "tools"))

import uret_ortaogretim_mufredat as temel            # noqa: E402
from uret_ortaogretim_cizelgeleri import (            # noqa: E402
    brans_bul, BRANS_ATANMADI)
PDF_KOK = r"C:\Users\burha\Desktop\03_meb_mevzuat_ve_cizelgeler\ogm_anadolu_ve_fen"
CIKTI_KOK = os.path.join(BASE_DIR, "data", "kaynak_cizelgeler", "ogm")

SINIFLAR = ["hazirlik", "9", "10", "11", "12"]

# Sosyal Bilimler çizelgesi TASLAK damgalı olduğu için BİLEREK dışarıda.
# Kesinleşmiş sürüm gelince buraya bir satır eklemek yeterli.
CIZELGELER = [
    {
        "tur": "ozel_program_fen_lisesi",
        "pdf": "ozel_program_uygulayan_fen_lisesi_haftalik_ders_cizelgesi.pdf",
        "cikti": "ozel_program_fen_lisesi.json",
        "ad": "Özel Program Uygulayan Fen Lisesi Haftalık Ders Çizelgesi",
        "karar": "TTKB Sayı 24, 23/07/2025",
        "sayfa": 1,          # 0 tabanlı: çizelge 2. sayfada
        "tema_sayisi": 4,    # ORTAK TEMATİK + 3 tema
        "gelisim_grup_sayisi": 4,
    },
]


# --------------------------------------------------------------------------
def parcalari_oku(sayfa):
    """Sayfadaki metin parçalarını (x0, x1, y_orta, metin, dikey_mi) verir."""
    parcalar = []
    egik = 0
    for blok in sayfa.get_text("dict")["blocks"]:
        for satir in blok.get("lines", []):
            dx, dy = satir.get("dir", (1, 0))
            yatay = abs(dx) > .99 and abs(dy) < .01
            dikey = abs(dy) > .99 and abs(dx) < .01
            if not (yatay or dikey):
                egik += 1            # filigran ya da döndürülmüş süs metni
                continue
            for sp in satir["spans"]:
                m = sp["text"].strip()
                if m:
                    x0, y0, x1, y1 = sp["bbox"]
                    parcalar.append((x0, x1, (y0 + y1) / 2, m, dikey))
    return parcalar, egik


def yatay_cizgiler(sayfa):
    """Sayfadaki yatay tablo çizgilerini (y, x0, x1) olarak verir."""
    cizgiler = set()
    for ciz in sayfa.get_drawings():
        for oge in ciz["items"]:
            if oge[0] == "l":
                a, b = oge[1], oge[2]
                if abs(a.y - b.y) < 0.6:
                    cizgiler.add((round(a.y, 1), round(min(a.x, b.x)),
                                  round(max(a.x, b.x))))
            elif oge[0] == "re":
                r = oge[1]
                if r.height < 1.5:
                    cizgiler.add((round(r.y0, 1), round(r.x0), round(r.x1)))
    return cizgiler


def sutun_merkezleri(parcalar):
    """Sınıf sütunlarının x merkezlerini başlık satırından bulur."""
    # Başlıkta "HAZIRLIK" ve 9/10/11/12 aynı bantta yazılıdır.
    hazirlik = [p for p in parcalar if p[3] == "HAZIRLIK" and not p[4]]
    if not hazirlik:
        raise SystemExit("!! başlıkta HAZIRLIK sütunu bulunamadı")
    ust_y = hazirlik[0][2]
    rakamlar = [p for p in parcalar
                if re.fullmatch(r"9|10|11|12", p[3]) and not p[4]
                and abs(p[2] - ust_y) < 4]
    if len(rakamlar) != 4:
        raise SystemExit("!! başlıkta 9-12 sütunları bulunamadı: %s"
                         % [p[3] for p in rakamlar])
    merkez = [(hazirlik[0][0] + hazirlik[0][1]) / 2]
    for p in sorted(rakamlar, key=lambda q: q[0]):
        merkez.append((p[0] + p[1]) / 2)
    return merkez


def satirla(parcalar, tolerans=3.0):
    """Parçaları y bandına göre satırlara ayırır."""
    satirlar = []
    for p in sorted(parcalar, key=lambda q: (q[2], q[0])):
        for s in satirlar:
            if abs(s["y"] - p[2]) < tolerans:
                s["p"].append(p)
                break
        else:
            satirlar.append({"y": p[2], "p": [p]})
    return satirlar


def saat_coz(metin):
    """'3' -> sabit; '(2)(3)' -> seçenekli; '-' -> None."""
    if re.fullmatch(r"\d+", metin):
        return {"tip": "sabit", "saat": int(metin)}
    if re.fullmatch(r"(\(\d+\))+", metin):
        return {"tip": "secenekli",
                "secenekler": [int(x) for x in re.findall(r"\d+", metin)]}
    return None


def ders_adini_ayikla(ham):
    """
    Sondaki '(4)' kaç kez seçilebileceğini, '*' ve '******' dipnotu gösterir.
    Ders adı bunlardan arındırılır; kaç kez bilgisi ayrı döner.
    """
    ad = ham.strip()
    ad = re.sub(r"\*+\s*$", "", ad).strip()
    kac_kez = 1
    m = re.search(r"\((\d+)\)\s*$", ad)
    if m:
        kac_kez = int(m.group(1))
        ad = ad[:m.start()].strip()
    ad = re.sub(r"\*+\s*$", "", ad).strip()
    return ad, kac_kez


# --------------------------------------------------------------------------
def cizelgeyi_coz(tanim):
    yol = os.path.join(PDF_KOK, tanim["pdf"])
    if not os.path.exists(yol):
        raise SystemExit("!! PDF bulunamadı: %s" % yol)
    belge = fitz.open(yol)
    sayfa = belge[tanim["sayfa"]]

    parcalar, egik = parcalari_oku(sayfa)
    merkez = sutun_merkezleri(parcalar)
    genislik = min(merkez[i + 1] - merkez[i] for i in range(4))

    def hangi_sutun(x0, x1):
        xm = (x0 + x1) / 2
        for i, m in enumerate(merkez):
            if abs(xm - m) < genislik * .45:
                return i
        return None

    satirlar = satirla(parcalar)

    # --- bölüm sınırları: çizelgenin kendi TOPLAM satırları -----------------
    def toplam_y(anahtar):
        for s in satirlar:
            for p in s["p"]:
                if anahtar in p[3] and not p[4]:
                    return s["y"], s
        return None, None

    y_ortak, s_ortak = toplam_y("ORTAK DERS SAATİ TOPLAMI")
    y_tema, s_tema = toplam_y("TEMATİK ALAN DERS SAATLERİ TOPLAMI")
    y_gel, s_gel = toplam_y("ÇOK YÖNLÜ GELİŞİM DERS SAATLERİ TOPLAMI")
    y_top, s_top = toplam_y("TOPLAM DERS SAATİ")
    if None in (y_ortak, y_tema, y_gel, y_top):
        raise SystemExit("!! bölüm toplam satırları bulunamadı")

    def satir_saatleri(s):
        saat = [None] * 5
        for p in s["p"]:
            c = hangi_sutun(p[0], p[1])
            if c is not None:
                v = saat_coz(p[3])
                if v:
                    saat[c] = v
        return saat

    beklenen = {
        "ortak": satir_saatleri(s_ortak),
        "tematik": satir_saatleri(s_tema),
        "gelisim": satir_saatleri(s_gel),
        "toplam": satir_saatleri(s_top),
    }

    # --- etiket (tema / grup) hücre sınırları: tablo çizgilerinden ----------
    cizgiler = yatay_cizgiler(sayfa)
    # Etiket sütunu x aralığı: ders adları x~100'de, etiketler x 36..98'de.
    etiket_cizgi = sorted(y for y, x0, x1 in cizgiler if x0 <= 40 and x1 >= 95)

    def hucre_sinirlari(bas, son, beklenen_adet, ad):
        # Hücre sınırı YALNIZCA tablo çizgileridir. Bölüm toplam satırının
        # METİN y'sini sınır saymak, çizgiyle metin arasındaki birkaç puntoluk
        # boşluğu sahte bir hücre yapıyordu (ilk denemede 4 yerine 6 çıktı).
        sinir = sorted(y for y in etiket_cizgi if bas - 1 < y < son + 1)
        hucreler = [(sinir[i], sinir[i + 1]) for i in range(len(sinir) - 1)]
        if len(hucreler) != beklenen_adet:
            raise SystemExit(
                "!! %s için %d hücre bekleniyordu, %d bulundu: %s\n"
                "   Tahmin etmektense duruyorum."
                % (ad, beklenen_adet, len(hucreler),
                   [(round(a, 1), round(b, 1)) for a, b in hucreler]))
        return hucreler

    tema_hucre = hucre_sinirlari(y_ortak, y_tema, tanim["tema_sayisi"], "tema")
    gel_hucre = hucre_sinirlari(y_tema, y_gel, tanim["gelisim_grup_sayisi"],
                                "çok yönlü gelişim grubu")

    def hucre_etiketi(bas, son):
        """Hücre içindeki etiket parçalarını (x<98) birleştirir."""
        parca = sorted((p for p in parcalar
                        if bas < p[2] < son and 30 < p[0] < 98 and not p[4]),
                       key=lambda q: q[2])
        return re.sub(r"\s+", " ", " ".join(p[3] for p in parca)).strip()

    # --- ders satırlarını topla --------------------------------------------
    def dersleri_al(bas, son, ad_x_min, ad_x_max):
        cikti = []
        for s in satirlar:
            if not (bas < s["y"] < son):
                continue
            adlar = [p for p in s["p"]
                     if ad_x_min <= p[0] < ad_x_max and not p[4]]
            if not adlar:
                continue
            ham = re.sub(r"\s+", " ",
                         " ".join(p[3] for p in sorted(adlar, key=lambda q: q[0])))
            saat = satir_saatleri(s)
            if not any(saat):
                continue
            ad, kac_kez = ders_adini_ayikla(ham)
            if ad:
                cikti.append({"y": s["y"], "ders_adi": ad,
                              "kac_kez_secilebilir": kac_kez,
                              "saatler": {SINIFLAR[i]: saat[i]
                                          for i in range(5) if saat[i]}})
        return cikti

    # Ortak derslerde etiket sütunu yoktur; ders adı x~35'ten başlar.
    ortak = dersleri_al(0, y_ortak, 30, 98)
    tematik = dersleri_al(y_ortak, y_tema, 98, 140)
    gelisim = dersleri_al(y_tema, y_gel, 98, 140)

    for d in tematik:
        d["tema"] = next((hucre_etiketi(a, b) for a, b in tema_hucre
                          if a < d["y"] < b), "")
    for d in gelisim:
        d["grup"] = next((hucre_etiketi(a, b) for a, b in gel_hucre
                          if a < d["y"] < b), "")

    for d in tematik + gelisim + ortak:
        d.pop("y", None)

    return {
        "belge_adi": tanim["ad"],
        "karar": tanim["karar"],
        "kaynak_pdf": tanim["pdf"],
        "uretim_notu": "ELLE DÜZENLEMEYİN. tools/uret_ozel_program.py üretir.",
        "ortak_dersler": ortak,
        "tematik_alan_dersleri": tematik,
        "cok_yonlu_gelisim_dersleri": gelisim,
        "cizelge_toplamlari": beklenen,
    }, egik


# --------------------------------------------------------------------------
def saat_metni(v):
    if not v:
        return "-"
    return (str(v["saat"]) if v["tip"] == "sabit"
            else "/".join(str(x) for x in v["secenekler"]))


def dogrula(veri):
    """
    Üretilen derslerin sınıf başına toplamı, çizelgenin kendi toplam satırıyla
    tutmalı. Seçenekli saatlerde EN KÜÇÜK seçenek esas alınır — çizelgenin
    toplam satırı asgari yükü gösterir.

    Tematik ve çok yönlü gelişim bölümleri ÖĞRENCİ SEÇİMİNE bağlıdır; oradaki
    toplam, bir öğrencinin alacağı saattir, bütün derslerin toplamı değildir.
    Bu yüzden yalnızca ORTAK DERSLER toplamı denetlenir — denetlenebilecek
    tek bölüm odur.
    """
    uretilen = []
    for i, sinif in enumerate(SINIFLAR):
        t = 0
        for d in veri["ortak_dersler"]:
            v = d["saatler"].get(sinif)
            if not v:
                continue
            t += v["saat"] if v["tip"] == "sabit" else min(v["secenekler"])
        uretilen.append(t)
    beklenen = []
    for i, sinif in enumerate(SINIFLAR):
        v = veri["cizelge_toplamlari"]["ortak"][i]
        beklenen.append(v["saat"] if v and v["tip"] == "sabit"
                        else (min(v["secenekler"]) if v else 0))
    return uretilen, beklenen, uretilen == beklenen


def tema_kimligi(ad):
    """Tema adından kararlı bir kimlik üretir (Bilişim... -> bilisim_...)."""
    a = temel.tr_kucuk(ad)
    a = re.sub(r"[^a-z0-9]+", "_", a).strip("_")
    return a


def js_yaz(veriler, uyarilar):
    """
    js/ozel_program_temalari.js dosyasını yazar.

    YAPI:
      OZEL_PROGRAM_TEMALARI[okul_turu] = {
          temalar: [ {id, ad} ],                 // idarecinin seçeceği liste
          ortak:   { sinif: [ders...] },         // her temada okutulan dersler
          dersler: { tema_id: { sinif: [ders...] } }
      }

    Ortak (temasız) dersler bu dosyada YOKTUR; onlar zaten
    ORTAOGRETIM_CIZELGELERI'nden geliyor ve doğrulandı (19/19 tam).
    Aynı veriyi ikinci kez üretmemek için buraya kopyalanmadı.
    """
    s = []
    s.append("/* ===========================================================================")
    s.append("   OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN")
    s.append("   Üreteç : tools/uret_ozel_program.py")
    s.append("   Kaynak : Özel Program Uygulayan Lise haftalık ders çizelgeleri (TTKB)")
    s.append("")
    s.append("   Bu okullarda dersler bir TEMAYA bağlıdır. Okul temasını seçer;")
    s.append("   şubenin dersleri = ortak dersler + ortak tematik dersler + temanın")
    s.append("   kendi dersleri.")
    s.append("")
    s.append("   Tema sınırları PDF'in kendi tablo çizgilerinden okunur, tahmin")
    s.append("   edilmez. Elde bulunan eski kaynak JSON'da tema, etiketin denk")
    s.append("   geldiği satırdan itibaren ileri kopyalanmıştı ve sessizce yanlıştı:")
    s.append("   \"Havacılık ve Uzayın Temelleri\" Yazılım temasına, laboratuvar")
    s.append("   dersleri Havacılık temasına yazılmıştı.")
    s.append("   ======================================================================== */")
    s.append("const OZEL_PROGRAM_TEMALARI = {")
    turler = list(veriler.keys())
    for ti, tur in enumerate(turler):
        v = veriler[tur]
        s.append('    "%s": {' % tur)
        s.append('        temalar: [')
        for t in v["temalar"]:
            s.append('            { id: %s, ad: %s },' % (
                json.dumps(t["id"], ensure_ascii=False),
                json.dumps(t["ad"], ensure_ascii=False)))
        s.append('        ],')
        s.append('        kota: %s,' % json.dumps(v["kota"], ensure_ascii=False))
        s.append('        ortak: {')
        for sinif in SINIFLAR:
            liste = v["ortak"].get(sinif) or []
            if not liste:
                continue
            s.append('            "%s": [' % sinif)
            for d in liste:
                s.append("                %s," % json.dumps(d, ensure_ascii=False))
            s.append('            ],')
        s.append('        },')
        for alan in ("dersler", "secilebilir"):
            s.append('        %s: {' % alan)
            for tid, siniflar in v[alan].items():
                s.append('            "%s": {' % tid)
                for sinif in SINIFLAR:
                    liste = siniflar.get(sinif) or []
                    if not liste:
                        continue
                    s.append('                "%s": [' % sinif)
                    for d in liste:
                        s.append("                    %s," % json.dumps(d, ensure_ascii=False))
                    s.append('                ],')
                s.append('            },')
            s.append('        },')
        s.append("    }%s" % ("," if ti < len(turler) - 1 else ""))
    s.append("};")
    s.append("")
    hedef = os.path.join(BASE_DIR, "js", "ozel_program_temalari.js")
    with io.open(hedef, "w", encoding="utf-8") as f:
        f.write("\n".join(s))
    return hedef


def asgari(v):
    return v["saat"] if v["tip"] == "sabit" else min(v["secenekler"])


def js_verisi_kur(tanim, veri, harita, uyarilar):
    """
    Çözülmüş çizelgeyi arayüzün beklediği ders kayıtlarına çevirir.

    TEMATİK DERSLERİN HEPSİ ZORUNLU DEĞİLDİR. Çizelgenin kendi
    "TEMATİK ALAN DERS SAATLERİ TOPLAMI" satırı, bir öğrencinin o sınıfta
    kaç saat tematik ders alacağını söyler (Fen Lisesi: 10/8/8/4/4).
    Temel Bilimler temasında 11. sınıfta 16 ders / 32 saat vardır; kota ise
    4 saattir. Hepsini zorunlu saymak, 41 saatlik bir şubeyi 69 saat
    göstermek olurdu — doğrudan norm şişmesi.

    KURAL (çizelgeden türetilir, uydurulmaz):
        temanın o sınıftaki asgari saat toplamı == kota  ->  SEÇİM YOK,
            dersler zorunludur (çizelge başka bir birleşime izin vermiyor)
        toplam > kota                                     ->  SEÇİLEBİLİR,
            dersler seçmeli havuzuna gider, idareci kota kadarını seçer
        toplam < kota                                     ->  ÇELİŞKİ, durulur
    """
    kota = {}
    for i, sinif in enumerate(SINIFLAR):
        v = veri["cizelge_toplamlari"]["tematik"][i]
        if v:
            kota[sinif] = asgari(v)

    # Tema -> sınıf -> ders listesi (ham)
    ham = {}
    ortak_ham = {}
    gorulen_tema = {}
    for d in veri["tematik_alan_dersleri"]:
        tema_ad = d.get("tema") or ""
        hedef = ortak_ham if "ORTAK TEMATİK" in tema_ad else ham
        tid = "__ORTAK__"
        if hedef is ham:
            tid = tema_kimligi(tema_ad)
            gorulen_tema.setdefault(tid, temel.baslik_yap(tema_ad))
        for sinif, v in (d.get("saatler") or {}).items():
            hedef.setdefault(tid, {}).setdefault(sinif, []).append((d, v))

    def kayit_yap(d, v):
        return {"ders": temel.baslik_yap(d["ders_adi"]), "saat": asgari(v),
                "saatSecenekleri": (v["secenekler"] if v["tip"] == "secenekli"
                                    else [v["saat"]]),
                "atananBrans": brans_bul(harita, d["ders_adi"], uyarilar,
                                         tanim["tur"]) or BRANS_ATANMADI,
                "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": False}

    ortak, dersler, secilebilir = {}, {}, {}
    cakisma = []
    for sinif in SINIFLAR:
        ortak_liste = (ortak_ham.get("__ORTAK__") or {}).get(sinif) or []
        ortak_saat = sum(asgari(v) for _, v in ortak_liste)
        if ortak_liste:
            ortak[sinif] = [kayit_yap(d, v) for d, v in ortak_liste]
        ortak_adlar = {temel.anahtar(d["ders_adi"]) for d, _ in ortak_liste}

        for tid in gorulen_tema:
            liste = (ham.get(tid) or {}).get(sinif) or []
            # ÇİZELGE ÇAKIŞMASI: aynı ders hem ORTAK TEMATİK blokta hem bir
            # temanın altında, birebir aynı satırla geçebiliyor (Fen Lisesi
            # hazırlık: "Tümleşik Bilimler" 2 saat, hem ortakta hem Temel
            # Bilimler temasında). Kaynak burada belirsiz. Aynı dersi bir
            # şubeye İKİ KEZ yazmak, o branşın yükünü iki katına çıkarırdı;
            # bu yüzden temanın kopyası düşürülür ve durum raporlanır.
            # Sonuç: o tema/sınıf için çizelge kotasının altında kalınır.
            elenen = [(d, v) for d, v in liste
                      if temel.anahtar(d["ders_adi"]) in ortak_adlar]
            if elenen:
                liste = [x for x in liste if x not in elenen]
                for d, v in elenen:
                    cakisma.append((tid, sinif, d["ders_adi"], asgari(v)))
            if not liste:
                continue
            toplam = ortak_saat + sum(asgari(v) for _, v in liste)
            k = kota.get(sinif)
            if k is None:
                raise SystemExit("!! %s sınıfı için tematik kota yok" % sinif)
            if toplam < k and not any(c[0] == tid and c[1] == sinif
                                      for c in cakisma):
                # Çakışma elemesi yapılmadıysa eksik toplam, okuma hatasıdır.
                raise SystemExit(
                    "!! %s / %s: tema toplamı %d, çizelge kotası %d. "
                    "Kotayı dolduramıyor; kaynak okuması hatalı olabilir."
                    % (tid, sinif, toplam, k))
            hedef = dersler if toplam == k else secilebilir
            hedef.setdefault(tid, {}).setdefault(sinif, []).extend(
                kayit_yap(d, v) for d, v in liste)

    return {
        "temalar": [{"id": tid, "ad": ad} for tid, ad in gorulen_tema.items()],
        "kota": kota,
        "ortak": ortak,
        "dersler": dersler,          # seçim yok — zorunlu
        "secilebilir": secilebilir,  # kota kadarını idareci seçer
        "cakisma": cakisma,          # çizelgede iki kez geçen dersler
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true")
    arg = ap.parse_args()

    harita, _belirsiz = temel.ders_brans_haritasi("lise")
    uyarilar = []
    js_veriler = {}

    hepsi_tamam = True
    for tanim in CIZELGELER:
        veri, egik = cizelgeyi_coz(tanim)
        print("=" * 78)
        print(veri["belge_adi"])
        print("  %s   (atılan eğik satır: %d)" % (veri["karar"], egik))
        print("=" * 78)

        temalar = {}
        for d in veri["tematik_alan_dersleri"]:
            temalar.setdefault(d["tema"] or "(tema yok)", []).append(d)
        print("ORTAK DERSLER: %d" % len(veri["ortak_dersler"]))
        print("TEMATİK ALAN DERSLERİ: %d ders, %d tema"
              % (len(veri["tematik_alan_dersleri"]), len(temalar)))
        for ad, liste in temalar.items():
            print("   [%s]  %d ders" % (ad, len(liste)))
            for d in liste[:3]:
                print("        %-46s %s" % (
                    d["ders_adi"][:46],
                    " ".join("%s:%s" % (s, saat_metni(d["saatler"].get(s)))
                             for s in SINIFLAR if d["saatler"].get(s))))
            if len(liste) > 3:
                print("        ... (%d ders daha)" % (len(liste) - 3))

        gruplar = {}
        for d in veri["cok_yonlu_gelisim_dersleri"]:
            gruplar.setdefault(d["grup"] or "(grup yok)", []).append(d)
        print("ÇOK YÖNLÜ GELİŞİM DERSLERİ: %d ders, %d grup"
              % (len(veri["cok_yonlu_gelisim_dersleri"]), len(gruplar)))
        for ad, liste in gruplar.items():
            print("   [%s]  %d ders" % (ad, len(liste)))

        uretilen, beklenen, tamam = dogrula(veri)
        print()
        print("%-34s %s" % ("ÜRETİLEN ORTAK DERS TOPLAMI",
                            "  ".join(str(x).rjust(3) for x in uretilen)))
        print("%-34s %s" % ("ÇİZELGENİN KENDİ TOPLAMI",
                            "  ".join(str(x).rjust(3) for x in beklenen)))
        print("DOĞRULAMA: %s" % ("✓ TUTUYOR" if tamam
                                 else "✗ TUTMUYOR — üretim geçersiz"))
        hepsi_tamam = hepsi_tamam and tamam

        js_veriler[tanim["tur"]] = js_verisi_kur(tanim, veri, harita, uyarilar)

        if arg.yaz:
            if not tamam:
                print("Doğrulama tutmadığı için YAZILMADI.")
                js_veriler.pop(tanim["tur"], None)
                continue
            os.makedirs(CIKTI_KOK, exist_ok=True)
            hedef = os.path.join(CIKTI_KOK, tanim["cikti"])
            with io.open(hedef, "w", encoding="utf-8") as f:
                json.dump(veri, f, ensure_ascii=False, indent=1)
            print("yazıldı: %s" % hedef)

    for tur, v in js_veriler.items():
        if v.get("cakisma"):
            print()
            print("ÇİZELGE ÇAKIŞMASI — ders hem ortak tematik blokta hem temada:")
            for tid, sinif, ad, saat in v["cakisma"]:
                print("   %s / %s. sınıf: %s (%d saat) — temadaki kopya düşürüldü"
                      % (tid, sinif, ad, saat))
            print("   Sonuç: o tema/sınıf çizelge kotasının altında kalır.")

    if uyarilar:
        print()
        print("BRANŞI ÇÖZÜLEMEYEN DERSLER (— Branş Atanmadı — bırakıldı):")
        for ad, a, tur in uyarilar:
            print("   %s" % ad)

    if arg.yaz and js_veriler:
        hedef = js_yaz(js_veriler, uyarilar)
        print()
        print("yazıldı: %s" % hedef)
        print("UNUTMAYIN: build_bundle.py listesinde olmalı ve paket yenilenmeli.")

    return 0 if hepsi_tamam else 1


if __name__ == "__main__":
    sys.exit(main())

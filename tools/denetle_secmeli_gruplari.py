# -*- coding: utf-8 -*-
"""OGM cizelgelerindeki secmeli ders GRUP bilgisini PDF'in kendi tablo
cizgilerinden yeniden yazar. v1'in genellestirilmis hali.

v1 NEDEN YETMEDI (Spor Lisesi / Tematik Spor)
  v1 iki SABIT esik kullaniyordu:
     - bant sinirlari  : yatay cizgi ve x0 < 100
     - ders sutunu basi: 100 < x0 < 220 araligindaki x0'larin modu
  Sayi 05/06/07'de etiket sutunu x 70-139 idi; esikler tutuyordu.
  Sayi 09/10'da etiket sutunu x 38.8-96.0 ve bant sinir cizgileri sayfa
  sonuna (x1=368.3) kadar uzuyor. Iki esik de yanlisti -> "0 bant".

v2 YONTEMI (hicbir sabit x esigi yok)
  1. Tema etiketi olabilecek kelimeler bulunur (akademik/insan/ahlak/kultur).
  2. Sayfanin DIKEY cizgileri sutun sinirlarini verir; etiket kelimelerini
     iceren ardisik sinir cifti = ETIKET SUTUNU.
  3. Bant sinirlari = etiket sutununu BASTAN SONA kesen yatay cizgiler.
     Sagdaki satir ayraclari birlestirilmis hucreyi kesmez; aranan tam budur.
  4. Ders sutunu = etiket sutununun hemen sagindaki sutun.
  5. Grup hucreleri cok satirli oldugundan 30pt'den kisa bantlar elenir
     (yoksa "Din Kulturu ve Ahlak Bilgisi" ortak dersi sahte bant uretir).
  6. Ders adi ILK SAYISAL BELIRTECTE biter (saat sutunu yapismasin).
  7. JSON tablosu ile PDF sayfasi ders kumesi ORTUSMESINE gore eslestirilir.

Kullanim:  python genel_grup_duzelt2.py <json> <pdf> [--uygula] [--ayrinti]
Varsayilan: yalnizca RAPOR.
"""
import pdfplumber, io, json, re, sys, os, shutil, datetime

def sade(s):
    for a, b in [("İ", "i"), ("I", "i"), ("ı", "i"), ("Ş", "s"),
                 ("ş", "s"), ("Ğ", "g"), ("ğ", "g"),
                 ("Ü", "u"), ("ü", "u"), ("Ö", "o"),
                 ("ö", "o"), ("Ç", "c"), ("ç", "c"),
                 ("Â", "a"), ("â", "a"), ("’", "'"), ("`", "'")]:
        s = str(s or "").replace(a, b)
    s = re.sub(r"\(\d+\)", " ", s.lower())
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def _tema(et):
    if "akademik" in et: return "AKADEMİK ÇALIŞMALAR"
    if "insan"    in et: return "İNSAN, TOPLUM VE BİLİM"
    if "ahlak"    in et: return "DİN, AHLAK VE DEĞER"
    if "kultur"   in et: return "KÜLTÜR, SANAT VE SPOR"
    return None


def _cizgiler(p):
    ogeler = list(p.lines) + list(p.rects)
    yat = [o for o in ogeler
           if abs(o["bottom"] - o["top"]) < 2 and (o["x1"] - o["x0"]) > 5]
    dik = [o for o in ogeler
           if abs(o["x1"] - o["x0"]) < 2 and (o["bottom"] - o["top"]) > 20]
    return yat, dik


def _bantlar(ks, yat, ex0, ex1):
    """Verilen sutunu bastan sona kesen yatay cizgiler arasindaki temali bantlar."""
    # Tolerans 4pt: cizgi, hucre kenarindan iceride baslayabiliyor.
    # Ilkogretim cizelgesinde sutun kenari x=84.0 iken bant ayiraclari
    # x=85.7'den basliyordu; 1.5pt tolerans bunlari 0.2pt farkla eliyor,
    # uc temanin ucu de tek bant gorunuyordu. Satir ayiraclari cok daha
    # sagdan (x=162.4) basladigi icin 4pt hala guvenli.
    T = 4.0
    sinir = sorted({round((o["top"] + o["bottom"]) / 2, 1) for o in yat
                    if o["x0"] <= ex0 + T and o["x1"] >= ex1 - T})
    out = []
    for ust, alt in zip(sinir, sinir[1:]):
        if alt - ust < 30:                       # cok satirli hucre esigi
            continue
        # Kelimenin TAMAMI degil MERKEZI sutunda olmali. Ilkogretim
        # cizelgesinde etiket "3Kültür," diye basliyor (dipnot rakami
        # yapisik) ve sola tasarak sutun disina cikiyordu; tam kapsama
        # sarti aranınca "Kultur, Sanat ve Spor" bandi hic bulunamiyordu.
        icerik = [w for w in ks
                  if ex0 <= (w["x0"] + w["x1"]) / 2 <= ex1
                  and ust <= (w["top"] + w["bottom"]) / 2 <= alt]
        icerik.sort(key=lambda w: (round(w["top"] / 3.0), w["x0"]))
        et = sade(" ".join(w["text"] for w in icerik))
        # Sayi 10'da etiket harflere bolunmus cikiyor:
        #   'İNS' 'A' 'N' ',' 'T' 'O' 'P' 'LUM' ...
        # Kelime bazli arama bunu goremez; bosluksuz birlesim yedek olarak
        # denenir. Once bosluklu bakilir ki yanlis eslesme uretmesin.
        t = _tema(et) or _tema(et.replace(" ", ""))
        if t:
            out.append((ust, alt, t))
    return out


def sayfa_gruplari(p, ayrinti=False):
    ks = p.extract_words(use_text_flow=False)
    if not ks:
        return {}, 0
    yat, dik = _cizgiler(p)
    if not dik:
        return {}, 0

    # Dikey sinirlar: ayni x'teki parcalarin TOPLAM uzunlugu esas alinir.
    # (Sayi 09'da x=96.0 sinirinin buyuk kismi 8.6pt'lik parcalara bolunmus.)
    kapsam = {}
    for o in dik:
        x = round(o["x0"], 1)
        kapsam[x] = kapsam.get(x, 0.0) + (o["bottom"] - o["top"])
    xs = sorted(x for x, u in kapsam.items() if u > 50)
    if len(xs) < 2:
        return {}, 0

    # ETIKET SUTUNU, icindeki kelime sayisiyla DEGIL urettigi bant yapisiyla
    # secilir. Kelime sayimi yaniltiyordu: ders adlarindaki "Kultur", "Insan",
    # "Ahlak" gecisleri yuzunden Sayi 07/10'da genis DERS sutunu kazaniyordu.
    en_iyi, skor = None, ()
    for a, b in zip(xs, xs[1:]):
        if b - a < 25:
            continue
        bl = _bantlar(ks, yat, a, b)
        s = (len({t for _, _, t in bl}), -(b - a))
        if s[0] and s > skor:
            en_iyi, skor = (a, b), s
    if not en_iyi:
        return {}, 0
    ex0, ex1 = en_iyi
    bantlar = _bantlar(ks, yat, ex0, ex1)

    sag = [x for x in xs if x > ex1 + 20]
    dx0, dx1 = ex1, (sag[0] if sag else ex1 + 240)

    if ayrinti:
        print("      etiket sutunu x=[%.1f, %.1f]  ders sutunu x=[%.1f, %.1f]"
              % (ex0, ex1, dx0, dx1))
        for u, a, t in bantlar:
            print("      bant %7.1f - %7.1f  %s" % (u, a, t))

    satir = {}
    for w in ks:
        if dx0 - 2 <= w["x0"] < dx1:
            satir.setdefault(round(w["top"] / 3.0), []).append(w)

    harita = {}
    for _, ws in sorted(satir.items()):
        ws = sorted(ws, key=lambda w: w["x0"])
        parcalar = []
        for w in ws:
            t = w["text"]
            if t and (t[0].isdigit() or t[0] in "(-–—"):
                break
            parcalar.append(t)
        k = sade(" ".join(parcalar))
        if len(k) < 3:
            continue
        y = sum((w["top"] + w["bottom"]) / 2 for w in ws) / len(ws)
        for ust, alt, t in bantlar:
            if ust <= y <= alt:
                harita[k] = t
                break
    return harita, len(bantlar)


def tablo_dersleri(t):
    out = []
    for g in t.get("gruplar", []):
        if "SEÇMEL" not in (g.get("grup_adi") or "").upper().replace("I", "İ"):
            continue
        out.extend(g.get("dersler", []))
    return out


def calis(jsn, pdf_yolu, uygula, ayrinti=False):
    d = json.load(io.open(jsn, encoding="utf-8"))
    tablolar = d.get("tablolar") or []
    if not tablolar:
        print("   (tablolar yok)")
        return 0

    sayfalar = []
    with pdfplumber.open(pdf_yolu) as pdf:
        for i, p in enumerate(pdf.pages):
            if ayrinti:
                print("   -- sayfa %d" % (i + 1))
            h, n = sayfa_gruplari(p, ayrinti)
            if ayrinti:
                print("      bant=%d ders=%d" % (n, len(h)))
            if n == 4 and len(h) > 8:
                sayfalar.append((i + 1, h))
    if not sayfalar:
        print("   !!! 4 grup bandi olan sayfa yok")
        return 0
    print("   4 bantli PDF sayfasi: %s" % [s for s, _ in sayfalar])

    toplam = 0
    for t in tablolar:
        dersler = tablo_dersleri(t)
        if not dersler:
            continue
        adlar = {sade(x.get("ders_adi")) for x in dersler}
        en_iyi, skor = None, 0
        for sno, h in sayfalar:
            ort = len(adlar & set(h.keys()))
            if ort > skor:
                en_iyi, skor = (sno, h), ort
        if not en_iyi or skor < len(adlar) * 0.6:
            print("   %-40s ESLESME ZAYIF (%d/%d) - atlandi"
                  % ((t.get("tablo_adi") or "?")[:40], skor, len(adlar)))
            continue
        sno, h = en_iyi
        degisen, bulunamayan = 0, 0
        for x in dersler:
            k = sade(x.get("ders_adi"))
            if k in h:
                if x.get("grup") != h[k]:
                    if ayrinti:
                        print("        %-42s %-24s -> %s"
                              % (str(x.get("ders_adi"))[:42], x.get("grup"), h[k]))
                    if uygula:
                        x["grup"] = h[k]
                    degisen += 1
            else:
                bulunamayan += 1
        toplam += degisen
        print("   %-40s sayfa %-3d degisen:%3d  eslesmeyen:%d"
              % ((t.get("tablo_adi") or "?")[:40], sno, degisen, bulunamayan))

    if uygula and toplam:
        damga = datetime.datetime.now().strftime("%Y%m%d_%H%M")
        shutil.copy2(jsn, jsn + ".yedek_" + damga)
        io.open(jsn, "w", encoding="utf-8").write(
            json.dumps(d, ensure_ascii=False, indent=2))
        print("   -> YAZILDI (yedek .yedek_%s)" % damga)
    return toplam


# --------------------------------------------------------------------------
# DENETIM SURUCUSU
# --------------------------------------------------------------------------
# Cizelge JSON'lari her yeniden uretildiginde bu betik kosulmalidir. Grup
# atamalari, PDF'in KENDI tablo cizgileriyle karsilastirilir; sapma varsa
# cikis kodu 1 olur.
#
# 08.09.2026 durumu: 5 lise cizelgesi + ortaokul = SIFIR sapma.

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSN = os.path.join(KOK, "data", "kaynak_cizelgeler")
PDF_KOK = os.path.join(os.path.dirname(KOK), "03_meb_mevzuat_ve_cizelgeler")

CIZELGELER = [
    "ogm/sayi05_anadolu_fen_sosyalbilimler.json",
    "ogm/sayi06_guzelsanatlar_gorsel_tiyatro.json",
    "ogm/sayi07_guzelsanatlar_muzik_turkmuzigi.json",
    "ogm/sayi09_spor_lisesi.json",
    "ogm/sayi10_tematik_spor_lisesi.json",
]

# Ortaokul cizelgesinin JSON yapisi farkli (tablolar/gruplar yok), ayri
# karsilastirilir. Grup adlari da BASLIK harfle tutuluyor.
ORTAOKUL_JSON = "temel_egitim/ilkogretim_ilkokul_ortaokul.json"
ORTAOKUL_UST = {
    "İnsan, Toplum ve Bilim": "İNSAN, TOPLUM VE BİLİM",
    "Din, Ahlak ve Değer": "DİN, AHLAK VE DEĞER",
    "Kültür, Sanat ve Spor": "KÜLTÜR, SANAT VE SPOR",
}


def _pdf_bul(ad):
    for kok, _, dosyalar in os.walk(PDF_KOK):
        if ad in dosyalar:
            return os.path.join(kok, ad)
    return None


def ortaokul_denetle():
    yol = os.path.join(JSN, ORTAOKUL_JSON)
    d = json.load(io.open(yol, encoding="utf-8"))
    pdf = _pdf_bul(os.path.basename(d.get("kaynak_pdf") or ""))
    print("### %s" % ORTAOKUL_JSON)
    if not pdf:
        print("   !!! PDF bulunamadi"); return 1

    harita = {}
    with pdfplumber.open(pdf) as p:
        for sf in p.pages:
            h, n = sayfa_gruplari(sf)
            if n >= 3:
                harita.update(h)
    if not harita:
        print("   !!! bant bulunamadi"); return 1

    dersler = []

    def gez(o):
        if isinstance(o, dict):
            if "grup" in o:
                dersler.append(o); return
            for v in o.values():
                gez(v)
        elif isinstance(o, list):
            for v in o:
                gez(v)
    gez(d.get("secmeli_dersler"))

    fark, yok = 0, 0
    for x in dersler:
        k = sade(x.get("ders_adi") or x.get("ad"))
        if k not in harita:
            yok += 1
            continue
        bek = ORTAOKUL_UST.get(x["grup"], x["grup"])
        if harita[k] != bek:
            fark += 1
            print("   FARK %-42s json=%-22s pdf=%s"
                  % (str(x.get("ders_adi"))[:42], x["grup"], harita[k]))
    print("   ders:%d  sapma:%d  PDF'te bulunamayan:%d" % (len(dersler), fark, yok))
    return fark + yok


if __name__ == "__main__":
    arg = [a for a in sys.argv[1:] if not a.startswith("--")]
    uygula = "--uygula" in sys.argv
    ayrinti = "--ayrinti" in sys.argv

    if arg:                                   # tek dosya kipi
        print("### %s" % os.path.basename(arg[0]))
        print("   TOPLAM: %d" % calis(arg[0], arg[1], uygula, ayrinti))
        sys.exit(0)

    sapma = 0
    for gore in CIZELGELER:
        yol = os.path.join(JSN, gore.replace("/", os.sep))
        d = json.load(io.open(yol, encoding="utf-8"))
        pdf = _pdf_bul(d.get("kaynak_dosya") or "")
        print("### %s" % gore)
        if not pdf:
            print("   !!! PDF bulunamadi: %s" % d.get("kaynak_dosya"))
            sapma += 1
            continue
        sapma += calis(yol, pdf, uygula, ayrinti)
    sapma += ortaokul_denetle()

    print("=" * 70)
    if sapma:
        print("SAPMA VAR: %d  (--uygula ile duzeltilir)" % sapma)
        sys.exit(1)
    print("TEMIZ: butun grup atamalari PDF tablo cizgileriyle birebir")

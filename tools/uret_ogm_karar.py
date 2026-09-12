# -*- coding: utf-8 -*-
"""
TTKB KARARINDAN (SPOR LİSESİ AİLESİ) ÇİZELGE JSON'U ÜRETİR
=========================================================

NE ÜRETİR
---------
    data/kaynak_cizelgeler/ogm/sayi102_spor_lisesi.json           Karar 2026/102
    data/kaynak_cizelgeler/ogm/sayi103_tematik_spor_lisesi.json   Karar 2026/103

Şema, önceki sayi09 / sayi10 dosyalarıyla BİREBİR aynıdır; tüketiciler
(uret_ortaogretim_cizelgeleri.py, denetle_secmeli_gruplari.py) değişmeden okur.
Yalnızca iki kontrol alanı eklenir: ortak_ders_saati_toplami ve
secilebilecek_ders_saati. Bunlar PDF'in kendi toplam satırlarıdır ve aşağıdaki
denklik kontrollerinde kullanılır.

NEDEN VAR (11.09.2026)
----------------------
TTKB 02/09/2026'da Spor Lisesi (Sayı 102) ve Tematik Program Uygulayan Spor
Lisesi (Sayı 103) çizelgelerini yeniledi. Kararlar, 09/05/2025 tarihli 9 ve 10
sayılı kararları "2026-2027 eğitim ve öğretim yılından itibaren TÜM sınıf
seviyelerinde uygulamadan" kaldırıyor. Haftalık toplam 43'ten 40'a iniyor.
Eski JSON'ların üreticisi projede artık bulunmuyordu; bu betik aynı şemayı
yeniden, kaynağa bağlı biçimde kurar.

Değişiklik, yeni mevzuat nöbetçisinin ilk taramasında görüldü; eski nöbetçi
TTKB'nin çizelge listesine hiç bakmadığı için görememişti.

FİLİGRAN
--------
Karar PDF'lerinde tablonun üstüne ~55 derece eğik bir doğrulama numarası
(8910726985-...) basılıdır. Metin düz okunursa rakamları hücrelere karışır:
"TAKIM SPORLARI 9 4", "ORTAK DERS SAATİ TOPLAMI 1 35". Rakam içeren bir
tabloda bu, sessizce yanlış saat demektir.

Çözüm: hücre SINIRLARI PyMuPDF'in tablo bulucusundan, hücre METNİ yalnızca
eksene PARALEL satırlardan (yatay ve 90 derece dönük) alınır; eğik satır hiç
girmez. Dönük satırlar tutulur, çünkü seçmeli grup adları dikey yazılmıştır.

SEÇMELİ GRUPLARI
----------------
Grup adı PDF'te birleşik ve dikey yazılmış tek bir hücrede durur; satır
satır ileri doldurmak dersleri yanlış gruba yazar (bu hatanın öyküsü:
denetle_secmeli_gruplari.py). Burada grup, ÖNCEKİ kararın DOĞRULANMIŞ grup
atamasından ders adıyla taşınır; önceki kararda olmayan ders için aynı
bölümdeki önceki satırın grubu alınır ve RAPORLANIR. Ardından
denetle_secmeli_gruplari.py atamaları PDF'in kendi tablo çizgileriyle
bağımsız olarak doğrular. O adım ATLANMAMALIDIR.

DENKLİK KONTROLLERİ — tutmazsa üretim DURUR
-------------------------------------------
Her sınıf için:
    ortak derslerin sabit saatleri toplamı == ORTAK DERS SAATİ TOPLAMI
    TOPLAM DERS SAATİ == ortak toplam + SEÇİLEBİLECEK DERS SAATİ + rehberlik
Çözülemeyen bir saat hücresi de üretimi durdurur. Tahmin yoktur.

ÇALIŞTIRMA
    python -X utf8 tools/uret_ogm_karar.py           # ayrıştırır, farkı gösterir, YAZMAZ
    python -X utf8 tools/uret_ogm_karar.py --yaz     # JSON'ları yazar

Önce TTKB arşivi güncel olmalı:
    python -X utf8 04_veri_uretim_hatti/ttkb_cizelge_indirici.py
"""
import argparse
import hashlib
import io
import json
import os
import re
import sys
import warnings

warnings.filterwarnings("ignore")

try:
    import fitz  # PyMuPDF
except ImportError:  # pragma: no cover
    raise SystemExit("PyMuPDF kurulu degil:  pip install pymupdf")

fitz.TOOLS.mupdf_display_errors(False)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSN = os.path.join(KOK, "data", "kaynak_cizelgeler")
ARSIV = os.path.join(os.path.dirname(KOK), "03_meb_mevzuat_ve_cizelgeler",
                     "ttkb_haftalik_ders_cizelgeleri")
KUNYE = os.path.join(ARSIV, "kaynak_listesi.json")

SINIFLAR = ["9", "10", "11", "12"]

# Her karar, arşivdeki PDF'ine TTKB dosya kimliğiyle bağlanır (adres içindeki
# benzersiz önek). Karar sayısı ve tarihi ayrıca PDF'in kendisinden okunur ve
# burada beklenenle KARŞILAŞTIRILIR; tutmazsa yanlış belge demektir.
KARARLAR = [
    {
        "dosya_kimligi": "6aa10af7e5e37220778699",
        "beklenen_sayi": "102",
        "tablo_adi": "Spor Lisesi",
        "cikti": "ogm/sayi102_spor_lisesi.json",
        "onceki": "ogm/sayi09_spor_lisesi.json",
    },
    {
        "dosya_kimligi": "6aa10d3a99329801109605",
        "beklenen_sayi": "103",
        "tablo_adi": "Tematik Program Uygulayan Spor Lisesi",
        "cikti": "ogm/sayi103_tematik_spor_lisesi.json",
        "onceki": "ogm/sayi10_tematik_spor_lisesi.json",
    },
]

# SAYI 104 BURADA DEĞİL, BİLEREK (12.09.2026)
# "Özel Program Uygulayan Hazırlık Sınıfı Bulunan Anadolu Lisesi" (02/09/2026)
# bu üretecin kalıbına UYMUYOR: burada çizelgeler 9-12 olmak üzere dört
# sütunludur, Sayı 104'te ise HAZIRLIK sütunu da vardır; ayrıca çizelge
# tematik alan dersleri ve çok yönlü gelişim dersleri bloklarını taşır.
# Bu yapının üreteci tools/uret_ozel_program.py'dir ve Sayı 104 oraya
# eklenmiştir. (Denendi: buradan okutmak "Sinif basligi bulunamadi" ile
# duruyor — kalıp gerçekten farklı.)


# ---------------------------------------------------------------------------
# Metin yardımcıları
# ---------------------------------------------------------------------------
def sade(s):
    s = (s or "").replace("İ", "i").replace("I", "ı").lower()
    s = s.translate(str.maketrans("çğıöşüâîû’'", "cgiosuaiu  "))
    return " ".join(s.split())


def anahtar(ad):
    """Ders adı karşılaştırması: boşluksuz. Hücreye sığmayıp alt satıra taşan
    adlar ("GIDA GÜVEN" + "LİĞİ") birleştirilirken araya boşluk girebilir."""
    return sade(ad).replace(" ", "")


def eksene_paralel_mi(dir_):
    dx, dy = dir_
    return not (abs(dx) > 0.05 and abs(dy) > 0.05)


def harfler(sayfa):
    """Sayfadaki eksene paralel satırların harfleri: (x, y, satir_no, harf).
    Eğik (filigran) satırlar dönüşe girmez; sayısı ayrıca döner."""
    cikti, egik, no = [], 0, 0
    for b in sayfa.get_text("rawdict")["blocks"]:
        for l in b.get("lines", []):
            no += 1
            if not eksene_paralel_mi(l.get("dir", (1, 0))):
                egik += 1
                continue
            for sp in l["spans"]:
                for c in sp["chars"]:
                    x0, y0, x1, y1 = c["bbox"]
                    cikti.append(((x0 + x1) / 2, (y0 + y1) / 2, no, c["c"]))
    return cikti, egik


def temiz_metin(sayfa):
    """Eksene paralel satırlardan sayfa metni (satır sırası korunur)."""
    satirlar = []
    for b in sayfa.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            if not eksene_paralel_mi(l.get("dir", (1, 0))):
                continue
            t = "".join(s["text"] for s in l["spans"]).strip()
            if t:
                satirlar.append(t)
    return "\n".join(satirlar)


def tablo_matrisi(sayfa):
    """Sayfadaki tek çizelge tablosunu filigransız hücre metinleriyle döndürür."""
    tablolar = sayfa.find_tables().tables
    if not tablolar:
        raise SystemExit("Sayfada tablo bulunamadi.")
    tablo = max(tablolar, key=lambda t: t.row_count * t.col_count)
    hs, egik = harfler(sayfa)
    matris = []
    for r in tablo.rows:
        satir = []
        for bb in r.cells:
            if not bb:
                satir.append("")
                continue
            x0, y0, x1, y1 = bb
            icerik = [h for h in hs if x0 <= h[0] <= x1 and y0 <= h[1] <= y1]
            metin, son = "", None
            for h in icerik:
                if son is not None and h[2] != son:
                    metin += " "
                metin += h[3]
                son = h[2]
            satir.append(" ".join(metin.split()))
        matris.append(satir)
    return matris, egik


# ---------------------------------------------------------------------------
# Hücre çözümü — tanınmayan biçim ÜRETİMİ DURDURUR
# ---------------------------------------------------------------------------
def saat_coz(h):
    h = " ".join((h or "").split())
    if h in ("", "-", "- -", "—"):
        return None
    if re.fullmatch(r"\d{1,2}", h):
        return {"tip": "sabit", "saat": int(h)}
    if re.fullmatch(r"(\(\d{1,2}\))+", h.replace(" ", "")):
        return {"tip": "secenekli", "secenekler": [int(x) for x in re.findall(r"\d{1,2}", h)]}
    raise ValueError("cozulemeyen saat hucresi: %r" % h)


def ad_coz(ham):
    """'MÜSABAKA ANALİZİ* (2)' -> ('MÜSABAKA ANALİZİ', '*', 2)."""
    ad = " ".join((ham or "").split())
    kac = None
    m = re.search(r"\((\d{1,2})\)\s*$", ad)
    if m:
        kac = int(m.group(1))
        ad = ad[:m.start()].strip()
    dipnot = None
    m = re.search(r"(\*+)\s*$", ad)
    if m:
        dipnot = m.group(1)
        ad = ad[:m.start()].strip()
    return ad, dipnot, kac


def saatler_satiri(satir, sutunlar):
    return {s: saat_coz(satir[i]) for s, i in zip(SINIFLAR, sutunlar)}


# ---------------------------------------------------------------------------
# Karar künyesi (ilk sayfa)
# ---------------------------------------------------------------------------
def kunye_oku(metin):
    """Karar sayısı, tarihi, konusu, önceki kararı. Filigransız metinden."""
    d = " ".join(metin.split())
    sayi = re.search(r"Sayı\s+(\d{1,4})\b", d) or re.search(r"\b(\d{1,4})\s+Sayı\b", d)
    tarih = re.search(r"Tarih\s+(\d{2}/\d{2}/\d{4})", d)
    gorusme = re.search(r"Kurulda Görüşülme Tarihi\s+(\d{2}/\d{2}/\d{4})", d)
    onceki = re.search(r"Önceki Kararın Tarih ve Sayısı\s+(\d{2}/\d{2}/\d{4}-\d{1,4})", d)
    kaldirilan = re.findall(r"(\d{2}/\d{2}/\d{4})\s*tarihli\s*ve\s*(\d{1,4})\s*sayılı", d)
    uygulama = re.search(r"(\d{4}-\d{4} eğitim ve öğretim yılından itibaren[^,.]*)", d)
    return {
        "karar_sayi": sayi.group(1) if sayi else None,
        "karar_tarihi": tarih.group(1) if tarih else None,
        "kurulda_gorusulme_tarihi": gorusme.group(1) if gorusme else None,
        "onceki_karar": onceki.group(1) if onceki else None,
        "kaldirilan_kararlar": ["%s-%s" % k for k in kaldirilan],
        "uygulama": uygulama.group(1) if uygulama else None,
    }


# ---------------------------------------------------------------------------
# Tablo -> şema
# ---------------------------------------------------------------------------
def tabloyu_coz(matris, tablo_adi, onceki_gruplar):
    sutunlar = None
    for satir in matris:
        if [c.strip() for c in satir[-4:]] == SINIFLAR:
            sutunlar = list(range(len(satir) - 4, len(satir)))
            break
    if not sutunlar:
        raise SystemExit("Sinif basligi (9 10 11 12) bulunamadi.")

    ortak, secmeli, pde, uyarilar = [], [], [], []
    ozet = {}
    bolum = None
    son_grup = None

    for satir in matris:
        ilk3 = [c for c in satir[:sutunlar[0]] if c]
        etiket = " ".join(ilk3)
        s0 = sade(satir[0])
        se = sade(etiket)

        if s0.startswith("ortak dersler"):
            bolum = "ORTAK"
        elif s0.startswith("secmeli dersler"):
            bolum = "SECMELI"

        if "ortak ders saati toplami" in se:
            ozet["ortak"] = saatler_satiri(satir, sutunlar)
            continue
        if "secilebilecek ders saati" in se:
            ozet["secilebilir"] = saatler_satiri(satir, sutunlar)
            continue
        if "rehberlik ve yonlendirme" in se:
            ozet["rehberlik"] = saatler_satiri(satir, sutunlar)
            continue
        if se == "toplam ders saati":
            ozet["toplam"] = saatler_satiri(satir, sutunlar)
            continue
        if "program disi etkinlik" in se:
            bolum = "PDE"
        if bolum == "PDE":
            ad = satir[sutunlar[0] - 1] if sutunlar[0] >= 1 else ""
            if ad:
                pde.append(ad)
            continue
        if bolum not in ("ORTAK", "SECMELI"):
            continue

        ad_hucresi = satir[sutunlar[0] - 1] or (satir[1] if bolum == "ORTAK" else "")
        if not ad_hucresi:
            continue
        ad, dipnot, kac = ad_coz(ad_hucresi)
        saatler = saatler_satiri(satir, sutunlar)
        if all(v is None for v in saatler.values()) and bolum == "SECMELI" and not satir[sutunlar[0] - 1]:
            continue                    # yalnızca dikey grup etiketi taşıyan satır

        if bolum == "ORTAK":
            ortak.append({"ders_adi": ad, "grup": None, "kac_kez_secilebilir": kac,
                          "dipnot": dipnot, "saatler": saatler})
        else:
            grup = onceki_gruplar.get(anahtar(ad))
            if grup is None:
                grup = son_grup
                uyarilar.append("onceki kararda yok, komsu satirin grubu verildi: %s -> %s"
                                % (ad, grup))
            son_grup = grup
            secmeli.append({"ders_adi": ad, "grup": grup, "kac_kez_secilebilir": kac,
                            "dipnot": dipnot, "saatler": saatler})

    for zorunlu in ("ortak", "secilebilir", "rehberlik", "toplam"):
        if zorunlu not in ozet:
            raise SystemExit("Toplam satiri bulunamadi: %s" % zorunlu)

    # --- DENKLİK KONTROLLERİ ---------------------------------------------
    sayi = lambda h: (h or {}).get("saat", 0) if (h or {}).get("tip") == "sabit" else 0
    for s in SINIFLAR:
        ortak_top = sum(sayi(d["saatler"][s]) for d in ortak)
        if ortak_top != sayi(ozet["ortak"][s]):
            raise SystemExit("DENKLIK TUTMADI (%s. sinif): ortak ders saatleri toplami %d, "
                             "PDF'teki ORTAK DERS SAATI TOPLAMI %d"
                             % (s, ortak_top, sayi(ozet["ortak"][s])))
        beklenen = sayi(ozet["ortak"][s]) + sayi(ozet["secilebilir"][s]) + sayi(ozet["rehberlik"][s])
        if beklenen != sayi(ozet["toplam"][s]):
            raise SystemExit("DENKLIK TUTMADI (%s. sinif): ortak+secilebilir+rehberlik = %d, "
                             "TOPLAM DERS SAATI %d" % (s, beklenen, sayi(ozet["toplam"][s])))
    if any(d["grup"] is None for d in secmeli):
        raise SystemExit("Grubu belirlenemeyen secmeli ders var.")

    tablo = {
        "tablo_adi": tablo_adi,
        "sinif_seviyeleri": list(SINIFLAR),
        "gruplar": [{"grup_adi": "ORTAK DERSLER", "dersler": ortak},
                    {"grup_adi": "SEÇMELİ DERSLER", "dersler": secmeli}],
        "rehberlik_ve_yonlendirme": ozet["rehberlik"],
        "toplam_ders_saati": ozet["toplam"],
        "ortak_ders_saati_toplami": ozet["ortak"],
        "secilebilecek_ders_saati": ozet["secilebilir"],
        "program_disi_etkinlikler": pde,
    }
    return tablo, uyarilar


# ---------------------------------------------------------------------------
# Önceki kararla fark
# ---------------------------------------------------------------------------
def fark_raporu(eski_tablo, yeni_tablo):
    def gorunum(h):
        if not h:
            return "-"
        return str(h["saat"]) if h.get("tip") == "sabit" else "(" + ",".join(map(str, h.get("secenekler", []))) + ")"

    def indeks(t):
        sonuc = {}
        for g in t["gruplar"]:
            for d in g["dersler"]:
                sonuc[anahtar(d["ders_adi"])] = (g["grup_adi"], d)
        return sonuc

    e, y = indeks(eski_tablo), indeks(yeni_tablo)
    satirlar = []
    for k in list(e) + [k for k in y if k not in e]:
        eg, ed = e.get(k, (None, None))
        yg, yd = y.get(k, (None, None))
        ad = (yd or ed)["ders_adi"]
        es = " ".join(gorunum(ed["saatler"].get(s)) for s in SINIFLAR) if ed else ""
        ys = " ".join(gorunum(yd["saatler"].get(s)) for s in SINIFLAR) if yd else ""
        if ed is None:
            satirlar.append("  + YENI         %-44s %s  [%s]" % (ad[:44], ys, yg))
        elif yd is None:
            satirlar.append("  - KALDIRILDI   %-44s %s  [%s]" % (ad[:44], es, eg))
        elif eg != yg:
            satirlar.append("  > BOLUM        %-44s %s -> %s  [%s -> %s]" % (ad[:44], es, ys, eg, yg))
        elif es != ys:
            satirlar.append("  * SAAT         %-44s %s -> %s" % (ad[:44], es, ys))
        elif (ed.get("grup") or "") != (yd.get("grup") or ""):
            satirlar.append("  ~ GRUP         %-44s %s -> %s" % (ad[:44], ed.get("grup"), yd.get("grup")))
    top = lambda t, anahtar_: " ".join(gorunum((t.get(anahtar_) or {}).get(s)) for s in SINIFLAR)
    satirlar.append("  TOPLAM DERS SAATI : %s -> %s" % (top(eski_tablo, "toplam_ders_saati"),
                                                      top(yeni_tablo, "toplam_ders_saati")))
    satirlar.append("  REHBERLIK         : %s -> %s" % (top(eski_tablo, "rehberlik_ve_yonlendirme"),
                                                      top(yeni_tablo, "rehberlik_ve_yonlendirme")))
    return satirlar


# ---------------------------------------------------------------------------
def pdf_bul(kunye, dosya_kimligi):
    for b in kunye.get("belgeler", []):
        if dosya_kimligi in (b.get("adres") or "") or dosya_kimligi in (b.get("dosya") or ""):
            return b
    return None


def onceki_json(yol):
    for aday in (yol, yol + ".mulga"):
        if os.path.exists(aday):
            return json.load(io.open(aday, encoding="utf-8")), aday
    return None, None


def uret(karar, kunye, yaz):
    belge = pdf_bul(kunye, karar["dosya_kimligi"])
    if not belge:
        raise SystemExit("Arsivde yok: %s (once ttkb_cizelge_indirici.py calistirilmali)"
                         % karar["dosya_kimligi"])
    pdf_yolu = os.path.join(ARSIV, belge["dosya"])
    icerik = open(pdf_yolu, "rb").read()

    with fitz.open(pdf_yolu) as d:
        kun = kunye_oku(temiz_metin(d[0]))
        if kun["karar_sayi"] != karar["beklenen_sayi"]:
            raise SystemExit("Yanlis belge: PDF'teki karar sayisi %r, beklenen %r"
                             % (kun["karar_sayi"], karar["beklenen_sayi"]))
        matris, egik = tablo_matrisi(d[1])
        aciklama = temiz_metin(d[2]) if d.page_count > 2 else ""

    # "onceki" YOK olabilir: Sayı 104 gibi YENİ bir program ilk kez
    # yayımlandığında kaldırdığı bir karar yoktur. Eskiden bu alan her karar
    # için zorunluydu ve yeni programda çökerdi.
    onceki, onceki_yol = (onceki_json(os.path.join(JSN, karar["onceki"]))
                          if karar.get("onceki") else (None, None))
    onceki_gruplar = {}
    if onceki:
        for g in onceki["tablolar"][0]["gruplar"]:
            for x in g["dersler"]:
                if x.get("grup"):
                    onceki_gruplar[anahtar(x["ders_adi"])] = x["grup"]

    tablo, uyarilar = tabloyu_coz(matris, karar["tablo_adi"], onceki_gruplar)
    cikti = {
        "meta": {
            "karar_sayi": kun["karar_sayi"],
            "karar_tarihi": kun["karar_tarihi"],
            "konu": karar["tablo_adi"] + " Haftalık Ders Çizelgesi",
            "kurulda_gorusulme_tarihi": kun["kurulda_gorusulme_tarihi"],
            "onceki_karar": kun["onceki_karar"],
            "kaldirilan_kararlar": kun["kaldirilan_kararlar"],
            "uygulama": kun["uygulama"],
            "notlar": [],
        },
        "kaynak_dosya": os.path.basename(belge["dosya"]),
        "kaynak_adres": belge.get("adres"),
        "kaynak_sha256": hashlib.sha256(icerik).hexdigest(),
        "uretim_notu": "ELLE DÜZENLEMEYİN. tools/uret_ogm_karar.py üretir.",
        "atilan_egik_satir": egik,
        "tablolar": [tablo],
        "aciklamalar": aciklama,
    }

    print("=" * 88)
    print("%s  <-  Karar %s (%s)" % (karar["cikti"], kun["karar_sayi"], kun["karar_tarihi"]))
    print("  kaynak       : %s" % belge["dosya"])
    print("  uygulama     : %s" % kun["uygulama"])
    print("  kaldirdigi   : %s" % ", ".join(kun["kaldirilan_kararlar"]))
    print("  ortak / secmeli ders: %d / %d  | atilan egik satir: %d"
          % (len(tablo["gruplar"][0]["dersler"]), len(tablo["gruplar"][1]["dersler"]), egik))
    print("  denklik kontrolleri: TUTTU (her sinifta ortak toplam ve genel toplam)")
    for u in uyarilar:
        print("  ! %s" % u)
    if onceki:
        print("  --- onceki karara (%s) gore fark ---" % os.path.basename(onceki_yol))
        for s in fark_raporu(onceki["tablolar"][0], tablo):
            print(s)

    if yaz:
        yol = os.path.join(JSN, karar["cikti"])
        with io.open(yol, "w", encoding="utf-8", newline="\n") as f:
            json.dump(cikti, f, ensure_ascii=False, indent=1)
        print("  YAZILDI: %s" % yol)
    return cikti


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true", help="JSON dosyalarini yaz")
    arg = ap.parse_args()
    if not os.path.exists(KUNYE):
        raise SystemExit("TTKB kunyesi yok: %s" % KUNYE)
    kunye = json.load(io.open(KUNYE, encoding="utf-8"))
    for karar in KARARLAR:
        uret(karar, kunye, arg.yaz)
    if not arg.yaz:
        print("\n(Deneme. Yazmak icin --yaz)")


if __name__ == "__main__":
    main()

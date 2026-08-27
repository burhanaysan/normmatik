# -*- coding: utf-8 -*-
"""
ORTAÖĞRETİM MÜFREDAT ÜRETİCİSİ  (elle yazılan veriyi kaynaktan üretilenle değiştirir)
=====================================================================================

NEDEN VAR
---------
`curriculumEngine.js` içindeki ANADOLU_CURRICULUM ELLE YAZILMIŞTI. 27.08.2026'da
kullanıcı canlı sitede fark etti: 9. sınıfta "İkinci Yabancı Dil (Almanca)" ZORUNLU
ders olarak duruyordu. Resmî çizelgede öyle bir zorunlu ders YOK; ikinci yabancı dil
SEÇMELİ havuzdadır ve hangi dil olduğu okulun tercihidir.

Sonucu iki katlıydı:
  1. Her Anadolu şubesi 2 hayalet saat taşıyordu -> sahte Almanca norm ihtiyacı
  2. Seçmeli hedefi 7 yerine 5 görünüyordu (40 - 34 - 1 yerine 40 - 32 - 1)

KAYNAKLAR (ikisi de resmî, ikisi de depoda)
-------------------------------------------
  Ders ve saatler :
      03_meb_mevzuat_ve_cizelgeler/ttkb_haftalik_ders_cizelgeleri/
      03_ortaogretim_genel/2025-05-20__...__20144001_202505.pdf
      (TTKB Kararı, Sayı 05, 20/05/2025)

  Ders -> branş  :
      data/kaynak_cizelgeler/mevzuat/norm_kadro_esas_dersler_cizelgesi.json
      (MEB Norm Kadroya Esas Dersler Çizelgesi, 47 branş)

İLKE
----
Bu betik ASLA kendi kendine karar vermez. Kaynakta olmayan hiçbir ders üretmez,
kaynakta olan hiçbir dersi atmaz. Karar gerektiren yerler (okulun seçtiği dil,
"Görsel Sanatlar/Müzik" gibi seçim satırları) SEÇENEK olarak işaretlenir ve
varsayılanı açıkça yazılır.

Çıktı, mevcut veriyle KARŞILAŞTIRILIR; her fark ekrana dökülür. Sessiz değişiklik yok.

ÇALIŞTIRMA
    python -X utf8 tools/uret_ortaogretim_mufredat.py            # yalnızca fark raporu
    python -X utf8 tools/uret_ortaogretim_mufredat.py --yaz      # JSON'u da yaz
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
    "03_ortaogretim_genel",
    "2025-05-20__anadolu-lisesi-haftalik-ders-cizelgesi-fen-lisesi-haftalik-d__20144001_202505.pdf")
BRANS_JSON = os.path.join(KOK, "data", "kaynak_cizelgeler", "mevzuat",
                          "norm_kadro_esas_dersler_cizelgesi.json")
CIKTI = os.path.join(KOK, "data", "kaynak_cizelgeler", "ogm",
                     "uretilen_anadolu_lisesi.json")

# --------------------------------------------------------------------------
# SEÇİM SATIRLARI
# --------------------------------------------------------------------------
# Çizelgede tek satır, ama okul içinden birini seçer. Resmî ders->branş
# çizelgesinden tek bir branş türetilemez; bu yüzden seçenekler AÇIKÇA yazılır.
# `varsayilan`, uygulamanın bugünkü davranışıyla aynıdır — üretim sırasında
# norm sonucu KENDILIGINDEN değişmesin diye. Değiştirmek kullanıcının kararıdır.
SECIM_SATIRLARI = {
    "BİRİNCİ YABANCI DİL": {
        "gorunen": "Birinci Yabancı Dil (İngilizce)",
        "varsayilan": "İngilizce",
        "secenekler": ["İngilizce", "Almanca", "Fransızca"],
        "not": "Okulun okuttuğu birinci yabancı dile göre değişir.",
    },
    "GÖRSEL SANATLAR/MÜZİK": {
        "gorunen": "Görsel Sanatlar/Müzik",
        "varsayilan": "Görsel Sanatlar",
        "secenekler": ["Görsel Sanatlar", "Müzik"],
        "not": "Çizelgede tek satır; okul ikisinden birini okutur.",
    },
    "BEDEN EĞİTİMİ VE SPOR/GÖRSEL SANATLAR/MÜZİK": {
        "gorunen": "Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik",
        "varsayilan": "Beden Eğitimi",
        "secenekler": ["Beden Eğitimi", "Görsel Sanatlar", "Müzik"],
        "not": "12. sınıf; çizelgede tek satır, üçünden biri okutulur.",
    },
    "REHBERLİK VE YÖNLENDİRME": {
        "gorunen": "Rehberlik ve Yönlendirme",
        "varsayilan": "Rehberlik",
        "secenekler": ["Rehberlik"],
        "kategori": "REHBERLİK",
        "not": "Sınıf rehberliği dersi; hangi branşa yazıldığı kullanıcı kuralıdır.",
    },
}

BARAJ = {"TÜRK DİLİ VE EDEBİYATI"}

# --------------------------------------------------------------------------
# BRANŞ ADI EŞLEŞTİRME  (resmî çizelge  ->  uygulamanın kanonik adı)
# --------------------------------------------------------------------------
# Resmî çizelge, adları tabloya sığdırmak için kısaltmış. Uygulama ise uzun
# hâllerini kullanıyor ve öğretmen kayıtları da o adlarla tutuluyor.
#
# Bu iki ad birbirine çevrilmezse ders hiçbir öğretmene bağlanmaz ve o branşın
# normu SESSİZCE sıfır çıkar. Örnek: çizelge "Din Kültürü ve A.B." yazıyor,
# uygulama 59 yerde "Din Kültürü ve Ahlak Bilgisi" kullanıyor.
BRANS_ESLESTIRME = {
    "Din Kültürü ve A.B.": "Din Kültürü ve Ahlak Bilgisi",
    "Sağlık / Sağlık Hizmetleri": "Sağlık Hizmetleri",
    "Kimya Teknolojisi": "Kimya / Kimya Teknolojisi",
    "Elektrik-Elektronik Teknoloji": "Elektrik-Elektronik Teknolojisi",
    "Büro Yönetimi / Yönetici Asist.": "Büro Yönetimi ve Yönetici Asistanlığı",
    "Güzellik Saç Bakım Hizmetleri": "Güzellik Hizmetleri",
}

DATABASE_JS = os.path.join(KOK, "js", "database.js")


def uygulama_branslari():
    """
    database.js içindeki kanonik branş listelerini okur.

    Liste elle kopyalanmaz; doğrudan kaynaktan okunur. Aksi hâlde uygulamada
    bir branş adı değişince bu betik bunu fark etmez ve kapı işlevsiz kalır.
    """
    metin = open(DATABASE_JS, encoding="utf-8").read()
    adlar = set()
    for blok in ("CANONICAL_CULTURE_BRANCHES", "CANONICAL_VOCATIONAL_BRANCHES"):
        i = metin.find(blok)
        if i < 0:
            raise SystemExit("!! database.js içinde %s bulunamadı" % blok)
        ac = metin.index("[", i)
        kapa = metin.index("]", ac)
        adlar.update(re.findall(r'"([^"]+)"', metin[ac:kapa]))
    if len(adlar) < 40:
        raise SystemExit("!! branş listesi şüpheli derecede kısa (%d)" % len(adlar))
    return adlar

# --------------------------------------------------------------------------
# KADEMEYE GÖRE BRANŞ ELEME
# --------------------------------------------------------------------------
# Resmî branş çizelgesi bütün kademeleri tek listede toplar. Bu yüzden
# "Matematik" hem Matematik branşının hem Sınıf Öğretmenliğinin listesinde
# geçer ve dışarıdan bakınca BELİRSİZ görünür. Oysa belirsizlik sahtedir:
# sınıf öğretmeni ilkokulda (1-4) derse girer, lisede girmez.
#
# Kademeyi hesaba katmadan bu satırlar elenirse üretim SESSİZCE eksik veri
# çıkarır. Nitekim ilk denemede tam da bu oldu: 9. ve 10. sınıfta MATEMATİK
# düştü, ortak toplam 32 yerine 26 çıktı. Hatayı, çizelgenin kendi toplam
# satırıyla karşılaştırma yakaladı.
#
# Aşağıdakiler resmî çizelgedeki 47 branştan, LİSEDE derse girmeyenlerdir:
#   Sınıf Öğretmenliği / Okul Öncesi -> ilkokul ve öncesi
#   Türkçe / Sosyal Bilgiler / Fen Bilimleri -> ortaokul
#     (lisedeki karşılıkları sırasıyla Türk Dili ve Edebiyatı, Tarih-Coğrafya,
#      ve Biyoloji'dir; nitekim resmî çizelge "Fen Bilimleri (Lise)" dersini
#      Biyoloji branşının altına yazmıştır)
#   Özel Eğitim -> kullanıcı kararıyla kapsam dışı
KADEME_DISI_BRANSLAR = {
    "lise": {"Sınıf Öğretmenliği", "Okul Öncesi",
             "Türkçe", "Sosyal Bilgiler", "Fen Bilimleri", "Özel Eğitim"},
}


def tr_kucuk(s):
    tr = {"İ": "i", "I": "i", "ı": "i", "Ş": "s", "ş": "s", "Ğ": "g", "ğ": "g",
          "Ü": "u", "ü": "u", "Ö": "o", "ö": "o", "Ç": "c", "ç": "c"}
    return "".join(tr.get(c, c) for c in s).lower()


def anahtar(s):
    """
    Karşılaştırma anahtarı. Şapkalı harfler de sadeleşir: resmî çizelgeler
    "Temel Dinî Bilgiler" yazarken uygulama "Temel Dini Bilgiler" kullanıyor.
    Şapka atılmazsa aynı ders iki ayrı ders sanılır ve eşleşme kaçar.
    """
    s = s.replace("î", "i").replace("Î", "i").replace("â", "a")          .replace("Â", "a").replace("û", "u").replace("Û", "u")
    s = tr_kucuk(s)
    s = re.sub(r"\(.*?\)", " ", s)
    return re.sub(r"[^a-z0-9]", "", s)


def tr_lower(s):
    """
    Gerçek Türkçe küçültme. `tr_kucuk` ANAHTAR üretmek içindir ve Türkçe
    harfleri ASCII'ye indirger (ğ->g, ı->i ...); GÖRÜNEN metinde kullanılırsa
    "Coğrafya" -> "Cografya" olur. İlk denemede tam olarak bu oldu.

    Python'un kendi .lower()'ı Ş/Ğ/Ü/Ö/Ç için doğrudur; yalnızca I ve İ
    yanlıştır ("İ".lower() -> i + birleşen nokta). O ikisi önden çevrilir.
    """
    return "".join({"I": "ı", "İ": "i"}.get(c, c) for c in s).lower()


def tr_upper_ilk(k):
    return {"i": "İ", "ı": "I"}.get(k[0], k[0].upper()) + k[1:] if k else k


def baslik_yap(s):
    """'TÜRK DİLİ VE EDEBİYATI *' -> 'Türk Dili ve Edebiyatı'"""
    s = re.sub(r"[*†‡]+", " ", s).strip()             # PDF dipnot işaretleri
    kucukler = {"ve", "ile", "veya"}
    kelimeler = []
    for k in s.split():
        kl = tr_lower(k)
        if kl in kucukler:
            kelimeler.append(kl)
        elif re.fullmatch(r"([A-ZÇĞİÖŞÜ]\.)+", k):
            kelimeler.append(k)                       # T.C. gibi kısaltmalar
        else:
            # Eğik çizgiden sonraki kelime de büyük harfle başlar:
            # "Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik" tek bir kelime
            # sayıldığı için "Spor/görsel Sanatlar/müzik" çıkıyordu.
            kelimeler.append("/".join(tr_upper_ilk(p) for p in kl.split("/")))
    return " ".join(kelimeler)


def ders_brans_haritasi(kademe="lise"):
    """
    Resmî branş çizelgesini ters çevirir: ders adı -> branş.

    Kademe dışı branşlar elenir (bkz. KADEME_DISI_BRANSLAR). Elemeden SONRA
    hâlâ birden fazla branşa yazılmış bir ders kalıyorsa, o GERÇEK bir
    belirsizliktir; eşleme yapılmaz ve üretim o dersi atlayıp uyarı verir.
    Sessizce bir branş seçmek, yanlış branşa norm yazmak demektir.
    """
    d = json.load(open(BRANS_JSON, encoding="utf-8"))
    disari = KADEME_DISI_BRANSLAR.get(kademe, set())
    harita, cakisan = {}, {}
    for b in d["branslar"]:
        if b["brans_adi"] in disari:
            continue
        ad = BRANS_ESLESTIRME.get(b["brans_adi"], b["brans_adi"])
        for ders in b.get("norma_dahil_dersler") or []:
            a = anahtar(ders)
            cakisan.setdefault(a, set()).add(ad)
            harita[a] = ad
    belirsiz = {a: sorted(v) for a, v in cakisan.items() if len(v) > 1}
    for a in belirsiz:
        harita.pop(a, None)
    return harita, belirsiz


def cizelge_oku(sayfa_no=1):
    """Resmî PDF'ten ders adı + 4 sınıfın saatlerini geometrik olarak çıkarır."""
    sayfa = fitz.open(PDF)[sayfa_no]
    kelimeler = []
    for blok in sayfa.get_text("dict")["blocks"]:
        for l in blok.get("lines", []):
            dx, dy = l.get("dir", (1, 0))
            if not ((abs(dx) > .99 and abs(dy) < .01) or (abs(dy) > .99 and abs(dx) < .01)):
                continue                              # eğik = filigran
            for sp in l["spans"]:
                m = sp["text"].strip()
                if m:
                    x0, y0, x1, y1 = sp["bbox"]
                    kelimeler.append((x0, y0, x1, y1, m, abs(dy) > .99))

    ust = sorted([k for k in kelimeler if re.fullmatch(r"(9|10|11|12)", k[4])],
                 key=lambda k: k[1])[:4]
    sutun = sorted(round((k[0] + k[2]) / 2) for k in ust)
    if len(sutun) != 4:
        raise SystemExit("!! Sınıf sütunları bulunamadı: %s" % sutun)

    def sn(x0, x1):
        xm = (x0 + x1) / 2
        for i, s in enumerate(sutun):
            if abs(xm - s) < 16:
                return i
        return None

    satirlar = []
    for x0, y0, x1, y1, m, dik in sorted(kelimeler, key=lambda k: (k[1], k[0])):
        ym = (y0 + y1) / 2
        for s in satirlar:
            if abs(s["y"] - ym) < 5:
                s["o"].append((x0, x1, m, dik)); break
        else:
            satirlar.append({"y": ym, "o": [(x0, x1, m, dik)]})

    sol = sutun[0] - 22
    cikti = []
    for s in satirlar:
        et, sa = [], [None] * 4
        for x0, x1, m, dik in sorted(s["o"]):
            c = sn(x0, x1)
            if c is not None and re.fullmatch(r"\d+", m):
                sa[c] = int(m)
            elif x0 < sol and not dik:
                et.append(m)
        e = re.sub(r"\s+", " ", " ".join(et)).strip()
        if e and any(x is not None for x in sa):
            cikti.append((e, sa))
    return cikti


def uret():
    harita, cakisan = ders_brans_haritasi()
    satirlar = cizelge_oku()

    # Toplam satırları ayrı tutulur: doğrulama için kullanılır, derse çevrilmez
    toplamlar = {}
    dersler = {"9": [], "10": [], "11": [], "12": []}
    secmeli_baslangici = False
    uyari = []

    for ad, saatler in satirlar:
        # Dipnot yıldızı ders adının parçası değildir; hem seçim satırı
        # aramasında hem baraj ders kontrolünde eşleşmeyi bozar.
        AD = re.sub(r"\s+", " ", re.sub(r"[*†‡]+", " ", ad)).strip().upper()
        if "TOPLAM" in AD or "SEÇİLEBİLECEK" in AD:
            toplamlar[ad] = saatler
            if "ORTAK DERS SAATİ TOPLAMI" in AD:
                secmeli_baslangici = True         # bundan sonrası seçmeli havuz
            continue
        if secmeli_baslangici and AD not in SECIM_SATIRLARI:
            continue                              # seçmeli dersler zorunlu listeye girmez

        secim = SECIM_SATIRLARI.get(AD)
        if secim:
            gorunen = secim["gorunen"]
            brans = secim["varsayilan"]
            kategori = secim.get("kategori", "ORTAK DERSLER")
        else:
            gorunen = baslik_yap(ad)
            brans = harita.get(anahtar(ad))
            kategori = "ORTAK DERSLER"
            if not brans:
                uyari.append("branş eşleşmedi: %s" % ad)
                continue

        for i, sinif in enumerate(["9", "10", "11", "12"]):
            if saatler[i]:
                kayit = {"ders": gorunen, "saat": saatler[i],
                         "atananBrans": brans, "kategori": kategori}
                if AD in BARAJ:
                    kayit["baraj_ders"] = True
                if secim and len(secim["secenekler"]) > 1:
                    kayit["secenekler"] = secim["secenekler"]
                dersler[sinif].append(kayit)

    # ---------------------------------------------------------------- KAPI
    # Üretilen her branş adı, uygulamanın tanıdığı bir ad olmak ZORUNDA.
    # Tanımayan bir ad üretilirse ders hiçbir öğretmene bağlanmaz ve o branşın
    # normu sessizce sıfır çıkar. Sessiz kalmaktansa üretimi durdurmak yeğdir.
    tanidik = uygulama_branslari()
    yabanci = sorted({d["atananBrans"] for s in dersler.values() for d in s}
                     - tanidik)
    if yabanci:
        print()
        print("!! ÜRETİM DURDURULDU — uygulamanın tanımadığı branş adı üretildi:")
        for y in yabanci:
            print("     %s" % y)
        print("   Çözüm: BRANS_ESLESTIRME sözlüğüne karşılığını ekleyin.")
        raise SystemExit(2)

    return dersler, toplamlar, uyari, cakisan


CURRICULUM_JS = os.path.join(KOK, "js", "curriculumEngine.js")


def js_metni(dersler, girinti):
    """Üretilen veriyi curriculumEngine.js'in kendi biçiminde JS'e çevirir."""
    g, g2, g3 = girinti, girinti + "    ", girinti + "        "
    s = [g + "// " + "-" * 68,
         g + "// ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN.",
         g + "// Kaynak : " + os.path.basename(PDF),
         g + "//          TTKB Sayı 05, 20/05/2025",
         g + "// Branş  : norm_kadro_esas_dersler_cizelgesi.json",
         g + "// Üreteç : tools/uret_ortaogretim_mufredat.py",
         g + "// Elle yazılmış hâlinde iki hata vardı: (1) zorunlu görünen bir",
         g + "// 'İkinci Yabancı Dil (Almanca)' dersi — çizelgede seçmelidir,",
         g + "// (2) 12. sınıfta Beden Eğitimi ve Görsel Sanatlar ayrı ayrı",
         g + "// yazılmıştı — çizelgede tek satırdır ve okul birini seçer.",
         g + "// " + "-" * 68,
         g + "const ANADOLU_CURRICULUM = {"]
    for i, sinif in enumerate(["9", "10", "11", "12"]):
        s.append(g2 + '"%s": [' % sinif)
        for j, d in enumerate(dersler[sinif]):
            alan = ['ders: %s' % json.dumps(d["ders"], ensure_ascii=False),
                    'saat: %d' % d["saat"],
                    'atananBrans: %s' % json.dumps(d["atananBrans"], ensure_ascii=False)]
            if d.get("baraj_ders"):
                alan.append("baraj_ders: true")
            alan.append('kategori: %s' % json.dumps(d["kategori"], ensure_ascii=False))
            son = "" if j == len(dersler[sinif]) - 1 else ","
            satir = g3 + "{ " + ", ".join(alan) + " }" + son
            if d.get("secenekler"):
                satir += "   // okul seçer: " + " / ".join(d["secenekler"])
            s.append(satir)
        s.append(g2 + "]" + ("" if i == 3 else ","))
    s.append(g + "};")
    return "\n".join(s)


def js_yaz(dersler):
    """curriculumEngine.js içindeki ANADOLU_CURRICULUM bloğunu değiştirir."""
    metin = open(CURRICULUM_JS, encoding="utf-8").read()
    m = re.search(r"^([ \t]*)const ANADOLU_CURRICULUM\s*=\s*\{", metin, re.M)
    if not m:
        raise SystemExit("!! ANADOLU_CURRICULUM bulunamadı")
    girinti = m.group(1)
    # Blok sonunu süslü parantez sayarak bul (ders adlarında parantez yok,
    # ama yine de metin içi kaçışlara karşı basit bir sayaç yeterli).
    ac = metin.index("{", m.start())
    d, j = 1, ac + 1
    while j < len(metin) and d:
        if metin[j] == "{":
            d += 1
        elif metin[j] == "}":
            d -= 1
        elif metin[j] == '"':
            j += 1
            while j < len(metin) and metin[j] != '"':
                j += 2 if metin[j] == "\\" else 1
        j += 1
    while j < len(metin) and metin[j] in ";\r\n":
        j += 1
        if metin[j - 1] == "\n":
            break

    # Önceki üretimden kalan başlık yorumunu da temizle ki yorum yığılmasın
    bas = m.start()
    onceki = metin.rfind("// " + "-" * 68, 0, bas)
    if onceki > 0 and "ÜRETİLMİŞTİR" in metin[onceki:bas]:
        bas = metin.rindex("\n", 0, onceki) + 1

    yeni = metin[:bas] + js_metni(dersler, girinti) + "\n" + metin[j:]
    with open(CURRICULUM_JS, "w", encoding="utf-8") as f:
        f.write(yeni)
    return CURRICULUM_JS


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true", help="JSON ciktisini diske yaz")
    ap.add_argument("--js", action="store_true",
                    help="curriculumEngine.js icindeki ANADOLU_CURRICULUM'u degistir")
    arg = ap.parse_args()

    print("ORTAÖĞRETİM MÜFREDAT ÜRETİCİSİ")
    print("=" * 74)
    print("Kaynak çizelge : %s" % os.path.basename(PDF)[:60])
    print("Kaynak branş   : %s" % os.path.basename(BRANS_JSON))
    print()

    dersler, toplamlar, uyari, cakisan = uret()

    # ---------------------------------------------------------- doğrulama
    print("DOĞRULAMA — üretilen toplam, çizelgenin kendi toplamıyla tutuyor mu?")
    print("-" * 74)
    ortak = None
    for ad, s in toplamlar.items():
        if "ORTAK DERS SAATİ TOPLAMI" in ad.upper():
            ortak = s
    hata = 0
    for i, sinif in enumerate(["9", "10", "11", "12"]):
        # Rehberlik ortak toplamın dışındadır (çizelgede ayrı satır)
        toplam = sum(d["saat"] for d in dersler[sinif]
                     if d["kategori"] == "ORTAK DERSLER")
        beklenen = ortak[i] if ortak else None
        tamam = (beklenen is None) or (toplam == beklenen)
        if not tamam:
            hata += 1
        print("  %s. sınıf: üretilen ortak %2d  |  çizelge %s  %s"
              % (sinif, toplam, beklenen, "✓" if tamam else "✗ TUTMUYOR"))

    if cakisan:
        print()
        print("KADEME ELEMESİNDEN SONRA HÂLÂ BELİRSİZ OLAN DERSLER:")
        for a, v in sorted(cakisan.items()):
            print("  ~ %-24s -> %s" % (a, ", ".join(v)))
        print("  (bu dersler çizelgede geçerse eşlenmez, uyarı verilir)")

    if uyari:
        print()
        print("UYARILAR:")
        for u in uyari:
            print("  !", u)

    print()
    print("ÜRETİLEN DERS SAYISI: " + ", ".join(
        "%s. sınıf %d" % (s, len(dersler[s])) for s in ["9", "10", "11", "12"]))

    if arg.yaz:
        os.makedirs(os.path.dirname(CIKTI), exist_ok=True)
        with open(CIKTI, "w", encoding="utf-8") as f:
            json.dump({
                "kaynak_cizelge": os.path.basename(PDF),
                "kaynak_brans": os.path.basename(BRANS_JSON),
                "karar": "TTKB Sayı 05, 20/05/2025",
                "uretim_notu": "ELLE DÜZENLEMEYİN. tools/uret_ortaogretim_mufredat.py üretir.",
                "cizelge_toplamlari": toplamlar,
                "dersler": dersler,
            }, f, ensure_ascii=False, indent=1)
        print()
        print("yazıldı: %s" % CIKTI)

    if arg.js:
        if hata:
            print()
            print("!! Doğrulama tutmadığı için curriculumEngine.js'e YAZILMADI.")
            return 1
        print()
        print("motora yazıldı: %s" % js_yaz(dersler))
        print("UNUTMAYIN: python -X utf8 tools/build_bundle.py")

    print("=" * 74)
    return 1 if hata else 0


if __name__ == "__main__":
    sys.exit(main())

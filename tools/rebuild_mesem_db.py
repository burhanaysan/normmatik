# -*- coding: utf-8 -*-
"""
mesem_curriculum_db.js YENIDEN URETICI
======================================

TEK GERCEK KAYNAK:  data/kaynak_cizelgeler/mesem/sinif_{9,10,11,12}.json
CIKTI            :  js/mesem_curriculum_db.js

Bu dosya, uygulamanin MESEM (Mesleki Egitim Merkezi / ciraklik) haftalik ders
cizelgelerini tuttugu tek yerdir.

NEDEN VAR (2026-08-24):
    curriculumEngine.js icinde MESEM mufredati ELLE YAZILMIS 4 sinifliK sabit
    bir listeydi ve ders adlari UYDURMAYDI:
        `${dalNameStr} Meslek Teknolojisi`
        `${dalNameStr} Ustalik Egitimi ve Ahilik`
    MEB cerceve programlarinda boyle dersler YOKTUR. 36 alanin 214 dalinin
    tamami ayni 5 satiri goruyordu; ders adi, saat ve kategori dagilimi
    gercekle ilgisizdi. Bu uretici, 40 resmi MESEM COP PDF'inden geometrik
    ayristiriciyla cikarilan ve her kayit KENDI TOPLAM SATIRIYLA dogrulanan
    856 cizelgeyi (36 alan x 214 dal x 4 sinif) yerine koyar.

KATEGORI DONUSUMU — EN KRITIK KISIM
-----------------------------------
curriculumEngine.js su testle atolye yukunu ayirir:
        isAtolye = kategori.includes("MESLEK")
MESEM kaynak kategorileri "TEMEL DERSLER" ve "ALAN/DAL DERSLERI"dir; ikisi de
"MESLEK" gecmez. Ham kategoriler oldugu gibi tasinsaydi 32 saatlik
"Isletmelerde Mesleki Egitim" atolye disi sayilir, Madde 18/19 kovalari
yanlis dolardi. Bu yuzden kategoriler asagida BILEREK yeniden adlandirilir.

ISLETMELERDE MESLEKI EGITIM — MTEGM'DEN FARKI
---------------------------------------------
MTEGM protokol cizelgelerinde bu satir TOPLAM DERS SAATI satirinin ALTINDA
basilir, yani cizelgenin kendi toplamina DAHIL DEGILDIR; orada ders yuku
sayilmaz (bkz. rebuild_curriculum_db.py). MESEM'de tersidir: dort sinifta da
32 saattir ve TOPLAM DERS SAATI'na DAHILDIR (6+2+2+32 = 42). Bu yuzden burada
ders olarak tutulur. Yuku zaten normEngine.js Madde 22/2 cirak grubu
formulune girer (normEngine.js:168-176).

FARK DERSLERI (parantezli saatler)
----------------------------------
Cizelgede "1-(3)" gibi hucreler vardir. Cerceve programin "Uygulanmasina
Iliskin Aciklamalar" madde 10'u: parantez ici, 1739 sayili kanunun 26.
maddesine gore DIPLOMA programini secen ogrenciler icin fark dersi saatidir.
Cizelgenin kendi TOPLAM satiri yalnizca parantez DISINDAKI sayiyi toplar.
Bu yuzden `saat` = parantez disi deger; parantez ici `fark_saati` olarak
AYRI tutulur ve hicbir toplama girmez. Uygulamada "diploma programi ogrenci
sayisi" girisi yoktur; alan ileride kullanilmak uzere veride durur.

CALISTIRMA:
    python tools/rebuild_mesem_db.py
Ardindan MUTLAKA:
    python tools/build_bundle.py
"""

import json
import os
import re
import sys
import unicodedata
from collections import OrderedDict, defaultdict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE_DIR, "data", "kaynak_cizelgeler", "mesem")
OUT_FILE = os.path.join(BASE_DIR, "js", "mesem_curriculum_db.js")
GRADES = ["9", "10", "11", "12"]

# ---------------------------------------------------------------------------
# KATEGORI DONUSUMU
# Sol taraf: MESEM cerceve programinin kendi blok adi.
# Sag taraf: uygulamanin kategori sozlugu (curriculumEngine "MESLEK" arar).
# ---------------------------------------------------------------------------
KATEGORI_HARITASI = {
    "TEMEL DERSLER": "ORTAK DERSLER",
    "ALAN/DAL DERSLERİ": "ALAN VE DAL MESLEK DERSLERİ",
    "İŞLETMELERDE MESLEKİ EĞİTİM": "ALAN VE DAL MESLEK DERSLERİ",
    "SEÇMELİ DERSLER": "SEÇMELİ DERSLER",
}

# ---------------------------------------------------------------------------
# ALAN -> MEB ATAMA BRANSI
# Kaynak: TTKB "Ogretmenlik Alanlari, Atama ve Ders Okutma Esaslari",
# atamaya esas alanlar cizelgesi (97 alan).
# Bransin YAZILISI, uygulamanin MTEGM tarafinda kullandigi yazilisla AYNI
# tutuldu (curriculumEngine.js AREA_BRANCH_MAP). Ayni ogretmen brasinin iki
# ayri metinle iki ayri brans gibi gorunmesi, norm dagilimini boler.
# ---------------------------------------------------------------------------
ALAN_BRANSI = {
    "AYAKKABI VE SARACİYE TEKNOLOJİSİ": "Ayakkabı ve Saraciye Teknolojisi",
    "BÜRO YÖNETİMİ": "Büro Yönetimi ve Yönetici Asistanlığı",
    "BİLİŞİM TEKNOLOJİLERİ": "Bilişim Teknolojileri",
    "DENİZCİLİK": "Denizcilik",
    "EL SANATLARI TEKNOLOJİSİ": "El Sanatları Teknolojisi",
    "ELEKTRİK-ELEKTRONİK TEKNOLOJİSİ": "Elektrik-Elektronik Teknolojisi",
    "ENDÜSTRİYEL OTOMASYON TEKNOLOJİLERİ": "Endüstriyel Otomasyon Teknolojileri",
    "GEMİ YAPIMI": "Gemi Yapımı",
    "GIDA TEKNOLOJİSİ": "Gıda Teknolojisi",
    "GRAFİK VE FOTOĞRAF": "Grafik ve Fotoğraf",
    # TTKB cizelgesi: "Guzellik ve Sac Bakim Hizmetleri / Guzellik Hizmetleri"
    "GÜZELLİK VE SAÇ BAKIM HİZMETLERİ": "Güzellik Hizmetleri",
    "HARİTA-TAPU-KADASTRO": "Harita-Tapu-Kadastro",
    "HAYVAN YETİŞTİRİCİLİĞİ VE SAĞLIĞI": "Hayvan Yetiştiriciliği ve Sağlığı",
    "KONAKLAMA VE SEYAHAT HİZMETLERİ": "Konaklama ve Seyahat Hizmetleri",
    "KUYUMCULUK TEKNOLOJİSİ": "Kuyumculuk Teknolojisi",
    "KİMYA TEKNOLOJİSİ": "Kimya / Kimya Teknolojisi",
    "MAKİNE TEKNOLOJİSİ": "Makine ve Tasarım Teknolojisi",
    # TTKB: "Matbaa/Matbaa Teknolojisi". Uygulama MTEGM tarafinda ayni brans
    # icin "Basim Teknolojileri" yazilisini kullaniyor; birlik icin o secildi.
    "MATBAA TEKNOLOJİSİ": "Basım Teknolojileri",
    "METAL TEKNOLOJİSİ": "Metal Teknolojisi",
    "METALÜRJİ TEKNOLOJİSİ": "Metalürji Teknolojisi",
    "MOBİLYA VE İÇ MEKÂN TASARIMI": "Mobilya ve İç Mekân Tasarımı",
    "MODA TASARIM TEKNOLOJİLERİ": "Moda Tasarım Teknolojileri",
    "MOTORLU ARAÇLAR TEKNOLOJİSİ": "Motorlu Araçlar Teknolojisi",
    "MUHASEBE VE FİNANSMAN": "Muhasebe ve Finansman",
    "MÜZİK ALETLERİ YAPIMI": "Müzik Aletleri Yapımı",
    "PAZARLAMA VE PERAKENDE": "Pazarlama ve Perakende",
    "PLASTİK TEKNOLOJİSİ": "Plastik Teknolojisi",
    "SERAMİK VE CAM TEKNOLOJİSİ": "Seramik ve Cam Teknolojisi",
    # TTKB cizelgesinde "Siber Guvenlik" diye AYRI bir atama alani YOKTUR.
    "SİBER GÜVENLİK": "Bilişim Teknolojileri",
    "TARIM": "Tarım",
    "TEKSTİL TEKNOLOJİSİ": "Tekstil Teknolojisi",
    "TESİSAT TEKNOLOJİSİ VE İKLİMLENDİRME": "Tesisat Teknolojisi ve İklimlendirme",
    "ULAŞTIRMA HİZMETLERİ": "Ulaştırma Hizmetleri",
    "YENİLENEBİLİR ENERJİ TEKNOLOJİLERİ": "Yenilenebilir Enerji Teknolojileri",
    "YİYECEK İÇECEK HİZMETLERİ": "Yiyecek İçecek Hizmetleri",
    "İNŞAAT TEKNOLOJİSİ": "İnşaat Teknolojisi",
}

# ---------------------------------------------------------------------------
# PROTOKOL CIZELGELERI — AYRI ALAN OLARAK TUTULUR
# Uc PDF'in kapak basligi "Mesleki Egitim Merkezi PROTOKOL KAPSAMINDAKI
# OKULLAR ICIN ... Alani" der ve icerik gercekten farklidir. Olculdu:
#     Yiyecek Icecek / Ascilik, 9. sinif
#       normal   : ... BESLENME ILKELERI VE HIJYEN 2
#       protokol : ... YABANCI DIL 5 + BESLENME ILKELERI VE HIJYEN 1
# Ayni alan adi altinda birlestirilirlerse uygulama ikisinden BIRINI sessizce
# secer ve ders yuku 4 saat yanlis cikar. Bu yuzden ayri anahtar, ayri ad.
# ---------------------------------------------------------------------------
_PROTOKOL_RE = re.compile(r"^\d{4}_[a-z]*pro_mem_cop\.pdf$", re.I)
PROTOKOL_ETIKETI = "(PROTOKOL KAPSAMINDAKİ OKULLAR)"

_DIPNOT_RE = re.compile(r"\s*\(\*+\)")
_TR_SLUG = {
    "Ç": "c", "Ğ": "g", "I": "i", "İ": "i", "Ö": "o", "Ş": "s", "Ü": "u",
    "ç": "c", "ğ": "g", "ı": "i", "i": "i", "ö": "o", "ş": "s", "ü": "u",
    "Â": "a", "â": "a", "Î": "i", "î": "i", "Û": "u", "û": "u",
}


def alan_cekirdegi(alan_adi):
    """'HAYVAN ... ALANI' -> 'HAYVAN ...' (sondaki ALANI sozcugu atilir)."""
    ad = re.sub(r"\s+", " ", str(alan_adi or "").strip()).upper()
    return re.sub(r"\s*ALANI$", "", ad).strip()


def slug(metin):
    """
    Alan adindan uygulama anahtari uretir.
    'HAYVAN YETİŞTİRİCİLİĞİ VE SAĞLIĞI' -> 'hayvan_yetistiriciligi_ve_sagligi'

    NEDEN ALAN ADINDAN, DOSYA ADINDAN DEGIL: MEB dosya adlari kisaltmalidir ve
    surumden surume degisir (matbaa/basim, motorlu/motorluarac...). Alan adi
    cizelgenin kendi basligindan gelir ve kaynagin resmi metnidir.
    """
    ç = "".join(_TR_SLUG.get(h, h) for h in str(metin or ""))
    ç = unicodedata.normalize("NFKD", ç)
    ç = "".join(h for h in ç if not unicodedata.combining(h))
    ç = ç.lower()
    ç = re.sub(r"[^a-z0-9]+", "_", ç)
    return ç.strip("_")


_KUCUK_KALAN = {"ve", "ile", "için"}


def baslik_bicimi(metin):
    """
    'HAYVAN YETİŞTİRİCİLİĞİ VE SAĞLIĞI ALANI' ->
    'Hayvan Yetiştiriciliği ve Sağlığı Alanı'

    Ekranda alan listesi bu adla gorunur; MTEGM tarafi da baslik bicimi
    kullanir (database.js CANONICAL_ALAN_NAMES). Iki liste ayni okulda yan
    yana gorunmese de, ayni uygulamada iki ayri yazim tutarsiz durur.
    Turkce'ye ozgu kural: 'I' -> 'ı', 'İ' -> 'i'.
    """
    def kucult(h):
        return h.replace("I", "ı").replace("İ", "i").lower()

    parcalar = []
    for i, s in enumerate(str(metin or "").split()):
        kucuk = kucult(s)
        if i > 0 and kucuk in _KUCUK_KALAN:
            parcalar.append(kucuk)
        elif "-" in s:
            parcalar.append("-".join(p[:1] + kucult(p[1:]) for p in s.split("-")))
        else:
            parcalar.append(s[:1] + kucult(s[1:]))
    return " ".join(parcalar)


def ders_temizle(ad):
    """Dipnot isaretini addan ayirir; baraj bilgisini dondurur.

    MESEM cizelgelerinin kendi dipnotu: "(*) ... yilsonu basari puani ile
    basarili sayilamayacak derslerdir." Isaret adin parcasi degildir; adda
    kalirsa ayni ders veri tabaninda iki ayri ad olur ve yuk bolunur.
    """
    ham = str(ad or "").strip()
    baraj = "(*)" in ham
    temiz = re.sub(r"\s+", " ", _DIPNOT_RE.sub("", ham)).strip()
    return temiz, baraj


def dal_adi_duzelt(dal_adi):
    """Dal adini butun siniflarda ayni bicime getirir: '... DALI' ile biter."""
    d = re.sub(r"\s+", " ", str(dal_adi or "").strip()).upper()
    if not d:
        return d
    if not d.endswith("DALI"):
        d += " DALI"
    return d


def baslik_uret(alan_adi, dal_adi, protokol=False):
    """
    Baslik bicimi SABITTIR ve okuyan taraflarla sozlesmedir:

        MESLEKİ EĞİTİM MERKEZİ <ALAN> (<DAL>) HAFTALIK DERS ÇİZELGESİ

    Dal adi, " HAFTALIK" sozcugunden ONCEKI son parantezin icidir. Ilk
    parantezi almak YETMEZ: bazi dal adlarinin KENDISINDE parantez vardir
    ("TEKSTİL BİTİM İŞLEMLERİ (APRE) DALI"); ilk parantez okunursa dal adi
    "TEKSTİL BİTİM İŞLEMLERİ (APRE" diye kirpilir ve hicbir dala eslesmez.

    Protokol etiketi basliga PARANTEZSIZ ve EN SONA eklenir; parantez icine
    konursa dal ayikliyicisini bozar.
    """
    b = "MESLEKİ EĞİTİM MERKEZİ %s (%s) HAFTALIK DERS ÇİZELGESİ" % (
        alan_adi, dal_adi_duzelt(dal_adi))
    if protokol:
        b += " - PROTOKOL KAPSAMINDAKİ OKULLAR İÇİN"
    return b


def kayit_to_cizelge(rec, alan_adi, protokol=False):
    dersler = []
    bilinmeyen_kategori = []
    for c in rec.get("dersler", []):
        ham_kat = str(c.get("kategori") or "").strip()
        kat = KATEGORI_HARITASI.get(ham_kat)
        if kat is None:
            # Sessizce "ORTAK DERSLER"e dusurmek, 32 saatlik isletme dersini
            # atolye disina atabilecegi icin tehlikelidir: bilerek raporlanir.
            bilinmeyen_kategori.append((rec.get("kaynak_dosya"),
                                        rec.get("kaynak_sayfa"), ham_kat))
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
        satir = OrderedDict([
            ("ders", temiz),
            ("saat", saat),
            ("kategori", kat),
            ("baraj_ders", bool(baraj)),
        ])
        fark = c.get("fark_saati")
        if isinstance(fark, int) and fark > 0:
            satir["fark_saati"] = fark
        dersler.append(satir)

    ozet = rec.get("ozet") or {}
    return OrderedDict([
        ("page", rec.get("kaynak_sayfa") or 0),
        ("title", baslik_uret(alan_adi, rec.get("dal_adi") or "ALAN ORTAK",
                              protokol)),
        ("grade", str(rec.get("sinif_seviyesi") or "")),
        ("courses", dersler),
        # Secmeli blok cizelgede yalnizca SAAT olarak verilir, ders adi yoktur
        # ("secilebilecek ders saati"). Ders listesine uydurma satir eklemek
        # yerine sayi olarak saklanir.
        ("secmeli_saat", int(ozet.get("secmeli_ders_saati_toplami") or 0)),
        ("toplam_saat", int(ozet.get("toplam_ders_saati") or 0)),
    ]), bilinmeyen_kategori


def main():
    ham = defaultdict(lambda: defaultdict(list))    # [anahtar][sinif] -> [rec]
    alan_adlari = {}
    protokol_mu = {}
    kaynak_dosyalar = defaultdict(set)
    bilinmeyenler = []

    for g in GRADES:
        yol = os.path.join(SRC_DIR, "sinif_%s.json" % g)
        if not os.path.exists(yol):
            print("HATA: kaynak yok: %s" % yol)
            return 1
        with open(yol, encoding="utf-8") as f:
            kayitlar = json.load(f)
        for rec in kayitlar:
            if not rec.get("dal_adi") or not rec.get("alan_adi"):
                continue
            cekirdek = alan_cekirdegi(rec["alan_adi"])
            protokol = bool(_PROTOKOL_RE.match(str(rec.get("kaynak_dosya") or "")))
            anahtar = slug(cekirdek) + ("_protokol" if protokol else "")
            rec["sinif_seviyesi"] = g
            ham[anahtar][g].append(rec)
            alan_adlari.setdefault(anahtar, cekirdek)
            protokol_mu[anahtar] = protokol
            kaynak_dosyalar[anahtar].add(rec.get("kaynak_dosya"))

    db = OrderedDict()
    brans_eksik = []
    tekillestirilen = 0
    catisan = []
    surum_farki = []
    for anahtar in sorted(ham):
        cekirdek = alan_adlari[anahtar]
        brans = ALAN_BRANSI.get(cekirdek)
        if not brans:
            brans_eksik.append(cekirdek)
            brans = cekirdek.title()
        protokol = bool(protokol_mu.get(anahtar))
        # Cizelge basligindaki alan adi PARANTEZSIZ kalir; etiket ayri gecer.
        baslik_alan_adi = cekirdek + " ALANI"

        siniflar = OrderedDict()
        dallar = set()
        for g in GRADES:
            # Dosya adi yil onekiyle basliyor (2021_..., 2022_...). Ters
            # siralama YENI BASKIYI ONE alir; ayni dal iki baskida da varsa
            # tutulan kopya yenisi olur.
            kayitlar = sorted(ham[anahtar].get(g, []),
                              key=lambda r: (r.get("kaynak_dosya") or "",
                                             r.get("kaynak_sayfa") or 0),
                              reverse=True)
            if not kayitlar:
                continue
            liste = []
            # AYNI DAL, IKI KEZ: MEB kulliyatinda ayni belge iki dosya adiyla
            # da duruyor (2021_motorlu = 2021_motorluarac, 93'er sayfa) ve
            # 2022_tarim, 2021_tarim'in ustune iki yeni dal ekleyen yeni
            # baskidir. Icerik BIREBIR AYNIYSA ikinci kopya atilir; FARKLIYSA
            # sessizce birini secmek yerine rapora dusurulur.
            gorulen = {}
            for rec in kayitlar:
                cz, bilinmeyen = kayit_to_cizelge(rec, baslik_alan_adi, protokol)
                bilinmeyenler.extend(bilinmeyen)
                dal = dal_adi_duzelt(rec.get("dal_adi"))
                # tam imza: adlar dahil.  saat imzasi: yalnizca kategori+saat.
                # Ikisini ayirmanin sebebi: MEB yeni baskida bazi ders ADLARINI
                # duzeltiyor ("MEYVELERDE BUDAMA" -> "MEYVE AGACLARINDA
                # BUDAMA") ama saatlere dokunmuyor. Bu bir veri hatasi degil,
                # surum farkidir. SAATLER de farkliysa is degisir: o zaman iki
                # kaynaktan biri yanlis okunmus olabilir, sessizce gecilmez.
                imza = json.dumps(cz["courses"], ensure_ascii=False, sort_keys=True)
                saat_imzasi = json.dumps(
                    sorted((c["kategori"], c["saat"]) for c in cz["courses"]),
                    ensure_ascii=False)
                if dal in gorulen:
                    onceki_imza, onceki_saat = gorulen[dal]
                    if onceki_imza == imza:
                        tekillestirilen += 1
                    elif onceki_saat == saat_imzasi:
                        surum_farki.append((anahtar, g, dal,
                                            rec.get("kaynak_dosya")))
                    else:
                        catisan.append((anahtar, g, dal,
                                        rec.get("kaynak_dosya"),
                                        rec.get("kaynak_sayfa")))
                    continue
                gorulen[dal] = (imza, saat_imzasi)
                liste.append(cz)
                dallar.add(dal)
            siniflar[g] = liste

        db[anahtar] = OrderedDict([
            ("alan_adi", baslik_alan_adi
             + (" " + PROTOKOL_ETIKETI if protokol else "")),
            # Ekranda gorunecek ad. Cizelge basligi BUYUK HARF kalir (kaynak
            # oyle basar), liste ise baslik biciminde gorunur.
            ("gorunen_ad", baslik_bicimi(baslik_alan_adi)
             + (" " + PROTOKOL_ETIKETI if protokol else "")),
            ("brans", brans),
            ("protokol", protokol),
            ("kaynak", sorted(kaynak_dosyalar[anahtar])),
            ("dallar", sorted(dallar, key=lambda d: d)),
            ("siniflar", siniflar),
        ])

    govde = json.dumps(db, ensure_ascii=False, indent=1)
    with open(OUT_FILE, "w", encoding="utf-8", newline="\n") as f:
        f.write("// OTOMATIK URETILDI - tools/rebuild_mesem_db.py\n")
        f.write("// Kaynak: data/kaynak_cizelgeler/mesem/sinif_{9,10,11,12}.json\n")
        f.write("// ELLE DUZENLEMEYIN. Kaynak JSON'u duzeltip ureticiyi yeniden calistirin.\n")
        f.write("export const MESEM_CURRICULUM_DB = ")
        f.write(govde)
        f.write(";\n")

    # ------------------------------- rapor ----------------------------------
    top_cizelge = sum(len(v) for a in db.values() for v in a["siniflar"].values())
    top_ders = sum(len(c["courses"]) for a in db.values()
                   for v in a["siniflar"].values() for c in v)
    top_dal = sum(len(a["dallar"]) for a in db.values())
    print("=" * 68)
    print("mesem_curriculum_db.js yeniden uretildi")
    print("=" * 68)
    print("  alan               : %d" % len(db))
    print("  dal                : %d" % top_dal)
    print("  cizelge            : %d" % top_cizelge)
    print("  ders satiri        : %d" % top_ders)
    print("  tekillestirilen    : %d  (ayni dal, birebir ayni cizelge)"
          % tekillestirilen)
    print("  dosya boyutu       : %.2f MB" % (os.path.getsize(OUT_FILE) / 1048576.0))

    hata = 0
    if surum_farki:
        print("\n  * ESKI BASKI ATILDI (saatler ayni, yalnizca ders adi "
              "guncellenmis; yeni baski tutuldu):")
        for a, g, d, dosya in surum_farki:
            print("      %-10s %2s. sinif  %-44s (eski: %s)" % (a, g, d, dosya))
    if catisan:
        hata += len(catisan)
        print("\n  ! AYNI DAL ICIN FARKLI IKI CIZELGE (ikincisi ATILDI):")
        for a, g, d, dosya, s in catisan[:20]:
            print("      %-28s %2s. sinif  %-40s <- %s s.%s"
                  % (a, g, d, dosya, s))
    if brans_eksik:
        hata += len(brans_eksik)
        print("\n  ! BRANSI TANIMSIZ ALAN (ALAN_BRANSI tablosuna eklenmeli):")
        for a in sorted(set(brans_eksik)):
            print("      %s" % a)
    if bilinmeyenler:
        hata += len(bilinmeyenler)
        print("\n  ! BILINMEYEN KATEGORI (satir ATILDI):")
        for d, s, k in sorted(set(bilinmeyenler))[:20]:
            print("      %s s.%s -> %r" % (d, s, k))

    # Her cizelgede en az bir atolye dersi olmali; yoksa kategori donusumu
    # bozulmus demektir ve Madde 18/19 kovalari yanlis dolar.
    atolyesiz = 0
    for anahtar, a in db.items():
        for g, lst in a["siniflar"].items():
            for c in lst:
                if not any("MESLEK" in x["kategori"] for x in c["courses"]):
                    atolyesiz += 1
    print("\n  atolye dersi olmayan cizelge : %d %s"
          % (atolyesiz, "(BEKLENEN: 0)" if atolyesiz else "- GECTI"))
    return 0 if (hata == 0 and atolyesiz == 0) else 1


if __name__ == "__main__":
    sys.exit(main())

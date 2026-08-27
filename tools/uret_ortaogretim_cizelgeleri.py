# -*- coding: utf-8 -*-
"""
BÜTÜN ORTAÖĞRETİM ÇİZELGELERİNİ ÜRETİR
======================================

NE ÜRETİR
---------
js/ortaogretim_cizelgeleri.js — okul türü -> sınıf -> zorunlu ders listesi.

NEDEN VAR
---------
27.08.2026'da ölçüldü: Fen Lisesi, Sosyal Bilimler Lisesi, Anadolu İmam Hatip
Lisesi, Güzel Sanatlar ve Spor Lisesi seçildiğinde motor SESSİZCE Anadolu
Lisesi müfredatını döndürüyordu. Kaynak dosyalar depoda duruyordu ama motora
hiç bağlanmamıştı.

En ağırı AİHL'di: 9. sınıfta Kur'an-ı Kerim, Arapça, Temel Dinî Bilgiler ve
Siyer HİÇ YOKTU. O okulun İHL Meslek Dersleri ve Arapça normu tamamen yanlış
çıkıyordu. Hiçbir hata mesajı yoktu; yalnızca yanlış sonuç vardı.

KAYNAKLAR
---------
    ogm/sayi05_anadolu_fen_sosyalbilimler.json   6 tablo
    ogm/sayi06_guzelsanatlar_gorsel_tiyatro.json 2 tablo
    ogm/sayi07_guzelsanatlar_muzik_turkmuzigi.json 2 tablo
    ogm/sayi09_spor_lisesi.json                  1 tablo
    ogm/sayi24_ozelprogram_fen_lisesi.json       1 tablo
    ogm/sayi25_ozelprogram_sosyalbilimler_lisesi.json 1 tablo
    dogm/anadolu_imam_hatip_lisesi_ve_hazirlik.json

ORTAK PARÇALAR ELDE ÇOĞALTILMAZ
-------------------------------
Ders -> branş eşlemesi, branş adı çevirisi ve seçim satırları
uret_ortaogretim_mufredat.py'den İÇE AKTARILIR. Bu projede aynı verinin
ikinci bir kopyasını tutmak defalarca sessiz hataya yol açtı (müfredat üç
yerdeydi, demo okul adı beş yerdeydi). Kopya çıkarmıyoruz.

ÇALIŞTIRMA
    python -X utf8 tools/uret_ortaogretim_cizelgeleri.py
    python -X utf8 tools/uret_ortaogretim_cizelgeleri.py --yaz
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import uret_ortaogretim_mufredat as temel   # ortak eşleme ve yardımcılar

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = os.path.join(KOK, "data", "kaynak_cizelgeler")
CIKTI = os.path.join(KOK, "js", "ortaogretim_cizelgeleri.js")

SINIFLAR = ["hazirlik", "9", "10", "11", "12"]

# --------------------------------------------------------------------------
# OKUL TÜRÜ -> KAYNAK TABLO
# --------------------------------------------------------------------------
# Soldaki kimlikler database.js getSchoolTypes() ile birebir aynı olmalıdır;
# uymayan bir kimlik yazılırsa o okul türü sessizce eski davranışa (Anadolu
# müfredatı) düşmeye devam eder. Aşağıdaki kapı bunu denetler.
TABLOLAR = [
    ("anadolu_lisesi",            "ogm/sayi05_anadolu_fen_sosyalbilimler.json", "Anadolu Lisesi"),
    ("hazirlik_anadolu_lisesi",   "ogm/sayi05_anadolu_fen_sosyalbilimler.json", "Hazırlık Sınıfı Bulunan Anadolu Lisesi"),
    ("fen_lisesi",                "ogm/sayi05_anadolu_fen_sosyalbilimler.json", "Fen Lisesi"),
    ("hazirlik_fen_lisesi",       "ogm/sayi05_anadolu_fen_sosyalbilimler.json", "Hazırlık Sınıfı Bulunan Fen Lisesi"),
    # NOT: database.js'te "sosyal_bilimler_lisesi" türünün sınıf listesinde
    # hazırlık da var, ama ayrı bir "hazırlıklı sosyal bilimler" türü YOK.
    # Kaynakta iki ayrı tablo bulunuyor. Hazırlıklı tablo seçildi: hazırlık
    # sınıfı olmayan okul o satırları zaten kullanmaz, olan okul ise
    # eksiksiz çizelgeyi görür. Tersi olsaydı hazırlık sınıfı çizelgesiz
    # kalırdı.
    ("sosyal_bilimler_lisesi",    "ogm/sayi05_anadolu_fen_sosyalbilimler.json", "Hazırlık Sınıfı Bulunan Sosyal Bilimler Lisesi"),
    ("ozel_program_fen_lisesi",   "ogm/sayi24_ozelprogram_fen_lisesi.json",     None),
    ("ozel_program_sosyal_lisesi", "ogm/sayi25_ozelprogram_sosyalbilimler_lisesi.json", None),
    ("guzel_sanatlar_gorsel",     "ogm/sayi06_guzelsanatlar_gorsel_tiyatro.json", "Güzel Sanatlar Lisesi - Görsel Sanatlar"),
    ("guzel_sanatlar_tiyatro",    "ogm/sayi06_guzelsanatlar_gorsel_tiyatro.json", "Güzel Sanatlar Lisesi - Tiyatro"),
    ("guzel_sanatlar_muzik",      "ogm/sayi07_guzelsanatlar_muzik_turkmuzigi.json", "Güzel Sanatlar Lisesi - Müzik"),
    ("guzel_sanatlar_turk_muzigi", "ogm/sayi07_guzelsanatlar_muzik_turkmuzigi.json", "Güzel Sanatlar Lisesi - Türk Müziği"),
    ("spor_lisesi",               "ogm/sayi09_spor_lisesi.json",                None),
    # Meslek lisesi hazırlık sınıfı: YALNIZCA hazırlık sütununu tanımlar.
    # 9-12. sınıflar okulun alanına göre ayrı çizelgeden (strict_pdf_curriculum_db)
    # gelmeye devam eder. Bu yüzden bu iki tür için üretilen tabloda sadece
    # "hazirlik" anahtarı bulunur.
    ("mesleki_ve_teknik_anadolu_lisesi", "mtegm/hazirlik_sinifi_sayi63.json", None),
    ("anadolu_teknik_programi",          "mtegm/hazirlik_sinifi_sayi63.json", None),
    ("anadolu_imam_hatip_lisesi", "dogm/anadolu_imam_hatip_lisesi_ve_hazirlik.json", "__AIHL__"),
    ("hazirlik_imam_hatip_lisesi", "dogm/anadolu_imam_hatip_lisesi_ve_hazirlik.json", "__AIHL__"),
]

# --------------------------------------------------------------------------
# BRANŞ İSTİSNALARI
# --------------------------------------------------------------------------
# Resmî ders->branş çizelgesinden türetilemeyen adlar. Her biri bilerek ve
# tek tek yazıldı; tahmin yok. Eşleşmeyen bir ders kalırsa üretim DURUR.
EK_BRANSLAR = {
    # İmam hatip meslek dersleri: hepsi İHL Meslek Dersleri branşındadır.
    # Arapça ise ayrı bir branştır ve çizelgede de ayrı geçer.
    "kuranikerim": "İHL Meslek Dersleri",
    "temeldinibilgiler": "İHL Meslek Dersleri",
    "siyer": "İHL Meslek Dersleri",
    "fikih": "İHL Meslek Dersleri",
    "tefsir": "İHL Meslek Dersleri",
    "hadis": "İHL Meslek Dersleri",
    "kelam": "İHL Meslek Dersleri",
    "akaid": "İHL Meslek Dersleri",
    "hitabetvemeslekiuygulama": "İHL Meslek Dersleri",
    "dinlertarihi": "İHL Meslek Dersleri",
    "islamkulturvemedeniyeti": "İHL Meslek Dersleri",
    "peygamberimizinhayati": "İHL Meslek Dersleri",
    "yabancidil": "İngilizce",          # AİHL ortak dersi; uygulama da böyle eşliyor
    "hafizlikegitimi": "İHL Meslek Dersleri",
    "turkkulturvemedeniyettarihi": "Tarih",   # resmî tabloda lise için Tarih
    "meslekiarapca": "Arapça",
    "hazirliksinifiarapca": "Arapça",
    "hazirliksinifikuranikerim": "İHL Meslek Dersleri",
    "hazirliksinifiturkdiliveedebiyati": "Türk Dili ve Edebiyatı",
    "hazirliksinifimatematik": "Matematik",
    "hazirliksinifibirinciyabancidil": "İngilizce",
    "hazirliksinifiyabancidil": "İngilizce",
    # Güzel sanatlar / spor lisesi alan dersleri
    "turkmuzigi": "Müzik",
    "batimuzigi": "Müzik",
    "calgiegitimi": "Müzik",
    "muziknazariyati": "Müzik",
    "koro": "Müzik",
    "temelsanategitimi": "Görsel Sanatlar",
    "desen": "Görsel Sanatlar",
    "sanattarihi": "Görsel Sanatlar",
    "ikiboyutlusanatatolye": "Görsel Sanatlar",
    "ucboyutlusanatatolye": "Görsel Sanatlar",
    "grafikfotograf": "Görsel Sanatlar",
    "tiyatro": "Görsel Sanatlar",
    "oyunculuk": "Görsel Sanatlar",
    "dramaturji": "Görsel Sanatlar",
    "sahnebilgisi": "Görsel Sanatlar",
    "spor": "Beden Eğitimi",
    "takimsporlari": "Beden Eğitimi",
    "bireyselsporlar": "Beden Eğitimi",
    "antrenmanbilgisi": "Beden Eğitimi",
    "sporanatomisivefizyolojisi": "Beden Eğitimi",
    "sporpsikolojisi": "Beden Eğitimi",
    "sporvebeslenme": "Beden Eğitimi",
    "sporfizyolojisi": "Beden Eğitimi",
}


# --------------------------------------------------------------------------
# OKUL TÜRÜNE BAĞLI ALAN DERSİ KURALI
# --------------------------------------------------------------------------
# Resmî "Öğretmenlik Alanları, Atama ve Ders Okutma Esasları" çizelgesi, güzel
# sanatlar ve spor liselerinin alan derslerini TEK TEK saymaz; kategori olarak
# tanımlar. Kendi ifadeleriyle:
#
#   Beden Eğitimi   : "Spor Liselerinin Spor Alanı ile ilgili Dersleri"
#   Görsel Sanatlar : "Güzel Sanatlar Liselerinin Görsel Sanatlar alanı ile
#                      ilgili dersleri"
#   Müzik           : "Güzel Sanatlar Liselerinin Müzik alanı ile ilgili
#                      dersleri"
#   Tiyatro         : (97 alanlık çizelgede ayrı ve aktif bir alandır)
#
# Bu yüzden ders adına göre tek tek eşleme aramak yanlış olurdu: çizelge zaten
# "bu okulun bu alanının dersleri" diyor. Kural okul türüne bağlanır ve yalnızca
# adıyla eşleşmeyen derslere uygulanır — adıyla eşleşen ders (örn. Matematik)
# kendi branşında kalır.
# "İkinci Yabancı Dil" bazı çizelgelerde ZORUNLU satırdır (örn. Sosyal
# Bilimler Lisesi). Hangi dil olduğu okulun tercihidir; resmî ders->branş
# çizelgesi de Almanca ve Fransızca'yı birlikte gösterir. Varsayılan Almanca.
EK_SECIM_SATIRLARI = {
    "ikinciyabancidil": {"gorunen": "İkinci Yabancı Dil (Almanca)",
                         "varsayilan": "Almanca",
                         "secenekler": ["Almanca", "Fransızca"]},
    # Resmî atama çizelgesi bu iki dersi BİRDEN FAZLA alanın altında sayıyor;
    # yani gerçekten okulun tercihine bırakılmış. Varsayılan yazılır, idareci
    # değiştirebilir.
    #   Osmanlı Türkçesi        -> Türk Dili ve Edebiyatı  VE  Tarih
    #   Sosyal Bilim Çalışmaları-> Felsefe                 VE  Tarih
    "osmanliturkcesi": {"gorunen": "Osmanlı Türkçesi",
                        "varsayilan": "Türk Dili ve Edebiyatı",
                        "secenekler": ["Türk Dili ve Edebiyatı", "Tarih"]},
    "sosyalbilimcalismalari": {"gorunen": "Sosyal Bilim Çalışmaları",
                               "varsayilan": "Felsefe",
                               "secenekler": ["Felsefe", "Tarih"]},
}

# --------------------------------------------------------------------------
# RESMÎ ATAMA ÇİZELGESİNDE HİÇ GEÇMEYEN YENİ DERSLER
# --------------------------------------------------------------------------
# Özel program (proje) liselerinin yeni Maarif Modeli dersleri. 97 alanlık
# resmî "Öğretmenlik Alanları, Atama ve Ders Okutma Esasları" çizelgesinde
# hiçbir alanın ders listesinde geçmiyorlar; yani hangi branşın okutacağı
# resmen henüz belirlenmemiş.
#
# TAHMİN EDİLMEZ. Ders çizelgeye SAATİYLE girer ama branşı boş bırakılır:
# şube listesinde görünür, haftalık saat toplamına eklenir, norm hesabına
# ise idareci branşı seçene kadar girmez (normEngine, branşı atanmamış
# dersleri atlar).
#
# Alternatifi tahmin yürütmekti; o da yanlış branşa norm yazmak demekti.
# Kullanıcı ilkesi (27.08.2026): "Branş ne seçilirse seçilsin o liste okul
# idarecisinin sorumluluğundadır."
BRANSI_BELIRSIZ_DERSLER = {
    "veribiliminegiris",
    "buyukveri",
    "projetasarimiveuygulamalari",
    "fenbilimlerindeakademikokumaveyazma",
    "sosyalbilimlerdeakademikokumaveyazma",
}
BRANS_ATANMADI = "— Branş Atanmadı —"

# --------------------------------------------------------------------------
# ALTERNATİF PROGRAM DERSLERİ (varsayılan çizelgeye GİRMEZ)
# --------------------------------------------------------------------------
# AİHL hazırlık sınıfında "Yabancı Dil 20 saat" ile "Hafızlık Eğitimi 20 saat"
# satırları YAN YANA durur ama TOPLANMAZ; okul birini uygular. Kaynağın kendi
# özeti de bunu doğruluyor: satırların toplamı 55, özetteki ortak dersler
# toplamı 35 — aradaki fark tam 20 saat.
#
# Çizelgenin açıklaması (no 17): "(**) Hafızlık eğitimi dersi, hazırlık
# sınıfında hafızlık eğitimi uygulaması yapan Anadolu imam hatip liseleri
# içindir."
#
# Varsayılan, yaygın olan yabancı dil hazırlığıdır. Hafızlık uygulayan okul
# dersi elle ekler.
ALTERNATIF_PROGRAM_DERSLERI = {"hafizlikegitimi"}

OKUL_TURU_ALAN_BRANSI = {
    "spor_lisesi": "Beden Eğitimi",
    "guzel_sanatlar_gorsel": "Görsel Sanatlar",
    "guzel_sanatlar_muzik": "Müzik",
    "guzel_sanatlar_turk_muzigi": "Müzik",
    "guzel_sanatlar_tiyatro": "Tiyatro",
}


def saat_al(hucre):
    """{'tip':'sabit','saat':N} -> N ; 'secenekli' ve None -> 0."""
    if not isinstance(hucre, dict):
        return 0
    if hucre.get("tip") == "sabit":
        return int(hucre.get("saat") or 0)
    # Seçenekli saatler seçmeli derslere aittir; zorunlu listeye girmez.
    return 0


def brans_bul(harita, ders_adi, uyarilar, okul_turu=None):
    """
    Sirasiyla: elle yazilmis istisna -> resmi ders->brans cizelgesi ->
    secim satiri -> okul turune bagli alan dersi kurali.

    Son basamak yalnizca guzel sanatlar / spor liseleri icindir ve resmi
    cizelgenin kendi ifadesine dayanir (bkz. OKUL_TURU_ALAN_BRANSI). Adiyla
    eslesen ders bu basamaga hic gelmez; orn. Spor Lisesi'ndeki Matematik
    dersi Matematik brasinda kalir, Beden Egitimi'ne yazilmaz.
    """
    a = temel.anahtar(ders_adi)
    if a in EK_BRANSLAR:
        return EK_BRANSLAR[a]
    if a in harita:
        return harita[a]
    # Seçim satırları ANAHTARLA aranır, büyük harfle değil.
    # Python'da "Eğitimi".upper() -> "EĞITIMI" (i harfi İ olmaz); bu yüzden
    # "Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik" satırı hiç eşleşmiyordu.
    for k, v in temel.SECIM_SATIRLARI.items():
        if temel.anahtar(k) == a:
            return v["varsayilan"]
    if a in EK_SECIM_SATIRLARI:
        return EK_SECIM_SATIRLARI[a]["varsayilan"]
    if a in BRANSI_BELIRSIZ_DERSLER:
        return BRANS_ATANMADI
    alan = OKUL_TURU_ALAN_BRANSI.get(okul_turu)
    if alan:
        return alan
    uyarilar.append((ders_adi, a, okul_turu))
    return None


def ders_kaydi(gorunen, saat, brans, kategori="ORTAK DERSLER", baraj=False):
    k = {"ders": gorunen, "saat": saat, "atananBrans": brans,
         "kategori": kategori, "isAtolye": False}
    if baraj:
        k["baraj_ders"] = True
    return k


def ogm_tablosu(j, tablo_adi, harita, uyarilar, okul_turu=None):
    tablolar = j.get("tablolar") or []
    if tablo_adi:
        t = next((x for x in tablolar if x.get("tablo_adi") == tablo_adi), None)
    else:
        t = tablolar[0] if tablolar else None
    if not t:
        return None, None

    sonuc = {s: [] for s in SINIFLAR}
    for g in (t.get("gruplar") or []):
        if (g.get("grup_adi") or "").upper() != "ORTAK DERSLER":
            continue                       # seçmeli havuz zorunlu listeye girmez
        for d in (g.get("dersler") or []):
            ad = d.get("ders_adi") or ""
            secim = next((v for k, v in temel.SECIM_SATIRLARI.items()
                          if temel.anahtar(k) == temel.anahtar(ad)), None)
            gorunen = secim["gorunen"] if secim else temel.baslik_yap(ad)
            brans = brans_bul(harita, ad, uyarilar, okul_turu)
            if not brans:
                continue
            baraj = temel.anahtar(ad) == temel.anahtar("TÜRK DİLİ VE EDEBİYATI")
            for s in SINIFLAR:
                saat = saat_al((d.get("saatler") or {}).get(s))
                if saat:
                    sonuc[s].append(ders_kaydi(gorunen, saat, brans, baraj=baraj))

    # Rehberlik ve Yönlendirme ayrı alanda tutulur
    for s, h in (t.get("rehberlik_ve_yonlendirme") or {}).items():
        saat = saat_al(h)
        if saat and s in sonuc:
            sonuc[s].append(ders_kaydi("Rehberlik ve Yönlendirme", saat,
                                       "Rehberlik", kategori="REHBERLİK"))
    return sonuc, t.get("toplam_ders_saati")


def aihl_tablosu(j, harita, uyarilar, okul_turu=None):
    ac = j.get("ana_cizelge") or {}
    sonuc = {s: [] for s in SINIFLAR}
    for alan in ("ortak_dersler", "meslek_dersleri"):
        for d in (ac.get(alan) or []):
            ad = d.get("ders_adi") or ""
            gorunen = temel.baslik_yap(ad)
            if temel.anahtar(ad) in ALTERNATIF_PROGRAM_DERSLERI:
                continue
            brans = brans_bul(harita, ad, uyarilar, okul_turu)
            if not brans:
                continue
            baraj = temel.anahtar(ad) == temel.anahtar("TÜRK DİLİ VE EDEBİYATI")
            for s in SINIFLAR:
                saat = saat_al((d.get("saatler") or {}).get(s))
                if saat:
                    # KATEGORİ BİLEREK "ORTAK DERSLER":
                    # normEngine, kategorisinde "MESLEK" gecen dersleri 12.
                    # sinifta "Isletmede Mesleki Egitim" kapsamina alir ve
                    # atolye/lab kurallarina yaklastirir. Imam hatip meslek
                    # dersleri atolye dersi DEGILDIR; sinifta okutulur ve
                    # Madde 18 (genel bilgi) kapsamindadir. Etiketi "MESLEK"
                    # yapmak 12. siniflari bozardi.
                    sonuc[s].append(ders_kaydi(gorunen, saat, brans, baraj=baraj))
    ozet = ac.get("ozet") or {}
    # Kaynağın kendi özetiyle doğrula. Bu karşılaştırma, hazırlık sınıfındaki
    # alternatif program (hafızlık) satırının toplanmaması gerektiğini
    # ortaya çıkardı: satır toplamı 55, özet 35 diyordu.
    beklenen = {}
    for s2 in SINIFLAR:
        a1 = (ozet.get("ortak_dersler_toplami") or {}).get(s2) or 0
        a2 = (ozet.get("meslek_dersleri_toplami") or {}).get(s2) or 0
        a3 = (ozet.get("rehberlik_ve_yonlendirme") or {}).get(s2) or 0
        if a1 or a2:
            beklenen[s2] = a1 + a2 + a3
    for s, saat in (ozet.get("rehberlik_ve_yonlendirme") or {}).items():
        if saat and s in sonuc:
            sonuc[s].append(ders_kaydi("Rehberlik ve Yönlendirme", int(saat),
                                       "Rehberlik", kategori="REHBERLİK"))
    uretilen = {k: sum(d["saat"] for d in v) for k, v in sonuc.items() if v}
    for s2, bekle in beklenen.items():
        if uretilen.get(s2, 0) != bekle:
            uyarilar.append(("AİHL %s. sınıf toplamı tutmuyor: üretilen %d, "
                             "kaynak özeti %d" % (s2, uretilen.get(s2, 0), bekle),
                             "__dogrulama__", okul_turu))
    return sonuc, ozet.get("toplam_ders_saati")


def uygulama_okul_turleri():
    """database.js getSchoolTypes() kimlikleri — elle liste tutulmaz."""
    import re
    m = open(os.path.join(KOK, "js", "database.js"), encoding="utf-8").read()
    i = m.find("getSchoolTypes()")
    if i < 0:
        raise SystemExit("!! database.js icinde getSchoolTypes() bulunamadi")
    # Blok sonu, bir SONRAKI metot tanimidir. Ilk "]" alinamaz: o, ilk okulun
    # gradeLevels dizisinin kapanisidir ve listenin yalnizca ilk satiri
    # okunur. (Ilk yazimda tam olarak bu oldu; kapi sayesinde goruldu.)
    j = m.find("getVocationalAreas(", i)
    if j < 0:
        j = len(m)
    turler = set(re.findall(r'id:\s*"([^"]+)"', m[i:j]))
    if len(turler) < 10:
        raise SystemExit("!! okul turu listesi supheli derecede kisa (%d) — "
                         "database.js bicimi degismis olabilir" % len(turler))
    return turler


def uret():
    harita, belirsiz = temel.ders_brans_haritasi("lise")
    tanidik_brans = temel.uygulama_branslari()
    tanidik_tur = uygulama_okul_turleri()

    cikti, rapor, uyarilar, hatalar = {}, [], [], []

    for tur, dosya, tablo_adi in TABLOLAR:
        if tur not in tanidik_tur:
            hatalar.append("okul türü kimliği database.js'te yok: %s" % tur)
            continue
        yol = os.path.join(KAYNAK, dosya)
        if not os.path.exists(yol):
            hatalar.append("kaynak bulunamadı: %s" % dosya)
            continue
        j = json.load(open(yol, encoding="utf-8"))

        if tablo_adi == "__AIHL__":
            veri, toplam = aihl_tablosu(j, harita, uyarilar, tur)
        else:
            veri, toplam = ogm_tablosu(j, tablo_adi, harita, uyarilar, tur)
        if veri is None:
            hatalar.append("tablo bulunamadı: %s -> %s" % (dosya, tablo_adi))
            continue

        veri = {s: v for s, v in veri.items() if v}
        cikti[tur] = veri
        rapor.append((tur, tablo_adi or "(tek tablo)",
                      {s: sum(d["saat"] for d in v) for s, v in veri.items()},
                      toplam))

    # Üretilen branş adları uygulamanın tanıdığı adlar olmalı
    # "— Branş Atanmadı —" bilerek konur; kanonik branş listesinde aranmaz.
    yabanci = sorted({d["atananBrans"] for t in cikti.values()
                      for v in t.values() for d in v}
                     - tanidik_brans - {BRANS_ATANMADI})
    for y in yabanci:
        hatalar.append("uygulamanın tanımadığı branş adı: %s" % y)

    return cikti, rapor, uyarilar, hatalar, belirsiz


def js_yaz(cikti):
    s = ['/*',
         ' * ORTAÖĞRETİM HAFTALIK DERS ÇİZELGELERİ — ÜRETİLMİŞTİR, ELLE DÜZENLEMEYİN.',
         ' * Üreteç: tools/uret_ortaogretim_cizelgeleri.py',
         ' * Kaynak: TTKB (OGM) ve DÖGM resmî haftalık ders çizelgeleri',
         ' *',
         ' * Bu dosyadan ÖNCE her okul türü sessizce Anadolu Lisesi müfredatına',
         ' * düşüyordu. Anadolu İmam Hatip Lisesi, Kur\'an-ı Kerim ve Arapça',
         ' * dersleri olmadan hesaplanıyordu.',
         ' *',
         ' * Yalnızca ZORUNLU dersler burada. Seçmeli havuzlar ayrı veri',
         ' * tabanındadır (strict_elective_courses_db.js).',
         ' */',
         'const ORTAOGRETIM_CIZELGELERI = {']
    for tur in sorted(cikti):
        s.append('    "%s": {' % tur)
        siniflar = [x for x in SINIFLAR if x in cikti[tur]]
        for i, sinif in enumerate(siniflar):
            s.append('        "%s": [' % sinif)
            liste = cikti[tur][sinif]
            for k, d in enumerate(liste):
                alan = ['ders: %s' % json.dumps(d["ders"], ensure_ascii=False),
                        'saat: %d' % d["saat"],
                        'atananBrans: %s' % json.dumps(d["atananBrans"], ensure_ascii=False)]
                if d.get("baraj_ders"):
                    alan.append("baraj_ders: true")
                alan.append('kategori: %s' % json.dumps(d["kategori"], ensure_ascii=False))
                alan.append("isAtolye: false")
                s.append('            { ' + ", ".join(alan) + " }" +
                         ("" if k == len(liste) - 1 else ","))
            s.append('        ]' + ("" if i == len(siniflar) - 1 else ","))
        s.append('    }' + ("," if tur != sorted(cikti)[-1] else ""))
    s.append('};')
    s.append('')
    open(CIKTI, "w", encoding="utf-8").write("\n".join(s))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true")
    arg = ap.parse_args()

    cikti, rapor, uyarilar, hatalar, belirsiz = uret()

    print("ORTAÖĞRETİM ÇİZELGELERİ ÜRETİCİSİ")
    print("=" * 82)
    print("%-30s %-34s %s" % ("OKUL TÜRÜ", "KAYNAK TABLO", "ZORUNLU SAAT (9/10/11/12)"))
    print("-" * 82)
    for tur, tablo, saatler, toplam in rapor:
        dizi = "/".join(str(saatler.get(s, 0)) for s in ["9", "10", "11", "12"])
        haz = saatler.get("hazirlik")
        print("%-30s %-34s %s%s" % (tur, tablo[:34], dizi,
                                    ("   (haz %d)" % haz) if haz else ""))
    print("-" * 82)
    print("üretilen okul türü: %d" % len(cikti))

    # DOĞRULAMA: üretilen zorunlu saat, çizelgenin KENDİ toplam satırını
    # aşamaz. Aşıyorsa ya seçmeli bir satır zorunlu sanılmıştır ya da bir
    # alternatif program satırı toplanmıştır (AİHL hafızlığında tam olarak
    # bu oldu). Her okulun toplamı farklı olabilir; örneğin Spor Lisesi
    # haftada 43 saattir, 40 değil.
    print()
    print("DOĞRULAMA — üretilen zorunlu saat, çizelgenin toplamını aşıyor mu?")
    print("-" * 82)
    asan = 0
    for tur, tablo, saatler, toplam in rapor:
        for sinif, uretilen in sorted(saatler.items()):
            sinir = None
            if isinstance(toplam, dict):
                h = toplam.get(sinif)
                sinir = h.get("saat") if isinstance(h, dict) else h
            if sinir and uretilen > sinir:
                asan += 1
                print("  !! %-28s %s. sınıf: üretilen %d > çizelge %d"
                      % (tur, sinif, uretilen, sinir))
    print("  " + ("hiçbir okul türünde aşım yok" if not asan
                  else "%d aşım var — üretim güvenilir değil" % asan))
    if asan:
        hatalar.append("%d sınıfta zorunlu saat çizelge toplamını aşıyor" % asan)

    if belirsiz:
        print()
        print("kademe elemesinden sonra belirsiz kalan ders anahtarları: %d" % len(belirsiz))

    if uyarilar:
        print()
        print("!! BRANŞI EŞLEŞMEYEN DERSLER (%d) — bunlar çizelgeye YAZILMADI:" % len(uyarilar))
        birlesik = {}
        for ad, a, tur in uyarilar:
            birlesik.setdefault(a, [ad, set()])[1].add(tur or "?")
        for a, (ad, turler) in birlesik.items():
            print("     %-44s -> %s" % (ad[:44], ", ".join(sorted(turler))))

    if hatalar:
        print()
        print("!! ÜRETİM DURDURULDU:")
        for h in hatalar:
            print("     " + h)
        return 2

    if uyarilar:
        print()
        print("   Eşleşmeyen ders varken yazma yapılmaz: eksik çizelge, yanlış")
        print("   çizelgeden daha tehlikelidir (fark edilmez).")
        return 2

    if arg.yaz:
        js_yaz(cikti)
        print()
        print("yazıldı: %s" % CIKTI)
        print("UNUTMAYIN: build_bundle.py listesine ekleyin ve paketi yenileyin.")
    print("=" * 82)
    return 0


if __name__ == "__main__":
    sys.exit(main())

# -*- coding: utf-8 -*-
"""
NormMatik — MEVZUAT NOBETCISI BIRIM TESTI  (12.09.2026)
========================================================

Ag baglantisi GEREKTIRMEZ; yalnizca saf mantigi sinar.

NEDEN VAR
---------
12.09.2026'da iki davranis degisti ve ikisi de sessizce bozulabilir:

  1) ULASILAMAZLIK UYARISI ARTIK SUREYE BAGLI. Eski kural "ust uste 3
     tarama"ydi. Resmi Gazete birkac dakikaligina cevap vermeyi kesiyor
     (olculdu: iki kez zaman asimi, dakikalar sonra 0,2 sn'de HTTP 200) ve
     GitHub zamanlanmis calismalari geciktiriyor (12.09'da gunde 3 yerine 1
     tarama kostu). Yani tarama SAYISI gecen zamani anlatmiyordu: hem bos
     uyari hem gec uyari uretiyordu.

  2) IKGM (personel.meb.gov.tr) IKINCI KAYNAK OLARAK EKLENDI. Norm Kadro
     Yonetmeligi'nin sahibi o genel mudurluk; Resmi Gazete okunamazsa
     yonetmelik degisikligini oradan yakalariz. Akistaki 50 duyurunun
     neredeyse tamami yer degistirme/atama duyurusu ve basliklarinda "norm
     kadro" gecinceduz anahtar kelime suzgeci her hafta yanlis bildirim
     uretirdi.

CALISTIRMA:
    python -X utf8 tools/test_nobetci.py
"""

import datetime
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import mevzuat_nobetci_bot as bot

gecti = 0
hatalar = []


def denetle(ad, kosul, ayrinti=""):
    global gecti
    if kosul:
        gecti += 1
        print("  [GECTI] %s" % ad)
    else:
        hatalar.append("%s   %s" % (ad, ayrinti))
        print("  [KALDI] %s   %s" % (ad, ayrinti))


# =====================================================================
#  1. IKGM suzgeci
# =====================================================================
print()
print("IKGM duyuru suzgeci")

ILGILI_OLMALI = [
    "Millî Eğitim Bakanlığına Bağlı Eğitim Kurumları Yönetici ve "
    "Öğretmenlerinin Norm Kadrolarına İlişkin Yönetmelikte Değişiklik "
    "Yapılmasına Dair Yönetmelik",
    "Öğretmenlik Alanları, Atama ve Ders Okutma Esaslarında Değişiklik",
    "Haftalık Ders Çizelgelerine İlişkin Açıklama",
    "Norm Kadro Tespitinde Esas Alınacak Ders Saati Hesabı",
]

ELENMELI = [
    "İhtiyaç ve Norm Kadro Fazlası Öğretmenlerin Yer Değiştirme Sonuçları (2026 Ağustos)",
    "İhtiyaç ve Norm Kadro Fazlası Öğretmenlerin Yer Değiştirme Başvurusu (2026 Ağustos)",
    "2026 Ağustos Öğretmenlerin İl İçi Sıraya Bağlı Yer Değiştirme Sonuçları",
    "Millî Eğitim Bakanlığı Sözleşmeli Bilişim Personeli Alımı",
    "Bilim ve Sanat Merkezlerine (BİLSEM) Öğretmen Atama Sonuçları",
    "2026/3 Öğretmenlik Mesleği Kariyer Basamaklarında İlerlemeye İlişkin Kılavuz",
]

for b in ILGILI_OLMALI:
    denetle("ilgili sayiliyor: %s..." % b[:46], bot.ikgm_ilgili_mi(b))
for b in ELENMELI:
    denetle("eleniyor: %s..." % b[:52], not bot.ikgm_ilgili_mi(b))

# "yonetmelik" gecen bir baslik, personel kelimeleri de tasisa bile ILGILIDIR:
# yonetmelik degisikligi duyurusunun basliginda "basvuru" gecebilir.
denetle("yonetmelik her durumda ilgili",
        bot.ikgm_ilgili_mi("Norm Kadro Yönetmeliği Değişikliği ve Başvuru Takvimi"))

denetle("IKGM kaynagi kayitli",
        any(k["anahtar"] == "ikgm_duyuru" for k in bot.KAYNAKLAR))
denetle("IKGM akis turunde (bos liste hata sayilmasin)",
        [k for k in bot.KAYNAKLAR if k["anahtar"] == "ikgm_duyuru"][0]["tur"] == "akis")
denetle("Resmi Gazete kaynagi DURUYOR (kaldirilmadi)",
        any(k["anahtar"] == "resmi_gazete" for k in bot.KAYNAKLAR))


# =====================================================================
#  2. Ulasilamazlik: sayi degil SURE
# =====================================================================
print()
print("Ulasilamazlik uyarisi (sureye bagli)")

T0 = datetime.datetime(2026, 9, 12, 9, 0, tzinfo=bot.TSI)


def saat_sonra(n):
    return T0 + datetime.timedelta(hours=n)


# Ilk basarisizlik: uyari YOK.
h1, gecen1, uyar1 = bot.hata_kaydini_guncelle(None, T0)
denetle("ilk basarisizlikta uyari yok", not uyar1 and h1["adet"] == 1)
denetle("ilk basarisizlik anini kaydediyor", h1.get("ilk") and gecen1 == 0.0)

# Ayni gun ust uste 3 tarama (eski esik) ama 6 saat: HALA uyari yok.
h2, _, uyar2 = bot.hata_kaydini_guncelle(h1, saat_sonra(3))
h3, gecen3, uyar3 = bot.hata_kaydini_guncelle(h2, saat_sonra(6))
denetle("3 tarama / 6 saat: uyari YOK (eski kural uyarirdi)",
        not uyar2 and not uyar3 and h3["adet"] == 3, "gecen=%.1f sa" % gecen3)

# 23 saat: hala yok. 24 saat: uyari VAR, bir kez.
h4, _, uyar4 = bot.hata_kaydini_guncelle(h3, saat_sonra(23))
denetle("23 saat: uyari yok", not uyar4)
h5, gecen5, uyar5 = bot.hata_kaydini_guncelle(h4, saat_sonra(24))
denetle("24 saat: uyari VAR", uyar5, "gecen=%.1f sa" % gecen5)
denetle("uyari kaydi isaretlendi", h5.get("bildirildi") is True)

# Kesinti surse bile TEKRAR uyarmaz.
h6, _, uyar6 = bot.hata_kaydini_guncelle(h5, saat_sonra(48))
h7, _, uyar7 = bot.hata_kaydini_guncelle(h6, saat_sonra(72))
denetle("uyari tekrarlanmiyor (3 gun surse bile)", not uyar6 and not uyar7)
denetle("sayac artmaya devam ediyor", h7["adet"] == 7, str(h7["adet"]))

# Eski hafizadaki DUZ SAYI bicimi cokmeden devralinir.
h8, gecen8, uyar8 = bot.hata_kaydini_guncelle(2, T0)
denetle("eski sayi bicimi devraliniyor", h8["adet"] == 3 and not uyar8,
        str(h8))
h9, _, uyar9 = bot.hata_kaydini_guncelle(h8, saat_sonra(25))
denetle("devralinan kayit da suresi dolunca uyariyor", uyar9)

# Bozuk tarih: cokme yok, sayac sifirlanip devam eder.
h10, gecen10, uyar10 = bot.hata_kaydini_guncelle(
    {"adet": 5, "ilk": "bozuk-tarih", "bildirildi": False}, T0)
denetle("bozuk tarihte cokme yok", h10["adet"] == 6 and gecen10 == 0.0
        and not uyar10, str(h10))

denetle("esik 24 saat", bot.ULASILAMAZ_SURESI_SAAT == 24,
        str(bot.ULASILAMAZ_SURESI_SAAT))

# Kaynak duzelince "yeniden ulasilabiliyor" notu YALNIZCA uyarilmis
# kaynaklar icin cikmali; bu karar calistir() icinde veriliyor.
kaynak = open(bot.__file__, encoding="utf-8").read()
denetle("duzelme notu yalnizca bildirilmis kaynak icin",
        'eski_hata.get("bildirildi")' in kaynak)
denetle("hata blogu ortak islevi kullaniyor",
        "hata_kaydini_guncelle(" in kaynak.split("def calistir")[-1])

# Resmi Gazete dakikalar icinde inip kalkiyor; tarama icinde daha sabirli
# denenmeli, yoksa 30 saniyelik bir kesinti kaynagi "ulasilamadi" yapar.
rg_govde = kaynak.split("def resmi_gazete")[-1].split("\ndef ")[0]
denetle("Resmi Gazete daha sabirli deneniyor",
        "deneme=3" in rg_govde and "bekle=15" in rg_govde)
denetle("al() deneme/bekle parametresi aliyor",
        "def al(url, kodlama=\"utf-8\", deneme=2, bekle=5)" in kaynak)

# Durum raporu, ulasilamayan kaynagin SEBEBINI de yazmali; tani onunla
# yapiliyor ("timed out" suzulme, "403" ret, DNS hatasi baska bir sey).
denetle("durum raporunda ulasilamama sebebi de var",
        'saattir) — %s"' in kaynak and "kisa(hata)" in kaynak)


# =====================================================================
#  3. Eksik ara sertifika (resmigazete.gov.tr)
# =====================================================================
print()
print("Resmi Gazete ara sertifikasi")

import ssl

denetle("ara sertifika dosyasi duruyor", os.path.exists(bot.ARA_SERTIFIKALAR),
        bot.ARA_SERTIFIKALAR)

if os.path.exists(bot.ARA_SERTIFIKALAR):
    bilgi = ssl._ssl._test_decode_cert(bot.ARA_SERTIFIKALAR)
    konu = dict(x[0] for x in bilgi["subject"])
    veren = dict(x[0] for x in bilgi["issuer"])
    denetle("dogru ara sertifika (GeoTrust TLS RSA CA G1)",
            konu.get("commonName") == "GeoTrust TLS RSA CA G1",
            str(konu))
    denetle("koku DigiCert Global Root G2",
            veren.get("commonName") == "DigiCert Global Root G2", str(veren))

    # Sertifikanin suresi dolarsa bot Resmi Gazete'yi yine okuyamaz hale
    # gelir. Test, bitise 60 gunden az kalinca DUSER: sessizce bozulmak
    # yerine onceden haber versin.
    bitis = datetime.datetime.strptime(bilgi["notAfter"], "%b %d %H:%M:%S %Y %Z")
    kalan = (bitis - datetime.datetime.utcnow()).days
    denetle("ara sertifikanin omru bitmek uzere degil (>60 gun)", kalan > 60,
            "kalan %d gun (bitis %s) -> yeni halkayi indir: "
            "http://cacerts.geotrust.com/GeoTrustTLSRSACAG1.crt" % (kalan, bilgi["notAfter"]))

denetle("bot ara sertifikayi SSL baglamina yukluyor",
        "load_verify_locations(cafile=ARA_SERTIFIKALAR)" in kaynak)
# DIKKAT: duz "CERT_NONE" aramasi YANLIS ALARM verir -- ifade, v1'in
# dogrulamayi kapatmis oldugunu anlatan ACIKLAMA satirinda geciyor.
# Aranacak olan CALISAN kodda kullanimi.
kod_satirlari = [s for s in kaynak.splitlines() if not s.strip().startswith("#")]
denetle("sertifika dogrulamasi ACIK kaldi (kodda CERT_NONE yok)",
        not any("CERT_NONE" in s for s in kod_satirlari),
        next((s.strip()[:60] for s in kod_satirlari if "CERT_NONE" in s), ""))


# =====================================================================
print()
print("=" * 62)
if not hatalar:
    print("  BASARILI — %d denetimin hepsi gecti" % gecti)
    print("=" * 62)
    sys.exit(0)
print("  BASARISIZ — %d gecti, %d KALDI" % (gecti, len(hatalar)))
for h in hatalar:
    print("    x %s" % h)
print("=" * 62)
sys.exit(1)

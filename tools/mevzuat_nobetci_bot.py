# -*- coding: utf-8 -*-
"""
NormMatik — Mevzuat Nöbetçisi (v2)
==================================

NE YAPAR
  MEB'in haftalık ders çizelgelerini, çerçeve öğretim programlarını ve norm
  kadro mevzuatını yayımladığı sayfaları tarar; YALNIZCA BİR ŞEY
  DEĞİŞTİĞİNDE Telegram'a yazar.

NEDEN BAŞTAN YAZILDI (11.09.2026)
  v1 günde üç kez mesaj atıyordu, değişiklik olsun olmasın. Ölçüldü:
    1) Hafızası yoktu. Bir önceki taramayla karşılaştırma yapmıyordu;
       yazdığı rapor dosyası GitHub'ın geçici makinesinde kalıp siliniyordu.
    2) "Değişiklik tespit edildi" dediği şey, ANA SAYFADA bir kelimenin
       GEÇMESİYDİ. ttkb.meb.gov.tr ana sayfasında "talim ve terbiye" her
       zaman geçer — kurumun kendi adı. meb.gov.tr'de "norm kadro" Ağustos'taki
       bir yer değiştirme duyurusundan, "maarif modeli" bir afiş bağlantısından
       geçiyordu. Yani her tarama "değişiklik var" diyordu.
    3) Hiçbir şey eşleşmediğinde de "her şey güncel" mesajı atıyordu.
    4) Asıl izlenmesi gereken sayfaya — TTKB Haftalık Ders Çizelgeleri
       listesine — hiç bakmıyordu. O liste sayfaya JavaScript ile yükleniyor.
  Aynı günlerde TTKB'nin listesine gerçekten yeni çizelge dosyaları geldi
  (Hazırlık Sınıfı Bulunan Özel Program Anadolu Lisesi; Spor Lisesi ve
  Tematik Spor Lisesi dosyaları 2026_09 klasörüne yeniden yüklendi).
  v1 bunları hiç görmedi.

İZLENEN KAYNAKLAR
  liste  = eklenen, kaldırılan, başlığı ya da dosyası değişen öğe bildirilir
  akış   = yalnızca YENİ öğe bildirilir (kaybolan öğe olağandır)
  derin  = günde bir kez her PDF'in sunucu imzasına (boyut, ETag, tarih)
           bakılır; MEB bir dosyayı AYNI ADLA değiştirirse de yakalanır

  TTKB   Haftalık Ders Çizelgeleri (liste, derin)
  ORGM   Özel Eğitim Haftalık Ders Çizelgeleri (liste, derin)
  TTKB   Kurul Kararları Fihrist Arşivi (liste)
  MTEGM  MTAL ve MESEM çerçeve öğretim programları, 9-12 (liste, derin)
  RG     Resmî Gazete günlük fihristi — MEB ile ilgili metinler (akış)
  TTKB   Duyurular — çizelge / kurul kararı / norm geçenler (akış)

HAFIZA
  .nobetci/durum.json. GitHub Actions önbelleğiyle çalıştırmadan
  çalıştırmaya taşınır (bkz. .github/workflows/mevzuat_nobetci.yml).
  Hafıza yoksa (ilk kurulum ya da önbellek silindiyse) taban sessizce
  kurulur ve TEK bir "kuruldu" mesajı gider.

  Telegram'a gönderim başarısız olursa hafıza GÜNCELLENMEZ: değişiklik bir
  sonraki taramada yeniden tespit edilir ve yeniden denenir. Aksi hâlde
  kaçan bir bildirim sonsuza dek kaybolurdu.

ORTAM DEĞİŞKENLERİ
  TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID   bildirim
  NOBETCI_DURUM_DOSYASI                  hafıza dosyasının yolu
  NOBETCI_DURUM_RAPORU=true              değişiklik olmasa da rapor gönder
  NOBETCI_DENEME=1                       Telegram'a GÖNDERME, ekrana yaz
"""

import datetime
import html
import json
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Türkiye 2016'dan beri yaz saati uygulamıyor; sabit UTC+3.
# (v1 GitHub makinesinin UTC saatini "tarama zamanı" diye yazıyordu.)
TSI = datetime.timezone(datetime.timedelta(hours=3))

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36 NormMatikNobetci/2.0")
ZAMAN_ASIMI = 30
# Bir kaynağa BU KADAR SÜREDİR ulaşılamıyorsa uyarı gönderilir.
#
# NEDEN SAYI DEĞİL SÜRE (12.09.2026): eşik "üst üste 3 tarama"ydı. İki sorun
# çıktı. (1) Resmî Gazete birkaç dakikalığına cevap vermeyi kesebiliyor —
# ölçüldü: 12.09'da iki kez zaman aşımı, dakikalar sonra 0,2 sn'de HTTP 200.
# Böyle bir kesinti üç taramaya denk gelirse boşuna uyarı çıkar. (2) GitHub
# zamanlanmış çalışmaları geciktiriyor ya da atlıyor; 12.09'da günde 3 yerine
# yalnızca 1 tarama koştu. Yani tarama SAYISI geçen zamanı anlatmıyor.
ULASILAMAZ_SURESI_SAAT = 24
EKSIK_YUKLEME_ORANI = 0.5  # liste öncekinin yarısının altına düşerse sayfa eksik yüklenmiş sayılır
AKIS_TAVANI = 600          # akış kaynaklarında hafızada tutulan anahtar sayısı
MESAJ_TAVANI = 3800        # Telegram sınırı 4096; pay bırakıldı

# Derin kontrolde istekler arası bekleme. 0,15 sn ile denendi (11.09.2026):
# art arda ~800 istekten sonra meslek.meb.gov.tr bağlantıyı zorla kapattı
# (WinError 10054). Günde bir kez ~400 istek; 0,3 sn toplamda ~2 dk ekler.
DERIN_BEKLEME = 0.3

# Sertifika DOĞRULANIR. v1 doğrulamayı kapatmıştı (ssl.CERT_NONE).
SSL = ssl.create_default_context()


# =========================================================================
# Ağ
# =========================================================================

def istek(url, veri=None, basliklar=None, yontem=None):
    b = {"User-Agent": UA}
    b.update(basliklar or {})
    return urllib.request.urlopen(
        urllib.request.Request(url, data=veri, headers=b, method=yontem),
        timeout=ZAMAN_ASIMI, context=SSL)


def tekrarli(fn, deneme=2, bekle=5):
    """Geçici ağ hatasında (kopma, zaman aşımı) bir kez daha dener.

    Sunucunun KESİN yanıtları (403, 404 gibi HTTPError) yeniden denenmez.
    Tek bir kopma yüzünden kaynak "ulaşılamadı" sayılmasın diye var:
    meslek.meb.gov.tr bir denemede bağlantıyı zorla kapattı.
    """
    for i in range(deneme):
        try:
            return fn()
        except urllib.error.HTTPError:
            raise
        except (urllib.error.URLError, ConnectionError, TimeoutError, OSError):
            if i == deneme - 1:
                raise
            time.sleep(bekle)


def al(url, kodlama="utf-8", deneme=2, bekle=5):
    def _al():
        with istek(url) as y:
            return y.read().decode(kodlama, "replace")
    return tekrarli(_al, deneme=deneme, bekle=bekle)


# =========================================================================
# Metin yardımcıları
# =========================================================================

def mutlak(taban, href):
    """Bağlantıyı mutlak ve TEK BİÇİMLİ hâle getirir.

    Aynı dosya bir taramada "%C3%96zel", bir taramada "Özel" diye gelirse
    iki farklı anahtar sanılır ve sahte bir "yeni dosya" bildirimi çıkar.
    """
    u = urllib.parse.urljoin(taban, html.unescape(href.strip()))
    p = urllib.parse.urlsplit(u)
    yol = urllib.parse.quote(urllib.parse.unquote(p.path), safe="/")
    return urllib.parse.urlunsplit((p.scheme, p.netloc.lower(), yol, p.query, ""))


def temiz(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    return " ".join(html.unescape(s).replace("\xa0", " ").split())


def sade(s):
    """Karşılaştırma için: küçük harf, Türkçe karakterler sadeleşmiş."""
    s = (s or "").replace("İ", "i").replace("I", "ı").lower()
    return " ".join(s.translate(str.maketrans("çğıöşüâîû", "cgiosuaiu")).split())


def dosya_adi(url):
    return urllib.parse.unquote(url.split("?")[0].rstrip("/").rsplit("/", 1)[-1])


def pdf_mi(url):
    return url.lower().split("?")[0].endswith(".pdf")


def yukleme_ayi(url):
    """MEB dosya klasöründen yükleme ayı: .../meb_iys_dosyalar/2026_09/... -> "09.2026".

    TTKB listesindeki tarih sütunu bu işe yaramaz: Spor Lisesi kaydı
    "20/05/2025" gösterirken bağlantısı 2026_09'da yüklenmiş yeni bir dosyaydı.
    """
    m = re.search(r"meb_iys_dosyalar/(\d{4})_(\d{2})/", url)
    return "%s.%s" % (m.group(2), m.group(1)) if m else ""


def baglantilar(sayfa):
    for h, m in re.findall(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>', sayfa, re.S | re.I):
        yield h, temiz(m)


def kisa(hata):
    return (type(hata).__name__ + ": " + str(hata))[:140]


def pdf_listesi(sayfa_url, sayfa):
    """Sayfadaki PDF bağlantılarını {url: {"baslik": ...}} olarak döndürür.
    Aynı PDF'e hem metinli hem simgeli bağlantı olabilir; metinli olan tutulur."""
    sonuc = {}
    for h, m in baglantilar(sayfa):
        if not pdf_mi(h):
            continue
        k = mutlak(sayfa_url, h)
        if k not in sonuc or (m and sonuc[k]["baslik"] == dosya_adi(k)):
            sonuc[k] = {"baslik": m or dosya_adi(k)}
    return sonuc


# =========================================================================
# Kaynaklar — her biri {url: {"baslik": ..., "tarih": ...}} döndürür
# =========================================================================

def ttkb_cizelgeler():
    """TTKB Haftalık Ders Çizelgeleri listesi.

    Sayfa (kategori/7) listeyi sunucudan göndermez; DataTables bir ajax
    çağrısıyla doldurur. Çıplak istek 403 verir; tarayıcının gönderdiği
    DataTables parametreleriyle açılıyor (ölçüldü, 11.09.2026: 30 kayıt).
    Değişiklik tarih sütununa değil BAĞLANTIYA bakılarak tespit edilir
    (bkz. yukleme_ayi).
    """
    sayfa = "https://ttkb.meb.gov.tr/www/haftalik-ders-cizelgeleri/kategori/7"
    p = {"draw": "1", "start": "0", "length": "500",
         "search[value]": "", "search[regex]": "false",
         "order[0][column]": "2", "order[0][dir]": "desc",
         "kategori": "7", "dil": "tr"}
    for i, ad in enumerate(("ISLEMSAAT", "BASLIK", "SIRAID")):
        p["columns[%d][data]" % i] = ad

    def _al():
        with istek("https://ttkb.meb.gov.tr/www/icerik_listele_ajax.php",
                   veri=urllib.parse.urlencode(p).encode(),
                   basliklar={"Referer": sayfa, "Origin": "https://ttkb.meb.gov.tr",
                              "X-Requested-With": "XMLHttpRequest",
                              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                              "Accept": "application/json, text/javascript, */*; q=0.01"}) as y:
            return json.loads(y.read().decode("utf-8", "replace"))

    d = tekrarli(_al)
    sonuc = {}
    for s in d.get("data", []):
        link = s.get("LINK") or ""
        if link:
            sonuc[mutlak(sayfa, link)] = {"baslik": temiz(s.get("BASLIK")),
                                          "tarih": temiz(s.get("ISLEMSAAT"))}
    toplam = d.get("recordsTotal")
    if isinstance(toplam, int) and toplam > len(sonuc):
        print("   [!] TTKB %d kayıt bildirdi, %d okundu" % (toplam, len(sonuc)))
    return sonuc


def orgm_ozel_egitim():
    u = "https://orgm.meb.gov.tr/www/haftalik-ders-cizelgeleri/icerik/3106"
    return pdf_listesi(u, al(u))


def ttkb_fihrist():
    u = "https://ttkb.meb.gov.tr/www/gecmisten-gunumuze-kurul-kararlari-fihrist-arsivi/icerik/808"
    sonuc = {}
    for h, m in baglantilar(al(u)):
        if "meb_iys_dosyalar/" in h and not h.lower().endswith(".xml"):
            k = mutlak(u, h)
            # Bağlantı metni her satırda "İNDİR"; asıl ad dosya adında.
            sonuc[k] = {"baslik": dosya_adi(k) if (not m or sade(m) == "indir") else m}
    return sonuc


def meslek_cop(kurum, sinif):
    """meslek.meb.gov.tr çerçeve öğretim programları. kurum 1 = MTAL, 2 = MESEM."""
    def oku():
        u = ("https://meslek.meb.gov.tr/cercevelistele.aspx?sinif_kodu=%d&kurum_id=%d"
             % (sinif, kurum))
        return pdf_listesi(u, al(u))
    return oku


RG_ILGILI = ("milli egitim bakanlig", "norm kadro", "ogretim kurumlari",
             "talim ve terbiye", "mesleki ve teknik egitim", "mesleki egitim merkez")


def resmi_gazete():
    """Günün fihristindeki MEB ile ilgili metinler.

    Fihrist windows-1254 kodlu. Bilinen pozitifle sınandı: 18.08.2022
    (31927) fihristinde Norm Kadro Yönetmeliği değişikliği yakalanıyor.
    """
    bugun = datetime.datetime.now(TSI).date()
    sonuc = {}
    for ek in ("", "M1", "M2"):          # mükerrer sayılar
        u = "https://www.resmigazete.gov.tr/eskiler/%s/%s/%s%s.htm" % (
            bugun.strftime("%Y"), bugun.strftime("%m"), bugun.strftime("%Y%m%d"), ek)
        try:
            # Resmî Gazete DİĞERLERİNDEN DAHA SABIRLI denenir. Ölçüm
            # (12.09.2026): site dakikalar içinde inip kalkıyor — aynı adres
            # bir denemede 0,2 sn'de HTTP 200, yirmi dakika sonra üst üste üç
            # denemede hiç yanıt vermedi (Türkiye'den de, GitHub'dan da).
            # Üç deneme, aralarında 15 sn: kısa bir kesinti taramayı
            # "ulaşılamadı" saymasın. En kötü hâlde taramaya ~1 dakika ekler.
            sayfa = al(u, kodlama="cp1254", deneme=3, bekle=15)
        except urllib.error.HTTPError as e:
            if ek and e.code == 404:
                continue
            raise
        for h, m in baglantilar(sayfa):
            if m and any(k in sade(m) for k in RG_ILGILI):
                sonuc[mutlak(u, h)] = {"baslik": m, "tarih": bugun.strftime("%d.%m.%Y")}
    return sonuc


# "öğretim programı" BİLEREK YOK (11.09.2026): Maarif Modeli öğretim
# programlarıyla ilgili araştırma raporu, çeviri, çalıştay duyuruları sık
# çıkıyor ve hiçbiri ders saatini ya da normu etkilemiyor. Denemede tam
# olarak böyle bir duyuru ("... Araştırma Raporunun İngilizce Çevirisi
# Yayımlandı") bildirim üretti.
#
# "kurulu karar" AYRICA yazılı: resmî ad "Talim ve Terbiye KURULU Kararları";
# yalnızca "kurul karar" ile o başlık KAÇIYORDU ("kurulu karar" alt dizgesi
# "kurul karar"ı içermez). Birim testi yakaladı, 11.09.2026.
DUYURU_ILGILI = ("cizelge", "kurul karar", "kurulu karar", "norm kadro",
                 "ders saati", "haftalik ders", "cerceve ogretim")


def ttkb_duyurular():
    def _al():
        with istek("https://ttkb.meb.gov.tr/meb_iys_dosyalar/xml/rss_duyurular.xml") as y:
            return y.read()
    kok = ET.fromstring(tekrarli(_al))
    sonuc = {}
    for it in kok.iter("item"):
        baslik = temiz(it.findtext("title"))
        link = (it.findtext("link") or "").strip()
        if link and any(k in sade(baslik) for k in DUYURU_ILGILI):
            sonuc[mutlak("https://ttkb.meb.gov.tr/", link)] = {
                "baslik": baslik, "tarih": temiz(it.findtext("pubDate"))[:16]}
    return sonuc


# İKGM (personel.meb.gov.tr) duyuruları — Norm Kadro Yönetmeliği'nin SAHİBİ
# olan genel müdürlük. Resmî Gazete'ye ulaşılamadığı zamanlarda yönetmelik
# değişikliğini kaçırmamak için ikinci kaynak (12.09.2026).
#
# SÜZGEÇ: akıştaki 50 duyurunun neredeyse tamamı yer değiştirme, atama ve
# sınav duyurusu. "Norm kadro" sözü bunların başlıklarında da geçiyor
# ("İhtiyaç ve Norm Kadro FAZLASI Öğretmenlerin Yer Değiştirmesi") — o yüzden
# yalnızca anahtar kelimeye bakmak her hafta yanlış bildirim üretirdi.
# Kural: "yönetmelik" geçiyorsa her hâlükârda ilgilidir; geçmiyorsa konu
# kelimelerinden biri VARSA ve personel işlemi kelimelerinden hiçbiri YOKSA.
IKGM_ILGILI = ("norm kadro", "ders saati", "cizelge", "ders okutma",
               "atama ve ders", "atama esas")
IKGM_HARIC = ("yer degistir", "fazlasi", "tercih", "sonuc", "basvuru",
              "sinav", "gorevlendirme takvim", "atama sonuc")


def ikgm_ilgili_mi(baslik):
    s = sade(baslik)
    # "yonetmeliK" DEĞİL "yonetmeli": Türkçede ek alınca k → ğ yumuşuyor
    # ("Yönetmeliği", "Yönetmelikte", "Yönetmeliğinde"). Tam kelimeyi
    # arayan ilk sürüm "Norm Kadro Yönetmeliği Değişikliği" başlığını
    # KAÇIRIYORDU; birim testi yakaladı (12.09.2026).
    if "yonetmeli" in s:
        return True
    return (any(k in s for k in IKGM_ILGILI)
            and not any(h in s for h in IKGM_HARIC))


def ikgm_duyurular():
    """İKGM duyuru akışındaki mevzuat/norm ile ilgili başlıklar."""
    def _al():
        with istek("https://personel.meb.gov.tr/meb_iys_dosyalar/xml/"
                   "rss_duyurular.xml") as y:
            return y.read()
    kok = ET.fromstring(tekrarli(_al))
    sonuc = {}
    for it in kok.iter("item"):
        baslik = temiz(it.findtext("title"))
        link = (it.findtext("link") or "").strip()
        if link and ikgm_ilgili_mi(baslik):
            sonuc[mutlak("https://personel.meb.gov.tr/", link)] = {
                "baslik": baslik, "tarih": temiz(it.findtext("pubDate"))[:16]}
    return sonuc


def hata_kaydini_guncelle(onceki, simdi):
    """
    Bir kaynağa ulaşılamadığında hata kaydını günceller.

    Dönüş: (kayit, gecen_saat, uyarilsin_mi)

    Kayıt: {"adet": kaç taramadır, "ilk": ilk başarısızlık anı,
            "bildirildi": uyarı gönderildi mi}

    Kural: uyarı, kesinti SÜRESİ eşiği (ULASILAMAZ_SURESI_SAAT) aşınca ve
    yalnızca BİR KEZ gönderilir. Kaynak düzelince kayıt silinir; bildirim
    yapılmışsa çağıran taraf "yeniden ulaşılabiliyor" notunu ekler.

    Eski hafızada bu alan düz bir SAYIydı. Sayı korunur, saat o andan
    başlatılır: geçişte uyarı en fazla bir kez, bir eşik süresi gecikir.
    """
    if isinstance(onceki, int):
        h = {"adet": onceki, "ilk": simdi.isoformat(timespec="minutes"),
             "bildirildi": False}
    elif isinstance(onceki, dict):
        h = dict(onceki)
    else:
        h = {"adet": 0, "ilk": simdi.isoformat(timespec="minutes"),
             "bildirildi": False}

    h["adet"] = int(h.get("adet") or 0) + 1
    try:
        gecen_saat = ((simdi - datetime.datetime.fromisoformat(h["ilk"]))
                      .total_seconds() / 3600.0)
    except Exception:
        # Bozuk ya da eksik tarih: sayacı şimdiden başlat, çökme.
        h["ilk"] = simdi.isoformat(timespec="minutes")
        gecen_saat = 0.0

    uyar = gecen_saat >= ULASILAMAZ_SURESI_SAAT and not h.get("bildirildi")
    if uyar:
        h["bildirildi"] = True
    return h, gecen_saat, uyar


def _kaynak(anahtar, ad, fn, tur, derin=False):
    return {"anahtar": anahtar, "ad": ad, "fn": fn, "tur": tur, "derin": derin}


KAYNAKLAR = (
    [_kaynak("ttkb_cizelge", "TTKB · Haftalık Ders Çizelgeleri", ttkb_cizelgeler, "liste", True),
     _kaynak("orgm_ozel", "ORGM · Özel Eğitim Haftalık Ders Çizelgeleri", orgm_ozel_egitim, "liste", True),
     _kaynak("ttkb_fihrist", "TTKB · Kurul Kararları Fihrist Arşivi", ttkb_fihrist, "liste")]
    + [_kaynak("meslek_mtal_%d" % s, "MTEGM · MTAL %d. sınıf çerçeve programları" % s,
               meslek_cop(1, s), "liste", True) for s in (9, 10, 11, 12)]
    + [_kaynak("meslek_mesem_%d" % s, "MTEGM · MESEM %d. sınıf çerçeve programları" % s,
               meslek_cop(2, s), "liste", True) for s in (9, 10, 11, 12)]
    + [_kaynak("resmi_gazete", "Resmî Gazete · MEB ile ilgili metinler", resmi_gazete, "akis"),
       _kaynak("ttkb_duyuru", "TTKB · Duyurular (çizelge / karar / norm)", ttkb_duyurular, "akis"),
       _kaynak("ikgm_duyuru", "İKGM · Personel duyuruları (yönetmelik / norm)",
               ikgm_duyurular, "akis")]
)


# =========================================================================
# Sunucu imzası (derin kontrol)
# =========================================================================

def dosya_imzasi(url):
    try:
        with istek(url, yontem="HEAD") as y:
            h = y.headers
            return {"etag": (h.get("ETag") or "").strip(),
                    "uzunluk": (h.get("Content-Length") or "").strip(),
                    "sunucu_tarihi": (h.get("Last-Modified") or "").strip()}
    except Exception:
        return None


def imza_degisti_mi(eski, yeni):
    """Boyut değiştiyse değişmiştir. Boyut aynıysa ETag VE tarih BİRLİKTE
    değişmiş olmalı: yük dengeleyicili sunucularda yalnızca biri oynayabilir,
    tek başına ona güvenmek her gün sahte "değişti" bildirimi üretirdi."""
    if not (eski.get("uzunluk") or eski.get("etag")):
        return False                       # önceki imza yok: ilk kayıt
    if yeni["uzunluk"] and eski.get("uzunluk") and yeni["uzunluk"] != eski["uzunluk"]:
        return True
    return bool(yeni["etag"] and eski.get("etag") and yeni["etag"] != eski["etag"]
                and yeni["sunucu_tarihi"] and eski.get("sunucu_tarihi")
                and yeni["sunucu_tarihi"] != eski["sunucu_tarihi"])


# =========================================================================
# Karşılaştırma
# =========================================================================

TUR_ADI = {"yeni": "Yeni", "dosyasi_degisti": "Dosyası değişti",
           "icerik_degisti": "Aynı adla güncellendi", "baslik_degisti": "Başlığı değişti",
           "kaldirildi": "Listeden kaldırıldı"}


def tarih_notu(url, bilgi):
    ay = yukleme_ayi(url)
    return ("yükleme: " + ay) if ay else (bilgi.get("tarih") or "")


def karsilastir(kaynak, onceki, simdiki):
    """(değişiklikler, yeni hafıza) döndürür. onceki None ise taban kurulur."""
    if onceki is None:
        return [], {u: dict(v) for u, v in simdiki.items()}

    ad = kaynak["ad"]
    degisen = []

    if kaynak["tur"] == "akis":
        kayit = dict(onceki)
        for u, v in simdiki.items():
            if u not in onceki:
                degisen.append((ad, "yeni", v["baslik"], u, v.get("tarih", "")))
                kayit[u] = dict(v)
        fazla = len(kayit) - AKIS_TAVANI
        if fazla > 0:                          # en eski anahtarlar düşer
            for u in list(kayit)[:fazla]:
                del kayit[u]
        return degisen, kayit

    eklenen = [u for u in simdiki if u not in onceki]
    cikan = [u for u in onceki if u not in simdiki]

    # Aynı başlık yeni bir dosyaya işaret ediyorsa bu "kaldırıldı + yeni"
    # değil, "dosyası değişti"dir (TTKB'nin Spor Lisesi kaydı gibi).
    cikan_basliga = {}
    for u in cikan:
        cikan_basliga.setdefault(sade(onceki[u]["baslik"]), []).append(u)
    eslesen = set()
    for u in eklenen:
        adaylar = [a for a in cikan_basliga.get(sade(simdiki[u]["baslik"]), [])
                   if a not in eslesen]
        tur = "dosyasi_degisti" if adaylar else "yeni"
        if adaylar:
            eslesen.add(adaylar[0])
        degisen.append((ad, tur, simdiki[u]["baslik"], u, tarih_notu(u, simdiki[u])))
    for u in cikan:
        if u not in eslesen:
            degisen.append((ad, "kaldirildi", onceki[u]["baslik"], u, ""))
    for u in simdiki:
        if u in onceki and sade(onceki[u]["baslik"]) != sade(simdiki[u]["baslik"]):
            degisen.append((ad, "baslik_degisti", simdiki[u]["baslik"], u,
                            "önceki: " + onceki[u]["baslik"]))

    kayit = {}
    for u, v in simdiki.items():
        kayit[u] = dict(v)
        for alan in ("etag", "uzunluk", "sunucu_tarihi"):
            if u in onceki and alan in onceki[u]:
                kayit[u][alan] = onceki[u][alan]
    return degisen, kayit


def derin_kontrol(kaynak, kayit, rapor_et):
    """Her PDF'in sunucu imzasına bakar. rapor_et False ise yalnızca kaydeder."""
    degisen = []
    for u in list(kayit):
        if not pdf_mi(u):
            continue
        im = dosya_imzasi(u)
        time.sleep(DERIN_BEKLEME)
        if not im:
            continue
        if rapor_et and imza_degisti_mi(kayit[u], im):
            degisen.append((kaynak["ad"], "icerik_degisti", kayit[u]["baslik"], u,
                            "sunucu tarihi: " + im["sunucu_tarihi"]))
        kayit[u].update(im)
    return degisen


# =========================================================================
# Mesajlar
# =========================================================================

def e(s):
    return html.escape(s or "", quote=False)


def bag(url, metin):
    return '<a href="%s">%s</a>' % (html.escape(url, quote=True), e(metin))


def parcala(satirlar):
    """Satırları Telegram sınırını aşmayacak mesajlara böler."""
    mesajlar, parca = [], ""
    for s in satirlar:
        if parca and len(parca) + len(s) + 1 > MESAJ_TAVANI:
            mesajlar.append(parca)
            parca = ""
        parca += s + "\n"
    if parca.strip():
        mesajlar.append(parca)
    return mesajlar


def degisiklik_mesaji(degisiklikler, simdi):
    satir = ["🔔 <b>NormMatik Nöbetçi — %d değişiklik</b>" % len(degisiklikler),
             "<i>%s TSİ</i>" % simdi.strftime("%d.%m.%Y %H:%M")]
    son_ad = None
    for ad, tur, baslik, url, notu in degisiklikler:
        if ad != son_ad:
            satir += ["", "<b>%s</b>" % e(ad)]
            son_ad = ad
        ek = " · " + e(notu) if notu else ""
        satir.append("• <b>%s:</b> %s%s" % (TUR_ADI.get(tur, tur), bag(url, baslik), ek))
    satir += ["", "<i>Bu belgeler NormMatik'in çizelge ve norm verisini etkileyebilir; "
                  "karşılaştırılmalı.</i>"]
    return parcala(satir)


def son_yuklenenler(hafiza, simdi, gun=60):
    """Son `gun` günde yüklendiği anlaşılan belgeler: MEB dosya klasörü
    (meb_iys_dosyalar/YYYY_AA/) ya da sunucu tarihi (Last-Modified)."""
    sinir = simdi - datetime.timedelta(days=gun)
    bulunan = []
    for k in KAYNAKLAR:
        for u, v in (hafiza.get(k["anahtar"]) or {}).items():
            zaman = None
            m = re.search(r"meb_iys_dosyalar/(\d{4})_(\d{2})/", u)
            if m:
                zaman = datetime.datetime(int(m.group(1)), int(m.group(2)), 1, tzinfo=TSI)
            elif v.get("sunucu_tarihi"):
                try:
                    zaman = datetime.datetime.strptime(
                        v["sunucu_tarihi"], "%a, %d %b %Y %H:%M:%S GMT"
                    ).replace(tzinfo=datetime.timezone.utc)
                except ValueError:
                    pass
            if zaman and zaman >= sinir:
                bulunan.append((zaman, k["ad"], v["baslik"], u))
    return sorted(bulunan, reverse=True)


def kurulum_mesaji(hafiza, saglik, simdi):
    """İlk kurulum mesajı. Son 60 günün belgeleri KAYNAK BAŞINA özetlenir:
    ilk sürüm hepsini tek tek listeliyordu ve 357 satırlık, okunmaz bir
    mesaj çıktı (MTEGM 2026 çerçeve programlarını toplu yüklemişti)."""
    satir = ["🛡️ <b>NormMatik Nöbetçi kuruldu</b>",
             "<i>%s TSİ</i>" % simdi.strftime("%d.%m.%Y %H:%M"), "",
             "Bundan sonra <b>yalnızca bir şey değiştiğinde</b> yazacağım. "
             "Her pazartesi kısa bir \"çalışıyorum\" notu gelir.", "",
             "<b>İzlenen kaynaklar</b>"]
    satir += ["• %s — %s" % (e(ad), e(durum)) for ad, durum in saglik]

    son = son_yuklenenler(hafiza, simdi)
    if son:
        gruplar = {}
        for zaman, ad, baslik, url in son:
            gruplar.setdefault(ad, []).append((zaman, baslik, url))
        satir += ["", "<b>Son 60 günde yüklenen / güncellenen belgeler</b>",
                  "<i>Kurulumdan önce yayımlanmışlar; NormMatik verisiyle "
                  "karşılaştırılmalı.</i>"]
        for k in KAYNAKLAR:
            g = gruplar.get(k["ad"])
            if not g:
                continue
            if len(g) <= 5:
                satir.append("<b>%s</b>" % e(k["ad"]))
                satir += ["• %s · %s" % (z.strftime("%m.%Y"), bag(u, b)) for z, b, u in g]
            else:
                aylar = sorted({(z.year, z.month) for z, _, _ in g})
                satir.append("• <b>%s</b>: %d belge (%s)" % (
                    e(k["ad"]), len(g), ", ".join("%02d.%d" % (a, y) for y, a in aylar)))
        if any(k["anahtar"].startswith("meslek_") and k["ad"] in gruplar for k in KAYNAKLAR):
            satir.append("<i>MTEGM tarihleri sunucunun dosya tarihidir.</i>")
    return parcala(satir)


def durum_mesaji(saglik, simdi, bildirim_sayisi, baslik):
    satir = ["🤖 <b>%s</b>" % e(baslik),
             "<i>%s TSİ</i>" % simdi.strftime("%d.%m.%Y %H:%M"), "",
             "Son 7 günde gönderilen değişiklik bildirimi: <b>%d</b>" % bildirim_sayisi, "",
             "<b>Kaynaklar</b>"]
    satir += ["• %s — %s" % (e(ad), e(durum)) for ad, durum in saglik]
    return parcala(satir)


# =========================================================================
# Telegram ve hafıza
# =========================================================================

def telegram(mesaj, deneme):
    if deneme:
        print("\n----- [DENEME] Telegram'a gidecek mesaj -----\n" + mesaj)
        return True
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
    if not (token and chat):
        print("[!] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID tanımlı değil; mesaj gönderilemedi.")
        return False
    govde = json.dumps({"chat_id": chat, "text": mesaj, "parse_mode": "HTML",
                        "disable_web_page_preview": True}).encode("utf-8")
    for deneme_no in (1, 2):
        try:
            with urllib.request.urlopen(urllib.request.Request(
                    "https://api.telegram.org/bot%s/sendMessage" % token, data=govde,
                    headers={"Content-Type": "application/json"}), timeout=20) as y:
                if json.loads(y.read().decode("utf-8")).get("ok"):
                    return True
        except urllib.error.HTTPError as h:
            # Anahtarı günlüğe BASMA; yalnızca Telegram'ın açıklaması.
            print("[!] Telegram %d: %s" % (h.code, h.read().decode("utf-8", "replace")[:200]))
        except Exception as hata:
            print("[!] Telegram gönderimi başarısız (%d. deneme): %s" % (deneme_no, kisa(hata)))
        time.sleep(3)
    return False


def durum_oku(yol):
    try:
        with open(yol, encoding="utf-8") as f:
            d = json.load(f)
        return d if isinstance(d, dict) else {}
    except FileNotFoundError:
        return {}
    except Exception as hata:
        print("[!] Hafıza okunamadı, taban yeniden kurulacak: %s" % kisa(hata))
        return {}


def durum_yaz(yol, durum):
    os.makedirs(os.path.dirname(os.path.abspath(yol)), exist_ok=True)
    gecici = yol + ".tmp"
    with open(gecici, "w", encoding="utf-8") as f:
        json.dump(durum, f, ensure_ascii=False, indent=1)
    os.replace(gecici, yol)                 # yarım yazılmış hafıza kalmasın


# =========================================================================
# Ana akış
# =========================================================================

def calistir():
    simdi = datetime.datetime.now(TSI)
    deneme = os.environ.get("NOBETCI_DENEME") == "1"
    durum_raporu = os.environ.get("NOBETCI_DURUM_RAPORU", "").strip().lower() == "true"
    yol = os.environ.get("NOBETCI_DURUM_DOSYASI") or os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".nobetci", "durum.json")

    eski = durum_oku(yol)
    eski_kaynaklar = eski.get("kaynaklar") or {}
    ilk_kurulum = not eski_kaynaklar
    yeni = {"surum": 2,
            "kurulum": eski.get("kurulum") or simdi.isoformat(timespec="minutes"),
            "kaynaklar": dict(eski_kaynaklar),
            "hatalar": dict(eski.get("hatalar") or {}),
            "son_derin": eski.get("son_derin", ""),
            "son_nabiz": eski.get("son_nabiz", ""),
            "bildirimler": list(eski.get("bildirimler") or [])}
    bugun = simdi.strftime("%Y-%m-%d")
    derin_gunu = yeni["son_derin"] != bugun

    print("NormMatik Mevzuat Nöbetçisi v2 — %s TSİ%s%s" % (
        simdi.strftime("%d.%m.%Y %H:%M"), " [DENEME]" if deneme else "",
        " [İLK KURULUM]" if ilk_kurulum else ""))

    degisiklikler, saglik, uyarilar = [], [], []
    for k in KAYNAKLAR:
        onceki = eski_kaynaklar.get(k["anahtar"])
        try:
            simdiki = k["fn"]()
            if k["tur"] == "liste" and not simdiki:
                raise RuntimeError("sayfada hiç öğe bulunamadı")
            if (k["tur"] == "liste" and onceki and len(onceki) >= 4
                    and len(simdiki) < len(onceki) * EKSIK_YUKLEME_ORANI):
                raise RuntimeError("sayfa eksik yüklendi: %d öğe (önceki %d)"
                                   % (len(simdiki), len(onceki)))
        except Exception as hata:
            h, gecen_saat, uyar = hata_kaydini_guncelle(
                yeni["hatalar"].get(k["anahtar"]), simdi)
            yeni["hatalar"][k["anahtar"]] = h

            saglik.append((k["ad"], "ULAŞILAMADI (%d. kez, %d saattir)"
                           % (h["adet"], gecen_saat)))
            print("   [x] %-48s %s  (%d. kez, %.1f saat)"
                  % (k["ad"], kisa(hata), h["adet"], gecen_saat))

            if uyar:
                uyarilar.append(
                    "⚠️ %s — %d saattir ulaşılamıyor (%d tarama).\n    %s"
                    % (e(k["ad"]), int(gecen_saat), h["adet"], e(kisa(hata))))
            continue

        eski_hata = yeni["hatalar"].pop(k["anahtar"], None)
        if isinstance(eski_hata, dict) and eski_hata.get("bildirildi"):
            uyarilar.append("✅ %s — yeniden ulaşılabiliyor." % e(k["ad"]))

        degisen, kayit = karsilastir(k, onceki, simdiki)
        if k["derin"] and (derin_gunu or onceki is None):
            degisen += derin_kontrol(k, kayit, rapor_et=onceki is not None)
        degisiklikler += degisen
        yeni["kaynaklar"][k["anahtar"]] = kayit
        saglik.append((k["ad"], "%d öğe" % len(kayit)))
        print("   [✓] %-48s %4d öğe%s" % (k["ad"], len(kayit),
                                           ("  → %d değişiklik" % len(degisen)) if degisen else ""))

    if derin_gunu:
        yeni["son_derin"] = bugun

    mesajlar = []
    if ilk_kurulum:
        mesajlar += kurulum_mesaji(yeni["kaynaklar"], saglik, simdi)
    elif degisiklikler:
        mesajlar += degisiklik_mesaji(degisiklikler, simdi)
        yeni["bildirimler"] = (yeni["bildirimler"] + [bugun])[-60:]
    if uyarilar:
        mesajlar += parcala(["<b>NormMatik Nöbetçi — kaynak durumu</b>", ""] + uyarilar)

    hafta = simdi.strftime("%G-W%V")
    sinir = (simdi - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
    son7 = sum(1 for g in yeni["bildirimler"] if g >= sinir)
    if durum_raporu:
        mesajlar += durum_mesaji(saglik, simdi, son7, "NormMatik Nöbetçi — durum raporu")
    elif not ilk_kurulum and simdi.weekday() == 0 and yeni["son_nabiz"] != hafta:
        mesajlar += durum_mesaji(saglik, simdi, son7, "NormMatik Nöbetçi çalışıyor")
        yeni["son_nabiz"] = hafta
    if ilk_kurulum:
        yeni["son_nabiz"] = hafta

    print("\nÖzet: %d değişiklik, %d uyarı, %d mesaj." % (len(degisiklikler), len(uyarilar), len(mesajlar)))

    for m in mesajlar:
        if not telegram(m, deneme):
            print("[!] Bildirim gönderilemedi; hafıza GÜNCELLENMEDİ. "
                  "Bir sonraki tarama değişikliği yeniden tespit edip yeniden deneyecek.")
            return 1
    durum_yaz(yol, yeni)
    return 0


if __name__ == "__main__":
    sys.exit(calistir())

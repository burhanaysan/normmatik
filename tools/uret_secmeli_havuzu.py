# -*- coding: utf-8 -*-
"""
NormMatik™ — Okul türüne göre seçmeli ders havuzu üreteci
==============================================================================
NE ÜRETİR: js/secmeli_havuzu.js  ->  const SECMELI_HAVUZU
           { okul_turu: { sinif: [ {ders, grup, saatler, kacKez}, ... ] } }

NEDEN VAR
    Seçmeli havuzu meb_master_db.json içinden okunuyordu. Okuma, 21 çizelge
    dosyasını dolaşıp bir dersi İLK gördüğü yerden alıyordu. Anadolu Lisesi
    dosyası önce geldiği için, uzmanlaşmış liselere Anadolu Lisesi'nin
    saatleri yazılıyordu.

    Ölçüldü (28.08.2026) — kaynak çizelgeyle karşılaştırma:

        anadolu_lisesi             125 kayıt,  10 yanlış   (%92,0 doğru)
        fen_lisesi                 119 kayıt,  21 yanlış   (%82,4)
        sosyal_bilimler_lisesi     107 kayıt,  19 yanlış   (%82,2)
        guzel_sanatlar_gorsel      133 kayıt,  56 yanlış   (%57,9)
        guzel_sanatlar_tiyatro     123 kayıt,  52 yanlış   (%57,7)
        guzel_sanatlar_muzik       152 kayıt,  54 yanlış   (%64,5)
        guzel_sanatlar_turk_muzigi 144 kayıt,  54 yanlış   (%62,5)
        spor_lisesi                118 kayıt,  60 yanlış   (%49,2)
        ------------------------------------------------------------
        TOPLAM                    1265 kayıt, 349 yanlış   (%72,4 doğru)

    Ekranda hiçbir hata görünmüyordu; yalnızca saatler yanlıştı. Norm hesabı
    seçilen saat üzerinden yürüdüğü için bu, sessiz ve doğrudan yanlış sonuç
    üreten bir hataydı.

    Aynı hata AİHL'de 28.08.2026'da bu üreteçle giderilmişti; bu sürüm onu
    bütün okul türlerine genelliyor.

KAYNAK
    data/kaynak_cizelgeler/ altındaki resmî TTKB çizelgeleri.
    Okul türü -> dosya -> tablo eşlemesi ELLE YAZILMAZ; müfredat üretecinin
    TABLOLAR listesinden okunur (tools/uret_ortaogretim_cizelgeleri.py).
    Aynı eşlemenin iki kopyası olsaydı, biri güncellenip diğeri unutulduğunda
    kimse fark etmezdi.

SAAT BİLGİSİ
    {"tip": "sabit",     "saat": 2}            -> tek seçenek
    {"tip": "secenekli", "secenekler": [1, 2]} -> açılır listede seçenekler
    null -> ders o sınıfta okutulmuyor

KULLANIM
    python -X utf8 tools/uret_secmeli_havuzu.py
    (ardından python -X utf8 tools/build_bundle.py)
==============================================================================
"""

import io
import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "tools"))

from uret_ortaogretim_cizelgeleri import TABLOLAR, KAYNAK  # noqa: E402

CIKTI = os.path.join(BASE_DIR, "js", "secmeli_havuzu.js")
SINIFLAR = ["hazirlik", "5", "6", "7", "8", "9", "10", "11", "12"]

# ORTAOKUL KAYNAKLARI
# TABLOLAR yalnızca ortaöğretim çizelgelerini eşler; ortaokul seçmelileri
# başka dosyalarda ve başka bir yapıda durur. Bu yüzden ayrı eşleme.
#
# NEDEN EKLENDİ: Ortaokul seçmeli listesi 28.08.2026'ya kadar uiComponents.js
# içinde ELLE YAZILMIŞ 16 dersti ve resmî çizelgeyle uyuşmuyordu — çizelgede
# olmayan dersler (Robotik Kodlama ve Yazılım, Satranç ve Zekâ Oyunları,
# Yazarlık ve Yazma Becerileri gibi eski müfredat kalıntıları) listede vardı,
# çizelgedeki dersler ise eksikti.
ORTAOKUL_KAYNAKLARI = [
    ("ortaokul_temel_egitim",
     "temel_egitim/ilkogretim_ilkokul_ortaokul.json"),
    ("imam_hatip_ortaokulu",
     "dogm/imam_hatip_ortaokulu.json"),
]

# Kaynakta iki ayrı yapı var:
#   OGM  -> tablolar[].gruplar[] içinde grup_adi'nda "SEÇMELİ" geçen gruplar
#   DÖGM -> secmeli_dersler.a_grubu.alanlar[] / b_grubu.programlar[]
# İkisi de aynı ders kaydına indirgenir.


def saat_secenekleri(saat_bilgisi):
    if not saat_bilgisi:
        return None
    tip = saat_bilgisi.get("tip")
    if tip == "sabit":
        s = saat_bilgisi.get("saat")
        return [int(s)] if s else None
    if tip == "secenekli":
        secenekler = [int(x) for x in (saat_bilgisi.get("secenekler") or []) if x]
        return secenekler or None
    # Bilinmeyen tip sessizce atlanırsa ders kaybolur ve kimse fark etmez.
    raise ValueError("Bilinmeyen saat tipi: %r" % (saat_bilgisi,))


def secmeli_mi(grup_adi):
    # "SEÇMELİ".upper() Türkçe'de tuzaklıdır; küçük harfe indirip bakıyoruz.
    ad = (grup_adi or "").replace("İ", "i").replace("I", "i").lower()
    for a, b in (("ç", "c"), ("ö", "o"), ("ü", "u"), ("ğ", "g"),
                 ("ş", "s"), ("ı", "i")):
        ad = ad.replace(a, b)
    if "secmel" in ad:
        return True
    # Özel Program Uygulayan Fen/Sosyal Bilimler Liseleri'nde seçmeli grubunun
    # adı "SEÇMELİ" değil, "ÇOK YÖNLÜ GELİŞİM DERSLERİ"dir. Yalnızca "seçmeli"
    # aranınca bu iki okul türü havuz DIŞINDA kalıyor ve master DB'ye düşüp
    # başka okulların derslerini görüyorlardı.
    #
    # "TEMATİK ALAN DERSLERİ" bilerek dışarıda: onlar seçmeli değil, okulun
    # temasına bağlı alan dersleridir.
    return "cok yonlu gelisim" in ad


def dersleri_topla(kaynak_json, tablo_adi):
    """(ders_adi, grup_adi, saatler_sozlugu, kac_kez) üçlüleri döndürür."""
    kayitlar = []

    # --- DÖGM biçimi (imam hatip) ---
    secmeli = kaynak_json.get("secmeli_dersler")
    if secmeli:
        for grup in secmeli.values():
            for alt in (grup.get("alanlar") or grup.get("programlar") or []):
                grup_adi = alt.get("alan_adi") or alt.get("program_adi") or "Seçmeli"
                for d in (alt.get("dersler") or []):
                    kayitlar.append((d.get("ders_adi") or "", grup_adi,
                                     d.get("saatler") or {},
                                     d.get("kac_kez_secilebilir") or 1))
        return kayitlar

    # --- OGM biçimi ---
    tablolar = kaynak_json.get("tablolar") or []
    if tablo_adi:
        tablo = next((t for t in tablolar if t.get("tablo_adi") == tablo_adi), None)
    else:
        tablo = tablolar[0] if tablolar else None
    if not tablo:
        return kayitlar

    for g in (tablo.get("gruplar") or []):
        if not secmeli_mi(g.get("grup_adi")):
            continue
        for d in (g.get("dersler") or []):
            # OGM'de dersin kendi alt grubu ("AKADEMİK ÇALIŞMALAR" gibi)
            # ders kaydında tutuluyor; yoksa grubun adı kullanılır.
            kayitlar.append((d.get("ders_adi") or "",
                             d.get("grup") or g.get("grup_adi") or "Seçmeli",
                             d.get("saatler") or {},
                             d.get("kac_kez_secilebilir") or 1))
    return kayitlar


def ortaokul_dersleri(kaynak_json):
    """Ortaokul seçmelilerini iki ayrı kaynak biçiminden okur."""
    kayitlar = []

    # Temel eğitim çizelgesi: düz liste, grubu kaydın içinde.
    for d in (kaynak_json.get("secmeli_dersler") or []):
        kayitlar.append((d.get("ders_adi") or "", d.get("grup") or "Seçmeli",
                         d.get("saatler") or {},
                         d.get("kac_kez_secilebilir") or 1))

    # İmam hatip ortaokulu: alanlara bölünmüş.
    ana = kaynak_json.get("ana_cizelge") or {}
    for alan in (ana.get("secmeli_dersler_alanlari") or []):
        grup = alan.get("alan_adi") or alan.get("grup_adi") or "Seçmeli"
        for d in (alan.get("dersler") or []):
            kayitlar.append((d.get("ders_adi") or "", grup,
                             d.get("saatler") or {},
                             d.get("kac_kez_secilebilir") or 1))

    # İHO'da ayrıca program (müzik/spor) seçmelileri var.
    for prog in (kaynak_json.get("program_secmeli_dersleri") or []):
        grup = prog.get("program_adi") or "Program Seçmeli Dersleri"
        for d in (prog.get("dersler") or []):
            kayitlar.append((d.get("ders_adi") or "", grup,
                             d.get("saatler") or {},
                             d.get("kac_kez_secilebilir") or 1))
    return kayitlar


def havuzu_kur():
    havuz = {}
    kaynak_yok = []
    istatistik = []

    hepsi = ([(t, d, a) for t, d, a in TABLOLAR]
             + [(t, d, "__ORTAOKUL__") for t, d in ORTAOKUL_KAYNAKLARI])

    for tur, dosya, tablo_adi in hepsi:
        if tablo_adi == "__AIHL__":
            tablo_adi = None          # DÖGM biçiminde tablo adı kullanılmaz
        yol = os.path.join(KAYNAK, dosya)
        if not os.path.exists(yol):
            kaynak_yok.append((tur, dosya))
            continue
        with io.open(yol, "r", encoding="utf-8") as f:
            veri = json.load(f)

        kayitlar = (ortaokul_dersleri(veri) if tablo_adi == "__ORTAOKUL__"
                    else dersleri_topla(veri, tablo_adi))
        if not kayitlar:
            # Seçmelisi olmayan tür (ör. meslek lisesi hazırlık çizelgesi).
            # Bu türler eski davranışlarını sürdürsün diye havuza EKLENMEZ;
            # boş bir havuz yazmak, listeyi tamamen boşaltırdı.
            istatistik.append((tur, 0, 0))
            continue

        tur_havuz = {}
        tekil = set()
        for ad, grup_adi, saatler, kac_kez in kayitlar:
            ad = (ad or "").strip()
            if not ad:
                continue
            tekil.add(ad)
            for sinif in SINIFLAR:
                secenekler = saat_secenekleri(saatler.get(sinif))
                if not secenekler:
                    continue
                tur_havuz.setdefault(sinif, []).append({
                    "ders": ad,
                    "grup": grup_adi,
                    "saatler": secenekler,
                    "kacKez": kac_kez,
                })

        if not tur_havuz:
            istatistik.append((tur, len(tekil), 0))
            continue

        havuz[tur] = tur_havuz
        istatistik.append((tur, len(tekil),
                           sum(len(v) for v in tur_havuz.values())))

    return havuz, istatistik, kaynak_yok


def js_yaz(havuz):
    s = []
    s.append("/* ===========================================================================")
    s.append("   OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN")
    s.append("   Üreteç : tools/uret_secmeli_havuzu.py")
    s.append("   Kaynak : data/kaynak_cizelgeler/ (resmî TTKB çizelgeleri)")
    s.append("")
    s.append("   Okul türüne göre seçmeli ders havuzu. Bu dosya, daha önce")
    s.append("   meb_master_db.json içinden okunan seçmelilerin YERİNE geçer.")
    s.append("   Eski okuma 21 dosyayı dolaşıp dersi ilk gördüğü yerden alıyordu;")
    s.append("   uzmanlaşmış liselere Anadolu Lisesi'nin saatleri yazılıyordu")
    s.append("   (1265 kayıtta 349 yanlış saat ölçüldü, 28.08.2026).")
    s.append("")
    s.append("   Yapı: SECMELI_HAVUZU[okul_turu][sinif] = [ {ders, grup, saatler} ]")
    s.append("   Bir ders yalnızca okutulduğu sınıfta yer alır.")
    s.append("   ======================================================================== */")
    s.append("const SECMELI_HAVUZU = {")
    turler = sorted(havuz.keys())
    for ti, tur in enumerate(turler):
        s.append('    "%s": {' % tur)
        siniflar = [x for x in SINIFLAR if x in havuz[tur]]
        for si, sinif in enumerate(siniflar):
            dersler = havuz[tur][sinif]
            s.append('        "%s": [   // %d ders' % (sinif, len(dersler)))
            for d in dersler:
                s.append('            { ders: %s, grup: %s, saatler: [%s], kacKez: %d },' % (
                    json.dumps(d["ders"], ensure_ascii=False),
                    json.dumps(d["grup"], ensure_ascii=False),
                    ", ".join(str(x) for x in d["saatler"]),
                    d["kacKez"]))
            s.append("        ]%s" % ("," if si < len(siniflar) - 1 else ""))
        s.append("    }%s" % ("," if ti < len(turler) - 1 else ""))
    s.append("};")
    s.append("")
    with io.open(CIKTI, "w", encoding="utf-8") as f:
        f.write("\n".join(s))


def main():
    havuz, istatistik, kaynak_yok = havuzu_kur()

    if len(havuz) < 10:
        raise SystemExit(
            "HATA: yalnizca %d okul turu icin havuz uretildi (beklenen >=10). "
            "Kaynak yapisi degismis olabilir; sessizce eksik havuz yazmiyorum."
            % len(havuz))

    js_yaz(havuz)

    print("Seçmeli ders havuzu üretildi")
    print("=" * 66)
    print("  %-32s %8s %8s" % ("OKUL TÜRÜ", "TEKİL", "SINIF-DERS"))
    print("-" * 66)
    for tur, tekil, kayit in istatistik:
        isaret = " " if kayit else "!"
        print("%s %-32s %8d %8d" % (isaret, tur, tekil, kayit))
    print("-" * 66)
    print("  havuza giren okul türü : %d" % len(havuz))
    print("  toplam sınıf-ders kaydı: %d" % sum(
        sum(len(v) for v in t.values()) for t in havuz.values()))
    if kaynak_yok:
        print()
        for tur, dosya in kaynak_yok:
            print("  ! KAYNAK YOK: %s -> %s" % (tur, dosya))
    print()
    print("  ! işaretli türlerin çizelgesinde seçmeli grubu yok; havuza")
    print("    eklenmediler ve eski davranışlarını sürdürürler.")
    print("  çıktı: %s" % CIKTI)


if __name__ == "__main__":
    main()

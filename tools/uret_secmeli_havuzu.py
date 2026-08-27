# -*- coding: utf-8 -*-
"""
NormMatik™ — Anadolu İmam Hatip Lisesi seçmeli ders havuzu üreteci
==============================================================================
NE ÜRETİR: js/secmeli_havuzu.js  ->  const AIHL_SECMELI_HAVUZU

NEDEN VAR
    AİHL seçmelileri şimdiye kadar meb_master_db.json içinden okunuyordu.
    Ölçüldü (28.08.2026): resmî çizelgedeki 129 seçmeliden 119'u sunuluyor,
    10'u hiç görünmüyordu — çünkü master DB'de yoklar:

        İslam Felsefesi, Tasavvuf Kültürü, Türk Dili ve Edebiyatı,
        Türk Kültür ve Medeniyeti Tarihi, Spor Psikolojisi ve Sosyolojisi,
        Temel Spor Eğitimi, Genel Sanat Tarihi, Temel Sanat Eğitimi,
        Türk İslam Sanatı Tarihi, Müzik ve Dramatik Etkinlikler Atölyesi

    Eksik 10 dersi elle eklemek en kolay yoldu ve YANLIŞ olurdu: aynı verinin
    üçüncü bir kopyası doğardı ve bir sonraki çizelge değişikliğinde yine elle
    güncellenmesi gerekirdi. Bu projede tekrar eden hata sınıfı tam olarak bu.
    Onun yerine havuzun TAMAMI resmî çizelgeden üretilir ve uygulamadaki
    master DB okumasının YERİNE geçer. Böylece tek kaynak kalır.

KAYNAK
    data/kaynak_cizelgeler/dogm/anadolu_imam_hatip_lisesi_ve_hazirlik.json
    (TTKB kararından üretilmiş, doğrulanmış çizelge)

SAAT BİLGİSİ
    Kaynak iki tip saat verir:
        {"tip": "sabit",     "saat": 2}            -> tek seçenek
        {"tip": "secenekli", "secenekler": [1, 2]} -> açılır listede seçenekler
    null olan sınıf, o dersin o sınıfta okutulmadığı anlamına gelir.

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
KAYNAK = os.path.join(BASE_DIR, "data", "kaynak_cizelgeler", "dogm",
                      "anadolu_imam_hatip_lisesi_ve_hazirlik.json")
CIKTI = os.path.join(BASE_DIR, "js", "secmeli_havuzu.js")

SINIFLAR = ["hazirlik", "9", "10", "11", "12"]


def saat_secenekleri(saat_bilgisi):
    """Kaynaktaki saat kaydını, arayüzün beklediği seçenek listesine çevirir."""
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


def havuzu_kur():
    with io.open(KAYNAK, "r", encoding="utf-8") as f:
        veri = json.load(f)

    secmeli = veri.get("secmeli_dersler") or {}
    if not secmeli:
        raise SystemExit("HATA: kaynakta secmeli_dersler yok: %s" % KAYNAK)

    havuz = dict((s, []) for s in SINIFLAR)
    tekil_adlar = set()
    kaynak_ders_sayisi = 0

    for grup_anahtari, grup in secmeli.items():
        # a_grubu -> alanlar[].alan_adi, b_grubu -> programlar[].program_adi
        alt_liste = grup.get("alanlar") or grup.get("programlar") or []
        if not alt_liste:
            raise SystemExit(
                "HATA: %s altinda alanlar/programlar yok. Kaynak yapisi "
                "degismis olabilir; sessizce bos havuz uretmektense duruyorum."
                % grup_anahtari)

        for alt in alt_liste:
            grup_adi = alt.get("alan_adi") or alt.get("program_adi") or "Seçmeli"
            for ders in (alt.get("dersler") or []):
                ad = (ders.get("ders_adi") or "").strip()
                if not ad:
                    continue
                kaynak_ders_sayisi += 1
                tekil_adlar.add(ad)
                saatler = ders.get("saatler") or {}
                for sinif in SINIFLAR:
                    secenekler = saat_secenekleri(saatler.get(sinif))
                    if not secenekler:
                        continue
                    havuz[sinif].append({
                        "ders": ad,
                        "grup": grup_adi,
                        "saatler": secenekler,
                        "kacKez": ders.get("kac_kez_secilebilir") or 1,
                    })

    return havuz, tekil_adlar, kaynak_ders_sayisi


def js_yaz(havuz, tekil_adlar):
    satirlar = []
    satirlar.append("/* ===========================================================================")
    satirlar.append("   OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN")
    satirlar.append("   Üreteç : tools/uret_secmeli_havuzu.py")
    satirlar.append("   Kaynak : data/kaynak_cizelgeler/dogm/"
                    "anadolu_imam_hatip_lisesi_ve_hazirlik.json")
    satirlar.append("")
    satirlar.append("   Anadolu İmam Hatip Lisesi seçmeli ders havuzu. Bu dosya, daha önce")
    satirlar.append("   meb_master_db.json içinden okunan AİHL seçmelilerinin YERİNE geçer;")
    satirlar.append("   master DB'de 10 ders eksikti (İslam Felsefesi, Tasavvuf Kültürü,")
    satirlar.append("   Türk Dili ve Edebiyatı, Türk Kültür ve Medeniyeti Tarihi, Spor")
    satirlar.append("   Psikolojisi ve Sosyolojisi, Temel Spor Eğitimi, Genel Sanat Tarihi,")
    satirlar.append("   Temel Sanat Eğitimi, Türk İslam Sanatı Tarihi, Müzik ve Dramatik")
    satirlar.append("   Etkinlikler Atölyesi) ve hiçbir şubede seçilemiyorlardı.")
    satirlar.append("")
    satirlar.append("   Anahtar = sınıf seviyesi. Her ders yalnızca okutulduğu sınıfta yer alır.")
    satirlar.append("   ======================================================================== */")
    satirlar.append("const AIHL_SECMELI_HAVUZU = {")
    for i, sinif in enumerate(SINIFLAR):
        dersler = havuz[sinif]
        satirlar.append('    "%s": [   // %d ders' % (sinif, len(dersler)))
        for d in dersler:
            satirlar.append(
                '        { ders: %s, grup: %s, saatler: [%s], kacKez: %d },' % (
                    json.dumps(d["ders"], ensure_ascii=False),
                    json.dumps(d["grup"], ensure_ascii=False),
                    ", ".join(str(x) for x in d["saatler"]),
                    d["kacKez"]))
        satirlar.append("    ]%s" % ("," if i < len(SINIFLAR) - 1 else ""))
    satirlar.append("};")
    satirlar.append("")

    with io.open(CIKTI, "w", encoding="utf-8") as f:
        f.write("\n".join(satirlar))


def main():
    havuz, tekil_adlar, kaynak_ders_sayisi = havuzu_kur()

    toplam_kayit = sum(len(v) for v in havuz.values())
    if toplam_kayit == 0:
        raise SystemExit("HATA: havuz bos uretildi; yazmiyorum.")
    if len(tekil_adlar) < 100:
        # Kaynakta 129 tekil ders var. Ciddi bir dusus, kaynak yapisinin
        # degistigine isarettir; sessizce eksik havuz yazmak en kotusudur.
        raise SystemExit(
            "HATA: yalnizca %d tekil ders bulundu (beklenen ~129). "
            "Kaynak yapisi degismis olabilir; yazmiyorum." % len(tekil_adlar))

    js_yaz(havuz, tekil_adlar)

    print("AİHL seçmeli havuzu üretildi")
    print("=" * 62)
    for sinif in SINIFLAR:
        print("  %-10s %3d ders" % (sinif, len(havuz[sinif])))
    print("-" * 62)
    print("  tekil ders adı        : %d" % len(tekil_adlar))
    print("  kaynaktaki ders kaydı : %d" % kaynak_ders_sayisi)
    print("  sınıf-ders kaydı      : %d" % toplam_kayit)
    print("  çıktı                 : %s" % CIKTI)


if __name__ == "__main__":
    if not os.path.exists(KAYNAK):
        print("HATA: kaynak bulunamadi: %s" % KAYNAK)
        sys.exit(1)
    main()

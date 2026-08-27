# -*- coding: utf-8 -*-
"""
ÇİZELGE ENVANTERİ — kaynakta ne var, uygulamada ne var?
=======================================================

NE İŞE YARAR
------------
data/kaynak_cizelgeler/ altındaki resmî çizelgelerde KAÇ okul türü var,
bunlardan kaçı uygulamaya bağlanmış? Bağlanmamış olan varsa, o okul türünü
seçen bir müdür yanlış müfredat görür — üstelik hiçbir hata mesajı çıkmaz.

NEDEN GEREKLİ
-------------
27.08.2026'da şu ortaya çıktı: Fen Lisesi, Sosyal Bilimler Lisesi, Anadolu
İmam Hatip Lisesi, Güzel Sanatlar ve Spor Lisesi seçildiğinde motor sessizce
ANADOLU LİSESİ müfredatını döndürüyordu. Kaynak dosyalar depoda duruyordu
ama motora hiç bağlanmamıştı. Bir AİHL, Kur'an-ı Kerim ve Arapça dersleri
olmadan hesaplanıyordu.

Bu betik o boşluğu görünür tutar: yeni bir çizelge indirildiğinde ya da yeni
bir okul türü eklendiğinde, bağlanmamışsa burada listelenir.

ÇALIŞTIRMA
    python -X utf8 tools/envanter_cizelgeler.py
"""
import json
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = os.path.join(KOK, "data", "kaynak_cizelgeler")


def tablolari_topla():
    """Her kaynak dosyadaki okul türü tablolarini dondurur."""
    bulunan = []
    for kok, _, dosyalar in os.walk(KAYNAK):
        for f in sorted(dosyalar):
            if not f.endswith(".json"):
                continue
            yol = os.path.join(kok, f)
            rel = os.path.relpath(yol, KAYNAK).replace("\\", "/")
            try:
                j = json.load(open(yol, encoding="utf-8"))
            except Exception as e:
                bulunan.append((rel, "(okunamadi: %s)" % e, 0))
                continue

            # OGM biçimi: tablolar[].tablo_adi
            if isinstance(j, dict) and isinstance(j.get("tablolar"), list):
                for t in j["tablolar"]:
                    ad = t.get("tablo_adi") or "(adsiz tablo)"
                    n = sum(len(g.get("dersler") or [])
                            for g in (t.get("gruplar") or []))
                    bulunan.append((rel, ad, n))
                continue

            # DÖGM / temel eğitim biçimi: ana_cizelge
            if isinstance(j, dict) and isinstance(j.get("ana_cizelge"), dict):
                ad = j.get("belge_adi") or rel
                ac = j["ana_cizelge"]
                n = sum(len(v) for v in ac.values() if isinstance(v, list))
                bulunan.append((rel, ad, n))
                continue

            # MTEGM / MESEM biçimi: liste of kayit
            if isinstance(j, list) and j and isinstance(j[0], dict) and "alan_adi" in j[0]:
                alanlar = sorted({k.get("alan_adi") for k in j if k.get("alan_adi")})
                bulunan.append((rel, "%d alan (%s ...)" % (len(alanlar), alanlar[0]), len(j)))
                continue

            # mevzuat vb.
            bulunan.append((rel, "(cizelge degil: mevzuat/veri)", 0))
    return bulunan


def uygulamanin_tanidiklari():
    """
    curriculumEngine'in AYIRT ETTİĞİ okul türleri.

    Motor, okul türü metnini `includes(...)` ile eliyor. Hangi anahtarlara
    baktığını kaynaktan okuyoruz; elle liste tutmak, motor değişince
    envanterin sessizce yanlışa düşmesi demek olurdu.
    """
    src = open(os.path.join(KOK, "js", "curriculumEngine.js"), encoding="utf-8").read()
    i = src.find("getMandatoryCourses(")
    j = src.find("ANADOLU_CURRICULUM = {", i)
    blok = src[i:j] if i >= 0 and j > i else src
    anahtarlar = set(re.findall(r'schoolTypeStr\.includes\("([^"]+)"\)', blok))
    return sorted(anahtarlar)


def main():
    print("ÇİZELGE ENVANTERİ")
    print("=" * 78)

    tablolar = tablolari_topla()
    cizelgeler = [t for t in tablolar if t[2] > 0]
    print("kaynak dosya taranan: %d, ders içeren tablo: %d"
          % (len({t[0] for t in tablolar}), len(cizelgeler)))
    if len(cizelgeler) < 5:
        print("!! şüpheli derecede az tablo bulundu — envanter güvenilir değil")
        return 1

    print()
    print("KAYNAKTAKİ OKUL TÜRÜ / ÇİZELGELER")
    print("-" * 78)
    son_dosya = None
    for rel, ad, n in cizelgeler:
        if rel != son_dosya:
            print("  " + rel)
            son_dosya = rel
        print("      %-58s %4d ders" % (ad[:58], n))

    print()
    print("MOTORUN AYIRT ETTİĞİ OKUL TÜRÜ ANAHTARLARI")
    print("-" * 78)
    anahtarlar = uygulamanin_tanidiklari()
    print("  " + ", ".join(anahtarlar) if anahtarlar else "  (bulunamadı)")
    print()
    print("  NOT: Bu anahtarlardan hiçbirine uymayan her okul türü, motorda")
    print("  ANADOLU LİSESİ müfredatına düşer. Aşağıdaki tablolardan hangileri")
    print("  gerçekten kendi müfredatını alıyor, tools/denetim_kademe_kapsami.mjs")
    print("  ile ölçülür.")
    print("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())

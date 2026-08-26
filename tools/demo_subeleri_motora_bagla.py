# -*- coding: utf-8 -*-
"""
DEMO OKULUN DERS LİSTELERİNİ MÜFREDAT MOTORUNA BAĞLAR  (tek seferlik)
=====================================================================

NEDEN
-----
`state.js` içindeki `loadDemoSchool` dört demo şubenin (9-A, 10-A, 11-A, 12-A)
ders listesini ELLE YAZILMIŞ olarak taşıyordu. Bu, uygulamadaki müfredat
verisinin ÜÇÜNCÜ kopyasıydı ve içinde hayalet "Almanca 2 saat" dersi vardı.

Sonucu şuydu: curriculumEngine.js'teki müfredat kaynaktan üretilip düzeltildi,
ama demo okul hâlâ kendi elindeki eski listeyi gösteriyordu. Kullanıcının canlı
sitede gördüğü hata tam olarak buydu — düzeltme oraya HİÇ ulaşmıyordu.

Fonksiyon `curriculumEngine`'i zaten parametre olarak alıyor; yalnızca
kullanmıyordu. Bu betik, dört listeyi de motordan üretilen listeyle değiştirir.
Böylece demo okul, resmî çizelgeyle kendiliğinden aynı kalır.

ÇALIŞTIRMA
    python -X utf8 tools/demo_subeleri_motora_bagla.py
    python -X utf8 tools/demo_subeleri_motora_bagla.py --yaz
"""
import argparse
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEDEF = os.path.join(KOK, "js", "state.js")

YARDIMCI = '''        // Demo şubelerin dersleri ELLE YAZILMAZ; müfredat motorundan alınır.
        // Daha önce elle yazılıyordu ve motordaki düzeltmeler demo okula
        // ulaşmıyordu (hayalet "Almanca" dersi bu yüzden ekranda kalmıştı).
        const demoDersler = (sinif) => {
            const ce = curriculumEngine || (typeof window !== 'undefined' && window.curriculumEngine);
            const liste = (ce && typeof ce.getMandatoryCourses === 'function')
                ? (ce.getMandatoryCourses("anadolu_lisesi", String(sinif), null, null) || [])
                : [];
            // Kopyalanır: şubede yapılan düzenleme müfredat sabitini bozmasın.
            return liste.map(d => ({
                ders: d.ders,
                saat: d.saat,
                kategori: d.kategori || "ORTAK DERSLER",
                atananBrans: d.atananBrans,
                baraj_ders: !!d.baraj_ders,
                isAtolye: false
            }));
        };

'''


def dizi_sinirlari(metin, bas):
    ac = metin.index("[", bas)
    d, j = 1, ac + 1
    while j < len(metin) and d:
        c = metin[j]
        if c == "[":
            d += 1
        elif c == "]":
            d -= 1
        elif c == '"':
            j += 1
            while j < len(metin) and metin[j] != '"':
                j += 2 if metin[j] == "\\" else 1
        j += 1
    return ac, j


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true")
    arg = ap.parse_args()

    metin = open(HEDEF, encoding="utf-8").read()
    rapor, n = [], 0

    for sinif in ["9", "10", "11", "12"]:
        kimlik = 'id: "sube_demo_%sa"' % sinif
        i = metin.find(kimlik)
        if i < 0:
            rapor.append("  %s-A : şube bulunamadı" % sinif)
            continue
        z = metin.find("zorunluDersler:", i)
        if z < 0:
            rapor.append("  %s-A : zorunluDersler bulunamadı" % sinif)
            continue
        ac, kapa = dizi_sinirlari(metin, z)
        eski = metin[ac:kapa]
        if "demoDersler(" in eski:
            rapor.append("  %s-A : zaten motora bağlı" % sinif)
            continue
        ders_sayisi = eski.count("{ ders:")
        alm = "Almanca" in eski
        metin = metin[:ac] + "demoDersler(%s)" % sinif + metin[kapa:]
        rapor.append("  %s-A : %2d elle yazılı ders -> motordan üretiliyor%s"
                     % (sinif, ders_sayisi, "   (hayalet Almanca vardı)" if alm else ""))
        n += 1

    # Yardımcıyı fonksiyonun başına bir kez ekle
    if n and "const demoDersler" not in metin:
        m = re.search(r"loadDemoSchool\(dbService, curriculumEngine\)\s*\{\s*\n"
                      r"([ \t]*this\.pushHistory\(\);\s*\n)", metin)
        if not m:
            raise SystemExit("!! loadDemoSchool başlangıcı bulunamadı")
        metin = metin[:m.end()] + YARDIMCI + metin[m.end():]
        rapor.append("  + demoDersler yardımcısı eklendi")

    print("DEMO ŞUBELERİ MÜFREDAT MOTORUNA BAĞLAMA")
    print("=" * 66)
    for r in rapor:
        print(r)
    print("=" * 66)
    print("değiştirilen şube: %d" % n)

    if arg.yaz and n:
        with open(HEDEF, "w", encoding="utf-8") as f:
            f.write(metin)
        print("yazıldı: %s" % HEDEF)
        print("UNUTMAYIN: python -X utf8 tools/build_bundle.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())

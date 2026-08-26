# -*- coding: utf-8 -*-
"""
REHBERLİK VE YÖNLENDİRME DERSİNİ ORTAOKUL MÜFREDATLARINA EKLER  (tek seferlik)
=============================================================================

NEDEN
-----
Resmî çizelge bu dersi 5, 6, 7 ve 8. sınıfların dördünde de 1 saat gösteriyor.
Uygulamada 5-7 hiç yoktu; 8'de "Rehberlik ve Kariyer Planlama" adıyla vardı.

Kaynaklar:
  - İlköğretim Kurumları HDÇ, TTKB Sayı 04, 09/05/2025
  - İmam Hatip Ortaokulu HDÇ, DÖGM, 2025-2026'dan itibaren

NORM ETKİSİ YOK — ölçüldü. normEngine "Rehberlik" branşını ders yükü
listesinden düşürüyor ("Sınıf rehberliği yükü branş öğretmenlerine yazılır").
Beş şubeli bir okulda ders eklenmeden önce ve sonra on üç branşın yükü ve
normu birebir aynı çıktı. Değişen tek şey, şubenin haftalık toplamının
34'ten 35'e çıkıp çizelgeyle örtüşmesi.

AÇIK KALAN: Bu 1 saatin, dersi okutan branş öğretmeninin ders yüküne sayılıp
sayılmadığı. Çizelge "bütün alan öğretmenleri tarafından okutulur" diyor;
Norm Kadro Yönetmeliği ise rehberliği yalnızca rehber öğretmen normu
bağlamında anıyor, ders yükü tanımında hiç anmıyor. Kullanıcı bunu bir
ortaokul müdürüne soracak. Cevap "sayılır" olursa AYRI bir düzeltme gerekir
ve o düzeltme normEngine'i ilgilendirir.

Betik tekrar çalıştırılabilir: ders zaten varsa dokunmaz.

ÇALIŞTIRMA
    python -X utf8 tools/ekle_rehberlik_dersi.py          # yalnızca göster
    python -X utf8 tools/ekle_rehberlik_dersi.py --yaz
"""
import argparse
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEDEF = os.path.join(KOK, "js", "curriculumEngine.js")

SATIR = ('{ ders: "Rehberlik ve Yönlendirme", saat: 1, '
         'atananBrans: "Rehberlik", kategori: "REHBERLİK" }')

# (sabit adı, eklenecek sınıflar, açıklama)
ISLER = [
    ("IHO_CURRICULUM", ["5", "6", "7"], "İmam Hatip Ortaokulu"),
    ("ORTAOKUL_CURRICULUM", ["5", "6", "7"], "Ortaokul"),
]


def blok_sinirlari(metin, ad):
    m = re.search(r"^([ \t]*)const %s\s*=\s*\{" % ad, metin, re.M)
    if not m:
        raise SystemExit("!! %s bulunamadı" % ad)
    ac = metin.index("{", m.start())
    d, j = 1, ac + 1
    while j < len(metin) and d:
        c = metin[j]
        if c == "{":
            d += 1
        elif c == "}":
            d -= 1
        elif c == '"':
            j += 1
            while j < len(metin) and metin[j] != '"':
                j += 2 if metin[j] == "\\" else 1
        j += 1
    return ac, j


def sinif_dizisi(blok, sinif):
    """Bir sınıfın [ ... ] dizisinin başlangıç/bitiş konumunu döndürür."""
    m = re.search(r'"%s"\s*:\s*\[' % sinif, blok)
    if not m:
        return None
    ac = blok.index("[", m.start())
    d, j = 1, ac + 1
    while j < len(blok) and d:
        c = blok[j]
        if c == "[":
            d += 1
        elif c == "]":
            d -= 1
        elif c == '"':
            j += 1
            while j < len(blok) and blok[j] != '"':
                j += 2 if blok[j] == "\\" else 1
        j += 1
    return ac, j


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true")
    arg = ap.parse_args()

    metin = open(HEDEF, encoding="utf-8").read()
    rapor, degisiklik = [], 0

    for ad, siniflar, etiket in ISLER:
        bas, son = blok_sinirlari(metin, ad)
        blok = metin[bas:son]

        # 8. sınıftaki eski adı resmî adına çevir
        if "Rehberlik ve Kariyer Planlama" in blok:
            blok = blok.replace("Rehberlik ve Kariyer Planlama",
                                "Rehberlik ve Yönlendirme")
            rapor.append("  %-22s 8. sınıf: ad düzeltildi "
                         "(Kariyer Planlama -> Yönlendirme)" % etiket)
            degisiklik += 1

        for sinif in siniflar:
            yer = sinif_dizisi(blok, sinif)
            if not yer:
                rapor.append("  %-22s %s. sınıf: DİZİ BULUNAMADI" % (etiket, sinif))
                continue
            ac, kapa = yer
            icerik = blok[ac:kapa]
            if "Rehberlik" in icerik:
                rapor.append("  %-22s %s. sınıf: zaten var, dokunulmadı"
                             % (etiket, sinif))
                continue
            # Son dersin girintisini kullan ki biçim bozulmasın
            son_satir = icerik.rstrip()[:-1].rstrip()          # kapanış ] öncesi
            girinti = re.search(r"\n([ \t]*)\{", icerik)
            g = girinti.group(1) if girinti else "                    "
            yeni = son_satir + ",\n" + g + SATIR + "\n" + g[:-4] + "]"
            blok = blok[:ac] + yeni + blok[kapa:]
            rapor.append("  %-22s %s. sınıf: ders eklendi (1 saat)" % (etiket, sinif))
            degisiklik += 1

        metin = metin[:bas] + blok + metin[son:]

    print("REHBERLİK VE YÖNLENDİRME — ORTAOKUL MÜFREDATLARINA EKLEME")
    print("=" * 70)
    for r in rapor:
        print(r)
    print("=" * 70)
    print("toplam değişiklik: %d" % degisiklik)

    if arg.yaz and degisiklik:
        with open(HEDEF, "w", encoding="utf-8") as f:
            f.write(metin)
        print("yazıldı: %s" % HEDEF)
        print("UNUTMAYIN: python -X utf8 tools/build_bundle.py")
    elif arg.yaz:
        print("değişiklik yok, dosyaya dokunulmadı.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

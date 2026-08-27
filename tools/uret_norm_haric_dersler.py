# -*- coding: utf-8 -*-
"""
NORMA DAHİL EDİLMEYEN YAN DERSLER TABLOSU ÜRETİCİSİ
===================================================

NE ÜRETİR
---------
js/norm_haric_dersler.js — "şu ders, şu branşın norm hesabına dahil edilmez"
bilgisini taşıyan tablo. Uygulama bunu, ders satırında küçük bir uyarı
işareti göstermek için kullanır. UYARIDIR, ENGEL DEĞİLDİR: saat yine o branşa
yazılır, karar idarecinindir.

KAYNAK
------
data/kaynak_cizelgeler/mevzuat/norm_kadro_esas_dersler_cizelgesi.json
(MEB Norm Kadroya Esas Dersler Çizelgesi, 47 branş)

NEDEN DAR TUTULDU
-----------------
Çizelgedeki 57 "hariç" kaydının hepsi kullanılabilir değil. İki tür var:

  SOMUT   : "Sağlık Bilgisi ve Trafik Kültürü", "Astronomi ve Uzay Bilimleri"
            -> gerçek bir ders adı, birebir eşleşir
  BELİRSİZ: "Büro Yönetimi Dersleri", "Ortaokul Branş Dersleri"
            -> bir ders değil, bir KÜME tarifi

Belirsiz kayıtlarla eşleştirme yapmak tahmin yürütmektir ve yanlış uyarı
üretir. Bu yüzden bir kayıt, ancak uygulamanın gerçekten tanıdığı bir ders
adına BİREBİR oturuyorsa tabloya girer. Oturmayanlar dosyaya yorum olarak
yazılır ki neyin neden dışarıda kaldığı görünsün.

KADEME AYRIMI
-------------
Çizelge "Fen Bilimleri (Ortaokul)" ile "Fen Bilimleri (Lise)"yi bilerek
ayırmıştır: birincisi Fizik'in normuna girmez, ikincisi Biyoloji'nin normuna
GİRER. Parantezli niteleyici atılırsa bu ikisi karışır ve doğru bir atama
yanlış diye işaretlenir. Bu yüzden niteleyici korunur ve uyarı yalnızca
ilgili kademede gösterilir.

ÇALIŞTIRMA
    python -X utf8 tools/uret_norm_haric_dersler.py
    python -X utf8 tools/uret_norm_haric_dersler.py --yaz
"""
import argparse
import json
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIZELGE = os.path.join(KOK, "data", "kaynak_cizelgeler", "mevzuat",
                       "norm_kadro_esas_dersler_cizelgesi.json")
CIKTI = os.path.join(KOK, "js", "norm_haric_dersler.js")

# Branş adları uygulamanın kanonik yazımına çevrilir (çizelge kısaltma kullanır).
BRANS_ESLESTIRME = {
    "Din Kültürü ve A.B.": "Din Kültürü ve Ahlak Bilgisi",
    "Sağlık / Sağlık Hizmetleri": "Sağlık Hizmetleri",
    "Kimya Teknolojisi": "Kimya / Kimya Teknolojisi",
    "Elektrik-Elektronik Teknoloji": "Elektrik-Elektronik Teknolojisi",
    "Büro Yönetimi / Yönetici Asist.": "Büro Yönetimi ve Yönetici Asistanlığı",
    "Güzellik Saç Bakım Hizmetleri": "Güzellik Hizmetleri",
}

# Parantez içindeki kademe niteleyicileri -> uygulamanın okul türü ailesi
KADEME = {
    "lise": "lise",
    "ortaokul": "ortaokul",
    "ilkokul": "ilkokul",
    "normal okullar": None,      # kademe kısıtı yok
}


def tr_kucuk(s):
    return "".join({"I": "ı", "İ": "i"}.get(c, c) for c in s).lower()


def anahtar(s):
    s = tr_kucuk(re.sub(r"\(.*?\)", " ", s))
    tr = {"ş": "s", "ğ": "g", "ü": "u", "ö": "o", "ç": "c", "ı": "i"}
    s = "".join(tr.get(c, c) for c in s)
    return re.sub(r"[^a-z0-9]", "", s)


def ders_evreni():
    """
    Uygulamanın gerçekten tanıdığı ders adları. Bir "hariç" kaydının somut mu
    yoksa küme tarifi mi olduğunu ancak buna bakarak anlayabiliriz.
    """
    evren = {}

    def ekle(ad):
        k = anahtar(ad)
        if k and k not in evren:
            evren[k] = ad

    # curriculumEngine: kanonik ders sözlüğü + elle yazılı müfredat sabitleri
    src = open(os.path.join(KOK, "js", "curriculumEngine.js"), encoding="utf-8").read()
    for m in re.finditer(r"course:\s*'((?:[^'\\]|\\.)+)'", src):
        ekle(m.group(1).replace("\\'", "'"))
    for m in re.finditer(r'\{\s*ders:\s*"([^"]+)"', src):
        ekle(m.group(1))

    # üretilmiş veritabanları
    for f in ("strict_elective_courses_db.js", "strict_pdf_curriculum_db.js",
              "mesem_curriculum_db.js"):
        yol = os.path.join(KOK, "js", f)
        if not os.path.exists(yol):
            continue
        t = open(yol, encoding="utf-8").read()
        for m in re.finditer(r'"(?:ders_adi|ders|dersAdi|courseName)"\s*:\s*"([^"]+)"', t):
            ekle(m.group(1))

    # resmî kaynak JSON'ları
    for kok, _, dosyalar in os.walk(os.path.join(KOK, "data", "kaynak_cizelgeler")):
        for f in dosyalar:
            if not f.endswith(".json"):
                continue
            t = open(os.path.join(kok, f), encoding="utf-8").read()
            for m in re.finditer(r'"(?:ders_adi|ders)"\s*:\s*"([^"]+)"', t):
                ekle(m.group(1))

    return evren


def uret():
    d = json.load(open(CIZELGE, encoding="utf-8"))
    evren = ders_evreni()
    somut, belirsiz = [], []

    for b in d["branslar"]:
        brans = BRANS_ESLESTIRME.get(b["brans_adi"], b["brans_adi"])
        for ham in b.get("norma_dahil_edilmeyen_yan_dersler") or []:
            par = re.findall(r"\((.*?)\)", ham)
            kademe = KADEME.get(tr_kucuk(par[0]).strip(), "?") if par else None
            k = anahtar(ham)
            if k in evren and kademe != "?":
                somut.append({
                    "brans": brans,
                    "dersAnahtari": k,
                    "dersAdi": evren[k],
                    "cizelgeIfadesi": ham,
                    "kademe": kademe,
                })
            else:
                belirsiz.append((brans, ham,
                                 "küme tarifi" if k not in evren else "kademe niteleyicisi tanınmadı"))
    return somut, belirsiz, len(evren)


def js_yaz(somut, belirsiz, evrenSayisi):
    s = ['/*',
         ' * NORMA DAHİL EDİLMEYEN YAN DERSLER — ÜRETİLMİŞTİR, ELLE DÜZENLEMEYİN.',
         ' * Üreteç: tools/uret_norm_haric_dersler.py',
         ' * Kaynak: MEB Norm Kadroya Esas Dersler Çizelgesi (47 branş)',
         ' *',
         ' * Bu tablo UYARI içindir, ENGEL değildir. Ders yine seçilen branşın',
         ' * yüküne eklenir; tablo yalnızca "bu ders bu branşın norm hesabına',
         ' * dahil edilmez" bilgisini ekranda göstermeye yarar. Takdir idarecinindir.',
         ' *',
         ' * Yalnızca çizelgede ADIYLA geçen dersler buradadır. "Büro Yönetimi',
         ' * Dersleri" gibi küme tarifleri bilerek DIŞARIDA bırakılmıştır; onlarla',
         ' * eşleştirme yapmak tahmin yürütmek olurdu.',
         ' *',
         ' * kademe: null ise her okul türünde uyarır; "lise"/"ortaokul"/"ilkokul"',
         ' * ise yalnızca o kademede. Çizelge "Fen Bilimleri (Ortaokul)" ile',
         ' * "(Lise)" ayrımını bilerek yapmıştır.',
         ' */',
         'const NORM_HARIC_DERSLER = [']
    for r in somut:
        s.append('    { brans: %s, dersAnahtari: %s, dersAdi: %s, kademe: %s, cizelge: %s },' % (
            json.dumps(r["brans"], ensure_ascii=False),
            json.dumps(r["dersAnahtari"], ensure_ascii=False),
            json.dumps(r["dersAdi"], ensure_ascii=False),
            json.dumps(r["kademe"], ensure_ascii=False) if r["kademe"] else "null",
            json.dumps(r["cizelgeIfadesi"], ensure_ascii=False)))
    s.append('];')
    s.append('')
    s.append('/* KULLANILMAYAN KAYITLAR (küme tarifi oldukları için):')
    for br, ham, sebep in belirsiz:
        s.append('     %-32s %-46s [%s]' % (br, ham, sebep))
    s.append('*/')
    s.append('')
    s.append('/**')
    s.append(' * Bu ders, bu branşın norm hesabına dahil edilmiyor mu?')
    s.append(' * Dönen değer: eşleşen kayıt (uyarı metni için) veya null.')
    s.append(' */')
    s.append('function normHaricKaydiBul(dersAdi, bransAdi, okulTuru) {')
    s.append('    if (!dersAdi || !bransAdi) return null;')
    s.append('    const sadelestir = (x) => String(x || "")')
    s.append('        .replace(/\\(.*?\\)/g, " ")')
    s.append('        .replace(/[İI]/g, "i").toLowerCase()')
    s.append('        .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u")')
    s.append('        .replace(/ö/g, "o").replace(/ç/g, "c").replace(/ı/g, "i")')
    s.append('        .replace(/[^a-z0-9]/g, "");')
    s.append('    const dk = sadelestir(dersAdi);')
    s.append('    const bk = sadelestir(bransAdi);')
    s.append('    const tur = String(okulTuru || "").toLowerCase();')
    s.append('    // Okul türünden kademe ailesi çıkarılır.')
    s.append('    const kademe = tur.includes("ilkokul") ? "ilkokul"')
    s.append('        : (tur.includes("ortaokul") ? "ortaokul"')
    s.append('        : (tur ? "lise" : null));')
    s.append('    for (const k of NORM_HARIC_DERSLER) {')
    s.append('        if (k.dersAnahtari !== dk) continue;')
    s.append('        if (sadelestir(k.brans) !== bk) continue;')
    s.append('        if (k.kademe && kademe && k.kademe !== kademe) continue;')
    s.append('        return k;')
    s.append('    }')
    s.append('    return null;')
    s.append('}')
    s.append('')
    with open(CIKTI, "w", encoding="utf-8") as f:
        f.write("\n".join(s))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true")
    arg = ap.parse_args()

    somut, belirsiz, evrenSayisi = uret()

    print("NORMA DAHİL EDİLMEYEN YAN DERSLER")
    print("=" * 78)
    print("uygulamanın tanıdığı ders adı: %d" % evrenSayisi)
    if evrenSayisi < 400:
        print("!! ders evreni şüpheli derecede küçük — üretim güvenilir değil")
        return 1
    print()
    print("KULLANILAN (%d)" % len(somut))
    print("-" * 78)
    for r in somut:
        kd = r["kademe"] or "her kademe"
        print("  %-30s ✕ %-34s [%s]" % (r["brans"], r["dersAdi"], kd))
    print()
    print("KULLANILMAYAN (%d) — küme tarifi, eşleştirme yapılmadı" % len(belirsiz))
    print("-" * 78)
    for br, ham, sebep in belirsiz:
        print("  %-30s ✕ %s" % (br, ham))

    if arg.yaz:
        js_yaz(somut, belirsiz, evrenSayisi)
        print()
        print("yazıldı: %s" % CIKTI)
        print("UNUTMAYIN: build_bundle.py listesine ekleyin ve paketi yenileyin.")
    print("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())

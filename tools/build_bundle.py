# -*- coding: utf-8 -*-
"""
NormMatik™ — Paketleyici (bundle.js üreticisi)
==============================================================================
app.html YALNIZCA js/bundle.js dosyasını yükler. Bu yüzden js/ altındaki bir
kaynak dosyayı düzenlemek TEK BAŞINA HİÇBİR ŞEY DEĞİŞTİRMEZ; paketin yeniden
üretilmesi gerekir.

NEDEN AYRI BİR SCRIPT?
    Paketleme mantığı daha önce update_curriculum_from_pdfs.py içindeydi ve
    yalnızca tüm PDF'ler yeniden taranırken (3 aşamalı build_all) çalışıyordu.
    Bu yüzden "sadece bir kod satırı düzelttim, paketi yenileyeyim" demek
    mümkün değildi. Artık paketleme bağımsız çalışır.

KULLANIM:
    python tools/build_bundle.py

DOĞRULAMA (paketlemeden önce mutlaka):
    node tools/test_normEngine.mjs
==============================================================================
"""

import datetime
import os
import json
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS_DIR = os.path.join(BASE_DIR, "js")
APP_HTML = os.path.join(BASE_DIR, "app.html")
SW_JS = os.path.join(BASE_DIR, "sw.js")

# Paket sırası ÖNEMLİDİR: bundle düz birleştirme yapar ve modül kapsamı yoktur.
# Bir dosya, kendisinden önce gelen dosyalardaki const/class'lara erişebilir.
# Örn. normEngine.js, NORM_RULES_CONFIG'i kullanabilmek için normRulesConfig.js'ten
# SONRA gelmek zorundadır.
BUNDLE_FILES = [
    "licenseClientManager.js",
    "fiyat.js",                  # uiComponents.js'ten ÖNCE (lisans fiyatı tek kaynak)
    "surum.js",                  # app.js/uiComponents.js'ten ONCE (surum numarasi tek kaynak)
    "iletisim.js",               # uiComponents.js'ten ONCE (whatsapp mesaji tek kaynak)
    "guvenlik.js",               # state.js/app.js/uiComponents.js'ten ONCE (guvenli metin, Denetim G-01)
    "normRulesConfig.js",        # normEngine.js'ten ÖNCE olmalı
    "liveUpdateSyncEngine.js",
    "strict_pdf_curriculum_db.js",
    "strict_elective_courses_db.js",
    "mesem_curriculum_db.js",    # database.js ve curriculumEngine.js'ten ÖNCE
    "ortaogretim_cizelgeleri.js", # curriculumEngine.js'ten ÖNCE (üretilmiş tablo)
    "secmeli_havuzu.js",         # uiComponents.js'ten ÖNCE (üretilmiş seçmeli havuzu)
    "ozel_egitim_cizelgeleri.js", # curriculumEngine.js'ten ÖNCE (üretilmiş çizelge)
    "hedef_temelli_dersler.js",  # normEngine.js'ten ÖNCE (üretilmiş kapsam listesi)
    "ozel_program_temalari.js",  # curriculumEngine.js'ten ÖNCE (üretilmiş tema tablosu)
    "secmeliTemaKurallari.js",   # reportsEngine.js ve uiComponents.js'ten ÖNCE
                                 # (seçmeli tema kuralları + kanonik grup eşlemesi)
    "database.js",
    "curriculumEngine.js",
    "normEngine.js",
    "reportsEngine.js",
    "firebaseAuth.js",           # cloudDatabaseService.js'ten ÖNCE olmalı
    "authService.js",
    "cloudDatabaseService.js",
    "state.js",
    "eOkulImporter.js",
    "uiComponents.js",
    "app.js",
]

EXPORTS_CODE = """
if (typeof window !== 'undefined') {
    if (typeof MebLicenseClientManager !== 'undefined') window.MebLicenseClientManager = MebLicenseClientManager;
    if (typeof licenseManager === 'undefined' && typeof MebLicenseClientManager !== 'undefined') {
        window.licenseManager = new MebLicenseClientManager();
    }
    if (typeof NORMMATIK_FIYAT !== 'undefined') window.NORMMATIK_FIYAT = NORMMATIK_FIYAT;
    if (typeof NormGuvenlik !== 'undefined') window.NormGuvenlik = NormGuvenlik;
    if (typeof NORM_RULES_CONFIG !== 'undefined') window.NORM_RULES_CONFIG = NORM_RULES_CONFIG;
    if (typeof LiveUpdateSyncEngine !== 'undefined') window.LiveUpdateSyncEngine = LiveUpdateSyncEngine;
    if (typeof syncEngine === 'undefined' && typeof LiveUpdateSyncEngine !== 'undefined') {
        window.syncEngine = new LiveUpdateSyncEngine();
    }
    if (typeof STRICT_PDF_CURRICULUM_DB !== 'undefined') window.STRICT_PDF_CURRICULUM_DB = STRICT_PDF_CURRICULUM_DB;
    if (typeof STRICT_ELECTIVE_COURSES_DB !== 'undefined') window.STRICT_ELECTIVE_COURSES_DB = STRICT_ELECTIVE_COURSES_DB;
    if (typeof MESEM_CURRICULUM_DB !== 'undefined') window.MESEM_CURRICULUM_DB = MESEM_CURRICULUM_DB;
    if (typeof ORTAOGRETIM_CIZELGELERI !== 'undefined') window.ORTAOGRETIM_CIZELGELERI = ORTAOGRETIM_CIZELGELERI;
    if (typeof SECMELI_HAVUZU !== 'undefined') window.SECMELI_HAVUZU = SECMELI_HAVUZU;
    if (typeof OZEL_EGITIM_CIZELGELERI !== 'undefined') window.OZEL_EGITIM_CIZELGELERI = OZEL_EGITIM_CIZELGELERI;
    if (typeof HEDEF_TEMELLI !== 'undefined') window.HEDEF_TEMELLI = HEDEF_TEMELLI;
    if (typeof OZEL_PROGRAM_TEMALARI !== 'undefined') window.OZEL_PROGRAM_TEMALARI = OZEL_PROGRAM_TEMALARI;
    if (typeof SECMELI_TEMA_KURALLARI !== 'undefined') window.SECMELI_TEMA_KURALLARI = SECMELI_TEMA_KURALLARI;
    if (typeof dbService !== 'undefined') window.dbService = dbService;
    if (typeof curriculumEngine !== 'undefined') window.curriculumEngine = curriculumEngine;
    if (typeof normEngine !== 'undefined') window.normEngine = normEngine;
    if (typeof MebReportsEngine !== 'undefined') window.MebReportsEngine = MebReportsEngine;
    // NOT: Burada eskiden `window.reportsEngine = new MebReportsEngine()` vardı.
    // PARAMETRESİZ kuruluyordu, yani db/normEngine/curriculum bağlanmamış bir
    // örnekti; herhangi bir raporu çağırsanız "Cannot read properties of
    // undefined" ile çökerdi. Kimse kullanmıyordu ama kullanılmaya hazır
    // görünüyordu — tuzaktı. Doğru bağlanmış örnek uiComponents.reports'tur
    // ve app.js `window.uiComponents` üzerinden erişilebilir kılar.
    if (typeof firebaseAuth !== 'undefined') window.firebaseAuth = firebaseAuth;
    if (typeof authService !== 'undefined') window.authService = authService;
    if (typeof cloudDatabaseService !== 'undefined') window.cloudDatabaseService = cloudDatabaseService;
    if (typeof cloudDbService !== 'undefined') window.cloudDbService = cloudDbService;
    if (typeof appState !== 'undefined') window.appState = appState;
    if (typeof uiComponents !== 'undefined') window.uiComponents = uiComponents;
    if (typeof EOkulImporter !== 'undefined') window.EOkulImporter = EOkulImporter;
    if (typeof mebApp !== 'undefined') window.mebApp = mebApp;
}
"""


def strip_module_syntax(content):
    """
    ES modül sözdizimini düz script'e çevirir.
    Paket tek bir global kapsamda çalıştığı için import/export gerekmez.
    """
    lines = []
    for line in content.splitlines():
        if line.startswith("import ") or line.startswith("export {"):
            continue
        line = line.replace("export class ", "class ")
        line = line.replace("export const ", "const ")
        line = line.replace("export function ", "function ")
        line = line.replace("export default ", "")
        lines.append(line)
    return "\n".join(lines)


def gorsel_damgala():
    """Karsilama sayfasindaki ekran goruntulerine surum etiketi basar.

    NEDEN: goruntuler AYNI DOSYA ADIYLA degistiriliyor (ekran_5.jpg gibi).
    Etiket olmazsa siteye daha once girmis ziyaretci tarayici onbelleginden
    ESKI resmi gormeye devam eder ve bunu kimse fark etmez. Ayni sessiz hata
    app.css'te 2026-08-24'te, landing.css'te 2026-08-26'da yasandi; bu sefer
    goruntuler icin (09.09.2026).

    Damga her pakette yenilenir; goruntu degismese de zararsizdir, yalnizca
    bir kereligine yeniden indirilir.
    """
    damga = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    yol = os.path.join(BASE_DIR, "index.html")
    if not os.path.exists(yol):
        return ["  ! index.html bulunamadi"]
    with open(yol, "r", encoding="utf-8") as fh:
        metin = fh.read()
    yeni_metin, n = re.subn(r'(screenshots/ekran_\d+\.jpg\?v=)[^"\']+',
                            lambda m: m.group(1) + damga, metin)
    if not n:
        return ["  ! ETIKET BULUNAMADI: screenshots/ekran_N.jpg?v= (ELLE EKLEYIN)"]
    with open(yol, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(yeni_metin)
    return ["  + %d gorsel referansi -> %s" % (n, damga)]


def fiyat_oku():
    """js/fiyat.js icindeki degerleri okur. TEK KAYNAK oradadir."""
    yol = os.path.join(JS_DIR, "fiyat.js")
    metin = open(yol, "r", encoding="utf-8").read()
    alanlar = {}
    for ad in ("tutar", "gosterimSite", "kapsamMetni", "semaAciklama"):
        m = re.search(ad + r'\s*:\s*"?([^",\n]+)"?', metin)
        if not m:
            return None
        alanlar[ad] = m.group(1).strip()
    return alanlar


def fiyat_senkronize():
    """index.html'deki fiyat, js/fiyat.js ile ayni olsun.

    NEDEN: fiyat DORT yerde yaziliydi (lisans penceresi, WhatsApp mesaji,
    index.html kutusu, index.html JSON-LD semasi). Fiyat degistiginde biri
    unutulursa HATA VERMEZ; site bir sey, uygulama baska sey soyler. Bu
    fonksiyon site tarafini mekanik olarak hizalar; uygulama tarafi zaten
    sabiti dogrudan okur.
    """
    f = fiyat_oku()
    sonuc = []
    if not f:
        return ["  ! js/fiyat.js okunamadi, index.html fiyati DEGISMEDI"]

    yol = os.path.join(BASE_DIR, "index.html")
    if not os.path.exists(yol):
        return ["  ! index.html bulunamadi"]
    with open(yol, "r", encoding="utf-8") as fh:
        metin = fh.read()

    kurallar = [
        (r'(<div class="fiyat-tutar">)[^<]*(</div>)', f["gosterimSite"], "fiyat kutusu tutar"),
        (r'(<div class="fiyat-kapsam">)[^<]*(</div>)', f["kapsamMetni"], "fiyat kutusu kapsam"),
        (r'("price":\s*")[^"]*(")', f["tutar"], "JSON-LD price"),
        (r'("description":\s*")Okul başına[^"]*(")', f["semaAciklama"], "JSON-LD teklif açıklaması"),
    ]
    for desen, deger, ad in kurallar:
        metin, n = re.subn(desen, lambda m: m.group(1) + deger + m.group(2), metin, count=1)
        sonuc.append(("  + %-28s -> %s" % (ad, deger)) if n
                     else ("  ! ETIKET BULUNAMADI: %s" % ad))

    with open(yol, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(metin)
    return sonuc


def iletisim_oku():
    """js/iletisim.js icindeki telefon ve mesaj sablonlarini okur."""
    yol = os.path.join(JS_DIR, "iletisim.js")
    if not os.path.exists(yol):
        return None
    metin = open(yol, "r", encoding="utf-8").read()
    m_tel = re.search(r'telefon:\s*"([^"]+)"', metin)
    if not m_tel:
        return None
    # lisansMesaji iki parca halinde yazili: "...\n" + "..."
    m_lis = re.search(r'lisansMesaji:\s*(.+?),\n\n', metin, re.S)
    m_sif = re.search(r'sifreMesaji:\s*"([^"]+)"', metin)
    if not (m_lis and m_sif):
        return None

    def birlestir(ham):
        parcalar = re.findall(r'"((?:[^"\\]|\\.)*)"', ham)
        return "".join(x.replace('\\n', '\n').replace('\\"', '"') for x in parcalar)

    return {
        "telefon": m_tel.group(1),
        "lisans": birlestir(m_lis.group(1)),
        "sifre": m_sif.group(1),
    }


def whatsapp_senkronize():
    """Karsilama ve SEO sayfalarindaki wa.me baglantilarini js/iletisim.js
    ile ayni yapar.

    NEDEN (13.09.2026, kullanici bulgusu): lisans icin hazir WhatsApp mesaji
    IKI ayri yerde elle yaziliydi. Uygulama icindeki surum, formdaki okul
    bilgilerini mesaja gomuyordu; DEMO'da bu bilgiler SAHTE oldugu icin
    saticiya her demo kullanicidan "Kurum Kodu: 123457 / DEMO MESLEKI VE
    TEKNIK ANADOLU LISESI" gidiyordu. Tek kaynak js/iletisim.js'tir;
    uygulama sabiti dogrudan okur, HTML tarafi burada hizalanir.
    """
    v = iletisim_oku()
    if not v:
        return ["  ! js/iletisim.js okunamadi, wa.me baglantilari DEGISMEDI"]

    try:
        from urllib.parse import quote
    except ImportError:
        from urllib import quote

    # encodeURIComponent ile ayni kacis kumesi
    kacilmaz = "!'()*-._~"
    lisans_kodlu = quote(v["lisans"], safe=kacilmaz)
    sifre_kodlu = quote(v["sifre"], safe=kacilmaz)

    hedefler = ["index.html", "ders-yuku-hesaplama.html",
                "norm-kadro-hesaplama.html", "meslek-lisesi-norm-kadro.html"]
    sonuc = []
    for ad in hedefler:
        yol = os.path.join(BASE_DIR, ad)
        if not os.path.exists(yol):
            sonuc.append("  ! bulunamadi: %s" % ad)
            continue
        with open(yol, "r", encoding="utf-8") as fh:
            metin = fh.read()
        onceki = metin

        # Lisans baglantilari: metni "Merhaba,%20NormMatik%20lisans" ile baslayan
        metin = re.sub(
            r'https://wa\.me/\d+\?text=Merhaba(?:,|%2C)%20NormMatik%20lisans[^"\']*',
            "https://wa.me/" + v["telefon"] + "?text=" + lisans_kodlu, metin)
        # Sifre baglantilari
        metin = re.sub(
            r'https://wa\.me/\d+\?text=Merhaba(?:,|%2C)%20NormMatik%20giri[^"\']*',
            "https://wa.me/" + v["telefon"] + "?text=" + sifre_kodlu, metin)

        if metin != onceki:
            with open(yol, "w", encoding="utf-8", newline="\n") as fh:
                fh.write(metin)
            sonuc.append("  + %-30s hizalandi" % ad)
        else:
            sonuc.append("  = %-30s zaten ayni" % ad)
    return sonuc


def surum_oku():
    """js/surum.js icindeki degerleri okur. TEK KAYNAK oradadir."""
    yol = os.path.join(JS_DIR, "surum.js")
    if not os.path.exists(yol):
        return None
    metin = open(yol, "r", encoding="utf-8").read()
    m_s = re.search(r'surum:\s*"([^"]+)"', metin)
    m_t = re.search(r'yayinTarihi:\s*"([^"]+)"', metin)
    if not (m_s and m_t):
        return None
    m_d = re.search(r"degisiklikler:\s*\[(.*?)\n    \]", metin, re.S)
    liste = []
    if m_d:
        # Satir basina bir kayit; kacisli tirnaklari geri ac.
        for satir in m_d.group(1).split("\n"):
            satir = satir.strip().rstrip(",")
            if satir.startswith('"') and satir.endswith('"'):
                liste.append(satir[1:-1].replace('\\"', '"'))
    return {"surum": m_s.group(1), "tarih": m_t.group(1), "degisiklikler": liste}


def surum_json_yaz():
    """Depo kokundeki version.json'u js/surum.js'ten UZERINE YAZAR.

    NEDEN: surum numarasi iki yerde yaziliydi (version.json "2.0.1",
    normRulesConfig.js "2026.2.0") ve ikisi birbirini tutmuyordu. Iki ayri
    dogruluk kaynagi, birinin guncellenip digerinin unutulmasi demektir;
    hata vermez, sessizce celisir. Artik tek kaynak js/surum.js'tir ve
    version.json her pakette mekanik olarak ondan uretilir.
    """
    v = surum_oku()
    if not v:
        return ["  ! js/surum.js okunamadi, version.json DEGISMEDI"]

    yol = os.path.join(BASE_DIR, "version.json")
    try:
        with open(yol, "r", encoding="utf-8") as fh:
            veri = json.load(fh)
    except Exception:
        veri = {}

    veri["appName"] = veri.get("appName") or "NormMatik\u2122"
    veri["officialName"] = veri.get("officialName") or \
        "NormMatik \u2014 MEB Norm Kadro ve Ders Y\u00fck\u00fc Hesaplama Yaz\u0131l\u0131m\u0131"
    veri["version"] = v["surum"]
    veri["releaseDate"] = v["tarih"]
    veri["changelog"] = v["degisiklikler"]
    # minEngineVersion: ayni ANA surumun ilk yayini. Eskiden elle yazilirdi.
    veri["minEngineVersion"] = v["surum"].split(".")[0] + ".0.0"
    veri.pop("rulesVersion", None)   # mevzuat surumu ayri kavram; karistiriyordu

    with open(yol, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(veri, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    return ["  + version.json -> %s (%s), %d degisiklik kaydi"
            % (v["surum"], v["tarih"], len(v["degisiklikler"]))]


def surum_damgala():
    """
    app.html'deki ?v= etiketini ve sw.js'deki CACHE_NAME'i tazeler.

    NEDEN OTOMATIK: Uygulama bir PWA. Service worker eski bundle.js'i onbellege
    alir ve CACHE_NAME degismedikce ONU sunmaya devam eder. Iki etiket elle
    guncellendigi surece, unutuldugu her seferinde kullanici yeni surumu
    ALMAZ; islem "basarili" gorunur ama hicbir sey degismez. Sessiz basarisizlik
    oldugu icin fark edilmesi de zordur -- bu yuzden pakete baglandi.
    """
    damga = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    sonuc = []

    # CSS etiketi de tazelenmeli. 2026-08-24'e kadar tazelenmiyordu:
    # app.css'te yapılan bir değişiklik, sürüm etiketi aynı kaldığı için
    # tarayıcıda eski hâliyle kalabiliyordu. Sessiz bir hata sınıfıydı —
    # "stil neden değişmedi?" sorusunun cevabı buradaydı.
    YONETIM_HTML = os.path.join(BASE_DIR, "yonetim.html")
    INDEX_HTML = os.path.join(BASE_DIR, "index.html")
    # SEO icerik sayfalari. Bunlar da landing.css kullanir; damgalanmazlarsa
    # tasarim degistiginde ziyaretcinin onbelleginde eski stil kalir.
    ICERIK_SAYFALARI = [os.path.join(BASE_DIR, "ders-yuku-hesaplama.html"),
                       os.path.join(BASE_DIR, "norm-kadro-hesaplama.html"),
                       os.path.join(BASE_DIR, "meslek-lisesi-norm-kadro.html")]

    for yol, desen, yeni, ad in [
            (APP_HTML, r'(js/bundle\.js\?v=)[^"\']+', r'\g<1>' + damga,
             "app.html ?v="),
            (APP_HTML, r'(css/app\.css\?v=)[^"\']+', r'\g<1>' + damga,
             "app.html app.css ?v="),
            (YONETIM_HTML, r'(css/app\.css\?v=)[^"\']+', r'\g<1>' + damga,
             "yonetim.html app.css ?v="),
            # Karşılama sayfası 26.08.2026'da sıfırdan yazıldı. O güne kadar
            # landing.css HİÇ damgalanmıyordu: tasarım değişse bile daha önce
            # siteye girmiş biri ESKİ hâlini önbellekten görmeye devam ederdi.
            # Aynı sessiz hata sınıfı app.css'te 2026-08-24'te düzeltilmişti.
            (INDEX_HTML, r'(css/landing\.css\?v=)[^"\']+', r'\g<1>' + damga,
             "index.html landing.css ?v="),
            (SW_JS, r'(const CACHE_NAME\s*=\s*")[^"]+(")',
             r'\g<1>meb-normmatik-' + damga + r'\g<2>', "sw.js CACHE_NAME")] + [
            (p, r'(css/landing\.css\?v=)[^"\']+', r'\g<1>' + damga,
             os.path.basename(p) + " landing.css ?v=") for p in ICERIK_SAYFALARI]:
        if not os.path.exists(yol):
            sonuc.append("  ! BULUNAMADI: %s" % yol)
            continue
        with open(yol, "r", encoding="utf-8") as f:
            metin = f.read()
        yeni_metin, n = re.subn(desen, yeni, metin, count=1)
        if not n:
            # Sessizce gecmek tam da onlemek istedigimiz hatayi geri getirir.
            sonuc.append("  ! ETIKET BULUNAMADI, ELLE GUNCELLEYIN: %s" % ad)
            continue
        with open(yol, "w", encoding="utf-8") as f:
            f.write(yeni_metin)
        sonuc.append("  + %-22s -> %s" % (ad, damga))

    return damga, sonuc


def build_bundle():
    combined = []
    included = []
    missing = []

    for f_name in BUNDLE_FILES:
        f_path = os.path.join(JS_DIR, f_name)
        if not os.path.exists(f_path):
            missing.append(f_name)
            continue
        with open(f_path, "r", encoding="utf-8") as f:
            content = f.read()
        combined.append("\n// ==================== " + f_name + " ====================\n")
        combined.append(strip_module_syntax(content))
        included.append((f_name, os.path.getsize(f_path)))

    combined.append(EXPORTS_CODE)

    bundle_path = os.path.join(JS_DIR, "bundle.js")
    output = "\n".join(combined)
    # newline="\n" ZORUNLU: Windows'ta varsayılan davranış her satır sonunu
    # CRLF yapıyordu. Git commit'te LF'ye normalize ettiği için dosya bozulmuyordu
    # ama çalışma kopyası ile depodaki kopya BAYT BAYT farklı oluyordu; boyut
    # karşılaştıran herkes yanlış sonuca varıyordu (08.09.2026'da tam olarak bu
    # oldu: 292 satır silindiği hâlde dosya "168 KB büyümüş" göründü).
    with open(bundle_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(output)

    print("NormMatik paketleyici")
    print("=" * 62)
    for name, size in included:
        print("  + {:<34} {:>10,} bayt".format(name, size))
    if missing:
        print()
        for name in missing:
            print("  ! BULUNAMADI (atlandi): {}".format(name))
    print("=" * 62)
    print("  bundle.js  : {:,} bayt / {:,} satir".format(
        len(output.encode("utf-8")), output.count("\n") + 1))
    print("  konum      : {}".format(bundle_path))
    print()
    print("  EKRAN GORUNTULERI (onbellek tazeleme):")
    for satir in gorsel_damgala():
        print(satir)

    print()
    print("  WHATSAPP MESAJI (kaynak: js/iletisim.js):")
    for satir in whatsapp_senkronize():
        print(satir)

    print()
    print("  SURUM NUMARASI (kaynak: js/surum.js):")
    for satir in surum_json_yaz():
        print(satir)

    print()
    print("  LISANS FIYATI (kaynak: js/fiyat.js):")
    for satir in fiyat_senkronize():
        print(satir)

    print()
    print("  SURUM ETIKETLERI (onbellek tazeleme):")
    damga, satirlar = surum_damgala()
    for satir in satirlar:
        print(satir)
    return bundle_path


if __name__ == "__main__":
    if not os.path.isdir(JS_DIR):
        print("HATA: js klasoru bulunamadi: {}".format(JS_DIR))
        sys.exit(1)
    build_bundle()

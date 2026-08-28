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
    "licenseCore.js",
    "licenseClientManager.js",
    "normRulesConfig.js",        # normEngine.js'ten ÖNCE olmalı
    "liveUpdateSyncEngine.js",
    "strict_pdf_curriculum_db.js",
    "strict_elective_courses_db.js",
    "mesem_curriculum_db.js",    # database.js ve curriculumEngine.js'ten ÖNCE
    "ortaogretim_cizelgeleri.js", # curriculumEngine.js'ten ÖNCE (üretilmiş tablo)
    "secmeli_havuzu.js",         # uiComponents.js'ten ÖNCE (üretilmiş seçmeli havuzu)
    "ozel_egitim_cizelgeleri.js", # curriculumEngine.js'ten ÖNCE (üretilmiş çizelge)
    "ozel_program_temalari.js",  # curriculumEngine.js'ten ÖNCE (üretilmiş tema tablosu)
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
    if (typeof MebLicenseCore !== 'undefined') window.MebLicenseCore = MebLicenseCore;
    if (typeof MebLicenseClientManager !== 'undefined') window.MebLicenseClientManager = MebLicenseClientManager;
    if (typeof licenseManager === 'undefined' && typeof MebLicenseClientManager !== 'undefined') {
        window.licenseManager = new MebLicenseClientManager();
    }
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
    if (typeof OZEL_PROGRAM_TEMALARI !== 'undefined') window.OZEL_PROGRAM_TEMALARI = OZEL_PROGRAM_TEMALARI;
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
             r'\g<1>meb-normmatik-' + damga + r'\g<2>', "sw.js CACHE_NAME")]:
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
    with open(bundle_path, "w", encoding="utf-8") as f:
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

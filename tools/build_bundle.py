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

import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS_DIR = os.path.join(BASE_DIR, "js")

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
    "database.js",
    "curriculumEngine.js",
    "normEngine.js",
    "reportsEngine.js",
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
    if (typeof dbService !== 'undefined') window.dbService = dbService;
    if (typeof curriculumEngine !== 'undefined') window.curriculumEngine = curriculumEngine;
    if (typeof normEngine !== 'undefined') window.normEngine = normEngine;
    if (typeof MebReportsEngine !== 'undefined') window.MebReportsEngine = MebReportsEngine;
    if (typeof reportsEngine === 'undefined' && typeof MebReportsEngine !== 'undefined') {
        window.reportsEngine = new MebReportsEngine();
    }
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
    print("  SONRAKI ADIM: app.html icindeki  bundle.js?v=...  surum etiketini")
    print("                degistirin, aksi halde tarayici eski paketi onbellekten")
    print("                yukler ve degisiklikleri GORMEZSINIZ.")
    return bundle_path


if __name__ == "__main__":
    if not os.path.isdir(JS_DIR):
        print("HATA: js klasoru bulunamadi: {}".format(JS_DIR))
        sys.exit(1)
    build_bundle()

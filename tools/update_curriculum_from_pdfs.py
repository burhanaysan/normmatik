"""
================================================================================
MEB ÇÖP (ÇERÇEVE ÖĞRETİM PROGRAMLARI) OTOMATİK VERİTABANI VE DERLEME MOTORU
================================================================================
"""

import os
import sys
import json
import re
import subprocess
import pypdf

# UTF-8 Konsol Desteği
sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_BASE_DIR = os.path.join(os.path.dirname(BASE_DIR), "03_meb_mevzuat_ve_cizelgeler", "mtegm_mesleki_ve_teknik")
OUT_JS_PATH = os.path.join(BASE_DIR, "js", "strict_pdf_curriculum_db.js")
JS_DIR = os.path.join(BASE_DIR, "js")

def norm_tr(s):
    if not s: return ""
    return s.replace('Â','A').replace('â','a').replace('Î','I').replace('î','i').replace('İ','I').replace('ı','i').replace('Ğ','G').replace('ğ','g').replace('Ü','U').replace('ü','u').replace('Ş','S').replace('ş','s').replace('Ö','O').replace('ö','o').replace('Ç','C').replace('ç','c').upper().strip()

def clean_course_name(name):
    clean = re.sub(r'\s*\(\*+\)\s*', '', name).strip()
    clean = re.sub(r'[\d\-\.\(\)]+$', '', clean).strip()
    clean = re.sub(r'\s+', ' ', clean)
    return clean

COMMON_KEYWORDS = [
    "TÜRK DİLİ VE EDEBİYATI", "TÜRKÇE", "DİN KÜLTÜRÜ VE AHLAK BİLGİSİ", 
    "TARİH", "T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK", "COĞRAFYA", "MATEMATİK", 
    "FİZİK", "KİMYA", "BİYOLOJİ", "FELSEFE", "YABANCI DİL", "BİRİNCİ YABANCI DİL",
    "İKİNCİ YABANCI DİL", "BEDEN EĞİTİMİ VE SPOR", "GÖRSEL SANATLAR", "MÜZİK",
    "SAĞLIK BİLGİSİ VE TRAFİK KÜLTÜRÜ", "BEDEN EĞİTİMİ VE SPOR/GÖRSEL SANATLAR/MÜZİK"
]

def extract_hours(nums, grade_str):
    def clean(v):
        if not v: return 0
        v = v.replace('-', '').strip()
        return int(v) if v.isdigit() else 0
        
    if len(nums) >= 4:
        c_map = {"9": 0, "10": 1, "11": 2, "12": 3}
        return clean(nums[c_map[grade_str]])
    elif len(nums) == 3:
        # MEB 4 sütunlu tablosunda sağdaki son tire (12. sınıf) dizgici tarafından atlanmış:
        # [0]=9. Sınıf, [1]=10. Sınıf, [2]=11. Sınıf
        c_map = {"9": 0, "10": 1, "11": 2}
        if grade_str in c_map:
            return clean(nums[c_map[grade_str]])
        return 0
    elif len(nums) == 2:
        c_map = {"9": 0, "10": 1}
        if grade_str in c_map:
            return clean(nums[c_map[grade_str]])
        return 0
    elif len(nums) == 1:
        if grade_str == "9":
            return clean(nums[0])
        return 0
    return 0

def parse_exact_column_from_pdf(pdf_path, target_grade_str):
    try:
        reader = pypdf.PdfReader(pdf_path)
    except Exception as e:
        return []
        
    schedules = []
    
    for p_idx in range(len(reader.pages)):
        if p_idx < 5: continue
        txt = reader.pages[p_idx].extract_text()
        
        is_true_table = (
            "HAFTALIK DERS" in txt and 
            ("ÇİZELGE" in txt or "ZELGE" in txt or "CZELGE" in txt) and
            "İÇİNDEKİLER" not in txt.upper() and
            "ICINDEKILER" not in txt.upper() and
            ("TÜRK DİLİ" in txt or "ORTAK DERSLER" in txt or "DİN KÜLTÜRÜ" in txt)
        )
        if is_true_table:
            lines = [l.strip() for l in txt.split("\n") if l.strip()]
            
            title = ""
            for l in lines[:10]:
                if any(k in l for k in ["HAFTALIK DERS", "DALI", "PROGRAMI", "ALANI"]):
                    title += " " + l
            title = title.strip()
            
            courses = []
            i = 0
            while i < len(lines):
                line = lines[i]
                m = re.search(r'((?:[\d\-]+\s*){1,5})$', line.strip())
                if m:
                    nums_str = m.group(1).strip()
                    nums = [n for n in re.split(r'\s+', nums_str) if n]
                    course_tail = line.strip()[:m.start()].strip()
                    
                    prev_parts = []
                    j = i - 1
                    while j >= 0:
                        prev_line = lines[j]
                        prev_m = re.search(r'((?:[\d\-]+\s*){1,5})$', prev_line.strip())
                        if (prev_m or "SINIF" in prev_line or 
                            "KATEGORİ" in prev_line or "DERSLER" in prev_line or 
                            "HAFTALIK" in prev_line or "TOPLAM" in prev_line or
                            "ÇERÇEVE" in prev_line):
                            break
                        prev_parts.insert(0, prev_line)
                        j -= 1
                    
                    full_name = " ".join(prev_parts + [course_tail]).strip()
                    hours = extract_hours(nums, target_grade_str)
                    
                    clean_name = clean_course_name(full_name)
                    norm = norm_tr(clean_name)
                    
                    category = "ALAN VE DAL MESLEK DERSLERİ"
                    if any(norm_tr(k) in norm for k in COMMON_KEYWORDS):
                        category = "ORTAK DERSLER"
                    elif "REHBERLİK" in norm:
                        category = "REHBERLİK"
                    elif "SEÇMELİ" in norm:
                        category = "SEÇMELİ DERSLER"
                    
                    is_header_or_total = (
                        not clean_name or hours == 0 or 
                        "SINIF" in norm or "KATEGORI" in norm or 
                        "DERSLER" in norm or norm == "TOPLAM" or 
                        "TOPLAMI" in norm or "NOT:" in norm or
                        "AKADEMIK DESTEK DERS SAATI" in norm or
                        "MESLEK DERS SAATI" in norm or
                        "SECMELI DERS SAATI" in norm or
                        "SECMELI MESLEK DERS" in norm or
                        "CERCEVE OGRETIM" in norm or
                        "CERCEVE" in norm or
                        "DERS CIZELGESI" in norm or
                        "HAFTALIK DERS" in norm or
                        norm.endswith(" ALANI") or
                        norm.endswith(" DALI")
                    )
                    
                    if not is_header_or_total:
                        courses.append({
                            "ders": clean_name,
                            "saat": hours,
                            "kategori": category,
                            "baraj_ders": "(*)" in full_name
                        })
                i += 1
            
            if len(courses) >= 3:
                schedules.append({
                    "page": p_idx + 1,
                    "title": title,
                    "grade": target_grade_str,
                    "courses": courses
                })
    return schedules

def get_base_key(filename):
    base = filename.replace('.pdf', '')
    for s in ['_9', '_10', '_11', '_12']:
        if base.endswith(s):
            base = base[:-len(s)]
            break
    return base

ALIAS_NORM = {
    "otomotiv": "motorluarac",
    "basim": "matbaa",
    "sh": "aile",
    "tuketici": "aile",
    "endkalite": "endustriyel_kalite_kontrol",
    "dogugastro": "yiyecek",
    "marmaragastro": "yiyecek",
    "yapayzeka": "bilisim"
}

def build_bundle():
    files = [
        "licenseCore.js",
        "licenseClientManager.js",
        "normRulesConfig.js",
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
        "app.js"
    ]
    combined = []
    for f_name in files:
        f_path = os.path.join(JS_DIR, f_name)
        if not os.path.exists(f_path):
            continue
        with open(f_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = []
            for line in content.splitlines():
                if line.startswith("import ") or line.startswith("export {"):
                    continue
                line = line.replace("export class ", "class ")
                line = line.replace("export const ", "const ")
                line = line.replace("export function ", "function ")
                line = line.replace("export default ", "")
                lines.append(line)
            combined.append("\n// ==================== " + f_name + " ====================\n")
            combined.append("\n".join(lines))
            
    exports_code = """
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
    combined.append(exports_code)
    bundle_path = os.path.join(JS_DIR, "bundle.js")
    with open(bundle_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(combined))
    print(f"Created bundle.js: {bundle_path} successfully!")

def build_all():
    print(">> [1/3] PDF Dosyaları Taranıyor ve Ayrıştırılıyor...")
    strict_mtegm_db = {}

    for grade_str in ["9", "10", "11", "12"]:
        folder = os.path.join(PDF_BASE_DIR, f"sinif_{grade_str}")
        if not os.path.exists(folder): continue
        
        for f in sorted(os.listdir(folder)):
            if f.endswith('.pdf'):
                area_raw = get_base_key(f)
                canonical_area = ALIAS_NORM.get(area_raw, area_raw)
                
                if canonical_area not in strict_mtegm_db:
                    strict_mtegm_db[canonical_area] = {"9": [], "10": [], "11": [], "12": []}
                
                if area_raw not in strict_mtegm_db:
                    strict_mtegm_db[area_raw] = {"9": [], "10": [], "11": [], "12": []}
                
                pdf_path = os.path.join(folder, f)
                schedules = parse_exact_column_from_pdf(pdf_path, grade_str)
                strict_mtegm_db[canonical_area][grade_str].extend(schedules)
                if canonical_area != area_raw:
                    strict_mtegm_db[area_raw][grade_str].extend(schedules)

    # Alias köprülemeleri
    for alias, canonical in ALIAS_NORM.items():
        if canonical in strict_mtegm_db and alias in strict_mtegm_db:
            for g in ["9", "10", "11", "12"]:
                if len(strict_mtegm_db[alias][g]) == 0 and len(strict_mtegm_db[canonical][g]) > 0:
                    strict_mtegm_db[alias][g] = strict_mtegm_db[canonical][g]
                if len(strict_mtegm_db[canonical][g]) == 0 and len(strict_mtegm_db[alias][g]) > 0:
                    strict_mtegm_db[canonical][g] = strict_mtegm_db[alias][g]

    # Kalite kontrol mapping
    if "makine" in strict_mtegm_db:
        for g in ["11", "12"]:
            if "endkalite" in strict_mtegm_db and len(strict_mtegm_db["endkalite"][g]) == 0:
                strict_mtegm_db["endkalite"][g] = strict_mtegm_db["makine"][g]
            if "endustriyel_kalite_kontrol" in strict_mtegm_db and len(strict_mtegm_db["endustriyel_kalite_kontrol"][g]) == 0:
                strict_mtegm_db["endustriyel_kalite_kontrol"][g] = strict_mtegm_db["makine"][g]

    print(f">> [2/3] Veritabanı Yazılıyor: {OUT_JS_PATH}")
    with open(OUT_JS_PATH, "w", encoding="utf-8") as f:
        f.write("export const STRICT_PDF_CURRICULUM_DB = " + json.dumps(strict_mtegm_db, indent=2, ensure_ascii=False) + ";\n")

    print(f">> [3/3] Uygulama Paketleniyor (bundle.js)...")
    build_bundle()

    print("\n[BAŞARILI] Müfredat veritabanı başarıyla üretildi ve paketlendi!")

if __name__ == "__main__":
    # ------------------------------------------------------------------
    # !!! KULLANIMDAN KALDIRILDI - 2026-08-22 !!!
    # ------------------------------------------------------------------
    # Bu script js/strict_pdf_curriculum_db.js dosyasinin UZERINE YAZAR ve
    # boylece 2026-08-22'de yapilan duzeltmeleri GERI ALIR. Bilinen hatalari:
    #
    #   1) Sutun kaymasi: 12. sinifta AMP/ATP sutunlari birlestiriliyor;
    #      ATP subelerine, o programda HIC OLMAYAN 24 saat "Isletmelerde
    #      Mesleki Egitim" yaziliyor -> atolye normu ~2 kat sisiyor.
    #   2) Baslikta hem "ANADOLU MESLEK PROGRAMI" hem "ANADOLU TEKNIK
    #      PROGRAMI" gecen kayit uretiyor -> curriculumEngine.js:752'deki
    #      AMP/ATP filtresi sessizce devre disi kaliyor.
    #   3) BASKA ALANIN mufredatini kopyaliyor (bu dosyada, yukarida):
    #         strict_mtegm_db["endkalite"][g] = strict_mtegm_db["makine"][g]
    #      Endustriyel Kalite Kontrol ogrencisine Makine dersleri gosteriliyor.
    #   4) REHBERLIK VE YONLENDIRME satirini MESLEK kategorisine yaziyor ->
    #      rehberlik saati Madde 19 atolye yukune ekleniyor.
    #
    # YERINE: tools/rebuild_curriculum_db.py
    #   Kaynak    : data/kaynak_cizelgeler/mtegm/sinif_{9,10,11,12}.json
    #   Dogrulama : node tools/test_curriculumData.mjs
    # ------------------------------------------------------------------
    if "--gercekten-eski-uretici" not in sys.argv:
        print("=" * 70)
        print("DURDURULDU: Bu uretici KULLANIMDAN KALDIRILDI.")
        print("=" * 70)
        print("Calissaydi js/strict_pdf_curriculum_db.js uzerine yazacak ve")
        print("2026-08-22 duzeltmelerini geri alacakti (AMP/ATP sutun kaymasi,")
        print("alanlar arasi mufredat bulasmasi, rehberligin atolye yukune")
        print("yazilmasi).")
        print("")
        print("BUNUN YERINE:")
        print("    python tools/rebuild_curriculum_db.py")
        print("    node   tools/test_curriculumData.mjs")
        print("    python tools/build_bundle.py")
        print("")
        print("Ayrinti icin bu dosyanin en altindaki yorum blokuna bakin.")
        print("=" * 70)
        sys.exit(1)

    print("UYARI: Kullanimdan kaldirilmis uretici ACIKCA calistiriliyor.")
    build_all()

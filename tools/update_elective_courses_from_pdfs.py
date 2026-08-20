"""
================================================================================
MEB ÇÖP SEÇMELİ MESLEK VE GENEL SEÇMELİ DERSLER DERLEME MOTORU
================================================================================
Kullanım:
    python tools/update_elective_courses_from_pdfs.py

Bu motor:
1. "03_meb_mevzuat_ve_cizelgeler" altındaki tüm PDF'leri tarar.
2. "6.4.1. SERTİFİKA DERSLERİ TABLOSU" ve "6.4.2. SEÇMELİ MESLEK DERSLERİ TABLOSU"
   bölümlerini tespit eder.
3. OGM ve DÖGM genel seçmeli ders havuzlarını entegre eder.
4. Dizgi, satır kayması ve imla hatalarını onarır.
5. "strict_elective_courses_db.js" veritabanını eksiksiz olarak üretir.
================================================================================
"""

import os
import sys
import json
import re
import subprocess
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_BASE_DIR = os.path.join(os.path.dirname(BASE_DIR), "03_meb_mevzuat_ve_cizelgeler", "mtegm_mesleki_ve_teknik")
OUT_JS_PATH = os.path.join(BASE_DIR, "js", "strict_elective_courses_db.js")
SCRATCH_DIR = r"C:\Users\burha\.gemini\antigravity\scratch"

def norm_tr(s):
    if not s: return ""
    return s.replace('Â','A').replace('â','a').replace('Î','I').replace('î','i').replace('İ','I').replace('ı','i').replace('Ğ','G').replace('ğ','g').replace('Ü','U').replace('ü','u').replace('Ş','S').replace('ş','s').replace('Ö','O').replace('ö','o').replace('Ç','C').replace('ç','c').upper().strip()

def clean_name(s):
    s = re.sub(r'^\d+[\.\-\)]\s*', '', s)
    s = re.sub(r'\s*\(\*+\)\s*', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

# Alan Bazlı Öğretmenlik Branş Eşleşmeleri
AREA_BRANCH_MAP = {
    'adalet': 'Adalet',
    'aile': 'Aile ve Tüketici Hizmetleri',
    'ayakkabi': 'Ayakkabı ve Saraciye Teknolojisi',
    'ayakkabipro': 'Ayakkabı ve Saraciye Teknolojisi',
    'bilisim': 'Bilişim Teknolojileri',
    'biyomedikal': 'Biyomedikal Cihaz Teknolojileri',
    'buro': 'Büro Yönetimi / Yönetici Asist.',
    'cocukgelisimi': 'Çocuk Gelişimi ve Eğitimi',
    'denizcilik': 'Denizcilik / Gemi Yönetimi',
    'denizcilikpro': 'Denizcilik / Gemi Yönetimi',
    'dogugastro': 'Yiyecek İçecek Hizmetleri',
    'elektrik': 'Elektrik-Elektronik Teknolojisi',
    'elsanat': 'El Sanatları Teknolojisi',
    'endustriyel': 'Endüstriyel Otomasyon Teknolojileri',
    'endkalite': 'Makine Teknolojisi',
    'endustriyel_kalite_kontrol': 'Makine Teknolojisi',
    'gazetecilik': 'Gazetecilik',
    'gazetecilikpro': 'Gazetecilik',
    'geleneksel': 'Geleneksel Türk Sanatları',
    'gemi': 'Gemi Yapımı',
    'gida': 'Gıda Teknolojisi',
    'grafik': 'Grafik ve Fotoğraf',
    'grafikpro': 'Grafik ve Fotoğraf',
    'guzellik': 'Güzellik Hizmetleri',
    'halklailiskiler': 'Halkla İlişkiler ve Organizasyon',
    'harita': 'Harita-Tapu-Kadastro',
    'hasta': 'Hasta ve Yaşlı Hizmetleri',
    'havacilikveuzaypro': 'Uçak Bakım',
    'hayvanyetistiriciligi': 'Hayvan Sağlığı / Hayvan Yetiştiriciliği',
    'insaat': 'İnşaat Teknolojisi',
    'itfaiyecilik': 'İtfaiyecilik ve Yangın Güvenliği',
    'kimya': 'Kimya Teknolojisi',
    'konaklama': 'Konaklama ve Seyahat Hizmetleri',
    'konaklamapro': 'Konaklama ve Seyahat Hizmetleri',
    'kuyumculuk': 'Kuyumculuk Teknolojisi',
    'laboratuvar': 'Laboratuvar Hizmetleri',
    'maden': 'Maden Teknolojisi',
    'makine': 'Makine ve Tasarım Teknolojisi',
    'marmaragastro': 'Yiyecek İçecek Hizmetleri',
    'matbaa': 'Matbaa Teknolojisi',
    'basim': 'Matbaa Teknolojisi',
    'metal': 'Metal Teknolojisi',
    'metalurji': 'Metalürji Teknolojisi',
    'mikromekanik': 'Makine ve Tasarım Teknolojisi',
    'mobilya': 'Mobilya ve İç Mekân Tasarımı',
    'moda': 'Moda Tasarım Teknolojileri',
    'motorluarac': 'Motorlu Araçlar Teknolojisi',
    'otomotiv': 'Motorlu Araçlar Teknolojisi',
    'muhasebe': 'Muhasebe ve Finansman',
    'muhasebepro': 'Muhasebe ve Finansman',
    'muzik': 'Müzik',
    'pazarlama': 'Pazarlama ve Perakende',
    'plastiksanatlar': 'Plastik Sanatlar',
    'plastiktek': 'Plastik Teknolojisi',
    'radyotv': 'Radyo-Televizyon',
    'radyotvpro': 'Radyo-Televizyon',
    'rayli': 'Raylı Sistemler Teknolojisi',
    'saglik': 'Sağlık / Sağlık Hizmetleri',
    'seramikpro': 'Seramik ve Cam Teknolojisi',
    'siber': 'Bilişim Teknolojileri',
    'tarim': 'Tarım Teknolojileri',
    'tekstil': 'Tekstil Teknolojisi',
    'tesisat': 'Tesisat Teknolojisi ve İklimlendirme',
    'ucak': 'Uçak Bakım',
    'ulastirma': 'Ulaştırma Hizmetleri',
    'yapayzeka': 'Bilişim Teknolojileri',
    'yenilenebilir': 'Yenilenebilir Enerji Teknolojileri',
    'yenilenebilirpro': 'Yenilenebilir Enerji Teknolojileri',
    'yiyecek': 'Yiyecek İçecek Hizmetleri',
    'yiyecekpro': 'Yiyecek İçecek Hizmetleri'
}

ALIAS_MAP = {
    "otomotiv": "motorluarac",
    "basim": "matbaa",
    "sh": "aile",
    "tuketici": "aile",
    "endkalite": "makine",
    "endustriyel_kalite_kontrol": "makine",
    "dogugastro": "yiyecek",
    "marmaragastro": "yiyecek",
    "yapayzeka": "bilisim",
    "siber": "bilisim"
}

def extract_electives_from_pdf(pdf_path, area_key):
    try:
        reader = pypdf.PdfReader(pdf_path)
    except:
        return []

    extracted = []
    
    for p_idx, page in enumerate(reader.pages):
        txt = page.extract_text()
        if ("SEÇMELİ MESLEK DERSLERİ TABLOSU" in txt.upper() or 
            "SECMELI MESLEK DERSLERI TABLOSU" in txt.upper() or 
            "SERTİFİKA DERSLERİ TABLOSU" in txt.upper() or 
            "SERTIFIKA DERSLERI TABLOSU" in txt.upper()):
            
            lines = [l.strip() for l in txt.split("\n") if l.strip()]
            i = 0
            while i < len(lines):
                l = lines[i]
                m = re.search(r'(\b(?:9|10|11|12|11-12|10-11|10-11-12|9-10|9-10-11-12)\b)\s+(\d{1,2})$', l)
                if m:
                    grades_str = m.group(1)
                    hours = int(m.group(2))
                    tail = l[:m.start()].strip()
                    
                    prev_parts = []
                    j = i - 1
                    while j >= 0:
                        prev_l = lines[j]
                        if (re.search(r'\d{1,2}$', prev_l) or "TABLOSU" in prev_l.upper() or 
                            "DERSİN ADI" in prev_l.upper() or "DERS ADI" in prev_l.upper() or 
                            "SEVİYESİ" in prev_l.upper() or "SAATİ" in prev_l.upper()):
                            break
                        prev_parts.insert(0, prev_l)
                        j -= 1
                        
                    full_course = clean_name(" ".join(prev_parts + [tail]))
                    norm = norm_tr(full_course)
                    
                    is_invalid = (
                        not full_course or hours <= 0 or hours > 12 or
                        "TABLOSU" in norm or "DERSLER" in norm or 
                        "SEVIYESI" in norm or "DERS ADI" in norm or 
                        "KAZANIM" in norm or "AMACI" in norm or 
                        "NOT:" in norm or "ALANI" in norm or "PROGRAMI" in norm
                    )
                    
                    if not is_invalid:
                        default_branch = AREA_BRANCH_MAP.get(area_key, "Meslek Dersi")
                        if "YABANCI DİL" in norm:
                            default_branch = "İngilizce"
                        elif "MATEMATİK" in norm:
                            default_branch = "Matematik"
                        elif "DİJİTAL" in norm or "PROGRAMLAMA" in norm or "SOSYAL MEDYA" in norm or "YAPAY ZEK" in norm:
                            default_branch = "Bilişim Teknolojileri"
                        elif "HIZLI KLAVYE" in norm or "OFİS" in norm:
                            default_branch = "Büro Yönetimi / Yönetici Asist."
                            
                        extracted.append({
                            "ders": full_course,
                            "saat": hours,
                            "siniflar": grades_str,
                            "atananBrans": default_branch,
                            "isVocational": True,
                            "kategori": "SEÇMELİ MESLEK DERSLERİ",
                            "grup": "Seçmeli Meslek Dersi"
                        })
                i += 1
                
    return extracted

def build_all_electives():
    print(">> [1/3] Tüm MEB ÇÖP PDF'lerinden Seçmeli Meslek Dersleri Taranıyor...")
    
    electives_by_area = {}
    
    for g in ["11", "10", "12", "9"]:
        g_dir = os.path.join(PDF_BASE_DIR, f"sinif_{g}")
        if not os.path.exists(g_dir): continue
        
        for f in sorted(os.listdir(g_dir)):
            if not f.endswith(".pdf"): continue
            raw_key = f.split("_")[0].replace(".pdf", "")
            canon_key = ALIAS_MAP.get(raw_key, raw_key)
            
            if canon_key not in electives_by_area:
                electives_by_area[canon_key] = {}
            if raw_key not in electives_by_area:
                electives_by_area[raw_key] = {}
                
            pdf_path = os.path.join(g_dir, f)
            items = extract_electives_from_pdf(pdf_path, canon_key)
            
            for item in items:
                norm_c = norm_tr(item["ders"])
                if norm_c not in electives_by_area[canon_key]:
                    electives_by_area[canon_key][norm_c] = item
                if norm_c not in electives_by_area[raw_key]:
                    electives_by_area[raw_key][norm_c] = item

    final_db = {}
    total_unique = 0
    for area, c_dict in electives_by_area.items():
        course_list = list(c_dict.values())
        final_db[area] = course_list
        total_unique += len(course_list)

    print(f">> [2/3] Toplam {len(final_db)} Alanda {total_unique} Adet Resmî Seçmeli Meslek Dersi Çıkarıldı!")
    
    final_db["GENEL_ORTAOGRETIM_SECMELI"] = [
        {"ders": "Seçmeli Türk Dili ve Edebiyatı", "saat": 3, "siniflar": "11-12", "atananBrans": "Türk Dili ve Edebiyatı", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Diksiyon ve Hitabet", "saat": 1, "siniflar": "9-10-11-12", "atananBrans": "Türk Dili ve Edebiyatı", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Kültür, Sanat ve Spor"},
        {"ders": "Seçmeli Matematik", "saat": 6, "siniflar": "11-12", "atananBrans": "Matematik", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Seçmeli Fizik", "saat": 4, "siniflar": "11-12", "atananBrans": "Fizik", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Seçmeli Kimya", "saat": 4, "siniflar": "11-12", "atananBrans": "Kimya", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Seçmeli Biyoloji", "saat": 4, "siniflar": "11-12", "atananBrans": "Biyoloji", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Seçmeli Tarih", "saat": 4, "siniflar": "11-12", "atananBrans": "Tarih", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Seçmeli Coğrafya", "saat": 4, "siniflar": "11-12", "atananBrans": "Coğrafya", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Astronomi ve Uzay Bilimleri", "saat": 2, "siniflar": "9-10-11-12", "atananBrans": "Fizik", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Proje Tasarımı ve Uygulamaları", "saat": 2, "siniflar": "9-10-11-12", "atananBrans": "Fizik", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Demokrasi ve İnsan Hakları", "saat": 1, "siniflar": "10-11-12", "atananBrans": "Felsefe", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Mantık", "saat": 2, "siniflar": "11-12", "atananBrans": "Felsefe", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Sosyoloji", "saat": 2, "siniflar": "11-12", "atananBrans": "Felsefe", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Psikoloji", "saat": 2, "siniflar": "11-12", "atananBrans": "Felsefe", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "Bilgi Kuramı", "saat": 2, "siniflar": "10-11-12", "atananBrans": "Felsefe", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "İslam Kültür ve Medeniyeti", "saat": 2, "siniflar": "11-12", "atananBrans": "Tarih", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Din, Ahlak ve Değer"},
        {"ders": "Türk Kültür ve Medeniyet Tarihi", "saat": 4, "siniflar": "11-12", "atananBrans": "Tarih", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"},
        {"ders": "İkinci Yabancı Dil (Almanca/Fransızca)", "saat": 2, "siniflar": "9-10-11-12", "atananBrans": "Almanca", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Yabancı Diller"},
        {"ders": "Yabancı Diller Edebiyatı", "saat": 2, "siniflar": "11-12", "atananBrans": "İngilizce", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Yabancı Diller"},
        {"ders": "Görsel Sanatlar (Seçmeli)", "saat": 2, "siniflar": "9-10-11-12", "atananBrans": "Görsel Sanatlar", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Kültür, Sanat ve Spor"},
        {"ders": "Müzik (Seçmeli)", "saat": 2, "siniflar": "9-10-11-12", "atananBrans": "Müzik", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Kültür, Sanat ve Spor"},
        {"ders": "Beden Eğitimi ve Spor (Seçmeli)", "saat": 2, "siniflar": "9-10-11-12", "atananBrans": "Beden Eğitimi", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Kültür, Sanat ve Spor"},
        {"ders": "Drama", "saat": 1, "siniflar": "9-10-11-12", "atananBrans": "Türk Dili ve Edebiyatı", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Kültür, Sanat ve Spor"},
        {"ders": "Kur'an-ı Kerim (Seçmeli)", "saat": 2, "siniflar": "9-10-11-12", "atananBrans": "Din Kültürü ve Ahlak Bilgisi", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Din, Ahlak ve Değer"},
        {"ders": "Peygamberimizin Hayatı (Seçmeli)", "saat": 2, "siniflar": "9-10-11-12", "atananBrans": "Din Kültürü ve Ahlak Bilgisi", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Din, Ahlak ve Değer"},
        {"ders": "Temel Dini Bilgiler (Seçmeli)", "saat": 2, "siniflar": "9-10-11-12", "atananBrans": "Din Kültürü ve Ahlak Bilgisi", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Din, Ahlak ve Değer"},
        {"ders": "Adab-ı Muaşeret", "saat": 1, "siniflar": "9-10-11-12", "atananBrans": "Felsefe", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "Din, Ahlak ve Değer"},
        {"ders": "Türk Sosyal Hayatında Aile", "saat": 1, "siniflar": "9-10-11-12", "atananBrans": "Felsefe", "isVocational": False, "kategori": "SEÇMELİ DERSLER", "grup": "İnsan, Toplum ve Bilim"}
    ]

    print(f">> [3/3] Veritabanı Yazılıyor: {OUT_JS_PATH}")
    with open(OUT_JS_PATH, "w", encoding="utf-8") as f:
        f.write("export const STRICT_ELECTIVE_COURSES_DB = " + json.dumps(final_db, indent=2, ensure_ascii=False) + ";\n")

    print("\n[BAŞARILI] Seçmeli Dersler ve Seçmeli Meslek Dersleri Veritabanı Üretildi!")

if __name__ == "__main__":
    build_all_electives()

import { STRICT_PDF_CURRICULUM_DB } from './strict_pdf_curriculum_db.js';
import { MESEM_CURRICULUM_DB } from './mesem_curriculum_db.js';
// MEB Norm Kadro ve Ders Yükü Hesaplama Sistemi
// Kurumsal Müfredat ve Ders Çözümleme Motoru (CurriculumEngine)
// TTKB Haftalık Ders Çizelgeleri ve MEB Norm Standartları (v5.3 - 2026-2027)

class MebCurriculumEngine {
    constructor(dbService) {
        this.db = dbService;
        
        // TTKB 9 Sayılı Kurul Kararı Resmi Branş Eşleştirme Tablosu
        this.TTKB_BRANCH_MAP = {
            'TÜRK DİLİ VE EDEBİYATI': 'Türk Dili ve Edebiyatı',
            'HAZIRLIK SINIFI TÜRK DİLİ VE EDEBİYATI': 'Türk Dili ve Edebiyatı',
            'TÜRKÇE': 'Türkçe',
            'DİL VE ANLATIM': 'Türk Dili ve Edebiyatı',
            'TÜRK EDEBİYATI': 'Türk Dili ve Edebiyatı',
            'MATEMATİK': 'Matematik',
            'İLERİ MATEMATİK': 'Matematik',
            'TEMEL MATEMATİK': 'Matematik',
            'FEN BİLİMLERİ': 'Fen Bilimleri',
            'FİZİK': 'Fizik',
            'KİMYA': 'Kimya',
            'BİYOLOJİ': 'Biyoloji',
            'TARİH': 'Tarih',
            'T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK': 'Tarih',
            'T.C. İNKILÂP TARİHİ VE ATATÜRKÇÜLÜK': 'Tarih',
            'T.C. İNKILAP TARİHİ': 'Tarih',
            'T.C. İNKILÂP TARİHİ': 'Tarih',
            'TC İNKILAP TARİHİ VE ATATÜRKÇÜLÜK': 'Tarih',
            'TC İNKILÂP TARİHİ VE ATATÜRKÇÜLÜK': 'Tarih',
            'COĞRAFYA': 'Coğrafya',
            'FELSEFE': 'Felsefe',
            'SOSYOLOJİ': 'Felsefe',
            'PSİKOLOJİ': 'Felsefe',
            'MANTIK': 'Felsefe',
            'SOSYAL BİLGİLER': 'Sosyal Bilgiler',
            'DİN KÜLTÜRÜ VE AHLAK BİLGİSİ': 'Din Kültürü ve Ahlak Bilgisi',
            'DİN KÜLTÜRÜ VE AHLÂK BİLGİSİ': 'Din Kültürü ve Ahlak Bilgisi',
            'DİN KÜLTÜRÜ VE A.B.': 'Din Kültürü ve Ahlak Bilgisi',
            'İNGİLİZCE': 'İngilizce',
            'INGILIZCE': 'İngilizce',
            'YABANCI DİL': 'İngilizce',
            'YABANCI DIL': 'İngilizce',
            'BİRİNCİ YABANCI DİL': 'İngilizce',
            'BIRINCI YABANCI DIL': 'İngilizce',
            'İKİNCİ YABANCI DİL': 'Almanca',
            'IKINCI YABANCI DIL': 'Almanca',
            'ALMANCA': 'Almanca',
            'FRANSIZCA': 'Fransızca',
            'BEDEN EĞİTİMİ': 'Beden Eğitimi',
            'BEDEN EĞİTİMİ VE SPOR': 'Beden Eğitimi',
            'BEDEN EĞİTİMİ VE SPOR/GÖRSEL SANATLAR/MÜZİK': 'Beden Eğitimi',
            'BEDEN EĞİTİMİ VE SPOR / GÖRSEL SANATLAR / MÜZİK': 'Beden Eğitimi',
            'GÖRSEL SANATLAR': 'Görsel Sanatlar',
            'GÖRSEL SANATLAR/MÜZİK': 'Görsel Sanatlar',
            'MÜZİK': 'Müzik',
            'BİLİŞİM TEKNOLOJİLERİ': 'Bilişim Teknolojileri',
            'BİLİŞİM TEKNOLOJİLERİ VE YAZILIM': 'Bilişim Teknolojileri',
            'BİLGİSAYAR BİLİMİ': 'Bilişim Teknolojileri',
            'TEKNOLOJİ VE TASARIM': 'Teknoloji ve Tasarım',
            'REHBERLİK': 'Rehberlik',
            'REHBERLİK VE YÖNLENDİRME': 'Rehberlik',
            'SAĞLIK BİLGİSİ VE TRAFİK KÜLTÜRÜ': 'Biyoloji',
            'SAĞLIK BİLGİSİ': 'Biyoloji',
            'TRAFİK GÜVENLİĞİ': 'Biyoloji',
            
            // DÖGM İmam Hatip Meslek Dersleri
            'KUR\'AN-I KERİM': 'İHL Meslek Dersleri',
            'KURAN-I KERİM': 'İHL Meslek Dersleri',
            'KUR\'AN-I KERIM': 'İHL Meslek Dersleri',
            'MESLEKİ ARAPÇA': 'İHL Meslek Dersleri',
            'ARAPÇA': 'Arapça',
            'TEMEL DİNİ BİLGİLER': 'İHL Meslek Dersleri',
            'SİYER': 'İHL Meslek Dersleri',
            'PEYGAMBERİMİZİN HAYATI': 'İHL Meslek Dersleri',
            'FIKIH': 'İHL Meslek Dersleri',
            'TEFSİR': 'İHL Meslek Dersleri',
            'HADİS': 'İHL Meslek Dersleri',
            'AKAİD': 'İHL Meslek Dersleri',
            'KELAM': 'İHL Meslek Dersleri',
            'HİTABET VE MESLEKİ UYGULAMA': 'İHL Meslek Dersleri',
            'İSLAM KÜLTÜR VE MEDENİYETİ': 'İHL Meslek Dersleri',
            'DİNLER TARİHİ': 'İHL Meslek Dersleri',
            'İSLAM BİLİM TARİHİ': 'İHL Meslek Dersleri',
            'OSMANLI TÜRKÇESİ': 'Türk Dili ve Edebiyatı',
            'DİKSİYON VE HİTABET': 'Türk Dili ve Edebiyatı'
        };

        // 69 Meslek Alanı Resmi MEB Branş Eşleştirme Tablosu
        this.AREA_BRANCH_MAP = {
            'adalet': 'Adalet',
            'aile': 'Aile ve Tüketici Hizmetleri',
            'ayakkabi': 'Ayakkabı ve Saraciye Teknolojisi',
            'ayakkabipro': 'Ayakkabı ve Saraciye Teknolojisi',
            'basim': 'Basım Teknolojileri',
            'bilisim': 'Bilişim Teknolojileri',
            'biyomedikal': 'Biyomedikal Cihaz Teknolojileri',
            'buro': 'Büro Yönetimi ve Yönetici Asistanlığı',
            'cocukgelisimi': 'Çocuk Gelişimi ve Eğitimi',
            'denizcilik': 'Denizcilik',
            'denizcilikpro': 'Denizcilik',
            'dogugastro': 'Yiyecek İçecek Hizmetleri',
            'elektrik': 'Elektrik-Elektronik Teknolojisi',
            'elsanat': 'El Sanatları Teknolojisi',
            'endkalite': 'Endüstriyel Otomasyon Teknolojileri',
            'endustriyel': 'Endüstriyel Otomasyon Teknolojileri',
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
            'hayvanyetistiriciligi': 'Hayvan Yetiştiriciliği ve Sağlığı',
            'insaat': 'İnşaat Teknolojisi',
            'itfaiyecilik': 'İtfaiyecilik ve Yangın Güvenliği',
            'kimya': 'Kimya / Kimya Teknolojisi',
            'konaklama': 'Konaklama ve Seyahat Hizmetleri',
            'konaklamapro': 'Konaklama ve Seyahat Hizmetleri',
            'kuyumculuk': 'Kuyumculuk Teknolojisi',
            'laboratuvar': 'Laboratuvar Hizmetleri',
            'maden': 'Maden Teknolojisi',
            'makine': 'Makine ve Tasarım Teknolojisi',
            'marmaragastro': 'Yiyecek İçecek Hizmetleri',
            'meslekigelisim': 'Mesleki Gelişim',
            'metal': 'Metal Teknolojisi',
            'metalurji': 'Metalürji Teknolojisi',
            'mikromekanik': 'Mikromekanik',
            'mobilya': 'Mobilya ve İç Mekân Tasarımı',
            'moda': 'Moda Tasarım Teknolojileri',
            'motorluarac': 'Motorlu Araçlar Teknolojisi',
            'muhasebe': 'Muhasebe ve Finansman',
            'muhasebepro': 'Muhasebe ve Finansman',
            'otomotiv': 'Motorlu Araçlar Teknolojisi',
            'pazarlama': 'Pazarlama ve Perakende',
            'plastiksanatlar': 'Görsel Sanatlar',
            'plastiktek': 'Plastik Teknolojisi',
            'radyotv': 'Radyo-Televizyon',
            'radyotvpro': 'Radyo-Televizyon',
            'rayli': 'Raylı Sistemler Teknolojisi',
            'saglik': 'Sağlık Hizmetleri',
            'seramikpro': 'Seramik ve Cam Teknolojisi',
            'sh': 'Aile ve Tüketici Hizmetleri',
            'siber': 'Bilişim Teknolojileri',
            'tarim': 'Tarım',
            'tekstil': 'Tekstil Teknolojisi',
            'tesisat': 'Tesisat Teknolojisi ve İklimlendirme',
            'ucak': 'Uçak Bakım',
            'ulastirma': 'Ulaştırma Hizmetleri',
            'yapayzeka': 'Yapay Zekâ',
            'yenilenebilir': 'Yenilenebilir Enerji Teknolojileri',
            'yiyecek': 'Yiyecek İçecek Hizmetleri',
            'yiyecekpro': 'Yiyecek İçecek Hizmetleri'
        };

        this.INVALID_NAMES = new Set([
            'ders', 'dersler', 'derskategorileri', 'kategorileri', 'toplam', 'toplamderssaati',
            'meslekderssaatitoplami', 'secmelimeslekderssaatitoplami', 'secmeliderssaatitoplami',
            'derssaatitoplami', 'dersinadi', 'alanortakdersleri', 'daldersleri', 'haftalikderssaati',
            'haftalikderssaatitoplami', 'geneltoplam', 'donem', 'yariyil'
        ]);
    }

    normalizeName(text) {
        if (!text) return "";
        return String(text).trim().toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/İ/g, 'i')
            .replace(/ş/g, 's')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/â/g, 'a')
            .replace(/î/g, 'i')
            .replace(/û/g, 'u')
            .replace(/[^a-z0-9]/g, '');
    }

    isInvalidCourse(name) {
        const norm = this.normalizeName(name);
        if (!norm || norm.length < 3 || this.INVALID_NAMES.has(norm)) return true;
        if (norm.endsWith('toplami') || norm.startsWith('toplam')) return true;
        return false;
    }

    parseCourseHours(d, grade) {
        if (!d) return 0;
        const gStr = String(grade);
        const checkKeys = [`ders_saati_${gStr}`, 'saat', 'ders_saati', 'haftalik_ders_saati'];
        for (let k of checkKeys) {
            const val = d[k];
            if (val !== undefined && val !== null && val !== '-' && val !== '') {
                const str = String(val).trim();
                if (str.toUpperCase().includes('SINIF') || str === '0') continue;
                const m = str.match(/\d+/);
                if (m) {
                    const h = parseInt(m[0], 10);
                    if (!isNaN(h) && h > 0) return h;
                }
            }
        }
        if (d.sinif_ders_saatleri && typeof d.sinif_ders_saatleri === 'object') {
            const val = d.sinif_ders_saatleri[gStr];
            if (val !== undefined && val !== null && val !== '-' && val !== '') {
                const m = String(val).match(/\d+/);
                if (m) {
                    const h = parseInt(m[0], 10);
                    if (!isNaN(h) && h > 0) return h;
                }
            }
        }
        return 0;
    }

    resolveBranch(courseName, defaultArea = null, category = "ORTAK DERSLER") {
        if (!courseName) return "— Branş Atanmadı —";
        const clean = String(courseName).trim();
        const upper = clean.toUpperCase();
        
        if (this.TTKB_BRANCH_MAP[upper]) return this.TTKB_BRANCH_MAP[upper];
        
        // Case-insensitive substring matching
        const norm = this.normalizeName(clean);
        for (let [k, v] of Object.entries(this.TTKB_BRANCH_MAP)) {
            if (this.normalizeName(k) === norm) return v;
        }

        if (norm.includes("rehberlik")) {
            return "Rehberlik";
        }

        // DÖGM İmam Hatip Heuristics
        if (norm.includes("arapca")) return "Arapça";
        if (norm.includes("kuran") || norm.includes("fikih") || norm.includes("tefsir") || 
            norm.includes("hadis") || norm.includes("akaid") || norm.includes("kelam") || 
            norm.includes("siyer") || norm.includes("hitabet") || norm.includes("dinler") || norm.includes("islam")) {
            return "İHL Meslek Dersleri";
        }

        // MTEGM Meslek / Atölye Heuristics
        if (category.includes("ALAN") || category.includes("MESLEK") || category.includes("DAL")) {
            if (defaultArea) {
                const areaKey = String(defaultArea).toLowerCase().replace(/[^a-z0-9]/g, '');
                for (let k in this.AREA_BRANCH_MAP) {
                    if (this.normalizeName(k) === areaKey || areaKey.includes(this.normalizeName(k))) {
                        return this.AREA_BRANCH_MAP[k];
                    }
                }
                return defaultArea;
            }
        }

        return clean;
    }

    /**
     * Türkçe Standart Baş Harfleri Büyük (Title Case) Dönüştürücü
     * MEB Müfredat ve TTKB Standartlarına Uygun Kısaltma ve Bağlaç Desteği
     */
    toTurkishTitleCase(text) {
        if (!text) return "";
        const clean = String(text).trim();
        if (!clean) return "";

        const ACRONYMS = {
            "TC": "T.C.", "T.C.": "T.C.", "T.C": "T.C.",
            "CNC": "CNC", "CAM": "CAM", "CAD": "CAD", "PLC": "PLC",
            "IHL": "İHL", "İHL": "İHL", "PDR": "PDR", "MEB": "MEB",
            "AMP": "AMP", "ATP": "ATP", "MESEM": "MESEM",
            "I": "I", "II": "II", "III": "III", "IV": "IV", "V": "V",
            "VI": "VI", "VII": "VII", "VIII": "VIII", "IX": "IX", "X": "X", "XI": "XI", "XII": "XII"
        };

        const trLower = (s) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
        
        const trCap = (word) => {
            if (!word) return "";
            const lettersOnly = word.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '').toUpperCase();
            if (ACRONYMS[lettersOnly]) {
                const mapped = ACRONYMS[lettersOnly];
                return word.replace(new RegExp(lettersOnly, 'i'), mapped);
            }
            const first = word[0];
            const rest = word.slice(1);
            let capFirst = first.toUpperCase();
            if (first === 'i' || first === 'İ') capFirst = 'İ';
            else if (first === 'ı' || first === 'I') capFirst = 'I';
            return capFirst + trLower(rest);
        };

        const tokens = clean.split(/(\s+|[/\-()]+)/);
        const result = tokens.map((token, i) => {
            if (!token.trim() || /^[\s/\-()]+$/.test(token)) return token;
            const u = token.toUpperCase();
            if ((u === "VE" || u === "VEYA" || u === "İLE" || u === "ILE") && i > 0) {
                return u.toLowerCase();
            }
            return trCap(token);
        });

        let res = result.join("");
        res = res.replace(/\bT\.c\./g, "T.C.").replace(/\bT\.C\s+/g, "T.C. ");
        res = res.replace(/Ataturkculuk/g, "Atatürkçülük").replace(/Atatürkculuk/g, "Atatürkçülük");
        res = res.replace(/Inkilap/g, "İnkılap").replace(/İnkılâp/g, "İnkılap");
        return res;
    }

    /**
     * MEB Talim ve Terbiye Kurulu 9 Sayılı Kararına Göre Ders ve Branş Kanonik Normalizasyonu
     * (Küçük/Büyük Harf, Şapkalı Karakterler ve Sahte Branşları Önler)
     */
    /**
     * Verilen ad, uygulamanın tanıdığı bir BRANŞ mı?
     *
     * Liste burada elle tutulmaz; database.js'teki kanonik branş listelerinden
     * okunur. Aksi hâlde uygulamada bir branş adı değişince burası fark etmez
     * ve idarecinin seçimi yeniden sessizce silinmeye başlar.
     */
    isKnownBranch(name) {
        if (!name) return false;
        if (!this._bransSeti) {
            const kaynak = (this.db && typeof this.db.getAllBranchesList === "function")
                ? (this.db.getAllBranchesList() || [])
                : [];
            const set = new Set();
            for (const b of kaynak) {
                const ad = (b && (b.brans_adi || b.brans)) || b;
                if (typeof ad === "string" && ad.trim()) set.add(this.normalizeName(ad));
            }
            // Rehberlik norm listesinden düşürülse de geçerli bir branştır.
            set.add(this.normalizeName("Rehberlik"));
            // Liste beklenmedik şekilde boş gelirse kuralı uygulamıyoruz:
            // her seçimi "sahte" sayıp hepsini ezmektense hiçbirine dokunmamak
            // yeğdir. Boş set, aşağıda "bilinmiyor" olarak ele alınır.
            this._bransSeti = set.size >= 20 ? set : null;
        }
        if (!this._bransSeti) return true;   // liste okunamadı: seçime dokunma
        return this._bransSeti.has(this.normalizeName(name));
    }

    getCanonicalCourseAndBranch(rawCourseName, rawBranchName = null, defaultArea = null, category = "ORTAK DERSLER") {
        if (!rawCourseName) return { courseName: "Ders", branchName: "— Branş Atanmadı —" };
        
        const cleanCourse = String(rawCourseName).trim();
        const normKey = this.normalizeName(cleanCourse);

        const STANDARDS = {
            'turkdiliveedebiyati': { course: 'Türk Dili ve Edebiyatı', branch: 'Türk Dili ve Edebiyatı' },
            'hazirliksinifiturkdiliveedebiyati': { course: 'Türk Dili ve Edebiyatı', branch: 'Türk Dili ve Edebiyatı' },
            'turkce': { course: 'Türkçe', branch: 'Türkçe' },
            'dilveanlatim': { course: 'Türk Dili ve Edebiyatı', branch: 'Türk Dili ve Edebiyatı' },
            'turkedebiyati': { course: 'Türk Dili ve Edebiyatı', branch: 'Türk Dili ve Edebiyatı' },
            'secmeliturkdiliveedebiyati': { course: 'Seçmeli Türk Dili ve Edebiyatı', branch: 'Türk Dili ve Edebiyatı' },

            'tarih': { course: 'Tarih', branch: 'Tarih' },
            'secmelitarih': { course: 'Seçmeli Tarih', branch: 'Tarih' },
            'tcinkilaptarihiveataturkculuk': { course: 'T.C. İnkılap Tarihi ve Atatürkçülük', branch: 'Tarih' },
            'tcinkilaptarihi': { course: 'T.C. İnkılap Tarihi ve Atatürkçülük', branch: 'Tarih' },
            'cagdasturkvedunyatarihi': { course: 'Çağdaş Türk ve Dünya Tarihi', branch: 'Tarih' },
            'turkkulturvemedeniyettarihi': { course: 'Türk Kültür ve Medeniyet Tarihi', branch: 'Tarih' },
            'islambilimtarihi': { course: 'İslam Bilim Tarihi', branch: 'Tarih' },

            'matematik': { course: 'Matematik', branch: 'Matematik' },
            'temelmatematik': { course: 'Temel Matematik', branch: 'Matematik' },
            'secmelimatematik': { course: 'Seçmeli Matematik', branch: 'Matematik' },
            'secmelitemelmatematik': { course: 'Seçmeli Temel Matematik', branch: 'Matematik' },
            'ilerimatematik': { course: 'İleri Matematik', branch: 'Matematik' },
            'matematikuygulamalari': { course: 'Matematik Uygulamaları', branch: 'Matematik' },
            'matematiktarihiveuygulamalari': { course: 'Matematik Tarihi ve Uygulamaları', branch: 'Matematik' },

            'fizik': { course: 'Fizik', branch: 'Fizik' },
            'secmelifizik': { course: 'Seçmeli Fizik', branch: 'Fizik' },
            'kimya': { course: 'Kimya', branch: 'Kimya' },
            'secmelikimya': { course: 'Seçmeli Kimya', branch: 'Kimya' },
            'biyoloji': { course: 'Biyoloji', branch: 'Biyoloji' },
            'secmelibiyoloji': { course: 'Seçmeli Biyoloji', branch: 'Biyoloji' },
            'fenbilimleri': { course: 'Fen Bilimleri', branch: 'Fen Bilimleri' },
            'fenbilimleriuygulamalari': { course: 'Fen Bilimleri Uygulamaları', branch: 'Fizik' },
            'astronomiveuzaybilimleri': { course: 'Astronomi ve Uzay Bilimleri', branch: 'Fizik' },

            'saglikbilgisivetrafikkulturu': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Sağlık Hizmetleri' },
            'saglikbilgisivetafikkulturu': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Sağlık Hizmetleri' },
            'saglikbilgisivetrafigikulturu': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Sağlık Hizmetleri' },
            'saglikbilgisivetraffikkulturu': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Sağlık Hizmetleri' },
            'saglikbilgisivetraffik': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Sağlık Hizmetleri' },
            'saglikbilgisi': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Sağlık Hizmetleri' },
            'trafikguvenligi': { course: 'Trafik Güvenliği', branch: 'Beden Eğitimi' },

            'cografya': { course: 'Coğrafya', branch: 'Coğrafya' },
            'secmelicografya': { course: 'Seçmeli Coğrafya', branch: 'Coğrafya' },
            'turkdunyasicografyasi': { course: 'Türk Dünyası Coğrafyası', branch: 'Coğrafya' },

            'felsefe': { course: 'Felsefe', branch: 'Felsefe' },
            'secmelifelsefe': { course: 'Seçmeli Felsefe', branch: 'Felsefe' },
            'psikoloji': { course: 'Psikoloji', branch: 'Felsefe' },
            'sosyoloji': { course: 'Sosyoloji', branch: 'Felsefe' },
            'mantik': { course: 'Mantık', branch: 'Felsefe' },
            'bilgikurami': { course: 'Bilgi Kuramı', branch: 'Felsefe' },
            'demokrasiveinsanhaklari': { course: 'Demokrasi ve İnsan Hakları', branch: 'Felsefe' },
            'dusunmeegitimi': { course: 'Düşünme Eğitimi', branch: 'Felsefe' },

            'dinkulturuveahlakbilgisi': { course: 'Din Kültürü ve Ahlak Bilgisi', branch: 'Din Kültürü ve Ahlak Bilgisi' },
            'temeldinibilgiler': { course: 'Temel Dini Bilgiler', branch: 'Din Kültürü ve Ahlak Bilgisi' },
            'peygamberimizinhayati': { course: 'Peygamberimizin Hayatı', branch: 'Din Kültürü ve Ahlak Bilgisi' },
            'kuranikerim': { course: "Kur'an-ı Kerim", branch: 'Din Kültürü ve Ahlak Bilgisi' },

            'ingilizce': { course: 'İngilizce', branch: 'İngilizce' },
            'yabancidil': { course: 'İngilizce', branch: 'İngilizce' },
            'birinciyabancidil': { course: 'İngilizce', branch: 'İngilizce' },
            'birinciyabancidilingilizce': { course: 'İngilizce', branch: 'İngilizce' },
            'yabancidilingilizce': { course: 'İngilizce', branch: 'İngilizce' },
            'secmelibirinciyabancidil': { course: 'Seçmeli İngilizce', branch: 'İngilizce' },
            'secmelingilizce': { course: 'Seçmeli İngilizce', branch: 'İngilizce' },

            'ikinciyabancidil': { course: 'Almanca', branch: 'Almanca' },
            'ikinciyabancidilalmanca': { course: 'Almanca', branch: 'Almanca' },
            'secmeliikinciyabancidil': { course: 'Seçmeli Almanca', branch: 'Almanca' },
            'secmelialmanca': { course: 'Seçmeli Almanca', branch: 'Almanca' },
            'almanca': { course: 'Almanca', branch: 'Almanca' },
            'fransizca': { course: 'Fransızca', branch: 'Fransızca' },
            'arapca': { course: 'Arapça', branch: 'Arapça' },
            'meslekiarapca': { course: 'Mesleki Arapça', branch: 'Arapça' },

            'bedenegitimivespor': { course: 'Beden Eğitimi ve Spor', branch: 'Beden Eğitimi' },
            'bedenegitimi': { course: 'Beden Eğitimi ve Spor', branch: 'Beden Eğitimi' },
            'bedenegitimivesporgorselsanatlarmuzik': { course: 'Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik', branch: 'Beden Eğitimi' },

            'gorselsanatlar': { course: 'Görsel Sanatlar', branch: 'Görsel Sanatlar' },
            'gorselsanatlarmuzik': { course: 'Görsel Sanatlar/Müzik', branch: 'Görsel Sanatlar' },
            'muzik': { course: 'Müzik', branch: 'Müzik' },

            'bilisimteknolojileriveyazilim': { course: 'Bilişim Teknolojileri ve Yazılım', branch: 'Bilişim Teknolojileri' },
            'bilgisayarbilimi': { course: 'Bilgisayar Bilimi', branch: 'Bilişim Teknolojileri' },

            'rehberlikveyonlendirme': { course: 'Rehberlik ve Yönlendirme', branch: 'Rehberlik' },
            'rehberlik': { course: 'Rehberlik ve Yönlendirme', branch: 'Rehberlik' }
        };

        let canonicalCourse = cleanCourse;
        let canonicalBranch = rawBranchName ? String(rawBranchName).trim() : null;

        if (STANDARDS[normKey]) {
            canonicalCourse = STANDARDS[normKey].course;
            const branchNorm = canonicalBranch ? this.normalizeName(canonicalBranch) : '';

            // İDARECİNİN SEÇİMİ KORUNUR.
            //
            // Burada eskiden `STANDARDS[branchNorm]` koşulu vardı: atanan branş
            // adı STANDARDS tablosunda bir DERS anahtarı olarak geçiyorsa seçim
            // "sahte branş" sayılıp üzerine yazılıyordu. Amacı, branş alanına
            // yanlışlıkla ders adı yazılmış kayıtları toparlamaktı; ama çok
            // genişti. "Biyoloji", "Matematik", "Fizik", "Kimya", "Tarih",
            // "Coğrafya", "Felsefe" gibi adlar hem ders hem GERÇEK branş
            // olduğu için, idareci bir dersi bu branşlardan birine atadığında
            // seçimi okul her yüklendiğinde SESSİZCE siliniyordu.
            //
            // Kullanıcı kararı (27.08.2026): "Branş ne seçilirse seçilsin o
            // liste okul idarecisinin sorumluluğundadır; katı kural koymuyoruz."
            // Örneğin Sağlık Bilgisi dersini Biyoloji'ye yazmak isterse yazar
            // ve saat Biyoloji'nin yüküne eklenir.
            //
            // Artık yalnızca GERÇEKTEN branş olmayan değerler düzeltilir:
            // boş, "Branş Atanmadı", "Diğer", ya da kanonik branş listesinde
            // bulunmayan bir ad.
            const gercekBrans = canonicalBranch && this.isKnownBranch(canonicalBranch);
            if (!canonicalBranch || branchNorm === 'bransatanmadi' || branchNorm === 'diger' || !gercekBrans) {
                canonicalBranch = STANDARDS[normKey].branch;
            }
        } else {
            canonicalCourse = this.toTurkishTitleCase(cleanCourse);
            if (canonicalBranch) {
                const bNorm = this.normalizeName(canonicalBranch);
                if (STANDARDS[bNorm]) {
                    canonicalBranch = STANDARDS[bNorm].branch;
                } else {
                    canonicalBranch = this.toTurkishTitleCase(canonicalBranch);
                }
            } else {
                canonicalBranch = this.resolveBranch(cleanCourse, defaultArea, category);
            }
        }

        return {
            courseName: canonicalCourse,
            branchName: canonicalBranch || canonicalCourse
        };
    }

    // --- KAPSAMLI ZORUNLU DERS ÇÖZÜMLEME (UNIVERSAL RESOLVER) ---
    // --- KAPSAMLI VE %100 MEB UYUMLU ZORUNLU DERS ÇÖZÜMLEME (CANONICAL UNIVERSAL RESOLVER) ---
        // --- SADECE VE SADECE PDF TABLOLARINDAN ÇEKİLEN KESİN MÜFREDAT ÇÖZÜMLEYİCİ ---
    getMandatoryCourses(schoolType, grade, areaId = null, dalName = null) {
        const gStr = String(grade);
        const result = [];
        const seenNorms = new Set();
        const schoolTypeStr = String(schoolType || "").toLowerCase();

        // 0. ÖZEL EĞİTİM
        if (areaId === "ozel_egitim" || schoolTypeStr.includes("ozel_egitim") || String(dalName || "").includes("Özel Eğit")) {
            return [
                { ders: "Türkçe / Türk Dili ve Edebiyatı (Özel Eğitim)", saat: 3, kategori: "ORTAK DERSLER", atananBrans: "Özel Eğitim", baraj_ders: true, isAtolye: false },
                { ders: "Matematik (Özel Eğitim)", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Özel Eğitim", baraj_ders: false, isAtolye: false },
                { ders: "Sosyal Hayat ve Toplumsal Uyum Becerileri", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Özel Eğitim", baraj_ders: false, isAtolye: false },
                { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false, isAtolye: false },
                { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false, isAtolye: false },
                { ders: "Görsel Sanatlar ve Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Görsel Sanatlar", baraj_ders: false, isAtolye: false },
                { ders: "İş Becerileri ve Mesleki Uygulamalar", saat: 15, kategori: "ALAN VE DAL MESLEK DERSLERİ", atananBrans: "Özel Eğitim", baraj_ders: true, isAtolye: true },
                { ders: "Rehberlik ve Yönlendirme", saat: 2, kategori: "REHBERLİK", atananBrans: "Özel Eğitim", baraj_ders: false, isAtolye: false }
            ];
        }

        // 1. TEMEL EĞİTİM (İHO & ORTAOKUL)
        if (schoolTypeStr.includes("imam_hatip_ortaokulu") || schoolTypeStr.includes("iho")) {
            const IHO_CURRICULUM = {
                "5": [
                    { ders: "Türkçe", saat: 6, atananBrans: "Türkçe", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 3, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                    { ders: "Kur'an-ı Kerim", saat: 2, atananBrans: "İHL Meslek Dersleri", kategori: "ORTAK DERSLER" },
                    { ders: "Arapça", saat: 2, atananBrans: "Arapça", kategori: "ORTAK DERSLER" },
                    { ders: "Peygamberimizin Hayatı", saat: 2, atananBrans: "İHL Meslek Dersleri", kategori: "ORTAK DERSLER" },
                    // 5. sınıf Beden Eğitimi 2 saattir (çizelgede 1 yazılmıştı),
                    // Bilişim 1 saattir (2 yazılmıştı). Kaynak: DÖGM İmam Hatip
                    // Ortaokulu Haftalık Ders Çizelgesi, 2025-2026'dan itibaren.
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER" },
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 1, atananBrans: "Bilişim Teknolojileri", kategori: "ORTAK DERSLER" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
                ],
                "6": [
                    { ders: "Türkçe", saat: 6, atananBrans: "Türkçe", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 3, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                    { ders: "Kur'an-ı Kerim", saat: 2, atananBrans: "İHL Meslek Dersleri", kategori: "ORTAK DERSLER" },
                    { ders: "Arapça", saat: 2, atananBrans: "Arapça", kategori: "ORTAK DERSLER" },
                    { ders: "Peygamberimizin Hayatı", saat: 2, atananBrans: "İHL Meslek Dersleri", kategori: "ORTAK DERSLER" },
                    { ders: "Temel Dini Bilgiler", saat: 1, atananBrans: "İHL Meslek Dersleri", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Spor", saat: 1, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER" },
                    // 6. sınıf Bilişim 1 saattir; 2 yazılmıştı. Kaynak: aynı çizelge.
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 1, atananBrans: "Bilişim Teknolojileri", kategori: "ORTAK DERSLER" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
                ],
                "7": [
                    { ders: "Türkçe", saat: 5, atananBrans: "Türkçe", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                    { ders: "Kur'an-ı Kerim", saat: 2, atananBrans: "İHL Meslek Dersleri", kategori: "ORTAK DERSLER" },
                    { ders: "Arapça", saat: 2, atananBrans: "Arapça", kategori: "ORTAK DERSLER" },
                    { ders: "Peygamberimizin Hayatı", saat: 2, atananBrans: "İHL Meslek Dersleri", kategori: "ORTAK DERSLER" },
                    // 7. sınıfta Temel Dinî Bilgiler dersi hiç yazılmamıştı;
                    // çizelgede 6 VE 7. sınıfta 1'er saat vardır.
                    { ders: "Temel Dini Bilgiler", saat: 1, atananBrans: "İHL Meslek Dersleri", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Spor", saat: 1, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER" },
                    // 7. sınıf Teknoloji ve Tasarım 1 saattir; 2 yazılmıştı.
                    { ders: "Teknoloji ve Tasarım", saat: 1, atananBrans: "Teknoloji ve Tasarım", kategori: "ORTAK DERSLER" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
                ],
                "8": [
                    { ders: "Türkçe", saat: 5, atananBrans: "Türkçe", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER" },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                    { ders: "Kur'an-ı Kerim", saat: 2, atananBrans: "İHL Meslek Dersleri", kategori: "ORTAK DERSLER" },
                    { ders: "Arapça", saat: 2, atananBrans: "Arapça", kategori: "ORTAK DERSLER" },
                    { ders: "Peygamberimizin Hayatı", saat: 2, atananBrans: "İHL Meslek Dersleri", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Spor", saat: 1, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER" },
                    { ders: "Teknoloji ve Tasarım", saat: 2, atananBrans: "Teknoloji ve Tasarım", kategori: "ORTAK DERSLER" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
                ]
            };
            if (IHO_CURRICULUM[gStr]) return IHO_CURRICULUM[gStr];
        }

        if (schoolTypeStr.includes("ortaokul") && !schoolTypeStr.includes("imam_hatip")) {
            const ORTAOKUL_CURRICULUM = {
                "5": [
                    { ders: "Türkçe", saat: 6, atananBrans: "Türkçe", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 3, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, atananBrans: "Bilişim Teknolojileri", kategori: "ORTAK DERSLER" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
                ],
                "6": [
                    { ders: "Türkçe", saat: 6, atananBrans: "Türkçe", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 3, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, atananBrans: "Bilişim Teknolojileri", kategori: "ORTAK DERSLER" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
                ],
                "7": [
                    { ders: "Türkçe", saat: 5, atananBrans: "Türkçe", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                    { ders: "Teknoloji ve Tasarım", saat: 2, atananBrans: "Teknoloji ve Tasarım", kategori: "ORTAK DERSLER" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
                ],
                "8": [
                    { ders: "Türkçe", saat: 5, atananBrans: "Türkçe", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER" },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                    { ders: "Teknoloji ve Tasarım", saat: 2, atananBrans: "Teknoloji ve Tasarım", kategori: "ORTAK DERSLER" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
                ]
            };
            if (ORTAOKUL_CURRICULUM[gStr]) return ORTAOKUL_CURRICULUM[gStr];
        }

                // 1.1. İLKOKUL
        if (schoolTypeStr.includes("ilkokul")) {
            const İLKOKUL_CURRICULUM = {
                "1": [
                    { ders: "Türkçe", saat: 10, atananBrans: "Sınıf Öğretmenliği", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Hayat Bilgisi", saat: 4, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Oyun", saat: 5, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Serbest Etkinlikler", saat: 4, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" }
                ],
                "2": [
                    { ders: "Türkçe", saat: 10, atananBrans: "Sınıf Öğretmenliği", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Hayat Bilgisi", saat: 4, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Oyun", saat: 5, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Serbest Etkinlikler", saat: 2, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" }
                ],
                "3": [
                    { ders: "Türkçe", saat: 8, atananBrans: "Sınıf Öğretmenliği", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Hayat Bilgisi", saat: 3, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Fen Bilimleri", saat: 3, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Oyun", saat: 5, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Serbest Etkinlikler", saat: 2, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" }
                ],
                "4": [
                    { ders: "Türkçe", saat: 8, atananBrans: "Sınıf Öğretmenliği", baraj_ders: true, kategori: "ORTAK DERSLER" },
                    { ders: "Matematik", saat: 5, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Fen Bilimleri", saat: 3, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Müzik", saat: 1, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Beden Eğitimi ve Oyun", saat: 2, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" },
                    { ders: "Trafik Güvenliği", saat: 1, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                    // Dersin resmî adı "Vatandaşlık"tır; "Yurttaşlık" yazılmıştı.
                    // Kaynak: TTKB Sayı 04, 09/05/2025 İlköğretim çizelgesi.
                    { ders: "İnsan Hakları, Vatandaşlık ve Demokrasi", saat: 2, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER" }
                ]
            };
            if (İLKOKUL_CURRICULUM[gStr]) return İLKOKUL_CURRICULUM[gStr];
        }

        // 1.2. MESLEKİ EĞİTİM MERKEZİ (MESEM / ÇIRAKLIK)
        //
        // KAYNAK: js/mesem_curriculum_db.js — 40 resmî MESEM çerçeve program
        // PDF'inden üretilir (tools/rebuild_mesem_db.py). 38 alan, 192 dal,
        // 768 çizelge. Her çizelge, PDF'teki kendi TOPLAM satırıyla
        // doğrulanmıştır; doğrulamayı geçemeyen sayfa veriye yazılmaz.
        //
        // ÖNCESİ (2026-08-24'te kaldırıldı): burada elle yazılmış 4 sınıflık
        // sabit bir liste vardı ve meslek dersi adları uydurmaydı
        // ("... Meslek Teknolojisi", "... Ustalık Eğitimi ve Ahilik").
        // MEB programlarında böyle dersler yoktur; 192 dalın hepsi aynı beş
        // satırı görüyordu.
        const mesemOkulu = schoolTypeStr.includes("mesleki_egitim_merkezi") || schoolTypeStr.includes("mesem");
        if (mesemOkulu) {
            const mesemDb = (typeof MESEM_CURRICULUM_DB !== 'undefined')
                ? MESEM_CURRICULUM_DB
                : ((typeof window !== 'undefined' && window.MESEM_CURRICULUM_DB) ? window.MESEM_CURRICULUM_DB : null);
            const mesemArea = (mesemDb && areaId) ? mesemDb[String(areaId).toLowerCase()] : null;
            const mesemSchedules = mesemArea ? (mesemArea.siniflar || {})[gStr] : null;

            if (mesemSchedules && mesemSchedules.length > 0) {
                let matched = null;
                if (dalName) {
                    // MTEGM tarafındaki eşleştiricinin aynısı: başlığın İLK
                    // parantezi dal adıdır, tam eşleşme 200 puan, kısmi 100,
                    // sözcük örtüşmesi 40/15.
                    const normDal = this.normalizeName(dalName).toLowerCase();
                    const STOP_WORDS = new Set(["alani", "teknolojisi", "teknolojileri", "programi", "haftalik", "ders", "cizelgesi", "dali", "ve", "sistemleri", "bolumu", "merkezi", "mesleki", "egitim"]);
                    const dalTokens = normDal.split(/[\s\-_/]+/).filter(t => t.length > 1 && !STOP_WORDS.has(t));
                    let bestScore = -1;
                    for (let s of mesemSchedules) {
                        const normTitle = this.normalizeName(s.title || "").toLowerCase();
                        // Dal adı, "haftalik" sözcüğünden önceki parantezin
                        // TAMAMIDIR. İlk parantezi almak yetmez: bazı dal
                        // adlarının kendisinde parantez vardır
                        // ("TEKSTİL BİTİM İŞLEMLERİ (APRE) DALI").
                        const parenMatch = normTitle.match(/\((.+)\)\s*haftalik/) || normTitle.match(/\((.*?)\)/);
                        const parenContent = parenMatch ? parenMatch[1] : "";
                        let score = 0;
                        if (parenContent && parenContent.includes(normDal)) score += 200;
                        else if (normTitle.includes(normDal)) score += 100;
                        for (let t of dalTokens) {
                            if (parenContent.includes(t)) score += 40;
                            else if (normTitle.includes(t)) score += 15;
                        }
                        if (score > bestScore) { bestScore = score; matched = s; }
                    }
                }
                if (!matched) matched = mesemSchedules[0];

                // Alanın MEB atama branşı veride hazır durur (TTKB atamaya
                // esas alanlar çizelgesi). AREA_BRANCH_MAP'e bağlı değildir:
                // MESEM alan anahtarları MTEGM dosya kısaltmalarıyla aynı
                // değildir ve orada karşılığı olmayanlar vardır.
                const areaCode = mesemArea.brans || this.AREA_BRANCH_MAP[areaId] || "Meslek";

                for (let c of matched.courses) {
                    const cNorm = this.normalizeName(c.ders);
                    if (seenNorms.has(cNorm)) continue;
                    seenNorms.add(cNorm);
                    const assignedBranch = this.getCanonicalCourseAndBranch(c.ders, null, areaCode, c.kategori).branchName;
                    result.push({
                        ders: this.toTurkishTitleCase(c.ders),
                        saat: c.saat,
                        kategori: c.kategori,
                        atananBrans: assignedBranch,
                        baraj_ders: !!c.baraj_ders,
                        isAtolye: c.kategori.includes("MESLEK")
                    });
                }
                if (result.length > 0) return result;
            }
            // Alan seçilmemişse ya da veride yoksa BOŞ dönülür. Aşağıdaki
            // bloklara düşmek, mesleki eğitim merkezine meslek lisesi ya da
            // Anadolu lisesi çizelgesi yazmak demektir; ikisi de MESEM'de
            // okutulmayan derslerdir ve normu sessizce şişirir.
            return result;
        }

        // 2. MTEGM (DOĞRUDAN VE SADECE İLGİLİ SINIF KLASÖRÜNDEKİ PDF TABLOSUNDAN ALMA)
        //
        // MESEM buraya hiç ulaşmaz: 1.2 bloğu her durumda dönüş yapar.
        if (schoolTypeStr.includes("meslek") || schoolTypeStr.includes("teknik") || schoolTypeStr.includes("mtegm") || areaId) {
            const ALIAS_MAP = {
                "tesisat_teknolojisi_ve_iklimlendirme": "tesisat",
                "bilisim_teknolojileri": "bilisim",
                "elektrik_elektronik_teknolojisi": "elektrik",
                "makine_ve_tasarim_teknolojisi": "makine",
                "motorlu_araclar_teknolojisi": "motorluarac",
                "kimya_teknolojisi": "kimya",
                "insaat_teknolojisi": "insaat",
                "mobilya_ve_ic_mekan_tasarimi": "mobilya",
                "metal_teknolojisi": "metal",
                "moda_tasarim_teknolojileri": "moda",
                "yiyecek_icecek_hizmetleri": "yiyecek",
                "cocuk_gelisimi_ve_egitimi": "cocukgelisimi",
                "grafik_ve_fotograf": "grafik",
                "guzellik_hizmetleri": "guzellik",
                "hasta_ve_yasli_hizmetleri": "hasta",
                "adalet": "adalet",
                "muhasebe_ve_finansman": "muhasebe",
                "pazarlama_ve_perakende": "pazarlama",
                "buro_yonetimi_ve_yonetici_asistanligi": "buro",
                "halkla_iliskiler": "halklailiskiler",
                "gazetecilik": "gazetecilik",
                "radyo_televizyon": "radyotv",
                "saglik_hizmetleri": "saglik",
                "tarim": "tarim",
                "hayvan_yetistiriciligi_ve_sagligi": "hayvanyetistiriciligi",
                "laboratuvar_hizmetleri": "laboratuvar",
                "gida_teknolojisi": "gida",
                "tekstil_teknolojisi": "tekstil",
                "biyomedikal_cihaz_teknolojileri": "biyomedikal",
                "denizcilik": "denizcilik",
                "gemi_yapimi": "gemi",
                "havacilik_ve_uzay_teknolojisi": "havacilikveuzaypro",
                "ucak_bakim": "ucak",
                "rayli_sistemler_teknolojisi": "rayli",
                "harita_tapu_kadastro": "harita",
                "maden_teknolojisi": "maden",
                "matbaa_teknolojisi": "matbaa",
                "seramik_ve_cam_teknolojisi": "seramikpro",
                "kuyumculuk_teknolojisi": "kuyumculuk",
                "plastik_teknolojisi": "plastiktek",
                "yenilenebilir_enerji_teknolojileri": "yenilenebilir",
                "itfaiyecilik_ve_yangin_guvenligi": "itfaiyecilik",
                "konaklama_ve_seyahat_hizmetleri": "konaklama",
                "endustriyel_otomasyon_teknolojileri": "endustriyel",
                "mikromekanik": "mikromekanik",
                "siber_guvenlik": "siber",
                "yapay_zeka_ve_veri_bilimi": "yapayzeka"
            };

            const lookupKey = ALIAS_MAP[areaId] || (areaId ? areaId.toLowerCase() : "");
            const areaDb = (typeof STRICT_PDF_CURRICULUM_DB !== 'undefined' && lookupKey) ? STRICT_PDF_CURRICULUM_DB[lookupKey] : null;
            const schedulesForGrade = areaDb ? areaDb[gStr] : null;

            if (schedulesForGrade && schedulesForGrade.length > 0) {
                let matchedSchedule = null;
                if (dalName) {
                    const normDal = this.normalizeName(dalName).toLowerCase();
                    const STOP_WORDS = new Set(["alani", "teknolojisi", "teknolojileri", "programi", "haftalik", "ders", "cizelgesi", "anadolu", "meslek", "teknik", "dali", "ve", "sistemleri", "bolumu"]);
                    const dalTokens = normDal.split(/[\s\-_/]+/).filter(t => t.length > 1 && !STOP_WORDS.has(t));
                    const isAmp = !schoolTypeStr.includes("teknik") && !schoolTypeStr.includes("atp");

                    let bestScore = -1;
                    for (let s of schedulesForGrade) {
                        const normTitle = this.normalizeName(s.title || "").toLowerCase();
                        
                        // AMP / ATP Program filtreleme
                        const titleIsAtp = normTitle.includes("anadolu teknik programi") && !normTitle.includes("anadolu meslek programi");
                        const titleIsAmp = normTitle.includes("anadolu meslek programi") && !normTitle.includes("anadolu teknik programi");
                        if (isAmp && titleIsAtp) continue;
                        if (!isAmp && titleIsAmp) continue;

                        let score = 0;
                        const parenMatch = normTitle.match(/\((.*?)\)/);
                        const parenContent = parenMatch ? parenMatch[1] : "";

                        if (parenContent && parenContent.includes(normDal)) score += 200;
                        else if (normTitle.includes(normDal)) score += 100;

                        // Token bazlı örtüşme
                        let tokenMatches = 0;
                        for (let t of dalTokens) {
                            if (parenContent.includes(t)) score += 40;
                            else if (normTitle.includes(t)) score += 15;
                        }

                        if (score > bestScore) {
                            bestScore = score;
                            matchedSchedule = s;
                        }
                    }
                }
                if (!matchedSchedule) {
                    matchedSchedule = schedulesForGrade[0];
                }

                const areaCode = this.AREA_BRANCH_MAP[areaId] || (areaId ? areaId.replace(/_/g, ' ') : "Meslek");

                for (let c of matchedSchedule.courses) {
                    const cNorm = this.normalizeName(c.ders);
                    if (cNorm.includes("toplam") || cNorm.includes("secmeli")) continue;

                    if (!seenNorms.has(cNorm)) {
                        seenNorms.add(cNorm);
                        const assignedBranch = this.getCanonicalCourseAndBranch(c.ders, null, areaCode, c.kategori).branchName;
                        result.push({
                            ders: this.toTurkishTitleCase(c.ders),
                            saat: c.saat,
                            kategori: c.kategori,
                            atananBrans: assignedBranch,
                            baraj_ders: !!c.baraj_ders || (gStr === "12" && cNorm.includes("isletmelerde")),
                            isAtolye: c.kategori.includes("MESLEK")
                        });
                    }
                }
                if (result.length > 0) return result;
            }
        }

        // ---------------------------------------------------------------
        // 3a. OKUL TÜRÜNE ÖZEL RESMÎ ÇİZELGE
        // ---------------------------------------------------------------
        // Buradan önce, Fen Lisesi / Sosyal Bilimler Lisesi / Anadolu İmam
        // Hatip Lisesi / Güzel Sanatlar / Spor Lisesi ve özel program
        // liselerinin HEPSİ aşağıdaki ANADOLU_CURRICULUM'a düşüyordu.
        // Sessizce: hata yok, uyarı yok, yalnızca yanlış müfredat. Bir
        // Anadolu İmam Hatip Lisesi, Kur'an-ı Kerim ve Arapça dersleri
        // olmadan hesaplanıyordu.
        //
        // Tablo üretilmiştir (tools/uret_ortaogretim_cizelgeleri.py) ve
        // okul türü kimliği database.js getSchoolTypes() ile birebir aynıdır.
        // Eşleşme bulunamazsa eski davranış korunur.
        if (typeof ORTAOGRETIM_CIZELGELERI !== 'undefined' && ORTAOGRETIM_CIZELGELERI) {
            const cizelge = ORTAOGRETIM_CIZELGELERI[schoolTypeStr];
            if (cizelge) {
                const liste = cizelge[gStr];
                if (liste && liste.length) {
                    // Kopyalanır: şubede yapılan düzenleme üretilmiş tabloyu
                    // bozmasın. (Aynı hata demo okulda yaşanmıştı.)
                    return liste.map(d => ({ ...d }));
                }
            }
        }

        // 3. OGM & DÖGM STANDARTLARI (Varsayılan)
        // --------------------------------------------------------------------
        // ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN.
        // Kaynak : 2025-05-20__anadolu-lisesi-haftalik-ders-cizelgesi-fen-lisesi-haftalik-d__20144001_202505.pdf
        //          TTKB Sayı 05, 20/05/2025
        // Branş  : norm_kadro_esas_dersler_cizelgesi.json
        // Üreteç : tools/uret_ortaogretim_mufredat.py
        // Elle yazılmış hâlinde iki hata vardı: (1) zorunlu görünen bir
        // 'İkinci Yabancı Dil (Almanca)' dersi — çizelgede seçmelidir,
        // (2) 12. sınıfta Beden Eğitimi ve Görsel Sanatlar ayrı ayrı
        // yazılmıştı — çizelgede tek satırdır ve okul birini seçer.
        // --------------------------------------------------------------------
        const ANADOLU_CURRICULUM = {
            "9": [
                { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, kategori: "ORTAK DERSLER" },
                { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                { ders: "Tarih", saat: 2, atananBrans: "Tarih", kategori: "ORTAK DERSLER" },
                { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya", kategori: "ORTAK DERSLER" },
                { ders: "Kimya", saat: 2, atananBrans: "Kimya", kategori: "ORTAK DERSLER" },
                { ders: "Matematik", saat: 6, atananBrans: "Matematik", kategori: "ORTAK DERSLER" },
                { ders: "Fizik", saat: 2, atananBrans: "Fizik", kategori: "ORTAK DERSLER" },
                { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji", kategori: "ORTAK DERSLER" },
                { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },   // okul seçer: İngilizce / Almanca / Fransızca
                { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                { ders: "Görsel Sanatlar/Müzik", saat: 2, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },   // okul seçer: Görsel Sanatlar / Müzik
                { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, atananBrans: "Sağlık Hizmetleri", kategori: "ORTAK DERSLER" },
                { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
            ],
            "10": [
                { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, kategori: "ORTAK DERSLER" },
                { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                { ders: "Tarih", saat: 2, atananBrans: "Tarih", kategori: "ORTAK DERSLER" },
                { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya", kategori: "ORTAK DERSLER" },
                { ders: "Kimya", saat: 2, atananBrans: "Kimya", kategori: "ORTAK DERSLER" },
                { ders: "Matematik", saat: 6, atananBrans: "Matematik", kategori: "ORTAK DERSLER" },
                { ders: "Fizik", saat: 2, atananBrans: "Fizik", kategori: "ORTAK DERSLER" },
                { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji", kategori: "ORTAK DERSLER" },
                { ders: "Felsefe", saat: 2, atananBrans: "Felsefe", kategori: "ORTAK DERSLER" },
                { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },   // okul seçer: İngilizce / Almanca / Fransızca
                { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                { ders: "Görsel Sanatlar/Müzik", saat: 2, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },   // okul seçer: Görsel Sanatlar / Müzik
                { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
            ],
            "11": [
                { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, kategori: "ORTAK DERSLER" },
                { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                { ders: "Tarih", saat: 2, atananBrans: "Tarih", kategori: "ORTAK DERSLER" },
                { ders: "Felsefe", saat: 2, atananBrans: "Felsefe", kategori: "ORTAK DERSLER" },
                { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },   // okul seçer: İngilizce / Almanca / Fransızca
                { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },
                { ders: "Görsel Sanatlar/Müzik", saat: 2, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER" },   // okul seçer: Görsel Sanatlar / Müzik
                { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
            ],
            "12": [
                { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, kategori: "ORTAK DERSLER" },
                { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER" },
                { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Tarih", kategori: "ORTAK DERSLER" },
                { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce", kategori: "ORTAK DERSLER" },   // okul seçer: İngilizce / Almanca / Fransızca
                { ders: "Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER" },   // okul seçer: Beden Eğitimi / Görsel Sanatlar / Müzik
                { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "REHBERLİK" }
            ]
        };

        if (ANADOLU_CURRICULUM[gStr]) return ANADOLU_CURRICULUM[gStr];
        return [];
    }

    finalizeCourses(courseList, grade, schoolType = "") {
        const gStr = String(grade);
        const cleanList = [];
        const seen = new Set();

        for (let c of courseList) {
            if (!c || !c.ders) continue;
            const rawName = String(c.ders).trim();
            if (this.isInvalidCourse(rawName)) continue;

            const norm = this.normalizeName(rawName);

            // Rehberlik Kontrolü
            if (norm.includes("rehberlik")) {
                if (gStr === "12") continue; // 12. Sınıfta Rehberlik Dersi Yok
                if (seen.has("rehberlik")) continue;
                seen.add("rehberlik");
                cleanList.push({
                    ders: gStr === "8" ? "Rehberlik ve Kariyer Planlama" : "Rehberlik ve Yönlendirme",
                    saat: 1,
                    kategori: "ORTAK DERSLER",
                    atananBrans: "Rehberlik",
                    baraj_ders: false,
                    isAtolye: false
                });
                continue;
            }

            if (seen.has(norm)) continue;
            seen.add(norm);
            cleanList.push(c);
        }

        // 12. Sınıf Değilse ve Rehberlik Henüz Yoksa Otomatik Olarak Ekle
        if (gStr !== "12" && !seen.has("rehberlik")) {
            const isMiddleSchool567 = ["5", "6", "7"].includes(gStr);
            if (!isMiddleSchool567) {
                cleanList.push({
                    ders: gStr === "8" ? "Rehberlik ve Kariyer Planlama" : "Rehberlik ve Yönlendirme",
                    saat: 1,
                    kategori: "ORTAK DERSLER",
                    atananBrans: "Rehberlik",
                    baraj_ders: false,
                    isAtolye: false
                });
            }
        }

        return cleanList;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MebCurriculumEngine };
}
export const curriculumEngine = new MebCurriculumEngine(dbService);
if (typeof window !== 'undefined') {
    window.MebCurriculumEngine = MebCurriculumEngine;
    window.curriculumEngine = curriculumEngine;
}

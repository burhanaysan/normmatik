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

            'saglikbilgisivetrafikkulturu': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Biyoloji' },
            'saglikbilgisivetafikkulturu': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Biyoloji' },
            'saglikbilgisivetrafigikulturu': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Biyoloji' },
            'saglikbilgisivetraffikkulturu': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Biyoloji' },
            'saglikbilgisivetraffik': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Biyoloji' },
            'saglikbilgisi': { course: 'Sağlık Bilgisi ve Trafik Kültürü', branch: 'Biyoloji' },
            'trafikguvenligi': { course: 'Trafik Güvenliği', branch: 'Biyoloji' },

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
            // Eğer atanan branş yoksa veya dersin adıyla aynıysa veya sahte branşsa doğru TTKB branşını ver
            if (!canonicalBranch || branchNorm === normKey || branchNorm === 'bransatanmadi' || branchNorm === 'diger' || STANDARDS[branchNorm]) {
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
    getMandatoryCourses(schoolType, grade, areaId = null, dalName = null) {
        const master = this.db.masterData;
        const gStr = String(grade);
        const result = [];
        const seenNorms = new Set();

        // 0. ÖZEL EĞİTİM SINIFLARI MÜFREDATI (MEB Özel Eğitim Hizmetleri Yönetmeliği - Haftalık 30 Saat)
        if (areaId === "ozel_egitim" || String(schoolType).includes("ozel_egitim") || String(dalName || "").includes("Özel Eğit")) {
            return [
                { ders: "Türkçe / Türk Dili ve Edebiyatı (Özel Eğitim)", saat: 3, kategori: "ORTAK DERSLER", atananBrans: "Özel Eğitim", baraj_ders: true, isAtolye: false },
                { ders: "Matematik (Özel Eğitim)", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Özel Eğitim", baraj_ders: false, isAtolye: false },
                { ders: "Sosyal Hayat ve Toplumsal Uyum Becerileri", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Özel Eğitim", baraj_ders: false, isAtolye: false },
                { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false, isAtolye: false },
                { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false, isAtolye: false },
                { ders: "Görsel Sanatlar ve Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Görsel Sanatlar", baraj_ders: false, isAtolye: false },
                { ders: "İş Becerileri ve Mesleki Uygulamalar", saat: 15, kategori: "MESLEK ALAN DERSLERİ", atananBrans: "Özel Eğitim", baraj_ders: true, isAtolye: true },
                { ders: "Rehberlik ve Yönlendirme", saat: 2, kategori: "REHBERLİK", atananBrans: "Özel Eğitim", baraj_ders: false, isAtolye: false }
            ];
        }

        // 1. MTEGM (Mesleki ve Teknik Anadolu Liseleri - 69 Alan)
        const mtegmAlanlar = master?.okul_turleri_ve_cizelgeler?.mesleki_ve_teknik_egitim_mtegm?.alanlar || {};
        const areaData = areaId ? mtegmAlanlar[areaId] : null;
        const areaCode = this.AREA_BRANCH_MAP[areaId] || areaData?.alan_adi || (areaId ? areaId.replace(/_/g, ' ') : "Meslek");

        const addCourse = (item) => {
            if (!item || !item.ders) return;
            const rawName = String(item.ders).trim();
            if (this.isInvalidCourse(rawName)) return;

            const canonical = this.getCanonicalCourseAndBranch(rawName, item.atananBrans, areaCode, item.kategori || "ORTAK DERSLER");
            const cleanCourseName = canonical.courseName;
            const norm = this.normalizeName(cleanCourseName);
            
            // Rehberlik Tekilleştirme Güvencesi
            if (norm.includes("rehberlik")) {
                if (gStr === "12") return; // 12. sınıfta PDR/Rehberlik dersi yok
                if (seenNorms.has("rehberlik") || seenNorms.has("rehberlikveyonlendirme")) return;
                seenNorms.add("rehberlik");
                seenNorms.add("rehberlikveyonlendirme");
                result.push({
                    ders: "Rehberlik ve Yönlendirme",
                    saat: 1,
                    kategori: "ORTAK DERSLER",
                    atananBrans: "Rehberlik",
                    baraj_ders: false,
                    isAtolye: false
                });
                return;
            }

            if (seenNorms.has(norm)) return;
            seenNorms.add(norm);

            const hours = item.saat || this.parseCourseHours(item, gStr) || 2;
            const category = item.kategori || "ORTAK DERSLER";
            const assigned = canonical.branchName;

            let isBaraj = !!item.baraj_ders;
            if (norm.includes("turkdili") || norm.includes("turkce")) isBaraj = true;
            if (gStr === "12" && (norm.includes("isletmelerde") || norm.includes("staj"))) isBaraj = true;

            const isAtolye = item.isAtolye !== undefined ? item.isAtolye : (
                norm.includes("atolye") || norm.includes("uygulama") || 
                norm.includes("laboratuvar") || norm.includes("isletmelerde")
            );

            result.push({
                ders: cleanCourseName,
                saat: hours,
                kategori: category,
                atananBrans: assigned,
                baraj_ders: isBaraj,
                isAtolye: isAtolye
            });
        };

        // 1.A MTEGM (Mesleki Eğitim Merkezi - MESEM / Çıraklık Eğitimi)
        if (schoolType.includes("mesleki_egitim_merkezi") || schoolType.includes("mesem")) {
            const mesemData = this.db?.masterData?.okul_turleri_ve_cizelgeler?.mesleki_egitim_merkezi_mesem?.alanlar || {};
            let targetArea = mesemData[areaId];
            if (!targetArea && areaId) {
                const cleanA = this.normalizeName(areaId);
                for (let k in mesemData) {
                    if (this.normalizeName(k).includes(cleanA) || cleanA.includes(this.normalizeName(k))) {
                        targetArea = mesemData[k];
                        break;
                    }
                }
            }

            let foundDalCourses = null;
            if (targetArea?.dallar) {
                const cleanDal = dalName ? this.normalizeName(dalName).replace('dali', '').replace('programi', '').trim() : "";
                for (let dKey in targetArea.dallar) {
                    const dalObj = targetArea.dallar[dKey];
                    const objDalName = this.normalizeName(dalObj.dal_adi || dKey);
                    if (!cleanDal || objDalName.includes(cleanDal) || cleanDal.includes(objDalName.replace('dali', '').trim())) {
                        const gradeCourses = dalObj.siniflar?.[gStr];
                        if (Array.isArray(gradeCourses) && gradeCourses.length > 0) {
                            foundDalCourses = gradeCourses;
                            break;
                        }
                    }
                }
                if (!foundDalCourses) {
                    const firstDal = Object.values(targetArea.dallar)[0];
                    if (firstDal?.siniflar?.[gStr]?.length > 0) {
                        foundDalCourses = firstDal.siniflar[gStr];
                    }
                }
            }

            if (foundDalCourses && foundDalCourses.length > 0) {
                for (let c of foundDalCourses) {
                    addCourse({
                        ders: c.ders,
                        saat: c.saat,
                        kategori: c.kategori,
                        atananBrans: c.atananBrans,
                        baraj_ders: !!c.baraj_ders,
                        isAtolye: !!c.isAtolye
                    });
                }
                return this.finalizeCourses(result, gStr, schoolType);
            }

            // Güvenlik Ağı / Fallback Standart MESEM Dersleri
            const vocAreas = this.db?.getVocationalAreas ? this.db.getVocationalAreas(schoolType) : [];
            const areaObj = vocAreas.find(a => a.id === areaId);
            const areaLabel = areaObj ? areaObj.name.replace(/\s*ALANI$/i, '') : "Meslek Alanı";
            const dalLabel = dalName || areaLabel;

            addCourse({ ders: "Türk Dili ve Edebiyatı", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true });
            addCourse({ ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi" });
            addCourse({ ders: "Matematik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Matematik" });

            if (gStr === "9") {
                addCourse({ ders: "Mesleki Gelişim", saat: 2, kategori: "ALAN / DAL DERSLERİ", atananBrans: areaLabel, isAtolye: true });
                addCourse({ ders: `${areaLabel} Temel Meslek Dersi`, saat: 4, kategori: "ALAN / DAL DERSLERİ", atananBrans: areaLabel, isAtolye: true });
                addCourse({ ders: "İşletmelerde Mesleki Eğitim (Çıraklık)", saat: 32, kategori: "İŞLETMELERDE MESLEKİ EĞİTİM", atananBrans: areaLabel, baraj_ders: true, isAtolye: true });
            } else if (gStr === "10") {
                addCourse({ ders: `${dalLabel} Meslek Dersi`, saat: 6, kategori: "ALAN / DAL DERSLERİ", atananBrans: areaLabel, isAtolye: true });
                addCourse({ ders: "İşletmelerde Mesleki Eğitim (Kalfalık Öncesi)", saat: 32, kategori: "İŞLETMELERDE MESLEKİ EĞİTİM", atananBrans: areaLabel, baraj_ders: true, isAtolye: true });
            } else if (gStr === "11") {
                addCourse({ ders: `${dalLabel} İleri Meslek Dersi`, saat: 6, kategori: "ALAN / DAL DERSLERİ", atananBrans: areaLabel, isAtolye: true });
                addCourse({ ders: "İşletmelerde Mesleki Eğitim (Kalfalık)", saat: 32, kategori: "İŞLETMELERDE MESLEKİ EĞİTİM", atananBrans: areaLabel, baraj_ders: true, isAtolye: true });
            } else if (gStr === "12") {
                addCourse({ ders: `${dalLabel} Ustalık Meslek Dersi`, saat: 6, kategori: "ALAN / DAL DERSLERİ", atananBrans: areaLabel, isAtolye: true });
                addCourse({ ders: "İşletmelerde Mesleki Eğitim (Ustalık)", saat: 32, kategori: "İŞLETMELERDE MESLEKİ EĞİTİM", atananBrans: areaLabel, baraj_ders: true, isAtolye: true });
            }

            return this.finalizeCourses(result, gStr, schoolType);
        }

        // 1.B Mesleki ve Teknik Anadolu Lisesi (AMP / ATP) ve Alan Kontrolü
        if ((schoolType.includes("meslek") || schoolType.includes("teknik") || areaId) && !schoolType.includes("ozel_egitim") && !schoolType.includes("ortaokul")) {

            // Sınıf Çizelgelerinden En Uygun Çizelgeyi Seç
            if (areaData?.siniflar?.[`sinif_${gStr}`]) {
                const cizelgeler = areaData.siniflar[`sinif_${gStr}`].haftalik_ders_cizelgeleri || [];
                
                // Kalite Puanlaması İle En Dolu ve Doğru Çizelgeyi Bul
                const validCandidates = [];
                for (let c of cizelgeler) {
                    let validCount = 0;
                    for (let d of (c.dersler || [])) {
                        const dname = String(d.ders || d.ders_adi || '').trim();
                        const normD = this.normalizeName(dname);
                        if (!this.isInvalidCourse(dname) && !normD.includes("rehberlik")) {
                            if (this.parseCourseHours(d, gStr) > 0) validCount++;
                        }
                    }
                    if (validCount > 0) validCandidates.push({ cizelge: c, count: validCount });
                }

                let targetSchedule = null;
                if (dalName && validCandidates.length > 0) {
                    const cleanDal = this.normalizeName(dalName).replace('dali', '').replace('programi', '');
                    const matched = validCandidates.filter(cand => {
                        const titleNorm = this.normalizeName(cand.cizelge.cizelge_basligi || '');
                        return titleNorm.includes(cleanDal) || (cleanDal.length >= 3 && titleNorm.includes(cleanDal.substring(0, 4)));
                    });
                    if (matched.length > 0) {
                        matched.sort((a, b) => b.count - a.count);
                        targetSchedule = matched[0].cizelge;
                    }
                }

                if (!targetSchedule && validCandidates.length > 0) {
                    validCandidates.sort((a, b) => b.count - a.count);
                    targetSchedule = validCandidates[0].cizelge;
                }

                if (targetSchedule?.dersler) {
                    let currentKat = "ORTAK DERSLER";
                    let pastOrtakTotal = false;

                    for (let d of targetSchedule.dersler) {
                        const rawKat = String(d.kategori || "").toUpperCase();
                        const rawDers = String(d.ders || d.ders_adi || "").trim();

                        if (this.isInvalidCourse(rawDers)) {
                            if (rawDers.toUpperCase() === "TOPLAM" || rawKat.includes("ORTAK DERS")) pastOrtakTotal = true;
                            continue;
                        }

                        if (rawKat.includes("MESLEK") || rawKat.includes("ALAN") || rawKat.includes("DAL") || pastOrtakTotal) {
                            currentKat = "ALAN / DAL DERSLERİ";
                        } else if (rawKat.includes("ORTAK")) {
                            currentKat = "ORTAK DERSLER";
                        }

                        const h = this.parseCourseHours(d, gStr);
                        if (h > 0) {
                            let isBaraj = !!d.baraj_ders;
                            const normD = this.normalizeName(rawDers);
                            if (normD.includes("turkdili") || normD.includes("turkce") || normD.includes("edebiyat")) {
                                isBaraj = true;
                            }
                            addCourse({
                                ders: rawDers,
                                saat: h,
                                kategori: currentKat,
                                atananBrans: d.atananBrans || this.resolveBranch(rawDers, areaCode, currentKat),
                                baraj_ders: isBaraj
                            });
                        }
                    }
                }
            }

            // GÜVENLİK AĞI: Ortak dersler eksikse TTKB Standart Ortaklarını ekle
            const TTKB_MTEGM_ORTAK = {
                '9': [
                    { ders: 'Türk Dili ve Edebiyatı', saat: 5, atananBrans: 'Türk Dili ve Edebiyatı', baraj_ders: true },
                    { ders: 'Din Kültürü ve Ahlak Bilgisi', saat: 2, atananBrans: 'Din Kültürü ve Ahlak Bilgisi', baraj_ders: false },
                    { ders: 'Tarih', saat: 2, atananBrans: 'Tarih', baraj_ders: false },
                    { ders: 'Coğrafya', saat: 2, atananBrans: 'Coğrafya', baraj_ders: false },
                    { ders: 'Matematik', saat: 5, atananBrans: 'Matematik', baraj_ders: false },
                    { ders: 'Fizik', saat: 2, atananBrans: 'Fizik', baraj_ders: false },
                    { ders: 'Kimya', saat: 2, atananBrans: 'Kimya', baraj_ders: false },
                    { ders: 'Biyoloji', saat: 2, atananBrans: 'Biyoloji', baraj_ders: false },
                    { ders: 'Birinci Yabancı Dil', saat: 4, atananBrans: 'İngilizce', baraj_ders: false },
                    { ders: 'Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik', saat: 2, atananBrans: 'Beden Eğitimi', baraj_ders: false }
                ],
                '10': [
                    { ders: 'Türk Dili ve Edebiyatı', saat: 5, atananBrans: 'Türk Dili ve Edebiyatı', baraj_ders: true },
                    { ders: 'Din Kültürü ve Ahlak Bilgisi', saat: 2, atananBrans: 'Din Kültürü ve Ahlak Bilgisi', baraj_ders: false },
                    { ders: 'Tarih', saat: 2, atananBrans: 'Tarih', baraj_ders: false },
                    { ders: 'Coğrafya', saat: 2, atananBrans: 'Coğrafya', baraj_ders: false },
                    { ders: 'Matematik', saat: 5, atananBrans: 'Matematik', baraj_ders: false },
                    { ders: 'Fizik', saat: 2, atananBrans: 'Fizik', baraj_ders: false },
                    { ders: 'Kimya', saat: 2, atananBrans: 'Kimya', baraj_ders: false },
                    { ders: 'Biyoloji', saat: 2, atananBrans: 'Biyoloji', baraj_ders: false },
                    { ders: 'Felsefe', saat: 2, atananBrans: 'Felsefe', baraj_ders: false },
                    { ders: 'Birinci Yabancı Dil', saat: 2, atananBrans: 'İngilizce', baraj_ders: false },
                    { ders: 'Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik', saat: 1, atananBrans: 'Beden Eğitimi', baraj_ders: false }
                ],
                '11': [
                    { ders: 'Türk Dili ve Edebiyatı', saat: 4, atananBrans: 'Türk Dili ve Edebiyatı', baraj_ders: true },
                    { ders: 'Din Kültürü ve Ahlak Bilgisi', saat: 2, atananBrans: 'Din Kültürü ve Ahlak Bilgisi', baraj_ders: false },
                    { ders: 'Tarih', saat: 2, atananBrans: 'Tarih', baraj_ders: false },
                    { ders: 'Felsefe', saat: 2, atananBrans: 'Felsefe', baraj_ders: false },
                    { ders: 'Birinci Yabancı Dil', saat: 2, atananBrans: 'İngilizce', baraj_ders: false },
                    { ders: 'Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik', saat: 2, atananBrans: 'Beden Eğitimi', baraj_ders: false },
                    { ders: 'Sağlık Bilgisi ve Trafik Kültürü', saat: 1, atananBrans: 'Sağlık Bilgisi ve Trafik Kültürü', baraj_ders: false }
                ],
                '12': [
                    { ders: 'Türk Dili ve Edebiyatı', saat: 4, atananBrans: 'Türk Dili ve Edebiyatı', baraj_ders: true },
                    { ders: 'Din Kültürü ve Ahlak Bilgisi', saat: 2, atananBrans: 'Din Kültürü ve Ahlak Bilgisi', baraj_ders: false },
                    { ders: 'T.C. İnkılap Tarihi ve Atatürkçülük', saat: 2, atananBrans: 'Tarih', baraj_ders: false },
                    { ders: 'Birinci Yabancı Dil', saat: 2, atananBrans: 'İngilizce', baraj_ders: false }
                ]
            };

            const ortakCount = result.filter(c => c.kategori === "ORTAK DERSLER").length;
            if (ortakCount < 3 && TTKB_MTEGM_ORTAK[gStr]) {
                for (let od of TTKB_MTEGM_ORTAK[gStr]) {
                    addCourse({ ...od, kategori: "ORTAK DERSLER" });
                }
            }

            // GÜVENLİK AĞI: Alan/Dal Atölye Derslerini Tamamla
            const isAtp = schoolType.includes("atp");
            const curHours = result.filter(c => c.kategori === "ALAN / DAL DERSLERİ").reduce((s, c) => s + c.saat, 0);

            if (curHours < 6) {
                const areaLabel = areaData?.alan_adi || this.AREA_BRANCH_MAP[areaId] || (areaId ? areaId.replace(/_/g, ' ') : "");
                const canonicalBranch = this.AREA_BRANCH_MAP[areaId] || areaData?.alan_adi || "";
                const dalLabel = dalName || areaLabel;
                const normDal = this.normalizeName(dalLabel);

                if (gStr === "9") {
                    addCourse({ ders: "Mesleki Gelişim Atölyesi", saat: 2, kategori: "ALAN / DAL DERSLERİ", atananBrans: canonicalBranch || "— Branş Atanmadı —", isAtolye: true });
                    if (areaId === "bilisim") {
                        addCourse({ ders: "Programlama Temelleri", saat: 4, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", baraj_ders: true, isAtolye: true });
                        addCourse({ ders: "Bilişim Teknolojilerinin Temelleri", saat: 3, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", isAtolye: true });
                        addCourse({ ders: "Bilgisayarlı Tasarım Uygulamaları", saat: 2, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", isAtolye: true });
                    } else if (areaLabel && areaLabel !== "Meslek") {
                        addCourse({ ders: `${areaLabel} Temel Meslek Atölyesi`, saat: 9, kategori: "ALAN / DAL DERSLERİ", atananBrans: canonicalBranch, isAtolye: true });
                    } else {
                        addCourse({ ders: "Temel Meslek Atölyesi", saat: 9, kategori: "ALAN / DAL DERSLERİ", atananBrans: "— Branş Atanmadı —", isAtolye: true });
                    }
                } else if (gStr === "10") {
                    if (areaId === "bilisim") {
                        addCourse({ ders: "Nesne Tabanlı Programlama", saat: 10, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", baraj_ders: true, isAtolye: true });
                        addCourse({ ders: "Robotik ve Kodlama", saat: 3, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", isAtolye: true });
                    } else if (areaLabel && areaLabel !== "Meslek") {
                        addCourse({ ders: `${areaLabel} Meslek Atölyesi`, saat: 8, kategori: "ALAN / DAL DERSLERİ", atananBrans: canonicalBranch, isAtolye: true });
                        addCourse({ ders: `${areaLabel} Mesleki Çizim ve Tasarım`, saat: 5, kategori: "ALAN / DAL DERSLERİ", atananBrans: canonicalBranch, isAtolye: true });
                    } else {
                        addCourse({ ders: "Alan Meslek Atölyesi", saat: 8, kategori: "ALAN / DAL DERSLERİ", atananBrans: "— Branş Atanmadı —", isAtolye: true });
                        addCourse({ ders: "Mesleki Çizim ve Tasarım", saat: 5, kategori: "ALAN / DAL DERSLERİ", atananBrans: "— Branş Atanmadı —", isAtolye: true });
                    }
                } else if (gStr === "11") {
                    if (isAtp) {
                        if (areaId === "bilisim") {
                            addCourse({ ders: "Web Tabanlı Uygulama Geliştirme", saat: 9, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", baraj_ders: true, isAtolye: true });
                        } else {
                            addCourse({ ders: dalLabel ? `${dalLabel} Dal Atölyesi` : "Dal Meslek Atölyesi", saat: 9, kategori: "ALAN / DAL DERSLERİ", atananBrans: canonicalBranch || "— Branş Atanmadı —", isAtolye: true });
                        }
                    } else {
                        if (areaId === "bilisim") {
                            if (normDal.includes("ag") || normDal.includes("siber")) {
                                addCourse({ ders: "Ağ Sistemleri ve Yönlendirme", saat: 8, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", baraj_ders: true, isAtolye: true });
                                addCourse({ ders: "Siber Güvenlik Temelleri", saat: 5, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", isAtolye: true });
                                addCourse({ ders: "Sunucu İşletim Sistemleri", saat: 4, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", isAtolye: true });
                            } else {
                                addCourse({ ders: "Web Tabanlı Uygulama Geliştirme", saat: 8, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", baraj_ders: true, isAtolye: true });
                                addCourse({ ders: "Mobil Uygulamalar", saat: 5, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", isAtolye: true });
                                addCourse({ ders: "Grafik ve Canlandırma", saat: 4, kategori: "ALAN / DAL DERSLERİ", atananBrans: "Bilişim Teknolojileri", isAtolye: true });
                            }
                        } else {
                            addCourse({ ders: dalLabel ? `${dalLabel} Dal Atölyesi` : "Dal Meslek Atölyesi", saat: 10, kategori: "ALAN / DAL DERSLERİ", atananBrans: canonicalBranch || "— Branş Atanmadı —", isAtolye: true });
                            addCourse({ ders: dalLabel ? `${dalLabel} Uygulamaları` : "Mesleki Uygulamalar", saat: 7, kategori: "ALAN / DAL DERSLERİ", atananBrans: canonicalBranch || "— Branş Atanmadı —", isAtolye: true });
                        }
                    }
                }
            }

            if (gStr === "12") {
                if (isAtp) {
                    // ATP 12. Sınıf: 31 Saat Akademik Destek Bloğu (YKS Hazırlık) - Staj yazın 40 iş günü yapılır
                    addCourse({ ders: "Akademik Destek: Matematik", saat: 9, kategori: "AKADEMİK DESTEK DERSLERİ", atananBrans: "Matematik" });
                    addCourse({ ders: "Akademik Destek: Fizik", saat: 6, kategori: "AKADEMİK DESTEK DERSLERİ", atananBrans: "Fizik" });
                    addCourse({ ders: "Akademik Destek: Kimya", saat: 5, kategori: "AKADEMİK DESTEK DERSLERİ", atananBrans: "Kimya" });
                    addCourse({ ders: "Akademik Destek: Biyoloji", saat: 5, kategori: "AKADEMİK DESTEK DERSLERİ", atananBrans: "Biyoloji" });
                    addCourse({ ders: "Akademik Destek: Edebiyat", saat: 6, kategori: "AKADEMİK DESTEK DERSLERİ", atananBrans: "Türk Dili ve Edebiyatı" });
                } else {
                    // AMP 12. Sınıf: 24 Saat İşletmelerde Mesleki Eğitim (Staj)
                    addCourse({ ders: "İşletmelerde Mesleki Eğitim", saat: 24, kategori: "ALAN / DAL DERSLERİ", atananBrans: areaCode, baraj_ders: true, isAtolye: true });
                }
            } else {
                addCourse({ ders: "Rehberlik ve Yönlendirme", saat: 1, kategori: "ORTAK DERSLER", atananBrans: "Rehberlik" });
            }

            if (result.length > 0) return this.finalizeCourses(result, gStr, schoolType);
        }

        // 2. DÖGM (Anadolu İmam Hatip Liseleri)
        if (schoolType.includes("imam_hatip") && !schoolType.includes("ortaokulu")) {
            const TTKB_AIHL_STANDARDS = {
                "hazirlik": [
                    { ders: "Hazırlık Sınıfı Türk Dili ve Edebiyatı", saat: 4, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Kur'an-ı Kerim", saat: 3, atananBrans: "İHL Meslek Dersleri", baraj_ders: true },
                    { ders: "Arapça", saat: 7, atananBrans: "Arapça", baraj_ders: false },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 20, atananBrans: "İngilizce", baraj_ders: false },
                    { ders: "Hazırlık Sınıfı Matematik", saat: 3, atananBrans: "Matematik", baraj_ders: false },
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, atananBrans: "Bilişim Teknolojileri", baraj_ders: false },
                    { ders: "Beden Eğitimi ve Spor", saat: 1, atananBrans: "Beden Eğitimi", baraj_ders: false },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", baraj_ders: false }
                ],
                "9": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih", baraj_ders: false },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya", baraj_ders: false },
                    { ders: "Matematik", saat: 6, atananBrans: "Matematik", baraj_ders: false },
                    { ders: "Fizik", saat: 2, atananBrans: "Fizik", baraj_ders: false },
                    { ders: "Kimya", saat: 2, atananBrans: "Kimya", baraj_ders: false },
                    { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji", baraj_ders: false },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 5, atananBrans: "İngilizce", baraj_ders: false },
                    { ders: "Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik", saat: 2, atananBrans: "Beden Eğitimi", baraj_ders: false },
                    { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, atananBrans: "Sağlık Bilgisi ve Trafik Kültürü", baraj_ders: false },
                    { ders: "Kur'an-ı Kerim", saat: 5, atananBrans: "İHL Meslek Dersleri", baraj_ders: true },
                    { ders: "Arapça", saat: 4, atananBrans: "Arapça", baraj_ders: false },
                    { ders: "Temel Dini Bilgiler", saat: 1, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", baraj_ders: false }
                ],
                "10": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih", baraj_ders: false },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya", baraj_ders: false },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe", baraj_ders: false },
                    { ders: "Matematik", saat: 6, atananBrans: "Matematik", baraj_ders: false },
                    { ders: "Fizik", saat: 2, atananBrans: "Fizik", baraj_ders: false },
                    { ders: "Kimya", saat: 2, atananBrans: "Kimya", baraj_ders: false },
                    { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji", baraj_ders: false },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce", baraj_ders: false },
                    { ders: "Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik", saat: 1, atananBrans: "Beden Eğitimi", baraj_ders: false },
                    { ders: "Kur'an-ı Kerim", saat: 4, atananBrans: "İHL Meslek Dersleri", baraj_ders: true },
                    { ders: "Arapça", saat: 3, atananBrans: "Arapça", baraj_ders: false },
                    { ders: "Hadis", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "Fıkıh", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "Siyer", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", baraj_ders: false }
                ],
                "11": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih", baraj_ders: false },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe", baraj_ders: false },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce", baraj_ders: false },
                    { ders: "Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik", saat: 1, atananBrans: "Beden Eğitimi", baraj_ders: false },
                    { ders: "Kur'an-ı Kerim", saat: 4, atananBrans: "İHL Meslek Dersleri", baraj_ders: true },
                    { ders: "Mesleki Arapça", saat: 3, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "Tefsir", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "Akaid", saat: 1, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "Hitabet ve Mesleki Uygulama", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", baraj_ders: false }
                ],
                "12": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Tarih", baraj_ders: false },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce", baraj_ders: false },
                    { ders: "Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik", saat: 1, atananBrans: "Beden Eğitimi", baraj_ders: false },
                    { ders: "Kur'an-ı Kerim", saat: 3, atananBrans: "İHL Meslek Dersleri", baraj_ders: true },
                    { ders: "Mesleki Arapça", saat: 3, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "Dinler Tarihi", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "Kelam", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: false },
                    { ders: "İslam Kültür ve Medeniyeti", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: false }
                ]
            };

            const aihlList = TTKB_AIHL_STANDARDS[gStr] || TTKB_AIHL_STANDARDS["9"];
            for (let d of aihlList) {
                addCourse({ ...d, kategori: "ORTAK DERSLER" });
            }
            return this.finalizeCourses(result, gStr, schoolType);
        }

        // 3. İmam Hatip Ortaokulu (5-8)
        if (schoolType === "imam_hatip_ortaokulu") {
            const ihoSchedules = {
                "5": [
                    { ders: "Türkçe", saat: 6, atananBrans: "Türkçe", baraj_ders: true },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 3, atananBrans: "İngilizce" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Kur'an-ı Kerim", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: true },
                    { ders: "Peygamberimizin Hayatı", saat: 2, atananBrans: "İHL Meslek Dersleri" },
                    { ders: "Arapça", saat: 2, atananBrans: "Arapça" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik" },
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, atananBrans: "Bilişim Teknolojileri" }
                ],
                "6": [
                    { ders: "Türkçe", saat: 6, atananBrans: "Türkçe", baraj_ders: true },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 3, atananBrans: "İngilizce" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Kur'an-ı Kerim", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: true },
                    { ders: "Peygamberimizin Hayatı", saat: 2, atananBrans: "İHL Meslek Dersleri" },
                    { ders: "Arapça", saat: 2, atananBrans: "Arapça" },
                    { ders: "Temel Dini Bilgiler", saat: 1, atananBrans: "İHL Meslek Dersleri" },
                    { ders: "Beden Eğitimi ve Spor", saat: 1, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik" },
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, atananBrans: "Bilişim Teknolojileri" }
                ],
                "7": [
                    { ders: "Türkçe", saat: 5, atananBrans: "Türkçe", baraj_ders: true },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Kur'an-ı Kerim", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: true },
                    { ders: "Peygamberimizin Hayatı", saat: 2, atananBrans: "İHL Meslek Dersleri" },
                    { ders: "Arapça", saat: 2, atananBrans: "Arapça" },
                    { ders: "Temel Dini Bilgiler", saat: 1, atananBrans: "İHL Meslek Dersleri" },
                    { ders: "Beden Eğitimi ve Spor", saat: 1, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik" },
                    { ders: "Teknoloji ve Tasarım", saat: 2, atananBrans: "Teknoloji ve Tasarım" }
                ],
                "8": [
                    { ders: "Türkçe", saat: 5, atananBrans: "Türkçe", baraj_ders: true },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri" },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Sosyal Bilgiler" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Kur'an-ı Kerim", saat: 2, atananBrans: "İHL Meslek Dersleri", baraj_ders: true },
                    { ders: "Peygamberimizin Hayatı", saat: 2, atananBrans: "İHL Meslek Dersleri" },
                    { ders: "Arapça", saat: 2, atananBrans: "Arapça" },
                    { ders: "Rehberlik ve Kariyer Planlama", saat: 1, atananBrans: "Rehberlik" },
                    { ders: "Beden Eğitimi ve Spor", saat: 1, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik" },
                    { ders: "Teknoloji ve Tasarım", saat: 2, atananBrans: "Teknoloji ve Tasarım" }
                ]
            };
            const list = ihoSchedules[gStr] || ihoSchedules["5"];
            for (let d of list) addCourse({ ...d, kategori: "ORTAK DERSLER" });
            return this.finalizeCourses(result, gStr, schoolType);
        }

        // 4. Ortaokul (Temel Eğitim 5-8)
        if (schoolType === "ortaokul_temel_egitim" || ["5", "6", "7", "8"].includes(gStr)) {
            const ortaokulSchedules = {
                "5": [
                    { ders: "Türkçe", saat: 6, atananBrans: "Türkçe", baraj_ders: true },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 3, atananBrans: "İngilizce" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik" },
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, atananBrans: "Bilişim Teknolojileri" }
                ],
                "6": [
                    { ders: "Türkçe", saat: 6, atananBrans: "Türkçe", baraj_ders: true },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 3, atananBrans: "İngilizce" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik" },
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, atananBrans: "Bilişim Teknolojileri" }
                ],
                "7": [
                    { ders: "Türkçe", saat: 5, atananBrans: "Türkçe", baraj_ders: true },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri" },
                    { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik" },
                    { ders: "Teknoloji ve Tasarım", saat: 2, atananBrans: "Teknoloji ve Tasarım" }
                ],
                "8": [
                    { ders: "Türkçe", saat: 5, atananBrans: "Türkçe", baraj_ders: true },
                    { ders: "Matematik", saat: 5, atananBrans: "Matematik" },
                    { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri" },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Sosyal Bilgiler" },
                    { ders: "Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar" },
                    { ders: "Müzik", saat: 1, atananBrans: "Müzik" },
                    { ders: "Teknoloji ve Tasarım", saat: 2, atananBrans: "Teknoloji ve Tasarım" },
                    { ders: "Rehberlik ve Kariyer Planlama", saat: 1, atananBrans: "Rehberlik" }
                ]
            };
            const list = ortaokulSchedules[gStr] || ortaokulSchedules["5"];
            for (let d of list) addCourse({ ...d, kategori: "ORTAK DERSLER" });
            return this.finalizeCourses(result, gStr, schoolType);
        }

        // 4.5. Özel Eğitim Meslek Okulu (Hafif Düzey)
        if (schoolType === "ozel_egitim_meslek_okulu") {
            const ozelEgitimMeslekSchedules = {
                "9": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 4, atananBrans: "Özel Eğitim", baraj_ders: true },
                    { ders: "Matematik", saat: 3, atananBrans: "Özel Eğitim" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Sosyal Hayat", saat: 2, atananBrans: "Özel Eğitim" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Mesleki Gelişim Atölyesi", saat: 2, atananBrans: "Özel Eğitim", isAtolye: true },
                    { ders: "Temel Meslek Atölyesi", saat: 12, atananBrans: "Özel Eğitim", isAtolye: true },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "10": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 4, atananBrans: "Özel Eğitim", baraj_ders: true },
                    { ders: "Matematik", saat: 3, atananBrans: "Özel Eğitim" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Sosyal Hayat", saat: 2, atananBrans: "Özel Eğitim" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Alan Meslek Atölyesi", saat: 15, atananBrans: "Özel Eğitim", isAtolye: true },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "11": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 3, atananBrans: "Özel Eğitim", baraj_ders: true },
                    { ders: "Matematik", saat: 2, atananBrans: "Özel Eğitim" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Sosyal Hayat", saat: 2, atananBrans: "Özel Eğitim" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Dal Meslek Atölyesi", saat: 18, atananBrans: "Özel Eğitim", isAtolye: true },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "12": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 3, atananBrans: "Özel Eğitim", baraj_ders: true },
                    { ders: "Matematik", saat: 2, atananBrans: "Özel Eğitim" },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "İşletmelerde Mesleki Eğitim", saat: 24, atananBrans: "Özel Eğitim", isAtolye: true }
                ]
            };
            const list = ozelEgitimMeslekSchedules[gStr] || ozelEgitimMeslekSchedules["9"];
            for (let d of list) addCourse(d);
            return this.finalizeCourses(result, gStr, schoolType);
        }

        // 5. OGM (Anadolu, Fen, Sosyal Bilimler, GSL, Spor) - CANONICAL TTKB STANDARDS
        const TTKB_OGM_STANDARDS = {
            "anadolu_lisesi": {
                "hazirlik": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 4, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 24, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 4, atananBrans: "Almanca" },
                    { ders: "Matematik", saat: 3, atananBrans: "Matematik" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 1, atananBrans: "Bilişim Teknolojileri" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "9": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Matematik", saat: 6, atananBrans: "Matematik" },
                    { ders: "Fizik", saat: 2, atananBrans: "Fizik" },
                    { ders: "Kimya", saat: 2, atananBrans: "Kimya" },
                    { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, atananBrans: "Sağlık Bilgisi ve Trafik Kültürü" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "10": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Matematik", saat: 6, atananBrans: "Matematik" },
                    { ders: "Fizik", saat: 2, atananBrans: "Fizik" },
                    { ders: "Kimya", saat: 2, atananBrans: "Kimya" },
                    { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "11": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "12": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Tarih" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor / Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Beden Eğitimi" }
                ]
            },
            "fen_lisesi": {
                "hazirlik": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 4, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 24, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 4, atananBrans: "Almanca" },
                    { ders: "Matematik", saat: 3, atananBrans: "Matematik" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Bilgisayar Bilimi", saat: 1, atananBrans: "Bilişim Teknolojileri" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "9": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Fen Lisesi Matematik", saat: 6, atananBrans: "Matematik" },
                    { ders: "Fen Lisesi Fizik", saat: 2, atananBrans: "Fizik" },
                    { ders: "Fen Lisesi Kimya", saat: 2, atananBrans: "Kimya" },
                    { ders: "Fen Lisesi Biyoloji", saat: 2, atananBrans: "Biyoloji" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, atananBrans: "Sağlık Bilgisi ve Trafik Kültürü" },
                    { ders: "Bilgisayar Bilimi", saat: 2, atananBrans: "Bilişim Teknolojileri" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "10": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Fen Lisesi Matematik", saat: 6, atananBrans: "Matematik" },
                    { ders: "Fen Lisesi Fizik", saat: 2, atananBrans: "Fizik" },
                    { ders: "Fen Lisesi Kimya", saat: 2, atananBrans: "Kimya" },
                    { ders: "Fen Lisesi Biyoloji", saat: 2, atananBrans: "Biyoloji" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Bilgisayar Bilimi", saat: 2, atananBrans: "Bilişim Teknolojileri" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "11": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Fen Lisesi Matematik", saat: 6, atananBrans: "Matematik" },
                    { ders: "Fen Lisesi Fizik", saat: 4, atananBrans: "Fizik" },
                    { ders: "Fen Lisesi Kimya", saat: 4, atananBrans: "Kimya" },
                    { ders: "Fen Lisesi Biyoloji", saat: 4, atananBrans: "Biyoloji" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "12": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Tarih" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor / Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Fen Lisesi Matematik", saat: 6, atananBrans: "Matematik" },
                    { ders: "Fen Lisesi Fizik", saat: 4, atananBrans: "Fizik" },
                    { ders: "Fen Lisesi Kimya", saat: 4, atananBrans: "Kimya" },
                    { ders: "Fen Lisesi Biyoloji", saat: 4, atananBrans: "Biyoloji" }
                ]
            },
            "sosyal_bilimler_lisesi": {
                "hazirlik": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 4, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 24, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 4, atananBrans: "Almanca" },
                    { ders: "Matematik", saat: 3, atananBrans: "Matematik" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Bilişim Teknolojileri ve Yazılım", saat: 1, atananBrans: "Bilişim Teknolojileri" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "9": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Matematik", saat: 6, atananBrans: "Matematik" },
                    { ders: "Fizik", saat: 2, atananBrans: "Fizik" },
                    { ders: "Kimya", saat: 2, atananBrans: "Kimya" },
                    { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, atananBrans: "Sağlık Bilgisi ve Trafik Kültürü" },
                    { ders: "Sosyal Bilim Çalışmaları", saat: 2, atananBrans: "Tarih" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "10": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Matematik", saat: 6, atananBrans: "Matematik" },
                    { ders: "Fizik", saat: 2, atananBrans: "Fizik" },
                    { ders: "Kimya", saat: 2, atananBrans: "Kimya" },
                    { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Sosyal Bilim Çalışmaları", saat: 2, atananBrans: "Tarih" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "11": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Sosyoloji", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Mantık", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Edebiyat Metinleri", saat: 3, atananBrans: "Türk Dili ve Edebiyatı" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "12": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Tarih" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "İkinci Yabancı Dil (Almanca)", saat: 2, atananBrans: "Almanca" },
                    { ders: "Beden Eğitimi ve Spor / Görsel Sanatlar / Müzik", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Psikoloji", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Sanat Tarihi", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Çağdaş Türk ve Dünya Tarihi", saat: 4, atananBrans: "Tarih" }
                ]
            },
            "guzel_sanatlar_gorsel": {
                "9": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Matematik", saat: 2, atananBrans: "Matematik" },
                    { ders: "Fizik", saat: 2, atananBrans: "Fizik" },
                    { ders: "Kimya", saat: 2, atananBrans: "Kimya" },
                    { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, atananBrans: "Sağlık Bilgisi ve Trafik Kültürü" },
                    { ders: "Desen", saat: 4, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "Genel Sanat Tarihi", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Temel Sanat Eğitimi", saat: 4, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "İki Boyutlu Sanat Atölye", saat: 2, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "10": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Desen", saat: 4, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "İki Boyutlu Sanat Atölye", saat: 4, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "Üç Boyutlu Sanat Atölye", saat: 4, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "Sanat Eserleri İnceleme", saat: 2, atananBrans: "Görsel Sanatlar" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "11": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce" },
                    { ders: "Desen", saat: 4, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "İki Boyutlu Sanat Atölye", saat: 6, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "Üç Boyutlu Sanat Atölye", saat: 4, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "Grafik Tasarım", saat: 2, atananBrans: "Grafik ve Fotoğraf", isAtolye: true },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "12": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Tarih" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce" },
                    { ders: "Desen", saat: 4, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "İki Boyutlu Sanat Atölye", saat: 6, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "Üç Boyutlu Sanat Atölye", saat: 4, atananBrans: "Görsel Sanatlar", isAtolye: true },
                    { ders: "Çağdaş Dünya Sanatı Tarihi", saat: 2, atananBrans: "Görsel Sanatlar" }
                ]
            },
            "guzel_sanatlar_muzik": {
                "9": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Matematik", saat: 2, atananBrans: "Matematik" },
                    { ders: "Fizik", saat: 2, atananBrans: "Fizik" },
                    { ders: "Kimya", saat: 2, atananBrans: "Kimya" },
                    { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, atananBrans: "Sağlık Bilgisi ve Trafik Kültürü" },
                    { ders: "Müziksel İşitme Okuma ve Yazma", saat: 4, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Çalgı Eğitimi", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Bireysel Ses Eğitimi", saat: 1, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Koro Eğitimi", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Türk Sanat Müziği Koro", saat: 1, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "10": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Müziksel İşitme Okuma ve Yazma", saat: 4, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Çalgı Eğitimi", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Koro Eğitimi", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Türk Halk Müziği Koro", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Müzik Tarihi", saat: 2, atananBrans: "Müzik" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "11": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce" },
                    { ders: "Müziksel İşitme Okuma ve Yazma", saat: 4, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Çalgı Eğitimi", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Piyano Eğitimi", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Koro Eğitimi", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Bilişim Destekli Müzik", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Türk Sanat Müziği Teori ve Uygulama", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "12": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Tarih" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce" },
                    { ders: "Müziksel İşitme Okuma ve Yazma", saat: 4, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Çalgı Eğitimi", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Piyano Eğitimi", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Koro Eğitimi", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Türk Halk Müziği Teori ve Uygulama", saat: 2, atananBrans: "Müzik", isAtolye: true },
                    { ders: "Müzik Biçimleri", saat: 2, atananBrans: "Müzik" }
                ]
            },
            "spor_lisesi": {
                "9": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Matematik", saat: 2, atananBrans: "Matematik" },
                    { ders: "Fizik", saat: 2, atananBrans: "Fizik" },
                    { ders: "Kimya", saat: 2, atananBrans: "Kimya" },
                    { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, atananBrans: "Sağlık Bilgisi ve Trafik Kültürü" },
                    { ders: "Temel Spor Eğitimi", saat: 4, atananBrans: "Beden Eğitimi", isAtolye: true },
                    { ders: "Genel Cimnastik", saat: 2, atananBrans: "Beden Eğitimi", isAtolye: true },
                    { ders: "Atletizm", saat: 3, atananBrans: "Beden Eğitimi", isAtolye: true },
                    { ders: "Takım Sporları", saat: 2, atananBrans: "Beden Eğitimi", isAtolye: true },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "10": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 4, atananBrans: "İngilizce" },
                    { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Bireysel Sporlar", saat: 4, atananBrans: "Beden Eğitimi", isAtolye: true },
                    { ders: "Takım Sporları", saat: 4, atananBrans: "Beden Eğitimi", isAtolye: true },
                    { ders: "Spor Anatomisi ve Fizyolojisi", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Spor ve Beslenme", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "11": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
                    { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce" },
                    { ders: "Bireysel Sporlar", saat: 6, atananBrans: "Beden Eğitimi", isAtolye: true },
                    { ders: "Takım Sporları", saat: 6, atananBrans: "Beden Eğitimi", isAtolye: true },
                    { ders: "Antrenman Bilgisi", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Spor Kazalarından Korunma ve Rehabilitasyon", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" }
                ],
                "12": [
                    { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
                    { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" },
                    { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, atananBrans: "Tarih" },
                    { ders: "Birinci Yabancı Dil (İngilizce)", saat: 2, atananBrans: "İngilizce" },
                    { ders: "Bireysel Sporlar", saat: 6, atananBrans: "Beden Eğitimi", isAtolye: true },
                    { ders: "Takım Sporları", saat: 6, atananBrans: "Beden Eğitimi", isAtolye: true },
                    { ders: "Spor Yönetimi ve Organizasyon", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Sporda Beceri Öğrenimi", saat: 2, atananBrans: "Beden Eğitimi" },
                    { ders: "Spor Masajı", saat: 2, atananBrans: "Beden Eğitimi" }
                ]
            }
        };

        // Normalize schoolType for canonical lookup
        let resolvedOgmKey = "anadolu_lisesi";
        if (schoolType.includes("fen")) resolvedOgmKey = "fen_lisesi";
        else if (schoolType.includes("sosyal")) resolvedOgmKey = "sosyal_bilimler_lisesi";
        else if (schoolType.includes("gorsel") || schoolType.includes("tiyatro")) resolvedOgmKey = "guzel_sanatlar_gorsel";
        else if (schoolType.includes("muzik") || schoolType.includes("turk_muzigi")) resolvedOgmKey = "guzel_sanatlar_muzik";
        else if (schoolType.includes("spor")) resolvedOgmKey = "spor_lisesi";
        else if (schoolType.includes("anadolu")) resolvedOgmKey = "anadolu_lisesi";

        const ogmSchedule = TTKB_OGM_STANDARDS[resolvedOgmKey]?.[gStr] || TTKB_OGM_STANDARDS["anadolu_lisesi"]?.[gStr];
        if (ogmSchedule) {
            for (let d of ogmSchedule) {
                addCourse({ ...d, kategori: "ORTAK DERSLER" });
            }
            return this.finalizeCourses(result, gStr, schoolType);
        }

        // 6. Son Çare Güvenli Fallback
        const fallbackCourses = [
            { ders: "Türk Dili ve Edebiyatı", saat: 5, kategori: "ORTAK DERSLER", atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true },
            { ders: "Matematik", saat: 6, kategori: "ORTAK DERSLER", atananBrans: "Matematik", baraj_ders: false },
            { ders: "Tarih", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Tarih", baraj_ders: false },
            { ders: "Coğrafya", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Coğrafya", baraj_ders: false },
            { ders: "Fizik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Fizik", baraj_ders: false },
            { ders: "Kimya", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Kimya", baraj_ders: false },
            { ders: "Biyoloji", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Biyoloji", baraj_ders: false },
            { ders: "Birinci Yabancı Dil", saat: 4, kategori: "ORTAK DERSLER", atananBrans: "İngilizce", baraj_ders: false },
            { ders: "İkinci Yabancı Dil", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Almanca", baraj_ders: false },
            { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false },
            { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false },
            { ders: "Görsel Sanatlar / Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Görsel Sanatlar", baraj_ders: false },
            { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, kategori: "ORTAK DERSLER", atananBrans: "Sağlık Bilgisi ve Trafik Kültürü", baraj_ders: false }
        ];

        for (let d of fallbackCourses) addCourse(d);
        return this.finalizeCourses(result, gStr, schoolType);
    }

    // --- UNIVERSAL MEB REHBERLİK & MÜFREDAT KORUMA MOTORU ---
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

import { STRICT_PDF_CURRICULUM_DB } from './strict_pdf_curriculum_db.js';
import { MESEM_CURRICULUM_DB } from './mesem_curriculum_db.js';
// MEB Master Veri Tabanı Yükleyici ve Veri Köprüsü Modülü
// Bu modül, 69 Meslek Alanı, 21 OGM Çizelgesi, DÖGM Çizelgeleri, 2.662 Seçmeli Dersi ve 47 Branş Matrisini yönetir.

export class MebDatabaseService {
    constructor() {
        this.masterData = null;
        this.isLoaded = false;
        this.STORAGE_KEY_DB = "MEB_NORM_CUSTOM_DB_V1";
    }

    async loadDatabase() {
        // 1. Kullanıcının sonradan yüklediği güncel veri tabanı var mı?
        const customDb = (typeof localStorage !== 'undefined') ? localStorage.getItem(this.STORAGE_KEY_DB) : null;
        if (customDb) {
            try {
                this.masterData = JSON.parse(customDb);
                this.isLoaded = true;
                console.log("MEB Master DB localStorage üzerinden güncel versiyon ile yüklendi.");
                return this.masterData;
            } catch (e) {
                console.warn("Kayıtlı özel DB okunamadı, varsayılanlara dönülüyor...", e);
            }
        }

        // 2. Fetch ile meb_master_db.json yükle
        try {
            const response = await fetch('./data/meb_master_db.json');
            if (response.ok) {
                this.masterData = await response.json();
                this.isLoaded = true;
                console.log("MEB Master DB başarıyla yüklendi (fetch).");
                return this.masterData;
            }
        } catch (e) {
            console.warn("Fetch üzerinden yüklenemedi, window.MEB_EMBEDDED_DATA kontrol ediliyor...", e);
        }

        // 3. Embedded Data Fallback (file:// protokolü ve offline çalışma için tam destek)
        const embeddedData = (typeof window !== 'undefined' ? (window.MEB_MASTER_DATABASE || window.MEB_EMBEDDED_DATA) : null);
        if (embeddedData) {
            this.masterData = embeddedData;
            this.isLoaded = true;
            console.log("MEB Master DB gömülü veri (embedded) üzerinden başarıyla yüklendi.");
            return this.masterData;
        }

        // 4. Strict PDF Veritabanı Otomatik Sentezleyici (%100 Bağımsız file:// Çevrimdışı Modu)
        const strictDb = (typeof window !== 'undefined' && window.STRICT_PDF_CURRICULUM_DB) || (typeof STRICT_PDF_CURRICULUM_DB !== 'undefined' ? STRICT_PDF_CURRICULUM_DB : null);
        if (strictDb) {
            this.masterData = {
                proje_meta: { version: "2026-2027", engine: "STRICT_PDF_IN_MEMORY" },
                okul_turleri_ve_cizelgeler: {
                    mesleki_ve_teknik_egitim_mtegm: {
                        alanlar: strictDb
                    }
                },
                norm_ve_ders_yuku_hesaplama_motoru: {
                    brans_ders_eslestirme_matrisi: {},
                    meb_norm_kadro_esas_dersler_ve_yan_alan_matrisi: { branslar: {} }
                }
            };
            this.isLoaded = true;
            console.log("MEB Master DB, STRICT_PDF_CURRICULUM_DB üzerinden başarıyla sentezlendi (file:// Çevrimdışı Mod).");
            return this.masterData;
        }

        // NOT: Eskiden bu mesajda js/embedded_data.js de anılıyordu. O dosya 2026-08-22'de
        // ölü kod olarak arşivlendi (_arsiv_olu_dosyalar/); artık hiçbir yerden yüklenmiyor.
        throw new Error("Master veri tabanı yüklenemedi. Lütfen data/meb_master_db.json dosyasını kontrol edin.");
    }

    /**
     * Kullanıcının Gelecek Yıl Yeni MEB Veri Tabanı Yüklemesini Sağlar
     * @param {string|object} newDbContent - Yüklenen JSON içeriği
     */
    updateDatabaseFromJSON(newDbContent) {
        try {
            const parsed = typeof newDbContent === "string" ? JSON.parse(newDbContent) : newDbContent;
            if (!parsed.okul_turleri_ve_cizelgeler || !parsed.norm_ve_ders_yuku_hesaplama_motoru) {
                throw new Error("Geçersiz MEB Veri Tabanı Formatı. Gerekli kök düğümler bulunamadı.");
            }
            this.masterData = parsed;
            localStorage.setItem(this.STORAGE_KEY_DB, JSON.stringify(parsed));
            this.isLoaded = true;
            return true;
        } catch (e) {
            console.error("Veri tabanı güncelleme hatası:", e);
            return false;
        }
    }

    resetToDefaultDatabase() {
        localStorage.removeItem(this.STORAGE_KEY_DB);
        const embedded = window.MEB_MASTER_DATABASE || window.MEB_EMBEDDED_DATA;
        if (embedded) {
            this.masterData = embedded;
        }
    }

    getSchoolTypes() {
        // NOT: Meslek lisesi (AMP) ve Anadolu Teknik Programı'nda hazırlık
        // sınıfı, AYRI BİR OKUL TÜRÜ olarak değil, mevcut türün sınıf
        // listesine eklenerek tanımlandı (TTKB Sayı 63, 16/07/2026).
        // Gerekçe: lise tarafında hazırlıklı/hazırlıksız ayrı türler var ve
        // kullanıcı bunu kaçırdı — "Anadolu Lisesi" seçip 4 sekme görünce
        // hazırlığın hiç olmadığını sandı. Sekmenin hep görünmesi,
        // hazırlığı olmayan okul için yalnızca kullanılmayan bir sekmedir;
        // kaçırılması ise imkânsızdır.
        return [
            { id: "anadolu_lisesi", name: "Anadolu Lisesi", category: "OGM", gradeLevels: ["9", "10", "11", "12"] },
            { id: "hazirlik_anadolu_lisesi", name: "Hazırlık Sınıfı Bulunan Anadolu Lisesi", category: "OGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"] },
            { id: "fen_lisesi", name: "Fen Lisesi", category: "OGM", gradeLevels: ["9", "10", "11", "12"] },
            { id: "hazirlik_fen_lisesi", name: "Hazırlık Sınıfı Bulunan Fen Lisesi", category: "OGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"] },
            { id: "sosyal_bilimler_lisesi", name: "Sosyal Bilimler Lisesi", category: "OGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"] },
            // hasAreas: bu okullarda "alan" değil TEMA seçilir (Bilişim
            // Teknolojileri ve Yazılım / Havacılık ve Uzay Teknolojileri /
            // Temel Bilimler). Aynı alan seçme kutusu kullanılıyor; etiketi
            // temaAdi ile değişiyor. 28.08.2026'ya kadar seçim yoktu ve bu
            // okulların 47 tematik dersi hiçbir şubede görünmüyordu.
            { id: "ozel_program_fen_lisesi", name: "Özel Program Uygulayan Fen Lisesi (Proje)", category: "OGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"], hasAreas: true, temaAdi: "Okulun Teması" },
            { id: "ozel_program_sosyal_lisesi", name: "Özel Program Uygulayan Sosyal Bilimler Lisesi (Proje)", category: "OGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"] },
            { id: "mesleki_ve_teknik_anadolu_lisesi", name: "Mesleki ve Teknik Anadolu Lisesi (AMP)", category: "MTEGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"], hasAreas: true },
            { id: "anadolu_teknik_programi", name: "Anadolu Teknik Programı (ATP)", category: "MTEGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"], hasAreas: true },
            { id: "mesleki_egitim_merkezi", name: "Mesleki Eğitim Merkezi (MESEM - Çıraklık / Kalfalık / Ustalık)", category: "MTEGM", gradeLevels: ["9", "10", "11", "12"], hasAreas: true },
            { id: "guzel_sanatlar_muzik", name: "Güzel Sanatlar Lisesi (Müzik)", category: "OGM", gradeLevels: ["9", "10", "11", "12"] },
            { id: "guzel_sanatlar_gorsel", name: "Güzel Sanatlar Lisesi (Görsel Sanatlar)", category: "OGM", gradeLevels: ["9", "10", "11", "12"] },
            { id: "guzel_sanatlar_tiyatro", name: "Güzel Sanatlar Lisesi (Tiyatro)", category: "OGM", gradeLevels: ["9", "10", "11", "12"] },
            { id: "guzel_sanatlar_turk_muzigi", name: "Güzel Sanatlar Lisesi (Türk Müziği)", category: "OGM", gradeLevels: ["9", "10", "11", "12"] },
            { id: "spor_lisesi", name: "Spor Lisesi", category: "OGM", gradeLevels: ["9", "10", "11", "12"] },
            { id: "anadolu_imam_hatip_lisesi", name: "Anadolu İmam Hatip Lisesi", category: "DÖGM", gradeLevels: ["9", "10", "11", "12"], hasSpecialPrograms: true },
            { id: "hazirlik_imam_hatip_lisesi", name: "Hazırlık Sınıfı Bulunan Anadolu İmam Hatip Lisesi", category: "DÖGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"], hasSpecialPrograms: true },
            { id: "imam_hatip_ortaokulu", name: "İmam Hatip Ortaokulu (İHO)", category: "DÖGM", gradeLevels: ["5", "6", "7", "8"] },
            { id: "ortaokul_temel_egitim", name: "Ortaokul (Genel Temel Eğitim)", category: "TEMEL_EGITIM", gradeLevels: ["5", "6", "7", "8"] },
            { id: "meslek_ortaokulu", name: "Meslek Ortaokulu (Zanaat Atölyeleri)", category: "MTEGM", gradeLevels: ["5", "6", "7", "8"] },
            { id: "ozel_egitim_meslek_okulu", name: "Özel Eğitim Meslek Okulu (Hafif Düzey)", category: "ÖZEL_EĞİTİM", gradeLevels: ["9", "10", "11", "12"] },
            { id: "ozel_egitim_uygulama_okulu", name: "Özel Eğitim Uygulama Okulu (I, II, III. Kademe)", category: "ÖZEL_EĞİTİM", gradeLevels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] }
        ];
    }

    getVocationalAreas(schoolType = "") {
        // ÖZEL PROGRAM LİSELERİ: burada seçilen şey meslek alanı değil, okulun
        // TEMASI. Aynı kutuyu kullanıyoruz çünkü mekanizma birebir aynı:
        // şubeye bir kimlik yazılır, müfredat ona göre gelir. Liste tema
        // tablosundan okunur; elle yazılmaz.
        const temaTablosu = (typeof OZEL_PROGRAM_TEMALARI !== 'undefined')
            ? OZEL_PROGRAM_TEMALARI
            : ((typeof window !== 'undefined' && window.OZEL_PROGRAM_TEMALARI)
                ? window.OZEL_PROGRAM_TEMALARI : null);
        const temalar = temaTablosu ? temaTablosu[String(schoolType || "")] : null;
        if (temalar && temalar.temalar && temalar.temalar.length) {
            return temalar.temalar.map(t => ({ id: t.id, name: t.ad }));
        }

        const isMesem = String(schoolType || "").includes("mesleki_egitim_merkezi") || String(schoolType || "").includes("mesem");

        // MESEM alanları kendi veri tabanından gelir (js/mesem_curriculum_db.js).
        // Bu blok masterData KONTROLÜNDEN ÖNCEDİR ve bilerek öyledir: MESEM
        // listesi meb_master_db.json'a hiç bakmaz, dolayısıyla o dosya
        // yüklenmemişken de (çevrimdışı ilk açılış) alan listesi dolu gelir.
        // Eskiden masterData.okul_turleri_ve_cizelgeler.mesleki_egitim_merkezi_mesem
        // okunuyordu; O ANAHTAR meb_master_db.json içinde HİÇ YOKTU, bu yüzden
        // liste her zaman MTEGM alanlarına düşüyordu ve mesleki eğitim merkezi
        // için meslek lisesi alanları listeleniyordu.
        if (isMesem) {
            const mesemDb = (typeof MESEM_CURRICULUM_DB !== 'undefined') ? MESEM_CURRICULUM_DB : ((typeof window !== 'undefined' && window.MESEM_CURRICULUM_DB) ? window.MESEM_CURRICULUM_DB : null);
            if (mesemDb) {
                return Object.keys(mesemDb)
                    .map(k => ({ id: k, name: mesemDb[k].gorunen_ad || mesemDb[k].alan_adi, data: mesemDb[k] }))
                    .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
            }
        }

        if (!this.masterData) return [];
        const targetAlanlar = this.masterData.okul_turleri_ve_cizelgeler?.mesleki_ve_teknik_egitim_mtegm?.alanlar || {};

        const CANONICAL_ALAN_NAMES = {
            'adalet': 'Adalet Alanı',
            'aile': 'Aile ve Tüketici Hizmetleri Alanı',
            'sh': 'Aile ve Tüketici Hizmetleri Alanı',
            'ayakkabi': 'Ayakkabı ve Saraciye Teknolojisi Alanı',
            'ayakkabipro': 'Ayakkabı ve Saraciye Teknolojisi Alanı',
            'basim': 'Basım Teknolojileri Alanı',
            'matbaa': 'Basım Teknolojileri Alanı',
            'bilisim': 'Bilişim Teknolojileri Alanı',
            'biyomedikal': 'Biyomedikal Cihaz Teknolojileri Alanı',
            'buro': 'Büro Yönetimi ve Yönetici Asistanlığı Alanı',
            'cocukgelisimi': 'Çocuk Gelişimi ve Eğitimi Alanı',
            'denizcilik': 'Denizcilik Alanı',
            'denizcilikpro': 'Denizcilik Alanı',
            'dogugastro': 'Doğu Anadolu Gastronomi ve Mutfak Sanatları Alanı',
            'elsanat': 'El Sanatları Teknolojisi Alanı',
            'elektrik': 'Elektrik-Elektronik Teknolojisi Alanı',
            'endkalite': 'Endüstriyel Kalite Kontrol Alanı',
            'endustriyel_kalite_kontrol': 'Endüstriyel Kalite Kontrol Alanı',
            'endustriyel': 'Endüstriyel Otomasyon Teknolojileri Alanı',
            'gazetecilik': 'Gazetecilik Alanı',
            'gazetecilikpro': 'Gazetecilik Alanı',
            'geleneksel': 'Geleneksel Türk Sanatları Alanı',
            'gemi': 'Gemi Yapımı Alanı',
            'gida': 'Gıda Teknolojisi Alanı',
            'grafik': 'Grafik ve Fotoğraf Alanı',
            'grafikpro': 'Grafik ve Fotoğraf Alanı',
            'guzellik': 'Güzellik Hizmetleri Alanı',
            'halklailiskiler': 'Halkla İlişkiler ve Organizasyon Alanı',
            'harita': 'Harita-Tapu-Kadastro Alanı',
            'hasta': 'Hasta ve Yaşlı Hizmetleri Alanı',
            'havacilik': 'Havacılık ve Uzay Teknolojisi Alanı',
            'havacilikveuzaypro': 'Havacılık ve Uzay Teknolojisi Alanı',
            'hayvanyetistiriciligi': 'Hayvan Yetiştiriciliği ve Sağlığı Alanı',
            'insaat': 'İnşaat Teknolojisi Alanı',
            'itfaiyecilik': 'İtfaiyecilik ve Yangın Güvenliği Alanı',
            'kimya': 'Kimya Teknolojisi Alanı',
            'konaklama': 'Konaklama ve Seyahat Hizmetleri Alanı',
            'konaklamapro': 'Konaklama ve Seyahat Hizmetleri Alanı',
            'kuyumculuk': 'Kuyumculuk Teknolojisi Alanı',
            'laboratuvar': 'Laboratuvar Hizmetleri Alanı',
            'maden': 'Maden Teknolojisi Alanı',
            'makine': 'Makine ve Tasarım Teknolojisi Alanı',
            'marmaragastro': 'Marmara Gastronomi ve Mutfak Sanatları Alanı',
            'metal': 'Metal Teknolojisi Alanı',
            'metalurji': 'Metalürji Teknolojisi Alanı',
            'mikromekanik': 'Mikromekanik Alanı',
            'mobilya': 'Mobilya ve İç Mekân Tasarımı Alanı',
            'moda': 'Moda Tasarım Teknolojileri Alanı',
            'motorlu': 'Motorlu Araçlar Teknolojisi Alanı',
            'motorluarac': 'Motorlu Araçlar Teknolojisi Alanı',
            'muhasebe': 'Muhasebe ve Finansman Alanı',
            'muhasebepro': 'Muhasebe ve Finansman Alanı',
            'otomotiv': 'Otomotiv Teknolojileri Alanı',
            'pazarlama': 'Pazarlama ve Perakende Alanı',
            'plastiksanatlar': 'Plastik Sanatlar Alanı',
            'plastiktek': 'Plastik Teknolojisi Alanı',
            'radyotv': 'Radyo-Televizyon Alanı',
            'radyotvpro': 'Radyo-Televizyon Alanı',
            'rayli': 'Raylı Sistemler Teknolojisi Alanı',
            'saglik': 'Sağlık Hizmetleri Alanı',
            'seramik': 'Seramik ve Cam Teknolojisi Alanı',
            'seramikpro': 'Seramik ve Cam Teknolojisi Alanı',
            'siber': 'Siber Güvenlik Alanı',
            'tarim': 'Tarım Alanı',
            'tekstil': 'Tekstil Teknolojisi Alanı',
            'tesisat': 'Tesisat Teknolojisi ve İklimlendirme Alanı',
            'ucak': 'Uçak Bakım Alanı',
            'ulastirma': 'Ulaştırma Hizmetleri Alanı',
            'yapayzeka': 'Yapay Zekâ Alanı',
            'yenilenebilir': 'Yenilenebilir Enerji Teknolojileri Alanı',
            'yiyecek': 'Yiyecek İçecek Hizmetleri Alanı',
            'yiyecekpro': 'Yiyecek İçecek Hizmetleri Alanı'
        };

        const seenNames = new Map();

        for (let key of Object.keys(targetAlanlar)) {
            if (key.includes('.pdf')) continue;
            const area = targetAlanlar[key];
            const cleanName = CANONICAL_ALAN_NAMES[key] || area.alan_adi || (area.alan_kodu || key).replace(/_/g, ' ').toUpperCase() + " ALANI";
            const normalized = cleanName.toLowerCase().replace(/[^a-z0-9çğıöşü]/g, '');

            if (!seenNames.has(normalized)) {
                seenNames.set(normalized, {
                    id: key,
                    name: cleanName,
                    data: area
                });
            } else {
                const existing = seenNames.get(normalized);
                if ((!key.endsWith('pro') && existing.id.endsWith('pro')) || (key.length < existing.id.length && !key.endsWith('pro'))) {
                    seenNames.set(normalized, {
                        id: key,
                        name: cleanName,
                        data: area
                    });
                }
            }
        }

        return Array.from(seenNames.values()).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }

    getBranchesForArea(areaId, schoolType = "", gradeLevel = null) {
        if (!areaId) return [];
        const isMesem = String(schoolType || "").includes("mesleki_egitim_merkezi") || String(schoolType || "").includes("mesem");
        
        // 1. MESEM: dal listesi kendi veri tabanından gelir. Aşağıdaki MTEGM
        //    taramasına düşmemelidir; MESEM dalları meslek lisesi dallarıyla
        //    birebir aynı değildir (örn. "Motosiklet Tamirciliği" yalnızca
        //    MESEM'de vardır).
        if (isMesem) {
            const mesemDb = (typeof MESEM_CURRICULUM_DB !== 'undefined') ? MESEM_CURRICULUM_DB : ((typeof window !== 'undefined' && window.MESEM_CURRICULUM_DB) ? window.MESEM_CURRICULUM_DB : null);
            const mesemArea = mesemDb ? mesemDb[String(areaId).toLowerCase()] : null;
            if (mesemArea) {
                const gNum = (gradeLevel && String(gradeLevel).toLowerCase() !== 'all') ? String(gradeLevel).replace(/[^0-9]/g, '') : null;
                const siniflar = mesemArea.siniflar || {};
                const kaynak = (gNum && siniflar[gNum]) ? [siniflar[gNum]] : Object.values(siniflar);
                const set = new Set();
                for (let lst of kaynak) {
                    for (let c of lst) {
                        // Dal adı, "HAFTALIK" sözcüğünden önceki parantezin
                        // TAMAMIDIR — bazı dal adlarının içinde parantez var
                        // ("TEKSTİL BİTİM İŞLEMLERİ (APRE) DALI").
                        const t = String(c.title || "");
                        const m = t.match(/\((.+)\)\s*HAFTALIK/u) || t.match(/\(([^)]+)\)/u);
                        if (m && m[1]) set.add(m[1].trim().toUpperCase());
                    }
                }
                const dalNames = Array.from(set);
                if (dalNames.length > 0) return dalNames.sort((a, b) => a.localeCompare(b, 'tr'));
                if (Array.isArray(mesemArea.dallar) && mesemArea.dallar.length > 0) {
                    return mesemArea.dallar.slice().sort((a, b) => a.localeCompare(b, 'tr'));
                }
            }
            return [];
        }

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

        const cleanId = String(areaId).toLowerCase().trim();
        const lookupKey = ALIAS_MAP[cleanId] || cleanId;
        const gNum = (gradeLevel && String(gradeLevel).toLowerCase() !== 'all') ? String(gradeLevel).replace(/[^0-9]/g, '') : null;
        const targetGrades = gNum ? [gNum] : ["9", "10", "11", "12"];
        const dallarSet = new Set();

        const strictDb = (typeof STRICT_PDF_CURRICULUM_DB !== 'undefined') ? STRICT_PDF_CURRICULUM_DB : ((typeof window !== 'undefined' && window.STRICT_PDF_CURRICULUM_DB) ? window.STRICT_PDF_CURRICULUM_DB : null);
        const strictArea = strictDb ? (strictDb[lookupKey] || strictDb[cleanId] || (cleanId.endsWith('pro') ? strictDb[cleanId.replace(/pro$/, '')] : null) || strictDb[cleanId + 'pro']) : null;

        if (strictArea) {
            for (let g of targetGrades) {
                const cList = strictArea[g] || [];
                for (let c of cList) {
                    const title = String(c.title || c.cizelge_basligi || "");
                    const match = title.match(/\(([^)]+DALI)\)/iu) || title.match(/\(([^)]+)\)/iu);
                    if (match && match[1]) {
                        const dalCandidate = match[1].trim().toUpperCase();
                        if (!dalCandidate.includes("PROGRAMI") && !dalCandidate.includes("ALANI") && dalCandidate.length > 3) {
                            dallarSet.add(dalCandidate.endsWith("DALI") ? dalCandidate : dalCandidate + " DALI");
                        }
                    }
                }
            }
        }

        // Eğer seçilen sınıf için dal bulunamadıysa (örneğin henüz ayrışmamışsa), alanın tüm sınıflarındaki dalları listele
        if (dallarSet.size === 0 && strictArea) {
            for (let g of ["9", "10", "11", "12"]) {
                const cList = strictArea[g] || [];
                for (let c of cList) {
                    const title = String(c.title || c.cizelge_basligi || "");
                    const match = title.match(/\(([^)]+DALI)\)/iu) || title.match(/\(([^)]+)\)/iu);
                    if (match && match[1]) {
                        const dalCandidate = match[1].trim().toUpperCase();
                        if (!dalCandidate.includes("PROGRAMI") && !dalCandidate.includes("ALANI") && dalCandidate.length > 3) {
                            dallarSet.add(dalCandidate.endsWith("DALI") ? dalCandidate : dalCandidate + " DALI");
                        }
                    }
                }
            }
        }

        // 3. MTEGM (this.masterData) Geleneksel Tarama
        if (dallarSet.size === 0 && this.masterData?.okul_turleri_ve_cizelgeler?.mesleki_ve_teknik_egitim_mtegm?.alanlar) {
            const mtegm = this.masterData.okul_turleri_ve_cizelgeler.mesleki_ve_teknik_egitim_mtegm.alanlar;
            let areaData = mtegm[lookupKey] || mtegm[cleanId] || (cleanId.endsWith('pro') ? mtegm[cleanId.replace(/pro$/, '')] : null) || mtegm[cleanId + 'pro'];
            if (areaData) {
                if (Array.isArray(areaData.dallar) && areaData.dallar.length > 0) {
                    return areaData.dallar;
                }
                const siniflar = areaData.siniflar || {};
                for (let g of ["9", "10", "11", "12"]) {
                    const list1 = siniflar['sinif_' + g]?.haftalik_ders_cizelgeleri || siniflar[g]?.haftalik_ders_cizelgeleri || [];
                    const list2 = Array.isArray(areaData[g]) ? areaData[g] : (Array.isArray(areaData['sinif_' + g]) ? areaData['sinif_' + g] : []);
                    for (let c of [...list1, ...list2]) {
                        const title = String(c.cizelge_basligi || c.title || "");
                        const match = title.match(/\(([^)]+DALI)\)/iu) || title.match(/\(([^)]+)\)/iu);
                        if (match && match[1]) {
                            const dalCandidate = match[1].trim().toUpperCase();
                            if (!dalCandidate.includes("PROGRAMI") && !dalCandidate.includes("ALANI") && dalCandidate.length > 3) {
                                dallarSet.add(dalCandidate.endsWith("DALI") ? dalCandidate : dalCandidate + " DALI");
                            }
                        }
                    }
                }
            }
        }

        if (dallarSet.size > 0) {
            return Array.from(dallarSet).sort((a, b) => a.localeCompare(b, 'tr'));
        }

        return [];
    }

    static get CANONICAL_CULTURE_BRANCHES() {
        return [
            "Almanca",
            "Arapça",
            "Beden Eğitimi",
            "Bilişim Teknolojileri",
            "Biyoloji",
            "Coğrafya",
            "Din Kültürü ve Ahlak Bilgisi",
            "Felsefe",
            "Fen Bilimleri",
            "Fizik",
            "Fransızca",
            "Görsel Sanatlar",
            "İHL Meslek Dersleri",
            "İlköğretim Matematik",
            "İngilizce",
            "Kimya",
            "Matematik",
            "Müzik",
            "Okul Öncesi",
            "Özel Eğitim",
            "Rehberlik",
            "Sınıf Öğretmenliği",
            "Sosyal Bilgiler",
            "Tarih",
            "Teknoloji ve Tasarım",
            // Güzel Sanatlar Lisesi tiyatro bölümünün dersleri bu alana
            // aittir. 97 alanlık resmî "Öğretmenlik Alanları, Atama ve Ders
            // Okutma Esasları" çizelgesinde AKTİF bir alandır; uygulamanın
            // listesinde eksikti ve o yüzden tiyatro dersleri hiçbir branşa
            // yazılamıyordu.
            "Tiyatro",
            "Türk Dili ve Edebiyatı",
            "Türkçe"
        ];
    }

    static get CANONICAL_VOCATIONAL_BRANCHES() {
        return [
            "Adalet",
            "Aile ve Tüketici Hizmetleri",
            "Ayakkabı ve Saraciye Teknolojisi",
            "Basım Teknolojileri",
            "Biyomedikal Cihaz Teknolojileri",
            "Büro Yönetimi ve Yönetici Asistanlığı",
            "Çocuk Gelişimi ve Eğitimi",
            "Denizcilik",
            "El Sanatları Teknolojisi",
            "Elektrik-Elektronik Teknolojisi",
            "Endüstriyel Otomasyon Teknolojileri",
            "Gazetecilik",
            "Geleneksel Türk Sanatları",
            "Gemi Yapımı",
            "Gıda Teknolojisi",
            "Grafik ve Fotoğraf",
            "Güzellik Hizmetleri",
            "Halkla İlişkiler ve Organizasyon",
            "Harita-Tapu-Kadastro",
            "Hasta ve Yaşlı Hizmetleri",
            "Hayvan Yetiştiriciliği ve Sağlığı",
            "İnşaat Teknolojisi",
            "İtfaiyecilik ve Yangın Güvenliği",
            "Kimya / Kimya Teknolojisi",
            "Konaklama ve Seyahat Hizmetleri",
            "Kuyumculuk Teknolojisi",
            "Laboratuvar Hizmetleri",
            "Maden Teknolojisi",
            "Makine ve Tasarım Teknolojisi",
            "Matbaa Teknolojisi",
            "Metal Teknolojisi",
            "Metalürji Teknolojisi",
            "Mikromekanik",
            "Mobilya ve İç Mekân Tasarımı",
            "Moda Tasarım Teknolojileri",
            "Motorlu Araçlar Teknolojisi",
            "Muhasebe ve Finansman",
            "Pazarlama ve Perakende",
            "Plastik Teknolojisi",
            "Radyo-Televizyon",
            "Raylı Sistemler Teknolojisi",
            "Sağlık Hizmetleri",
            "Seramik ve Cam Teknolojisi",
            "Siber Güvenlik",
            "Tarım",
            "Tekstil Teknolojisi",
            "Tesisat Teknolojisi ve İklimlendirme",
            "Uçak Bakım",
            "Ulaştırma Hizmetleri",
            "Yapay Zekâ",
            "Yenilenebilir Enerji Teknolojileri",
            "Yiyecek İçecek Hizmetleri"
        ];
    }

    getAllBranches() {
        const cleanBranches = [
            ...MebDatabaseService.CANONICAL_CULTURE_BRANCHES,
            ...MebDatabaseService.CANONICAL_VOCATIONAL_BRANCHES
        ];

        // Tekilleştir ve sırala
        const uniqueSet = new Set(cleanBranches);
        return Array.from(uniqueSet)
            .filter(b => b && b.length > 1)
            .map(bName => ({ brans_adi: bName }))
            .sort((a, b) => a.brans_adi.localeCompare(b.brans_adi, 'tr'));
    }

    getVocationalBranchesList() {
        return [...MebDatabaseService.CANONICAL_VOCATIONAL_BRANCHES].sort((a, b) => a.localeCompare(b, 'tr'));
    }

    getGeneralCultureBranchesList() {
        return [...MebDatabaseService.CANONICAL_CULTURE_BRANCHES].sort((a, b) => a.localeCompare(b, 'tr'));
    }

    getAllBranchesList() {
        return this.getAllBranches();
    }

    /**
     * Branş -> norma dâhil dersler matrisi.
     *
     * ⚠️ 2026-08-24: BU VERİ HİÇBİR HESABA GİRMİYOR. Tek çağıranı
     * normEngine.setBranchMatrix() idi; o da veriyi saklayıp hiç
     * okumuyordu. Ölü zincir kaldırıldı, bu okuyucu ileride gerçekten
     * kullanılmak istenirse dursun diye bırakıldı.
     *
     * Kullanılacaksa ÖNCE kaynağı temizlenmeli: meb_master_db.json'daki
     * 47 branşın bir kısmının ders listesi kirlidir (22 Ağustos 2026
     * karşılaştırması). Branş ataması şu an
     * curriculumEngine.getCanonicalCourseAndBranch() ile yapılıyor.
     */
    getBranchMatrix() {
        return this.masterData?.norm_ve_ders_yuku_hesaplama_motoru?.meb_norm_kadro_esas_dersler_ve_yan_alan_matrisi?.branslar || {};
    }

    getSpecialRules() {
        return this.masterData?.norm_ve_ders_yuku_hesaplama_motoru || {};
    }

        getOfficialTargetHours(schoolType, gradeLevel, areaId) {
        const sType = String(schoolType || "").toLowerCase();
        const gStr = String(gradeLevel || "");
        
        if (sType.includes("meslek") || sType.includes("teknik") || sType.includes("mtegm") || areaId) {
            if (gStr === "9") return 44;
            return 45;
        }
        if (sType.includes("ortaokul") && !sType.includes("imam_hatip")) {
            return 35;
        }
        if (sType.includes("imam_hatip_ortaokulu") || sType.includes("iho")) {
            return 36;
        }
        if (sType.includes("fen_lisesi") || sType.includes("sosyal_bilimler") || sType.includes("anadolu")) {
            return 40;
        }
        if (sType.includes("imam_hatip") || sType.includes("aihl")) {
            return 40;
        }
        if (sType.includes("ozel_egitim")) {
            return 30;
        }
        return 40;
    }
}

export const dbService = new MebDatabaseService();

(function() {

// ==================== licenseCore.js ====================

/**
 * MEB NORM KADRO SİSTEMİ - KRİPTOGRAFİK LİSANS ÇEKİRDEĞİ (ECDSA P-256 / SHA-256)
 * Copyright (c) 2026 Burhan AYSAN. Tüm hakları saklıdır.
 * 
 * Bu modül; Web Crypto API (Browser) ve Node.js crypto ortamlarında hibrit çalışır.
 * Asimetrik dijital imzalama (ECDSA P-256) ile lisans üretir ve doğrular.
 */

// Gömülü Master Açık Anahtar (Client-Side Public Key)
const MASTER_PUBLIC_KEY_JWK = {
    "kty": "EC",
    "x": "Ixop_Vp8qOnI_cJ555RRs4c7A9karZ8JlyIrwojiRwA",
    "y": "8mAoQOD1uzeBqcJcgwTprG69YI8jzH1BsP9mLMap3E8",
    "crv": "P-256",
    "kid": "meb-norm-master-key-2026",
    "alg": "ES256",
    "key_ops": ["verify"]
};

class MebLicenseCore {
    constructor() {
        this.publicKeyJwk = MASTER_PUBLIC_KEY_JWK;
        this.cryptoSubtle = (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) ? window.crypto.subtle : null;
    }

    // Base64URL Kodlama & Çözme
    static base64UrlEncode(bufferOrStr) {
        let str = "";
        if (typeof bufferOrStr === 'string') {
            if (typeof btoa !== 'undefined') {
                str = btoa(unescape(encodeURIComponent(bufferOrStr)));
            } else {
                str = Buffer.from(bufferOrStr, 'utf-8').toString('base64');
            }
        } else {
            if (typeof btoa !== 'undefined') {
                const bytes = new Uint8Array(bufferOrStr);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                str = btoa(binary);
            } else {
                str = Buffer.from(bufferOrStr).toString('base64');
            }
        }
        return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    static base64UrlDecode(base64UrlStr) {
        let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        if (typeof atob !== 'undefined') {
            const binaryStr = atob(base64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            return bytes;
        } else {
            return new Uint8Array(Buffer.from(base64, 'base64'));
        }
    }

    static base64UrlDecodeToString(base64UrlStr) {
        let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        if (typeof atob !== 'undefined') {
            return decodeURIComponent(escape(atob(base64)));
        } else {
            return Buffer.from(base64, 'base64').toString('utf-8');
        }
    }

    /**
     * Browser Web Crypto API ile Açık Anahtarı İçe Aktarma
     */
    async importPublicKey(jwk = null) {
        if (!this.cryptoSubtle) {
            throw new Error("Web Crypto API bu ortamda bulunamadı.");
        }
        const keyData = jwk || this.publicKeyJwk;
        return await this.cryptoSubtle.importKey(
            "jwk",
            keyData,
            { name: "ECDSA", namedCurve: "P-256" },
            true,
            ["verify"]
        );
    }

    /**
     * Lisans Verisini Doğrulama (Browser İstemci Tarafı)
     * @param {string} licenseToken - "MEBNORM.<PAYLOAD_B64>.<SIGNATURE_B64>"
     * @param {string} expectedKurumKodu - Doğrulanacak kurum kodu (Opsiyonel)
     * @param {string} currentHardwareId - Doğrulanacak cihaz kimliği (Opsiyonel)
     */
    async verifyLicenseToken(licenseToken, expectedKurumKodu = null, currentHardwareId = null) {
        try {
            if (!licenseToken || typeof licenseToken !== 'string') {
                return { isValid: false, reason: "Lisans anahtarı boş veya geçersiz formatta." };
            }

            const cleanToken = licenseToken.trim().replace(/^['"]|['"]$/g, '');
            const parts = cleanToken.split('.');

            if (parts.length !== 3 || parts[0] !== 'MEBNORM') {
                return { isValid: false, reason: "Geçersiz lisans yapısı. 'MEBNORM...' ile başlamalıdır." };
            }

            const payloadB64 = parts[1];
            const signatureB64 = parts[2];

            const payloadJsonStr = MebLicenseCore.base64UrlDecodeToString(payloadB64);
            const payload = JSON.parse(payloadJsonStr);

            // 1. Dijital İmza Doğrulaması (Kriptografik İspat)
            const dataToVerifyStr = `MEBNORM.${payloadB64}`;
            const signatureBytes = MebLicenseCore.base64UrlDecode(signatureB64);

            let isSigValid = false;

            if (this.cryptoSubtle) {
                const encoder = new TextEncoder();
                const dataToVerify = encoder.encode(dataToVerifyStr);
                const cryptoKey = await this.importPublicKey();
                isSigValid = await this.cryptoSubtle.verify(
                    { name: "ECDSA", hash: { name: "SHA-256" } },
                    cryptoKey,
                    signatureBytes,
                    dataToVerify
                );
            } else if (typeof require !== 'undefined') {
                // Node.js fallback for testing
                const crypto = require('crypto');
                const verify = crypto.createVerify('SHA256');
                verify.update(Buffer.from(dataToVerifyStr));
                verify.end();
                const nodePubKey = crypto.createPublicKey({ key: this.publicKeyJwk, format: 'jwk' });
                isSigValid = verify.verify(
                    { key: nodePubKey, dsaEncoding: 'ieee-p1363' },
                    Buffer.from(signatureBytes)
                );
            }

            if (!isSigValid) {
                return { isValid: false, reason: "Lisans imzası geçersiz veya değiştirilmiş! Kriptografik doğrulama başarısız." };
            }

            // 2. Süre Kontrolü (Expiration Check)
            const now = new Date();
            const expireDate = new Date(payload.expireDate);
            if (now > expireDate) {
                return {
                    isValid: false,
                    isExpired: true,
                    reason: `Lisans süresi ${payload.expireDate} tarihinde dolmuştur. Lütfen lisansınızı yenileyiniz.`,
                    payload
                };
            }

            // 3. Kurum Kodu Eşleşme Kontrolü (Komşu Okul Savunması)
            if (expectedKurumKodu && payload.kurumKodu !== "*" && payload.licenseType !== "MASTER_DEVELOPER") {
                if (String(payload.kurumKodu).trim() !== String(expectedKurumKodu).trim()) {
                    return {
                        isValid: false,
                        reason: `Bu lisans anahtarı [${payload.kurumKodu} - ${payload.okulAdi || 'Farklı Kurum'}] adına kayıtlıdır. Aktif kurum kodu (${expectedKurumKodu}) ile uyuşmuyor!`,
                        payload
                    };
                }
            }

            // 4. Donanım / Bilgisayar Kilidi Kontrolü (Hardware Lock)
            if (currentHardwareId && payload.hardwareId && payload.hardwareId !== "*" && payload.licenseType !== "MASTER_DEVELOPER") {
                if (payload.hardwareId !== currentHardwareId) {
                    return {
                        isValid: false,
                        reason: "Bu lisans anahtarı farklı bir bilgisayar için üretilmiştir. Başka cihazda kullanılamaz.",
                        payload
                    };
                }
            }

            // Lisans Tamamen Geçerli
            const daysRemaining = Math.max(0, Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24)));

            return {
                isValid: true,
                payload,
                daysRemaining,
                licenseType: payload.licenseType,
                isMaster: payload.licenseType === "MASTER_DEVELOPER",
                isDemo: payload.licenseType === "DEMO",
                isAnnual: payload.licenseType === "ANNUAL_SCHOOL",
                kurumKodu: payload.kurumKodu,
                okulAdi: payload.okulAdi,
                okulTuru: payload.okulTuru,
                maxSections: payload.maxSections || -1
            };

        } catch (err) {
            return { isValid: false, reason: "Lisans çözümlenirken hata oluştu: " + err.message };
        }
    }

    /**
     * Cihaz Donanım Parmak İzi Üretimi (Hardware Fingerprint)
     */
    static async generateHardwareFingerprint() {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return "HW-STATIC-TEST-NODE";
        }

        try {
            const nav = window.navigator || {};
            const screen = window.screen || {};
            
            // Canvas Parmak İzi
            let canvasHash = "";
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 50;
                const ctx = canvas.getContext('2d');
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial'";
                ctx.textBaseline = "alphabetic";
                ctx.fillStyle = "#f60";
                ctx.fillRect(125, 1, 62, 20);
                ctx.fillStyle = "#069";
                ctx.fillText("MEB Norm Security 2026", 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText("MEB Norm Security 2026", 4, 17);
                canvasHash = canvas.toDataURL();
            } catch (e) {
                canvasHash = "canvas_disabled";
            }

            const rawString = [
                nav.userAgent || '',
                nav.language || '',
                nav.hardwareConcurrency || '4',
                nav.deviceMemory || '8',
                screen.width || '1920',
                screen.height || '1080',
                screen.colorDepth || '24',
                new Date().getTimezoneOffset(),
                canvasHash
            ].join('###');

            const encoder = new TextEncoder();
            const data = encoder.encode(rawString);
            
            if (window.crypto && window.crypto.subtle) {
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                return `HW-${hashHex.substring(0, 4).toUpperCase()}-${hashHex.substring(4, 8).toUpperCase()}-${hashHex.substring(8, 12).toUpperCase()}-${hashHex.substring(12, 16).toUpperCase()}`;
            }

            return "HW-GENERIC-DEFAULT";
        } catch (e) {
            return "HW-STANDALONE-DEVICE";
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MebLicenseCore, MASTER_PUBLIC_KEY_JWK };
}
if (typeof window !== 'undefined') {
    window.MebLicenseCore = MebLicenseCore;
    window.MASTER_PUBLIC_KEY_JWK = MASTER_PUBLIC_KEY_JWK;
}

// ==================== licenseClientManager.js ====================

/**
 * MEB NORM KADRO SİSTEMİ - İSTEMCİ LİSANS VE GÜVENLİK YÖNETİCİSİ (Client License Manager)
 * Copyright (c) 2026 Burhan AYSAN. Tüm hakları saklıdır.
 */

class MebLicenseClientManager {
    constructor() {
        this.licenseKeyStorageKey = "meb_norm_license_key";
        this.firstRunStorageKey = "meb_norm_first_run_date";
        this.activeLicense = null;
        this.core = new MebLicenseCore();
        this.currentHardwareId = "HW-STANDALONE-DEVICE";
        this.licenseStatus = {
            isValid: false,
            licenseType: "NONE",
            daysRemaining: 0,
            isExpired: false,
            maxSections: 3,
            allowExport: false,
            kurumKodu: "*",
            okulAdi: "",
            okulTuru: ""
        };
    }

    safeGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return this[key] || null;
        }
    }

    safeSet(key, val) {
        try {
            localStorage.setItem(key, val);
        } catch (e) {
            this[key] = val;
        }
    }

    async init() {
        try {
            this.currentHardwareId = await MebLicenseCore.generateHardwareFingerprint();
        } catch (e) {
            this.currentHardwareId = "HW-STANDALONE-DEVICE";
        }

        const savedToken = this.safeGet(this.licenseKeyStorageKey);

        if (savedToken) {
            const res = await this.validateToken(savedToken);
            if (res.isValid) {
                this.activeLicense = res.payload;
                this.licenseStatus = res;
                return this.licenseStatus;
            }
        }

        return this.initDemoState();
    }

    initDemoState() {
        let firstRun = this.safeGet(this.firstRunStorageKey);
        const now = Date.now();

        if (!firstRun) {
            firstRun = String(now);
            this.safeSet(this.firstRunStorageKey, firstRun);
        }

        const firstRunMs = parseInt(firstRun, 10) || now;
        const demoDurationMs = 7 * 24 * 60 * 60 * 1000;
        const elapsedMs = now - firstRunMs;
        const remainingMs = demoDurationMs - elapsedMs;

        const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
        const isExpired = remainingMs <= 0;

        this.licenseStatus = {
            isValid: !isExpired,
            licenseType: "DEMO",
            isDemo: true,
            isAnnual: false,
            isMaster: false,
            daysRemaining: daysRemaining,
            isExpired: isExpired,
            maxSections: 3,
            allowExport: false,
            kurumKodu: "*",
            okulAdi: "Deneme ve İnceleme Okulu",
            okulTuru: "*",
            hardwareId: this.currentHardwareId,
            reason: isExpired ? "Demo sürümünde en fazla 3 şube oluşturulabilir. Lütfen lisans anahtarınızı giriniz." : null
        };

        return this.licenseStatus;
    }

    async validateToken(token) {
        try {
            if (!token || typeof token !== 'string') {
                return { isValid: false, reason: "Lisans anahtarı boş olamaz." };
            }

            const cleanToken = token.trim().replace(/^['"]|['"]$/g, '');
            const currentHwid = this.currentHardwareId || await MebLicenseCore.generateHardwareFingerprint();

            // MebLicenseCore üzerinden asimetrik kriptografik doğrulama
            const res = await this.core.verifyLicenseToken(cleanToken, null, currentHwid);
            return res;
        } catch (e) {
            return { isValid: false, reason: "Lisans anahtarı doğrulanamadı: " + e.message };
        }
    }

    async activateLicense(token) {
        const res = await this.validateToken(token);
        if (res.isValid) {
            this.safeSet(this.licenseKeyStorageKey, token.trim());
            this.activeLicense = res.payload;
            this.licenseStatus = res;
            return { success: true, status: res };
        } else {
            return { success: false, reason: res.reason || "Geçersiz lisans anahtarı." };
        }
    }

    deactivateLicense() {
        try {
            localStorage.removeItem(this.licenseKeyStorageKey);
        } catch (e) {}
        this.activeLicense = null;
        return this.initDemoState();
    }

    canAddSection(currentSectionCount) {
        if (!this.licenseStatus.isValid) return false;
        if (this.licenseStatus.maxSections === -1 || this.licenseStatus.isMaster) return true;
        return currentSectionCount < this.licenseStatus.maxSections;
    }

    validateEOkulInstitution(fileKurumKodu, fileOkulAdi) {
        if (this.licenseStatus.isMaster || this.licenseStatus.isDemo) {
            return { allowed: true };
        }

        const licensedCode = String(this.licenseStatus.kurumKodu).trim();
        const importedCode = String(fileKurumKodu || "").trim();

        if (licensedCode && licensedCode !== "*" && importedCode) {
            if (licensedCode !== importedCode) {
                return {
                    allowed: false,
                    reason: `YETKİSİZ KURUM VERİSİ!\n\nYüklenen e-Okul dosyası Kurum Kodu (${importedCode}) lisanslı kurum kodunuz (${licensedCode}) ile uyuşmuyor.\n\nLisansınız yalnızca [${this.licenseStatus.okulAdi}] adına geçerlidir.`
                };
            }
        }

        return { allowed: true };
    }

    getReportSecurityFooter() {
        if (this.licenseStatus.isMaster) {
            return `👑 MEB Norm Kadro Master Geliştirici Sürümü - Burhan AYSAN`;
        }

        if (this.licenseStatus.isDemo) {
            return `⚠️ MEB NORM KADRO SİSTEMİ - DENEME VE İNCELEME SÜRÜMÜ (Resmi Geçerliliği Yoktur)`;
        }

        return `🏛️ Bu resmî norm kadro analizi MEB [${this.licenseStatus.kurumKodu} - ${this.licenseStatus.okulAdi}] adına lisanslanmıştır. Başka kurumlar için geçerliliği yoktur. Doğrulama No: ${this.licenseStatus.kurumKodu}-${this.licenseStatus.payload?.sezon || '2026-2027'}`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MebLicenseClientManager };
}
if (typeof window !== 'undefined') {
    window.MebLicenseClientManager = MebLicenseClientManager;
    window.licenseManager = new MebLicenseClientManager();
}

// ==================== normRulesConfig.js ====================

/**
 * NormMatik™ — Parametrik MEB Norm Kadro Kural Motoru Konfigürasyonu
 * 5846 Sayılı FSEK Korumalı • Mimari: Burhan AYSAN
 * 
 * Bu dosya; MEB Norm Kadro Yönetmeliği, TTKB Haftalık Ders Çizelgeleri ve
 * Türkiye Yüzyılı Maarif Modeli kural baremlerini tek bir merkezden parametrik yönetir.
 * Yönetmelik değiştiğinde sadece bu tablodaki baremler güncellenir.
 */

const NORM_RULES_CONFIG = {
    metadata: {
        systemName: "NormMatik™ Parametrik Kural Motoru",
        version: "2026.1.0",
        releaseDate: "2026-08-19",
        legislationTitle: "Millî Eğitim Bakanlığına Bağlı Eğitim Kurumları Yönetici ve Öğretmenlerinin Norm Kadrolarına İlişkin Yönetmelik",
        legislationGazetteDate: "18.06.2014 / 29034",
        latestAmendment: "Resmî Gazete 2024 / TTKB Maarif Modeli Kademeli Geçiş",
        developer: "Burhan AYSAN"
    },

    // 1. GENEL BİLGİ VE MESLEK DERSLERİ BAREMLERİ (Yönetmelik Madde 18 - 20)
    generalCourseLoadRules: {
        minHoursForFirstNorm: 6,      // 6-30 saate kadar: 1 norm
        baseIntervalHours: 15,        // Her ilave 15 saat için norm artışı
        secondNormThreshold: 31,      // 31-42 saat arası: 2 norm
        residualHourThreshold: 15,    // 42 saatten sonra her 15 artık saat için +1 norm (57 -> 3 norm, 72 -> 4 norm vb.)
        fullLoadWeeklyHours: 21,      // Bir öğretmenin azami maaş+ek ders yükü
        freeHoursForDirector: 6       // Müdürün haftalık girebileceği azami/muaf ders saati
    },

    // 2. MESLEKÎ VE TEKNİK EĞİTİM ATÖLYE VE LABORATUVAR GRUP BAREMLERİ (Madde 22)
    vocationalWorkshopGroupThresholds: {
        grade9: { minStudentsPerGroup: 10, groupInterval: 10 },   // 9. Sınıf: 10-20: 1 grup, 21-30: 2 grup
        grade10: { minStudentsPerGroup: 10, groupInterval: 10 },  // 10. Sınıf
        grade11: { minStudentsPerGroup: 8, groupInterval: 8 },    // 11. Sınıf (Özel dal eğitimi)
        grade12: { minStudentsPerGroup: 8, groupInterval: 8 },    // 12. Sınıf
        specialEducation: { minStudentsPerGroup: 4, groupInterval: 4 } // Özel Eğitim Meslek
    },

    // 3. YÖNETİCİ (İDARECİ) NORM KADRO BAREMLERİ (Madde 5 - 14)
    administrativeNormRules: {
        principalNorm: 1, // Her bağımsız kuruma 1 Müdür
        chiefAssistant: {
            requiredHostel: true, // Pansiyonlu okullarda 1 Müdür Başyardımcısı
            minStudentThreshold: 500
        },
        vicePrincipal: {
            baseNorm: 1, // Her kuruma en az 1 Müdür Yardımcısı
            tiers: [
                { maxStudents: 400, norm: 1 },
                { maxStudents: 800, norm: 2 },
                { maxStudents: 1200, norm: 3 },
                { maxStudents: 1600, norm: 4 },
                { maxStudents: 2000, norm: 5 },
                { maxStudents: 99999, norm: 6 }
            ],
            bonusForHostel: 1,         // Pansiyon varsa +1 İlave Md. Yrd.
            bonusForRevolvingFund: 1,  // Döner Sermaye varsa +1 İlave Md. Yrd.
            bonusForMesemBranch: 1,    // MESEM çırak programı varsa +1 İlave Md. Yrd.
            maxCapTotalVicePrincipals: 7 // Bakanlık Tavan Sınırı
        }
    },

    // 4. REHBERLİK VE PSİKOLOJİK DANIŞMANLIK NORM BAREMLERİ (Madde 21)
    guidanceCounselorRules: {
        generalHighSchool: {
            firstNormThreshold: 150,  // İlk 150 öğrenciye 1 rehberlik normu
            subsequentInterval: 250   // Sonraki her 250 öğrenciye +1 norm
        },
        vocationalSchool: {
            firstNormThreshold: 100,  // Meslek liselerinde ilk 100 öğrenciye 1 norm
            subsequentInterval: 200   // Sonraki her 200 öğrenciye +1 norm
        },
        specialEducation: {
            firstNormThreshold: 20,
            subsequentInterval: 50
        }
    },

    // 5. MESLEKİ EĞİTİM MERKEZİ (MESEM) ÇIRAK BAREMLERİ
    mesemApprenticeRules: {
        apprenticesPerGroup: 40,      // 40 çırağa 1 koordinatörlük/alan normu
        coordinatorMaxHoursPerTeacher: 16 // Öğretmen başına azami koordinatörlük saati
    },

    // 6. KADEMELİ MÜFREDAT VE MAARİF MODELİ GEÇİŞ YÖNETİMİ
    curriculumModelTransitions: {
        activeSeason: "2026-2027",
        maarifModelGrades: ["9", "10"],   // Kademeli Maarif Modeli
        classicModelGrades: ["11", "12"], // Klasik Müfredat
        middleSchoolGrades: ["5", "6", "7", "8"],
        allowCustomElectiveThemes: true
    }
};

if (typeof window !== 'undefined') {
    window.NORM_RULES_CONFIG = NORM_RULES_CONFIG;
}

// ==================== liveUpdateSyncEngine.js ====================

/**
 * NormMatik™ — Canlı Mevzuat ve Veritabanı Eşleme Motoru (LiveUpdateSyncEngine v1.0)
 * 5846 Sayılı FSEK Korumalı • Mimari: Burhan AYSAN
 * 
 * Bu motor; internete bağlı olunduğunda GitHub CDN / normmatik.com.tr üzerinden
 * en güncel MEB mevzuat sürümünü kontrol eder, çevrimdışı kullanım için yerel
 * hafızaya (localStorage) kaydeder veya internetsiz okullar için .json dosyasından
 * kural güncellemesi yüklenmesini sağlar.
 */


class LiveUpdateSyncEngine {
    constructor() {
        this.STORAGE_KEY_RULES = "normmatik_custom_rules_config";
        this.STORAGE_KEY_VERSION = "normmatik_current_rules_version";
        this.DEFAULT_CDN_URL = "https://raw.githubusercontent.com/burhanaysan/normmatik/main/version.json";
        
        this.currentRules = this.loadActiveRules();
    }

    /**
     * Aktif Kuralları Getirir (Yerel Özel Kural veya Varsayılan Konfigürasyon)
     */
    loadActiveRules() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY_RULES);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.metadata && parsed.metadata.version) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn("Yerel kural konfigürasyonu okunamadı, varsayılan kullanılıyor:", e);
        }
        return NORM_RULES_CONFIG;
    }

    /**
     * Mevcut Aktif Sürüm Bilgisi
     */
    getCurrentVersionInfo() {
        return {
            system: "NormMatik™",
            version: this.currentRules.metadata?.version || "2026.1.0",
            releaseDate: this.currentRules.metadata?.releaseDate || "2026-08-19",
            legislationTitle: this.currentRules.metadata?.legislationTitle || "MEB Norm Kadro Yönetmeliği",
            isCustomLocal: localStorage.getItem(this.STORAGE_KEY_RULES) !== null
        };
    }

    /**
     * Uzak Sunucu / GitHub CDN Üzerinden Güncelleme Kontrolü Yapar (OTA Check)
     * @param {string} customUrl 
     * @returns {Promise<{ hasUpdate: boolean, remoteVersion?: string, changelog?: string[], error?: string }>}
     */
    async checkRemoteUpdate(customUrl = null) {
        const targetUrl = customUrl || this.DEFAULT_CDN_URL;

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return { hasUpdate: false, error: "İnternet bağlantısı yok (Çevrimdışı Mod)." };
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 saniye timeout

            const response = await fetch(targetUrl + `?t=${Date.now()}`, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                return { hasUpdate: false, error: `Sunucu yanıt vermedi (${response.status})` };
            }

            const remoteData = await response.json();
            const currentVer = this.currentRules.metadata?.version || "2026.1.0";
            const remoteVer = remoteData.version;

            if (remoteVer && this.compareVersions(remoteVer, currentVer) > 0) {
                return {
                    hasUpdate: true,
                    remoteVersion: remoteVer,
                    releaseDate: remoteData.releaseDate,
                    changelog: remoteData.changelog || [],
                    downloadUrl: remoteData.downloadUrl
                };
            }

            return {
                hasUpdate: false,
                currentVersion: currentVer,
                message: "Mevzuat ve kural motorunuz güncel."
            };
        } catch (e) {
            return { hasUpdate: false, error: "Güncelleme sunucusuna ulaşılamadı: " + e.message };
        }
    }

    /**
     * Sürüm Karşılaştırıcı (SemVer)
     */
    compareVersions(v1, v2) {
        const p1 = v1.split('.').map(n => parseInt(n, 10) || 0);
        const p2 = v2.split('.').map(n => parseInt(n, 10) || 0);
        for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
            const num1 = p1[i] || 0;
            const num2 = p2[i] || 0;
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    }

    /**
     * Yeni Kural Paketini Uygular ve Kaydeder
     * @param {Object} newRulesConfig 
     */
    applyRulesConfig(newRulesConfig) {
        if (!newRulesConfig || typeof newRulesConfig !== 'object' || !newRulesConfig.generalCourseLoadRules) {
            throw new Error("Geçersiz kural konfigürasyonu formatı.");
        }

        this.currentRules = newRulesConfig;
        localStorage.setItem(this.STORAGE_KEY_RULES, JSON.stringify(newRulesConfig));
        localStorage.setItem(this.STORAGE_KEY_VERSION, newRulesConfig.metadata?.version || "2026.1.0");

        return {
            success: true,
            version: newRulesConfig.metadata?.version,
            message: "Yeni MEB mevzuat ve norm kural paketi başarıyla yüklendi!"
        };
    }

    /**
     * Varsayılan Fabrika Kurallarına Sıfırlar
     */
    resetToDefaultRules() {
        localStorage.removeItem(this.STORAGE_KEY_RULES);
        localStorage.removeItem(this.STORAGE_KEY_VERSION);
        this.currentRules = NORM_RULES_CONFIG;
        return { success: true, message: "Kural motoru varsayılan MEB standartlarına sıfırlandı." };
    }

    /**
     * Mevcut Kural Paketini .json Olarak Dışa Aktarır
     */
    exportRulesToJson() {
        const jsonStr = JSON.stringify(this.currentRules, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `NormMatik_Mevzuat_Kurallari_${this.currentRules.metadata?.version || '2026'}.json`;
        a.click();
    }
}

if (typeof window !== 'undefined') {
    window.LiveUpdateSyncEngine = LiveUpdateSyncEngine;
}

// ==================== database.js ====================

// MEB Master Veri Tabanı Yükleyici ve Veri Köprüsü Modülü
// Bu modül, 69 Meslek Alanı, 21 OGM Çizelgesi, DÖGM Çizelgeleri, 2.662 Seçmeli Dersi ve 47 Branş Matrisini yönetir.

class MebDatabaseService {
    constructor() {
        this.masterData = null;
        this.isLoaded = false;
        this.STORAGE_KEY_DB = "MEB_NORM_CUSTOM_DB_V1";
    }

    async loadDatabase() {
        // 1. Kullanıcının sonradan yüklediği güncel veri tabanı var mı?
        const customDb = localStorage.getItem(this.STORAGE_KEY_DB);
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
        const embeddedData = window.MEB_MASTER_DATABASE || window.MEB_EMBEDDED_DATA;
        if (embeddedData) {
            this.masterData = embeddedData;
            this.isLoaded = true;
            console.log("MEB Master DB gömülü veri (embedded) üzerinden başarıyla yüklendi.");
            return this.masterData;
        }

        throw new Error("Master veri tabanı yüklenemedi. Lütfen data/meb_master_db.json veya js/embedded_data.js dosyasını kontrol edin.");
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
        return [
            { id: "anadolu_lisesi", name: "Anadolu Lisesi", category: "OGM", gradeLevels: ["9", "10", "11", "12"] },
            { id: "hazirlik_anadolu_lisesi", name: "Hazırlık Sınıfı Bulunan Anadolu Lisesi", category: "OGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"] },
            { id: "fen_lisesi", name: "Fen Lisesi", category: "OGM", gradeLevels: ["9", "10", "11", "12"] },
            { id: "hazirlik_fen_lisesi", name: "Hazırlık Sınıfı Bulunan Fen Lisesi", category: "OGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"] },
            { id: "sosyal_bilimler_lisesi", name: "Sosyal Bilimler Lisesi", category: "OGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"] },
            { id: "ozel_program_fen_lisesi", name: "Özel Program Uygulayan Fen Lisesi (Proje)", category: "OGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"] },
            { id: "ozel_program_sosyal_lisesi", name: "Özel Program Uygulayan Sosyal Bilimler Lisesi (Proje)", category: "OGM", gradeLevels: ["hazirlik", "9", "10", "11", "12"] },
            { id: "mesleki_ve_teknik_anadolu_lisesi", name: "Mesleki ve Teknik Anadolu Lisesi (AMP)", category: "MTEGM", gradeLevels: ["9", "10", "11", "12"], hasAreas: true },
            { id: "anadolu_teknik_programi", name: "Anadolu Teknik Programı (ATP)", category: "MTEGM", gradeLevels: ["9", "10", "11", "12"], hasAreas: true },
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
        if (!this.masterData) return [];
        const isMesem = String(schoolType || "").includes("mesleki_egitim_merkezi") || String(schoolType || "").includes("mesem");
        
        let targetAlanlar = {};
        if (isMesem && this.masterData.okul_turleri_ve_cizelgeler?.mesleki_egitim_merkezi_mesem?.alanlar) {
            targetAlanlar = this.masterData.okul_turleri_ve_cizelgeler.mesleki_egitim_merkezi_mesem.alanlar;
        } else {
            targetAlanlar = this.masterData.okul_turleri_ve_cizelgeler?.mesleki_ve_teknik_egitim_mtegm?.alanlar || {};
        }

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

    getBranchesForArea(areaId, schoolType = "") {
        if (!this.masterData || !areaId) return [];
        const isMesem = String(schoolType || "").includes("mesleki_egitim_merkezi") || String(schoolType || "").includes("mesem");
        
        // 1. MESEM Kontrolü
        if (isMesem && this.masterData.okul_turleri_ve_cizelgeler?.mesleki_egitim_merkezi_mesem?.alanlar) {
            const mesemArea = this.masterData.okul_turleri_ve_cizelgeler.mesleki_egitim_merkezi_mesem.alanlar[areaId];
            if (mesemArea?.dallar) {
                const dalNames = Object.values(mesemArea.dallar).map(d => d.dal_adi || d.dal_kodu);
                if (dalNames.length > 0) return dalNames.sort((a, b) => a.localeCompare(b, 'tr'));
            }
        }

        // 2. MTEGM (AMP / ATP) Kontrolü
        const mtegm = this.masterData.okul_turleri_ve_cizelgeler?.mesleki_ve_teknik_egitim_mtegm?.alanlar || {};
        let areaData = mtegm[areaId];
        if (!areaData && areaId.endsWith('pro')) {
            areaData = mtegm[areaId.replace(/pro$/, '')];
        } else if (!areaData && mtegm[areaId + 'pro']) {
            areaData = mtegm[areaId + 'pro'];
        }
        if (!areaData) return [];

        if (Array.isArray(areaData.dallar) && areaData.dallar.length > 0) {
            return areaData.dallar;
        }

        const dallarSet = new Set();
        const siniflar = areaData.siniflar || {};
        for (let sKey in siniflar) {
            const cList = siniflar[sKey]?.haftalik_ders_cizelgeleri || [];
            for (let c of cList) {
                const title = String(c.cizelge_basligi || "");
                const match = title.match(/\(([^)]+DALI)\)/i) || title.match(/\(([^)]+)\)/i);
                if (match && match[1]) {
                    const dalCandidate = match[1].trim().toUpperCase();
                    if (!dalCandidate.includes("PROGRAMI") && !dalCandidate.includes("ALANI") && dalCandidate.length > 3) {
                        dallarSet.add(dalCandidate.endsWith("DALI") ? dalCandidate : dalCandidate + " DALI");
                    }
                }
            }
        }

        if (dallarSet.size > 0) {
            return Array.from(dallarSet).sort((a, b) => a.localeCompare(b, 'tr'));
        }

        const fallback = (areaData.alan_kodu || areaId).replace(/_/g, ' ').toUpperCase() + " DALI";
        return [fallback];
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

    getBranchMatrix() {
        return this.masterData?.norm_ve_ders_yuku_hesaplama_motoru?.meb_norm_kadro_esas_dersler_ve_yan_alan_matrisi?.branslar || {};
    }

    getSpecialRules() {
        return this.masterData?.norm_ve_ders_yuku_hesaplama_motoru || {};
    }

    getOfficialTargetHours(schoolType, gradeLevel, areaId) {
        if (!this.masterData) return 40;
        const root = this.masterData.okul_turleri_ve_cizelgeler || {};
        const isVocational = schoolType?.includes("mesleki") || schoolType?.includes("teknik");
        if (isVocational) {
            const mtegmRules = root.mesleki_ve_teknik_egitim_mtegm?.resmi_meb_haftalik_ders_saati_kurallari;
            const sKey = "sinif_" + gradeLevel;
            if (mtegmRules && mtegmRules[sKey]?.toplam_hedef_saat) {
                return mtegmRules[sKey].toplam_hedef_saat;
            }
            return gradeLevel === "12" ? 44 : 45;
        }
        if (schoolType?.includes("ortaokul")) {
            return 35;
        }
        if (String(gradeLevel).toLowerCase() === "hazirlik" && schoolType?.includes("imam_hatip")) {
            return 41;
        }
        return 40;
    }
}

const dbService = new MebDatabaseService();

// ==================== curriculumEngine.js ====================

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
const curriculumEngine = new MebCurriculumEngine(dbService);
if (typeof window !== 'undefined') {
    window.MebCurriculumEngine = MebCurriculumEngine;
    window.curriculumEngine = curriculumEngine;
}

// ==================== normEngine.js ====================

// MEB Norm Kadro - Norm ve Ders Yükü Hesaplama Motoru (normEngine.js)

class NormEngine {
    constructor() {
        this.branchMatrix = {};
    }

    setBranchMatrix(matrix) {
        this.branchMatrix = matrix || {};
    }    /**
     * OÖKY Madde 100 & Norm Yönetmeliği Madde 22/1-ç: Mesleki ve Teknik Ortaöğretimde Grup Bölünme Standartları
     * 10-20 Öğrenci: 1 Grup
     * 21-30 Öğrenci: 2 Grup
     * 31-40 Öğrenci: 3 Grup
     * 41 ve Üzeri: 4 Grup (Fiziki kapasiteye göre azami 4 grup)
     */
    calculateWorkshopGroups(studentCount) {
        if (studentCount < 10) return 1;
        if (studentCount <= 20) return 1;
        if (studentCount <= 30) return 2;
        if (studentCount <= 40) return 3;
        return 4;
    }

    /**
     * MEB Norm Kadro Yönetmeliği Madde 22/2 (18/8/2022-31927 Sayılı Resmî Gazete)
     * Mesleki Eğitim Merkezleri (MESEM) İşletmelerde Meslek Eğitimi Çırak Grubu Hesabı
     * @param {number} totalApprentices - Alandaki tüm sınıf seviyelerinde kayıtlı toplam çırak sayısı
     * @returns {number} Grup Sayısı (0 - 12)
     */
    calculateMesemApprenticeGroups(totalApprentices) {
        const count = parseInt(totalApprentices, 10) || 0;
        if (count < 10) return 0;
        if (count < 41) return 1;
        if (count < 81) return 2;
        if (count < 121) return 3;
        if (count < 161) return 4;
        if (count < 201) return 5;
        if (count < 241) return 6;
        if (count < 281) return 7;
        if (count < 321) return 8;
        if (count < 361) return 9;
        if (count < 401) return 10;
        if (count < 441) return 11;
        return 12; // 441 ve daha fazla çırak için 12 grup
    }

    /**
     * Ders ve Okul Türüne Göre Grup / Çalgı / Norm Çarpanını Değerlendirir
     * @param {Object} course - Ders nesnesi
     * @param {number} studentCount - Şube öğrenci sayısı
     * @param {string} schoolType - Okul türü
     * @returns {Object} { groupCount, calculatedLoad, note }
     */
    evaluateCourseMultiplier(course, studentCount, schoolType = "") {
        const baseHours = parseInt(course.saat || course.ders_saati || 0, 10);
        if (isNaN(baseHours) || baseHours <= 0) {
            return { groupCount: 1, calculatedLoad: 0, note: "" };
        }

        const cName = this.normalizeText(course.ders || course.ders_adi || "");
        const sType = String(schoolType || "").toLowerCase();
        const isMesem = sType.includes("mesleki_egitim_merkezi") || sType.includes("mesem");

        const matchesCourse = (pattern) => {
            return cName.includes(this.normalizeText(pattern));
        };

        // 0. MESEM Özel Kuralı (Madde 22/2): Okuldaki alan/dal derslerinde şubeler gruplara BÖLÜNMEZ.
        if (isMesem) {
            return {
                groupCount: 1,
                calculatedLoad: baseHours,
                note: matchesCourse("İŞLETMELERDE MESLEKİ EĞİTİM") ? "MESEM Staj Yükü (Madde 22/2 Bareminde Hesaplanır)" : ""
            };
        }

        // 1. Güzel Sanatlar Bire Bir Çalgı Eğitimi (1 Öğretmen / 1 Öğrenci - Madde 22/4-a)
        if (matchesCourse("BİREYSEL ÇALGI") || matchesCourse("BIREYSEL CALGI") || matchesCourse("ÇALGI EĞİTİMİ") || matchesCourse("CALGI EGITIMI")) {
            const count = Math.max(1, parseInt(studentCount, 10) || 1);
            const load = baseHours * count;
            return {
                groupCount: count,
                calculatedLoad: load,
                note: `Bireysel Çalgı (1'e 1 - Md. 22/4-a): ${count} öğrenci x ${baseHours} saat = ${load}s yük`
            };
        }

        // 2. Güzel Sanatlar Ses Eğitimi (2'şer Kişilik Grup)
        if (matchesCourse("SES EĞİTİMİ") || matchesCourse("SES EGITIMI")) {
            const groups = Math.max(1, Math.ceil(studentCount / 2));
            return {
                groupCount: groups,
                calculatedLoad: baseHours * groups,
                note: `Ses Eğitimi (2'li Grup): ${groups} grup x ${baseHours} saat = ${baseHours * groups}s yük`
            };
        }

        // 3. Anadolu İmam Hatip Lisesi Kur'an-ı Kerim 25+ Kuralı
        if ((matchesCourse("KUR'AN") || matchesCourse("KURAN")) && !matchesCourse("ANLAM")) {
            if (studentCount > 25) {
                return {
                    groupCount: 2,
                    calculatedLoad: baseHours * 2,
                    note: `Kur'an-ı Kerim (25+ Mevcut): 2 grup x ${baseHours} saat = ${baseHours * 2}s yük`
                };
            }
        }

        // 4. Mesleki ve Teknik SADECE Uygulamalı / Atölye / Laboratuvar Dersleri (OÖKY Md. 100 & Norm Yön. Md. 22/1-ç)
        const isTrueAtolye = matchesCourse("ATÖLYE") ||
                             matchesCourse("ATOLYE") ||
                             matchesCourse("LABORATUVAR") ||
                             matchesCourse("UYGULAMALARI") ||
                             matchesCourse("İŞLETMELERDE MESLEKİ EĞİTİM") ||
                             (course.isAtolye === true && !matchesCourse("HUKUK DİLİ") && !matchesCourse("TERMİNOLOJİ"));

        const isVocationalSchool = sType.includes("meslek") || sType.includes("teknik") || schoolType.includes("AMP") || schoolType.includes("ATP");

        if (isTrueAtolye && (isVocationalSchool || course.isAtolye)) {
            const groups = this.calculateWorkshopGroups(studentCount);
            return {
                groupCount: groups,
                calculatedLoad: baseHours * groups,
                note: groups > 1 ? `Atölye/Lab (Md. 22/1-ç): ${studentCount} öğrenci ➔ ${groups} grup x ${baseHours}s = ${baseHours * groups}s yük` : ""
            };
        }

        // Standart Kültür ve Teorik Alan Dersi (1 Grup)
        return {
            groupCount: 1,
            calculatedLoad: baseHours,
            note: ""
        };
    }

    normalizeText(str) {
        let s = String(str || "").toLowerCase();
        s = s.replace(/i̇/g, 'i').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
        s = s.replace(/[\(\)\[\]\.,\/\-]/g, ' ');
        return s.replace(/\s+/g, ' ').trim();
    }

    /**
     * Branş Norm Doğrulaması (Kullanıcı Kuralı: Tüm derslerde branş kısıtlaması kaldırıldı, atanan her branş doğrudan norma dahil edilir)
     * @param {string} branchName - Atanan branş adı
     * @param {string} courseName - Ders adı
     * @returns {Object} { isValidForNorm, isYanDers, reason }
     */
    validateBranchAssignment(branchName, courseName) {
        if (!branchName || branchName.trim() === "") {
            return { isValidForNorm: false, isYanDers: false, isUnassigned: true, reason: "Branş atanmadı." };
        }

        // KULLANICI KURALI: Tüm derslerde (Ortak, Meslek, Seçmeli vb.) yandal/yan alan kısıtlaması kaldırıldı.
        // Seçilen her ders atanan branşın norm hesabına doğrudan dahil edilir.
        return { isValidForNorm: true, isYanDers: false, reason: "Norma dahil ders yükü" };
    }

    /**
     * MEB Norm Kadro Yönetmeliği Madde 18 ve Madde 20 Matematiksel Formülü
     * @param {number} totalHours - Branşın toplam haftalık ders yükü
     * @param {string} schoolType - Okul türü
     * @param {string} branchName - Branş adı
     * @returns {Object} { normCount, formulaExplanation }
     */
    calculateBranchNorm(totalHours, schoolType = "", branchName = "") {
        if (totalHours <= 0) {
            return { normCount: 0, formulaExplanation: "Ders yükü 0 saat." };
        }

        // Genel Ortaöğretim / Mesleki Eğitim (Madde 18) Standart Norm Formülü
        if (totalHours >= 6 && totalHours <= 30) {
            return { normCount: 1, formulaExplanation: `6 - 30 saat arası: 1 Norm Kadro (Fiili Yük: ${totalHours}s)` };
        } else if (totalHours >= 31 && totalHours <= 42) {
            return { normCount: 2, formulaExplanation: `31 - 42 saat arası: 2 Norm Kadro (Fiili Yük: ${totalHours}s)` };
        } else if (totalHours > 42) {
            const extra = totalHours - 42;
            const extraNorm = Math.floor(extra / 21) + (extra % 21 >= 15 ? 1 : 0);
            const total = 2 + extraNorm;
            return { 
                normCount: total, 
                formulaExplanation: `42 saat: 2 Norm + Kalan ${extra} saat için ${extraNorm} Norm (21 saatte bir + 15 saat artık norm) = Toplam ${total} Norm (Fiili Yük: ${totalHours}s)` 
            };
        } else {
            return { normCount: 0, formulaExplanation: `6 saatin altında (${totalHours}s): Norm verilmez.` };
        }
    }

    /**
     * Tüm Okulun Norm ve Branş Dağılımını Hesaplar
     * @param {Array} subeler - Sınıf/Şube listesi
     * @param {Object} existingTeachers - Mevcut kadrolu öğretmen sayıları { "Matematik": 2 }
     * @param {string} schoolType - Okul türü
     * @returns {Object} Detaylı norm analiz raporu
     */
    calculateSchoolNorms(subeler = [], existingTeachers = {}, schoolType = "", coordinatorHoursMap = {}) {
        const branchLoadMap = {};
        const branchCourseDetails = {};
        const handledMergedPairs = new Set();
        const branchesWithGrade12Vocational = new Set();

        subeler.forEach(sec => {
            const isGrade12 = String(sec.sinifSeviyesi) === "12";
            const allCourses = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
            const studentCount = sec.ogrenciSayisi || 30;

            allCourses.forEach(course => {
                const cName = course.ders || course.ders_adi;
                let assignedBranch = (course.atananBrans !== undefined && course.atananBrans !== null && course.atananBrans !== "") ? course.atananBrans : (course.varsayilanBrans || cName);

                // Branş atanmamışsa (boş bırakılmışsa) norm yükü hesaplamasını atla
                if (!assignedBranch || assignedBranch.trim() === "" || assignedBranch === "— Branş Atanmadı —" || assignedBranch === "Diğer") {
                    return;
                }

                // Kanonik Branş Normalizasyonu (T.C. İnkılap Tarihi -> Tarih, Sağlık Bilgisi -> Biyoloji vb.)
                const normB = this.normalizeText(assignedBranch);
                if (normB.includes("inkilap") || normB === "tarih") {
                    assignedBranch = "Tarih";
                } else if (normB === "turkdiliveedebiyati" || normB === "turkedebiyati" || normB === "dilveanlatim") {
                    assignedBranch = "Türk Dili ve Edebiyatı";
                } else if (normB === "matematik" || normB === "temelmatematik" || normB === "ilerimatematik") {
                    assignedBranch = "Matematik";
                } else if (normB === "fizik") {
                    assignedBranch = "Fizik";
                } else if (normB === "kimya") {
                    assignedBranch = "Kimya";
                } else if (normB === "biyoloji" || normB.includes("saglikbilgisi") || normB.includes("trafik")) {
                    assignedBranch = "Biyoloji";
                } else if (normB === "cografya") {
                    assignedBranch = "Coğrafya";
                } else if (normB === "felsefe" || normB === "sosyoloji" || normB === "psikoloji" || normB === "mantik") {
                    assignedBranch = "Felsefe";
                } else if (normB.includes("dinkulturu")) {
                    assignedBranch = "Din Kültürü ve Ahlak Bilgisi";
                } else if (normB === "ingilizce" || normB === "yabancidil" || normB === "birinciyabancidil" || normB.includes("yabancidil") || normB.includes("ingilizce")) {
                    assignedBranch = "İngilizce";
                } else if (normB === "almanca" || normB === "ikinciyabancidil" || normB.includes("almanca")) {
                    assignedBranch = "Almanca";
                } else if (normB.includes("bedenegitimi")) {
                    assignedBranch = "Beden Eğitimi";
                } else if (normB === "gorselsanatlar") {
                    assignedBranch = "Görsel Sanatlar";
                } else if (normB === "muzik") {
                    assignedBranch = "Müzik";
                } else if (normB.includes("rehberlik")) {
                    assignedBranch = "Rehberlik";
                }

                if (isGrade12 && (course.isAtolye || course.isElectiveVocational || String(course.kategori || '').includes('MESLEK') || String(cName).includes('İŞLETME') || String(cName).includes('STAJ'))) {
                    branchesWithGrade12Vocational.add(assignedBranch);
                }

                // Sınıf Birleştirme Kontrolü
                const mergedWith = course.birlesikSubeler || [];
                if (mergedWith.length > 0) {
                    const groupKey = [sec.id, ...mergedWith].sort().join("___") + "::" + cName;
                    if (handledMergedPairs.has(groupKey)) {
                        return;
                    }
                    handledMergedPairs.add(groupKey);
                }

                // Grup / Çalgı / Atölye Katsayısı Hesabı
                const mult = this.evaluateCourseMultiplier(course, studentCount, schoolType);
                const load = mult.calculatedLoad;

                if (!branchLoadMap[assignedBranch]) {
                    branchLoadMap[assignedBranch] = 0;
                    branchCourseDetails[assignedBranch] = [];
                }

                branchLoadMap[assignedBranch] += load;
                branchCourseDetails[assignedBranch].push({
                    sectionName: sec.subeAdi,
                    courseName: cName,
                    baseHours: course.saat || course.ders_saati || 0,
                    calculatedLoad: load,
                    note: mult.note
                });
            });
        });

        // İşletmelerde Mesleki Eğitim / Koordinatörlük Yüklerinin İlavesi
        // Dayanak: MEB Norm Kadro Yönetmeliği Madde 22/2-3 (MESEM) ve OÖKY Md. 88 / Ek Ders Kararı Md. 15 (MTAL)
        const isVocationalSchool = String(schoolType).includes("meslek") || String(schoolType).includes("teknik") || String(schoolType).includes("mtegm") || subeler.some(s => s.alanId);
        const isMesem = String(schoolType).includes("mesleki_egitim_merkezi") || String(schoolType).includes("mesem");

        // MESEM İçin Alan Bazlı Toplam Çırak Sayılarının Hesaplanması
        const mesemBranchStudentCounts = {};
        if (isMesem) {
            subeler.forEach(sec => {
                const sCount = parseInt(sec.ogrenciSayisi, 10) || 0;
                const allCourses = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
                const vocCourses = allCourses.filter(c => c.isAtolye || String(c.kategori || '').includes('MESLEK') || String(c.ders || '').includes('İŞLETME'));
                const assignedBranches = new Set(vocCourses.map(c => c.atananBrans).filter(Boolean));
                
                assignedBranches.forEach(bName => {
                    mesemBranchStudentCounts[bName] = (mesemBranchStudentCounts[bName] || 0) + sCount;
                });
            });
        }

        const allVocationalOrCustomCoordinatorBranches = isVocationalSchool ? new Set([
            ...branchesWithGrade12Vocational,
            ...Object.keys(mesemBranchStudentCounts),
            ...Object.keys(coordinatorHoursMap || {})
        ]) : new Set();

        const branchCoordinatorMap = {};

        allVocationalOrCustomCoordinatorBranches.forEach(branchName => {
            let coordHours = 0;
            let coordNote = "";

            if (coordinatorHoursMap && coordinatorHoursMap[branchName] !== undefined) {
                coordHours = parseInt(coordinatorHoursMap[branchName], 10) || 0;
                coordNote = isMesem ? "MESEM İşletmelerde Meslek Eğitimi (Kullanıcı Tanımlı)" : "İşletmelerde Mesleki Eğitim Koordinatörlüğü (Kullanıcı Tanımlı)";
            } else if (isMesem && mesemBranchStudentCounts[branchName] !== undefined) {
                // MESEM Madde 22/2 Formülü: Toplam Çırak Sayısı ➔ Grup Baremi x 32 Saat
                const totalCirak = mesemBranchStudentCounts[branchName];
                const groups = this.calculateMesemApprenticeGroups(totalCirak);
                coordHours = groups * 32;
                coordNote = `MEB Norm Kadro Yön. Md. 22/2: ${totalCirak} çırak ➔ ${groups} grup x 32s = ${coordHours}s İşletmelerde Mesleki Eğitim Yükü`;
            } else if (branchesWithGrade12Vocational.has(branchName)) {
                // Varsayılan MEB MTAL önerisi: 10 Saat
                coordHours = 10;
                coordNote = "MEB OÖKY Md. 88 / Ek Ders Kararı Md. 15 (12. Sınıf İşletme Koordinatörlüğü)";
            }

            if (coordHours > 0) {
                if (!branchLoadMap[branchName]) {
                    branchLoadMap[branchName] = 0;
                    branchCourseDetails[branchName] = [];
                }
                branchLoadMap[branchName] += coordHours;
                branchCoordinatorMap[branchName] = coordHours;

                branchCourseDetails[branchName].push({
                    sectionName: isMesem ? "Tüm Sınıflar Çıraklık" : "12. Sınıf Staj",
                    courseName: "İşletmelerde Mesleki Eğitim",
                    baseHours: coordHours,
                    calculatedLoad: coordHours,
                    note: coordNote,
                    isCoordinator: true
                });
            }
        });

        const branchReport = [];
        let totalCalculatedNorm = 0;
        let totalCurrentTeachers = 0;
        let totalSurplus = 0;
        let totalNeeded = 0;

        const allBranchesSet = new Set([
            ...Object.keys(branchLoadMap),
            ...Object.keys(existingTeachers)
        ]);

        // Rehberlik branşı ders yükü listesinde görünmesin (Sınıf rehberliği yükü branş öğretmenlerine yazılır)
        allBranchesSet.delete("Rehberlik");
        allBranchesSet.delete("Rehberlik ve Psikolojik Danışmanlık");
        allBranchesSet.delete("Rehberlik / Psikolojik Danışmanlık");

        // Özel Eğitim Sınıfları Kontrolü (MEB Norm Kadro Yön. Md. 17/1-c Kuralı: 1 Şube = 2 Norm)
        const specialEduSections = subeler.filter(s => s.isSpecialEdu || (s.subeAdi && s.subeAdi.includes("Özel Eğt")) || (s.dalAdi && s.dalAdi.includes("Özel Eğit")));
        const specialEduSectionCount = specialEduSections.length;
        
        if (specialEduSectionCount > 0) {
            allBranchesSet.delete("Özel Eğitim");
            const specialEduNorm = specialEduSectionCount * 2;
            const specialEduHours = specialEduSections.reduce((sum, s) => {
                const h = [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])].reduce((dsum, d) => dsum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
                return sum + (h > 0 ? h : 30);
            }, 0);
            
            const currentTeachers = parseInt(existingTeachers["Özel Eğitim"] || 0, 10);
            const diff = currentTeachers - specialEduNorm;
            let statusText = "Tam";
            let statusType = "tam";
            let statusBadge = "Tam";
            if (diff > 0) {
                statusText = `${diff} Fazlalık`;
                statusType = "fazla";
                statusBadge = `+${diff} Fazla`;
                totalSurplus += diff;
            } else if (diff < 0) {
                statusText = `${Math.abs(diff)} İhtiyaç`;
                statusType = "ihtiyac";
                statusBadge = `${diff} İhtiyaç`;
                totalNeeded += Math.abs(diff);
            }

            totalCalculatedNorm += specialEduNorm;
            totalCurrentTeachers += currentTeachers;

            branchReport.push({
                branchName: "Özel Eğitim",
                totalHours: specialEduHours,
                calculatedNorm: specialEduNorm,
                currentTeachers: currentTeachers,
                coordinatorHours: 0,
                diff: diff,
                statusText: statusText,
                statusType: statusType,
                statusBadge: statusBadge,
                formulaExplanation: `MEB Norm Kadro Yön. Md. 17/1-c: Her özel eğitim sınıfı için 2 Norm Kadro (${specialEduSectionCount} Şube x 2 = ${specialEduNorm} Norm)`,
                courses: branchCourseDetails["Özel Eğitim"] || [],
                isSpecialEdu: true
            });
        }

        allBranchesSet.forEach(branchName => {
            const totalHours = branchLoadMap[branchName] || 0;
            const currentTeachers = parseInt(existingTeachers[branchName] || 0, 10);

            // Kullanıcı Talimatı: Ders yükü 0 olan branşlar sağ panel norm listesinde görünmesin
            if (totalHours <= 0) {
                return;
            }

            const normCalc = this.calculateBranchNorm(totalHours, schoolType, branchName);
            const calculatedNorm = normCalc.normCount;

            const diff = currentTeachers - calculatedNorm;
            let statusText = "Tam";
            let statusType = "tam";
            let statusBadge = "Tam";

            if (diff > 0) {
                statusText = `${diff} Fazlalık`;
                statusType = "fazla";
                statusBadge = `+${diff} Fazla`;
                totalSurplus += diff;
            } else if (diff < 0) {
                statusText = `${Math.abs(diff)} İhtiyaç`;
                statusType = "ihtiyac";
                statusBadge = `${diff} İhtiyaç`;
                totalNeeded += Math.abs(diff);
            }

            totalCalculatedNorm += calculatedNorm;
            totalCurrentTeachers += currentTeachers;

            branchReport.push({
                branchName,
                totalHours,
                calculatedNorm,
                currentTeachers,
                coordinatorHours: branchCoordinatorMap[branchName] || 0,
                diff,
                statusText,
                statusType,
                statusBadge,
                formulaExplanation: normCalc.formulaExplanation,
                courses: branchCourseDetails[branchName] || []
            });
        });

        // Ders yükü yüksek olandan düşüğe göre sırala
        branchReport.sort((a, b) => b.totalHours - a.totalHours || b.calculatedNorm - a.calculatedNorm);

        let grandTotalHours = branchReport.reduce((s, b) => s + (b.totalHours || 0), 0);
        let totalStudents = subeler.reduce((sum, s) => sum + (parseInt(s.ogrenciSayisi, 10) || 0), 0);

        // Yönetici / İdareci Norm Kadro Hesabı (Madde 5 - 14)
        const adminNorms = this.calculateAdminNorms(schoolType, totalStudents, coordinatorHoursMap?.adminOptions || {});

        return {
            branchReport,
            totalHours: grandTotalHours,
            totalCalculatedNorm,
            totalCurrentTeachers,
            totalSurplus,
            totalNeeded,
            totalStudents,
            adminNorms
        };
    }

    /**
     * MEB Norm Kadro Yönetmeliği (2014/6459) İkinci Bölüm (Madde 5 - 14)
     * Tüm Okul Türleri İçin Yönetici / İdareci Norm Kadro Hesabı
     * @param {string} schoolType - Okul türü
     * @param {number} totalStudents - Toplam öğrenci/çırak sayısı
     * @param {Object} options - { isPansiyonlu, hasDonerSermaye, isTamGunTamYil, hasStajyer100Plus, hasSigortali500Plus, isTasimaMerkezi, isBirlestirilmis }
     * @returns {Object} Detaylı yönetici norm raporu
     */
    calculateAdminNorms(schoolType = "", totalStudents = 0, options = {}) {
        const sType = String(schoolType || "").toLowerCase();
        const isMesem = sType.includes("mesleki_egitim_merkezi") || sType.includes("mesem");
        const isAnaokulu = sType.includes("anaokulu") || sType.includes("okul_oncesi");
        const isIlkokul = sType.includes("ilkokul");
        const isOzelEgitim = sType.includes("ozel_egitim");
        const isBirlestirilmis = !!options.isBirlestirilmis;

        const count = parseInt(totalStudents, 10) || 0;
        const explanations = [];

        // 1. Müdür Normu (Madde 5)
        let mudurNorm = 1;
        if (isBirlestirilmis) {
            mudurNorm = 0;
            explanations.push("Birleştirilmiş sınıflı ilkokul: Müdür normu verilmez (Müdür Yetkili Öğretmen görevlendirilir - Md. 5/1 & Md. 22/5).");
        } else {
            explanations.push("Bağımsız eğitim kurumu: 1 Müdür norm kadrosu (Md. 5/1).");
        }

        // 2. Temel Müdür Yardımcısı Normu (Öğrenci Sayısına Göre - Md. 7-12)
        let baseMdrYrd = 0;
        let baseNote = "";

        if (isAnaokulu) {
            if (count >= 501) { baseMdrYrd = 2; baseNote = "501+ öğrenci: 2 Mdr. Yrd. (Md. 7/1-b)"; }
            else if (count >= 100) { baseMdrYrd = 1; baseNote = "100-500 öğrenci: 1 Mdr. Yrd. (Md. 7/1-a)"; }
            else { baseMdrYrd = 0; baseNote = "100 öğrenci altı: Mdr. Yrd. normu verilmez (Md. 7/1)"; }
        } else if (isIlkokul) {
            if (count >= 2401) { baseMdrYrd = 5; baseNote = "2401+ öğrenci: 5 Mdr. Yrd. (Md. 8/1-d)"; }
            else if (count >= 1801) { baseMdrYrd = 4; baseNote = "1801-2400 öğrenci: 4 Mdr. Yrd. (Md. 8/1-ç)"; }
            else if (count >= 1201) { baseMdrYrd = 3; baseNote = "1201-1800 öğrenci: 3 Mdr. Yrd. (Md. 8/1-c)"; }
            else if (count >= 601) { baseMdrYrd = 2; baseNote = "601-1200 öğrenci: 2 Mdr. Yrd. (Md. 8/1-b)"; }
            else if (count >= 100) { baseMdrYrd = 1; baseNote = "100-600 öğrenci: 1 Mdr. Yrd. (Md. 8/1-a)"; }
            else { baseMdrYrd = 0; baseNote = "100 öğrenci altı: Mdr. Yrd. normu verilmez (Md. 8/1)"; }
        } else if (isMesem) {
            if (count >= 1201) { baseMdrYrd = 4; baseNote = "1201+ çırak: 4 Mdr. Yrd. (Md. 12/1-ç)"; }
            else if (count >= 801) { baseMdrYrd = 3; baseNote = "801-1200 çırak: 3 Mdr. Yrd. (Md. 12/1-c)"; }
            else if (count >= 401) { baseMdrYrd = 2; baseNote = "401-800 çırak: 2 Mdr. Yrd. (Md. 12/1-b)"; }
            else { baseMdrYrd = 1; baseNote = "400 çırağa kadar: 1 Mdr. Yrd. (Md. 12/1-a)"; }
        } else if (isOzelEgitim) {
            if (count <= 50) { baseMdrYrd = 1; baseNote = "50 öğrenciye kadar: 1 Mdr. Yrd. (Md. 11/1-a)"; }
            else if (count <= 125) { baseMdrYrd = 2; baseNote = "51-125 öğrenci: 2 Mdr. Yrd. (Md. 11/1-b)"; }
            else {
                baseMdrYrd = 2 + Math.floor((count - 125) / 150);
                baseNote = `126+ öğrenci: 2 + her 150 öğrenciye 1 = ${baseMdrYrd} Mdr. Yrd. (Md. 11/1-c)`;
            }
        } else {
            // Ortaokul, İmam Hatip Ortaokulu ve Tüm Liseler (OGM, DÖGM, MTAL) - Md. 9 & Md. 10
            if (count >= 2001) { baseMdrYrd = 5; baseNote = "2001+ öğrenci: 5 Mdr. Yrd. (Md. 9/1-d & Md. 10/1-d)"; }
            else if (count >= 1501) { baseMdrYrd = 4; baseNote = "1501-2000 öğrenci: 4 Mdr. Yrd. (Md. 9/1-ç & Md. 10/1-ç)"; }
            else if (count >= 1001) { baseMdrYrd = 3; baseNote = "1001-1500 öğrenci: 3 Mdr. Yrd. (Md. 9/1-c & Md. 10/1-c)"; }
            else if (count >= 501) { baseMdrYrd = 2; baseNote = "501-1000 öğrenci: 2 Mdr. Yrd. (Md. 9/1-b & Md. 10/1-b)"; }
            else { baseMdrYrd = 1; baseNote = "500 öğrenciye kadar: 1 Mdr. Yrd. (Md. 9/1-a & Md. 10/1-a)"; }
        }

        explanations.push(`Temel Müdür Yardımcısı Normu: ${baseMdrYrd} (${baseNote})`);

        // 3. İlave Müdür Yardımcısı Normları (Madde 14)
        let extraMdrYrd = 0;
        const extraDetails = [];

        if (options.isPansiyonlu) {
            extraMdrYrd += 1;
            extraDetails.push("Yatılı/Pansiyonlu Kurum (+1 Md. 14/1-a)");
        }
        if (options.hasDonerSermaye) {
            extraMdrYrd += 1;
            extraDetails.push("Döner Sermaye İşletmesi (+1 Md. 14/1-b)");
        }
        if (options.isTamGunTamYil) {
            extraMdrYrd += 1;
            extraDetails.push("Tam Gün Tam Yıl / Açık Öğretim Yüzyüze (+1 Md. 14/1-c)");
        }
        if (options.hasStajyer100Plus) {
            extraMdrYrd += 1;
            extraDetails.push("3308 Kapsamında 100+ İşletme Stajyeri (+1 Md. 14/1-ç)");
        }
        if (options.hasSigortali500Plus) {
            extraMdrYrd += 1;
            extraDetails.push("3308 Md. 25 Kapsamında 500+ Sigortalı Çırak (+1 Md. 14/1-d)");
        }
        if (options.isTasimaMerkezi) {
            extraMdrYrd += 1;
            extraDetails.push("Taşıma Eğitim Merkezi (+1 Md. 14/1-e)");
        }

        let totalMdrYrd = baseMdrYrd + extraMdrYrd;

        // 4. Azami Tavan Sınırı Kontrolü (Madde 14/2)
        const maxLimit = count < 1500 ? 6 : 7;
        if (totalMdrYrd > maxLimit) {
            explanations.push(`İlave normlarla hesaplanan ${totalMdrYrd} Mdr. Yrd., yasal üst tavan sınırına (${maxLimit}) çekildi (Md. 14/2).`);
            totalMdrYrd = maxLimit;
        }

        if (extraDetails.length > 0) {
            explanations.push(`İlave Müdür Yardımcısı Hakları: +${extraMdrYrd} [${extraDetails.join(', ')}]`);
        }

        // 5. Müdür Başyardımcısı Normu (Madde 6)
        let mudurBasYrd = 0;
        if (options.isPansiyonlu) {
            mudurBasYrd = 1;
            explanations.push("Yatılı/Pansiyonlu Kurum: 1 Müdür Başyardımcısı normu (Md. 6/1-a).");
        } else if (totalMdrYrd >= 6) {
            mudurBasYrd = 1;
            explanations.push("Müdür Yardımcısı sayısı 6 olan kurum: 1 Müdür Başyardımcısı normu (Md. 6/1-b).");
        }

        const grandTotal = mudurNorm + mudurBasYrd + totalMdrYrd;

        return {
            mudur: mudurNorm,
            mudurBasyardimcisi: mudurBasYrd,
            mudurYardimcisiBase: baseMdrYrd,
            mudurYardimcisiExtra: extraMdrYrd,
            mudurYardimcisiTotal: totalMdrYrd,
            toplamYonetici: grandTotal,
            explanations: explanations
        };
    }
}

const normEngine = new NormEngine();


// ==================== reportsEngine.js ====================

/**
 * MEB Norm Kadro ve Ders Yükü Yönetim Sistemi
 * reportsEngine.js - Profesyonel Raporlama, Master Grid Matrisi ve Analitik Motoru
 */

class MebReportsEngine {
    constructor(dbService, normEngine, curriculumEngine) {
        this.db = dbService;
        this.normEngine = normEngine;
        this.curriculum = curriculumEngine;
    }

    // --- 1. OKUL İCMAL VE YÖNETİCİ ÖZETİ RAPORU ---
    generateExecutiveSummary(state) {
        const subeler = state.subeler || [];
        const existingTeachers = state.mevcutOgretmenler || {};
        const schoolInfo = state.okulBilgisi || {};
        const schoolType = schoolInfo.okulTuru || "";

        const coordinatorMap = { ...(state.koordinatorlukYukleri || {}) };
        coordinatorMap.adminOptions = schoolInfo.adminOptions || {};

        const normResult = this.normEngine.calculateSchoolNorms(subeler, existingTeachers, schoolType, coordinatorMap);
        
        let totalStudents = 0;
        let baseWeeklyHours = 0;
        let gradeCounts = {};
        subeler.forEach(s => {
            totalStudents += (parseInt(s.ogrenciSayisi, 10) || 0);
            const g = s.sinifSeviyesi || "Diğer";
            gradeCounts[g] = (gradeCounts[g] || 0) + 1;
            const allC = [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])];
            allC.forEach(c => { baseWeeklyHours += (parseInt(c.saat || c.ders_saati || 0, 10)); });
        });

        // Durum analizi
        let tamCount = 0;
        let ihtiyacCount = 0;
        let fazlaCount = 0;

        normResult.branchReport.forEach(b => {
            if (b.statusType === 'tam') tamCount++;
            else if (b.statusType === 'ihtiyac') ihtiyacCount++;
            else if (b.statusType === 'fazla') fazlaCount++;
        });

        return {
            reportType: "EXECUTIVE_SUMMARY",
            title: "Okul Geneli Norm ve Ders Yükü Yönetici İcmal Raporu",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            kpis: {
                totalHours: normResult.totalHours,
                baseWeeklyHours: baseWeeklyHours,
                totalCalculatedNorm: normResult.totalCalculatedNorm,
                totalCurrentTeachers: normResult.totalCurrentTeachers,
                totalNeeded: normResult.totalNeeded,
                totalSurplus: normResult.totalSurplus,
                totalSections: subeler.length,
                totalStudents: totalStudents,
                tamBranchesCount: tamCount,
                ihtiyacBranchesCount: ihtiyacCount,
                fazlaBranchesCount: fazlaCount,
                adminNorms: normResult.adminNorms
            },
            adminNorms: normResult.adminNorms,
            gradeCounts: gradeCounts,
            branchReport: normResult.branchReport
        };
    }

    // --- 2. OKUL MASTER BRANŞ-ŞUBE DERS YÜKÜ MATRİSİ (GRID TABLE) ---
    generateMasterLoadGrid(state, filterGrade = "ALL") {
        const rawSubeler = state.subeler || [];
        const existingTeachers = state.mevcutOgretmenler || {};
        const schoolInfo = state.okulBilgisi || {};
        const schoolType = schoolInfo.okulTuru || "";

        // Şube Filtresi
        const subeler = rawSubeler.filter(s => {
            if (filterGrade === "ALL") return true;
            return String(s.sinifSeviyesi) === String(filterGrade);
        });

        // Şubeleri sınıf seviyesi ve adına göre sırala
        subeler.sort((a, b) => {
            const ga = parseInt(a.sinifSeviyesi, 10) || 99;
            const gb = parseInt(b.sinifSeviyesi, 10) || 99;
            if (ga !== gb) return ga - gb;
            return a.subeAdi.localeCompare(b.subeAdi, 'tr');
        });

        const normResult = this.normEngine.calculateSchoolNorms(rawSubeler, existingTeachers, schoolType, state.koordinatorlukYukleri || {});
        const branchReportMap = {};
        normResult.branchReport.forEach(b => {
            branchReportMap[b.branchName] = b;
        });

        // 1. Verileri Branş -> Ders -> Şube Saatleri Hiyerarşisinde Topla
        // branchData[branchName] = { isVocational: bool, areaCode: str, courses: { [courseName]: { sectionHours: { [secId]: hours }, totalHours: num } }, totalHours: num }
        const branchGroups = {};
        const handledMergedPairs = new Set();

        subeler.forEach(sec => {
            const allCourses = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
            allCourses.forEach(c => {
                const rawCName = c.ders || c.ders_adi;
                if (!rawCName) return;
                const hours = parseInt(c.saat || c.ders_saati || 0, 10);
                if (hours <= 0) return;

                // Kanonik İsim ve Branş Çözümleme (Büyük/küçük harf ve sahte branş çiftliklerini birleştirir)
                let resolved = { courseName: rawCName, branchName: c.atananBrans };
                if (this.curriculum && typeof this.curriculum.getCanonicalCourseAndBranch === 'function') {
                    resolved = this.curriculum.getCanonicalCourseAndBranch(rawCName, c.atananBrans, sec.alanId, c.kategori || "ORTAK DERSLER");
                } else if (this.db && typeof this.db.resolveBranch === 'function') {
                    resolved.branchName = this.db.resolveBranch(rawCName, sec.alanId, c.kategori || "ORTAK DERSLER");
                }

                const cName = resolved.courseName;
                const brans = resolved.branchName || c.varsayilanBrans || rawCName;

                const isVoc = (c.kategori || "").includes("MESLEK") || (c.kategori || "").includes("ALAN") || (c.kategori || "").includes("DAL") || !!c.isAtolye || !!c.isVocational || (this.db && this.db.getVocationalBranchesList && this.db.getVocationalBranchesList().includes(brans));

                if (!branchGroups[brans]) {
                    branchGroups[brans] = {
                        branchName: brans,
                        isVocational: isVoc,
                        areaCode: sec.alanId || null,
                        courses: {},
                        totalHours: 0
                    };
                } else if (isVoc) {
                    branchGroups[brans].isVocational = true;
                }

                if (!branchGroups[brans].courses[cName]) {
                    branchGroups[brans].courses[cName] = {
                        courseName: cName,
                        kategori: c.kategori || "ORTAK DERSLER",
                        isBaraj: !!c.baraj_ders,
                        isAtolye: !!c.isAtolye,
                        sectionHours: {},
                        mergedSections: {},
                        totalHours: 0
                    };
                }

                // Dersin bu şubedeki saati (şube çizelgesinde görünür)
                branchGroups[brans].courses[cName].sectionHours[sec.id] = hours;

                // Sınıf birleştirme kontrolü (aynı birleşik ders grubunu mükerrer öğretmen yükü olarak sayma)
                const mergedWith = c.birlesikSubeler || [];
                let isMergedDuplicate = false;
                if (mergedWith.length > 0) {
                    branchGroups[brans].courses[cName].mergedSections[sec.id] = mergedWith;
                    const groupKey = [sec.id, ...mergedWith].sort().join("___") + "::" + cName;
                    if (handledMergedPairs.has(groupKey)) {
                        isMergedDuplicate = true;
                    } else {
                        handledMergedPairs.add(groupKey);
                    }
                }

                if (!isMergedDuplicate) {
                    branchGroups[brans].courses[cName].totalHours += hours;
                    branchGroups[brans].totalHours += hours;
                }
            });
        });

        // Koordinatörlük yükleri varsa branş toplamlarına yansıt
        const coordMap = state.koordinatorlukYukleri || {};
        Object.entries(coordMap).forEach(([br, val]) => {
            const numVal = parseInt(val, 10) || 0;
            if (numVal > 0 && branchGroups[br]) {
                branchGroups[br].totalHours += numVal;
            }
        });

        // Eğer normResult içinde branş raporu varsa, branş toplam yükünü normEngine ile %100 senkronize et
        Object.keys(branchGroups).forEach(bName => {
            if (branchReportMap[bName] && branchReportMap[bName].totalHours !== undefined) {
                branchGroups[bName].totalHours = branchReportMap[bName].totalHours;
            }
        });

        // Branşları alfabetik sırala (Önce Alan/Meslek Branşları, Sonra Genel Kültür Branşları)
        const sortedBranchNames = Object.keys(branchGroups).sort((a, b) => {
            const isVocA = branchGroups[a].isVocational;
            const isVocB = branchGroups[b].isVocational;
            if (isVocA !== isVocB) return isVocA ? -1 : 1;
            return a.localeCompare(b, 'tr');
        });

        // Şube bazlı sütun toplam saatleri
        const sectionTotals = {};
        subeler.forEach(s => {
            let totalSecH = 0;
            const allC = [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])];
            allC.forEach(c => { totalSecH += (parseInt(c.saat || c.ders_saati || 0, 10)); });
            sectionTotals[s.id] = totalSecH;
        });

        return {
            reportType: "MASTER_LOAD_GRID",
            title: "Okul Master Ders Dağıtım ve Branş-Şube Yük Matrisi",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            subeler: subeler,
            sectionTotals: sectionTotals,
            sortedBranchNames: sortedBranchNames,
            branchGroups: branchGroups,
            branchReportMap: branchReportMap,
            grandTotalHours: normResult.totalHours || Object.values(sectionTotals).reduce((s, h) => s + h, 0)
        };
    }

    // --- 3. BRANŞ BAZLI DETAYLI NORM VE DERS CETVELİ ---
    generateBranchDetailReport(state, targetBranch = "ALL") {
        const subeler = state.subeler || [];
        const existingTeachers = state.mevcutOgretmenler || {};
        const schoolInfo = state.okulBilgisi || {};
        const schoolType = schoolInfo.okulTuru || "";

        const normResult = this.normEngine.calculateSchoolNorms(subeler, existingTeachers, schoolType, state.koordinatorlukYukleri || {});

        const filteredBranches = normResult.branchReport.filter(b => {
            if (targetBranch === "ALL") return true;
            return b.branchName.toLowerCase() === targetBranch.toLowerCase();
        });

        return {
            reportType: "BRANCH_DETAIL",
            title: "Branş Bazlı Ders Dağılımı ve Norm Hesaplama Cetveli",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            targetBranch: targetBranch,
            branches: filteredBranches
        };
    }

    // --- 4. SINIF VE ŞUBE HAFTALIK DERS ÇİZELGESİ RAPORU ---
    generateSectionScheduleReport(state, filterGrade = "ALL", filterSectionId = "ALL") {
        const rawSubeler = state.subeler || [];
        const schoolInfo = state.okulBilgisi || {};

        const sections = rawSubeler.filter(s => {
            if (filterGrade !== "ALL" && String(s.sinifSeviyesi) !== String(filterGrade)) return false;
            if (filterSectionId !== "ALL" && s.id !== filterSectionId) return false;
            return true;
        });

        sections.sort((a, b) => {
            const ga = parseInt(a.sinifSeviyesi, 10) || 99;
            const gb = parseInt(b.sinifSeviyesi, 10) || 99;
            if (ga !== gb) return ga - gb;
            return a.subeAdi.localeCompare(b.subeAdi, 'tr');
        });

        const detailedSections = sections.map(s => {
            const commonCourses = [];
            const vocationalCourses = [];
            const electiveCourses = [];
            let guidanceCourse = null;

            let totalCommon = 0;
            let totalVocational = 0;
            let totalElective = 0;
            let totalGuidance = 0;

            const allCourses = [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])];

            allCourses.forEach(c => {
                const cName = c.ders || c.ders_adi;
                const hours = parseInt(c.saat || c.ders_saati || 0, 10);
                const kat = (c.kategori || "").toUpperCase();
                const norm = (cName || "").toLowerCase();

                const cObj = {
                    ders: cName,
                    saat: hours,
                    atananBrans: c.atananBrans || "—",
                    kategori: c.kategori,
                    baraj_ders: !!c.baraj_ders,
                    isAtolye: !!c.isAtolye
                };

                if (norm.includes("rehberlik")) {
                    guidanceCourse = cObj;
                    totalGuidance += hours;
                } else if (kat.includes("SEÇMELİ") || c.isElectiveVocational) {
                    electiveCourses.push(cObj);
                    totalElective += hours;
                } else if (kat.includes("MESLEK") || kat.includes("ALAN") || kat.includes("DAL") || c.isAtolye) {
                    vocationalCourses.push(cObj);
                    totalVocational += hours;
                } else {
                    commonCourses.push(cObj);
                    totalCommon += hours;
                }
            });

            return {
                id: s.id,
                subeAdi: s.subeAdi,
                sinifSeviyesi: s.sinifSeviyesi,
                ogrenciSayisi: s.ogrenciSayisi || 30,
                alanId: s.alanId,
                dalAdi: s.dalAdi,
                commonCourses: commonCourses,
                vocationalCourses: vocationalCourses,
                electiveCourses: electiveCourses,
                guidanceCourse: guidanceCourse,
                totals: {
                    common: totalCommon,
                    vocational: totalVocational,
                    elective: totalElective,
                    guidance: totalGuidance,
                    weeklyTotal: totalCommon + totalVocational + totalElective + totalGuidance
                }
            };
        });

        return {
            reportType: "SECTION_SCHEDULE",
            title: "Sınıf ve Şube Haftalık Ders Çizelgeleri Raporu",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            sections: detailedSections
        };
    }

    // --- 5. NORM İHTİYAÇ VE FAZLALIK EYLEM RAPORU (MEBBİS & İL/İLÇE MEM) ---
    generateNormActionReport(state) {
        const subeler = state.subeler || [];
        const existingTeachers = state.mevcutOgretmenler || {};
        const schoolInfo = state.okulBilgisi || {};
        const schoolType = schoolInfo.okulTuru || "";

        const normResult = this.normEngine.calculateSchoolNorms(subeler, existingTeachers, schoolType, state.koordinatorlukYukleri || {});

        const neededList = normResult.branchReport.filter(b => b.difference < 0).map(b => ({
            branchName: b.branchName,
            totalHours: b.totalHours,
            calculatedNorm: b.calculatedNorm,
            currentTeachers: b.currentTeachers,
            neededCount: Math.abs(b.difference),
            reason: `${b.totalHours} saat ders yükü için ${b.calculatedNorm} norm hesaplanmış olup, mevcut kadro (${b.currentTeachers}) yetersizdir.`
        }));

        const surplusList = normResult.branchReport.filter(b => b.difference > 0).map(b => ({
            branchName: b.branchName,
            totalHours: b.totalHours,
            calculatedNorm: b.calculatedNorm,
            currentTeachers: b.currentTeachers,
            surplusCount: b.difference,
            reason: `${b.totalHours} saat ders yükü için ${b.calculatedNorm} norm hesaplanmış olup, ${b.difference} öğretmen norm kadro fazlasıdır.`
        }));

        const balancedList = normResult.branchReport.filter(b => b.difference === 0 && b.calculatedNorm > 0);

        return {
            reportType: "NORM_ACTION_REPORT",
            title: "Norm Kadro İhtiyaç ve Fazlalık Resmi Eylem Raporu",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            totalNeeded: normResult.totalNeeded,
            totalSurplus: normResult.totalSurplus,
            neededList: neededList,
            surplusList: surplusList,
            balancedList: balancedList
        };
    }

    // --- 6. ATÖLYE, LABORATUVAR VE GRUP DAĞILIM RAPORU ---
    generateVocationalLabReport(state) {
        const subeler = state.subeler || [];
        const schoolInfo = state.okulBilgisi || {};
        const schoolType = schoolInfo.okulTuru || "";

        const labData = [];
        let grandBaseHours = 0;
        let grandCalculatedHours = 0;

        subeler.forEach(sec => {
            const allC = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
            const stdCount = parseInt(sec.ogrenciSayisi, 10) || 30;

            allC.forEach(c => {
                const isVoc = (c.kategori || "").includes("MESLEK") || (c.kategori || "").includes("ALAN") || (c.kategori || "").includes("DAL") || !!c.isAtolye || !!c.isVocational;
                if (!isVoc) return;

                const baseH = parseInt(c.saat || c.ders_saati || 0, 10);
                if (baseH <= 0) return;

                const mult = this.normEngine.evaluateCourseMultiplier(c, stdCount, schoolType);
                grandBaseHours += baseH;
                grandCalculatedHours += mult.calculatedLoad;

                labData.push({
                    sectionName: sec.subeAdi,
                    grade: sec.sinifSeviyesi,
                    studentCount: stdCount,
                    courseName: c.ders || c.ders_adi,
                    baseHours: baseH,
                    groupCount: mult.groupCount,
                    calculatedLoad: mult.calculatedLoad,
                    extraLoad: mult.calculatedLoad - baseH,
                    note: mult.note,
                    branchName: c.atananBrans || "Atanmadı"
                });
            });
        });

        return {
            reportType: "VOCATIONAL_LAB_REPORT",
            title: "Atölye, Laboratuvar ve Grup Bölünmeleri Ders Yükü Raporu",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            labCourses: labData,
            grandBaseHours: grandBaseHours,
            grandCalculatedHours: grandCalculatedHours,
            totalExtraGroupHours: grandCalculatedHours - grandBaseHours
        };
    }

    // --- 7. 3-TEMA SEÇMELİ DERS DENGE RAPORU ---
    generateElectiveThemeReport(state) {
        const subeler = state.subeler || [];
        const schoolInfo = state.okulBilgisi || {};

        const themeReport = subeler.map(sec => {
            const electives = sec.secmeliDersler || [];
            const stats = {
                BILIM: { count: 0, hours: 0, courses: [] },
                DEGER: { count: 0, hours: 0, courses: [] },
                SANAT: { count: 0, hours: 0, courses: [] },
                VOC: { count: 0, hours: 0, courses: [] }
            };

            let totalElectiveH = 0;

            electives.forEach(c => {
                const cName = c.ders || c.ders_adi;
                const h = parseInt(c.saat || c.ders_saati || 0, 10);
                totalElectiveH += h;

                const norm = (String(cName) + " " + String(c.kategori || "")).toLowerCase()
                    .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
                    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/['’\-\.\,\(\)]/g, '');

                let themeId = "BILIM";
                if (c.isVocational || c.isElectiveVocational || (c.kategori || "").includes("MESLEK")) {
                    themeId = "VOC";
                } else if (norm.includes("din") || norm.includes("kuran") || norm.includes("peygamber") || norm.includes("siyer") || norm.includes("ahlak") || norm.includes("adab") || norm.includes("deger")) {
                    themeId = "DEGER";
                } else if (norm.includes("sanat") || norm.includes("muzik") || norm.includes("gorsel") || norm.includes("spor") || norm.includes("masal") || norm.includes("oyun") || norm.includes("drama")) {
                    themeId = "SANAT";
                }

                stats[themeId].count += 1;
                stats[themeId].hours += h;
                stats[themeId].courses.push(`${cName} (${h}s)`);
            });

            return {
                sectionName: sec.subeAdi,
                grade: sec.sinifSeviyesi,
                totalElectiveHours: totalElectiveH,
                stats: stats,
                isBalanced: stats.BILIM.count > 0 && stats.DEGER.count > 0 && stats.SANAT.count > 0
            };
        });

        return {
            reportType: "ELECTIVE_THEME_REPORT",
            title: "3-Tema Seçmeli Ders Tercih Dengesi ve Dağılım Analizi",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            themeSections: themeReport
        };
    }

    // --- ÇOKLU SEKME VE KURUMSAL EXCEL (XLSX) ÇIKTI ÜRETİCİ ---
    exportToXLSX(state) {
        let xlsxLib = typeof XLSX !== 'undefined' ? XLSX : (typeof window !== 'undefined' ? window.XLSX : null);
        if (!xlsxLib) {
            console.error("XLSX motoru bulunamadı.");
            return false;
        }

        const wb = xlsxLib.utils.book_new();
        const schoolInfo = state.okulBilgisi || {};
        const okulAdi = schoolInfo.okulAdi || "MEB Okulu";
        const sezon = schoolInfo.sezon || "2026-2027";

        // SEKME 1: YÖNETİCİ İCMALİ VE NORM KADRO DAĞILIMI
        const execData = this.generateExecutiveSummary(state);
        const wsExecRows = [];
        wsExecRows.push(["T.C. MİLLÎ EĞİTİM BAKANLIĞI"]);
        wsExecRows.push([`${okulAdi.toUpperCase()} - NORM KADRO VE DERS YÜKÜ YÖNETİCİ İCMALİ`]);
        wsExecRows.push([`Eğitim-Öğretim Sezonu: ${sezon}`, `Rapor Tarihi: ${new Date().toLocaleString("tr-TR")}`]);
        wsExecRows.push([]);
        
        // Temel İstatistikler
        wsExecRows.push(["--- GENEL OKUL İSTATİSTİKLERİ ---"]);
        wsExecRows.push(["Toplam Şube Sayısı", execData.kpis.totalSections, "Toplam Öğrenci Sayısı", execData.kpis.totalStudents]);
        wsExecRows.push(["Toplam Haftalık Ders Yükü", `${execData.kpis.totalHours} Saat`, "Toplam Hesaplanan Norm", `${execData.kpis.totalCalculatedNorm} Öğretmen`]);
        wsExecRows.push(["Mevcut Kadrolu Öğretmen", `${execData.kpis.totalCurrentTeachers} Öğretmen`, "Toplam Norm İhtiyacı", `${execData.kpis.totalNeeded} Öğretmen`]);
        wsExecRows.push(["Toplam Norm Fazlalığı", `${execData.kpis.totalSurplus} Öğretmen`, "Normu Tam Branş Sayısı", `${execData.kpis.tamBranchesCount} Branş`]);
        wsExecRows.push([]);

        // Yönetici Normları
        if (execData.adminNorms) {
            wsExecRows.push(["--- MEB YÖNETİCİ VE İDARECİ NORM KADRO CETVELİ (MD. 5 - 14) ---"]);
            wsExecRows.push(["Yönetici Görevi", "Norm Sayısı", "Yasal Dayanak ve Mevzuat Açıklaması"]);
            wsExecRows.push(["Okul Müdürü", execData.adminNorms.mudur, "MEB Norm Kadro Yön. Madde 5"]);
            wsExecRows.push(["Müdür Başyardımcısı", execData.adminNorms.mudurBasyardimcisi, "MEB Norm Kadro Yön. Madde 6"]);
            wsExecRows.push(["Müdür Yardımcısı (Toplam)", execData.adminNorms.mudurYardimcisiTotal, `Temel: ${execData.adminNorms.mudurYardimcisiBase} + İlave: ${execData.adminNorms.mudurYardimcisiExtra} (MEB Md. 7-12 & Md. 14)`]);
            wsExecRows.push(["TOPLAM YÖNETİCİ NORMU", execData.adminNorms.toplamYonetici, "—"]);
            wsExecRows.push([]);
        }

        // Branş Norm Tablosu
        wsExecRows.push(["--- BRANŞ BAZLI DERS YÜKÜ VE NORM KADRO TABLOSU ---"]);
        wsExecRows.push(["Sıra", "Branş Adı", "Haftalık Ders Yükü (Saat)", "Hesaplanan Norm", "Mevcut Kadrolu", "Norm Durumu", "Fark / İhtiyaç"]);
        
        execData.branchReport.forEach((b, idx) => {
            const diffText = b.difference > 0 ? `+${b.difference} Fazla` : (b.difference < 0 ? `${b.difference} İhtiyaç` : "0 (Tam)");
            wsExecRows.push([
                idx + 1,
                b.branchName,
                b.totalHours,
                b.calculatedNorm,
                b.currentTeachers,
                b.statusBadge,
                diffText
            ]);
        });

        const wsExec = xlsxLib.utils.aoa_to_sheet(wsExecRows);
        wsExec['!cols'] = [{ wch: 6 }, { wch: 36 }, { wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 18 }];
        xlsxLib.utils.book_append_sheet(wb, wsExec, "Yönetici İcmali & Normlar");


        // SEKME 2: MASTER BRANŞ-ŞUBE DERS YÜKÜ MATRİSİ (GRID)
        const gridData = this.generateMasterLoadGrid(state, "ALL");
        const wsGridRows = [];
        wsGridRows.push(["T.C. MİLLÎ EĞİTİM BAKANLIĞI"]);
        wsGridRows.push([`${okulAdi.toUpperCase()} - OKUL MASTER BRANŞ-ŞUBE DERS DAĞITIM MATRİSİ`]);
        wsGridRows.push([`Sezon: ${sezon}`, `Toplam Şube: ${gridData.subeler.length}`, `Toplam Ders Yükü: ${gridData.grandTotalHours}s`]);
        wsGridRows.push([]);

        // Header
        const gridHeader = ["Sıra", "Branş Adı", "Ders Adı", ...gridData.subeler.map(s => `${s.subeAdi} (${s.sinifSeviyesi}.Snf)`), "Toplam Saat", "Norm Kadro"];
        wsGridRows.push(gridHeader);

        let rowSeq = 1;
        gridData.sortedBranchNames.forEach(bName => {
            const bGroup = gridData.branchGroups[bName];
            const bData = gridData.branchReportMap[bName] || {};

            Object.values(bGroup.courses).forEach(course => {
                const row = [
                    rowSeq++,
                    bName,
                    course.courseName,
                    ...gridData.subeler.map(s => course.sectionHours[s.id] || ""),
                    course.totalHours,
                    bData.calculatedNorm || 0
                ];
                wsGridRows.push(row);
            });
        });

        // Toplam Satırı
        const totalRow = ["", "GENEL TOPLAM", "Tüm Şube Yükleri", ...gridData.subeler.map(s => gridData.sectionTotals[s.id] || 0), gridData.grandTotalHours, "—"];
        wsGridRows.push(totalRow);

        const wsGrid = xlsxLib.utils.aoa_to_sheet(wsGridRows);
        const gridCols = [{ wch: 6 }, { wch: 32 }, { wch: 32 }];
        gridData.subeler.forEach(() => gridCols.push({ wch: 14 }));
        gridCols.push({ wch: 16 }, { wch: 14 });
        wsGrid['!cols'] = gridCols;
        xlsxLib.utils.book_append_sheet(wb, wsGrid, "Master Ders Dağıtım Matrisi");


        // SEKME 3: ŞUBE BAZLI HAFTALIK DERS ÇİZELGELERİ
        const scheduleData = this.generateSectionScheduleReport(state, "ALL", "ALL");
        const wsSchedRows = [];
        wsSchedRows.push(["T.C. MİLLÎ EĞİTİM BAKANLIĞI"]);
        wsSchedRows.push([`${okulAdi.toUpperCase()} - ŞUBE HAFTALIK DERS ÇİZELGELERİ VE DERS DAĞILIMLARI`]);
        wsSchedRows.push([]);

        scheduleData.sections.forEach(sec => {
            wsSchedRows.push([`=== ${sec.subeAdi} (${sec.sinifSeviyesi}. Sınıf - Mevcut: ${sec.ogrenciSayisi} Öğrenci) ===`, `Haftalık Toplam: ${sec.totals.weeklyTotal} Saat`]);
            wsSchedRows.push(["Sıra", "Ders Adı", "Kategori", "Haftalık Saat", "Atanan Branş", "Baraj Ders"]);
            
            const allCourses = [
                ...(sec.commonCourses || []).map(c => ({ ...c, category: "Ortak Zorunlu" })),
                ...(sec.vocationalCourses || []).map(c => ({ ...c, category: "Meslek / Alan / Dal" })),
                ...(sec.electiveCourses || []).map(c => ({ ...c, category: "Seçmeli Ders" })),
                ...(sec.guidanceCourse ? [{ ...sec.guidanceCourse, category: "Rehberlik" }] : [])
            ];

            allCourses.forEach((c, cIdx) => {
                wsSchedRows.push([
                    cIdx + 1,
                    c.ders || c.dersAdi,
                    c.category,
                    c.saat || c.haftalikSaat,
                    c.brans || c.branchName || "—",
                    c.isBaraj ? "BARAJ" : "—"
                ]);
            });
            wsSchedRows.push([]);
        });

        const wsSched = xlsxLib.utils.aoa_to_sheet(wsSchedRows);
        wsSched['!cols'] = [{ wch: 6 }, { wch: 36 }, { wch: 24 }, { wch: 14 }, { wch: 30 }, { wch: 12 }];
        xlsxLib.utils.book_append_sheet(wb, wsSched, "Şube Ders Çizelgeleri");


        // SEKME 4: ATÖLYE, LABORATUVAR VE KOORDİNATÖRLÜK MATRİSİ
        const labData = this.generateVocationalLabReport(state);
        const wsLabRows = [];
        wsLabRows.push(["T.C. MİLLÎ EĞİTİM BAKANLIĞI"]);
        wsLabRows.push([`${okulAdi.toUpperCase()} - MESLEKİ VE TEKNİK ATÖLYE / GRUP BÖLÜNMELERİ RAPORU`]);
        wsLabRows.push([`Toplam Temel Atölye Saati: ${labData.grandBaseHours}s`, `Grup Çarpanlı Fiili Saat: ${labData.grandCalculatedHours}s`, `Oluşan Ek Ders Yükü: +${labData.totalExtraGroupHours}s`]);
        wsLabRows.push([]);
        wsLabRows.push(["Sıra", "Şube", "Sınıf", "Öğrenci Mevcudu", "Ders Adı", "Branş", "Temel Saat", "Grup Sayısı", "Fiili Yük (Saat)", "Ek Yük (+)", "Mevzuat Notu"]);

        labData.labCourses.forEach((lab, lIdx) => {
            wsLabRows.push([
                lIdx + 1,
                lab.sectionName,
                lab.grade,
                lab.studentCount,
                lab.courseName,
                lab.branchName,
                lab.baseHours,
                lab.groupCount,
                lab.calculatedLoad,
                `+${lab.extraLoad}`,
                lab.note
            ]);
        });

        // 12. Sınıf Koordinatörlük Cetveli
        const coordMap = state.koordinatorlukYukleri || {};
        const coordEntries = Object.entries(coordMap).filter(([k, v]) => parseInt(v, 10) > 0);
        if (coordEntries.length > 0) {
            wsLabRows.push([]);
            wsLabRows.push(["--- 12. SINIF İŞLETMELERDE MESLEK EĞİTİMİ (STAJ) KOORDİNATÖRLÜK YÜKLERİ (OÖKY MD. 88) ---"]);
            wsLabRows.push(["Branş Adı", "Haftalık Ek Koordinatörlük Saati", "Yasal Dayanak"]);
            coordEntries.forEach(([br, val]) => {
                wsLabRows.push([br, `${val} Saat`, "MEB Ortaöğretim Kurumları Yönetmeliği Madde 88"]);
            });
        }

        const wsLab = xlsxLib.utils.aoa_to_sheet(wsLabRows);
        wsLab['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 34 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 36 }];
        xlsxLib.utils.book_append_sheet(wb, wsLab, "Atölye & Koordinatörlük");


        // SEKME 5: NORM KADRO EYLEM VE İHTİYAÇ/FAZLALIK PLANI
        const actionData = this.generateNormActionReport(state);
        const wsActRows = [];
        wsActRows.push(["T.C. MİLLÎ EĞİTİM BAKANLIĞI"]);
        wsActRows.push([`${okulAdi.toUpperCase()} - NORM KADRO İHTİYAÇ VE FAZLALIK RESMÎ EYLEM CETVELİ`]);
        wsActRows.push([`Toplam Öğretmen İhtiyacı: ${actionData.totalNeeded}`, `Toplam Norm Fazlası: ${actionData.totalSurplus}`]);
        wsActRows.push([]);

        wsActRows.push(["--- 1. NORM KADRO İHTİYACI OLAN BRANŞLAR (ATAMA / GÖREVLENDİRME TALEBİ) ---"]);
        wsActRows.push(["Sıra", "Branş Adı", "Haftalık Yük", "Hesaplanan Norm", "Mevcut Kadrolu", "İhtiyaç Sayısı", "Gerekçe ve Mevzuat Açıklaması"]);
        actionData.neededList.forEach((n, nIdx) => {
            wsActRows.push([nIdx + 1, n.branchName, n.totalHours, n.calculatedNorm, n.currentTeachers, n.neededCount, n.reason]);
        });
        wsActRows.push([]);

        wsActRows.push(["--- 2. NORM KADRO FAZLASI OLAN BRANŞLAR (NORM FAZLASI TESPİTİ) ---"]);
        wsActRows.push(["Sıra", "Branş Adı", "Haftalık Yük", "Hesaplanan Norm", "Mevcut Kadrolu", "Fazlalık Sayısı", "Gerekçe ve Mevzuat Açıklaması"]);
        actionData.surplusList.forEach((s, sIdx) => {
            wsActRows.push([sIdx + 1, s.branchName, s.totalHours, s.calculatedNorm, s.currentTeachers, s.surplusCount, s.reason]);
        });

        const wsAct = xlsxLib.utils.aoa_to_sheet(wsActRows);
        wsAct['!cols'] = [{ wch: 6 }, { wch: 32 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 48 }];
        xlsxLib.utils.book_append_sheet(wb, wsAct, "Norm İhtiyaç & Fazla Eylem");

        // Excel dosyasını indir
        const cleanName = okulAdi.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ]/g, '_');
        const fileName = `${cleanName}_MEB_Norm_ve_Ders_Yuku_Raporu_${sezon}.xlsx`;
        xlsxLib.writeFile(wb, fileName);
        return true;
    }

    // --- CSV (EXCEL) ÇIKTI ÜRETİCİ (UTF-8 BOM İLE TÜRKÇE KARAKTER DESTEKLİ) ---
    exportToCSV(reportData) {
        if (!reportData) return "";
        let csvRows = [];

        // Başlık
        csvRows.push([`"T.C. MİLLÎ EĞİTİM BAKANLIĞI"`]);
        csvRows.push([`"${reportData.schoolInfo?.okulAdi || 'Okul Adı Belirtilmedi'} - ${reportData.title}"`]);
        csvRows.push([`"Rapor Tarihi: ${reportData.generatedAt}"`]);
        csvRows.push([]);

        if (reportData.reportType === "MASTER_LOAD_GRID") {
            const header = ["Branş", "Ders Adı", ...reportData.subeler.map(s => `"${s.subeAdi} (${s.sinifSeviyesi}.Sınıf)"`), "Toplam Saat", "Norm"];
            csvRows.push(header);

            reportData.sortedBranchNames.forEach(bName => {
                const bGroup = reportData.branchGroups[bName];
                const bData = reportData.branchReportMap[bName] || {};

                Object.values(bGroup.courses).forEach(course => {
                    const row = [
                        `"${bName}"`,
                        `"${course.courseName}"`,
                        ...reportData.subeler.map(s => course.sectionHours[s.id] || 0),
                        course.totalHours,
                        `"${bData.calculatedNorm || 0}"`
                    ];
                    csvRows.push(row);
                });
            });

            // Şube Toplam Satırı
            const totalRow = ["TOPLAM DERS SAATİ", "—", ...reportData.subeler.map(s => reportData.sectionTotals[s.id] || 0), reportData.grandTotalHours, "—"];
            csvRows.push(totalRow);

        } else if (reportData.reportType === "EXECUTIVE_SUMMARY" || reportData.reportType === "BRANCH_DETAIL") {
            if (reportData.adminNorms && reportData.reportType === "EXECUTIVE_SUMMARY") {
                csvRows.push(["--- YÖNETİCİ VE İDARECİ NORM KADRO DURUMU (MEB MD. 5 - 14) ---"]);
                csvRows.push(["Yönetici Görevi", "Norm Kadro Sayısı", "Yasal Dayanak ve Açıklama"]);
                csvRows.push(["Okul Müdürü", reportData.adminNorms.mudur, "MEB Norm Kadro Yön. Madde 5"]);
                csvRows.push(["Müdür Başyardımcısı", reportData.adminNorms.mudurBasyardimcisi, "MEB Norm Kadro Yön. Madde 6"]);
                csvRows.push(["Müdür Yardımcısı (Toplam)", reportData.adminNorms.mudurYardimcisiTotal, `Temel: ${reportData.adminNorms.mudurYardimcisiBase} + İlave: ${reportData.adminNorms.mudurYardimcisiExtra} (MEB Md. 7-12 & Md. 14)`]);
                csvRows.push(["TOPLAM YÖNETİCİ NORMU", reportData.adminNorms.toplamYonetici, "—"]);
                csvRows.push([]);
            }

            const header = ["Branş Adı", "Toplam Ders Yükü", "Hesaplanan Norm", "Mevcut Kadrolu", "Norm Durumu", "Fark / İhtiyaç"];
            csvRows.push(header);

            const branches = reportData.branches || reportData.branchReport || [];
            branches.forEach(b => {
                csvRows.push([
                    `"${b.branchName}"`,
                    b.totalHours,
                    b.calculatedNorm,
                    b.currentTeachers,
                    `"${b.statusBadge}"`,
                    b.difference > 0 ? `+${b.difference} Fazla` : (b.difference < 0 ? `${b.difference} İhtiyaç` : "0 (Tam)")
                ]);
            });

        } else if (reportData.reportType === "NORM_ACTION_REPORT") {
            csvRows.push(["--- NORM KADRO İHTİYACI OLAN BRANŞLAR ---"]);
            csvRows.push(["Branş Adı", "Ders Yükü", "Hesaplanan Norm", "Mevcut Öğretmen", "İhtiyaç Sayısı", "Gerekçe Açıklaması"]);
            reportData.neededList.forEach(item => {
                csvRows.push([`"${item.branchName}"`, item.totalHours, item.calculatedNorm, item.currentTeachers, item.neededCount, `"${item.reason}"`]);
            });

            csvRows.push([]);
            csvRows.push(["--- NORM KADRO FAZLASI OLAN BRANŞLAR ---"]);
            csvRows.push(["Branş Adı", "Ders Yükü", "Hesaplanan Norm", "Mevcut Öğretmen", "Fazlalık Sayısı", "Gerekçe Açıklaması"]);
            reportData.surplusList.forEach(item => {
                csvRows.push([`"${item.branchName}"`, item.totalHours, item.calculatedNorm, item.currentTeachers, item.surplusCount, `"${item.reason}"`]);
            });
        }

        const csvContent = "\uFEFF" + csvRows.map(e => e.join(";")).join("\n");
        return csvContent;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MebReportsEngine };
}
if (typeof window !== 'undefined') {
    window.MebReportsEngine = MebReportsEngine;
}

// ==================== state.js ====================

// MEB Norm Kadro Uygulaması - Reaktif ve Normalize State Yönetimi
// IndexedDB / LocalStorage Otomatik Kayıt, Sezon Yönetimi ve Geri Al/İleri Al Desteği

class AppStateService {
    constructor() {
        this.STORAGE_KEY = "MEB_NORM_KADRO_STATE_V1";
        this.LAYOUT_KEY = "MEB_NORM_KADRO_LAYOUT_V1";
        this.state = this.getDefaultState();
        this.layout = this.getDefaultLayout();
        this.history = [JSON.stringify(this.state)];
        this.historyIndex = 0;
        this.listeners = [];
    }

    getDefaultState() {
        return {
            okulBilgisi: {
                okulAdi: "",
                kurumKodu: "",
                il: "",
                ilce: "",
                sezon: "2026-2027",
                okulTuru: null, // "anadolu_lisesi", "mesleki_ve_teknik_anadolu_lisesi" vb.
                okulTuruKilitli: false,
                isDemo: false,
                antet: {
                    ilValiligi: "",
                    ilceMem: "",
                    resmiOkulAdi: "",
                    kurumKodu: "",
                    logoBase64: null,
                    hazirlayanUnvan: "Müdür Yardımcısı",
                    hazirlayanAdSoyad: "",
                    kontrolUnvan: "Müdür Başyardımcısı",
                    kontrolAdSoyad: "",
                    onaylayanUnvan: "Okul Müdürü",
                    onaylayanAdSoyad: ""
                },
                adminOptions: {
                    isPansiyonlu: false,
                    hasDonerSermaye: false,
                    isTamGunTamYil: false,
                    hasStajyer100Plus: false,
                    hasSigortali500Plus: false,
                    isTasimaMerkezi: false,
                    isBirlestirilmis: false
                }
            },
            subeler: [], // [{ id, subeAdi, sinifSeviyesi, ogrenciSayisi, alanId, dalAdi, zorunluDersler, secmeliDersler, rehberlikVarMi }]
            aktifSubeId: null,
            mevcutOgretmenler: {}, // { "Türk Dili ve Edebiyatı": 4, "Matematik": 3 }
            koordinatorlukYukleri: {}, // { "Bilişim Teknolojileri": 10, "Elektrik-Elektronik Teknolojisi": 10 }
            ozelOkulBranslari: [] // Kullanıcının eklediği özel branşlar
        };
    }

    getDefaultLayout() {
        return {
            leftWidth: 290,
            rightWidth: 335,
            leftCollapsed: false,
            rightCollapsed: false
        };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify(recordHistory = true) {
        if (recordHistory) {
            this.pushHistory();
        }
        this.saveToStorage();
        this.listeners.forEach(listener => listener(this.state));
    }

    pushHistory() {
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        const currentStr = JSON.stringify(this.state);
        // Aynı state tekrarını kaydetme
        if (this.history.length > 0 && this.history[this.historyIndex] === currentStr) {
            return;
        }
        this.history.push(currentStr);
        if (this.history.length > 30) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.state = JSON.parse(this.history[this.historyIndex]);
            this.notify(false);
            return true;
        }
        return false;
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.state = JSON.parse(this.history[this.historyIndex]);
            this.notify(false);
            return true;
        }
        return false;
    }

    // --- Okul Kurulum & Kilit Mekanizması ---
    setSchoolType(typeId) {
        if (this.state.okulBilgisi.okulTuruKilitli && this.state.okulBilgisi.okulTuru !== typeId) {
            return false;
        }
        this.pushHistory();
        this.state.okulBilgisi.okulTuru = typeId;
        this.state.okulBilgisi.okulTuruKilitli = true;
        this.notify();
        return true;
    }

    resetSchool() {
        this.pushHistory();
        this.state = this.getDefaultState();
        this.notify();
    }

    updateSchoolInfo(name, season, kurumKodu, il, ilce) {
        this.pushHistory();
        if (name !== undefined) {
            this.state.okulBilgisi.okulAdi = name;
            if (this.state.okulBilgisi.antet) this.state.okulBilgisi.antet.resmiOkulAdi = name;
        }
        if (season !== undefined) this.state.okulBilgisi.sezon = season;
        if (kurumKodu !== undefined) {
            this.state.okulBilgisi.kurumKodu = kurumKodu;
            if (this.state.okulBilgisi.antet) this.state.okulBilgisi.antet.kurumKodu = kurumKodu;
        }
        if (il !== undefined) {
            this.state.okulBilgisi.il = il;
            if (this.state.okulBilgisi.antet) this.state.okulBilgisi.antet.ilValiligi = il.toUpperCase().includes("VALİLİK") ? il : (il ? `${il.toUpperCase()} VALİLİĞİ` : "");
        }
        if (ilce !== undefined) {
            this.state.okulBilgisi.ilce = ilce;
            if (this.state.okulBilgisi.antet) this.state.okulBilgisi.antet.ilceMem = ilce.toUpperCase().includes("MÜDÜRLÜĞÜ") ? ilce : (ilce ? `${ilce} İlçe Millî Eğitim Müdürlüğü` : "");
        }
        this.notify();
    }

        loadDemoSchool(dbService, curriculumEngine) {
        this.pushHistory();
        const demoState = {
            okulBilgisi: {
                okulAdi: "Örnek Atatürk Anadolu Lisesi",
                kurumKodu: "754123",
                il: "ANKARA",
                ilce: "ÇANKAYA",
                sezon: "2026-2027",
                okulTuru: "anadolu_lisesi",
                okulTuruKilitli: true,
                isDemo: true,
                antet: {
                    ilValiligi: "ANKARA VALİLİĞİ",
                    ilceMem: "Çankaya İlçe Millî Eğitim Müdürlüğü",
                    resmiOkulAdi: "Örnek Atatürk Anadolu Lisesi",
                    kurumKodu: "754123",
                    logoBase64: null,
                    hazirlayanUnvan: "Müdür Yardımcısı",
                    hazirlayanAdSoyad: "Ahmet YILMAZ",
                    kontrolUnvan: "Müdür Başyardımcısı",
                    kontrolAdSoyad: "Mehmet DEMİR",
                    onaylayanUnvan: "Okul Müdürü",
                    onaylayanAdSoyad: "Burhan AYSAN"
                },
                adminOptions: {
                    isPansiyonlu: false,
                    hasDonerSermaye: false,
                    isTamGunTamYil: false,
                    hasStajyer100Plus: false,
                    hasSigortali500Plus: false,
                    isTasimaMerkezi: false,
                    isBirlestirilmis: false
                }
            },
            subeler: [
                {
                    id: "sube_demo_9a",
                    subeAdi: "9-A",
                    sinifSeviyesi: "9",
                    ogrenciSayisi: 30,
                    zorunluDersler: [
                        { ders: "Türk Dili ve Edebiyatı", saat: 5, kategori: "ORTAK DERSLER", atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, isAtolye: false },
                        { ders: "Tarih", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Tarih", baraj_ders: false, isAtolye: false },
                        { ders: "Coğrafya", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Coğrafya", baraj_ders: false, isAtolye: false },
                        { ders: "Matematik", saat: 6, kategori: "ORTAK DERSLER", atananBrans: "Matematik", baraj_ders: false, isAtolye: false },
                        { ders: "Fizik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Fizik", baraj_ders: false, isAtolye: false },
                        { ders: "Kimya", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Kimya", baraj_ders: false, isAtolye: false },
                        { ders: "Biyoloji", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Biyoloji", baraj_ders: false, isAtolye: false },
                        { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false, isAtolye: false },
                        { ders: "İngilizce", saat: 4, kategori: "ORTAK DERSLER", atananBrans: "İngilizce", baraj_ders: false, isAtolye: false },
                        { ders: "Almanca", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Almanca", baraj_ders: false, isAtolye: false },
                        { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false, isAtolye: false },
                        { ders: "Görsel Sanatlar/Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Görsel Sanatlar", baraj_ders: false, isAtolye: false },
                        { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, kategori: "ORTAK DERSLER", atananBrans: "Biyoloji", baraj_ders: false, isAtolye: false },
                        { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Bilişim Teknolojileri", baraj_ders: false, isAtolye: false },
                        { ders: "Rehberlik ve Yönlendirme", saat: 1, kategori: "ORTAK DERSLER", atananBrans: "Rehberlik", baraj_ders: false, isAtolye: false }
                    ],
                    secmeliDersler: [
                        { dersAdi: "SEÇMELİ BİYOLOJİ", dersSaati: 2, ttkbKarsiligi: "Biyoloji", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ MATEMATİK", dersSaati: 2, ttkbKarsiligi: "Matematik", kategori: "SEÇMELİ DERSLER" }
                    ],
                    rehberlikVarMi: true
                },
                {
                    id: "sube_demo_10a",
                    subeAdi: "10-A",
                    sinifSeviyesi: "10",
                    ogrenciSayisi: 30,
                    zorunluDersler: [
                        { ders: "Türk Dili ve Edebiyatı", saat: 5, kategori: "ORTAK DERSLER", atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, isAtolye: false },
                        { ders: "Tarih", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Tarih", baraj_ders: false, isAtolye: false },
                        { ders: "Coğrafya", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Coğrafya", baraj_ders: false, isAtolye: false },
                        { ders: "Felsefe", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Felsefe", baraj_ders: false, isAtolye: false },
                        { ders: "Matematik", saat: 6, kategori: "ORTAK DERSLER", atananBrans: "Matematik", baraj_ders: false, isAtolye: false },
                        { ders: "Fizik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Fizik", baraj_ders: false, isAtolye: false },
                        { ders: "Kimya", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Kimya", baraj_ders: false, isAtolye: false },
                        { ders: "Biyoloji", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Biyoloji", baraj_ders: false, isAtolye: false },
                        { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false, isAtolye: false },
                        { ders: "İngilizce", saat: 4, kategori: "ORTAK DERSLER", atananBrans: "İngilizce", baraj_ders: false, isAtolye: false },
                        { ders: "Almanca", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Almanca", baraj_ders: false, isAtolye: false },
                        { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false, isAtolye: false },
                        { ders: "Görsel Sanatlar/Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Müzik", baraj_ders: false, isAtolye: false },
                        { ders: "Rehberlik ve Yönlendirme", saat: 1, kategori: "ORTAK DERSLER", atananBrans: "Rehberlik", baraj_ders: false, isAtolye: false }
                    ],
                    secmeliDersler: [
                        { dersAdi: "SEÇMELİ KİMYA", dersSaati: 2, ttkbKarsiligi: "Kimya", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "ASTRONOMİ VE UZAY BİLİMLERİ", dersSaati: 2, ttkbKarsiligi: "Fizik", kategori: "SEÇMELİ DERSLER" }
                    ],
                    rehberlikVarMi: true
                },
                {
                    id: "sube_demo_11a",
                    subeAdi: "11-A",
                    sinifSeviyesi: "11",
                    ogrenciSayisi: 30,
                    zorunluDersler: [
                        { ders: "Türk Dili ve Edebiyatı", saat: 5, kategori: "ORTAK DERSLER", atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, isAtolye: false },
                        { ders: "Tarih", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Tarih", baraj_ders: false, isAtolye: false },
                        { ders: "Felsefe", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Felsefe", baraj_ders: false, isAtolye: false },
                        { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false, isAtolye: false },
                        { ders: "İngilizce", saat: 4, kategori: "ORTAK DERSLER", atananBrans: "İngilizce", baraj_ders: false, isAtolye: false },
                        { ders: "Almanca", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Almanca", baraj_ders: false, isAtolye: false },
                        { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false, isAtolye: false },
                        { ders: "Görsel Sanatlar/Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Görsel Sanatlar", baraj_ders: false, isAtolye: false },
                        { ders: "Rehberlik ve Yönlendirme", saat: 1, kategori: "ORTAK DERSLER", atananBrans: "Rehberlik", baraj_ders: false, isAtolye: false }
                    ],
                    secmeliDersler: [
                        { dersAdi: "SEÇMELİ MATEMATİK", dersSaati: 6, ttkbKarsiligi: "Matematik", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ FİZİK", dersSaati: 4, ttkbKarsiligi: "Fizik", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ KİMYA", dersSaati: 4, ttkbKarsiligi: "Kimya", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ BİYOLOJİ", dersSaati: 4, ttkbKarsiligi: "Biyoloji", kategori: "SEÇMELİ DERSLER" }
                    ],
                    rehberlikVarMi: true
                },
                {
                    id: "sube_demo_12a",
                    subeAdi: "12-A",
                    sinifSeviyesi: "12",
                    ogrenciSayisi: 30,
                    zorunluDersler: [
                        { ders: "Türk Dili ve Edebiyatı", saat: 5, kategori: "ORTAK DERSLER", atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, isAtolye: false },
                        { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Tarih", baraj_ders: false, isAtolye: false },
                        { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false, isAtolye: false },
                        { ders: "İngilizce", saat: 4, kategori: "ORTAK DERSLER", atananBrans: "İngilizce", baraj_ders: false, isAtolye: false },
                        { ders: "Almanca", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Almanca", baraj_ders: false, isAtolye: false },
                        { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false, isAtolye: false },
                        { ders: "Görsel Sanatlar/Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Müzik", baraj_ders: false, isAtolye: false }
                    ],
                    secmeliDersler: [
                        { dersAdi: "SEÇMELİ MATEMATİK", dersSaati: 6, ttkbKarsiligi: "Matematik", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ FİZİK", dersSaati: 4, ttkbKarsiligi: "Fizik", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ KİMYA", dersSaati: 4, ttkbKarsiligi: "Kimya", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ BİYOLOJİ", dersSaati: 4, ttkbKarsiligi: "Biyoloji", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "ÇAĞDAŞ TÜRK VE DÜNYA TARİHİ", dersSaati: 3, ttkbKarsiligi: "Tarih", kategori: "SEÇMELİ DERSLER" }
                    ],
                    rehberlikVarMi: false
                }
            ],
            aktifSubeId: "sube_demo_9a",
            mevcutOgretmenler: {
                "Türk Dili ve Edebiyatı": 1,
                "Matematik": 2,
                "Fizik": 1,
                "Kimya": 1,
                "Biyoloji": 1,
                "Tarih": 1,
                "Coğrafya": 1,
                "Felsefe": 1,
                "İngilizce": 1,
                "Almanca": 1,
                "Din Kültürü ve Ahlak Bilgisi": 1,
                "Beden Eğitimi": 1,
                "Görsel Sanatlar": 1,
                "Müzik": 1,
                "Bilişim Teknolojileri": 1,
                "Rehberlik": 1
            },
            koordinatorlukYukleri: {},
            ozelOkulBranslari: []
        };

        this.state = demoState;
        this.notify();
    }

    setAdminOptions(adminOpts) {
        this.pushHistory();
        if (!this.state.okulBilgisi.adminOptions) {
            this.state.okulBilgisi.adminOptions = {};
        }
        this.state.okulBilgisi.adminOptions = { ...this.state.okulBilgisi.adminOptions, ...adminOpts };
        this.notify();
    }

    setOfficialAntet(antetData) {
        this.pushHistory();
        if (!this.state.okulBilgisi.antet) {
            this.state.okulBilgisi.antet = {};
        }
        this.state.okulBilgisi.antet = { ...this.state.okulBilgisi.antet, ...antetData };
        this.notify();
    }

    // --- Sezon Yönetimi (Gelecek Yıla Aktarım & Sınıf Atlatma) ---
    changeSeason(newSeason, migrateData = true) {
        this.pushHistory();
        this.state.okulBilgisi.sezon = newSeason;
        if (!migrateData) {
            this.state.subeler = [];
            this.state.aktifSubeId = null;
        }
        this.notify();
    }

    promoteSectionsToNextSeason(newSeason, curriculumEngine = null) {
        this.pushHistory();
        this.state.okulBilgisi.sezon = newSeason;
        const schoolType = this.state.okulBilgisi.okulTuru || "anadolu_lisesi";
        const curEngine = curriculumEngine || (typeof window !== 'undefined' ? window.curriculumEngine : null);

        const GRADE_MAP = {
            "hazirlik": "9",
            "9": "10",
            "10": "11",
            "11": "12",
            "12": "GRADUATED",
            "5": "6",
            "6": "7",
            "7": "8",
            "8": "GRADUATED",
            "1": "2",
            "2": "3",
            "3": "4",
            "4": "5"
        };

        const promotedSections = [];

        this.state.subeler.forEach(sec => {
            const currentGrade = String(sec.sinifSeviyesi || "9").toLowerCase();
            const nextGrade = GRADE_MAP[currentGrade];

            // Mezun olan sınıfları atla
            if (!nextGrade || nextGrade === "GRADUATED") {
                return;
            }

            // Şube Adı Uyarlaması (Örn: 9-A -> 10-A, 10-A Bilişim -> 11-A Bilişim)
            let newName = sec.subeAdi;
            if (currentGrade === "hazirlik") {
                newName = newName.replace(/hazırlık/gi, "9").replace(/hazirlik/gi, "9").replace(/hz/gi, "9");
            } else {
                const regex = new RegExp(`^${currentGrade}([\\-\\s\\/])`, 'i');
                if (regex.test(newName)) {
                    newName = newName.replace(regex, `${nextGrade}$1`);
                } else {
                    newName = `${nextGrade}-${newName}`;
                }
            }

            // Yeni Sınıfın Resmi Zorunlu Ders Çizelgesini Otomatik Çöz
            let newCourses = sec.zorunluDersler || [];
            if (curEngine && typeof curEngine.getMandatoryCourses === 'function') {
                newCourses = curEngine.getMandatoryCourses(schoolType, nextGrade, sec.alanId, sec.dalAdi);
            }

            promotedSections.push({
                ...sec,
                id: "sube_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
                subeAdi: newName,
                sinifSeviyesi: nextGrade,
                zorunluDersler: newCourses,
                secmeliDersler: [], // Yeni sezon seçmeli dersleri okul yönetimi tarafından manuel belirlenir
                rehberlikVarMi: nextGrade !== "12"
            });
        });

        this.state.subeler = promotedSections;
        this.state.aktifSubeId = promotedSections[0]?.id || null;
        this.notify();
        return promotedSections;
    }

    // --- Layout Yönetimi ---
    setLayout(updates) {
        Object.assign(this.layout, updates);
        try {
            localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(this.layout));
        } catch (e) {}
    }

    loadLayout() {
        try {
            const data = localStorage.getItem(this.LAYOUT_KEY);
            if (data) {
                this.layout = JSON.parse(data);
            }
        } catch (e) {}
        return this.layout;
    }

    // --- Şube Yönetimi ---
    addSection(sectionData) {
        this.pushHistory();
        const newId = "sube_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
        const isSpecialEdu = !!sectionData.isSpecialEdu;
        const section = {
            id: newId,
            subeAdi: sectionData.subeAdi || "9-A",
            sinifSeviyesi: sectionData.sinifSeviyesi || "9",
            ogrenciSayisi: parseInt(sectionData.ogrenciSayisi || 30, 10),
            alanId: sectionData.alanId || null,
            dalAdi: sectionData.dalAdi || null,
            isSpecialEdu: isSpecialEdu,
            specialEduType: sectionData.specialEduType || null,
            zorunluDersler: sectionData.zorunluDersler || [],
            secmeliDersler: sectionData.secmeliDersler || [],
            rehberlikVarMi: sectionData.rehberlikVarMi !== false && !isSpecialEdu
        };
        this.sanitizeSection(section);
        this.state.subeler.push(section);
        this.state.aktifSubeId = newId;
        this.notify();
        return section;
    }

    addBulkSections(level, count, studentCountPerSection, defaultZorunluDersler = []) {
        this.pushHistory();
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "P"];
        const levelPrefix = String(level).toLowerCase() === "hazirlik" ? "Hazırlık" : level;
        for (let i = 0; i < count; i++) {
            const letter = letters[i] || `${i + 1}`;
            const subeAdi = `${levelPrefix}-${letter}`;
            const newId = "sube_" + Date.now() + "_" + i + "_" + Math.random().toString(36).substr(2, 4);
            
            const section = {
                id: newId,
                subeAdi: subeAdi,
                sinifSeviyesi: level,
                ogrenciSayisi: parseInt(studentCountPerSection || 30, 10),
                alanId: null,
                dalAdi: null,
                zorunluDersler: JSON.parse(JSON.stringify(defaultZorunluDersler)),
                secmeliDersler: [],
                rehberlikVarMi: level !== "12"
            };
            this.sanitizeSection(section);
            this.state.subeler.push(section);
            if (i === 0 && !this.state.aktifSubeId) {
                this.state.aktifSubeId = newId;
            }
        }
        this.notify();
    }

    updateSection(sectionId, updates) {
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return null;

        this.pushHistory();
        Object.assign(sec, updates);
        this.sanitizeSection(sec);
        this.notify();
        return sec;
    }

    deleteSection(sectionId) {
        this.pushHistory();
        this.state.subeler = this.state.subeler.filter(s => s.id !== sectionId);
        if (this.state.aktifSubeId === sectionId) {
            this.state.aktifSubeId = this.state.subeler.length > 0 ? this.state.subeler[0].id : null;
        }
        this.notify();
    }

    duplicateSection(sectionId) {
        const source = this.state.subeler.find(s => s.id === sectionId);
        if (!source) return;

        this.pushHistory();
        const newId = "sube_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
        const cloned = JSON.parse(JSON.stringify(source));
        cloned.id = newId;
        cloned.subeAdi = source.subeAdi + " (Kopya)";

        this.state.subeler.push(cloned);
        this.state.aktifSubeId = newId;
        this.notify();
    }

    // --- Sınıf / Şube Bölme & Şube Çoğaltma Sistemi (Section Splitting Engine) ---
    splitSection(sourceSectionId, splitPlan) {
        const sourceIndex = this.state.subeler.findIndex(s => s.id === sourceSectionId);
        if (sourceIndex === -1) return null;
        const source = this.state.subeler[sourceIndex];

        this.pushHistory();

        // 1. Ana şube mevcudunu güncelle
        source.ogrenciSayisi = parseInt(splitPlan.sourceStudents || Math.ceil(source.ogrenciSayisi / 2), 10);
        if (splitPlan.sourceDalAdi !== undefined) {
            source.dalAdi = splitPlan.sourceDalAdi;
        }

        // 2. Yeni şubeleri üret
        const createdSections = [];
        const newSectionsList = splitPlan.newSections || [];

        newSectionsList.forEach((plan, idx) => {
            const newId = "sube_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substr(2, 4);
            const cloned = JSON.parse(JSON.stringify(source));
            cloned.id = newId;
            cloned.subeAdi = plan.subeAdi;
            cloned.ogrenciSayisi = parseInt(plan.ogrenciSayisi || 20, 10);
            if (plan.dalAdi !== undefined) {
                cloned.dalAdi = plan.dalAdi;
            }

            // Seçmeli dersleri aktarma seçeneği
            if (splitPlan.copyElectives === false) {
                cloned.secmeliDersler = [];
            }

            // Birleştirilmiş şubeler bağını temizle
            if (Array.isArray(cloned.zorunluDersler)) {
                cloned.zorunluDersler.forEach(d => { delete d.birlesikSubeler; });
            }
            if (Array.isArray(cloned.secmeliDersler)) {
                cloned.secmeliDersler.forEach(d => { delete d.birlesikSubeler; });
            }

            this.sanitizeSection(cloned);
            // Ana şubenin hemen ardına yerleştir
            this.state.subeler.splice(sourceIndex + 1 + idx, 0, cloned);
            createdSections.push(cloned);
        });

        this.notify();
        return { source, createdSections };
    }

    getNextAvailableSectionLetter(gradeLevel) {
        const prefix = String(gradeLevel).toLowerCase() === "hazirlik" ? "Hazırlık" : gradeLevel;
        const existingNames = this.state.subeler
            .filter(s => s.sinifSeviyesi === gradeLevel)
            .map(s => s.subeAdi.trim().toUpperCase());
        
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "V", "Y", "Z"];
        for (const letter of letters) {
            const candidate1 = `${prefix}-${letter}`.toUpperCase();
            const candidate2 = `${gradeLevel}-${letter}`.toUpperCase();
            if (!existingNames.includes(candidate1) && !existingNames.includes(candidate2)) {
                return letter;
            }
        }
        return `${existingNames.length + 1}`;
    }

    setActiveSection(sectionId) {
        this.state.aktifSubeId = sectionId;
        this.notify();
    }

    getActiveSection() {
        const sec = this.state.subeler.find(s => s.id === this.state.aktifSubeId) || (this.state.subeler.length > 0 ? this.state.subeler[0] : null);
        if (sec) {
            this.sanitizeSection(sec);
        }
        return sec;
    }

    sanitizeSection(sec) {
        if (!sec || !Array.isArray(sec.zorunluDersler)) return;

        const normalizeName = (text) => {
            if (!text) return "";
            return String(text).trim().toLowerCase()
                .replace(/ı/g, 'i')
                .replace(/İ/g, 'i')
                .replace(/ş/g, 's')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9]/g, '');
        };

        const INVALID_NAMES = new Set([
            'ders', 'dersler', 'derskategorileri', 'kategorileri', 'toplam', 'toplamderssaati',
            'meslekderssaatitoplami', 'secmelimeslekderssaatitoplami', 'secmeliderssaatitoplami',
            'derssaatitoplami', 'dersinadi', 'alanortakdersleri', 'daldersleri'
        ]);

        const isInvalidCourse = (name) => {
            const norm = normalizeName(name);
            if (!norm || norm.length < 3 || INVALID_NAMES.has(norm)) return true;
            if (norm.endsWith('toplami') || norm.startsWith('toplam')) return true;
            return false;
        };
        
        // 1. Yazım hatalarını düzelt ve bozuk satırları temizle
        sec.zorunluDersler = sec.zorunluDersler.filter(d => {
            let name = (d.ders || d.ders_adi || "").trim();
            if (isInvalidCourse(name)) return false;
            name = name.replace(/MESLEK[İI]{2,}\s*GEL[İIİIŞS]+[İIM]+\s*AT[ÖO]LYE[SİI]*/gi, "MESLEKİ GELİŞİM ATÖLYESİ");
            name = name.replace(/MESLEK[İI]{2,}\s*KLAVYE\s*UYGULAMALARI/gi, "MESLEKİ KLAVYE UYGULAMALARI");
            name = name.replace(/MESLEK[İI]{2,}/gi, "MESLEKİ");
            d.ders = name;
            if (d.ders_adi) d.ders_adi = name;
            return true;
        });

        // 2. Mükerrer Rehberlik derslerini teke indir (12. sınıf ise tamamen kaldır)
        const isGrade12 = String(sec.sinifSeviyesi) === "12";
        let rehberlikSeen = false;
        sec.zorunluDersler = sec.zorunluDersler.filter(d => {
            const norm = normalizeName(d.ders || d.ders_adi || "");
            if (norm.includes("rehberlik")) {
                if (isGrade12 || rehberlikSeen) return false;
                rehberlikSeen = true;
                d.ders = "Rehberlik ve Yönlendirme";
                d.saat = 1;
                d.kategori = "ORTAK DERSLER";
                d.atananBrans = "Rehberlik";
                return true;
            }
            return true;
        });

        if (Array.isArray(sec.secmeliDersler)) {
            sec.secmeliDersler = sec.secmeliDersler.filter(d => {
                const norm = normalizeName(d.ders || d.ders_adi || "");
                return !norm.includes("rehberlik") && !isInvalidCourse(d.ders || "");
            });
        }

        // 3. Kanonik Ders ve Branş Standardizasyonu (Çift isim ve sahte branşları temizler)
        const curriculum = (typeof window !== 'undefined' && window.curriculumEngine) ? window.curriculumEngine : null;
        const standardizeCourse = (d) => {
            const rawName = (d.ders || d.ders_adi || "").trim();
            if (curriculum && typeof curriculum.getCanonicalCourseAndBranch === 'function') {
                const resolved = curriculum.getCanonicalCourseAndBranch(rawName, d.atananBrans, sec.alanId, d.kategori || "ORTAK DERSLER");
                d.ders = resolved.courseName;
                if (d.ders_adi) d.ders_adi = resolved.courseName;
                d.atananBrans = resolved.branchName;
            } else {
                const norm = normalizeName(rawName);
                if (norm === "tarih") { d.ders = "Tarih"; d.atananBrans = "Tarih"; }
                else if (norm.includes("inkilap")) { d.ders = "T.C. İnkılap Tarihi ve Atatürkçülük"; d.atananBrans = "Tarih"; }
                else if (norm === "turkdiliveedebiyati" || norm === "turkedebiyati") { d.ders = "Türk Dili ve Edebiyatı"; d.atananBrans = "Türk Dili ve Edebiyatı"; }
                else if (norm.includes("saglikbilgisi") || norm.includes("trafik")) { d.ders = "Sağlık Bilgisi ve Trafik Kültürü"; d.atananBrans = "Biyoloji"; }
                else if (norm.includes("yabancidil") || norm === "ingilizce" || norm === "birinciyabancidil") { d.ders = "İngilizce"; d.atananBrans = "İngilizce"; }
                else if (norm === "ikinciyabancidil" || norm === "almanca") { d.ders = "Almanca"; d.atananBrans = "Almanca"; }
            }
        };

        sec.zorunluDersler.forEach(standardizeCourse);
        if (Array.isArray(sec.secmeliDersler)) {
            sec.secmeliDersler.forEach(standardizeCourse);
        }
    }

    updateSectionDetails(sectionId, updates) {
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        this.pushHistory();
        if (updates.alanId !== undefined && updates.alanId !== sec.alanId) {
            sec.secmeliDersler = [];
        }

        Object.assign(sec, updates);
        this.sanitizeSection(sec);
        this.notify();
    }

    // --- Ders & Seçmeli Yönetimi ---
    addElectiveCourse(sectionId, electiveCourse) {
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        this.pushHistory();
        const existingIdx = sec.secmeliDersler.findIndex(d => (d.ders || d.ders_adi) === (electiveCourse.ders || electiveCourse.ders_adi));
        if (existingIdx >= 0) {
            sec.secmeliDersler[existingIdx] = electiveCourse;
        } else {
            sec.secmeliDersler.push(electiveCourse);
        }
        this.notify();
    }

    removeElectiveCourse(sectionId, courseName) {
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();
        sec.secmeliDersler = sec.secmeliDersler.filter(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm !== norm;
        });
        this.notify();
    }

    updateCourseBranch(sectionId, courseName, newBranchName) {
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();
        const all = [...sec.zorunluDersler, ...sec.secmeliDersler];
        const target = all.find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });
        if (target) {
            target.atananBrans = newBranchName;
        }
        this.notify();
    }

    // --- Sınıf Birleştirme (Course Merging) ---
    toggleCourseMerge(sectionId, courseName, targetSectionId) {
        const secA = this.state.subeler.find(s => s.id === sectionId);
        const secB = this.state.subeler.find(s => s.id === targetSectionId);
        if (!secA || !secB) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();

        const courseA = [...secA.zorunluDersler, ...secA.secmeliDersler].find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });
        const courseB = [...secB.zorunluDersler, ...secB.secmeliDersler].find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });

        if (!courseA || !courseB) return;

        if (!courseA.birlesikSubeler) courseA.birlesikSubeler = [];
        if (!courseB.birlesikSubeler) courseB.birlesikSubeler = [];

        const isMerged = courseA.birlesikSubeler.includes(targetSectionId);

        if (isMerged) {
            courseA.birlesikSubeler = courseA.birlesikSubeler.filter(id => id !== targetSectionId);
            courseB.birlesikSubeler = courseB.birlesikSubeler.filter(id => id !== sectionId);
        } else {
            courseA.birlesikSubeler.push(targetSectionId);
            courseB.birlesikSubeler.push(sectionId);
        }

        this.notify();
    }

    // --- Mevcut Öğretmen Sayıları Yönetimi ---
    setTeacherCount(branchName, count) {
        this.pushHistory();
        this.state.mevcutOgretmenler[branchName] = Math.max(0, parseInt(count || 0, 10));
        this.notify();
    }

    bulkSetTeachers(teacherMap) {
        this.pushHistory();
        this.state.mevcutOgretmenler = { ...this.state.mevcutOgretmenler, ...teacherMap };
        this.notify();
    }

    // --- İşletmelerde Meslek Eğitimi (Koordinatörlük) Yükleri Yönetimi ---
    setCoordinatorHours(branchName, hours) {
        this.pushHistory();
        if (!this.state.koordinatorlukYukleri) this.state.koordinatorlukYukleri = {};
        this.state.koordinatorlukYukleri[branchName] = Math.max(0, parseInt(hours || 0, 10));
        this.notify();
    }

    bulkSetCoordinatorHours(coordinatorMap) {
        this.pushHistory();
        if (!this.state.koordinatorlukYukleri) this.state.koordinatorlukYukleri = {};
        this.state.koordinatorlukYukleri = { ...this.state.koordinatorlukYukleri, ...coordinatorMap };
        this.notify();
    }

    getCoordinatorHoursMap() {
        return this.state.koordinatorlukYukleri || {};
    }

    // --- LocalStorage Kayıt & Yükleme ---
    saveToStorage() {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error("State localStorage üzerine kaydedilemedi:", e);
        }
    }

    loadFromStorage() {
        if (typeof localStorage === 'undefined') return false;
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                this.state = JSON.parse(data);
                this.sanitizeExistingState();
                this.history = [JSON.stringify(this.state)];
                this.historyIndex = 0;
                return true;
            }
        } catch (e) {
            console.error("State yüklenirken hata oluştu:", e);
        }
        return false;
    }

    sanitizeExistingState() {
        if (!this.state || !Array.isArray(this.state.subeler)) return;
        this.state.subeler.forEach(sec => {
            this.sanitizeSection(sec);
        });
    }

    exportProjectJSON() {
        return JSON.stringify(this.state, null, 2);
    }

    importProjectJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.okulBilgisi && parsed.subeler) {
                this.pushHistory();
                this.state = parsed;
                this.notify();
                return true;
            }
        } catch (e) {
            console.error("Geçersiz proje JSON dosyası:", e);
        }
        return false;
    }
}

const appState = new AppStateService();

// ==================== eOkulImporter.js ====================

// MEB Norm Kadro ve Ders Yükü Hesaplama Sistemi
// e-Okul Excel (.XLS / .XLSX / HTML-Table) Akıllı İçe Aktarma Motoru (EOkulImporter v1.0)
// %100 Çevrimdışı (Offline), Sıfır Mevcutları Eleyen ve Alanları Otomatik Eşleştiren Çekirdek

class EOkulImporter {
    constructor(dbService, curriculumEngine) {
        this.db = dbService;
        this.curriculum = curriculumEngine;

        // 69 Meslek Alanı Arama & Normalizasyon Tablosu (DB Canonical Alan ID Eşlemesi)
        this.KNOWN_AREAS = [
            { id: "bilisim", name: "Bilişim Teknolojileri Alanı", keywords: ["bilişim", "bilisim", "yazılım", "ağ işletmenliği"] },
            { id: "elektrik", name: "Elektrik-Elektronik Teknolojisi Alanı", keywords: ["elektrik", "elektronik", "otomasyon"] },
            { id: "makine", name: "Makine ve Tasarım Teknolojisi Alanı", keywords: ["makine", "makina", "cnc", "tasarım teknolojisi"] },
            { id: "motorluarac", name: "Motorlu Araçlar Teknolojisi Alanı", keywords: ["motorlu", "araçlar", "otomotiv", "oto"] },
            { id: "metal", name: "Metal Teknolojisi Alanı", keywords: ["metal", "kaynakçılık", "çelik"] },
            { id: "tesisat", name: "Tesisat Teknolojisi ve İklimlendirme Alanı", keywords: ["tesisat", "iklimlendirme", "soğutma", "ısıtma"] },
            { id: "mobilya", name: "Mobilya ve İç Mekân Tasarımı Alanı", keywords: ["mobilya", "iç mekân", "ic mekan", "dekorasyon", "ahşap"] },
            { id: "yenilenebilir", name: "Yenilenebilir Enerji Teknolojileri Alanı", keywords: ["yenilenebilir", "rüzgar", "güneş", "enerji"] },
            { id: "harita", name: "Harita-Tapu-Kadastro Alanı", keywords: ["harita", "tapu", "kadastro", "jeodezi"] },
            { id: "biyomedikal", name: "Biyomedikal Cihaz Teknolojileri Alanı", keywords: ["biyomedikal", "tıbbi cihaz"] },
            { id: "adalet", name: "Adalet Alanı", keywords: ["adalet", "zabıt", "infaz"] },
            { id: "sh", name: "Aile ve Tüketici Hizmetleri Alanı", keywords: ["aile ve tüketici", "ev ekonomisi", "sosyal hizmet"] },
            { id: "ayakkabipro", name: "Ayakkabı ve Saraciye Teknolojisi Alanı", keywords: ["ayakkabı", "saraciye"] },
            { id: "cocukgelisimi", name: "Çocuk Gelişimi ve Eğitimi Alanı", keywords: ["çocuk gelişimi", "okul öncesi"] },
            { id: "denizcilik", name: "Denizcilik Alanı", keywords: ["denizcilik", "güverte", "gemi yönetimi"] },
            { id: "gida", name: "Gıda Teknolojisi Alanı", keywords: ["gıda", "gıdateknolojisi", "fermantasyon"] },
            { id: "guzellik", name: "Güzellik Hizmetleri Alanı", keywords: ["güzellik", "saç bakım", "kuaförlük"] },
            { id: "halklailiskiler", name: "Halkla İlişkiler ve Organizasyon Alanı", keywords: ["halkla ilişkiler", "tanıtım", "iletişim"] },
            { id: "hasta", name: "Hasta ve Yaşlı Hizmetleri Alanı", keywords: ["hasta ve yaşlı", "yaşlı bakımı"] },
            { id: "hayvanyetistiriciligi", name: "Hayvan Yetiştiriciliği ve Sağlığı Alanı", keywords: ["hayvan yetiştiriciliği", "veteriner"] },
            { id: "insaat", name: "İnşaat Teknolojisi Alanı", keywords: ["inşaat", "yapı", "mimari çizim"] },
            { id: "kimya", name: "Kimya Teknolojisi Alanı", keywords: ["kimya teknolojisi", "kimya", "laboratuvar"] },
            { id: "konaklama", name: "Konaklama ve Seyahat Hizmetleri Alanı", keywords: ["konaklama", "otelcilik", "seyahat", "resepsiyon"] },
            { id: "laboratuvar", name: "Laboratuvar Hizmetleri Alanı", keywords: ["laboratuvar hizmetleri"] },
            { id: "maden", name: "Maden Teknolojisi Alanı", keywords: ["maden", "cevher"] },
            { id: "basim", name: "Basım Teknolojileri Alanı", keywords: ["basım", "matbaa", "baskı öncesi", "ofset"] },
            { id: "moda", name: "Moda Tasarım Teknolojileri Alanı", keywords: ["moda tasarım", "giyim", "hazır giyim"] },
            { id: "muhasebe", name: "Muhasebe ve Finansman Alanı", keywords: ["muhasebe", "finansman", "bilgisayarlı muhasebe"] },
            { id: "pazarlama", name: "Pazarlama ve Perakende Alanı", keywords: ["pazarlama", "perakende", "satış"] },
            { id: "plastiktek", name: "Plastik Teknolojisi Alanı", keywords: ["plastik", "enjeksiyon"] },
            { id: "radyotv", name: "Radyo-Televizyon Alanı", keywords: ["radyo", "televizyon", "kamera", "kurgu"] },
            { id: "saglik", name: "Sağlık Hizmetleri Alanı", keywords: ["sağlık hizmetleri", "hemşire", "ebe"] },
            { id: "tarim", name: "Tarım Alanı", keywords: ["tarım", "ziraat", "bahçe", "peyzaj"] },
            { id: "tekstil", name: "Tekstil Teknolojisi Alanı", keywords: ["tekstil", "dokuma", "iplik"] },
            { id: "ulastirma", name: "Ulaştırma Hizmetleri Alanı", keywords: ["ulaştırma", "lojistik"] },
            { id: "yiyecek", name: "Yiyecek İçecek Hizmetleri Alanı", keywords: ["yiyecek", "içecek", "aşçılık", "mutfak", "servis"] }
        ];
    }

    /**
     * Excel / XLS / XLSX Dosyasını Ayrıştırır
     * @param {ArrayBuffer|Uint8Array} fileBuffer
     * @returns {Object} { schoolSummary, sections, skippedZeros }
     */
    parseExcelData(fileBuffer) {
        if (typeof XLSX === 'undefined') {
            throw new Error("XLSX (SheetJS) motoru yüklenemedi. Lütfen js/xlsx.full.min.js dosyasını kontrol edin.");
        }

        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("Geçersiz Excel dosyası. Sayfa bulunamadı.");
        }

        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (!rawRows || rawRows.length === 0) {
            throw new Error("Excel dosyasında okunabilir veri satırı bulunamadı.");
        }

        return this.processRawRows(rawRows);
    }

    /**
     * Ham Satırları e-Okul Şube Formatına Göre İşler (R076 Dal Bilgili veya R010 İcmal)
     * @param {Array<Array<any>>} rows 
     */
    processRawRows(rows) {
        if (this.isR076RosterReport(rows)) {
            return this.processR076DalRows(rows);
        }
        return this.processR010SummaryRows(rows);
    }

    /**
     * R076 (Dal Bilgili Şube Öğrenci Listesi) Raporunu Tespit Eder
     */
    isR076RosterReport(rows) {
        for (let r = 0; r < Math.min(30, rows.length); r++) {
            const rowStr = (rows[r] || []).join(" ").toUpperCase();
            if (rowStr.includes("ÖĞRENCİ NO") || rowStr.includes("OGRENCI NO") || 
                rowStr.includes("SINIF LİSTESİ") || rowStr.includes("SINIF LISTESI") || 
                rowStr.includes("DAL BİLGİLİ") || rowStr.includes("DAL BILGILI") ||
                (rowStr.includes("S.NO") && rowStr.includes("DALI"))) {
                return true;
            }
        }
        return false;
    }

    /**
     * OOG01001R076 - Şube Listesi (Dal Bilgili) Rapor Ayrıştırıcısı
     */
    processR076DalRows(rows) {
        const parsedSections = [];
        const skippedZeros = [];
        let currentSec = null;

        const flushCurrentSection = () => {
            if (!currentSec) return;
            if (currentSec.studentCount <= 0) {
                skippedZeros.push({
                    raw: currentSec.rawText,
                    grade: currentSec.grade,
                    letter: currentSec.letter,
                    area: currentSec.rawArea,
                    count: 0
                });
                currentSec = null;
                return;
            }

            // En çok öğrencisi olan dalı (baskın dalı) tespit et
            let dominantDal = null;
            let maxCount = 0;
            for (let d in currentSec.dalCounts) {
                if (currentSec.dalCounts[d] > maxCount) {
                    maxCount = currentSec.dalCounts[d];
                    dominantDal = d;
                }
            }

            const matchedArea = this.matchVocationalArea(currentSec.rawArea);
            const isSpecialEdu = currentSec.isSpecialEdu;
            const isSınavlı = currentSec.isSınavlı;

            let finalSubName = `${currentSec.grade}-${currentSec.letter}`;
            if (isSınavlı) {
                finalSubName += matchedArea ? ` (${matchedArea.name.split(' ')[0]} Sınavlı)` : ` (Sınavlı)`;
            } else if (currentSec.rawArea && !isSpecialEdu) {
                finalSubName += ` (${matchedArea ? matchedArea.name.split(' ')[0] : currentSec.rawArea.substring(0, 10)})`;
            } else if (isSpecialEdu) {
                finalSubName += ` (Özel Eğt)`;
            }

            parsedSections.push({
                tempId: "eokul_r076_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
                rawText: currentSec.rawText,
                grade: currentSec.grade,
                letter: currentSec.letter,
                subeAdi: finalSubName,
                studentCount: currentSec.studentCount,
                boysCount: currentSec.boysCount,
                girlsCount: currentSec.girlsCount,
                rawArea: currentSec.rawArea,
                matchedAreaId: isSpecialEdu ? "ozel_egitim" : (matchedArea ? matchedArea.id : null),
                matchedAreaName: isSpecialEdu ? "Özel Eğitim" : (matchedArea ? matchedArea.name : (currentSec.rawArea || null)),
                dalAdi: isSpecialEdu ? "Özel Eğitim Sınıfı" : (dominantDal || null),
                isSınavlı: isSınavlı,
                isSpecialEdu: isSpecialEdu
            });

            currentSec = null;
        };

        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;

            const firstCell = String(row[0] || '').trim();
            if (!firstCell) continue;

            const upperFirst = firstCell.toUpperCase();

            // Şube Başlık Satırı Kontrolü
            if (upperFirst.includes("SINIF /") || upperFirst.includes("SINIF/") || 
                upperFirst.includes("ŞUBESİ") || upperFirst.includes("SUBESI") ||
                upperFirst.includes("SINIF LİSTESİ") || upperFirst.includes("SINIF LISTESI") || 
                upperFirst.includes("SINIF-") || upperFirst.includes("SİNİF-")) {
                
                const gradeMatch = firstCell.match(/(\d{1,2}|Hazırlık)\.?\s*S[ıiİI]n[ıiİI]f/i);
                const letterMatch = firstCell.match(/\/\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9\-]+)\s*Şubes[iİ]/i) || firstCell.match(/\/\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9\-]+)/);
                const areaMatch = firstCell.match(/\((.*?)\)/);

                if (gradeMatch && letterMatch) {
                    flushCurrentSection();

                    let grade = gradeMatch[1];
                    if (String(grade).toLowerCase().includes("haz")) grade = "hazirlik";
                    const letter = letterMatch[1].trim().toUpperCase();
                    let rawArea = areaMatch ? areaMatch[1].trim() : "";
                    if (rawArea.toUpperCase().includes("ALANI YOK")) rawArea = "";

                    const isSınavlı = rawArea.toUpperCase().includes("SINAVLI") || firstCell.toUpperCase().includes("SINAVLI");
                    const isSpecialEdu = rawArea.toUpperCase().includes("ZİHİNSEL") || rawArea.toUpperCase().includes("OTİZM") || 
                                         rawArea.toUpperCase().includes("ENGELLİ") || rawArea.toUpperCase().includes("ÖZEL EĞİTİM") || 
                                         firstCell.toUpperCase().includes("ZİHİNSEL");

                    currentSec = {
                        rawText: firstCell,
                        grade: grade,
                        letter: letter,
                        rawArea: rawArea,
                        isSınavlı: isSınavlı,
                        isSpecialEdu: isSpecialEdu,
                        studentCount: 0,
                        boysCount: 0,
                        girlsCount: 0,
                        dalCounts: {}
                    };
                    continue;
                }
            }

            // Öğrenci Satırı Kontrolü (Col 0 S.No)
            if (currentSec) {
                const sno = row[0];
                const isNumericSno = (typeof sno === 'number' && sno > 0) || 
                                     (typeof sno === 'string' && /^\d+$/.test(sno.trim()) && parseInt(sno.trim(), 10) > 0);
                if (isNumericSno) {
                    currentSec.studentCount++;
                    
                    // Dal hücresini ara (Genellikle Col 10 veya 'DAL YOK' olmayan metin)
                    let dalVal = "";
                    for (let c = 8; c < row.length; c++) {
                        const cellStr = String(row[c] || '').trim();
                        if (cellStr && cellStr.toUpperCase() !== "DAL YOK" && cellStr.toUpperCase() !== "DALI" && isNaN(cellStr)) {
                            dalVal = cellStr;
                            break;
                        }
                    }
                    if (dalVal) {
                        currentSec.dalCounts[dalVal] = (currentSec.dalCounts[dalVal] || 0) + 1;
                    }
                }
            }
        }

        flushCurrentSection();

        return {
            schoolSummary: {
                totalActiveSections: parsedSections.length,
                totalStudents: parsedSections.reduce((s, sec) => s + sec.studentCount, 0),
                totalBoys: parsedSections.reduce((s, sec) => s + sec.boysCount, 0),
                totalGirls: parsedSections.reduce((s, sec) => s + sec.girlsCount, 0),
                skippedZeroCount: skippedZeros.length,
                reportType: "OOG01001R076_DAL_BILGILI",
                grades: [...new Set(parsedSections.map(s => s.grade))]
            },
            sections: parsedSections,
            skippedZeros: skippedZeros
        };
    }

    /**
     * OOG01001R010 - Sınıf Şube Öğrenci Sayıları (İcmal Tablosu) Ayrıştırıcısı
     */
    processR010SummaryRows(rows) {
        const parsedSections = [];
        const skippedZeros = [];
        const letterGroupCount = {};

        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;

            const firstCell = String(row[0] || '').trim();
            if (!firstCell) continue;

            const upperFirst = firstCell.toUpperCase();
            if (upperFirst.includes("SINIF/ŞUBE") || upperFirst.includes("SINIF TOPLAMI") || 
                upperFirst.includes("TOPLAMLAR") || upperFirst.includes("SINIF GENELİNDE TOPLAM") || 
                upperFirst.includes("GENEL TOPLAM") || upperFirst.startsWith("T.C.") || 
                upperFirst.startsWith("MİLLÎ EĞİTİM BAKANLIĞI")) {
                continue;
            }

            // 1. Sınıf Seviyesi Tespiti
            let grade = null;
            if (upperFirst.includes("HAZIRLIK") || upperFirst.includes("HAZ.")) {
                grade = "hazirlik";
            } else {
                const gradeMatch = firstCell.match(/(\d+)\.\s*S[ıiİI]n[ıiİI]f/i) || firstCell.match(/^(\d+)[\-\/\s]/);
                if (gradeMatch) {
                    grade = gradeMatch[1];
                }
            }

            // 2. Şube Harfi / İsmi Tespiti
            let secLetter = "";
            const subeMatch = firstCell.match(/\/\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9\-]+)\s*Şubes[iİ]/i) ||
                              firstCell.match(/\/\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9\-]+)/);
            if (subeMatch) {
                secLetter = subeMatch[1].trim().toUpperCase();
            }

            // 3. Parantez İçi Alan / Dal Bilgisi
            let rawArea = "";
            let isSınavlı = false;
            let isSpecialEdu = false;

            const parenMatch = firstCell.match(/\((.*?)\)$/);
            if (parenMatch) {
                rawArea = parenMatch[1].trim();
                const rawUpper = rawArea.toUpperCase();
                if (rawUpper.includes("SINAVLI")) isSınavlı = true;
                if (rawUpper.includes("ZİHİNSEL") || rawUpper.includes("ENGELLİ") || rawUpper.includes("ÖZEL EĞİTİM")) isSpecialEdu = true;
                if (rawUpper.includes("ALANI YOK")) rawArea = "";
            }

            // 4. Öğrenci Sayısı Tespiti
            let boysCount = 0;
            let girlsCount = 0;
            let totalStudents = 0;

            const numCells = [];
            for (let c = 1; c < row.length; c++) {
                const val = row[c];
                if (typeof val === 'number' || (typeof val === 'string' && val.trim() !== '' && !isNaN(val))) {
                    numCells.push(parseInt(val, 10));
                }
            }

            if (numCells.length >= 3) {
                boysCount = numCells[numCells.length - 3] || 0;
                girlsCount = numCells[numCells.length - 2] || 0;
                totalStudents = numCells[numCells.length - 1] || 0;
            } else if (numCells.length === 1) {
                totalStudents = numCells[0];
            } else if (numCells.length === 2) {
                boysCount = numCells[0];
                girlsCount = numCells[1];
                totalStudents = boysCount + girlsCount;
            }

            if (!grade || !secLetter) continue;

            // 5. 0 Mevcut Filtresi
            if (totalStudents <= 0) {
                skippedZeros.push({
                    raw: firstCell,
                    grade: grade,
                    letter: secLetter,
                    area: rawArea,
                    count: 0
                });
                continue;
            }

            const matchedArea = this.matchVocationalArea(rawArea);
            const groupKey = `${grade}_${secLetter}`;
            letterGroupCount[groupKey] = (letterGroupCount[groupKey] || 0) + 1;

            let finalSubName = `${grade}-${secLetter}`;
            if (isSınavlı) {
                finalSubName += matchedArea ? ` (${matchedArea.name.split(' ')[0]} Sınavlı)` : ` (Sınavlı)`;
            } else if (rawArea && !isSpecialEdu) {
                finalSubName += ` (${matchedArea ? matchedArea.name.split(' ')[0] : rawArea.substring(0, 10)})`;
            } else if (isSpecialEdu) {
                finalSubName += ` (Özel Eğt)`;
            }

            parsedSections.push({
                tempId: "eokul_r010_" + Date.now() + "_" + r + "_" + Math.random().toString(36).substr(2, 4),
                rawText: firstCell,
                grade: grade,
                letter: secLetter,
                subeAdi: finalSubName,
                studentCount: totalStudents,
                boysCount: boysCount,
                girlsCount: girlsCount,
                rawArea: rawArea,
                matchedAreaId: isSpecialEdu ? "ozel_egitim" : (matchedArea ? matchedArea.id : null),
                matchedAreaName: isSpecialEdu ? "Özel Eğitim" : (matchedArea ? matchedArea.name : (rawArea || null)),
                dalAdi: isSpecialEdu ? "Özel Eğitim Sınıfı" : null,
                isSınavlı: isSınavlı,
                isSpecialEdu: isSpecialEdu
            });
        }

        return {
            schoolSummary: {
                totalActiveSections: parsedSections.length,
                totalStudents: parsedSections.reduce((sum, s) => sum + s.studentCount, 0),
                skippedZeroCount: skippedZeros.length,
                reportType: "OOG01001R010_ICMAL",
                grades: [...new Set(parsedSections.map(s => s.grade))]
            },
            sections: parsedSections,
            skippedZeros: skippedZeros
        };
    }

    /**
     * Parantez içindeki alandan Veritabanındaki Alan ID'sini Eşleştirir
     * @param {string} rawAreaText 
     */
    matchVocationalArea(rawAreaText) {
        if (!rawAreaText) return null;
        const norm = this.normalizeText(rawAreaText);

        for (const area of this.KNOWN_AREAS) {
            for (const kw of area.keywords) {
                if (norm.includes(this.normalizeText(kw))) {
                    return area;
                }
            }
        }
        return null;
    }

    normalizeText(text) {
        if (!text) return "";
        return String(text).toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/İ/g, 'i')
            .replace(/ş/g, 's')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, '');
    }

    /**
     * Ayrıştırılmış Şubeleri Sisteme Aktarır (State'e Yükler)
     * @param {AppStateService} stateService 
     * @param {Array} parsedSections 
     * @param {string} schoolType 
     * @param {boolean} clearExisting 
     */
    applySectionsToState(stateService, parsedSections, schoolType = null, clearExisting = true) {
        stateService.pushHistory();

        if (clearExisting) {
            stateService.state.subeler = [];
            stateService.state.aktifSubeId = null;
        }

        const effectiveSchoolType = schoolType || stateService.state.okulBilgisi.okulTuru || "mesleki_ve_teknik_anadolu_lisesi";

        parsedSections.forEach((sec, idx) => {
            const isSpecialEdu = !!sec.isSpecialEdu;
            const areaId = isSpecialEdu ? "ozel_egitim" : sec.matchedAreaId;
            const dalAdi = isSpecialEdu ? "Özel Eğitim Sınıfı" : (sec.dalAdi || null);

            // Zorunlu Dersleri Çöz (Dal bilgisi varsa dal müfredatı otomatik çözülür)
            let mandatoryCourses = [];
            if (this.curriculum && typeof this.curriculum.getMandatoryCourses === 'function') {
                try {
                    mandatoryCourses = this.curriculum.getMandatoryCourses(
                        effectiveSchoolType,
                        sec.grade,
                        areaId,
                        dalAdi
                    ) || [];
                } catch (e) {
                    console.warn(`Zorunlu dersler çözülemedi (${sec.subeAdi}):`, e);
                }
            }

            const newSection = {
                id: "sube_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substr(2, 4),
                subeAdi: sec.subeAdi,
                sinifSeviyesi: sec.grade,
                ogrenciSayisi: sec.studentCount,
                alanId: areaId,
                dalAdi: dalAdi,
                isSpecialEdu: isSpecialEdu,
                specialEduType: isSpecialEdu ? "hafif_zihinsel" : null,
                zorunluDersler: JSON.parse(JSON.stringify(mandatoryCourses)),
                secmeliDersler: [],
                rehberlikVarMi: sec.grade !== "12" && !isSpecialEdu
            };

            stateService.sanitizeSection(newSection);
            stateService.state.subeler.push(newSection);
        });

        if (stateService.state.subeler.length > 0 && !stateService.state.aktifSubeId) {
            stateService.state.aktifSubeId = stateService.state.subeler[0].id;
        }

        stateService.notify();
        return stateService.state.subeler;
    }
}

// ==================== uiComponents.js ====================

// MEB Norm Kadro Uygulaması - UI Bileşenleri ve Modalları

const TTKB_MAP = {
    'TÜRK DİLİ VE EDEBİYATI': 'Türk Dili ve Edebiyatı',
    'HAZIRLIK SINIFI TÜRK DİLİ VE EDEBİYATI': 'Türk Dili ve Edebiyatı',
    'TÜRKÇE': 'Türkçe',
    'DİN KÜLTÜRÜ VE AHLAK BİLGİSİ': 'Din Kültürü ve Ahlak Bilgisi',
    'DİN KÜLTÜRÜ VE AHLÂK BİLGİSİ': 'Din Kültürü ve Ahlak Bilgisi',
    'DİN KÜLTÜRÜ VE A.B.': 'Din Kültürü ve Ahlak Bilgisi',
    'TARİH': 'Tarih',
    'T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK': 'Tarih',
    'T.C. İNKILÂP TARİHİ VE ATATÜRKÇÜLÜK': 'Tarih',
    'T.C. İNKILAP TARİHİ': 'Tarih',
    'COĞRAFYA': 'Coğrafya',
    'SOSYAL BİLGİLER': 'Sosyal Bilgiler',
    'MATEMATİK': 'Matematik',
    'TEMEL MATEMATİK': 'Matematik',
    'SEÇMELİ MATEMATİK': 'Matematik',
    'FİZİK': 'Fizik',
    'KİMYA': 'Kimya',
    'BİYOLOJİ': 'Biyoloji',
    'FEN BİLİMLERİ': 'Fen Bilimleri',
    'FELSEFE': 'Felsefe',
    'YABANCI DİL': 'İngilizce',
    'BİRİNCİ YABANCI DİL': 'İngilizce',
    'İKİNCİ YABANCI DİL': 'Almanca',
    'İNGİLİZCE': 'İngilizce',
    'ALMANCA': 'Almanca',
    'FRANSIZCA': 'Fransızca',
    'ARAPÇA': 'Arapça',
    'MESLEKİ ARAPÇA': 'Arapça',
    'BEDEN EĞİTİMİ VE SPOR': 'Beden Eğitimi',
    'BEDEN EĞİTİMİ VE SPOR / GÖRSEL SANATLAR / MÜZİK': 'Beden Eğitimi',
    'BEDEN EĞİTİMİ VE SPOR/GÖRSEL SANATLAR/MÜZİK': 'Beden Eğitimi',
    'GÖRSEL SANATLAR / MÜZİK': 'Görsel Sanatlar',
    'GÖRSEL SANATLAR/MÜZİK': 'Görsel Sanatlar',
    'GÖRSEL SANATLAR': 'Görsel Sanatlar',
    'MÜZİK': 'Müzik',
    'TEKNOLOJİ VE TASARIM': 'Teknoloji ve Tasarım',
    'SAĞLIK BİLGİSİ VE TRAFİK KÜLTÜRÜ': 'Biyoloji',
    'SAĞLIK BİLGİSİ': 'Biyoloji',
    'TRAFİK GÜVENLİĞİ': 'Biyoloji',
    'BİLİŞİM TEKNOLOJİLERİ VE YAZILIM': 'Bilişim Teknolojileri',
    'BİLİŞİM TEKNOLOJİLERİ': 'Bilişim Teknolojileri',
    'KUR’AN-I KERİM': 'İHL Meslek Dersleri',
    "KUR'AN-I KERİM": 'İHL Meslek Dersleri',
    'KURAN-I KERİM': 'İHL Meslek Dersleri',
    'TEMEL DİNÎ BİLGİLER': 'İHL Meslek Dersleri',
    'TEMEL DİNİ BİLGİLER': 'İHL Meslek Dersleri',
    'PEYGAMBERİMİZİN HAYATI': 'İHL Meslek Dersleri',
    'FIKIH': 'İHL Meslek Dersleri',
    'TEFSİR': 'İHL Meslek Dersleri',
    'HADİS': 'İHL Meslek Dersleri',
    'AKAİD': 'İHL Meslek Dersleri',
    'KELAM': 'İHL Meslek Dersleri',
    'SİYER': 'İHL Meslek Dersleri',
    'HİTABET VE MESLEKİ UYGULAMA': 'İHL Meslek Dersleri',
    'İSLAM KÜLTÜR VE MEDENİYETİ': 'İHL Meslek Dersleri',
    'İSLAM TARİHİ': 'İHL Meslek Dersleri',
    'DİNLER TARİHİ': 'İHL Meslek Dersleri',
    'DESEN': 'Görsel Sanatlar',
    'İKİ BOYUTLU SANAT ATÖLYE': 'Görsel Sanatlar',
    'ÜÇ BOYUTLU SANAT ATÖLYE': 'Görsel Sanatlar',
    'TEMEL SANAT EĞİTİMİ': 'Görsel Sanatlar',
    'İMGESEL RESİM': 'Görsel Sanatlar',
    'SANAT ESERLERİNİ İNCELEME': 'Görsel Sanatlar',
    'GENEL SANAT TARİHİ': 'Görsel Sanatlar',
    'BATI MÜZİĞİ TEORİ VE UYGULAMASI': 'Müzik',
    'TÜRK MÜZİĞİ TEORİ VE UYGULAMASI': 'Müzik',
    'BİREYSEL ÇALGI EĞİTİMİ': 'Müzik',
    'BİREYSEL ÇALGI': 'Müzik',
    'ÇALGI EĞİTİMİ': 'Müzik',
    'PİYANO': 'Müzik',
    'KORO': 'Müzik',
    'MÜZİKSEL İŞİTME OKUMA VE YAZMA': 'Müzik',
    'GENEL JİMNASTİK': 'Beden Eğitimi',
    'ATLETİZM': 'Beden Eğitimi',
    'TAKIM SPORLARI': 'Beden Eğitimi',
    'BİREYSEL SPORLAR': 'Beden Eğitimi',
    'SPOR ANATOMİSİ VE FİZYOLOJİSİ': 'Beden Eğitimi',
    'ANTRENMAN BİLGİSİ': 'Beden Eğitimi',
    'SPOR UYGULAMALARI': 'Beden Eğitimi',
    'OYUNCULUK': 'Türk Dili ve Edebiyatı',
    'HAREKET': 'Beden Eğitimi',
    'SES VE KONUŞMA': 'Türk Dili ve Edebiyatı',
    'TİYATRO TARİHİ': 'Türk Dili ve Edebiyatı',
    'DRAMATURJİ': 'Türk Dili ve Edebiyatı',
    'OYUN ÇALIŞMASI': 'Türk Dili ve Edebiyatı',
    'REHBERLİK VE YÖNLENDİRME': 'Rehberlik',
    'REHBERLİK': 'Rehberlik'
};

// TTKB Resmi Seçmeli Kültür Dersleri Sınıf Bazlı İzin Verilen Ders Saatleri Matrisi
const TTKB_OFFICIAL_ELECTIVE_HOURS_MAP = {
    // Fen & Matematik
    'SEÇMELİ BİYOLOJİ': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'BİYOLOJİ': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'SEÇMELİ FİZİK': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'FİZİK': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'SEÇMELİ KİMYA': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'KİMYA': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'SEÇMELİ MATEMATİK': { '10': [6], '11': [6], '12': [6] },
    'MATEMATİK': { '10': [6], '11': [6], '12': [6] },
    'TEMEL MATEMATİK': { '11': [2], '12': [2] },
    'SEÇMELİ TEMEL MATEMATİK': { '11': [2], '12': [2] },
    'FEN BİLİMLERİ UYGULAMALARI': { '11': [2, 3], '12': [2, 3] },
    'MATEMATİK UYGULAMALARI': { '11': [2, 3], '12': [2, 3] },
    'GENETİK BİLİMİNE GİRİŞ': { '11': [2, 3], '12': [2, 3] },
    'TIP BİLİMİNE GİRİŞ': { '11': [2, 3], '12': [2, 3] },
    'ASTRONOMİ VE UZAY BİLİMLERİ': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'FEN BİLİMLERİ TARİHİ VE UYGULAMALARI': { '10': [2, 3], '11': [2, 3], '12': [2, 3] },
    'MATEMATİK TARİHİ VE UYGULAMALARI': { '10': [2], '11': [2], '12': [2] },

    // Sosyal & Edebiyat & Tarih
    'SEÇMELİ TÜRK DİLİ VE EDEBİYATI': { '9': [3], '10': [3], '11': [3, 5], '12': [3, 5] },
    'TÜRK DİLİ VE EDEBİYATI': { '9': [3], '10': [3], '11': [3, 5], '12': [3, 5] },
    'EDEBİYAT UYGULAMALARI': { '9': [2], '10': [2], '11': [1, 2], '12': [2] },
    'METİN TAHLİLLERİ': { '9': [1, 2], '10': [1, 2], '11': [1, 2] },
    'DİKSİYON VE HİTABET': { '9': [1], '10': [1], '11': [1], '12': [1] },
    'OSMANLI TÜRKÇESİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'SEÇMELİ TARİH': { '10': [2], '11': [2, 4], '12': [2, 4] },
    'TARİH': { '10': [2], '11': [2, 4], '12': [2, 4] },
    'ÇAĞDAŞ TÜRK VE DÜNYA TARİHİ': { '12': [2, 4] },
    'TÜRK KÜLTÜR VE MEDENİYET TARİHİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'TÜRK DÜNYASI COĞRAFYASI': { '10': [1, 2], '11': [1, 2] },
    'SEÇMELİ COĞRAFYA': { '10': [2], '11': [2, 4], '12': [2, 4] },
    'COĞRAFYA': { '10': [2], '11': [2, 4], '12': [2, 4] },
    'PSİKOLOJİ': { '11': [2], '12': [2] },
    'SOSYOLOJİ': { '11': [2], '12': [2] },
    'MANTIK': { '11': [2], '12': [2] },
    'BİLGİ KURAMI': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'DEMOKRASİ VE İNSAN HAKLARI': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'İNSAN HAKLARI VE DEMOKRASİ': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'EKONOMİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'GİRİŞİMCİLİK': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'YÖNETİM BİLİMİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'ULUSLARARASI İLİŞKİLER': { '11': [2], '12': [2] },
    'TEMEL HUKUK BİLGİSİ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'HUKUK VE ADALET': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'İKLİM, ÇEVRE VE YENİLİKÇİ ÇÖZÜMLER': { '10': [1, 2], '11': [1, 2] },
    'SÜRDÜRÜLEBİLİR TARIM VE GIDA GÜVENLİĞİ': { '10': [1, 2], '11': [1, 2] },
    'ADABIMUAŞERET': { '9': [1], '10': [1], '11': [1], '12': [1] },
    'ÂDABIMUAŞERET': { '9': [1], '10': [1], '11': [1], '12': [1] },
    'GÖRGÜ KURALLARI VE NEZAKET': { '9': [1], '10': [1], '11': [1], '12': [1] },

    // Bilişim & Teknoloji
    'BİLİŞİM TEKNOLOJİLERİ VE YAZILIM': { '9': [1, 2], '10': [1, 2, 3], '11': [1, 2, 3], '12': [1, 2, 3] },
    'BİLGİSAYAR BİLİMİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'PROJE TASARIMI VE UYGULAMALARI': { '9': [2, 3, 4], '10': [2, 3, 4], '11': [2, 3, 4], '12': [2, 3, 4] },
    'PROJE HAZIRLAMA': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'YAPAY ZEKA UYGULAMALARI': { '10': [2], '11': [2], '12': [2] },
    'SİBER GÜVENLİK': { '10': [2], '11': [2], '12': [2] },
    'ROBOTİK KODLAMA': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'DİJİTAL GRAFİK': { '9': [2], '10': [2], '11': [2], '12': [2] },

    // Yabancı Diller
    'SEÇMELİ BİRİNCİ YABANCI DİL': { '9': [2, 4], '10': [2, 4], '11': [2, 4, 10, 12], '12': [2, 4, 10, 12] },
    'SEÇMELİ İKİNCİ YABANCI DİL': { '9': [1, 2, 4], '10': [1, 2, 4], '11': [1, 2, 4], '12': [1, 2, 4] },
    'YABANCI DİLLER EDEBİYATI': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },

    // Din, Ahlak ve Değer
    'KUR’AN-I KERİM': { '9': [2], '10': [2], '11': [2], '12': [2] },
    "KUR'AN-I KERİM": { '9': [2], '10': [2], '11': [2], '12': [2] },
    'KURAN-I KERİM': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'PEYGAMBERİMİZİN HAYATI': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'TEMEL DİNİ BİLGİLER': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'TEMEL DİNÎ BİLGİLER': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'İSLAM KÜLTÜR VE MEDENİYETİ': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'İSLAM BİLİM TARİHİ': { '9': [2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'TÜRK DÜŞÜNCE TARİHİ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'AHLAK VE TASAVVUF KÜLTÜRÜ': { '10': [1], '11': [1], '12': [1] },
    'İSLAM AHLAKI': { '10': [1], '11': [1], '12': [1] },
    'FIKIH OKUMALARI': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'HADİS METİNLERİ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'TEFSİR OKUMALARI': { '12': [1, 2] },
    'İSLAM TARİHİ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'KUR’AN OKUMA TEKNİKLERİ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'ARAPÇA (METİN-MÜKÂLEME)': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'DİNÎ MUSİKÎ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'HÜSN-İ HAT': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'EBRU': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },

    // Sanat & Spor
    'SEÇMELİ BEDEN EĞİTİMİ VE SPOR': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'BEDEN EĞİTİMİ VE SPOR': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'SEÇMELİ GÖRSEL SANATLAR': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'GÖRSEL SANATLAR': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'SEÇMELİ MÜZİK': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'MÜZİK': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'SANAT EĞİTİMİ': { '9': [1, 2, 3], '10': [1, 2, 3], '11': [1, 2], '12': [1, 2] },
    'SPOR EĞİTİMİ': { '9': [1, 2, 3], '10': [1, 2, 3], '11': [1, 2], '12': [1, 2] },
    'DRAMA': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'SOSYAL ETKİNLİK': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'SANAT TARİHİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'HEDEF TEMELLİ DESTEK EĞİTİMİ': { '12': [3, 4, 5, 6] }
};

function parseOfficialElectiveHours(rawHours) {
    if (!rawHours || rawHours === '-' || (typeof rawHours !== 'string' && typeof rawHours !== 'number')) {
        return [2];
    }
    const str = String(rawHours).trim();
    if (!str || str === '-') return [2];

    // (2)(4) veya (1)(2)(3) parantez formatı
    if (str.includes('(') && str.includes(')')) {
        const matches = str.match(/\((\d+)\)/g);
        if (matches && matches.length > 0) {
            const parsed = matches.map(m => parseInt(m.replace(/\D/g, ''), 10)).filter(n => !isNaN(n) && n > 0);
            if (parsed.length > 0) return [...new Set(parsed)].sort((a, b) => a - b);
        }
    }

    // 2/4 bölü formatı
    if (str.includes('/')) {
        const parts = str.split('/').map(p => parseInt(p.replace(/\D/g, ''), 10)).filter(n => !isNaN(n) && n > 0);
        if (parts.length > 0) return [...new Set(parts)].sort((a, b) => a - b);
    }

    // 1-4 aralık formatı
    const rangeMatch = str.match(/^(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (!isNaN(start) && !isNaN(end) && start <= end && end <= 15) {
            const rangeArr = [];
            for (let i = start; i <= end; i++) rangeArr.push(i);
            return rangeArr;
        }
    }

    // Tekil sayı veya metin içi sayılar
    const numbers = (str.match(/\d+/g) || []).map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 0 && n <= 30);
    if (numbers.length > 0) {
        return [...new Set(numbers)].sort((a, b) => a - b);
    }

    return [2];
}

function getOfficialElectiveHoursOptions(courseName, rawHours, gradeLevel) {
    const rawClean = String(courseName || "").replace(/\s*\(\d+\)$/, "").trim();
    const gr = String(gradeLevel || "11");
    const norm = rawClean.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. TTKB Resmi Sözlük Birebir Eşleşme (Öncelikli)
    for (let k in TTKB_OFFICIAL_ELECTIVE_HOURS_MAP) {
        const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm === kNorm) {
            const gradeMap = TTKB_OFFICIAL_ELECTIVE_HOURS_MAP[k];
            if (gradeMap && gradeMap[gr] && Array.isArray(gradeMap[gr]) && gradeMap[gr].length > 0) {
                return gradeMap[gr];
            }
        }
    }

    // 2. Kısmi Başlangıç Eşleşmesi (Fuzzy Fallback)
    for (let k in TTKB_OFFICIAL_ELECTIVE_HOURS_MAP) {
        const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm.startsWith(kNorm) || kNorm.startsWith(norm)) {
            const gradeMap = TTKB_OFFICIAL_ELECTIVE_HOURS_MAP[k];
            if (gradeMap && gradeMap[gr] && Array.isArray(gradeMap[gr]) && gradeMap[gr].length > 0) {
                return gradeMap[gr];
            }
        }
    }

    // 3. Çizelgedeki rawHours verisinden ayrıştır
    const parsed = parseOfficialElectiveHours(rawHours);
    if (parsed.length > 0) {
        return parsed;
    }

    return [2];
}

class UIComponentManager {
    constructor(dbService, stateService, normEngine, curriculumEngine) {
        this.db = dbService;
        this.state = stateService;
        this.norm = normEngine;
        this.normEngine = normEngine;
        this.curriculum = curriculumEngine || (typeof window !== 'undefined' ? window.curriculumEngine : null);
        this.reports = new MebReportsEngine(this.db, this.norm, this.curriculum);
    }

    showToast(message, type = "success") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        const icon = type === "warning" ? "⚠️" : (type === "danger" ? "🛑" : "✨");
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-text">${message}</span>`;
        container.appendChild(toast);

        // 2.6 saniye sonra yumuşakça silinerek kaybolsun
        setTimeout(() => {
            toast.classList.add("toast-fade-out");
            setTimeout(() => {
                toast.remove();
                if (container && container.children.length === 0) {
                    container.remove();
                }
            }, 600);
        }, 2600);
    }

    openSchoolSetupModal() {
        const types = this.db.getSchoolTypes();
        const currentType = this.state.state.okulBilgisi.okulTuru || "anadolu_lisesi";
        const isLocked = this.state.state.okulBilgisi.okulTuruKilitli;

        // Okul türlerini kategorilere göre grupla
        const grouped = {};
        types.forEach(t => {
            const cat = t.category || "Diğer Okullar";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(t);
        });

        let optionsHtml = "";
        for (const [catName, catTypes] of Object.entries(grouped)) {
            optionsHtml += `<optgroup label="📂 ${catName}">`;
            catTypes.forEach(t => {
                optionsHtml += `<option value="${t.id}" ${currentType === t.id ? 'selected' : ''}>${t.name}</option>`;
            });
            optionsHtml += `</optgroup>`;
        }

        const modalHtml = `
            <div class="modal-overlay active" id="school-setup-modal" style="z-index: 99999;">
                <div class="modal-box" style="max-width: 580px; padding: 1.75rem;">
                    <div class="modal-header" style="border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.25rem;">
                        <div class="modal-title" style="font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
                            <span>👑</span> NormMatik™ Okul Kurulumu ve Başlangıç
                        </div>
                    </div>
                    
                    <div class="modal-body" style="padding: 0;">
                        <!-- 1. BAŞLANGIÇ SEÇENEK KARTLARI -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
                            <div id="card-setup-custom" class="setup-choice-card active" style="border: 2px solid var(--primary); background: rgba(2, 132, 199, 0.08); padding: 1rem; border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">🏫</div>
                                <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-main);">Kendi Okulumu Kur</div>
                                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Kendi kurum bilgilerinizi girerek başlayın</div>
                            </div>
                            <div id="card-setup-demo" class="setup-choice-card" style="border: 1.5px solid var(--border); background: var(--bg-card-subtle); padding: 1rem; border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">🚀</div>
                                <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-main);">Örnek Okul (Demo)</div>
                                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Örnek sınıflarla sistemi hemen keşfedin</div>
                            </div>
                        </div>

                        <!-- 2. KENDİ OKULUMU KUR FORMU -->
                        <div id="setup-form-custom">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">İl</label>
                                    <input type="text" id="setup-il" class="form-control" placeholder="Örn: ANKARA" value="${this.state.state.okulBilgisi.il || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">İlçe</label>
                                    <input type="text" id="setup-ilce" class="form-control" placeholder="Örn: ÇANKAYA" value="${this.state.state.okulBilgisi.ilce || ''}">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1.2fr 2fr; gap: 0.75rem; margin-bottom: 0.75rem;">
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">MEB Kurum Kodu *</label>
                                    <input type="text" id="setup-kurum-kodu" class="form-control" placeholder="Örn: 754123" maxlength="10" value="${this.state.state.okulBilgisi.kurumKodu || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Eğitim-Öğretim Sezonu</label>
                                    <select id="setup-season" class="form-control">
                                        <option value="2026-2027" selected>2026-2027</option>
                                        <option value="2025-2026">2025-2026</option>
                                        <option value="2027-2028">2027-2028</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom: 0.75rem;">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Okul / Kurum Tam Adı *</label>
                                <input type="text" id="setup-school-name" class="form-control" placeholder="Örn: Atatürk Anadolu Lisesi" value="${this.state.state.okulBilgisi.okulAdi || ''}">
                            </div>

                            <div class="form-group" style="margin-bottom: 0.5rem;">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Okul Türü (Müfredat ve Norm Kuralı)</label>
                                <select id="setup-school-type" class="form-control" ${isLocked ? 'disabled' : ''}>
                                    ${optionsHtml}
                                </select>
                                <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.35rem; line-height: 1.4;">
                                    * Seçilen okul türüne ait TTKB haftalık ders çizelgeleri ve norm baremleri otomatik yüklenir.
                                </p>
                            </div>
                        </div>

                        <!-- 3. DEMO MODU AÇIKLAMA KUTUSU -->
                        <div id="setup-form-demo" style="display: none; background: rgba(16, 185, 129, 0.08); border: 1.5px dashed #10b981; border-radius: 12px; padding: 1.25rem; text-align: center; margin-bottom: 1rem;">
                            <div style="font-size: 1.1rem; font-weight: 800; color: #10b981; margin-bottom: 0.5rem;">🚀 Hızlı Başlangıç Demo Paketi</div>
                            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
                                Sisteme <strong>"Örnek Atatürk Anadolu Lisesi"</strong> adı altında örnek sınıf şubeleri, seçmeli ders dağılımları ve norm hesaplama tablosu vitrin olarak yüklenecektir. (Resmî teslimat ve Excel çıktısı lisanslı sürüme özeldir). İstediğiniz an ayarlar menüsünden okulu sıfırlayabilirsiniz.
                            </p>
                            <button class="btn btn-success" id="btn-load-demo-school" style="width: 100%; padding: 0.85rem; font-weight: 800; font-size: 0.95rem;">
                                🚀 Örnek Okul ile Sistemi Hemen Başlat
                            </button>
                        </div>
                    </div>

                    <div class="modal-footer" style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
                        <button class="btn btn-primary" id="btn-save-school-setup" style="padding: 0.75rem 1.5rem; font-weight: 800;">
                            ✨ Kurulumu Tamamla ve Başla
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        const cardCustom = document.getElementById("card-setup-custom");
        const cardDemo = document.getElementById("card-setup-demo");
        const formCustom = document.getElementById("setup-form-custom");
        const formDemo = document.getElementById("setup-form-demo");
        const btnSave = document.getElementById("btn-save-school-setup");

        cardCustom?.addEventListener("click", () => {
            cardCustom.style.border = "2px solid var(--primary)";
            cardCustom.style.background = "rgba(2, 132, 199, 0.08)";
            cardDemo.style.border = "1.5px solid var(--border)";
            cardDemo.style.background = "var(--bg-card-subtle)";
            formCustom.style.display = "block";
            formDemo.style.display = "none";
            btnSave.style.display = "block";
        });

        cardDemo?.addEventListener("click", () => {
            cardDemo.style.border = "2px solid #10b981";
            cardDemo.style.background = "rgba(16, 185, 129, 0.08)";
            cardCustom.style.border = "1.5px solid var(--border)";
            cardCustom.style.background = "var(--bg-card-subtle)";
            formCustom.style.display = "none";
            formDemo.style.display = "block";
            btnSave.style.display = "none";
        });

        // Demo Başlat Butonu
        document.getElementById("btn-load-demo-school")?.addEventListener("click", () => {
            this.state.loadDemoSchool(this.db, this.curriculum);
            this.closeModal("school-setup-modal");
            this.showToast("🚀 Örnek Atatürk Anadolu Lisesi verileri başarıyla yüklendi!", "success");
        });

        // Kendi Okulunu Kur Butonu
        btnSave?.addEventListener("click", () => {
            const name = document.getElementById("setup-school-name")?.value.trim();
            const kurumKodu = document.getElementById("setup-kurum-kodu")?.value.trim();
            const il = document.getElementById("setup-il")?.value.trim();
            const ilce = document.getElementById("setup-ilce")?.value.trim();
            const season = document.getElementById("setup-season")?.value;
            const type = document.getElementById("setup-school-type")?.value;

            if (!name) {
                alert("Lütfen Okul / Kurum Adını yazınız.");
                document.getElementById("setup-school-name")?.focus();
                return;
            }

            this.state.updateSchoolInfo(name, season, kurumKodu, il, ilce);
            this.state.setSchoolType(type);
            this.closeModal("school-setup-modal");
            this.showToast(`✨ ${name} kurulumu başarıyla tamamlandı.`, "success");
        });
    }

    openEditSchoolNameModal() {
        this.openEditSchoolInfoModal();
    }

    openEditSchoolInfoModal() {
        const info = this.state.state.okulBilgisi;
        const types = this.db.getSchoolTypes();
        const currentType = types.find(t => t.id === info.okulTuru) || { name: "Belirtilmedi", category: "MEB" };

        const modalHtml = `
            <div class="modal-overlay active" id="edit-school-modal" style="z-index: 99999;">
                <div class="modal-box" style="max-width: 520px; padding: 1.75rem;">
                    <div class="modal-header" style="border-bottom: 1px solid var(--border); padding-bottom: 0.85rem; margin-bottom: 1.25rem;">
                        <div class="modal-title" style="font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
                            <span>⚙️</span> Okul Bilgileri ve Yönetimi
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('edit-school-modal').remove()">✕</button>
                    </div>
                    
                    <div class="modal-body" style="padding: 0;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
                            <div class="form-group">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">İl</label>
                                <input type="text" id="edit-school-il" class="form-control" value="${info.il || ''}" placeholder="Örn: ANKARA">
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">İlçe</label>
                                <input type="text" id="edit-school-ilce" class="form-control" value="${info.ilce || ''}" placeholder="Örn: ÇANKAYA">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1.2fr 2fr; gap: 0.75rem; margin-bottom: 0.75rem;">
                            <div class="form-group">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">MEB Kurum Kodu</label>
                                <input type="text" id="edit-school-kurum-kodu" class="form-control" value="${info.kurumKodu || ''}" placeholder="Örn: 754123" maxlength="10">
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Sezon</label>
                                <select id="edit-school-season" class="form-control">
                                    <option value="2026-2027" ${info.sezon === '2026-2027' ? 'selected' : ''}>2026-2027</option>
                                    <option value="2025-2026" ${info.sezon === '2025-2026' ? 'selected' : ''}>2025-2026</option>
                                    <option value="2027-2028" ${info.sezon === '2027-2028' ? 'selected' : ''}>2027-2028</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Okul / Kurum Adı *</label>
                            <input type="text" id="edit-school-name" class="form-control" value="${info.okulAdi || ''}" placeholder="Okul adını yazınız...">
                        </div>

                        <div style="background: var(--bg-card-subtle); border: 1px solid var(--border); border-radius: 10px; padding: 0.85rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">MEVCUT OKUL TÜRÜ</div>
                                <div style="font-size: 0.9rem; font-weight: 800; color: var(--primary);">📜 ${currentType.name}</div>
                            </div>
                            <button class="btn btn-sm btn-danger-outline" id="btn-trigger-reset-school" style="font-size: 0.78rem;">
                                🔄 Okul Türünü Değiştir / Sıfırla
                            </button>
                        </div>
                    </div>

                    <div class="modal-footer" style="border-top: 1px solid var(--border); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <button class="btn btn-outline" onclick="document.getElementById('edit-school-modal').remove()">Kapat</button>
                        <button class="btn btn-primary" id="btn-save-edited-school-info" style="font-weight: 800;">💾 Bilgileri Kaydet</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        document.getElementById("btn-save-edited-school-info")?.addEventListener("click", () => {
            const name = document.getElementById("edit-school-name")?.value.trim();
            const kurumKodu = document.getElementById("edit-school-kurum-kodu")?.value.trim();
            const il = document.getElementById("edit-school-il")?.value.trim();
            const ilce = document.getElementById("edit-school-ilce")?.value.trim();
            const season = document.getElementById("edit-school-season")?.value;

            if (name) {
                this.state.updateSchoolInfo(name, season, kurumKodu, il, ilce);
                this.closeModal("edit-school-modal");
                this.showToast("Okul bilgileri güncellendi.", "success");
            } else {
                alert("Lütfen Okul Adını boş bırakmayınız.");
            }
        });

        document.getElementById("btn-trigger-reset-school")?.addEventListener("click", () => {
            this.closeModal("edit-school-modal");
            this.openResetSchoolConfirmModal();
        });
    }

    openEditSchoolNameModal() {
        const info = this.state.state.okulBilgisi;
        const modalHtml = `
            <div class="modal-overlay active" id="edit-school-modal">
                <div class="modal-box" style="max-width: 480px;">
                    <div class="modal-header">
                        <div class="modal-title">✏️ Okul Adını Düzenle</div>
                        <button class="modal-close-btn" onclick="document.getElementById('edit-school-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Kurum / Okul Adı</label>
                            <input type="text" id="input-edit-school-name" class="form-control" value="${info.okulAdi}" placeholder="Okul adını yazınız...">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('edit-school-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-save-edited-school-name">Kaydet</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        const inputEl = document.getElementById("input-edit-school-name");
        if (inputEl && typeof inputEl.focus === 'function') {
            inputEl.focus();
            if (typeof inputEl.select === 'function') inputEl.select();
        }

        const saveFn = () => {
            const newName = inputEl?.value.trim();
            if (newName) {
                this.state.updateSchoolInfo(newName);
                this.closeModal("edit-school-modal");
                this.showToast("Okul adı güncellendi.", "success");
            }
        };

        document.getElementById("btn-save-edited-school-name")?.addEventListener("click", saveFn);
        inputEl?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") saveFn();
        });
    }

    openResetSchoolConfirmModal() {
        const modalHtml = `
            <div class="modal-overlay active" id="reset-confirm-modal">
                <div class="modal-box" style="max-width: 480px;">
                    <div class="modal-header">
                        <div class="modal-title" style="color: var(--status-danger-text);">⚠️ Okulu Sıfırla ve Tür Değiştir</div>
                        <button class="modal-close-btn" onclick="document.getElementById('reset-confirm-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
                            Okul türünü değiştirmek mevcut <strong>tüm şubeleri, seçmeli dersleri ve norm hesaplarını silecektir</strong>.
                            Sıfırdan yeni bir okul kurmak istediğinizden emin misiniz?
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('reset-confirm-modal').remove()">Vazgeç</button>
                        <button class="btn btn-danger-outline" id="btn-confirm-reset-school">Evet, Tümünü Sıfırla</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        document.getElementById("btn-confirm-reset-school").addEventListener("click", () => {
            this.state.resetSchool();
            this.closeModal("reset-confirm-modal");
            this.openSchoolSetupModal();
            this.showToast("Okul sıfırlandı. Lütfen yeni okul türünü seçin.", "warning");
        });
    }

    // --- MANUEL TEK ŞUBE EKLEME / DÜZENLEME MODALI ---
    openAddSectionModal(sectionToEdit = null) {
        const isEditing = !!sectionToEdit;
        const subelerList = this.state.state.subeler || [];
        if (!isEditing && typeof window !== 'undefined' && window.licenseManager && !window.licenseManager.canAddSection(subelerList.length)) {
            alert("🔒 LİSANS GEREKLİ (Maksimum 3 Şube): Ücretsiz deneme sürümünde en fazla 3 şube oluşturulabilir. Okulunuzun tüm şubelerini eklemek ve sınırsız norm hesaplamak için lütfen yıllık lisans anahtarınızı aktifleştiriniz.");
            this.openLicenseModal();
            return;
        }
        const schoolType = this.state.state.okulBilgisi.okulTuru;
        const types = this.db.getSchoolTypes();
        const typeInfo = types.find(t => t.id === schoolType) || { gradeLevels: ["9", "10", "11", "12"] };

        const gradeLevels = typeInfo.gradeLevels || ["9", "10", "11", "12"];
        const selectedGrade = sectionToEdit ? sectionToEdit.sinifSeviyesi : (gradeLevels[0] || "9");

        const gradeOptions = gradeLevels.map(g => `
            <option value="${g}" ${selectedGrade === g ? 'selected' : ''}>
                ${String(g).toLowerCase() === 'hazirlik' ? 'Hazırlık' : g + '. Sınıf'}
            </option>
        `).join("");

        // Meslek Alanları Listesi & Akıllı ID Eşleştirme
        const areas = this.db.getVocationalAreas();
        let selectedAreaId = sectionToEdit?.alanId || "";
        if (selectedAreaId) {
            const directMatch = areas.find(a => a.id === selectedAreaId);
            if (!directMatch) {
                const normKey = String(selectedAreaId).toLowerCase().replace(/[^a-z0-9]/g, '');
                const fuzzy = areas.find(a => a.id.toLowerCase().replace(/[^a-z0-9]/g, '') === normKey || 
                                              a.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normKey) ||
                                              normKey.includes(a.id.toLowerCase().replace(/[^a-z0-9]/g, '')));
                if (fuzzy) selectedAreaId = fuzzy.id;
            }
        }

        const areaOptions = `<option value="">-- Alan Seçilmedi (Genel / Ortak) --</option>` + areas.map(a => `
            <option value="${a.id}" ${selectedAreaId === a.id ? 'selected' : ''}>
                ${a.name}
            </option>
        `).join("");

        // Seçilen Alana Ait Dallar
        const currentBranches = selectedAreaId ? this.db.getBranchesForArea(selectedAreaId) : [];
        const selectedDal = sectionToEdit?.dalAdi || "";
        let branchOptions = `<option value="">-- Dal Seçilmedi (Opsiyonel / Ortak Alan) --</option>`;
        if (currentBranches.length > 0) {
            currentBranches.forEach(b => {
                branchOptions += `<option value="${b}" ${selectedDal === b ? 'selected' : ''}>${b}</option>`;
            });
        } else if (selectedDal && selectedDal !== 'Özel Eğitim Sınıfı') {
            branchOptions += `<option value="${selectedDal}" selected>${selectedDal}</option>`;
        }

        const modalHtml = `
            <div class="modal-overlay active" id="section-modal">
                <div class="modal-box" style="max-width: 540px;">
                    <div class="modal-header">
                        <div class="modal-title">📝 ${isEditing ? 'Şubeyi Düzenle: ' + sectionToEdit.subeAdi : 'Yeni Şube Ekle (Manuel)'}</div>
                        <button class="modal-close-btn" onclick="document.getElementById('section-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Sınıf Kademesi</label>
                            <select id="sec-grade" class="form-control">
                                ${gradeOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Şube Adı (Manuel İsimlendirme)</label>
                            <input type="text" id="sec-name" class="form-control" placeholder="Örn: 9-A, Hazırlık-A, 11-Bilişim-A..." value="${sectionToEdit?.subeAdi || (String(selectedGrade).toLowerCase() === 'hazirlik' ? 'Hazırlık-A' : selectedGrade + '-A')}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Öğrenci Mevcudu</label>
                            <input type="number" id="sec-students" class="form-control" value="${sectionToEdit?.ogrenciSayisi || 30}" min="1" max="60">
                        </div>
                        
                        <div class="form-group" id="group-sec-area" style="${typeInfo.hasAreas ? '' : 'display:none;'}">
                            <label class="form-label">Meslek / Uzmanlık Alanı</label>
                            <select id="sec-area" class="form-control">
                                ${areaOptions}
                            </select>
                        </div>

                        <div class="form-group" id="group-sec-branch" style="${typeInfo.hasAreas ? '' : 'display:none;'}">
                            <label class="form-label">Meslek Dalı (Opsiyonel / Alana Göre Filtrelenir)</label>
                            <select id="sec-branch" class="form-control">
                                ${branchOptions}
                            </select>
                            <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">
                                * Dal seçildiğinde o dala ait özel alan/dal dersleri orta panele otomatik gelir.
                            </p>
                        </div>
                        <!-- 🟣 ÖZEL EĞİTİM SINIFI SEÇENEĞİ (MEB NORM KADRO YÖN. MD. 17/1-C) -->
                        <div class="form-group" style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 0.75rem; margin-top: 0.5rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #6d28d9; cursor: pointer; margin-bottom: 0;">
                                <input type="checkbox" id="sec-is-special-edu" ${sectionToEdit?.isSpecialEdu ? 'checked' : ''}>
                                🟣 Özel Eğitim Sınıfı (MEB Norm Kadro Yön. Md. 17/1-c)
                            </label>
                            <p style="font-size: 0.73rem; color: #5b21b6; margin-top: 0.35rem; margin-bottom: 0; line-height: 1.4;">
                                * İşaretlendiğinde bu şube için doğrudan <strong>2 Özel Eğitim Öğretmeni Normu</strong> tahsis edilir ve haftalık 30 saatlik özel eğitim müfredatı yüklenir.
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('section-modal').remove()">İptal</button>
                        <button class="btn btn-primary" id="btn-save-single-section">${isEditing ? 'Güncelle' : 'Şubeyi Ekle'}</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        const areaSelect = document.getElementById("sec-area");
        const branchSelect = document.getElementById("sec-branch");
        areaSelect?.addEventListener("change", (e) => {
            const areaId = e.target.value;
            if (!areaId) {
                branchSelect.innerHTML = `<option value="">-- Dal Seçilmedi (Opsiyonel / Ortak Alan) --</option>`;
                return;
            }
            const branches = this.db.getBranchesForArea(areaId);
            let bHtml = `<option value="">-- Dal Seçilmedi (Opsiyonel / Ortak Alan) --</option>`;
            if (branches.length > 0) {
                branches.forEach(b => {
                    bHtml += `<option value="${b}">${b}</option>`;
                });
            } else {
                bHtml += `<option value="${areaId.toUpperCase()} DALI">${areaId.toUpperCase()} DALI</option>`;
            }
            branchSelect.innerHTML = bHtml;
        });

        document.getElementById("btn-save-single-section").addEventListener("click", () => {
            try {
                const grade = document.getElementById("sec-grade").value;
                const defaultPrefix = String(grade).toLowerCase() === 'hazirlik' ? 'Hazırlık' : grade;
                const name = document.getElementById("sec-name").value.trim() || `${defaultPrefix}-A`;
                const students = parseInt(document.getElementById("sec-students").value || 30, 10);
                const areaId = document.getElementById("sec-area")?.value || null;
                const dalName = document.getElementById("sec-branch")?.value || null;
                const isSpecialEdu = document.getElementById("sec-is-special-edu")?.checked || false;

                if (isEditing) {
                    const originalCourses = sectionToEdit.zorunluDersler || [];
                    let updatedCourses = originalCourses;
                    // Eğer alan, sınıf veya özel eğitim statüsü değiştiyse müfredatı yeniden çöz
                    if (sectionToEdit.alanId !== (isSpecialEdu ? "ozel_egitim" : areaId) || 
                        sectionToEdit.sinifSeviyesi !== grade || 
                        sectionToEdit.isSpecialEdu !== isSpecialEdu) {
                        updatedCourses = this.curriculum.getMandatoryCourses(
                            schoolType, 
                            grade, 
                            isSpecialEdu ? "ozel_egitim" : areaId, 
                            isSpecialEdu ? "Özel Eğitim Sınıfı" : dalName
                        );
                    }
                    this.state.updateSection(sectionToEdit.id, {
                        sinifSeviyesi: grade,
                        subeAdi: name,
                        ogrenciSayisi: students,
                        alanId: isSpecialEdu ? "ozel_egitim" : areaId,
                        dalAdi: isSpecialEdu ? "Özel Eğitim Sınıfı" : dalName,
                        isSpecialEdu: isSpecialEdu,
                        specialEduType: isSpecialEdu ? "hafif_zihinsel" : null,
                        zorunluDersler: updatedCourses,
                        rehberlikVarMi: grade !== "12" && !isSpecialEdu
                    });
                    this.showToast("Şube başarıyla güncellendi.", "success");
                } else {
                    const defaultCourses = this.curriculum.getMandatoryCourses(
                        schoolType, 
                        grade, 
                        isSpecialEdu ? "ozel_egitim" : areaId, 
                        isSpecialEdu ? "Özel Eğitim Sınıfı" : dalName
                    );
                    this.state.addSection({
                        sinifSeviyesi: grade,
                        subeAdi: name,
                        ogrenciSayisi: students,
                        alanId: isSpecialEdu ? "ozel_egitim" : areaId,
                        dalAdi: isSpecialEdu ? "Özel Eğitim Sınıfı" : dalName,
                        isSpecialEdu: isSpecialEdu,
                        specialEduType: isSpecialEdu ? "hafif_zihinsel" : null,
                        zorunluDersler: defaultCourses,
                        secmeliDersler: [],
                        rehberlikVarMi: grade !== "12" && !isSpecialEdu
                    });
                    this.showToast(`${name} şubesi (${isSpecialEdu ? '🟣 Özel Eğitim' : (dalName || 'Genel')}) dersleriyle eklendi!`, "success");
                }

                this.closeModal("section-modal");
            } catch (err) {
                console.error("Şube kaydetme hatası:", err);
                alert("Şube eklenirken bir hata oluştu: " + err.message);
            }
        });
    }

    openBulkSectionWizard() {
        const schoolType = this.state.state.okulBilgisi.okulTuru;
        const types = this.db.getSchoolTypes();
        const typeInfo = types.find(t => t.id === schoolType) || { gradeLevels: ["9", "10", "11", "12"] };

        const gradeOptions = typeInfo.gradeLevels.map(g => `<option value="${g}">${String(g).toLowerCase() === 'hazirlik' ? 'Hazırlık' : g + '. Sınıf'}</option>`).join("");

        const modalHtml = `
            <div class="modal-overlay active" id="bulk-wizard-modal">
                <div class="modal-box" style="max-width: 500px;">
                    <div class="modal-header">
                        <div class="modal-title">⚡ Toplu Şube Üretici Sihirbazı</div>
                        <button class="modal-close-btn" onclick="document.getElementById('bulk-wizard-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Sınıf Kademesi</label>
                            <select id="bulk-grade" class="form-control">
                                ${gradeOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Kaç Şube Açılsın? (Örn: 8 şube -> A, B, C...)</label>
                            <input type="number" id="bulk-count" class="form-control" value="6" min="1" max="20">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Şube Başına Ortalama Öğrenci Mevcudu</label>
                            <input type="number" id="bulk-students" class="form-control" value="30" min="1" max="60">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('bulk-wizard-modal').remove()">İptal</button>
                        <button class="btn btn-primary" id="btn-create-bulk-sections">Şubeleri Toplu Oluştur</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        document.getElementById("btn-create-bulk-sections").addEventListener("click", () => {
            const grade = document.getElementById("bulk-grade").value;
            const count = parseInt(document.getElementById("bulk-count").value || 1, 10);
            const students = parseInt(document.getElementById("bulk-students").value || 30, 10);

            const defaultCourses = this.getMandatoryCoursesForGrade(grade);

            this.state.addBulkSections(grade, count, students, defaultCourses);
            this.closeModal("bulk-wizard-modal");
            const gradeLabel = String(grade).toLowerCase() === 'hazirlik' ? 'Hazırlık Sınıfı' : `${grade}. Sınıf`;
            this.showToast(`${count} adet ${gradeLabel} şubesi başarıyla oluşturuldu!`, "success");
        });
    }

    getElectiveThemeInfo(item) {
        if (item.isVocational || (item.kategori || '').includes('MESLEK') || (item.grup || '').includes('Meslek')) {
            return {
                id: "VOC",
                subId: "VOC",
                title: "Seçmeli Meslek",
                badge: "⚙️ Seçmeli Meslek",
                badgeClass: "theme-badge-voc",
                color: "#9333ea",
                icon: "⚙️"
            };
        }

        const norm = (String(item.ders || "") + " " + String(item.grup || "")).toLowerCase()
            .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
            .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/['’\-\.\,\(\)]/g, '');
        
        // 1. Din, Ahlak ve Değer
        if (norm.includes("din") || norm.includes("kuran") || norm.includes("peygamber") || 
            norm.includes("siyer") || norm.includes("ahlak") || norm.includes("adab") || 
            norm.includes("nezaket") || norm.includes("deger") || norm.includes("fikih") || 
            norm.includes("tefsir") || norm.includes("hadis") || norm.includes("akaid") || 
            norm.includes("kelam") || norm.includes("hitabet") || norm.includes("tasavvuf") || 
            norm.includes("islam") || norm.includes("yon verenler") || norm.includes("temel dini") ||
            norm.includes("arapca (metin") || norm.includes("dini musiki")) {
            return {
                id: "DEGER",
                subId: "DEGER",
                title: "Din, Ahlak ve Değer",
                badge: "🕊️ Din, Ahlak ve Değer",
                badgeClass: "theme-badge-deger",
                color: "#059669",
                icon: "🕊️"
            };
        }

        // 2. Kültür, Sanat ve Spor
        if (norm.includes("sanat") || norm.includes("muzik") || norm.includes("gorsel") || 
            norm.includes("spor") || norm.includes("fiziki") || norm.includes("resim") || 
            norm.includes("heykel") || norm.includes("masal") || norm.includes("destan") || 
            norm.includes("oyun") || norm.includes("drama") || norm.includes("tiyatro") || 
            norm.includes("halk oyun") || norm.includes("geleneksel sanat") || 
            norm.includes("ebru") || norm.includes("hat") || norm.includes("tezhip") || 
            norm.includes("minyatur") || norm.includes("calgi") || norm.includes("koro") || 
            norm.includes("sinema") || norm.includes("fotograf") || norm.includes("beden egitimi") ||
            norm.includes("diksiyon") || norm.includes("estetik") || norm.includes("ritim")) {
            return {
                id: "SANAT",
                subId: "SANAT",
                title: "Kültür, Sanat ve Spor",
                badge: "🎨 Kültür, Sanat ve Spor",
                badgeClass: "theme-badge-sanat",
                color: "#d97706",
                icon: "🎨"
            };
        }

        // 3. Bilişim ve Dijital Beceriler (TTKB İnsan ve Bilim)
        if (norm.includes("robotik") || norm.includes("kodlama") || norm.includes("yapay zeka") || 
            norm.includes("siber") || norm.includes("dijital") || norm.includes("programlama") || 
            norm.includes("yazilim") || norm.includes("bilisim") || norm.includes("algoritma") || 
            norm.includes("web") || norm.includes("mobil uygulama") || norm.includes("animasyon")) {
            return {
                id: "BILIM",
                subId: "BILISIM",
                title: "Bilişim ve Dijital Teknolojiler",
                badge: "💻 Bilişim & Dijital",
                badgeClass: "theme-badge-bilisim",
                color: "#0284c7",
                icon: "💻"
            };
        }

        // 4. Yabancı Diller ve İletişim (TTKB İnsan ve Bilim)
        if (norm.includes("yabanci dil") || norm.includes("almanca") || norm.includes("ingilizce") || 
            norm.includes("fransizca") || norm.includes("rusca") || norm.includes("arapca") || 
            norm.includes("ispanyolca") || norm.includes("cince") || norm.includes("edebiyati") || 
            norm.includes("hazirlik yabanci") || norm.includes("ikinci yabanci")) {
            return {
                id: "BILIM",
                subId: "DIL",
                title: "Yabancı Diller ve İletişim",
                badge: "🗣️ Yabancı Diller",
                badgeClass: "theme-badge-dil",
                color: "#2563eb",
                icon: "🗣️"
            };
        }

        // 5. İnsan, Toplum ve Bilim (Fen, Matematik, Sosyal Bilimler)
        return {
            id: "BILIM",
            subId: "BILIM",
            title: "İnsan, Toplum ve Bilim",
            badge: "🧪 İnsan, Toplum ve Bilim",
            badgeClass: "theme-badge-bilim",
            color: "#0891b2",
            icon: "🧪"
        };
    }

    openElectiveCourseDrawer(section) {
        const rawElectives = this.getAvailableElectivesForSection(section);
        const electives = rawElectives.map(e => ({
            ...e,
            theme: this.getElectiveThemeInfo(e)
        }));

        const schoolType = this.state.state.okulBilgisi.okulTuru || "";
        const targetHours = (window.app && typeof window.app.getTargetWeeklyHours === 'function') 
            ? window.app.getTargetWeeklyHours(section, schoolType) 
            : 40;

        const currentSec = this.state.getActiveSection() || section;
        const zorunluList = currentSec.zorunluDersler || [];
        const zorunluHours = zorunluList.reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);

        // Şubedeki mevcut seçmeli dersleri yerel taslak (draft) durumuna al
        const draftSelections = new Map();
        (currentSec.secmeliDersler || []).forEach(d => {
            const courseName = d.ders || d.ders_adi;
            const hour = parseInt(d.saat || d.ders_saati || 2, 10);
            const matched = electives.find(e => e.ders === courseName);
            draftSelections.set(courseName, {
                ders: courseName,
                saat: hour,
                grup: d.grup || (matched ? matched.grup : "Seçmeli"),
                defaultBranch: d.atananBrans || (matched ? matched.defaultBranch : "Diğer"),
                isVocational: d.isAtolye || d.isElectiveVocational || (matched ? matched.isVocational : false),
                theme: matched ? matched.theme : this.getElectiveThemeInfo(d)
            });
        });

        const vocCount = electives.filter(i => i.theme.subId === "VOC").length;
        const bilimCount = electives.filter(i => i.theme.subId === "BILIM").length;
        const degerCount = electives.filter(i => i.theme.subId === "DEGER").length;
        const sanatCount = electives.filter(i => i.theme.subId === "SANAT").length;
        const dilCount = electives.filter(i => i.theme.subId === "DIL").length;
        const bilisimCount = electives.filter(i => i.theme.subId === "BILISIM").length;
        
        let currentFilter = "ALL";
        let searchQuery = "";

        const getDraftStats = () => {
            let draftElectiveHours = 0;
            draftSelections.forEach(item => {
                draftElectiveHours += parseInt(item.saat || 0, 10);
            });
            const totalHours = zorunluHours + draftElectiveHours;
            const remaining = targetHours - totalHours;
            return {
                count: draftSelections.size,
                draftElectiveHours,
                totalHours,
                remaining
            };
        };

        const updateHeaderAndCommitBtn = () => {
            const statusEl = document.getElementById("elective-modal-status-badge");
            const commitBtn = document.getElementById("btn-commit-electives");
            const { count, draftElectiveHours, totalHours, remaining } = getDraftStats();

            if (statusEl) {
                if (totalHours === targetHours) {
                    statusEl.className = "elective-status-badge ok";
                    statusEl.innerHTML = `⏱️ Toplam: <strong>${totalHours}/${targetHours} Saat</strong> (Hedefe Ulaşıldı ✓)`;
                } else if (totalHours < targetHours) {
                    statusEl.className = "elective-status-badge warn";
                    statusEl.innerHTML = `⏱️ Toplam: <strong>${totalHours}/${targetHours} Saat</strong> (<strong>${remaining} Saat Seçmeli Ders Eksik</strong>)`;
                } else {
                    statusEl.className = "elective-status-badge over";
                    statusEl.innerHTML = `⏱️ Toplam: <strong>${totalHours}/${targetHours} Saat</strong> (<strong>${totalHours - targetHours} Saat</strong> Fazla)`;
                }
            }

            if (commitBtn) {
                commitBtn.innerHTML = `💾 Seçilen Dersleri Şubeye Aktar (${count} Ders • ${draftElectiveHours} Saat) ✓`;
            }
        };

        const THEME_GROUPS = [
            { key: "BILIM", title: "İnsan, Toplum ve Bilim Dersleri", icon: "🧪", color: "#0284c7" },
            { key: "DEGER", title: "Din, Ahlak ve Değer Dersleri", icon: "🕊️", color: "#059669" },
            { key: "SANAT", title: "Kültür, Sanat ve Spor Dersleri", icon: "🎨", color: "#d97706" },
            { key: "DIL", title: "Yabancı Diller ve İletişim Dersleri", icon: "🗣️", color: "#4f46e5" },
            { key: "BILISIM", title: "Bilişim ve Dijital Teknolojiler", icon: "💻", color: "#0891b2" },
            { key: "VOC", title: "Seçmeli Meslek ve Atölye Dersleri", icon: "⚙️", color: "#7c3aed" }
        ];

        const renderList = () => {
            const bodyEl = document.getElementById("elective-modal-list");
            if (!bodyEl) return;

            const filtered = electives.filter(item => {
                if (currentFilter !== "ALL") {
                    if (item.theme.subId !== currentFilter && item.theme.id !== currentFilter) {
                        return false;
                    }
                }
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase().replace(/i/g, 'i').replace(/ı/g, 'i');
                    const name = String(item.ders || "").toLowerCase().replace(/i/g, 'i').replace(/ı/g, 'i');
                    return name.includes(q);
                }
                return true;
            });

            if (filtered.length === 0) {
                bodyEl.innerHTML = `
                    <div style="text-align:center; padding: 3rem 1rem; color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">
                        🔍 Aradığınız kriterlere uygun seçmeli ders bulunamadı.
                    </div>
                `;
                return;
            }

            let groupsHtml = "";

            THEME_GROUPS.forEach(grp => {
                const groupCourses = filtered.filter(item => (item.theme.subId === grp.key || item.theme.id === grp.key));
                if (groupCourses.length === 0) return;

                groupsHtml += `
                    <div class="theme-group-block">
                        <div class="theme-group-header" style="--grp-color: ${grp.color};">
                            <div class="theme-group-title">
                                <span class="group-icon">${grp.icon}</span>
                                <span class="group-name">${grp.title}</span>
                            </div>
                            <span class="group-count-badge">${groupCourses.length} Ders</span>
                        </div>
                        <div class="theme-group-items">
                            ${groupCourses.map(item => {
                                const isSelected = draftSelections.has(item.ders);
                                const draftItem = draftSelections.get(item.ders);
                                const activeHours = isSelected ? draftItem.saat : (item.selectedHour || item.hoursOptions[0] || 2);

                                return `
                                    <div class="elective-table-row ${isSelected ? 'row-is-selected' : ''}" data-course="${item.ders}" style="--row-theme: ${grp.color};">
                                        <div class="row-selection-indicator"></div>
                                        <div class="row-info-col">
                                            <span class="row-course-title">${item.ders}</span>
                                        </div>
                                        <div class="row-action-col">
                                            <div class="row-hours-group">
                                                ${item.hoursOptions.map(h => `
                                                    <button type="button" class="table-hour-btn ${activeHours === h ? (isSelected ? 'hour-active-selected' : 'hour-active-preview') : ''}" data-course="${item.ders}" data-hour="${h}">
                                                        ${h} Saat
                                                    </button>
                                                `).join('')}
                                            </div>
                                            <div class="row-status-pill ${isSelected ? 'pill-selected' : 'pill-unselected'}">
                                                ${isSelected ? `✓ Seçildi (${activeHours}s)` : '+ Seç'}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `;
            });

            bodyEl.innerHTML = groupsHtml;

            // Satıra veya Seç butonuna tıklayınca Seç/Kaldır
            bodyEl.querySelectorAll(".elective-table-row").forEach(rowEl => {
                rowEl.addEventListener("click", (e) => {
                    // Eğer doğrudan saat butonuna tıklandıysa satır tıklamasını saat fonksiyonuna devret
                    if (e.target.closest(".table-hour-btn")) return;

                    const cName = rowEl.dataset.course;
                    const item = electives.find(i => i.ders === cName);
                    if (!item) return;

                    if (draftSelections.has(cName)) {
                        draftSelections.delete(cName);
                    } else {
                        const h = item.selectedHour || item.hoursOptions[0] || 2;
                        draftSelections.set(cName, {
                            ders: item.ders,
                            saat: h,
                            grup: item.grup || "Seçmeli",
                            defaultBranch: item.defaultBranch || "Diğer",
                            isVocational: !!item.isVocational,
                            theme: item.theme
                        });
                    }
                    updateHeaderAndCommitBtn();
                    renderList();
                });
            });

            // Saat butonlarına tıklama (Saat değiştirir ve gerekiyorsa seçili yapar)
            bodyEl.querySelectorAll(".table-hour-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const cName = btn.dataset.course;
                    const hour = parseInt(btn.dataset.hour, 10);
                    const item = electives.find(i => i.ders === cName);
                    if (!item) return;

                    item.selectedHour = hour;

                    if (draftSelections.has(cName)) {
                        // Zaten seçiliyse saatini güncelle
                        const currentDraft = draftSelections.get(cName);
                        currentDraft.saat = hour;
                    } else {
                        // Seçili değilse direkt bu saat ile seç
                        draftSelections.set(cName, {
                            ders: item.ders,
                            saat: hour,
                            grup: item.grup || "Seçmeli",
                            defaultBranch: item.defaultBranch || "Diğer",
                            isVocational: !!item.isVocational,
                            theme: item.theme
                        });
                    }
                    updateHeaderAndCommitBtn();
                    renderList();
                });
            });
        };

        const modalHtml = `
            <div class="modal-overlay active" id="elective-drawer-modal">
                <div class="modal-box elective-calm-modal">
                    <!-- SADE VE KONTRASTLI HEADER -->
                    <div class="elective-calm-header">
                        <div class="header-left-cluster">
                            <div>
                                <h3 class="header-main-title">Seçmeli Ders Ekle: ${section.subeAdi}</h3>
                                <p class="header-sub-text">${section.sinifSeviyesi}. Sınıf • ${section.ogrenciSayisi} Öğrenci • ${schoolType}</p>
                            </div>
                        </div>
                        <div class="header-right-cluster">
                            <div id="elective-modal-status-badge" class="elective-status-badge"></div>
                            <button class="header-close-btn" id="btn-close-elective-modal">✕</button>
                        </div>
                    </div>

                    <!-- FİLTRE VE ARAMA PANELİ -->
                    <div class="elective-calm-toolbar">
                        <!-- TEMA SEKMELERİ -->
                        <div class="calm-tabs-row">
                            <button class="calm-tab-btn active" data-tab="ALL">
                                📋 Tümü (${electives.length})
                            </button>
                            <button class="calm-tab-btn" data-tab="BILIM">
                                🧪 İnsan ve Bilim (${bilimCount})
                            </button>
                            <button class="calm-tab-btn" data-tab="DEGER">
                                🕊️ Din ve Değer (${degerCount})
                            </button>
                            <button class="calm-tab-btn" data-tab="SANAT">
                                🎨 Sanat ve Spor (${sanatCount})
                            </button>
                            <button class="calm-tab-btn" data-tab="DIL">
                                🗣️ Yabancı Diller (${dilCount})
                            </button>
                            <button class="calm-tab-btn" data-tab="BILISIM">
                                💻 Bilişim (${bilisimCount})
                            </button>
                            ${vocCount > 0 ? `
                                <button class="calm-tab-btn" data-tab="VOC">
                                    ⚙️ Seçmeli Meslek (${vocCount})
                                </button>
                            ` : ''}
                        </div>

                        <!-- ARAMA ÇUBUĞU -->
                        <div class="calm-search-row">
                            <span class="search-lens">🔍</span>
                            <input type="text" class="calm-search-input" id="elective-search-input" placeholder="Ders adı ara (örn: Astronomi, Kur'an, Drama, Robotik, Almanca)...">
                        </div>
                    </div>

                    <!-- DERS LİSTESİ -->
                    <div class="modal-body elective-calm-body" id="elective-modal-list">
                    </div>

                    <!-- FOOTER: MANUEL DERS + TEK ŞUBEYE AKTAR BUTONU -->
                    <div class="elective-calm-footer">
                        <div class="custom-add-mini-form">
                            <span class="mini-form-label">➕ Manuel Ders:</span>
                            <input type="text" id="custom-el-name" class="mini-input" placeholder="Özel Ders Adı...">
                            <select id="custom-el-hour" class="mini-select">
                                <option value="1">1 Saat</option>
                                <option value="2" selected>2 Saat</option>
                                <option value="3">3 Saat</option>
                                <option value="4">4 Saat</option>
                            </select>
                            <button type="button" class="btn-mini-add" id="btn-add-custom-elective">+ Listeye Ekle</button>
                        </div>
                        
                        <div class="footer-actions-group">
                            <button class="btn btn-secondary" id="btn-cancel-elective-modal" style="padding: 0.55rem 1.1rem; font-weight: 700;">
                                Vazgeç
                            </button>
                            <button class="btn btn-primary btn-commit-action" id="btn-commit-electives" style="padding: 0.55rem 1.6rem; font-weight: 800; font-size: 0.88rem;">
                                💾 Seçilen Dersleri Şubeye Aktar ✓
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        updateHeaderAndCommitBtn();
        renderList();

        // Tema Sekme Tıklama
        document.querySelectorAll("#elective-drawer-modal .calm-tab-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll("#elective-drawer-modal .calm-tab-btn").forEach(b => b.classList.remove("active"));
                e.currentTarget.classList.add("active");
                currentFilter = e.currentTarget.dataset.tab;
                renderList();
            });
        });

        // Arama Metni
        const searchInput = document.getElementById("elective-search-input");
        searchInput?.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            renderList();
        });

        // Manuel Özel Ders Ekleme
        document.getElementById("btn-add-custom-elective")?.addEventListener("click", () => {
            const cName = document.getElementById("custom-el-name")?.value.trim();
            const cHour = parseInt(document.getElementById("custom-el-hour")?.value || 2, 10);

            if (!cName) {
                alert("Lütfen bir seçmeli ders adı giriniz.");
                return;
            }

            const targetSec = this.state.getActiveSection() || section;
            const autoBranch = (window.curriculumEngine && typeof window.curriculumEngine.resolveBranch === 'function')
                ? window.curriculumEngine.resolveBranch(cName, targetSec.alanId || targetSec.alanAdi, "SEÇMELİ DERSLER")
                : "Diğer";

            draftSelections.set(cName, {
                ders: cName,
                saat: cHour,
                grup: "Özel Seçmeli",
                defaultBranch: autoBranch || "Diğer",
                isVocational: false,
                theme: { id: "BILIM", subId: "BILIM", color: "#0284c7", icon: "📝", badge: "Özel Ders" }
            });

            document.getElementById("custom-el-name").value = "";
            this.showToast(`✨ "${cName}" (${cHour}s) seçim listesine eklendi.`, "info");
            updateHeaderAndCommitBtn();
            renderList();
        });

        // Kapatma / Vazgeç Butonları
        document.getElementById("btn-close-elective-modal")?.addEventListener("click", () => {
            document.getElementById("elective-drawer-modal")?.remove();
        });
        document.getElementById("btn-cancel-elective-modal")?.addEventListener("click", () => {
            document.getElementById("elective-drawer-modal")?.remove();
        });

        // SEÇİLEN DERSLERİ ŞUBEYE AKTAR BUTONU
        document.getElementById("btn-commit-electives")?.addEventListener("click", () => {
            const targetSec = this.state.getActiveSection() || section;
            if (!targetSec) return;

            // Şubenin seçmeli derslerini draftSelections ile güncelle
            targetSec.secmeliDersler = Array.from(draftSelections.values()).map(sel => ({
                ders: sel.ders,
                saat: sel.saat,
                kategori: sel.isVocational ? "SEÇMELİ MESLEK DERSLERİ" : "SEÇMELİ DERSLER",
                atananBrans: sel.defaultBranch || "Diğer",
                baraj_ders: false,
                isAtolye: !!sel.isVocational,
                isElectiveVocational: !!sel.isVocational,
                grup: sel.grup || "Seçmeli"
            }));

            const { count, draftElectiveHours } = getDraftStats();
            this.state.notify();
            this.showToast(`✨ ${count} seçmeli ders (${draftElectiveHours} Saat) ${targetSec.subeAdi} şubesine başarıyla aktarıldı!`, "success");
            document.getElementById("elective-drawer-modal")?.remove();
        });
    }

    // Akıllı Seçmeli Paket Uygulayıcı
    applyElectivePreset(section, presetType, electivesList) {
        const currentSec = this.state.getActiveSection() || section;
        if (!currentSec) return;

        if (presetType === "CLEAR") {
            currentSec.secmeliDersler = [];
            this.state.notify();
            this.showToast(`🗑️ "${currentSec.subeAdi}" şubesinin seçmeli dersleri temizlendi.`, "success");
            return;
        }

        const addIfFound = (keyword, defaultHour, themeId) => {
            const normKey = keyword.toLowerCase().replace(/i/g, 'i').replace(/ı/g, 'i');
            const found = electivesList.find(e => {
                const normName = e.ders.toLowerCase().replace(/i/g, 'i').replace(/ı/g, 'i');
                return normName.includes(normKey);
            });
            if (found && !(currentSec.secmeliDersler || []).some(d => (d.ders || d.ders_adi) === found.ders)) {
                this.state.addElectiveCourse(currentSec.id, {
                    ders: found.ders,
                    saat: defaultHour,
                    kategori: found.isVocational ? "SEÇMELİ MESLEK DERSLERİ" : "SEÇMELİ DERSLER",
                    atananBrans: found.defaultBranch || "Diğer",
                    baraj_ders: false,
                    isAtolye: !!found.isVocational,
                    isElectiveVocational: !!found.isVocational,
                    grup: found.grup
                });
            }
        };

        if (presetType === "BALANCED") {
            // 2s Bilim + 2s Değer + 2s Sanat
            addIfFound("robotik", 2, "BILIM") || addIfFound("astronomi", 2, "BILIM") || addIfFound("matematik", 2, "BILIM");
            addIfFound("kuran", 2, "DEGER") || addIfFound("peygamber", 2, "DEGER") || addIfFound("temel dini", 2, "DEGER");
            addIfFound("drama", 2, "SANAT") || addIfFound("muzik", 2, "SANAT") || addIfFound("gorsel", 2, "SANAT") || addIfFound("spor", 2, "SANAT");
            this.showToast(`🎯 TTKB 3-Tema Dengeli Paketi başarıyla yüklendi!`, "success");
        } else if (presetType === "SCIENCE") {
            // Sayısal & Bilişim
            addIfFound("fizik", 2, "BILIM") || addIfFound("kimya", 2, "BILIM") || addIfFound("fen", 2, "BILIM");
            addIfFound("biyoloji", 2, "BILIM") || addIfFound("matematik", 2, "BILIM");
            addIfFound("robotik", 2, "BILISIM") || addIfFound("yapay zeka", 2, "BILISIM") || addIfFound("programlama", 2, "BILISIM");
            this.showToast(`🧪 Sayısal & Bilişim Paketi uygulandı!`, "success");
        } else if (presetType === "SOCIAL") {
            // Sözel & Sanat & Dil
            addIfFound("diksiyon", 2, "SANAT") || addIfFound("masal", 2, "SANAT") || addIfFound("tiyatro", 2, "SANAT");
            addIfFound("ikinci yabanci", 2, "DIL") || addIfFound("ingilizce", 2, "DIL") || addIfFound("almanca", 2, "DIL");
            addIfFound("sosyoloji", 2, "BILIM") || addIfFound("psikoloji", 2, "BILIM") || addIfFound("turk kultur", 2, "BILIM");
            this.showToast(`📚 Sözel & Dil Paketi uygulandı!`, "success");
        } else if (presetType === "VOC") {
            // Seçmeli Meslek
            const vocs = electivesList.filter(e => e.isVocational);
            vocs.slice(0, 3).forEach(v => {
                if (!(currentSec.secmeliDersler || []).some(d => (d.ders || d.ders_adi) === v.ders)) {
                    this.state.addElectiveCourse(currentSec.id, {
                        ders: v.ders,
                        saat: v.hoursOptions[0] || 2,
                        kategori: "SEÇMELİ MESLEK DERSLERİ",
                        atananBrans: v.defaultBranch || "Meslek Dersi",
                        baraj_ders: false,
                        isAtolye: true,
                        isElectiveVocational: true,
                        grup: v.grup
                    });
                }
            });
            this.showToast(`⚙️ Seçmeli Meslek Paketi uygulandı!`, "success");
        }
    }

    // --- SEZON DEVRİ VE SINIF ATLATMA SİHİRBAZI MODALI ---
    openSeasonRolloverModal(newSeason) {
        const currentSeason = this.state.state.okulBilgisi.sezon;
        const totalSections = this.state.state.subeler.length;

        const modalHtml = `
            <div class="modal-overlay active" id="season-rollover-modal">
                <div class="modal-box" style="max-width: 620px; width: 95%;">
                    <div class="modal-header">
                        <div class="modal-title">🚀 Eğitim-Öğretim Sezonu Devri & Sınıf Atlatma</div>
                        <button class="modal-close-btn" onclick="document.getElementById('season-rollover-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body" style="padding: 1.25rem;">
                        <p style="font-size: 0.86rem; color: var(--text-main); margin-bottom: 1rem; line-height: 1.5;">
                            Sezonu <strong>${currentSeason}</strong> döneminden <strong>${newSeason}</strong> dönemine aktarıyorsunuz. 
                            Mevcut <strong>${totalSections} adet şubeniz</strong> için lütfen aktarım yöntemini seçiniz:
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <label class="rollover-option-card" style="display: flex; gap: 0.75rem; padding: 0.85rem; border: 2px solid var(--primary); border-radius: var(--radius-md); background: var(--primary-light); cursor: pointer;">
                                <input type="radio" name="rollover_mode" value="PROMOTE" checked style="margin-top: 0.2rem;">
                                <div>
                                    <div style="font-weight: 800; font-size: 0.9rem; color: var(--primary);">🚀 1. Akıllı Sınıf Atlatma & Müfredat Uyarlaması (Önerilen)</div>
                                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.4;">
                                        * 9. Sınıflar ➔ 10. Sınıf, 10'lar ➔ 11, 11'ler ➔ 12. Sınıf yapılır (Örn: 9-A ➔ 10-A).<br>
                                        * 12. Sınıflar mezun edilir, yeni sınıfın resmî zorunlu ders çizelgesi otomatik yüklenir.<br>
                                        * Seçmeli dersler okul yönetimi tarafından yeni sezonda serbestçe seçilmek üzere temizlenir.
                                    </div>
                                </div>
                            </label>

                            <label class="rollover-option-card" style="display: flex; gap: 0.75rem; padding: 0.85rem; border: 1px solid var(--border-main); border-radius: var(--radius-md); background: var(--bg-card-subtle); cursor: pointer;">
                                <input type="radio" name="rollover_mode" value="COPY_AS_IS" style="margin-top: 0.2rem;">
                                <div>
                                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">📋 2. Mevcut Şube Yapısını Olduğu Gibi Koru (Şablon Olarak Aktar)</div>
                                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.4;">
                                        Mevcut tüm şube isimleri, dersler ve branş atamaları 1-e-1 yeni sezona aktarılır.
                                    </div>
                                </div>
                            </label>

                            <label class="rollover-option-card" style="display: flex; gap: 0.75rem; padding: 0.85rem; border: 1px solid var(--border-main); border-radius: var(--radius-md); background: var(--bg-card-subtle); cursor: pointer;">
                                <input type="radio" name="rollover_mode" value="RESET" style="margin-top: 0.2rem;">
                                <div>
                                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--status-danger-text);">✨ 3. Yeni Sezon İçin Sıfırdan Başla (Boş Liste)</div>
                                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.4;">
                                        Mevcut şubeler sıfırlanır, yeni sezonda şubeler baştan oluşturulur.
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('season-rollover-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-confirm-season-rollover">Sezonu Aktar ve Uygula</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        document.getElementById("btn-confirm-season-rollover")?.addEventListener("click", () => {
            const selectedMode = document.querySelector('input[name="rollover_mode"]:checked')?.value || "PROMOTE";

            if (selectedMode === "PROMOTE") {
                this.state.promoteSectionsToNextSeason(newSeason, this.curriculum);
                this.showToast(`${newSeason} sezonuna geçildi: Sınıflar atlatıldı ve yeni müfredat atandı!`, "success");
            } else if (selectedMode === "COPY_AS_IS") {
                this.state.changeSeason(newSeason, true);
                this.showToast(`${newSeason} sezonuna geçildi: Şube yapısı korundu.`, "success");
            } else {
                this.state.changeSeason(newSeason, false);
                this.showToast(`${newSeason} sezonu boş liste ile başlatıldı.`, "info");
            }

            this.closeModal("season-rollover-modal");
        });
    }

    // --- SINIF VE ŞUBE BÖLME SİHİRBAZI MODALI (SECTION SPLITTING WIZARD) ---
    openSplitSectionModal(section) {
        if (!section) return;

        const totalStudents = parseInt(section.ogrenciSayisi || 30, 10);
        const gradeLevel = section.sinifSeviyesi;
        const currentName = section.subeAdi;

        // Bölme önerileri
        const half1 = Math.ceil(totalStudents / 2);
        const half2 = totalStudents - half1;

        const third1 = Math.ceil(totalStudents / 3);
        const third2 = Math.ceil((totalStudents - third1) / 2);
        const third3 = totalStudents - third1 - third2;

        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "P"];
        const existingNames = this.state.state.subeler.filter(s => s.sinifSeviyesi === gradeLevel).map(s => s.subeAdi.trim().toUpperCase());
        const availableLetters = letters.filter(l => !existingNames.includes(`${gradeLevel}-${l}`));
        const letter2 = availableLetters[0] || "B";
        const letter3 = availableLetters[1] || "C";
        const name2 = `${gradeLevel}-${letter2}`;
        const name3 = `${gradeLevel}-${letter3}`;

        // Toplam ders saati
        const totalHours = [...(section.zorunluDersler || []), ...(section.secmeliDersler || [])].reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);

        // Meslek dal listesi (Varsa)
        const isVoc = !!section.alanId;
        const vocAreas = this.db.getVocationalAreas();
        const areaObj = isVoc ? vocAreas.find(a => a.id === section.alanId) : null;
        const branchesList = (areaObj && areaObj.branches) ? areaObj.branches : [];

        const modalHtml = `
            <div class="modal-overlay active" id="split-section-modal">
                <div class="modal-box" style="max-width: 640px; width: 95%;">
                    <div class="modal-header">
                        <div class="modal-title">✂️ Sınıf & Şube Bölme Sihirbazı: ${currentName}</div>
                        <button class="modal-close-btn" onclick="document.getElementById('split-section-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body" style="padding: 1.15rem 1.25rem;">
                        <!-- Mevcut Durum Kartı -->
                        <div class="split-current-banner" style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(14, 165, 233, 0.04) 100%); border: 1.5px solid rgba(2, 132, 199, 0.25); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <div style="font-weight: 800; font-size: 0.95rem; color: #0284c7;">🏫 ${currentName} (${gradeLevel}. Sınıf)</div>
                                <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.15rem;">
                                    Mevcut Toplam Öğrenci: <strong>${totalStudents}</strong> • Haftalık Ders Saati: <strong>${totalHours} Saat</strong>
                                </div>
                            </div>
                            <div style="font-size: 0.72rem; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.6rem; border-radius: 6px;">
                                MEB Kapasite: ${totalStudents > 34 ? '⚠️ Bölünme Önerilir' : '✅ Uygun'}
                            </div>
                        </div>

                        <!-- Bölünme Yöntemi Seçenekleri -->
                        <div style="font-weight: 800; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.03em;">
                            1. Bölünme Modelini Seçiniz:
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1rem;">
                            <!-- Mod 1: Eşit İkiye Böl -->
                            <label class="split-mode-card" style="display: flex; gap: 0.75rem; padding: 0.75rem 0.9rem; border: 2px solid var(--primary); border-radius: 8px; background: var(--primary-light); cursor: pointer;">
                                <input type="radio" name="split_mode" value="EQUAL_2" checked style="margin-top: 0.2rem;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 800; font-size: 0.88rem; color: var(--primary);">🚀 Eşit 2 Şubeye Böl (Önerilen)</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
                                        <strong>${currentName}:</strong> ${half1} Öğrenci &nbsp;|&nbsp; <strong>${name2}:</strong> ${half2} Öğrenci
                                    </div>
                                </div>
                            </label>

                            <!-- Mod 2: Özel Sayılı 2 Şube -->
                            <label class="split-mode-card" style="display: flex; gap: 0.75rem; padding: 0.75rem 0.9rem; border: 1px solid var(--border-main); border-radius: 8px; background: var(--bg-card-subtle); cursor: pointer;">
                                <input type="radio" name="split_mode" value="CUSTOM_2" style="margin-top: 0.2rem;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">⚖️ Özel Öğrenci Sayıları ile 2 Şubeye Böl</div>
                                    <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.2rem;">
                                        İki şubenin öğrenci sayılarını kendi dağıtımınıza göre belirleyin.
                                    </div>
                                    <div id="custom-2-inputs" style="display: none; margin-top: 0.6rem; gap: 0.75rem; align-items: center;">
                                        <div style="display: flex; align-items: center; gap: 0.4rem;">
                                            <span style="font-weight: 700; font-size: 0.78rem;">${currentName}:</span>
                                            <input type="number" id="input-split-s1" class="form-control" value="${half1}" min="1" max="${totalStudents - 1}" style="width: 70px; padding: 0.2rem 0.4rem; text-align: center; font-weight: 800;">
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 0.4rem;">
                                            <span style="font-weight: 700; font-size: 0.78rem;">${name2}:</span>
                                            <input type="number" id="input-split-s2" class="form-control" value="${half2}" min="1" max="${totalStudents - 1}" style="width: 70px; padding: 0.2rem 0.4rem; text-align: center; font-weight: 800;">
                                        </div>
                                        <span id="custom-sum-indicator" style="font-size: 0.72rem; color: #16a34a; font-weight: 700;">Toplam: ${totalStudents}</span>
                                    </div>
                                </div>
                            </label>

                            <!-- Mod 3: 3 Şubeye Böl -->
                            <label class="split-mode-card" style="display: flex; gap: 0.75rem; padding: 0.75rem 0.9rem; border: 1px solid var(--border-main); border-radius: 8px; background: var(--bg-card-subtle); cursor: pointer;">
                                <input type="radio" name="split_mode" value="EQUAL_3" style="margin-top: 0.2rem;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">⚡ 3 Şubeye Böl (Kalabalık Sınıflar İçin)</div>
                                    <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.2rem;">
                                        <strong>${currentName}:</strong> ${third1} Öğr. &nbsp;|&nbsp; <strong>${name2}:</strong> ${third2} Öğr. &nbsp;|&nbsp; <strong>${name3}:</strong> ${third3} Öğr.
                                    </div>
                                </div>
                            </label>
                        </div>

                        ${isVoc && branchesList.length > 1 ? `
                            <!-- Meslek Liseleri Dal Seçimi -->
                            <div style="background: rgba(147, 51, 234, 0.06); border: 1px solid rgba(147, 51, 234, 0.2); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;">
                                <div style="font-weight: 800; font-size: 0.78rem; color: #7e22ce; margin-bottom: 0.35rem;">
                                    ⚙️ Meslek Dalı Ayrımı (İsteğe Bağlı):
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                                    <div>
                                        <label style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted);">${currentName} Dalı:</label>
                                        <select id="split-source-dal" class="form-control" style="font-size: 0.75rem; padding: 0.25rem 0.4rem;">
                                            <option value="">— Dal Seçilmedi (Ortak Alan) —</option>
                                            ${branchesList.map(b => `<option value="${b.name}" ${section.dalAdi === b.name ? 'selected' : ''}>${b.name}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div>
                                        <label style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted);">${name2} Dalı:</label>
                                        <select id="split-new-dal" class="form-control" style="font-size: 0.75rem; padding: 0.25rem 0.4rem;">
                                            <option value="">— Dal Seçilmedi (Ortak Alan) —</option>
                                            ${branchesList.map((b, i) => `<option value="${b.name}" ${(section.dalAdi !== b.name && i === 1) ? 'selected' : ''}>${b.name}</option>`).join("")}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Ayarlar & Seçenekler -->
                        <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.65rem 0.85rem; margin-bottom: 0.85rem;">
                            <div style="font-weight: 800; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                                2. Müfredat & Ders Aktarımı Seçenekleri:
                            </div>
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); margin-bottom: 0.35rem; cursor: pointer;">
                                <input type="checkbox" id="chk-split-electives" checked>
                                <span>Mevcut <strong>seçmeli dersleri ve branş atamalarını</strong> yeni şubeye/şubelere kopyala</span>
                            </label>
                        </div>

                        <!-- Telemetri ve Etki Notu -->
                        <div style="font-size: 0.73rem; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 0.45rem 0.75rem; display: flex; align-items: center; gap: 0.45rem;">
                            <span>ℹ️</span>
                            <span>Bu işlem sonucunda okulun toplam ders yükü <strong>+${totalHours} Saat</strong> artacak ve sağ paneldeki norm kadro ihtiyacı anında güncellenecektir.</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('split-section-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-confirm-split-section">✂️ Şubeyi Böl ve Uygula</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        // Dinamik Etkileşimler
        const modeRadios = document.querySelectorAll('input[name="split_mode"]');
        const customInputs = document.getElementById("custom-2-inputs");
        const inpS1 = document.getElementById("input-split-s1");
        const inpS2 = document.getElementById("input-split-s2");
        const sumIndicator = document.getElementById("custom-sum-indicator");

        modeRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                document.querySelectorAll(".split-mode-card").forEach(c => {
                    c.style.border = "1px solid var(--border-main)";
                    c.style.background = "var(--bg-card-subtle)";
                });
                const parent = radio.closest(".split-mode-card");
                if (parent) {
                    parent.style.border = "2px solid var(--primary)";
                    parent.style.background = "var(--primary-light)";
                }
                if (customInputs) {
                    customInputs.style.display = radio.value === "CUSTOM_2" ? "flex" : "none";
                }
            });
        });

        if (inpS1 && inpS2 && sumIndicator) {
            inpS1.addEventListener("input", () => {
                const val1 = parseInt(inpS1.value, 10) || 1;
                const val2 = Math.max(1, totalStudents - val1);
                inpS2.value = val2;
                sumIndicator.textContent = `Toplam: ${val1 + val2}`;
            });
            inpS2.addEventListener("input", () => {
                const val2 = parseInt(inpS2.value, 10) || 1;
                const val1 = Math.max(1, totalStudents - val2);
                inpS1.value = val1;
                sumIndicator.textContent = `Toplam: ${val1 + val2}`;
            });
        }

        // Onay Butonu
        document.getElementById("btn-confirm-split-section")?.addEventListener("click", () => {
            const selectedMode = document.querySelector('input[name="split_mode"]:checked')?.value || "EQUAL_2";
            const copyElectives = document.getElementById("chk-split-electives")?.checked !== false;
            const srcDal = document.getElementById("split-source-dal")?.value;
            const newDal = document.getElementById("split-new-dal")?.value;

            let splitPlan = {};

            if (selectedMode === "EQUAL_2") {
                splitPlan = {
                    sourceStudents: half1,
                    sourceDalAdi: srcDal || section.dalAdi,
                    copyElectives: copyElectives,
                    newSections: [
                        { subeAdi: name2, ogrenciSayisi: half2, dalAdi: newDal || section.dalAdi }
                    ]
                };
            } else if (selectedMode === "CUSTOM_2") {
                const val1 = parseInt(inpS1?.value, 10) || half1;
                const val2 = parseInt(inpS2?.value, 10) || half2;
                splitPlan = {
                    sourceStudents: val1,
                    sourceDalAdi: srcDal || section.dalAdi,
                    copyElectives: copyElectives,
                    newSections: [
                        { subeAdi: name2, ogrenciSayisi: val2, dalAdi: newDal || section.dalAdi }
                    ]
                };
            } else if (selectedMode === "EQUAL_3") {
                splitPlan = {
                    sourceStudents: third1,
                    sourceDalAdi: srcDal || section.dalAdi,
                    copyElectives: copyElectives,
                    newSections: [
                        { subeAdi: name2, ogrenciSayisi: third2, dalAdi: newDal || section.dalAdi },
                        { subeAdi: name3, ogrenciSayisi: third3, dalAdi: newDal || section.dalAdi }
                    ]
                };
            }

            const result = this.state.splitSection(section.id, splitPlan);
            if (result) {
                const createdNames = result.createdSections.map(s => s.subeAdi).join(", ");
                this.showToast(`✂️ ${currentName} şubesi başarıyla bölündü: ${currentName} ve ${createdNames} oluşturuldu!`, "success");
            }
            this.closeModal("split-section-modal");
        });
    }

    openCourseMergeModal(section, courseName) {
        const sameGradeSections = this.state.state.subeler.filter(s => s.sinifSeviyesi === section.sinifSeviyesi && s.id !== section.id);
        const currentCourse = [...section.zorunluDersler, ...section.secmeliDersler].find(d => (d.ders || d.ders_adi) === courseName);
        const mergedIds = currentCourse?.birlesikSubeler || [];

        const listHtml = sameGradeSections.length === 0 
            ? `<p style="color: var(--text-muted); padding: 1rem 0;">Aynı sınıf seviyesinde birleştirilebilecek başka bir şube bulunmuyor.</p>`
            : sameGradeSections.map(s => {
                const isChecked = mergedIds.includes(s.id);
                return `
                    <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0.75rem; background: var(--bg-card-subtle); border: 1px solid var(--border-main); border-radius: var(--radius-md); margin-bottom: 0.45rem; cursor: pointer;">
                        <input type="checkbox" class="merge-checkbox" data-target="${s.id}" ${isChecked ? 'checked' : ''}>
                        <span style="font-weight: 700; color: var(--text-main);">${s.subeAdi}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">(${s.ogrenciSayisi} Öğrenci)</span>
                    </label>
                `;
            }).join("");

        const modalHtml = `
            <div class="modal-overlay active" id="course-merge-modal">
                <div class="modal-box" style="max-width: 500px;">
                    <div class="modal-header">
                        <div class="modal-title">🔗 Sınıf Birleştirme: ${courseName}</div>
                        <button class="modal-close-btn" onclick="document.getElementById('course-merge-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.85rem; line-height: 1.45;">
                            <strong>${section.subeAdi}</strong> şubesinin <strong>${courseName}</strong> dersini aşağıdaki şubelerle ortak işlemek üzere birleştirebilirsiniz. Birleştirilen dersler için <strong>öğretmen normuna tek ders yükü</strong> yazılır.
                        </p>
                        ${listHtml}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('course-merge-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-save-course-merge">Kaydet ve Kapat</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        document.getElementById("btn-save-course-merge").addEventListener("click", () => {
            document.querySelectorAll(".merge-checkbox").forEach(cb => {
                const targetId = cb.dataset.target;
                const shouldBeMerged = cb.checked;
                const isCurrentlyMerged = mergedIds.includes(targetId);

                if (shouldBeMerged !== isCurrentlyMerged) {
                    this.state.toggleCourseMerge(section.id, courseName, targetId);
                }
            });
            this.closeModal("course-merge-modal");
            this.showToast("Sınıf birleştirme ayarları güncellendi.", "success");
        });
    }

    openTeacherStaffModal() {
        const currentTeachers = this.state.state.mevcutOgretmenler || {};
        const coordinatorMap = this.state.state.koordinatorlukYukleri || {};
        const subeler = this.state.state.subeler || [];
        const vocAreas = this.db.getVocationalAreas();
        const schoolType = this.state.state.okulBilgisi.okulTuru || "";
        const isVocationalSchool = schoolType.includes("meslek") || schoolType.includes("teknik") || schoolType.includes("mtegm") || subeler.some(s => s.alanId);
        const adminOpts = this.state.state.okulBilgisi.adminOptions || {};
        const totalStudents = subeler.reduce((sum, s) => sum + (parseInt(s.ogrenciSayisi, 10) || 0), 0);

        const cultureBranches = this.db.getGeneralCultureBranchesList();
        const vocBranches = this.db.getVocationalBranchesList();

        let totalStaffCount = 0;
        let staffedBranchCount = 0;
        Object.keys(currentTeachers).forEach(k => {
            const val = parseInt(currentTeachers[k] || 0, 10);
            if (val > 0) {
                totalStaffCount += val;
                staffedBranchCount++;
            }
        });

        const renderBranchRow = (bName, isVoc = false) => {
            const count = parseInt(currentTeachers[bName] || 0, 10);
            const hasStaff = count > 0;
            return `
                <div class="staff-branch-row" data-search="${bName.toLowerCase()}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.65rem; border-bottom: 1px solid var(--border-subtle); background: ${hasStaff ? 'rgba(34, 197, 94, 0.08)' : 'transparent'}; border-left: 3px solid ${hasStaff ? '#16a34a' : 'transparent'}; border-radius: 6px; margin-bottom: 0.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.45rem;">
                        <span style="font-size: 0.85rem;">${isVoc ? '🟣' : '📘'}</span>
                        <span style="font-size: 0.83rem; font-weight: ${hasStaff ? '700' : '600'}; color: var(--text-main);">${bName}</span>
                        ${hasStaff ? `<span style="font-size: 0.65rem; background: #dcfce7; color: #15803d; padding: 0.05rem 0.4rem; border-radius: 4px; font-weight: 800;">● ${count} Kadrolu</span>` : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <input type="number" class="form-control teacher-count-input" data-branch="${bName}" value="${count}" min="0" max="100" style="width: 72px; padding: 0.22rem 0.35rem; text-align: center; font-weight: 800; color: ${hasStaff ? '#15803d' : 'var(--text-main)'};">
                        <span style="font-size: 0.72rem; color: var(--text-muted);">Öğr.</span>
                    </div>
                </div>
            `;
        };

        const cultureRowsHtml = cultureBranches.map(b => renderBranchRow(b, false)).join("");
        const vocRowsHtml = vocBranches.map(b => renderBranchRow(b, true)).join("");

        const allVocBranches = isVocationalSchool ? vocBranches : [];
        const activeVocBranchesSet = new Set();
        if (isVocationalSchool) {
            subeler.forEach(s => {
                if (s.alanId) {
                    const areaObj = vocAreas.find(a => a.id === s.alanId);
                    if (areaObj) activeVocBranchesSet.add(areaObj.name.replace(/\s*ALANI$/i, ''));
                    else activeVocBranchesSet.add(s.alanId);
                }
            });
        }

        const sortedVocBranches = isVocationalSchool ? [...allVocBranches].sort((a, b) => {
            const isActA = activeVocBranchesSet.has(a);
            const isActB = activeVocBranchesSet.has(b);
            if (isActA !== isActB) return isActA ? -1 : 1;
            return a.localeCompare(b, 'tr');
        }) : [];

        const coordinatorRowsHtml = sortedVocBranches.map(bName => {
            const isActive = activeVocBranchesSet.has(bName);
            const currentHours = (coordinatorMap[bName] !== undefined) ? coordinatorMap[bName] : (isActive ? 10 : 0);
            return `
                <div class="coordinator-area-item" data-search="${bName.toLowerCase()}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.48rem 0.6rem; border-bottom: 1px solid var(--border-subtle); background: ${isActive ? 'rgba(147, 51, 234, 0.05)' : 'var(--bg-card-subtle)'}; border-left: 3px solid ${isActive ? '#9333ea' : 'transparent'}; border-radius: 6px; margin-bottom: 0.35rem;">
                    <div>
                        <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.35rem;">
                            <span>${isActive ? '⚡' : '🟣'} ${bName}</span>
                            ${isActive ? '<span style="font-size: 0.65rem; background: rgba(147, 51, 234, 0.15); color: #7e22ce; font-weight: 800; padding: 0.08rem 0.4rem; border-radius: 4px;">Okulda Aktif Alan</span>' : ''}
                        </div>
                        <div style="font-size: 0.68rem; color: var(--text-muted);">12. Sınıf İşletmelerde Mesleki Eğitim Staj Denetim Yükü</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                        <input type="number" class="form-control coordinator-hours-input" data-branch="${bName}" value="${currentHours}" min="0" max="60" style="width: 68px; padding: 0.2rem 0.35rem; text-align: center; font-weight: 800; color: #7e22ce;">
                        <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted);">Saat</span>
                    </div>
                </div>
            `;
        }).join("");

        const modalHtml = `
            <div class="modal-overlay active" id="staff-modal">
                <div class="modal-box" style="max-width: 720px; width: 95%;">
                    <div class="modal-header">
                        <div class="modal-title">⚙️ Kadro, İdareci & Kurumsal Özellikler Yönetimi</div>
                        <button class="modal-close-btn" onclick="document.getElementById('staff-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body" style="max-height: 72vh; padding: 1rem 1.25rem;">
                        <!-- Sekmeler -->
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.85rem; border-bottom: 1.5px solid var(--border-main); padding-bottom: 0.5rem; flex-wrap: wrap;">
                            <button class="btn btn-sm btn-primary staff-tab-btn active" data-target="staff-teachers-tab">
                                👥 Kadrolu Öğretmenler
                            </button>
                            <button class="btn btn-sm btn-outline staff-tab-btn" data-target="staff-admin-tab" style="color: #0284c7; border-color: #7dd3fc;">
                                🏛️ İdareci Normları & Okul Özellikleri
                            </button>
                            ${isVocationalSchool ? `
                                <button class="btn btn-sm btn-outline staff-tab-btn" data-target="staff-coordinator-tab" style="color: #7e22ce; border-color: #d8b4fe;">
                                    🏢 Koordinatörlük
                                </button>
                            ` : ''}
                        </div>

                        <!-- 1. Sekme: Kadrolu Öğretmenler -->
                        <div id="staff-teachers-tab" class="staff-tab-content">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem; background: var(--bg-card-subtle); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                                <div style="font-size: 0.78rem; color: var(--text-muted);">
                                    MEB Talim ve Terbiye Kurulu 9 Sayılı Karar Atama Alanları
                                </div>
                                <div style="font-size: 0.78rem; font-weight: 700; color: #16a34a;">
                                    Toplam Kadrolu: <strong>${totalStaffCount}</strong> Öğretmen (${staffedBranchCount} Branş)
                                </div>
                            </div>

                            <div style="margin-bottom: 0.75rem;">
                                <input type="text" id="staff-branch-search" placeholder="🔍 Branş Ara (örn: Türk Dili, Matematik, Bilişim, Makine, Din Kültürü)..." class="form-control" style="width: 100%; padding: 0.45rem 0.75rem; font-size: 0.85rem; border-radius: 8px;">
                            </div>

                            <div id="staff-branches-list-container" style="max-height: 44vh; overflow-y: auto; padding-right: 0.25rem;">
                                <div class="branch-group-container" style="margin-bottom: 1rem;">
                                    <div style="font-size: 0.75rem; font-weight: 800; color: #2563eb; background: rgba(37, 99, 235, 0.08); padding: 0.35rem 0.65rem; border-radius: 6px; margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between;">
                                        <span>📘 GENEL BİLGİ VE KÜLTÜR BRANŞLARI</span>
                                        <span>${cultureBranches.length} Branş</span>
                                    </div>
                                    <div class="branch-group-items">
                                        ${cultureRowsHtml}
                                    </div>
                                </div>

                                <div class="branch-group-container">
                                    <div style="font-size: 0.75rem; font-weight: 800; color: #7e22ce; background: rgba(147, 51, 234, 0.08); padding: 0.35rem 0.65rem; border-radius: 6px; margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between;">
                                        <span>🟣 MESLEKİ VE TEKNİK (ATÖLYE VE LABORATUVAR) BRANŞLARI</span>
                                        <span>${vocBranches.length} Branş</span>
                                    </div>
                                    <div class="branch-group-items">
                                        ${vocRowsHtml}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 2. Sekme: İdareci Normları & Okul Özellikleri -->
                        <div id="staff-admin-tab" class="staff-tab-content" style="display: none;">
                            <div style="display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 0.85rem;">
                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-pansiyon" ${adminOpts.isPansiyonlu ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🛏️ Yatılı veya Pansiyonlu Kurum</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 Müdür Başyardımcısı (Md. 6/1-a) & +1 İlave Müdür Yardımcısı (Md. 14/1-a)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-doner" ${adminOpts.hasDonerSermaye ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>💰 Döner Sermaye İşletmesi Bulunuyor</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 İlave Müdür Yardımcısı (Md. 14/1-b)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-tamgun" ${adminOpts.isTamGunTamYil ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>☀️ Tam Gün Tam Yıl Eğitim / Açık Öğretim</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 İlave Müdür Yardımcısı (Md. 14/1-c)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-stajyer100" ${adminOpts.hasStajyer100Plus ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🏭 3308 Sayılı Kanun Kapsamında 100+ Stajyer</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 İlave Müdür Yardımcısı (Md. 14/1-ç)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-sigortali500" ${adminOpts.hasSigortali500Plus ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🛡️ 3308 Md. 25 Kapsamında 500+ Sigortalı Çırak</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 İlave Müdür Yardımcısı (Md. 14/1-d)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-tasima" ${adminOpts.isTasimaMerkezi ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🚌 Taşıma Merkezi Eğitim Kurumu</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 İlave Müdür Yardımcısı (Md. 14/1-e)</div>
                                    </div>
                                </label>
                            </div>

                            <div id="admin-norm-live-preview" style="background: var(--bg-card); border: 1.5px solid #2563eb; border-radius: 8px; padding: 0.75rem; margin-top: 0.5rem;">
                            </div>
                        </div>

                        ${isVocationalSchool ? `
                            <div id="staff-coordinator-tab" class="staff-tab-content" style="display: none;">
                                <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(147, 51, 234, 0.25); border-radius: 8px; padding: 0.65rem 0.85rem; margin-bottom: 0.75rem;">
                                    <div style="font-size: 0.8rem; font-weight: 800; color: #7e22ce; margin-bottom: 0.2rem;">
                                        📌 12. Sınıf İşletmelerde Mesleki Eğitim Koordinatörlük Yükü (Norm Kadro Yön. Md. 15):
                                    </div>
                                    <div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4;">
                                        MEB Norm Kadro Yönetmeliği uyarınca işletmelere staja giden 12. sınıf öğrencileri için alan öğretmenlerine haftalık koordinatörlük ek ders yükü verilir.
                                    </div>
                                </div>

                                <div style="margin-bottom: 0.75rem;">
                                    <input type="text" id="coordinator-search-input" placeholder="🔍 Alan / Meslek Ara (örn: Bilişim, Makine, Elektrik)..." class="form-control" style="width: 100%; padding: 0.45rem 0.75rem; font-size: 0.85rem; border-radius: 8px;">
                                </div>

                                <div id="coordinator-items-container" style="max-height: 40vh; overflow-y: auto; padding-right: 0.25rem;">
                                    ${coordinatorRowsHtml}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('staff-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-save-staff">Kaydet ve Uygula</button>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        const modalEl = document.getElementById("staff-modal");
        if (modalEl) {
            modalEl.addEventListener("click", (e) => {
                const btn = e.target.closest(".staff-tab-btn");
                if (!btn) return;
                e.preventDefault();
                e.stopPropagation();

                const targetId = btn.getAttribute("data-target");
                if (!targetId) return;

                modalEl.querySelectorAll(".staff-tab-btn").forEach(b => {
                    b.classList.remove("btn-primary", "active");
                    b.classList.add("btn-outline");
                    b.style.background = "";
                    b.style.color = "";
                    b.style.borderColor = "";
                });
                btn.classList.remove("btn-outline");
                btn.classList.add("btn-primary", "active");
                btn.style.background = "#2563eb";
                btn.style.color = "#ffffff";
                btn.style.borderColor = "#2563eb";

                modalEl.querySelectorAll(".staff-tab-content").forEach(c => {
                    c.style.display = "none";
                });
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.style.display = "block";
                }
            });
        }

        // 2. Canlı İdareci Norm Hesaplama Önizleyici
        const updateAdminPreview = () => {
            try {
                const previewEl = document.getElementById("admin-norm-live-preview");
                if (!previewEl) return;

                const opts = {
                    isPansiyonlu: !!document.getElementById("chk-admin-pansiyon")?.checked,
                    hasDonerSermaye: !!document.getElementById("chk-admin-doner")?.checked,
                    isTamGunTamYil: !!document.getElementById("chk-admin-tamgun")?.checked,
                    hasStajyer100Plus: !!document.getElementById("chk-admin-stajyer100")?.checked,
                    hasSigortali500Plus: !!document.getElementById("chk-admin-sigortali500")?.checked,
                    isTasimaMerkezi: !!document.getElementById("chk-admin-tasima")?.checked
                };

                const normEng = this.norm || this.normEngine || (typeof window !== 'undefined' ? window.normEngine : null);
                const res = normEng ? normEng.calculateAdminNorms(schoolType, totalStudents, opts) : { mudur: 1, mudurBasyardimcisi: 0, mudurYardimcisiTotal: 1, toplamYonetici: 2, explanations: [] };

                previewEl.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.35rem;">
                        <span style="font-size: 0.82rem; font-weight: 800; color: #1e3a8a;">📊 MEB Yönetici Norm Kadro Dağılımı</span>
                        <span style="font-size: 0.78rem; font-weight: 800; color: #2563eb; background: rgba(37, 99, 235, 0.1); padding: 0.1rem 0.5rem; border-radius: 4px;">Toplam: ${res.toplamYonetici} Yönetici</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; text-align: center; margin-bottom: 0.5rem;">
                        <div style="background: var(--bg-card-subtle); padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                            <div style="font-size: 0.68rem; color: var(--text-muted);">OKUL MÜDÜRÜ</div>
                            <div style="font-size: 1.15rem; font-weight: 800; color: #0284c7;">${res.mudur}</div>
                        </div>
                        <div style="background: var(--bg-card-subtle); padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                            <div style="font-size: 0.68rem; color: var(--text-muted);">MÜDÜR BAŞYRD.</div>
                            <div style="font-size: 1.15rem; font-weight: 800; color: #7c3aed;">${res.mudurBasyardimcisi}</div>
                        </div>
                        <div style="background: var(--bg-card-subtle); padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                            <div style="font-size: 0.68rem; color: var(--text-muted);">MÜDÜR YARDIMCISI</div>
                            <div style="font-size: 1.15rem; font-weight: 800; color: #059669;">${res.mudurYardimcisiTotal}</div>
                        </div>
                    </div>
                    ${res.explanations && res.explanations.length > 0 ? `
                        <div style="font-size: 0.68rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.15rem;">
                            ${res.explanations.map(e => `<div>• ${e}</div>`).join('')}
                        </div>
                    ` : ''}
                `;
            } catch (err) {
                console.warn("updateAdminPreview error:", err);
            }
        };

        updateAdminPreview();
        [
            "chk-admin-pansiyon",
            "chk-admin-doner",
            "chk-admin-tamgun",
            "chk-admin-stajyer100",
            "chk-admin-sigortali500",
            "chk-admin-tasima"
        ].forEach(id => {
            document.getElementById(id)?.addEventListener("change", updateAdminPreview);
        });

        document.getElementById("staff-branch-search")?.addEventListener("input", (e) => {
            const query = (e.currentTarget.value || "").toLowerCase().trim();
            document.querySelectorAll("#staff-branches-list-container .staff-branch-row").forEach(item => {
                const searchTxt = item.dataset.search || "";
                if (!query || searchTxt.includes(query)) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            });

            document.querySelectorAll("#staff-branches-list-container .branch-group-container").forEach(group => {
                const visibleRows = group.querySelectorAll('.staff-branch-row:not([style*="display: none"])');
                group.style.display = visibleRows.length > 0 ? "block" : "none";
            });
        });

        document.getElementById("coordinator-search-input")?.addEventListener("input", (e) => {
            const query = (e.currentTarget.value || "").toLowerCase().trim();
            document.querySelectorAll("#coordinator-items-container .coordinator-area-item").forEach(item => {
                const searchTxt = item.dataset.search || "";
                if (!query || searchTxt.includes(query)) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            });
        });

        document.getElementById("btn-save-staff")?.addEventListener("click", () => {
            document.querySelectorAll(".teacher-count-input").forEach(input => {
                const branch = input.dataset.branch;
                const val = input.value;
                this.state.setTeacherCount(branch, val);
            });
            document.querySelectorAll(".coordinator-hours-input").forEach(input => {
                const branch = input.dataset.branch;
                const val = input.value;
                this.state.setCoordinatorHours(branch, val);
            });

            const adminOptsToSave = {
                isPansiyonlu: !!document.getElementById("chk-admin-pansiyon")?.checked,
                hasDonerSermaye: !!document.getElementById("chk-admin-doner")?.checked,
                isTamGunTamYil: !!document.getElementById("chk-admin-tamgun")?.checked,
                hasStajyer100Plus: !!document.getElementById("chk-admin-stajyer100")?.checked,
                hasSigortali500Plus: !!document.getElementById("chk-admin-sigortali500")?.checked,
                isTasimaMerkezi: !!document.getElementById("chk-admin-tasima")?.checked
            };
            this.state.setAdminOptions(adminOptsToSave);

            this.closeModal("staff-modal");
            this.showToast("Kadro, idareci normları ve okul özellikleri güncellendi.", "success");
        });
    }

    renderModal(html) {
        const existing = document.querySelector(".modal-overlay, .modal-backdrop");
        if (existing) existing.remove();
        document.body.insertAdjacentHTML("beforeend", html);

        const newModal = document.querySelector(".modal-overlay.active, .modal-backdrop.active");
        if (newModal) {
            newModal.addEventListener("click", (e) => {
                if (e.target === newModal) {
                    newModal.remove();
                }
            });
            const handleEsc = (e) => {
                if (e.key === "Escape") {
                    newModal.remove();
                    document.removeEventListener("keydown", handleEsc);
                }
            };
            document.addEventListener("keydown", handleEsc);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    }

    // --- TTKB MÜFREDAT VE DERS MOTORU ENTEGRASYONU ---
    getMandatoryCoursesForGrade(grade, areaId = null, dalName = null) {
        if (!this.curriculum && typeof MebCurriculumEngine !== 'undefined') {
            this.curriculum = new MebCurriculumEngine(this.db);
        }
        const schoolType = this.state?.state?.okulBilgisi?.okulTuru || "";
        if (this.curriculum) {
            return this.curriculum.getMandatoryCourses(schoolType, grade, areaId, dalName);
        }
        return [];
    }

    getAvailableElectivesForSection(section) {
        const master = this.db.masterData;
        if (!master) return [];

        const grade = String(section.sinifSeviyesi || "11");
        const schoolType = this.state?.state?.okulBilgisi?.okulTuru || "";
        const list = [];
        const seenNames = new Set();

        const AREA_BRANCHES = {
            'adalet': 'Adalet',
            'aile': 'Aile ve Tüketici Hizmetleri',
            'ayakkabi': 'Ayakkabı ve Saraciye Teknolojisi',
            'ayakkabipro': 'Ayakkabı ve Saraciye Teknolojisi',
            'bilisim': 'Bilişim Teknolojileri',
            'biyomedikal': 'Biyomedikal Cihaz Teknolojileri',
            'buro': 'Büro Yönetimi / Yönetici Asist.',
            'cocukgelisimi': 'Çocuk Gelişimi ve Eğitimi',
            'denizcilik': 'Denizcilik',
            'denizcilikpro': 'Denizcilik',
            'dogugastro': 'Yiyecek İçecek Hizmetleri',
            'elektrik': 'Elektrik-Elektronik Teknolojisi',
            'elsanat': 'El Sanatları Teknolojisi',
            'endustriyel': 'Endüstriyel Otomasyon Teknolojileri',
            'gazetecilik': 'Gazetecilik',
            'gazetecilikpro': 'Gazetecilik',
            'geleneksel': 'Geleneksel Türk Sanatları',
            'gemi': 'Gemi Yapımı',
            'gida': 'Gıda Teknolojisi',
            'grafik': 'Grafik ve Fotoğraf',
            'guzellik': 'Güzellik Saç Bakım Hizmetleri',
            'halklailiskiler': 'Halkla İlişkiler ve Organizasyon',
            'harita': 'Harita-Tapu-Kadastro',
            'hasta': 'Hasta ve Yaşlı Hizmetleri',
            'havacilikveuzaypro': 'Uçak Bakım',
            'hayvanyetistiriciligi': 'Hayvan Yetiştiriciliği ve Sağlığı',
            'insaat': 'İnşaat Teknolojisi',
            'itfaiyecilik': 'İtfaiyecilik ve Yangın Güvenliği',
            'kimya': 'Kimya Teknolojisi',
            'konaklama': 'Konaklama ve Seyahat Hizmetleri',
            'konaklamapro': 'Konaklama ve Seyahat Hizmetleri',
            'kuyumculuk': 'Kuyumculuk Teknolojisi',
            'laboratuvar': 'Laboratuvar Hizmetleri',
            'maden': 'Maden Teknolojisi',
            'makine': 'Makine ve Tasarım Teknolojisi',
            'matbaa': 'Matbaa Teknolojisi',
            'metal': 'Metal Teknolojisi',
            'metalurji': 'Metalürji Teknolojisi',
            'mikromekanik': 'Mikromekanik',
            'mobilya': 'Mobilya ve İç Mekân Tasarımı',
            'moda': 'Moda Tasarım Teknolojileri',
            'motorluarac': 'Motorlu Araçlar Teknolojisi',
            'muhasebe': 'Muhasebe ve Finansman',
            'muhasebepro': 'Muhasebe ve Finansman',
            'pazarlama': 'Pazarlama ve Perakende',
            'plastiksanatlar': 'Plastik Sanatlar',
            'plastiktek': 'Plastik Teknolojisi',
            'radyotv': 'Radyo-Televizyon',
            'radyotvpro': 'Radyo-Televizyon',
            'rayli': 'Raylı Sistemler Teknolojisi',
            'saglik': 'Sağlık Bilgisi ve Trafik Kültürü',
            'seramikpro': 'Seramik ve Cam Teknolojisi',
            'siber': 'Bilişim Teknolojileri',
            'tarim': 'Tarım',
            'tekstil': 'Tekstil Teknolojisi',
            'tesisat': 'Tesisat Teknolojisi ve İklimlendirme',
            'ucak': 'Uçak Bakım',
            'ulastirma': 'Ulaştırma Hizmetleri',
            'yenilenebilir': 'Yenilenebilir Enerji Teknolojileri',
            'yiyecek': 'Yiyecek İçecek Hizmetleri',
            'yiyecekpro': 'Yiyecek İçecek Hizmetleri'
        };

        // 1. MTEGM 10.4.2 Seçmeli Meslek Dersleri Havuzu (Meslek Alanı Eşleşmesi)
        const mtegmAlanlar = master.okul_turleri_ve_cizelgeler?.mesleki_ve_teknik_egitim_mtegm?.alanlar || {};
        let areaData = null;
        let areaKey = section.alanId;

        if (areaKey && mtegmAlanlar[areaKey]) {
            areaData = mtegmAlanlar[areaKey];
        } else if (section.alanAdi) {
            const cleanTarget = String(section.alanAdi).toLowerCase().replace(/[^a-z0-9]/g, '');
            for (let k in mtegmAlanlar) {
                const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                const kodClean = String(mtegmAlanlar[k].alan_kodu || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                if (kClean === cleanTarget || cleanTarget.includes(kClean) || kClean.includes(cleanTarget) || (kodClean && cleanTarget.includes(kodClean))) {
                    areaData = mtegmAlanlar[k];
                    areaKey = k;
                    break;
                }
            }
        }

        if (areaData && Array.isArray(areaData.secmeli_meslek_dersleri_10_4_2_havuzu)) {
            const vocBranchName = AREA_BRANCHES[areaKey] || areaData.alan_adi || (areaData.alan_kodu || areaKey || "Meslek").replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            for (let sm of areaData.secmeli_meslek_dersleri_10_4_2_havuzu) {
                const courseName = sm.ders_adi || sm.ders;
                if (!courseName) continue;

                const normName = courseName.toLowerCase().trim();
                if (seenNames.has(normName)) continue;
                seenNames.add(normName);

                const baseH = parseInt(sm.ders_saati || sm.saat || 2, 10);
                let hoursOpts = [2, 3, 4];
                if (baseH === 1) hoursOpts = [1, 2];
                else if (baseH === 4) hoursOpts = [2, 3, 4, 6];
                else if (baseH >= 5) hoursOpts = [2, 3, 4, baseH];

                list.push({
                    ders: courseName,
                    grup: "🟣 Seçmeli Meslek Dersi (" + (sm.sinif_seviyesi || "11-12. Sınıf") + ")",
                    hoursOptions: hoursOpts,
                    selectedHour: baseH || 2,
                    defaultBranch: sm.atananBrans || vocBranchName,
                    isVocational: true,
                    isAtolye: true
                });
            }
        }

        // 2. DÖGM İmam Hatip Seçmeli Havuzu
        if (schoolType.includes("imam_hatip") && master.okul_turleri_ve_cizelgeler?.din_ogretimi_genel_mudurlugu_dogm?.dosyalar) {
            const dogmFiles = master.okul_turleri_ve_cizelgeler.din_ogretimi_genel_mudurlugu_dogm.dosyalar;
            for (let fKey in dogmFiles) {
                for (let s of (dogmFiles[fKey]?.haftalik_ders_cizelgeleri || [])) {
                    for (let g of (s.secmeli_ders_gruplari || [])) {
                        for (let d of (g.dersler || [])) {
                            const rawHours = d.sinif_ders_saatleri?.[grade];
                            if (rawHours && rawHours !== '-') {
                                const normName = d.ders.toLowerCase().trim();
                                if (!seenNames.has(normName)) {
                                    seenNames.add(normName);
                                    const hoursOpts = getOfficialElectiveHoursOptions(d.ders, rawHours, grade);
                                    const defaultH = hoursOpts[0] || 2;
                                    list.push({
                                        ders: d.ders,
                                        grup: g.grup_adi || "İHL Seçmeli Havuzu",
                                        hoursOptions: hoursOpts,
                                        selectedHour: defaultH,
                                        defaultBranch: TTKB_MAP[String(d.ders).toUpperCase()] || "İHL Meslek Dersleri",
                                        isVocational: false
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        // 3. Ortaokul / İmam Hatip Ortaokulu Seçmeli Havuzu (5-8. Sınıflar)
        if (schoolType.includes("ortaokul") || ["5", "6", "7", "8"].includes(grade)) {
            const middleElectives = [
                { ders: "Yabancı Dil (Ağırlıklı / Seçmeli)", hours: [2, 3, 4], branch: "İngilizce", grup: "Yabancı Dil Becerileri" },
                { ders: "Matematik Uygulamaları", hours: [2], branch: "Matematik", grup: "Matematik ve Bilim" },
                { ders: "Bilim Uygulamaları", hours: [2], branch: "Fen Bilimleri", grup: "Matematik ve Bilim" },
                { ders: "Robotik Kodlama ve Yazılım", hours: [2], branch: "Bilişim Teknolojileri", grup: "Bilişim ve Teknoloji" },
                { ders: "Yazarlık ve Yazma Becerileri", hours: [2], branch: "Türkçe", grup: "Dil ve İletişim" },
                { ders: "Masal ve Destanlarımız", hours: [1, 2], branch: "Türkçe", grup: "Kültür ve Sanat" },
                { ders: "Çevre Eğitimi ve İklim Değişikliği", hours: [1, 2], branch: "Fen Bilimleri", grup: "Çevre ve Doğa" },
                { ders: "Düşünme Eğitimi", hours: [1, 2], branch: "Sosyal Bilgiler", grup: "Sosyal Bilimler" },
                { ders: "Halk Oyunları", hours: [2], branch: "Beden Eğitimi", grup: "Spor ve Sanat" },
                { ders: "Spor ve Fiziki Etkinlikler", hours: [2], branch: "Beden Eğitimi", grup: "Spor ve Sanat" },
                { ders: "Görsel Sanatlar (Resim / Heykel)", hours: [2], branch: "Görsel Sanatlar", grup: "Kültür ve Sanat" },
                { ders: "Müzik (Koro / Çalgı)", hours: [2], branch: "Müzik", grup: "Kültür ve Sanat" },
                { ders: "Satranç ve Zekâ Oyunları", hours: [2], branch: "Matematik", grup: "Zekâ ve Strateji" },
                { ders: "Kur'an-ı Kerim (Seçmeli)", hours: [2], branch: "Din Kültürü ve Ahlak Bilgisi", grup: "Din, Ahlak ve Değerler" },
                { ders: "Peygamberimizin Hayatı (Seçmeli)", hours: [2], branch: "Din Kültürü ve Ahlak Bilgisi", grup: "Din, Ahlak ve Değerler" },
                { ders: "Temel Dini Bilgiler (Seçmeli)", hours: [1, 2], branch: "Din Kültürü ve Ahlak Bilgisi", grup: "Din, Ahlak ve Değerler" }
            ];

            for (let me of middleElectives) {
                const normName = me.ders.toLowerCase().trim();
                if (!seenNames.has(normName)) {
                    seenNames.add(normName);
                    list.push({
                        ders: me.ders,
                        grup: `Temel Eğitim Seçmeli • ${me.grup}`,
                        hoursOptions: me.hours,
                        selectedHour: me.hours[0],
                        defaultBranch: me.branch,
                        isVocational: false
                    });
                }
            }
        }

        // 4. OGM & Genel Kültür Seçmeli Havuzu (9-12. Sınıflar)
        if (master.okul_turleri_ve_cizelgeler?.ortaogretim_genel_mudurlugu_ogm?.dosyalar) {
            const files = master.okul_turleri_ve_cizelgeler.ortaogretim_genel_mudurlugu_ogm.dosyalar;
            for (let fKey in files) {
                for (let s of (files[fKey]?.haftalik_ders_cizelgeleri || [])) {
                    for (let g of (s.secmeli_ders_gruplari || [])) {
                        for (let d of (g.dersler || [])) {
                            const rawHours = d.sinif_ders_saatleri?.[grade];
                            if (rawHours && rawHours !== '-') {
                                const normName = d.ders.toLowerCase().trim();
                                if (!seenNames.has(normName)) {
                                    seenNames.add(normName);
                                    const hoursOpts = getOfficialElectiveHoursOptions(d.ders, rawHours, grade);
                                    const defaultH = hoursOpts[0] || 2;
                                    list.push({
                                        ders: d.ders,
                                        grup: g.grup_adi || "Genel Kültür Seçmeli",
                                        hoursOptions: hoursOpts,
                                        selectedHour: defaultH,
                                        defaultBranch: TTKB_MAP[String(d.ders).toUpperCase()] || d.ders,
                                        isVocational: false
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        return list;
    }

    // =========================================================================
    // 📊 MEB RAPORLAMA VE ANALİZ MERKEZİ MODAL VE GÖRSELLEŞTİRME MOTORU
    // =========================================================================
    openReportsModal(initialTab = "GRID") {
        let currentTab = initialTab;
        let filterGrade = "ALL";
        let filterBranch = "ALL";
        let isMonochrome = false;
        let isVerticalHeaders = false;

        const modalHtml = `
            <div class="modal-overlay active" id="reports-center-modal">
                <div class="modal-box reports-modal-box">
                    <!-- Üst Başlık ve Eylem Butonları -->
                    <div class="modal-header reports-modal-header">
                        <div class="reports-header-left">
                            <div class="reports-header-title">
                                <span>🖨️</span> MEB Norm Kadro ve Ders Yükü Raporlama Merkezi
                            </div>
                            <div class="reports-header-meta">
                                <span class="reports-badge school-name-badge">${this.state.state.okulBilgisi.okulAdi || 'Okul'}</span>
                                <span class="reports-badge season-badge">${this.state.state.okulBilgisi.sezon || '2024-2025'}</span>
                                <span class="reports-badge date-badge" id="report-live-date"></span>
                            </div>
                        </div>
                        <div class="reports-header-actions no-print">
                            <!-- Resmî Antet & İmzalar Butonu -->
                            <button class="btn-report-action btn-report-antet" id="btn-report-edit-antet" title="Resmî Valilik / Kaymakamlık Anteti, Okul Logosu ve İmzacıları Düzenle">
                                <span class="action-icon">🏛️</span> <span>Resmî Antet & İmzalar</span>
                            </button>

                            <!-- Görünüm Seçenekleri Grubu -->
                            <div class="report-actions-pill-group">
                                <button class="btn-report-action" id="btn-report-toggle-mono" title="Renkli / Resmi Siyah-Beyaz Modu">
                                    <span class="action-icon">🎨</span> <span id="lbl-mono-mode">Siyah-Beyaz Mod</span>
                                </button>
                                <button class="btn-report-action" id="btn-report-toggle-fullscreen" title="Tam Ekran / Normal Boyut">
                                    <span class="action-icon">⛶</span> <span id="lbl-fullscreen-mode">Tam Ekran</span>
                                </button>
                            </div>

                            <!-- Dışa Aktar & Yazdır Grubu -->
                            <div class="report-actions-pill-group">
                                <button class="btn-report-action btn-report-excel" id="btn-report-export-xlsx" title="Çok Sekmeli Renkli Excel (.XLSX) Olarak İndir">
                                    <span class="action-icon">📊</span> <span>Excel (.XLSX)</span>
                                </button>
                                <button class="btn-report-action" id="btn-report-export-csv" title="CSV Formatında İndir">
                                    <span class="action-icon">📄</span> <span>CSV</span>
                                </button>
                                <button class="btn-report-action btn-report-print" id="btn-report-print" title="A4 / A3 Resmî Yazdır veya PDF Kaydet">
                                    <span class="action-icon">🖨️</span> <span>Yazdır / PDF</span>
                                </button>
                            </div>

                            <button class="modal-close-btn" id="btn-close-reports-modal" title="Pencereyi Kapat">✕</button>
                        </div>
                    </div>

                    <!-- Kategori Sekmeleri (Tabs) -->
                    <div class="reports-nav-tabs no-print">
                        <button class="report-tab-btn ${currentTab === 'GRID' ? 'active' : ''}" data-tab="GRID">
                            <span class="tab-icon">🏫</span> Master Yük Matrisi (Grid)
                        </button>
                        <button class="report-tab-btn ${currentTab === 'EXECUTIVE' ? 'active' : ''}" data-tab="EXECUTIVE">
                            <span class="tab-icon">🏛️</span> Yönetici İcmali
                        </button>
                        <button class="report-tab-btn ${currentTab === 'BRANCH' ? 'active' : ''}" data-tab="BRANCH">
                            <span class="tab-icon">⚖️</span> Branş Detay Cetveli
                        </button>
                        <button class="report-tab-btn ${currentTab === 'SCHEDULE' ? 'active' : ''}" data-tab="SCHEDULE">
                            <span class="tab-icon">📋</span> Şube Ders Çizelgeleri
                        </button>
                        <button class="report-tab-btn ${currentTab === 'ACTION' ? 'active' : ''}" data-tab="ACTION">
                            <span class="tab-icon">🚨</span> Norm İhtiyaç/Fazla Eylem
                        </button>
                        <button class="report-tab-btn ${currentTab === 'LAB' ? 'active' : ''}" data-tab="LAB">
                            <span class="tab-icon">🧩</span> Atölye & Grup Bölünmeleri
                        </button>
                        <button class="report-tab-btn ${currentTab === 'THEME' ? 'active' : ''}" data-tab="THEME">
                            <span class="tab-icon">🎯</span> 3-Tema Seçmeli Dengesi
                        </button>
                    </div>

                    <!-- Dinamik Filtreleme ve Arama Barı -->
                    <div class="reports-filter-bar no-print" id="reports-filter-container">
                        <!-- Dinamik olarak doldurulur -->
                    </div>

                    <!-- Ana Rapor İçerik Alanı (Yazdırılabilir) -->
                    <div class="modal-body reports-modal-body" id="reports-render-container">
                        <!-- Seçilen Raporun Canlı HTML Görünümü -->
                    </div>

                    <!-- Yazdırma Alt Bilgi / Onay Bloğu (Sadece Yazdırmada Görünür) -->
                    <div class="demo-print-watermark">LİSANSSIZ DEMO SÜRÜMÜ — RESMÎ MEB TESLİMATINDA GEÇERSİZDİR</div>
                    <div class="reports-print-footer only-print" id="reports-print-signature-box">
                        <!-- JS tarafından dinamik antet bilgilerine göre doldurulur -->
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        const updateDate = () => {
            const dateEl = document.getElementById("report-live-date");
            if (dateEl) dateEl.innerText = new Date().toLocaleString("tr-TR");
        };
        updateDate();

        const renderActiveTab = () => {
            const container = document.getElementById("reports-render-container");
            const filterContainer = document.getElementById("reports-filter-container");
            const signFooterEl = document.getElementById("reports-print-signature-box");
            if (!container) return;

            // Filtre Barını Güncelle
            this.renderReportsFilterBar(currentTab, filterGrade, filterBranch, filterContainer, (newG, newB) => {
                filterGrade = newG;
                filterBranch = newB;
                renderActiveTab();
            });

            // Rapor İçeriğini Render Et
            const stateData = this.state.state;
            const antet = stateData.okulBilgisi.antet || {};

            // Yazdırma İmza Bloğunu Güncelle
            if (signFooterEl) {
                signFooterEl.innerHTML = `
                    <div class="print-sign-box">
                        <p class="sign-title">${antet.hazirlayanUnvan || 'Müdür Yardımcısı'}</p>
                        <p class="sign-name">${antet.hazirlayanAdSoyad || '........................'}</p>
                        <p class="sign-dots">İmza: ........................</p>
                    </div>
                    <div class="print-sign-box">
                        <p class="sign-title">${antet.kontrolUnvan || 'Müdür Başyardımcısı'}</p>
                        <p class="sign-name">${antet.kontrolAdSoyad || '........................'}</p>
                        <p class="sign-dots">İmza: ........................</p>
                    </div>
                    <div class="print-sign-box">
                        <p class="sign-title">${antet.onaylayanUnvan || 'Okul Müdürü'}</p>
                        <p class="sign-name">${antet.onaylayanAdSoyad || '........................'}</p>
                        <p class="sign-dots">Mühür / İmza: ........................</p>
                    </div>
                `;
            }

            let reportHtml = "";

            if (currentTab === "GRID") {
                const data = this.reports.generateMasterLoadGrid(stateData, filterGrade);
                reportHtml = this.renderMasterGridReport(data, isMonochrome, isVerticalHeaders);
            } else if (currentTab === "EXECUTIVE") {
                const data = this.reports.generateExecutiveSummary(stateData);
                reportHtml = this.renderExecutiveReport(data, isMonochrome);
            } else if (currentTab === "BRANCH") {
                const data = this.reports.generateBranchDetailReport(stateData, filterBranch);
                reportHtml = this.renderBranchDetailReport(data, isMonochrome);
            } else if (currentTab === "SCHEDULE") {
                const data = this.reports.generateSectionScheduleReport(stateData, filterGrade, "ALL");
                reportHtml = this.renderScheduleReport(data, isMonochrome);
            } else if (currentTab === "ACTION") {
                const data = this.reports.generateNormActionReport(stateData);
                reportHtml = this.renderNormActionReport(data, isMonochrome);
            } else if (currentTab === "LAB") {
                const data = this.reports.generateVocationalLabReport(stateData);
                reportHtml = this.renderVocationalLabReport(data, isMonochrome);
            } else if (currentTab === "THEME") {
                const data = this.reports.generateElectiveThemeReport(stateData);
                reportHtml = this.renderElectiveThemeReport(data, isMonochrome);
            }

            container.innerHTML = reportHtml;
            container.scrollTop = 0;
        };

        // Sekme Değiştirme Dinleyicileri
        document.querySelectorAll(".report-tab-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const t = btn.getAttribute("data-tab");
                if (t && t !== currentTab) {
                    currentTab = t;
                    document.querySelectorAll(".report-tab-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    renderActiveTab();
                }
            });
        });

        // Resmî Antet & İmzaları Düzenle Modalı
        document.getElementById("btn-report-edit-antet")?.addEventListener("click", () => {
            const lic = (typeof window !== 'undefined' && window.licenseManager) ? window.licenseManager.licenseStatus : null;
            if (lic && !lic.isMaster && !lic.isAnnual) {
                alert("🔒 LİSANS GEREKLİ: Resmî Valilik / İlçe MEM Başlığı ve Onay İmzacılarını düzenlemek lisanslı sürüme özeldir.");
                this.openLicenseModal();
                return;
            }
            this.openOfficialAntetModal();
        });

        // Tam Ekran / Normal Boyut Geçişi
        let isFullscreen = false;
        document.getElementById("btn-report-toggle-fullscreen")?.addEventListener("click", () => {
            isFullscreen = !isFullscreen;
            const box = document.querySelector(".reports-modal-box");
            const lbl = document.getElementById("lbl-fullscreen-mode");
            if (box) {
                if (isFullscreen) {
                    box.classList.add("fullscreen-report-mode");
                    if (lbl) lbl.innerText = "Normal Boyut";
                } else {
                    box.classList.remove("fullscreen-report-mode");
                    if (lbl) lbl.innerText = "Tam Ekran";
                }
            }
        });

        // Siyah Beyaz / Renkli Mod Geçişi
        document.getElementById("btn-report-toggle-mono")?.addEventListener("click", () => {
            isMonochrome = !isMonochrome;
            const lbl = document.getElementById("lbl-mono-mode");
            if (lbl) lbl.innerText = isMonochrome ? "Renkli Mod" : "Siyah-Beyaz Modu";
            const box = document.querySelector(".reports-modal-box");
            if (box) {
                if (isMonochrome) box.classList.add("monochrome-mode");
                else box.classList.remove("monochrome-mode");
            }
            renderActiveTab();
        });

        // Excel (.XLSX) İndirme (Çok Sekmeli & Renkli) - LİSANS KONTROLÜ
        document.getElementById("btn-report-export-xlsx")?.addEventListener("click", () => {
            const lic = (typeof window !== 'undefined' && window.licenseManager) ? window.licenseManager.licenseStatus : null;
            if (lic && !lic.isMaster && !lic.isAnnual) {
                alert("🔒 LİSANS GEREKLİ: Resmî 5 Sekmeli Excel (.XLSX) Norm Kadro Cetveli indirmek lisanslı sürüme özeldir. Lütfen okulunuz için lisans anahtarı temin ediniz.");
                this.openLicenseModal();
                return;
            }
            const stateData = this.state.state;
            const ok = this.reports.exportToXLSX(stateData);
            if (ok) {
                this.showToast("📊 5 Sekmeli Kurumsal Excel (.XLSX) Raporu Başarıyla İndirildi!", "success");
            } else {
                this.showToast("XLSX motoru yüklenirken bir sorun oluştu, CSV olarak deneniyor...", "warning");
                document.getElementById("btn-report-export-csv")?.click();
            }
        });

        // CSV İndirme - LİSANS KONTROLÜ
        document.getElementById("btn-report-export-csv")?.addEventListener("click", () => {
            const lic = (typeof window !== 'undefined' && window.licenseManager) ? window.licenseManager.licenseStatus : null;
            if (lic && !lic.isMaster && !lic.isAnnual) {
                alert("🔒 LİSANS GEREKLİ: Resmî Norm Kadro verilerini dışa aktarmak lisanslı sürüme özeldir. Lütfen lisans anahtarınızı aktifleştiriniz.");
                this.openLicenseModal();
                return;
            }
            const stateData = this.state.state;
            let reportData = null;
            if (currentTab === "GRID") reportData = this.reports.generateMasterLoadGrid(stateData, filterGrade);
            else if (currentTab === "EXECUTIVE") reportData = this.reports.generateExecutiveSummary(stateData);
            else if (currentTab === "BRANCH") reportData = this.reports.generateBranchDetailReport(stateData, filterBranch);
            else if (currentTab === "ACTION") reportData = this.reports.generateNormActionReport(stateData);
            else reportData = this.reports.generateMasterLoadGrid(stateData, "ALL");

            const csvContent = this.reports.exportToCSV(reportData);
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const safeName = (stateData.okulBilgisi.okulAdi || "MEB_Norm").replace(/[^a-zA-Z0-9_\-ğüşıöçĞÜŞİÖÇ]/g, "_");
            a.download = `${safeName}_${currentTab}_Raporu_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showToast("CSV raporu başarıyla indirildi!", "success");
        });

        // Yazdırma (Print)
        document.getElementById("btn-report-print")?.addEventListener("click", () => {
            window.print();
        });

        // Kapatma
        document.getElementById("btn-close-reports-modal")?.addEventListener("click", () => {
            this.closeModal("reports-center-modal");
        });

        // İlk render
        renderActiveTab();
    }

    // --- RESMÎ ANTET, OKUL LOGOSU VE İMZA BLOĞU MODALI ---
    openOfficialAntetModal() {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {
            ilValiligi: "ANKARA VALİLİĞİ",
            ilceMem: "Çankaya İlçe Millî Eğitim Müdürlüğü",
            resmiOkulAdi: stateData.okulBilgisi.okulAdi || "Atatürk Mesleki ve Teknik Anadolu Lisesi",
            logoBase64: null,
            hazirlayanUnvan: "Müdür Yardımcısı",
            hazirlayanAdSoyad: "",
            kontrolUnvan: "Müdür Başyardımcısı",
            kontrolAdSoyad: "",
            onaylayanUnvan: "Okul Müdürü",
            onaylayanAdSoyad: ""
        };

        const modalHtml = `
            <div class="modal-overlay active" id="antet-settings-modal" style="z-index: 1100;">
                <div class="modal-box" style="max-width: 660px; width: 95%;">
                    <div class="modal-header">
                        <div class="modal-title">🏛️ Resmî Antet, Okul Logosu ve İmza Bloğu Ayarları</div>
                        <button class="modal-close-btn" onclick="document.getElementById('antet-settings-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body" style="padding: 1.25rem;">
                        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">
                            Raporların ve PDF çıktılarının üst kısmında yer alacak resmî idari antet ve altındaki imza/onay bloklarını düzenleyiniz:
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                            <!-- Okul Logosu & Antet -->
                            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-main); border-radius: 8px; padding: 0.85rem;">
                                <div style="font-weight: 800; font-size: 0.82rem; color: var(--primary); margin-bottom: 0.65rem; text-transform: uppercase;">
                                    1. Üst Resmî Başlık (Antet) ve Logo
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.65rem;">
                                    <div>
                                        <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">İl / Valilik Başlığı:</label>
                                        <input type="text" id="inp-antet-valilik" class="form-control" value="${antet.ilValiligi || 'ANKARA VALİLİĞİ'}" placeholder="Örn: ANKARA VALİLİĞİ">
                                    </div>
                                    <div>
                                        <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">İlçe Millî Eğitim Müdürlüğü:</label>
                                        <input type="text" id="inp-antet-ilce" class="form-control" value="${antet.ilceMem || 'Çankaya İlçe Millî Eğitim Müdürlüğü'}" placeholder="Örn: Çankaya İlçe Millî Eğitim Müdürlüğü">
                                    </div>
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Resmî Okul / Kurum Adı:</label>
                                    <input type="text" id="inp-antet-okul" class="form-control" value="${antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || ''}" placeholder="Örn: Atatürk Mesleki ve Teknik Anadolu Lisesi">
                                </div>
                                <div style="margin-top: 0.65rem; display: flex; align-items: center; justify-content: space-between;">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <div id="antet-logo-preview" style="width: 44px; height: 44px; border: 1.5px dashed var(--border-main); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff;">
                                            ${antet.logoBase64 ? `<img src="${antet.logoBase64}" style="max-width:100%; max-height:100%; object-fit:contain;">` : '<span style="font-size:1.25rem;">🇹🇷</span>'}
                                        </div>
                                        <div>
                                            <div style="font-size: 0.78rem; font-weight: 700;">Okul Logosu Yükle (İsteğe Bağlı)</div>
                                            <div style="font-size: 0.7rem; color: var(--text-muted);">PNG, JPG veya SVG formatında</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 0.4rem;">
                                        <button class="btn btn-sm btn-outline" id="btn-upload-logo">🖼️ Logo Seç</button>
                                        ${antet.logoBase64 ? `<button class="btn btn-sm btn-danger-outline" id="btn-remove-logo">Kaldır</button>` : ''}
                                        <input type="file" id="file-antet-logo" accept="image/*" style="display:none;">
                                    </div>
                                </div>
                            </div>

                            <!-- Resmî İmza Blokları -->
                            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-main); border-radius: 8px; padding: 0.85rem;">
                                <div style="font-weight: 800; font-size: 0.82rem; color: var(--primary); margin-bottom: 0.65rem; text-transform: uppercase;">
                                    2. Resmî İmza ve Onay Blokları
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem;">
                                    <!-- 1. Düzenleyen -->
                                    <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.55rem;">
                                        <div style="font-size: 0.72rem; font-weight: 800; color: #0284c7; margin-bottom: 0.35rem;">1. DÜZENLEYEN</div>
                                        <input type="text" id="inp-hazirlayan-unvan" class="form-control form-control-sm" value="${antet.hazirlayanUnvan || 'Müdür Yardımcısı'}" placeholder="Unvan" style="margin-bottom: 0.3rem;">
                                        <input type="text" id="inp-hazirlayan-ad" class="form-control form-control-sm" value="${antet.hazirlayanAdSoyad || ''}" placeholder="Adı Soyadı">
                                    </div>

                                    <!-- 2. Kontrol Eden -->
                                    <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.55rem;">
                                        <div style="font-size: 0.72rem; font-weight: 800; color: #7c3aed; margin-bottom: 0.35rem;">2. KONTROL EDEN</div>
                                        <input type="text" id="inp-kontrol-unvan" class="form-control form-control-sm" value="${antet.kontrolUnvan || 'Müdür Başyardımcısı'}" placeholder="Unvan" style="margin-bottom: 0.3rem;">
                                        <input type="text" id="inp-kontrol-ad" class="form-control form-control-sm" value="${antet.kontrolAdSoyad || ''}" placeholder="Adı Soyadı">
                                    </div>

                                    <!-- 3. Onaylayan -->
                                    <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.55rem;">
                                        <div style="font-size: 0.72rem; font-weight: 800; color: #059669; margin-bottom: 0.35rem;">3. UYGUNDUR / ONAY</div>
                                        <input type="text" id="inp-onay-unvan" class="form-control form-control-sm" value="${antet.onaylayanUnvan || 'Okul Müdürü'}" placeholder="Unvan" style="margin-bottom: 0.3rem;">
                                        <input type="text" id="inp-onay-ad" class="form-control form-control-sm" value="${antet.onaylayanAdSoyad || ''}" placeholder="Adı Soyadı">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('antet-settings-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-save-antet-settings">💾 Antet ve İmzaları Kaydet</button>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        let uploadedLogoBase64 = antet.logoBase64;
        const fileInput = document.getElementById("file-antet-logo");
        document.getElementById("btn-upload-logo")?.addEventListener("click", () => fileInput.click());
        fileInput?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedLogoBase64 = event.target.result;
                const prevBox = document.getElementById("antet-logo-preview");
                if (prevBox) prevBox.innerHTML = `<img src="${uploadedLogoBase64}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
            };
            reader.readAsDataURL(file);
        });

        document.getElementById("btn-remove-logo")?.addEventListener("click", () => {
            uploadedLogoBase64 = null;
            const prevBox = document.getElementById("antet-logo-preview");
            if (prevBox) prevBox.innerHTML = `<span style="font-size:1.25rem;">🇹🇷</span>`;
        });

        document.getElementById("btn-save-antet-settings")?.addEventListener("click", () => {
            const updatedAntet = {
                ilValiligi: document.getElementById("inp-antet-valilik")?.value || "ANKARA VALİLİĞİ",
                ilceMem: document.getElementById("inp-antet-ilce")?.value || "İlçe Millî Eğitim Müdürlüğü",
                resmiOkulAdi: document.getElementById("inp-antet-okul")?.value || stateData.okulBilgisi.okulAdi,
                logoBase64: uploadedLogoBase64,
                hazirlayanUnvan: document.getElementById("inp-hazirlayan-unvan")?.value || "Müdür Yardımcısı",
                hazirlayanAdSoyad: document.getElementById("inp-hazirlayan-ad")?.value || "",
                kontrolUnvan: document.getElementById("inp-kontrol-unvan")?.value || "Müdür Başyardımcısı",
                kontrolAdSoyad: document.getElementById("inp-kontrol-ad")?.value || "",
                onaylayanUnvan: document.getElementById("inp-onay-unvan")?.value || "Okul Müdürü",
                onaylayanAdSoyad: document.getElementById("inp-onay-ad")?.value || ""
            };

            this.state.setOfficialAntet(updatedAntet);
            this.closeModal("antet-settings-modal");
            this.showToast("Resmî antet ve imza blokları güncellendi!", "success");
            // Rapor görünümünü tazele
            const rModal = document.getElementById("reports-center-modal");
            if (rModal) {
                const activeTabBtn = rModal.querySelector(".report-tab-btn.active");
                if (activeTabBtn) activeTabBtn.click();
            }
        });
    }

    renderReportsFilterBar(currentTab, filterGrade, filterBranch, containerEl, onFilterChange) {
        if (!containerEl) return;
        const subeler = this.state.state.subeler || [];
        const uniqueGrades = [...new Set(subeler.map(s => String(s.sinifSeviyesi)))].sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0));
        
        const branchList = this.db.getAllBranchesList() || [];
        const uniqueBranches = branchList.map(b => b.brans_adi || b.brans || b).filter(Boolean).sort((a, b) => a.localeCompare(b, 'tr'));

        let html = `<div class="filter-group-inner">`;

        if (["GRID", "SCHEDULE"].includes(currentTab)) {
            html += `
                <div class="filter-item">
                    <label class="filter-lbl">Sınıf Kademesi Filtresi:</label>
                    <select id="sel-filter-grade" class="form-control form-control-sm">
                        <option value="ALL" ${filterGrade === 'ALL' ? 'selected' : ''}>Tüm Sınıflar (Tüm Okul)</option>
                        ${uniqueGrades.map(g => `<option value="${g}" ${filterGrade === g ? 'selected' : ''}>${String(g).toLowerCase() === 'hazirlik' ? 'Hazırlık Sınıfları' : g + '. Sınıflar'}</option>`).join("")}
                    </select>
                </div>
            `;
        }

        if (currentTab === "BRANCH") {
            html += `
                <div class="filter-item">
                    <label class="filter-lbl">Branş Seçimi:</label>
                    <select id="sel-filter-branch" class="form-control form-control-sm">
                        <option value="ALL" ${filterBranch === 'ALL' ? 'selected' : ''}>Tüm Branşlar (Toplu Liste)</option>
                        ${uniqueBranches.map(b => `<option value="${b}" ${filterBranch === b ? 'selected' : ''}>${b}</option>`).join("")}
                    </select>
                </div>
            `;
        }

        html += `
            <div class="filter-summary-pill">
                <span>📌 Toplam <strong>${subeler.length}</strong> Şube Aktif</span>
            </div>
        </div>`;

        containerEl.innerHTML = html;

        document.getElementById("sel-filter-grade")?.addEventListener("change", (e) => {
            onFilterChange(e.target.value, filterBranch);
        });

        document.getElementById("sel-filter-branch")?.addEventListener("change", (e) => {
            onFilterChange(filterGrade, e.target.value);
        });
    }

    // 1. MASTER YÜK MATRİSİ RENDER (KURUMSAL VE MÜKEMMEL A4/A3 MİZANPAJLI)
    renderMasterGridReport(data, isMono, isVertical = true) {
        if (!data || data.subeler.length === 0) {
            return `<div class="empty-report-state">⚠️ Henüz şube veya ders verisi eklenmemiş. Lütfen sol panelden şube ekleyiniz.</div>`;
        }

        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        // Sınıf Kademelerine Göre Şubeleri Grupla (Hierarchical Class Groups)
        const gradeMap = {};
        data.subeler.forEach(s => {
            const g = String(s.sinifSeviyesi || '9');
            if (!gradeMap[g]) gradeMap[g] = [];
            gradeMap[g].push(s);
        });

        const sortedGrades = Object.keys(gradeMap).sort((a, b) => {
            const ga = a === 'hazirlik' ? 0 : (parseInt(a, 10) || 99);
            const gb = b === 'hazirlik' ? 0 : (parseInt(b, 10) || 99);
            return ga - gb;
        });

        // 📐 KOMPAKT DİKEY BAŞLIK MOTORU (Compact & Smart Header Layout Engine)
        // Uzun alan isimlerini dikey başlıkta şıkça kısaltır, ekranı boğmadan ders listesine maksimum alan bırakır (120px - 145px)
        const formatCompactSecName = (name) => {
            if (!name) return "";
            return String(name)
                .replace(/Elektrik-Elektronik Teknolojisi/gi, "Elektrik")
                .replace(/Elektrik-Elektronik/gi, "Elektrik")
                .replace(/Bilişim Teknolojileri/gi, "Bilişim")
                .replace(/Harita-Tapu-Kadastro/gi, "Harita")
                .replace(/Makine ve Tasarım Teknolojisi/gi, "Makine")
                .replace(/Makine ve Tasarım/gi, "Makine")
                .replace(/Motorlu Araçlar Teknolojisi/gi, "Motor")
                .replace(/Motorlu Araçlar/gi, "Motor")
                .replace(/Yenilenebilir Enerji Teknolojileri/gi, "Yenilenebilir")
                .replace(/Yenilenebilir Enerji/gi, "Yenilenebilir")
                .replace(/Tesisat Teknolojisi ve İklimlendirme/gi, "Tesisat")
                .replace(/Mobilya ve İç Mekan Tasarımı/gi, "Mobilya")
                .replace(/Metal Teknolojisi/gi, "Metal")
                .replace(/Sağlık Hizmetleri/gi, "Sağlık")
                .replace(/Muhasebe ve Finansman/gi, "Muhasebe")
                .replace(/Konaklama ve Seyahat Hizmetleri/gi, "Konaklama")
                .replace(/Yiyecek İçecek Hizmetleri/gi, "Yiyecek")
                .replace(/Güzellik ve Saç Bakım Hizmetleri/gi, "Güzellik")
                .replace(/Çocuk Gelişimi ve Eğitimi/gi, "Çocuk Gel.")
                .replace(/Hasta ve Yaşlı Hizmetleri/gi, "Hasta/Yaşlı")
                .replace(/Biyomedikal Cihaz Teknolojileri/gi, "Biyomedikal")
                .replace(/Endüstriyel Otomasyon Teknolojileri/gi, "Otomasyon")
                .replace(/Gıda Teknolojisi/gi, "Gıda")
                .replace(/Hayvan Yetiştiriciliği ve Sağlığı/gi, "Hayvan Sağ.")
                .replace(/Tarım/gi, "Tarım")
                .replace(/Laboratuvar Hizmetleri/gi, "Laboratuvar")
                .replace(/Kimya Teknolojisi/gi, "Kimya")
                .replace(/İnşaat Teknolojisi/gi, "İnşaat")
                .replace(/Havacılık ve Uzay Teknolojisi/gi, "Havacılık")
                .replace(/Denizcilik/gi, "Denizcilik")
                .replace(/Grafik ve Fotoğraf/gi, "Grafik")
                .replace(/Radyo-Televizyon/gi, "Radyo-TV")
                .replace(/Halkla İlişkiler/gi, "Halkla İliş.")
                .replace(/Pazarlama ve Perakende/gi, "Pazarlama")
                .replace(/Uçak Bakım/gi, "Uçak Bakım")
                .replace(/Raylı Sistemler Teknolojisi/gi, "Raylı Sis.")
                .replace(/Gemi Yapımı/gi, "Gemi Yapımı")
                .replace(/Plastik Teknolojisi/gi, "Plastik")
                .replace(/Seramik ve Cam Teknolojisi/gi, "Seramik")
                .replace(/Tekstil Teknolojisi/gi, "Tekstil")
                .replace(/Moda Tasarım Teknolojileri/gi, "Moda Tas.")
                .replace(/Ayakkabı ve Saraciye Teknolojisi/gi, "Ayakkabı")
                .replace(/Kuyumculuk Teknolojisi/gi, "Kuyumculuk")
                .replace(/Matbaa Teknolojisi/gi, "Matbaa")
                .replace(/Gazetecilik/gi, "Gazetecilik")
                .replace(/Büro Yönetimi ve Yönetici Asistanlığı/gi, "Büro Yön.")
                .replace(/Adalet/gi, "Adalet")
                .replace(/Güvenlik Hizmetleri/gi, "Güvenlik")
                .replace(/İtfaiyecilik ve Yangın Güvenliği/gi, "İtfaiye")
                .replace(/Maden Teknolojisi/gi, "Maden")
                .replace(/Mikromekanik/gi, "Mikromekanik")
                .replace(/Siber Güvenlik/gi, "Siber Güv.");
        };

        let maxCharLen = 10;
        data.subeler.forEach(s => {
            const compactName = formatCompactSecName(s.subeAdi);
            const label = `${compactName} ${s.ogrenciSayisi || 30} Ögr`;
            if (label.length > maxCharLen) maxCharLen = label.length;
        });

        // Maksimum 135px kompakt başlık yüksekliği (Ders listesini tam göstermek için)
        const dynamicHeaderHeight = Math.max(120, Math.min(145, Math.round(maxCharLen * 6.5 + 28)));

        let html = `
            <!-- Resmî Yazdırma Başlığı (Sadece Baskı / PDF'te Görünür) -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">HAFTALIK BRANŞ-ŞUBE DERS DAĞITIM VE YÜK MATRİSİ</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                        <div><strong>Toplam Şube:</strong> ${data.subeler.length}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <!-- Ekranda Görünen Rapor Başlığı (no-print) -->
            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • Toplam ${data.subeler.length} Şube • Toplam ${data.grandTotalHours} Saat Ders Yükü</div>
            </div>

            <div class="master-grid-wrapper vertical-header-mode">
                <table class="master-grid-table">
                    <colgroup>
                        <col style="width: 220px; min-width: 220px; max-width: 220px;">
                        ${data.subeler.map(() => `<col style="width: 26px; min-width: 26px; max-width: 26px;">`).join("")}
                        <col style="width: 48px; min-width: 48px; max-width: 48px;">
                        <col style="width: 42px; min-width: 42px; max-width: 42px;">
                    </colgroup>
                    <thead>
                        <!-- 1. KATMAN: KADEME GRUPLANDIRMA ÜST BAŞLIĞI -->
                        <tr class="grade-group-header-row">
                            <th rowspan="2" class="sticky-col-header branch-course-head">
                                <div class="branch-course-head-inner">BRANŞ VE DERS DAĞILIMI</div>
                            </th>
                            ${sortedGrades.map(g => `
                                <th colspan="${gradeMap[g].length}" class="grade-super-header grade-${g}">
                                    ${g === 'hazirlik' ? 'HAZIRLIK SINIFLARI' : g + '. SINIFLAR'} (${gradeMap[g].length} Şube)
                                </th>
                            `).join("")}
                            <th rowspan="2" class="total-col-header">
                                <div class="stat-col-head-inner">TOPLAM SAAT</div>
                            </th>
                            <th rowspan="2" class="norm-col-header">
                                <div class="stat-col-head-inner">NORM</div>
                            </th>
                        </tr>
                        <!-- 2. KATMAN: DİNAMİK DİKEY ŞUBE BAŞLIKLARI -->
                        <tr class="section-sub-header-row" style="height: ${dynamicHeaderHeight}px;">
                            ${data.subeler.map(s => {
                                const compactName = formatCompactSecName(s.subeAdi);
                                return `
                                <th class="sec-col-header vertical-sec-header" style="height: ${dynamicHeaderHeight}px;" title="${s.subeAdi} (${s.ogrenciSayisi || 30} Öğrenci)">
                                    <div class="vertical-sec-box" style="height: ${dynamicHeaderHeight - 12}px; max-height: ${dynamicHeaderHeight - 12}px;">
                                        <span class="sec-header-title">${compactName}</span>
                                        <span class="sec-header-meta">${s.ogrenciSayisi || 30} Ögr</span>
                                    </div>
                                </th>
                            `}).join("")}
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.sortedBranchNames.forEach((bName, bIdx) => {
            const bGroup = data.branchGroups[bName];
            const bReport = data.branchReportMap[bName] || { calculatedNorm: 0, currentTeachers: 0, statusType: 'tam' };

            const isVoc = bGroup.isVocational;
            const stripClass = isVoc ? 'area-summary-strip' : 'branch-summary-strip';
            const icon = isVoc ? '🟣' : '🔷';

            const displayHours = (bReport && bReport.totalHours !== undefined) ? bReport.totalHours : bGroup.totalHours;

            // Branş / Alan Başlık Şeridi
            html += `
                <tr class="${stripClass}">
                    <td class="branch-strip-title" colspan="${data.subeler.length + 3}">
                        <div class="branch-strip-content">
                            <span class="branch-title-text">${icon} <strong>${bName.toUpperCase()}</strong> ${isVoc ? 'ALANI' : 'BRANŞI'}</span>
                            <div class="branch-strip-metrics">
                                <span class="badge-metric load-metric">Haftalık Yük: <strong>${displayHours}s</strong></span>
                                <span class="badge-metric norm-metric">Norm: <strong>${bReport.calculatedNorm}</strong></span>
                                <span class="badge-metric teacher-metric">Mevcut: <strong>${bReport.currentTeachers}</strong></span>
                                <span class="badge-metric status-${bReport.statusType}">${bReport.difference > 0 ? `+${bReport.difference} Fazla` : (bReport.difference < 0 ? `${bReport.difference} İhtiyaç` : 'Tam')}</span>
                            </div>
                        </div>
                    </td>
                </tr>
            `;

            // Branşa Bağlı Derslerin Satırları
            const courseList = Object.values(bGroup.courses).sort((a, b) => a.courseName.localeCompare(b.courseName, 'tr'));
            courseList.forEach((course, cIdx) => {
                const isEven = cIdx % 2 === 0;
                html += `
                    <tr class="course-data-row ${isEven ? 'row-even' : 'row-odd'}">
                        <td class="sticky-col-cell course-name-cell">
                            <div class="course-name-inner">
                                <span class="course-bullet">●</span>
                                <span class="course-name-text">${course.courseName}</span>
                                ${course.isBaraj ? '<span class="pill-baraj" title="Baraj / Zorunlu Ders">BARAJ</span>' : ''}
                                ${course.isAtolye ? '<span class="pill-atolye" title="Atölye / Uygulama">ATÖLYE</span>' : ''}
                            </div>
                        </td>
                        ${data.subeler.map(s => {
                            const h = course.sectionHours[s.id];
                            const isMerged = course.mergedSections && course.mergedSections[s.id] && course.mergedSections[s.id].length > 0;
                            if (h && h > 0) {
                                if (isMerged) {
                                    return `<td class="cell-hour active-hour cell-merged-hour" title="🔗 Birleşik Ders (${s.subeAdi})">${h}<span class="merge-badge-icon">🔗</span></td>`;
                                }
                                return `<td class="cell-hour active-hour">${h}</td>`;
                            }
                            return `<td class="cell-hour empty-hour"><span class="matrix-dash">—</span></td>`;
                        }).join("")}
                        <td class="cell-total-course"><strong>${course.totalHours}</strong></td>
                        <td class="cell-norm-contrib">—</td>
                    </tr>
                `;
            });
        });

        // Genel Toplam Satırı (Footer)
        html += `
                    </tbody>
                    <tfoot>
                        <tr class="grand-total-row">
                            <td class="sticky-col-cell grand-total-label">HAFTALIK ŞUBE TOPLAM DERS SAATİ</td>
                            ${data.subeler.map(s => `
                                <td class="cell-sec-total"><strong>${data.sectionTotals[s.id] || 0}</strong></td>
                            `).join("")}
                            <td class="cell-grand-total"><strong>${data.grandTotalHours}</strong></td>
                            <td class="cell-grand-norm">—</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        return html;
    }

    // 2. YÖNETİCİ İCMAL RAPORU RENDER
    renderExecutiveReport(data, isMono) {
        const kpis = data.kpis;
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">NORM KADRO VE DERS YÜKÜ YÖNETİCİ İCMAL RAPORU</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • Eğitim-Öğretim Sezonu: ${data.schoolInfo.sezon || '2024-2025'}</div>
            </div>

            <!-- KPI Kartları -->
            <div class="kpi-dashboard-grid">
                <div class="kpi-card kpi-blue">
                    <div class="kpi-label">TOPLAM HAFTALIK DERS YÜKÜ</div>
                    <div class="kpi-value">${kpis.totalHours} <span class="kpi-unit">Saat</span></div>
                    <div class="kpi-foot">${kpis.totalSections} Şube • ${kpis.totalStudents} Öğrenci</div>
                </div>
                <div class="kpi-card kpi-green">
                    <div class="kpi-label">HESAPLANAN TOPLAM NORM</div>
                    <div class="kpi-value">${kpis.totalCalculatedNorm} <span class="kpi-unit">Öğretmen</span></div>
                    <div class="kpi-foot">MEB Norm Yönetmeliği Uygun</div>
                </div>
                <div class="kpi-card kpi-purple">
                    <div class="kpi-label">MEVCUT KADROLU ÖĞRETMEN</div>
                    <div class="kpi-value">${kpis.totalCurrentTeachers} <span class="kpi-unit">Öğretmen</span></div>
                    <div class="kpi-foot">Okulda Görevli Kadrolar</div>
                </div>
                <div class="kpi-card ${kpis.totalNeeded > 0 ? 'kpi-red' : 'kpi-neutral'}">
                    <div class="kpi-label">NET NORM İHTİYACI (AÇIK)</div>
                    <div class="kpi-value">${kpis.totalNeeded} <span class="kpi-unit">Öğretmen</span></div>
                    <div class="kpi-foot">${kpis.ihtiyacBranchesCount} Branşta Açık Var</div>
                </div>
                <div class="kpi-card ${kpis.totalSurplus > 0 ? 'kpi-orange' : 'kpi-neutral'}">
                    <div class="kpi-label">NET NORM FAZLASI</div>
                    <div class="kpi-value">${kpis.totalSurplus} <span class="kpi-unit">Öğretmen</span></div>
                    <div class="kpi-foot">${kpis.fazlaBranchesCount} Branşta Fazlalık Var</div>
                </div>
            </div>

            <!-- Durum Dağılım Çubuğu -->
            <div class="norm-status-summary-bar">
                <div class="status-summary-item stat-tam">
                    <span class="dot"></span> Kadrosu Tam: <strong>${kpis.tamBranchesCount} Branş</strong>
                </div>
                <div class="status-summary-item stat-ihtiyac">
                    <span class="dot"></span> Norm İhtiyacı: <strong>${kpis.ihtiyacBranchesCount} Branş</strong>
                </div>
                <div class="status-summary-item stat-fazla">
                    <span class="dot"></span> Norm Fazlası: <strong>${kpis.fazlaBranchesCount} Branş</strong>
                </div>
            </div>

            <!-- Yönetici ve İdareci Kadro Normu (MEB Md. 5 - 14) -->
            ${data.adminNorms ? `
            <div style="background: var(--bg-card-subtle); border: 1.5px solid var(--border-main); border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.25rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;">
                    <div style="font-size: 0.92rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                        <span>🏛️ YÖNETİCİ VE İDARECİ NORM KADRO DURUMU</span>
                        <span style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted); background: var(--bg-badge); padding: 0.15rem 0.5rem; border-radius: 6px;">MEB 2014/6459 Yönetmeliği Md. 5 - 14</span>
                    </div>
                    <div style="font-size: 0.85rem; font-weight: 800; color: #2563eb;">
                        Toplam Yönetici Normu: <span style="font-size: 1.1rem; background: rgba(37, 99, 235, 0.12); padding: 0.1rem 0.55rem; border-radius: 6px;">${data.adminNorms.toplamYonetici}</span>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.65rem; margin-bottom: 0.75rem;">
                    <div style="background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 8px; padding: 0.65rem; text-align: center;">
                        <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">OKUL MÜDÜRÜ</div>
                        <div style="font-size: 1.35rem; font-weight: 800; color: #0284c7; margin: 0.15rem 0;">${data.adminNorms.mudur}</div>
                        <div style="font-size: 0.68rem; color: var(--text-muted);">MEB Md. 5/1 Hükmü</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 8px; padding: 0.65rem; text-align: center;">
                        <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">MÜDÜR BAŞYARDIMCISI</div>
                        <div style="font-size: 1.35rem; font-weight: 800; color: #7c3aed; margin: 0.15rem 0;">${data.adminNorms.mudurBasyardimcisi}</div>
                        <div style="font-size: 0.68rem; color: var(--text-muted);">${data.adminNorms.mudurBasyardimcisi > 0 ? 'Pansiyon/Yatılı veya 6 Mdr. Yrd. (Md. 6)' : 'Şartlar Oluşmadı'}</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 8px; padding: 0.65rem; text-align: center;">
                        <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">MÜDÜR YARDIMCISI</div>
                        <div style="font-size: 1.35rem; font-weight: 800; color: #059669; margin: 0.15rem 0;">${data.adminNorms.mudurYardimcisiTotal}</div>
                        <div style="font-size: 0.68rem; color: var(--text-muted);">Temel: ${data.adminNorms.mudurYardimcisiBase} + İlave Haklar: ${data.adminNorms.mudurYardimcisiExtra}</div>
                    </div>
                </div>

                ${data.adminNorms.explanations && data.adminNorms.explanations.length > 0 ? `
                    <div style="font-size: 0.72rem; color: var(--text-muted); background: var(--bg-card); border-radius: 6px; padding: 0.5rem 0.75rem; border-left: 3px solid #2563eb; display: flex; flex-direction: column; gap: 0.2rem;">
                        ${data.adminNorms.explanations.map(exp => `<div>• ${exp}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
            ` : ''}

            <!-- Branşlar Tablosu -->
            <div class="table-responsive-container">
                <table class="report-data-table">
                    <thead>
                        <tr>
                            <th>BRANŞ ADI</th>
                            <th>TOPLAM DERS YÜKÜ</th>
                            <th>HESAPLANAN NORM</th>
                            <th>MEVCUT KADRO</th>
                            <th>FARK / DURUM</th>
                            <th>MEVZUAT FORMÜLÜ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.branchReport.map(b => `
                            <tr>
                                <td class="font-medium">${b.branchName}</td>
                                <td><strong>${b.totalHours}</strong> Saat</td>
                                <td><span class="norm-val-badge">${b.calculatedNorm}</span></td>
                                <td>${b.currentTeachers}</td>
                                <td><span class="status-badge-lg ${b.statusClass}">${b.statusBadge}</span></td>
                                <td class="text-muted text-sm">${b.formulaBreakdown || 'MEB Standart Norm Baremi'}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
        return html;
    }

    // 3. BRANŞ BAZLI DETAYLI NORM CETVELİ RENDER
    renderBranchDetailReport(data, isMono) {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">BRANŞ BAZLI DETAYLI NORM VE YÜK CETVELİ</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • Detaylı Branş İnceleme Cetveli</div>
            </div>

            <div class="branch-detail-cards-container">
                ${data.branches.map(b => `
                    <div class="branch-detail-card">
                        <div class="branch-card-header">
                            <div class="b-title">⚖️ ${b.branchName}</div>
                            <span class="status-badge-lg ${b.statusClass}">${b.statusBadge}</span>
                        </div>
                        <div class="branch-card-body">
                            <div class="b-stats-row">
                                <div class="b-stat"><span>Toplam Ders Yükü:</span> <strong>${b.totalHours} Saat</strong></div>
                                <div class="b-stat"><span>Hesaplanan Norm:</span> <strong>${b.calculatedNorm} Öğretmen</strong></div>
                                <div class="b-stat"><span>Mevcut Kadrolu:</span> <strong>${b.currentTeachers} Öğretmen</strong></div>
                                <div class="b-stat"><span>Net Durum:</span> <strong>${b.difference > 0 ? `+${b.difference} Fazla` : (b.difference < 0 ? `${b.difference} İhtiyaç` : 'Tam')}</strong></div>
                            </div>
                            <div class="b-rule-box">
                                <strong>Mevzuat Dayanağı:</strong> ${b.formulaBreakdown}
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
        return html;
    }

    // 4. SINIF VE ŞUBE HAFTALIK DERS ÇİZELGELERİ RENDER
    renderScheduleReport(data, isMono) {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">ŞUBE HAFTALIK DERS DAĞITIM ÇİZELGELERİ</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • Haftalık Ders Dağıtım Listesi</div>
            </div>

            <div class="section-schedules-grid">
                ${data.sections.map(sec => `
                    <div class="schedule-section-card">
                        <div class="sec-card-header">
                            <div class="sec-title">🏫 ${sec.subeAdi} (${sec.sinifSeviyesi}. Sınıf)</div>
                            <div class="sec-total-badge ${sec.totals.weeklyTotal === 40 || sec.totals.weeklyTotal === 45 ? 'badge-ok' : 'badge-warn'}">
                                Haftalık Toplam: <strong>${sec.totals.weeklyTotal} Saat</strong>
                            </div>
                        </div>
                        <div class="sec-card-body">
                            <!-- Ortak Dersler -->
                            <div class="course-group-block">
                                <div class="group-title">📘 Ortak Zorunlu Dersler (${sec.totals.common} Saat)</div>
                                <ul class="course-mini-list">
                                    ${sec.commonCourses.map(c => `<li><span class="c-name">${c.ders}</span> <span class="c-hour">${c.saat}s</span></li>`).join("")}
                                </ul>
                            </div>

                            <!-- Meslek / Dal Dersleri -->
                            ${sec.vocationalCourses.length > 0 ? `
                                <div class="course-group-block">
                                    <div class="group-title">⚙️ Alan / Dal Meslek Dersleri (${sec.totals.vocational} Saat)</div>
                                    <ul class="course-mini-list">
                                        ${sec.vocationalCourses.map(c => `<li><span class="c-name">${c.ders}</span> <span class="c-hour">${c.saat}s</span></li>`).join("")}
                                    </ul>
                                </div>
                            ` : ''}

                            <!-- Seçmeli Dersler -->
                            ${sec.electiveCourses.length > 0 ? `
                                <div class="course-group-block">
                                    <div class="group-title">🎯 Seçmeli Dersler (${sec.totals.elective} Saat)</div>
                                    <ul class="course-mini-list">
                                        ${sec.electiveCourses.map(c => `<li><span class="c-name">${c.ders}</span> <span class="c-hour">${c.saat}s</span></li>`).join("")}
                                    </ul>
                                </div>
                            ` : ''}

                            <!-- Rehberlik -->
                            ${sec.guidanceCourse ? `
                                <div class="course-group-block">
                                    <div class="group-title">🧭 Rehberlik ve Yönlendirme (${sec.totals.guidance} Saat)</div>
                                    <ul class="course-mini-list">
                                        <li><span class="c-name">${sec.guidanceCourse.ders}</span> <span class="c-hour">${sec.guidanceCourse.saat}s</span></li>
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
        return html;
    }

    // 5. NORM İHTİYAÇ VE FAZLALIK EYLEM RAPORU RENDER
    renderNormActionReport(data, isMono) {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">NORM KADRO İHTİYAÇ VE FAZLALIK RESMÎ EYLEM CETVELİ</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • İl / İlçe Millî Eğitim Müdürlüğü MEBBİS Norm Güncelleme Cetveli</div>
            </div>

            <!-- İhtiyaç Tablosu -->
            <div class="action-report-section">
                <div class="action-header red-header">
                    <span>🚨 NORM KADRO İHTİYACI OLAN BRANŞLAR (ÖĞRETMEN TALEP LİSTESİ)</span>
                    <span class="action-count-badge">Toplam İhtiyaç: ${data.totalNeeded} Öğretmen</span>
                </div>
                ${data.neededList.length > 0 ? `
                    <table class="report-data-table">
                        <thead>
                            <tr>
                                <th>BRANŞ</th>
                                <th>DERS YÜKÜ</th>
                                <th>NORM</th>
                                <th>MEVCUT</th>
                                <th>İHTİYAÇ</th>
                                <th>MEB GEREKÇESİ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.neededList.map(item => `
                                <tr>
                                    <td class="font-medium">${item.branchName}</td>
                                    <td>${item.totalHours}s</td>
                                    <td>${item.calculatedNorm}</td>
                                    <td>${item.currentTeachers}</td>
                                    <td><strong class="text-danger">${item.neededCount} İhtiyaç</strong></td>
                                    <td class="text-sm text-muted">${item.reason}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                ` : `<div class="empty-state-notice">✅ Okulda norm kadro açığı / ihtiyacı olan branş bulunmamaktadır.</div>`}
            </div>

            <!-- Fazlalık Tablosu -->
            <div class="action-report-section" style="margin-top: 2rem;">
                <div class="action-header orange-header">
                    <span>⚠️ NORM KADRO FAZLASI OLAN BRANŞLAR (ATAMA / NAKİL LİSTESİ)</span>
                    <span class="action-count-badge">Toplam Fazla: ${data.totalSurplus} Öğretmen</span>
                </div>
                ${data.surplusList.length > 0 ? `
                    <table class="report-data-table">
                        <thead>
                            <tr>
                                <th>BRANŞ</th>
                                <th>DERS YÜKÜ</th>
                                <th>NORM</th>
                                <th>MEVCUT</th>
                                <th>FAZLALIK</th>
                                <th>MEB GEREKÇESİ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.surplusList.map(item => `
                                <tr>
                                    <td class="font-medium">${item.branchName}</td>
                                    <td>${item.totalHours}s</td>
                                    <td>${item.calculatedNorm}</td>
                                    <td>${item.currentTeachers}</td>
                                    <td><strong class="text-warning">${item.surplusCount} Fazlalık</strong></td>
                                    <td class="text-sm text-muted">${item.reason}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                ` : `<div class="empty-state-notice">✅ Okulda norm kadro fazlası öğretmen bulunmamaktadır.</div>`}
            </div>
        `;
        return html;
    }

    // 6. ATÖLYE, LABORATUVAR VE GRUP BÖLÜNMELERİ RENDER (ŞEFFAF BAREM DENETİMİ)
    renderVocationalLabReport(data, isMono) {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        // 12. Sınıf Koordinatörlük Cetveli
        const coordMap = stateData.koordinatorlukYukleri || {};
        const coordEntries = Object.entries(coordMap).filter(([k, v]) => parseInt(v, 10) > 0);

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">MESLEKİ VE TEKNİK ATÖLYE / GRUP BÖLÜNMELERİ VE KOORDİNATÖRLÜK RAPORU</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • MEB Ortaöğretim Kurumları Yönetmeliği Madde 134 ve Madde 88 Barem Denetimi</div>
            </div>

            <!-- KPI Kartları -->
            <div class="kpi-dashboard-grid" style="margin-bottom: 1.5rem;">
                <div class="kpi-card kpi-purple">
                    <div class="kpi-label">TABAN ATÖLYE DERS SAATİ</div>
                    <div class="kpi-value">${data.grandBaseHours} <span class="kpi-unit">Saat</span></div>
                    <div class="kpi-foot">Ders Çizelgesi Temel Saati</div>
                </div>
                <div class="kpi-card kpi-blue">
                    <div class="kpi-label">GRUP ÇARPANLI HESAPLANAN YÜK</div>
                    <div class="kpi-value">${data.grandCalculatedHours} <span class="kpi-unit">Saat</span></div>
                    <div class="kpi-foot">Norm Kadroya Yansıyan Fiili Yük</div>
                </div>
                <div class="kpi-card kpi-green">
                    <div class="kpi-label">GRUPLANDIRMADAN GELEN EK YÜK</div>
                    <div class="kpi-value">+${data.totalExtraGroupHours} <span class="kpi-unit">Saat</span></div>
                    <div class="kpi-foot">Bölünmelerden Oluşan Ek Norm Yükü</div>
                </div>
            </div>

            <!-- Bilgilendirme Kutusu (Mevzuat Baremi) -->
            <div class="meb-regulation-notice-box" style="background: rgba(2, 132, 199, 0.06); border: 1.5px solid rgba(2, 132, 199, 0.25); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.76rem; color: #0369a1;">
                <strong>📜 MEB Mevzuat Baremi (OÖKY Md. 134):</strong> 10-20 Öğrenci ➔ <strong>1 Grup</strong> | 21-30 Öğrenci ➔ <strong>2 Grup</strong> | 31-40 Öğrenci ➔ <strong>3 Grup</strong> | 41+ Öğrenci ➔ <strong>4 Grup</strong> olarak hesaplanır.
            </div>

            <div class="table-responsive-container">
                <table class="report-data-table">
                    <thead>
                        <tr>
                            <th>ŞUBE</th>
                            <th>MEVCUT</th>
                            <th>ATÖLYE DERSİ</th>
                            <th>BRANŞ</th>
                            <th>TEMEL SAAT</th>
                            <th>GRUP SAYISI</th>
                            <th>FİİLİ DERS YÜKÜ</th>
                            <th>EK YÜK (+)</th>
                            <th>MEVZUAT AÇIKLAMASI</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.labCourses.map(item => `
                            <tr>
                                <td class="font-medium">${item.sectionName}</td>
                                <td>${item.studentCount} Ögr</td>
                                <td>${item.courseName}</td>
                                <td>${item.branchName}</td>
                                <td>${item.baseHours}s</td>
                                <td><span class="group-count-badge">${item.groupCount} Grup</span></td>
                                <td><strong>${item.calculatedLoad}s</strong></td>
                                <td><span style="color:#16a34a; font-weight:800;">+${item.extraLoad}s</span></td>
                                <td class="text-sm text-muted">${item.note}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <!-- 12. Sınıf Koordinatörlük Bölümü -->
            ${coordEntries.length > 0 ? `
                <div style="margin-top: 2rem; background: var(--bg-card-subtle); border: 1.5px solid var(--border-main); border-radius: 10px; padding: 1rem 1.25rem;">
                    <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.65rem; display: flex; align-items: center; justify-content: space-between;">
                        <span>🏢 12. SINIF İŞLETMELERDE MESLEK EĞİTİMİ (STAJ) KOORDİNATÖRLÜK YÜKLERİ</span>
                        <span style="font-size: 0.72rem; color: #7c3aed; background: rgba(124, 58, 237, 0.1); padding: 0.15rem 0.55rem; border-radius: 6px;">OÖKY Madde 88 Hükmü</span>
                    </div>
                    <table class="report-data-table">
                        <thead>
                            <tr>
                                <th>MESLEK ALANI / BRANŞ</th>
                                <th>HAFTALIK KOORDİNATÖRLÜK YÜKÜ</th>
                                <th>YASAL DAYANAK</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${coordEntries.map(([br, val]) => `
                                <tr>
                                    <td class="font-medium">🟣 ${br}</td>
                                    <td><strong style="color: #7c3aed;">+${val} Saat</strong></td>
                                    <td class="text-muted text-sm">MEB Ortaöğretim Kurumları Yönetmeliği Madde 88 (Öğretmen Başına Koordinatörlük)</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
        `;
        return html;
    }

    // 7. 3-TEMA SEÇMELİ DERS DENGESİ RENDER
    renderElectiveThemeReport(data, isMono) {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">3-TEMA SEÇMELİ DERS DAĞILIM VE DENGE ANALİZİ</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • TTKB 3 Ana Tema Seçim Analizi</div>
            </div>

            <div class="table-responsive-container">
                <table class="report-data-table">
                    <thead>
                        <tr>
                            <th>ŞUBE</th>
                            <th>TOPLAM SEÇMELİ</th>
                            <th>1. İNSAN, TOPLUM & BİLİM</th>
                            <th>2. DİN, AHLAK VE DEĞER</th>
                            <th>3. KÜLTÜR, SANAT & SPOR</th>
                            <th>SEÇMELİ MESLEK</th>
                            <th>3-TEMA DENGESİ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.themeSections.map(sec => `
                            <tr>
                                <td class="font-medium">${sec.sectionName}</td>
                                <td><strong>${sec.totalElectiveHours}s</strong></td>
                                <td>${sec.stats.BILIM.hours}s <span class="text-xs text-muted">(${sec.stats.BILIM.count} ders)</span></td>
                                <td>${sec.stats.DEGER.hours}s <span class="text-xs text-muted">(${sec.stats.DEGER.count} ders)</span></td>
                                <td>${sec.stats.SANAT.hours}s <span class="text-xs text-muted">(${sec.stats.SANAT.count} ders)</span></td>
                                <td>${sec.stats.VOC.hours}s <span class="text-xs text-muted">(${sec.stats.VOC.count} ders)</span></td>
                                <td>
                                    ${sec.isBalanced ? 
                                        '<span class="status-badge-lg status-tam">✅ 3-Tema Dengeli</span>' : 
                                        '<span class="status-badge-lg status-ihtiyac">⚠️ Tek Yönlü</span>'}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
        return html;
    }

    // =========================================================================
    // ⚖️ KVKK AYDINLATMA METNİ, GİZLİLİK VE VERİ GÜVENLİĞİ MERKEZİ MODALI
    // =========================================================================
    openKvkkModal(initialTab = "AYDINLATMA") {
        let activeTab = initialTab;

        const modalHtml = `
            <div class="modal-overlay active" id="kvkk-center-modal">
                <div class="modal-box kvkk-modal-box">
                    <!-- Üst Başlık -->
                    <div class="modal-header kvkk-modal-header">
                        <div class="kvkk-header-left">
                            <div class="kvkk-header-title">
                                <span>⚖️</span> KVKK Aydınlatma Metni ve Veri Güvenliği Merkezi
                            </div>
                            <div class="kvkk-header-subtitle">
                                6698 Sayılı Kanun, GDPR ve MEB Bilgi Güvenliği Esaslarına %100 Uyum Taahhüdü
                            </div>
                        </div>
                        <div class="kvkk-header-actions no-print">
                            <button class="btn-kvkk-print" id="btn-kvkk-print" title="Yazdır / PDF Olarak Kaydet">
                                🖨️ Yazdır / PDF
                            </button>
                            <button class="modal-close-btn" id="btn-close-kvkk-modal" title="Pencereyi Kapat">✕</button>
                        </div>
                    </div>

                    <!-- Kategori Sekmeleri -->
                    <div class="kvkk-nav-tabs no-print">
                        <button class="kvkk-tab-btn ${activeTab === 'AYDINLATMA' ? 'active' : ''}" data-tab="AYDINLATMA">
                            📜 1. Aydınlatma Metni
                        </button>
                        <button class="kvkk-tab-btn ${activeTab === 'MIMARI' ? 'active' : ''}" data-tab="MIMARI">
                            🔒 2. Sıfır Bilgi & Yerel Mimari
                        </button>
                        <button class="kvkk-tab-btn ${activeTab === 'CEREZ' ? 'active' : ''}" data-tab="CEREZ">
                            🍪 3. Çerez & LocalStorage
                        </button>
                        <button class="kvkk-tab-btn ${activeTab === 'HAKLAR' ? 'active' : ''}" data-tab="HAKLAR">
                            ⚖️ 4. KVKK m.11 & Unutulma Hakkı
                        </button>
                        <button class="kvkk-tab-btn ${activeTab === 'DISCLAIMER' ? 'active' : ''}" data-tab="DISCLAIMER">
                            🛡️ 5. Yasal Sorumluluk Reddi
                        </button>
                    </div>

                    <!-- Modal Gövdesi (İçerik) -->
                    <div class="modal-body kvkk-modal-body" id="kvkk-content-container">
                        <!-- Dinamik İçerik -->
                    </div>

                    <!-- Modal Altı (Hızlı Eylemler & Onay) -->
                    <div class="modal-footer kvkk-modal-footer no-print">
                        <div class="kvkk-footer-notice">
                            <span>🛡️ Bu uygulama verilerinizi hiçbir sunucuya iletmez; verileriniz cihazınızda kalır.</span>
                        </div>
                        <div class="kvkk-footer-btns">
                            <button class="btn btn-outline" id="btn-copy-kvkk" title="Metni Panoya Kopyala">📋 Metni Kopyala</button>
                            <button class="btn btn-primary" id="btn-ok-kvkk">Anladım ve Kabul Ediyorum ✓</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        const renderTabContent = () => {
            const container = document.getElementById("kvkk-content-container");
            if (!container) return;

            let tabHtml = "";

            if (activeTab === "AYDINLATMA") {
                tabHtml = `
                    <div class="kvkk-article">
                        <div class="kvkk-badge-headline">
                            <span class="kvkk-law-badge">6698 SAYILI KANUN m. 10</span>
                            <span class="kvkk-date-badge">Son Güncelleme: 17 Ağustos 2026</span>
                        </div>
                        <h3 class="kvkk-sec-title">MEB NORM KADRO VE DERS YÜKÜ YÖNETİM SİSTEMİ<br>KİŞİSEL VERİLERİN KORUNMASI AYDINLATMA METNİ</h3>
                        
                        <div class="kvkk-alert-card info">
                            <div class="kvkk-alert-icon">💡</div>
                            <div class="kvkk-alert-text">
                                <strong>Özet Beyan:</strong> İşbu yazılım, <strong>"Privacy by Design (Tasarım İtibarıyla Gizlilik)"</strong> ve <strong>"Zero-Knowledge (Sıfır Bilgi)"</strong> prensibiyle %100 İstemci Taraflı (Client-Side) olarak geliştirilmiştir. Girdiğiniz hiçbir veri harici bir sunucuya veya üçüncü kişiye <strong>kesinlikle gönderilmemektedir</strong>.
                            </div>
                        </div>

                        <h4 class="kvkk-sub-heading">1. Veri Sorumlusu ve Hizmet Sağlayıcı</h4>
                        <p class="kvkk-p">
                            6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, <strong>MEB Norm Kadro ve Ders Yükü Yönetim Sistemi</strong> (“Uygulama”) kapsamında işlenen veriler bakımından veri sorumlusu ve bağımsız sistem mimarı <strong>Burhan AYSAN</strong>’dır.
                        </p>

                        <h4 class="kvkk-sub-heading">2. İşlenen Veri Kategorileri ve Kapsamı</h4>
                        <p class="kvkk-p">Uygulama aracılığıyla yalnızca okul norm kadro ve haftalık ders yükü planlamasını gerçekleştirmek üzere aşağıdaki sınırlı veri kategorileri yerel olarak işlenmektedir:</p>
                        <ul class="kvkk-list">
                            <li><strong>Kurum Kimlik Bilgileri:</strong> Kurum/Okul Adı, Eğitim-Öğretim Sezon Yılı, Okul Türü (Anadolu Lisesi, Fen Lisesi, MTAL vb.), İl/İlçe bilgisi.</li>
                            <li><strong>Şube ve Öğrenci Dağılım Verileri:</strong> Şube adları (9-A, 10-B vb.), sınıf seviyeleri, şube öğrenci mevcutları, mesleki alan ve dal tercihleri.</li>
                            <li><strong>Ders Yükü ve Kadro Dağılım Verileri:</strong> Şubelere atanan haftalık zorunlu ve seçmeli ders saatleri, branş eşleştirmeleri, mevcut kadrolu öğretmen sayıları, atölye grup sayıları ve 12. sınıf işletmelerde mesleki eğitim koordinatörlük saatleri.</li>
                        </ul>

                        <h4 class="kvkk-sub-heading">3. Kişisel Verilerin İşlenme Amaçları</h4>
                        <p class="kvkk-p">Toplanan teknik veriler münhasıran;</p>
                        <ul class="kvkk-list">
                            <li>Millî Eğitim Bakanlığı Norm Kadro Yönetmeliği ve TTKB Haftalık Ders Çizelgeleri doğrultusunda kurumun toplam ders yükünün hatasız hesaplanması,</li>
                            <li>Kültür ve meslek branşları bazında norm kadro ihtiyaç ve fazlalık simülasyonlarının oluşturulması,</li>
                            <li>Okul idarecileri için resmi formatta Yönetici İcmali, Master Ders Dağıtım Matrisi ve Branş Dağılım Çizelgelerinin üretilmesi amaçlarıyla işlenir.</li>
                        </ul>

                        <h4 class="kvkk-sub-heading">4. Verilerin Aktarımı (Üçüncü Şahıslara Aktarım Yasağı)</h4>
                        <p class="kvkk-p">
                            Kullanıcı tarafından sisteme girilen veriler; <strong>yurt içinde veya yurt dışında hiçbir sunucuya, bulut depolama hizmetine, reklam ağına, analitik takipçisine veya üçüncü tüzel/gerçek kişilere AKTARILMAMAKTADIR.</strong> Tüm işlem ve hesaplamalar doğrudan kullanıcının kendi bilgisayarının işlemcisi ve tarayıcısı üzerinde gerçekleşmektedir.
                        </p>

                        <h4 class="kvkk-sub-heading">5. Kişisel Veri Toplamanın Hukuki Sebebi</h4>
                        <p class="kvkk-p">
                            Söz konusu veriler, KVKK m. 5/2-f uyarınca <em>"İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması"</em> hukuki sebebine ve kullanıcının kendi iradesiyle yerel tarayıcısına veri girmesine dayalı olarak işlenmektedir.
                        </p>
                    </div>
                `;
            } else if (activeTab === "MIMARI") {
                tabHtml = `
                    <div class="kvkk-article">
                        <div class="kvkk-badge-headline">
                            <span class="kvkk-law-badge">SIFIR BİLGİ & ÇEVRİMDIŞI MİMARİ</span>
                        </div>
                        <h3 class="kvkk-sec-title">🔒 %100 İSTEMCİ TARAFLI (CLIENT-SIDE) VE ÇEVRİMDIŞI ÇALIŞMA GÜVENCESİ</h3>

                        <div class="kvkk-architecture-diagram">
                            <div class="arch-box local">
                                <span class="arch-icon">💻</span>
                                <strong>Kullanıcı Cihazı & Tarayıcısı</strong>
                                <p>Tüm hesaplamalar, şube verileri, öğrenci sayıları ve norm analizleri cihazınızın RAM ve LocalStorage alanında çalışır.</p>
                                <span class="arch-status ok">✅ %100 Güvenli & Yerel</span>
                            </div>
                            <div class="arch-arrow">
                                <span class="arch-arrow-icon">🚫</span>
                                <span class="arch-arrow-label">Hiçbir Veri İletilmez (Zero Transmission)</span>
                            </div>
                            <div class="arch-box cloud">
                                <span class="arch-icon">☁️</span>
                                <strong>Harici Bulut / Sunucu</strong>
                                <p>Sistemde hiçbir merkezi sunucu, veritabanı veya kullanıcı takip mekanizması bulunmaz.</p>
                                <span class="arch-status secure">🔒 Sıfır Kayıt & Sıfır Log</span>
                            </div>
                        </div>

                        <h4 class="kvkk-sub-heading">Teknik ve İdari Güvenlik Tedbirleri (KVKK m. 12)</h4>
                        <ul class="kvkk-list">
                            <li><strong>Çevrimdışı (Offline) Tam Destek:</strong> Uygulama bir kez yüklendikten sonra bilgisayarınızın internet bağlantısını kesseniz dahi eksiksiz çalışmaya devam eder. Bu durum verilerinizin dışarı sızamayacağının en somut teknik kanıtıdır.</li>
                            <li><strong>Yedekleme Güvenliği:</strong> Proje indirme (<code>💾 İndir</code>) ve yükleme (<code>📂 Yükle</code>) işlemleri doğrudan kullanıcının kendi sabit diskine <code>.json</code> formatında kaydedilir.</li>
                            <li><strong>Yetkisiz Erişim Koruması:</strong> Başka hiçbir kullanıcı veya üçüncü taraf sizin tarayıcınızda kayıtlı projenize uzaktan erişemez.</li>
                        </ul>
                    </div>
                `;
            } else if (activeTab === "CEREZ") {
                tabHtml = `
                    <div class="kvkk-article">
                        <div class="kvkk-badge-headline">
                            <span class="kvkk-law-badge">ÇEREZ & YEREL DEPOLAMA POLİTİKASI</span>
                        </div>
                        <h3 class="kvkk-sec-title">🍪 ÇEREZLER VE TARAYICI YEREL DEPOLAMA (LOCALSTORAGE) AYDINLATMASI</h3>

                        <p class="kvkk-p">
                            Uygulamamızda kullanıcı deneyimini takip eden, reklam hedeflemesi yapan veya kişisel profilleme çıkaran <strong>üçüncü taraf takip çerezleri (Third-Party Cookies) KESİNLİKLE KULLANILMAMAKTADIR.</strong>
                        </p>

                        <h4 class="kvkk-sub-heading">Kullanılan Teknik ve Zorunlu Yerel Depolama Anahtarları</h4>
                        <div class="kvkk-table-responsive">
                            <table class="kvkk-table">
                                <thead>
                                    <tr>
                                        <th>Anahtar (Key)</th>
                                        <th>Kullanım Amacı</th>
                                        <th>Depolama Türü</th>
                                        <th>Saklama Süresi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>meb_norm_app_state_v3</code></td>
                                        <td>Kullanıcının oluşturduğu okul, şube, öğrenci ve ders dağıtım verilerinin tarayıcı kapatıldığında kaybolmaması için yerel olarak saklanması.</td>
                                        <td>Tarayıcı LocalStorage</td>
                                        <td>Kullanıcı "Sıfırla" diyene kadar veya tarayıcı geçmişini silene kadar.</td>
                                    </tr>
                                    <tr>
                                        <td><code>meb_norm_theme</code></td>
                                        <td>Kullanıcının tercih ettiği görsel tema modunun (Açık / Koyu) hatırlanması.</td>
                                        <td>Tarayıcı LocalStorage</td>
                                        <td>Kalıcı (Yerel)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else if (activeTab === "HAKLAR") {
                tabHtml = `
                    <div class="kvkk-article">
                        <div class="kvkk-badge-headline">
                            <span class="kvkk-law-badge">KVKK m. 11 VE GDPR m. 17</span>
                        </div>
                        <h3 class="kvkk-sec-title">⚖️ İLGİLİ KİŞİNİN HAKLARI VE VERİLERİ SİLME (UNUTULMA HAKKI)</h3>

                        <p class="kvkk-p">6698 sayılı Kanun’un 11. maddesi uyarınca veri sahipleri aşağıdaki haklara sahiptir:</p>
                        
                        <div class="kvkk-rights-grid">
                            <div class="kvkk-right-card">
                                <div class="right-icon">🔍</div>
                                <div class="right-title">Bilgi Edinme ve İnceleme</div>
                                <div class="right-desc">Verilerinin nasıl işlendiğini ve hesaplama kurallarını şeffafça inceleme hakkı.</div>
                            </div>
                            <div class="kvkk-right-card">
                                <div class="right-icon">🗑️</div>
                                <div class="right-title">Anında ve Kalıcı Silme (Unutulma)</div>
                                <div class="right-desc">Üst menüdeki "🔄 Sıfırla" butonuyla tüm yerel verilerini tek tıkla geri döndürülemez biçimde silme hakkı.</div>
                            </div>
                            <div class="kvkk-right-card">
                                <div class="right-icon">📦</div>
                                <div class="right-title">Veri Taşınabilirliği</div>
                                <div class="right-desc">Tüm çalışma verilerini standart JSON veya Excel (CSV) olarak kendi cihazına dışa aktarma hakkı.</div>
                            </div>
                            <div class="kvkk-right-card">
                                <div class="right-icon">🚫</div>
                                <div class="right-title">Otomatik Profilleme İtirazı</div>
                                <div class="right-desc">Kullanıcı aleyhine hiçbir otomatik profilleme, skorlama veya pazarlama işlemi yürütülmez.</div>
                            </div>
                        </div>

                        <div class="kvkk-alert-card warning" style="margin-top: 1.25rem;">
                            <div class="kvkk-alert-icon">⚠️</div>
                            <div class="kvkk-alert-text">
                                <strong>Verileri Kalıcı Olarak Silmek İçin:</strong> Üst araç çubuğunda bulunan kırmızı <strong>"🔄 Sıfırla"</strong> butonuna tıklayarak açılan onay penceresinden tüm yerel çalışma verilerinizi anında silebilirsiniz.
                            </div>
                        </div>
                    </div>
                `;
            } else if (activeTab === "DISCLAIMER") {
                tabHtml = `
                    <div class="kvkk-article">
                        <div class="kvkk-badge-headline">
                            <span class="kvkk-law-badge">RESMİ MEB ÇEKİNCESİ</span>
                        </div>
                        <h3 class="kvkk-sec-title">🛡️ YASAL BİLGİLENDİRME VE SORUMLULUK ÇEKİNCESİ (DISCLAIMER)</h3>

                        <div class="kvkk-alert-card danger">
                            <div class="kvkk-alert-icon">⚖️</div>
                            <div class="kvkk-alert-text">
                                <strong>RESMÎ VE HUKUKİ HATIRLATMA:</strong> İşbu yazılım; Millî Eğitim Bakanlığı Norm Kadro Yönetmeliği, Talim ve Terbiye Kurulu Başkanlığı Kararları ve MEB Ders Yükü Esasları temel alınarak eğitim kurumlarına <strong>simülasyon, planlama ve karar destek rehberliği</strong> sunmak amacıyla bağımsız olarak geliştirilmiştir.
                            </div>
                        </div>

                        <h4 class="kvkk-sub-heading">Yasal Sorumluluk Sınırları</h4>
                        <ul class="kvkk-list">
                            <li><strong>Yetkili Merci Beyanı:</strong> Resmî norm kadro belirleme, öğretmen atama, norm fazlası tespiti ve idareci norm onaylama yetkisi münhasıran <strong>T.C. Millî Eğitim Bakanlığı, Valilikler ve İl/İlçe Millî Eğitim Müdürlüklerine</strong> aittir.</li>
                            <li><strong>Resmi Sistemlerin Üstünlüğü:</strong> Resmî iş, işlem, itiraz ve yazışmalarda Bakanlığın <strong>MEBBİS (Millî Eğitim Bakanlığı Bilişim Sistemleri)</strong> modülü verileri esastır.</li>
                            <li><strong>Telif ve Fikri Mülkiyet:</strong> Uygulamanın kaynak kodları, algoritma mimarisi, kural motoru ve görsel arayüz tasarımları 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile 6769 sayılı Sınai Mülkiyet Kanunu kapsamında korunmaktadır. İzinsiz kopyalanamaz veya ticari olarak çoğaltılamaz.</li>
                        </ul>
                    </div>
                `;
            }

            container.innerHTML = tabHtml;
            container.scrollTop = 0;
        };

        // Sekme Dinleyicileri
        document.querySelectorAll(".kvkk-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const t = btn.getAttribute("data-tab");
                if (t && t !== activeTab) {
                    activeTab = t;
                    document.querySelectorAll(".kvkk-tab-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    renderTabContent();
                }
            });
        });

        // Kapatma
        document.getElementById("btn-close-kvkk-modal")?.addEventListener("click", () => this.closeModal("kvkk-center-modal"));
        document.getElementById("btn-ok-kvkk")?.addEventListener("click", () => this.closeModal("kvkk-center-modal"));

        // Yazdırma
        document.getElementById("btn-kvkk-print")?.addEventListener("click", () => {
            window.print();
        });

        // Metni Kopyalama
        document.getElementById("btn-copy-kvkk")?.addEventListener("click", () => {
            const container = document.getElementById("kvkk-content-container");
            if (container) {
                navigator.clipboard.writeText(container.innerText).then(() => {
                    this.showToast("KVKK metni panoya kopyalandı!", "success");
                }).catch(() => {
                    this.showToast("Metin kopyalandı.", "info");
                });
            }
        });

        // İlk render
        renderTabContent();
    }

    // =========================================================================
    // 📥 e-OKUL EXCEL AKILLI ŞUBE VE ÖĞRENCİ İÇE AKTARMA SİHİRBAZI (v1.0)
    // =========================================================================
    openEOkulImportModal() {
        const types = this.db.getSchoolTypes();
        const currentType = this.state.state.okulBilgisi.okulTuru || "mesleki_ve_teknik_anadolu_lisesi";
        const isLocked = this.state.state.okulBilgisi.okulTuruKilitli;

        const schoolTypeOptions = types.map(t => `
            <option value="${t.id}" ${currentType === t.id ? 'selected' : ''}>
                ${t.name} (${t.category})
            </option>
        `).join("");

        const modalHtml = `
            <div class="modal-overlay active" id="eokul-import-modal">
                <div class="modal-box eokul-modal-box" style="max-width: 920px; width: 95vw;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #fff; padding: 1.1rem 1.5rem; border-radius: 12px 12px 0 0;">
                        <div>
                            <div class="modal-title" style="color: #fff; font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                                📥 e-Okul'dan Otomatik Şube & Öğrenci İçe Aktarma Sihirbazı
                            </div>
                            <div style="font-size: 0.8rem; color: #bfdbfe; margin-top: 0.25rem;">
                                e-Okul Sınıf Şube Öğrenci Sayıları (.xls / .xlsx) dosyasını yükleyerek tüm okulu 2 saniyede kurun.
                            </div>
                        </div>
                        <button class="modal-close-btn" id="btn-close-eokul-modal" style="color: #fff; font-size: 1.5rem; cursor: pointer; background: none; border: none;">&times;</button>
                    </div>

                    <div class="modal-body" style="padding: 1.25rem; max-height: 72vh; overflow-y: auto;">
                        
                        <!-- 1. ADIM: SÜRÜKLE BIRAK YÜKLEME ALANI -->
                        <div id="eokul-upload-section">
                            <div class="eokul-dropzone" id="eokul-dropzone">
                                <div class="eokul-dropzone-icon">📊</div>
                                <div class="eokul-dropzone-title">e-Okul Excel Dosyasını Buraya Sürükleyin</div>
                                <div class="eokul-dropzone-sub">veya bilgisayarınızdan seçmek için tıklayın (.XLS, .XLSX)</div>
                                <input type="file" id="eokul-file-input" accept=".xls,.xlsx,.csv" style="display: none;">
                            </div>

                            <div class="eokul-guide-card" style="margin-top: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem 1.2rem; font-size: 0.84rem; color: #334155; line-height: 1.6;">
                                <div style="font-weight: 800; color: #1e3a8a; font-size: 0.92rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                                    💡 e-Okul'dan Bu Belgeler Nasıl İndirilir? (Desteklenen 2 Rapor)
                                </div>
                                <div style="margin-bottom: 0.35rem;"><strong>Adım 1:</strong> e-Okul Yönetim Bilgi Sistemi ➔ <strong>Ortaöğretim / İlköğretim Öğrenci İşlemleri</strong> modülüne girin.</div>
                                <div style="margin-bottom: 0.35rem;"><strong>Adım 2:</strong> Üst menüdeki <strong>Yazıcı (Raporlar)</strong> simgesine tıklayın.</div>
                                <div style="margin-bottom: 0.5rem;"><strong>Adım 3:</strong> Aşağıdaki 2 rapordan okulunuza uygun olanı seçip <strong>Excel (.XLS / .XLSX)</strong> olarak indirin ve buraya yükleyin:</div>
                                
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75rem; margin: 0.6rem 0;">
                                    <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 0.75rem 0.9rem;">
                                        <div style="font-weight: 800; color: #1d4ed8; font-size: 0.84rem; margin-bottom: 0.25rem;">
                                            🥇 OOG01001R076 — Şube Listesi (Dal Bilgili)
                                        </div>
                                        <div style="font-size: 0.77rem; color: #1e40af;">
                                            <strong>Önerilen (MTAL / ÇPAL / Tüm Okullar):</strong> 11 ve 12. sınıfların uzmanlık <em>dal bilgilerini</em> de otomatik aktarır ve dal müfredatlarını doğrudan bağlar.
                                        </div>
                                    </div>
                                    <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 8px; padding: 0.75rem 0.9rem;">
                                        <div style="font-weight: 800; color: #15803d; font-size: 0.84rem; margin-bottom: 0.25rem;">
                                            🥈 OOG01001R010 — Sınıf Şube Öğrenci Sayıları
                                        </div>
                                        <div style="font-size: 0.77rem; color: #166534;">
                                            <strong>Genel / Standart İcmal (OGM, DÖGM, Temel Eğitim):</strong> Sınıf seviyesi, şubeler, alanlar ve kız/erkek öğrenci sayılarını içeren standart özet tablodur.
                                        </div>
                                    </div>
                                </div>

                                <div style="margin-top: 0.5rem; color: #059669; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem;">
                                    <span>✨</span> <span>Sistem her iki formatı da otomatik algılar; sıfır (0) mevcutlu şubeleri eler ve özel eğitim sınıflarını doğrudan tanır.</span>
                                </div>
                            </div>
                        </div>

                        <!-- 2. ADIM: AYRIŞTIRMA ÖNİZLEME ALANI (DOSYA SEÇİLİNCE GÖRÜNÜR) -->
                        <div id="eokul-preview-section" style="display: none;">
                            
                            <!-- KPI Özet Rozetleri -->
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
                                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 0.75rem; text-align: center;">
                                    <div style="font-size: 0.75rem; color: #065f46; font-weight: 600;">✅ AKTİF ŞUBE SAYISI</div>
                                    <div id="kpi-active-sections" style="font-size: 1.4rem; font-weight: 800; color: #059669; margin-top: 0.2rem;">0</div>
                                </div>
                                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 0.75rem; text-align: center;">
                                    <div style="font-size: 0.75rem; color: #1e40af; font-weight: 600;">👥 TOPLAM ÖĞRENCİ</div>
                                    <div id="kpi-total-students" style="font-size: 1.4rem; font-weight: 800; color: #2563eb; margin-top: 0.2rem;">0</div>
                                </div>
                                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 0.75rem; text-align: center;">
                                    <div style="font-size: 0.75rem; color: #92400e; font-weight: 600;">🚫 ELENEN BOŞ ŞUBELER (0 MEVCUT)</div>
                                    <div id="kpi-skipped-zeros" style="font-size: 1.4rem; font-weight: 800; color: #d97706; margin-top: 0.2rem;">0</div>
                                </div>
                            </div>

                            <!-- Ayarlar Barı -->
                            <div style="background: #f1f5f9; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <label style="font-weight: 600; color: #0f172a;">Kurulum Modu:</label>
                                    <label style="display: flex; align-items: center; gap: 0.3rem; cursor: pointer;">
                                        <input type="radio" name="eokul-import-mode" value="clear" checked> Mevcut Okulu Sıfırla & Sıfırdan Kur
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.3rem; cursor: pointer;">
                                        <input type="radio" name="eokul-import-mode" value="append"> Mevcut Şubelerin Üzerine Ekle
                                    </label>
                                </div>

                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <label style="font-weight: 600; color: #0f172a;">Okul Türü:</label>
                                    <select id="eokul-school-type" class="form-control" style="font-size: 0.8rem; padding: 0.3rem 0.5rem; max-width: 250px;" ${isLocked ? 'disabled' : ''}>
                                        ${schoolTypeOptions}
                                    </select>
                                </div>
                            </div>

                            <!-- Önizleme Tablosu -->
                            <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; max-height: 360px; overflow-y: auto;">
                                <table class="matrix-table" style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                                    <thead>
                                        <tr style="background: #f8fafc; color: #334155; position: sticky; top: 0; z-index: 10; border-bottom: 2px solid #cbd5e1;">
                                            <th style="padding: 0.6rem; text-align: left; width: 35px;">#</th>
                                            <th style="padding: 0.6rem; text-align: center; width: 65px;">Sınıf</th>
                                            <th style="padding: 0.6rem; text-align: left; min-width: 130px;">Şube Adı</th>
                                            <th style="padding: 0.6rem; text-align: center; width: 120px;">Mevcut</th>
                                            <th style="padding: 0.6rem; text-align: left; min-width: 170px;">Tespit Edilen Alan</th>
                                            <th style="padding: 0.6rem; text-align: left; min-width: 170px;">Tespit Edilen Dal</th>
                                            <th style="padding: 0.6rem; text-align: center; width: 50px;">Sil</th>
                                        </tr>
                                    </thead>
                                    <tbody id="eokul-preview-tbody">
                                        <!-- Dinamik satırlar JS ile basılır -->
                                    </tbody>
                                </table>
                            </div>

                        </div>

                    </div>

                    <div class="modal-footer" style="padding: 0.85rem 1.25rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #fafafa; border-radius: 0 0 12px 12px;">
                        <button class="btn btn-secondary" id="btn-reset-eokul" style="display: none;">🔄 Farklı Dosya Seç</button>
                        <div style="display: flex; gap: 0.5rem; margin-left: auto;">
                            <button class="btn btn-outline" id="btn-cancel-eokul">Vazgeç</button>
                            <button class="btn btn-primary" id="btn-apply-eokul" style="display: none; background: #2563eb; color: #fff; font-weight: 600;">
                                🚀 Şubeleri Otomatik Kur ve Müfredatı Doldur
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        const dropzone = document.getElementById("eokul-dropzone");
        const fileInput = document.getElementById("eokul-file-input");
        const uploadSection = document.getElementById("eokul-upload-section");
        const previewSection = document.getElementById("eokul-preview-section");
        const tbody = document.getElementById("eokul-preview-tbody");
        const btnReset = document.getElementById("btn-reset-eokul");
        const btnApply = document.getElementById("btn-apply-eokul");

        let parsedData = null;

        // Dosya Yükleme Olayları
        dropzone.addEventListener("click", () => fileInput.click());
        
        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("dragover");
        });

        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("dragover");
        });

        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("dragover");
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        const handleFile = (file) => {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const buffer = evt.target.result;
                    const importer = new EOkulImporter(this.db, this.curriculum);
                    parsedData = importer.parseExcelData(buffer);

                    if (!parsedData.sections || parsedData.sections.length === 0) {
                        this.showToast("Bu Excel dosyasında 0'dan büyük mevcudu olan aktif şube bulunamadı.", "warning");
                        return;
                    }

                    renderPreview(parsedData, importer);
                } catch (err) {
                    console.error("e-Okul ayrıştırma hatası:", err);
                    this.showToast("Dosya okunamadı: " + (err.message || "Geçersiz e-Okul formatı."), "danger");
                }
            };
            reader.readAsArrayBuffer(file);
        };

        const renderPreview = (data, importer) => {
            uploadSection.style.display = "none";
            previewSection.style.display = "block";
            btnReset.style.display = "inline-block";
            btnApply.style.display = "inline-block";

            document.getElementById("kpi-active-sections").innerText = data.schoolSummary.totalActiveSections;
            document.getElementById("kpi-total-students").innerText = data.schoolSummary.totalStudents;
            document.getElementById("kpi-skipped-zeros").innerText = data.schoolSummary.skippedZeroCount;

            btnApply.innerHTML = `🚀 <strong>${data.schoolSummary.totalActiveSections} Şubeyi</strong> Otomatik Kur ve Müfredatı Doldur`;

            // Tablo Satırları
            tbody.innerHTML = data.sections.map((sec, idx) => {
                const areaOptions = importer.KNOWN_AREAS.map(a => `
                    <option value="${a.id}" ${sec.matchedAreaId === a.id ? 'selected' : ''}>
                        ${a.name}
                    </option>
                `).join("");

                return `
                    <tr id="row-sec-${idx}" style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 0.45rem; color: #64748b;">${idx + 1}</td>
                        <td style="padding: 0.45rem; text-align: center;">
                            <span class="badge" style="background: #e2e8f0; color: #1e293b; font-weight: 700;">${sec.grade}. Sınıf</span>
                        </td>
                        <td style="padding: 0.45rem;">
                            <input type="text" class="form-control sec-name-input" data-idx="${idx}" value="${sec.subeAdi}" style="font-size: 0.8rem; padding: 0.25rem 0.4rem; font-weight: 600;">
                        </td>
                        <td style="padding: 0.45rem; text-align: center; font-weight: 600;">
                            <input type="number" class="form-control sec-count-input" data-idx="${idx}" value="${sec.studentCount}" min="1" max="60" style="width: 50px; display: inline-block; font-size: 0.8rem; padding: 0.2rem; text-align: center;">
                            <span style="font-size: 0.7rem; color: #64748b; margin-left: 2px;">(${sec.boysCount}E/${sec.girlsCount}K)</span>
                        </td>
                        <td style="padding: 0.45rem;">
                            <select class="form-control sec-area-select" data-idx="${idx}" style="font-size: 0.75rem; padding: 0.25rem 0.4rem;">
                                <option value="">— Alan Yok (Genel) —</option>
                                ${areaOptions}
                            </select>
                        </td>
                        <td style="padding: 0.45rem;">
                            <input type="text" class="form-control sec-dal-input" data-idx="${idx}" value="${sec.dalAdi || ''}" placeholder="Dal Yok / Ortak" style="font-size: 0.75rem; padding: 0.25rem 0.4rem;">
                        </td>
                        <td style="padding: 0.45rem; text-align: center;">
                            <button class="btn btn-icon btn-sm btn-delete-row" data-idx="${idx}" style="color: #ef4444;" title="Bu Şubeyi Hariç Tut">🗑️</button>
                        </td>
                    </tr>
                `;
            }).join("");

            // Satır Silme Butonları
            document.querySelectorAll(".btn-delete-row").forEach(btn => {
                btn.addEventListener("click", () => {
                    const idx = parseInt(btn.getAttribute("data-idx"), 10);
                    data.sections.splice(idx, 1);
                    data.schoolSummary.totalActiveSections = data.sections.length;
                    data.schoolSummary.totalStudents = data.sections.reduce((sum, s) => sum + s.studentCount, 0);
                    renderPreview(data, importer);
                });
            });
        };

        // Sıfırlama / Farklı Dosya Seçme
        btnReset.addEventListener("click", () => {
            fileInput.value = "";
            parsedData = null;
            uploadSection.style.display = "block";
            previewSection.style.display = "none";
            btnReset.style.display = "none";
            btnApply.style.display = "none";
        });

        // Kapatma / Vazgeç
        document.getElementById("btn-close-eokul-modal")?.addEventListener("click", () => this.closeModal("eokul-import-modal"));
        document.getElementById("btn-cancel-eokul")?.addEventListener("click", () => this.closeModal("eokul-import-modal"));

        // ŞUBELERİ OLUŞTUR VE MÜFREDATI DOLDUR BUTONU
        btnApply.addEventListener("click", () => {
            if (!parsedData || !parsedData.sections || parsedData.sections.length === 0) {
                this.showToast("Aktarılacak şube bulunamadı.", "warning");
                return;
            }

            // Tablodaki olası güncellemeleri oku
            document.querySelectorAll(".sec-name-input").forEach(inp => {
                const idx = parseInt(inp.getAttribute("data-idx"), 10);
                if (parsedData.sections[idx]) parsedData.sections[idx].subeAdi = inp.value.trim();
            });

            document.querySelectorAll(".sec-count-input").forEach(inp => {
                const idx = parseInt(inp.getAttribute("data-idx"), 10);
                if (parsedData.sections[idx]) parsedData.sections[idx].studentCount = parseInt(inp.value, 10) || 30;
            });

            const importer = new EOkulImporter(this.db, this.curriculum);

            document.querySelectorAll(".sec-area-select").forEach(sel => {
                const idx = parseInt(sel.getAttribute("data-idx"), 10);
                if (parsedData.sections[idx]) {
                    parsedData.sections[idx].matchedAreaId = sel.value || null;
                    const areaObj = importer.KNOWN_AREAS.find(a => a.id === sel.value);
                    parsedData.sections[idx].matchedAreaName = areaObj ? areaObj.name : null;
                }
            });

            document.querySelectorAll(".sec-dal-input").forEach(inp => {
                const idx = parseInt(inp.getAttribute("data-idx"), 10);
                if (parsedData.sections[idx]) {
                    parsedData.sections[idx].dalAdi = inp.value.trim() || null;
                }
            });

            const modeRadio = document.querySelector('input[name="eokul-import-mode"]:checked');
            const clearExisting = modeRadio ? modeRadio.value === "clear" : true;
            const selectedSchoolType = document.getElementById("eokul-school-type")?.value || currentType;

            // Okul Türünü Kilitle
            if (!this.state.state.okulBilgisi.okulTuruKilitli) {
                this.state.setSchoolType(selectedSchoolType);
            }

            importer.applySectionsToState(this.state, parsedData.sections, selectedSchoolType, clearExisting);

            this.closeModal("eokul-import-modal");
            this.showToast(`🎉 ${parsedData.sections.length} Şube ve ${parsedData.schoolSummary.totalStudents} Öğrenci e-Okul'dan Başarıyla Kuruldu!`, "success");

            // Global UI yeniden hesaplama
            if (typeof window !== 'undefined' && window.app && typeof window.app.renderAll === 'function') {
                window.app.renderAll();
            }
        });
    }


    // --- LİSANS DOĞRULAMA VE AKTİVASYON MERKEZİ MODALI ---
    openLicenseModal() {
        const lic = (typeof window !== 'undefined' && window.licenseManager) ? window.licenseManager.licenseStatus : { isDemo: true, daysRemaining: 7, maxSections: 5 };
        const okulInfo = this.state.state.okulBilgisi || {};
        const types = this.db.getSchoolTypes();
        const currentTypeObj = types.find(t => t.id === okulInfo.okulTuru) || { name: 'Belirtilmedi' };
        
        let statusBadge = "";
        if (lic.isMaster) {
            statusBadge = `<span style="background: rgba(139, 92, 246, 0.2); border: 1.5px solid #a855f7; color: #c084fc; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 800; font-size: 0.82rem;">👑 Master Developer (Burhan AYSAN) - Sınırsız</span>`;
        } else if (lic.isAnnual) {
            statusBadge = `<span style="background: rgba(16, 185, 129, 0.2); border: 1.5px solid #10b981; color: #10b981; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 800; font-size: 0.82rem;">🛡️ Yıllık Pro Lisans (${lic.daysRemaining} Gün Kaldı)</span>`;
        } else {
            statusBadge = `<span style="background: rgba(245, 158, 11, 0.2); border: 1.5px solid #f59e0b; color: #d97706; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 800; font-size: 0.82rem;">⏳ 7 Günlük Deneme Sürümü (${lic.daysRemaining} Gün Kaldı - Maks 5 Şube)</span>`;
        }

        const modalHtml = `
            <div class="modal-overlay active" id="license-modal">
                <div class="modal-box" style="max-width: 680px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                    <div class="modal-header" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 1.1rem 1.4rem;">
                        <div class="modal-title" style="color: #fff; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 0.6rem;">
                            <span style="font-size: 1.4rem;">🔑</span>
                            <div>
                                <div>MEB Norm Kadro Lisans & Güvenlik Merkezi</div>
                                <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">NormMatik™ 5846 Sayılı FSEK & TÜRKPATENT Korumalı Asimetrik Lisans Sistemi</div>
                            </div>
                        </div>
                        <button class="modal-close-btn" id="btn-close-license-modal" style="color: #fff;">✕</button>
                    </div>
                    <div class="modal-body" style="padding: 1.25rem 1.4rem; display: flex; flex-direction: column; gap: 1.1rem;">
                        
                        <!-- 1. Durum Kartı -->
                        <div style="background: var(--bg-card-subtle, #f8fafc); border: 1.5px solid var(--border-main, #e2e8f0); border-radius: 12px; padding: 0.9rem 1.1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                            <div>
                                <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Mevcut Lisans Durumu</div>
                                <div style="margin-top: 0.35rem;">${statusBadge}</div>
                            </div>
                            <div style="text-align: right; font-size: 0.78rem; color: var(--text-muted);">
                                <div><strong>Kurum Kodu:</strong> ${lic.kurumKodu || okulInfo.kurumKodu || '752148'}</div>
                                <div><strong>Bitiş Tarihi:</strong> ${lic.payload?.expireDate || (lic.isMaster ? '2099-12-31' : 'Deneme')}</div>
                            </div>
                        </div>

                        <!-- 2. CİHAZ VE KURUM KİMLİK KUTUSU (HWID + KURUM KODU) -->
                        <div style="background: rgba(2, 132, 199, 0.05); border: 1.5px dashed #0284c7; border-radius: 12px; padding: 0.9rem 1.1rem; display: flex; flex-direction: column; gap: 0.6rem;">
                            <div style="font-size: 0.78rem; font-weight: 800; color: var(--primary); text-transform: uppercase; display: flex; align-items: center; justify-content: space-between;">
                                <span>🖥️ Bu Bilgisayarın Cihaz ve Kurum Bilgileri</span>
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">(Lisans Alırken Geliştiriciye Gönderiniz)</span>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem; background: var(--bg-card); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                                <div><strong>🏛️ Kurum Kodu:</strong> <span id="disp-kurum-kodu">${okulInfo.kurumKodu || '752148'}</span></div>
                                <div><strong>📜 Kurum Türü:</strong> <span>${currentTypeObj.name}</span></div>
                                <div style="grid-column: span 2;"><strong>🖥️ Cihaz Kodu (HWID):</strong> <span id="disp-hwid" style="font-family: monospace; color: #0284c7; font-weight: 700;">Hesaplanıyor...</span></div>
                            </div>
                            <button class="btn btn-sm btn-outline" id="btn-copy-device-info" style="font-weight: 700; font-size: 0.78rem; background: #fff; width: 100%;">
                                📲 Lisans Talep Bilgilerini Kopyala (WhatsApp / E-posta)
                            </button>
                        </div>

                        <!-- 3. Lisans Giriş Alanı -->
                        <div class="form-group" style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="font-weight: 700; font-size: 0.82rem; color: var(--text-main);">Lisans Anahtarınızı Giriniz (Token veya Belge Metni):</label>
                            <textarea id="inp-license-token" rows="3" placeholder="MEBNORM.eyJ... formatındaki lisans anahtarınızı buraya yapıştırınız." style="font-family: monospace; font-size: 0.8rem; width: 100%; border: 1.5px solid var(--border-main); border-radius: 8px; padding: 0.65rem; box-sizing: border-box;"></textarea>
                        </div>

                        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                            <button class="btn btn-primary" id="btn-submit-license" style="flex: 2; min-width: 180px; padding: 0.75rem; font-weight: 800;">
                                ⚡ Lisansı Aktifleştir
                            </button>
                            <button class="btn btn-outline" id="btn-upload-lic-file" style="flex: 1; min-width: 140px; padding: 0.75rem;">
                                📂 Dosyadan Yükle (.lic)
                            </button>
                            <input type="file" id="file-lic-input" accept=".lic,.txt,.json" style="display:none;">
                        </div>

                        <div style="font-size: 0.74rem; color: var(--text-muted); line-height: 1.4; border-top: 1px solid var(--border-subtle); padding-top: 0.6rem;">
                            ℹ️ <strong>Nasıl Lisans Alınır?</strong> Kurumunuza özel 1 yıllık lisans anahtarı temin etmek için yazılım geliştiricisi <strong>Burhan AYSAN</strong> ile iletişime geçiniz.
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        // HWID Hesapla ve Ekrana Yaz
        if (typeof MebLicenseCore !== 'undefined') {
            MebLicenseCore.generateHardwareFingerprint().then(hwid => {
                const el = document.getElementById("disp-hwid");
                if (el) el.textContent = hwid;
            });
        }

        // WhatsApp Bilgi Metnini Kopyala
        document.getElementById("btn-copy-device-info")?.addEventListener("click", () => {
            const hwid = document.getElementById("disp-hwid")?.textContent || "HW-STANDALONE";
            const kKodu = document.getElementById("disp-kurum-kodu")?.textContent || "752148";
            const msg = `👑 NormMatik™ LİSANS AKTİVASYON TALEBİ\n* MEB Kurum Kodu: ${kKodu}\n* Okul Adı: ${okulInfo.okulAdi || 'MEB Okulu'}\n* İl / İlçe: ${okulInfo.il ? (okulInfo.il + ' / ' + okulInfo.ilce) : 'Belirtilmedi'}\n* Okul Türü: ${currentTypeObj.name}\n* Cihaz Donanım Kodu (HWID): ${hwid}`;
            navigator.clipboard.writeText(msg).then(() => {
                this.showToast("Lisans talep bilgileri kopyalandı! Geliştiriciye gönderebilirsiniz.", "success");
            });
        });

        // Kapatma
        document.getElementById("btn-close-license-modal")?.addEventListener("click", () => {
            this.closeModal("license-modal");
        });

        // Lisans Aktifleştir
        document.getElementById("btn-submit-license")?.addEventListener("click", async () => {
            const tokenInp = document.getElementById("inp-license-token").value.trim();
            if (!tokenInp) {
                alert("Lütfen lisans anahtarınızı giriniz.");
                return;
            }

            let cleanToken = tokenInp;
            const match = tokenInp.match(/MEBNORM\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
            if (match) cleanToken = match[0];

            if (typeof window !== 'undefined' && window.licenseManager) {
                const res = await window.licenseManager.activateLicense(cleanToken);
                if (res.success) {
                    alert("🎉 TEBRİKLER!\n\nLisansınız başarıyla aktifleştirildi.\nKurum: " + (res.status.okulAdi || 'Pro Kurum') + "\nTür: " + res.status.licenseType);
                    this.closeModal("license-modal");
                    window.location.reload();
                } else {
                    alert("❌ Lisans Doğrulama Başarısız:\n" + res.reason);
                }
            }
        });

        // Dosyadan Yükleme
        const fileInput = document.getElementById("file-lic-input");
        document.getElementById("btn-upload-lic-file")?.addEventListener("click", () => fileInput.click());
        fileInput?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById("inp-license-token").value = event.target.result;
            };
            reader.readAsText(file);
        });
    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIComponentManager };
}
if (typeof window !== 'undefined') {
    window.UIComponentManager = UIComponentManager;
}


// ==================== app.js ====================

// NormMatik — MEB Norm Kadro ve Ders Yükü Hesaplama Sistemi - Ana Uygulama Koordinatörü (app.js)

class MebNormApplication {
    constructor() {
        this.ui = new UIComponentManager(dbService, appState, normEngine, curriculumEngine);
        this.activeGradeFilter = "ALL";
        this.searchQuery = "";
        this.isResizingLeft = false;
        this.isResizingRight = false;
    }

    async init() {
        try {
            console.log("Uygulama başlatılıyor...");
            this.initTheme();
            if (typeof window !== 'undefined' && window.licenseManager) {
                await window.licenseManager.init();
            }
            await dbService.loadDatabase();

            normEngine.setBranchMatrix(dbService.getBranchMatrix());

            appState.loadLayout();
            const hasSavedState = appState.loadFromStorage();

            if (!hasSavedState || !appState.state.okulBilgisi.okulTuru) {
                this.ui.openSchoolSetupModal();
            }

            appState.subscribe(() => this.render());

            this.bindResizers();
            this.bindKeyboardShortcuts();

            this.render();
            console.log("Uygulama başarıyla hazır!");
        } catch (e) {
            console.error("Uygulama başlatma hatası:", e);
            alert("Uygulama başlatılamadı: " + e.message);
        }
    }

    initTheme() {
        let savedTheme = "light";
        try {
            savedTheme = localStorage.getItem("meb_norm_theme") || "light";
        } catch (e) {}
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        try {
            localStorage.setItem("meb_norm_theme", newTheme);
        } catch (e) {}
        this.renderHeader();
        this.ui.showToast(`${newTheme === 'dark' ? '🌙 Koyu (Gece)' : '☀️ Açık (Gündüz)'} temaya geçildi.`, "success");
    }

    bindKeyboardShortcuts() {
        window.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
                if (e.shiftKey) {
                    appState.redo();
                } else {
                    appState.undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
                appState.redo();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
                e.preventDefault();
                this.ui.openReportsModal("GRID");
            }
        });
    }

    bindResizers() {
        const resizerLeft = document.getElementById("resizer-left");
        const resizerRight = document.getElementById("resizer-right");

        resizerLeft?.addEventListener("mousedown", (e) => {
            this.isResizingLeft = true;
            resizerLeft.classList.add("resizing");
            document.body.style.cursor = "col-resize";
        });

        resizerRight?.addEventListener("mousedown", (e) => {
            this.isResizingRight = true;
            resizerRight.classList.add("resizing");
            document.body.style.cursor = "col-resize";
        });

        window.addEventListener("mousemove", (e) => {
            if (this.isResizingLeft) {
                const newWidth = Math.max(180, Math.min(550, e.clientX));
                appState.setLayout({ leftWidth: newWidth });
                const leftEl = document.getElementById("sidebar-left");
                if (leftEl) leftEl.style.width = `${newWidth}px`;
            } else if (this.isResizingRight) {
                const newWidth = Math.max(220, Math.min(650, window.innerWidth - e.clientX));
                appState.setLayout({ rightWidth: newWidth });
                const rightEl = document.getElementById("sidebar-right");
                if (rightEl) rightEl.style.width = `${newWidth}px`;
            }
        });

        window.addEventListener("mouseup", () => {
            if (this.isResizingLeft || this.isResizingRight) {
                this.isResizingLeft = false;
                this.isResizingRight = false;
                resizerLeft?.classList.remove("resizing");
                resizerRight?.classList.remove("resizing");
                document.body.style.cursor = "default";
            }
        });
    }

    render() {
        this.renderHeader();
        this.renderLeftSidebar();
        this.renderMiddleCanvas();
        this.renderRightNormPanel();
        this.applyLayoutStyles();
    }

    applyLayoutStyles() {
        const layout = appState.layout;
        const leftEl = document.getElementById("sidebar-left");
        const rightEl = document.getElementById("sidebar-right");
        const resizerLeft = document.getElementById("resizer-left");
        const resizerRight = document.getElementById("resizer-right");
        const expandLeft = document.getElementById("btn-expand-left");
        const expandRight = document.getElementById("btn-expand-right");

        if (leftEl) {
            leftEl.style.width = `${layout.leftWidth || 290}px`;
            if (layout.leftCollapsed) {
                leftEl.classList.add("collapsed");
                if (resizerLeft) resizerLeft.style.display = "none";
                if (expandLeft) expandLeft.style.display = "flex";
            } else {
                leftEl.classList.remove("collapsed");
                if (resizerLeft) resizerLeft.style.display = "flex";
                if (expandLeft) expandLeft.style.display = "none";
            }
        }

        if (rightEl) {
            rightEl.style.width = `${layout.rightWidth || 335}px`;
            if (layout.rightCollapsed) {
                rightEl.classList.add("collapsed");
                if (resizerRight) resizerRight.style.display = "none";
                if (expandRight) expandRight.style.display = "flex";
            } else {
                rightEl.classList.remove("collapsed");
                if (resizerRight) resizerRight.style.display = "flex";
                if (expandRight) expandRight.style.display = "none";
            }
        }
    }

    // --- 1. ÜST BAŞLIK (EXECUTIVE MARKET TERMINAL HEADER) RENDER ---
    renderHeader() {
        const headerEl = document.getElementById("app-header");
        if (!headerEl) return;

        const info = appState.state.okulBilgisi;
        const schoolTypes = dbService.getSchoolTypes();
        const currentType = schoolTypes.find(t => t.id === info.okulTuru) || { name: "Okul Türü Seçilmedi" };

        const seasons = ["2024-2025", "2025-2026", "2026-2027", "2027-2028", "2028-2029", "2029-2030"];
        const seasonOptionsHtml = seasons.map(s => `
            <option value="${s}" ${info.sezon === s ? 'selected' : ''}>${s}</option>
        `).join("");

        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const themeBtnText = currentTheme === "dark" ? "☀️" : "🌙";

        const schoolType = info.okulTuru || "";
        const isVocationalSchool = schoolType.includes("meslek") || schoolType.includes("teknik") || schoolType.includes("mtegm") || (appState.state.subeler || []).some(s => s.alanId);
        const headerStaffText = isVocationalSchool ? "🏢 Kadro & Koordinatörlük" : "👨‍🏫 Kadro Yönetimi";
        const headerStaffClass = isVocationalSchool ? "btn-staff-vocational" : "btn-staff-academic";
        const headerStaffTitle = isVocationalSchool ? "Kadrolu Öğretmen Sayıları ve 12. Sınıf İşletme Koordinatörlük Yükleri" : "Okul Kadrolu Öğretmen Sayıları ve Branş Dağılımı Yönetimi";

        headerEl.innerHTML = `
            <!-- 1. BÖLÜM: SİSTEM BAŞLIĞI (LOGOSUZ VE SADE) -->
            <div class="header-section-module section-logo">
                <div class="logo-badge-executive" style="padding-left: 0.35rem;">
                    <div class="logo-text-executive">
                        <span class="logo-brand-title">NormMatik™</span>
                        <span class="logo-brand-sub">MEB NORM KADRO & DERS YÜKÜ SİSTEMİ</span>
                    </div>
                </div>
            </div>
            
            <div class="header-terminal-divider"></div>

            <!-- 2. BÖLÜM: OKUL BİLGİLERİ -->
            <div class="header-section-module section-school-info">
                <div class="school-executive-cluster">
                    <div class="school-title-row">
                        <span class="school-title-executive" id="btn-edit-school-name" title="Tıklayıp Okul Bilgilerini Düzenleyin veya Okulu Değiştirin">
                            <span style="font-size: 1.25rem;">🏫</span> ${info.okulAdi || 'Okul Adı Belirtilmedi'} ${info.kurumKodu ? '<span style="font-size: 0.78rem; font-weight: 700; color: var(--primary); background: rgba(2, 132, 199, 0.12); padding: 0.15rem 0.45rem; border-radius: 6px; border: 1px solid rgba(2, 132, 199, 0.3);">[' + info.kurumKodu + ']</span>' : ''} <span class="edit-pen-icon">✏️</span>
                        </span>
                    </div>
                    <div class="school-meta-pills">
                        <div class="season-pill-box" title="Eğitim-Öğretim Sezonunu Değiştirin (Sınıf Atlatma & Sezon Devri)">
                            <span class="season-pill-icon">📅</span>
                            <select class="season-pill-select" id="season-selector">
                                ${seasonOptionsHtml}
                            </select>
                        </div>
                        <span class="school-type-tag" title="Okul türü kilitlidir. Değiştirmek için sıfırlayınız.">
                            📜 ${currentType.category || 'MEB'} • ${currentType.name}
                        </span>
                    </div>
                </div>
            </div>

            <div class="header-terminal-divider"></div>

            <!-- 3. BÖLÜM: KADRO YÖNETİMİ + RAPOR MERKEZİ -->
            <div class="header-section-module section-management-reports">
                <!-- Temiz Dairesel Geri / İleri Butonları (Yazısız) -->
                <div class="history-controls-minimal">
                    <button class="btn-history-circle" id="btn-undo" title="Son İşlemi Geri Al (Ctrl+Z)">
                        <span>↶</span>
                    </button>
                    <button class="btn-history-circle" id="btn-redo" title="Geri Alınan İşlemi Yinele (Ctrl+Y)">
                        <span>↷</span>
                    </button>
                </div>

                <button class="btn btn-sm ${headerStaffClass} btn-header-elevated" id="btn-header-staff" title="${headerStaffTitle}">
                    ${headerStaffText}
                </button>
                <button class="btn btn-sm btn-primary-gradient btn-header-elevated" id="btn-open-reports" title="MEB Norm Kadro & Ders Yükü Raporlama Merkezi (Master Grid, Yönetici İcmali, Norm Cetvelleri)">
                    🖨️ Raporlar
                </button>
            </div>

            <div class="header-terminal-divider"></div>

            <!-- 4. BÖLÜM: DİĞER KOMPONENTLER / SİSTEM ARAÇLARI -->
            <div class="header-section-module section-tools">
                <div class="header-toolbar-group">
                    <button class="btn btn-sm btn-header-tool" id="btn-open-license" style="background: rgba(14, 165, 233, 0.15); border: 1.5px solid #0284c7; color: var(--primary); font-weight: 800;" title="Lisans Durumu ve Aktivasyon">
                        🔑 Lisans
                    </button>
                    <button class="btn btn-sm btn-header-tool" id="btn-export-json" title="Projeyi Bilgisayarına JSON Olarak İndir">
                        💾 İndir
                    </button>
                    <button class="btn btn-sm btn-header-tool" id="btn-import-json" title="Kayıtlı Proje Dosyasını Aç">
                        📂 Yükle
                    </button>
                    <input type="file" id="file-import-json" accept=".json" style="display:none;">
                    <button class="btn btn-sm btn-header-tool" id="btn-update-db" title="Yeni Yıl MEB Veri Tabanı Dosyası Yükle (Müfredat Güncelle)">
                        📚 DB
                    </button>
                    <input type="file" id="file-import-db" accept=".json" style="display:none;">
                    <button class="btn btn-sm btn-header-tool" id="btn-open-kvkk" title="6698 Sayılı KVKK Aydınlatma Metni ve Veri Güvenliği">
                        ⚖️ KVKK
                    </button>
                    <button class="theme-toggle-btn" id="btn-theme-toggle" title="Açık / Koyu Tema Geçişi">
                        ${themeBtnText}
                    </button>
                    <button class="btn btn-sm btn-danger-outline" id="btn-reset-school" title="Okulu Sıfırla ve Yeniden Başlat">
                        🔄 Sıfırla
                    </button>
                </div>
            </div>
        `;

        document.getElementById("btn-open-license")?.addEventListener("click", () => {
            this.ui.openLicenseModal();
        });

        document.getElementById("btn-header-staff")?.addEventListener("click", () => {
            this.ui.openTeacherStaffModal();
        });

        document.getElementById("btn-open-reports")?.addEventListener("click", () => {
            this.ui.openReportsModal("GRID");
        });

        document.getElementById("btn-open-kvkk")?.addEventListener("click", () => {
            this.ui.openKvkkModal("AYDINLATMA");
        });

        document.getElementById("btn-theme-toggle")?.addEventListener("click", () => this.toggleTheme());

        document.getElementById("btn-edit-school-name")?.addEventListener("click", () => {
            this.ui.openEditSchoolInfoModal();
        });

        document.getElementById("season-selector")?.addEventListener("change", (e) => {
            const newSeason = e.target.value;
            this.ui.openSeasonRolloverModal(newSeason);
        });

        document.getElementById("btn-undo")?.addEventListener("click", () => appState.undo());
        document.getElementById("btn-redo")?.addEventListener("click", () => appState.redo());
        document.getElementById("btn-reset-school")?.addEventListener("click", () => this.ui.openResetSchoolConfirmModal());

        document.getElementById("btn-export-json")?.addEventListener("click", () => {
            const jsonStr = appState.exportProjectJSON();
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${info.okulAdi.replace(/\s+/g, '_')}_norm_plani_${info.sezon}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.ui.showToast("Proje JSON dosyası indirildi.", "success");
        });

        const fileInput = document.getElementById("file-import-json");
        document.getElementById("btn-import-json")?.addEventListener("click", () => fileInput.click());
        fileInput?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const ok = appState.importProjectJSON(event.target.result);
                if (ok) {
                    this.ui.showToast("Proje başarıyla yüklendi!", "success");
                } else {
                    alert("Geçersiz proje dosyası.");
                }
            };
            reader.readAsText(file);
        });

        const dbFileInput = document.getElementById("file-import-db");
        document.getElementById("btn-update-db")?.addEventListener("click", () => dbFileInput.click());
        dbFileInput?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const ok = dbService.updateDatabaseFromJSON(event.target.result);
                if (ok) {
                    normEngine.setBranchMatrix(dbService.getBranchMatrix());
                    this.render();
                    this.ui.showToast("Yeni MEB Veri Tabanı başarıyla yüklendi ve güncellendi!", "success");
                } else {
                    alert("Geçersiz MEB veri tabanı JSON dosyası.");
                }
            };
            reader.readAsText(file);
        });
    }

    getTargetWeeklyHours(section, schoolType) {
        if (section?.isSpecialEdu || (section?.subeAdi && section.subeAdi.includes("Özel Eğt")) || section?.alanId === "ozel_egitim") {
            return 30; // MEB Özel Eğitim Hizmetleri Yön. Md. 28 Haftalık Standart Yük
        }
        return dbService.getOfficialTargetHours(schoolType, section?.sinifSeviyesi, section?.alanId);
    }

    // --- 2. SOL PANEL (ŞUBE LİSTESİ) RENDER ---
    renderLeftSidebar() {
        const sidebarEl = document.getElementById("sidebar-left");
        if (!sidebarEl) return;

        // Kaydırma (Scroll) ve Arama Odağı (Focus) Konumunu Koru
        const currentListEl = sidebarEl.querySelector(".sections-list");
        const prevScrollTop = currentListEl ? currentListEl.scrollTop : (this.lastSidebarScrollTop || 0);

        const searchInput = document.getElementById("section-search-input");
        const hadSearchFocus = document.activeElement === searchInput;
        const cursorStart = searchInput?.selectionStart;
        const cursorEnd = searchInput?.selectionEnd;

        const subeler = appState.state.subeler || [];
        const aktifId = appState.state.aktifSubeId;
        const schoolType = appState.state.okulBilgisi.okulTuru;

        let filtered = subeler;
        if (this.activeGradeFilter !== "ALL") {
            filtered = filtered.filter(s => s.sinifSeviyesi === this.activeGradeFilter);
        }
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(s => s.subeAdi.toLowerCase().includes(q) || (s.dalAdi && s.dalAdi.toLowerCase().includes(q)));
        }

        const sectionsHtml = filtered.map(s => {
            const totalHours = [...s.zorunluDersler, ...s.secmeliDersler].reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
            const targetHours = this.getTargetWeeklyHours(s, schoolType);
            const isActive = s.id === aktifId;
            const hourStatus = totalHours === targetHours ? 'status-ok' : (totalHours > targetHours ? 'status-over' : 'status-under');
            const isSpecialEdu = !!s.isSpecialEdu || (s.subeAdi && s.subeAdi.includes("Özel Eğt")) || (s.dalAdi && s.dalAdi.includes("Özel Eğit")) || s.alanId === "ozel_egitim";
            
            let dalText = "";
            if (isSpecialEdu) {
                dalText = "🟣 Özel Eğitim Sınıfı";
            } else {
                const areaObj = s.alanId ? dbService.getVocationalAreas().find(a => a.id === s.alanId) : null;
                const areaName = areaObj ? areaObj.name.replace(/ Alanı$/i, '') : "";
                if (s.dalAdi && areaName) {
                    dalText = `${areaName} • ${s.dalAdi}`;
                } else if (s.dalAdi) {
                    dalText = s.dalAdi;
                } else if (areaName) {
                    dalText = areaName;
                } else {
                    dalText = String(s.sinifSeviyesi).toLowerCase() === 'hazirlik' ? 'Hazırlık Sınıfı' : s.sinifSeviyesi + '. Sınıf (Genel)';
                }
            }

            const gradeClass = isSpecialEdu ? 'card-grade-special-edu' : ('card-grade-' + String(s.sinifSeviyesi || '').toLowerCase());
            return `
                <div class="section-card ${gradeClass} ${isActive ? 'active' : ''}" data-id="${s.id}">
                    <div class="sec-card-header">
                        <div class="sec-card-title-wrap">
                            <span class="sec-card-name">${s.subeAdi}</span>
                        </div>
                        <span class="sec-chip-badge student-chip">${s.ogrenciSayisi} Öğr</span>
                    </div>
                    <div class="sec-card-subline">
                        <span class="sec-chip-badge dal-chip" title="${dalText}">${dalText}</span>
                    </div>
                    <div class="sec-chips-bottom">
                        <span class="sec-chip-badge hour-chip ${hourStatus}" title="Haftalık Ders Saati Durumu">
                            <span class="chip-pulse-dot"></span> ${totalHours} / ${targetHours} Saat
                        </span>
                        <div class="sec-action-chips">
                            <button class="sec-action-btn btn-edit-sec" data-id="${s.id}" title="Şubeyi Düzenle">✏️</button>
                            <button class="sec-action-btn split btn-split-sec" data-id="${s.id}" title="Şubeyi 2 veya 3'e Böl">✂️</button>
                            <button class="sec-action-btn btn-duplicate-sec" data-id="${s.id}" title="Şubeyi Kopyala">📋</button>
                            <button class="sec-action-btn delete btn-delete-sec" data-id="${s.id}" title="Şubeyi Sil">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        const types = dbService.getSchoolTypes();
        const typeInfo = types.find(t => t.id === schoolType) || { gradeLevels: ["9", "10", "11", "12"] };
        const gradeLevels = typeInfo.gradeLevels || ["9", "10", "11", "12"];

        const gradeTabsHtml = `
            <button class="grade-tab-btn ${this.activeGradeFilter === 'ALL' ? 'active' : ''}" data-grade="ALL">Tümü</button>
            ${gradeLevels.map(g => `
                <button class="grade-tab-btn ${this.activeGradeFilter === g ? 'active' : ''}" data-grade="${g}">
                    ${g === 'hazirlik' ? 'Hazırlık' : g + '. Sınıf'}
                </button>
            `).join('')}
        `;

        sidebarEl.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-title-row">
                    <span class="sidebar-title">📋 Şubeler (${subeler.length})</span>
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                        <button class="btn btn-sm btn-primary" id="btn-open-single-add" title="Tek Şube Ekle (Manuel İsim/Alan)">+ Şube</button>
                        <button class="btn btn-sm btn-outline" id="btn-open-bulk-wizard" title="Toplu Şube Üretici">⚡ Toplu</button>
                        <button class="btn btn-sm btn-success" id="btn-open-eokul-import" title="e-Okul Excel'den Otomatik Yükle" style="background: #059669; color: #fff; border: none; font-weight: 600; padding: 0.25rem 0.5rem; font-size: 0.78rem;">📥 e-Okul</button>
                        <button class="btn-panel-toggle" id="btn-collapse-left" title="Sol Şube Panelini Kapat (Sola Gizle)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="11 17 6 12 11 7"></polyline>
                                <polyline points="18 17 13 12 18 7"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="grade-tabs-container">
                    ${gradeTabsHtml}
                </div>
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" class="search-input" id="section-search-input" placeholder="Şube veya alan ara..." value="${this.searchQuery}">
                </div>
            </div>
            <div class="sections-list">
                ${sectionsHtml.length > 0 ? sectionsHtml : '<div style="text-align:center; padding: 2rem; color: var(--text-muted); font-size: 0.85rem;">Henüz şube eklenmedi. "+ Şube" veya "📥 e-Okul" butonuna basarak ekleyebilirsiniz.</div>'}
            </div>
        `;

        // Kaydırma Konumunu (Scroll Position) Anında Geri Yükle & Kaydet
        const newListEl = sidebarEl.querySelector(".sections-list");
        if (newListEl) {
            if (prevScrollTop > 0) {
                newListEl.scrollTop = prevScrollTop;
            }
            newListEl.addEventListener("scroll", () => {
                this.lastSidebarScrollTop = newListEl.scrollTop;
            }, { passive: true });
        }

        // Arama Kutusu Odağını Geri Yükle
        if (hadSearchFocus) {
            const newSearchInput = document.getElementById("section-search-input");
            if (newSearchInput) {
                newSearchInput.focus();
                if (cursorStart !== undefined && cursorEnd !== undefined) {
                    newSearchInput.setSelectionRange(cursorStart, cursorEnd);
                }
            }
        }

        document.getElementById("btn-open-single-add")?.addEventListener("click", () => this.ui.openAddSectionModal());
        document.getElementById("btn-open-bulk-wizard")?.addEventListener("click", () => this.ui.openBulkSectionWizard());
        document.getElementById("btn-open-eokul-import")?.addEventListener("click", () => this.ui.openEOkulImportModal());
        document.getElementById("btn-collapse-left")?.addEventListener("click", () => {
            appState.setLayout({ leftCollapsed: true });
            this.applyLayoutStyles();
        });

        document.querySelectorAll(".grade-tab-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.activeGradeFilter = e.currentTarget.dataset.grade;
                this.renderLeftSidebar();
            });
        });

        document.getElementById("section-search-input")?.addEventListener("input", (e) => {
            this.searchQuery = e.target.value;
            this.renderLeftSidebar();
        });

        document.querySelectorAll(".section-card").forEach(card => {
            card.addEventListener("click", (e) => {
                if (e.target.closest("button")) return;
                const id = card.dataset.id;
                // Kart tıklandığında mevcut scroll konumunu garantiye al
                if (newListEl) {
                    this.lastSidebarScrollTop = newListEl.scrollTop;
                }
                appState.setActiveSection(id);
                // Mobilde şube tıklandığında otomatik Orta Panel Dersler sekmesine geç
                if (window.innerWidth <= 768) {
                    document.body.setAttribute('data-mobile-tab', 'courses');
                    document.querySelectorAll('.mobile-nav-btn').forEach(b => {
                        b.classList.toggle('active', b.getAttribute('data-target-tab') === 'courses');
                    });
                }
            });
        });

        document.querySelectorAll(".btn-edit-sec").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const sec = subeler.find(s => s.id === btn.dataset.id);
                if (sec) this.ui.openAddSectionModal(sec);
            });
        });

        document.querySelectorAll(".btn-split-sec").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const sec = subeler.find(s => s.id === btn.dataset.id);
                if (sec) this.ui.openSplitSectionModal(sec);
            });
        });

        document.querySelectorAll(".btn-duplicate-sec").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                appState.duplicateSection(btn.dataset.id);
            });
        });

        document.querySelectorAll(".btn-delete-sec").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm("Bu şubeyi silmek istediğinizden emin misiniz?")) {
                    appState.deleteSection(btn.dataset.id);
                }
            });
        });
    }

    // --- 3. ORTA PANEL (PRIMARY FOCUS CANVAS - ROWSPAN İLE DİKEY KATEGORİLİ TEK TABLO) ---
    renderMiddleCanvas() {
        const canvasEl = document.getElementById("middle-canvas");
        if (!canvasEl) return;

        const activeSec = appState.getActiveSection();

        if (!activeSec) {
            canvasEl.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-muted); gap: 1rem; text-align: center; padding: 2rem;">
                    <span style="font-size: 3.5rem;">📚</span>
                    <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main, #0f172a);">Lütfen sol panelden bir şube seçin veya yeni şube ekleyin.</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); max-width: 450px;">
                        e-Okul Excel dosyanız varsa tek tıkla tüm okulu kurabilir veya manuel ekleme yapabilirsiniz.
                    </div>
                    <div style="display:flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-top: 0.5rem;">
                        <button class="btn btn-primary" id="btn-empty-add-single">+ Tek Şube Ekle</button>
                        <button class="btn btn-outline" id="btn-empty-add-wizard">⚡ Toplu Şube Sihirbazı</button>
                        <button class="btn btn-success" id="btn-empty-add-eokul" style="background: #059669; color: #fff; border: none; font-weight: 600; padding: 0.5rem 1rem;">📥 e-Okul Excel'den Otomatik Kur</button>
                    </div>
                </div>
            `;
            document.getElementById("btn-empty-add-single")?.addEventListener("click", () => this.ui.openAddSectionModal());
            document.getElementById("btn-empty-add-wizard")?.addEventListener("click", () => this.ui.openBulkSectionWizard());
            document.getElementById("btn-empty-add-eokul")?.addEventListener("click", () => this.ui.openEOkulImportModal());
            return;
        }

        const schoolType = appState.state.okulBilgisi.okulTuru;
        const targetHours = this.getTargetWeeklyHours(activeSec, schoolType);

        let zorunluList = activeSec.zorunluDersler || [];
        const secmeliList = activeSec.secmeliDersler || [];
        const branches = dbService.getAllBranches();

        // Mükerrer Rehberlik engelleme & tekil liste (Türkçe küçük harf kontrolü)
        let seenRehberlik = false;
        zorunluList = zorunluList.filter(d => {
            const name = String(d.ders || d.ders_adi || "").toLowerCase();
            if (name.includes("rehberlik") || name.includes("rehberlık")) {
                if (seenRehberlik) return false;
                seenRehberlik = true;
                d.ders = "Rehberlik ve Yönlendirme";
                d.saat = 1;
                return true;
            }
            return true;
        });
        activeSec.zorunluDersler = zorunluList;

        // Dersleri Kategorilerine Göre Grupla
        const isRehberlikCourse = (c) => {
            const name = String(c.ders || c.ders_adi || "").toLowerCase();
            return name.includes("rehberlik") || name.includes("rehberlık");
        };

        const isMeslekCourse = (c) => {
            if (isRehberlikCourse(c)) return false;
            const rawKat = (c.kategori || "").toUpperCase();
            return rawKat.includes("ALAN") || rawKat.includes("MESLEK") || rawKat.includes("DAL") || c.isAtolye;
        };

        const ortakCourses = zorunluList.filter(d => !isMeslekCourse(d) && !isRehberlikCourse(d));
        const meslekCourses = zorunluList.filter(d => isMeslekCourse(d));
        const secmeliCourses = secmeliList.map(d => ({ ...d, isElective: true }));
        const rehberlikCourses = zorunluList.filter(d => isRehberlikCourse(d));

        const totalHours = [...ortakCourses, ...meslekCourses, ...secmeliCourses, ...rehberlikCourses].reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
        const ortakHours = ortakCourses.reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
        const meslekHours = meslekCourses.reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
        const secmeliHours = secmeliCourses.reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
        const rehberlikHours = rehberlikCourses.reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);

        let statusState = "success";
        let statusHoursText = `${totalHours} / ${targetHours} Saat`;
        let statusBadgeTitle = "Tamamlandı";
        let statusBadgeSub = "Haftalık Yük Tam";

        if (totalHours < targetHours) {
            statusState = "warning";
            statusHoursText = `${totalHours} / ${targetHours} Saat`;
            statusBadgeTitle = `${targetHours - totalHours} Saat Eksik`;
            statusBadgeSub = "Seçmeli Ders";
        } else if (totalHours > targetHours) {
            statusState = "danger";
            statusHoursText = `${totalHours} / ${targetHours} Saat`;
            statusBadgeTitle = `+${totalHours - targetHours} Saat Fazla`;
            statusBadgeSub = "Ders Yükü Aşımı";
        }

        const currentCategoryFilter = this.activeCategoryFilter || "ALL";

        // 4 Kategori Grubu
        const categoryGroups = [
            { type: "ortak", icon: "📘", title: "Zorunlu Ortak Dersler", shortTitle: "ORTAK", hours: ortakHours, list: ortakCourses, isElective: false },
            { type: "meslek", icon: "🟣", title: "Alan ve Dal Meslek Dersleri", shortTitle: "MESLEK", hours: meslekHours, list: meslekCourses, isElective: false },
            { type: "secmeli", icon: "📙", title: "Seçmeli Dersler", shortTitle: "SEÇMELİ", hours: secmeliHours, list: secmeliCourses, isElective: true },
            { type: "rehberlik", icon: "🧭", title: "Rehberlik ve Yönlendirme", shortTitle: "REHBERLİK", hours: rehberlikHours, list: rehberlikCourses, isElective: false }
        ];

        // Segmented Tabs Toolbar
        const filterTabsHtml = `
            <button class="category-filter-btn tab-all ${currentCategoryFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">
                <span class="tab-icon">📋</span> Tüm Dersler <span class="tab-hour-badge">${totalHours}</span>
            </button>
            <button class="category-filter-btn tab-ortak ${currentCategoryFilter === 'ortak' ? 'active' : ''}" data-filter="ortak">
                <span class="tab-icon">📘</span> Ortak <span class="tab-hour-badge">${ortakHours}</span>
            </button>
            ${meslekHours > 0 ? `
                <button class="category-filter-btn tab-meslek ${currentCategoryFilter === 'meslek' ? 'active' : ''}" data-filter="meslek">
                    <span class="tab-icon">🟣</span> Meslek <span class="tab-hour-badge">${meslekHours}</span>
                </button>
            ` : ''}
            <button class="category-filter-btn tab-secmeli ${currentCategoryFilter === 'secmeli' ? 'active' : ''}" data-filter="secmeli">
                <span class="tab-icon">📙</span> Seçmeli <span class="tab-hour-badge">${secmeliHours}</span>
            </button>
            <button class="category-filter-btn tab-rehberlik ${currentCategoryFilter === 'rehberlik' ? 'active' : ''}" data-filter="rehberlik">
                <span class="tab-icon">🧭</span> Rehberlik <span class="tab-hour-badge">${rehberlikHours}</span>
            </button>
        `;

        let tableBodyRowsHtml = "";
        const isFilteringAll = currentCategoryFilter === "ALL";
        let courseSequenceNumber = 0;

        categoryGroups.forEach(grp => {
            const hasCourses = grp.list.length > 0;
            const isSecmeli = grp.type === "secmeli";
            const isRelevant = hasCourses || (isSecmeli && (isFilteringAll || currentCategoryFilter === "secmeli"));

            if (isRelevant) {
                if (isFilteringAll || currentCategoryFilter === grp.type) {
                    if (isFilteringAll || (!hasCourses && currentCategoryFilter === grp.type)) {
                        let targetHintHtml = "";
                        if (isSecmeli) {
                            const expectedElectiveHours = Math.max(0, targetHours - ortakHours - meslekHours - rehberlikHours);
                            if (expectedElectiveHours > 0 || secmeliHours > 0) {
                                targetHintHtml = `<span class="category-target-badge ${secmeliHours >= expectedElectiveHours && expectedElectiveHours > 0 ? 'badge-complete' : (expectedElectiveHours === 0 ? 'badge-complete' : 'badge-pending')}">Seçilen: ${secmeliHours} / Hedef: ${expectedElectiveHours} Saat</span>`;
                            }
                        }

                        tableBodyRowsHtml += `
                            <tr class="category-divider-row cat-${grp.type}">
                                <td colspan="6">
                                    <div class="category-divider-content">
                                        <div class="category-divider-left">
                                            <span class="category-divider-icon">${grp.icon}</span>
                                            <span class="category-divider-title">${grp.title.toUpperCase()}</span>
                                        </div>
                                        <div class="category-divider-right">
                                            ${targetHintHtml}
                                            <span class="category-divider-hours">${grp.hours} Saat</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }

                    if (hasCourses) {
                        grp.list.forEach((c, idx) => {
                            const isFirstInGroup = (idx === 0);
                            courseSequenceNumber++;
                            tableBodyRowsHtml += this.renderCourseRow(c, activeSec, branches, grp.isElective, schoolType, isFirstInGroup, grp, courseSequenceNumber);
                        });
                    } else if (isSecmeli) {
                        tableBodyRowsHtml += `
                            <tr class="empty-category-row">
                                <td colspan="6" style="text-align: center; padding: 0.65rem 1rem; background: rgba(245, 158, 11, 0.03); border-left: 3.5px dashed #f59e0b; color: var(--text-muted); font-size: 0.78rem;">
                                    <span>Bu şube için henüz seçmeli ders seçilmedi.</span>
                                    <button class="btn btn-sm btn-primary inline-open-elective-btn" style="margin-left: 0.75rem; font-size: 0.72rem; padding: 0.15rem 0.55rem; border-radius: 6px;">
                                        ✨ + Seçmeli Ders Ekle
                                    </button>
                                </td>
                            </tr>
                        `;
                    }
                }
            }
        });

        const activeAreaObj = activeSec.alanId ? dbService.getVocationalAreas().find(a => a.id === activeSec.alanId) : null;
        const activeAreaName = activeAreaObj ? activeAreaObj.name.replace(/ Alanı$/i, '') : "";

        const schoolTypeMap = {
            'mesleki_ve_teknik_anadolu_lisesi': 'MTAL (AMP)',
            'anadolu_lisesi': 'Anadolu Lisesi',
            'fen_lisesi': 'Fen Lisesi',
            'imam_hatip_lisesi': 'İmam Hatip Lisesi',
            'mesleki_egitim_merkezi': 'MESEM',
            'guzel_sanatlar_lisesi': 'Güzel Sanatlar Lisesi',
            'spor_lisesi': 'Spor Lisesi',
            'sosyal_bilimler_lisesi': 'Sosyal Bilimler Lisesi',
            'ozel_egitim_meslek_okulu': 'Özel Eğitim Meslek Okulu'
        };
        const schoolTypeShort = schoolTypeMap[schoolType] || 'Ortaöğretim';
        const gradeDisplay = String(activeSec.sinifSeviyesi).toLowerCase() === 'hazirlik' ? 'Hazırlık' : `${activeSec.sinifSeviyesi}. Sınıf`;
        const isSpecialEduSec = !!activeSec.isSpecialEdu || (activeSec.subeAdi && activeSec.subeAdi.includes("Özel Eğt")) || (activeSec.dalAdi && activeSec.dalAdi.includes("Özel Eğit")) || activeSec.alanId === "ozel_egitim";

        canvasEl.innerHTML = `
            <!-- SABİT KART BAŞLIĞI: 2 KATMANLI MASTER HERO BANNER & KONTROL TOOLBARI -->
            <div class="canvas-hero-wrapper">
                <!-- 1. KATMAN: ŞUBE KİMLİĞİ, HİYERARŞİK YOL & TELEMETRİ HUD -->
                <div class="section-hero-banner">
                    <!-- SOL: BÜYÜK AVATAR + BAŞLIK + HİYERARŞİK KURUMSAL YOL -->
                    <div class="hero-identity-main">
                        <div class="hero-avatar-box" title="${activeSec.subeAdi} - ${gradeDisplay}">
                            <span class="hero-avatar-icon">🏫</span>
                            <span class="hero-grade-tag">${gradeDisplay}</span>
                        </div>
                        <div class="hero-identity-details">
                            <div class="hero-title-row">
                                <h1 class="hero-section-title" title="${activeSec.subeAdi}">${activeSec.subeAdi}</h1>
                                <span class="hero-student-pill" title="Şube Mevcudu: ${activeSec.ogrenciSayisi} Öğrenci">
                                    👥 <strong>${activeSec.ogrenciSayisi}</strong> Öğr
                                </span>
                                <div class="hero-title-btn-group">
                                    <button class="hero-btn-pill" id="btn-edit-active-sec" title="Şube ve Dal Bilgilerini Düzenle">
                                        <span>✏️ Düzenle</span>
                                    </button>
                                    <button class="hero-btn-pill split" id="btn-split-active-sec" title="Şubeyi 2 veya 3'e Böl (Mevcut/Dal Bölünmesi)">
                                        <span>✂️ Böl</span>
                                    </button>
                                    <button class="hero-btn-pill copy" id="btn-duplicate-active-sec" title="Şubeyi Birebir Kopyala">
                                        <span>📋 Kopyala</span>
                                    </button>
                                </div>
                            </div>

                            <!-- HİYERARŞİK KURUMSAL YOL (BREADCRUMB) -->
                            <div class="hero-hierarchy-path">
                                <span class="path-badge school" title="Okul Türü">${schoolTypeShort}</span>
                                <span class="path-divider">/</span>
                                <span class="path-badge grade">${gradeDisplay}</span>
                                ${isSpecialEduSec ? `
                                    <span class="path-divider">/</span>
                                    <span class="path-badge special" title="Özel Eğitim Sınıfı">
                                        <span class="path-icon">🟣</span> Özel Eğitim (Md. 17/1-c)
                                    </span>
                                ` : ''}
                                ${activeAreaName ? `
                                    <span class="path-divider">/</span>
                                    <span class="path-badge area" title="Meslek Alanı: ${activeAreaName}">
                                        <span class="path-icon">🏛️</span> <strong>Alan:</strong> ${activeAreaName}
                                    </span>
                                ` : ''}
                                ${activeSec.dalAdi ? `
                                    <span class="path-divider">➔</span>
                                    <span class="path-badge dal" title="Meslek Dalı: ${activeSec.dalAdi}">
                                        <span class="path-icon">⚙️</span> <strong>Dal:</strong> ${activeSec.dalAdi}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- SAĞ: TELEMETRİ KARTI & SEÇMELİ DERS BUTONU -->
                    <div class="hero-telemetry-block">
                        <div class="neon-status-card ${statusState}" title="Haftalık Toplam Ders Saati: ${totalHours} / ${targetHours} Saat (${statusBadgeTitle} - ${statusBadgeSub})">
                            <div class="neon-status-left">
                                <div class="neon-status-header">
                                    <span class="neon-status-dot ${statusState}"></span>
                                    <span class="neon-status-title">Haftalık Yük</span>
                                </div>
                                <div class="metric-value">⏱️ ${statusHoursText}</div>
                            </div>
                            <div class="metric-badge-stacked ${statusState}">
                                <span class="badge-row-top">${statusBadgeTitle}</span>
                                <span class="badge-row-sub">${statusBadgeSub}</span>
                            </div>
                        </div>
                        <button class="neon-action-btn" id="btn-open-elective-drawer" title="Şubeye Yeni Seçmeli Ders Ekle">
                            <span class="action-btn-sparkle">✨</span>
                            <span>+ Seçmeli Ders</span>
                        </button>
                    </div>
                </div>

                <!-- 2. KATMAN: KATEGORİ FİLTRE SEKMELERİ (TEK VE KOMPAKT SATIR) -->
                <div class="unified-card-toolbar">
                    <div class="category-filter-tabs">
                        ${filterTabsHtml}
                    </div>
                </div>
            </div>

            <!-- SCROLLABLE TABLO GÖVDESİ -->
            <div class="canvas-content-scroll">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th style="width: 44px; min-width: 44px; max-width: 48px; text-align: center;">No</th>
                            <th style="width: 36%;">Ders Adı</th>
                            <th style="width: 15%; text-align: center;">Haftalık Saat</th>
                            <th style="width: 24%;">Atanan Branş</th>
                            <th style="width: 14%; text-align: center;">Sınıf Birleştirme</th>
                            <th style="width: 7%; text-align: center;">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableBodyRowsHtml.length > 0 ? tableBodyRowsHtml : `
                            <tr>
                                <td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
                                    Bu kategoride ders bulunmuyor.
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;

        document.querySelectorAll(".category-filter-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.activeCategoryFilter = e.currentTarget.dataset.filter;
                this.renderMiddleCanvas();
            });
        });

        document.getElementById("btn-edit-active-sec")?.addEventListener("click", () => {
            this.ui.openAddSectionModal(activeSec);
        });

        document.getElementById("btn-split-active-sec")?.addEventListener("click", () => {
            this.ui.openSplitSectionModal(activeSec);
        });

        document.getElementById("btn-duplicate-active-sec")?.addEventListener("click", () => {
            appState.duplicateSection(activeSec.id);
            this.ui.showToast(`📋 ${activeSec.subeAdi} şubesi başarıyla kopyalandı!`, "success");
            this.renderAll();
        });

        document.getElementById("btn-open-elective-drawer")?.addEventListener("click", () => {
            this.ui.openElectiveCourseDrawer(activeSec);
        });

        document.querySelectorAll(".inline-open-elective-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                this.ui.openElectiveCourseDrawer(activeSec);
            });
        });

        document.querySelectorAll(".branch-select").forEach(select => {
            select.addEventListener("change", (e) => {
                const cName = e.currentTarget.dataset.course;
                const newBranch = e.currentTarget.value;
                appState.updateCourseBranch(activeSec.id, cName, newBranch);
                this.ui.showToast(`🎯 "${cName}" branşı "${newBranch || 'Atanmadı'}" olarak güncellendi.`, "success");
            });
        });

        document.querySelectorAll(".btn-open-merge-modal").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const cName = e.currentTarget.dataset.course;
                this.ui.openCourseMergeModal(activeSec, cName);
            });
        });

        document.querySelectorAll(".btn-remove-elective").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const cName = e.currentTarget.dataset.course;
                appState.removeElectiveCourse(activeSec.id, cName);
                this.ui.showToast(`🗑️ "${cName}" seçmeli dersi şubeden kaldırıldı.`, "success");
            });
        });
    }

    renderCourseRow(course, section, branches, isElective = false, schoolType = "", isFirstInGroup = false, grp = null, rowNumber = 1) {
        const rawCName = course.ders || course.ders_adi;
        const hours = parseInt(course.saat || course.ders_saati || 0, 10);
        
        let cName = rawCName;
        let assignedBranch = course.atananBrans;

        if (window.curriculumEngine && typeof window.curriculumEngine.getCanonicalCourseAndBranch === 'function') {
            const resolved = window.curriculumEngine.getCanonicalCourseAndBranch(rawCName, assignedBranch, section.alanId || section.alanAdi, course.kategori);
            cName = resolved.courseName;
            assignedBranch = resolved.branchName;
        } else if (window.curriculumEngine && typeof window.curriculumEngine.toTurkishTitleCase === 'function') {
            cName = window.curriculumEngine.toTurkishTitleCase(rawCName);
        }
        
        if (assignedBranch === "— Branş Atanmadı —" || assignedBranch === "Diğer" || assignedBranch === "") {
            assignedBranch = "";
        }

        const isUnassigned = !assignedBranch || assignedBranch.trim() === "";
        const isBaraj = !!course.baraj_ders;

        const mergedList = course.birlesikSubeler || [];
        const isMerged = mergedList.length > 0;

        const normAssigned = (assignedBranch || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        let hasSelectedOption = false;
        const optionsList = branches.map(b => {
            const bNorm = b.brans_adi.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            const isMatch = !isUnassigned && (
                assignedBranch === b.brans_adi || 
                normAssigned === bNorm || 
                (normAssigned.includes("rehberlik") && bNorm === "rehberlik") ||
                (normAssigned.includes("bilisim") && bNorm.includes("bilisim")) ||
                (normAssigned.includes("elektrik") && bNorm.includes("elektrik")) ||
                (normAssigned.includes("makine") && bNorm.includes("makine")) ||
                (normAssigned.includes("turkdili") && bNorm.includes("turkdili"))
            );
            if (isMatch && !hasSelectedOption) {
                hasSelectedOption = true;
                return `<option value="${b.brans_adi}" selected>${b.brans_adi}</option>`;
            }
            return `<option value="${b.brans_adi}">${b.brans_adi}</option>`;
        }).join("");

        const branchOptionsHtml = `
            <option value="" ${(!hasSelectedOption || isUnassigned) ? 'selected' : ''}>— Branş Atanmadı —</option>
            ${optionsList}
        `;

        const mergedSectionsNames = mergedList.map(id => {
            const sec = appState.state.subeler.find(s => s.id === id);
            return sec ? sec.subeAdi : "";
        }).filter(Boolean).join(", ");

        const mult = normEngine.evaluateCourseMultiplier(course, section.ogrenciSayisi || 30, schoolType);
        
        let loadInfoHtml = "";
        let badgeHtml = "";

        if (isUnassigned) {
            loadInfoHtml = `
                <div class="course-hours-wrapper">
                    <span class="course-hours-unassigned">${hours} Saat</span>
                </div>
            `;
            badgeHtml = `
                <span class="unassigned-badge" title="Bu derse henüz branş atanmadı.">
                    ⚪ Branş Atanmadı
                </span>
            `;
        } else {
            loadInfoHtml = mult.groupCount > 1 ? `
                <div class="course-hours-wrapper">
                    <span class="course-hours-value">${hours} Saat</span>
                    <span class="group-multiplier-pill" title="${mult.note}">(${mult.groupCount} Grup)</span>
                </div>
            ` : `
                <div class="course-hours-wrapper">
                    <span class="course-hours-value">${hours} Saat</span>
                </div>
            `;
        }

        let electiveThemeBadgeHtml = "";
        if (isElective && this.ui && typeof this.ui.getElectiveThemeInfo === 'function') {
            const tInfo = this.ui.getElectiveThemeInfo({
                ders: cName,
                isVocational: !!(course.isVocational || course.isElectiveVocational || (course.kategori || '').includes('MESLEK')),
                grup: course.grup || course.kategori
            });
            if (tInfo) {
                electiveThemeBadgeHtml = `<span class="${tInfo.badgeClass}" style="font-size: 0.65rem; font-weight: 700; padding: 0.08rem 0.4rem; border-radius: var(--radius-full);">${tInfo.badge}</span>`;
            }
        }

        const badgeCategoryClass = isElective ? 'badge-secmeli' : ((course.kategori || '').includes('MESLEK') || course.isVocational ? 'badge-meslek' : 'badge-ortak');

        return `
            <tr class="course-row ${isElective ? 'is-elective-row' : ''}">
                <td class="course-index-cell">
                    <span class="course-index-badge ${badgeCategoryClass}">${rowNumber}</span>
                </td>
                <td class="course-name-cell">
                    <div class="course-name-wrapper">
                        <span class="course-title">${cName}</span>
                        ${electiveThemeBadgeHtml}
                        ${isBaraj ? '<span class="baraj-pill" title="Baraj Ders (Sınıf Geçme Şartı)">BARAJ</span>' : ''}
                        ${badgeHtml}
                    </div>
                </td>
                <td class="course-hours-cell">
                    ${loadInfoHtml}
                </td>
                <td class="course-branch-cell">
                    <div class="course-branch-wrapper">
                        <select class="branch-select" data-course="${cName}">
                            ${branchOptionsHtml}
                        </select>
                    </div>
                </td>
                <td class="course-merge-cell">
                    <div class="course-merge-wrapper">
                        <button class="merge-btn ${isMerged ? 'active' : ''} btn-open-merge-modal" data-course="${cName}" title="${isMerged ? `Birleştirilen Şubeler: ${mergedSectionsNames}` : 'Bu dersi diğer şubelerle birleştir'}">
                            🔗 ${isMerged ? `<span class="merge-text">Birleşti: <strong>${mergedSectionsNames}</strong></span>` : 'Birleştir'}
                        </button>
                    </div>
                </td>
                <td class="course-action-cell" style="text-align: center;">
                    <div class="course-action-wrapper">
                        ${isElective ? `
                            <button class="btn-delete-course btn-remove-elective" data-course="${cName}" title="Bu Seçmeli Dersi Kaldır">
                                🗑️
                            </button>
                        ` : '<span class="dash-muted">—</span>'}
                    </div>
                </td>
            </tr>
        `;
    }

    // --- 4. SAĞ PANEL (KOMPAKT NORM TABLOSU VE İNTERAKTİF SOHBET BALONU) ---
    renderRightNormPanel() {
        const panelEl = document.getElementById("sidebar-right");
        if (!panelEl) return;

        const subeler = appState.state.subeler || [];
        const existingTeachers = appState.state.mevcutOgretmenler || {};
        const schoolType = appState.state.okulBilgisi.okulTuru || "";
        const coordinatorMap = appState.state.koordinatorlukYukleri || {};

        const normResult = normEngine.calculateSchoolNorms(subeler, existingTeachers, schoolType, coordinatorMap);

        const rowsHtml = normResult.branchReport.map(b => {
            return `
                <tr class="norm-row" data-branch="${b.branchName}">
                    <td>
                        <span class="norm-branch-text">${b.branchName}</span>
                    </td>
                    <td style="text-align: center;">
                        <span class="norm-chip-load">${b.totalHours}</span>
                    </td>
                    <td style="text-align: center;">
                        <div class="norm-dual-chip" title="Norm / Mevcut Kadro">
                            <span class="chip-norm">${b.calculatedNorm}</span>
                            <span class="chip-slash">/</span>
                            <span class="chip-mev">${b.currentTeachers}</span>
                        </div>
                    </td>
                    <td style="text-align: center;">
                        <span class="norm-status-chip ${b.statusType}">${b.statusBadge}</span>
                    </td>
                </tr>
            `;
        }).join("");

        const isVocationalSchool = schoolType.includes("meslek") || schoolType.includes("teknik") || schoolType.includes("mtegm") || subeler.some(s => s.alanId);
        const staffBtnTitle = isVocationalSchool ? "Kadrolu Öğretmen Sayılarını ve 12. Sınıf Koordinatörlük Yüklerini Düzenle" : "Kadrolu Öğretmen Sayılarını Düzenle";

        panelEl.innerHTML = `
            <div class="norm-panel-header">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size: 0.95rem; font-weight: 800;">Norm Kadro</span>
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                        <button class="btn-panel-toggle" id="btn-collapse-right" title="Sağ Norm Panelini Kapat (Sağa Gizle)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="13 17 18 12 13 7"></polyline>
                                <polyline points="6 17 11 12 6 7"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="norm-kpi-grid">
                    <div class="kpi-card kpi-card-amber kpi-card-full" title="Okulun Tüm Branşlar ve Şubeler Dahil Toplam Haftalık Ders Yükü">
                        <div class="kpi-load-wrapper">
                            <div class="kpi-load-left">
                                <span class="kpi-load-icon">⏱️</span>
                                <span class="kpi-label">Toplam Okul Yükü</span>
                            </div>
                            <span class="kpi-val amber">${normResult.totalHours} <span class="kpi-unit">Saat</span></span>
                        </div>
                    </div>
                    <div class="kpi-card kpi-card-blue">
                        <span class="kpi-label">Hesaplanan Norm</span>
                        <span class="kpi-val blue">${normResult.totalCalculatedNorm}</span>
                    </div>
                    <div class="kpi-card kpi-card-slate">
                        <span class="kpi-label">Mevcut Öğretmen</span>
                        <span class="kpi-val">${normResult.totalCurrentTeachers}</span>
                    </div>
                    <div class="kpi-card kpi-card-purple">
                        <span class="kpi-label">Toplam İhtiyaç</span>
                        <span class="kpi-val purple">${normResult.totalNeeded > 0 ? '-' + normResult.totalNeeded : '0'}</span>
                    </div>
                    <div class="kpi-card kpi-card-red">
                        <span class="kpi-label">Toplam Fazla</span>
                        <span class="kpi-val red">${normResult.totalSurplus > 0 ? '+' + normResult.totalSurplus : '0'}</span>
                    </div>
                </div>
            </div>
            <div class="norm-table-container">
                <table class="norm-table">
                    <thead>
                        <tr>
                            <th>Branş</th>
                            <th style="text-align: center;">Yük</th>
                            <th style="text-align: center;">Norm/Mev.</th>
                            <th style="text-align: center;">Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-muted);">Henüz ders yükü hesaplanmadı.</td></tr>'}
                    </tbody>
                </table>
            </div>
            <div class="sidebar-right-footer">
                <button class="btn-footer-kvkk" id="btn-footer-kvkk" title="6698 Sayılı KVKK Aydınlatma Metni ve Veri Güvenliği Taahhüdü">
                    🛡️ <strong>KVKK & Gizlilik</strong>
                </button>
                <span class="dev-subtle-watermark" title="NormMatik MEB Norm Kadro ve Ders Yükü Sistemi • Burhan Aysan">
                    ⚡ Mimari & Tasarım: <strong>burhanaysan</strong>
                </span>
            </div>
        `;

        document.getElementById("btn-footer-kvkk")?.addEventListener("click", () => {
            this.ui.openKvkkModal("AYDINLATMA");
        });

        // Global Speech Bubble Tooltip Bağlantısı (Kırpılma engelli Portal Tooltip)
        let bubble = document.getElementById("global-speech-bubble");
        if (!bubble) {
            bubble = document.createElement("div");
            bubble.id = "global-speech-bubble";
            bubble.className = "global-speech-bubble";
            document.body.appendChild(bubble);
        }

        let activeRow = null;
        let hideTimeout = null;

        const showBubble = (row) => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            activeRow = row;
            document.querySelectorAll(".norm-row").forEach(r => r.classList.remove("active-popover-row"));
            row.classList.add("active-popover-row");

            const branchName = row.dataset.branch;
            const bData = normResult.branchReport.find(b => b.branchName === branchName);
            if (!bData) return;

            const bubbleCoursesHtml = bData.courses.map(c => `
                <div class="bubble-section-chip-card ${c.isCoordinator ? 'bubble-coord-card' : ''}">
                    <div class="bubble-chip-top">
                        <span class="bubble-sec-badge">🏫 ${c.sectionName}</span>
                        <span class="bubble-hour-badge ${c.isCoordinator ? 'coord' : ''}">${c.isCoordinator ? '🏢 +' : '⏱️ '}${c.calculatedLoad} Saat</span>
                    </div>
                    <div class="bubble-course-name">${c.courseName}</div>
                    ${c.note ? `<div class="bubble-chip-note">👥 ${c.note}</div>` : ''}
                </div>
            `).join("");

            bubble.innerHTML = `
                <div class="bubble-title">
                    <span>⚖️ ${bData.branchName}</span>
                    <span class="bubble-sec-count-badge">${bData.courses.length} Şube/Ders</span>
                </div>
                <div class="bubble-body">
                    <div class="bubble-chips-container">
                        ${bubbleCoursesHtml.length > 0 ? bubbleCoursesHtml : '<div class="bubble-empty">Bu branşa atanmış ders yükü bulunmuyor.</div>'}
                    </div>
                    <div class="bubble-footer">
                        <div>📊 Toplam Ders Yükü: <strong class="bubble-total-val">${bData.totalHours} Saat</strong></div>
                        ${bData.coordinatorHours > 0 ? `<div style="font-size:0.72rem; color:#c084fc; font-weight:700;">🏢 12. Sınıf İşletme Koordinatörlüğü: +${bData.coordinatorHours}s (OÖKY Md.88)</div>` : ''}
                        <div>📜 <strong>${bData.formulaExplanation}</strong></div>
                    </div>
                </div>
            `;

            // Akıllı Görünürlük ve Viewport Sığdırma Motoru
            const rect = row.getBoundingClientRect();
            const bubbleWidth = 360;

            bubble.style.visibility = "hidden";
            bubble.classList.add("active");

            // Render edilen yüksekliği ölç
            const bubbleHeight = bubble.offsetHeight || 280;
            const viewportHeight = window.innerHeight;

            let targetTop = rect.top + (rect.height / 2) - (bubbleHeight / 2);
            const minTop = 16;
            const maxTop = Math.max(16, viewportHeight - bubbleHeight - 16);
            if (targetTop < minTop) targetTop = minTop;
            if (targetTop > maxTop) targetTop = maxTop;

            const targetLeft = Math.max(16, rect.left - bubbleWidth - 14);

            bubble.style.top = `${targetTop}px`;
            bubble.style.left = `${targetLeft}px`;
            bubble.style.visibility = "visible";
        };

        const scheduleHide = () => {
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                bubble.classList.remove("active");
                if (activeRow) {
                    activeRow.classList.remove("active-popover-row");
                    activeRow = null;
                }
            }, 200);
        };

        const cancelHide = () => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
        };

        document.querySelectorAll(".norm-row").forEach(row => {
            // TIKLAYINCA OLUŞSUN (Click to open)
            row.addEventListener("click", (e) => {
                e.stopPropagation();
                if (activeRow === row && bubble.classList.contains("active")) {
                    scheduleHide();
                } else {
                    showBubble(row);
                }
            });

            // MOUSE'I ÜSTÜNDEN ÇEKİNCE 2. BİR TIKLAMAYA GEREK KALMADAN ANİMASYONLA KAYBOLSUN
            row.addEventListener("mouseleave", () => {
                scheduleHide();
            });

            row.addEventListener("mouseenter", () => {
                if (activeRow === row) {
                    cancelHide();
                }
            });
        });

        // Baloncuk üzerine gidildiğinde açık kalsın (kullanıcı tüm şubeleri kaydırabilsin)
        bubble.addEventListener("mouseenter", () => {
            cancelHide();
        });

        // Baloncuk üzerinden mouse çekilince animasyonla otomatik kaybolsun
        bubble.addEventListener("mouseleave", () => {
            scheduleHide();
        });

        // Dışarıya tıklandığında kapansın
        document.addEventListener("click", (e) => {
            if (!bubble.contains(e.target) && !e.target.closest(".norm-row")) {
                bubble.classList.remove("active");
                if (activeRow) {
                    activeRow.classList.remove("active-popover-row");
                    activeRow = null;
                }
            }
        });

        document.getElementById("btn-collapse-right")?.addEventListener("click", () => {
            appState.setLayout({ rightCollapsed: true });
            this.applyLayoutStyles();
        });

        document.getElementById("btn-open-staff-modal")?.addEventListener("click", () => this.ui.openTeacherStaffModal());
    }
}

// Uygulamayı Başlat (Hem DOMContentLoaded hem de Hazır DOM desteği ile)
function startMebNormApp() {
    if (window._mebNormAppStarted) return;
    window._mebNormAppStarted = true;

    const app = new MebNormApplication();
    window.app = app;
    window.dbService = dbService;
    window.appState = appState;
    window.normEngine = normEngine;
    window.uiComponents = app.ui;
    app.init();

    document.getElementById("btn-expand-left")?.addEventListener("click", () => {
        appState.setLayout({ leftCollapsed: false });
        app.applyLayoutStyles();
    });

    document.getElementById("btn-expand-right")?.addEventListener("click", () => {
        appState.setLayout({ rightCollapsed: false });
        app.applyLayoutStyles();
    });
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startMebNormApp);
    } else {
        startMebNormApp();
    }
}

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
    if (typeof dbService !== 'undefined') window.dbService = dbService;
    if (typeof curriculumEngine !== 'undefined') window.curriculumEngine = curriculumEngine;
    if (typeof normEngine !== 'undefined') window.normEngine = normEngine;
    if (typeof MebReportsEngine !== 'undefined') window.MebReportsEngine = MebReportsEngine;
    if (typeof appState !== 'undefined') window.appState = appState;
    if (typeof EOkulImporter !== 'undefined') window.EOkulImporter = EOkulImporter;
    if (typeof UIComponentManager !== 'undefined') window.UIComponentManager = UIComponentManager;
    if (typeof MebCurriculumEngine !== 'undefined') window.MebCurriculumEngine = MebCurriculumEngine;
    if (typeof MebDatabaseService !== 'undefined') window.MebDatabaseService = MebDatabaseService;
    if (typeof MebNormEngine !== 'undefined') window.MebNormEngine = MebNormEngine;
}

})();

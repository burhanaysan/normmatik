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
            maxSections: 5,
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
            maxSections: 5,
            allowExport: false,
            kurumKodu: "*",
            okulAdi: "Deneme ve İnceleme Okulu",
            okulTuru: "*",
            hardwareId: this.currentHardwareId,
            reason: isExpired ? "7 Günlük deneme süreniz doldu. Lütfen lisans anahtarınızı giriniz." : null
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

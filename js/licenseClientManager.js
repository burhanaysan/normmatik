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

        // Başlangıç durumu her zaman DEMO'dur. Giriş yapan okulun gerçek
        // hakları, bulutdan 'abonelik' kaydı okunduktan sonra
        // applyCloudSubscription() ile uygulanır (bkz. app.js).
        //
        // Eskiden burada localStorage'daki lisans anahtarı okunurdu. Anahtar
        // sistemi 2026-08-24'te tamamen kaldırıldı.
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

    /**
     * ================== ABONELİĞİ BULUTTAN UYGULA (2026-08-24) ==================
     * Lisans artık bir ANAHTAR DEĞİL, veritabanındaki bir kayıttır.
     *
     * ESKİ DÜZEN VE NEDEN BIRAKILDI:
     *   Okul uygulamayı açar, ekranda cihaza özel uzun bir kod belirirdi.
     *   Bunu WhatsApp'tan geliştiriciye yollar, karşılığında imzalı bir
     *   anahtar alır, uygulamaya yapıştırırdı. Anahtar CİHAZA kilitliydi;
     *   bilgisayar değişince süreç baştan tekrarlanırdı.
     *
     *   Daha kötüsü: anahtar localStorage'da tutuluyordu, giriş ekranı ise
     *   her girişte localStorage'ı temizliyordu. Yani anahtar HER GİRİŞTE
     *   uçuyor ve uygulama DEMO'ya düşüyordu — ödeme yapmış bir okul
     *   3 şube sınırına takılıyordu.
     *
     * YENİ DÜZEN:
     *   Haklar 'abonelik/<kurumKodu>' düğümünde durur. Okul bunu OKUR,
     *   DEĞİŞTİREMEZ (veritabanı kuralı reddeder). Süre dolduğunda
     *   veritabanı erişimi zaten sunucuda keser — tarayıcıdan aşılamaz.
     *
     *   Sonuç: cihaz kodu yok, WhatsApp yok, yapıştırma yok, kaybolan
     *   anahtar yok. Yenileme, veritabanında bir tarihi güncellemektir.
     * ===========================================================================
     *
     * @param {object} abonelik  { plan, bitis, bitisMs, sinirsizSube, disaAktarim }
     * @param {object} kimlik    { kurumKodu, okulAdi, okulTuru }
     */
    applyCloudSubscription(abonelik, kimlik = {}) {
        if (!abonelik || typeof abonelik !== 'object') {
            return this.initDemoState();
        }

        const bitisMs = Number(abonelik.bitisMs || 0);
        const kalanMs = bitisMs - Date.now();
        const suresiDoldu = !(bitisMs > 0) || kalanMs <= 0;

        if (suresiDoldu) {
            // Süresi dolmuşsa demo haklarına düşer. Zaten veritabanı da
            // erişimi kesmiş olur; bu yalnızca ekranda doğru mesaj çıksın diye.
            const demo = this.initDemoState();
            demo.isExpired = true;
            demo.reason = `Aboneliğiniz ${abonelik.bitis || ''} tarihinde sona erdi. Yenilemek için bizimle iletişime geçin.`;
            this.licenseStatus = demo;
            return demo;
        }

        this.activeLicense = { ...abonelik, ...kimlik };
        this.licenseStatus = {
            isValid: true,
            licenseType: String(abonelik.plan || 'tam').toUpperCase(),
            isDemo: false,
            isAnnual: true,
            isMaster: false,
            daysRemaining: Math.ceil(kalanMs / 86400000),
            isExpired: false,
            // -1 = sınırsız. Lisanslı okulda şube sınırı YOKTUR.
            maxSections: (abonelik.sinirsizSube === false)
                ? (parseInt(abonelik.maxSube, 10) || 3)
                : -1,
            allowExport: abonelik.disaAktarim !== false,
            kurumKodu: kimlik.kurumKodu || '',
            okulAdi: kimlik.okulAdi || '',
            okulTuru: kimlik.okulTuru || '',
            hardwareId: this.currentHardwareId,
            bitis: abonelik.bitis || '',
            reason: null
        };
        return this.licenseStatus;
    }

    /** Destek/yönetici hesabı: her okulu açabilir, sınır uygulanmaz. */
    applyAdminAccess(kimlik = {}) {
        this.licenseStatus = {
            isValid: true,
            licenseType: 'YONETICI',
            isDemo: false,
            isAnnual: false,
            isMaster: true,
            daysRemaining: 9999,
            isExpired: false,
            maxSections: -1,
            allowExport: true,
            kurumKodu: kimlik.kurumKodu || '',
            okulAdi: kimlik.okulAdi || '',
            okulTuru: kimlik.okulTuru || '',
            hardwareId: this.currentHardwareId,
            reason: null
        };
        return this.licenseStatus;
    }

    deactivateLicense() {
        // Artık silinecek bir anahtar yok; yalnızca bellekteki durum sıfırlanır.
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

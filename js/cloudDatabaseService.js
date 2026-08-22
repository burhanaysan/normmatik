/**
 * NormMatik™ — Güvenli Bulut Veri Servisi
 * Copyright (c) 2026 Burhan AYSAN.
 *
 * ================== 2026-08-22 GÜVENLİK DEĞİŞİKLİĞİ ==================
 * ÖNCEDEN: Bu dosya Realtime Database'e DOĞRUDAN ve kimlik doğrulamasız
 * bağlanıyordu (düz fetch GET/PUT). Veritabanı tüm internete açıktı;
 * adresi bilen herkes bütün okulların verisini okuyabiliyor, değiştirebiliyor
 * ve silebiliyordu. Ayrıca lisanssız/demo kullanıcılar ortak "default_school"
 * kaydını paylaşıyor, birbirlerinin verisinin üzerine yazıyordu.
 *
 * ŞİMDİ: Veritabanı herkese kapalı. Erişim yalnızca Cloud Function üzerinden
 * ve yalnızca GEÇERLİ LİSANS ANAHTARI ile mümkün. Hangi okulun verisine
 * erişileceğine sunucu karar verir; bu bilgi imzalı lisansın içinden okunur,
 * bu dosyanın gönderdiği bir alandan değil. Yani bu dosyadaki kodu değiştiren
 * biri bile başka okulun verisine ulaşamaz.
 *
 * Sunucu kodu: 09_firebase_guvenlik/functions/index.js
 * =====================================================================
 */

// Cloud Function adresi. Dağıtımdan sonra `firebase deploy` çıktısındaki
// adresle doğrulayın. Bölge, veritabanıyla aynı: europe-west1.
const VERI_KAPISI_URL =
    "https://europe-west1-normmatik-85118.cloudfunctions.net/normmatikVeri";

const LISANS_DEPO_ANAHTARI = "meb_norm_license_key";

export class CloudDatabaseService {
    constructor() {
        this.saveTimeout = null;
        this.isSaving = false;
        this.lastSyncTime = null;
        this.sonHata = null;
        this.devreDisi = false; // Ağ/sunucu yoksa gereksiz denemeleri kes
    }

    /**
     * Geriye dönük uyumluluk için korunuyor. Artık yol anahtarını SUNUCU
     * belirliyor; burada yalnızca günlük kaydı/gösterim amacıyla kullanılır.
     */
    getEffectiveKey(kurumKodu) {
        if (!kurumKodu || String(kurumKodu).trim() === "" || kurumKodu === "*") {
            return "lisanssiz";
        }
        return String(kurumKodu).trim().replace(/[.#$[\]]/g, "_");
    }

    /** localStorage'daki lisans anahtarını okur. */
    _lisansAnahtari() {
        try {
            return localStorage.getItem(LISANS_DEPO_ANAHTARI);
        } catch (e) {
            return null;
        }
    }

    /** Lisans yöneticisinin hesapladığı donanım kimliği. */
    _donanimKimligi() {
        try {
            return (
                (window.licenseManager && window.licenseManager.currentHardwareId) ||
                null
            );
        } catch (e) {
            return null;
        }
    }

    /**
     * Veri kapısına istek gönderir.
     * Lisans yoksa buluta hiç gidilmez — uygulama yerelde çalışmayı sürdürür.
     */
    async _istek(islem, ekAlanlar = {}) {
        if (this.devreDisi) return null;

        const licenseToken = this._lisansAnahtari();
        if (!licenseToken) {
            // Demo/lisanssız kullanım: bulut eşitlemesi yok, yerel kayıt sürer.
            return null;
        }

        try {
            const res = await fetch(VERI_KAPISI_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    licenseToken,
                    hardwareId: this._donanimKimligi(),
                    islem,
                    ...ekAlanlar,
                }),
            });

            let govde = null;
            try {
                govde = await res.json();
            } catch (e) {
                govde = null;
            }

            if (!res.ok) {
                this.sonHata = (govde && govde.hata) || `HTTP ${res.status}`;

                if (res.status === 403) {
                    // Lisans geçersiz/süresi dolmuş → tekrar denemenin anlamı yok.
                    this.devreDisi = true;
                    console.warn(
                        "[Bulut] Lisans bulut eşitlemesi için kabul edilmedi:",
                        this.sonHata
                    );
                } else {
                    console.warn("[Bulut] İstek başarısız:", this.sonHata);
                }
                return null;
            }

            this.sonHata = null;
            return govde;
        } catch (e) {
            // Ağ yok / çevrimdışı / sunucuya ulaşılamıyor → sessizce yerelde devam
            this.sonHata = e.message;
            console.warn("[Bulut] Sunucuya ulaşılamadı, yerel kayıt kullanılıyor:", e.message);
            return null;
        }
    }

    /**
     * Okulun verilerini buluttan çeker.
     * @returns {Promise<object|null>}
     */
    async loadSchoolData(kurumKodu) {
        const cevap = await this._istek("yukle");
        if (!cevap || !cevap.basarili) return null;

        const veri = cevap.veri;
        if (veri && Array.isArray(veri.subeler)) {
            this.lastSyncTime = new Date();
            return veri;
        }
        return null;
    }

    /**
     * Otomatik kayıt (800 ms geciktirmeli — arka arkaya değişikliklerde
     * tek istek gönderilir).
     */
    scheduleAutoSave(kurumKodu, state) {
        if (!state || !Array.isArray(state.subeler)) return;

        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(async () => {
            await this.saveSchoolData(kurumKodu, state);
        }, 800);
    }

    /**
     * Veriyi buluta yazar.
     * NOT: kurumKodu parametresi artık YETKİ belirlemez; sunucu onu imzalı
     * lisanstan okur. Burada yalnızca günlük kaydı için duruyor.
     */
    async saveSchoolData(kurumKodu, state) {
        if (!state || !Array.isArray(state.subeler)) return;

        const veri = {
            okulAdi: state.okulBilgisi?.okulAdi || "MEB Okulu",
            okulTuru:
                state.okulBilgisi?.okulTuru || "mesleki_ve_teknik_anadolu_lisesi",
            sezon: state.okulBilgisi?.sezon || "2026-2027",
            il: state.okulBilgisi?.il || "",
            ilce: state.okulBilgisi?.ilce || "",
            subeler: state.subeler || [],
            mevcutOgretmenler: state.mevcutOgretmenler || {},
            koordinatorlukYukleri: state.koordinatorlukYukleri || {},
            adminOptions: state.okulBilgisi?.adminOptions || {},
            antet: state.okulBilgisi?.antet || {},
            totalSections: (state.subeler || []).length,
            lastUpdated: new Date().toISOString(),
            version: "3.0.0",
        };

        this.isSaving = true;
        const cevap = await this._istek("kaydet", { veri });
        this.isSaving = false;

        if (cevap && cevap.basarili) {
            this.lastSyncTime = new Date();
            console.log(
                `☁️ [Bulut] '${cevap.kurumKodu}' verileri güvenli kanaldan kaydedildi ` +
                    `(${veri.totalSections} şube).`
            );
        }
    }

    /** Arayüzde durum göstermek isterseniz kullanılabilir. */
    durum() {
        return {
            lisansVar: !!this._lisansAnahtari(),
            devreDisi: this.devreDisi,
            sonHata: this.sonHata,
            sonEsitleme: this.lastSyncTime,
        };
    }
}

export const cloudDbService = new CloudDatabaseService();
if (typeof window !== "undefined") {
    window.CloudDatabaseService = CloudDatabaseService;
    window.cloudDbService = cloudDbService;
}

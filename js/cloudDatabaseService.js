/**
 * NormMatik™ — Google Cloud Canlı Veritabanı Servisi (CloudDatabaseService)
 * Google Firebase Realtime Database (europe-west1)
 * Doğrudan Google Cloud Senkronizasyonu & Çevrimdışı/Önbellek Bağımsızlığı
 */

const FIREBASE_RTDB_BASE = "https://normmatik-85118-default-rtdb.europe-west1.firebasedatabase.app/school_data";

export class CloudDatabaseService {
    constructor() {
        this.saveTimeout = null;
        this.isSaving = false;
        this.lastSyncTime = null;
        this.baseUrl = FIREBASE_RTDB_BASE;
    }

    /**
     * Kurum kodunu güvenli URL anahtarına çevirir
     */
    getEffectiveKey(kurumKodu) {
        if (!kurumKodu || String(kurumKodu).trim() === "" || kurumKodu === "*" || kurumKodu === "123456") {
            return null; // Demo veya tanımsız okullar buluta yazılmaz
        }
        return String(kurumKodu).trim().replace(/[.#$[\]]/g, "_");
    }

    /**
     * Okulun verilerini doğrudan Google Cloud'dan çeker
     */
    async loadSchoolData(kurumKodu) {
        const key = this.getEffectiveKey(kurumKodu);
        if (!key) return null;

        try {
            const url = `${this.baseUrl}/${encodeURIComponent(key)}.json`;
            const res = await fetch(url, { method: "GET" });
            if (!res.ok) return null;
            const data = await res.json();
            if (data && (Array.isArray(data.subeler) || data.okulAdi)) {
                this.lastSyncTime = new Date();
                console.log(`☁️ [Google Cloud] '${key}' verileri başarıyla çekildi (${(data.subeler || []).length} Şube).`);
                return data;
            }
            return null;
        } catch (e) {
            console.warn("☁️ [Google Cloud] Veri yüklenemedi:", e.message);
            return null;
        }
    }

    /**
     * Otomatik kayıt (600ms debounced)
     */
    scheduleAutoSave(kurumKodu, state) {
        const key = this.getEffectiveKey(kurumKodu);
        if (!key || !state) return;

        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(async () => {
            await this.saveSchoolData(key, state);
        }, 600);
    }

    /**
     * Okul verilerini doğrudan Google Cloud'a kaydeder
     */
    async saveSchoolData(kurumKodu, state) {
        const key = this.getEffectiveKey(kurumKodu);
        if (!key || !state) return;

        const payload = {
            kurumKodu: key,
            okulAdi: state.okulBilgisi?.okulAdi || "MEB Okulu",
            okulTuru: state.okulBilgisi?.okulTuru || "mesleki_ve_teknik_anadolu_lisesi",
            sezon: state.okulBilgisi?.sezon || "2026-2027",
            il: state.okulBilgisi?.il || "",
            ilce: state.okulBilgisi?.ilce || "",
            subeler: state.subeler || [],
            mevcutOgretmenler: state.mevcutOgretmenler || {},
            koordinatorlukYukleri: state.koordinatorlukYukleri || {},
            adminOptions: state.okulBilgisi?.adminOptions || {},
            antet: state.okulBilgisi?.antet || {},
            lastUpdated: new Date().toISOString()
        };

        try {
            this.isSaving = true;
            const url = `${this.baseUrl}/${encodeURIComponent(key)}.json`;
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            this.isSaving = false;
            if (res.ok) {
                this.lastSyncTime = new Date();
                console.log(`☁️ [Google Cloud] '${key}' anında kaydedildi (${payload.subeler.length} Şube).`);
            }
        } catch (e) {
            this.isSaving = false;
            console.warn("☁️ [Google Cloud] Kayıt başarısız:", e.message);
        }
    }
}

export const cloudDbService = new CloudDatabaseService();
if (typeof window !== "undefined") {
    window.CloudDatabaseService = CloudDatabaseService;
    window.cloudDbService = cloudDbService;
}

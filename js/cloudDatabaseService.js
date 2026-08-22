/**
 * NormMatik™ — Google Cloud Realtime Veritabanı Servisi
 * Her Okul İçin Canlı ve Otomatik Bulut Senkronizasyonu
 */

export class CloudDatabaseService {
    constructor() {
        this.baseUrl = "https://normmatik-85118-default-rtdb.europe-west1.firebasedatabase.app/school_data";
        this.saveTimeout = null;
        this.isSaving = false;
        this.lastSyncTime = null;
    }

    getEffectiveKey(kurumKodu) {
        if (!kurumKodu || kurumKodu.trim() === "" || kurumKodu === "*") {
            return "default_school";
        }
        return kurumKodu.trim().replace(/[.#$\[\]]/g, "_");
    }

    /**
     * Okulun verilerini Google Cloud'dan çeker
     */
    async loadSchoolData(kurumKodu) {
        const key = this.getEffectiveKey(kurumKodu);
        try {
            const url = `${this.baseUrl}/${encodeURIComponent(key)}.json`;
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) return null;
            const data = await res.json();
            if (data && Array.isArray(data.subeler)) {
                this.lastSyncTime = new Date();
                return data;
            }
            return null;
        } catch (e) {
            console.warn("[CloudDB] Buluttan veri çekilemedi:", e);
            return null;
        }
    }

    /**
     * Okul verilerini Google Cloud üzerine sessizce kaydeder (Debounced 800ms)
     */
    scheduleAutoSave(kurumKodu, state) {
        if (!state || !Array.isArray(state.subeler)) return;

        const key = this.getEffectiveKey(kurumKodu);
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(async () => {
            await this.saveSchoolData(key, state);
        }, 800);
    }

    /**
     * Doğrudan Google Cloud Kayıt İşlemi
     */
    async saveSchoolData(keyOrKurumKodu, state) {
        if (!state || !Array.isArray(state.subeler)) return;
        const key = this.getEffectiveKey(keyOrKurumKodu);

        try {
            this.isSaving = true;
            const payload = {
                kurumKodu: state.okulBilgisi?.kurumKodu || key,
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
                totalSections: (state.subeler || []).length,
                lastUpdated: new Date().toISOString(),
                version: "2.5.0"
            };

            const url = `${this.baseUrl}/${encodeURIComponent(key)}.json`;
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                this.lastSyncTime = new Date();
                console.log(`☁️ [CloudDB] '${key}' verileri Google Cloud'a başarıyla kaydedildi (${payload.totalSections} şube).`);
            }
            this.isSaving = false;
        } catch (e) {
            console.warn("[CloudDB] Buluta kaydedilemedi:", e);
            this.isSaving = false;
        }
    }
}

export const cloudDbService = new CloudDatabaseService();
if (typeof window !== 'undefined') {
    window.CloudDatabaseService = CloudDatabaseService;
    window.cloudDbService = cloudDbService;
}

/**
 * NormMatik™ — Google Cloud Realtime Veritabanı Servisi
 * Her Okul İçin İzole, Şifreli ve Canlı Bulut Senkronizasyonu
 */

export class CloudDatabaseService {
    constructor() {
        this.baseUrl = "https://kvstore-normmatik-default-rtdb.firebaseio.com/school_data";
        this.saveTimeout = null;
        this.isSaving = false;
    }

    /**
     * Okulun verilerini Google Cloud'dan çeker
     */
    async loadSchoolData(kurumKodu) {
        if (!kurumKodu || kurumKodu === "123456" || kurumKodu === "*") return null;
        
        try {
            const url = `${this.baseUrl}/${encodeURIComponent(kurumKodu)}.json`;
            const res = await fetch(url);
            if (!res.ok) return null;
            const data = await res.json();
            return data;
        } catch (e) {
            console.warn("[CloudDB] Veri yüklenemedi:", e);
            return null;
        }
    }

    /**
     * Okul verilerini Google Cloud üzerine sessizce kaydeder (Debounced 1.2 sn)
     */
    scheduleAutoSave(kurumKodu, state) {
        if (!kurumKodu || kurumKodu === "123456" || kurumKodu === "*") return;
        if (!state || !Array.isArray(state.subeler)) return;

        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(async () => {
            await this.saveSchoolData(kurumKodu, state);
        }, 1200);
    }

    /**
     * Doğrudan Google Cloud Kayıt İşlemi
     */
    async saveSchoolData(kurumKodu, state) {
        if (!kurumKodu || kurumKodu === "123456") return;

        try {
            this.isSaving = true;
            const payload = {
                kurumKodu: kurumKodu,
                okulAdi: state.okulBilgisi.okulAdi,
                okulTuru: state.okulBilgisi.okulTuru,
                sezon: state.okulBilgisi.sezon || "2026-2027",
                il: state.okulBilgisi.il || "",
                ilce: state.okulBilgisi.ilce || "",
                subeler: state.subeler || [],
                mevcutOgretmenler: state.mevcutOgretmenler || {},
                koordinatorlukYukleri: state.koordinatorlukYukleri || {},
                adminOptions: state.okulBilgisi.adminOptions || {},
                antet: state.okulBilgisi.antet || {},
                totalSections: (state.subeler || []).length,
                lastUpdated: new Date().toISOString(),
                version: "2.0.0"
            };

            const url = `${this.baseUrl}/${encodeURIComponent(kurumKodu)}.json`;
            await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            this.isSaving = false;
        } catch (e) {
            console.warn("[CloudDB] Buluta kaydedilemedi:", e);
            this.isSaving = false;
        }
    }
}

export const cloudDbService = new CloudDatabaseService();

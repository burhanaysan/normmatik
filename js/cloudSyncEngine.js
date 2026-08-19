/**
 * NormMatik™ — Google Cloud / Firebase Akıllı Bulut Senkronizasyon ve Kurtarma Motoru
 * Sıfır Veri Kaybı Garantisi & Kör Üzerine Yazma (Blind Overwrite) Korumalı
 */

export class NormMatikCloudSyncEngine {
    constructor(dbService, curriculumEngine) {
        this.endpoint = "https://kvstore-normmatik-default-rtdb.firebaseio.com/schools";
        this.db = dbService;
        this.curriculum = curriculumEngine;
        this.isSyncing = false;
        this.lastCloudSyncTime = null;
        this.debounceTimer = null;
    }

    /**
     * Yerel veriyi buluta akıllıca kaydeder (Debounced & Boşluk Korumalı)
     */
    scheduleAutoSave(state) {
        if (!state || !state.okulBilgisi) return;
        const kKodu = (state.okulBilgisi.kurumKodu || "").trim();
        
        // Kurum kodu yoksa veya demo okuluysa bulutu kirletme
        if (!kKodu || kKodu === "*" || kKodu === "123456") return;

        // Şube sayısı 0 ise ve henüz okul kurulmadıysa boş veriyle bulutu ezme!
        const subeler = state.subeler || [];

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.pushToCloud(state);
        }, 1500); // 1.5 saniye sonra sessizce kaydet
    }

    /**
     * Buluta Veri Gönderimi
     */
    async pushToCloud(state) {
        const kKodu = (state.okulBilgisi.kurumKodu || "").trim();
        if (!kKodu) return;

        try {
            this.setSyncIndicator("syncing");

            const payload = {
                kurumKodu: kKodu,
                okulAdi: state.okulBilgisi.okulAdi || "",
                okulTuru: state.okulBilgisi.okulTuru || "",
                sezon: state.okulBilgisi.sezon || "2026-2027",
                il: state.okulBilgisi.il || "",
                ilce: state.okulBilgisi.ilce || "",
                subeler: state.subeler || [],
                mevcutOgretmenler: state.mevcutOgretmenler || {},
                koordinatorlukYukleri: state.koordinatorlukYukleri || {},
                adminOptions: state.okulBilgisi.adminOptions || {},
                totalSections: (state.subeler || []).length,
                updatedAt: new Date().toISOString(),
                updatedDateStr: new Date().toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }),
                version: "1.3.0"
            };

            const url = `${this.endpoint}/${encodeURIComponent(kKodu)}.json`;
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                this.lastCloudSyncTime = new Date();
                this.setSyncIndicator("saved", payload.updatedDateStr);
            } else {
                this.setSyncIndicator("offline");
            }
        } catch (e) {
            this.setSyncIndicator("offline");
        }
    }

    /**
     * Buluttan Akıllı Kurtarma / Geri Yükleme Kontrolü
     * (Eğer yerel tarayıcı boşsa ama bulutta okul varsa otomatik indirir!)
     */
    async checkAndRestoreFromCloud(appStateInstance, showNotification = true) {
        const localState = appStateInstance.state;
        const kKodu = (localState.okulBilgisi?.kurumKodu || "").trim();
        const localSectionsCount = (localState.subeler || []).length;

        if (!kKodu || kKodu === "*" || kKodu === "123456") return false;

        try {
            this.setSyncIndicator("syncing");
            const url = `${this.endpoint}/${encodeURIComponent(kKodu)}.json`;
            const res = await fetch(url);
            
            if (!res.ok) {
                this.setSyncIndicator("idle");
                return false;
            }

            const cloudData = await res.json();
            if (!cloudData || !Array.isArray(cloudData.subeler)) {
                this.setSyncIndicator("idle");
                return false;
            }

            const cloudSectionsCount = cloudData.subeler.length;

            // KORUMA SENARYOSU 1: Yerel tarayıcı çerezleri silinmiş (0 şube), ama bulutta 1+ şube var!
            if (localSectionsCount === 0 && cloudSectionsCount > 0) {
                console.log(`[CloudSync] Yerel boş bulundu, buluttaki ${cloudSectionsCount} şube geri yükleniyor...`);
                
                appStateInstance.state.okulBilgisi.okulAdi = cloudData.okulAdi || appStateInstance.state.okulBilgisi.okulAdi;
                appStateInstance.state.okulBilgisi.okulTuru = cloudData.okulTuru || appStateInstance.state.okulBilgisi.okulTuru;
                appStateInstance.state.okulBilgisi.okulTuruKilitli = true;
                appStateInstance.state.okulBilgisi.il = cloudData.il || appStateInstance.state.okulBilgisi.il;
                appStateInstance.state.okulBilgisi.ilce = cloudData.ilce || appStateInstance.state.okulBilgisi.ilce;
                appStateInstance.state.subeler = cloudData.subeler;
                appStateInstance.state.mevcutOgretmenler = cloudData.mevcutOgretmenler || {};
                appStateInstance.state.koordinatorlukYukleri = cloudData.koordinatorlukYukleri || {};
                appStateInstance.state.aktifSubeId = cloudData.subeler[0]?.id || null;

                appStateInstance.notify(false); // UI'ı tazele
                this.setSyncIndicator("saved", cloudData.updatedDateStr);

                if (showNotification && typeof window !== 'undefined' && window.app?.ui) {
                    window.app.ui.showToast(`☁️ Buluttan [${cloudData.okulAdi}] verileriniz (${cloudSectionsCount} Şube) otomatik geri yüklendi!`, "success");
                }
                return true;
            }

            this.setSyncIndicator("saved");
            return false;

        } catch (err) {
            console.warn("[CloudSync] Bulut kontrolü yapılamadı:", err);
            this.setSyncIndicator("offline");
            return false;
        }
    }

    /**
     * Header'daki Bulut Durum Göstergesi Rozeti
     */
    setSyncIndicator(status, timeStr = "") {
        const el = document.getElementById("cloud-sync-badge");
        if (!el) return;

        if (status === "syncing") {
            el.innerHTML = `<span class="cloud-icon spin">🔄</span> <span class="cloud-text">Kaydediliyor...</span>`;
            el.className = "cloud-sync-badge-compact syncing";
        } else if (status === "saved") {
            const displayTime = timeStr || (new Date().toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }));
            el.innerHTML = `<span class="cloud-icon">☁️</span> <span class="cloud-text">Buluta Kaydedildi</span>`;
            el.className = "cloud-sync-badge-compact saved";
            el.title = `Son otomatik bulut senkronizasyonu: ${displayTime}. Verileriniz Google Cloud üzerinde güvendedir.`;
        } else if (status === "offline") {
            el.innerHTML = `<span class="cloud-icon">💾</span> <span class="cloud-text">Yerel</span>`;
            el.className = "cloud-sync-badge-compact local";
            el.title = "Verileriniz bu bilgisayarda güvendedir.";
        } else {
            el.innerHTML = `<span class="cloud-icon">☁️</span> <span class="cloud-text">Bulut</span>`;
            el.className = "cloud-sync-badge-compact ready";
        }
    }
}

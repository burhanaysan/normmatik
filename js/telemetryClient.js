/**
 * NormMatik™ — Canlı Lisans Doğrulama ve Güvenlik Telemetri İstemcisi
 * 6698 Sayılı KVKK ve 5846 Sayılı FSEK Kapsamında Teknik Lisans Güvenlik Doğrulaması
 */

class NormMatikTelemetryClient {
    constructor() {
        this.endpoint = "https://normmatik-85118-default-rtdb.europe-west1.firebasedatabase.app/telemetry";
        this.lastPingTime = 0;
        this.pingIntervalMs = 5 * 60 * 1000; // 5 dakikada bir kontrol
    }

    /**
     * Güvenli, anonim ve sadece teknik lisans doğrulama sinyali gönderir
     */
    async sendHeartbeat(okulBilgisi = {}, licenseStatus = {}) {
        try {
            const now = Date.now();
            if (now - this.lastPingTime < 30000) return; // Spam koruması (min 30sn)
            this.lastPingTime = now;

            const kurumKodu = (okulBilgisi.kurumKodu || licenseStatus.kurumKodu || "754123").trim();
            const okulAdi = (okulBilgisi.okulAdi || licenseStatus.okulAdi || "MEB Okulu").trim();
            const okulTuru = okulBilgisi.okulTuru || licenseStatus.okulTuru || "anadolu_lisesi";

            // Cihaz türü tespiti
            const ua = navigator.userAgent || "";
            let deviceType = "Masaüstü PC";
            if (/android/i.test(ua)) deviceType = "Android Telefon";
            else if (/iphone|ipad|ipod/i.test(ua)) deviceType = "iOS / iPhone";
            else if (/tablet/i.test(ua)) deviceType = "Tablet";

            const payload = {
                kurumKodu: kurumKodu,
                okulAdi: okulAdi,
                okulTuru: okulTuru,
                deviceType: deviceType,
                screenResolution: `${window.innerWidth}x${window.innerHeight}`,
                isLicensed: !licenseStatus.isDemo,
                licenseType: licenseStatus.isMaster ? "MASTER" : (licenseStatus.isAnnual ? "PRO" : "DEMO"),
                daysRemaining: licenseStatus.daysRemaining || 0,
                version: "1.2.0",
                lastSeenTimestamp: now,
                lastSeenDateStr: new Date().toLocaleString("tr-TR"),
                online: true
            };

            // 1. Yerel Master depolamaya kaydet (aynı tarayıcı içi testler)
            try {
                let localFeed = JSON.parse(localStorage.getItem("normmatik_telemetry_feed") || "{}");
                localFeed[kurumKodu] = payload;
                localStorage.setItem("normmatik_telemetry_feed", JSON.stringify(localFeed));
            } catch (e) {}

            // 2. Bulut Telemetri Uç Noktasına Gönder (Non-blocking)
            fetch(`${this.endpoint}/${kurumKodu}.json`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).catch(() => {
                // Offline fallback - sessizce devam et
            });

        } catch (err) {
            // Sessiz yakalama - kullanıcı deneyimini asla etkilemez
            console.debug("Telemetry ping handled gracefully");
        }
    }
}

// Global Export
if (typeof window !== 'undefined') {
    window.telemetryClient = new NormMatikTelemetryClient();
}

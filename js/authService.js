/**
 * NormMatik™ — Kurumsal Kimlik Doğrulama ve Güvenli Oturum Servisi (AuthService)
 * MEB Kurum Kodu, Şifre/Lisans Anahtarı ve Okul Kilidi Koruması
 */

export const REGISTERED_SCHOOLS = {
    "131313": {
        okulAdi: "Akşehir Nasreddin Hoca Mesleki ve Teknik Anadolu Lisesi",
        okulTuru: "mesleki_ve_teknik_anadolu_lisesi",
        il: "KONYA",
        ilce: "AKŞEHİR"
    },
    "754123": {
        okulAdi: "Kadıköy Anadolu Lisesi",
        okulTuru: "anadolu_lisesi",
        il: "İSTANBUL",
        ilce: "KADIKÖY"
    },
    "123456": {
        okulAdi: "Örnek Atatürk Anadolu Lisesi (Demo)",
        okulTuru: "anadolu_lisesi",
        il: "ANKARA",
        ilce: "ÇANKAYA"
    }
};

export class AuthService {
    constructor() {
        this.SESSION_KEY = "normmatik_active_session";
    }

    /**
     * Kurum Koduna göre kayıtlı okul bilgilerini çözer
     */
    resolveSchoolInfo(kurumKodu) {
        if (!kurumKodu) return null;
        const reg = REGISTERED_SCHOOLS[kurumKodu];
        if (reg) return reg;

        // Tarayıcı yerel master CRM'inden kontrol et
        try {
            const crm = JSON.parse(localStorage.getItem('normmatik_master_clients_db') || '[]');
            const found = crm.find(c => c.kurumKodu === kurumKodu);
            if (found) {
                return {
                    okulAdi: found.okulAdi,
                    okulTuru: found.okulTuru,
                    il: "",
                    ilce: ""
                };
            }
        } catch(e) {}

        return null;
    }

    /**
     * Aktif oturumu döndürür
     */
    getSession() {
        try {
            const data = localStorage.getItem(this.SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Oturumu kaydeder
     */
    setSession(sessionData) {
        try {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify({
                ...sessionData,
                lastActive: new Date().toISOString()
            }));
        } catch (e) {}
    }

    /**
     * Oturumu kapatır ve vitrin ana sayfasına yönlendirir
     */
    logout() {
        try {
            localStorage.removeItem(this.SESSION_KEY);
        } catch (e) {}
        window.location.href = "index.html";
    }

    /**
     * Çalışma alanında (app.html) oturum kontrolü yapar
     */
    requireAuth() {
        const session = this.getSession();
        if (!session || !session.kurumKodu) {
            window.location.href = "index.html";
            return false;
        }
        return true;
    }
}

export const authService = new AuthService();

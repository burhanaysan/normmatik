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
        okulAdi: "Atatürk Anadolu Lisesi (Demo)",
        okulTuru: "anadolu_lisesi",
        il: "ANKARA",
        ilce: "ÇANKAYA"
    }
};

export class AuthService {
    constructor() {
        this.SESSION_KEY = "normmatik_active_session";
    }

    resolveSchoolInfo(kurumKodu) {
        if (!kurumKodu) return null;
        const reg = REGISTERED_SCHOOLS[kurumKodu];
        if (reg) return reg;
        return null;
    }

    getSession() {
        try {
            const data = sessionStorage.getItem(this.SESSION_KEY) || localStorage.getItem(this.SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    setSession(sessionData) {
        try {
            const jsonStr = JSON.stringify({
                ...sessionData,
                lastActive: new Date().toISOString()
            });
            sessionStorage.setItem(this.SESSION_KEY, jsonStr);
            localStorage.setItem(this.SESSION_KEY, jsonStr);
        } catch (e) {}
    }

    logout() {
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {}
        window.location.href = "index.html";
    }

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
if (typeof window !== 'undefined') {
    window.authService = authService;
}

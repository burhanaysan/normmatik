/**
 * NormMatik™ — Kurumsal Kimlik Doğrulama ve Güvenli Oturum Servisi (AuthService)
 * MEB Kurum Kodu, Şifre/Lisans Anahtarı ve Okul Kilidi Koruması
 */

export class AuthService {
    constructor() {
        this.SESSION_KEY = "normmatik_active_session";
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

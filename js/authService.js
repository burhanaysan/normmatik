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
        okulAdi: "DEMO LİSESİ",
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
            // Yalnızca sessionStorage. localStorage BİLEREK okunmuyor:
            // tarayıcı kapandıktan sonra oturum devam etmemeli.
            const data = sessionStorage.getItem(this.SESSION_KEY);
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
        } catch (e) {}
    }

    /**
     * Çıkış.
     *
     * Okula ait her iz silinir; yalnızca zararsız kullanıcı tercihleri
     * (tema, panel genişlikleri, tanıtım turu) korunur. Eskiden düpedüz
     * localStorage.clear() çağrılıyordu ve bu tercihler de her çıkışta
     * uçuyordu.
     *
     * sessionStorage tamamen temizlenir: kimlik jetonu ve oturum orada
     * durur, bir sonraki kullanıcıya sızmamalıdır.
     */
    logout() {
        const KORUNANLAR = [
            "MEB_NORM_KADRO_LAYOUT_V1",
            "normmatik_onboarding_seen"
        ];
        try {
            const yedek = {};
            KORUNANLAR.forEach(k => {
                const v = localStorage.getItem(k);
                if (v !== null) yedek[k] = v;
            });
            localStorage.clear();
            Object.keys(yedek).forEach(k => localStorage.setItem(k, yedek[k]));
        } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}
        window.location.href = "index.html";
    }

    /**
     * Oturum kontrolü.
     *
     * ÖNEMLİ NOT — bu kontrol neyi sağlar, neyi SAĞLAMAZ:
     * Buradaki denetim yalnızca KULLANIM KOLAYLIĞI içindir (giriş yapmamış
     * birini giriş sayfasına yönlendirmek). GÜVENLİĞİ SAĞLAMAZ ve sağlaması
     * da beklenmez — tarayıcıdaki hiçbir kontrol sağlayamaz.
     *
     * Gerçek koruma sunucudadır: veriye erişim, Google'ın imzaladığı kimlik
     * jetonu ve veritabanı kurallarıyla sınırlanır. Birisi bu satırları
     * konsoldan atlayıp app.html'i açsa bile karşısına BOŞ bir uygulama
     * çıkar; hiçbir okulun verisini çekemez.
     *
     * 2026-08-24 öncesinde durum böyle değildi: veritabanı kimlik istemiyordu,
     * dolayısıyla bu satırı atlamak gerçekten veriye erişim demekti.
     */
    requireAuth() {
        const session = this.getSession();
        if (!session || !session.kurumKodu) {
            window.location.href = "index.html";
            return false;
        }
        // Demo oturumu buluta hiç bağlanmaz; kimlik jetonu aranmaz.
        if (session.isDemo) return true;

        const kimlikVar = (typeof window !== "undefined" && window.firebaseAuth)
            ? window.firebaseAuth.oturumVar()
            : false;
        if (!kimlikVar) {
            // Oturum kaydı var ama kimlik jetonu yok/silinmiş: bulut
            // erişimi zaten çalışmaz. Kullanıcıyı sessizce boş bir ekranla
            // baş başa bırakmak yerine girişe döndürüyoruz.
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

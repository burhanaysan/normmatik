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
        } catch (e) {
            // SESSİZ KALMA: oturum yazılamazsa kullanıcı bir sonraki sayfada
            // sebepsiz yere çıkmış olur ve neden olduğunu anlayamaz.
            // (Gizli sekme, site verisi engelli ya da kota dolu olabilir.)
            try {
                if (typeof window !== "undefined" && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent("normmatik-yerel-durum", {
                        detail: {
                            basarili: false,
                            mesaj: "Oturum bilgisi bu tarayıcıya yazılamadı ("
                                 + ((e && e.name) || "bilinmeyen")
                                 + "); sayfa değiştirdiğinizde yeniden giriş isteyebilir."
                        }
                    }));
                }
            } catch (e2) { /* olay yayınlanamazsa akış bozulmaz */ }
        }
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
        // YEREL ÇALIŞMA YEDEĞİ DE KORUNUR (06.09.2026)
        // -------------------------------------------
        // Aynı gün eklenen yerel kalıcılık (state.js yereleKaydet) buradaki
        // localStorage.clear() yüzünden HER ÇIKIŞTA siliniyordu. Yani
        // güvenlik ağının hiçbir hükmü kalmıyordu: bulut kaydı sessizce
        // reddedilmiş bir müdür çıkış yaptığı anda çalışmasını kaybediyordu —
        // korumak için eklediğimiz şey tam da o senaryoda yok oluyordu.
        //
        // KARAR: yedek korunur. Veri okulun kendi bilgisayarındaki kendi
        // verisidir ve yalnızca aynı kurum koduyla girildiğinde okunur.
        // Ortak bilgisayarda iz bırakmamak isteyen kurum tarayıcı verisini
        // temizleyerek bunu yapabilir; buradaki öncelik veri kaybını önlemek.
        // Sürüm geçmişi de korunur: "dün akşamki hâline dön" özelliğinin
        // tamamı çıkışta silinirse hiçbir işe yaramaz.
        const KORUNAN_ONEKLER = ["normmatik_yerel_", "normmatik_surumler_"];
        try {
            const yedek = {};
            KORUNANLAR.forEach(k => {
                const v = localStorage.getItem(k);
                if (v !== null) yedek[k] = v;
            });
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && KORUNAN_ONEKLER.some(o => k.indexOf(o) === 0)) {
                    yedek[k] = localStorage.getItem(k);
                }
            }
            localStorage.clear();
            Object.keys(yedek).forEach(k => localStorage.setItem(k, yedek[k]));
        } catch (e) {
            // Temizlik yarıda kalırsa görünüm tercihleri kaybolabilir; veri
            // kaybı doğurmaz. Çıkışın kendisi aşağıda yine tamamlanır.
        }
        // Çıkışta temizlik: silinemese bile oturum anahtarı zaten üstte
        // kaldırıldı, kullanıcı için sonuç değişmez.
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

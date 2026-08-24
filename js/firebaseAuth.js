/**
 * NormMatik™ — Firebase Kimlik Doğrulama Servisi
 * Copyright (c) 2026 Burhan AYSAN.
 *
 * ================== NEDEN BU DOSYA VAR (2026-08-24) ==================
 * Önceki giriş tamamen TARAYICIDA karar veriliyordu:
 *   - Okul parolası, herkese açık kurum kodundan sabit bir kuralla
 *     türetiliyordu. Yani parola sır değildi; kurum kodunu bilen herkes
 *     her okulun parolasını hesaplayabiliyordu.
 *   - Giriş kontrolü bir `if` bloğuydu; tarayıcı konsolundan aşılabilirdi.
 *   - Veritabanı zaten kimlik istemiyordu, dolayısıyla giriş yalnızca
 *     bir görüntüden ibaretti.
 *
 * Artık kimlik Google tarafında doğrulanıyor ve veritabanı kuralları
 * `auth.uid` üzerinden erişimi zorluyor. Tarayıcıdaki kodu değiştiren biri
 * hiçbir şey kazanmıyor: token'ı sunucu imzalıyor, kural sunucuda çalışıyor.
 *
 * KULLANICI DENEYİMİ AYNI KALDI: ekranda yine "kurum kodu + parola" var.
 * E-posta adresi kurum kodundan türetiliyor, kullanıcı görmüyor.
 * =====================================================================
 *
 * GİZLİLİK NOTU: Aşağıdaki apiKey GİZLİ DEĞİLDİR. Firebase web anahtarları
 * projeyi tanımlar, yetki vermez. Güvenlik veritabanı kurallarından gelir
 * (09_firebase_guvenlik/database.rules.json). Anahtarı bilen biri, hesabı
 * olmadan hiçbir veriye erişemez.
 */

const FB_API_KEY = "AIzaSyBakAOLvTgNi66MOcaFIxccusWaCKA-p3E";
const FB_SIGNIN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FB_API_KEY}`;
const FB_REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${FB_API_KEY}`;
const FB_UPDATE_URL = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FB_API_KEY}`;

// Kurum kodundan üretilen e-posta alan adı. Gerçek posta kutusu değildir;
// yalnızca Firebase'in kimlik anahtarıdır.
const OKUL_EPOSTA_ALANI = "okul.normmatik.com.tr";

const DEPO_ANAHTARI = "normmatik_fb_kimlik";

// KALICI DEPOLAMA KULLANILMIYOR (2026-08-24 kararı).
// Kimlik jetonu sessionStorage'da tutulur: tarayıcı kapandığında oturum
// kendiliğinden biter ve diskte hiçbir iz kalmaz. Bedeli, her tarayıcı
// açılışında yeniden giriş yapılması; internet bankacılığındaki gibi.
// Aynı sekmede sayfalar arası geçiş (index.html -> app.html) etkilenmez.
const DEPO = () => (typeof sessionStorage !== "undefined") ? sessionStorage : null;

// idToken 1 saat geçerlidir. Süre dolmadan 5 dakika önce yenileriz ki
// uzun süren bir kaydetme işleminin ortasında token ölmesin.
const ERKEN_YENILEME_MS = 5 * 60 * 1000;

function kurumKoduToEposta(kurumKodu) {
    const temiz = String(kurumKodu || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${temiz}@${OKUL_EPOSTA_ALANI}`;
}

export class FirebaseAuthService {
    constructor() {
        this.kimlik = this._oku();
        this._yenilemeSozu = null;
    }

    // --------------------------------------------------------------- depo
    _oku() {
        try {
            const d = DEPO();
            const ham = d ? d.getItem(DEPO_ANAHTARI) : null;
            return ham ? JSON.parse(ham) : null;
        } catch (e) {
            return null;
        }
    }

    _yaz(kimlik) {
        this.kimlik = kimlik;
        try {
            const d = DEPO();
            if (!d) return;
            if (kimlik) d.setItem(DEPO_ANAHTARI, JSON.stringify(kimlik));
            else d.removeItem(DEPO_ANAHTARI);
        } catch (e) { /* özel mod: bellekte tutmaya devam ederiz */ }
    }

    // -------------------------------------------------------------- giriş
    /**
     * Kurum kodu + parola ile giriş.
     * Dönüş: { basarili, uid?, kurumKodu?, hata? }
     */
    async girisYap(kurumKodu, parola) {
        const kod = String(kurumKodu || "").trim();
        if (!kod || !parola) {
            return { basarili: false, hata: "Kurum kodu ve parola gereklidir." };
        }

        let res, cevap;
        try {
            res = await fetch(FB_SIGNIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: kurumKoduToEposta(kod),
                    password: String(parola),
                    returnSecureToken: true,
                }),
            });
            cevap = await res.json();
        } catch (e) {
            return { basarili: false, hata: "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin." };
        }

        if (!res.ok || !cevap.idToken) {
            return { basarili: false, hata: this._hataMetni(cevap) };
        }

        this._yaz({
            uid: cevap.localId,
            kurumKodu: kod,
            idToken: cevap.idToken,
            refreshToken: cevap.refreshToken,
            // expiresIn saniye cinsinden gelir.
            bitis: Date.now() + (parseInt(cevap.expiresIn, 10) || 3600) * 1000,
        });

        return { basarili: true, uid: cevap.localId, kurumKodu: kod };
    }

    /**
     * Google'ın hata kodlarını kullanıcıya anlatılabilir Türkçeye çevirir.
     * Kasıtlı olarak "kullanıcı yok" ile "parola yanlış" ayrımı YAPILMAZ:
     * ayrım yapmak, hangi kurum kodlarının kayıtlı olduğunu sızdırır.
     */
    _hataMetni(cevap) {
        const kod = cevap?.error?.message || "";
        if (kod === "CONFIGURATION_NOT_FOUND") {
            return "Kimlik doğrulama henüz etkinleştirilmemiş. Lütfen yöneticinize başvurun.";
        }
        if (kod.startsWith("TOO_MANY_ATTEMPTS")) {
            return "Çok fazla hatalı deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.";
        }
        if (kod === "USER_DISABLED") {
            return "Bu okul hesabı devre dışı bırakılmış. Lütfen yöneticinize başvurun.";
        }
        if (kod === "EMAIL_NOT_FOUND" || kod === "INVALID_PASSWORD" ||
            kod === "INVALID_LOGIN_CREDENTIALS") {
            return "Kurum kodu veya parola hatalı.";
        }
        return "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.";
    }

    // -------------------------------------------------------------- token
    /**
     * Geçerli bir idToken döndürür; gerekirse sessizce yeniler.
     * Yenilenemezse null döner (oturum düşmüştür).
     *
     * Eşzamanlı çağrılar tek bir yenileme isteğini paylaşır; yoksa otomatik
     * kayıt ile veri yükleme aynı anda yenileme tetikleyip birbirinin
     * token'ını geçersiz kılabilir.
     */
    async tokenAl() {
        const k = this.kimlik;
        if (!k || !k.refreshToken) return null;

        if (k.idToken && k.bitis && Date.now() < k.bitis - ERKEN_YENILEME_MS) {
            return k.idToken;
        }

        if (this._yenilemeSozu) return this._yenilemeSozu;

        this._yenilemeSozu = (async () => {
            try {
                const res = await fetch(FB_REFRESH_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(k.refreshToken)}`,
                });
                const cevap = await res.json();
                if (!res.ok || !cevap.id_token) {
                    // Yenileme jetonu iptal edilmiş ya da hesap silinmiş.
                    this._yaz(null);
                    return null;
                }
                this._yaz({
                    uid: cevap.user_id || k.uid,
                    kurumKodu: k.kurumKodu,
                    idToken: cevap.id_token,
                    refreshToken: cevap.refresh_token || k.refreshToken,
                    bitis: Date.now() + (parseInt(cevap.expires_in, 10) || 3600) * 1000,
                });
                return cevap.id_token;
            } catch (e) {
                // Ağ hatası: oturumu SİLMEYİZ. Kullanıcı çevrimdışı olabilir;
                // bağlantı gelince aynı refreshToken ile devam eder.
                return null;
            } finally {
                this._yenilemeSozu = null;
            }
        })();

        return this._yenilemeSozu;
    }

    // ------------------------------------------------------------- durum
    oturumVar() {
        return !!(this.kimlik && this.kimlik.refreshToken);
    }

    get uid() { return this.kimlik?.uid || null; }
    get kurumKodu() { return this.kimlik?.kurumKodu || null; }

    cikisYap() {
        this._yaz(null);
    }

    /** Okulun kendi parolasını değiştirmesi. */
    async parolaDegistir(yeniParola) {
        if (!yeniParola || String(yeniParola).length < 8) {
            return { basarili: false, hata: "Parola en az 8 karakter olmalıdır." };
        }
        const token = await this.tokenAl();
        if (!token) return { basarili: false, hata: "Oturum süresi dolmuş. Lütfen yeniden giriş yapın." };

        try {
            const res = await fetch(FB_UPDATE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idToken: token,
                    password: String(yeniParola),
                    returnSecureToken: true,
                }),
            });
            const cevap = await res.json();
            if (!res.ok || !cevap.idToken) {
                return { basarili: false, hata: this._hataMetni(cevap) };
            }
            this._yaz({
                ...this.kimlik,
                idToken: cevap.idToken,
                refreshToken: cevap.refreshToken || this.kimlik.refreshToken,
                bitis: Date.now() + (parseInt(cevap.expiresIn, 10) || 3600) * 1000,
            });
            return { basarili: true };
        } catch (e) {
            return { basarili: false, hata: "Sunucuya ulaşılamadı." };
        }
    }
}

export const firebaseAuth = new FirebaseAuthService();
if (typeof window !== "undefined") {
    window.firebaseAuth = firebaseAuth;
}

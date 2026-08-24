/**
 * NormMatik™ — Bulut Veri Servisi (CloudDatabaseService)
 * Copyright (c) 2026 Burhan AYSAN.
 *
 * ================== NEDEN DEĞİŞTİ (2026-08-24) ==================
 * Bu dosyanın eski hâli Realtime Database'e KİMLİK DOĞRULAMASIZ `PUT`
 * atıyordu. Ölçüldü: o adres tüm internete açıktı; kimliksiz tek bir
 * istekle bütün okulların listesi dönüyordu, adresi bilen herkes her
 * okulun verisini okuyabilir, değiştirebilir ve silebilirdi.
 *
 * Artık her istek, Google'ın imzaladığı bir kimlik jetonu taşıyor ve
 * veritabanı kuralları erişimi SUNUCUDA sınırlıyor:
 *
 *     school_data/<kurumKodu> okunur/yazılır  ANCAK
 *     okul_sahipleri/<kurumKodu> === auth.uid ise
 *
 * Yani tarayıcıdaki kodu değiştirmek hiçbir şey kazandırmaz; komşu okulun
 * kodunu yazsanız bile kural reddeder. Bkz. 09_firebase_guvenlik/
 *
 * DIŞ SÖZLEŞME KORUNDU. `loadSchoolData`, `scheduleAutoSave`,
 * `saveSchoolData`, `isSaving`, `lastSyncTime` imzaları aynıdır; app.js ve
 * state.js bu yüzden değişmedi.
 */

const RTDB_KOK = "https://normmatik-85118-default-rtdb.europe-west1.firebasedatabase.app";

// Geçici hatalarda (ağ koptu, 5xx) kaç kez yeniden denensin.
// Yetki reddi gibi KALICI hatalarda tekrar denenmez.
const YENIDEN_DENEME = 3;
const ILK_BEKLEME_MS = 800;

export class CloudDatabaseService {
    constructor() {
        this.saveTimeout = null;
        this.isSaving = false;
        this.lastSyncTime = null;
        this.baseUrl = RTDB_KOK;

        /**
         * Son bulut işleminin sonucu.
         *
         * Eskiden kayıt başarısızlığı YALNIZCA konsola yazılıyordu. Uygulama
         * okul verisini yerelde saklamadığı için bu, sessiz veri kaybı
         * demekti: kullanıcı saatlerce çalışır, hiçbir şey kaydedilmez ve
         * ekranda tek bir uyarı çıkmazdı. Durum artık burada tutuluyor ve
         * 'normmatik-bulut-durum' olayı olarak yayınlanıyor.
         */
        this.sonDurum = { basarili: null, mesaj: "", zaman: null, kalici: false };
    }

    /**
     * Kurum kodunu güvenli veri anahtarına çevirir.
     * Demo ve tanımsız okullar buluta yazılmaz.
     */
    getEffectiveKey(kurumKodu) {
        if (!kurumKodu || String(kurumKodu).trim() === "" || kurumKodu === "*" || kurumKodu === "123456") {
            return null;
        }
        return String(kurumKodu).trim().replace(/[.#$[\]]/g, "_");
    }

    _auth() {
        return (typeof window !== "undefined") ? window.firebaseAuth : null;
    }

    _durumBildir(basarili, mesaj, kalici = false) {
        this.sonDurum = { basarili, mesaj, zaman: new Date(), kalici };
        try {
            if (typeof window !== "undefined" && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent("normmatik-bulut-durum", {
                    detail: { ...this.sonDurum },
                }));
            }
        } catch (e) { /* olay yayınlanamazsa akış bozulmaz */ }
    }

    /**
     * Tek istek. Dönüş: { ok, veri?, mesaj?, kalici? }
     *   kalici=true  -> yetki/kural reddi; yeniden denemek anlamsız
     *   kalici=false -> ağ ya da sunucu hatası; yeniden denenebilir
     */
    /**
     * @param {string} yol  Veritabanı KÖKÜNE göre yol; örn "school_data/131313",
     *                      "abonelik/131313". Her parça ayrı kaçışlanır ki
     *                      bölü işareti yol ayıracı olarak korunsun.
     */
    async _istek(yol, yontem, govde) {
        const auth = this._auth();
        if (!auth || !auth.oturumVar()) {
            return { ok: false, mesaj: "Oturum yok. Lütfen yeniden giriş yapın.", kalici: true };
        }

        const token = await auth.tokenAl();
        if (!token) {
            return { ok: false, mesaj: "Oturum yenilenemedi. Bağlantınızı kontrol edin ya da yeniden giriş yapın.", kalici: false };
        }

        const guvenliYol = String(yol).split("/").filter(Boolean)
            .map(encodeURIComponent).join("/");
        const url = `${this.baseUrl}/${guvenliYol}.json?auth=${encodeURIComponent(token)}`;

        let res;
        try {
            res = await fetch(url, {
                method: yontem,
                headers: govde ? { "Content-Type": "application/json" } : undefined,
                body: govde ? JSON.stringify(govde) : undefined,
            });
        } catch (e) {
            return { ok: false, mesaj: "Sunucuya ulaşılamadı: " + e.message, kalici: false };
        }

        if (res.ok) {
            let veri = null;
            try { veri = await res.json(); } catch (e) { veri = null; }
            return { ok: true, veri };
        }

        // 401/403: kural reddetti ya da jeton geçersiz -> kalıcı.
        // 429/5xx: geçici.
        const kalici = res.status === 401 || res.status === 403 || res.status === 400;
        let mesaj = `Sunucu ${res.status} döndü.`;
        try {
            const h = await res.json();
            if (h && h.error) mesaj = String(h.error);
        } catch (e) { /* gövde okunamadıysa durum kodu yeter */ }

        if (kalici && /permission/i.test(mesaj)) {
            mesaj = "Bu okulun verisine erişim yetkiniz yok.";
        }
        return { ok: false, mesaj, kalici };
    }

    async _istekTekrarli(yol, yontem, govde) {
        let son = { ok: false, mesaj: "Bilinmeyen hata", kalici: false };
        for (let deneme = 0; deneme < YENIDEN_DENEME; deneme++) {
            son = await this._istek(yol, yontem, govde);
            if (son.ok || son.kalici) return son;
            if (deneme < YENIDEN_DENEME - 1) {
                await new Promise(r => setTimeout(r, ILK_BEKLEME_MS * Math.pow(2, deneme)));
            }
        }
        return son;
    }

    /** Okulun verilerini buluttan çeker. */
    async loadSchoolData(kurumKodu) {
        const key = this.getEffectiveKey(kurumKodu);
        if (!key) return null;

        const sonuc = await this._istekTekrarli("school_data/" + key, "GET", null);
        if (!sonuc.ok) {
            console.warn("☁️ [NormMatik Bulut] Veri yüklenemedi:", sonuc.mesaj);
            this._durumBildir(false, "Veri yüklenemedi: " + sonuc.mesaj, sonuc.kalici);
            return null;
        }

        const data = sonuc.veri;
        if (data && (Array.isArray(data.subeler) || data.okulAdi)) {
            this.lastSyncTime = new Date();
            this._durumBildir(true, "Veriler yüklendi.");
            console.log(`☁️ [NormMatik Bulut] Veriler çekildi (${(data.subeler || []).length} şube).`);
            return data;
        }

        // Kayıt yok: yeni okul. Hata değildir.
        this._durumBildir(true, "Bulutta kayıt yok (yeni okul).");
        return null;
    }

    /**
     * Okulun abonelik ve kimlik kaydını çeker.
     *
     * Bu iki düğümü okul OKUR ama DEĞİŞTİREMEZ (veritabanı kuralı reddeder).
     * Uygulamanın hakları — şube sınırı, dışa aktarım, bitiş tarihi —
     * buradan gelir. Eskiden bu bilgi, kullanıcının yapıştırdığı bir lisans
     * anahtarının içindeydi; yani kullanıcının elindeydi.
     *
     * Dönüş: { abonelik, kayit } — okunamayanlar null olur.
     */
    async loadLicenceInfo(kurumKodu) {
        const key = this.getEffectiveKey(kurumKodu);
        if (!key) return { abonelik: null, kayit: null };

        const [a, k] = await Promise.all([
            this._istekTekrarli("abonelik/" + key, "GET", null),
            this._istekTekrarli("okul_kayit/" + key, "GET", null),
        ]);
        return {
            abonelik: a.ok ? a.veri : null,
            kayit: k.ok ? k.veri : null,
        };
    }

    /** Otomatik kayıt (600 ms geciktirmeli). */
    scheduleAutoSave(kurumKodu, state) {
        const key = this.getEffectiveKey(kurumKodu);
        if (!key || !state) return;

        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(async () => {
            await this.saveSchoolData(key, state);
        }, 600);
    }

    /** Okul verilerini buluta kaydeder. */
    async saveSchoolData(kurumKodu, state) {
        const key = this.getEffectiveKey(kurumKodu);
        if (!key || !state) return;

        const veri = {
            kurumKodu: key,   // kural bunun yolla aynı olmasını şart koşuyor
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
            lastUpdated: new Date().toISOString(),
        };

        this.isSaving = true;
        const sonuc = await this._istekTekrarli("school_data/" + key, "PUT", veri);
        this.isSaving = false;

        if (sonuc.ok) {
            this.lastSyncTime = new Date();
            this._durumBildir(true, "Kaydedildi.");
            console.log(`☁️ [NormMatik Bulut] Kaydedildi (${veri.subeler.length} şube).`);
        } else {
            console.warn("☁️ [NormMatik Bulut] Kayıt başarısız:", sonuc.mesaj);
            this._durumBildir(false, "KAYIT BAŞARISIZ: " + sonuc.mesaj, sonuc.kalici);
        }
    }
}

export const cloudDbService = new CloudDatabaseService();
if (typeof window !== "undefined") {
    window.CloudDatabaseService = CloudDatabaseService;
    window.cloudDbService = cloudDbService;
}

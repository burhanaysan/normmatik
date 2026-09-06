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
        this.bekleyenKayit = null;
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

    /**
     * FIREBASE ANAHTAR KODLAMASI
     *
     * Realtime Database, nesne anahtarlarında şu karakterlere izin vermez:
     *     .  $  #  [  ]  /
     * Bir tanesi bile varsa İSTEĞİN TAMAMI reddedilir:
     *     "Invalid data; couldn't parse key ... Key value can't be empty
     *      or contain $ # [ ] / or ."
     *
     * Kadro verimiz BRANŞ ADLARINI anahtar olarak kullanıyor
     * (mevcutOgretmenler, koordinatorlukYukleri, yoneticiDersYukleri).
     * Branş listesinde "Kimya / Kimya Teknolojisi" var ve içinde "/" geçiyor.
     *
     * Kadro penceresi HER branş için anahtar yazdığı (sıfır girilse bile),
     * bir kez "Kaydet" denen okulda bu anahtar state'e giriyor ve O ANDAN
     * SONRA OKULUN BÜTÜN KAYITLARI REDDEDİLİYORDU — yalnızca kadro değil,
     * şubeler dâhil her şey. Uygulama veriyi yerelde saklamadığı için bu,
     * doğrudan veri kaybı demekti.
     * (Okul müdürü bildirimi, 05.09.2026.)
     *
     * Çözüm: anahtarlar yalnızca BULUT SINIRINDA kodlanır, uygulama içinde
     * okunabilir adlar kalır. Kodlama tersinirdir ve "~" içermeyen eski
     * anahtarlara dokunmaz; böylece daha önce kaydedilmiş veriler bozulmaz.
     */
    static get ANAHTAR_HARITASI() {
        return { "~": "~7E", ".": "~2E", "$": "~24", "#": "~23",
                 "[": "~5B", "]": "~5D", "/": "~2F" };
    }

    _anahtarKodla(s) {
        const h = CloudDatabaseService.ANAHTAR_HARITASI;
        // "~" ÖNCE çevrilmeli; sonra çevrilirse kendi kaçış dizilerini bozar.
        return String(s).replace(/[~.$#[\]/]/g, (c) => h[c] || c);
    }

    _anahtarCoz(s) {
        return String(s).replace(/~(7E|2E|24|23|5B|5D|2F)/g, (_, kod) => ({
            "7E": "~", "2E": ".", "24": "$", "23": "#",
            "5B": "[", "5D": "]", "2F": "/",
        })[kod]);
    }

    _haritaKodla(obj) {
        if (!obj || typeof obj !== "object") return obj;
        const c = {};
        for (const [k, v] of Object.entries(obj)) c[this._anahtarKodla(k)] = v;
        return c;
    }

    _haritaCoz(obj) {
        if (!obj || typeof obj !== "object") return obj;
        const c = {};
        for (const [k, v] of Object.entries(obj)) c[this._anahtarCoz(k)] = v;
        return c;
    }

    /**
     * Gönderilecek veride Firebase'in kabul etmeyeceği anahtar kaldı mı?
     *
     * Kodlamadan SONRA çalışır. Yeni bir alan eklenip kodlanması unutulursa
     * ya da beklenmedik bir karakter çıkarsa, istek sunucuya gitmeden burada
     * yakalanır ve sebebi ADIYLA bildirilir. Aksi hâlde sunucudan yalnızca
     * "couldn't parse key at 1:39504" gibi bir konum bilgisi döner ve hangi
     * alanın suçlu olduğu anlaşılmaz.
     */
    _gecersizAnahtarBul(deger, yol = "") {
        if (!deger || typeof deger !== "object") return null;
        if (Array.isArray(deger)) {
            for (let i = 0; i < deger.length; i++) {
                const b = this._gecersizAnahtarBul(deger[i], yol + "[" + i + "]");
                if (b) return b;
            }
            return null;
        }
        for (const [k, v] of Object.entries(deger)) {
            if (k === "" || /[.$#[\]/]/.test(k)) {
                return { yol: yol || "(kök)", anahtar: k };
            }
            const b = this._gecersizAnahtarBul(v, yol + "." + k);
            if (b) return b;
        }
        return null;
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
        if (data) {
            // Kaydederken kodlanan anahtarlar geri açılır. "~" içermeyen
            // eski kayıtlar olduğu gibi kalır.
            if (data.mevcutOgretmenler)
                data.mevcutOgretmenler = this._haritaCoz(data.mevcutOgretmenler);
            if (data.koordinatorlukYukleri)
                data.koordinatorlukYukleri = this._haritaCoz(data.koordinatorlukYukleri);
            if (data.adminOptions && data.adminOptions.yoneticiDersYukleri)
                data.adminOptions.yoneticiDersYukleri =
                    this._haritaCoz(data.adminOptions.yoneticiDersYukleri);
        }
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
        // KURUM KODU YOKSA KAYIT YAPILAMAZ — VE BU SESSİZ KALMAMALI.
        //
        // Burada eskiden sadece `return` vardı. Kurum kodu boş, "*" ya da
        // ayrılmış "123456" ise kayıt hiç denenmiyor, kullanıcıya da hiçbir
        // şey söylenmiyordu: idareci saatlerce çalışıp "kaydedildi" toast'ını
        // görüyor, veri hiçbir yere yazılmıyordu.
        // (Okul müdürü bildirimi, 05.09.2026: "kayıtlar veri tabanına kayıt
        //  olmuyor.")
        if (!key) {
            this._durumBildir(false,
                "Kurum kodu tanımlı değil; veriler buluta KAYDEDİLMİYOR.", true);
            return;
        }
        if (!state) return;

        clearTimeout(this.saveTimeout);
        // Bekleyen kaydı sekme kapanırken zorla gönderebilmek için sakla.
        this.bekleyenKayit = { kurumKodu: key, state };
        this.saveTimeout = setTimeout(async () => {
            this.bekleyenKayit = null;
            // saveSchoolData normalde kendi hatalarini yakalar; yine de
            // BEKLENMEDIK bir istisna buraya sizarsa islenmemis bir ret
            // olusuyordu: tarayicida yalnizca konsola dusuyor, kullaniciya
            // hicbir sey soylenmiyordu. Sessiz yol birakmiyoruz.
            try {
                await this.saveSchoolData(key, state);
            } catch (e) {
                this._durumBildir(false,
                    "Kayit sirasinda beklenmedik hata: " + ((e && e.message) || e), false);
            }
        }, 600);
    }

    /**
     * Bekleyen (600 ms geciktirilmiş) kaydı HEMEN gönderir.
     *
     * Neden var: kullanıcı son değişikliğini yapıp sekmeyi kapattığında kayıt
     * henüz denenmemiş bile oluyordu. Pencere kapanırken eşzamansız istek
     * tamamlanmayabilir — bu yüzden bu YALNIZCA ek bir şanstır, garanti değil.
     * Asıl güvence yerel kopyadır (state.js yereleKaydet): o, her değişiklikte
     * eşzamanlı olarak yazılır. (Kullanıcı kararı, 06.09.2026.)
     */
    flushPendingSave() {
        if (!this.bekleyenKayit) return false;
        const { kurumKodu, state } = this.bekleyenKayit;
        clearTimeout(this.saveTimeout);
        this.bekleyenKayit = null;
        try {
            // async islev REDDEDILMIS bir soz dondurebilir; sadece try/catch
            // bunu yakalamaz ve islenmemis ret olusur. .catch() sart.
            const sonuc = this.saveSchoolData(kurumKodu, state);
            if (sonuc && typeof sonuc.catch === "function") {
                sonuc.catch((e) => this._durumBildir(false,
                    "Kapanista kayit gonderilemedi: " + ((e && e.message) || e), false));
            }
        } catch (e) { return false; }
        return true;
    }

    /** Okul verilerini buluta kaydeder. */
    async saveSchoolData(kurumKodu, state) {
        const key = this.getEffectiveKey(kurumKodu);
        if (!key || !state) return;

        // adminOptions içindeki yoneticiDersYukleri de branş adıyla
        // anahtarlanıyor; o da kodlanmalı.
        const adminSecenekleri = Object.assign({}, state.okulBilgisi?.adminOptions || {});
        if (adminSecenekleri.yoneticiDersYukleri) {
            adminSecenekleri.yoneticiDersYukleri =
                this._haritaKodla(adminSecenekleri.yoneticiDersYukleri);
        }

        const veri = {
            kurumKodu: key,   // kural bunun yolla aynı olmasını şart koşuyor
            okulAdi: state.okulBilgisi?.okulAdi || "MEB Okulu",
            okulTuru: state.okulBilgisi?.okulTuru || "mesleki_ve_teknik_anadolu_lisesi",
            sezon: state.okulBilgisi?.sezon || "2026-2027",
            il: state.okulBilgisi?.il || "",
            ilce: state.okulBilgisi?.ilce || "",
            subeler: state.subeler || [],
            // Branş adları anahtar olarak kullanılıyor; Firebase'in yasak
            // karakterleri için kodlanır (bkz. _anahtarKodla).
            mevcutOgretmenler: this._haritaKodla(state.mevcutOgretmenler || {}),
            koordinatorlukYukleri: this._haritaKodla(state.koordinatorlukYukleri || {}),
            adminOptions: adminSecenekleri,
            antet: state.okulBilgisi?.antet || {},
            lastUpdated: new Date().toISOString(),
        };

        // ÖN DENETİM: geçersiz anahtar kaldıysa sunucuya gitmeden yakala.
        const bozuk = this._gecersizAnahtarBul(veri);
        if (bozuk) {
            const m = `Kaydedilemeyen alan adı: "${bozuk.anahtar}" (${bozuk.yol}). `
                    + "Bu ad veritabanında anahtar olarak kullanılamaz; lütfen bildirin.";
            console.error("☁️ [NormMatik Bulut] " + m);
            this._durumBildir(false, "KAYIT BAŞARISIZ: " + m, true);
            return;
        }

        this.isSaving = true;
        const sonuc = await this._istekTekrarli("school_data/" + key, "PUT", veri);
        this.isSaving = false;

        if (sonuc.ok) {
            this.lastSyncTime = new Date();
            this._durumBildir(true, "Kaydedildi.");
            console.log(`☁️ [NormMatik Bulut] Kaydedildi (${veri.subeler.length} şube).`);
            return;
        }

        console.warn("☁️ [NormMatik Bulut] Kayıt başarısız:", sonuc.mesaj);

        // KALICI HATADA SEBEBİ TEŞHİS ET.
        //
        // Veritabanı kuralı her ret için aynı şeyi döndürür: "Permission
        // denied". Kullanıcıya "erişim yetkiniz yok" demek, hangi şartın
        // tutmadığını gizler ve sorun çözülemez hâle gelir.
        // (Okul müdürü bildirimi, 05.09.2026: kadro kaydında "kaydedilmedi"
        //  uyarısı çıkıyor ama sebebi anlaşılmıyor.)
        //
        // Kural üç şey ister: sahiplik, süren abonelik ve okulAdi/okulTuru/
        // kurumKodu'nun okul_kayit ile BİREBİR aynı olması. İlk ikisi
        // istemciden görülemez ama son üçü görülebilir — okul kendi
        // okul_kayit ve abonelik düğümlerini OKUYABİLİR.
        let ayrinti = sonuc.mesaj;
        if (sonuc.kalici) {
            try {
                const teshis = await this._kayitTanila(key, veri);
                if (teshis) ayrinti = teshis;
            } catch (e) { /* teşhis başarısızsa genel mesaj kalır */ }
        }
        this._durumBildir(false, "KAYIT BAŞARISIZ: " + ayrinti, sonuc.kalici);
    }

    /**
     * Kayıt reddinin sebebini istemci tarafında belirler.
     *
     * Dönüş: açıklayıcı metin ya da null (sebep bulunamadıysa).
     */
    async _kayitTanila(key, veri) {
        const [a, k] = await Promise.all([
            this._istekTekrarli("abonelik/" + key, "GET", null),
            this._istekTekrarli("okul_kayit/" + key, "GET", null),
        ]);

        // okul_kayit okunamıyorsa okul ya kayıtlı değil ya da bu hesap
        // sahibi değil. İkisi de kuralın ilk şartını düşürür.
        if (!k.ok || !k.veri) {
            return "Bu kurum kodu için okul kaydı bulunamadı ya da bu hesap "
                 + "okulun sahibi değil. Kayıt yapılamaz.";
        }

        const kayit = k.veri;
        if (veri.okulAdi !== kayit.okulAdi) {
            return `Okul adı kayıtla uyuşmuyor. Ekranda "${veri.okulAdi}", `
                 + `kayıtta "${kayit.okulAdi}". Veritabanı kuralı birebir aynı olmasını şart koşuyor.`;
        }
        if (veri.okulTuru !== kayit.okulTuru) {
            return `Okul türü kayıtla uyuşmuyor. Ekranda "${veri.okulTuru}", `
                 + `kayıtta "${kayit.okulTuru}". Okul türünü uygulamadan değiştirmek kaydı engeller.`;
        }
        if (veri.kurumKodu !== key) {
            return `Kurum kodu tutarsız: veri "${veri.kurumKodu}", yol "${key}".`;
        }

        const bitisMs = a.ok && a.veri ? Number(a.veri.bitisMs) : null;
        if (!bitisMs) {
            return "Abonelik kaydı okunamadı; süre bilgisi olmadan kayıt yapılamıyor.";
        }
        if (bitisMs <= Date.now()) {
            const g = new Date(bitisMs).toLocaleDateString("tr-TR");
            return `Abonelik süresi dolmuş (bitiş: ${g}). Süre uzatılmadan veri kaydedilemez.`;
        }

        return null;   // bilinen şartların hepsi tutuyor; sebep başka
    }
}

export const cloudDbService = new CloudDatabaseService();
if (typeof window !== "undefined") {
    window.CloudDatabaseService = CloudDatabaseService;
    window.cloudDbService = cloudDbService;
}

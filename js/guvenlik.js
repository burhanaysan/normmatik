/**
 * NORMMATİK — GÜVENLİ METİN (TEK KAYNAK)
 * =============================================================================
 * NEDEN VAR (Denetim Dalga 1, bulgu G-01 · Kritik · 15.09.2026):
 *   Okulun kendi yazdığı metinler (şube adı, branş adı, ders adı, antet
 *   alanları, logo) ekrana HTML olarak, süzülmeden basılıyordu. Bulut
 *   kuralları bu alanlarda yalnızca uzunluğa bakıyor. Kötü niyetli bir okul
 *   şube adına kod yazarsa, YÖNETİCİ o okulu açtığı anda kod yöneticinin
 *   tarayıcısında çalışıyor ve yönetici oturumuyla bütün okulların verisi
 *   okunup değiştirilebiliyordu. Hakem bunu deneme ortamında uçtan uca
 *   kanıtladı.
 *
 * İKİ KATMAN:
 *   1) durumuTemizle — okul verisi uygulamaya HANGİ YOLDAN girerse girsin
 *      (bulut, bu tarayıcıdaki yerel kopya, sürüm geçmişi, proje dosyası)
 *      state.sanitizeExistingState() üzerinden buradan geçer. Metinlerden
 *      < ve > atılır, çift tırnak tipografik tırnağa (”) çevrilir, kimlikler
 *      yalnızca harf/rakam/_/- bırakılır, logo gerçek bir resim değilse atılır.
 *      Bu katman, çizicilerde tek tek unutulmuş bir yer kalsa bile korur.
 *   2) htmlKacis — okul açılır açılmaz çizilen ekranlar (şube listesi, şube
 *      başlığı, norm tablosu) ve logo/e-Okul önizlemesi, basmadan önce
 *      ayrıca kaçışlar.
 *
 * TEMİZLİK YERİNDE YAPILIR: şube ve ders nesnelerinin yerine yenisi konmaz.
 *   Arayüz ve testler şube nesnesine başvuru tutuyor; yeni nesne üretmek o
 *   başvuruları sessizce eski kopyada bırakırdı (ilk sürümde test_bransSecimi
 *   yakaladı, 15.09.2026).
 *
 * DOKUNULMAYAN ALAN: okulBilgisi.okulAdi. Bulut kuralı bu adın okul_kayit'taki
 *   adla BİREBİR aynı olmasını şart koşuyor; değiştirilirse okulun bütün
 *   kayıtları reddedilir. Bu ad yalnızca yöneticinin yazabildiği okul_kayit'tan
 *   gelir, okulun saldırı yolu değildir.
 */
const NormGuvenlik = {
    /** HTML'e (metin ya da çift/tek tırnaklı öznitelik) basılacak değeri kaçışlar. */
    htmlKacis(deger) {
        return String(deger == null ? "" : deger)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    },

    /**
     * SAKLANAN metni zararsızlaştırır. Tek tırnağa DOKUNMAZ: "Kur'an-ı Kerim"
     * gibi resmî ders adları onu taşıyor. Ekranda tek tırnaklı bağlama okul
     * verisi basan şablon yok (15.09.2026'da tarandı); çift tırnak yeterli.
     */
    metin(deger) {
        if (typeof deger !== "string") return deger;
        return deger.replace(/[<>]/g, "").replace(/"/g, "”");
    },

    /**
     * Şube kimliği gibi değerlerde yalnızca harf, rakam, _ ve - kalır.
     * Türkçe harfler KORUNUR: demo şubelerinin kimliği şube adından türetiliyor
     * ("sube_demo_9ç" olabilir); yalnız ASCII bırakmak iki şubeyi aynı kimliğe
     * düşürürdü.
     */
    kimlik(deger) {
        if (typeof deger !== "string") return deger;
        return deger.replace(/[^\p{L}\p{N}_\-]/gu, "");
    },

    /**
     * Logo yalnızca base64 kodlu gerçek bir resim olabilir. Başka her şey
     * (dış adres, javascript:, tırnak içeren değer) null döner.
     * SVG kabul edilir: <img> içinde SVG'nin betiği çalışmaz ve base64
     * alfabesinde tırnak olmadığı için öznitelikten çıkamaz.
     */
    logo(deger) {
        if (typeof deger !== "string") return null;
        return /^data:image\/(png|jpe?g|webp|gif|bmp|svg\+xml);base64,[A-Za-z0-9+/=\s]+$/.test(deger)
            ? deger : null;
    },

    /**
     * Değeri YERİNDE temizler: dizi ve nesnelerde aynı nesne korunur, metin
     * için temizlenmiş metin döner. Nesne anahtarları da temizlenir (branş
     * adıyla anahtarlanan tablolar).
     */
    _derin(deger) {
        if (typeof deger === "string") return this.metin(deger);
        if (Array.isArray(deger)) {
            for (let i = 0; i < deger.length; i++) deger[i] = this._derin(deger[i]);
            return deger;
        }
        if (deger && typeof deger === "object") {
            for (const k of Object.keys(deger)) {
                const v = this._derin(deger[k]);
                const temizAnahtar = this.metin(k);
                if (temizAnahtar === k) {
                    deger[k] = v;
                    continue;
                }
                delete deger[k];
                if (!(temizAnahtar in deger)) {
                    deger[temizAnahtar] = v;
                } else if (typeof deger[temizAnahtar] === "number" && typeof v === "number") {
                    // Aynı temiz ada düşen iki sayı (ör. öğretmen sayısı) toplanır.
                    deger[temizAnahtar] += v;
                }
            }
            return deger;
        }
        return deger;
    },

    _subeyiTemizle(sube) {
        if (!sube || typeof sube !== "object") return sube;
        this._derin(sube);
        if (typeof sube.id === "string") sube.id = this.kimlik(sube.id);
        for (const liste of ["zorunluDersler", "secmeliDersler"]) {
            if (!Array.isArray(sube[liste])) continue;
            sube[liste].forEach(d => {
                if (d && Array.isArray(d.birlesikSubeler)) {
                    for (let i = 0; i < d.birlesikSubeler.length; i++) {
                        if (typeof d.birlesikSubeler[i] === "string") {
                            d.birlesikSubeler[i] = this.kimlik(d.birlesikSubeler[i]);
                        }
                    }
                }
            });
        }
        return sube;
    },

    /** Uygulama durumunu YERİNDE temizler ve aynı nesneyi döndürür. */
    durumuTemizle(durum) {
        if (!durum || typeof durum !== "object") return durum;

        const ob = durum.okulBilgisi;
        if (ob && typeof ob === "object") {
            for (const k of Object.keys(ob)) {
                if (k === "okulAdi") continue;                 // bkz. dosya başı
                if (k === "antet" && ob.antet && typeof ob.antet === "object") {
                    for (const ak of Object.keys(ob.antet)) {
                        if (ak === "logoBase64") {
                            if (ob.antet.logoBase64) ob.antet.logoBase64 = this.logo(ob.antet.logoBase64);
                        } else {
                            ob.antet[ak] = this._derin(ob.antet[ak]);
                        }
                    }
                    continue;
                }
                ob[k] = this._derin(ob[k]);
            }
        }

        if (Array.isArray(durum.subeler)) durum.subeler.forEach(s => this._subeyiTemizle(s));
        for (const tablo of ["mevcutOgretmenler", "koordinatorlukYukleri"]) {
            if (durum[tablo] && typeof durum[tablo] === "object") this._derin(durum[tablo]);
        }
        if (typeof durum.aktifSubeId === "string") {
            durum.aktifSubeId = this.kimlik(durum.aktifSubeId);
        }
        return durum;
    }
};

if (typeof window !== 'undefined') {
    window.NormGuvenlik = NormGuvenlik;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NormGuvenlik };
}

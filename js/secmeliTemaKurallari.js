/* ===========================================================================
   NormMatik™ — SEÇMELİ DERS TEMA KURALLARI
   ===========================================================================
   NEDEN VAR (kullanıcı sorusu, 07.09.2026)
   ----------------------------------------
   "3-Tema Seçmeli Ders Tercih Dengesi" sekmesi mevzuata uygun mu? Ölçüldü,
   DEĞİLDİ. Üç ayrı kusur vardı:

     1) Tema, dersin ADINDAN tahmin ediliyordu ("din" geçiyorsa Değer, "sanat"
        geçiyorsa Sanat...). Oysa resmî grup bilgisi zaten her seçmeli dersin
        `grup` alanında duruyordu. Eşleşmeyen her ders SESSİZCE "Bilim"
        sayılıyordu.
     2) Tek bir kural bütün okullara uygulanıyordu: "üç temanın üçü de olmalı."
        Bu kural yalnızca ortaokulda ve 9-10. sınıflarda doğru. Diğer her yerde
        YANLIŞ UYARI üretiyordu.
     3) Kaynak veride grup adı satır kırılması yüzünden ikiye bölünmüştü
        ("İNSAN, TOPLUM" + "VE BİLİM"). Bu dosyadaki kanonikleştirme onu da
        onarır — hem havuzdaki hem müşteride KAYITLI eski veriyi.

   BU DOSYA ELLE YAZILDI ama kuralların tamamı kaynağından okundu; her kuralın
   yanında hangi TTKB kararından geldiği yazılıdır. Kaynağı bulunamayan yere
   KURAL YAZILMADI — uyarı üretmeyen okul türleri bilinçli olarak boştur.

   Kapsam kararı: kural metni bulunamayan yerde uyarı gösterilmez. Dayanağı
   gösterilemeyen bir uyarı, uyarı olmamasından kötüdür.
   ======================================================================== */

const SECMELI_TEMA_KURALLARI = {

    /* ---- ÜÇ RESMÎ TEMA ------------------------------------------------ */
    TEMALAR: {
        BILIM: { id: "BILIM", ad: "İnsan, Toplum ve Bilim", kisa: "İnsan/Toplum/Bilim", ikon: "🔬", renk: "#0284c7" },
        DEGER: { id: "DEGER", ad: "Din, Ahlak ve Değer", kisa: "Din/Ahlak/Değer", ikon: "🕌", renk: "#7c3aed" },
        SANAT: { id: "SANAT", ad: "Kültür, Sanat ve Spor", kisa: "Kültür/Sanat/Spor", ikon: "🎨", renk: "#b45309" }
    },

    /* Tema OLMAYAN ama havuzda bulunan gruplar. Sayıma katılmaz, ayrı gösterilir. */
    DIGER_GRUPLAR: {
        AKADEMIK: { id: "AKADEMIK", ad: "Akademik Çalışmalar", ikon: "📚", renk: "#475569" },
        OKUL_OZEL: { id: "OKUL_OZEL", ad: "Okul Türüne Özel Gruplar", ikon: "🏫", renk: "#0f766e" },
        PROGRAM: { id: "PROGRAM", ad: "Program/Proje Dersleri", ikon: "🧩", renk: "#be185d" },
        BILINMIYOR: { id: "BILINMIYOR", ad: "Grubu Belirsiz", ikon: "❔", renk: "#9ca3af" }
    },

    /* ---- HAM GRUP ADI -> TEMA ------------------------------------------
       Havuzdaki 25 farklı ham grup adının TAMAMI tarandı ve buraya yazıldı.
       Yarım adlar (PDF satır kırılmasından) bilerek listede: müşterinin
       şubesinde KAYITLI eski `grup` değerleri de doğru çözülsün diye.       */
    HAM_ESLEME: {
        // İnsan, Toplum ve Bilim — tam ve yarım hâlleri
        "insan toplum ve bilim": "BILIM",
        "insan toplum ve": "BILIM",
        "insan toplum": "BILIM",
        "ve bilim": "BILIM",
        "bilim": "BILIM",
        // Din, Ahlak ve Değer
        "din ahlak ve deger": "DEGER",
        "din ahlak": "DEGER",
        "ve deger": "DEGER",
        // Kültür, Sanat ve Spor — tam ve yarım hâlleri
        "kultur sanat ve spor": "SANAT",
        "kultur sanat ve": "SANAT",
        "kultur sanat": "SANAT",
        "ve spor": "SANAT",
        // Tema olmayanlar
        "akademik calismalar": "AKADEMIK",
        "temel islam bilimleri": "OKUL_OZEL",
        "turk islam sanatlari": "OKUL_OZEL",
        "secmeli": "BILINMIYOR"
    },

    /* Türkçe güvenli sadeleştirme.
       toLocaleUpperCase/LowerCase EŞLEME ANAHTARI için kullanılmaz: "İ"
       küçültülünce ayrı bir nokta karakteri üretir ve eşleşme kaçar. */
    sadelestir(s) {
        return String(s == null ? "" : s)
            .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
            .replace(/Ş/g, "s").replace(/ş/g, "s")
            .replace(/Ğ/g, "g").replace(/ğ/g, "g")
            .replace(/Ü/g, "u").replace(/ü/g, "u")
            .replace(/Ö/g, "o").replace(/ö/g, "o")
            .replace(/Ç/g, "c").replace(/ç/g, "c")
            .replace(/Â/g, "a").replace(/â/g, "a")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim();
    },

    /**
     * Ham grup adını tema kimliğine çevirir.
     * Dönüş: "BILIM" | "DEGER" | "SANAT" | "AKADEMIK" | "OKUL_OZEL"
     *        | "PROGRAM" | "BILINMIYOR"
     *
     * ASLA sessizce bir temaya düşmez. Çözülemeyen "BILINMIYOR" döner ve
     * raporda ayrı gösterilir — eski kodun en tehlikeli yanı, tanımadığı her
     * dersi "Bilim" sayıp dengeyi olduğundan iyi göstermesiydi.
     */
    temaCoz(grupAdi) {
        const n = this.sadelestir(grupAdi);
        if (!n) return "BILINMIYOR";
        if (Object.prototype.hasOwnProperty.call(this.HAM_ESLEME, n)) return this.HAM_ESLEME[n];
        // İHL/İHO program-proje grupları: "... PROGRAMI/PROJESİ DERSLERİ"
        if (n.indexOf("programi") >= 0 || n.indexOf("projesi") >= 0 || n.indexOf("program secmeli") >= 0) {
            return "PROGRAM";
        }
        return "BILINMIYOR";
    },

    temaMi(id) { return id === "BILIM" || id === "DEGER" || id === "SANAT"; },

    /* ---- KURALLAR ------------------------------------------------------
       Her kaydın `kaynak` alanı, kuralın okunduğu resmî belgedir.
       `enAzFarkli`: listelenen temalardan KAÇ FARKLISINDAN en az birer ders
       seçilmiş olmalı. Liste uzunluğuna eşitse "hepsinden" demektir.        */
    KURALLAR: [
        {
            ad: "Ortaokul — üç grubun her birinden",
            turler: ["ortaokul_temel_egitim"],
            seviyeler: ["5", "6", "7", "8"],
            temalar: ["BILIM", "DEGER", "SANAT"],
            enAzFarkli: 3,
            metin: "Üç seçmeli ders grubunun her birinden her yıl en az birer ders seçilmesi zorunludur.",
            kaynak: "İlköğretim Kurumları (İlkokul-Ortaokul) Haftalık Ders Çizelgesi — Uygulama Açıklamaları"
        },
        {
            ad: "Genel liseler 9-10 — üç grubun her birinden",
            turler: ["anadolu_lisesi", "hazirlik_anadolu_lisesi", "fen_lisesi", "hazirlik_fen_lisesi",
                     "sosyal_bilimler_lisesi", "ozel_program_fen_lisesi", "ozel_program_sosyal_lisesi"],
            seviyeler: ["9", "10"],
            temalar: ["BILIM", "DEGER", "SANAT"],
            enAzFarkli: 3,
            metin: "9 ve 10. sınıfta üç seçmeli ders grubunun her birinden en az birer ders seçilmesi zorunludur.",
            kaynak: "TTKB Sayı 05 (Anadolu/Fen/Sosyal Bilimler Lisesi) · Sayı 24 · Sayı 25"
        },
        {
            ad: "Genel liseler 11-12 — üç gruptan en az ikisi",
            turler: ["anadolu_lisesi", "hazirlik_anadolu_lisesi", "fen_lisesi", "hazirlik_fen_lisesi",
                     "sosyal_bilimler_lisesi", "ozel_program_fen_lisesi", "ozel_program_sosyal_lisesi"],
            seviyeler: ["11", "12"],
            temalar: ["BILIM", "DEGER", "SANAT"],
            enAzFarkli: 2,
            metin: "11 ve 12. sınıfta üç seçmeli ders grubunun en az ikisinden birer ders seçilmesi zorunludur.",
            kaynak: "TTKB Sayı 05 (Anadolu/Fen/Sosyal Bilimler Lisesi) · Sayı 24 · Sayı 25"
        },
        {
            ad: "Güzel sanatlar ve spor liseleri — iki grup",
            turler: ["guzel_sanatlar_gorsel", "guzel_sanatlar_muzik", "guzel_sanatlar_tiyatro",
                     "guzel_sanatlar_turk_muzigi", "spor_lisesi"],
            seviyeler: ["9", "10", "11", "12"],
            temalar: ["BILIM", "DEGER"],
            enAzFarkli: 2,
            metin: "Her sınıf seviyesinde “İnsan, Toplum ve Bilim” ile “Din, Ahlak ve Değer” gruplarından en az birer ders seçilmelidir.",
            kaynak: "TTKB Sayı 06 (Görsel/Tiyatro) · Sayı 07 (Müzik/Türk Müziği) · Sayı 09 (Spor Lisesi)"
        }
        /* KURAL YAZILMAYAN TÜRLER — bilinçli boşluk, eksik değil:
           · anadolu_imam_hatip_lisesi / hazirlik_imam_hatip_lisesi
                Çizelgede tema değil "A" ve "B" grubu var (md. 1). Program
                türüne göre yalnız A ya da A+B seçilebilir (md. 8). Tema
                uyarısı üretmek yanlış olurdu.
           · imam_hatip_ortaokulu
                Ana çizelgede üç tema başlığı VAR ama 14 açıklamanın hiçbirinde
                seçim kuralı YOK. Kendi çizelgesi kuralı tekrarlamıyor.
                Dağılım bilgi olarak gösterilir, uyarı çıkmaz.
           · mesleki_ve_teknik_anadolu_lisesi, anadolu_teknik_programi,
             meslek_okulu, meslek_ortaokulu, mesleki_egitim_merkezi
                5 MTEGM çizelgesinde tema kuralı hiç geçmiyor (0 eşleşme).
           · ozel_egitim_*  -> çizelgelerinde "seçmeli" kelimesi bile yok.
           · hazırlık sınıfı -> kural metni yalnızca 9-12'yi sayıyor.          */
    ],

    /* Okul türü + sınıf seviyesi için geçerli kuralı bulur. Yoksa null. */
    kuralBul(okulTuru, sinifSeviyesi) {
        const t = String(okulTuru || "");
        const s = String(sinifSeviyesi == null ? "" : sinifSeviyesi).trim();
        for (const k of this.KURALLAR) {
            if (k.turler.indexOf(t) >= 0 && k.seviyeler.indexOf(s) >= 0) return k;
        }
        return null;
    },

    /* Okul türü için açıklayıcı not (kuralı olmayanlarda "neden uyarı yok"). */
    TUR_NOTLARI: {
        anadolu_imam_hatip_lisesi:
            "Anadolu imam hatip liselerinde seçmeli dersler üç temaya değil “A” ve “B” grubuna ayrılır. Uygulanan program/projeye göre öğrenci yalnız “A” ya da “A ve B” gruplarından seçim yapar (DÖGM çizelgesi md. 1 ve md. 8). Bu nedenle tema dengesi uyarısı gösterilmez.",
        hazirlik_imam_hatip_lisesi:
            "Anadolu imam hatip liselerinde seçmeli dersler üç temaya değil “A” ve “B” grubuna ayrılır (DÖGM çizelgesi md. 1 ve md. 8). Bu nedenle tema dengesi uyarısı gösterilmez.",
        imam_hatip_ortaokulu:
            "İmam hatip ortaokulu çizelgesinde tema başlıkları yer alıyor, ancak çizelge açıklamalarında “her gruptan en az birer ders” türünde bir seçim kuralı bulunmuyor. Dayanağı olmayan uyarı üretmemek için dağılım yalnızca bilgi amaçlı gösterilir.",
        mesleki_ve_teknik_anadolu_lisesi:
            "Mesleki ve teknik ortaöğretim çizelgelerinde seçmeli ders tema kuralı bulunmuyor; seçmeliler alan/dal yapısına göre belirlenir.",
        anadolu_teknik_programi:
            "Mesleki ve teknik ortaöğretim çizelgelerinde seçmeli ders tema kuralı bulunmuyor.",
        meslek_okulu:
            "Mesleki ve teknik ortaöğretim çizelgelerinde seçmeli ders tema kuralı bulunmuyor.",
        mesleki_egitim_merkezi:
            "Mesleki eğitim merkezi (MESEM) çizelgelerinde seçmeli ders tema kuralı bulunmuyor.",
        ozel_egitim_meslek_okulu:
            "Özel eğitim çizelgelerinde seçmeli ders yapısı bulunmuyor.",
        ozel_egitim_uygulama_okulu:
            "Özel eğitim çizelgelerinde seçmeli ders yapısı bulunmuyor."
    },

    turNotu(okulTuru) { return this.TUR_NOTLARI[String(okulTuru || "")] || ""; },

    /* ---- HAVUZ: TEK YETKİLİ GRUP KAYNAĞI -------------------------------
       Ders şubeye eklenirken `grup` alanı kopyalanıyor. Kaynak çizelgede bir
       düzeltme yapılırsa o kopya ESKİ kalır ve ekranda yanlış tema görünür
       (müşteri bildirdi, 07.09.2026: Adabımuaşeret ile Türk Sosyal Hayatında
       Aile, çizelge düzeltildiği hâlde "Din, Ahlak ve Değer" görünüyordu).

       Bu yüzden tema, önce HAVUZDAN okunur; kayıtlı değer yalnızca havuzda
       bulunamayan dersler için yedektir. Müşteri verisine dokunmadan,
       geçmişte eklenmiş dersler de kendiliğinden düzelir.                  */
    _havuzDizini: null,

    _dizinKur() {
        const H = (typeof window !== "undefined" && window.SECMELI_HAVUZU)
            ? window.SECMELI_HAVUZU
            : (typeof SECMELI_HAVUZU !== "undefined" ? SECMELI_HAVUZU : null);
        const d = {};
        if (H) {
            Object.keys(H).forEach((tur) => {
                d[tur] = {};
                const siniflar = H[tur] || {};
                Object.keys(siniflar).forEach((sinif) => {
                    (siniflar[sinif] || []).forEach((k) => {
                        const ad = this.sadelestir(k && k.ders);
                        if (ad && k.grup && !d[tur][ad]) d[tur][ad] = k.grup;
                    });
                });
            });
        }
        this._havuzDizini = d;
        return d;
    },

    /** Okul türü + ders adı için resmî çizelgedeki grup. Yoksa "". */
    havuzdanGrup(okulTuru, dersAdi) {
        const d = this._havuzDizini || this._dizinKur();
        const t = d[String(okulTuru || "")];
        if (!t) return "";
        return t[this.sadelestir(dersAdi)] || "";
    },

    /** Tema kimliği: önce havuz, sonra kayıtlı değer. */
    temaCozOncelikli(okulTuru, dersAdi, kayitliGrup) {
        const h = this.havuzdanGrup(okulTuru, dersAdi);
        return this.temaCoz(h || kayitliGrup);
    },

    /* ---- HEDEF TEMELLİ DESTEK EĞİTİMİ ---------------------------------
       Ayrı bir kural: içerik listesi ve DERS BAŞINA 1-3 saat sınırı.
       Kaynak: TTKB Sayı 05 ve DÖGM İHL çizelgesi md. 34 (aynı ifade).
       Kapsam listesi js/hedef_temelli_dersler.js içinde ÜRETİLMİŞ hâlde.    */
    hedefTemelliMi(dersAdi) {
        return this.sadelestir(dersAdi).indexOf("hedef temelli") >= 0;
    }
};

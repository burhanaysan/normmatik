/**
 * NormMatik™ — ŞUBE PROGRAMI (29.10.2026)
 *
 * NEDEN VAR
 * ---------
 * Bazı okullarda TEK kurum kodu altında birden çok program yürür:
 *   - Çok Programlı Anadolu Lisesi : Anadolu (AL) + Anadolu Meslek Programı (AMP) + MESEM
 *   - Bünyesinde MESEM bulunan Mesleki ve Teknik Anadolu Lisesi : AMP + MESEM
 * Okul türü kayıt başına TEK değerdir ve ders listesi, hedef saat, grup bölünmesi,
 * MESEM çırak baremi okul türüne bakar. Bu yüzden bu okullar doğru hesaplanamıyordu.
 *
 * Müdür yardımcısı arkadaşın yöntemi (MEBBİS): AMP'yi kendi kurallarıyla, MESEM'i kendi
 * kurallarıyla (müstakil MESEM imiş gibi) AYRI hesaplar, branş saatlerini toplayıp
 * MEBBİS'e girer. Uygulama aynı işi yapar: şubenin `program` alanı hangi kuralların
 * geçerli olduğunu söyler.
 *
 * DEĞİŞMEZ (mevcut müşteri kayıtları)
 * -----------------------------------
 * `program` alanı YALNIZ bu iki durumda okunur; başka her durumda okul türü aynen döner:
 *   1) okul türü "cok_programli_anadolu_lisesi" (yeni tür; mevcut kayıtta yoktur)
 *   2) okul türü Mesleki ve Teknik Anadolu Lisesi VE şubenin programı AÇIKÇA "mesem"
 * Eski kayıtta şubede `program` yoktur -> okul türü değişmeden döner -> hesap bit bit aynı.
 * (test_cokProgramli.mjs bunu eski bir kayıtla ölçer.)
 */

const PROGRAMLAR = {
    // program kimliği -> motorun kural seçerken kullandığı ETKİN okul türü
    OKUL_TURU: {
        al: "anadolu_lisesi",
        amp: "mesleki_ve_teknik_anadolu_lisesi",
        mesem: "mesleki_egitim_merkezi"
    },
    AD: {
        al: "Anadolu Lisesi",
        amp: "Anadolu Meslek Programı (AMP)",
        mesem: "MESEM"
    },
    KISA: {
        al: "AL",
        amp: "AMP",
        mesem: "MESEM"
    },
    // Çok programlı okulun kendi okul türü kimliği
    COK_PROGRAMLI: "cok_programli_anadolu_lisesi",
    // Bünyesinde MESEM olabilen okul türü
    MESEM_BUNYESI_OLABILEN: "mesleki_ve_teknik_anadolu_lisesi",

    /**
     * "Bünyesinde MESEM var" işareti. adminOptions içinde durur (okulBilgisi.adminOptions.mesemBunyesinde):
     * bulut kuralları (08_bulut_yonetimi/database.rules.json) okul kaydında YENİ üst düzey alan kabul
     * etmez ("$diger": false) ama adminOptions altındaki seçenekleri kabul eder — kural dağıtımı gerekmez.
     */
    mesemBunyesinde(okulBilgisi) {
        return !!(okulBilgisi && okulBilgisi.adminOptions && okulBilgisi.adminOptions.mesemBunyesinde);
    },

    /** Bu okul türünde şubeye program seçilebilir mi? (arayüz bunu sorar) */
    programSecilebilir(okulTuru, okulBilgisi) {
        const t = String(okulTuru || "");
        if (t === PROGRAMLAR.COK_PROGRAMLI) return true;
        return t === PROGRAMLAR.MESEM_BUNYESI_OLABILEN && PROGRAMLAR.mesemBunyesinde(okulBilgisi);
    },

    /** Okul türüne göre seçilebilen program kimlikleri (sıralı). */
    programlar(okulTuru) {
        const t = String(okulTuru || "");
        if (t === PROGRAMLAR.COK_PROGRAMLI) return ["al", "amp", "mesem"];
        if (t === PROGRAMLAR.MESEM_BUNYESI_OLABILEN) return ["amp", "mesem"];
        return [];
    },

    /** Şubenin programı yazılmamışsa varsayılan. */
    varsayilan(okulTuru) {
        return String(okulTuru || "") === PROGRAMLAR.COK_PROGRAMLI ? "al" : "amp";
    },

    /**
     * Şubenin kurallarının dayandığı ETKİN okul türü.
     * Karma olmayan okulda ve programı olmayan (eski) şubede okul türünü AYNEN döndürür.
     */
    etkinTur(sec, okulTuru) {
        const t = String(okulTuru || "");
        if (t === PROGRAMLAR.COK_PROGRAMLI) {
            const p = sec && sec.program;
            return PROGRAMLAR.OKUL_TURU[p] || PROGRAMLAR.OKUL_TURU.al;
        }
        if (t === PROGRAMLAR.MESEM_BUNYESI_OLABILEN && sec && sec.program === "mesem") {
            return PROGRAMLAR.OKUL_TURU.mesem;
        }
        return okulTuru;
    },

    /**
     * Okul türü + şubeler karma programlı mı? (hesap yolunu seçer)
     * Çok programlı okulda şubeler tek programda olsa bile karma yolu işler; böylece
     * "çok programlı" türün sonucu, kendi programının müstakil okul hesabıyla aynıdır.
     */
    karmaMi(subeler, okulTuru) {
        const t = String(okulTuru || "");
        if (t === PROGRAMLAR.COK_PROGRAMLI) return true;
        if (t === PROGRAMLAR.MESEM_BUNYESI_OLABILEN) {
            return (subeler || []).some(s => s && s.program === "mesem");
        }
        return false;
    },

    /**
     * İki şube AYNI programda mı? Farklı programların şubeleri derste birleştirilemez ve
     * birlikte gruplanamaz (MESEM ile diğer programlar KARIŞTIRILMAZ).
     * `program` alanı olmayan şube (eski kayıt / varsayılan) MESEM dışındaki her programla
     * uyumludur; iki programsız şube her zaman aynıdır — eski kayıtlarda bu kural hiçbir şeyi
     * engellemez.
     */
    ayniProgramMi(a, b) {
        const pa = (a && a.program) || "";
        const pb = (b && b.program) || "";
        if (pa === pb) return true;
        if (pa === "mesem" || pb === "mesem") return false;
        return pa === "" || pb === "";
    },

    /**
     * Şubeleri ETKİN okul türüne göre bölümler: [{ tur, subeler }, ...]
     * Sıra: önce MESEM dışı programlar (AL, AMP), sonra MESEM — şeflik gibi okul genelinde
     * TEK kez yazılacak kalemler ilk parçada işlenir.
     */
    parcala(subeler, okulTuru) {
        const harita = new Map();
        (subeler || []).forEach(s => {
            const tur = PROGRAMLAR.etkinTur(s, okulTuru);
            if (!harita.has(tur)) harita.set(tur, []);
            harita.get(tur).push(s);
        });
        const mesemMi = (t) => String(t).includes("mesleki_egitim_merkezi");
        return [...harita.entries()]
            .map(([tur, liste]) => ({ tur, subeler: liste }))
            .sort((a, b) => (mesemMi(a.tur) ? 1 : 0) - (mesemMi(b.tur) ? 1 : 0));
    }
};

// Kısayol: şubenin ETKİN okul türü. Karma olmayan okulda okul türünün kendisini döndürür.
// (Tek tek ESM olarak yüklenen testlerde tanımsız olabilir; çağıranlar typeof ile korur.)
function etkinOkulTuru(sec, okulTuru) {
    return PROGRAMLAR.etkinTur(sec, okulTuru);
}

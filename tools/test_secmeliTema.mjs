/* ===========================================================================
   NormMatik™ — SEÇMELİ DERS TEMA KURALLARI DENETİMİ
   ===========================================================================
   NEDEN VAR (kullanıcı sorusu, 07.09.2026)
   ----------------------------------------
   "3-Tema Seçmeli Ders Tercih Dengesi" sekmesi mevzuata uygun mu? Ölçüldü,
   DEĞİLDİ:

     • Tema, dersin ADINDAN tahmin ediliyordu; resmî `grup` alanı elde olduğu
       hâlde kullanılmıyordu. Eşleşmeyen ders SESSİZCE "Bilim" sayılıyordu.
     • Tek kural bütün okullara uygulanıyordu ("üç temanın üçü de olmalı").
       Bu kural yalnızca ortaokulda ve 9-10. sınıfta doğru. Sekme; 11-12.
       sınıflarda, güzel sanatlar ve spor liselerinde, imam hatip liselerinde,
       meslek liselerinde ve MESEM'de YANLIŞ UYARI üretiyordu.
     • Kaynak veride grup adı satır kırılmasından ikiye bölünmüştü
       ("İNSAN, TOPLUM" + "VE BİLİM").

   Bu test, mevzuattan okunan kuralları sabitler. Kaynaklar:
     · İlköğretim Kurumları Haftalık Ders Çizelgesi (ortaokul 5-8)
     · TTKB Sayı 05 / 24 / 25   (Anadolu, Fen, Sosyal Bilimler, özel program)
     · TTKB Sayı 06 / 07 / 09   (Güzel Sanatlar, Spor)
     · DÖGM İHL çizelgesi md. 1 ve 8 (A/B grubu — tema sistemi YOK)

   Çalıştırma: node tools/test_secmeliTema.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

let gecen = 0;
const hatalar = [];
const denetle = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};

/* ---- motoru yükle ------------------------------------------------------ */
const w = {};
const ctx = {
    window: w, self: w, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    crypto: { getRandomValues: (a) => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {}
};
ctx.globalThis = ctx;
w.dispatchEvent = () => true;
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(
    fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);

const K = w.SECMELI_TEMA_KURALLARI;
if (!K) { console.log("\n❌ ÖLÇÜM GEÇERSİZ: SECMELI_TEMA_KURALLARI pakete girmemiş."); process.exit(1); }
const RE = new (w.MebReportsEngine)();
if (typeof RE.generateElectiveThemeReport !== "function") {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: generateElectiveThemeReport yok."); process.exit(1);
}

/* ---- yardımcılar ------------------------------------------------------- */
const ders = (ad, grup, saat) => ({ ders: ad, saat: saat || 2, grup: grup, kategori: "SEÇMELİ DERSLER" });

const rapor = (okulTuru, sinif, secmeliler) => RE.generateElectiveThemeReport({
    okulBilgisi: { okulAdi: "TEST", okulTuru: okulTuru },
    subeler: [{ id: "s1", subeAdi: sinif + "-A", sinifSeviyesi: String(sinif),
                ogrenciSayisi: 30, zorunluDersler: [], secmeliDersler: secmeliler }]
});
const ilk = (r) => r.themeSections[0];

/* ======================= 1) KANONİK GRUP ÇÖZÜMLEME ===================== */
{
    denetle("tam grup adları doğru çözülüyor",
        K.temaCoz("İNSAN, TOPLUM VE BİLİM") === "BILIM"
        && K.temaCoz("DİN, AHLAK VE DEĞER") === "DEGER"
        && K.temaCoz("KÜLTÜR, SANAT VE SPOR") === "SANAT");

    denetle("küçük/büyük harf yazımı fark etmiyor",
        K.temaCoz("İnsan, Toplum ve Bilim") === "BILIM"
        && K.temaCoz("Din, Ahlak ve Değer") === "DEGER"
        && K.temaCoz("Kültür, Sanat ve Spor") === "SANAT");

    // PDF satır kırılmasından doğan YARIM adlar. Havuzda gerçekten böyle
    // duruyorlar; müşterinin kayıtlı şubesinde de böyle kalmış olabilir.
    denetle("yarım grup adları onarılıyor (İnsan, Toplum ve Bilim)",
        K.temaCoz("İNSAN, TOPLUM") === "BILIM"
        && K.temaCoz("İNSAN, TOPLUM VE") === "BILIM"
        && K.temaCoz("VE BİLİM") === "BILIM"
        && K.temaCoz("BİLİM") === "BILIM");

    denetle("yarım grup adları onarılıyor (Kültür, Sanat ve Spor)",
        K.temaCoz("KÜLTÜR, SANAT") === "SANAT" && K.temaCoz("VE SPOR") === "SANAT");

    denetle("Akademik Çalışmalar TEMA SAYILMIYOR",
        K.temaCoz("AKADEMİK ÇALIŞMALAR") === "AKADEMIK" && !K.temaMi("AKADEMIK"));

    denetle("program/proje grupları tema sayılmıyor",
        K.temaCoz("MUSİKİ PROGRAMI/PROJESİ DERSLERİ") === "PROGRAM"
        && K.temaCoz("SPOR PROGRAMI SEÇMELİ DERSLERİ") === "PROGRAM");

    denetle("bilinmeyen grup SESSİZCE bir temaya düşmüyor",
        K.temaCoz("Falanca Filanca") === "BILINMIYOR" && K.temaCoz("") === "BILINMIYOR",
        "eski kodun en tehlikeli yanı buydu: tanımadığını Bilim sayıyordu");
}

/* ============ 2) HAVUZDAKİ HER GRUP ADI ÇÖZÜLEBİLİYOR MU? ============== */
{
    const havuz = fs.readFileSync(path.join(KOK, "js", "secmeli_havuzu.js"), "utf8");
    const adlar = [...new Set([...havuz.matchAll(/grup: "([^"]+)"/g)].map(m => m[1]))];
    const cozulmeyen = adlar.filter(a => K.temaCoz(a) === "BILINMIYOR");
    denetle("ölçüm geçerli: havuzdan grup adı okunabiliyor", adlar.length > 15,
        adlar.length + " farklı ad");
    denetle("havuzdaki HER grup adı bir kovaya çözülüyor", cozulmeyen.length === 0,
        "çözülemeyen: " + cozulmeyen.join(" | "));
}

/* ==================== 3) KURAL SEÇİMİ — okul × sınıf =================== */
{
    const k = (t, s) => K.kuralBul(t, s);

    denetle("ortaokul 5-8: üç temanın hepsi",
        ["5", "6", "7", "8"].every(s => { const r = k("ortaokul_temel_egitim", s);
            return r && r.enAzFarkli === 3 && r.temalar.length === 3; }));

    denetle("genel lise 9-10: üç temanın hepsi",
        ["9", "10"].every(s => { const r = k("anadolu_lisesi", s);
            return r && r.enAzFarkli === 3 && r.temalar.length === 3; }));

    denetle("genel lise 11-12: üç temadan EN AZ İKİSİ",
        ["11", "12"].every(s => { const r = k("anadolu_lisesi", s);
            return r && r.enAzFarkli === 2 && r.temalar.length === 3; }),
        "TTKB Sayı 05: '...en az ikisinden birer ders'");

    denetle("fen / sosyal bilimler / özel program aynı kurala tabi",
        ["fen_lisesi", "sosyal_bilimler_lisesi", "ozel_program_fen_lisesi",
         "ozel_program_sosyal_lisesi", "hazirlik_anadolu_lisesi", "hazirlik_fen_lisesi"]
            .every(t => { const a = k(t, "9"), b = k(t, "11");
                return a && a.enAzFarkli === 3 && b && b.enAzFarkli === 2; }));

    denetle("güzel sanatlar / spor: yalnız İKİ tema, dört seviyede de",
        ["guzel_sanatlar_gorsel", "guzel_sanatlar_muzik", "guzel_sanatlar_tiyatro",
         "guzel_sanatlar_turk_muzigi", "spor_lisesi"]
            .every(t => ["9", "10", "11", "12"].every(s => { const r = k(t, s);
                return r && r.temalar.length === 2 && r.enAzFarkli === 2
                    && r.temalar.indexOf("SANAT") < 0; })),
        "TTKB Sayı 06/07/09: yalnız 'insan, toplum ve bilim' + 'din, ahlak ve değer'");

    denetle("imam hatip LİSESİ'nde tema kuralı YOK (A/B grubu sistemi)",
        ["9", "10", "11", "12"].every(s => !k("anadolu_imam_hatip_lisesi", s)
            && !k("hazirlik_imam_hatip_lisesi", s)),
        "DÖGM çizelgesi md. 1 ve 8");

    denetle("imam hatip ORTAOKULU'nda kural yok (çizelgesinde seçim kuralı yok)",
        ["5", "6", "7", "8"].every(s => !k("imam_hatip_ortaokulu", s)));

    denetle("meslek liseleri ve MESEM'de kural yok",
        ["mesleki_ve_teknik_anadolu_lisesi", "anadolu_teknik_programi", "meslek_okulu",
         "mesleki_egitim_merkezi", "meslek_ortaokulu"]
            .every(t => ["9", "10", "11", "12"].every(s => !k(t, s))));

    denetle("özel eğitim okullarında kural yok",
        ["ozel_egitim_meslek_okulu", "ozel_egitim_uygulama_okulu"]
            .every(t => !k(t, "9") && !k(t, "10")));

    denetle("hazırlık sınıfında kural yok (metin yalnız 9-12'yi sayıyor)",
        !k("anadolu_lisesi", "hazirlik") && !k("hazirlik_fen_lisesi", "hazirlik"));

    denetle("her kuralın mevzuat KAYNAĞI yazılı",
        K.KURALLAR.every(r => r.kaynak && r.kaynak.length > 10 && r.metin && r.metin.length > 20));
}

/* ==================== 4) RAPOR DAVRANIŞI =============================== */
{
    // 9. sınıf, sadece iki tema seçilmiş -> EKSİK olmalı
    const r1 = ilk(rapor("anadolu_lisesi", 9, [
        ders("Bilgi Kuramı", "İNSAN, TOPLUM VE BİLİM"),
        ders("Temel Dinî Bilgiler", "DİN, AHLAK VE DEĞER")
    ]));
    denetle("9. sınıfta iki tema YETMİYOR", r1.uyum && r1.uyum.uygun === false
        && r1.uyum.eksik.indexOf("SANAT") >= 0);

    // 11. sınıf, aynı iki tema -> UYGUN olmalı
    const r2 = ilk(rapor("anadolu_lisesi", 11, [
        ders("Bilgi Kuramı", "İNSAN, TOPLUM VE BİLİM"),
        ders("Temel Dinî Bilgiler", "DİN, AHLAK VE DEĞER")
    ]));
    denetle("11. sınıfta iki tema YETİYOR", r2.uyum && r2.uyum.uygun === true,
        "eski kod burada yanlış uyarı veriyordu");

    // Güzel sanatlar: "Kültür, Sanat ve Spor" YOK -> yine de UYGUN
    const r3 = ilk(rapor("guzel_sanatlar_muzik", 10, [
        ders("Bilgi Kuramı", "İNSAN, TOPLUM VE BİLİM"),
        ders("Temel Dinî Bilgiler", "DİN, AHLAK VE DEĞER")
    ]));
    denetle("güzel sanatlarda 'Kültür, Sanat ve Spor' eksikliği uyarı ÜRETMİYOR",
        r3.uyum && r3.uyum.uygun === true,
        "o okul türünde şart değil (Sayı 07)");

    // İmam hatip lisesi -> hiç uyum nesnesi olmamalı
    const r4 = rapor("anadolu_imam_hatip_lisesi", 10, [ders("Fıkıh Okumaları", "Temel İslam Bilimleri")]);
    denetle("imam hatip lisesinde uygunluk uyarısı HİÇ çıkmıyor",
        ilk(r4).uyum === null && r4.kuralliSubeVar === false);
    denetle("imam hatip lisesinde nedeni açıklayan not var",
        (r4.turNotu || "").indexOf("A") >= 0 && r4.turNotu.length > 40);

    // Meslek lisesi -> uyarı yok
    const r5 = rapor("mesleki_ve_teknik_anadolu_lisesi", 11, [ders("Girişimcilik", "AKADEMİK ÇALIŞMALAR")]);
    denetle("meslek lisesinde uygunluk uyarısı çıkmıyor",
        ilk(r5).uyum === null && r5.kuralliSubeVar === false);

    // Grubu bilinmeyen ders BİLİM sayılmamalı
    const r6 = ilk(rapor("anadolu_lisesi", 9, [ders("Adı Bilinmeyen Ders", "Falanca Grup")]));
    denetle("grubu belirsiz ders BİLİM'e sayılmıyor",
        r6.stats.BILIM.count === 0 && r6.stats.BILINMIYOR.count === 1);

    // Akademik Çalışmalar tema sayılmamalı
    const r7 = ilk(rapor("anadolu_lisesi", 9, [
        ders("Matematik Uygulamaları", "AKADEMİK ÇALIŞMALAR"),
        ders("Temel Dinî Bilgiler", "DİN, AHLAK VE DEĞER"),
        ders("Spor Eğitimi", "KÜLTÜR, SANAT VE SPOR")
    ]));
    denetle("Akademik Çalışmalar tema yerine geçmiyor",
        r7.stats.AKADEMIK.count === 1 && r7.stats.BILIM.count === 0
        && r7.uyum.uygun === false && r7.uyum.eksik.indexOf("BILIM") >= 0);

    // YARIM grup adıyla kayıtlı eski veri de doğru sayılmalı
    const r8 = ilk(rapor("anadolu_lisesi", 11, [
        ders("Eski Kayıt", "VE BİLİM"), ders("Eski Kayıt 2", "DİN, AHLAK VE DEĞER")
    ]));
    denetle("yarım grup adıyla KAYITLI eski veri doğru sayılıyor",
        r8.stats.BILIM.count === 1 && r8.uyum.uygun === true);

    // Meslek seçmelisi temaya karışmamalı
    const r9 = ilk(rapor("mesleki_ve_teknik_anadolu_lisesi", 10, [
        { ders: "Atölye", saat: 4, grup: "Bir Alan", kategori: "SEÇMELİ MESLEK DERSLERİ", isElectiveVocational: true }
    ]));
    denetle("meslek seçmelisi tema kovalarına karışmıyor",
        r9.stats.MESLEK.count === 1 && r9.stats.BILINMIYOR.count === 0);
}

/* ============ 5) HEDEF TEMELLİ DESTEK EĞİTİMİ (1-3 saat) =============== */
{
    const ht = (dagilim) => ilk(rapor("anadolu_lisesi", 12, [{
        ders: "Hedef Temelli Destek Eğitimi", saat: 6, grup: "AKADEMİK ÇALIŞMALAR",
        kategori: "SEÇMELİ DERSLER", bransDagilimi: dagilim
    }])).hedefTemelli[0];

    denetle("hedef temelli ders tanınıyor", !!ht({ Matematik: 3 }));
    denetle("ders başına 3 saat UYGUN",
        ht({ Matematik: 3, Fizik: 3 }).ihlaller.length === 0);
    denetle("ders başına 4 saat İHLAL",
        ht({ Matematik: 4, Fizik: 2 }).ihlaller.length === 1
        && ht({ Matematik: 4, Fizik: 2 }).ihlaller[0].brans === "Matematik",
        "TTKB Sayı 05: 'ders başına en az 1 en fazla 3 saat'");
    denetle("paylaştırılmamış hedef temelli işaretleniyor",
        ht(null).dagitilmamis === true);
}

/* ====== 6) SEÇİCİ ile RAPOR AYNI TEMAYI VERİYOR MU? ==================== */
/* uiComponents.getElectiveThemeInfo de eskiden temayı DERS ADINDAN tahmin
   ediyordu. Aynı ders seçicide bir tema, raporda başka tema görünebiliyordu.
   Ölçülen iki gerçek hata:
     · "Diksiyon ve Hitabet"  -> "hitabet" kelimesi yüzünden DİN sayılıyordu
     · "İslam Kültürü"        -> "islam" kelimesi yüzünden DİN sayılıyordu
   İkisinin de resmî grubu farklıydı. Tema kimliği artık tek kaynaktan gelir. */
{
    const UIsrc = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    denetle("seçici, temayı resmî gruptan çözüyor",
        /_kanon\s*=\s*_K\s*\?\s*_K\.temaCoz\(item\.grup\)/.test(UIsrc),
        "getElectiveThemeInfo tek kaynağa bağlı olmalı");
    denetle("resmî grup BİLİM ise ders adı taraması onu EZEMİYOR",
        /if \(!_bilimKesin && \(norm\.includes\("din"\)/.test(UIsrc)
        && /if \(!_bilimKesin && \(norm\.includes\("sanat"\)/.test(UIsrc),
        "parantez şart: '&&' , '||' den önce bağlar");
}

/* ====== 7) UYGUN SATIRDA DA GRUP SAYISI GÖRÜNÜYOR MU? ================= */
/* Kullanıcı sorusu (07.09.2026): 11-12. sınıfta üç gruptan ikisi yeterli.
   Yalnız yeşil rozet görününce "üçü de tamam mı?" tereddüdü doğuyordu.
   Artık uygun satırda da "2/3 grup" yazıyor, eksik grubun adı da — ama
   uyarı olarak değil, "bu seviyede şart değil" notuyla. */
{
    const UIsrc2 = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    denetle("uygun satırda kaç gruptan seçildiği yazıyor",
        /saglananSayi\}\/\$\{sec\.uyum\.kapsamSayi\} grup/.test(UIsrc2));
    denetle("uygun satırdaki eksik grup UYARI olarak sunulmuyor",
        /bu seviyede şart değil/.test(UIsrc2));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ SEÇMELİ TEMA DENETİMİ HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ SEÇMELİ TEMA DENETİMİ DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

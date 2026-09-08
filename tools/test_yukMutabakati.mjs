/* ===========================================================================
   NormMatik™ — Ders yükü mutabakatı testi
   ===========================================================================
   NEDEN VAR (kullanıcı bildirimi, 05.09.2026)
   ------------------------------------------
   Master matrisin alt satırı 640, aynı raporun başlığı 646 diyordu. İkisi de
   doğruydu ama farklı büyüklüklerdi ve aradaki köprü hiçbir yerde yazmıyordu:

       640 = ÖĞRENCİNİN gördüğü ders saati (şube çizelgelerinin ham toplamı)
       646 = ÖĞRETMENİN okuttuğu ders yükü (norm bu sayıdan hesaplanır)

   Farkı üreten mevzuat kalemleri:
       (+) bölünen ders / grup çarpanı — her öğretmen kendi grubuna tam saat
       (−) birleştirilmiş şube         — ders tek öğretmene yazılır
       (−) yönetici ders saati         — Md. 22/6
       (+) koordinatörlük              — Md. 19/1 (mesleki okullar)

   Bu test, mutabakatın SÜS OLMAMASINI garanti eder. Denetlediği değişmez:

       ham + çarpan − birleşik − yönetici + koordinatörlük === totalHours

   Motora yarın yeni bir yük kalemi eklenir ve mutabakata yansıtılmazsa
   eşitlik bozulur ve bu test kırmızı yanar. Böylece rapor, açıklayamadığı
   bir sayıyı asla açıklıyormuş gibi göstermez.

   Çalıştırma: node tools/test_yukMutabakati.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};
function olumcul(m) {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: " + m);
    process.exit(1);
}

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

const ne = w.normEngine;
if (typeof ne.calculateSchoolNorms !== "function") olumcul("calculateSchoolNorms yok.");

/* ---- sentetik okul kurucusu ------------------------------------------- */
const MEVCUTLAR = [[9, 34], [9, 33], [9, 34], [10, 34], [10, 34], [10, 36],
                   [11, 18], [11, 19], [11, 28], [11, 28], [11, 10],
                   [12, 24], [12, 24], [12, 23], [12, 22], [12, 10]];

const okulKur = (o = {}) => MEVCUTLAR.map(([sinif, ogr], i) => {
    const dersler = [
        { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı" },
        { ders: "Matematik", saat: 6, atananBrans: "Matematik" },
        { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
        { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" },
        { ders: "İngilizce", saat: 4, atananBrans: "İngilizce" },
        { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
        { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
        { ders: "Fizik", saat: 2, atananBrans: "Fizik" },
        { ders: "Kimya", saat: 2, atananBrans: "Kimya" },
        { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji" },
        { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
        { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" }
    ];
    // (+) eğik çizgili ders iki branşa bölünmüş
    dersler.push((o.bol && sinif === 9)
        ? { ders: "Görsel Sanatlar/Müzik", saat: 2, bolunenBranslar: ["Görsel Sanatlar", "Müzik"] }
        : { ders: "Görsel Sanatlar", saat: 2, atananBrans: "Görsel Sanatlar" });
    // branşı atanmamış ders — çizelgede var, hiçbir branşın normunda yok
    if (o.branssiz && i === 0) dersler.push({ ders: "Serbest Etkinlik", saat: 2, atananBrans: "" });
    // (−) birleştirilmiş şube: en küçük iki şube tek grupta
    if (o.birlesik && (i === 10 || i === 15)) {
        dersler.push({ ders: "Astronomi ve Uzay Bilimleri", saat: 2,
                       atananBrans: "Fizik", birlesikSubeler: [i === 10 ? "s15" : "s10"] });
    }
    return { id: "s" + i, ad: sinif + "-" + i, sinifSeviyesi: String(sinif),
             ogrenciSayisi: ogr, zorunluDersler: dersler, secmeliDersler: [] };
});

const hamHesapla = (subeler) => subeler.reduce((t, s) =>
    t + [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])]
        .reduce((a, c) => a + (parseInt(c.saat, 10) || 0), 0), 0);

/* ---- 1) DEĞİŞMEZ: kalemler toplamı === motor toplamı ------------------- */
const SENARYOLAR = [
    ["sade okul", "anadolu_lisesi", {}, {}],
    ["bölünmüş eğik çizgili ders", "anadolu_lisesi", { bol: true }, {}],
    ["yönetici ders saati (Md. 22/6)", "anadolu_lisesi", {},
        { adminOptions: { yoneticiDersYukleri: { "Türk Dili ve Edebiyatı": 6 } } }],
    ["birleştirilmiş şube", "anadolu_lisesi", { birlesik: true }, {}],
    ["branşı atanmamış ders", "anadolu_lisesi", { branssiz: true }, {}],
    ["hepsi bir arada", "anadolu_lisesi", { bol: true, birlesik: true, branssiz: true },
        { adminOptions: { yoneticiDersYukleri: { "Türk Dili ve Edebiyatı": 6, "Matematik": 4 } } }],
    ["mesleki lise (koordinatörlük)", "mesleki_ve_teknik_anadolu_lisesi", {},
        { "Makine Teknolojisi": 20 }],
    ["yönetici saati branş yükünden büyük", "anadolu_lisesi", {},
        { adminOptions: { yoneticiDersYukleri: { "Felsefe": 500 } } }]
];

for (const [ad, tur, opt, coord] of SENARYOLAR) {
    const subeler = okulKur(opt);
    const r = ne.calculateSchoolNorms(subeler, {}, tur, coord);
    const m = r.yukMutabakati;

    if (!m) { kontrol(ad + ": mutabakat üretiliyor", false, "yukMutabakati yok"); continue; }
    kontrol(ad + ": mutabakat üretiliyor", true);

    const hesap = m.hamCizelgeSaati + m.carpanArtisi - m.birlesikSubeDusumu
                - m.yoneticiDersDusumu + m.koordinatorlukEki;
    kontrol(ad + ": DEĞİŞMEZ tutuyor", hesap === r.totalHours,
        m.hamCizelgeSaati + " + " + m.carpanArtisi + " - " + m.birlesikSubeDusumu
        + " - " + m.yoneticiDersDusumu + " + " + m.koordinatorlukEki
        + " = " + hesap + ", motor " + r.totalHours);
    kontrol(ad + ": tutarlı bayrağı doğru", m.tutarli === true, String(m.tutarli));
    kontrol(ad + ": sonuç motor toplamıyla aynı",
        m.normaEsasYuk === r.totalHours, m.normaEsasYuk + " / " + r.totalHours);

    // Ham sayaç, matrisin alt satırıyla AYNI yöntemle hesaplanmalı; yoksa
    // rapor "640" derken mutabakat başka bir sayı gösterir.
    kontrol(ad + ": ham sayaç şube çizelgesi toplamına eşit",
        m.hamCizelgeSaati === hamHesapla(subeler),
        m.hamCizelgeSaati + " / " + hamHesapla(subeler));

    // Düşümler negatife dönemez.
    kontrol(ad + ": düşümler negatif değil",
        m.yoneticiDersDusumu >= 0 && m.birlesikSubeDusumu >= 0,
        "yönetici " + m.yoneticiDersDusumu + ", birleşik " + m.birlesikSubeDusumu);
}

/* ---- 2) Kalemler gerçekten devreye giriyor mu? ------------------------- */
/* Değişmez, bütün kalemler sıfırken de tutar. Sayaçların ÖLÇTÜĞÜNÜ de
   ayrıca doğrulamak gerekir; yoksa test hep yeşil yanan bir süs olur. */
{
    const sade = ne.calculateSchoolNorms(okulKur({}), {}, "anadolu_lisesi", {}).yukMutabakati;
    kontrol("sade okulda hiçbir kalem oluşmuyor",
        sade.carpanArtisi === 0 && sade.birlesikSubeDusumu === 0
        && sade.yoneticiDersDusumu === 0 && sade.koordinatorlukEki === 0,
        JSON.stringify(sade));

    const bolund = ne.calculateSchoolNorms(okulKur({ bol: true }), {}, "anadolu_lisesi", {}).yukMutabakati;
    kontrol("bölünme çarpanı ölçülüyor (3 şube x 2 saat = +6)",
        bolund.carpanArtisi === 6, String(bolund.carpanArtisi));
    kontrol("bölünme ham çizelgeyi DEĞİŞTİRMİYOR",
        bolund.hamCizelgeSaati === sade.hamCizelgeSaati,
        bolund.hamCizelgeSaati + " / " + sade.hamCizelgeSaati);

    const yon = ne.calculateSchoolNorms(okulKur({}), {}, "anadolu_lisesi",
        { adminOptions: { yoneticiDersYukleri: { "Türk Dili ve Edebiyatı": 6 } } }).yukMutabakati;
    kontrol("yönetici düşümü ölçülüyor (Md. 22/6, -6)",
        yon.yoneticiDersDusumu === 6, String(yon.yoneticiDersDusumu));
    kontrol("yönetici düşümü toplamı gerçekten azaltıyor",
        yon.normaEsasYuk === sade.normaEsasYuk - 6,
        yon.normaEsasYuk + " / " + sade.normaEsasYuk);

    const brl = ne.calculateSchoolNorms(okulKur({ birlesik: true }), {}, "anadolu_lisesi", {}).yukMutabakati;
    kontrol("birleşik şube düşümü ölçülüyor (-2)",
        brl.birlesikSubeDusumu === 2, String(brl.birlesikSubeDusumu));
    kontrol("birleşik şubede ham çizelge ARTIYOR ama yük yarısı kadar artıyor",
        brl.hamCizelgeSaati === sade.hamCizelgeSaati + 4
        && brl.normaEsasYuk === sade.normaEsasYuk + 2,
        "ham " + brl.hamCizelgeSaati + ", yük " + brl.normaEsasYuk);

    const mtal = ne.calculateSchoolNorms(okulKur({}), {}, "mesleki_ve_teknik_anadolu_lisesi",
        { "Makine Teknolojisi": 20 }).yukMutabakati;
    kontrol("koordinatörlük eki ölçülüyor (+20)",
        mtal.koordinatorlukEki === 20, String(mtal.koordinatorlukEki));
}

/* ---- 3) Rapor katmanı: mutabakat gerçekten taşınıyor mu? --------------- */
{
    const RE = fs.readFileSync(path.join(KOK, "js", "reportsEngine.js"), "utf8");
    kontrol("master matris verisi mutabakatı taşıyor",
        /yukMutabakati:\s*normResult\.yukMutabakati/.test(RE));
    kontrol("Excel çıktısına mutabakat satırları ekleniyor",
        /mutabakatSatirlari\(gridData\.yukMutabakati/.test(RE));
    kontrol("CSV çıktısına mutabakat satırları ekleniyor",
        /mutabakatSatirlari\(reportData\.yukMutabakati/.test(RE));

    const UI = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    // Panel 06.09.2026'da matrisin ALTINDAN rapor BAŞLIĞINA taşındı
    // ("önemli, en altta olamaz" — kullanıcı). Yerleşimin ayrıntılı
    // denetimi test_raporlar R15'te; burada yalnızca bağlantılar sınanır.
    // 06.09.2026: önce şerit, sonra köprü grafiği, en sonunda okunur DENKLEM.
    // Köprü soyut kalıyordu; kullanıcı "minimal tercih yanlış oldu" dedi.
    kontrol("mutabakat denklemi raporda basılıyor",
        /renderMutabakatDenklem\(data\.yukMutabakati\)/.test(UI));
    kontrol("denklem kutu + işaret biçiminde (grafik değil)",
        /mt-kutu/.test(UI) && /mt-islem/.test(UI));
    kontrol("ayrıntı tablosu ve açma anahtarı basılıyor",
        /renderMutabakatDetay\(data\.yukMutabakati\)/.test(UI)
        && /renderMutabakatAnahtar\(data\.yukMutabakati\)/.test(UI));
    kontrol("yönetici icmalinde tek satırlık özet var",
        /renderMutabakatOzet\(data\.yukMutabakati\)/.test(UI));
    // Branş kartı başlığındaki yük ile ders satırlarının toplamı ayrışabilir
    // (yönetici düşümü, koordinatörlük, grup bölünmesi). Sebebi YAZILMALI.
    kontrol("branş içi ayrışma kartın dipnotunda açıklanıyor",
        /kalanFark/.test(UI) && /Ders satırları toplamı/.test(UI));
    kontrol("yönetici düşümü ve koordinatörlük ayrıca yazılıyor",
        /Md\. 22\/6/.test(UI) && /Md\. 19\/1/.test(UI));

    // Tutarsız mutabakat HİÇ basılmamalı. Tek kapı: mutabakatKalemleri().
    kontrol("tutarsız mutabakat basılmıyor",
        /if \(!m \|\| m\.tutarli === false\) return null;/.test(UI));
    kontrol("üç çizicinin üçü de aynı kapıdan geçiyor",
        (UI.match(/this\.mutabakatKalemleri\(m\)/g) || []).length >= 3,
        "biri kapıyı atlarsa tutarsız mutabakat ekrana çıkar");

    const CSS = fs.readFileSync(path.join(KOK, "css", "app.css"), "utf8");
    // 06.09.2026: mutabakat paneli serit/kart duzeninden DENKLEM duzenine gecti.
    // Bu denetim eskiden .ymt-serit ariyordu; o sinifi hicbir cizici artik
    // basmiyor. Test yesil kalmaya devam etmisti cunku olu CSS dosyada
    // duruyordu -- olu CSS temizlenince ortaya cikti. Artik GERCEKTEN basilan
    // siniflar denetleniyor: denklem kutulari (.mt-kutu) + ayrinti tablosu.
    kontrol("mutabakat panelinin stili var",
        /\.mt-kutu\s*\{/.test(CSS) && /\.ymt-detay\s*\{/.test(CSS));
    kontrol("ayrıntı tablosu yazdırmada da görünüyor",
        /@media print[\s\S]*\.ymt-detay\s*\{[\s\S]{0,80}display:\s*block\s*!important/.test(CSS));

    const APP = fs.readFileSync(path.join(KOK, "js", "app.js"), "utf8");
    kontrol("ana sayfa panelinin açıklaması artık 'şube saatleri toplamı' demiyor",
        !/title="Şubelerin haftalık ders saatlerinin toplamı\./.test(APP));
    kontrol("ana sayfa paneli mutabakata yönlendiriyor",
        /DERS YÜKÜ MUTABAKATI/.test(APP));
}

/* ---- 5) Md. 22/6 DÜŞÜMÜ HANGİ BRANŞTAN YAPILIYOR? --------------------- */
/* NEDEN VAR (kullanıcı sorusu, 07.09.2026)
   "Edebiyat branşlı müdür yardımcısı Beden Eğitimi dersine giriyor. Ders okul
   yükünde sayılmalı ama Beden Eğitimi normunu doğurmamalı. Dersin branşına
   idarecinin branşını eklersek hesap karışıyor."

   Yönetmelik Md. 22/6: "...yöneticilerin girmiş olduğu ders saatleri İLGİLİ
   ALANIN ders yükünden düşülerek belirlenir." İlgili alan = GİRİLEN DERSİN
   alanı; idarecinin kadro branşı DEĞİL.

   Bu test o anlamı sabitler. Biri ileride düşümü idarecinin branşına
   bağlamaya kalkarsa ya da düşüm ham çizelge saatine sızarsa kırmızı yanar. */
{
    const okul = MEVCUTLAR.map(([sinif, ogr], i) => ({
        id: "y" + i, ad: sinif + "-" + i, sinifSeviyesi: String(sinif), ogrenciSayisi: ogr,
        zorunluDersler: [
            { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı" },
            { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" }
        ],
        secmeliDersler: []
    }));
    const bul = (r, ad) => (r.branchReport || []).find(b => b.branchName === ad);

    const yok = ne.calculateSchoolNorms(okul, {}, "anadolu_lisesi", {});
    const var_ = ne.calculateSchoolNorms(okul, {}, "anadolu_lisesi", {
        adminOptions: { yoneticiDersYukleri: { "Beden Eğitimi": 6 } }
    });

    const beA = bul(yok, "Beden Eğitimi"), beB = bul(var_, "Beden Eğitimi");
    const edA = bul(yok, "Türk Dili ve Edebiyatı"), edB = bul(var_, "Türk Dili ve Edebiyatı");

    kontrol("ölçüm geçerli: iki branş da raporda var", !!(beA && beB && edA && edB));
    kontrol("düşüm GİRİLEN DERSİN branşından yapılıyor",
        beA.totalHours - beB.totalHours === 6,
        beA.totalHours + " -> " + beB.totalHours);
    kontrol("idarecinin kendi branşı ETKİLENMİYOR",
        edA.totalHours === edB.totalHours,
        "Edebiyat " + edA.totalHours + " -> " + edB.totalHours);
    kontrol("ders OKUL YÜKÜNDE kalıyor (ham çizelge saati değişmiyor)",
        yok.yukMutabakati.hamCizelgeSaati === var_.yukMutabakati.hamCizelgeSaati,
        yok.yukMutabakati.hamCizelgeSaati + " -> " + var_.yukMutabakati.hamCizelgeSaati);
    kontrol("norma esas yük tam düşülen kadar azalıyor",
        yok.yukMutabakati.normaEsasYuk - var_.yukMutabakati.normaEsasYuk === 6);

    // Arayüz, bu ayrımı kullanıcıya AÇIKÇA söylemek zorunda: metin silinirse
    // aynı yanlış anlama geri gelir.
    const UI = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    kontrol("arayüz 'kendi branşını değil' uyarısını gösteriyor",
        /İdarecinin kendi branşını değil/.test(UI)
        && /GİRDİĞİ DERSİN branşını yazın/.test(UI));
    kontrol("uyarı somut bir örnek veriyor",
        /Edebiyat/.test(UI) && /Beden Eğitimi/.test(UI)
        && /branş atamasını değiştirmeyin/i.test(UI));
}

/* ====== ÖZEL EĞİTİM ŞUBESİ VARKEN MUTABAKAT TUTMALI =====================
   09.09.2026 — gerçek bir ortaokulda mutabakat paneli hiç basılmadı.

   Sebep: özel eğitim şubelerinin saatleri Md. 17 gereği genel branş havuzuna
   alınmıyor, ama denklemin "çarpan artışı" kalemi bu saatleri hâlâ tabanda
   sayıyordu. Sonuç: carpanArtisi −89 gibi anlamsız bir değere düşüyor,
   `tutarli` false oluyor ve arayüz paneli SESSİZCE gizliyordu.

   Gizleme kuralı doğru ("yanlış mutabakat, mutabakat olmamasından kötüdür"),
   ama tutarsızlığın kendisi hataydı. Bu bölüm hem denklemin tuttuğunu hem de
   özel eğitim saatinin ayrı kalem olarak raporlandığını denetler.

   Not: özel eğitim şubeleri LİSE kademesinde de açılır; senaryolar ortaokul
   ve lise için ayrı ayrı kuruldu. */
{
    const ce2 = w.curriculumEngine;
    const sube = (ad, tur, sinif, ozel) => ({
        id: "m_" + ad,
        subeAdi: ad,
        sinifSeviyesi: String(sinif),
        ogrenciSayisi: 20,
        isSpecialEdu: !!ozel,
        engelTuru: ozel ? "hafif_zihinsel" : null,
        alanId: ozel ? "ozel_egitim" : null,
        dalAdi: ozel ? "Özel Eğitim Sınıfı" : null,
        zorunluDersler: ce2.getMandatoryCourses(
            tur, String(sinif), ozel ? "ozel_egitim" : null,
            ozel ? "Özel Eğitim Sınıfı" : null) || [],
        secmeliDersler: [],
        rehberlikVarMi: !ozel
    });

    const senaryolar = [
        ["ortaokul + özel eğitim şubesi", "ortaokul_temel_egitim",
            [sube("6-B", "ortaokul_temel_egitim", 6), sube("7-B", "ortaokul_temel_egitim", 7),
             sube("6-A (Özel Eğt)", "ortaokul_temel_egitim", 6, true)]],
        ["lise + özel eğitim şubesi", "anadolu_lisesi",
            [sube("9-A", "anadolu_lisesi", 9), sube("10-A", "anadolu_lisesi", 10),
             sube("10-B (Özel Eğt)", "anadolu_lisesi", 10, true)]],
        ["tamamı özel eğitim (meslek okulu)", "ozel_egitim_meslek_okulu",
            ["9", "10", "11", "12"].map(x => sube(x + "-A", "ozel_egitim_meslek_okulu", x, true))],
        ["özel eğitim şubesi YOK", "anadolu_lisesi",
            [sube("9-A", "anadolu_lisesi", 9), sube("10-A", "anadolu_lisesi", 10)]]
    ];

    for (const [ad, tur, liste] of senaryolar) {
        const r = ne.calculateSchoolNorms(liste, {}, tur, {});
        const m = r.yukMutabakati;

        kontrol(`mutabakat tutarlı — ${ad}`, m.tutarli === true,
            `ham ${m.hamCizelgeSaati} + çarpan ${m.carpanArtisi} − birleşik ${m.birlesikSubeDusumu}`
            + ` − yönetici ${m.yoneticiDersDusumu} + koordinatörlük ${m.koordinatorlukEki}`
            + ` = ${m.hamCizelgeSaati + m.carpanArtisi - m.birlesikSubeDusumu - m.yoneticiDersDusumu + m.koordinatorlukEki}`
            + `, norma esas ${m.normaEsasYuk}`);

        // Değişmez, açıkça yeniden kurulur.
        kontrol(`denklem sağlanıyor — ${ad}`,
            m.hamCizelgeSaati + m.carpanArtisi - m.birlesikSubeDusumu
            - m.yoneticiDersDusumu + m.koordinatorlukEki === m.normaEsasYuk, true);

        // Çarpan artışı bir ARTIŞ kalemidir; eksiye düşüyorsa taban yanlış
        // kurulmuş demektir (regresyonun imzası tam olarak buydu).
        kontrol(`çarpan artışı eksiye düşmüyor — ${ad}`, m.carpanArtisi >= 0,
            "carpanArtisi: " + m.carpanArtisi);

        const ozelVar = liste.some(x => x.isSpecialEdu);
        kontrol(`özel eğitim saati ayrı raporlanıyor — ${ad}`,
            ozelVar ? m.ozelEgitimSaati > 0 : m.ozelEgitimSaati === 0,
            "ozelEgitimSaati: " + m.ozelEgitimSaati);
    }
}

/* ---- panel, özel eğitim varken de basılmalı ---------------------------- */
/* 09.09.2026: denklem tutar hâle geldi ama panel yine görünmedi — dört kalemin
   dördü de sıfır olduğu için. Oysa özel eğitim saatleri branş kartlarında
   görünmüyor; müdür kartları toplayıp üstteki sayıyı tutturamıyor. Panelin
   basılma koşulu bu durumu da kapsamalı. */
{
    const UIsrc = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");

    const guardlar = [...UIsrc.matchAll(
        /if \(!k \|\| \(k\.satirlar\.length === 0 && !k\.ozelEgitimSaati\)\) return "";/g)];
    kontrol("panelin üç kapısı da özel eğitim saatini gözetiyor",
        guardlar.length, 3);

    kontrol("kalem üreticisi özel eğitim saatini dışarı veriyor",
        /ozelEgitimSaati: m\.ozelEgitimSaati \|\| 0/.test(UIsrc), true);
    kontrol("branş kartlarının toplamı ayrıca hesaplanıyor",
        /genelBransYuku:/.test(UIsrc), true);
    kontrol("panel metni Md. 17'ye dayanıyor",
        /şube başına<\/strong> verilir \(Md\. 17\/1\)/.test(UIsrc), true);
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ YÜK MUTABAKATI HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ YÜK MUTABAKATI DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

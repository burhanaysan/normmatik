/* ===========================================================================
   NormMatik™ — Özel eğitim müfredatı testi
   ===========================================================================
   NE DENETLER: Özel eğitim şubesine verilen dersler, ORGM'nin resmî haftalık
   ders çizelgesiyle birebir aynı mı — ders adı, saat ve sınıf dağılımı?

   NEDEN VAR
   ---------
   Özel eğitim müfredatı 28.08.2026'ya kadar curriculumEngine.js içinde ELLE
   YAZILMIŞ 8 dersti ve hiçbir resmî çizelgeden üretilmemişti. Resmî çizelgeyle
   karşılaştırılınca yanlış olduğu görüldü:

       Din Kültürü            2 saat yazılmış   ->  çizelge 1
       "Görsel Sanatlar ve Müzik" tek ders      ->  AYRI iki ders (9-10'da 2+2)
       Beden Eğitimi          sabit 2           ->  2/2/1/1
       Rehberlik              2 saat            ->  1 saat
       Sosyal, Kültürel ve Sportif Faaliyetler  ->  hiç yoktu (11-12'de 3 saat)

   Hatalar birbirini götürdüğü için TOPLAM yine 30 saat çıkıyordu. Okul
   toplamı doğru görünüyor, BRANŞ DAĞILIMI yanlış oluyordu — Müzik
   öğretmeninin yükü hiç görünmüyordu. Bakınca "30 saat, doğru" denilen,
   sessiz hata sınıfının tipik örneği.

   KAYNAK
   ------
   https://orgm.meb.gov.tr/www/haftalik-ders-cizelgeleri/icerik/3106
   (27.08.2026 güncel). PDF'ten çıkarılan veri:
   data/kaynak_cizelgeler/ozel_egitim/*.json

   Bu test, uygulamanın çıktısını O JSON'la karşılaştırır; JSON ise üretilirken
   çizelgenin KENDİ TOPLAM SATIRINA karşı doğrulanır (tools/uret_ozel_egitim.py).
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const KAYNAK = path.join(KOK, "data", "kaynak_cizelgeler", "ozel_egitim");

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};
function olumcul(m) {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: " + m);
    console.log("   (Test hiçbir şeyi denetlemedi; 'hata yok' anlamsız olurdu.)");
    process.exit(1);
}

/* ---- uygulamayı yükle ------------------------------------------------- */
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
    alert() {},
};
ctx.globalThis = ctx;
w.dispatchEvent = () => true;
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8"), ctx);

w.dbService.masterData = JSON.parse(
    fs.readFileSync(path.join(KOK, "data", "meb_master_db.json"), "utf8"));
w.dbService.isLoaded = true;
w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true };

const ce = w.curriculumEngine, st = w.appState;

const TABLO = w.OZEL_EGITIM_CIZELGELERI;
if (!TABLO || !TABLO.meslek_okulu || !TABLO.ilkokul_ortaokul)
    olumcul("OZEL_EGITIM_CIZELGELERI yüklenmedi (build_bundle EXPORTS_CODE?).");

const ah = (x) => String(x || "")
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i").toLowerCase()
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]/g, "");

function kaynakOku(dosya) {
    const j = JSON.parse(fs.readFileSync(path.join(KAYNAK, dosya), "utf8"));
    const bek = {};
    for (const d of j.dersler) {
        for (const [sinif, v] of Object.entries(d.saatler || {})) {
            if (!v) continue;
            const saat = v.tip === "sabit" ? v.saat : Math.max(...v.secenekler);
            (bek[sinif] = bek[sinif] || {})[ah(d.ders_adi)] = { ad: d.ders_adi, saat };
        }
    }
    return { bek, toplam: j.cizelge_toplami || {} };
}

/* ---- 1) Motor çıktısı kaynak çizelgeyle birebir mi? ------------------- */
const ISLER = [
    ["meslek_okulu", "meslek_okulu_hafif_zihinsel.json",
        "anadolu_imam_hatip_lisesi", ["9", "10", "11", "12"]],
    ["ilkokul_ortaokul", "ilkokul_ortaokul_hafif_zihinsel.json",
        "ortaokul_temel_egitim", ["5", "6", "7", "8"]],
];

let karsilastirma = 0;
for (const [tabloAdi, dosya, okulTuru, siniflar] of ISLER) {
    const { bek, toplam } = kaynakOku(dosya);
    kontrol(tabloAdi + ": kaynaktan ders okundu", Object.keys(bek).length > 0);

    for (const sinif of siniflar) {
        const liste = ce.getMandatoryCourses(
            okulTuru, sinif, "ozel_egitim", "Özel Eğitim Sınıfı") || [];
        kontrol(tabloAdi + " " + sinif + ": liste boş değil", liste.length > 0);
        if (!liste.length) continue;

        const sunulan = {};
        for (const d of liste) sunulan[ah(d.ders)] = d.saat;
        const beklenen = bek[sinif] || {};

        // (a) Çizelgedeki her ders var mı, saati doğru mu?
        for (const [k, v] of Object.entries(beklenen)) {
            karsilastirma++;
            kontrol(tabloAdi + " " + sinif + ". sınıf: " + v.ad,
                sunulan[k] === v.saat,
                k in sunulan ? "saat " + sunulan[k] + ", çizelge " + v.saat : "ders YOK");
        }

        // (b) Çizelgede olmayan ders sunulmamalı.
        const fazla = Object.keys(sunulan).filter(k => !(k in beklenen));
        kontrol(tabloAdi + " " + sinif + ". sınıf: fazladan ders yok",
            fazla.length === 0, fazla.join(", "));

        // (c) Toplam saat, çizelgenin kendi toplam satırını tutmalı.
        const t = liste.reduce((a, d) => a + (d.saat || 0), 0);
        if (toplam[sinif] !== undefined) {
            kontrol(tabloAdi + " " + sinif + ". sınıf toplam saat",
                t === toplam[sinif], t + " / çizelge " + toplam[sinif]);
        }
    }
}
if (karsilastirma < 60)
    olumcul("yalnızca " + karsilastirma + " ders karşılaştırıldı (beklenen >60).");

/* ---- 2) Eski elle yazılmış listenin hataları geri gelmemeli ----------- */
// Bunlar tek tek isimle denetlenir; aynı hata sessizce geri dönerse burada
// kırmızı yanar.
{
    const l = ce.getMandatoryCourses(
        "anadolu_imam_hatip_lisesi", "9", "ozel_egitim", "Özel Eğitim Sınıfı") || [];
    const bul = (ad) => l.find(d => ah(d.ders) === ah(ad));
    kontrol("Müzik ayrı bir ders (birleşik değil)", !!bul("Müzik"));
    kontrol("Görsel Sanatlar ayrı bir ders", !!bul("Görsel Sanatlar"));
    kontrol("'Görsel Sanatlar ve Müzik' birleşik dersi kalmadı",
        !l.some(d => /görsel sanatlar ve müzik/i.test(d.ders)));
    kontrol("Din Kültürü 1 saat (2 değil)", bul("Din Kültürü ve Ahlak Bilgisi")?.saat === 1,
        String(bul("Din Kültürü ve Ahlak Bilgisi")?.saat));
    kontrol("Rehberlik 1 saat (2 değil)", bul("Rehberlik")?.saat === 1,
        String(bul("Rehberlik")?.saat));
    kontrol("uydurma ders adı kalmadı ('İş Becerileri ve Mesleki Uygulamalar')",
        !l.some(d => /İş Becerileri ve Mesleki Uygulamalar/i.test(d.ders)));

    const l11 = ce.getMandatoryCourses(
        "anadolu_imam_hatip_lisesi", "11", "ozel_egitim", "Özel Eğitim Sınıfı") || [];
    kontrol("11. sınıfta 'Sosyal, Kültürel ve Sportif Faaliyetler' var",
        l11.some(d => /sportif faaliyetler/i.test(d.ders)));
    kontrol("Beden Eğitimi 11. sınıfta 1 saat",
        l11.find(d => ah(d.ders) === ah("Beden Eğitimi"))?.saat === 1);
}

/* ---- 3) Şube kurulduğunda da korunuyor mu? --------------------------- */
// state.sanitizeSection ders adlarını düzeltir ve rehberliği yeniden yazar;
// çizelge değerlerini bozmamalı.
{
    for (const [okulTuru, sinif, bekToplam] of [
        ["anadolu_imam_hatip_lisesi", "9", 30],
        ["anadolu_imam_hatip_lisesi", "12", 30],
        ["ortaokul_temel_egitim", "8", 29],
    ]) {
        st.state = st.getDefaultState();
        st.state.okulBilgisi.okulTuru = okulTuru;
        const z = ce.getMandatoryCourses(okulTuru, sinif, "ozel_egitim", "Özel Eğitim Sınıfı");
        st.addSection({ subeAdi: sinif + "-Z", sinifSeviyesi: sinif, ogrenciSayisi: 10,
            alanId: "ozel_egitim", dalAdi: "Özel Eğitim Sınıfı", isSpecialEdu: true,
            zorunluDersler: z, secmeliDersler: [] });
        const sec = st.state.subeler[0];
        const t = (sec.zorunluDersler || []).reduce((a, d) => a + (d.saat || 0), 0);
        kontrol("şube kurulduktan sonra toplam saat (" + okulTuru + " " + sinif + ")",
            t === bekToplam, t + " / beklenen " + bekToplam);
        const reh = (sec.zorunluDersler || []).filter(d => /rehberl/i.test(d.ders));
        kontrol("rehberlik tek kayıt (" + okulTuru + " " + sinif + ")", reh.length === 1,
            reh.length + " kayıt");
        if (reh.length) kontrol("rehberlik 1 saat (" + okulTuru + " " + sinif + ")",
            reh[0].saat === 1, String(reh[0].saat));
    }
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ ÖZEL EĞİTİM MÜFREDATI HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar.slice(0, 25)) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ ÖZEL EĞİTİM MÜFREDATI DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("   (" + karsilastirma + " ders, ORGM resmî çizelgesiyle karşılaştırıldı)");
console.log("=".repeat(70));

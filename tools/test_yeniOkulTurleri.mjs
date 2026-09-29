/* ===========================================================================
   NormMatik — SPOR ORTAOKULU ve GÜZEL SANATLAR MÜZİK İLKOKULU VE ORTAOKULU
   (29.09.2026 — TTKB 23/09/2026-113 ve 23/09/2026-114, Temel Eğitim Genel
   Müdürlüğü, 2026-2027 öğretim yılından itibaren; YENİ okul türleri)

   NEDEN VAR
   ---------
   Nöbetçi bot 4 yeni TTKB belgesi bildirdi; 2'si mevcut çizelgelerin
   (İlköğretim, İmam Hatip Ortaokulu) değişmeden yeniden yayımlanmasıydı
   (arşive kondu, kod değişikliği gerekmedi). Diğer 2'si tamamen YENİ okul
   türleriydi: Spor Ortaokulu ve Güzel Sanatlar Müzik İlkokulu ve Ortaokulu.
   Bu test, resmî kararların PDF'lerinden geometrik olarak çıkarılan ders
   listelerinin ve saatlerin uygulamaya doğru işlendiğini kalıcı olarak korur.

   Kapsam:
     1) getMandatoryCourses — her sınıfın ders listesi PDF alt toplamıyla
        (ORTAK + ALAN [+ REHBERLİK]) birebir eşleşiyor mu.
     2) getOfficialTargetHours (database.js) — "hedef ders saati" ekran
        rozeti doğru mu. Düzeltmeden önce ikisi de genel "ortaokul" alt dize
        eşleşmesiyle yanlışlıkla düz 35'e düşüyordu.
     3) SECMELI_HAVUZU türetmesi — iki yeni tür, ortaokul_temel_egitim
        havuzundan türetildi (aynı ders/grup listesi, ama kararın kendi
        açıklaması gereği TÜM saatler [1]'e sabitlendi).
     4) bireBirTurMu kapısı (normEngine.js) — Md. 22/4 (bire bir çalgı/ses
        ilavesi) yalnız SPOR ve GÜZEL SANATLAR LİSELERİNİ kapsar; GSM
        ilkokul/ortaokul kademesindedir ve bu formülü ALMAMALIDIR. Aksi
        hâlde 20 öğrencilik bir şubede Müzik normu 20 katına çıkardı
        (İmam Hatip Ortaokulu'nda daha önce yakalanan aynı hata sınıfı,
        Denetim N-07, 16.09.2026).

   Testler YAYIMLANAN paketi (js/bundle.js) çalıştırır; kaynak düzenlendikten
   sonra `python tools/build_bundle.py` çalışmadan sonuç yanıltıcıdır.

   ÇALIŞTIRMA: node tools/test_yeniOkulTurleri.mjs   (çıkış kodu 0 = geçti)
   ======================================================================== */
import fs from "fs";
import path from "path";
import vm from "vm";

const KOK = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const oku = (...y) => fs.readFileSync(path.join(KOK, ...y), "utf8");

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti = "") => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti !== "" ? "  ->  " + ayrinti : ""));
};

async function paketYukle() {
    const w = {};
    const fetchSaplama = async (adres) => {
        const a = String(adres);
        if (/^https?:|^\/\//i.test(a)) return { ok: false, status: 0, json: async () => null, text: async () => "" };
        const yol = path.join(KOK, a.replace(/^\.\//, "").split("?")[0]);
        if (!yol.startsWith(KOK) || !fs.existsSync(yol)) return { ok: false, status: 404, json: async () => null, text: async () => "" };
        const m = fs.readFileSync(yol, "utf8");
        return { ok: true, status: 200, json: async () => JSON.parse(m), text: async () => m };
    };
    const bos = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    const ctx = {
        window: w, self: w, console: { log() {}, warn() {}, error() {}, info() {} }, fetch: fetchSaplama,
        localStorage: bos, sessionStorage: bos, navigator: { userAgent: "node" },
        location: { href: "x", hostname: "localhost" }, screen: { width: 1920, height: 1080 },
        setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
        crypto: { getRandomValues: (a) => a },
        CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
        alert() {}, confirm: () => true
    };
    ctx.globalThis = ctx; w.dispatchEvent = () => true; w.addEventListener = () => {}; w.fetch = fetchSaplama;
    vm.createContext(ctx);
    vm.runInContext(oku("js", "bundle.js").replace(/^export /gm, ""), ctx);
    if (w.dbService && w.dbService.loadDatabase) await w.dbService.loadDatabase();
    if (w.licenseManager) w.licenseManager.licenseStatus = Object.assign({}, w.licenseManager.licenseStatus,
        { isValid: true, licenseType: "TEST", isMaster: false, isDemo: false, maxSections: -1, allowExport: true });
    return { w, ne: w.normEngine, ce: w.curriculumEngine, db: w.dbService, sh: w.SECMELI_HAVUZU };
};

const { ne, ce, db, sh } = await paketYukle();

// ---------------------------------------------------------- 1) DERS LİSTELERİ / TOPLAM SAAT
// PDF'lerin kendi "TOPLAM DERS SAATİ" alt toplam satırlarından alındı.
const SPOR_TOPLAM = { 5: 37, 6: 37, 7: 37, 8: 37 };
const GSM_TOPLAM = { 1: 35, 2: 35, 3: 40, 4: 40, 5: 37, 6: 37, 7: 37, 8: 37 };

for (const [g, beklenen] of Object.entries(SPOR_TOPLAM)) {
    const dersler = ce.getMandatoryCourses("spor_ortaokulu", g, null, null);
    const toplam = dersler.reduce((a, c) => a + (parseInt(c.saat, 10) || 0), 0);
    kontrol(`spor_ortaokulu ${g}. sınıf toplam ders saati`, toplam === beklenen, `bulunan ${toplam}, beklenen ${beklenen}`);
    kontrol(`spor_ortaokulu ${g}. sınıf ders listesi boş değil`, dersler.length > 0);
}
for (const [g, beklenen] of Object.entries(GSM_TOPLAM)) {
    const dersler = ce.getMandatoryCourses("guzel_sanatlar_muzik_ilkokulu_ortaokulu", g, null, null);
    const toplam = dersler.reduce((a, c) => a + (parseInt(c.saat, 10) || 0), 0);
    kontrol(`gsm ${g}. sınıf toplam ders saati`, toplam === beklenen, `bulunan ${toplam}, beklenen ${beklenen}`);
    kontrol(`gsm ${g}. sınıf ders listesi boş değil`, dersler.length > 0);
}

// Genel "ortaokul"/"ilkokul" alt dize eşleşmeli blokların yeni türleri
// yanlışlıkla yakalamadığını, ALAN DERSLERİ kategorisiyle doğrula (genel
// ortaokul/ilkokul çizelgesinde bu kategori hiç yok).
const sporAlanVar = ce.getMandatoryCourses("spor_ortaokulu", "5", null, null).some(d => d.kategori === "ALAN DERSLERİ");
kontrol("spor_ortaokulu kendi ALAN DERSLERİ bloğuna düşüyor (genel ortaokula değil)", sporAlanVar);
const gsmAlanVar = ce.getMandatoryCourses("guzel_sanatlar_muzik_ilkokulu_ortaokulu", "5", null, null).some(d => d.kategori === "ALAN DERSLERİ" && d.atananBrans === "Müzik");
kontrol("gsm kendi ALAN DERSLERİ bloğuna düşüyor (genel ortaokula/ilkokula değil)", gsmAlanVar);

// ---------------------------------------------------------- 2) HEDEF DERS SAATİ (database.js)
for (const [g, beklenen] of Object.entries(SPOR_TOPLAM)) {
    const hedef = db.getOfficialTargetHours("spor_ortaokulu", g, null, null);
    kontrol(`hedef ders saati spor_ortaokulu ${g}. sınıf`, hedef === beklenen, `bulunan ${hedef}, beklenen ${beklenen} (düz "35" fallback'i değil)`);
}
for (const [g, beklenen] of Object.entries(GSM_TOPLAM)) {
    const hedef = db.getOfficialTargetHours("guzel_sanatlar_muzik_ilkokulu_ortaokulu", g, null, null);
    kontrol(`hedef ders saati gsm ${g}. sınıf`, hedef === beklenen, `bulunan ${hedef}, beklenen ${beklenen} (düz "35" fallback'i değil)`);
}

// ---------------------------------------------------------- 3) SECMELI_HAVUZU TÜRETMESİ
kontrol("SECMELI_HAVUZU spor_ortaokulu anahtarı var", !!(sh && sh["spor_ortaokulu"]));
kontrol("SECMELI_HAVUZU gsm anahtarı var", !!(sh && sh["guzel_sanatlar_muzik_ilkokulu_ortaokulu"]));
if (sh && sh["spor_ortaokulu"] && sh["ortaokul_temel_egitim"]) {
    for (const sinif of ["5", "6", "7", "8"]) {
        const kaynakAdet = (sh["ortaokul_temel_egitim"][sinif] || []).length;
        const sporAdet = (sh["spor_ortaokulu"][sinif] || []).length;
        const gsmAdet = (sh["guzel_sanatlar_muzik_ilkokulu_ortaokulu"][sinif] || []).length;
        kontrol(`secmeli_havuzu spor_ortaokulu ${sinif}. sınıf ders sayısı kaynakla eşit`, sporAdet === kaynakAdet, `${sporAdet} != ${kaynakAdet}`);
        kontrol(`secmeli_havuzu gsm ${sinif}. sınıf ders sayısı kaynakla eşit`, gsmAdet === kaynakAdet, `${gsmAdet} != ${kaynakAdet}`);
        const sporSaatTek = (sh["spor_ortaokulu"][sinif] || []).every(d => d.saatler.length === 1 && d.saatler[0] === 1);
        const gsmSaatTek = (sh["guzel_sanatlar_muzik_ilkokulu_ortaokulu"][sinif] || []).every(d => d.saatler.length === 1 && d.saatler[0] === 1);
        kontrol(`secmeli_havuzu spor_ortaokulu ${sinif}. sınıf tüm saatler [1]`, sporSaatTek);
        kontrol(`secmeli_havuzu gsm ${sinif}. sınıf tüm saatler [1]`, gsmSaatTek);
    }
}
// GSM 1-4. sınıflarda (ilkokul kademesi) seçmeli sistemi yok — tıpkı genel
// ilkokulda olduğu gibi; ortaokul_temel_egitim kaynağında da bu sınıflar
// hiç yok, dolayısıyla türetilen havuzda da olmamalı (varsa hatalı üretim).
if (sh && sh["guzel_sanatlar_muzik_ilkokulu_ortaokulu"]) {
    for (const sinif of ["1", "2", "3", "4"]) {
        kontrol(`secmeli_havuzu gsm ${sinif}. sınıf yok (ilkokulda seçmeli sistemi yok)`, !sh["guzel_sanatlar_muzik_ilkokulu_ortaokulu"][sinif]);
    }
}

// ---------------------------------------------------------- 4) BİRE BİR KAPISI (Md. 22/4 lise-only)
// GSM'de "Bireysel Çalgı Eğitimi" 2 saat, 20 öğrencili bir şubede NORMAL
// Md. 18 dersi gibi (çarpansız) sayılmalı: yük = baseHours, groupCount = 1.
// Lise formülü yanlışlıkla uygulansaydı yük 2*20=40 (tavanla sınırlı da olsa
// kesinlikle baseHours'tan büyük) çıkardı.
{
    const dersler5 = ce.getMandatoryCourses("guzel_sanatlar_muzik_ilkokulu_ortaokulu", "5", null, null);
    const bireyselCalgi = dersler5.find(d => d.ders === "Bireysel Çalgı Eğitimi");
    kontrol("gsm 5. sınıf 'Bireysel Çalgı Eğitimi' dersi bulundu", !!bireyselCalgi);
    if (bireyselCalgi) {
        const sonuc = ne._otomatikGrupHesapla(bireyselCalgi, 20, "guzel_sanatlar_muzik_ilkokulu_ortaokulu", "5", 0);
        kontrol("gsm Bireysel Çalgı Eğitimi lise bire-bir formülünü ALMIYOR (groupCount=1)", sonuc.groupCount === 1, `groupCount=${sonuc.groupCount}`);
        kontrol("gsm Bireysel Çalgı Eğitimi yükü çarpansız (baseHours ile eşit)", sonuc.calculatedLoad === bireyselCalgi.saat, `calculatedLoad=${sonuc.calculatedLoad}, saat=${bireyselCalgi.saat}`);
    }

    // Karşılaştırma: gerçek güzel sanatlar LİSESİNDE aynı adlı ders formülü ALMALI.
    // (İçerik farklı olsa da kapı yalnız isim+okul türüne bakıyor; sahte bir ders
    // nesnesiyle kapının lise tarafında hâlâ açık olduğunu doğruluyoruz.)
    const sahteLiseDersi = { ders: "Bireysel Çalgı Eğitimi", saat: 2 };
    const sonucLise = ne._otomatikGrupHesapla(sahteLiseDersi, 20, "guzel_sanatlar_lisesi", "9", 0);
    kontrol("güzel sanatlar LİSESİ aynı ders adıyla bire-bir formülünü ALIYOR (regresyon değil)", sonucLise.groupCount === 20 || sonucLise.calculatedLoad > sahteLiseDersi.saat, `groupCount=${sonucLise.groupCount}, calculatedLoad=${sonucLise.calculatedLoad}`);
}

// ---------------------------------------------------------- SONUÇ
console.log(`GEÇTİ: ${gecen}  |  HATA: ${hatalar.length}`);
if (hatalar.length) {
    console.log("\nHATALAR:");
    hatalar.forEach(h => console.log("  - " + h));
    process.exit(1);
} else {
    console.log("Tüm kontroller doğru.");
    process.exit(0);
}

/* ===========================================================================
   NormMatik™ — Bulut kayıt durumu testi
   ===========================================================================
   NE DENETLER: Veri buluta kaydedilemediğinde kullanıcı BUNU ÖĞRENİYOR mu?

   NEDEN VAR (okul müdürü bildirimi, 05.09.2026)
   --------------------------------------------
   "Kadro yönetimi penceresi: kayıtlar sanki veri tabanına kayıt olmuyor."

   İnceleme iki sessiz yol ortaya çıkardı:

   1) cloudDatabaseService kayıt sonucunu 'normmatik-bulut-durum' olayıyla
      yayınlıyordu ama HİÇBİR YER DİNLEMİYORDU. Kayıt reddedilse bile ekranda
      tek bir uyarı çıkmıyordu; üstelik kadro penceresi koşulsuz
      "güncellendi" diyordu. İdareci veriyi kaydettiğini sanıyor, hiçbir şey
      yazılmıyordu.

   2) scheduleAutoSave, kurum kodu boş / "*" / ayrılmış "123456" ise
      sessizce `return` ediyordu: kayıt hiç denenmiyor, kimseye bir şey
      söylenmiyordu.

   Uygulama okul verisini YERELDE SAKLAMIYOR (loadFromStorage her zaman false
   döner). Bu yüzden bulut kaydı başarısızsa veri hiçbir yerde yoktur —
   sessiz başarısızlık burada doğrudan veri kaybı demektir.
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

/* ---- uygulamayı yükle, olayları yakala ------------------------------- */
const olaylar = [];
const w = {};
const ctx = {
    window: w, self: w, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout: () => 1, clearTimeout() {}, setInterval, clearInterval,
    crypto: { getRandomValues: (a) => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {},
};
ctx.globalThis = ctx;
w.dispatchEvent = (e) => { olaylar.push({ tip: e.type, detay: e.detail }); return true; };
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8"), ctx);

const CDS = vm.runInContext("CloudDatabaseService", ctx);
if (!CDS) olumcul("CloudDatabaseService bulunamadı.");
const cloud = new CDS();

const durumlar = () => olaylar.filter(o => o.tip === "normmatik-bulut-durum");

/* ---- 1) Kurum kodu yoksa SESSİZ KALINMAZ ----------------------------- */
for (const [kod, etiket] of [
    ["", "boş"], ["*", "yıldız"], ["123456", "ayrılmış 123456"], [null, "null"],
]) {
    olaylar.length = 0;
    cloud.scheduleAutoSave(kod, { okulBilgisi: { okulAdi: "X" }, subeler: [] });
    const d = durumlar();
    kontrol("kurum kodu " + etiket + ": durum bildiriliyor", d.length > 0);
    if (d.length) {
        kontrol("kurum kodu " + etiket + ": başarısız olarak işaretli",
            d[0].detay.basarili === false, String(d[0].detay.basarili));
        kontrol("kurum kodu " + etiket + ": kalıcı hata (tekrar denemek çözmez)",
            d[0].detay.kalici === true, String(d[0].detay.kalici));
        kontrol("kurum kodu " + etiket + ": mesaj anlamlı",
            /kaydedilmiyor|kurum kodu/i.test(d[0].detay.mesaj || ""),
            d[0].detay.mesaj);
    }
}

/* ---- 2) Geçerli kurum kodunda hemen hata verilmez -------------------- */
// Kayıt gecikmeli (600 ms) yapıldığı için bu aşamada durum bildirilmez.
// Yanlışlıkla "hata" bildirilseydi, her tuşta sahte uyarı çıkardı.
{
    olaylar.length = 0;
    cloud.scheduleAutoSave("318742", { okulBilgisi: { okulAdi: "X" }, subeler: [] });
    kontrol("geçerli kurum kodunda sahte hata yok",
        durumlar().filter(d => d.detay.basarili === false).length === 0);
}

/* ---- 3) _durumBildir olayı doğru yayınlıyor -------------------------- */
{
    olaylar.length = 0;
    cloud._durumBildir(false, "TEST: yetki reddi", true);
    const d = durumlar();
    kontrol("durum olayı yayınlanıyor", d.length === 1);
    if (d.length) {
        kontrol("mesaj taşınıyor", d[0].detay.mesaj === "TEST: yetki reddi");
        kontrol("kalıcı bayrağı taşınıyor", d[0].detay.kalici === true);
        kontrol("zaman damgası var", !!d[0].detay.zaman);
    }
    kontrol("son durum nesnede saklanıyor",
        cloud.sonDurum && cloud.sonDurum.basarili === false);
}

/* ---- 4) UYGULAMA BU OLAYI DİNLİYOR MU? ------------------------------- */
// Asıl hata buydu: olay yayınlanıyor ama kimse dinlemiyordu. Kaynakta
// dinleyicinin varlığı denetlenir; kaldırılırsa test kırmızı yanar.
{
    const appJs = fs.readFileSync(path.join(KOK, "js", "app.js"), "utf8");
    kontrol("app.js 'normmatik-bulut-durum' olayını dinliyor",
        /addEventListener\(\s*["']normmatik-bulut-durum["']/.test(appJs));
    kontrol("dinleyici başarısızlıkta kullanıcıya gösteriyor",
        /normmatik-bulut-durum[\s\S]{0,900}showToast/.test(appJs));

    const bundleJs = fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8");
    kontrol("dinleyici PAKETE girmiş (bundle tazelenmiş)",
        /addEventListener\(\s*["']normmatik-bulut-durum["']/.test(bundleJs));
}

/* ---- 5) Yerel yedek yok — bu yüzden sessizlik veri kaybıdır ---------- */
// Bu kontrol, yukarıdaki uyarının neden bu kadar önemli olduğunu sabitler.
{
    kontrol("loadFromStorage yerelden veri döndürmüyor",
        w.appState.loadFromStorage() === false);
}

/* ---- 6) RET SEBEBİ ADIYLA SÖYLENİYOR MU? ----------------------------- */
// Veritabanı kuralı her ret için aynı şeyi döndürür: "Permission denied".
// Kullanıcıya "erişim yetkiniz yok" demek sorunu çözülemez hâle getiriyordu
// (okul müdürü 05.09.2026: uyarı çıkıyor ama sebebi anlaşılmıyor).
// Kural üç şart koşuyor; istemci okul_kayit ve abonelik düğümlerini
// OKUYABİLDİĞİ için hangisinin tutmadığını kendisi belirleyebilir.
{
    const gecerliAbonelik = { bitisMs: Date.now() + 9e8 };
    const senaryolar = [
        ["okul adı uyuşmazlığı",
            { okulAdi: "A Lisesi", okulTuru: "anadolu_lisesi" }, gecerliAbonelik,
            { okulAdi: "B Lisesi", okulTuru: "anadolu_lisesi" }, /okul adı kayıtla uyuşmuyor/i],
        ["okul türü uyuşmazlığı",
            { okulAdi: "A Lisesi", okulTuru: "anadolu_lisesi" }, gecerliAbonelik,
            { okulAdi: "A Lisesi", okulTuru: "fen_lisesi" }, /okul türü kayıtla uyuşmuyor/i],
        ["abonelik süresi dolmuş",
            { okulAdi: "A Lisesi", okulTuru: "anadolu_lisesi" }, { bitisMs: Date.now() - 9e8 },
            { okulAdi: "A Lisesi", okulTuru: "anadolu_lisesi" }, /abonelik süresi dolmuş/i],
        ["okul kaydı yok / sahip değil",
            null, null,
            { okulAdi: "A Lisesi", okulTuru: "anadolu_lisesi" }, /okul kaydı bulunamadı|sahibi değil/i],
    ];

    const cloud2 = new CDS();
    for (const [etiket, kayit, abonelik, ekran, desen] of senaryolar) {
        cloud2._istekTekrarli = async (yol, yontem) => {
            if (yontem === "PUT") {
                return { ok: false, mesaj: "Bu okulun verisine erişim yetkiniz yok.", kalici: true };
            }
            if (yol.startsWith("okul_kayit")) return { ok: true, veri: kayit };
            if (yol.startsWith("abonelik")) return { ok: true, veri: abonelik };
            return { ok: false, mesaj: "?", kalici: true };
        };
        olaylar.length = 0;
        await cloud2.saveSchoolData("318742", { okulBilgisi: ekran, subeler: [] });
        const d = durumlar();
        kontrol(etiket + ": durum bildirildi", d.length > 0);
        const mesaj = d.length ? (d[d.length - 1].detay.mesaj || "") : "";
        kontrol(etiket + ": sebep adıyla söyleniyor", desen.test(mesaj), mesaj.slice(0, 90));
        kontrol(etiket + ": genel 'yetkiniz yok' mesajı kalmadı",
            !/erişim yetkiniz yok/i.test(mesaj), mesaj.slice(0, 60));
    }
}

/* ---- 7) Kadro penceresi yanlış başarı ilan etmemeli ------------------ */
// Bulut kaydı 600 ms geciktirmeli; pencere kapanırken kayıt henüz
// denenmemiştir. "Güncellendi" demek, hemen ardından gelen "kaydedilmedi"
// uyarısıyla çelişiyordu.
{
    const uiSrc = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    const i = uiSrc.indexOf('btn-save-staff")?.addEventListener');
    kontrol("kadro kaydet düğmesi bulundu (ölçüm geçerli)", i > 0);
    const blok = i > 0 ? uiSrc.slice(i, i + 4000) : "";
    kontrol("kadro penceresi 'güncellendi/kaydedildi' demiyor",
        !/showToast\("[^"]*(güncellendi|kaydedildi)/i.test(blok));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ BULUT KAYIT DURUMU HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ BULUT KAYIT DURUMU DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

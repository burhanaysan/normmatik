/* ===========================================================================
   NormMatik — ÇOK PROGRAMLI OKULDA BİRLEŞİK SEÇMELİ LİSTESİ   (30.10.2026)

   NEDEN VAR
   ---------
   Çok programlı Anadolu lisesi müşterisi AMP 12. sınıfta okulun e-Okul'da tanımladığı "Girişimcilik"
   dersini bulamadı: ders Anadolu Lisesi havuzunda var, AMP'nin resmî tablosunda yok. Karar: bu okul
   türünde şube hangi programdaysa olsun Anadolu + AMP + MESEM seçmelileri tek listede gösterilir.

   Bu test şunları KALICI korur:
     A) AMP şubesinde Anadolu havuzunun dersleri (Girişimcilik) de çıkar; ortak dersler TEK satırdır.
     B) Şubenin kendi programının dersleri önce gelir; saat seçenekleri birleşir; havuz etiketi doğrudur.
     C) Alanı olmayan AL şubesinde alana bağlı (seçmeli meslek) ders ÇIKMAZ; Anadolu havuzu alanı yoksayarak
        çağrılır, yani AMP şubesine başka alanın/katı listenin meslek dersleri sızmaz.
     D) Diğer okul türlerinin listesi DEĞİŞMEZ (turZorla = kendi türü ile aynı).
     E) Başka havuzdan seçilen ders "resmî listede yok" diye UYARILMAZ, yalnız bilgi notu (tur: "havuz") çıkar;
        hiçbir havuzda olmayan ders yine uyarılır.
     F) Ekran: kaynak etiketi ve bilgi simgesi koddadır.

   ÇALIŞTIRMA: node tools/test_cokProgramliSecmeli.mjs   (çıkış kodu 0 = geçti)
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

const w = {};
const bos = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
const ctx = {
    window: w, self: w, console: { log() {}, warn() {}, error() {}, info() {} },
    fetch: async () => ({ ok: false, status: 0, json: async () => null, text: async () => "" }),
    localStorage: bos, sessionStorage: bos, navigator: { userAgent: "node" },
    location: { href: "x", hostname: "localhost" }, screen: { width: 1, height: 1 },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    crypto: { getRandomValues: (a) => a }, CustomEvent: class {}, alert() {}, confirm: () => true
};
ctx.globalThis = ctx; w.dispatchEvent = () => true; w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(oku("js", "bundle.js").replace(/^export /gm, ""), ctx);
await w.dbService.loadDatabase(); w.dbService.isLoaded = true;

const st = w.appState, ce = w.curriculumEngine, ne = w.normEngine;
const ui = new w.UIComponentManager(w.dbService, st, ne, ce);
const anahtar = (ad) => st._secmeliAnahtar(ad);
const bolum = (program, sinif, alan) => ({
    id: "x", subeAdi: sinif + "-X", sinifSeviyesi: sinif, program, alanId: alan || null, dalAdi: null,
    ogrenciSayisi: 12, zorunluDersler: [], secmeliDersler: []
});
const okulTuru = (t) => { st.state = st.getDefaultState(); st.state.okulBilgisi.okulTuru = t; };

/* ---- A/B) AMP 12 muhasebe şubesi ---------------------------------------- */
okulTuru("cok_programli_anadolu_lisesi");
{
    const amp = ui.getAvailableElectivesForSection(bolum("amp", "12", "muhasebe"));
    const adlar = amp.map(d => anahtar(d.ders));
    kontrol("hiçbir ders listede iki kez yok", new Set(adlar).size === adlar.length, String(adlar.length - new Set(adlar).size));

    const giris = amp.find(d => /^giri[şs]imcilik$/i.test(String(d.ders).replace(/İ/g, "i")));
    kontrol("AMP şubesinde Anadolu havuzunun 'Girişimcilik' dersi çıkıyor", !!giris);
    kontrol("Girişimcilik'in havuz etiketi yalnız AL", giris && giris.havuzlar.join() === "AL", giris && giris.havuzlar.join());
    kontrol("Girişimcilik 1 ve 2 saat seçeneği taşıyor", giris && giris.hoursOptions.includes(1) && giris.hoursOptions.includes(2));
    kontrol("Girişimcilik AMP'nin kendi listesinde yok işaretli", giris && giris.kendiHavuzdaYok === true);

    const ahilik = amp.find(d => /^ahilik k/i.test(d.ders));
    kontrol("AMP'nin kendi 'Ahilik Kültürü ve Girişimcilik' dersi de duruyor", !!ahilik && ahilik.havuzlar.includes("AMP"));
    kontrol("Ahilik AMP'de kendi listesinde (yok işareti kapalı)", ahilik && ahilik.kendiHavuzdaYok === false);

    // ortak ders: hem AL hem AMP kültür tablosunda olan bir ders tek satır ve iki etiketli
    const ortak = amp.find(d => /^se[çc]meli matematik$/i.test(String(d.ders).replace(/İ/g, "i")));
    kontrol("ortak ders (Seçmeli Matematik) tek satır ve AL+AMP etiketli",
        ortak && ortak.havuzlar.includes("AL") && ortak.havuzlar.includes("AMP"), ortak && ortak.havuzlar.join());
    kontrol("kendi programın etiketi ilk sırada", ortak && ortak.havuzlar[0] === "AMP", ortak && ortak.havuzlar.join());

    // kendi programın grubu korunur (MTAL grup adı), Anadolu'nun büyük harfli adı değil
    kontrol("ortak dersin grubu şubenin kendi programından geliyor", ortak && /Akademik/.test(ortak.grup), ortak && ortak.grup);

    // seçmeli meslek dersleri: yalnız o alanın resmî listesi
    const R = w.SECMELI_RESMI;
    const resmiMeslek = ((R.mtal_meslek.muhasebe || {})["12"] || []).map(d => anahtar(d.ders)).sort();
    const listedeMeslek = amp.filter(d => d.isVocational).map(d => anahtar(d.ders)).sort();
    kontrol("seçmeli meslek dersleri tam olarak alanın resmî listesi (sızıntı yok)",
        JSON.stringify(listedeMeslek) === JSON.stringify(resmiMeslek), listedeMeslek.length + " / " + resmiMeslek.length);
    kontrol("Dış Ticaret Girişimciliği (muhasebe seçmeli meslek) listede", amp.some(d => /D[ıi][şs] Ticaret Giri/i.test(d.ders)));
}

/* ---- B2) MESEM şubesi: kendi listesi önde --------------------------------- */
{
    const mesem = ui.getAvailableElectivesForSection(bolum("mesem", "12", "muhasebe"));
    const adlar = mesem.map(d => anahtar(d.ders));
    kontrol("MESEM şubesi listesinde kopya yok", new Set(adlar).size === adlar.length);
    kontrol("MESEM şubesinde de Anadolu havuzunun Girişimcilik'i var", mesem.some(d => /^giri[şs]imcilik$/i.test(String(d.ders).replace(/İ/g, "i"))));
    const ilkMesemli = mesem.findIndex(d => d.havuzlar[0] === "MESEM");
    const ilkDigeri = mesem.findIndex(d => d.havuzlar[0] !== "MESEM");
    kontrol("MESEM şubesinde kendi programın dersleri önce gelir", ilkMesemli === -1 || ilkDigeri === -1 || ilkMesemli < ilkDigeri,
        ilkMesemli + " / " + ilkDigeri);
}

/* ---- B3) e-Okul'a göre eklenen ders ve ad düzeltmesi ---------------------- */
okulTuru("cok_programli_anadolu_lisesi");
{
    for (const sinif of ["9", "10", "11", "12"]) {
        const amp = ui.getAvailableElectivesForSection(bolum("amp", sinif, "muhasebe"));
        const ph = amp.filter(d => anahtar(d.ders) === anahtar("Proje Hazırlama"));
        kontrol(`AMP ${sinif}. sınıfta 'Proje Hazırlama' TEK satır`, ph.length === 1, String(ph.length));
        if (ph.length === 1) {
            kontrol(`AMP ${sinif}: Proje Hazırlama 1/2 saat ve varsayılan 2`, ph[0].hoursOptions.join() === "1,2" && ph[0].selectedHour === 2, ph[0].hoursOptions.join());
            kontrol(`AMP ${sinif}: Proje Hazırlama grubu İnsan, Toplum ve Bilim`, ph[0].grup === "İnsan, Toplum ve Bilim");
            kontrol(`AMP ${sinif}: Proje Hazırlama 'kendi havuzunda yok' + e-Okul etiketli`, ph[0].kendiHavuzdaYok === true && ph[0].havuzlar.join() === "e-Okul");
        }
    }
    const al = ui.getAvailableElectivesForSection(bolum("al", "11", null));
    const mesem = ui.getAvailableElectivesForSection(bolum("mesem", "11", "muhasebe"));
    kontrol("AL şubesine 'Proje Hazırlama' eklenmez (e-Okul AMP kataloğundan)", !al.some(d => anahtar(d.ders) === anahtar("Proje Hazırlama")));
    kontrol("MESEM şubesine 'Proje Hazırlama' eklenmez", !mesem.some(d => anahtar(d.ders) === anahtar("Proje Hazırlama")));

    // Blok Zinciri: AMP/MESEM bilişim; ad e-Okul'daki gibi ve TEK satır
    for (const [program, sinif] of [["amp", "11"], ["amp", "12"], ["mesem", "11"], ["mesem", "12"]]) {
        const l = ui.getAvailableElectivesForSection(bolum(program, sinif, "bilisim"));
        const bz = l.filter(d => /^blok zinci/i.test(d.ders));
        kontrol(`${program} ${sinif} bilişim: Blok Zinciri tek satır`, bz.length <= 1, bz.map(d => d.ders).join(" | "));
        kontrol(`${program} ${sinif} bilişim: adı 'Blok Zinciri' ('Blok Zincir' kalmadı)`, bz.every(d => d.ders === "Blok Zinciri"), bz.map(d => d.ders).join(" | "));
    }
    const bz12 = ui.getAvailableElectivesForSection(bolum("amp", "12", "bilisim")).find(d => d.ders === "Blok Zinciri");
    kontrol("AMP 12 bilişimde 'Blok Zinciri' var, AMP etiketli, 2 saat", bz12 && bz12.havuzlar.includes("AMP") && bz12.hoursOptions.includes(2));
    kontrol("eski ad kaydı tutulur (eskiAd)", bz12 && bz12.eskiAd === "Blok Zincir");

    // eski adla kayıtlı seçmeli uyarılmaz
    const u = ui.secmeliKuralUyarilari(bolum("amp", "12", "bilisim"), [{ ders: "Blok Zincir", saat: 2, isVocational: true }]);
    kontrol("eski adla ('Blok Zincir') kayıtlı seçmeli 'listede yok' uyarısı almaz", !u.some(x => x.tur === "liste"), JSON.stringify(u));
    const u2 = ui.secmeliKuralUyarilari(bolum("amp", "12", "muhasebe"), [{ ders: "Proje Hazırlama", saat: 2, isVocational: false }]);
    kontrol("Proje Hazırlama seçilince 'listede yok' uyarısı yok, bilgi notu var",
        !u2.some(x => x.tur === "liste") && u2.some(x => x.tur === "havuz"), JSON.stringify(u2));

    // MTAL (çok programlı değil): ad ve liste DEĞİŞMEDİ
    okulTuru("mesleki_ve_teknik_anadolu_lisesi");
    const m = ui.getAvailableElectivesForSection(bolum(undefined, "12", "bilisim"));
    kontrol("MTAL okulunda ad aynen 'Blok Zincir' kalır", m.some(d => d.ders === "Blok Zincir") && !m.some(d => d.ders === "Blok Zinciri"));
    kontrol("MTAL okuluna 'Proje Hazırlama' eklenmez", !m.some(d => anahtar(d.ders) === anahtar("Proje Hazırlama")));
    okulTuru("cok_programli_anadolu_lisesi");
}

/* ---- C) alanı olmayan AL şubesi ------------------------------------------ */
{
    const al = ui.getAvailableElectivesForSection(bolum("al", "11", null));
    kontrol("AL şubesinde seçmeli meslek dersi çıkmaz (alan yok)", !al.some(d => d.isVocational));
    kontrol("AL şubesinde Girişimcilik var ve kendi havuzunda", al.some(d => /^giri[şs]imcilik$/i.test(String(d.ders).replace(/İ/g, "i")) && d.kendiHavuzdaYok === false));
    kontrol("AL şubesinde AMP kültür tablosunun Ahilik dersi de çıkıyor (alandan bağımsız)", al.some(d => /^ahilik k/i.test(d.ders)));
    kontrol("AL şubesinde Ahilik 'kendi havuzunda yok' işaretli", al.some(d => /^ahilik k/i.test(d.ders) && d.kendiHavuzdaYok === true));
}

/* ---- D) diğer okul türleri değişmez ------------------------------------- */
for (const [tur, alan, sinif] of [
    ["anadolu_lisesi", null, "11"], ["anadolu_lisesi", null, "12"],
    ["mesleki_ve_teknik_anadolu_lisesi", "muhasebe", "12"], ["mesleki_ve_teknik_anadolu_lisesi", "bilisim", "11"],
    ["fen_lisesi", null, "11"]
]) {
    okulTuru(tur);
    const sb = bolum(undefined, sinif, alan);
    const a = ui.getAvailableElectivesForSection(sb);
    const b = ui.getAvailableElectivesForSection(sb, tur);
    kontrol(`${tur} ${alan || "-"} ${sinif}: liste turZorla ile aynı`, JSON.stringify(a) === JSON.stringify(b));
    kontrol(`${tur} ${alan || "-"} ${sinif}: satırlarda havuz etiketi yok`, !a.some(d => "havuzlar" in d || "kendiHavuzdaYok" in d));
}

/* ---- E) uyarılar ---------------------------------------------------------- */
okulTuru("cok_programli_anadolu_lisesi");
{
    const sb = bolum("amp", "12", "muhasebe");
    const sec = (ders, saat) => ({ ders, saat, isVocational: false });
    const u1 = ui.secmeliKuralUyarilari(sb, [sec("Girişimcilik", 2)]);
    // ders adı havuzda büyük harfle ("GİRİŞİMCİLİK") yazılı; mesaj dersi o yazımla anar, kaynağı da söyler
    kontrol("başka havuzdan seçilen ders bilgi notu üretir (AMP'de yok, AL'den geldiğini söyler)",
        u1.some(u => u.tur === "havuz" && /\(AMP\)/.test(u.mesaj) && /AL listesinden/.test(u.mesaj)), JSON.stringify(u1));
    kontrol("başka havuzdan seçilen ders 'listede yok' uyarısı ÜRETMEZ", !u1.some(u => u.tur === "liste"));
    kontrol("seçilen saat (2) Girişimcilik'in seçeneklerinde: saat uyarısı yok", !u1.some(u => u.tur === "saat"));

    const u2 = ui.secmeliKuralUyarilari(sb, [sec("Ahilik Kültürü ve Girişimcilik", 1)]);
    kontrol("kendi programın dersi için bilgi notu çıkmaz", !u2.some(u => u.tur === "havuz"));

    const u3 = ui.secmeliKuralUyarilari(sb, [sec("Uydurma Bir Ders", 2)]);
    kontrol("hiçbir havuzda olmayan ders yine uyarılır", u3.some(u => u.tur === "liste"));

    const u4 = ui.secmeliKuralUyarilari(sb, [sec("Girişimcilik", 5)]);
    kontrol("havuzda olmayan saat yine uyarılır", u4.some(u => u.tur === "saat"));

    const slAl = bolum("al", "11", null);
    const u5 = ui.secmeliKuralUyarilari(slAl, [sec("Girişimcilik", 1)]);
    kontrol("AL şubesinde kendi havuzunun dersi için bilgi notu yok", !u5.some(u => u.tur === "havuz") && !u5.some(u => u.tur === "liste"));
}

/* ---- E2) başka okul türünde uyarı davranışı değişmedi -------------------- */
okulTuru("mesleki_ve_teknik_anadolu_lisesi");
{
    const u = ui.secmeliKuralUyarilari(bolum(undefined, "12", "muhasebe"), [{ ders: "Girişimcilik", saat: 2, isVocational: false }]);
    kontrol("MTAL'de (çok programlı değil) Girişimcilik hâlâ 'listede yok' uyarısı alır", u.some(x => x.tur === "liste") && !u.some(x => x.tur === "havuz"));
}

/* ---- F) ekran kaynağı ---------------------------------------------------- */
{
    const ui_js = oku("js", "uiComponents.js");
    kontrol("satırda kaynak etiketi çiziliyor", /row-pool-tags/.test(ui_js) && /item\.havuzlar/.test(ui_js));
    kontrol("bilgi notu uyarıdan ayrı simgeyle çiziliyor", /u\.tur === "havuz" \? "ℹ️ " : "⚠️ "/.test(ui_js));
    kontrol("etiket stili tanımlı", /\.row-pool-tags\s*\{/.test(oku("css", "app.css")));
}

console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ ÇOK PROGRAMLI BİRLEŞİK SEÇMELİ HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ ÇOK PROGRAMLI BİRLEŞİK SEÇMELİ — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

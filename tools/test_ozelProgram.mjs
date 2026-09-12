/* ===========================================================================
   NormMatik™ — Özel Program Uygulayan Lise testi
   ===========================================================================
   NE DENETLER: Bu okullarda dersler bir TEMAYA bağlıdır. Test, seçilen temaya
   göre üretilen müfredatın resmî çizelgeyle sayısal olarak tutmasını arar.

   NEDEN VAR
   ---------
   1) Bu okulların 47 tematik dersi 28.08.2026'ya kadar uygulamada HİÇ YOKTU.
      Ortak dersler ve seçmeliler doğruydu, tematik yarı eksikti.

   2) Elde bulunan kaynak JSON'un tema ataması YANLIŞTI: tema adı, etiketin
      denk geldiği satırdan itibaren ileri kopyalanmıştı. "Havacılık ve Uzayın
      Temelleri" Yazılım temasına, laboratuvar dersleri Havacılık temasına
      yazılmıştı. Tema sınırları artık PDF'in kendi tablo çizgilerinden okunuyor.

   3) TEMATİK DERSLERİN HEPSİ ZORUNLU DEĞİL. Çizelgenin kendi kotası
      10/8/8/4/4'tür. Temel Bilimler temasında 11. sınıfta 16 ders / 32 saat
      vardır. Hepsini zorunlu saymak 41 saatlik şubeyi 69 saat gösterirdi —
      doğrudan norm şişmesi. İlk yazımda tam olarak bu oldu; bu test onu
      yakalamak için var.

   ASIL ÖLÇÜT: her tema ve her sınıf için
       zorunlu saat + tematik kotası (seçim varsa) + gelişim kotası == 45
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

/* İKİ TÜR DE DENETLENİR (12.09.2026).
   Sosyal Bilimler türü, çizelgesindeki "TASLAK" ibaresi yüzünden uzun süre
   dışarıda kalmıştı; tema seçimi yoktu ve ZORUNLU tematik alan dersleri
   (6/6/8/8/8 saat) hiçbir şubede görünmüyordu. Tür artık değişkenden gelir;
   dosya, ilk tür bitince kendini ikinci tür için yeniden çalıştırır. */
const TURLER = [
    "ozel_program_fen_lisesi",
    "ozel_program_sosyal_lisesi",
    "ozel_program_hazirlik_anadolu_lisesi",   // TTKB Sayı 104, 02/09/2026
];
const TUR = process.env.NM_OZEL_PROGRAM_TUR || TURLER[0];
const KAYNAK = path.join(KOK, "data", "kaynak_cizelgeler", "ogm", TUR + ".json");

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
    window: w, console: { log() {}, warn() {}, error() {} },
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
w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true };
w.dbService.masterData = JSON.parse(
    fs.readFileSync(path.join(KOK, "data", "meb_master_db.json"), "utf8"));
w.dbService.isLoaded = true;

const SINIFLAR = ["hazirlik", "9", "10", "11", "12"];

const T = w.OZEL_PROGRAM_TEMALARI ? w.OZEL_PROGRAM_TEMALARI[TUR] : null;
if (!T) olumcul("OZEL_PROGRAM_TEMALARI yüklenmedi (build_bundle EXPORTS_CODE?).");
if (!fs.existsSync(KAYNAK)) olumcul("kaynak JSON yok: " + KAYNAK);
const kaynak = JSON.parse(fs.readFileSync(KAYNAK, "utf8"));

const ce = w.curriculumEngine, st = w.appState;
const UI = vm.runInContext("UIComponentManager", ctx);
const ui = new UI(w.dbService, w.appState, w.normEngine, w.curriculumEngine);

/* ---- 0) Kaynak gerçekten okundu mu? -----------------------------------
   Bu bir BOŞLUK KORUMASIDIR: ayrıştırma sessizce boş dönerse test "hata
   yok" demesin. Eşik önce 40'tı; o sayı Fen Lisesi'ne (47 ders) göre
   yazılmıştı ve Sayı 104'ün 39 dersini geçersiz sayıyordu. Çizelgeye
   özgü sayılar aşağıdaki tema/kota denetimlerinde zaten karşılaştırılıyor. */
if ((kaynak.tematik_alan_dersleri || []).length < 20)
    olumcul("kaynakta yalnızca " + (kaynak.tematik_alan_dersleri || []).length + " tematik ders var.");

const asgari = (v) => (v.tip === "sabit" ? v.saat : Math.min(...v.secenekler));
const kota = {};
for (let i = 0; i < SINIFLAR.length; i++) {
    const v = kaynak.cizelge_toplamlari.tematik[i];
    if (v) kota[SINIFLAR[i]] = asgari(v);
}
const gelisimKota = {};
for (let i = 0; i < SINIFLAR.length; i++) {
    const v = kaynak.cizelge_toplamlari.gelisim[i];
    if (v) gelisimKota[SINIFLAR[i]] = asgari(v);
}
const cizelgeToplam = {};
for (let i = 0; i < SINIFLAR.length; i++) {
    const v = kaynak.cizelge_toplamlari.toplam[i];
    if (v) cizelgeToplam[SINIFLAR[i]] = asgari(v);
}

/* ---- 1) Tema listesi kaynakla aynı mı? -------------------------------- */
const kaynakTemalar = new Set(
    (kaynak.tematik_alan_dersleri || [])
        .map((d) => d.tema || "")
        .filter((t) => t && !t.includes("ORTAK TEMATİK")));
kontrol("tema sayısı kaynakla aynı", T.temalar.length === kaynakTemalar.size,
    "uygulama " + T.temalar.length + ", kaynak " + kaynakTemalar.size);
kontrol("tema listesi boş değil", T.temalar.length > 0);

// Bölünmüş tema adı kalıntısı olmamalı ("BİLİŞİM TEKNOLOJİLERİ VE" gibi).
for (const t of T.temalar) {
    kontrol("tema adı yarım değil: " + t.ad,
        !/\b(ve|VE|Ve)\s*$/.test(t.ad.trim()), t.ad);
}

/* ---- 1b) ÇİZELGE ÇAKIŞMASI — kaynaktan BAĞIMSIZ olarak bulunur -------- */
// Aynı ders hem ORTAK TEMATİK blokta hem bir temanın altında, birebir aynı
// satırla geçebiliyor (hazırlık: "Tümleşik Bilimler" 2 saat, hem ortakta hem
// Temel Bilimler'de). Aynı dersi bir şubeye iki kez yazmak o branşın yükünü
// iki katına çıkarırdı; üreteç temadaki kopyayı düşürüyor. Sonuç: o tema ve
// sınıf için çizelge kotasının ALTINDA kalınır.
//
// Bu eksiklik burada üretecin raporuna değil, KAYNAĞA bakılarak yeniden
// bulunuyor. Üretecin çıktısına güvenseydi, üreteç yanlış eleme yaptığında
// test de onunla birlikte yanılırdı.
const anahtar = (x) => String(x || "")
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i").toLowerCase()
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]/g, "");

const eksilme = {};   // tema.id -> sinif -> düşen saat
{
    const ortakAdlar = {};   // sinif -> Set
    for (const d of kaynak.tematik_alan_dersleri)
        if ((d.tema || "").includes("ORTAK TEMATİK"))
            for (const [sinif, v] of Object.entries(d.saatler || {}))
                (ortakAdlar[sinif] = ortakAdlar[sinif] || new Set()).add(anahtar(d.ders_adi));

    for (const d of kaynak.tematik_alan_dersleri) {
        const temaAd = d.tema || "";
        if (!temaAd || temaAd.includes("ORTAK TEMATİK")) continue;
        for (const [sinif, v] of Object.entries(d.saatler || {})) {
            if (!(ortakAdlar[sinif] || new Set()).has(anahtar(d.ders_adi))) continue;
            const tid = (T.temalar.find((t) => anahtar(t.ad) === anahtar(temaAd)) || {}).id;
            if (!tid) continue;
            eksilme[tid] = eksilme[tid] || {};
            eksilme[tid][sinif] = (eksilme[tid][sinif] || 0) + asgari(v);
        }
    }
}

/* ---- 2) ASIL ÖLÇÜT: saatler çizelgeyle tutuyor mu? -------------------- */
let karsilastirma = 0;
for (const tema of T.temalar) {
    for (const sinif of SINIFLAR) {
        const zorunlu = ce.getMandatoryCourses(TUR, sinif, tema.id, null) || [];
        kontrol(tema.ad + " / " + sinif + ": ders listesi dolu", zorunlu.length > 0);
        if (!zorunlu.length) continue;

        const zorunluSaat = zorunlu.reduce((a, c) => a + (parseInt(c.saat, 10) || 0), 0);
        const secilebilirVar = !!((T.secilebilir[tema.id] || {})[sinif] || []).length;
        // Seçim varsa tematik kota SEÇMELİDEN gelecek; yoksa zaten zorunluda.
        // Çizelge çakışması yüzünden düşen saat, beklenen toplamdan indirilir.
        const dusen = ((eksilme[tema.id] || {})[sinif] || 0);
        const beklenen = cizelgeToplam[sinif] - dusen;
        const toplam = zorunluSaat
            + (secilebilirVar ? (kota[sinif] || 0) : 0)
            + (gelisimKota[sinif] || 0);
        karsilastirma++;
        kontrol(tema.ad + " / " + sinif + ". sınıf toplam saat",
            toplam === beklenen,
            "hesaplanan " + toplam + ", beklenen " + beklenen
            + (dusen ? " (çizelge " + cizelgeToplam[sinif] + " − çakışan "
                + dusen + " saat)" : "")
            + "  (zorunlu " + zorunluSaat
            + (secilebilirVar ? " + tematik kota " + kota[sinif] : "")
            + " + gelişim " + gelisimKota[sinif] + ")");

        // Seçim YOKSA tematik dersler zorunluda olmalı; VARSA olmamalı.
        const tematikSayisi = zorunlu.filter(
            (c) => c.kategori === "TEMATİK ALAN DERSLERİ").length;
        if (secilebilirVar) {
            const temaninZorunlusu = ((T.dersler[tema.id] || {})[sinif] || []).length;
            kontrol(tema.ad + " / " + sinif + ": seçim varken tema dersi zorunluya girmemiş",
                temaninZorunlusu === 0,
                temaninZorunlusu + " ders zorunluya girmiş");
        } else {
            kontrol(tema.ad + " / " + sinif + ": seçim yokken tema dersi zorunluda",
                tematikSayisi > 0);
        }
    }
}
// Örneklem koruması, tema SAYISINA göre ölçülür: sabit 12 eşiği 3 temalı
// çizelgelere göreydi, Sayı 104'te 2 tema x 5 sınıf = 10 var ve hepsi
// karşılaştırılıyor. Beklenen: her tema için en az 4 sınıf.
if (karsilastirma < T.temalar.length * 4)
    olumcul("yalnızca " + karsilastirma + " tema-sınıf karşılaştırıldı ("
        + T.temalar.length + " tema).");

/* ---- 3) Tema seçilmemişse tema dersi GELMEMELİ ------------------------ */
for (const sinif of SINIFLAR) {
    const liste = ce.getMandatoryCourses(TUR, sinif, null, null) || [];
    kontrol("tema seçilmeden liste dolu (" + sinif + ")", liste.length > 0);
    const temaAdlari = new Set();
    for (const tema of T.temalar)
        for (const d of ((T.dersler[tema.id] || {})[sinif] || []))
            temaAdlari.add(d.ders);
    // ORTAK TEMATİK dersler tema seçilmeden de gelir; onlar sızıntı değildir.
    const ortakAd = new Set(((T.ortak || {})[sinif] || []).map((c) => c.ders));
    const sizan = liste.filter((c) => temaAdlari.has(c.ders) && !ortakAd.has(c.ders));
    kontrol("tema seçilmeden temaya özel ders sızmıyor (" + sinif + ")",
        sizan.length === 0, sizan.map((c) => c.ders).slice(0, 3).join(", "));
}

/* ---- 4) Seçilebilir tematik dersler DOĞRU temada görünüyor mu? -------- */
{
    let bakilan = 0;
    for (const tema of T.temalar) {
        for (const sinif of SINIFLAR) {
            const secilebilir = (T.secilebilir[tema.id] || {})[sinif] || [];
            if (!secilebilir.length) continue;
            st.state = st.getDefaultState();
            st.state.okulBilgisi.okulTuru = TUR;
            st.addSection({ subeAdi: sinif + "-A", sinifSeviyesi: sinif,
                ogrenciSayisi: 30, alanId: tema.id,
                zorunluDersler: ce.getMandatoryCourses(TUR, sinif, tema.id, null) });
            const sec = st.state.subeler[0];
            sec.alanId = tema.id;   // addSection alanı taşımazsa diye
            const sunulan = new Set(
                (ui.getAvailableElectivesForSection(sec) || []).map((c) => c.ders));
            bakilan++;
            const eksik = secilebilir.filter((d) => !sunulan.has(d.ders));
            kontrol(tema.ad + " / " + sinif + ": seçilebilir tematik dersler listede",
                eksik.length === 0, eksik.map((d) => d.ders).slice(0, 3).join(", "));

            // Başka temanın dersi görünmemeli.
            const yabanci = [];
            for (const digeri of T.temalar) {
                if (digeri.id === tema.id) continue;
                for (const d of ((T.secilebilir[digeri.id] || {})[sinif] || []))
                    if (sunulan.has(d.ders)
                        && !secilebilir.some((x) => x.ders === d.ders))
                        yabanci.push(digeri.ad + ": " + d.ders);
            }
            kontrol(tema.ad + " / " + sinif + ": başka temanın dersi sızmıyor",
                yabanci.length === 0, yabanci.slice(0, 3).join(", "));
        }
    }
    if (bakilan < 5) olumcul("yalnızca " + bakilan + " seçilebilir tema-sınıf denendi.");
}

/* ---- 5) Meslek lisesi mekanizması bozulmamış olmalı ------------------- */
// Bu okullar `alanId` alanını tema için kullanıyor. Motorda tema bloğu meslek
// dalından ÖNCE duruyor; yanlış sırada olsaydı meslek liseleri de tema
// tablosuna düşerdi. Aşağıdaki iki kontrol o sırayı korur.
kontrol("meslek lisesi alan listesi dolu",
    w.dbService.getVocationalAreas("mesleki_ve_teknik_anadolu_lisesi").length > 20);
{
    const l = ce.getMandatoryCourses("mesleki_ve_teknik_anadolu_lisesi", "11", "bilisim", null) || [];
    kontrol("meslek lisesi müfredatı hâlâ geliyor", l.length > 0, l.length + " ders");
}

/* ---- tema seçim kutusu açık mı? --------------------------------------- */
// Tema verisi doğru üretilse bile, okul türünde "hasAreas" bayrağı yoksa
// arayüzde seçim kutusu ÇIKMAZ ve tematik dersler hiçbir şubeye girmez.
// Sosyal Bilimler'de tam olarak bu olmuştu.
{
    const tur = (w.dbService.getSchoolTypes() || []).find((t) => t.id === TUR);
    kontrol("okul türü tanımlı", !!tur, TUR);
    if (tur) {
        kontrol("tema seçim kutusu açık (hasAreas)", tur.hasAreas === true);
        kontrol("seçim kutusunun başlığı tema diyor",
            /tema/i.test(tur.temaAdi || ""), tur.temaAdi || "(yok)");
    }
    const alanlar = w.dbService.getVocationalAreas(TUR) || [];
    kontrol("tema listesi seçim kutusuna geliyor",
        alanlar.length === T.temalar.length,
        alanlar.length + " / " + T.temalar.length);
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ ÖZEL PROGRAM LİSESİ (" + TUR + ") HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar.slice(0, 25)) console.log("   • " + h);
    if (hatalar.length > 25) console.log("   ... ve " + (hatalar.length - 25) + " tane daha");
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ ÖZEL PROGRAM LİSESİ (" + TUR + ") DOĞRU — " + gecen
    + " kontrol başarılı, 0 hata");

/* Sıradaki tür: aynı dosyayı yeniden çalıştır. Ayrı süreç, çünkü uygulama
   bağlamı (bundle) tür başına bir kez kuruluyor. */
{
    const sira = TURLER.indexOf(TUR);
    if (sira > -1 && sira + 1 < TURLER.length) {
        const { spawnSync } = await import("node:child_process");
        const s = spawnSync(process.execPath, [url.fileURLToPath(import.meta.url)], {
            stdio: "inherit",
            env: { ...process.env, NM_OZEL_PROGRAM_TUR: TURLER[sira + 1] },
        });
        if (s.status !== 0) process.exit(s.status || 1);
    }
}
console.log("=".repeat(70));

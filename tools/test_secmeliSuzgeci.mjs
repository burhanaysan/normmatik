/* ===========================================================================
   NormMatik™ — Seçmeli ders süzgeci testi
   ===========================================================================
   NE DENETLER: Bir şubeye seçmeli ders eklerken kullanıcıya sunulan liste,
   o okul türünün RESMÎ ÇİZELGESİNDEKİ seçmelilerle sınırlı mı?

   NEDEN VAR: Süzgeç ilk yazıldığında Anadolu Lisesi'nin 45 seçmelisinden
   yalnızca 9'u görünüyordu. Sebep veri değil, EŞLEŞTİRİCİYDİ: izin listesini
   üreten Python (uret_ortaogretim_mufredat.anahtar) Türkçe harfleri ASCII'ye
   indiriyor (ç->c), arayüzdeki karşılığı ise indirmiyordu. Aynı verinin iki
   yerde iki farklı kuralla işlenmesi bu projede tekrar eden hata sınıfı; üstelik
   sessiz — ekranda hata yok, sadece dersler eksik. Bu test o sessizliği kırar.

   ÖLÇÜM GEÇERLİLİĞİ: Bu dosya, ölçtüğü şeyin gerçekten ölçüldüğünü de
   doğrular (havuz boş değil, izin tablosu yüklü, listeler gerçekten dolu).
   Aksi hâlde "0 hata" sonucu, hiçbir şeyi denetlemediği için de çıkabilirdi.
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

let gecen = 0;
const hatalar = [];
function kontrol(ad, kosul, ayrinti) {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
}
function olumcul(mesaj) {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: " + mesaj);
    console.log("   (Test hiçbir şeyi denetlemedi; 'hata yok' sonucu anlamsız olurdu.)");
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

// loadDatabase() fetch kullanır; Node'da göreli adres çalışmaz ve masterData
// boş kalır. Boş kalırsa bütün seçmeli havuzları boşalır ve test körleşir.
w.dbService.masterData = JSON.parse(
    fs.readFileSync(path.join(KOK, "data", "meb_master_db.json"), "utf8"));
w.dbService.isLoaded = true;

const md = w.dbService.masterData.okul_turleri_ve_cizelgeler || {};
if (!Object.keys(md).length) olumcul("master DB boş yüklendi.");

const IZIN = w.ORTAOGRETIM_SECMELI_ANAHTARLARI;
if (!IZIN || !Object.keys(IZIN).length)
    olumcul("ORTAOGRETIM_SECMELI_ANAHTARLARI yüklenmedi (build_bundle EXPORTS_CODE?).");

const UI = vm.runInContext("UIComponentManager", ctx);
if (!UI) olumcul("UIComponentManager sınıfı bulunamadı.");
const ui = new UI(w.dbService, w.appState, w.normEngine, w.curriculumEngine);
if (typeof ui.getAvailableElectivesForSection !== "function")
    olumcul("getAvailableElectivesForSection işlevi yok.");

const st = w.appState, ce = w.curriculumEngine;

/* ---- üreteçle BİREBİR aynı anahtar ------------------------------------ */
const ah = (x) => String(x || "").replace(/\(.*?\)/g, " ")
    .replace(/[îÎ]/g, "i").replace(/[âÂ]/g, "a").replace(/[ûÛ]/g, "u")
    .replace(/['’‘]/g, "")
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i").toLowerCase()
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]/g, "");

/* 1) Anahtar kuralı üreteçle uyuşuyor mu?
      Bu, asıl hatanın tam olarak yakalandığı yer: üreteç ç->c yapıyor.
      Aşağıdaki beklentiler Python anahtar() işlevinin çıktısıdır. */
for (const [girdi, beklenen] of [
    ["SEÇMELİ MATEMATİK", "secmelimatematik"],
    ["Seçmeli Matematik", "secmelimatematik"],
    ["Coğrafya", "cografya"],
    ["Sağlık Bilgisi ve Trafik Kültürü", "saglikbilgisivetrafikkulturu"],
    ["Temel Dinî Bilgiler", "temeldinibilgiler"],
    ["Temel Dini Bilgiler", "temeldinibilgiler"],
    ["SEÇMELİ FİZİK (2)", "secmelifizik"],
    ["Bilgisayarlı Tasarım Uygulamaları ()", "bilgisayarlitasarimuygulamalari"],
    ["Işık ve Ses", "isikveses"],
]) kontrol("anahtar('" + girdi + "')", ah(girdi) === beklenen,
    "üretti '" + ah(girdi) + "', beklenen '" + beklenen + "'");

/* ---- her okul türü için sunulan listeyi topla ------------------------- */
function sunulanlar(tur) {
    const kume = new Set();
    let hicSinifCalisti = false;
    for (const sinif of ["hazirlik", "9", "10", "11", "12"]) {
        st.state = st.getDefaultState();
        st.state.okulBilgisi.okulTuru = tur;
        let zorunlu = [];
        try { zorunlu = ce.getMandatoryCourses(tur, sinif, null, null) || []; } catch (e) { continue; }
        if (!zorunlu.length) continue;
        try {
            st.addSection({ subeAdi: sinif + "-A", sinifSeviyesi: sinif,
                ogrenciSayisi: 30, zorunluDersler: zorunlu });
            const l = ui.getAvailableElectivesForSection(st.state.subeler[0]) || [];
            hicSinifCalisti = true;
            for (const c of l) kume.add(ah(c.ders));
        } catch (e) { /* o sınıf bu türde yok */ }
    }
    return { kume, hicSinifCalisti };
}

/* 2) Süzgeç, hak edilen HİÇBİR dersi gizlememeli.
      DOĞRU KARŞILAŞTIRMA "süzgeç açık" ile "süzgeç kapalı" arasındadır.
      İlk yazımda buradaki referans, ham master DB taramasıydı; ama arayüz
      DÖGM seçmelilerini `secmeli_dersler` altından okurken tarama
      `secmeli_ders_gruplari` altına bakıyordu. Sonuç: süzgecin hiç ilgisi
      olmayan bir ders "süzgeç gizledi" diye raporlandı. Ölçüm, ölçtüğünü
      sandığı şeyi ölçmüyordu. Artık referans uygulamanın kendi çıktısı. */
const suzgecTablosu = IZIN;
function suzgecsizSunulanlar(tur) {
    w.ORTAOGRETIM_SECMELI_ANAHTARLARI = null;
    try { return sunulanlar(tur).kume; }
    finally { w.ORTAOGRETIM_SECMELI_ANAHTARLARI = suzgecTablosu; }
}

let toplamSunulan = 0;
const imzalar = new Map();
for (const [tur, izin] of Object.entries(IZIN)) {
    const { kume, hicSinifCalisti } = sunulanlar(tur);
    kontrol(tur + ": en az bir sınıf çalıştı", hicSinifCalisti);
    kontrol(tur + ": liste boş değil", kume.size > 0);
    toplamSunulan += kume.size;
    imzalar.set(tur, [...kume].sort().join("|"));

    const suzgecsiz = suzgecsizSunulanlar(tur);
    kontrol(tur + ": süzgeçsiz liste de dolu (ölçüm geçerli)", suzgecsiz.size > 0);

    // Süzgeçsiz sunulan bir ders, izin listesindeyse süzgeçten sonra da
    // sunulmalı. Kaybolursa, kullanıcıdan hakkı olan dersi gizliyoruz.
    const izinKume = new Set(izin);
    const gizlenen = [...suzgecsiz].filter((k) => izinKume.has(k) && !kume.has(k));
    kontrol(tur + ": süzgeç hak edilen dersi gizlemiyor", gizlenen.length === 0,
        gizlenen.join(", "));

    // Süzgeç gerçekten daraltmalı; daraltmıyorsa yazım/eşleşme bozulmuştur.
    kontrol(tur + ": süzgeç etkili (liste daralıyor)", kume.size < suzgecsiz.size,
        "süzgeçli " + kume.size + " / süzgeçsiz " + suzgecsiz.size);

    // İlk hatanın imzası: eşleştirici bozulursa liste çöker. Kaynak
    // çizelgedeki seçmeli sayısının en az yarısı sunulmalı.
    kontrol(tur + ": liste çökmemiş (izin listesinin >=%50'si sunuluyor)",
        kume.size >= Math.floor(izin.length * 0.5),
        "sunulan " + kume.size + " / izin " + izin.length);
}
if (toplamSunulan === 0) olumcul("hiçbir okul türü için ders sunulmadı.");

/* 3) Listeler okul türüne göre gerçekten farklılaşmalı.
      Hepsi aynı çıkarsa süzgeç çalışmıyor demektir — süzgeçten önceki hâl. */
kontrol("listeler okul türüne göre farklılaşıyor",
    new Set(imzalar.values()).size > 1,
    "tüm türler aynı listeyi görüyor");

/* 4) İzin listesi OLMAYAN türler süzülmemeli (MTAL, MESEM, ortaokul).
      Bu türlerin seçmelisi alan/dal üzerinden geliyor; süzgeç uygulanırsa
      meslek dersleri kaybolur. Kural: whitelist yoksa dokunma. */
for (const tur of ["mesleki_ve_teknik_anadolu_lisesi", "ortaokul_temel_egitim"]) {
    kontrol(tur + ": izin listesi yok (süzülmemeli)", !IZIN[tur]);
    const { kume } = sunulanlar(tur);
    kontrol(tur + ": süzgeçsiz liste doluyor", kume.size > 0, kume.size + " ders");
}

/* 5) AİHL seçmeli havuzu, kaynak çizelgeye BİREBİR uymalı.
      NEDEN: Bu havuz 28.08.2026'ya kadar meb_master_db.json'dan okunuyordu ve
      dosyalar arasında ilk eşleşen kazandığı için AİHL'e BAŞKA OKULLARIN
      saatleri yazılıyordu — Astronomi 10. sınıf (1)(2), Osmanlı Türkçesi 2,
      Proje Tasarımı (2)(3)(4), Seçmeli Matematik 6; hepsi Anadolu Lisesi
      satırı. Ekranda hata görünmüyordu, yalnızca saat yanlıştı. */
{
    const kaynakYol = path.join(KOK, "data", "kaynak_cizelgeler", "dogm",
        "anadolu_imam_hatip_lisesi_ve_hazirlik.json");
    const kaynak = JSON.parse(fs.readFileSync(kaynakYol, "utf8"));
    const beklenen = {};   // sinif -> anahtar -> "1/2"
    let kaynakKayit = 0;
    for (const gv of Object.values(kaynak.secmeli_dersler || {}))
        for (const alt of (gv.alanlar || gv.programlar || []))
            for (const d of (alt.dersler || [])) {
                for (const [sinif, v] of Object.entries(d.saatler || {})) {
                    if (!v) continue;
                    const saatler = (v.tip === "sabit" ? [v.saat] : v.secenekler).join("/");
                    beklenen[sinif] = beklenen[sinif] || {};
                    // Aynı ders birden çok grupta geçebilir; arayüz ilk geçeni
                    // gösterdiği için ilk kaydı esas alıyoruz.
                    const k = ah(d.ders_adi);
                    if (!(k in beklenen[sinif])) beklenen[sinif][k] = saatler;
                    kaynakKayit++;
                }
            }
    if (kaynakKayit < 100) olumcul("AİHL kaynağından yalnızca " + kaynakKayit + " kayıt okundu.");

    let karsilastirilan = 0;
    for (const sinif of ["9", "10", "11", "12"]) {
        st.state = st.getDefaultState();
        st.state.okulBilgisi.okulTuru = "anadolu_imam_hatip_lisesi";
        st.addSection({ subeAdi: sinif + "-A", sinifSeviyesi: sinif, ogrenciSayisi: 30,
            zorunluDersler: ce.getMandatoryCourses("anadolu_imam_hatip_lisesi", sinif, null, null) });
        const sunulanListe = ui.getAvailableElectivesForSection(st.state.subeler[0]) || [];
        kontrol("AİHL " + sinif + ". sınıf listesi dolu", sunulanListe.length > 0);
        for (const c of sunulanListe) {
            const bek = (beklenen[sinif] || {})[ah(c.ders)];
            if (bek === undefined) continue;   // meslek/alan dersi olabilir
            karsilastirilan++;
            kontrol("AİHL " + sinif + ". sınıf saat: " + c.ders,
                (c.hoursOptions || []).join("/") === bek,
                "sunulan " + (c.hoursOptions || []).join("/") + ", çizelge " + bek);
        }
    }
    if (karsilastirilan < 100)
        olumcul("AİHL için yalnızca " + karsilastirilan + " ders karşılaştırıldı.");
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ SEÇMELİ SÜZGECİ HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ SEÇMELİ SÜZGECİ DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

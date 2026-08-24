/*
 * ŞUBE SINIRI TESTİ
 * =================
 * Hedef: js/bundle.js  (yani kullanıcının gerçekte çalıştırdığı kod)
 *
 * NEDEN VAR
 * ---------
 * 2026-08-24: Deneme sürümüyle 46 şube oluşturulabildiği bildirildi.
 * Sınır YALNIZCA tekli ekleme formunda kontrol ediliyordu; şube ekleyen
 * diğer beş yol sınırı hiç sormuyordu:
 *
 *     çoklu şube ekleme · e-Okul Excel aktarımı · şube kopyalama
 *     şube bölme · sınıf yükseltme
 *
 * O sırada `canAddSection()` fonksiyonu DOĞRU çalışıyordu — hata onu
 * çağırmayan yollardaydı. Bu yüzden bu test fonksiyonu değil, ŞUBE
 * SAYISINI sınar: hangi yoldan gidilirse gidilsin tavan aşılmamalı.
 *
 * Yeni bir şube ekleme yolu yazılırsa buraya da bir madde eklenmelidir.
 *
 * Çalıştırma: node tools/test_subeSiniri.mjs
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KOK = path.join(__dirname, "..");

let gecti = 0, kaldi = 0;
const hatalar = [];

function denetle(ad, kosul, ayrinti = "") {
    if (kosul) { gecti++; console.log("  [GEÇTİ] " + ad); }
    else { kaldi++; hatalar.push(ad + "   " + ayrinti);
           console.log("  [KALDI] " + ad + "   " + ayrinti); }
}

// --------------------------------------------------------------- ortam
function ortamKur() {
    const depo = new Map();
    const win = {};
    const ctx = {
        window: win, console: { log() {}, warn() {}, error() {} },
        localStorage: {
            getItem: k => depo.has(k) ? depo.get(k) : null,
            setItem: (k, v) => depo.set(k, String(v)),
            removeItem: k => depo.delete(k), clear: () => depo.clear()
        },
        sessionStorage: {
            getItem: () => null, setItem() {}, removeItem() {}, clear() {}
        },
        navigator: { userAgent: "node", language: "tr" },
        location: { href: "https://www.normmatik.com.tr/app.html" },
        screen: { width: 1920, height: 1080 },
        setTimeout, clearTimeout, setInterval, clearInterval,
        crypto: { getRandomValues: a => a },
        CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
        alert() {}
    };
    ctx.globalThis = ctx;
    win.dispatchEvent = () => true;
    win.addEventListener = () => {};
    vm.createContext(ctx);
    vm.runInContext(
        fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8")
            .replace(/^export /gm, ""), ctx);
    return { ctx, win };
}

/** Belirli haklara sahip taze bir state döndürür. */
function durumKur(maxSections, isMaster = false) {
    const { win } = ortamKur();
    win.licenseManager.licenseStatus = {
        isValid: true, isDemo: maxSections !== -1, isMaster,
        maxSections, allowExport: maxSections === -1,
        kurumKodu: "123456", okulAdi: "Test", licenseType: "TEST"
    };
    const st = win.appState;
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    st.state.subeler = [];
    return { st, win };
}

const n = st => (st.state.subeler || []).length;

console.log("ŞUBE SINIRI TESTİ");
console.log("=".repeat(70));

// ------------------------------------------------------- 1) tekli ekleme
console.log("\nDeneme sürümü — tavan 3 şube");
{
    const { st } = durumKur(3);
    for (let i = 0; i < 10; i++) st.addSection({ subeAdi: "9-" + i, sinifSeviyesi: "9" });
    denetle("S1  tekli ekleme 3'te duruyor", n(st) === 3, `${n(st)} şube oluştu`);
}

// ------------------------------------------------------ 2) çoklu ekleme
{
    const { st } = durumKur(3);
    st.addBulkSections("9", 20, 30, []);
    denetle("S2  çoklu ekleme 3'te duruyor", n(st) === 3, `${n(st)} şube oluştu`);
}

// -------------------------------------------- 3) çoklu ekleme, iki turda
{
    const { st } = durumKur(3);
    st.addBulkSections("9", 2, 30, []);
    st.addBulkSections("10", 15, 30, []);
    denetle("S3  ard arda çoklu ekleme 3'te duruyor", n(st) === 3, `${n(st)} şube oluştu`);
}

// -------------------------------------------------------- 4) kopyalama
{
    const { st } = durumKur(3);
    st.addSection({ subeAdi: "9-A", sinifSeviyesi: "9" });
    for (let i = 0; i < 10; i++) st.duplicateSection(st.state.subeler[0].id);
    denetle("S4  kopyalama 3'te duruyor", n(st) === 3, `${n(st)} şube oluştu`);
}

// ------------------------------------------------------------ 5) bölme
{
    const { st } = durumKur(3);
    st.addSection({ subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 60 });
    st.splitSection(st.state.subeler[0].id, {
        sourceStudents: 20,
        newSections: [
            { subeAdi: "9-B", ogrenciSayisi: 20 }, { subeAdi: "9-C", ogrenciSayisi: 20 },
            { subeAdi: "9-D", ogrenciSayisi: 20 }, { subeAdi: "9-E", ogrenciSayisi: 20 },
            { subeAdi: "9-F", ogrenciSayisi: 20 }
        ]
    });
    denetle("S5  şube bölme 3'te duruyor", n(st) === 3, `${n(st)} şube oluştu`);
}

// ------------------------------------------------- 6) e-Okul aktarımı
{
    const { st, win } = durumKur(3);
    const ice = new win.EOkulImporter(win.dbService, win.curriculumEngine);
    const sahte = [];
    for (let i = 0; i < 46; i++) {
        sahte.push({ subeAdi: "9-" + i, grade: "9", ogrenciSayisi: 30,
                     matchedAreaId: null, dalAdi: null });
    }
    ice.applySectionsToState(st, sahte, "anadolu_lisesi", true);
    denetle("S6  e-Okul aktarımı 3'te duruyor  <-- bildirilen hata",
            n(st) === 3, `${n(st)} şube oluştu`);
}

// --------------------------------- 7) karışık: her yoldan sırayla dene
{
    const { st, win } = durumKur(3);
    st.addSection({ subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 60 });
    st.addBulkSections("10", 10, 30, []);
    st.duplicateSection(st.state.subeler[0].id);
    st.splitSection(st.state.subeler[0].id, {
        sourceStudents: 20, newSections: [{ subeAdi: "9-Z", ogrenciSayisi: 20 }]
    });
    const ice = new win.EOkulImporter(win.dbService, win.curriculumEngine);
    ice.applySectionsToState(st, [{ subeAdi: "11-A", grade: "11", ogrenciSayisi: 30 }],
                             "anadolu_lisesi", false);
    denetle("S7  bütün yollar birlikte 3'ü aşmıyor", n(st) <= 3, `${n(st)} şube oluştu`);
}

// ------------------------------------------------- 8) LİSANSLI: sınırsız
console.log("\nLisanslı okul — sınır yok");
{
    const { st, win } = durumKur(-1);
    st.addBulkSections("9", 17, 30, []);
    st.addBulkSections("10", 17, 30, []);
    const ice = new win.EOkulImporter(win.dbService, win.curriculumEngine);
    const sahte = [];
    for (let i = 0; i < 46; i++) {
        sahte.push({ subeAdi: "11-" + i, grade: "11", ogrenciSayisi: 30 });
    }
    ice.applySectionsToState(st, sahte, "anadolu_lisesi", false);
    denetle("S8  lisanslı okulda 46+ şube eklenebiliyor", n(st) >= 46,
            `${n(st)} şube oluştu`);
}

// ------------------------------------------------ 9) YÖNETİCİ: sınırsız
{
    const { st } = durumKur(3, true);   // maxSections=3 ama isMaster
    st.addBulkSections("9", 20, 30, []);
    denetle("S9  yönetici hesabı sınıra takılmıyor", n(st) === 20,
            `${n(st)} şube oluştu`);
}

// ------------------------------------- 10) silince hak geri gelmeli
console.log("\nDavranış tutarlılığı");
{
    const { st } = durumKur(3);
    st.addBulkSections("9", 3, 30, []);
    st.deleteSection(st.state.subeler[0].id);
    st.addSection({ subeAdi: "9-Z", sinifSeviyesi: "9" });
    denetle("S10 şube silinince yeni şube eklenebiliyor", n(st) === 3,
            `${n(st)} şube oluştu`);
}

// ------------------------------------- 11) düzenleme sınıra takılmamalı
{
    const { st } = durumKur(3);
    st.addBulkSections("9", 3, 30, []);
    const id = st.state.subeler[1].id;
    st.updateSection(id, { ogrenciSayisi: 44 });
    const sec = st.state.subeler.find(s => s.id === id);
    denetle("S11 mevcut şube düzenlenebiliyor",
            n(st) === 3 && sec && sec.ogrenciSayisi === 44,
            `${n(st)} şube / mevcut ${sec && sec.ogrenciSayisi}`);
}

console.log("\n" + "=".repeat(70));
if (kaldi === 0) {
    console.log(`✅ ŞUBE SINIRI DOĞRU — ${gecti} kontrol başarılı, 0 hata`);
    process.exit(0);
} else {
    console.log(`❌ ${kaldi} HATA / ${gecti + kaldi} kontrol`);
    hatalar.forEach(h => console.log("   × " + h));
    process.exit(1);
}

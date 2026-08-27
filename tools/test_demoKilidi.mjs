/*
 * DEMO KİLİDİ TESTİ
 * =================
 * Demo sürümü ürünü denemek içindir; bir okulun norm çalışmasını ücretsiz
 * yapmak için değil. Demo okul 10 şubeyle açıldığından (vitrin amaçlı) kural
 * şudur:
 *
 *   • İlk 3 şube serbestçe düzenlenir
 *   • 4. şubeden sonrası kilitli — kilit işareti + lisans uyarısı
 *   • Seçmeli ders listesi demo boyunca salt okunur: görünür, ama eklenemez
 *     ve silinemez
 *
 * BU TESTİN ASIL İŞİ: kilidin VERİ KATMANINDA durduğunu doğrulamak.
 * Yalnızca düğmeyi gizlemek koruma değildir; veriyi değiştiren her yol aynı
 * kapıdan geçmelidir. Test bu yüzden arayüzü değil, doğrudan appState
 * işlevlerini çağırır.
 *
 * İkinci işi: kilidin FAZLA GENİŞ olmadığını doğrulamak. Lisanslı kullanıcı
 * hiçbir kısıtla karşılaşmamalı; ilk 3 şube demoda bile düzenlenebilmeli.
 *
 * Çalıştırma: node tools/test_demoKilidi.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const KAYNAK = fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8")
    .replace(/^export /gm, "");

let gecti = 0;
const hatalar = [];
function kontrol(ad, olan, beklenen) {
    if (olan === beklenen) { gecti++; return; }
    hatalar.push(`  ✗ ${ad}\n      beklenen: ${beklenen}   bulunan: ${olan}`);
}

function ortam(demoMu) {
    const w = {};
    const uyarilar = [];
    const ctx = {
        window: w, console: { log() {}, warn() {}, error() {} },
        localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
        sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
        navigator: { userAgent: "node" }, location: { href: "x" },
        screen: { width: 1920, height: 1080 },
        setTimeout, clearTimeout, setInterval, clearInterval,
        crypto: { getRandomValues: a => a },
        CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
        alert() {}
    };
    ctx.globalThis = ctx;
    w.addEventListener = () => {};
    w.dispatchEvent = (e) => {
        if (e && e.type === "normmatik:demo-kilit") uyarilar.push(e.detail && e.detail.mesaj);
        return true;
    };
    vm.createContext(ctx); vm.runInContext(KAYNAK, ctx);
    w.licenseManager.licenseStatus = demoMu
        ? { isValid: true, isMaster: false, isDemo: true, maxSections: 3, allowExport: false }
        : { isValid: true, isMaster: false, isDemo: false, maxSections: -1, allowExport: true };
    w.appState.loadDemoSchool(w.dbService, w.curriculumEngine);
    return { w, uyarilar };
}

console.log("DEMO KİLİDİ TESTİ");
console.log("=".repeat(70));

// ------------------------------------------------------------- geçerlilik
const { w: wd, uyarilar } = ortam(true);
const st = wd.appState;
const subeler = () => st.state.subeler || [];
console.log(`demo okul: ${subeler().length} şube`);
if (subeler().length < 5) {
    console.log("!! en az 5 şube gerekiyor — test hiçbir şeyi denetlemiyor.");
    process.exit(1);
}

const serbest = subeler()[0];       // 1. şube
const kilitli = subeler()[5];       // 6. şube

// --------------------------------------------------- 1. Kilit doğru yerde
console.log("\n── 1. Kilit ilk 3 şubeden sonra başlıyor");
kontrol("1. şube serbest", st.subeKilitliMi(subeler()[0].id), false);
kontrol("2. şube serbest", st.subeKilitliMi(subeler()[1].id), false);
kontrol("3. şube serbest", st.subeKilitliMi(subeler()[2].id), false);
kontrol("4. şube KİLİTLİ", st.subeKilitliMi(subeler()[3].id), true);
kontrol("6. şube KİLİTLİ", st.subeKilitliMi(subeler()[5].id), true);

// ------------------------------------------ 2. Serbest şube düzenlenebilir
console.log("── 2. İlk 3 şube gerçekten düzenlenebiliyor");
{
    const ders = (serbest.zorunluDersler || []).find(d => d.ders === "Biyoloji");
    st.updateCourseBranch(serbest.id, ders.ders, "Fizik");
    kontrol("serbest şubede branş değişti",
        (subeler()[0].zorunluDersler || []).find(d => d.ders === "Biyoloji").atananBrans,
        "Fizik");
    st.updateSectionDetails(serbest.id, { ogrenciSayisi: 28 });
    kontrol("serbest şubede öğrenci sayısı değişti", subeler()[0].ogrenciSayisi, 28);
}

// --------------------------------------------- 3. Kilitli şube korunuyor
console.log("── 3. Kilitli şube değiştirilemiyor");
{
    const oncekiUyari = uyarilar.length;
    const ders = (kilitli.zorunluDersler || []).find(d => d.ders === "Matematik");
    const oncekiBrans = ders.atananBrans;
    st.updateCourseBranch(kilitli.id, ders.ders, "Fizik");
    kontrol("kilitli şubede branş DEĞİŞMEDİ",
        (subeler()[5].zorunluDersler || []).find(d => d.ders === "Matematik").atananBrans,
        oncekiBrans);

    const oncekiOgrenci = kilitli.ogrenciSayisi;
    st.updateSectionDetails(kilitli.id, { ogrenciSayisi: 5 });
    kontrol("kilitli şubede öğrenci sayısı DEĞİŞMEDİ",
        subeler()[5].ogrenciSayisi, oncekiOgrenci);

    const oncekiSayi = subeler().length;
    st.deleteSection(kilitli.id);
    kontrol("kilitli şube SİLİNEMEDİ", subeler().length, oncekiSayi);

    st.duplicateSection(kilitli.id);
    kontrol("kilitli şube KOPYALANAMADI", subeler().length, oncekiSayi);

    kontrol("her reddediş kullanıcıya bildirildi",
        uyarilar.length > oncekiUyari, true);
    kontrol("uyarı metni lisanstan söz ediyor",
        /lisans/i.test(uyarilar[uyarilar.length - 1] || ""), true);
}

// ------------------------------------------- 4. Seçmeliler salt okunur
console.log("── 4. Seçmeli ders listesi demoda salt okunur");
{
    const once = (subeler()[0].secmeliDersler || []).length;
    kontrol("seçmeli listesi görünüyor (boş değil)", once > 0, true);

    st.addElectiveCourse(serbest.id, {
        ders: "Seçmeli Deneme", saat: 2, atananBrans: "Matematik",
        kategori: "SEÇMELİ DERSLER"
    });
    kontrol("seçmeli ders EKLENEMEDİ", (subeler()[0].secmeliDersler || []).length, once);

    st.removeElectiveCourse(serbest.id, (subeler()[0].secmeliDersler || [])[0].ders);
    kontrol("seçmeli ders SİLİNEMEDİ", (subeler()[0].secmeliDersler || []).length, once);

    kontrol("seçmeli kilidi ayrı bir mesaj veriyor",
        /seçmeli/i.test(uyarilar[uyarilar.length - 1] || ""), true);
}

// ------------------------------------- 5. Kilit lisanslı kullanıcıyı vurmuyor
console.log("── 5. Lisanslı kullanıcı hiçbir kısıtla karşılaşmıyor");
{
    const { w: wl } = ortam(false);
    const sl = wl.appState;
    const sb = () => sl.state.subeler || [];
    kontrol("lisanslıda hiçbir şube kilitli değil",
        sb().some(x => sl.subeKilitliMi(x.id)), false);
    kontrol("lisanslıda seçmeli değiştirilebilir",
        sl.secmeliDersDegistirilebilirMi(), true);

    const once = (sb()[5].secmeliDersler || []).length;
    sl.addElectiveCourse(sb()[5].id, {
        ders: "Seçmeli Deneme", saat: 2, atananBrans: "Matematik",
        kategori: "SEÇMELİ DERSLER"
    });
    kontrol("lisanslıda seçmeli eklendi", (sb()[5].secmeliDersler || []).length, once + 1);

    const oncekiSayi = sb().length;
    sl.deleteSection(sb()[5].id);
    kontrol("lisanslıda şube silinebildi", sb().length, oncekiSayi - 1);
}

console.log("\n" + "=".repeat(70));
if (!hatalar.length) {
    console.log(`✅ DEMO KİLİDİ DOĞRU — ${gecti} kontrol başarılı, 0 hata`);
} else {
    console.log(`❌ ${hatalar.length} HATA (${gecti} kontrol geçti)`);
    hatalar.forEach(h => console.log(h));
}
console.log("=".repeat(70));
process.exit(hatalar.length ? 1 : 0);

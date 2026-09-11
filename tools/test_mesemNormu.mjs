/* ===========================================================================
   NormMatik™ — MESEM norm hesabı (Norm Kadro Yön. Madde 22/2 ve 22/3)
   ===========================================================================
   NEDEN VAR (kullanıcı bildirimi, 10-11.09.2026)
   ---------------------------------------------
   Kullanıcı sanal okulunu MESEM yapıp 4 çıraklık tek bir dal seçti ve
   "norm hesapları bize uyuyor mu?" diye sordu. Mevzuat okunup motor
   ölçüldüğünde ÜÇ ayrı hata çıktı. Bu test üçünü de kilitler.

   MESEM, meslek lisesinden (MTAL) tamamen ayrı bir rejime tabidir:

   Md. 22/2  "Meslekî eğitim merkezi programında alan/dal derslerine ilişkin
              ders yükü hesaplanırken ŞUBELER GRUPLARA BÖLÜNMEZ ve bir şubedeki
              öğrenci sayısının birinci fıkranın (ç) bendinde belirtilen grup
              oluşturma sayısının ALTINDA olması durumunda işletmelerde meslek
              eğitimi dersi DIŞINDAKİ alan/dal dersleri ders yükü hesabına
              DÂHİL EDİLMEZ. İşletmelerde meslek eğitimi ders yükü hesaplanırken
              meslek ALANINDAKİ tüm sınıf seviyelerinde kayıtlı toplam çırak
              sayısı; 10-41 çırağa kadar 1 ... 441 ve daha fazla çırak için 12
              olacak şekilde gruplandırılır. İşletmelerde meslek eğitimi ders
              yükü ÇERÇEVE ÖĞRETİM PROGRAMINDA YER ALAN işletmelerde meslek
              eğitimi ders saati ile grup sayısının çarpımı sonucu bulunur."

   Md. 22/3  "Meslekî eğitim merkezi programında alanın toplam ders yükü,
              işletmelerde meslek eğitimi ders yüküne meslek alanında okutulan
              haftalık alan/dal ders saatleri EKLENEREK bulunur."

   BULUNAN ÜÇ HATA
     1) Çifte sayım. Çizelgedeki 32 saatlik işletme dersi hem düz alan/dal
        yükü olarak sayılıyor hem baremden ekleniyordu. Her şubede +32 saat,
        yaklaşık +1 norm. Kök neden: rebuild_mesem_db.py kategoriyi
        "ALAN VE DAL MESLEK DERSLERİ"ne katlıyor, Md. 22/3'ün dayandığı ayrım
        siliniyordu.
     2) Eşik kuralı (Md. 22/2, ikinci cümle) hiç uygulanmamıştı.
     3) Çırak grubu BRANŞ bazında hesaplanıyordu; mevzuat ALAN diyor. 38
        MESEM alanının 3'ü branş paylaşıyor, sonuç iki yöne birden sapıyordu.

   Çalıştırma:  node tools/test_mesemNormu.mjs
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
const olumcul = (m) => { console.log("\n!! OLCUM GECERSIZ: " + m); process.exit(1); };

/* ---- Kum havuzu ------------------------------------------------------ */
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
w.dispatchEvent = () => true; w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8"), ctx);
w.dbService.masterData = JSON.parse(
    fs.readFileSync(path.join(KOK, "data", "meb_master_db.json"), "utf8"));
w.dbService.isLoaded = true;
w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true };

const ce = w.curriculumEngine, ne = w.normEngine;
const TUR = "mesleki_egitim_merkezi";

if (typeof ne.mesemIsletmeDersiMi !== "function") olumcul("mesemIsletmeDersiMi yok.");
if (typeof ne.mesemDersHaricMi !== "function") olumcul("mesemDersHaricMi yok.");
if (typeof ne.calculateMesemApprenticeGroups !== "function") olumcul("barem fonksiyonu yok.");

function sube(id, alanId, ogrenci, sinif) {
    const dersler = ce.getMandatoryCourses(TUR, String(sinif), alanId, null) || [];
    if (!dersler.length) olumcul(`cizelge bos: ${alanId}/${sinif}`);
    return {
        id, subeAdi: sinif + "-" + id, sinifSeviyesi: String(sinif),
        ogrenciSayisi: ogrenci, alanId, dalAdi: null,
        zorunluDersler: dersler.map(d => ({
            ders: d.ders, saat: d.saat, kategori: d.kategori,
            atananBrans: d.atananBrans, baraj_ders: !!d.baraj_ders, isAtolye: !!d.isAtolye
        })),
        secmeliDersler: [], rehberlikVarMi: true
    };
}
const hesapla = (subeler) => ne.calculateSchoolNorms(subeler, {}, TUR, {});
const brans = (r, ad) => (r.branchReport || []).find(b => String(b.branchName || "").includes(ad));

const ALAN = "ayakkabi_ve_saraciye_teknolojisi";
const BRANS = "Ayakkabı ve Saraciye";

/* =======================================================================
   1) ÇIRAK BAREMİ — Md. 22/2 cetveli birebir
   ==================================================================== */
for (const [cirak, grup] of [
    [0, 0], [9, 0],                       // 10'un altında grup yok
    [10, 1], [40, 1],                     // 10-41'e kadar 1
    [41, 2], [80, 2],                     // 41-81'e kadar 2
    [81, 3], [120, 3],                    // 81-121'e kadar 3
    [121, 4], [161, 5], [201, 6], [241, 7],
    [281, 8], [321, 9], [361, 10], [401, 11],
    [441, 12], [5000, 12],                // 441 ve fazlası 12 (tavan)
]) {
    kontrol(`barem: ${cirak} çırak -> ${grup} grup`,
        ne.calculateMesemApprenticeGroups(cirak) === grup,
        String(ne.calculateMesemApprenticeGroups(cirak)));
}

/* =======================================================================
   2) ÇİFTE SAYIM YOK — işletme saati yalnızca baremden gelir
   ==================================================================== */
{
    // Çizelge: 3 ortak ders (2'şer) + Mesleğe Giriş 2 + İşletme 32 = 40 saat.
    // 10 çırak -> 1 grup -> 32 saat işletme yükü.
    // Alan yükü = 2 (Mesleğe Giriş) + 32 (barem) = 34.  66 OLMAMALI.
    const r = hesapla([sube("a", ALAN, 10, "9")]);
    const b = brans(r, BRANS);
    kontrol("10 çırak: alan branşı raporda var", !!b);
    if (b) {
        kontrol("10 çırak -> alan yükü 34 saat (çifte sayım yok)",
            b.totalHours === 34, "yük: " + b.totalHours + " (66 ise işletme iki kez sayılıyor)");
        kontrol("10 çırak -> 1 norm", b.calculatedNorm === 1, String(b.calculatedNorm));
    }
    kontrol("10 çırak: koordinatörlük eki 32 saat",
        r.yukMutabakati.koordinatorlukEki === 32, String(r.yukMutabakati.koordinatorlukEki));

    const r2 = hesapla([sube("a", ALAN, 81, "9")]);
    const b2 = brans(r2, BRANS);
    kontrol("81 çırak -> alan yükü 98 saat", b2 && b2.totalHours === 98,
        b2 ? String(b2.totalHours) : "-");
    kontrol("81 çırak -> 3 norm", b2 && b2.calculatedNorm === 3, b2 ? String(b2.calculatedNorm) : "-");
}

/* =======================================================================
   3) EŞİK KURALI — Md. 22/2 ikinci cümle
   ==================================================================== */
{
    // Kullanıcının durumu: 4 çırak. Hem barem (4<10 -> 0 grup) hem eşik
    // (4 < 9. sınıf eşiği 10) devrede. Alan yükü 0, norm 0 olmalı.
    const r = hesapla([sube("a", ALAN, 4, "9")]);
    const b = brans(r, BRANS);
    kontrol("4 çırak: alan branşı için norm doğmaz", !b || b.calculatedNorm === 0,
        b ? `yük ${b.totalHours}, norm ${b.calculatedNorm}` : "branş yok (doğru)");
    kontrol("4 çırak: okul yükü yalnızca ortak dersler (6 saat)",
        r.totalHours === 6, String(r.totalHours));
    kontrol("4 çırak: elenen saat 34", r.yukMutabakati.mesemHaricSaati === 34,
        String(r.yukMutabakati.mesemHaricSaati));

    // Eşik SINIFA GÖRE değişir: 9. sınıf 10, 10-12. sınıf 8.
    kontrol("9. sınıf eşiği 10", ne.mesemGrupOlusturmaEsigi("9") === 10);
    kontrol("10. sınıf eşiği 8", ne.mesemGrupOlusturmaEsigi("10") === 8);
    kontrol("12. sınıf eşiği 8", ne.mesemGrupOlusturmaEsigi("12") === 8);

    // 9 çırak 9. sınıfta ELENIR, ama 10. sınıfta (eşik 8) ELENMEZ.
    const dokuzuncu = hesapla([sube("a", ALAN, 9, "9")]);
    kontrol("9 çırak / 9. sınıf: alan/dal dersleri elenir",
        dokuzuncu.yukMutabakati.mesemHaricSaati === 34,
        String(dokuzuncu.yukMutabakati.mesemHaricSaati));
    const onuncu = hesapla([sube("a", ALAN, 9, "10")]);
    kontrol("9 çırak / 10. sınıf: alan/dal dersleri ELENMEZ (eşik 8)",
        onuncu.yukMutabakati.mesemHaricSaati < 34,
        "elenen: " + onuncu.yukMutabakati.mesemHaricSaati);

    // Ortak dersler eşikten ETKİLENMEZ; her hâlükârda sayılır.
    kontrol("eşik altında bile ortak dersler sayılır", r.totalHours === 6, String(r.totalHours));
}

/* =======================================================================
   4) ÇIRAK GRUBU **ALAN** BAZINDA — branş bazında DEĞİL
   ==================================================================== */
{
    // Bilişim Teknolojileri ve Siber Güvenlik AYRI alanlardır ama aynı branşa
    // atanır. Md. 22/2 "meslek ALANINDAKİ" dediği için ayrı gruplanmalıdır.
    const A = "bilisim_teknolojileri", B = "siber_guvenlik";
    const r1 = hesapla([sube("a", A, 20, "9"), sube("b", B, 20, "9")]);
    kontrol("20+20 (iki ayrı alan) -> 1+1 grup = 64 saat",
        r1.yukMutabakati.koordinatorlukEki === 64,
        String(r1.yukMutabakati.koordinatorlukEki) + " (32 ise branş bazında toplanıyor)");

    const r2 = hesapla([sube("a", A, 5, "9"), sube("b", B, 5, "9")]);
    kontrol("5+5 (ikisi de eşik altı) -> 0 saat",
        r2.yukMutabakati.koordinatorlukEki === 0,
        String(r2.yukMutabakati.koordinatorlukEki) + " (32 ise 5+5=10 sayılıyor)");

    // Aynı alanın TÜM SINIF SEVİYELERİ toplanır (Md. 22/2).
    const r3 = hesapla([
        sube("a", A, 10, "9"), sube("b", A, 10, "10"),
        sube("c", A, 10, "11"), sube("d", A, 10, "12"),
    ]);
    kontrol("tek alan / 4 sınıf x 10 = 40 çırak -> 1 grup = 32 saat",
        r3.yukMutabakati.koordinatorlukEki === 32,
        String(r3.yukMutabakati.koordinatorlukEki));
}

/* =======================================================================
   5) ÖLÇÜT KATEGORİ — ADINDA "İŞLETME" GEÇEN BAŞKA DERSLER ELENMEZ
   ==================================================================== */
{
    // 861 çizelgede adında "İşletme" geçen 5 ders var ve bunlar işletme dersi
    // DEĞİL. Ada bakan bir eşleşme onları da siler, okulun yükünü düşürürdü.
    const sahte = { ders: "Girişimcilik ve İşletme Yönetimi", saat: 1,
                    kategori: "ALAN VE DAL MESLEK DERSLERİ" };
    const gercek = { ders: "İşletmelerde Mesleki Eğitim", saat: 32,
                     kategori: "İŞLETMELERDE MESLEKİ EĞİTİM" };
    kontrol("gerçek işletme dersi tanınır", ne.mesemIsletmeDersiMi(gercek) === true);
    kontrol('"Girişimcilik ve İşletme Yönetimi" işletme dersi SAYILMAZ',
        ne.mesemIsletmeDersiMi(sahte) === false);
    for (const ad of ["Doğal Gaz Altyapım ve İşletme", "Ev ve Süs Hayvanları İşletmeciliği",
                      "Su Ürünlerinin İşletmeye Kabulü", "Ingot-Wafer İşletme ve Bakım"]) {
        kontrol(`"${ad}" işletme dersi SAYILMAZ`,
            ne.mesemIsletmeDersiMi({ ders: ad, saat: 2,
                kategori: "ALAN VE DAL MESLEK DERSLERİ" }) === false);
    }
}

/* =======================================================================
   6) SAAT ÇİZELGEDEN OKUNUR — koda sabit yazılmaz
   ==================================================================== */
{
    // Çizelgedeki işletme saati 32 yerine 20 olsaydı yük de 20 olmalıydı.
    const s = sube("a", ALAN, 10, "9");
    s.zorunluDersler = s.zorunluDersler.map(d =>
        String(d.kategori) === "İŞLETMELERDE MESLEKİ EĞİTİM" ? { ...d, saat: 20 } : d);
    const r = hesapla([s]);
    kontrol("çizelgede 20 saat ise işletme yükü 20 (sabit 32 değil)",
        r.yukMutabakati.koordinatorlukEki === 20,
        String(r.yukMutabakati.koordinatorlukEki));
}

/* =======================================================================
   7) MUTABAKAT HER SENARYODA TUTAR
   ==================================================================== */
for (const [ad, subeler] of [
    ["4 çırak", [sube("a", ALAN, 4, "9")]],
    ["10 çırak", [sube("a", ALAN, 10, "9")]],
    ["81 çırak", [sube("a", ALAN, 81, "9")]],
    ["iki alan", [sube("a", "bilisim_teknolojileri", 20, "9"),
                  sube("b", "siber_guvenlik", 20, "9")]],
    ["dört sınıf", [sube("a", ALAN, 12, "9"), sube("b", ALAN, 12, "10"),
                    sube("c", ALAN, 12, "11"), sube("d", ALAN, 12, "12")]],
]) {
    const r = hesapla(subeler);
    kontrol(`mutabakat tutuyor: ${ad}`, r.yukMutabakati.tutarli === true,
        JSON.stringify(r.yukMutabakati));
}

/* =======================================================================
   8) MTAL REJİMİ BOZULMADI — MESEM kuralları oraya sızmamalı
   ==================================================================== */
{
    const MTAL = "mesleki_ve_teknik_anadolu_lisesi";
    const d = ce.getMandatoryCourses(MTAL, "10", "bilisim", "Yazılım Geliştirme") || [];
    if (d.length) {
        const s = {
            id: "m", subeAdi: "10-A", sinifSeviyesi: "10", ogrenciSayisi: 4,
            alanId: "bilisim", dalAdi: "Yazılım Geliştirme",
            zorunluDersler: d.map(x => ({
                ders: x.ders, saat: x.saat, kategori: x.kategori,
                atananBrans: x.atananBrans, isAtolye: !!x.isAtolye })),
            secmeliDersler: [], rehberlikVarMi: true
        };
        const r = ne.calculateSchoolNorms([s], {}, MTAL, {});
        kontrol("MTAL'de Md. 22/2 eleme kuralı UYGULANMAZ",
            (r.yukMutabakati.mesemHaricSaati || 0) === 0,
            "elenen: " + r.yukMutabakati.mesemHaricSaati);
        kontrol("MTAL'de 4 öğrencilik şube yine de yük üretir",
            r.totalHours > 0, String(r.totalHours));
    }
}

/* ---- SONUÇ ----------------------------------------------------------- */
if (hatalar.length) {
    console.log(`\n${hatalar.length} KONTROL BASARISIZ (${gecen} gecti)\n`);
    hatalar.forEach((h) => console.log("   - " + h));
    process.exit(1);
}
console.log(`\nMESEM normu: ${gecen} kontrolun tamami gecti.`);
console.log("   Md. 22/2 baremi, esik kurali, alan bazli gruplama ve");
console.log("   cifte sayim korumasi yerinde.");

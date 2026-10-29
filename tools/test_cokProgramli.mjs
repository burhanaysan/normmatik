/* ===========================================================================
   NormMatik — ÇOK PROGRAMLI OKUL (29.10.2026)
   Tek kurum kodu altında birden çok program: Çok Programlı Anadolu Lisesi
   (AL + AMP + MESEM) ve bünyesinde MESEM bulunan Mesleki ve Teknik Anadolu
   Lisesi (AMP + MESEM).

   NEDEN VAR
   ---------
   Okul türü kayıt başına TEK değerdi; ders listesi, hedef saat, grup bölünmesi
   ve MESEM çırak baremi okul türüne bakar. Karma okullar doğru hesaplanamıyordu.
   Meslek lisesinde çalışan bir müdür yardımcısının yöntemi (MEBBİS): AMP'yi kendi
   kurallarıyla, MESEM'i kendi kurallarıyla (müstakil MESEM imiş gibi) AYRI hesaplar,
   branş saatlerini toplayıp MEBBİS'e girer. Uygulama aynısını yapar: şubenin
   `program` alanı hangi kuralların geçerli olduğunu söyler (bkz. js/programlar.js).

   Bu test şunları KALICI korur:
     1) Program yardımcısı: etkin tür, karma mı, aynı program mı.
     2) Tek programlı çok programlı okul, kendi programının MÜSTAKİL okuluyla
        BİREBİR aynı sonucu verir (AMP=MTAL, MESEM=MESEM, AL=Anadolu).
     3) Karma okulun branş yükü, programların branş bazında TOPLAMIDIR
        (arkadaşın "35 + 30 = 65" örneğinin aynısı) ve yük mutabakatı tutar.
     4) KARIŞMAMA: MESEM çırak baremi yalnız MESEM şubelerinin çırağını sayar;
        farklı programların şubeleri derste birleşmez; birleşik bağ yok sayılır.
     5) Okul genelinde TEK kez yazılacak kalemler (şeflik, yönetici ders düşümü)
        programlar arasında İKİ KEZ sayılmaz.
     6) MEVCUT KAYITLAR değişmez: `program` alanı olmayan şubede ve karma olmayan
        okul türünde hiçbir şey farklı çalışmaz.

   Testler YAYIMLANAN paketi (js/bundle.js) çalıştırır; kaynak düzenlendikten
   sonra `python tools/build_bundle.py` çalışmadan sonuç yanıltıcıdır.

   ÇALIŞTIRMA: node tools/test_cokProgramli.mjs   (çıkış kodu 0 = geçti)
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
    if (w.dbService) w.dbService.isLoaded = true;
    if (w.licenseManager) w.licenseManager.licenseStatus = Object.assign({}, w.licenseManager.licenseStatus,
        { isValid: true, licenseType: "TEST", isMaster: true, isDemo: false, maxSections: -1, allowExport: true });
    return w;
}

const w = await paketYukle();
const ce = w.curriculumEngine, ne = w.normEngine, db = w.dbService, P = w.PROGRAMLAR;

const CPL = "cok_programli_anadolu_lisesi";
const MTAL = "mesleki_ve_teknik_anadolu_lisesi";
const MESEM = "mesleki_egitim_merkezi";
const AL = "anadolu_lisesi";

// ---------------------------------------------------------------- 1) PROGRAM YARDIMCISI
kontrol("PROGRAMLAR pakete girdi", !!P);
kontrol("etkinOkulTuru kısayolu pakete girdi", typeof w.etkinOkulTuru === "function");
if (!P) { console.log("PROGRAMLAR yok; kalan kontroller atlandı."); process.exit(1); }

kontrol("ÇPAL + al -> anadolu_lisesi", P.etkinTur({ program: "al" }, CPL) === AL);
kontrol("ÇPAL + amp -> mesleki_ve_teknik_anadolu_lisesi", P.etkinTur({ program: "amp" }, CPL) === MTAL);
kontrol("ÇPAL + mesem -> mesleki_egitim_merkezi", P.etkinTur({ program: "mesem" }, CPL) === MESEM);
kontrol("ÇPAL + programsız şube -> varsayılan AL", P.etkinTur({}, CPL) === AL);
kontrol("ÇPAL + bilinmeyen program -> AL (sessiz MESEM olmaz)", P.etkinTur({ program: "xyz" }, CPL) === AL);
kontrol("MTAL + mesem -> MESEM", P.etkinTur({ program: "mesem" }, MTAL) === MESEM);
kontrol("MTAL + amp -> MTAL", P.etkinTur({ program: "amp" }, MTAL) === MTAL);
kontrol("MTAL + programsız -> MTAL (eski kayıt)", P.etkinTur({}, MTAL) === MTAL);
// Karma olmayan okul türünde `program` ASLA okunmaz
for (const t of [AL, MESEM, "fen_lisesi", "anadolu_teknik_programi", "ortaokul_temel_egitim", "spor_ortaokulu"]) {
    kontrol(`${t}: şubede program yazsa bile okul türü değişmez`, P.etkinTur({ program: "mesem" }, t) === t);
}

kontrol("programSecilebilir: ÇPAL", P.programSecilebilir(CPL, {}) === true);
kontrol("programSecilebilir: MTAL işaretsiz", P.programSecilebilir(MTAL, {}) === false);
kontrol("programSecilebilir: MTAL + bünyesinde MESEM", P.programSecilebilir(MTAL, { adminOptions: { mesemBunyesinde: true } }) === true);
kontrol("programSecilebilir: MESEM", P.programSecilebilir(MESEM, {}) === false);
kontrol("programSecilebilir: Anadolu", P.programSecilebilir(AL, {}) === false);
kontrol("programlar(ÇPAL) = al, amp, mesem", JSON.stringify(P.programlar(CPL)) === '["al","amp","mesem"]');
kontrol("programlar(MTAL) = amp, mesem", JSON.stringify(P.programlar(MTAL)) === '["amp","mesem"]');

kontrol("karmaMi: ÇPAL her zaman", P.karmaMi([], CPL) === true);
kontrol("karmaMi: MTAL programsız şubeler -> hayır", P.karmaMi([{}, {}], MTAL) === false);
kontrol("karmaMi: MTAL + MESEM şubesi -> evet", P.karmaMi([{}, { program: "mesem" }], MTAL) === true);
kontrol("karmaMi: MESEM okulu -> hayır", P.karmaMi([{ program: "mesem" }], MESEM) === false);

kontrol("ayniProgramMi: aynı", P.ayniProgramMi({ program: "amp" }, { program: "amp" }) === true);
kontrol("ayniProgramMi: AMP-MESEM farklı", P.ayniProgramMi({ program: "amp" }, { program: "mesem" }) === false);
kontrol("ayniProgramMi: AL-AMP farklı", P.ayniProgramMi({ program: "al" }, { program: "amp" }) === false);
kontrol("ayniProgramMi: programsız-MESEM farklı", P.ayniProgramMi({}, { program: "mesem" }) === false);
kontrol("ayniProgramMi: iki programsız şube HER ZAMAN aynı (eski kayıt)", P.ayniProgramMi({}, {}) === true);
kontrol("ayniProgramMi: programsız-AMP uyumlu", P.ayniProgramMi({}, { program: "amp" }) === true);

// ---------------------------------------------------------------- 2) OKUL TÜRÜ KAYDI
const tur = db.getSchoolTypes().find(t => t.id === CPL);
kontrol("okul türü listesinde 'Çok Programlı Anadolu Lisesi' var", !!tur && tur.name === "Çok Programlı Anadolu Lisesi");
kontrol("çok programlı tür alan/dal seçer (hasAreas)", !!(tur && tur.hasAreas));
kontrol("çok programlı tür hazırlık + 9-12 sınıf kademeleri", !!tur && JSON.stringify(tur.gradeLevels) === '["hazirlik","9","10","11","12"]');
kontrol("MESEM alan listesi AMP listesinden ayrı geliyor",
    db.getVocationalAreas(MESEM).length > 0 && db.getVocationalAreas(MESEM).length !== db.getVocationalAreas(MTAL).length);

// ---------------------------------------------------------------- yardımcılar
// Bir şubenin dersleri, şubenin ETKİN türünün çizelgesinden gelir (arayüzle aynı akış).
const sube = (okulTuru, program, id, alanId, ogrenci, sinif, ekle = {}) => {
    const tur = P.etkinTur({ program }, okulTuru);
    const dersler = ce.getMandatoryCourses(tur, String(sinif), alanId, null) || [];
    const s = {
        id, subeAdi: sinif + "-" + id, sinifSeviyesi: String(sinif), ogrenciSayisi: ogrenci, alanId, dalAdi: null,
        zorunluDersler: dersler.map(d => ({ ders: d.ders, saat: d.saat, kategori: d.kategori, atananBrans: d.atananBrans,
            baraj_ders: !!d.baraj_ders, isAtolye: !!d.isAtolye })),
        secmeliDersler: [], rehberlikVarMi: true
    };
    if (program) s.program = program;
    return Object.assign(s, ekle);
};
const SINIFLAR = ["9", "10", "11", "12"];
const hesapla = (subeler, tur, koor = {}, mevcut = {}) => ne.calculateSchoolNorms(subeler, mevcut, tur, koor);
const ozet = (r) => Object.fromEntries(r.branchReport.map(b => [b.branchName, b.totalHours]));
const bransSatiri = (r, ad) => (r.branchReport || []).find(b => b.branchName === ad);
const ALAN = "denizcilik";          // hem AMP hem MESEM alan listesinde var
const DENIZ = "Denizcilik";

// ---------------------------------------------------------------- 3) TEK PROGRAM == MÜSTAKİL OKUL
const ampSub = SINIFLAR.map(s => sube(CPL, "amp", "a" + s, ALAN, 24, s));
const mesSub = SINIFLAR.map(s => sube(CPL, "mesem", "m" + s, ALAN, 60, s));
const alSub = SINIFLAR.map(s => sube(CPL, "al", "l" + s, null, 30, s));
const mtalOz = hesapla(SINIFLAR.map(s => sube(MTAL, null, "a" + s, ALAN, 24, s)), MTAL);
const mesemOz = hesapla(SINIFLAR.map(s => sube(MESEM, null, "m" + s, ALAN, 60, s)), MESEM);
const alOz = hesapla(SINIFLAR.map(s => sube(AL, null, "l" + s, null, 30, s)), AL);

const rA = hesapla(ampSub, CPL), rM = hesapla(mesSub, CPL), rL = hesapla(alSub, CPL);
kontrol("ÇPAL(yalnız AMP) branş yükleri == müstakil MTAL", JSON.stringify(ozet(rA)) === JSON.stringify(ozet(mtalOz)));
kontrol("ÇPAL(yalnız MESEM) branş yükleri == müstakil MESEM", JSON.stringify(ozet(rM)) === JSON.stringify(ozet(mesemOz)));
kontrol("ÇPAL(yalnız AL) branş yükleri == müstakil Anadolu", JSON.stringify(ozet(rL)) === JSON.stringify(ozet(alOz)));
kontrol("ÇPAL(yalnız AMP) toplam yük == MTAL", rA.totalHours === mtalOz.totalHours, `${rA.totalHours} / ${mtalOz.totalHours}`);
kontrol("ÇPAL(yalnız MESEM) toplam yük == MESEM", rM.totalHours === mesemOz.totalHours, `${rM.totalHours} / ${mesemOz.totalHours}`);
kontrol("ÇPAL(yalnız AMP) norm sayıları == MTAL",
    JSON.stringify(rA.branchReport.map(b => [b.branchName, b.calculatedNorm])) === JSON.stringify(mtalOz.branchReport.map(b => [b.branchName, b.calculatedNorm])));
kontrol("ÇPAL(yalnız MESEM) işletme yükü (koordinatörlük) == MESEM", rM.yukMutabakati.koordinatorlukEki === mesemOz.yukMutabakati.koordinatorlukEki
    && rM.yukMutabakati.koordinatorlukEki > 0, `${rM.yukMutabakati.koordinatorlukEki} / ${mesemOz.yukMutabakati.koordinatorlukEki}`);
kontrol("ÇPAL(yalnız MESEM) Md. 22/2 elenen saatler == MESEM", rM.yukMutabakati.mesemHaricSaati === mesemOz.yukMutabakati.mesemHaricSaati
    && rM.yukMutabakati.mesemHaricSaati > 0);

// ---------------------------------------------------------------- 4) KARMA = TOPLAM (35 + 30 = 65)
const rK = hesapla([...ampSub, ...mesSub, ...alSub], CPL);
const oA = ozet(mtalOz), oM = ozet(mesemOz), oL = ozet(alOz), oK = ozet(rK);
let toplamFark = [];
for (const b of new Set([...Object.keys(oA), ...Object.keys(oM), ...Object.keys(oL), ...Object.keys(oK)])) {
    const beklenen = (oA[b] || 0) + (oM[b] || 0) + (oL[b] || 0);
    if ((oK[b] || 0) !== beklenen) toplamFark.push(`${b}: karma ${oK[b]} ≠ AMP ${oA[b] || 0} + MESEM ${oM[b] || 0} + AL ${oL[b] || 0}`);
}
kontrol("KARMA: her branşın yükü = AMP + MESEM + AL toplamı", toplamFark.length === 0, toplamFark.join(" | "));
kontrol("KARMA: Denizcilik branşı hem AMP hem MESEM'den yük alıyor (ortak branş toplanıyor)",
    (oA[DENIZ] || 0) > 0 && (oM[DENIZ] || 0) > 0 && oK[DENIZ] === oA[DENIZ] + oM[DENIZ], `${oA[DENIZ]} + ${oM[DENIZ]} = ${oK[DENIZ]}`);
kontrol("KARMA: toplam ders yükü = üç programın toplamı", rK.totalHours === mtalOz.totalHours + mesemOz.totalHours + alOz.totalHours);
kontrol("KARMA: yük mutabakatı tutuyor", rK.yukMutabakati.tutarli === true, JSON.stringify(rK.yukMutabakati));
kontrol("KARMA: ders satırları hangi programdan geldiğini taşıyor",
    (bransSatiri(rK, DENIZ).courses || []).some(c => c.program === MESEM) && (bransSatiri(rK, DENIZ).courses || []).some(c => c.program === MTAL));

// Aynı sonuç MTAL + bünyesinde MESEM okulunda (okul türü MTAL, şubede program)
const mtalKarmaSub = [
    ...SINIFLAR.map(s => sube(MTAL, "amp", "a" + s, ALAN, 24, s)),
    ...SINIFLAR.map(s => sube(MTAL, "mesem", "m" + s, ALAN, 60, s))
];
const rMK = hesapla(mtalKarmaSub, MTAL);
const oMK = ozet(rMK);
let mtalFark = [];
for (const b of new Set([...Object.keys(oA), ...Object.keys(oM), ...Object.keys(oMK)])) {
    if ((oMK[b] || 0) !== (oA[b] || 0) + (oM[b] || 0)) mtalFark.push(b);
}
kontrol("MTAL + MESEM bünyesi: branş yükü = AMP + MESEM toplamı", mtalFark.length === 0, mtalFark.join(", "));
kontrol("MTAL + MESEM bünyesi: yük mutabakatı tutuyor", rMK.yukMutabakati.tutarli === true);

// ---------------------------------------------------------------- 5) KARIŞMAMA
// MESEM baremi YALNIZ MESEM şubelerinin çırağını sayar. AMP'de çok öğrenci, MESEM'de az çırak:
// karışırsa MESEM grup sayısı şişer ve toplam artar.
{
    const amp = SINIFLAR.map(s => sube(CPL, "amp", "a" + s, ALAN, 40, s));      // 160 AMP öğrencisi
    const mes = SINIFLAR.map(s => sube(CPL, "mesem", "m" + s, ALAN, 3, s));    // 12 çırak -> 1 grup
    const rKar = hesapla([...amp, ...mes], CPL);
    const rAmp = hesapla(SINIFLAR.map(s => sube(MTAL, null, "a" + s, ALAN, 40, s)), MTAL);
    const rMes = hesapla(SINIFLAR.map(s => sube(MESEM, null, "m" + s, ALAN, 3, s)), MESEM);
    const beklenen = (ozet(rAmp)[DENIZ] || 0) + (ozet(rMes)[DENIZ] || 0);
    kontrol("MESEM baremi AMP öğrencilerini saymaz (160 AMP + 12 çırak)", ozet(rKar)[DENIZ] === beklenen,
        `${ozet(rKar)[DENIZ]} ≠ ${beklenen}`);
    kontrol("MESEM işletme yükü yalnız 12 çırağa göre (1 grup)", rKar.yukMutabakati.koordinatorlukEki === rMes.yukMutabakati.koordinatorlukEki,
        `${rKar.yukMutabakati.koordinatorlukEki} ≠ ${rMes.yukMutabakati.koordinatorlukEki}`);
}

// Farklı programların şubeleri birleşmez: AMP ve AL şubesindeki aynı ders çapraz bağlansa bile yük aynı kalır.
{
    const a = sube(CPL, "amp", "ax", ALAN, 20, "10");
    const l = sube(CPL, "al", "lx", null, 20, "10");
    const ortakDers = a.zorunluDersler.find(d => /matematik/i.test(d.ders)) || a.zorunluDersler[0];
    const dersAd = ortakDers.ders;
    const bagsiz = hesapla([a, l], CPL);
    const a2 = JSON.parse(JSON.stringify(a)), l2 = JSON.parse(JSON.stringify(l));
    a2.zorunluDersler.find(d => d.ders === dersAd).birlesikSubeler = ["lx"];
    const lD = l2.zorunluDersler.find(d => d.ders === dersAd);
    if (lD) lD.birlesikSubeler = ["ax"];
    const bagli = hesapla([a2, l2], CPL);
    kontrol("AMP ve AL şubesi aynı dersi çapraz bağlasa da BİRLEŞMEZ (yük değişmez)",
        bagli.totalHours === bagsiz.totalHours && bagli.yukMutabakati.birlesikSubeDusumu === 0,
        `${bagli.totalHours} / ${bagsiz.totalHours}, düşüm ${bagli.yukMutabakati.birlesikSubeDusumu}`);

    // MESEM ile AMP: aynı sınama
    const m = sube(CPL, "mesem", "mx", ALAN, 20, "10");
    const a3 = JSON.parse(JSON.stringify(a));
    const ortakAdlar = a3.zorunluDersler.map(d => d.ders).filter(ad => m.zorunluDersler.some(x => x.ders === ad));
    const oAd = ortakAdlar[0];
    if (oAd) {
        const m2 = JSON.parse(JSON.stringify(m));
        a3.zorunluDersler.find(d => d.ders === oAd).birlesikSubeler = ["mx"];
        m2.zorunluDersler.find(d => d.ders === oAd).birlesikSubeler = ["ax"];
        const bag = hesapla([a3, m2], CPL), bagsiz2 = hesapla([a, m], CPL);
        kontrol("AMP ve MESEM şubesi aynı dersi çapraz bağlasa da BİRLEŞMEZ", bag.totalHours === bagsiz2.totalHours
            && bag.yukMutabakati.birlesikSubeDusumu === 0, `${bag.totalHours} / ${bagsiz2.totalHours}`);
    } else {
        kontrol("AMP ve MESEM çizelgelerinde ortak ders adı bulundu (çapraz bağ denemesi için)", false);
    }

    // AYNI programdaki iki şube HÂLÂ birleşebilir (özellik bozulmadı)
    const l1 = sube(CPL, "al", "l1", null, 15, "10"), l3 = sube(CPL, "al", "l3", null, 15, "10");
    const dAd = l1.zorunluDersler.find(d => /matematik/i.test(d.ders)).ders;
    const l1b = JSON.parse(JSON.stringify(l1)), l3b = JSON.parse(JSON.stringify(l3));
    l1b.zorunluDersler.find(d => d.ders === dAd).birlesikSubeler = ["l3"];
    l3b.zorunluDersler.find(d => d.ders === dAd).birlesikSubeler = ["l1"];
    const ayriAl = hesapla([l1, l3], CPL), birAl = hesapla([l1b, l3b], CPL);
    kontrol("AYNI programdaki (AL-AL) şubeler birleşebilir: yük düşer", birAl.yukMutabakati.birlesikSubeDusumu > 0
        && birAl.totalHours < ayriAl.totalHours, `${birAl.totalHours} / ${ayriAl.totalHours}`);
}

// Durum katmanı: farklı programların şubesinde birleştirme REDDEDİLİR, aynı programda olur
{
    const AppState = w.appState && w.appState.constructor;
    const st = w.appState;
    if (st) {
        const a = sube(CPL, "amp", "s_a", ALAN, 20, "10"), m = sube(CPL, "mesem", "s_m", ALAN, 20, "10");
        const ortakAd = a.zorunluDersler.map(d => d.ders).find(ad => m.zorunluDersler.some(x => x.ders === ad));
        st.state.subeler = [a, m];
        st.toggleCourseMerge("s_a", ortakAd, "s_m");
        const bagVar = [...a.zorunluDersler, ...m.zorunluDersler].some(d => (d.birlesikSubeler || []).length);
        kontrol("durum katmanı: AMP-MESEM birleştirme REDDEDİLİR", !bagVar && !!ortakAd);
        const l1 = sube(CPL, "al", "s_l1", null, 20, "10"), l2 = sube(CPL, "al", "s_l2", null, 20, "10");
        st.state.subeler = [l1, l2];
        st.toggleCourseMerge("s_l1", l1.zorunluDersler[0].ders, "s_l2");
        kontrol("durum katmanı: AL-AL birleştirme çalışır", (l1.zorunluDersler[0].birlesikSubeler || []).includes("s_l2"));
        st.state.subeler = [];
    } else {
        kontrol("appState pakette", false);
    }
}

// ---------------------------------------------------------------- 6) OKUL GENELİ KALEMLER İKİ KEZ SAYILMAZ
{
    const koor = { adminOptions: { yoneticiDersYukleri: { [DENIZ]: 6 }, atolyeSefleri: { [DENIZ]: 1 } } };
    const karma = hesapla([...ampSub, ...mesSub], CPL, koor);
    const amp = hesapla(SINIFLAR.map(s => sube(MTAL, null, "a" + s, ALAN, 24, s)), MTAL, koor);
    const mes = hesapla(SINIFLAR.map(s => sube(MESEM, null, "m" + s, ALAN, 60, s)), MESEM, koor);
    const kr = bransSatiri(karma, DENIZ), ar = bransSatiri(amp, DENIZ), mr = bransSatiri(mes, DENIZ);
    kontrol("yönetici ders düşümü bir kez: karma 6 saat düşer (12 değil)", kr.adminDeductedHours === 6, String(kr.adminDeductedHours));
    // Beklenen: şeflik/yönetici girilmemiş müstakil toplamlar (oA, oM) + atölye şefi BİR kez (6) − yönetici (6).
    // (Müstakil MESEM hesabı kendi atölye şefini de saydığı için koor'lu müstakillerin toplamı kullanılamaz.)
    kontrol("karma yük = AMP + MESEM + atölye şefi (bir kez) − yönetici saati",
        kr.totalHours === (oA[DENIZ] + oM[DENIZ]) + 6 - 6, `${kr.totalHours} / ${oA[DENIZ] + oM[DENIZ]}`);
    kontrol("şeflik bir kez: karma Denizcilik şeflik saati = AMP okulundaki (alan 10 + atölye 6)", kr.seflikHours === ar.seflikHours && ar.seflikHours === 16,
        `${kr.seflikHours} / ${ar.seflikHours}`);
    kontrol("MESEM bölümü ayrıca şeflik EKLEMEZ (karma < iki müstakilin toplamı)", kr.seflikHours < ar.seflikHours + mr.seflikHours);
    kontrol("karma + yönetici + şeflik: mutabakat tutuyor", karma.yukMutabakati.tutarli === true, JSON.stringify(karma.yukMutabakati));
}

// AL + MESEM (AMP yok): şeflik yine bir kez ve alan şefi yok (MESEM'de alan şefliği oluşturulmaz)
{
    const koor = { adminOptions: { atolyeSefleri: { [DENIZ]: 1 } } };
    const r = hesapla([...alSub, ...mesSub], CPL, koor);
    const satir = bransSatiri(r, DENIZ);
    kontrol("AL + MESEM okulunda yalnız atölye şefi (6 saat) yazılır, alan şefi yok", satir.seflikHours === 6, String(satir.seflikHours));
}

// ---------------------------------------------------------------- 7) AÇIK ALANLAR (ekran/rapor ile motor aynı)
{
    const mesAlan = "ayakkabi_ve_saraciye_teknolojisi";
    const karma = [...ampSub, ...SINIFLAR.map(s => sube(CPL, "mesem", "n" + s, mesAlan, 30, s))];
    const acik = ne.acikAlanlar(karma, CPL).map(a => a.ad);
    kontrol("acikAlanlar: karma okulda MESEM alanı alan şefliği doğurmaz", acik.length === 1, JSON.stringify(acik));
    const yalnizMesem = ne.acikAlanlar(SINIFLAR.map(s => sube(MESEM, null, "n" + s, mesAlan, 30, s)), MESEM);
    kontrol("acikAlanlar: müstakil MESEM'de davranış eskisi gibi (alan listelenir)", yalnizMesem.length === 1);
}

// ---------------------------------------------------------------- 8) ŞUBE DÜZEYİ DERS / HEDEF SAAT
{
    const alDers = ce.getMandatoryCourses(P.etkinTur({ program: "al" }, CPL), "9", null, null) || [];
    kontrol("AL şubesi 9. sınıf: Anadolu çizelgesi geliyor", alDers.length === 13 && alDers.reduce((a, c) => a + (parseInt(c.saat, 10) || 0), 0) === 33);
    kontrol("AL şubesi hedef ders saati 40 (programsız AMP'deki gibi null değil)",
        db.getOfficialTargetHours(P.etkinTur({ program: "al" }, CPL), "9", null, null) === 40);
    const mesDers = ce.getMandatoryCourses(P.etkinTur({ program: "mesem" }, CPL), "9", ALAN, null) || [];
    kontrol("MESEM şubesi 9. sınıf (alan seçili): MESEM çizelgesi geliyor", mesDers.length > 0);
    const ampDers = ce.getMandatoryCourses(P.etkinTur({ program: "amp" }, CPL), "9", ALAN, null) || [];
    kontrol("AMP şubesi 9. sınıf (alan seçili): AMP çizelgesi geliyor", ampDers.length > 0);
    kontrol("AMP ve MESEM çizelgeleri birbirinden farklı", JSON.stringify(ampDers.map(d => d.ders)) !== JSON.stringify(mesDers.map(d => d.ders)));
    kontrol("AMP şubesi hedef saatı çizelgeden okunuyor",
        (db.getOfficialTargetHours(P.etkinTur({ program: "amp" }, CPL), "9", ALAN, null) || 0) > 0);
}

// ---------------------------------------------------------------- 9) MEVCUT KAYITLAR DEĞİŞMEZ
{
    // Eski kayıt: şubede `program` yok. Karma yol açılmaz, ders satırlarına program damgası vurulmaz.
    const eski = SINIFLAR.map(s => sube(MTAL, null, "e" + s, ALAN, 24, s));
    kontrol("eski MTAL kaydı karma yola girmez", P.karmaMi(eski, MTAL) === false);
    const r = hesapla(eski, MTAL);
    const programDamgali = r.branchReport.some(b => (b.courses || []).some(c => "program" in c));
    kontrol("eski MTAL kaydında ders satırlarında 'program' alanı YOK", !programDamgali);
    const eskiMesem = SINIFLAR.map(s => sube(MESEM, null, "e" + s, ALAN, 40, s));
    const rm = hesapla(eskiMesem, MESEM);
    kontrol("eski MESEM kaydı karma yola girmez ve damgasızdır",
        P.karmaMi(eskiMesem, MESEM) === false && !rm.branchReport.some(b => (b.courses || []).some(c => "program" in c)));
    const eskiAl = SINIFLAR.map(s => sube(AL, null, "e" + s, null, 30, s));
    kontrol("eski Anadolu kaydı karma yola girmez", P.karmaMi(eskiAl, AL) === false);
    kontrol("eski kayıtta şube hedef saati ve ders listesi eskisi gibi",
        db.getOfficialTargetHours(w.etkinOkulTuru({}, MTAL), "9", ALAN, null) === db.getOfficialTargetHours(MTAL, "9", ALAN, null));
}

// ---------------------------------------------------------------- 10) ŞUBE EKLEME: program yalnız karma okulda yazılır
{
    const st = w.appState;
    if (st) {
        st.state.subeler = [];
        const e = st.addSection({ subeAdi: "10-A", sinifSeviyesi: "10", ogrenciSayisi: 20, alanId: ALAN, zorunluDersler: [] });
        kontrol("programsız ekleme: şubede 'program' alanı OLUŞMAZ (eski kayıtla aynı biçim)", e && !("program" in e));
        const k = st.addSection({ subeAdi: "10-B", sinifSeviyesi: "10", ogrenciSayisi: 20, alanId: ALAN, zorunluDersler: [], program: "mesem" });
        kontrol("program verilirse şubeye yazılır", k && k.program === "mesem");
        st.setAdminOptions({ mesemBunyesinde: true });
        kontrol("'bünyesinde MESEM' işareti adminOptions içinde saklanır (bulut kuralı yeni üst alan kabul etmez)",
            st.state.okulBilgisi.adminOptions.mesemBunyesinde === true);
        st.state.subeler = [];
        st.state.okulBilgisi.adminOptions = {};
    }
}

// ---------------------------------------------------------------- 10b) E-OKUL AKTARIMI (karma okulda program varsayımı)
{
    const st = w.appState;
    const imp = new w.EOkulImporter(db, ce);
    const sahte = () => ([
        { subeAdi: "9-A", grade: "9", studentCount: 30, matchedAreaId: null, matchedAreaName: null, dalAdi: null, isSpecialEdu: false },
        { subeAdi: "9-B", grade: "9", studentCount: 24, matchedAreaId: "denizcilik", matchedAreaName: "Denizcilik", dalAdi: null, isSpecialEdu: false }
    ]);
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = CPL;
    imp.applySectionsToState(st, sahte(), CPL, true);
    const [a, b] = st.state.subeler;
    kontrol("e-Okul/ÇPAL: alansız şube AL olarak varsayılır", a && a.program === "al" && !a.alanId);
    kontrol("e-Okul/ÇPAL: alanı eşleşen şube AMP olarak varsayılır ve AMP çizelgesini alır",
        b && b.program === "amp" && b.alanId === "denizcilik" && b.zorunluDersler.length > 0);
    kontrol("e-Okul/ÇPAL: kullanıcıya 'MESEM ise programı değiştirin' uyarısı veriliyor",
        !!(a && /MESEM/.test(a.eOkulWarning || "")) && !!(b && /MESEM/.test(b.eOkulWarning || "")));
    kontrol("e-Okul/ÇPAL: AL şubesi Anadolu çizelgesini aldı (13 ders)", a && a.zorunluDersler.length === 13);

    // Karma olmayan okulda aktarım ESKİSİ GİBİ: şubede program alanı oluşmaz, uyarı eklenmez
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = MTAL;
    imp.applySectionsToState(st, sahte(), MTAL, true);
    kontrol("e-Okul/MTAL (işaretsiz): şubede 'program' alanı YOK (eski kayıtla aynı biçim)", st.state.subeler.every(x => !("program" in x)));
    kontrol("e-Okul/MTAL (işaretsiz): MESEM uyarısı eklenmez", st.state.subeler.every(x => !/MESEM/.test(x.eOkulWarning || "")));
    st.state = st.getDefaultState();
}

// ---------------------------------------------------------------- 10c) E-OKUL SATIR EKİ ("AL -", "AMP -") ve OTİSTİK yazımı
{
    const imp = new w.EOkulImporter(db, ce);
    const st = w.appState;
    const satirlar = [
        ["Sınıf/Şube (Alan)", "Erkek", "Kız", "Sınıf Toplamı"],
        ["AL - 9. Sınıf / A Şubesi (ALANI YOK)", 10, 20, 30],
        ["AMP - 9. Sınıf / A Şubesi (MUHASEBE VE FİNANSMAN ALANI)", 12, 13, 25],
        ["AMP -  9. Sınıf-Otistik Hafif / A Şubesi (HAFİF OTİSTİK ENGELLİLER)", 2, 1, 3],
        ["SINIF GENELİNDE TOPLAM:", 24, 34, 58],
        ["TOPLAMLAR :", 24, 34, 58]
    ];
    const r = imp.processRawRows(satirlar);
    kontrol("e-Okul: satır başındaki program eki okunuyor (AL / AMP / AMP)",
        JSON.stringify(r.sections.map(x => x.programOnEki)) === '["AL","AMP","AMP"]', JSON.stringify(r.sections.map(x => x.programOnEki)));
    const oe = r.sections.find(x => x.isSpecialEdu);
    kontrol("e-Okul: 'Otistik Hafif' satırı hafif OTİZM sayılıyor (hafif zihinsel DEĞİL)", !!oe && oe.engelTuru === "hafif_otizm", oe && oe.engelTuru);
    kontrol("normEngine: 'OTİSTİK' orta/ağır → otizm_orta_agir, hafif → hafif_otizm",
        ne.ozelEgitimTuruMetindenBul("ORTA OTİSTİK") === "otizm_orta_agir" && ne.ozelEgitimTuruMetindenBul("HAFİF OTİSTİK ENGELLİLER") === "hafif_otizm");
    kontrol("normEngine: eski yazımlar değişmedi (OTİZM, hafif zihinsel)",
        ne.ozelEgitimTuruMetindenBul("HAFİF OTİZM") === "hafif_otizm" && ne.ozelEgitimTuruMetindenBul("HAFİF ZİHİNSEL") === "hafif_zihinsel");

    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = CPL;
    imp.applySectionsToState(st, r.sections, CPL, true);
    const [al, amp, ozel] = st.state.subeler;
    kontrol("e-Okul/ÇPAL: 'AL -' eki AL programı", al && al.program === "al");
    kontrol("e-Okul/ÇPAL: 'AMP -' eki AMP programı", amp && amp.program === "amp");
    kontrol("e-Okul/ÇPAL: 'AMP -' ekli özel eğitim şubesi AMP programında", ozel && ozel.program === "amp" && ozel.isSpecialEdu && ozel.engelTuru === "hafif_otizm");
    kontrol("e-Okul/ÇPAL: program ekten geldiyse 'varsayıldı' uyarısı verilmez", al && !/varsayıldı/.test(al.eOkulWarning || "") && amp && !/varsayıldı/.test(amp.eOkulWarning || ""));
    // Karma olmayan okulda ek yok sayılır; `program` oluşmaz
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = MTAL;
    imp.applySectionsToState(st, imp.processRawRows(satirlar).sections, MTAL, true);
    kontrol("e-Okul/MTAL (işaretsiz): satır eki şubeye 'program' yazmaz", st.state.subeler.every(x => !("program" in x)));
    st.state = st.getDefaultState();
}

// ---------------------------------------------------------------- 11) BULUT KURALLARI: yeni üst düzey alan EKLENMEDİ
{
    const kaynak = oku("js", "cloudDatabaseService.js");
    kontrol("bulut kaydı üst düzey 'program'/'mesemBunyesinde' alanı yazmıyor (kural '$diger: false')",
        !/\bmesemBunyesinde\b/.test(kaynak) && !/\bprogram\s*:/.test(kaynak));
}

// ---------------------------------------------------------------- SONUÇ
if (hatalar.length) {
    console.log(`\n${hatalar.length} KONTROL BAŞARISIZ (${gecen} geçti)\n`);
    hatalar.forEach(h => console.log("   - " + h));
    process.exit(1);
}
console.log(`\nÇok programlı okul: ${gecen} kontrolün tamamı geçti.`);
console.log("   Tek program = müstakil okul, karma = programların branş bazında toplamı,");
console.log("   MESEM ile diğer programlar karışmıyor, eski kayıtlar değişmiyor.");

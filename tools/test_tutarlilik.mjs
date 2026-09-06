/* ===========================================================================
   NormMatik™ — SÖZLEŞME VE TUTARLILIK TESTİ
   ===========================================================================
   NEDEN VAR (06.09.2026)
   ----------------------
   Aynı gün canlıda şu görüldü: "Norm İhtiyaç/Fazla" sekmesinde rozet
   "Toplam İhtiyaç: 2 Öğretmen" derken sayfada "ihtiyacı olan branş
   bulunmamaktadır" yazıyordu. Sebep: motor alanı `diff` adıyla üretiyor,
   rapor `b.difference` okuyordu. JavaScript tanımsız alanı hata vermeden
   geçer; `undefined < 0` ve `undefined > 0` İKİSİ DE false olduğu için
   listeler her zaman boş dönüyordu. Aynı hata DÖRT yerdeydi ve biri master
   matrisin branş rozetiydi: Norm 2 / Mevcut 0 olan branş bile "Tam"
   görünüyordu.

   Uçtan uca tur testi bunu YAKALAYAMAZDI: tur, taşıma katmanını sınar; bu
   hata türetme katmanındaydı. Onun ilacı bu dosyadaki iki katman:

     A) SÖZLEŞME  — tüketiciler, motorun ÜRETMEDİĞİ bir alanı okuyor mu?
                    (hatayı yazıldığı anda yakalar)
     B) TUTARLILIK — aynı sayı iki yerde gösteriliyorsa eşit mi?
                    (alan adı yine kaysa bile yakalar)

   Çalıştırma: node tools/test_tutarlilik.mjs
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

/* ---- ortam ------------------------------------------------------------- */
const w = {};
const sayfalar = {};                       // Excel sekmeleri buraya toplanır
const ctx = {
    window: w, self: w, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    crypto: { getRandomValues: (a) => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {}
};
ctx.globalThis = ctx;
w.dispatchEvent = () => true;
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(
    fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);

// Excel kitaplığı taklidi: dosya yazmak yerine satırları yakalar.
w.XLSX = {
    utils: {
        book_new: () => ({ Sheets: {}, SheetNames: [] }),
        aoa_to_sheet: (rows) => ({ __satirlar: rows }),
        book_append_sheet: (wb, ws, ad) => { wb.SheetNames.push(ad); wb.Sheets[ad] = ws; sayfalar[ad] = ws.__satirlar; }
    },
    writeFile: () => true
};

const st = w.appState, ce = w.curriculumEngine, ne = w.normEngine;
if (!st || !ce || !ne) olumcul("motorlar yüklenemedi.");
w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
};
const R = new w.MebReportsEngine(w.dbService, ne, ce);
const UI = new w.UIComponentManager(w.dbService, st, ne, ce);

/* ---- BİLEREK DENGESİZ okul: fazlalık, ihtiyaç ve düşüm birlikte -------- */
st.state = st.getDefaultState();
st.state.okulBilgisi.okulAdi = "Tutarlılık Test Lisesi";
st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
st.state.okulBilgisi.kurumKodu = "424242";
[["9", 34], ["9", 33], ["9", 34], ["10", 34], ["10", 36], ["11", 28], ["12", 24]]
    .forEach(([g, o], i) => st.addSection({
        subeAdi: g + "-" + "ABCDEFG"[i], sinifSeviyesi: g, ogrenciSayisi: o,
        zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", g, null, null)
    }));
st.state.mevcutOgretmenler = { "Matematik": 6, "İngilizce": 1, "Fizik": 1 };
st.state.okulBilgisi.adminOptions = { yoneticiDersYukleri: { "Türk Dili ve Edebiyatı": 6 } };
// 9. sınıflarda eğik çizgili dersi böl: çarpan devreye girsin.
st.state.subeler.forEach(sec => {
    if (String(sec.sinifSeviyesi) !== "9") return;
    (sec.zorunluDersler || []).forEach(c => {
        const ad = c.ders || c.ders_adi || "";
        if (!ad.includes("/")) return;
        const izinli = ne.bolunebilirBranslar(c);
        if (izinli.length >= 2) c.bolunenBranslar = izinli.slice(0, 2);
    });
});

const normResult = ne.calculateSchoolNorms(
    st.state.subeler, st.state.mevcutOgretmenler, "anadolu_lisesi", R.buildCoordinatorMap(st.state));

/* ---- 0) Ölçüm geçerli mi? --------------------------------------------- */
kontrol("ölçüm geçerli: hem fazlalık hem ihtiyaç var",
    normResult.totalSurplus > 0 && normResult.totalNeeded > 0,
    "fazla " + normResult.totalSurplus + ", ihtiyaç " + normResult.totalNeeded);
kontrol("ölçüm geçerli: yönetici düşümü oluştu",
    normResult.yukMutabakati.yoneticiDersDusumu > 0);
kontrol("ölçüm geçerli: bölünme çarpanı oluştu",
    normResult.yukMutabakati.carpanArtisi > 0);

/* =======================================================================
   A) SÖZLEŞME — motorun ÜRETMEDİĞİ bir alan okunuyor mu?
   ======================================================================= */
{
    const dizi = ["map", "filter", "forEach", "reduce", "length", "push", "sort",
        "slice", "join", "toFixed", "find", "some", "every", "includes", "split",
        "replace", "trim", "toString", "concat", "indexOf", "keys", "values",
        "entries", "flat", "reverse", "pop", "shift", "splice", "toLowerCase",
        "toUpperCase", "toLocaleUpperCase", "toLocaleLowerCase", "padStart",
        "padEnd", "match", "test", "startsWith", "endsWith", "localeCompare"];

    const gridData = R.generateMasterLoadGrid(st.state);
    const execData = R.generateExecutiveSummary(st.state);

    // ADI TEK ANLAMLI olan değişkenler: doğrudan ada göre taranabilir.
    const hedefler = {
        "normResult": Object.keys(normResult),
        "bReport":    Object.keys(normResult.branchReport[0]),
        "bData":      Object.keys(normResult.branchReport[0]),
        "kpis":       Object.keys(execData.kpis),
        "an":         Object.keys(normResult.adminNorms)
    };

    const yorumMu = (l) => {
        const t = l.trim();
        return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("<!--");
    };
    const satirNo = (kaynak, indeks) => kaynak.slice(0, indeks).split("\n").length;

    /* --- BLOK KAPSAMLI TARAMA --------------------------------------------
       `b` gibi tek harfli adlar kodda ÇOK ANLAMLI: sıralama karşılaştırıcısı,
       DOM öğesi, şube kaydı... Ada göre taramak yanlış alarm üretiyordu
       (b.subeAdi, b.classList). Bunun yerine YALNIZCA branş listelerinin
       döngü gövdelerine bakıyoruz: geri çağrının parametre adını yakalayıp
       parantez dengesiyle gövdeyi sınırlıyoruz. Gerçek hata (b.difference)
       tam olarak bu gövdelerdeydi. */
    // DİKKAT — `branches` ÇIPLAK hâliyle alınamaz: veritabanı servisinin branş
    // listesi de öyle adlanıyor ve alanları farklı (brans_adi). Yalnızca
    // NOKTALI biçimi (data.branches, detayData.branches) rapor listesidir.
    const LISTELER = "branchReport|filteredBranches|neededList|surplusList|balancedList|\\.branches";
    const YONTEMLER = "forEach|map|filter|some|every|find|findIndex|reduce|flatMap";

    const bulgular = [];
    const dosyalar = ["js/reportsEngine.js", "js/uiComponents.js", "js/app.js"];

    // Branş kaydı gibi davranan tüm nesnelerin alan birleşimi.
    //
    // Canlı anahtarların YANINDA sabit bir liste de var: ihtiyaç/fazlalık
    // listeleri o anki okulda BOŞ kalırsa `[0]` tanımsız olur, birleşim
    // eksilir ve o alanları okuyan satırlar yanlışlıkla suçlanırdı.
    // (Bu tuzağa testi doğrularken düşüldü, 06.09.2026.)
    const eylemRaporu = R.generateNormActionReport(st.state);
    const bransAlanlari = new Set([
        ...Object.keys(normResult.branchReport[0]),
        ...Object.keys(eylemRaporu.neededList[0] || {}),
        ...Object.keys(eylemRaporu.surplusList[0] || {}),
        // sabit: listeler boş olsa bile bilinen alanlar
        "branchName", "totalHours", "calculatedNorm", "currentTeachers",
        "neededCount", "surplusCount", "reason"
    ]);

    for (const f of dosyalar) {
        const kaynak = fs.readFileSync(path.join(KOK, f), "utf8");

        // 1) Ada göre (tek anlamlı değişkenler)
        kaynak.split("\n").forEach((l, i) => {
            if (yorumMu(l)) return;
            for (const [degisken, alanlar] of Object.entries(hedefler)) {
                const re = new RegExp("(?:^|[^\\w.$])" + degisken + "\\.([A-Za-z_][A-Za-z0-9_]*)", "g");
                let m;
                while ((m = re.exec(l)) !== null) {
                    if (alanlar.includes(m[1]) || dizi.includes(m[1])) continue;
                    bulgular.push(f + ":" + (i + 1) + "  " + degisken + "." + m[1]);
                }
            }
        });

        // 2) Blok kapsamlı (branş döngülerinin gövdesi)
        const dongu = new RegExp(
            "(?:" + LISTELER + ")\\s*\\.\\s*(?:" + YONTEMLER + ")\\s*\\(", "g");
        let d;
        while ((d = dongu.exec(kaynak)) !== null) {
            // Parantez dengesiyle geri çağrının tamamını al.
            let derinlik = 1, j = d.index + d[0].length;
            while (j < kaynak.length && derinlik > 0) {
                const c = kaynak[j];
                if (c === "(") derinlik++;
                else if (c === ")") derinlik--;
                j++;
            }
            const govde = kaynak.slice(d.index + d[0].length, j - 1);
            // İlk parametre adı: "(b, idx) =>", "b =>", "function (b)"
            const par = govde.match(/^\s*(?:function\s*)?\(?\s*([A-Za-z_$][\w$]*)/);
            if (!par) continue;
            const ad = par[1];
            if (ad === "function" || ad === "return") continue;

            const oku = new RegExp("(?:^|[^\\w.$])" + ad + "\\.([A-Za-z_][A-Za-z0-9_]*)", "g");
            let o;
            while ((o = oku.exec(govde)) !== null) {
                if (bransAlanlari.has(o[1]) || dizi.includes(o[1])) continue;
                const satir = satirNo(kaynak, d.index + d[0].length + o.index);
                const l = kaynak.split("\n")[satir - 1] || "";
                if (yorumMu(l)) continue;
                bulgular.push(f + ":" + satir + "  " + ad + "." + o[1] + "  (branş döngüsü)");
            }
        }
    }

    kontrol("A1 motorun üretmediği hiçbir alan okunmuyor",
        bulgular.length === 0, bulgular.slice(0, 8).join(" | "));

    // Ölçüm geçerli mi? Sözleşme taraması gerçekten bir şey tarıyor mu —
    // yoksa "0 bulgu" hiçbir şey ölçmemekten de gelebilir.
    const RE = fs.readFileSync(path.join(KOK, "js", "reportsEngine.js"), "utf8");
    kontrol("A2 ölçüm geçerli: taranan dosyalarda gerçekten okuma var",
        /\bb\.totalHours\b/.test(RE) && /\bb\.calculatedNorm\b/.test(RE));

    // Motorun sözleşmesi: bu alanlar İSİM DEĞİŞTİRİRSE tüketiciler sessizce
    // tanımsıza düşer. Adları burada sabitliyoruz.
    ["branchName", "totalHours", "calculatedNorm", "currentTeachers", "diff",
     "statusType", "statusBadge", "statusText", "formulaExplanation", "courses",
     "adminDeductedHours", "coordinatorHours"].forEach(alan => {
        kontrol("A3 branş kaydında '" + alan + "' alanı duruyor",
            Object.prototype.hasOwnProperty.call(normResult.branchReport[0], alan));
    });
    kontrol("A4 motor 'difference' diye bir alan ÜRETMİYOR (tuzak sabiti)",
        !Object.prototype.hasOwnProperty.call(normResult.branchReport[0], "difference"),
        "üretiyorsa tüketicilerdeki eski okumalar sessizce doğru sanılır");
}

/* =======================================================================
   B) TUTARLILIK — aynı sayı iki yerde eşit mi?
   ======================================================================= */
const execData = R.generateExecutiveSummary(st.state);
const gridData = R.generateMasterLoadGrid(st.state);
const actionData = R.generateNormActionReport(st.state);
const detayData = R.generateBranchDetailReport(st.state, "ALL");

/* --- B1: Yönetici icmali KPI'ları ↔ motor ------------------------------ */
{
    const k = execData.kpis;
    kontrol("B1a KPI toplam ders yükü = motor toplamı",
        k.totalHours === normResult.totalHours, k.totalHours + " / " + normResult.totalHours);
    kontrol("B1b KPI hesaplanan norm = branş normlarının toplamı",
        k.totalCalculatedNorm === normResult.branchReport.reduce((t, b) => t + b.calculatedNorm, 0),
        String(k.totalCalculatedNorm));
    kontrol("B1c KPI mevcut kadro = branş mevcutlarının toplamı",
        k.totalCurrentTeachers === normResult.branchReport.reduce((t, b) => t + b.currentTeachers, 0));
    kontrol("B1d KPI ihtiyaç = branş açıklarının toplamı",
        k.totalNeeded === normResult.branchReport.reduce((t, b) => t + (b.diff < 0 ? -b.diff : 0), 0),
        String(k.totalNeeded));
    kontrol("B1e KPI fazlalık = branş fazlalarının toplamı",
        k.totalSurplus === normResult.branchReport.reduce((t, b) => t + (b.diff > 0 ? b.diff : 0), 0),
        String(k.totalSurplus));
}

/* --- B2: Master matris ↔ yönetici icmali ------------------------------- */
{
    const icmalBranslar = execData.branchReport.map(b => b.branchName).sort();
    const matrisRapor = Object.keys(gridData.branchReportMap).sort();
    kontrol("B2a iki rapor aynı branş kümesini kullanıyor",
        JSON.stringify(icmalBranslar) === JSON.stringify(matrisRapor),
        "icmal " + icmalBranslar.length + ", matris " + matrisRapor.length);

    const farkli = execData.branchReport.filter(b => {
        const m = gridData.branchReportMap[b.branchName];
        return !m || m.totalHours !== b.totalHours || m.calculatedNorm !== b.calculatedNorm;
    });
    kontrol("B2b her branşın yükü ve normu iki raporda AYNI",
        farkli.length === 0,
        farkli.map(b => b.branchName).join(", "));

    kontrol("B2c matris başlığındaki toplam = KPI toplamı",
        gridData.grandTotalHours === execData.kpis.totalHours,
        gridData.grandTotalHours + " / " + execData.kpis.totalHours);
    kontrol("B2d matris alt satırı = mutabakattaki ham çizelge",
        gridData.subeler.reduce((t, s) => t + (gridData.sectionTotals[s.id] || 0), 0)
        === gridData.yukMutabakati.hamCizelgeSaati);
}

/* --- B3: Branş detay cetveli ↔ icmal ----------------------------------- */
{
    const farkli = detayData.branches.filter(b => {
        const i = execData.branchReport.find(x => x.branchName === b.branchName);
        return !i || i.totalHours !== b.totalHours || i.calculatedNorm !== b.calculatedNorm
            || i.currentTeachers !== b.currentTeachers;
    });
    kontrol("B3a branş detay cetveli icmalle birebir tutuyor",
        farkli.length === 0, farkli.map(b => b.branchName).join(", "));

    const dokumTutmayan = detayData.branches.filter(b =>
        (b.courses || []).reduce((t, k) => t + (parseInt(k.calculatedLoad, 10) || 0), 0)
        !== b.totalHours);
    kontrol("B3b ders dökümü toplamı branş yüküyle tutuyor",
        dokumTutmayan.length === 0, dokumTutmayan.map(b => b.branchName).join(", "));
}

/* --- B4: Norm ihtiyaç/fazlalık raporu ↔ motor -------------------------- */
{
    kontrol("B4a ihtiyaç listesi toplamı = rozet",
        actionData.neededList.reduce((t, x) => t + x.neededCount, 0) === actionData.totalNeeded);
    kontrol("B4b fazlalık listesi toplamı = rozet",
        actionData.surplusList.reduce((t, x) => t + x.surplusCount, 0) === actionData.totalSurplus);
    kontrol("B4c rozetler icmal KPI'larıyla aynı",
        actionData.totalNeeded === execData.kpis.totalNeeded
        && actionData.totalSurplus === execData.kpis.totalSurplus);
    kontrol("B4d listelenen her branş icmalde de aynı sayılarla var",
        actionData.neededList.every(x => {
            const i = execData.branchReport.find(b => b.branchName === x.branchName);
            return i && i.totalHours === x.totalHours && i.calculatedNorm === x.calculatedNorm;
        }));
}

/* --- B5: EKRAN ↔ EXCEL -------------------------------------------------- */
{
    const yazildi = R.exportToXLSX(st.state);
    kontrol("B5a Excel çıktısı üretildi", yazildi !== false && Object.keys(sayfalar).length > 0,
        Object.keys(sayfalar).join(", "));

    const execSayfa = sayfalar[Object.keys(sayfalar).find(k => /icmal|İcmal|Norm/i.test(k))] || [];
    const basIdx = execSayfa.findIndex(r => Array.isArray(r) && r[0] === "Sıra" && r[1] === "Branş Adı");
    kontrol("B5b Excel'de branş tablosu var", basIdx >= 0, "sekmeler: " + Object.keys(sayfalar).join(", "));

    if (basIdx >= 0) {
        const excelBranslar = [];
        for (let i = basIdx + 1; i < execSayfa.length; i++) {
            const r = execSayfa[i];
            if (!Array.isArray(r) || typeof r[0] !== "number") break;
            excelBranslar.push({ ad: r[1], yuk: r[2], norm: r[3], mevcut: r[4], durum: r[6] });
        }
        kontrol("B5c Excel'deki branş sayısı ekranla aynı",
            excelBranslar.length === execData.branchReport.length,
            excelBranslar.length + " / " + execData.branchReport.length);

        const uyusmaz = excelBranslar.filter((e, i) => {
            const b = execData.branchReport[i];
            return !b || e.ad !== b.branchName || e.yuk !== b.totalHours
                || e.norm !== b.calculatedNorm || e.mevcut !== b.currentTeachers;
        });
        kontrol("B5d Excel'deki sayılar ekranla BİREBİR aynı",
            uyusmaz.length === 0, uyusmaz.map(e => e.ad).join(", "));

        // b.difference hatasının Excel'deki izi: her satır "0 (Tam)" olurdu.
        const ihtiyacliVar = execData.branchReport.some(b => b.diff < 0);
        kontrol("B5e Excel'de ihtiyaç/fazlalık sütunu gerçekten doluyor",
            !ihtiyacliVar || excelBranslar.some(e => /İhtiyaç|Fazla/.test(String(e.durum))),
            "hepsi '0 (Tam)' ise alan adı kaymış demektir");
    }
}

/* --- B6: EKRAN ↔ CSV ---------------------------------------------------- */
{
    const csv = R.exportToCSV(execData);
    kontrol("B6a CSV üretildi", typeof csv === "string" && csv.length > 100);

    const eksik = execData.branchReport.filter(b => !csv.includes(b.branchName));
    kontrol("B6b CSV her branşı içeriyor", eksik.length === 0,
        eksik.map(b => b.branchName).join(", "));

    const ihtiyacli = execData.branchReport.filter(b => b.diff < 0);
    kontrol("B6c CSV'de ihtiyaç durumu görünüyor",
        ihtiyacli.length === 0 || /İhtiyaç/.test(csv),
        "ihtiyaçlı branş var ama CSV'de 'İhtiyaç' geçmiyor");
}

/* --- B7: Master matris arayüzü ↔ motor --------------------------------- */
{
    const html = UI.renderMasterGridReport(gridData, false, true);

    // Rozetteki norm/mevcut sayıları motorunkiyle aynı olmalı.
    const eksikRozet = execData.branchReport.filter(b =>
        !html.includes("Norm: <strong>" + b.calculatedNorm + "</strong>"));
    kontrol("B7a matris rozetlerindeki norm sayıları basılıyor",
        eksikRozet.length < execData.branchReport.length,
        "hiçbir rozet motordaki normu göstermiyor");

    const ihtiyacli = execData.branchReport.filter(b => b.diff < 0);
    kontrol("B7b ihtiyacı olan branş rozetinde 'İhtiyaç' yazıyor",
        ihtiyacli.length === 0 || /İhtiyaç</.test(html),
        "hepsi 'Tam' çıkıyorsa alan adı kaymıştır (b.difference tuzağı)");

    const fazlali = execData.branchReport.filter(b => b.diff > 0);
    kontrol("B7c fazlalığı olan branş rozetinde 'Fazla' yazıyor",
        fazlali.length === 0 || /Fazla</.test(html));

    kontrol("B7d matriste 'undefined' / 'NaN' sızmıyor",
        !/undefined|NaN/.test(html));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ TUTARLILIK HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ TUTARLILIK DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

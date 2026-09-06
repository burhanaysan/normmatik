/* ===========================================================================
   NormMatik™ — Müfredat tazeleme testi
   ===========================================================================
   NEDEN VAR (kullanıcı bildirimi, 06.09.2026)
   -------------------------------------------
   Şube düzenleme penceresindeki

       "🔄 Zorunlu dersleri güncel MEB müfredatına göre otomatik yenile"

   kutusu için kullanıcı "fonksiyonu yoksa kaldıralım, insanları kandırmaya
   gerek yok" dedi. Ölçüldüğünde kutunun ÇALIŞTIĞI görüldü — ama başka bir
   sorun çıktı: zorunlu ders listesi OLDUĞU GİBİ değiştiriliyordu.

   Kutu VARSAYILAN OLARAK İŞARETLİ. Yani müdür yalnızca şube adını ya da
   öğrenci sayısını düzeltmek için pencereyi açıp kaydettiğinde bile şunlar
   SESSİZCE siliniyordu:

       atananBrans      dersin hangi branşa yazıldığı (elle seçim)
       bolunenBranslar  eğik çizgili dersin branşlara bölünmesi
       grupSayisi       okulun belirlediği grup sayısı
       birlesikSubeler  şube birleştirme
       bransDagilimi    hedef temelli destek eğitiminin dağıtımı

   Beşi de NORM HESABINA GİRİYOR; yani norm sessizce değişiyordu. Üstelik
   kutunun açıklaması "seçtiğiniz seçmeli dersler korunur" diyerek güven
   veriyordu: seçmeliler gerçekten korunuyordu, zorunlu derslerdeki emek
   korunmuyordu.

   Çalıştırma: node tools/test_mufredatTazeleme.mjs
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
    alert() {}
};
ctx.globalThis = ctx;
w.dispatchEvent = () => true;
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(
    fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);

const ce = w.curriculumEngine, ne = w.normEngine;
if (!ce || typeof ce.mufredatiTazele !== "function") olumcul("mufredatiTazele yok.");

const taze = ce.getMandatoryCourses("anadolu_lisesi", "9", null, null);
kontrol("ölçüm geçerli: müfredattan ders geldi", taze.length > 5, String(taze.length));

/* ---- 1) Kullanıcı ayarları taşınıyor mu? ------------------------------ */
{
    const eski = taze.map(d => Object.assign({}, d));
    eski[0].atananBrans = "Matematik";
    eski[1].grupSayisi = 2;
    eski[2].birlesikSubeler = ["s9"];
    eski[3].bransDagilimi = { "Matematik": 1, "Fizik": 2 };
    const egik = eski.find(d => String(d.ders || "").includes("/"));
    if (egik) egik.bolunenBranslar = ["Görsel Sanatlar", "Müzik"];
    kontrol("ölçüm geçerli: eğik çizgili ders bulundu", !!egik);

    const s = ce.mufredatiTazele(eski, taze);

    kontrol("atananBrans korunuyor", s[0].atananBrans === "Matematik", s[0].atananBrans);
    kontrol("grupSayisi korunuyor", s[1].grupSayisi === 2, String(s[1].grupSayisi));
    kontrol("birlesikSubeler korunuyor",
        JSON.stringify(s[2].birlesikSubeler) === '["s9"]', JSON.stringify(s[2].birlesikSubeler));
    kontrol("bransDagilimi korunuyor",
        s[3].bransDagilimi && s[3].bransDagilimi["Fizik"] === 2, JSON.stringify(s[3].bransDagilimi));
    const e2 = s.find(d => String(d.ders || "").includes("/"));
    kontrol("bolunenBranslar korunuyor",
        !!(e2 && Array.isArray(e2.bolunenBranslar) && e2.bolunenBranslar.length === 2),
        JSON.stringify(e2 && e2.bolunenBranslar));
}

/* ---- 2) Müfredat KAYNAKTAN gelmeye devam ediyor mu? -------------------- */
/* Koruma uğruna güncellemeyi öldürmüş olmayalım: ders adı, saat, kategori
   ve baraj/atölye bilgisi taze listeden gelmeli. */
{
    const eski = taze.map(d => Object.assign({}, d, { saat: 99, kategori: "ESKİ" }));
    const s = ce.mufredatiTazele(eski, taze);
    kontrol("saat kaynaktan geliyor (eski saat taşınmıyor)",
        s.every((d, i) => d.saat === taze[i].saat), "eski 99 saat sızmış");
    kontrol("kategori kaynaktan geliyor",
        s.every((d, i) => d.kategori === taze[i].kategori));
    kontrol("ders sayısı kaynaktaki kadar", s.length === taze.length);
}

/* ---- 3) Kenar durumlar ------------------------------------------------- */
{
    kontrol("eski liste boşken taze liste aynen döner",
        ce.mufredatiTazele([], taze).length === taze.length);
    kontrol("eski liste null iken çökmüyor",
        Array.isArray(ce.mufredatiTazele(null, taze)));
    kontrol("taze liste boşken boş döner",
        ce.mufredatiTazele(taze, []).length === 0);
    kontrol("taze liste null iken çökmüyor",
        Array.isArray(ce.mufredatiTazele(taze, null)));

    // Müfredata YENİ giren ders: eşleşmeyen kayıt olduğu gibi kalmalı.
    const yeniDers = { ders: "Bilinmeyen Yeni Ders", saat: 2, kategori: "ORTAK DERSLER" };
    const s = ce.mufredatiTazele(taze, taze.concat([yeniDers]));
    kontrol("müfredata yeni giren ders listede yer alıyor",
        s.some(d => d.ders === "Bilinmeyen Yeni Ders"));

    // Müfredattan ÇIKAN ders taşınmamalı (kaynak neyse o).
    const s2 = ce.mufredatiTazele(taze.concat([yeniDers]), taze);
    kontrol("müfredattan çıkan ders taşınmıyor",
        !s2.some(d => d.ders === "Bilinmeyen Yeni Ders"));

    // Boş/anlamsız değerler taşınmamalı: eski boş bir seçim, taze veriyi ezmesin.
    const eskiBos = taze.map(d => Object.assign({}, d, { bolunenBranslar: [], grupSayisi: "" }));
    const s3 = ce.mufredatiTazele(eskiBos, taze);
    kontrol("boş dizi/boş metin ayarları taşınmıyor",
        s3.every(d => d.bolunenBranslar === undefined || d.bolunenBranslar.length > 0));
}

/* ---- 4) ASIL SONUÇ: tazeleme normu DEĞİŞTİRMEMELİ --------------------- */
/* Hatanın gerçek bedeli buydu: müdür şube adını düzeltince norm kayıyordu. */
{
    const st = w.appState;
    w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
    };
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    [["9", 34], ["9", 33], ["10", 30]].forEach(([g, o], i) => st.addSection({
        subeAdi: g + "-" + "ABC"[i], sinifSeviyesi: g, ogrenciSayisi: o,
        zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", g, null, null)
    }));

    // Müdür emek veriyor: bölünme + grup + branş ataması
    st.state.subeler.forEach(sec => {
        (sec.zorunluDersler || []).forEach(c => {
            const ad = String(c.ders || "");
            if (ad.includes("/")) {
                const izinli = ne.bolunebilirBranslar(c);
                if (izinli.length >= 2) c.bolunenBranslar = izinli.slice(0, 2);
            }
            if (ad === "İngilizce") c.grupSayisi = 2;
        });
    });

    const oncekiNorm = ne.calculateSchoolNorms(st.state.subeler, {}, "anadolu_lisesi", {});
    kontrol("ölçüm geçerli: bölünme normu etkiliyor",
        oncekiNorm.yukMutabakati.carpanArtisi > 0,
        String(oncekiNorm.yukMutabakati.carpanArtisi));

    // Şube düzenleme penceresi "otomatik yenile" ile kaydediliyor.
    st.state.subeler.forEach(sec => {
        const t = ce.getMandatoryCourses("anadolu_lisesi", sec.sinifSeviyesi, null, null);
        sec.zorunluDersler = ce.mufredatiTazele(sec.zorunluDersler, t);
    });

    const sonrakiNorm = ne.calculateSchoolNorms(st.state.subeler, {}, "anadolu_lisesi", {});
    kontrol("TAZELEMEDEN SONRA toplam ders yükü DEĞİŞMİYOR",
        sonrakiNorm.totalHours === oncekiNorm.totalHours,
        oncekiNorm.totalHours + " -> " + sonrakiNorm.totalHours);
    kontrol("TAZELEMEDEN SONRA hesaplanan norm DEĞİŞMİYOR",
        sonrakiNorm.totalCalculatedNorm === oncekiNorm.totalCalculatedNorm,
        oncekiNorm.totalCalculatedNorm + " -> " + sonrakiNorm.totalCalculatedNorm);
    kontrol("TAZELEMEDEN SONRA bölünme çarpanı DEĞİŞMİYOR",
        sonrakiNorm.yukMutabakati.carpanArtisi === oncekiNorm.yukMutabakati.carpanArtisi,
        oncekiNorm.yukMutabakati.carpanArtisi + " -> " + sonrakiNorm.yukMutabakati.carpanArtisi);
}

/* ---- 5) Arayüz gerçekten bunu kullanıyor mu? --------------------------- */
{
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    kontrol("şube düzenleme tazelemeyi koruyarak yapıyor",
        /mufredatiTazele\(originalCourses, tazeDersler\)/.test(ui),
        "doğrudan getMandatoryCourses atanıyorsa kullanıcı ayarları silinir");
    kontrol("kutunun açıklaması artık neyin korunduğunu YAZIYOR",
        /branş atamaları, grup\/branş bölünmeleri/.test(ui),
        "açıklama yalnızca seçmelilerden söz ediyorsa eksik bilgi verir");
    kontrol("kutu hâlâ mevcut (özellik kaldırılmadı)",
        /id="sec-refresh-curriculum"/.test(ui));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ MÜFREDAT TAZELEME HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ MÜFREDAT TAZELEME DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

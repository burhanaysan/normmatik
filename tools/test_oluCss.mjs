/* ===========================================================================
   NormMatik™ — ÖLÜ CSS DENETİMİ
   ===========================================================================
   NEDEN VAR (06.09.2026)
   ----------------------
   Matris / panel / köprü ekranları yeniden tasarlandığında eski görsel dil
   `css/app.css` içinde öylece kaldı: 248 kural, 45 KB, dosyanın %20'si.
   Kimse fark etmedi çünkü ölü CSS hiçbir şeyi bozmaz — sadece büyür.

   Daha kötüsü: ölü CSS bir TESTİ AYAKTA TUTUYORDU. `test_yukMutabakati`
   `.ymt-serit` kuralını arıyordu; o sınıfı hiçbir çizici basmadığı hâlde
   kural dosyada durduğu için test yeşil kalıyordu. Temizlik yapılınca
   ortaya çıktı.

   Bu test iki yönü birden korur:

     A) ÖLÜ CSS GERİ BÜYÜMESİN — seçicisindeki HER sınıfı hiçbir kaynakta
        geçmeyen bir kural varsa kırmızı yanar.

     B) CANLI CSS YANLIŞLIKLA SİLİNMESİN — bu dosyadaki çekirdek sınıfların
        kuralı yoksa kırmızı yanar. (Daha önce iki kez agresif bir regex
        süpürgesi `.sidebar-header` ve `.search-input`i uçurmuştu; o sefer
        geri alındı. Bu liste o hatanın tekrarını engeller.)

   ÖNEMLİ — YANLIŞ POZİTİFTEN KAÇINMA
   Sınıf adları çalışma anında da üretilebiliyor:  `cat-${grp.type}`,
   `"card-grade-" + seviye`, `d-${durum}`. Bunlar kaynakta tam hâliyle hiç
   geçmez. Bu yüzden ÖN EK / SON EK parçaları ayrıca toplanır ve bunlarla
   eşleşen sınıflar ÖLÜ SAYILMAZ. Kural: yanlış "canlı" zararsız,
   yanlış "ölü" hatadır.

   Çalıştırma: node tools/test_oluCss.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};

/* ---- kaynakları oku --------------------------------------------------- */
// bundle.js ATLANIR: js/*.js dosyalarının birleşimi (tools/build_bundle.py
// üretir), yani kaynağı zaten taranıyor. xlsx satıcı kodu.
const ATLA = new Set(["bundle.js", "xlsx.full.min.js"]);

const kaynaklar = [];
for (const ad of fs.readdirSync(KOK)) {
    if (ad.endsWith(".html")) kaynaklar.push(path.join(KOK, ad));
}
for (const ad of fs.readdirSync(path.join(KOK, "js"))) {
    if (ad.endsWith(".js") && !ATLA.has(ad)) kaynaklar.push(path.join(KOK, "js", ad));
}
const kaynakMetin = kaynaklar.map((p) => fs.readFileSync(p, "utf8")).join("\n");

/* ---- kullanılan sınıf adları ------------------------------------------ */
const kelimeler = new Set(kaynakMetin.match(/[A-Za-z_][A-Za-z0-9_-]*/g) || []);

// Dinamik üretim parçaları: `xx-${...}` , "xx-" + degisken , `${...}-xx`
const onekler = new Set();
const sonekler = new Set();
for (const m of kaynakMetin.matchAll(/([A-Za-z][A-Za-z0-9_-]*[-_])\$\{/g)) onekler.add(m[1]);
for (const m of kaynakMetin.matchAll(/["']([A-Za-z][A-Za-z0-9_-]*[-_])["']\s*\+/g)) onekler.add(m[1]);
for (const m of kaynakMetin.matchAll(/\}(-[A-Za-z][A-Za-z0-9_-]*)/g)) sonekler.add(m[1]);
for (const m of kaynakMetin.matchAll(/\+\s*["'](-[A-Za-z][A-Za-z0-9_-]*)["']/g)) sonekler.add(m[1]);

const sinifCanli = (c) => {
    if (kelimeler.has(c)) return true;
    for (const p of onekler) if (p.length >= 2 && c.startsWith(p)) return true;
    for (const s of sonekler) if (s.length >= 2 && c.endsWith(s)) return true;
    return false;
};

/* ---- CSS'i süslü parantez sayarak ayrıştır ----------------------------- */
// Regex ile ayrıştırmak @media içindeki kuralları yanlış kesiyor; ölçüldü.
const CSS_YOL = path.join(KOK, "css", "app.css");
const cssHam = fs.readFileSync(CSS_YOL, "utf8");
const css = cssHam.replace(/\/\*[\s\S]*?\*\//g, " ");

const kurallar = [];
{
    const yigin = [];
    let parcaBas = 0, tirnak = null;
    for (let i = 0; i < css.length; i++) {
        const ch = css[i];
        if (tirnak) {
            if (ch === "\\") { i++; continue; }
            if (ch === tirnak) tirnak = null;
            continue;
        }
        if (ch === '"' || ch === "'") { tirnak = ch; continue; }
        if (ch === "{") {
            const sec = css.slice(parcaBas, i).trim();
            yigin.push(sec.startsWith("@") ? { at: true } : { at: false, sec });
            parcaBas = i + 1;
        } else if (ch === "}") {
            const ust = yigin.pop();
            if (ust && !ust.at) kurallar.push(ust.sec);
            parcaBas = i + 1;
        } else if (ch === ";" && yigin.length === 0) {
            parcaBas = i + 1;
        }
    }
}

const sinifAl = (sec) => (sec.match(/\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g) || [])
    .map((x) => x.slice(1));

kontrol("ölçüm geçerli: CSS ayrıştırılabiliyor",
    kurallar.length > 500, kurallar.length + " kural");
kontrol("ölçüm geçerli: kaynaklar okunabiliyor",
    kaynaklar.length > 20 && kelimeler.size > 3000,
    kaynaklar.length + " dosya, " + kelimeler.size + " kelime");

/* ---- A) tamamı ölü kural var mı? -------------------------------------- */
const oluKurallar = [];
for (const sec of kurallar) {
    const sf = sinifAl(sec);
    if (!sf.length) continue;                 // eleman/kimlik seçicisi
    if (sf.every((c) => !sinifCanli(c))) oluKurallar.push(sec);
}
kontrol("seçicisindeki her sınıfı ölü olan kural yok",
    oluKurallar.length === 0,
    oluKurallar.length + " kural, örn: " + oluKurallar.slice(0, 4).join(" | "));

/* ---- B) çekirdek sınıfların kuralı duruyor mu? ------------------------- */
// Ekranda GERÇEKTEN basılan, kaybı hemen görülecek sınıflar. Liste kısa
// tutuldu: amaç tam kapsama değil, agresif bir süpürgeyi yakalamak.
const CEKIRDEK = [
    // kabuk
    "sidebar-left", "sidebar-right", "main-workspace",
    "modal-overlay", "modal-box",
    // sube kartlari
    "section-card", "course-row", "grade-tab-btn",
    // bildirimler (06.09 yeniden tasarimi)
    "toast", "toast-container", "toast-sure", "toast-kapat",
    // ders dagitim kartlari (06.09 yeniden tasarimi)
    "dd-tablo", "dd-hucre", "dd-durum", "dd-brans",
    // yuk mutabakati denklemi (06.09 yeniden tasarimi)
    "mt-kutu", "mt-ad", "mt-denklem", "ymt-detay",
    // raporlar
    "report-tab-btn", "kpi-value",
];
const eksik = CEKIRDEK.filter((c) => !new RegExp("\\." + c + "\\s*[,{:.\\[>~+ ]").test(css));
kontrol("çekirdek sınıfların CSS kuralı duruyor", eksik.length === 0,
    "kuralı kaybolan: " + eksik.join(", "));

/* ---- C) dosya sağlığı -------------------------------------------------- */
const acik = (cssHam.match(/\{/g) || []).length;
const kapali = (cssHam.match(/\}/g) || []).length;
kontrol("süslü parantezler dengeli", acik === kapali, acik + " açık, " + kapali + " kapalı");
kontrol("boş @media bloğu kalmadı",
    !/@(?:media|supports)[^{}]*\{\s*\}/.test(cssHam));

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
console.log("app.css: " + cssHam.length + " bayt, " + kurallar.length + " kural");
if (hatalar.length) {
    console.log("❌ ÖLÜ CSS DENETİMİ HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ ÖLÜ CSS DENETİMİ TEMİZ — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

/* ===========================================================================
   NormMatik — UYGULAMA SİMGESİ   (13.09.2026)

   NEDEN VAR
   ---------
   Marka işareti 10.09.2026'da yenilendi (mavi kare + beyaz N). Sayfalar yeni
   işarete geçti, ama `manifest.json` ve `sw.js` ESKİ görseli göstermeye
   devam etti: "MEB NORM" yazılı kitap + kep resmi (18.08 tarihli
   icons/icon-192.png, icon-512.png, app_icon.ico).

   Sonuç: tarayıcı sekmesinde yeni işaret, ama uygulamayı TELEFONUNUN ANA
   EKRANINA ekleyen okul ESKİ işareti görüyordu. Kimse hata mesajı görmez;
   iki ayrı kimlik yan yana yaşar.

   İKİNCİ HATA: yeni ikon "maskable" diye bildirilseydi Android onu kendi
   maskesiyle BİR KEZ DAHA kırpardı (ikonun zaten yuvarlak köşesi var).
   Bu yüzden ayrı, taşmalı bir maskelenebilir sürüm üretiliyor.

   BU TEST ŞUNLARI BAĞLAR
     1. manifest.json ve sw.js'in gösterdiği her dosya GERÇEKTEN var.
     2. Eski kitap/kep görseline hiçbir yerden atıf yok.
     3. PWA için hem "any" hem "maskable" bildiriliyor.
     4. Maskelenebilir sürüm taşmalı (köşesi saydam değil) — kırpılınca
        beyaz köşe çıkmaz.

   ÇALIŞTIRMA: node tools/test_simgeler.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const oku = (...y) => fs.readFileSync(path.join(KOK, ...y), "utf8");
const varMi = (...y) => fs.existsSync(path.join(KOK, ...y));

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};

const manifest = JSON.parse(oku("manifest.json"));
const sw = oku("sw.js");

/* ---- 1) manifest'teki her dosya var mı -------------------------------- */
kontrol("manifest ikon bildiriyor",
    Array.isArray(manifest.icons) && manifest.icons.length >= 2,
    String(manifest.icons && manifest.icons.length));

for (const i of manifest.icons || []) {
    kontrol(`manifest dosyası var: ${i.src}`, varMi(...i.src.split("/")));
}

/* ---- 2) sw.js'in önbelleğe aldığı her simge var mı -------------------- */
{
    const eksik = [];
    for (const m of sw.matchAll(/"\.\/((?:icons\/)?[\w.-]+\.(?:png|ico))"/g)) {
        if (!varMi(...m[1].split("/"))) eksik.push(m[1]);
    }
    kontrol("sw.js'in önbelleğe aldığı simgeler var", eksik.length === 0,
        eksik.join(", "));
}

/* ---- 3) HTML sayfalarındaki simge bağlantıları ------------------------ */
{
    const sayfalar = ["index.html", "app.html", "sifre.html", "yonetim.html",
                      "ders-yuku-hesaplama.html", "norm-kadro-hesaplama.html",
                      "meslek-lisesi-norm-kadro.html"];
    const kirik = [];
    for (const s of sayfalar) {
        if (!varMi(s)) continue;
        const metin = oku(s);
        for (const m of metin.matchAll(/<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)) {
            const hedef = m[1].split("?")[0];
            if (!varMi(...hedef.split("/"))) kirik.push(s + " -> " + hedef);
        }
    }
    kontrol("sayfalardaki simge bağlantıları kırık değil", kirik.length === 0,
        kirik.join(" | "));
}

/* ---- 4) Eski kitap/kep görseline atıf YOK ----------------------------- */
{
    const eskiler = ["icon-192.png", "icon-512.png", "app_icon.ico"];
    const atiflar = [];
    for (const dosya of ["manifest.json", "sw.js", "index.html", "app.html"]) {
        if (!varMi(dosya)) continue;
        const metin = oku(dosya);
        for (const e of eskiler) {
            // Yorum satırında adı geçebilir; asıl aradığımız BAĞLANTI.
            const desen = new RegExp('["\'(][^"\'()]*icons/' + e.replace(".", "\\."));
            if (desen.test(metin)) atiflar.push(dosya + " -> " + e);
        }
    }
    kontrol("eski MEB NORM görseline bağlantı kalmadı", atiflar.length === 0,
        atiflar.join(" | "));
    for (const e of eskiler) {
        kontrol(`eski dosya silinmiş: ${e}`, !varMi("icons", e));
    }
}

/* ---- 5) PWA: hem "any" hem "maskable" --------------------------------- */
{
    const amaclar = (manifest.icons || []).map(i => String(i.purpose || "any"));
    kontrol("normal (any) ikon bildirilmiş",
        amaclar.some(a => a.split(/\s+/).includes("any")), amaclar.join(" / "));
    kontrol("maskelenebilir (maskable) ikon bildirilmiş",
        amaclar.some(a => a.split(/\s+/).includes("maskable")), amaclar.join(" / "));
    kontrol("aynı dosya hem any hem maskable diye bildirilmiyor",
        !amaclar.some(a => a.includes("any") && a.includes("maskable")),
        amaclar.join(" / "));
    kontrol("512'lik ikon var",
        (manifest.icons || []).some(i => i.sizes === "512x512"));
}

/* ---- 6) Maskelenebilir sürüm gerçekten taşmalı mı --------------------- */
{
    // PNG'yi kütüphanesiz okumak yerine dosya boyutuna değil, üreticinin
    // koduna bakıyoruz: taşmalı zemin ve küçültülmüş harf orada tanımlı.
    const ureteci = oku("tools", "uret_favicon.py");
    kontrol("üretecin maskelenebilir işlevi var",
        /def maskelenebilir_ikon\(/.test(ureteci));
    kontrol("maskelenebilir sürüm taşmalı zemin kullanıyor",
        /Image\.new\("RGBA", \(b, b\), MAVI \+ \(255,\)\)/.test(ureteci));
    kontrol("maskelenebilir sürümde harf küçültülmüş (güvenli daire)",
        /maskelenebilir_ikon[\s\S]{0,900}b \* 0\.45/.test(ureteci));
    kontrol("maskelenebilir dosyalar üretiliyor",
        /normmatik-maskable-512\.png/.test(ureteci));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ SİMGE AYARI HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ UYGULAMA SİMGESİ DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

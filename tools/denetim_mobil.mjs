/*
 * MOBİL UYUM DENETİMİ  (karşılama sayfası)
 * ========================================
 * Hedef: css/landing.css
 *
 * NEDEN VAR
 * ---------
 * 26.08.2026'da ölçüldü: eski landing.css 630 satır boyunca HİÇ @media
 * kuralı içermiyordu. 375px ekranda üst menü tamamen dışarıdaydı
 * (.nav-actions 527→710px) ve mobil menü düğmesi yoktu.
 * `body { overflow-x: hidden }` taşmayı gizlediği için gözle fark
 * edilmiyordu.
 *
 * Sayfa aynı gün SIFIRDAN, MOBİL ÖNCELİKLİ yazıldı. Artık taban stiller
 * telefon içindir; geniş ekranlar `min-width` ile EKLENİR. Bu denetim de
 * ona göre güncellendi: eskisi `max-width` kuralı arıyordu, yeni yapıda
 * öyle bir kural yok — denetim boşuna kırmızı yanıyordu.
 *
 * Çalıştırma: node tools/denetim_mobil.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = fs.readFileSync(path.join(KOK, "css", "landing.css"), "utf8");
const html = fs.readFileSync(path.join(KOK, "index.html"), "utf8");

let gecti = 0;
const eksik = [];
function denetle(ad, kosul, ayrinti = "") {
    if (kosul) { gecti++; console.log("  [TAMAM] " + ad); }
    else { eksik.push({ ad, ayrinti }); console.log("  [EKSİK] " + ad + (ayrinti ? "  " + ayrinti : "")); }
}

/** Bir @media bloğunun gövdesini döndürür. */
function medya(kosul) {
    const i = css.indexOf("@media " + kosul);
    if (i < 0) return null;
    const ac = css.indexOf("{", i);
    let d = 1, j = ac + 1;
    while (j < css.length && d > 0) {
        if (css[j] === "{") d++;
        else if (css[j] === "}") d--;
        j++;
    }
    return css.slice(ac + 1, j - 1);
}

/** @media bloklarının DIŞINDA kalan taban stiller. */
function taban() {
    let s = css, i;
    while ((i = s.indexOf("@media")) >= 0) {
        const ac = s.indexOf("{", i);
        let d = 1, j = ac + 1;
        while (j < s.length && d > 0) {
            if (s[j] === "{") d++;
            else if (s[j] === "}") d--;
            j++;
        }
        s = s.slice(0, i) + s.slice(j);
    }
    return s;
}

const T = taban();

console.log("MOBİL UYUM DENETİMİ (mobil öncelikli yapı)");
console.log("=".repeat(66));

console.log("\n1. Taban stiller telefon için mi?");
denetle("izgara tabanda TEK sütun",
    /\.izgara\s*\{[^}]*grid-template-columns:\s*1fr/.test(T),
    "taban çok sütunluysa telefonda taşar");
denetle("galeri tabanda TEK sütun",
    /\.galeri\s*\{[^}]*grid-template-columns:\s*1fr/.test(T));
denetle("kademe listesi tabanda TEK sütun",
    /\.kademe-liste\s*\{[^}]*grid-template-columns:\s*1fr/.test(T));
denetle("giriş düğmeleri tabanda ALT ALTA",
    /\.giris-dugmeler\s*\{[^}]*flex-direction:\s*column/.test(T),
    "yan yana olursa 375px'e sığmaz");
denetle("üst menü tabanda GİZLİ",
    /\.ust-menu\s*\{[^}]*display:\s*none/.test(T),
    "telefonda menü gizlenmezse marka + düğme taşar");

console.log("\n2. Geniş ekran katmanları var mı?");
const orta = medya("(min-width: 640px)");
const genis = medya("(min-width: 900px)");
denetle("640px katmanı", orta !== null);
denetle("900px katmanı", genis !== null);
if (orta) {
    denetle("640px'te düğmeler yan yana",
        /\.giris-dugmeler[^}]*flex-direction:\s*row/.test(orta));
    denetle("640px'te izgara 2 sütun",
        /\.izgara\s*\{\s*grid-template-columns:\s*repeat\(2/.test(orta));
}
if (genis) {
    denetle("900px'te üst menü görünür",
        /\.ust-menu\s*\{\s*display:\s*flex/.test(genis),
        "menü hiç görünmezse bölüm bağlantılarına ulaşılamaz");
    denetle("900px'te izgara 3 sütun",
        /\.izgara\s*\{\s*grid-template-columns:\s*repeat\(3/.test(genis));
}

console.log("\n3. Önbellek ve sözleşme");
denetle("landing.css sürüm damgası taşıyor",
    /css\/landing\.css\?v=\d/.test(html),
    "damgasız CSS: eski ziyaretçi eski tasarımı görmeye devam eder");
denetle("viewport meta etiketi var",
    /name="viewport"[^>]*width=device-width/.test(html));

// Betiğin bağlı olduğu kimlikler — tasarım değişse de bunlar durmalı
const kimlikler = ["auth-modal", "auth-kurum-kodu", "auth-password",
    "btn-close-auth-modal", "btn-submit-auth", "form-login",
    "btn-trigger-login", "btn-hero-login", "btn-hero-demo",
    "btn-open-demo-school", "link-demo-school",
    "lightbox-modal", "lightbox-img", "lightbox-title", "lightbox-close"];
const kayip = kimlikler.filter(k => !new RegExp('id="' + k + '"').test(html));
denetle("betiğin bağlı olduğu 15 kimlik yerinde", kayip.length === 0,
    "kayıp: " + kayip.join(", "));
denetle("modal sınıfı betikle uyumlu (.active)",
    /\.auth-modal-overlay\.active/.test(css) && /classList\.add\('active'\)/.test(html),
    "sınıf adı tutmazsa giriş kutusu HİÇ açılmaz");

console.log("\n" + "=".repeat(66));
if (eksik.length === 0) {
    console.log(`✅ MOBİL YAPI SAĞLAM — ${gecti} kontrol`);
} else {
    console.log(`⚠️  ${eksik.length} EKSİK (${gecti} kontrol geçti)`);
    eksik.forEach(e => console.log("   • " + e.ad + (e.ayrinti ? "\n     " + e.ayrinti : "")));
}
console.log("=".repeat(66));
process.exit(eksik.length === 0 ? 0 : 1);

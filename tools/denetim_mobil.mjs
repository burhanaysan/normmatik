/*
 * MOBİL UYUM DENETİMİ  (Cephe 4 — çökertme tatbikatı)
 * ===================================================
 * Hedef: css/landing.css
 *
 * NEDEN VAR
 * ---------
 * 2026-08-26'da ölçüldü: landing.css 630 satır boyunca HİÇ @media kuralı
 * içermiyordu. Karşılama sayfasının gövdesi akışkan olduğu için idare
 * ediyordu, ama üst çubuk `flex-wrap: nowrap` ile sabit duruyordu.
 * 375px genişlikte gerçek ölçüm:
 *
 *     .nav-links    192 -> 527 px   (ekran 375px — tamamen dışarıda)
 *     .nav-actions  527 -> 710 px   (Demo ve Kurum Girişi düğmeleri)
 *
 * Yani telefondan gelen ziyaretçi üst menüyü hiç göremiyordu ve mobil
 * menü düğmesi de yoktu. Bu betik, o kuralların yerinde durduğunu
 * denetler; biri sadeleştirme yaparken silerse yakalar.
 *
 * Çalıştırma: node tools/denetim_mobil.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = fs.readFileSync(path.join(KOK, "css", "landing.css"), "utf8");

let gecti = 0;
const eksik = [];
function denetle(ad, kosul, ayrinti = "") {
    if (kosul) { gecti++; console.log("  [VAR]   " + ad); }
    else { eksik.push({ ad, ayrinti }); console.log("  [EKSİK] " + ad + (ayrinti ? "  " + ayrinti : "")); }
}

// Bir @media bloğunun gövdesini çıkar
function medyaGovdesi(kosul) {
    const i = css.indexOf("@media " + kosul);
    if (i < 0) return null;
    const ac = css.indexOf("{", i);
    let derinlik = 1, j = ac + 1;
    while (j < css.length && derinlik > 0) {
        if (css[j] === "{") derinlik++;
        else if (css[j] === "}") derinlik--;
        j++;
    }
    return css.slice(ac + 1, j - 1);
}

console.log("MOBİL UYUM DENETİMİ (css/landing.css)");
console.log("=".repeat(66));

const telefon = medyaGovdesi("(max-width: 860px)");
const dar = medyaGovdesi("(max-width: 420px)");

console.log("\nTelefon ve tablet (max-width: 860px)");
denetle("blok mevcut", telefon !== null, "@media (max-width: 860px) bulunamadı");
if (telefon) {
    denetle("bölüm bağlantıları gizleniyor", /\.nav-links\s*\{[^}]*display:\s*none/.test(telefon));
    denetle("demo düğmesi gizleniyor", /\.btn-nav-demo\s*\{[^}]*display:\s*none/.test(telefon),
        "gizlenmezse marka+2 düğme 375px'e sığmıyor (ölçüldü: 432px)");
    denetle("marka rozeti gizleniyor", /\.brand-badge\s*\{[^}]*display:\s*none/.test(telefon));
    denetle("giriş düğmesi küçültülüyor", /\.btn-nav-login\s*\{[^}]*font-size/.test(telefon));
}

console.log("\nDar telefon (max-width: 420px)");
denetle("blok mevcut", dar !== null, "@media (max-width: 420px) bulunamadı");
if (dar) {
    denetle("kartlar tek sütuna iniyor", /grid-template-columns:\s*1fr/.test(dar));
    denetle("marka adı küçültülüyor", /\.brand-title\s*\{[^}]*font-size/.test(dar));
    denetle("kart min-width kilidi açılıyor", /min-width:\s*0/.test(dar),
        "320px'te kartlar 35px taşıyordu");
}

console.log("\n" + "=".repeat(66));
if (eksik.length === 0) {
    console.log(`✅ MOBİL KURALLAR YERİNDE — ${gecti} kontrol`);
} else {
    console.log(`⚠️  ${eksik.length} KURAL EKSİK (${gecti} kontrol geçti)`);
    eksik.forEach(e => console.log("   • " + e.ad + (e.ayrinti ? "\n     " + e.ayrinti : "")));
}
console.log("=".repeat(66));
process.exit(eksik.length === 0 ? 0 : 1);

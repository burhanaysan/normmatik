/*
 * LOGO BOYUTU TESTİ
 * =================
 * Hedef: js/uiComponents.js (+ varsa ../08_bulut_yonetimi/database.rules.json)
 *
 * NEDEN VAR (14.09.2026)
 * ----------------------
 * Antet logosu dosyadan OLDUĞU GİBİ metne çevrilip buluta yazılıyordu; bir
 * telefon fotoğrafı 5-10 MB'lık bir alan demekti. Sunucu kuralı artık logo
 * alanını 600 000 karakterle sınırlıyor. Uygulama logoyu küçültmezse ya da
 * kendi sınırı sunucununkinden büyük olursa, büyük logo seçen okulun BÜTÜN
 * kaydı reddedilir. Aynı kural iki yerde yazılı: bu test ikisini bağlar.
 *
 * Çalıştırma: node tools/test_logoBoyutu.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let gecti = 0;
const hatalar = [];
function denetle(ad, kosul, ayrinti = "") {
    if (kosul) { gecti++; console.log("  [GEÇTİ] " + ad); }
    else { hatalar.push(ad + "   " + ayrinti); console.log("  [KALDI] " + ad + "   " + ayrinti); }
}

console.log("LOGO BOYUTU TESTİ");
console.log("=".repeat(70));
const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");

denetle("L1 dosya içeriği doğrudan logoya yazılmıyor",
        !/uploadedLogoBase64\s*=\s*event\.target\.result/.test(ui),
        "FileReader sonucu küçültülmeden kaydediliyor");
denetle("L2 logo tuvalde küçültülüyor", /LOGO_AZAMI_KENAR/.test(ui) && /toDataURL\("image\/png"\)/.test(ui));
denetle("L3 büyük PNG JPEG'e çevriliyor", /toDataURL\("image\/jpeg"/.test(ui));
denetle("L4 JPEG için beyaz zemin (saydam alan siyah çıkmasın)", /fillStyle = "#ffffff"/.test(ui));

const kenar = Number((ui.match(/const LOGO_AZAMI_KENAR = (\d+);/) || [])[1]);
const sonSinir = Number((ui.match(/const LOGO_SON_SINIR = (\d+);/) || [])[1]);
denetle("L5 en uzun kenar makul (yazdırmada ~60 px basılıyor)", kenar >= 200 && kenar <= 600, String(kenar));
denetle("L6 son sınır tanımlı ve aşılınca kaydedilmiyor",
        sonSinir > 0 && /veri\.length > LOGO_SON_SINIR/.test(ui), String(sonSinir));

// Sunucu kuralı (proje klasöründe; herkese açık depoda yoksa bu bölüm atlanır)
const kuralYolu = path.join(KOK, "..", "08_bulut_yonetimi", "database.rules.json");
if (fs.existsSync(kuralYolu)) {
    const kural = fs.readFileSync(kuralYolu, "utf8");
    const m = kural.match(/"logoBase64"\s*:\s*\{\s*"\.validate"\s*:\s*"[^"]*length <= (\d+)/);
    const sunucu = m ? Number(m[1]) : NaN;
    denetle("L7 sunucu kuralı logo alanını sınırlıyor", Number.isFinite(sunucu), "kuralda logoBase64 sınırı bulunamadı");
    denetle("L8 uygulamanın sınırı sunucununkinden KÜÇÜK", sonSinir < sunucu,
            "uygulama " + sonSinir + " / sunucu " + sunucu + " — eşit ya da büyükse büyük logo bütün kaydı reddettirir");
} else {
    console.log("  [ATLANDI] sunucu kuralı dosyası yok: " + kuralYolu);
}

console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ LOGO BOYUTU HATALI — " + hatalar.length + " hata, " + gecti + " geçti");
    for (const h of hatalar) console.log("   • " + h);
    process.exit(1);
}
console.log("✅ LOGO BOYUTU DOĞRU — " + gecti + " kontrol başarılı, 0 hata");

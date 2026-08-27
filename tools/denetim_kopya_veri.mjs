/*
 * KOPYA VERİ DENETİMİ
 * ===================
 * Bu proje aynı veriyi birden çok yerde tuttuğu için iki kez tuzağa düştü:
 *
 *   1) Müfredat ÜÇ yerdeydi: curriculumEngine.js, state.js'teki demo şubeler,
 *      ve ders adı eşleme tablosu. curriculumEngine düzeltildi, ama demo okul
 *      kendi elle yazılmış listesini göstermeye devam etti — hayalet "Almanca"
 *      dersi ekranda kaldı. Düzeltme yapıldı sanıldı, oysa ulaşmamıştı.
 *
 *   2) Demo okulun adı BEŞ yerdeydi: state.js, uiComponents.js, app.js,
 *      authService.js, index.html. İlk ikisi değiştirildi, ekranda hiçbir şey
 *      değişmedi; çünkü demo girişi diğer üçünü kullanıyordu.
 *
 * İkisinin de ortak yanı: değişiklik SESSİZCE etkisiz kaldı. Hata vermedi,
 * test kırılmadı, yalnızca ekran eski hâlinde kaldı. En zor fark edilen hata
 * türü budur.
 *
 * Bu denetim, aynı verinin yeniden çoğalmasını yakalar.
 *
 * Çalıştırma: node tools/denetim_kopya_veri.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

let gecti = 0;
const bulgular = [];
function denetle(ad, kosul, ayrinti = "") {
    if (kosul) { gecti++; return; }
    bulgular.push({ ad, ayrinti });
}

/** js/ ve kök dizindeki kaynak dosyalar (üretilmiş paket ve yedekler hariç). */
function kaynakDosyalar() {
    const liste = [];
    for (const d of fs.readdirSync(path.join(KOK, "js")))
        if (d.endsWith(".js") && d !== "bundle.js") liste.push("js/" + d);
    for (const d of fs.readdirSync(KOK))
        if (d.endsWith(".html") && !d.startsWith("_yedek")) liste.push(d);
    return liste;
}

const DOSYALAR = kaynakDosyalar().map(p => ({
    yol: p, metin: fs.readFileSync(path.join(KOK, p), "utf8")
}));

console.log("KOPYA VERİ DENETİMİ");
console.log("=".repeat(70));
console.log("taranan dosya: " + DOSYALAR.length);

// --------------------------------------------------------------------------
// 1. Elle yazılmış ders listesi yalnızca curriculumEngine.js'te olmalı
// --------------------------------------------------------------------------
// `{ ders: "...", saat: N` kalıbı bir müfredat satırıdır. Başka bir dosyada
// görünüyorsa, orada müfredatın ikinci bir kopyası var demektir ve
// curriculumEngine'de yapılan düzeltme oraya ULAŞMAZ.
console.log("\n1. Müfredat satırı curriculumEngine.js dışında var mı?");
const DERS_KALIBI = /\{\s*ders:\s*"[^"]+",\s*saat:\s*\d+/g;
// ÜRETİLMİŞ dosyalar muaftır. Denetimin amacı ELLE yazılmış ikinci kopyaları
// yakalamak; bir üreteçten çıkan tablo tanım gereği tek kaynaklıdır ve
// kaynağı değiştiğinde yeniden üretilir. Muafiyet, dosyanın kendi başlığında
// "ÜRETİLMİŞTİR" demesine bağlıdır — yani muafiyeti dosya kendi beyan eder,
// buraya elle liste yazılmaz.
const URETILMIS = /ÜRETİLMİŞTİR/;
for (const d of DOSYALAR) {
    if (d.yol === "js/curriculumEngine.js") continue;
    if (URETILMIS.test(d.metin.slice(0, 1200))) continue;
    const n = (d.metin.match(DERS_KALIBI) || []).length;
    denetle(`${d.yol}: elle yazılmış ders satırı yok`, n === 0,
        `${n} satır bulundu — müfredatın ikinci kopyası olabilir`);
}

// --------------------------------------------------------------------------
// 2. Demo okul adı tek bir yazımda olmalı
// --------------------------------------------------------------------------
// Ad birden çok dosyada geçebilir (giriş, oturum, karşılama sayfası); sorun
// FARKLI yazımların bir arada bulunmasıdır — biri değişip diğeri kalırsa
// ekranda eski ad görünmeye devam eder.
console.log("2. Demo okul adı her yerde aynı mı?");
// Adın KENDİSİ aranır, içinde geçtiği cümle değil. Aksi hâlde bildirim
// metinleri ("🚀 ... verileri yüklendi!") ayrı bir admış gibi sayılır.
const adlar = new Map();
const AD_KALIBI = /[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜa-zçğıöşü]*\s+(?:Anadolu\s+)?(?:Lisesi|LİSESİ)(?:\s*\(Demo\))?|(?:DEMO|Demo)\s+(?:LİSESİ|Lisesi)/g;
for (const d of DOSYALAR)
    for (const m of d.metin.matchAll(/"([^"]{0,80})"/g)) {
        if (!/demo/i.test(m[1])) continue;
        for (const ad of m[1].match(AD_KALIBI) || []) {
            if (!adlar.has(ad)) adlar.set(ad, []);
            adlar.get(ad).push(d.yol);
        }
    }
denetle("demo okul adı tek yazımda", adlar.size <= 1,
    [...adlar.entries()].map(([a, y]) => `"${a}" -> ${y.join(", ")}`).join(" | "));

// --------------------------------------------------------------------------
// 3. Düzeltilmiş hatalar geri gelmiş mi?
// --------------------------------------------------------------------------
// Bu üçü, kaynaktan üretim sırasında bulunup düzeltilen somut hatalardır.
// Yeniden ortaya çıkarlarsa bir kopya daha var demektir.
console.log("3. Düzeltilmiş hatalar geri geldi mi?");
const GERI_GELMEMELI = [
    ["hayalet zorunlu Almanca dersi",
        /\{\s*ders:\s*"(?:İkinci Yabancı Dil \(Almanca\)|Almanca)",\s*saat:\s*2/],
    ["Sağlık Bilgisi'nin Biyoloji'ye yazılması",
        /Sağlık Bilgisi[^"]*",[^}]*Biyoloji|course: 'Sağlık Bilgisi[^']*', branch: 'Biyoloji'/],
    ["Trafik Güvenliği'nin Biyoloji'ye yazılması",
        /course: 'Trafik Güvenliği', branch: 'Biyoloji'/]
];
for (const [ad, kalip] of GERI_GELMEMELI) {
    const nerede = DOSYALAR.filter(d => kalip.test(d.metin)).map(d => d.yol);
    denetle(ad + " geri gelmemiş", nerede.length === 0, "bulunduğu yer: " + nerede.join(", "));
}

console.log("\n" + "=".repeat(70));
if (!bulgular.length) {
    console.log(`✅ KOPYA VERİ YOK — ${gecti} kontrol temiz`);
} else {
    console.log(`⚠️  ${bulgular.length} BULGU (${gecti} kontrol geçti)`);
    for (const b of bulgular)
        console.log("   • " + b.ad + (b.ayrinti ? "\n     " + b.ayrinti : ""));
}
console.log("=".repeat(70));
process.exit(bulgular.length ? 1 : 0);

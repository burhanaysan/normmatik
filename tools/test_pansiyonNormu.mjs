/* ===========================================================================
   NormMatik™ — Yatılı/Pansiyonlu kurum seçenekleri testi
   ===========================================================================
   NEDEN VAR (kullanıcı kararı, 05.09.2026)
   ----------------------------------------
   Kadro penceresinde tek bir "Yatılı veya Pansiyonlu Kurum" kutusu vardı ve
   iki ayrı maddeyi birbirine bağlıyordu:

       Md. 6/1-a   -> 1 Müdür Başyardımcısı
       Md. 14/1-a  -> +1 İlave Müdür Yardımcısı
       Md. 21/2-ç  -> 1 Rehber Öğretmen

   İki gerçek durum bu bağı yanlış kılıyordu:

   (a) Müdür başyardımcılığı ünvanı 7528 sayılı Öğretmenlik Mesleği Kanunu'nda
       geçmediği için uygulamada kapatılmıştı. Ama görev süresi bitene kadar
       okulda çalışmaya devam eden başyardımcılar var ve bunlar YALNIZCA
       yatılı/pansiyonlu kurumlarda bulunuyor. Elle bildirilebilmeli.

   (b) Bazı yatılı kurumlarda görev süresi biten başyardımcı AYRILDI; ama
       kurum yatılı olmaya devam ettiği için +1 müdür yardımcısı hakkı sürüyor.
       Tek kutuyla bu ikisi ayrılamıyordu.

   Artık iki ayrı seçenek var:
       isPansiyonluMdrYrd  -> Md. 14/1-a ve Md. 21/2-ç (kurum yatılı MI?)
       isPansiyonluBasyrd  -> Md. 6/1-a (görevi süren başyardımcı VAR MI?)
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
    alert() {},
};
ctx.globalThis = ctx;
w.dispatchEvent = () => true;
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8"), ctx);

const ne = w.normEngine;
if (typeof ne.calculateAdminNorms !== "function") olumcul("calculateAdminNorms yok.");

// İdareci için 300 öğrenci (temel 1 müdür yardımcısı),
// rehber için 100 öğrenci (eşiğin ALTINDA — böylece tek etken pansiyon olur).
const idareci = (o) => ne.calculateAdminNorms("anadolu_lisesi", 300, o);
const rehber = (o) => ne.calculateGuidanceCounselorNorm("anadolu_lisesi", 100, o);

/* ---- 0) Ölçüm geçerli mi? -------------------------------------------- */
{
    const a = idareci({});
    kontrol("temel müdür yardımcısı normu 1 (ölçüm geçerli)",
        a.mudurYardimcisiTotal === 1, String(a.mudurYardimcisiTotal));
    kontrol("rehber eşiğin altında 0 (ölçüm geçerli)",
        rehber({}).norm === 0, String(rehber({}).norm));
    kontrol("başyardımcı ünvanı varsayılan olarak kapalı",
        ne.mudurBasyardimcisiUnvaniYururlukte === false);
}

/* ---- 1) Dört kombinasyon --------------------------------------------- */
{
    const hicbiri = idareci({});
    kontrol("hiçbiri: başyardımcı 0", hicbiri.mudurBasyardimcisi === 0);
    kontrol("hiçbiri: müdür yardımcısı 1", hicbiri.mudurYardimcisiTotal === 1);

    // (b) Kurum yatılı, başyardımcı AYRILMIŞ: +1 müdür yardımcısı sürmeli.
    const yalnizYatili = idareci({ isPansiyonluMdrYrd: true });
    kontrol("yalnız yatılı: müdür yardımcısı 2 olur (Md. 14/1-a)",
        yalnizYatili.mudurYardimcisiTotal === 2,
        String(yalnizYatili.mudurYardimcisiTotal));
    kontrol("yalnız yatılı: başyardımcı VERİLMEZ",
        yalnizYatili.mudurBasyardimcisi === 0,
        String(yalnizYatili.mudurBasyardimcisi));
    kontrol("yalnız yatılı: rehber öğretmen 1 (Md. 21/2-ç)",
        rehber({ isPansiyonluMdrYrd: true }).norm === 1,
        String(rehber({ isPansiyonluMdrYrd: true }).norm));

    // (a) Görevi süren başyardımcı bildirildi.
    const yalnizBasyrd = idareci({ isPansiyonluBasyrd: true });
    kontrol("yalnız başyardımcı: 1 başyardımcı normu (Md. 6/1-a)",
        yalnizBasyrd.mudurBasyardimcisi === 1,
        String(yalnizBasyrd.mudurBasyardimcisi));
    kontrol("yalnız başyardımcı: müdür yardımcısı ARTMAZ",
        yalnizBasyrd.mudurYardimcisiTotal === 1,
        String(yalnizBasyrd.mudurYardimcisiTotal));
    kontrol("yalnız başyardımcı: rehber öğretmen ARTMAZ",
        rehber({ isPansiyonluBasyrd: true }).norm === 0);

    const ikisi = idareci({ isPansiyonluMdrYrd: true, isPansiyonluBasyrd: true });
    kontrol("ikisi de: başyardımcı 1", ikisi.mudurBasyardimcisi === 1);
    kontrol("ikisi de: müdür yardımcısı 2", ikisi.mudurYardimcisiTotal === 2);
    kontrol("ikisi de: rehber 1",
        rehber({ isPansiyonluMdrYrd: true, isPansiyonluBasyrd: true }).norm === 1);
}

/* ---- 2) GERİYE DÖNÜK UYUM -------------------------------------------- */
// Eski kayıtlarda yalnızca `isPansiyonlu` var. O okulların sayıları
// DEĞİŞMEMELİ: müdür yardımcısı ve rehber tarafı aynen sürmeli, başyardımcı
// ise bugün 0 ürettiği için 0 kalmalı. Aksi hâlde güncelleme, mevcut
// okullara sessizce +1 norm eklerdi.
{
    const eski = idareci({ isPansiyonlu: true });
    kontrol("eski kayıt: müdür yardımcısı 2 (davranış korunuyor)",
        eski.mudurYardimcisiTotal === 2, String(eski.mudurYardimcisiTotal));
    kontrol("eski kayıt: rehber 1 (davranış korunuyor)",
        rehber({ isPansiyonlu: true }).norm === 1);
    kontrol("eski kayıt: başyardımcı 0 (SESSİZ ARTIŞ YOK)",
        eski.mudurBasyardimcisi === 0, String(eski.mudurBasyardimcisi));

    const eskiKapali = idareci({ isPansiyonlu: false });
    kontrol("eski kayıt kapalı: müdür yardımcısı 1",
        eskiKapali.mudurYardimcisiTotal === 1);
    kontrol("eski kayıt kapalı: rehber 0", rehber({ isPansiyonlu: false }).norm === 0);

    // Yeni alan varsa eskisi YOK SAYILMALI (çelişkili veri gelirse yeni kazanır).
    const celiskili = idareci({ isPansiyonlu: true, isPansiyonluMdrYrd: false });
    kontrol("yeni alan eski alanı geçersiz kılıyor",
        celiskili.mudurYardimcisiTotal === 1, String(celiskili.mudurYardimcisiTotal));
}

/* ---- 3) Başyardımcının diğer sınırları korunuyor mu? ----------------- */
// Md. 6/2: eğitim kampüsü içindeki kuruma başyardımcı normu verilmez.
// Md. 22/1-a: müdür normu olmayan kuruma da verilmez.
{
    const kampus = idareci({ isPansiyonluBasyrd: true, isKampusIcinde: true });
    kontrol("kampüs içindeki kuruma başyardımcı verilmiyor (Md. 6/2)",
        kampus.mudurBasyardimcisi === 0, String(kampus.mudurBasyardimcisi));

    // Müdür normu sıfır öğrenciyle sıfırlanmaz — her bağımsız kuruma 1 müdür
    // normu verilir (Md. 5/1). Müdürsüz durumu üreten gerçek şart Md. 5/3:
    // aynı binadaki kurumlardan öğrencisi en fazla olan bu okul değilse.
    const mudursuz = ne.calculateAdminNorms("anadolu_lisesi", 400,
        { isPansiyonluBasyrd: true, isAyniBinadaKucuk: true });
    kontrol("ölçüm geçerli: aynı binadaki küçük kurumda müdür normu 0 (Md. 5/3)",
        mudursuz.mudur === 0, "müdür normu " + mudursuz.mudur);
    kontrol("müdür normu olmayan kuruma başyardımcı verilmiyor (Md. 22/1-a)",
        mudursuz.mudurBasyardimcisi === 0, String(mudursuz.mudurBasyardimcisi));
}

/* ---- 3b) Norm üretiliyorsa arayüz/rapor satırı GÖRÜNMELİ -------------- */
/* Ünvan genel olarak kapalı olduğu için arayüz ve raporlar başyardımcı
   satırını `mudurBasyardimcisiAktif === false` bayrağına bakarak gizliyor.
   Kutu işaretlendiğinde norm üretilip satır yine gizli kalırsa, okul
   girdiği bilgiyi hiçbir yerde göremez. (Kullanıcı bildirimi, 05.09.2026.) */
{
    const acik = idareci({ isPansiyonluBasyrd: true });
    kontrol("başyardımcı bildirildiğinde satır görünür oluyor",
        acik.mudurBasyardimcisiAktif === true, String(acik.mudurBasyardimcisiAktif));
    kontrol("bildirilen başyardımcı karşılaştırma tablosuna da giriyor",
        acik.karsilastirma && acik.karsilastirma.mudurBasyardimcisi.norm === 1,
        JSON.stringify(acik.karsilastirma && acik.karsilastirma.mudurBasyardimcisi));

    const kapali = idareci({ isPansiyonluMdrYrd: true });
    kontrol("bildirilmediğinde satır yine gizli (ünvan kapalı)",
        kapali.mudurBasyardimcisiAktif === false, String(kapali.mudurBasyardimcisiAktif));
}

/* ---- 4) Arayüzde iki ayrı kutu var mı? ------------------------------- */
{
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    kontrol("yatılı kutusu duruyor", /id="chk-admin-pansiyon"/.test(ui));
    kontrol("başyardımcı kutusu eklendi", /id="chk-admin-pansiyon-basyrd"/.test(ui));
    kontrol("yeni alan adları kaydediliyor",
        /isPansiyonluMdrYrd:/.test(ui) && /isPansiyonluBasyrd:/.test(ui));
    kontrol("yatılı kutusunun açıklamasında artık başyardımcı yazmıyor",
        !/Yatılı veya Pansiyonlu Kurum<\/strong>[\s\S]{0,200}Müdür Başyardımcısı/.test(ui));

    // Kutu işaretlenince "mevcut başyardımcı" sayısı da girilebilmeli;
    // eskiden bu alan `type="hidden"` ve sabit 0 idi.
    kontrol("mevcut başyardımcı alanı artık gizli/sabit 0 değil",
        !/<input type="hidden" id="inp-mevcut-basyrd"/.test(ui));
    kontrol("mevcut başyardımcı alanı sayı girişi olarak duruyor",
        /id="inp-mevcut-basyrd"[^>]*min="0"/.test(ui)
        || /type="number" id="inp-mevcut-basyrd"/.test(ui));
    kontrol("alanın görünürlüğü kutuya bağlandı",
        /wrap-mevcut-basyrd/.test(ui) && /syncBasyrdSutunu/.test(ui));

    // Kutu, canlı önizleme dinleyicilerine eklenmemişti: işaretlenince
    // pencere içindeki norm önizlemesi güncellenmiyordu.
    kontrol("başyardımcı kutusu canlı önizlemeyi tetikliyor",
        /"chk-admin-pansiyon-basyrd",/.test(ui));
}

/* ---- 5) Raporlar satırı bayrağa göre gösteriyor mu? ------------------- */
{
    const re = fs.readFileSync(path.join(KOK, "js", "reportsEngine.js"), "utf8");
    kontrol("Excel/CSV çıktısı başyardımcı satırını bayrağa bağlıyor",
        (re.match(/mudurBasyardimcisiAktif !== false/g) || []).length >= 2);
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ PANSİYON NORMU HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ PANSİYON NORMU DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

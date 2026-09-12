/* ===========================================================================
   NormMatik — WHATSAPP MESAJI TEK KAYNAKTAN GELİR   (13.09.2026)

   NEDEN VAR
   ---------
   Lisans için hazır WhatsApp mesajı İKİ ayrı yerde, elle yazılıydı:
     • karşılama sayfası  -> kısa, boş şablon (kişi kendi okulunu yazar)
     • lisans penceresi   -> formdaki okul bilgilerini mesaja gömen uzun metin

   İkincisi DEMO'da SAHTE veri gönderiyordu. Kullanıcının bulgusu
   (13.09.2026): demodan gelen her lisans talebinde satıcıya

       "MEB Kurum Kodu: 123457
        Okul Adı: DEMO MESLEKİ VE TEKNİK ANADOLU LİSESİ
        İl / İlçe: ANKARA / ÇANKAYA"

   yazıyordu. Kullanıcının kararı: "hepsi ilk mesaj gibi olsun."

   BU TEST ŞUNLARI BAĞLAR
     1. Tek kaynak js/iletisim.js'tir.
     2. Uygulama içindeki düğme ile karşılama sayfasındaki bağlantı
        BİREBİR aynı adresi üretir.
     3. Mesaj okul bilgisi GÖMMEZ — demoda sahte veri gitmez.
     4. Telefon numarası da tek kaynaktan gelir.

   ÇALIŞTIRMA: node tools/test_iletisim.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const oku = (...y) => fs.readFileSync(path.join(KOK, ...y), "utf8");

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};

const iletisimJs = oku("js", "iletisim.js");
const uiJs = oku("js", "uiComponents.js");
const bundle = oku("js", "bundle.js");

/* ---- 1) Tek kaynak var ve pakete girmiş ------------------------------- */
kontrol("js/iletisim.js telefon taşıyor", /telefon:\s*"\d{10,}"/.test(iletisimJs));
kontrol("js/iletisim.js lisans mesajı taşıyor", /lisansMesaji:/.test(iletisimJs));
kontrol("paket yeniden üretilmiş", bundle.includes("NORMMATIK_ILETISIM"));
kontrol("paket listesinde iletisim.js var",
    /"iletisim\.js"/.test(oku("tools", "build_bundle.py")));
kontrol("HTML tarafını hizalayan kod var",
    /def whatsapp_senkronize\(\)/.test(oku("tools", "build_bundle.py")));

/* ---- 2) Lisans penceresi okul bilgisi GÖMMÜYOR ------------------------ */
kontrol("lisans penceresi tek kaynaktan bağlantı üretiyor",
    /normmatikWhatsappBaglantisi\(\)/.test(uiJs));
kontrol("mesaja 'MEB Kurum Kodu' gömülmüyor",
    !/OKUL LİSANSI TALEBİ[\s\S]{0,200}MEB Kurum Kodu: \$\{/.test(uiJs));
kontrol("mesaja okul adı gömülmüyor",
    !/\* Okul Adı: \$\{oAdi\}/.test(uiJs));
kontrol("wa.me adresi artık elle kurulmuyor",
    !/https:\/\/wa\.me\/\d+\?text=\$\{encodeURIComponent/.test(uiJs));

/* ---- 3) Uygulama ile karşılama sayfası BİREBİR aynı ------------------- */
{
    const ctx = { window: {}, module: undefined };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext(iletisimJs, ctx);
    const uygulamaUrl = vm.runInContext("normmatikWhatsappBaglantisi()", ctx);

    kontrol("uygulama bağlantısı üretildi", typeof uygulamaUrl === "string"
        && uygulamaUrl.startsWith("https://wa.me/"), String(uygulamaUrl).slice(0, 40));

    // Karşılama ve SEO sayfalarındaki LİSANS bağlantıları
    const sayfalar = ["index.html", "ders-yuku-hesaplama.html",
                      "norm-kadro-hesaplama.html", "meslek-lisesi-norm-kadro.html"];
    let bulunan = 0;
    const sapan = [];
    for (const ad of sayfalar) {
        const metin = oku(ad);
        for (const m of metin.matchAll(/https:\/\/wa\.me\/[^"']+/g)) {
            const adres = m[0];
            // Yalnızca LİSANS bağlantıları; "şifremi unuttum" ayrı mesajdır.
            if (!/lisans/i.test(decodeURIComponent(adres))) continue;
            bulunan++;
            if (adres !== uygulamaUrl) sapan.push(ad + ": " + adres.slice(0, 60));
        }
    }
    kontrol("lisans bağlantıları bulundu", bulunan >= 4, String(bulunan));
    kontrol("HTML bağlantıları uygulamayla BİREBİR aynı", sapan.length === 0,
        sapan.slice(0, 2).join(" | "));

    /* ---- 4) Mesajın içinde sahte demo verisi YOK --------------------- */
    const mesaj = decodeURIComponent(uygulamaUrl.split("text=")[1] || "");
    kontrol("mesajda demo kurum kodu yok", !mesaj.includes("123457"), mesaj);
    kontrol("mesajda demo okul adı yok", !/DEMO MESLEK/i.test(mesaj), mesaj);
    kontrol("mesaj okulun kendi yazacağı boş alanları taşıyor",
        /Okul:/.test(mesaj) && /Kurum kodu:/.test(mesaj) && /İl\/İlçe:/.test(mesaj),
        mesaj);
}

/* ---- 5) Telefon de tek kaynaktan -------------------------------------- */
kontrol("lisans penceresindeki telefon tek kaynaktan",
    /iletisimBilgi\.telefon/.test(uiJs));
kontrol("penceredeki telefon elle yazılı değil",
    !/WhatsApp ile Lisans Al {2}·{1} {2}\+90/.test(uiJs));

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ WHATSAPP MESAJI AYRIŞMIŞ — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ WHATSAPP MESAJI TEK KAYNAKTAN — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

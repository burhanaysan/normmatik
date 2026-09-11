/**
 * NormMatik — OTURUM SÜREKLİLİĞİ ve "⋯ DİĞER" MENÜSÜ TESTİ  (12.09.2026)
 *
 * NEDEN VAR
 * ---------
 * İki kullanıcı isteği aynı gün karşılandı ve ikisi de sessizce bozulabilir:
 *
 *   1) "Bu cihazda açık kal" — uygulama yılda birkaç kez kullanıldığı için
 *      şifre unutuluyor. İşaretlenirse kimlik localStorage'da durur ve
 *      tarayıcı kapansa da oturum sürer.
 *
 *      KRİTİK: bu İSTEĞE BAĞLI olmalı. Kutu varsayılan olarak işaretli
 *      gelirse, ortak kullanılan okul bilgisayarlarında oturum herkese açık
 *      kalır. Test bunu bağlıyor.
 *
 *      KRİTİK 2: kimlik ve oturum kaydı AYNI depoya yazılmalı. Ayrı
 *      depolara yazılırsa biri kapanışta silinir, öteki kalır ve kullanıcı
 *      "giriş yapmış ama boş ekran" durumuna düşer.
 *
 *   2) Üst başlıktaki düğmeler dar ekranda görünmez oluyordu; seyrek
 *      kullanılan dördü "⋯ Diğer" menüsüne alındı. Hiçbiri SİLİNMEDİ —
 *      test, dördünün de hâlâ var olduğunu doğruluyor.
 *
 * ÇALIŞTIRMA:  node tools/test_oturumSurekliligi.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const oku = (...p) => fs.readFileSync(path.join(KOK, ...p), "utf8");

let gecti = 0;
const hatalar = [];
const denetle = (ad, kosul, ayrinti = "") => {
    if (kosul) gecti++;
    else hatalar.push(`${ad}${ayrinti ? "  -> " + ayrinti : ""}`);
};

const index = oku("index.html");
const authJs = oku("js", "authService.js");
const fbJs = oku("js", "firebaseAuth.js");
const appJs = oku("js", "app.js");
const bundle = oku("js", "bundle.js");

// --- 1. Giriş ekranındaki seçenek ---------------------------------------
denetle("giriş ekranında 'açık kal' kutusu var", index.includes('id="auth-kalici"'));
denetle("ortak bilgisayar uyarısı yazıyor",
    /Ortak kullan[ıi]lan bilgisayarlarda i[şs]aretlemeyin/i.test(index));

const kutuSatiri = (index.match(/<input[^>]*id="auth-kalici"[^>]*>/) || [""])[0];
denetle("kutu VARSAYILAN OLARAK İŞARETSİZ", !/\bchecked\b/.test(kutuSatiri),
    kutuSatiri.slice(0, 120));

denetle("kip seçime göre belirleniyor",
    /kaliciOturum\s*\?\s*localStorage\s*:\s*sessionStorage/.test(index));
denetle("kimlik seçilen depoya yazılıyor",
    /oturumDeposu\.setItem\("normmatik_fb_kimlik"/.test(index));
denetle("oturum kaydı da AYNI depoya yazılıyor",
    /oturumDeposu\.setItem\("normmatik_active_session"/.test(index));
denetle("kimlik kaydında kip saklanıyor", /kalici:\s*kaliciOturum/.test(index));
denetle("gerçek girişte sabit sessionStorage yazımı kalmadı",
    !/sessionStorage\.setItem\("normmatik_fb_kimlik"/.test(index));
// DEMO farklıdır ve öyle KALMALI: demo oturumu kalıcı olmamalı, tarayıcı
// kapanınca bitmeli. (Demo yolu kimlik jetonu da yazmaz, buluta bağlanmaz.)
denetle("demo oturumu kalıcı DEĞİL",
    /demoBaslat[\s\S]{0,400}sessionStorage\.setItem\("normmatik_active_session"/.test(index)
    && !/demoBaslat[\s\S]{0,400}localStorage\.setItem\("normmatik_active_session"/.test(index));

// --- 2. Oturum servisi ---------------------------------------------------
denetle("getSession önce oturumluk, sonra kalıcı depoyu okuyor",
    /sessionStorage\.getItem\(this\.SESSION_KEY\)[\s\S]{0,80}localStorage\.getItem\(this\.SESSION_KEY\)/.test(authJs));
denetle("setSession kipe göre depo seçiyor",
    /\(kalici\s*\?\s*localStorage\s*:\s*sessionStorage\)\.setItem/.test(authJs));
denetle("setSession öteki depodaki kalıntıyı siliyor",
    /\(kalici\s*\?\s*sessionStorage\s*:\s*localStorage\)\.removeItem/.test(authJs));
denetle("çıkışta oturum anahtarı korunanlar listesinde DEĞİL",
    !/KORUNANLAR[\s\S]{0,200}normmatik_active_session/.test(authJs));

// --- 3. Kimlik servisi ---------------------------------------------------
denetle("girisYap kalıcı kipi alıyor", /girisYap\(kurumKodu,\s*parola,\s*kalici\s*=\s*false\)/.test(fbJs));
denetle("kimlik kaydında kip var", /kalici:\s*!!kalici/.test(fbJs));
denetle("_oku iki depoya da bakıyor",
    /_depoOku\(OTURUMLUK\)\s*\|\|\s*_depoOku\(KALICI\)/.test(fbJs));
denetle("çıkışta İKİ depo da temizleniyor",
    /_depoSil\(OTURUMLUK\)[\s\S]{0,60}_depoSil\(KALICI\)/.test(fbJs));

// --- 4. "⋯ Diğer" menüsü -------------------------------------------------
denetle("⋯ Diğer düğmesi var", appJs.includes('id="btn-header-more"'));
denetle("menü kutusu var", appJs.includes('id="header-more-menu"'));
for (const [ad, kimlik] of [["Lisans", "btn-open-license"], ["Rehber", "btn-open-onboarding"],
                            ["Geçmiş", "btn-surum-gecmisi"], ["KVKK", "btn-open-kvkk"]]) {
    denetle(`${ad} düğmesi silinmedi`, appJs.includes(`id="${kimlik}"`));
}
denetle("menü dışarı tıklayınca/Esc ile kapanıyor",
    /Escape/.test(appJs) && /header-more-menu/.test(appJs));
denetle("menü yeniden çizimde dinleyici biriktirmiyor",
    /_digerMenuKapatici/.test(appJs));

// --- 5. Paket güncel mi --------------------------------------------------
denetle("bundle.js yeniden üretilmiş (menü)", bundle.includes("header-more-menu"));
denetle("bundle.js yeniden üretilmiş (kalıcı kip)", bundle.includes("_depoOku"));

// --- sonuç ---------------------------------------------------------------
if (hatalar.length === 0) {
    console.log(`✅ OTURUM SÜREKLİLİĞİ DOĞRU — ${gecti} kontrol başarılı, 0 hata`);
    process.exit(0);
}
console.log(`❌ OTURUM SÜREKLİLİĞİ — ${gecti} başarılı, ${hatalar.length} HATA`);
for (const h of hatalar) console.log("   x " + h);
process.exit(1);

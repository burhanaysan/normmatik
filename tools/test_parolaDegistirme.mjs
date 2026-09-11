/**
 * NormMatik — PAROLA DEĞİŞTİRME EKRANI TESTİ  (12.09.2026)
 *
 * NEDEN VAR
 * ---------
 * 12.09.2026 kararı: okulun parolasını ARTIK BİZ ÜRETMİYORUZ. Okul kendi
 * parolasını bir bağlantıyla kurar ve uygulamadan istediği zaman değiştirir.
 * Bunun iki sonucu var ve ikisi de sessizce bozulabilir:
 *
 *   1) Uygulamada "Şifre" düğmesi olmazsa, okul parolasını değiştiremez ve
 *      her seferinde bize yazmak zorunda kalır (kararın amacı boşa çıkar).
 *   2) Parola değiştirme, MEVCUT parolayı sormadan çalışırsa, açık unutulmuş
 *      bir okul bilgisayarının başına geçen biri okulu kendi hesabına
 *      kilitleyebilir.
 *
 * Bu test ikisini de kalıcı olarak bağlar. Kaynak dosyaları okur; tarayıcı
 * gerektirmez.
 *
 * ÇALIŞTIRMA:  node tools/test_parolaDegistirme.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const oku = (...p) => fs.readFileSync(path.join(KOK, ...p), "utf8");

let gecti = 0;
const hatalar = [];

function denetle(ad, kosul, ayrinti = "") {
    if (kosul) {
        gecti++;
    } else {
        hatalar.push(`${ad}${ayrinti ? "  -> " + ayrinti : ""}`);
    }
}

const appJs = oku("js", "app.js");
const uiJs = oku("js", "uiComponents.js");
const authJs = oku("js", "firebaseAuth.js");
const bundle = oku("js", "bundle.js");

// --- 1. Düğme ve bağlantısı ---------------------------------------------
denetle("app.js içinde 'Şifre' düğmesi var",
    appJs.includes('id="btn-parola-degistir"'));
denetle("düğme bir olaya bağlı",
    /getElementById\("btn-parola-degistir"\)\s*\?\.addEventListener/.test(appJs));
denetle("düğme parola penceresini açıyor",
    /btn-parola-degistir[\s\S]{0,240}openParolaDegistirModal\(\)/.test(appJs));

// --- 2. Pencerenin kendisi ----------------------------------------------
denetle("openParolaDegistirModal tanımlı",
    /^\s{4}openParolaDegistirModal\s*\(\)\s*\{/m.test(uiJs));

// DİKKAT: bitiş sınırı, başlangıçtan SONRA aranmalı. "openResetSchoolConfirmModal()"
// dosyada daha yukarıda bir çağrı olarak da geçiyor; düz indexOf ile blok boş çıkar.
const modalBasi = uiJs.indexOf("openParolaDegistirModal()");
const modalSonu = uiJs.indexOf("openResetSchoolConfirmModal()", modalBasi + 1);
const modalBlok = (modalBasi > -1 && modalSonu > modalBasi)
    ? uiJs.slice(modalBasi, modalSonu) : "";
denetle("pencere gövdesi bulundu", modalBlok.length > 400,
    `uzunluk ${modalBlok.length}`);

denetle("mevcut parola soruluyor", modalBlok.includes("parola-mevcut"));
denetle("yeni parola iki kez soruluyor",
    modalBlok.includes("parola-yeni") && modalBlok.includes("parola-yeni2"));
denetle("parolalar tutmazsa uyarılıyor",
    /yeni\s*!==\s*yeni2/.test(modalBlok));
denetle("en az 8 karakter kuralı var",
    /yeni\.length\s*<\s*8/.test(modalBlok));

// En kritik sıra: ÖNCE mevcut parolayla doğrulama, SONRA değiştirme.
const iGiris = modalBlok.indexOf("girisYap(");
const iDegistir = modalBlok.indexOf("parolaDegistir(");
denetle("önce mevcut parolayla doğrulanıyor, sonra değiştiriliyor",
    iGiris > -1 && iDegistir > -1 && iGiris < iDegistir,
    `girisYap=${iGiris} parolaDegistir=${iDegistir}`);
denetle("doğrulama başarısızsa değişiklik yapılmıyor",
    /!giris\.basarili[\s\S]{0,220}return/.test(modalBlok));

// Parola hiçbir yere yazılmamalı (kayıt, depolama, adres).
denetle("parola localStorage'a yazılmıyor",
    !/localStorage\.setItem\([^)]*parola/i.test(modalBlok));
denetle("parola konsola yazılmıyor",
    !/console\.(log|info|warn)\([^)]*(parola|yeni)\b/i.test(modalBlok));

// --- 3. Kimlik servisi ---------------------------------------------------
denetle("firebaseAuth.parolaDegistir var",
    /async\s+parolaDegistir\s*\(/.test(authJs));
denetle("servis de en az 8 karakter zorluyor",
    /length\s*<\s*8/.test(authJs));
denetle("parola Google'a gönderiliyor (accounts:update)",
    authJs.includes("accounts:update"));
denetle("parola üretme/türetme kodu geri gelmemiş",
    !/computeSecureSchoolPassword|kurumKodu[\s\S]{0,40}sha256/i.test(authJs));

// --- 4. Paket güncel mi --------------------------------------------------
denetle("bundle.js yeniden üretilmiş (düğme)",
    bundle.includes("btn-parola-degistir"));
denetle("bundle.js yeniden üretilmiş (pencere)",
    bundle.includes("openParolaDegistirModal"));

// --- sonuç ---------------------------------------------------------------
if (hatalar.length === 0) {
    console.log(`✅ PAROLA DEĞİŞTİRME DOĞRU — ${gecti} kontrol başarılı, 0 hata`);
    process.exit(0);
}
console.log(`❌ PAROLA DEĞİŞTİRME — ${gecti} başarılı, ${hatalar.length} HATA`);
for (const h of hatalar) console.log("   x " + h);
process.exit(1);

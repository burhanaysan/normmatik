/* ===========================================================================
   NormMatik™ — SESSİZ YOL DENETİMİ
   ===========================================================================
   NEDEN VAR (kullanıcı sorusu, 05.09.2026)
   ----------------------------------------
   "Buna benzer sessiz yollar varsa nasıl bileceğiz?" Ölçüldüğünde veri kritik
   14 dosyada 27 blok bulunmuştu: hatayı tamamen yutan ya da yalnızca konsola
   yazan. Hiçbiri sınıflandırılmamıştı; hangisinin veri kaybettirebileceği
   bilinmiyordu.

   06.09.2026'da hepsi tek tek sınıflandırıldı:
     • kullanıcıya BİLDİRİLMESİ gerekenler bildirim kanalına bağlandı
       (uygulama başlatma hatası, e-Okul'da şubenin derslerinin çözülememesi,
        oturumun yazılamaması, özel veri tabanının okunamaması)
     • BİLİNÇLİ olanların gerekçesi koda YAZILDI

   Bu test kuralı kalıcı kılar:

       Veri kritik bir dosyaya, GEREKÇESİ YAZILMAMIŞ yeni bir sessiz yakalama
       bloğu eklenirse KIRMIZI YANAR.

   Gerekçe, blok içindeki bir yorum ya da catch satırının hemen üstündeki bir
   yorumdur. Amaç sessizliği yasaklamak değil; sessizliğin BİLİNÇLİ olduğunu
   ve sebebinin yazıldığını garanti etmek.

   Çalıştırma: node tools/test_sessizYollar.mjs
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

const KRITIK = ["app.js", "state.js", "cloudDatabaseService.js", "authService.js",
    "firebaseAuth.js", "licenseClientManager.js", "licenseCore.js", "database.js",
    "eOkulImporter.js", "liveUpdateSyncEngine.js", "normEngine.js",
    "curriculumEngine.js", "reportsEngine.js", "uiComponents.js"];

/* ---- catch bloklarını çıkar ------------------------------------------- */
function govdeAl(s, i) {
    let d = 0, j = i;
    while (j < s.length) {
        if (s[j] === "{") d++;
        else if (s[j] === "}") { d--; if (d === 0) return s.slice(i + 1, j); }
        j++;
    }
    return "";
}

const bloklar = [];
for (const f of KRITIK) {
    const p = path.join(KOK, "js", f);
    if (!fs.existsSync(p)) continue;
    const s = fs.readFileSync(p, "utf8");
    const re = /\bcatch\s*\([^)]*\)\s*\{/g;
    let m;
    while ((m = re.exec(s)) !== null) {
        const govde = govdeAl(s, m.index + m[0].length - 1);
        const satir = s.slice(0, m.index).split("\n").length;

        const yorumVar = /\/\/|\/\*/.test(govde);
        const kod = govde.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();

        let tur = "isleyen";
        if (!kod) tur = "bos";
        else if (/^(console\.(log|warn|error|debug)\([^;]*\);?\s*)+$/.test(kod)) tur = "log";

        // Gerekçe: blok içinde ya da catch satırının hemen üstünde yorum.
        const oncekiSatirlar = s.slice(0, m.index).split("\n").slice(-4)
            .map(l => l.trim());
        const ustYorum = oncekiSatirlar.some(l => l.startsWith("//") || l.startsWith("*"));

        bloklar.push({ dosya: f, satir, tur, gerekce: yorumVar || ustYorum });
    }
}

/* ---- 0) Ölçüm geçerli mi? --------------------------------------------- */
kontrol("ölçüm geçerli: kritik dosyalarda catch blokları bulundu",
    bloklar.length > 20, bloklar.length + " blok");
kontrol("ölçüm geçerli: sessiz blok sınıfı gerçekten var",
    bloklar.some(b => b.tur !== "isleyen"));

/* ---- 1) ASIL KURAL: gerekçesiz sessiz blok yok ------------------------- */
{
    const sessiz = bloklar.filter(b => b.tur !== "isleyen");
    const gerekcesiz = sessiz.filter(b => !b.gerekce);
    kontrol("her sessiz yakalama bloğunun GEREKÇESİ yazılı",
        gerekcesiz.length === 0,
        gerekcesiz.map(b => b.dosya + ":" + b.satir).join(", "));
}

/* ---- 2) Bildirilmesi gerekenler gerçekten bildiriliyor mu? ------------- */
/* Sınıflandırmada "kullanıcıya söylenmeli" denen dört yol. Biri sessizliğe
   geri dönerse burada yakalanır. */
{
    const oku = (f) => fs.readFileSync(path.join(KOK, "js", f), "utf8");

    const app = oku("app.js");
    kontrol("uygulama başlatma hatası kullanıcıya gösteriliyor",
        /Uygulama başlatma hatası/.test(app)
        && /Uygulama tam olarak açılamadı/.test(app),
        "yalnızca console.error kalmışsa müdür bomboş ekranla kalır");

    const eokul = oku("eOkulImporter.js");
    kontrol("e-Okul: dersleri çözülemeyen şube kullanıcıya bildiriliyor",
        /dersHatasi/.test(eokul) && /DERSSİZ aktarıldı/.test(eokul),
        "sessiz kalırsa o şube 0 saat görünür ve norm eksik çıkar");
    kontrol("e-Okul: ders hatası mevcut uyarı kanalına bağlanmış",
        /let dalWarning = dersHatasi \|\| null;/.test(eokul));

    const auth = oku("authService.js");
    kontrol("oturum yazılamazsa kullanıcıya bildiriliyor",
        /Oturum bilgisi bu tarayıcıya yazılamadı/.test(auth));

    const db = oku("database.js");
    kontrol("özel veri tabanı okunamazsa kullanıcıya bildiriliyor",
        /Yüklediğiniz özel veri tabanı okunamadı/.test(db),
        "sessiz kalırsa kullanıcı kendi verisinin etkin olduğunu sanır");
}

/* ---- 3) ÇIKIŞTA YEREL YEDEK SİLİNMEMELİ -------------------------------- */
/* 06.09.2026'da bulundu: logout() düpedüz localStorage.clear() yapıyordu ve
   aynı gün eklenen yerel çalışma yedeğini HER ÇIKIŞTA siliyordu. Yani bulut
   kaydı sessizce reddedilmiş bir müdür, çıkış yaptığı anda çalışmasını
   kaybediyordu — güvenlik ağı tam da işe yarayacağı senaryoda yok oluyordu. */
{
    const auth = fs.readFileSync(path.join(KOK, "js", "authService.js"), "utf8");
    kontrol("çıkışta yerel çalışma yedeği korunuyor",
        /normmatik_yerel_/.test(auth) && /localStorage\.key\(i\)/.test(auth),
        "logout() yedeği siliyorsa yerel kalıcılığın hükmü kalmaz");

    // Davranış denetimi: taklit bir localStorage ile gerçek logout'u çalıştır.
    const gecici = new Map([
        ["normmatik_yerel_123999", '{"veri":{"subeler":[1,2,3]}}'],
        ["MEB_NORM_KADRO_LAYOUT_V1", "{}"],
        ["normmatik_active_session", "silinmeli"],
        ["baska_bir_okul_izi", "silinmeli"]
    ]);
    const sahteYerel = {
        get length() { return gecici.size; },
        key: (i) => [...gecici.keys()][i],
        getItem: (k) => (gecici.has(k) ? gecici.get(k) : null),
        setItem: (k, v) => gecici.set(k, String(v)),
        removeItem: (k) => { gecici.delete(k); },
        clear: () => gecici.clear()
    };

    // logout() gövdesindeki temizlik bölümünü ayıklayıp çalıştırıyoruz:
    // tüm sınıfı kurmak yerine yalnızca ilgili mantığı sınıyoruz.
    const bas = auth.indexOf("const KORUNANLAR = [");
    const son = auth.indexOf("sessionStorage.clear()", bas);
    kontrol("ölçüm geçerli: logout temizlik bölümü bulundu", bas > 0 && son > bas);
    if (bas > 0 && son > bas) {
        const parca = auth.slice(bas, son).replace(/^\s*try\s*\{/m, "").trim();
        const govde = parca.replace(/\}\s*catch[\s\S]*$/, "");
        const calistir = new Function("localStorage", govde + "\nreturn true;");
        let ok = true;
        try { calistir(sahteYerel); } catch (e) { ok = false; }
        kontrol("logout temizliği hatasız çalıştı", ok);
        kontrol("ÇIKIŞTAN SONRA yerel çalışma yedeği DURUYOR",
            gecici.has("normmatik_yerel_123999"),
            "kalanlar: " + [...gecici.keys()].join(", "));
        kontrol("çıkıştan sonra görünüm tercihi de duruyor",
            gecici.has("MEB_NORM_KADRO_LAYOUT_V1"));
        kontrol("çıkıştan sonra okul oturum izi SİLİNDİ",
            !gecici.has("normmatik_active_session") && !gecici.has("baska_bir_okul_izi"),
            "kalanlar: " + [...gecici.keys()].join(", "));
    }
}

/* ---- 5) SESSİZ DÜĞME DENETİMİ ----------------------------------------- */
/* NEDEN VAR (kullanıcı bildirimi, 06.09.2026)
   "şube sildim, o kutucuk gelmedi."

   Şube SİLME ve KOPYALAMA dinleyicilerinde hiç geri bildirim yoktu:
   kullanıcı işlemin olup olmadığını ancak listeye bakarak anlıyordu.
   Diğer bütün durum değiştiren işlemlerde bildirim vardı; bu ikisi atlanmıştı.

   KURAL: durumu değiştiren bir olay dinleyicisi, kullanıcıya GÖRÜNÜR bir
   şey yapmalı. Görünür sayılanlar: bildirim, pencere, onay kutusu,
   yönlendirme, yeniden çizim, bir öğenin görünümünü değiştirme...

   Amaç her düğmeye bildirim koydurmak DEĞİL: panel açma/kapama zaten gözün
   önünde olur, oraya bildirim koymak gürültü olurdu. Amaç, hiçbir izi
   olmayan bir işlemin fark edilmeden eklenmemesi. */
{
    // DİKKAT: confirm() ve prompt() BURAYA GİRMEZ. İkisi de işlemden ÖNCE
    // çıkan sorulardır; sonucu bildirmezler. Onları "görünür geri bildirim"
    // saymak, silme dinleyicisindeki eksikliği gizliyordu — doğrulama
    // sırasında yakalandı (06.09.2026).
    const GORUNUR = ["showToast", "Modal", "alert(",
        "location.href", "window.open", "window.print", "classList",
        "style.display", "render", "remove()", "focus()", "click()",
        "innerHTML", "textContent", "value =", "disabled", "applyLayoutStyles"];

    const govdeAl2 = (s, i) => {
        let d = 0;
        for (let j = i; j < s.length; j++) {
            if (s[j] === "{") d++;
            else if (s[j] === "}") { d--; if (d === 0) return s.slice(i, j + 1); }
        }
        return "";
    };

    const sessizler = [];
    let dinleyiciSayisi = 0;
    for (const dosya of ["app.js", "uiComponents.js"]) {
        const s = fs.readFileSync(path.join(KOK, "js", dosya), "utf8");
        const re = /addEventListener\(\s*["'](?:click|change|input|submit)["']\s*,/g;
        let m;
        while ((m = re.exec(s)) !== null) {
            const k = s.indexOf("{", m.index + m[0].length);
            if (k < 0) continue;
            const govde = govdeAl2(s, k);
            if (!govde || govde.length > 7000) continue;
            dinleyiciSayisi++;

            const degistirir = govde.includes("notify(")
                || /\b(?:appState|this\.state)\.(?:add|delete|update|set|remove|clear|reset|import|duplicate)[A-Za-z]*\s*\(/.test(govde);
            if (!degistirir) continue;
            if (GORUNUR.some(g => govde.includes(g))) continue;

            const satir = s.slice(0, m.index).split("\n").length;
            sessizler.push(dosya + ":" + satir);
        }
    }

    kontrol("ölçüm geçerli: olay dinleyicileri taranabiliyor",
        dinleyiciSayisi > 40, dinleyiciSayisi + " dinleyici");
    kontrol("durum değiştiren hiçbir düğme SESSİZ değil",
        sessizler.length === 0,
        "geri bildirimi olmayan: " + sessizler.join(", "));

    // Bu iki yol adıyla sabitleniyor: bildirilen hata tam buradaydı.
    const app = fs.readFileSync(path.join(KOK, "js", "app.js"), "utf8");
    kontrol("şube silme bildirim gösteriyor",
        /if \(appState\.deleteSection\([^)]*\)\)\s*\{[\s\S]{0,240}showToast/.test(app));
    kontrol("şube kopyalama bildirim gösteriyor",
        /if \(appState\.duplicateSection\([^)]*\)\)\s*\{[\s\S]{0,240}showToast/.test(app));
}

/* ---- 4) Envanter özeti (bilgi amaçlı, hata değil) ---------------------- */
{
    const bos = bloklar.filter(b => b.tur === "bos").length;
    const log = bloklar.filter(b => b.tur === "log").length;
    const isl = bloklar.filter(b => b.tur === "isleyen").length;
    console.log(`   envanter: ${bos} boş + ${log} yalnız-log = ${bos + log} sessiz, `
        + `${isl} işleyen  (toplam ${bloklar.length})`);
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ SESSİZ YOL DENETİMİ HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ SESSİZ YOL DENETİMİ TEMİZ — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

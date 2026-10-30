/* ===========================================================================
   NormMatik — LİSANS PENCERESİ (30.10.2026)

   NEDEN VAR
   ---------
   Lisans penceresi (üst çubukta "Lisans Al" / Diğer menüsü) iki sorun taşıyordu:
     1) Lisanslı bir müşteriye de FİYAT ve "WhatsApp ile Lisans Al" çıkıyordu; lisansın ne zaman başladığı,
        ne zaman biteceği, kaç gün kaldığı ve süreyi nasıl uzatacağı hiçbir yerde yazmıyordu. Form alanlarına
        yazınca da okul bilgisi değişmeye çalışıyordu.
     2) WhatsApp mesajı okul bilgisi taşımıyordu (13.09.2026'da demonun SAHTE bilgisi satıcıya gitmesin diye
        kaldırılmıştı). Çözüm: demoda form BOŞ başlar; kişi yazarsa yazdığı mesaja girer.

   Bu test şunları KALICI korur:
     A) Mesaj üreticileri: bilgi yoksa mesaj `lisansMesaji` ile BİREBİR aynı (karşılama sayfasıyla aynı);
        yazılan bilgi mesaja girer; yenileme mesajı okulun gerçek bilgisini ve bitiş tarihini taşır.
     B) Lisans yöneticisi `baslangic` ve `bitis`i durum nesnesine taşır (lisanslı ve süresi dolmuş).
     C) Pencere kaynağı: lisanslı/yönetici/süresi dolmuş okul durum penceresine yönlenir, demoda form boş başlar,
        yazılan bilgi mesaja girer.
     D) Yönetim araçları: yeni okula `baslangic` yazılır, mevcut okulları dolduran betik varsayılan olarak
        YAZMAZ.

   ÇALIŞTIRMA: node tools/test_lisansPenceresi.mjs   (çıkış kodu 0 = geçti)
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const PROJE = path.dirname(KOK);
const oku = (...y) => fs.readFileSync(path.join(KOK, ...y), "utf8");

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};

const iletisimJs = oku("js", "iletisim.js");
const uiJs = oku("js", "uiComponents.js");

/* ---- A) Mesaj üreticileri --------------------------------------------- */
{
    const ctx = { window: {}, module: undefined };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext(iletisimJs, ctx);
    const I = ctx.window.NORMMATIK_ILETISIM;
    const lis = ctx.window.normmatikLisansMesaji;
    const yen = ctx.window.normmatikYenilemeMesaji;

    kontrol("normmatikLisansMesaji tanımlı ve pencereye açık", typeof lis === "function");
    kontrol("normmatikYenilemeMesaji tanımlı ve pencereye açık", typeof yen === "function");
    kontrol("bilgi yoksa mesaj lisansMesaji ile BİREBİR aynı (karşılama sayfasıyla aynı metin)",
        lis({}) === I.lisansMesaji && lis() === I.lisansMesaji, JSON.stringify(lis({})));

    const dolu = lis({ okul: "Örnek Anadolu Lisesi", kurumKodu: "123789", okulTuru: "Anadolu Lisesi", ilIlce: "ANKARA / ÇANKAYA" });
    kontrol("yazılan okul adı mesaja giriyor", dolu.includes("Okul: Örnek Anadolu Lisesi"));
    kontrol("yazılan kurum kodu mesaja giriyor", dolu.includes("Kurum kodu: 123789"));
    kontrol("seçilen okul türü mesaja giriyor", dolu.includes("Okul türü: Anadolu Lisesi"));
    kontrol("il/ilçe mesaja giriyor", dolu.includes("İl/İlçe: ANKARA / ÇANKAYA"));
    kontrol("okul türü yazılmamışsa o satır HİÇ eklenmez", !lis({ okul: "X" }).includes("Okul türü"));
    kontrol("kısmi bilgi: yazılmayan alan boş şablon satırı olarak kalır",
        lis({ okul: "X" }) === "Merhaba, NormMatik lisansı hakkında bilgi almak istiyorum.\nOkul: X\nKurum kodu: \nİl/İlçe: ");
    kontrol("boşluklar kırpılır", lis({ okul: "  X  " }).includes("Okul: X\n"));

    const y = yen({ okul: "Örnek Lisesi", kurumKodu: "123789", bitis: "30 Ekim 2027" });
    kontrol("yenileme mesajı okul adını taşır", y.includes("Okul: Örnek Lisesi"));
    kontrol("yenileme mesajı kurum kodunu taşır", y.includes("Kurum kodu: 123789"));
    kontrol("yenileme mesajı bitiş tarihini taşır", y.includes("Lisans bitiş tarihi: 30 Ekim 2027"));
    kontrol("yenileme mesajı süre uzatma talebi olduğunu söyler", /süresini uzatmak/.test(y));
}

/* ---- B) Lisans yöneticisi başlangıç/bitişi taşır ----------------------- */
{
    const kaynak = oku("js", "licenseClientManager.js");
    const ctx = { window: {}, module: undefined, localStorage: { getItem: () => null, setItem() {} }, console, Date };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext(kaynak, ctx);
    const L = ctx.window.licenseManager;
    const gelecek = Date.now() + 100 * 86400000;
    const d = L.applyCloudSubscription(
        { plan: "tam", bitis: "2027-02-08", bitisMs: gelecek, baslangic: "2026-02-08", sinirsizSube: true, disaAktarim: true },
        { kurumKodu: "123789", okulAdi: "Örnek", okulTuru: "anadolu_lisesi" });
    kontrol("lisanslı okul: yıllık lisans", d.isAnnual === true && d.isValid === true);
    kontrol("lisanslı okul: başlangıç tarihi durum nesnesinde", d.baslangic === "2026-02-08", d.baslangic);
    kontrol("lisanslı okul: bitiş tarihi durum nesnesinde", d.bitis === "2027-02-08", d.bitis);
    kontrol("lisanslı okul: kalan gün ~100", d.daysRemaining >= 99 && d.daysRemaining <= 101, String(d.daysRemaining));
    kontrol("lisanslı okul: şube sınırı yok", d.maxSections === -1);

    const eski = L.applyCloudSubscription({ plan: "tam", bitis: "2027-02-08", bitisMs: gelecek }, { kurumKodu: "1" });
    kontrol("başlangıcı olmayan eski kayıt: boş döner (uydurma tarih yok)", eski.baslangic === "");

    const gecmis = L.applyCloudSubscription(
        { plan: "tam", bitis: "2026-01-01", bitisMs: Date.now() - 86400000, baslangic: "2025-01-01" }, { kurumKodu: "123789" });
    kontrol("süresi dolmuş: dolmuş işaretli", gecmis.isExpired === true);
    kontrol("süresi dolmuş: bitiş ve başlangıç tarihi pencereye taşınır", gecmis.bitis === "2026-01-01" && gecmis.baslangic === "2025-01-01");
    kontrol("süresi dolmuş: kimlik demo haklarına düşer", gecmis.isDemo === true && gecmis.isAnnual === false);
}

/* ---- C) Pencere kaynağı ------------------------------------------------ */
kontrol("lisanslı/yönetici/süresi dolmuş okul durum penceresine yönlenir",
    /return this\.openLicenseStatusModal\(lic, okulInfo\)/.test(uiJs) && /lic\.isMaster \|\| \(lic\.isAnnual/.test(uiJs));
kontrol("durum penceresi tanımlı", /openLicenseStatusModal\(lic, okulInfo\) \{/.test(uiJs));
kontrol("durum penceresi başlangıç ve bitişi gösterir", /Lisans başlangıcı/.test(uiJs) && /Lisans bitişi/.test(uiJs));
kontrol("durum penceresi kalan günü gösterir", /gün kaldı/.test(uiJs));
kontrol("durum penceresi süre uzatma yönlendirmesi taşır", /Lisans süresini uzatmak için/.test(uiJs) && /btn-whatsapp-yenile/.test(uiJs));
kontrol("yenileme düğmesi tek kaynaktaki yenileme mesajını kullanır", /normmatikYenilemeMesaji\(/.test(uiJs));
kontrol("başlangıç tarihi bilinmiyorsa ilerleme çubuğu uydurulmaz", /Number\.isFinite\(bas\)/.test(uiJs));
kontrol("demoda satın alma formu BOŞ başlar (sahte bilgi mesaja girmez)",
    /const demoMu = /.test(uiJs) && /ornekDeger\(okulInfo\.kurumKodu\)/.test(uiJs) && /ornekDeger\(okulInfo\.okulAdi\)/.test(uiJs));
kontrol("satın alma düğmesi formda yazılan bilgiyi mesaja katar",
    /normmatikLisansMesaji\(waBilgi\)/.test(uiJs));
kontrol("satın alma düğmesi artık boş şablonu elle kurmuyor", !/normmatikWhatsappBaglantisi\(\)\s*:/.test(uiJs));

/* ---- D) Yönetim araçları ------------------------------------------------ */
{
    const admin = fs.readFileSync(path.join(PROJE, "08_bulut_yonetimi", "normmatik_admin.py"), "utf8");
    kontrol("yeni okul kurulurken abonelik kaydına başlangıç yazılır", /abonelik\["baslangic"\]\s*=/.test(admin));
    kontrol("okul yeniden kurulursa eski başlangıç KORUNUR", /eski_abonelik\.get\("baslangic"\)/.test(admin));
    const doldur = fs.readFileSync(path.join(PROJE, "08_bulut_yonetimi", "baslangic_doldur.py"), "utf8");
    kontrol("başlangıç doldurma betiği varsayılan olarak YAZMAZ", /uygula = "--uygula" in sys\.argv/.test(doldur));
    kontrol("betik yalnız baslangic alanına YAZAR (okuma serbest)", !/_toplu_yaz\(\{"abonelik\/%s\/(?!baslangic)/.test(doldur));
    kontrol("elle bildirilen tarih var olan başlangıcı EZMEZ", /EZILMEDI/.test(doldur) && /--elle/.test(doldur));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ LİSANS PENCERESİ HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ LİSANS PENCERESİ — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

/* ===========================================================================
   NormMatik™ — Okul sıfırlama testi
   ===========================================================================
   NEDEN VAR (müşteri olayı, 09.09.2026 23:12-23:25)
   ------------------------------------------------
   Kullanıcı okul türünü değiştirmek istedi ve "Evet, Tümünü Sıfırla" dedi.
   Olan şu oldu:

     1. Ekrandaki okul sıfırlandı  -> subeler = []
     2. Otomatik kayıt devreye girdi ve BOŞ okulu buluta YAZMAYA çalıştı
     3. Veritabanı kuralı reddetti:
          ".validate": "!newData.exists() || newData.hasChildren(['okulAdi','subeler'])"
        Firebase boş diziyi saklamaz; `subeler` çocuğu hiç oluşmaz, koşul düşer.
     4. Kullanıcıya "Bu okulun verisine erişim yetkiniz yok" dendi.

   Yetki sorunu YOKTU. Sıfırlama yapılamıyordu ve sebebi de yanlış yazılıyordu.
   Üstelik buluttaki 27 şubelik kayıt ile bu bilgisayardaki boş kopya yerinde
   kaldığı için, ilk yenilemede "daha yeni çalışma bulundu" kutusu çıkıp
   sıfırlamayı geri alabiliyordu.

   Kuralın `!newData.exists()` dalı silmeye zaten izin veriyordu; eksik olan
   istemci tarafıydı. Bu test sıfırlamanın üç yeri birden temizlediğini ve
   ret mesajının doğru olduğunu denetler.

   Çalıştırma:  node tools/test_okulSifirlama.mjs
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
const olumcul = (m) => { console.log("\n!! OLCUM GECERSIZ: " + m); process.exit(1); };

/* ---- Kum havuzu ------------------------------------------------------ */
const w = {};
const yerelKutu = {};
const ctx = {
    window: w, self: w, console: { log() {}, warn() {}, error() {} },
    localStorage: {
        getItem: (k) => (k in yerelKutu ? yerelKutu[k] : null),
        setItem(k, v) { yerelKutu[k] = String(v); },
        removeItem(k) { delete yerelKutu[k]; },
        clear() { for (const k of Object.keys(yerelKutu)) delete yerelKutu[k]; },
    },
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

const st = w.appState;
const bulut = w.cloudDbService;
if (!st || typeof st.yerelBulutSecimi !== "function") olumcul("appState yok.");
if (!bulut) olumcul("cloudDbService yok.");

/* =======================================================================
   1) SİLME YOLU VAR MI, DOĞRU İSTEĞİ Mİ YAPIYOR?
   ==================================================================== */
kontrol("silBulutVerisi() tanımlı", typeof bulut.silBulutVerisi === "function");

if (typeof bulut.silBulutVerisi === "function") {
    // Ağa çıkmadan, yalnızca hangi yol/yöntemle istek yapıldığını yakala.
    const cagrilar = [];
    const eskiIstek = bulut._istekTekrarli;
    bulut._istekTekrarli = async (yol, yontem, govde) => {
        cagrilar.push({ yol, yontem, govde });
        return { ok: true, veri: null };
    };
    // Bekleyen bir kayıt varmış gibi davran: silme onu iptal etmeli.
    bulut.bekleyenKayit = { kurumKodu: "131313", state: {} };
    bulut.saveTimeout = setTimeout(() => {}, 60000);

    await bulut.silBulutVerisi("131313");

    kontrol("silme tek istek yapar", cagrilar.length === 1, String(cagrilar.length));
    if (cagrilar.length === 1) {
        kontrol("silme DELETE kullanır", cagrilar[0].yontem === "DELETE", cagrilar[0].yontem);
        kontrol("silme doğru yola gider", cagrilar[0].yol === "school_data/131313", cagrilar[0].yol);
        kontrol("silme gövde göndermez", !cagrilar[0].govde);
    }
    kontrol("silme, bekleyen otomatik kaydı iptal eder",
        bulut.bekleyenKayit === null,
        "kuyrukta duran PUT kaydı geri yaratırdı");

    clearTimeout(bulut.saveTimeout);
    bulut._istekTekrarli = eskiIstek;

    // Kurum kodu yoksa ağa hiç çıkmamalı.
    const oncekiSayi = cagrilar.length;
    bulut._istekTekrarli = async () => { cagrilar.push({}); return { ok: true }; };
    const bos = await bulut.silBulutVerisi("");
    kontrol("kurum kodu yokken istek yapılmaz", cagrilar.length === oncekiSayi);
    kontrol("kurum kodu yokken kalıcı hata döner", bos && bos.ok === false && bos.kalici === true);
    bulut._istekTekrarli = eskiIstek;
}

/* =======================================================================
   2) BOŞ YEREL KOPYA, DOLU BULUT KAYDININ ÖNÜNE GEÇMEZ
   ==================================================================== */
const doluBulut = {
    okulAdi: "DENEME ORTAOKULU",
    subeler: new Array(27).fill(0).map((_, i) => ({ id: "s" + i })),
    lastUpdated: "2026-09-09T20:12:50.000Z",
};
const bosYerel = {
    kayitZamani: "2026-09-09T20:22:13.000Z",     // buluttan 10 dakika YENİ
    veri: { subeler: [] },
};

const secim = st.yerelBulutSecimi(doluBulut, bosYerel);
kontrol("boş yerel kopya kullanılmaz", secim.yereliKullan === false,
    "27 şubenin üstüne 0 şube yazılırdı");
kontrol("boş yerel kopya için soru sorulmaz", secim.sorulmali === false);
kontrol("şube sayıları raporlanır: bulut 27", secim.bulutSube === 27, String(secim.bulutSube));
kontrol("şube sayıları raporlanır: yerel 0", secim.yerelSube === 0, String(secim.yerelSube));

/* Doğru davranış korundu mu? Yerelde GERÇEK çalışma varsa sorulmalı. */
const doluYerel = {
    kayitZamani: "2026-09-09T20:22:13.000Z",
    veri: { subeler: [{ id: "a" }, { id: "b" }] },
};
const s2 = st.yerelBulutSecimi(doluBulut, doluYerel);
kontrol("yerelde gerçek çalışma varsa yerel kullanılır", s2.yereliKullan === true);
kontrol("yerelde gerçek çalışma varsa KULLANICIYA SORULUR", s2.sorulmali === true);
kontrol("dolu yerel için sayılar doğru", s2.yerelSube === 2 && s2.bulutSube === 27);

/* Bulut boş, yerel dolu: sorulmadan yerel kullanılmalı (eski davranış). */
const s3 = st.yerelBulutSecimi(null, doluYerel);
kontrol("bulut okunamadıysa yerel kullanılır", s3.yereliKullan === true && s3.sorulmali === false);

/* İkisi de boşsa ortalık karışmasın. */
const s4 = st.yerelBulutSecimi({ subeler: [], lastUpdated: "2026-09-09T20:12:50.000Z" }, bosYerel);
kontrol("ikisi de boşken patlamaz", s4 && typeof s4.yereliKullan === "boolean");

/* =======================================================================
   3) RET MESAJI ARTIK DOĞRU SEBEBİ SÖYLÜYOR MU?
   ==================================================================== */
{
    const eskiIstek = bulut._istekTekrarli;
    bulut._istekTekrarli = async (yol) => {
        if (yol.startsWith("okul_kayit/")) {
            return { ok: true, veri: { okulAdi: "DENEME ORTAOKULU", okulTuru: "ortaokul" } };
        }
        return { ok: true, veri: { bitisMs: Date.now() + 86400000 } };
    };

    const teshis = await bulut._kayitTanila("131313", {
        okulAdi: "DENEME ORTAOKULU", okulTuru: "ortaokul",
        kurumKodu: "131313", subeler: [],
    });

    kontrol("boş okulda teşhis metni üretilir", !!teshis, "null döndü, genel mesaj gösterilirdi");
    kontrol("teşhis 'yetki' demez",
        !!teshis && !/yetki/i.test(teshis), teshis || "");
    kontrol("teşhis şube olmadığını söyler",
        !!teshis && /şube yok/i.test(teshis), teshis || "");

    // Dolu okulda ve her şey yerindeyken hâlâ null dönmeli (sebep başka).
    const teshis2 = await bulut._kayitTanila("131313", {
        okulAdi: "DENEME ORTAOKULU", okulTuru: "ortaokul",
        kurumKodu: "131313", subeler: [{ id: "a" }],
    });
    kontrol("dolu okulda ve şartlar tamken teşhis null döner", teshis2 === null, String(teshis2));

    bulut._istekTekrarli = eskiIstek;
}

/* =======================================================================
   4) SIFIRLAMA DÜĞMESİ SİLME YOLUNA BAĞLI MI? (kaynak taraması)
   ==================================================================== */
{
    const kaynak = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    const i = kaynak.indexOf("btn-confirm-reset-school");
    kontrol("sıfırlama düğmesi bulundu", i > 0);
    if (i > 0) {
        const blok = kaynak.slice(i, i + 2200);
        // DİKKAT: sadece "silBulutVerisi" geçiyor mu diye bakmak YETMEZ —
        // typeof kontrolünde de geçiyor, o yüzden ÇAĞRININ kendisi aranır.
        // (Bu testin ilk hâli tam bu yüzden boşa çıkıyordu, 09.09.2026.)
        kontrol("sıfırlama buluttaki kaydı siler",
            /await\s+bulut\.silBulutVerisi\s*\(\s*kod\s*\)/.test(blok),
            "silme çağrısı bulunamadı");
        kontrol("sıfırlama yerel kopyayı da siler",
            /this\.state\.yereliSil\s*\(\s*kod\s*\)/.test(blok),
            "yerel silme çağrısı bulunamadı");
    }
}

/* =======================================================================
   5) SIFIRLA -> HEMEN "GERİ AL"  (kullanıcı sorusu, 10.09.2026)
   -----------------------------------------------------------------------
   Kullanıcı okulu sıfırlar, tarayıcıdan çıkmadan geri al tuşuna basar.
   Beklenen: 27 şube ekrana geri gelir VE buluta yeni kayıt olarak yazılır.

   Buradaki asıl tehlike SIRA. Sıfırlama DELETE gönderir; geri al 600 ms
   gecikmeli bir PUT planlar. Silme yavaş kalırsa istekler tersine sıralanır:
       PUT (kayıt geri gelir) ... sonra DELETE (kaydı yine siler)
   Ekranda 27 şube görünür, bulut boş kalırdı.
   ==================================================================== */
{
    // Geçmiş, uygulamanın açılıştaki hâliyle kurulur.
    st.state.okulBilgisi.kurumKodu = "131313";
    st.state.okulBilgisi.okulAdi = "DENEME ORTAOKULU";
    st.state.okulBilgisi.okulTuru = "ortaokul";
    st.state.okulBilgisi.isDemo = false;
    st.state.subeler = new Array(27).fill(0).map((_, i) => ({
        id: "s" + i, subeAdi: "5-" + i, sinifSeviyesi: "5",
        ogrenciSayisi: 26, zorunluDersler: [], secmeliDersler: []
    }));
    st.history = [JSON.stringify(st.state)];
    st.historyIndex = 0;

    st.resetSchool();
    kontrol("sıfırlama sonrası ekranda şube kalmaz", st.state.subeler.length === 0,
        String(st.state.subeler.length));
    kontrol("sıfırlama kurum kimliğini korur",
        st.state.okulBilgisi.kurumKodu === "131313");

    const geriAlindi = st.undo();
    kontrol("geri al çalışır", geriAlindi === true);
    kontrol("geri al 27 şubeyi getirir", st.state.subeler.length === 27,
        String(st.state.subeler.length));
    kontrol("geri al kurum kodunu bozmaz",
        st.state.okulBilgisi.kurumKodu === "131313");

    // Yeniden ileri alınabilmeli (kullanıcı fikrini yine değiştirebilir).
    kontrol("geri alınan sıfırlama tekrar uygulanabilir",
        st.redo() === true && st.state.subeler.length === 0);
    st.undo();
}

/* ---- İstek SIRASI: silme bitmeden kayıt gitmemeli -------------------- */
{
    const sira = [];
    const eskiIstek = bulut._istekTekrarli;
    // Silmeyi BİLEREK yavaşlatıyoruz; hatalı sürümde PUT öne geçer.
    bulut._istekTekrarli = (yol, yontem) => new Promise((coz) => {
        const gecikme = yontem === "DELETE" ? 40 : 0;
        setTimeout(() => { sira.push(yontem); coz({ ok: true, veri: null }); }, gecikme);
    });

    const silme = bulut.silBulutVerisi("131313");
    // Kullanıcı silme havadayken geri al'a bastı: kayıt hemen denenir.
    const kayit = bulut.saveSchoolData("131313", {
        okulBilgisi: { kurumKodu: "131313", okulAdi: "DENEME ORTAOKULU",
                       okulTuru: "ortaokul", sezon: "2026-2027" },
        subeler: [{ id: "a" }],
        mevcutOgretmenler: {}, koordinatorlukYukleri: {},
    });
    await Promise.all([silme, kayit]);

    kontrol("her iki istek de gitti", sira.length === 2, sira.join(","));
    kontrol("silme, kayıttan ÖNCE tamamlanır",
        sira[0] === "DELETE" && sira[1] === "PUT",
        "sıra: " + sira.join(" -> ") + "  (ters sıra bulutta boş okul bırakırdı)");

    bulut._istekTekrarli = eskiIstek;
    bulut._silmeSozu = null;
}

/* =======================================================================
   6) UYARI METİNLERİ VE BUTON YÖNÜ  (kullanıcı kararı, 10.09.2026)
   -----------------------------------------------------------------------
   İki metin kusuru düzeltildi:
     a) Sıfırlama onayı, buluttaki kaydın da silineceğini ve geri al'ın
        yalnızca sayfa yenilenmeden çalıştığını söylemiyordu.
     b) Çakışma kutusunda window.confirm'in varsayılan butonu (Tamam)
        GERİ DÖNÜŞÜ OLMAYAN seçeneğe bağlıydı: düşünmeden Enter'a basan
        kullanıcı bulut kaydını eziyordu. Yön tersine çevrildi.
   ==================================================================== */
{
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    // DIKKAT: adin ilk gectigi yer CAGRI (satir 858), tanim degil. Duz
    // indexOf yanlis bloga bakiyordu ve testin ilk hali bu yuzden kirildi.
    const i = ui.indexOf("    openResetSchoolConfirmModal() {");
    kontrol("sıfırlama onay kutusunun TANIMI bulundu", i > 0);
    const blok = ui.slice(i, i + 3000);
    kontrol("onay kutusu buluttaki kaydın da silineceğini söyler",
        /buluttaki kayd[ıi]n[ıi]z[ıi] da siler/i.test(blok));
    kontrol("onay kutusu geri al'ı tarif eder", /geri al/i.test(blok));
    kontrol("onay kutusu yenileme sonrası dönüş olmadığını söyler",
        /yeniledikten sonra d[öo]n[üu][şs] yoktur/i.test(blok));
    kontrol("onay kutusu şube SAYISINI yazar", blok.includes("${subeSayisi} şubenin tamamı"));

    const app = fs.readFileSync(path.join(KOK, "js", "app.js"), "utf8");
    const j = app.indexOf("buluta gönderilememiş DAHA YENİ");
    kontrol("çakışma kutusu bulundu", j > 0);
    const kutu = app.slice(j - 400, j + 1600);
    // Yön: onay artık confirm'in TERSİ olmalı; Tamam = buluttakini kullan.
    kontrol("Tamam güvenli seçeneğe bağlı (onay = !confirm)",
        /onay\s*=\s*!\s*window\.confirm/.test(kutu),
        "Tamam hâlâ bulut kaydını ezen seçenekte");
    kontrol("kutu şube sayılarını gösterir",
        kutu.includes("secim.bulutSube") && kutu.includes("secim.yerelSube"));
    kontrol("kutu üzerine yazılacağını açıkça söyler", /ÜSTÜNE YAZILIR/.test(kutu));
    kontrol("kutu yerel kopyanın silinmeyeceğini söyler", /SİLİNMEZ/.test(kutu));
}

/* ---- SONUÇ ----------------------------------------------------------- */
if (hatalar.length) {
    console.log(`\n${hatalar.length} KONTROL BASARISIZ (${gecen} gecti)\n`);
    hatalar.forEach((h) => console.log("   - " + h));
    process.exit(1);
}
console.log(`\nOkul sifirlama: ${gecen} kontrolun tamami gecti.`);
console.log("   Sifirlama artik bulut kaydini SILIYOR, bos kayit YAZMIYOR.");

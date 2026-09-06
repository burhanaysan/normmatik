/* ===========================================================================
   NormMatik™ — Yerel kalıcılık testi
   ===========================================================================
   NEDEN VAR (kullanıcı kararı, 06.09.2026)
   ----------------------------------------
   Uygulama okul verisini SADECE bulutta tutuyordu:

       state.js  saveToStorage()   -> yalnızca cloudService.scheduleAutoSave
       state.js  loadFromStorage() -> her zaman false

   Bulut kaydı reddedilirse veri HİÇBİR YERDE olmuyordu. Bu teorik bir risk
   değildi: Firebase anahtar hatası (4ca5758) yüzünden bir okulun bütün
   kayıtları haftalarca sessizce reddedildi; müdür saatlerce çalıştı, hiçbir
   şey yazılmadı.

   Artık her değişiklik EŞZAMANLI olarak bu tarayıcıya da yazılıyor. Bu test
   şunları sabitler:
     1) Her değişiklikte yerele yazılıyor (bulut hiç çalışmasa bile).
     2) Demo ve kurum kodsuz durumda yerele YAZILMIYOR.
     3) Yazılamazsa SESSİZ KALINMIYOR (olay yayınlanıyor).
     4) Yerelden okuma, yazılanın aynısını geri veriyor (tur kayıpsız).
     5) Bozuk/eksik yerel kayıt uygulamayı çökertmiyor.
     6) Bekleyen bulut kaydı kapanışta zorla gönderilebiliyor.
     7) Açılışta karşılaştırma ve kapanış boşaltması gerçekten bağlanmış.

   Çalıştırma: node tools/test_yerelKalicilik.mjs
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

/* ---- sahte tarayıcı: localStorage gerçekten çalışsın ------------------- */
function ortamKur({ kotaDolu = false } = {}) {
    const depo = new Map();
    const olaylar = [];
    const yerel = {
        getItem: (k) => (depo.has(k) ? depo.get(k) : null),
        setItem: (k, v) => {
            if (kotaDolu) {
                const e = new Error("quota");
                e.name = "QuotaExceededError";
                throw e;
            }
            depo.set(k, String(v));
        },
        removeItem: (k) => { depo.delete(k); },
        clear: () => depo.clear(),
        _depo: depo
    };
    const w = {};
    const ctx = {
        window: w, self: w, console: { log() {}, warn() {}, error() {} },
        localStorage: yerel,
        sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
        navigator: { userAgent: "node" }, location: { href: "x" },
        screen: { width: 1920, height: 1080 },
        setTimeout, clearTimeout, setInterval, clearInterval,
        crypto: { getRandomValues: (a) => a },
        CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
        alert() {}
    };
    ctx.globalThis = ctx;
    w.localStorage = yerel;
    w.dispatchEvent = (o) => { olaylar.push(o); return true; };
    w.addEventListener = () => {};
    vm.createContext(ctx);
    vm.runInContext(
        fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);
    return { w, ctx, depo, olaylar, yerel };
}

const ort = ortamKur();
const st = ort.w.appState, ce = ort.w.curriculumEngine;
if (!st || typeof st.yereleKaydet !== "function") olumcul("yereleKaydet yok.");
ort.w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
};

const okulKur = (S, kurumKodu, isDemo = false) => {
    S.state = S.getDefaultState();
    S.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    S.state.okulBilgisi.okulAdi = "Yerel Test Lisesi";
    S.state.okulBilgisi.kurumKodu = kurumKodu;
    S.state.okulBilgisi.isDemo = isDemo;
    [["9", 30], ["10", 28], ["11", 25]].forEach(([g, o], i) =>
        S.addSection({
            subeAdi: g + "-" + "ABC"[i], sinifSeviyesi: g, ogrenciSayisi: o,
            zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", g, null, null)
        }));
};

/* ---- 0) Ölçüm geçerli mi? --------------------------------------------- */
{
    okulKur(st, "999111");
    kontrol("ölçüm geçerli: şubeler kuruldu", st.state.subeler.length === 3,
        String(st.state.subeler.length));
    kontrol("ölçüm geçerli: derslerle birlikte",
        (st.state.subeler[0].zorunluDersler || []).length > 3);
}

/* ---- 1) Her değişiklikte yerele yazılıyor mu? -------------------------- */
{
    ort.depo.clear();
    st.notify();
    const anahtar = "normmatik_yerel_999111";
    kontrol("notify() yerele yazıyor", ort.depo.has(anahtar),
        "depodaki anahtarlar: " + [...ort.depo.keys()].join(", "));

    const paket = JSON.parse(ort.depo.get(anahtar) || "{}");
    kontrol("yerel pakette zaman damgası var", !!paket.kayitZamani);
    kontrol("yerel pakette kurum kodu var", paket.kurumKodu === "999111");
    kontrol("yerel pakette şubeler var",
        Array.isArray(paket.veri && paket.veri.subeler) && paket.veri.subeler.length === 3);
}

/* ---- 2) Tur kayıpsız mı? ---------------------------------------------- */
{
    st.state.mevcutOgretmenler = { "Matematik": 3, "Kimya / Kimya Teknolojisi": 1 };
    st.state.okulBilgisi.adminOptions = { yoneticiDersYukleri: { "Türk Dili ve Edebiyatı": 6 } };
    st.notify();

    const geri = st.yereldenOku("999111");
    kontrol("yerelden okuma bir şey döndürüyor", !!geri && !!geri.veri);
    kontrol("şube sayısı korunuyor", geri.veri.subeler.length === st.state.subeler.length);
    kontrol("eğik çizgili branş adı bozulmadan dönüyor",
        geri.veri.mevcutOgretmenler["Kimya / Kimya Teknolojisi"] === 1,
        JSON.stringify(geri.veri.mevcutOgretmenler));
    kontrol("yönetici ders yükü korunuyor",
        geri.veri.okulBilgisi.adminOptions.yoneticiDersYukleri["Türk Dili ve Edebiyatı"] === 6);
    kontrol("tur birebir aynı",
        JSON.stringify(geri.veri) === JSON.stringify(st.state),
        "yerel kopya durumla birebir eşleşmiyor");
}

/* ---- 3) Demo ve kurum kodsuz durumda yazılmamalı ----------------------- */
{
    ort.depo.clear();
    okulKur(st, "999222", true);          // isDemo
    st.notify();
    kontrol("DEMO okul yerele yazılmıyor", ort.depo.size === 0,
        [...ort.depo.keys()].join(", "));

    ort.depo.clear();
    okulKur(st, "");                      // kurum kodu yok
    st.notify();
    kontrol("kurum kodu yokken yerele yazılmıyor", ort.depo.size === 0,
        [...ort.depo.keys()].join(", "));

    ort.depo.clear();
    okulKur(st, "123456");                // ayrılmış demo kodu
    st.notify();
    kontrol("ayrılmış 123456 kodu yerele yazılmıyor", ort.depo.size === 0,
        [...ort.depo.keys()].join(", "));
}

/* ---- 4) Yazılamazsa SESSİZ KALMIYOR ------------------------------------ */
{
    const ort2 = ortamKur({ kotaDolu: true });
    const st2 = ort2.w.appState, ce2 = ort2.w.curriculumEngine;
    ort2.w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
    };
    st2.state = st2.getDefaultState();
    st2.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    st2.state.okulBilgisi.kurumKodu = "999333";
    st2.addSection({
        subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 30,
        zorunluDersler: ce2.getMandatoryCourses("anadolu_lisesi", "9", null, null)
    });
    const yazdi = st2.yereleKaydet();
    kontrol("kota dolunca yereleKaydet false dönüyor", yazdi === false, String(yazdi));

    const uyarilar = ort2.olaylar.filter(o => o && o.type === "normmatik-yerel-durum");
    kontrol("kota dolunca kullanıcıya olay yayınlanıyor", uyarilar.length > 0,
        "yayınlanan olay: " + ort2.olaylar.map(o => o && o.type).join(", "));
    kontrol("olay başarısızlık olarak işaretli",
        uyarilar.length > 0 && uyarilar[uyarilar.length - 1].detail.basarili === false);
    kontrol("hata adı saklanıyor", st2.yerelSonHata === "QuotaExceededError",
        String(st2.yerelSonHata));
}

/* ---- 5) Bozuk yerel kayıt çökertmiyor ---------------------------------- */
{
    ort.yerel.setItem("normmatik_yerel_999444", "{bu gecerli json degil");
    kontrol("bozuk JSON null dönüyor, hata fırlatmıyor",
        st.yereldenOku("999444") === null);

    ort.yerel.setItem("normmatik_yerel_999555", JSON.stringify({ surum: 1, veri: { subeler: "dizi degil" } }));
    kontrol("eksik/yanlış yapı null dönüyor", st.yereldenOku("999555") === null);

    kontrol("hiç kayıt yoksa null dönüyor", st.yereldenOku("000000") === null);
    kontrol("kurum kodu boşken null dönüyor", st.yereldenOku("") === null);
}

/* ---- 6) Bekleyen bulut kaydı zorla gönderilebiliyor -------------------- */
{
    const cs = ort.w.cloudDbService;
    kontrol("bulut servisinde flushPendingSave var",
        cs && typeof cs.flushPendingSave === "function");

    if (cs) {
        let gonderildi = null;
        const asil = cs.saveSchoolData;
        cs.saveSchoolData = function (k, s) { gonderildi = k; return Promise.resolve(); };

        // Yukarıdaki notify() çağrıları zaten bekleyen kayıt bırakmış olabilir
        // (600 ms henüz dolmadı); "bekleyen yok" hâlini kurmak için temizliyoruz.
        clearTimeout(cs.saveTimeout);
        cs.bekleyenKayit = null;
        const bosSonuc = cs.flushPendingSave();      // bekleyen yokken
        kontrol("bekleyen kayıt yokken sessizce false dönüyor",
            bosSonuc === false && gonderildi === null, String(gonderildi));

        cs.scheduleAutoSave("999111", { deneme: true });
        kontrol("planlanan kayıt saklanıyor", !!cs.bekleyenKayit);
        const sonuc = cs.flushPendingSave();
        kontrol("flush bekleyen kaydı HEMEN gönderiyor",
            sonuc === true && gonderildi === "999111", String(gonderildi));
        kontrol("flush sonrası bekleyen kayıt temizleniyor", !cs.bekleyenKayit);
        cs.saveSchoolData = asil;
    }
}

/* ---- 7) Açılış ve kapanış yolları bağlanmış mı? ------------------------ */
{
    const APP = fs.readFileSync(path.join(KOK, "js", "app.js"), "utf8");
    kontrol("açılışta yerel kopya okunuyor", /appState\.yereldenOku\(session\.kurumKodu\)/.test(APP));
    kontrol("karar saf fonksiyondan alınıyor",
        /appState\.yerelBulutSecimi\(cloudData, yerel\)/.test(APP));
    kontrol("yerel daha yeniyse kullanıcıya soruluyor",
        /secim\.sorulmali/.test(APP) && /window\.confirm\(/.test(APP));
    kontrol("uygulama tek kapıdan yapılıyor", /appState\.yereliUygula\(yerel\.veri\)/.test(APP));
    kontrol("geri yükleme sonrası bulutla eşitleniyor",
        /yereliUygula[\s\S]{0,400}scheduleAutoSave\(session\.kurumKodu/.test(APP));
    kontrol("yerel hata dinleyicisi bağlı", /normmatik-yerel-durum/.test(APP));
    kontrol("kapanışta bulut kaydı boşaltılıyor",
        /flushPendingSave\(\)/.test(APP)
        && /visibilitychange/.test(APP) && /pagehide/.test(APP) && /beforeunload/.test(APP));

    const STATE = fs.readFileSync(path.join(KOK, "js", "state.js"), "utf8");
    kontrol("saveToStorage yerele de yazıyor", /this\.yereleKaydet\(\);/.test(STATE));
    kontrol("loadFromStorage hâlâ false dönüyor (geriye dönük uyum)",
        /loadFromStorage\(\)\s*\{[\s\S]{0,400}return false;/.test(STATE));
}

/* ---- 8) KARAR MANTIĞI (saf fonksiyon, davranış) ------------------------ */
/* Kural: YENİ OLAN KAZANIR; yerel kazanıyorsa kullanıcıya SORULUR. */
{
    const S = st;
    const zaman = (msFark) => new Date(Date.now() + msFark).toISOString();
    const yerelPaket = (kayitZamani) => ({ kayitZamani, veri: { subeler: [] } });

    kontrol("yerel kopya yoksa bulut kullanılır",
        S.yerelBulutSecimi({ lastUpdated: zaman(0) }, null).yereliKullan === false);

    kontrol("bulut BOŞ + yerel var -> yerel, soru SORULMAZ",
        (() => { const r = S.yerelBulutSecimi(null, yerelPaket(zaman(-1000)));
                 return r.yereliKullan === true && r.sorulmali === false; })(),
        "bulut okunamadığında kullanıcıyı sorgulamaya boğmayız");

    kontrol("bulut DAHA YENİ -> bulut kullanılır",
        S.yerelBulutSecimi({ lastUpdated: zaman(0) },
            yerelPaket(zaman(-60000))).yereliKullan === false);

    kontrol("yerel 1 dk daha yeni -> yerel ama SORULUR",
        (() => { const r = S.yerelBulutSecimi({ lastUpdated: zaman(-60000) },
                    yerelPaket(zaman(0)));
                 return r.yereliKullan === true && r.sorulmali === true; })());

    kontrol("2 sn'lik fark ÇAKIŞMA sayılmaz (normal kayıt gecikmesi)",
        S.yerelBulutSecimi({ lastUpdated: zaman(-2000) },
            yerelPaket(zaman(0))).yereliKullan === false,
        "5 sn'lik pay olmasaydı her açılışta soru sorulurdu");

    kontrol("bozuk zaman damgası yereli seçtirmez",
        S.yerelBulutSecimi({ lastUpdated: zaman(0) },
            { kayitZamani: "tarih değil", veri: { subeler: [] } }).yereliKullan === false);

    kontrol("zaman damgasız yerel kayıt seçtirmez",
        S.yerelBulutSecimi(null, { veri: { subeler: [] } }).yereliKullan === false);
}

/* ---- 9) ASIL SENARYO: bulut sessizce reddediyor, sekme kapanıyor ------- */
/* 4ca5758'in birebir provası. Bulut HİÇ yazamıyor; müdür çalışıyor; sekme
   kapanıyor; ertesi gün açılıyor. Veri geri gelmeli. */
{
    const A = ortamKur();
    A.w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
    };
    const sA = A.w.appState, cA = A.w.curriculumEngine;

    // Bulut HER İSTEĞİ reddetsin (Firebase anahtar hatası gibi).
    A.w.cloudDbService.saveSchoolData = async () => { throw new Error("permission denied"); };

    sA.state = sA.getDefaultState();
    sA.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    sA.state.okulBilgisi.okulAdi = "Oltu Anadolu Lisesi";
    sA.state.okulBilgisi.kurumKodu = "777888";
    [["9", 34], ["10", 33], ["11", 28], ["12", 24]].forEach(([g, o], i) =>
        sA.addSection({
            subeAdi: g + "-" + "ABCD"[i], sinifSeviyesi: g, ogrenciSayisi: o,
            zorunluDersler: cA.getMandatoryCourses("anadolu_lisesi", g, null, null)
        }));
    sA.state.mevcutOgretmenler = { "Matematik": 4, "İngilizce": 3 };
    sA.notify();

    const calisilan = JSON.stringify(sA.state);
    kontrol("ölçüm geçerli: müdür 4 şube girdi", sA.state.subeler.length === 4);
    kontrol("bulut reddederken bile yerele yazıldı",
        A.depo.has("normmatik_yerel_777888"),
        [...A.depo.keys()].join(", "));

    // --- SEKME KAPANDI, ERTESİ GÜN YENİ OTURUM ---
    // Aynı tarayıcı => aynı localStorage deposu.
    const B = ortamKur();
    B.depo.clear();
    for (const [k, v] of A.depo) B.depo.set(k, v);
    B.w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
    };
    const sB = B.w.appState;
    sB.state = sB.getDefaultState();
    sB.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    sB.state.okulBilgisi.okulAdi = "Oltu Anadolu Lisesi";
    sB.state.okulBilgisi.kurumKodu = "777888";

    // Bulutta hiçbir şey yok (hiç yazılamamıştı).
    const cloudData = null;
    const yerelB = sB.yereldenOku("777888");
    kontrol("yeni oturum yerel kopyayı buluyor", !!yerelB && !!yerelB.veri);

    const secimB = sB.yerelBulutSecimi(cloudData, yerelB);
    kontrol("karar: yerel kullanılsın", secimB.yereliKullan === true);
    kontrol("karar: soru sorulmasın (bulutta kayıt yok)", secimB.sorulmali === false);

    sB.yereliUygula(yerelB.veri);
    kontrol("KURTARMA: şube sayısı geri geldi",
        sB.state.subeler.length === 4, String(sB.state.subeler.length));
    kontrol("KURTARMA: mevcut öğretmenler geri geldi",
        sB.state.mevcutOgretmenler["Matematik"] === 4
        && sB.state.mevcutOgretmenler["İngilizce"] === 3);
    kontrol("KURTARMA: ders çizelgeleri geri geldi",
        (sB.state.subeler[0].zorunluDersler || []).length > 3);
    kontrol("KURTARMA: aktif şube ayarlandı", !!sB.state.aktifSubeId);

    // Okul kimliği yerelden EZİLMEMELİ (Firebase kuralı birebir eşleşme ister).
    kontrol("okul adı yerel kopyadan ezilmedi",
        sB.state.okulBilgisi.okulAdi === "Oltu Anadolu Lisesi");
    kontrol("okul türü yerel kopyadan ezilmedi",
        sB.state.okulBilgisi.okulTuru === "anadolu_lisesi");

    // Veri gerçekten AYNI mı?
    kontrol("kurtarılan şubeler birebir aynı",
        JSON.stringify(sB.state.subeler) === JSON.stringify(JSON.parse(calisilan).subeler),
        "kurtarma kayıplı");
}

/* ---- 10) SÜRÜM GEÇMİŞİ — "dün akşamki hâline dön" --------------------- */
/* Geri alma yığını (30 adım) yalnızca bellekteydi, sekme kapanınca uçuyordu.
   Okulun gerçek ihtiyacı "iki adım geri al" değil, yanlış bir toplu değişikliği
   ertesi gün fark edip önceki güne dönmek. (Kullanıcı isteği, 06.09.2026.) */
{
    const O = ortamKur();
    O.w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
    };
    const S = O.w.appState, C = O.w.curriculumEngine;

    S.state = S.getDefaultState();
    S.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    S.state.okulBilgisi.okulAdi = "Sürüm Test Lisesi";
    S.state.okulBilgisi.kurumKodu = "555777";
    S.addSection({ subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 30,
        zorunluDersler: C.getMandatoryCourses("anadolu_lisesi", "9", null, null) });
    S.addSection({ subeAdi: "9-B", sinifSeviyesi: "9", ogrenciSayisi: 28,
        zorunluDersler: C.getMandatoryCourses("anadolu_lisesi", "9", null, null) });

    // NOT: addSection zaten notify() çağırıyor; ilk nokta daha ilk şubede
    // açılır. Aralık dolmadığı için ikinci şube yeni nokta AÇMAZ — tasarım
    // böyle: her tuş vuruşunda değil, çalışma seansları düzeyinde birikir.
    let liste = S.surumleriListele();
    kontrol("S1 ilk kayıtta kurtarma noktası açılıyor", liste.length === 1,
        String(liste.length));

    // "30 dakika sonra" — okul tamamlanmış hâliyle bir nokta daha.
    S.surumNoktasiKaydet(true);
    liste = S.surumleriListele();
    kontrol("S2 nokta özeti şube/öğrenci sayısını taşıyor",
        liste[0].subeSayisi === 2 && liste[0].ogrenciSayisi === 58,
        JSON.stringify(liste[0]));
    kontrol("S3 özet listesi ham veriyi TAŞIMIYOR (bellek/gizlilik)",
        liste[0].veri === undefined);

    // Aralık dolmadan yeni nokta açılmamalı: her tuş vuruşunda birikmesin.
    const oncekiAdet = S.surumleriListele().length;
    S.notify(); S.notify(); S.notify();
    kontrol("S4 aralık dolmadan yeni nokta açılmıyor",
        S.surumleriListele().length === oncekiAdet,
        S.surumleriListele().length + " / " + oncekiAdet);

    // --- YANLIŞ BİR TOPLU DEĞİŞİKLİK ---
    const oncekiSubeSayisi = S.state.subeler.length;
    S.state.subeler = [];                        // müdür yanlışlıkla hepsini sildi
    S.notify();
    kontrol("S5 ölçüm geçerli: veri gerçekten bozuldu", S.state.subeler.length === 0);

    // --- ERTESİ GÜN: geri dön ---
    liste = S.surumleriListele();
    kontrol("S6 kurtarma noktası hâlâ duruyor", liste.length >= 2, String(liste.length));
    // Tam kurulmuş hâli taşıyan noktaya dön (en yeni olan, bozulmadan önceki).
    const hedefNokta = liste.find(k => k.subeSayisi === oncekiSubeSayisi);
    kontrol("S6b ölçüm geçerli: tam hâli taşıyan nokta bulundu", !!hedefNokta,
        JSON.stringify(liste));
    const donuldu = hedefNokta ? S.surumeDon(hedefNokta.id) : false;
    kontrol("S7 sürüme dönüş başarılı", donuldu === true);
    kontrol("S8 VERİ GERİ GELDİ", S.state.subeler.length === oncekiSubeSayisi,
        S.state.subeler.length + " / " + oncekiSubeSayisi);
    kontrol("S9 dersler de geri geldi",
        (S.state.subeler[0].zorunluDersler || []).length > 3);

    // Dönmeden önce mevcut hâl de nokta olarak saklanmalı: yanlış sürüme
    // dönen kullanıcı geri gelebilsin.
    kontrol("S10 dönmeden önce mevcut hâl de kaydedilmiş",
        S.surumleriListele().length >= 2, String(S.surumleriListele().length));

    kontrol("S11 olmayan id ile dönüş reddediliyor", S.surumeDon("yok-boyle-bir-id") === false);

    // Okul kimliği sürümden EZİLMEMELİ.
    kontrol("S12 okul adı sürümden ezilmedi",
        S.state.okulBilgisi.okulAdi === "Sürüm Test Lisesi");

    // Demo ve kodsuz durumda sürüm tutulmaz.
    S.state.okulBilgisi.isDemo = true;
    kontrol("S13 demo okulda sürüm anahtarı üretilmiyor", S.surumAnahtari() === null);
    S.state.okulBilgisi.isDemo = false;

    // Adet sınırı: sonsuza kadar birikmemeli.
    for (let i = 0; i < 15; i++) S.surumNoktasiKaydet(true);
    kontrol("S14 nokta sayısı azami sınırda tutuluyor",
        S.surumleriListele().length <= S.SURUM_AZAMI_ADET,
        S.surumleriListele().length + " / " + S.SURUM_AZAMI_ADET);

    // Bozuk kayıt çökertmemeli.
    O.yerel.setItem("normmatik_surumler_555777", "{bozuk");
    kontrol("S15 bozuk sürüm kaydı boş liste döndürüyor",
        S.surumleriListele().length === 0);

    // Çıkışta sürüm geçmişi de korunmalı.
    const AUTH = fs.readFileSync(path.join(KOK, "js", "authService.js"), "utf8");
    kontrol("S16 çıkışta sürüm geçmişi de korunuyor",
        /normmatik_surumler_/.test(AUTH) && /KORUNAN_ONEKLER/.test(AUTH));

    // Arayüzden erişilebilir olmalı; yoksa özellik yok sayılır.
    const APP = fs.readFileSync(path.join(KOK, "js", "app.js"), "utf8");
    kontrol("S17 başlıkta sürüm geçmişi düğmesi var", /id="btn-surum-gecmisi"/.test(APP));
    kontrol("S18 düğme listeleme ve dönüş işlevlerine bağlı",
        /appState\.surumleriListele\(\)/.test(APP) && /appState\.surumeDon\(/.test(APP));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ YEREL KALICILIK HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ YEREL KALICILIK DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

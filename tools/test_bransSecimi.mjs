/*
 * BRANŞ SEÇİMİ TESTİ  (idarecinin sorumluluğu ilkesi)
 * ==================================================
 *
 * Kullanıcı kararı (27.08.2026):
 *   "Okulda norm olmayabilir, ama yönetici yanlış branş bile seçse o branş
 *    sağ panelde listelensin. Branşlar ilk anda otomatik gelse de sonradan
 *    yönetici tarafından değiştirilir. Branş ne seçilirse seçilsin o liste
 *    okul idarecisinin sorumluluğundadır; katı kural koymuyoruz."
 *   "Sağlık Bilgisi dersine Biyoloji yazmak isterse kullanıcı, bu onun
 *    sorumluluğundadır; Biyoloji yüküne ilave edilsin."
 *
 *   "Yönetici, norm hesabına dahil edilemeyecek bir branşı derse eklerse
 *    herhangi bir kısıtlama yok; sorumluluk yöneticide. Biyoloji branşında
 *    4 saat Biyoloji + 2 saat Matematik + 2 saat Sağlık Bilgisi olsa bile
 *    Biyoloji'nin ders yükü 4+2+2 = 8 saat yazacak."
 *
 * Bu testin koruduğu üç davranış:
 *
 *   1) YÜKÜ OLAN HER BRANŞ LİSTELENİR — okulda o branştan öğretmen olmasa da.
 *      Bir süre tersi yapılıyordu (yan ders kuralı); kaldırıldı.
 *
 *   2) İDARECİNİN SEÇİMİ KORUNUR — okul yeniden yüklendiğinde silinmez.
 *      Buradaki hata sinsiydi: curriculumEngine, atanan branş adı ders
 *      tablosunda da geçiyorsa seçimi "sahte" sayıp eziyordu. "Biyoloji",
 *      "Matematik", "Fizik", "Tarih" gibi adlar hem ders hem branş olduğu
 *      için, idarecinin bu branşlara yaptığı HER atama kayboluyordu.
 *      Ekranda hata görünmüyordu: seçim yapılıyor, kaydediliyor, sonra
 *      açılışta eski hâline dönüyordu.
 *
 *   3) HİÇBİR SAAT ELENMEZ — bir branşa atanan dersler, o branşın resmî ders
 *      listesinde olsun olmasın, olduğu gibi toplanır. Uygulama burada
 *      "düzeltme" yapmaz; karar idarecinindir.
 *
 * Çalıştırma: node tools/test_bransSecimi.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const KAYNAK = fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8")
    .replace(/^export /gm, "");

let gecti = 0;
const hatalar = [];
function kontrol(ad, olan, beklenen) {
    if (olan === beklenen) { gecti++; return; }
    hatalar.push(`  ✗ ${ad}\n      beklenen: ${beklenen}   bulunan: ${olan}`);
}

function ortam() {
    const w = {};
    const ctx = {
        window: w, console: { log() {}, warn() {}, error() {} },
        localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
        sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
        navigator: { userAgent: "node" }, location: { href: "x" },
        screen: { width: 1920, height: 1080 },
        setTimeout, clearTimeout, setInterval, clearInterval,
        crypto: { getRandomValues: a => a },
        CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
        alert() {}
    };
    ctx.globalThis = ctx; w.dispatchEvent = () => true; w.addEventListener = () => {};
    vm.createContext(ctx); vm.runInContext(KAYNAK, ctx);
    w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
    };
    return w;
}

function okulKur(w, tur, sinif, adet) {
    const st = w.appState, ce = w.curriculumEngine;
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = tur;
    for (let i = 0; i < adet; i++)
        st.addSection({
            subeAdi: sinif + "-" + "ABCDEFGH"[i], sinifSeviyesi: sinif, ogrenciSayisi: 30,
            zorunluDersler: ce.getMandatoryCourses(tur, sinif, null, null)
        });
    return st;
}

const raporla = (w, st, ogretmenler = {}) =>
    w.normEngine.calculateSchoolNorms(
        st.state.subeler, ogretmenler, st.state.okulBilgisi.okulTuru, {}).branchReport || [];

console.log("BRANŞ SEÇİMİ TESTİ");
console.log("=".repeat(68));

// ---------------------------------------------------------------- geçerlilik
const w0 = ortam();
const st0 = okulKur(w0, "anadolu_lisesi", "9", 6);
const saat0 = st0.state.subeler.reduce((t, s) =>
    t + (s.zorunluDersler || []).reduce((a, d) => a + d.saat, 0), 0);
console.log(`kurgu: ${st0.state.subeler.length} şube, ${saat0} saat`);
if (st0.state.subeler.length !== 6 || saat0 <= 0) {
    console.log("!! KURGU GEÇERSİZ — test hiçbir şeyi denetlemiyor.");
    process.exit(1);
}

// ------------------------------------------- 1. Yükü olan branş her hâlükârda listelenir
console.log("\n── 1. Yükü olan branş, öğretmeni olmasa da listelenir");
{
    const rapor = raporla(w0, st0, {});
    const bul = ad => rapor.find(b => b.branchName === ad);

    kontrol("Sağlık Hizmetleri listede (öğretmen yok, 6 saat var)",
        bul("Sağlık Hizmetleri") !== undefined, true);
    kontrol("Sağlık Hizmetleri yükü doğru", bul("Sağlık Hizmetleri")?.totalHours, 6);

    const w1 = ortam();
    const st1 = okulKur(w1, "ilkokul", "4", 6);
    const r1 = raporla(w1, st1, {});
    kontrol("İlkokulda Beden Eğitimi listede (Trafik Güvenliği'nden 6 saat)",
        r1.find(b => b.branchName === "Beden Eğitimi") !== undefined, true);
}

// ------------------------------------------------- 2. İdarecinin seçimi korunur
console.log("── 2. İdarecinin branş seçimi yeniden yüklemede silinmez");
{
    const w = ortam();
    const st = okulKur(w, "anadolu_lisesi", "9", 3);
    const sec = st.state.subeler[0];
    const DERS = "Sağlık Bilgisi ve Trafik Kültürü";

    const once = (sec.zorunluDersler || []).find(d => d.ders === DERS);
    kontrol("başlangıçta çizelgedeki branş atanmış", once?.atananBrans, "Sağlık Hizmetleri");

    // İdareci üç şubede de dersi Biyoloji'ye alıyor
    for (const s of st.state.subeler) st.updateCourseBranch(s.id, DERS, "Biyoloji");
    const sonra = (sec.zorunluDersler || []).find(d => d.ders === DERS);
    kontrol("seçim uygulandı", sonra?.atananBrans, "Biyoloji");

    // Okulun yeniden yüklenmesi: kaydedilmiş durum tekrar temizlikten geçer
    st.sanitizeExistingState();
    const yenidenYukleme = (st.state.subeler[0].zorunluDersler || []).find(d => d.ders === DERS);
    kontrol("yeniden yüklemeden sonra seçim DURUYOR",
        yenidenYukleme?.atananBrans, "Biyoloji");

    // Saat gerçekten Biyoloji'nin yüküne eklenmiş mi?
    const rapor = raporla(w, st, {});
    const bio = rapor.find(b => b.branchName === "Biyoloji");
    // 3 şube x (Biyoloji 2 saat + Sağlık Bilgisi 1 saat) = 9
    kontrol("saat Biyoloji yüküne eklendi", bio?.totalHours, 9);
    kontrol("Sağlık Hizmetleri artık yük taşımıyor",
        rapor.find(b => b.branchName === "Sağlık Hizmetleri"), undefined);
}

// ------------------------- 3. Kısıtlama yok: atanan ne olursa olsun yüke eklenir
// Kullanıcının kendi verdiği örnek (27.08.2026 teyidi):
//   "Yönetici, norm hesabına dahil edilemeyecek bir branşı derse eklerse
//    herhangi bir kısıtlama yok, sorumluluk yöneticide. Biyoloji branşında
//    4 saat Biyoloji + 2 saat Matematik + 2 saat Sağlık Bilgisi olsa bile
//    Biyoloji'nin ders yükü 4+2+2=8 saat yazacak."
console.log("── 3. Atanan ders ne olursa olsun yüke eklenir (kısıtlama yok)");
{
    const w = ortam();
    const st = w.appState;
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    st.addSection({
        subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 30,
        zorunluDersler: [
            { ders: "Biyoloji", saat: 4, atananBrans: "Biyoloji", kategori: "ORTAK DERSLER", isAtolye: false },
            { ders: "Matematik", saat: 2, atananBrans: "Biyoloji", kategori: "ORTAK DERSLER", isAtolye: false },
            { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 2, atananBrans: "Biyoloji", kategori: "ORTAK DERSLER", isAtolye: false }
        ]
    });

    const dersler = () => st.state.subeler[0].zorunluDersler || [];
    kontrol("üç ders de şubede duruyor", dersler().length, 3);
    kontrol("hepsi Biyoloji'ye atanmış",
        dersler().every(d => d.atananBrans === "Biyoloji"), true);

    st.sanitizeExistingState();
    kontrol("yeniden yüklemeden sonra da hepsi Biyoloji'de",
        dersler().every(d => d.atananBrans === "Biyoloji"), true);

    const rapor = raporla(w, st, {});
    const bio = rapor.find(b => b.branchName === "Biyoloji");
    kontrol("Biyoloji ders yükü 4+2+2 = 8", bio?.totalHours, 8);
    kontrol("8 saat -> 1 norm (Madde 18 barajı 6)", bio?.calculatedNorm, 1);
    kontrol("Matematik ayrı bir satır olarak sayılmıyor",
        rapor.find(b => b.branchName === "Matematik"), undefined);
    kontrol("Sağlık Hizmetleri ayrı bir satır olarak sayılmıyor",
        rapor.find(b => b.branchName === "Sağlık Hizmetleri"), undefined);
}

// ---------------------- 4. Rehberlik dersinin branşı da değiştirilebilir
// Kullanıcı bildirimi (27.08.2026): "Rehberlik ve Yönlendirme dersi otomatik
// 'Rehberlik' branşına atanıyor, değiştirmek istesem de değişmiyor. Biyoloji
// seçtim, seçilmedi; Biyoloji sayısı artmadı."
//
// Sebep: state.js'teki rehberlik düzelticisi her temizlikte branşı koşulsuz
// "Rehberlik" yapıyordu. Seçim uygulanıyor, hemen ardından geri alınıyordu —
// ne hata ne uyarı. Artık yalnızca branş boş/tanınmazsa varsayılan yazılır.
//
// Dersin adı, 1 saat sabitlemesi, mükerrer temizliği ve 12. sınıf kuralı
// DEĞİŞMEDİ; yalnızca branş zorlaması kaldırıldı.
console.log("── 4. Rehberlik dersinin branşı değiştirilebilir ve kalıcıdır");
{
    const w = ortam();
    const st = okulKur(w, "anadolu_lisesi", "9", 1);
    const sec = st.state.subeler[0];
    const reh = () => (sec.zorunluDersler || []).find(d => /Rehberlik/.test(d.ders));
    const bioYuk = () => {
        const b = raporla(w, st, {}).find(x => x.branchName === "Biyoloji");
        return b ? b.totalHours : 0;
    };

    kontrol("varsayılan branş Rehberlik", reh()?.atananBrans, "Rehberlik");
    kontrol("başlangıçta Biyoloji yükü 2", bioYuk(), 2);

    st.updateCourseBranch(sec.id, reh().ders, "Biyoloji");
    kontrol("seçim uygulandı", reh()?.atananBrans, "Biyoloji");

    st.sanitizeExistingState();
    kontrol("temizlikten sonra da Biyoloji (asıl hata buydu)",
        reh()?.atananBrans, "Biyoloji");
    kontrol("saat Biyoloji'ye eklendi: 2 -> 3", bioYuk(), 3);

    // Düzeltmenin diğer kuralları bozmadığı doğrulanır
    kontrol("ders adı hâlâ sabitleniyor", reh()?.ders, "Rehberlik ve Yönlendirme");
    kontrol("saat hâlâ 1'e sabitleniyor", reh()?.saat, 1);

    // Branş silinirse varsayılan geri gelmeli
    st.updateCourseBranch(sec.id, reh().ders, "");
    st.sanitizeExistingState();
    kontrol("branş boşaltılırsa varsayılan Rehberlik geri gelir",
        reh()?.atananBrans, "Rehberlik");

    // VARSAYILAN HÂLDE SAAT SAYILMAZ — kullanıcı kararı (27.08.2026: "böyle
    // kalsın"). Ders "Rehberlik" branşındayken saat hiçbir branşın yüküne
    // yazılmaz; çünkü rehber öğretmenin normu ders saatinden değil öğrenci
    // sayısından hesaplanır (Madde 21) ve sınıf rehberliği yükü, dersi fiilen
    // okutan branş öğretmenine yazılmalıdır.
    //
    // Yani "Rehberlik" varsayılanı "bu saat henüz bir branş öğretmenine
    // verilmedi" anlamına gelir. İdareci atadığında saat o branşa geçer
    // (yukarıdaki kontroller). Uygulama kendiliğinden bir branş SEÇMEZ:
    // hangi öğretmenin sınıf rehberi olduğunu yalnızca okul bilir.
    kontrol("varsayılan hâlde Rehberlik norm listesinde görünmez",
        raporla(w, st, {}).find(b => b.branchName === "Rehberlik"), undefined);
    kontrol("varsayılan hâlde saat hiçbir branşa yazılmaz (Biyoloji 2'ye döner)",
        bioYuk(), 2);
}

// -------------------------------------- 5. Gerçekten sahte olan değerler düzeltilir
console.log("── 5. Branş olmayan değerler yine de düzeltilir");
{
    const w = ortam();
    const ce = w.curriculumEngine;
    const c = (ders, brans) => ce.getCanonicalCourseAndBranch(ders, brans).branchName;

    kontrol("boş branş -> çizelgedeki branş",
        c("Sağlık Bilgisi ve Trafik Kültürü", null), "Sağlık Hizmetleri");
    kontrol('"— Branş Atanmadı —" -> çizelgedeki branş',
        c("Sağlık Bilgisi ve Trafik Kültürü", "— Branş Atanmadı —"), "Sağlık Hizmetleri");
    kontrol("branş yerine ders adı yazılmışsa düzeltilir",
        c("Sağlık Bilgisi ve Trafik Kültürü", "Sağlık Bilgisi ve Trafik Kültürü"),
        "Sağlık Hizmetleri");
    kontrol("gerçek branş seçimi korunur (Biyoloji)",
        c("Sağlık Bilgisi ve Trafik Kültürü", "Biyoloji"), "Biyoloji");
    kontrol("gerçek branş seçimi korunur (Beden Eğitimi)",
        c("Sağlık Bilgisi ve Trafik Kültürü", "Beden Eğitimi"), "Beden Eğitimi");
    kontrol("başka bir ders için de korunur (Matematik -> Fizik)",
        c("Matematik", "Fizik"), "Fizik");
}

console.log("\n" + "=".repeat(68));
if (!hatalar.length) {
    console.log(`✅ BRANŞ SEÇİMİ DOĞRU — ${gecti} kontrol başarılı, 0 hata`);
} else {
    console.log(`❌ ${hatalar.length} HATA (${gecti} kontrol geçti)`);
    hatalar.forEach(h => console.log(h));
}
console.log("=".repeat(68));
process.exit(hatalar.length ? 1 : 0);

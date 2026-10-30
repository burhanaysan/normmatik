/* ===========================================================================
   NormMatik — KURTARMA NOKTALARINA LOGO KONMAZ   (30.10.2026)

   NEDEN VAR
   ---------
   Kurtarma noktası (eski adı "sürüm geçmişi") çalışmanın TAM kopyasıdır. Resmî antet logosu 300-400 KB'lık
   base64 metin olduğundan her noktada yinelenip 10 noktayı 4 MB'a çıkarıyor, tarayıcının ortak kotasını (~5 MB)
   dolduruyor ve ekranda kırmızı "Sürüm geçmişi bu tarayıcıya sığmadı ve temizlendi" uyarısı çıkarıyordu
   (gerçek müşteri hesabına girilince görüldü). Gerçek ölçüm: 23 şubeli okul 77 KB, logoyla 448 KB.

   Bu test şunları KALICI korur:
     1) Yeni kurtarma noktasında logo YOK ve nokta küçük.
     2) Daha önce logolu kaydedilmiş noktalar bir sonraki kayıtta küçülür.
     3) Noktaya geri dönünce şubeler geri gelir, ama MEVCUT logo korunur.
     4) Noktaya geri dönmek mevcut hâli de yeni nokta olarak saklar (vazgeçilebilsin).

   ÇALIŞTIRMA: node tools/test_kurtarmaNoktasi.mjs   (çıkış kodu 0 = geçti)
   ======================================================================== */
import fs from "fs";
import path from "path";
import vm from "vm";

const KOK = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const oku = (...y) => fs.readFileSync(path.join(KOK, ...y), "utf8");

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti = "") => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti !== "" ? "  ->  " + ayrinti : ""));
};

// Gerçekten saklayan bir localStorage taklidi
const depo = new Map();
const yerel = {
    getItem: (k) => (depo.has(k) ? depo.get(k) : null),
    setItem: (k, v) => { depo.set(k, String(v)); },
    removeItem: (k) => { depo.delete(k); },
    clear: () => depo.clear(),
    key: (i) => [...depo.keys()][i] ?? null,
    get length() { return depo.size; }
};
const w = { localStorage: yerel };
const ctx = {
    window: w, self: w, console: { log() {}, warn() {}, error() {}, info() {} },
    fetch: async () => ({ ok: false, status: 0, json: async () => null, text: async () => "" }),
    localStorage: yerel, sessionStorage: yerel, navigator: { userAgent: "node" },
    location: { href: "x", hostname: "localhost" }, screen: { width: 1, height: 1 },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    crypto: { getRandomValues: (a) => a }, CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {}, confirm: () => true
};
ctx.globalThis = ctx; w.dispatchEvent = () => true; w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(oku("js", "bundle.js").replace(/^export /gm, ""), ctx);
await w.dbService.loadDatabase();

const st = w.appState;
const LOGO_ESKI = "data:image/png;base64," + "A".repeat(300000);
const LOGO_YENI = "data:image/png;base64," + "B".repeat(1000);

st.state = st.getDefaultState();
st.state.okulBilgisi.kurumKodu = "424242";
st.state.okulBilgisi.isDemo = false;
st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
st.state.okulBilgisi.antet = { logoBase64: LOGO_ESKI, resmiOkulAdi: "Deneme" };
for (let i = 1; i <= 5; i++) {
    st.state.subeler.push({ id: "s" + i, subeAdi: "9-" + i, sinifSeviyesi: "9", ogrenciSayisi: 20 + i,
        zorunluDersler: [], secmeliDersler: [], rehberlikVarMi: true });
}
const anahtar = st.surumAnahtari();
kontrol("kurtarma noktası anahtarı üretildi", !!anahtar, String(anahtar));

// 1) yeni nokta: logo yok, küçük
kontrol("nokta kaydedildi", st.surumNoktasiKaydet(true) === true);
let ham = yerel.getItem(anahtar) || "";
kontrol("yeni noktada logo YOK", !ham.includes("logoBase64") && !ham.includes("AAAAAAAAAA"), `boyut ${ham.length}`);
kontrol("nokta küçük (logo ~300 KB, nokta < 20 KB)", ham.length < 20000, String(ham.length));
kontrol("nokta şubeleri ve antet adını taşıyor", ham.includes('"subeAdi":"9-1"') && ham.includes("Deneme"));

// 2) eskiden logolu kaydedilmiş nokta bir sonraki kayıtta küçülür
{
    const eskiNokta = [{ id: "sEski", zaman: new Date(Date.now() - 3 * 3600000).toISOString(),
        veri: JSON.parse(JSON.stringify(st.state)) }];     // logolu (eski biçim)
    yerel.setItem(anahtar, JSON.stringify(eskiNokta));
    kontrol("hazırlık: eski nokta logolu", yerel.getItem(anahtar).length > 250000);
    st.surumNoktasiKaydet(true);
    ham = yerel.getItem(anahtar) || "";
    kontrol("eski logolu nokta da küçüldü (logo hiçbir noktada kalmadı)", !ham.includes("logoBase64"), `boyut ${ham.length}`);
    kontrol("eski nokta silinmedi (iki nokta duruyor)", st.surumleriListele().length === 2, String(st.surumleriListele().length));
}

// 3) geri dönüş: şubeler gelir, MEVCUT logo korunur
{
    const liste = st.surumleriListele();
    const hedef = liste[liste.length - 1];                // en eski nokta (5 şubeli)
    st.state.subeler = st.state.subeler.slice(0, 2);      // "yanlışlıkla silme"
    st.state.okulBilgisi.antet.logoBase64 = LOGO_YENI;    // logo sonradan DEĞİŞTİ
    const once = st.surumleriListele().length;
    const ok = st.surumeDon(hedef.id);
    kontrol("noktaya dönüldü", ok === true);
    kontrol("silinen şubeler geri geldi", st.state.subeler.length === 5, String(st.state.subeler.length));
    kontrol("MEVCUT logo korundu (noktadaki eski logo değil)",
        st.state.okulBilgisi.antet && st.state.okulBilgisi.antet.logoBase64 === LOGO_YENI);
    kontrol("antet adı noktadan geri geldi", st.state.okulBilgisi.antet.resmiOkulAdi === "Deneme");
    kontrol("geri dönmeden önceki hâl de yeni nokta olarak saklandı", st.surumleriListele().length === once + 1,
        `${once} -> ${st.surumleriListele().length}`);
}

console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ KURTARMA NOKTASI HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ KURTARMA NOKTASI (logosuz) — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

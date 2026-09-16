/* ===========================================================================
   NormMatik — ÖZEL EĞİTİM: BİRLEŞTİRİLMİŞ SINIF   (16.09.2026)

   NEDEN VAR
   e-Okul özel eğitim öğrencilerini sınıf seviyesine göre ayrı şubelerde gösterir. Gerçek bir
   ortaokulda 6, 7, 8. sınıf özel eğitim şubelerinde 3 + 3 + 1 hafif zihinsel öğrenci vardı; uygulama
   3 şube x 2 = 6 norm veriyordu. ÖEHY 27/3-a / 28/1-a: "Aynı tür yetersizliği olan öğrencilere
   birleştirilmiş sınıf uygulaması ile eğitim yapılır"; Norm Kadro Yön. Md. 17/1: norm "açılan her
   sınıf veya şube için". Kullanıcı kararı: okula birleştirilmiş sınıf uygulayıp uygulamadığı ve
   kaç sınıf oluşturduğu sorulur; uyguluyorsa norm sınıf sayısı x sınıf normu olur.

   ÇALIŞTIRMA: node tools/test_ozelEgitimBirlesikSinif.mjs
   ======================================================================== */
import fs from "fs"; import path from "path"; import url from "url"; import vm from "vm";
const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const oku = (...y) => fs.readFileSync(path.join(KOK, ...y), "utf8");
let gecen = 0; const hatalar = [];
const kontrol = (ad, kosul, ayrinti = "") => { if (kosul) { gecen++; return; } hatalar.push(ad + (ayrinti !== "" ? "  ->  " + ayrinti : "")); };

const w = {};
const fetchSaplama = async (a) => { const s = String(a); if (/^https?:/i.test(s)) return { ok: false, json: async () => null, text: async () => "" };
  const y = path.join(KOK, s.replace(/^\.\//, "").split("?")[0]); if (!fs.existsSync(y)) return { ok: false, status: 404, json: async () => null, text: async () => "" };
  const m = fs.readFileSync(y, "utf8"); return { ok: true, status: 200, json: async () => JSON.parse(m), text: async () => m }; };
const bos = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
const ctx = { window: w, self: w, console: { log() {}, warn() {}, error() {}, info() {} }, fetch: fetchSaplama, localStorage: bos, sessionStorage: bos,
  navigator: { userAgent: "node" }, location: { href: "x", hostname: "localhost" }, screen: {}, setTimeout: () => 0, clearTimeout() {},
  setInterval: () => 0, clearInterval() {}, crypto: { getRandomValues: (a) => a }, CustomEvent: class { constructor(t, o) { Object.assign(this, o); } }, alert() {}, confirm: () => true,
  document: { getElementById: () => null, querySelectorAll: () => [], querySelector: () => null } };
ctx.globalThis = ctx; w.dispatchEvent = () => true; w.addEventListener = () => {}; w.fetch = fetchSaplama;
vm.createContext(ctx);
vm.runInContext(oku("js", "bundle.js").replace(/^export /gm, ""), ctx);
await w.dbService.loadDatabase();
if (w.licenseManager) w.licenseManager.licenseStatus = Object.assign({}, w.licenseManager.licenseStatus, { isValid: true, licenseType: "TEST", isDemo: false, maxSections: -1, allowExport: true });
const ne = w.normEngine, ce = w.curriculumEngine, st = w.appState;

const OO = "ortaokul_temel_egitim", MTAL = "mesleki_ve_teknik_anadolu_lisesi";
const oeSube = (tur, sinif, ogr, engel, ad) => ({ sinifSeviyesi: sinif, subeAdi: ad, ogrenciSayisi: ogr, alanId: "ozel_egitim", dalAdi: "Özel Eğitim Sınıfı",
  isSpecialEdu: true, engelTuru: engel, zorunluDersler: JSON.parse(JSON.stringify(ce.getMandatoryCourses(tur, sinif, "ozel_egitim", "Özel Eğitim Sınıfı") || [])), secmeliDersler: [] });
const hesapla = (tur, subeler, adminOptions = {}) => { st.resetSchool(); st.setSchoolType(tur); subeler.forEach(s => st.addSection(s));
  return ne.calculateSchoolNorms(st.state.subeler, {}, tur, { adminOptions }); };
const OE = (r) => r.branchReport.find(b => b.branchName === "Özel Eğitim");

// ---- 1) Gerçek ortaokul örneği: 6/7/8 hafif zihinsel 3+3+1
const uc = () => [oeSube(OO, "6", 3, "hafif_zihinsel", "6-Özel"), oeSube(OO, "7", 3, "hafif_zihinsel", "7-Özel"), oeSube(OO, "8", 1, "hafif_zihinsel", "8-Özel")];
{
  const K = "hafif_zihinsel|ortaokul";
  const g = ne.ozelEgitimSinifGruplari(uc(), OO);
  kontrol("GRUP üç şube tek grup (aynı tür + kademe)", g.length === 1 && g[0].anahtar === K && g[0].subeler.length === 3 && g[0].ogrenci === 7, JSON.stringify(g.map(x => [x.anahtar, x.subeler.length, x.ogrenci])));
  kontrol("GRUP sınır 10, en az 1 sınıf, sınıf normu 2", g[0].enFazla === 10 && g[0].enAzSinif === 1 && g[0].normSinif === 2, JSON.stringify([g[0].enFazla, g[0].enAzSinif, g[0].normSinif]));
  const r0 = hesapla(OO, uc());
  kontrol("İŞARETSİZ: her şube ayrı sınıf → 6 norm (bugünkü davranış)", OE(r0).calculatedNorm === 6, OE(r0).calculatedNorm);
  const r1 = hesapla(OO, uc(), { ozelEgitimBirlestirilmisSinif: true, ozelEgitimSinifSayilari: { [K]: 1 } });
  kontrol("BİRLEŞTİRİLMİŞ 1 sınıf → 2 norm", OE(r1).calculatedNorm === 2, OE(r1).calculatedNorm);
  kontrol("BİRLEŞTİRİLMİŞ şube satırları toplamı norma eşit", OE(r1).ozelEgitimDetay.reduce((a, x) => a + x.norm, 0) === 2);
  kontrol("BİRLEŞTİRİLMİŞ okul toplam normu en az özel eğitim farkı kadar düştü", r0.totalCalculatedNorm - r1.totalCalculatedNorm >= 4, r0.totalCalculatedNorm + " -> " + r1.totalCalculatedNorm);
  // Alan dersleri (ÖEHY 27/3-e): 3 şube ayrı sınıfken 3 x 2 = 6 saat; birleştirilmiş tek sınıfta 1 x 2 = 2 saat.
  const yuk = (r, ad) => (r.branchReport.find(b => b.branchName === ad) || {}).totalHours || 0;
  kontrol("ALAN DERSİ ayrı şubelerde Görsel Sanatlar 6 saat", yuk(r0, "Görsel Sanatlar") === 6, yuk(r0, "Görsel Sanatlar"));
  kontrol("ALAN DERSİ birleştirilmiş tek sınıfta Görsel Sanatlar 2 saat (sınıf başına bir kez)", yuk(r1, "Görsel Sanatlar") === 2, yuk(r1, "Görsel Sanatlar"));
  kontrol("ALAN DERSİ birleştirilmiş düşüm mutabakatta", r1.yukMutabakati.birlesikSubeDusumu === 16 && r1.yukMutabakati.tutarli === true,
    JSON.stringify(r1.yukMutabakati));
  kontrol("BİRLEŞTİRİLMİŞ özet: 1 sınıf x 2, 7 öğrenci, uygun", (r1.ozelEgitimBirlesikSiniflar || []).length === 1 && r1.ozelEgitimBirlesikSiniflar[0].sinifSayisi === 1
      && r1.ozelEgitimBirlesikSiniflar[0].norm === 2 && r1.ozelEgitimBirlesikSiniflar[0].sinirAsildi === false, JSON.stringify(r1.ozelEgitimBirlesikSiniflar));
  kontrol("BİRLEŞTİRİLMİŞ uygun durumda uyarı yok", (r1.ozelEgitimUyarilari || []).length === 0, JSON.stringify(r1.ozelEgitimUyarilari));
  kontrol("BİRLEŞTİRİLMİŞ dayanak ÖEHY 27/3-a formülde", /ÖEHY 27\/3-a/.test(OE(r1).formulaExplanation), OE(r1).formulaExplanation);
  kontrol("BİRLEŞTİRİLMİŞ ders yükü mutabakatı tutarlı", !!r1.yukMutabakati && r1.yukMutabakati.tutarli === true);
  const r2 = hesapla(OO, uc(), { ozelEgitimBirlestirilmisSinif: true, ozelEgitimSinifSayilari: { [K]: 2 } });
  kontrol("BİRLEŞTİRİLMİŞ 2 sınıf → 4 norm", OE(r2).calculatedNorm === 4, OE(r2).calculatedNorm);
  const r3 = hesapla(OO, uc(), { ozelEgitimBirlestirilmisSinif: true, ozelEgitimSinifSayilari: {} });
  kontrol("İşaretli ama sayı girilmemiş → şube şube (6)", OE(r3).calculatedNorm === 6, OE(r3).calculatedNorm);
  const r4 = hesapla(OO, uc(), { ozelEgitimBirlestirilmisSinif: false, ozelEgitimSinifSayilari: { [K]: 1 } });
  kontrol("Sayı var ama işaret kaldırılmış → şube şube (6)", OE(r4).calculatedNorm === 6, OE(r4).calculatedNorm);
  const r5 = hesapla(OO, uc(), { ozelEgitimBirlestirilmisSinif: true, ozelEgitimSinifSayilari: { [K]: 9 } });
  kontrol("Şube sayısından fazla sınıf, sınır gerektirmiyorsa şube sayısına iner (3 sınıf → 6)", OE(r5).calculatedNorm === 6, OE(r5).calculatedNorm);
}

// ---- 2) Farklı tür / kademe birleşmez
{
  const karma = [oeSube(OO, "6", 3, "hafif_zihinsel", "6-HZ"), oeSube(OO, "7", 2, "hafif_otizm", "7-OT"), oeSube(OO, "4", 3, "hafif_zihinsel", "4-HZ")];
  const g = ne.ozelEgitimSinifGruplari(karma, OO);
  kontrol("TÜR/KADEME hafif zihinsel ortaokul, hafif otizm ortaokul, hafif zihinsel ilkokul ayrı gruplar", g.length === 3, JSON.stringify(g.map(x => x.anahtar)));
  const r = hesapla(OO, karma, { ozelEgitimBirlestirilmisSinif: true, ozelEgitimSinifSayilari: { "hafif_zihinsel|ortaokul": 1, "hafif_otizm|ortaokul": 1, "hafif_zihinsel|ilkokul": 1 } });
  kontrol("TÜR/KADEME tek şubeli gruplar değişmez (2+2+2 = 6)", OE(r).calculatedNorm === 6, OE(r).calculatedNorm);
}

// ---- 3) Mevcut sınırı grup üzerinden: 6 otizmli öğrenci 2 şubede, 1 sınıf girildi
{
  const iki = [oeSube(MTAL, "9", 3, "otizm_orta_agir", "9-OT-A"), oeSube(MTAL, "10", 3, "otizm_orta_agir", "10-OT-B")];
  const r = hesapla(MTAL, iki, { ozelEgitimBirlestirilmisSinif: true, ozelEgitimSinifSayilari: { "otizm_orta_agir|lise": 1 } });
  const b = (r.ozelEgitimBirlesikSiniflar || [])[0] || {};
  kontrol("SINIR 1 sınıfta 6 otizm → aşım, en az 2 sınıf", b.sinirAsildi === true && b.enAzSinif === 2 && b.enFazla === 4, JSON.stringify(b));
  kontrol("SINIR norm girilen sınıfa göre 2 (kendiliğinden bölünmez)", OE(r).calculatedNorm === 2, OE(r).calculatedNorm);
  kontrol("SINIR uyarı listesinde ve Valilik Oluru geçiyor", (r.ozelEgitimUyarilari || []).length === 1 && /Valilik Oluru/.test(r.ozelEgitimUyarilari[0].mesaj), JSON.stringify(r.ozelEgitimUyarilari));
}

// ---- 4) Ekran
{
  st.resetSchool(); st.setSchoolType(OO); uc().forEach(s => st.addSection(s));
  st.state.okulBilgisi.adminOptions = { ozelEgitimBirlestirilmisSinif: true, ozelEgitimSinifSayilari: { "hafif_zihinsel|ortaokul": 1 } };
  const UI = new w.UIComponentManager(w.dbService, st, ne, ce);
  let html = ""; UI.renderModal = (h) => { html = h; };
  let hata = null; try { UI.openTeacherStaffModal(); } catch (e) { hata = e; }
  kontrol("EKRAN Kadro penceresi hatasız açılıyor", !hata, hata && hata.stack);
  kontrol("EKRAN birleştirilmiş sınıf kutusu işaretli geliyor", /id="chk-oe-birlesik" checked/.test(html));
  kontrol("EKRAN grup satırı: 3 şube, 7 öğrenci, girilen 1 sınıf",
    /class="oe-sinif-sayisi[^>]*data-grup="hafif_zihinsel\|ortaokul"[^>]*value="1"/.test(html) && /3 şube \(6-Özel, 7-Özel, 8-Özel\) · 7 öğrenci/.test(html));
  st.resetSchool(); st.setSchoolType(OO); st.addSection({ sinifSeviyesi: "6", subeAdi: "6-A", ogrenciSayisi: 30, zorunluDersler: [], secmeliDersler: [] });
  st.state.okulBilgisi.adminOptions = {};
  let html2 = ""; UI.renderModal = (h) => { html2 = h; }; UI.openTeacherStaffModal();
  kontrol("EKRAN özel eğitim şubesi yoksa bölüm hiç görünmüyor", html2.length > 0 && !/chk-oe-birlesik/.test(html2));
  const ui = oku("js", "uiComponents.js");
  kontrol("EKRAN kayıt: işaret ve sınıf sayıları adminOptions'a yazılıyor",
    /ozelEgitimBirlestirilmisSinif: !!document\.getElementById\("chk-oe-birlesik"\)\.checked/.test(ui) && /ozelEgitimSinifSayilari: \[\.\.\.document\.querySelectorAll\("\.oe-sinif-sayisi"\)\]/.test(ui));
}

if (hatalar.length) { console.log(`❌ test_ozelEgitimBirlesikSinif: ${hatalar.length} hata, ${gecen} geçti`); hatalar.forEach(h => console.log("   - " + h)); process.exit(1); }
console.log(`✅ test_ozelEgitimBirlesikSinif: ${gecen} kontrol geçti`);

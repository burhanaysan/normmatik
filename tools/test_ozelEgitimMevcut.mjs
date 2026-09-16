/* ===========================================================================
   NormMatik — ÖZEL EĞİTİM: ENGEL TÜRÜ, NORM (Md. 17/1) ve SINIF MEVCUDU (ÖEHY)   (16.09.2026)

   NEDEN VAR
   Somut vaka (kullanıcı, 16.09.2026): bir meslek lisesinde 6 otizmli öğrenci. Özel Eğitim Hizmetleri
   Yönetmeliği otizmde sınıf mevcudunu en fazla 4 ile sınırlıyor → 2 sınıf zorunlu; Norm Kadro Yön.
   Md. 17/1-ç her otizm sınıfına 2 norm veriyor → 4 norm. Uygulama otizmi ayrı tür olarak bilmiyordu
   (hafif otizmli lise sınıfına 1 norm verebiliyordu) ve mevcut sınırını hiç denetlemiyordu.

   ÇALIŞTIRMA: node tools/test_ozelEgitimMevcut.mjs
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
  setInterval: () => 0, clearInterval() {}, crypto: { getRandomValues: (a) => a }, CustomEvent: class { constructor(t, o) { Object.assign(this, o); } }, alert() {}, confirm: () => true };
ctx.globalThis = ctx; w.dispatchEvent = () => true; w.addEventListener = () => {}; w.fetch = fetchSaplama;
vm.createContext(ctx);
vm.runInContext(oku("js", "bundle.js").replace(/^export /gm, ""), ctx);
await w.dbService.loadDatabase();
if (w.licenseManager) w.licenseManager.licenseStatus = Object.assign({}, w.licenseManager.licenseStatus, { isValid: true, licenseType: "TEST", isDemo: false, maxSections: -1, allowExport: true });
const ne = w.normEngine, ce = w.curriculumEngine, st = w.appState;
const MTAL = "mesleki_ve_teknik_anadolu_lisesi";
const ih = (engel, sinif, ogr, tur) => ne.ozelEgitimSinifIhtiyaci({ isSpecialEdu: true, engelTuru: engel, sinifSeviyesi: sinif, ogrenciSayisi: ogr }, tur);
const norm = (engel, sinif) => ne.ozelEgitimSubeNormu(engel, sinif);

// ---- 1) Somut vaka: meslek lisesi, 6 otizmli öğrenci
for (const engel of ["otizm_orta_agir", "hafif_otizm"]) {
  const r = ih(engel, "9", 6, MTAL);
  kontrol(`VAKA ${engel}: sınır 4`, r.enFazla === 4, r.enFazla);
  kontrol(`VAKA ${engel}: 2 sınıf gerekir`, r.gerekenSinif === 2 && r.sinirAsildi === true, JSON.stringify(r));
  kontrol(`VAKA ${engel}: sınıflar açılırsa norm 4`, r.olasiNorm === 4, r.olasiNorm);
  kontrol(`VAKA ${engel}: dayanak ÖEHY 32`, /32\//.test(r.dayanak), r.dayanak);
}
kontrol("VAKA mesaj Valilik Oluru ve norm 4'ü söylüyor", /Valilik Oluru/.test(ih("otizm_orta_agir", "9", 6, MTAL).mesaj) && /normu 4/.test(ih("otizm_orta_agir", "9", 6, MTAL).mesaj));

// ---- 2) Norm Md. 17/1
kontrol("17/1-ç hafif otizm LİSEDE 2 (eskiden 1 çıkabiliyordu)", norm("hafif_otizm", "10").norm === 2, JSON.stringify(norm("hafif_otizm", "10")));
kontrol("17/1-ç orta/ağır otizm ilkokulda 2", norm("otizm_orta_agir", "2").norm === 2);
kontrol("17/1-ç orta/ağır zihinsel lisede 2", norm("orta_agir_zihinsel", "11").norm === 2);
kontrol("17/1-d hafif zihinsel ortaokulda 2", norm("hafif_zihinsel", "6").norm === 2);
kontrol("17/1-e hafif zihinsel lisede 1 (değişmedi)", norm("hafif_zihinsel", "9").norm === 1);
kontrol("17/1-b görme ilkokulda 1", norm("gorme", "3").norm === 1);
kontrol("17/1-b işitme ilkokulda 1", norm("isitme", "1").norm === 1);
kontrol("17/1-f birden fazla 2", norm("birden_fazla", "7").norm === 2);
kontrol("bedensel: bent yok, varsayım açıkça yazılı", /bent yok/.test(norm("bedensel", "6").dayanak), norm("bedensel", "6").dayanak);
kontrol("ESKİ kayıt orta_agir_otizm norm 2 ve eski dayanak aynı", norm("orta_agir_otizm", "7").norm === 2 && norm("orta_agir_otizm", "7").dayanak === "Md. 17/1-ç (orta/ağır zihinsel veya otizm)");
kontrol("ESKİ kayıt gorme_isitme ilkokul 1", norm("gorme_isitme", "2").norm === 1);

// ---- 3) Sınıf mevcudu sınırları (ÖEHY)
const S = (engel, sinif, tur) => ne.ozelEgitimSinifSiniri({ isSpecialEdu: true, engelTuru: engel, sinifSeviyesi: sinif }, tur);
kontrol("27/3-c ortaokul hafif zihinsel 10", S("hafif_zihinsel", "6", "ortaokul_temel_egitim").enFazla === 10);
kontrol("27/3-c ortaokul hafif otizm 4", S("hafif_otizm", "6", "ortaokul_temel_egitim").enFazla === 4);
kontrol("27/3-c ilkokul görme 10", S("gorme", "2", "ortaokul_temel_egitim").enFazla === 10);
kontrol("28/1-b→31/2-b ortaokul orta/ağır zihinsel 8", S("orta_agir_zihinsel", "7", "ortaokul_temel_egitim").enFazla === 8);
kontrol("28/1-b→31/2-b ortaokul orta/ağır otizm 4", S("otizm_orta_agir", "7", "ortaokul_temel_egitim").enFazla === 4);
kontrol("28/1-d→32/3-b lise hafif zihinsel 10", S("hafif_zihinsel", "10", "anadolu_lisesi").enFazla === 10);
kontrol("28/1-ç→32/4-c lise orta/ağır zihinsel 8", S("orta_agir_zihinsel", "12", MTAL).enFazla === 8);
kontrol("13/1-c birden fazla 4", S("birden_fazla", "5", "ortaokul_temel_egitim").enFazla === 4);
kontrol("32/3-b özel eğitim meslek okulu otizm 4 / diğer 10", S("hafif_otizm", "9", "ozel_egitim_meslek_okulu").enFazla === 4 && S("hafif_zihinsel", "9", "ozel_egitim_meslek_okulu").enFazla === 10);
kontrol("31/2-b uygulama okulu I-II zihinsel 8", S("orta_agir_zihinsel", "3", "ozel_egitim_uygulama_okulu").enFazla === 8 && /31\/2-b/.test(S("orta_agir_zihinsel", "3", "ozel_egitim_uygulama_okulu").dayanak));
kontrol("32/4-c uygulama okulu III otizm 4", S("otizm_orta_agir", "10", "ozel_egitim_uygulama_okulu").enFazla === 4 && /32\/4-c/.test(S("otizm_orta_agir", "10", "ozel_egitim_uygulama_okulu").dayanak));
kontrol("ESKİ kayıt orta_agir_otizm: sınır yok, türü netleştir notu", S("orta_agir_otizm", "7", "ortaokul_temel_egitim").enFazla === null && /netleştirin/.test(S("orta_agir_otizm", "7", "ortaokul_temel_egitim").not));
kontrol("bedensel: hüküm yok notu", S("bedensel", "7", "ortaokul_temel_egitim").enFazla === null && /bulunamadı/.test(S("bedensel", "7", "ortaokul_temel_egitim").not));
kontrol("ortaokul 14 hafif zihinsel → 2 sınıf, norm 4", ih("hafif_zihinsel", "6", 14, "ortaokul_temel_egitim").gerekenSinif === 2 && ih("hafif_zihinsel", "6", 14, "ortaokul_temel_egitim").olasiNorm === 4);
kontrol("lise 12 hafif zihinsel → 2 sınıf, norm 2 (şube başına 1)", ih("hafif_zihinsel", "9", 12, "anadolu_lisesi").olasiNorm === 2);
kontrol("sınırda (4 otizm) aşım yok", ih("otizm_orta_agir", "9", 4, MTAL).sinirAsildi === false && ih("otizm_orta_agir", "9", 4, MTAL).gerekenSinif === 1);

// ---- 4) Motor: okul hesabı
const oeSube = (tur, sinif, ogr, engel, ad) => ({ sinifSeviyesi: sinif, subeAdi: ad, ogrenciSayisi: ogr, alanId: "ozel_egitim", dalAdi: "Özel Eğitim Sınıfı",
  isSpecialEdu: true, engelTuru: engel, zorunluDersler: JSON.parse(JSON.stringify(ce.getMandatoryCourses(tur, sinif, "ozel_egitim", "Özel Eğitim Sınıfı") || [])), secmeliDersler: [] });
const hesapla = (tur, subeler) => { st.resetSchool(); st.setSchoolType(tur); subeler.forEach(s => st.addSection(s));
  return ne.calculateSchoolNorms(st.state.subeler, {}, tur, { adminOptions: {} }); };
{
  const r = hesapla(MTAL, [oeSube(MTAL, "9", 6, "otizm_orta_agir", "9-Özel")]);
  const oe = r.branchReport.find(b => b.branchName === "Özel Eğitim");
  kontrol("MOTOR vaka: bugünkü tek şube 2 norm (norm açılmış şubeye verilir)", !!oe && oe.calculatedNorm === 2, oe && oe.calculatedNorm);
  kontrol("MOTOR vaka: uyarı üretildi (2 sınıf, norm 4)", (r.ozelEgitimUyarilari || []).length === 1 && r.ozelEgitimUyarilari[0].gerekenSinif === 2 && r.ozelEgitimUyarilari[0].olasiNorm === 4, JSON.stringify(r.ozelEgitimUyarilari));
  kontrol("MOTOR vaka: detayda sınır ve dayanak", !!oe && oe.ozelEgitimDetay[0].enFazla === 4 && /ÖEHY/.test(oe.ozelEgitimDetay[0].sinirDayanak));
  kontrol("MOTOR vaka: mutabakat tutarlı", r.yukMutabakati.tutarli === true);
  const r2 = hesapla(MTAL, [oeSube(MTAL, "9", 4, "otizm_orta_agir", "9-Özel-A"), oeSube(MTAL, "9", 2, "otizm_orta_agir", "9-Özel-B")]);
  const oe2 = r2.branchReport.find(b => b.branchName === "Özel Eğitim");
  kontrol("MOTOR vaka: iki sınıf açılınca norm 4, uyarı yok", !!oe2 && oe2.calculatedNorm === 4 && (r2.ozelEgitimUyarilari || []).length === 0, oe2 && oe2.calculatedNorm);
}
{
  const OMO = "ozel_egitim_meslek_okulu";
  const isaretsiz = (sinif, ogr, ad) => ({ sinifSeviyesi: sinif, subeAdi: ad, ogrenciSayisi: ogr, zorunluDersler: JSON.parse(JSON.stringify(ce.getMandatoryCourses(OMO, sinif, null, null) || [])), secmeliDersler: [] });
  const r = hesapla(OMO, [isaretsiz("9", 12, "9-A"), isaretsiz("10", 10, "10-A")]);
  const oe = r.branchReport.find(b => b.branchName === "Özel Eğitim");
  kontrol("ÖZEL EĞİTİM OKULU: işaretsiz şubeler Md. 17 ile (Md. 18/19 değil)", !!oe && /Md\. 17\/1/.test(oe.formulaExplanation || "") && !/Madde 18/.test(oe.formulaExplanation || ""), oe && oe.formulaExplanation);
  kontrol("ÖZEL EĞİTİM OKULU: 2 şube hafif zihinsel lise = 2 norm", !!oe && oe.calculatedNorm === 2, oe && oe.calculatedNorm);
  kontrol("ÖZEL EĞİTİM OKULU: 12 öğrencili şube için uyarı (en fazla 10)", (r.ozelEgitimUyarilari || []).some(u => u.sube === "9-A" && u.gerekenSinif === 2));
  const UO = "ozel_egitim_uygulama_okulu";
  const u = ne.ozelEgitimSinifIhtiyaci({ sinifSeviyesi: "3", ogrenciSayisi: 9 }, UO);
  kontrol("UYGULAMA OKULU: işaretsiz şube orta/ağır zihinsel varsayılır, sınır 8, norm 2", u.enFazla === 8 && u.normSube === 2 && u.gerekenSinif === 2, JSON.stringify(u));
}

// ---- 5) e-Okul metin eşlemesi
const E = (m) => ne.ozelEgitimTuruMetindenBul(m);
kontrol("e-Okul 'OTİZM' → orta/ağır otizm", E("ÖZEL EĞİTİM SINIFI (OTİZM)") === "otizm_orta_agir");
kontrol("e-Okul 'HAFİF DÜZEY OTİZM' → hafif otizm", E("Hafif Düzeyde Otizm") === "hafif_otizm");
kontrol("e-Okul 'ORTA DÜZEY ZİHİNSEL' → orta/ağır zihinsel", E("ORTA DÜZEY ZİHİNSEL YETERSİZLİK") === "orta_agir_zihinsel");
kontrol("e-Okul 'İŞİTME' → işitme", E("İŞİTME ENGELLİLER SINIFI") === "isitme");
kontrol("e-Okul 'GÖRME' → görme", E("GÖRME ENGELLİLER") === "gorme");
kontrol("e-Okul 'HAFİF ZİHİNSEL' → hafif zihinsel", E("HAFİF ZİHİNSEL ENGELLİLER") === "hafif_zihinsel");
kontrol("e-Okul aktarımı tek eşlemeyi kullanıyor", /ozelEgitimTuruMetindenBul\(satirUpper\)/.test(oku("js", "eOkulImporter.js")));

// ---- 6) Ekran
const ui = oku("js", "uiComponents.js");
for (const v of ["hafif_otizm", "orta_agir_zihinsel", "otizm_orta_agir", "gorme", "isitme", "bedensel"]) kontrol(`ekran: '${v}' seçeneği var`, ui.includes(`value="${v}"`));
kontrol("ekran: öğrenci sayısı değişince uyarı yenileniyor", /sec-students"\)\?\.addEventListener\("input", engelNotYaz\)/.test(ui));
kontrol("ekran: Özel Eğitim kartında sınır uyarısı", /x\.sinirAsildi/.test(ui));
kontrol("ekran: şube kartında sınır uyarısı", /ozelEgitimSinifIhtiyaci\(s, appState/.test(oku("js", "app.js")));

if (hatalar.length) { console.log(`❌ test_ozelEgitimMevcut: ${hatalar.length} hata, ${gecen} geçti`); hatalar.forEach(h => console.log("   - " + h)); process.exit(1); }
console.log(`✅ test_ozelEgitimMevcut: ${gecen} kontrol geçti`);

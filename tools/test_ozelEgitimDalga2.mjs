/* ===========================================================================
   NormMatik — ÖZEL EĞİTİM 2. DALGA: ALAN ÖĞRETMENİ DERSLERİ ve ORTAM UYARILARI   (16.09.2026)

   NEDEN VAR
   Özel eğitim sınıfında bazı dersleri özel eğitim öğretmeni değil ALAN öğretmeni okutur:
     ilkokul: din kültürü ve ahlak bilgisi (görme/işitmede ayrıca yabancı dil)   ÖEHY 27/3-d-e, 31/2-ç
     ortaokul ve ortaöğretim: din kültürü, görsel sanatlar, müzik, beden eğitimi,
     meslek dersleri                                                             ÖEHY 27/3-e, 28/1-ğ, 32/3-c, 32/4-ç
   Bu saatler o alanın ders yüküne girer (Norm Kadro Md. 4/1-d, 22/1-c-1). Uygulama bunları hiçbir
   branşa yazmıyordu. Mevzuatın öngörmediği sınıflar (İHO'da hafif sınıf, normal ortaokulda
   görme/işitme, genel lisede özel eğitim sınıfı, alanı olmayan meslek lisesinde hafif sınıf) için
   uyarı da yoktu. Kural kaynağı: 05_dokumantasyon/ozel_egitim_guncellemesi/KURAL_SETI_OZEL_EGITIM.md

   ÇALIŞTIRMA: node tools/test_ozelEgitimDalga2.mjs
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

const yuk = (r, ad) => (r.branchReport.find(b => b.branchName === ad) || {}).totalHours || 0;
const bran = (r, ad) => r.branchReport.find(b => b.branchName === ad) || {};
const OK = (ders, tur, kademe, sinif, atanan, alanlar = []) => ne.ozelEgitimDersOkutani({ ders, saat: 15, atananBrans: atanan, isAtolye: true, _sinif: sinif }, tur, kademe, alanlar);
const ilkBrans = (o) => (o && o.paylar && o.paylar[0]) ? o.paylar[0].brans : null;
const normalSube = (tur, sinif, ad, alan = null) => ({ sinifSeviyesi: sinif, subeAdi: ad, ogrenciSayisi: 24, alanId: alan,
  zorunluDersler: JSON.parse(JSON.stringify(ce.getMandatoryCourses(tur, sinif, alan, null) || [])), secmeliDersler: [] });

// ---- 1) Kim okutur (kural)
kontrol("KURAL ilkokul DKAB alan öğretmeni", ilkBrans(OK("Din Kültürü ve Ahlak Bilgisi", "hafif_zihinsel", "ilkokul", "4")) === "Din Kültürü ve Ahlak Bilgisi");
kontrol("KURAL ilkokul Görsel Sanatlar özel eğitim öğretmeninde (null)", OK("Görsel Sanatlar", "hafif_zihinsel", "ilkokul", "3") === null);
kontrol("KURAL ilkokul görme sınıfında Yabancı Dil alan öğretmeni", ilkBrans(OK("Yabancı Dil", "gorme", "ilkokul", "3")) === "İngilizce");
kontrol("KURAL ilkokul hafif zihinselde Yabancı Dil kuralı yok (null)", OK("Yabancı Dil", "hafif_zihinsel", "ilkokul", "3") === null);
for (const [ders, brans] of [["Görsel Sanatlar", "Görsel Sanatlar"], ["Müzik", "Müzik"], ["Beden Eğitimi ve Spor", "Beden Eğitimi"], ["Beden Eğitimi, Oyun ve Spor", "Beden Eğitimi"], ["Din Kültürü ve Ahlak Bilgisi", "Din Kültürü ve Ahlak Bilgisi"]]) {
  kontrol(`KURAL ortaokul '${ders}' → ${brans}`, ilkBrans(OK(ders, "orta_agir_zihinsel", "ortaokul", "6")) === brans);
}
kontrol("KURAL ortaokul Türkçe özel eğitim öğretmeninde (null)", OK("Türkçe", "hafif_zihinsel", "ortaokul", "6") === null);
kontrol("KURAL bedensel: hüküm yok, dokunulmaz (B-04)", OK("Müzik", "bedensel", "ortaokul", "6") === null);
{
  const o = OK("İş Eğitimi ve Meslek Ahlakı", "hafif_zihinsel", "lise", "11", "Bilişim Teknolojileri");
  kontrol("KURAL lise İş Eğitimi branş seçilmişse o branşa, atölye", !!o && ilkBrans(o) === "Bilişim Teknolojileri" && o.atolye === true, JSON.stringify(o));
}
kontrol("KURAL lise 11. sınıf İş Eğitimi seçilmemiş → özel eğitimde kalır", OK("İş Eğitimi ve Meslek Ahlakı", "hafif_zihinsel", "lise", "11", "Özel Eğitim", ["Bilişim Teknolojileri"]) === null);
{
  const o = OK("İş Eğitimi ve Meslek Ahlakı", "hafif_zihinsel", "lise", "9", "Özel Eğitim", ["Elektrik-Elektronik Teknolojisi", "Bilişim Teknolojileri"]);
  kontrol("KURAL 9. sınıf İş Eğitimi 15 saat 2 alana eşit: 8 + 7 (ORGM-07 açıklama 5)",
    !!o && o.paylar.length === 2 && o.paylar[0].brans === "Bilişim Teknolojileri" && o.paylar[0].saat === 8 && o.paylar[1].saat === 7, JSON.stringify(o));
}

// ---- 2) Okul hesabı: ortaokul
{
  const r0 = hesapla(OO, [normalSube(OO, "6", "6-A"), normalSube(OO, "7", "7-A")]);
  const r1 = hesapla(OO, [normalSube(OO, "6", "6-A"), normalSube(OO, "7", "7-A"), oeSube(OO, "6", 8, "hafif_zihinsel", "6-Özel")]);
  for (const ad of ["Din Kültürü ve Ahlak Bilgisi", "Görsel Sanatlar", "Müzik", "Beden Eğitimi"]) {
    kontrol(`ORTAOKUL özel sınıfın ${ad} dersi branş yüküne +2`, yuk(r1, ad) === yuk(r0, ad) + 2, yuk(r0, ad) + " -> " + yuk(r1, ad));
  }
  kontrol("ORTAOKUL Türkçe yükü değişmedi", yuk(r1, "Türkçe") === yuk(r0, "Türkçe"));
  const oe = bran(r1, "Özel Eğitim"), d = (oe.ozelEgitimDetay || [])[0] || {};
  kontrol("ORTAOKUL özel eğitim satırı alan saatini içermiyor", d.alanSaat === 8 && oe.totalHours === d.saat, JSON.stringify([d.saat, d.alanSaat, oe.totalHours]));
  kontrol("ORTAOKUL norm yine şube başına 2", oe.calculatedNorm === 2);
  kontrol("ORTAOKUL mutabakat tutarlı", r1.yukMutabakati.tutarli === true, JSON.stringify(r1.yukMutabakati));
  kontrol("ORTAOKUL branş satırında kaynak işaretli", (bran(r1, "Müzik").courses || []).some(c => c.ozelEgitimSinifi && /ÖEHY 27\/3-e/.test(c.note)) && bran(r1, "Müzik").ozelEgitimSinifiSaati === 2);
  kontrol("ORTAOKUL ortam uyarısı yok", (r1.ozelEgitimUyarilari || []).length === 0, JSON.stringify(r1.ozelEgitimUyarilari));

  // Rapor kartı
  const R = new w.MebReportsEngine(w.dbService, ne, ce);
  const grid = R.generateMasterLoadGrid(st.state, "ALL");
  const UI = new w.UIComponentManager(w.dbService, st, ne, ce);
  const html = UI.renderMasterGridReport(grid, false, true);
  const kartlar = html.match(/<section class="dd-brans[^"]*">[\s\S]*?<\/section>/g) || [];
  const muzik = kartlar.find(k => />Müzik</.test(k)) || "";
  kontrol("RAPOR Müzik kartı özel eğitim saatinin yüke yazıldığını söylüyor", /yüküne yazıldı: bu dersleri alan öğretmeni okutur/.test(muzik), muzik.slice(-700));
  kontrol("RAPOR Müzik kartında açıklanamayan fark yok", muzik !== "" && !/diğer düzeltmelerden geliyor/.test(muzik) && !/grup\/branş bölünmesinden/.test(muzik), muzik.slice(-700));
  const ozelKart = kartlar.find(k => k.startsWith('<section class="dd-brans ozel">')) || "";
  kontrol("RAPOR Özel Eğitim kartı dipnotu yeni kuralı anlatıyor", /alan öğretmeni okutur; bu saatler ilgili branşın yüküne yazılır/.test(ozelKart));
}

// ---- 3) Meslek lisesi: 9. sınıf eşit dağıtım, 11. sınıf seçim
{
  const alanli = () => [normalSube(MTAL, "10", "10-BT", "bilisim"), normalSube(MTAL, "10", "10-EL", "elektrik")];
  const r0 = hesapla(MTAL, alanli());
  const r1 = hesapla(MTAL, alanli().concat([oeSube(MTAL, "9", 8, "hafif_zihinsel", "9-Özel")]));
  const at = (r, ad) => bran(r, ad).workshopHours || 0;
  kontrol("MTAL 9 İş Eğitimi: Bilişim +8 atölye", at(r1, "Bilişim Teknolojileri") - at(r0, "Bilişim Teknolojileri") === 8, at(r0, "Bilişim Teknolojileri") + " -> " + at(r1, "Bilişim Teknolojileri"));
  kontrol("MTAL 9 İş Eğitimi: Elektrik +7 atölye", at(r1, "Elektrik-Elektronik Teknolojisi") - at(r0, "Elektrik-Elektronik Teknolojisi") === 7, at(r0, "Elektrik-Elektronik Teknolojisi") + " -> " + at(r1, "Elektrik-Elektronik Teknolojisi"));
  kontrol("MTAL 9 Müzik +2, DKAB +1", yuk(r1, "Müzik") - yuk(r0, "Müzik") === 2 && yuk(r1, "Din Kültürü ve Ahlak Bilgisi") - yuk(r0, "Din Kültürü ve Ahlak Bilgisi") === 1);
  kontrol("MTAL 9 mutabakat tutarlı", r1.yukMutabakati.tutarli === true);
  kontrol("MTAL 9 alanı olan okulda ortam uyarısı yok", (r1.ozelEgitimUyarilari || []).length === 0, JSON.stringify(r1.ozelEgitimUyarilari));

  const r2 = hesapla(MTAL, alanli().concat([oeSube(MTAL, "11", 8, "hafif_zihinsel", "11-Özel")]));
  const d2 = (bran(r2, "Özel Eğitim").ozelEgitimDetay || [])[0] || {};
  const isEg = (oeSube(MTAL, "11", 8, "hafif_zihinsel", "x").zorunluDersler.find(c => /İş Eğitimi/.test(c.ders)) || {}).saat || 0;
  kontrol("MTAL 11 ölçüm geçerli: İş Eğitimi dersi var", isEg === 15, isEg);
  kontrol("MTAL 11 İş Eğitimi branşı seçilmemiş → özel eğitim satırında kalır", d2.saat >= 15 && at(r2, "Bilişim Teknolojileri") === at(r0, "Bilişim Teknolojileri"), JSON.stringify(d2));
  const on2 = oeSube(MTAL, "11", 8, "hafif_zihinsel", "11-Özel");
  on2.zorunluDersler.forEach(c => { if (/İş Eğitimi/.test(c.ders)) c.atananBrans = "Bilişim Teknolojileri"; });
  const r3 = hesapla(MTAL, alanli().concat([on2]));
  kontrol("MTAL 11 İş Eğitimi Bilişim'e verilince +15 atölye", at(r3, "Bilişim Teknolojileri") - at(r2, "Bilişim Teknolojileri") === 15, at(r2, "Bilişim Teknolojileri") + " -> " + at(r3, "Bilişim Teknolojileri"));
  kontrol("MTAL 11 mutabakat tutarlı", r3.yukMutabakati.tutarli === true);
}

// ---- 4) Ortam uyarıları
{
  const u = (tur, sinif, engel) => { const r = hesapla(tur, [oeSube(tur, sinif, 5, engel, sinif + "-Özel")]); return (r.ozelEgitimUyarilari || []).map(x => x.ortamUyarisi || "").join(" | "); };
  kontrol("UYARI İHO'da hafif zihinsel sınıfı (ÖEHY 27/2)", /27\/2/.test(u("imam_hatip_ortaokulu", "6", "hafif_zihinsel")), u("imam_hatip_ortaokulu", "6", "hafif_zihinsel"));
  kontrol("UYARI İHO'da orta/ağır sınıfa uyarı yok", u("imam_hatip_ortaokulu", "6", "orta_agir_zihinsel") === "");
  kontrol("UYARI normal ortaokulda görme sınıfı (ÖEHY 27/1)", /27\/1/.test(u(OO, "6", "gorme")));
  kontrol("UYARI Anadolu lisesinde özel eğitim sınıfı (ÖEHY 28/1)", /28\/1:/.test(u("anadolu_lisesi", "9", "hafif_zihinsel")));
  kontrol("UYARI alanı olmayan meslek lisesinde hafif sınıf (ÖEHY 28/1-e)", /28\/1-e/.test(u(MTAL, "9", "hafif_zihinsel")));
  kontrol("UYARI normal ortaokulda hafif zihinsel sınıfına uyarı yok", u(OO, "6", "hafif_zihinsel") === "");
  kontrol("UYARI özel eğitim okul türünde ortam uyarısı yok", u("ozel_egitim_meslek_okulu", "9", "hafif_zihinsel") === "");
  kontrol("UYARI ekran: kartta ve şube kutusunda", /x\.ortamUyarisi/.test(oku("js", "uiComponents.js")) && /ozelEgitimOrtamUyarisi\(s, appState/.test(oku("js", "app.js")));
}

// ---- 5) Engel türüne göre resmî çizelge (ORGM-01..08)
{
  const A = (tur, g, e) => ce.ozelEgitimCizelgeAdi(tur, g, e);
  kontrol("ÇİZELGE ortaokul hafif zihinsel → ORGM-05", A(OO, "6", "hafif_zihinsel") === "ilkokul_ortaokul");
  kontrol("ÇİZELGE ortaokul hafif otizm → ORGM-05", A(OO, "6", "hafif_otizm") === "ilkokul_ortaokul");
  kontrol("ÇİZELGE ortaokul orta/ağır zihinsel → ORGM-01", A(OO, "6", "orta_agir_zihinsel") === "uygulama_I_II");
  kontrol("ÇİZELGE ilkokul orta/ağır otizm → ORGM-01", A("ilkokul", "2", "otizm_orta_agir") === "uygulama_I_II");
  kontrol("ÇİZELGE ilkokul görme → ORGM-03, işitme → ORGM-04, bedensel → ORGM-02",
    A("ilkokul", "3", "gorme") === "gorme_ilk_orta" && A("ilkokul", "3", "isitme") === "isitme_ilk_orta" && A("ilkokul", "3", "bedensel") === "bedensel_ilk_orta");
  kontrol("ÇİZELGE lise orta/ağır → ORGM-06, görme → ORGM-08, hafif → ORGM-07",
    A(MTAL, "10", "orta_agir_zihinsel") === "uygulama_III" && A(MTAL, "10", "gorme") === "meslek_okulu_gorme" && A(MTAL, "10", "hafif_zihinsel") === "meslek_okulu");
  kontrol("ÇİZELGE türü girilmemiş uygulama okulu şubesi → ORGM-01 / ORGM-06",
    A("ozel_egitim_uygulama_okulu", "5", null) === "uygulama_I_II" && A("ozel_egitim_uygulama_okulu", "11", null) === "uygulama_III");
  kontrol("ÇİZELGE türü girilmemiş meslek okulu şubesi → ORGM-07 (eski davranış)", A("ozel_egitim_meslek_okulu", "9", null) === "meslek_okulu");

  const D = (tur, g, e) => ce.getMandatoryCourses(tur, g, "ozel_egitim", "Özel Eğitim Sınıfı", e) || [];
  const saat = (liste, re) => (liste.find(d => re.test(d.ders)) || {}).saat;
  kontrol("ORGM-01 ortaokul orta/ağır: Görsel Sanatlar 3, Müzik 3, Beden 3, DKAB 1, toplam 30",
    saat(D(OO, "6", "orta_agir_zihinsel"), /^Görsel/) === 3 && saat(D(OO, "6", "orta_agir_zihinsel"), /^Müzik/) === 3
    && saat(D(OO, "6", "orta_agir_zihinsel"), /^Beden/) === 3 && saat(D(OO, "6", "orta_agir_zihinsel"), /^Din/) === 1
    && D(OO, "6", "orta_agir_zihinsel").reduce((t, d) => t + d.saat, 0) === 30, JSON.stringify(D(OO, "6", "orta_agir_zihinsel").map(d => d.ders + ":" + d.saat)));
  kontrol("ORGM-05 ortaokul hafif: Görsel Sanatlar 2 (değişmedi)", saat(D(OO, "6", "hafif_zihinsel"), /^Görsel/) === 2);
  kontrol("ORGM-01 'Hayat Bilgisi ve Günlük Yaşam Becerileri' okundu (ayrıştırıcı düzeltmesi)", saat(D(OO, "6", "orta_agir_zihinsel"), /Günlük Yaşam/) === 3);
  kontrol("ORGM-06 lise orta/ağır: İş ve Beceri Uygulamaları 8, Müzik 2, toplam 30",
    saat(D(MTAL, "10", "orta_agir_zihinsel"), /İş ve Beceri/) === 8 && saat(D(MTAL, "10", "orta_agir_zihinsel"), /^Müzik/) === 2
    && D(MTAL, "10", "orta_agir_zihinsel").reduce((t, d) => t + d.saat, 0) === 30);
  kontrol("ORGM-08 görme meslek okulu: 'Görsel Sanatlar ve Modelaj İş' 2", saat(D(MTAL, "9", "gorme"), /Modelaj/) === 2);
  kontrol("ORGM-03 görme ilkokul 3. sınıf: Yabancı Dil 2", saat(D("ilkokul", "3", "gorme"), /Yabancı Dil/) === 2);

  // S33: normal ortaokulda orta düzey zihinsel sınıfı — alan dersleri şube başına DKAB 1, Görsel 3, Müzik 3, Beden 3
  const n6 = [normalSube(OO, "6", "6-A")];
  const oa = { ...oeSube(OO, "6", 8, "orta_agir_zihinsel", "6-OA"), zorunluDersler: JSON.parse(JSON.stringify(D(OO, "6", "orta_agir_zihinsel"))) };
  const r0 = hesapla(OO, n6), r1 = hesapla(OO, n6.concat([oa]));
  kontrol("S33 Görsel +3, Müzik +3, Beden +3, DKAB +1",
    yuk(r1, "Görsel Sanatlar") - yuk(r0, "Görsel Sanatlar") === 3 && yuk(r1, "Müzik") - yuk(r0, "Müzik") === 3
    && yuk(r1, "Beden Eğitimi") - yuk(r0, "Beden Eğitimi") === 3 && yuk(r1, "Din Kültürü ve Ahlak Bilgisi") - yuk(r0, "Din Kültürü ve Ahlak Bilgisi") === 1,
    ["Görsel Sanatlar", "Müzik", "Beden Eğitimi", "Din Kültürü ve Ahlak Bilgisi"].map(b => b + " " + yuk(r0, b) + "->" + yuk(r1, b)).join(", "));
  kontrol("S33 özel eğitim normu 2, mutabakat tutarlı", bran(r1, "Özel Eğitim").calculatedNorm === 2 && r1.yukMutabakati.tutarli === true);

  // Çağıranlar engel türünü geçiriyor
  const kaynak = ["app.js", "state.js", "eOkulImporter.js", "uiComponents.js"].map(f => oku("js", f)).join("\n");
  kontrol("ÇAĞIRANLAR engel türü geçiriliyor (şube düzenleme, ekleme, tazeleme, sınıf atlatma, e-Okul)",
    (kaynak.match(/sec\.engelTuru \|\| null/g) || []).length >= 4 && /isSpecialEdu \? \(sec\.engelTuru \|\| null\) : null/.test(kaynak)
    && (oku("js", "uiComponents.js").match(/Özel Eğitim Sınıfı" : dalName,\s*\n\s*engelTuru/g) || []).length === 2);
  kontrol("EKRAN engel türü değişince dersler yenileniyor", /\(sectionToEdit\.engelTuru \|\| null\) !== engelTuru/.test(oku("js", "uiComponents.js")));
}

// ---- 6) MESEM'e dokunulmaz
{
  const r = hesapla("mesleki_egitim_merkezi", [oeSube("mesleki_egitim_merkezi", "9", 5, "hafif_zihinsel", "9-Özel")]);
  kontrol("MESEM özel sınıftan branşa saat yazılmıyor", r.branchReport.every(b => !b.ozelEgitimSinifiSaati));
}

if (hatalar.length) { console.log(`❌ test_ozelEgitimDalga2: ${hatalar.length} hata, ${gecen} geçti`); hatalar.forEach(h => console.log("   - " + h)); process.exit(1); }
console.log(`✅ test_ozelEgitimDalga2: ${gecen} kontrol geçti`);

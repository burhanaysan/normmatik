/* ===========================================================================
   NormMatik — SEÇMELİ DERS LİSTELERİ RESMÎ KAYNAĞA BAĞLI   (17.09.2026)

   NEDEN VAR (05_dokumantasyon/secmeli_dersler/)
   Meslek lisesi/ATP, MESEM, meslek ortaokulu ve özel eğitim okullarının seçmeli listesi eski OGM
   dosyalarından ve elle yazılmış listeden geliyordu. Ölçüm: meslek lisesinde 10.552 resmî kayda karşı
   26.371 gösterim (16.817 fazla, 998 eksik, 3.477 saat seçeneği yanlış); MESEM'de 266'ya karşı 15.748;
   özel eğitim okullarında resmî çizelgede seçmeli yokken 768 kayıt. Ayrıca seçmeli listesinde önerilen
   branşın 4264 kayıttan 3128'inde ders ADI branş sanılıyordu (Türkçe büyük harf hatası).
   Kaynaklar: TTKB 2026-62 ve 2024-41 seçmeli tabloları, MTAL/MESEM/Meslek Ortaokulu ÇÖP'leri.
   Üreteç: tools/uret_secmeli_resmi.py -> js/secmeli_resmi.js

   ÇALIŞTIRMA: node tools/test_secmeliResmi.mjs
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

const R = w.SECMELI_RESMI;
const UI = new w.UIComponentManager(w.dbService, st, ne, ce);
const MTAL = "mesleki_ve_teknik_anadolu_lisesi";
const liste = (tur, g, alan = null) => { st.resetSchool(); st.setSchoolType(tur);
  return UI.getAvailableElectivesForSection({ id: "x", subeAdi: "x", sinifSeviyesi: g, ogrenciSayisi: 30, alanId: alan, zorunluDersler: [], secmeliDersler: [] }) || []; };
const ad = (l) => l.map(d => d.ders);

// ---- 1) Veri bütünlüğü
kontrol("VERİ paket içinde", !!R && !!R.mtal_kultur && !!R.mtal_meslek && !!R.mesem && !!R.meslek_ortaokulu);
const k62 = R.mtal_kultur["2026-62"].siniflar, k41 = R.mtal_kultur["2024-41"].siniflar;
kontrol("VERİ 2026-62 ders sayıları (hz 13, 9:21, 10:29, 11:46, 12:42)", k62.hazirlik.length === 13 && k62["9"].length === 21 && k62["10"].length === 29 && k62["11"].length === 46 && k62["12"].length === 42,
  JSON.stringify(Object.fromEntries(Object.entries(k62).map(([k, v]) => [k, v.length]))));
kontrol("VERİ 2024-41 ders sayıları (9:21, 10:29, 11:46, 12:41)", k41["9"].length === 21 && k41["10"].length === 29 && k41["11"].length === 46 && k41["12"].length === 41);
const hucre = (t, g, d) => JSON.stringify((t[g].find(x => x.ders === d) || {}).saatler || null);
kontrol("VERİ görüntüden okunan hücreler: 62 Seçmeli Matematik 11=6, Bilişim 9=1, Proje hz=(2), Hedef Temelli 12=(3..6)",
  hucre(k62, "11", "Seçmeli Matematik") === "[6]" && hucre(k62, "9", "Bilişim Teknolojileri ve Yazılım") === "[1]"
  && hucre(k62, "hazirlik", "Proje Tasarımı ve Uygulamaları") === "[2]" && hucre(k62, "12", "Hedef Temelli Destek Eğitimi") === "[3,4,5,6]");
kontrol("VERİ 62/41 bilinen farklar: 9. sınıf Spor Eğitimi (1)(2) / (1)(2)(3), 12. sınıf Çağdaş Türk ve Dünya Tarihi 2 / (2)(4)",
  hucre(k62, "9", "Spor Eğitimi") === "[1,2]" && hucre(k41, "9", "Spor Eğitimi") === "[1,2,3]"
  && hucre(k62, "12", "Çağdaş Türk ve Dünya Tarihi") === "[2]" && hucre(k41, "12", "Çağdaş Türk ve Dünya Tarihi") === "[2,4]");
kontrol("VERİ MTAL seçmeli meslek: 9 ve 10. sınıfta yok, 11 ve 12'de var",
  Object.values(R.mtal_meslek).every(a => !a["9"] && !a["10"]) && Object.values(R.mtal_meslek).filter(a => a["11"]).length >= 55 && Object.values(R.mtal_meslek).filter(a => a["12"]).length >= 55);
kontrol("VERİ MTAL bilişim 11. sınıf 15 seçmeli meslek dersi (Web Programcılığı 3, Nesnelerin İnterneti 4)",
  R.mtal_meslek.bilisim["11"].length === 15 && R.mtal_meslek.bilisim["11"].some(d => d.ders === "Web Programcılığı" && d.saat === 3)
  && R.mtal_meslek.bilisim["11"].some(d => d.ders === "Nesnelerin İnterneti" && d.saat === 4));
kontrol("VERİ MTAL ders adlarında başlık parçası yok", Object.values(R.mtal_meslek).every(a => Object.values(a).every(l => l.every(d => !/Sınıf Seviyesi|Ders Saati|^Ders |^Saati/i.test(d.ders)))));
kontrol("VERİ aynı ÇÖP'ün ikinci kimlikleri: basim=matbaa, otomotiv=motorluarac, sh=aile",
  JSON.stringify(R.mtal_meslek.basim["11"]) === JSON.stringify(R.mtal_meslek.matbaa["11"]) && JSON.stringify(R.mtal_meslek.otomotiv["12"]) === JSON.stringify(R.mtal_meslek.motorluarac["12"])
  && JSON.stringify(R.mtal_meslek.sh["11"]) === JSON.stringify(R.mtal_meslek.aile["11"]));
kontrol("VERİ MESEM 38 alan, her alanda 7 seçmeli", Object.keys(R.mesem).length === 38 && Object.values(R.mesem).every(a => Object.values(a).flat().length === 7));
kontrol("VERİ MESEM seçmeliler 9. sınıfta; protokollü Konaklama/Yiyecek 11. sınıfta",
  Object.entries(R.mesem).every(([k, a]) => Object.keys(a).length === 1 && (a["9"] || a["11"])) && Object.values(R.mesem).filter(a => a["11"]).length === 2);
kontrol("VERİ MESEM adı Türkçe başlık biçiminde (Peygamberimizin Hayatı)", R.mesem.elektrik_elektronik_teknolojisi["9"].some(d => d.ders === "Peygamberimizin Hayatı"));
// 7. adım bağımsız denetim bulguları (05_dokumantasyon/secmeli_dersler/7_DENETIM.md):
// sayfa kırılmasıyla kesilen tablolar ve MESEM grup adları.
{
  const bek = { elsanat: 24, denizcilik: 14, gazetecilik: 16, itfaiyecilik: 9, kimya: 14, makine: 20, mobilya: 19, motorluarac: 25, rayli: 16, saglik: 14, ayakkabipro: 16 };
  const yanlis = Object.entries(bek).filter(([a, n]) => (R.mtal_meslek[a]["12"] || []).length !== n).map(([a, n]) => a + " " + (R.mtal_meslek[a]["12"] || []).length + "≠" + n);
  kontrol("DENETİM 12. sınıf tabloları sayfa kırılmasında kesilmiyor (11 alan)", yanlis.length === 0, yanlis.join(", "));
  kontrol("DENETİM Gazetecilik 12 ikinci sayfadaki 'Drone Kullanımı' dahil", R.mtal_meslek.gazetecilik["12"].some(d => d.ders === "Drone Kullanımı" && d.saat === 2));
  kontrol("DENETİM MESEM grupları kaynaktaki üç ad", [...new Set(R.mesem.harita_tapu_kadastro["9"].map(d => d.grup))].join("|") === "Din, Ahlak ve Değerler|Spor ve Sosyal Etkinlik|Güzel Sanatlar");
  kontrol("DENETİM MESEM Din grubu dersine Din Kültürü önerisi sürüyor", UI.secmeliDersBransi("Kur'an-ı Kerim", "Din, Ahlak ve Değerler", "mesleki_egitim_merkezi", "9") === "Din Kültürü ve Ahlak Bilgisi");
}
kontrol("VERİ meslek ortaokulu 5:21, 6:27, 7:28, 8:22", ["5", "6", "7", "8"].map(g => R.meslek_ortaokulu.siniflar[g].length).join() === "21,27,28,22");

// ---- 2) Kaynak bağlama
{
  const l = liste(MTAL, "11", "bilisim");
  kontrol("BAĞLAMA MTAL 11 bilişim = 2026-62 11. sınıf + bilişim seçmeli meslek (46 + 15)", l.length === 61 && l.filter(d => d.isVocational).length === 15, l.length);
  kontrol("BAĞLAMA MTAL seçmeli meslek dersinin branşı alanın branşı", l.filter(d => d.isVocational).every(d => d.defaultBranch === "Bilişim Teknolojileri"));
  kontrol("BAĞLAMA MTAL 9. sınıfta seçmeli meslek dersi yok (eskiden 33 gösteriliyordu)", liste(MTAL, "9", "bilisim").every(d => !d.isVocational));
  kontrol("BAĞLAMA ATP aynı kaynak", liste("anadolu_teknik_programi", "12", "bilisim").length === k62["12"].length + R.mtal_meslek.bilisim["12"].length);
  kontrol("BAĞLAMA MTAL eski OGM dersi gelmiyor (ör. Seçmeli Almanca yok)", !ad(liste(MTAL, "11", "bilisim")).some(x => /Almanca/.test(x)));
  kontrol("BAĞLAMA MESEM elektrik 9. sınıf 7 ders, 10. sınıf 0", liste("mesleki_egitim_merkezi", "9", "elektrik_elektronik_teknolojisi").length === 7 && liste("mesleki_egitim_merkezi", "10", "elektrik_elektronik_teknolojisi").length === 0);
  kontrol("BAĞLAMA meslek ortaokulu 5. sınıf 21 ders, elle yazılmış 'Satranç ve Zekâ Oyunları' yok",
    liste("meslek_ortaokulu", "5").length === 21 && !ad(liste("meslek_ortaokulu", "5")).some(x => /Satranç/.test(x)));
  kontrol("BAĞLAMA özel eğitim meslek / uygulama okulunda seçmeli yok", liste("ozel_egitim_meslek_okulu", "10").length === 0 && liste("ozel_egitim_uygulama_okulu", "6").length === 0);
  kontrol("BAĞLAMA diğer türler eski akışta (Anadolu lisesi 11. sınıf havuzdan)", liste("anadolu_lisesi", "11").length > 30);
  // B-S1 KARARI (kullanıcı, 22.09.2026): 10-12'de iki tablo (2026-62 + 2024-41) BİRLİKTE sunulur; kademeli mi
  // olmayacak mı müdürün kararı. Hazırlık ve 9'da iki okuma da 2026-62 der: değişiklik yok.
  const saatOf = (sinif, ders) => (liste(MTAL, sinif, null).find(d => d.ders === ders) || {}).hoursOptions;
  const dersSayisi = (sinif) => liste(MTAL, sinif, null).filter(d => !d.isVocational).length;
  kontrol("B-S1 eski ayar kaldırıldı (sabit yok)", !/const MTAL_SECMELI_KADEMELI/.test(oku("js", "uiComponents.js")));
  kontrol("B-S1 12. sınıf: Çağdaş Türk ve Dünya Tarihi hem 2 hem 4 saat (2026-62: [2], 2024-41: [2,4])",
    JSON.stringify(saatOf("12", "Çağdaş Türk ve Dünya Tarihi")) === "[2,4]", JSON.stringify(saatOf("12", "Çağdaş Türk ve Dünya Tarihi")));
  kontrol("B-S1 12. sınıf: yalnız 2026-62'de olan Hedef Temelli Destek Eğitimi listede",
    liste(MTAL, "12", null).some(d => d.ders === "Hedef Temelli Destek Eğitimi"));
  kontrol("B-S1 12. sınıf: ders sayısı 42 (birleşim, hiçbir ders çoğalmadı)", dersSayisi("12") === 42, dersSayisi("12"));
  kontrol("B-S1 10. sınıf: iki tablo aynı, sayı 29 ve saatler değişmedi", dersSayisi("10") === 29 &&
    liste(MTAL, "10", null).every(d => JSON.stringify(d.hoursOptions) === JSON.stringify((k62["10"].find(x => x.ders === d.ders) || {}).saatler)));
  kontrol("B-S1 11. sınıf: iki tablo aynı, sayı 46 ve saatler değişmedi", dersSayisi("11") === 46 &&
    liste(MTAL, "11", null).every(d => JSON.stringify(d.hoursOptions) === JSON.stringify((k62["11"].find(x => x.ders === d.ders) || {}).saatler)));
  kontrol("B-S1 9. sınıf: yalnız 2026-62 (Sosyal Bilim Çalışmaları [2], eski [2,3] gelmiyor)",
    JSON.stringify(saatOf("9", "Sosyal Bilim Çalışmaları")) === "[2]", JSON.stringify(saatOf("9", "Sosyal Bilim Çalışmaları")));
  kontrol("B-S1 hazırlık: yalnız 2026-62 (13 ders)", dersSayisi("hazirlik") === 13, dersSayisi("hazirlik"));
  kontrol("B-S1 varsayılan seçili saat 2026-62'nin ilki (2)",
    (liste(MTAL, "12", null).find(d => d.ders === "Çağdaş Türk ve Dünya Tarihi") || {}).selectedHour === 2);
  kontrol("B-S1 ek saat seçeneğinin kaynağı iki kararı da anıyor",
    /2026-62/.test((liste(MTAL, "12", null).find(d => d.ders === "Çağdaş Türk ve Dünya Tarihi") || {}).resmiKaynak || "") &&
    /2024-41/.test((liste(MTAL, "12", null).find(d => d.ders === "Çağdaş Türk ve Dünya Tarihi") || {}).resmiKaynak || ""));
}

// ---- 3) Önerilen branş
kontrol("BRANŞ 'Seçmeli Matematik' → Matematik (Türkçe büyük harf)", UI.secmeliDersBransi("Seçmeli Matematik") === "Matematik");
kontrol("BRANŞ 'Kur'an-ı Kerim' → Din Kültürü ve Ahlak Bilgisi", UI.secmeliDersBransi("Kur'an-ı Kerim") === "Din Kültürü ve Ahlak Bilgisi");
kontrol("BRANŞ eşleşmeyen ders adı branş diye önerilmez", UI.secmeliDersBransi("Fütüvvet") === "— Branş Atanmadı —");
{
  let sahte = 0, toplam = 0; const ornek = new Set();
  for (const t of w.dbService.getSchoolTypes()) for (const g of t.gradeLevels) for (const d of liste(t.id, g, t.id.includes("teknik") ? "bilisim" : (t.id.includes("merkezi") ? "elektrik_elektronik_teknolojisi" : null))) {
    toplam++;
    if (d.defaultBranch !== "— Branş Atanmadı —" && !ce.isKnownBranch(d.defaultBranch)) { sahte++; ornek.add(t.id + ":" + d.ders + "→" + d.defaultBranch); }
  }
  kontrol("BRANŞ hiçbir okul türünde ders adı branş diye önerilmiyor", toplam > 2000 && sahte === 0, sahte + "/" + toplam + " " + [...ornek].slice(0, 5).join(" | "));
}

// ---- 3b) Esaslara göre öneri ve seçmeli derslerde resmî alan (Y7) istisnası
kontrol("ESASLAR sıra 16/38: İmam hatipte Kur'an-ı Kerim → İHL Meslek Dersleri, Anadolu lisesinde → Din Kültürü",
  UI.secmeliDersBransi("Kur'an-ı Kerim", "", "anadolu_imam_hatip_lisesi", "10") === "İHL Meslek Dersleri"
  && UI.secmeliDersBransi("Kur'an-ı Kerim", "", "anadolu_lisesi", "10") === "Din Kültürü ve Ahlak Bilgisi");
kontrol("ESASLAR sıra 16: 'Din, Ahlak ve Değer' grubundaki seçmeli → Din Kültürü", UI.secmeliDersBransi("Klasik Ahlak Metinleri", "Din, Ahlak ve Değer", MTAL, "11") === "Din Kültürü ve Ahlak Bilgisi");
kontrol("ESASLAR sıra 78/76: İslam Kültür ve Medeniyeti lisede Tarih, ortaokulda Sosyal Bilgiler",
  UI.secmeliDersBransi("İslam Kültür ve Medeniyeti", "", "anadolu_lisesi", "11") === "Tarih"
  && UI.secmeliDersBransi("İslam Kültür ve Medeniyeti", "", "meslek_ortaokulu", "6") === "Sosyal Bilgiler");
{
  const TUR = "anadolu_lisesi";
  st.resetSchool(); st.setSchoolType(TUR);
  st.addSection({ sinifSeviyesi: "11", subeAdi: "11-A", ogrenciSayisi: 30, zorunluDersler: JSON.parse(JSON.stringify(ce.getMandatoryCourses(TUR, "11", null, null) || [])), secmeliDersler: [
    { ders: "İslam Kültür ve Medeniyeti", saat: 2, atananBrans: "Tarih", kategori: "SEÇMELİ DERSLER" },
    { ders: "Osmanlı Türkçesi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "SEÇMELİ DERSLER" }] });
  const r = ne.calculateSchoolNorms(st.state.subeler, {}, TUR, {});
  const dersBransi = (ad) => (r.branchReport.find(b => (b.courses || []).some(c => c.courseName === ad)) || {}).branchName;
  kontrol("Y7 SEÇMELİ: Tarih öğretmenine verilen İslam Kültür ve Medeniyeti İHL Meslek Dersleri'ne taşınmıyor", dersBransi("İslam Kültür ve Medeniyeti") === "Tarih", dersBransi("İslam Kültür ve Medeniyeti"));
  kontrol("Y7 SEÇMELİ: Din Kültürü öğretmenine verilen Osmanlı Türkçesi korunuyor (esaslar sıra 16)", dersBransi("Osmanlı Türkçesi") === "Din Kültürü ve Ahlak Bilgisi", dersBransi("Osmanlı Türkçesi"));
  kontrol("Y7 SEÇMELİ: ekran matrisi de aynı branşta gösteriyor",
    (() => { const R2 = new w.MebReportsEngine(w.dbService, ne, ce); const grid = R2.generateMasterLoadGrid(st.state, "ALL");
      return !!grid.branchGroups["Tarih"] && Object.values(grid.branchGroups["Tarih"].courses).some(c => /İslam Kültür/.test(c.courseName)); })());
}

// ---- 4) Kural uyarıları
{
  st.resetSchool(); st.setSchoolType(MTAL);
  const s = { id: "x", sinifSeviyesi: "11", alanId: "bilisim", zorunluDersler: [], secmeliDersler: [] };
  const u = (sec, sube = s) => UI.secmeliKuralUyarilari(sube, sec);
  kontrol("KURAL MTAL seçim yokken 3 grup uyarısı", u([]).filter(x => x.tur === "grup").length === 3);
  kontrol("KURAL MTAL her gruptan bir ders + meslek dersi → uyarı yok",
    u([{ ders: "Seçmeli Matematik", saat: 6 }, { ders: "Kur'an-ı Kerim", saat: 2 }, { ders: "Spor Eğitimi", saat: 1 }, { ders: "Web Programcılığı", saat: 3 }]).length === 0);
  kontrol("KURAL saat seçenek dışı uyarısı", u([{ ders: "Seçmeli Matematik", saat: 4 }]).some(x => x.tur === "saat" && /6/.test(x.mesaj)));
  kontrol("KURAL resmî listede olmayan ders uyarısı (seçim silinmez, yalnız uyarı)", u([{ ders: "Satranç", saat: 2 }]).some(x => x.tur === "liste"));
  kontrol("KURAL MTAL hazırlıkta toplam 2 saat", u([{ ders: "Metin Tahlilleri", saat: 1 }], { ...s, sinifSeviyesi: "hazirlik" }).some(x => x.tur === "hazirlik")
    && u([{ ders: "Metin Tahlilleri", saat: 2 }], { ...s, sinifSeviyesi: "hazirlik" }).length === 0);
  st.resetSchool(); st.setSchoolType("meslek_ortaokulu");
  const mo = { id: "m", sinifSeviyesi: "5", zorunluDersler: [], secmeliDersler: [] };
  kontrol("KURAL meslek ortaokulu üç grup", UI.secmeliKuralUyarilari(mo, [{ ders: "Okuma Becerileri", saat: 2 }]).filter(x => x.tur === "grup").length === 2);
  st.resetSchool(); st.setSchoolType("anadolu_lisesi");
  kontrol("KURAL resmî kaynağa bağlı olmayan türde uyarı üretilmez", UI.secmeliKuralUyarilari({ id: "a", sinifSeviyesi: "11" }, [{ ders: "Satranç", saat: 2 }]).length === 0);
  const ui = oku("js", "uiComponents.js");
  kontrol("KURAL seçmeli penceresinde uyarı alanı ve güncelleme", /id="elective-kural-uyari"/.test(ui) && /this\.secmeliKuralUyarilari\(currentSec, Array\.from\(draftSelections\.values\(\)\)\)/.test(ui));
}

// ---- 7. adım denetim bulgusu F-1: Sosyal Bilimler Lisesi hazırlıksız çizelge (TTKB 2025/05 s.6)
{
  const SBL = "sosyal_bilimler_lisesi";
  const hucreUI = (l, d) => JSON.stringify((l.find(x => x.ders === d) || {}).hoursOptions || null);
  const sube = (g) => ({ id: "s" + g, subeAdi: "A", sinifSeviyesi: g, ogrenciSayisi: 30, alanId: null, zorunluDersler: [], secmeliDersler: [] });
  st.resetSchool(); st.setSchoolType(SBL);
  st.state.subeler = [sube("9"), sube("12")];
  const y9 = UI.getAvailableElectivesForSection(sube("9")), y12 = UI.getAvailableElectivesForSection(sube("12"));
  kontrol("F-1 hazırlıksız SBL: 9. sınıf Seçmeli İkinci Yabancı Dil (1)(2)(4)", hucreUI(y9, "SEÇMELİ İKİNCİ YABANCI DİL") === "[1,2,4]", hucreUI(y9, "SEÇMELİ İKİNCİ YABANCI DİL"));
  kontrol("F-1 hazırlıksız SBL: 12. sınıfta Metin Tahlilleri yok", !y12.some(x => x.ders === "METİN TAHLİLLERİ"));
  st.state.subeler = [sube("hazirlik"), sube("9"), sube("12")];
  const h9 = UI.getAvailableElectivesForSection(sube("9")), h12 = UI.getAvailableElectivesForSection(sube("12"));
  kontrol("F-1 hazırlıklı SBL: 9. sınıf Seçmeli İkinci Yabancı Dil (2)(3)(4)", hucreUI(h9, "SEÇMELİ İKİNCİ YABANCI DİL") === "[2,3,4]", hucreUI(h9, "SEÇMELİ İKİNCİ YABANCI DİL"));
  kontrol("F-1 hazırlıklı SBL: 12. sınıfta Metin Tahlilleri (1)(2)", hucreUI(h12, "METİN TAHLİLLERİ") === "[1,2]");
  st.resetSchool();
}

if (hatalar.length) { console.log(`❌ test_secmeliResmi: ${hatalar.length} hata, ${gecen} geçti`); hatalar.forEach(h => console.log("   - " + h)); process.exit(1); }
console.log(`✅ test_secmeliResmi: ${gecen} kontrol geçti`);

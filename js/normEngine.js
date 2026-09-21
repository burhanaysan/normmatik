// MEB Norm Kadro - Norm ve Ders Yükü Hesaplama Motoru (normEngine.js)
//
// TÜM BAREMLER normRulesConfig.js DOSYASINDAN OKUNUR.
// Bu dosyaya sabit sayı yazmayın; yönetmelik değişikliği config'ten yapılır.
import { NORM_RULES_CONFIG } from './normRulesConfig.js';

export class NormEngine {
    /**
     * Şubede gerçek bir meslek alanını GÖSTERMEYEN, yalnızca müfredat
     * çözümlemesi için uydurulmuş alan kimlikleri. isMeslekiKurum() bunları
     * saymaz. Yeni bir sahte kimlik eklenirse buraya da yazılmalıdır.
     */
    static SAHTE_ALAN_KIMLIKLERI = new Set(["ozel_egitim"]);

    // Müdür başyardımcısı ünvanı yürürlükte mi? Ayrıntılı gerekçe
    // calculateAdminNorms() içinde, Madde 6 bölümünün başındadır.
    // false  -> norm üretilmez, arayüz ve raporlarda hiç görünmez
    // true   -> Madde 6 kuralı aynen işler
    //
    // 16.09.2026 KULLANICI KARARI (Denetim yorum defteri Y6): ünvan yeniden AÇILDI.
    // Gerekçe: Norm Kadro Yönetmeliği Md. 6 yürürlükte ve normu KURUMUN YATILI
    // OLMASINA bağlıyor, kişiye değil. "Görevi süren başyardımcı var mı" sorusu
    // normun değil MEVCUT kadronun sorusudur; norm 1 / mevcut 0 olduğunda ekran
    // zaten "ihtiyaç" gösterir. Bu, 26.08.2026 kapatma kararını değiştirir.
    mudurBasyardimcisiUnvaniYururlukte = true;

    // Ders yükü DERSİN RESMÎ ALANINA mı, idarecinin seçtiği branşa mı yazılır?
    // Y7 (kullanıcı kararı 16.09.2026): Md. 22/1-c-1 "O alan içinde ... okutulması
    // gereken dersler birlikte dikkate alınır" -> norm dersin alanına yazılır;
    // idarecinin fiilî dağılımı ders satırında ayrıca gösterilir. Bu, 27.08.2026
    // tarihli "idareci hangi branşı seçerse o" kararını değiştirir.
    // Geri almak için tek satır yeter: false.
    //
    // 22.09.2026 KULLANICI KARARI — Y7 GERİ ALINDI (false): norm, İDARECİNİN SEÇTİĞİ
    // branşa yazılır; 27.08.2026 kararı yeniden geçerlidir. Gerekçe (kullanıcı):
    // bazı derslerin (İslam Bilim Tarihi, Fen Bilimleri Uygulamaları ve benzeri, yüzlerce
    // olabilir) branşı tek değildir, birden fazla branşın normuna eklenebilir; "dersin
    // resmî alanı" tek bir alana bağlanamaz. Hangi branşa verileceği müdürün inisiyatifi
    // ve sorumluluğundadır; mevzuata aykırı bir dağıtım yapılsa bile (Fizik dersini Kimya
    // branşına vermek gibi) uygulama kısıtlamaz, Kimya normu artar. Uygulama karar verici
    // değil, karar destek aracıdır.
    // Y7 kodu (_resmiDersAlani ve "fiilî" rozeti) bayrak kapalıyken hiç çalışmaz; silinmedi.
    normDersinResmiAlaninaYazilir = false;

    constructor() {
        this.rules = NORM_RULES_CONFIG;
    }

    // ======================================================================
    // KALDIRILDI (2026-08-24): branchMatrix / setBranchMatrix
    //
    // Motor bir "branş -> norma dâhil dersler" matrisi TUTUYORDU ama onu
    // HİÇBİR YERDE OKUMUYORDU. app.js her açılışta matrisi yüklüyor,
    // setBranchMatrix() saklıyor, sonra hiçbir hesap ona bakmıyordu.
    //
    // Zararı yalnızca ölü kod olması değildi: bir denetimde "kirli matris
    // norm hesabını bozuyor" sonucuna varılmasına sebep oldu. Meğer matris
    // hesaba hiç girmiyormuş. Anlamlı görünen ölü kod, yanlış teşhis üretir.
    //
    // Branş ataması GERÇEKTE şurada yapılır:
    //     curriculumEngine.getCanonicalCourseAndBranch()
    // ve norm hesabı `course.atananBrans` alanını kullanır.
    //
    // İleride matrisi gerçekten kullanmak istenirse (örn. "bu ders bu branşa
    // atanabilir mi?" doğrulaması), önce kaynağının temizlenmesi gerekir:
    // meb_master_db.json'daki 47 branşın bir kısmının ders listesi kirlidir.
    // ======================================================================

    /**
     * ALAN / ATÖLYE ŞEFLİKLERİNİN NORM YÜKÜNE EKLENEN SAATİ (15.09.2026)
     *
     * adminOptions.alanSefiAlanlari = { "alanAnahtari": 0|1 } (okulda AÇIK alanın şefi; 16.09.2026)
     * adminOptions.alanSefleri   = { "Branş": 0|1 }   (açık alanı olmayan branşta elle şef; eski kayıt)
     * adminOptions.atolyeSefleri = { "Branş": n }   (atölye/laboratuvar şefi sayısı)
     *
     * HER ALANA BİR ŞEF (kullanıcı kararı 16.09.2026, OÖKY Md. 84/1 "açılan her alan"):
     * aynı branşın okuttuğu iki alan açıksa (Bilişim + Siber Güvenlik) branşa 2 alan
     * şefi, 20 saat yazılır. Aynı alan için ikinci alan şefi görevlendirilmez (Md. 84/2)
     * -> alan başına en çok 1. Aynı alanın protokollü ("pro") programı ayrı alan sayılmaz.
     * Alan kaydı yoksa eski branş kaydı (alanSefleri) o branşın bütün alanlarına uygulanır.
     *
     * Dayanak ve saatler normRulesConfig.seflikRules'ta. MESEM'de alan
     * şefliği oluşturulmaz (OÖKY Md. 84/1) -> yalnızca atölye/laboratuvar şefi.
     * Ekran, rapor ve Excel bu tek hesabı kullanır; 10 ve 6 başka yerde yazılmaz.
     *
     * @returns {Object} { "Branş": { alanSefi, atolyeSefi, alanSaat, atolyeSaat, saat } }
     */
    seflikSaatleri(adminOptions = {}, schoolType = "", aktifAlanBranslari = []) {
        const kural = (this.rules && this.rules.seflikRules) || {};
        const alanBirim = Number.isFinite(kural.alanSefiSaat) ? kural.alanSefiSaat : 10;
        const atolyeBirim = Number.isFinite(kural.atolyeLabSefiSaat) ? kural.atolyeLabSefiSaat : 6;
        const tur = String(schoolType || "");
        const mesem = tur.includes("mesleki_egitim_merkezi") || tur.includes("mesem");
        const alanlar = (adminOptions && adminOptions.alanSefleri) || {};
        const atolyeler = (adminOptions && adminOptions.atolyeSefleri) || {};
        // VARSAYILAN: OKULDA AÇIK OLAN HER ALANDA ALAN ŞEFLİĞİ VARDIR (kullanıcı kararı,
        // 16.09.2026). Dayanak OÖKY Md. 84/1: "açılan her alan/bölüm için bir alan/bölüm
        // şefliği ... oluşturulur" — şeflik okulun tercihi değil, yönetmelik gereği.
        // İdareci kutunun işaretini kaldırırsa kayda 0 yazılır ve saat eklenmez.
        const alanKayitlari = (adminOptions && adminOptions.alanSefiAlanlari) || {};
        const bos = (v) => v === undefined || v === null || v === "";
        // Eski çağrılar branş adı listesi verir (branş başına tek alan sayılır).
        const aktifler = (aktifAlanBranslari || []).filter(Boolean)
            .map(a => typeof a === "string" ? { anahtar: null, ad: null, brans: a } : a)
            .filter(a => a.brans);
        const sonuc = {};
        for (const brans of new Set([...Object.keys(alanlar), ...Object.keys(atolyeler), ...aktifler.map(a => a.brans)])) {
            const kayit = alanlar[brans];
            const bransKaydiVar = !bos(kayit);
            const bransAlanlari = aktifler.filter(a => a.brans === brans);
            const sefliAlanlar = [];
            let alanSefi = 0;
            if (bransAlanlari.length) {
                bransAlanlari.forEach(a => {
                    const ak = a.anahtar ? alanKayitlari[a.anahtar] : undefined;
                    const var_ = !bos(ak) ? (parseInt(ak, 10) || 0) > 0
                        : (bransKaydiVar ? (parseInt(kayit, 10) || 0) > 0 : true);
                    if (var_) { alanSefi++; if (a.ad) sefliAlanlar.push(a.ad); }
                });
            } else if (bransKaydiVar && (parseInt(kayit, 10) || 0) > 0) {
                alanSefi = 1;
            }
            if (mesem) { alanSefi = 0; sefliAlanlar.length = 0; }
            const atolyeSefi = Math.max(0, parseInt(atolyeler[brans], 10) || 0);
            const saat = alanSefi * alanBirim + atolyeSefi * atolyeBirim;
            if (saat > 0) {
                sonuc[brans] = {
                    alanSefi, atolyeSefi, alanBirim, sefliAlanlar,
                    alanSaat: alanSefi * alanBirim,
                    atolyeSaat: atolyeSefi * atolyeBirim,
                    atolyeBirim, saat
                };
            }
        }
        return sonuc;
    }

    /**
     * OKULDA AÇIK ALANLARIN ŞEFLİK BRANŞLARI (16.09.2026)
     *
     * "Açılan her alan" (OÖKY Md. 84/1) şubelerde seçilmiş ALANDIR; ders saati değil.
     * Eskiden iki ayrı ölçüt vardı ve ikisi de yanılıyordu:
     *   - ekran: bir meslek branşına herhangi bir ders saati düşmesi -> alanı seçilmemiş
     *     9. sınıfın Görsel Sanatlar kültür dersi "Okulda Aktif Alan" görünüyordu
     *     (canlı okul bildirimi); Sağlık Bilgisi ve Trafik Kültürü de her alanda
     *     Sağlık Hizmetleri'ni aktif gösteriyordu.
     *   - motor: bir branşa atölye kovasında saat düşmesi -> Geleneksel Türk Sanatları
     *     okulunda Türk Dili ve Edebiyatı'na (Osmanlı Türkçesi), Radyo-TV okulunda İHL
     *     Meslek Dersleri'ne varsayılan 10 saat alan şefliği yazılıyordu.
     * Ekran ve motor bu tek ölçütü kullanır. Alanı seçilmemiş şube alan açmaz.
     *
     * Şef hangi branşa yazılır: alanın ATÖLYE derslerinde en çok saati okutan branşa
     * (şef o alanın atölye ve laboratuvar öğretmenlerinden olur, OÖKY Md. 84/A).
     * Alan -> branş tablosuna (AREA_BRANCH_MAP) yalnızca alanın atölye dersi yoksa
     * bakılır. Ölçüm (16.09.2026): Metalürji alanının atölye dersleri Metal
     * Teknolojisi'ne, Plastik Sanatlar alanınınkiler El Sanatları Teknolojisi'ne
     * yazılıyor, tablo ise şefi yüksüz Metalürji / Görsel Sanatlar satırına veriyordu.
     */
    acikAlanBranslari(subeler = [], schoolType = "") {
        return [...new Set(this.acikAlanlar(subeler, schoolType).map(a => a.brans))];
    }

    /**
     * Okulda açık ALANLAR: [{ anahtar, ad, brans, alanIdleri }]. Aynı alanın protokollü
     * programı ("denizcilik" / "denizcilikpro") çizelge başlığındaki alan adı aynı olduğu
     * için tek alan sayılır. Şeflik "her alana bir şef" kuralı bu listeyle çalışır.
     */
    acikAlanlar(subeler = [], schoolType = "") {
        const ce = (typeof window !== 'undefined' && window.curriculumEngine)
            ? window.curriculumEngine
            : (typeof curriculumEngine !== 'undefined' ? curriculumEngine : null);
        const harita = (ce && ce.AREA_BRANCH_MAP) || {};
        const gecerli = (b) => !!b && b !== "Mesleki Gelişim" && b !== "— Branş Atanmadı —"
            && !(ce && typeof ce.isKnownBranch === "function" && !ce.isKnownBranch(b));
        const adBul = (alanId) => (ce && typeof ce.alanAdi === "function") ? ce.alanAdi(alanId) : String(alanId);
        const anahtarYap = (ad) => {
            const n = (ce && typeof ce.normalizeName === "function") ? ce.normalizeName(ad) : String(ad).toLowerCase();
            return n.replace(/[^a-z0-9]/g, "").replace(/alani$/, "") || "alan";
        };
        const alanlar = {};   // anahtar -> { ad, alanIdleri:Set, saatler:{ branş: atölye saati } }
        (subeler || []).forEach(s => {
            const alanId = s && s.alanId;
            if (!alanId || NormEngine.SAHTE_ALAN_KIMLIKLERI.has(alanId)) return;
            if (this.ozelEgitimSubesiMi(s, schoolType)) return;
            if (harita[alanId] === "Mesleki Gelişim") return;
            const ad = adBul(alanId);
            const anahtar = anahtarYap(ad);
            const kayit = alanlar[anahtar] || (alanlar[anahtar] = { ad, alanIdleri: new Set(), saatler: {} });
            kayit.alanIdleri.add(alanId);
            [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])].forEach(d => {
                if (!d || !d.isAtolye) return;
                const b = d.atananBrans || d.brans;
                if (!gecerli(b)) return;
                kayit.saatler[b] = (kayit.saatler[b] || 0) + (parseFloat(d.saat) || 0);
            });
        });
        const sonuc = [];
        Object.entries(alanlar).forEach(([anahtar, k]) => {
            const tablo = [...k.alanIdleri].map(id => harita[id]).find(Boolean);
            const enCok = Math.max(0, ...Object.values(k.saatler));
            let brans = null;
            if (enCok > 0) {
                const adaylar = Object.keys(k.saatler).filter(b => k.saatler[b] === enCok)
                    .sort((a, b) => a.localeCompare(b, 'tr'));
                brans = adaylar.includes(tablo) ? tablo : adaylar[0];
            } else {
                brans = tablo;
            }
            if (gecerli(brans)) sonuc.push({ anahtar, ad: k.ad, brans, alanIdleri: [...k.alanIdleri] });
        });
        return sonuc.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    }

    /**
     * Md. 22/4-a: bire bir çalışma gerektiren dersin azami yükü.
     * "haftalık ders saati sayısına her iki öğrenci için 6 saate kadar" ilave.
     */
    bireBirTavanYuku(haftalikSaat, ogrenciSayisi) {
        const kural = (this.rules.specialCourseRules && this.rules.specialCourseRules.bireyselCalgi) || {};
        const ilave = Number.isFinite(kural.ilaveSaatHerIkiOgrenci) ? kural.ilaveSaatHerIkiOgrenci : 6;
        const saat = parseInt(haftalikSaat, 10) || 0;
        const ogrenci = Math.max(0, parseInt(ogrenciSayisi, 10) || 0);
        return saat + ilave * Math.floor(ogrenci / 2);
    }

    /**
     * DERSİN RESMÎ ALANI (Y7). Kaynak sırası:
     *   1) Okul türüne ve sınıfa duyarlı ÇİZELGE verisi (getMandatoryCourses).
     *      Bu ayrım şarttır: "T.C. İnkılap Tarihi ve Atatürkçülük" ORTAOKULDA
     *      Sosyal Bilgiler alanının, LİSEDE Tarih alanınındır. Elle yazılmış
     *      ders->branş tablosu bu farkı bilmez; tek başına kullanılsaydı gerçek
     *      bir ortaokulun doğru kaydını bozardı (16.09.2026 ölçümü).
     *   2) Çizelgede bulunmayan ders için getCanonicalCourseAndBranch.
     * Hiçbiri bulunamazsa null döner ve idarecinin seçimi korunur.
     *
     * SEÇMELİ DERS İSTİSNASI (17.09.2026): şubenin SEÇMELİ listesinde olup zorunlu çizelgesinde
     * olmayan derste 2. adım UYGULANMAZ. Seçmeli derslerin resmî "tek alanı" yoktur; TTKB Öğretmenlik
     * Alanları Esasları bir seçmeliyi çoğu kez birden fazla alana verir (Osmanlı Türkçesi: Din Kültürü
     * sıra 16, Tarih 78, Türk Dili ve Edebiyatı 84). Elle yazılmış eşleme tablosu tek alan seçip
     * idarecinin esaslara uygun seçimini eziyordu: Anadolu lisesinde Tarih öğretmenine verilen İslam
     * Kültür ve Medeniyeti İHL Meslek Dersleri normuna taşınıyordu (esaslarda o satırda yok).
     */
    _resmiDersAlani(cName, sec, schoolType, kategori) {
        const ce = (typeof window !== 'undefined' && window.curriculumEngine)
            ? window.curriculumEngine
            : (typeof curriculumEngine !== 'undefined' ? curriculumEngine : null);
        if (!ce || !cName) return null;
        const sinif = sec && sec.sinifSeviyesi;
        const alanId = (sec && sec.alanId) || null;
        const dal = (sec && sec.dalAdi) || null;
        const anahtar = [schoolType, sinif, alanId, dal, (sec && sec.engelTuru) || ""].join("|");
        this._cizelgeBransBellegi = this._cizelgeBransBellegi || new Map();
        let harita = this._cizelgeBransBellegi.get(anahtar);
        if (!harita) {
            harita = new Map();
            try {
                (ce.getMandatoryCourses(schoolType, sinif, alanId, dal, (sec && sec.engelTuru) || null) || []).forEach(d => {
                    const ad = this.normalizeText(d.ders || d.ders_adi || "");
                    const brans = String(d.atananBrans || "").trim();
                    if (ad && brans) harita.set(ad, brans);
                });
            } catch (e) { /* çizelge üretilemedi: yedek yola düşülür */ }
            this._cizelgeBransBellegi.set(anahtar, harita);
        }
        const cizelgeBrans = harita.get(this.normalizeText(cName));
        if (cizelgeBrans) return cizelgeBrans;
        const adAnahtari = this.normalizeText(cName);
        const secmeliMi = (sec && sec.secmeliDersler || []).some(d => this.normalizeText(d.ders || d.ders_adi || "") === adAnahtari)
            && !(sec && sec.zorunluDersler || []).some(d => this.normalizeText(d.ders || d.ders_adi || "") === adAnahtari);
        if (secmeliMi) return null;
        try {
            const r = ce.getCanonicalCourseAndBranch(cName, null, alanId, kategori || "ORTAK DERSLER");
            const b = r && r.branchName;
            if (b && b !== "— Branş Atanmadı —" && b !== "Diğer") return b;
        } catch (e) { /* yok sayılır */ }
        return null;
    }

    /**
     * Şubenin öğrenci sayısı (Denetim N-06, 16.09.2026). 0 geçerli bir sayıdır;
     * yalnızca alan hiç girilmemişse eski varsayılan 30 kullanılır. Eskiden
     * "|| 30" 0'ı da 30 sayıyordu: öğrencisi 0'a düşürülen GSL müzik şubesinde
     * Çalgı Eğitimi 30 öğrenciye göre hesaplanıyor, branşa +90 saat yazılıyordu.
     * Motor, ekrandaki ders satırı ve atölye raporu bu tek kuralı kullanır.
     */
    subeOgrenciSayisi(sube) {
        const n = parseInt(sube && sube.ogrenciSayisi, 10);
        return Number.isFinite(n) ? Math.max(0, n) : 30;
    }

    /**
     * Kural tablosunu dışarıdan değiştirmeye izin verir (test ve simülasyon için).
     */
    setRules(rules) {
        this.rules = rules || NORM_RULES_CONFIG;
    }

    /**
     * Mevzuattaki "A-B'ye kadar" kademe tablolarını çözer.
     * `untilBelow` ÜST SINIRI DIŞLAR: { untilBelow: 31, norm: 1 } => 6..30
     * @param {number} value - Ölçülen değer (saat veya öğrenci sayısı)
     * @param {Array} tiers - [{ untilBelow, norm|groups }, ...]
     * @param {string} outKey - "norm" veya "groups"
     * @returns {number|null} Kademe değeri; hiçbir kademeye girmiyorsa null
     */
    resolveTier(value, tiers, outKey) {
        for (const tier of (tiers || [])) {
            if (value < tier.untilBelow) return tier[outKey];
        }
        return null; // taşma bölgesinde
    }

    /**
     * Kademe tablosunun üstünde kalan (taşma) bölge için norm hesaplar.
     * Formül: baseNorm + floor(artan / interval) + (kalan >= residualBonus ? 1 : 0)
     */
    resolveOverflowNorm(hours, overflow) {
        const extra = hours - overflow.appliesAboveHours;
        if (extra <= 0) return overflow.baseNorm;
        const whole = Math.floor(extra / overflow.intervalHours);
        const residual = extra % overflow.intervalHours;
        const bonus = residual >= overflow.residualBonusMinHours ? 1 : 0;
        return overflow.baseNorm + whole + bonus;
    }

    /**
     * Kurum, işletmelerde meslek eğitimi (koordinatörlük) yapan bir MESLEKİ
     * kurum mu? Başlıktaki etiket, kadro panelindeki koordinatörlük alanı ve
     * koordinatörlük saatlerinin norma eklenmesi bu tek karara bağlıdır.
     *
     * NEDEN TEK YERDE (müşteri bildirimi, 09.09.2026)
     * ----------------------------------------------
     * Aynı kural app.js'te iki, uiComponents.js'te bir, burada bir olmak üzere
     * DÖRT kopya hâlinde yazılıydı ve hepsinde şu vardı:
     *     subeler.some(s => s.alanId)
     * Oysa eOkulImporter.js özel eğitim şubelerine SAHTE bir alan kimliği
     * yazar: alanId = "ozel_egitim". Sonuç: içinde bir özel eğitim şubesi olan
     * ORTAOKUL "mesleki kurum" sayılıyor, başlıkta "Kadro & Koordinatörlük"
     * çıkıyor ve koordinatörlük saati girme alanı açılıyordu. Ortaokulda
     * işletmelerde meslek eğitimi yoktur; oraya girilen saat normu şişirirdi.
     *
     * "ozel_egitim_meslek_okulu" okul TÜRÜ "meslek" içerdiği için mesleki
     * sayılmaya devam eder; o kurumlarda işletmelerde meslek eğitimi vardır.
     */
    isMeslekiKurum(schoolType, subeler) {
        const t = String(schoolType || "");
        if (t.includes("meslek") || t.includes("teknik") || t.includes("mtegm")) {
            return true;
        }
        // Gerçek bir alana bağlı şube varsa mesleki kurumdur; sahte alanlar hariç.
        return (subeler || []).some(
            (s) => s && s.alanId && !NormEngine.SAHTE_ALAN_KIMLIKLERI.has(s.alanId));
    }

    /**
     * MEB Norm Kadro Yönetmeliği Madde 22/1-ç
     * Atölye / laboratuvar derslerinde şubenin kaç gruba bölüneceğini hesaplar.
     *
     * ÖNEMLİ: Grup sayısı SINIF SEVİYESİNE göre değişir.
     *   9. sınıf     : 10-20 -> 1, 21-30 -> 2, 31+ -> 3 (tavan 3)
     *   10/11/12.    :  8-16 -> 1, 17-24 -> 2, 25-32 -> 3, 33+ -> 4
     * Kaynaştırma öğrencisi varsa ilgili gruplar ikiye bölünür, tavan 5'tir.
     *
     * @param {number} studentCount - Şubedeki öğrenci sayısı
     * @param {string|number} gradeLevel - Sınıf seviyesi ("9","10","11","12")
     * @param {number} inclusionStudentCount - Kaynaştırma öğrencisi sayısı
     * @returns {number} Grup sayısı
     */
    calculateWorkshopGroups(studentCount, gradeLevel = null, inclusionStudentCount = 0) {
        const cfg = this.rules.workshopGroupRules;
        const count = parseInt(studentCount, 10) || 0;
        const grade = String(gradeLevel == null ? "" : gradeLevel).trim();

        // Sınıf seviyesi bilinmiyorsa, öğrenci lehine olmayan (dar) baremi
        // uygulamak yerine üst sınıf baremini kullanırız: veri setinde
        // sinifSeviyesi alanı her zaman doludur, bu yalnızca emniyet payıdır.
        const isGrade9 = grade === "9";
        const scale = isGrade9 ? cfg.grade9 : cfg.upperGrades;

        // Asgari bölünme mevcudunun altındaysa şube bölünmez.
        if (count < scale.minStudentsToSplit) return 1;

        let groups = this.resolveTier(count, scale.tiers, "groups");
        if (groups === null) groups = scale.groupsAboveTiers;

        // Kaynaştırma yoksa mevzuat tavanı 4'tür (9. sınıfta zaten 3).
        groups = Math.min(groups, cfg.maxGroupsWithoutInclusion);

        // Madde 22/1-ç kapanış hükmü: en az 2 kaynaştırma öğrencisi bulunan
        // gruplar ikiye bölünür; grup sayısı hiçbir şekilde 5'i geçemez.
        const inclusion = parseInt(inclusionStudentCount, 10) || 0;
        //
        // EŞİT DAĞITIM (Denetim N-14, 16.09.2026): hüküm "öğrencilerin gruplara
        // EŞİT SAYIDA dağıtılması kaydıyla" bölünme veriyor. k öğrenci g gruba en
        // dengeli dağıtılınca her gruba floor(k/g), kalan (k mod g) gruba bir
        // fazlası düşer; en az m öğrencisi olan grup sayısı buradan bulunur.
        // Eski formül floor(k/2) öğrencileri ikişer ikişer aynı gruba topluyordu:
        // 24 öğrenci, 2 grup, 2 kaynaştırma -> 3 grup (doğrusu 2).
        if (cfg.inclusion.enabled && inclusion >= cfg.inclusion.minStudentsPerSplit) {
            const m = cfg.inclusion.minStudentsPerSplit;
            const taban = Math.floor(inclusion / groups);
            const kalan = inclusion % groups;
            const splittableGroups = taban >= m ? groups : (taban + 1 >= m ? kalan : 0);
            groups = groups + splittableGroups;
        }

        return Math.min(groups, cfg.absoluteMaxGroups);
    }

    /**
     * MEB Norm Kadro Yönetmeliği Madde 22/2 (18/8/2022-31927 Sayılı Resmî Gazete)
     * Mesleki Eğitim Merkezleri (MESEM) İşletmelerde Meslek Eğitimi Çırak Grubu Hesabı
     * @param {number} totalApprentices - Alandaki tüm sınıf seviyelerinde kayıtlı toplam çırak sayısı
     * @returns {number} Grup Sayısı (0 - 12)
     */
    /**
     * Bu ders, çerçeve programın "İŞLETMELERDE MESLEKİ EĞİTİM" bloğundan mı?
     *
     * ÖLÇÜT KATEGORİ, ADI DEĞİL (11.09.2026). 861 MESEM çizelgesi tarandı:
     * adında "İşletme" geçen 5 ders bu blokta DEĞİL — "Girişimcilik ve İşletme
     * Yönetimi", "Doğal Gaz Altyapım ve İşletme", "Ev ve Süs Hayvanları
     * İşletmeciliği", "Su Ürünlerinin İşletmeye Kabulü", "Ingot-Wafer İşletme
     * ve Bakım". Bunlar gerçek ders yüküdür; ada bakan bir eşleşme onları da
     * siler ve okulun yükünü haksız yere düşürür.
     */
    mesemIsletmeDersiMi(course) {
        if (!course) return false;
        const hedef = this.normalizeText(this.rules.mesemApprenticeRules.isletmeKategorisi);
        return this.normalizeText(String(course.kategori || "")) === hedef;
    }

    /**
     * Md. 22/2'nin atıf yaptığı "grup oluşturma sayısı" (Md. 22/1-ç).
     * 9. sınıfta 10, 10-12. sınıflarda 8. Değerler workshopGroupRules'tan
     * okunur — yönetmelik zaten aynı bende atıf yapıyor, iki yerde ayrı sayı
     * tutmak ileride sessiz bir çelişki üretirdi.
     */
    mesemGrupOlusturmaEsigi(sinifSeviyesi) {
        const g = this.rules.workshopGroupRules;
        return String(sinifSeviyesi) === "9"
            ? g.grade9.minStudentsToSplit
            : g.upperGrades.minStudentsToSplit;
    }

    /**
     * MESEM'de bu ders, ŞUBE ders yükü hesabına girer mi?
     *
     * Md. 22/2 iki ayrı hüküm getiriyor:
     *
     *  1) İşletmelerde meslek eğitimi dersinin yükü çizelgedeki saatiyle değil,
     *     ÇIRAK BAREMİYLE bulunur (grup sayısı x çerçeve saati). Bu yüzden ders
     *     şube yükünden çıkarılır; yükü aşağıda alan bazında ayrıca eklenir.
     *     Çıkarılmazsa aynı saat iki kez sayılır (ölçüldü: her şubede +32 saat,
     *     ~+1 norm).
     *
     *  2) "...bir şubedeki öğrenci sayısının birinci fıkranın (ç) bendinde
     *     belirtilen grup oluşturma sayısının altında olması durumunda
     *     işletmelerde meslek eğitimi dersi DIŞINDAKİ alan/dal dersleri ders
     *     yükü hesabına dâhil edilmez."
     *
     * Ortak/seçmeli dersler bu hükmün dışındadır; onlar her hâlükârda sayılır.
     */
    mesemDersHaricMi(course, sec) {
        if (this.mesemIsletmeDersiMi(course)) {
            return { haric: true, sebep: "Md. 22/2: yükü çırak baremiyle hesaplanır" };
        }
        const kat = String(course.kategori || "");
        const alanDersiMi = kat.includes("MESLEK") || !!course.isAtolye;
        if (!alanDersiMi) return { haric: false, sebep: "" };

        const esik = this.mesemGrupOlusturmaEsigi(sec.sinifSeviyesi);
        const ogrenci = parseInt(sec.ogrenciSayisi, 10) || 0;
        if (ogrenci < esik) {
            return {
                haric: true,
                sebep: `Md. 22/2: şubede ${ogrenci} çırak var, grup oluşturma sayısı ${esik};`
                     + " işletme dışı alan/dal dersleri yük hesabına dâhil edilmez"
            };
        }
        return { haric: false, sebep: "" };
    }

    calculateMesemApprenticeGroups(totalApprentices) {
        const cfg = this.rules.mesemApprenticeRules;
        const count = parseInt(totalApprentices, 10) || 0;

        if (count < cfg.minApprenticesForFirstGroup) return 0;
        if (count < cfg.firstTierUntilBelow) return 1;

        const extra = count - (cfg.firstTierUntilBelow - 1);
        const groups = 1 + Math.ceil(extra / cfg.intervalApprentices);
        return Math.min(groups, cfg.maxGroups);
    }

    /**
     * Bir dersin ders yükünün MADDE 19 (atölye ve laboratuvar) kapsamına mı,
     * yoksa MADDE 18 (genel bilgi ve meslek dersleri) kapsamına mı gireceğini
     * belirler. İki madde AYRI kadro ve AYRI formül kullandığı için bu ayrım
     * norm hesabının doğruluğu açısından kritiktir.
     *
     * @returns {boolean} true ise Madde 19 (atölye/lab) yüküdür
     */
    isWorkshopLabCourse(course, schoolType = "") {
        const cfg = this.rules.workshopLabNorm;
        const cName = this.normalizeText(course.ders || course.ders_adi || "");
        const matches = (pattern) => cName.includes(this.normalizeText(pattern));

        // Ad kalıbı atölye/lab'a uysa bile istisna listesindeyse genel bilgi sayılır.
        if ((cfg.courseNameExclusions || []).some(matches)) return false;

        // AD KALIBI YALNIZCA MESLEKÎ KURUMDA GEÇERLİ (kullanıcı kararı, 15.09.2026;
        // Denetim N-02 devamı). Özel program fen lisesinde "Fizik Laboratuvarı",
        // güzel sanatlarda "İki Boyutlu Sanat Atölye", imam hatipte "Mesleki
        // Gelişim Atölyesi" gibi dersler yalnızca ADLARI yüzünden atölye (Md. 19)
        // sayılıyordu; bu okullarda genel ders (Md. 18) sayılır. Okul türü
        // bilinmiyorsa (boş) eski davranış sürer. Çerçeve programın açık isAtolye
        // işareti her türde geçerlidir.
        const turBilinmiyor = !String(schoolType || "").trim();
        if ((turBilinmiyor || this.isMeslekiKurum(schoolType, []))
            && (cfg.courseNamePatterns || []).some(matches)) return true;

        // Veri setinden gelen açık işaret
        if (course.isAtolye === true) return true;

        return false;
    }

    /**
     * Ders ve Okul Türüne Göre Grup / Çalgı / Norm Çarpanını Değerlendirir
     * @param {Object} course - Ders nesnesi
     * @param {number} studentCount - Şube öğrenci sayısı
     * @param {string} schoolType - Okul türü
     * @param {string|number} gradeLevel - Şubenin sınıf seviyesi (Madde 22/1-ç için ZORUNLU)
     * @param {number} inclusionStudentCount - Şubedeki kaynaştırma öğrencisi sayısı
     * @returns {Object} { groupCount, calculatedLoad, note, loadCategory }
     */
    evaluateCourseMultiplier(course, studentCount, schoolType = "", gradeLevel = null, inclusionStudentCount = 0) {
        const otomatik = this._otomatikGrupHesapla(
            course, studentCount, schoolType, gradeLevel, inclusionStudentCount);

        // İDARECİNİN SEÇİMİ (course.grupSayisi)
        //
        // Mevzuat grup bölünmesinin ÜST SINIRINI verir; okulun o dersi fiilen
        // kaç grupta okuttuğu okulun kendi kararıdır. Örnek (kullanıcı
        // bildirimi, 28.08.2026): Anadolu Lisesi'nde seçmeli Kur'an-ı Kerim,
        // 30 mevcutta otomatik 2 gruba bölünüyor ve ders yükü 2 saatten 4
        // saate çıkıyordu. Okul dersi tek grupta okutuyorsa bu yük gerçek
        // değildi ve norm fazla çıkıyordu.
        //
        // Seçim yalnızca AŞAĞI çekebilir: üst sınır mevzuattan gelir, kimse
        // barem üstüne çıkamaz. Seçim yoksa otomatik değer aynen kullanılır.
        const secim = parseInt(course.grupSayisi, 10);
        if (Number.isFinite(secim) && secim >= 1 && otomatik.groupCount > 1
            && secim < otomatik.groupCount) {
            const baseHours = parseInt(course.saat || course.ders_saati || 0, 10) || 0;
            // Bire bir derste okulun seçimi de Md. 22/4-a tavanını aşamaz (N-04).
            const secimYuku = Number.isFinite(otomatik.tavanYuk)
                ? Math.min(baseHours * secim, otomatik.tavanYuk)
                : baseHours * secim;
            return {
                groupCount: secim,
                calculatedLoad: secimYuku,
                note: `Grup sayısı okul tarafından ${secim} olarak belirlendi `
                    + `(mevzuat baremi ${otomatik.groupCount}).`,
                loadCategory: otomatik.loadCategory,
                otomatikGrup: otomatik.groupCount,
                elleAyarlandi: true
            };
        }

        return Object.assign({}, otomatik, {
            otomatikGrup: otomatik.groupCount,
            elleAyarlandi: false
        });
    }

    /**
     * EĞİK ÇİZGİLİ DERSLER — hangi branşlara bölünebilir?
     *
     * Resmî çizelgelerde bazı dersler alternatifleriyle birlikte tek satırda
     * yazılır: "Görsel Sanatlar/Müzik", "Beden Eğitimi ve Spor/Görsel
     * Sanatlar/Müzik". Çizelgenin açıklaması şöyle der:
     *
     *   "Öğrenciler ilgi, istek ve OKULUN İMKÂNLARI doğrultusunda ... bu
     *    derslerden sadece birini seçer."   (TTKB Sayı 05)
     *
     * Yani bir şubedeki öğrenciler iki-üç branşa dağılabilir ve HER ÖĞRETMEN
     * KENDİ GRUBUNA dersin tam saatini okutur. Okul 30 kişilik şubeyi görsel
     * sanatlar ve müzik diye ikiye bölerse, 2 saatlik ders okula 4 saat yük
     * getirir (2 + 2). Uygulama 28.08.2026'ya kadar saatin TAMAMINI tek branşa
     * yazıyordu: 9. sınıfta hepsi Görsel Sanatlar'a, Müzik'e sıfır; 12. sınıfta
     * hepsi Beden Eğitimi'ne. Bir branş hiç görünmüyor, okul toplamı da eksik
     * çıkıyordu. (Okul müdürü bildirimi, 28.08.2026.)
     *
     * GÜVENLİ KAPI: parçalar, uygulamanın GERÇEK branş listesine karşı
     * doğrulanır. Yalnızca en az iki parçası tanınan branşa çözülen dersler
     * bölünebilir sayılır. Böylece "Bağlama/Kanun/Ut" (hepsi müzik),
     * "Takım Sporları/Bireysel Sporlar" (hepsi beden eğitimi) ve meslek
     * atölyesi alternatifleri ("CNC/CAM") yanlışlıkla bölünmez.
     */
    bolunebilirBranslar(course) {
        const ad = String(course && (course.ders || course.ders_adi) || "");
        if (!ad.includes("/")) return [];

        const ce = (typeof window !== 'undefined' && window.curriculumEngine)
            ? window.curriculumEngine
            : (typeof curriculumEngine !== 'undefined' ? curriculumEngine : null);
        if (!ce || typeof ce.isKnownBranch !== 'function'
            || typeof ce.getCanonicalCourseAndBranch !== 'function') return [];

        const parcalar = ad.replace(/\(.*?\)/g, " ")
            .split("/").map(x => x.replace(/\*/g, "").trim()).filter(Boolean);
        if (parcalar.length < 2) return [];

        const branslar = [];
        for (const p of parcalar) {
            let b = "";
            try { b = (ce.getCanonicalCourseAndBranch(p, null, null, "ORTAK DERSLER") || {}).branchName || ""; }
            catch (e) { continue; }
            if (b && ce.isKnownBranch(b) && !branslar.includes(b)) branslar.push(b);
        }
        return branslar.length >= 2 ? branslar : [];
    }

    /**
     * "Hedef Temelli Destek Eğitimi" dersi mi?
     *
     * 12. sınıf çizelgelerinde 3/4/5/6 saat seçenekli yer alır. Türkçe büyük
     * harf tuzağı yüzünden düz .toLowerCase() ile aranmaz: "TEMELLİ" küçültünce
     * i'nin üstüne ayrı bir nokta karakteri gelir ve eşleşme kaçar. (Bu hataya
     * bu dersi ararken bizzat düşüldü.)
     */
    hedefTemelliMi(course) {
        const ad = String(course && (course.ders || course.ders_adi) || "")
            .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i").toLowerCase();
        return ad.includes("hedef temelli");
    }

    /**
     * Bu dersin saatinin paylaştırılabileceği branşlar ve saat sınırları.
     *
     * Çizelge açıklaması (TTKB, taslak damgasız iki belgeden doğrulandı):
     *   "Hedef temelli destek eğitimi ... okul idarelerince planlamanın
     *    yapılacağı derstir. İçeriğinde Türk dili ve edebiyatı, fizik, kimya,
     *    biyoloji, tarih, coğrafya, felsefe, matematik, sosyoloji, psikoloji,
     *    mantık, birinci yabancı dil, çağdaş Türk ve dünya tarihi, T.C. inkılap
     *    tarihi ve Atatürkçülük, din kültürü ve ahlak bilgisi ile Türk kültür
     *    ve medeniyet tarihi derslerinden DERS BAŞINA EN AZ 1, EN FAZLA 3 SAAT
     *    verilerek ... program uygulanır."
     *
     * 16 ders adı, uygulamanın kendi branş listesine çözülüp tekilleştirilir
     * (sosyoloji/psikoloji/mantık -> Felsefe; inkılap tarihi -> Tarih gibi):
     * 10 branş kalır. Liste ELLE YAZILMAZ — tools/uret_hedef_temelli.py
     * çizelgelerden üretir.
     */
    hedefTemelliBranslari() {
        const H = (typeof window !== 'undefined' && window.HEDEF_TEMELLI)
            ? window.HEDEF_TEMELLI
            : (typeof HEDEF_TEMELLI !== 'undefined' ? HEDEF_TEMELLI : null);
        const ce = (typeof window !== 'undefined' && window.curriculumEngine)
            ? window.curriculumEngine
            : (typeof curriculumEngine !== 'undefined' ? curriculumEngine : null);
        if (!H || !ce || typeof ce.isKnownBranch !== 'function') {
            return { branslar: [], enAz: 1, enFazla: 3 };
        }
        const branslar = [];
        for (const d of (H.kapsamDersleri || [])) {
            let b = "";
            try { b = (ce.getCanonicalCourseAndBranch(d, null, null, "ORTAK DERSLER") || {}).branchName || ""; }
            catch (e) { continue; }
            if (b && ce.isKnownBranch(b) && !branslar.includes(b)) branslar.push(b);
        }
        return {
            branslar,
            enAz: H.enAzSaat || 1,
            enFazla: H.enFazlaSaat || 3
        };
    }

    /**
     * Bir ders kaydını, okulun seçtiği branş sayısı kadar kayda genişletir.
     *
     * Bölme YAPILMAZSA (varsayılan) tek kayıt döner — bugünkü davranış.
     * Okul `bolunenBranslar` seçtiyse her branş için ayrı kayıt döner ve her
     * biri dersin TAM saatini taşır; çünkü her öğretmen kendi grubuna aynı
     * saati okutur.
     *
     * NEDEN TEK YERDE: aynı genişletme hem norm hesabında, hem ekranda, hem
     * raporlarda gerekiyor. Üç ayrı yerde yazılsaydı biri güncellenip diğeri
     * unutulurdu — bu projede tam olarak o hata defalarca yaşandı.
     */
    dersiGenislet(course) {
        // A) SAAT PAYLAŞTIRMA — "Hedef Temelli Destek Eğitimi"
        //
        // Buradaki mantık, aşağıdaki eğik çizgi bölmesinin TERSİDİR:
        //   eğik çizgi : 2 saat x 2 branş = 4 saat  (ÇARPAR)
        //   hedef temelli: 3 saat -> 1+1+1          (PAYLAŞTIRIR)
        // Çünkü şubenin çizelgeden gelen 3-6 saatlik hakkı, seçilen derslere
        // bölünerek kullanılır; toplam artmaz. (Okul müdürü teyidi, 28.08.2026:
        // "3 saati üçe bölüp 1'er saat farklı branşlardan verdik.")
        const dagilim = (course && course.bransDagilimi && typeof course.bransDagilimi === "object")
            ? course.bransDagilimi : null;
        if (dagilim && this.hedefTemelliMi(course)) {
            const { branslar, enAz, enFazla } = this.hedefTemelliBranslari();
            const toplamHak = parseInt(course.saat || course.ders_saati || 0, 10) || 0;
            const kayitlar = [];
            let kullanilan = 0;
            for (const [brans, ham] of Object.entries(dagilim)) {
                const saat = parseInt(ham, 10);
                if (!Number.isFinite(saat) || saat < enAz) continue;
                if (!branslar.includes(brans)) continue;          // kapsam dışı branş
                const kirpilmis = Math.min(saat, enFazla);        // mevzuat tavanı
                if (kullanilan + kirpilmis > toplamHak) continue;  // hakkı aşamaz
                kullanilan += kirpilmis;
                kayitlar.push(Object.assign({}, course, {
                    atananBrans: brans,
                    saat: kirpilmis,
                    _dagitilmisBrans: brans
                }));
            }
            if (kayitlar.length) return kayitlar;
            // Geçerli dağıtım yoksa dersi olduğu gibi bırak; sessizce
            // kaybetmek en kötüsü olurdu.
            return [course];
        }

        // B) EĞİK ÇİZGİLİ DERSLERDE BRANŞA BÖLME (çarpan)
        const secilen = (course && Array.isArray(course.bolunenBranslar))
            ? course.bolunenBranslar.filter(Boolean) : [];
        if (secilen.length < 2) return [course];

        const izinli = this.bolunebilirBranslar(course);
        const gecerli = secilen.filter(b => izinli.includes(b));
        if (gecerli.length < 2) return [course];

        return gecerli.map(b => Object.assign({}, course, {
            atananBrans: b,
            _bolunmusBrans: b,
            _bolunmeSayisi: gecerli.length
        }));
    }

    /**
     * Mevzuata göre OTOMATİK grup sayısını hesaplar (idarecinin seçimi hariç).
     * evaluateCourseMultiplier bunun üzerine okulun kendi tercihini uygular.
     */
    _otomatikGrupHesapla(course, studentCount, schoolType = "", gradeLevel = null, inclusionStudentCount = 0) {
        const isWorkshop = this.isWorkshopLabCourse(course, schoolType);
        const loadCategory = isWorkshop ? "ATOLYE" : "GENEL";

        const baseHours = parseInt(course.saat || course.ders_saati || 0, 10);
        if (isNaN(baseHours) || baseHours <= 0) {
            return { groupCount: 1, calculatedLoad: 0, note: "", loadCategory };
        }

        const cName = this.normalizeText(course.ders || course.ders_adi || "");
        const sType = String(schoolType || "").toLowerCase();
        const isMesem = sType.includes("mesleki_egitim_merkezi") || sType.includes("mesem");

        const matchesCourse = (pattern) => {
            return cName.includes(this.normalizeText(pattern));
        };

        // 0-A. OKUL TÜRÜ KAPISI (Md. 22/1-ç, 22/2, 22/4)
        //
        // Grup bölünmesi yalnızca meslekî-teknik kurumlar ile spor ve güzel
        // sanatlar liselerinde vardır; imam hatipte ise çizelgenin kendi
        // hükmüyle (Kur'an-ı Kerim 25+) sınırlıdır. Anadolu/Fen/Sosyal
        // Bilimler liseleri ve genel ortaokulda HİÇBİR DERS bölünemez.
        //
        // KAPI NEDEN GEREKLİ: aşağıdaki kuralların hiçbiri okul türüne
        // bakmıyordu. Ölçüldü (05.09.2026) — genel ortaokulda seçmeli
        // Kur'an-ı Kerim şube başına 2 saatten 4 saate çıkıyordu; hükmün
        // dayanağı yalnızca İMAM HATİP ortaokulu çizelgesindedir.
        // Aynı açık, atölye adı taşıyan ya da isAtolye işaretli bir dersin
        // genel lisede de bölünmesine yol açıyordu.
        if (!this.grupBolunmesiSerbestMi(schoolType)) {
            return {
                groupCount: 1,
                calculatedLoad: baseHours,
                note: "",
                loadCategory
            };
        }

        // 0. MESEM Özel Kuralı (Madde 22/2): Okuldaki alan/dal derslerinde şubeler gruplara BÖLÜNMEZ.
        if (isMesem) {
            return {
                groupCount: 1,
                calculatedLoad: baseHours,
                note: matchesCourse("İŞLETMELERDE MESLEKİ EĞİTİM") ? "MESEM Staj Yükü (Madde 22/2 Bareminde Hesaplanır)" : "",
                loadCategory
            };
        }

        // BİRE BİR / SES EĞİTİMİ KAPISI (Denetim N-07, 16.09.2026)
        // Md. 22/4 spor ve güzel sanatlar liselerinin ALAN derslerini kapsar;
        // AİHL musiki programı çizelgesi (açıklama 23-24) aynı ilaveyi tanır.
        // İmam hatip ORTAOKULU ve spor lisesi çizelgelerinde bire bir ders tanımı
        // yok: İHO'da seçmeli "Bireysel Çalgı Eğitimi" 30 öğrencide 30 grup
        // sayılıyordu. Kapı yalnız bu iki kuralı sınırlar; atölye kuralı aynen.
        const bireBirTurMu = sType.includes("guzel_sanatlar") || sType.includes("imam_hatip_lisesi");

        // 1. Güzel Sanatlar Bire Bir Çalgı Eğitimi (Madde 22/4-a)
        //
        // TAVAN (Denetim N-04, 15.09.2026): Md. 22/4-a bu derslerin yükünü
        // "haftalık ders saati sayısına her iki öğrenci için 6 saate KADAR"
        // ilave ederek bulur. Yani yük en çok  saat + 6 x (öğrenci / 2)  olabilir.
        // Eski hesap öğrenci başına tam saat yazıyordu (saat x öğrenci); 4 saatlik
        // 9. sınıf Çalgı Eğitimi'nde bu tavanı aşıyor ve Müzik normunu şişiriyordu
        // (2 şube x 20 öğrenci: 160 saat; tavan 128). Tavan aşılmıyorsa hesap aynı.
        if (bireBirTurMu && (matchesCourse("BİREYSEL ÇALGI") || matchesCourse("BIREYSEL CALGI") || matchesCourse("ÇALGI EĞİTİMİ") || matchesCourse("CALGI EGITIMI"))) {
            const count = Math.max(1, parseInt(studentCount, 10) || 1);
            const hamYuk = baseHours * count;
            const tavanYuk = this.bireBirTavanYuku(baseHours, count);
            const load = Math.min(hamYuk, tavanYuk);
            return {
                groupCount: count,
                calculatedLoad: load,
                tavanYuk,
                note: load < hamYuk
                    ? `Bire bir ders (Md. 22/4-a): ${count} öğrenci x ${baseHours} saat = ${hamYuk}s; yönetmelik tavanı ${baseHours} + 6 x ${Math.floor(count / 2)} = ${tavanYuk}s uygulandı`
                    : `Bireysel Çalgı (Md. 22/4-a): ${count} öğrenci x ${baseHours} saat = ${load}s yük`,
                loadCategory
            };
        }

        // 2. Güzel Sanatlar Ses Eğitimi (2'şer Kişilik Grup)
        //
        // "Toplu Ses Eğitimi" bir GRUP dersidir (çizelge: şube en çok 3 gruba
        // ayrılır, grup en az 8 öğrenci). Alt dize eşleşmesi onu 2'şerli bire bir
        // derse çeviriyordu (30 öğrenci -> 15 grup). Grup dersine ilave okulun
        // kararıdır (Md. 22/4-b); karar girilebilene kadar tek grup sayılır.
        if (bireBirTurMu && (matchesCourse("SES EĞİTİMİ") || matchesCourse("SES EGITIMI")) && !matchesCourse("TOPLU")) {
            const groups = Math.max(1, Math.ceil(studentCount / 2));
            return {
                groupCount: groups,
                calculatedLoad: baseHours * groups,
                note: `Ses Eğitimi (2'li Grup): ${groups} grup x ${baseHours} saat = ${baseHours * groups}s yük`,
                loadCategory
            };
        }

        // 3. İmam Hatip Kur'an-ı Kerim 25+ Kuralı
        //
        // DAYANAK YALNIZ DÖGM ÇİZELGELERİNDE (Denetim N-07, 16.09.2026): AİHL ve
        // İHO çizelgeleri "Kur'an-ı Kerim dersinin ... mevcudu 25'i geçen sınıflar
        // iki gruba ayrılabilir" diyor. Spor ve güzel sanatlar liselerinin
        // çizelgelerinde böyle bir hüküm yok; "KUR'AN" alt dizesi de "Kur'an
        // Okuma Teknikleri" gibi başka dersleri yakalıyordu. Kural artık yalnız
        // imam hatip türlerinde ve yalnız "Kur'an-ı Kerim" dersinde.
        const kuranIKerim = /^kur'?an i kerim\b/.test(cName);
        if (kuranIKerim && sType.includes("imam_hatip") && !matchesCourse("ANLAM")) {
            if ((parseInt(studentCount, 10) || 0) > 25) {
                return {
                    groupCount: 2,
                    calculatedLoad: baseHours * 2,
                    note: `Kur'an-ı Kerim (25+ Mevcut): 2 grup x ${baseHours} saat = ${baseHours * 2}s yük`,
                    loadCategory
                };
            }
        }

        // 4. Mesleki ve Teknik Uygulamalı / Atölye / Laboratuvar Dersleri (Norm Yön. Md. 22/1-ç)
        const isVocationalSchool = sType.includes("meslek") || sType.includes("teknik") || schoolType.includes("AMP") || schoolType.includes("ATP");

        if (isWorkshop && (isVocationalSchool || course.isAtolye)) {
            const groups = this.calculateWorkshopGroups(studentCount, gradeLevel, inclusionStudentCount);
            const gradeLabel = gradeLevel ? `${gradeLevel}. sınıf, ` : "";
            const inclusionNote = (parseInt(inclusionStudentCount, 10) || 0) >= 2
                ? ` (${inclusionStudentCount} kaynaştırma öğrencisi dâhil)`
                : "";
            return {
                groupCount: groups,
                calculatedLoad: baseHours * groups,
                note: groups > 1
                    ? `Atölye/Lab (Md. 22/1-ç): ${gradeLabel}${studentCount} öğrenci ➔ ${groups} grup x ${baseHours}s = ${baseHours * groups}s yük${inclusionNote}`
                    : "",
                loadCategory
            };
        }

        // Standart Kültür ve Teorik Alan Dersi (1 Grup)
        return {
            groupCount: 1,
            calculatedLoad: baseHours,
            note: "",
            loadCategory
        };
    }

    /**
     * BİRLEŞİK DERS BİLEŞENLERİ (Denetim N-03, 15.09.2026)
     *
     * Bir ders birden çok şubede birleştirilerek tek sınıfta okutuluyorsa bu
     * şubeler bir BİLEŞENDİR. Birleştirme penceresi bağları ikili kaydeder
     * (11-A'dan 11-B ve 11-C işaretlenince A-B ve A-C oluşur, B-C oluşmaz);
     * burada bağlar geçişli olarak toplanır ve üç şube tek sınıf sayılır.
     *
     * Yük bileşenin kimliği en küçük şubesinde BİR kez işlenir (sıradan
     * bağımsız). Grup sayısı birleşik sınıfın TOPLAM mevcuduyla bulunur:
     * Md. 22/1-ç grubu "bir şubedeki" öğrenciye göre verir ve birleşik sınıf
     * fiilen tek şubedir. Norm motoru ve Ders Dağılımı raporu aynı hesabı
     * kullanır; iki yerde ayrı yazılmaz.
     *
     * @returns {Map} "şubeKimliği##dersAdı[::pay]" ->
     *                { kimlik, temsilci, uyeler, ogrenci, kaynastirma, sinif }
     */
    birlesikDersBilesenleri(subeler = [], schoolType = "") {
        const ozelMi = (sec) => this.ozelEgitimSubesiMi(sec, schoolType);
        const dersAnahtari = (c) => {
            const pay = c._bolunmusBrans || c._dagitilmisBrans || "";
            return (c.ders || c.ders_adi) + (pay ? "::" + pay : "");
        };
        const kokBul = (ebeveyn, x) => {
            while (ebeveyn.get(x) !== x) x = ebeveyn.get(x);
            return x;
        };
        const birlestir = (ebeveyn, a, b) => {
            if (!ebeveyn.has(a)) ebeveyn.set(a, a);
            if (!ebeveyn.has(b)) ebeveyn.set(b, b);
            const ka = kokBul(ebeveyn, a);
            const kb = kokBul(ebeveyn, b);
            if (ka === kb) return;
            if (String(ka) < String(kb)) ebeveyn.set(kb, ka);
            else ebeveyn.set(ka, kb);
        };

        const sahipler = {};    // dersAnahtari -> Map(subeKimligi -> şube)
        const ebeveynler = {};  // dersAnahtari -> Map(subeKimligi -> ebeveyn)
        (subeler || []).forEach(sec => {
            if (!sec || ozelMi(sec)) return;
            [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])]
                .reduce((liste, c) => liste.concat(this.dersiGenislet(c)), [])
                .forEach(c => {
                    if (!c || !(c.ders || c.ders_adi)) return;
                    const k = dersAnahtari(c);
                    (sahipler[k] = sahipler[k] || new Map()).set(sec.id, sec);
                    const bag = Array.isArray(c.birlesikSubeler) ? c.birlesikSubeler : [];
                    if (!bag.length) return;
                    const e = ebeveynler[k] = ebeveynler[k] || new Map();
                    bag.forEach(hedef => {
                        if (hedef != null && hedef !== sec.id) birlestir(e, sec.id, hedef);
                    });
                });
        });

        const sonuc = new Map();
        for (const [k, e] of Object.entries(ebeveynler)) {
            const gruplar = new Map();
            for (const id of e.keys()) {
                const kok = kokBul(e, id);
                if (!gruplar.has(kok)) gruplar.set(kok, []);
                gruplar.get(kok).push(id);
            }
            for (const hamUyeler of gruplar.values()) {
                // Yalnızca dersi FİİLEN taşıyan şubeler sayılır (silinmiş bir
                // şubeye kalan bağ birleşme yaratmaz).
                const uyeler = hamUyeler.filter(id => sahipler[k].has(id))
                    .sort((a, b) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0));
                if (uyeler.length < 2) continue;
                const subeListesi = uyeler.map(id => sahipler[k].get(id));
                const ogrenci = subeListesi.reduce(
                    (t, s) => t + (parseInt(s.ogrenciSayisi, 10) || 0), 0);
                const kaynastirma = subeListesi.reduce(
                    (t, s) => t + (parseInt(s.kaynastirmaOgrenciSayisi ?? s.kaynastirmaSayisi ?? 0, 10) || 0), 0);
                const siniflar = subeListesi.map(s => String(s.sinifSeviyesi));
                // Farklı sınıflar birleşmişse 10-12. sınıf baremi esas alınır;
                // 9. sınıf baremi yalnızca hepsi 9. sınıfsa uygulanır.
                const sinif = siniflar.every(x => x === siniflar[0])
                    ? siniflar[0]
                    : (siniflar.find(x => x !== "9") || siniflar[0]);
                const bilgi = {
                    kimlik: k + "@@" + uyeler.join("___"),
                    temsilci: uyeler[0],
                    uyeler, ogrenci, kaynastirma, sinif
                };
                uyeler.forEach(id => sonuc.set(id + "##" + k, bilgi));
            }
        }
        return sonuc;
    }

    normalizeText(str) {
        let s = String(str || "").toLowerCase();
        s = s.replace(/i̇/g, 'i').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
        // KESME İŞARETLERİ TEKLEŞTİRİLİR.
        // Kaynak çizelgeler kıvrık kesme (’) kullanıyor, elle yazılan ve eski
        // veriler düz kesme ('). Ayrımı korumak, ders adı eşleştirmesini
        // görünmez biçimde ikiye bölüyordu: "KUR’AN-I KERİM" ile
        // "Kur'an-ı Kerim" farklı ders sayılıyordu. Ölçüldü (05.09.2026):
        // Kur'an-ı Kerim grup kuralı yalnızca DÜZ kesmeli yazımda çalışıyor,
        // kıvrık yazımda hiç tetiklenmiyordu — yani kuralın doğru ya da
        // yanlış çalışması, verinin hangi karakterle yazıldığına bağlıydı.
        s = s.replace(/[‘’ʼ´`']/g, "'");
        s = s.replace(/[\(\)\[\]\.,\/\-]/g, ' ');
        return s.replace(/\s+/g, ' ').trim();
    }

    /**
     * Bu okul türünde ŞUBE GRUPLARA BÖLÜNEBİLİR Mİ?
     *
     * Norm Kadro Yönetmeliği'nin TAMAMI tarandı (05.09.2026). Ders yükü için
     * grup bölünmesine izin veren yalnızca iki hüküm var:
     *
     *   Md. 22/1-ç : "MESLEKÎ VE TEKNİK örgün ve yaygın eğitim kurumlarında
     *                 alan/dal derslerine ilişkin ders yükü ... grup sayısı
     *                 ile çarpımı sonucunda bulunur."
     *   Md. 22/4   : "SPOR LİSELERİ VE GÜZEL SANATLAR LİSELERİNİN bölümler
     *                 itibarıyla alan derslerinin ders yükü ..."
     *
     * Md. 22/2 ise MESLEKÎ EĞİTİM MERKEZİ için bölünmeyi açıkça YASAKLAR.
     * Yönetmelikteki diğer grup geçişleri (Md. 4 tanım, Md. 15 okul öncesi,
     * Md. 17 yatılı özel eğitim gözetimi) ders yükü bölünmesi değildir.
     *
     * Buna ek olarak İMAM HATİP çizelgeleri, kendi açıklamalarında Kur'an-ı
     * Kerim dersi için "mevcudu 25'i geçen sınıflar iki gruba ayrılabilir"
     * der. Bu, çizelgeye (TTKB kararına) dayanan ayrı bir izindir.
     *
     * DOLAYISIYLA Anadolu/Fen/Sosyal Bilimler liseleri ile genel ortaokulda
     * HİÇBİR DERS gruplara bölünemez. Okul müdürü bildirimi (05.09.2026) ve
     * mevzuat teyidi bu yöndedir.
     */
    /**
     * ŞUBE ÖĞRENCİ SAYISI — MEB Ortaöğretim Kurumları Yönetmeliği
     * (Değişik: RG-22/2/2025-32821).
     *
     * Dönüş: { esas, ustSinir, kaynak, durum }
     *   esas      : bir şubeye alınacak öğrenci sayısı (30 ya da 34)
     *   ustSinir  : zorunlu hâllerde çıkılabilecek sayı (40)
     *   durum     : "uygun" | "esasAsildi" | "ustSinirAsildi"
     *
     * NEDEN: şube bölme sihirbazında eşik 34 olarak sabit yazılmıştı.
     * Merkezî sınavla öğrenci alan okullarda ve spor/güzel sanatlar
     * liselerinde sınır 30; ayrıca 34'ü aşmak tek başına bölmeyi zorunlu
     * kılmaz, yönetmelik 40'a kadar izin verir.
     */
    subeKapasitesi(schoolType, studentCount = 0) {
        const k = (this.rules && this.rules.sectionCapacityRules) || {};
        const tur = String(schoolType || "");
        // Ortaöğretim dışındaki kademeler bu yönetmeliğin kapsamında değil;
        // sayı uydurmak yerine "tanımsız" döndürülür.
        if ((k.kapsamDisiTurler || []).includes(tur)) {
            return {
                esas: null, ustSinir: null, durum: "kapsamDisi",
                kaynak: "Bu kademe Ortaöğretim Kurumları Yönetmeliği kapsamında değil"
            };
        }
        const esasOtuz = (k.otuzKisilikTurler || []).includes(tur);
        const esas = esasOtuz ? (k.merkeziSinavlaOgrenciAlan || 30)
                              : (k.digerOrtaogretim || 34);
        const ustSinir = k.zorunluHaldeUstSinir || 40;
        const n = parseInt(studentCount, 10) || 0;
        const durum = n > ustSinir ? "ustSinirAsildi"
                    : (n > esas ? "esasAsildi" : "uygun");
        return { esas, ustSinir, durum, kaynak: k.legalRef || "" };
    }

    grupBolunmesiSerbestMi(schoolType) {
        const t = String(schoolType || "").toLowerCase();
        if (!t) return false;
        // Md. 22/2 — MESEM'de bölünme yok.
        if (t.includes("mesleki_egitim_merkezi") || t.includes("mesem")) return false;
        // Md. 22/1-ç — meslekî ve teknik kurumlar.
        // NOT: "ozel_egitim_meslek_okulu" da bu kapıdan geçiyor. Bugünkü
        // davranış korunuyor; ORGM çizelgesinde grup hükmü YOK, Md. 22/1-ç'nin
        // özel eğitim meslek okulunu kapsayıp kapsamadığı TEYİDE MUHTAÇ.
        if (t.includes("meslek") || t.includes("teknik") || t.includes("mtegm")
            || t.includes("amp") || t.includes("atp")) return true;
        // Md. 22/4 — spor ve güzel sanatlar liseleri.
        if (t.includes("spor_lisesi") || t.includes("guzel_sanatlar")) return true;
        // Çizelge kaynaklı izin — imam hatip (Kur'an-ı Kerim 25+).
        if (t.includes("imam_hatip")) return true;
        return false;
    }

    /**
     * Branş Norm Doğrulaması (Kullanıcı Kuralı: Tüm derslerde branş kısıtlaması kaldırıldı, atanan her branş doğrudan norma dahil edilir)
     * @param {string} branchName - Atanan branş adı
     * @param {string} courseName - Ders adı
     * @returns {Object} { isValidForNorm, isYanDers, reason }
     */
    validateBranchAssignment(branchName, courseName) {
        if (!branchName || branchName.trim() === "") {
            return { isValidForNorm: false, isYanDers: false, isUnassigned: true, reason: "Branş atanmadı." };
        }

        // KULLANICI KURALI: Tüm derslerde (Ortak, Meslek, Seçmeli vb.) yandal/yan alan kısıtlaması kaldırıldı.
        // Seçilen her ders atanan branşın norm hesabına doğrudan dahil edilir.
        return { isValidForNorm: true, isYanDers: false, reason: "Norma dahil ders yükü" };
    }

    /**
     * MEB Norm Kadro Yönetmeliği MADDE 17/1 — özel eğitim sınıfı normu
     *
     * Norm ŞUBE BAŞINA verilir ve ENGEL TÜRÜ ile KADEME'ye göre değişir:
     *
     *   (a) özel eğitim anasınıfı .......................................... 1
     *   (b) görme/işitme engelliler, İLKOKULDA .............................. 1
     *   (ç) orta/ağır zihinsel veya otizm, her derece ve türde .............. 2
     *   (d) hafif zihinsel, İLKOKUL ve ORTAOKUL ............................ 2
     *   (e) hafif zihinsel, LİSE ........................................... 1
     *   (f) birden fazla engel ............................................. 2
     *   (c) mülga (17/10/2016-2016/9488 K.)
     *
     * NEDEN AYRI FONKSİYON (09.09.2026): burada eskiden `şube sayısı * 2`
     * yazıyordu. Lise kademesindeki hafif zihinsel şubeler (e bendi: 1) iki
     * katı norm üretiyordu ve hiçbir yerde engel türü sorulmuyordu.
     *
     * Yönetmeliğin açıkça düzenlemediği bileşimlerde (örn. görme/işitme
     * engelliler ORTAOKUL veya LİSE kademesinde) sayı DÜŞÜRÜLMEZ; 2 kalır ve
     * dayanak metninde bunun bir varsayım olduğu yazılır. Sessizce norm
     * eksiltmek, fazla göstermekten daha tehlikelidir.
     *
     * @param {string} engelTuru  hafif_zihinsel | orta_agir_otizm | gorme_isitme | birden_fazla
     * @param {string|number} sinifSeviyesi
     * @returns {{norm:number, dayanak:string}}
     */
    ozelEgitimSubeNormu(engelTuru, sinifSeviyesi) {
        const T = this.ozelEgitimTuru(engelTuru);
        const ham = String(sinifSeviyesi == null ? "" : sinifSeviyesi).toLowerCase();
        const sayi = parseInt(ham, 10);

        if (ham.includes("ana") || ham.includes("okuloncesi") || ham.includes("okul oncesi")) {
            return { norm: 1, dayanak: "Md. 17/1-a (özel eğitim anasınıfı)" };
        }

        const ilkokul  = sayi >= 1 && sayi <= 4;
        const ortaokul = sayi >= 5 && sayi <= 8;
        const lise     = sayi >= 9 && sayi <= 12;

        // Md. 17/1-ç: "... orta ve ağır düzeyde zihin engelliler ile OTİZMLİ ÖĞRENCİLER için açılan
        // her sınıf veya şube için 2". Otizmde DÜZEY AYRIMI YOK ve "her derece ve türdeki eğitim
        // kurumlarında" geçerli: hafif otizmli bir lise sınıfı da 2 norm alır (16.09.2026 düzeltmesi;
        // eskiden bu sınıf "hafif zihinsel" girildiği için 17/1-e ile 1 norm alıyordu).
        if (T.tur === "otizm") {
            return { norm: 2, dayanak: "Md. 17/1-ç (otizmli öğrenciler — düzey ayrımı yok, her derece ve türde)" };
        }
        if (T.tur === "orta_agir_zihinsel_veya_otizm") {
            return { norm: 2, dayanak: "Md. 17/1-ç (orta/ağır zihinsel veya otizm)" };
        }
        if (T.tur === "zihinsel" && T.duzey === "orta_agir") {
            return { norm: 2, dayanak: "Md. 17/1-ç (orta/ağır zihinsel)" };
        }
        if (T.tur === "birden_fazla") {
            return { norm: 2, dayanak: "Md. 17/1-f (birden fazla engel)" };
        }
        if (T.tur === "gorme" || T.tur === "isitme" || T.tur === "gorme_isitme") {
            if (ilkokul) return { norm: 1, dayanak: "Md. 17/1-b (görme/işitme, ilkokul)", kesinlik: "kesin" };
            // B-02 (kullanıcı kararı 22.09.2026, mevzuat ajanının önerisi): ORTAOKUL -> 0 + bilgi notu.
            // Md. 17/1'de görme/işitme için yalnız ilkokul bendi (b) var; ÖEHY 31/1-e "ortaokullarda ise dersler
            // alan öğretmenleri tarafından okutulur" der. Dersler alan öğretmenlerinin yüküne yazılır
            // (ozelEgitimDersOkutani), norm o branşların Md. 18 hesabındadır. Eskiden burada dayanaksız "2" vardı.
            if (ortaokul) {
                return {
                    norm: 0, kesinlik: "yorum",
                    dayanak: "[YORUM] Md. 17/1'de görme/işitme için ortaokul bendi yok; ÖEHY 31/1-e: ortaokulda dersleri alan öğretmenleri okutur → özel eğitim öğretmeni normu 0",
                    belirsizlik: "Dersler alan öğretmenlerinin yüküne yazıldı; norm o branşlarda Md. 18'e göre hesaplanır. ÖEHY 31/1-e'nin son cümlesi, alan öğretmeninin okuttuğu derslere özel eğitim öğretmeninin de destek olarak katılabileceğini söyler; bu destek için norm verilmiyor. Kesin karar için il MEM / İKGM görüşü alınız."
                };
            }
            // B-03 (aynı karar): LİSE / özel eğitim meslek okulu -> 1. Md. 17/1'de görme/işitme lise bendi yok;
            // 17/1-e (lise, meslek okulu programı) kıyasıyla 1. ÖEHY 32/3-c ve ORGM-08 bu okullarda Türkçe,
            // Matematik, Sosyal Hayat ve Rehberlik'i özel eğitim öğretmenine verir; 0 vermek bu dersleri okutacak normu sıfırlardı.
            if (lise) {
                return {
                    norm: 1, kesinlik: "yorum",
                    dayanak: "[YORUM] Md. 17/1'de görme/işitme için lise bendi yok; 17/1-e (lise, meslek okulu programı) kıyasıyla 1",
                    belirsizlik: "Mevzuatta açık bent yok, 17/1-e kıyasıyla 1 verildi. ÖEHY 32/3-c ve ORGM-08 açıklamaları bu okullarda Türkçe, Matematik, Sosyal Hayat ve Rehberlik derslerini özel eğitim öğretmenine verir. Kesin karar için il MEM / İKGM görüşü alınız."
                };
            }
            return { norm: 1, kesinlik: "belirsiz", dayanak: "[BELİRSİZ] kademe belirlenemedi; görme/işitme için 1 varsayıldı — kontrol ediniz" };
        }
        // B-04 (aynı karar): bedensel -> BELİRSİZ göster, kendiliğinden SIFIR üretme. Çalışma değeri 1.
        // Eskiden "2" vardı ve mevzuat ajanının iki okumasından hiçbirine (0 ya da 1) uymuyordu.
        if (T.tur === "bedensel") {
            return {
                norm: 1, kesinlik: "belirsiz",
                dayanak: "[BELİRSİZ] Md. 17/1'de bedensel yetersizlik için bent yok; çalışma değeri 1 (üst okuma)",
                belirsizlik: "ÖEHY 31/1 bu okulları açar, sınıf mevcudu en fazla 10'dur (31/1-d); ama dersleri kimin okutacağını ve Md. 17 normunu düzenlemez. "
                    + "Okuma A: ilkokulda sınıf öğretmeni (Md. 16/1), ortaokulda alan öğretmenleri (Md. 18); özel eğitim öğretmeni 0 (Md. 16/1 \"öğrenci sayısı 10'dan az olmamak\" şartı 1-9 öğrencili şubeyi dışarıda bırakır). "
                    + "Okuma B: ilkokulda Md. 17/1-b kıyasıyla şube başına 1 özel eğitim öğretmeni. Uygulama sıfır üretmez, üst değer olan 1'i gösterir. Kesin karar için il MEM / İKGM görüşü alınız."
            };
        }
        // hafif zihinsel (varsayılan)
        if (lise) return { norm: 1, dayanak: "Md. 17/1-e (hafif zihinsel, lise kademesi)" };
        if (ilkokul || ortaokul) return { norm: 2, dayanak: "Md. 17/1-d (hafif zihinsel, ilkokul/ortaokul)" };
        return { norm: 2, dayanak: "Md. 17/1-d (kademe belirsiz, ilkokul/ortaokul varsayıldı)" };
    }

    /**
     * ÖZEL EĞİTİM TÜRÜ (16.09.2026). Kayıttaki engelTuru değerini tür + düzeye çözer.
     * Mevzuat (ÖEHY) sınıf mevcudunu ve uygulanacak programı TÜR ve DÜZEYE göre ayırıyor;
     * eskiden otizm ayrı bir seçenek değildi. Eski değerler okunmaya devam eder:
     *   orta_agir_otizm -> "orta/ağır zihinsel VEYA otizm" (eski tek seçenek; tür belirsiz)
     *   gorme_isitme    -> "görme veya işitme"
     */
    ozelEgitimTuru(engelTuru) {
        const TABLO = {
            hafif_zihinsel:     { tur: "zihinsel", duzey: "hafif", ad: "Hafif düzeyde zihinsel yetersizlik" },
            hafif_otizm:        { tur: "otizm", duzey: "hafif", ad: "Hafif düzeyde otizm" },
            orta_agir_zihinsel: { tur: "zihinsel", duzey: "orta_agir", ad: "Orta / ağır düzeyde zihinsel yetersizlik" },
            otizm_orta_agir:    { tur: "otizm", duzey: "orta_agir", ad: "Orta / ağır düzeyde otizm" },
            gorme:              { tur: "gorme", duzey: null, ad: "Görme yetersizliği" },
            isitme:             { tur: "isitme", duzey: null, ad: "İşitme yetersizliği" },
            bedensel:           { tur: "bedensel", duzey: null, ad: "Bedensel yetersizlik" },
            birden_fazla:       { tur: "birden_fazla", duzey: null, ad: "Birden fazla yetersizlik" },
            orta_agir_otizm:    { tur: "orta_agir_zihinsel_veya_otizm", duzey: "orta_agir", ad: "Orta/ağır zihinsel veya otizm (eski kayıt — türü netleştirin)", eski: true },
            gorme_isitme:       { tur: "gorme_isitme", duzey: null, ad: "Görme veya işitme (eski kayıt — türü netleştirin)", eski: true }
        };
        const kod = TABLO[String(engelTuru || "")] ? String(engelTuru) : "hafif_zihinsel";
        return Object.assign({ kod }, TABLO[kod]);
    }

    /** e-Okul satırındaki metinden engel türünü bulur (e-Okul aktarımı kullanır). */
    ozelEgitimTuruMetindenBul(metin) {
        const u = String(metin || "").toLocaleUpperCase("tr");
        const var_ = (...k) => k.some(x => u.includes(x));
        const hafif = var_("HAFİF", "HAFIF");
        if (var_("BİRDEN FAZLA", "BIRDEN FAZLA", "ÇOKLU", "COKLU")) return "birden_fazla";
        if (var_("OTİZM", "OTIZM")) return hafif ? "hafif_otizm" : "otizm_orta_agir";
        if (var_("İŞİTME", "ISITME")) return "isitme";
        if (var_("GÖRME", "GORME")) return "gorme";
        if (var_("BEDENSEL", "ORTOPEDİK", "ORTOPEDIK")) return "bedensel";
        if (var_("ORTA", "AĞIR", "AGIR")) return "orta_agir_zihinsel";
        return "hafif_zihinsel";
    }

    /** Şube özel eğitim şubesi mi? Özel eğitim OKUL türlerinde her şube özel eğitim şubesidir (Md. 17/1). */
    ozelEgitimSubesiMi(sec, schoolType = "") {
        if (!sec) return false;
        return !!(sec.isSpecialEdu
            || (sec.subeAdi && String(sec.subeAdi).includes("Özel Eğt"))
            || (sec.dalAdi && String(sec.dalAdi).includes("Özel Eğit"))
            || String(schoolType || "").includes("ozel_egitim"));
    }

    /** Kayıttaki engel türü; özel eğitim okul türlerinde işaretsiz şubeye okulun türüne uygun varsayılan. */
    ozelEgitimKayitTuru(sec, schoolType = "") {
        const kayit = sec && (sec.engelTuru || sec.specialEduType);
        if (kayit) return kayit;
        return String(schoolType || "").includes("uygulama") ? "orta_agir_zihinsel" : "hafif_zihinsel";
    }

    /**
     * ÖZEL EĞİTİM SINIF MEVCUDU ÜST SINIRI — Özel Eğitim Hizmetleri Yönetmeliği (RG 07/07/2018-30471).
     * Metinler 16.09.2026'da resmî metinden okundu:
     *   27/3-c  ilköğretim programı uygulayan sınıf (ilk/ortaokul): en fazla 10, otizmde 4
     *   28/1-b  özel eğitim programı uygulayan sınıf: izlenen programın okulundaki mevcut
     *   28/1-ç  orta/ağır zihinsel-otizm: ilköğretimde uygulama okulu, ortaöğretimde III. kademe programı
     *   28/1-d  ortaöğretimde görme/işitme/hafif zihinsel/hafif otizm: özel eğitim meslek okulu programı
     *   31/1-d  özel eğitim ilkokulu/ortaokulu: 10, otizmde 4
     *   31/2-b  uygulama okulu I-II. kademe: zihinselde 8, otizmde 4
     *   32/3-b  özel eğitim meslek okulu: otizmde 4, diğer türlerde 10
     *   32/4-c  uygulama okulu III. kademe: zihinselde 8, otizmde 4
     *   13/1-c  birden fazla yetersizlik: 4
     * Sınıf açmak Valilik Oluru ile olur (ÖEHY 26); bu fonksiyon SINIFI BÖLMEZ, sınırı söyler.
     * @returns {{enFazla:number|null, dayanak:string, not:string}}
     */
    ozelEgitimSinifSiniri(sec, schoolType = "") {
        const T = this.ozelEgitimTuru(this.ozelEgitimKayitTuru(sec, schoolType));
        const tur = String(schoolType || "");
        const sayi = parseInt(String(sec && sec.sinifSeviyesi), 10);
        const lise = sayi >= 9 && sayi <= 12;
        const ilkOrta = sayi >= 1 && sayi <= 8;
        const otizm = T.tur === "otizm";
        const sonuc = (enFazla, dayanak, not = "") => ({ enFazla, dayanak, not });

        if (T.tur === "orta_agir_zihinsel_veya_otizm") {
            return sonuc(null, "", "Eski kayıt: engel türü 'orta/ağır zihinsel veya otizm'. Sınıf mevcudu zihinselde 8, otizmde 4 (ÖEHY 31/2-b, 32/4-c) — şube penceresinden türü netleştirin.");
        }
        if (T.tur === "birden_fazla") return sonuc(4, "ÖEHY Md. 13/1-c");

        if (tur.includes("ozel_egitim_meslek_okulu")) {
            return otizm ? sonuc(4, "ÖEHY Md. 32/3-b") : sonuc(10, "ÖEHY Md. 32/3-b");
        }
        if (tur.includes("ozel_egitim_uygulama_okulu")) {
            const madde = lise ? "ÖEHY Md. 32/4-c" : "ÖEHY Md. 31/2-b";
            return otizm ? sonuc(4, madde) : sonuc(8, madde);
        }

        // Normal okul bünyesindeki özel eğitim sınıfı
        if (ilkOrta) {
            if (T.duzey === "orta_agir") {
                return otizm ? sonuc(4, "ÖEHY Md. 28/1-b → 31/2-b") : sonuc(8, "ÖEHY Md. 28/1-b → 31/2-b");
            }
            if (otizm) return sonuc(4, "ÖEHY Md. 27/3-c");
            if (T.tur === "zihinsel" || T.tur === "gorme" || T.tur === "isitme" || T.tur === "gorme_isitme") {
                return sonuc(10, "ÖEHY Md. 27/3-c");
            }
            return sonuc(null, "", "Bu yetersizlik türü için ilköğretim kademesinde sınıf mevcudu hükmü bulunamadı — kontrol ediniz.");
        }
        if (lise) {
            if (T.duzey === "orta_agir") {
                return otizm ? sonuc(4, "ÖEHY Md. 28/1-ç → 32/4-c") : sonuc(8, "ÖEHY Md. 28/1-ç → 32/4-c");
            }
            if (otizm) return sonuc(4, "ÖEHY Md. 28/1-d → 32/3-b");
            if (T.tur === "zihinsel" || T.tur === "gorme" || T.tur === "isitme" || T.tur === "gorme_isitme") {
                return sonuc(10, "ÖEHY Md. 28/1-d → 32/3-b");
            }
            return sonuc(null, "", "Bu yetersizlik türü için ortaöğretimde sınıf mevcudu hükmü bulunamadı — kontrol ediniz.");
        }
        return sonuc(null, "", "Kademe belirlenemedi.");
    }

    /**
     * Sınıf mevcudu sınırına göre GEREKEN sınıf sayısı ve sınıflar açılırsa oluşacak norm.
     * Norm, AÇILMIŞ sınıfa verilir (Md. 17/1 "açılan her sınıf veya şube için"); bu yüzden hesap
     * mevcut normu DEĞİŞTİRMEZ, yalnız uyarır.
     */
    /**
     * ÖZEL EĞİTİM SINIFINDA BU DERSİ HANGİ ALAN ÖĞRETMENİ OKUTUR? (özel eğitim 2. dalga, 16.09.2026)
     *
     * Mevzuat (05_dokumantasyon/ozel_egitim_guncellemesi/KURAL_SETI_OZEL_EGITIM.md, bölüm 5):
     *   İlkokul: din kültürü ve ahlak bilgisi alan öğretmeni; görme/işitme sınıfında ayrıca
     *     yabancı dil (ÖEHY 27/3-d, 27/3-e, 28/1-ğ, 31/1-e, 31/2-ç, 13/1-ç).
     *   Ortaokul ve ortaöğretim: "din kültürü ve ahlak bilgisi, görsel sanatlar, müzik ve beden
     *     eğitimi alanlarına ilişkin dersler ile meslek dersleri" alan öğretmenlerince okutulur
     *     (ÖEHY 27/3-e, 28/1-ğ, 13/1-ç, 31/2-ç, 32/3-c, 32/4-ç).
     *   Diğer dersleri özel eğitim öğretmeni okutur; onun normu şube başınadır (Md. 17/1).
     * Alan öğretmeninin okuttuğu saat o alanın ders yüküne girer (Norm Kadro Md. 4/1-d, 22/1-c-1).
     * Meslek dersi (İş Eğitimi ve Meslek Ahlakı, İş ve Beceri Uygulamaları): idarecinin seçtiği meslek
     * branşına; seçilmemişse 9. sınıfta İş Eğitimi ve Meslek Ahlakı okuldaki alanlara eşit dağıtılır
     * (ORGM-07/08 açıklama 5), aksi hâlde özel eğitim satırında kalır. Bedensel yetersizlikte ÖEHY
     * dersleri kimin okutacağını söylemez (belirsizlik B-04): dokunulmaz.
     *
     * @returns {null | { paylar:[{brans, saat}], atolye:boolean, dayanak:string }}
     */
    ozelEgitimDersOkutani(course, turKod, kademe, acikAlanBranslari = []) {
        const ad = this.normalizeText(course && (course.ders || course.ders_adi) || "");
        const saat = parseInt(course && (course.saat || course.ders_saati) || 0, 10) || 0;
        if (!ad || saat <= 0) return null;
        const T = this.ozelEgitimTuru(turKod);
        if (T.tur === "bedensel") return null;
        const tek = (brans, dayanak, atolye = false) => ({ paylar: [{ brans, saat }], atolye, dayanak });
        const secilen = course && course.atananBrans;
        const gercekBrans = (b) => !!b && b !== "Özel Eğitim" && b !== "— Branş Atanmadı —" && !String(b).includes("Rehberlik");

        if (ad.includes("din kultur")) {
            return tek("Din Kültürü ve Ahlak Bilgisi", kademe === "ilkokul" ? "ÖEHY 27/3-d-e, 31/2-ç: ilkokulda din kültürü ve ahlak bilgisi alan öğretmeni okutur" : "ÖEHY 27/3-e, 28/1-ğ: alan öğretmeni okutur");
        }
        if (kademe === "ilkokul") {
            const gormeIsitme = ["gorme", "isitme", "gorme_isitme"].includes(T.tur);
            if (gormeIsitme && (ad.includes("yabanci dil") || ad.includes("ingilizce"))) {
                return tek(gercekBrans(secilen) && secilen !== "Sınıf Öğretmenliği" ? secilen : "İngilizce", "ÖEHY 27/3-d, 31/1-e: görme/işitme ilkokul sınıfında yabancı dil alan öğretmeni okutur");
            }
            return null;
        }
        if (kademe === "okuloncesi" || kademe === "diger") return null;
        // B-02 (22.09.2026): görme/işitme ORTAOKUL sınıfında TÜM dersleri alan öğretmenleri okutur (ÖEHY 31/1-e);
        // özel eğitim öğretmeni normu 0 olduğu için (ozelEgitimSubeNormu) saatler çizelgenin alan branşlarına yazılır.
        // Branşı belirsiz ders (ör. "Özel Eğitim" ya da Rehberlik) özel eğitim satırında kalır.
        if (kademe === "ortaokul" && ["gorme", "isitme", "gorme_isitme"].includes(T.tur) && gercekBrans(secilen)) {
            return tek(secilen, "ÖEHY 31/1-e: görme/işitme ortaokul sınıfında dersleri alan öğretmenleri okutur (B-02: özel eğitim öğretmeni normu 0)");
        }
        if (ad.includes("gorsel sanat")) return tek("Görsel Sanatlar", "ÖEHY 27/3-e, 28/1-ğ, 32/3-c: görsel sanatlar alan öğretmeni okutur");
        if (ad.includes("muzik")) return tek("Müzik", "ÖEHY 27/3-e, 28/1-ğ, 32/3-c: müzik alan öğretmeni okutur");
        if (ad.includes("beden egitimi")) return tek("Beden Eğitimi", "ÖEHY 27/3-e, 28/1-ğ, 32/3-c: beden eğitimi alan öğretmeni okutur");

        const meslek = ad.includes("is egitimi ve meslek ahlak") || ad.includes("is ve beceri uygulama");
        if (meslek && kademe === "lise") {
            const atolye = course.isAtolye !== false;
            if (gercekBrans(secilen)) {
                return tek(secilen, "ÖEHY 28/1-ğ, 32/3-c, 32/4-ç: meslek dersini ilgili alan öğretmeni okutur", atolye);
            }
            const sinif = parseInt(course._sinif, 10);
            const alanlar = [...new Set(acikAlanBranslari || [])].sort((a, b) => a.localeCompare(b, 'tr'));
            if (ad.includes("is egitimi ve meslek ahlak") && sinif === 9 && alanlar.length) {
                const taban = Math.floor(saat / alanlar.length);
                let artan = saat - taban * alanlar.length;
                const paylar = alanlar.map(b => ({ brans: b, saat: taban + (artan-- > 0 ? 1 : 0) })).filter(p => p.saat > 0);
                return { paylar, atolye, dayanak: `ORGM-07/08 açıklama 5: 9. sınıfta ders saati okuldaki ${alanlar.length} alana eşit dağıtılır` };
            }
        }
        return null;
    }

    /**
     * MEVZUATIN ÖNGÖRMEDİĞİ ÖZEL EĞİTİM SINIFI (özel eğitim 2. dalga, 16.09.2026) — yalnız UYARI.
     * Sınıf Valilik Oluru ile açılmış olabilir; uygulama norm hesabını değiştirmez, idareciye söyler.
     * Kaynak: KURAL_SETI_OZEL_EGITIM.md bölüm 1 "Yazılım için" (hepsi [AÇIK]).
     */
    ozelEgitimOrtamUyarisi(sec, schoolType = "", subeler = []) {
        const tipi = String(schoolType || "");
        if (!sec || tipi.includes("ozel_egitim")) return null;
        const T = this.ozelEgitimTuru(this.ozelEgitimKayitTuru(sec, tipi));
        const kademe = this.ozelEgitimKademesi(sec.sinifSeviyesi);
        const gormeIsitme = ["gorme", "isitme", "gorme_isitme"].includes(T.tur);
        const GENEL_LISE = /^(hazirlik_)?(anadolu_lisesi|fen_lisesi)$|sosyal_bilimler|^ozel_program_|^guzel_sanatlar|^spor_lisesi/;
        if (tipi === "imam_hatip_ortaokulu" && T.duzey === "hafif") {
            return "ÖEHY 27/2: hafif düzeyde zihinsel yetersizlik ve hafif otizm için ilköğretim programı uygulayan özel eğitim sınıfı İmam Hatip Ortaokullarında açılmaz.";
        }
        if (gormeIsitme && kademe === "ortaokul") {
            return "ÖEHY 27/1: normal ortaokulda görme/işitme özel eğitim sınıfı öngörülmemiştir; bu öğrenciler 5. sınıftan itibaren tam zamanlı kaynaştırma ile eğitim alır.";
        }
        if (kademe === "lise" && GENEL_LISE.test(tipi)) {
            return "ÖEHY 28/1: ortaöğretimde özel eğitim sınıfı yalnız mesleki eğitim veren ortaöğretim kurumlarında açılır.";
        }
        if (kademe === "lise" && T.duzey === "hafif" && this.isMeslekiKurum(tipi, subeler)
            && !tipi.includes("mesleki_egitim_merkezi") && this.acikAlanlar(subeler, tipi).length === 0) {
            return "ÖEHY 28/1-e: hafif düzeyde zihinsel yetersizlik / otizm sınıfı için okulda iş eğitimi kapsamında uygulanacak bir alan/dal bulunmalıdır; şubelerde açık alan görünmüyor.";
        }
        return null;
    }

    /** Özel eğitim sınıfının kademesi: okuloncesi | ilkokul | ortaokul | lise | diger */
    ozelEgitimKademesi(sinifSeviyesi) {
        const ham = String(sinifSeviyesi == null ? "" : sinifSeviyesi).toLowerCase();
        if (ham.includes("ana") || ham.includes("okuloncesi") || ham.includes("okul oncesi")) return "okuloncesi";
        const s = parseInt(ham, 10);
        if (s >= 1 && s <= 4) return "ilkokul";
        if (s >= 5 && s <= 8) return "ortaokul";
        if (s >= 9 && s <= 12) return "lise";
        return "diger";
    }

    /**
     * BİRLEŞTİRİLMİŞ SINIF GRUPLARI (kullanıcı kararı 16.09.2026)
     *
     * e-Okul özel eğitim öğrencilerini sınıf seviyesine göre ayrı şubelerde gösterir
     * (6-A Özel Eğt, 7-A Özel Eğt ...). Oysa "Aynı tür yetersizliği olan öğrencilere
     * birleştirilmiş sınıf uygulaması ile eğitim yapılır" (ÖEHY 27/3-a, 28/1-a) ve norm
     * "açılan her sınıf veya şube için" verilir (Norm Kadro Yön. Md. 17/1). Aynı TÜR ve
     * aynı KADEME şubeleri bir grup olur; okul birleştirilmiş sınıf uyguladığını
     * işaretleyip grubun kaç sınıf olduğunu girerse norm sınıf sayısı × sınıf normu olur.
     * İşaretlenmezse ya da grup için sayı girilmezse her şube ayrı sınıf sayılır.
     * Farklı türler birleştirilmez (ÖEHY 27/3-a, 31/1-ç, 31/2-b, 32/3-b, 32/4-c).
     */
    ozelEgitimSinifGruplari(subeler = [], schoolType = "") {
        const KADEME_SIRA = { okuloncesi: 0, ilkokul: 1, ortaokul: 2, lise: 3, diger: 4 };
        const gruplar = {};
        (subeler || []).filter(s => this.ozelEgitimSubesiMi(s, schoolType)).forEach(s => {
            const tur = this.ozelEgitimTuru(this.ozelEgitimKayitTuru(s, schoolType));
            const kademe = this.ozelEgitimKademesi(s.sinifSeviyesi);
            const anahtar = `${tur.kod}|${kademe}`;
            const g = gruplar[anahtar] || (gruplar[anahtar] = { anahtar, turKod: tur.kod, turAd: tur.ad, kademe, subeler: [], ogrenci: 0 });
            g.subeler.push(s);
            g.ogrenci += Math.max(0, parseInt(s.ogrenciSayisi, 10) || 0);
        });
        return Object.values(gruplar).map(g => {
            g.subeler.sort((a, b) => (parseInt(a.sinifSeviyesi, 10) || 0) - (parseInt(b.sinifSeviyesi, 10) || 0)
                || String(a.subeAdi || "").localeCompare(String(b.subeAdi || ""), 'tr'));
            const ilk = g.subeler[0];
            const sinir = this.ozelEgitimSinifSiniri(ilk, schoolType);
            const n = this.ozelEgitimSubeNormu(this.ozelEgitimKayitTuru(ilk, schoolType), ilk.sinifSeviyesi);
            return Object.assign(g, {
                subeAdlari: g.subeler.map(s => s.subeAdi || s.id),
                enFazla: sinir.enFazla || null,
                sinirDayanak: sinir.dayanak,
                enAzSinif: sinir.enFazla ? Math.max(1, Math.ceil(g.ogrenci / sinir.enFazla)) : 1,
                normSinif: n.norm,
                normDayanak: n.dayanak
            });
        }).sort((a, b) => (KADEME_SIRA[a.kademe] - KADEME_SIRA[b.kademe]) || a.turAd.localeCompare(b.turAd, 'tr'));
    }

    /** Grup için okulun girdiği sınıf sayısı; birleştirilmiş sınıf uygulanmıyorsa null. */
    ozelEgitimBirlesikSinifSayisi(grup, adminOptions = {}) {
        if (!grup || !adminOptions || !adminOptions.ozelEgitimBirlestirilmisSinif) return null;
        const n = parseInt((adminOptions.ozelEgitimSinifSayilari || {})[grup.anahtar], 10);
        if (!Number.isFinite(n) || n < 1) return null;
        // Şube sayısından fazla sınıf ancak mevcut sınırı gerektiriyorsa anlamlıdır.
        return Math.min(n, Math.max(grup.subeler.length, grup.enAzSinif));
    }

    ozelEgitimSinifIhtiyaci(sec, schoolType = "") {
        const s = this.ozelEgitimSinifSiniri(sec, schoolType);
        const ogrenci = Math.max(0, parseInt(sec && sec.ogrenciSayisi, 10) || 0);
        const n = this.ozelEgitimSubeNormu(this.ozelEgitimKayitTuru(sec, schoolType), sec && sec.sinifSeviyesi).norm;
        if (!s.enFazla) {
            return { ogrenci, enFazla: null, dayanak: s.dayanak, not: s.not, gerekenSinif: null, sinirAsildi: false, normSube: n, olasiNorm: null, mesaj: s.not };
        }
        const gerekenSinif = Math.max(1, Math.ceil(ogrenci / s.enFazla));
        const sinirAsildi = ogrenci > s.enFazla;
        const mesaj = sinirAsildi
            ? `${ogrenci} öğrenci; sınıf mevcudu en fazla ${s.enFazla} (${s.dayanak}) → en az ${gerekenSinif} sınıf gerekir. `
              + `Sınıflar Valilik Oluru ile açılırsa özel eğitim öğretmeni normu ${gerekenSinif * n} olur (şube başına ${n}).`
            : `${ogrenci} öğrenci; sınıf mevcudu en fazla ${s.enFazla} (${s.dayanak}) — uygun.`;
        return { ogrenci, enFazla: s.enFazla, dayanak: s.dayanak, not: s.not, gerekenSinif, sinirAsildi, normSube: n, olasiNorm: gerekenSinif * n, mesaj };
    }

    /**
     * MEB Norm Kadro Yönetmeliği MADDE 18/1
     * Genel bilgi ve meslek dersleri öğretmeni norm kadrosu.
     * 6-30 -> 1 | 31-42 -> 2 | 42'den fazlası: her 21 saate 1, artan >=15 ise +1
     *
     * @param {number} hours - Branşın GENEL BİLGİ/MESLEK dersleri yükü
     * @returns {Object} { normCount, formulaExplanation }
     */
    calculateGeneralSubjectNorm(hours) {
        const cfg = this.rules.generalSubjectNorm;
        const h = parseInt(hours, 10) || 0;

        if (h <= 0) {
            return { normCount: 0, formulaExplanation: "Genel bilgi/meslek dersi yükü yok." };
        }
        if (h < cfg.minHoursForAnyNorm) {
            return {
                normCount: 0,
                formulaExplanation: `${cfg.minHoursForAnyNorm} saatin altında (${h}s): Norm verilmez. (${cfg.legalRef})`
            };
        }

        const tierNorm = this.resolveTier(h, cfg.tiers, "norm");
        if (tierNorm !== null) {
            return {
                normCount: tierNorm,
                formulaExplanation: `Genel Bilgi/Meslek (${cfg.legalRef}): ${h} saat ➔ ${tierNorm} Norm`
            };
        }

        const ov = cfg.overflow;
        const total = this.resolveOverflowNorm(h, ov);
        const extra = h - ov.appliesAboveHours;
        return {
            normCount: total,
            formulaExplanation: `Genel Bilgi/Meslek (${cfg.legalRef}): ${ov.appliesAboveHours} saat ➔ ${ov.baseNorm} Norm + artan ${extra} saat (her ${ov.intervalHours} saatte 1, kalan ≥${ov.residualBonusMinHours} saat ise +1) ➔ Toplam ${total} Norm`
        };
    }

    /**
     * MEB Norm Kadro Yönetmeliği MADDE 19/1
     * Atölye ve laboratuvar öğretmeni norm kadrosu. İşletmelerde meslek eğitimi
     * dersi bu yüke DÂHİLDİR.
     * 15-40 -> 1 | 41-80 -> 2 | 81-120 -> 3 | 121-160 -> 4 | 161-200 -> 5
     * 201+ : her 40 saate 1, artan >=20 ise +1
     *
     * DİKKAT: Bu formül Madde 18'den tamamen ayrıdır. Atölye yükünü Madde 18
     * ile hesaplamak normu şişirir (önceki sürümün hatası): 200 saatlik yük
     * Madde 19'da 5, Madde 18'de 9 norm verir.
     *
     * @param {number} hours - Branşın ATÖLYE/LABORATUVAR yükü
     * @returns {Object} { normCount, formulaExplanation }
     */
    calculateWorkshopLabNorm(hours) {
        const cfg = this.rules.workshopLabNorm;
        const h = parseInt(hours, 10) || 0;

        if (h <= 0) {
            return { normCount: 0, formulaExplanation: "Atölye/laboratuvar yükü yok." };
        }
        if (h < cfg.minHoursForAnyNorm) {
            return {
                normCount: 0,
                formulaExplanation: `${cfg.minHoursForAnyNorm} saatin altında (${h}s): Atölye normu verilmez. (${cfg.legalRef})`
            };
        }

        const tierNorm = this.resolveTier(h, cfg.tiers, "norm");
        if (tierNorm !== null) {
            return {
                normCount: tierNorm,
                formulaExplanation: `Atölye/Laboratuvar (${cfg.legalRef}): ${h} saat ➔ ${tierNorm} Norm`
            };
        }

        const ov = cfg.overflow;
        const total = this.resolveOverflowNorm(h, ov);
        const extra = h - ov.appliesAboveHours;
        return {
            normCount: total,
            formulaExplanation: `Atölye/Laboratuvar (${cfg.legalRef}): ${ov.appliesAboveHours} saat ➔ ${ov.baseNorm} Norm + artan ${extra} saat (her ${ov.intervalHours} saatte 1, kalan ≥${ov.residualBonusMinHours} saat ise +1) ➔ Toplam ${total} Norm`
        };
    }

    /**
     * Bir branşın toplam norm kadrosunu hesaplar.
     *
     * Mevzuat, ders yükünü İKİ AYRI KADRO TÜRÜNE ayırır:
     *   • Madde 18 — Genel bilgi ve meslek dersleri öğretmeni
     *   • Madde 19 — Atölye ve laboratuvar öğretmeni (işletmelerde meslek eğitimi dâhil)
     * Bunlar ayrı formüllerle hesaplanır ve branşın toplam kadrosu ikisinin
     * TOPLAMIDIR.
     *
     * @param {number} totalHours - Branşın toplam yükü (geriye dönük uyumluluk)
     * @param {string} schoolType - Okul türü
     * @param {string} branchName - Branş adı
     * @param {Object} loadSplit - { genel: number, atolye: number } yük ayrımı.
     *        Verilmezse tüm yük Madde 18 kapsamında sayılır (eski davranış).
     * @returns {Object} { normCount, formulaExplanation, generalNorm, workshopNorm, generalHours, workshopHours }
     */
    calculateBranchNorm(totalHours, schoolType = "", branchName = "", loadSplit = null) {
        const total = parseInt(totalHours, 10) || 0;
        if (total <= 0) {
            return {
                normCount: 0,
                formulaExplanation: "Ders yükü 0 saat.",
                generalNorm: 0, workshopNorm: 0, generalHours: 0, workshopHours: 0
            };
        }

        // Yük ayrımı verilmediyse geriye dönük uyumluluk: hepsi genel bilgi sayılır.
        const genelHours = loadSplit ? (parseInt(loadSplit.genel, 10) || 0) : total;
        const atolyeHours = loadSplit ? (parseInt(loadSplit.atolye, 10) || 0) : 0;

        const genel = this.calculateGeneralSubjectNorm(genelHours);
        const atolye = this.calculateWorkshopLabNorm(atolyeHours);
        const normCount = genel.normCount + atolye.normCount;

        // Açıklamayı sadece fiilen yük bulunan maddelerden kur.
        const parts = [];
        if (genelHours > 0) parts.push(genel.formulaExplanation);
        if (atolyeHours > 0) parts.push(atolye.formulaExplanation);
        if (parts.length === 0) parts.push(`Fiili yük ${total}s ancak norm barajlarının altında: Norm verilmez.`);

        let formulaExplanation = parts.join("  +  ");
        if (genelHours > 0 && atolyeHours > 0) {
            formulaExplanation += `  =  TOPLAM ${normCount} Norm (Fiili Yük: ${total}s)`;
        }

        return {
            normCount,
            formulaExplanation,
            generalNorm: genel.normCount,
            workshopNorm: atolye.normCount,
            generalHours: genelHours,
            workshopHours: atolyeHours
        };
    }

    /**
     * Tüm Okulun Norm ve Branş Dağılımını Hesaplar
     * @param {Array} subeler - Sınıf/Şube listesi
     * @param {Object} existingTeachers - Mevcut kadrolu öğretmen sayıları { "Matematik": 2 }
     * @param {string} schoolType - Okul türü
     * @returns {Object} Detaylı norm analiz raporu
     */
    calculateSchoolNorms(subeler = [], existingTeachers = {}, schoolType = "", coordinatorHoursMap = {}) {
        const branchLoadMap = {};
        // Madde 18 / Madde 19 ayrımı: her branşın yükü iki kovaya ayrılır.
        const branchLoadSplit = {};
        const branchCourseDetails = {};

        // Branşı atanmamış derslerin saati. Hiçbir branşın normuna yazılmaz
        // ama okulun toplam ders yüküne dâhildir (aşağıda eklenir).
        let branssizSaat = 0;

        // DERS YÜKÜ MUTABAKATI SAYAÇLARI
        // ------------------------------
        // "Şube çizelgesi 640 saat diyor, üstteki toplam 646 diyor" sorusunun
        // cevabı bugüne kadar hiçbir raporda yazmıyordu. İki sayı farklı
        // büyüklükler: biri ÖĞRENCİNİN gördüğü saat, öteki ÖĞRETMENİN okuttuğu
        // yük. Aradaki köprüyü kuran kalemler burada tek tek toplanıyor ki
        // rapor farkı kendi açıklayabilsin. (Kullanıcı isteği, 05.09.2026.)
        //
        // Değişmez (test_yukMutabakati.mjs bunu denetler):
        //   ham + çarpan − birleşik − yönetici + koordinatörlük === totalHours
        let hamCizelgeSaati = 0;
        // Özel eğitim şubelerinin saatleri AYRICA sayılır. Bu saatler genel
        // branş havuzuna girmez (Md. 17: norm şube başına verilir, dersleri
        // özel eğitim öğretmeni okutur) ama okulun toplam yükünde dururlar ve
        // "Özel Eğitim" satırı olarak geri gelirler. Mutabakat denkleminde
        // ayrı tutulmazsa çarpan kalemi eksiye düşüyor ve denklem tutmuyordu
        // (09.09.2026 — ortaokulda mutabakat paneli bu yüzden hiç basılmadı).
        let ozelEgitimSaati = 0;
        // MESEM'de Md. 22/2 geregi sube yukune GIRMEYEN saatler.
        // Mutabakat panelinin tutmasi icin ayri sayilir; ozel egitim
        // saatleriyle ayni mantik (bkz. carpanArtisi).
        let mesemHaricSaati = 0;
        const isMesemKurum = String(schoolType || "").includes("mesleki_egitim_merkezi")
                          || String(schoolType || "").includes("mesem");
        subeler.forEach(sec => {
            const ozelMi = this.ozelEgitimSubesiMi(sec, schoolType);
            [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])].forEach(c => {
                const saat = parseInt(c.saat || c.ders_saati || 0, 10) || 0;
                hamCizelgeSaati += saat;
                if (ozelMi) ozelEgitimSaati += saat;
            });
        });
        // Motorun fiilen branşlara (ve branşsız havuzuna) yazdığı toplam yük.
        let islenmisYuk = 0;
        // Birleştirilmiş şubede aynı ders tek öğretmene yazılır; çizelgede iki
        // kez görünen saatin ikincisi yüke girmez.
        let birlesikSubeDusumu = 0;

        const ensureBranch = (name) => {
            if (!branchLoadMap[name]) {
                branchLoadMap[name] = 0;
                branchCourseDetails[name] = [];
            }
            if (!branchLoadSplit[name]) {
                branchLoadSplit[name] = { genel: 0, atolye: 0 };
            }
        };

        // Birleştirilmiş dersler (Denetim N-03): bkz. birlesikDersBilesenleri
        const birlesikBilgi = this.birlesikDersBilesenleri(subeler, schoolType);

        subeler.forEach(sec => {
            // ÖZEL EĞİTİM ŞUBELERİ BRANŞ YÜKÜNE YAZILMAZ.
            //
            // Md. 17/1: özel eğitim sınıflarının normu ŞUBE BAŞINA verilir
            // (ilkokul/ortaokul kademesinde hafif düzeyde zihin engelliler
            // için her şube 2 norm). Dersleri özel eğitim öğretmeni okutur;
            // Türkçe ya da Matematik branşının Md. 18 yüküne girmez.
            //
            // 09.09.2026'da ölçüldü: bu ayrım yoktu ve saatler ÇİFTE
            // SAYILIYORDU. Gerçek bir ortaokul dosyasında 3 özel eğitim
            // şubesinin 89 saati hem "Özel Eğitim -> 6 norm" satırında hem de
            // Türkçe (+21s), Matematik (+15s), Fen (+12s) yüklerinin içinde
            // görünüyordu; okulun normu 6 kadro fazla çıkıyordu.
            //
            // Bu şubelerin saatleri aşağıdaki özel eğitim bloğunda ayrıca
            // toplanır; burada yalnızca branş bazlı Md. 18 birikiminden
            // çıkarılır.
            // 16.09.2026: özel eğitim OKUL türlerinde her şube özel eğitim şubesidir (Md. 17/1
            // "özel eğitim kurumları ile özel eğitim sınıflarında"); işaretsiz eklenen şube
            // eskiden Md. 18/19 ile branş normu alıyordu.
            if (this.ozelEgitimSubesiMi(sec, schoolType)) {
                return;
            }

            const isGrade12 = String(sec.sinifSeviyesi) === "12";
            const gradeLevel = sec.sinifSeviyesi;
            // Kaynaştırma öğrenci sayısı (Madde 22/1-ç). Arayüzde henüz bu alan
            // yoksa 0 kabul edilir ve kural devreye girmez.
            const inclusionCount = parseInt(
                sec.kaynastirmaOgrenciSayisi ?? sec.kaynastirmaSayisi ?? 0, 10
            ) || 0;
            // Eğik çizgili dersler, okulun seçtiği branş sayısı kadar kayda
            // genişletilir (bkz. dersiGenislet). Bölme seçilmemişse liste
            // aynen kalır; bugünkü davranış değişmez.
            const allCourses = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])]
                .reduce((liste, c) => liste.concat(this.dersiGenislet(c)), []);
            const studentCount = this.subeOgrenciSayisi(sec);   // N-06: 0 öğrenci 30 sayılmaz

            allCourses.forEach(course => {
                const cName = course.ders || course.ders_adi;
                let assignedBranch = (course.atananBrans !== undefined && course.atananBrans !== null && course.atananBrans !== "") ? course.atananBrans : (course.varsayilanBrans || "");
                // N-10: branşı olmayan ders DERS ADIYLA bir branşa yazılmaz; aşağıdaki
                // "branşsız" kolu saatini okulun toplam yüküne ekler.

                // SINIF BİRLEŞTİRME (Denetim N-03, 15.09.2026)
                // Birleştirilmiş sınıfın yükü bileşenin temsilci şubesinde BİR kez
                // yazılır; grup sayısı birleşik sınıfın toplam mevcuduyla bulunur.
                // Eskiden her şube kendi listesinden ayrı anahtar kuruyordu: üç
                // şubede yük üç kez sayılıyor, iki şubede sonuç şubelerin listedeki
                // sırasına göre değişiyordu.
                const birlesikPay = course._bolunmusBrans || course._dagitilmisBrans || "";
                const birlesik = birlesikBilgi.get(sec.id + "##" + cName + (birlesikPay ? "::" + birlesikPay : ""));
                let carpanOgrenci = studentCount;
                let carpanSinif = gradeLevel;
                let carpanKaynastirma = inclusionCount;
                let birlesikNotu = "";
                if (birlesik) {
                    if (sec.id !== birlesik.temsilci) {
                        birlesikSubeDusumu += parseInt(course.saat || course.ders_saati || 0, 10) || 0;
                        return;
                    }
                    carpanOgrenci = birlesik.ogrenci || studentCount;
                    carpanSinif = birlesik.sinif;
                    carpanKaynastirma = birlesik.kaynastirma;
                    birlesikNotu = `Birleşik sınıf: ${birlesik.uyeler.length} şube, ${carpanOgrenci} öğrenci. `;
                }

                // Branş atanmamışsa hiçbir branşın normuna yazılmaz — ama ders
                // çizelgede yer aldığı için OKULUN TOPLAM DERS YÜKÜNE dâhildir.
                //
                // Eskiden burada saat tamamen düşüyordu: 33 saatlik bir şubede
                // bir dersin branşı "Atanmadı" bırakılınca üstteki toplam 27
                // gösteriyordu ve 6 saatin nereye gittiği anlaşılmıyordu.
                // (Ölçüldü 05.09.2026; okul müdürü "toplam ders yükü farklı
                //  çıkıyor" bildirimi üzerine bulundu.)
                //
                // Aynı ilke rehberlik dersi için 27.08.2026'da zaten
                // benimsenmişti: "branşa atanmasa bile, ders çizelgesinde
                // olduğu için toplam okul norm yüküne eklensin."
                if (!assignedBranch || assignedBranch.trim() === "" || assignedBranch === "— Branş Atanmadı —" || assignedBranch === "Diğer") {
                    const m = this.evaluateCourseMultiplier(
                        course, carpanOgrenci, schoolType, carpanSinif, carpanKaynastirma);
                    branssizSaat += m.calculatedLoad || 0;
                    islenmisYuk += m.calculatedLoad || 0;
                    return;
                }

                // Kanonik Branş Normalizasyonu (T.C. İnkılap Tarihi -> Tarih, Sağlık Bilgisi -> Biyoloji vb.)
                const normB = this.normalizeText(assignedBranch);
                if (normB.includes("inkilap") || normB === "tarih") {
                    assignedBranch = "Tarih";
                } else if (normB === "turkdiliveedebiyati" || normB === "turkedebiyati" || normB === "dilveanlatim") {
                    assignedBranch = "Türk Dili ve Edebiyatı";
                } else if (normB === "matematik" || normB === "temelmatematik" || normB === "ilerimatematik") {
                    assignedBranch = "Matematik";
                } else if (normB === "fizik") {
                    assignedBranch = "Fizik";
                } else if (normB === "kimya") {
                    assignedBranch = "Kimya";
                } else if (normB === "biyoloji" || normB.includes("saglikbilgisi") || normB.includes("trafik")) {
                    assignedBranch = "Biyoloji";
                } else if (normB === "cografya") {
                    assignedBranch = "Coğrafya";
                } else if (normB === "felsefe" || normB === "sosyoloji" || normB === "psikoloji" || normB === "mantik") {
                    assignedBranch = "Felsefe";
                } else if (normB.includes("dinkulturu")) {
                    assignedBranch = "Din Kültürü ve Ahlak Bilgisi";
                } else if (normB === "ingilizce" || normB === "yabancidil" || normB === "birinciyabancidil" || normB.includes("yabancidil") || normB.includes("ingilizce")) {
                    assignedBranch = "İngilizce";
                } else if (normB === "almanca" || normB === "ikinciyabancidil" || normB.includes("almanca")) {
                    assignedBranch = "Almanca";
                } else if (normB.includes("bedenegitimi")) {
                    assignedBranch = "Beden Eğitimi";
                } else if (normB === "gorselsanatlar") {
                    assignedBranch = "Görsel Sanatlar";
                } else if (normB === "muzik") {
                    assignedBranch = "Müzik";
                } else if (normB.includes("rehberlik")) {
                    assignedBranch = "Rehberlik";
                }

                // Y7 — NORM DERSİN RESMÎ ALANINA YAZILIR (kullanıcı kararı 16.09.2026).
                // İdarecinin seçimi silinmez: ders satırında "fiilî dağılım" olarak
                // görünür. Eğik çizgili ders parçaları (_bolunmusBrans) ve hedef
                // temelli paylaştırma (_dagitilmisBrans) BİLİNÇLİ dağıtımlardır,
                // dokunulmaz. "Branş Atanmadı" seçimi yukarıda zaten ayrılmıştır.
                // İSTİSNA — REHBERLİK VE YÖNLENDİRME DERSİ (kullanıcı kararı 16.09.2026):
                // "Bu ders okul rehber öğretmeninin dışında, her sınıfa verilen bir derstir;
                // bütün branşlar girebilir ve o branşın normuna ilave edilir." Dersin tek bir
                // resmî alanı olmadığı için Y7 kuralı bu derse uygulanmaz: idareci hangi
                // branşa verdiyse yük oraya yazılır. (Rehber öğretmen normu bundan bağımsızdır;
                // Md. 21 öğrenci sayısına göre hesaplanır.)
                //
                // İSTİSNA — "Özel Eğitim" seçimi (Denetim N-08).
                //
                // MEVZUAT TARAMASI (16.09.2026, resmî metin norm_kadro_yonetmeligi.txt):
                // Md. 17 özel eğitim öğretmeni normunu "açılan her sınıf veya şube için"
                // verir — DERS YÜKÜNE bağlamaz. Md. 18 ders yükünden norm verir ama
                // "genel bilgi ve meslek dersleri öğretmeni" içindir. Md. 22/1-c alan ders
                // yükünü tarif eder, özel eğitimden söz etmez. Yani normal şubedeki bir
                // dersin özel eğitim öğretmenine yazılması hâlinde ne yapılacağına dair
                // AÇIK HÜKÜM YOK. Kullanıcı kararı: "açık hüküm yoksa bu şekilde kalsın."
                // Bugünkü davranış: saat Özel Eğitim satırında görünür (kaybolmaz), ayrıca
                // Md. 18 normu doğurmaz ve Y7 ile dersin alanına taşınmaz.
                //
                // Eski not (kullanıcı kararı 16.09.2026: "norm doğurmasın şimdilik"). Normal şubedeki
                // bir dersi özel eğitim öğretmenine yazan idarecinin seçimi korunur;
                // saat Özel Eğitim satırında durur ve ayrıca Md. 18 normu üretmez.
                // Y7 burada uygulansaydı saat dersin alanına (ör. Matematik) taşınır ve
                // kullanıcının bu sabah verdiği karar sessizce değişmiş olurdu.
                let fiiliBrans = "";
                if (this.normDersinResmiAlaninaYazilir
                    && assignedBranch !== "Özel Eğitim"
                    && !this.normalizeText(cName).includes("rehberlik")
                    && !course._bolunmusBrans && !course._dagitilmisBrans) {
                    const resmiAlan = this._resmiDersAlani(cName, sec, schoolType, course.kategori);
                    if (resmiAlan && resmiAlan !== assignedBranch) {
                        fiiliBrans = assignedBranch;
                        assignedBranch = resmiAlan;
                    }
                }

                // Grup / Çalgı / Atölye Katsayısı Hesabı (sınıf seviyesi Md. 22/1-ç için şart).
                // Birleşik derste birleşik sınıfın mevcudu kullanılır (bkz. yukarıda).
                const mult = this.evaluateCourseMultiplier(course, carpanOgrenci, schoolType, carpanSinif, carpanKaynastirma);
                let load = mult.calculatedLoad;
                let haricNotu = "";

                // MESEM (Md. 22/2): bazı dersler ŞUBE yüküne girmez.
                // Ayrıntılı gerekçe mesemDersHaricMi() üzerinde.
                if (isMesemKurum) {
                    const karar = this.mesemDersHaricMi(course, sec);
                    if (karar.haric) {
                        mesemHaricSaati += parseInt(course.saat || course.ders_saati || 0, 10) || 0;
                        load = 0;
                        haricNotu = karar.sebep;
                    }
                }

                ensureBranch(assignedBranch);

                branchLoadMap[assignedBranch] += load;
                islenmisYuk += load;
                // Yükü doğru maddeye yaz: ATOLYE -> Madde 19, GENEL -> Madde 18
                if (mult.loadCategory === "ATOLYE") {
                    branchLoadSplit[assignedBranch].atolye += load;
                } else {
                    branchLoadSplit[assignedBranch].genel += load;
                }

                const fiiliNot = fiiliBrans
                    ? `İdareci bu dersi "${fiiliBrans}" branşına verdi; norm dersin alanına yazıldı (Md. 22/1-c-1).`
                    : "";
                branchCourseDetails[assignedBranch].push({
                    sectionName: sec.subeAdi,
                    courseName: cName,
                    baseHours: course.saat || course.ders_saati || 0,
                    calculatedLoad: load,
                    fiiliBrans: fiiliBrans || undefined,
                    note: [haricNotu || ((birlesikNotu + (mult.note || "")).trim()), fiiliNot].filter(Boolean).join(" · "),
                    loadCategory: mult.loadCategory,
                    // Satır raporda GÖRÜNMEYE devam eder ama yükü 0'dır; okulun
                    // "bu saat nereye gitti?" sorusu cevapsız kalmasın.
                    mesemHaric: !!haricNotu
                });
            });
        });

        // ÖZEL EĞİTİM SINIFLARINDA ALAN ÖĞRETMENİNİN OKUTTUĞU DERSLER (özel eğitim 2. dalga, 16.09.2026)
        // Kural: ozelEgitimDersOkutani. Yük, yönetici düşümü ve şefliklerden ÖNCE yazılır.
        // Birleştirilmiş sınıfta (ÖEHY 27/3-a) aynı ders sınıf başına bir kez okutulur:
        // yük = sınıf sayısı x gruptaki en yüksek haftalık saat; fark mutabakatta "birleşik düşüm".
        const ozelAlanSaati = {};        // şube id -> özel eğitim satırından çıkan (ham) saat
        const ozelAlanBrans = {};        // branş -> { ham, yuk }
        if (!isMesemKurum) {
            const oeSecenekAlan = (coordinatorHoursMap && coordinatorHoursMap.adminOptions) || {};
            const acikAlanBranslariOE = this.acikAlanlar(subeler, schoolType).map(a => a.brans);
            this.ozelEgitimSinifGruplari(subeler, schoolType).forEach(g => {
                const N = this.ozelEgitimBirlesikSinifSayisi(g, oeSecenekAlan);
                const kalemler = {};
                g.subeler.forEach(sec => {
                    [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])].forEach(c => {
                        const ok = this.ozelEgitimDersOkutani(Object.assign({}, c, { _sinif: sec.sinifSeviyesi }), g.turKod, g.kademe, acikAlanBranslariOE);
                        if (!ok) return;
                        const cName = c.ders || c.ders_adi;
                        ok.paylar.forEach(p => {
                            ozelAlanSaati[sec.id] = (ozelAlanSaati[sec.id] || 0) + p.saat;
                            const anahtar = N === null ? `${sec.id}##${p.brans}##${cName}` : `${p.brans}##${this.normalizeText(cName)}`;
                            const k = kalemler[anahtar] || (kalemler[anahtar] = { brans: p.brans, ders: cName, atolye: ok.atolye, dayanak: ok.dayanak, saatler: [], subeler: [] });
                            k.saatler.push(p.saat);
                            k.subeler.push(sec.subeAdi || sec.id);
                        });
                    });
                });
                Object.values(kalemler).forEach(k => {
                    const ham = k.saatler.reduce((a, b) => a + b, 0);
                    const yuk = N === null ? ham : Math.min(ham, N * Math.max(...k.saatler));
                    birlesikSubeDusumu += ham - yuk;
                    ensureBranch(k.brans);
                    branchLoadMap[k.brans] += yuk;
                    islenmisYuk += yuk;
                    if (k.atolye) branchLoadSplit[k.brans].atolye += yuk; else branchLoadSplit[k.brans].genel += yuk;
                    const ob = ozelAlanBrans[k.brans] || (ozelAlanBrans[k.brans] = { ham: 0, yuk: 0 });
                    ob.ham += ham; ob.yuk += yuk;
                    branchCourseDetails[k.brans].push({
                        sectionName: N === null ? k.subeler[0] : `${k.subeler.join(", ")} (birleştirilmiş ${N} sınıf)`,
                        courseName: k.ders,
                        baseHours: N === null ? ham : Math.max(...k.saatler),
                        calculatedLoad: yuk,
                        note: `Özel eğitim sınıfı — ${k.dayanak}` + (N !== null && ham !== yuk ? ` · birleştirilmiş sınıfta sınıf başına bir kez (ÖEHY 27/3-a): ${ham} → ${yuk} saat` : ""),
                        loadCategory: k.atolye ? "ATOLYE" : "GENEL",
                        ozelEgitimSinifi: true
                    });
                });
            });
            // Bu saatler artık genel branş havuzundan geçiyor: özel eğitim sayacından çıkar.
            ozelEgitimSaati -= Object.values(ozelAlanSaati).reduce((a, b) => a + b, 0);
        }

        // İşletmelerde Mesleki Eğitim / Koordinatörlük Yüklerinin İlavesi
        // Dayanak: MEB Norm Kadro Yönetmeliği Madde 22/2-3 (MESEM) ve OÖKY Md. 88 / Ek Ders Kararı Md. 15 (MTAL)
        const isVocationalSchool = this.isMeslekiKurum(schoolType, subeler);
        const isMesem = String(schoolType).includes("mesleki_egitim_merkezi") || String(schoolType).includes("mesem");

        // MESEM ÇIRAK SAYISI **ALAN** BAZINDA TOPLANIR — BRANŞ BAZINDA DEĞİL.
        //
        // Md. 22/2: "...meslek ALANINDAKİ tüm sınıf seviyelerinde kayıtlı
        // toplam çırak sayısı ... gruplandırılır."
        //
        // Önceki sürüm branşa göre topluyordu. 38 MESEM alanının 3'ü aynı branşı
        // paylaşıyor (Bilişim Teknolojileri <- bilisim_teknolojileri +
        // siber_guvenlik) ve sonuç İKİ YÖNE BİRDEN sapıyordu (ölçüldü 11.09.2026):
        //     Bilişim 20 + Siber 20 -> doğrusu 1+1 grup = 64 saat,
        //                              branş bazında 40 çırak = 1 grup = 32 saat
        //     Bilişim  5 + Siber  5 -> doğrusu 0 grup   =  0 saat,
        //                              branş bazında 10 çırak = 1 grup = 32 saat
        //
        // Ders saati de artık çizelgeden okunuyor (Md. 22/2: "çerçeve öğretim
        // programında yer alan ... ders saati").
        const mesemAlanBilgi = {};
        if (isMesem) {
            subeler.forEach(sec => {
                const alanId = sec.alanId;
                if (!alanId) return;
                const kayit = mesemAlanBilgi[alanId] || (mesemAlanBilgi[alanId] = {
                    cirak: 0, isletmeSaati: 0, brans: null, bransCirak: {}, celisenBranslar: null
                });
                const subeCirak = parseInt(sec.ogrenciSayisi, 10) || 0;
                kayit.cirak += subeCirak;
                const subeBranslari = new Set();

                [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])].forEach(c => {
                    if (!this.mesemIsletmeDersiMi(c)) return;
                    const saat = parseInt(c.saat || c.ders_saati || 0, 10) || 0;
                    // Sınıf seviyeleri arasında saat farklıysa en yükseği esas
                    // alınır; barem alanın tamamı için TEK grup sayısı üretir.
                    // YORUM DEFTERİ Y14 (kullanıcı kararı 16.09.2026: şimdilik dokunma,
                    // not düş): ağırlıklı ortalama daha tutarlı olurdu. Bugün fark
                    // üretmiyor — 768 işletme dersinin hepsi 32 saat. Çizelgelerde
                    // sınıfa göre farklı saat çıkarsa bu seçim yeniden değerlendirilmeli.
                    if (saat > kayit.isletmeSaati) kayit.isletmeSaati = saat;
                    const b = String(c.atananBrans || "").trim();
                    if (b && b !== "— Branş Atanmadı —" && b !== "Diğer") subeBranslari.add(b);
                });
                subeBranslari.forEach(b => {
                    kayit.bransCirak[b] = (kayit.bransCirak[b] || 0) + subeCirak;
                });
            });
            // ŞUBE SIRASINDAN BAĞIMSIZ (Denetim N-09, 16.09.2026): yük, alanda
            // işletme dersini en çok çırağa okutan branşa yazılır; eşitlikte ada
            // göre. Eskiden ilk eklenen şubenin branşı alınıyordu; aynı okulda
            // yalnız şube ekleme sırası değişince normun yazıldığı branş değişiyordu.
            // Aynı alanda farklı branş seçilmişse not satırında gösterilir.
            Object.values(mesemAlanBilgi).forEach(k => {
                const adaylar = Object.entries(k.bransCirak)
                    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"));
                k.brans = adaylar.length ? adaylar[0][0] : null;
                k.celisenBranslar = adaylar.length > 1 ? adaylar : null;
            });
        }

        // Barem sonucu, alanın işletme dersinin atandığı branşa yazılır.
        const mesemBranchStudentCounts = {};
        const mesemBranchIsletmeHours = {};
        Object.values(mesemAlanBilgi).forEach(k => {
            if (!k.brans) return;
            const grup = this.calculateMesemApprenticeGroups(k.cirak);
            const saat = k.isletmeSaati
                || this.rules.mesemApprenticeRules.weeklyHoursPerGroupFallback;
            mesemBranchStudentCounts[k.brans] = (mesemBranchStudentCounts[k.brans] || 0) + k.cirak;
            mesemBranchIsletmeHours[k.brans] = (mesemBranchIsletmeHours[k.brans] || 0) + grup * saat;
        });

        // İŞLETMELERDE MESLEK EĞİTİMİ YÜKÜ yalnızca MESEM'de bu yoldan eklenir
        // (Md. 22/2 baremi; idareci gerekirse branş bazında düzeltir). Meslek
        // lisesinde elle girilen "koordinatörlük" saatinin norm hesabında
        // dayanağı yok; eski kayıtlar yüklemede şefliğe çevrilir (bkz. aşağıda
        // şeflik bloğu ve state._koordinatorluguSeflikeCevir).
        const allVocationalOrCustomCoordinatorBranches = (isVocationalSchool && isMesem) ? new Set([
            ...Object.keys(mesemBranchStudentCounts),
            ...Object.keys(coordinatorHoursMap || {}).filter(k => k !== "adminOptions")
        ]) : new Set();

        const branchCoordinatorMap = {};

        allVocationalOrCustomCoordinatorBranches.forEach(branchName => {
            let coordHours = 0;
            let coordNote = "";

            if (coordinatorHoursMap && coordinatorHoursMap[branchName] !== undefined) {
                coordHours = parseInt(coordinatorHoursMap[branchName], 10) || 0;
                coordNote = isMesem ? "MESEM İşletmelerde Meslek Eğitimi (Kullanıcı Tanımlı)" : "İşletmelerde Mesleki Eğitim Koordinatörlüğü (Kullanıcı Tanımlı)";
            } else if (isMesem && mesemBranchIsletmeHours[branchName] !== undefined) {
                // Md. 22/2: alan bazında çırak ➔ grup ➔ grup x çerçeve saati.
                // Hesap yukarıda alan alan yapıldı; burada yalnızca yazılıyor.
                coordHours = mesemBranchIsletmeHours[branchName];
                const alanlar = Object.entries(mesemAlanBilgi)
                    .filter(([, k]) => k.brans === branchName)
                    .map(([, k]) => {
                        const g = this.calculateMesemApprenticeGroups(k.cirak);
                        const st = k.isletmeSaati
                            || this.rules.mesemApprenticeRules.weeklyHoursPerGroupFallback;
                        const celiski = k.celisenBranslar
                            ? ` (aynı alanda farklı branş seçilmiş: ${k.celisenBranslar.map(([b, n]) => `${b} ${n} çırak`).join(", ")}; yük en çok çırağı olan branşa yazıldı)`
                            : "";
                        return `${k.cirak} çırak ➔ ${g} grup x ${st}s${celiski}`;
                    });
                coordNote = `MEB Norm Kadro Yön. Md. 22/2 (alan bazında): `
                          + alanlar.join("  +  ") + ` = ${coordHours}s İşletmelerde Mesleki Eğitim Yükü`;
            }

            if (coordHours > 0) {
                ensureBranch(branchName);
                branchLoadMap[branchName] += coordHours;
                // Madde 19/1: "...işletmelerde meslek eğitimi dersi dâhil toplam ders yükü"
                // Bu yük ATÖLYE VE LABORATUVAR normuna sayılır, Madde 18'e değil.
                branchLoadSplit[branchName].atolye += coordHours;
                branchCoordinatorMap[branchName] = coordHours;

                branchCourseDetails[branchName].push({
                    sectionName: isMesem ? "Tüm Sınıflar Çıraklık" : "12. Sınıf Staj",
                    courseName: "İşletmelerde Mesleki Eğitim",
                    baseHours: coordHours,
                    calculatedLoad: coordHours,
                    note: coordNote,
                    isCoordinator: true,
                    loadCategory: "ATOLYE"
                });
            }
        });

        // ALAN / ATÖLYE ŞEFLİKLERİ (kullanıcı kararı, 15.09.2026)
        //
        // Norm Kadro Yön. Md. 22/1-c-2: alan ders yükü hesaplanırken şeflerin
        // "göreve ilişkin ders saatleri de dikkate alınır"; saat Ek Ders Kararı
        // Md. 6/4'ten (alan şefi 10, atölye/laboratuvar şefi 6). Şeflik okulda
        // her açılan alan için oluşturulur, atölye şefliği komisyon tespitiyle (OÖKY
        // Md. 84/1, 84/5); şef valinin onayıyla 4 yıl görevlendirilir (84/B). Görevli
        // şef olup olmadığını uygulama bilemez; sayısını TAHMİN ETMEZ,
        // idareci girer. Eskiden burada 12. sınıfı olan her meslek branşına
        // kendiliğinden 10 saat "koordinatörlük" ekleniyordu: şeflik açılmış mı
        // bakılmıyor, dayanak olarak ek ders mevzuatı gösteriliyordu (Denetim N-11).
        // Yük ATÖLYE kovasına yazılır: şef ancak atölye ve laboratuvar öğretmeni
        // olabilir (OÖKY Md. 84/A).
        const branchSeflikMap = {};
        if (isVocationalSchool) {
            // Aktif alanlar = şubelerde seçilmiş alanlar; her alana bir şef (acikAlanlar).
            const aktifAlanBranslari = this.acikAlanlar(subeler, schoolType);
            const sefler = this.seflikSaatleri(
                coordinatorHoursMap && coordinatorHoursMap.adminOptions, schoolType, aktifAlanBranslari);
            Object.entries(sefler).forEach(([branchName, s]) => {
                ensureBranch(branchName);
                branchLoadMap[branchName] += s.saat;
                branchLoadSplit[branchName].atolye += s.saat;
                branchSeflikMap[branchName] = s.saat;
                const parca = [];
                if (s.alanSefi > 1) parca.push(`${s.alanSefi} alan şefi (${(s.sefliAlanlar || []).join(", ")}) x ${s.alanBirim}s = ${s.alanSaat}s`);
                else if (s.alanSefi) parca.push(`alan şefi ${s.alanSaat}s`);
                if (s.atolyeSefi) parca.push(`${s.atolyeSefi} atölye/laboratuvar şefi x ${s.atolyeBirim}s = ${s.atolyeSaat}s`);
                branchCourseDetails[branchName].push({
                    sectionName: "Şeflik görevi",
                    courseName: "Planlama ve Bakım-Onarım Görevi",
                    baseHours: s.saat,
                    calculatedLoad: s.saat,
                    note: `Norm Kadro Yön. Md. 22/1-c-2 · Ek Ders Kararı Md. 6/4: ${parca.join(" + ")}`,
                    isSeflik: true,
                    loadCategory: "ATOLYE"
                });
            });
        }

        // Madde 22/6: "Alanlara gore ogretmen norm kadrolari, YONETICILERIN GIRMIS
        // OLDUGU DERS SAATLERI ilgili alanin ders yukunden DUSULEREK belirlenir."
        //
        // Yoneticinin okuttugu saat, o brans icin ayrica ogretmen normu dogurmaz;
        // dusulmezse norm oldugundan yuksek cikar. Dusum, brans yukunun mevcut
        // Madde 18 (genel) / Madde 19 (atolye) oranina gore paylastirilir; boylece
        // hangi kovadan dusuldugu keyfi olmaz.
        const adminTeachingMap = (coordinatorHoursMap && coordinatorHoursMap.adminOptions
            && coordinatorHoursMap.adminOptions.yoneticiDersYukleri) || {};
        const branchAdminDeduction = {};

        Object.keys(adminTeachingMap).forEach(branchName => {
            const istenen = parseInt(adminTeachingMap[branchName], 10) || 0;
            if (istenen <= 0) return;

            const mevcutYuk = branchLoadMap[branchName] || 0;
            if (mevcutYuk <= 0) return;

            // Yonetici saati brans yukunden buyuk olamaz: yuk eksiye dusemez.
            const dusulen = Math.min(istenen, mevcutYuk);
            const split = branchLoadSplit[branchName] || { genel: 0, atolye: 0 };
            const genelPay = Math.min(split.genel, Math.round(dusulen * (split.genel / mevcutYuk)));
            const atolyePay = Math.min(split.atolye, dusulen - genelPay);

            branchLoadMap[branchName] = mevcutYuk - dusulen;
            split.genel -= genelPay;
            split.atolye -= atolyePay;
            branchAdminDeduction[branchName] = dusulen;

            (branchCourseDetails[branchName] = branchCourseDetails[branchName] || []).push({
                sectionName: "Yönetici Ders Saati",
                courseName: "Yöneticilerin okuttuğu dersler",
                baseHours: -dusulen,
                calculatedLoad: -dusulen,
                note: `MEB Norm Kadro Yön. Md. 22/6: ${dusulen} saat branş ders yükünden düşüldü${dusulen < istenen ? ` (girilen ${istenen} saat, branş yükünden fazla olduğu için sınırlandı)` : ""}`,
                isAdminDeduction: true
            });
        });

        const branchReport = [];
        let totalCalculatedNorm = 0;
        let totalCurrentTeachers = 0;
        let totalSurplus = 0;
        let totalNeeded = 0;

        const allBranchesSet = new Set([
            ...Object.keys(branchLoadMap),
            ...Object.keys(existingTeachers)
        ]);

        // Rehberlik branşı ders yükü listesinde görünmesin (Sınıf rehberliği yükü branş öğretmenlerine yazılır)
        allBranchesSet.delete("Rehberlik");
        allBranchesSet.delete("Rehberlik ve Psikolojik Danışmanlık");
        allBranchesSet.delete("Rehberlik / Psikolojik Danışmanlık");

        // Özel eğitim sınıfları — Md. 17/1. Norm ŞUBE BAŞINA ve ENGEL TÜRÜNE
        // göre hesaplanır; eskiden burada sabit "şube x 2" vardı ve lise
        // kademesindeki hafif zihinsel şubeler (Md. 17/1-e: 1) iki katı
        // norm üretiyordu.
        const specialEduSections = subeler.filter(s => this.ozelEgitimSubesiMi(s, schoolType));
        // Sınıf mevcudu sınırı aşılan özel eğitim şubeleri (ÖEHY) — norm DEĞİŞMEZ, uyarılır.
        let ozelEgitimUyarilari = [];
        let ozelEgitimBirlesikSiniflar = [];
        const specialEduSectionCount = specialEduSections.length;

        if (specialEduSectionCount > 0) {
            // NORMAL ŞUBE SAATİ KAYBOLMAZ (Denetim N-08, 16.09.2026): normal
            // şubelerde "Özel Eğitim" branşına verilen derslerin yükü de bu satırda
            // durur. Eskiden satır silinip yerine yalnız özel şubelerden türetilen
            // Md. 17 satırı konuyordu; o saat hiçbir yerde görünmüyor, okul toplamı
            // eksik çıkıyor ve mutabakat bozulduğu için rapor paneli gizleniyordu.
            // Bu saat için ayrıca Md. 18 normu HESAPLANMAZ (kullanıcı kararı bekliyor).
            const normalSubeOzelSaat = branchLoadMap["Özel Eğitim"] || 0;
            allBranchesSet.delete("Özel Eğitim");
            // Şube saati detayın İÇİNDE hesaplanır ve toplam ondan türetilir:
            // Master matristeki Özel Eğitim kartı şube satırlarını bu detaydan
            // basıyor. Saat kuralı iki yerde yazılsaydı kart satırları ile kart
            // başlığı sessizce ayrışabilirdi (14.09.2026).
            const ozelDetay = specialEduSections.map(sec => {
                const h = this.ozelEgitimSubeNormu(
                    this.ozelEgitimKayitTuru(sec, schoolType), sec.sinifSeviyesi);
                const ih = this.ozelEgitimSinifIhtiyaci(sec, schoolType);
                const tumDersler = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
                const dersSaati = tumDersler
                    .reduce((dsum, d) => dsum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
                // Alan öğretmeninin okuttuğu saat (ozelAlanSaati) ilgili branşa yazıldı; burada kalmaz.
                const alanSaat = ozelAlanSaati[sec.id] || 0;
                return { subeId: sec.id, sube: sec.subeAdi, saat: dersSaati > 0 ? dersSaati - alanSaat : (tumDersler.length ? 0 : 30), alanSaat,
                         norm: h.norm, dayanak: h.dayanak, kesinlik: h.kesinlik || "kesin", belirsizlik: h.belirsizlik || null,
                         engelTuru: this.ozelEgitimTuru(this.ozelEgitimKayitTuru(sec, schoolType)).ad,
                         ogrenci: ih.ogrenci, enFazla: ih.enFazla, sinirDayanak: ih.dayanak,
                         gerekenSinif: ih.gerekenSinif, sinirAsildi: ih.sinirAsildi,
                         olasiNorm: ih.olasiNorm, mesaj: ih.mesaj, sinirNotu: ih.not,
                         ortamUyarisi: this.ozelEgitimOrtamUyarisi(sec, schoolType, subeler) };
            });
            // BİRLEŞTİRİLMİŞ SINIF: aynı tür + kademe şubeleri okulun girdiği sınıf sayısına iner.
            const oeSecenek = (coordinatorHoursMap && coordinatorHoursMap.adminOptions) || {};
            const KADEME_AD = { okuloncesi: "okul öncesi", ilkokul: "ilkokul", ortaokul: "ortaokul", lise: "lise", diger: "" };
            this.ozelEgitimSinifGruplari(specialEduSections, schoolType).forEach(g => {
                const N = this.ozelEgitimBirlesikSinifSayisi(g, oeSecenek);
                if (N === null) return;
                const satirlar = g.subeler.map(s => ozelDetay[specialEduSections.indexOf(s)]).filter(Boolean);
                if (!satirlar.length) return;
                const kapasite = g.enFazla ? N * g.enFazla : null;
                const sinirAsildi = kapasite !== null && g.ogrenci > kapasite;
                const etiket = `${g.subeAdlari.join(", ")} birleştirilmiş sınıf: ${N} sınıf`;
                const mesaj = g.enFazla
                    ? (sinirAsildi
                        ? `${etiket}, ${g.ogrenci} öğrenci; sınıf mevcudu en fazla ${g.enFazla} (${g.sinirDayanak}) → en az ${g.enAzSinif} sınıf gerekir. Sınıflar Valilik Oluru ile açılırsa norm ${g.enAzSinif * g.normSinif} olur.`
                        : `${etiket}, ${g.ogrenci} öğrenci; sınıf başına en fazla ${g.enFazla} (${g.sinirDayanak}) — uygun.`)
                    : `${etiket}, ${g.ogrenci} öğrenci.`;
                satirlar.forEach((x, i) => {
                    x.norm = i < N ? g.normSinif : 0;
                    x.birlesikSinif = g.anahtar;
                    x.dayanak = i < N
                        ? `${g.normDayanak} · birleştirilmiş sınıf (ÖEHY 27/3-a)`
                        : `birleştirilmiş sınıfa dâhil (${satirlar[0].sube}) — ayrıca norm yok`;
                    x.enFazla = null; x.gerekenSinif = null; x.olasiNorm = null;
                    x.sinirAsildi = sinirAsildi && i === 0;
                    x.mesaj = i === 0 ? mesaj : null;
                    x.sinirNotu = i === 0 ? mesaj : null;
                });
                if (N > satirlar.length) satirlar[satirlar.length - 1].norm += (N - satirlar.length) * g.normSinif;
                ozelEgitimBirlesikSiniflar.push({
                    anahtar: g.anahtar, engelTuru: g.turAd, kademe: KADEME_AD[g.kademe] || g.kademe,
                    subeler: g.subeAdlari, ogrenci: g.ogrenci, sinifSayisi: N, normSinif: g.normSinif,
                    norm: N * g.normSinif, enFazla: g.enFazla, sinirDayanak: g.sinirDayanak,
                    enAzSinif: g.enAzSinif, sinirAsildi, mesaj, normDayanak: g.normDayanak
                });
            });

            ozelEgitimUyarilari = ozelDetay.filter(x => x.sinirAsildi || x.ortamUyarisi || x.belirsizlik || (!x.birlesikSinif && !x.enFazla && x.sinirNotu))
                .map(x => ({ subeId: x.subeId, sube: x.sube, ortamUyarisi: x.ortamUyarisi || undefined, kesinlik: x.kesinlik,
                             mesaj: [x.ortamUyarisi, x.belirsizlik, (x.sinirAsildi || !x.enFazla) ? (x.mesaj || x.sinirNotu) : null].filter(Boolean).join(" ") || x.mesaj,
                             gerekenSinif: x.gerekenSinif, olasiNorm: x.olasiNorm, sinirAsildi: x.sinirAsildi }));
            const specialEduNorm = ozelDetay.reduce((a, x) => a + x.norm, 0);
            const specialEduHours = ozelDetay.reduce((a, x) => a + x.saat, 0);
            
            const currentTeachers = parseInt(existingTeachers["Özel Eğitim"] || 0, 10);
            const diff = currentTeachers - specialEduNorm;
            let statusText = "Tam";
            let statusType = "tam";
            let statusBadge = "Tam";
            if (diff > 0) {
                statusText = `${diff} Fazlalık`;
                statusType = "fazla";
                statusBadge = `+${diff} Fazla`;
                totalSurplus += diff;
            } else if (diff < 0) {
                statusText = `${Math.abs(diff)} İhtiyaç`;
                statusType = "ihtiyac";
                statusBadge = `${diff} İhtiyaç`;
                totalNeeded += Math.abs(diff);
            }

            totalCalculatedNorm += specialEduNorm;
            totalCurrentTeachers += currentTeachers;

            branchReport.push({
                branchName: "Özel Eğitim",
                totalHours: specialEduHours + normalSubeOzelSaat,
                normalSubeSaati: normalSubeOzelSaat,
                calculatedNorm: specialEduNorm,
                currentTeachers: currentTeachers,
                coordinatorHours: 0,
                diff: diff,
                statusText: statusText,
                statusType: statusType,
                statusBadge: statusBadge,
                formulaExplanation: `MEB Norm Kadro Yön. Md. 17/1 — açılan sınıf/şube başına, engel türüne göre: `
                    + ozelDetay.map(x => `${x.sube} = ${x.norm} (${x.dayanak})`).join(" · ")
                    + ozelEgitimBirlesikSiniflar.map(b => ` · Birleştirilmiş sınıf (ÖEHY 27/3-a): ${b.subeler.join(", ")} → ${b.sinifSayisi} sınıf × ${b.normSinif} = ${b.norm}`).join("")
                    + ` ➔ Toplam ${specialEduNorm} Norm`
                    + (normalSubeOzelSaat
                        ? ` · Normal şubelerden Özel Eğitim branşına verilen ${normalSubeOzelSaat} saat yükte gösterildi (bu saat için ayrıca norm hesaplanmadı)`
                        : ""),
                ozelEgitimDetay: ozelDetay,
                ozelEgitimBirlesikSiniflar: ozelEgitimBirlesikSiniflar,
                courses: branchCourseDetails["Özel Eğitim"] || [],
                isSpecialEdu: true
            });
        }

        allBranchesSet.forEach(branchName => {
            const totalHours = branchLoadMap[branchName] || 0;
            const ozelAlan = ozelAlanBrans[branchName] || null;
            const currentTeachers = parseInt(existingTeachers[branchName] || 0, 10);

            // Kullanıcı Talimatı: Ders yükü 0 olan branşlar sağ panel norm listesinde görünmesin.
            // Ancak yükü Md. 22/6 düşümüyle sıfırlanan branş listede KALIR; aksi hâlde
            // branş sessizce kaybolur ve normun neden düştüğü görünmez.
            //
            // KADROSU OLAN BRANŞ DE KALIR (Dalga 3 / Y-13, kullanıcı kararı 21.09.2026):
            // gizleme yalnız "yük 0 VE kadro 0" içindir. Eskiden dersi kalmamış branşın
            // öğretmeni (ör. seçilmeyen Almanca, şube silinince Bilişim) MEVCUT toplamından
            // ve norm fazlası listesinden tamamen düşüyordu — oysa en kesin norm fazlası
            // odur. Gerçek bir okulda (15.09 yedeği) Müzik öğretmeni böyle kayboluyordu.
            if (totalHours <= 0 && !branchAdminDeduction[branchName] && currentTeachers <= 0) {
                return;
            }

            // NOT: Burada bir süre "yan dersler tek başına norm doğurmasın"
            // kuralı vardı; okulda o branştan öğretmen yoksa branşı listeden
            // gizliyordu (Sağlık Bilgisi -> Sağlık Hizmetleri, Trafik Güvenliği
            // -> Beden Eğitimi). Kullanıcı kararıyla KALDIRILDI (27.08.2026):
            //
            //   "Okulda norm olmayabilir, ama yönetici yanlış branş bile seçse
            //    o branş sağ panelde listelensin. Branş ne seçilirse seçilsin
            //    o liste okul idarecisinin sorumluluğundadır; biz bu konuda
            //    katı kurallar koymuyoruz."
            //
            // Gerekçe: uygulama karar verici değil, karar destek aracıdır.
            // Bir branşı listeden gizlemek, idarecinin kendi yaptığı atamayı
            // ekranda görememesi demektir. Ders yükü 0 olan branşların
            // gizlenmesi kuralı (yukarıda) yerinde duruyor; oradaki durum
            // farklıdır, çünkü o branşa hiç ders atanmamıştır.

            const normCalc = this.calculateBranchNorm(
                totalHours, schoolType, branchName, branchLoadSplit[branchName] || null
            );
            const calculatedNorm = normCalc.normCount;

            const diff = currentTeachers - calculatedNorm;
            let statusText = "Tam";
            let statusType = "tam";
            let statusBadge = "Tam";

            if (diff > 0) {
                statusText = `${diff} Fazlalık`;
                statusType = "fazla";
                statusBadge = `+${diff} Fazla`;
                totalSurplus += diff;
            } else if (diff < 0) {
                statusText = `${Math.abs(diff)} İhtiyaç`;
                statusType = "ihtiyac";
                statusBadge = `${diff} İhtiyaç`;
                totalNeeded += Math.abs(diff);
            }

            totalCalculatedNorm += calculatedNorm;
            totalCurrentTeachers += currentTeachers;

            branchReport.push({
                branchName,
                totalHours,
                calculatedNorm,
                currentTeachers,
                coordinatorHours: branchCoordinatorMap[branchName] || 0,
                seflikHours: branchSeflikMap[branchName] || 0,
                adminDeductedHours: branchAdminDeduction[branchName] || 0,
                diff,
                statusText,
                statusType,
                statusBadge,
                formulaExplanation: normCalc.formulaExplanation,
                // Madde 18 / Madde 19 kırılımı (raporlama ve denetlenebilirlik için)
                generalHours: normCalc.generalHours,
                workshopHours: normCalc.workshopHours,
                generalNorm: normCalc.generalNorm,
                workshopNorm: normCalc.workshopNorm,
                // Özel eğitim sınıflarından gelen alan dersi saati (ham çizelge / yüke yazılan)
                ozelEgitimSinifiHam: ozelAlan ? ozelAlan.ham : 0,
                ozelEgitimSinifiSaati: ozelAlan ? ozelAlan.yuk : 0,
                courses: branchCourseDetails[branchName] || []
            });
        });

        // Ders yükü yüksek olandan düşüğe göre sırala
        branchReport.sort((a, b) => b.totalHours - a.totalHours || b.calculatedNorm - a.calculatedNorm);

        let grandTotalHours = branchReport.reduce((s, b) => s + (b.totalHours || 0), 0);

        // ÇİZELGEDE OLUP HİÇBİR BRANŞA YAZILMAYAN SAATLER
        // -----------------------------------------------
        // Sınıf rehberliği saatleri branş yükü listesinde GÖRÜNMEZ (yukarıda
        // "Rehberlik" anahtarı listeden düşülüyor; rehber öğretmenin normu
        // ders saatinden değil öğrenci sayısından hesaplandığı için doğrusu
        // budur). Ama bu saatler ders çizelgesinde yer alır ve okulun toplam
        // ders yüküne dahildir.
        //
        // Eklenmediğinde şöyle görünüyordu: şubelerin rozetleri 33+34+20=87
        // saat gösterirken üstteki toplam 84 diyordu; aradaki 3 saat üç şubenin
        // rehberlik saatiydi ve nereye gittiği anlaşılmıyordu.
        // (Kullanıcı kararı, 27.08.2026: "rehberlik dersi herhangi bir branşa
        //  atanmasa bile, ders çizelgesinde olduğu için toplam okul norm
        //  yüküne eklensin.")
        //
        // Çift sayma olmaz: ders bir branşa atandığında "Rehberlik" anahtarının
        // yükü sıfırlanır, saat o branşın satırında zaten sayılır.
        const LISTEDEN_DUSULEN_BRANSLAR = [
            "Rehberlik",
            "Rehberlik ve Psikolojik Danışmanlık",
            "Rehberlik / Psikolojik Danışmanlık"
        ];
        let rehberlikBranssizSaat = 0;
        for (const ad of LISTEDEN_DUSULEN_BRANSLAR) {
            grandTotalHours += branchLoadMap[ad] || 0;
            rehberlikBranssizSaat += branchLoadMap[ad] || 0;
        }

        // Branşı atanmamış dersler de çizelgede yer alır; toplam yüke eklenir.
        grandTotalHours += branssizSaat;

        // DERS YÜKÜ MUTABAKATI — şube çizelgesi ile norma esas yük arasındaki köprü.
        //
        // Çarpan artışı ayrıca sayılmaz, artık olarak bulunur: motorun fiilen
        // yazdığı yük ile (ham çizelge − birleşik düşüm) arasındaki fark, ne
        // sebeple olursa olsun bölünme/grup çarpanından gelir. Böylece motora
        // yarın yeni bir çarpan eklenirse mutabakat kendiliğinden onu da
        // gösterir; unutulup sessizce kaybolmaz.
        const yoneticiDersDusumu = Object.values(branchAdminDeduction)
            .reduce((t, v) => t + (parseInt(v, 10) || 0), 0);
        const koordinatorlukEki = Object.values(branchCoordinatorMap)
            .reduce((t, v) => t + (parseInt(v, 10) || 0), 0);
        const seflikEki = Object.values(branchSeflikMap)
            .reduce((t, v) => t + (parseInt(v, 10) || 0), 0);
        // Çarpan artışı YALNIZCA genel branş havuzu için anlamlıdır; özel
        // eğitim saatleri o havuza hiç girmediği için taban toplamdan düşülür.
        const carpanArtisi = islenmisYuk
            - (hamCizelgeSaati - birlesikSubeDusumu - ozelEgitimSaati - mesemHaricSaati);

        const yukMutabakati = {
            hamCizelgeSaati,
            ozelEgitimSaati,
            mesemHaricSaati,
            carpanArtisi,
            birlesikSubeDusumu,
            yoneticiDersDusumu,
            koordinatorlukEki,
            seflikEki,
            normaEsasYuk: grandTotalHours,
            // Değişmez tutmuyorsa rapor sayı uydurmasın: bunu gören arayüz
            // mutabakat bloğunu basmaz, sessizce gizler.
            // mesemHaricSaati ÇIKARILIR: özel eğitim saatleri okulun toplam
            // yüküne dâhildir (yalnızca genel branş havuzuna girmez), ama
            // Md. 22/2 ile elenen saatler yüke HİÇ girmez — denklemde ayrı
            // durmaları bu yüzden.
            tutarli: (hamCizelgeSaati + carpanArtisi - birlesikSubeDusumu
                      - yoneticiDersDusumu + koordinatorlukEki + seflikEki
                      - mesemHaricSaati) === grandTotalHours
        };
        let totalStudents = subeler.reduce((sum, s) => sum + (parseInt(s.ogrenciSayisi, 10) || 0), 0);

        // Yönetici / İdareci Norm Kadro Hesabı (Madde 5 - 14)
        const adminNorms = this.calculateAdminNorms(schoolType, totalStudents, coordinatorHoursMap?.adminOptions || {});

        // Okul rehberlik servisi (rehber öğretmen) normu — Madde 21/2, 21/3
        const guidanceNorms = this.calculateGuidanceCounselorNorm(
            schoolType, totalStudents, coordinatorHoursMap?.adminOptions || {}
        );

        return {
            branchReport,
            totalHours: grandTotalHours,
            // Toplama dâhil ama branş satırlarında görünmeyen saatler (Dalga 3 Y-05):
            // panel "satırlar toplamı ≠ toplam yük" farkını bunlarla açıklar.
            rehberlikBranssizSaat,
            branssizSaat,
            ozelEgitimUyarilari,
            ozelEgitimBirlesikSiniflar,
            yukMutabakati,
            totalCalculatedNorm,
            totalCurrentTeachers,
            totalSurplus,
            totalNeeded,
            totalStudents,
            adminNorms,
            guidanceNorms
        };
    }

    /**
     * MEB Norm Kadro Yönetmeliği (2014/6459) İkinci Bölüm (Madde 5 - 14)
     * Tüm Okul Türleri İçin Yönetici / İdareci Norm Kadro Hesabı
     * @param {string} schoolType - Okul türü
     * @param {number} totalStudents - Toplam öğrenci/çırak sayısı
     * @param {Object} options - { isPansiyonlu, hasDonerSermaye, isTamGunTamYil, hasStajyer100Plus, hasSigortali500Plus, isBirlestirilmis }
     * @returns {Object} Detaylı yönetici norm raporu
     */
    /**
     * Kurum YATILI/PANSİYONLU mu? (müdür yardımcısı ve rehber öğretmen için)
     *
     * 05.09.2026'da tek kutu ikiye ayrıldı:
     *   isPansiyonluMdrYrd  -> Md. 14/1-a (+1 müdür yardımcısı) ve
     *                          Md. 21/2-ç (rehber öğretmen). Kurumun yatılı
     *                          OLMASINDAN doğar; her zaman geçerlidir.
     *   isPansiyonluBasyrd  -> Md. 6/1-a (müdür başyardımcısı). Yalnızca
     *                          görevi süren bir başyardımcı VARSA işaretlenir.
     *
     * Sebep (kullanıcı bildirimi): bazı yatılı kurumlarda görev süresi biten
     * müdür başyardımcıları ayrıldı, ama kurum yatılı olduğu için +1 müdür
     * yardımcısı hakkı sürüyor. Tek kutu ikisini birbirine bağlıyordu.
     *
     * GERİYE DÖNÜK UYUM: eski kayıtlarda yalnızca `isPansiyonlu` var. O
     * kayıtlar müdür yardımcısı/rehber tarafında AYNEN devam etsin diye
     * buraya düşürülür. Başyardımcı tarafına düşürülmez: ünvan zaten kapalı
     * olduğu için bugün 0 üretiyor, düşürseydik mevcut okullara sessizce
     * +1 norm eklenirdi.
     */
    _pansiyonMdrYrd(options) {
        if (!options) return false;
        if (options.isPansiyonluMdrYrd !== undefined) return !!options.isPansiyonluMdrYrd;
        return !!options.isPansiyonlu;   // eski kayıt
    }

    calculateAdminNorms(schoolType = "", totalStudents = 0, options = {}) {
        const sType = String(schoolType || "").toLowerCase();
        const isMesem = sType.includes("mesleki_egitim_merkezi") || sType.includes("mesem");
        const isAnaokulu = sType.includes("anaokulu") || sType.includes("okul_oncesi");
        const isIlkokul = sType.includes("ilkokul");
        const isOzelEgitim = sType.includes("ozel_egitim");
        const isBirlestirilmis = !!options.isBirlestirilmis;
        const isKampusIcinde = !!options.isKampusIcinde;
        // Ayni binada baska bir egitim kurumu var VE ogrenci sayisi en fazla olan
        // bu okul DEGIL. Md. 5/3 mudur normunu yalnizca en kalabalik olana verir.
        const isAyniBinadaKucuk = !!options.isAyniBinadaKucuk;

        // Md. 22/1-b: mudur yardimcisi normuna esas ogrenci sayisina, okula
        // kayitli ana sinifi / uygulama sinifi / alt ozel egitim sinifi
        // ogrencileri de DAHIL edilir. Bu ogrenciler subelerde ayri girilmedigi
        // icin ayrica alinir; girilmezse norm oldugundan dusuk cikar.
        const ekOgrenci = Math.max(0, parseInt(options.ekSinifOgrencileri, 10) || 0);
        const count = (parseInt(totalStudents, 10) || 0) + ekOgrenci;
        const explanations = [];

        if (ekOgrenci > 0) {
            explanations.push(`Öğrenci sayısına ana sınıfı/uygulama sınıfı/alt özel eğitim sınıfı öğrencileri dâhil edildi: +${ekOgrenci} (Md. 22/1-b). Norma esas toplam: ${count}.`);
        }

        // 1. Müdür Normu (Madde 5)
        let mudurNorm = 1;
        if (isBirlestirilmis) {
            mudurNorm = 0;
            explanations.push("Birleştirilmiş sınıf uygulaması yapılıyor: Müdür normu verilmez (Müdür Yetkili Öğretmen görevlendirilir - Md. 5/1 & Md. 22/5).");
        } else if (isKampusIcinde) {
            mudurNorm = 0;
            explanations.push("Eğitim kampüsü içindeki kurum: Müdür normu kampüsün tamamına verilir, kuruma ayrıca verilmez (Md. 5/5).");
        } else if (isAyniBinadaKucuk) {
            mudurNorm = 0;
            explanations.push("Aynı binada faaliyet gösteren kurumlardan öğrenci sayısı en fazla olan bu okul değil: Müdür normu verilmez (Md. 5/3).");
        } else {
            explanations.push("Bağımsız eğitim kurumu: 1 Müdür norm kadrosu (Md. 5/1).");
        }

        // 2. Temel Müdür Yardımcısı Normu (Öğrenci Sayısına Göre - Md. 7-12)
        let baseMdrYrd = 0;
        let baseNote = "";

        if (isAnaokulu) {
            if (count >= 501) { baseMdrYrd = 2; baseNote = "501+ öğrenci: 2 Mdr. Yrd. (Md. 7/1-b)"; }
            else if (count >= 100) { baseMdrYrd = 1; baseNote = "100-500 öğrenci: 1 Mdr. Yrd. (Md. 7/1-a)"; }
            else { baseMdrYrd = 0; baseNote = "100 öğrenci altı: Mdr. Yrd. normu verilmez (Md. 7/1)"; }
        } else if (isIlkokul) {
            if (count >= 2401) { baseMdrYrd = 5; baseNote = "2401+ öğrenci: 5 Mdr. Yrd. (Md. 8/1-d)"; }
            else if (count >= 1801) { baseMdrYrd = 4; baseNote = "1801-2400 öğrenci: 4 Mdr. Yrd. (Md. 8/1-ç)"; }
            else if (count >= 1201) { baseMdrYrd = 3; baseNote = "1201-1800 öğrenci: 3 Mdr. Yrd. (Md. 8/1-c)"; }
            else if (count >= 601) { baseMdrYrd = 2; baseNote = "601-1200 öğrenci: 2 Mdr. Yrd. (Md. 8/1-b)"; }
            else if (count >= 100) { baseMdrYrd = 1; baseNote = "100-600 öğrenci: 1 Mdr. Yrd. (Md. 8/1-a)"; }
            else { baseMdrYrd = 0; baseNote = "100 öğrenci altı: Mdr. Yrd. normu verilmez (Md. 8/1)"; }
        } else if (isMesem) {
            if (count >= 1201) { baseMdrYrd = 4; baseNote = "1201+ çırak: 4 Mdr. Yrd. (Md. 12/1-ç)"; }
            else if (count >= 801) { baseMdrYrd = 3; baseNote = "801-1200 çırak: 3 Mdr. Yrd. (Md. 12/1-c)"; }
            else if (count >= 401) { baseMdrYrd = 2; baseNote = "401-800 çırak: 2 Mdr. Yrd. (Md. 12/1-b)"; }
            else { baseMdrYrd = 1; baseNote = "400 çırağa kadar: 1 Mdr. Yrd. (Md. 12/1-a)"; }
        } else if (isOzelEgitim) {
            if (count <= 50) { baseMdrYrd = 1; baseNote = "50 öğrenciye kadar: 1 Mdr. Yrd. (Md. 11/1-a)"; }
            else if (count <= 125) { baseMdrYrd = 2; baseNote = "51-125 öğrenci: 2 Mdr. Yrd. (Md. 11/1-b)"; }
            else {
                baseMdrYrd = 2 + Math.floor((count - 125) / 150);
                baseNote = `126+ öğrenci: 2 + her 150 öğrenciye 1 = ${baseMdrYrd} Mdr. Yrd. (Md. 11/1-c)`;
            }
        } else {
            // Ortaokul, İmam Hatip Ortaokulu ve Tüm Liseler (OGM, DÖGM, MTAL) - Md. 9 & Md. 10
            if (count >= 2001) { baseMdrYrd = 5; baseNote = "2001+ öğrenci: 5 Mdr. Yrd. (Md. 9/1-d & Md. 10/1-d)"; }
            else if (count >= 1501) { baseMdrYrd = 4; baseNote = "1501-2000 öğrenci: 4 Mdr. Yrd. (Md. 9/1-ç & Md. 10/1-ç)"; }
            else if (count >= 1001) { baseMdrYrd = 3; baseNote = "1001-1500 öğrenci: 3 Mdr. Yrd. (Md. 9/1-c & Md. 10/1-c)"; }
            else if (count >= 501) { baseMdrYrd = 2; baseNote = "501-1000 öğrenci: 2 Mdr. Yrd. (Md. 9/1-b & Md. 10/1-b)"; }
            else { baseMdrYrd = 1; baseNote = "500 öğrenciye kadar: 1 Mdr. Yrd. (Md. 9/1-a & Md. 10/1-a)"; }
        }

        explanations.push(`Temel Müdür Yardımcısı Normu: ${baseMdrYrd} (${baseNote})`);

        // 3. İlave Müdür Yardımcısı Normları (Madde 14)
        let extraMdrYrd = 0;
        const extraDetails = [];

        if (this._pansiyonMdrYrd(options)) {
            extraMdrYrd += 1;
            extraDetails.push("Yatılı/Pansiyonlu Kurum (+1 Md. 14/1-a)");
        }
        if (options.hasDonerSermaye) {
            extraMdrYrd += 1;
            extraDetails.push("Döner Sermaye İşletmesi (+1 Md. 14/1-b)");
        }
        if (options.isTamGunTamYil) {
            extraMdrYrd += 1;
            extraDetails.push("Tam Gün Tam Yıl / Açık Öğretim Yüzyüze (+1 Md. 14/1-c)");
        }
        if (options.hasStajyer100Plus) {
            extraMdrYrd += 1;
            extraDetails.push("3308 Kapsamında 100+ İşletme Stajyeri (+1 Md. 14/1-ç)");
        }
        if (options.hasSigortali500Plus) {
            extraMdrYrd += 1;
            extraDetails.push("3308 Md. 25 Kapsamında 500+ Sigortalı Çırak (+1 Md. 14/1-d)");
        }
        // Md. 14/1-e (taşıma eğitim merkezi) UYGULANMIYOR — kullanıcı kararı,
        // 15.09.2026 (Denetim N-01). Eski kutu, öğrenci sayısıyla zaten müdür
        // yardımcısı alan okula da +1 ekliyordu; bent yalnızca öğrenci sayısına
        // göre norm çıkmayan kuruma uygulanır. Kutu arayüzden kaldırıldı; eski
        // kayıtlarda kalan isTasimaMerkezi alanı yok sayılır.
        if (isKampusIcinde) {
            extraMdrYrd += 1;
            extraDetails.push("Eğitim Kampüsü İçindeki Kurum (+1 Md. 14/1-f)");
        }

        let totalMdrYrd = baseMdrYrd + extraMdrYrd;

        // 4. Azami Tavan Sınırı Kontrolü (Madde 14/2)
        const maxLimit = count < 1500 ? 6 : 7;
        if (totalMdrYrd > maxLimit) {
            explanations.push(`İlave normlarla hesaplanan ${totalMdrYrd} Mdr. Yrd., yasal üst tavan sınırına (${maxLimit}) çekildi (Md. 14/2).`);
            totalMdrYrd = maxLimit;
        }

        if (extraDetails.length > 0) {
            explanations.push(`İlave Müdür Yardımcısı Hakları: +${extraMdrYrd} [${extraDetails.join(', ')}]`);
        }

        // 5. Md. 22/1-a: "Mudur norm kadrosu verilme sartlarini tasimayan hicbir
        //    egitim kurumuna mudur yardimcisi normu verilmez."
        //
        // Egitim kampusu bu kuralin ISTISNASIDIR: Md. 5/5 kampus icindeki kuruma
        // mudur normu vermez, ama Md. 22/7 her kurumun mudur yardimcisi normunun
        // "birbirinden bagimsiz olarak" belirlenecegini ACIKCA soyler. Sonraki ve
        // ozel hukum oldugu icin kampuste kapi uygulanmaz.
        if (mudurNorm === 0 && !isKampusIcinde) {
            if (totalMdrYrd > 0) {
                explanations.push(`Müdür normu verilmeyen kuruma müdür yardımcısı normu da verilmez; hesaplanan ${totalMdrYrd} norm sıfırlandı (Md. 22/1-a).`);
            }
            baseMdrYrd = 0;
            extraMdrYrd = 0;
            totalMdrYrd = 0;
        }

        // 6. Müdür Başyardımcısı Normu (Madde 6)
        //
        // ⚠️ ÜNVAN KAPATILDI — 2026-08-26, kullanıcı kararı.
        //
        // OLGULAR (doğrulandı, yorum değil):
        //   · Norm Kadro Yönetmeliği'nin GÜNCEL resmî metninde (son değişiklik
        //     18/8/2022, C.K. 5975) Madde 6 "Müdür başyardımcısı norm kadrosu"
        //     hâlâ yürürlüktedir; Madde 4/m'deki "yönetici" tanımı da ünvanı sayar.
        //     Doğrulama: python -X utf8 tools/denetim_mevzuat_guncel.py
        //   · 7528 sayılı Öğretmenlik Mesleği Kanunu'nda (10/10/2024) "müdür
        //     başyardımcısı" ifadesi HİÇ GEÇMEZ. Kanun "yönetici" kelimesini
        //     45 kez kullanır ama ünvanları tek tek saymaz.
        //
        // KARAR: Kullanıcı (okul idarecisi), kanunun yönetmelikten üstün olduğu
        // ve ünvanın fiilen kaldırıldığı değerlendirmesiyle hesabın kapatılmasını
        // istedi. Bu hukuki bir değerlendirmedir; koda olgu olarak değil, KARAR
        // olarak işlenmiştir.
        //
        // KURAL SİLİNMEDİ, KAPATILDI: aşağıdaki Madde 6 mantığı olduğu gibi
        // duruyor ve testleri hâlâ çalışıyor. Ünvan geri gelirse ya da bu
        // değerlendirme değişirse, tek yapılacak şey bayrağı true'ya çevirmektir:
        //     normEngine.mudurBasyardimcisiUnvaniYururlukte = true;
        const basyrdAktif = this.mudurBasyardimcisiUnvaniYururlukte !== false;

        // YATILI/PANSİYONLU KURUMLARDA ELLE GİRİŞ — GEÇİŞ HÜKMÜ
        //
        // Ünvan genel olarak kapalı (yukarıdaki gerekçe). Ancak görev süresi
        // bitene kadar okulda çalışmaya devam eden müdür başyardımcıları var
        // ve bunlar YALNIZCA yatılı/pansiyonlu kurumlarda bulunuyor. Bu
        // durumdaki okullar normu elle ekleyebilsin diye ayrı bir seçenek
        // konuldu; işaretlenmemişse hiçbir şey değişmez.
        // (Kullanıcı kararı, 05.09.2026.)
        //
        // Seçenek, ünvanın genel olarak kapalı olmasından BAĞIMSIZ çalışır:
        // genel kapatma varsayılandır, bu kutu ise okulun bildirdiği fiilî
        // durumdur.
        // 16.09.2026 (Y6): norm artık KURUMUN YATILI OLMASINDAN doğuyor; "görevi süren
        // başyardımcı var" kutusu norm üretmiyor, yalnız mevcut kadro sütununu açıyor.
        // Eski kayıtlarda yalnız bu kutu işaretli olabilir; o kayıtlar da yatılı sayılır.
        const pansiyonlu = this._pansiyonMdrYrd(options) || !!options.isPansiyonluBasyrd;

        let mudurBasYrd = 0;
        if (!basyrdAktif) {
            // Ünvan kapalı: norm üretilmez, açıklama da yazılmaz (raporda
            // hiç görünmemesi isteniyor).
        } else if (isKampusIcinde) {
            explanations.push("Eğitim kampüsü içindeki kuruma müdür başyardımcısı normu verilmez (Md. 6/2).");
        } else if (mudurNorm === 0) {
            explanations.push("Müdür normu verilmeyen kuruma müdür başyardımcısı normu da verilmez (Md. 22/1-a).");
        } else if (pansiyonlu) {
            mudurBasYrd = 1;
            explanations.push("Yatılı/Pansiyonlu Kurum: 1 Müdür Başyardımcısı normu (Md. 6/1-a).");
        } else if (totalMdrYrd >= 6) {
            // Md. 6/1-b metni "mudur yardimcisi sayisi ALTI olan" der. 2022'de tavan
            // 1500+ okullarda 7'ye cikinca 7 mdr. yrd. olan okul lafzen kapsam disi
            // kalir. Amaca uygun yorum tercih edildi: 6 hak ediyorsa 7 de eder.
            mudurBasYrd = 1;
            explanations.push(`Müdür Yardımcısı sayısı ${totalMdrYrd} (6 ve üzeri): 1 Müdür Başyardımcısı normu (Md. 6/1-b).`);
        }

        const grandTotal = mudurNorm + mudurBasYrd + totalMdrYrd;

        // 7. Mevcut kadro ile karsilastirma (ogretmenlerde zaten yapiliyor).
        const mevcut = options.mevcutIdareciler || {};
        const mevcutMudur = Math.max(0, parseInt(mevcut.mudur, 10) || 0);
        const mevcutBasyrd = Math.max(0, parseInt(mevcut.mudurBasyardimcisi, 10) || 0);
        const mevcutMdrYrd = Math.max(0, parseInt(mevcut.mudurYardimcisi, 10) || 0);
        const mevcutToplam = mevcutMudur + mevcutBasyrd + mevcutMdrYrd;

        const kiyas = (norm, adet) => {
            const fark = adet - norm;
            return {
                norm, mevcut: adet, fark,
                durum: fark === 0 ? "tam" : (fark > 0 ? "fazla" : "ihtiyac"),
                etiket: fark === 0 ? "Tam" : (fark > 0 ? `${fark} Fazla` : `${Math.abs(fark)} İhtiyaç`)
            };
        };

        return {
            mudur: mudurNorm,
            mudurBasyardimcisi: mudurBasYrd,
            // Arayüz ve raporlar bu bayrağa bakarak başyardımcı satırını gizler.
            //
            // Ünvan genel olarak kapalı olsa da, yatılı/pansiyonlu kurum
            // "görevi süren başyardımcım var" dediyse satır GERİ GELMELİ:
            // aksi hâlde norm üretiliyor ama arayüzde ve raporda hiçbir
            // yerde görünmüyordu. (Kullanıcı bildirimi, 05.09.2026.)
            mudurBasyardimcisiAktif: basyrdAktif || pansiyonlu,
            mudurYardimcisiBase: baseMdrYrd,
            mudurYardimcisiExtra: extraMdrYrd,
            mudurYardimcisiTotal: totalMdrYrd,
            toplamYonetici: grandTotal,
            normaEsasOgrenciSayisi: count,
            karsilastirma: {
                mudur: kiyas(mudurNorm, mevcutMudur),
                mudurBasyardimcisi: kiyas(mudurBasYrd, mevcutBasyrd),
                mudurYardimcisi: kiyas(totalMdrYrd, mevcutMdrYrd),
                toplam: kiyas(grandTotal, mevcutToplam)
            },
            explanations: explanations
        };
    }

    /**
     * MEB Norm Kadro Yönetmeliği Madde 21/2 ve 21/3
     * Okul rehberlik servisi (rehber öğretmen / psikolojik danışman) norm kadrosu.
     *
     * Bu norm DERS YÜKÜNDEN DEĞİL, öğrenci sayısından hesaplanır. Sınıf rehberlik
     * dersinin (1 saat) yüküyle ilgisi yoktur; o saat hangi branşa verilirse o
     * branşın Md.18 yüküne yazılır ve bu hesabı etkilemez.
     *
     * @param {string} schoolType
     * @param {number} totalStudents - Şubelerden gelen toplam öğrenci/çırak sayısı
     * @param {Object} options - { isPansiyonlu, isIlceEnKalabalikKurum, mevcutRehberOgretmeni }
     */
    calculateGuidanceCounselorNorm(schoolType = "", totalStudents = 0, options = {}) {
        const cfg = this.rules.guidanceCounselorRules;
        const sType = String(schoolType || "").toLowerCase();

        // Sıralama önemli: "ozel_egitim_meslek_okulu" hem ozel_egitim hem meslek içerir.
        const isOzelEgitim = sType.includes("ozel_egitim");
        const isMesem = !isOzelEgitim && (sType.includes("mesleki_egitim_merkezi") || sType.includes("mesem"));
        const isIlkokul = !isOzelEgitim && sType.includes("ilkokul");
        const isOrtaokul = !isOzelEgitim && sType.includes("ortaokul");
        const isAnaokulu = !isOzelEgitim && (sType.includes("anaokulu") || sType.includes("okul_oncesi"));

        let esik, esikMadde, kurumEtiketi;
        if (isOzelEgitim) {
            esik = cfg.firstNormThresholds.ozelEgitim; esikMadde = "Md. 21/2-a"; kurumEtiketi = "özel eğitim kurumu";
        } else if (isMesem) {
            esik = cfg.firstNormThresholds.mesem; esikMadde = "Md. 21/2-e"; kurumEtiketi = "meslekî eğitim merkezi";
        } else if (isIlkokul) {
            esik = cfg.firstNormThresholds.ilkokul; esikMadde = "Md. 21/2-b"; kurumEtiketi = "ilkokul";
        } else if (isOrtaokul) {
            esik = cfg.firstNormThresholds.ortaokul; esikMadde = "Md. 21/2-b"; kurumEtiketi = "ortaokul / imam hatip ortaokulu";
        } else if (isAnaokulu) {
            esik = cfg.firstNormThresholds.anaokulu; esikMadde = "Md. 21/2-b"; kurumEtiketi = "anaokulu";
        } else {
            esik = cfg.firstNormThresholds.ortaogretim; esikMadde = "Md. 21/2-c"; kurumEtiketi = "ortaöğretim kurumu";
        }

        const count = Math.max(0, parseInt(totalStudents, 10) || 0);
        const sayimBirimi = isMesem ? "çırak/kursiyer" : "öğrenci";
        const explanations = [];

        // Md. 22/1-b (ana sınıfı / uygulama sınıfı / alt özel eğitim sınıfı öğrencilerinin
        // eklenmesi) YALNIZCA müdür yardımcısı normu için yazılmıştır. Madde 21'de böyle
        // bir hüküm yok; bu yüzden buraya eklenmiyor.
        let ilkNorm = 0;
        if (this._pansiyonMdrYrd(options)) {
            ilkNorm = 1;
            explanations.push("Yatılı/pansiyonlu eğitim kurumu: öğrenci sayısına bakılmaksızın 1 rehber öğretmen normu (Md. 21/2-ç).");
        } else if (count >= esik) {
            ilkNorm = 1;
            explanations.push(`${count} ${sayimBirimi} (${esik} ve daha fazlası): 1 rehber öğretmen normu — ${kurumEtiketi} (${esikMadde}).`);
        } else if (options.isIlceEnKalabalikKurum) {
            ilkNorm = 1;
            explanations.push(`Öğrenci sayısı ${esik} eşiğinin altında (${count}) ancak ilçe merkezinde norm verilebilen kurum bulunmadığı için en kalabalık kurum olarak 1 norm verildi (Md. 21/2-d).`);
        } else {
            explanations.push(`${count} ${sayimBirimi}, ${esikMadde} eşiği olan ${esik} sayısının altında: rehber öğretmen normu verilmez.`);
        }

        // Md. 21/3 — ilave normlar
        const aralik = isOzelEgitim ? cfg.subsequentInterval.ozelEgitim : cfg.subsequentInterval.diger;
        let ilaveNorm = 0;
        if (ilkNorm > 0) {
            ilaveNorm = Math.floor(count / aralik);
            if (ilaveNorm > 0) {
                explanations.push(`${sayimBirimi} sayısı ${aralik} ve katlarına ulaştıkça her defasında +1: ${count} / ${aralik} = ${ilaveNorm} ilave norm (Md. 21/3).`);
            }
        }

        const toplamNorm = ilkNorm + ilaveNorm;

        if (toplamNorm >= 2 && !isOzelEgitim) {
            explanations.push(cfg.atamaKisiti);
        }

        const mevcut = Math.max(0, parseInt(options.mevcutRehberOgretmeni, 10) || 0);
        const fark = mevcut - toplamNorm;

        return {
            norm: toplamNorm,
            ilkNorm,
            ilaveNorm,
            esik,
            esikMadde,
            aralik,
            normaEsasOgrenciSayisi: count,
            karsilastirma: {
                norm: toplamNorm,
                mevcut,
                fark,
                durum: fark === 0 ? "tam" : (fark > 0 ? "fazla" : "ihtiyac"),
                etiket: fark === 0 ? "Tam" : (fark > 0 ? `${fark} Fazla` : `${Math.abs(fark)} İhtiyaç`)
            },
            explanations
        };
    }
}

export const normEngine = new NormEngine();


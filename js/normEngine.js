// MEB Norm Kadro - Norm ve Ders Yükü Hesaplama Motoru (normEngine.js)
//
// TÜM BAREMLER normRulesConfig.js DOSYASINDAN OKUNUR.
// Bu dosyaya sabit sayı yazmayın; yönetmelik değişikliği config'ten yapılır.
import { NORM_RULES_CONFIG } from './normRulesConfig.js';

export class NormEngine {
    // Müdür başyardımcısı ünvanı yürürlükte mi? Ayrıntılı gerekçe
    // calculateAdminNorms() içinde, Madde 6 bölümünün başındadır.
    // false  -> norm üretilmez, arayüz ve raporlarda hiç görünmez
    // true   -> Madde 6 kuralı aynen işler (kural silinmedi, kapatıldı)
    mudurBasyardimcisiUnvaniYururlukte = false;

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
        if (cfg.inclusion.enabled && inclusion >= cfg.inclusion.minStudentsPerSplit) {
            const splittableGroups = Math.min(
                groups,
                Math.floor(inclusion / cfg.inclusion.minStudentsPerSplit)
            );
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

        if ((cfg.courseNamePatterns || []).some(matches)) return true;

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
            return {
                groupCount: secim,
                calculatedLoad: baseHours * secim,
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

        // 1. Güzel Sanatlar Bire Bir Çalgı Eğitimi (1 Öğretmen / 1 Öğrenci - Madde 22/4-a)
        if (matchesCourse("BİREYSEL ÇALGI") || matchesCourse("BIREYSEL CALGI") || matchesCourse("ÇALGI EĞİTİMİ") || matchesCourse("CALGI EGITIMI")) {
            const count = Math.max(1, parseInt(studentCount, 10) || 1);
            const load = baseHours * count;
            return {
                groupCount: count,
                calculatedLoad: load,
                note: `Bireysel Çalgı (1'e 1 - Md. 22/4-a): ${count} öğrenci x ${baseHours} saat = ${load}s yük`,
                loadCategory
            };
        }

        // 2. Güzel Sanatlar Ses Eğitimi (2'şer Kişilik Grup)
        if (matchesCourse("SES EĞİTİMİ") || matchesCourse("SES EGITIMI")) {
            const groups = Math.max(1, Math.ceil(studentCount / 2));
            return {
                groupCount: groups,
                calculatedLoad: baseHours * groups,
                note: `Ses Eğitimi (2'li Grup): ${groups} grup x ${baseHours} saat = ${baseHours * groups}s yük`,
                loadCategory
            };
        }

        // 3. Anadolu İmam Hatip Lisesi Kur'an-ı Kerim 25+ Kuralı
        if ((matchesCourse("KUR'AN") || matchesCourse("KURAN")) && !matchesCourse("ANLAM")) {
            if (studentCount > 25) {
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
     * ile hesaplamak normu yaklaşık iki katına çıkarır (önceki sürümün hatası).
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
        const handledMergedPairs = new Set();
        const branchesWithGrade12Vocational = new Set();

        // Branşı atanmamış derslerin saati. Hiçbir branşın normuna yazılmaz
        // ama okulun toplam ders yüküne dâhildir (aşağıda eklenir).
        let branssizSaat = 0;

        const ensureBranch = (name) => {
            if (!branchLoadMap[name]) {
                branchLoadMap[name] = 0;
                branchCourseDetails[name] = [];
            }
            if (!branchLoadSplit[name]) {
                branchLoadSplit[name] = { genel: 0, atolye: 0 };
            }
        };

        subeler.forEach(sec => {
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
            const studentCount = sec.ogrenciSayisi || 30;

            allCourses.forEach(course => {
                const cName = course.ders || course.ders_adi;
                let assignedBranch = (course.atananBrans !== undefined && course.atananBrans !== null && course.atananBrans !== "") ? course.atananBrans : (course.varsayilanBrans || cName);

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
                        course, studentCount, schoolType, gradeLevel, inclusionCount);
                    branssizSaat += m.calculatedLoad || 0;
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

                if (isGrade12 && (course.isAtolye || course.isElectiveVocational || String(course.kategori || '').includes('MESLEK') || String(cName).includes('İŞLETME') || String(cName).includes('STAJ'))) {
                    branchesWithGrade12Vocational.add(assignedBranch);
                }

                // Sınıf Birleştirme Kontrolü
                const mergedWith = course.birlesikSubeler || [];
                if (mergedWith.length > 0) {
                    const groupKey = [sec.id, ...mergedWith].sort().join("___") + "::" + cName;
                    if (handledMergedPairs.has(groupKey)) {
                        return;
                    }
                    handledMergedPairs.add(groupKey);
                }

                // Grup / Çalgı / Atölye Katsayısı Hesabı (sınıf seviyesi Md. 22/1-ç için şart)
                const mult = this.evaluateCourseMultiplier(course, studentCount, schoolType, gradeLevel, inclusionCount);
                const load = mult.calculatedLoad;

                ensureBranch(assignedBranch);

                branchLoadMap[assignedBranch] += load;
                // Yükü doğru maddeye yaz: ATOLYE -> Madde 19, GENEL -> Madde 18
                if (mult.loadCategory === "ATOLYE") {
                    branchLoadSplit[assignedBranch].atolye += load;
                } else {
                    branchLoadSplit[assignedBranch].genel += load;
                }

                branchCourseDetails[assignedBranch].push({
                    sectionName: sec.subeAdi,
                    courseName: cName,
                    baseHours: course.saat || course.ders_saati || 0,
                    calculatedLoad: load,
                    note: mult.note,
                    loadCategory: mult.loadCategory
                });
            });
        });

        // İşletmelerde Mesleki Eğitim / Koordinatörlük Yüklerinin İlavesi
        // Dayanak: MEB Norm Kadro Yönetmeliği Madde 22/2-3 (MESEM) ve OÖKY Md. 88 / Ek Ders Kararı Md. 15 (MTAL)
        const isVocationalSchool = String(schoolType).includes("meslek") || String(schoolType).includes("teknik") || String(schoolType).includes("mtegm") || subeler.some(s => s.alanId);
        const isMesem = String(schoolType).includes("mesleki_egitim_merkezi") || String(schoolType).includes("mesem");

        // MESEM İçin Alan Bazlı Toplam Çırak Sayılarının Hesaplanması
        const mesemBranchStudentCounts = {};
        if (isMesem) {
            subeler.forEach(sec => {
                const sCount = parseInt(sec.ogrenciSayisi, 10) || 0;
                const allCourses = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
                const vocCourses = allCourses.filter(c => c.isAtolye || String(c.kategori || '').includes('MESLEK') || String(c.ders || '').includes('İŞLETME'));
                const assignedBranches = new Set(vocCourses.map(c => c.atananBrans).filter(Boolean));
                
                assignedBranches.forEach(bName => {
                    mesemBranchStudentCounts[bName] = (mesemBranchStudentCounts[bName] || 0) + sCount;
                });
            });
        }

        const allVocationalOrCustomCoordinatorBranches = isVocationalSchool ? new Set([
            ...branchesWithGrade12Vocational,
            ...Object.keys(mesemBranchStudentCounts),
            ...Object.keys(coordinatorHoursMap || {})
        ]) : new Set();

        const branchCoordinatorMap = {};

        allVocationalOrCustomCoordinatorBranches.forEach(branchName => {
            let coordHours = 0;
            let coordNote = "";

            if (coordinatorHoursMap && coordinatorHoursMap[branchName] !== undefined) {
                coordHours = parseInt(coordinatorHoursMap[branchName], 10) || 0;
                coordNote = isMesem ? "MESEM İşletmelerde Meslek Eğitimi (Kullanıcı Tanımlı)" : "İşletmelerde Mesleki Eğitim Koordinatörlüğü (Kullanıcı Tanımlı)";
            } else if (isMesem && mesemBranchStudentCounts[branchName] !== undefined) {
                // MESEM Madde 22/2 Formülü: Toplam Çırak Sayısı ➔ Grup Baremi x 32 Saat
                const totalCirak = mesemBranchStudentCounts[branchName];
                const groups = this.calculateMesemApprenticeGroups(totalCirak);
                coordHours = groups * 32;
                coordNote = `MEB Norm Kadro Yön. Md. 22/2: ${totalCirak} çırak ➔ ${groups} grup x 32s = ${coordHours}s İşletmelerde Mesleki Eğitim Yükü`;
            } else if (branchesWithGrade12Vocational.has(branchName)) {
                // Varsayılan MEB MTAL önerisi: 10 Saat
                coordHours = 10;
                coordNote = "MEB OÖKY Md. 88 / Ek Ders Kararı Md. 15 (12. Sınıf İşletme Koordinatörlüğü)";
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

        // Özel Eğitim Sınıfları Kontrolü (MEB Norm Kadro Yön. Md. 17/1-c Kuralı: 1 Şube = 2 Norm)
        const specialEduSections = subeler.filter(s => s.isSpecialEdu || (s.subeAdi && s.subeAdi.includes("Özel Eğt")) || (s.dalAdi && s.dalAdi.includes("Özel Eğit")));
        const specialEduSectionCount = specialEduSections.length;
        
        if (specialEduSectionCount > 0) {
            allBranchesSet.delete("Özel Eğitim");
            const specialEduNorm = specialEduSectionCount * 2;
            const specialEduHours = specialEduSections.reduce((sum, s) => {
                const h = [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])].reduce((dsum, d) => dsum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
                return sum + (h > 0 ? h : 30);
            }, 0);
            
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
                totalHours: specialEduHours,
                calculatedNorm: specialEduNorm,
                currentTeachers: currentTeachers,
                coordinatorHours: 0,
                diff: diff,
                statusText: statusText,
                statusType: statusType,
                statusBadge: statusBadge,
                formulaExplanation: `MEB Norm Kadro Yön. Md. 17/1-c: Her özel eğitim sınıfı için 2 Norm Kadro (${specialEduSectionCount} Şube x 2 = ${specialEduNorm} Norm)`,
                courses: branchCourseDetails["Özel Eğitim"] || [],
                isSpecialEdu: true
            });
        }

        allBranchesSet.forEach(branchName => {
            const totalHours = branchLoadMap[branchName] || 0;
            const currentTeachers = parseInt(existingTeachers[branchName] || 0, 10);

            // Kullanıcı Talimatı: Ders yükü 0 olan branşlar sağ panel norm listesinde görünmesin.
            // Ancak yükü Md. 22/6 düşümüyle sıfırlanan branş listede KALIR; aksi hâlde
            // branş sessizce kaybolur ve normun neden düştüğü görünmez.
            if (totalHours <= 0 && !branchAdminDeduction[branchName]) {
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
        for (const ad of LISTEDEN_DUSULEN_BRANSLAR) {
            grandTotalHours += branchLoadMap[ad] || 0;
        }

        // Branşı atanmamış dersler de çizelgede yer alır; toplam yüke eklenir.
        grandTotalHours += branssizSaat;
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
     * @param {Object} options - { isPansiyonlu, hasDonerSermaye, isTamGunTamYil, hasStajyer100Plus, hasSigortali500Plus, isTasimaMerkezi, isBirlestirilmis }
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
        if (options.isTasimaMerkezi) {
            extraMdrYrd += 1;
            extraDetails.push("Taşıma Eğitim Merkezi (+1 Md. 14/1-e)");
        }
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
        const pansiyonBasyrd = !!options.isPansiyonluBasyrd;

        let mudurBasYrd = 0;
        if (pansiyonBasyrd && !isKampusIcinde && mudurNorm > 0) {
            mudurBasYrd = 1;
            explanations.push(
                "Yatılı/Pansiyonlu Kurum — görevi süren müdür başyardımcısı bildirildi: "
                + "1 Müdür Başyardımcısı normu (Md. 6/1-a).");
        } else if (!basyrdAktif) {
            // Ünvan kapalı: norm üretilmez, açıklama da yazılmaz (raporda
            // hiç görünmemesi isteniyor).
        } else if (isKampusIcinde) {
            explanations.push("Eğitim kampüsü içindeki kuruma müdür başyardımcısı normu verilmez (Md. 6/2).");
        } else if (mudurNorm === 0) {
            explanations.push("Müdür normu verilmeyen kuruma müdür başyardımcısı normu da verilmez (Md. 22/1-a).");
        } else if (options.isPansiyonlu) {
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
            mudurBasyardimcisiAktif: basyrdAktif || pansiyonBasyrd,
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


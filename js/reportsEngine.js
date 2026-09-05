/**
 * MEB Norm Kadro ve Ders Yükü Yönetim Sistemi
 * reportsEngine.js - Profesyonel Raporlama, Master Grid Matrisi ve Analitik Motoru
 */

class MebReportsEngine {
    constructor(dbService, normEngine, curriculumEngine) {
        this.db = dbService;
        this.normEngine = normEngine;
        this.curriculum = curriculumEngine;
    }

    // Kopya: adminOptions anahtarı canlı state'e sızarsa branş listesi kirlenir.
    /**
     * DERS YÜKÜ MUTABAKATI — dışa aktarım satırları.
     *
     * Ekranda açıklanan farkın dosyada da yazması gerekiyor: müdürler bu
     * dosyayı ilçeye/il'e gönderiyor ve soru orada soruluyor.
     * (Kullanıcı isteği, 05.09.2026.)
     */
    mutabakatSatirlari(m, sutunSayisi) {
        if (!m || m.tutarli === false) return [];
        const bos = (n) => new Array(Math.max(0, n)).fill("");
        const satir = (ad, deger, not) => [ad, deger, ...bos(sutunSayisi - 3), not];
        const fark = m.normaEsasYuk - m.hamCizelgeSaati;

        const rows = [bos(sutunSayisi), satir("DERS YÜKÜ MUTABAKATI", "", "")];
        if (fark === 0) {
            rows.push(satir("Şube çizelgesi toplamı = norma esas öğretmen ders yükü",
                m.normaEsasYuk, "Bölünme, birleştirme veya yönetici ders saati kaynaklı fark yok."));
            return rows;
        }
        rows.push(satir("Şube çizelgesi toplamı", m.hamCizelgeSaati,
            "Öğrencilerin haftada gördüğü ders saati"));
        if (m.carpanArtisi) rows.push(satir("Bölünen ders / grup çarpanı",
            (m.carpanArtisi > 0 ? "+" : "-") + Math.abs(m.carpanArtisi),
            "Ders birden fazla gruba/branşa bölündüğünde her öğretmen tam saati okutur"));
        if (m.birlesikSubeDusumu) rows.push(satir("Birleştirilmiş şubeler",
            "-" + m.birlesikSubeDusumu, "Birleştirilen şubede ders tek öğretmene yazılır"));
        if (m.yoneticiDersDusumu) rows.push(satir("Yönetici ders saati (Md. 22/6)",
            "-" + m.yoneticiDersDusumu, "Yöneticilerin okuttugu saatler brans yükünden düsülür"));
        if (m.koordinatorlukEki) rows.push(satir("Isletmelerde mesleki egitim koordinatörlügü",
            "+" + m.koordinatorlukEki, "Koordinatörlük yükü brans ders yüküne eklenir (Md. 19/1)"));
        rows.push(satir("NORMA ESAS ÖGRETMEN DERS YÜKÜ", m.normaEsasYuk,
            "Ögretmen normu bu sayi üzerinden hesaplanir"));
        return rows;
    }

    buildCoordinatorMap(state) {
        const map = { ...(state.koordinatorlukYukleri || {}) };
        map.adminOptions = (state.okulBilgisi || {}).adminOptions || {};
        return map;
    }

    // --- 1. OKUL İCMAL VE YÖNETİCİ ÖZETİ RAPORU ---
    generateExecutiveSummary(state) {
        const subeler = state.subeler || [];
        const existingTeachers = state.mevcutOgretmenler || {};
        const schoolInfo = state.okulBilgisi || {};
        const schoolType = schoolInfo.okulTuru || "";

        const coordinatorMap = this.buildCoordinatorMap(state);

        const normResult = this.normEngine.calculateSchoolNorms(subeler, existingTeachers, schoolType, coordinatorMap);
        
        let totalStudents = 0;
        let baseWeeklyHours = 0;
        let gradeCounts = {};
        subeler.forEach(s => {
            totalStudents += (parseInt(s.ogrenciSayisi, 10) || 0);
            const g = s.sinifSeviyesi || "Diğer";
            gradeCounts[g] = (gradeCounts[g] || 0) + 1;
            const allC = [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])];
            allC.forEach(c => { baseWeeklyHours += (parseInt(c.saat || c.ders_saati || 0, 10)); });
        });

        // Durum analizi
        let tamCount = 0;
        let ihtiyacCount = 0;
        let fazlaCount = 0;

        normResult.branchReport.forEach(b => {
            if (b.statusType === 'tam') tamCount++;
            else if (b.statusType === 'ihtiyac') ihtiyacCount++;
            else if (b.statusType === 'fazla') fazlaCount++;
        });

        return {
            reportType: "EXECUTIVE_SUMMARY",
            title: "Okul Geneli Norm ve Ders Yükü Yönetici İcmal Raporu",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            kpis: {
                totalHours: normResult.totalHours,
                baseWeeklyHours: baseWeeklyHours,
                totalCalculatedNorm: normResult.totalCalculatedNorm,
                totalCurrentTeachers: normResult.totalCurrentTeachers,
                totalNeeded: normResult.totalNeeded,
                totalSurplus: normResult.totalSurplus,
                totalSections: subeler.length,
                totalStudents: totalStudents,
                tamBranchesCount: tamCount,
                ihtiyacBranchesCount: ihtiyacCount,
                fazlaBranchesCount: fazlaCount,
                adminNorms: normResult.adminNorms,
                guidanceNorms: normResult.guidanceNorms
            },
            adminNorms: normResult.adminNorms,
            guidanceNorms: normResult.guidanceNorms,
            // Şube çizelgesi toplamı ile norma esas ders yükü arasındaki köprü.
            yukMutabakati: normResult.yukMutabakati || null,
            gradeCounts: gradeCounts,
            branchReport: normResult.branchReport
        };
    }

    // --- 2. OKUL MASTER BRANŞ-ŞUBE DERS YÜKÜ MATRİSİ (GRID TABLE) ---
    generateMasterLoadGrid(state, filterGrade = "ALL") {
        const rawSubeler = state.subeler || [];
        const existingTeachers = state.mevcutOgretmenler || {};
        const schoolInfo = state.okulBilgisi || {};
        const schoolType = schoolInfo.okulTuru || "";

        // Şube Filtresi
        const subeler = rawSubeler.filter(s => {
            if (filterGrade === "ALL") return true;
            return String(s.sinifSeviyesi) === String(filterGrade);
        });

        // Şubeleri sınıf seviyesi ve adına göre sırala
        subeler.sort((a, b) => {
            const ga = parseInt(a.sinifSeviyesi, 10) || 99;
            const gb = parseInt(b.sinifSeviyesi, 10) || 99;
            if (ga !== gb) return ga - gb;
            return a.subeAdi.localeCompare(b.subeAdi, 'tr');
        });

        const normResult = this.normEngine.calculateSchoolNorms(rawSubeler, existingTeachers, schoolType, this.buildCoordinatorMap(state));
        const branchReportMap = {};
        normResult.branchReport.forEach(b => {
            branchReportMap[b.branchName] = b;
        });

        // 1. Verileri Branş -> Ders -> Şube Saatleri Hiyerarşisinde Topla
        // branchData[branchName] = { isVocational: bool, areaCode: str, courses: { [courseName]: { sectionHours: { [secId]: hours }, totalHours: num } }, totalHours: num }
        const branchGroups = {};
        const handledMergedPairs = new Set();

        subeler.forEach(sec => {
            // EĞİK ÇİZGİLİ / PAYLAŞTIRILMIŞ DERSLERİ MOTORLA AYNI ŞEKİLDE AÇ
            //
            // Matris bugüne kadar ham çizelgeyi okuyordu: "Görsel Sanatlar/Müzik"
            // dersi iki branşa bölünmüş olsa bile TEK satır olarak, tek branşın
            // altında görünüyordu. Sonuç: motorda 6 saat yük taşıyan MÜZİK
            // branşının matriste hiç satırı yoktu — branş detay raporunda vardı.
            // İki rapor birbiriyle çelişiyordu. (Ölçüldü 06.09.2026.)
            //
            // Aynı `dersiGenislet` çağrılıyor ki matris ile norm motoru aynı
            // kayıtları görsün; ayrışırsa yine sessiz bir fark doğar.
            // Şube sütun toplamları (sectionTotals) BUNDAN ETKİLENMEZ: onlar
            // ham çizelgeden ayrıca hesaplanır, alt satır yine öğrenci saatini
            // gösterir. Farkı zaten DERS YÜKÜ MUTABAKATI açıklıyor.
            const allCourses = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])]
                .reduce((liste, c) => liste.concat(
                    (this.normEngine && typeof this.normEngine.dersiGenislet === "function")
                        ? this.normEngine.dersiGenislet(c)
                        : [c]
                ), []);
            allCourses.forEach(c => {
                const rawCName = c.ders || c.ders_adi;
                if (!rawCName) return;
                const hours = parseInt(c.saat || c.ders_saati || 0, 10);
                if (hours <= 0) return;

                // Kanonik İsim ve Branş Çözümleme (Büyük/küçük harf ve sahte branş çiftliklerini birleştirir)
                let resolved = { courseName: rawCName, branchName: c.atananBrans };
                if (this.curriculum && typeof this.curriculum.getCanonicalCourseAndBranch === 'function') {
                    resolved = this.curriculum.getCanonicalCourseAndBranch(rawCName, c.atananBrans, sec.alanId, c.kategori || "ORTAK DERSLER");
                } else if (this.db && typeof this.db.resolveBranch === 'function') {
                    resolved.branchName = this.db.resolveBranch(rawCName, sec.alanId, c.kategori || "ORTAK DERSLER");
                }

                const cName = resolved.courseName;
                const brans = resolved.branchName || c.varsayilanBrans || rawCName;

                const isVoc = (c.kategori || "").includes("MESLEK") || (c.kategori || "").includes("ALAN") || (c.kategori || "").includes("DAL") || !!c.isAtolye || !!c.isVocational || (this.db && this.db.getVocationalBranchesList && this.db.getVocationalBranchesList().includes(brans));

                if (!branchGroups[brans]) {
                    branchGroups[brans] = {
                        branchName: brans,
                        isVocational: isVoc,
                        areaCode: sec.alanId || null,
                        courses: {},
                        totalHours: 0
                    };
                } else if (isVoc) {
                    branchGroups[brans].isVocational = true;
                }

                if (!branchGroups[brans].courses[cName]) {
                    branchGroups[brans].courses[cName] = {
                        courseName: cName,
                        kategori: c.kategori || "ORTAK DERSLER",
                        isBaraj: !!c.baraj_ders,
                        isAtolye: !!c.isAtolye,
                        // Aynı ders birden fazla branşın altında görünüyorsa
                        // sebebi yazsın; yoksa "ders iki kez sayılmış" sanılır.
                        isBolunmus: !!(c._bolunmusBrans || c._dagitilmisBrans),
                        bolunmeParcasi: c._bolunmusBrans || c._dagitilmisBrans || null,
                        bolunmeSayisi: c._bolunmeSayisi || null,
                        sectionHours: {},
                        mergedSections: {},
                        totalHours: 0
                    };
                }

                // Dersin bu şubedeki saati (şube çizelgesinde görünür)
                branchGroups[brans].courses[cName].sectionHours[sec.id] = hours;

                // Sınıf birleştirme kontrolü (aynı birleşik ders grubunu mükerrer öğretmen yükü olarak sayma)
                const mergedWith = c.birlesikSubeler || [];
                let isMergedDuplicate = false;
                if (mergedWith.length > 0) {
                    branchGroups[brans].courses[cName].mergedSections[sec.id] = mergedWith;
                    // Bölünmüş dersin her branş payı AYRI bir kayıttır; anahtar
                    // yalnızca ders adına bakarsa ikinci pay "mükerrer" sanılıp
                    // sessizce düşer. Payı anahtara katıyoruz.
                    //
                    // Bölünme YOKKEN anahtar aynen eskisi gibi kalır: birleşik
                    // şubelerdeki normal dersler için davranış değişmez.
                    const pay = c._bolunmusBrans || c._dagitilmisBrans || "";
                    const groupKey = [sec.id, ...mergedWith].sort().join("___") + "::" + cName
                        + (pay ? "::" + pay : "");
                    if (handledMergedPairs.has(groupKey)) {
                        isMergedDuplicate = true;
                    } else {
                        handledMergedPairs.add(groupKey);
                    }
                }

                if (!isMergedDuplicate) {
                    branchGroups[brans].courses[cName].totalHours += hours;
                    branchGroups[brans].totalHours += hours;
                }
            });
        });

        // Koordinatörlük yükleri varsa branş toplamlarına yansıt
        const coordMap = state.koordinatorlukYukleri || {};
        Object.entries(coordMap).forEach(([br, val]) => {
            const numVal = parseInt(val, 10) || 0;
            if (numVal > 0 && branchGroups[br]) {
                branchGroups[br].totalHours += numVal;
            }
        });

        // Eğer normResult içinde branş raporu varsa, branş toplam yükünü normEngine ile %100 senkronize et
        Object.keys(branchGroups).forEach(bName => {
            if (branchReportMap[bName] && branchReportMap[bName].totalHours !== undefined) {
                branchGroups[bName].totalHours = branchReportMap[bName].totalHours;
            }
        });

        // Branşları alfabetik sırala (Önce Alan/Meslek Branşları, Sonra Genel Kültür Branşları)
        const sortedBranchNames = Object.keys(branchGroups).sort((a, b) => {
            const isVocA = branchGroups[a].isVocational;
            const isVocB = branchGroups[b].isVocational;
            if (isVocA !== isVocB) return isVocA ? -1 : 1;
            return a.localeCompare(b, 'tr');
        });

        // Şube bazlı sütun toplam saatleri
        const sectionTotals = {};
        subeler.forEach(s => {
            let totalSecH = 0;
            const allC = [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])];
            allC.forEach(c => { totalSecH += (parseInt(c.saat || c.ders_saati || 0, 10)); });
            sectionTotals[s.id] = totalSecH;
        });

        return {
            reportType: "MASTER_LOAD_GRID",
            title: "Okul Master Ders Dağıtım ve Branş-Şube Yük Matrisi",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            subeler: subeler,
            sectionTotals: sectionTotals,
            sortedBranchNames: sortedBranchNames,
            branchGroups: branchGroups,
            branchReportMap: branchReportMap,
            grandTotalHours: normResult.totalHours || Object.values(sectionTotals).reduce((s, h) => s + h, 0),
            yukMutabakati: normResult.yukMutabakati || null
        };
    }

    // --- 3. BRANŞ BAZLI DETAYLI NORM VE DERS CETVELİ ---
    generateBranchDetailReport(state, targetBranch = "ALL") {
        const subeler = state.subeler || [];
        const existingTeachers = state.mevcutOgretmenler || {};
        const schoolInfo = state.okulBilgisi || {};
        const schoolType = schoolInfo.okulTuru || "";

        const normResult = this.normEngine.calculateSchoolNorms(subeler, existingTeachers, schoolType, this.buildCoordinatorMap(state));

        const filteredBranches = normResult.branchReport.filter(b => {
            if (targetBranch === "ALL") return true;
            return b.branchName.toLowerCase() === targetBranch.toLowerCase();
        });

        return {
            reportType: "BRANCH_DETAIL",
            title: "Branş Bazlı Ders Dağılımı ve Norm Hesaplama Cetveli",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            targetBranch: targetBranch,
            branches: filteredBranches
        };
    }

    // --- 4. SINIF VE ŞUBE HAFTALIK DERS ÇİZELGESİ RAPORU ---
    generateSectionScheduleReport(state, filterGrade = "ALL", filterSectionId = "ALL") {
        const rawSubeler = state.subeler || [];
        const schoolInfo = state.okulBilgisi || {};

        const sections = rawSubeler.filter(s => {
            if (filterGrade !== "ALL" && String(s.sinifSeviyesi) !== String(filterGrade)) return false;
            if (filterSectionId !== "ALL" && s.id !== filterSectionId) return false;
            return true;
        });

        sections.sort((a, b) => {
            const ga = parseInt(a.sinifSeviyesi, 10) || 99;
            const gb = parseInt(b.sinifSeviyesi, 10) || 99;
            if (ga !== gb) return ga - gb;
            return a.subeAdi.localeCompare(b.subeAdi, 'tr');
        });

        const detailedSections = sections.map(s => {
            const commonCourses = [];
            const vocationalCourses = [];
            const electiveCourses = [];
            let guidanceCourse = null;

            let totalCommon = 0;
            let totalVocational = 0;
            let totalElective = 0;
            let totalGuidance = 0;

            const allCourses = [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])];

            allCourses.forEach(c => {
                const cName = c.ders || c.ders_adi;
                const hours = parseInt(c.saat || c.ders_saati || 0, 10);
                const kat = (c.kategori || "").toUpperCase();
                const norm = (cName || "").toLowerCase();

                const cObj = {
                    ders: cName,
                    saat: hours,
                    atananBrans: c.atananBrans || "—",
                    kategori: c.kategori,
                    baraj_ders: !!c.baraj_ders,
                    isAtolye: !!c.isAtolye
                };

                if (norm.includes("rehberlik")) {
                    guidanceCourse = cObj;
                    totalGuidance += hours;
                } else if (kat.includes("SEÇMELİ") || c.isElectiveVocational) {
                    electiveCourses.push(cObj);
                    totalElective += hours;
                } else if (kat.includes("MESLEK") || kat.includes("ALAN") || kat.includes("DAL") || c.isAtolye) {
                    vocationalCourses.push(cObj);
                    totalVocational += hours;
                } else {
                    commonCourses.push(cObj);
                    totalCommon += hours;
                }
            });

            return {
                id: s.id,
                subeAdi: s.subeAdi,
                sinifSeviyesi: s.sinifSeviyesi,
                ogrenciSayisi: s.ogrenciSayisi || 30,
                alanId: s.alanId,
                dalAdi: s.dalAdi,
                commonCourses: commonCourses,
                vocationalCourses: vocationalCourses,
                electiveCourses: electiveCourses,
                guidanceCourse: guidanceCourse,
                totals: {
                    common: totalCommon,
                    vocational: totalVocational,
                    elective: totalElective,
                    guidance: totalGuidance,
                    weeklyTotal: totalCommon + totalVocational + totalElective + totalGuidance
                }
            };
        });

        return {
            reportType: "SECTION_SCHEDULE",
            title: "Sınıf ve Şube Haftalık Ders Çizelgeleri Raporu",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            sections: detailedSections
        };
    }

    // --- 5. NORM İHTİYAÇ VE FAZLALIK EYLEM RAPORU (MEBBİS & İL/İLÇE MEM) ---
    generateNormActionReport(state) {
        const subeler = state.subeler || [];
        const existingTeachers = state.mevcutOgretmenler || {};
        const schoolInfo = state.okulBilgisi || {};
        const schoolType = schoolInfo.okulTuru || "";

        const normResult = this.normEngine.calculateSchoolNorms(subeler, existingTeachers, schoolType, this.buildCoordinatorMap(state));

        // NOT: motor bu alanı `diff` adıyla üretir, `difference` DEĞİL.
        // `b.difference` tanımsız kaldığı için hem `< 0` hem `> 0` yanlış
        // çıkıyor ve listeler HER ZAMAN boş dönüyordu: rozet "Toplam İhtiyaç:
        // 2 Öğretmen" derken sayfada "ihtiyacı olan branş bulunmamaktadır"
        // yazıyordu. (Kullanıcı bildirimi + ekran görüntüsü, 06.09.2026.)
        // Aynı hata 2026-08-24'te İcmal ve Branş Detay ÇİZİCİLERİNDE
        // düzeltilmiş, bu dört yer atlanmıştı.
        const neededList = normResult.branchReport.filter(b => b.diff < 0).map(b => ({
            branchName: b.branchName,
            totalHours: b.totalHours,
            calculatedNorm: b.calculatedNorm,
            currentTeachers: b.currentTeachers,
            neededCount: Math.abs(b.diff),
            reason: `${b.totalHours} saat ders yükü için ${b.calculatedNorm} norm hesaplanmış olup, mevcut kadro (${b.currentTeachers}) yetersizdir.`
        }));

        const surplusList = normResult.branchReport.filter(b => b.diff > 0).map(b => ({
            branchName: b.branchName,
            totalHours: b.totalHours,
            calculatedNorm: b.calculatedNorm,
            currentTeachers: b.currentTeachers,
            surplusCount: b.diff,
            reason: `${b.totalHours} saat ders yükü için ${b.calculatedNorm} norm hesaplanmış olup, ${b.diff} öğretmen norm kadro fazlasıdır.`
        }));

        const balancedList = normResult.branchReport.filter(b => b.diff === 0 && b.calculatedNorm > 0);

        return {
            reportType: "NORM_ACTION_REPORT",
            title: "Norm Kadro İhtiyaç ve Fazlalık Raporu",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            totalNeeded: normResult.totalNeeded,
            totalSurplus: normResult.totalSurplus,
            neededList: neededList,
            surplusList: surplusList,
            balancedList: balancedList
        };
    }

    // --- 6. ATÖLYE, LABORATUVAR VE GRUP DAĞILIM RAPORU ---
    generateVocationalLabReport(state) {
        const subeler = state.subeler || [];
        const schoolInfo = state.okulBilgisi || {};
        const schoolType = schoolInfo.okulTuru || "";

        const labData = [];
        let grandBaseHours = 0;
        let grandCalculatedHours = 0;

        subeler.forEach(sec => {
            const allC = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
            const stdCount = parseInt(sec.ogrenciSayisi, 10) || 30;

            allC.forEach(c => {
                const isVoc = (c.kategori || "").includes("MESLEK") || (c.kategori || "").includes("ALAN") || (c.kategori || "").includes("DAL") || !!c.isAtolye || !!c.isVocational;
                if (!isVoc) return;

                const baseH = parseInt(c.saat || c.ders_saati || 0, 10);
                if (baseH <= 0) return;

                // Md. 22/1-ç grup bölünmesi SINIF SEVİYESİNE bağlıdır; sinifSeviyesi
                // geçilmezse rapor, norm hesabından farklı grup sayısı üretir.
                const inclusionCount = parseInt(sec.kaynastirmaOgrenciSayisi ?? sec.kaynastirmaSayisi ?? 0, 10) || 0;
                const mult = this.normEngine.evaluateCourseMultiplier(c, stdCount, schoolType, sec.sinifSeviyesi, inclusionCount);
                grandBaseHours += baseH;
                grandCalculatedHours += mult.calculatedLoad;

                labData.push({
                    sectionName: sec.subeAdi,
                    grade: sec.sinifSeviyesi,
                    studentCount: stdCount,
                    courseName: c.ders || c.ders_adi,
                    baseHours: baseH,
                    groupCount: mult.groupCount,
                    calculatedLoad: mult.calculatedLoad,
                    extraLoad: mult.calculatedLoad - baseH,
                    note: mult.note,
                    branchName: c.atananBrans || "Atanmadı"
                });
            });
        });

        return {
            reportType: "VOCATIONAL_LAB_REPORT",
            title: "Atölye, Laboratuvar ve Grup Bölünmeleri Ders Yükü Raporu",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            labCourses: labData,
            grandBaseHours: grandBaseHours,
            grandCalculatedHours: grandCalculatedHours,
            totalExtraGroupHours: grandCalculatedHours - grandBaseHours
        };
    }

    // --- 7. 3-TEMA SEÇMELİ DERS DENGE RAPORU ---
    generateElectiveThemeReport(state) {
        const subeler = state.subeler || [];
        const schoolInfo = state.okulBilgisi || {};

        const themeReport = subeler.map(sec => {
            const electives = sec.secmeliDersler || [];
            const stats = {
                BILIM: { count: 0, hours: 0, courses: [] },
                DEGER: { count: 0, hours: 0, courses: [] },
                SANAT: { count: 0, hours: 0, courses: [] },
                VOC: { count: 0, hours: 0, courses: [] }
            };

            let totalElectiveH = 0;

            electives.forEach(c => {
                const cName = c.ders || c.ders_adi;
                const h = parseInt(c.saat || c.ders_saati || 0, 10);
                totalElectiveH += h;

                const norm = (String(cName) + " " + String(c.kategori || "")).toLowerCase()
                    .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
                    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/['’\-\.\,\(\)]/g, '');

                let themeId = "BILIM";
                if (c.isVocational || c.isElectiveVocational || (c.kategori || "").includes("MESLEK")) {
                    themeId = "VOC";
                } else if (norm.includes("din") || norm.includes("kuran") || norm.includes("peygamber") || norm.includes("siyer") || norm.includes("ahlak") || norm.includes("adab") || norm.includes("deger")) {
                    themeId = "DEGER";
                } else if (norm.includes("sanat") || norm.includes("muzik") || norm.includes("gorsel") || norm.includes("spor") || norm.includes("masal") || norm.includes("oyun") || norm.includes("drama")) {
                    themeId = "SANAT";
                }

                stats[themeId].count += 1;
                stats[themeId].hours += h;
                stats[themeId].courses.push(`${cName} (${h}s)`);
            });

            return {
                sectionName: sec.subeAdi,
                grade: sec.sinifSeviyesi,
                totalElectiveHours: totalElectiveH,
                stats: stats,
                isBalanced: stats.BILIM.count > 0 && stats.DEGER.count > 0 && stats.SANAT.count > 0
            };
        });

        return {
            reportType: "ELECTIVE_THEME_REPORT",
            title: "3-Tema Seçmeli Ders Tercih Dengesi ve Dağılım Analizi",
            generatedAt: new Date().toLocaleString("tr-TR"),
            schoolInfo: schoolInfo,
            themeSections: themeReport
        };
    }

    // --- ÇOKLU SEKME VE KURUMSAL EXCEL (XLSX) ÇIKTI ÜRETİCİ ---
    exportToXLSX(state) {
        let xlsxLib = typeof XLSX !== 'undefined' ? XLSX : (typeof window !== 'undefined' ? window.XLSX : null);
        if (!xlsxLib) {
            console.error("XLSX motoru bulunamadı.");
            return false;
        }

        const wb = xlsxLib.utils.book_new();
        const schoolInfo = state.okulBilgisi || {};
        const okulAdi = schoolInfo.okulAdi || "MEB Okulu";
        const sezon = schoolInfo.sezon || "2026-2027";

        // SEKME 1: YÖNETİCİ İCMALİ VE NORM KADRO DAĞILIMI
        const execData = this.generateExecutiveSummary(state);
        const wsExecRows = [];
        wsExecRows.push(["T.C. MİLLÎ EĞİTİM BAKANLIĞI"]);
        wsExecRows.push([`${okulAdi.toLocaleUpperCase('tr-TR')} - NORM KADRO VE DERS YÜKÜ YÖNETİCİ İCMALİ`]);
        wsExecRows.push([`Eğitim-Öğretim Sezonu: ${sezon}`, `Rapor Tarihi: ${new Date().toLocaleString("tr-TR")}`]);
        wsExecRows.push([]);
        
        // Temel İstatistikler
        wsExecRows.push(["--- GENEL OKUL İSTATİSTİKLERİ ---"]);
        wsExecRows.push(["Toplam Şube Sayısı", execData.kpis.totalSections, "Toplam Öğrenci Sayısı", execData.kpis.totalStudents]);
        wsExecRows.push(["Toplam Haftalık Ders Yükü", `${execData.kpis.totalHours} Saat`, "Toplam Hesaplanan Norm", `${execData.kpis.totalCalculatedNorm} Öğretmen`]);
        wsExecRows.push(["Mevcut Kadrolu Öğretmen", `${execData.kpis.totalCurrentTeachers} Öğretmen`, "Toplam Norm İhtiyacı", `${execData.kpis.totalNeeded} Öğretmen`]);
        wsExecRows.push(["Toplam Norm Fazlalığı", `${execData.kpis.totalSurplus} Öğretmen`, "Normu Tam Branş Sayısı", `${execData.kpis.tamBranchesCount} Branş`]);
        wsExecRows.push([]);

        // Yönetici Normları
        if (execData.adminNorms) {
            const an = execData.adminNorms;
            const kr = an.karsilastirma;
            wsExecRows.push(["--- MEB YÖNETİCİ VE İDARECİ NORM KADRO CETVELİ (MD. 5 - 14) ---"]);
            wsExecRows.push(["Yönetici Görevi", "Norm Sayısı", "Mevcut", "Fark / Durum", "Yasal Dayanak ve Mevzuat Açıklaması"]);
            wsExecRows.push(["Okul Müdürü", an.mudur, kr ? kr.mudur.mevcut : "—", kr ? kr.mudur.etiket : "—", "MEB Norm Kadro Yön. Madde 5"]);
            // Ünvan kaldırıldı (normEngine.mudurBasyardimcisiUnvaniYururlukte).
            // Kapalıyken satır dışa aktarıma hiç yazılmaz.
            if (an.mudurBasyardimcisiAktif !== false) {
                wsExecRows.push(["Müdür Başyardımcısı", an.mudurBasyardimcisi, kr ? kr.mudurBasyardimcisi.mevcut : "—", kr ? kr.mudurBasyardimcisi.etiket : "—", "MEB Norm Kadro Yön. Madde 6"]);
            }
            wsExecRows.push(["Müdür Yardımcısı (Toplam)", an.mudurYardimcisiTotal, kr ? kr.mudurYardimcisi.mevcut : "—", kr ? kr.mudurYardimcisi.etiket : "—", `Temel: ${an.mudurYardimcisiBase} + İlave: ${an.mudurYardimcisiExtra} (MEB Md. 7-12 & Md. 14)`]);
            wsExecRows.push(["TOPLAM YÖNETİCİ NORMU", an.toplamYonetici, kr ? kr.toplam.mevcut : "—", kr ? kr.toplam.etiket : "—", `Norma esas öğrenci sayısı: ${an.normaEsasOgrenciSayisi} (Md. 22/1-b)`]);
            (an.explanations || []).forEach(exp => wsExecRows.push(["", "", "", "", exp]));
            wsExecRows.push([]);

            const dusumSatirlari = execData.branchReport.filter(b => b.adminDeductedHours > 0);
            if (dusumSatirlari.length > 0) {
                wsExecRows.push(["--- YÖNETİCİLERİN OKUTTUĞU DERSLERİN BRANŞ YÜKÜNDEN DÜŞÜLMESİ (MD. 22/6) ---"]);
                wsExecRows.push(["Branş Adı", "Düşülen Saat", "Düşüm Sonrası Haftalık Ders Yükü"]);
                dusumSatirlari.forEach(b => wsExecRows.push([b.branchName, b.adminDeductedHours, b.totalHours]));
                wsExecRows.push([]);
            }
        }

        // Okul Rehberlik Servisi Normu (Md. 21)
        if (execData.guidanceNorms) {
            const gn = execData.guidanceNorms;
            wsExecRows.push(["--- OKUL REHBERLİK SERVİSİ NORM KADROSU (MD. 21/2, 21/3) ---"]);
            wsExecRows.push(["Görev", "Norm Sayısı", "Mevcut", "Fark / Durum", "Yasal Dayanak ve Mevzuat Açıklaması"]);
            wsExecRows.push([
                "Rehber Öğretmen (Psikolojik Danışman)",
                gn.norm,
                gn.karsilastirma.mevcut,
                gn.karsilastirma.etiket,
                `İlk norm eşiği: ${gn.esik} öğrenci (${gn.esikMadde}) · İlave norm aralığı: her ${gn.aralik} öğrenci (Md. 21/3)`
            ]);
            (gn.explanations || []).forEach(exp => wsExecRows.push(["", "", "", "", exp]));
            wsExecRows.push([]);
        }

        // Branş Norm Tablosu
        wsExecRows.push(["--- BRANŞ BAZLI DERS YÜKÜ VE NORM KADRO TABLOSU ---"]);
        wsExecRows.push(["Sıra", "Branş Adı", "Haftalık Ders Yükü (Saat)", "Hesaplanan Norm", "Mevcut Kadrolu", "Norm Durumu", "Fark / İhtiyaç"]);
        
        execData.branchReport.forEach((b, idx) => {
            // Motor alanı `diff`; `difference` tanımsızdı ve Excel her branşa
            // "0 (Tam)" yazıyordu. (Ölçüldü 06.09.2026.)
            const diffText = b.diff > 0 ? `+${b.diff} Fazla` : (b.diff < 0 ? `${b.diff} İhtiyaç` : "0 (Tam)");
            wsExecRows.push([
                idx + 1,
                b.branchName,
                b.totalHours,
                b.calculatedNorm,
                b.currentTeachers,
                b.statusBadge,
                diffText
            ]);
        });

        const wsExec = xlsxLib.utils.aoa_to_sheet(wsExecRows);
        wsExec['!cols'] = [{ wch: 6 }, { wch: 36 }, { wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 18 }];
        xlsxLib.utils.book_append_sheet(wb, wsExec, "Yönetici İcmali & Normlar");


        // SEKME 2: MASTER BRANŞ-ŞUBE DERS YÜKÜ MATRİSİ (GRID)
        const gridData = this.generateMasterLoadGrid(state, "ALL");
        const wsGridRows = [];
        wsGridRows.push(["T.C. MİLLÎ EĞİTİM BAKANLIĞI"]);
        wsGridRows.push([`${okulAdi.toLocaleUpperCase('tr-TR')} - OKUL MASTER BRANŞ-ŞUBE DERS DAĞITIM MATRİSİ`]);
        wsGridRows.push([`Sezon: ${sezon}`, `Toplam Şube: ${gridData.subeler.length}`, `Toplam Ders Yükü: ${gridData.grandTotalHours}s`]);
        wsGridRows.push([]);

        // Header
        const gridHeader = ["Sıra", "Branş Adı", "Ders Adı", ...gridData.subeler.map(s => `${s.subeAdi} (${s.sinifSeviyesi}.Snf)`), "Toplam Saat", "Norm Kadro"];
        wsGridRows.push(gridHeader);

        let rowSeq = 1;
        gridData.sortedBranchNames.forEach(bName => {
            const bGroup = gridData.branchGroups[bName];
            const bData = gridData.branchReportMap[bName] || {};

            Object.values(bGroup.courses).forEach(course => {
                const row = [
                    rowSeq++,
                    bName,
                    course.courseName,
                    ...gridData.subeler.map(s => course.sectionHours[s.id] || ""),
                    course.totalHours,
                    bData.calculatedNorm || 0
                ];
                wsGridRows.push(row);
            });
        });

        // Toplam Satırı
        const gridSutunToplami = gridData.subeler.reduce((s, sec) => s + (gridData.sectionTotals[sec.id] || 0), 0);
        const totalRow = ["", "GENEL TOPLAM", "Tüm Şube Yükleri", ...gridData.subeler.map(s => gridData.sectionTotals[s.id] || 0), gridSutunToplami, "—"];
        wsGridRows.push(totalRow);
        this.mutabakatSatirlari(gridData.yukMutabakati, totalRow.length)
            .forEach(r => wsGridRows.push(r));

        const wsGrid = xlsxLib.utils.aoa_to_sheet(wsGridRows);
        const gridCols = [{ wch: 6 }, { wch: 32 }, { wch: 32 }];
        gridData.subeler.forEach(() => gridCols.push({ wch: 14 }));
        gridCols.push({ wch: 16 }, { wch: 14 });
        wsGrid['!cols'] = gridCols;
        xlsxLib.utils.book_append_sheet(wb, wsGrid, "Master Ders Dağıtım Matrisi");


        // SEKME 3: ŞUBE BAZLI HAFTALIK DERS ÇİZELGELERİ
        const scheduleData = this.generateSectionScheduleReport(state, "ALL", "ALL");
        const wsSchedRows = [];
        wsSchedRows.push(["T.C. MİLLÎ EĞİTİM BAKANLIĞI"]);
        wsSchedRows.push([`${okulAdi.toLocaleUpperCase('tr-TR')} - ŞUBE HAFTALIK DERS ÇİZELGELERİ VE DERS DAĞILIMLARI`]);
        wsSchedRows.push([]);

        scheduleData.sections.forEach(sec => {
            wsSchedRows.push([`=== ${sec.subeAdi} (${sec.sinifSeviyesi}. Sınıf - Mevcut: ${sec.ogrenciSayisi} Öğrenci) ===`, `Haftalık Toplam: ${sec.totals.weeklyTotal} Saat`]);
            wsSchedRows.push(["Sıra", "Ders Adı", "Kategori", "Haftalık Saat", "Atanan Branş", "Baraj Ders"]);
            
            const allCourses = [
                ...(sec.commonCourses || []).map(c => ({ ...c, category: "Ortak Zorunlu" })),
                ...(sec.vocationalCourses || []).map(c => ({ ...c, category: "Meslek / Alan / Dal" })),
                ...(sec.electiveCourses || []).map(c => ({ ...c, category: "Seçmeli Ders" })),
                ...(sec.guidanceCourse ? [{ ...sec.guidanceCourse, category: "Rehberlik" }] : [])
            ];

            allCourses.forEach((c, cIdx) => {
                wsSchedRows.push([
                    cIdx + 1,
                    c.ders || c.dersAdi,
                    c.category,
                    c.saat || c.haftalikSaat,
                    c.brans || c.branchName || "—",
                    c.isBaraj ? "BARAJ" : "—"
                ]);
            });
            wsSchedRows.push([]);
        });

        const wsSched = xlsxLib.utils.aoa_to_sheet(wsSchedRows);
        wsSched['!cols'] = [{ wch: 6 }, { wch: 36 }, { wch: 24 }, { wch: 14 }, { wch: 30 }, { wch: 12 }];
        xlsxLib.utils.book_append_sheet(wb, wsSched, "Şube Ders Çizelgeleri");


        // SEKME 4: ATÖLYE, LABORATUVAR VE KOORDİNATÖRLÜK MATRİSİ
        const labData = this.generateVocationalLabReport(state);
        const wsLabRows = [];
        wsLabRows.push(["T.C. MİLLÎ EĞİTİM BAKANLIĞI"]);
        wsLabRows.push([`${okulAdi.toLocaleUpperCase('tr-TR')} - MESLEKİ VE TEKNİK ATÖLYE / GRUP BÖLÜNMELERİ RAPORU`]);
        wsLabRows.push([`Toplam Temel Atölye Saati: ${labData.grandBaseHours}s`, `Grup Çarpanlı Fiili Saat: ${labData.grandCalculatedHours}s`, `Oluşan Ek Ders Yükü: +${labData.totalExtraGroupHours}s`]);
        wsLabRows.push([]);
        wsLabRows.push(["Sıra", "Şube", "Sınıf", "Öğrenci Mevcudu", "Ders Adı", "Branş", "Temel Saat", "Grup Sayısı", "Fiili Yük (Saat)", "Ek Yük (+)", "Mevzuat Notu"]);

        labData.labCourses.forEach((lab, lIdx) => {
            wsLabRows.push([
                lIdx + 1,
                lab.sectionName,
                lab.grade,
                lab.studentCount,
                lab.courseName,
                lab.branchName,
                lab.baseHours,
                lab.groupCount,
                lab.calculatedLoad,
                `+${lab.extraLoad}`,
                lab.note
            ]);
        });

        // 12. Sınıf Koordinatörlük Cetveli
        const coordMap = state.koordinatorlukYukleri || {};
        const coordEntries = Object.entries(coordMap).filter(([k, v]) => parseInt(v, 10) > 0);
        if (coordEntries.length > 0) {
            wsLabRows.push([]);
            wsLabRows.push(["--- 12. SINIF İŞLETMELERDE MESLEK EĞİTİMİ (STAJ) KOORDİNATÖRLÜK YÜKLERİ (OÖKY MD. 88) ---"]);
            wsLabRows.push(["Branş Adı", "Haftalık Ek Koordinatörlük Saati", "Yasal Dayanak"]);
            coordEntries.forEach(([br, val]) => {
                wsLabRows.push([br, `${val} Saat`, "MEB Ortaöğretim Kurumları Yönetmeliği Madde 88"]);
            });
        }

        const wsLab = xlsxLib.utils.aoa_to_sheet(wsLabRows);
        wsLab['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 34 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 36 }];
        xlsxLib.utils.book_append_sheet(wb, wsLab, "Atölye & Koordinatörlük");


        // SEKME 5: NORM KADRO EYLEM VE İHTİYAÇ/FAZLALIK PLANI
        const actionData = this.generateNormActionReport(state);
        const wsActRows = [];
        wsActRows.push(["T.C. MİLLÎ EĞİTİM BAKANLIĞI"]);
        wsActRows.push([`${okulAdi.toLocaleUpperCase('tr-TR')} - NORM KADRO İHTİYAÇ VE FAZLALIK RESMÎ EYLEM CETVELİ`]);
        wsActRows.push([`Toplam Öğretmen İhtiyacı: ${actionData.totalNeeded}`, `Toplam Norm Fazlası: ${actionData.totalSurplus}`]);
        wsActRows.push([]);

        wsActRows.push(["--- 1. NORM KADRO İHTİYACI OLAN BRANŞLAR (ATAMA / GÖREVLENDİRME TALEBİ) ---"]);
        wsActRows.push(["Sıra", "Branş Adı", "Haftalık Yük", "Hesaplanan Norm", "Mevcut Kadrolu", "İhtiyaç Sayısı", "Gerekçe ve Mevzuat Açıklaması"]);
        actionData.neededList.forEach((n, nIdx) => {
            wsActRows.push([nIdx + 1, n.branchName, n.totalHours, n.calculatedNorm, n.currentTeachers, n.neededCount, n.reason]);
        });
        wsActRows.push([]);

        wsActRows.push(["--- 2. NORM KADRO FAZLASI OLAN BRANŞLAR (NORM FAZLASI TESPİTİ) ---"]);
        wsActRows.push(["Sıra", "Branş Adı", "Haftalık Yük", "Hesaplanan Norm", "Mevcut Kadrolu", "Fazlalık Sayısı", "Gerekçe ve Mevzuat Açıklaması"]);
        actionData.surplusList.forEach((s, sIdx) => {
            wsActRows.push([sIdx + 1, s.branchName, s.totalHours, s.calculatedNorm, s.currentTeachers, s.surplusCount, s.reason]);
        });

        const wsAct = xlsxLib.utils.aoa_to_sheet(wsActRows);
        wsAct['!cols'] = [{ wch: 6 }, { wch: 32 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 48 }];
        xlsxLib.utils.book_append_sheet(wb, wsAct, "Norm İhtiyaç & Fazla Eylem");

        // Excel dosyasını indir
        const cleanName = okulAdi.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ]/g, '_');
        const fileName = `${cleanName}_MEB_Norm_ve_Ders_Yuku_Raporu_${sezon}.xlsx`;
        xlsxLib.writeFile(wb, fileName);
        return true;
    }

    // --- CSV (EXCEL) ÇIKTI ÜRETİCİ (UTF-8 BOM İLE TÜRKÇE KARAKTER DESTEKLİ) ---
    exportToCSV(reportData) {
        if (!reportData) return "";
        let csvRows = [];

        // Başlık
        csvRows.push([`"T.C. MİLLÎ EĞİTİM BAKANLIĞI"`]);
        csvRows.push([`"${reportData.schoolInfo?.okulAdi || 'Okul Adı Belirtilmedi'} - ${reportData.title}"`]);
        csvRows.push([`"Rapor Tarihi: ${reportData.generatedAt}"`]);
        csvRows.push([]);

        if (reportData.reportType === "MASTER_LOAD_GRID") {
            const header = ["Branş", "Ders Adı", ...reportData.subeler.map(s => `"${s.subeAdi} (${s.sinifSeviyesi}.Sınıf)"`), "Toplam Saat", "Norm"];
            csvRows.push(header);

            reportData.sortedBranchNames.forEach(bName => {
                const bGroup = reportData.branchGroups[bName];
                const bData = reportData.branchReportMap[bName] || {};

                Object.values(bGroup.courses).forEach(course => {
                    const row = [
                        `"${bName}"`,
                        `"${course.courseName}"`,
                        ...reportData.subeler.map(s => course.sectionHours[s.id] || 0),
                        course.totalHours,
                        `"${bData.calculatedNorm || 0}"`
                    ];
                    csvRows.push(row);
                });
            });

            // Şube Toplam Satırı
            const csvSutunToplami = reportData.subeler.reduce((s, sec) => s + (reportData.sectionTotals[sec.id] || 0), 0);
            const totalRow = ["TOPLAM DERS SAATİ", "—", ...reportData.subeler.map(s => reportData.sectionTotals[s.id] || 0), csvSutunToplami, "—"];
            csvRows.push(totalRow);
            this.mutabakatSatirlari(reportData.yukMutabakati, totalRow.length)
                .forEach(r => csvRows.push(r));

        } else if (reportData.reportType === "EXECUTIVE_SUMMARY" || reportData.reportType === "BRANCH_DETAIL") {
            if (reportData.adminNorms && reportData.reportType === "EXECUTIVE_SUMMARY") {
                const an = reportData.adminNorms;
                const kr = an.karsilastirma;
                csvRows.push(["--- YÖNETİCİ VE İDARECİ NORM KADRO DURUMU (MEB MD. 5 - 14) ---"]);
                csvRows.push(["Yönetici Görevi", "Norm Kadro Sayısı", "Mevcut", "Fark / Durum", "Yasal Dayanak ve Açıklama"]);
                csvRows.push(["Okul Müdürü", an.mudur, kr ? kr.mudur.mevcut : "—", kr ? kr.mudur.etiket : "—", "MEB Norm Kadro Yön. Madde 5"]);
                // Ünvan kaldırıldı (normEngine.mudurBasyardimcisiUnvaniYururlukte).
                // Kapalıyken satır dışa aktarıma hiç yazılmaz.
                if (an.mudurBasyardimcisiAktif !== false) {
                    csvRows.push(["Müdür Başyardımcısı", an.mudurBasyardimcisi, kr ? kr.mudurBasyardimcisi.mevcut : "—", kr ? kr.mudurBasyardimcisi.etiket : "—", "MEB Norm Kadro Yön. Madde 6"]);
                }
                csvRows.push(["Müdür Yardımcısı (Toplam)", an.mudurYardimcisiTotal, kr ? kr.mudurYardimcisi.mevcut : "—", kr ? kr.mudurYardimcisi.etiket : "—", `Temel: ${an.mudurYardimcisiBase} + İlave: ${an.mudurYardimcisiExtra} (MEB Md. 7-12 & Md. 14)`]);
                csvRows.push(["TOPLAM YÖNETİCİ NORMU", an.toplamYonetici, kr ? kr.toplam.mevcut : "—", kr ? kr.toplam.etiket : "—", `Norma esas öğrenci sayısı: ${an.normaEsasOgrenciSayisi} (Md. 22/1-b)`]);
                csvRows.push([]);
            }

            if (reportData.guidanceNorms && reportData.reportType === "EXECUTIVE_SUMMARY") {
                const gn = reportData.guidanceNorms;
                csvRows.push(["--- OKUL REHBERLİK SERVİSİ NORM KADROSU (MEB MD. 21) ---"]);
                csvRows.push(["Görev", "Norm Kadro Sayısı", "Mevcut", "Fark / Durum", "Yasal Dayanak ve Açıklama"]);
                csvRows.push([
                    "Rehber Öğretmen (Psikolojik Danışman)",
                    gn.norm,
                    gn.karsilastirma.mevcut,
                    gn.karsilastirma.etiket,
                    `İlk norm eşiği: ${gn.esik} öğrenci (${gn.esikMadde}) - İlave: her ${gn.aralik} öğrenci (Md. 21/3)`
                ]);
                csvRows.push([]);
            }

            const header = ["Branş Adı", "Toplam Ders Yükü", "Hesaplanan Norm", "Mevcut Kadrolu", "Norm Durumu", "Fark / İhtiyaç"];
            csvRows.push(header);

            const branches = reportData.branches || reportData.branchReport || [];
            branches.forEach(b => {
                csvRows.push([
                    `"${b.branchName}"`,
                    b.totalHours,
                    b.calculatedNorm,
                    b.currentTeachers,
                    `"${b.statusBadge}"`,
                    b.diff > 0 ? `+${b.diff} Fazla` : (b.diff < 0 ? `${b.diff} İhtiyaç` : "0 (Tam)")
                ]);
            });

        } else if (reportData.reportType === "NORM_ACTION_REPORT") {
            csvRows.push(["--- NORM KADRO İHTİYACI OLAN BRANŞLAR ---"]);
            csvRows.push(["Branş Adı", "Ders Yükü", "Hesaplanan Norm", "Mevcut Öğretmen", "İhtiyaç Sayısı", "Gerekçe Açıklaması"]);
            reportData.neededList.forEach(item => {
                csvRows.push([`"${item.branchName}"`, item.totalHours, item.calculatedNorm, item.currentTeachers, item.neededCount, `"${item.reason}"`]);
            });

            csvRows.push([]);
            csvRows.push(["--- NORM KADRO FAZLASI OLAN BRANŞLAR ---"]);
            csvRows.push(["Branş Adı", "Ders Yükü", "Hesaplanan Norm", "Mevcut Öğretmen", "Fazlalık Sayısı", "Gerekçe Açıklaması"]);
            reportData.surplusList.forEach(item => {
                csvRows.push([`"${item.branchName}"`, item.totalHours, item.calculatedNorm, item.currentTeachers, item.surplusCount, `"${item.reason}"`]);
            });
        }

        const csvContent = "\uFEFF" + csvRows.map(e => e.join(";")).join("\n");
        return csvContent;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MebReportsEngine };
}
if (typeof window !== 'undefined') {
    window.MebReportsEngine = MebReportsEngine;
}

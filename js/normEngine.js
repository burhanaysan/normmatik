// MEB Norm Kadro - Norm ve Ders Yükü Hesaplama Motoru (normEngine.js)

export class NormEngine {
    constructor() {
        this.branchMatrix = {};
    }

    setBranchMatrix(matrix) {
        this.branchMatrix = matrix || {};
    }    /**
     * OÖKY Madde 100 & Norm Yönetmeliği Madde 22/1-ç: Mesleki ve Teknik Ortaöğretimde Grup Bölünme Standartları
     * 10-20 Öğrenci: 1 Grup
     * 21-30 Öğrenci: 2 Grup
     * 31-40 Öğrenci: 3 Grup
     * 41 ve Üzeri: 4 Grup (Fiziki kapasiteye göre azami 4 grup)
     */
    calculateWorkshopGroups(studentCount) {
        if (studentCount < 10) return 1;
        if (studentCount <= 20) return 1;
        if (studentCount <= 30) return 2;
        if (studentCount <= 40) return 3;
        return 4;
    }

    /**
     * MEB Norm Kadro Yönetmeliği Madde 22/2 (18/8/2022-31927 Sayılı Resmî Gazete)
     * Mesleki Eğitim Merkezleri (MESEM) İşletmelerde Meslek Eğitimi Çırak Grubu Hesabı
     * @param {number} totalApprentices - Alandaki tüm sınıf seviyelerinde kayıtlı toplam çırak sayısı
     * @returns {number} Grup Sayısı (0 - 12)
     */
    calculateMesemApprenticeGroups(totalApprentices) {
        const count = parseInt(totalApprentices, 10) || 0;
        if (count < 10) return 0;
        if (count < 41) return 1;
        if (count < 81) return 2;
        if (count < 121) return 3;
        if (count < 161) return 4;
        if (count < 201) return 5;
        if (count < 241) return 6;
        if (count < 281) return 7;
        if (count < 321) return 8;
        if (count < 361) return 9;
        if (count < 401) return 10;
        if (count < 441) return 11;
        return 12; // 441 ve daha fazla çırak için 12 grup
    }

    /**
     * Ders ve Okul Türüne Göre Grup / Çalgı / Norm Çarpanını Değerlendirir
     * @param {Object} course - Ders nesnesi
     * @param {number} studentCount - Şube öğrenci sayısı
     * @param {string} schoolType - Okul türü
     * @returns {Object} { groupCount, calculatedLoad, note }
     */
    evaluateCourseMultiplier(course, studentCount, schoolType = "") {
        const baseHours = parseInt(course.saat || course.ders_saati || 0, 10);
        if (isNaN(baseHours) || baseHours <= 0) {
            return { groupCount: 1, calculatedLoad: 0, note: "" };
        }

        const cName = this.normalizeText(course.ders || course.ders_adi || "");
        const sType = String(schoolType || "").toLowerCase();
        const isMesem = sType.includes("mesleki_egitim_merkezi") || sType.includes("mesem");

        const matchesCourse = (pattern) => {
            return cName.includes(this.normalizeText(pattern));
        };

        // 0. MESEM Özel Kuralı (Madde 22/2): Okuldaki alan/dal derslerinde şubeler gruplara BÖLÜNMEZ.
        if (isMesem) {
            return {
                groupCount: 1,
                calculatedLoad: baseHours,
                note: matchesCourse("İŞLETMELERDE MESLEKİ EĞİTİM") ? "MESEM Staj Yükü (Madde 22/2 Bareminde Hesaplanır)" : ""
            };
        }

        // 1. Güzel Sanatlar Bire Bir Çalgı Eğitimi (1 Öğretmen / 1 Öğrenci - Madde 22/4-a)
        if (matchesCourse("BİREYSEL ÇALGI") || matchesCourse("BIREYSEL CALGI") || matchesCourse("ÇALGI EĞİTİMİ") || matchesCourse("CALGI EGITIMI")) {
            const count = Math.max(1, parseInt(studentCount, 10) || 1);
            const load = baseHours * count;
            return {
                groupCount: count,
                calculatedLoad: load,
                note: `Bireysel Çalgı (1'e 1 - Md. 22/4-a): ${count} öğrenci x ${baseHours} saat = ${load}s yük`
            };
        }

        // 2. Güzel Sanatlar Ses Eğitimi (2'şer Kişilik Grup)
        if (matchesCourse("SES EĞİTİMİ") || matchesCourse("SES EGITIMI")) {
            const groups = Math.max(1, Math.ceil(studentCount / 2));
            return {
                groupCount: groups,
                calculatedLoad: baseHours * groups,
                note: `Ses Eğitimi (2'li Grup): ${groups} grup x ${baseHours} saat = ${baseHours * groups}s yük`
            };
        }

        // 3. Anadolu İmam Hatip Lisesi Kur'an-ı Kerim 25+ Kuralı
        if ((matchesCourse("KUR'AN") || matchesCourse("KURAN")) && !matchesCourse("ANLAM")) {
            if (studentCount > 25) {
                return {
                    groupCount: 2,
                    calculatedLoad: baseHours * 2,
                    note: `Kur'an-ı Kerim (25+ Mevcut): 2 grup x ${baseHours} saat = ${baseHours * 2}s yük`
                };
            }
        }

        // 4. Mesleki ve Teknik SADECE Uygulamalı / Atölye / Laboratuvar Dersleri (OÖKY Md. 100 & Norm Yön. Md. 22/1-ç)
        const isTrueAtolye = matchesCourse("ATÖLYE") ||
                             matchesCourse("ATOLYE") ||
                             matchesCourse("LABORATUVAR") ||
                             matchesCourse("UYGULAMALARI") ||
                             matchesCourse("İŞLETMELERDE MESLEKİ EĞİTİM") ||
                             (course.isAtolye === true && !matchesCourse("HUKUK DİLİ") && !matchesCourse("TERMİNOLOJİ"));

        const isVocationalSchool = sType.includes("meslek") || sType.includes("teknik") || schoolType.includes("AMP") || schoolType.includes("ATP");

        if (isTrueAtolye && (isVocationalSchool || course.isAtolye)) {
            const groups = this.calculateWorkshopGroups(studentCount);
            return {
                groupCount: groups,
                calculatedLoad: baseHours * groups,
                note: groups > 1 ? `Atölye/Lab (Md. 22/1-ç): ${studentCount} öğrenci ➔ ${groups} grup x ${baseHours}s = ${baseHours * groups}s yük` : ""
            };
        }

        // Standart Kültür ve Teorik Alan Dersi (1 Grup)
        return {
            groupCount: 1,
            calculatedLoad: baseHours,
            note: ""
        };
    }

    normalizeText(str) {
        let s = String(str || "").toLowerCase();
        s = s.replace(/i̇/g, 'i').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
        s = s.replace(/[\(\)\[\]\.,\/\-]/g, ' ');
        return s.replace(/\s+/g, ' ').trim();
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
     * MEB Norm Kadro Yönetmeliği Madde 18 ve Madde 20 Matematiksel Formülü
     * @param {number} totalHours - Branşın toplam haftalık ders yükü
     * @param {string} schoolType - Okul türü
     * @param {string} branchName - Branş adı
     * @returns {Object} { normCount, formulaExplanation }
     */
    calculateBranchNorm(totalHours, schoolType = "", branchName = "") {
        if (totalHours <= 0) {
            return { normCount: 0, formulaExplanation: "Ders yükü 0 saat." };
        }

        // Genel Ortaöğretim / Mesleki Eğitim (Madde 18) Standart Norm Formülü
        if (totalHours >= 6 && totalHours <= 30) {
            return { normCount: 1, formulaExplanation: `6 - 30 saat arası: 1 Norm Kadro (Fiili Yük: ${totalHours}s)` };
        } else if (totalHours >= 31 && totalHours <= 42) {
            return { normCount: 2, formulaExplanation: `31 - 42 saat arası: 2 Norm Kadro (Fiili Yük: ${totalHours}s)` };
        } else if (totalHours > 42) {
            const extra = totalHours - 42;
            const extraNorm = Math.floor(extra / 21) + (extra % 21 >= 15 ? 1 : 0);
            const total = 2 + extraNorm;
            return { 
                normCount: total, 
                formulaExplanation: `42 saat: 2 Norm + Kalan ${extra} saat için ${extraNorm} Norm (21 saatte bir + 15 saat artık norm) = Toplam ${total} Norm (Fiili Yük: ${totalHours}s)` 
            };
        } else {
            return { normCount: 0, formulaExplanation: `6 saatin altında (${totalHours}s): Norm verilmez.` };
        }
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
        const branchCourseDetails = {};
        const handledMergedPairs = new Set();
        const branchesWithGrade12Vocational = new Set();

        subeler.forEach(sec => {
            const isGrade12 = String(sec.sinifSeviyesi) === "12";
            const allCourses = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
            const studentCount = sec.ogrenciSayisi || 30;

            allCourses.forEach(course => {
                const cName = course.ders || course.ders_adi;
                let assignedBranch = (course.atananBrans !== undefined && course.atananBrans !== null && course.atananBrans !== "") ? course.atananBrans : (course.varsayilanBrans || cName);

                // Branş atanmamışsa (boş bırakılmışsa) norm yükü hesaplamasını atla
                if (!assignedBranch || assignedBranch.trim() === "" || assignedBranch === "— Branş Atanmadı —" || assignedBranch === "Diğer") {
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

                // Grup / Çalgı / Atölye Katsayısı Hesabı
                const mult = this.evaluateCourseMultiplier(course, studentCount, schoolType);
                const load = mult.calculatedLoad;

                if (!branchLoadMap[assignedBranch]) {
                    branchLoadMap[assignedBranch] = 0;
                    branchCourseDetails[assignedBranch] = [];
                }

                branchLoadMap[assignedBranch] += load;
                branchCourseDetails[assignedBranch].push({
                    sectionName: sec.subeAdi,
                    courseName: cName,
                    baseHours: course.saat || course.ders_saati || 0,
                    calculatedLoad: load,
                    note: mult.note
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
                if (!branchLoadMap[branchName]) {
                    branchLoadMap[branchName] = 0;
                    branchCourseDetails[branchName] = [];
                }
                branchLoadMap[branchName] += coordHours;
                branchCoordinatorMap[branchName] = coordHours;

                branchCourseDetails[branchName].push({
                    sectionName: isMesem ? "Tüm Sınıflar Çıraklık" : "12. Sınıf Staj",
                    courseName: "İşletmelerde Mesleki Eğitim",
                    baseHours: coordHours,
                    calculatedLoad: coordHours,
                    note: coordNote,
                    isCoordinator: true
                });
            }
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

            // Kullanıcı Talimatı: Ders yükü 0 olan branşlar sağ panel norm listesinde görünmesin
            if (totalHours <= 0) {
                return;
            }

            const normCalc = this.calculateBranchNorm(totalHours, schoolType, branchName);
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
                diff,
                statusText,
                statusType,
                statusBadge,
                formulaExplanation: normCalc.formulaExplanation,
                courses: branchCourseDetails[branchName] || []
            });
        });

        // Ders yükü yüksek olandan düşüğe göre sırala
        branchReport.sort((a, b) => b.totalHours - a.totalHours || b.calculatedNorm - a.calculatedNorm);

        let grandTotalHours = branchReport.reduce((s, b) => s + (b.totalHours || 0), 0);
        let totalStudents = subeler.reduce((sum, s) => sum + (parseInt(s.ogrenciSayisi, 10) || 0), 0);

        // Yönetici / İdareci Norm Kadro Hesabı (Madde 5 - 14)
        const adminNorms = this.calculateAdminNorms(schoolType, totalStudents, coordinatorHoursMap?.adminOptions || {});

        return {
            branchReport,
            totalHours: grandTotalHours,
            totalCalculatedNorm,
            totalCurrentTeachers,
            totalSurplus,
            totalNeeded,
            totalStudents,
            adminNorms
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
    calculateAdminNorms(schoolType = "", totalStudents = 0, options = {}) {
        const sType = String(schoolType || "").toLowerCase();
        const isMesem = sType.includes("mesleki_egitim_merkezi") || sType.includes("mesem");
        const isAnaokulu = sType.includes("anaokulu") || sType.includes("okul_oncesi");
        const isIlkokul = sType.includes("ilkokul");
        const isOzelEgitim = sType.includes("ozel_egitim");
        const isBirlestirilmis = !!options.isBirlestirilmis;

        const count = parseInt(totalStudents, 10) || 0;
        const explanations = [];

        // 1. Müdür Normu (Madde 5)
        let mudurNorm = 1;
        if (isBirlestirilmis) {
            mudurNorm = 0;
            explanations.push("Birleştirilmiş sınıflı ilkokul: Müdür normu verilmez (Müdür Yetkili Öğretmen görevlendirilir - Md. 5/1 & Md. 22/5).");
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

        if (options.isPansiyonlu) {
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

        // 5. Müdür Başyardımcısı Normu (Madde 6)
        let mudurBasYrd = 0;
        if (options.isPansiyonlu) {
            mudurBasYrd = 1;
            explanations.push("Yatılı/Pansiyonlu Kurum: 1 Müdür Başyardımcısı normu (Md. 6/1-a).");
        } else if (totalMdrYrd >= 6) {
            mudurBasYrd = 1;
            explanations.push("Müdür Yardımcısı sayısı 6 olan kurum: 1 Müdür Başyardımcısı normu (Md. 6/1-b).");
        }

        const grandTotal = mudurNorm + mudurBasYrd + totalMdrYrd;

        return {
            mudur: mudurNorm,
            mudurBasyardimcisi: mudurBasYrd,
            mudurYardimcisiBase: baseMdrYrd,
            mudurYardimcisiExtra: extraMdrYrd,
            mudurYardimcisiTotal: totalMdrYrd,
            toplamYonetici: grandTotal,
            explanations: explanations
        };
    }
}

export const normEngine = new NormEngine();


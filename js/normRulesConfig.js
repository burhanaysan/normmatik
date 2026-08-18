/**
 * NormMatik™ — Parametrik MEB Norm Kadro Kural Motoru Konfigürasyonu
 * 5846 Sayılı FSEK Korumalı • Mimari: Burhan AYSAN
 * 
 * Bu dosya; MEB Norm Kadro Yönetmeliği, TTKB Haftalık Ders Çizelgeleri ve
 * Türkiye Yüzyılı Maarif Modeli kural baremlerini tek bir merkezden parametrik yönetir.
 * Yönetmelik değiştiğinde sadece bu tablodaki baremler güncellenir.
 */

export const NORM_RULES_CONFIG = {
    metadata: {
        systemName: "NormMatik™ Parametrik Kural Motoru",
        version: "2026.1.0",
        releaseDate: "2026-08-19",
        legislationTitle: "Millî Eğitim Bakanlığına Bağlı Eğitim Kurumları Yönetici ve Öğretmenlerinin Norm Kadrolarına İlişkin Yönetmelik",
        legislationGazetteDate: "18.06.2014 / 29034",
        latestAmendment: "Resmî Gazete 2024 / TTKB Maarif Modeli Kademeli Geçiş",
        developer: "Burhan AYSAN"
    },

    // 1. GENEL BİLGİ VE MESLEK DERSLERİ BAREMLERİ (Yönetmelik Madde 18 - 20)
    generalCourseLoadRules: {
        minHoursForFirstNorm: 6,      // 6-30 saate kadar: 1 norm
        baseIntervalHours: 15,        // Her ilave 15 saat için norm artışı
        secondNormThreshold: 31,      // 31-42 saat arası: 2 norm
        residualHourThreshold: 15,    // 42 saatten sonra her 15 artık saat için +1 norm (57 -> 3 norm, 72 -> 4 norm vb.)
        fullLoadWeeklyHours: 21,      // Bir öğretmenin azami maaş+ek ders yükü
        freeHoursForDirector: 6       // Müdürün haftalık girebileceği azami/muaf ders saati
    },

    // 2. MESLEKÎ VE TEKNİK EĞİTİM ATÖLYE VE LABORATUVAR GRUP BAREMLERİ (Madde 22)
    vocationalWorkshopGroupThresholds: {
        grade9: { minStudentsPerGroup: 10, groupInterval: 10 },   // 9. Sınıf: 10-20: 1 grup, 21-30: 2 grup
        grade10: { minStudentsPerGroup: 10, groupInterval: 10 },  // 10. Sınıf
        grade11: { minStudentsPerGroup: 8, groupInterval: 8 },    // 11. Sınıf (Özel dal eğitimi)
        grade12: { minStudentsPerGroup: 8, groupInterval: 8 },    // 12. Sınıf
        specialEducation: { minStudentsPerGroup: 4, groupInterval: 4 } // Özel Eğitim Meslek
    },

    // 3. YÖNETİCİ (İDARECİ) NORM KADRO BAREMLERİ (Madde 5 - 14)
    administrativeNormRules: {
        principalNorm: 1, // Her bağımsız kuruma 1 Müdür
        chiefAssistant: {
            requiredHostel: true, // Pansiyonlu okullarda 1 Müdür Başyardımcısı
            minStudentThreshold: 500
        },
        vicePrincipal: {
            baseNorm: 1, // Her kuruma en az 1 Müdür Yardımcısı
            tiers: [
                { maxStudents: 400, norm: 1 },
                { maxStudents: 800, norm: 2 },
                { maxStudents: 1200, norm: 3 },
                { maxStudents: 1600, norm: 4 },
                { maxStudents: 2000, norm: 5 },
                { maxStudents: 99999, norm: 6 }
            ],
            bonusForHostel: 1,         // Pansiyon varsa +1 İlave Md. Yrd.
            bonusForRevolvingFund: 1,  // Döner Sermaye varsa +1 İlave Md. Yrd.
            bonusForMesemBranch: 1,    // MESEM çırak programı varsa +1 İlave Md. Yrd.
            maxCapTotalVicePrincipals: 7 // Bakanlık Tavan Sınırı
        }
    },

    // 4. REHBERLİK VE PSİKOLOJİK DANIŞMANLIK NORM BAREMLERİ (Madde 21)
    guidanceCounselorRules: {
        generalHighSchool: {
            firstNormThreshold: 150,  // İlk 150 öğrenciye 1 rehberlik normu
            subsequentInterval: 250   // Sonraki her 250 öğrenciye +1 norm
        },
        vocationalSchool: {
            firstNormThreshold: 100,  // Meslek liselerinde ilk 100 öğrenciye 1 norm
            subsequentInterval: 200   // Sonraki her 200 öğrenciye +1 norm
        },
        specialEducation: {
            firstNormThreshold: 20,
            subsequentInterval: 50
        }
    },

    // 5. MESLEKİ EĞİTİM MERKEZİ (MESEM) ÇIRAK BAREMLERİ
    mesemApprenticeRules: {
        apprenticesPerGroup: 40,      // 40 çırağa 1 koordinatörlük/alan normu
        coordinatorMaxHoursPerTeacher: 16 // Öğretmen başına azami koordinatörlük saati
    },

    // 6. KADEMELİ MÜFREDAT VE MAARİF MODELİ GEÇİŞ YÖNETİMİ
    curriculumModelTransitions: {
        activeSeason: "2026-2027",
        maarifModelGrades: ["9", "10"],   // Kademeli Maarif Modeli
        classicModelGrades: ["11", "12"], // Klasik Müfredat
        middleSchoolGrades: ["5", "6", "7", "8"],
        allowCustomElectiveThemes: true
    }
};

if (typeof window !== 'undefined') {
    window.NORM_RULES_CONFIG = NORM_RULES_CONFIG;
}

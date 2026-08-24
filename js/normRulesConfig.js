/**
 * NormMatik™ — Parametrik MEB Norm Kadro Kural Motoru Konfigürasyonu
 * 5846 Sayılı FSEK Korumalı • Mimari: Burhan AYSAN
 *
 * ---------------------------------------------------------------------------
 * BU DOSYA NORMMATİK'İN TEK GERÇEK KAYNAĞIDIR (single source of truth).
 * normEngine.js bu tablodaki baremleri DOĞRUDAN okur. Yönetmelik değiştiğinde
 * SADECE buradaki sayılar güncellenir; motor koduna dokunulmaz.
 *
 * Her barem, dayandığı yönetmelik maddesi ve o maddenin birebir metniyle
 * birlikte yazılmıştır ki ileride doğrulanabilsin.
 *
 * !!! DEĞİŞTİRDİKTEN SONRA MUTLAKA ŞUNU ÇALIŞTIRIN:
 *     python tools/build_bundle.py        (paketi yeniler)
 *     node   tools/test_normEngine.mjs    (mevzuata uygunluğu doğrular)
 * ---------------------------------------------------------------------------
 *
 * ARALIK YAZIM KURALI ("6-31 saate kadar 1"):
 *   Mevzuattaki "A-B'ye kadar" ifadesi  A <= x < B  olarak okunur.
 *   Bu yüzden aşağıdaki tier tablolarında `untilBelow` alanı ÜST SINIRI DIŞLAR.
 *   Örn: { untilBelow: 31, norm: 1 } => 6,7,...,30 saat için 1 norm.
 */

export const NORM_RULES_CONFIG = {
    metadata: {
        systemName: "NormMatik™ Parametrik Kural Motoru",
        version: "2026.2.0",
        releaseDate: "2026-08-22",
        legislationTitle: "Millî Eğitim Bakanlığına Bağlı Eğitim Kurumları Yönetici ve Öğretmenlerinin Norm Kadrolarına İlişkin Yönetmelik",
        legislationGazetteDate: "18.06.2014 / 29034",
        latestAmendment: "Değişik: 17/10/2016-2016/9488 K. • 18/08/2022-31927 R.G.",
        developer: "Burhan AYSAN",
        changeLog: "2026.2.0 — Madde 19 (atölye/lab) normu eklendi; Madde 22/1-ç grup baremleri sınıf seviyesine göre düzeltildi; kaynaştırma hükmü eklendi; config motora fiilen bağlandı."
    },

    /* =====================================================================
     * 1. GENEL BİLGİ VE MESLEK DERSLERİ ÖĞRETMENİ NORMU — MADDE 18/1
     * ---------------------------------------------------------------------
     * "Örgün ve yaygın eğitim kurumlarında, genel bilgi ve meslek dersleri
     *  toplam ders yükü;
     *    a) 6-31 saate kadar 1,
     *    b) 31-42 saate kadar 2,
     *    c) 42'den fazla olması hâlinde her 21 saat için 1,
     *  genel bilgi ve meslek dersleri öğretmeni norm kadrosu verilir. Bu
     *  şekildeki hesaplama sonrasında artan ders yükünün en az 15 saat olması
     *  halinde ilave olarak 1 ... norm kadrosu daha verilir."
     * ===================================================================== */
    generalSubjectNorm: {
        legalRef: "Norm Kadro Yönetmeliği Madde 18/1",
        kadroTitle: "Genel Bilgi ve Meslek Dersleri Öğretmeni",
        minHoursForAnyNorm: 6,          // 6 saatin altında norm verilmez
        tiers: [
            { untilBelow: 31, norm: 1 },   // 6-30 saat  -> 1
            { untilBelow: 42, norm: 2 }    // 31-41 saat -> 2
        ],
        overflow: {
            appliesAboveHours: 42,      // 42 saatten sonrası (42 dâhil 2 normda kalır)
            baseNorm: 2,                // taşma öncesi taban norm
            intervalHours: 21,          // her 21 saat için +1
            residualBonusMinHours: 15   // artan yük >= 15 saat ise +1 daha
        }
    },

    /* =====================================================================
     * 2. ATÖLYE VE LABORATUVAR ÖĞRETMENİ NORMU — MADDE 19/1
     * ---------------------------------------------------------------------
     * (Değişik: 17/10/2016-2016/9488 K.)
     * "Örgün ve yaygın eğitim kurumlarında okutulan atölye ve laboratuvar
     *  dersleri ile işletmelerde meslek eğitimi dersi dâhil toplam ders yükü;
     *    a) 15-41'e kadar 1,
     *    b) 41-81'e kadar 2,
     *    c) 81-121'e kadar 3,
     *    ç) 121-161'e kadar 4,
     *    d) 161-201'e kadar 5,
     *    e) Toplam ders yükünün 201'den fazla olması halinde, her 40 saat
     *       ders yükü için 1,
     *  atölye ve laboratuvar öğretmeni norm kadrosu verilir. Bu şekildeki
     *  hesaplama sonrasında artan ders yükünün en az 20 saat olması hâlinde,
     *  ilave olarak 1 ... norm kadrosu daha verilir."
     *
     * DİKKAT: Bu, Madde 18'den TAMAMEN AYRI bir kadro ve ayrı bir formüldür.
     * Atölye yükünü Madde 18 ile hesaplamak normu yaklaşık iki katına çıkarır.
     * ===================================================================== */
    workshopLabNorm: {
        legalRef: "Norm Kadro Yönetmeliği Madde 19/1",
        kadroTitle: "Atölye ve Laboratuvar Öğretmeni",
        minHoursForAnyNorm: 15,         // 15 saatin altında norm verilmez
        tiers: [
            { untilBelow: 41,  norm: 1 },  // 15-40   -> 1
            { untilBelow: 81,  norm: 2 },  // 41-80   -> 2
            { untilBelow: 121, norm: 3 },  // 81-120  -> 3
            { untilBelow: 161, norm: 4 },  // 121-160 -> 4
            { untilBelow: 201, norm: 5 }   // 161-200 -> 5
        ],
        overflow: {
            appliesAboveHours: 200,     // 201 ve fazlası
            baseNorm: 5,
            intervalHours: 40,          // her 40 saat için +1
            residualBonusMinHours: 20   // artan yük >= 20 saat ise +1 daha
        },
        /**
         * Bir dersin ATÖLYE/LABORATUVAR yüküne mi yoksa GENEL BİLGİ yüküne mi
         * sayılacağını belirleyen ad kalıpları. Ders adı normalize edilip
         * (küçük harf, Türkçe karakter sadeleştirmesi) bu kalıplarla aranır.
         */
        courseNamePatterns: [
            "ATÖLYE",
            "ATOLYE",
            "LABORATUVAR",
            "UYGULAMALARI",
            "İŞLETMELERDE MESLEKİ EĞİTİM",
            "İŞLETMELERDE MESLEK EĞİTİMİ"
        ],
        /** Yukarıdaki kalıplara uysa bile atölye SAYILMAYACAK dersler. */
        courseNameExclusions: [
            "HUKUK DİLİ",
            "TERMİNOLOJİ"
        ]
    },

    /* =====================================================================
     * 3. ATÖLYE/LABORATUVAR GRUP BÖLÜNME BAREMLERİ — MADDE 22/1-ç
     * ---------------------------------------------------------------------
     * "9 uncu sınıfta, 10-21 öğrenciye kadar 1, 21-31 öğrenciye kadar 2,
     *  31'den fazla öğrenci için 3;
     *  10 uncu, 11 inci ve 12 nci sınıflarda, 8-17 öğrenciye kadar 1,
     *  17-25 öğrenciye kadar 2, 25-33 öğrenciye kadar 3, 33 ve daha fazla
     *  öğrenci için 4 grup oluşturulur... bir şubede 4'ten fazla grup
     *  oluşturulamaz. Kaynaştırma yoluyla eğitim gören öğrenci bulunması
     *  hâlinde, bu durumda bulunan en az 2 öğrencinin bulunduğu gruplar ikiye
     *  bölünür. Grup sayısı hiçbir şekilde 5'i geçemez."
     *
     * ÖNCEKİ SÜRÜMDEKİ HATA: grup sayısı sınıf seviyesinden bağımsız tek bir
     * tabloyla hesaplanıyordu; 10-12. sınıflarda sistematik olarak 1 grup
     * eksik, 9. sınıfta 40+ mevcutta 1 grup fazla çıkıyordu.
     * ===================================================================== */
    workshopGroupRules: {
        legalRef: "Norm Kadro Yönetmeliği Madde 22/1-ç",
        grade9: {
            minStudentsToSplit: 10,        // 10 öğrencinin altında bölünme yok
            tiers: [
                { untilBelow: 21, groups: 1 },  // 10-20 -> 1
                { untilBelow: 31, groups: 2 }   // 21-30 -> 2
            ],
            groupsAboveTiers: 3            // 31+ -> 3 (9. sınıf tavanı)
        },
        upperGrades: {                     // 10, 11 ve 12. sınıflar
            appliesToGrades: ["10", "11", "12"],
            minStudentsToSplit: 8,         // 8 öğrencinin altında bölünme yok
            tiers: [
                { untilBelow: 17, groups: 1 },  // 8-16  -> 1
                { untilBelow: 25, groups: 2 },  // 17-24 -> 2
                { untilBelow: 33, groups: 3 }   // 25-32 -> 3
            ],
            groupsAboveTiers: 4            // 33+ -> 4
        },
        /**
         * Kaynaştırma hükmü. Mevzuat "en az 2 kaynaştırma öğrencisi bulunan
         * gruplar ikiye bölünür" diyor. Motor, kaynaştırma öğrencilerinin
         * gruplara eşit dağıldığı varsayımıyla bölünecek grup sayısını
         * floor(kaynastirmaOgrenci / minStudentsPerSplit) olarak hesaplar.
         */
        inclusion: {
            minStudentsPerSplit: 2,        // bir grupta >=2 kaynaştırma öğrencisi
            enabled: true
        },
        absoluteMaxGroups: 5,              // "hiçbir şekilde 5'i geçemez"
        maxGroupsWithoutInclusion: 4       // kaynaştırma yoksa tavan 4
    },

    /* =====================================================================
     * 4. MESLEKİ EĞİTİM MERKEZİ (MESEM) ÇIRAK GRUPLARI — MADDE 22/2
     * ---------------------------------------------------------------------
     * (18/8/2022-31927 R.G.) 10 çıraktan başlayarak her 40 çırak için 1 grup,
     * azami 12 grup. 10'un altında grup oluşturulmaz.
     * Bu barem önceki sürümde de DOĞRU uygulanıyordu.
     * ===================================================================== */
    mesemApprenticeRules: {
        legalRef: "Norm Kadro Yönetmeliği Madde 22/2",
        minApprenticesForFirstGroup: 10,   // 10'un altında grup yok
        firstTierUntilBelow: 41,           // 10-40 -> 1 grup
        intervalApprentices: 40,           // sonraki her 40 çırak -> +1 grup
        maxGroups: 12,                     // 441+ -> 12 (tavan)
        weeklyHoursPerGroup: 32            // grup başına haftalık işletme eğitimi yükü
    },

    /* =====================================================================
     * 5. YÖNETİCİ (İDARECİ) NORM BAREMLERİ — MADDE 5-14
     * ---------------------------------------------------------------------
     * NOT: Bu bölüm henüz motora bağlanmamıştır; calculateAdminNorms() kendi
     * içindeki sabitleri kullanmaktadır. Bir sonraki aşamada buraya taşınacak.
     * O ana kadar buradaki değerleri DEĞİŞTİRMEYİN — etkisi olmaz.
     * ===================================================================== */
    administrativeNormRules: {
        _WARNING: "MOTORA HENÜZ BAĞLI DEĞİL — calculateAdminNorms() kendi sabitlerini kullanıyor.",
        legalRef: "Norm Kadro Yönetmeliği Madde 5-14",
        principalNorm: 1,
        chiefAssistant: {
            requiredHostel: true,
            minStudentThreshold: 500
        },
        vicePrincipal: {
            baseNorm: 1,
            tiers: [
                { maxStudents: 400, norm: 1 },
                { maxStudents: 800, norm: 2 },
                { maxStudents: 1200, norm: 3 },
                { maxStudents: 1600, norm: 4 },
                { maxStudents: 2000, norm: 5 },
                { maxStudents: 99999, norm: 6 }
            ],
            bonusForHostel: 1,
            bonusForRevolvingFund: 1,
            bonusForMesemBranch: 1,
            maxCapTotalVicePrincipals: 7
        }
    },

    /* =====================================================================
     * 6. OKUL REHBERLİK SERVİSİ (REHBER ÖĞRETMEN) NORMU — MADDE 21/2, 21/3
     * ---------------------------------------------------------------------
     * Madde metni (21/2): "Okul rehberlik servislerine;
     *   a) Her derece ve türdeki özel eğitim kurumlarına ... toplam öğrenci
     *      sayısı 25 ve daha fazlası için 1,
     *   b) İlkokullarda öğrenci sayısı 300, ortaokul, imam hatip ortaokulları
     *      ve anaokullarında öğrenci sayısı 150 ve daha fazla olanların her
     *      birine 1,
     *   c) Ortaöğretim kurumlarından öğrenci sayısı 150 ve daha fazla
     *      olanların her birine 1,
     *   ç) Yatılı veya pansiyonlu eğitim kurumlarının öğrenci sayılarına
     *      BAKILMAKSIZIN her birine 1,
     *   d) İlçe merkezindeki ilköğretim ve ortaöğretim kurumlarında öğrenci
     *      sayısının yetersiz olması nedeniyle norm kadro verilememesi
     *      hâlinde öğrenci sayısı en fazla olan eğitim kurumuna 1,
     *   e) Meslekî eğitim merkezlerinden çırak ve kursiyer sayısı 200 ve daha
     *      fazla olanların her birine 1,
     *   rehberlik alan öğretmeni norm kadrosu verilir."
     *
     * Madde 21/3: "Özel eğitim kurumlarında çırak/öğrenci sayısının 100 ve
     * 100'ün katlarına, diğer eğitim kurumlarında ise çırak/öğrenci sayısının
     * 500 ve 500'ün katlarına ulaşması hâlinde her defasında ilave olarak 1
     * rehberlik alan öğretmeni norm kadrosu daha verilir."
     *
     * DİKKAT — 2026-08-23'te kaynak yönetmelikten teyit edildi. Bu dosyadaki
     * ESKİ değerler (mesleki 100+200, genel 150+250, özel eğitim 20+50)
     * YANLIŞTI; hiçbir maddede karşılığı yok. Motora bağlanırken düzeltildi.
     * ===================================================================== */
    guidanceCounselorRules: {
        legalRef: "Norm Kadro Yönetmeliği Madde 21/2 ve 21/3",
        // İlk norm için gereken öğrenci sayısı (kurum türüne göre)
        firstNormThresholds: {
            ozelEgitim: 25,       // Md. 21/2-a
            ilkokul: 300,         // Md. 21/2-b
            ortaokul: 150,        // Md. 21/2-b (imam hatip ortaokulu dâhil)
            anaokulu: 150,        // Md. 21/2-b
            ortaogretim: 150,     // Md. 21/2-c (tüm liseler; MTAL dâhil)
            mesem: 200            // Md. 21/2-e (çırak + kursiyer)
        },
        // Öğrenci sayısına BAKILMAKSIZIN 1 norm veren hâller
        unconditionalFirstNorm: {
            yatiliVeyaPansiyonlu: true,   // Md. 21/2-ç
            ilceEnKalabalikKurum: true    // Md. 21/2-d
        },
        // Md. 21/3 — ilave normlar
        subsequentInterval: {
            ozelEgitim: 100,
            diger: 500
        },
        // Md. 21/4 — norm değil, ATAMA kısıtı. Hesabı etkilemez, not düşülür.
        atamaKisiti: "Özel eğitim kurumları hariç, bir yerleşim merkezindeki her eğitim kurumunda en az 1 rehberlik alan öğretmeni norm kadrosu doldurulmadan ikinci ve müteakip norm kadrolara öğretmen atanamaz (Md. 21/4)."
    },

    /* =====================================================================
     * 7. ÖZEL GRUP KURALLARI (Güzel Sanatlar / İHL)
     * ===================================================================== */
    specialCourseRules: {
        bireyselCalgi: {
            legalRef: "Norm Kadro Yönetmeliği Madde 22/4-a",
            studentsPerGroup: 1          // bire bir eğitim
        },
        sesEgitimi: {
            legalRef: "Norm Kadro Yönetmeliği Madde 22/4",
            studentsPerGroup: 2
        },
        kuraniKerim: {
            legalRef: "Anadolu İmam Hatip Lisesi uygulaması",
            splitAboveStudents: 25,      // 25'ten fazla mevcutta 2 gruba bölünür
            groupsWhenSplit: 2
        }
    },

    /* =====================================================================
     * 8. KADEMELİ MÜFREDAT VE MAARİF MODELİ GEÇİŞİ
     * ===================================================================== */
    curriculumModelTransitions: {
        activeSeason: "2026-2027",
        maarifModelGrades: ["9", "10"],
        classicModelGrades: ["11", "12"],
        middleSchoolGrades: ["5", "6", "7", "8"],
        allowCustomElectiveThemes: true
    }
};

if (typeof window !== 'undefined') {
    window.NORM_RULES_CONFIG = NORM_RULES_CONFIG;
}

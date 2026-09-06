// MEB Norm Kadro ve Ders Yükü Hesaplama Sistemi
// e-Okul Excel (.XLS / .XLSX / HTML-Table) Akıllı İçe Aktarma Motoru (EOkulImporter v1.0)
// %100 Çevrimdışı (Offline), Sıfır Mevcutları Eleyen ve Alanları Otomatik Eşleştiren Çekirdek

export class EOkulImporter {
    constructor(dbService, curriculumEngine) {
        this.db = dbService;
        this.curriculum = curriculumEngine;

        // 69 Meslek Alanı Arama & Normalizasyon Tablosu (DB Canonical Alan ID Eşlemesi)
        this.KNOWN_AREAS = [
            { id: "bilisim", name: "Bilişim Teknolojileri Alanı", keywords: ["bilişim", "bilisim", "yazılım", "ağ işletmenliği"] },
            { id: "elektrik", name: "Elektrik-Elektronik Teknolojisi Alanı", keywords: ["elektrik", "elektronik", "otomasyon"] },
            { id: "makine", name: "Makine ve Tasarım Teknolojisi Alanı", keywords: ["makine", "makina", "cnc", "tasarım teknolojisi"] },
            { id: "motorluarac", name: "Motorlu Araçlar Teknolojisi Alanı", keywords: ["motorlu", "araçlar", "otomotiv", "oto"] },
            { id: "metal", name: "Metal Teknolojisi Alanı", keywords: ["metal", "kaynakçılık", "çelik"] },
            { id: "tesisat", name: "Tesisat Teknolojisi ve İklimlendirme Alanı", keywords: ["tesisat", "iklimlendirme", "soğutma", "ısıtma"] },
            { id: "mobilya", name: "Mobilya ve İç Mekân Tasarımı Alanı", keywords: ["mobilya", "iç mekân", "ic mekan", "dekorasyon", "ahşap"] },
            { id: "yenilenebilir", name: "Yenilenebilir Enerji Teknolojileri Alanı", keywords: ["yenilenebilir", "rüzgar", "güneş", "enerji"] },
            { id: "harita", name: "Harita-Tapu-Kadastro Alanı", keywords: ["harita", "tapu", "kadastro", "jeodezi"] },
            { id: "biyomedikal", name: "Biyomedikal Cihaz Teknolojileri Alanı", keywords: ["biyomedikal", "tıbbi cihaz"] },
            { id: "adalet", name: "Adalet Alanı", keywords: ["adalet", "zabıt", "infaz"] },
            { id: "sh", name: "Aile ve Tüketici Hizmetleri Alanı", keywords: ["aile ve tüketici", "ev ekonomisi", "sosyal hizmet"] },
            { id: "ayakkabipro", name: "Ayakkabı ve Saraciye Teknolojisi Alanı", keywords: ["ayakkabı", "saraciye"] },
            { id: "cocukgelisimi", name: "Çocuk Gelişimi ve Eğitimi Alanı", keywords: ["çocuk gelişimi", "okul öncesi"] },
            { id: "denizcilik", name: "Denizcilik Alanı", keywords: ["denizcilik", "güverte", "gemi yönetimi"] },
            { id: "gida", name: "Gıda Teknolojisi Alanı", keywords: ["gıda", "gıdateknolojisi", "fermantasyon"] },
            { id: "guzellik", name: "Güzellik Hizmetleri Alanı", keywords: ["güzellik", "saç bakım", "kuaförlük"] },
            { id: "halklailiskiler", name: "Halkla İlişkiler ve Organizasyon Alanı", keywords: ["halkla ilişkiler", "tanıtım", "iletişim"] },
            { id: "hasta", name: "Hasta ve Yaşlı Hizmetleri Alanı", keywords: ["hasta ve yaşlı", "yaşlı bakımı"] },
            { id: "hayvanyetistiriciligi", name: "Hayvan Yetiştiriciliği ve Sağlığı Alanı", keywords: ["hayvan yetiştiriciliği", "veteriner"] },
            { id: "insaat", name: "İnşaat Teknolojisi Alanı", keywords: ["inşaat", "yapı", "mimari çizim"] },
            { id: "kimya", name: "Kimya Teknolojisi Alanı", keywords: ["kimya teknolojisi", "kimya", "laboratuvar"] },
            { id: "konaklama", name: "Konaklama ve Seyahat Hizmetleri Alanı", keywords: ["konaklama", "otelcilik", "seyahat", "resepsiyon"] },
            { id: "laboratuvar", name: "Laboratuvar Hizmetleri Alanı", keywords: ["laboratuvar hizmetleri"] },
            { id: "maden", name: "Maden Teknolojisi Alanı", keywords: ["maden", "cevher"] },
            { id: "basim", name: "Basım Teknolojileri Alanı", keywords: ["basım", "matbaa", "baskı öncesi", "ofset"] },
            { id: "moda", name: "Moda Tasarım Teknolojileri Alanı", keywords: ["moda tasarım", "giyim", "hazır giyim"] },
            { id: "muhasebe", name: "Muhasebe ve Finansman Alanı", keywords: ["muhasebe", "finansman", "bilgisayarlı muhasebe"] },
            { id: "pazarlama", name: "Pazarlama ve Perakende Alanı", keywords: ["pazarlama", "perakende", "satış"] },
            { id: "plastiktek", name: "Plastik Teknolojisi Alanı", keywords: ["plastik", "enjeksiyon"] },
            { id: "radyotv", name: "Radyo-Televizyon Alanı", keywords: ["radyo", "televizyon", "kamera", "kurgu"] },
            { id: "saglik", name: "Sağlık Hizmetleri Alanı", keywords: ["sağlık hizmetleri", "hemşire", "ebe"] },
            { id: "tarim", name: "Tarım Alanı", keywords: ["tarım", "ziraat", "bahçe", "peyzaj"] },
            { id: "tekstil", name: "Tekstil Teknolojisi Alanı", keywords: ["tekstil", "dokuma", "iplik"] },
            { id: "ulastirma", name: "Ulaştırma Hizmetleri Alanı", keywords: ["ulaştırma", "lojistik"] },
            { id: "yiyecek", name: "Yiyecek İçecek Hizmetleri Alanı", keywords: ["yiyecek", "içecek", "aşçılık", "mutfak", "servis"] }
        ];
    }

    /**
     * Excel / XLS / XLSX Dosyasını Ayrıştırır
     * @param {ArrayBuffer|Uint8Array} fileBuffer
     * @returns {Object} { schoolSummary, sections, skippedZeros }
     */
    parseExcelData(fileBuffer) {
        if (typeof XLSX === 'undefined') {
            throw new Error("XLSX (SheetJS) motoru yüklenemedi. Lütfen js/xlsx.full.min.js dosyasını kontrol edin.");
        }

        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("Geçersiz Excel dosyası. Sayfa bulunamadı.");
        }

        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (!rawRows || rawRows.length === 0) {
            throw new Error("Excel dosyasında okunabilir veri satırı bulunamadı.");
        }

        return this.processRawRows(rawRows);
    }

    /**
     * Ham Satırları e-Okul Şube Formatına Göre İşler (R076 Dal Bilgili veya R010 İcmal)
     * @param {Array<Array<any>>} rows 
     */
    processRawRows(rows) {
        if (this.isR076RosterReport(rows)) {
            return this.processR076DalRows(rows);
        }
        return this.processR010SummaryRows(rows);
    }

    /**
     * R076 (Dal Bilgili Şube Öğrenci Listesi) Raporunu Tespit Eder
     */
    isR076RosterReport(rows) {
        for (let r = 0; r < Math.min(30, rows.length); r++) {
            const rowStr = (rows[r] || []).join(" ").toUpperCase();
            if (rowStr.includes("ÖĞRENCİ NO") || rowStr.includes("OGRENCI NO") || 
                rowStr.includes("SINIF LİSTESİ") || rowStr.includes("SINIF LISTESI") || 
                rowStr.includes("DAL BİLGİLİ") || rowStr.includes("DAL BILGILI") ||
                (rowStr.includes("S.NO") && rowStr.includes("DALI"))) {
                return true;
            }
        }
        return false;
    }

    /**
     * OOG01001R076 - Şube Listesi (Dal Bilgili) Rapor Ayrıştırıcısı
     */
    processR076DalRows(rows) {
        const parsedSections = [];
        const skippedZeros = [];
        let currentSec = null;

        const flushCurrentSection = () => {
            if (!currentSec) return;
            if (currentSec.studentCount <= 0) {
                skippedZeros.push({
                    raw: currentSec.rawText,
                    grade: currentSec.grade,
                    letter: currentSec.letter,
                    area: currentSec.rawArea,
                    count: 0
                });
                currentSec = null;
                return;
            }

            // En çok öğrencisi olan dalı (baskın dalı) tespit et
            let dominantDal = null;
            let maxCount = 0;
            for (let d in currentSec.dalCounts) {
                if (currentSec.dalCounts[d] > maxCount) {
                    maxCount = currentSec.dalCounts[d];
                    dominantDal = d;
                }
            }

            const matchedArea = this.matchVocationalArea(currentSec.rawArea);
            const isSpecialEdu = currentSec.isSpecialEdu;
            const isSınavlı = currentSec.isSınavlı;

            let finalSubName = `${this.seviyeGorunen(currentSec.grade)}-${currentSec.letter}`;
            if (isSınavlı) {
                finalSubName += matchedArea ? ` (${matchedArea.name.split(' ')[0]} Sınavlı)` : ` (Sınavlı)`;
            } else if (currentSec.rawArea && !isSpecialEdu) {
                finalSubName += ` (${matchedArea ? matchedArea.name.split(' ')[0] : currentSec.rawArea.substring(0, 10)})`;
            } else if (isSpecialEdu) {
                finalSubName += ` (Özel Eğt)`;
            }

            parsedSections.push({
                tempId: "eokul_r076_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
                rawText: currentSec.rawText,
                grade: currentSec.grade,
                letter: currentSec.letter,
                subeAdi: finalSubName,
                studentCount: currentSec.studentCount,
                boysCount: currentSec.boysCount,
                girlsCount: currentSec.girlsCount,
                rawArea: currentSec.rawArea,
                matchedAreaId: isSpecialEdu ? "ozel_egitim" : (matchedArea ? matchedArea.id : null),
                matchedAreaName: isSpecialEdu ? "Özel Eğitim" : (matchedArea ? matchedArea.name : (currentSec.rawArea || null)),
                dalAdi: isSpecialEdu ? "Özel Eğitim Sınıfı" : (dominantDal || null),
                isSınavlı: isSınavlı,
                isSpecialEdu: isSpecialEdu
            });

            currentSec = null;
        };

        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;

            const firstCell = String(row[0] || '').trim();
            if (!firstCell) continue;

            const upperFirst = firstCell.toUpperCase();

            // Şube Başlık Satırı Kontrolü
            if (upperFirst.includes("SINIF /") || upperFirst.includes("SINIF/") || 
                upperFirst.includes("ŞUBESİ") || upperFirst.includes("SUBESI") ||
                upperFirst.includes("SINIF LİSTESİ") || upperFirst.includes("SINIF LISTESI") || 
                upperFirst.includes("SINIF-") || upperFirst.includes("SİNİF-")) {
                
                const gradeMatch = firstCell.match(/(\d{1,2}|Hazırlık)\.?\s*S[ıiİI]n[ıiİI]f/i);
                const letterMatch = firstCell.match(/\/\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9\-]+)\s*Şubes[iİ]/i) || firstCell.match(/\/\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9\-]+)/);
                const areaMatch = firstCell.match(/\((.*?)\)/);

                if (gradeMatch && letterMatch) {
                    flushCurrentSection();

                    let grade = gradeMatch[1];
                    if (String(grade).toLowerCase().includes("haz")) grade = "hazirlik";
                    const letter = letterMatch[1].trim().toUpperCase();
                    let rawArea = areaMatch ? areaMatch[1].trim() : "";
                    if (rawArea.toUpperCase().includes("ALANI YOK")) rawArea = "";

                    const isSınavlı = rawArea.toUpperCase().includes("SINAVLI") || firstCell.toUpperCase().includes("SINAVLI");
                    const isSpecialEdu = rawArea.toUpperCase().includes("ZİHİNSEL") || rawArea.toUpperCase().includes("OTİZM") || 
                                         rawArea.toUpperCase().includes("ENGELLİ") || rawArea.toUpperCase().includes("ÖZEL EĞİTİM") || 
                                         firstCell.toUpperCase().includes("ZİHİNSEL");

                    currentSec = {
                        rawText: firstCell,
                        grade: grade,
                        letter: letter,
                        rawArea: rawArea,
                        isSınavlı: isSınavlı,
                        isSpecialEdu: isSpecialEdu,
                        studentCount: 0,
                        boysCount: 0,
                        girlsCount: 0,
                        dalCounts: {}
                    };
                    continue;
                }
            }

            // Öğrenci Satırı Kontrolü (Col 0 S.No)
            if (currentSec) {
                const sno = row[0];
                const isNumericSno = (typeof sno === 'number' && sno > 0) || 
                                     (typeof sno === 'string' && /^\d+$/.test(sno.trim()) && parseInt(sno.trim(), 10) > 0);
                if (isNumericSno) {
                    currentSec.studentCount++;
                    
                    // Dal hücresini ara (Genellikle Col 10 veya 'DAL YOK' olmayan metin)
                    let dalVal = "";
                    for (let c = 8; c < row.length; c++) {
                        const cellStr = String(row[c] || '').trim();
                        if (cellStr && cellStr.toUpperCase() !== "DAL YOK" && cellStr.toUpperCase() !== "DALI" && isNaN(cellStr)) {
                            dalVal = cellStr;
                            break;
                        }
                    }
                    if (dalVal) {
                        currentSec.dalCounts[dalVal] = (currentSec.dalCounts[dalVal] || 0) + 1;
                    }
                }
            }
        }

        flushCurrentSection();

        return {
            schoolSummary: {
                totalActiveSections: parsedSections.length,
                totalStudents: parsedSections.reduce((s, sec) => s + sec.studentCount, 0),
                totalBoys: parsedSections.reduce((s, sec) => s + sec.boysCount, 0),
                totalGirls: parsedSections.reduce((s, sec) => s + sec.girlsCount, 0),
                skippedZeroCount: skippedZeros.length,
                reportType: "OOG01001R076_DAL_BILGILI",
                grades: [...new Set(parsedSections.map(s => s.grade))]
            },
            sections: parsedSections,
            skippedZeros: skippedZeros
        };
    }

    /**
     * OOG01001R010 - Sınıf Şube Öğrenci Sayıları (İcmal Tablosu) Ayrıştırıcısı
     */
    processR010SummaryRows(rows) {
        const parsedSections = [];
        const skippedZeros = [];
        const letterGroupCount = {};

        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;

            const firstCell = String(row[0] || '').trim();
            if (!firstCell) continue;

            const upperFirst = firstCell.toUpperCase();
            if (upperFirst.includes("SINIF/ŞUBE") || upperFirst.includes("SINIF TOPLAMI") || 
                upperFirst.includes("TOPLAMLAR") || upperFirst.includes("SINIF GENELİNDE TOPLAM") || 
                upperFirst.includes("GENEL TOPLAM") || upperFirst.startsWith("T.C.") || 
                upperFirst.startsWith("MİLLÎ EĞİTİM BAKANLIĞI")) {
                continue;
            }

            // 1. Sınıf Seviyesi Tespiti
            let grade = null;
            if (upperFirst.includes("HAZIRLIK") || upperFirst.includes("HAZ.")) {
                grade = "hazirlik";
            } else {
                const gradeMatch = firstCell.match(/(\d+)\.\s*S[ıiİI]n[ıiİI]f/i) || firstCell.match(/^(\d+)[\-\/\s]/);
                if (gradeMatch) {
                    grade = gradeMatch[1];
                }
            }

            // 2. Şube Harfi / İsmi Tespiti
            let secLetter = "";
            const subeMatch = firstCell.match(/\/\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9\-]+)\s*Şubes[iİ]/i) ||
                              firstCell.match(/\/\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9\-]+)/);
            if (subeMatch) {
                secLetter = subeMatch[1].trim().toUpperCase();
            }

            // 3. Parantez İçi Alan / Dal Bilgisi
            let rawArea = "";
            let isSınavlı = false;
            let isSpecialEdu = false;

            const parenMatch = firstCell.match(/\((.*?)\)$/);
            if (parenMatch) {
                rawArea = parenMatch[1].trim();
                const rawUpper = rawArea.toUpperCase();
                if (rawUpper.includes("SINAVLI")) isSınavlı = true;
                if (rawUpper.includes("ZİHİNSEL") || rawUpper.includes("ENGELLİ") || rawUpper.includes("ÖZEL EĞİTİM")) isSpecialEdu = true;
                if (rawUpper.includes("ALANI YOK")) rawArea = "";
            }

            // 4. Öğrenci Sayısı Tespiti
            let boysCount = 0;
            let girlsCount = 0;
            let totalStudents = 0;

            const numCells = [];
            for (let c = 1; c < row.length; c++) {
                const val = row[c];
                if (typeof val === 'number' || (typeof val === 'string' && val.trim() !== '' && !isNaN(val))) {
                    numCells.push(parseInt(val, 10));
                }
            }

            if (numCells.length >= 3) {
                boysCount = numCells[numCells.length - 3] || 0;
                girlsCount = numCells[numCells.length - 2] || 0;
                totalStudents = numCells[numCells.length - 1] || 0;
            } else if (numCells.length === 1) {
                totalStudents = numCells[0];
            } else if (numCells.length === 2) {
                boysCount = numCells[0];
                girlsCount = numCells[1];
                totalStudents = boysCount + girlsCount;
            }

            if (!grade || !secLetter) continue;

            // 5. 0 Mevcut Filtresi
            if (totalStudents <= 0) {
                skippedZeros.push({
                    raw: firstCell,
                    grade: grade,
                    letter: secLetter,
                    area: rawArea,
                    count: 0
                });
                continue;
            }

            const matchedArea = this.matchVocationalArea(rawArea);
            const groupKey = `${grade}_${secLetter}`;
            letterGroupCount[groupKey] = (letterGroupCount[groupKey] || 0) + 1;

            let finalSubName = `${this.seviyeGorunen(grade)}-${secLetter}`;
            if (isSınavlı) {
                finalSubName += matchedArea ? ` (${matchedArea.name.split(' ')[0]} Sınavlı)` : ` (Sınavlı)`;
            } else if (rawArea && !isSpecialEdu) {
                finalSubName += ` (${matchedArea ? matchedArea.name.split(' ')[0] : rawArea.substring(0, 10)})`;
            } else if (isSpecialEdu) {
                finalSubName += ` (Özel Eğt)`;
            }

            parsedSections.push({
                tempId: "eokul_r010_" + Date.now() + "_" + r + "_" + Math.random().toString(36).substr(2, 4),
                rawText: firstCell,
                grade: grade,
                letter: secLetter,
                subeAdi: finalSubName,
                studentCount: totalStudents,
                boysCount: boysCount,
                girlsCount: girlsCount,
                rawArea: rawArea,
                matchedAreaId: isSpecialEdu ? "ozel_egitim" : (matchedArea ? matchedArea.id : null),
                matchedAreaName: isSpecialEdu ? "Özel Eğitim" : (matchedArea ? matchedArea.name : (rawArea || null)),
                dalAdi: isSpecialEdu ? "Özel Eğitim Sınıfı" : null,
                isSınavlı: isSınavlı,
                isSpecialEdu: isSpecialEdu
            });
        }

        return {
            schoolSummary: {
                totalActiveSections: parsedSections.length,
                totalStudents: parsedSections.reduce((sum, s) => sum + s.studentCount, 0),
                skippedZeroCount: skippedZeros.length,
                reportType: "OOG01001R010_ICMAL",
                grades: [...new Set(parsedSections.map(s => s.grade))]
            },
            sections: parsedSections,
            skippedZeros: skippedZeros
        };
    }

    /**
     * Parantez içindeki alandan Veritabanındaki Alan ID'sini Eşleştirir
     * @param {string} rawAreaText 
     */
    /**
     * Uygulamanın KENDİ alan listesini döndürür (veri tabanından).
     *
     * NEDEN: Aşağıdaki KNOWN_AREAS elle yazılmış 36 alan içerir; veri
     * tabanında 58 alan var. Elle yazılmış listeyle eşleştirme ölçüldüğünde
     * (28.08.2026) 58 alanın yalnızca 35'i doğru eşleşiyordu: 14'ü hiç
     * eşleşmiyor, 9'u YANLIŞ alana gidiyordu.
     */
    getAreaCatalog(schoolType) {
        try {
            const liste = this.db && typeof this.db.getVocationalAreas === "function"
                ? this.db.getVocationalAreas(schoolType || "mesleki_ve_teknik_anadolu_lisesi")
                : [];
            if (liste && liste.length >= 10) return liste;
        } catch (e) { /* aşağıdaki yedeğe düşülür */ }
        // Veri tabanı yüklenmemişse elle yazılmış liste yedek kalır; hiç
        // eşleştirmemektense eksik eşleştirmek yeğdir.
        return this.KNOWN_AREAS.map(a => ({ id: a.id, name: a.name }));
    }

    /**
     * Parantez içindeki alan metnini uygulamanın alan kimliğine eşleştirir.
     *
     * e-Okul, alanı RESMÎ ADIYLA ve büyük harfle yazar:
     *     "(ELEKTRİK-ELEKTRONİK TEKNOLOJİSİ ALANI)"
     *     "(MOBİLYA VE İÇ MEKÂN TASARIMI ALANI)"
     *     "(HARİTA-TAPU-KADASTRO ALANI)"
     * Bu adlar veri tabanındaki adlarla neredeyse birebirdir. Bu yüzden
     * önce TAM AD karşılaştırılır; anahtar kelime tahmini en sona kalır.
     *
     * ESKİ DAVRANIŞ VE HATASI: yalnızca anahtar kelime aranıyordu ve bazı
     * anahtarlar çok kısaydı. "oto" anahtarı "fotograf" kelimesinin içinde
     * geçtiği için "Grafik ve Fotoğraf Alanı" -> "Motorlu Araçlar" olarak
     * eşleşiyordu; o şube grafik yerine otomotiv müfredatı alıyordu.
     * Benzer şekilde "yapı" -> "Gemi Yapımı"nı İnşaat'a, "metal" ->
     * "Metalürji"yi Metal'e gönderiyordu. Ekranda hiçbir uyarı yoktu.
     */
    matchVocationalArea(rawAreaText, schoolType = null) {
        if (!rawAreaText) return null;

        // "(SINAVLI)" gibi ekleri at; alan adının kendisi kalsın.
        const temiz = String(rawAreaText)
            .replace(/\((?:\s*SINAVLI\s*|\s*sınavlı\s*)\)/gi, " ")
            .replace(/\bSINAVLI\b/gi, " ");
        const norm = this.normalizeText(temiz);
        if (!norm) return null;

        const katalog = this.getAreaCatalog(schoolType);

        // 1) Tam ad (normalleştirilmiş) — en güvenilir yol.
        for (const a of katalog) {
            if (this.normalizeText(a.name) === norm) return a;
        }

        // 2) Ad, metnin içinde geçiyor mu? En UZUN eşleşme kazanır; kısa
        //    adların uzun adları gölgelemesini önler ("Metal" / "Metalürji").
        let enIyi = null, enUzun = 0;
        for (const a of katalog) {
            const an = this.normalizeText(a.name);
            if (an.length < 8) continue;
            if (norm.includes(an) || an.includes(norm)) {
                if (an.length > enUzun) { enUzun = an.length; enIyi = a; }
            }
        }
        if (enIyi) return enIyi;

        // 3) Son çare: elle yazılmış anahtar kelimeler. Kısa anahtarlar
        //    (oto, cnc, ebe, yapı...) BİLEREK elenir — hatanın kaynağı onlardı.
        for (const area of this.KNOWN_AREAS) {
            for (const kw of area.keywords) {
                const k = this.normalizeText(kw);
                if (k.length < 6) continue;
                if (norm.includes(k)) {
                    const eslesen = katalog.find(a => a.id === area.id);
                    return eslesen || area;
                }
            }
        }
        return null;
    }

    /**
     * Şube adında sınıf seviyesinin GÖRÜNEN hâli.
     * "hazirlik" iç anahtardır; ekrana "Hazırlık" yazılmalı, yoksa şube adı
     * "hazirlik-A" diye görünür.
     */
    seviyeGorunen(grade) {
        return String(grade).toLowerCase() === "hazirlik" ? "Hazırlık" : String(grade);
    }

    normalizeText(text) {
        if (!text) return "";
        return String(text).toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/İ/g, 'i')
            .replace(/ş/g, 's')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, '');
    }

    /**
     * Ayrıştırılmış Şubeleri Sisteme Aktarır (State'e Yükler)
     * @param {AppStateService} stateService 
     * @param {Array} parsedSections 
     * @param {string} schoolType 
     * @param {boolean} clearExisting 
     */
    applySectionsToState(stateService, parsedSections, schoolType = null, clearExisting = true) {
        stateService.pushHistory();

        if (clearExisting) {
            stateService.state.subeler = [];
            stateService.state.aktifSubeId = null;
        }

        // ------------------------------------------------------------------
        // LİSANS ŞUBE SINIRI
        // Bu yol, deneme sürümünde sınırı en kolay aşan yoldu: tek bir
        // e-Okul dosyası 46 şubeyi birden oluşturuyordu. Sınır kontrolü
        // yalnızca tekli ekleme formunda vardı, burada hiç yoktu.
        //
        // Kırpma, mevcut şubeler TEMİZLENDİKTEN sonra hesaplanır; yoksa
        // "üzerine yaz" seçeneğinde kalan hak yanlış çıkardı.
        // ------------------------------------------------------------------
        if (typeof stateService.subeSiniriniUygula === "function") {
            const verilen = stateService.subeSiniriniUygula(parsedSections.length);
            if (verilen < parsedSections.length) {
                parsedSections = parsedSections.slice(0, Math.max(0, verilen));
            }
            if (parsedSections.length === 0) {
                stateService.notify();
                return { eklenen: 0, sinirAsildi: true };
            }
        }

        const effectiveSchoolType = schoolType || stateService.state.okulBilgisi.okulTuru || "mesleki_ve_teknik_anadolu_lisesi";

        // OKUL TÜRÜ SÜZGECİ
        // Eşleşen alan kimliği, o okul türünün KENDİ listesinde yoksa şubeye
        // yazılmaz. Sebebi: `alanId` dolu olduğunda müfredat motoru meslek
        // dalına giriyor. Bir Anadolu Lisesi şubesine yanlışlıkla meslek alanı
        // yazılsaydı, o şube meslek lisesi gibi hesaplanır ve ekranda hiçbir
        // uyarı çıkmazdı. Özel Program liselerinde de `alanId` TEMA tutar;
        // oraya meslek alanı yazmak aynı sessiz hatayı doğururdu.
        // NOT: getVocationalAreas(), okul türü ne olursa olsun aynı meslek
        // alanı listesini döndürüyor (MESEM ve tema türleri hariç). Bu yüzden
        // "katalogda var mı" sorusu tek başına YETMEZ — ilk yazımda yetmedi ve
        // Anadolu Lisesi şubesine "bilisim" alanı yazılmaya devam etti.
        // Asıl ölçüt, okul türünün alan/tema SEÇİYOR olmasıdır.
        let gecerliAlanlar = null;
        try {
            const turBilgisi = (this.db.getSchoolTypes() || [])
                .find(t => t.id === effectiveSchoolType);
            if (turBilgisi && !turBilgisi.hasAreas) {
                gecerliAlanlar = new Set();          // hiçbir alan kabul edilmez
            } else {
                const katalog = this.getAreaCatalog(effectiveSchoolType) || [];
                if (katalog.length >= 3) gecerliAlanlar = new Set(katalog.map(a => a.id));
            }
        } catch (e) { /* süzgeç kurulamazsa eski davranış sürer */ }

        parsedSections.forEach((sec, idx) => {
            const isSpecialEdu = !!sec.isSpecialEdu;
            let areaId = isSpecialEdu ? "ozel_egitim" : sec.matchedAreaId;
            if (areaId && !isSpecialEdu && gecerliAlanlar && !gecerliAlanlar.has(areaId)) {
                areaId = null;
            }
            const dalAdi = isSpecialEdu ? "Özel Eğitim Sınıfı" : (sec.dalAdi || null);

            // Zorunlu Dersleri Çöz (Dal bilgisi varsa dal müfredatı otomatik çözülür)
            let mandatoryCourses = [];
            let dersHatasi = null;
            if (this.curriculum && typeof this.curriculum.getMandatoryCourses === 'function') {
                try {
                    mandatoryCourses = this.curriculum.getMandatoryCourses(
                        effectiveSchoolType,
                        sec.grade,
                        areaId,
                        dalAdi
                    ) || [];
                } catch (e) {
                    // SESSİZ KALMA: bu şube DERSSİZ kalır, haftalık yükü 0
                    // görünür ve norm olduğundan düşük çıkar. Kullanıcı
                    // aktarım sonunda bunu görmeli. (06.09.2026 sınıflandırması.)
                    console.warn(`Zorunlu dersler çözülemedi (${sec.subeAdi}):`, e);
                    dersHatasi = `⚠️ ${sec.subeAdi} şubesinin zorunlu ders çizelgesi çözülemedi; `
                        + `şube DERSSİZ aktarıldı ve ders yükü 0 görünecek. `
                        + `Şube türünü/alanını kontrol edip dersleri elle ekleyin.`;
                }
            }

            // Dal Uyum Denetimi (MEB Kılavuzunda bu sınıfta bu dal var mı?)
            let dalWarning = dersHatasi || null;
            if (areaId && dalAdi && !isSpecialEdu && this.db && typeof this.db.getBranchesForArea === 'function') {
                const validGradeBranches = this.db.getBranchesForArea(areaId, effectiveSchoolType, sec.grade);
                if (validGradeBranches.length > 0) {
                    const normDal = dalAdi.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const isMatched = validGradeBranches.some(b => b.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normDal) || normDal.includes(b.toLowerCase().replace(/[^a-z0-9]/g, '')));
                    if (!isMatched) {
                        dalWarning = `ℹ️ ${sec.subeAdi} şubesinin e-Okul'daki dalı ("${dalAdi}"), MEB ${sec.grade}. sınıf kılavuzunda yer almadığı için alanın geçerli ${sec.grade}. sınıf müfredatı atanmıştır.`;
                        console.warn(`[e-Okul İçe Aktarım Uyarısı] ${dalWarning}`);
                    }
                }
            }

            const newSection = {
                id: "sube_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substr(2, 4),
                subeAdi: sec.subeAdi,
                sinifSeviyesi: sec.grade,
                ogrenciSayisi: sec.studentCount,
                alanId: areaId,
                dalAdi: dalAdi,
                isSpecialEdu: isSpecialEdu,
                specialEduType: isSpecialEdu ? "hafif_zihinsel" : null,
                zorunluDersler: JSON.parse(JSON.stringify(mandatoryCourses)),
                secmeliDersler: [],
                rehberlikVarMi: sec.grade !== "12" && !isSpecialEdu,
                eOkulWarning: dalWarning
            };

            stateService.sanitizeSection(newSection);
            stateService.state.subeler.push(newSection);
        });

        if (stateService.state.subeler.length > 0 && !stateService.state.aktifSubeId) {
            stateService.state.aktifSubeId = stateService.state.subeler[0].id;
        }

        stateService.notify();
        return stateService.state.subeler;
    }
}

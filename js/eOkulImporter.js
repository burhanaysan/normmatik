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

            let finalSubName = `${currentSec.grade}-${currentSec.letter}`;
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

            let finalSubName = `${grade}-${secLetter}`;
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
    matchVocationalArea(rawAreaText) {
        if (!rawAreaText) return null;
        const norm = this.normalizeText(rawAreaText);

        for (const area of this.KNOWN_AREAS) {
            for (const kw of area.keywords) {
                if (norm.includes(this.normalizeText(kw))) {
                    return area;
                }
            }
        }
        return null;
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

        parsedSections.forEach((sec, idx) => {
            const isSpecialEdu = !!sec.isSpecialEdu;
            const areaId = isSpecialEdu ? "ozel_egitim" : sec.matchedAreaId;
            const dalAdi = isSpecialEdu ? "Özel Eğitim Sınıfı" : (sec.dalAdi || null);

            // Zorunlu Dersleri Çöz (Dal bilgisi varsa dal müfredatı otomatik çözülür)
            let mandatoryCourses = [];
            if (this.curriculum && typeof this.curriculum.getMandatoryCourses === 'function') {
                try {
                    mandatoryCourses = this.curriculum.getMandatoryCourses(
                        effectiveSchoolType,
                        sec.grade,
                        areaId,
                        dalAdi
                    ) || [];
                } catch (e) {
                    console.warn(`Zorunlu dersler çözülemedi (${sec.subeAdi}):`, e);
                }
            }

            // Dal Uyum Denetimi (MEB Kılavuzunda bu sınıfta bu dal var mı?)
            let dalWarning = null;
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

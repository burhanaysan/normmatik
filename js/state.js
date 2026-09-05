// MEB Norm Kadro Uygulaması - Reaktif ve Normalize State Yönetimi
// IndexedDB / LocalStorage Otomatik Kayıt, Sezon Yönetimi ve Geri Al/İleri Al Desteği

export class AppStateService {
    constructor() {
        this.STORAGE_KEY = "MEB_NORM_KADRO_STATE_V1";
        this.LAYOUT_KEY = "MEB_NORM_KADRO_LAYOUT_V1";
        this.state = this.getDefaultState();
        this.layout = this.getDefaultLayout();
        this.history = [JSON.stringify(this.state)];
        this.historyIndex = 0;
        this.listeners = [];
    }

    getDefaultState() {
        return {
            okulBilgisi: {
                okulAdi: "",
                kurumKodu: "",
                il: "",
                ilce: "",
                sezon: "2026-2027",
                okulTuru: null, // "anadolu_lisesi", "mesleki_ve_teknik_anadolu_lisesi" vb.
                okulTuruKilitli: false,
                isDemo: false,
                antet: {
                    ilValiligi: "",
                    ilceMem: "",
                    resmiOkulAdi: "",
                    kurumKodu: "",
                    logoBase64: null,
                    hazirlayanUnvan: "Müdür Yardımcısı",
                    hazirlayanAdSoyad: "",
                    kontrolUnvan: "Müdür Yardımcısı",
                    kontrolAdSoyad: "",
                    onaylayanUnvan: "Okul Müdürü",
                    onaylayanAdSoyad: ""
                },
                adminOptions: {
                    isPansiyonluMdrYrd: false,
                    isPansiyonluBasyrd: false,
                    hasDonerSermaye: false,
                    isTamGunTamYil: false,
                    hasStajyer100Plus: false,
                    hasSigortali500Plus: false,
                    isTasimaMerkezi: false,
                    isBirlestirilmis: false,
                    isKampusIcinde: false,
                    isAyniBinadaKucuk: false,
                    ekSinifOgrencileri: 0,
                    isIlceEnKalabalikKurum: false,
                    mevcutRehberOgretmeni: 0,
                    mevcutIdareciler: { mudur: 0, mudurBasyardimcisi: 0, mudurYardimcisi: 0, rehberOgretmeni: 0 },
                    yoneticiDersYukleri: {}
                }
            },
            subeler: [], // [{ id, subeAdi, sinifSeviyesi, ogrenciSayisi, alanId, dalAdi, zorunluDersler, secmeliDersler, rehberlikVarMi }]
            aktifSubeId: null,
            mevcutOgretmenler: {}, // { "Türk Dili ve Edebiyatı": 4, "Matematik": 3 }
            koordinatorlukYukleri: {}, // { "Bilişim Teknolojileri": 10, "Elektrik-Elektronik Teknolojisi": 10 }
            ozelOkulBranslari: [] // Kullanıcının eklediği özel branşlar
        };
    }

        setLayout(newLayout) {
        this.layout = { ...this.layout, ...newLayout };
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(this.layout));
            }
        } catch (e) {}
    }

    loadLayout() {
        try {
            if (typeof localStorage !== 'undefined') {
                const l = localStorage.getItem(this.LAYOUT_KEY);
                if (l) this.layout = { ...this.getDefaultLayout(), ...JSON.parse(l) };
            }
        } catch (e) {}
        return this.layout;
    }

    getDefaultLayout() {
        return {
            leftWidth: 290,
            rightWidth: 335,
            leftCollapsed: false,
            rightCollapsed: false
        };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify(recordHistory = true) {
        if (recordHistory) {
            this.pushHistory();
        }
        this.saveToStorage();
        this.listeners.forEach(listener => listener(this.state));
    }

    pushHistory() {
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        const currentStr = JSON.stringify(this.state);
        // Aynı state tekrarını kaydetme
        if (this.history.length > 0 && this.history[this.historyIndex] === currentStr) {
            return;
        }
        this.history.push(currentStr);
        if (this.history.length > 30) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.state = JSON.parse(this.history[this.historyIndex]);
            this.notify(false);
            return true;
        }
        return false;
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.state = JSON.parse(this.history[this.historyIndex]);
            this.notify(false);
            return true;
        }
        return false;
    }

    // --- Okul Kurulum & Kilit Mekanizması ---
    setSchoolType(typeId) {
        if (this.state.okulBilgisi.okulTuruKilitli && this.state.okulBilgisi.okulTuru !== typeId) {
            return false;
        }
        this.pushHistory();
        this.state.okulBilgisi.okulTuru = typeId;
        this.state.okulBilgisi.okulTuruKilitli = true;
        this.notify();
        return true;
    }

    resetSchool() {
        this.pushHistory();
        const currentOkul = { ...this.state.okulBilgisi };
        const antet = currentOkul.antet ? { ...currentOkul.antet } : null;
        
        this.state = this.getDefaultState();
        
        // 🔒 KURUM KİMLİĞİ KALICI OLARAK KORUNUR (SIFIRLANAMAZ)
        if (currentOkul.kurumKodu) {
            this.state.okulBilgisi.kurumKodu = currentOkul.kurumKodu;
            this.state.okulBilgisi.okulAdi = currentOkul.okulAdi;
            this.state.okulBilgisi.okulTuru = currentOkul.okulTuru;
            this.state.okulBilgisi.okulTuruKilitli = true;
            this.state.okulBilgisi.il = currentOkul.il || "";
            this.state.okulBilgisi.ilce = currentOkul.ilce || "";
            this.state.okulBilgisi.sezon = currentOkul.sezon || "2026-2027";
            if (antet) {
                this.state.okulBilgisi.antet = antet;
                this.state.okulBilgisi.antet.resmiOkulAdi = currentOkul.okulAdi;
                this.state.okulBilgisi.antet.kurumKodu = currentOkul.kurumKodu;
            }
        }
        
        this.state.subeler = [];
        this.state.aktifSubeId = null;
        this.state.mevcutOgretmenler = {};
        this.state.koordinatorlukYukleri = {};
        this.notify();
    }

    updateSchoolInfo(name, season, kurumKodu, il, ilce) {
        this.pushHistory();
        if (name !== undefined) {
            this.state.okulBilgisi.okulAdi = name;
            if (this.state.okulBilgisi.antet) this.state.okulBilgisi.antet.resmiOkulAdi = name;
        }
        if (season !== undefined) this.state.okulBilgisi.sezon = season;
        if (kurumKodu !== undefined) {
            this.state.okulBilgisi.kurumKodu = kurumKodu;
            if (this.state.okulBilgisi.antet) this.state.okulBilgisi.antet.kurumKodu = kurumKodu;
        }
        if (il !== undefined) {
            this.state.okulBilgisi.il = il;
            if (this.state.okulBilgisi.antet) this.state.okulBilgisi.antet.ilValiligi = il.toUpperCase().includes("VALİLİK") ? il : (il ? `${il.toUpperCase()} VALİLİĞİ` : "");
        }
        if (ilce !== undefined) {
            this.state.okulBilgisi.ilce = ilce;
            if (this.state.okulBilgisi.antet) this.state.okulBilgisi.antet.ilceMem = ilce.toUpperCase().includes("MÜDÜRLÜĞÜ") ? ilce : (ilce ? `${ilce} İlçe Millî Eğitim Müdürlüğü` : "");
        }
        this.notify();
    }

        loadDemoSchool(dbService, curriculumEngine) {
        this.pushHistory();
        // Demo şubelerin dersleri ELLE YAZILMAZ; müfredat motorundan alınır.
        // Daha önce elle yazılıyordu ve motordaki düzeltmeler demo okula
        // ulaşmıyordu (hayalet "Almanca" dersi bu yüzden ekranda kalmıştı).
        const demoDersler = (sinif) => {
            const ce = curriculumEngine || (typeof window !== 'undefined' && window.curriculumEngine);
            const liste = (ce && typeof ce.getMandatoryCourses === 'function')
                ? (ce.getMandatoryCourses("anadolu_lisesi", String(sinif), null, null) || [])
                : [];
            // Kopyalanır: şubede yapılan düzenleme müfredat sabitini bozmasın.
            return liste.map(d => ({
                ders: d.ders,
                saat: d.saat,
                kategori: d.kategori || "ORTAK DERSLER",
                atananBrans: d.atananBrans,
                baraj_ders: !!d.baraj_ders,
                isAtolye: false
            }));
        };

        const demoState = {
            okulBilgisi: {
                okulAdi: "DEMO LİSESİ",
                kurumKodu: "754123",
                il: "ANKARA",
                ilce: "ÇANKAYA",
                sezon: "2026-2027",
                okulTuru: "anadolu_lisesi",
                okulTuruKilitli: true,
                isDemo: true,
                antet: {
                    ilValiligi: "ANKARA VALİLİĞİ",
                    ilceMem: "Çankaya İlçe Millî Eğitim Müdürlüğü",
                    resmiOkulAdi: "DEMO LİSESİ",
                    kurumKodu: "754123",
                    logoBase64: null,
                    hazirlayanUnvan: "Müdür Yardımcısı",
                    hazirlayanAdSoyad: "Ahmet YILMAZ",
                    kontrolUnvan: "Müdür Yardımcısı",
                    kontrolAdSoyad: "Mehmet DEMİR",
                    onaylayanUnvan: "Okul Müdürü",
                    onaylayanAdSoyad: "Burhan AYSAN"
                },
                adminOptions: {
                    isPansiyonluMdrYrd: false,
                    isPansiyonluBasyrd: false,
                    hasDonerSermaye: false,
                    isTamGunTamYil: false,
                    hasStajyer100Plus: false,
                    hasSigortali500Plus: false,
                    isTasimaMerkezi: false,
                    isBirlestirilmis: false,
                    isKampusIcinde: false,
                    isAyniBinadaKucuk: false,
                    ekSinifOgrencileri: 0,
                    isIlceEnKalabalikKurum: false,
                    // Demo okulda idareci ve rehber öğretmen kartları da dolu
                    // görünsün: 10 şube / 300 öğrencilik bir okulun gerçekçi
                    // kadrosu. Boş bırakılırsa o kartlar hep "ihtiyaç" gösterir
                    // ve ürünün o bölümü çalışmıyormuş gibi durur.
                    mevcutRehberOgretmeni: 1,
                    mevcutIdareciler: { mudur: 1, mudurBasyardimcisi: 0, mudurYardimcisi: 2, rehberOgretmeni: 1 },
                    yoneticiDersYukleri: {}
                }
            },
            // ŞUBELER — elle tek tek yazılmaz, üretilir.
            //
            // Demo, ürünün vitrinidir: ziyaretçi "Demo Okulu Deneyin"e basınca
            // gerçek ölçekte bir okul görmelidir. Eskiden her sınıftan TEK şube
            // vardı; normlar hep 0 ya da 1 çıkıyor, tabloda hiç "İhtiyaç"
            // görünmüyordu. Artık 10 şube var (9-A/B/C, 10-A/B/C, 11-A/B,
            // 12-A/B) ve norm tablosu Tam / İhtiyaç / Fazla üçünü birden
            // gösteriyor.
            //
            // SEÇMELİ DERSLERİN ALAN ADLARINA DİKKAT: norm motoru dersi
            // `ders`, saati `saat`, branşı `atananBrans` alanından okur.
            // Eski demo verisi `dersAdi` / `dersSaati` / `ttkbKarsiligi`
            // kullanıyordu; motor bu alanları tanımadığı için demo okulun
            // BÜTÜN seçmeli saatleri norm hesabına hiç girmiyordu. Ekranda
            // hata görünmüyordu, saatler sessizce yok sayılıyordu.
            subeler: (() => {
                const sd = (ders, saat, brans) => ({
                    ders, saat, kategori: "SEÇMELİ DERSLER",
                    atananBrans: brans, isAtolye: false
                });
                const yap = (ad, sinif, secmeliler) => ({
                    id: "sube_demo_" + ad.replace("-", "").toLowerCase(),
                    subeAdi: ad,
                    sinifSeviyesi: String(sinif),
                    ogrenciSayisi: 30,
                    zorunluDersler: demoDersler(sinif),
                    secmeliDersler: secmeliler,
                    rehberlikVarMi: true
                });
                // Seçmeli saatleri bilerek farklı: sol panelde şube rozetleri
                // üç durumu birden göstersin (eksik / tam / fazla).
                // 9. sınıf hedefi 7 saat, 10. sınıf 6, 11. sınıf 20, 12. sınıf 24.
                return [
                    yap("9-A", 9, [
                        sd("Seçmeli Matematik", 2, "Matematik"),
                        sd("Seçmeli Biyoloji", 2, "Biyoloji"),
                        sd("Seçmeli Fizik", 2, "Fizik"),
                        sd("Bilişim Teknolojileri ve Yazılım", 1, "Bilişim Teknolojileri")
                    ]),                                     // 7 -> tam
                    yap("9-B", 9, [
                        sd("Seçmeli Matematik", 2, "Matematik"),
                        sd("Seçmeli Kimya", 2, "Kimya")
                    ]),                                     // 4 -> eksik
                    yap("9-C", 9, [
                        sd("Seçmeli Matematik", 2, "Matematik"),
                        sd("Seçmeli Biyoloji", 2, "Biyoloji"),
                        sd("Seçmeli Fizik", 2, "Fizik"),
                        sd("Seçmeli Kimya", 2, "Kimya")
                    ]),                                     // 8 -> fazla
                    yap("10-A", 10, [
                        sd("Seçmeli Kimya", 2, "Kimya"),
                        sd("Astronomi ve Uzay Bilimleri", 2, "Fizik"),
                        sd("Seçmeli Matematik", 2, "Matematik")
                    ]),                                     // 6 -> tam
                    yap("10-B", 10, [
                        sd("Seçmeli Kimya", 2, "Kimya"),
                        sd("Seçmeli Fizik", 2, "Fizik")
                    ]),                                     // 4 -> eksik
                    yap("10-C", 10, [
                        sd("Seçmeli Matematik", 2, "Matematik"),
                        sd("Seçmeli Biyoloji", 2, "Biyoloji"),
                        sd("Seçmeli Coğrafya", 2, "Coğrafya")
                    ]),                                     // 6 -> tam
                    yap("11-A", 11, [
                        sd("Seçmeli Matematik", 6, "Matematik"),
                        sd("Seçmeli Fizik", 4, "Fizik"),
                        sd("Seçmeli Kimya", 4, "Kimya"),
                        sd("Seçmeli Biyoloji", 4, "Biyoloji"),
                        sd("Seçmeli İngilizce", 2, "İngilizce")
                    ]),                                     // 20 -> tam
                    yap("11-B", 11, [
                        sd("Seçmeli Matematik", 6, "Matematik"),
                        sd("Seçmeli Tarih", 4, "Tarih"),
                        sd("Seçmeli Coğrafya", 4, "Coğrafya"),
                        sd("Seçmeli Türk Dili ve Edebiyatı", 4, "Türk Dili ve Edebiyatı")
                    ]),                                     // 18 -> eksik
                    yap("12-A", 12, [
                        sd("Seçmeli Matematik", 6, "Matematik"),
                        sd("Seçmeli Fizik", 4, "Fizik"),
                        sd("Seçmeli Kimya", 4, "Kimya"),
                        sd("Seçmeli Biyoloji", 4, "Biyoloji"),
                        sd("Seçmeli İngilizce", 4, "İngilizce"),
                        sd("Seçmeli Türk Dili ve Edebiyatı", 2, "Türk Dili ve Edebiyatı")
                    ]),                                     // 24 -> tam
                    yap("12-B", 12, [
                        sd("Seçmeli Matematik", 6, "Matematik"),
                        sd("Seçmeli Tarih", 4, "Tarih"),
                        sd("Seçmeli Coğrafya", 4, "Coğrafya"),
                        sd("Seçmeli Felsefe", 4, "Felsefe"),
                        sd("Seçmeli İngilizce", 4, "İngilizce")
                    ])                                      // 22 -> eksik
                ];
            })(),
            aktifSubeId: "sube_demo_9a",
            // MEVCUT ÖĞRETMEN SAYILARI — bilerek seçildi.
            // Norm tablosu üç durumu da göstersin diye: bazı branşlar Tam,
            // bazıları İhtiyaç, bazıları Fazla çıkar. Sayılar okulun gerçek
            // normlarına göre belirlendi; hiçbir branşa 0 yazılmadı (sıfır
            // öğretmenli bir lise gerçekçi durmaz).
            //
            //   Matematik norm 3, girilen 2  -> 1 İhtiyaç
            //   Türk Dili norm 2, girilen 1  -> 1 İhtiyaç
            //   Tarih / Coğrafya norm 1, girilen 2 -> 1 Fazlalık
            //   gerisi norm kadar            -> Tam
            //
            // Almanca ve Müzik listeden çıkarıldı: müfredatta bu dersler yok,
            // yükleri 0 olduğu için branş tabloda hiç görünmüyordu ve
            // "kayıtlı ama görünmeyen öğretmen" durumu oluşuyordu.
            mevcutOgretmenler: {
                "Matematik": 2,
                "Türk Dili ve Edebiyatı": 1,
                "İngilizce": 2,
                "Tarih": 2,
                "Coğrafya": 2,
                "Fizik": 1,
                "Kimya": 1,
                "Biyoloji": 1,
                "Felsefe": 1,
                "Din Kültürü ve Ahlak Bilgisi": 1,
                "Beden Eğitimi": 1,
                "Görsel Sanatlar": 1,
                "Bilişim Teknolojileri": 1
            },
            koordinatorlukYukleri: {},
            ozelOkulBranslari: []
        };

        this.state = demoState;
        this.notify();
    }

    setAdminOptions(adminOpts) {
        this.pushHistory();
        if (!this.state.okulBilgisi.adminOptions) {
            this.state.okulBilgisi.adminOptions = {};
        }
        this.state.okulBilgisi.adminOptions = { ...this.state.okulBilgisi.adminOptions, ...adminOpts };
        this.notify();
    }

    setOfficialAntet(antetData) {
        this.pushHistory();
        if (!this.state.okulBilgisi.antet) {
            this.state.okulBilgisi.antet = {};
        }
        this.state.okulBilgisi.antet = { ...this.state.okulBilgisi.antet, ...antetData };
        this.notify();
    }

    // --- Sezon Yönetimi (Gelecek Yıla Aktarım & Sınıf Atlatma) ---
    changeSeason(newSeason, migrateData = true) {
        this.pushHistory();
        this.state.okulBilgisi.sezon = newSeason;
        if (!migrateData) {
            this.state.subeler = [];
            this.state.aktifSubeId = null;
        }
        this.notify();
    }

    promoteSectionsToNextSeason(newSeason, curriculumEngine = null) {
        this.pushHistory();
        this.state.okulBilgisi.sezon = newSeason;
        const schoolType = this.state.okulBilgisi.okulTuru || "anadolu_lisesi";
        const curEngine = curriculumEngine || (typeof window !== 'undefined' ? window.curriculumEngine : null);

        const GRADE_MAP = {
            "hazirlik": "9",
            "9": "10",
            "10": "11",
            "11": "12",
            "12": "GRADUATED",
            "5": "6",
            "6": "7",
            "7": "8",
            "8": "GRADUATED",
            "1": "2",
            "2": "3",
            "3": "4",
            "4": "5"
        };

        const promotedSections = [];

        this.state.subeler.forEach(sec => {
            const currentGrade = String(sec.sinifSeviyesi || "9").toLowerCase();
            const nextGrade = GRADE_MAP[currentGrade];

            // Mezun olan sınıfları atla
            if (!nextGrade || nextGrade === "GRADUATED") {
                return;
            }

            // Şube Adı Uyarlaması (Örn: 9-A -> 10-A, 10-A Bilişim -> 11-A Bilişim)
            let newName = sec.subeAdi;
            if (currentGrade === "hazirlik") {
                newName = newName.replace(/hazırlık/gi, "9").replace(/hazirlik/gi, "9").replace(/hz/gi, "9");
            } else {
                const regex = new RegExp(`^${currentGrade}([\\-\\s\\/])`, 'i');
                if (regex.test(newName)) {
                    newName = newName.replace(regex, `${nextGrade}$1`);
                } else {
                    newName = `${nextGrade}-${newName}`;
                }
            }

            // Yeni Sınıfın Resmi Zorunlu Ders Çizelgesini Otomatik Çöz
            let newCourses = sec.zorunluDersler || [];
            if (curEngine && typeof curEngine.getMandatoryCourses === 'function') {
                newCourses = curEngine.getMandatoryCourses(schoolType, nextGrade, sec.alanId, sec.dalAdi);
            }

            promotedSections.push({
                ...sec,
                id: "sube_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
                subeAdi: newName,
                sinifSeviyesi: nextGrade,
                zorunluDersler: newCourses,
                secmeliDersler: [], // Yeni sezon seçmeli dersleri okul yönetimi tarafından manuel belirlenir
                rehberlikVarMi: nextGrade !== "12"
            });
        });

        this.state.subeler = promotedSections;
        this.state.aktifSubeId = promotedSections[0]?.id || null;
        this.notify();
        return promotedSections;
    }

    // --- Layout Yönetimi ---
    setLayout(updates) {
        Object.assign(this.layout, updates);
        try {
            localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(this.layout));
        } catch (e) {}
    }

    loadLayout() {
        try {
            const data = localStorage.getItem(this.LAYOUT_KEY);
            if (data) {
                this.layout = JSON.parse(data);
            }
        } catch (e) {}
        return this.layout;
    }

    // --- Şube Yönetimi ---
    addSection(sectionData) {
        this.pushHistory();
        // Lisans şube sınırı — bkz. subeSiniriniUygula()
        if (this.subeSiniriniUygula(1) < 1) return null;

        const newId = "sube_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
        const isSpecialEdu = !!sectionData.isSpecialEdu;
        const section = {
            id: newId,
            subeAdi: sectionData.subeAdi || "9-A",
            sinifSeviyesi: sectionData.sinifSeviyesi || "9",
            ogrenciSayisi: parseInt(sectionData.ogrenciSayisi || 30, 10),
            alanId: sectionData.alanId || null,
            dalAdi: sectionData.dalAdi || null,
            isSpecialEdu: isSpecialEdu,
            specialEduType: sectionData.specialEduType || null,
            zorunluDersler: sectionData.zorunluDersler || [],
            secmeliDersler: sectionData.secmeliDersler || [],
            rehberlikVarMi: sectionData.rehberlikVarMi !== false && !isSpecialEdu
        };
        this.sanitizeSection(section);
        this.state.subeler.push(section);
        this.state.aktifSubeId = newId;
        this.notify();
        return section;
    }

    addBulkSections(level, count, studentCountPerSection, defaultZorunluDersler = []) {
        // Lisans şube sınırı: istenen sayı kırpılır, hiç hak yoksa
        // işlem başlamadan çıkılır (boş geçmiş kaydı da oluşmaz).
        count = this.subeSiniriniUygula(parseInt(count, 10) || 0);
        if (count < 1) return;

        this.pushHistory();
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "P"];
        const levelPrefix = String(level).toLowerCase() === "hazirlik" ? "Hazırlık" : level;
        for (let i = 0; i < count; i++) {
            const letter = letters[i] || `${i + 1}`;
            const subeAdi = `${levelPrefix}-${letter}`;
            const newId = "sube_" + Date.now() + "_" + i + "_" + Math.random().toString(36).substr(2, 4);
            
            const section = {
                id: newId,
                subeAdi: subeAdi,
                sinifSeviyesi: level,
                ogrenciSayisi: parseInt(studentCountPerSection || 30, 10),
                alanId: null,
                dalAdi: null,
                zorunluDersler: JSON.parse(JSON.stringify(defaultZorunluDersler)),
                secmeliDersler: [],
                rehberlikVarMi: level !== "12"
            };
            this.sanitizeSection(section);
            this.state.subeler.push(section);
            if (i === 0 && !this.state.aktifSubeId) {
                this.state.aktifSubeId = newId;
            }
        }
        this.notify();
    }

    // ======================================================================
    //  LİSANS ŞUBE SINIRI — MERKEZÎ BEKÇİ
    // ======================================================================
    // 2026-08-24'te bulunan açık: şube sınırı YALNIZCA tekli ekleme
    // formunda (uiComponents.js:871) kontrol ediliyordu. Şube ekleyen
    // diğer BEŞ yol sınırı hiç sormuyordu:
    //
    //     çoklu şube ekleme · e-Okul Excel aktarımı · şube kopyalama
    //     şube bölme · sınıf yükseltme
    //
    // Sonuç: deneme sürümüyle 46 şube oluşturulabiliyordu. Ücretsiz
    // sürümün 3 şube sınırı fiilen yoktu; okul lisans almadan işini
    // bitirebiliyordu.
    //
    // Sınır artık arayüzde değil, şubelerin eklendiği bu katmanda
    // uygulanıyor. Böylece ileride yeni bir ekleme yolu yazılırsa o da
    // kendiliğinden kapsanır — kontrolü eklemeyi unutmak mümkün değil.
    //
    // NOT: Bu bir GELİR koruması, güvenlik önlemi değildir. Tarayıcıdaki
    // hiçbir kontrol kararlı birini durduramaz; amaç sıradan kullanımda
    // ücretsiz sürümün iş görmesini engellemektir. Veriye erişim zaten
    // sunucudaki kurallarla korunuyor.
    // ======================================================================

    /** Kaç şube daha eklenebilir? Sınırsızsa Infinity döner. */
    kalanSubeHakki() {
        const lm = (typeof window !== "undefined") ? window.licenseManager : null;
        const durum = lm && lm.licenseStatus;
        if (!durum) return Infinity;
        if (durum.isMaster || durum.maxSections === -1) return Infinity;
        const tavan = parseInt(durum.maxSections, 10);
        if (!Number.isFinite(tavan) || tavan < 0) return Infinity;
        return Math.max(0, tavan - (this.state.subeler || []).length);
    }

    /**
     * İstenen sayıda şube eklenebilir mi? Eklenebilecek sayıyı döndürür.
     * Sınıra takılırsa kullanıcıya bir kez uyarı gösterilir.
     */
    subeSiniriniUygula(istenen = 1, sessiz = false) {
        const kalan = this.kalanSubeHakki();
        if (kalan === Infinity) return istenen;
        const verilebilir = Math.min(istenen, kalan);
        if (verilebilir < istenen && !sessiz) {
            this._sinirUyarisi(istenen - verilebilir);
        }
        return verilebilir;
    }

    _sinirUyarisi(reddedilen) {
        const lm = (typeof window !== "undefined") ? window.licenseManager : null;
        const tavan = (lm && lm.licenseStatus) ? lm.licenseStatus.maxSections : 3;
        try {
            if (typeof window !== "undefined" && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent("normmatik-sube-siniri", {
                    detail: { tavan, reddedilen }
                }));
            }
        } catch (e) { /* olay yayınlanamazsa akış bozulmaz */ }
    }

    // =====================================================================
    // DEMO KİLİDİ
    // =====================================================================
    // Demo sürümü, ürünü denemek içindir; bir okulun norm çalışmasını
    // ücretsiz yapmak için değil. Demo okul 10 şubeyle açıldığı için
    // (vitrin amaçlı) bu ayrım net bir kurala bağlandı:
    //
    //   • İlk 3 şube serbestçe düzenlenir  (demo lisansının şube hakkı)
    //   • 4. şubeden sonrası KİLİTLİ       (kilit işareti + lisans uyarısı)
    //   • Seçmeli dersler demo boyunca değiştirilemez: liste görünür,
    //     ekleme ve silme kapalı
    //
    // Kilit ARAYÜZDE DEĞİL BURADA uygulanır. Yalnızca düğmeyi gizlemek
    // koruma değildir; veriyi değiştiren her yol aynı kapıdan geçmelidir.
    // (Bu, istemci tarafındaki lisans denetiminin tümüyle aşılamaz olduğu
    // anlamına gelmez — o ayrı bir açık iş — ama kilit en azından tek ve
    // tutarlı bir yerde durur.)

    _demoKisiti() {
        const lm = (typeof window !== 'undefined') ? window.licenseManager : null;
        const d = lm && lm.licenseStatus;
        if (!d || !d.isDemo || d.isMaster) return null;
        return { serbestSube: Math.max(0, parseInt(d.maxSections, 10) || 0) };
    }

    /** Bu şube demo kilidinin arkasında mı? (ilk N şube serbest) */
    subeKilitliMi(sectionId) {
        const k = this._demoKisiti();
        if (!k) return false;
        const i = (this.state.subeler || []).findIndex(s => s.id === sectionId);
        return i >= 0 && i >= k.serbestSube;
    }

    /** Demoda seçmeli ders listesi salt okunurdur. */
    secmeliDersDegistirilebilirMi() {
        return this._demoKisiti() === null;
    }

    /** Reddi kullanıcıya duyurur; arayüz bunu bildirim olarak gösterir. */
    _kilitUyar(mesaj) {
        try {
            if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent === 'function') {
                window.dispatchEvent(new CustomEvent("normmatik:demo-kilit", { detail: { mesaj } }));
            }
        } catch (e) {}
        return false;
    }

    _subeKilidiniDenetle(sectionId) {
        if (!this.subeKilitliMi(sectionId)) return true;
        const k = this._demoKisiti();
        return this._kilitUyar(
            `Bu şube demo sürümünde kilitlidir. Demo sürümde ilk ${k.serbestSube} şube ` +
            `üzerinde çalışabilirsiniz; diğerleri yalnızca örnek olarak gösterilir. ` +
            `Değişiklik yapmak için lisans almanız gerekir.`);
    }

    _secmeliKilidiniDenetle() {
        if (this.secmeliDersDegistirilebilirMi()) return true;
        return this._kilitUyar(
            "Seçmeli ders listesi demo sürümünde değiştirilemez. Mevcut seçmeli " +
            "dersleri görebilirsiniz; ekleme ve çıkarma için lisans almanız gerekir.");
    }

    updateSection(sectionId, updates) {
        if (!this._subeKilidiniDenetle(sectionId)) return;
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return null;

        this.pushHistory();
        Object.assign(sec, updates);
        this.sanitizeSection(sec);
        this.notify();
        return sec;
    }

    deleteSection(sectionId) {
        if (!this._subeKilidiniDenetle(sectionId)) return;
        this.pushHistory();
        this.state.subeler = this.state.subeler.filter(s => s.id !== sectionId);
        if (this.state.aktifSubeId === sectionId) {
            this.state.aktifSubeId = this.state.subeler.length > 0 ? this.state.subeler[0].id : null;
        }
        this.notify();
    }

    duplicateSection(sectionId) {
        if (!this._subeKilidiniDenetle(sectionId)) return;
        const source = this.state.subeler.find(s => s.id === sectionId);
        if (!source) return;
        if (this.subeSiniriniUygula(1) < 1) return;   // lisans şube sınırı

        this.pushHistory();
        const newId = "sube_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
        const cloned = JSON.parse(JSON.stringify(source));
        cloned.id = newId;
        cloned.subeAdi = source.subeAdi + " (Kopya)";

        this.state.subeler.push(cloned);
        this.state.aktifSubeId = newId;
        this.notify();
    }

    // --- Sınıf / Şube Bölme & Şube Çoğaltma Sistemi (Section Splitting Engine) ---
    splitSection(sourceSectionId, splitPlan) {
        if (!this._subeKilidiniDenetle(sourceSectionId)) return;
        const sourceIndex = this.state.subeler.findIndex(s => s.id === sourceSectionId);
        if (sourceIndex === -1) return null;
        const source = this.state.subeler[sourceIndex];

        // Lisans şube sınırı: bölme de yeni şube ÜRETİR. Hak yetmiyorsa
        // plan kırpılır; hiç hak yoksa bölme yapılmaz (ana şubenin mevcudu
        // da değiştirilmez, yoksa öğrenciler yok olurdu).
        const istenen = (splitPlan.newSections || []).length;
        const verilen = this.subeSiniriniUygula(istenen);
        if (verilen < 1) return null;
        if (verilen < istenen) {
            splitPlan = { ...splitPlan,
                          newSections: (splitPlan.newSections || []).slice(0, verilen) };
        }

        this.pushHistory();

        // 1. Ana şube mevcudunu güncelle
        source.ogrenciSayisi = parseInt(splitPlan.sourceStudents || Math.ceil(source.ogrenciSayisi / 2), 10);
        if (splitPlan.sourceDalAdi !== undefined) {
            source.dalAdi = splitPlan.sourceDalAdi;
        }

        // 2. Yeni şubeleri üret
        const createdSections = [];
        const newSectionsList = splitPlan.newSections || [];

        newSectionsList.forEach((plan, idx) => {
            const newId = "sube_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substr(2, 4);
            const cloned = JSON.parse(JSON.stringify(source));
            cloned.id = newId;
            cloned.subeAdi = plan.subeAdi;
            cloned.ogrenciSayisi = parseInt(plan.ogrenciSayisi || 20, 10);
            if (plan.dalAdi !== undefined) {
                cloned.dalAdi = plan.dalAdi;
            }

            // Seçmeli dersleri aktarma seçeneği
            if (splitPlan.copyElectives === false) {
                cloned.secmeliDersler = [];
            }

            // Birleştirilmiş şubeler bağını temizle
            if (Array.isArray(cloned.zorunluDersler)) {
                cloned.zorunluDersler.forEach(d => { delete d.birlesikSubeler; });
            }
            if (Array.isArray(cloned.secmeliDersler)) {
                cloned.secmeliDersler.forEach(d => { delete d.birlesikSubeler; });
            }

            this.sanitizeSection(cloned);
            // Ana şubenin hemen ardına yerleştir
            this.state.subeler.splice(sourceIndex + 1 + idx, 0, cloned);
            createdSections.push(cloned);
        });

        this.notify();
        return { source, createdSections };
    }

    getNextAvailableSectionLetter(gradeLevel) {
        const prefix = String(gradeLevel).toLowerCase() === "hazirlik" ? "Hazırlık" : gradeLevel;
        const existingNames = this.state.subeler
            .filter(s => s.sinifSeviyesi === gradeLevel)
            .map(s => s.subeAdi.trim().toUpperCase());
        
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "V", "Y", "Z"];
        for (const letter of letters) {
            const candidate1 = `${prefix}-${letter}`.toUpperCase();
            const candidate2 = `${gradeLevel}-${letter}`.toUpperCase();
            if (!existingNames.includes(candidate1) && !existingNames.includes(candidate2)) {
                return letter;
            }
        }
        return `${existingNames.length + 1}`;
    }

    setActiveSection(sectionId) {
        this.state.aktifSubeId = sectionId;
        this.notify();
    }

    getActiveSection() {
        const sec = this.state.subeler.find(s => s.id === this.state.aktifSubeId) || (this.state.subeler.length > 0 ? this.state.subeler[0] : null);
        if (sec) {
            this.sanitizeSection(sec);
        }
        return sec;
    }

    sanitizeSection(sec) {
        if (!sec) return;
        if (!Array.isArray(sec.zorunluDersler)) sec.zorunluDersler = [];
        if (!Array.isArray(sec.secmeliDersler)) sec.secmeliDersler = [];

        const normalizeName = (text) => {
            if (!text) return "";
            return String(text).trim().toLowerCase()
                .replace(/ı/g, 'i')
                .replace(/İ/g, 'i')
                .replace(/ş/g, 's')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9]/g, '');
        };

        const INVALID_NAMES = new Set([
            'ders', 'dersler', 'derskategorileri', 'kategorileri', 'toplam', 'toplamderssaati',
            'meslekderssaatitoplami', 'secmelimeslekderssaatitoplami', 'secmeliderssaatitoplami',
            'derssaatitoplami', 'dersinadi', 'alanortakdersleri', 'daldersleri'
        ]);

        const isInvalidCourse = (name) => {
            const norm = normalizeName(name);
            if (!norm || norm.length < 3 || INVALID_NAMES.has(norm)) return true;
            if (norm.endsWith('toplami') || norm.startsWith('toplam')) return true;
            return false;
        };
        
        // 1. Yazım hatalarını düzelt ve bozuk satırları temizle
        sec.zorunluDersler = sec.zorunluDersler.filter(d => {
            let name = (d.ders || d.ders_adi || "").trim();
            if (isInvalidCourse(name)) return false;
            name = name.replace(/MESLEK[İI]{2,}\s*GEL[İIİIŞS]+[İIM]+\s*AT[ÖO]LYE[SİI]*/gi, "MESLEKİ GELİŞİM ATÖLYESİ");
            name = name.replace(/MESLEK[İI]{2,}\s*KLAVYE\s*UYGULAMALARI/gi, "MESLEKİ KLAVYE UYGULAMALARI");
            name = name.replace(/MESLEK[İI]{2,}/gi, "MESLEKİ");
            d.ders = name;
            if (d.ders_adi) d.ders_adi = name;
            return true;
        });

        // 2. Mükerrer Rehberlik derslerini teke indir
        //
        // BURADA ESKİDEN "12. SINIFSA TAMAMEN KALDIR" KURALI VARDI ve YANLIŞTI.
        // Resmî çizelgelerle karşılaştırıldı (28.08.2026): elimizdeki 16
        // ortaöğretim çizelgesinin HEPSİ 12. sınıfta Rehberlik ve Yönlendirme
        // dersini 1 saat olarak veriyor — istisna yok. Özel Eğitim Meslek
        // Okulu çizelgesi de öyle. Kural muhtemelen eski çizelgelerden kalmıştı
        // (rehberlik 9-11'de vardı, 12'de yoktu) ve 2024 Maarif Modeli
        // çizelgeleriyle sessizce yanlışa döndü.
        //
        // Etkisi: her 12. sınıf şubesinde 1 saat, okulun toplam yükünden
        // eksik hesaplanıyordu. Ekranda hiçbir uyarı yoktu.
        //
        // Sınıfa göre "bu derste rehberlik var mı" kararını ARTIK BU KOD
        // VERMİYOR; çizelgeyi müfredat motoru okuyor. Bazı çizelgelerde ders
        // gerçekten yok (Spor Lisesi 9, Güzel Sanatlar Görsel 10-11, Sosyal
        // Bilimler 11) ve motor onu zaten getirmiyor.
        // ÇİZELGEYE SOR: bu okul türünün bu sınıfında rehberlik var mı, kaç saat?
        //   { saat }  -> çizelgede VAR, saati budur
        //   null      -> çizelgede YOK, dersi kaldır
        //   undefined -> KARAR VERİLEMEDİ (okul türü seçilmemiş, motor yok,
        //                müfredat boş döndü) -> hiçbir şeye dokunma
        //
        // Son ihtimal önemlidir: motor boş dönerse "çizelgede yok" sanıp
        // idarecinin dersini silmek, sessizce veri kaybettirirdi.
        let cizelgeRehberlik;
        try {
            const motor = (typeof window !== 'undefined' && window.curriculumEngine)
                ? window.curriculumEngine : null;
            const okulTuru = this.state && this.state.okulBilgisi
                ? this.state.okulBilgisi.okulTuru : null;
            if (motor && okulTuru && typeof motor.getMandatoryCourses === 'function') {
                const referans = motor.getMandatoryCourses(
                    okulTuru, sec.sinifSeviyesi, sec.alanId, sec.dalAdi) || [];
                if (referans.length) {
                    const r = referans.find(
                        x => normalizeName(x.ders || "").includes("rehberlik"));
                    cizelgeRehberlik = r ? { saat: r.saat } : null;
                }
            }
        } catch (e) { /* karar verilemedi; dokunulmaz */ }

        let rehberlikSeen = false;
        sec.zorunluDersler = sec.zorunluDersler.filter(d => {
            const norm = normalizeName(d.ders || d.ders_adi || "");
            if (norm.includes("rehberlik")) {
                if (cizelgeRehberlik === null) return false;   // çizelgede yok
                if (rehberlikSeen) return false;
                rehberlikSeen = true;
                d.ders = "Rehberlik ve Yönlendirme";
                // Saat çizelgeden gelir. Eskiden burada koşulsuz `d.saat = 1`
                // vardı; elimizdeki bütün çizelgeler 1 saat dediği için zararı
                // görünmüyordu, ama çizelgeye değil koda bağlıydı.
                if (cizelgeRehberlik && cizelgeRehberlik.saat) {
                    d.saat = cizelgeRehberlik.saat;
                } else if (!d.saat) {
                    d.saat = 1;
                }
                d.kategori = "ORTAK DERSLER";

                // BRANŞ ZORLANMAZ.
                //
                // Burada eskiden koşulsuz `d.atananBrans = "Rehberlik"` vardı.
                // Bu temizlik neredeyse her işlemde çalıştığı için, idarecinin
                // bu derse başka bir branş atamasının HİÇBİR ETKİSİ olmuyordu:
                // seçim uygulanıyor, hemen ardından geri alınıyordu. Ekranda
                // ne hata ne uyarı çıkıyordu; kullanıcı "değişmiyor" diyordu.
                // (Kullanıcı bildirimi, 27.08.2026.)
                //
                // Çizelgenin kendi maddesi de bu dersin tek bir branşa ait
                // olmadığını söylüyor: "Bu ders okutulduğu kurumda görev yapan
                // bütün alan öğretmenleri tarafından okutulur."
                //
                // Artık yalnızca branş BOŞ ya da tanınmayan bir değerse
                // varsayılan yazılır; idarecinin geçerli seçimi korunur.
                // NOT: aşağıdaki `curriculum` değişkeni bu satırdan SONRA
                // tanımlanıyor; buradan ona erişilemez. Motor doğrudan alınır.
                const ce = (typeof window !== 'undefined' && window.curriculumEngine)
                    ? window.curriculumEngine : null;
                const mevcutBrans = String(d.atananBrans || "").trim();
                const gecerliBrans = (mevcutBrans && ce && typeof ce.isKnownBranch === 'function')
                    ? ce.isKnownBranch(mevcutBrans)
                    : !!mevcutBrans;
                if (!gecerliBrans) d.atananBrans = "Rehberlik";
                return true;
            }
            return true;
        });

        // ÇİZELGEDE VAR AMA ŞUBEDE YOK -> EKLE.
        //
        // Yalnızca yeni şubeleri düzeltmek yetmezdi: bu temizlik her yüklemede
        // çalıştığı için, kayıtlı okulların 12. sınıf şubelerinden ders zaten
        // silinmişti ve kendiliğinden geri gelmezdi. Okul, şubeyi elle yeniden
        // kurana kadar 1 saat eksik hesaplanmaya devam ederdi.
        if (cizelgeRehberlik && !rehberlikSeen) {
            sec.zorunluDersler.push({
                ders: "Rehberlik ve Yönlendirme",
                saat: cizelgeRehberlik.saat || 1,
                kategori: "ORTAK DERSLER",
                atananBrans: "Rehberlik",
                baraj_ders: false,
                isAtolye: false
            });
        }

        if (Array.isArray(sec.secmeliDersler)) {
            sec.secmeliDersler = sec.secmeliDersler.filter(d => {
                const norm = normalizeName(d.ders || d.ders_adi || "");
                return !norm.includes("rehberlik") && !isInvalidCourse(d.ders || "");
            });
        }

        // 3. Kanonik Ders ve Branş Standardizasyonu (Çift isim ve sahte branşları temizler)
        const curriculum = (typeof window !== 'undefined' && window.curriculumEngine) ? window.curriculumEngine : null;
        
        const CULTURE_COURSE_KEYS = new Set([
            "turkdiliveedebiyati", "turkedebiyati", "dinkulturuveahlakbilgisi", "dinkulturu", "tarih",
            "tcinkilaptarihiveataturkculuk", "cografya", "matematik", "fizik", "kimya",
            "biyoloji", "felsefe", "ingilizce", "almanca", "yabancidil", "birinciyabancidil",
            "ikinciyabancidil", "bedenegitimivespor", "bedenegitimi", "gorselsanatlar",
            "muzik", "saglikbilgisivetrafikkulturu", "bedenegitimivesporgorselsanatlarmuzik"
        ]);

        const standardizeCourse = (d) => {
            const rawName = (d.ders || d.ders_adi || "").trim();
            const norm = normalizeName(rawName);

            // Kültür / Genel Bilgi dersleri ASLA meslek/atölye dersi olamaz
            if (CULTURE_COURSE_KEYS.has(norm)) {
                d.kategori = "ORTAK DERSLER";
                d.isAtolye = false;
            }

            if (curriculum && typeof curriculum.getCanonicalCourseAndBranch === 'function') {
                const resolved = curriculum.getCanonicalCourseAndBranch(rawName, d.atananBrans, sec.alanId, d.kategori || "ORTAK DERSLER");
                d.ders = resolved.courseName;
                if (d.ders_adi) d.ders_adi = resolved.courseName;
                d.atananBrans = resolved.branchName;
            } else {
                if (norm === "tarih") { d.ders = "Tarih"; d.atananBrans = "Tarih"; }
                else if (norm.includes("inkilap")) { d.ders = "T.C. İnkılap Tarihi ve Atatürkçülük"; d.atananBrans = "Tarih"; }
                else if (norm === "turkdiliveedebiyati" || norm === "turkedebiyati") { d.ders = "Türk Dili ve Edebiyatı"; d.atananBrans = "Türk Dili ve Edebiyatı"; }
                else if (norm.includes("dinkulturu")) { d.ders = "Din Kültürü ve Ahlak Bilgisi"; d.atananBrans = "Din Kültürü ve Ahlak Bilgisi"; }
                // Resmî çizelge bu dersi Sağlık branşının NORMA DAHİL dersleri
                // arasında sayar ("Tüm Liseler"); Biyoloji'nin ve Beden
                // Eğitimi'nin ise norma dahil EDİLMEYEN dersleri arasında.
                // Önceden Biyoloji'ye yazılıyordu.
                else if (norm.includes("saglikbilgisi")) { d.ders = "Sağlık Bilgisi ve Trafik Kültürü"; d.atananBrans = "Sağlık Hizmetleri"; }
                // İlkokul 4. sınıf dersi; çizelgede Beden Eğitimi'nin norma
                // dahil dersidir. Eskiden "trafik" geçen HER ders Sağlık
                // Bilgisi'ne dönüştürülüyordu — Trafik Güvenliği dersinin adı
                // da bu yüzden bozuluyordu.
                else if (norm.includes("trafikguvenligi")) { d.ders = "Trafik Güvenliği"; d.atananBrans = "Beden Eğitimi"; }
                else if (norm.includes("trafik")) { d.ders = "Sağlık Bilgisi ve Trafik Kültürü"; d.atananBrans = "Sağlık Hizmetleri"; }
                else if (norm.includes("yabancidil") || norm === "ingilizce" || norm === "birinciyabancidil") { d.ders = "İngilizce"; d.atananBrans = "İngilizce"; }
                else if (norm === "ikinciyabancidil" || norm === "almanca") { d.ders = "Almanca"; d.atananBrans = "Almanca"; }
            }
        };

        sec.zorunluDersler.forEach(standardizeCourse);
        if (Array.isArray(sec.secmeliDersler)) {
            sec.secmeliDersler.forEach(standardizeCourse);
        }
    }

    updateSectionDetails(sectionId, updates) {
        if (!this._subeKilidiniDenetle(sectionId)) return;
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        this.pushHistory();
        if (updates.alanId !== undefined && updates.alanId !== sec.alanId) {
            sec.secmeliDersler = [];
        }

        Object.assign(sec, updates);
        this.sanitizeSection(sec);
        this.notify();
    }

    // --- Ders & Seçmeli Yönetimi ---
    addElectiveCourse(sectionId, electiveCourse) {
        if (!this._secmeliKilidiniDenetle()) return;
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        this.pushHistory();
        const existingIdx = sec.secmeliDersler.findIndex(d => (d.ders || d.ders_adi) === (electiveCourse.ders || electiveCourse.ders_adi));
        if (existingIdx >= 0) {
            sec.secmeliDersler[existingIdx] = electiveCourse;
        } else {
            sec.secmeliDersler.push(electiveCourse);
        }
        this.notify();
    }

    removeElectiveCourse(sectionId, courseName) {
        if (!this._secmeliKilidiniDenetle()) return;
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();
        sec.secmeliDersler = sec.secmeliDersler.filter(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm !== norm;
        });
        this.notify();
    }

    updateCourseBranch(sectionId, courseName, newBranchName) {
        if (!this._subeKilidiniDenetle(sectionId)) return;
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();
        const all = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
        const target = all.find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });
        if (target) {
            target.atananBrans = newBranchName;
        }
        this.notify();
    }

    /**
     * Bir dersin GRUP SAYISINI okulun tercihine göre ayarlar.
     *
     * Mevzuat baremi üst sınırdır; okul dersi fiilen kaç grupta okutuyorsa
     * onu yazar. `null` verilirse otomatik hesaba geri dönülür.
     *
     * NEDEN: Anadolu Lisesi'nde seçmeli Kur'an-ı Kerim 30 mevcutta otomatik
     * 2 gruba bölünüyor ve ders yükü iki katına çıkıyordu. Okul dersi tek
     * grupta okutuyorsa bu yük gerçek değildi (kullanıcı bildirimi, 28.08.2026).
     */
    updateCourseGroupCount(sectionId, courseName, newCount) {
        if (!this._subeKilidiniDenetle(sectionId)) return;
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();
        const all = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
        const target = all.find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });
        if (target) {
            const n = parseInt(newCount, 10);
            if (Number.isFinite(n) && n >= 1) target.grupSayisi = n;
            else delete target.grupSayisi;      // otomatik hesaba dön
        }
        this.notify();
    }

    /**
     * Eğik çizgili dersi (ör. "Görsel Sanatlar/Müzik") branşlara böler.
     *
     * Çizelge, öğrencinin bu alternatiflerden birini "okulun imkânları
     * doğrultusunda" seçtiğini söyler; okulda iki öğretmen varsa ikisi de
     * kendi grubuna dersin tam saatini okutur. Boş dizi/tek branş verilirse
     * bölme kaldırılır ve ders yine tek branşa yazılır.
     */
    updateCourseBranchSplit(sectionId, courseName, branchList) {
        if (!this._subeKilidiniDenetle(sectionId)) return;
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();
        const all = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
        const target = all.find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });
        if (target) {
            const liste = Array.isArray(branchList) ? branchList.filter(Boolean) : [];
            if (liste.length >= 2) target.bolunenBranslar = liste;
            else delete target.bolunenBranslar;
        }
        this.notify();
    }

    /**
     * "Hedef Temelli Destek Eğitimi" saatini branşlara PAYLAŞTIRIR.
     *
     * dagilim: { "Matematik": 1, "Fizik": 1, "Kimya": 1 }
     * Boş nesne/null verilirse paylaştırma kaldırılır.
     *
     * Eğik çizgili derslerdeki bölmeden farklıdır: orada saat ÇARPILIR (her
     * öğretmen kendi grubuna tam saati okutur), burada PAYLAŞTIRILIR (şubenin
     * 3-6 saatlik hakkı bölünür, toplam artmaz).
     */
    updateCourseBranchDistribution(sectionId, courseName, dagilim) {
        if (!this._subeKilidiniDenetle(sectionId)) return;
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();
        const all = [...(sec.zorunluDersler || []), ...(sec.secmeliDersler || [])];
        const target = all.find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });
        if (target) {
            const temiz = {};
            for (const [b, s] of Object.entries(dagilim || {})) {
                const n = parseInt(s, 10);
                if (b && Number.isFinite(n) && n >= 1) temiz[b] = n;
            }
            if (Object.keys(temiz).length) target.bransDagilimi = temiz;
            else delete target.bransDagilimi;
        }
        this.notify();
    }

    // --- Sınıf Birleştirme (Course Merging) ---
    toggleCourseMerge(sectionId, courseName, targetSectionId) {
        if (!this._subeKilidiniDenetle(sectionId)) return;
        const secA = this.state.subeler.find(s => s.id === sectionId);
        const secB = this.state.subeler.find(s => s.id === targetSectionId);
        if (!secA || !secB) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();

        const courseA = [...(secA.zorunluDersler || []), ...(secA.secmeliDersler || [])].find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });
        const courseB = [...(secB.zorunluDersler || []), ...(secB.secmeliDersler || [])].find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });

        if (!courseA || !courseB) return;

        if (!courseA.birlesikSubeler) courseA.birlesikSubeler = [];
        if (!courseB.birlesikSubeler) courseB.birlesikSubeler = [];

        const isMerged = courseA.birlesikSubeler.includes(targetSectionId);

        if (isMerged) {
            courseA.birlesikSubeler = courseA.birlesikSubeler.filter(id => id !== targetSectionId);
            courseB.birlesikSubeler = courseB.birlesikSubeler.filter(id => id !== sectionId);
        } else {
            courseA.birlesikSubeler.push(targetSectionId);
            courseB.birlesikSubeler.push(sectionId);
        }

        this.notify();
    }

    // --- Mevcut Öğretmen Sayıları Yönetimi ---
    setTeacherCount(branchName, count) {
        this.pushHistory();
        this.state.mevcutOgretmenler[branchName] = Math.max(0, parseInt(count || 0, 10));
        this.notify();
    }

    bulkSetTeachers(teacherMap) {
        this.pushHistory();
        this.state.mevcutOgretmenler = { ...this.state.mevcutOgretmenler, ...teacherMap };
        this.notify();
    }

    // --- İşletmelerde Meslek Eğitimi (Koordinatörlük) Yükleri Yönetimi ---
    setCoordinatorHours(branchName, hours) {
        this.pushHistory();
        if (!this.state.koordinatorlukYukleri) this.state.koordinatorlukYukleri = {};
        this.state.koordinatorlukYukleri[branchName] = Math.max(0, parseInt(hours || 0, 10));
        this.notify();
    }

    bulkSetCoordinatorHours(coordinatorMap) {
        this.pushHistory();
        if (!this.state.koordinatorlukYukleri) this.state.koordinatorlukYukleri = {};
        this.state.koordinatorlukYukleri = { ...this.state.koordinatorlukYukleri, ...coordinatorMap };
        this.notify();
    }

    getCoordinatorHoursMap() {
        return this.state.koordinatorlukYukleri || {};
    }

    // --- Pure Cloud Senkronizasyon (Yerel Kalıntı Yok) ---
    saveToStorage() {
        // ☁️ Doğrudan Google Cloud Canlı Veritabanı Otomatik Senkronizasyonu
        if (typeof window !== 'undefined') {
            const cloudService = window.cloudDbService || (typeof cloudDbService !== 'undefined' ? cloudDbService : null);
            if (cloudService) {
                const kKodu = this.state.okulBilgisi?.kurumKodu;
                if (kKodu && !this.state.okulBilgisi?.isDemo) {
                    cloudService.scheduleAutoSave(kKodu, this.state);
                }
            }
        }
    }

    loadFromStorage() {
        // Yerel çöp hafıza kullanılmaz, veriler doğrudan Google Cloud ve oturumdan gelir
        return false;
    }

    sanitizeExistingState() {
        if (!this.state || !Array.isArray(this.state.subeler)) return;
        this.state.subeler.forEach(sec => {
            this.sanitizeSection(sec);
        });
    }

    exportProjectJSON() {
        return JSON.stringify(this.state, null, 2);
    }

    importProjectJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.okulBilgisi && parsed.subeler) {
                this.pushHistory();
                this.state = parsed;
                this.notify();
                return true;
            }
        } catch (e) {
            console.error("Geçersiz proje JSON dosyası:", e);
        }
        return false;
    }
    /**
     * Okuldaki tüm şubelerin zorunlu derslerini güncel MEB müfredat veritabanıyla eşitler
     * @param {Object} curriculumEngineInstance - Müfredat motoru nesnesi
     * @returns {number} Güncellenen şube sayısı
     */
    syncAllSectionsWithCurriculum(curriculumEngineInstance) {
        if (!curriculumEngineInstance) return 0;
        const schoolType = this.state.okulBilgisi.okulTuru;
        let count = 0;
        (this.state.subeler || []).forEach(sec => {
            const newCourses = curriculumEngineInstance.getMandatoryCourses(
                schoolType,
                sec.sinifSeviyesi,
                sec.isSpecialEdu ? "ozel_egitim" : sec.alanId,
                sec.isSpecialEdu ? "Özel Eğitim Sınıfı" : sec.dalAdi
            );
            if (newCourses && newCourses.length > 0) {
                sec.zorunluDersler = newCourses;
                count++;
            }
        });
        this.saveToStorage();
        this.notify();
        return count;
    }

}

export const appState = new AppStateService();

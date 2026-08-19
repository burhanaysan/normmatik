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
                    kontrolUnvan: "Müdür Başyardımcısı",
                    kontrolAdSoyad: "",
                    onaylayanUnvan: "Okul Müdürü",
                    onaylayanAdSoyad: ""
                },
                adminOptions: {
                    isPansiyonlu: false,
                    hasDonerSermaye: false,
                    isTamGunTamYil: false,
                    hasStajyer100Plus: false,
                    hasSigortali500Plus: false,
                    isTasimaMerkezi: false,
                    isBirlestirilmis: false
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
        this.state = this.getDefaultState();
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
        const demoState = {
            okulBilgisi: {
                okulAdi: "Örnek Atatürk Anadolu Lisesi",
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
                    resmiOkulAdi: "Örnek Atatürk Anadolu Lisesi",
                    kurumKodu: "754123",
                    logoBase64: null,
                    hazirlayanUnvan: "Müdür Yardımcısı",
                    hazirlayanAdSoyad: "Ahmet YILMAZ",
                    kontrolUnvan: "Müdür Başyardımcısı",
                    kontrolAdSoyad: "Mehmet DEMİR",
                    onaylayanUnvan: "Okul Müdürü",
                    onaylayanAdSoyad: "Burhan AYSAN"
                },
                adminOptions: {
                    isPansiyonlu: false,
                    hasDonerSermaye: false,
                    isTamGunTamYil: false,
                    hasStajyer100Plus: false,
                    hasSigortali500Plus: false,
                    isTasimaMerkezi: false,
                    isBirlestirilmis: false
                }
            },
            subeler: [
                {
                    id: "sube_demo_9a",
                    subeAdi: "9-A",
                    sinifSeviyesi: "9",
                    ogrenciSayisi: 30,
                    zorunluDersler: [
                        { ders: "Türk Dili ve Edebiyatı", saat: 5, kategori: "ORTAK DERSLER", atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, isAtolye: false },
                        { ders: "Tarih", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Tarih", baraj_ders: false, isAtolye: false },
                        { ders: "Coğrafya", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Coğrafya", baraj_ders: false, isAtolye: false },
                        { ders: "Matematik", saat: 6, kategori: "ORTAK DERSLER", atananBrans: "Matematik", baraj_ders: false, isAtolye: false },
                        { ders: "Fizik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Fizik", baraj_ders: false, isAtolye: false },
                        { ders: "Kimya", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Kimya", baraj_ders: false, isAtolye: false },
                        { ders: "Biyoloji", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Biyoloji", baraj_ders: false, isAtolye: false },
                        { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false, isAtolye: false },
                        { ders: "İngilizce", saat: 4, kategori: "ORTAK DERSLER", atananBrans: "İngilizce", baraj_ders: false, isAtolye: false },
                        { ders: "Almanca", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Almanca", baraj_ders: false, isAtolye: false },
                        { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false, isAtolye: false },
                        { ders: "Görsel Sanatlar/Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Görsel Sanatlar", baraj_ders: false, isAtolye: false },
                        { ders: "Sağlık Bilgisi ve Trafik Kültürü", saat: 1, kategori: "ORTAK DERSLER", atananBrans: "Biyoloji", baraj_ders: false, isAtolye: false },
                        { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Bilişim Teknolojileri", baraj_ders: false, isAtolye: false },
                        { ders: "Rehberlik ve Yönlendirme", saat: 1, kategori: "ORTAK DERSLER", atananBrans: "Rehberlik", baraj_ders: false, isAtolye: false }
                    ],
                    secmeliDersler: [
                        { dersAdi: "SEÇMELİ BİYOLOJİ", dersSaati: 2, ttkbKarsiligi: "Biyoloji", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ MATEMATİK", dersSaati: 2, ttkbKarsiligi: "Matematik", kategori: "SEÇMELİ DERSLER" }
                    ],
                    rehberlikVarMi: true
                },
                {
                    id: "sube_demo_10a",
                    subeAdi: "10-A",
                    sinifSeviyesi: "10",
                    ogrenciSayisi: 30,
                    zorunluDersler: [
                        { ders: "Türk Dili ve Edebiyatı", saat: 5, kategori: "ORTAK DERSLER", atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, isAtolye: false },
                        { ders: "Tarih", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Tarih", baraj_ders: false, isAtolye: false },
                        { ders: "Coğrafya", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Coğrafya", baraj_ders: false, isAtolye: false },
                        { ders: "Felsefe", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Felsefe", baraj_ders: false, isAtolye: false },
                        { ders: "Matematik", saat: 6, kategori: "ORTAK DERSLER", atananBrans: "Matematik", baraj_ders: false, isAtolye: false },
                        { ders: "Fizik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Fizik", baraj_ders: false, isAtolye: false },
                        { ders: "Kimya", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Kimya", baraj_ders: false, isAtolye: false },
                        { ders: "Biyoloji", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Biyoloji", baraj_ders: false, isAtolye: false },
                        { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false, isAtolye: false },
                        { ders: "İngilizce", saat: 4, kategori: "ORTAK DERSLER", atananBrans: "İngilizce", baraj_ders: false, isAtolye: false },
                        { ders: "Almanca", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Almanca", baraj_ders: false, isAtolye: false },
                        { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false, isAtolye: false },
                        { ders: "Görsel Sanatlar/Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Müzik", baraj_ders: false, isAtolye: false },
                        { ders: "Rehberlik ve Yönlendirme", saat: 1, kategori: "ORTAK DERSLER", atananBrans: "Rehberlik", baraj_ders: false, isAtolye: false }
                    ],
                    secmeliDersler: [
                        { dersAdi: "SEÇMELİ KİMYA", dersSaati: 2, ttkbKarsiligi: "Kimya", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "ASTRONOMİ VE UZAY BİLİMLERİ", dersSaati: 2, ttkbKarsiligi: "Fizik", kategori: "SEÇMELİ DERSLER" }
                    ],
                    rehberlikVarMi: true
                },
                {
                    id: "sube_demo_11a",
                    subeAdi: "11-A",
                    sinifSeviyesi: "11",
                    ogrenciSayisi: 30,
                    zorunluDersler: [
                        { ders: "Türk Dili ve Edebiyatı", saat: 5, kategori: "ORTAK DERSLER", atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, isAtolye: false },
                        { ders: "Tarih", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Tarih", baraj_ders: false, isAtolye: false },
                        { ders: "Felsefe", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Felsefe", baraj_ders: false, isAtolye: false },
                        { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false, isAtolye: false },
                        { ders: "İngilizce", saat: 4, kategori: "ORTAK DERSLER", atananBrans: "İngilizce", baraj_ders: false, isAtolye: false },
                        { ders: "Almanca", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Almanca", baraj_ders: false, isAtolye: false },
                        { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false, isAtolye: false },
                        { ders: "Görsel Sanatlar/Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Görsel Sanatlar", baraj_ders: false, isAtolye: false },
                        { ders: "Rehberlik ve Yönlendirme", saat: 1, kategori: "ORTAK DERSLER", atananBrans: "Rehberlik", baraj_ders: false, isAtolye: false }
                    ],
                    secmeliDersler: [
                        { dersAdi: "SEÇMELİ MATEMATİK", dersSaati: 6, ttkbKarsiligi: "Matematik", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ FİZİK", dersSaati: 4, ttkbKarsiligi: "Fizik", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ KİMYA", dersSaati: 4, ttkbKarsiligi: "Kimya", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ BİYOLOJİ", dersSaati: 4, ttkbKarsiligi: "Biyoloji", kategori: "SEÇMELİ DERSLER" }
                    ],
                    rehberlikVarMi: true
                },
                {
                    id: "sube_demo_12a",
                    subeAdi: "12-A",
                    sinifSeviyesi: "12",
                    ogrenciSayisi: 30,
                    zorunluDersler: [
                        { ders: "Türk Dili ve Edebiyatı", saat: 5, kategori: "ORTAK DERSLER", atananBrans: "Türk Dili ve Edebiyatı", baraj_ders: true, isAtolye: false },
                        { ders: "T.C. İnkılap Tarihi ve Atatürkçülük", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Tarih", baraj_ders: false, isAtolye: false },
                        { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi", baraj_ders: false, isAtolye: false },
                        { ders: "İngilizce", saat: 4, kategori: "ORTAK DERSLER", atananBrans: "İngilizce", baraj_ders: false, isAtolye: false },
                        { ders: "Almanca", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Almanca", baraj_ders: false, isAtolye: false },
                        { ders: "Beden Eğitimi ve Spor", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Beden Eğitimi", baraj_ders: false, isAtolye: false },
                        { ders: "Görsel Sanatlar/Müzik", saat: 2, kategori: "ORTAK DERSLER", atananBrans: "Müzik", baraj_ders: false, isAtolye: false }
                    ],
                    secmeliDersler: [
                        { dersAdi: "SEÇMELİ MATEMATİK", dersSaati: 6, ttkbKarsiligi: "Matematik", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ FİZİK", dersSaati: 4, ttkbKarsiligi: "Fizik", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ KİMYA", dersSaati: 4, ttkbKarsiligi: "Kimya", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "SEÇMELİ BİYOLOJİ", dersSaati: 4, ttkbKarsiligi: "Biyoloji", kategori: "SEÇMELİ DERSLER" },
                        { dersAdi: "ÇAĞDAŞ TÜRK VE DÜNYA TARİHİ", dersSaati: 3, ttkbKarsiligi: "Tarih", kategori: "SEÇMELİ DERSLER" }
                    ],
                    rehberlikVarMi: false
                }
            ],
            aktifSubeId: "sube_demo_9a",
            mevcutOgretmenler: {
                "Türk Dili ve Edebiyatı": 1,
                "Matematik": 2,
                "Fizik": 1,
                "Kimya": 1,
                "Biyoloji": 1,
                "Tarih": 1,
                "Coğrafya": 1,
                "Felsefe": 1,
                "İngilizce": 1,
                "Almanca": 1,
                "Din Kültürü ve Ahlak Bilgisi": 1,
                "Beden Eğitimi": 1,
                "Görsel Sanatlar": 1,
                "Müzik": 1,
                "Bilişim Teknolojileri": 1,
                "Rehberlik": 1
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

    updateSection(sectionId, updates) {
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return null;

        this.pushHistory();
        Object.assign(sec, updates);
        this.sanitizeSection(sec);
        this.notify();
        return sec;
    }

    deleteSection(sectionId) {
        this.pushHistory();
        this.state.subeler = this.state.subeler.filter(s => s.id !== sectionId);
        if (this.state.aktifSubeId === sectionId) {
            this.state.aktifSubeId = this.state.subeler.length > 0 ? this.state.subeler[0].id : null;
        }
        this.notify();
    }

    duplicateSection(sectionId) {
        const source = this.state.subeler.find(s => s.id === sectionId);
        if (!source) return;

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
        const sourceIndex = this.state.subeler.findIndex(s => s.id === sourceSectionId);
        if (sourceIndex === -1) return null;
        const source = this.state.subeler[sourceIndex];

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
        if (!sec || !Array.isArray(sec.zorunluDersler)) return;

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

        // 2. Mükerrer Rehberlik derslerini teke indir (12. sınıf ise tamamen kaldır)
        const isGrade12 = String(sec.sinifSeviyesi) === "12";
        let rehberlikSeen = false;
        sec.zorunluDersler = sec.zorunluDersler.filter(d => {
            const norm = normalizeName(d.ders || d.ders_adi || "");
            if (norm.includes("rehberlik")) {
                if (isGrade12 || rehberlikSeen) return false;
                rehberlikSeen = true;
                d.ders = "Rehberlik ve Yönlendirme";
                d.saat = 1;
                d.kategori = "ORTAK DERSLER";
                d.atananBrans = "Rehberlik";
                return true;
            }
            return true;
        });

        if (Array.isArray(sec.secmeliDersler)) {
            sec.secmeliDersler = sec.secmeliDersler.filter(d => {
                const norm = normalizeName(d.ders || d.ders_adi || "");
                return !norm.includes("rehberlik") && !isInvalidCourse(d.ders || "");
            });
        }

        // 3. Kanonik Ders ve Branş Standardizasyonu (Çift isim ve sahte branşları temizler)
        const curriculum = (typeof window !== 'undefined' && window.curriculumEngine) ? window.curriculumEngine : null;
        const standardizeCourse = (d) => {
            const rawName = (d.ders || d.ders_adi || "").trim();
            if (curriculum && typeof curriculum.getCanonicalCourseAndBranch === 'function') {
                const resolved = curriculum.getCanonicalCourseAndBranch(rawName, d.atananBrans, sec.alanId, d.kategori || "ORTAK DERSLER");
                d.ders = resolved.courseName;
                if (d.ders_adi) d.ders_adi = resolved.courseName;
                d.atananBrans = resolved.branchName;
            } else {
                const norm = normalizeName(rawName);
                if (norm === "tarih") { d.ders = "Tarih"; d.atananBrans = "Tarih"; }
                else if (norm.includes("inkilap")) { d.ders = "T.C. İnkılap Tarihi ve Atatürkçülük"; d.atananBrans = "Tarih"; }
                else if (norm === "turkdiliveedebiyati" || norm === "turkedebiyati") { d.ders = "Türk Dili ve Edebiyatı"; d.atananBrans = "Türk Dili ve Edebiyatı"; }
                else if (norm.includes("saglikbilgisi") || norm.includes("trafik")) { d.ders = "Sağlık Bilgisi ve Trafik Kültürü"; d.atananBrans = "Biyoloji"; }
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
        const sec = this.state.subeler.find(s => s.id === sectionId);
        if (!sec) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();
        const all = [...sec.zorunluDersler, ...sec.secmeliDersler];
        const target = all.find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });
        if (target) {
            target.atananBrans = newBranchName;
        }
        this.notify();
    }

    // --- Sınıf Birleştirme (Course Merging) ---
    toggleCourseMerge(sectionId, courseName, targetSectionId) {
        const secA = this.state.subeler.find(s => s.id === sectionId);
        const secB = this.state.subeler.find(s => s.id === targetSectionId);
        if (!secA || !secB) return;

        const norm = String(courseName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        this.pushHistory();

        const courseA = [...secA.zorunluDersler, ...secA.secmeliDersler].find(d => {
            const dNorm = String(d.ders || d.ders_adi || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return dNorm === norm;
        });
        const courseB = [...secB.zorunluDersler, ...secB.secmeliDersler].find(d => {
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

    // --- LocalStorage Kayıt & Yükleme ---
    saveToStorage() {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error("State localStorage üzerine kaydedilemedi:", e);
        }
    }

    loadFromStorage() {
        if (typeof localStorage === 'undefined') return false;
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                this.state = JSON.parse(data);
                this.sanitizeExistingState();
                this.history = [JSON.stringify(this.state)];
                this.historyIndex = 0;
                return true;
            }
        } catch (e) {
            console.error("State yüklenirken hata oluştu:", e);
        }
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
}

export const appState = new AppStateService();

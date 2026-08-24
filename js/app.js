import { authService } from "./authService.js";
import { cloudDbService } from "./cloudDatabaseService.js";
// NormMatik — MEB Norm Kadro ve Ders Yükü Hesaplama Sistemi - Ana Uygulama Koordinatörü (app.js)
import { dbService } from './database.js';
import { curriculumEngine } from './curriculumEngine.js';
import { normEngine } from './normEngine.js';
import { appState } from './state.js';
import { UIComponentManager } from './uiComponents.js';

class MebNormApplication {
    constructor() {
        this.ui = new UIComponentManager(dbService, appState, normEngine, curriculumEngine);
        this.activeGradeFilter = "ALL";
        this.searchQuery = "";
        this.isResizingLeft = false;
        this.isResizingRight = false;
    }

    async init() {
        try {
            console.log("Uygulama başlatılıyor (Google Cloud-Native Mod)...");
            this.initTheme();

            const session = (typeof authService !== 'undefined') ? authService.getSession() : null;

            if (typeof window !== 'undefined' && window.location.pathname.endsWith("app.html")) {
                if (!session || !session.kurumKodu) {
                    window.location.href = "index.html";
                    return;
                }
            }

            if (typeof window !== 'undefined' && window.licenseManager) {
                await window.licenseManager.init();
            }
            await dbService.loadDatabase();

            normEngine.setBranchMatrix(dbService.getBranchMatrix());
            appState.loadLayout();

            // 1. DEMO OKUL SENARYOSU (Tertemiz, Başka Okuldan İz Taşımayan Demo Şablonu)
            if (session && session.isDemo) {
                appState.state = appState.getDefaultState();
                appState.state.okulBilgisi.kurumKodu = "123456";
                appState.state.okulBilgisi.okulAdi = "Atatürk Anadolu Lisesi (Demo)";
                appState.state.okulBilgisi.okulTuru = "anadolu_lisesi";
                appState.state.okulBilgisi.okulTuruKilitli = true;
                appState.state.okulBilgisi.isDemo = true;
                appState.state.subeler = [];
                appState.history = [JSON.stringify(appState.state)];
                appState.historyIndex = 0;
            } 
            // 2. GERÇEK LİSANSLI OKUL SENARYOSU (Doğrudan Google Cloud'dan Canlı Yükleme)
            else if (session && session.kurumKodu) {
                appState.state = appState.getDefaultState();
                appState.state.okulBilgisi.kurumKodu = session.kurumKodu;
                appState.state.okulBilgisi.okulAdi = session.okulAdi || `MEB Okulu (${session.kurumKodu})`;
                appState.state.okulBilgisi.okulTuru = session.okulTuru || "mesleki_ve_teknik_anadolu_lisesi";
                appState.state.okulBilgisi.okulTuruKilitli = true;
                appState.state.okulBilgisi.isDemo = false;

                // Google Cloud Realtime Database'den Okulun Verilerini Çek
                const cloudService = window.cloudDbService || (typeof cloudDbService !== 'undefined' ? cloudDbService : null);
                if (cloudService) {
                    // --- ABONELİK VE KİMLİK (2026-08-24) -------------------
                    // Okulun hakları — şube sınırı, dışa aktarım, bitiş tarihi —
                    // artık buluttaki 'abonelik' kaydından geliyor. Eskiden bu
                    // bilgi kullanıcının yapıştırdığı lisans anahtarının içindeydi;
                    // anahtar her girişte silindiği için ödeme yapmış okullar da
                    // DEMO'ya (3 şube) düşüyordu.
                    //
                    // Okul adı/türü de burada 'okul_kayit'tan alınıyor: veritabanı
                    // kuralı okulun bunları değiştirmesini zaten reddediyor, bu
                    // yüzden ekranda da yetkili kaynak burasıdır.
                    const lisans = await cloudService.loadLicenceInfo(session.kurumKodu);
                    if (lisans.kayit) {
                        if (lisans.kayit.okulAdi)  appState.state.okulBilgisi.okulAdi  = lisans.kayit.okulAdi;
                        if (lisans.kayit.okulTuru) appState.state.okulBilgisi.okulTuru = lisans.kayit.okulTuru;
                        if (lisans.kayit.il)       appState.state.okulBilgisi.il       = lisans.kayit.il;
                        if (lisans.kayit.ilce)     appState.state.okulBilgisi.ilce     = lisans.kayit.ilce;
                    }
                    if (window.licenseManager) {
                        const kimlikBilgisi = {
                            kurumKodu: session.kurumKodu,
                            okulAdi: appState.state.okulBilgisi.okulAdi,
                            okulTuru: appState.state.okulBilgisi.okulTuru
                        };
                        if (session.yoneticiModu) {
                            // Destek hesabı yönetim panelinden bir okul açtı.
                            // Kendi aboneliği yoktur; abonelik aranırsa DEMO'ya
                            // düşer ve 3 şube sınırına takılırdı.
                            window.licenseManager.applyAdminAccess(kimlikBilgisi);
                        } else {
                            window.licenseManager.applyCloudSubscription(lisans.abonelik, kimlikBilgisi);
                        }
                    }

                    const cloudData = await cloudService.loadSchoolData(session.kurumKodu);
                    if (cloudData) {
                        // Okul adı/türü yalnızca 'okul_kayit' YOKSA buradan alınır.
                        // Kural, kaydedilen adın okul_kayit'takiyle birebir aynı
                        // olmasını şart koşuyor; eski bir kayıttaki farklı ad
                        // ekrana yazılırsa ilk kaydetme reddedilirdi.
                        if (!lisans.kayit) {
                            if (cloudData.okulAdi) appState.state.okulBilgisi.okulAdi = cloudData.okulAdi;
                            if (cloudData.okulTuru) appState.state.okulBilgisi.okulTuru = cloudData.okulTuru;
                        }
                        if (cloudData.il) appState.state.okulBilgisi.il = cloudData.il;
                        if (cloudData.ilce) appState.state.okulBilgisi.ilce = cloudData.ilce;
                        if (cloudData.sezon) appState.state.okulBilgisi.sezon = cloudData.sezon;
                        if (cloudData.antet) appState.state.okulBilgisi.antet = cloudData.antet;
                        if (cloudData.adminOptions) appState.state.okulBilgisi.adminOptions = cloudData.adminOptions;
                        if (Array.isArray(cloudData.subeler)) appState.state.subeler = cloudData.subeler;
                        if (cloudData.mevcutOgretmenler) appState.state.mevcutOgretmenler = cloudData.mevcutOgretmenler;
                        if (cloudData.koordinatorlukYukleri) appState.state.koordinatorlukYukleri = cloudData.koordinatorlukYukleri;

                        appState.sanitizeExistingState();
                        if (appState.state.subeler.length > 0) {
                            appState.state.aktifSubeId = appState.state.subeler[0].id;
                        }
                    }
                }
                appState.history = [JSON.stringify(appState.state)];
                appState.historyIndex = 0;
            }

            appState.subscribe(() => this.render());
            this.autoReconcileAllSections();
            this.bindResizers();
            this.bindKeyboardShortcuts();
            this.render();

            console.log("Uygulama başarıyla Google Cloud-Native olarak yüklendi.");
        } catch (error) {
            console.error("Uygulama başlatma hatası:", error);
        }
    }

    initTheme() {
        let savedTheme = "light";
        try {
            savedTheme = localStorage.getItem("meb_norm_theme") || "light";
        } catch (e) {}
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        try {
            localStorage.setItem("meb_norm_theme", newTheme);
        } catch (e) {}
        this.renderHeader();
        this.ui.showToast(`${newTheme === 'dark' ? '🌙 Koyu (Gece)' : '☀️ Açık (Gündüz)'} temaya geçildi.`, "success");
    }

    bindKeyboardShortcuts() {
        window.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
                if (e.shiftKey) {
                    appState.redo();
                } else {
                    appState.undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
                appState.redo();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
                e.preventDefault();
                this.ui.openReportsModal("GRID");
            }
        });
    }

    bindResizers() {
        const resizerLeft = document.getElementById("resizer-left");
        const resizerRight = document.getElementById("resizer-right");
        const leftEl = document.getElementById("sidebar-left");
        const rightEl = document.getElementById("sidebar-right");

        let activeResizer = null;

        const onStartLeft = (e) => {
            e.preventDefault();
            activeResizer = "left";
            document.body.classList.add("resizing");
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            resizerLeft?.classList.add("resizing");
        };

        const onStartRight = (e) => {
            e.preventDefault();
            activeResizer = "right";
            document.body.classList.add("resizing");
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            resizerRight?.classList.add("resizing");
        };

        const onMove = (clientX) => {
            if (!activeResizer) return;
            const ws = document.querySelector(".main-workspace") || document.querySelector(".workspace-layout");
            const rect = ws ? ws.getBoundingClientRect() : { left: 0, right: window.innerWidth };

            if (activeResizer === "left") {
                const newWidth = Math.max(200, Math.min(550, clientX - rect.left));
                if (leftEl) {
                    leftEl.style.width = `${newWidth}px`;
                    leftEl.style.flexBasis = `${newWidth}px`;
                }
                appState.setLayout({ leftWidth: newWidth });
            } else if (activeResizer === "right") {
                const newWidth = Math.max(240, Math.min(650, rect.right - clientX));
                if (rightEl) {
                    rightEl.style.width = `${newWidth}px`;
                    rightEl.style.flexBasis = `${newWidth}px`;
                }
                appState.setLayout({ rightWidth: newWidth });
            }
        };

        const onEnd = () => {
            if (activeResizer) {
                activeResizer = null;
                document.body.classList.remove("resizing");
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
                resizerLeft?.classList.remove("resizing");
                resizerRight?.classList.remove("resizing");
            }
        };

        // Resizer Left Events
        resizerLeft?.addEventListener("mousedown", onStartLeft);
        resizerLeft?.addEventListener("pointerdown", onStartLeft);
        resizerLeft?.addEventListener("touchstart", (e) => {
            if (e.touches.length > 0) onStartLeft(e);
        }, { passive: false });

        // Resizer Right Events
        resizerRight?.addEventListener("mousedown", onStartRight);
        resizerRight?.addEventListener("pointerdown", onStartRight);
        resizerRight?.addEventListener("touchstart", (e) => {
            if (e.touches.length > 0) onStartRight(e);
        }, { passive: false });

        // Window Move & Up Events
        window.addEventListener("mousemove", (e) => onMove(e.clientX));
        window.addEventListener("pointermove", (e) => onMove(e.clientX));
        window.addEventListener("touchmove", (e) => {
            if (activeResizer && e.touches.length > 0) onMove(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener("mouseup", onEnd);
        window.addEventListener("pointerup", onEnd);
        window.addEventListener("touchend", onEnd);
        window.addEventListener("pointercancel", onEnd);
    }

        /**
     * MEB ÇÖP Veritabanı Değişikliklerini ve Düzeltmelerini Şubelere Otomatik Uygular
     * Kullanıcının seçmeli derslerini ve öğretmen atamalarını bozmadan zorunlu dersleri eşitler
     */
    autoReconcileAllSections() {
        if (!appState || !curriculumEngine) return;
        const schoolType = appState.state.okulBilgisi?.okulTuru;
        if (!schoolType) return;
        
        let changed = false;
        (appState.state.subeler || []).forEach(sec => {
            const canonicalCourses = curriculumEngine.getMandatoryCourses(
                schoolType,
                sec.sinifSeviyesi,
                sec.isSpecialEdu ? "ozel_egitim" : sec.alanId,
                sec.isSpecialEdu ? "Özel Eğitim Sınıfı" : sec.dalAdi
            );
            if (canonicalCourses && canonicalCourses.length > 0) {
                // Mevcut atanan branşları koruyarak eşitle
                const branchMap = {};
                (sec.zorunluDersler || []).forEach(c => {
                    if (c.ders && c.atananBrans) {
                        branchMap[c.ders] = c.atananBrans;
                    }
                });

                const reconciled = canonicalCourses.map(c => ({
                    ...c,
                    atananBrans: branchMap[c.ders] || c.atananBrans
                }));

                const oldStr = JSON.stringify(sec.zorunluDersler || []);
                const newStr = JSON.stringify(reconciled);
                if (oldStr !== newStr) {
                    sec.zorunluDersler = reconciled;
                    changed = true;
                }
            }
        });

        if (changed) {
            console.log("⚡ [Otomatik Müfredat Senkronizasyonu] Şubeler güncel MEB ÇÖP veritabanı ile eşitlendi.");
            appState.saveToStorage();
            appState.notify();
        }
    }

    render() {
        this.renderHeader();
        this.renderLeftSidebar();
        this.renderMiddleCanvas();
        this.renderRightNormPanel();
        this.applyLayoutStyles();
    }

    applyLayoutStyles() {
        const layout = appState.layout;
        const leftEl = document.getElementById("sidebar-left");
        const rightEl = document.getElementById("sidebar-right");
        const resizerLeft = document.getElementById("resizer-left");
        const resizerRight = document.getElementById("resizer-right");
        const expandLeft = document.getElementById("btn-expand-left");
        const expandRight = document.getElementById("btn-expand-right");

        if (leftEl) {
            leftEl.style.width = `${layout.leftWidth || 290}px`;
            if (layout.leftCollapsed) {
                leftEl.classList.add("collapsed");
                if (resizerLeft) resizerLeft.style.display = "none";
                if (expandLeft) expandLeft.style.display = "flex";
            } else {
                leftEl.classList.remove("collapsed");
                if (resizerLeft) resizerLeft.style.display = "flex";
                if (expandLeft) expandLeft.style.display = "none";
            }
        }

        if (rightEl) {
            rightEl.style.width = `${layout.rightWidth || 335}px`;
            if (layout.rightCollapsed) {
                rightEl.classList.add("collapsed");
                if (resizerRight) resizerRight.style.display = "none";
                if (expandRight) expandRight.style.display = "flex";
            } else {
                rightEl.classList.remove("collapsed");
                if (resizerRight) resizerRight.style.display = "flex";
                if (expandRight) expandRight.style.display = "none";
            }
        }
    }

    // --- 1. ÜST BAŞLIK (EXECUTIVE MARKET TERMINAL HEADER) RENDER ---
    renderHeader() {
        const headerEl = document.getElementById("app-header");
        if (!headerEl) return;

        const info = appState.state.okulBilgisi;
        const schoolTypes = dbService.getSchoolTypes();
        const currentType = schoolTypes.find(t => t.id === info.okulTuru) || { name: "Okul Türü Seçilmedi" };

        const seasons = ["2024-2025", "2025-2026", "2026-2027", "2027-2028", "2028-2029", "2029-2030"];
        const seasonOptionsHtml = seasons.map(s => `
            <option value="${s}" ${info.sezon === s ? 'selected' : ''}>${s}</option>
        `).join("");

        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const themeBtnText = currentTheme === "dark" ? "☀️" : "🌙";

        const schoolType = info.okulTuru || "";
        const isVocationalSchool = schoolType.includes("meslek") || schoolType.includes("teknik") || schoolType.includes("mtegm") || (appState.state.subeler || []).some(s => s.alanId);
        const headerStaffText = isVocationalSchool ? "🏢 Kadro & Koordinatörlük" : "👨‍🏫 Kadro Yönetimi";
        const headerStaffClass = isVocationalSchool ? "btn-staff-vocational" : "btn-staff-academic";
        const headerStaffTitle = isVocationalSchool ? "Kadrolu Öğretmen Sayıları ve 12. Sınıf İşletme Koordinatörlük Yükleri" : "Okul Kadrolu Öğretmen Sayıları ve Branş Dağılımı Yönetimi";

        headerEl.innerHTML = `
            <!-- 1. BÖLÜM: SİSTEM BAŞLIĞI -->
            <div class="header-section-module section-logo">
                <div class="logo-badge-executive">
                    <div class="logo-text-executive">
                        <span class="logo-brand-title">NormMatik™</span>
                        <span class="logo-brand-sub">MEB NORM SİSTEMİ</span>
                    </div>
                </div>
            </div>
            
            <div class="header-terminal-divider"></div>

            <!-- 2. BÖLÜM: OKUL BİLGİLERİ (GENİŞ VE FERAH) -->
            <div class="header-section-module section-school-info">
                <div class="school-executive-cluster">
                    <div class="school-title-row">
                        <span class="school-title-executive" id="btn-edit-school-name" title="Tıklayıp Okul Bilgilerini Düzenleyin">
                            <span style="font-size: 1.15rem;">🏫</span>
                            <span class="school-name-text">${info.okulAdi || 'Okul Adı Belirtilmedi'}</span>
                            ${info.kurumKodu ? '<span class="school-code-badge">' + info.kurumKodu + '</span>' : ''}
                            <span class="edit-pen-icon">✏️</span>
                        </span>
                    </div>
                    <div class="school-meta-pills">
                        <div class="season-pill-box" title="Eğitim-Öğretim Sezonu">
                            <span class="season-pill-icon">📅</span>
                            <select class="season-pill-select" id="season-selector">
                                ${seasonOptionsHtml}
                            </select>
                        </div>
                        <span class="school-type-tag" title="${currentType.name}">
                            📜 ${currentType.name}
                        </span>
                    </div>
                </div>
            </div>

            <div class="header-terminal-divider"></div>

            <!-- 3. BÖLÜM: KADRO YÖNETİMİ + RAPOR MERKEZİ -->
            <div class="header-section-module section-management-reports">
                <div class="history-controls-minimal">
                    <button class="btn-history-circle" id="btn-undo" title="Geri Al (Ctrl+Z)"><span>↶</span></button>
                    <button class="btn-history-circle" id="btn-redo" title="Yinele (Ctrl+Y)"><span>↷</span></button>
                </div>

                <button class="btn btn-sm ${headerStaffClass} btn-header-elevated" id="btn-header-staff" title="${headerStaffTitle}">
                    ${headerStaffText}
                </button>
                <button class="btn btn-sm btn-primary-gradient btn-header-elevated" id="btn-open-reports" title="MEB Norm Kadro Raporları">
                    🖨️ Raporlar
                </button>
            </div>

            <div class="header-terminal-divider"></div>

            <!-- 4. BÖLÜM: SİSTEM ARAÇLARI (KOMPAKT VE ŞIK) -->
            <div class="header-section-module section-tools">
                <div class="header-toolbar-group">
                    <button class="btn btn-sm btn-header-tool" id="btn-open-license" style="background: rgba(14, 165, 233, 0.18); border: 1.5px solid #0284c7; color: var(--primary); font-weight: 800;" title="Lisans Merkezi">
                        🔑 Lisans
                    </button>
                    <button class="btn btn-sm btn-header-tool" id="btn-open-onboarding" style="background: rgba(16, 185, 129, 0.12); border: 1px solid #10b981; color: #10b981;" title="Tanıtım Turu">
                        ❓ Rehber
                    </button>
                    <button class="btn btn-sm btn-header-tool" id="btn-export-json" title="Projeyi İndir">
                        💾 İndir
                    </button>
                    <button class="btn btn-sm btn-header-tool" id="btn-import-json" title="Proje Yükle">
                        📂 Yükle
                    </button>
                    <input type="file" id="file-import-json" accept=".json" style="display:none;">
                    <button class="btn btn-sm btn-header-tool" id="btn-open-kvkk" title="KVKK ve Yasal Bilgilendirme">
                        ⚖️ KVKK
                    </button>
                    <button class="theme-toggle-btn" id="btn-theme-toggle" title="Tema">
                        ${themeBtnText}
                    </button>
                    <button class="btn btn-sm btn-danger-outline" id="btn-reset-school" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" title="Okulu Sıfırla">
                        🔄
                    </button>
                    <!-- 🚪 GÜVENLİ ÇIKIŞ BUTONU -->
                    <button class="btn btn-sm btn-header-tool" id="btn-app-logout" style="background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #f87171;" title="Oturumu Kapat ve Ana Sayfaya Dön">
                        🚪 Çıkış
                    </button>
                    </div>
            </div>
        `;

        document.getElementById("btn-open-onboarding")?.addEventListener("click", () => {
            this.ui.openOnboardingWelcomeModal();
        });

        document.getElementById("btn-open-license")?.addEventListener("click", () => {
            this.ui.openLicenseModal();
        });

        document.getElementById("btn-header-staff")?.addEventListener("click", () => {
            this.ui.openTeacherStaffModal();
        });

        document.getElementById("btn-open-reports")?.addEventListener("click", () => {
            this.ui.openReportsModal("GRID");
        });

        document.getElementById("btn-open-kvkk")?.addEventListener("click", () => {
            this.ui.openKvkkModal("AYDINLATMA");
        });

        document.getElementById("btn-theme-toggle")?.addEventListener("click", () => this.toggleTheme());

        document.getElementById("btn-edit-school-name")?.addEventListener("click", () => {
            this.ui.openEditSchoolInfoModal();
        });

        document.getElementById("season-selector")?.addEventListener("change", (e) => {
            const newSeason = e.target.value;
            this.ui.openSeasonRolloverModal(newSeason);
        });

        document.getElementById("btn-undo")?.addEventListener("click", () => appState.undo());
        document.getElementById("btn-redo")?.addEventListener("click", () => appState.redo());
        document.getElementById("btn-reset-school")?.addEventListener("click", () => this.ui.openResetSchoolConfirmModal());

        // 🚪 Oturumu Kapat ve Ana Sayfaya Dön
        document.getElementById("btn-app-logout")?.addEventListener("click", () => {
            if (confirm("Oturumunuz kapatılacak ve ana sayfaya yönlendirileceksiniz. Çıkış yapmak istiyor musunuz?")) {
                if (typeof authService !== 'undefined') {
                    authService.logout();
                } else {
                    localStorage.removeItem("normmatik_active_session");
                    window.location.href = "index.html";
                }
            }
        });

        document.getElementById("btn-export-json")?.addEventListener("click", () => {
            const jsonStr = appState.exportProjectJSON();
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${info.okulAdi.replace(/\s+/g, '_')}_norm_plani_${info.sezon}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.ui.showToast("Proje JSON dosyası indirildi.", "success");
        });

        const fileInput = document.getElementById("file-import-json");
        document.getElementById("btn-import-json")?.addEventListener("click", () => fileInput.click());
        fileInput?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const ok = appState.importProjectJSON(event.target.result);
                if (ok) {
                    this.ui.showToast("Proje başarıyla yüklendi!", "success");
                } else {
                    alert("Geçersiz proje dosyası.");
                }
            };
            reader.readAsText(file);
        });

        const dbFileInput = document.getElementById("file-import-db");
        }

    getTargetWeeklyHours(section, schoolType) {
        if (section?.isSpecialEdu || (section?.subeAdi && section.subeAdi.includes("Özel Eğt")) || section?.alanId === "ozel_egitim") {
            return 30; // MEB Özel Eğitim Hizmetleri Yön. Md. 28 Haftalık Standart Yük
        }
        return dbService.getOfficialTargetHours(schoolType, section?.sinifSeviyesi, section?.alanId);
    }

    // --- 2. SOL PANEL (ŞUBE LİSTESİ) RENDER ---
    renderLeftSidebar() {
        const sidebarEl = document.getElementById("sidebar-left");
        if (!sidebarEl) return;

        // Kaydırma (Scroll) ve Arama Odağı (Focus) Konumunu Koru
        const currentListEl = sidebarEl.querySelector(".sections-list");
        const prevScrollTop = currentListEl ? currentListEl.scrollTop : (this.lastSidebarScrollTop || 0);

        const searchInput = document.getElementById("section-search-input");
        const hadSearchFocus = document.activeElement === searchInput;
        const cursorStart = searchInput?.selectionStart;
        const cursorEnd = searchInput?.selectionEnd;

        const subeler = appState.state.subeler || [];
        const aktifId = appState.state.aktifSubeId;
        const schoolType = appState.state.okulBilgisi.okulTuru;

        let filtered = subeler;
        if (this.activeGradeFilter !== "ALL") {
            filtered = filtered.filter(s => s.sinifSeviyesi === this.activeGradeFilter);
        }
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(s => s.subeAdi.toLowerCase().includes(q) || (s.dalAdi && s.dalAdi.toLowerCase().includes(q)));
        }

        const sectionsHtml = filtered.map(s => {
            const totalHours = [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])].reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
            const targetHours = this.getTargetWeeklyHours(s, schoolType);
            const isActive = s.id === aktifId;
            const hourStatus = totalHours === targetHours ? 'status-ok' : (totalHours > targetHours ? 'status-over' : 'status-under');
            const isSpecialEdu = !!s.isSpecialEdu || (s.subeAdi && s.subeAdi.includes("Özel Eğt")) || (s.dalAdi && s.dalAdi.includes("Özel Eğit")) || s.alanId === "ozel_egitim";
            
            let dalText = "";
            if (isSpecialEdu) {
                dalText = "🟣 Özel Eğitim Sınıfı";
            } else {
                const areaObj = s.alanId ? dbService.getVocationalAreas().find(a => a.id === s.alanId) : null;
                const areaName = areaObj ? areaObj.name.replace(/ Alanı$/i, '') : "";
                if (s.dalAdi && areaName) {
                    dalText = `${areaName} • ${s.dalAdi}`;
                } else if (s.dalAdi) {
                    dalText = s.dalAdi;
                } else if (areaName) {
                    dalText = areaName;
                } else {
                    dalText = String(s.sinifSeviyesi).toLowerCase() === 'hazirlik' ? 'Hazırlık Sınıfı' : s.sinifSeviyesi + '. Sınıf (Genel)';
                }
            }

            const gradeClass = isSpecialEdu ? 'card-grade-special-edu' : ('card-grade-' + String(s.sinifSeviyesi || '').toLowerCase());
            return `
                <div class="section-card ${gradeClass} ${isActive ? 'active' : ''}" data-id="${s.id}">
                    <!-- 1. ÜST SATIR: ŞUBE ADI + METRİKLER (ÖĞRENCİ & SAAT) + YÜZEN CAM AKSİYONLAR -->
                    <div class="sec-card-top-row">
                        <div class="sec-identity-wrap">
                            <span class="sec-card-name" title="${s.subeAdi}">${s.subeAdi}</span>
                        </div>
                        
                        <div class="sec-top-right-wrap">
                            <!-- Metrik Hapları (Varsayılan Görünüm) -->
                            <div class="sec-metrics-group">
                                <span class="sec-badge-pill student-pill" title="Mevcut: ${s.ogrenciSayisi} Öğrenci">
                                    <span class="pill-icon">👥</span>${s.ogrenciSayisi}
                                </span>
                                <span class="sec-badge-pill hour-pill ${hourStatus}" title="Haftalık Ders Saati: ${totalHours} / ${targetHours} Saat">
                                    <span class="chip-pulse-dot"></span>${totalHours}/${targetHours}s
                                </span>
                            </div>

                            <!-- Hover Aksiyon Butonları (Mouse Gelince Pürüzsüzce Açılır) -->
                            <div class="sec-action-chips">
                                <button class="sec-action-btn btn-edit-sec" data-id="${s.id}" title="Şubeyi Düzenle">✏️</button>
                                <button class="sec-action-btn split btn-split-sec" data-id="${s.id}" title="Şubeyi 2 veya 3'e Böl">✂️</button>
                                <button class="sec-action-btn btn-duplicate-sec" data-id="${s.id}" title="Şubeyi Kopyala">📋</button>
                                <button class="sec-action-btn delete btn-delete-sec" data-id="${s.id}" title="Şubeyi Sil">🗑️</button>
                            </div>
                        </div>
                    </div>

                    <!-- 2. ALT SATIR: UZUN METİNLERİ KORUYAN OKUNAKLI ALAN & DAL BİLGİSİ -->
                    <div class="sec-card-bottom-row">
                        <div class="sec-branch-desc" title="${dalText}">
                            <span class="sec-branch-bullet">▪</span>
                            <span class="sec-branch-text">${dalText}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        const types = dbService.getSchoolTypes();
        const typeInfo = types.find(t => t.id === schoolType) || { gradeLevels: ["9", "10", "11", "12"] };
        const gradeLevels = typeInfo.gradeLevels || ["9", "10", "11", "12"];

        const gradeTabsHtml = `
            <button class="grade-tab-btn ${this.activeGradeFilter === 'ALL' ? 'active' : ''}" data-grade="ALL">Tümü</button>
            ${gradeLevels.map(g => `
                <button class="grade-tab-btn ${this.activeGradeFilter === g ? 'active' : ''}" data-grade="${g}">
                    ${g === 'hazirlik' ? 'Hazırlık' : g + '. Sınıf'}
                </button>
            `).join('')}
        `;

        sidebarEl.innerHTML = `
            <div class="sidebar-header-executive">
                <!-- 1. ÜST BAŞLIK & SİMETRİK GİZLEME BUTONU -->
                <div class="sidebar-top-bar">
                    <div class="sidebar-brand-group">
                        <button class="btn-panel-toggle" id="btn-collapse-left" title="Sol Şube Panelini Gizle">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="11 17 6 12 11 7"></polyline>
                                <polyline points="18 17 13 12 18 7"></polyline>
                            </svg>
                        </button>
                        <div class="sidebar-title-block">
                            <span class="sidebar-heading-text">ŞUBE YÖNETİMİ</span>
                            <span class="badge-total-sections">${subeler.length} Şube</span>
                        </div>
                    </div>
                </div>

                <!-- 2. KURUMSAL 3'LÜ İŞLEM VE AKTARIM ÇUBUĞU -->
                <div class="sidebar-action-grid">
                    <button class="btn-sec-act btn-sec-add" id="btn-open-single-add" title="Tek Tek Manuel Şube Ekle">
                        <span class="act-icon">➕</span>
                        <span class="act-text">Şube</span>
                    </button>
                    <button class="btn-sec-act btn-sec-bulk" id="btn-open-bulk-wizard" title="Otomatik Çoklu Sınıf ve Şube Oluşturucu">
                        <span class="act-icon">⚡</span>
                        <span class="act-text">Çoklu</span>
                    </button>
                    <button class="btn-sec-act btn-sec-eokul" id="btn-open-eokul-import" title="e-Okul Excel Dosyasından Tüm Şubeleri Otomatik İçe Aktar">
                        <span class="act-icon">📥</span>
                        <span class="act-text">e-Okul</span>
                    </button>
                </div>

                <!-- 3. KADEME SEKMELERİ (SEGMENTED BAR) -->
                <div class="grade-segmented-bar">
                    ${gradeTabsHtml}
                </div>

                <!-- 4. ARAMA KUTUSU -->
                <div class="search-box-sleek">
                    <span class="search-icon">🔍</span>
                    <input type="text" class="search-input-sleek" id="section-search-input" placeholder="Şube, sınıf veya alan ara..." value="${this.searchQuery}">
                </div>
            </div>
            <div class="sections-list">
                ${sectionsHtml.length > 0 ? sectionsHtml : '<div style="text-align:center; padding: 2rem; color: var(--text-muted); font-size: 0.85rem;">Henüz şube eklenmedi. "+ Şube" veya "📥 e-Okul" butonuna basarak ekleyebilirsiniz.</div>'}
            </div>
        `;

        // Kaydırma Konumunu (Scroll Position) Anında Geri Yükle & Kaydet
        const newListEl = sidebarEl.querySelector(".sections-list");
        if (newListEl) {
            if (prevScrollTop > 0) {
                newListEl.scrollTop = prevScrollTop;
            }
            newListEl.addEventListener("scroll", () => {
                this.lastSidebarScrollTop = newListEl.scrollTop;
            }, { passive: true });
        }

        // Arama Kutusu Odağını Geri Yükle
        if (hadSearchFocus) {
            const newSearchInput = document.getElementById("section-search-input");
            if (newSearchInput) {
                newSearchInput.focus();
                if (cursorStart !== undefined && cursorEnd !== undefined) {
                    newSearchInput.setSelectionRange(cursorStart, cursorEnd);
                }
            }
        }

        document.getElementById("btn-open-single-add")?.addEventListener("click", () => this.ui.openAddSectionModal());
        document.getElementById("btn-open-bulk-wizard")?.addEventListener("click", () => this.ui.openBulkSectionWizard());
        document.getElementById("btn-open-eokul-import")?.addEventListener("click", () => this.ui.openEOkulImportModal());
        document.getElementById("btn-collapse-left")?.addEventListener("click", () => {
            appState.setLayout({ leftCollapsed: true });
            this.applyLayoutStyles();
        });

        document.querySelectorAll(".grade-tab-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.activeGradeFilter = e.currentTarget.dataset.grade;
                this.renderLeftSidebar();
            });
        });

        document.getElementById("section-search-input")?.addEventListener("input", (e) => {
            this.searchQuery = e.target.value;
            this.renderLeftSidebar();
        });

        document.querySelectorAll(".section-card").forEach(card => {
            card.addEventListener("click", (e) => {
                if (e.target.closest("button")) return;
                const id = card.dataset.id;
                // Kart tıklandığında mevcut scroll konumunu garantiye al
                if (newListEl) {
                    this.lastSidebarScrollTop = newListEl.scrollTop;
                }
                appState.setActiveSection(id);
                // Mobilde şube tıklandığında otomatik Orta Panel Dersler sekmesine geç
                if (window.innerWidth <= 768) {
                    document.body.setAttribute('data-mobile-tab', 'courses');
                    document.querySelectorAll('.mobile-nav-btn').forEach(b => {
                        b.classList.toggle('active', b.getAttribute('data-target-tab') === 'courses');
                    });
                }
            });
        });

        document.querySelectorAll(".btn-edit-sec").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const sec = subeler.find(s => s.id === btn.dataset.id);
                if (sec) this.ui.openAddSectionModal(sec);
            });
        });

        document.querySelectorAll(".btn-split-sec").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const sec = subeler.find(s => s.id === btn.dataset.id);
                if (sec) this.ui.openSplitSectionModal(sec);
            });
        });

        document.querySelectorAll(".btn-duplicate-sec").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                appState.duplicateSection(btn.dataset.id);
            });
        });

        document.querySelectorAll(".btn-delete-sec").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm("Bu şubeyi silmek istediğinizden emin misiniz?")) {
                    appState.deleteSection(btn.dataset.id);
                }
            });
        });
    }

    // --- 3. ORTA PANEL (PRIMARY FOCUS CANVAS - ROWSPAN İLE DİKEY KATEGORİLİ TEK TABLO) ---
    renderMiddleCanvas() {
        const canvasEl = document.getElementById("middle-canvas");
        if (!canvasEl) return;

        const activeSec = appState.getActiveSection();

        if (!activeSec) {
            canvasEl.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-muted); gap: 1rem; text-align: center; padding: 2rem;">
                    <span style="font-size: 3.5rem;">📚</span>
                    <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main, #0f172a);">Lütfen sol panelden bir şube seçin veya yeni şube ekleyin.</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); max-width: 450px;">
                        e-Okul Excel dosyanız varsa tek tıkla tüm okulu kurabilir veya manuel ekleme yapabilirsiniz.
                    </div>
                    <div style="display:flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-top: 0.5rem;">
                        <button class="btn btn-primary" id="btn-empty-add-single">+ Tek Şube Ekle</button>
                        <button class="btn btn-outline" id="btn-empty-add-wizard">⚡ Toplu Şube Sihirbazı</button>
                        <button class="btn btn-success" id="btn-empty-add-eokul" style="background: #059669; color: #fff; border: none; font-weight: 600; padding: 0.5rem 1rem;">📥 e-Okul Excel'den Otomatik Kur</button>
                    </div>
                </div>
            `;
            document.getElementById("btn-empty-add-single")?.addEventListener("click", () => this.ui.openAddSectionModal());
            document.getElementById("btn-empty-add-wizard")?.addEventListener("click", () => this.ui.openBulkSectionWizard());
            document.getElementById("btn-empty-add-eokul")?.addEventListener("click", () => this.ui.openEOkulImportModal());
            return;
        }

        const schoolType = appState.state.okulBilgisi.okulTuru;
        const targetHours = this.getTargetWeeklyHours(activeSec, schoolType);

        let zorunluList = activeSec.zorunluDersler || [];
        const secmeliList = activeSec.secmeliDersler || [];
        const branches = dbService.getAllBranches();

        // Mükerrer Rehberlik engelleme & tekil liste (Türkçe küçük harf kontrolü)
        let seenRehberlik = false;
        zorunluList = zorunluList.filter(d => {
            const name = String(d.ders || d.ders_adi || "").toLowerCase();
            if (name.includes("rehberlik") || name.includes("rehberlık")) {
                if (seenRehberlik) return false;
                seenRehberlik = true;
                d.ders = "Rehberlik ve Yönlendirme";
                d.saat = 1;
                return true;
            }
            return true;
        });
        activeSec.zorunluDersler = zorunluList;

        // Dersleri Kategorilerine Göre Grupla
        const isRehberlikCourse = (c) => {
            const name = String(c.ders || c.ders_adi || "").toLowerCase();
            return name.includes("rehberlik") || name.includes("rehberlık");
        };

        const isMeslekCourse = (c) => {
            if (isRehberlikCourse(c)) return false;
            const rawName = String(c.ders || c.ders_adi || "").toLowerCase()
                .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
                .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]/g, '');
            
            // Kültür dersleri hiçbir şubede meslek grubuna düşemez
            const CULTURE_LIST = ["dinkulturu", "turkdiliveedebiyati", "tarih", "inkilap", "cografya", "matematik", "fizik", "kimya", "biyoloji", "felsefe", "ingilizce", "almanca", "bedenegitimi", "gorselsanatlar", "muzik", "saglikbilgisi"];
            if (CULTURE_LIST.some(k => rawName.includes(k))) return false;

            const rawKat = (c.kategori || "").toUpperCase();
            return rawKat.includes("ALAN") || rawKat.includes("MESLEK") || rawKat.includes("DAL") || !!c.isAtolye;
        };

        const ortakCourses = zorunluList.filter(d => !isMeslekCourse(d) && !isRehberlikCourse(d));
        const meslekCourses = zorunluList.filter(d => isMeslekCourse(d));
        const secmeliCourses = secmeliList.map(d => ({ ...d, isElective: true }));
        const rehberlikCourses = zorunluList.filter(d => isRehberlikCourse(d));

        const totalHours = [...ortakCourses, ...meslekCourses, ...secmeliCourses, ...rehberlikCourses].reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
        const ortakHours = ortakCourses.reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
        const meslekHours = meslekCourses.reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
        const secmeliHours = secmeliCourses.reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);
        const rehberlikHours = rehberlikCourses.reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);

        let statusState = "success";
        let statusHoursText = `${totalHours} / ${targetHours} Saat`;
        let statusBadgeTitle = "Tamamlandı";
        let statusBadgeSub = "Haftalık Yük Tam";

        if (totalHours < targetHours) {
            statusState = "warning";
            statusHoursText = `${totalHours} / ${targetHours} Saat`;
            statusBadgeTitle = `${targetHours - totalHours} Saat Eksik`;
            statusBadgeSub = "Seçmeli Ders";
        } else if (totalHours > targetHours) {
            statusState = "danger";
            statusHoursText = `${totalHours} / ${targetHours} Saat`;
            statusBadgeTitle = `+${totalHours - targetHours} Saat Fazla`;
            statusBadgeSub = "Ders Yükü Aşımı";
        }

        const currentCategoryFilter = this.activeCategoryFilter || "ALL";

        // 4 Kategori Grubu
        const categoryGroups = [
            { type: "ortak", icon: "📘", title: "Zorunlu Ortak Dersler", shortTitle: "ORTAK", hours: ortakHours, list: ortakCourses, isElective: false },
            { type: "meslek", icon: "🟣", title: "Alan ve Dal Meslek Dersleri", shortTitle: "MESLEK", hours: meslekHours, list: meslekCourses, isElective: false },
            { type: "secmeli", icon: "📙", title: "Seçmeli Dersler", shortTitle: "SEÇMELİ", hours: secmeliHours, list: secmeliCourses, isElective: true },
            { type: "rehberlik", icon: "🧭", title: "Rehberlik ve Yönlendirme", shortTitle: "REHBERLİK", hours: rehberlikHours, list: rehberlikCourses, isElective: false }
        ];

        // Segmented Tabs Toolbar
        const filterTabsHtml = `
            <button class="category-filter-btn tab-all ${currentCategoryFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">
                <span class="tab-icon">📋</span> Tüm Dersler <span class="tab-hour-badge">${totalHours}</span>
            </button>
            <button class="category-filter-btn tab-ortak ${currentCategoryFilter === 'ortak' ? 'active' : ''}" data-filter="ortak">
                <span class="tab-icon">📘</span> Ortak <span class="tab-hour-badge">${ortakHours}</span>
            </button>
            ${meslekHours > 0 ? `
                <button class="category-filter-btn tab-meslek ${currentCategoryFilter === 'meslek' ? 'active' : ''}" data-filter="meslek">
                    <span class="tab-icon">🟣</span> Meslek <span class="tab-hour-badge">${meslekHours}</span>
                </button>
            ` : ''}
            <button class="category-filter-btn tab-secmeli ${currentCategoryFilter === 'secmeli' ? 'active' : ''}" data-filter="secmeli">
                <span class="tab-icon">📙</span> Seçmeli <span class="tab-hour-badge">${secmeliHours}</span>
            </button>
            <button class="category-filter-btn tab-rehberlik ${currentCategoryFilter === 'rehberlik' ? 'active' : ''}" data-filter="rehberlik">
                <span class="tab-icon">🧭</span> Rehberlik <span class="tab-hour-badge">${rehberlikHours}</span>
            </button>
        `;

        let tableBodyRowsHtml = "";
        const isFilteringAll = currentCategoryFilter === "ALL";
        let courseSequenceNumber = 0;

        categoryGroups.forEach(grp => {
            const hasCourses = grp.list.length > 0;
            const isSecmeli = grp.type === "secmeli";
            const isRelevant = hasCourses || (isSecmeli && (isFilteringAll || currentCategoryFilter === "secmeli"));

            if (isRelevant) {
                if (isFilteringAll || currentCategoryFilter === grp.type) {
                    if (isFilteringAll || (!hasCourses && currentCategoryFilter === grp.type)) {
                        let targetHintHtml = "";
                        if (isSecmeli) {
                            const expectedElectiveHours = Math.max(0, targetHours - ortakHours - meslekHours - rehberlikHours);
                            if (expectedElectiveHours > 0 || secmeliHours > 0) {
                                targetHintHtml = `<span class="category-target-badge ${secmeliHours >= expectedElectiveHours && expectedElectiveHours > 0 ? 'badge-complete' : (expectedElectiveHours === 0 ? 'badge-complete' : 'badge-pending')}">Seçilen: ${secmeliHours} / Hedef: ${expectedElectiveHours} Saat</span>`;
                            }
                        }

                        tableBodyRowsHtml += `
                            <tr class="category-divider-row cat-${grp.type}">
                                <td colspan="6">
                                    <div class="category-divider-content">
                                        <div class="category-divider-left">
                                            <span class="category-divider-icon">${grp.icon}</span>
                                            <span class="category-divider-title">${grp.title.toUpperCase()}</span>
                                        </div>
                                        <div class="category-divider-right">
                                            ${targetHintHtml}
                                            <span class="category-divider-hours">${grp.hours} Saat</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }

                    if (hasCourses) {
                        grp.list.forEach((c, idx) => {
                            const isFirstInGroup = (idx === 0);
                            courseSequenceNumber++;
                            tableBodyRowsHtml += this.renderCourseRow(c, activeSec, branches, grp.isElective, schoolType, isFirstInGroup, grp, courseSequenceNumber);
                        });
                    } else if (isSecmeli) {
                        tableBodyRowsHtml += `
                            <tr class="empty-category-row">
                                <td colspan="6" style="text-align: center; padding: 0.65rem 1rem; background: rgba(245, 158, 11, 0.03); border-left: 3.5px dashed #f59e0b; color: var(--text-muted); font-size: 0.78rem;">
                                    <span>Bu şube için henüz seçmeli ders seçilmedi.</span>
                                    <button class="btn btn-sm btn-primary inline-open-elective-btn" style="margin-left: 0.75rem; font-size: 0.72rem; padding: 0.15rem 0.55rem; border-radius: 6px;">
                                        ✨ + Seçmeli Ders Ekle
                                    </button>
                                </td>
                            </tr>
                        `;
                    }
                }
            }
        });

        const activeAreaObj = activeSec.alanId ? dbService.getVocationalAreas().find(a => a.id === activeSec.alanId) : null;
        const activeAreaName = activeAreaObj ? activeAreaObj.name.replace(/ Alanı$/i, '') : "";

        const schoolTypeMap = {
            'mesleki_ve_teknik_anadolu_lisesi': 'MTAL (AMP)',
            'anadolu_lisesi': 'Anadolu Lisesi',
            'fen_lisesi': 'Fen Lisesi',
            'imam_hatip_lisesi': 'İmam Hatip Lisesi',
            'mesleki_egitim_merkezi': 'MESEM',
            'guzel_sanatlar_lisesi': 'Güzel Sanatlar Lisesi',
            'spor_lisesi': 'Spor Lisesi',
            'sosyal_bilimler_lisesi': 'Sosyal Bilimler Lisesi',
            'ozel_egitim_meslek_okulu': 'Özel Eğitim Meslek Okulu'
        };
        const schoolTypeShort = schoolTypeMap[schoolType] || 'Ortaöğretim';
        const gradeDisplay = String(activeSec.sinifSeviyesi).toLowerCase() === 'hazirlik' ? 'Hazırlık' : `${activeSec.sinifSeviyesi}. Sınıf`;
        const isSpecialEduSec = !!activeSec.isSpecialEdu || (activeSec.subeAdi && activeSec.subeAdi.includes("Özel Eğt")) || (activeSec.dalAdi && activeSec.dalAdi.includes("Özel Eğit")) || activeSec.alanId === "ozel_egitim";

        canvasEl.innerHTML = `
            <!-- SABİT KART BAŞLIĞI: 2 KATMANLI MASTER HERO BANNER & KONTROL TOOLBARI -->
            <div class="canvas-hero-wrapper">
                <!-- 1. KATMAN: ŞUBE KİMLİĞİ, HİYERARŞİK YOL & TELEMETRİ HUD -->
                <div class="section-hero-banner">
                    <!-- SOL: BÜYÜK AVATAR + BAŞLIK + HİYERARŞİK KURUMSAL YOL -->
                    <div class="hero-identity-main">
                        <div class="hero-avatar-box" title="${activeSec.subeAdi} - ${gradeDisplay}">
                            <span class="hero-avatar-icon">🏫</span>
                            <span class="hero-grade-tag">${gradeDisplay}</span>
                        </div>
                        <div class="hero-identity-details">
                            <div class="hero-title-row">
                                <h1 class="hero-section-title" title="${activeSec.subeAdi}">${activeSec.subeAdi}</h1>
                                <span class="hero-student-pill" title="Şube Mevcudu: ${activeSec.ogrenciSayisi} Öğrenci">
                                    👥 <strong>${activeSec.ogrenciSayisi}</strong> Öğr
                                </span>
                                <div class="hero-title-btn-group">
                                    <button class="hero-btn-pill" id="btn-edit-active-sec" title="Şube ve Dal Bilgilerini Düzenle">
                                        <span>✏️ Düzenle</span>
                                    </button>
                                    <button class="hero-btn-pill split" id="btn-split-active-sec" title="Şubeyi 2 veya 3'e Böl (Mevcut/Dal Bölünmesi)">
                                        <span>✂️ Böl</span>
                                    </button>
                                    <button class="hero-btn-pill copy" id="btn-duplicate-active-sec" title="Şubeyi Birebir Kopyala">
                                        <span>📋 Kopyala</span>
                                    </button>
                                </div>
                            </div>

                            <!-- HİYERARŞİK KURUMSAL YOL (BREADCRUMB) -->
                            <div class="hero-hierarchy-path">
                                <span class="path-badge school" title="Okul Türü">${schoolTypeShort}</span>
                                <span class="path-divider">/</span>
                                <span class="path-badge grade">${gradeDisplay}</span>
                                ${isSpecialEduSec ? `
                                    <span class="path-divider">/</span>
                                    <span class="path-badge special" title="Özel Eğitim Sınıfı">
                                        <span class="path-icon">🟣</span> Özel Eğitim (Md. 17/1-c)
                                    </span>
                                ` : ''}
                                ${activeAreaName ? `
                                    <span class="path-divider">/</span>
                                    <span class="path-badge area" title="Meslek Alanı: ${activeAreaName}">
                                        <span class="path-icon">🏛️</span> <strong>Alan:</strong> ${activeAreaName}
                                    </span>
                                ` : ''}
                                ${activeSec.dalAdi ? `
                                    <span class="path-divider">➔</span>
                                    <span class="path-badge dal" title="Meslek Dalı: ${activeSec.dalAdi}">
                                        <span class="path-icon">⚙️</span> <strong>Dal:</strong> ${activeSec.dalAdi}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- SAĞ: TELEMETRİ KARTI & SEÇMELİ DERS BUTONU -->
                    <div class="hero-telemetry-block">
                        <div class="neon-status-card ${statusState}" title="Haftalık Toplam Ders Saati: ${totalHours} / ${targetHours} Saat (${statusBadgeTitle} - ${statusBadgeSub})">
                            <div class="neon-status-left">
                                <div class="neon-status-header">
                                    <span class="neon-status-dot ${statusState}"></span>
                                    <span class="neon-status-title">Haftalık Yük</span>
                                </div>
                                <div class="metric-value">⏱️ ${statusHoursText}</div>
                            </div>
                            <div class="metric-badge-stacked ${statusState}">
                                <span class="badge-row-top">${statusBadgeTitle}</span>
                                <span class="badge-row-sub">${statusBadgeSub}</span>
                            </div>
                        </div>
                        <button class="neon-action-btn" id="btn-open-elective-drawer" title="Şubeye Yeni Seçmeli Ders Ekle">
                            <span class="action-btn-sparkle">✨</span>
                            <span>+ Seçmeli Ders</span>
                        </button>
                    </div>
                </div>

                <!-- 2. KATMAN: KATEGORİ FİLTRE SEKMELERİ (TEK VE KOMPAKT SATIR) -->
                <div class="unified-card-toolbar">
                    <div class="category-filter-tabs">
                        ${filterTabsHtml}
                    </div>
                </div>
            </div>

            <!-- SCROLLABLE TABLO GÖVDESİ -->
            <div class="canvas-content-scroll">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th style="width: 44px; min-width: 44px; max-width: 48px; text-align: center;">No</th>
                            <th style="width: 36%;">Ders Adı</th>
                            <th style="width: 15%; text-align: center;">Haftalık Saat</th>
                            <th style="width: 24%;">Atanan Branş</th>
                            <th style="width: 14%; text-align: center;">Sınıf Birleştirme</th>
                            <th style="width: 7%; text-align: center;">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableBodyRowsHtml.length > 0 ? tableBodyRowsHtml : `
                            <tr>
                                <td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
                                    Bu kategoride ders bulunmuyor.
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;

        document.querySelectorAll(".category-filter-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.activeCategoryFilter = e.currentTarget.dataset.filter;
                this.renderMiddleCanvas();
            });
        });

        document.getElementById("btn-edit-active-sec")?.addEventListener("click", () => {
            this.ui.openAddSectionModal(activeSec);
        });

        document.getElementById("btn-split-active-sec")?.addEventListener("click", () => {
            this.ui.openSplitSectionModal(activeSec);
        });

        document.getElementById("btn-duplicate-active-sec")?.addEventListener("click", () => {
            appState.duplicateSection(activeSec.id);
            this.ui.showToast(`📋 ${activeSec.subeAdi} şubesi başarıyla kopyalandı!`, "success");
            this.renderAll();
        });

        document.getElementById("btn-open-elective-drawer")?.addEventListener("click", () => {
            this.ui.openElectiveCourseDrawer(activeSec);
        });

        document.querySelectorAll(".inline-open-elective-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                this.ui.openElectiveCourseDrawer(activeSec);
            });
        });

        document.querySelectorAll(".branch-select").forEach(select => {
            select.addEventListener("change", (e) => {
                const cName = e.currentTarget.dataset.course;
                const newBranch = e.currentTarget.value;
                appState.updateCourseBranch(activeSec.id, cName, newBranch);
                this.ui.showToast(`🎯 "${cName}" branşı "${newBranch || 'Atanmadı'}" olarak güncellendi.`, "success");
            });
        });

        document.querySelectorAll(".btn-open-merge-modal").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const cName = e.currentTarget.dataset.course;
                this.ui.openCourseMergeModal(activeSec, cName);
            });
        });

        document.querySelectorAll(".btn-remove-elective").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const cName = e.currentTarget.dataset.course;
                appState.removeElectiveCourse(activeSec.id, cName);
                this.ui.showToast(`🗑️ "${cName}" seçmeli dersi şubeden kaldırıldı.`, "success");
            });
        });
    }

    renderCourseRow(course, section, branches, isElective = false, schoolType = "", isFirstInGroup = false, grp = null, rowNumber = 1) {
        const rawCName = course.ders || course.ders_adi;
        const hours = parseInt(course.saat || course.ders_saati || 0, 10);
        
        let cName = rawCName;
        let assignedBranch = course.atananBrans;

        if (window.curriculumEngine && typeof window.curriculumEngine.getCanonicalCourseAndBranch === 'function') {
            const resolved = window.curriculumEngine.getCanonicalCourseAndBranch(rawCName, assignedBranch, section.alanId || section.alanAdi, course.kategori);
            cName = resolved.courseName;
            assignedBranch = resolved.branchName;
        } else if (window.curriculumEngine && typeof window.curriculumEngine.toTurkishTitleCase === 'function') {
            cName = window.curriculumEngine.toTurkishTitleCase(rawCName);
        }
        
        if (assignedBranch === "— Branş Atanmadı —" || assignedBranch === "Diğer" || assignedBranch === "") {
            assignedBranch = "";
        }

        const isUnassigned = !assignedBranch || assignedBranch.trim() === "";
        const isBaraj = !!course.baraj_ders;

        const mergedList = course.birlesikSubeler || [];
        const isMerged = mergedList.length > 0;

        const normAssigned = (assignedBranch || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        let hasSelectedOption = false;
        const optionsList = branches.map(b => {
            const bNorm = b.brans_adi.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            const isMatch = !isUnassigned && (
                assignedBranch === b.brans_adi || 
                normAssigned === bNorm || 
                (normAssigned.includes("rehberlik") && bNorm === "rehberlik") ||
                (normAssigned.includes("bilisim") && bNorm.includes("bilisim")) ||
                (normAssigned.includes("elektrik") && bNorm.includes("elektrik")) ||
                (normAssigned.includes("makine") && bNorm.includes("makine")) ||
                (normAssigned.includes("turkdili") && bNorm.includes("turkdili"))
            );
            if (isMatch && !hasSelectedOption) {
                hasSelectedOption = true;
                return `<option value="${b.brans_adi}" selected>${b.brans_adi}</option>`;
            }
            return `<option value="${b.brans_adi}">${b.brans_adi}</option>`;
        }).join("");

        const branchOptionsHtml = `
            <option value="" ${(!hasSelectedOption || isUnassigned) ? 'selected' : ''}>— Branş Atanmadı —</option>
            ${optionsList}
        `;

        const mergedSectionsNames = mergedList.map(id => {
            const sec = appState.state.subeler.find(s => s.id === id);
            return sec ? sec.subeAdi : "";
        }).filter(Boolean).join(", ");

        // Md. 22/1-ç grup bölünmesi SINIF SEVİYESİNE bağlıdır; sinifSeviyesi
        // geçilmezse ekranda görünen yük, norm hesabındaki yükten farklı çıkar.
        const sectionInclusionCount = parseInt(section.kaynastirmaOgrenciSayisi ?? section.kaynastirmaSayisi ?? 0, 10) || 0;
        const mult = normEngine.evaluateCourseMultiplier(course, section.ogrenciSayisi || 30, schoolType, section.sinifSeviyesi, sectionInclusionCount);
        
        let loadInfoHtml = "";
        let badgeHtml = "";

        if (isUnassigned) {
            loadInfoHtml = `
                <div class="course-hours-wrapper">
                    <span class="course-hours-unassigned">${hours} Saat</span>
                </div>
            `;
            badgeHtml = `
                <span class="unassigned-badge" title="Bu derse henüz branş atanmadı.">
                    ⚪ Branş Atanmadı
                </span>
            `;
        } else {
            loadInfoHtml = mult.groupCount > 1 ? `
                <div class="course-hours-wrapper">
                    <span class="course-hours-value">${hours} Saat</span>
                    <span class="group-multiplier-pill" title="${mult.note}">(${mult.groupCount} Grup)</span>
                </div>
            ` : `
                <div class="course-hours-wrapper">
                    <span class="course-hours-value">${hours} Saat</span>
                </div>
            `;
        }

        let electiveThemeBadgeHtml = "";
        if (isElective && this.ui && typeof this.ui.getElectiveThemeInfo === 'function') {
            const tInfo = this.ui.getElectiveThemeInfo({
                ders: cName,
                isVocational: !!(course.isVocational || course.isElectiveVocational || (course.kategori || '').includes('MESLEK')),
                grup: course.grup || course.kategori
            });
            if (tInfo) {
                electiveThemeBadgeHtml = `<span class="${tInfo.badgeClass}" style="font-size: 0.65rem; font-weight: 700; padding: 0.08rem 0.4rem; border-radius: var(--radius-full);">${tInfo.badge}</span>`;
            }
        }

        const badgeCategoryClass = isElective ? 'badge-secmeli' : ((course.kategori || '').includes('MESLEK') || course.isVocational ? 'badge-meslek' : 'badge-ortak');

        return `
            <tr class="course-row ${isElective ? 'is-elective-row' : ''}">
                <td class="course-index-cell">
                    <span class="course-index-badge ${badgeCategoryClass}">${rowNumber}</span>
                </td>
                <td class="course-name-cell">
                    <div class="course-name-wrapper">
                        <span class="course-title">${cName}</span>
                        ${electiveThemeBadgeHtml}
                        ${isBaraj ? '<span class="baraj-pill" title="Baraj Ders (Sınıf Geçme Şartı)">BARAJ</span>' : ''}
                        ${badgeHtml}
                    </div>
                </td>
                <td class="course-hours-cell">
                    ${loadInfoHtml}
                </td>
                <td class="course-branch-cell">
                    <div class="course-branch-wrapper">
                        <select class="branch-select" data-course="${cName}">
                            ${branchOptionsHtml}
                        </select>
                    </div>
                </td>
                <td class="course-merge-cell">
                    <div class="course-merge-wrapper">
                        <button class="merge-btn ${isMerged ? 'active' : ''} btn-open-merge-modal" data-course="${cName}" title="${isMerged ? `Birleştirilen Şubeler: ${mergedSectionsNames}` : 'Bu dersi diğer şubelerle birleştir'}">
                            🔗 ${isMerged ? `<span class="merge-text">Birleşti: <strong>${mergedSectionsNames}</strong></span>` : 'Birleştir'}
                        </button>
                    </div>
                </td>
                <td class="course-action-cell" style="text-align: center;">
                    <div class="course-action-wrapper">
                        ${isElective ? `
                            <button class="btn-delete-course btn-remove-elective" data-course="${cName}" title="Bu Seçmeli Dersi Kaldır">
                                🗑️
                            </button>
                        ` : '<span class="dash-muted">—</span>'}
                    </div>
                </td>
            </tr>
        `;
    }

    // --- 4. SAĞ PANEL (KOMPAKT NORM TABLOSU VE İNTERAKTİF SOHBET BALONU) ---
    renderRightNormPanel() {
        const panelEl = document.getElementById("sidebar-right");
        if (!panelEl) return;

        const subeler = appState.state.subeler || [];
        const existingTeachers = appState.state.mevcutOgretmenler || {};
        const schoolType = appState.state.okulBilgisi.okulTuru || "";
        // Kopya: adminOptions anahtarı canlı state'e sızarsa branş listesi kirlenir.
        const coordinatorMap = { ...(appState.state.koordinatorlukYukleri || {}) };
        coordinatorMap.adminOptions = appState.state.okulBilgisi.adminOptions || {};

        const normResult = normEngine.calculateSchoolNorms(subeler, existingTeachers, schoolType, coordinatorMap);

        const rowsHtml = normResult.branchReport.map(b => {
            return `
                <tr class="norm-row" data-branch="${b.branchName}">
                    <td>
                        <span class="norm-branch-text">${b.branchName}</span>
                    </td>
                    <td style="text-align: center;">
                        <span class="norm-chip-load">${b.totalHours}</span>
                    </td>
                    <td style="text-align: center;">
                        <div class="norm-dual-chip" title="Norm / Mevcut Kadro">
                            <span class="chip-norm">${b.calculatedNorm}</span>
                            <span class="chip-slash">/</span>
                            <span class="chip-mev">${b.currentTeachers}</span>
                        </div>
                    </td>
                    <td style="text-align: center;">
                        <span class="norm-status-chip ${b.statusType}">${b.statusBadge}</span>
                    </td>
                </tr>
            `;
        }).join("");

        const isVocationalSchool = schoolType.includes("meslek") || schoolType.includes("teknik") || schoolType.includes("mtegm") || subeler.some(s => s.alanId);
        const staffBtnTitle = isVocationalSchool ? "Kadrolu Öğretmen Sayılarını ve 12. Sınıf Koordinatörlük Yüklerini Düzenle" : "Kadrolu Öğretmen Sayılarını Düzenle";

        panelEl.innerHTML = `
            <div class="norm-panel-header">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size: 0.95rem; font-weight: 800;">Norm Kadro</span>
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                        <button class="btn-panel-toggle" id="btn-collapse-right" title="Sağ Norm Panelini Kapat (Sağa Gizle)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="13 17 18 12 13 7"></polyline>
                                <polyline points="6 17 11 12 6 7"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="norm-kpi-grid-compact">
                    <!-- Toplam Yük İnce Şerit -->
                    <div class="kpi-banner-load">
                        <span class="kpi-banner-label">⏱️ Toplam Okul Yükü</span>
                        <span class="kpi-banner-val">${normResult.totalHours} <span style="font-size: 0.72rem; font-weight: 600;">Saat</span></span>
                    </div>

                    <!-- 4'lü Kompakt Mini Rozet Grubu -->
                    <div class="kpi-row-quad">
                        <div class="kpi-chip kpi-chip-blue" title="Hesaplanan Norm">
                            <span class="kpi-chip-title">Norm</span>
                            <span class="kpi-chip-num blue">${normResult.totalCalculatedNorm}</span>
                        </div>
                        <div class="kpi-chip kpi-chip-slate" title="Mevcut Öğretmen Sayısı">
                            <span class="kpi-chip-title">Mevcut</span>
                            <span class="kpi-chip-num">${normResult.totalCurrentTeachers}</span>
                        </div>
                        <div class="kpi-chip kpi-chip-purple" title="Toplam Norm İhtiyacı">
                            <span class="kpi-chip-title">İhtiyaç</span>
                            <span class="kpi-chip-num purple">${normResult.totalNeeded > 0 ? '-' + normResult.totalNeeded : '0'}</span>
                        </div>
                        <div class="kpi-chip kpi-chip-red" title="Toplam Norm Fazlası">
                            <span class="kpi-chip-title">Fazla</span>
                            <span class="kpi-chip-num red">${normResult.totalSurplus > 0 ? '+' + normResult.totalSurplus : '0'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="norm-table-container">
                <table class="norm-table">
                    <thead>
                        <tr>
                            <th>Branş</th>
                            <th style="text-align: center;">Yük</th>
                            <th style="text-align: center;">Norm/Mev.</th>
                            <th style="text-align: center;">Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-muted);">Henüz ders yükü hesaplanmadı.</td></tr>'}
                    </tbody>
                </table>
            </div>
                        <div class="sidebar-right-disclaimer-distinct">
                <span class="disclaimer-icon">⚠️</span>
                <div class="disclaimer-body">
                    <strong>Ön Hazırlık & Bölge Normu:</strong> Hesaplamalar karar destek amaçlıdır. MEB Bölge Normu uygulaması gereği 33 saat gibi artık saatlerde okul normu 1 olarak takdir edilebilir.
                </div>
            </div>
            <div class="sidebar-right-footer">
                <button class="btn-footer-kvkk" id="btn-footer-kvkk" title="6698 Sayılı KVKK Aydınlatma Metni ve Veri Güvenliği Taahhüdü">
                    🛡️ <strong>KVKK & Gizlilik</strong>
                </button>
                <span class="dev-subtle-watermark" title="NormMatik MEB Norm Kadro ve Ders Yükü Sistemi • NormMatik™ Ar-Ge Grubu">
                    ⚡ Mimari & Tasarım: <strong>normmatik</strong>
                </span>
            </div>
        `;

        document.getElementById("btn-footer-kvkk")?.addEventListener("click", () => {
            this.ui.openKvkkModal("AYDINLATMA");
        });

        // Global Speech Bubble Tooltip Bağlantısı (Kırpılma engelli Portal Tooltip)
        let bubble = document.getElementById("global-speech-bubble");
        if (!bubble) {
            bubble = document.createElement("div");
            bubble.id = "global-speech-bubble";
            bubble.className = "global-speech-bubble";
            document.body.appendChild(bubble);
        }

        let activeRow = null;
        let hideTimeout = null;

        const showBubble = (row) => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            activeRow = row;
            document.querySelectorAll(".norm-row").forEach(r => r.classList.remove("active-popover-row"));
            row.classList.add("active-popover-row");

            const branchName = row.dataset.branch;
            const bData = normResult.branchReport.find(b => b.branchName === branchName);
            if (!bData) return;

            const bubbleCoursesHtml = bData.courses.map(c => `
                <div class="bubble-section-chip-card ${c.isCoordinator ? 'bubble-coord-card' : ''}">
                    <div class="bubble-chip-top">
                        <span class="bubble-sec-badge">🏫 ${c.sectionName}</span>
                        <span class="bubble-hour-badge ${c.isCoordinator ? 'coord' : ''}">${c.isCoordinator ? '🏢 +' : '⏱️ '}${c.calculatedLoad} Saat</span>
                    </div>
                    <div class="bubble-course-name">${c.courseName}</div>
                    ${c.note ? `<div class="bubble-chip-note">👥 ${c.note}</div>` : ''}
                </div>
            `).join("");

            bubble.innerHTML = `
                <div class="bubble-title">
                    <span>⚖️ ${bData.branchName}</span>
                    <span class="bubble-sec-count-badge">${bData.courses.length} Şube/Ders</span>
                </div>
                <div class="bubble-body">
                    <div class="bubble-chips-container">
                        ${bubbleCoursesHtml.length > 0 ? bubbleCoursesHtml : '<div class="bubble-empty">Bu branşa atanmış ders yükü bulunmuyor.</div>'}
                    </div>
                    <div class="bubble-footer">
                        <div>📊 Toplam Ders Yükü: <strong class="bubble-total-val">${bData.totalHours} Saat</strong></div>
                        ${bData.coordinatorHours > 0 ? `<div style="font-size:0.72rem; color:#c084fc; font-weight:700;">🏢 12. Sınıf İşletme Koordinatörlüğü: +${bData.coordinatorHours}s (OÖKY Md.88)</div>` : ''}
                        <div>📜 <strong>${bData.formulaExplanation}</strong></div>
                    </div>
                </div>
            `;

            // Akıllı Görünürlük ve Viewport Sığdırma Motoru
            const rect = row.getBoundingClientRect();
            const bubbleWidth = 360;

            bubble.style.visibility = "hidden";
            bubble.classList.add("active");

            // Render edilen yüksekliği ölç
            const bubbleHeight = bubble.offsetHeight || 280;
            const viewportHeight = window.innerHeight;

            let targetTop = rect.top + (rect.height / 2) - (bubbleHeight / 2);
            const minTop = 16;
            const maxTop = Math.max(16, viewportHeight - bubbleHeight - 16);
            if (targetTop < minTop) targetTop = minTop;
            if (targetTop > maxTop) targetTop = maxTop;

            const targetLeft = Math.max(16, rect.left - bubbleWidth - 14);

            bubble.style.top = `${targetTop}px`;
            bubble.style.left = `${targetLeft}px`;
            bubble.style.visibility = "visible";
        };

        const scheduleHide = () => {
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                bubble.classList.remove("active");
                if (activeRow) {
                    activeRow.classList.remove("active-popover-row");
                    activeRow = null;
                }
            }, 200);
        };

        const cancelHide = () => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
        };

        document.querySelectorAll(".norm-row").forEach(row => {
            // TIKLAYINCA OLUŞSUN (Click to open)
            row.addEventListener("click", (e) => {
                e.stopPropagation();
                if (activeRow === row && bubble.classList.contains("active")) {
                    scheduleHide();
                } else {
                    showBubble(row);
                }
            });

            // MOUSE'I ÜSTÜNDEN ÇEKİNCE 2. BİR TIKLAMAYA GEREK KALMADAN ANİMASYONLA KAYBOLSUN
            row.addEventListener("mouseleave", () => {
                scheduleHide();
            });

            row.addEventListener("mouseenter", () => {
                if (activeRow === row) {
                    cancelHide();
                }
            });
        });

        // Baloncuk üzerine gidildiğinde açık kalsın (kullanıcı tüm şubeleri kaydırabilsin)
        bubble.addEventListener("mouseenter", () => {
            cancelHide();
        });

        // Baloncuk üzerinden mouse çekilince animasyonla otomatik kaybolsun
        bubble.addEventListener("mouseleave", () => {
            scheduleHide();
        });

        // Dışarıya tıklandığında kapansın
        document.addEventListener("click", (e) => {
            if (!bubble.contains(e.target) && !e.target.closest(".norm-row")) {
                bubble.classList.remove("active");
                if (activeRow) {
                    activeRow.classList.remove("active-popover-row");
                    activeRow = null;
                }
            }
        });

        document.getElementById("btn-collapse-right")?.addEventListener("click", () => {
            appState.setLayout({ rightCollapsed: true });
            this.applyLayoutStyles();
        });

        document.getElementById("btn-open-staff-modal")?.addEventListener("click", () => this.ui.openTeacherStaffModal());
    }
}

// Uygulamayı Başlat (Hem DOMContentLoaded hem de Hazır DOM desteği ile)
function startMebNormApp() {
    if (window._mebNormAppStarted) return;
    window._mebNormAppStarted = true;

    const app = new MebNormApplication();
    window.app = app;
    window.dbService = dbService;
    window.appState = appState;
    window.normEngine = normEngine;
    window.uiComponents = app.ui;
    app.init();

    document.getElementById("btn-expand-left")?.addEventListener("click", () => {
        appState.setLayout({ leftCollapsed: false });
        app.applyLayoutStyles();
    });

    document.getElementById("btn-expand-right")?.addEventListener("click", () => {
        appState.setLayout({ rightCollapsed: false });
        app.applyLayoutStyles();
    });
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startMebNormApp);
    } else {
        startMebNormApp();
    }
}

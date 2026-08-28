// MEB Norm Kadro Uygulaması - UI Bileşenleri ve Modalları

const TTKB_MAP = {
    'TÜRK DİLİ VE EDEBİYATI': 'Türk Dili ve Edebiyatı',
    'HAZIRLIK SINIFI TÜRK DİLİ VE EDEBİYATI': 'Türk Dili ve Edebiyatı',
    'TÜRKÇE': 'Türkçe',
    'DİN KÜLTÜRÜ VE AHLAK BİLGİSİ': 'Din Kültürü ve Ahlak Bilgisi',
    'DİN KÜLTÜRÜ VE AHLÂK BİLGİSİ': 'Din Kültürü ve Ahlak Bilgisi',
    'DİN KÜLTÜRÜ VE A.B.': 'Din Kültürü ve Ahlak Bilgisi',
    'TARİH': 'Tarih',
    'T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK': 'Tarih',
    'T.C. İNKILÂP TARİHİ VE ATATÜRKÇÜLÜK': 'Tarih',
    'T.C. İNKILAP TARİHİ': 'Tarih',
    'COĞRAFYA': 'Coğrafya',
    'SOSYAL BİLGİLER': 'Sosyal Bilgiler',
    'MATEMATİK': 'Matematik',
    'TEMEL MATEMATİK': 'Matematik',
    'SEÇMELİ MATEMATİK': 'Matematik',
    'FİZİK': 'Fizik',
    'KİMYA': 'Kimya',
    'BİYOLOJİ': 'Biyoloji',
    'FEN BİLİMLERİ': 'Fen Bilimleri',
    'FELSEFE': 'Felsefe',
    'YABANCI DİL': 'İngilizce',
    'BİRİNCİ YABANCI DİL': 'İngilizce',
    'İKİNCİ YABANCI DİL': 'Almanca',
    'İNGİLİZCE': 'İngilizce',
    'ALMANCA': 'Almanca',
    'FRANSIZCA': 'Fransızca',
    'ARAPÇA': 'Arapça',
    'MESLEKİ ARAPÇA': 'Arapça',
    'BEDEN EĞİTİMİ VE SPOR': 'Beden Eğitimi',
    'BEDEN EĞİTİMİ VE SPOR / GÖRSEL SANATLAR / MÜZİK': 'Beden Eğitimi',
    'BEDEN EĞİTİMİ VE SPOR/GÖRSEL SANATLAR/MÜZİK': 'Beden Eğitimi',
    'GÖRSEL SANATLAR / MÜZİK': 'Görsel Sanatlar',
    'GÖRSEL SANATLAR/MÜZİK': 'Görsel Sanatlar',
    'GÖRSEL SANATLAR': 'Görsel Sanatlar',
    'MÜZİK': 'Müzik',
    'TEKNOLOJİ VE TASARIM': 'Teknoloji ve Tasarım',
    'SAĞLIK BİLGİSİ VE TRAFİK KÜLTÜRÜ': 'Biyoloji',
    'SAĞLIK BİLGİSİ': 'Biyoloji',
    'TRAFİK GÜVENLİĞİ': 'Biyoloji',
    'BİLİŞİM TEKNOLOJİLERİ VE YAZILIM': 'Bilişim Teknolojileri',
    'BİLİŞİM TEKNOLOJİLERİ': 'Bilişim Teknolojileri',
    'KUR’AN-I KERİM': 'İHL Meslek Dersleri',
    "KUR'AN-I KERİM": 'İHL Meslek Dersleri',
    'KURAN-I KERİM': 'İHL Meslek Dersleri',
    'TEMEL DİNÎ BİLGİLER': 'İHL Meslek Dersleri',
    'TEMEL DİNİ BİLGİLER': 'İHL Meslek Dersleri',
    'PEYGAMBERİMİZİN HAYATI': 'İHL Meslek Dersleri',
    'FIKIH': 'İHL Meslek Dersleri',
    'TEFSİR': 'İHL Meslek Dersleri',
    'HADİS': 'İHL Meslek Dersleri',
    'AKAİD': 'İHL Meslek Dersleri',
    'KELAM': 'İHL Meslek Dersleri',
    'SİYER': 'İHL Meslek Dersleri',
    'HİTABET VE MESLEKİ UYGULAMA': 'İHL Meslek Dersleri',
    'İSLAM KÜLTÜR VE MEDENİYETİ': 'İHL Meslek Dersleri',
    'İSLAM TARİHİ': 'İHL Meslek Dersleri',
    'DİNLER TARİHİ': 'İHL Meslek Dersleri',
    'DESEN': 'Görsel Sanatlar',
    'İKİ BOYUTLU SANAT ATÖLYE': 'Görsel Sanatlar',
    'ÜÇ BOYUTLU SANAT ATÖLYE': 'Görsel Sanatlar',
    'TEMEL SANAT EĞİTİMİ': 'Görsel Sanatlar',
    'İMGESEL RESİM': 'Görsel Sanatlar',
    'SANAT ESERLERİNİ İNCELEME': 'Görsel Sanatlar',
    'GENEL SANAT TARİHİ': 'Görsel Sanatlar',
    'BATI MÜZİĞİ TEORİ VE UYGULAMASI': 'Müzik',
    'TÜRK MÜZİĞİ TEORİ VE UYGULAMASI': 'Müzik',
    'BİREYSEL ÇALGI EĞİTİMİ': 'Müzik',
    'BİREYSEL ÇALGI': 'Müzik',
    'ÇALGI EĞİTİMİ': 'Müzik',
    'PİYANO': 'Müzik',
    'KORO': 'Müzik',
    'MÜZİKSEL İŞİTME OKUMA VE YAZMA': 'Müzik',
    'GENEL JİMNASTİK': 'Beden Eğitimi',
    'ATLETİZM': 'Beden Eğitimi',
    'TAKIM SPORLARI': 'Beden Eğitimi',
    'BİREYSEL SPORLAR': 'Beden Eğitimi',
    'SPOR ANATOMİSİ VE FİZYOLOJİSİ': 'Beden Eğitimi',
    'ANTRENMAN BİLGİSİ': 'Beden Eğitimi',
    'SPOR UYGULAMALARI': 'Beden Eğitimi',
    'OYUNCULUK': 'Türk Dili ve Edebiyatı',
    'HAREKET': 'Beden Eğitimi',
    'SES VE KONUŞMA': 'Türk Dili ve Edebiyatı',
    'TİYATRO TARİHİ': 'Türk Dili ve Edebiyatı',
    'DRAMATURJİ': 'Türk Dili ve Edebiyatı',
    'OYUN ÇALIŞMASI': 'Türk Dili ve Edebiyatı',
    'REHBERLİK VE YÖNLENDİRME': 'Rehberlik',
    'REHBERLİK': 'Rehberlik'
};

// TTKB Resmi Seçmeli Kültür Dersleri Sınıf Bazlı İzin Verilen Ders Saatleri Matrisi
const TTKB_OFFICIAL_ELECTIVE_HOURS_MAP = {
    // Fen & Matematik
    'SEÇMELİ BİYOLOJİ': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'BİYOLOJİ': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'SEÇMELİ FİZİK': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'FİZİK': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'SEÇMELİ KİMYA': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'KİMYA': { '9': [2], '10': [2], '11': [2, 4], '12': [2, 4] },
    'SEÇMELİ MATEMATİK': { '10': [6], '11': [6], '12': [6] },
    'MATEMATİK': { '10': [6], '11': [6], '12': [6] },
    'TEMEL MATEMATİK': { '11': [2], '12': [2] },
    'SEÇMELİ TEMEL MATEMATİK': { '11': [2], '12': [2] },
    'FEN BİLİMLERİ UYGULAMALARI': { '11': [2, 3], '12': [2, 3] },
    'MATEMATİK UYGULAMALARI': { '11': [2, 3], '12': [2, 3] },
    'GENETİK BİLİMİNE GİRİŞ': { '11': [2, 3], '12': [2, 3] },
    'TIP BİLİMİNE GİRİŞ': { '11': [2, 3], '12': [2, 3] },
    'ASTRONOMİ VE UZAY BİLİMLERİ': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'FEN BİLİMLERİ TARİHİ VE UYGULAMALARI': { '10': [2, 3], '11': [2, 3], '12': [2, 3] },
    'MATEMATİK TARİHİ VE UYGULAMALARI': { '10': [2], '11': [2], '12': [2] },

    // Sosyal & Edebiyat & Tarih
    'SEÇMELİ TÜRK DİLİ VE EDEBİYATI': { '9': [3], '10': [3], '11': [3, 5], '12': [3, 5] },
    'TÜRK DİLİ VE EDEBİYATI': { '9': [3], '10': [3], '11': [3, 5], '12': [3, 5] },
    'EDEBİYAT UYGULAMALARI': { '9': [2], '10': [2], '11': [1, 2], '12': [2] },
    'METİN TAHLİLLERİ': { '9': [1, 2], '10': [1, 2], '11': [1, 2] },
    'DİKSİYON VE HİTABET': { '9': [1], '10': [1], '11': [1], '12': [1] },
    'OSMANLI TÜRKÇESİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'SEÇMELİ TARİH': { '10': [2], '11': [2, 4], '12': [2, 4] },
    'TARİH': { '10': [2], '11': [2, 4], '12': [2, 4] },
    'ÇAĞDAŞ TÜRK VE DÜNYA TARİHİ': { '12': [2, 4] },
    'TÜRK KÜLTÜR VE MEDENİYET TARİHİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'TÜRK DÜNYASI COĞRAFYASI': { '10': [1, 2], '11': [1, 2] },
    'SEÇMELİ COĞRAFYA': { '10': [2], '11': [2, 4], '12': [2, 4] },
    'COĞRAFYA': { '10': [2], '11': [2, 4], '12': [2, 4] },
    'PSİKOLOJİ': { '11': [2], '12': [2] },
    'SOSYOLOJİ': { '11': [2], '12': [2] },
    'MANTIK': { '11': [2], '12': [2] },
    'BİLGİ KURAMI': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'DEMOKRASİ VE İNSAN HAKLARI': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'İNSAN HAKLARI VE DEMOKRASİ': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'EKONOMİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'GİRİŞİMCİLİK': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'YÖNETİM BİLİMİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'ULUSLARARASI İLİŞKİLER': { '11': [2], '12': [2] },
    'TEMEL HUKUK BİLGİSİ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'HUKUK VE ADALET': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'İKLİM, ÇEVRE VE YENİLİKÇİ ÇÖZÜMLER': { '10': [1, 2], '11': [1, 2] },
    'SÜRDÜRÜLEBİLİR TARIM VE GIDA GÜVENLİĞİ': { '10': [1, 2], '11': [1, 2] },
    'ADABIMUAŞERET': { '9': [1], '10': [1], '11': [1], '12': [1] },
    'ÂDABIMUAŞERET': { '9': [1], '10': [1], '11': [1], '12': [1] },
    'GÖRGÜ KURALLARI VE NEZAKET': { '9': [1], '10': [1], '11': [1], '12': [1] },

    // Bilişim & Teknoloji
    'BİLİŞİM TEKNOLOJİLERİ VE YAZILIM': { '9': [1, 2], '10': [1, 2, 3], '11': [1, 2, 3], '12': [1, 2, 3] },
    'BİLGİSAYAR BİLİMİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'PROJE TASARIMI VE UYGULAMALARI': { '9': [2, 3, 4], '10': [2, 3, 4], '11': [2, 3, 4], '12': [2, 3, 4] },
    'PROJE HAZIRLAMA': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'YAPAY ZEKA UYGULAMALARI': { '10': [2], '11': [2], '12': [2] },
    'SİBER GÜVENLİK': { '10': [2], '11': [2], '12': [2] },
    'ROBOTİK KODLAMA': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'DİJİTAL GRAFİK': { '9': [2], '10': [2], '11': [2], '12': [2] },

    // Yabancı Diller
    'SEÇMELİ BİRİNCİ YABANCI DİL': { '9': [2, 4], '10': [2, 4], '11': [2, 4, 10, 12], '12': [2, 4, 10, 12] },
    'SEÇMELİ İKİNCİ YABANCI DİL': { '9': [1, 2, 4], '10': [1, 2, 4], '11': [1, 2, 4], '12': [1, 2, 4] },
    'YABANCI DİLLER EDEBİYATI': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },

    // Din, Ahlak ve Değer
    'KUR’AN-I KERİM': { '9': [2], '10': [2], '11': [2], '12': [2] },
    "KUR'AN-I KERİM": { '9': [2], '10': [2], '11': [2], '12': [2] },
    'KURAN-I KERİM': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'PEYGAMBERİMİZİN HAYATI': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'TEMEL DİNİ BİLGİLER': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'TEMEL DİNÎ BİLGİLER': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'İSLAM KÜLTÜR VE MEDENİYETİ': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'İSLAM BİLİM TARİHİ': { '9': [2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'TÜRK DÜŞÜNCE TARİHİ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'AHLAK VE TASAVVUF KÜLTÜRÜ': { '10': [1], '11': [1], '12': [1] },
    'İSLAM AHLAKI': { '10': [1], '11': [1], '12': [1] },
    'FIKIH OKUMALARI': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'HADİS METİNLERİ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'TEFSİR OKUMALARI': { '12': [1, 2] },
    'İSLAM TARİHİ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'KUR’AN OKUMA TEKNİKLERİ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'ARAPÇA (METİN-MÜKÂLEME)': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'DİNÎ MUSİKÎ': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'HÜSN-İ HAT': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'EBRU': { '10': [1, 2], '11': [1, 2], '12': [1, 2] },

    // Sanat & Spor
    'SEÇMELİ BEDEN EĞİTİMİ VE SPOR': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'BEDEN EĞİTİMİ VE SPOR': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'SEÇMELİ GÖRSEL SANATLAR': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'GÖRSEL SANATLAR': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'SEÇMELİ MÜZİK': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'MÜZİK': { '9': [2], '10': [2], '11': [1, 2], '12': [1, 2] },
    'SANAT EĞİTİMİ': { '9': [1, 2, 3], '10': [1, 2, 3], '11': [1, 2], '12': [1, 2] },
    'SPOR EĞİTİMİ': { '9': [1, 2, 3], '10': [1, 2, 3], '11': [1, 2], '12': [1, 2] },
    'DRAMA': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'SOSYAL ETKİNLİK': { '9': [1, 2], '10': [1, 2], '11': [1, 2], '12': [1, 2] },
    'SANAT TARİHİ': { '9': [2], '10': [2], '11': [2], '12': [2] },
    'HEDEF TEMELLİ DESTEK EĞİTİMİ': { '12': [3, 4, 5, 6] }
};

export function parseOfficialElectiveHours(rawHours) {
    if (!rawHours || rawHours === '-' || (typeof rawHours !== 'string' && typeof rawHours !== 'number')) {
        return [2];
    }
    const str = String(rawHours).trim();
    if (!str || str === '-') return [2];

    // (2)(4) veya (1)(2)(3) parantez formatı
    if (str.includes('(') && str.includes(')')) {
        const matches = str.match(/\((\d+)\)/g);
        if (matches && matches.length > 0) {
            const parsed = matches.map(m => parseInt(m.replace(/\D/g, ''), 10)).filter(n => !isNaN(n) && n > 0);
            if (parsed.length > 0) return [...new Set(parsed)].sort((a, b) => a - b);
        }
    }

    // 2/4 bölü formatı
    if (str.includes('/')) {
        const parts = str.split('/').map(p => parseInt(p.replace(/\D/g, ''), 10)).filter(n => !isNaN(n) && n > 0);
        if (parts.length > 0) return [...new Set(parts)].sort((a, b) => a - b);
    }

    // 1-4 aralık formatı
    const rangeMatch = str.match(/^(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (!isNaN(start) && !isNaN(end) && start <= end && end <= 15) {
            const rangeArr = [];
            for (let i = start; i <= end; i++) rangeArr.push(i);
            return rangeArr;
        }
    }

    // Tekil sayı veya metin içi sayılar
    const numbers = (str.match(/\d+/g) || []).map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 0 && n <= 30);
    if (numbers.length > 0) {
        return [...new Set(numbers)].sort((a, b) => a - b);
    }

    return [2];
}

export function getOfficialElectiveHoursOptions(courseName, rawHours, gradeLevel) {
    const rawClean = String(courseName || "").replace(/\s*\(\d+\)$/, "").trim();
    const gr = String(gradeLevel || "11");
    const norm = rawClean.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. TTKB Resmi Sözlük Birebir Eşleşme (Öncelikli)
    for (let k in TTKB_OFFICIAL_ELECTIVE_HOURS_MAP) {
        const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm === kNorm) {
            const gradeMap = TTKB_OFFICIAL_ELECTIVE_HOURS_MAP[k];
            if (gradeMap && gradeMap[gr] && Array.isArray(gradeMap[gr]) && gradeMap[gr].length > 0) {
                return gradeMap[gr];
            }
        }
    }

    // 2. Kısmi Başlangıç Eşleşmesi (Fuzzy Fallback)
    for (let k in TTKB_OFFICIAL_ELECTIVE_HOURS_MAP) {
        const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm.startsWith(kNorm) || kNorm.startsWith(norm)) {
            const gradeMap = TTKB_OFFICIAL_ELECTIVE_HOURS_MAP[k];
            if (gradeMap && gradeMap[gr] && Array.isArray(gradeMap[gr]) && gradeMap[gr].length > 0) {
                return gradeMap[gr];
            }
        }
    }

    // 3. Çizelgedeki rawHours verisinden ayrıştır
    const parsed = parseOfficialElectiveHours(rawHours);
    if (parsed.length > 0) {
        return parsed;
    }

    return [2];
}

export class UIComponentManager {
    constructor(dbService, stateService, normEngine, curriculumEngine) {
        this.db = dbService;
        this.state = stateService;
        this.norm = normEngine;
        this.normEngine = normEngine;
        this.curriculum = curriculumEngine || (typeof window !== 'undefined' ? window.curriculumEngine : null);
        this.reports = new MebReportsEngine(this.db, this.norm, this.curriculum);
    }

    showToast(message, type = "success") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        const icon = type === "warning" ? "⚠️" : (type === "danger" ? "🛑" : "✨");
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-text">${message}</span>`;
        container.appendChild(toast);

        // 2.6 saniye sonra yumuşakça silinerek kaybolsun
        setTimeout(() => {
            toast.classList.add("toast-fade-out");
            setTimeout(() => {
                toast.remove();
                if (container && container.children.length === 0) {
                    container.remove();
                }
            }, 600);
        }, 2600);
    }

    // --- 🌟 İLK GİRİŞ KARŞILAMA VE PROFESYONEL TANITIM TURU (ONBOARDING SHOWCASE) ---
    openOnboardingWelcomeModal(onFinishCallback = null) {
        let currentSlide = 0;
        const slides = [
            {
                badge: "👑 TÜRKİYE'NİN İLK VE TEK MEB NORM PLATFORMU",
                title: "NormMatik™ Dünyasına Hoş Geldiniz!",
                subtitle: "Günlerce süren karmaşık Excel tabloları, hesaplama hataları ve norm fazlası risklerine son!",
                icon: "🚀",
                contentHtml: `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin: 1.25rem 0;">
                        <div style="background: rgba(2, 132, 199, 0.08); border: 1.5px solid rgba(2, 132, 199, 0.25); border-radius: 12px; padding: 1rem; text-align: left;">
                            <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">⚡</div>
                            <div style="font-weight: 800; font-size: 0.92rem; color: var(--text-main);">Dakikalar İçinde Tam Hesaplama</div>
                            <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.4;">Tüm şubelerinizin ders yükünü ve öğretmen normlarını saniyeler içinde hesaplayın.</div>
                        </div>
                        <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 1rem; text-align: left;">
                            <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">📜</div>
                            <div style="font-weight: 800; font-size: 0.92rem; color: var(--text-main);">TTKB Çizelgeleri ve Mevzuat Referansı</div>
                            <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.4;">2026-2027 haftalık ders çizelgeleri ve 9 sayılı Kurul Kararı esas alınarak hesaplanır.</div>
                        </div>
                    </div>
                `
            },
            {
                badge: "📥 1 TIKLA SIFIR VERİ GİRİŞİ",
                title: "e-Okul Excel Listesini Sürükleyin, Bitti!",
                subtitle: "Tek tek şube, öğrenci sayısı veya ders girmekle saatlerinizi harcamayın.",
                icon: "📥",
                contentHtml: `
                    <div style="background: var(--bg-card-subtle); border: 2px dashed var(--primary); border-radius: 14px; padding: 1.25rem; text-align: center; margin: 1.25rem 0;">
                        <div style="font-size: 2.2rem; margin-bottom: 0.5rem; animation: pulse 2s infinite;">📑 ➔ ⚡ ➔ 🏫</div>
                        <div style="font-weight: 800; font-size: 0.95rem; color: var(--primary);">e-Okul Sınıf Şube Listesini İçe Aktarın</div>
                        <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem; max-width: 420px; margin-left: auto; margin-right: auto; line-height: 1.45;">
                            e-Okul'dan aldığınız standart Excel dosyasını seçtiğiniz anda 9, 10, 11 ve 12. sınıf şubeleriniz, mevcudiyetler ve TTKB zorunlu dersleri <strong>3 saniyede otomatik kurulur!</strong>
                        </p>
                    </div>
                `
            },
            {
                badge: "⚖️ AKILLI NORM VE İHTİYAÇ MOTORU",
                title: "Canlı Norm Rozetleri ve İhtiyaç Analizi",
                subtitle: "Hangi branşta öğretmen ihtiyacı var, hangisinde norm fazlası var anında görün!",
                icon: "⚖️",
                contentHtml: `
                    <div style="display: flex; flex-direction: column; gap: 0.65rem; margin: 1.25rem 0;">
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 0.6rem 0.9rem;">
                            <span style="font-weight: 700; font-size: 0.85rem;">Matematik (90 Saat Ders Yükü)</span>
                            <span style="background: #16a34a; color: #fff; font-weight: 800; font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">✓ 4 Norm (Kadrolu: 4) - TAM</span>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 0.6rem 0.9rem;">
                            <span style="font-weight: 700; font-size: 0.85rem;">Türk Dili ve Edebiyatı (110 Saat)</span>
                            <span style="background: #ea580c; color: #fff; font-weight: 800; font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">🚨 5 Norm (Mevcut: 3) - 2 İHTİYAÇ</span>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 0.6rem 0.9rem;">
                            <span style="font-weight: 700; font-size: 0.85rem;">Fizik (24 Saat Ders Yükü)</span>
                            <span style="background: #dc2626; color: #fff; font-weight: 800; font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">⚠️ 1 Norm (Mevcut: 2) - 1 FAZLA</span>
                        </div>
                    </div>
                `
            },
            {
                badge: "⚖️ YASAL UYARI & BÖLGE NORMU BİLGİLENDİRMESİ",
                title: "Resmî Kayıtlar ve Bölge Normu Hatırlatması",
                subtitle: "NormMatik™ bir karar destek ve ön planlama sistemidir.",
                icon: "⚠️",
                contentHtml: `
                    <div style="background: rgba(245, 158, 11, 0.08); border: 1.5px solid #f59e0b; border-radius: 12px; padding: 1.1rem; text-align: left; margin: 1.25rem 0;">
                        <div style="font-weight: 800; font-size: 0.88rem; color: #b45309; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                            <span>⚠️</span> Hukuki Sorumluluk Reddi ve Bölge Normu Kuralı
                        </div>
                        <p style="font-size: 0.77rem; color: var(--text-main); line-height: 1.5; margin-bottom: 0.6rem;">
                            1. <strong>MEBBİS Esastır:</strong> Bu sistem tarafından üretilen hesaplamalar okul içi ön hazırlık niteliğindedir. Resmî MEBBİS veri tabanı ve Bakanlık onayları yerine geçmez.
                        </p>
                        <p style="font-size: 0.77rem; color: var(--text-main); line-height: 1.5; margin-bottom: 0;">
                            2. <strong>Bölge Normu:</strong> Okulunuzda 33 saat derse bağımsız olarak 2 norm çıksa dahi; eğitim bölgesindeki artık saatler havuzuna göre okulunuza 1 norm takdir edilebilir. Nihai yetki MEB komisyonlarındadır.
                        </p>
                    </div>
                `
            },
            {
                badge: "🖨️ İLÇE MEM RESMÎ TESLİMAT FORMATI",
                title: "5 Sekmeli Excel ve İmza Bloklu Cetveller",
                subtitle: "Yönetici İcmali, Master Yük Matrisi ve Norm İhtiyaç Eylem Planı tek tıkla elinizde!",
                icon: "📊",
                contentHtml: `
                    <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-main); border-radius: 12px; padding: 1.1rem; text-align: left; margin: 1.25rem 0;">
                        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem;">
                            <span style="font-size: 1.4rem;">🏛️</span>
                            <div>
                                <div style="font-weight: 800; font-size: 0.88rem;">Kendi Antetinizi Tanımlayabildiğiniz Çıktılar</div>
                                <div style="font-size: 0.72rem; color: var(--text-muted);">Müdür, Başyardımcı ve Şube Müdürü imza onay blokları hazır.</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem;">
                            <span style="background: #e2e8f0; color: #1e293b; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">📊 Master Matris Grid</span>
                            <span style="background: #e2e8f0; color: #1e293b; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">🏛️ Yönetici İcmali</span>
                            <span style="background: #e2e8f0; color: #1e293b; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">🚨 İhtiyaç/Fazla Planı</span>
                            <span style="background: #e2e8f0; color: #1e293b; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">🧩 Atölye Bölünmeleri</span>
                        </div>
                    </div>
                `
            }
        ];

        const renderSlide = (idx) => {
            const slide = slides[idx];
            const isLast = (idx === slides.length - 1);

            const dotsHtml = slides.map((_, dIdx) => `
                <span class="onboarding-dot ${dIdx === idx ? 'active' : ''}" style="width: ${dIdx === idx ? '24px' : '8px'}; height: 8px; border-radius: 9999px; background: ${dIdx === idx ? 'var(--primary)' : 'var(--border-main)'}; display: inline-block; transition: all 0.3s; cursor: pointer;" data-dot="${dIdx}"></span>
            `).join("");

            const modalHtml = `
                <div class="modal-overlay active" id="onboarding-modal" style="z-index: 999999;">
                    <div class="modal-box" style="max-width: 580px; padding: 1.75rem; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center;">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <span style="background: rgba(2, 132, 199, 0.12); color: var(--primary); font-weight: 800; font-size: 0.7rem; padding: 0.25rem 0.75rem; border-radius: 9999px; letter-spacing: 0.04em;">
                                ${slide.badge}
                            </span>
                            <button class="modal-close-btn" id="btn-skip-onboarding" style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Tanıtımı Geç ✕</button>
                        </div>

                        <div style="margin: 0.5rem 0 1rem 0;">
                            <div style="font-size: 1.35rem; font-weight: 900; color: var(--text-main); line-height: 1.3;">
                                ${slide.title}
                            </div>
                            <div style="font-size: 0.84rem; color: var(--text-muted); margin-top: 0.35rem; line-height: 1.45;">
                                ${slide.subtitle}
                            </div>
                        </div>

                        ${slide.contentHtml}

                        <!-- Tekrar Gösterme Onay Kutusu -->
                        <div style="margin-top: 1rem; display: flex; align-items: center; justify-content: flex-start;">
                            <label style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.76rem; color: var(--text-muted); cursor: pointer; user-select: none;">
                                <input type="checkbox" id="chk-dont-show-onboarding" checked style="cursor: pointer; width: 15px; height: 15px;">
                                <span>Bu tanıtım ekranını bir daha gösterme</span>
                            </label>
                        </div>

                        <!-- Alt Gezinme & Aksiyon Çubuğu -->
                        <div style="margin-top: 0.75rem; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 1rem;">
                            <div style="display: flex; gap: 0.4rem; align-items: center;">
                                ${dotsHtml}
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                ${idx > 0 ? `<button class="btn btn-outline" id="btn-onboarding-prev" style="padding: 0.55rem 0.9rem; font-weight: 700;">❮ Geri</button>` : ''}
                                <button class="btn btn-primary" id="btn-onboarding-next" style="padding: 0.6rem 1.3rem; font-weight: 800; font-size: 0.88rem; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);">
                                    ${isLast ? '🚀 Başlayalım ve Okulu Kuralım' : 'İleri ❯'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            `;

            this.renderModal(modalHtml);

            // Event Listeners
            document.querySelectorAll(".onboarding-dot").forEach(d => {
                d.addEventListener("click", () => {
                    const target = parseInt(d.getAttribute("data-dot"), 10);
                    currentSlide = target;
                    renderSlide(currentSlide);
                });
            });

            document.getElementById("btn-onboarding-prev")?.addEventListener("click", () => {
                if (currentSlide > 0) {
                    currentSlide--;
                    renderSlide(currentSlide);
                }
            });

            document.getElementById("btn-onboarding-next")?.addEventListener("click", () => {
                if (!isLast) {
                    currentSlide++;
                    renderSlide(currentSlide);
                } else {
                    finishOnboarding();
                }
            });

            document.getElementById("btn-skip-onboarding")?.addEventListener("click", () => {
                finishOnboarding();
            });
        };

        const finishOnboarding = () => {
            const chk = document.getElementById("chk-dont-show-onboarding");
            if (chk && chk.checked) {
                try {
                    localStorage.setItem("normmatik_onboarding_seen", "true");
                } catch (e) {}
            } else {
                try {
                    localStorage.removeItem("normmatik_onboarding_seen");
                } catch (e) {}
            }
            this.closeModal("onboarding-modal");
            if (typeof onFinishCallback === 'function') {
                onFinishCallback();
            }
        };

        renderSlide(0);
    }

    openSchoolSetupModal() {
        const types = this.db.getSchoolTypes();
        const currentType = this.state.state.okulBilgisi.okulTuru || "anadolu_lisesi";
        const isLocked = this.state.state.okulBilgisi.okulTuruKilitli;

        // Okul türlerini kategorilere göre grupla
        const grouped = {};
        types.forEach(t => {
            const cat = t.category || "Diğer Okullar";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(t);
        });

        let optionsHtml = "";
        for (const [catName, catTypes] of Object.entries(grouped)) {
            optionsHtml += `<optgroup label="📂 ${catName}">`;
            catTypes.forEach(t => {
                optionsHtml += `<option value="${t.id}" ${currentType === t.id ? 'selected' : ''}>${t.name}</option>`;
            });
            optionsHtml += `</optgroup>`;
        }

        const modalHtml = `
            <div class="modal-overlay active" id="school-setup-modal" style="z-index: 99999;">
                <div class="modal-box" style="max-width: 580px; padding: 1.75rem;">
                    <div class="modal-header" style="border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.25rem;">
                        <div class="modal-title" style="font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
                            <span>👑</span> NormMatik™ Okul Kurulumu ve Başlangıç
                        </div>
                    </div>
                    
                    <div class="modal-body" style="padding: 0;">
                        <!-- 1. BAŞLANGIÇ SEÇENEK KARTLARI -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
                            <div id="card-setup-custom" class="setup-choice-card active" style="border: 2px solid var(--primary); background: rgba(2, 132, 199, 0.08); padding: 1rem; border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">🏫</div>
                                <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-main);">Kendi Okulumu Kur</div>
                                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Kendi kurum bilgilerinizi girerek başlayın</div>
                            </div>
                            <div id="card-setup-demo" class="setup-choice-card" style="border: 1.5px solid var(--border); background: var(--bg-card-subtle); padding: 1rem; border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">🚀</div>
                                <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-main);">Örnek Okul (Demo)</div>
                                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Örnek sınıflarla sistemi hemen keşfedin</div>
                            </div>
                        </div>

                        <!-- 2. KENDİ OKULUMU KUR FORMU -->
                        <div id="setup-form-custom">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">İl</label>
                                    <input type="text" id="setup-il" class="form-control" placeholder="Örn: ANKARA" value="${this.state.state.okulBilgisi.il || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">İlçe</label>
                                    <input type="text" id="setup-ilce" class="form-control" placeholder="Örn: ÇANKAYA" value="${this.state.state.okulBilgisi.ilce || ''}">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1.2fr 2fr; gap: 0.75rem; margin-bottom: 0.75rem;">
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">MEB Kurum Kodu *</label>
                                    <input type="text" id="setup-kurum-kodu" class="form-control" placeholder="Örn: 754123" maxlength="10" value="${this.state.state.okulBilgisi.kurumKodu || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Eğitim-Öğretim Sezonu</label>
                                    <select id="setup-season" class="form-control">
                                        <option value="2026-2027" selected>2026-2027</option>
                                        <option value="2025-2026">2025-2026</option>
                                        <option value="2027-2028">2027-2028</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom: 0.75rem;">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Okul / Kurum Tam Adı *</label>
                                <input type="text" id="setup-school-name" class="form-control" placeholder="Örn: Atatürk Anadolu Lisesi" value="${this.state.state.okulBilgisi.okulAdi || ''}">
                            </div>

                            <div class="form-group" style="margin-bottom: 0.5rem;">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Okul Türü (Müfredat ve Norm Kuralı)</label>
                                <select id="setup-school-type" class="form-control" ${isLocked ? 'disabled' : ''}>
                                    ${optionsHtml}
                                </select>
                                <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.35rem; line-height: 1.4;">
                                    * Seçilen okul türüne ait TTKB haftalık ders çizelgeleri ve norm baremleri otomatik yüklenir.
                                </p>
                            </div>
                        </div>

                        <!-- 3. DEMO MODU AÇIKLAMA KUTUSU -->
                        <div id="setup-form-demo" style="display: none; background: rgba(16, 185, 129, 0.08); border: 1.5px dashed #10b981; border-radius: 12px; padding: 1.25rem; text-align: center; margin-bottom: 1rem;">
                            <div style="font-size: 1.1rem; font-weight: 800; color: #10b981; margin-bottom: 0.5rem;">🚀 Hızlı Başlangıç Demo Paketi</div>
                            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
                                Sisteme <strong>"DEMO LİSESİ"</strong> adı altında örnek sınıf şubeleri, seçmeli ders dağılımları ve norm hesaplama tablosu vitrin olarak yüklenecektir. (Resmî teslimat ve Excel çıktısı lisanslı sürüme özeldir). İstediğiniz an ayarlar menüsünden okulu sıfırlayabilirsiniz.
                            </p>
                            <button class="btn btn-success" id="btn-load-demo-school" style="width: 100%; padding: 0.85rem; font-weight: 800; font-size: 0.95rem;">
                                🚀 Örnek Okul ile Sistemi Hemen Başlat
                            </button>
                        </div>
                    </div>

                    <div class="modal-footer" style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
                        <button class="btn btn-primary" id="btn-save-school-setup" style="padding: 0.75rem 1.5rem; font-weight: 800;">
                            ✨ Kurulumu Tamamla ve Başla
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        const cardCustom = document.getElementById("card-setup-custom");
        const cardDemo = document.getElementById("card-setup-demo");
        const formCustom = document.getElementById("setup-form-custom");
        const formDemo = document.getElementById("setup-form-demo");
        const btnSave = document.getElementById("btn-save-school-setup");

        cardCustom?.addEventListener("click", () => {
            cardCustom.style.border = "2px solid var(--primary)";
            cardCustom.style.background = "rgba(2, 132, 199, 0.08)";
            cardDemo.style.border = "1.5px solid var(--border)";
            cardDemo.style.background = "var(--bg-card-subtle)";
            formCustom.style.display = "block";
            formDemo.style.display = "none";
            btnSave.style.display = "block";
        });

        cardDemo?.addEventListener("click", () => {
            cardDemo.style.border = "2px solid #10b981";
            cardDemo.style.background = "rgba(16, 185, 129, 0.08)";
            cardCustom.style.border = "1.5px solid var(--border)";
            cardCustom.style.background = "var(--bg-card-subtle)";
            formCustom.style.display = "none";
            formDemo.style.display = "block";
            btnSave.style.display = "none";
        });

        // Demo Başlat Butonu
        document.getElementById("btn-load-demo-school")?.addEventListener("click", () => {
            this.state.loadDemoSchool(this.db, this.curriculum);
            this.closeModal("school-setup-modal");
            this.showToast("🚀 DEMO LİSESİ verileri başarıyla yüklendi!", "success");
        });

        // Kendi Okulunu Kur Butonu
        btnSave?.addEventListener("click", () => {
            const name = document.getElementById("setup-school-name")?.value.trim();
            const kurumKodu = document.getElementById("setup-kurum-kodu")?.value.trim();
            const il = document.getElementById("setup-il")?.value.trim();
            const ilce = document.getElementById("setup-ilce")?.value.trim();
            const season = document.getElementById("setup-season")?.value;
            const type = document.getElementById("setup-school-type")?.value;

            if (!name) {
                alert("Lütfen Okul / Kurum Adını yazınız.");
                document.getElementById("setup-school-name")?.focus();
                return;
            }

            this.state.updateSchoolInfo(name, season, kurumKodu, il, ilce);
            this.state.setSchoolType(type);
            this.closeModal("school-setup-modal");
            this.showToast(`✨ ${name} kurulumu başarıyla tamamlandı.`, "success");
        });
    }

    openEditSchoolNameModal() {
        this.openEditSchoolInfoModal();
    }

    openEditSchoolInfoModal() {
        const info = this.state.state.okulBilgisi;
        const types = this.db.getSchoolTypes();
        const currentType = types.find(t => t.id === info.okulTuru) || { name: "Belirtilmedi", category: "MEB" };
        const isLocked = (info.okulTuruKilitli && info.kurumKodu && info.kurumKodu !== "123456" && !info.isDemo);

        const modalHtml = `
            <div class="modal-overlay active" id="edit-school-modal" style="z-index: 99999;">
                <div class="modal-box" style="max-width: 520px; padding: 1.75rem;">
                    <div class="modal-header" style="border-bottom: 1px solid var(--border); padding-bottom: 0.85rem; margin-bottom: 1.25rem;">
                        <div class="modal-title" style="font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
                            <span>⚙️</span> Okul Bilgileri ve Yönetimi
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('edit-school-modal').remove()">✕</button>
                    </div>
                    
                    <div class="modal-body" style="padding: 0;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
                            <div class="form-group">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">İl (Düzenlenebilir)</label>
                                <input type="text" id="edit-school-il" class="form-control" value="${info.il || ''}" placeholder="Örn: KONYA">
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">İlçe (Düzenlenebilir)</label>
                                <input type="text" id="edit-school-ilce" class="form-control" value="${info.ilce || ''}" placeholder="Örn: AKŞEHİR">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1.2fr 2fr; gap: 0.75rem; margin-bottom: 0.75rem;">
                            <div class="form-group">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">MEB Kurum Kodu 🔒</label>
                                <input type="text" id="edit-school-kurum-kodu" class="form-control" value="${info.kurumKodu || ''}" readonly disabled style="background: rgba(15, 23, 42, 0.4); cursor: not-allowed; opacity: 0.85; font-family: monospace; font-weight: 800;">
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Eğitim Sezonu</label>
                                <select id="edit-school-season" class="form-control">
                                    <option value="2026-2027" ${info.sezon === '2026-2027' ? 'selected' : ''}>2026-2027</option>
                                    <option value="2025-2026" ${info.sezon === '2025-2026' ? 'selected' : ''}>2025-2026</option>
                                    <option value="2027-2028" ${info.sezon === '2027-2028' ? 'selected' : ''}>2027-2028</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700; margin-bottom: 0;">Okul / Kurum Resmî Adı 🔒</label>
                                <span style="font-size: 0.7rem; color: #0284c7; font-weight: 800;">🔒 Lisansla Mühürlü</span>
                            </div>
                            <input type="text" id="edit-school-name" class="form-control" value="${info.okulAdi || ''}" readonly disabled style="background: rgba(15, 23, 42, 0.4); cursor: not-allowed; opacity: 0.85; font-weight: 800;">
                        </div>

                        <div style="background: var(--bg-card-subtle); border: 1px solid var(--border); border-radius: 10px; padding: 0.85rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">MEVCUT OKUL TÜRÜ</div>
                                <div style="font-size: 0.9rem; font-weight: 800; color: var(--primary);">📜 ${currentType.name}</div>
                            </div>
                            ${isLocked ? `
                                <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 800; font-size: 0.76rem;">
                                    🔒 Mühürlü Lisans Türü
                                </span>
                            ` : `
                                <button class="btn btn-sm btn-danger-outline" id="btn-trigger-reset-school" style="font-size: 0.78rem;">
                                    🔄 Okul Türünü Değiştir / Sıfırla
                                </button>
                            `}
                        </div>
                    </div>

                    <div class="modal-footer" style="border-top: 1px solid var(--border); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <button class="btn btn-outline" onclick="document.getElementById('edit-school-modal').remove()">Kapat</button>
                        <button class="btn btn-primary" id="btn-save-edited-school-info" style="font-weight: 800;">💾 Bilgileri Kaydet</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        document.getElementById("btn-save-edited-school-info")?.addEventListener("click", () => {
            const il = document.getElementById("edit-school-il")?.value.trim();
            const ilce = document.getElementById("edit-school-ilce")?.value.trim();
            const season = document.getElementById("edit-school-season")?.value;

            this.state.updateSchoolInfo(info.okulAdi, season, info.kurumKodu, il, ilce);
            this.closeModal("edit-school-modal");
            this.showToast("İl/İlçe ve Sezon bilgileri güncellendi.", "success");
        });

        document.getElementById("btn-trigger-reset-school")?.addEventListener("click", () => {
            this.closeModal("edit-school-modal");
            this.openResetSchoolConfirmModal();
        });
    }

    openEditSchoolNameModal() {
        const info = this.state.state.okulBilgisi;
        const modalHtml = `
            <div class="modal-overlay active" id="edit-school-modal">
                <div class="modal-box" style="max-width: 480px;">
                    <div class="modal-header">
                        <div class="modal-title">✏️ Okul Adını Düzenle</div>
                        <button class="modal-close-btn" onclick="document.getElementById('edit-school-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Kurum / Okul Adı</label>
                            <input type="text" id="input-edit-school-name" class="form-control" value="${info.okulAdi}" placeholder="Okul adını yazınız...">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('edit-school-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-save-edited-school-name">Kaydet</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        const inputEl = document.getElementById("input-edit-school-name");
        if (inputEl && typeof inputEl.focus === 'function') {
            inputEl.focus();
            if (typeof inputEl.select === 'function') inputEl.select();
        }

        const saveFn = () => {
            const newName = inputEl?.value.trim();
            if (newName) {
                this.state.updateSchoolInfo(newName);
                this.closeModal("edit-school-modal");
                this.showToast("Okul adı güncellendi.", "success");
            }
        };

        document.getElementById("btn-save-edited-school-name")?.addEventListener("click", saveFn);
        inputEl?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") saveFn();
        });
    }

    openResetSchoolConfirmModal() {
        const modalHtml = `
            <div class="modal-overlay active" id="reset-confirm-modal">
                <div class="modal-box" style="max-width: 480px;">
                    <div class="modal-header">
                        <div class="modal-title" style="color: var(--status-danger-text);">⚠️ Okulu Sıfırla ve Tür Değiştir</div>
                        <button class="modal-close-btn" onclick="document.getElementById('reset-confirm-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
                            Okul türünü değiştirmek mevcut <strong>tüm şubeleri, seçmeli dersleri ve norm hesaplarını silecektir</strong>.
                            Sıfırdan yeni bir okul kurmak istediğinizden emin misiniz?
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('reset-confirm-modal').remove()">Vazgeç</button>
                        <button class="btn btn-danger-outline" id="btn-confirm-reset-school">Evet, Tümünü Sıfırla</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        document.getElementById("btn-confirm-reset-school").addEventListener("click", () => {
            this.state.resetSchool();
            this.closeModal("reset-confirm-modal");
            this.openSchoolSetupModal();
            this.showToast("Okul sıfırlandı. Lütfen yeni okul türünü seçin.", "warning");
        });
    }

    // --- MANUEL TEK ŞUBE EKLEME / DÜZENLEME MODALI ---
    openAddSectionModal(sectionToEdit = null) {
        const isEditing = !!sectionToEdit;
        const subelerList = this.state.state.subeler || [];
        if (!isEditing && typeof window !== 'undefined' && window.licenseManager && !window.licenseManager.canAddSection(subelerList.length)) {
            alert("🔒 LİSANS GEREKLİ (Maksimum 3 Şube): Ücretsiz deneme sürümünde en fazla 3 şube oluşturulabilir. Okulunuzun tüm şubelerini eklemek ve sınırsız norm hesaplamak için lütfen yıllık lisans anahtarınızı aktifleştiriniz.");
            this.openLicenseModal();
            return;
        }
        const schoolType = this.state.state.okulBilgisi.okulTuru;
        const types = this.db.getSchoolTypes();
        const typeInfo = types.find(t => t.id === schoolType) || { gradeLevels: ["9", "10", "11", "12"] };

        const gradeLevels = typeInfo.gradeLevels || ["9", "10", "11", "12"];
        const selectedGrade = sectionToEdit ? sectionToEdit.sinifSeviyesi : (gradeLevels[0] || "9");

        const gradeOptions = gradeLevels.map(g => `
            <option value="${g}" ${selectedGrade === g ? 'selected' : ''}>
                ${String(g).toLowerCase() === 'hazirlik' ? 'Hazırlık' : g + '. Sınıf'}
            </option>
        `).join("");

        // Meslek Alanları Listesi & Akıllı ID Eşleştirme
        // Okul türü GEÇİLMEK ZORUNDA: Özel Program liselerinde bu liste
        // meslek alanları değil, okulun TEMALARIDIR. Parametresiz çağrı
        // onlara meslek lisesi alanlarını gösterirdi.
        const areas = this.db.getVocationalAreas(schoolType);
        const areaLabel = typeInfo.temaAdi || "Meslek / Uzmanlık Alanı";
        const areaEmptyLabel = typeInfo.temaAdi
            ? "-- Tema Seçilmedi --"
            : "-- Alan Seçilmedi (Genel / Ortak) --";
        let selectedAreaId = sectionToEdit?.alanId || "";
        if (selectedAreaId) {
            const directMatch = areas.find(a => a.id === selectedAreaId);
            if (!directMatch) {
                const normKey = String(selectedAreaId).toLowerCase().replace(/[^a-z0-9]/g, '');
                const fuzzy = areas.find(a => a.id.toLowerCase().replace(/[^a-z0-9]/g, '') === normKey || 
                                              a.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normKey) ||
                                              normKey.includes(a.id.toLowerCase().replace(/[^a-z0-9]/g, '')));
                if (fuzzy) selectedAreaId = fuzzy.id;
            }
        }

        const areaOptions = `<option value="">${areaEmptyLabel}</option>` + areas.map(a => `
            <option value="${a.id}" ${selectedAreaId === a.id ? 'selected' : ''}>
                ${a.name}
            </option>
        `).join("");

        // Seçilen Alana ve Sınıf Seviyesine Ait Dallar (Dinamik Filtreleme)
        const currentBranches = selectedAreaId ? this.db.getBranchesForArea(selectedAreaId, schoolType, selectedGrade) : [];
        const selectedDal = sectionToEdit?.dalAdi || "";
        let branchOptions = `<option value="">-- Dal Seçilmedi (Opsiyonel / Ortak Alan) --</option>`;
        if (currentBranches.length > 0) {
            currentBranches.forEach(b => {
                branchOptions += `<option value="${b}" ${selectedDal === b ? 'selected' : ''}>${b}</option>`;
            });
        } else if (selectedDal && selectedDal !== 'Özel Eğitim Sınıfı') {
            branchOptions += `<option value="${selectedDal}" selected>${selectedDal}</option>`;
        }

        const modalHtml = `
            <div class="modal-overlay active" id="section-modal">
                <div class="modal-box" style="max-width: 540px;">
                    <div class="modal-header">
                        <div class="modal-title">📝 ${isEditing ? 'Şubeyi Düzenle: ' + sectionToEdit.subeAdi : 'Yeni Şube Ekle (Manuel)'}</div>
                        <button class="modal-close-btn" onclick="document.getElementById('section-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Sınıf Kademesi</label>
                            <select id="sec-grade" class="form-control">
                                ${gradeOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Şube Adı (Manuel İsimlendirme)</label>
                            <input type="text" id="sec-name" class="form-control" placeholder="Örn: 9-A, Hazırlık-A, 11-Bilişim-A..." value="${sectionToEdit?.subeAdi || (String(selectedGrade).toLowerCase() === 'hazirlik' ? 'Hazırlık-A' : selectedGrade + '-A')}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Öğrenci Mevcudu</label>
                            <input type="number" id="sec-students" class="form-control" value="${sectionToEdit?.ogrenciSayisi || 30}" min="1" max="60">
                        </div>
                        
                        <div class="form-group" id="group-sec-area" style="${typeInfo.hasAreas ? '' : 'display:none;'}">
                            <label class="form-label">${areaLabel}</label>
                            <select id="sec-area" class="form-control">
                                ${areaOptions}
                            </select>
                        </div>

                        <div class="form-group" id="group-sec-branch" style="${typeInfo.hasAreas && !typeInfo.temaAdi ? '' : 'display:none;'}">
                            <label class="form-label">Meslek Dalı (Opsiyonel / Alana Göre Filtrelenir)</label>
                            <select id="sec-branch" class="form-control">
                                ${branchOptions}
                            </select>
                            <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">
                                * Dal seçildiğinde o dala ait özel alan/dal dersleri orta panele otomatik gelir.
                            </p>
                        </div>
                        <!-- 🟣 ÖZEL EĞİTİM SINIFI SEÇENEĞİ (MEB NORM KADRO YÖN. MD. 17/1-C) -->
                        <div class="form-group" style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 0.75rem; margin-top: 0.5rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #6d28d9; cursor: pointer; margin-bottom: 0;">
                                <input type="checkbox" id="sec-is-special-edu" ${sectionToEdit?.isSpecialEdu ? 'checked' : ''}>
                                🟣 Özel Eğitim Sınıfı (MEB Norm Kadro Yön. Md. 17/1-c)
                            </label>
                            <p style="font-size: 0.73rem; color: #5b21b6; margin-top: 0.35rem; margin-bottom: 0; line-height: 1.4;">
                                * İşaretlendiğinde bu şube için doğrudan <strong>2 Özel Eğitim Öğretmeni Normu</strong> tahsis edilir ve haftalık 30 saatlik özel eğitim müfredatı yüklenir.
                            </p>
                        </div>
                        ${isEditing ? `
                        <div class="form-group" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0.65rem; margin-top: 0.5rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #166534; cursor: pointer; margin-bottom: 0;">
                                <input type="checkbox" id="sec-refresh-curriculum" checked>
                                🔄 Zorunlu dersleri güncel MEB müfredatına göre otomatik yenile
                            </label>
                            <p style="font-size: 0.72rem; color: #15803d; margin-top: 0.25rem; margin-bottom: 0;">
                                * İşaretli olduğunda bu şubenin zorunlu dersleri en son MEB ÇÖP veritabanıyla eşitlenir (Seçtiğiniz seçmeli dersler korunur).
                            </p>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('section-modal').remove()">İptal</button>
                        <button class="btn btn-primary" id="btn-save-single-section">${isEditing ? 'Güncelle' : 'Şubeyi Ekle'}</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        const gradeSelect = document.getElementById("sec-grade");
        const areaSelect = document.getElementById("sec-area");
        const branchSelect = document.getElementById("sec-branch");

        const updateDynamicBranches = () => {
            if (!areaSelect || !branchSelect) return;
            const areaId = areaSelect.value;
            const gradeVal = gradeSelect ? gradeSelect.value : null;
            if (!areaId) {
                branchSelect.innerHTML = `<option value="">-- Dal Seçilmedi (Opsiyonel / Ortak Alan) --</option>`;
                return;
            }
            const branches = this.db.getBranchesForArea(areaId, schoolType, gradeVal);
            let bHtml = `<option value="">-- Dal Seçilmedi (Opsiyonel / Ortak Alan) --</option>`;
            if (branches.length > 0) {
                branches.forEach(b => {
                    bHtml += `<option value="${b}">${b}</option>`;
                });
            } else {
                bHtml += `<option value="${areaId.toUpperCase()} DALI">${areaId.toUpperCase()} DALI</option>`;
            }
            branchSelect.innerHTML = bHtml;
        };

        areaSelect?.addEventListener("change", updateDynamicBranches);
        gradeSelect?.addEventListener("change", updateDynamicBranches);

        document.getElementById("btn-save-single-section").addEventListener("click", () => {
            try {
                const grade = document.getElementById("sec-grade").value;
                const defaultPrefix = String(grade).toLowerCase() === 'hazirlik' ? 'Hazırlık' : grade;
                const name = document.getElementById("sec-name").value.trim() || `${defaultPrefix}-A`;
                const students = parseInt(document.getElementById("sec-students").value || 30, 10);
                const areaId = document.getElementById("sec-area")?.value || null;
                const dalName = document.getElementById("sec-branch")?.value || null;
                const isSpecialEdu = document.getElementById("sec-is-special-edu")?.checked || false;

                if (isEditing) {
                    const originalCourses = sectionToEdit.zorunluDersler || [];
                    const refreshCurriculum = document.getElementById("sec-refresh-curriculum")?.checked || false;
                    let updatedCourses = originalCourses;
                    // Eğer kullanıcı onay verdiyse veya alan, dal, sınıf, özel eğitim statüsü değiştiyse müfredatı yeniden çöz
                    if (refreshCurriculum || 
                        sectionToEdit.alanId !== (isSpecialEdu ? "ozel_egitim" : areaId) || 
                        sectionToEdit.dalAdi !== (isSpecialEdu ? "Özel Eğitim Sınıfı" : dalName) ||
                        sectionToEdit.sinifSeviyesi !== grade || 
                        sectionToEdit.isSpecialEdu !== isSpecialEdu) {
                        updatedCourses = this.curriculum.getMandatoryCourses(
                            schoolType, 
                            grade, 
                            isSpecialEdu ? "ozel_egitim" : areaId, 
                            isSpecialEdu ? "Özel Eğitim Sınıfı" : dalName
                        );
                    }
                    this.state.updateSection(sectionToEdit.id, {
                        sinifSeviyesi: grade,
                        subeAdi: name,
                        ogrenciSayisi: students,
                        alanId: isSpecialEdu ? "ozel_egitim" : areaId,
                        dalAdi: isSpecialEdu ? "Özel Eğitim Sınıfı" : dalName,
                        isSpecialEdu: isSpecialEdu,
                        specialEduType: isSpecialEdu ? "hafif_zihinsel" : null,
                        zorunluDersler: updatedCourses,
                        rehberlikVarMi: grade !== "12" && !isSpecialEdu
                    });
                    this.showToast("Şube başarıyla güncellendi.", "success");
                } else {
                    const defaultCourses = this.curriculum.getMandatoryCourses(
                        schoolType, 
                        grade, 
                        isSpecialEdu ? "ozel_egitim" : areaId, 
                        isSpecialEdu ? "Özel Eğitim Sınıfı" : dalName
                    );
                    this.state.addSection({
                        sinifSeviyesi: grade,
                        subeAdi: name,
                        ogrenciSayisi: students,
                        alanId: isSpecialEdu ? "ozel_egitim" : areaId,
                        dalAdi: isSpecialEdu ? "Özel Eğitim Sınıfı" : dalName,
                        isSpecialEdu: isSpecialEdu,
                        specialEduType: isSpecialEdu ? "hafif_zihinsel" : null,
                        zorunluDersler: defaultCourses,
                        secmeliDersler: [],
                        rehberlikVarMi: grade !== "12" && !isSpecialEdu
                    });
                    this.showToast(`${name} şubesi (${isSpecialEdu ? '🟣 Özel Eğitim' : (dalName || 'Genel')}) dersleriyle eklendi!`, "success");
                }

                this.closeModal("section-modal");
            } catch (err) {
                console.error("Şube kaydetme hatası:", err);
                alert("Şube eklenirken bir hata oluştu: " + err.message);
            }
        });
    }

    openBulkSectionWizard() {
        const schoolType = this.state.state.okulBilgisi.okulTuru;
        const types = this.db.getSchoolTypes();
        const typeInfo = types.find(t => t.id === schoolType) || { gradeLevels: ["9", "10", "11", "12"] };

        const gradeOptions = typeInfo.gradeLevels.map(g => `<option value="${g}">${String(g).toLowerCase() === 'hazirlik' ? 'Hazırlık' : g + '. Sınıf'}</option>`).join("");

        const modalHtml = `
            <div class="modal-overlay active" id="bulk-wizard-modal">
                <div class="modal-box" style="max-width: 500px;">
                    <div class="modal-header">
                        <div class="modal-title">⚡ Toplu Şube Üretici Sihirbazı</div>
                        <button class="modal-close-btn" onclick="document.getElementById('bulk-wizard-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Sınıf Kademesi</label>
                            <select id="bulk-grade" class="form-control">
                                ${gradeOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Kaç Şube Açılsın? (Örn: 8 şube -> A, B, C...)</label>
                            <input type="number" id="bulk-count" class="form-control" value="6" min="1" max="20">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Şube Başına Ortalama Öğrenci Mevcudu</label>
                            <input type="number" id="bulk-students" class="form-control" value="30" min="1" max="60">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('bulk-wizard-modal').remove()">İptal</button>
                        <button class="btn btn-primary" id="btn-create-bulk-sections">Şubeleri Toplu Oluştur</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        document.getElementById("btn-create-bulk-sections").addEventListener("click", () => {
            const grade = document.getElementById("bulk-grade").value;
            const count = parseInt(document.getElementById("bulk-count").value || 1, 10);
            const students = parseInt(document.getElementById("bulk-students").value || 30, 10);

            const defaultCourses = this.getMandatoryCoursesForGrade(grade);

            this.state.addBulkSections(grade, count, students, defaultCourses);
            this.closeModal("bulk-wizard-modal");
            const gradeLabel = String(grade).toLowerCase() === 'hazirlik' ? 'Hazırlık Sınıfı' : `${grade}. Sınıf`;
            this.showToast(`${count} adet ${gradeLabel} şubesi başarıyla oluşturuldu!`, "success");
        });
    }

    getElectiveThemeInfo(item) {
        if (item.isVocational || (item.kategori || '').includes('MESLEK') || (item.grup || '').includes('Meslek')) {
            return {
                id: "VOC",
                subId: "VOC",
                title: "Seçmeli Meslek",
                badge: "⚙️ Seçmeli Meslek",
                badgeClass: "theme-badge-voc",
                color: "#9333ea",
                icon: "⚙️"
            };
        }

        const norm = (String(item.ders || "") + " " + String(item.grup || "")).toLowerCase()
            .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
            .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/['’\-\.\,\(\)]/g, '');
        
        // 1. Din, Ahlak ve Değer
        if (norm.includes("din") || norm.includes("kuran") || norm.includes("peygamber") || 
            norm.includes("siyer") || norm.includes("ahlak") || norm.includes("adab") || 
            norm.includes("nezaket") || norm.includes("deger") || norm.includes("fikih") || 
            norm.includes("tefsir") || norm.includes("hadis") || norm.includes("akaid") || 
            norm.includes("kelam") || norm.includes("hitabet") || norm.includes("tasavvuf") || 
            norm.includes("islam") || norm.includes("yon verenler") || norm.includes("temel dini") ||
            norm.includes("arapca (metin") || norm.includes("dini musiki")) {
            return {
                id: "DEGER",
                subId: "DEGER",
                title: "Din, Ahlak ve Değer",
                badge: "🕊️ Din, Ahlak ve Değer",
                badgeClass: "theme-badge-deger",
                color: "#059669",
                icon: "🕊️"
            };
        }

        // 2. Kültür, Sanat ve Spor
        if (norm.includes("sanat") || norm.includes("muzik") || norm.includes("gorsel") || 
            norm.includes("spor") || norm.includes("fiziki") || norm.includes("resim") || 
            norm.includes("heykel") || norm.includes("masal") || norm.includes("destan") || 
            norm.includes("oyun") || norm.includes("drama") || norm.includes("tiyatro") || 
            norm.includes("halk oyun") || norm.includes("geleneksel sanat") || 
            norm.includes("ebru") || norm.includes("hat") || norm.includes("tezhip") || 
            norm.includes("minyatur") || norm.includes("calgi") || norm.includes("koro") || 
            norm.includes("sinema") || norm.includes("fotograf") || norm.includes("beden egitimi") ||
            norm.includes("diksiyon") || norm.includes("estetik") || norm.includes("ritim")) {
            return {
                id: "SANAT",
                subId: "SANAT",
                title: "Kültür, Sanat ve Spor",
                badge: "🎨 Kültür, Sanat ve Spor",
                badgeClass: "theme-badge-sanat",
                color: "#d97706",
                icon: "🎨"
            };
        }

        // 3. Bilişim ve Dijital Beceriler (TTKB İnsan ve Bilim)
        if (norm.includes("robotik") || norm.includes("kodlama") || norm.includes("yapay zeka") || 
            norm.includes("siber") || norm.includes("dijital") || norm.includes("programlama") || 
            norm.includes("yazilim") || norm.includes("bilisim") || norm.includes("algoritma") || 
            norm.includes("web") || norm.includes("mobil uygulama") || norm.includes("animasyon")) {
            return {
                id: "BILIM",
                subId: "BILISIM",
                title: "Bilişim ve Dijital Teknolojiler",
                badge: "💻 Bilişim & Dijital",
                badgeClass: "theme-badge-bilisim",
                color: "#0284c7",
                icon: "💻"
            };
        }

        // 4. Yabancı Diller ve İletişim (TTKB İnsan ve Bilim)
        if (norm.includes("yabanci dil") || norm.includes("almanca") || norm.includes("ingilizce") || 
            norm.includes("fransizca") || norm.includes("rusca") || norm.includes("arapca") || 
            norm.includes("ispanyolca") || norm.includes("cince") || norm.includes("edebiyati") || 
            norm.includes("hazirlik yabanci") || norm.includes("ikinci yabanci")) {
            return {
                id: "BILIM",
                subId: "DIL",
                title: "Yabancı Diller ve İletişim",
                badge: "🗣️ Yabancı Diller",
                badgeClass: "theme-badge-dil",
                color: "#2563eb",
                icon: "🗣️"
            };
        }

        // 5. İnsan, Toplum ve Bilim (Fen, Matematik, Sosyal Bilimler)
        return {
            id: "BILIM",
            subId: "BILIM",
            title: "İnsan, Toplum ve Bilim",
            badge: "🧪 İnsan, Toplum ve Bilim",
            badgeClass: "theme-badge-bilim",
            color: "#0891b2",
            icon: "🧪"
        };
    }

    openElectiveCourseDrawer(section) {
        const rawElectives = this.getAvailableElectivesForSection(section);
        const electives = rawElectives.map(e => ({
            ...e,
            theme: this.getElectiveThemeInfo(e)
        }));

        const schoolType = this.state.state.okulBilgisi.okulTuru || "";
        const targetHours = (window.app && typeof window.app.getTargetWeeklyHours === 'function') 
            ? window.app.getTargetWeeklyHours(section, schoolType) 
            : 40;

        const currentSec = this.state.getActiveSection() || section;
        const zorunluList = currentSec.zorunluDersler || [];
        const zorunluHours = zorunluList.reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);

        // Şubedeki mevcut seçmeli dersleri yerel taslak (draft) durumuna al
        const draftSelections = new Map();
        (currentSec.secmeliDersler || []).forEach(d => {
            const courseName = d.ders || d.ders_adi;
            const hour = parseInt(d.saat || d.ders_saati || 2, 10);
            const matched = electives.find(e => e.ders === courseName);
            draftSelections.set(courseName, {
                ders: courseName,
                saat: hour,
                grup: d.grup || (matched ? matched.grup : "Seçmeli"),
                defaultBranch: d.atananBrans || (matched ? matched.defaultBranch : "Diğer"),
                isVocational: d.isAtolye || d.isElectiveVocational || (matched ? matched.isVocational : false),
                theme: matched ? matched.theme : this.getElectiveThemeInfo(d)
            });
        });

        const vocCount = electives.filter(i => i.theme.subId === "VOC").length;
        const bilimCount = electives.filter(i => i.theme.subId === "BILIM").length;
        const degerCount = electives.filter(i => i.theme.subId === "DEGER").length;
        const sanatCount = electives.filter(i => i.theme.subId === "SANAT").length;
        const dilCount = electives.filter(i => i.theme.subId === "DIL").length;
        const bilisimCount = electives.filter(i => i.theme.subId === "BILISIM").length;
        
        let currentFilter = "ALL";
        let searchQuery = "";

        const getDraftStats = () => {
            let draftElectiveHours = 0;
            draftSelections.forEach(item => {
                draftElectiveHours += parseInt(item.saat || 0, 10);
            });
            const totalHours = zorunluHours + draftElectiveHours;
            const remaining = targetHours - totalHours;
            return {
                count: draftSelections.size,
                draftElectiveHours,
                totalHours,
                remaining
            };
        };

        const updateHeaderAndCommitBtn = () => {
            const statusEl = document.getElementById("elective-modal-status-badge");
            const commitBtn = document.getElementById("btn-commit-electives");
            const { count, draftElectiveHours, totalHours, remaining } = getDraftStats();

            if (statusEl) {
                if (totalHours === targetHours) {
                    statusEl.className = "elective-status-badge ok";
                    statusEl.innerHTML = `⏱️ Toplam: <strong>${totalHours}/${targetHours} Saat</strong> (Hedefe Ulaşıldı ✓)`;
                } else if (totalHours < targetHours) {
                    statusEl.className = "elective-status-badge warn";
                    statusEl.innerHTML = `⏱️ Toplam: <strong>${totalHours}/${targetHours} Saat</strong> (<strong>${remaining} Saat Seçmeli Ders Eksik</strong>)`;
                } else {
                    statusEl.className = "elective-status-badge over";
                    statusEl.innerHTML = `⏱️ Toplam: <strong>${totalHours}/${targetHours} Saat</strong> (<strong>${totalHours - targetHours} Saat</strong> Fazla)`;
                }
            }

            if (commitBtn) {
                commitBtn.innerHTML = `💾 Seçilen Dersleri Şubeye Aktar (${count} Ders • ${draftElectiveHours} Saat) ✓`;
            }
        };

        const THEME_GROUPS = [
            { key: "BILIM", title: "İnsan, Toplum ve Bilim Dersleri", icon: "🧪", color: "#0284c7" },
            { key: "DEGER", title: "Din, Ahlak ve Değer Dersleri", icon: "🕊️", color: "#059669" },
            { key: "SANAT", title: "Kültür, Sanat ve Spor Dersleri", icon: "🎨", color: "#d97706" },
            { key: "DIL", title: "Yabancı Diller ve İletişim Dersleri", icon: "🗣️", color: "#4f46e5" },
            { key: "BILISIM", title: "Bilişim ve Dijital Teknolojiler", icon: "💻", color: "#0891b2" },
            { key: "VOC", title: "Seçmeli Meslek ve Atölye Dersleri", icon: "⚙️", color: "#7c3aed" }
        ];

        const renderList = () => {
            const bodyEl = document.getElementById("elective-modal-list");
            if (!bodyEl) return;

            const filtered = electives.filter(item => {
                if (currentFilter !== "ALL") {
                    if (item.theme.subId !== currentFilter && item.theme.id !== currentFilter) {
                        return false;
                    }
                }
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase().replace(/i/g, 'i').replace(/ı/g, 'i');
                    const name = String(item.ders || "").toLowerCase().replace(/i/g, 'i').replace(/ı/g, 'i');
                    return name.includes(q);
                }
                return true;
            });

            if (filtered.length === 0) {
                bodyEl.innerHTML = `
                    <div style="text-align:center; padding: 3rem 1rem; color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">
                        🔍 Aradığınız kriterlere uygun seçmeli ders bulunamadı.
                    </div>
                `;
                return;
            }

            let groupsHtml = "";

            THEME_GROUPS.forEach(grp => {
                const groupCourses = filtered.filter(item => (item.theme.subId === grp.key || item.theme.id === grp.key));
                if (groupCourses.length === 0) return;

                groupsHtml += `
                    <div class="theme-group-block">
                        <div class="theme-group-header" style="--grp-color: ${grp.color};">
                            <div class="theme-group-title">
                                <span class="group-icon">${grp.icon}</span>
                                <span class="group-name">${grp.title}</span>
                            </div>
                            <span class="group-count-badge">${groupCourses.length} Ders</span>
                        </div>
                        <div class="theme-group-items">
                            ${groupCourses.map(item => {
                                const isSelected = draftSelections.has(item.ders);
                                const draftItem = draftSelections.get(item.ders);
                                const activeHours = isSelected ? draftItem.saat : (item.selectedHour || item.hoursOptions[0] || 2);

                                return `
                                    <div class="elective-table-row ${isSelected ? 'row-is-selected' : ''}" data-course="${item.ders}" style="--row-theme: ${grp.color};">
                                        <div class="row-selection-indicator"></div>
                                        <div class="row-info-col">
                                            <span class="row-course-title">${item.ders}</span>
                                        </div>
                                        <div class="row-action-col">
                                            <div class="row-hours-group">
                                                ${item.hoursOptions.map(h => `
                                                    <button type="button" class="table-hour-btn ${activeHours === h ? (isSelected ? 'hour-active-selected' : 'hour-active-preview') : ''}" data-course="${item.ders}" data-hour="${h}">
                                                        ${h} Saat
                                                    </button>
                                                `).join('')}
                                            </div>
                                            <div class="row-status-pill ${isSelected ? 'pill-selected' : 'pill-unselected'}">
                                                ${isSelected ? `✓ Seçildi (${activeHours}s)` : '+ Seç'}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `;
            });

            bodyEl.innerHTML = groupsHtml;

            // Satıra veya Seç butonuna tıklayınca Seç/Kaldır
            bodyEl.querySelectorAll(".elective-table-row").forEach(rowEl => {
                rowEl.addEventListener("click", (e) => {
                    // Eğer doğrudan saat butonuna tıklandıysa satır tıklamasını saat fonksiyonuna devret
                    if (e.target.closest(".table-hour-btn")) return;

                    const cName = rowEl.dataset.course;
                    const item = electives.find(i => i.ders === cName);
                    if (!item) return;

                    if (draftSelections.has(cName)) {
                        draftSelections.delete(cName);
                    } else {
                        const h = item.selectedHour || item.hoursOptions[0] || 2;
                        draftSelections.set(cName, {
                            ders: item.ders,
                            saat: h,
                            grup: item.grup || "Seçmeli",
                            defaultBranch: item.defaultBranch || "Diğer",
                            isVocational: !!item.isVocational,
                            theme: item.theme
                        });
                    }
                    updateHeaderAndCommitBtn();
                    renderList();
                });
            });

            // Saat butonlarına tıklama (Saat değiştirir ve gerekiyorsa seçili yapar)
            bodyEl.querySelectorAll(".table-hour-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const cName = btn.dataset.course;
                    const hour = parseInt(btn.dataset.hour, 10);
                    const item = electives.find(i => i.ders === cName);
                    if (!item) return;

                    item.selectedHour = hour;

                    if (draftSelections.has(cName)) {
                        // Zaten seçiliyse saatini güncelle
                        const currentDraft = draftSelections.get(cName);
                        currentDraft.saat = hour;
                    } else {
                        // Seçili değilse direkt bu saat ile seç
                        draftSelections.set(cName, {
                            ders: item.ders,
                            saat: hour,
                            grup: item.grup || "Seçmeli",
                            defaultBranch: item.defaultBranch || "Diğer",
                            isVocational: !!item.isVocational,
                            theme: item.theme
                        });
                    }
                    updateHeaderAndCommitBtn();
                    renderList();
                });
            });
        };

        const modalHtml = `
            <div class="modal-overlay active" id="elective-drawer-modal">
                <div class="modal-box elective-calm-modal">
                    <!-- SADE VE KONTRASTLI HEADER -->
                    <div class="elective-calm-header">
                        <div class="header-left-cluster">
                            <div>
                                <h3 class="header-main-title">Seçmeli Ders Ekle: ${section.subeAdi}</h3>
                                <p class="header-sub-text">${section.sinifSeviyesi}. Sınıf • ${section.ogrenciSayisi} Öğrenci • ${schoolType}</p>
                            </div>
                        </div>
                        <div class="header-right-cluster">
                            <div id="elective-modal-status-badge" class="elective-status-badge"></div>
                            <button class="header-close-btn" id="btn-close-elective-modal">✕</button>
                        </div>
                    </div>

                    <!-- FİLTRE VE ARAMA PANELİ -->
                    <div class="elective-calm-toolbar">
                        <!-- TEMA SEKMELERİ -->
                        <div class="calm-tabs-row">
                            <button class="calm-tab-btn active" data-tab="ALL">
                                📋 Tümü (${electives.length})
                            </button>
                            <button class="calm-tab-btn" data-tab="BILIM">
                                🧪 İnsan ve Bilim (${bilimCount})
                            </button>
                            <button class="calm-tab-btn" data-tab="DEGER">
                                🕊️ Din ve Değer (${degerCount})
                            </button>
                            <button class="calm-tab-btn" data-tab="SANAT">
                                🎨 Sanat ve Spor (${sanatCount})
                            </button>
                            <button class="calm-tab-btn" data-tab="DIL">
                                🗣️ Yabancı Diller (${dilCount})
                            </button>
                            <button class="calm-tab-btn" data-tab="BILISIM">
                                💻 Bilişim (${bilisimCount})
                            </button>
                            ${vocCount > 0 ? `
                                <button class="calm-tab-btn" data-tab="VOC">
                                    ⚙️ Seçmeli Meslek (${vocCount})
                                </button>
                            ` : ''}
                        </div>

                        <!-- ARAMA ÇUBUĞU -->
                        <div class="calm-search-row">
                            <span class="search-lens">🔍</span>
                            <input type="text" class="calm-search-input" id="elective-search-input" placeholder="Ders adı ara (örn: Astronomi, Kur'an, Drama, Robotik, Almanca)...">
                        </div>
                    </div>

                    <!-- DERS LİSTESİ -->
                    <div class="modal-body elective-calm-body" id="elective-modal-list">
                    </div>

                    <!-- FOOTER: MANUEL DERS + TEK ŞUBEYE AKTAR BUTONU -->
                    <div class="elective-calm-footer">
                        <div class="custom-add-mini-form">
                            <span class="mini-form-label">➕ Manuel Ders:</span>
                            <input type="text" id="custom-el-name" class="mini-input" placeholder="Özel Ders Adı...">
                            <select id="custom-el-hour" class="mini-select">
                                <option value="1">1 Saat</option>
                                <option value="2" selected>2 Saat</option>
                                <option value="3">3 Saat</option>
                                <option value="4">4 Saat</option>
                            </select>
                            <button type="button" class="btn-mini-add" id="btn-add-custom-elective">+ Listeye Ekle</button>
                        </div>
                        
                        <div class="footer-actions-group">
                            <button class="btn btn-secondary" id="btn-cancel-elective-modal" style="padding: 0.55rem 1.1rem; font-weight: 700;">
                                Vazgeç
                            </button>
                            <button class="btn btn-primary btn-commit-action" id="btn-commit-electives" style="padding: 0.55rem 1.6rem; font-weight: 800; font-size: 0.88rem;">
                                💾 Seçilen Dersleri Şubeye Aktar ✓
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        updateHeaderAndCommitBtn();
        renderList();

        // Tema Sekme Tıklama
        document.querySelectorAll("#elective-drawer-modal .calm-tab-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll("#elective-drawer-modal .calm-tab-btn").forEach(b => b.classList.remove("active"));
                e.currentTarget.classList.add("active");
                currentFilter = e.currentTarget.dataset.tab;
                renderList();
            });
        });

        // Arama Metni
        const searchInput = document.getElementById("elective-search-input");
        searchInput?.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            renderList();
        });

        // Manuel Özel Ders Ekleme
        document.getElementById("btn-add-custom-elective")?.addEventListener("click", () => {
            const cName = document.getElementById("custom-el-name")?.value.trim();
            const cHour = parseInt(document.getElementById("custom-el-hour")?.value || 2, 10);

            if (!cName) {
                alert("Lütfen bir seçmeli ders adı giriniz.");
                return;
            }

            const targetSec = this.state.getActiveSection() || section;
            const autoBranch = (window.curriculumEngine && typeof window.curriculumEngine.resolveBranch === 'function')
                ? window.curriculumEngine.resolveBranch(cName, targetSec.alanId || targetSec.alanAdi, "SEÇMELİ DERSLER")
                : "Diğer";

            draftSelections.set(cName, {
                ders: cName,
                saat: cHour,
                grup: "Özel Seçmeli",
                defaultBranch: autoBranch || "Diğer",
                isVocational: false,
                theme: { id: "BILIM", subId: "BILIM", color: "#0284c7", icon: "📝", badge: "Özel Ders" }
            });

            document.getElementById("custom-el-name").value = "";
            this.showToast(`✨ "${cName}" (${cHour}s) seçim listesine eklendi.`, "info");
            updateHeaderAndCommitBtn();
            renderList();
        });

        // Kapatma / Vazgeç Butonları
        document.getElementById("btn-close-elective-modal")?.addEventListener("click", () => {
            document.getElementById("elective-drawer-modal")?.remove();
        });
        document.getElementById("btn-cancel-elective-modal")?.addEventListener("click", () => {
            document.getElementById("elective-drawer-modal")?.remove();
        });

        // SEÇİLEN DERSLERİ ŞUBEYE AKTAR BUTONU
        document.getElementById("btn-commit-electives")?.addEventListener("click", () => {
            const targetSec = this.state.getActiveSection() || section;
            if (!targetSec) return;

            // Şubenin seçmeli derslerini draftSelections ile güncelle
            targetSec.secmeliDersler = Array.from(draftSelections.values()).map(sel => ({
                ders: sel.ders,
                saat: sel.saat,
                kategori: sel.isVocational ? "SEÇMELİ MESLEK DERSLERİ" : "SEÇMELİ DERSLER",
                atananBrans: sel.defaultBranch || "Diğer",
                baraj_ders: false,
                isAtolye: !!sel.isVocational,
                isElectiveVocational: !!sel.isVocational,
                grup: sel.grup || "Seçmeli"
            }));

            const { count, draftElectiveHours } = getDraftStats();
            this.state.notify();
            this.showToast(`✨ ${count} seçmeli ders (${draftElectiveHours} Saat) ${targetSec.subeAdi} şubesine başarıyla aktarıldı!`, "success");
            document.getElementById("elective-drawer-modal")?.remove();
        });
    }

    // Akıllı Seçmeli Paket Uygulayıcı
    applyElectivePreset(section, presetType, electivesList) {
        const currentSec = this.state.getActiveSection() || section;
        if (!currentSec) return;

        if (presetType === "CLEAR") {
            currentSec.secmeliDersler = [];
            this.state.notify();
            this.showToast(`🗑️ "${currentSec.subeAdi}" şubesinin seçmeli dersleri temizlendi.`, "success");
            return;
        }

        const addIfFound = (keyword, defaultHour, themeId) => {
            const normKey = keyword.toLowerCase().replace(/i/g, 'i').replace(/ı/g, 'i');
            const found = electivesList.find(e => {
                const normName = e.ders.toLowerCase().replace(/i/g, 'i').replace(/ı/g, 'i');
                return normName.includes(normKey);
            });
            if (found && !(currentSec.secmeliDersler || []).some(d => (d.ders || d.ders_adi) === found.ders)) {
                this.state.addElectiveCourse(currentSec.id, {
                    ders: found.ders,
                    saat: defaultHour,
                    kategori: found.isVocational ? "SEÇMELİ MESLEK DERSLERİ" : "SEÇMELİ DERSLER",
                    atananBrans: found.defaultBranch || "Diğer",
                    baraj_ders: false,
                    isAtolye: !!found.isVocational,
                    isElectiveVocational: !!found.isVocational,
                    grup: found.grup
                });
            }
        };

        if (presetType === "BALANCED") {
            // 2s Bilim + 2s Değer + 2s Sanat
            addIfFound("robotik", 2, "BILIM") || addIfFound("astronomi", 2, "BILIM") || addIfFound("matematik", 2, "BILIM");
            addIfFound("kuran", 2, "DEGER") || addIfFound("peygamber", 2, "DEGER") || addIfFound("temel dini", 2, "DEGER");
            addIfFound("drama", 2, "SANAT") || addIfFound("muzik", 2, "SANAT") || addIfFound("gorsel", 2, "SANAT") || addIfFound("spor", 2, "SANAT");
            this.showToast(`🎯 TTKB 3-Tema Dengeli Paketi başarıyla yüklendi!`, "success");
        } else if (presetType === "SCIENCE") {
            // Sayısal & Bilişim
            addIfFound("fizik", 2, "BILIM") || addIfFound("kimya", 2, "BILIM") || addIfFound("fen", 2, "BILIM");
            addIfFound("biyoloji", 2, "BILIM") || addIfFound("matematik", 2, "BILIM");
            addIfFound("robotik", 2, "BILISIM") || addIfFound("yapay zeka", 2, "BILISIM") || addIfFound("programlama", 2, "BILISIM");
            this.showToast(`🧪 Sayısal & Bilişim Paketi uygulandı!`, "success");
        } else if (presetType === "SOCIAL") {
            // Sözel & Sanat & Dil
            addIfFound("diksiyon", 2, "SANAT") || addIfFound("masal", 2, "SANAT") || addIfFound("tiyatro", 2, "SANAT");
            addIfFound("ikinci yabanci", 2, "DIL") || addIfFound("ingilizce", 2, "DIL") || addIfFound("almanca", 2, "DIL");
            addIfFound("sosyoloji", 2, "BILIM") || addIfFound("psikoloji", 2, "BILIM") || addIfFound("turk kultur", 2, "BILIM");
            this.showToast(`📚 Sözel & Dil Paketi uygulandı!`, "success");
        } else if (presetType === "VOC") {
            // Seçmeli Meslek
            const vocs = electivesList.filter(e => e.isVocational);
            vocs.slice(0, 3).forEach(v => {
                if (!(currentSec.secmeliDersler || []).some(d => (d.ders || d.ders_adi) === v.ders)) {
                    this.state.addElectiveCourse(currentSec.id, {
                        ders: v.ders,
                        saat: v.hoursOptions[0] || 2,
                        kategori: "SEÇMELİ MESLEK DERSLERİ",
                        atananBrans: v.defaultBranch || "Meslek Dersi",
                        baraj_ders: false,
                        isAtolye: true,
                        isElectiveVocational: true,
                        grup: v.grup
                    });
                }
            });
            this.showToast(`⚙️ Seçmeli Meslek Paketi uygulandı!`, "success");
        }
    }

    // --- SEZON DEVRİ VE SINIF ATLATMA SİHİRBAZI MODALI ---
    openSeasonRolloverModal(newSeason) {
        const currentSeason = this.state.state.okulBilgisi.sezon;
        const totalSections = this.state.state.subeler.length;

        const modalHtml = `
            <div class="modal-overlay active" id="season-rollover-modal">
                <div class="modal-box" style="max-width: 620px; width: 95%;">
                    <div class="modal-header">
                        <div class="modal-title">🚀 Eğitim-Öğretim Sezonu Devri & Sınıf Atlatma</div>
                        <button class="modal-close-btn" onclick="document.getElementById('season-rollover-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body" style="padding: 1.25rem;">
                        <p style="font-size: 0.86rem; color: var(--text-main); margin-bottom: 1rem; line-height: 1.5;">
                            Sezonu <strong>${currentSeason}</strong> döneminden <strong>${newSeason}</strong> dönemine aktarıyorsunuz. 
                            Mevcut <strong>${totalSections} adet şubeniz</strong> için lütfen aktarım yöntemini seçiniz:
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <label class="rollover-option-card" style="display: flex; gap: 0.75rem; padding: 0.85rem; border: 2px solid var(--primary); border-radius: var(--radius-md); background: var(--primary-light); cursor: pointer;">
                                <input type="radio" name="rollover_mode" value="PROMOTE" checked style="margin-top: 0.2rem;">
                                <div>
                                    <div style="font-weight: 800; font-size: 0.9rem; color: var(--primary);">🚀 1. Akıllı Sınıf Atlatma & Müfredat Uyarlaması (Önerilen)</div>
                                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.4;">
                                        * 9. Sınıflar ➔ 10. Sınıf, 10'lar ➔ 11, 11'ler ➔ 12. Sınıf yapılır (Örn: 9-A ➔ 10-A).<br>
                                        * 12. Sınıflar mezun edilir, yeni sınıfın resmî zorunlu ders çizelgesi otomatik yüklenir.<br>
                                        * Seçmeli dersler okul yönetimi tarafından yeni sezonda serbestçe seçilmek üzere temizlenir.
                                    </div>
                                </div>
                            </label>

                            <label class="rollover-option-card" style="display: flex; gap: 0.75rem; padding: 0.85rem; border: 1px solid var(--border-main); border-radius: var(--radius-md); background: var(--bg-card-subtle); cursor: pointer;">
                                <input type="radio" name="rollover_mode" value="COPY_AS_IS" style="margin-top: 0.2rem;">
                                <div>
                                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">📋 2. Mevcut Şube Yapısını Olduğu Gibi Koru (Şablon Olarak Aktar)</div>
                                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.4;">
                                        Mevcut tüm şube isimleri, dersler ve branş atamaları 1-e-1 yeni sezona aktarılır.
                                    </div>
                                </div>
                            </label>

                            <label class="rollover-option-card" style="display: flex; gap: 0.75rem; padding: 0.85rem; border: 1px solid var(--border-main); border-radius: var(--radius-md); background: var(--bg-card-subtle); cursor: pointer;">
                                <input type="radio" name="rollover_mode" value="RESET" style="margin-top: 0.2rem;">
                                <div>
                                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--status-danger-text);">✨ 3. Yeni Sezon İçin Sıfırdan Başla (Boş Liste)</div>
                                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.4;">
                                        Mevcut şubeler sıfırlanır, yeni sezonda şubeler baştan oluşturulur.
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('season-rollover-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-confirm-season-rollover">Sezonu Aktar ve Uygula</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        document.getElementById("btn-confirm-season-rollover")?.addEventListener("click", () => {
            const selectedMode = document.querySelector('input[name="rollover_mode"]:checked')?.value || "PROMOTE";

            if (selectedMode === "PROMOTE") {
                this.state.promoteSectionsToNextSeason(newSeason, this.curriculum);
                this.showToast(`${newSeason} sezonuna geçildi: Sınıflar atlatıldı ve yeni müfredat atandı!`, "success");
            } else if (selectedMode === "COPY_AS_IS") {
                this.state.changeSeason(newSeason, true);
                this.showToast(`${newSeason} sezonuna geçildi: Şube yapısı korundu.`, "success");
            } else {
                this.state.changeSeason(newSeason, false);
                this.showToast(`${newSeason} sezonu boş liste ile başlatıldı.`, "info");
            }

            this.closeModal("season-rollover-modal");
        });
    }

    // --- SINIF VE ŞUBE BÖLME SİHİRBAZI MODALI (SECTION SPLITTING WIZARD) ---
    openSplitSectionModal(section) {
        if (!section) return;

        const totalStudents = parseInt(section.ogrenciSayisi || 30, 10);
        const gradeLevel = section.sinifSeviyesi;
        const currentName = section.subeAdi;

        // Bölme önerileri
        const half1 = Math.ceil(totalStudents / 2);
        const half2 = totalStudents - half1;

        const third1 = Math.ceil(totalStudents / 3);
        const third2 = Math.ceil((totalStudents - third1) / 2);
        const third3 = totalStudents - third1 - third2;

        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "P"];
        const existingNames = this.state.state.subeler.filter(s => s.sinifSeviyesi === gradeLevel).map(s => s.subeAdi.trim().toUpperCase());
        const availableLetters = letters.filter(l => !existingNames.includes(`${gradeLevel}-${l}`));
        const letter2 = availableLetters[0] || "B";
        const letter3 = availableLetters[1] || "C";
        const name2 = `${gradeLevel}-${letter2}`;
        const name3 = `${gradeLevel}-${letter3}`;

        // Toplam ders saati
        const totalHours = [...(section.zorunluDersler || []), ...(section.secmeliDersler || [])].reduce((sum, d) => sum + parseInt(d.saat || d.ders_saati || 0, 10), 0);

        // Meslek dal listesi (Varsa)
        const isVoc = !!section.alanId;
        const vocAreas = this.db.getVocationalAreas();
        const areaObj = isVoc ? vocAreas.find(a => a.id === section.alanId) : null;
        const branchesList = (areaObj && areaObj.branches) ? areaObj.branches : [];

        const modalHtml = `
            <div class="modal-overlay active" id="split-section-modal">
                <div class="modal-box" style="max-width: 640px; width: 95%;">
                    <div class="modal-header">
                        <div class="modal-title">✂️ Sınıf & Şube Bölme Sihirbazı: ${currentName}</div>
                        <button class="modal-close-btn" onclick="document.getElementById('split-section-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body" style="padding: 1.15rem 1.25rem;">
                        <!-- Mevcut Durum Kartı -->
                        <div class="split-current-banner" style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(14, 165, 233, 0.04) 100%); border: 1.5px solid rgba(2, 132, 199, 0.25); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <div style="font-weight: 800; font-size: 0.95rem; color: #0284c7;">🏫 ${currentName} (${gradeLevel}. Sınıf)</div>
                                <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.15rem;">
                                    Mevcut Toplam Öğrenci: <strong>${totalStudents}</strong> • Haftalık Ders Saati: <strong>${totalHours} Saat</strong>
                                </div>
                            </div>
                            <div style="font-size: 0.72rem; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.6rem; border-radius: 6px;">
                                MEB Kapasite: ${totalStudents > 34 ? '⚠️ Bölünme Önerilir' : '✅ Uygun'}
                            </div>
                        </div>

                        <!-- Bölünme Yöntemi Seçenekleri -->
                        <div style="font-weight: 800; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.03em;">
                            1. Bölünme Modelini Seçiniz:
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1rem;">
                            <!-- Mod 1: Eşit İkiye Böl -->
                            <label class="split-mode-card" style="display: flex; gap: 0.75rem; padding: 0.75rem 0.9rem; border: 2px solid var(--primary); border-radius: 8px; background: var(--primary-light); cursor: pointer;">
                                <input type="radio" name="split_mode" value="EQUAL_2" checked style="margin-top: 0.2rem;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 800; font-size: 0.88rem; color: var(--primary);">🚀 Eşit 2 Şubeye Böl (Önerilen)</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
                                        <strong>${currentName}:</strong> ${half1} Öğrenci &nbsp;|&nbsp; <strong>${name2}:</strong> ${half2} Öğrenci
                                    </div>
                                </div>
                            </label>

                            <!-- Mod 2: Özel Sayılı 2 Şube -->
                            <label class="split-mode-card" style="display: flex; gap: 0.75rem; padding: 0.75rem 0.9rem; border: 1px solid var(--border-main); border-radius: 8px; background: var(--bg-card-subtle); cursor: pointer;">
                                <input type="radio" name="split_mode" value="CUSTOM_2" style="margin-top: 0.2rem;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">⚖️ Özel Öğrenci Sayıları ile 2 Şubeye Böl</div>
                                    <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.2rem;">
                                        İki şubenin öğrenci sayılarını kendi dağıtımınıza göre belirleyin.
                                    </div>
                                    <div id="custom-2-inputs" style="display: none; margin-top: 0.6rem; gap: 0.75rem; align-items: center;">
                                        <div style="display: flex; align-items: center; gap: 0.4rem;">
                                            <span style="font-weight: 700; font-size: 0.78rem;">${currentName}:</span>
                                            <input type="number" id="input-split-s1" class="form-control" value="${half1}" min="1" max="${totalStudents - 1}" style="width: 70px; padding: 0.2rem 0.4rem; text-align: center; font-weight: 800;">
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 0.4rem;">
                                            <span style="font-weight: 700; font-size: 0.78rem;">${name2}:</span>
                                            <input type="number" id="input-split-s2" class="form-control" value="${half2}" min="1" max="${totalStudents - 1}" style="width: 70px; padding: 0.2rem 0.4rem; text-align: center; font-weight: 800;">
                                        </div>
                                        <span id="custom-sum-indicator" style="font-size: 0.72rem; color: #16a34a; font-weight: 700;">Toplam: ${totalStudents}</span>
                                    </div>
                                </div>
                            </label>

                            <!-- Mod 3: 3 Şubeye Böl -->
                            <label class="split-mode-card" style="display: flex; gap: 0.75rem; padding: 0.75rem 0.9rem; border: 1px solid var(--border-main); border-radius: 8px; background: var(--bg-card-subtle); cursor: pointer;">
                                <input type="radio" name="split_mode" value="EQUAL_3" style="margin-top: 0.2rem;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">⚡ 3 Şubeye Böl (Kalabalık Sınıflar İçin)</div>
                                    <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.2rem;">
                                        <strong>${currentName}:</strong> ${third1} Öğr. &nbsp;|&nbsp; <strong>${name2}:</strong> ${third2} Öğr. &nbsp;|&nbsp; <strong>${name3}:</strong> ${third3} Öğr.
                                    </div>
                                </div>
                            </label>
                        </div>

                        ${isVoc && branchesList.length > 1 ? `
                            <!-- Meslek Liseleri Dal Seçimi -->
                            <div style="background: rgba(147, 51, 234, 0.06); border: 1px solid rgba(147, 51, 234, 0.2); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;">
                                <div style="font-weight: 800; font-size: 0.78rem; color: #7e22ce; margin-bottom: 0.35rem;">
                                    ⚙️ Meslek Dalı Ayrımı (İsteğe Bağlı):
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                                    <div>
                                        <label style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted);">${currentName} Dalı:</label>
                                        <select id="split-source-dal" class="form-control" style="font-size: 0.75rem; padding: 0.25rem 0.4rem;">
                                            <option value="">— Dal Seçilmedi (Ortak Alan) —</option>
                                            ${branchesList.map(b => `<option value="${b.name}" ${section.dalAdi === b.name ? 'selected' : ''}>${b.name}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div>
                                        <label style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted);">${name2} Dalı:</label>
                                        <select id="split-new-dal" class="form-control" style="font-size: 0.75rem; padding: 0.25rem 0.4rem;">
                                            <option value="">— Dal Seçilmedi (Ortak Alan) —</option>
                                            ${branchesList.map((b, i) => `<option value="${b.name}" ${(section.dalAdi !== b.name && i === 1) ? 'selected' : ''}>${b.name}</option>`).join("")}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Ayarlar & Seçenekler -->
                        <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.65rem 0.85rem; margin-bottom: 0.85rem;">
                            <div style="font-weight: 800; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">
                                2. Müfredat & Ders Aktarımı Seçenekleri:
                            </div>
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); margin-bottom: 0.35rem; cursor: pointer;">
                                <input type="checkbox" id="chk-split-electives" checked>
                                <span>Mevcut <strong>seçmeli dersleri ve branş atamalarını</strong> yeni şubeye/şubelere kopyala</span>
                            </label>
                        </div>

                        <!-- Telemetri ve Etki Notu -->
                        <div style="font-size: 0.73rem; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 0.45rem 0.75rem; display: flex; align-items: center; gap: 0.45rem;">
                            <span>ℹ️</span>
                            <span>Bu işlem sonucunda okulun toplam ders yükü <strong>+${totalHours} Saat</strong> artacak ve sağ paneldeki norm kadro ihtiyacı anında güncellenecektir.</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('split-section-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-confirm-split-section">✂️ Şubeyi Böl ve Uygula</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        // Dinamik Etkileşimler
        const modeRadios = document.querySelectorAll('input[name="split_mode"]');
        const customInputs = document.getElementById("custom-2-inputs");
        const inpS1 = document.getElementById("input-split-s1");
        const inpS2 = document.getElementById("input-split-s2");
        const sumIndicator = document.getElementById("custom-sum-indicator");

        modeRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                document.querySelectorAll(".split-mode-card").forEach(c => {
                    c.style.border = "1px solid var(--border-main)";
                    c.style.background = "var(--bg-card-subtle)";
                });
                const parent = radio.closest(".split-mode-card");
                if (parent) {
                    parent.style.border = "2px solid var(--primary)";
                    parent.style.background = "var(--primary-light)";
                }
                if (customInputs) {
                    customInputs.style.display = radio.value === "CUSTOM_2" ? "flex" : "none";
                }
            });
        });

        if (inpS1 && inpS2 && sumIndicator) {
            inpS1.addEventListener("input", () => {
                const val1 = parseInt(inpS1.value, 10) || 1;
                const val2 = Math.max(1, totalStudents - val1);
                inpS2.value = val2;
                sumIndicator.textContent = `Toplam: ${val1 + val2}`;
            });
            inpS2.addEventListener("input", () => {
                const val2 = parseInt(inpS2.value, 10) || 1;
                const val1 = Math.max(1, totalStudents - val2);
                inpS1.value = val1;
                sumIndicator.textContent = `Toplam: ${val1 + val2}`;
            });
        }

        // Onay Butonu
        document.getElementById("btn-confirm-split-section")?.addEventListener("click", () => {
            const selectedMode = document.querySelector('input[name="split_mode"]:checked')?.value || "EQUAL_2";
            const copyElectives = document.getElementById("chk-split-electives")?.checked !== false;
            const srcDal = document.getElementById("split-source-dal")?.value;
            const newDal = document.getElementById("split-new-dal")?.value;

            let splitPlan = {};

            if (selectedMode === "EQUAL_2") {
                splitPlan = {
                    sourceStudents: half1,
                    sourceDalAdi: srcDal || section.dalAdi,
                    copyElectives: copyElectives,
                    newSections: [
                        { subeAdi: name2, ogrenciSayisi: half2, dalAdi: newDal || section.dalAdi }
                    ]
                };
            } else if (selectedMode === "CUSTOM_2") {
                const val1 = parseInt(inpS1?.value, 10) || half1;
                const val2 = parseInt(inpS2?.value, 10) || half2;
                splitPlan = {
                    sourceStudents: val1,
                    sourceDalAdi: srcDal || section.dalAdi,
                    copyElectives: copyElectives,
                    newSections: [
                        { subeAdi: name2, ogrenciSayisi: val2, dalAdi: newDal || section.dalAdi }
                    ]
                };
            } else if (selectedMode === "EQUAL_3") {
                splitPlan = {
                    sourceStudents: third1,
                    sourceDalAdi: srcDal || section.dalAdi,
                    copyElectives: copyElectives,
                    newSections: [
                        { subeAdi: name2, ogrenciSayisi: third2, dalAdi: newDal || section.dalAdi },
                        { subeAdi: name3, ogrenciSayisi: third3, dalAdi: newDal || section.dalAdi }
                    ]
                };
            }

            const result = this.state.splitSection(section.id, splitPlan);
            if (result) {
                const createdNames = result.createdSections.map(s => s.subeAdi).join(", ");
                this.showToast(`✂️ ${currentName} şubesi başarıyla bölündü: ${currentName} ve ${createdNames} oluşturuldu!`, "success");
            }
            this.closeModal("split-section-modal");
        });
    }

    openCourseMergeModal(section, courseName) {
        const sameGradeSections = this.state.state.subeler.filter(s => s.sinifSeviyesi === section.sinifSeviyesi && s.id !== section.id);
        const currentCourse = [...(section.zorunluDersler || []), ...(section.secmeliDersler || [])].find(d => (d.ders || d.ders_adi) === courseName);
        const mergedIds = currentCourse?.birlesikSubeler || [];

        const listHtml = sameGradeSections.length === 0 
            ? `<p style="color: var(--text-muted); padding: 1rem 0;">Aynı sınıf seviyesinde birleştirilebilecek başka bir şube bulunmuyor.</p>`
            : sameGradeSections.map(s => {
                const isChecked = mergedIds.includes(s.id);
                return `
                    <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0.75rem; background: var(--bg-card-subtle); border: 1px solid var(--border-main); border-radius: var(--radius-md); margin-bottom: 0.45rem; cursor: pointer;">
                        <input type="checkbox" class="merge-checkbox" data-target="${s.id}" ${isChecked ? 'checked' : ''}>
                        <span style="font-weight: 700; color: var(--text-main);">${s.subeAdi}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">(${s.ogrenciSayisi} Öğrenci)</span>
                    </label>
                `;
            }).join("");

        const modalHtml = `
            <div class="modal-overlay active" id="course-merge-modal">
                <div class="modal-box" style="max-width: 500px;">
                    <div class="modal-header">
                        <div class="modal-title">🔗 Sınıf Birleştirme: ${courseName}</div>
                        <button class="modal-close-btn" onclick="document.getElementById('course-merge-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.85rem; line-height: 1.45;">
                            <strong>${section.subeAdi}</strong> şubesinin <strong>${courseName}</strong> dersini aşağıdaki şubelerle ortak işlemek üzere birleştirebilirsiniz. Birleştirilen dersler için <strong>öğretmen normuna tek ders yükü</strong> yazılır.
                        </p>
                        ${listHtml}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('course-merge-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-save-course-merge">Kaydet ve Kapat</button>
                    </div>
                </div>
            </div>
        `;
        this.renderModal(modalHtml);

        document.getElementById("btn-save-course-merge").addEventListener("click", () => {
            document.querySelectorAll(".merge-checkbox").forEach(cb => {
                const targetId = cb.dataset.target;
                const shouldBeMerged = cb.checked;
                const isCurrentlyMerged = mergedIds.includes(targetId);

                if (shouldBeMerged !== isCurrentlyMerged) {
                    this.state.toggleCourseMerge(section.id, courseName, targetId);
                }
            });
            this.closeModal("course-merge-modal");
            this.showToast("Sınıf birleştirme ayarları güncellendi.", "success");
        });
    }

    openTeacherStaffModal() {
        const currentTeachers = this.state.state.mevcutOgretmenler || {};
        const coordinatorMap = this.state.state.koordinatorlukYukleri || {};
        const subeler = this.state.state.subeler || [];
        const vocAreas = this.db.getVocationalAreas();
        const schoolType = this.state.state.okulBilgisi.okulTuru || "";
        const isVocationalSchool = schoolType.includes("meslek") || schoolType.includes("teknik") || schoolType.includes("mtegm") || subeler.some(s => s.alanId);
        const adminOpts = this.state.state.okulBilgisi.adminOptions || {};
        const totalStudents = subeler.reduce((sum, s) => sum + (parseInt(s.ogrenciSayisi, 10) || 0), 0);

        const cultureBranches = this.db.getGeneralCultureBranchesList();
        const vocBranches = this.db.getVocationalBranchesList();

        let totalStaffCount = 0;
        let staffedBranchCount = 0;
        Object.keys(currentTeachers).forEach(k => {
            const val = parseInt(currentTeachers[k] || 0, 10);
            if (val > 0) {
                totalStaffCount += val;
                staffedBranchCount++;
            }
        });

        const renderBranchRow = (bName, isVoc = false) => {
            const count = parseInt(currentTeachers[bName] || 0, 10);
            const hasStaff = count > 0;
            return `
                <div class="staff-branch-row" data-search="${bName.toLowerCase()}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.65rem; border-bottom: 1px solid var(--border-subtle); background: ${hasStaff ? 'rgba(34, 197, 94, 0.08)' : 'transparent'}; border-left: 3px solid ${hasStaff ? '#16a34a' : 'transparent'}; border-radius: 6px; margin-bottom: 0.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.45rem;">
                        <span style="font-size: 0.85rem;">${isVoc ? '🟣' : '📘'}</span>
                        <span style="font-size: 0.83rem; font-weight: ${hasStaff ? '700' : '600'}; color: var(--text-main);">${bName}</span>
                        ${hasStaff ? `<span style="font-size: 0.65rem; background: #dcfce7; color: #15803d; padding: 0.05rem 0.4rem; border-radius: 4px; font-weight: 800;">● ${count} Kadrolu</span>` : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <input type="number" class="form-control teacher-count-input" data-branch="${bName}" value="${count}" min="0" max="100" style="width: 72px; padding: 0.22rem 0.35rem; text-align: center; font-weight: 800; color: ${hasStaff ? '#15803d' : 'var(--text-main)'};">
                        <span style="font-size: 0.72rem; color: var(--text-muted);">Öğr.</span>
                    </div>
                </div>
            `;
        };

        const cultureRowsHtml = cultureBranches.map(b => renderBranchRow(b, false)).join("");
        const vocRowsHtml = vocBranches.map(b => renderBranchRow(b, true)).join("");

        // Md. 22/6: yöneticilerin okuttuğu ders saatleri branş yükünden düşülür.
        const adminHoursMap = adminOpts.yoneticiDersYukleri || {};
        const mevcutIdareci = adminOpts.mevcutIdareciler || {};
        const adminTeachingRowsHtml = [
            ...cultureBranches.map(b => ({ name: b, isVoc: false })),
            ...vocBranches.map(b => ({ name: b, isVoc: true }))
        ].map(({ name, isVoc }) => {
            const h = parseInt(adminHoursMap[name] || 0, 10);
            const active = h > 0;
            return `
                <div class="admin-teaching-item" data-search="${name.toLowerCase()}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--border-subtle); background: ${active ? 'rgba(2, 132, 199, 0.07)' : 'transparent'}; border-left: 3px solid ${active ? '#0284c7' : 'transparent'}; border-radius: 6px; margin-bottom: 0.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.45rem;">
                        <span style="font-size: 0.85rem;">${isVoc ? '🟣' : '📘'}</span>
                        <span style="font-size: 0.82rem; font-weight: ${active ? '700' : '600'}; color: var(--text-main);">${name}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <input type="number" class="form-control admin-teaching-input" data-branch="${name}" value="${h}" min="0" max="40" style="max-width: 68px; padding: 0.2rem 0.35rem; text-align: center; font-weight: 800; color: ${active ? '#0284c7' : 'var(--text-main)'};">
                        <span style="font-size: 0.72rem; color: var(--text-muted);">Saat</span>
                    </div>
                </div>
            `;
        }).join("");

        const allVocBranches = isVocationalSchool ? vocBranches : [];
        const activeVocBranchesSet = new Set();
        if (isVocationalSchool) {
            subeler.forEach(s => {
                if (s.alanId) {
                    const areaObj = vocAreas.find(a => a.id === s.alanId);
                    if (areaObj) activeVocBranchesSet.add(areaObj.name.replace(/\s*ALANI$/i, ''));
                    else activeVocBranchesSet.add(s.alanId);
                }
            });
        }

        const sortedVocBranches = isVocationalSchool ? [...allVocBranches].sort((a, b) => {
            const isActA = activeVocBranchesSet.has(a);
            const isActB = activeVocBranchesSet.has(b);
            if (isActA !== isActB) return isActA ? -1 : 1;
            return a.localeCompare(b, 'tr');
        }) : [];

        const coordinatorRowsHtml = sortedVocBranches.map(bName => {
            const isActive = activeVocBranchesSet.has(bName);
            const currentHours = (coordinatorMap[bName] !== undefined) ? coordinatorMap[bName] : (isActive ? 10 : 0);
            return `
                <div class="coordinator-area-item" data-search="${bName.toLowerCase()}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.48rem 0.6rem; border-bottom: 1px solid var(--border-subtle); background: ${isActive ? 'rgba(147, 51, 234, 0.05)' : 'var(--bg-card-subtle)'}; border-left: 3px solid ${isActive ? '#9333ea' : 'transparent'}; border-radius: 6px; margin-bottom: 0.35rem;">
                    <div>
                        <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.35rem;">
                            <span>${isActive ? '⚡' : '🟣'} ${bName}</span>
                            ${isActive ? '<span style="font-size: 0.65rem; background: rgba(147, 51, 234, 0.15); color: #7e22ce; font-weight: 800; padding: 0.08rem 0.4rem; border-radius: 4px;">Okulda Aktif Alan</span>' : ''}
                        </div>
                        <div style="font-size: 0.68rem; color: var(--text-muted);">12. Sınıf İşletmelerde Mesleki Eğitim Staj Denetim Yükü</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                        <input type="number" class="form-control coordinator-hours-input" data-branch="${bName}" value="${currentHours}" min="0" max="60" style="width: 68px; padding: 0.2rem 0.35rem; text-align: center; font-weight: 800; color: #7e22ce;">
                        <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted);">Saat</span>
                    </div>
                </div>
            `;
        }).join("");

        const modalHtml = `
            <div class="modal-overlay active" id="staff-modal">
                <div class="modal-box" style="max-width: 720px; width: 95%;">
                    <div class="modal-header">
                        <div class="modal-title">⚙️ Kadro, İdareci & Kurumsal Özellikler Yönetimi</div>
                        <button class="modal-close-btn" onclick="document.getElementById('staff-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body" style="max-height: 72vh; padding: 1rem 1.25rem;">
                        <!-- Sekmeler -->
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.85rem; border-bottom: 1.5px solid var(--border-main); padding-bottom: 0.5rem; flex-wrap: wrap;">
                            <button class="btn btn-sm btn-primary staff-tab-btn active" data-target="staff-teachers-tab">
                                👥 Kadrolu Öğretmenler
                            </button>
                            <button class="btn btn-sm btn-outline staff-tab-btn" data-target="staff-admin-tab" style="color: #0284c7; border-color: #7dd3fc;">
                                🏛️ İdareci Normları & Okul Özellikleri
                            </button>
                            ${isVocationalSchool ? `
                                <button class="btn btn-sm btn-outline staff-tab-btn" data-target="staff-coordinator-tab" style="color: #7e22ce; border-color: #d8b4fe;">
                                    🏢 Koordinatörlük
                                </button>
                            ` : ''}
                        </div>

                        <!-- 1. Sekme: Kadrolu Öğretmenler -->
                        <div id="staff-teachers-tab" class="staff-tab-content">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem; background: var(--bg-card-subtle); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                                <div style="font-size: 0.78rem; color: var(--text-muted);">
                                    MEB Talim ve Terbiye Kurulu 9 Sayılı Karar Atama Alanları
                                </div>
                                <div style="font-size: 0.78rem; font-weight: 700; color: #16a34a;">
                                    Toplam Kadrolu: <strong>${totalStaffCount}</strong> Öğretmen (${staffedBranchCount} Branş)
                                </div>
                            </div>

                            <div style="margin-bottom: 0.75rem;">
                                <input type="text" id="staff-branch-search" placeholder="🔍 Branş Ara (örn: Türk Dili, Matematik, Bilişim, Makine, Din Kültürü)..." class="form-control" style="width: 100%; padding: 0.45rem 0.75rem; font-size: 0.85rem; border-radius: 8px;">
                            </div>

                            <div id="staff-branches-list-container" style="max-height: 44vh; overflow-y: auto; padding-right: 0.25rem;">
                                <div class="branch-group-container" style="margin-bottom: 1rem;">
                                    <div style="font-size: 0.75rem; font-weight: 800; color: #2563eb; background: rgba(37, 99, 235, 0.08); padding: 0.35rem 0.65rem; border-radius: 6px; margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between;">
                                        <span>📘 GENEL BİLGİ VE KÜLTÜR BRANŞLARI</span>
                                        <span>${cultureBranches.length} Branş</span>
                                    </div>
                                    <div class="branch-group-items">
                                        ${cultureRowsHtml}
                                    </div>
                                </div>

                                <div class="branch-group-container">
                                    <div style="font-size: 0.75rem; font-weight: 800; color: #7e22ce; background: rgba(147, 51, 234, 0.08); padding: 0.35rem 0.65rem; border-radius: 6px; margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between;">
                                        <span>🟣 MESLEKİ VE TEKNİK (ATÖLYE VE LABORATUVAR) BRANŞLARI</span>
                                        <span>${vocBranches.length} Branş</span>
                                    </div>
                                    <div class="branch-group-items">
                                        ${vocRowsHtml}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 2. Sekme: İdareci Normları & Okul Özellikleri -->
                        <div id="staff-admin-tab" class="staff-tab-content" style="display: none;">
                            <div style="display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 0.85rem;">
                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-pansiyon" ${adminOpts.isPansiyonlu ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🛏️ Yatılı veya Pansiyonlu Kurum</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 Müdür Başyardımcısı (Md. 6/1-a) & +1 İlave Müdür Yardımcısı (Md. 14/1-a)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-doner" ${adminOpts.hasDonerSermaye ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>💰 Döner Sermaye İşletmesi Bulunuyor</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 İlave Müdür Yardımcısı (Md. 14/1-b)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-tamgun" ${adminOpts.isTamGunTamYil ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>☀️ Tam Gün Tam Yıl Eğitim / Açık Öğretim</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 İlave Müdür Yardımcısı (Md. 14/1-c)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-stajyer100" ${adminOpts.hasStajyer100Plus ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🏭 3308 Sayılı Kanun Kapsamında 100+ Stajyer</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 İlave Müdür Yardımcısı (Md. 14/1-ç)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-sigortali500" ${adminOpts.hasSigortali500Plus ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🛡️ 3308 Md. 25 Kapsamında 500+ Sigortalı Çırak</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 İlave Müdür Yardımcısı (Md. 14/1-d)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-tasima" ${adminOpts.isTasimaMerkezi ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🚌 Taşıma Merkezi Eğitim Kurumu</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">+1 İlave Müdür Yardımcısı (Md. 14/1-e)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-kampus" ${adminOpts.isKampusIcinde ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🏫 Eğitim Kampüsü İçinde Yer Alan Kurum</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">Müdür ve Müdür Başyardımcısı normu verilmez (Md. 5/5, 6/2), +1 İlave Müdür Yardımcısı (Md. 14/1-f)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-aynibina" ${adminOpts.isAyniBinadaKucuk ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🏢 Aynı Binada Başka Kurum Var (Öğrencisi Fazla Olan Bu Okul Değil)</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">Müdür normu öğrenci sayısı en fazla olan kuruma verilir (Md. 5/3)</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; background: var(--bg-card-subtle); padding: 0.45rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                                    <input type="checkbox" id="chk-admin-birlestirilmis" ${adminOpts.isBirlestirilmis ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🔗 Birleştirilmiş Sınıf Uygulaması Yapan Kurum</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">Müdür normu verilmez; müdür yetkili öğretmen görevlendirilir (Md. 5)</div>
                                    </div>
                                </label>
                            </div>

                            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.6rem 0.75rem; margin-bottom: 0.75rem;">
                                <div style="font-size: 0.78rem; font-weight: 800; color: #0284c7; margin-bottom: 0.15rem;">👥 Norma Esas Ek Öğrenci Sayısı (Md. 22/1-b)</div>
                                <div style="font-size: 0.68rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.45rem;">
                                    Müdür yardımcısı normuna esas öğrenci sayısına, okul bünyesindeki ana sınıfı, uygulama sınıfı ve alt özel eğitim sınıfı öğrencileri de dâhil edilir. Şubelerden gelen ${totalStudents} öğrenciye eklenecek sayıyı yazın.
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.4rem;">
                                    <input type="number" id="inp-admin-ek-ogrenci" value="${parseInt(adminOpts.ekSinifOgrencileri || 0, 10)}" min="0" max="2000" class="form-control" style="max-width: 96px; padding: 0.25rem 0.35rem; text-align: center; font-weight: 800; color: #0284c7;">
                                    <span style="font-size: 0.72rem; color: var(--text-muted);">Öğrenci (ana sınıfı / uygulama sınıfı / alt özel eğitim sınıfı)</span>
                                </div>
                            </div>

                            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.6rem 0.75rem; margin-bottom: 0.75rem;">
                                <div style="font-size: 0.78rem; font-weight: 800; color: #7c3aed; margin-bottom: 0.15rem;">🗂️ Kurumda Hâlen Görevli İdareci Sayısı</div>
                                <div style="font-size: 0.68rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.45rem;">
                                    Norm ile karşılaştırılıp "İhtiyaç / Fazla" durumu gösterilir. Bilinmiyorsa 0 bırakın.
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                                    <div style="text-align: center;">
                                        <div style="font-size: 0.66rem; color: var(--text-muted); margin-bottom: 0.15rem;">OKUL MÜDÜRÜ</div>
                                        <input type="number" id="inp-mevcut-mudur" value="${parseInt(mevcutIdareci.mudur || 0, 10)}" min="0" max="10" class="form-control" style="width: 100%; padding: 0.25rem; text-align: center; font-weight: 800; color: #0284c7;">
                                    </div>
                                    <!-- Müdür başyardımcısı ünvanı kaldırıldı; alan gizli tutulur ki
                                         mevcut kayıtlardaki değer 0'a düşsün ve kod kırılmasın. -->
                                    <input type="hidden" id="inp-mevcut-basyrd" value="0">
                                    <div style="text-align: center;">
                                        <div style="font-size: 0.66rem; color: var(--text-muted); margin-bottom: 0.15rem;">MÜDÜR YARDIMCISI</div>
                                        <input type="number" id="inp-mevcut-mdryrd" value="${parseInt(mevcutIdareci.mudurYardimcisi || 0, 10)}" min="0" max="20" class="form-control" style="width: 100%; padding: 0.25rem; text-align: center; font-weight: 800; color: #059669;">
                                    </div>
                                </div>
                            </div>

                            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.6rem 0.75rem; margin-bottom: 0.75rem;">
                                <div style="font-size: 0.78rem; font-weight: 800; color: #0d9488; margin-bottom: 0.15rem;">🧭 Okul Rehberlik Servisi Normu (Md. 21/2, 21/3)</div>
                                <div style="font-size: 0.68rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.45rem;">
                                    Rehber öğretmen (psikolojik danışman) normu ders yükünden değil, öğrenci sayısından hesaplanır. Sınıf rehberlik dersinin bu hesapla ilgisi yoktur; o 1 saat verildiği branşın yüküne yazılır.
                                </div>
                                <label style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.78rem; color: var(--text-main); cursor: pointer; margin-bottom: 0.45rem;">
                                    <input type="checkbox" id="chk-guidance-ilce" ${adminOpts.isIlceEnKalabalikKurum ? 'checked' : ''} style="margin-top: 0.15rem;">
                                    <div>
                                        <strong>🏙️ İlçe Merkezinde Öğrencisi En Fazla Olan Kurum</strong>
                                        <div style="font-size: 0.68rem; color: var(--text-muted);">Öğrenci sayısı yetersizliği nedeniyle ilçede norm verilemiyorsa en kalabalık kuruma 1 norm (Md. 21/2-d)</div>
                                    </div>
                                </label>
                                <div style="display: flex; align-items: center; gap: 0.4rem;">
                                    <input type="number" id="inp-mevcut-rehber" value="${parseInt(mevcutIdareci.rehberOgretmeni || 0, 10)}" min="0" max="20" class="form-control" style="max-width: 96px; padding: 0.25rem 0.35rem; text-align: center; font-weight: 800; color: #0d9488;">
                                    <span style="font-size: 0.72rem; color: var(--text-muted);">Kurumda hâlen görevli rehber öğretmen sayısı</span>
                                </div>
                            </div>

                            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.6rem 0.75rem; margin-bottom: 0.75rem;">
                                <div style="font-size: 0.78rem; font-weight: 800; color: #b45309; margin-bottom: 0.15rem;">📉 Yöneticilerin Okuttuğu Ders Saatleri (Md. 22/6)</div>
                                <div style="font-size: 0.68rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.45rem;">
                                    Alanlara göre öğretmen norm kadroları, yöneticilerin girmiş olduğu ders saatleri ilgili alanın ders yükünden düşülerek belirlenir. Hangi branşta kaç saat derse giriliyorsa o branşa yazın.
                                </div>
                                <input type="text" id="admin-teaching-search" placeholder="🔍 Branş Ara..." class="form-control" style="width: 100%; padding: 0.35rem 0.65rem; font-size: 0.8rem; border-radius: 8px; margin-bottom: 0.5rem;">
                                <div id="admin-teaching-container" style="max-height: 26vh; overflow-y: auto; padding-right: 0.25rem;">
                                    ${adminTeachingRowsHtml}
                                </div>
                            </div>

                            <div id="admin-norm-live-preview" style="background: var(--bg-card); border: 1.5px solid #2563eb; border-radius: 8px; padding: 0.75rem; margin-top: 0.5rem;">
                            </div>
                        </div>

                        ${isVocationalSchool ? `
                            <div id="staff-coordinator-tab" class="staff-tab-content" style="display: none;">
                                <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(147, 51, 234, 0.25); border-radius: 8px; padding: 0.65rem 0.85rem; margin-bottom: 0.75rem;">
                                    <div style="font-size: 0.8rem; font-weight: 800; color: #7e22ce; margin-bottom: 0.2rem;">
                                        📌 12. Sınıf İşletmelerde Mesleki Eğitim Koordinatörlük Yükü (Norm Kadro Yön. Md. 15):
                                    </div>
                                    <div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4;">
                                        MEB Norm Kadro Yönetmeliği uyarınca işletmelere staja giden 12. sınıf öğrencileri için alan öğretmenlerine haftalık koordinatörlük ek ders yükü verilir.
                                    </div>
                                </div>

                                <div style="margin-bottom: 0.75rem;">
                                    <input type="text" id="coordinator-search-input" placeholder="🔍 Alan / Meslek Ara (örn: Bilişim, Makine, Elektrik)..." class="form-control" style="width: 100%; padding: 0.45rem 0.75rem; font-size: 0.85rem; border-radius: 8px;">
                                </div>

                                <div id="coordinator-items-container" style="max-height: 40vh; overflow-y: auto; padding-right: 0.25rem;">
                                    ${coordinatorRowsHtml}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('staff-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-save-staff">Kaydet ve Uygula</button>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        const modalEl = document.getElementById("staff-modal");
        if (modalEl) {
            modalEl.addEventListener("click", (e) => {
                const btn = e.target.closest(".staff-tab-btn");
                if (!btn) return;
                e.preventDefault();
                e.stopPropagation();

                const targetId = btn.getAttribute("data-target");
                if (!targetId) return;

                modalEl.querySelectorAll(".staff-tab-btn").forEach(b => {
                    b.classList.remove("btn-primary", "active");
                    b.classList.add("btn-outline");
                    b.style.background = "";
                    b.style.color = "";
                    b.style.borderColor = "";
                });
                btn.classList.remove("btn-outline");
                btn.classList.add("btn-primary", "active");
                btn.style.background = "#2563eb";
                btn.style.color = "#ffffff";
                btn.style.borderColor = "#2563eb";

                modalEl.querySelectorAll(".staff-tab-content").forEach(c => {
                    c.style.display = "none";
                });
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.style.display = "block";
                }
            });
        }

        // 2. Canlı İdareci Norm Hesaplama Önizleyici
        const updateAdminPreview = () => {
            try {
                const previewEl = document.getElementById("admin-norm-live-preview");
                if (!previewEl) return;

                const opts = {
                    isPansiyonlu: !!document.getElementById("chk-admin-pansiyon")?.checked,
                    hasDonerSermaye: !!document.getElementById("chk-admin-doner")?.checked,
                    isTamGunTamYil: !!document.getElementById("chk-admin-tamgun")?.checked,
                    hasStajyer100Plus: !!document.getElementById("chk-admin-stajyer100")?.checked,
                    hasSigortali500Plus: !!document.getElementById("chk-admin-sigortali500")?.checked,
                    isTasimaMerkezi: !!document.getElementById("chk-admin-tasima")?.checked,
                    isKampusIcinde: !!document.getElementById("chk-admin-kampus")?.checked,
                    isAyniBinadaKucuk: !!document.getElementById("chk-admin-aynibina")?.checked,
                    isBirlestirilmis: !!document.getElementById("chk-admin-birlestirilmis")?.checked,
                    ekSinifOgrencileri: parseInt(document.getElementById("inp-admin-ek-ogrenci")?.value, 10) || 0,
                    isIlceEnKalabalikKurum: !!document.getElementById("chk-guidance-ilce")?.checked,
                    mevcutRehberOgretmeni: parseInt(document.getElementById("inp-mevcut-rehber")?.value, 10) || 0,
                    mevcutIdareciler: {
                        mudur: parseInt(document.getElementById("inp-mevcut-mudur")?.value, 10) || 0,
                        mudurBasyardimcisi: parseInt(document.getElementById("inp-mevcut-basyrd")?.value, 10) || 0,
                        mudurYardimcisi: parseInt(document.getElementById("inp-mevcut-mdryrd")?.value, 10) || 0
                    }
                };

                const normEng = this.norm || this.normEngine || (typeof window !== 'undefined' ? window.normEngine : null);
                const res = normEng ? normEng.calculateAdminNorms(schoolType, totalStudents, opts) : { mudur: 1, mudurBasyardimcisi: 0, mudurYardimcisiTotal: 1, toplamYonetici: 2, explanations: [] };
                const resReh = (normEng && normEng.calculateGuidanceCounselorNorm)
                    ? normEng.calculateGuidanceCounselorNorm(schoolType, totalStudents, opts)
                    : null;

                const k = res.karsilastirma;
                const mevcutToplam = opts.mevcutIdareciler.mudur + opts.mevcutIdareciler.mudurBasyardimcisi + opts.mevcutIdareciler.mudurYardimcisi;
                const kiyasCell = (baslik, c) => {
                    const renk = c.durum === "tam" ? "#16a34a" : (c.durum === "fazla" ? "#b45309" : "#dc2626");
                    const zemin = c.durum === "tam" ? "rgba(22, 163, 74, 0.1)" : (c.durum === "fazla" ? "rgba(180, 83, 9, 0.1)" : "rgba(220, 38, 38, 0.1)");
                    return `
                        <div style="background: ${zemin}; padding: 0.35rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                            <div style="font-size: 0.64rem; color: var(--text-muted);">${baslik}</div>
                            <div style="font-size: 0.72rem; font-weight: 800; color: ${renk};">${c.mevcut} / ${c.norm} · ${c.etiket}</div>
                        </div>
                    `;
                };
                const kiyasHtml = (k && mevcutToplam > 0) ? `
                    <div style="border-top: 1px solid var(--border-subtle); margin-bottom: 0.5rem; padding-top: 0.45rem;">
                        <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); margin-bottom: 0.3rem;">MEVCUT / NORM KARŞILAŞTIRMASI</div>
                        <div style="display: grid; grid-template-columns: repeat(${res.mudurBasyardimcisiAktif === false ? 3 : 4}, 1fr); gap: 0.35rem; text-align: center;">
                            ${kiyasCell("MÜDÜR", k.mudur)}
                            ${res.mudurBasyardimcisiAktif === false ? '' : kiyasCell("BAŞYRD.", k.mudurBasyardimcisi)}
                            ${kiyasCell("MDR. YRD.", k.mudurYardimcisi)}
                            ${kiyasCell("TOPLAM", k.toplam)}
                        </div>
                    </div>
                ` : '';

                const rehberHtml = resReh ? `
                    <div style="border-top: 1px solid var(--border-subtle); margin-bottom: 0.5rem; padding-top: 0.45rem;">
                        <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-card-subtle); padding: 0.4rem 0.55rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                            <div>
                                <div style="font-size: 0.68rem; color: var(--text-muted);">OKUL REHBERLİK SERVİSİ (Md. 21)</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">Eşik: ${resReh.esik} öğrenci (${resReh.esikMadde}) · İlave: her ${resReh.aralik} öğrenci</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="font-size: 1.15rem; font-weight: 800; color: #0d9488;">${resReh.norm}</div>
                                ${resReh.karsilastirma.mevcut > 0 ? `
                                    <span style="font-size: 0.72rem; font-weight: 800; color: ${resReh.karsilastirma.durum === "tam" ? "#16a34a" : (resReh.karsilastirma.durum === "fazla" ? "#b45309" : "#dc2626")};">
                                        ${resReh.karsilastirma.mevcut} / ${resReh.karsilastirma.norm} · ${resReh.karsilastirma.etiket}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        ${resReh.explanations && resReh.explanations.length > 0 ? `
                            <div style="font-size: 0.68rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.15rem; margin-top: 0.35rem;">
                                ${resReh.explanations.map(e => `<div>• ${e}</div>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : '';

                previewEl.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.35rem;">
                        <span style="font-size: 0.82rem; font-weight: 800; color: #1e3a8a;">📊 MEB Yönetici Norm Kadro Dağılımı</span>
                        <span style="font-size: 0.78rem; font-weight: 800; color: #2563eb; background: rgba(37, 99, 235, 0.1); padding: 0.1rem 0.5rem; border-radius: 4px;">Toplam: ${res.toplamYonetici} Yönetici</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(${res.mudurBasyardimcisiAktif === false ? 2 : 3}, 1fr); gap: 0.5rem; text-align: center; margin-bottom: 0.5rem;">
                        <div style="background: var(--bg-card-subtle); padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                            <div style="font-size: 0.68rem; color: var(--text-muted);">OKUL MÜDÜRÜ</div>
                            <div style="font-size: 1.15rem; font-weight: 800; color: #0284c7;">${res.mudur}</div>
                        </div>
                        ${res.mudurBasyardimcisiAktif === false ? '' : `
                        <div style="background: var(--bg-card-subtle); padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                            <div style="font-size: 0.68rem; color: var(--text-muted);">MÜDÜR BAŞYRD.</div>
                            <div style="font-size: 1.15rem; font-weight: 800; color: #7c3aed;">${res.mudurBasyardimcisi}</div>
                        </div>`}
                        <div style="background: var(--bg-card-subtle); padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-subtle);">
                            <div style="font-size: 0.68rem; color: var(--text-muted);">MÜDÜR YARDIMCISI</div>
                            <div style="font-size: 1.15rem; font-weight: 800; color: #059669;">${res.mudurYardimcisiTotal}</div>
                        </div>
                    </div>
                    ${kiyasHtml}
                    ${rehberHtml}
                    ${res.explanations && res.explanations.length > 0 ? `
                        <div style="font-size: 0.68rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.15rem;">
                            ${res.explanations.map(e => `<div>• ${e}</div>`).join('')}
                        </div>
                    ` : ''}
                `;
            } catch (err) {
                console.warn("updateAdminPreview error:", err);
            }
        };

        updateAdminPreview();
        [
            "chk-admin-pansiyon",
            "chk-admin-doner",
            "chk-admin-tamgun",
            "chk-admin-stajyer100",
            "chk-admin-sigortali500",
            "chk-admin-tasima",
            "chk-admin-kampus",
            "chk-admin-aynibina",
            "chk-admin-birlestirilmis",
            "chk-guidance-ilce"
        ].forEach(id => {
            document.getElementById(id)?.addEventListener("change", updateAdminPreview);
        });
        [
            "inp-admin-ek-ogrenci",
            "inp-mevcut-mudur",
            "inp-mevcut-basyrd",
            "inp-mevcut-mdryrd",
            "inp-mevcut-rehber"
        ].forEach(id => {
            document.getElementById(id)?.addEventListener("input", updateAdminPreview);
        });

        document.getElementById("admin-teaching-search")?.addEventListener("input", (e) => {
            const query = (e.currentTarget.value || "").toLowerCase().trim();
            document.querySelectorAll("#admin-teaching-container .admin-teaching-item").forEach(item => {
                const searchTxt = item.dataset.search || "";
                item.style.display = (!query || searchTxt.includes(query)) ? "flex" : "none";
            });
        });

        document.getElementById("staff-branch-search")?.addEventListener("input", (e) => {
            const query = (e.currentTarget.value || "").toLowerCase().trim();
            document.querySelectorAll("#staff-branches-list-container .staff-branch-row").forEach(item => {
                const searchTxt = item.dataset.search || "";
                if (!query || searchTxt.includes(query)) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            });

            document.querySelectorAll("#staff-branches-list-container .branch-group-container").forEach(group => {
                const visibleRows = group.querySelectorAll('.staff-branch-row:not([style*="display: none"])');
                group.style.display = visibleRows.length > 0 ? "block" : "none";
            });
        });

        document.getElementById("coordinator-search-input")?.addEventListener("input", (e) => {
            const query = (e.currentTarget.value || "").toLowerCase().trim();
            document.querySelectorAll("#coordinator-items-container .coordinator-area-item").forEach(item => {
                const searchTxt = item.dataset.search || "";
                if (!query || searchTxt.includes(query)) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            });
        });

        document.getElementById("btn-save-staff")?.addEventListener("click", () => {
            document.querySelectorAll(".teacher-count-input").forEach(input => {
                const branch = input.dataset.branch;
                const val = input.value;
                this.state.setTeacherCount(branch, val);
            });
            document.querySelectorAll(".coordinator-hours-input").forEach(input => {
                const branch = input.dataset.branch;
                const val = input.value;
                this.state.setCoordinatorHours(branch, val);
            });

            const yoneticiDersYukleri = {};
            document.querySelectorAll(".admin-teaching-input").forEach(input => {
                const saat = parseInt(input.value, 10) || 0;
                if (saat > 0) yoneticiDersYukleri[input.dataset.branch] = saat;
            });

            const adminOptsToSave = {
                isPansiyonlu: !!document.getElementById("chk-admin-pansiyon")?.checked,
                hasDonerSermaye: !!document.getElementById("chk-admin-doner")?.checked,
                isTamGunTamYil: !!document.getElementById("chk-admin-tamgun")?.checked,
                hasStajyer100Plus: !!document.getElementById("chk-admin-stajyer100")?.checked,
                hasSigortali500Plus: !!document.getElementById("chk-admin-sigortali500")?.checked,
                isTasimaMerkezi: !!document.getElementById("chk-admin-tasima")?.checked,
                isKampusIcinde: !!document.getElementById("chk-admin-kampus")?.checked,
                isAyniBinadaKucuk: !!document.getElementById("chk-admin-aynibina")?.checked,
                isBirlestirilmis: !!document.getElementById("chk-admin-birlestirilmis")?.checked,
                ekSinifOgrencileri: parseInt(document.getElementById("inp-admin-ek-ogrenci")?.value, 10) || 0,
                isIlceEnKalabalikKurum: !!document.getElementById("chk-guidance-ilce")?.checked,
                mevcutRehberOgretmeni: parseInt(document.getElementById("inp-mevcut-rehber")?.value, 10) || 0,
                mevcutIdareciler: {
                    mudur: parseInt(document.getElementById("inp-mevcut-mudur")?.value, 10) || 0,
                    mudurBasyardimcisi: parseInt(document.getElementById("inp-mevcut-basyrd")?.value, 10) || 0,
                    mudurYardimcisi: parseInt(document.getElementById("inp-mevcut-mdryrd")?.value, 10) || 0,
                    rehberOgretmeni: parseInt(document.getElementById("inp-mevcut-rehber")?.value, 10) || 0
                },
                yoneticiDersYukleri: yoneticiDersYukleri
            };
            this.state.setAdminOptions(adminOptsToSave);

            this.closeModal("staff-modal");
            this.showToast("Kadro, idareci normları ve okul özellikleri güncellendi.", "success");
        });
    }

    renderModal(html) {
        const existing = document.querySelector(".modal-overlay, .modal-backdrop");
        if (existing) existing.remove();
        document.body.insertAdjacentHTML("beforeend", html);

        const newModal = document.querySelector(".modal-overlay.active, .modal-backdrop.active");
        if (newModal) {
            newModal.addEventListener("click", (e) => {
                if (e.target === newModal) {
                    newModal.remove();
                }
            });
            const handleEsc = (e) => {
                if (e.key === "Escape") {
                    newModal.remove();
                    document.removeEventListener("keydown", handleEsc);
                }
            };
            document.addEventListener("keydown", handleEsc);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    }

    // --- TTKB MÜFREDAT VE DERS MOTORU ENTEGRASYONU ---
    getMandatoryCoursesForGrade(grade, areaId = null, dalName = null) {
        if (!this.curriculum && typeof MebCurriculumEngine !== 'undefined') {
            this.curriculum = new MebCurriculumEngine(this.db);
        }
        const schoolType = this.state?.state?.okulBilgisi?.okulTuru || "";
        if (this.curriculum) {
            return this.curriculum.getMandatoryCourses(schoolType, grade, areaId, dalName);
        }
        return [];
    }

    getAvailableElectivesForSection(section) {
        const master = this.db.masterData;
        if (!master) return [];

        const grade = String(section.sinifSeviyesi || "11");
        const schoolType = this.state?.state?.okulBilgisi?.okulTuru || "";
        let list = [];   // süzgeç sonunda yeniden atanabiliyor
        const seenNames = new Set();

        // Aynı dersin listeye iki kez girmesini engelleyen anahtar.
        //
        // Eskiden düz `.toLowerCase()` kullanılıyordu ve Türkçe'de BOZUKTU:
        // JavaScript'te "EĞİTİMİ".toLowerCase() -> "eği̇ti̇mi̇" (i harfinin
        // üstüne ayrı bir nokta karakteri ekler), "Eğitimi".toLowerCase() ise
        // "eğitimi" verir. İkisi eşleşmediği için aynı ders listede İKİ KEZ
        // görünüyordu: "Toplu Ses Eğitimi" ve "TOPLU SES EĞİTİMİ" (ikincisi
        // Güzel Sanatlar Lisesi çizelgesinden, üstelik farklı saatle).
        // Ölçüldü (28.08.2026): AİHL listelerinde 30 kopya gösterim.
        //
        // Parantez İÇERİĞİ KORUNUR: "Arapça (Metin-Mükâleme)" ile "Arapça
        // (Sarf, Nahiv ve Klasik Metinler)" gerçekten AYRI derslerdir; parantez
        // atılırsa biri sessizce kaybolur. Yalnızca tire türleri ve boşluk
        // sadeleşir, çünkü aynı ders iki kaynakta "–" ve "-" ile geçiyor.
        const dersAnahtari = (ad) => String(ad || "")
            .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
            .toLowerCase()
            .replace(/[‐-―]/g, "-")
            .replace(/['’‘]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        const AREA_BRANCHES = {
            'adalet': 'Adalet',
            'aile': 'Aile ve Tüketici Hizmetleri',
            'ayakkabi': 'Ayakkabı ve Saraciye Teknolojisi',
            'ayakkabipro': 'Ayakkabı ve Saraciye Teknolojisi',
            'bilisim': 'Bilişim Teknolojileri',
            'biyomedikal': 'Biyomedikal Cihaz Teknolojileri',
            'buro': 'Büro Yönetimi / Yönetici Asist.',
            'cocukgelisimi': 'Çocuk Gelişimi ve Eğitimi',
            'denizcilik': 'Denizcilik',
            'denizcilikpro': 'Denizcilik',
            'dogugastro': 'Yiyecek İçecek Hizmetleri',
            'elektrik': 'Elektrik-Elektronik Teknolojisi',
            'elsanat': 'El Sanatları Teknolojisi',
            'endustriyel': 'Endüstriyel Otomasyon Teknolojileri',
            'gazetecilik': 'Gazetecilik',
            'gazetecilikpro': 'Gazetecilik',
            'geleneksel': 'Geleneksel Türk Sanatları',
            'gemi': 'Gemi Yapımı',
            'gida': 'Gıda Teknolojisi',
            'grafik': 'Grafik ve Fotoğraf',
            'guzellik': 'Güzellik Saç Bakım Hizmetleri',
            'halklailiskiler': 'Halkla İlişkiler ve Organizasyon',
            'harita': 'Harita-Tapu-Kadastro',
            'hasta': 'Hasta ve Yaşlı Hizmetleri',
            'havacilikveuzaypro': 'Uçak Bakım',
            'hayvanyetistiriciligi': 'Hayvan Yetiştiriciliği ve Sağlığı',
            'insaat': 'İnşaat Teknolojisi',
            'itfaiyecilik': 'İtfaiyecilik ve Yangın Güvenliği',
            'kimya': 'Kimya Teknolojisi',
            'konaklama': 'Konaklama ve Seyahat Hizmetleri',
            'konaklamapro': 'Konaklama ve Seyahat Hizmetleri',
            'kuyumculuk': 'Kuyumculuk Teknolojisi',
            'laboratuvar': 'Laboratuvar Hizmetleri',
            'maden': 'Maden Teknolojisi',
            'makine': 'Makine ve Tasarım Teknolojisi',
            'matbaa': 'Matbaa Teknolojisi',
            'metal': 'Metal Teknolojisi',
            'metalurji': 'Metalürji Teknolojisi',
            'mikromekanik': 'Mikromekanik',
            'mobilya': 'Mobilya ve İç Mekân Tasarımı',
            'moda': 'Moda Tasarım Teknolojileri',
            'motorluarac': 'Motorlu Araçlar Teknolojisi',
            'muhasebe': 'Muhasebe ve Finansman',
            'muhasebepro': 'Muhasebe ve Finansman',
            'pazarlama': 'Pazarlama ve Perakende',
            'plastiksanatlar': 'Plastik Sanatlar',
            'plastiktek': 'Plastik Teknolojisi',
            'radyotv': 'Radyo-Televizyon',
            'radyotvpro': 'Radyo-Televizyon',
            'rayli': 'Raylı Sistemler Teknolojisi',
            'saglik': 'Sağlık Bilgisi ve Trafik Kültürü',
            'seramikpro': 'Seramik ve Cam Teknolojisi',
            'siber': 'Bilişim Teknolojileri',
            'tarim': 'Tarım',
            'tekstil': 'Tekstil Teknolojisi',
            'tesisat': 'Tesisat Teknolojisi ve İklimlendirme',
            'ucak': 'Uçak Bakım',
            'ulastirma': 'Ulaştırma Hizmetleri',
            'yenilenebilir': 'Yenilenebilir Enerji Teknolojileri',
            'yiyecek': 'Yiyecek İçecek Hizmetleri',
            'yiyecekpro': 'Yiyecek İçecek Hizmetleri'
        };

        // 1. MTEGM 6.4.2 Seçmeli Meslek Dersleri Havuzu (Resmî MEB ÇÖP Veritabanı)
        const electiveDb = (typeof window !== 'undefined' && window.STRICT_ELECTIVE_COURSES_DB) 
            ? window.STRICT_ELECTIVE_COURSES_DB 
            : (typeof STRICT_ELECTIVE_COURSES_DB !== 'undefined' ? STRICT_ELECTIVE_COURSES_DB : null);

        let areaKey = section.alanId || "";
        let searchKey = String(areaKey).toLowerCase().replace(/_/g, '');
        let matchedAreaCourses = [];

        if (electiveDb) {
            if (areaKey && electiveDb[areaKey]) {
                matchedAreaCourses = electiveDb[areaKey];
            } else if (searchKey) {
                for (let k in electiveDb) {
                    if (searchKey.includes(k) || k.includes(searchKey)) {
                        matchedAreaCourses = electiveDb[k];
                        break;
                    }
                }
            }
            if (!matchedAreaCourses.length && section.alanAdi) {
                const normAlan = String(section.alanAdi).toLowerCase().replace(/[^a-z0-9]/g, '');
                for (let k in electiveDb) {
                    if (normAlan.includes(k) || k.includes(normAlan)) {
                        matchedAreaCourses = electiveDb[k];
                        break;
                    }
                }
            }
        }

        if (matchedAreaCourses && matchedAreaCourses.length > 0) {
            const vocBranchName = AREA_BRANCHES[areaKey] || (areaKey || "Meslek").replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            for (let sm of matchedAreaCourses) {
                const courseName = sm.ders;
                if (!courseName) continue;

                const normName = dersAnahtari(courseName);
                if (seenNames.has(normName)) continue;
                seenNames.add(normName);

                const baseH = parseInt(sm.saat || 2, 10);
                let hoursOpts = [2, 3, 4];
                if (baseH === 1) hoursOpts = [1, 2];
                else if (baseH === 4) hoursOpts = [2, 3, 4, 6];
                else if (baseH >= 5) hoursOpts = [2, 3, 4, baseH];

                list.push({
                    ders: courseName,
                    grup: "🟣 Seçmeli Meslek Dersi (" + (sm.siniflar || "11-12. Sınıf") + ")",
                    hoursOptions: hoursOpts,
                    selectedHour: baseH || 2,
                    defaultBranch: sm.atananBrans || vocBranchName,
                    isVocational: true,
                    isAtolye: true
                });
            }
        }

        // 2. Okul türünün KENDİ seçmeli havuzu (üretilmiş — resmî TTKB çizelgesi)
        //
        // Bu havuz 28.08.2026'ya kadar meb_master_db.json içinden okunuyordu ve
        // okuma 21 çizelge dosyasını dolaşıp bir dersi İLK gördüğü yerden
        // alıyordu. Anadolu Lisesi dosyası önce geldiği için uzmanlaşmış
        // liselere Anadolu Lisesi'nin saatleri yazılıyordu. Kaynak çizelgeyle
        // karşılaştırma (1265 kayıt): 349'unda saat YANLIŞTI — Spor Lisesi'nde
        // her iki dersten biri. Ekranda hata görünmüyordu; norm hesabı seçilen
        // saat üzerinden yürüdüğü için sonuç sessizce yanlış çıkıyordu.
        //
        // Ayrıca AİHL'de çizelgedeki 129 seçmeliden 10'u master DB'de hiç
        // yoktu ve hiçbir şubede seçilemiyordu.
        //
        // Havuz artık her okulun kendi çizelgesinden üretiliyor
        // (tools/uret_secmeli_havuzu.py -> js/secmeli_havuzu.js, 12 okul türü).
        // Havuzu OLAN tür için master DB okuması (4. adım) hiç çalışmaz;
        // olmayan tür (meslek lisesi, MESEM, ortaokul) eski yolunu sürdürür.
        const uretilmisHavuz = (typeof window !== 'undefined')
            ? (window.SECMELI_HAVUZU || null)
            : (typeof SECMELI_HAVUZU !== 'undefined' ? SECMELI_HAVUZU : null);
        const turHavuzu = uretilmisHavuz ? uretilmisHavuz[schoolType] : null;

        if (turHavuzu) {
            const imamHatipMi = schoolType.includes("imam_hatip");
            for (let d of (turHavuzu[grade] || [])) {
                const normName = dersAnahtari(d.ders);
                if (seenNames.has(normName)) continue;
                seenNames.add(normName);
                list.push({
                    ders: d.ders,
                    grup: d.grup || "Seçmeli Dersler",
                    hoursOptions: d.saatler.slice(),
                    selectedHour: d.saatler[0],
                    defaultBranch: TTKB_MAP[String(d.ders).toUpperCase()]
                        || (imamHatipMi ? "İHL Meslek Dersleri" : d.ders),
                    isVocational: false
                });
            }
        }

        // 2b. ÖZEL PROGRAM LİSELERİ — SEÇİLEBİLİR TEMATİK DERSLER
        //
        // Bu okullarda tematik derslerin hepsi zorunlu DEĞİLDİR. Çizelgenin
        // kendi "TEMATİK ALAN DERS SAATLERİ TOPLAMI" satırı bir öğrencinin o
        // sınıfta kaç saat tematik ders alacağını söyler (10/8/8/4/4).
        // Temanın dersleri bu kotayı aşıyorsa seçim vardır ve dersler buraya,
        // seçmeli listesine gelir. Kotayı tam dolduruyorsa seçim yoktur ve
        // dersler zorunlu listede yer alır (curriculumEngine).
        //
        // Yalnızca ŞUBENİN TEMASINA ait dersler eklenir; başka temanın dersini
        // göstermek, o okulda okutulmayan bir dersi norma yazdırmak olurdu.
        const opTablo = (typeof window !== 'undefined')
            ? (window.OZEL_PROGRAM_TEMALARI || null)
            : (typeof OZEL_PROGRAM_TEMALARI !== 'undefined' ? OZEL_PROGRAM_TEMALARI : null);
        const opTur = opTablo ? opTablo[schoolType] : null;
        if (opTur && section.alanId) {
            const temaDersleri = (opTur.secilebilir || {})[section.alanId] || {};
            const kota = (opTur.kota || {})[grade];
            for (let d of (temaDersleri[grade] || [])) {
                const normName = dersAnahtari(d.ders);
                if (seenNames.has(normName)) continue;
                seenNames.add(normName);
                list.push({
                    ders: d.ders,
                    grup: "Tematik Alan Dersi" + (kota ? " • en çok " + kota + " saat" : ""),
                    hoursOptions: (d.saatSecenekleri || [d.saat]).slice(),
                    selectedHour: d.saat,
                    defaultBranch: d.atananBrans,
                    isVocational: false
                });
            }
        }

        // 3. Ortaokul Seçmeli Havuzu — ELLE YAZILMIŞ, ARTIK YEDEK
        //
        // Aşağıdaki 16 derslik liste elle yazılmıştı ve resmî çizelgeyle
        // uyuşmuyordu: çizelgede HİÇ OLMAYAN dersler içeriyordu (Robotik
        // Kodlama ve Yazılım, Satranç ve Zekâ Oyunları, Yazarlık ve Yazma
        // Becerileri, Matematik Uygulamaları, Bilim Uygulamaları gibi eski
        // müfredat kalıntıları), çizelgedeki 30 dersin çoğu ise yoktu
        // (Afet Bilinci, Medya Okuryazarlığı, Hukuk ve Adalet, Dijital
        // Sanatlar, Geleneksel Sanatlar, Yapay Zekâ Uygulamaları...).
        //
        // 28.08.2026'dan itibaren ortaokul ve imam hatip ortaokulu seçmelileri
        // resmî çizelgeden üretiliyor (2. adım). Bu liste yalnızca üretilmiş
        // havuzu OLMAYAN bir ortaokul türü için (meslek ortaokulu) yedekte
        // duruyor; onun da kaynağa bağlanması gereken bir iş olarak durur.
        if (!turHavuzu && (schoolType.includes("ortaokul") || ["5", "6", "7", "8"].includes(grade))) {
            const middleElectives = [
                { ders: "Yabancı Dil (Ağırlıklı / Seçmeli)", hours: [2, 3, 4], branch: "İngilizce", grup: "Yabancı Dil Becerileri" },
                { ders: "Matematik Uygulamaları", hours: [2], branch: "Matematik", grup: "Matematik ve Bilim" },
                { ders: "Bilim Uygulamaları", hours: [2], branch: "Fen Bilimleri", grup: "Matematik ve Bilim" },
                { ders: "Robotik Kodlama ve Yazılım", hours: [2], branch: "Bilişim Teknolojileri", grup: "Bilişim ve Teknoloji" },
                { ders: "Yazarlık ve Yazma Becerileri", hours: [2], branch: "Türkçe", grup: "Dil ve İletişim" },
                { ders: "Masal ve Destanlarımız", hours: [1, 2], branch: "Türkçe", grup: "Kültür ve Sanat" },
                { ders: "Çevre Eğitimi ve İklim Değişikliği", hours: [1, 2], branch: "Fen Bilimleri", grup: "Çevre ve Doğa" },
                { ders: "Düşünme Eğitimi", hours: [1, 2], branch: "Sosyal Bilgiler", grup: "Sosyal Bilimler" },
                { ders: "Halk Oyunları", hours: [2], branch: "Beden Eğitimi", grup: "Spor ve Sanat" },
                { ders: "Spor ve Fiziki Etkinlikler", hours: [2], branch: "Beden Eğitimi", grup: "Spor ve Sanat" },
                { ders: "Görsel Sanatlar (Resim / Heykel)", hours: [2], branch: "Görsel Sanatlar", grup: "Kültür ve Sanat" },
                { ders: "Müzik (Koro / Çalgı)", hours: [2], branch: "Müzik", grup: "Kültür ve Sanat" },
                { ders: "Satranç ve Zekâ Oyunları", hours: [2], branch: "Matematik", grup: "Zekâ ve Strateji" },
                { ders: "Kur'an-ı Kerim (Seçmeli)", hours: [2], branch: "Din Kültürü ve Ahlak Bilgisi", grup: "Din, Ahlak ve Değerler" },
                { ders: "Peygamberimizin Hayatı (Seçmeli)", hours: [2], branch: "Din Kültürü ve Ahlak Bilgisi", grup: "Din, Ahlak ve Değerler" },
                { ders: "Temel Dini Bilgiler (Seçmeli)", hours: [1, 2], branch: "Din Kültürü ve Ahlak Bilgisi", grup: "Din, Ahlak ve Değerler" }
            ];

            for (let me of middleElectives) {
                const normName = dersAnahtari(me.ders);
                if (!seenNames.has(normName)) {
                    seenNames.add(normName);
                    list.push({
                        ders: me.ders,
                        grup: `Temel Eğitim Seçmeli • ${me.grup}`,
                        hoursOptions: me.hours,
                        selectedHour: me.hours[0],
                        defaultBranch: me.branch,
                        isVocational: false
                    });
                }
            }
        }

        // 4. OGM & Genel Kültür Seçmeli Havuzu (9-12. Sınıflar)
        //
        // YALNIZCA üretilmiş havuzu OLMAYAN okul türleri için. Havuzu olan tür
        // (12 lise türü) kendi çizelgesini 2. adımda aldı; burada yeniden
        // dolaşmak, başka okulların derslerini ve saatlerini geri getirirdi.
        if (!turHavuzu && master.okul_turleri_ve_cizelgeler?.ortaogretim_genel_mudurlugu_ogm?.dosyalar) {
            const files = master.okul_turleri_ve_cizelgeler.ortaogretim_genel_mudurlugu_ogm.dosyalar;
            for (let fKey in files) {
                for (let s of (files[fKey]?.haftalik_ders_cizelgeleri || [])) {
                    for (let g of (s.secmeli_ders_gruplari || [])) {
                        for (let d of (g.dersler || [])) {
                            const rawHours = d.sinif_ders_saatleri?.[grade];
                            if (rawHours && rawHours !== '-') {
                                const normName = dersAnahtari(d.ders);
                                if (!seenNames.has(normName)) {
                                    seenNames.add(normName);
                                    const hoursOpts = getOfficialElectiveHoursOptions(d.ders, rawHours, grade);
                                    const defaultH = hoursOpts[0] || 2;
                                    list.push({
                                        ders: d.ders,
                                        grup: g.grup_adi || "Genel Kültür Seçmeli",
                                        hoursOptions: hoursOpts,
                                        selectedHour: defaultH,
                                        defaultBranch: TTKB_MAP[String(d.ders).toUpperCase()] || d.ders,
                                        isVocational: false
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }


        // NOT — burada eskiden bir "okul türüne göre seçmeli süzgeci" vardı.
        // Havuz master DB'den geldiği ve bütün okulların derslerini içerdiği
        // için, listeyi okulun kendi çizelgesine daraltmak gerekiyordu.
        // 28.08.2026'da havuzun kendisi okul türüne göre üretilmeye başlandı
        // (2. adım); süzgeç aynı işi ikinci kez yapıyordu. Aynı kuralın iki
        // yerde durması bu projede tekrar eden hata kaynağı: süzgecin ad
        // eşleştiricisi üreteçle uyuşmadığı için Anadolu Lisesi'nin 45
        // seçmelisinden 36'sı bir gün boyunca gizli kalmıştı. Tek mekanizma
        // bırakıldı.

        return list;
    }

    // =========================================================================
    // 📊 MEB RAPORLAMA VE ANALİZ MERKEZİ MODAL VE GÖRSELLEŞTİRME MOTORU
    // =========================================================================
    openReportsModal(initialTab = "GRID") {
        let currentTab = initialTab;
        let filterGrade = "ALL";
        let filterBranch = "ALL";
        let isMonochrome = false;
        let isVerticalHeaders = false;

        const modalHtml = `
            <div class="modal-overlay active" id="reports-center-modal">
                <div class="modal-box reports-modal-box">
                    <!-- Üst Başlık ve Eylem Butonları -->
                    <div class="modal-header reports-modal-header">
                        <div class="reports-header-left">
                            <div class="reports-header-title">
                                <span>🖨️</span> MEB Norm Kadro ve Ders Yükü Raporlama Merkezi
                            </div>
                            <div class="reports-header-meta">
                                <span class="reports-badge school-name-badge">${this.state.state.okulBilgisi.okulAdi || 'Okul'}</span>
                                <span class="reports-badge season-badge">${this.state.state.okulBilgisi.sezon || '2024-2025'}</span>
                                <span class="reports-badge date-badge" id="report-live-date"></span>
                            </div>
                        </div>
                        <div class="reports-header-actions no-print">
                            <!-- Resmî Antet & İmzalar Butonu -->
                            <button class="btn-report-action btn-report-antet" id="btn-report-edit-antet" title="Resmî Valilik / Kaymakamlık Anteti, Okul Logosu ve İmzacıları Düzenle">
                                <span class="action-icon">🏛️</span> <span>Resmî Antet & İmzalar</span>
                            </button>

                            <!-- Görünüm Seçenekleri Grubu -->
                            <div class="report-actions-pill-group">
                                <button class="btn-report-action" id="btn-report-toggle-mono" title="Renkli / Resmi Siyah-Beyaz Modu">
                                    <span class="action-icon">🎨</span> <span id="lbl-mono-mode">Siyah-Beyaz Mod</span>
                                </button>
                                <button class="btn-report-action" id="btn-report-toggle-fullscreen" title="Tam Ekran / Normal Boyut">
                                    <span class="action-icon">⛶</span> <span id="lbl-fullscreen-mode">Tam Ekran</span>
                                </button>
                            </div>

                            <!-- Dışa Aktar & Yazdır Grubu -->
                            <div class="report-actions-pill-group">
                                <button class="btn-report-action btn-report-excel" id="btn-report-export-xlsx" title="Çok Sekmeli Renkli Excel (.XLSX) Olarak İndir">
                                    <span class="action-icon">📊</span> <span>Excel (.XLSX)</span>
                                </button>
                                <button class="btn-report-action" id="btn-report-export-csv" title="CSV Formatında İndir">
                                    <span class="action-icon">📄</span> <span>CSV</span>
                                </button>
                                <button class="btn-report-action btn-report-print" id="btn-report-print" title="A4 / A3 Resmî Yazdır veya PDF Kaydet">
                                    <span class="action-icon">🖨️</span> <span>Yazdır / PDF</span>
                                </button>
                            </div>

                            <button class="modal-close-btn" id="btn-close-reports-modal" title="Pencereyi Kapat">✕</button>
                        </div>
                    </div>

                    <!-- Kategori Sekmeleri (Tabs) -->
                    <div class="reports-nav-tabs no-print">
                        <button class="report-tab-btn ${currentTab === 'GRID' ? 'active' : ''}" data-tab="GRID">
                            <span class="tab-icon">🏫</span> Master Yük Matrisi (Grid)
                        </button>
                        <button class="report-tab-btn ${currentTab === 'EXECUTIVE' ? 'active' : ''}" data-tab="EXECUTIVE">
                            <span class="tab-icon">🏛️</span> Yönetici İcmali
                        </button>
                        <button class="report-tab-btn ${currentTab === 'BRANCH' ? 'active' : ''}" data-tab="BRANCH">
                            <span class="tab-icon">⚖️</span> Branş Detay Cetveli
                        </button>
                        <button class="report-tab-btn ${currentTab === 'SCHEDULE' ? 'active' : ''}" data-tab="SCHEDULE">
                            <span class="tab-icon">📋</span> Şube Ders Çizelgeleri
                        </button>
                        <button class="report-tab-btn ${currentTab === 'ACTION' ? 'active' : ''}" data-tab="ACTION">
                            <span class="tab-icon">🚨</span> Norm İhtiyaç/Fazla Eylem
                        </button>
                        <button class="report-tab-btn ${currentTab === 'LAB' ? 'active' : ''}" data-tab="LAB">
                            <span class="tab-icon">🧩</span> Atölye & Grup Bölünmeleri
                        </button>
                        <button class="report-tab-btn ${currentTab === 'THEME' ? 'active' : ''}" data-tab="THEME">
                            <span class="tab-icon">🎯</span> 3-Tema Seçmeli Dengesi
                        </button>
                    </div>

                    <!-- Dinamik Filtreleme ve Arama Barı -->
                    <div class="reports-filter-bar no-print" id="reports-filter-container">
                        <!-- Dinamik olarak doldurulur -->
                    </div>

                    <!-- Ana Rapor İçerik Alanı (Yazdırılabilir) -->
                    <div class="modal-body reports-modal-body" id="reports-render-container">
                        <!-- Seçilen Raporun Canlı HTML Görünümü -->
                    </div>

                    <!-- Yazdırma Alt Bilgi / Onay Bloğu (Sadece Yazdırmada Görünür) -->
                    <div class="demo-print-watermark">LİSANSSIZ DEMO SÜRÜMÜ — RESMÎ MEB TESLİMATINDA GEÇERSİZDİR</div>
                    <div class="reports-print-footer only-print" id="reports-print-signature-box">
                        <!-- JS tarafından dinamik antet bilgilerine göre doldurulur -->
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        const updateDate = () => {
            const dateEl = document.getElementById("report-live-date");
            if (dateEl) dateEl.innerText = new Date().toLocaleString("tr-TR");
        };
        updateDate();

        const renderActiveTab = () => {
            const container = document.getElementById("reports-render-container");
            const filterContainer = document.getElementById("reports-filter-container");
            const signFooterEl = document.getElementById("reports-print-signature-box");
            if (!container) return;

            // Filtre Barını Güncelle
            this.renderReportsFilterBar(currentTab, filterGrade, filterBranch, filterContainer, (newG, newB) => {
                filterGrade = newG;
                filterBranch = newB;
                renderActiveTab();
            });

            // Rapor İçeriğini Render Et
            const stateData = this.state.state;
            const antet = stateData.okulBilgisi.antet || {};

            // Yazdırma İmza Bloğunu Güncelle
            if (signFooterEl) {
                signFooterEl.innerHTML = `
                    <div class="print-sign-box">
                        <p class="sign-title">${antet.hazirlayanUnvan || 'Müdür Yardımcısı'}</p>
                        <p class="sign-name">${antet.hazirlayanAdSoyad || '........................'}</p>
                        <p class="sign-dots">İmza: ........................</p>
                    </div>
                    <div class="print-sign-box">
                        <p class="sign-title">${antet.kontrolUnvan || 'Müdür Yardımcısı'}</p>
                        <p class="sign-name">${antet.kontrolAdSoyad || '........................'}</p>
                        <p class="sign-dots">İmza: ........................</p>
                    </div>
                    <div class="print-sign-box">
                        <p class="sign-title">${antet.onaylayanUnvan || 'Okul Müdürü'}</p>
                        <p class="sign-name">${antet.onaylayanAdSoyad || '........................'}</p>
                        <p class="sign-dots">Mühür / İmza: ........................</p>
                    </div>
                `;
            }

            let reportHtml = "";

            if (currentTab === "GRID") {
                const data = this.reports.generateMasterLoadGrid(stateData, filterGrade);
                reportHtml = this.renderMasterGridReport(data, isMonochrome, isVerticalHeaders);
            } else if (currentTab === "EXECUTIVE") {
                const data = this.reports.generateExecutiveSummary(stateData);
                reportHtml = this.renderExecutiveReport(data, isMonochrome);
            } else if (currentTab === "BRANCH") {
                const data = this.reports.generateBranchDetailReport(stateData, filterBranch);
                reportHtml = this.renderBranchDetailReport(data, isMonochrome);
            } else if (currentTab === "SCHEDULE") {
                const data = this.reports.generateSectionScheduleReport(stateData, filterGrade, "ALL");
                reportHtml = this.renderScheduleReport(data, isMonochrome);
            } else if (currentTab === "ACTION") {
                const data = this.reports.generateNormActionReport(stateData);
                reportHtml = this.renderNormActionReport(data, isMonochrome);
            } else if (currentTab === "LAB") {
                const data = this.reports.generateVocationalLabReport(stateData);
                reportHtml = this.renderVocationalLabReport(data, isMonochrome);
            } else if (currentTab === "THEME") {
                const data = this.reports.generateElectiveThemeReport(stateData);
                reportHtml = this.renderElectiveThemeReport(data, isMonochrome);
            }

            container.innerHTML = reportHtml;
            container.scrollTop = 0;
        };

        // Sekme Değiştirme Dinleyicileri
        document.querySelectorAll(".report-tab-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const t = btn.getAttribute("data-tab");
                if (t && t !== currentTab) {
                    currentTab = t;
                    document.querySelectorAll(".report-tab-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    renderActiveTab();
                }
            });
        });

        // Resmî Antet & İmzaları Düzenle Modalı
        document.getElementById("btn-report-edit-antet")?.addEventListener("click", () => {
            // Tek yetki kaynağı: licenseManager.disaAktarimIzinliMi()
            const lm = (typeof window !== 'undefined') ? window.licenseManager : null;
            if (lm && !lm.disaAktarimIzinliMi()) {
                alert("🔒 LİSANS GEREKLİ: Resmî Valilik / İlçe MEM Başlığı ve Onay İmzacılarını düzenlemek lisanslı sürüme özeldir.");
                this.openLicenseModal();
                return;
            }
            this.openOfficialAntetModal();
        });

        // Tam Ekran / Normal Boyut Geçişi
        let isFullscreen = false;
        document.getElementById("btn-report-toggle-fullscreen")?.addEventListener("click", () => {
            isFullscreen = !isFullscreen;
            const box = document.querySelector(".reports-modal-box");
            const lbl = document.getElementById("lbl-fullscreen-mode");
            if (box) {
                if (isFullscreen) {
                    box.classList.add("fullscreen-report-mode");
                    if (lbl) lbl.innerText = "Normal Boyut";
                } else {
                    box.classList.remove("fullscreen-report-mode");
                    if (lbl) lbl.innerText = "Tam Ekran";
                }
            }
        });

        // Siyah Beyaz / Renkli Mod Geçişi
        document.getElementById("btn-report-toggle-mono")?.addEventListener("click", () => {
            isMonochrome = !isMonochrome;
            const lbl = document.getElementById("lbl-mono-mode");
            if (lbl) lbl.innerText = isMonochrome ? "Renkli Mod" : "Siyah-Beyaz Modu";
            const box = document.querySelector(".reports-modal-box");
            if (box) {
                if (isMonochrome) box.classList.add("monochrome-mode");
                else box.classList.remove("monochrome-mode");
            }
            renderActiveTab();
        });

        // Excel (.XLSX) İndirme (Çok Sekmeli & Renkli) - LİSANS KONTROLÜ
        document.getElementById("btn-report-export-xlsx")?.addEventListener("click", () => {
            // Tek yetki kaynağı: licenseManager.disaAktarimIzinliMi()
            const lm = (typeof window !== 'undefined') ? window.licenseManager : null;
            if (lm && !lm.disaAktarimIzinliMi()) {
                alert("🔒 LİSANS GEREKLİ: 5 sekmeli Excel (.XLSX) norm kadro cetveli indirmek lisanslı sürüme özeldir. Lütfen okulunuz için lisans anahtarı temin ediniz.");
                this.openLicenseModal();
                return;
            }
            const stateData = this.state.state;
            const ok = this.reports.exportToXLSX(stateData);
            if (ok) {
                this.showToast("📊 5 Sekmeli Kurumsal Excel (.XLSX) Raporu Başarıyla İndirildi!", "success");
            } else {
                this.showToast("XLSX motoru yüklenirken bir sorun oluştu, CSV olarak deneniyor...", "warning");
                document.getElementById("btn-report-export-csv")?.click();
            }
        });

        // CSV İndirme - LİSANS KONTROLÜ
        document.getElementById("btn-report-export-csv")?.addEventListener("click", () => {
            // Tek yetki kaynağı: licenseManager.disaAktarimIzinliMi()
            const lm = (typeof window !== 'undefined') ? window.licenseManager : null;
            if (lm && !lm.disaAktarimIzinliMi()) {
                alert("🔒 LİSANS GEREKLİ: Norm kadro verilerini dışa aktarmak lisanslı sürüme özeldir. Lütfen lisans anahtarınızı aktifleştiriniz.");
                this.openLicenseModal();
                return;
            }
            const stateData = this.state.state;
            let reportData = null;
            if (currentTab === "GRID") reportData = this.reports.generateMasterLoadGrid(stateData, filterGrade);
            else if (currentTab === "EXECUTIVE") reportData = this.reports.generateExecutiveSummary(stateData);
            else if (currentTab === "BRANCH") reportData = this.reports.generateBranchDetailReport(stateData, filterBranch);
            else if (currentTab === "ACTION") reportData = this.reports.generateNormActionReport(stateData);
            else reportData = this.reports.generateMasterLoadGrid(stateData, "ALL");

            const csvContent = this.reports.exportToCSV(reportData);
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const safeName = (stateData.okulBilgisi.okulAdi || "MEB_Norm").replace(/[^a-zA-Z0-9_\-ğüşıöçĞÜŞİÖÇ]/g, "_");
            a.download = `${safeName}_${currentTab}_Raporu_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showToast("CSV raporu başarıyla indirildi!", "success");
        });

        // Yazdırma (Print)
        //
        // Yazdırma BİLEREK engellenmiyor: kullanıcı ürünün gerçekten
        // işe yaradığını görmeli, satış öyle olur. Ama deneme sürümünde
        // çıktıya filigran basılır; müdürlüğe sunulamaz.
        //
        // Bu yol daha önce hiç kontrol edilmiyordu: Excel ve CSV kilitliyken
        // deneme kullanıcısı raporu PDF'e yazdırıp kullanabiliyordu.
        document.getElementById("btn-report-print")?.addEventListener("click", () => {
            const lm = (typeof window !== 'undefined') ? window.licenseManager : null;
            const deneme = lm ? lm.denemeSurumuMu() : false;
            // Yalnızca rapor penceresi kâğıda gitsin; arkadaki uygulama
            // ekranı ve açık olabilecek diğer pencereler basılmasın.
            document.body.classList.add("yazdir-rapor");
            if (deneme) {
                document.body.classList.add("deneme-filigran");
                alert("🔒 DENEME SÜRÜMÜ\n\n"
                    + "Çıktı alabilirsiniz, ancak sayfalara "
                    + "\"DENEME SÜRÜMÜ — RESMÎ GEÇERLİLİĞİ YOKTUR\" filigranı "
                    + "basılacaktır.\n\n"
                    + "Filigransız çıktı için yıllık lisans gereklidir.");
            }
            window.print();
            // İşaretler yalnızca yazdırma sırasında dursun; ekranda kalmasın.
            setTimeout(() => {
                document.body.classList.remove("deneme-filigran");
                document.body.classList.remove("yazdir-rapor");
            }, 1500);
        });

        // Kapatma
        document.getElementById("btn-close-reports-modal")?.addEventListener("click", () => {
            this.closeModal("reports-center-modal");
        });

        // İlk render
        renderActiveTab();
    }

    // --- RESMÎ ANTET, OKUL LOGOSU VE İMZA BLOĞU MODALI ---
    openOfficialAntetModal() {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {
            ilValiligi: "ANKARA VALİLİĞİ",
            ilceMem: "Çankaya İlçe Millî Eğitim Müdürlüğü",
            resmiOkulAdi: stateData.okulBilgisi.okulAdi || "Atatürk Mesleki ve Teknik Anadolu Lisesi",
            logoBase64: null,
            hazirlayanUnvan: "Müdür Yardımcısı",
            hazirlayanAdSoyad: "",
            // Ünvan kaldırıldığı için varsayılan imzacı Müdür Yardımcısı.
            // Alan kullanıcı tarafından düzenlenebilir (inp-kontrol-unvan).
            kontrolUnvan: "Müdür Yardımcısı",
            kontrolAdSoyad: "",
            onaylayanUnvan: "Okul Müdürü",
            onaylayanAdSoyad: ""
        };

        const modalHtml = `
            <div class="modal-overlay active" id="antet-settings-modal" style="z-index: 1100;">
                <div class="modal-box" style="max-width: 660px; width: 95%;">
                    <div class="modal-header">
                        <div class="modal-title">🏛️ Resmî Antet, Okul Logosu ve İmza Bloğu Ayarları</div>
                        <button class="modal-close-btn" onclick="document.getElementById('antet-settings-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body" style="padding: 1.25rem;">
                        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">
                            Raporların ve PDF çıktılarının üst kısmında yer alacak resmî idari antet ve altındaki imza/onay bloklarını düzenleyiniz:
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                            <!-- Okul Logosu & Antet -->
                            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-main); border-radius: 8px; padding: 0.85rem;">
                                <div style="font-weight: 800; font-size: 0.82rem; color: var(--primary); margin-bottom: 0.65rem; text-transform: uppercase;">
                                    1. Üst Resmî Başlık (Antet) ve Logo
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.65rem;">
                                    <div>
                                        <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">İl / Valilik Başlığı:</label>
                                        <input type="text" id="inp-antet-valilik" class="form-control" value="${antet.ilValiligi || 'ANKARA VALİLİĞİ'}" placeholder="Örn: ANKARA VALİLİĞİ">
                                    </div>
                                    <div>
                                        <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">İlçe Millî Eğitim Müdürlüğü:</label>
                                        <input type="text" id="inp-antet-ilce" class="form-control" value="${antet.ilceMem || 'Çankaya İlçe Millî Eğitim Müdürlüğü'}" placeholder="Örn: Çankaya İlçe Millî Eğitim Müdürlüğü">
                                    </div>
                                </div>
                                <div>
                                    <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Resmî Okul / Kurum Adı:</label>
                                    <input type="text" id="inp-antet-okul" class="form-control" value="${antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || ''}" placeholder="Örn: Atatürk Mesleki ve Teknik Anadolu Lisesi">
                                </div>
                                <div style="margin-top: 0.65rem; display: flex; align-items: center; justify-content: space-between;">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <div id="antet-logo-preview" style="width: 44px; height: 44px; border: 1.5px dashed var(--border-main); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff;">
                                            ${antet.logoBase64 ? `<img src="${antet.logoBase64}" style="max-width:100%; max-height:100%; object-fit:contain;">` : '<span style="font-size:1.25rem;">🇹🇷</span>'}
                                        </div>
                                        <div>
                                            <div style="font-size: 0.78rem; font-weight: 700;">Okul Logosu Yükle (İsteğe Bağlı)</div>
                                            <div style="font-size: 0.7rem; color: var(--text-muted);">PNG, JPG veya SVG formatında</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 0.4rem;">
                                        <button class="btn btn-sm btn-outline" id="btn-upload-logo">🖼️ Logo Seç</button>
                                        ${antet.logoBase64 ? `<button class="btn btn-sm btn-danger-outline" id="btn-remove-logo">Kaldır</button>` : ''}
                                        <input type="file" id="file-antet-logo" accept="image/*" style="display:none;">
                                    </div>
                                </div>
                            </div>

                            <!-- Resmî İmza Blokları -->
                            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-main); border-radius: 8px; padding: 0.85rem;">
                                <div style="font-weight: 800; font-size: 0.82rem; color: var(--primary); margin-bottom: 0.65rem; text-transform: uppercase;">
                                    2. Resmî İmza ve Onay Blokları
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem;">
                                    <!-- 1. Düzenleyen -->
                                    <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.55rem;">
                                        <div style="font-size: 0.72rem; font-weight: 800; color: #0284c7; margin-bottom: 0.35rem;">1. DÜZENLEYEN</div>
                                        <input type="text" id="inp-hazirlayan-unvan" class="form-control form-control-sm" value="${antet.hazirlayanUnvan || 'Müdür Yardımcısı'}" placeholder="Unvan" style="margin-bottom: 0.3rem;">
                                        <input type="text" id="inp-hazirlayan-ad" class="form-control form-control-sm" value="${antet.hazirlayanAdSoyad || ''}" placeholder="Adı Soyadı">
                                    </div>

                                    <!-- 2. Kontrol Eden -->
                                    <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.55rem;">
                                        <div style="font-size: 0.72rem; font-weight: 800; color: #7c3aed; margin-bottom: 0.35rem;">2. KONTROL EDEN</div>
                                        <input type="text" id="inp-kontrol-unvan" class="form-control form-control-sm" value="${antet.kontrolUnvan || 'Müdür Başyardımcısı'}" placeholder="Unvan" style="margin-bottom: 0.3rem;">
                                        <input type="text" id="inp-kontrol-ad" class="form-control form-control-sm" value="${antet.kontrolAdSoyad || ''}" placeholder="Adı Soyadı">
                                    </div>

                                    <!-- 3. Onaylayan -->
                                    <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.55rem;">
                                        <div style="font-size: 0.72rem; font-weight: 800; color: #059669; margin-bottom: 0.35rem;">3. UYGUNDUR / ONAY</div>
                                        <input type="text" id="inp-onay-unvan" class="form-control form-control-sm" value="${antet.onaylayanUnvan || 'Okul Müdürü'}" placeholder="Unvan" style="margin-bottom: 0.3rem;">
                                        <input type="text" id="inp-onay-ad" class="form-control form-control-sm" value="${antet.onaylayanAdSoyad || ''}" placeholder="Adı Soyadı">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('antet-settings-modal').remove()">Vazgeç</button>
                        <button class="btn btn-primary" id="btn-save-antet-settings">💾 Antet ve İmzaları Kaydet</button>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        let uploadedLogoBase64 = antet.logoBase64;
        const fileInput = document.getElementById("file-antet-logo");
        document.getElementById("btn-upload-logo")?.addEventListener("click", () => fileInput.click());
        fileInput?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedLogoBase64 = event.target.result;
                const prevBox = document.getElementById("antet-logo-preview");
                if (prevBox) prevBox.innerHTML = `<img src="${uploadedLogoBase64}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
            };
            reader.readAsDataURL(file);
        });

        document.getElementById("btn-remove-logo")?.addEventListener("click", () => {
            uploadedLogoBase64 = null;
            const prevBox = document.getElementById("antet-logo-preview");
            if (prevBox) prevBox.innerHTML = `<span style="font-size:1.25rem;">🇹🇷</span>`;
        });

        document.getElementById("btn-save-antet-settings")?.addEventListener("click", () => {
            const updatedAntet = {
                ilValiligi: document.getElementById("inp-antet-valilik")?.value || "ANKARA VALİLİĞİ",
                ilceMem: document.getElementById("inp-antet-ilce")?.value || "İlçe Millî Eğitim Müdürlüğü",
                resmiOkulAdi: document.getElementById("inp-antet-okul")?.value || stateData.okulBilgisi.okulAdi,
                logoBase64: uploadedLogoBase64,
                hazirlayanUnvan: document.getElementById("inp-hazirlayan-unvan")?.value || "Müdür Yardımcısı",
                hazirlayanAdSoyad: document.getElementById("inp-hazirlayan-ad")?.value || "",
                kontrolUnvan: document.getElementById("inp-kontrol-unvan")?.value || "Müdür Yardımcısı",
                kontrolAdSoyad: document.getElementById("inp-kontrol-ad")?.value || "",
                onaylayanUnvan: document.getElementById("inp-onay-unvan")?.value || "Okul Müdürü",
                onaylayanAdSoyad: document.getElementById("inp-onay-ad")?.value || ""
            };

            this.state.setOfficialAntet(updatedAntet);
            this.closeModal("antet-settings-modal");
            this.showToast("Resmî antet ve imza blokları güncellendi!", "success");
            // Rapor görünümünü tazele
            const rModal = document.getElementById("reports-center-modal");
            if (rModal) {
                const activeTabBtn = rModal.querySelector(".report-tab-btn.active");
                if (activeTabBtn) activeTabBtn.click();
            }
        });
    }

    renderReportsFilterBar(currentTab, filterGrade, filterBranch, containerEl, onFilterChange) {
        if (!containerEl) return;
        const subeler = this.state.state.subeler || [];
        const uniqueGrades = [...new Set(subeler.map(s => String(s.sinifSeviyesi)))].sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0));
        
        const branchList = this.db.getAllBranchesList() || [];
        const uniqueBranches = branchList.map(b => b.brans_adi || b.brans || b).filter(Boolean).sort((a, b) => a.localeCompare(b, 'tr'));

        let html = `<div class="filter-group-inner">`;

        if (["GRID", "SCHEDULE"].includes(currentTab)) {
            html += `
                <div class="filter-item">
                    <label class="filter-lbl">Sınıf Kademesi Filtresi:</label>
                    <select id="sel-filter-grade" class="form-control form-control-sm">
                        <option value="ALL" ${filterGrade === 'ALL' ? 'selected' : ''}>Tüm Sınıflar (Tüm Okul)</option>
                        ${uniqueGrades.map(g => `<option value="${g}" ${filterGrade === g ? 'selected' : ''}>${String(g).toLowerCase() === 'hazirlik' ? 'Hazırlık Sınıfları' : g + '. Sınıflar'}</option>`).join("")}
                    </select>
                </div>
            `;
        }

        if (currentTab === "BRANCH") {
            html += `
                <div class="filter-item">
                    <label class="filter-lbl">Branş Seçimi:</label>
                    <select id="sel-filter-branch" class="form-control form-control-sm">
                        <option value="ALL" ${filterBranch === 'ALL' ? 'selected' : ''}>Tüm Branşlar (Toplu Liste)</option>
                        ${uniqueBranches.map(b => `<option value="${b}" ${filterBranch === b ? 'selected' : ''}>${b}</option>`).join("")}
                    </select>
                </div>
            `;
        }

        html += `
            <div class="filter-summary-pill">
                <span>📌 Toplam <strong>${subeler.length}</strong> Şube Aktif</span>
            </div>
        </div>`;

        containerEl.innerHTML = html;

        document.getElementById("sel-filter-grade")?.addEventListener("change", (e) => {
            onFilterChange(e.target.value, filterBranch);
        });

        document.getElementById("sel-filter-branch")?.addEventListener("change", (e) => {
            onFilterChange(filterGrade, e.target.value);
        });
    }

    // 1. MASTER YÜK MATRİSİ RENDER (KURUMSAL VE MÜKEMMEL A4/A3 MİZANPAJLI)
    renderMasterGridReport(data, isMono, isVertical = true) {
        if (!data || data.subeler.length === 0) {
            return `<div class="empty-report-state">⚠️ Henüz şube veya ders verisi eklenmemiş. Lütfen sol panelden şube ekleyiniz.</div>`;
        }

        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        // Sınıf Kademelerine Göre Şubeleri Grupla (Hierarchical Class Groups)
        const gradeMap = {};
        data.subeler.forEach(s => {
            const g = String(s.sinifSeviyesi || '9');
            if (!gradeMap[g]) gradeMap[g] = [];
            gradeMap[g].push(s);
        });

        const sortedGrades = Object.keys(gradeMap).sort((a, b) => {
            const ga = a === 'hazirlik' ? 0 : (parseInt(a, 10) || 99);
            const gb = b === 'hazirlik' ? 0 : (parseInt(b, 10) || 99);
            return ga - gb;
        });

        // 📐 KOMPAKT DİKEY BAŞLIK MOTORU (Compact & Smart Header Layout Engine)
        // Uzun alan isimlerini dikey başlıkta şıkça kısaltır, ekranı boğmadan ders listesine maksimum alan bırakır (120px - 145px)
        const formatCompactSecName = (name) => {
            if (!name) return "";
            return String(name)
                .replace(/Elektrik-Elektronik Teknolojisi/gi, "Elektrik")
                .replace(/Elektrik-Elektronik/gi, "Elektrik")
                .replace(/Bilişim Teknolojileri/gi, "Bilişim")
                .replace(/Harita-Tapu-Kadastro/gi, "Harita")
                .replace(/Makine ve Tasarım Teknolojisi/gi, "Makine")
                .replace(/Makine ve Tasarım/gi, "Makine")
                .replace(/Motorlu Araçlar Teknolojisi/gi, "Motor")
                .replace(/Motorlu Araçlar/gi, "Motor")
                .replace(/Yenilenebilir Enerji Teknolojileri/gi, "Yenilenebilir")
                .replace(/Yenilenebilir Enerji/gi, "Yenilenebilir")
                .replace(/Tesisat Teknolojisi ve İklimlendirme/gi, "Tesisat")
                .replace(/Mobilya ve İç Mekan Tasarımı/gi, "Mobilya")
                .replace(/Metal Teknolojisi/gi, "Metal")
                .replace(/Sağlık Hizmetleri/gi, "Sağlık")
                .replace(/Muhasebe ve Finansman/gi, "Muhasebe")
                .replace(/Konaklama ve Seyahat Hizmetleri/gi, "Konaklama")
                .replace(/Yiyecek İçecek Hizmetleri/gi, "Yiyecek")
                .replace(/Güzellik ve Saç Bakım Hizmetleri/gi, "Güzellik")
                .replace(/Çocuk Gelişimi ve Eğitimi/gi, "Çocuk Gel.")
                .replace(/Hasta ve Yaşlı Hizmetleri/gi, "Hasta/Yaşlı")
                .replace(/Biyomedikal Cihaz Teknolojileri/gi, "Biyomedikal")
                .replace(/Endüstriyel Otomasyon Teknolojileri/gi, "Otomasyon")
                .replace(/Gıda Teknolojisi/gi, "Gıda")
                .replace(/Hayvan Yetiştiriciliği ve Sağlığı/gi, "Hayvan Sağ.")
                .replace(/Tarım/gi, "Tarım")
                .replace(/Laboratuvar Hizmetleri/gi, "Laboratuvar")
                .replace(/Kimya Teknolojisi/gi, "Kimya")
                .replace(/İnşaat Teknolojisi/gi, "İnşaat")
                .replace(/Havacılık ve Uzay Teknolojisi/gi, "Havacılık")
                .replace(/Denizcilik/gi, "Denizcilik")
                .replace(/Grafik ve Fotoğraf/gi, "Grafik")
                .replace(/Radyo-Televizyon/gi, "Radyo-TV")
                .replace(/Halkla İlişkiler/gi, "Halkla İliş.")
                .replace(/Pazarlama ve Perakende/gi, "Pazarlama")
                .replace(/Uçak Bakım/gi, "Uçak Bakım")
                .replace(/Raylı Sistemler Teknolojisi/gi, "Raylı Sis.")
                .replace(/Gemi Yapımı/gi, "Gemi Yapımı")
                .replace(/Plastik Teknolojisi/gi, "Plastik")
                .replace(/Seramik ve Cam Teknolojisi/gi, "Seramik")
                .replace(/Tekstil Teknolojisi/gi, "Tekstil")
                .replace(/Moda Tasarım Teknolojileri/gi, "Moda Tas.")
                .replace(/Ayakkabı ve Saraciye Teknolojisi/gi, "Ayakkabı")
                .replace(/Kuyumculuk Teknolojisi/gi, "Kuyumculuk")
                .replace(/Matbaa Teknolojisi/gi, "Matbaa")
                .replace(/Gazetecilik/gi, "Gazetecilik")
                .replace(/Büro Yönetimi ve Yönetici Asistanlığı/gi, "Büro Yön.")
                .replace(/Adalet/gi, "Adalet")
                .replace(/Güvenlik Hizmetleri/gi, "Güvenlik")
                .replace(/İtfaiyecilik ve Yangın Güvenliği/gi, "İtfaiye")
                .replace(/Maden Teknolojisi/gi, "Maden")
                .replace(/Mikromekanik/gi, "Mikromekanik")
                .replace(/Siber Güvenlik/gi, "Siber Güv.");
        };

        let maxCharLen = 10;
        data.subeler.forEach(s => {
            const compactName = formatCompactSecName(s.subeAdi);
            const label = `${compactName} ${s.ogrenciSayisi || 30} Ögr`;
            if (label.length > maxCharLen) maxCharLen = label.length;
        });

        // Maksimum 135px kompakt başlık yüksekliği (Ders listesini tam göstermek için)
        const dynamicHeaderHeight = Math.max(120, Math.min(145, Math.round(maxCharLen * 6.5 + 28)));

        let html = `
            <!-- Resmî Yazdırma Başlığı (Sadece Baskı / PDF'te Görünür) -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">HAFTALIK BRANŞ-ŞUBE DERS DAĞITIM VE YÜK MATRİSİ</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                        <div><strong>Toplam Şube:</strong> ${data.subeler.length}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <!-- Ekranda Görünen Rapor Başlığı (no-print) -->
            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • Toplam ${data.subeler.length} Şube • Toplam ${data.grandTotalHours} Saat Ders Yükü</div>
            </div>

            <div class="master-grid-wrapper vertical-header-mode">
                <table class="master-grid-table">
                    <colgroup>
                        <col style="width: 220px; min-width: 220px; max-width: 220px;">
                        ${data.subeler.map(() => `<col style="width: 26px; min-width: 26px; max-width: 26px;">`).join("")}
                        <col style="width: 48px; min-width: 48px; max-width: 48px;">
                        <col style="width: 42px; min-width: 42px; max-width: 42px;">
                    </colgroup>
                    <thead>
                        <!-- 1. KATMAN: KADEME GRUPLANDIRMA ÜST BAŞLIĞI -->
                        <tr class="grade-group-header-row">
                            <th rowspan="2" class="sticky-col-header branch-course-head">
                                <div class="branch-course-head-inner">BRANŞ VE DERS DAĞILIMI</div>
                            </th>
                            ${sortedGrades.map(g => `
                                <th colspan="${gradeMap[g].length}" class="grade-super-header grade-${g}">
                                    ${g === 'hazirlik' ? 'HAZIRLIK SINIFLARI' : g + '. SINIFLAR'} (${gradeMap[g].length} Şube)
                                </th>
                            `).join("")}
                            <th rowspan="2" class="total-col-header">
                                <div class="stat-col-head-inner">TOPLAM SAAT</div>
                            </th>
                            <th rowspan="2" class="norm-col-header">
                                <div class="stat-col-head-inner">NORM</div>
                            </th>
                        </tr>
                        <!-- 2. KATMAN: DİNAMİK DİKEY ŞUBE BAŞLIKLARI -->
                        <tr class="section-sub-header-row" style="height: ${dynamicHeaderHeight}px;">
                            ${data.subeler.map(s => {
                                const compactName = formatCompactSecName(s.subeAdi);
                                return `
                                <th class="sec-col-header vertical-sec-header" style="height: ${dynamicHeaderHeight}px;" title="${s.subeAdi} (${s.ogrenciSayisi || 30} Öğrenci)">
                                    <div class="vertical-sec-box" style="height: ${dynamicHeaderHeight - 12}px; max-height: ${dynamicHeaderHeight - 12}px;">
                                        <span class="sec-header-title">${compactName}</span>
                                        <span class="sec-header-meta">${s.ogrenciSayisi || 30} Ögr</span>
                                    </div>
                                </th>
                            `}).join("")}
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.sortedBranchNames.forEach((bName, bIdx) => {
            const bGroup = data.branchGroups[bName];
            const bReport = data.branchReportMap[bName] || { calculatedNorm: 0, currentTeachers: 0, statusType: 'tam' };

            const isVoc = bGroup.isVocational;
            const stripClass = isVoc ? 'area-summary-strip' : 'branch-summary-strip';
            const icon = isVoc ? '🟣' : '🔷';

            const displayHours = (bReport && bReport.totalHours !== undefined) ? bReport.totalHours : bGroup.totalHours;

            // Branş / Alan Başlık Şeridi
            html += `
                <tr class="${stripClass}">
                    <td class="branch-strip-title" colspan="${data.subeler.length + 3}">
                        <div class="branch-strip-content">
                            <span class="branch-title-text">${icon} <strong>${bName.toUpperCase()}</strong> ${isVoc ? 'ALANI' : 'BRANŞI'}</span>
                            <div class="branch-strip-metrics">
                                <span class="badge-metric load-metric">Haftalık Yük: <strong>${displayHours}s</strong></span>
                                <span class="badge-metric norm-metric">Norm: <strong>${bReport.calculatedNorm}</strong></span>
                                <span class="badge-metric teacher-metric">Mevcut: <strong>${bReport.currentTeachers}</strong></span>
                                <span class="badge-metric status-${bReport.statusType}">${bReport.difference > 0 ? `+${bReport.difference} Fazla` : (bReport.difference < 0 ? `${bReport.difference} İhtiyaç` : 'Tam')}</span>
                            </div>
                        </div>
                    </td>
                </tr>
            `;

            // Branşa Bağlı Derslerin Satırları
            const courseList = Object.values(bGroup.courses).sort((a, b) => a.courseName.localeCompare(b.courseName, 'tr'));
            courseList.forEach((course, cIdx) => {
                const isEven = cIdx % 2 === 0;
                html += `
                    <tr class="course-data-row ${isEven ? 'row-even' : 'row-odd'}">
                        <td class="sticky-col-cell course-name-cell">
                            <div class="course-name-inner">
                                <span class="course-bullet">●</span>
                                <span class="course-name-text">${course.courseName}</span>
                                ${course.isBaraj ? '<span class="pill-baraj" title="Baraj / Zorunlu Ders">BARAJ</span>' : ''}
                                ${course.isAtolye ? '<span class="pill-atolye" title="Atölye / Uygulama">ATÖLYE</span>' : ''}
                            </div>
                        </td>
                        ${data.subeler.map(s => {
                            const h = course.sectionHours[s.id];
                            const isMerged = course.mergedSections && course.mergedSections[s.id] && course.mergedSections[s.id].length > 0;
                            if (h && h > 0) {
                                if (isMerged) {
                                    return `<td class="cell-hour active-hour cell-merged-hour" title="🔗 Birleşik Ders (${s.subeAdi})">${h}<span class="merge-badge-icon">🔗</span></td>`;
                                }
                                return `<td class="cell-hour active-hour">${h}</td>`;
                            }
                            return `<td class="cell-hour empty-hour"><span class="matrix-dash">—</span></td>`;
                        }).join("")}
                        <td class="cell-total-course"><strong>${course.totalHours}</strong></td>
                        <td class="cell-norm-contrib">—</td>
                    </tr>
                `;
            });
        });

        // Genel Toplam Satırı (Footer)
        html += `
                    </tbody>
                    <tfoot>
                        <tr class="grand-total-row">
                            <td class="sticky-col-cell grand-total-label">HAFTALIK ŞUBE TOPLAM DERS SAATİ</td>
                            ${data.subeler.map(s => `
                                <td class="cell-sec-total"><strong>${data.sectionTotals[s.id] || 0}</strong></td>
                            `).join("")}
                            <td class="cell-grand-total"><strong>${data.subeler.reduce((s, sec) => s + (data.sectionTotals[sec.id] || 0), 0)}</strong></td>
                            <td class="cell-grand-norm">—</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        return html;
    }

    // 2. YÖNETİCİ İCMAL RAPORU RENDER
    renderExecutiveReport(data, isMono) {
        const kpis = data.kpis;
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">NORM KADRO VE DERS YÜKÜ YÖNETİCİ İCMAL RAPORU</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • Eğitim-Öğretim Sezonu: ${data.schoolInfo.sezon || '2024-2025'}</div>
            </div>

            <!-- Minimalist Yönetici İcmali Konteyneri -->
            <div class="exec-minimal-container">
                <!-- 1. Kompakt Metrik Şeridi (5 KPI Tek İnce Şerit) -->
                <div class="exec-stat-strip">
                    <div class="exec-stat-cell highlight-blue">
                        <div class="exec-stat-label">Haftalık Ders Yükü</div>
                        <div class="exec-stat-val-row">
                            <span class="exec-stat-val c-blue">${kpis.totalHours}</span>
                            <span class="exec-stat-unit">Saat</span>
                        </div>
                        <div class="exec-stat-sub">${kpis.totalSections} Şube • ${kpis.totalStudents} Öğrenci</div>
                    </div>

                    <div class="exec-stat-cell highlight-green">
                        <div class="exec-stat-label">Hesaplanan Norm</div>
                        <div class="exec-stat-val-row">
                            <span class="exec-stat-val c-green">${kpis.totalCalculatedNorm}</span>
                            <span class="exec-stat-unit">Öğretmen</span>
                        </div>
                        <div class="exec-stat-sub">MEB Norm Yönetmeliği</div>
                    </div>

                    <div class="exec-stat-cell highlight-purple">
                        <div class="exec-stat-label">Mevcut Kadrolu</div>
                        <div class="exec-stat-val-row">
                            <span class="exec-stat-val c-purple">${kpis.totalCurrentTeachers}</span>
                            <span class="exec-stat-unit">Öğretmen</span>
                        </div>
                        <div class="exec-stat-sub">Görevli Kadrolar</div>
                    </div>

                    <div class="exec-stat-cell ${kpis.totalNeeded > 0 ? 'highlight-red' : 'highlight-neutral'}">
                        <div class="exec-stat-label">Net Norm İhtiyacı</div>
                        <div class="exec-stat-val-row">
                            <span class="exec-stat-val ${kpis.totalNeeded > 0 ? 'c-red' : 'c-neutral'}">${kpis.totalNeeded}</span>
                            <span class="exec-stat-unit">Açık</span>
                        </div>
                        <div class="exec-stat-sub">${kpis.ihtiyacBranchesCount} Branşta Açık</div>
                    </div>

                    <div class="exec-stat-cell ${kpis.totalSurplus > 0 ? 'highlight-orange' : 'highlight-neutral'}">
                        <div class="exec-stat-label">Net Norm Fazlası</div>
                        <div class="exec-stat-val-row">
                            <span class="exec-stat-val ${kpis.totalSurplus > 0 ? 'c-orange' : 'c-neutral'}">${kpis.totalSurplus}</span>
                            <span class="exec-stat-unit">Fazla</span>
                        </div>
                        <div class="exec-stat-sub">${kpis.fazlaBranchesCount} Branşta Fazlalık</div>
                    </div>
                </div>

                <!-- 2. Durum Rozetleri Şeridi -->
                <div class="exec-status-pills">
                    <span class="exec-pill pill-tam">● Kadrosu Tam: ${kpis.tamBranchesCount} Branş</span>
                    <span class="exec-pill pill-ihtiyac">● Norm İhtiyacı: ${kpis.ihtiyacBranchesCount} Branş</span>
                    <span class="exec-pill pill-fazla">● Norm Fazlası: ${kpis.fazlaBranchesCount} Branş</span>
                </div>

                <!-- 3. Yönetici ve Rehberlik Birleşik Minimalist 2-Sütunlu Grid -->
                <div class="exec-dual-panel-grid">
                    ${data.adminNorms ? `
                    <div class="exec-compact-panel">
                        <div class="exec-panel-header">
                            <div class="exec-panel-title">
                                <span>🏛️ İdareci Norm Kadro Durumu</span>
                            </div>
                            <span class="exec-panel-badge badge-admin-total">Toplam Norm: ${data.adminNorms.toplamYonetici}</span>
                        </div>
                        <div class="exec-mini-table">
                            <div class="exec-mini-cell">
                                <div class="exec-mini-cell-title">Müdür</div>
                                <div class="exec-mini-cell-num" style="color: #0284c7;">${data.adminNorms.mudur}</div>
                                <div class="exec-mini-cell-sub">Md. 5/1</div>
                            </div>
${data.adminNorms.mudurBasyardimcisiAktif === false ? '' : `
                            <div class="exec-mini-cell">
                                <div class="exec-mini-cell-title">Mdr. Başyrd.</div>
                                <div class="exec-mini-cell-num" style="color: #7c3aed;">${data.adminNorms.mudurBasyardimcisi}</div>
                                <div class="exec-mini-cell-sub">${data.adminNorms.mudurBasyardimcisi > 0 ? 'Pansiyon/Yatılı' : 'Oluşmadı'}</div>
                            </div>`}
                            <div class="exec-mini-cell">
                                <div class="exec-mini-cell-title">Mdr. Yrd.</div>
                                <div class="exec-mini-cell-num" style="color: #059669;">${data.adminNorms.mudurYardimcisiTotal}</div>
                                <div class="exec-mini-cell-sub">T:${data.adminNorms.mudurYardimcisiBase} + İ:${data.adminNorms.mudurYardimcisiExtra}</div>
                            </div>
                        </div>
                        ${data.adminNorms.karsilastirma ? `
                        <div class="exec-mevcut-strip">
                            <span class="strip-label">Mevcut / Norm</span>
                            ${[["Müdür", data.adminNorms.karsilastirma.mudur],
                               ...(data.adminNorms.mudurBasyardimcisiAktif === false ? []
                                   : [["Başyrd.", data.adminNorms.karsilastirma.mudurBasyardimcisi]]),
                               ["Mdr. Yrd.", data.adminNorms.karsilastirma.mudurYardimcisi],
                               ["Toplam", data.adminNorms.karsilastirma.toplam]
                            ].map(([ad, c]) => `
                                <span class="strip-item">${ad} <b>${c.mevcut} / ${c.norm}</b>
                                    <span class="d-${c.durum}">${c.etiket}</span></span>
                            `).join('')}
                        </div>
                        ` : ''}
                        ${data.adminNorms.explanations && data.adminNorms.explanations.length > 0 ? `
                        <div class="exec-footnotes">
                            ${data.adminNorms.explanations.map(exp => `<div>• ${exp}</div>`).join('')}
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}

                    ${data.guidanceNorms ? `
                    <div class="exec-compact-panel">
                        <div class="exec-panel-header">
                            <div class="exec-panel-title">
                                <span>🧭 Rehberlik Servisi Normu</span>
                            </div>
                            <span class="exec-panel-badge badge-guidance-total">Rehber Norm: ${data.guidanceNorms.norm}</span>
                        </div>
                        <div class="exec-mini-table">
                            <div class="exec-mini-cell">
                                <div class="exec-mini-cell-title">İlk Norm</div>
                                <div class="exec-mini-cell-num" style="color: #0d9488;">${data.guidanceNorms.ilkNorm}</div>
                                <div class="exec-mini-cell-sub">Eşik: ${data.guidanceNorms.esik} Öğr.</div>
                            </div>
                            <div class="exec-mini-cell">
                                <div class="exec-mini-cell-title">İlave Norm</div>
                                <div class="exec-mini-cell-num" style="color: #7c3aed;">${data.guidanceNorms.ilaveNorm}</div>
                                <div class="exec-mini-cell-sub">Her ${data.guidanceNorms.aralik} Öğr. +1</div>
                            </div>
                            <div class="exec-mini-cell">
                                <div class="exec-mini-cell-title">Esas Öğrenci</div>
                                <div class="exec-mini-cell-num" style="color: #059669;">${data.guidanceNorms.normaEsasOgrenciSayisi}</div>
                                <div class="exec-mini-cell-sub">Kayıtlı Öğrenci</div>
                            </div>
                        </div>
                        ${data.guidanceNorms.karsilastirma ? `
                        <div class="exec-mevcut-strip">
                            <span class="strip-label">Mevcut / Norm</span>
                            <span class="strip-item">Rehber Öğretmen
                                <b>${data.guidanceNorms.karsilastirma.mevcut} / ${data.guidanceNorms.karsilastirma.norm}</b>
                                <span class="d-${data.guidanceNorms.karsilastirma.durum}">${data.guidanceNorms.karsilastirma.etiket}</span></span>
                            <span class="strip-item">Dayanak <b>${data.guidanceNorms.esikMadde}</b></span>
                        </div>
                        ` : ''}
                        ${data.guidanceNorms.explanations && data.guidanceNorms.explanations.length > 0 ? `
                        <div class="exec-footnotes">
                            ${data.guidanceNorms.explanations.map(exp => `<div>• ${exp}</div>`).join('')}
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Branşlar Tablosu -->
            <div class="table-responsive-container">
                <table class="report-data-table">
                    <thead>
                        <tr>
                            <th>BRANŞ ADI</th>
                            <th>TOPLAM DERS YÜKÜ</th>
                            <th>HESAPLANAN NORM</th>
                            <th>MEVCUT KADRO</th>
                            <th>FARK / DURUM</th>
                            <th>MEVZUAT FORMÜLÜ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.branchReport.map(b => `
                            <tr>
                                <td class="font-medium">${b.branchName}</td>
                                <td><strong>${b.totalHours}</strong> Saat</td>
                                <td><span class="norm-val-badge">${b.calculatedNorm}</span></td>
                                <td>${b.currentTeachers}</td>
                                <td><span class="status-badge-lg status-${b.statusType || 'tam'}">${b.statusBadge}</span></td>
                                <td class="text-muted text-sm">${b.formulaExplanation || 'MEB Standart Norm Baremi'}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
        return html;
    }

    // 3. BRANŞ BAZLI DETAYLI NORM CETVELİ RENDER
    renderBranchDetailReport(data, isMono) {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">BRANŞ BAZLI DETAYLI NORM VE YÜK CETVELİ</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • Detaylı Branş İnceleme Cetveli</div>
            </div>

            <div class="branch-detail-cards-container">
                ${data.branches.map(b => `
                    <div class="branch-detail-card">
                        <div class="branch-card-header">
                            <div class="b-title">⚖️ ${b.branchName}</div>
                            <span class="status-badge-lg status-${b.statusType || 'tam'}">${b.statusBadge}</span>
                        </div>
                        <div class="branch-card-body">
                            <div class="b-stats-row">
                                <div class="b-stat"><span>Toplam Ders Yükü:</span> <strong>${b.totalHours} Saat</strong></div>
                                <div class="b-stat"><span>Hesaplanan Norm:</span> <strong>${b.calculatedNorm} Öğretmen</strong></div>
                                <div class="b-stat"><span>Mevcut Kadrolu:</span> <strong>${b.currentTeachers} Öğretmen</strong></div>
                                <div class="b-stat"><span>Net Durum:</span> <strong>${b.statusText || 'Tam'}</strong></div>
                            </div>
                            <div class="b-rule-box">
                                <strong>Mevzuat Dayanağı:</strong> ${b.formulaExplanation || '—'}
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
        return html;
    }

    // 4. SINIF VE ŞUBE HAFTALIK DERS ÇİZELGELERİ RENDER
    renderScheduleReport(data, isMono) {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">ŞUBE HAFTALIK DERS DAĞITIM ÇİZELGELERİ</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • Haftalık Ders Dağıtım Listesi</div>
            </div>

            <div class="section-schedules-grid">
                ${data.sections.map(sec => `
                    <div class="schedule-section-card">
                        <div class="sec-card-header">
                            <div class="sec-title">🏫 ${sec.subeAdi} (${sec.sinifSeviyesi}. Sınıf)</div>
                            <div class="sec-total-badge ${sec.totals.weeklyTotal === 40 || sec.totals.weeklyTotal === 45 ? 'badge-ok' : 'badge-warn'}">
                                Haftalık Toplam: <strong>${sec.totals.weeklyTotal} Saat</strong>
                            </div>
                        </div>
                        <div class="sec-card-body">
                            <!-- Ortak Dersler -->
                            <div class="course-group-block">
                                <div class="group-title">📘 Ortak Zorunlu Dersler (${sec.totals.common} Saat)</div>
                                <ul class="course-mini-list">
                                    ${sec.commonCourses.map(c => `<li><span class="c-name">${c.ders}</span> <span class="c-hour">${c.saat}s</span></li>`).join("")}
                                </ul>
                            </div>

                            <!-- Meslek / Dal Dersleri -->
                            ${sec.vocationalCourses.length > 0 ? `
                                <div class="course-group-block">
                                    <div class="group-title">⚙️ Alan / Dal Meslek Dersleri (${sec.totals.vocational} Saat)</div>
                                    <ul class="course-mini-list">
                                        ${sec.vocationalCourses.map(c => `<li><span class="c-name">${c.ders}</span> <span class="c-hour">${c.saat}s</span></li>`).join("")}
                                    </ul>
                                </div>
                            ` : ''}

                            <!-- Seçmeli Dersler -->
                            ${sec.electiveCourses.length > 0 ? `
                                <div class="course-group-block">
                                    <div class="group-title">🎯 Seçmeli Dersler (${sec.totals.elective} Saat)</div>
                                    <ul class="course-mini-list">
                                        ${sec.electiveCourses.map(c => `<li><span class="c-name">${c.ders}</span> <span class="c-hour">${c.saat}s</span></li>`).join("")}
                                    </ul>
                                </div>
                            ` : ''}

                            <!-- Rehberlik -->
                            ${sec.guidanceCourse ? `
                                <div class="course-group-block">
                                    <div class="group-title">🧭 Rehberlik ve Yönlendirme (${sec.totals.guidance} Saat)</div>
                                    <ul class="course-mini-list">
                                        <li><span class="c-name">${sec.guidanceCourse.ders}</span> <span class="c-hour">${sec.guidanceCourse.saat}s</span></li>
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
        return html;
    }

    // 5. NORM İHTİYAÇ VE FAZLALIK EYLEM RAPORU RENDER
    renderNormActionReport(data, isMono) {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">NORM KADRO İHTİYAÇ VE FAZLALIK RESMÎ EYLEM CETVELİ</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • İl / İlçe Millî Eğitim Müdürlüğü MEBBİS Norm Güncelleme Cetveli</div>
            </div>

            <!-- İhtiyaç Tablosu -->
            <div class="action-report-section">
                <div class="action-header red-header">
                    <span>🚨 NORM KADRO İHTİYACI OLAN BRANŞLAR (ÖĞRETMEN TALEP LİSTESİ)</span>
                    <span class="action-count-badge">Toplam İhtiyaç: ${data.totalNeeded} Öğretmen</span>
                </div>
                ${data.neededList.length > 0 ? `
                    <table class="report-data-table">
                        <thead>
                            <tr>
                                <th>BRANŞ</th>
                                <th>DERS YÜKÜ</th>
                                <th>NORM</th>
                                <th>MEVCUT</th>
                                <th>İHTİYAÇ</th>
                                <th>MEB GEREKÇESİ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.neededList.map(item => `
                                <tr>
                                    <td class="font-medium">${item.branchName}</td>
                                    <td>${item.totalHours}s</td>
                                    <td>${item.calculatedNorm}</td>
                                    <td>${item.currentTeachers}</td>
                                    <td><strong class="text-danger">${item.neededCount} İhtiyaç</strong></td>
                                    <td class="text-sm text-muted">${item.reason}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                ` : `<div class="empty-state-notice">✅ Okulda norm kadro açığı / ihtiyacı olan branş bulunmamaktadır.</div>`}
            </div>

            <!-- Fazlalık Tablosu -->
            <div class="action-report-section" style="margin-top: 2rem;">
                <div class="action-header orange-header">
                    <span>⚠️ NORM KADRO FAZLASI OLAN BRANŞLAR (ATAMA / NAKİL LİSTESİ)</span>
                    <span class="action-count-badge">Toplam Fazla: ${data.totalSurplus} Öğretmen</span>
                </div>
                ${data.surplusList.length > 0 ? `
                    <table class="report-data-table">
                        <thead>
                            <tr>
                                <th>BRANŞ</th>
                                <th>DERS YÜKÜ</th>
                                <th>NORM</th>
                                <th>MEVCUT</th>
                                <th>FAZLALIK</th>
                                <th>MEB GEREKÇESİ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.surplusList.map(item => `
                                <tr>
                                    <td class="font-medium">${item.branchName}</td>
                                    <td>${item.totalHours}s</td>
                                    <td>${item.calculatedNorm}</td>
                                    <td>${item.currentTeachers}</td>
                                    <td><strong class="text-warning">${item.surplusCount} Fazlalık</strong></td>
                                    <td class="text-sm text-muted">${item.reason}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                ` : `<div class="empty-state-notice">✅ Okulda norm kadro fazlası öğretmen bulunmamaktadır.</div>`}
            </div>
        `;
        return html;
    }

    // 6. ATÖLYE, LABORATUVAR VE GRUP BÖLÜNMELERİ RENDER (ŞEFFAF BAREM DENETİMİ)
    renderVocationalLabReport(data, isMono) {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        // 12. Sınıf Koordinatörlük Cetveli
        const coordMap = stateData.koordinatorlukYukleri || {};
        const coordEntries = Object.entries(coordMap).filter(([k, v]) => parseInt(v, 10) > 0);

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">MESLEKİ VE TEKNİK ATÖLYE / GRUP BÖLÜNMELERİ VE KOORDİNATÖRLÜK RAPORU</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • MEB Ortaöğretim Kurumları Yönetmeliği Madde 134 ve Madde 88 Barem Denetimi</div>
            </div>

            <!-- KPI Kartları -->
            <div class="kpi-dashboard-grid" style="margin-bottom: 1.5rem;">
                <div class="kpi-card kpi-purple">
                    <div class="kpi-label">TABAN ATÖLYE DERS SAATİ</div>
                    <div class="kpi-value">${data.grandBaseHours} <span class="kpi-unit">Saat</span></div>
                    <div class="kpi-foot">Ders Çizelgesi Temel Saati</div>
                </div>
                <div class="kpi-card kpi-blue">
                    <div class="kpi-label">GRUP ÇARPANLI HESAPLANAN YÜK</div>
                    <div class="kpi-value">${data.grandCalculatedHours} <span class="kpi-unit">Saat</span></div>
                    <div class="kpi-foot">Norm Kadroya Yansıyan Fiili Yük</div>
                </div>
                <div class="kpi-card kpi-green">
                    <div class="kpi-label">GRUPLANDIRMADAN GELEN EK YÜK</div>
                    <div class="kpi-value">+${data.totalExtraGroupHours} <span class="kpi-unit">Saat</span></div>
                    <div class="kpi-foot">Bölünmelerden Oluşan Ek Norm Yükü</div>
                </div>
            </div>

            <!-- Bilgilendirme Kutusu (Mevzuat Baremi) -->
            <div class="meb-regulation-notice-box" style="background: rgba(2, 132, 199, 0.06); border: 1.5px solid rgba(2, 132, 199, 0.25); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.76rem; color: #0369a1;">
                <strong>📜 MEB Mevzuat Baremi (OÖKY Md. 134):</strong> 10-20 Öğrenci ➔ <strong>1 Grup</strong> | 21-30 Öğrenci ➔ <strong>2 Grup</strong> | 31-40 Öğrenci ➔ <strong>3 Grup</strong> | 41+ Öğrenci ➔ <strong>4 Grup</strong> olarak hesaplanır.
            </div>

            <div class="table-responsive-container">
                <table class="report-data-table">
                    <thead>
                        <tr>
                            <th>ŞUBE</th>
                            <th>MEVCUT</th>
                            <th>ATÖLYE DERSİ</th>
                            <th>BRANŞ</th>
                            <th>TEMEL SAAT</th>
                            <th>GRUP SAYISI</th>
                            <th>FİİLİ DERS YÜKÜ</th>
                            <th>EK YÜK (+)</th>
                            <th>MEVZUAT AÇIKLAMASI</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.labCourses.map(item => `
                            <tr>
                                <td class="font-medium">${item.sectionName}</td>
                                <td>${item.studentCount} Ögr</td>
                                <td>${item.courseName}</td>
                                <td>${item.branchName}</td>
                                <td>${item.baseHours}s</td>
                                <td><span class="group-count-badge">${item.groupCount} Grup</span></td>
                                <td><strong>${item.calculatedLoad}s</strong></td>
                                <td><span style="color:#16a34a; font-weight:800;">+${item.extraLoad}s</span></td>
                                <td class="text-sm text-muted">${item.note}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <!-- 12. Sınıf Koordinatörlük Bölümü -->
            ${coordEntries.length > 0 ? `
                <div style="margin-top: 2rem; background: var(--bg-card-subtle); border: 1.5px solid var(--border-main); border-radius: 10px; padding: 1rem 1.25rem;">
                    <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.65rem; display: flex; align-items: center; justify-content: space-between;">
                        <span>🏢 12. SINIF İŞLETMELERDE MESLEK EĞİTİMİ (STAJ) KOORDİNATÖRLÜK YÜKLERİ</span>
                        <span style="font-size: 0.72rem; color: #7c3aed; background: rgba(124, 58, 237, 0.1); padding: 0.15rem 0.55rem; border-radius: 6px;">OÖKY Madde 88 Hükmü</span>
                    </div>
                    <table class="report-data-table">
                        <thead>
                            <tr>
                                <th>MESLEK ALANI / BRANŞ</th>
                                <th>HAFTALIK KOORDİNATÖRLÜK YÜKÜ</th>
                                <th>YASAL DAYANAK</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${coordEntries.map(([br, val]) => `
                                <tr>
                                    <td class="font-medium">🟣 ${br}</td>
                                    <td><strong style="color: #7c3aed;">+${val} Saat</strong></td>
                                    <td class="text-muted text-sm">MEB Ortaöğretim Kurumları Yönetmeliği Madde 88 (Öğretmen Başına Koordinatörlük)</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
        `;
        return html;
    }

    // 7. 3-TEMA SEÇMELİ DERS DENGESİ RENDER
    renderElectiveThemeReport(data, isMono) {
        const stateData = this.state.state;
        const antet = stateData.okulBilgisi.antet || {};

        let html = `
            <!-- Resmî Yazdırma Başlığı -->
            <div class="official-print-header only-print">
                <div class="print-header-top">
                    <div class="print-logo-box">
                        ${antet.logoBase64 ? `<img src="${antet.logoBase64}" class="official-school-logo" alt="Okul Logosu">` : '<div class="meb-crest-fallback">🇹🇷</div>'}
                    </div>
                    <div class="print-text-center">
                        <div class="print-antet-line-1">T.C.</div>
                        <div class="print-antet-line-2">${(antet.ilValiligi || 'ANKARA VALİLİĞİ').toUpperCase()}</div>
                        <div class="print-antet-line-3">${(antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()}</div>
                        <div class="print-antet-line-4">${(antet.resmiOkulAdi || stateData.okulBilgisi.okulAdi || 'OKUL MÜDÜRLÜĞÜ').toUpperCase()}</div>
                        <div class="print-doc-title">3-TEMA SEÇMELİ DERS DAĞILIM VE DENGE ANALİZİ</div>
                    </div>
                    <div class="print-meta-right">
                        <div><strong>Eğt. Sezonu:</strong> ${stateData.okulBilgisi.sezon || '2026-2027'}</div>
                        <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="print-header-divider"></div>
            </div>

            <div class="report-page-header no-print">
                <div class="report-page-title">${data.title}</div>
                <div class="report-page-subtitle">${data.schoolInfo.okulAdi || 'MEB Kurumu'} • TTKB 3 Ana Tema Seçim Analizi</div>
            </div>

            <div class="table-responsive-container">
                <table class="report-data-table">
                    <thead>
                        <tr>
                            <th>ŞUBE</th>
                            <th>TOPLAM SEÇMELİ</th>
                            <th>1. İNSAN, TOPLUM & BİLİM</th>
                            <th>2. DİN, AHLAK VE DEĞER</th>
                            <th>3. KÜLTÜR, SANAT & SPOR</th>
                            <th>SEÇMELİ MESLEK</th>
                            <th>3-TEMA DENGESİ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.themeSections.map(sec => `
                            <tr>
                                <td class="font-medium">${sec.sectionName}</td>
                                <td><strong>${sec.totalElectiveHours}s</strong></td>
                                <td>${sec.stats.BILIM.hours}s <span class="text-xs text-muted">(${sec.stats.BILIM.count} ders)</span></td>
                                <td>${sec.stats.DEGER.hours}s <span class="text-xs text-muted">(${sec.stats.DEGER.count} ders)</span></td>
                                <td>${sec.stats.SANAT.hours}s <span class="text-xs text-muted">(${sec.stats.SANAT.count} ders)</span></td>
                                <td>${sec.stats.VOC.hours}s <span class="text-xs text-muted">(${sec.stats.VOC.count} ders)</span></td>
                                <td>
                                    ${sec.isBalanced ? 
                                        '<span class="status-badge-lg status-tam">✅ 3-Tema Dengeli</span>' : 
                                        '<span class="status-badge-lg status-ihtiyac">⚠️ Tek Yönlü</span>'}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
        return html;
    }

    // =========================================================================
    // ⚖️ KVKK AYDINLATMA METNİ, GİZLİLİK VE VERİ GÜVENLİĞİ MERKEZİ MODALI
    // =========================================================================
    openKvkkModal(initialTab = "AYDINLATMA") {
        let activeTab = initialTab;

        const modalHtml = `
            <div class="modal-overlay active" id="kvkk-center-modal">
                <div class="modal-box kvkk-modal-box">
                    <!-- Üst Başlık -->
                    <div class="modal-header kvkk-modal-header">
                        <div class="kvkk-header-left">
                            <div class="kvkk-header-title">
                                <span>⚖️</span> KVKK Aydınlatma Metni ve Veri Güvenliği Merkezi
                            </div>
                            <div class="kvkk-header-subtitle">
                                6698 sayılı KVKK ve GDPR ilkeleri doğrultusunda: sistemde kişisel veri işlenmez
                            </div>
                        </div>
                        <div class="kvkk-header-actions no-print">
                            <button class="btn-kvkk-print" id="btn-kvkk-print" title="Yazdır / PDF Olarak Kaydet">
                                🖨️ Yazdır / PDF
                            </button>
                            <button class="modal-close-btn" id="btn-close-kvkk-modal" title="Pencereyi Kapat">✕</button>
                        </div>
                    </div>

                    <!-- Kategori Sekmeleri -->
                    <div class="kvkk-nav-tabs no-print">
                        <button class="kvkk-tab-btn ${activeTab === 'AYDINLATMA' ? 'active' : ''}" data-tab="AYDINLATMA">
                            📜 1. Aydınlatma Metni
                        </button>
                        <button class="kvkk-tab-btn ${activeTab === 'MIMARI' ? 'active' : ''}" data-tab="MIMARI">
                            🔒 2. Sıfır Bilgi & Yerel Mimari
                        </button>
                        <button class="kvkk-tab-btn ${activeTab === 'CEREZ' ? 'active' : ''}" data-tab="CEREZ">
                            🍪 3. Çerez & LocalStorage
                        </button>
                        <button class="kvkk-tab-btn ${activeTab === 'HAKLAR' ? 'active' : ''}" data-tab="HAKLAR">
                            ⚖️ 4. KVKK m.11 & Unutulma Hakkı
                        </button>
                        <button class="kvkk-tab-btn ${activeTab === 'DISCLAIMER' ? 'active' : ''}" data-tab="DISCLAIMER">
                            🛡️ 5. Yasal Sorumluluk Reddi
                        </button>
                    </div>

                    <!-- Modal Gövdesi (İçerik) -->
                    <div class="modal-body kvkk-modal-body" id="kvkk-content-container">
                        <!-- Dinamik İçerik -->
                    </div>

                    <!-- Modal Altı (Hızlı Eylemler & Onay) -->
                    <div class="modal-footer kvkk-modal-footer no-print">
                        <div class="kvkk-footer-notice">
                            <span>🛡️ Bu uygulama verilerinizi hiçbir sunucuya iletmez; verileriniz cihazınızda kalır.</span>
                        </div>
                        <div class="kvkk-footer-btns">
                            <button class="btn btn-outline" id="btn-copy-kvkk" title="Metni Panoya Kopyala">📋 Metni Kopyala</button>
                            <button class="btn btn-primary" id="btn-ok-kvkk">Anladım ve Kabul Ediyorum ✓</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        const renderTabContent = () => {
            const container = document.getElementById("kvkk-content-container");
            if (!container) return;

            let tabHtml = "";

            if (activeTab === "AYDINLATMA") {
                tabHtml = `
                    <div class="kvkk-article">
                        <div class="kvkk-badge-headline">
                            <span class="kvkk-law-badge">6698 SAYILI KANUN m. 10</span>
                            <span class="kvkk-date-badge">Son Güncelleme: 19 Ağustos 2026</span>
                        </div>
                        <h3 class="kvkk-sec-title">MEB NORM KADRO VE DERS YÜKÜ YÖNETİM SİSTEMİ<br>KİŞİSEL VERİLERİN KORUNMASI VE BULUT GÜVENLİĞİ AYDINLATMA METNİ</h3>
                        
                        <div class="kvkk-alert-card info">
                            <div class="kvkk-alert-icon">🛡️</div>
                            <div class="kvkk-alert-text">
                                <strong>Özet Taahhüt:</strong> İşbu yazılım, <strong>"Privacy by Design (Tasarım İtibarıyla Gizlilik)"</strong> ve <strong>"Zero-Personal Data (Sıfır Kişisel Veri)"</strong> prensibiyle çalışır. Sistemde öğrenci veya öğretmenlere ait hiçbir T.C. Kimlik No, isim, soyisim, sicil no veya iletişim bilgisi <strong>KESİNLİKLE İŞLENMEZ VE DEPOLANMAZ.</strong>
                            </div>
                        </div>

                        <h4 class="kvkk-sub-heading">1. Veri Sorumlusu ve Sistem Mimarı</h4>
                        <p class="kvkk-p">
                            6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, <strong>NormMatik™</strong> yazılımı kapsamında işlenen teknik ve kurumsal veriler bakımından veri sorumlusu, yazılımın geliştiricisidir. NormMatik bağımsız bir yazılımdır; Millî Eğitim Bakanlığı ile resmî bir bağı bulunmamaktadır.
                        </p>

                        <h4 class="kvkk-sub-heading">2. İşlenen Veri Kategorileri ve Kesin Sınırları</h4>
                        <p class="kvkk-p">Uygulama aracılığıyla yalnızca Millî Eğitim Bakanlığı mevzuatına uygun norm kadro ve ders yükü planlamasını gerçekleştirmek üzere aşağıdaki <strong>münhasıran kurumsal/teknik veriler</strong> işlenmektedir:</p>
                        <ul class="kvkk-list">
                            <li><strong>Kurumsal Tanıtım Bilgileri:</strong> MEB Kurum Kodu, Resmî Okul Adı, Okul Türü (Anadolu Lisesi, Fen Lisesi, MTAL vb.), İl ve İlçe bilgisi, Eğitim-Öğretim Sezon Yılı.</li>
                            <li><strong>Şube ve Sayısal Dağılım Verileri:</strong> Şube kodları (9-A, 10-B vb.), sınıf seviyeleri, şubedeki toplam öğrenci sayıları, mesleki alan ve dal adları.</li>
                            <li><strong>Ders Yükü ve Branş Norm Dağılımı:</strong> Şubelerin haftalık ders saatleri, TTKB çizelge dersleri, branşlar bazında kadrolu öğretmen sayıları ve 12. sınıf işletmelerde koordinatörlük saatleri.</li>
                            <li><strong>ÖZEL GÜVENCE (İŞLENMEYEN VERİLER):</strong> Öğrenci T.C. Kimlik Numaraları, Öğrenci İsim/Soyisimleri, Öğretmen Kimlik/Sicil Bilgileri, İletişim Bilgileri veya Özel Nitelikli Kişisel Veriler (Din, Sağlık vb.) sisteme KESİNLİKLE ALINMAZ, İŞLENMEZ VE DEPOLANMAZ.</li>
                        </ul>

                        <h4 class="kvkk-sub-heading">3. Google Cloud Bulut Yedekleme ve Sıfır Veri Kaybı Mimarisi</h4>
                        <p class="kvkk-p">
                            Kullanıcıların (Okul Yöneticileri) tarayıcı temizliği, bilgisayar arızası, cihaz değişimi veya formatlama gibi durumlarda emek ve veri kaybı yaşamalarını önlemek amacıyla; kurumsal çalışma verileri (okul adı, şubeler ve ders dağıtımı), <strong>Google Cloud (Firebase Enterprise Realtime Cloud Cluster)</strong> şifreli altyapısında ilgili kurum kodu (<code>/schools/{kurumKodu}.json</code>) altında teknik yedekleme olarak barındırılır.
                        </p>
                        <ul class="kvkk-list">
                            <li><strong>Şifreleme:</strong> Tüm veri trafiği 256-Bit SSL/TLS (HTTPS) kriptografik güvenlik protokolü ile korunur.</li>
                            <li><strong>Ticari Gizlilik:</strong> Veriler hiçbir şekilde üçüncü şahıslara, reklam ağlarına veya veri simsarlarına aktarılmaz, ticari amaçla satılamaz veya profilleme yapılamaz.</li>
                        </ul>

                        <h4 class="kvkk-sub-heading">4. Veri İşlemenin Hukuki Sebebi</h4>
                        <p class="kvkk-p">
                            Söz konusu veriler, 6698 sayılı KVKK m. 5/2-c (Sözleşmenin ifası ve lisans hizmetinin tesisi) ile KVKK m. 5/2-f (İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması) hukuki sebeplerine dayalı olarak işlenmektedir.
                        </p>
                    </div>
                `;
            } else if (activeTab === "MIMARI") {
                tabHtml = `
                    <div class="kvkk-article">
                        <div class="kvkk-badge-headline">
                            <span class="kvkk-law-badge">ÇİFT KATMANLI HİBRİT GÜVENLİK</span>
                        </div>
                        <h3 class="kvkk-sec-title">🔒 YEREL İŞLEMCİ VE GOOGLE CLOUD FELAKET KURTARMA MİMARİSİ</h3>

                        <div class="kvkk-architecture-diagram">
                            <div class="arch-box local">
                                <span class="arch-icon">💻</span>
                                <strong>Kullanıcı Cihazı (Yerel Tarayıcı)</strong>
                                <p>Tüm hesaplamalar, şube optimizasyonları ve çizelge çıktıları cihazınızın RAM ve LocalStorage alanında anlık üretilir.</p>
                                <span class="arch-status ok">✅ 0.1 sn Hızlı & Yerel</span>
                            </div>
                            <div class="arch-arrow">
                                <span class="arch-arrow-icon">🔄</span>
                                <span class="arch-arrow-label">256-Bit SSL Şifreli Yedekleme</span>
                            </div>
                            <div class="arch-box cloud">
                                <span class="arch-icon">☁️</span>
                                <strong>Google Cloud Güvenli Depo</strong>
                                <p>Cihaz arızası veya çerez temizliğinde okulu kurtarmak üzere sadece kurum kodu bazlı şifreli proje yedeği tutulur.</p>
                                <span class="arch-status secure">🛡️ Sıfır Veri Kaybı Güvencesi</span>
                            </div>
                        </div>

                        <h4 class="kvkk-sub-heading">Teknik ve İdari Güvenlik Tedbirleri (KVKK m. 12)</h4>
                        <ul class="kvkk-list">
                            <li><strong>Kör Üzerine Yazma (Blind Overwrite) Koruması:</strong> Tarayıcı çerezleri silinse dahi, sistem boş bir ekranla buluttaki zengin yedeği asla ezmez; aksine buluttaki okulu anında geri çağırarak kurtarır.</li>
                            <li><strong>İzolasyon:</strong> Her okulun verisi sadece kendi Kurum Kodu altında izole edilir; bir okulun diğerinin verisine erişmesi teknik olarak imkansızdır.</li>
                            <li><strong>Tam Çevrimdışı Çalışabilirlik:</strong> İnternet bağlantısı kopsa dahi uygulama kesintisiz çalışır; bağlantı sağlandığında bulut otomatik senkronize olur.</li>
                        </ul>
                    </div>
                `;
            } else if (activeTab === "CEREZ") {
                tabHtml = `
                    <div class="kvkk-article">
                        <div class="kvkk-badge-headline">
                            <span class="kvkk-law-badge">ÇEREZ & TEKNİK SAKLAMA POLİTİKASI</span>
                        </div>
                        <h3 class="kvkk-sec-title">🍪 ÇEREZLER VE YEREL VERİ DEPOLAMA ŞEFFAFLIĞI</h3>

                        <p class="kvkk-p">
                            Uygulamamızda kullanıcıları takip eden, pazarlama yapan veya reklam hedefleyen <strong>üçüncü taraf takip çerezleri (Tracking Cookies) KESİNLİKLE KULLANILMAMAKTADIR.</strong>
                        </p>

                        <h4 class="kvkk-sub-heading">Kullanılan Teknik ve Zorunlu Depolama Bileşenleri</h4>
                        <div class="kvkk-table-responsive">
                            <table class="kvkk-table">
                                <thead>
                                    <tr>
                                        <th>Depolama Katmanı</th>
                                        <th>Kullanım Amacı</th>
                                        <th>Konum</th>
                                        <th>Güvenlik</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>MEB_NORM_KADRO_STATE_V1</code></td>
                                        <td>Okul, şube ve ders dağıtım verilerinin yerel oturumda anlık hatırlanması.</td>
                                        <td>Tarayıcı LocalStorage</td>
                                        <td>Kullanıcıya Özel Yerel Depo</td>
                                    </tr>
                                    <tr>
                                        <td><code>MEB_NORM_KADRO_LAYOUT_V1</code></td>
                                        <td>Panel genişlikleri ve arayüz yerleşim tercihlerinin korunması.</td>
                                        <td>Tarayıcı LocalStorage</td>
                                        <td>Kullanıcıya Özel Yerel Depo</td>
                                    </tr>
                                    <tr>
                                        <td><code>Google Cloud /schools/{kurumKodu}</code></td>
                                        <td>Bilgisayar formatı veya çerez temizliğinde projeyi tek tıkla kurtarma.</td>
                                        <td>Google Cloud Firebase (Şifreli)</td>
                                        <td>256-Bit SSL/TLS + Kurum İzolasyonu</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else if (activeTab === "HAKLAR") {
                tabHtml = `
                    <div class="kvkk-article">
                        <div class="kvkk-badge-headline">
                            <span class="kvkk-law-badge">KVKK m. 11 VE GDPR m. 17</span>
                        </div>
                        <h3 class="kvkk-sec-title">⚖️ İLGİLİ KİŞİNİN HAKLARI VE VERİLERİ SİLME (UNUTULMA HAKKI)</h3>

                        <p class="kvkk-p">6698 sayılı Kanun’un 11. maddesi uyarınca veri sahipleri aşağıdaki haklara sahiptir:</p>
                        
                        <div class="kvkk-rights-grid">
                            <div class="kvkk-right-card">
                                <div class="right-icon">🔍</div>
                                <div class="right-title">Bilgi Edinme ve İnceleme</div>
                                <div class="right-desc">Verilerinin nasıl işlendiğini ve hesaplama kurallarını şeffafça inceleme hakkı.</div>
                            </div>
                            <div class="kvkk-right-card">
                                <div class="right-icon">🗑️</div>
                                <div class="right-title">Anında ve Kalıcı Silme (Unutulma)</div>
                                <div class="right-desc">Üst menüdeki "🔄 Sıfırla" butonuyla tüm yerel verilerini tek tıkla geri döndürülemez biçimde silme hakkı.</div>
                            </div>
                            <div class="kvkk-right-card">
                                <div class="right-icon">📦</div>
                                <div class="right-title">Veri Taşınabilirliği</div>
                                <div class="right-desc">Tüm çalışma verilerini standart JSON veya Excel (CSV) olarak kendi cihazına dışa aktarma hakkı.</div>
                            </div>
                            <div class="kvkk-right-card">
                                <div class="right-icon">🚫</div>
                                <div class="right-title">Otomatik Profilleme İtirazı</div>
                                <div class="right-desc">Kullanıcı aleyhine hiçbir otomatik profilleme, skorlama veya pazarlama işlemi yürütülmez.</div>
                            </div>
                        </div>

                        <div class="kvkk-alert-card warning" style="margin-top: 1.25rem;">
                            <div class="kvkk-alert-icon">⚠️</div>
                            <div class="kvkk-alert-text">
                                <strong>Verileri Kalıcı Olarak Silmek İçin:</strong> Üst araç çubuğunda bulunan kırmızı <strong>"🔄 Sıfırla"</strong> butonuna tıklayarak açılan onay penceresinden tüm yerel çalışma verilerinizi anında silebilirsiniz.
                            </div>
                        </div>
                    </div>
                `;
            } else if (activeTab === "DISCLAIMER") {
                tabHtml = `
                    <div class="kvkk-article">
                        <div class="kvkk-badge-headline">
                            <span class="kvkk-law-badge">RESMİ MEB ÇEKİNCESİ</span>
                        </div>
                        <h3 class="kvkk-sec-title">🛡️ YASAL BİLGİLENDİRME VE SORUMLULUK ÇEKİNCESİ (DISCLAIMER)</h3>

                        <div class="kvkk-alert-card danger">
                            <div class="kvkk-alert-icon">⚖️</div>
                            <div class="kvkk-alert-text">
                                <strong>RESMÎ VE HUKUKİ HATIRLATMA:</strong> İşbu yazılım; Millî Eğitim Bakanlığı Norm Kadro Yönetmeliği, Talim ve Terbiye Kurulu Başkanlığı Kararları ve MEB Ders Yükü Esasları temel alınarak eğitim kurumlarına <strong>simülasyon, planlama ve karar destek rehberliği</strong> sunmak amacıyla bağımsız olarak geliştirilmiştir.
                            </div>
                        </div>

                        <h4 class="kvkk-sub-heading">Yasal Sorumluluk Sınırları</h4>
                        <ul class="kvkk-list">
                            <li><strong>Yetkili Merci Beyanı:</strong> Resmî norm kadro belirleme, öğretmen atama, norm fazlası tespiti ve idareci norm onaylama yetkisi münhasıran <strong>T.C. Millî Eğitim Bakanlığı, Valilikler ve İl/İlçe Millî Eğitim Müdürlüklerine</strong> aittir.</li>
                            <li><strong>Resmi Sistemlerin Üstünlüğü:</strong> Resmî iş, işlem, itiraz ve yazışmalarda Bakanlığın <strong>MEBBİS (Millî Eğitim Bakanlığı Bilişim Sistemleri)</strong> modülü verileri esastır.</li>
                            <li><strong>Telif ve Fikri Mülkiyet:</strong> Uygulamanın kaynak kodları, algoritma mimarisi, kural motoru ve görsel arayüz tasarımları 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile 6769 sayılı Sınai Mülkiyet Kanunu kapsamında korunmaktadır. İzinsiz kopyalanamaz veya ticari olarak çoğaltılamaz.</li>
                        </ul>
                    </div>
                `;
            }

            container.innerHTML = tabHtml;
            container.scrollTop = 0;
        };

        // Sekme Dinleyicileri
        document.querySelectorAll(".kvkk-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const t = btn.getAttribute("data-tab");
                if (t && t !== activeTab) {
                    activeTab = t;
                    document.querySelectorAll(".kvkk-tab-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    renderTabContent();
                }
            });
        });

        // Kapatma
        document.getElementById("btn-close-kvkk-modal")?.addEventListener("click", () => this.closeModal("kvkk-center-modal"));
        document.getElementById("btn-ok-kvkk")?.addEventListener("click", () => this.closeModal("kvkk-center-modal"));

        // Yazdırma
        document.getElementById("btn-kvkk-print")?.addEventListener("click", () => {
            window.print();
        });

        // Metni Kopyalama
        document.getElementById("btn-copy-kvkk")?.addEventListener("click", () => {
            const container = document.getElementById("kvkk-content-container");
            if (container) {
                navigator.clipboard.writeText(container.innerText).then(() => {
                    this.showToast("KVKK metni panoya kopyalandı!", "success");
                }).catch(() => {
                    this.showToast("Metin kopyalandı.", "info");
                });
            }
        });

        // İlk render
        renderTabContent();
    }

    // =========================================================================
    // 📥 e-OKUL EXCEL AKILLI ŞUBE VE ÖĞRENCİ İÇE AKTARMA SİHİRBAZI (v1.0)
    // =========================================================================
    openEOkulImportModal() {
        const types = this.db.getSchoolTypes();
        const currentType = this.state.state.okulBilgisi.okulTuru || "mesleki_ve_teknik_anadolu_lisesi";
        const isLocked = this.state.state.okulBilgisi.okulTuruKilitli;

        const schoolTypeOptions = types.map(t => `
            <option value="${t.id}" ${currentType === t.id ? 'selected' : ''}>
                ${t.name} (${t.category})
            </option>
        `).join("");

        const modalHtml = `
            <div class="modal-overlay active" id="eokul-import-modal">
                <div class="modal-box eokul-modal-box" style="max-width: 920px; width: 95vw;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #fff; padding: 1.1rem 1.5rem; border-radius: 12px 12px 0 0;">
                        <div>
                            <div class="modal-title" style="color: #fff; font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                                📥 e-Okul'dan Otomatik Şube & Öğrenci İçe Aktarma Sihirbazı
                            </div>
                            <div style="font-size: 0.8rem; color: #bfdbfe; margin-top: 0.25rem;">
                                e-Okul Sınıf Şube Öğrenci Sayıları (.xls / .xlsx) dosyasını yükleyerek tüm okulu 2 saniyede kurun.
                            </div>
                        </div>
                        <button class="modal-close-btn" id="btn-close-eokul-modal" style="color: #fff; font-size: 1.5rem; cursor: pointer; background: none; border: none;">&times;</button>
                    </div>

                    <div class="modal-body" style="padding: 1.25rem; max-height: 72vh; overflow-y: auto;">
                        
                        <!-- 1. ADIM: SÜRÜKLE BIRAK YÜKLEME ALANI -->
                        <div id="eokul-upload-section">
                            <div class="eokul-dropzone" id="eokul-dropzone">
                                <div class="eokul-dropzone-icon">📊</div>
                                <div class="eokul-dropzone-title">e-Okul Excel Dosyasını Buraya Sürükleyin</div>
                                <div class="eokul-dropzone-sub">veya bilgisayarınızdan seçmek için tıklayın (.XLS, .XLSX)</div>
                                <input type="file" id="eokul-file-input" accept=".xls,.xlsx,.csv" style="display: none;">
                            </div>

                            <div class="eokul-guide-card" style="margin-top: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem 1.2rem; font-size: 0.84rem; color: #334155; line-height: 1.6;">
                                <div style="font-weight: 800; color: #1e3a8a; font-size: 0.92rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                                    💡 e-Okul'dan Bu Belgeler Nasıl İndirilir? (Desteklenen 2 Rapor)
                                </div>
                                <div style="margin-bottom: 0.35rem;"><strong>Adım 1:</strong> e-Okul Yönetim Bilgi Sistemi ➔ <strong>Ortaöğretim / İlköğretim Öğrenci İşlemleri</strong> modülüne girin.</div>
                                <div style="margin-bottom: 0.35rem;"><strong>Adım 2:</strong> Üst menüdeki <strong>Yazıcı (Raporlar)</strong> simgesine tıklayın.</div>
                                <div style="margin-bottom: 0.5rem;"><strong>Adım 3:</strong> Aşağıdaki 2 rapordan okulunuza uygun olanı seçip <strong>Excel (.XLS / .XLSX)</strong> olarak indirin ve buraya yükleyin:</div>
                                
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75rem; margin: 0.6rem 0;">
                                    <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 0.75rem 0.9rem;">
                                        <div style="font-weight: 800; color: #1d4ed8; font-size: 0.84rem; margin-bottom: 0.25rem;">
                                            🥇 OOG01001R076 — Şube Listesi (Dal Bilgili)
                                        </div>
                                        <div style="font-size: 0.77rem; color: #1e40af;">
                                            <strong>Önerilen (MTAL / ÇPAL / Tüm Okullar):</strong> 11 ve 12. sınıfların uzmanlık <em>dal bilgilerini</em> de otomatik aktarır ve dal müfredatlarını doğrudan bağlar.
                                        </div>
                                    </div>
                                    <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 8px; padding: 0.75rem 0.9rem;">
                                        <div style="font-weight: 800; color: #15803d; font-size: 0.84rem; margin-bottom: 0.25rem;">
                                            🥈 OOG01001R010 — Sınıf Şube Öğrenci Sayıları
                                        </div>
                                        <div style="font-size: 0.77rem; color: #166534;">
                                            <strong>Genel / Standart İcmal (OGM, DÖGM, Temel Eğitim):</strong> Sınıf seviyesi, şubeler, alanlar ve kız/erkek öğrenci sayılarını içeren standart özet tablodur.
                                        </div>
                                    </div>
                                </div>

                                <div style="margin-top: 0.5rem; color: #059669; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem;">
                                    <span>✨</span> <span>Sistem her iki formatı da otomatik algılar; sıfır (0) mevcutlu şubeleri eler ve özel eğitim sınıflarını doğrudan tanır.</span>
                                </div>
                            </div>
                        </div>

                        <!-- 2. ADIM: AYRIŞTIRMA ÖNİZLEME ALANI (DOSYA SEÇİLİNCE GÖRÜNÜR) -->
                        <div id="eokul-preview-section" style="display: none;">
                            
                            <!-- KPI Özet Rozetleri -->
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
                                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 0.75rem; text-align: center;">
                                    <div style="font-size: 0.75rem; color: #065f46; font-weight: 600;">✅ AKTİF ŞUBE SAYISI</div>
                                    <div id="kpi-active-sections" style="font-size: 1.4rem; font-weight: 800; color: #059669; margin-top: 0.2rem;">0</div>
                                </div>
                                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 0.75rem; text-align: center;">
                                    <div style="font-size: 0.75rem; color: #1e40af; font-weight: 600;">👥 TOPLAM ÖĞRENCİ</div>
                                    <div id="kpi-total-students" style="font-size: 1.4rem; font-weight: 800; color: #2563eb; margin-top: 0.2rem;">0</div>
                                </div>
                                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 0.75rem; text-align: center;">
                                    <div style="font-size: 0.75rem; color: #92400e; font-weight: 600;">🚫 ELENEN BOŞ ŞUBELER (0 MEVCUT)</div>
                                    <div id="kpi-skipped-zeros" style="font-size: 1.4rem; font-weight: 800; color: #d97706; margin-top: 0.2rem;">0</div>
                                </div>
                            </div>

                            <!-- Ayarlar Barı -->
                            <div style="background: #f1f5f9; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <label style="font-weight: 600; color: #0f172a;">Kurulum Modu:</label>
                                    <label style="display: flex; align-items: center; gap: 0.3rem; cursor: pointer;">
                                        <input type="radio" name="eokul-import-mode" value="clear" checked> Mevcut Okulu Sıfırla & Sıfırdan Kur
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.3rem; cursor: pointer;">
                                        <input type="radio" name="eokul-import-mode" value="append"> Mevcut Şubelerin Üzerine Ekle
                                    </label>
                                </div>

                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <label style="font-weight: 600; color: #0f172a;">Okul Türü:</label>
                                    <select id="eokul-school-type" class="form-control" style="font-size: 0.8rem; padding: 0.3rem 0.5rem; max-width: 250px;" ${isLocked ? 'disabled' : ''}>
                                        ${schoolTypeOptions}
                                    </select>
                                </div>
                            </div>

                            <!-- Önizleme Tablosu -->
                            <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; max-height: 360px; overflow-y: auto;">
                                <table class="matrix-table" style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                                    <thead>
                                        <tr style="background: #f8fafc; color: #334155; position: sticky; top: 0; z-index: 10; border-bottom: 2px solid #cbd5e1;">
                                            <th style="padding: 0.6rem; text-align: left; width: 35px;">#</th>
                                            <th style="padding: 0.6rem; text-align: center; width: 65px;">Sınıf</th>
                                            <th style="padding: 0.6rem; text-align: left; min-width: 130px;">Şube Adı</th>
                                            <th style="padding: 0.6rem; text-align: center; width: 120px;">Mevcut</th>
                                            <th style="padding: 0.6rem; text-align: left; min-width: 170px;">Tespit Edilen Alan</th>
                                            <th style="padding: 0.6rem; text-align: left; min-width: 170px;">Tespit Edilen Dal</th>
                                            <th style="padding: 0.6rem; text-align: center; width: 50px;">Sil</th>
                                        </tr>
                                    </thead>
                                    <tbody id="eokul-preview-tbody">
                                        <!-- Dinamik satırlar JS ile basılır -->
                                    </tbody>
                                </table>
                            </div>

                        </div>

                    </div>

                    <div class="modal-footer" style="padding: 0.85rem 1.25rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #fafafa; border-radius: 0 0 12px 12px;">
                        <button class="btn btn-secondary" id="btn-reset-eokul" style="display: none;">🔄 Farklı Dosya Seç</button>
                        <div style="display: flex; gap: 0.5rem; margin-left: auto;">
                            <button class="btn btn-outline" id="btn-cancel-eokul">Vazgeç</button>
                            <button class="btn btn-primary" id="btn-apply-eokul" style="display: none; background: #2563eb; color: #fff; font-weight: 600;">
                                🚀 Şubeleri Otomatik Kur ve Müfredatı Doldur
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        const dropzone = document.getElementById("eokul-dropzone");
        const fileInput = document.getElementById("eokul-file-input");
        const uploadSection = document.getElementById("eokul-upload-section");
        const previewSection = document.getElementById("eokul-preview-section");
        const tbody = document.getElementById("eokul-preview-tbody");
        const btnReset = document.getElementById("btn-reset-eokul");
        const btnApply = document.getElementById("btn-apply-eokul");

        let parsedData = null;

        // Dosya Yükleme Olayları
        dropzone.addEventListener("click", () => fileInput.click());
        
        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("dragover");
        });

        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("dragover");
        });

        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("dragover");
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        const handleFile = (file) => {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const buffer = evt.target.result;
                    const importer = new EOkulImporter(this.db, this.curriculum);
                    parsedData = importer.parseExcelData(buffer);

                    if (!parsedData.sections || parsedData.sections.length === 0) {
                        this.showToast("Bu Excel dosyasında 0'dan büyük mevcudu olan aktif şube bulunamadı.", "warning");
                        return;
                    }

                    renderPreview(parsedData, importer);
                } catch (err) {
                    console.error("e-Okul ayrıştırma hatası:", err);
                    this.showToast("Dosya okunamadı: " + (err.message || "Geçersiz e-Okul formatı."), "danger");
                }
            };
            reader.readAsArrayBuffer(file);
        };

        const renderPreview = (data, importer) => {
            uploadSection.style.display = "none";
            previewSection.style.display = "block";
            btnReset.style.display = "inline-block";
            btnApply.style.display = "inline-block";

            document.getElementById("kpi-active-sections").innerText = data.schoolSummary.totalActiveSections;
            document.getElementById("kpi-total-students").innerText = data.schoolSummary.totalStudents;
            document.getElementById("kpi-skipped-zeros").innerText = data.schoolSummary.skippedZeroCount;

            btnApply.innerHTML = `🚀 <strong>${data.schoolSummary.totalActiveSections} Şubeyi</strong> Otomatik Kur ve Müfredatı Doldur`;

            // Tablo Satırları
            tbody.innerHTML = data.sections.map((sec, idx) => {
                const areaOptions = importer.KNOWN_AREAS.map(a => `
                    <option value="${a.id}" ${sec.matchedAreaId === a.id ? 'selected' : ''}>
                        ${a.name}
                    </option>
                `).join("");

                return `
                    <tr id="row-sec-${idx}" style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 0.45rem; color: #64748b;">${idx + 1}</td>
                        <td style="padding: 0.45rem; text-align: center;">
                            <span class="badge" style="background: #e2e8f0; color: #1e293b; font-weight: 700;">${sec.grade}. Sınıf</span>
                        </td>
                        <td style="padding: 0.45rem;">
                            <input type="text" class="form-control sec-name-input" data-idx="${idx}" value="${sec.subeAdi}" style="font-size: 0.8rem; padding: 0.25rem 0.4rem; font-weight: 600;">
                        </td>
                        <td style="padding: 0.45rem; text-align: center; font-weight: 600;">
                            <input type="number" class="form-control sec-count-input" data-idx="${idx}" value="${sec.studentCount}" min="1" max="60" style="width: 50px; display: inline-block; font-size: 0.8rem; padding: 0.2rem; text-align: center;">
                            <span style="font-size: 0.7rem; color: #64748b; margin-left: 2px;">(${sec.boysCount}E/${sec.girlsCount}K)</span>
                        </td>
                        <td style="padding: 0.45rem;">
                            <select class="form-control sec-area-select" data-idx="${idx}" style="font-size: 0.75rem; padding: 0.25rem 0.4rem;">
                                <option value="">— Alan Yok (Genel) —</option>
                                ${areaOptions}
                            </select>
                        </td>
                        <td style="padding: 0.45rem;">
                            <input type="text" class="form-control sec-dal-input" data-idx="${idx}" value="${sec.dalAdi || ''}" placeholder="Dal Yok / Ortak" style="font-size: 0.75rem; padding: 0.25rem 0.4rem;">
                        </td>
                        <td style="padding: 0.45rem; text-align: center;">
                            <button class="btn btn-icon btn-sm btn-delete-row" data-idx="${idx}" style="color: #ef4444;" title="Bu Şubeyi Hariç Tut">🗑️</button>
                        </td>
                    </tr>
                `;
            }).join("");

            // Satır Silme Butonları
            document.querySelectorAll(".btn-delete-row").forEach(btn => {
                btn.addEventListener("click", () => {
                    const idx = parseInt(btn.getAttribute("data-idx"), 10);
                    data.sections.splice(idx, 1);
                    data.schoolSummary.totalActiveSections = data.sections.length;
                    data.schoolSummary.totalStudents = data.sections.reduce((sum, s) => sum + s.studentCount, 0);
                    renderPreview(data, importer);
                });
            });
        };

        // Sıfırlama / Farklı Dosya Seçme
        btnReset.addEventListener("click", () => {
            fileInput.value = "";
            parsedData = null;
            uploadSection.style.display = "block";
            previewSection.style.display = "none";
            btnReset.style.display = "none";
            btnApply.style.display = "none";
        });

        // Kapatma / Vazgeç
        document.getElementById("btn-close-eokul-modal")?.addEventListener("click", () => this.closeModal("eokul-import-modal"));
        document.getElementById("btn-cancel-eokul")?.addEventListener("click", () => this.closeModal("eokul-import-modal"));

        // ŞUBELERİ OLUŞTUR VE MÜFREDATI DOLDUR BUTONU
        btnApply.addEventListener("click", () => {
            if (!parsedData || !parsedData.sections || parsedData.sections.length === 0) {
                this.showToast("Aktarılacak şube bulunamadı.", "warning");
                return;
            }

            // Tablodaki olası güncellemeleri oku
            document.querySelectorAll(".sec-name-input").forEach(inp => {
                const idx = parseInt(inp.getAttribute("data-idx"), 10);
                if (parsedData.sections[idx]) parsedData.sections[idx].subeAdi = inp.value.trim();
            });

            document.querySelectorAll(".sec-count-input").forEach(inp => {
                const idx = parseInt(inp.getAttribute("data-idx"), 10);
                if (parsedData.sections[idx]) parsedData.sections[idx].studentCount = parseInt(inp.value, 10) || 30;
            });

            const importer = new EOkulImporter(this.db, this.curriculum);

            document.querySelectorAll(".sec-area-select").forEach(sel => {
                const idx = parseInt(sel.getAttribute("data-idx"), 10);
                if (parsedData.sections[idx]) {
                    parsedData.sections[idx].matchedAreaId = sel.value || null;
                    const areaObj = importer.KNOWN_AREAS.find(a => a.id === sel.value);
                    parsedData.sections[idx].matchedAreaName = areaObj ? areaObj.name : null;
                }
            });

            document.querySelectorAll(".sec-dal-input").forEach(inp => {
                const idx = parseInt(inp.getAttribute("data-idx"), 10);
                if (parsedData.sections[idx]) {
                    parsedData.sections[idx].dalAdi = inp.value.trim() || null;
                }
            });

            const modeRadio = document.querySelector('input[name="eokul-import-mode"]:checked');
            const clearExisting = modeRadio ? modeRadio.value === "clear" : true;
            const selectedSchoolType = document.getElementById("eokul-school-type")?.value || currentType;

            // Okul Türünü Kilitle
            if (!this.state.state.okulBilgisi.okulTuruKilitli) {
                this.state.setSchoolType(selectedSchoolType);
            }

            importer.applySectionsToState(this.state, parsedData.sections, selectedSchoolType, clearExisting);

            this.closeModal("eokul-import-modal");
            this.showToast(`🎉 ${parsedData.sections.length} Şube ve ${parsedData.schoolSummary.totalStudents} Öğrenci e-Okul'dan Başarıyla Kuruldu!`, "success");

            const warnings = (this.state.state.subeler || []).filter(s => s.eOkulWarning).map(s => s.eOkulWarning);
            if (warnings.length > 0) {
                setTimeout(() => {
                    this.showToast(warnings[0], "warning", 8000);
                }, 1200);
            }

            // Global UI yeniden hesaplama
            if (typeof window !== 'undefined' && window.app && typeof window.app.renderAll === 'function') {
                window.app.renderAll();
            }
        });
    }


    // --- LİSANS DOĞRULAMA VE AKTİVASYON MERKEZİ MODALI ---
    openLicenseModal() {
        const lic = (typeof window !== 'undefined' && window.licenseManager) ? window.licenseManager.licenseStatus : { isDemo: true, daysRemaining: 7, maxSections: 3 };
        const okulInfo = this.state.state.okulBilgisi || {};
        const types = this.db.getSchoolTypes();
        const currentType = okulInfo.okulTuru || "";

        // Okul türü seçenekleri
        const grouped = {};
        types.forEach(t => {
            const cat = t.category || "Diğer Okullar";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(t);
        });

        let typeOptionsHtml = `<option value="" ${!currentType ? 'selected disabled' : ''}>-- Lütfen Okul / Kurum Türünü Seçiniz --</option>`;
        for (const [catName, catTypes] of Object.entries(grouped)) {
            typeOptionsHtml += `<optgroup label="📂 ${catName}">`;
            catTypes.forEach(t => {
                typeOptionsHtml += `<option value="${t.id}" ${currentType === t.id ? 'selected' : ''}>${t.name}</option>`;
            });
            typeOptionsHtml += `</optgroup>`;
        }
        
        let statusBadge = "";
        if (lic.isMaster) {
            statusBadge = `<span style="background: rgba(139, 92, 246, 0.2); border: 1.5px solid #a855f7; color: #c084fc; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 800; font-size: 0.82rem;">👑 Geliştirici Erişimi - Sınırsız</span>`;
        } else if (lic.isAnnual) {
            statusBadge = `<span style="background: rgba(16, 185, 129, 0.2); border: 1.5px solid #10b981; color: #10b981; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 800; font-size: 0.82rem;">🛡️ Yıllık Pro Lisans (${lic.daysRemaining} Gün Kaldı)</span>`;
        } else {
            statusBadge = `<span style="background: rgba(245, 158, 11, 0.2); border: 1.5px solid #f59e0b; color: #d97706; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 800; font-size: 0.82rem;">⏳ Ücretsiz Deneme Modu (Maks 3 Şube - Çıktılar Filigranlı)</span>`;
        }

        const modalHtml = `
            <div class="modal-overlay active" id="license-modal">
                <div class="modal-box" style="max-width: 680px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                    <div class="modal-header" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 1rem 1.3rem;">
                        <div class="modal-title" style="color: #fff; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 0.6rem;">
                            <span style="font-size: 1.35rem;">🔑</span>
                            <div>
                                <div>NormMatik™ Lisans & Güvenlik Merkezi</div>
                                <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">5846 Sayılı FSEK & TÜRKPATENT Korumalı Asimetrik Lisans Sistemi</div>
                            </div>
                        </div>
                        <button class="modal-close-btn" id="btn-close-license-modal" style="color: #fff;">✕</button>
                    </div>
                    <div class="modal-body" style="padding: 1.2rem 1.3rem; display: flex; flex-direction: column; gap: 1rem;">
                        
                        <!-- 1. LANSMAN FİYATI VE KAMPANYA KARTİ -->
                        <div style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); border: 1.5px solid #0284c7; border-radius: 12px; padding: 0.9rem 1.1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.6rem;">
                            <div>
                                <span style="background: #0284c7; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 4px; text-transform: uppercase;">2026-2027 Sezonu Lansman Kampanyası</span>
                                <div style="font-size: 1.25rem; font-weight: 900; color: var(--text-main); margin-top: 0.25rem;">
                                    490 ₺ <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted); text-decoration: line-through;">1.500 ₺</span> <span style="font-size: 0.8rem; font-weight: 700; color: #16a34a;">/ 1 Yıllık Okul Lisansı</span>
                                </div>
                                <div style="font-size: 0.73rem; color: var(--text-muted); margin-top: 0.1rem;">
                                    ✨ Sınırsız şube, 5 sekmeli Excel (.XLSX) çıktısı ve filigransız yazdırma.
                                </div>
                            </div>
                        </div>

                        <!-- 2. DOĞRUDAN DÜZENLENEBİLİR OKUL VE LİSANS BİLGİLERİ -->
                        <div style="background: var(--bg-card-subtle); border: 1.5px solid var(--border-main); border-radius: 12px; padding: 0.9rem 1rem;">
                            <div style="font-size: 0.82rem; font-weight: 800; color: var(--primary); margin-bottom: 0.65rem; display: flex; align-items: center; justify-content: space-between;">
                                <span>🏛️ Lisans Tanımlanacak Okul Bilgileri:</span>
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">(Doğrudan buradan güncelleyebilirsiniz)</span>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1.2fr 2fr; gap: 0.65rem; margin-bottom: 0.65rem;">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 0.72rem; font-weight: 700;">MEB Kurum Kodu *</label>
                                    <input type="text" id="lic-inp-kurum-kodu" class="form-control" value="${okulInfo.kurumKodu || ''}" placeholder="Örn: 754123" maxlength="10" style="font-size: 0.82rem; padding: 0.4rem 0.6rem;">
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 0.72rem; font-weight: 700;">Okul / Kurum Adı *</label>
                                    <input type="text" id="lic-inp-okul-adi" class="form-control" value="${okulInfo.okulAdi || ''}" placeholder="Örn: Kadıköy Anadolu Lisesi" style="font-size: 0.82rem; padding: 0.4rem 0.6rem;">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 0.72rem; font-weight: 700;">Okul Türü *</label>
                                    <select id="lic-inp-okul-turu" class="form-control" style="font-size: 0.82rem; padding: 0.4rem 0.6rem;">
                                        ${typeOptionsHtml}
                                    </select>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 0.72rem; font-weight: 700;">İl / İlçe (Opsiyonel)</label>
                                    <input type="text" id="lic-inp-il-ilce" class="form-control" value="${okulInfo.il ? (okulInfo.il + (okulInfo.ilce ? ' / ' + okulInfo.ilce : '')) : ''}" placeholder="Örn: İSTANBUL / KADIKÖY" style="font-size: 0.82rem; padding: 0.4rem 0.6rem;">
                                </div>
                            </div>

                            <div style="margin-top: 0.65rem; font-size: 0.72rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
                                <span>🔑 Giriş: MEB Kurum Kodu + şifreniz</span>
                                <span style="color: #0284c7; font-weight: 800;">🔒 Kuruma Özel Lisans</span>
                            </div>
                        </div>

                        <!-- 3. WHATSAPP İLE TEK TIKLA LİSANS SATIN ALMA BUTONU -->
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                            <button class="btn" id="btn-send-whatsapp-license" style="background: #16a34a; border: 1px solid #15803d; color: #fff; width: 100%; padding: 0.85rem; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.25); transition: all 0.2s;">
                                <span style="font-size: 1.25rem;">🟢</span> 📲 WhatsApp ile Hemen Lisans Al (+90 506 277 70 49)
                            </button>
                            <div style="font-size: 0.72rem; text-align: center; color: var(--text-muted);">
                                ⚡ Tıkladığınızda yukarıdaki okul bilgileriniz WhatsApp mesajı olarak hazırlanır; FAST/IBAN ile 1 dakikada lisansınız tanımlanır.
                            </div>
                        </div>

                        <!--
                            KALDIRILDI (2026-08-24): lisans anahtarı yapıştırma alanı,
                            ".lic dosyası yükle" düğmesi ve cihaz kimliği (HWID) satırı.

                            Artık lisans anahtarı diye bir şey yok. Ödeme alındığında
                            okulun aboneliği doğrudan tanımlanıyor; okul yalnızca
                            MEB kurum kodu ve şifresiyle giriyor. Cihaza kilit de
                            kalktı — okul istediği bilgisayardan girebiliyor.
                        -->
                        <div style="background: var(--bg-soft, #f1f5f9); border: 1px dashed var(--border-main); border-radius: 10px; padding: 0.75rem; font-size: 0.78rem; color: var(--text-muted); text-align: center;">
                            Lisansınız tanımlandıktan sonra <strong>çıkış yapıp yeniden giriş</strong> yapmanız yeterlidir.<br>
                            Anahtar girmenize, dosya yüklemenize gerek yoktur.
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHtml);

        // KALDIRILDI (2026-08-24): cihaz kimliği (HWID) hesaplama.
        // Lisans cihaza değil kuruma bağlandığı için gereksiz.

        // Okul Bilgileri Değiştikçe Canlı Kaydet ve Senkronize Et
        const syncSchoolInputs = () => {
            const kKodu = document.getElementById("lic-inp-kurum-kodu")?.value.trim() || "";
            const oAdi = document.getElementById("lic-inp-okul-adi")?.value.trim() || "";
            const oTuru = document.getElementById("lic-inp-okul-turu")?.value || "";
            const ilIlce = document.getElementById("lic-inp-il-ilce")?.value.trim() || "";

            let il = "";
            let ilce = "";
            if (ilIlce.includes("/")) {
                const parts = ilIlce.split("/");
                il = parts[0].trim();
                ilce = parts[1].trim();
            } else {
                il = ilIlce;
            }

            if (oAdi || kKodu) {
                this.state.updateSchoolInfo(oAdi, "2026-2027", kKodu, il, ilce);
            }
            if (oTuru && !this.state.state.okulBilgisi.okulTuruKilitli) {
                this.state.setSchoolType(oTuru);
            }
        };

        document.getElementById("lic-inp-kurum-kodu")?.addEventListener("input", syncSchoolInputs);
        document.getElementById("lic-inp-okul-adi")?.addEventListener("input", syncSchoolInputs);
        document.getElementById("lic-inp-il-ilce")?.addEventListener("input", syncSchoolInputs);
        document.getElementById("lic-inp-okul-turu")?.addEventListener("change", syncSchoolInputs);

        // WhatsApp ile Lisans Satın Alma Linki
        document.getElementById("btn-send-whatsapp-license")?.addEventListener("click", () => {
            const kKodu = document.getElementById("lic-inp-kurum-kodu")?.value.trim() || "";
            const oAdi = document.getElementById("lic-inp-okul-adi")?.value.trim() || "";
            const turSelect = document.getElementById("lic-inp-okul-turu");
            const oTuru = turSelect ? turSelect.value : "";

            if (!kKodu) {
                this.showToast("⚠️ Lütfen MEB Kurum Kodunuzu giriniz!", "warning");
                document.getElementById("lic-inp-kurum-kodu")?.focus();
                return;
            }
            if (!oAdi) {
                this.showToast("⚠️ Lütfen Okul Adınızı giriniz!", "warning");
                document.getElementById("lic-inp-okul-adi")?.focus();
                return;
            }
            if (!oTuru) {
                this.showToast("⚠️ Lütfen geçerli bir Okul / Kurum Türü seçiniz!", "warning");
                document.getElementById("lic-inp-okul-turu")?.focus();
                return;
            }

            syncSchoolInputs();

            const turAdi = turSelect ? turSelect.options[turSelect.selectedIndex].text : "";
            const ilIlce = document.getElementById("lic-inp-il-ilce")?.value.trim() || "Belirtilmedi";

            // Cihaz kodu (HWID) mesajdan ÇIKARILDI (2026-08-24): lisans artık
            // cihaza değil kuruma bağlı. Okul istediği bilgisayardan girebilir.
            const msg = `🏛️ NormMatik™ 1 YILLIK OKUL LİSANSI TALEBİ
* MEB Kurum Kodu: ${kKodu}
* Okul Adı: ${oAdi}
* İl / İlçe: ${ilIlce}
* Okul Türü: ${turAdi}

Merhaba, okulumuz için 1 yıllık NormMatik™ lisansı almak istiyorum. 490 ₺ lansman bedeli için FAST/IBAN bilgilerinizi iletebilir misiniz?`;

            const waUrl = `https://wa.me/905062777049?text=${encodeURIComponent(msg)}`;
            window.open(waUrl, "_blank");
        });

        // Kapatma
        document.getElementById("btn-close-license-modal")?.addEventListener("click", () => {
            this.closeModal("license-modal");
        });

        // KALDIRILDI (2026-08-24): "Lisansı Aktifleştir" ve ".lic dosyası
        // yükle" işleyicileri. Karşılık geldikleri alanlar da kaldırıldı.
        // Lisans artık bir anahtar değil, veritabanındaki abonelik kaydıdır;
        // giriş yapıldığında otomatik okunur.

    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIComponentManager };
}
if (typeof window !== 'undefined') {
    window.UIComponentManager = UIComponentManager;
}


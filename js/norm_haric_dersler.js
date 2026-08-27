/*
 * NORMA DAHİL EDİLMEYEN YAN DERSLER — ÜRETİLMİŞTİR, ELLE DÜZENLEMEYİN.
 * Üreteç: tools/uret_norm_haric_dersler.py
 * Kaynak: MEB Norm Kadroya Esas Dersler Çizelgesi (47 branş)
 *
 * Bu tablo UYARI içindir, ENGEL değildir. Ders yine seçilen branşın
 * yüküne eklenir; tablo yalnızca "bu ders bu branşın norm hesabına
 * dahil edilmez" bilgisini ekranda göstermeye yarar. Takdir idarecinindir.
 *
 * Yalnızca çizelgede ADIYLA geçen dersler buradadır. "Büro Yönetimi
 * Dersleri" gibi küme tarifleri bilerek DIŞARIDA bırakılmıştır; onlarla
 * eşleştirme yapmak tahmin yürütmek olurdu.
 *
 * kademe: null ise her okul türünde uyarır; "lise"/"ortaokul"/"ilkokul"
 * ise yalnızca o kademede. Çizelge "Fen Bilimleri (Ortaokul)" ile
 * "(Lise)" ayrımını bilerek yapmıştır.
 */
const NORM_HARIC_DERSLER = [
    { brans: "Biyoloji", dersAnahtari: "saglikbilgisivetrafikkulturu", dersAdi: "Sağlık Bilgisi ve Trafik Kültürü", kademe: null, cizelge: "Sağlık Bilgisi ve Trafik Kültürü" },
    { brans: "Matematik", dersAnahtari: "astronomiveuzaybilimleri", dersAdi: "Astronomi ve Uzay Bilimleri", kademe: null, cizelge: "Astronomi ve Uzay Bilimleri" },
    { brans: "Türk Dili ve Edebiyatı", dersAnahtari: "turkce", dersAdi: "Türkçe", kademe: "ortaokul", cizelge: "Türkçe (Ortaokul)" },
    { brans: "Türkçe", dersAnahtari: "turkdiliveedebiyati", dersAdi: "Türk Dili ve Edebiyatı", kademe: "lise", cizelge: "Türk Dili ve Edebiyatı (Lise)" },
    { brans: "Tarih", dersAnahtari: "sosyalbilgiler", dersAdi: "Sosyal Bilgiler", kademe: null, cizelge: "Sosyal Bilgiler" },
    { brans: "Tarih", dersAnahtari: "demokrasiveinsanhaklari", dersAdi: "Demokrasi ve İnsan Hakları", kademe: null, cizelge: "Demokrasi ve İnsan Hakları" },
    { brans: "Coğrafya", dersAnahtari: "sosyalbilgiler", dersAdi: "Sosyal Bilgiler", kademe: null, cizelge: "Sosyal Bilgiler" },
    { brans: "Sosyal Bilgiler", dersAnahtari: "tarih", dersAdi: "Tarih", kademe: "lise", cizelge: "Tarih (Lise)" },
    { brans: "Sosyal Bilgiler", dersAnahtari: "cografya", dersAdi: "Coğrafya", kademe: "lise", cizelge: "Coğrafya (Lise)" },
    { brans: "Fizik", dersAnahtari: "fenbilimleri", dersAdi: "Fen Bilimleri", kademe: "ortaokul", cizelge: "Fen Bilimleri (Ortaokul)" },
    { brans: "Kimya", dersAnahtari: "fenbilimleri", dersAdi: "Fen Bilimleri", kademe: "ortaokul", cizelge: "Fen Bilimleri (Ortaokul)" },
    { brans: "Fen Bilimleri", dersAnahtari: "fizik", dersAdi: "Fizik", kademe: null, cizelge: "Fizik" },
    { brans: "Fen Bilimleri", dersAnahtari: "kimya", dersAdi: "Kimya", kademe: null, cizelge: "Kimya" },
    { brans: "Fen Bilimleri", dersAnahtari: "biyoloji", dersAdi: "Biyoloji", kademe: "lise", cizelge: "Biyoloji (Lise)" },
    { brans: "İngilizce", dersAnahtari: "almanca", dersAdi: "Almanca", kademe: null, cizelge: "Almanca" },
    { brans: "Almanca", dersAnahtari: "ingilizce", dersAdi: "İngilizce", kademe: null, cizelge: "İngilizce" },
    { brans: "Fransızca", dersAnahtari: "ingilizce", dersAdi: "İngilizce", kademe: null, cizelge: "İngilizce" },
    { brans: "Arapça", dersAnahtari: "temeldinibilgiler", dersAdi: "Temel Dini Bilgiler", kademe: null, cizelge: "Temel Dini Bilgiler" },
    { brans: "Din Kültürü ve Ahlak Bilgisi", dersAnahtari: "arapca", dersAdi: "Arapça", kademe: null, cizelge: "Arapça" },
    { brans: "İHL Meslek Dersleri", dersAnahtari: "dinkulturuveahlakbilgisi", dersAdi: "Din Kültürü ve Ahlak Bilgisi", kademe: null, cizelge: "Din Kültürü ve Ahlak Bilgisi (Normal okullar)" },
    { brans: "Beden Eğitimi", dersAnahtari: "saglikbilgisivetrafikkulturu", dersAdi: "Sağlık Bilgisi ve Trafik Kültürü", kademe: "lise", cizelge: "Sağlık Bilgisi ve Trafik Kültürü (Lise)" },
    { brans: "Görsel Sanatlar", dersAnahtari: "teknolojivetasarim", dersAdi: "Teknoloji ve Tasarım", kademe: null, cizelge: "Teknoloji ve Tasarım" },
    { brans: "Müzik", dersAnahtari: "diksiyonvehitabet", dersAdi: "Diksiyon ve Hitabet", kademe: null, cizelge: "Diksiyon ve Hitabet" },
    { brans: "Teknoloji ve Tasarım", dersAnahtari: "gorselsanatlar", dersAdi: "Görsel Sanatlar", kademe: null, cizelge: "Görsel Sanatlar" },
    { brans: "Bilişim Teknolojileri", dersAnahtari: "teknolojivetasarim", dersAdi: "Teknoloji ve Tasarım", kademe: null, cizelge: "Teknoloji ve Tasarım" },
    { brans: "Pazarlama ve Perakende", dersAnahtari: "genelmuhasebe", dersAdi: "GENEL MUHASEBE", kademe: null, cizelge: "Genel Muhasebe" },
    { brans: "Sağlık Hizmetleri", dersAnahtari: "biyoloji", dersAdi: "Biyoloji", kademe: null, cizelge: "Biyoloji" },
    { brans: "Moda Tasarım Teknolojileri", dersAnahtari: "gorselsanatlar", dersAdi: "Görsel Sanatlar", kademe: null, cizelge: "Görsel Sanatlar" },
    { brans: "Tarım", dersAnahtari: "biyoloji", dersAdi: "Biyoloji", kademe: null, cizelge: "Biyoloji" },
];

/* KULLANILMAYAN KAYITLAR (küme tarifi oldukları için):
     Biyoloji                         Fen Bilgisi (Ortaokul)                         [küme tarifi]
     Felsefe                          Rehberlik / Kariyer Planlama                   [küme tarifi]
     İngilizce                        Fransızca ve diğer yabancı diller              [küme tarifi]
     Din Kültürü ve Ahlak Bilgisi     Değerler Eğitimi (Okul Öncesi)                 [küme tarifi]
     Teknoloji ve Tasarım             Bilişim Teknolojileri                          [küme tarifi]
     Sınıf Öğretmenliği               Okul Öncesi Dersleri                           [küme tarifi]
     Sınıf Öğretmenliği               Ortaokul Branş Dersleri                        [küme tarifi]
     Okul Öncesi                      İlkokul 1. Sınıf Dersleri                      [küme tarifi]
     Özel Eğitim                      Genel eğitim sınıflarının normal branş yükleri [küme tarifi]
     Muhasebe ve Finansman            Büro Yönetimi Dersleri                         [küme tarifi]
     Büro Yönetimi ve Yönetici Asistanlığı Muhasebe Dersleri                              [küme tarifi]
     Elektrik-Elektronik Teknolojisi  Bilişim Teknolojileri Donanım Dersleri         [küme tarifi]
     Makine ve Tasarım Teknolojisi    Metal Teknolojisi Kaynak Dersleri              [küme tarifi]
     Metal Teknolojisi                Makine Talaşlı İmalat Dersleri                 [küme tarifi]
     Mobilya ve İç Mekân Tasarımı     İnşaat Teknolojisi Yapı Dersleri               [küme tarifi]
     İnşaat Teknolojisi               Mobilya Tasarım Dersleri                       [küme tarifi]
     Motorlu Araçlar Teknolojisi      Makine İmalat Esasları                         [küme tarifi]
     Kimya / Kimya Teknolojisi        Genel Kimya (Kültür Dersi)                     [küme tarifi]
     Güzellik Hizmetleri              Kimya Laboratuvar Dersleri                     [küme tarifi]
     Yiyecek İçecek Hizmetleri        Konaklama Hizmetleri Ön Büro Dersleri          [küme tarifi]
     Konaklama ve Seyahat Hizmetleri  Yiyecek İçecek Servis Dersleri                 [küme tarifi]
     Çocuk Gelişimi ve Eğitimi        Okul Öncesi Öğretmenliği Fiili Sınıf Yükü      [küme tarifi]
     Grafik ve Fotoğraf               Görsel Sanatlar Resim Dersi                    [küme tarifi]
     Tarım                            Çevre Eğitimi                                  [küme tarifi]
     Laboratuvar Hizmetleri           Kimya Teknolojisi Sanayi Dersleri              [küme tarifi]
     Adalet                           Büro Yönetimi Ofis Programları Dersi           [küme tarifi]
     Ulaştırma Hizmetleri             Pazarlama ve Perakende Dersleri                [küme tarifi]
     Denizcilik                       Motorlu Araçlar Teknolojisi                    [küme tarifi]
*/

/**
 * Bu ders, bu branşın norm hesabına dahil edilmiyor mu?
 * Dönen değer: eşleşen kayıt (uyarı metni için) veya null.
 */
function normHaricKaydiBul(dersAdi, bransAdi, okulTuru) {
    if (!dersAdi || !bransAdi) return null;
    const sadelestir = (x) => String(x || "")
        .replace(/\(.*?\)/g, " ")
        .replace(/[İI]/g, "i").toLowerCase()
        .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u")
        .replace(/ö/g, "o").replace(/ç/g, "c").replace(/ı/g, "i")
        .replace(/[^a-z0-9]/g, "");
    const dk = sadelestir(dersAdi);
    const bk = sadelestir(bransAdi);
    const tur = String(okulTuru || "").toLowerCase();
    // Okul türünden kademe ailesi çıkarılır.
    const kademe = tur.includes("ilkokul") ? "ilkokul"
        : (tur.includes("ortaokul") ? "ortaokul"
        : (tur ? "lise" : null));
    for (const k of NORM_HARIC_DERSLER) {
        if (k.dersAnahtari !== dk) continue;
        if (sadelestir(k.brans) !== bk) continue;
        if (k.kademe && kademe && k.kademe !== kademe) continue;
        return k;
    }
    return null;
}

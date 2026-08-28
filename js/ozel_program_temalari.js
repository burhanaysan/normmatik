/* ===========================================================================
   OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN
   Üreteç : tools/uret_ozel_program.py
   Kaynak : Özel Program Uygulayan Lise haftalık ders çizelgeleri (TTKB)

   Bu okullarda dersler bir TEMAYA bağlıdır. Okul temasını seçer;
   şubenin dersleri = ortak dersler + ortak tematik dersler + temanın
   kendi dersleri.

   Tema sınırları PDF'in kendi tablo çizgilerinden okunur, tahmin
   edilmez. Elde bulunan eski kaynak JSON'da tema, etiketin denk
   geldiği satırdan itibaren ileri kopyalanmıştı ve sessizce yanlıştı:
   "Havacılık ve Uzayın Temelleri" Yazılım temasına, laboratuvar
   dersleri Havacılık temasına yazılmıştı.
   ======================================================================== */
const OZEL_PROGRAM_TEMALARI = {
    "ozel_program_fen_lisesi": {
        temalar: [
            { id: "bilisim_teknolojileri_ve_yazilim", ad: "Bilişim Teknolojileri ve Yazılım" },
            { id: "havacilik_ve_uzay_teknolojileri", ad: "Havacılık ve Uzay Teknolojileri" },
            { id: "temel_bilimler", ad: "Temel Bilimler" },
        ],
        kota: {"hazirlik": 10, "9": 8, "10": 8, "11": 4, "12": 4},
        ortak: {
            "hazirlik": [
                {"ders": "Programlamaya Giriş ve Algoritma+programlama Dilleri", "saat": 4, "saatSecenekleri": [4], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                {"ders": "Temel Elektrik-elektronik", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                {"ders": "Tümleşik Bilimler", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
            ],
        },
        dersler: {
            "bilisim_teknolojileri_ve_yazilim": {
                "hazirlik": [
                    {"ders": "Sayısal Elektronik", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
                "9": [
                    {"ders": "Bilgisayarlı Devre Simülasyonu ve Baskı Devre Tasarımı", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Mikrodenetleyiciler ve Uygulamaları", "saat": 3, "saatSecenekleri": [3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Nesne Tabanlı Programlama", "saat": 3, "saatSecenekleri": [3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
                "10": [
                    {"ders": "Veri Bilimi", "saat": 3, "saatSecenekleri": [3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Robotik Uygulamaları", "saat": 3, "saatSecenekleri": [3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Ağ Teknolojileri ve Nesnelerin İnterneti", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
            },
            "havacilik_ve_uzay_teknolojileri": {
                "hazirlik": [
                    {"ders": "Havacılık ve Uzayın Temelleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
                "9": [
                    {"ders": "Sayısal Elektronik ve Mikrodenetleyiciler", "saat": 3, "saatSecenekleri": [3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Mekaniğin Temelleri", "saat": 3, "saatSecenekleri": [3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Meteoroloji", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
            },
            "temel_bilimler": {
                "9": [
                    {"ders": "Fizik Laboratuvarı", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Kimya Laboratuvarı", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Biyoloji Laboratuvarı", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Temel Bilimlerde Bilişim Uygulamaları", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
            },
        },
        secilebilir: {
            "havacilik_ve_uzay_teknolojileri": {
                "10": [
                    {"ders": "Robotik Uygulamaları", "saat": 3, "saatSecenekleri": [3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Bilgisayar Destekli Tasarım ve Modelleme", "saat": 3, "saatSecenekleri": [3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Malzeme Bilimi", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Havacılık Sistemleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
                "11": [
                    {"ders": "Malzeme Bilimi", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Havacılık Sistemleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Seyrüsefer", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "İtki Sistemleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Uzay Teknolojileri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
                "12": [
                    {"ders": "Seyrüsefer", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "İtki Sistemleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Uzay Teknolojileri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Simülasyon Teknolojileri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
            },
            "temel_bilimler": {
                "10": [
                    {"ders": "Fizik Laboratuvarı", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Kimya Laboratuvarı", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Biyoloji Laboratuvarı", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Temel Bilimlerde Bilişim Uygulamaları", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Finansal Matematik", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Veri Analizi", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Geleceğin Enerji Sistemleri", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "İstatistik", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Biyoteknoloji", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Anatominin Temelleri", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Epidemiyoloji", "saat": 2, "saatSecenekleri": [2, 3], "atananBrans": "Sağlık Hizmetleri", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
                "11": [
                    {"ders": "Temel Bilimlerde Bilişim Uygulamaları", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Finansal Matematik", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Veri Analizi", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Geleceğin Enerji Sistemleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "İstatistik", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Biyoteknoloji", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Anatominin Temelleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Epidemiyoloji", "saat": 2, "saatSecenekleri": [2], "atananBrans": "Sağlık Hizmetleri", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Biyokimya", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Moleküler Biyoloji", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Optimizasyon", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Polimer Kimyası", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Nükleer Bilimler", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Tıp Bilimine Giriş", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Malzeme Bilimi", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "İleri Matematik", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
                "12": [
                    {"ders": "Temel Bilimlerde Bilişim Uygulamaları", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Finansal Matematik", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Veri Analizi", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Geleceğin Enerji Sistemleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "İstatistik", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Biyoteknoloji", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Anatominin Temelleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Epidemiyoloji", "saat": 2, "saatSecenekleri": [2], "atananBrans": "Sağlık Hizmetleri", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Biyokimya", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Moleküler Biyoloji", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Optimizasyon", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Polimer Kimyası", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Nükleer Bilimler", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Tıp Bilimine Giriş", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Malzeme Bilimi", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "İleri Matematik", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Genetik Bilimine Giriş", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
            },
            "bilisim_teknolojileri_ve_yazilim": {
                "11": [
                    {"ders": "Yapay Zekâ ve Makine Öğrenmesi", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Bilgisayar Mimarisi ve İşletim Sistemleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Siber Güvenlik ve Kriptoloji", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
                "12": [
                    {"ders": "Yapay Zekâ ve Makine Öğrenmesi", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Bilgisayar Mimarisi ve İşletim Sistemleri", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Siber Güvenlik ve Kriptoloji", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                    {"ders": "Yazılım Uygulamaları", "saat": 2, "saatSecenekleri": [2], "atananBrans": "— Branş Atanmadı —", "kategori": "TEMATİK ALAN DERSLERİ", "isAtolye": false},
                ],
            },
        },
    }
};

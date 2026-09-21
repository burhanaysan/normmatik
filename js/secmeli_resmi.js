/* ===========================================================================
   OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN
   Üreteç : tools/uret_secmeli_resmi.py
   Meslekî kurumların seçmeli ders listeleri, resmî kaynaktan:
     mtal_kultur      TTKB 2026-62 ve 2024-41 seçmeli dersler tabloları (görüntüden okundu, çapraz sağlama)
     mtal_meslek      MTAL ÇÖP seçmeli meslek dersleri tablosu (sınıfın kendi ÇÖP'ü, sınıfa süzülmüş)
     mesem            MESEM ÇÖP seçmeli dersler tablosu
     meslek_ortaokulu Meslek Ortaokulu ÇÖP (TTKB 2025-74) seçmeli dersler tablosu
   ======================================================================== */
const SECMELI_RESMI = {
 "mtal_kultur": {
  "2026-62": {
   "karar": "TTKB 16/07/2026-62",
   "siniflar": {
    "hazirlik": [
     {
      "ders": "Proje Tasarımı ve Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Düşünme Eğitimi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Demokrasi ve İnsan Hakları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Metin Tahlilleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli İkinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Kur'an-ı Kerim",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Peygamberimizin Hayatı",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Temel Dinî Bilgiler",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Türk Sosyal Hayatında Aile",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Bilim Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Kültür ve Medeniyeti",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Spor Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Sanat Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     }
    ],
    "9": [
     {
      "ders": "Astronomi ve Uzay Bilimleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyal Bilim Çalışmaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Bilişim Teknolojileri ve Yazılım",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1
      ],
      "kacKez": 4
     },
     {
      "ders": "Proje Tasarımı ve Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Düşünme Eğitimi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Demokrasi ve İnsan Hakları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Metin Tahlilleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli İkinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Osmanlı Türkçesi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Kur'an-ı Kerim",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Peygamberimizin Hayatı",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Temel Dinî Bilgiler",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Adabımuaşeret",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Sosyal Hayatında Aile",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Fütüvvet",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Ahilik Kültürü ve Girişimcilik",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Bilim Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Kültür ve Medeniyet Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Kültür ve Medeniyeti",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Spor Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Sanat Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     }
    ],
    "10": [
     {
      "ders": "Astronomi ve Uzay Bilimleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyal Bilim Çalışmaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Bilişim Teknolojileri ve Yazılım",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Proje Tasarımı ve Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Düşünme Eğitimi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Demokrasi ve İnsan Hakları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "İklim, Çevre ve Yenilikçi Çözümler",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Temel Hukuk Bilgisi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Metin Tahlilleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli İkinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Osmanlı Türkçesi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Türk Dünyası Coğrafyası",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ortak Türk Edebiyatı",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ortak Türk Tarihi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Kur'an-ı Kerim",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Peygamberimizin Hayatı",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Temel Dinî Bilgiler",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Türk Düşünce Tarihi",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Klasik Ahlak Metinleri",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Adabımuaşeret",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Sosyal Hayatında Aile",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Fütüvvet",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Ahilik Kültürü ve Girişimcilik",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Bilim Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Kültür ve Medeniyet Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Kültür ve Medeniyeti",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Spor Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Sanat Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     }
    ],
    "11": [
     {
      "ders": "Seçmeli Matematik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       6
      ],
      "kacKez": 2
     },
     {
      "ders": "Temel Matematik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Fizik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Kimya",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Biyoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Türk Dili ve Edebiyatı",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       3,
       5
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Tarih",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 1
     },
     {
      "ders": "Seçmeli Coğrafya",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Psikoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Mantık",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Seçmeli Birinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       10,
       12
      ],
      "kacKez": 2
     },
     {
      "ders": "Fen Bilimleri Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Matematik Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Astronomi ve Uzay Bilimleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyal Bilim Çalışmaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Bilişim Teknolojileri ve Yazılım",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2,
       3
      ],
      "kacKez": 4
     },
     {
      "ders": "Proje Tasarımı ve Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3,
       4
      ],
      "kacKez": 4
     },
     {
      "ders": "Demokrasi ve İnsan Hakları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "İklim, Çevre ve Yenilikçi Çözümler",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Temel Hukuk Bilgisi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Metin Tahlilleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli İkinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 4
     },
     {
      "ders": "Osmanlı Türkçesi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Türk Dünyası Coğrafyası",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ortak Türk Edebiyatı",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ortak Türk Tarihi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Kur'an-ı Kerim",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Peygamberimizin Hayatı",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Temel Dinî Bilgiler",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Türk Düşünce Tarihi",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Klasik Ahlak Metinleri",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Türk Sosyal Hayatında Aile",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Tezhip",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ebru",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Hüsnühat",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Dinî Musiki",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Fütüvvet",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Ahilik Kültürü ve Girişimcilik",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Bilim Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Kültür ve Medeniyet Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       2,
       4
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Kültür ve Medeniyeti",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Spor Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Sanat Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     }
    ],
    "12": [
     {
      "ders": "Seçmeli Matematik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       6
      ],
      "kacKez": 2
     },
     {
      "ders": "Temel Matematik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Fizik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Kimya",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Biyoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Türk Dili ve Edebiyatı",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       3,
       5
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Tarih",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 1
     },
     {
      "ders": "Çağdaş Türk ve Dünya Tarihi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": null
     },
     {
      "ders": "Seçmeli Coğrafya",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Psikoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Mantık",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Seçmeli Birinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       10,
       12
      ],
      "kacKez": 2
     },
     {
      "ders": "Fen Bilimleri Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Matematik Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Astronomi ve Uzay Bilimleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyal Bilim Çalışmaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Bilişim Teknolojileri ve Yazılım",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2,
       3
      ],
      "kacKez": 4
     },
     {
      "ders": "Proje Tasarımı ve Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3,
       4
      ],
      "kacKez": 4
     },
     {
      "ders": "Demokrasi ve İnsan Hakları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Temel Hukuk Bilgisi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Seçmeli İkinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 4
     },
     {
      "ders": "Osmanlı Türkçesi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Hedef Temelli Destek Eğitimi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       3,
       4,
       5,
       6
      ],
      "kacKez": null
     },
     {
      "ders": "Kur'an-ı Kerim",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Peygamberimizin Hayatı",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Temel Dinî Bilgiler",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Türk Düşünce Tarihi",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Klasik Ahlak Metinleri",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Türk Sosyal Hayatında Aile",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Tezhip",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ebru",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Hüsnühat",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Dinî Musiki",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Fütüvvet",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Ahilik Kültürü ve Girişimcilik",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Bilim Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Kültür ve Medeniyet Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       2,
       4
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Kültür ve Medeniyeti",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Spor Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Sanat Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     }
    ]
   },
   "kaynak": "temel_egitim_ortaokul/SECIMLI_DERSLER_KURUL_KARARI.pdf (s.3, görüntü)"
  },
  "2024-41": {
   "karar": "TTKB 03/09/2024-41",
   "siniflar": {
    "9": [
     {
      "ders": "Astronomi ve Uzay Bilimleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyal Bilim Çalışmaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Bilişim Teknolojileri ve Yazılım",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1
      ],
      "kacKez": 4
     },
     {
      "ders": "Proje Tasarımı ve Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 4
     },
     {
      "ders": "Düşünme Eğitimi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Demokrasi ve İnsan Hakları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Metin Tahlilleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli İkinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Osmanlı Türkçesi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Kur'an-ı Kerim",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Peygamberimizin Hayatı",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Temel Dinî Bilgiler",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Adabımuaşeret",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Sosyal Hayatında Aile",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Fütüvvet",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Ahilik Kültürü ve Girişimcilik",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Bilim Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Kültür ve Medeniyet Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Kültür ve Medeniyeti",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Spor Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2,
       3
      ],
      "kacKez": 3
     },
     {
      "ders": "Sanat Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2,
       3
      ],
      "kacKez": 3
     }
    ],
    "10": [
     {
      "ders": "Astronomi ve Uzay Bilimleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyal Bilim Çalışmaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Bilişim Teknolojileri ve Yazılım",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Proje Tasarımı ve Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Düşünme Eğitimi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Demokrasi ve İnsan Hakları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "İklim, Çevre ve Yenilikçi Çözümler",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Temel Hukuk Bilgisi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Metin Tahlilleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli İkinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Osmanlı Türkçesi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Türk Dünyası Coğrafyası",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ortak Türk Edebiyatı",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ortak Türk Tarihi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Kur'an-ı Kerim",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Peygamberimizin Hayatı",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Temel Dinî Bilgiler",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Türk Düşünce Tarihi",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Klasik Ahlak Metinleri",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Adabımuaşeret",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Sosyal Hayatında Aile",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Fütüvvet",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Ahilik Kültürü ve Girişimcilik",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Bilim Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Kültür ve Medeniyet Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Kültür ve Medeniyeti",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Spor Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Sanat Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     }
    ],
    "11": [
     {
      "ders": "Seçmeli Matematik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       6
      ],
      "kacKez": 2
     },
     {
      "ders": "Temel Matematik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Fizik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Kimya",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Biyoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Türk Dili ve Edebiyatı",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       3,
       5
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Tarih",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 1
     },
     {
      "ders": "Seçmeli Coğrafya",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Psikoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Mantık",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Seçmeli Birinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       10,
       12
      ],
      "kacKez": 2
     },
     {
      "ders": "Fen Bilimleri Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Matematik Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Astronomi ve Uzay Bilimleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyal Bilim Çalışmaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Bilişim Teknolojileri ve Yazılım",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2,
       3
      ],
      "kacKez": 4
     },
     {
      "ders": "Proje Tasarımı ve Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3,
       4
      ],
      "kacKez": 4
     },
     {
      "ders": "Demokrasi ve İnsan Hakları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "İklim, Çevre ve Yenilikçi Çözümler",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Temel Hukuk Bilgisi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Metin Tahlilleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli İkinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 4
     },
     {
      "ders": "Osmanlı Türkçesi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Türk Dünyası Coğrafyası",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ortak Türk Edebiyatı",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ortak Türk Tarihi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Kur'an-ı Kerim",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Peygamberimizin Hayatı",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Temel Dinî Bilgiler",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Türk Düşünce Tarihi",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Klasik Ahlak Metinleri",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Türk Sosyal Hayatında Aile",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Tezhip",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ebru",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Hüsnühat",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Dinî Musiki",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Fütüvvet",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Ahilik Kültürü ve Girişimcilik",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Bilim Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Kültür ve Medeniyet Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       2,
       4
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Kültür ve Medeniyeti",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Spor Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Sanat Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     }
    ],
    "12": [
     {
      "ders": "Seçmeli Matematik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       6
      ],
      "kacKez": 2
     },
     {
      "ders": "Temel Matematik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Fizik",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Kimya",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Biyoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Türk Dili ve Edebiyatı",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       3,
       5
      ],
      "kacKez": 2
     },
     {
      "ders": "Seçmeli Tarih",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 1
     },
     {
      "ders": "Çağdaş Türk ve Dünya Tarihi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": null
     },
     {
      "ders": "Seçmeli Coğrafya",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 2
     },
     {
      "ders": "Psikoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyoloji",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Mantık",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Seçmeli Birinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       10,
       12
      ],
      "kacKez": 2
     },
     {
      "ders": "Fen Bilimleri Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Matematik Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Astronomi ve Uzay Bilimleri",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Sosyal Bilim Çalışmaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3
      ],
      "kacKez": 2
     },
     {
      "ders": "Bilişim Teknolojileri ve Yazılım",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2,
       3
      ],
      "kacKez": 4
     },
     {
      "ders": "Proje Tasarımı ve Uygulamaları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       3,
       4
      ],
      "kacKez": 4
     },
     {
      "ders": "Demokrasi ve İnsan Hakları",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Temel Hukuk Bilgisi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Seçmeli İkinci Yabancı Dil",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2,
       4
      ],
      "kacKez": 4
     },
     {
      "ders": "Osmanlı Türkçesi",
      "grup": "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
      "saatler": [
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Kur'an-ı Kerim",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Peygamberimizin Hayatı",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 4
     },
     {
      "ders": "Temel Dinî Bilgiler",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 2
     },
     {
      "ders": "Türk Düşünce Tarihi",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Klasik Ahlak Metinleri",
      "grup": "Din, Ahlak ve Değer",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Türk Sosyal Hayatında Aile",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Tezhip",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Ebru",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Hüsnühat",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Dinî Musiki",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Fütüvvet",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "Ahilik Kültürü ve Girişimcilik",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Bilim Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Türk Kültür ve Medeniyet Tarihi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       2,
       4
      ],
      "kacKez": 1
     },
     {
      "ders": "İslam Kültür ve Medeniyeti",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 1
     },
     {
      "ders": "Spor Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     },
     {
      "ders": "Sanat Eğitimi",
      "grup": "Kültür, Sanat ve Spor",
      "saatler": [
       1,
       2
      ],
      "kacKez": 3
     }
    ]
   },
   "kaynak": "temel_egitim_ortaokul/SECMELI_DERSLER_KURUL_KARARI_2024-41.pdf (s.4, görüntü)"
  },
  "kural": "Tüm sınıf seviyelerinde seçmeli ders gruplarının her birinden en az bir ders seçilmesi zorunludur; hazırlık sınıfında gruplardan toplam 2 ders saati (2026-62 açıklamaları).",
  "gruplar": [
   "Akademik Çalışmalar, İnsan, Toplum ve Bilim",
   "Din, Ahlak ve Değer",
   "Kültür, Sanat ve Spor"
  ]
 },
 "mtal_meslek": {
  "adalet": {
   "11": [
    {
     "ders": "Ceza İnfaz Kurumlarında Müdahale Yöntemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yüksek Yargı Kalem Hizmetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Noter ve Avukat Kâtipliği",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Denetimli Serbestlik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Adli Takiplik",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Adabımuaşeret ve Protokol Kuralları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hızlı Klavye",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yedieminlik",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Ceza İnfaz Kurumlarında Müdahale Yöntemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yüksek Yargı Kalem Hizmetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Noter ve Avukat Kâtipliği",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Denetimli Serbestlik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Adli Takiplik",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Adab-I Muaşeret ve Protokol Kuralları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hızlı Klavye",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yeddieminlik",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "aile": {
   "11": [
    {
     "ders": "Aile Ekonomisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuk Aktiviteleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yaşlılıkta Uyum",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yöresel Türk Mutfağı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Profesyonel Satış Becerileri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Pazarlama İletişimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kurumsal İletişim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Aile Kaynakları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Atıklar",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ev Hizmetleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İş Hayatında İletişim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İletişimde Etkili Drama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Geri Dönüşümlü Ambalajlar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sofra Düzenleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Konut Edinme ve Düzenleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Toplum ve Aile",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yaşadığımız Çevre",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yemek Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Sosyal Destek Hizmetleri)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Tüketici Hizmetleri)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Aile Ekonomisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuk Aktiviteleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yaşlılıkta Uyum",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yöresel Türk Mutfağı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Profesyonel Satış Becerileri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Pazarlama İletişimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kurumsal İletişim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Aile Kaynakları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Atıklar",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ev Hizmetleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İş Hayatında İletişim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İletişimde Etkili Drama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Geri Dönüşümlü Ambalajlar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sofra Düzenleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Konut Edinme ve Düzenleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Toplum ve Aile",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yaşadığımız Çevre",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yemek Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Sosyal Destek Hizmetleri)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Tüketici Hizmetleri)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "bilisim": {
   "11": [
    {
     "ders": "Elektronik Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mikrodenetleyici",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Web Programcılığı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Açık Kaynak İşletim Sistemi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Ağ Projesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Blok Zincir",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Nesnelerin İnterneti",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Oyun Programlama",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Web Tabanlı İçerik Yönetimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yapay Zekâ ve Makine Öğrenmesi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yazılım Projesi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Elektronik Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mikrodenetleyici",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Web Programcılığı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Açık Kaynak İşletim Sistemi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Ağ Projesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Blok Zincir",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Nesnelerin İnterneti",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Oyun Programlama",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Web Tabanlı İçerik Yönetimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yapay Zekâ ve Makine Öğrenmesi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yazılım Projesi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "biyomedikal": {
   "11": [
    {
     "ders": "Fizyolojik Sinyal İzleyiciler",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Nükleer Tıp Cihazları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Otoanalizörler",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Özel Tedavi Cihazları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tıbbi Teknoloji Organizasyonu",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Biyomalzeme ve Biyomekanik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Robotik ve Kodlama",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "3-D Yazıcılar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayar Destekli Uygulamalar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Biyomedikal Mesleki İngilizce",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Biyomedikal Mesleki Projeler",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Biyomedikal Sistemlerde Hidrolik Pnömatik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Fizyolojik Sinyal İzleyiciler",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Nükleer Tıp Cihazları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Otoanalizörler",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Özel Tedavi Cihazları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tıbbi Teknoloji Organizasyonu",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Biyomalzeme ve Biyomekanik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Robotik ve Kodlama",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "3-D Yazıcılar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayar Destekli Uygulamalar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Biyomedikal Mesleki İngilizce",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Biyomedikal Mesleki Projeler",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Biyomedikal Sistemlerde Hidrolik Pnömatik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "buro": {
   "11": [
    {
     "ders": "Hukuk Dili ve Terminolojisi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Kalem Hizmetleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Ticaret Hizmetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "E-Ticaret Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Matematik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İşletme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Çağrı Merkezi Hizmetleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İnsan Kaynakları Yönetimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya Hesabı İşlemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Hukuk Dili ve Terminolojisi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Kalem Hizmetleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Ticaret Hizmetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "E-Ticaret",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Matematik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İşletme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Çağrı Merkezi Hizmetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İnsan Kaynakları Yönetimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya Hesabı İşlemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "cocukgelisimi": {
   "11": [
    {
     "ders": "Çocuk Edebiyatı ve Masal Anlatımı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuk Aktiviteleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Kostüm ve Sahne Makyajı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Destek Hizmetleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuklara İlk Yardım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sanat ve Oyun I",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Sanat ve Oyun II",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Çocuk Edebiyatı ve Masal Anlatımı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuk Aktiviteleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Kostüm ve Sahne Makyajı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Destek Hizmetleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuklara İlk Yardım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sanat ve Oyun I",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Sanat ve Oyun II",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "denizcilik": {
   "11": [
    {
     "ders": "Bilgisayarla Devre Dizaynı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Denizcilik Eğitimi (*)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayar Destekli Çizim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Denizcilikte Kaynak Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Elektrik Elektronik Devre Uygulamaları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Acente Hizmetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Seyir Planlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Simülatör Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Balık Avlama Tekniği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Balık Kültürü",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Akvaryum Balıkları Kültürü",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Bilgisayarla Devre Dizaynı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Denizcilik Eğitimi (*)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayar Destekli Çizim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Denizcilikte Kaynak Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Elektrik Elektronik Devre Uygulamaları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Acente Hizmetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Seyir Planlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Simülatör Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Balık Avlama Tekniği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Balık Kültürü",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Akvaryum Balıkları Kültürü",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "elektrik": {
   "11": [
    {
     "ders": "3D Modelleme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "AC Motor Kumanda ve Sarım Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Akıllı Ev Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Asansör Son Kontrol ve Testleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Aydınlatma ve Kontrolü",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Aydınlatmada Güvenlik ve Verim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Baskı Makineleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çoklu Ortam Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dağıtım Şebekesi ve Tarifeleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "DC Motor Sarım Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Elektrik-Elektronik Projeler",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Mutfak ve Yıkama Makineleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Belgegeçer (Faks)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Geçiş Kontrol Sistemleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "GSM Telefonlar",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Haberleşme Şebeke Altyapısı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Hidrolik ve Pnömatik Sistemler",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Mikrodenetleyici Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Pano Projeleri Çizimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Seslendirme ve Işıklandırma",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Robotik Uygulamalar",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Trafo Sarımı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yazar Kasa ve Para Sayma Makinesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yazıcılar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "YG Sistemleri",
     "saat": 9,
     "seviye": "11-12"
    },
    {
     "ders": "YG Tesislerinde Anahtarlama ve Otomasyon",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Yürüyen Merdiven Yol Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "3D Modelleme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "AC Motor Kumanda ve Sarım Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Akıllı Ev Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Asansör Son Kontrol ve Testleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Aydınlatma ve Kontrolü",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Aydınlatmada Güvenlik ve Verim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Baskı Makineleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çoklu Ortam Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dağıtım Şebekesi ve Tarifeleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "DC Motor Sarım Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Elektrik-Elektronik Projeler",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Mutfak ve Yıkama Makineleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Belgegeçer (Faks)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Geçiş Kontrol Sistemleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "GSM Telefonlar",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Haberleşme Şebeke Altyapısı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Hidrolik ve Pnömatik Sistemler",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Mikrodenetleyici Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Pano Projeleri Çizimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Seslendirme ve Işıklandırma",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Robotik Uygulamalar",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Trafo Sarımı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yazar Kasa ve Para Sayma Makinesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yazıcılar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "YG Sistemleri",
     "saat": 9,
     "seviye": "11-12"
    },
    {
     "ders": "YG Tesislerinde Anahtarlama ve Otomasyon",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Yürüyen Merdiven Yol Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "elsanat": {
   "11": [
    {
     "ders": "El Dokuma",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Halı Tasarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Motif Çizim Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "El Nakışları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Makine Nakışları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Sanayi Nakışları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Antep İşi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Maraş İşi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Nakış Tasarımları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Kırkyama Üretimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Yorgan Üretimi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çarpana Dokuma",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dekoratif Ev Aksesuarları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Dekoratif Ürünlerde Bakım ve Onarım",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Oyuncak Üretimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Tamamlayıcı Aksesuarlar",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Yapma Bebek Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Yapma Çiçek Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Yöresel El Sanatları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "E-Ticaret",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Estetik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "El Dokuma",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Halı Tasarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Motif Çizim Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "El Nakışları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Makine Nakışları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Sanayi Nakışları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Antep İşi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Maraş İşi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Nakış Tasarımları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Kırkyama Üretimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Yorgan Üretimi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çarpana Dokuma",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dekoratif Ev Aksesuarları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Dekoratif Ürünlerde Bakım ve Onarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Oyuncak Üretimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Tamamlayıcı Aksesuarlar",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Yapma Bebek Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Yapma Çiçek Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Yöresel El Sanatları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "E-Ticaret",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Estetik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "endustriyel": {
   "11": [
    {
     "ders": "Denetim Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Elektrohidrolik Uygulamalar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Görsel Programlama",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Proje",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İleri PLC Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Robot Kol Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mekanizmaların Modellemesi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Denetim Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Elektrohidrolik Uygulamalar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Görsel Programlama",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Proje",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İleri PLC Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Robot Kol Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mekanizmaların Modellemesi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "gazetecilik": {
   "11": [
    {
     "ders": "Muhabirlik",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Sayfa Sekreterliği",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Medya Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Haber Röportaj Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Gazete Yazı Türleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Haber Spikerliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yerel Habercilik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Fotoğraf Yorumlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "WEB Arayüz Tasarımı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Grafik Tasarım",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Kitle İletişim Hukuku",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Klavye Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Drone Kullanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Muhabirlik",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Sayfa Sekreterliği",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Medya Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Haber Röportaj Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Gazete Yazı Türleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Haber Spikerliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yerel Habercilik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Fotoğraf Yorumlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "WEB Arayüz Tasarımı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Grafik Tasarım",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Kitle İletişim Hukuku",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Klavye Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Drone Kullanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "gazetecilikpro": {
   "11": [
    {
     "ders": "Muhabirlik",
     "saat": 4,
     "seviye": "11"
    },
    {
     "ders": "Sayfa Sekreterliği",
     "saat": 4,
     "seviye": "11"
    },
    {
     "ders": "Medya Tarihi",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Haber Röportaj Teknikleri",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Gazete Yazı Türleri",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Haber Spikerliği",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Arama Motoru Optimizasyonu (SEO)",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Sosyal Medya Uygulamaları",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Fotoğraf Yorumlama",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Bilgisayarda Grafik Tasarım",
     "saat": 4,
     "seviye": "11"
    },
    {
     "ders": "Kitle İletişim Hukuku",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Klavye Teknikleri",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Web Tabanlı Uygulama",
     "saat": 3,
     "seviye": "11"
    },
    {
     "ders": "Mobil Uygulama Geliştirme",
     "saat": 3,
     "seviye": "11"
    },
    {
     "ders": "Drone Kullanımı",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11"
    }
   ]
  },
  "geleneksel": {
   "11": [
    {
     "ders": "Hüsn-İ Hat Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Ebru Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Minyatür Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Kātı’ Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Hüsn-İ Hat Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Ebru Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Minyatür Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Kātı’ Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Tezhip Uygulamaları",
     "saat": 7,
     "seviye": "12"
    },
    {
     "ders": "Çini Uygulamaları",
     "saat": 7,
     "seviye": "12"
    },
    {
     "ders": "Kalemişi Uygulamaları",
     "saat": 7,
     "seviye": "12"
    },
    {
     "ders": "Cilt Uygulamaları",
     "saat": 7,
     "seviye": "12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "gemi": {
   "11": [
    {
     "ders": "Gemi Maketi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Donatım Bakım Onarımı",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Boru Kaynakçılığı",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Sevk Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki İngilizce",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Malzeme Bilgisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Özel Kaynak Yöntemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Tipleri ve Yapısal Özellikleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Türk Denizcilik Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tersane Organizasyonu",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Modelleme ve Montaj",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Gemi Maketi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Donatım Bakım Onarımı",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Boru Kaynakçılığı",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Sevk Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki İngilizce",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Malzeme Bilgisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Özel Kaynak Yöntemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Tipleri ve Yapısal Özellikleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Türk Denizcilik Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tersane Organizasyonu",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gemi Modelleme ve Montaj",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "gida": {
   "11": [
    {
     "ders": "Gıda Kalite Kontrol",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gıda Ambalajları Kontrolü",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Beslenme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Organik Bileşikler",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Özel Gıdalar",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bitkisel Yağ İşleme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Çay İşleme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Hububat İşleme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Süt İşleme",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Et İşleme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Meyve ve Sebze İşleme",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Gıda Kalite Kontrol",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gıda Ambalajları Kontrolü",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Beslenme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Organik Bileşikler",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Özel Gıdalar",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bitkisel Yağ İşleme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Çay İşleme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Hububat İşleme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Süt İşleme",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Et İşleme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Meyve ve Sebze İşleme",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "grafik": {
   "11": [
    {
     "ders": "Grafik ve Fotoğraf Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İletişim Araçlarında Fotoğraf",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Karanlık Oda",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Özgün Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Portfolyo Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Proje Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Sanat Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Animasyon Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Belgesel Fotoğraf",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Fotoğraf Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Desen Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Web Arayüz Tasarımı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Grafik ve Fotoğraf Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İletişim Araçlarında Fotoğraf",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Karanlık Oda",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Özgün Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Portfolyo Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Proje Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Sanat Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Animasyon Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Belgesel Fotoğraf",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Fotoğraf Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Desen Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Web Arayüz Tasarımı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "guzellik": {
   "11": [
    {
     "ders": "Kadın Saç Şekillendirme ve Kesim Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Kadın Saç Renklendirme Teknikleri",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Erkek Saç Şekillendirme ve Kesim Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Erkek Saç Renklendirme Teknikler",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Sakal Bıyık Tıraşı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Beslenme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Diksiyon ve Etkili İletişim",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Temel İlk Yardım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Güzellik Hizmetleri Alanı)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Kadın Saç Şekillendirme ve Kesim Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Kadın Saç Renklendirme Teknikleri",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Erkek Saç Şekillendirme ve Kesim Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Erkek Saç Renklendirme Teknikler",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Sakal Bıyık Tıraşı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Beslenme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Diksiyon ve Etkili İletişim",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Temel İlk Yardım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Güzellik Hizmetleri Alanı)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "halklailiskiler": {
   "11": [
    {
     "ders": "Tanıtım Faaliyetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Müşteri Temsilciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Halkla İlişkilerde Metin Yazarlığı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Rekreasyon",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Organizasyon",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "İnsan Kaynakları Faaliyetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Anketörlük",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Tanıtım Faaliyetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Müşteri Temsilciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Halkla İlişkilerde Metin Yazarlığı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Rekreasyon",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Organizasyon",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "İnsan Kaynakları Faaliyetleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Anketörlük",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "harita": {
   "11": [
    {
     "ders": "Coğrafi Bilgi Sistemleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İnsansız Hava Aracı (Drone) Kullanımı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Klavye Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ofis Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tapu İşlemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Topoğraf",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Coğrafi Bilgi Sistemleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İnsansız Hava Aracı (Drone) Kullanımı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Klavye Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ofis Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tapu İşlemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Topoğraf",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "hasta": {
   "11": [
    {
     "ders": "Engelli Hizmetleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Engelli Bakımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Hidroterapi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Klinik Egzersiz",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Afetle Mücadele",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki İngilizce (Hasta ve Yaşlı Hizmetleri/Sağlık Hizmetleri)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Almanca (Hasta ve Yaşlı Hizmetleri/Sağlık Hizmetleri)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Sigorta ve Finansmanı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Turizmi Merkezleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Turizmi Süreç Yönetimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Termal Uygulamalar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Engelli Hizmetleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Engelli Bakımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Hidroterapi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Klinik Egzersiz",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Afetle Mücadele",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki İngilizce (Hasta ve Yaşlı Hizmetleri/Sağlık Hizmetleri)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Almanca (Hasta ve Yaşlı Hizmetleri/Sağlık Hizmetleri)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Sigorta ve Finansmanı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Turizmi Merkezleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Turizmi Süreç Yönetimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Termal Uygulamalar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "havacilikveuzaypro": {
   "11": [
    {
     "ders": "Havacılık Mevzuatı ve İnsan Faktörleri",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Mesleki Yabancı Dil (Uçak Bakım)",
     "saat": 3,
     "seviye": "11"
    },
    {
     "ders": "Elektrik Devre Analizi Atölyesi",
     "saat": 4,
     "seviye": "11"
    },
    {
     "ders": "Hava Aracı Aerodinamiği",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Havacılık Fiziği",
     "saat": 3,
     "seviye": "11"
    },
    {
     "ders": "Havacılık Matematiği",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "İnsansız Hava Araçları (İHA)",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "hayvanyetistiriciligi": {
   "11": [
    {
     "ders": "Arıcılık",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Atçılık",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Ev ve Süs Hayvanları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Hayvancılıkta Mekanizasyon",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kaz, Ördek ve Hindi Yetiştiriciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sağım ve Süt İşleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sürü Yönetimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Arıcılık",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Atçılık",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Ev ve Süs Hayvanları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Hayvancılıkta Mekanizasyon",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kaz, Ördek ve Hindi Yetiştiriciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sağım ve Süt İşleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sürü yönetimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "insaat": {
   "11": [
    {
     "ders": "Mimari Eserler",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Müze ve Konservasyon",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Bezeme ve Süsleme Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Park Bahçe Mobilyaları İmalatı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Parke Taşı ve Bordür Kaplamalar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Genel Jeoloji ve Zemin Etütleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Sanat Yapıları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yol ve Su Yapıları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Arazide Ölçme Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Ahşap Doğrama Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla PVC Doğrama Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Betonarme Yapı Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Duvar Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Çatı Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Çelik Proje Çizimleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Mimari ve İç Mekân Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Yalıtım Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bina Maketleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Yapıda Tasarı Geometri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bina ve Yerleşim Rölövesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yapı Statik Hesapları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Renklerle Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İnşaat İş Sağlığı ve Güvenliği",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Mimari Eserler",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Müze ve Konservasyon",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Bezeme ve Süsleme Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Park Bahçe Mobilyaları İmalatı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Parke Taşı ve Bordür Kaplamalar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Genel Jeoloji ve Zemin Etütleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Sanat Yapıları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yol ve Su Yapıları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Arazide Ölçme Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Ahşap Doğrama Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla PVC Doğrama Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Betonarme Yapı Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Duvar Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Çatı Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Çelik Proje Çizimleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Mimari ve İç Mekân Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarla Yalıtım Detayları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Bina Maketleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Yapıda Tasarı Geometri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bina ve Yerleşim Rölövesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yapı Statik Hesapları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Renklerle Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İnşaat İş Sağlığı ve Güvenliği",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "itfaiyecilik": {
   "11": [
    {
     "ders": "Doğada Arama Kurtarma",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Doğal Afetlere Hazırlık",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Dokümantasyon ve Arşivleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yangın Olay Yeri İnceleme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomatik Yangın Söndürme Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yangın Algılama ve İhbar Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Doğada Arama Kurtarma",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Doğal Afetlere Hazırlık",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Dokümantasyon ve Arşivleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yangın Olay Yeri İnceleme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomatik Yangın Söndürme Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yangın Algılama ve İhbar Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "kimya": {
   "11": [
    {
     "ders": "Boya Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Boya Üretimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Lastik Üretimine Giriş",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Polimer Kimya",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Anorganik Kimya",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Boya Kalite Kontrol",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Nicel Analiz",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "İlaç Üretimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Korozyon ve Korozyonu Önleme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Lastik Seçimi ve Sınıflandırılması",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Lastik Üretim Prosesi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Boya Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Boya Üretimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Lastik Üretimine Giriş",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Polimer Kimya",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Anorganik Kimya",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Boya Kalite Kontrol",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Nicel Analiz",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "İlaç Üretimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Korozyon ve Korozyonu Önleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Lastik Seçimi ve Sınıflandırılması",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Lastik Üretim Prosesi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "konaklama": {
   "11": [
    {
     "ders": "Kuru Temizleme İşlemleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çamaşırhane İşlemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Destinasyon Yönetimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Alternatif Turizm",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Dünya Seyahat ve Turizm Coğrafyası",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dünya Kültürleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çocukla İletişim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kongre ve Etkinlik Turizmi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tüketici Davranışları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gastronomi Turizmi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Drama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Türk Halk Oyunları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kostüm ve Sahne Makyajı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Dünya Dansları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Takım Çalışması Oyunları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Tur Operasyonu",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Transfer Operasyonu",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Kat Hizmetlerinde Yönetim",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuk Gelişimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Hikâye ve Masal Anlatıcılığı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Kuru Temizleme İşlemleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çamaşırhane İşlemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Destinasyon Yönetimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Alternatif Turizm",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Dünya Seyahat ve Turizm Coğrafyası",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dünya Kültürleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çocukla İletişim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kongre ve Etkinlik Turizmi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tüketici Davranışları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gastronomi Turizmi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Drama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Türk Halk Oyunları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kostüm ve Sahne Makyajı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Dünya Dansları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Takım Çalışması Oyunları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Tur Operasyonu",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Transfer Operasyonu",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Kat Hizmetlerinde Yönetim",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuk Gelişimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Hikâye ve Masal Anlatıcılığı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "kuyumculuk": {
   "11": [
    {
     "ders": "Takı Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Takı Tasarımı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Serbest Takı Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gemoloji",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil Dersi (Kuyumculuk Teknolojisi)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Takı Tasarımı ve Modelleme",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Takı Satışı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kuyumculukta Hasır Örme",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Materyallerle Takı İmalatı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Telkâri Takı Yapımı",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Mine Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Takı Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Takı Tasarımı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Serbest Takı Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gemoloji",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil Dersi (Kuyumculuk Teknolojisi)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Takı Tasarımı ve Modelleme",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Takı Satışı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kuyumculukta Hasır Örme",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İmitasyon Takı İmalatı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Telkâri Takı Yapımı",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Mine Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "laboratuvar": {
   "11": [
    {
     "ders": "Bitki Doku Kültürü ile Çoğaltma",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İmmünoloji ve Seroloji",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kalıntı Analizleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kontrollü Üretim Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Laboratuvar Araç Gereçleri Satış ve Tanıtım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Laboratuvar Kalite Yönetim Sistemi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tohumluk Analizleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Uçucu Yağ Üretimi ve Analizleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Bitki Doku Kültürü ile Çoğaltma",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İmmünoloji ve Seroloji",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kalıntı Analizleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kontrollü Üretim Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Laboratuvar Araç Gereçleri Satış ve Tanıtım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Laboratuvar Kalite Yönetim Sistemi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tohumluk Analizleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Uçucu Yağ Üretimi ve Analizleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "maden": {
   "11": [
    {
     "ders": "Mermer İmalat Teknikleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Mermer Meslek Resmi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mermer Plaka İmalatı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Malzeme Bilgisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mekanik İşlemler",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Mermer İmalat Teknikleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Mermer Meslek Resmi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mermer Plaka İmalatı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Malzeme Bilgisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mekanik İşlemler",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "makine": {
   "11": [
    {
     "ders": "Mekanizma Çizimleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Makine Elemanları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hidrolik-Pnömatik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Cerrahide 3D Tasarım ve Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tıbbi Cihaz Elektrik - Elektromekanik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tıbbi Alet Malzeme Yapısı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tersine Mühendislik ve Hassas Modellemeler",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ürün Tasarımı ve Protip Yapma",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kalıplama Tekniği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "CNC Tezgâhlarında Kalıp Üretimi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mermer İmalat Teknikleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Mermer Meslek Resmi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mermer Plaka İmalatı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ambalaj Tasarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mutfak Gereçleri Tasarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Web Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Makine ve Tasarım Teknolojisi)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Mekanizma Çizimleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Makine Elemanları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hidrolik-Pnömatik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Cerrahide 3D Tasarım ve Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tıbbi Cihaz Elektrik - Elektromekanik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tıbbi Alet Malzeme Yapısı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tersine Mühendislik ve Hassas Modellemeler",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ürün Tasarımı ve Protip Yapma",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kalıplama Tekniği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "CNC Tezgâhlarında Kalıp Üretimi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mermer İmalat Teknikleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Mermer Meslek Resmi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mermer Plaka İmalatı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ambalaj Tasarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mutfak Gereçleri Tasarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Web Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Makine ve Tasarım Teknolojisi)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "matbaa": {
   "11": [
    {
     "ders": "Montaj",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ambalaj",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Ciltleme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Flekso Baskı Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Letterpress Baskı Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tifdruk Baskı Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Serigrafi Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tampon Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Serigrafide Özel Baskılar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tipoda Farklı Baskı Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ofsette Farklı Baskı Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Tasarım",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Fotoğraf",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Teknik Resim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Fotoğraf Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Proje Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Montaj",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ambalaj",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Ciltleme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Flekso Baskı Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Letterpress Baskı Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tifdruk Baskı Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Serigrafi Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tampon Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Serigrafide Özel Baskılar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tipoda Farklı Baskı Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ofsette Farklı Baskı Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Tasarım",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Fotoğraf",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Teknik Resim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Fotoğraf Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Proje Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "metal": {
   "11": [
    {
     "ders": "Metal Yüzey ve Muayene İşlemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Malzeme Bilgisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Elektrik",
     "saat": 1,
     "seviye": "11-12"
    },
    {
     "ders": "Cisimlerin Dayanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Makina Elemanları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Isıl İşlem Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çelik Yapılandırma",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Düzey Metal İşleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Kaynak Yöntemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Doğrama Resmi İmalatı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Oksi-gaz Kaynağı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Sıcak Şekillendirme",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Metal Yüzey ve Muayene İşlemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Malzeme Bilgisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Elektrik",
     "saat": 1,
     "seviye": "11-12"
    },
    {
     "ders": "Cisimlerin Dayanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Makina Elemanları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Isıl İşlem Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çelik Yapılandırma",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Düzey Metal İşleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Kaynak Yöntemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Doğrama Resmi İmalatı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Oksi-gaz Kaynağı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Sıcak Şekillendirme",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "metalurji": {
   "11": [
    {
     "ders": "Isıl İşlem Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mekanik İşlemler",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Özel Döküm Yöntemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Elektrik",
     "saat": 1,
     "seviye": "11-12"
    },
    {
     "ders": "Toz Metalürjisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Basınçlı ve Kokil Döküm",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Isıl İşlem Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mekanik İşlemler",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Özel Döküm Yöntemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Elektrik",
     "saat": 1,
     "seviye": "11-12"
    },
    {
     "ders": "Toz Metalürjisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Basınçlı ve Kokil Döküm",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "mikromekanik": {
   "11": [
    {
     "ders": "Mekanizma Çizimleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Makine Elemanları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "AR-GE ve Kalite Kontrol",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hidrolik-Pnömatik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Cerrahide 3D Tasarım ve Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tersine Mühendislik ve Hassas Modellemeler",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ürün Tasarımı ve Prototip Yapma",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Mikromekanik)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Mekanizma Çizimleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Makine Elemanları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "AR-GE ve Kalite Kontrol",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hidrolik-Pnömatik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Cerrahide 3D Tasarım ve Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tersine Mühendislik ve Hassas Modellemeler",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ürün Tasarımı ve Prototip Yapma",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Mikromekanik)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "mobilya": {
   "11": [
    {
     "ders": "Bilgisayarlı İskelet Çizimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İskelet ve Ön Hazırlama",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Döşeme Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Döşemede Kesim ve Dikiş",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ahşap Oyuncak Yapımı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Ahşap Restorasyonu",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarlı Dış Mekân Doğrama Resmi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarlı İç Mekân Doğrama Resmi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarlı İş Yeri Mekân Tasarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarlı Mobilya Süsleme Resmi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İç Mekân Maketleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İç ve Dış Mekân Doğramaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Keşif ve Maliyet",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mobilya İskeleti ve Döşemesi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Mobilya Kontrol ve Pazarlama",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mobilya Montaj İşlemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mobilya Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Park ve Bahçe Mobilyaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Üst Yüzey İşlemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Ahşap Oyuncak Yapımı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Ahşap Restorasyonu",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarlı Dış Mekân Doğrama Resmi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarlı İç Mekân Doğrama Resmi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarlı İş Yeri Mekân Tasarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarlı Mobilya Süsleme Resmi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İç Mekân Maketleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İç ve Dış Mekân Doğramaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Keşif ve Maliyet",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mobilya İskeleti ve Döşemesi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Mobilya Kontrol ve Pazarlama",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mobilya Montaj İşlemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mobilya Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Park ve Bahçe Mobilyaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Üst Yüzey İşlemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "moda": {
   "11": [
    {
     "ders": "Portfolyo Hazırlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Tekstil Yüzeyleri ve Malzeme Bilgisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Makine Bakım Onarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Abiye Giysi Üretimi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayar Destekli Kalıp Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "İç Giyim Kalıp Tasarımı ve Üretimi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Drapaj",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Deri Giysi Üretimi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Kostüm Tasarımı ve Üretimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Moda Pazarlama",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuk Giyim Kalıp Tasarımı ve Üretimi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Ev Tekstil Tasarımı ve Üretimi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Görsel Mağazacılık",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Portfolyo Hazırlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Tekstil Yüzeyleri ve Malzeme Bilgisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Makine Bakım Onarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Abiye Giysi Üretimi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayar Destekli Kalıp Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "İç Giyim Kalıp Tasarımı ve Üretimi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Drapaj",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Deri Giysi Üretimi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Kostüm Tasarımı ve Üretimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Moda Pazarlama",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuk Giyim Kalıp Tasarımı ve Üretimi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Ev Tekstil Tasarımı ve Üretimi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Görsel Mağazacılık",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "motorluarac": {
   "11": [
    {
     "ders": "Hasarlı Araç İşlemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil Dersi (Motorlu Araçlar Teknolojisi)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Boya Koruma",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İş Makineleri Servisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Sac ve Gövde Kaynağı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Test Teknikleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Makine Elemanları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Cisimlerin Dayanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Periyodik Bakım",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Konfor Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Alternatif Motorlar ve Yakıt Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Yüzey Kaplama Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Emisyon Kontrol Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayar Destekli Çizim ve Tasarım",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yakıt Hücreli Araçlar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gövde Plastik Onarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Boyasız Göçük Düzeltme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Motor Yenileştirme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Asfalt Makineleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Beton Makineleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kaldırma ve İletme Makineleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Personel Yükseltici Platformlar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Hasarlı Araç İşlemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil Dersi (Motorlu Araçlar Teknolojisi)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Boya Koruma",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İş Makineleri Servisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Sac ve Gövde Kaynağı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Test Teknikleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Makine Elemanları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Cisimlerin Dayanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Periyodik Bakım",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Konfor Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Alternatif Motorlar ve Yakıt Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Yüzey Kaplama Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Emisyon Kontrol Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayar Destekli Çizim ve Tasarım",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yakıt Hücreli Araçlar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gövde Plastik Onarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Boyasız Göçük Düzeltme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Motor Yenileştirme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Asfalt Makineleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Beton Makineleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kaldırma ve İletme Makineleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Personel Yükseltici Platformlar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "muhasebe": {
   "11": [
    {
     "ders": "Bankacılık",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Finansal Okuryazarlık",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Kooperatifçilik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İnşaat Muhasebesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Dış Ticaret Girişimciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Hızlı Klavye Kullanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Halkla İlişkiler ve İletişim",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Ofis Uygulamaları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Emlak Yönetimi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Bankacılık",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Finansal Okuryazarlık",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Kooperatifçilik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İnşaat Muhasebesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Dış Ticaret Girişimciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Hızlı Klavye Kullanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Halkla İlişkiler ve İletişim",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Ofis Uygulamaları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Emlak Yönetimi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "pazarlama": {
   "11": [
    {
     "ders": "Zorunlu Sigortalar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tarım Sigortaları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Reklamcılık",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bankacılık",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Finansal Okuryazarlık",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bütünleşik Pazarlama İletişimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yeni Medyada Marka İletişimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Ofis Uygulamaları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Emlakçılık",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "E-Ticaret Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Pazarlamada Yeni Yaklaşımlar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Zorunlu Sigortalar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tarım Sigortaları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Reklamcılık",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bankacılık",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Finansal Okuryazarlık",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bütünleşik Pazarlama İletişimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yeni Medyada Marka İletişimi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Ofis Uygulamaları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Emlakçılık",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "E-Ticaret Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Pazarlamada Yeni Yaklaşımlar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "plastiksanatlar": {
   "11": [
    {
     "ders": "3 Boyutlu Yazıcı ve Tarayıcı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki resim",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Türk Plastik Sanatlar Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Üç Boyutlu Proje ve Anıt Tasarımı Dersi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dekoratif Sanatlar",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "3 Boyutlu Yazıcı ve Tarayıcı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki resim",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Türk Plastik Sanatlar Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Üç Boyutlu Proje ve Anıt Tasarımı Dersi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dekoratif Sanatlar",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "plastiktek": {
   "11": [
    {
     "ders": "Plastik Şişirme Teknolojisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Plastik Vakum Teknolojisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Termoset Kalıplama Teknolojisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hidrolik Pnömatik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Rotasyonel Kalıplama Teknolojisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Lastik Teknolojisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "3 boyutlu yazıcı ve tarayıcı dersi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Standart Makine Elemanları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Plastik Teknolojisi)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Plastik Şişirme Teknolojisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Plastik Vakum Teknolojisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Termoset Kalıplama Teknolojisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hidrolik Pnömatik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Rotasyonel Kalıplama Teknolojisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Lastik Teknolojisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "3 boyutlu yazıcı ve tarayıcı dersi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Standart Makine Elemanları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Plastik Teknolojisi)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "radyotv": {
   "11": [
    {
     "ders": "Nesne Canlandırma",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Animasyon Teknikleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kısa Film",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Kameramanlık",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Televizyonda Program Yapımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Fotoğraf",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Kitle İletişim Hukuku",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Medyada Habercilik",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Tasarım",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Diksiyon ve Etkili İletişim",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Drone Kullanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Nesne Canlandırma",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Animasyon Teknikleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kısa Film",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Kameramanlık",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Televizyonda Program Yapımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Fotoğraf",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Kitle İletişim Hukuku",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Medyada Habercilik",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Tasarım",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Diksiyon ve Etkili İletişim",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Drone Kullanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "radyotvpro": {
   "11": [
    {
     "ders": "Nesne Canlandırma",
     "saat": 4,
     "seviye": "11"
    },
    {
     "ders": "Animasyon Teknikleri",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Kısa Film",
     "saat": 4,
     "seviye": "11"
    },
    {
     "ders": "Sinema Tarihi",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Muhabirlik",
     "saat": 4,
     "seviye": "11"
    },
    {
     "ders": "Sosyal Medya Uygulamaları",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Web Tabanlı Uygulama",
     "saat": 3,
     "seviye": "11"
    },
    {
     "ders": "Mobil Uygulama Geliştirme",
     "saat": 3,
     "seviye": "11"
    },
    {
     "ders": "Kameramanlık",
     "saat": 3,
     "seviye": "11"
    },
    {
     "ders": "Televizyonda Program Yapımı",
     "saat": 4,
     "seviye": "11"
    },
    {
     "ders": "Dijital Fotoğraf",
     "saat": 4,
     "seviye": "11"
    },
    {
     "ders": "Kitle İletişim Hukuku",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Dijital Medyada Habercilik",
     "saat": 4,
     "seviye": "11"
    },
    {
     "ders": "Temel Tasarım",
     "saat": 3,
     "seviye": "11"
    },
    {
     "ders": "Diksiyon ve Etkili İletişim",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Drone Kullanımı",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11"
    }
   ]
  },
  "rayli": {
   "11": [
    {
     "ders": "Bilgisayar Destekli Çizim",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Cisimlerin Dayanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Demiryolu Emniyet Yönetim Sistemi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Demiryolu Güvenlik ve İletişim Sistemleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Haberleşme Şebeke Altyapısı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mikrodenetleyici ve Kodlama",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlanabilir Kontrol Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Raylı Sistem Araç Elektroniği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Raylı Sistem Araçları Meslek Resmi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Raylı Sistem Taşımacılığı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Raylı Sistemler Kapasite Yönetimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Raylı Sistemlerde İletişim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yüksek Gerilim Sistemleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Bilgisayar Destekli Çizim",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Cisimlerin Dayanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Demiryolu Emniyet Yönetim Sistemi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Demiryolu Güvenlik ve İletişim Sistemleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Haberleşme Şebeke Altyapısı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mikrodenetleyici ve Kodlama",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlanabilir Kontrol Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Raylı Sistem Araç Elektroniği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Raylı Sistem Araçları Meslek Resmi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Raylı Sistem Taşımacılığı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Raylı Sistemler Kapasite Yönetimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Raylı Sistemlerde İletişim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yüksek Gerilim Sistemleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "saglik": {
   "11": [
    {
     "ders": "Engelli Hizmetleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Engelli Bakımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Hidroterapi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Termal Uygulamalar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Klinik Egzersiz",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Afetle Mücadele",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki İngilizce (Hasta ve Yaşlı Hizmetleri/Sağlık Hizmetleri)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Almanca (Hasta ve Yaşlı Hizmetleri/Sağlık Hizmetleri)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Sigorta ve Finansmanı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Turizmi Merkezleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Turizmi Süreç Yönetimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Engelli Hizmetleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Engelli Bakımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Hidroterapi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Termal Uygulamalar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Klinik Egzersiz",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Afetle Mücadele",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki İngilizce (Hasta ve Yaşlı Hizmetleri/Sağlık Hizmetleri)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Almanca (Hasta ve Yaşlı Hizmetleri/Sağlık Hizmetleri)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Sigorta ve Finansmanı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Turizmi Merkezleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sağlık Turizmi Süreç Yönetimi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "siber": {
   "11": [
    {
     "ders": "Zararlı Yazılım Analizi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Güvenli Yazılım Geliştirme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bulut Bilişim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sunucu İşletim Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Web Programcılığı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Robotik ve Kodlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ağ Projesi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Blok Zinciri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Siber Güvenlik)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Nesnelerin İnterneti",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yapay Zekâ ve Makine Öğrenmesi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 3,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Robotik ve Kodlama",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Elektronik Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Mikrodenetleyici",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Web Programcılığı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Açık Kaynak İşletim Sistemi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Ağ Projesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Blok Zinciri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Nesnelerin İnterneti",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Oyun Programlama",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Web Tabanlı İçerik Yönetimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yapay Zekâ ve Makine Öğrenmesi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yazılım Projesi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "tarim": {
   "11": [
    {
     "ders": "Meyve Yetiştiriciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sebze Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Fidan Üretimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kültür Mantarı Yetiştiriciliği",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Çayır Mera ve Yem Bitkileri Yetiştiriciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstri Bitkileri Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tahıl Yetiştiriciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Tıbbi ve Aromatik Bitki Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çay Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Dış Mekân Süs Bitkileri Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İç Mekân Süs Bitkileri Yetiştiriciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Peyzaj",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çim Tesisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kendi Yürür Tarım Makineleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bitki Bakım Makineleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Traktöre Bağlanan Alet ve Makineler",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hassas Tarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Orman Gençleştirme ve Bakımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Bitki Sağlığı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Toprak Verimliliği ve Bitki Besleme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Tohum Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Meyve Yetiştiriciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sebze Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Fidan Üretimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kültür Mantarı Yetiştiriciliği",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Çayır Mera ve Yem Bitkileri Yetiştiriciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstri Bitkileri Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tahıl Yetiştiriciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Tıbbi ve Aromatik Bitki Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Çay Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Dış Mekân Süs Bitkileri Yetiştiriciliği",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İç Mekân Süs Bitkileri Yetiştiriciliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Peyzaj",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çim Tesisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kendi Yürür Tarım Makineleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bitki Bakım Makineleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Traktöre Bağlanan Alet ve Makineler",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hassas Tarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Orman Gençleştirme ve Bakımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Bitki Sağlığı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "tekstil": {
   "11": [
    {
     "ders": "Yapay İplik Üretimi Atölyesi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Fantezi İplik Üretim Atölyesi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tekstilde Üretim Takibi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Örme Kumaşlarda Kimyasal ve Fiziksel Testler",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Örme Model Geliştirme",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Tasarım",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Tekstil Teknik Resim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Teknik Tekstiller",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Yapay İplik Üretimi Atölyesi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Fantezi İplik Üretim Atölyesi",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tekstilde Üretim Takibi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Örme Kumaşlarda Kimyasal ve Fiziksel Testler",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Örmede Model Geliştirme",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Tasarım",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Tekstil Teknik Resim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Teknik Tekstiller",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "tesisat": {
   "11": [
    {
     "ders": "Endüstriyel Kazanlar",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Malzeme Bilgisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Biyogaz Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Doğal Gaz Alt Yapım ve İşletme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Isıtma Sistemleri Servisi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Su Arıtma ve Atık Su",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sıhhi Tesisat Servis",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Frigorifik Araç ve Araç Klimaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Taşıt İklimlendirmesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Genel Soğutma Sistemi Arıza Analizi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bacalar ve Yanma Verimliliği",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tesisat Sistemlerinde Enerji Verimliliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Isı Pompaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İç Hava Kalitesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Otomatik Kontrol",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Endüstriyel Kazanlar",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Malzeme Bilgisi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Biyogaz Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Doğal Gaz Alt Yapım ve İşletme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Isıtma Sistemleri Servisi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Su Arıtma ve Atık Su",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sıhhi Tesisat Servis",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Frigorifik Araç ve Araç Klimaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Taşıt İklimlendirmesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Genel Soğutma Sistemi Arıza Analizi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bacalar ve Yanma Verimliliği",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Tesisat Sistemlerinde Enerji Verimliliği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Isı Pompaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İç Hava Kalitesi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Otomatik Kontrol",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "ucak": {
   "11": [
    {
     "ders": "Pistonlu Motor ve Sistemleri Atölyesi (*)(**)",
     "saat": 2,
     "seviye": "11"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Havacılık Fiziği",
     "saat": 3,
     "seviye": "12"
    },
    {
     "ders": "Havacılık Matematiği",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "İnsansız Hava Araçları (İHA)",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "ulastirma": {
   "11": [
    {
     "ders": "Afet Lojistiği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kentsel Lojistik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "E-ticaret Lojistiği",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Fuar Lojistiği",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Proje Taşımacılığı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Drone Taşımacılığı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kargo ve Kurye",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Küresel Ulaştırma Stratejileri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sivil Havacılık",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Hava Yolunda İletişim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İş Hayatında İngilizce",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Afet Lojistiği",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kentsel Lojistik",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "E-ticaret Lojistiği",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Fuar Lojistiği",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Proje Taşımacılığı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Drone Taşımacılığı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kargo ve Kurye",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Küresel Ulaştırma Stratejileri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Sivil Havacılık",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Hava Yolunda İletişim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İş Hayatında İngilizce",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "yenilenebilir": {
   "11": [
    {
     "ders": "Fotovoltaik Araçlar ve Enerji Depolama Sistemleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Fotovoltaik Güç Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Fotovoltaik Sistem Projeleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "İleri PLC Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Rüzgâr Güç Sistemleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Fotovoltaik Araçlar ve Enerji Depolama Sistemleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Fotovoltaik Güç Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Fotovoltaik Sistem Projeleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "İleri PLC Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Rüzgâr Güç Sistemleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "yiyecek": {
   "11": [
    {
     "ders": "Simit Yapımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Pide Yapımı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ekmek Yapımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Perakende Paket Programları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Ürün Alımı ve Satışı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hızlı Hazır Yiyecekler",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Pasta Yapım Teknikleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Pastane Organizasyonu",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Baklavacılık",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Otobüs/Tren Hostesliği",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Coğrafi İşaret Tescilli Ürünlerle Yemekler Hazırlama",
     "saat": 8,
     "seviye": "11-12"
    },
    {
     "ders": "Sokak Lezzetleri",
     "saat": 8,
     "seviye": "11-12"
    },
    {
     "ders": "Füzyon Mutfağı",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Osmanlı Saray Mutfağı",
     "saat": 8,
     "seviye": "11-12"
    },
    {
     "ders": "Gastronomi Turizmi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Mutfak Akımları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sürdürülebilir Gastronomi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Profesyonel Kahve Hazırlayıcı (Barista)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Diyet Yiyecekleri Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Özel Gruplarda Beslenme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yöresel Yemekler",
     "saat": 8,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Servis Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Türk Mutfak Kültürü ve Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Dünya Mutfak Kültürü ve Uygulamaları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Fotoğraf Çekimi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Gastronomi ve Sosyal Medya",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kurum Beslenmesi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Almanca (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Fransızca (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Arapça (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Çince (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Korece (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Rusça (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Japonca (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Simit Yapımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Pide Yapımı",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ekmek Yapımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Perakende Paket Programları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Ürün Alımı ve Satışı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Hızlı Hazır Yiyecekler",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Pasta Yapım Teknikleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Pastane Organizasyonu",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Baklavacılık",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Otobüs/Tren Hostesliği",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Coğrafi İşaret Tescilli Ürünlerle Yemekler Hazırlama",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Sokak Lezzetleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Füzyon Mutfağı",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Osmanlı Saray Mutfağı",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Gastronomi Turizmi",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Mutfak Akımları",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Sürdürülebilir Gastronomi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Profesyonel Kahve Hazırlayıcısı (Barista)",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Diyet Yiyecekleri Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Özel Gruplarda Beslenme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Yöresel Yemekler",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "İleri Servis Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Türk Mutfak Kültürü ve Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Dünya Mutfak Kültürü ve Uygulamaları",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Fotoğraf Çekimi",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Gastronomi ve Sosyal Medya",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kurum Beslenmesi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Almanca (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Fransızca (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Arapça (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Çince (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Korece (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Rusça (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Japonca (*)",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "ayakkabipro": {
   "12": [
    {
     "ders": "Ayakkabı Kalıbı İmalatı",
     "saat": 3,
     "seviye": "12"
    },
    {
     "ders": "Ayakkabı Malzemesi Testleri",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Ayakkabı Tabanı İmalatı",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Ayakkabı Tasarımı",
     "saat": 7,
     "seviye": "12"
    },
    {
     "ders": "Ayakkabı ve Saraciye Makinelerinin Bakım ve Onarımı",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Deri Kalite Kontrolü",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "E-Ticaret",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Kösele Ürünleri",
     "saat": 4,
     "seviye": "12"
    },
    {
     "ders": "Mesleki Yabancı Dil",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Ortopedik Ayakkabı İmalatı",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Saraciye Tasarımı",
     "saat": 7,
     "seviye": "12"
    },
    {
     "ders": "Saraç Dikişi",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Tedarik Zinciri Yönetimi",
     "saat": 3,
     "seviye": "12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "12"
    }
   ]
  },
  "seramikpro": {
   "12": [
    {
     "ders": "Baskı Uygulamaları",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Bilgisayar Destekli Tasarım ve Üretim (CAD/CAM)",
     "saat": 3,
     "seviye": "12"
    },
    {
     "ders": "Bilgisayar Kontrollü Tezgâhlarda Üretim (CNC)",
     "saat": 4,
     "seviye": "12"
    },
    {
     "ders": "Çağdaş Form Uygulamaları",
     "saat": 5,
     "seviye": "12"
    },
    {
     "ders": "Çini Dekor Uygulamaları",
     "saat": 5,
     "seviye": "12"
    },
    {
     "ders": "Kumlama",
     "saat": 4,
     "seviye": "12"
    },
    {
     "ders": "Süsleme ve Tasarım",
     "saat": 3,
     "seviye": "12"
    },
    {
     "ders": "Tornada Form Şekillendirme",
     "saat": 5,
     "seviye": "12"
    },
    {
     "ders": "Vitray Uygulamaları",
     "saat": 4,
     "seviye": "12"
    },
    {
     "ders": "Yalıtımlı Cam ve Kaplama",
     "saat": 3,
     "seviye": "12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "12"
    }
   ]
  },
  "basim": {
   "11": [
    {
     "ders": "Montaj",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ambalaj",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Ciltleme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Flekso Baskı Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Letterpress Baskı Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tifdruk Baskı Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Serigrafi Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tampon Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Serigrafide Özel Baskılar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tipoda Farklı Baskı Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ofsette Farklı Baskı Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Tasarım",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Fotoğraf",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Teknik Resim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Fotoğraf Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Proje Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Montaj",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ambalaj",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Endüstriyel Ciltleme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Flekso Baskı Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Letterpress Baskı Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tifdruk Baskı Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Serigrafi Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tampon Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Serigrafide Özel Baskılar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Tipoda Farklı Baskı Teknikleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Ofsette Farklı Baskı Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Tasarım",
     "saat": 6,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Fotoğraf",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Teknik Resim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Fotoğraf Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Proje Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "otomotiv": {
   "11": [
    {
     "ders": "Hasarlı Araç İşlemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil Dersi (Motorlu Araçlar Teknolojisi)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Boya Koruma",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İş Makineleri Servisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Sac ve Gövde Kaynağı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Test Teknikleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Makine Elemanları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Cisimlerin Dayanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Periyodik Bakım",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Konfor Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Alternatif Motorlar ve Yakıt Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Yüzey Kaplama Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Emisyon Kontrol Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayar Destekli Çizim ve Tasarım",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yakıt Hücreli Araçlar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gövde Plastik Onarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Boyasız Göçük Düzeltme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Motor Yenileştirme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Asfalt Makineleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Beton Makineleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kaldırma ve İletme Makineleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Personel Yükseltici Platformlar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Hasarlı Araç İşlemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil Dersi (Motorlu Araçlar Teknolojisi)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Boya Koruma",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "İş Makineleri Servisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Sac ve Gövde Kaynağı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Test Teknikleri",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Makine Elemanları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Cisimlerin Dayanımı",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Periyodik Bakım",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Konfor Sistemleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Alternatif Motorlar ve Yakıt Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Yüzey Kaplama Uygulamaları",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Emisyon Kontrol Sistemleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayar Destekli Çizim ve Tasarım",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yakıt Hücreli Araçlar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Gövde Plastik Onarımı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Boyasız Göçük Düzeltme",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Otomotiv Motor Yenileştirme",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Asfalt Makineleri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Beton Makineleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Kaldırma ve İletme Makineleri",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Personel Yükseltici Platformlar",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "sh": {
   "11": [
    {
     "ders": "Aile Ekonomisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuk Aktiviteleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yaşlılıkta Uyum",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yöresel Türk Mutfağı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Profesyonel Satış Becerileri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Pazarlama İletişimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kurumsal İletişim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Aile Kaynakları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Atıklar",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ev Hizmetleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İş Hayatında İletişim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İletişimde Etkili Drama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Geri Dönüşümlü Ambalajlar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sofra Düzenleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Konut Edinme ve Düzenleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Toplum ve Aile",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yaşadığımız Çevre",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yemek Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Sosyal Destek Hizmetleri)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Tüketici Hizmetleri)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Aile Ekonomisi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Çocuk Aktiviteleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yaşlılıkta Uyum",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yöresel Türk Mutfağı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Profesyonel Satış Becerileri",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Pazarlama İletişimi",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Kurumsal İletişim",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Aile Kaynakları",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Atıklar",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Ev Hizmetleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "İş Hayatında İletişim",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İletişimde Etkili Drama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Geri Dönüşümlü Ambalajlar",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sofra Düzenleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Konut Edinme ve Düzenleme",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Toplum ve Aile",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yaşadığımız Çevre",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Yemek Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Sosyal Destek Hizmetleri)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Mesleki Yabancı Dil (Tüketici Hizmetleri)",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  },
  "grafikpro": {
   "11": [
    {
     "ders": "Grafik ve Fotoğraf Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İletişim Araçlarında Fotoğraf",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Karanlık Oda",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Özgün Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Portfolyo Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Proje Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Sanat Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Animasyon Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Belgesel Fotoğraf",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Fotoğraf Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Desen Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Web Arayüz Tasarımı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ],
   "12": [
    {
     "ders": "Grafik ve Fotoğraf Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "İletişim Araçlarında Fotoğraf",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Karanlık Oda",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Özgün Baskı",
     "saat": 4,
     "seviye": "11-12"
    },
    {
     "ders": "Portfolyo Hazırlama",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Proje Teknikleri",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Temel Sanat Tarihi",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Animasyon Teknikleri",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Belgesel Fotoğraf",
     "saat": 7,
     "seviye": "11-12"
    },
    {
     "ders": "Bilgisayarda Fotoğraf Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Desen Uygulamaları",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Web Arayüz Tasarımı",
     "saat": 5,
     "seviye": "11-12"
    },
    {
     "ders": "Programlama",
     "saat": 3,
     "seviye": "11-12"
    },
    {
     "ders": "Dijital Tasarım",
     "saat": 2,
     "seviye": "11-12"
    },
    {
     "ders": "Sosyal Medya",
     "saat": 2,
     "seviye": "11-12"
    }
   ]
  }
 },
 "mesem": {
  "ayakkabi_ve_saraciye_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "buro_yonetimi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "elektrik_elektronik_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "el_sanatlari_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "endustriyel_otomasyon_teknolojileri": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "gemi_yapimi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "grafik_ve_fotograf": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "guzellik_ve_sac_bakim_hizmetleri": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "harita_tapu_kadastro": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "hayvan_yetistiriciligi_ve_sagligi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "insaat_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "kimya_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "konaklama_ve_seyahat_hizmetleri": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "kuyumculuk_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "makine_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "matbaa_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "moda_tasarim_teknolojileri": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "motorlu_araclar_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "muhasebe_ve_finansman": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "muzik_aletleri_yapimi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "plastik_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "seramik_ve_cam_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "tekstil_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "tesisat_teknolojisi_ve_iklimlendirme": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "ulastirma_hizmetleri": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "yiyecek_icecek_hizmetleri": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "bilisim_teknolojileri": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "denizcilik": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "gida_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "konaklama_ve_seyahat_hizmetleri_protokol": {
   "11": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "metal_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "mobilya_ve_ic_mekan_tasarimi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "pazarlama_ve_perakende": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "tarim": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "yiyecek_icecek_hizmetleri_protokol": {
   "11": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "metalurji_teknolojisi": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "siber_guvenlik": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  },
  "yenilenebilir_enerji_teknolojileri_protokol": {
   "9": [
    {
     "ders": "Kur'an-ı Kerim",
     "adHam": "KUR'AN-I KERİM",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "adHam": "PEYGAMBERİMİZİN HAYATI",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "adHam": "TEMEL DİNÎ BİLGİLER",
     "grup": "Din, Ahlak ve Değerler",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Beden Eğitimi ve Spor",
     "adHam": "SEÇMELİ BEDEN EĞİTİMİ VE SPOR",
     "grup": "Spor ve Sosyal Etkinlik",
     "saatler": [
      2
     ]
    },
    {
     "ders": "Seçmeli Görsel Sanatlar",
     "adHam": "SEÇMELİ GÖRSEL SANATLAR",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Seçmeli Müzik",
     "adHam": "SEÇMELİ MÜZİK",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1,
      2
     ]
    },
    {
     "ders": "Drama",
     "adHam": "DRAMA",
     "grup": "Güzel Sanatlar",
     "saatler": [
      1
     ]
    }
   ]
  }
 },
 "meslek_ortaokulu": {
  "karar": "TTKB 04/09/2025-74 (5 ve 6. sınıftan kademeli)",
  "siniflar": {
   "6": [
    {
     "ders": "Matematik ve Bilim Uygulamaları",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Okuma Becerileri",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Yazarlık ve Yazma Becerileri",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Yaşayan Diller ve Lehçeler",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Yabancı Dil",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Çevre Eğitimi ve İklim Değişikliği",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "\"Şehrimiz ...\"",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Hukuk ve Adalet",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Robotik Kodlama",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Proje Tasarımı ve Uygulamaları",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 3
    },
    {
     "ders": "Okul Temelli Sosyal Sorumluluk Çalışmaları",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 3
    },
    {
     "ders": "Afet Bilinci",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Temel Yaşam Becerileri",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Türk Sosyal Hayatında Aile",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Kur’an-ı Kerim",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Kültür ve Medeniyetimize Yön Verenler",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Ahlak ve Vatandaşlık Eğitimi",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Görgü Kuralları ve Nezaket",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Müzik",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Spor ve Fizikî Etkinlikler",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Oyun ve Oyun Etkinlikleri",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Dijital Sanatlar",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Masal ve Destanlarımız",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Geleneksel Sanatlar",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Halk Oyunları",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 4
    }
   ],
   "7": [
    {
     "ders": "Matematik ve Bilim Uygulamaları",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Yazarlık ve Yazma Becerileri",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Yaşayan Diller ve Lehçeler",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Yabancı Dil",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Çevre Eğitimi ve İklim Değişikliği",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "\"Şehrimiz ...\"",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Hukuk ve Adalet",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Düşünme Eğitimi",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Yapay Zekâ Uygulamaları",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Proje Tasarımı ve Uygulamaları",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 3
    },
    {
     "ders": "Okul Temelli Sosyal Sorumluluk Çalışmaları",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 3
    },
    {
     "ders": "Medya Okuryazarlığı",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Afet Bilinci",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Temel Yaşam Becerileri",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Türk Sosyal Hayatında Aile",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Kur’an-ı Kerim",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Kültür ve Medeniyetimize Yön Verenler",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Ahlak ve Vatandaşlık Eğitimi",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Görgü Kuralları ve Nezaket",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Müzik",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Spor ve Fizikî Etkinlikler",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Oyun ve Oyun Etkinlikleri",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Dijital Sanatlar",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Masal ve Destanlarımız",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Geleneksel Sanatlar",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Halk Oyunları",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 4
    }
   ],
   "5": [
    {
     "ders": "Okuma Becerileri",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Yazarlık ve Yazma Becerileri",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Yaşayan Diller ve Lehçeler",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Yabancı Dil",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "\"Şehrimiz ...\"",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Robotik Kodlama",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Proje Tasarımı ve Uygulamaları",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 3
    },
    {
     "ders": "Afet Bilinci",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Temel Yaşam Becerileri",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Türk Sosyal Hayatında Aile",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Kur’an-ı Kerim",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Kültür ve Medeniyetimize Yön Verenler",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Ahlak ve Vatandaşlık Eğitimi",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Görgü Kuralları ve Nezaket",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Müzik",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Spor ve Fizikî Etkinlikler",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Oyun ve Oyun Etkinlikleri",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Masal ve Destanlarımız",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      1,
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Halk Oyunları",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 4
    }
   ],
   "8": [
    {
     "ders": "Yazarlık ve Yazma Becerileri",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Yaşayan Diller ve Lehçeler",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Yabancı Dil",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Çevre Eğitimi ve İklim Değişikliği",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "\"Şehrimiz ...\"",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Hukuk ve Adalet",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Düşünme Eğitimi",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Yapay Zekâ Uygulamaları",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Okul Temelli Sosyal Sorumluluk Çalışmaları",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 3
    },
    {
     "ders": "Medya Okuryazarlığı",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Temel Yaşam Becerileri",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Türk Sosyal Hayatında Aile",
     "grup": "İnsan, Toplum ve Bilim",
     "saatler": [
      2
     ],
     "kacKez": 1
    },
    {
     "ders": "Kur’an-ı Kerim",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Peygamberimizin Hayatı",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Temel Dinî Bilgiler",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Kültür ve Medeniyetimize Yön Verenler",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Ahlak ve Vatandaşlık Eğitimi",
     "grup": "Din, Ahlak ve Değer",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Görgü Kuralları ve Nezaket",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Müzik",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Spor ve Fizikî Etkinlikler",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 4
    },
    {
     "ders": "Masal ve Destanlarımız",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 2
    },
    {
     "ders": "Halk Oyunları",
     "grup": "Kültür, Sanat ve Spor",
     "saatler": [
      2
     ],
     "kacKez": 4
    }
   ]
  },
  "kural": "İnsan, Toplum ve Bilim / Din, Ahlak ve Değer / Kültür, Sanat ve Spor gruplarının her birinden her yıl birer ders seçmesi zorunludur."
 }
};

/* ===========================================================================
   OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN
   Üreteç : tools/uret_ozel_egitim.py
   Kaynak : ORGM resmî haftalık ders çizelgeleri (27.08.2026)
            https://orgm.meb.gov.tr/www/haftalik-ders-cizelgeleri/icerik/3106

   Özel eğitim müfredatı 28.08.2026'ya kadar curriculumEngine.js içinde
   ELLE YAZILMIŞ 8 dersti ve hiçbir resmî çizelgeden üretilmemişti.
   Yanlışları birbirini götürdüğü için TOPLAM 30 saat çıkıyor, okul
   toplamı doğru görünüyordu; branş dağılımı ise yanlıştı — Müzik
   öğretmeninin yükü hiç görünmüyordu.

   Yapı: OZEL_EGITIM_CIZELGELERI[çizelge][sınıf] = [ ders kayıtları ]
     meslek_okulu      -> 9-12. sınıf (Özel Eğitim Meslek Okulu)
     ilkokul_ortaokul  -> 1-8. sınıf
   ======================================================================== */
const OZEL_EGITIM_CIZELGELERI = {
    "meslek_okulu": {
        "9": [   // 9 ders
            { ders: "Türkçe", saat: 3, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 2, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Sosyal Hayat", saat: 2, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 1, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 2, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 2, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Rehberlik", saat: 1, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "İş Eğitimi ve Meslek Ahlakı", saat: 15, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: true },
        ],
        "10": [   // 9 ders
            { ders: "Türkçe", saat: 3, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 2, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Sosyal Hayat", saat: 2, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 1, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 2, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 2, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Rehberlik", saat: 1, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "İş Eğitimi ve Meslek Ahlakı", saat: 15, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: true },
        ],
        "11": [   // 10 ders
            { ders: "Türkçe", saat: 3, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 2, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Sosyal Hayat", saat: 2, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 1, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi", saat: 1, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Rehberlik", saat: 1, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Sosyal, Kültürel ve Sportif Faaliyetler", saat: 3, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "İş Eğitimi ve Meslek Ahlakı", saat: 15, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: true },
        ],
        "12": [   // 10 ders
            { ders: "Türkçe", saat: 3, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 2, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Sosyal Hayat", saat: 2, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 1, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi", saat: 1, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Rehberlik", saat: 1, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Sosyal, Kültürel ve Sportif Faaliyetler", saat: 3, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "İş Eğitimi ve Meslek Ahlakı", saat: 15, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: true },
        ]
    },
    "ilkokul_ortaokul": {
        "1": [   // 7 ders
            { ders: "Türkçe", saat: 10, atananBrans: "Türkçe", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Hayat Bilgisi", saat: 4, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi ve Oyun", saat: 4, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Toplumsal Uyum Becerileri", saat: 1, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
        ],
        "2": [   // 7 ders
            { ders: "Türkçe", saat: 10, atananBrans: "Türkçe", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Hayat Bilgisi", saat: 4, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi ve Oyun", saat: 4, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Toplumsal Uyum Becerileri", saat: 1, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
        ],
        "3": [   // 8 ders
            { ders: "Türkçe", saat: 8, atananBrans: "Türkçe", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Hayat Bilgisi", saat: 3, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Fen Bilimleri", saat: 3, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi ve Oyun", saat: 4, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Toplumsal Uyum Becerileri", saat: 1, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
        ],
        "4": [   // 11 ders
            { ders: "Türkçe", saat: 8, atananBrans: "Türkçe", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Fen Bilimleri", saat: 3, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 1, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 1, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi ve Oyun", saat: 1, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Toplumsal Uyum Becerileri", saat: 1, atananBrans: "Özel Eğitim", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Trafik Güvenliği", saat: 1, atananBrans: "Sınıf Öğretmenliği", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "İnsan Hakları, Vatandaşlık ve Demokrasi", saat: 2, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
        ],
        "5": [   // 10 ders
            { ders: "Türkçe", saat: 7, atananBrans: "Türkçe", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 2, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 2, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, atananBrans: "Bilişim Teknolojileri", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
        ],
        "6": [   // 10 ders
            { ders: "Türkçe", saat: 7, atananBrans: "Türkçe", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 2, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 2, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Bilişim Teknolojileri ve Yazılım", saat: 2, atananBrans: "Bilişim Teknolojileri", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
        ],
        "7": [   // 10 ders
            { ders: "Türkçe", saat: 7, atananBrans: "Türkçe", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Sosyal Bilgiler", saat: 3, atananBrans: "Sosyal Bilgiler", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 2, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 2, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Teknoloji ve Tasarım", saat: 2, atananBrans: "Teknoloji ve Tasarım", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
        ],
        "8": [   // 10 ders
            { ders: "Türkçe", saat: 7, atananBrans: "Türkçe", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Matematik", saat: 5, atananBrans: "Matematik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Fen Bilimleri", saat: 4, atananBrans: "Fen Bilimleri", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "T.C. İnkılâp Tarihi ve Atatürkçülük", saat: 2, atananBrans: "T.C. İnkılap Tarihi ve Atatürkçülük", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Görsel Sanatlar", saat: 2, atananBrans: "Görsel Sanatlar", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Müzik", saat: 2, atananBrans: "Müzik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Teknoloji ve Tasarım", saat: 2, atananBrans: "Teknoloji ve Tasarım", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
            { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik", kategori: "ORTAK DERSLER", baraj_ders: false, isAtolye: false },
        ]
    }
};

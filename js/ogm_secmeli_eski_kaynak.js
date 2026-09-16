/* ===========================================================================
   OGM SEÇMELİ DERS KAYNAĞI (ESKİ) — 16.09.2026

   Kaynak: data/meb_master_db.json -> okul_turleri_ve_cizelgeler
           .ortaogretim_genel_mudurlugu_ogm.dosyalar (yalnız seçmeli gruplar).
   Asıl dosya bozuk ve bayat olduğu için kaldırıldı (Denetim Dalga 2 V-02/V-03/V-04);
   arşivi: _ARSIV/eski_veritabani_yedekleri/meb_master_db_KALDIRILDI_20260916.json

   NEDEN HÂLÂ VAR: uiComponents.getAvailableElectivesForSection 4. adımı, kendi
   seçmeli havuzu OLMAYAN okul türlerine (meslek lisesi, Anadolu teknik programı,
   MESEM, meslek ortaokulu, özel eğitim) kültür seçmelilerini buradan sunuyor.
   Dosya kaldırılınca bu listeler sessizce küçülüyordu (ör. MTAL 11 güzellik 121 -> 19).
   Davranışı DEĞİŞTİRMEMEK için yapı aynı sırayla buraya çıkarıldı.

   ⚠️ DOĞRULUĞU AYRICA KARAR BEKLİYOR: içinde mülga 2018 OGM çizelgesinden gelen
   dersler var ve özel eğitim uygulama okulunun ortaokul sınıflarına lise seçmelileri
   sunuluyor. Bu dosya bir düzeltme değil, davranış koruyan bir taşımadır.
   Üreteç: scratchpad yama_27 (tek seferlik çıkarım).
   ======================================================================== */
const OGM_SECMELI_ESKI_KAYNAK = {
 "Anadolu_Lisesi_Haftalık_Ders_Çizelgesi_Fen_Lisesi_Haftalık_D.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "6",
         "12": "6"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(5)",
         "12": "(3)(5)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(10)(12)",
         "12": "(2)(10)(12)"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "(2)(3)",
         "10": "(2)(3)",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "(1)(2)(3)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "(2)(3)(4)",
         "10": "(2)(3)(4)",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(1)(2)(4)",
         "10": "(1)(2)(4)",
         "11": "(1)(2)(4)",
         "12": "(1)(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)(3)",
         "10": "(1)(2)(3)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)(3)",
         "10": "(1)(2)(3)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "6",
         "12": "6"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(3)(5)",
         "12": "(3)(5)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(10)(12)",
         "12": "(2)(10)(12)"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(2)(3)",
         "10": "(2)(3)",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "(1)(2)(3)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(2)(3)(4)",
         "10": "(2)(3)(4)",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)(4)",
         "10": "(1)(2)(4)",
         "11": "(1)(2)(4)",
         "12": "(1)(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)(3)",
         "10": "(1)(2)(3)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)(3)",
         "10": "(1)(2)(3)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Genetik Bilimine Giriş",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Tıp Bilimine Giriş",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "(2)(3)",
         "10": "2",
         "11": "2",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "(1)(2)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "(2)(3)",
         "10": "2",
         "11": "2",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(1)(2)(3)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)(3)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)(3)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Genetik Bilimine Giriş",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Tıp Bilimine Giriş",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(2)(3)",
         "10": "(2)(3)",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)(3)",
         "10": "(1)(2)(3)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(2)(3)(4)",
         "10": "(2)(3)(4)",
         "11": "(2)(3)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)(4)",
         "10": "(1)(2)(4)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)(3)",
         "10": "(1)(2)(3)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)(3)",
         "10": "(1)(2)(3)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Edebiyat Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "(1)(2)",
         "12": "2"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "(2)(3)(4)",
         "10": "2",
         "11": "(1)(2)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(1)(2)(4)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)(3)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)(3)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Edebiyat Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "(1)(2)",
         "12": "2"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "hazirlik": "1",
         "9": "1",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "(2)(3)",
         "9": "(2)(3)(4)",
         "10": "2",
         "11": "(1)(2)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)(3)",
         "9": "(2)(3)(4)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "hazirlik": "2",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)(3)",
         "9": "(1)(2)(3)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "hazirlik": "(1)(2)(3)",
         "9": "(1)(2)(3)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   }
  ]
 },
 "Güzel_Sanatlar_Liseleri_Haftalık_Ders_Çizelgeleri039nde_Deği.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "6",
         "12": "6"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "3",
         "12": "(3)(5)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "BİREYSEL SES EĞİTİMİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "GELENEKSEL TÜRK SANATLARI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "6",
         "12": "6"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "3",
         "12": "(3)(5)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "TEMEL DESEN",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   }
  ]
 },
 "Güzel_Sanatlar_Liseleri_Haftalık_Ders_Çizelgeleri_2023-2024_.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "6",
         "12": "6"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "3",
         "12": "(3)(5)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "BİREYSEL SES EĞİTİMİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "GELENEKSEL TÜRK SANATLARI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "6",
         "12": "6"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "3",
         "12": "(3)(5)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "TEMEL DESEN",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   }
  ]
 },
 "Güzel_Sanatlar_Liseleri_quotMüzik_HDÇquot_quotTürk_Müziği_HD.pdf": {
  "haftalik_ders_cizelgeleri": []
 },
 "Güzel_Sanatlar_Liseleri_quotMüzik_Haftalık_Ders_Çizelgesiquo.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(4)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "BİLİŞİM DESTEKLİ MÜZİK",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ BATI MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK SANAT MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK HALK MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK HALK MÜZİĞİ KORO",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK SANAT MÜZİĞİ KORO",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ PİYANO",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "TOPLU SES EĞİTİMİ",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK MÜZİĞİ TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "ÇALGI BAKIM VE ONARIMI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "MÜZİK KÜLTÜRÜ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "HALK DANSLARI VE MÜZİKLERİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "(2)",
         "10": "(2)",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "(1)(2)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "(2)",
         "10": "(2)",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(2)",
         "10": "(2)",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(4)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK SANAT MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK HALK MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ BATI MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK HALK MÜZİĞİ KORO",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK SANAT MÜZİĞİ KORO",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "BİLİŞİM DESTEKLİ MÜZİK",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "TOPLU SES EĞİTİMİ",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK VE BATI MÜZİĞİ TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "ÇALGI BAKIM VE ONARIMI",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "MÜZİK KÜLTÜRÜ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "HALK DANSLARI VE MÜZİKLERİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "(2)",
         "10": "(2)",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "(1)(2)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "(2)",
         "10": "(2)",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(2)",
         "10": "(2)",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(4)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "TEMEL DESEN",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "DESEN ÇALIŞMALARI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Dijital Grafik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "GELENEKSEL TÜRK SANATLARI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "ENDÜSTRİYEL TASARIM",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "FOTOĞRAF",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "MÜZE EĞİTİMİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "(1)(2)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(4)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "BİREYSEL SES EĞİTİMİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "GELENEKSEL TÜRK SANATLARI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "(1)(2)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   }
  ]
 },
 "Güzel_Sanatlar_Lisesi_Görsel_Sanatlar_Haftalık_Ders_Çizelges.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "3",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "TEMEL DESEN",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "DESEN ÇALIŞMALARI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Dijital Grafik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "GELENEKSEL TÜRK SANATLARI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "ENDÜSTRİYEL TASARIM",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "FOTOĞRAF",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "MÜZE EĞİTİMİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "(2)(3)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(2)(3)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "1",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(4)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "BİREYSEL SES EĞİTİMİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "GELENEKSEL TÜRK SANATLARI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "1",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   }
  ]
 },
 "Güzel_Sanatlar_Lisesi_Görsel_Sanatlar_ile_Tiyatro_Bölümleri_.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "1",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "(1)",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "1",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "(1)",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "(1)",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "1",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   }
  ]
 },
 "Güzel_Sanatlar_Lisesi_Müzik_Haftalık_Ders_Çizelgesi_ve_Güzel.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(4)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "BİLİŞİM DESTEKLİ MÜZİK",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ BATI MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK SANAT MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK HALK MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK HALK MÜZİĞİ KORO",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK SANAT MÜZİĞİ KORO",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ PİYANO",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "TOPLU SES EĞİTİMİ",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK MÜZİĞİ TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "ÇALGI BAKIM VE ONARIMI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "MÜZİK KÜLTÜRÜ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "HALK DANSLARI VE MÜZİKLERİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "1",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(4)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK SANAT MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK HALK MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ BATI MÜZİĞİ TEORİ VE UYGULAMASI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK HALK MÜZİĞİ KORO",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "SEÇMELİ TÜRK SANAT MÜZİĞİ KORO",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "BİLİŞİM DESTEKLİ MÜZİK",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "TOPLU SES EĞİTİMİ",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK VE BATI MÜZİĞİ TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "ÇALGI BAKIM VE ONARIMI",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "MÜZİK KÜLTÜRÜ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "HALK DANSLARI VE MÜZİKLERİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Matematik Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "1",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   }
  ]
 },
 "Güzel_Sanatlar_Lisesi_Müzik_Türk_Halk_Müziği_ve_Türk_Sanat_M.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "-"
        }
       },
       {
        "ders": "Diksiyon ve Hitabet",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "2",
         "12": "-"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "2",
         "12": "-"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "1",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "(1)",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "1",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "(1)",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       }
      ]
     },
     {
      "grup_adi": "SOSYAL BİLİMLER",
      "dersler": [
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "",
         "12": ""
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   }
  ]
 },
 "Ortaöğretim_Kurumları_Haftalık_Ders_Çizelgeleri-2018.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(5)",
         "12": "(3)(5)"
        }
       },
       {
        "ders": "Diksiyon ve Hitabet",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "6",
         "12": "6"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Matematik Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Fen Bilimleri Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "3",
         "11": "3",
         "12": "3"
        }
       }
      ]
     },
     {
      "grup_adi": "SOSYAL BİLİMLER",
      "dersler": [
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Bilgi Kuramı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "İŞLEĞİTİME",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Ekonomi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Yönetim Bilimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Uluslararası İlişkiler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "YABANCI DİLLER",
      "dersler": [
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(2)(4)",
         "10": "(2)(4)",
         "11": "(2)(10)",
         "12": "(2)(10)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(2)(4)",
         "10": "(2)(4)",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Yabancı Diller Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Beden Eğitimi ve Spor",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyal Etkinlik",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Görsel Sanatlar",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Müzik",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sanat Tarihi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Drama",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Bilgisayar Bilimi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Proje Hazırlama",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(3)(5)",
         "12": "(3)(5)"
        }
       },
       {
        "ders": "Diksiyon ve Hitabet",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "6",
         "12": "6"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Matematik Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Fen Bilimleri Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "3",
         "11": "3",
         "12": "3"
        }
       }
      ]
     },
     {
      "grup_adi": "SOSYAL BİLİMLER",
      "dersler": [
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Bilgi Kuramı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "İŞLEĞİTİME",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Ekonomi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Yönetim Bilimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Uluslararası İlişkiler",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "YABANCI DİLLER",
      "dersler": [
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(2)(4)",
         "10": "(2)(4)",
         "11": "(2)(10)",
         "12": "(2)(10)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(2)(4)",
         "10": "(2)(4)",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Yabancı Diller Edebiyatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Beden Eğitimi ve Spor",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sosyal Etkinlik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Görsel Sanatlar",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Müzik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sanat Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Drama",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Proje Hazırlama",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "3",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Diksiyon ve Hitabet",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "SOSYAL BİLİMLER",
      "dersler": [
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Bilgi Kuramı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "İŞLEĞİTİME",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Ekonomi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Yönetim Bilimi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Uluslararası İlişkiler",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "YABANCI DİLLER",
      "dersler": [
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(2)(4)",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(2)(4)",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Yabancı Diller Edebiyatı",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli Beden Eğitimi ve Spor",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Sosyal Etkinlik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli Görsel Sanatlar",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli Müzik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Drama",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Proje Hazırlama",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "SOSYAL BİLİMLER",
      "dersler": [
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Bilgi Kuramı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "1"
        }
       },
       {
        "ders": "İŞLEĞİTİME",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Ekonomi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "-",
         "11": "-",
         "12": "1"
        }
       },
       {
        "ders": "Yönetim Bilimi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Uluslararası İlişkiler",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "YABANCI DİLLER",
      "dersler": [
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Yabancı Diller Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Beden Eğitimi ve Spor",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Sosyal Etkinlik",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Müzik",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Sanat Tarihi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Dijital Grafik",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "FOTOĞRAF",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Bilgisayar Bilimi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Proje Hazırlama",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "-",
         "11": "-",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "SOSYAL BİLİMLER",
      "dersler": [
       {
        "ders": "İŞLEĞİTİME",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Ekonomi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Yönetim Bilimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Uluslararası İlişkiler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "YABANCI DİLLER",
      "dersler": [
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Yabancı Diller Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Etkinlik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Müzik",
        "sinif_ders_saatleri": {
         "9": "",
         "10": "",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Görsel Sanatlar",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Sanat Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Drama",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Bilgisayar Bilimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Proje Hazırlama",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Fıkıh Okumaları",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Tefsir Okumaları",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "-",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Hadis Metinleri",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "İslam Ahlakı",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1)",
         "12": "(1)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Kur'an Okuma Teknikleri",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Arapça (Metin-Mükâleme)",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Mesleki Uygulama",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "-",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "İslam Tarihi",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Ahlak ve Tasavvuf Kültürü",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1)",
         "12": "(1)"
        }
       },
       {
        "ders": "DİNÎ MUSİKİ",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "HÜSN-İ HAT",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "EBRU",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "TEZHİP",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "\u0015 \u0003(3) (4) (5",
         "12": "\u0015 (3) (4) (5)"
        }
       },
       {
        "ders": "Diksiyon ve Hitabet",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1)",
         "12": "(1)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "10": "(1) (2)",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Seçmeli Temel Matematik",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(3)(4)(5)(6)",
         "12": "(3)(4)(5)(6)"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(3) (4)",
         "12": "(3) (4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(3) (4)",
         "12": "(3) (4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2) (3) (4)",
         "12": "(2) (3) (4)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "10": "(1) (2)",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Matematik Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "10": "(2)",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Fen Bilimleri Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "10": "(2)",
         "11": "(2) (3)",
         "12": "(2) (3)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2) (3) (4)",
         "12": "(2) (3) (4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2) (3) (4)",
         "12": "(2) (3) (4)"
        }
       },
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2) (3) (4)",
         "12": "(2) (3) (4)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "10": "(1) (2)",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Bilgi Kuramı",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1)",
         "12": "(1)"
        }
       },
       {
        "ders": "İŞLEĞİTİME",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Ekonomi",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1)",
         "12": "(1)"
        }
       },
       {
        "ders": "Yönetim Bilimi",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Uluslararası İlişkiler",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "10": "(2)",
         "11": "(2) (8) (10)",
         "12": "(2) (8) (10)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "10": "(2)",
         "11": "(2) (4) (6)",
         "12": "(2) (4) (6)"
        }
       },
       {
        "ders": "YABANCI DİL EDEBİYATLARI",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "FARSÇA",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Seçmeli Beden Eğitimi ve Spor",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "Sosyal Etkinlik",
        "sinif_ders_saatleri": {
         "10": "",
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "Seçmeli Görsel Sanatlar",
        "sinif_ders_saatleri": {
         "10": "(1) (2)",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Seçmeli Müzik",
        "sinif_ders_saatleri": {
         "10": "(1) (2)",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Sanat Tarihi",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Drama",
        "sinif_ders_saatleri": {
         "10": "(1)",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Bilgisayar Bilimi",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Proje Hazırlama",
        "sinif_ders_saatleri": {
         "10": "-",
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Fıkıh Okumaları",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Tefsir Okumaları",
        "sinif_ders_saatleri": {
         "11": "-",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Hadis Metinleri",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "İİİSLAM AHL$KI",
        "sinif_ders_saatleri": {
         "11": "(1)",
         "12": "(1)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Kur'an Okuma Teknikleri",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Arapça (Metin-Mükâleme)",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Mesleki Uygulama",
        "sinif_ders_saatleri": {
         "11": "-",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "İslam Tarihi",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Ahlak ve Tasavvuf Kültürü",
        "sinif_ders_saatleri": {
         "11": "(1)",
         "12": "(1)"
        }
       },
       {
        "ders": "DİNÎ MUSİKİ",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "HÜSN-İ HAT",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "EBRU",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "TEZHİP",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "11": "\u0015 \u0003(3) (4) (5)",
         "12": "\u0015 \u0003(3) (4) (5)"
        }
       },
       {
        "ders": "Diksiyon ve Hitabet",
        "sinif_ders_saatleri": {
         "11": "(1)",
         "12": "(1)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Seçmeli Temel Matematik",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "11": "(3)(4)(5)(6)",
         "12": "(3)(4)(5)(6)"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "11": "(3) (4)",
         "12": "(3) (4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "11": "(3) (4)",
         "12": "(3) (4)"
        }
       },
       {
        "ders": "VE",
        "sinif_ders_saatleri": {
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "11": "(2) (3) (4)",
         "12": "(2) (3) (4)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Matematik Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Fen Bilimleri Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "11": "(2) (3)",
         "12": "(2) (3)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "11": "(2) (3) (4)",
         "12": "(2) (3) (4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "11": "(2) (3) (4)",
         "12": "(2) (3) (4)"
        }
       },
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "11": "(2) (3) (4)",
         "12": "(2) (3) (4)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "Bilgi Kuramı",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "11": "(1)",
         "12": "(1)"
        }
       },
       {
        "ders": "İŞLEĞİTİME",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Ekonomi",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "11": "(1)",
         "12": "(1)"
        }
       },
       {
        "ders": "Yönetim Bilimi",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Uluslararası İlişkiler",
        "sinif_ders_saatleri": {
         "11": "(2)",
         "12": "(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "11": "(2) (8) (10)",
         "12": "(2) (8) (10)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "11": "(2) (4) (6)",
         "12": "(2) (4) (6)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "YABANCI DİL EDEBİYATLARI",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Seçmeli Beden Eğitimi ve Spor",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Sosyal Etkinlik",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Seçmeli Görsel Sanatlar",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Seçmeli Müzik",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Sanat Tarihi",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Drama",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Bilgisayar Bilimi",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "11": "",
         "12": ""
        }
       },
       {
        "ders": "Proje Hazırlama",
        "sinif_ders_saatleri": {
         "11": "(1) (2)",
         "12": "(1) (2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   },
   {
    "secmeli_ders_gruplari": []
   }
  ]
 },
 "Spor_Liseleri_Haftalık_Ders_Çizelgeleri039nde_Değişiklik_Yap.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "6",
         "12": "6"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(5)",
         "12": "(3)(5)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   }
  ]
 },
 "Spor_Liseleri_Haftalık_Ders_Çizelgesi_2023-2024_Eğitim_Öğret.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "6",
         "12": "6"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "4",
         "12": "4"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(5)",
         "12": "(3)(5)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   }
  ]
 },
 "Spor_Lisesi_Haftalık_Ders_Çizelgesi.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(4)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "ARTİSTİK JİMNASTİK",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "SEÇMELİ MÜSABAKA ANALİZİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "İNSAN, TOPLUM VE BİLİM",
      "dersler": [
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       }
      ]
     }
    ]
   }
  ]
 },
 "Spor_Lisesi_Haftalık_Ders_Çizelgesi039nde_Değişiklik_Yapılma.pdf": {
  "haftalik_ders_cizelgeleri": []
 },
 "Spor_Lisesi_Haftalık_Ders_Çizelgesi_2020-2021_Eğitim_Öğretim.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Diksiyon ve Hitabet",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": []
   }
  ]
 },
 "Spor_Lisesi_Haftalık_Ders_Çizelgesi_2024-2025_Eğitim_Öğretim.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(4)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "ARTİSTİK JİMNASTİK",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "SEÇMELİ MÜSABAKA ANALİZİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "1"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "(2)",
         "10": "(2)",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "(1)(2)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "(2)",
         "10": "(2)",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "İNSAN, TOPLUM VE BİLİM",
      "dersler": [
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "(2)",
         "10": "(2)",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "(1)(2)",
         "10": "(1)(2)",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       }
      ]
     }
    ]
   }
  ]
 },
 "Tematik_Program_Uygulayan_Spor_Lisesi_Haftalık_Ders_Çizelges.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "AKADEMİK ÇALIŞMALAR",
      "dersler": [
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Temel Matematik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(3)(4)",
         "12": "(3)(4)"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Mantık",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli Birinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "ARTİSTİK JİMNASTİK",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "SEÇMELİ MÜSABAKA ANALİZİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Hedef Temelli Destek Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "(3)(4)(5)(6)"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Fen Bilimleri Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(2)(3)",
         "12": "(2)(3)"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sosyal Bilim Çalışmaları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Bilişim Teknolojileri ve Yazılım",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(2)(3)(4)",
         "12": "(2)(3)(4)"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "-",
         "12": "-"
        }
       },
       {
        "ders": "Demokrasi ve İnsan Hakları",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Sürdürülebilir Tarım ve Gıda Güvenliği",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "İNSAN, TOPLUM VE BİLİM",
      "dersler": [
       {
        "ders": "İklim, Çevre ve Yenilikçi Çözümler",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Hukuk Bilgisi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Girişimcilik",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Metin Tahlilleri",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Seçmeli İkinci Yabancı Dil",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(2)(4)",
         "12": "(2)(4)"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Türk Dünyası Coğrafyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK EDEBİYATI",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       },
       {
        "ders": "ORTAK TÜRK TARİHİ",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "-"
        }
       }
      ]
     },
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim'in Anlam Dünyası",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Türk Düşünce Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "KLASİK AHLAK METİNLERİ",
        "sinif_ders_saatleri": {
         "9": "1",
         "10": "1",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Adabımuaşeret",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "1",
         "12": "-"
        }
       },
       {
        "ders": "TÜRK SOSYAL HAYATINDA AİLE",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       }
      ]
     },
     {
      "grup_adi": "KÜLTÜR, SANAT VE SPOR",
      "dersler": [
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)",
         "12": "(1)(2)"
        }
       },
       {
        "ders": "Spor Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       },
       {
        "ders": "Sanat Eğitimi",
        "sinif_ders_saatleri": {
         "9": "-",
         "10": "-",
         "11": "(1)(2)(3)",
         "12": "(1)(2)(3)"
        }
       }
      ]
     }
    ]
   }
  ]
 },
 "Uluslararası_Bakalorya_Programı_I_ve_II_Haftalık_Ders_Çizelg.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "hazirlik": "2-4",
         "9": "1-2",
         "10": "1-5",
         "11": "1-5",
         "12": "1-5"
        }
       },
       {
        "ders": "Diksiyon ve Hitabet",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Seçmeli Temel Matematik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "1-2",
         "11": "1-2",
         "12": "-"
        }
       },
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "4-8",
         "11": "4-8",
         "12": "4-8"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "hazirlik": "1-2*",
         "9": "1-3*",
         "10": "2-7**",
         "11": "2-7**",
         "12": "2-7**"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "hazirlik": "1-2*",
         "9": "1-3*",
         "10": "2-7**",
         "11": "2-7**",
         "12": "2-7**"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "1-2*",
         "9": "1-3*",
         "10": "2-7**",
         "11": "2-7**",
         "12": "2-7**"
        }
       },
       {
        "ders": "ÇEVRE SİSTEMLERİ VE TOPLUM",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "4-6",
         "11": "4-6",
         "12": "4-6"
        }
       },
       {
        "ders": "SPOR VE SAĞLIK BİLİMİ",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "4-6",
         "11": "4-6",
         "12": "4-6"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1-2",
         "10": "1-2",
         "11": "1-2",
         "12": "1-2"
        }
       },
       {
        "ders": "Matematik Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Fen Bilimleri Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "3",
         "11": "3",
         "12": "3"
        }
       }
      ]
     },
     {
      "grup_adi": "SOSYAL BİLİMLER",
      "dersler": [
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "1-4",
         "11": "1-4",
         "12": "1-4"
        }
       },
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "2-4",
         "11": "2-4",
         "12": "2-4"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "20. YÜZYILDA TÜRKİYE",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "4-6",
         "11": "4-6",
         "12": "4-6"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2-4",
         "12": "2-4"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "1-4",
         "11": "1-4",
         "12": "1-4"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "4-6",
         "11": "4-6",
         "12": "4-6"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "4-6",
         "11": "4-6",
         "12": "4-6"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "2": "2"
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "2": "2"
        }
       },
       {
        "ders": "1-2",
        "sinif_ders_saatleri": {
         "2": "1-2"
        }
       }
      ]
     },
     {
      "grup_adi": "YABANCI DİLLER",
      "dersler": [
       {
        "ders": "2-4",
        "sinif_ders_saatleri": {
         "2": "1-10**"
        }
       },
       {
        "ders": "1-4",
        "sinif_ders_saatleri": {
         "2": "2-4**"
        }
       },
       {
        "ders": "2-4",
        "sinif_ders_saatleri": {
         "2": "2-4**"
        }
       },
       {
        "ders": "1-2",
        "sinif_ders_saatleri": {
         "2": "1-2"
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "2": "2"
        }
       },
       {
        "ders": "1-2",
        "sinif_ders_saatleri": {
         "2": "1-2"
        }
       },
       {
        "ders": "2-3",
        "sinif_ders_saatleri": {
         "2": "4-6**"
        }
       },
       {
        "ders": "2-3",
        "sinif_ders_saatleri": {
         "2": "4-6**"
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "2": "2"
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "2": "4-6"
        }
       },
       {
        "ders": "1-3",
        "sinif_ders_saatleri": {
         "2": "1"
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "2": "4-6"
        }
       },
       {
        "ders": "1-3",
        "sinif_ders_saatleri": {
         "2": "-"
        }
       },
       {
        "ders": "1-3",
        "sinif_ders_saatleri": {
         "2": "4-6**"
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "2": "4-6"
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "2": "4-6"
        }
       },
       {
        "ders": "1-2",
        "sinif_ders_saatleri": {
         "2": "1-2"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Seçmeli Türk Dili ve Edebiyatı",
        "sinif_ders_saatleri": {
         "hazirlik": "2-4",
         "9": "1-2",
         "10": "1-2",
         "11": "1-5",
         "12": "1-5"
        }
       },
       {
        "ders": "Diksiyon ve Hitabet",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1",
         "10": "1",
         "11": "1",
         "12": "1"
        }
       },
       {
        "ders": "Osmanlı Türkçesi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       }
      ]
     },
     {
      "grup_adi": "FEN BİLİMLERİ",
      "dersler": [
       {
        "ders": "Seçmeli Temel Matematik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "1-2",
         "12": "1-2"
        }
       },
       {
        "ders": "Seçmeli Matematik",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4-8",
         "12": "4-8"
        }
       },
       {
        "ders": "Seçmeli Fizik",
        "sinif_ders_saatleri": {
         "hazirlik": "1-2*",
         "9": "1-3*",
         "10": "1-3*",
         "11": "2-7**",
         "12": "2-7**"
        }
       },
       {
        "ders": "Seçmeli Kimya",
        "sinif_ders_saatleri": {
         "hazirlik": "1-2*",
         "9": "1-3*",
         "10": "1-3*",
         "11": "2-7**",
         "12": "2-7**"
        }
       },
       {
        "ders": "Seçmeli Biyoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "1-2*",
         "9": "1-3*",
         "10": "1-3*",
         "11": "2-7**",
         "12": "2-7**"
        }
       },
       {
        "ders": "ÇEVRE SİSTEMLERİ VE TOPLUM",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4-6",
         "12": "4-6"
        }
       },
       {
        "ders": "SPOR VE SAĞLIK BİLİMİ",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4-6",
         "12": "4-6"
        }
       },
       {
        "ders": "Astronomi ve Uzay Bilimleri",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "1-2",
         "10": "1-2",
         "11": "1-2",
         "12": "1-2"
        }
       },
       {
        "ders": "Matematik Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "Fen Bilimleri Tarihi ve Uygulamaları",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "3",
         "11": "3",
         "12": "3"
        }
       }
      ]
     },
     {
      "grup_adi": "SOSYAL BİLİMLER",
      "dersler": [
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "1-4",
         "12": "1-4"
        }
       },
       {
        "ders": "Türk Kültür ve Medeniyet Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "2-4",
         "12": "2-4"
        }
       },
       {
        "ders": "İslam Kültür ve Medeniyeti",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "2",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "İslam Bilim Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "2",
         "11": "2",
         "12": "2"
        }
       },
       {
        "ders": "20. YÜZYILDA TÜRKİYE",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4-6",
         "12": "4-6"
        }
       },
       {
        "ders": "Çağdaş Türk ve Dünya Tarihi",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "-",
         "12": "2-4"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "1-4",
         "12": "1-4"
        }
       },
       {
        "ders": "Seçmeli Tarih",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4-6",
         "12": "4-6"
        }
       },
       {
        "ders": "Seçmeli Coğrafya",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "4-6",
         "12": "4-6"
        }
       },
       {
        "ders": "Psikoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "2",
         "11": "4-6",
         "12": "4-6"
        }
       },
       {
        "ders": "Sosyoloji",
        "sinif_ders_saatleri": {
         "hazirlik": "-",
         "9": "-",
         "10": "-",
         "11": "1-2",
         "12": "2"
        }
       }
      ]
     }
    ]
   },
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "DİN, AHLAK VE DEĞER",
      "dersler": [
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "2": "2"
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "2": "2"
        }
       },
       {
        "ders": "1-2",
        "sinif_ders_saatleri": {
         "2": "1-2"
        }
       }
      ]
     },
     {
      "grup_adi": "YABANCI DİLLER",
      "dersler": [
       {
        "ders": "2-4",
        "sinif_ders_saatleri": {
         "2": "1-10**"
        }
       },
       {
        "ders": "1-4",
        "sinif_ders_saatleri": {
         "2": "2-4**"
        }
       },
       {
        "ders": "2-4",
        "sinif_ders_saatleri": {
         "2": "2-4**"
        }
       },
       {
        "ders": "1-2",
        "sinif_ders_saatleri": {
         "2": "1-2"
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "2": "2"
        }
       },
       {
        "ders": "1-2",
        "sinif_ders_saatleri": {
         "2": "1-2"
        }
       },
       {
        "ders": "2-3",
        "sinif_ders_saatleri": {
         "2": "4-6**"
        }
       },
       {
        "ders": "2-3",
        "sinif_ders_saatleri": {
         "2": "4-6**"
        }
       },
       {
        "ders": "2",
        "sinif_ders_saatleri": {
         "2": "2"
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "2": "4-6"
        }
       },
       {
        "ders": "1-3",
        "sinif_ders_saatleri": {
         "2": "1"
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "2": "4-6"
        }
       },
       {
        "ders": "1-3",
        "sinif_ders_saatleri": {
         "2": "-"
        }
       },
       {
        "ders": "1-3",
        "sinif_ders_saatleri": {
         "2": "4-6**"
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "2": "4-6"
        }
       },
       {
        "ders": "-",
        "sinif_ders_saatleri": {
         "2": "4-6"
        }
       },
       {
        "ders": "1-2",
        "sinif_ders_saatleri": {
         "2": "1-2"
        }
       }
      ]
     }
    ]
   }
  ]
 },
 "Özel_Program_Uygulayan_Fen_Lisesi_Haftalık_Ders_Çizelgesi.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": []
   }
  ]
 },
 "Özel_Program_Uygulayan_Sosyal_Bilimler_Lisesi_Haftalık_Ders_.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": []
   }
  ]
 },
 "İlköğretim_Kurumları_İlkokul_ve_Ortaokul_Haftalık_Ders_Çizel.pdf": {
  "haftalik_ders_cizelgeleri": [
   {
    "secmeli_ders_gruplari": [
     {
      "grup_adi": "GENEL",
      "dersler": [
       {
        "ders": "Matematik ve Bilim Uygulamaları",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "",
         "6": "2",
         "8": ""
        }
       },
       {
        "ders": "8 Okuma Becerileri",
        "sinif_ders_saatleri": {
         "1": "",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": ""
        }
       },
       {
        "ders": "Yazarlık ve Yazma Becerileri",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "(1)(2)",
         "6": "(1)(2)",
         "8": "2"
        }
       },
       {
        "ders": "1 Yaşayan Diller ve Lehçeler",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "2 Yabancı Dil",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "Çevre Eğitimi ve İklim Değişikliği",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "- “Şehrimiz ...”",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "(1)(2)",
         "6": "(1)(2)",
         "8": "2"
        }
       },
       {
        "ders": "Hukuk ve Adalet",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "Düşünme Eğitimi",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "",
         "6": "",
         "8": "2"
        }
       },
       {
        "ders": "Robotik Kodlama",
        "sinif_ders_saatleri": {
         "1": "",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": ""
        }
       },
       {
        "ders": "3 Yapay Zeka Uygulamaları",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "",
         "6": "",
         "8": "2"
        }
       },
       {
        "ders": "Proje Tasarımı ve Uygulamaları",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "(1)(2)",
         "6": "(1)(2)",
         "8": ""
        }
       },
       {
        "ders": "5 Medya Okuryazarlığı",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "",
         "6": "",
         "8": "2"
        }
       },
       {
        "ders": "Afet Bilinci",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "(1)(2)",
         "6": "(1)(2)",
         "8": ""
        }
       },
       {
        "ders": "7 Temel Yaşam Becerileri",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "(1)(2)",
         "6": "(1)(2)",
         "8": "2"
        }
       },
       {
        "ders": "4 Türk Sosyal Hayatında Aile",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "Kur'an-ı Kerim",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "Peygamberimizin Hayatı",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "Temel Dini Bilgiler",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "Kültür ve Medeniyetimize Yön Verenler",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "Ahlak ve Vatandaşlık Eğitimi",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "(1)(2)",
         "6": "(1)(2)",
         "8": "2"
        }
       },
       {
        "ders": "Görgü Kuralları ve Nezaket",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "Müzik",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "(1)(2)",
         "6": "(1)(2)",
         "8": "2"
        }
       },
       {
        "ders": "Spor ve Fizikî Etkinlikler",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "Oyun ve Oyun Etkinlikleri",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "(1)(2)",
         "6": "(1)(2)",
         "8": ""
        }
       },
       {
        "ders": "Dijital Sanatlar",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "",
         "6": "(1)(2)",
         "8": ""
        }
       },
       {
        "ders": "Masal ve Destanlarımız",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "(1)(2)",
         "6": "(1)(2)",
         "8": "2"
        }
       },
       {
        "ders": "Geleneksel Sanatlar",
        "sinif_ders_saatleri": {
         "1": "(1)(2)",
         "2": "",
         "3": "",
         "4": "",
         "5": "",
         "6": "(1)(2)",
         "8": ""
        }
       },
       {
        "ders": "Halk Oyunları",
        "sinif_ders_saatleri": {
         "1": "2",
         "2": "",
         "3": "",
         "4": "",
         "5": "2",
         "6": "2",
         "8": "2"
        }
       },
       {
        "ders": "8 SEÇMELİ DERS SAATİ TOPLAMI",
        "sinif_ders_saatleri": {
         "1": "5",
         "2": "",
         "3": "",
         "4": "",
         "5": "5",
         "6": "5",
         "8": "6"
        }
       },
       {
        "ders": "SERBEST ETKİNLİKLER DERS SAATİ",
        "sinif_ders_saatleri": {
         "1": "",
         "2": "2",
         "3": "2",
         "4": "",
         "5": "",
         "6": "",
         "8": ""
        }
       }
      ]
     }
    ]
   }
  ]
 }
};

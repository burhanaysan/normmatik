# 📘 MEB ÇÖP Müfredat Veritabanı Otomatik Güncelleme Rehberi

Bu proje, Millî Eğitim Bakanlığı (MEB) tarafından her yıl veya dönem yayınlanan **Çerçeve Öğretim Programları (ÇÖP)** haftalık ders çizelgelerini otomatik olarak okuyup işleyen **akıllı bir derleme ve denetim motoruna** sahiptir.

---

## 🚀 Gelecek Yıl Yeni Müfredat Yayınlandığında Ne Yapacaksınız?

Yeni öğretim yılında MEB yeni PDF'ler yayınladığında tek yapmanız gereken 2 basit adımdır:

### 1. Adım: Yeni PDF Dosyalarını Klasöre Ekleyin
MEB'in yayınladığı yeni ÇÖP PDF dosyalarını şu klasörlere yerleştirin:
* **9. Sınıflar için:** `03_meb_mevzuat_ve_cizelgeler/mtegm_mesleki_ve_teknik/sinif_9/`
* **10. Sınıflar için:** `03_meb_mevzuat_ve_cizelgeler/mtegm_mesleki_ve_teknik/sinif_10/`
* **11. Sınıflar için:** `03_meb_mevzuat_ve_cizelgeler/mtegm_mesleki_ve_teknik/sinif_11/`
* **12. Sınıflar için:** `03_meb_mevzuat_ve_cizelgeler/mtegm_mesleki_ve_teknik/sinif_12/`

---

### 2. Adım: Tek Bir Komutla Motoru Çalıştırın
Terminali açıp şu komutu yazın:

```bash
python tools/update_curriculum_from_pdfs.py
```

---

## ⚙️ Motorun Otomatik Olarak Yaptığı İşlemler:

Bu script tek başına çalıştığında arka planda sırasıyla:
1. **İçindekiler ve Açıklama Sayfalarını Eler:** PDF'lerin başındaki gereksiz bölümleri atlar, yalnızca resmî haftalık ders tablolarını bulur.
2. **Dizgi ve Heceleme Hatalarını Onarır:** MEB dizgicisi kelimeleri bölmüş olsa bile (`ATÖL YESİ`, `DİN KÜL TÜRÜ` vb.) otomatik temizleyip doğru birleştirir.
3. **Sütun ve Sınıf Seviyesini Matematiksel Olarak Kilitler:** 
   - Sütun 0 ➔ 9. Sınıf
   - Sütun 1 ➔ 10. Sınıf
   - Sütun 2 ➔ 11. Sınıf
   - Sütun 3 ➔ 12. Sınıf (AMP & Staj)
4. **Veritabanını Üretir:** `01_uygulama/js/strict_pdf_curriculum_db.js` dosyasını sıfır hatayla baştan oluşturur.
5. **Uygulamayı Paketler:** `bundle.js` dosyasını günceller.
6. **Otomatik Denetim Yapar:** 157 dalın tamamını test edip `%100 BAŞARILI` raporunu ekrana basar.

---

## 🌐 Canlıya Gönderme (Opsiyonel):
Yeni veritabanını doğrudan GitHub Pages canlı sunucunuza aktarmak için:
```bash
python deploy.py "2026-2027 Yeni MEB ÇÖP Müfredat Güncellemesi"
```

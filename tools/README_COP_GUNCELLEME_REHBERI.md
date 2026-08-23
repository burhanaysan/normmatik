# ⚠️ BU REHBER ARTIK GEÇERLİ DEĞİL

Müfredat güncelleme yöntemi değişti. Bu dosyadaki eski talimatı **uygulamayın.**

## Doğru yöntem

Proje ana klasöründeki **`Gelecek_Yil_Mufredat_Guncelle.bat`** dosyasına çift
tıklayın. Ayrıntı için:

```
04_veri_tabani_ve_araclar\pdf_donusturucu_hatti\OKUBENI.md
```

---

## Neden değişti?

Eski rehber şu komutu söylüyordu:

```
python tools/update_curriculum_from_pdfs.py
```

**Bu komutu çalıştırmayın.** Eski ayrıştırıcı, sütunları tablodaki çizgilerden
ve sabit sıra numarasından ("Sütun 0 ➔ 9. Sınıf") tanıyordu. MEB PDF'lerinde
bu yöntem **sütun kayması** üretiyor: bir dersin saati komşu sınıfın sütununa
düşüyor ve hata hiçbir yerde görünmüyor.

Yeni ayrıştırıcı (`04_veri_tabani_ve_araclar\pdf_donusturucu_hatti`) kelimeleri
sütun başlıklarının **koordinatına** göre yerleştirir; bu hata sınıfı yapısal
olarak ortadan kalkar. Ayrıca:

* Kendi toplamı tutmayan sayfa çıktıya **yazılmaz** (sessiz yanlış veri yerine
  açık eksik veri).
* Üretilen veri, uygulamaya girmeden önce doğrulama testinden geçer.
* Ayrıştırıcının kendisi gerileme testiyle korunur.

Eski üretici bu yüzden **kilitlendi**: çalıştırıldığında bir uyarı basıp
durur, veriye dokunmaz. (Kilidi açan bayrağı kullanmayın; kullanılırsa
`strict_pdf_curriculum_db.js` eski ve hatalı içerikle ezilir.)

---

## Canlıya gönderme

Eski rehberdeki `deploy.py` satırı da kaldırıldı: o dosyada açık metin bir
GitHub erişim anahtarı bulunuyordu. Anahtar iptal edildi. Yayınlama adımını
yeniden kurmadan bu komutu kullanmayın.

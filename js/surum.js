/**
 * NORMMATİK — SÜRÜM NUMARASI (TEK KAYNAK)
 * =============================================================================
 * NEDEN AYRI BİR DOSYA (13.09.2026):
 *   Sürüm numarası İKİ ayrı yerde yazılıydı ve ikisi birbirini tutmuyordu:
 *     • version.json          -> "2.0.1"   (19.08.2026'da donmuş)
 *     • normRulesConfig.js    -> "2026.2.0"
 *   liveUpdateSyncEngine bu ikisini BİRBİRİYLE karşılaştırıyordu; 2026 > 2
 *   olduğu için hiçbir zaman "güncelleme var" diyemezdi. İki ayrı numaralama
 *   düzenini kıyaslamanın tipik sonucu: hata vermez, sessizce yanlış çalışır.
 *
 *   Artık tek yer burasıdır. Uygulama bu sabiti doğrudan okur; depo kökündeki
 *   version.json ise `python tools/build_bundle.py` çalıştığında buradan
 *   OTOMATİK yazılır (bkz. build_bundle.py -> surum_senkronize).
 *
 * NUMARANIN MANTIĞI (SemVer: ANA.EK.YAMA)
 *   ANA  (3.0.0) : eskisini bozan değişiklik — kullanıcının elindeki bir şey
 *                  (girişi, verisi, çıktısı) artık çalışmıyor
 *   EK   (2.1.0) : yeni özellik, eskisi çalışmaya devam ediyor
 *   YAMA (2.1.1) : hata düzeltme; davranış eskiden YANLIŞTI, şimdi doğru
 *   Soldaki artınca sağındakiler SIFIRLANIR. 2.1.2 -> yeni özellik -> 2.2.0
 *
 * NEDEN 2.1.0, 3.0.0 DEĞİL (13.09.2026):
 *   İlk yazımda "eski giriş bilgileri geçersiz oldu" diyerek ANA sürüm (3.0.0)
 *   demiştim. Kullanıcı sordu, ÖLÇTÜM: yanlıştı. Canlı hesaplar denetlendi —
 *   kayıtlı beş okulun HEPSİ 24.08.2026 ve sonrasında, yani yeni giriş
 *   altyapısı kurulduktan SONRA açılmış. Eski düzenden taşınan tek bir hesap
 *   yok; kimsenin girişi geçersiz olmadı. Denetim kaydında da hiçbir gerçek
 *   okulda parola sıfırlama veya oturum düşürme işlemi görünmüyor.
 *
 *   Kullanıcının elindekini bozan bir değişiklik olmadığı için bu bir EK
 *   sürümdür: çok sayıda yeni özellik ve düzeltme, ama eskisi çalışmaya
 *   devam ediyor. 2.0.1 -> 2.1.0.
 *
 *   DERS: sürüm numarası bir SÖZ verir ("bozulan bir şey var/yok"). O sözü
 *   hatırdan değil, ölçerek vermek gerekir.
 *
 * DEĞİŞTİRİRKEN: yalnızca aşağıdaki değerleri düzenleyin, sonra
 *   python tools/build_bundle.py
 * çalıştırın. version.json'a ELLE DOKUNMAYIN — üzerine yazılır.
 */
const NORMMATIK_SURUM = {
    surum: "2.1.6",
    yayinTarihi: "2026-09-15",

    // Kullanıcıya gösterilen değişiklik listesi. Lisans penceresinde
    // "Neler değişti" başlığı altında çıkar ve version.json'a yazılır.
    // KURAL: buraya teknik değil, OKULUN ANLAYACAĞI dille yazılır.
    degisiklikler: [
        "Kur'an-ı Kerim dersinin 25'ten fazla öğrencide iki gruba bölünmesi yalnızca imam hatip okullarında uygulanıyor; spor ve güzel sanatlar liselerinde seçmeli Kur'an-ı Kerim bölünmüyor.",
        "İmam hatip ortaokulunda Bireysel Çalgı Eğitimi öğrenci başına çoğaltılmıyor; Toplu Ses Eğitimi grup dersi olarak sayılıyor.",
        "Öğrenci sayısı 0 yapılan şube, grup hesabında artık 30 öğrencili sayılmıyor.",
        "MESEM'de aynı alanın şubelerinde işletme dersine farklı branş seçilmişse yük, en çok çırağı olan branşa yazılıyor; sonuç şubelerin eklenme sırasına bağlı değil.",
        "Özel eğitim sınıfı olan okulda, normal şubelerden Özel Eğitim branşına verilen ders saati toplam yükte görünüyor.",
        "Kaynaştırma öğrencisiyle grup bölünmesi yönetmeliğin 'gruplara eşit dağıtım' şartına göre hesaplanıyor.",
        "Meslek liselerinde 12. sınıfı olan her alana kendiliğinden eklenen 10 saat “koordinatörlük” kaldırıldı. Yerine alan ve atölye/laboratuvar şeflikleri Kadro & Şeflikler penceresinden işaretleniyor: alan şefi haftada 10, her atölye/laboratuvar şefi 6 saat, branşın atölye yüküne eklenir (Norm Kadro Yön. Md. 22/1-c-2, Ek Ders Kararı Md. 6/4). Daha önce girilmiş koordinatörlük saati alan şefi olarak aktarıldı.",
        "Atölye raporundaki grup baremi açıklaması yönetmeliğin metniyle (Md. 22/1-ç) düzeltildi.",
        "Özel program fen lisesinde laboratuvar dersleri, güzel sanatlar lisesinde sanat atölye dersleri ve imam hatipteki atölye adlı seçmeliler genel ders olarak hesaplanıyor; ad kalıbıyla atölye sayma yalnızca meslekî okullarda.",
        "Güvenlik: kaydedilen metinlerden < ve > karakterleri kayıt anında temizleniyor; bulut tarafında da aynı kural uygulanıyor.",
        "Güvenlik: okulun yazdığı metinler (şube adı, branş adı, antet, logo) ekrana güvenli biçimde basılıyor; sayfalara tarayıcı güvenlik politikası eklendi.",
        "Üç ve daha fazla şubenin birleştirildiği derslerde ders yükü artık bir kez sayılıyor; birleşik atölye dersinde sonuç şubelerin sırasına bağlı değil.",
        "“Branş Atanmadı” seçimi korunuyor ve hesaba doğru yansıyor; ders adıyla ayrı bir branş satırı açılmıyor.",
        "Adında “Uygulamaları” geçen genel dersler (Matematik Uygulamaları, Proje Tasarımı ve Uygulamaları vb.) atölye değil genel ders olarak hesaplanıyor.",
        "Güzel sanatlar lisesinde Çalgı Eğitimi ders yükü yönetmeliğin üst sınırıyla hesaplanıyor (Md. 22/4-a).",
        "9. sınıfta 31 öğrencili atölye şubesi 2 grup sayılıyor (Md. 22/1-ç).",
        "Taşıma merkezi müdür yardımcısı seçeneği kaldırıldı.",
        "Ders dağılımı raporunda (ve Excel/CSV çıktısında) Özel Eğitim kartı görünüyor: şube şube haftalık saat, norm ve dayanağı. Kartların toplamı artık üstteki toplam ders yüküyle tutuyor.",
        "Antet logosu yüklenirken otomatik küçültülüyor; büyük bir fotoğraf seçmek kaydı yavaşlatmıyor ya da engellemiyor.",
        "Koordinatörlük sekmesinde bütün meslekî branşlar listeleniyor; okulda aktif alanlar doğru öğretmen branşıyla işaretleniyor (ör. Bilişim Teknolojileri).",
        "Şifrenizi artık yalnızca siz biliyorsunuz; uygulama içinden dilediğiniz zaman değiştirebilirsiniz. Mevcut giriş bilgileriniz geçerliliğini korur.",
        "Müfredat verisi elle yazılmış listelerden çıkarılıp resmî MEB/TTKB çizelgelerinden üretiliyor (14 okul türü).",
        "Haftalık hedef ders saati çizelgenin kendi toplam satırından okunuyor; 9. sınıfta 44 yerine 45 saat.",
        "Atölye normu (Md. 19), rehber öğretmen normu (Md. 21) ve grup bölünmesi (Md. 22/1-ç) mevzuata göre düzeltildi.",
        "MESEM ve özel eğitim müfredatları resmî çizelgelerden üretiliyor.",
        "Özel Program Uygulayan Fen ve Sosyal Bilimler Liseleri ile hazırlık sınıflı tür eklendi (TTKB Sayı 104).",
        "Şube öğrenci sayısı üst sınırı Ortaöğretim Kurumları Yönetmeliği'ne bağlandı (30/34/40).",
        "Veriniz artık yalnızca bulutta değil, bu tarayıcıda da tutuluyor; sürüm geçmişinden eski hâle dönülebiliyor.",
        "Mevzuat nöbetçisi 7/24 çalışıyor: Resmî Gazete ve TTKB değişiklikleri takip ediliyor.",
        "Üst paneldeki seyrek kullanılan araçlar \"⋯ Diğer\" menüsünde toplandı."
    ]
};

/** Ekranda gösterilecek kısa biçim: "v3.0.0" */
function normmatikSurumEtiketi() {
    return "v" + NORMMATIK_SURUM.surum;
}

if (typeof window !== 'undefined') {
    window.NORMMATIK_SURUM = NORMMATIK_SURUM;
    window.normmatikSurumEtiketi = normmatikSurumEtiketi;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NORMMATIK_SURUM, normmatikSurumEtiketi };
}

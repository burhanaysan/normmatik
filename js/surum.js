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
    surum: "2.4.3",
    yayinTarihi: "2026-09-22",

    // Kullanıcıya gösterilen değişiklik listesi. Lisans penceresinde
    // "Neler değişti" başlığı altında çıkar ve version.json'a yazılır.
    // KURAL: buraya teknik değil, OKULUN ANLAYACAĞI dille yazılır.
    degisiklikler: [
        "Meslek liselerinde tüm meslek dersleri artık aynı davranıyor: şubedeki öğrenci sayısı Md. 22/1-ç baremine göre grup gerektirdiğinde (9. sınıfta 21 ve üzeri, 10-12. sınıflarda 17 ve üzeri) her meslek dersinde \"1 Grup / 2 Grup\" kutusu görünüyor ve okulunuzun dersi kaç grupta okuttuğunu siz seçiyorsunuz. Eskiden adında \"Hukuk Dili\" ya da \"Terminoloji\" geçen üç ders (Hukuk Dili ve Terminolojisi, Mesleki Fizyoloji ve Terminoloji, Tıbbi Cihaz Üretim Terminolojisi) bilerek gruplanmıyor ve kutu çıkmıyordu; 21 öğrencili 9. sınıf Adalet şubesinde iki meslek dersi \"2 Grup\" alırken üçüncüsü almıyordu. Grup sayısını yönetmeliğin baremini aşacak biçimde artıramazsınız.",
        "Ders yükü yeniden idarecinin seçtiği branşa yazılıyor: bir dersi (ör. Fizik) başka bir branşa (ör. Kimya) verdiğinizde ders o branşın yüküne ve normuna eklenir; uygulama bir kısıtlama koymaz, hangi branşa verileceği idarecinin inisiyatif ve sorumluluğundadır. 2.1.7 sürümünde eklenen \"norm dersin resmî alanında kalır\" kuralı geri alındı — İslam Bilim Tarihi, Fen Bilimleri Uygulamaları gibi birden fazla branşın normuna girebilen dersler tek bir alana bağlanamıyordu.",
        "Demoda \"Lisans Al\" düğmesinin üzerine gelince çıkan \"Deneme sürümü — 7 gün kaldı\" ipucu kaldırıldı: demoda süre sınırı yoktur, yalnız 3 şube ve filigran sınırı vardır.",
        "Okulda dersi kalmayan ama kadrosu olan bir branşın öğretmeni (ör. ikinci yabancı dil seçilmeyince Almanca öğretmeni, bir şube silinince Bilişim öğretmeni) mevcut kadro toplamından ve norm fazlası listesinden düşüyordu. Artık \"0 saat · norm 0 · mevcut 1 · +1 fazla\" olarak sağ panelde, Yönetici İcmalinde, Master Yük Matrisinde ve norm fazlası (atama/nakil) listesinde görünüyor. Hem dersi hem kadrosu olmayan branş eskisi gibi gizli kalıyor.",
        "Şube düzenleme penceresi meslek lisesinde şubenin dalını boş getiriyordu; yalnız öğrenci sayısını değiştirip kaydeden idarecinin şubesi dalını kaybediyordu. Dal artık seçili geliyor ve kaydedildiğinde korunuyor.",
        "Şube kaydederken girdi denetimi: öğrenci sayısı 0 ile 60 arasında (MESEM'de 450'ye kadar) bir tam sayı olmalı; şube adı boş bırakılamıyor ve başka bir şubenin adı verilemiyor. Eskiden -5 ya da 9999 sessizce kaydediliyor, 9999 raporda 20 rehber öğretmen açığı üretiyordu.",
        "Çalışma alanı 1200 pikselden dar pencerelerde ve tablet/telefonda artık kesilmiyor: dar pencerede yatay kaydırılabiliyor, telefonda sayfa ekrana sığdırılıyor. Okullarda yaygın 1366x768 dizüstülerde (Windows %125 ölçekte) sağ paneldeki norm tablosuna ve Çıkış düğmesine ulaşılamıyordu.",
        "Üst çubuk 1500 pikselden dar ekranlarda İndir, Yükle, Diğer ve Şifre düğmelerini yalnız simgeyle gösteriyor (tam adı fareyle üzerine gelince ve ekran okuyucuda duyuluyor); 1280 pikselde görünmeyen Çıkış düğmesi artık görünüyor.",
        "Rehber öğretmen açığı ya da fazlası norm ihtiyaç/fazla raporunda ve Excel çıktısında ayrı bir satır olarak görünüyor (branş toplamlarına katılmıyor); eskiden yalnız Yönetici İcmalinde vardı.",
        "Sağ paneldeki \"Toplam Okul Yükü\" ile branş satırlarının toplamı arasındaki fark artık tabloda yazıyor: hiçbir branşa verilmemiş Rehberlik ve Yönlendirme dersi ya da branşı atanmamış dersler toplam yüke dâhildir ama norm doğurmaz. Master Yük Matrisindeki Rehberlik kartı \"norm 0 · kadro tam\" yerine bunu açıkça söylüyor.",
        "Metin düzeltmesi: üst çubuk, raporlar ve tanıtım turundaki \"MEB Norm Sistemi\", \"MEBBİS Norm Güncelleme Cetveli\", \"MEB Gerekçesi\", \"Resmî Eylem Cetveli\", \"Türkiye'nin ilk ve tek MEB norm platformu\" gibi Bakanlığa ait bir sistem izlenimi veren ifadeler kaldırıldı; raporlar karar destek amaçlı ön çalışma olduğunu ve resmî işlemlerde MEBBİS verilerinin esas alındığını belirtiyor.",
        "Demoda \"Okulu Sıfırla\" düğmesi iki kırmızı \"VERİLER KAYDEDİLEMEDİ ... lütfen bildirin\" hata bildirimi çıkarıyordu; artık yalnız \"Okul sıfırlandı\" uyarısı çıkıyor (demo hiçbir zaman buluta yazılmaz).",
        "Klavye ve ekran okuyucu desteği: şube kartları Tab ile seçilip Enter ile açılabiliyor (kart düğmeleri odaktayken görünüyor); ders satırlarındaki branş seçicileri, sezon, arama, Kadro ve Lisans pencerelerindeki alanlar ekran okuyucuya adlarıyla okunuyor; tüm pencereler açılınca odağı içeri alıyor, Esc ile kapanıyor ve odağı açan düğmeye geri veriyor. Tanıtım sayfasındaki giriş ve görsel büyütme pencereleri de aynı şekilde çalışıyor.",
        "Okunabilirlik: norm panelindeki İHTİYAÇ/FAZLA etiketleri, yük ve şube sayısı rozetleri, KPI sayıları, ders saatleri, BARAJ etiketi ve e-Okul düğmesinin renkleri erişilebilirlik ölçütünün (WCAG AA, 4,5:1) altındaydı; ölçülüp koyulaştırıldı. Atölye grup tablosundaki \"Ögr\" yazımı düzeltildi; üst çubukta kesilen uzun okul adı fareyle üzerine gelince tam görünüyor.",
        "Demo sürümünde kilitli bir şubede değişiklik denendiğinde \"kilitli\" uyarısıyla birlikte \"güncellendi\" bildirimi de çıkıyordu; artık yalnız kilit uyarısı çıkıyor ve seçim kutusu gerçek değere dönüyor.",
        "Meslek lisesi, Anadolu Teknik Programı, MESEM ve meslek ortaokulunun seçmeli ders listeleri resmî kaynaklara bağlandı: TTKB 16/07/2026-62 seçmeli dersler tablosu ve alanların çerçeve öğretim programları. Eskiden bu okullarda resmî listede olmayan dersler ve yanlış saat seçenekleri görünüyordu; 11-12. sınıf seçmeli meslek dersleri 9-10. sınıfa da çıkıyordu.",
        "Hazırlık sınıfı olmayan Sosyal Bilimler Liselerinde seçmeli ders listesi kendi resmî çizelgesinden geliyor (9. sınıf İkinci Yabancı Dil 1/2/4 saat; 12. sınıfta Metin Tahlilleri yok).",
        "Özel eğitim meslek okulu ve uygulama okulunda seçmeli ders listesi boş: bu okulların resmî çizelgelerinde seçmeli ders yok.",
        "Seçmeli ders penceresinde kural uyarıları: meslek lisesi ve meslek ortaokulunda her seçmeli gruptan en az bir ders, meslek lisesi hazırlık sınıfında toplam 2 saat; resmî listede olmayan ya da saati seçenek dışında kalan ders. Seçimleriniz silinmez.",
        "Seçmeli derslerde önerilen öğretmen branşı düzeldi: Türkçe büyük harf hatası yüzünden çoğu derste ders adı branş diye öneriliyordu. Din, Ahlak ve Değer grubundaki dersler imam hatip dışındaki okullarda Din Kültürü ve Ahlak Bilgisi'ne öneriliyor (Öğretmenlik Alanları Esasları).",
        "Seçmeli derslerde idarecinin seçtiği branş korunuyor: bir seçmeliyi birden fazla alanın öğretmeni okutabildiği için (ör. Osmanlı Türkçesi), norm artık başka bir branşa taşınmıyor.",
        "Öğretmen branşları TTKB Öğretmenlik Alanları, Atama ve Ders Okutma Esasları'na göre düzeltildi: Mikromekanik alanının dersleri Makine ve Tasarım Teknolojisi, Basım Teknolojileri alanınınkiler Matbaa Teknolojisi, Yapay Zekâ alanınınkiler Bilişim Teknolojileri branşına yazılıyor. Esaslarda bulunmayan 'Basım Teknolojileri', 'Mikromekanik', 'Siber Güvenlik' ve 'Yapay Zekâ' branş satırları listeden kaldırıldı.",
        "Özel eğitim sınıflarında Din Kültürü ve Ahlak Bilgisi, Görsel Sanatlar, Müzik ve Beden Eğitimi derslerini (ilkokulda yalnız Din Kültürü) alan öğretmeni okutur; bu saatler artık ilgili branşın ders yüküne yazılıyor (ÖEHY 27/3-e, 28/1-ğ). Birleştirilmiş sınıfta ders sınıf başına bir kez sayılır.",
        "Özel eğitim sınıflarının meslek dersleri (İş Eğitimi ve Meslek Ahlakı, İş ve Beceri Uygulamaları) seçtiğiniz meslek branşına yazılıyor; 9. sınıfta İş Eğitimi ve Meslek Ahlakı okuldaki alanlara eşit dağıtılıyor (resmî çizelge açıklaması).",
        "Özel eğitim şubesinin dersleri engel türüne göre doğru resmî çizelgeden geliyor: uygulama okulu ve orta/ağır düzey sınıflar (I-II ve III. kademe), görme, işitme ve bedensel yetersizlik ilkokul/ortaokul çizelgeleri, görme engelliler meslek okulu. Engel türünü değiştirdiğinizde dersler yenilenir.",
        "Mevzuatın öngörmediği özel eğitim sınıfları için uyarı: İmam Hatip Ortaokulunda hafif düzey sınıf, normal ortaokulda görme/işitme sınıfı, genel lisede özel eğitim sınıfı, alanı olmayan meslek lisesinde hafif düzey sınıf.",
        "Özel eğitim: birleştirilmiş sınıf. e-Okul'da ayrı şubelerde görünen aynı türdeki özel eğitim öğrencileri tek sınıfta okuyorsa, Kadro penceresinin İdareci sekmesinden işaretleyip her tür ve kademe için oluşturduğunuz sınıf sayısını yazın; özel eğitim öğretmeni normu sınıf başına verilir (ÖEHY 27/3-a, 28/1-a; Norm Kadro Yön. Md. 17/1). Sınıf mevcudu sınırı aşılırsa kaç sınıf gerektiği gösterilir. İşaretlemezseniz her şube ayrı sınıf sayılır.",
        "Her açık alana bir alan şefi: aynı branşın okuttuğu iki alan açıksa (ör. Bilişim Teknolojileri ve Siber Güvenlik) Şeflikler listesinde her alan için ayrı kutu çıkıyor ve branşa her alan şefi için 10 saat ekleniyor (OÖKY Md. 84/1).",
        "Metalürji Teknolojisi alanının meslek dersleri yanlışlıkla Metal Teknolojisi branşına, Plastik Sanatlar alanınınkiler El Sanatları Teknolojisi branşına yazılıyordu. Artık TTKB Öğretmenlik Alanları, Atama ve Ders Okutma Esasları'na göre Metalürji Teknolojisi ve Sanat ve Tasarım / Plastik Sanatlar branşlarına yazılıyor.",
        "Meslek liselerinde Şeflikler listesindeki 'Okulda Aktif Alan' işareti artık şubelerde seçilmiş alana göre konuyor. Alanı henüz seçilmemiş 9. sınıfın Görsel Sanatlar dersi ya da her alanda okutulan Sağlık Bilgisi ve Trafik Kültürü dersi alan şefliği açmıyor; varsayılan alan şefliği o alanın atölye derslerini okutan branşa yazılıyor.",
        "Özel eğitim: otizm ayrı engel türü oldu; otizmli öğrencilerin sınıfı her kademede 2 özel eğitim öğretmeni normu alıyor (Norm Kadro Yön. Md. 17/1-ç).",
        "Özel eğitim sınıflarında Özel Eğitim Hizmetleri Yönetmeliği'nin sınıf mevcudu sınırları uygulanıyor (ör. otizmde en fazla 4, hafif zihinselde 10); sınır aşılınca kaç sınıf gerektiği ve sınıflar açılırsa normun kaç olacağı gösteriliyor.",
        "Özel eğitim meslek okulu ve uygulama okulunda her şube özel eğitim şubesi sayılıyor; norm şube başına hesaplanıyor.",
        "Eski ve bozuk ana veri dosyası (15,5 MB) kaldırıldı; uygulama daha hızlı açılıyor. Alan, dal ve ders listeleri değişmedi.",
        "Havacılık ve Uzay Teknolojisi alanında 9. sınıf şubesine yanlışlıkla hazırlık sınıfının dersleri (24 saat yabancı dil) geliyordu; artık 9. sınıf çizelgesi geliyor.",
        "Meslek liselerinde okulda açık olan her alanda alan şefliği varsayılan olarak işaretli geliyor (OÖKY Md. 84/1); şefliği olmayan alanda işareti kaldırmanız yeterli.",
        "Müdür başyardımcısı normu yeniden hesaplanıyor: yatılı/pansiyonlu kurumda ve müdür yardımcısı sayısı 6 ve üzeri olan okulda 1 norm (Md. 6). 'Görevi süren başyardımcı var' kutusu artık yalnızca mevcut kadro sütununu açıyor.",
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

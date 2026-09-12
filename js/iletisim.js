/**
 * NORMMATİK — WHATSAPP İLETİŞİMİ (TEK KAYNAK)
 * =============================================================================
 * NEDEN AYRI BİR DOSYA (13.09.2026):
 *   Lisans için WhatsApp mesajı İKİ ayrı yerde, ELLE yazılıydı:
 *     • karşılama sayfası (index.html + 3 SEO sayfası) -> kısa, boş şablon
 *     • uygulama içi lisans penceresi                  -> formdaki bilgileri
 *       mesaja gömen uzun bir metin
 *   İkincisi DEMO'da okulun sahte bilgilerini gönderiyordu:
 *       "MEB Kurum Kodu: 123457 / Okul Adı: DEMO MESLEKİ VE TEKNİK ANADOLU
 *        LİSESİ / İl: ANKARA / ÇANKAYA"
 *   Yani satıcıya her demo kullanıcıdan aynı uydurma okul bilgisi gidiyordu.
 *   (Kullanıcı bulgusu, 13.09.2026: "demo okullardaki olmamış, hepsi ilk
 *   mesaj gibi olsun.")
 *
 *   Artık tek yer burasıdır. Uygulama bu sabiti doğrudan okur; karşılama ve
 *   SEO sayfalarındaki bağlantılar ise `python tools/build_bundle.py`
 *   çalıştığında buradan OTOMATİK yazılır (bkz. build_bundle.py ->
 *   whatsapp_senkronize). Bu, fiyat ve sürüm numarasında kullandığımız
 *   düzenin aynısı: aynı bilgi iki yerde yazılıysa er geç ayrışır ve
 *   ayrıştığında HATA VERMEZ — sessizce farklı şey söyler.
 *
 * DEĞİŞTİRİRKEN: yalnızca aşağıdaki değerleri düzenleyin, sonra
 *   python tools/build_bundle.py
 * çalıştırın. HTML dosyalarındaki wa.me bağlantılarına ELLE DOKUNMAYIN.
 */
const NORMMATIK_ILETISIM = {
    telefon: "905062777049",
    telefonGosterim: "+90 506 277 70 49",

    // Lisans talebi. Okul bilgileri BİLEREK boş bırakılır: kişi kendi
    // bilgisini yazar. Formdan otomatik doldurmak, demoda sahte veri
    // göndermek demekti.
    lisansMesaji: "Merhaba, NormMatik lisansı hakkında bilgi almak istiyorum.\n"
        + "Okul: \nKurum kodu: \nİl/İlçe: ",

    // Şifre oluşturma bağlantısı talebi (giriş ekranındaki "Şifremi unuttum").
    sifreMesaji: "Merhaba, NormMatik giriş şifremi unuttum."
};

/** Hazır mesajlı WhatsApp bağlantısı üretir. */
function normmatikWhatsappBaglantisi(mesaj) {
    const m = mesaj || NORMMATIK_ILETISIM.lisansMesaji;
    return "https://wa.me/" + NORMMATIK_ILETISIM.telefon
        + "?text=" + encodeURIComponent(m);
}

if (typeof window !== 'undefined') {
    window.NORMMATIK_ILETISIM = NORMMATIK_ILETISIM;
    window.normmatikWhatsappBaglantisi = normmatikWhatsappBaglantisi;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NORMMATIK_ILETISIM, normmatikWhatsappBaglantisi };
}

/**
 * NORMMATİK — LİSANS FİYATI (TEK KAYNAK)
 * =============================================================================
 * NEDEN AYRI BİR DOSYA (08.09.2026):
 *   Fiyat DÖRT ayrı yerde yazılıydı: lisans penceresindeki kart, o pencereden
 *   gönderilen WhatsApp mesajı, index.html'deki fiyat kutusu ve index.html'in
 *   JSON-LD "Offer" şeması. Fiyat değiştiğinde dördünü birden güncellemek
 *   gerekiyordu; biri unutulursa HATA VERMEZ, sessizce çelişirdi — site bir
 *   fiyat, uygulama başka bir fiyat söylerdi.
 *
 *   Artık tek yer burasıdır. Uygulama tarafı bu sabiti doğrudan okur;
 *   index.html ise `python tools/build_bundle.py` çalıştığında buradan
 *   otomatik güncellenir (bkz. build_bundle.py -> fiyat_senkronize).
 *
 * DEĞİŞTİRİRKEN: yalnızca aşağıdaki değerleri düzenleyin, sonra
 *   python tools/build_bundle.py
 * çalıştırın. Başka hiçbir dosyaya dokunmayın.
 */
const NORMMATIK_FIYAT = {
    tutar: 490,                  // sayı — JSON-LD "price" alanına bu gider
    paraBirimi: "TRY",
    simge: "₺",
    gosterim: "490 ₺",           // uygulama içi gösterim
    gosterimSite: "490 TL",      // karşılama sayfası gösterimi
    sureAy: 12,
    kapsamMetni: "okul başına · 12 ay",
    // Sürenin NE ZAMAN başladığı: "2026-2027 sezonu" değil, satın alma tarihi.
    // Site ile uygulama bu noktada çelişiyordu (08.09.2026'da hizalandı).
    sureNotu: "Satın alma tarihinden itibaren 12 ay",
    semaAciklama: "Okul başına 12 aylık lisans"
};

if (typeof window !== 'undefined') {
    window.NORMMATIK_FIYAT = NORMMATIK_FIYAT;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NORMMATIK_FIYAT };
}

# 🌐 NormMatik™ — Domain Bağlama, Cloudflare & GitHub Pages Canlı Dağıtım Rehberi
## 🚀 `www.normmatik.com.tr` ve `www.normmatik.com` Sıfır Maliyetli Canlı Yayına Alma Rehberi

> Bu rehber, satın aldığınız `normmatik.com.tr` ve `normmatik.com` alan adlarını **GitHub Pages** ve **Cloudflare** üzerine bağlayarak **0 TL sunucu masrafıyla** ömür boyu kesintisiz, ışık hızında ve SSL sertifikalı olarak canlıya alma adımlarını içerir.

---

### 1. 📂 GitHub Deposu Oluşturma (5 Dakika)

1. [GitHub.com](https://github.com)'a giriş yapın (Hesabınız yoksa ücretsiz açın).
2. Sağ üstten **`New repository`** (Yeni Depo) butonuna basın.
3. Depo adını belirleyin: `normmatik` (veya `normmatik-app`).
4. Gizlilik seçeneğini **Public** (Açık) yapın ve **Create repository**'ye basın.
5. Bilgisayarınızdaki `01_uygulama` klasöründeki dosyaları (`index.html`, `manifest.json`, `sw.js`, `css/`, `js/`, `version.json`) bu depoya yükleyin.

---

### 2. ⚡ GitHub Pages ile Ücretsiz Yayına Alma (1 Dakika)

1. GitHub'da deponuzun **Settings (Ayarlar)** sekmesine tıklayın.
2. Sol menüden **Pages** seçeneğine girin.
3. **Branch** kısmından `main` ve `/ (root)` seçip **Save**'e basın.
4. 30 saniye içinde siteniz `https://kullaniciadiniz.github.io/normmatik` adresinde canlıya çıkar!

---

### 3. 🌐 `normmatik.com.tr` Özel Alan Adını Bağlama (Custom Domain)

1. Natro'da (veya alan adını aldığınız firmada) **DNS Yönetimi** sayfasına gidin.
2. Aşağıdaki CNAME / A Kayıtlarını ekleyin:
   * **CNAME:** `www` ➔ `kullaniciadiniz.github.io`
   * **A Kayıtları (@):**
     * `185.199.108.153`
     * `185.199.109.153`
     * `185.199.110.153`
     * `185.199.111.153`
3. GitHub Pages ayarlarında **Custom domain** kutusuna `www.normmatik.com.tr` yazıp **Save**'e basın.
4. **"Enforce HTTPS"** kutucuğunu işaretleyin (Ücretsiz yeşil kilitli SSL sertifikası otomatik tanımlanır).

---

### 4. 🔄 Güncelleme Yapmak İstediğinizde:

1. Kendi bilgisayarınızda `normRulesConfig.js` veya arayüzde bir değişiklik yapın.
2. Dosyaları GitHub'a yükleyin (`git push` veya webden sürükle-bırak).
3. **10 saniye içinde** tüm Türkiye'deki kullanıcıların ekranı yeni sürüme güncellenir!

---

### 5. 🛡️ Güvenlik Hatırlatması:

* `lisanslama/Burhan_Aysan_Lisans_Ureteci.html` dosyasını ve `master_private_key.json` dosyasını **ASLA** GitHub'a yüklemeyiniz. Bu dosyalar sadece sizin şahsi bilgisayarınızda ve cep telefonunuzda kalmalıdır.

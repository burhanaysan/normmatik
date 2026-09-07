/* ===========================================================================
   NormMatik™ — SEÇMELİ DERS TEMA KURALLARI DENETİMİ
   ===========================================================================
   NEDEN VAR (kullanıcı sorusu, 07.09.2026)
   ----------------------------------------
   "3-Tema Seçmeli Ders Tercih Dengesi" sekmesi mevzuata uygun mu? Ölçüldü,
   DEĞİLDİ:

     • Tema, dersin ADINDAN tahmin ediliyordu; resmî `grup` alanı elde olduğu
       hâlde kullanılmıyordu. Eşleşmeyen ders SESSİZCE "Bilim" sayılıyordu.
     • Tek kural bütün okullara uygulanıyordu ("üç temanın üçü de olmalı").
       Bu kural yalnızca ortaokulda ve 9-10. sınıfta doğru. Sekme; 11-12.
       sınıflarda, güzel sanatlar ve spor liselerinde, imam hatip liselerinde,
       meslek liselerinde ve MESEM'de YANLIŞ UYARI üretiyordu.
     • Kaynak veride grup adı satır kırılmasından ikiye bölünmüştü
       ("İNSAN, TOPLUM" + "VE BİLİM").

   Bu test, mevzuattan okunan kuralları sabitler. Kaynaklar:
     · İlköğretim Kurumları Haftalık Ders Çizelgesi (ortaokul 5-8)
     · TTKB Sayı 05 / 24 / 25   (Anadolu, Fen, Sosyal Bilimler, özel program)
     · TTKB Sayı 06 / 07 / 09   (Güzel Sanatlar, Spor)
     · DÖGM İHL çizelgesi md. 1 ve 8 (A/B grubu — tema sistemi YOK)

   Çalıştırma: node tools/test_secmeliTema.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

let gecen = 0;
const hatalar = [];
const denetle = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};

/* ---- motoru yükle ------------------------------------------------------ */
const w = {};
const ctx = {
    window: w, self: w, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    crypto: { getRandomValues: (a) => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {}
};
ctx.globalThis = ctx;
w.dispatchEvent = () => true;
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(
    fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);

const K = w.SECMELI_TEMA_KURALLARI;
if (!K) { console.log("\n❌ ÖLÇÜM GEÇERSİZ: SECMELI_TEMA_KURALLARI pakete girmemiş."); process.exit(1); }
const RE = new (w.MebReportsEngine)();
if (typeof RE.generateElectiveThemeReport !== "function") {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: generateElectiveThemeReport yok."); process.exit(1);
}

/* ---- yardımcılar ------------------------------------------------------- */
const ders = (ad, grup, saat) => ({ ders: ad, saat: saat || 2, grup: grup, kategori: "SEÇMELİ DERSLER" });

const rapor = (okulTuru, sinif, secmeliler) => RE.generateElectiveThemeReport({
    okulBilgisi: { okulAdi: "TEST", okulTuru: okulTuru },
    subeler: [{ id: "s1", subeAdi: sinif + "-A", sinifSeviyesi: String(sinif),
                ogrenciSayisi: 30, zorunluDersler: [], secmeliDersler: secmeliler }]
});
const ilk = (r) => r.themeSections[0];

/* ======================= 1) KANONİK GRUP ÇÖZÜMLEME ===================== */
{
    denetle("tam grup adları doğru çözülüyor",
        K.temaCoz("İNSAN, TOPLUM VE BİLİM") === "BILIM"
        && K.temaCoz("DİN, AHLAK VE DEĞER") === "DEGER"
        && K.temaCoz("KÜLTÜR, SANAT VE SPOR") === "SANAT");

    denetle("küçük/büyük harf yazımı fark etmiyor",
        K.temaCoz("İnsan, Toplum ve Bilim") === "BILIM"
        && K.temaCoz("Din, Ahlak ve Değer") === "DEGER"
        && K.temaCoz("Kültür, Sanat ve Spor") === "SANAT");

    // PDF satır kırılmasından doğan YARIM adlar. Havuzda gerçekten böyle
    // duruyorlar; müşterinin kayıtlı şubesinde de böyle kalmış olabilir.
    denetle("yarım grup adları onarılıyor (İnsan, Toplum ve Bilim)",
        K.temaCoz("İNSAN, TOPLUM") === "BILIM"
        && K.temaCoz("İNSAN, TOPLUM VE") === "BILIM"
        && K.temaCoz("VE BİLİM") === "BILIM"
        && K.temaCoz("BİLİM") === "BILIM");

    denetle("yarım grup adları onarılıyor (Kültür, Sanat ve Spor)",
        K.temaCoz("KÜLTÜR, SANAT") === "SANAT" && K.temaCoz("VE SPOR") === "SANAT");

    denetle("Akademik Çalışmalar TEMA SAYILMIYOR",
        K.temaCoz("AKADEMİK ÇALIŞMALAR") === "AKADEMIK" && !K.temaMi("AKADEMIK"));

    denetle("program/proje grupları tema sayılmıyor",
        K.temaCoz("MUSİKİ PROGRAMI/PROJESİ DERSLERİ") === "PROGRAM"
        && K.temaCoz("SPOR PROGRAMI SEÇMELİ DERSLERİ") === "PROGRAM");

    denetle("bilinmeyen grup SESSİZCE bir temaya düşmüyor",
        K.temaCoz("Falanca Filanca") === "BILINMIYOR" && K.temaCoz("") === "BILINMIYOR",
        "eski kodun en tehlikeli yanı buydu: tanımadığını Bilim sayıyordu");
}

/* ============ 2) HAVUZDAKİ HER GRUP ADI ÇÖZÜLEBİLİYOR MU? ============== */
{
    const havuz = fs.readFileSync(path.join(KOK, "js", "secmeli_havuzu.js"), "utf8");
    const adlar = [...new Set([...havuz.matchAll(/grup: "([^"]+)"/g)].map(m => m[1]))];
    const cozulmeyen = adlar.filter(a => K.temaCoz(a) === "BILINMIYOR");
    denetle("ölçüm geçerli: havuzdan grup adı okunabiliyor", adlar.length > 15,
        adlar.length + " farklı ad");
    denetle("havuzdaki HER grup adı bir kovaya çözülüyor", cozulmeyen.length === 0,
        "çözülemeyen: " + cozulmeyen.join(" | "));
}

/* ==================== 3) KURAL SEÇİMİ — okul × sınıf =================== */
{
    const k = (t, s) => K.kuralBul(t, s);

    denetle("ortaokul 5-8: üç temanın hepsi",
        ["5", "6", "7", "8"].every(s => { const r = k("ortaokul_temel_egitim", s);
            return r && r.enAzFarkli === 3 && r.temalar.length === 3; }));

    denetle("genel lise 9-10: üç temanın hepsi",
        ["9", "10"].every(s => { const r = k("anadolu_lisesi", s);
            return r && r.enAzFarkli === 3 && r.temalar.length === 3; }));

    denetle("genel lise 11-12: üç temadan EN AZ İKİSİ",
        ["11", "12"].every(s => { const r = k("anadolu_lisesi", s);
            return r && r.enAzFarkli === 2 && r.temalar.length === 3; }),
        "TTKB Sayı 05: '...en az ikisinden birer ders'");

    denetle("fen / sosyal bilimler / özel program aynı kurala tabi",
        ["fen_lisesi", "sosyal_bilimler_lisesi", "ozel_program_fen_lisesi",
         "ozel_program_sosyal_lisesi", "hazirlik_anadolu_lisesi", "hazirlik_fen_lisesi"]
            .every(t => { const a = k(t, "9"), b = k(t, "11");
                return a && a.enAzFarkli === 3 && b && b.enAzFarkli === 2; }));

    denetle("güzel sanatlar / spor: yalnız İKİ tema, dört seviyede de",
        ["guzel_sanatlar_gorsel", "guzel_sanatlar_muzik", "guzel_sanatlar_tiyatro",
         "guzel_sanatlar_turk_muzigi", "spor_lisesi"]
            .every(t => ["9", "10", "11", "12"].every(s => { const r = k(t, s);
                return r && r.temalar.length === 2 && r.enAzFarkli === 2
                    && r.temalar.indexOf("SANAT") < 0; })),
        "TTKB Sayı 06/07/09: yalnız 'insan, toplum ve bilim' + 'din, ahlak ve değer'");

    denetle("imam hatip LİSESİ'nde tema kuralı YOK (A/B grubu sistemi)",
        ["9", "10", "11", "12"].every(s => !k("anadolu_imam_hatip_lisesi", s)
            && !k("hazirlik_imam_hatip_lisesi", s)),
        "DÖGM çizelgesi md. 1 ve 8");

    denetle("imam hatip ORTAOKULU'nda kural yok (çizelgesinde seçim kuralı yok)",
        ["5", "6", "7", "8"].every(s => !k("imam_hatip_ortaokulu", s)));

    denetle("meslek liseleri ve MESEM'de kural yok",
        ["mesleki_ve_teknik_anadolu_lisesi", "anadolu_teknik_programi", "meslek_okulu",
         "mesleki_egitim_merkezi", "meslek_ortaokulu"]
            .every(t => ["9", "10", "11", "12"].every(s => !k(t, s))));

    denetle("özel eğitim okullarında kural yok",
        ["ozel_egitim_meslek_okulu", "ozel_egitim_uygulama_okulu"]
            .every(t => !k(t, "9") && !k(t, "10")));

    denetle("hazırlık sınıfında kural yok (metin yalnız 9-12'yi sayıyor)",
        !k("anadolu_lisesi", "hazirlik") && !k("hazirlik_fen_lisesi", "hazirlik"));

    denetle("her kuralın mevzuat KAYNAĞI yazılı",
        K.KURALLAR.every(r => r.kaynak && r.kaynak.length > 10 && r.metin && r.metin.length > 20));
}

/* ==================== 4) RAPOR DAVRANIŞI =============================== */
{
    // 9. sınıf, sadece iki tema seçilmiş -> EKSİK olmalı
    const r1 = ilk(rapor("anadolu_lisesi", 9, [
        ders("Bilgi Kuramı", "İNSAN, TOPLUM VE BİLİM"),
        ders("Temel Dinî Bilgiler", "DİN, AHLAK VE DEĞER")
    ]));
    denetle("9. sınıfta iki tema YETMİYOR", r1.uyum && r1.uyum.uygun === false
        && r1.uyum.eksik.indexOf("SANAT") >= 0);

    // 11. sınıf, aynı iki tema -> UYGUN olmalı
    const r2 = ilk(rapor("anadolu_lisesi", 11, [
        ders("Bilgi Kuramı", "İNSAN, TOPLUM VE BİLİM"),
        ders("Temel Dinî Bilgiler", "DİN, AHLAK VE DEĞER")
    ]));
    denetle("11. sınıfta iki tema YETİYOR", r2.uyum && r2.uyum.uygun === true,
        "eski kod burada yanlış uyarı veriyordu");

    // Güzel sanatlar: "Kültür, Sanat ve Spor" YOK -> yine de UYGUN
    const r3 = ilk(rapor("guzel_sanatlar_muzik", 10, [
        ders("Bilgi Kuramı", "İNSAN, TOPLUM VE BİLİM"),
        ders("Temel Dinî Bilgiler", "DİN, AHLAK VE DEĞER")
    ]));
    denetle("güzel sanatlarda 'Kültür, Sanat ve Spor' eksikliği uyarı ÜRETMİYOR",
        r3.uyum && r3.uyum.uygun === true,
        "o okul türünde şart değil (Sayı 07)");

    // İmam hatip lisesi -> hiç uyum nesnesi olmamalı
    const r4 = rapor("anadolu_imam_hatip_lisesi", 10, [ders("Fıkıh Okumaları", "Temel İslam Bilimleri")]);
    denetle("imam hatip lisesinde uygunluk uyarısı HİÇ çıkmıyor",
        ilk(r4).uyum === null && r4.kuralliSubeVar === false);
    denetle("imam hatip lisesinde nedeni açıklayan not var",
        (r4.turNotu || "").indexOf("A") >= 0 && r4.turNotu.length > 40);

    // Meslek lisesi -> uyarı yok
    const r5 = rapor("mesleki_ve_teknik_anadolu_lisesi", 11, [ders("Girişimcilik", "AKADEMİK ÇALIŞMALAR")]);
    denetle("meslek lisesinde uygunluk uyarısı çıkmıyor",
        ilk(r5).uyum === null && r5.kuralliSubeVar === false);

    // Grubu bilinmeyen ders BİLİM sayılmamalı
    const r6 = ilk(rapor("anadolu_lisesi", 9, [ders("Adı Bilinmeyen Ders", "Falanca Grup")]));
    denetle("grubu belirsiz ders BİLİM'e sayılmıyor",
        r6.stats.BILIM.count === 0 && r6.stats.BILINMIYOR.count === 1);

    // Akademik Çalışmalar tema sayılmamalı
    // "Seçmeli Matematik" resmî çizelgede gerçekten AKADEMİK ÇALIŞMALAR'da.
    // (Önce "Matematik Uygulamaları" yazılmıştı; o ders çizelgede
    //  "İnsan, Toplum ve Bilim" grubunda ve düzeltme sonrası havuzdan öyle
    //  çözülüyor — test bunu doğru şekilde yakaladı.)
    const r7 = ilk(rapor("anadolu_lisesi", 9, [
        ders("Seçmeli Matematik", "AKADEMİK ÇALIŞMALAR"),
        ders("Temel Dinî Bilgiler", "DİN, AHLAK VE DEĞER"),
        ders("Spor Eğitimi", "KÜLTÜR, SANAT VE SPOR")
    ]));
    denetle("Akademik Çalışmalar tema yerine geçmiyor",
        r7.stats.AKADEMIK.count === 1 && r7.stats.BILIM.count === 0
        && r7.uyum.uygun === false && r7.uyum.eksik.indexOf("BILIM") >= 0);

    // YARIM grup adıyla kayıtlı eski veri de doğru sayılmalı
    const r8 = ilk(rapor("anadolu_lisesi", 11, [
        ders("Eski Kayıt", "VE BİLİM"), ders("Eski Kayıt 2", "DİN, AHLAK VE DEĞER")
    ]));
    denetle("yarım grup adıyla KAYITLI eski veri doğru sayılıyor",
        r8.stats.BILIM.count === 1 && r8.uyum.uygun === true);

    // Meslek seçmelisi temaya karışmamalı
    const r9 = ilk(rapor("mesleki_ve_teknik_anadolu_lisesi", 10, [
        { ders: "Atölye", saat: 4, grup: "Bir Alan", kategori: "SEÇMELİ MESLEK DERSLERİ", isElectiveVocational: true }
    ]));
    denetle("meslek seçmelisi tema kovalarına karışmıyor",
        r9.stats.MESLEK.count === 1 && r9.stats.BILINMIYOR.count === 0);
}

/* ============ 5) HEDEF TEMELLİ DESTEK EĞİTİMİ (1-3 saat) =============== */
{
    const ht = (dagilim) => ilk(rapor("anadolu_lisesi", 12, [{
        ders: "Hedef Temelli Destek Eğitimi", saat: 6, grup: "AKADEMİK ÇALIŞMALAR",
        kategori: "SEÇMELİ DERSLER", bransDagilimi: dagilim
    }])).hedefTemelli[0];

    denetle("hedef temelli ders tanınıyor", !!ht({ Matematik: 3 }));
    denetle("ders başına 3 saat UYGUN",
        ht({ Matematik: 3, Fizik: 3 }).ihlaller.length === 0);
    denetle("ders başına 4 saat İHLAL",
        ht({ Matematik: 4, Fizik: 2 }).ihlaller.length === 1
        && ht({ Matematik: 4, Fizik: 2 }).ihlaller[0].brans === "Matematik",
        "TTKB Sayı 05: 'ders başına en az 1 en fazla 3 saat'");
    denetle("paylaştırılmamış hedef temelli işaretleniyor",
        ht(null).dagitilmamis === true);
}

/* ====== 6) SEÇİCİ ile RAPOR AYNI TEMAYI VERİYOR MU? ==================== */
/* uiComponents.getElectiveThemeInfo de eskiden temayı DERS ADINDAN tahmin
   ediyordu. Aynı ders seçicide bir tema, raporda başka tema görünebiliyordu.
   Ölçülen iki gerçek hata:
     · "Diksiyon ve Hitabet"  -> "hitabet" kelimesi yüzünden DİN sayılıyordu
     · "İslam Kültürü"        -> "islam" kelimesi yüzünden DİN sayılıyordu
   İkisinin de resmî grubu farklıydı. Tema kimliği artık tek kaynaktan gelir. */
{
    const UIsrc = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    denetle("seçici, temayı resmî HAVUZDAN çözüyor",
        /_K\.temaCozOncelikli\(_tur,\s*item\.ders/.test(UIsrc),
        "getElectiveThemeInfo havuzu esas almalı; şubede kayıtlı grup yalnızca yedek");
    denetle("resmî grup BİLİM ise ders adı taraması onu EZEMİYOR",
        /if \(!_bilimKesin && \(norm\.includes\("din"\)/.test(UIsrc)
        && /if \(!_bilimKesin && \(norm\.includes\("sanat"\)/.test(UIsrc),
        "parantez şart: '&&' , '||' den önce bağlar");
}

/* ====== 7) UYGUN SATIRDA DA GRUP SAYISI GÖRÜNÜYOR MU? ================= */
/* Kullanıcı sorusu (07.09.2026): 11-12. sınıfta üç gruptan ikisi yeterli.
   Yalnız yeşil rozet görününce "üçü de tamam mı?" tereddüdü doğuyordu.
   Artık uygun satırda da "2/3 grup" yazıyor, eksik grubun adı da — ama
   uyarı olarak değil, "bu seviyede şart değil" notuyla. */
{
    const UIsrc2 = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    denetle("uygun satırda kaç gruptan seçildiği yazıyor",
        /saglananSayi\}\/\$\{sec\.uyum\.kapsamSayi\} grup/.test(UIsrc2));
    denetle("uygun satırdaki eksik grup UYARI olarak sunulmuyor",
        /bu seviyede şart değil/.test(UIsrc2));
}

/* ====== 8) HAVUZ TEK YETKİLİ KAYNAK ==================================== */
/* Müşteri bildirimi (07.09.2026): kaynak çizelgedeki grup hataları
   düzeltildiği hâlde ekranda hâlâ eski tema görünüyordu.

   Sebebi: ders şubeye eklenirken `grup` alanı O ANDAKİ havuz değeriyle
   KOPYALANIYOR, sonra hep o kopya kullanılıyordu. Yani veri düzeltmesi
   zaten eklenmiş dersleri düzeltmiyordu — müşterinin kaydında eski grup
   duruyordu.

   Kural: tema ÖNCE havuzdan okunur, kayıtlı `grup` yalnızca yedektir.
   Böylece hiçbir müşteri verisine dokunmadan geçmiş kayıtlar da düzelir. */
{
    // Bu üç ders, resmî çizelgede "Kültür, Sanat ve Spor" grubunda; eski
    // ayrıştırıcı hepsini "Din, Ahlak ve Değer" yazmıştı.
    const ESKI = "DİN, AHLAK VE DEĞER";
    denetle("kayıtlı ESKİ grup, havuzdaki doğru grup tarafından eziliyor",
        K.temaCozOncelikli("anadolu_lisesi", "Adabımuaşeret", ESKI) === "SANAT"
        && K.temaCozOncelikli("anadolu_lisesi", "Türk Sosyal Hayatında Aile", ESKI) === "SANAT"
        && K.temaCozOncelikli("anadolu_lisesi", "İslam Bilim Tarihi", ESKI) === "SANAT",
        "müşterinin bildirdiği üç ders");

    denetle("etiketin üstünde kalan dersler de düzeldi",
        K.temaCozOncelikli("anadolu_lisesi", "Demokrasi ve İnsan Hakları", ESKI) === "BILIM"
        && K.temaCozOncelikli("anadolu_lisesi", "Düşünme Eğitimi", ESKI) === "BILIM"
        && K.temaCozOncelikli("anadolu_lisesi", "Astronomi ve Uzay Bilimleri", "AKADEMİK ÇALIŞMALAR") === "BILIM");

    denetle("doğru olan kayıt bozulmuyor",
        K.temaCozOncelikli("anadolu_lisesi", "Kur'an-ı Kerim", ESKI) === "DEGER");

    denetle("havuzda olmayan derste kayıtlı değer YEDEK olarak kullanılıyor",
        K.temaCozOncelikli("anadolu_lisesi", "Böyle Bir Ders Yok", "KÜLTÜR, SANAT VE SPOR") === "SANAT");

    denetle("çizelgede düzeltilen gruplar havuza yansımış",
        K.havuzdanGrup("anadolu_lisesi", "Adabımuaşeret") === "KÜLTÜR, SANAT VE SPOR"
        && K.havuzdanGrup("fen_lisesi", "Düşünme Eğitimi") === "İNSAN, TOPLUM VE BİLİM",
        "kaynak JSON PDF'in tablo çizgilerinden yeniden yazıldı");

    // Sayı 05 kapsamındaki turlerde artik YARIM grup adi kalmamali.
    const havuz2 = fs.readFileSync(path.join(KOK, "js", "secmeli_havuzu.js"), "utf8");
    const YARIM = ["VE BİLİM", "İNSAN, TOPLUM", "İNSAN, TOPLUM VE", "KÜLTÜR, SANAT", "VE SPOR"];
    const sayi05 = ["anadolu_lisesi", "hazirlik_anadolu_lisesi", "fen_lisesi",
                    "hazirlik_fen_lisesi", "sosyal_bilimler_lisesi"];
    const bozuk = [];
    for (const t of sayi05) {
        const blok = (havuz2.split('"' + t + '": {')[1] || "").split("\n    },")[0];
        for (const y of YARIM) if (blok.indexOf('grup: "' + y + '"') >= 0) bozuk.push(t + " -> " + y);
    }
    denetle("Sayı 05 türlerinde yarım grup adı kalmadı", bozuk.length === 0, bozuk.join(" | "));
}

/* ====== 9) SPOR LİSESİ ve ORTAOKUL — aynı kayma tekrarlamasın ==========
   08.09.2026: Sayı 09 (Spor Lisesi) ve Sayı 10 (Tematik Spor) çizelgeleri de
   Sayı 05/06/07 ile BİREBİR aynı kaymayı taşıyordu — 11'er ders. Sebep aynı:
   birleştirilmiş grup hücresinin etiketi hücrenin ortasına yazılıyor,
   metin sırasına bakan ayrıştırıcı dersleri bir bant yukarı kaydırıyor.

   Bu bölüm, düzeltilmiş değerleri kilitler. Ortaokul satırları ise
   DENETLENMİŞ ve zaten doğru çıkmıştır (30/30); buraya, ileride bir
   yeniden üretim onu bozarsa yakalansın diye konuldu. */
{
    const S = "spor_lisesi", O = "ortaokul_temel_egitim";

    denetle("spor lisesi: etiketin ALTINDAKİ dersler Kültür/Sanat/Spor'da",
        K.havuzdanGrup(S, "Adabımuaşeret") === "KÜLTÜR, SANAT VE SPOR"
        && K.havuzdanGrup(S, "Türk Sosyal Hayatında Aile") === "KÜLTÜR, SANAT VE SPOR"
        && K.havuzdanGrup(S, "İslam Bilim Tarihi") === "KÜLTÜR, SANAT VE SPOR",
        "Sayı 09 çizelgesi, PDF tablo çizgilerinden doğrulandı");

    denetle("spor lisesi: etiketin ÜSTÜNDEKİ dersler İnsan/Toplum/Bilim'de",
        K.havuzdanGrup(S, "Astronomi ve Uzay Bilimleri") === "İNSAN, TOPLUM VE BİLİM"
        && K.havuzdanGrup(S, "Düşünme Eğitimi") === "İNSAN, TOPLUM VE BİLİM"
        && K.havuzdanGrup(S, "Demokrasi ve İnsan Hakları") === "İNSAN, TOPLUM VE BİLİM");

    denetle("spor lisesi: doğru olan Din/Ahlak/Değer kaydı bozulmadı",
        K.havuzdanGrup(S, "Kur'an-ı Kerim") === "DİN, AHLAK VE DEĞER");

    // Ortaokul havuzu grup adlarini BASLIK harfle tutuyor ("Kültür, Sanat
    // ve Spor"), lise havuzu BUYUK harfle. Uygulama ikisini de temaCoz ile
    // cozdugu icin dogru olcut ham metin degil KANONIK temadir.
    denetle("ortaokul teması PDF ile birebir (30/30 denetlendi)",
        K.temaCozOncelikli(O, "Görgü Kuralları ve Nezaket", "") === "SANAT"
        && K.temaCozOncelikli(O, "Türk Sosyal Hayatında Aile", "") === "BILIM"
        && K.temaCozOncelikli(O, "Ahlak ve Vatandaşlık Eğitimi", "") === "DEGER",
        "ortaokul çizelgesinde kayma YOK; bu satır bozulmayı yakalamak için");

    // Kayma imzasi: "Adabimuaseret"in DIN/AHLAK/DEGER'de gorunmesi. Tema
    // havuzu olan HICBIR turde bir daha olmamali.
    const havuz3 = fs.readFileSync(path.join(KOK, "js", "secmeli_havuzu.js"), "utf8");
    const turler = [...havuz3.matchAll(/^\s{4}"([a-z_0-9]+)": \{/gm)].map(m => m[1]);
    const kaymis = [];
    for (const t of turler) {
        const g = K.havuzdanGrup(t, "Adabımuaşeret");
        if (g && g.indexOf("AHLAK") >= 0) kaymis.push(t);
    }
    denetle("havuzdaki okul türleri okunabildi", turler.length >= 10,
        "bulunan: " + turler.length);
    denetle("hiçbir okul türünde eski kayma imzası kalmadı",
        kaymis.length === 0, kaymis.join(", "));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ SEÇMELİ TEMA DENETİMİ HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ SEÇMELİ TEMA DENETİMİ DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));

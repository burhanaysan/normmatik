/* Rapor çıktısını tarayıcıda görebilmek için tek dosyalık önizleme üretir.
   Çıktı: _onizleme_rapor.html (geçici, sürüm kontrolüne girmez). */
import fs from "fs"; import path from "path"; import vm from "vm";
import { fileURLToPath } from "url";
const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const win={}; const ctx={window:win,console:{log(){},warn(){},error(){}},
 localStorage:{getItem:()=>null,setItem(){},removeItem(){},clear(){}},
 sessionStorage:{getItem:()=>null,setItem(){},removeItem(){},clear(){}},
 navigator:{userAgent:"node"},location:{href:"x"},screen:{width:1920,height:1080},
 setTimeout,clearTimeout,setInterval,clearInterval,crypto:{getRandomValues:a=>a},
 CustomEvent:class{constructor(t,o){this.type=t;Object.assign(this,o);}},alert(){}};
ctx.globalThis=ctx; win.dispatchEvent=()=>true; win.addEventListener=()=>{};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(KOK,"js","bundle.js"),"utf8").replace(/^export /gm,""),ctx);
const st=win.appState, ce=win.curriculumEngine;
win.licenseManager.licenseStatus={isValid:true,isMaster:true,isDemo:false,maxSections:-1,allowExport:true};
st.state=st.getDefaultState();
st.state.okulBilgisi.okulTuru="anadolu_lisesi";
st.state.okulBilgisi.okulAdi="Örnek Anadolu Lisesi";
["9","9","10","10","11","12","12","11"].forEach((g,i)=>st.addSection({subeAdi:g+"-"+"ABCDEFGH"[i],
  sinifSeviyesi:g,ogrenciSayisi:30,zorunluDersler:ce.getMandatoryCourses("anadolu_lisesi",g,null,null)}));
st.state.mevcutOgretmenler={"Matematik":5,"Türk Dili ve Edebiyatı":1,"Fizik":0};
st.state.okulBilgisi.adminOptions={...(st.state.okulBilgisi.adminOptions||{}),
  mevcutRehberOgretmeni:3, mevcutIdareciler:{mudur:1,mudurBasyardimcisi:1,mudurYardimcisi:1,rehberOgretmeni:3}};
const R=new win.MebReportsEngine(win.dbService,win.normEngine,win.curriculumEngine);
const UI=new win.UIComponentManager(win.dbService,st,win.normEngine,win.curriculumEngine);
// Yedi raporun HEPSİ üretilir; en geniş tablo hangisiyse taşmayı o belirler.
const raporlar=[];
const uret=(ad,ciz,gen,...arg)=>{
  try{ const d=R[gen](...arg); const h=UI[ciz](d,false)||"";
       raporlar.push(`<h2 style="margin:24px 0 8px;font-size:14px">▼ ${ad}</h2><div data-rapor="${ad}">${h}</div>`);
  }catch(e){ raporlar.push(`<p>HATA ${ad}: ${e.message}</p>`); }
};
uret("Yonetici Icmali","renderExecutiveReport","generateExecutiveSummary",st.state);
uret("Brans Detay","renderBranchDetailReport","generateBranchDetailReport",st.state,"ALL");
const rapor=raporlar.join("");
fs.writeFileSync(path.join(KOK,"_onizleme_rapor.html"),
`<!DOCTYPE html><html lang="tr" data-theme="light"><head><meta charset="utf-8">
<title>Rapor önizleme</title><link rel="stylesheet" href="css/app.css"></head>
<body style="padding:16px;background:var(--bg-main);">${rapor}</body></html>`);
console.log("_onizleme_rapor.html yazildi");

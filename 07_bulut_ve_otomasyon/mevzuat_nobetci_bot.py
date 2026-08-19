"""
NormMatik™ — Resmî Gazete & TTKB Mevzuat Nöbetçi Robotu (MevzuatNobetciBot v1.0)
5846 Sayılı FSEK Korumalı • Geliştirici: Burhan AYSAN

Bu script; T.C. Resmî Gazete ve MEB Talim ve Terbiye Kurulu Başkanlığı duyuru
kanallarını tarayarak Norm Kadro, Haftalık Ders Çizelgeleri ve Öğretmen Atama
yönetmelik değişikliklerini anında tespit eder ve geliştiriciye raporlar.
"""

import os
import sys
import ssl
import json
import datetime
import urllib.request
import urllib.error

# Windows console encoding fix
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

KEYWORDS = [
    "norm kadro",
    "haftalık ders çizelgesi",
    "haftalik ders cizelgesi",
    "talim ve terbiye",
    "öğretmen atama",
    "ogretmen atama",
    "yönetmelik değişikliği",
    "yonetmelik degisikligi",
    "maarif modeli",
    "ders saati",
    "müdür yardımcısı normu"
]

TARGET_SOURCES = [
    {
        "name": "T.C. Resmî Gazete",
        "url": "https://www.resmigazete.gov.tr",
        "type": "official_gazette"
    },
    {
        "name": "MEB Talim ve Terbiye Kurulu Başkanlığı",
        "url": "https://ttkb.meb.gov.tr",
        "type": "ttkb"
    },
    {
        "name": "MEB Resmî Duyurular",
        "url": "https://www.meb.gov.tr",
        "type": "meb_main"
    }
]

def fetch_page_content(url, timeout=8):
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NormMatikBot/1.0 (+https://www.normmatik.com.tr)"
            }
        )
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[!] {url} kaynağına ulaşılamadı ({e})")
        return None

def scan_sources():
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print("================================================================================")
    print(f"NormMatik Mevzuat Nobetci Robotu Calisti [{now_str}]")
    print("================================================================================")

    findings = []

    for src in TARGET_SOURCES:
        print(f"[*] Taraniyor: {src['name']} ({src['url']})...")
        content = fetch_page_content(src['url'])
        if not content:
            continue

        lower_content = content.lower()
        matched_keywords = []

        for kw in KEYWORDS:
            if kw in lower_content:
                matched_keywords.append(kw)

        if matched_keywords:
            print(f"  [+] DIKKAT: {src['name']} uzerinde eslesen anahtar kelimeler bulundu: {matched_keywords}")
            findings.append({
                "source": src['name'],
                "url": src['url'],
                "keywords": matched_keywords,
                "timestamp": now_str
            })
        else:
            print(f"  [-] Yeni veya olagan disi norm mevzuat degisikligi tespit edilmedi.")

    # Raporu kaydet
    log_dir = os.path.dirname(os.path.abspath(__file__))
    log_file = os.path.join(log_dir, "mevzuat_tarama_raporu.json")

    report_data = {
        "last_scan": now_str,
        "status": "COMPLETED",
        "findings_count": len(findings),
        "findings": findings
    }

    with open(log_file, "w", encoding="utf-8") as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] Tarama tamamlandi. Rapor kaydedildi: {log_file}")
    return findings

if __name__ == "__main__":
    scan_sources()

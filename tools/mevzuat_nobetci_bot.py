"""
NormMatik™ — Resmî Gazete & TTKB Mevzuat Nöbetçi Robotu (MevzuatNobetciBot v1.0)
5846 Sayılı FSEK Korumalı • Geliştirici: Burhan AYSAN

Bu script; T.C. Resmî Gazete ve MEB Talim ve Terbiye Kurulu Başkanlığı duyuru
kanallarını tarayarak Norm Kadro, Haftalık Ders Çizelgeleri ve Öğretmen Atama
yönetmelik değişikliklerini anında tespit eder ve Telegram ile anlık bildirim gönderir.
"""

import os
import sys
import ssl
import json
import datetime
import urllib.request
import urllib.parse
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

def send_telegram_notification(token, chat_id, message):
    if not token or not chat_id:
        print("[!] Telegram Token veya Chat ID tanimli degil.")
        return False

    try:
        api_url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": str(chat_id).strip(),
            "text": message,
            "parse_mode": "HTML",
            "disable_web_page_preview": False
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            api_url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                print("[✓] Telegram bildirimi basariyla gonderildi!")
                return True
    except Exception as e:
        print(f"[!] Telegram bildirim hatasi: {e}")
    return False

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
        print(f"[!] {url} kaynagina ulasilamadi ({e})")
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

    # Telegram Bildirimi
    tg_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    tg_chat_id = os.environ.get("TELEGRAM_CHAT_ID")

    if not tg_token or not tg_chat_id:
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment") as key:
                if not tg_token:
                    tg_token, _ = winreg.QueryValueEx(key, "TELEGRAM_BOT_TOKEN")
                if not tg_chat_id:
                    tg_chat_id, _ = winreg.QueryValueEx(key, "TELEGRAM_CHAT_ID")
        except Exception:
            pass

    if tg_token and tg_chat_id:
        if findings:
            msg_lines = [
                "🚨 <b>NormMatik™ MEVZUAT NÖBETÇİSİ BİLDİRİMİ</b>\n",
                f"📅 <b>Tarama Zamanı:</b> {now_str}",
                "⚠️ <b>MEB Mevzuat / Çizelge Değişikliği Tespit Edildi:</b>\n"
            ]
            for f in findings:
                msg_lines.append(f"🏛️ <b>Kaynak:</b> {f['source']}")
                msg_lines.append(f"🔗 <b>Bağlantı:</b> {f['url']}")
                msg_lines.append(f"🔑 <b>Kelimeler:</b> {', '.join(f['keywords'])}\n")
            msg_lines.append("<i>Lütfen kural motorunu ve norm katsayılarını kontrol ediniz.</i>")
            send_telegram_notification(tg_token, tg_chat_id, "\n".join(msg_lines))
        else:
            msg_lines = [
                "🤖 <b>NormMatik™ Mevzuat Nöbetçisi Canlı & Devrede!</b>\n",
                f"📅 <b>Kontrol Saati:</b> {now_str}",
                "✅ <b>Durum:</b> Resmî Gazete ve MEB sistemleri tarandı. Her şey güncel ve stabil.",
                "\n<i>NormMatik 7/24 mevzuatınızı korumaktadır.</i>"
            ]
            send_telegram_notification(tg_token, tg_chat_id, "\n".join(msg_lines))

    return findings

if __name__ == "__main__":
    scan_sources()

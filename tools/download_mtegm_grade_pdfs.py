import os
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base_output_dir = r"C:\Users\burha\Desktop\MESLEKİ_VE_TEKNİK_ANADOLU_LİSELERİ_ÇÖP_2026"

pages = {
    "sinif_10": "https://meslek.meb.gov.tr/cercevelistele.aspx?sinif_kodu=10&kurum_id=1",
    "sinif_11": "https://meslek.meb.gov.tr/cercevelistele.aspx?sinif_kodu=11&kurum_id=1",
    "sinif_12": "https://meslek.meb.gov.tr/cercevelistele.aspx?sinif_kodu=12&kurum_id=1"
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def clean_filename(name):
    name = re.sub(r'[\\/*?:"<>|]', '_', name)
    name = re.sub(r'\s+', ' ', name)
    return name.strip()

for grade_key, page_url in pages.items():
    target_dir = os.path.join(base_output_dir, grade_key)
    os.makedirs(target_dir, exist_ok=True)
    print("\n=======================================================")
    print(f"TARANIYOR: {grade_key} -> {page_url}")
    print(f"Hedef Klasor: {target_dir}")
    print("=======================================================")

    try:
        req = urllib.request.Request(page_url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=30) as res:
            html = res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Sayfa yuklenemedi: {e}")
        continue

    # Extract all table rows
    row_matches = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL | re.IGNORECASE)
    items = []
    
    for r in row_matches:
        tds = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL | re.IGNORECASE)
        pdf_match = re.search(r'href=[\"\']([^\"\']+\.pdf[^\'\"\s]*)[\"\']', r, re.IGNORECASE)
        if pdf_match:
            pdf_url = pdf_match.group(1)
            clean_tds = [re.sub(r'<[^>]+>', '', td).strip() for td in tds]
            meaningful_text = [t for t in clean_tds if t and len(t) > 2 and 'indir' not in t.lower()]
            title = ' - '.join(meaningful_text) if meaningful_text else os.path.basename(pdf_url)
            items.append((pdf_url, title))

    if not items:
        simple_links = re.findall(r'href=[\"\']([^\"\']+\.pdf[^\'\"\s]*)[\"\']', html, re.IGNORECASE)
        items = [(l, os.path.basename(l)) for l in simple_links]

    print(f"Toplam bulunan PDF baglantisi: {len(items)}")

    downloaded = 0
    skipped = 0
    failed = 0
    seen_urls = set()

    for idx, (raw_link, raw_title) in enumerate(items, 1):
        link = raw_link.strip()
        if link.startswith('/'):
            full_url = f"https://meslek.meb.gov.tr{link}"
        elif link.startswith('http'):
            full_url = link
        else:
            full_url = f"https://meslek.meb.gov.tr/{link}"

        if full_url in seen_urls:
            continue
        seen_urls.add(full_url)

        clean_title = clean_filename(raw_title)
        if not clean_title or len(clean_title) < 3 or clean_title.lower() == 'indir':
            clean_title = os.path.basename(urllib.parse.urlparse(full_url).path)
        
        if not clean_title.lower().endswith('.pdf'):
            clean_title += '.pdf'
        
        filename = clean_title
        file_path = os.path.join(target_dir, filename)

        if os.path.exists(file_path) and os.path.getsize(file_path) > 1024:
            skipped += 1
            print(f"[{idx}/{len(items)}] [Zaten Var] {filename}")
            continue

        print(f"[{idx}/{len(items)}] [Indiriliyor] {filename} ...", end=" ", flush=True)
        try:
            parsed = urllib.parse.urlsplit(full_url)
            encoded_path = urllib.parse.quote(parsed.path)
            encoded_url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, encoded_path, parsed.query, parsed.fragment))

            pdf_req = urllib.request.Request(encoded_url, headers=headers)
            with urllib.request.urlopen(pdf_req, context=ctx, timeout=45) as pdf_res:
                pdf_data = pdf_res.read()
                if len(pdf_data) > 500:
                    with open(file_path, "wb") as f:
                        f.write(pdf_data)
                    kb = len(pdf_data) // 1024
                    print(f"Tamam ({kb} KB)")
                    downloaded += 1
                else:
                    print(f"Kucuk dosya ({len(pdf_data)} B)")
                    failed += 1
            time.sleep(0.05)
        except Exception as e:
            print(f"Hata: {e}")
            failed += 1

    print(f"\n>> {grade_key} TAMAMLANDI: Indirilen: {downloaded} | Zaten Mevcut: {skipped} | Hatali: {failed} | Toplam: {len(seen_urls)}")

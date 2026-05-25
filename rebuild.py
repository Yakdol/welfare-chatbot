import base64
import gzip
import json
import re

SRC_HTML = '/Users/yakdol/Desktop/hci-understand/prototype.html'
PATCHES = [
    ('5701081d-b58d-47e4-beb2-134c1aea8d86', '/Users/yakdol/Desktop/hci-understand/src/App.jsx'),
    ('9950f4e3-1c13-4de4-a830-6f2c755cceea', '/Users/yakdol/Desktop/hci-understand/src/responses.js'),
]
OUT_HTML = '/Users/yakdol/Desktop/hci-understand/prototype.html'

print('Reading files...')
with open(SRC_HTML, 'r', encoding='utf-8') as f:
    html = f.read()

# ── 1. Extract manifest ──────────────────────────────────────
m = re.search(r'<script type="__bundler/manifest">(.*?)</script>', html, re.DOTALL)
if not m:
    raise RuntimeError('manifest not found')
manifest = json.loads(m.group(1))

# ── 2. Patch each source file ────────────────────────────────
for uuid, src_path in PATCHES:
    with open(src_path, 'r', encoding='utf-8') as f:
        new_code = f.read()
    entry = manifest[uuid]
    was_compressed = entry.get('compressed', False)
    print(f'{src_path.split("/")[-1]} entry found  compressed={was_compressed}')
    raw = new_code.encode('utf-8')
    if was_compressed:
        raw = gzip.compress(raw, compresslevel=9)
    entry['data'] = base64.b64encode(raw).decode('ascii')

# ── 3. Serialise manifest ────────────────────────────────────
manifest_json = json.dumps(manifest, separators=(',', ':'))

# ── 4. Add viewport-fit=cover to outer <head> ────────────────
# The outer HTML head (lines 1-12) has no viewport meta — add one
if 'viewport' not in html[:2000]:
    html = html.replace(
        '<meta charset="utf-8">',
        '<meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        1
    )
    print('Added viewport meta to outer head')
else:
    # Update existing to add viewport-fit=cover
    html = re.sub(
        r'(<meta name="viewport" content="[^"]*?)(")',
        lambda mo: mo.group(1) + (', viewport-fit=cover' if 'viewport-fit' not in mo.group(1) else '') + mo.group(2),
        html, count=1
    )
    print('Updated viewport meta')

# ── 5. Replace manifest in HTML ──────────────────────────────
new_html = re.sub(
    r'(<script type="__bundler/manifest">)(.*?)(</script>)',
    lambda mo: mo.group(1) + manifest_json + mo.group(3),
    html, count=1, flags=re.DOTALL
)

if new_html == html:
    raise RuntimeError('manifest replacement had no effect')

# ── 6. Write output ──────────────────────────────────────────
with open(OUT_HTML, 'w', encoding='utf-8') as f:
    f.write(new_html)

orig_kb = len(html.encode('utf-8')) / 1024
new_kb  = len(new_html.encode('utf-8')) / 1024
print(f'Done!  {orig_kb:.0f} KB  →  {new_kb:.0f} KB')
print(f'Output: {OUT_HTML}')

import base64
import gzip
import json
import os
import re
from html.parser import HTMLParser

class ScriptExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts = {}
        self._current_type = None
        self._collecting = False

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            attrs_dict = dict(attrs)
            t = attrs_dict.get('type', '')
            if t in ('__bundler/manifest', '__bundler/template'):
                self._current_type = t
                self._collecting = True
                self.scripts[t] = ''

    def handle_data(self, data):
        if self._collecting and self._current_type:
            self.scripts[self._current_type] += data

    def handle_endtag(self, tag):
        if tag == 'script' and self._collecting:
            self._collecting = False
            self._current_type = None

src = '/Users/yakdol/Desktop/hci-understand/prototype.html'
out = '/Users/yakdol/Desktop/hci-understand/src'

print('Reading file...')
with open(src, 'r', encoding='utf-8') as f:
    html = f.read()

print('Parsing bundle...')
parser = ScriptExtractor()
parser.feed(html)

if '__bundler/manifest' not in parser.scripts:
    print('ERROR: manifest not found')
    exit(1)

manifest = json.loads(parser.scripts['__bundler/manifest'])
template = json.loads(parser.scripts['__bundler/template'])

print(f'Found {len(manifest)} assets')
os.makedirs(out, exist_ok=True)

# uuid -> filename mapping from template
uuid_to_path = {}
def walk(node):
    if isinstance(node, dict):
        if node.get('type') == 'asset' and 'uuid' in node and 'filename' in node:
            uuid_to_path[node['uuid']] = node['filename']
        for v in node.values():
            walk(v)
    elif isinstance(node, list):
        for item in node:
            walk(item)

walk(template)

for uuid, entry in manifest.items():
    filename = uuid_to_path.get(uuid, uuid)
    data = base64.b64decode(entry['data'])
    if entry.get('compressed'):
        try:
            data = gzip.decompress(data)
        except Exception as e:
            print(f'  WARN: could not decompress {filename}: {e}')

    filepath = os.path.join(out, filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    mode = 'w' if entry.get('mime', '').startswith('text') or filename.endswith(('.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.svg', '.txt', '.md')) else 'wb'
    try:
        if mode == 'w':
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(data.decode('utf-8'))
        else:
            with open(filepath, 'wb') as f:
                f.write(data)
        print(f'  extracted: {filename}')
    except Exception as e:
        with open(filepath, 'wb') as f:
            f.write(data)
        print(f'  extracted (binary): {filename}')

print(f'\nDone! Files extracted to: {out}')

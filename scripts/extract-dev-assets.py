"""Read allowlisted local Typora rendering assets for development-only integration QA.

No installed files are changed. Output is ignored artifacts/, never the release archive.
"""
import json
import os
from pathlib import Path
import struct

root = Path(__file__).resolve().parents[1]
resources = os.environ.get('TYPORA_RESOURCES')
if not resources:
    raise SystemExit('Set TYPORA_RESOURCES to an installed Typora resources folder')
archive = Path(resources) / 'lib.asar'
output = root / 'artifacts' / 'local-engines'
output.mkdir(parents=True, exist_ok=True)
targets = {
    'bootstrape/css/bootstrap.css': 'bootstrap.css',
    'diagram/mermaid.min.js': 'mermaid.min.js',
    'MathJax3/es5/tex-svg-full.js': 'tex-svg-full.js',
}
with archive.open('rb') as source:
    header = source.read(16)
    _, header_size, _, json_size = struct.unpack('<4I', header)
    tree = json.loads(source.read(json_size))
    for internal, name in targets.items():
        entry = tree
        for segment in internal.split('/'):
            entry = entry['files'][segment]
        if entry.get('unpacked') or 'offset' not in entry:
            raise SystemExit(f'Unsupported external archive entry: {internal}')
        source.seek(8 + header_size + int(entry['offset']))
        data = source.read(entry['size'])
        if len(data) != entry['size']:
            raise SystemExit(f'Truncated entry: {internal}')
        (output / name).write_bytes(data)
        print(f'Development asset: {name} ({len(data)} bytes)')

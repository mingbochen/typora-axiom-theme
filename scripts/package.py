"""Create an allowlisted, deterministic theme archive without development/private files."""
import hashlib
import json
from pathlib import Path
import subprocess
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
VERSION = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))['version']
FILES = [
    'axiom.css', 'README.md', 'LICENSE', 'CHANGELOG.md',
    'examples/showcase.md', 'examples/stress-test.md',
    'examples/customization.user.css', 'examples/assets/request-flow.svg',
    'scripts/install.ps1', 'docs/DESIGN.md', 'docs/QA.md', 'docs/RELEASE.md',
    'docs/images/browser-preview.png',
]

def main():
    subprocess.run(['node', str(ROOT / 'scripts/check.cjs')], cwd=ROOT, check=True)
    missing = [name for name in FILES if not (ROOT / name).is_file()]
    if missing:
        raise SystemExit(f'Missing release inputs: {missing}')
    destination = ROOT / 'dist'
    destination.mkdir(exist_ok=True)
    archive = destination / f'axiom-v{VERSION}.zip'
    with ZipFile(archive, 'w', compression=ZIP_DEFLATED, compresslevel=9) as output:
        for name in sorted(FILES):
            data = (ROOT / name).read_bytes()
            info = ZipInfo(f'axiom/{name}', date_time=(2026, 11, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            output.writestr(info, data)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    checksum = archive.with_suffix('.zip.sha256')
    checksum.write_text(f'{digest}  {archive.name}\n', encoding='utf-8')
    with ZipFile(archive) as output:
        assert output.testzip() is None, 'Archive integrity failed'
        assert len(output.namelist()) == len(FILES), 'Archive manifest mismatch'
    print(f'{archive}\nSHA-256 {digest}\n{len(FILES)} files; archive integrity OK')

if __name__ == '__main__':
    main()

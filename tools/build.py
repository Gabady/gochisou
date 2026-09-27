"""Build the distributable single HTML. No external dependency at runtime."""
from pathlib import Path
import re
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent

def build():
    text = (ROOT / 'tools/index.template.html').read_text()
    text = text.replace('<link rel="stylesheet" href="style.css">',
                        '<style>\n' + (ROOT / 'style.css').read_text() + '\n</style>')
    text = text.replace('href="assets/favicon.svg"',
                        'href="data:image/svg+xml,' + quote((ROOT / 'assets/favicon.svg').read_text(), safe='') + '"')
    def inline(match):
        name = match.group(1)
        source = (ROOT / name).read_text()
        source = re.sub(r'</script', r'<\\/script', source, flags=re.I)
        return '<script>\n/* ' + name + ' */\n' + source + '\n</script>'
    text = re.sub(r'<script src="([^"]+)"></script>', inline, text)
    assert not re.search(r'<script[^>]+src=', text)
    assert not re.search(r'<link[^>]+href="(?!data:)', text)
    (ROOT / 'index.html').write_text(text)
    print(f'Built index.html: {len(text.encode())} bytes; all CSS, JS and artwork embedded.')

if __name__ == '__main__':
    build()

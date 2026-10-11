#!/usr/bin/env python3
"""ビルド結果（dist/）の検査。公開前に `npm run build && python3 scripts/check-dist.py` で走らせる。
見るもの：h1 が1つ／title・description・canonical／構造化データが読める／ブログ内リンクの行き先がある／
写真が元のまま（?w= なし）で出ていない／width・height の付け忘れ／sitemap・RSS が読める。"""
import glob, json, os, re, sys, xml.dom.minidom

root = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
pages = sorted(glob.glob(root + '/**/index.html', recursive=True))
paths = {'/blog/' + os.path.relpath(os.path.dirname(p), root).replace('.', '').strip('/') + '/' for p in pages}
paths = {p.replace('//', '/') for p in paths}
ng, stats = [], dict(pages=len(pages), noindex=0, jsonld=0, images=0)
for p in pages:
    h = open(p, encoding='utf8').read()
    rel = '/blog/' + os.path.relpath(os.path.dirname(p), root).strip('./')
    bad = lambda msg: ng.append(f'{rel}: {msg}')
    if len(re.findall(r'<h1[ >]', h)) != 1: bad(f'h1 が {len(re.findall(r"<h1[ >]", h))} 個')
    t = re.search(r'<title>(.*?)</title>', h, re.S); d = re.search(r'<meta name="description" content="(.*?)"', h, re.S)
    if not t or not t.group(1).strip(): bad('title が無い')
    if not d or len(d.group(1)) < 30: bad(f'description が短い（{len(d.group(1)) if d else 0}字）')
    c = re.search(r'<link rel="canonical" href="(.*?)"', h)
    if not c or not c.group(1).startswith('https://miura-diving.com/blog/') or not c.group(1).endswith('/'): bad(f'canonical: {c.group(1) if c else None}')
    if 'noindex' in (re.search(r'<meta name="robots" content="(.*?)"', h) or [None, ''])[1]: stats['noindex'] += 1
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        try: json.loads(m.group(1)); stats['jsonld'] += 1
        except Exception as e: bad(f'構造化データが読めない: {e}')
    for m in re.finditer(r'<img\b[^>]*>', h):
        tag = m.group(0); stats['images'] += 1
        src = re.search(r'\bsrc="([^"]*)"', tag)
        if src and 'cdn.sanity.io' in src.group(1) and 'w=' not in src.group(1): bad(f'写真が元のまま: {src.group(1)[-40:]}')
        if 'width=' not in tag or 'height=' not in tag: bad(f'width/height なし: {tag[:80]}')
        if ' alt=' not in tag: bad(f'alt なし: {tag[:80]}')
    for m in re.finditer(r'href="(/blog/[^"#?]*)', h):
        href = m.group(1)
        if re.search(r'\.(xml|json|ico|png|webp|jpg)$', href): 
            if not os.path.exists(os.path.join(root, href[len('/blog/'):])): bad(f'ファイルが無い: {href}')
        elif href not in paths: bad(f'行き先が無い: {href}')
for f in ('sitemap.xml', 'rss.xml'):
    try: xml.dom.minidom.parse(os.path.join(root, f))
    except Exception as e: ng.append(f'{f}: {e}')
print(stats, 'sitemap URL', open(os.path.join(root, 'sitemap.xml')).read().count('<loc>'))
print('\n'.join(ng[:40]) if ng else 'NG なし')
sys.exit(1 if ng else 0)

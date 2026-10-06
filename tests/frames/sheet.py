# Contact sheets: one image per label, frames left to right with their timestamps.
# Usage: python3 tests/frames/sheet.py .reports/frames/<project> .reports/sheets
import collections, os, re, sys
from PIL import Image, ImageDraw

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
rows = collections.OrderedDict()
for f in sorted(os.listdir(src)):
    m = re.match(r"(.+)-(\d{4})\.png$", f)
    if m:
        rows.setdefault(m.group(1), []).append((int(m.group(2)), f))
for label, frames in rows.items():
    tiles = []
    for t, f in frames:
        im = Image.open(os.path.join(src, f)).convert("RGB")
        im = im.resize((im.width * 2 // 5, im.height * 2 // 5))
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 110, 22], fill=(220, 30, 30))
        d.text((6, 5), f"{label} {t}ms", fill="white")
        tiles.append(im)
    out = Image.new("RGB", (sum(i.width for i in tiles) + 6 * (len(tiles) - 1), tiles[0].height), "white")
    x = 0
    for i in tiles:
        out.paste(i, (x, 0))
        x += i.width + 6
    path = os.path.join(dst, f"{os.path.basename(src)}-{label}.png")
    out.save(path)
    print(path)

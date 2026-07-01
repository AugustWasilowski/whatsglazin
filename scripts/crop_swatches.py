"""Crop the diagonal (single-glaze) tiles from the Cone 6 board photo.
Outputs individual swatches + a labeled contact sheet for review."""
import os
from PIL import Image, ImageDraw

SRC = "/home/mayorawesome/whatsglazin/docs/glaze-board/cone6-board.jpg"
OUT = "/home/mayorawesome/whatsglazin/public/glazes"
os.makedirs(OUT, exist_ok=True)

# (slug, center_x, center_y) — centers of the diagonal (single-glaze) tiles.
# floating-blue (6-6) is omitted: that tile is missing from the board (bare nail),
# so it keeps its gradient swatch.
GLAZES = [
    ("satin-white", 140, 192),
    ("jr-clear", 235, 315),
    ("nutmeg", 335, 452),
    ("440-tan", 432, 572),
    ("bone", 528, 695),
    ("jr-blue-celadon", 705, 968),
    ("spearmint", 812, 1090),
    ("oribe-6", 920, 1215),
    ("weathered-bronze", 1012, 1362),
    ("metallic-black", 1110, 1478),
    ("ketchup", 1208, 1606),
    ("butterscotch", 1300, 1748),
]

BW, BH = 104, 112  # crop box size

im = Image.open(SRC).convert("RGB")
crops = []
for slug, cx, cy in GLAZES:
    box = (cx - BW // 2, cy - BH // 2, cx + BW // 2, cy + BH // 2)
    c = im.crop(box)
    c.save(os.path.join(OUT, f"{slug}.jpg"), quality=90)
    crops.append((slug, c))

# Contact sheet: 5 cols, labeled.
cols = 5
cell_w, cell_h, pad, lab = 150, 165, 10, 22
rows = (len(crops) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (245, 241, 231))
d = ImageDraw.Draw(sheet)
for i, (slug, c) in enumerate(crops):
    r, cc = divmod(i, cols)
    x, y = cc * cell_w + pad, r * cell_h + pad
    thumb = c.resize((cell_w - 2 * pad, cell_h - 2 * pad - lab))
    sheet.paste(thumb, (x, y))
    d.text((x, y + cell_h - 2 * pad - lab + 2), slug, fill=(42, 32, 24))
sheet.save("/home/mayorawesome/whatsglazin/docs/glaze-board/contact-sheet.jpg", quality=90)

# Annotated overview: draw the crop boxes on the full board.
ov = im.copy()
od = ImageDraw.Draw(ov)
for slug, cx, cy in GLAZES:
    box = (cx - BW // 2, cy - BH // 2, cx + BW // 2, cy + BH // 2)
    od.rectangle(box, outline=(230, 30, 30), width=4)
    od.text((box[0], box[1] - 16), slug[:6], fill=(230, 30, 30))
ov.thumbnail((900, 1200))
ov.save("/home/mayorawesome/whatsglazin/docs/glaze-board/overview.jpg", quality=88)
print("wrote", len(crops), "crops + contact sheet + overview")

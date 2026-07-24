#!/usr/bin/env python3
"""Generate web-optimized PREtendingMD brand assets from the high-res masters.

The hand-drawn "stuffed bear doctor" mascot ships as 2K masters (3-5 MB each)
that are too heavy to wire into the UI. This script derives slim, web-sized
assets from those masters:

  - bear-mascot.png        full doctor bear w/ stethoscope (transparent)
  - bear-head.png          clean bear-head mark (transparent)
  - wordmark.png           rainbow "PREtendingMD" wordmark (transparent)
  - favicon-32.png         32px favicon (from app tile)
  - apple-touch-icon.png   180px apple-touch-icon
  - icon-192/512.png       PWA install icons
  - icon-maskable-512.png  maskable PWA icon (app tile is full-bleed)

Run from the repo with Pillow installed:

    python3 md/apps/pmd/scripts/optimize-brand-assets.py

Outputs are written to md/apps/pmd/public/images/.
"""
import os
from PIL import Image

APP_DIR = os.path.join(os.path.dirname(__file__), "..")
ARTWORK_DIR = os.path.join(APP_DIR, "artwork", "images")
IMAGES_DIR = os.path.join(APP_DIR, "public", "images")
WORDMARK_MASTER = os.path.join(
    APP_DIR,
    "PREtendingMD Design System",
    "brand",
    "pretendingmd-wordmark.png",
)
LANCZOS = Image.LANCZOS


def save_png(im, name, quantize_colors=None):
    if quantize_colors:
        im = im.quantize(colors=quantize_colors, method=Image.FASTOCTREE)
        im = im.convert("RGBA")
    path = os.path.join(IMAGES_DIR, name)
    im.save(path, optimize=True, compress_level=9)
    print(f"  {name:26s} {im.size[0]}x{im.size[1]} {os.path.getsize(path)/1024:.0f}KB")


def fit(im, max_side):
    """Tight-crop to the alpha bounding box, then scale longest side to max_side."""
    bbox = im.split()[3].getbbox()
    if bbox:
        im = im.crop(bbox)
    w, h = im.size
    scale = max_side / max(w, h)
    return im.resize((round(w * scale), round(h * scale)), LANCZOS)


def open_master(name):
    return Image.open(os.path.join(ARTWORK_DIR, name)).convert("RGBA")


def main():
    print("App icon / favicon / PWA set:")
    app = open_master("PREtendingMD_icon.png")
    for size, name in [(32, "favicon-32.png"), (180, "apple-touch-icon.png"),
                       (192, "icon-192.png"), (512, "icon-512.png"),
                       (512, "icon-maskable-512.png")]:
        save_png(app.resize((size, size), LANCZOS), name)

    print("Mascot art (transparent):")
    save_png(fit(open_master("Bear_Scope_sticker.png"), 512), "bear-mascot.png", 256)
    save_png(fit(open_master("Bearhead.png"), 512), "bear-head.png", 256)

    # Wordmark: crop to text, fix width to 900 for crisp retina display.
    wm = Image.open(WORDMARK_MASTER).convert("RGBA")
    wm = wm.crop(wm.split()[3].getbbox())
    w, h = wm.size
    wm = wm.resize((900, round(h * 900 / w)), LANCZOS)
    save_png(wm, "wordmark.png", 256)


if __name__ == "__main__":
    main()

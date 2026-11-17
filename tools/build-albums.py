#!/usr/bin/env python3
"""Refresh data/albums.json from the photo folders.

Drop photos into assets/img/albums/<album-id>/ then run:
    python3 tools/build-albums.py
New folders become new albums (edit their titles in data/albums.json after).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ALBUMS_DIR = ROOT / "assets" / "img" / "albums"
DATA = ROOT / "data" / "albums.json"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

albums = json.loads(DATA.read_text(encoding="utf-8")) if DATA.exists() else []
by_id = {a["id"]: a for a in albums}

for folder in sorted(p for p in ALBUMS_DIR.iterdir() if p.is_dir()):
    photos = sorted(f.name for f in folder.iterdir() if f.suffix.lower() in EXTS)
    album = by_id.get(folder.name)
    if album is None:
        title = folder.name.replace("-", " ").title()
        album = {"id": folder.name, "title": {"en": title, "or": title}, "date": "", "photos": []}
        albums.append(album)
    album["photos"] = photos
    print(f"{folder.name}: {len(photos)} photos")

DATA.write_text(json.dumps(albums, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

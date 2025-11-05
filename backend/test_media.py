#!/usr/bin/env python3
"""Quick test to verify media files are accessible"""
import os
import django
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from django.test import RequestFactory
from django.views.static import serve

BASE_DIR = Path(__file__).resolve().parent
media_root = Path(settings.MEDIA_ROOT)
videos_dir = media_root / 'videos'

print("=" * 60)
print("Media Files Check")
print("=" * 60)
print(f"MEDIA_ROOT: {media_root.absolute()}")
print(f"MEDIA_URL: {settings.MEDIA_URL}")
print(f"DEBUG: {settings.DEBUG}")
print()

if not media_root.exists():
    print(f"❌ MEDIA_ROOT does not exist: {media_root}")
    os.makedirs(media_root, exist_ok=True)
    print(f"✅ Created: {media_root}")

if not videos_dir.exists():
    print(f"❌ Videos directory does not exist: {videos_dir}")
    os.makedirs(videos_dir, exist_ok=True)
    print(f"✅ Created: {videos_dir}")

print(f"\nVideos in {videos_dir}:")
videos = list(videos_dir.glob('*'))
if videos:
    for v in sorted(videos):
        if v.is_file():
            size_mb = v.stat().st_size / (1024*1024)
            readable = os.access(v, os.R_OK)
            status = "✅" if readable else "❌"
            print(f"{status} {v.name} ({size_mb:.2f} MB)")
            
            # Test URL path
            import urllib.parse
            encoded_name = urllib.parse.quote(v.name)
            print(f"   URL: http://localhost:8000/media/videos/{encoded_name}")
else:
    print("  No videos found!")
    print(f"\n📝 Copy videos from backend/video/ to {videos_dir}/")

print("\n" + "=" * 60)


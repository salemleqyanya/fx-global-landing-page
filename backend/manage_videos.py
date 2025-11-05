#!/usr/bin/env python3
"""
Script to move videos from backend/video/ to backend/media/videos/
and optionally create Video objects in the database.
"""
import os
import shutil
from pathlib import Path
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from videos.models import Video

BASE_DIR = Path(__file__).resolve().parent
VIDEO_SOURCE_DIR = BASE_DIR / 'video'
MEDIA_VIDEOS_DIR = BASE_DIR / 'media' / 'videos'

def setup_videos():
    """Move videos from backend/video/ to backend/media/videos/"""
    
    # Create media/videos directory if it doesn't exist
    MEDIA_VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if source directory exists
    if not VIDEO_SOURCE_DIR.exists():
        print(f"❌ Source directory not found: {VIDEO_SOURCE_DIR}")
        return
    
    # Get all video files
    video_files = list(VIDEO_SOURCE_DIR.glob('*.mp4')) + list(VIDEO_SOURCE_DIR.glob('*.mov'))
    
    if not video_files:
        print(f"❌ No video files found in {VIDEO_SOURCE_DIR}")
        return
    
    print(f"📹 Found {len(video_files)} video file(s)")
    
    # Copy each video to media/videos/
    copied_count = 0
    for video_file in video_files:
        dest_path = MEDIA_VIDEOS_DIR / video_file.name
        try:
            shutil.copy2(video_file, dest_path)
            print(f"✅ Copied: {video_file.name} -> media/videos/{video_file.name}")
            copied_count += 1
        except Exception as e:
            print(f"❌ Error copying {video_file.name}: {e}")
    
    print(f"\n✅ Successfully copied {copied_count} video file(s) to {MEDIA_VIDEOS_DIR}")
    print(f"\n📝 Next steps:")
    print(f"   1. Go to Django admin: http://localhost:8004/master-co/")
    print(f"   2. Add videos manually and upload from media/videos/")
    print(f"   3. Or run: python manage.py shell < create_video_objects.py")

if __name__ == '__main__':
    setup_videos()


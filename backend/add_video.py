#!/usr/bin/env python
"""
Script to add a video to the database
Usage: python add_video.py
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from videos.models import Video

def add_hero_video(vimeo_id=None, video_url=None, title="Hero Video"):
    """Add or update hero video"""
    # Check if hero video already exists
    hero_video, created = Video.objects.get_or_create(
        position='hero',
        is_active=True,
        defaults={
            'title': title,
            'vimeo_id': vimeo_id,
            'video_url': video_url,
            'order': 0,
        }
    )
    
    if not created:
        # Update existing video
        hero_video.title = title
        if vimeo_id:
            hero_video.vimeo_id = vimeo_id
        if video_url:
            hero_video.video_url = video_url
        hero_video.is_active = True
        hero_video.save()
        print(f"Updated existing hero video: {hero_video.title}")
    else:
        print(f"Created new hero video: {hero_video.title}")
    
    return hero_video

if __name__ == '__main__':
    # Add hero video with Vimeo ID
    # Replace "1133539416" with your actual Vimeo video ID
    video = add_hero_video(
        vimeo_id="1133539416",
        title="FX Global Trading Academy - Hero Video"
    )
    print(f"\n✅ Video added successfully!")
    print(f"   Title: {video.title}")
    print(f"   Vimeo ID: {video.vimeo_id}")
    print(f"   Position: {video.position}")
    print(f"   Active: {video.is_active}")
    print(f"\n💡 To change the video, edit the vimeo_id in this script or use Django admin")


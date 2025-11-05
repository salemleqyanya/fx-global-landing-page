"""
Django management command to add videos from backend/video/ directory to the database.
Usage: python manage.py add_videos_from_directory
"""
from django.core.management.base import BaseCommand
from pathlib import Path
import os
from videos.models import Video

class Command(BaseCommand):
    help = 'Add videos from backend/video/ directory to the database'

    def handle(self, *args, **options):
        BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
        VIDEO_DIR = BASE_DIR / 'video'
        MEDIA_VIDEOS_DIR = BASE_DIR / 'media' / 'videos'
        
        # Create media/videos directory if it doesn't exist
        MEDIA_VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
        
        if not VIDEO_DIR.exists():
            self.stdout.write(self.style.ERROR(f'❌ Video directory not found: {VIDEO_DIR}'))
            return
        
        # Get all video files
        video_files = list(VIDEO_DIR.glob('*.mp4')) + list(VIDEO_DIR.glob('*.mov'))
        
        if not video_files:
            self.stdout.write(self.style.WARNING(f'⚠️  No video files found in {VIDEO_DIR}'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'📹 Found {len(video_files)} video file(s)'))
        
        # Copy videos to media/videos/ and create Video objects
        added_count = 0
        for video_file in video_files:
            # Copy to media/videos/
            dest_path = MEDIA_VIDEOS_DIR / video_file.name
            if not dest_path.exists():
                import shutil
                shutil.copy2(video_file, dest_path)
                self.stdout.write(f'✅ Copied: {video_file.name}')
            
            # Check if video already exists in database
            existing = Video.objects.filter(video_file__icontains=video_file.name).first()
            if existing:
                self.stdout.write(self.style.WARNING(f'⚠️  Video already exists: {video_file.name}'))
                continue
            
            # Create Video object
            # Extract title from filename (remove extension and underscores)
            title = video_file.stem.replace('_', ' ').replace('-', ' ')
            
            # Determine position based on filename or set to testimonials by default
            position = 'testimonials'
            if 'hero' in video_file.name.lower() or 'horizontal' in video_file.name.lower():
                position = 'hero'
            
            video_obj = Video.objects.create(
                title=title,
                video_file=f'videos/{video_file.name}',
                position=position,
                is_active=True,
                order=0
            )
            
            self.stdout.write(self.style.SUCCESS(f'✅ Created Video: {title} (position: {position})'))
            added_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully added {added_count} video(s) to database'))
        self.stdout.write(f'📁 Videos are in: {MEDIA_VIDEOS_DIR}')
        self.stdout.write(f'📝 Edit videos in Django admin: http://localhost:8004/master-co/videos/video/')


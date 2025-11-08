from django.shortcuts import render
from videos.models import Video
from videos.serializers import VideoPublicSerializer
from pathlib import Path
from django.conf import settings
import urllib.parse


def landing_page(request):
    """Render the landing page"""
    # Get hero video for the page
    hero_video = None
    try:
        video = Video.objects.filter(is_active=True, position='hero').order_by('order', '-created_at').first()
        if video:
            serializer = VideoPublicSerializer(video, context={'request': request})
            hero_video = serializer.data
    except Exception:
        pass
    
    # If no hero video in database, check for videos in media directory
    if not hero_video:
        try:
            media_videos_dir = Path(settings.MEDIA_ROOT) / 'videos'
            if media_videos_dir.exists():
                # Look for horizontal/hero video
                hero_files = list(media_videos_dir.glob('*orizontal*.mp4')) + \
                            list(media_videos_dir.glob('*orizontal*.mov')) + \
                            list(media_videos_dir.glob('*Momen*.mp4')) + \
                            list(media_videos_dir.glob('*Momen*.mov'))
                if hero_files:
                    video_file = hero_files[0]
                    video_url = request.build_absolute_uri(f'/media/videos/{urllib.parse.quote(video_file.name)}')
                    hero_video = {
                        'video_file_url': video_url,
                        'video_url': video_url,
                        'title': video_file.stem.replace('_', ' ').replace('-', ' '),
                        'description': '',
                        'vimeo_id': None,
                    }
        except Exception:
            pass
    
    # Get testimonials videos
    testimonials_videos = []
    try:
        videos = Video.objects.filter(is_active=True, position='testimonials').order_by('order', '-created_at')[:3]
        for video in videos:
            serializer = VideoPublicSerializer(video, context={'request': request})
            testimonials_videos.append(serializer.data)
    except Exception:
        pass
    
    # If not enough testimonials in database, add videos from directory
    if len(testimonials_videos) < 3:
        try:
            media_videos_dir = Path(settings.MEDIA_ROOT) / 'videos'
            if media_videos_dir.exists():
                # Get all video files except hero video
                all_videos = list(media_videos_dir.glob('*.mp4')) + list(media_videos_dir.glob('*.mov'))
                hero_names = ['Momen', 'orizontal', 'Horizontal']
                testimonial_files = [v for v in all_videos if not any(hero in v.name for hero in hero_names)]
                
                # Add up to 3 testimonials
                for video_file in testimonial_files[:3 - len(testimonials_videos)]:
                    video_url = request.build_absolute_uri(f'/media/videos/{urllib.parse.quote(video_file.name)}')
                    # Extract title from filename
                    title = video_file.stem.replace('_', ' ').replace('-', ' ')
                    # Determine badge based on filename
                    badge_label = 'طالب طموح'
                    if 'دكتور' in title or 'Doctor' in video_file.name:
                        badge_label = 'طبيب ناجح'
                    elif 'عرين' in title or 'areen' in video_file.name.lower():
                        badge_label = 'طالب طموح'
                    
                    testimonials_videos.append({
                        'video_file_url': video_url,
                        'video_url': video_url,
                        'title': title,
                        'description': '',
                        'badge_label': badge_label,
                        'vimeo_id': None,
                    })
        except Exception:
            pass
    
    featured_testimonial_video = None
    featured_index = None
    for idx, video in enumerate(testimonials_videos):
        label = (video.get('badge_label') or '').lower()
        if 'وحش' in label or 'beast' in label or 'month' in label or 'الشهر' in label:
            featured_testimonial_video = video
            featured_index = idx
            break

    if featured_testimonial_video is None and testimonials_videos:
        featured_testimonial_video = testimonials_videos[0]
        featured_index = 0

    other_testimonials_videos = testimonials_videos
    if featured_index is not None:
        other_testimonials_videos = [
            video for idx, video in enumerate(testimonials_videos) if idx != featured_index
        ]

    context = {
        'hero_video': hero_video,
        'featured_testimonial_video': featured_testimonial_video,
        'testimonials_videos': other_testimonials_videos,
    }
    return render(request, 'landing_page.html', context)

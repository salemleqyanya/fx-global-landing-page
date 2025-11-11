from django.shortcuts import render, get_object_or_404
from videos.models import Video
from videos.serializers import VideoPublicSerializer
from pathlib import Path
from django.conf import settings
import urllib.parse
from contacts.models import LandingPage


def landing_page(request, short_code=None, force_template=None):
    """Render the landing page"""
    landing_page_obj = None
    if short_code:
        landing_page_obj = get_object_or_404(
            LandingPage,
            short_code=short_code.upper(),
            is_active=True,
        )

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

    gallery_items = [
        {'image': '56dd16b6d65c4d41f0d9a9cd4b57de9ae9b04c5e.png', 'title': 'بيع الذهب محققة 210 نقاط'},
        {'image': '4142fea57f52452fd1f6de101cac3449d1dc4dc9.png', 'title': 'شراء الذهب محققة أكثر من 140 نقطة'},
        {'image': '4603fadcba072d3df40e3e708bef37ab7fd6e7b8.png', 'title': 'شراء الذهب 345 نقطة'},
        {'image': 'f86196d3c7a8e29e657208b6266a43fa8bfc228e.png', 'title': 'شراء الذهب أكثر من 160 نقطة'},
        {'image': 'ec12bbb161af6a280f4298b272279d1c82ad0888.png', 'title': 'بيع الذهب محققة 480 نقطة'},
        {'image': '7b4055b6d55bda1ee23426926dcd6e239e34eee1.png', 'title': 'بيع مؤشر US100 محققة أكثر من 220 نقطة'},
        {'image': 'f23d2c9717d18ede6764b0d41d6044362cacbc26.png', 'title': 'صفقة على مؤشر US30 محققة 480 نقطة'},
        {'image': '12f17d57cee8ed3f2355e80c9f6465f46b788cd9.png', 'title': 'صفقة شراء على مؤشر US30 محققة 280 نقطة'},
        {'image': '2856211882732aca919ab964e8b18e4d63dfa9fa.png', 'title': 'صفقة على مؤشر US100 محققة 218 نقطة'},
        {'image': 'a29b6cceed5b6ab9b4f4c4b8516e270bd1b394f0.png', 'title': 'اهداف امتدادية على الصفقة السابقة محققة 380 نقطة'},
        {'image': '58cd5e5e53854f0dd77e9cdfcbae196a833ea19d.png', 'title': 'صفقة شراء على الذهب 665 نقاط'},
        {'image': '2185841c3a4f8e56848be16e8039a2122f53bb72.png', 'title': 'صفقة بيع على الذهب محققة 140 نقطة'},
        {'image': 'fccaf05a945e1e276f746ccb3f7aba1d94f0d038.png', 'title': 'صفقة شراء على الذهب محققة 280 نقطة'},
        {'image': '7bd3d230ab9f25666ce34ef88fcf4447505bc3c4.png', 'title': 'صفقة تعزيز للشراء السابق محققة 100 نقطة'},
        {'image': 'c989ee307d820e5e34418aad04d6fe8c6a10c2cf.png', 'title': 'صفقة بيع الذهب محققة 300 نقطة'},
        {'image': '22400b65695bfb7deebf7980f30740b37d53845d.png', 'title': 'صفقة شراء على الذهب محققة 290 نقطة'},
    ]

    timeline_steps = [
        {
            'icon': '📊',
            'title': 'تحليل يومي متكامل',
            'description': 'تحليل فني + أساسي لتكون فاهم السوق قبل ما تدخل أي صفقة.'
        },
        {
            'icon': '🎯',
            'title': 'إرسال توصية جاهزة للتنفيذ',
            'description': 'سعر الدخول، الأهداف، وقف الخسارة، وإدارة الصفقة — كل شي جاهز لك.'
        },
        {
            'icon': '🛡️',
            'title': 'وقف خسارة واضح ومدروس',
            'description': 'حماية رأس مالك أولويتنا — وقف خسارة مناسب لكل صفقة.'
        },
        {
            'icon': '🔔',
            'title': 'أهداف متعددة حسب السوق',
            'description': 'مرونة في جني الأرباح حسب حركة السوق، مع تحديثات فورية.'
        },
        {
            'icon': '📈',
            'title': 'تحديثات فورية ومتابعة حية',
            'description': 'إشعارات Telegram مباشرة مع كل تعديل أو إدارة للصفقة.'
        },
        {
            'icon': '📝',
            'title': 'تقرير أسبوعي موثّق بالأداء',
            'description': 'شفافية كاملة عبر تقرير أسبوعي يوضح المكاسب والتحديثات القادمة.'
        },
    ]

    context = {
        'hero_video': hero_video,
        'featured_testimonial_video': featured_testimonial_video,
        'testimonials_videos': other_testimonials_videos,
        'landing_page': landing_page_obj,
        'gallery_items': gallery_items,
        'timeline_steps': timeline_steps,
    }
    template_name = 'landing_page.html'
    if (
        force_template == 'neon'
        or (landing_page_obj and landing_page_obj.template == 'neon')
    ):
        template_name = 'landing_page_neon.html'

    return render(request, template_name, context)

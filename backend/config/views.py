from django.shortcuts import render, get_object_or_404, redirect
from videos.models import Video
from videos.serializers import VideoPublicSerializer
from pathlib import Path
from django.conf import settings
import urllib.parse
from contacts.models import LandingPage, Payment, BlackFridaySettings
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
import logging
import requests
import os
from io import BytesIO

# Get logger first
logger = logging.getLogger(__name__)

# Optional reportlab import for PDF generation fallback
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

from .lahza_service import initialize_transaction, verify_transaction, LahzaAPIError

# Get BASE_DIR for file paths (backend directory)
BASE_DIR = Path(__file__).resolve().parent.parent

# Try to import Google Cloud reCAPTCHA Enterprise client library
try:
    from google.cloud import recaptchaenterprise_v1
    RECAPTCHA_CLIENT_LIBRARY_AVAILABLE = True
except ImportError:
    RECAPTCHA_CLIENT_LIBRARY_AVAILABLE = False
    # Logger not initialized yet, will log later if needed

# Log reportlab availability if not available
if not REPORTLAB_AVAILABLE:
    logger.warning("[PDF] reportlab not available. PDF generation fallback will not work.")


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


def landing_page_no_contact(request, short_code=None, force_template=None):
    """Render the landing page without the contact form"""
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
        'hide_contact_form': True,  # Flag to hide contact form
    }
    template_name = 'landing_page.html'
    if (
        force_template == 'neon'
        or (landing_page_obj and landing_page_obj.template == 'neon')
    ):
        template_name = 'landing_page_neon.html'

    return render(request, template_name, context)


def payment_success(request, reference=None):
    """Display payment success page"""
    from contacts.models import Payment
    
    payment = None
    customer_name = None
    
    if reference:
        try:
            payment = Payment.objects.get(reference=reference)
            # Get customer name from payment
            if payment.first_name and payment.last_name:
                customer_name = f"{payment.first_name} {payment.last_name}"
            elif payment.customer_name:
                customer_name = payment.customer_name
        except Payment.DoesNotExist:
            pass
    
    # If no reference provided, try to get from query params
    if not payment:
        reference = request.GET.get('reference')
        if reference:
            try:
                payment = Payment.objects.get(reference=reference)
                if payment.first_name and payment.last_name:
                    customer_name = f"{payment.first_name} {payment.last_name}"
                elif payment.customer_name:
                    customer_name = payment.customer_name
            except Payment.DoesNotExist:
                pass
    
    context = {
        'payment': payment,
        'customer_name': customer_name,
    }
    
    return render(request, 'payment_success.html', context)


def elite_program(request):
    """Render Elite landing page with working form submission."""
    from contacts.models import LandingPage
    # Ensure a unique LandingPage code exists for Elite
    desired_code = request.GET.get('code', 'NOKHBEH01').upper()
    landing_page_obj = LandingPage.objects.filter(short_code=desired_code).first()
    if landing_page_obj is None:
        landing_page_obj = LandingPage(
            name='Elite Program Landing',
            template='neon',
            is_active=True,
        )
        # Assign explicit code before first save so model doesn't auto-generate a random one
        landing_page_obj.short_code = desired_code
        landing_page_obj.save()
    return render(request, 'elite.html', {'landing_code': landing_page_obj.short_code})


def black_friday(request):
    """Render Black Friday landing page."""
    settings = BlackFridaySettings.get_active_settings()
    context = {
        'show_pay_button': settings.show_pay_button if settings else True,
    }
    return render(request, 'black_friday.html', context)


def ramadan_phase1(request):
    """Render Ramadan Phase 1 landing page (teasing)."""
    return render(request, 'ramadan_phase1.html')


def ramadan_phase2(request):
    """Render Ramadan Phase 2 landing page (main campaign)."""
    return render(request, 'ramadan_phase2.html')


@api_view(['GET'])
@permission_classes([AllowAny])
def get_black_friday_end_date(request):
    """Get the Black Friday sale end date from database. End date is calculated as 24 hours from start date."""
    try:
        settings = BlackFridaySettings.get_active_settings()
        
        # Get start date (pre-BF start date is when BF actually starts)
        start_date = settings.pre_black_friday_start_date
        if timezone.is_naive(start_date):
            start_date = timezone.make_aware(start_date)
        
        # Calculate end date as 24 hours from start date
        from datetime import timedelta
        end_date = start_date + timedelta(hours=24)
        
        # Return end date as ISO format timestamp (in milliseconds for JavaScript)
        # Use timestamp() which handles timezone conversion correctly
        end_date_timestamp = int(end_date.timestamp() * 1000)
        start_date_timestamp = int(start_date.timestamp() * 1000)
        
        # Format dates for display (Palestine timezone - GMT+2)
        from datetime import datetime
        try:
            import pytz
            palestine_tz = pytz.timezone('Asia/Gaza')  # Palestine timezone
        except ImportError:
            # Fallback if pytz is not installed - use UTC offset
            from datetime import timedelta
            palestine_tz = timezone.get_fixed_timezone(120)  # GMT+2
        
        # Convert to Palestine timezone for display
        start_date_palestine = start_date.astimezone(palestine_tz)
        end_date_palestine = end_date.astimezone(palestine_tz)
        
        return Response({
            'success': True,
            'end_date': end_date.isoformat(),
            'end_date_timestamp': end_date_timestamp,
            'start_date': start_date.isoformat(),
            'start_date_timestamp': start_date_timestamp,
            'start_date_display': start_date_palestine.strftime('%B %d, %Y at %I:%M %p'),
            'end_date_display': end_date_palestine.strftime('%B %d, %Y at %I:%M %p'),
            'timezone': 'Palestine Time (GMT+2)',
            'is_active': settings.is_active,
        })
    except Exception as e:
        logger.error(f"[Black Friday] Error getting end date: {str(e)}", exc_info=True)
        # Return default (24 hours from now) if error
        from datetime import timedelta
        try:
            import pytz
            palestine_tz = pytz.timezone('Asia/Gaza')
        except ImportError:
            palestine_tz = timezone.get_fixed_timezone(120)  # GMT+2
        now = timezone.now()
        # Default: 24 hours from now
        start_date = now
        end_date = now + timedelta(hours=24)
        if timezone.is_naive(end_date):
            end_date = timezone.make_aware(end_date)
        end_date_timestamp = int(end_date.timestamp() * 1000)
        start_date_timestamp = int(start_date.timestamp() * 1000)
        
        start_date_palestine = start_date.astimezone(palestine_tz)
        end_date_palestine = end_date.astimezone(palestine_tz)
        
        return Response({
            'success': True,
            'end_date': end_date.isoformat(),
            'end_date_timestamp': end_date_timestamp,
            'start_date': start_date.isoformat(),
            'start_date_timestamp': start_date_timestamp,
            'start_date_display': start_date_palestine.strftime('%B %d, %Y at %I:%M %p'),
            'end_date_display': end_date_palestine.strftime('%B %d, %Y at %I:%M %p'),
            'timezone': 'Palestine Time (GMT+2)',
            'is_active': True,
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_pre_black_friday_date(request):
    """Get the Pre-Black Friday start date from database."""
    try:
        settings = BlackFridaySettings.get_active_settings()
        # Ensure the datetime is timezone-aware
        pre_bf_date = settings.pre_black_friday_start_date
        if timezone.is_naive(pre_bf_date):
            pre_bf_date = timezone.make_aware(pre_bf_date)
        
        # Return date as ISO format timestamp (in milliseconds for JavaScript)
        pre_bf_timestamp = int(pre_bf_date.timestamp() * 1000)
        
        return Response({
            'success': True,
            'pre_black_friday_start_date': pre_bf_date.isoformat(),
            'pre_black_friday_start_timestamp': pre_bf_timestamp,
            'is_active': settings.is_active,
        })
    except Exception as e:
        logger.error(f"[Black Friday] Error getting pre-BF date: {str(e)}", exc_info=True)
        # Return default (November 26th of current year) if error
        from datetime import timedelta
        now = timezone.now()
        pre_bf_date = now.replace(month=11, day=26, hour=0, minute=0, second=0, microsecond=0)
        if pre_bf_date < now:
            pre_bf_date = pre_bf_date.replace(year=now.year + 1)
        if timezone.is_naive(pre_bf_date):
            pre_bf_date = timezone.make_aware(pre_bf_date)
        pre_bf_timestamp = int(pre_bf_date.timestamp() * 1000)
        
        return Response({
            'success': True,
            'pre_black_friday_start_date': pre_bf_date.isoformat(),
            'pre_black_friday_start_timestamp': pre_bf_timestamp,
            'is_active': True,
        })


def lahza_checkout(request):
    """Render standalone Lahza checkout page."""
    return render(request, 'lahza_checkout.html')


def privacy_policy(request):
    """Render Privacy Policy page."""
    return render(request, 'privacy_policy.html')


def terms_of_service(request):
    """Render Terms of Service page."""
    return render(request, 'terms_of_service.html')


def return_exchange_policy(request):
    """Render Return and Exchange Policy page."""
    return render(request, 'return_exchange_policy.html')


def packages_page(request):
    """Render Packages landing page."""
    return render(request, 'packages.html')


def new_land_page(request):
    """Render New Land (FX Globals - مؤسسة التعليم والتدريب) landing page."""
    return render(request, 'new_land.html')


def web_page(request):
    """Render Web (FX Globals – أكاديمية تعليم و تدريب معتمدة) landing page."""
    return render(request, 'web.html')


def feedback_landing_page(request):
    """Render Feedback (FX GLOBAL - عرض محدود) landing page."""
    return render(request, 'newfeedback/index.html')


def feedback_videos_page(request):
    """Render Feedback videos (نتائج سابقة) page."""
    return render(request, 'newfeedback/feedback_videos.html')


def payment_page(request):
    """Render Payment page."""
    # Check for success/error messages from VIP Learning form submission
    success_message = request.GET.get('success', None)
    error_message = request.GET.get('error', None)
    
    context = {
        'success_message': success_message,
        'error_message': error_message,
    }
    return render(request, 'payment.html', context)


def submit_vip_learning_request(request):
    """Handle VIP Learning contact form submission."""
    if request.method != 'POST':
        return render(request, 'payment.html', {'error_message': 'Invalid request method'})
    
    try:
        # Get form data
        name = request.POST.get('name', '').strip()
        phone_raw = request.POST.get('phone', '').strip()
        experience = request.POST.get('experience', '').strip()
        goal = request.POST.get('goal', '').strip()
        available_time = request.POST.get('available_time', '').strip()
        
        # Validate required fields
        errors = []
        if not name or len(name) < 2:
            errors.append('يرجى إدخال اسم صحيح')
        
        if not phone_raw:
            errors.append('يرجى إدخال رقم هاتف')
        
        # Clean phone number - remove all non-digit characters
        phone = ''.join(filter(str.isdigit, phone_raw)) if phone_raw else ''
        if len(phone) < 8:
            errors.append('يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل)')
        
        if not experience:
            errors.append('يرجى اختيار مستوى الخبرة')
        
        if not goal or len(goal) < 10:
            errors.append('يرجى إدخال هدف التدريب (10 أحرف على الأقل)')
        
        if errors:
            error_msg = ' | '.join(errors)
            return render(request, 'payment.html', {'error_message': error_msg})
        
        # Build message with all form data
        experience_labels = {
            'beginner': 'مبتدئ',
            'intermediate': 'متوسط',
            'advanced': 'متقدم',
            'expert': 'خبير'
        }
        
        experience_label = experience_labels.get(experience, experience)
        
        message = f"""طلب VIP Learning (1-on-1)

الخبرة بالتداول: {experience_label}
الهدف من التدريب: {goal}"""
        
        if available_time:
            message += f"\nالوقت المتاح للمتابعة: {available_time}"
        
        # Build structured notes with all form fields for better data organization
        notes_parts = [
            f"نوع الطلب: VIP Learning (1-on-1)",
            f"الخبرة بالتداول: {experience_label} ({experience})",
            f"الهدف من التدريب: {goal}",
        ]
        if available_time:
            notes_parts.append(f"الوقت المتاح للمتابعة: {available_time}")
        
        notes = "\n".join(notes_parts)
        
        # Prepare data for serializer
        from contacts.serializers import CustomerContactCreateSerializer
        
        serializer_data = {
            'name': name,
            'phone': phone,
            'whatsapp': phone,  # Use same cleaned phone as WhatsApp
            'message': message,
            'city': '',
            'address': available_time if available_time else '',  # Store available time in address field
            'notes': notes,  # Store structured data in notes field
            # 'goal' field is not included - it requires specific choices that don't apply here
        }
        
        serializer = CustomerContactCreateSerializer(data=serializer_data)
        
        if serializer.is_valid():
            contact = serializer.save()
            logger.info(f"VIP Learning request submitted successfully: {contact.id} - {name} - {phone}")
            # Redirect with success message (URL-encoded)
            success_msg = urllib.parse.quote('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.')
            return redirect(f'/payment/?success={success_msg}')
        else:
            # Handle serializer validation errors
            error_messages = []
            for field, field_errors in serializer.errors.items():
                if isinstance(field_errors, list):
                    error_messages.extend(field_errors)
                else:
                    error_messages.append(str(field_errors))
            
            error_msg = ' | '.join(error_messages) if error_messages else 'حدث خطأ أثناء الإرسال'
            logger.error(f"VIP Learning form validation errors: {serializer.errors}")
            return render(request, 'payment.html', {'error_message': error_msg})
            
    except Exception as e:
        logger.exception(f"Error processing VIP Learning request: {str(e)}")
        return render(request, 'payment.html', {'error_message': 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.'})


def serve_packages_file(request, filename):
    """Serve CSS or JS files from the packages directory."""
    # Get the packages directory path (one level up from backend)
    packages_dir = BASE_DIR.parent / 'packages'
    file_path = packages_dir / filename
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Determine content type based on file extension
        if filename.endswith('.css'):
            content_type = 'text/css'
        elif filename.endswith('.js'):
            content_type = 'application/javascript'
        else:
            content_type = 'text/plain'
        
        from django.http import HttpResponse
        response = HttpResponse(content, content_type=content_type)
        response['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
        return response
    except FileNotFoundError:
        from django.http import HttpResponseNotFound
        return HttpResponseNotFound(f'{filename} not found')
    except Exception as e:
        logger.error(f"[Packages] Error serving {filename}: {str(e)}", exc_info=True)
        from django.http import HttpResponseServerError
        return HttpResponseServerError(f'Error loading {filename}')


def pricing_page(request):
    """Render Pricing page from templates/new_pac directory."""
    return render(request, 'new_pac/pricing.html')


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def pricing_contact(request):
    """Handle contact form submission from pricing page."""
    from django.http import JsonResponse
    from contacts.models import CustomerContact
    
    try:
        data = request.data
        
        # Extract form data
        name = data.get('name', '').strip()
        mobile = data.get('mobile', '').strip()
        email = data.get('email', '').strip()
        address = data.get('address', '').strip()
        message = data.get('message', '').strip()
        
        # Validate required fields
        if not name:
            return JsonResponse({
                'success': False,
                'error': 'الاسم مطلوب'
            }, status=400)
        
        if not mobile:
            return JsonResponse({
                'success': False,
                'error': 'رقم الجوال مطلوب'
            }, status=400)
        
        if not email:
            return JsonResponse({
                'success': False,
                'error': 'البريد الإلكتروني مطلوب'
            }, status=400)
        
        if not message:
            return JsonResponse({
                'success': False,
                'error': 'الرسالة مطلوبة'
            }, status=400)
        
        # Create contact record
        # Store email in message field if needed, or use notes field
        full_message = f"البريد الإلكتروني: {email}\n\n{message}"
        
        contact = CustomerContact.objects.create(
            name=name,
            phone=mobile,
            whatsapp=mobile,  # Use mobile as whatsapp if not provided separately
            address=address,
            message=full_message,
            notes=f"Email: {email}",  # Store email in notes field
            landing_page=None  # Not associated with a specific landing page
        )
        
        logger.info(f"[Pricing Contact] New contact created: {name} - {mobile}")
        
        return JsonResponse({
            'success': True,
            'message': 'تم إرسال رسالتك بنجاح. فريقنا رح يتواصل معك قريباً.'
        })
        
    except Exception as e:
        logger.error(f"[Pricing Contact] Error processing contact form: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.'
        }, status=500)


def serve_new_pac_file(request, filename):
    """Serve CSS or JS files from the new-pac directory."""
    # Get the new-pac directory path (one level up from backend)
    new_pac_dir = BASE_DIR.parent / 'new-pac'
    file_path = new_pac_dir / filename
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Determine content type based on file extension
        if filename.endswith('.css'):
            content_type = 'text/css'
        elif filename.endswith('.js'):
            content_type = 'application/javascript'
        else:
            content_type = 'text/plain'
        
        from django.http import HttpResponse
        response = HttpResponse(content, content_type=content_type)
        response['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
        return response
    except FileNotFoundError:
        from django.http import HttpResponseNotFound
        return HttpResponseNotFound(f'{filename} not found')
    except Exception as e:
        logger.error(f"[New-Pac] Error serving {filename}: {str(e)}", exc_info=True)
        from django.http import HttpResponseServerError
        return HttpResponseServerError(f'Error loading {filename}')


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])  # Disable authentication to avoid CSRF enforcement
@permission_classes([AllowAny])
def initialize_lahza_payment(request):
    """Initialize a Lahza payment transaction for Black Friday."""
    try:
        # Handle both DRF request.data and Django request.POST/body
        if hasattr(request, 'data'):
            data = request.data
        else:
            import json
            try:
                body = request.body.decode('utf-8')
                data = json.loads(body) if body else {}
            except (json.JSONDecodeError, UnicodeDecodeError, AttributeError):
                data = dict(request.POST) if request.method == 'POST' else {}
                if hasattr(data, 'dict'):
                    data = data.dict()
        
        # Log incoming data for debugging
        logger.info(f"[Payment Init] Received data: {data}")
        
        email = data.get('email', '').strip()
        try:
            amount = float(data.get('amount', 0))
        except (ValueError, TypeError):
            amount = 0
        currency = data.get('currency', 'ILS').strip().upper()  # Default to ILS for backward compatibility
        first_name = data.get('firstName', '').strip()
        last_name = data.get('lastName', '').strip()
        mobile = data.get('mobile', '').strip()
        # Format mobile number - ensure it starts with + if it doesn't already
        if mobile and not mobile.startswith('+'):
            # If it starts with 0, replace with country code (assume Palestine/Israel +970 or +972)
            if mobile.startswith('0'):
                mobile = '+970' + mobile[1:]
            else:
                # If no country code, assume Palestine
                mobile = '+970' + mobile
        
        # Support legacy fullName field for backward compatibility
        full_name = data.get('fullName', '').strip()
        offer_type = data.get('offerType', 'bundle')
        # Determine source from URL path if not provided in data
        source = data.get('source', None)
        if not source:
            # Try to determine from request path
            if 'ramadan' in request.path:
                source = 'ramadan'
            elif 'packages' in request.path:
                source = 'packages'
            elif 'checkout' in request.path:
                source = 'checkout'
            elif 'pricing' in request.path:
                source = 'pricing'
            elif 'payment' in request.path:
                source = 'payment'
            else:
                source = 'black_friday'  # Default fallback
        offer_name = data.get('offerName', '').strip()
        
        # Validate required fields
        if not email:
            return Response({
                'success': False,
                'error': 'البريد الإلكتروني مطلوب'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not amount or amount <= 0:
            return Response({
                'success': False,
                'error': 'المبلغ مطلوب ويجب أن يكون أكبر من الصفر'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # If firstName/lastName not provided, try to split fullName (backward compatibility)
        if not first_name and not last_name and full_name:
            name_parts = full_name.split(' ', 1)
            first_name = name_parts[0] if name_parts else ''
            last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Use full_name for customer_name if first_name and last_name are empty
        customer_name = f"{first_name} {last_name}".strip() if (first_name or last_name) else full_name
        
        # Convert amount to minor units (cents for USD)
        amount_minor = int(amount * 100)
        
        # Get recaptcha token if provided (before using it)
        recaptcha_token = data.get('recaptchaToken', '')
        
        # Generate reference
        import uuid
        if source == 'packages':
            prefix = 'PK'
        elif source == 'checkout':
            prefix = 'CK'
        elif source == 'pricing':
            prefix = 'PR'
        elif source == 'payment':
            prefix = 'PM'
        elif source == 'ramadan':
            prefix = 'RM'
        else:
            prefix = 'BF'
        reference = f"{prefix}-{uuid.uuid4().hex[:12].upper()}"
        
        # Create payment record FIRST (before initializing with Lahza)
        from contacts.models import Payment
        
        # Use full_name for customer_name if first_name and last_name are empty
        if not customer_name or customer_name.strip() == '':
            customer_name = f"{first_name} {last_name}".strip() if (first_name or last_name) else full_name
        if not customer_name or customer_name.strip() == '':
            customer_name = 'Unknown'
        
        # Get address from form data
        address = data.get('address', '').strip() if data.get('address') else None
        
        # Create payment record with pending status
        try:
            payment = Payment.objects.create(
                reference=reference,
                customer_name=customer_name,
                customer_email=email,
                first_name=first_name if first_name else None,
                last_name=last_name if last_name else None,
                mobile=mobile if mobile else None,
                address=address,
                amount=amount,
                currency=currency.upper(),
                offer_type=offer_type,
                offer_name=offer_name,
                source=source,
                status='pending',
                metadata={
                    'offer_type': offer_type,
                    'source': source,
                    'offer_name': offer_name,
                    'recaptcha_token': recaptcha_token if recaptcha_token else None,
                    'form_data': {
                        'firstName': first_name,
                        'lastName': last_name,
                        'mobile': mobile,
                        'email': email,
                        'address': address or '',
                    }
                }
            )
        except Exception as payment_error:
            logger.error(f"[Payment] Error creating payment record: {str(payment_error)}", exc_info=True)
            raise
        
        logger.info(f"[Payment] Payment record created: {reference} for {email}, amount: {amount} {currency}")
        
        # Build callback URL based on source
        if source == 'checkout':
            callback_url = request.build_absolute_uri(f'/checkout/payment/verify/?reference={reference}')
        elif source == 'packages':
            callback_url = request.build_absolute_uri(f'/packages/payment/verify/?reference={reference}')
        elif source == 'pricing':
            callback_url = request.build_absolute_uri(f'/pricing/payment/verify/?reference={reference}')
        elif source == 'payment':
            callback_url = request.build_absolute_uri(f'/payment/payment/verify/?reference={reference}')
        elif source == 'ramadan':
            callback_url = request.build_absolute_uri(f'/ramadan/payment/verify/?reference={reference}')
        else:
            callback_url = request.build_absolute_uri(f'/black-friday/payment/callback/?reference={reference}')
        
        # Initialize transaction with Lahza FIRST (don't wait for reCAPTCHA)
        transaction_data = initialize_transaction(
            email=email,
            amount_minor=amount_minor,
            currency=currency.upper(),  # Use the currency from the plan
            reference=reference,
            first_name=first_name,
            last_name=last_name,
            mobile=mobile if mobile else None,
            metadata={
                'offer_type': offer_type,
                'source': source,
                'offer_name': offer_name,
            },
            callback_url=callback_url,
        )
        
        # Update payment record with transaction ID if available
        if transaction_data.get('id'):
            payment.transaction_id = str(transaction_data.get('id'))
            payment.save()
        
        # Return payment URL immediately (reCAPTCHA verification is now skipped to speed up payment initialization)
        return Response({
            'success': True,
            'reference': reference,
            'authorization_url': transaction_data.get('authorization_url'),
            'access_code': transaction_data.get('access_code'),
        })
        
    except LahzaAPIError as e:
        error_message = str(e)
        logger.error(f"[Lahza] Payment initialization error: {error_message}")
        
        # Provide user-friendly error messages in Arabic
        if "Network is unreachable" in error_message or "Failed to establish" in error_message:
            user_error = "تعذر الاتصال بخدمة الدفع. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
        elif "timeout" in error_message.lower():
            user_error = "انتهت مهلة طلب خدمة الدفع. يرجى المحاولة مرة أخرى."
        elif "Connection" in error_message or "connection" in error_message.lower():
            user_error = "تعذر الاتصال بخدمة الدفع. يرجى المحاولة لاحقاً."
        else:
            # For other errors, show a generic message (don't expose technical details)
            user_error = "تعذر تهيئة الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم إذا استمرت المشكلة."
        
        return Response({
            'success': False,
            'error': user_error,
            'message': user_error
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error_message = str(e)
        logger.exception(f"[Lahza] Unexpected error during payment initialization: {error_message}")
        # Log the full traceback for debugging
        import traceback
        logger.error(f"[Lahza] Full traceback: {traceback.format_exc()}")
        # Provide user-friendly error message in Arabic
        user_error = "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى."
        if settings.DEBUG:
            user_error = f"حدث خطأ: {error_message}"
        
        return Response({
            'success': False,
            'error': user_error,
            'message': user_error
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
def lahza_webhook(request):
    """Webhook endpoint for Lahza to send payment status updates."""
    from django.http import JsonResponse
    import json
    
    try:
        # Get webhook data from request body
        # Handle both Django HttpRequest and DRF Request
        if hasattr(request, 'data'):
            # DRF Request
            webhook_data = request.data if isinstance(request.data, dict) else {}
        else:
            # Django HttpRequest - parse JSON body
            try:
                body = request.body.decode('utf-8')
                webhook_data = json.loads(body) if body else {}
            except (json.JSONDecodeError, UnicodeDecodeError):
                # Try to get from POST data if JSON parsing fails
                webhook_data = dict(request.POST) if request.method == 'POST' else {}
                # Convert QueryDict to regular dict
                if hasattr(webhook_data, 'dict'):
                    webhook_data = webhook_data.dict()
                else:
                    webhook_data = {k: v[0] if isinstance(v, list) and len(v) == 1 else v 
                                   for k, v in webhook_data.items()}
        
        # Extract reference from webhook payload
        # Lahza may send different formats, check common fields
        reference = (
            webhook_data.get('reference') or 
            webhook_data.get('data', {}).get('reference') or
            webhook_data.get('transaction', {}).get('reference') or
            webhook_data.get('payment', {}).get('reference')
        )
        
        if not reference:
            logger.warning(f"[Lahza Webhook] No reference found in webhook data: {webhook_data}")
            return JsonResponse({
                'success': False,
                'error': 'Reference is required'
            }, status=400)
        
        logger.info(f"[Lahza Webhook] Received webhook for reference: {reference}")
        
        # Get payment status from webhook
        status_value = (
            webhook_data.get('status') or
            webhook_data.get('data', {}).get('status') or
            webhook_data.get('transaction', {}).get('status') or
            webhook_data.get('payment', {}).get('status') or
            'unknown'
        )
        
        # Get or create payment record
        try:
            payment = Payment.objects.get(reference=reference)
        except Payment.DoesNotExist:
            logger.warning(f"[Lahza Webhook] Payment record not found for reference: {reference}")
            # Try to verify with Lahza API to get full transaction data
            try:
                transaction_data = verify_transaction(reference)
                # Create payment record from transaction data
                payment = Payment.objects.create(
                    reference=reference,
                    customer_email=transaction_data.get('customer', {}).get('email', 'unknown@example.com'),
                    customer_name=transaction_data.get('customer', {}).get('name', 'Unknown'),
                    amount=transaction_data.get('amount', 0) / 100 if transaction_data.get('amount', 0) > 1000 else transaction_data.get('amount', 0),
                    currency=transaction_data.get('currency', 'ILS'),
                    status='pending',
                    lahza_response=transaction_data
                )
            except Exception as e:
                logger.error(f"[Lahza Webhook] Error creating payment from webhook: {str(e)}")
                return JsonResponse({
                    'success': False,
                    'error': f'Payment not found and could not be created: {str(e)}'
                }, status=404)
        
        # Update payment status based on webhook
        status_lower = str(status_value).lower()
        logger.info(f"[Lahza Webhook] Processing webhook for reference: {reference}, status: {status_lower}")
        
        # Check for success status - Lahza may return: 'success', 'completed', 'paid', 'approved', 'successful'
        success_statuses = ['success', 'completed', 'paid', 'approved', 'successful']
        
        if status_lower in success_statuses:
            # Verify transaction with Lahza API to get full details
            try:
                transaction_data = verify_transaction(reference)
                payment.mark_as_success(transaction_data)
                logger.info(f"[Lahza Webhook] Payment marked as success: {reference}")
                
                # Send receipt email
                try:
                    logger.info(f"[Lahza Webhook] Attempting to send receipt email to {payment.customer_email}")
                    send_payment_receipt_email(payment)
                    logger.info(f"[Lahza Webhook] ✓ Receipt email sent successfully to {payment.customer_email}")
                except Exception as email_error:
                    logger.error(f"[Lahza Webhook] ✗ Error sending receipt email: {str(email_error)}", exc_info=True)
                    # Try async as fallback
                    try:
                        import threading
                        def send_email_async():
                            try:
                                send_payment_receipt_email(payment)
                                logger.info(f"[Lahza Webhook] ✓ Receipt email sent (retry) to {payment.customer_email}")
                            except Exception as retry_error:
                                logger.error(f"[Lahza Webhook] ✗ Retry failed: {str(retry_error)}")
                        email_thread = threading.Thread(target=send_email_async)
                        email_thread.daemon = True
                        email_thread.start()
                    except Exception:
                        pass
            except Exception as e:
                logger.error(f"[Lahza Webhook] Error verifying transaction: {str(e)}", exc_info=True)
                payment.status = 'success'
                from django.utils import timezone
                if not payment.paid_at:
                    payment.paid_at = timezone.now()
                payment.save()
                # Try to send email even if verification failed
                try:
                    send_payment_receipt_email(payment)
                except Exception as email_error:
                    logger.error(f"[Lahza Webhook] Could not send email after verification error: {str(email_error)}")
        elif status_lower in ['failed', 'declined', 'rejected', 'cancelled']:
            payment.mark_as_failed(f'Webhook status: {status_value}')
            logger.info(f"[Lahza Webhook] Payment marked as failed: {reference}, status: {status_value}")
        else:
            # Keep as pending or update based on webhook data
            payment.lahza_response = webhook_data
            payment.save()
            logger.info(f"[Lahza Webhook] Payment status updated: {reference}, status: {status_value}")
        
        return JsonResponse({
            'success': True,
            'message': 'Webhook processed successfully',
            'reference': reference,
            'status': status_value
        })
        
    except Exception as e:
        error_message = str(e)
        logger.exception(f"[Lahza Webhook] Error processing webhook: {error_message}")
        return JsonResponse({
            'success': False,
            'error': error_message if settings.DEBUG else 'Error processing webhook'
        }, status=500)


@csrf_exempt
@api_view(['GET', 'POST'])
@authentication_classes([])  # Disable authentication to avoid CSRF enforcement
@permission_classes([AllowAny])
def verify_lahza_payment(request):
    """Verify a Lahza payment transaction."""
    reference = None
    try:
        # Get reference from query params or request data
        try:
            reference = request.GET.get('reference')
            if not reference and hasattr(request, 'data'):
                reference = request.data.get('reference') if request.data else None
        except Exception as ref_error:
            logger.warning(f"[Payment] Error getting reference: {str(ref_error)}")
        
        if not reference:
            logger.warning("[Payment] No reference provided in verification request")
            return Response({
                'success': False,
                'status': 'error',
                'error': 'Payment reference is required',
                'message': 'Payment reference is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create payment record
        try:
            payment = Payment.objects.get(reference=reference)
        except Payment.DoesNotExist:
            # If payment doesn't exist, create it (might happen if verification is called before initialization)
            logger.warning(f"[Payment] Payment record not found for reference: {reference}, creating new record")
            try:
                # Try to get form data from request if available
                first_name = request.data.get('firstName', '') if hasattr(request, 'data') else ''
                last_name = request.data.get('lastName', '') if hasattr(request, 'data') else ''
                email = request.data.get('email', 'unknown@example.com') if hasattr(request, 'data') else 'unknown@example.com'
                mobile = request.data.get('mobile', '') if hasattr(request, 'data') else ''
                customer_name = f"{first_name} {last_name}".strip() if (first_name or last_name) else 'Unknown'
                
                payment = Payment.objects.create(
                    reference=reference,
                    customer_name=customer_name,
                    customer_email=email,
                    first_name=first_name if first_name else None,
                    last_name=last_name if last_name else None,
                    mobile=mobile if mobile else None,
                    amount=0,
                    currency='ILS',
                    status='pending'
                )
            except Exception as e:
                logger.error(f"[Payment] Error creating payment record: {str(e)}")
                return Response({
                    'success': False,
                    'error': f'Error creating payment record: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Verify transaction with Lahza
        try:
            transaction_data = verify_transaction(reference)
            logger.info(f"[Payment] Lahza verification response received for {reference}")
        except LahzaAPIError as e:
            error_msg = str(e)
            logger.warning(f"[Lahza] LahzaAPIError verifying transaction (reference: {reference}): {error_msg}")
            # Don't mark as failed immediately - might be a temporary network issue or transaction not ready
            # Return pending status so frontend can retry
            try:
                return Response({
                    'success': False,
                    'status': 'pending',
                    'message': 'Payment is still being processed. Please wait...',
                    'reference': reference,
                })
            except Exception as resp_error:
                logger.error(f"[Payment] Error creating Response: {str(resp_error)}")
                from django.http import JsonResponse
                return JsonResponse({
                    'success': False,
                    'status': 'pending',
                    'message': 'Payment is still being processed. Please wait...',
                    'reference': reference,
                })
        except Exception as e:
            error_msg = str(e)
            logger.error(f"[Lahza] Unexpected error verifying transaction (reference: {reference}): {error_msg}", exc_info=True)
            # Return pending status so frontend can retry
            try:
                return Response({
                    'success': False,
                    'status': 'pending',
                    'message': 'Unable to verify payment status. Please try again.',
                    'reference': reference,
                })
            except Exception as resp_error:
                logger.error(f"[Payment] Error creating Response: {str(resp_error)}")
                from django.http import JsonResponse
                return JsonResponse({
                    'success': False,
                    'status': 'pending',
                    'message': 'Unable to verify payment status. Please try again.',
                    'reference': reference,
                })
        
        # Check transaction status - Lahza may return different status values
        transaction_status = transaction_data.get('status', '').lower()
        
        # Log the full transaction data for debugging
        logger.info(f"[Payment] Transaction status check - reference: {reference}, status: {transaction_status}")
        logger.info(f"[Payment] Full transaction_data keys: {list(transaction_data.keys()) if isinstance(transaction_data, dict) else 'Not a dict'}")
        
        # Also check if status is nested in 'data' object (some API responses have nested structure)
        if not transaction_status and isinstance(transaction_data, dict):
            nested_status = transaction_data.get('data', {}).get('status', '') if isinstance(transaction_data.get('data'), dict) else ''
            if nested_status:
                transaction_status = str(nested_status).lower()
                logger.info(f"[Payment] Found nested status: {transaction_status}")
        
        # Update payment record with Lahza response (ensure it's JSON serializable)
        try:
            import json
            # Convert to dict if it's not already, and ensure it's JSON serializable
            if isinstance(transaction_data, dict):
                # Test JSON serialization
                json.dumps(transaction_data)
                payment.lahza_response = transaction_data
            else:
                payment.lahza_response = {'data': str(transaction_data)}
        except (TypeError, ValueError) as e:
            logger.warning(f"[Payment] Error serializing transaction_data: {str(e)}")
            payment.lahza_response = {'error': 'Could not serialize transaction data', 'raw': str(transaction_data)}
        
        # Check for success status - Lahza may return: 'success', 'completed', 'paid', 'approved', 'successful'
        success_statuses = ['success', 'completed', 'paid', 'approved', 'successful']
        is_success = transaction_status in success_statuses
        
        if is_success:
            # Update payment details from transaction data if available
            try:
                if 'amount' in transaction_data:
                    # Amount might be in cents or dollars, check the value
                    amount_value = transaction_data.get('amount', 0)
                    if isinstance(amount_value, (int, float)):
                        if amount_value > 1000:  # Likely in cents
                            payment.amount = amount_value / 100
                        else:
                            payment.amount = amount_value
                
                if 'currency' in transaction_data:
                    currency_value = transaction_data.get('currency', 'ILS')
                    if currency_value:
                        payment.currency = str(currency_value)[:3]  # Ensure max 3 chars
                
                if 'customer' in transaction_data:
                    customer_data = transaction_data.get('customer', {})
                    if isinstance(customer_data, dict):
                        if 'email' in customer_data:
                            payment.customer_email = customer_data.get('email', payment.customer_email)
                        if 'name' in customer_data:
                            payment.customer_name = customer_data.get('name', payment.customer_name)
            except Exception as e:
                logger.warning(f"[Payment] Error updating payment details: {str(e)}", exc_info=True)
            
            # Mark payment as successful (this saves the payment and extracts card info)
            try:
                # Log transaction_data structure before processing
                logger.info(f"[Payment] Transaction data structure: {list(transaction_data.keys()) if isinstance(transaction_data, dict) else type(transaction_data)}")
                logger.info(f"[Payment] Full transaction_data: {transaction_data}")
                
                payment.mark_as_success(transaction_data)
                
                # Log card information after saving
                logger.info(f"[Payment] After mark_as_success - Card info: type={payment.card_type}, brand={payment.card_brand}, last4={payment.last_four_digits}, exp={payment.card_expiry_month}/{payment.card_expiry_year}")
                
                if payment.last_four_digits:
                    logger.info(f"[Payment] ✓ Card info saved successfully - Type: {payment.card_type or payment.card_brand}, Last 4: {payment.last_four_digits}")
                else:
                    logger.warning(f"[Payment] ⚠ No card info extracted. Payment fields: card_type={payment.card_type}, card_brand={payment.card_brand}, last_four_digits={payment.last_four_digits}")
            except Exception as e:
                logger.error(f"[Payment] Error marking payment as success: {str(e)}", exc_info=True)
                # Try to save manually
                payment.status = 'success'
                from django.utils import timezone
                if not payment.paid_at:
                    payment.paid_at = timezone.now()
                payment.save()
            
            logger.info(f"[Payment] Payment verified successfully: {reference}")
            
            # Send receipt email (synchronously to ensure it's sent, but log errors)
            try:
                logger.info(f"[Payment] Attempting to send receipt email to {payment.customer_email} for {payment.reference}")
                send_payment_receipt_email(payment)
                logger.info(f"[Payment] ✓ Receipt email sent successfully to {payment.customer_email} for {payment.reference}")
            except Exception as e:
                logger.error(f"[Payment] ✗ Error sending receipt email to {payment.customer_email}: {str(e)}", exc_info=True)
                # Don't fail the payment verification if email fails, but log it clearly
                # Try to send email in background as fallback
                try:
                    import threading
                    def send_email_async():
                        try:
                            send_payment_receipt_email(payment)
                            logger.info(f"[Payment] ✓ Receipt email sent successfully (retry) to {payment.customer_email}")
                        except Exception as retry_error:
                            logger.error(f"[Payment] ✗ Retry failed to send email: {str(retry_error)}", exc_info=True)
                    email_thread = threading.Thread(target=send_email_async)
                    email_thread.daemon = True
                    email_thread.start()
                    logger.info(f"[Payment] Receipt email queued for retry to {payment.customer_email}")
                except Exception as retry_error:
                    logger.error(f"[Payment] Could not queue email retry: {str(retry_error)}")
            
            # Safely get amount - handle None or Decimal
            try:
                amount_value = float(payment.amount) if payment.amount else 0.0
            except (TypeError, ValueError):
                amount_value = 0.0
            
            return Response({
                'success': True,
                'status': 'success',
                'message': 'Payment verified successfully',
                'transaction_id': transaction_data.get('id') or payment.transaction_id or '',
                'reference': reference,
                'amount': amount_value,
                'currency': payment.currency or 'USD',
                'email': payment.customer_email or '',
            })
        elif transaction_status == 'pending':
            # Payment is still pending
            return Response({
                'success': False,
                'status': 'pending',
                'message': 'Payment is still being processed',
                'reference': reference,
            })
        else:
            # Mark payment as failed
            payment.mark_as_failed(f'Payment status: {transaction_status}')
            
            logger.warning(f"[Payment] Payment verification failed: {reference}, status: {transaction_status}")
            
            return Response({
                'success': False,
                'status': transaction_status,
                'error': f'Payment status: {transaction_status}',
                'reference': reference,
            })
        
    except LahzaAPIError as e:
        logger.error(f"[Lahza] Payment verification error: {str(e)}")
        
        # Try to update payment record if it exists
        try:
            reference = request.GET.get('reference') or request.data.get('reference')
            if reference:
                payment = Payment.objects.get(reference=reference)
                payment.mark_as_failed(str(e))
        except (Payment.DoesNotExist, Exception):
            pass
        
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error_message = str(e)
        logger.exception(f"[Lahza] Unexpected error during payment verification: {error_message}")
        
        # Try to update payment record if it exists
        try:
            reference = request.GET.get('reference') or (request.data.get('reference') if hasattr(request, 'data') else None)
            if reference:
                try:
                    payment = Payment.objects.get(reference=reference)
                    payment.mark_as_failed(f'Unexpected error: {error_message}')
                except Payment.DoesNotExist:
                    pass
        except Exception as update_error:
            logger.warning(f"[Payment] Error updating payment record: {str(update_error)}")
        
        # Return more detailed error in development, generic in production
        error_detail = error_message if settings.DEBUG else 'An error occurred while verifying payment'
        
        # Make sure we return a proper Response even if there's an error
        try:
            return Response({
                'success': False,
                'status': 'error',
                'error': error_detail,
                'message': 'An error occurred while verifying payment. Please try again or contact support.',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as response_error:
            # If Response fails, return a simple JSON response
            logger.error(f"[Payment] Could not create Response object: {str(response_error)}")
            from django.http import JsonResponse
            return JsonResponse({
                'success': False,
                'status': 'error',
                'error': error_detail if settings.DEBUG else 'An error occurred while verifying payment',
            }, status=500)


def generate_instructions_pdf(payment):
    """Generate PDF file with instructions for the customer (fallback if PDF file not found)"""
    if not REPORTLAB_AVAILABLE:
        raise ImportError("reportlab is not installed. Cannot generate PDF dynamically.")
    
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        
        # Title style
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor='#6B46C1',
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        # Heading style
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor='#E91E8C',
            spaceAfter=12,
            spaceBefore=20,
            fontName='Helvetica-Bold'
        )
        
        # Subheading style
        subheading_style = ParagraphStyle(
            'CustomSubheading',
            parent=styles['Heading3'],
            fontSize=14,
            textColor='#6B46C1',
            spaceAfter=8,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        )
        
        # Normal text style (RTL for Arabic)
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=10,
            leading=18,
            alignment=TA_RIGHT,
            rightIndent=0,
            leftIndent=0
        )
        
        # Bullet style (RTL for Arabic)
        bullet_style = ParagraphStyle(
            'CustomBullet',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=8,
            leading=18,
            rightIndent=20,
            leftIndent=0,
            alignment=TA_RIGHT
        )
        
        # Title
        title = Paragraph("أهم التعليمات الصادرة لمساعدتك", title_style)
        elements.append(title)
        elements.append(Spacer(1, 0.2*inch))
        
        subtitle = Paragraph("لحتى تقدر تبدأ معنا، يرجى اتباع الخطوات التالية بعد الدفع", normal_style)
        elements.append(subtitle)
        elements.append(Spacer(1, 0.3*inch))
        
        # Section 1
        heading1 = Paragraph("1. إرسال وثائق التسجيل", heading_style)
        elements.append(heading1)
        
        text1 = Paragraph("يرجى إرسال ما يلي على الرقم التالي: <b>+972593700806</b>", normal_style)
        elements.append(text1)
        
        items1 = [
            "الاسم الكامل",
            "صورة الهوية",
            "الايميل",
            "رقم الجوال",
            "اشعار الدفع",
            "اسم الخدمة التي تم التسجيل فيها"
        ]
        
        for item in items1:
            bullet = Paragraph(f"• {item}", bullet_style)
            elements.append(bullet)
        
        elements.append(Spacer(1, 0.2*inch))
        
        # Section 2
        heading2 = Paragraph("2. الدخول إلى المنصة", heading_style)
        elements.append(heading2)
        
        text2 = Paragraph("بعد وصول بيانات الدخول:", normal_style)
        elements.append(text2)
        
        items2 = [
            "اضغط على رابط المنصة: <b>https://discord.gg/t2J8ajgt</b> و سوف يتم تفعيلك في اقرب وقت.",
            "سجل دخولك على منصة الديسكورد و ارسل لنا اسمك على التطبيق.",
            "بعد التواصل مع القسم المختص سيتم اضافتك على السيرفر الخاص بنا و ستظهر لك الدورة علي الشاشة الرئيسية"
        ]
        
        for item in items2:
            bullet = Paragraph(f"• {item}", bullet_style)
            elements.append(bullet)
        
        elements.append(Spacer(1, 0.2*inch))
        
        # Section 3
        heading3 = Paragraph("3. بدء الدراسة", heading_style)
        elements.append(heading3)
        
        items3 = [
            "اختيار اليوم و الوقت المناسبين لك للدراسة.",
            "يرجى الانضمام والمتابعه بمواعيد المحاضرات لديك.",
            "بالأضافة يمكنك بدء مشاهدة الدروس المسجلة فورًا بعد تفعيل حسابك معنا.",
            "المحتوى المسجل على التيليجرام متاح لك 24/7.",
            "جميع الملفات والاختبارات موجودة داخل تطبيق الديسكورد."
        ]
        
        for item in items3:
            bullet = Paragraph(f"• {item}", bullet_style)
            elements.append(bullet)
        
        elements.append(Spacer(1, 0.2*inch))
        
        # Section 4
        heading4 = Paragraph("4. لدعم الفني", heading_style)
        elements.append(heading4)
        
        text4 = Paragraph("إذا واجهتك أي مشكلة:", normal_style)
        elements.append(text4)
        
        bullet4 = Paragraph("• للتواصل والأستفسار معنا عبر واتساب: <b>+972593700806</b>", bullet_style)
        elements.append(bullet4)
        
        elements.append(Spacer(1, 0.3*inch))
        
        # Footer
        footer_text = Paragraph(f"<i>Order Reference: {payment.reference}</i>", ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            textColor='#666666',
            alignment=TA_CENTER
        ))
        elements.append(footer_text)
        
        # Build PDF
        doc.build(elements)
        
        # Get the value of the BytesIO buffer
        pdf = buffer.getvalue()
        buffer.close()
        
        return pdf
        
    except Exception as e:
        logger.error(f"[PDF] Error generating instructions PDF: {str(e)}", exc_info=True)
        raise


def send_payment_receipt_email(payment):
    """Send payment receipt email to customer with PDF instructions"""
    try:
        subject = f'Payment Receipt - Order {payment.reference}'
        
        # Render HTML email template
        html_message = render_to_string('emails/payment_receipt.html', {
            'payment': payment,
        })
        
        # Create plain text version
        plain_message = strip_tags(html_message)
        
        # Use existing PDF file instead of generating
        # Note: Filename contains Unicode direction markers (\u200e\u2068...\u2069)
        pdf_filename_attached = 'اهم_التعليمات_الصادرة_لقناة_التلغرام.pdf'
        pdf_path = os.path.join(BASE_DIR, '\u200e\u2068اهم التعليمات الصادره لقناة التلغرام (1)\u2069.pdf')
        pdf_content = None
        pdf_filename = pdf_filename_attached
        
        try:
            # Try the exact path first
            if not os.path.exists(pdf_path):
                # Fallback: search for the file by pattern
                try:
                    for file in os.listdir(BASE_DIR):
                        if 'اهم التعليمات الصادره لقناة التلغرام' in file and file.endswith('.pdf'):
                            pdf_path = os.path.join(BASE_DIR, file)
                            logger.info(f"[Email] Found PDF file via search: {file}")
                            break
                except Exception as search_error:
                    logger.warning(f"[Email] Could not search for PDF file: {str(search_error)}")
            
            if os.path.exists(pdf_path):
                with open(pdf_path, 'rb') as pdf_file:
                    pdf_content = pdf_file.read()
                logger.info(f"[Email] PDF file found and loaded: {pdf_path}")
            else:
                logger.warning(f"[Email] PDF file not found at {pdf_path}")
                # Try to generate PDF dynamically as fallback (only if reportlab is available)
                if REPORTLAB_AVAILABLE:
                    try:
                        pdf_content = generate_instructions_pdf(payment)
                        pdf_filename = f'instructions_{payment.reference}.pdf'
                        logger.info(f"[Email] Generated PDF dynamically as fallback")
                    except Exception as e:
                        logger.warning(f"[Email] Could not generate PDF dynamically: {str(e)}")
                        pdf_content = None
                        pdf_filename = None
                else:
                    logger.warning(f"[Email] reportlab not available, cannot generate PDF dynamically")
                    pdf_content = None
                    pdf_filename = None
        except Exception as e:
            logger.warning(f"[Email] Could not attach PDF: {str(e)}, sending email without PDF")
            pdf_content = None
            pdf_filename = None
        
        # Validate email address
        if not payment.customer_email or '@' not in payment.customer_email:
            logger.error(f"[Email] Invalid email address: {payment.customer_email}")
            raise ValueError(f"Invalid email address: {payment.customer_email}")
        
        # Create email message
        email = EmailMessage(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[payment.customer_email],
        )
        email.content_subtype = "html"
        email.body = html_message
        
        # Attach PDF if available
        if pdf_content:
            email.attach(pdf_filename, pdf_content, 'application/pdf')
            logger.info(f"[Email] PDF attached: {pdf_filename}")
        
        # Send email with detailed logging
        logger.info(f"[Email] Attempting to send receipt email to {payment.customer_email} for payment {payment.reference}")
        logger.info(f"[Email] From: {settings.DEFAULT_FROM_EMAIL}, SMTP: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        
        try:
            email.send(fail_silently=False)
            logger.info(f"[Email] ✓ Receipt sent successfully to {payment.customer_email} for payment {payment.reference}")
        except Exception as send_error:
            logger.error(f"[Email] ✗ Failed to send email to {payment.customer_email}: {str(send_error)}", exc_info=True)
            # Try to send without PDF as fallback
            if pdf_content:
                logger.info(f"[Email] Retrying without PDF attachment...")
                try:
                    email_without_pdf = EmailMessage(
                        subject=subject,
                        body=html_message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[payment.customer_email],
                    )
                    email_without_pdf.content_subtype = "html"
                    email_without_pdf.send(fail_silently=False)
                    logger.info(f"[Email] ✓ Receipt sent successfully (without PDF) to {payment.customer_email}")
                except Exception as retry_error:
                    logger.error(f"[Email] ✗ Failed to send email even without PDF: {str(retry_error)}")
                    raise
            else:
                raise
        
    except Exception as e:
        logger.error(f"[Email] Error sending receipt email: {str(e)}", exc_info=True)
        raise


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def download_instructions_pdf(request, reference):
    """Download instructions PDF for a payment"""
    try:
        payment = get_object_or_404(Payment, reference=reference)
        
        # Use existing PDF file instead of generating
        # Note: Filename contains Unicode direction markers (\u200e\u2068...\u2069)
        pdf_path = os.path.join(BASE_DIR, '\u200e\u2068اهم التعليمات الصادره لقناة التلغرام (1)\u2069.pdf')
        
        # Try the exact path first, then search if not found
        if not os.path.exists(pdf_path):
            try:
                for file in os.listdir(BASE_DIR):
                    if 'اهم التعليمات الصادره لقناة التلغرام' in file and file.endswith('.pdf'):
                        pdf_path = os.path.join(BASE_DIR, file)
                        logger.info(f"[PDF] Found PDF file via search: {file}")
                        break
            except Exception as search_error:
                logger.warning(f"[PDF] Could not search for PDF file: {str(search_error)}")
        
        if os.path.exists(pdf_path):
            with open(pdf_path, 'rb') as pdf_file:
                pdf_content = pdf_file.read()
            
            # Create response
            from django.http import HttpResponse
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="اهم_التعليمات_الصادرة_لقناة_التلغرام.pdf"'
            
            logger.info(f"[PDF] PDF file served: {pdf_path}")
            return response
        else:
            # Fallback to generating PDF if file doesn't exist (only if reportlab is available)
            logger.warning(f"[PDF] PDF file not found at {pdf_path}")
            if REPORTLAB_AVAILABLE:
                try:
                    pdf_content = generate_instructions_pdf(payment)
                    from django.http import HttpResponse
                    response = HttpResponse(pdf_content, content_type='application/pdf')
                    response['Content-Disposition'] = f'attachment; filename="instructions_{reference}.pdf"'
                    logger.info(f"[PDF] Generated PDF dynamically as fallback")
                    return response
                except Exception as e:
                    logger.error(f"[PDF] Could not generate PDF dynamically: {str(e)}")
                    return Response({
                        'success': False,
                        'error': 'PDF file not found and could not be generated'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                logger.error(f"[PDF] reportlab not available, cannot generate PDF dynamically")
                return Response({
                    'success': False,
                    'error': 'PDF file not found'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        logger.error(f"[PDF] Error downloading instructions PDF: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'error': 'Could not load PDF file'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def test_email(request):
    """Test email sending functionality"""
    try:
        # Get test email from request or use default
        test_email_address = request.data.get('email') or request.GET.get('email') or 'test@example.com'
        
        # Create a test payment object for the template
        from contacts.models import Payment
        from django.utils import timezone
        from decimal import Decimal
        
        # Try to get the most recent payment, or create a mock one
        try:
            test_payment = Payment.objects.filter(status='success').order_by('-paid_at').first()
            if not test_payment:
                # Create a mock payment for testing
                test_payment = Payment(
                    reference='TEST-1234567890',
                    transaction_id='TEST-TXN-123',
                    customer_name='Test Customer',
                    customer_email=test_email_address,
                    amount=Decimal('300.00'),
                    currency='ILS',
                    offer_type='bundle',
                    offer_name='Design Package + VIP Tips',
                    status='success',
                    source='checkout',
                    paid_at=timezone.now(),
                )
        except Exception:
            # Create a mock payment for testing
            test_payment = Payment(
                reference='TEST-1234567890',
                transaction_id='TEST-TXN-123',
                customer_name='Test Customer',
                customer_email=test_email_address,
                amount=Decimal('300.00'),
                currency='ILS',
                offer_type='bundle',
                offer_name='Live Trading + VIP Signals Bundle',
                status='success',
                source='checkout',
                paid_at=timezone.now(),
            )
        
        # Send test email
        subject = 'Test Email - FX Global Payment Receipt'
        
        # Render HTML email template
        html_message = render_to_string('emails/payment_receipt.html', {
            'payment': test_payment,
        })
        
        # Create plain text version
        plain_message = strip_tags(html_message)
        
        # Send email
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[test_email_address],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as email_error:
            error_msg = str(email_error)
            # Provide helpful error messages
            if 'BadCredentials' in error_msg or 'Username and Password not accepted' in error_msg:
                raise Exception(
                    "Gmail authentication failed. Please:\n"
                    "1. Enable 2-Factor Authentication on your Google account\n"
                    "2. Generate an App Password at: https://myaccount.google.com/apppasswords\n"
                    "3. Use the App Password (16 characters) as EMAIL_HOST_PASSWORD environment variable\n"
                    f"Current EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}"
                )
            elif 'Connection refused' in error_msg or 'Connection timed out' in error_msg:
                raise Exception(
                    f"Cannot connect to email server ({settings.EMAIL_HOST}:{settings.EMAIL_PORT}). "
                    "Check your network connection and email server settings."
                )
            else:
                raise
        
        logger.info(f"[Email] Test email sent successfully to {test_email_address}")
        
        return Response({
            'success': True,
            'message': f'Test email sent successfully to {test_email_address}',
            'from_email': settings.DEFAULT_FROM_EMAIL,
        })
        
    except Exception as e:
        logger.error(f"[Email] Error sending test email: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to send test email. Check email configuration in settings.',
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

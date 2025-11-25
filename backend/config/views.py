from django.shortcuts import render, get_object_or_404
from videos.models import Video
from videos.serializers import VideoPublicSerializer
from pathlib import Path
from django.conf import settings
import urllib.parse
from contacts.models import LandingPage, Payment, BlackFridaySettings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
import logging
import requests
from .lahza_service import initialize_transaction, verify_transaction, LahzaAPIError

logger = logging.getLogger(__name__)


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
    return render(request, 'black_friday.html')


@api_view(['GET'])
@permission_classes([AllowAny])
def get_black_friday_end_date(request):
    """Get the Black Friday sale end date from database."""
    try:
        settings = BlackFridaySettings.get_active_settings()
        # Ensure the datetime is timezone-aware
        end_date = settings.end_date
        # Django models with USE_TZ=True store timezone-aware datetimes, but check anyway
        if timezone.is_naive(end_date):
            end_date = timezone.make_aware(end_date)
        
        # Get start date (pre-BF start date is when BF actually starts)
        start_date = settings.pre_black_friday_start_date
        if timezone.is_naive(start_date):
            start_date = timezone.make_aware(start_date)
        
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
        # Return default (midnight tomorrow) if error
        from datetime import timedelta
        try:
            import pytz
            palestine_tz = pytz.timezone('Asia/Gaza')
        except ImportError:
            palestine_tz = timezone.get_fixed_timezone(120)  # GMT+2
        now = timezone.now()
        tomorrow = now + timedelta(days=1)
        tomorrow = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
        if timezone.is_naive(tomorrow):
            tomorrow = timezone.make_aware(tomorrow)
        end_date_timestamp = int(tomorrow.timestamp() * 1000)
        tomorrow_palestine = tomorrow.astimezone(palestine_tz)
        
        return Response({
            'success': True,
            'end_date': tomorrow.isoformat(),
            'end_date_timestamp': end_date_timestamp,
            'start_date': tomorrow.isoformat(),
            'start_date_timestamp': end_date_timestamp,
            'start_date_display': tomorrow_palestine.strftime('%B %d, %Y at %I:%M %p'),
            'end_date_display': tomorrow_palestine.strftime('%B %d, %Y at %I:%M %p'),
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


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def initialize_lahza_payment(request):
    """Initialize a Lahza payment transaction for Black Friday."""
    try:
        data = request.data
        email = data.get('email')
        amount = float(data.get('amount', 0))
        first_name = data.get('firstName', '')
        last_name = data.get('lastName', '')
        mobile = data.get('mobile', '')
        # Support legacy fullName field for backward compatibility
        full_name = data.get('fullName', '')
        offer_type = data.get('offerType', 'bundle')
        source = data.get('source', 'black_friday')
        offer_name = data.get('offerName', '')
        
        if not email or not amount:
            return Response({
                'success': False,
                'error': 'Email and amount are required'
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
        
        # Generate reference
        import uuid
        prefix = 'CK' if source == 'checkout' else 'BF'
        reference = f"{prefix}-{uuid.uuid4().hex[:12].upper()}"
        
        # Build callback URL based on source
        if source == 'checkout':
            base_url = request.build_absolute_uri('/checkout/')
        else:
            base_url = request.build_absolute_uri('/black-friday/')
        callback_url = f"{base_url}?reference={reference}"
        
        # Initialize transaction with Lahza
        transaction_data = initialize_transaction(
            email=email,
            amount_minor=amount_minor,
            currency='USD',
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
        
        # Get recaptcha token if provided
        recaptcha_token = data.get('recaptchaToken', '')
        
        # Verify reCAPTCHA Enterprise token if provided and verification is enabled
        if recaptcha_token and settings.RECAPTCHA_VERIFY_ENABLED:
            # Check if API key is configured (required for Enterprise)
            if not settings.RECAPTCHA_API_KEY or settings.RECAPTCHA_API_KEY.strip() == '':
                logger.error("[reCAPTCHA] API key is not configured in settings")
                return Response({
                    'success': False,
                    'error': 'reCAPTCHA API key is not configured. Please contact support.',
                    'error_codes': ['missing-api-key']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            try:
                # Use reCAPTCHA Enterprise REST API endpoint
                verify_url = f'https://recaptchaenterprise.googleapis.com/v1/projects/{settings.RECAPTCHA_PROJECT_ID}/assessments?key={settings.RECAPTCHA_API_KEY}'
                
                # Enterprise API requires JSON body with event object
                verify_data = {
                    'event': {
                        'token': recaptcha_token,
                        'expectedAction': 'payment_submit',  # Should match the action used in frontend
                        'siteKey': settings.RECAPTCHA_SITE_KEY
                    }
                }
                
                logger.info(f"[reCAPTCHA] Verifying Enterprise token (token length: {len(recaptcha_token)}, project: {settings.RECAPTCHA_PROJECT_ID})")
                
                verify_response = requests.post(
                    verify_url, 
                    json=verify_data,  # Use json parameter for JSON body
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                # Check HTTP status
                if verify_response.status_code != 200:
                    logger.error(f"[reCAPTCHA] HTTP error {verify_response.status_code}: {verify_response.text}")
                    return Response({
                        'success': False,
                        'error': 'reCAPTCHA verification service error. Please try again.',
                        'error_codes': ['http-error']
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                verify_result = verify_response.json()
                logger.info(f"[reCAPTCHA] Verification response: {verify_result}")
                
                # Check if token is valid
                # Enterprise API returns tokenProperties with valid field
                token_properties = verify_result.get('tokenProperties', {})
                is_valid = token_properties.get('valid', False)
                action = token_properties.get('action', '')
                
                if not is_valid:
                    invalid_reason = token_properties.get('invalidReason', 'UNKNOWN')
                    logger.warning(f"[reCAPTCHA] Invalid token: {invalid_reason} (token: {recaptcha_token[:20]}...)")
                    return Response({
                        'success': False,
                        'error': 'reCAPTCHA token is invalid or expired. Please complete the verification again.',
                        'error_codes': [invalid_reason]
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Verify action matches
                if action != 'payment_submit':
                    logger.warning(f"[reCAPTCHA] Action mismatch: expected 'payment_submit', got '{action}'")
                    # Don't fail, but log it
                
                # Check risk score (optional, but good to log)
                risk_analysis = verify_result.get('riskAnalysis', {})
                score = risk_analysis.get('score', 1.0)  # Score ranges from 0.0 (bot) to 1.0 (human)
                logger.info(f"[reCAPTCHA] Verification successful - score: {score}, action: {action}")
                
                # Optionally reject low scores (you can adjust threshold)
                if score < 0.5:
                    logger.warning(f"[reCAPTCHA] Low risk score: {score}")
                    # You can choose to reject or just log it
                
            except requests.RequestException as e:
                logger.error(f"[reCAPTCHA] Network error verifying token: {str(e)}", exc_info=True)
                return Response({
                    'success': False,
                    'error': 'reCAPTCHA verification service unavailable. Please try again.',
                    'error_codes': ['network-error']
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            except Exception as e:
                logger.exception(f"[reCAPTCHA] Unexpected error during verification: {str(e)}")
                return Response({
                    'success': False,
                    'error': 'reCAPTCHA verification error. Please try again.',
                    'error_codes': ['internal-error']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        elif settings.RECAPTCHA_VERIFY_ENABLED:
            # reCAPTCHA token is required for payment (only if verification is enabled)
            logger.warning("[reCAPTCHA] No token provided for payment")
            return Response({
                'success': False,
                'error': 'reCAPTCHA verification is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Backend verification is disabled, just log it
            logger.info("[reCAPTCHA] Backend verification disabled, proceeding without verification")
        
        # Create payment record in database with all form data
        payment = Payment.objects.create(
            reference=reference,
            customer_name=customer_name,
            customer_email=email,
            first_name=first_name if first_name else None,
            last_name=last_name if last_name else None,
            mobile=mobile if mobile else None,
            amount=amount,
            currency='USD',
            offer_type=offer_type,
            offer_name=offer_name,
            source=source,
            status='pending',
            metadata={
                'offer_type': offer_type,
                'source': source,
                'offer_name': offer_name,
                'mobile': mobile if mobile else None,
                'recaptcha_token': recaptcha_token if recaptcha_token else None,
                'form_data': {
                    'firstName': first_name,
                    'lastName': last_name,
                    'mobile': mobile,
                    'email': email,
                }
            }
        )
        
        logger.info(f"[Payment] Created payment record: {payment.reference}")
        
        return Response({
            'success': True,
            'reference': transaction_data.get('reference'),
            'authorization_url': transaction_data.get('authorization_url'),
            'access_code': transaction_data.get('access_code'),
        })
        
    except LahzaAPIError as e:
        logger.error(f"[Lahza] Payment initialization error: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("[Lahza] Unexpected error during payment initialization")
        return Response({
            'success': False,
            'error': 'An error occurred while initializing payment'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def verify_lahza_payment(request):
    """Verify a Lahza payment transaction."""
    try:
        # Get reference from query params or request data
        reference = request.GET.get('reference') or request.data.get('reference')
        
        if not reference:
            return Response({
                'success': False,
                'error': 'Payment reference is required'
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
                    currency='USD',
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
        except Exception as e:
            logger.error(f"[Lahza] Error verifying transaction: {str(e)}")
            payment.mark_as_failed(f'Verification error: {str(e)}')
            raise
        
        # Check transaction status
        transaction_status = transaction_data.get('status', '').lower()
        
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
        
        if transaction_status == 'success':
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
                    currency_value = transaction_data.get('currency', 'USD')
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
            
            # Mark payment as successful (this saves the payment)
            try:
                payment.mark_as_success(transaction_data)
            except Exception as e:
                logger.error(f"[Payment] Error marking payment as success: {str(e)}", exc_info=True)
                # Try to save manually
                payment.status = 'success'
                from django.utils import timezone
                if not payment.paid_at:
                    payment.paid_at = timezone.now()
                payment.save()
            
            logger.info(f"[Payment] Payment verified successfully: {reference}")
            
            # Send receipt email
            try:
                send_payment_receipt_email(payment)
                logger.info(f"[Payment] Receipt email sent to {payment.customer_email}")
            except Exception as e:
                logger.error(f"[Payment] Error sending receipt email: {str(e)}", exc_info=True)
                # Don't fail the payment verification if email fails
            
            return Response({
                'success': True,
                'message': 'Payment verified successfully',
                'transaction_id': transaction_data.get('id') or payment.transaction_id,
                'reference': reference,
                'amount': float(payment.amount),
                'currency': payment.currency,
                'email': payment.customer_email,
            })
        else:
            # Mark payment as failed
            payment.mark_as_failed(f'Payment status: {transaction_status}')
            
            logger.warning(f"[Payment] Payment verification failed: {reference}, status: {transaction_status}")
            
            return Response({
                'success': False,
                'error': f'Payment status: {transaction_status}',
                'transaction_status': transaction_status,
            }, status=status.HTTP_400_BAD_REQUEST)
        
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
            reference = request.GET.get('reference') or request.data.get('reference')
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
        return Response({
            'success': False,
            'error': error_detail
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def send_payment_receipt_email(payment):
    """Send payment receipt email to customer"""
    try:
        subject = f'Payment Receipt - Order {payment.reference}'
        
        # Render HTML email template
        html_message = render_to_string('emails/payment_receipt.html', {
            'payment': payment,
        })
        
        # Create plain text version
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[payment.customer_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"[Email] Receipt sent successfully to {payment.customer_email} for payment {payment.reference}")
        
    except Exception as e:
        logger.error(f"[Email] Error sending receipt email: {str(e)}", exc_info=True)
        raise


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
                    currency='USD',
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
                currency='USD',
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

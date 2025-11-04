from django.shortcuts import render
from videos.models import Video
from videos.serializers import VideoPublicSerializer


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
    
    context = {
        'hero_video': hero_video,
    }
    return render(request, 'landing_page.html', context)

from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import get_active_videos, get_hero_video, VideoViewSet

router = DefaultRouter()
router.register(r'admin', VideoViewSet, basename='video')

urlpatterns = [
    path('active/', get_active_videos, name='active-videos'),
    path('hero/', get_hero_video, name='hero-video'),
]

urlpatterns += router.urls


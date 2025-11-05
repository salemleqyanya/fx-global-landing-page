from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from .models import Video
from .serializers import VideoSerializer, VideoPublicSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_videos(request):
    """Public endpoint to get active videos"""
    position = request.query_params.get('position', None)
    queryset = Video.objects.filter(is_active=True)
    
    if position:
        queryset = queryset.filter(position=position)
    
    # Order by order field, then by creation date
    queryset = queryset.order_by('order', '-created_at')
    
    serializer = VideoPublicSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_hero_video(request):
    """Get the hero video for the landing page"""
    video = Video.objects.filter(is_active=True, position='hero').order_by('order', '-created_at').first()
    if video:
        serializer = VideoPublicSerializer(video, context={'request': request})
        return Response(serializer.data)
    return Response({'message': 'No hero video found'}, status=404)


class VideoViewSet(viewsets.ModelViewSet):
    """ViewSet for managing videos (admin only)"""
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [IsAdminUser]
from rest_framework import serializers
from .models import Video


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'badge_label', 'vimeo_id', 'video_url', 
            'video_file', 'position', 'is_active', 'order', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VideoPublicSerializer(serializers.ModelSerializer):
    """Serializer for public video API (only active videos)"""
    video_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 'vimeo_id', 'video_url', 'video_file_url', 'position', 'badge_label', 'order']
    
    def get_video_file_url(self, obj):
        """Get full URL for video file if it exists"""
        if obj.video_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video_file.url)
        return None


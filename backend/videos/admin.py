from django.contrib import admin
from .models import Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'position', 'is_active', 'order', 'created_at', 'video_type']
    list_filter = ['is_active', 'position', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['is_active', 'order']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description')
        }),
        ('Video Content', {
            'fields': ('video_file', 'vimeo_id', 'video_url'),
            'description': 'Upload a video file OR provide Vimeo ID OR video URL. Only one is required.'
        }),
        ('Display Settings', {
            'fields': ('position', 'order', 'is_active'),
            'description': 'Select where this video should appear on the website.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def video_type(self, obj):
        """Display what type of video source is being used"""
        if obj.video_file:
            return 'Uploaded File'
        elif obj.vimeo_id:
            return 'Vimeo'
        elif obj.video_url:
            return 'External URL'
        return 'No video'
    video_type.short_description = 'Video Type'
    
    class Media:
        css = {
            'all': ('admin/css/video_admin.css',)
        }

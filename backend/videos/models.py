from django.db import models
from django.utils import timezone


class Video(models.Model):
    """Model for managing videos on the landing page"""
    
    title = models.CharField(max_length=200, verbose_name="العنوان")
    description = models.TextField(blank=True, null=True, verbose_name="الوصف")
    badge_label = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        verbose_name="تسمية الشارة",
        help_text="مثال: وحش الشهر، طبيب ناجح، طالب طموح"
    )
    
    # Vimeo video ID
    vimeo_id = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        verbose_name="معرف Vimeo"
    )
    
    # Direct video URL (alternative to Vimeo)
    video_url = models.URLField(blank=True, null=True, verbose_name="رابط الفيديو")
    
    # Video file upload (alternative)
    video_file = models.FileField(
        upload_to='videos/', 
        blank=True, 
        null=True,
        verbose_name="ملف الفيديو"
    )
    
    # Position/order on the page
    position = models.CharField(
        max_length=50,
        default='hero',
        choices=[
            ('hero', 'Starts Page (Hero Section)'),
            ('services', 'Services Section'),
            ('testimonials', 'Testimonials Section'),
            ('other', 'Other'),
        ],
        verbose_name="الموقع"
    )
    
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    order = models.IntegerField(default=0, verbose_name="الترتيب")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")
    
    class Meta:
        verbose_name = "فيديو"
        verbose_name_plural = "الفيديوهات"
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.position}"

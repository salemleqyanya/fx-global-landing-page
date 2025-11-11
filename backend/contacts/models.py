import uuid

from django.db import models
from django.urls import reverse
from django.utils import timezone


def generate_short_code(length=8):
    """Generate a unique short code consisting of uppercase letters and digits."""
    return uuid.uuid4().hex[:length].upper()


class LandingPage(models.Model):
    """Represents a distinct landing page with a shareable short URL."""

    TEMPLATE_CHOICES = [
        ('classic', 'التصميم الكلاسيكي'),
        ('neon', 'تصميم نيو-نيون'),
    ]

    name = models.CharField(max_length=150, verbose_name="اسم الصفحة")
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="UUID")
    short_code = models.CharField(max_length=8, unique=True, editable=False, verbose_name="الكود المختصر")
    description = models.TextField(blank=True, verbose_name="وصف / ملاحظات")
    is_active = models.BooleanField(default=True, verbose_name="فعّالة؟")
    template = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default='classic', verbose_name="التصميم")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="تاريخ الإنشاء")

    class Meta:
        verbose_name = "صفحة هبوط"
        verbose_name_plural = "صفحات الهبوط"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.short_code})"

    def save(self, *args, **kwargs):
        if not self.short_code:
            code = generate_short_code()
            while LandingPage.objects.filter(short_code=code).exists():
                code = generate_short_code()
            self.short_code = code
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('landing_page_short', args=[self.short_code])


class CustomerContact(models.Model):
    """Model for customer registration/contact form"""
    landing_page = models.ForeignKey(
        LandingPage,
        on_delete=models.SET_NULL,
        related_name='contacts',
        null=True,
        blank=True,
        verbose_name="صفحة الهبوط"
    )
    
    GOAL_CHOICES = [
        ('income', 'بدي أخلق دخل إضافي ثابت يحسّن وضعي المادي'),
        ('career', 'هدفي أخليه شغلي الأساسي وأتفرّغ إله'),
        ('learn', 'بدي أتعلم المجال وأفهمه بعمق قبل ما أبدأ فعليًا'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="الاسم الكامل")
    phone = models.CharField(max_length=20, verbose_name="رقم الجوال", default='', blank=True)
    whatsapp = models.CharField(max_length=20, verbose_name="رقم الواتساب")
    message = models.TextField(verbose_name="الرسالة", default="", blank=True)
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name="العنوان")
    goal = models.CharField(
        max_length=20, 
        choices=GOAL_CHOICES, 
        blank=True, 
        null=True,
        verbose_name="الهدف"
    )
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name="المدينة")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="تاريخ التسجيل")
    is_contacted = models.BooleanField(default=False, verbose_name="تم التواصل")
    notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات")
    
    class Meta:
        verbose_name = "تسجيل عميل"
        verbose_name_plural = "تسجيلات العملاء"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.whatsapp}"

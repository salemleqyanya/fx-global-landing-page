from django.db import models
from django.utils import timezone


class CustomerContact(models.Model):
    """Model for customer registration/contact form"""
    
    GOAL_CHOICES = [
        ('income', 'بدي أخلق دخل إضافي ثابت يحسّن وضعي المادي'),
        ('career', 'هدفي أخليه شغلي الأساسي وأتفرّغ إله'),
        ('learn', 'بدي أتعلم المجال وأفهمه بعمق قبل ما أبدأ فعليًا'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="الاسم الكامل")
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

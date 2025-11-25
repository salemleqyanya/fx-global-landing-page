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


class Payment(models.Model):
    """Model for tracking Lahza payment transactions"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    SOURCE_CHOICES = [
        ('black_friday', 'Black Friday'),
        ('checkout', 'Checkout'),
        ('other', 'Other'),
    ]
    
    # Lahza transaction details
    reference = models.CharField(max_length=100, unique=True, verbose_name="Payment Reference")
    transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="Transaction ID")
    
    # Customer information
    customer_name = models.CharField(max_length=200, verbose_name="Customer Name")
    customer_email = models.EmailField(verbose_name="Customer Email")
    first_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="First Name")
    last_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Last Name")
    mobile = models.CharField(max_length=20, blank=True, null=True, verbose_name="Mobile Number")
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Amount")
    currency = models.CharField(max_length=3, default='USD', verbose_name="Currency")
    
    # Card information (saved after payment)
    card_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="Card Type", help_text="e.g., Visa, Mastercard")
    card_brand = models.CharField(max_length=50, blank=True, null=True, verbose_name="Card Brand")
    last_four_digits = models.CharField(max_length=4, blank=True, null=True, verbose_name="Last 4 Digits", help_text="Last 4 digits of card number")
    card_expiry_month = models.CharField(max_length=2, blank=True, null=True, verbose_name="Expiry Month")
    card_expiry_year = models.CharField(max_length=4, blank=True, null=True, verbose_name="Expiry Year")
    
    # Offer information
    offer_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="Offer Type")
    offer_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="Offer Name")
    
    # Payment status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Status")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='checkout', verbose_name="Source")
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadata")
    lahza_response = models.JSONField(default=dict, blank=True, verbose_name="Lahza Response")
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    paid_at = models.DateTimeField(blank=True, null=True, verbose_name="Paid At")
    
    class Meta:
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reference']),
            models.Index(fields=['customer_email']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.reference} - {self.customer_email} - ${self.amount} ({self.status})"
    
    def mark_as_success(self, transaction_data=None):
        """Mark payment as successful and extract card information"""
        from django.utils import timezone
        self.status = 'success'
        if not self.paid_at:
            self.paid_at = timezone.now()
        if transaction_data:
            # Don't overwrite lahza_response if it's already set (might have more data)
            if not self.lahza_response or not isinstance(self.lahza_response, dict):
                self.lahza_response = {}
            if isinstance(transaction_data, dict):
                self.lahza_response.update(transaction_data)
            if 'id' in transaction_data:
                self.transaction_id = str(transaction_data['id'])
            
            # Extract card information from transaction data
            # Lahza API may return card info in different formats
            card_info = None
            if 'card' in transaction_data:
                card_info = transaction_data.get('card', {})
            elif 'authorization' in transaction_data:
                auth = transaction_data.get('authorization', {})
                if 'card' in auth:
                    card_info = auth.get('card', {})
            elif 'payment_method' in transaction_data:
                pm = transaction_data.get('payment_method', {})
                if 'card' in pm:
                    card_info = pm.get('card', {})
            
            if card_info and isinstance(card_info, dict):
                # Extract card type/brand
                if 'type' in card_info:
                    self.card_type = str(card_info.get('type', ''))[:50]
                elif 'brand' in card_info:
                    self.card_type = str(card_info.get('brand', ''))[:50]
                
                if 'brand' in card_info:
                    self.card_brand = str(card_info.get('brand', ''))[:50]
                elif 'type' in card_info:
                    self.card_brand = str(card_info.get('type', ''))[:50]
                
                # Extract last 4 digits
                if 'last4' in card_info:
                    self.last_four_digits = str(card_info.get('last4', ''))[:4]
                elif 'last_4' in card_info:
                    self.last_four_digits = str(card_info.get('last_4', ''))[:4]
                elif 'last_four' in card_info:
                    self.last_four_digits = str(card_info.get('last_four', ''))[:4]
                
                # Extract expiry information
                if 'exp_month' in card_info:
                    self.card_expiry_month = str(card_info.get('exp_month', ''))[:2]
                elif 'expiry_month' in card_info:
                    self.card_expiry_month = str(card_info.get('expiry_month', ''))[:2]
                
                if 'exp_year' in card_info:
                    exp_year = str(card_info.get('exp_year', ''))
                    # Handle 2-digit years (convert to 4-digit)
                    if len(exp_year) == 2:
                        exp_year = '20' + exp_year
                    self.card_expiry_year = exp_year[:4]
                elif 'expiry_year' in card_info:
                    exp_year = str(card_info.get('expiry_year', ''))
                    if len(exp_year) == 2:
                        exp_year = '20' + exp_year
                    self.card_expiry_year = exp_year[:4]
        self.save()
    
    def mark_as_failed(self, error_message=None):
        """Mark payment as failed"""
        self.status = 'failed'
        if error_message:
            if 'errors' not in self.metadata:
                self.metadata['errors'] = []
            self.metadata['errors'].append({
                'message': error_message,
                'timestamp': timezone.now().isoformat()
            })
        self.save()


class BlackFridaySettings(models.Model):
    """Model for storing Black Friday sale settings"""
    
    # Use singleton pattern - only one active settings object
    is_active = models.BooleanField(default=True, verbose_name="Active Settings")
    pre_black_friday_start_date = models.DateTimeField(
        verbose_name="Pre-Black Friday Start Date/Time",
        help_text="Date when the pre-Black Friday timer should start counting down",
        default=timezone.now
    )
    end_date = models.DateTimeField(verbose_name="Sale End Date/Time")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    class Meta:
        verbose_name = "Black Friday Settings"
        verbose_name_plural = "Black Friday Settings"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Black Friday Sale - Ends: {self.end_date}"
    
    def save(self, *args, **kwargs):
        # Ensure only one active settings object exists
        if self.is_active:
            BlackFridaySettings.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)
    
    @classmethod
    def get_active_settings(cls):
        """Get the active Black Friday settings"""
        settings = cls.objects.filter(is_active=True).first()
        if not settings:
            # Check if any settings exist at all (even inactive ones)
            any_settings = cls.objects.first()
            if any_settings:
                # If there are inactive settings, activate the most recent one
                settings = cls.objects.order_by('-created_at').first()
                settings.is_active = True
                settings.save()
            else:
                # Only create default settings if NO settings exist at all
                # Use a fixed date (midnight of next day) that won't change
                from datetime import timedelta
                now = timezone.now()
                tomorrow = now + timedelta(days=1)
                tomorrow = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
                # Default pre-BF start date to November 26th of current year
                pre_bf_date = now.replace(month=11, day=26, hour=0, minute=0, second=0, microsecond=0)
                # If November 26th has already passed this year, set it to next year
                if pre_bf_date < now:
                    pre_bf_date = pre_bf_date.replace(year=now.year + 1)
                settings = cls.objects.create(
                    pre_black_friday_start_date=pre_bf_date,
                    end_date=tomorrow,
                    is_active=True
                )
        return settings


class BlackFridayContact(models.Model):
    """Model for storing Black Friday contact form submissions"""
    
    FORM_TYPE_CHOICES = [
        ('pre_bf', 'Pre-Black Friday Form'),
        ('main_contact', 'Main Contact Form'),
        ('other', 'Other'),
    ]
    
    # Contact information
    name = models.CharField(max_length=200, verbose_name="Name")
    email = models.EmailField(verbose_name="Email", blank=True, null=True)
    phone = models.CharField(max_length=20, verbose_name="Phone Number", blank=True, null=True)
    whatsapp = models.CharField(max_length=20, verbose_name="WhatsApp Number", blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name="City")
    message = models.TextField(blank=True, null=True, verbose_name="Message")
    
    # Form metadata
    form_type = models.CharField(
        max_length=20,
        choices=FORM_TYPE_CHOICES,
        default='other',
        verbose_name="Form Type"
    )
    
    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadata")
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Created At")
    
    class Meta:
        verbose_name = "Black Friday Contact"
        verbose_name_plural = "Black Friday Contacts"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['form_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.form_type} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"

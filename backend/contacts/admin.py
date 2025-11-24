from django.contrib import admin
from django.http import HttpResponse
from django.utils import timezone
import csv

from .models import CustomerContact, Payment, BlackFridaySettings, BlackFridayContact, LandingPage


@admin.register(LandingPage)
class LandingPageAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_code', 'template', 'is_active', 'created_at']
    list_filter = ['is_active', 'template', 'created_at']
    search_fields = ['name', 'short_code', 'description']
    readonly_fields = ['uuid', 'short_code', 'created_at']
    date_hierarchy = 'created_at'
    actions = ['export_landing_pages_csv']
    
    fieldsets = (
        ('Page Information', {
            'fields': ('name', 'short_code', 'uuid', 'template', 'is_active')
        }),
        ('Description', {
            'fields': ('description',)
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    
    def export_landing_pages_csv(self, request, queryset):
        """Export selected landing pages to CSV file."""
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f'landing_pages_{timestamp}.csv'
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        writer = csv.writer(response)
        headers = [
            'Name',
            'Short Code',
            'UUID',
            'Template',
            'Is Active',
            'Description',
            'Created At',
        ]
        writer.writerow(headers)
        
        for page in queryset:
            writer.writerow([
                page.name,
                page.short_code,
                str(page.uuid),
                page.get_template_display(),
                'Yes' if page.is_active else 'No',
                page.description.replace('\n', ' ').strip() if page.description else '',
                timezone.localtime(page.created_at).strftime('%Y-%m-%d %H:%M:%S') if page.created_at else '',
            ])
        
        return response
    
    export_landing_pages_csv.short_description = "Export to CSV"


@admin.register(CustomerContact)
class CustomerContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'whatsapp', 'goal', 'city', 'address', 'created_at', 'is_contacted','landing_page']
    list_filter = ['is_contacted', 'goal', 'created_at','landing_page']
    search_fields = ['name', 'phone', 'whatsapp', 'city', 'address', 'message']
    readonly_fields = ['created_at']
    list_editable = ['is_contacted']
    date_hierarchy = 'created_at'
    actions = ['export_contacts_csv']
    
    fieldsets = (
        ('معلومات العميل', {
            'fields': ('name', 'phone', 'whatsapp', 'city', 'address','landing_page')
        }),
        ('التفاصيل', {
            'fields': ('goal', 'message', 'notes')
        }),
        ('الحالة', {
            'fields': ('is_contacted', 'created_at')
        }),
    )

    def export_contacts_csv(self, request, queryset):
        """Export selected contacts to CSV file."""
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f'customer_contacts_{timestamp}.csv'

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        writer = csv.writer(response)
        headers = [
            'Name',
            'Phone',
            'WhatsApp',
            'Goal',
            'City',
            'Address',
            'Message',
            'Notes',
            'Is Contacted',
            'Created At',
        ]
        writer.writerow(headers)

        for contact in queryset:
            writer.writerow([
                contact.name,
                contact.phone,
                contact.whatsapp,
                contact.get_goal_display() if contact.goal else '',
                contact.city or '',
                contact.address or '',
                contact.message.replace('\n', ' ').strip() if contact.message else '',
                contact.notes.replace('\n', ' ').strip() if contact.notes else '',
                'Yes' if contact.is_contacted else 'No',
                timezone.localtime(contact.created_at).strftime('%Y-%m-%d %H:%M:%S') if contact.created_at else '',
            ])

        return response

    export_contacts_csv.short_description = "تصدير كملف CSV"


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['reference', 'customer_name', 'customer_email', 'first_name', 'last_name', 'mobile', 'amount', 'currency', 'status', 'source', 'offer_type', 'created_at', 'paid_at']
    list_filter = ['status', 'source', 'currency', 'created_at', 'paid_at']
    search_fields = ['reference', 'transaction_id', 'customer_name', 'customer_email', 'first_name', 'last_name', 'mobile', 'offer_type']
    readonly_fields = ['reference', 'transaction_id', 'created_at', 'updated_at', 'paid_at', 'lahza_response', 'metadata']
    date_hierarchy = 'created_at'
    actions = ['export_payments_csv', 'mark_as_success', 'mark_as_failed']
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('reference', 'transaction_id', 'status', 'source')
        }),
        ('Customer Information', {
            'fields': ('customer_name', 'customer_email', 'first_name', 'last_name', 'mobile')
        }),
        ('Payment Details', {
            'fields': ('amount', 'currency', 'offer_type', 'offer_name')
        }),
        ('Transaction Data', {
            'fields': ('lahza_response', 'metadata'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at')
        }),
    )
    
    def mark_as_success(self, request, queryset):
        """Mark selected payments as successful"""
        count = 0
        for payment in queryset:
            if payment.status != 'success':
                payment.mark_as_success()
                count += 1
        self.message_user(request, f'{count} payment(s) marked as successful.')
    mark_as_success.short_description = "Mark selected payments as successful"
    
    def mark_as_failed(self, request, queryset):
        """Mark selected payments as failed"""
        count = 0
        for payment in queryset:
            if payment.status != 'failed':
                payment.mark_as_failed('Manually marked as failed by admin')
                count += 1
        self.message_user(request, f'{count} payment(s) marked as failed.')
    mark_as_failed.short_description = "Mark selected payments as failed"
    
    def export_payments_csv(self, request, queryset):
        """Export selected payments to CSV"""
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f'payments_{timestamp}.csv'
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Reference', 'Transaction ID', 'Customer Name', 'Customer Email', 
            'First Name', 'Last Name', 'Mobile',
            'Amount', 'Currency', 'Status', 'Source', 'Offer Type', 'Offer Name',
            'Created At', 'Paid At'
        ])
        for payment in queryset:
            writer.writerow([
                payment.reference,
                payment.transaction_id or '',
                payment.customer_name,
                payment.customer_email,
                payment.first_name or '',
                payment.last_name or '',
                payment.mobile or '',
                payment.amount,
                payment.currency,
                payment.get_status_display(),
                payment.get_source_display(),
                payment.offer_type or '',
                payment.offer_name or '',
                timezone.localtime(payment.created_at).strftime('%Y-%m-%d %H:%M:%S') if payment.created_at else '',
                timezone.localtime(payment.paid_at).strftime('%Y-%m-%d %H:%M:%S') if payment.paid_at else '',
            ])
        return response
    export_payments_csv.short_description = "Export selected payments to CSV"


@admin.register(BlackFridaySettings)
class BlackFridaySettingsAdmin(admin.ModelAdmin):
    list_display = ['pre_black_friday_start_date', 'end_date', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    actions = ['export_settings_csv']
    
    fieldsets = (
        ('Settings', {
            'fields': ('is_active', 'pre_black_friday_start_date', 'end_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def has_add_permission(self, request):
        # Allow adding if no active settings exist
        if BlackFridaySettings.objects.filter(is_active=True).exists():
            return False
        return True
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of active settings
        if obj and obj.is_active:
            return False
        return True
    
    def export_settings_csv(self, request, queryset):
        """Export selected settings to CSV file."""
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f'black_friday_settings_{timestamp}.csv'
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        writer = csv.writer(response)
        headers = [
            'Is Active',
            'Pre-Black Friday Start Date',
            'End Date',
            'Created At',
            'Updated At',
        ]
        writer.writerow(headers)
        
        for setting in queryset:
            writer.writerow([
                'Yes' if setting.is_active else 'No',
                timezone.localtime(setting.pre_black_friday_start_date).strftime('%Y-%m-%d %H:%M:%S') if setting.pre_black_friday_start_date else '',
                timezone.localtime(setting.end_date).strftime('%Y-%m-%d %H:%M:%S') if setting.end_date else '',
                timezone.localtime(setting.created_at).strftime('%Y-%m-%d %H:%M:%S') if setting.created_at else '',
                timezone.localtime(setting.updated_at).strftime('%Y-%m-%d %H:%M:%S') if setting.updated_at else '',
            ])
        
        return response
    
    export_settings_csv.short_description = "Export to CSV"


@admin.register(BlackFridayContact)
class BlackFridayContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'whatsapp', 'city', 'form_type', 'created_at']
    list_filter = ['form_type', 'created_at']
    search_fields = ['name', 'email', 'phone', 'whatsapp', 'city', 'message']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    actions = ['export_contacts_csv']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone', 'whatsapp', 'city')
        }),
        ('Form Details', {
            'fields': ('form_type', 'message', 'metadata')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    
    def export_contacts_csv(self, request, queryset):
        """Export selected contacts to CSV file."""
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f'black_friday_contacts_{timestamp}.csv'
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        writer = csv.writer(response)
        headers = [
            'Name',
            'Email',
            'Phone',
            'WhatsApp',
            'City',
            'Message',
            'Form Type',
            'Created At',
        ]
        writer.writerow(headers)
        
        for contact in queryset:
            writer.writerow([
                contact.name,
                contact.email or '',
                contact.phone or '',
                contact.whatsapp or '',
                contact.city or '',
                contact.message.replace('\n', ' ').strip() if contact.message else '',
                contact.get_form_type_display(),
                timezone.localtime(contact.created_at).strftime('%Y-%m-%d %H:%M:%S') if contact.created_at else '',
            ])
        
        return response
    
    export_contacts_csv.short_description = "Export to CSV"

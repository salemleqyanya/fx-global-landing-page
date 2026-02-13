from django.contrib import admin
from django.http import HttpResponse
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe
import csv
import json
import requests

from .models import CustomerContact, Payment, BlackFridaySettings, BlackFridayContact, LandingPage, RamadanContact

# Set admin site name to fxglobal
admin.site.site_header = "FX Global Administration"
admin.site.site_title = "FX Global"
admin.site.index_title = "FX Global Admin"


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
    actions = ['export_contacts_csv', 'send_to_accounting_modules']
    
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
    
    def send_to_accounting_modules(self, request, queryset):
        """Send selected contacts to accounting_modules as customers"""
        # API endpoint URL - adjust port if needed
        api_url = 'https://site.fxglobal.cloud/sales/api/create-customer/'
        
        success_count = 0
        error_count = 0
        skipped_count = 0
        errors = []
        
        for contact in queryset:
            try:
                # Prepare data
                data = {
                    'name': contact.name,
                    'phone': contact.phone or contact.whatsapp,
                    'whatsapp': contact.whatsapp,
                    'city': contact.city,
                    'address': contact.address,
                    'goal': contact.get_goal_display() if contact.goal else None,
                    'message': contact.message,
                    'source_key': 'black'
                }
                
                # Send POST request
                response = requests.post(
                    api_url,
                    json=data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 201:
                    success_count += 1
                    # Mark as contacted
                    contact.is_contacted = True
                    contact.save()
                elif response.status_code == 409:
                    # Customer already exists
                    skipped_count += 1
                    errors.append(f"{contact.name}: Customer already exists")
                else:
                    error_count += 1
                    error_msg = response.json().get('error', 'Unknown error') if response.content else 'Unknown error'
                    errors.append(f"{contact.name}: {error_msg}")
                    
            except requests.exceptions.RequestException as e:
                error_count += 1
                errors.append(f"{contact.name}: Connection error - {str(e)}")
            except Exception as e:
                error_count += 1
                errors.append(f"{contact.name}: {str(e)}")
        
        # Prepare message
        message_parts = [
            f"Successfully sent: {success_count}",
            f"Already exists: {skipped_count}",
            f"Errors: {error_count}"
        ]
        
        if errors:
            message_parts.append("\nErrors:")
            message_parts.extend(errors[:10])  # Show first 10 errors
            if len(errors) > 10:
                message_parts.append(f"... and {len(errors) - 10} more errors")
        
        self.message_user(
            request,
            "\n".join(message_parts),
            level='success' if error_count == 0 else 'warning' if success_count > 0 else 'error'
        )
    
    send_to_accounting_modules.short_description = "إرسال إلى accounting_modules (Sales/Customer)"


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['reference', 'customer_name', 'customer_email', 'first_name', 'last_name', 'mobile', 'amount', 'currency', 'status', 'source', 'offer_type', 'created_at', 'paid_at']
    list_filter = ['status', 'source', 'currency', 'created_at', 'paid_at']
    search_fields = ['reference', 'transaction_id', 'customer_name', 'customer_email', 'first_name', 'last_name', 'mobile', 'offer_type']
    readonly_fields = ['reference', 'transaction_id', 'created_at', 'updated_at', 'paid_at', 'lahza_response_table', 'metadata_table', 'card_info_display']
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
            'fields': ('amount', 'currency', 'offer_type', 'offer_name', 'card_info_display')
        }),
        ('Lahza Response', {
            'fields': ('lahza_response_table',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('metadata_table',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at')
        }),
    )
    
    def lahza_response_table(self, obj):
        """Display Lahza response data in a table format"""
        if not obj.lahza_response or not isinstance(obj.lahza_response, dict):
            return "No data available"
        
        from django.utils.html import escape
        
        html = '<table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 12px;">'
        html += '<thead><tr style="background-color: #417690; color: white;"><th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Field</th><th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Value</th></tr></thead>'
        html += '<tbody>'
        
        def format_value(value):
            """Format value for display"""
            if isinstance(value, dict):
                json_str = json.dumps(value, indent=2, ensure_ascii=False)
                return f'<pre style="margin: 0; white-space: pre-wrap;">{escape(json_str)}</pre>'
            elif isinstance(value, list):
                json_str = json.dumps(value, indent=2, ensure_ascii=False)
                return f'<pre style="margin: 0; white-space: pre-wrap;">{escape(json_str)}</pre>'
            elif value is None:
                return '<em style="color: #999;">null</em>'
            else:
                return escape(str(value))
        
        # Sort keys for better readability
        sorted_keys = sorted(obj.lahza_response.keys())
        for key in sorted_keys:
            value = obj.lahza_response[key]
            formatted_value = format_value(value)
            html += f'<tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">{escape(key)}</td><td style="padding: 8px; border: 1px solid #ddd; word-break: break-word;">{formatted_value}</td></tr>'
        
        html += '</tbody></table>'
        return mark_safe(html)
    lahza_response_table.short_description = "Lahza Response Data"
    
    def metadata_table(self, obj):
        """Display metadata in a table format"""
        if not obj.metadata or not isinstance(obj.metadata, dict):
            return "No data available"
        
        from django.utils.html import escape
        
        html = '<table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 12px;">'
        html += '<thead><tr style="background-color: #417690; color: white;"><th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Field</th><th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Value</th></tr></thead>'
        html += '<tbody>'
        
        def format_value(value):
            """Format value for display"""
            if isinstance(value, dict):
                json_str = json.dumps(value, indent=2, ensure_ascii=False)
                return f'<pre style="margin: 0; white-space: pre-wrap;">{escape(json_str)}</pre>'
            elif isinstance(value, list):
                json_str = json.dumps(value, indent=2, ensure_ascii=False)
                return f'<pre style="margin: 0; white-space: pre-wrap;">{escape(json_str)}</pre>'
            elif value is None:
                return '<em style="color: #999;">null</em>'
            elif isinstance(value, str) and len(value) > 100:
                # Truncate very long strings (like recaptcha tokens)
                return f'{escape(value[:100])}... (truncated)'
            else:
                return escape(str(value))
        
        # Sort keys for better readability
        sorted_keys = sorted(obj.metadata.keys())
        for key in sorted_keys:
            value = obj.metadata[key]
            formatted_value = format_value(value)
            html += f'<tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">{escape(key)}</td><td style="padding: 8px; border: 1px solid #ddd; word-break: break-word;">{formatted_value}</td></tr>'
        
        html += '</tbody></table>'
        return mark_safe(html)
    metadata_table.short_description = "Metadata"
    
    def card_info_display(self, obj):
        """Display card information in a table format"""
        if not obj.card_brand and not obj.last_four_digits:
            return "No card information available"
        
        from django.utils.html import escape
        
        html = '<table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 12px;">'
        html += '<thead><tr style="background-color: #417690; color: white;"><th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Field</th><th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Value</th></tr></thead>'
        html += '<tbody>'
        
        card_data = {
            'Card Brand': obj.card_brand or 'N/A',
            'Card Type': obj.card_type or 'N/A',
            'Last 4 Digits': obj.last_four_digits or 'N/A',
            'Expiry Month': obj.card_expiry_month or 'N/A',
            'Expiry Year': obj.card_expiry_year or 'N/A',
        }
        
        for key, value in card_data.items():
            html += f'<tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px; font-weight: bold; background-color: #f5f5f5; border: 1px solid #ddd;">{escape(key)}</td><td style="padding: 8px; border: 1px solid #ddd;">{escape(str(value))}</td></tr>'
        
        html += '</tbody></table>'
        return mark_safe(html)
    card_info_display.short_description = "Card Information"
    
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
    list_display = ['pre_black_friday_start_date', 'end_date', 'show_pay_button', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'show_pay_button', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    actions = ['export_settings_csv']
    
    fieldsets = (
        ('Settings', {
            'fields': ('is_active', 'pre_black_friday_start_date', 'end_date', 'show_pay_button')
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
            'Show Pay Button',
            'Created At',
            'Updated At',
        ]
        writer.writerow(headers)
        
        for setting in queryset:
            writer.writerow([
                'Yes' if setting.is_active else 'No',
                timezone.localtime(setting.pre_black_friday_start_date).strftime('%Y-%m-%d %H:%M:%S') if setting.pre_black_friday_start_date else '',
                timezone.localtime(setting.end_date).strftime('%Y-%m-%d %H:%M:%S') if setting.end_date else '',
                'Yes' if setting.show_pay_button else 'No',
                timezone.localtime(setting.created_at).strftime('%Y-%m-%d %H:%M:%S') if setting.created_at else '',
                timezone.localtime(setting.updated_at).strftime('%Y-%m-%d %H:%M:%S') if setting.updated_at else '',
            ])
        
        return response
    
    export_settings_csv.short_description = "Export to CSV"


@admin.register(BlackFridayContact)
class BlackFridayContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'whatsapp', 'city', 'contact_type', 'form_type', 'is_contacted', 'created_at']
    list_filter = ['is_contacted', 'contact_type', 'form_type', 'created_at']
    search_fields = ['name', 'email', 'phone', 'whatsapp', 'city', 'message']
    readonly_fields = ['created_at']
    list_editable = ['is_contacted']
    date_hierarchy = 'created_at'
    actions = ['export_contacts_csv', 'send_to_accounting_modules']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone', 'whatsapp', 'city')
        }),
        ('Form Details', {
            'fields': ('contact_type', 'form_type', 'message', 'metadata')
        }),
        ('Status', {
            'fields': ('is_contacted',)
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
            'Contact Type',
            'Message',
            'Form Type',
            'Is Contacted',
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
                contact.get_contact_type_display(),
                contact.message.replace('\n', ' ').strip() if contact.message else '',
                contact.get_form_type_display(),
                'Yes' if contact.is_contacted else 'No',
                timezone.localtime(contact.created_at).strftime('%Y-%m-%d %H:%M:%S') if contact.created_at else '',
            ])
        
        return response
    
    export_contacts_csv.short_description = "Export to CSV"
    
    def send_to_accounting_modules(self, request, queryset):
        """Send selected contacts to accounting_modules as customers"""
        # API endpoint URL - adjust port if needed
        api_url = 'https://site.fxglobal.cloud/sales/api/create-customer/'
        
        success_count = 0
        error_count = 0
        skipped_count = 0
        errors = []
        
        for contact in queryset:
            try:
                # Prepare data
                data = {
                    'name': contact.name,
                    'phone': contact.phone or contact.whatsapp,
                    'whatsapp': contact.whatsapp,
                    'city': contact.city,
                    'address': None,  # BlackFridayContact doesn't have address field
                    'goal': contact.get_form_type_display() if contact.form_type else None,
                    'message': contact.message,
                    'source_key': 'black'
                }
                
                # Send POST request
                response = requests.post(
                    api_url,
                    json=data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 201:
                    success_count += 1
                    # Mark as contacted
                    contact.is_contacted = True
                    contact.save()
                elif response.status_code == 409:
                    # Customer already exists
                    skipped_count += 1
                    errors.append(f"{contact.name}: Customer already exists")
                else:
                    error_count += 1
                    error_msg = response.json().get('error', 'Unknown error') if response.content else 'Unknown error'
                    errors.append(f"{contact.name}: {error_msg}")
                    
            except requests.exceptions.RequestException as e:
                error_count += 1
                errors.append(f"{contact.name}: Connection error - {str(e)}")
            except Exception as e:
                error_count += 1
                errors.append(f"{contact.name}: {str(e)}")
        
        # Prepare message
        message_parts = [
            f"Successfully sent: {success_count}",
            f"Already exists: {skipped_count}",
            f"Errors: {error_count}"
        ]
        
        if errors:
            message_parts.append("\nErrors:")
            message_parts.extend(errors[:10])  # Show first 10 errors
            if len(errors) > 10:
                message_parts.append(f"... and {len(errors) - 10} more errors")
        
        self.message_user(
            request,
            "\n".join(message_parts),
            level='success' if error_count == 0 else 'warning' if success_count > 0 else 'error'
        )
    
    send_to_accounting_modules.short_description = "إرسال إلى accounting_modules (Sales/Customer)"


@admin.register(RamadanContact)
class RamadanContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'phase', 'is_contacted', 'created_at']
    list_filter = ['is_contacted', 'phase', 'created_at']
    search_fields = ['name', 'email', 'phone']
    readonly_fields = ['id', 'created_at']
    list_editable = ['is_contacted']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone', 'phase')
        }),
        ('Status', {
            'fields': ('is_contacted', 'notes')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ['id']
        return self.readonly_fields

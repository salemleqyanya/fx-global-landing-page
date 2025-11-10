from django.contrib import admin
from django.http import HttpResponse
from django.utils import timezone
import csv

from .models import CustomerContact


@admin.register(CustomerContact)
class CustomerContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'whatsapp', 'goal', 'city', 'address', 'created_at', 'is_contacted']
    list_filter = ['is_contacted', 'goal', 'created_at']
    search_fields = ['name', 'phone', 'whatsapp', 'city', 'address', 'message']
    readonly_fields = ['created_at']
    list_editable = ['is_contacted']
    date_hierarchy = 'created_at'
    actions = ['export_contacts_csv']
    
    fieldsets = (
        ('معلومات العميل', {
            'fields': ('name', 'phone', 'whatsapp', 'city', 'address')
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

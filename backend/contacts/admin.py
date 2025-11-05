from django.contrib import admin
from .models import CustomerContact


@admin.register(CustomerContact)
class CustomerContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'whatsapp', 'goal', 'city', 'address', 'created_at', 'is_contacted']
    list_filter = ['is_contacted', 'goal', 'created_at']
    search_fields = ['name', 'whatsapp', 'city', 'address', 'message']
    readonly_fields = ['created_at']
    list_editable = ['is_contacted']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('معلومات العميل', {
            'fields': ('name', 'whatsapp', 'city', 'address')
        }),
        ('التفاصيل', {
            'fields': ('goal', 'message', 'notes')
        }),
        ('الحالة', {
            'fields': ('is_contacted', 'created_at')
        }),
    )

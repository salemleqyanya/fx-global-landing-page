from django.contrib import admin
from .models import CustomerContact


@admin.register(CustomerContact)
class CustomerContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'whatsapp', 'goal', 'city', 'created_at', 'is_contacted']
    list_filter = ['is_contacted', 'goal', 'created_at']
    search_fields = ['name', 'whatsapp', 'city']
    readonly_fields = ['created_at']
    list_editable = ['is_contacted']
    date_hierarchy = 'created_at'

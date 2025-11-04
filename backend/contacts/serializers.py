from rest_framework import serializers
from .models import CustomerContact


class CustomerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerContact
        fields = ['id', 'name', 'whatsapp', 'goal', 'city', 'created_at', 'is_contacted']
        read_only_fields = ['id', 'created_at', 'is_contacted']


class CustomerContactCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating customer contacts (public API)"""
    class Meta:
        model = CustomerContact
        fields = ['name', 'whatsapp', 'goal', 'city']
    
    def validate_whatsapp(self, value):
        """Validate WhatsApp number"""
        if not value:
            raise serializers.ValidationError("رقم الواتساب مطلوب")
        # Remove any non-digit characters
        cleaned = ''.join(filter(str.isdigit, value))
        if len(cleaned) < 8:
            raise serializers.ValidationError("رقم الواتساب غير صحيح")
        return cleaned


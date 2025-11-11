from rest_framework import serializers
from .models import CustomerContact, LandingPage


class CustomerContactSerializer(serializers.ModelSerializer):
    landing_page_code = serializers.CharField(source='landing_page.short_code', read_only=True)
    landing_page_name = serializers.CharField(source='landing_page.name', read_only=True)

    class Meta:
        model = CustomerContact
        fields = [
            'id',
            'name',
            'phone',
            'whatsapp',
            'message',
            'address',
            'goal',
            'city',
            'landing_page_code',
            'landing_page_name',
            'created_at',
            'is_contacted',
        ]
        read_only_fields = ['id', 'created_at', 'is_contacted', 'landing_page_code', 'landing_page_name']


class CustomerContactCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating customer contacts (public API)"""
    landing_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomerContact
        fields = ['name', 'phone', 'whatsapp', 'message', 'address', 'goal', 'city', 'landing_code']
    
    def validate_phone(self, value):
        """Validate phone number"""
        if not value:
            raise serializers.ValidationError("رقم الجوال مطلوب")
        # Remove any non-digit characters
        cleaned = ''.join(filter(str.isdigit, value))
        if len(cleaned) < 8:
            raise serializers.ValidationError("رقم الجوال غير صحيح")
        return cleaned
    
    def validate_whatsapp(self, value):
        """Validate WhatsApp number"""
        if not value:
            raise serializers.ValidationError("رقم الواتساب مطلوب")
        # Remove any non-digit characters
        cleaned = ''.join(filter(str.isdigit, value))
        if len(cleaned) < 8:
            raise serializers.ValidationError("رقم الواتساب غير صحيح")
        return cleaned
    
    def validate_message(self, value):
        """Validate message is provided"""
        if not value or not value.strip():
            raise serializers.ValidationError("الرسالة مطلوبة")
        return value.strip()

    def create(self, validated_data):
        landing_code = validated_data.pop('landing_code', '').strip().upper()
        landing_page = None
        if landing_code:
            landing_page = LandingPage.objects.filter(short_code=landing_code).first()

        contact = CustomerContact.objects.create(landing_page=landing_page, **validated_data)
        return contact


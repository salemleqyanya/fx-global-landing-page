from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import CustomerContact
from .serializers import CustomerContactSerializer, CustomerContactCreateSerializer
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])  # Disable SessionAuthentication to avoid CSRF enforcement by DRF
@permission_classes([AllowAny])
def register_customer(request):
    """Public endpoint for customer registration"""
    serializer = CustomerContactCreateSerializer(data=request.data)
    if serializer.is_valid():
        contact = serializer.save()
        return Response({
            'success': True,
            'message': 'تم التسجيل بنجاح!',
            'id': contact.id
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_contacts(request):
    """Admin endpoint to list all contacts"""
    contacts = CustomerContact.objects.all()
    serializer = CustomerContactSerializer(contacts, many=True)
    return Response(serializer.data)


class CustomerContactViewSet(ModelViewSet):
    """ViewSet for managing customer contacts (admin only)"""
    queryset = CustomerContact.objects.all()
    serializer_class = CustomerContactSerializer
    permission_classes = [IsAdminUser]

from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import register_customer, list_contacts, CustomerContactViewSet

router = DefaultRouter()
router.register(r'admin', CustomerContactViewSet, basename='contact')

urlpatterns = [
    path('register/', register_customer, name='register-customer'),
    path('list/', list_contacts, name='list-contacts'),
]

urlpatterns += router.urls


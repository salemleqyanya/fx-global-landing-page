from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import register_customer, list_contacts, CustomerContactViewSet, register_black_friday_contact, register_ramadan_contact

router = DefaultRouter()
router.register(r'admin', CustomerContactViewSet, basename='contact')

urlpatterns = [
    path('register/', register_customer, name='register-customer'),
    path('list/', list_contacts, name='list-contacts'),
    path('black-friday/register/', register_black_friday_contact, name='register-black-friday-contact'),
    path('ramadan/register/', register_ramadan_contact, name='register-ramadan-contact'),
]

urlpatterns += router.urls


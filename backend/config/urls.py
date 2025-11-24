"""
URL configuration for config project.
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from .views import landing_page, elite_program, black_friday, lahza_checkout, initialize_lahza_payment, verify_lahza_payment, test_email, privacy_policy, terms_of_service, return_exchange_policy, get_black_friday_end_date, get_pre_black_friday_date
from django.urls import path, include, re_path
from django.views.static import serve

urlpatterns = [
    path('master-co/', admin.site.urls),
    path('api/contacts/', include('contacts.urls')),
    path('api/videos/', include('videos.urls')),
    path('exam/', include('exams.urls', namespace='exams')),
    path('vip-signals/', landing_page, {'force_template': 'neon'}, name='vip-signals'),
    path('elite/', elite_program, name='elite_program'),
    path('nokhbeh/', elite_program, name='nokhbeh_elite'),
    path('black-friday/', black_friday, name='black_friday'),
    path('api/black-friday/end-date/', get_black_friday_end_date, name='get_black_friday_end_date'),
    path('api/black-friday/pre-bf-date/', get_pre_black_friday_date, name='get_pre_black_friday_date'),
    path('black-friday/payment/initialize/', initialize_lahza_payment, name='initialize_lahza_payment'),
    path('black-friday/payment/callback/', verify_lahza_payment, name='verify_lahza_payment'),
    path('black-friday/payment/verify/', verify_lahza_payment, name='verify_lahza_payment_manual'),
    path('checkout/', lahza_checkout, name='lahza_checkout'),
    path('checkout/payment/initialize/', initialize_lahza_payment, name='initialize_checkout_payment'),
    path('checkout/payment/verify/', verify_lahza_payment, name='verify_checkout_payment'),
    path('test-email/', test_email, name='test_email'),
    path('privacy-policy/', privacy_policy, name='privacy_policy'),
    path('terms-of-service/', terms_of_service, name='terms_of_service'),
    path('return-exchange-policy/', return_exchange_policy, name='return_exchange_policy'),
    re_path(r'^(?P<short_code>[A-Za-z0-9]{8})/$', landing_page, name='landing_page_short'),
    path('', landing_page, name='landing_page'),
    re_path(r'^images/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

# Serve media files - always enabled regardless of DEBUG setting
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
        'show_indexes': False,
    }),
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve static files in development (WhiteNoise handles static files automatically in production)

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

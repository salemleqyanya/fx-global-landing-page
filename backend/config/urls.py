"""
URL configuration for config project.
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from .views import landing_page, landing_page_no_contact, elite_program, black_friday, lahza_checkout, initialize_lahza_payment, verify_lahza_payment, lahza_webhook, test_email, privacy_policy, terms_of_service, return_exchange_policy, get_black_friday_end_date, get_pre_black_friday_date, download_instructions_pdf, packages_page, payment_success, pricing_page, pricing_contact
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
    path('packages/', packages_page, name='packages_page'),
    path('packages/payment/initialize/', initialize_lahza_payment, name='initialize_packages_payment'),
    path('packages/payment/verify/', verify_lahza_payment, name='verify_packages_payment'),
    path('packages/payment/success/', payment_success, name='payment_success'),
    path('packages/payment/success/<str:reference>/', payment_success, name='payment_success_with_ref'),
    path('pricing/', pricing_page, name='pricing_page'),
    path('pricing/contact/', pricing_contact, name='pricing_contact'),
    path('pricing/payment/initialize/', initialize_lahza_payment, name='initialize_pricing_payment'),
    path('pricing/payment/verify/', verify_lahza_payment, name='verify_pricing_payment'),
    path('pricing/payment/success/', payment_success, name='pricing_payment_success'),
    path('pricing/payment/success/<str:reference>/', payment_success, name='pricing_payment_success_with_ref'),
    path('sales/', landing_page_no_contact, name='landing_page_no_contact'),
    path('api/black-friday/end-date/', get_black_friday_end_date, name='get_black_friday_end_date'),
    path('api/black-friday/pre-bf-date/', get_pre_black_friday_date, name='get_pre_black_friday_date'),
    path('black-friday/payment/initialize/', initialize_lahza_payment, name='initialize_lahza_payment'),
    path('black-friday/payment/callback/', verify_lahza_payment, name='verify_lahza_payment'),
    path('black-friday/payment/verify/', verify_lahza_payment, name='verify_lahza_payment_manual'),
    path('checkout/', lahza_checkout, name='lahza_checkout'),
    path('checkout/payment/initialize/', initialize_lahza_payment, name='initialize_checkout_payment'),
    path('checkout/payment/verify/', verify_lahza_payment, name='verify_checkout_payment'),
    path('api/lahza/webhook/', lahza_webhook, name='lahza_webhook'),
    path('test-email/', test_email, name='test_email'),
    path('instructions/<str:reference>/download/', download_instructions_pdf, name='download_instructions_pdf'),
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

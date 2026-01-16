"""
URL configuration for config project.
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from .views import landing_page, landing_page_no_contact, elite_program, black_friday, lahza_checkout, initialize_lahza_payment, verify_lahza_payment, lahza_webhook, test_email, privacy_policy, terms_of_service, return_exchange_policy, get_black_friday_end_date, get_pre_black_friday_date, download_instructions_pdf, packages_page, payment_success, pricing_page, pricing_contact, payment_page, submit_vip_learning_request
from django.urls import path, include, re_path
from django.views.static import serve
import logging

logger = logging.getLogger(__name__)

urlpatterns = [
    path('master-co/', admin.site.urls),
    path('api/contacts/', include('contacts.urls')),
    path('api/videos/', include('videos.urls')),
    path('exam/', include('exams.urls', namespace='exams')),
    path('vip-signals/', landing_page, {'force_template': 'neon'}, name='vip-signals'),
    path('elite/', elite_program, name='elite_program'),
    path('nokhbeh/', elite_program, name='nokhbeh_elite'),
    # path('black-friday/', pricing_page, name='black_friday'),
    path('packages/', packages_page, name='packages_page'),
    path('payment/', payment_page, name='payment_page'),
    path('payment/vip-learning/submit/', submit_vip_learning_request, name='submit_vip_learning_request'),
    path('payment/payment/initialize/', initialize_lahza_payment, name='initialize_payment_payment'),
    path('payment/payment/verify/', verify_lahza_payment, name='verify_payment_payment'),
    path('payment/payment/success/', payment_success, name='payment_payment_success'),
    path('payment/payment/success/<str:reference>/', payment_success, name='payment_payment_success_with_ref'),
    path('packages/payment/initialize/', initialize_lahza_payment, name='initialize_packages_payment'),
    path('packages/payment/verify/', verify_lahza_payment, name='verify_packages_payment'),
    path('packages/payment/success/', payment_success, name='payment_success'),
    path('packages/payment/success/<str:reference>/', payment_success, name='payment_success_with_ref'),
    # path('pricing/', pricing_page, name='pricing_page'),
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
    re_path(r'^images/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^(?P<short_code>[A-Za-z0-9]{8})/$', landing_page, name='landing_page_short'),
    path('', landing_page, name='landing_page'),
]

# Serve media files - always enabled regardless of DEBUG setting
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
        'show_indexes': False,
    }),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Static files are handled by WhiteNoise middleware in production (DEBUG=False)
# For development (DEBUG=True), Django's static file serving is used
if settings.DEBUG:
    # In development, serve static files from STATICFILES_DIRS (static/)
    # This allows live editing without running collectstatic
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Also serve from STATICFILES_DIRS for development
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns
    urlpatterns += staticfiles_urlpatterns()

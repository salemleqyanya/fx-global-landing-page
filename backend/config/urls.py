"""
URL configuration for config project.
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from .views import landing_page, elite_program
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

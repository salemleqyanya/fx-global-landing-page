"""
URL configuration for config project.
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from .views import landing_page
from django.urls import path, include ,re_path
from django.conf import settings
from django.views.static import serve
urlpatterns = [
    path('master-co/', admin.site.urls),
    path('api/contacts/', include('contacts.urls')),
    path('api/videos/', include('videos.urls')),
    path('', landing_page, name='landing_page'),
    re_path(r'^images/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]

# Serve media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

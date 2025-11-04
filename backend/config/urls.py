"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import landing_page

urlpatterns = [
    path('master-co/', admin.site.urls),
    path('api/contacts/', include('contacts.urls')),
    path('api/videos/', include('videos.urls')),
    path('', landing_page, name='landing_page'),
]

# Serve media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

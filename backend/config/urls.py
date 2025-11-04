"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.views.generic import TemplateView
from django.contrib.staticfiles.views import serve as static_serve
from django.views.decorators.cache import never_cache
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/contacts/', include('contacts.urls')),
    path('api/videos/', include('videos.urls')),
]

# Serve media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve React app - catch all other routes and serve index.html
# This allows React Router to handle routing
urlpatterns += [
    re_path(r'^(?!api|admin|static|media|assets).*$', TemplateView.as_view(template_name='index.html')),
]

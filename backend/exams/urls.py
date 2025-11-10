from django.urls import path

from . import views

app_name = 'exams'

urlpatterns = [
    path('qr/', views.exam_qr_view, name='qr'),
    path('entry/', views.exam_entry_view, name='entry'),
    path('start/', views.exam_start_view, name='start'),
    path('', views.exam_entry_view, name='entry'),
]


# accounts/urls.py
from django.urls import path
from .views import login_with_mobile

urlpatterns = [
    path('login/', login_with_mobile, name='login_with_mobile'),
]

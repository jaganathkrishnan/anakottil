# temple_site/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth endpoints: /api/auth/login/
    path("api/auth/", include("accounts.urls")),

    # Temple app: /api/content/... and /api/bookings/...
    path("api/", include("temple.urls")),
]

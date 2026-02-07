# temple_site/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth endpoints: /api/auth/login/
    path("api/auth/", include("accounts.urls")),

    # Temple app: /api/content/... and /api/bookings/...
    path("api/", include("temple.urls")),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

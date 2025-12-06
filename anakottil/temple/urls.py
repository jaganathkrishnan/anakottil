# temple/urls.py
from django.urls import path
from .views import (
    get_temple_content,
    bookings_list_create,
    booking_update_status,
)

urlpatterns = [
    # /api/content/about/  or /api/content/mission/
    path("content/<str:key>/", get_temple_content, name="get_temple_content"),

    # /api/bookings/
    path("bookings/", bookings_list_create, name="bookings_list_create"),

    # /api/bookings/1/
    path("bookings/<int:pk>/", booking_update_status, name="booking_update_status"),
]

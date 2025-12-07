from django.urls import path
from .views import (
    get_temple_content,
    bookings_list_create,
    booking_update_status,
    donations_list_create,
    donation_verify,
    gallery_list_create,
    gallery_delete,
)


urlpatterns = [
    path("content/<str:key>/", get_temple_content, name="get_temple_content"),

    path("bookings/", bookings_list_create, name="bookings_list_create"),
    path("bookings/<int:pk>/", booking_update_status, name="booking_update_status"),

    path("donations/", donations_list_create, name="donations_list_create"),
    path("donations/<int:pk>/", donation_verify, name="donation_verify"),
    path("gallery/", gallery_list_create, name="gallery_list_create"),
    path("gallery/<int:pk>/", gallery_delete, name="gallery_delete"),

]

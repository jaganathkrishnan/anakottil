# temple/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import TempleContent, Booking
from .serializers import BookingSerializer


DEFAULT_CONTENT = {
    "about": {
        "title": "About Anakottil Temple",
        "body": "Anakottil Temple is a sacred place of worship. (Edit this in Django admin.)",
    },
    "mission": {
        "title": "Our Mission & Purpose",
        "body": "Our mission is to serve the devotees and preserve traditions. (Edit this in Django admin.)",
    },
}


@api_view(["GET"])
@permission_classes([AllowAny])
def get_temple_content(request, key):
    if key not in ["about", "mission"]:
        return Response(
            {"detail": "Invalid content key."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    obj, created = TempleContent.objects.get_or_create(
        key=key,
        defaults=DEFAULT_CONTENT.get(key, {"title": key, "body": ""}),
    )

    data = {
        "key": obj.key,
        "title": obj.title,
        "body": obj.body,
        "updated_at": obj.updated_at,
    }

    return Response(data, status=status.HTTP_200_OK)


# ---------------------------
# BOOKINGS
# ---------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def bookings_list_create(request):
    """
    GET: list bookings for current month (optionally ?month=YYYY-MM)
         - normal user: only their bookings
         - admin: all bookings
    POST: create a new booking for the logged-in user
    """
    user = request.user

    if request.method == "GET":
        month_str = request.query_params.get("month")  # e.g. "2025-12"
        queryset = Booking.objects.all()

        # User vs admin
        if not user.is_staff:
            queryset = queryset.filter(user=user)

        # Filter by month if provided
        if month_str:
            try:
                year, month = map(int, month_str.split("-"))
                queryset = queryset.filter(date__year=year, date__month=month)
            except ValueError:
                return Response(
                    {"detail": "Invalid month format. Use YYYY-MM."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = BookingSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST - create booking
    if request.method == "POST":
        data = request.data.copy()
        # Fill mobile from username by default
        data["mobile"] = user.username

        serializer = BookingSerializer(data=data)
        if serializer.is_valid():
            booking = serializer.save(user=user, status="pending")
            return Response(
                BookingSerializer(booking).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def booking_update_status(request, pk):
    """
    Admin: update booking status (confirmed/cancelled)
    """
    user = request.user
    if not user.is_staff:
        return Response(
            {"detail": "Not allowed."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return Response(
            {"detail": "Booking not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    new_status = request.data.get("status")
    if new_status not in ["pending", "confirmed", "cancelled"]:
        return Response(
            {"detail": "Invalid status."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    booking.status = new_status
    booking.save()
    return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

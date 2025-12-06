from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import TempleContent, Booking
from .serializers import BookingSerializer

# ---------------------------
# DEFAULT CONTENT FOR ABOUT / MISSION
# ---------------------------

DEFAULT_CONTENT = {
    "about": {
        "title": "About Anakottil Temple",
        "body": (
            "Anakottil Temple is a sacred place of worship and devotion.\n\n"
            "This is default content. You can edit it from Django admin."
        ),
    },
    "mission": {
        "title": "Our Mission & Purpose",
        "body": (
            "Our mission is to serve devotees, preserve traditions, "
            "and support the spiritual growth of the community.\n\n"
            "This is default content. You can edit it from Django admin."
        ),
    },
}


# ---------------------------
# TEMPLE STATIC CONTENT (ABOUT / MISSION)
# ---------------------------

@api_view(["GET"])
@permission_classes([AllowAny])
def get_temple_content(request, key):
    """
    Return About / Mission content.
    GET /api/content/about/
    GET /api/content/mission/
    """
    if key not in ["about", "mission"]:
        return Response(
            {"detail": "Invalid content key."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    obj, _ = TempleContent.objects.get_or_create(
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
# BOOKINGS - LIST + CREATE
# ---------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def bookings_list_create(request):
    """
    GET:
      - Normal user: returns ONLY their bookings
      - Admin (is_staff): returns all bookings
      - Optional ?month=YYYY-MM to filter by month
         e.g. /api/bookings/?month=2025-12

    POST:
      - Create a new booking for the logged in user
      - mobile is filled from user.username
      - status is set to "pending"
    """
    user = request.user

    if request.method == "GET":
        month_str = request.query_params.get("month")  # optional

        # Admin sees all, user sees only own
        if user.is_staff:
            qs = Booking.objects.all()
        else:
            qs = Booking.objects.filter(user=user)

        # Optional month filter
        if month_str:
            try:
                year, month = map(int, month_str.split("-"))
                qs = qs.filter(date__year=year, date__month=month)
            except ValueError:
                return Response(
                    {"detail": "Invalid month format. Use YYYY-MM."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        qs = qs.order_by("date", "time_slot")
        serializer = BookingSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST - create booking
    if request.method == "POST":
        data = request.data.copy()

        # Fill mobile from username by default
        # (Assuming accounts app uses username = mobile number)
        data["mobile"] = user.username

        serializer = BookingSerializer(data=data)
        if serializer.is_valid():
            booking = serializer.save(user=user, status="pending")
            return Response(
                BookingSerializer(booking).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------
# BOOKINGS - ADMIN STATUS UPDATE + USER CANCEL
# ---------------------------

@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def booking_update_status(request, pk):
    """
    PATCH:
      - Admin only
      - Update status: pending / confirmed / cancelled

    DELETE:
      - Normal user:
          can delete ONLY their own booking
          and ONLY if status == "pending"
      - Admin:
          can delete any booking (optional, allowed here)
    """
    user = request.user

    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return Response(
            {"detail": "Booking not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # ---------- ADMIN PATCH ----------
    if request.method == "PATCH":
        if not user.is_staff:
            return Response(
                {"detail": "Not allowed."},
                status=status.HTTP_403_FORBIDDEN,
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

    # ---------- DELETE (user/admin) ----------
    if request.method == "DELETE":
        # Admin can delete any booking
        if user.is_staff:
            booking.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        # Normal user can delete only own pending booking
        if booking.user != user:
            return Response(
                {"detail": "You can only cancel your own bookings."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if booking.status != "pending":
            return Response(
                {"detail": "Only pending bookings can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

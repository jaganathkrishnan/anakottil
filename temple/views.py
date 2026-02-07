from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import TempleContent, Booking, Donation
from .models import TempleContent, Booking, Donation, GalleryImage
from .serializers import (
    BookingSerializer,
    DonationSerializer,
    
    GalleryImageSerializer,
)

# ---------------------------
# DEFAULT CONTENT FOR ABOUT / MISSION
# ---------------------------

DEFAULT_CONTENT = {
    "about": {
        "title": "About Anakottil Temple",
        "body": (
            "Anakottil Temple is a sacred place of worship and devotion.\n\n"
            "This is default content. You can edit it from Django admin or the Admin Content page."
        ),
    },
    "mission": {
        "title": "Our Mission & Purpose",
        "body": (
            "Our mission is to serve devotees, preserve traditions, "
            "and support the spiritual growth of the community.\n\n"
            "This is default content. You can edit it from Django admin or the Admin Content page."
        ),
    },
}


# ---------------------------
# TEMPLE STATIC CONTENT (ABOUT / MISSION)
# ---------------------------

@api_view(["GET", "PATCH"])
@permission_classes([AllowAny])
def get_temple_content(request, key):
    """
    GET /api/content/about/
    GET /api/content/mission/

    PATCH (admin only):
      body: { "title": "...", "body": "..." }
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

    # ---- READ (public) ----
    if request.method == "GET":
        data = {
            "key": obj.key,
            "title": obj.title,
            "body": obj.body,
            "updated_at": obj.updated_at,
        }
        return Response(data, status=status.HTTP_200_OK)

    # ---- UPDATE (admin only) ----
    # request.method == "PATCH"
    user = request.user
    if not user.is_authenticated or not user.is_staff:
        return Response(
            {"detail": "Not allowed."},
            status=status.HTTP_403_FORBIDDEN,
        )

    title = request.data.get("title", obj.title)
    body = request.data.get("body", obj.body)

    obj.title = title
    obj.body = body
    obj.save()

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

    POST:
      - Create new booking for logged in user
      - mobile auto-filled from username
      - status = "pending"
    """
    user = request.user

    if request.method == "GET":
        month_str = request.query_params.get("month")

        # admin sees all, user sees only own
        if user.is_staff:
            qs = Booking.objects.all()
        else:
            qs = Booking.objects.filter(user=user)

        # optional month filter
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
    data = request.data.copy()
    data["mobile"] = request.user.username

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
      - Admin only: update status to pending/confirmed/cancelled

    DELETE:
      - Admin: can delete any booking
      - Normal user: can delete only their own *pending* bookings
    """
    user = request.user

    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return Response(
            {"detail": "Booking not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # PATCH: admin updates status
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

    # DELETE: user/admin
    if request.method == "DELETE":
        # admin can delete any
        if user.is_staff:
            booking.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        # normal user: only own + pending
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


# ---------------------------
# DONATIONS - LIST + CREATE
# ---------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def donations_list_create(request):
    """
    GET:
      - Admin: all donations
      - User: only their donations

    POST:
      - User submits donation info (after UPI/bank payment).
      - Admin later verifies manually.
    """
    user = request.user

    if request.method == "GET":
        if user.is_staff:
            qs = Donation.objects.all()
        else:
            qs = Donation.objects.filter(user=user)
        serializer = DonationSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST
    data = request.data.copy()
    if not data.get("mobile"):
        data["mobile"] = user.username

    serializer = DonationSerializer(data=data)
    if serializer.is_valid():
        donation = serializer.save(user=user)
        return Response(
            DonationSerializer(donation).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------
# DONATION VERIFY (ADMIN)
# ---------------------------

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def donation_verify(request, pk):
    """
    Admin toggles verification.
    body: { "is_verified": true/false }
    """
    user = request.user
    if not user.is_staff:
        return Response(
            {"detail": "Not allowed."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        donation = Donation.objects.get(pk=pk)
    except Donation.DoesNotExist:
        return Response(
            {"detail": "Donation not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    is_verified = request.data.get("is_verified")
    if not isinstance(is_verified, bool):
        return Response(
            {"detail": "is_verified must be true or false."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    donation.is_verified = is_verified
    donation.save()
    return Response(DonationSerializer(donation).data, status=status.HTTP_200_OK)
# ---------------------------
# GALLERY IMAGES
# ---------------------------

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def gallery_list_create(request):
    """
    GET /api/gallery/
      -> list all gallery images (public)

    POST /api/gallery/ (admin only, multipart/form-data)
      fields:
        - image (file, required)
        - caption (optional)
    """
    if request.method == "GET":
        qs = GalleryImage.objects.all().order_by("-created_at")
        serializer = GalleryImageSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST: admin only
    user = request.user
    if not user.is_authenticated or not user.is_staff:
        return Response(
            {"detail": "Not allowed."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if "image" not in request.FILES:
        return Response(
            {"detail": "No image file uploaded. Use 'image' field."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    caption = request.data.get("caption", "")
    img_obj = GalleryImage.objects.create(
        image=request.FILES["image"],
        caption=caption,
    )

    serializer = GalleryImageSerializer(img_obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def gallery_delete(request, pk):
    """
    DELETE /api/gallery/<id>/  (admin only)
    """
    user = request.user
    if not user.is_staff:
        return Response(
            {"detail": "Not allowed."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        img_obj = GalleryImage.objects.get(pk=pk)
    except GalleryImage.DoesNotExist:
        return Response(
            {"detail": "Image not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    img_obj.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
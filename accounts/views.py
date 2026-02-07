# accounts/views.py
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

PRESET_PASSWORD = "Pattanakad123"
ADMIN_MOBILE = "0000000000"
ADMIN_PASSWORD = "admin"


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_with_mobile(request):
    """
    Login / signup using mobile number.

    Rules:
    - Admin:
        mobile == ADMIN_MOBILE and password == ADMIN_PASSWORD
    - Normal user:
        mobile != ADMIN_MOBILE and password == PRESET_PASSWORD
    """

    mobile = request.data.get('mobile')
    password = request.data.get('password')

    if not mobile or not password:
        return Response(
            {"detail": "Mobile and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------
    # SPECIAL ADMIN LOGIN (ONLY)
    # ---------------------------
    if mobile == ADMIN_MOBILE:
        # For this mobile, ONLY accept admin password
        if password != ADMIN_PASSWORD:
            return Response(
                {"detail": "Invalid password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        admin_user, created = User.objects.get_or_create(
            username=ADMIN_MOBILE,
            defaults={
                "email": "admin@anakottil.local",
            },
        )

        # Ensure admin flags are set every time
        if not admin_user.is_staff or not admin_user.is_superuser:
            admin_user.is_staff = True
            admin_user.is_superuser = True

        # Ensure password is the admin password
        if not admin_user.check_password(ADMIN_PASSWORD):
            admin_user.set_password(ADMIN_PASSWORD)

        admin_user.save()

        token, _ = Token.objects.get_or_create(user=admin_user)

        return Response(
            {
                "token": token.key,
                "user": {
                    "id": admin_user.id,
                    "mobile": admin_user.username,
                    "role": "admin",
                },
            },
            status=status.HTTP_200_OK,
        )

    # ---------------------------
    # NORMAL USER LOGIN
    # ---------------------------
    # For ALL other mobiles, only PRESET_PASSWORD is valid
    if password != PRESET_PASSWORD:
        return Response(
            {"detail": "Invalid password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user, created = User.objects.get_or_create(
        username=mobile,
        defaults={"email": ""},
    )

    if not user.check_password(PRESET_PASSWORD):
        user.set_password(PRESET_PASSWORD)
        user.save()

    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            "user": {
                "id": user.id,
                "mobile": user.username,
                "role": "user",
            },
        },
        status=status.HTTP_200_OK,
    )

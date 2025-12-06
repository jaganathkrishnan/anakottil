from rest_framework import serializers
from .models import Booking, Donation, TempleContent


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "name",
            "mobile",
            "pooja_type",
            "date",
            "time_slot",
            "notes",
            "status",
            "created_at",
        ]
        read_only_fields = ["user", "status", "created_at"]


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = [
            "id",
            "name",
            "mobile",
            "amount",
            "payment_reference",
            "message",
            "is_verified",
            "created_at",
        ]
        read_only_fields = ["is_verified", "created_at"]

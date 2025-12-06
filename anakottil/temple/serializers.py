# temple/serializers.py
from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id",
            "name",
            "mobile",
            "pooja_type",
            "date",
            "time_slot",
            "notes",
            "status",
            "created_at",
        ]
        read_only_fields = ["status", "created_at"]

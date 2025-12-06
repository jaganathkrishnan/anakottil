from django.db import models
from django.contrib.auth.models import User


class TempleContent(models.Model):
    """
    Stores simple CMS content like About, Mission, etc.
    key: "about", "mission"
    """
    key = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key


class Booking(models.Model):
    """
    Pooja booking by a user for a date.
    """
    POOJA_TYPES = [
        ("archana", "Archana"),
        ("abhishekam", "Abhishekam"),
        ("special", "Special Pooja"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="bookings"
    )
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15)
    pooja_type = models.CharField(max_length=20, choices=POOJA_TYPES)
    date = models.DateField()
    time_slot = models.CharField(max_length=50, blank=True)
    notes = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "time_slot", "created_at"]

    def __str__(self):
        return f"{self.name} - {self.date} ({self.status})"


class Donation(models.Model):
    """
    Devotee donation entries, submitted after they donate via UPI/Bank.
    Admin manually verifies.
    """
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="donations"
    )
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_reference = models.CharField(
        max_length=100,
        help_text="UPI reference / transaction id / last 4 digits, etc."
    )
    message = models.CharField(max_length=255, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.amount} ({'verified' if self.is_verified else 'pending'})"

# temple/models.py
from django.db import models
from django.contrib.auth.models import User


class TempleContent(models.Model):
    key = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    body = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key


class Booking(models.Model):
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

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)          # devotee name
    mobile = models.CharField(max_length=15)         # copy from user.username
    pooja_type = models.CharField(max_length=50, choices=POOJA_TYPES)
    date = models.DateField()
    time_slot = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "time_slot"]

    def __str__(self):
        return f"{self.name} - {self.pooja_type} on {self.date}"

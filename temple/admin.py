# temple/admin.py
from django.contrib import admin
from .models import TempleContent

@admin.register(TempleContent)
class TempleContentAdmin(admin.ModelAdmin):
    list_display = ("key", "title", "updated_at")
    search_fields = ("key", "title")

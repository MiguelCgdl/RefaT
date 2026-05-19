from django.contrib import admin

from .models import Cliente


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("nombre", "telefono", "email", "activo")
    search_fields = ("nombre", "email", "rfc")
    list_filter = ("activo",)

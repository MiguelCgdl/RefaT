from django.contrib import admin

from .models import Vehiculo


@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = ("placas", "marca", "modelo", "cliente", "activo")
    search_fields = ("placas", "serie_vin", "marca")
    list_filter = ("activo", "marca")

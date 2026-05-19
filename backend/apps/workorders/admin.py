from django.contrib import admin

from .models import OrdenTrabajo


@admin.register(OrdenTrabajo)
class OrdenTrabajoAdmin(admin.ModelAdmin):
    list_display = ("folio", "vehiculo", "estado", "prioridad", "mecanico")
    list_filter = ("estado", "prioridad")
    search_fields = ("folio",)
    readonly_fields = ("folio",)

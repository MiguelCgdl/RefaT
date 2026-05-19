from django.contrib import admin

from .models import LineaPresupuesto, Presupuesto


class LineaPresupuestoInline(admin.TabularInline):
    model = LineaPresupuesto
    extra = 1


@admin.register(Presupuesto)
class PresupuestoAdmin(admin.ModelAdmin):
    list_display = ("orden", "version", "estado", "total", "aprobado_en")
    list_filter = ("estado",)
    inlines = [LineaPresupuestoInline]


@admin.register(LineaPresupuesto)
class LineaPresupuestoAdmin(admin.ModelAdmin):
    list_display = ("presupuesto", "tipo", "descripcion", "cantidad", "precio_unitario")

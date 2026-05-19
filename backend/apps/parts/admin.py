from django.contrib import admin

from .models import MovimientoInventario, Refaccion


@admin.register(Refaccion)
class RefaccionAdmin(admin.ModelAdmin):
    list_display = ("sku", "nombre", "stock", "stock_minimo", "precio_venta")
    search_fields = ("sku", "nombre")
    list_filter = ("categoria", "activo")


@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ("refaccion", "tipo", "cantidad", "orden", "creado_en")
    list_filter = ("tipo",)

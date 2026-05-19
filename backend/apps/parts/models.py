from decimal import Decimal

from django.db import models

from apps.workorders.models import OrdenTrabajo


class Refaccion(models.Model):
    sku = models.CharField("SKU", max_length=50, unique=True)
    nombre = models.CharField("nombre", max_length=200)
    categoria = models.CharField("categoría", max_length=100, blank=True)
    costo = models.DecimalField(
        "costo", max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    precio_venta = models.DecimalField(
        "precio de venta", max_digits=12, decimal_places=2
    )
    stock = models.DecimalField(
        "stock", max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    stock_minimo = models.DecimalField(
        "stock mínimo", max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    ubicacion = models.CharField("ubicación en almacén", max_length=80, blank=True)
    activo = models.BooleanField("activo", default=True)
    creado_en = models.DateTimeField("creado en", auto_now_add=True)
    actualizado_en = models.DateTimeField("actualizado en", auto_now=True)

    class Meta:
        verbose_name = "refacción"
        verbose_name_plural = "refacciones"
        ordering = ["nombre"]

    def __str__(self):
        return f"{self.sku} — {self.nombre}"

    @property
    def bajo_stock(self):
        return self.stock <= self.stock_minimo


class MovimientoInventario(models.Model):
    class TipoMovimiento(models.TextChoices):
        ENTRADA = "entrada", "Entrada"
        SALIDA = "salida", "Salida"
        AJUSTE = "ajuste", "Ajuste"

    refaccion = models.ForeignKey(
        Refaccion,
        on_delete=models.PROTECT,
        related_name="movimientos",
        verbose_name="refacción",
    )
    tipo = models.CharField("tipo", max_length=10, choices=TipoMovimiento.choices)
    cantidad = models.DecimalField("cantidad", max_digits=10, decimal_places=2)
    orden = models.ForeignKey(
        OrdenTrabajo,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="movimientos_inventario",
        verbose_name="orden de trabajo",
    )
    notas = models.TextField("notas", blank=True)
    creado_en = models.DateTimeField("creado en", auto_now_add=True)

    class Meta:
        verbose_name = "movimiento de inventario"
        verbose_name_plural = "movimientos de inventario"
        ordering = ["-creado_en"]

    def __str__(self):
        return f"{self.tipo} {self.cantidad} — {self.refaccion.sku}"

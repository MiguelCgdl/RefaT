from django.db import models

from apps.customers.models import Cliente


class Vehiculo(models.Model):
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name="vehiculos",
        verbose_name="cliente",
    )
    marca = models.CharField("marca", max_length=80)
    modelo = models.CharField("modelo", max_length=80)
    serie_vin = models.CharField("serie / VIN", max_length=17, blank=True)
    anio = models.PositiveSmallIntegerField("año")
    placas = models.CharField("placas", max_length=15, unique=True)
    color = models.CharField("color", max_length=40, blank=True)
    kilometraje_actual = models.PositiveIntegerField(
        "kilometraje actual", default=0
    )
    notas = models.TextField("notas", blank=True)
    activo = models.BooleanField("activo", default=True)
    creado_en = models.DateTimeField("creado en", auto_now_add=True)
    actualizado_en = models.DateTimeField("actualizado en", auto_now=True)

    class Meta:
        verbose_name = "vehículo"
        verbose_name_plural = "vehículos"
        ordering = ["marca", "modelo"]

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.placas})"

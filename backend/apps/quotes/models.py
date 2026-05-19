from decimal import Decimal

from django.db import models
from django.utils import timezone

from apps.parts.models import Refaccion
from apps.workorders.models import OrdenTrabajo


class Presupuesto(models.Model):
    class Estado(models.TextChoices):
        BORRADOR = "borrador", "Borrador"
        ENVIADO = "enviado", "Enviado al cliente"
        APROBADO = "aprobado", "Aprobado"
        RECHAZADO = "rechazado", "Rechazado"
        VENCIDO = "vencido", "Vencido"

    orden = models.ForeignKey(
        OrdenTrabajo,
        on_delete=models.CASCADE,
        related_name="presupuestos",
        verbose_name="orden de trabajo",
    )
    version = models.PositiveSmallIntegerField("versión", default=1)
    estado = models.CharField(
        "estado",
        max_length=20,
        choices=Estado.choices,
        default=Estado.BORRADOR,
    )
    subtotal = models.DecimalField(
        "subtotal", max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    iva = models.DecimalField(
        "IVA", max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    total = models.DecimalField(
        "total", max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    aprobado_en = models.DateTimeField("aprobado en", null=True, blank=True)
    creado_en = models.DateTimeField("creado en", auto_now_add=True)
    actualizado_en = models.DateTimeField("actualizado en", auto_now=True)

    class Meta:
        verbose_name = "presupuesto"
        verbose_name_plural = "presupuestos"
        unique_together = [("orden", "version")]
        ordering = ["-version"]

    def __str__(self):
        return f"Presupuesto v{self.version} — {self.orden.folio}"

    def recalcular_totales(self):
        lineas = self.lineas.all()
        subtotal = sum(l.importe_neto for l in lineas)
        iva = (subtotal * Decimal("0.16")).quantize(Decimal("0.01"))
        self.subtotal = subtotal
        self.iva = iva
        self.total = subtotal + iva
        self.save(update_fields=["subtotal", "iva", "total", "actualizado_en"])


class LineaPresupuesto(models.Model):
    class TipoLinea(models.TextChoices):
        SERVICIO = "servicio", "Servicio"
        REFACCION = "refaccion", "Refacción"

    presupuesto = models.ForeignKey(
        Presupuesto,
        on_delete=models.CASCADE,
        related_name="lineas",
        verbose_name="presupuesto",
    )
    tipo = models.CharField("tipo", max_length=15, choices=TipoLinea.choices)
    descripcion = models.CharField("descripción", max_length=300)
    refaccion = models.ForeignKey(
        Refaccion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lineas_presupuesto",
        verbose_name="refacción",
    )
    cantidad = models.DecimalField(
        "cantidad", max_digits=10, decimal_places=2, default=Decimal("1.00")
    )
    precio_unitario = models.DecimalField(
        "precio unitario (snapshot)",
        max_digits=12,
        decimal_places=2,
    )
    descuento = models.DecimalField(
        "descuento", max_digits=12, decimal_places=2, default=Decimal("0.00")
    )

    class Meta:
        verbose_name = "línea de presupuesto"
        verbose_name_plural = "líneas de presupuesto"

    def __str__(self):
        return f"{self.descripcion} x{self.cantidad}"

    @property
    def importe_bruto(self):
        return self.cantidad * self.precio_unitario

    @property
    def importe_neto(self):
        return self.importe_bruto - self.descuento

    def save(self, *args, **kwargs):
        if (
            self.tipo == self.TipoLinea.REFACCION
            and self.refaccion_id
            and self.precio_unitario is None
        ):
            self.precio_unitario = self.refaccion.precio_venta
        super().save(*args, **kwargs)
        self.presupuesto.recalcular_totales()

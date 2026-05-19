from django.conf import settings
from django.db import models, transaction
from django.utils import timezone

from apps.vehicles.models import Vehiculo


class OrdenTrabajo(models.Model):
    class Estado(models.TextChoices):
        RECIBIDO = "recibido", "Recibido"
        DIAGNOSTICO = "diagnostico", "En diagnóstico"
        ESPERA_APROBACION = "espera_aprobacion", "Espera aprobación"
        EN_PROCESO = "en_proceso", "En proceso"
        LISTO = "listo", "Listo para entrega"
        ENTREGADO = "entregado", "Entregado"
        CANCELADO = "cancelado", "Cancelado"

    class Prioridad(models.TextChoices):
        BAJA = "baja", "Baja"
        NORMAL = "normal", "Normal"
        ALTA = "alta", "Alta"
        URGENTE = "urgente", "Urgente"

    folio = models.CharField("folio", max_length=20, unique=True, editable=False)
    vehiculo = models.ForeignKey(
        Vehiculo,
        on_delete=models.PROTECT,
        related_name="ordenes",
        verbose_name="vehículo",
    )
    fecha_ingreso = models.DateTimeField("fecha de ingreso", default=timezone.now)
    fecha_estimada = models.DateField("fecha estimada", null=True, blank=True)
    fecha_cierre = models.DateTimeField("fecha de cierre", null=True, blank=True)
    estado = models.CharField(
        "estado",
        max_length=30,
        choices=Estado.choices,
        default=Estado.RECIBIDO,
    )
    queja_cliente = models.TextField("queja del cliente")
    diagnostico = models.TextField("diagnóstico", blank=True)
    mecanico = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ordenes_asignadas",
        verbose_name="mecánico",
    )
    prioridad = models.CharField(
        "prioridad",
        max_length=10,
        choices=Prioridad.choices,
        default=Prioridad.NORMAL,
    )
    creado_en = models.DateTimeField("creado en", auto_now_add=True)
    actualizado_en = models.DateTimeField("actualizado en", auto_now=True)

    class Meta:
        verbose_name = "orden de trabajo"
        verbose_name_plural = "órdenes de trabajo"
        ordering = ["-fecha_ingreso"]

    def __str__(self):
        return self.folio

    def save(self, *args, **kwargs):
        if not self.folio:
            self.folio = self._generar_folio()
        super().save(*args, **kwargs)

    @classmethod
    def _generar_folio(cls):
        """Genera folio OT-AAAAMMDD-NNNN de forma atómica."""
        prefijo = timezone.now().strftime("OT-%Y%m%d")
        with transaction.atomic():
            ultima = (
                cls.objects.select_for_update()
                .filter(folio__startswith=prefijo)
                .order_by("-folio")
                .first()
            )
            if ultima:
                secuencia = int(ultima.folio.split("-")[-1]) + 1
            else:
                secuencia = 1
            return f"{prefijo}-{secuencia:04d}"

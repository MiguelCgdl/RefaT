from django.conf import settings
from django.db import models


class Notificacion(models.Model):
    class Tipo(models.TextChoices):
        STOCK_BAJO = "stock_bajo", "Stock bajo"
        OT_LISTA = "ot_lista", "Orden lista"
        PRESUPUESTO = "presupuesto", "Presupuesto"
        GENERAL = "general", "General"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notificaciones",
        verbose_name="usuario",
    )
    tipo = models.CharField("tipo", max_length=20, choices=Tipo.choices)
    titulo = models.CharField("título", max_length=200)
    mensaje = models.TextField("mensaje")
    leida = models.BooleanField("leída", default=False)
    creado_en = models.DateTimeField("creado en", auto_now_add=True)

    class Meta:
        verbose_name = "notificación"
        verbose_name_plural = "notificaciones"
        ordering = ["-creado_en"]

    def __str__(self):
        return self.titulo

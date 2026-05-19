from django.db import models


class Cliente(models.Model):
    nombre = models.CharField("nombre o razón social", max_length=200)
    email = models.EmailField("correo electrónico", blank=True)
    telefono = models.CharField("teléfono", max_length=20, blank=True)
    rfc = models.CharField("RFC", max_length=13, blank=True)
    direccion = models.TextField("dirección", blank=True)
    notas = models.TextField("notas", blank=True)
    activo = models.BooleanField("activo", default=True)
    creado_en = models.DateTimeField("creado en", auto_now_add=True)
    actualizado_en = models.DateTimeField("actualizado en", auto_now=True)

    class Meta:
        verbose_name = "cliente"
        verbose_name_plural = "clientes"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre

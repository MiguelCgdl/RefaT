import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("vehicles", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="OrdenTrabajo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("folio", models.CharField(editable=False, max_length=20, unique=True, verbose_name="folio")),
                ("fecha_ingreso", models.DateTimeField(default=django.utils.timezone.now, verbose_name="fecha de ingreso")),
                ("fecha_estimada", models.DateField(blank=True, null=True, verbose_name="fecha estimada")),
                ("fecha_cierre", models.DateTimeField(blank=True, null=True, verbose_name="fecha de cierre")),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("recibido", "Recibido"),
                            ("diagnostico", "En diagnóstico"),
                            ("espera_aprobacion", "Espera aprobación"),
                            ("en_proceso", "En proceso"),
                            ("listo", "Listo para entrega"),
                            ("entregado", "Entregado"),
                            ("cancelado", "Cancelado"),
                        ],
                        default="recibido",
                        max_length=30,
                        verbose_name="estado",
                    ),
                ),
                ("queja_cliente", models.TextField(verbose_name="queja del cliente")),
                ("diagnostico", models.TextField(blank=True, verbose_name="diagnóstico")),
                (
                    "prioridad",
                    models.CharField(
                        choices=[
                            ("baja", "Baja"),
                            ("normal", "Normal"),
                            ("alta", "Alta"),
                            ("urgente", "Urgente"),
                        ],
                        default="normal",
                        max_length=10,
                        verbose_name="prioridad",
                    ),
                ),
                ("creado_en", models.DateTimeField(auto_now_add=True, verbose_name="creado en")),
                ("actualizado_en", models.DateTimeField(auto_now=True, verbose_name="actualizado en")),
                (
                    "mecanico",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="ordenes_asignadas",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="mecánico",
                    ),
                ),
                (
                    "vehiculo",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="ordenes",
                        to="vehicles.vehiculo",
                        verbose_name="vehículo",
                    ),
                ),
            ],
            options={
                "verbose_name": "orden de trabajo",
                "verbose_name_plural": "órdenes de trabajo",
                "ordering": ["-fecha_ingreso"],
            },
        ),
    ]

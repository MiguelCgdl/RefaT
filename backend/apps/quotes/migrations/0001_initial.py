import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("parts", "0001_initial"),
        ("workorders", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Presupuesto",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("version", models.PositiveSmallIntegerField(default=1, verbose_name="versión")),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("borrador", "Borrador"),
                            ("enviado", "Enviado al cliente"),
                            ("aprobado", "Aprobado"),
                            ("rechazado", "Rechazado"),
                            ("vencido", "Vencido"),
                        ],
                        default="borrador",
                        max_length=20,
                        verbose_name="estado",
                    ),
                ),
                ("subtotal", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=12, verbose_name="subtotal")),
                ("iva", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=12, verbose_name="IVA")),
                ("total", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=12, verbose_name="total")),
                ("aprobado_en", models.DateTimeField(blank=True, null=True, verbose_name="aprobado en")),
                ("creado_en", models.DateTimeField(auto_now_add=True, verbose_name="creado en")),
                ("actualizado_en", models.DateTimeField(auto_now=True, verbose_name="actualizado en")),
                (
                    "orden",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="presupuestos",
                        to="workorders.ordentrabajo",
                        verbose_name="orden de trabajo",
                    ),
                ),
            ],
            options={
                "verbose_name": "presupuesto",
                "verbose_name_plural": "presupuestos",
                "ordering": ["-version"],
                "unique_together": {("orden", "version")},
            },
        ),
        migrations.CreateModel(
            name="LineaPresupuesto",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "tipo",
                    models.CharField(
                        choices=[("servicio", "Servicio"), ("refaccion", "Refacción")],
                        max_length=15,
                        verbose_name="tipo",
                    ),
                ),
                ("descripcion", models.CharField(max_length=300, verbose_name="descripción")),
                ("cantidad", models.DecimalField(decimal_places=2, default=Decimal("1.00"), max_digits=10, verbose_name="cantidad")),
                ("precio_unitario", models.DecimalField(decimal_places=2, max_digits=12, verbose_name="precio unitario (snapshot)")),
                ("descuento", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=12, verbose_name="descuento")),
                (
                    "presupuesto",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="lineas",
                        to="quotes.presupuesto",
                        verbose_name="presupuesto",
                    ),
                ),
                (
                    "refaccion",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="lineas_presupuesto",
                        to="parts.refaccion",
                        verbose_name="refacción",
                    ),
                ),
            ],
            options={
                "verbose_name": "línea de presupuesto",
                "verbose_name_plural": "líneas de presupuesto",
            },
        ),
    ]

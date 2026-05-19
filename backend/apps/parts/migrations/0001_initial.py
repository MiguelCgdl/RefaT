import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("workorders", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Refaccion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("sku", models.CharField(max_length=50, unique=True, verbose_name="SKU")),
                ("nombre", models.CharField(max_length=200, verbose_name="nombre")),
                ("categoria", models.CharField(blank=True, max_length=100, verbose_name="categoría")),
                ("costo", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=12, verbose_name="costo")),
                ("precio_venta", models.DecimalField(decimal_places=2, max_digits=12, verbose_name="precio de venta")),
                ("stock", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=10, verbose_name="stock")),
                ("stock_minimo", models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=10, verbose_name="stock mínimo")),
                ("ubicacion", models.CharField(blank=True, max_length=80, verbose_name="ubicación en almacén")),
                ("activo", models.BooleanField(default=True, verbose_name="activo")),
                ("creado_en", models.DateTimeField(auto_now_add=True, verbose_name="creado en")),
                ("actualizado_en", models.DateTimeField(auto_now=True, verbose_name="actualizado en")),
            ],
            options={
                "verbose_name": "refacción",
                "verbose_name_plural": "refacciones",
                "ordering": ["nombre"],
            },
        ),
        migrations.CreateModel(
            name="MovimientoInventario",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "tipo",
                    models.CharField(
                        choices=[("entrada", "Entrada"), ("salida", "Salida"), ("ajuste", "Ajuste")],
                        max_length=10,
                        verbose_name="tipo",
                    ),
                ),
                ("cantidad", models.DecimalField(decimal_places=2, max_digits=10, verbose_name="cantidad")),
                ("notas", models.TextField(blank=True, verbose_name="notas")),
                ("creado_en", models.DateTimeField(auto_now_add=True, verbose_name="creado en")),
                (
                    "orden",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="movimientos_inventario",
                        to="workorders.ordentrabajo",
                        verbose_name="orden de trabajo",
                    ),
                ),
                (
                    "refaccion",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="movimientos",
                        to="parts.refaccion",
                        verbose_name="refacción",
                    ),
                ),
            ],
            options={
                "verbose_name": "movimiento de inventario",
                "verbose_name_plural": "movimientos de inventario",
                "ordering": ["-creado_en"],
            },
        ),
    ]

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("customers", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Vehiculo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("marca", models.CharField(max_length=80, verbose_name="marca")),
                ("modelo", models.CharField(max_length=80, verbose_name="modelo")),
                ("serie_vin", models.CharField(blank=True, max_length=17, verbose_name="serie / VIN")),
                ("anio", models.PositiveSmallIntegerField(verbose_name="año")),
                ("placas", models.CharField(max_length=15, unique=True, verbose_name="placas")),
                ("color", models.CharField(blank=True, max_length=40, verbose_name="color")),
                ("kilometraje_actual", models.PositiveIntegerField(default=0, verbose_name="kilometraje actual")),
                ("notas", models.TextField(blank=True, verbose_name="notas")),
                ("activo", models.BooleanField(default=True, verbose_name="activo")),
                ("creado_en", models.DateTimeField(auto_now_add=True, verbose_name="creado en")),
                ("actualizado_en", models.DateTimeField(auto_now=True, verbose_name="actualizado en")),
                (
                    "cliente",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="vehiculos",
                        to="customers.cliente",
                        verbose_name="cliente",
                    ),
                ),
            ],
            options={
                "verbose_name": "vehículo",
                "verbose_name_plural": "vehículos",
                "ordering": ["marca", "modelo"],
            },
        ),
    ]

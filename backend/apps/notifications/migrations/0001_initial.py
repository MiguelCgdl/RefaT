import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Notificacion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "tipo",
                    models.CharField(
                        choices=[
                            ("stock_bajo", "Stock bajo"),
                            ("ot_lista", "Orden lista"),
                            ("presupuesto", "Presupuesto"),
                            ("general", "General"),
                        ],
                        max_length=20,
                        verbose_name="tipo",
                    ),
                ),
                ("titulo", models.CharField(max_length=200, verbose_name="título")),
                ("mensaje", models.TextField(verbose_name="mensaje")),
                ("leida", models.BooleanField(default=False, verbose_name="leída")),
                ("creado_en", models.DateTimeField(auto_now_add=True, verbose_name="creado en")),
                (
                    "usuario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notificaciones",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="usuario",
                    ),
                ),
            ],
            options={
                "verbose_name": "notificación",
                "verbose_name_plural": "notificaciones",
                "ordering": ["-creado_en"],
            },
        ),
    ]

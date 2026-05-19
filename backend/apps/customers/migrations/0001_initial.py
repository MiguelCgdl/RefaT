from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Cliente",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre", models.CharField(max_length=200, verbose_name="nombre o razón social")),
                ("email", models.EmailField(blank=True, max_length=254, verbose_name="correo electrónico")),
                ("telefono", models.CharField(blank=True, max_length=20, verbose_name="teléfono")),
                ("rfc", models.CharField(blank=True, max_length=13, verbose_name="RFC")),
                ("direccion", models.TextField(blank=True, verbose_name="dirección")),
                ("notas", models.TextField(blank=True, verbose_name="notas")),
                ("activo", models.BooleanField(default=True, verbose_name="activo")),
                ("creado_en", models.DateTimeField(auto_now_add=True, verbose_name="creado en")),
                ("actualizado_en", models.DateTimeField(auto_now=True, verbose_name="actualizado en")),
            ],
            options={
                "verbose_name": "cliente",
                "verbose_name_plural": "clientes",
                "ordering": ["nombre"],
            },
        ),
    ]

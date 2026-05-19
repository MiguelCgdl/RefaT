from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Crea los grupos de roles del sistema"

    GRUPOS = ("administrador", "mecanico", "recepcion", "almacen")

    def handle(self, *args, **options):
        for nombre in self.GRUPOS:
            grupo, creado = Group.objects.get_or_create(name=nombre)
            if creado:
                self.stdout.write(self.style.SUCCESS(f"Grupo creado: {nombre}"))
            else:
                self.stdout.write(f"Grupo ya existía: {nombre}")

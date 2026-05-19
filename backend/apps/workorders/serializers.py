from rest_framework import serializers

from .models import OrdenTrabajo


class OrdenTrabajoSerializer(serializers.ModelSerializer):
    vehiculo_placas = serializers.CharField(source="vehiculo.placas", read_only=True)
    mecanico_nombre = serializers.SerializerMethodField()

    class Meta:
        model = OrdenTrabajo
        fields = [
            "id",
            "folio",
            "vehiculo",
            "vehiculo_placas",
            "fecha_ingreso",
            "fecha_estimada",
            "fecha_cierre",
            "estado",
            "queja_cliente",
            "diagnostico",
            "mecanico",
            "mecanico_nombre",
            "prioridad",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = ["folio", "creado_en", "actualizado_en"]

    def get_mecanico_nombre(self, obj):
        if obj.mecanico:
            return obj.mecanico.get_full_name() or obj.mecanico.username
        return None

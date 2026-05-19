from rest_framework import serializers

from .models import Vehiculo


class VehiculoSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source="cliente.nombre", read_only=True)

    class Meta:
        model = Vehiculo
        fields = [
            "id",
            "cliente",
            "cliente_nombre",
            "marca",
            "modelo",
            "serie_vin",
            "anio",
            "placas",
            "color",
            "kilometraje_actual",
            "notas",
            "activo",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = ["creado_en", "actualizado_en"]


class VehiculoHistorialSerializer(serializers.Serializer):
    """Resumen de órdenes de trabajo del vehículo."""

    id = serializers.IntegerField()
    folio = serializers.CharField()
    estado = serializers.CharField()
    fecha_ingreso = serializers.DateTimeField()
    fecha_cierre = serializers.DateTimeField(allow_null=True)
    queja_cliente = serializers.CharField()
    diagnostico = serializers.CharField()
    prioridad = serializers.CharField()

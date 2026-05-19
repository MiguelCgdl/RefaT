from rest_framework import serializers

from .models import LineaPresupuesto, Presupuesto


class LineaPresupuestoSerializer(serializers.ModelSerializer):
    importe_neto = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = LineaPresupuesto
        fields = [
            "id",
            "presupuesto",
            "tipo",
            "descripcion",
            "refaccion",
            "cantidad",
            "precio_unitario",
            "descuento",
            "importe_neto",
        ]


class PresupuestoSerializer(serializers.ModelSerializer):
    orden_folio = serializers.CharField(source="orden.folio", read_only=True)
    lineas = LineaPresupuestoSerializer(many=True, read_only=True)

    class Meta:
        model = Presupuesto
        fields = [
            "id",
            "orden",
            "orden_folio",
            "version",
            "estado",
            "subtotal",
            "iva",
            "total",
            "aprobado_en",
            "lineas",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = [
            "subtotal",
            "iva",
            "total",
            "aprobado_en",
            "creado_en",
            "actualizado_en",
        ]

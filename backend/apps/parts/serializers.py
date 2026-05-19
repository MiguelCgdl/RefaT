from rest_framework import serializers

from .models import MovimientoInventario, Refaccion


class RefaccionSerializer(serializers.ModelSerializer):
    bajo_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Refaccion
        fields = [
            "id",
            "sku",
            "nombre",
            "categoria",
            "costo",
            "precio_venta",
            "stock",
            "stock_minimo",
            "ubicacion",
            "activo",
            "bajo_stock",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = ["creado_en", "actualizado_en"]


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    refaccion_sku = serializers.CharField(source="refaccion.sku", read_only=True)

    class Meta:
        model = MovimientoInventario
        fields = [
            "id",
            "refaccion",
            "refaccion_sku",
            "tipo",
            "cantidad",
            "orden",
            "notas",
            "creado_en",
        ]
        read_only_fields = ["creado_en"]

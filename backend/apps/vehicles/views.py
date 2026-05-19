from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import LecturaAutenticadoEscrituraRoles
from apps.workorders.models import OrdenTrabajo

from .models import Vehiculo
from .serializers import VehiculoHistorialSerializer, VehiculoSerializer


class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.select_related("cliente")
    serializer_class = VehiculoSerializer
    permission_classes = [LecturaAutenticadoEscrituraRoles]
    search_fields = ["placas", "marca", "modelo", "serie_vin"]
    filterset_fields = ["cliente", "activo"]

    @action(detail=True, methods=["get"], url_path="historial")
    def historial(self, request, pk=None):
        """GET /api/vehiculos/{id}/historial/ — órdenes de trabajo del vehículo."""
        vehiculo = self.get_object()
        ordenes = OrdenTrabajo.objects.filter(vehiculo=vehiculo).order_by("-fecha_ingreso")
        data = [
            {
                "id": o.id,
                "folio": o.folio,
                "estado": o.estado,
                "fecha_ingreso": o.fecha_ingreso,
                "fecha_cierre": o.fecha_cierre,
                "queja_cliente": o.queja_cliente,
                "diagnostico": o.diagnostico,
                "prioridad": o.prioridad,
            }
            for o in ordenes
        ]
        serializer = VehiculoHistorialSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

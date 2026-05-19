from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import LecturaAutenticadoEscrituraRoles

from .models import LineaPresupuesto, Presupuesto
from .serializers import LineaPresupuestoSerializer, PresupuestoSerializer
from .services import PresupuestoAprobacionError, aprobar_presupuesto


class PresupuestoViewSet(viewsets.ModelViewSet):
    queryset = Presupuesto.objects.select_related("orden").prefetch_related("lineas")
    serializer_class = PresupuestoSerializer
    permission_classes = [LecturaAutenticadoEscrituraRoles]
    filterset_fields = ["orden", "estado"]

    @action(detail=True, methods=["post"], url_path="aprobar")
    def aprobar(self, request, pk=None):
        """POST /api/presupuestos/{id}/aprobar/ — descuenta inventario."""
        presupuesto = self.get_object()
        try:
            presupuesto = aprobar_presupuesto(presupuesto)
        except PresupuestoAprobacionError as exc:
            detalle = exc.detail[0] if isinstance(exc.detail, list) else str(exc.detail)
            return Response({"detalle": str(detalle)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(presupuesto)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LineaPresupuestoViewSet(viewsets.ModelViewSet):
    queryset = LineaPresupuesto.objects.select_related("presupuesto", "refaccion")
    serializer_class = LineaPresupuestoSerializer
    permission_classes = [LecturaAutenticadoEscrituraRoles]
    filterset_fields = ["presupuesto", "tipo"]

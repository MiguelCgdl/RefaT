from rest_framework import viewsets

from apps.accounts.permissions import EsMecanicoOAdmin, LecturaAutenticadoEscrituraRoles

from .models import OrdenTrabajo
from .serializers import OrdenTrabajoSerializer


class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = OrdenTrabajo.objects.select_related("vehiculo", "mecanico")
    serializer_class = OrdenTrabajoSerializer
    permission_classes = [LecturaAutenticadoEscrituraRoles]
    search_fields = ["folio", "queja_cliente"]
    filterset_fields = ["estado", "prioridad", "vehiculo", "mecanico"]

    def get_permissions(self):
        if self.action in ("update", "partial_update") and self.request.data.get("estado"):
            return [EsMecanicoOAdmin()]
        return super().get_permissions()

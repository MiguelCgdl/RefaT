from rest_framework import viewsets

from apps.accounts.permissions import LecturaAutenticadoEscrituraRoles

from .models import MovimientoInventario, Refaccion
from .serializers import MovimientoInventarioSerializer, RefaccionSerializer


class RefaccionViewSet(viewsets.ModelViewSet):
    queryset = Refaccion.objects.all()
    serializer_class = RefaccionSerializer
    permission_classes = [LecturaAutenticadoEscrituraRoles]
    search_fields = ["sku", "nombre", "categoria"]
    filterset_fields = ["activo", "categoria"]


class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.select_related("refaccion", "orden")
    serializer_class = MovimientoInventarioSerializer
    permission_classes = [LecturaAutenticadoEscrituraRoles]
    filterset_fields = ["tipo", "refaccion", "orden"]
    http_method_names = ["get", "post", "head", "options"]

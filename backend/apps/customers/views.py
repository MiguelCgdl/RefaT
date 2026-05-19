from rest_framework import viewsets

from apps.accounts.permissions import LecturaAutenticadoEscrituraRoles

from .models import Cliente
from .serializers import ClienteSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [LecturaAutenticadoEscrituraRoles]
    search_fields = ["nombre", "email", "telefono", "rfc"]
    filterset_fields = ["activo"]

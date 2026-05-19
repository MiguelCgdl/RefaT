from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny


class PublicObtainAuthToken(ObtainAuthToken):
    """Login por token sin exigir sesión previa (evita 403/500 por permisos globales)."""

    permission_classes = [AllowAny]
    authentication_classes = []

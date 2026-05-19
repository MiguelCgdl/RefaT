from rest_framework.permissions import BasePermission, SAFE_METHODS


class EsAdministrador(BasePermission):
    """Solo usuarios del grupo administrador."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.groups.filter(name="administrador").exists()
            )
        )


class EsMecanicoOAdmin(BasePermission):
    """Mecánicos y administradores."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(
            name__in=["administrador", "mecanico"]
        ).exists()


class LecturaAutenticadoEscrituraRoles(BasePermission):
    """Lectura para cualquier autenticado; escritura según grupo del ViewSet."""

    grupos_escritura = ("administrador", "recepcion", "almacen")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name__in=self.grupos_escritura).exists()

from django.db.models import Count, F
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.parts.models import Refaccion
from apps.workorders.models import OrdenTrabajo


class ResumenDashboardView(APIView):
    """GET /api/reportes/resumen/ — métricas básicas para el dashboard."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        ordenes_por_estado = (
            OrdenTrabajo.objects.values("estado")
            .annotate(total=Count("id"))
            .order_by("estado")
        )
        refacciones_bajo_stock = Refaccion.objects.filter(
            activo=True, stock__lte=F("stock_minimo")
        ).count()
        return Response(
            {
                "ordenes_por_estado": list(ordenes_por_estado),
                "refacciones_bajo_stock": refacciones_bajo_stock,
                "ordenes_activas": OrdenTrabajo.objects.exclude(
                    estado__in=[
                        OrdenTrabajo.Estado.ENTREGADO,
                        OrdenTrabajo.Estado.CANCELADO,
                    ]
                ).count(),
            }
        )

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.customers.views import ClienteViewSet
from apps.reports.views import ResumenDashboardView
from apps.parts.views import MovimientoInventarioViewSet, RefaccionViewSet
from apps.quotes.views import LineaPresupuestoViewSet, PresupuestoViewSet
from apps.vehicles.views import VehiculoViewSet
from apps.workorders.views import OrdenTrabajoViewSet

router = DefaultRouter()
router.register(r"clientes", ClienteViewSet, basename="cliente")
router.register(r"vehiculos", VehiculoViewSet, basename="vehiculo")
router.register(r"ordenes", OrdenTrabajoViewSet, basename="orden")
router.register(r"presupuestos", PresupuestoViewSet, basename="presupuesto")
router.register(r"lineas-presupuesto", LineaPresupuestoViewSet, basename="linea-presupuesto")
router.register(r"refacciones", RefaccionViewSet, basename="refaccion")
router.register(r"movimientos-inventario", MovimientoInventarioViewSet, basename="movimiento")

urlpatterns = [
    path("reportes/resumen/", ResumenDashboardView.as_view(), name="reportes-resumen"),
    path("", include(router.urls)),
]

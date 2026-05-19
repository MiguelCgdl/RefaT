from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.parts.models import MovimientoInventario, Refaccion
from apps.workorders.models import OrdenTrabajo

from .models import LineaPresupuesto, Presupuesto


class PresupuestoAprobacionError(ValidationError):
    pass


@transaction.atomic
def aprobar_presupuesto(presupuesto: Presupuesto) -> Presupuesto:
    """
    Aprueba el presupuesto y descuenta stock de refacciones de forma transaccional.
    """
    if presupuesto.estado == Presupuesto.Estado.APROBADO:
        raise PresupuestoAprobacionError("El presupuesto ya está aprobado.")

    if presupuesto.estado == Presupuesto.Estado.RECHAZADO:
        raise PresupuestoAprobacionError("No se puede aprobar un presupuesto rechazado.")

    lineas_refaccion = presupuesto.lineas.filter(
        tipo=LineaPresupuesto.TipoLinea.REFACCION,
        refaccion__isnull=False,
    ).select_related("refaccion")

    for linea in lineas_refaccion:
        refaccion = Refaccion.objects.select_for_update().get(pk=linea.refaccion_id)
        cantidad = Decimal(linea.cantidad)
        if refaccion.stock < cantidad:
            raise PresupuestoAprobacionError(
                f"Stock insuficiente para {refaccion.sku}: "
                f"disponible {refaccion.stock}, requerido {cantidad}."
            )

    for linea in lineas_refaccion:
        refaccion = Refaccion.objects.select_for_update().get(pk=linea.refaccion_id)
        cantidad = Decimal(linea.cantidad)
        refaccion.stock -= cantidad
        refaccion.save(update_fields=["stock", "actualizado_en"])

        MovimientoInventario.objects.create(
            refaccion=refaccion,
            tipo=MovimientoInventario.TipoMovimiento.SALIDA,
            cantidad=cantidad,
            orden=presupuesto.orden,
            notas=f"Salida por aprobación presupuesto v{presupuesto.version}",
        )

    presupuesto.estado = Presupuesto.Estado.APROBADO
    presupuesto.aprobado_en = timezone.now()
    presupuesto.save(update_fields=["estado", "aprobado_en", "actualizado_en"])

    orden = presupuesto.orden
    if orden.estado in (
        OrdenTrabajo.Estado.RECIBIDO,
        OrdenTrabajo.Estado.DIAGNOSTICO,
        OrdenTrabajo.Estado.ESPERA_APROBACION,
    ):
        orden.estado = OrdenTrabajo.Estado.EN_PROCESO
        orden.save(update_fields=["estado", "actualizado_en"])

    return presupuesto

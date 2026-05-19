from celery import shared_task

from apps.parts.models import Refaccion

from .models import Notificacion


@shared_task
def verificar_stock_bajo():
    """Tarea Celery: notifica refacciones bajo stock mínimo (implementación futura)."""
    bajas = Refaccion.objects.filter(activo=True).extra(
        where=["stock <= stock_minimo"]
    )
    return {"refacciones_bajo_stock": bajas.count()}

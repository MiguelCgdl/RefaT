import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TipoNotificacion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Stubs de proveedores externos — configurar por variables de entorno */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async crear(usuarioId: number, tipo: TipoNotificacion, titulo: string, mensaje: string) {
    return this.prisma.notificacion.create({
      data: { usuarioId, tipo, titulo, mensaje },
    });
  }

  /** Stub Twilio SMS */
  enviarSms(to: string, body: string) {
    const sid = this.config.get('TWILIO_ACCOUNT_SID');
    this.logger.log(`[STUB Twilio] sid=${Boolean(sid)} to=${to} body=${body.slice(0, 40)}...`);
    return { enviado: false, stub: true };
  }

  /** Stub SendGrid email */
  enviarEmail(to: string, subject: string, html: string) {
    const key = this.config.get('SENDGRID_API_KEY');
    this.logger.log(`[STUB SendGrid] key=${Boolean(key)} to=${to} subject=${subject}`);
    return { enviado: false, stub: true };
  }

  /** Stub WhatsApp Business API */
  enviarWhatsApp(to: string, mensaje: string) {
    const token = this.config.get('WHATSAPP_API_TOKEN');
    this.logger.log(`[STUB WhatsApp] token=${Boolean(token)} to=${to}`);
    return { enviado: false, stub: true };
  }
}

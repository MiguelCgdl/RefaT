import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get('health')
  health() {
    return {
      twilio: Boolean(process.env.TWILIO_ACCOUNT_SID),
      sendgrid: Boolean(process.env.SENDGRID_API_KEY),
      whatsapp: Boolean(process.env.WHATSAPP_API_TOKEN),
      modo: 'stub',
    };
  }
}

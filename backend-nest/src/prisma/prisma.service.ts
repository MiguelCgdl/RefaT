import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const url = configService.get<string>('DATABASE_URL');
    if (!url) {
      Logger.warn('DATABASE_URL no está definido en las variables de entorno', PrismaService.name);
    }
    
    super({
      datasources: {
        db: {
          url: url,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conectado a la base de datos exitosamente');
    } catch (error: any) {
      this.logger.error('Error al conectar a la base de datos:', error);
      this.logger.warn('API iniciada sin conexión a base de datos; los endpoints que dependan de DB fallarán hasta que esté disponible.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

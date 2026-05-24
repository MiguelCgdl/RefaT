import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    if (!process.env.DATABASE_URL) {
      const host = process.env.DB_HOST || 'localhost';
      const port = process.env.DB_PORT || '5432';
      const dbName = process.env.DB_NAME || 'postgres';
      const user = process.env.DB_USER || 'postgres';
      const password = process.env.DB_PASSWORD || '';

      const auth = password ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}` : encodeURIComponent(user);
      process.env.DATABASE_URL = `postgresql://${auth}@${host}:${port}/${dbName}?schema=public`;
    }

    super();
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

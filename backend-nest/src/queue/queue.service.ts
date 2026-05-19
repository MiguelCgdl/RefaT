import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

/** Cola BullMQ — processors stub para recordatorios y alertas de stock */
@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private connection?: IORedis;
  private recordatoriosQueue?: Queue;
  private stockQueue?: Queue;
  private workers: Worker[] = [];

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL no configurado — cola BullMQ deshabilitada');
      return;
    }

    this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
    this.recordatoriosQueue = new Queue('recordatorios', { connection: this.connection });
    this.stockQueue = new Queue('stock-alerts', { connection: this.connection });

    this.workers.push(
      new Worker(
        'recordatorios',
        async (job: Job) => {
          this.logger.log(`[STUB] Procesando recordatorio job=${job.id} data=${JSON.stringify(job.data)}`);
        },
        { connection: this.connection },
      ),
      new Worker(
        'stock-alerts',
        async (job: Job) => {
          this.logger.log(`[STUB] Procesando stock-alert job=${job.id} data=${JSON.stringify(job.data)}`);
        },
        { connection: this.connection },
      ),
    );

    this.logger.log('BullMQ inicializado (processors stub)');
  }

  async encolarRecordatorio(data: Record<string, unknown>) {
    if (!this.recordatoriosQueue) return { encolado: false, motivo: 'redis_no_configurado' };
    const job = await this.recordatoriosQueue.add('recordatorio', data, { attempts: 3 });
    return { encolado: true, jobId: job.id };
  }

  async encolarStockAlert(refaccionId: number) {
    if (!this.stockQueue) return { encolado: false, motivo: 'redis_no_configurado' };
    const job = await this.stockQueue.add('stock-bajo', { refaccionId });
    return { encolado: true, jobId: job.id };
  }

  async onModuleDestroy() {
    await Promise.all(this.workers.map((w) => w.close()));
    await this.recordatoriosQueue?.close();
    await this.stockQueue?.close();
    await this.connection?.quit();
  }
}

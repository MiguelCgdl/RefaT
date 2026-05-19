import { Module } from '@nestjs/common';
import { WorkordersController } from './workorders.controller';
import { WorkordersService } from './workorders.service';

@Module({
  controllers: [WorkordersController],
  providers: [WorkordersService],
  exports: [WorkordersService],
})
export class WorkordersModule {}

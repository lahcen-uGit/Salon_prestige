import { Module } from '@nestjs/common';
import { EmployesController } from './employes.controller';
import { EmployesService } from './employes.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports:     [DatabaseModule],
  controllers: [EmployesController],
  providers:   [EmployesService],
})
export class EmployesModule {}
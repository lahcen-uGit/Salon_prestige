import { Module } from '@nestjs/common';
import { CaisseController } from './caisse.controller';
import { CaisseService } from './caisse.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports:     [DatabaseModule],
  controllers: [CaisseController],
  providers:   [CaisseService],
})
export class CaisseModule {}
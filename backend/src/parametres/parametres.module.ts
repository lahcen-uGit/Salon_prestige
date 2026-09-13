import { Module } from '@nestjs/common';
import { ParametresController } from './parametres.controller';
import { ParametresService } from './parametres.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports:     [DatabaseModule],
  controllers: [ParametresController],
  providers:   [ParametresService],
})
export class ParametresModule {}
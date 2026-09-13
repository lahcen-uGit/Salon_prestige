import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { EmployesModule } from './employes/employes.module';
import { ServicesModule } from './services/services.module';
import { CaisseModule } from './caisse/caisse.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ClientsModule } from './clients/clients.module';
import { ParametresModule } from './parametres/parametres.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    EmployesModule,
    ServicesModule,
    CaisseModule,
    DashboardModule,
    ReservationsModule,
    ClientsModule,
    ParametresModule,
  ],
})
export class AppModule {}
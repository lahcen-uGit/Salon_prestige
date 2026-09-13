import { Controller, Get, Headers } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {

  constructor(private dashboardService: DashboardService) {}

  // GET /dashboard — données dashboard
  @Get()
  findAll(@Headers('authorization') auth: string) {
    return this.dashboardService.findAll(auth);
  }
}
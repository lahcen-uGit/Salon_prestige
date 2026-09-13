import { Controller, Get, Headers } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {

  constructor(private clientsService: ClientsService) {}

  // GET /clients — liste tous les clients
  @Get()
  findAll(@Headers('authorization') auth: string) {
    return this.clientsService.findAll(auth);
  }
}
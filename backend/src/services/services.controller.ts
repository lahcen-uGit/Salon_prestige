import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {

  constructor(private servicesService: ServicesService) {}

  // GET /services — liste tous les services
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  // POST /services — ajouter un service
  @Post()
  create(@Body() body: any) {
    return this.servicesService.create(body);
  }

  // PUT /services/:id — modifier un service
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.servicesService.update(+id, body);
  }

  // DELETE /services/:id — supprimer un service
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.servicesService.delete(+id);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EmployesService } from './employes.service';

@Controller('employes')
export class EmployesController {

  constructor(private employesService: EmployesService) {}

  // GET /employes — liste tous les employés
  @Get()
  findAll() {
    return this.employesService.findAll();
  }

  // GET /employes/actifs — liste employés actifs pour login
  @Get('actifs')
  findActifs() {
    return this.employesService.findActifs();
  }

  // POST /employes — ajouter un employé
  @Post()
  create(@Body() body: any) {
    return this.employesService.create(body);
  }

  // PUT /employes/:id — modifier un employé
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.employesService.update(+id, body);
  }

  // DELETE /employes/:id — supprimer un employé
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.employesService.delete(+id);
  }
}
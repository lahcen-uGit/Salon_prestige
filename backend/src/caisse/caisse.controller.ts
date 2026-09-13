import { Controller, Get, Post, Delete, Body, Param, Headers, Res, Query } from '@nestjs/common';
import { CaisseService } from './caisse.service';
import type { Response } from 'express';

@Controller('caisse')
export class CaisseController {

  constructor(private caisseService: CaisseService) {}

  // GET /caisse — historique
  @Get()
  findAll(@Headers('authorization') auth: string) {
    return this.caisseService.findAll(auth);
  }

  // POST /caisse — enregistrer paiement
  @Post()
  create(@Body() body: any, @Headers('authorization') auth: string) {
    return this.caisseService.create(body, auth);
  }

  // GET /caisse/:id/pdf — générer reçu PDF
  @Get(':id/pdf')
  async getPdf(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    return this.caisseService.generatePdf(+id, 'Bearer ' + token, res);
  }

  // DELETE /caisse/:id — supprimer paiement
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.caisseService.delete(+id);
  }
}
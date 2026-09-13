import { Controller, Get, Put, Body, Headers } from '@nestjs/common';
import { ParametresService } from './parametres.service';

@Controller('parametres')
export class ParametresController {

  constructor(private parametresService: ParametresService) {}

  // GET /parametres — récupérer les paramètres
  @Get()
  findOne() {
    return this.parametresService.findOne();
  }

  // PUT /parametres — modifier les paramètres
  @Put()
  update(@Body() body: any) {
    return this.parametresService.update(body);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, Headers, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {

  constructor(private reservationsService: ReservationsService) {}

  // GET /reservations/creneaux?date=2024-01-15&service_id=1
  @Get('creneaux')
  getCreneaux(
    @Query('date')       date:       string,
    @Query('service_id') service_id: string,
  ) {
    return this.reservationsService.getCreneaux(date, +service_id);
  }

  // GET /reservations
  @Get()
  findAll(@Headers('authorization') auth: string) {
    return this.reservationsService.findAll(auth);
  }

  // POST /reservations
  @Post()
  create(@Body() body: any) {
    return this.reservationsService.create(body);
  }

  // PUT /reservations/:id/affecter
  @Put(':id/affecter')
  affecter(@Param('id') id: string, @Body() body: any) {
    return this.reservationsService.affecter(+id, body.employe_id);
  }

  // PUT /reservations/:id/statut
  @Put(':id/statut')
  changerStatut(@Param('id') id: string, @Body() body: any) {
    return this.reservationsService.changerStatut(+id, body.statut);
  }

  // PUT /reservations/:id/encaisser
  @Put(':id/encaisser')
  encaisser(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.reservationsService.encaisser(+id, body, auth);
  }

  // DELETE /reservations/:id
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reservationsService.delete(+id);
  }
}
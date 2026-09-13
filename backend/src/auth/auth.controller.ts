import { Controller, Post, Put, Get, Delete, Body, Param, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('login-admin')
  loginAdmin(@Body() body: any) {
    return this.authService.loginAdmin(body.email, body.password);
  }

  @Post('login-employe')
  loginEmploye(@Body() body: any) {
    return this.authService.loginEmploye(body.code_pin);
  }

  @Post('register-admin')
  registerAdmin(@Body() body: any) {
    return this.authService.registerAdmin(body.nom, body.email, body.password, body.salon_name || 'PRESTIGE Salon Pro');
  }

  // GET /auth/admins — liste tous les admins
  @Get('admins')
  getAdmins() {
    return this.authService.getAdmins();
  }

  // PUT /auth/update-admin — modifier mon compte
  @Put('update-admin')
  updateAdmin(@Body() body: any, @Headers('authorization') auth: string) {
    return this.authService.updateAdmin(body, auth);
  }

  // DELETE /auth/admins/:id — supprimer un admin
  @Delete('admins/:id')
  deleteAdmin(@Param('id') id: string) {
    return this.authService.deleteAdmin(+id);
  }
}
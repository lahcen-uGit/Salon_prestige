import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ParametresService {

  constructor(private db: DatabaseService) {}

  // Récupérer les paramètres
  async findOne() {
    const params = await this.db.query(
      'SELECT * FROM parametres LIMIT 1'
    ) as any[];

    if (params.length === 0) {
      return {
        commission_rate:   25,
        horaire_ouverture: '09:00',
        horaire_fermeture: '21:00',
        salon_name:        'PRESTIGE Salon Pro',
        salon_tel:         '',
        salon_adresse:     '',
      };
    }

    return params[0];
  }

  // Modifier les paramètres
  async update(body: any) {
    await this.db.query(
      `UPDATE parametres SET
        commission_rate=?,
        horaire_ouverture=?,
        horaire_fermeture=?,
        salon_name=?,
        salon_tel=?,
        salon_adresse=?
       WHERE id=1`,
      [
        body.commission_rate   || 25,
        body.horaire_ouverture || '09:00',
        body.horaire_fermeture || '21:00',
        body.salon_name        || 'PRESTIGE Salon Pro',
        body.salon_tel         || '',
        body.salon_adresse     || '',
      ]
    );

    return { message: 'Paramètres enregistrés ✅' };
  }
}
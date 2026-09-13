import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as jwt from 'jsonwebtoken';

const SECRET = 'prestige_secret_key_2024';

@Injectable()
export class ClientsService {

  constructor(private db: DatabaseService) {}

  private getUser(authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('Token manquant');
    const token   = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET) as any;
    return decoded;
  }

  async findAll(authHeader: string) {
    this.getUser(authHeader);

    // Liste clients avec stats — visites + total dépensé + dernière visite
    return this.db.query(
      `SELECT
        c.id,
        c.nom,
        c.tel,
        c.created_at,
        COUNT(p.id)              as visites,
        COALESCE(SUM(p.total),0) as total_depense,
        MAX(p.created_at)        as derniere_visite
       FROM clients c
       LEFT JOIN paiements p ON p.client_id = c.id
       GROUP BY c.id, c.nom, c.tel, c.created_at
       ORDER BY total_depense DESC`
    );
  }
}
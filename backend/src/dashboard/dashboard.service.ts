import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as jwt from 'jsonwebtoken';

const SECRET = 'prestige_secret_key_2024';

@Injectable()
export class DashboardService {

  constructor(private db: DatabaseService) {}

  private getUser(authHeader: string): { id: number; role: string } {
    if (!authHeader) throw new UnauthorizedException('Token manquant');
    const token   = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET) as any;
    return { id: decoded.id, role: decoded.role };
  }

  async findAll(authHeader: string) {
    const user = this.getUser(authHeader);

    if (user.role === 'employe') {
      return this.getDashboardEmploye(user.id);
    }
    return this.getDashboardAdmin();
  }

  // ===== DASHBOARD EMPLOYÉ =====
  async getDashboardEmploye(employeId: number) {

    // KPIs des 14 derniers jours
    const kpis = await this.db.query(
      `SELECT
        COUNT(*)                    as nb_prestations,
        COALESCE(SUM(total), 0)     as ca,
        COALESCE(SUM(pourboire), 0) as pourboires,
        COALESCE(SUM(net_employe),0)as net
       FROM paiements
       WHERE employe_id = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)`,
      [employeId]
    ) as any[];

    // Barres 14 jours
    const barres14j = await this.db.query(
      `SELECT
        DATE(created_at)            as jour,
        COALESCE(SUM(net_employe),0)as net
       FROM paiements
       WHERE employe_id = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       GROUP BY DATE(created_at)
       ORDER BY jour ASC`,
      [employeId]
    );

    return {
      role: 'employe',
      kpis: kpis[0],
      barres14j,
    };
  }

  // ===== DASHBOARD ADMIN =====
  async getDashboardAdmin() {

    // KPIs globaux
    const kpis = await this.db.query(
      `SELECT
        COALESCE(SUM(total), 0)          as ca,
        COUNT(*)                         as transactions,
        COALESCE(SUM(pourboire), 0)      as pourboires,
        COALESCE(SUM(commission_salon),0) as commission,
        COALESCE(AVG(total), 0)          as ticket_moyen
       FROM paiements`
    ) as any[];

    // Barres 14 jours
    const barres14j = await this.db.query(
      `SELECT
        DATE(created_at)          as jour,
        COALESCE(SUM(total), 0)   as ca
       FROM paiements
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       GROUP BY DATE(created_at)
       ORDER BY jour ASC`
    );

    // Top services
    const topServices = await this.db.query(
      `SELECT
        s.nom,
        COUNT(*) as nb
       FROM paiements p
       JOIN services s ON s.id = p.service_id
       GROUP BY p.service_id, s.nom
       ORDER BY nb DESC
       LIMIT 5`
    );

    // Performance employés
    const perfEmployes = await this.db.query(
      `SELECT
        e.nom,
        COUNT(*)                         as nb_prestations,
        COALESCE(SUM(p.total), 0)        as ca,
        COALESCE(SUM(p.commission_salon),0) as commission
       FROM employes e
       LEFT JOIN paiements p ON p.employe_id = e.id
       GROUP BY e.id, e.nom
       ORDER BY ca DESC`
    );

    return {
      role: 'admin',
      kpis: kpis[0],
      barres14j,
      topServices,
      perfEmployes,
    };
  }
}
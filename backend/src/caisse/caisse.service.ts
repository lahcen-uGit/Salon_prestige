import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as jwt from 'jsonwebtoken';
import PDFDocument = require('pdfkit');
import type { Response } from 'express';

const SECRET = 'prestige_secret_key_2024';

@Injectable()
export class CaisseService {

  constructor(private db: DatabaseService) {}

  private getUserId(authHeader: string): { id: number; role: string } {
    if (!authHeader) throw new UnauthorizedException('Token manquant');
    const token   = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET) as any;
    return { id: decoded.id, role: decoded.role };
  }

  // ===== HISTORIQUE =====
  async findAll(authHeader: string) {
    const user = this.getUserId(authHeader);

    if (user.role === 'employe') {
      return this.db.query(
        `SELECT p.*,
          e.nom as employe_nom,
          s.nom as service_nom,
          c.nom as client_nom
         FROM paiements p
         JOIN employes e ON e.id = p.employe_id
         JOIN services s ON s.id = p.service_id
         LEFT JOIN clients c ON c.id = p.client_id
         WHERE p.employe_id = ?
         ORDER BY p.created_at DESC`,
        [user.id]
      );
    }

    return this.db.query(
      `SELECT p.*,
        e.nom as employe_nom,
        s.nom as service_nom,
        c.nom as client_nom
       FROM paiements p
       JOIN employes e ON e.id = p.employe_id
       JOIN services s ON s.id = p.service_id
       LEFT JOIN clients c ON c.id = p.client_id
       ORDER BY p.created_at DESC`
    );
  }

  // ===== ENREGISTRER PAIEMENT =====
  async create(body: any, authHeader: string) {
    const user = this.getUserId(authHeader);

    const params = await this.db.query(
      'SELECT commission_rate FROM parametres LIMIT 1'
    ) as any[];

    const commissionRate = params.length > 0
      ? parseFloat(params[0].commission_rate) / 100
      : 0.25;

    const services = await this.db.query(
      'SELECT * FROM services WHERE id = ?', [body.service_id]
    ) as any[];

    if (services.length === 0) return { error: 'Service introuvable' };

    const service         = services[0];
    const prix            = parseFloat(service.prix);
    const pourboire       = parseFloat(body.pourboire || 0);
    const commissionSalon = +(prix * commissionRate).toFixed(2);
    const netEmploye      = +((prix - commissionSalon) + pourboire).toFixed(2);
    const total           = +(prix + pourboire).toFixed(2);

    let clientId = null;
    if (body.client_nom && body.client_tel) {
      const clients = await this.db.query(
        'SELECT id FROM clients WHERE tel = ?', [body.client_tel]
      ) as any[];

      if (clients.length > 0) {
        clientId = clients[0].id;
      } else {
        const result: any = await this.db.query(
          'INSERT INTO clients (nom, tel) VALUES (?, ?)',
          [body.client_nom, body.client_tel]
        );
        clientId = result.insertId;
      }
    }

    const employe_id = user.role === 'employe' ? user.id : body.employe_id;

    const result: any = await this.db.query(
      `INSERT INTO paiements
        (employe_id, client_id, service_id, prix, pourboire, commission_rate, commission_salon, net_employe, total, methode_paiement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employe_id, clientId, body.service_id,
        prix, pourboire, commissionRate * 100,
        commissionSalon, netEmploye, total,
        body.methode_paiement || 'especes',
      ]
    );

    return {
      message:          'Paiement enregistré ✅',
      paiement_id:      result.insertId,
      prix,
      pourboire,
      commission_salon: commissionSalon,
      net_employe:      netEmploye,
      total,
      commission_rate:  commissionRate * 100,
    };
  }

  // ===== GÉNÉRER PDF =====
  async generatePdf(id: number, authHeader: string, res: Response) {
    this.getUserId(authHeader);

    const paiements = await this.db.query(
      `SELECT p.*,
        e.nom as employe_nom,
        s.nom as service_nom,
        c.nom as client_nom
       FROM paiements p
       JOIN employes e ON e.id = p.employe_id
       JOIN services s ON s.id = p.service_id
       LEFT JOIN clients c ON c.id = p.client_id
       WHERE p.id = ?`,
      [id]
    ) as any[];

    if (paiements.length === 0) {
      res.status(404).json({ error: 'Paiement introuvable' });
      return;
    }

    const p = paiements[0];

    const params = await this.db.query(
      'SELECT * FROM parametres LIMIT 1'
    ) as any[];

    const salon = params.length > 0
      ? params[0]
      : { salon_name: 'PRESTIGE Salon Pro', salon_tel: '', salon_adresse: '' };

    const date     = new Date(p.created_at);
    const dateStr  = date.toLocaleDateString('fr-MA');
    const heureStr = date.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });

    const methodes: any = {
      especes:  'Especes',
      carte:    'Carte bancaire',
      virement: 'Virement',
    };

    // ===== DIMENSIONS =====
    const W     = 226;  // largeur ticket thermique
    const PAD   = 14;   // marge gauche/droite
    const INNER = W - PAD * 2; // largeur utile

    // ===== CALCUL HAUTEUR TOTALE =====
    let H = 20;                    // haut
    H += 18;                       // nom salon
    if (salon.salon_adresse) H += 12;
    if (salon.salon_tel)     H += 12;
    H += 10;                       // ligne
    H += 20;                       // numéro reçu + date
    H += 10;                       // ligne
    H += 60;                       // infos (client, employé, service, méthode)
    H += 10;                       // ligne
    H += 15;                       // prix
    if (parseFloat(p.pourboire) > 0) H += 15;
    H += 15;                       // commission
    H += 10;                       // ligne
    H += 20;                       // net employé
    H += 20;                       // total
    H += 10;                       // ligne
    H += 30;                       // merci
    H += 20;                       // bas

    // ===== CRÉER PDF =====
    const doc = new PDFDocument({
      size:    [W, H],
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=recu-' + String(p.id).padStart(5, '0') + '.pdf'
    );

    doc.pipe(res);

    let y = 16;

    // ===== HELPER FONCTIONS =====
    const line = () => {
      y += 4;
      doc.moveTo(PAD, y).lineTo(W - PAD, y).strokeColor('#cccccc').lineWidth(0.5).stroke();
      y += 6;
    };

    const center = (text: string, size: number, bold = false) => {
      doc
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(size)
        .fillColor('#1a1a1a')
        .text(text, PAD, y, { width: INNER, align: 'center' });
      y += size + 4;
    };

    const row2 = (label: string, value: string, bold = false) => {
      doc.font('Helvetica').fontSize(8).fillColor('#666666').text(label, PAD, y, { width: INNER / 2 });
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor('#1a1a1a')
        .text(value, PAD + INNER / 2, y, { width: INNER / 2, align: 'right' });
      y += 13;
    };

    // ===== CONTENU =====

    // Nom salon
    center(salon.salon_name || 'PRESTIGE Salon Pro', 12, true);

    if (salon.salon_adresse) {
      center(salon.salon_adresse, 7);
    }

    if (salon.salon_tel) {
      center('Tel : ' + salon.salon_tel, 7);
    }

    line();

    // Numéro + date
    center('Recu N° ' + String(p.id).padStart(5, '0'), 8, true);
    center(dateStr + ' a ' + heureStr, 7);

    line();

    // Infos
    row2('Client :', p.client_nom || 'Client comptoir');
    row2('Employe :', p.employe_nom);
    row2('Service :', p.service_nom);
    row2('Methode :', methodes[p.methode_paiement] || p.methode_paiement);

    line();

    // Calculs
    row2('Prix service :', parseFloat(p.prix).toFixed(2) + ' MAD');
    if (parseFloat(p.pourboire) > 0) {
      row2('Pourboire :', '+ ' + parseFloat(p.pourboire).toFixed(2) + ' MAD');
    }
    row2('Commission (' + p.commission_rate + '%) :', '- ' + parseFloat(p.commission_salon).toFixed(2) + ' MAD');

    line();

    // Net employé
    row2('Net employe :', parseFloat(p.net_employe).toFixed(2) + ' MAD', true);

    // Total
    y += 2;
    doc.font('Helvetica').fontSize(8).fillColor('#666666').text('TOTAL ENCAISSE :', PAD, y, { width: INNER / 2 });
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1a1a1a')
      .text(parseFloat(p.total).toFixed(2) + ' MAD', PAD + INNER / 2, y - 2, { width: INNER / 2, align: 'right' });
    y += 18;

    line();

    // Merci
    center('Merci de votre visite !', 8);
    center('PRESTIGE Salon Pro', 7);

    doc.end();
  }

  // ===== SUPPRIMER =====
  async delete(id: number) {
    await this.db.query('DELETE FROM paiements WHERE id=?', [id]);
    return { message: 'Paiement supprimé' };
  }
}
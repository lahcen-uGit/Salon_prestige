import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as jwt from 'jsonwebtoken';

const SECRET = 'prestige_secret_key_2024';

@Injectable()
export class ReservationsService {

  constructor(private db: DatabaseService) {}

  private getUser(authHeader: string): { id: number; role: string } {
    if (!authHeader) throw new UnauthorizedException('Token manquant');
    const token   = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET) as any;
    return { id: decoded.id, role: decoded.role };
  }

  // ===== PGCD =====
  private pgcd(nombres: number[]): number {
    const gcd2 = (a: number, b: number): number => b === 0 ? a : gcd2(b, a % b);
    return nombres.reduce((a, b) => gcd2(a, b));
  }

  // ===== CRÉNEAUX DISPONIBLES =====
  async getCreneaux(date: string, serviceId: number) {

    const params = await this.db.query(
      'SELECT horaire_ouverture, horaire_fermeture FROM parametres LIMIT 1'
    ) as any[];

    if (params.length === 0) {
      return { creneaux: [], message: 'Paramètres introuvables' };
    }

    const ouverture = params[0].horaire_ouverture || '09:00:00';
    const fermeture = params[0].horaire_fermeture || '21:00:00';

    const services = await this.db.query(
      'SELECT duree FROM services WHERE id = ?', [serviceId]
    ) as any[];

    if (services.length === 0) {
      return { creneaux: [], message: 'Service introuvable' };
    }

    const dureeService = parseInt(services[0].duree);

    const toutesLesServices = await this.db.query(
      'SELECT duree FROM services'
    ) as any[];

    const toutesLesDurees = toutesLesServices.map((s: any) => parseInt(s.duree));
    const pas = this.pgcd(toutesLesDurees);

    const reservationsJour = await this.db.query(
      `SELECT r.heure_souhaitee, s.duree
       FROM reservations r
       JOIN services s ON s.id = r.service_id
       WHERE r.date_souhaitee = ?
       AND r.statut IN ('confirmee', 'en_attente')`,
      [date]
    ) as any[];

    const employes = await this.db.query(
      'SELECT id FROM employes WHERE actif = 1'
    ) as any[];

    const nbEmployes = employes.length;

    if (nbEmployes === 0) {
      return { creneaux: [], message: 'Aucun coiffeur disponible' };
    }

    const creneaux: string[] = [];
    const [hOuv, mOuv] = ouverture.split(':').map(Number);
    const [hFer, mFer] = fermeture.split(':').map(Number);

    let minuteActuelle    = hOuv * 60 + mOuv;
    const minuteFermeture = hFer * 60 + mFer;

    while (minuteActuelle + dureeService <= minuteFermeture) {
      const heure    = Math.floor(minuteActuelle / 60).toString().padStart(2, '0');
      const min      = (minuteActuelle % 60).toString().padStart(2, '0');
      const heureStr = `${heure}:${min}`;

      let employesOccupes = 0;
      for (const resv of reservationsJour) {
        const [rH, rM] = resv.heure_souhaitee.split(':').map(Number);
        const debutResv = rH * 60 + rM;
        const finResv   = debutResv + parseInt(resv.duree);
        const finCreno  = minuteActuelle + dureeService;

        if (minuteActuelle < finResv && finCreno > debutResv) {
          employesOccupes++;
        }
      }

      if (employesOccupes < nbEmployes) {
        creneaux.push(heureStr);
      }

      minuteActuelle += pas;
    }

    return {
      creneaux,
      message: creneaux.length === 0
        ? 'Aucun créneau disponible pour ce jour'
        : null
    };
  }

  // ===== LISTE =====
  async findAll(authHeader: string) {
    const user = this.getUser(authHeader);

    if (user.role === 'employe') {
      return this.db.query(
        `SELECT r.*,
          s.nom as service_nom,
          s.prix as service_prix,
          e.nom as employe_nom
         FROM reservations r
         LEFT JOIN services s ON s.id = r.service_id
         LEFT JOIN employes e ON e.id = r.employe_id
         WHERE r.employe_id = ?
         AND r.statut IN ('confirmee', 'realisee')
         ORDER BY r.date_souhaitee ASC, r.heure_souhaitee ASC`,
        [user.id]
      );
    }

    return this.db.query(
      `SELECT r.*,
        s.nom as service_nom,
        s.prix as service_prix,
        e.nom as employe_nom
       FROM reservations r
       LEFT JOIN services s ON s.id = r.service_id
       LEFT JOIN employes e ON e.id = r.employe_id
       ORDER BY r.date_souhaitee ASC, r.heure_souhaitee ASC`
    );
  }

  // ===== CRÉER =====
  async create(body: any) {
    if (!body.nom_client || !body.tel_client || !body.date_souhaitee || !body.heure_souhaitee) {
      return { error: 'Nom, téléphone, date et heure sont obligatoires' };
    }

    const aujourd = new Date().toISOString().split('T')[0];
    if (body.date_souhaitee < aujourd) {
      return { error: 'La date choisie est dans le passé' };
    }

    if (body.service_id) {
      const params = await this.db.query(
        'SELECT horaire_ouverture, horaire_fermeture FROM parametres LIMIT 1'
      ) as any[];

      if (params.length > 0) {
        const services = await this.db.query(
          'SELECT duree FROM services WHERE id = ?', [body.service_id]
        ) as any[];

        if (services.length > 0) {
          const [hOuv, mOuv] = params[0].horaire_ouverture.split(':').map(Number);
          const [hFer, mFer] = params[0].horaire_fermeture.split(':').map(Number);
          const [hH,   mH]   = body.heure_souhaitee.split(':').map(Number);

          const minuteOuv   = hOuv * 60 + mOuv;
          const minuteFer   = hFer * 60 + mFer;
          const minuteHeure = hH   * 60 + mH;
          const duree       = parseInt(services[0].duree);

          if (minuteHeure < minuteOuv || minuteHeure + duree > minuteFer) {
            return { error: 'L\'heure choisie est en dehors des horaires du salon' };
          }
        }
      }
    }

    if (body.service_id) {
      const dispo = await this.getCreneaux(body.date_souhaitee, +body.service_id) as any;
      if (dispo.creneaux && !dispo.creneaux.includes(body.heure_souhaitee)) {
        return { error: 'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.' };
      }
    }

    await this.db.query(
      `INSERT INTO reservations (nom_client, tel_client, service_id, date_souhaitee, heure_souhaitee, statut, notes)
       VALUES (?, ?, ?, ?, ?, 'en_attente', ?)`,
      [
        body.nom_client,
        body.tel_client,
        body.service_id || null,
        body.date_souhaitee,
        body.heure_souhaitee,
        body.notes || null,
      ]
    );

    return { message: 'Réservation envoyée avec succès' };
  }

  // ===== AFFECTER =====
  async affecter(id: number, employe_id: number) {
    await this.db.query(
      `UPDATE reservations SET employe_id=?, statut='confirmee' WHERE id=?`,
      [employe_id, id]
    );

    const reservations = await this.db.query(
      `SELECT r.*, s.nom as service_nom, e.nom as employe_nom
       FROM reservations r
       LEFT JOIN services s ON s.id = r.service_id
       LEFT JOIN employes e ON e.id = r.employe_id
       WHERE r.id = ?`,
      [id]
    ) as any[];

    const r   = reservations[0];
    const msg = `Bonjour ${r.nom_client}, votre réservation pour "${r.service_nom}" le ${r.date_souhaitee} à ${r.heure_souhaitee} est confirmée avec ${r.employe_nom}. À bientôt chez PRESTIGE Salon Pro !`;

    let telClient = r.tel_client.replace(/\D/g, '')
    if (telClient.startsWith('0')) {
      telClient = '212' + telClient.slice(1)
    }

    const whatsappLink = `https://wa.me/${telClient}?text=${encodeURIComponent(msg)}`;

    return { message: 'Réservation confirmée', whatsappLink };
  }

  // ===== CHANGER STATUT =====
  async changerStatut(id: number, statut: string) {
    if (statut === 'en_attente' || statut === 'annulee') {
      await this.db.query(
        'UPDATE reservations SET statut=?, employe_id=NULL WHERE id=?',
        [statut, id]
      );
    } else {
      await this.db.query(
        'UPDATE reservations SET statut=? WHERE id=?',
        [statut, id]
      );
    }
    return { message: 'Statut mis à jour' };
  }

  // ===== ENCAISSER =====
  async encaisser(id: number, body: any, authHeader: string) {
    const user = this.getUser(authHeader);

    const reservations = await this.db.query(
      'SELECT * FROM reservations WHERE id = ?', [id]
    ) as any[];

    if (reservations.length === 0) return { error: 'Réservation introuvable' };
    const r = reservations[0];

    const services = await this.db.query(
      'SELECT * FROM services WHERE id = ?', [r.service_id]
    ) as any[];

    if (services.length === 0) return { error: 'Service introuvable' };
    const service = services[0];

    const params = await this.db.query(
      'SELECT commission_rate FROM parametres LIMIT 1'
    ) as any[];

    const commissionRate  = params.length > 0 ? parseFloat(params[0].commission_rate) / 100 : 0.25;
    const prix            = parseFloat(service.prix);
    const pourboire       = parseFloat(body.pourboire || 0);
    const commissionSalon = +(prix * commissionRate).toFixed(2);
    const netEmploye      = +((prix - commissionSalon) + pourboire).toFixed(2);
    const total           = +(prix + pourboire).toFixed(2);

    let clientId = null;
    const clients = await this.db.query(
      'SELECT id FROM clients WHERE tel = ?', [r.tel_client]
    ) as any[];

    if (clients.length > 0) {
      clientId = clients[0].id;
    } else {
      const result: any = await this.db.query(
        'INSERT INTO clients (nom, tel) VALUES (?, ?)',
        [r.nom_client, r.tel_client]
      );
      clientId = result.insertId;
    }

    // Insérer paiement et récupérer l'id
    const paiementResult: any = await this.db.query(
      `INSERT INTO paiements
        (employe_id, client_id, service_id, prix, pourboire, commission_rate, commission_salon, net_employe, total, methode_paiement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, clientId, r.service_id, prix, pourboire, commissionRate * 100, commissionSalon, netEmploye, total, body.methode_paiement || 'especes']
    );

    await this.db.query(
      "UPDATE reservations SET statut='realisee' WHERE id=?", [id]
    );

    return {
      message:     'Encaissement réussi ✅',
      paiement_id: paiementResult.insertId, // ← retourner l'id du paiement
      total,
      netEmploye,
    };
  }

  // ===== SUPPRIMER =====
  async delete(id: number) {
    await this.db.query('DELETE FROM reservations WHERE id=?', [id]);
    return { message: 'Réservation supprimée' };
  }
}
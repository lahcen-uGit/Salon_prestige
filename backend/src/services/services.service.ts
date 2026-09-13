import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ServicesService {

  constructor(private db: DatabaseService) {}

  // Liste tous les services
  async findAll() {
    return this.db.query(
      'SELECT * FROM services ORDER BY categorie ASC, nom ASC'
    );
  }

  // Ajouter un service
  async create(body: any) {
    if (!body.nom || !body.prix || !body.duree) {
      return { error: 'Nom, prix et durée sont obligatoires' };
    }

    await this.db.query(
      `INSERT INTO services (nom, categorie, prix, duree, description)
       VALUES (?, ?, ?, ?, ?)`,
      [body.nom, body.categorie, body.prix, body.duree, body.description || null]
    );

    return { message: 'Service ajouté avec succès' };
  }

  // Modifier un service
  async update(id: number, body: any) {
    await this.db.query(
      `UPDATE services SET nom=?, categorie=?, prix=?, duree=?, description=?
       WHERE id=?`,
      [body.nom, body.categorie, body.prix, body.duree, body.description || null, id]
    );

    return { message: 'Service modifié avec succès' };
  }

  // Supprimer un service
  async delete(id: number) {
    await this.db.query(
      'DELETE FROM services WHERE id=?', [id]
    );
    return { message: 'Service supprimé' };
  }
}
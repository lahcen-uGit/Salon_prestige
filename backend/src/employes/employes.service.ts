import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmployesService {

  constructor(private db: DatabaseService) {}

  async findAll() {
    return this.db.query(
      'SELECT id, nom, actif, created_at FROM employes ORDER BY nom ASC'
    );
  }

  async findActifs() {
    return this.db.query(
      'SELECT id, nom FROM employes WHERE actif = 1 ORDER BY nom ASC'
    );
  }

  async create(body: any) {
    if (!body.nom) {
      return { error: 'Le nom est obligatoire' };
    }

    if (!body.code_pin || body.code_pin.length !== 6) {
      return { error: 'Le code PIN doit contenir 6 chiffres' };
    }

    // Vérifier que le PIN n'est pas déjà utilisé
    const tousLesEmployes = await this.db.query(
      'SELECT id, code_pin FROM employes'
    ) as any[];

    for (const emp of tousLesEmployes) {
      const dejaPris = await bcrypt.compare(body.code_pin, emp.code_pin);
      if (dejaPris) {
        return { error: 'Ce code PIN est déjà utilisé par un autre employé' };
      }
    }

    const hashedPin = await bcrypt.hash(body.code_pin, 10);

    await this.db.query(
      'INSERT INTO employes (nom, code_pin, actif) VALUES (?, ?, 1)',
      [body.nom, hashedPin]
    );

    return { message: 'Employé ajouté avec succès' };
  }

  async update(id: number, body: any) {

    if (!body.nom) {
      return { error: 'Le nom est obligatoire' };
    }

    if (body.code_pin) {
      if (body.code_pin.length !== 6) {
        return { error: 'Le code PIN doit contenir 6 chiffres' };
      }

      // Vérifier que le PIN n'est pas déjà utilisé par un AUTRE employé
      const tousLesEmployes = await this.db.query(
        'SELECT id, code_pin FROM employes WHERE id != ?', [id]
      ) as any[];

      for (const emp of tousLesEmployes) {
        const dejaPris = await bcrypt.compare(body.code_pin, emp.code_pin);
        if (dejaPris) {
          return { error: 'Ce code PIN est déjà utilisé par un autre employé' };
        }
      }

      const hashedPin = await bcrypt.hash(body.code_pin, 10);
      await this.db.query(
        'UPDATE employes SET nom=?, code_pin=?, actif=? WHERE id=?',
        [body.nom, hashedPin, body.actif, id]
      );
    } else {
      await this.db.query(
        'UPDATE employes SET nom=?, actif=? WHERE id=?',
        [body.nom, body.actif, id]
      );
    }

    return { message: 'Employé modifié avec succès' };
  }

  async delete(id: number) {
    await this.db.query(
      'DELETE FROM employes WHERE id=?', [id]
    );
    return { message: 'Employé supprimé' };
  }
}
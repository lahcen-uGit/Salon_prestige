import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {

  constructor(
    private db:  DatabaseService,
    private jwt: JwtService,
  ) {}

  // ===== LOGIN ADMIN =====
  async loginAdmin(email: string, password: string) {
    const admins = await this.db.query(
      'SELECT * FROM admins WHERE email = ?', [email]
    ) as any[];

    if (admins.length === 0) {
      return { error: 'Email introuvable' };
    }

    const admin   = admins[0];
    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return { error: 'Mot de passe incorrect' };
    }

    const token = this.jwt.sign({ id: admin.id, role: 'admin' });

    return {
      token,
      role:       'admin',
      nom:        admin.nom,
      salon_name: admin.salon_name,
    };
  }

  // ===== LOGIN EMPLOYÉ =====
  async loginEmploye(code_pin: string) {
    const employes = await this.db.query(
      'SELECT * FROM employes WHERE actif = 1'
    ) as any[];

    let employe = null;
    for (const emp of employes) {
      const isValid = await bcrypt.compare(code_pin, emp.code_pin);
      if (isValid) { employe = emp; break; }
    }

    if (!employe) {
      return { error: 'Code PIN incorrect' };
    }

    const token = this.jwt.sign({ id: employe.id, role: 'employe' });

    return {
      token,
      role:       'employe',
      nom:        employe.nom,
      employe_id: employe.id,
    };
  }

  // ===== REGISTER ADMIN =====
  async registerAdmin(nom: string, email: string, password: string, salon_name: string) {
    const existing = await this.db.query(
      'SELECT id FROM admins WHERE email = ?', [email]
    ) as any[];

    if (existing.length > 0) {
      return { error: 'Email déjà utilisé' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.db.query(
      'INSERT INTO admins (nom, email, password, salon_name) VALUES (?, ?, ?, ?)',
      [nom, email, hashedPassword, salon_name]
    );

    return { message: 'Compte admin créé avec succès' };
  }

  // ===== LISTE ADMINS =====
  async getAdmins() {
    return this.db.query(
      'SELECT id, nom, email, salon_name, created_at FROM admins ORDER BY created_at ASC'
    );
  }

  // ===== MODIFIER MON COMPTE =====
  async updateAdmin(body: any, authHeader: string) {
    const token   = authHeader.replace('Bearer ', '');
    const decoded = this.jwt.verify(token) as any;
    const adminId = decoded.id;

    // Vérifier email unique
    const existing = await this.db.query(
      'SELECT id FROM admins WHERE email = ? AND id != ?',
      [body.email, adminId]
    ) as any[];

    if (existing.length > 0) {
      return { error: 'Cet email est déjà utilisé' };
    }

    // Changer le mot de passe si demandé
    if (body.nouveau_password) {
      if (!body.ancien_password) {
        return { error: 'Entrez votre ancien mot de passe' };
      }

      const admins = await this.db.query(
        'SELECT password FROM admins WHERE id = ?', [adminId]
      ) as any[];

      const isValid = await bcrypt.compare(body.ancien_password, admins[0].password);
      if (!isValid) {
        return { error: 'Ancien mot de passe incorrect' };
      }

      const hashed = await bcrypt.hash(body.nouveau_password, 10);
      await this.db.query(
        'UPDATE admins SET nom=?, email=?, password=? WHERE id=?',
        [body.nom, body.email, hashed, adminId]
      );
    } else {
      await this.db.query(
        'UPDATE admins SET nom=?, email=? WHERE id=?',
        [body.nom, body.email, adminId]
      );
    }

    return { message: 'Compte mis à jour ' };
  }

  // ===== SUPPRIMER ADMIN =====
  async deleteAdmin(id: number) {
    await this.db.query('DELETE FROM admins WHERE id=?', [id]);
    return { message: 'Admin supprimé' };
  }
}
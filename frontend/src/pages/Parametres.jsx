import { useState, useEffect } from 'react'
import '../styles/Parametres.css'

const villes = [
  'Casablanca','Rabat','Marrakech','Fès','Tanger',
  'Agadir','Meknès','Oujda','Kenitra','Tétouan','Autre'
]

function Parametres() {

  const [loading,  setLoading]  = useState(true)
  const [success,  setSuccess]  = useState('')
  const [error,    setError]    = useState('')

  // ===== FORMULAIRE SALON =====
  const [form, setForm] = useState({
    commission_rate:   25,
    horaire_ouverture: '09:00',
    horaire_fermeture: '21:00',
    salon_name:        '',
    salon_tel:         '',
    salon_adresse:     '',
  })

  // ===== FORMULAIRE MON COMPTE =====
  const [formCompte, setFormCompte] = useState({
    nom:              '',
    email:            '',
    ancien_password:  '',
    nouveau_password: '',
  })

  // ===== FORMULAIRE NOUVEL ADMIN =====
  const [formAdmin, setFormAdmin] = useState({
    nom:      '',
    email:    '',
    password: '',
  })

  // ===== LISTE ADMINS =====
  const [admins, setAdmins] = useState([])

  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchParametres()
    fetchAdmins()
  }, [])

  // ===== FETCH PARAMÈTRES =====
  const fetchParametres = async () => {
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/parametres', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setForm({
        commission_rate:   data.commission_rate   || 25,
        horaire_ouverture: data.horaire_ouverture || '09:00',
        horaire_fermeture: data.horaire_fermeture || '21:00',
        salon_name:        data.salon_name        || '',
        salon_tel:         data.salon_tel         || '',
        salon_adresse:     data.salon_adresse     || '',
      })
    } catch {}
    setLoading(false)
  }

  // ===== FETCH ADMINS =====
  const fetchAdmins = async () => {
    try {
      const res  = await fetch('http://localhost:3000/auth/admins', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setAdmins(data)

      // Pré-remplir le formulaire mon compte
      if (data.length > 0) {
        const moi = data[0] // le premier admin connecté
        setFormCompte(f => ({
          ...f,
          nom:   moi.nom   || '',
          email: moi.email || '',
        }))
      }
    } catch {}
  }

  // ===== ENREGISTRER PARAMÈTRES SALON =====
  const enregistrerSalon = async () => {
    setError(''); setSuccess('')
    if (form.commission_rate < 0 || form.commission_rate > 100) {
      setError('Le taux de commission doit être entre 0 et 100')
      return
    }
    try {
      const res  = await fetch('http://localhost:3000/parametres', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form)
      })
      const data = await res.json()
      if (data.error) { setError(data.error) }
      else { setSuccess('Paramètres du salon enregistrés ✅') }
    } catch {
      setError('Erreur de connexion')
    }
  }

  // ===== MODIFIER MON COMPTE =====
  const modifierCompte = async () => {
    setError(''); setSuccess('')
    if (!formCompte.nom || !formCompte.email) {
      setError('Nom et email sont obligatoires')
      return
    }
    try {
      const res  = await fetch('http://localhost:3000/auth/update-admin', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(formCompte)
      })
      const data = await res.json()
      if (data.error) { setError(data.error) }
      else {
        setSuccess('Compte mis à jour ✅')
        // Mettre à jour localStorage
        localStorage.setItem('nom', formCompte.nom)
        setFormCompte(f => ({ ...f, ancien_password: '', nouveau_password: '' }))
        fetchAdmins()
      }
    } catch {
      setError('Erreur de connexion')
    }
  }

  // ===== AJOUTER UN ADMIN =====
  const ajouterAdmin = async () => {
    setError(''); setSuccess('')
    if (!formAdmin.nom || !formAdmin.email || !formAdmin.password) {
      setError('Tous les champs sont obligatoires pour créer un admin')
      return
    }
    try {
      const res  = await fetch('http://localhost:3000/auth/register-admin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(formAdmin)
      })
      const data = await res.json()
      if (data.error) { setError(data.error) }
      else {
        setSuccess('Nouveau compte admin créé ✅')
        setFormAdmin({ nom: '', email: '', password: '' })
        fetchAdmins()
      }
    } catch {
      setError('Erreur de connexion')
    }
  }

  // ===== SUPPRIMER ADMIN =====
  const supprimerAdmin = async (id) => {
    if (!window.confirm('Supprimer ce compte admin ?')) return
    try {
      await fetch(`http://localhost:3000/auth/admins/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAdmins()
    } catch {}
  }

  if (loading) return (
    <div className="empty" style={{ marginTop: 60 }}>
      <div className="empty-icon"><span className="material-symbols-outlined">hourglass_empty</span></div>
      <div className="empty-text">Chargement...</div>
    </div>
  )

  return (
    <div className="page-wrap">

      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <div className="page-h1"><span className="material-symbols-outlined">settings</span> Paramètres</div>
          <div className="page-desc">Réglages globaux du salon et gestion des comptes</div>
        </div>
      </div>

      {/* ===== MESSAGES ===== */}
      {error   && <div className="param-error   mb-14">{error}</div>}
      {success && <div className="param-success mb-14">{success}</div>}

      {/* ===== SECTION SALON ===== */}
      <div className="card mb-14">
        <div className="card-header">
          <div className="card-title"><span className="material-symbols-outlined">store</span> Informations du salon</div>
        </div>
        <div className="card-body">

          <div className="form-group mb-14">
            <label className="form-label">Nom du salon</label>
            <input className="form-input" placeholder="PRESTIGE Salon Pro"
              value={form.salon_name}
              onChange={e => setForm({ ...form, salon_name: e.target.value })} />
          </div>

          <div className="form-grid form-grid-2 mb-14">
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input className="form-input" placeholder="0612345678"
                value={form.salon_tel}
                onChange={e => setForm({ ...form, salon_tel: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Adresse</label>
              <input className="form-input" placeholder="Ex : Hay Riad, Rabat"
                value={form.salon_adresse}
                onChange={e => setForm({ ...form, salon_adresse: e.target.value })} />
            </div>
          </div>

          <button className="btn btn-primary" onClick={enregistrerSalon}>
            <span className="material-symbols-outlined">save</span> Enregistrer les informations
          </button>

        </div>
      </div>

      {/* ===== SECTION COMMISSION ===== */}
      <div className="card mb-14">
        <div className="card-header">
          <div className="card-title"><span className="material-symbols-outlined">payments</span> Commission salon</div>
        </div>
        <div className="card-body">

          <div className="form-group mb-14">
            <label className="form-label">Taux de commission (%)</label>
            <input className="form-input param-input-sm" type="number"
              min="0" max="100"
              value={form.commission_rate}
              onChange={e => setForm({ ...form, commission_rate: e.target.value })} />
          </div>

          {/* Aperçu calcul */}
          <div className="param-preview mb-14">
            <div className="preview-title">Aperçu pour un service à 100 MAD</div>
            <div className="preview-row">
              <span>Prix service</span>
              <span className="text-mono">100.00 MAD</span>
            </div>
            <div className="preview-row text-danger">
              <span>Commission salon ({form.commission_rate}%)</span>
              <span className="text-mono">— {(100 * form.commission_rate / 100).toFixed(2)} MAD</span>
            </div>
            <div className="preview-divider"></div>
            <div className="preview-row fw-bold">
              <span>Net employé</span>
              <span className="text-mono text-gold">{(100 - (100 * form.commission_rate / 100)).toFixed(2)} MAD</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={enregistrerSalon}>
            <span className="material-symbols-outlined">save</span> Enregistrer la commission
          </button>

        </div>
      </div>

      {/* ===== SECTION HORAIRES ===== */}
      <div className="card mb-14">
        <div className="card-header">
          <div className="card-title"><span className="material-symbols-outlined">schedule</span> Horaires d'ouverture</div>
        </div>
        <div className="card-body">

          <div className="form-grid form-grid-2 mb-14">
            <div className="form-group">
              <label className="form-label">Ouverture</label>
              <input className="form-input" type="time"
                value={form.horaire_ouverture}
                onChange={e => setForm({ ...form, horaire_ouverture: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Fermeture</label>
              <input className="form-input" type="time"
                value={form.horaire_fermeture}
                onChange={e => setForm({ ...form, horaire_fermeture: e.target.value })} />
            </div>
          </div>

          <button className="btn btn-primary" onClick={enregistrerSalon}>
            <span className="material-symbols-outlined">save</span> Enregistrer les horaires
          </button>

        </div>
      </div>

      {/* ===== SECTION MON COMPTE ===== */}
      <div className="card mb-14">
        <div className="card-header">
          <div className="card-title"><span className="material-symbols-outlined">person</span> Mon compte admin</div>
        </div>
        <div className="card-body">

          <div className="form-grid form-grid-2 mb-14">
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input className="form-input" placeholder="Nom complet"
                value={formCompte.nom}
                onChange={e => setFormCompte({ ...formCompte, nom: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="email@prestige.ma"
                value={formCompte.email}
                onChange={e => setFormCompte({ ...formCompte, email: e.target.value })} />
            </div>
          </div>

          <div className="form-grid form-grid-2 mb-14">
            <div className="form-group">
              <label className="form-label">Ancien mot de passe</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={formCompte.ancien_password}
                onChange={e => setFormCompte({ ...formCompte, ancien_password: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Nouveau mot de passe (optionnel)</label>
              <input className="form-input" type="password" placeholder="Laisser vide pour ne pas changer"
                value={formCompte.nouveau_password}
                onChange={e => setFormCompte({ ...formCompte, nouveau_password: e.target.value })} />
            </div>
          </div>

          <button className="btn btn-primary" onClick={modifierCompte}>
            <span className="material-symbols-outlined">save</span> Mettre à jour mon compte
          </button>

        </div>
      </div>

      {/* ===== SECTION ADMINS ===== */}
      <div className="card mb-14">
        <div className="card-header">
          <div className="card-title"><span className="material-symbols-outlined">workspace_premium</span> Comptes administrateurs</div>
        </div>
        <div className="card-body">

          {/* Liste admins */}
          {admins.length > 0 && (
            <div className="table-wrap mb-14">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Créé le</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a.id}>
                      <td><div className="td-main">{a.nom}</div></td>
                      <td className="text-sm text-muted">{a.email}</td>
                      <td className="text-sm text-muted">
                        {new Date(a.created_at).toLocaleDateString('fr-MA')}
                      </td>
                      <td>
                        {admins.length > 1 && (
                          <button className="btn btn-danger btn-xs"
                            onClick={() => supprimerAdmin(a.id)}>
                            <span className="material-symbols-outlined">delete</span> Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Ajouter nouvel admin */}
          <div style={{ borderTop: '1px solid var(--admin-line)', paddingTop: 16 }}>
            <div className="card-title mb-14" style={{ fontSize: 13 }}>
              <span className="material-symbols-outlined">add</span> Ajouter un nouveau compte admin
            </div>
            <div className="form-grid form-grid-3 mb-14">
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input className="form-input" placeholder="Nom complet"
                  value={formAdmin.nom}
                  onChange={e => setFormAdmin({ ...formAdmin, nom: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="email@prestige.ma"
                  value={formAdmin.email}
                  onChange={e => setFormAdmin({ ...formAdmin, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Mot de passe *</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={formAdmin.password}
                  onChange={e => setFormAdmin({ ...formAdmin, password: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={ajouterAdmin}>
              <span className="material-symbols-outlined">workspace_premium</span> Créer le compte admin
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Parametres
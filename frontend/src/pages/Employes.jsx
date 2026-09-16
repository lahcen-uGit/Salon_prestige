import { useState, useEffect } from 'react'
import '../styles/Employes.css'

function Employes() {

  // ===== DONNÉES =====
  const [employes,   setEmployes]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editEmp,    setEditEmp]    = useState(null)
  const [error,      setError]      = useState('')
  const [form, setForm] = useState({
    nom:      '',
    code_pin: '',
    actif:    1,
  })

  const token = localStorage.getItem('token')

  useEffect(() => { fetchEmployes() }, [])

  // ===== FETCH =====

  const fetchEmployes = async () => {
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/employes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setEmployes(data)
    } catch {
      setError('Erreur de connexion')
    }
    setLoading(false)
  }

  // ===== MODAL =====

  const ouvrirModal = (emp = null) => {
    setEditEmp(emp)
    setForm(emp ? {
      nom:      emp.nom,
      code_pin: '', // on ne montre pas le PIN existant
      actif:    emp.actif,
    } : {
      nom:      '',
      code_pin: '',
      actif:    1,
    })
    setError('')
    setModalOpen(true)
  }

  const fermerModal = () => { setModalOpen(false); setEditEmp(null) }

  // ===== ENREGISTRER =====

  const enregistrerEmploye = async () => {
    if (!form.nom) { setError('Le nom est obligatoire'); return }
    if (!editEmp && !form.code_pin) { setError('Le code PIN est obligatoire'); return }
    if (form.code_pin && form.code_pin.length !== 6) {
      setError('Le code PIN doit contenir exactement 6 chiffres')
      return
    }

    const url    = editEmp
      ? `http://localhost:3000/employes/${editEmp.id}`
      : 'http://localhost:3000/employes'
    const method = editEmp ? 'PUT' : 'POST'

    try {
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        fermerModal()
        fetchEmployes()
      }
    } catch {
      setError('Erreur lors de l\'enregistrement')
    }
  }

  const supprimerEmploye = async (id) => {
    if (!window.confirm('Supprimer cet employé ?')) return
    await fetch(`http://localhost:3000/employes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchEmployes()
  }

  // ===== KPIs =====
  const totalEmployes = employes.length
  const totalActifs   = employes.filter(e => e.actif === 1).length
  const totalInactifs = employes.filter(e => e.actif === 0).length

  return (
    <div className="page-wrap">

      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <div className="page-h1"><span className="material-symbols-outlined">content_cut</span> Employés</div>
          <div className="page-desc">Gérez l'équipe du salon</div>
        </div>
        <button className="btn btn-primary" onClick={() => ouvrirModal()}>
          <span className="material-symbols-outlined">add</span> Nouvel employé
        </button>
      </div>

      {/* ===== KPIs ===== */}
      <div className="kpi-grid kpi-3">
        <div className="kpi" style={{ '--kpi-color': '#3C7A57' }}>
          <div className="kpi-label">Total employés</div>
          <div className="kpi-value">{totalEmployes}</div>
          <div className="kpi-sub">membres de l'équipe</div>
        </div>
        <div className="kpi" style={{ '--kpi-color': '#3C7A57' }}>
          <div className="kpi-label">Actifs</div>
          <div className="kpi-value">{totalActifs}</div>
          <div className="kpi-sub">peuvent se connecter</div>
        </div>
        <div className="kpi" style={{ '--kpi-color': '#A8402F' }}>
          <div className="kpi-label">Inactifs</div>
          <div className="kpi-value">{totalInactifs}</div>
          <div className="kpi-sub">accès désactivé</div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Liste des employés</div>
        </div>
        <div className="card-body table-pad">
          {loading ? (
            <div className="empty">
              <div className="empty-icon"><span className="material-symbols-outlined">hourglass_empty</span></div>
              <div className="empty-text">Chargement...</div>
            </div>
          ) : employes.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><span className="material-symbols-outlined">content_cut</span></div>
              <div className="empty-text">Aucun employé pour l'instant</div>
              <div className="empty-sub">Ajoutez votre premier employé</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Statut</th>
                    <th>Depuis</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employes.map(e => (
                    <tr key={e.id}>
                      <td>
                        <div className="td-main">{e.nom}</div>
                      </td>
                      <td>
                        {e.actif === 1
                          ? <span className="badge badge-ok"><span className="material-symbols-outlined">check</span> Actif</span>
                          : <span className="badge badge-muted">Inactif</span>
                        }
                      </td>
                      <td className="text-muted text-sm">
                        {new Date(e.created_at).toLocaleDateString('fr-MA')}
                      </td>
                      <td>
                        <div className="flex gap-8">
                          <button className="btn btn-outline btn-xs"
                            onClick={() => ouvrirModal(e)}><span className="material-symbols-outlined">edit</span> Modifier</button>
                          <button className="btn btn-danger btn-xs"
                            onClick={() => supprimerEmploye(e.id)}><span className="material-symbols-outlined">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {modalOpen && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {editEmp ? <><span className="material-symbols-outlined">edit</span> Modifier employé</> : <><span className="material-symbols-outlined">content_cut</span> Nouvel employé</>}
              </div>
              <button className="modal-close" onClick={fermerModal}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="modal-body">

              {error && <div className="emp-error mb-14">{error}</div>}

              {/* Nom */}
              <div className="form-group mb-14">
                <label className="form-label">Nom complet *</label>
                <input className="form-input" placeholder="Ex : Ahmed Benali"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })} />
              </div>

              {/* Code PIN */}
              <div className="form-group mb-14">
                <label className="form-label">
                  Code PIN (6 chiffres) {editEmp && '— laisser vide pour ne pas changer'}
                </label>
                <input className="form-input" type="password"
                  placeholder="••••••"
                  maxLength={6}
                  value={form.code_pin}
                  onChange={e => setForm({ ...form, code_pin: e.target.value.replace(/\D/g, '') })} />
              </div>

              {/* Statut — seulement en modification */}
              {editEmp && (
                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select className="form-select"
                    value={form.actif}
                    onChange={e => setForm({ ...form, actif: parseInt(e.target.value) })}>
                    <option value={1}>Actif</option>
                    <option value={0}>Inactif</option>
                  </select>
                </div>
              )}

            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={fermerModal}>Annuler</button>
              <button className="btn btn-primary" onClick={enregistrerEmploye}>
                <span className="material-symbols-outlined">check_circle</span> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Employes
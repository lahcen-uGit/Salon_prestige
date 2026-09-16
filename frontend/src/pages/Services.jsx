import { useState, useEffect } from 'react'
import '../styles/Services.css'

const categories = ['homme', 'femme', 'mixte']

function Services() {

  // ===== DONNÉES =====
  const [services,  setServices]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editSrv,   setEditSrv]   = useState(null)
  const [error,     setError]     = useState('')
  const [form, setForm] = useState({
    nom:         '',
    categorie:   'homme',
    prix:        '',
    duree:       '',
    description: '',
  })

  const token = localStorage.getItem('token')

  useEffect(() => { fetchServices() }, [])

  // ===== FETCH =====

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/services', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setServices(data)
    } catch {
      setError('Erreur de connexion')
    }
    setLoading(false)
  }

  // ===== MODAL =====

  const ouvrirModal = (srv = null) => {
    setEditSrv(srv)
    setForm(srv ? {
      nom:         srv.nom,
      categorie:   srv.categorie,
      prix:        srv.prix,
      duree:       srv.duree,
      description: srv.description || '',
    } : {
      nom:         '',
      categorie:   'homme',
      prix:        '',
      duree:       '',
      description: '',
    })
    setError('')
    setModalOpen(true)
  }

  const fermerModal = () => { setModalOpen(false); setEditSrv(null) }

  // ===== ENREGISTRER =====

  const enregistrerService = async () => {
    if (!form.nom || !form.prix || !form.duree) {
      setError('Nom, prix et durée sont obligatoires')
      return
    }

    const url    = editSrv
      ? `http://localhost:3000/services/${editSrv.id}`
      : 'http://localhost:3000/services'
    const method = editSrv ? 'PUT' : 'POST'

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
        fetchServices()
      }
    } catch {
      setError('Erreur lors de l\'enregistrement')
    }
  }

  const supprimerService = async (id) => {
    if (!window.confirm('Supprimer ce service ?')) return
    await fetch(`http://localhost:3000/services/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchServices()
  }

  // ===== BADGE CATEGORIE =====
  const badgeCategorie = (cat) => {
    if (cat === 'homme') return <span className="badge badge-homme">♂ Homme</span>
    if (cat === 'femme') return <span className="badge badge-femme">♀ Femme</span>
    return <span className="badge badge-muted">⚥ Mixte</span>
  }

  // ===== KPIs =====
  const totalServices = services.length
  const totalHomme    = services.filter(s => s.categorie === 'homme').length
  const totalFemme    = services.filter(s => s.categorie === 'femme').length
  const totalMixte    = services.filter(s => s.categorie === 'mixte').length

  return (
    <div className="page-wrap">

      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <div className="page-h1"><span className="material-symbols-outlined">room_service</span> Services</div>
          <div className="page-desc">Catalogue des prestations du salon</div>
        </div>
        <button className="btn btn-primary" onClick={() => ouvrirModal()}>
          <span className="material-symbols-outlined">add</span> Nouveau service
        </button>
      </div>

      {/* ===== KPIs ===== */}
      <div className="kpi-grid kpi-4">
        <div className="kpi" style={{ '--kpi-color': '#5B2333' }}>
          <div className="kpi-label">Total services</div>
          <div className="kpi-value">{totalServices}</div>
          <div className="kpi-sub">prestations</div>
        </div>
        <div className="kpi" style={{ '--kpi-color': '#1565c0' }}>
          <div className="kpi-label">Homme</div>
          <div className="kpi-value">{totalHomme}</div>
          <div className="kpi-sub">services homme</div>
        </div>
        <div className="kpi" style={{ '--kpi-color': '#B9812F' }}>
          <div className="kpi-label">Femme</div>
          <div className="kpi-value">{totalFemme}</div>
          <div className="kpi-sub">services femme</div>
        </div>
        <div className="kpi" style={{ '--kpi-color': '#3C7A57' }}>
          <div className="kpi-label">Mixte</div>
          <div className="kpi-value">{totalMixte}</div>
          <div className="kpi-sub">services mixtes</div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Liste des services</div>
        </div>
        <div className="card-body table-pad">
          {loading ? (
            <div className="empty">
              <div className="empty-icon"><span className="material-symbols-outlined">hourglass_empty</span></div>
              <div className="empty-text">Chargement...</div>
            </div>
          ) : services.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><span className="material-symbols-outlined">room_service</span></div>
              <div className="empty-text">Aucun service pour l'instant</div>
              <div className="empty-sub">Ajoutez votre premier service</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Durée</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="td-main">{s.nom}</div>
                        {s.description && (
                          <div className="td-sub">{s.description}</div>
                        )}
                      </td>
                      <td>{badgeCategorie(s.categorie)}</td>
                      <td>
                        <span className="text-mono text-gold fw-bold">
                          {parseFloat(s.prix).toFixed(2)} MAD
                        </span>
                      </td>
                      <td className="text-muted text-sm">{s.duree} min</td>
                      <td>
                        <div className="flex gap-8">
                          <button className="btn btn-outline btn-xs"
                            onClick={() => ouvrirModal(s)}><span className="material-symbols-outlined">edit</span> Modifier</button>
                          <button className="btn btn-danger btn-xs"
                            onClick={() => supprimerService(s.id)}><span className="material-symbols-outlined">delete</span></button>
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
                {editSrv ? <><span className="material-symbols-outlined">edit</span> Modifier service</> : <><span className="material-symbols-outlined">room_service</span> Nouveau service</>}
              </div>
              <button className="modal-close" onClick={fermerModal}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="modal-body">

              {error && <div className="srv-error mb-14">{error}</div>}

              {/* Nom */}
              <div className="form-group mb-14">
                <label className="form-label">Nom du service *</label>
                <input className="form-input" placeholder="Ex : Coupe Classique"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })} />
              </div>

              {/* Catégorie */}
              <div className="form-group mb-14">
                <label className="form-label">Catégorie *</label>
                <select className="form-select"
                  value={form.categorie}
                  onChange={e => setForm({ ...form, categorie: e.target.value })}>
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c === 'homme' ? '♂ Homme' : c === 'femme' ? '♀ Femme' : '⚥ Mixte'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prix + Durée */}
              <div className="form-grid form-grid-2 mb-14">
                <div className="form-group">
                  <label className="form-label">Prix (MAD) *</label>
                  <input className="form-input" type="number" min="0"
                    placeholder="0.00"
                    value={form.prix}
                    onChange={e => setForm({ ...form, prix: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Durée (minutes) *</label>
                  <input className="form-input" type="number" min="0"
                    placeholder="30"
                    value={form.duree}
                    onChange={e => setForm({ ...form, duree: e.target.value })} />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description (optionnel)</label>
                <textarea className="form-textarea"
                  placeholder="Description du service..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={fermerModal}>Annuler</button>
              <button className="btn btn-primary" onClick={enregistrerService}>
                <span className="material-symbols-outlined">check_circle</span> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Services
import { useState, useEffect } from 'react'
import '../styles/Paiements.css'

function Paiements() {

  const [paiements,     setPaiements]     = useState([])
  const [employes,      setEmployes]      = useState([])
  const [services,      setServices]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [filtreEmploye, setFiltreEmploye] = useState('')
  const [filtreService, setFiltreService] = useState('')
  const [filtreDate,    setFiltreDate]    = useState('')

  const token = localStorage.getItem('token')
  const role  = localStorage.getItem('role')

  useEffect(() => {
    fetchPaiements()
    if (role === 'admin') {
      fetchEmployes()
      fetchServices()
    }
  }, [])

  const fetchPaiements = async () => {
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/caisse', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPaiements(await res.json())
    } catch {}
    setLoading(false)
  }

  const fetchEmployes = async () => {
    try {
      const res  = await fetch('http://localhost:3000/employes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEmployes(await res.json())
    } catch {}
  }

  const fetchServices = async () => {
    try {
      const res  = await fetch('http://localhost:3000/services', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setServices(await res.json())
    } catch {}
  }

  const supprimerPaiement = async (id) => {
    if (!window.confirm('Supprimer ce paiement ?')) return
    await fetch(`http://localhost:3000/caisse/${id}`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchPaiements()
  }

  // ===== FILTRES =====
  const paiementsFiltres = paiements.filter(p => {
    if (filtreEmploye && p.employe_id !== parseInt(filtreEmploye)) return false
    if (filtreService && p.service_id !== parseInt(filtreService)) return false
    if (filtreDate) {
      const dateP = new Date(p.created_at).toISOString().split('T')[0]
      if (dateP !== filtreDate) return false
    }
    return true
  })

  const fmtDate = (d) => d ? new Date(d).toLocaleString('fr-MA') : '—'

  // ===== KPIs =====
  const totalCA         = paiementsFiltres.reduce((s, p) => s + parseFloat(p.total             || 0), 0)
  const totalCommission = paiementsFiltres.reduce((s, p) => s + parseFloat(p.commission_salon   || 0), 0)
  const totalNet        = paiementsFiltres.reduce((s, p) => s + parseFloat(p.net_employe        || 0), 0)
  const totalPourboire  = paiementsFiltres.reduce((s, p) => s + parseFloat(p.pourboire          || 0), 0)

  return (
    <div className="page-wrap">

      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <div className="page-h1">
            {role === 'admin' ? <><span className="material-symbols-outlined">credit_card</span> Paiements</> : <><span className="material-symbols-outlined">receipt</span> Mon historique</>}
          </div>
          <div className="page-desc">
            {role === 'admin'
              ? 'Historique complet des encaissements'
              : 'Vos paiements enregistrés uniquement'}
          </div>
        </div>
      </div>

      {/* ===== FILTRES — admin seulement ===== */}
      {role === 'admin' && (
        <div className="card mb-14">
          <div className="card-body">
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label">Filtrer par employé</label>
                <select className="form-select"
                  value={filtreEmploye}
                  onChange={e => setFiltreEmploye(e.target.value)}>
                  <option value="">Tous les employés</option>
                  {employes.map(e => (
                    <option key={e.id} value={e.id}>{e.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Filtrer par service</label>
                <select className="form-select"
                  value={filtreService}
                  onChange={e => setFiltreService(e.target.value)}>
                  <option value="">Tous les services</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Filtrer par date</label>
                <input className="form-input" type="date"
                  value={filtreDate}
                  onChange={e => setFiltreDate(e.target.value)} />
              </div>
            </div>
            {(filtreEmploye || filtreService || filtreDate) && (
              <button className="btn btn-outline btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => {
                  setFiltreEmploye('')
                  setFiltreService('')
                  setFiltreDate('')
                }}>
                <span className="material-symbols-outlined">close</span> Effacer les filtres
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== KPIs — admin seulement ===== */}
      {role === 'admin' && (
        <div className="kpi-grid kpi-4">
          <div className="kpi" style={{ '--kpi-color': '#B98A46' }}>
            <div className="kpi-label">CA Total</div>
            <div className="kpi-value">
              {totalCA.toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">{paiementsFiltres.length} paiements</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#5B2333' }}>
            <div className="kpi-label">Commission salon</div>
            <div className="kpi-value">
              {totalCommission.toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">revenus salon</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#3C7A57' }}>
            <div className="kpi-label">Net employés</div>
            <div className="kpi-value">
              {totalNet.toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">total net perçu</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#1565c0' }}>
            <div className="kpi-label">Pourboires</div>
            <div className="kpi-value">
              {totalPourboire.toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">total pourboires</div>
          </div>
        </div>
      )}

      {/* ===== TABLE ===== */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            {role === 'admin' ? 'Liste des paiements' : 'Mes paiements'}
            <span className="text-muted text-sm" style={{ marginLeft: 8 }}>
              ({paiementsFiltres.length} résultats)
            </span>
          </div>
        </div>
        <div className="card-body table-pad">
          {loading ? (
            <div className="empty">
              <div className="empty-icon"><span className="material-symbols-outlined">hourglass_empty</span></div>
              <div className="empty-text">Chargement...</div>
            </div>
          ) : paiementsFiltres.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><span className="material-symbols-outlined">receipt</span></div>
              <div className="empty-text">Aucun paiement enregistré</div>
              <div className="empty-sub">Encaissez depuis la Caisse</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Service</th>
                    {role === 'admin' && <th>Employé</th>}
                    <th>Total</th>
                    <th>Net</th>
                    {role === 'admin' && <th>Commission</th>}
                    {role === 'admin' && <th>Pourboire</th>}
                    <th>Méthode</th>
                    {role === 'admin' && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {paiementsFiltres.map(p => (
                    <tr key={p.id}>
                      <td className="text-muted text-sm">{fmtDate(p.created_at)}</td>
                      <td className="text-sm">{p.client_nom || 'Comptoir'}</td>
                      <td><div className="td-main">{p.service_nom}</div></td>
                      {role === 'admin' && (
                        <td className="text-sm">{p.employe_nom}</td>
                      )}
                      <td>
                        <span className="text-mono text-gold fw-bold">
                          {parseFloat(p.total).toFixed(2)} MAD
                        </span>
                      </td>
                      <td>
                        <span className="text-mono text-ok fw-bold">
                          {parseFloat(p.net_employe).toFixed(2)} MAD
                        </span>
                      </td>
                      {role === 'admin' && (
                        <td className="text-sm text-danger">
                          {parseFloat(p.commission_salon).toFixed(2)} MAD
                        </td>
                      )}
                      {role === 'admin' && (
                        <td className="text-sm text-ok">
                          {parseFloat(p.pourboire) > 0
                            ? `+${parseFloat(p.pourboire).toFixed(2)} MAD`
                            : '—'
                          }
                        </td>
                      )}
                      <td className="text-sm text-muted">
                        {p.methode_paiement === 'especes' ? <><span className="material-symbols-outlined">payments</span> Espèces</> :
                         p.methode_paiement === 'carte'   ? <><span className="material-symbols-outlined">credit_card</span> Carte</>   :
                         <><span className="material-symbols-outlined">account_balance</span> Virement</>}
                      </td>
                      {role === 'admin' && (
                        <td>
                          <button className="btn btn-danger btn-xs"
                            onClick={() => supprimerPaiement(p.id)}><span className="material-symbols-outlined">delete</span></button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Paiements
import { useState, useEffect } from 'react'
import '../styles/Clients.css'

function Clients() {

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/clients', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setClients(await res.json())
    } catch {}
    setLoading(false)
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-MA') : '—'

  // ===== KPIs =====
  const totalClients  = clients.length
  const totalDepense  = clients.reduce((s, c) => s + parseFloat(c.total_depense || 0), 0)
  const totalVisites  = clients.reduce((s, c) => s + parseInt(c.visites || 0), 0)

  return (
    <div className="page-wrap">

      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <div className="page-h1">📇 Clients</div>
          <div className="page-desc">Fiches créées automatiquement à chaque paiement</div>
        </div>
      </div>

      {/* ===== KPIs ===== */}
      <div className="kpi-grid kpi-3">
        <div className="kpi" style={{ '--kpi-color': '#5B2333' }}>
          <div className="kpi-label">Total clients</div>
          <div className="kpi-value">{totalClients}</div>
          <div className="kpi-sub">clients enregistrés</div>
        </div>
        <div className="kpi" style={{ '--kpi-color': '#B98A46' }}>
          <div className="kpi-label">Total visites</div>
          <div className="kpi-value">{totalVisites}</div>
          <div className="kpi-sub">prestations réalisées</div>
        </div>
        <div className="kpi" style={{ '--kpi-color': '#3C7A57' }}>
          <div className="kpi-label">Total dépensé</div>
          <div className="kpi-value">
            {totalDepense.toFixed(0)}
            <span style={{ fontSize: '1rem' }}> MAD</span>
          </div>
          <div className="kpi-sub">chiffre d'affaires clients</div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Liste des clients</div>
        </div>
        <div className="card-body table-pad">
          {loading ? (
            <div className="empty">
              <div className="empty-icon">⏳</div>
              <div className="empty-text">Chargement...</div>
            </div>
          ) : clients.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📇</div>
              <div className="empty-text">Aucun client pour le moment</div>
              <div className="empty-sub">Les clients apparaissent automatiquement après chaque paiement</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Téléphone</th>
                    <th>Visites</th>
                    <th>Total dépensé</th>
                    <th>Dernière visite</th>
                    <th>Client depuis</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id}>
                      <td><div className="td-main">{c.nom}</div></td>
                      <td className="text-sm text-muted">{c.tel || '—'}</td>
                      <td>
                        <span className="badge badge-ok">{c.visites} visite(s)</span>
                      </td>
                      <td>
                        <span className="text-mono text-gold fw-bold">
                          {parseFloat(c.total_depense).toFixed(2)} MAD
                        </span>
                      </td>
                      <td className="text-sm text-muted">
                        {fmtDate(c.derniere_visite)}
                      </td>
                      <td className="text-sm text-muted">
                        {fmtDate(c.created_at)}
                      </td>
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

export default Clients
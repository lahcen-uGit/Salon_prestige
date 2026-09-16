import { useState, useEffect } from 'react'
import '../styles/Dashboard.css'

function Dashboard() {

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const role  = localStorage.getItem('role')

  useEffect(() => { fetchDashboard() }, [])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(await res.json())
    } catch {}
    setLoading(false)
  }

  if (loading) return (
    <div className="empty" style={{ marginTop: 60 }}>
      <div className="empty-icon"><span className="material-symbols-outlined">hourglass_empty</span></div>
      <div className="empty-text">Chargement...</div>
    </div>
  )

  if (!data) return null

  // ===== CALCUL BARRES =====
  const maxBar = data.barres14j?.length > 0
    ? Math.max(...data.barres14j.map(b => parseFloat(b.ca || b.net || 0)))
    : 1

  const fmtDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  return (
    <div className="page-wrap">

      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <div className="page-h1"><span className="material-symbols-outlined">bar_chart</span> Tableau de bord</div>
          <div className="page-desc">
            {role === 'admin' ? 'Vue globale du salon' : 'Vos statistiques personnelles'}
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchDashboard}>
          <span className="material-symbols-outlined">refresh</span> Actualiser
        </button>
      </div>

      {/* ===== KPIs ADMIN ===== */}
      {role === 'admin' && data.kpis && (
        <div className="kpi-grid kpi-5">
          <div className="kpi" style={{ '--kpi-color': '#5B2333' }}>
            <div className="kpi-label">Chiffre d'affaires</div>
            <div className="kpi-value">
              {parseFloat(data.kpis.ca).toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">total encaissé</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#B98A46' }}>
            <div className="kpi-label">Transactions</div>
            <div className="kpi-value">{data.kpis.transactions}</div>
            <div className="kpi-sub">paiements</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#3C7A57' }}>
            <div className="kpi-label">Pourboires</div>
            <div className="kpi-value">
              {parseFloat(data.kpis.pourboires).toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">total pourboires</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#A8402F' }}>
            <div className="kpi-label">Commission salon</div>
            <div className="kpi-value">
              {parseFloat(data.kpis.commission).toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">revenus salon</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#1565c0' }}>
            <div className="kpi-label">Ticket moyen</div>
            <div className="kpi-value">
              {parseFloat(data.kpis.ticket_moyen).toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">par transaction</div>
          </div>
        </div>
      )}

      {/* ===== KPIs EMPLOYÉ ===== */}
      {role === 'employe' && data.kpis && (
        <div className="kpi-grid kpi-4">
          <div className="kpi" style={{ '--kpi-color': '#5B2333' }}>
            <div className="kpi-label">Prestations (14j)</div>
            <div className="kpi-value">{data.kpis.nb_prestations}</div>
            <div className="kpi-sub">services réalisés</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#B98A46' }}>
            <div className="kpi-label">Chiffre d'affaires</div>
            <div className="kpi-value">
              {parseFloat(data.kpis.ca).toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">total généré</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#3C7A57' }}>
            <div className="kpi-label">Pourboires reçus</div>
            <div className="kpi-value">
              {parseFloat(data.kpis.pourboires).toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">14 derniers jours</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#1565c0' }}>
            <div className="kpi-label">Net perçu</div>
            <div className="kpi-value">
              {parseFloat(data.kpis.net).toFixed(0)}
              <span style={{ fontSize: '1rem' }}> MAD</span>
            </div>
            <div className="kpi-sub">votre revenu net</div>
          </div>
        </div>
      )}

      <div className="dash-grid">

        {/* ===== GRAPHIQUE 14 JOURS ===== */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              {role === 'admin' ? <><span className="material-symbols-outlined">trending_up</span> CA — 14 derniers jours</> : <><span className="material-symbols-outlined">trending_up</span> Net — 14 derniers jours</>}
            </div>
          </div>
          <div className="card-body">
            {data.barres14j?.length === 0 ? (
              <div className="empty" style={{ padding: '20px' }}>
                <div className="empty-text">Pas encore de données</div>
              </div>
            ) : (
              <div className="bars-chart">
                {data.barres14j?.map((b, i) => {
                  const val = parseFloat(b.ca || b.net || 0)
                  const pct = maxBar > 0 ? (val / maxBar) * 100 : 0
                  return (
                    <div key={i} className="bar-col">
                      <div className="bar-val">{val.toFixed(0)}</div>
                      <div className="bar" style={{ height: `${Math.max(pct, 3)}%` }}></div>
                      <div className="bar-lbl">{fmtDate(b.jour)}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ===== TOP SERVICES (admin seulement) ===== */}
        {role === 'admin' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title"><span className="material-symbols-outlined">emoji_events</span> Top services</div>
            </div>
            <div className="card-body">
              {data.topServices?.length === 0 ? (
                <div className="empty" style={{ padding: '20px' }}>
                  <div className="empty-text">Pas encore de données</div>
                </div>
              ) : (
                data.topServices?.map((s, i) => (
                  <div key={i} className="rank-row">
                    <div className="rank-pos">{i + 1}</div>
                    <div className="rank-nom">{s.nom}</div>
                    <div className="rank-val">{s.nb}x</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* ===== PERFORMANCE EMPLOYÉS (admin seulement) ===== */}
      {role === 'admin' && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title"><span className="material-symbols-outlined">content_cut</span> Performance des employés</div>
          </div>
          <div className="card-body table-pad">
            {data.perfEmployes?.length === 0 ? (
              <div className="empty" style={{ padding: '20px' }}>
                <div className="empty-text">Pas encore de données</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employé</th>
                      <th>Prestations</th>
                      <th>CA généré</th>
                      <th>Commission salon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.perfEmployes?.map((e, i) => (
                      <tr key={i}>
                        <td><div className="td-main">{e.nom}</div></td>
                        <td>{e.nb_prestations}</td>
                        <td>
                          <span className="text-mono text-gold fw-bold">
                            {parseFloat(e.ca).toFixed(2)} MAD
                          </span>
                        </td>
                        <td>
                          <span className="text-mono text-danger">
                            {parseFloat(e.commission).toFixed(2)} MAD
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard
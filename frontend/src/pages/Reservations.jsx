import { useState, useEffect } from 'react'
import '../styles/Reservations.css'

function Reservations() {

  const [reservations, setReservations] = useState([])
  const [employes,     setEmployes]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [toast,        setToast]        = useState('')

  // ===== MODAL WHATSAPP =====
  const [modalWaOpen, setModalWaOpen] = useState(false)
  const [waLink,      setWaLink]      = useState('')
  const [waMsg,       setWaMsg]       = useState('')

  // ===== MODAL ENCAISSER =====
  const [modalEncOpen, setModalEncOpen] = useState(false)
  const [resvSelectee, setResvSelectee] = useState(null)
  const [formEnc, setFormEnc] = useState({
    pourboire:        0,
    methode_paiement: 'especes',
  })
  const [recu,     setRecu]     = useState(null)
  const [recuOpen, setRecuOpen] = useState(false)

  const token = localStorage.getItem('token')
  const role  = localStorage.getItem('role')

  useEffect(() => {
    fetchReservations()
    if (role === 'admin') fetchEmployes()
  }, [])

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/reservations', {
        headers: { Authorization: 'Bearer ' + token }
      })
      setReservations(await res.json())
    } catch {}
    setLoading(false)
  }

  const fetchEmployes = async () => {
    try {
      const res = await fetch('http://localhost:3000/employes/actifs', {
        headers: { Authorization: 'Bearer ' + token }
      })
      setEmployes(await res.json())
    } catch {}
  }

  // ===== TOAST =====
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  // ===== VÉRIFIER SI EMPLOYÉ OCCUPÉ =====
  const isEmployeOccupe = (employeId, reservation) => {
    const [rH, rM]  = reservation.heure_souhaitee.split(':').map(Number)
    const debutResv = rH * 60 + rM
    const finResv   = debutResv + 60

    return reservations.some(r => {
      if (r.id === reservation.id)    return false
      if (r.employe_id !== employeId) return false
      if (r.statut !== 'confirmee')   return false
      if (r.date_souhaitee !== reservation.date_souhaitee) return false

      const [h, m] = r.heure_souhaitee.split(':').map(Number)
      const debut  = h * 60 + m
      const fin    = debut + 60

      return debutResv < fin && finResv > debut
    })
  }

  // ===== AFFECTER =====
  const affecterEmploye = async (reservationId, employeId) => {
    if (!employeId) return
    try {
      const res = await fetch('http://localhost:3000/reservations/' + reservationId + '/affecter', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body:    JSON.stringify({ employe_id: parseInt(employeId) })
      })
      const data = await res.json()

      if (data.whatsappLink) {
        setWaLink(data.whatsappLink)
        setWaMsg(decodeURIComponent(data.whatsappLink.split('?text=')[1] || ''))
        setModalWaOpen(true)
      }

      fetchReservations()
    } catch {}
  }

  // ===== CHANGER STATUT =====
  const changerStatut = async (reservationId, statut) => {
    if (!statut) return
    try {
      await fetch('http://localhost:3000/reservations/' + reservationId + '/statut', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body:    JSON.stringify({ statut })
      })
      fetchReservations()
    } catch {}
  }

  // ===== SUPPRIMER =====
  const supprimerReservation = async (id) => {
    if (!window.confirm('Supprimer cette réservation ?')) return
    await fetch('http://localhost:3000/reservations/' + id, {
      method:  'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    })
    fetchReservations()
  }

  // ===== ENCAISSER =====
  const ouvrirEncaisser = (resv) => {
    setResvSelectee(resv)
    setFormEnc({ pourboire: 0, methode_paiement: 'especes' })
    setModalEncOpen(true)
  }

  const encaisser = async () => {
    if (!resvSelectee) return
    try {
      const res = await fetch('http://localhost:3000/reservations/' + resvSelectee.id + '/encaisser', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body:    JSON.stringify(formEnc)
      })
      const data = await res.json()
      if (data.error) { alert(data.error); return }
      setRecu({
        ...data,
        service_nom: resvSelectee.service_nom,
        client_nom:  resvSelectee.nom_client,
        methode:     formEnc.methode_paiement,
      })
      setModalEncOpen(false)
      setRecuOpen(true)
      fetchReservations()
    } catch {}
  }

  const badgeStatut = (statut) => {
    if (statut === 'en_attente') return <span className="badge badge-warn">⏳ En attente</span>
    if (statut === 'confirmee')  return <span className="badge badge-ok">✓ Confirmée</span>
    if (statut === 'realisee')   return <span className="badge badge-muted">✅ Réalisée</span>
    if (statut === 'annulee')    return <span className="badge badge-danger">✕ Annulée</span>
    return null
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-MA') : '—'

  const totalResv  = reservations.length
  const enAttente  = reservations.filter(r => r.statut === 'en_attente').length
  const confirmees = reservations.filter(r => r.statut === 'confirmee').length
  const realisees  = reservations.filter(r => r.statut === 'realisee').length

  return (
    <div className="page-wrap">

      {/* ===== TOAST ===== */}
      {toast && <div className="resv-toast">{toast}</div>}

      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <div className="page-h1">📅 Réservations</div>
          <div className="page-desc">
            {role === 'admin' ? 'Gérez toutes les réservations du salon' : 'Vos rendez-vous confirmés'}
          </div>
        </div>
      </div>

      {/* ===== KPIs admin ===== */}
      {role === 'admin' && (
        <div className="kpi-grid kpi-4">
          <div className="kpi" style={{ '--kpi-color': '#5B2333' }}>
            <div className="kpi-label">Total</div>
            <div className="kpi-value">{totalResv}</div>
            <div className="kpi-sub">réservations</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#B9812F' }}>
            <div className="kpi-label">En attente</div>
            <div className="kpi-value">{enAttente}</div>
            <div className="kpi-sub">à traiter</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#3C7A57' }}>
            <div className="kpi-label">Confirmées</div>
            <div className="kpi-value">{confirmees}</div>
            <div className="kpi-sub">rendez-vous</div>
          </div>
          <div className="kpi" style={{ '--kpi-color': '#7A756C' }}>
            <div className="kpi-label">Réalisées</div>
            <div className="kpi-value">{realisees}</div>
            <div className="kpi-sub">terminées</div>
          </div>
        </div>
      )}

      {/* ===== TABLE ADMIN ===== */}
      {role === 'admin' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Liste des réservations</div>
          </div>
          <div className="card-body table-pad">
            {loading ? (
              <div className="empty">
                <div className="empty-icon">⏳</div>
                <div className="empty-text">Chargement...</div>
              </div>
            ) : reservations.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📅</div>
                <div className="empty-text">Aucune réservation</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Téléphone</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Heure</th>
                      <th>Coiffeur</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(r => (
                      <tr key={r.id}>
                        <td><div className="td-main">{r.nom_client}</div></td>
                        <td className="text-sm text-muted">{r.tel_client}</td>
                        <td className="text-sm">{r.service_nom || '—'}</td>
                        <td className="text-sm text-muted">{fmtDate(r.date_souhaitee)}</td>
                        <td className="text-sm text-muted">{r.heure_souhaitee}</td>
                        <td>
                          {r.statut !== 'annulee' && r.statut !== 'realisee' ? (
                            <select className="resv-select"
                              value={r.employe_id || ''}
                              onChange={e => affecterEmploye(r.id, e.target.value)}>
                              <option value="">
                                {r.employe_nom ? r.employe_nom : 'Choisir...'}
                              </option>
                              {employes.map(e => {
                                const occupe = isEmployeOccupe(e.id, r)
                                return (
                                  <option key={e.id} value={e.id} disabled={occupe}>
                                    {e.nom}{occupe ? ' (occupé)' : ''}
                                  </option>
                                )
                              })}
                            </select>
                          ) : (
                            <span className="text-sm">{r.employe_nom || '—'}</span>
                          )}
                        </td>
                        <td>{badgeStatut(r.statut)}</td>
                        <td>
                          <div className="flex gap-8">
                            {r.statut !== 'realisee' && (
                              <select className="resv-select" value=""
                                onChange={e => changerStatut(r.id, e.target.value)}>
                                <option value="">Changer...</option>
                                <option value="en_attente">En attente</option>
                                <option value="annulee">Annulée</option>
                              </select>
                            )}
                            <button className="btn btn-danger btn-xs"
                              onClick={() => supprimerReservation(r.id)}>🗑</button>
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
      )}

      {/* ===== TABLE EMPLOYÉ ===== */}
      {role === 'employe' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Mes rendez-vous</div>
          </div>
          <div className="card-body table-pad">
            {loading ? (
              <div className="empty">
                <div className="empty-icon">⏳</div>
                <div className="empty-text">Chargement...</div>
              </div>
            ) : reservations.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📅</div>
                <div className="empty-text">Aucun rendez-vous assigné</div>
                <div className="empty-sub">L'admin vous assignera des réservations</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Téléphone</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Heure</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(r => (
                      <tr key={r.id}>
                        <td><div className="td-main">{r.nom_client}</div></td>
                        <td className="text-sm text-muted">{r.tel_client}</td>
                        <td className="text-sm">{r.service_nom || '—'}</td>
                        <td className="text-sm text-muted">{fmtDate(r.date_souhaitee)}</td>
                        <td className="text-sm text-muted">{r.heure_souhaitee}</td>
                        <td>{badgeStatut(r.statut)}</td>
                        <td>
                          {r.statut === 'confirmee' && (
                            <button className="btn btn-gold btn-sm"
                              onClick={() => ouvrirEncaisser(r)}>
                              💰 Encaisser
                            </button>
                          )}
                          {r.statut === 'realisee' && (
                            <span className="text-muted text-sm">✅ Réalisé</span>
                          )}
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

      {/* ===== MODAL WHATSAPP ===== */}
      {modalWaOpen && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title">📱 Confirmer via WhatsApp</div>
              <button className="modal-close" onClick={() => setModalWaOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--admin-muted)' }}>
                Le message suivant sera envoyé au client :
              </div>
              <div style={{
                background:   'var(--ok-dim)',
                border:       '1px solid rgba(60,122,87,0.2)',
                borderRadius: 10,
                padding:      '14px 16px',
                fontSize:     13,
                color:        'var(--ink)',
                lineHeight:   1.6,
                whiteSpace:   'pre-wrap',
              }}>
                {waMsg}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--admin-muted)' }}>
                ⚠️ WhatsApp s'ouvrira avec ce message pré-rempli — vous devrez cliquer "Envoyer".
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalWaOpen(false)}>
                Plus tard
              </button>
              <a href={waLink} target="_blank" rel="noreferrer">
                <button className="btn btn-primary"
                  onClick={() => {
                    setModalWaOpen(false)
                    showToast('📱 WhatsApp ouvert — envoyez le message au client')
                  }}>
                  📱 Envoyer via WhatsApp
                </button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL ENCAISSER ===== */}
      {modalEncOpen && resvSelectee && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div className="modal-title">💰 Encaisser la réservation</div>
              <button className="modal-close" onClick={() => setModalEncOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="resv-info mb-14">
                <div className="fw-bold mb-8">{resvSelectee.nom_client}</div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Service</span>
                  <span>{resvSelectee.service_nom}</span>
                </div>
                <div className="flex justify-between text-sm mt-4">
                  <span className="text-muted">Prix</span>
                  <span className="text-gold fw-bold">
                    {parseFloat(resvSelectee.service_prix).toFixed(2)} MAD
                  </span>
                </div>
              </div>
              <div className="form-group mb-14">
                <label className="form-label">Pourboire (MAD)</label>
                <input className="form-input" type="number" min="0"
                  value={formEnc.pourboire}
                  onChange={e => setFormEnc({ ...formEnc, pourboire: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Méthode de paiement</label>
                <select className="form-select"
                  value={formEnc.methode_paiement}
                  onChange={e => setFormEnc({ ...formEnc, methode_paiement: e.target.value })}>
                  <option value="especes">💵 Espèces</option>
                  <option value="carte">💳 Carte bancaire</option>
                  <option value="virement">🏦 Virement</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalEncOpen(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={encaisser}>✅ Confirmer l'encaissement</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL REÇU ===== */}
      {recuOpen && recu && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '380px' }}>
            <div className="modal-header">
              <div className="modal-title">🧾 Reçu</div>
              <button className="modal-close" onClick={() => setRecuOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', paddingBottom: 12, borderBottom: '1px dashed var(--line)', marginBottom: 14 }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem', color: 'var(--bordeaux)', fontWeight: 700 }}>
                  PRESTIGE Salon Pro
                </div>
              </div>
              <div className="flex justify-between text-sm mb-8">
                <span className="text-muted">Client</span>
                <span>{recu.client_nom}</span>
              </div>
              <div className="flex justify-between text-sm mb-8">
                <span className="text-muted">Service</span>
                <span>{recu.service_nom}</span>
              </div>
              <div className="flex justify-between fw-bold" style={{ fontSize: 15 }}>
                <span>Total encaissé</span>
                <span className="text-gold">{recu.total ? recu.total.toFixed(2) : '0.00'} MAD</span>
              </div>
              <div className="flex justify-between text-sm mt-8">
                <span className="text-muted">Net employé</span>
                <span className="text-ok fw-bold">
                  {recu.netEmploye ? recu.netEmploye.toFixed(2) : '0.00'} MAD
                </span>
              </div>
            </div>

            {/* ===== FOOTER AVEC PDF ===== */}
            <div className="modal-footer" style={{ flexDirection: 'column', gap: 8 }}>
              {recu.paiement_id && (() => {
                const pdfUrl = 'http://localhost:3000/caisse/' + recu.paiement_id + '/pdf?token=' + token
                return (
                  <a href={pdfUrl} target="_blank" rel="noreferrer" style={{ width: '100%' }}>
                    <button className="btn btn-gold w-full">
                      📄 Télécharger le reçu PDF
                    </button>
                  </a>
                )
              })()}
              <button className="btn btn-primary w-full"
                onClick={() => setRecuOpen(false)}>
                ✓ Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Reservations
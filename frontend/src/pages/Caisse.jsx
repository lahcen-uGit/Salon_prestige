import { useState, useEffect } from 'react'
import '../styles/Caisse.css'

function Caisse() {

  const [services,  setServices]  = useState([])
  const [employes,  setEmployes]  = useState([])
  const [error,     setError]     = useState('')
  const [loading2,  setLoading2]  = useState(false)
  const [recu,      setRecu]      = useState(null)
  const [recuOpen,  setRecuOpen]  = useState(false)

  const [form, setForm] = useState({
    service_id:       '',
    employe_id:       '',
    pourboire:        0,
    methode_paiement: 'especes',
    client_nom:       '',
    client_tel:       '',
  })

  const token      = localStorage.getItem('token')
  const role       = localStorage.getItem('role')
  const employe_id = localStorage.getItem('employe_id')

  useEffect(() => {
    fetchServices()
    if (role === 'admin') fetchEmployes()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:3000/services', {
        headers: { Authorization: 'Bearer ' + token }
      })
      setServices(await res.json())
    } catch {}
  }

  const fetchEmployes = async () => {
    try {
      const res = await fetch('http://localhost:3000/employes/actifs', {
        headers: { Authorization: 'Bearer ' + token }
      })
      setEmployes(await res.json())
    } catch {}
  }

  // ===== CALCUL EN TEMPS RÉEL =====
  const serviceSelectionne = services.find(s => s.id === parseInt(form.service_id))
  const prix               = serviceSelectionne ? parseFloat(serviceSelectionne.prix) : 0
  const pourboire          = parseFloat(form.pourboire || 0)
  const commissionSalon    = +(prix * 0.25).toFixed(2)
  const netEmploye         = +((prix - commissionSalon) + pourboire).toFixed(2)
  const total              = +(prix + pourboire).toFixed(2)

  // ===== ENCAISSER =====
  const encaisser = async () => {
    setError('')
    if (!form.service_id) { setError('Sélectionnez un service'); return }
    if (role === 'admin' && !form.employe_id) { setError('Sélectionnez un employé'); return }

    setLoading2(true)
    try {
      const res  = await fetch('http://localhost:3000/caisse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body:    JSON.stringify({
          ...form,
          employe_id: role === 'employe' ? employe_id : form.employe_id,
        })
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setRecu({
          ...data,
          service_nom: serviceSelectionne ? serviceSelectionne.nom : '',
          methode:     form.methode_paiement,
          client_nom:  form.client_nom || 'Client comptoir',
        })
        setRecuOpen(true)
        setForm({
          service_id:       '',
          employe_id:       '',
          pourboire:        0,
          methode_paiement: 'especes',
          client_nom:       '',
          client_tel:       '',
        })
      }
    } catch {
      setError('Erreur lors de l\'enregistrement')
    }
    setLoading2(false)
  }

  return (
    <div className="page-wrap">

      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <div className="page-h1"><span className="material-symbols-outlined">payments</span> Caisse</div>
          <div className="page-desc">Enregistrez une prestation encaissée</div>
        </div>
      </div>

      <div className="caisse-center">
        <div className="card caisse-card">
          <div className="card-header">
            <div className="card-title">Nouveau paiement</div>
          </div>
          <div className="card-body">

            {error && <div className="caisse-error mb-14">{error}</div>}

            {/* Service */}
            <div className="form-group mb-14">
              <label className="form-label">Service *</label>
              <select className="form-select"
                value={form.service_id}
                onChange={e => setForm({ ...form, service_id: e.target.value })}>
                <option value="">-- Choisir un service --</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nom} — {parseFloat(s.prix).toFixed(2)} MAD
                  </option>
                ))}
              </select>
            </div>

            {/* Employé — admin seulement */}
            {role === 'admin' && (
              <div className="form-group mb-14">
                <label className="form-label">Employé *</label>
                <select className="form-select"
                  value={form.employe_id}
                  onChange={e => setForm({ ...form, employe_id: e.target.value })}>
                  <option value="">-- Choisir un employé --</option>
                  {employes.map(e => (
                    <option key={e.id} value={e.id}>{e.nom}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Client optionnel */}
            <div className="form-grid form-grid-2 mb-14">
              <div className="form-group">
                <label className="form-label">Nom client (optionnel)</label>
                <input className="form-input" placeholder="votre nom"
                  value={form.client_nom}
                  onChange={e => setForm({ ...form, client_nom: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-input" placeholder="+212 6XX XXX XXX"
                  value={form.client_tel}
                  onChange={e => setForm({ ...form, client_tel: e.target.value })} />
              </div>
            </div>

            {/* Pourboire + Méthode */}
            <div className="form-grid form-grid-2 mb-14">
              <div className="form-group">
                <label className="form-label">Pourboire (MAD)</label>
                <input className="form-input" type="number" min="0"
                  value={form.pourboire}
                  onChange={e => setForm({ ...form, pourboire: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Méthode de paiement</label>
                <select className="form-select"
                  value={form.methode_paiement}
                  onChange={e => setForm({ ...form, methode_paiement: e.target.value })}>
                  <option value="especes">Espèces</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="virement">Virement</option>
                </select>
              </div>
            </div>

            {/* ===== CALCUL EN TEMPS RÉEL ===== */}
            {serviceSelectionne && (
              <div className="caisse-calcul">
                <div className="calc-row">
                  <span>Prix service</span>
                  <span className="text-mono">{prix.toFixed(2)} MAD</span>
                </div>
                <div className="calc-row text-danger">
                  <span>Commission salon (25%)</span>
                  <span className="text-mono">— {commissionSalon.toFixed(2)} MAD</span>
                </div>
                {pourboire > 0 && (
                  <div className="calc-row text-ok">
                    <span>Pourboire</span>
                    <span className="text-mono">+ {pourboire.toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="calc-divider"></div>
                <div className="calc-row calc-net">
                  <span>Net employé</span>
                  <span className="text-mono text-gold fw-bold">{netEmploye.toFixed(2)} MAD</span>
                </div>
                <div className="calc-row calc-total">
                  <span>Total encaissé</span>
                  <span className="text-mono fw-bold">{total.toFixed(2)} MAD</span>
                </div>
              </div>
            )}

            <button className="btn btn-primary w-full"
              style={{ marginTop: 16 }}
              onClick={encaisser}
              disabled={loading2}>
              {loading2 ? <><span className="material-symbols-outlined">hourglass_empty</span> Enregistrement...</> : <><span className="material-symbols-outlined">check_circle</span> Encaisser et générer le reçu</>}
            </button>

          </div>
        </div>
      </div>

      {/* ===== MODAL REÇU ===== */}
      {recuOpen && recu && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title"><span className="material-symbols-outlined">receipt</span> Reçu de paiement</div>
              <button className="modal-close" onClick={() => setRecuOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="modal-body">

              <div className="recu-salon mb-14">
                <div className="recu-salon-nom">PRESTIGE Salon Pro</div>
                <div className="recu-date">{new Date().toLocaleString('fr-MA')}</div>
              </div>

              <div className="recu-row">
                <span>Client</span>
                <span>{recu.client_nom}</span>
              </div>
              <div className="recu-row">
                <span>Service</span>
                <span>{recu.service_nom}</span>
              </div>
              <div className="recu-row">
                <span>Prix</span>
                <span>{recu.prix ? recu.prix.toFixed(2) : '0.00'} MAD</span>
              </div>
              {recu.pourboire > 0 && (
                <div className="recu-row text-ok">
                  <span>Pourboire</span>
                  <span>+ {recu.pourboire.toFixed(2)} MAD</span>
                </div>
              )}
              <div className="recu-row text-muted">
                <span>Commission ({recu.commission_rate}%)</span>
                <span>— {recu.commission_salon ? recu.commission_salon.toFixed(2) : '0.00'} MAD</span>
              </div>
              <div className="recu-divider"></div>
              <div className="recu-row recu-net">
                <span>Net employé</span>
                <span className="text-gold fw-bold">
                  {recu.net_employe ? recu.net_employe.toFixed(2) : '0.00'} MAD
                </span>
              </div>
              <div className="recu-row recu-total">
                <span>Total encaissé</span>
                <span className="fw-bold">
                  {recu.total ? recu.total.toFixed(2) : '0.00'} MAD
                </span>
              </div>
              <div className="recu-row mt-8">
                <span>Méthode</span>
                <span>
                  {recu.methode === 'especes' ? <><span className="material-symbols-outlined">payments</span> Espèces</> :
                   recu.methode === 'carte'   ? <><span className="material-symbols-outlined">credit_card</span> Carte</>   :
                   <><span className="material-symbols-outlined">account_balance</span> Virement</>}
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
                      Télécharger le reçu PDF
                    </button>
                  </a>
                )
              })()}
              <button className="btn btn-outline w-full"
                onClick={() => setRecuOpen(false)}>
                <span className="material-symbols-outlined">check</span> Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Caisse
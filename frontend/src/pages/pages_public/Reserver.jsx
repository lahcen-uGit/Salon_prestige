import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../../styles/Public.css'

function Reserver() {
  const [services,     setServices]     = useState([])
  const [creneaux,     setCreneaux]     = useState([])
  const [msgCreneaux,  setMsgCreneaux]  = useState('')
  const [success,      setSuccess]      = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [loadingCren,  setLoadingCren]  = useState(false)
  const [whatsappLink, setWhatsappLink] = useState('')
  const [salonTel,     setSalonTel]     = useState('')

  const [searchParams] = useSearchParams()
  const serviceIdUrl   = searchParams.get('service_id') || ''
  const aujourdhui     = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    nom_client:      '',
    tel_client:      '',
    service_id:      serviceIdUrl,
    date_souhaitee:  aujourdhui,
    heure_souhaitee: '',
    notes:           '',
  })

  const navigate = useNavigate()

  // ===== CHARGEMENT INITIAL =====
  useEffect(() => {
    const init = async () => {
      await fetchParametres()
      await fetchServices()
    }
    init()
  }, [])

  // ===== RECHARGER CRÉNEAUX =====
  useEffect(() => {
    if (form.date_souhaitee && form.service_id) {
      fetchCreneaux()
    } else {
      setCreneaux([])
      setMsgCreneaux('')
    }
  }, [form.date_souhaitee, form.service_id])

  // ===== FETCH PARAMÈTRES =====
  const fetchParametres = async () => {
    try {
      const res  = await fetch('http://localhost:3000/parametres')
      const data = await res.json()
      if (data.salon_tel) {
        // Supprimer les caractères non numériques
        let tel = data.salon_tel.replace(/\D/g, '')

        // Si commence par 0 → remplacer par 212 (Maroc)
        if (tel.startsWith('0')) {
          tel = '212' + tel.slice(1)
        }

        setSalonTel(tel)
      }
    } catch {}
  }

  // ===== FETCH SERVICES =====
  const fetchServices = async () => {
    try {
      const res  = await fetch('http://localhost:3000/services')
      const data = await res.json()
      setServices(data)
      if (!serviceIdUrl && data.length > 0) {
        setForm(f => ({ ...f, service_id: String(data[0].id) }))
      }
    } catch {}
  }

  // ===== FETCH CRÉNEAUX =====
  const fetchCreneaux = async () => {
    setLoadingCren(true)
    setCreneaux([])
    setMsgCreneaux('')
    setForm(f => ({ ...f, heure_souhaitee: '' }))
    try {
      const res  = await fetch(
        `http://localhost:3000/reservations/creneaux?date=${form.date_souhaitee}&service_id=${form.service_id}`
      )
      const data = await res.json()
      setCreneaux(data.creneaux || [])
      setMsgCreneaux(data.message || '')
    } catch {}
    setLoadingCren(false)
  }

  // ===== ENVOYER =====
  const envoyer = async () => {
    setError('')

    if (!form.nom_client || !form.tel_client || !form.date_souhaitee || !form.heure_souhaitee) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (form.date_souhaitee < aujourdhui) {
      setError('La date choisie est dans le passé')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/reservations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form)
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        fetchCreneaux()
      } else {
        const serviceNom = services.find(s => s.id === parseInt(form.service_id))?.nom || 'service'
        const msg        = `Bonjour PRESTIGE Salon Pro, je viens de faire une réservation en ligne.\nNom : ${form.nom_client}\nService : ${serviceNom}\nDate : ${form.date_souhaitee} à ${form.heure_souhaitee}`

        // Utiliser salonTel depuis paramètres ou numéro par défaut
        const telFinal = salonTel || '212600000000'
        setWhatsappLink(`https://wa.me/${telFinal}?text=${encodeURIComponent(msg)}`)
        setSuccess(true)
      }
    } catch {
      setError('Erreur de connexion au serveur')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* ===== NAVBAR ===== */}
      <nav className="pub-navbar">
        <div className="pub-brand" onClick={() => navigate('/')}>
          PRESTIGE <span>Salon Pro</span>
        </div>
        <div className="pub-nav-links">
          <span className="pub-nav-link" onClick={() => navigate('/')}>Accueil</span>
          <span className="pub-nav-link" onClick={() => navigate('/prestations')}>Prestations</span>
          <span className="pub-nav-link active">Réserver</span>
          <button className="btn-pub-primary" onClick={() => navigate('/reserver')}>📅 Réserver</button>
          <button className="btn-pub-outline" onClick={() => navigate('/login')}>Connexion</button>
        </div>
      </nav>

      {/* ===== HEADER ===== */}
      <div style={{ background: 'var(--ink)', padding: '40px 32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: 'var(--white)', marginBottom: 8 }}>
          Réserver un créneau
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          Remplissez le formulaire et nous vous confirmerons rapidement
        </p>
      </div>

      {/* ===== FORMULAIRE ===== */}
      <div className="pub-section">
        <div className="pub-form-wrap">
          <div className="pub-form-card">

            {/* ===== SUCCÈS ===== */}
            {success ? (
              <div className="pub-success">
                <div className="pub-success-icon">✅</div>
                <div className="pub-success-title">Demande envoyée !</div>
                <div className="pub-success-sub">
                  Votre réservation est en attente de confirmation.<br />
                  Nous vous contacterons très prochainement.
                </div>
                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noreferrer">
                    <button className="btn-pub-primary" style={{ marginBottom: 12 }}>
                      📱 Confirmer via WhatsApp
                    </button>
                  </a>
                )}
                <br />
                <button className="btn-pub-outline"
                  style={{ color: 'var(--ink)', borderColor: 'var(--line)', marginTop: 8 }}
                  onClick={() => {
                    setSuccess(false)
                    setForm({
                      nom_client:      '',
                      tel_client:      '',
                      service_id:      services[0]?.id ? String(services[0].id) : '',
                      date_souhaitee:  aujourdhui,
                      heure_souhaitee: '',
                      notes:           '',
                    })
                    setCreneaux([])
                  }}>
                  Faire une autre réservation
                </button>
              </div>
            ) : (
              <>
                <div className="pub-form-title">Votre réservation</div>
                <div className="pub-form-sub">Tous les champs marqués * sont obligatoires</div>

                {error && (
                  <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(168,64,47,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', fontWeight: 600, marginBottom: 14 }}>
                    {error}
                  </div>
                )}

                {/* Nom + Téléphone */}
                <div className="form-grid form-grid-2 mb-14">
                  <div className="form-group">
                    <label className="form-label">Nom complet *</label>
                    <input className="form-input" placeholder="Ahmed Benali"
                      value={form.nom_client}
                      onChange={e => setForm({ ...form, nom_client: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone *</label>
                    <input className="form-input" placeholder="+212 6XX XXX XXX"
                      value={form.tel_client}
                      onChange={e => setForm({ ...form, tel_client: e.target.value })} />
                  </div>
                </div>

                {/* Service */}
                <div className="form-group mb-14">
                  <label className="form-label">Service souhaité *</label>
                  <select className="form-select"
                    value={form.service_id}
                    onChange={e => setForm({ ...form, service_id: e.target.value, heure_souhaitee: '' })}>
                    <option value="">-- Choisir un service --</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nom} — {parseFloat(s.prix).toFixed(0)} MAD ({s.duree} min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="form-group mb-14">
                  <label className="form-label">Date souhaitée *</label>
                  <input className="form-input" type="date"
                    min={aujourdhui}
                    value={form.date_souhaitee}
                    onChange={e => setForm({ ...form, date_souhaitee: e.target.value, heure_souhaitee: '' })} />
                </div>

                {/* Créneaux */}
                <div className="form-group mb-14">
                  <label className="form-label">Heure souhaitée *</label>

                  {(!form.service_id || !form.date_souhaitee) && (
                    <div style={{ fontSize: 12, color: 'var(--admin-muted)', padding: '10px 0' }}>
                      👆 Choisissez d'abord un service et une date
                    </div>
                  )}

                  {loadingCren && (
                    <div style={{ fontSize: 12, color: 'var(--admin-muted)', padding: '10px 0' }}>
                      ⏳ Recherche des créneaux disponibles...
                    </div>
                  )}

                  {!loadingCren && msgCreneaux && creneaux.length === 0 && (
                    <div style={{ background: 'var(--danger-dim)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>
                      😔 {msgCreneaux}
                    </div>
                  )}

                  {!loadingCren && creneaux.length > 0 && (
                    <div className="creneaux-grid">
                      {creneaux.map(h => (
                        <button key={h}
                          className={`creneau-btn ${form.heure_souhaitee === h ? 'creneau-active' : ''}`}
                          onClick={() => setForm({ ...form, heure_souhaitee: h })}>
                          {h}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="form-group mb-20">
                  <label className="form-label">Notes (optionnel)</label>
                  <textarea className="form-textarea"
                    placeholder="Précisions sur votre demande..."
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>

                <button className="btn-pub-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: 14 }}
                  onClick={envoyer}
                  disabled={loading || !form.heure_souhaitee}>
                  {loading ? '⏳ Envoi...' : '📅 Envoyer ma demande'}
                </button>

              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="pub-footer">
        <div className="pub-footer-nom">PRESTIGE Salon Pro</div>
        <div className="pub-footer-sub">© 2024 — Tous droits réservés</div>
      </footer>

    </div>
  )
}

export default Reserver
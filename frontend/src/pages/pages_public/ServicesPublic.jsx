import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/Public.css'

function ServicesPublic() {
  const [services, setServices] = useState([])
  const [filtre,   setFiltre]   = useState('tous')
  const [loading,  setLoading]  = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchServices() }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/services')
      setServices(await res.json())
    } catch {}
    setLoading(false)
  }

  const servicesFiltres = filtre === 'tous'
    ? services
    : services.filter(s => s.categorie === filtre)

  const badgeCat = (cat) => {
    if (cat === 'homme') return <span className="pub-badge pub-badge-homme">♂ Homme</span>
    if (cat === 'femme') return <span className="pub-badge pub-badge-femme">♀ Femme</span>
    return <span className="pub-badge pub-badge-mixte">⚥ Mixte</span>
  }

  const reserverService = (serviceId) => {
    navigate(`/reserver?service_id=${serviceId}`)
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      <nav className="pub-navbar">
        <div className="pub-brand" onClick={() => navigate('/')}>
          PRESTIGE <span>Salon Pro</span>
        </div>
        <div className="pub-nav-links">
          <span className="pub-nav-link" onClick={() => navigate('/')}>Accueil</span>
          <span className="pub-nav-link active">Prestations</span>
          <span className="pub-nav-link" onClick={() => navigate('/reserver')}>Réserver</span>
          <button className="btn-pub-primary" onClick={() => navigate('/reserver')}><span className="material-symbols-outlined">calendar_month</span> Réserver</button>
          <button className="btn-pub-outline" onClick={() => navigate('/login')}>Connexion</button>
        </div>
      </nav>

      <div style={{ background: '#ffffff', padding: '40px 32px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', borderBottom: '1px solid #EEEEEE' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#111111', marginBottom: 8 }}>
          Nos Prestations
        </h1>
        <p style={{ color: '#888888', fontSize: 14 }}>
          Découvrez l'ensemble de nos services professionnels
        </p>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {['tous', 'homme', 'femme', 'mixte'].map(f => (
            <button key={f}
              onClick={() => setFiltre(f)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: '1.5px solid',
                borderColor: filtre === f ? 'var(--bordeaux)' : 'var(--line)',
                background:  filtre === f ? 'var(--bordeaux)' : 'var(--white)',
                color:       filtre === f ? 'var(--white)'    : 'var(--ink)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}>
              {f === 'tous' ? 'Tous' : f === 'homme' ? 'Homme' : f === 'femme' ? 'Femme' : 'Mixte'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--admin-muted)' }}>
            <span className="material-symbols-outlined">hourglass_empty</span> Chargement...
          </div>
        ) : (
          <div className="pub-catalog">
            {servicesFiltres.map(s => (
              <div key={s.id} className="pub-card">
                <div className="pub-card-header">
                  <div className="pub-card-nom">{s.nom}</div>
                  <div className="pub-card-prix">{parseFloat(s.prix).toFixed(0)} MAD</div>
                </div>
                <div className="pub-card-desc">
                  {s.description || 'Prestation professionnelle réalisée par nos experts.'}
                </div>
                <div className="pub-card-footer">
                  {badgeCat(s.categorie)}
                  <span className="pub-card-duree"><span className="material-symbols-outlined">timer</span> {s.duree} min</span>
                </div>
                <button className="btn-pub-primary"
                  style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
                  onClick={() => reserverService(s.id)}>
                  <span className="material-symbols-outlined">calendar_month</span> Réserver ce service
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="pub-footer" style={{ marginTop: 40 }}>
        <div className="pub-footer-nom">PRESTIGE Salon Pro</div>
        <div className="pub-footer-sub">© 2024 — Tous droits réservés</div>
      </footer>

    </div>
  )
}

export default ServicesPublic
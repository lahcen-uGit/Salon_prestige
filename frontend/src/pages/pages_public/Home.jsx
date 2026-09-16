import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/Public.css'

function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* ===== NAVBAR ===== */}
      <nav className="pub-navbar">
        <div className="pub-brand" onClick={() => navigate('/')}>
          PRESTIGE <span>Salon Pro</span>
        </div>
        <div className="pub-nav-links">
          <span className="pub-nav-link active" onClick={() => navigate('/')}>Accueil</span>
          <span className="pub-nav-link" onClick={() => navigate('/prestations')}>Prestations</span>
          <span className="pub-nav-link" onClick={() => navigate('/reserver')}>Réserver</span>
          <button className="btn-pub-primary" onClick={() => navigate('/reserver')}>
            <span className="material-symbols-outlined">calendar_month</span> Réserver
          </button>
          <button className="btn-pub-outline" onClick={() => navigate('/login')}>
            Connexion
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <div className="pub-hero">
        <div>
          <h1 className="hero-title">
            L'art de la<br />
            <span>coiffure</span><br />
            à votre service
          </h1>
          <p className="hero-lede">
            Bienvenue chez PRESTIGE Salon Pro — votre espace de beauté et de bien-être.
            Nos experts vous accueillent pour sublimer votre style.
          </p>
          <div className="hero-cta">
            <button className="btn-pub-primary" onClick={() => navigate('/reserver')}>
              <span className="material-symbols-outlined">calendar_month</span> Réserver un créneau
            </button>
            <button className="btn-pub-outline" onClick={() => navigate('/prestations')}>
              Découvrir les prestations <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">500+</div>
            <div className="hero-stat-lbl">Clients satisfaits</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">5 ans</div>
            <div className="hero-stat-lbl">D'expérience</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">4.9 <span className="material-symbols-outlined">star</span></div>
            <div className="hero-stat-lbl">Note moyenne</div>
          </div>
        </div>
      </div>

      {/* ===== APERÇU SERVICES ===== */}
      <div className="pub-section">
        <div className="pub-section-head">
          <h2 className="pub-section-title">Nos prestations phares</h2>
          <button className="btn-pub-primary"
            style={{ fontSize: 12, padding: '8px 16px' }}
            onClick={() => navigate('/prestations')}>
            Voir tout le catalogue <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <AperçuServices navigate={navigate} />
      </div>

      {/* ===== CTA ===== */}
      <div style={{ background: '#ffffff', padding: '60px 32px', textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.07)', borderTop: '1px solid #EEEEEE', borderBottom: '1px solid #EEEEEE' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', color: '#111111', marginBottom: 12 }}>
          Prêt à vous faire chouchouter ?
        </h2>
        <p style={{ color: '#888888', fontSize: 14, marginBottom: 24 }}>
          Réservez votre créneau en ligne en quelques secondes
        </p>
        <button className="btn-pub-primary" onClick={() => navigate('/reserver')}>
          <span className="material-symbols-outlined">calendar_month</span> Réserver maintenant
        </button>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="pub-footer">
        <div className="pub-footer-nom">PRESTIGE Salon Pro</div>
        <div className="pub-footer-sub">© 2024 — Tous droits réservés</div>
      </footer>

    </div>
  )
}

// ===== COMPOSANT APERÇU 4 SERVICES =====
function AperçuServices({ navigate }) {
  const [services, setServices] = useState([])

  useEffect(() => {
    fetch('http://localhost:3000/services')
      .then(r => r.json())
      .then(data => setServices(data.slice(0, 4)))
      .catch(() => {})
  }, [])

  const badgeCat = (cat) => {
    if (cat === 'homme') return <span className="pub-badge pub-badge-homme">♂ Homme</span>
    if (cat === 'femme') return <span className="pub-badge pub-badge-femme">♀ Femme</span>
    return <span className="pub-badge pub-badge-mixte">⚥ Mixte</span>
  }

  return (
    <div className="pub-catalog">
      {services.map(s => (
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
        </div>
      ))}
    </div>
  )
}

export default Home
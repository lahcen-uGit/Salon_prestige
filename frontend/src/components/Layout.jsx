import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/Layout.css'

const titles = {
  '/caisse':       'Caisse',
  '/paiements':    'Paiements',
  '/dashboard':    'Tableau de bord',
  '/reservations': 'Réservations',
  '/clients':      'Clients',
  '/employes':     'Employés',
  '/services':     'Services',
  '/parametres':   'Paramètres',
}

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const role     = localStorage.getItem('role')
  const nom      = localStorage.getItem('nom') || ''

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('nom')
    localStorage.removeItem('employe_id')
    navigate('/login')
  }

  const isActive = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <div className="app">

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">

        <div className="logo">
          <div className="logo-text">PRESTIGE</div>
          <div className="logo-sub">Salon Pro</div>
        </div>

        <nav className="nav">

          {/* ===== SECTION PRINCIPAL ===== */}
          <div className="nav-section">
            <div className="nav-label">Principal</div>

            <div className={isActive('/caisse')} onClick={() => navigate('/caisse')}>
              <span className="nav-icon"><span className="material-symbols-outlined">payments</span></span> Caisse
            </div>

            {/* Paiements — admin seulement */}
            {role === 'admin' && (
              <div className={isActive('/paiements')} onClick={() => navigate('/paiements')}>
                <span className="nav-icon"><span className="material-symbols-outlined">credit_card</span></span> Paiements
              </div>
            )}

            {/* Historique — employé seulement */}
            {role === 'employe' && (
              <div className={isActive('/paiements')} onClick={() => navigate('/paiements')}>
                <span className="nav-icon"><span className="material-symbols-outlined">receipt</span></span> Mon historique
              </div>
            )}

            <div className={isActive('/dashboard')} onClick={() => navigate('/dashboard')}>
              <span className="nav-icon"><span className="material-symbols-outlined">bar_chart</span></span> Dashboard
            </div>

            <div className={isActive('/reservations')} onClick={() => navigate('/reservations')}>
              <span className="nav-icon"><span className="material-symbols-outlined">calendar_month</span></span> Réservations
            </div>

          </div>

          {/* ===== SECTION GESTION ===== */}
          <div className="nav-section">
            <div className="nav-label">Gestion</div>

            {/* Admin seulement */}
            {role === 'admin' && (
              <>
                <div className={isActive('/clients')} onClick={() => navigate('/clients')}>
                  <span className="nav-icon"><span className="material-symbols-outlined">contacts</span></span> Clients
                </div>
                <div className={isActive('/employes')} onClick={() => navigate('/employes')}>
                  <span className="nav-icon"><span className="material-symbols-outlined">content_cut</span></span> Employés
                </div>
                <div className={isActive('/services')} onClick={() => navigate('/services')}>
                  <span className="nav-icon"><span className="material-symbols-outlined">room_service</span></span> Services
                </div>
                <div className={isActive('/parametres')} onClick={() => navigate('/parametres')}>
                  <span className="nav-icon"><span className="material-symbols-outlined">settings</span></span> Paramètres
                </div>
              </>
            )}

          </div>

        </nav>

        <div className="sidebar-footer">
          <div className="user-role">{role === 'admin' ? <><span className="material-symbols-outlined">workspace_premium</span> Admin</> : <><span className="material-symbols-outlined">content_cut</span> Employé</>}</div>
          <div className="user-nom">{nom}</div>
          <div className="logout-btn" onClick={handleLogout}><span className="material-symbols-outlined">logout</span> Déconnexion</div>
        </div>

      </aside>

      {/* ===== MAIN ===== */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-title">{titles[location.pathname] || 'PRESTIGE'}</div>
          <div className="topbar-right">
            <span className="text-muted text-sm"><span className="material-symbols-outlined">waving_hand</span> {nom}</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/caisse')}>
              <span className="material-symbols-outlined">payments</span> Nouveau paiement
            </button>
          </div>
        </header>
        <div className="content">
          {children}
        </div>
      </main>

    </div>
  )
}

export default Layout
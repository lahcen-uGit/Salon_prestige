import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'

function Login() {

  const [vue, setVue] = useState('choice')

  // ===== ADMIN =====
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [errorAdmin,   setErrorAdmin]   = useState('')
  const [loadingAdmin, setLoadingAdmin] = useState(false)

  // ===== EMPLOYÉ =====
  const [pin,        setPin]        = useState('')
  const [errorPin,   setErrorPin]   = useState('')
  const [loadingPin, setLoadingPin] = useState(false)

  const navigate = useNavigate()

  // ===== LOGIN ADMIN =====
  const handleLoginAdmin = async () => {
    setErrorAdmin('')
    setLoadingAdmin(true)
    try {
      const res  = await fetch('http://localhost:3000/auth/login-admin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('role',  data.role)
        localStorage.setItem('nom',   data.nom)
        setTimeout(() => navigate('/caisse'), 300)
      } else {
        setErrorAdmin(data.error || 'Erreur de connexion')
      }
    } catch {
      setErrorAdmin('Impossible de contacter le serveur')
    }
    setLoadingAdmin(false)
  }

  // ===== CLAVIER PIN =====
  const pinPress = (key) => {
    if (key === 'del') {
      setPin(p => p.slice(0, -1))
      return
    }
    if (pin.length >= 6) return
    const newPin = pin + key
    setPin(newPin)
    if (newPin.length === 6) {
      setTimeout(() => handleLoginEmploye(newPin), 200)
    }
  }

  // ===== LOGIN EMPLOYÉ =====
  const handleLoginEmploye = async (pinCode) => {
    setErrorPin('')
    setLoadingPin(true)
    try {
      const res  = await fetch('http://localhost:3000/auth/login-employe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code_pin: pinCode })
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('token',      data.token)
        localStorage.setItem('role',       data.role)
        localStorage.setItem('nom',        data.nom)
        localStorage.setItem('employe_id', data.employe_id)
        setTimeout(() => navigate('/caisse'), 300)
      } else {
        setErrorPin(data.error || 'Code PIN incorrect')
        setPin('')
      }
    } catch {
      setErrorPin('Impossible de contacter le serveur')
      setPin('')
    }
    setLoadingPin(false)
  }

  return (
    <div className="login-shell">

      {/* ===== VUE CHOIX ===== */}
      {vue === 'choice' && (
        <div className="login-box">

          {/* Logo cliquable → retour accueil */}
          <div className="login-logo"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}>
            <div className="login-logo-text">PRESTIGE</div>
            <div className="login-logo-sub">Salon Pro</div>
          </div>

          <div className="login-title">Connexion</div>
          <div className="login-sub">Vous êtes :</div>

          <button className="btn btn-primary w-full mb-12"
            onClick={() => { setVue('employe'); setErrorPin(''); setPin('') }}>
            <span className="material-symbols-outlined">content_cut</span> Employé
          </button>
          <button className="btn btn-outline w-full"
            onClick={() => { setVue('admin'); setErrorAdmin('') }}>
            <span className="material-symbols-outlined">workspace_premium</span> Administrateur
          </button>

          {/* Lien retour accueil */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span
              style={{ fontSize: 12, color: 'var(--admin-muted)', cursor: 'pointer' }}
              onClick={() => navigate('/')}>
              <span className="material-symbols-outlined">arrow_back</span> Retour à l'accueil
            </span>
          </div>

        </div>
      )}

      {/* ===== VUE ADMIN ===== */}
      {vue === 'admin' && (
        <div className="login-box">
          <button className="back-link" onClick={() => setVue('choice')}>
            <span className="material-symbols-outlined">arrow_back</span> Retour
          </button>

          <div className="login-title">Espace administrateur</div>
          <div className="login-sub">Connectez-vous avec votre email et mot de passe.</div>

          {errorAdmin && <div className="login-error">{errorAdmin}</div>}

          <div className="form-group mb-14">
            <label className="form-label">Adresse e-mail</label>
            <input className="form-input" type="email"
              placeholder="admin@prestige.ma"
              value={email}
              onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-group mb-20">
            <label className="form-label">Mot de passe</label>
            <input className="form-input" type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLoginAdmin()} />
          </div>

          <button className="btn btn-primary w-full"
            onClick={handleLoginAdmin}
            disabled={loadingAdmin}>
            {loadingAdmin ? <><span className="material-symbols-outlined">hourglass_empty</span> Connexion...</> : <><span className="material-symbols-outlined">lock</span> Se connecter</>}
          </button>
        </div>
      )}

      {/* ===== VUE EMPLOYÉ ===== */}
      {vue === 'employe' && (
        <div className="login-box">
          <button className="back-link" onClick={() => setVue('choice')}>
            <span className="material-symbols-outlined">arrow_back</span> Retour
          </button>

          <div className="login-title">Espace employé</div>
          <div className="login-sub">Saisissez votre code PIN à 6 chiffres.</div>

          <div className="pin-dots">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`} />
            ))}
          </div>

          <div className="pin-error">{errorPin}</div>

          <div className="pin-pad">
            {['1','2','3','4','5','6','7','8','9'].map(k => (
              <button key={k} className="pin-key" onClick={() => pinPress(k)}>{k}</button>
            ))}
            <div></div>
            <button className="pin-key" onClick={() => pinPress('0')}>0</button>
            <button className="pin-key pin-key-del" onClick={() => pinPress('del')}><span className="material-symbols-outlined">backspace</span></button>
          </div>

          {loadingPin && <div className="pin-loading"><span className="material-symbols-outlined">hourglass_empty</span> Vérification...</div>}

        </div>
      )}

    </div>
  )
}

export default Login
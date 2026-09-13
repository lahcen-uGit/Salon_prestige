import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout         from './components/Layout'
import Login          from './pages/Login'
import Home           from './pages/pages_public/Home'
import ServicesPublic from './pages/pages_public/ServicesPublic'
import Reserver       from './pages/pages_public/Reserver'
import Caisse         from './pages/Caisse'
import Paiements      from './pages/Paiements'
import Dashboard      from './pages/Dashboard'
import Reservations   from './pages/Reservations'
import Employes       from './pages/Employes'
import Services       from './pages/Services'
import Clients        from './pages/Clients'
import Parametres     from './pages/Parametres'

function App() {
  const token = localStorage.getItem('token')
  const role  = localStorage.getItem('role')

  return (
    <BrowserRouter>
      <Routes>

        {/* ===== PAGES PUBLIQUES ===== */}
        <Route path="/"            element={<Home />} />
        <Route path="/prestations" element={<ServicesPublic />} />
        <Route path="/reserver"    element={<Reserver />} />
        <Route path="/login"       element={<Login />} />

        {/* ===== PAGES PROTÉGÉES — tous ===== */}
        <Route path="/caisse" element={
          token ? <Layout><Caisse /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/paiements" element={
          token ? <Layout><Paiements /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/dashboard" element={
          token ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/reservations" element={
          token ? <Layout><Reservations /></Layout> : <Navigate to="/login" />
        } />

        {/* ===== PAGES ADMIN SEULEMENT ===== */}
        <Route path="/clients" element={
          token && role === 'admin'
            ? <Layout><Clients /></Layout>
            : <Navigate to="/login" />
        } />
        <Route path="/employes" element={
          token && role === 'admin'
            ? <Layout><Employes /></Layout>
            : <Navigate to="/login" />
        } />
        <Route path="/services" element={
          token && role === 'admin'
            ? <Layout><Services /></Layout>
            : <Navigate to="/login" />
        } />
        <Route path="/parametres" element={
          token && role === 'admin'
            ? <Layout><Parametres /></Layout>
            : <Navigate to="/login" />
        } />

        {/* ===== REDIRECTION ===== */}
        <Route path="*" element={
          <Navigate to={token ? '/caisse' : '/'} />
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App
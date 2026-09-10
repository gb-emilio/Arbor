import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useToast } from './hooks/useToast'
import Toast from './components/Toast'
import LoginPage from './pages/LoginPage'
import TreePage from './pages/TreePage'
import UsersPage from './pages/UsersPage'
import GuidePage from './pages/GuidePage'
import EmailTemplatePage from './pages/EmailTemplatePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import DataProcessingPolicyPage from './pages/DataProcessingPolicyPage'

function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-logo"></div>
        <div className="topbar-right">
          <Link to="/guia" style={{
            fontSize:12, color:'var(--muted)', textDecoration:'none',
            display:'flex', alignItems:'center', gap:5,
            padding:'4px 10px', borderRadius:'var(--radius-sm)',
            border:'0.5px solid var(--border)', transition:'color .15s'
          }}>
            <i className="ti ti-eye" style={{fontSize:13}}/> Ver guía pública
          </Link>
          <i className="ti ti-user-circle" style={{fontSize:16, marginLeft:8}}/>
          <span>{user?.username}</span>
          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>{user?.role}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <i className="ti ti-logout"/> Salir
          </button>
        </div>
      </header>

      <nav className="sidebar">
        <div className="sidebar-nav">
          <div className="nav-section">Principal</div>
          <NavLink to="/tree" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
            <i className="ti ti-git-branch" style={{fontSize:15}}/> Árbol de preguntas
          </NavLink>
          {isAdmin && <>
            <div className="nav-section">Administración</div>
            <NavLink to="/users" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
              <i className="ti ti-users" style={{fontSize:15}}/> Usuarios
            </NavLink>
            <NavLink to="/email-template" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
              <i className="ti ti-mail-cog" style={{fontSize:15}}/> Plantilla de email
            </NavLink>
          </>}
          <div className="nav-section" style={{marginTop:'auto'}}>Acceso público</div>
          <NavLink to="/guia" className={({isActive}) => 'nav-item' + (isActive ? ' active' : '')}>
            <i className="ti ti-eye" style={{fontSize:15}}/> Ver guía pública
          </NavLink>
        </div>
      </nav>

      <main className="main-area">
        <Routes>
          <Route path="/tree"  element={<TreePage toast={toast}/>}/>
          <Route path="/users" element={isAdmin ? <UsersPage toast={toast}/> : <Navigate to="/tree"/>}/>
          <Route path="/email-template" element={isAdmin ? <EmailTemplatePage toast={toast}/> : <Navigate to="/tree"/>}/>
          <Route path="/guia"  element={<GuidePage/>}/>
          <Route path="*"      element={<Navigate to="/tree"/>}/>
        </Routes>
      </main>

      <Toast toasts={toast.toasts}/>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace/>
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/tree" replace/> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas completamente públicas (sin shell de admin) */}
          <Route path="/guia"  element={<GuidePage/>}/>
          <Route path="/politica-privacidad" element={<PrivacyPolicyPage/>}/>
          <Route path="/politica-tratamiento-datos" element={<DataProcessingPolicyPage/>}/>
          <Route path="/login" element={<PublicRoute><LoginPage/></PublicRoute>}/>
          {/* Rutas protegidas */}
          <Route path="/*"     element={<ProtectedRoute><Layout/></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

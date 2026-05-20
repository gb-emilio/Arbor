import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useToast } from './hooks/useToast'
import Toast from './components/Toast'
import LoginPage from './pages/LoginPage'
import TreePage from './pages/TreePage'
import UsersPage from './pages/UsersPage'

function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="app-shell">
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v4M8 5l4-2 4 2M5 9h14M7 9v3a2 2 0 002 2h6a2 2 0 002-2V9M12 14v3M9 17h6M10 20h4"/>
          </svg>
          ArborQ
        </div>
        <div className="topbar-right">
          <i className="ti ti-user-circle" style={{fontSize:16}}/>
          <span>{user?.username}</span>
          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>{user?.role}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <i className="ti ti-logout"/> Salir
          </button>
        </div>
      </header>

      {/* Sidebar */}
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
          </>}
        </div>
      </nav>

      {/* Main */}
      <main className="main-area">
        <Routes>
          <Route path="/tree"  element={<TreePage toast={toast}/>}/>
          <Route path="/users" element={isAdmin ? <UsersPage toast={toast}/> : <Navigate to="/tree"/>}/>
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage/></PublicRoute>}/>
          <Route path="/*"     element={<ProtectedRoute><Layout/></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/tree" replace/> : children
}

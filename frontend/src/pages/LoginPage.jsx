import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../api/client'

export default function LoginPage() {
  const { login } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username:'', email:'', password:'' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (mode === 'login') {
        const res = await auth.login({ username: form.username, password: form.password })
        login(res.token, { username: res.username, email: res.email, role: res.role })
      } else {
        // El registro NO devuelve token: la cuenta queda pendiente de
        // activación por un administrador. Mostramos el mensaje y
        // volvemos a la pestaña de inicio de sesión.
        const res = await auth.register({ username: form.username, email: form.email, password: form.password })
        setSuccess(res.message || 'Registro completado. Tu cuenta está pendiente de activación.')
        setMode('login')
        setForm(f => ({ ...f, password: '' }))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, var(--gold-pale) 0%, var(--cream) 55%)'
    }}>
      <div style={{width:380}}>
        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:32}}>
          <p style={{color:'var(--muted)', fontSize:14}}>Gestión de árbol de preguntas</p>
        </div>

        <div className="card" style={{boxShadow:'var(--shadow-md)'}}>
          {/* Tabs */}
          <div style={{display:'flex', borderBottom:'0.5px solid var(--border)', marginBottom:24, marginLeft:-24, marginRight:-24, paddingLeft:24}}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{
                  padding:'10px 16px', border:'none', background:'none', cursor:'pointer',
                  fontFamily:'var(--font-sans)', fontSize:13, fontWeight: mode===m ? 500 : 400,
                  color: mode===m ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: mode===m ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom:-1
                }}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            <div className="field-group">
              <label className="field-label">Usuario</label>
              <input className="field" value={form.username} onChange={set('username')}
                placeholder="nombre_usuario" autoFocus required/>
            </div>
            {mode === 'register' && (
              <div className="field-group">
                <label className="field-label">Email</label>
                <input className="field" type="email" value={form.email} onChange={set('email')}
                  placeholder="correo@ejemplo.com" required/>
              </div>
            )}
            <div className="field-group">
              <label className="field-label">Contraseña</label>
              <input className="field" type="password" value={form.password} onChange={set('password')}
                placeholder={mode==='register' ? 'Mínimo 8 caracteres' : '••••••••'} required/>
            </div>

            {success && (
              <div style={{background:'var(--gold-pale)', color:'var(--terracotta)', padding:'10px 12px',
                borderRadius:'var(--radius-sm)', fontSize:13, marginBottom:16, lineHeight:1.5}}>
                <i className="ti ti-clock" style={{fontSize:14, marginRight:6}}/>
                {success}
              </div>
            )}

            {error && (
              <div style={{background:'var(--danger-bg)', color:'var(--danger)', padding:'8px 12px',
                borderRadius:'var(--radius-sm)', fontSize:13, marginBottom:16}}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading
                ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Cargando...</>
                : mode === 'login' ? 'Entrar' : 'Crear cuenta'
              }
            </button>
          </form>

          {mode === 'login' && (
            <p style={{textAlign:'center', marginTop:16, fontSize:12, color:'var(--faint)'}}>
              Admin por defecto: <code>admin</code> / <code>Admin1234!</code>
            </p>
          )}

          <div style={{textAlign:'center', marginTop:20, paddingTop:16, borderTop:'0.5px solid var(--border)'}}>
            <Link to="/guia" style={{
              fontSize:13, color:'var(--accent)', textDecoration:'none',
              display:'inline-flex', alignItems:'center', gap:6,
              fontWeight:500
            }}>
              <i className="ti ti-eye" style={{fontSize:14}}/>
              Acceder a la guía pública sin registrarse
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

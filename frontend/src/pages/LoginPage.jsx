import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { auth } from '../api/client'

export default function LoginPage() {
  const { login } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username:'', email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      let res
      if (mode === 'login') {
        res = await auth.login({ username: form.username, password: form.password })
      } else {
        res = await auth.register({ username: form.username, email: form.email, password: form.password })
      }
      login(res.token, { username: res.username, email: res.email, role: res.role })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #d8f3dc 0%, #f7f6f3 60%)'
    }}>
      <div style={{width:380}}>
        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:32}}>
          <div style={{fontFamily:'var(--font-serif)', fontSize:36, color:'var(--accent)', marginBottom:6}}>
            ArborQ
          </div>
          <p style={{color:'var(--muted)', fontSize:14}}>Gestión de árbol de preguntas</p>
        </div>

        <div className="card" style={{boxShadow:'var(--shadow-md)'}}>
          {/* Tabs */}
          <div style={{display:'flex', borderBottom:'0.5px solid var(--border)', marginBottom:24, marginLeft:-24, marginRight:-24, paddingLeft:24}}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
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
        </div>
      </div>
    </div>
  )
}

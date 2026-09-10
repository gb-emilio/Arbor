import { useState } from 'react'
import { pub } from '../api/client'
import { NATIONALITIES } from '../data/nationalities'
import Modal from './Modal'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Permite un + opcional al principio y solo dígitos después (mínimo 6 dígitos)
const PHONE_RE = /^\+?\d{6,15}$/

/**
 * Modal de captura de datos para el envío de la solución por email.
 * Exige aceptación explícita de dos consentimientos (privacidad y
 * tratamiento de datos), cada uno con enlace a su política — ambos
 * abren en pestaña nueva para no perder el formulario ya rellenado.
 */
export default function SendSolutionModal({ nodeId, onClose }) {
  const [form, setForm] = useState({
    nombre: '', apellidos: '', nacionalidad: '', telefono: '', email: '',
    aceptaPrivacidad: false, aceptaTratamiento: false,
  })
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setBool = k => e => setForm(f => ({ ...f, [k]: e.target.checked }))
  const markTouched = k => () => setTouched(t => ({ ...t, [k]: true }))

  /** Filtra el teléfono mientras se escribe: solo dígitos, con un '+' opcional al principio */
  const onPhoneChange = e => {
    let v = e.target.value
    const hasPlus = v.trim().startsWith('+')
    v = v.replace(/[^\d]/g, '') // quita todo lo que no sea dígito
    setForm(f => ({ ...f, telefono: (hasPlus ? '+' : '') + v }))
  }

  const emailValid = EMAIL_RE.test(form.email.trim())
  const phoneValid = PHONE_RE.test(form.telefono.trim())

  const allFilled = form.nombre.trim() && form.apellidos.trim() && form.nacionalidad.trim()
    && form.telefono.trim() && form.email.trim()
  const canSubmit = allFilled && emailValid && phoneValid
    && form.aceptaPrivacidad && form.aceptaTratamiento && status !== 'sending'

  const submit = async e => {
    e.preventDefault()
    setTouched({ nombre:true, apellidos:true, nacionalidad:true, telefono:true, email:true })
    if (!canSubmit) return
    setStatus('sending'); setError('')
    try {
      await pub.sendSolution(nodeId, form)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'No se pudo enviar el email. Inténtalo de nuevo.')
    }
  }

  const inputStyle = {
    width:'100%', padding:'9px 12px', border:'1.5px solid var(--border-md)',
    borderRadius:'var(--radius-sm)', fontFamily:'var(--ff-body)', fontSize:15,
    color:'var(--ink)', background:'var(--cream-dark)', outline:'none',
  }
  const inputErrorStyle = { ...inputStyle, borderColor:'#dc2626' }
  const labelStyle = {
    display:'block', fontFamily:'var(--ff-ui)', fontSize:11, fontWeight:600,
    letterSpacing:'.06em', textTransform:'uppercase', color:'var(--muted)', marginBottom:4,
  }
  const errorTextStyle = {
    fontFamily:'var(--ff-ui)', fontSize:11, color:'#dc2626', marginTop:4,
  }

  // ── Pantalla de éxito ────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <Modal title="Solución enviada" onClose={onClose}>
        <div style={{ textAlign:'center', padding:'12px 0' }}>
          <div style={{
            width:52, height:52, borderRadius:'50%', margin:'0 auto 14px',
            background:'var(--gold-pale)', display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            <i className="ti ti-mail-check" style={{ fontSize:24, color:'var(--gold)' }}/>
          </div>
          <p style={{ fontFamily:'var(--ff-ui)', fontSize:14, color:'var(--ink-soft)', lineHeight:1.6 }}>
            Hemos enviado la solución a <strong>{form.email}</strong>. Revisa también la carpeta de spam si no la ves en unos minutos.
          </p>
          <button className="btn btn-primary" style={{ marginTop:20 }} onClick={onClose}>Cerrar</button>
        </div>
      </Modal>
    )
  }

  // ── Formulario ───────────────────────────────────────────────────────
  return (
    <Modal title="Enviar solución a mi email" onClose={onClose}>
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input style={inputStyle} value={form.nombre} onChange={set('nombre')} required/>
          </div>
          <div>
            <label style={labelStyle}>Apellidos *</label>
            <input style={inputStyle} value={form.apellidos} onChange={set('apellidos')} required/>
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={labelStyle}>Nacionalidad *</label>
          <select
            style={{ ...inputStyle, cursor:'pointer' }}
            value={form.nacionalidad}
            onChange={set('nacionalidad')}
            onBlur={markTouched('nacionalidad')}
            required
          >
            <option value="">Selecciona tu nacionalidad…</option>
            {NATIONALITIES.map(n => (
              <option key={n.code} value={n.label}>{n.flag} {n.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
          <div>
            <label style={labelStyle}>Teléfono *</label>
            <input
              style={touched.telefono && !phoneValid ? inputErrorStyle : inputStyle}
              type="tel" inputMode="tel"
              placeholder="+34 600 000 000"
              value={form.telefono} onChange={onPhoneChange} onBlur={markTouched('telefono')}
              required
            />
            {touched.telefono && !phoneValid && (
              <div style={errorTextStyle}>Introduce un número válido (solo dígitos, con + opcional)</div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input
              style={touched.email && !emailValid ? inputErrorStyle : inputStyle}
              type="email"
              value={form.email} onChange={set('email')} onBlur={markTouched('email')}
              required
            />
            {touched.email && !emailValid && (
              <div style={errorTextStyle}>Introduce un email válido</div>
            )}
          </div>
        </div>

        {/* Consentimientos RGPD */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16,
          padding:'12px 14px', background:'var(--cream-dark)', borderRadius:'var(--radius-sm)' }}>
          <label style={{ display:'flex', alignItems:'flex-start', gap:8, cursor:'pointer' }}>
            <input type="checkbox" checked={form.aceptaPrivacidad} onChange={setBool('aceptaPrivacidad')}
              style={{ marginTop:3, flexShrink:0 }}/>
            <span style={{ fontFamily:'var(--ff-ui)', fontSize:13, color:'var(--ink-soft)', lineHeight:1.5 }}>
              He leído y acepto la{' '}
              <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer" style={{ color:'var(--gold)', fontWeight:600 }}>
                Política de Privacidad
              </a>
            </span>
          </label>
          <label style={{ display:'flex', alignItems:'flex-start', gap:8, cursor:'pointer' }}>
            <input type="checkbox" checked={form.aceptaTratamiento} onChange={setBool('aceptaTratamiento')}
              style={{ marginTop:3, flexShrink:0 }}/>
            <span style={{ fontFamily:'var(--ff-ui)', fontSize:13, color:'var(--ink-soft)', lineHeight:1.5 }}>
              Acepto el{' '}
              <a href="/politica-tratamiento-datos" target="_blank" rel="noopener noreferrer" style={{ color:'var(--gold)', fontWeight:600 }}>
                Tratamiento de mis Datos Personales
              </a>
            </span>
          </label>
        </div>

        {status === 'error' && (
          <div style={{ background:'#fee2e2', color:'#991b1b', padding:'9px 12px',
            borderRadius:'var(--radius-sm)', fontFamily:'var(--ff-ui)', fontSize:13, marginBottom:14 }}>
            {error}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {status === 'sending'
              ? <><div className="spinner" style={{ width:14, height:14, borderWidth:2 }}/> Enviando…</>
              : <><i className="ti ti-send"/> Enviar solución</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

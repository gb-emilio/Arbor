import { useState, useEffect, useCallback, useRef } from 'react'
import { pub } from '../api/client'

const API = import.meta.env.VITE_API_URL ?? ''

/* ── Detectar si estamos dentro de un iframe ─────────── */
const IN_IFRAME = (() => { try { return window.self !== window.top } catch { return true } })()

/* ── Notificar altura al padre (WordPress) ───────────── */
function notifyHeight() {
  if (!IN_IFRAME) return
  const h = document.documentElement.scrollHeight
  window.parent.postMessage({ type: 'arborq-height', height: h }, '*')
}

/* ── Transición de entrada ───────────────────────────── */
function useEnter(key) {
  const [v, setV] = useState(false)
  useEffect(() => {
    setV(false)
    const t = requestAnimationFrame(() => { requestAnimationFrame(() => setV(true)) })
    return () => cancelAnimationFrame(t)
  }, [key])
  return v
    ? { opacity: 1, transform: 'translateY(0)', transition: 'opacity .3s ease, transform .3s ease' }
    : { opacity: 0, transform: 'translateY(12px)' }
}

/* ── Spinner ─────────────────────────────────────────── */
function Loading() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 0', gap:14, color:'var(--muted)' }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:'2.5px solid var(--gold-pale)', borderTopColor:'var(--gold)', animation:'spin .7s linear infinite' }}/>
      <span style={{ fontFamily:'var(--ff-ui)', fontSize:13 }}>Cargando...</span>
    </div>
  )
}

/* ── Error ───────────────────────────────────────────── */
function ErrorScreen({ onRetry }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--muted)' }}>
      <i className="ti ti-wifi-off" style={{ fontSize:36, display:'block', marginBottom:12, color:'var(--faint)' }}/>
      <p style={{ fontFamily:'var(--ff-ui)', fontSize:14, marginBottom:16 }}>No se pudo cargar el árbol de preguntas.</p>
      <button className="btn btn-primary" onClick={onRetry}>Reintentar</button>
    </div>
  )
}

/* ── Botón Volver ────────────────────────────────────── */
function BackButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap:6, marginBottom:24,
      padding:'5px 10px', background:'transparent', border:'none', cursor:'pointer',
      fontFamily:'var(--ff-ui)', fontSize:12, fontWeight:500, letterSpacing:'.06em', textTransform:'uppercase',
      color:'var(--muted)', borderRadius:'var(--radius-sm)', transition:'color .18s, background .18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-pale)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}>
      <i className="ti ti-arrow-left" style={{ fontSize:13 }}/>
      {label.length > 38 ? label.slice(0, 36) + '…' : label}
    </button>
  )
}

/* ── Línea decorativa dorada ─────────────────────────── */
function GoldRule() {
  return <div style={{ width:40, height:2, background:'linear-gradient(90deg,var(--gold),transparent)', margin:'14px 0 20px' }}/>
}

/* ══════════════════════════════════════════════════════
   VISTA INICIAL — imagen de la abogada + bienvenida
══════════════════════════════════════════════════════ */
/* Botón "Empezar ahora" — vista inicial, sin texto ni picker */
function StartButton({ onStart }) {
  const style = useEnter('start')
  return (
    <div style={{ ...style, display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 24px' }}>
      <button
        onClick={onStart}
        style={{
          display:'inline-flex', alignItems:'center', gap:10,
          padding:'18px 48px', background:'var(--gold)', color:'#fff',
          border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer',
          fontFamily:'var(--ff-ui)', fontSize:'1.1rem', fontWeight:600,
          letterSpacing:'.06em', textTransform:'uppercase',
          transition:'background .2s, transform .15s, box-shadow .2s',
          boxShadow:'0 6px 24px rgba(140,4,4,.35)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background='var(--terracotta)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(92,3,3,.4)' }}
        onMouseLeave={e => { e.currentTarget.style.background='var(--gold)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 6px 24px rgba(140,4,4,.35)' }}>
        <i className="ti ti-arrow-right" style={{ fontSize:20 }}/>
        Empezar ahora
      </button>
    </div>
  )
}

/* Picker de raíces — aparece después del botón, reemplazándolo */
function RootPicker({ roots, onSelect, onBack }) {
  const style = useEnter('picker')
  return (
    <div style={{ ...style }}>
      <p style={{ fontFamily:'var(--ff-ui)', fontSize:13, color:'var(--muted)', marginBottom:14 }}>Elige el área de tu consulta:</p>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {roots.map((r, i) => (
          <button key={r.id} onClick={() => onSelect(r)} style={{
            display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
            background:'var(--surface)', border:'1.5px solid var(--border)', borderRadius:'var(--radius)',
            cursor:'pointer', textAlign:'left', width:'100%',
            fontFamily:'var(--ff-ui)', transition:'border-color .18s, box-shadow .18s, transform .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--gold)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(140,4,4,.15)'; e.currentTarget.style.transform='translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none' }}>
            <span style={{ width:36, height:36, borderRadius:'50%', flexShrink:0, background:'var(--gold-pale)', color:'var(--terracotta)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--ff-display)', fontSize:15, fontWeight:700 }}>{i + 1}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)', lineHeight:1.4 }}>{r.text}</div>
              {r.description && <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{r.description}</div>}
            </div>
            <i className="ti ti-arrow-right" style={{ fontSize:15, color:'var(--gold)', flexShrink:0 }}/>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   VISTA DE PREGUNTA
══════════════════════════════════════════════════════ */
function QuestionCard({ node, onAnswer, onBack, breadcrumb }) {
  const style = useEnter(node.id)
  const linked   = (node.options || []).filter(o => o.targetNodeId)
  const unlinked = (node.options || []).filter(o => !o.targetNodeId)

  return (
    <div style={{ ...style }}>
      {breadcrumb.length > 0 && (
        <BackButton label={breadcrumb[breadcrumb.length - 1].text} onClick={() => onBack()}/>
      )}

      {/* Tarjeta pregunta */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'24px 24px 20px',
        boxShadow:'var(--shadow)', marginBottom:14,
        borderLeft:'3px solid var(--gold)',
      }}>
        <span style={{ fontFamily:'var(--ff-ui)', fontSize:'.65rem', fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--gold)' }}>
          Pregunta {breadcrumb.length + 1}
        </span>
        <h2 style={{ marginTop:8, lineHeight:1.3, fontSize:'clamp(1.2rem,2.5vw,1.6rem)' }}>{node.text}</h2>
        {node.description && <p style={{ fontFamily:'var(--ff-body)', color:'var(--muted)', fontSize:'1rem', lineHeight:1.65, marginTop:8, marginBottom:0 }}>{node.description}</p>}
      </div>

      {/* Opciones */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {linked.map((o, i) => (
          <button key={o.id || i} onClick={() => onAnswer(o)} style={{
            display:'flex', alignItems:'center', gap:14, padding:'13px 16px',
            background:'var(--surface)', border:'1.5px solid var(--border)',
            borderRadius:'var(--radius)', cursor:'pointer', textAlign:'left', width:'100%',
            fontFamily:'var(--ff-ui)', transition:'border-color .18s, background .18s, transform .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--gold)'; e.currentTarget.style.background='var(--gold-pale)'; e.currentTarget.style.transform='translateX(3px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.transform='none' }}>
            <span style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, background:'var(--cream-dark)', color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, fontFamily:'var(--ff-ui)' }}>
              {String.fromCharCode(65 + i)}
            </span>
            <span style={{ flex:1, fontSize:14, fontWeight:500, color:'var(--ink)' }}>{o.label}</span>
            <i className="ti ti-chevron-right" style={{ fontSize:13, color:'var(--gold)', flexShrink:0 }}/>
          </button>
        ))}
      </div>

      {unlinked.length > 0 && (
        <div style={{ marginTop:10 }}>
          <div style={{ fontFamily:'var(--ff-ui)', fontSize:11, color:'var(--faint)', marginBottom:6, letterSpacing:'.05em' }}>Sin resultado asignado aún</div>
          {unlinked.map(o => (
            <div key={o.id} style={{ padding:'8px 14px', borderRadius:'var(--radius-sm)', background:'var(--cream-dark)', color:'var(--muted)', fontFamily:'var(--ff-ui)', fontSize:13, marginBottom:5, display:'flex', alignItems:'center', gap:8 }}>
              <i className="ti ti-minus" style={{ fontSize:10 }}/>{o.label}
            </div>
          ))}
        </div>
      )}

      {linked.length === 0 && unlinked.length === 0 && (
        <div style={{ textAlign:'center', padding:'20px', color:'var(--faint)', fontFamily:'var(--ff-ui)', fontSize:13 }}>
          Esta pregunta no tiene opciones configuradas.
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   RECUADRO DE SERVICIO
══════════════════════════════════════════════════════ */
function ServiceBox({ icon, accentColor, accentBg, title, subtitle, children }) {
  return (
    <div style={{ border:'1px solid var(--border)', borderRadius:'var(--radius)', background:'var(--surface)', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid var(--border)', background:accentBg }}>
        <span style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background:accentColor, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className={`ti ${icon}`} style={{ fontSize:15, color:'#fff' }}/>
        </span>
        <div>
          <div style={{ fontFamily:'var(--ff-ui)', fontSize:13, fontWeight:600, color:'var(--ink)' }}>{title}</div>
          {subtitle && <div style={{ fontFamily:'var(--ff-ui)', fontSize:11, color:'var(--muted)', marginTop:1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding:'12px 16px' }}>{children}</div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   VISTA DE RESULTADO (HOJA) — sin scroll, crece todo
══════════════════════════════════════════════════════ */
function LeafCard({ node, onBack, breadcrumb }) {
  const style = useEnter(node.id)
  const hasPdf      = !!node.pdf
  const hasLink     = !!node.serviceLinkUrl
  const hasPaypal   = !!node.paypalButtonId
  const hasCalendly = !!node.calendlyUrl
  const hasServices = hasLink || hasPaypal || hasCalendly

  return (
    <div style={{ ...style }}>

      {/* Volver */}
      {breadcrumb.length > 0 && (
        <BackButton label={breadcrumb[breadcrumb.length - 1].text} onClick={() => onBack()}/>
      )}

      {/* Check + título */}
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ width:52, height:52, borderRadius:'50%', margin:'0 auto 10px', background:'var(--gold-pale)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className="ti ti-check" style={{ fontSize:22, color:'var(--gold)' }}/>
        </div>
        <span style={{ fontFamily:'var(--ff-ui)', fontSize:'.62rem', fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--gold)' }}>Resultado encontrado</span>
      </div>

      {/* Tarjeta principal */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'24px',
        boxShadow:'0 4px 20px rgba(184,150,62,.08)',
        borderTop:'3px solid var(--gold)', marginBottom:14,
      }}>
        <h2 style={{ textAlign:'center', lineHeight:1.3, marginBottom:node.description ? 10 : 16, fontSize:'clamp(1.2rem,2.5vw,1.7rem)' }}>{node.text}</h2>
        {node.description && <p style={{ fontFamily:'var(--ff-body)', color:'var(--muted)', fontSize:'1rem', lineHeight:1.7, textAlign:'center', marginBottom:16 }}>{node.description}</p>}

        {hasPdf ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--cream-dark)', borderRadius:'var(--radius-sm)', marginBottom:14, border:'1px solid var(--border)' }}>
              <i className="ti ti-file-type-pdf" style={{ fontSize:22, color:'var(--danger)', flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'var(--ff-ui)', fontSize:13, fontWeight:500 }}>{node.pdf.filename}</div>
                {node.pdf.fileSize && <div style={{ fontFamily:'var(--ff-ui)', fontSize:11, color:'var(--faint)' }}>{(node.pdf.fileSize / 1024).toFixed(1)} KB</div>}
              </div>
            </div>
            <div style={{ textAlign:'center' }}>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API}/api/v1/nodes/${node.id}/pdf`)
                    if (!res.ok) throw new Error()
                    const blob = await res.blob()
                    const a = Object.assign(document.createElement('a'), {
                      href: URL.createObjectURL(blob), download: node.pdf.filename
                    })
                    document.body.appendChild(a); a.click()
                    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 100)
                  } catch { alert('No se pudo descargar el PDF.') }
                }}
                className="btn btn-primary">
                <i className="ti ti-download"/>
                Descargar documento PDF
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding:'16px', background:'var(--cream-dark)', borderRadius:'var(--radius-sm)', color:'var(--muted)', fontFamily:'var(--ff-ui)', fontSize:13, textAlign:'center' }}>
            <i className="ti ti-file-off" style={{ fontSize:20, display:'block', marginBottom:6, color:'var(--faint)' }}/>
            El documento no está disponible aún.
          </div>
        )}
      </div>

      {/* Servicios adicionales */}
      {hasServices && (
        <div style={{ marginBottom:14 }}>
          <div style={{ fontFamily:'var(--ff-ui)', fontSize:'.62rem', fontWeight:600, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--faint)', marginBottom:8, paddingLeft:2 }}>
            Servicios adicionales
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

            {hasLink && (
              <ServiceBox icon="ti-external-link" accentColor="var(--gold)" accentBg="var(--gold-pale)"
                title={node.serviceLinkLabel || 'Más información'} subtitle="Accede al recurso externo">
                <a href={node.serviceLinkUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary" style={{ background:'var(--gold)', borderColor:'var(--gold)', fontSize:12 }}
                  onMouseEnter={e => { e.currentTarget.style.background='var(--terracotta)'; e.currentTarget.style.borderColor='var(--terracotta)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='var(--gold)'; e.currentTarget.style.borderColor='var(--gold)' }}>
                  <i className="ti ti-arrow-right"/>{node.serviceLinkLabel || 'Ir al enlace'}
                </a>
              </ServiceBox>
            )}

            {hasPaypal && (
              <ServiceBox icon="ti-file-check" accentColor="var(--terracotta)" accentBg="var(--gold-pale)"
                title="Revisión de documentación" subtitle="Servicio de revisión profesional">
                <p style={{ fontFamily:'var(--ff-body)', fontSize:'1rem', color:'var(--muted)', lineHeight:1.6, marginBottom:12 }}>
                  Nuestro equipo revisará tu documentación y te proporcionará un informe detallado con observaciones y recomendaciones.
                </p>
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                  <input type="hidden" name="cmd" value="_s-xclick"/>
                  <input type="hidden" name="hosted_button_id" value={node.paypalButtonId}/>
                  <input type="hidden" name="currency_code" value="EUR"/>
                  <button type="submit" className="btn" style={{ background:'var(--terracotta)', color:'#fff', borderColor:'var(--terracotta)', fontSize:12 }}
                    onMouseEnter={e => e.currentTarget.style.background='#3a0202'}
                    onMouseLeave={e => e.currentTarget.style.background='var(--terracotta)'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.643-8.993 6.643H9.39l-1.167 7.4h3.633a.641.641 0 0 0 .633-.54l.026-.13.502-3.177.032-.176a.641.641 0 0 1 .634-.54h.398c2.58 0 4.598-.943 5.19-3.67.247-1.13.12-2.07-.449-2.73z"/></svg>
                    Pagar con PayPal
                  </button>
                </form>
              </ServiceBox>
            )}

            {hasCalendly && (
              <ServiceBox icon="ti-calendar" accentColor="var(--gold-light)" accentBg="var(--gold-pale)"
                title="Reservar cita" subtitle="Elige el horario que te convenga">
                <p style={{ fontFamily:'var(--ff-body)', fontSize:'1rem', color:'var(--muted)', lineHeight:1.6, marginBottom:12 }}>
                  Agenda una consulta personalizada. Elige día y hora directamente en el calendario.
                </p>
                <a href={node.calendlyUrl} target="_blank" rel="noopener noreferrer"
                  className="btn" style={{ background:'var(--gold-light)', color:'#fff', borderColor:'var(--gold-light)', fontSize:12 }}
                  onMouseEnter={e => { e.currentTarget.style.background='var(--gold)'; e.currentTarget.style.borderColor='var(--gold)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='var(--gold-light)'; e.currentTarget.style.borderColor='var(--gold-light)' }}>
                  <i className="ti ti-calendar-event"/>Reservar cita
                </a>
              </ServiceBox>
            )}
          </div>
        </div>
      )}

      {/* Recorrido */}
      {breadcrumb.length > 0 && (
        <div style={{ marginBottom:16, padding:'16px 16px 12px', background:'var(--cream-dark)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
          <div style={{ fontFamily:'var(--ff-ui)', fontSize:'.62rem', fontWeight:600, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--faint)', marginBottom:10 }}>Tu recorrido</div>
          {breadcrumb.map((b, i) => (
            <div key={b.id} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:4 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold)', flexShrink:0 }}/>
                {i < breadcrumb.length - 1 && <div style={{ width:1, height:16, background:'var(--border-md)', margin:'2px 0' }}/>}
              </div>
              <div>
                <div style={{ fontFamily:'var(--ff-ui)', fontSize:12, color:'var(--muted)' }}>{b.text}</div>
                {b._selectedLabel && <div style={{ fontFamily:'var(--ff-ui)', fontSize:11, color:'var(--gold)', marginTop:1 }}>→ {b._selectedLabel}</div>}
              </div>
            </div>
          ))}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--terracotta)', flexShrink:0 }}/>
            <div style={{ fontFamily:'var(--ff-ui)', fontSize:12, fontWeight:600, color:'var(--terracotta)' }}>{node.text}</div>
          </div>
        </div>
      )}

      <div style={{ textAlign:'center', paddingTop:12, borderTop:'1px solid var(--border)' }}>
        <button onClick={() => onBack(true)} className="btn btn-ghost btn-sm">
          <i className="ti ti-refresh"/> Hacer otra consulta
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════ */
export default function GuidePage() {
  const [roots,      setRoots]      = useState([])
  const [current,    setCurrent]    = useState(null)
  const [breadcrumb, setBreadcrumb] = useState([])
  const [status,     setStatus]     = useState('loading')

  // Opciones inyectadas desde WordPress vía query params o postMessage
  const [lawyerImg,   setLawyerImg]   = useState('')
  const [lawyerName,  setLawyerName]  = useState('')
  const [lawyerTitle, setLawyerTitle] = useState('')

  const rootRef = useRef(null)

  // Leer parámetros de URL (WordPress puede pasarlos al iframe)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('img'))   setLawyerImg(decodeURIComponent(p.get('img')))
    if (p.get('name'))  setLawyerName(decodeURIComponent(p.get('name')))
    if (p.get('title')) setLawyerTitle(decodeURIComponent(p.get('title')))
  }, [])

  // Notificar altura al padre tras cada render
  useEffect(() => {
    const timer = setTimeout(notifyHeight, 80)
    return () => clearTimeout(timer)
  })

  const loadRoots = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await pub.roots()
      if (!data || data.length === 0) { setStatus('error'); return }
      setRoots(data)
      // Siempre empezar por el botón "Empezar ahora"
      setStatus('start')
    } catch { setStatus('error') }
  }, [])

  useEffect(() => { loadRoots() }, [loadRoots])

  // Pulsar "Empezar ahora"
  const handleStart = async () => {
    if (roots.length === 1) {
      // Una sola raíz: ir directo a la pregunta sin pasar por el picker
      setStatus('loading')
      try {
        const node = await pub.node(roots[0].id)
        setCurrent(node); setBreadcrumb([]); setStatus('node')
      } catch { setStatus('error') }
    } else {
      // Varias raíces: mostrar picker (reemplaza al botón)
      setStatus('picker')
    }
  }

  // Elegir una raíz del picker
  const handleSelectRoot = async (root) => {
    setStatus('loading')
    try {
      const node = await pub.node(root.id)
      // Guardamos el picker como punto de retorno (breadcrumb vacío = volver al picker)
      setCurrent(node); setBreadcrumb([]); setStatus('node')
    } catch { setStatus('error') }
  }

  const handleAnswer = async (option) => {
    setStatus('loading')
    try {
      const next = await pub.node(option.targetNodeId)
      // Añadir nodo actual al historial con la respuesta elegida
      setBreadcrumb(bc => [...bc, { ...current, _selectedLabel: option.label }])
      setCurrent(next); setStatus('node')
    } catch { setStatus('error') }
  }

  const handleBack = (restart = false) => {
    if (restart) {
      // "Hacer otra consulta" → volver al botón inicial
      setCurrent(null); setBreadcrumb([]); setStatus('start')
      return
    }
    if (breadcrumb.length === 0) {
      // Primera pregunta: volver al picker (si hay varias raíces) o al botón inicial
      setCurrent(null)
      setStatus(roots.length > 1 ? 'picker' : 'start')
      return
    }
    // Volver al nodo anterior del historial
    const prev = breadcrumb[breadcrumb.length - 1]
    setBreadcrumb(bc => bc.slice(0, -1))
    setCurrent(prev)
    setStatus('node')
  }

  const isLeaf = current?.type === 'leaf'

  // Cuando estamos dentro del iframe no mostramos header ni fondo propio
  // La página queda limpia para embeber en WordPress
  const wrapStyle = IN_IFRAME
    ? { padding:'28px 28px 36px', background:'var(--cream)', minHeight:'auto' }
    : { minHeight:'100vh', background:'var(--cream)', padding:'40px 24px 60px' }

  return (
    <div ref={rootRef} style={wrapStyle}>
      <div style={{ maxWidth:620, margin:'0 auto' }}>
        {status === 'loading' && <Loading/>}
        {status === 'error'   && <ErrorScreen onRetry={loadRoots}/>}

        {/* Botón "Empezar ahora" */}
        {status === 'start' && (
          <StartButton onStart={handleStart}/>
        )}

        {/* Picker de raíces — reemplaza al botón */}
        {status === 'picker' && (
          <RootPicker roots={roots} onSelect={handleSelectRoot}/>
        )}

        {/* Navegación por el árbol */}
        {status === 'node' && current && !isLeaf && (
          <QuestionCard node={current} onAnswer={handleAnswer} onBack={handleBack} breadcrumb={breadcrumb}/>
        )}
        {status === 'node' && current && isLeaf && (
          <LeafCard node={current} onBack={handleBack} breadcrumb={breadcrumb}/>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

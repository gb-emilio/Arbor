import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { pub } from '../api/client'

const API = import.meta.env.VITE_API_URL ?? ''

// ── Transición suave ──────────────────────────────────────────────────────
function useEnter(key) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(false); const t = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(t) }, [key])
  return visible
    ? { opacity:1, transform:'translateY(0)', transition:'opacity .28s ease, transform .28s ease' }
    : { opacity:0, transform:'translateY(10px)' }
}

// ── Spinner ───────────────────────────────────────────────────────────────
function Loading() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'40vh',gap:12,color:'var(--muted)'}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:'2.5px solid var(--accent-bg)',borderTopColor:'var(--accent)',animation:'spin .7s linear infinite'}}/>
      <span style={{fontSize:13}}>Cargando...</span>
    </div>
  )
}

// ── Error ─────────────────────────────────────────────────────────────────
function ErrorScreen({ onRetry }) {
  return (
    <div style={{textAlign:'center',padding:'60px 20px',color:'var(--muted)'}}>
      <i className="ti ti-wifi-off" style={{fontSize:40,display:'block',marginBottom:12,color:'var(--faint)'}}/>
      <p style={{marginBottom:16}}>No se pudo cargar el árbol de preguntas.</p>
      <button className="btn btn-primary" onClick={onRetry}>Reintentar</button>
    </div>
  )
}

// ── Botón volver (solo un enlace, discreto) ───────────────────────────────
function BackButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex',alignItems:'center',gap:6,marginBottom:28,
      padding:'6px 12px',background:'transparent',border:'none',cursor:'pointer',
      color:'var(--muted)',fontSize:13,fontFamily:'var(--font-sans)',
      borderRadius:'var(--radius-sm)',transition:'color .15s, background .15s',
    }}
      onMouseEnter={e=>{e.currentTarget.style.color='var(--accent)';e.currentTarget.style.background='var(--accent-bg)'}}
      onMouseLeave={e=>{e.currentTarget.style.color='var(--muted)';e.currentTarget.style.background='transparent'}}>
      <i className="ti ti-arrow-left" style={{fontSize:14}}/>
      {label.length > 36 ? label.slice(0,34)+'…' : label}
    </button>
  )
}

// ── Picker de raíces (solo si hay más de una) ─────────────────────────────
function RootPicker({ roots, onSelect }) {
  const style = useEnter('roots')
  return (
    <div style={{maxWidth:560,margin:'0 auto',...style}}>
      <p style={{color:'var(--muted)',marginBottom:28,fontSize:15,lineHeight:1.7}}>
        Elige un tema para comenzar y te guiaremos paso a paso hasta la respuesta.
      </p>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {roots.map((r,i) => (
          <button key={r.id} onClick={() => onSelect(r)} style={{
            display:'flex',alignItems:'center',gap:14,padding:'16px 20px',
            background:'var(--surface)',border:'0.5px solid var(--border-md)',
            borderRadius:'var(--radius)',cursor:'pointer',textAlign:'left',width:'100%',
            transition:'border-color .15s, box-shadow .15s, transform .1s',fontFamily:'var(--font-sans)',
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.boxShadow='0 4px 16px rgba(45,106,79,.12)';e.currentTarget.style.transform='translateY(-1px)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-md)';e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none'}}>
            <span style={{width:38,height:38,borderRadius:'50%',flexShrink:0,background:'var(--accent-bg)',color:'var(--accent-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-serif)',fontSize:16,fontWeight:600}}>{i+1}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:500,color:'var(--ink)',lineHeight:1.4}}>{r.text}</div>
              {r.description && <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>{r.description}</div>}
            </div>
            <i className="ti ti-arrow-right" style={{fontSize:16,color:'var(--accent)',flexShrink:0}}/>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Tarjeta de pregunta ───────────────────────────────────────────────────
function QuestionCard({ node, onAnswer, onBack, breadcrumb }) {
  const style = useEnter(node.id)
  const linked   = (node.options||[]).filter(o => o.targetNodeId)
  const unlinked = (node.options||[]).filter(o => !o.targetNodeId)

  return (
    <div style={{maxWidth:580,margin:'0 auto',...style}}>
      {breadcrumb.length > 0 && (
        <BackButton label={breadcrumb[breadcrumb.length-1].text} onClick={onBack}/>
      )}

      {/* Pregunta */}
      <div style={{background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'28px 28px 24px',boxShadow:'var(--shadow)',marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:500,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>
          Pregunta {breadcrumb.length + 1}
        </div>
        <h2 style={{lineHeight:1.4,marginBottom:node.description?10:0}}>{node.text}</h2>
        {node.description && <p style={{color:'var(--muted)',fontSize:14,lineHeight:1.6,marginTop:8}}>{node.description}</p>}
      </div>

      {/* Opciones navegables */}
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:8}}>
        {linked.map((o,i) => (
          <button key={o.id} onClick={() => onAnswer(o)} style={{
            display:'flex',alignItems:'center',gap:14,padding:'14px 18px',
            background:'var(--surface)',border:'0.5px solid var(--border-md)',
            borderRadius:'var(--radius)',cursor:'pointer',textAlign:'left',width:'100%',
            transition:'border-color .15s, background .15s, transform .1s',fontFamily:'var(--font-sans)',
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='#f0faf3';e.currentTarget.style.transform='translateX(4px)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-md)';e.currentTarget.style.background='var(--surface)';e.currentTarget.style.transform='none'}}>
            <span style={{width:30,height:30,borderRadius:'50%',flexShrink:0,background:'var(--surface2)',color:'var(--muted)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600}}>
              {String.fromCharCode(65+i)}
            </span>
            <span style={{flex:1,fontSize:14,color:'var(--ink)',fontWeight:500}}>{o.label}</span>
            <i className="ti ti-chevron-right" style={{fontSize:14,color:'var(--faint)',flexShrink:0}}/>
          </button>
        ))}
      </div>

      {unlinked.length > 0 && (
        <div style={{marginTop:8}}>
          <div style={{fontSize:11,color:'var(--faint)',marginBottom:6}}>Sin resultado asignado aún</div>
          {unlinked.map(o => (
            <div key={o.id} style={{padding:'9px 14px',borderRadius:'var(--radius-sm)',background:'var(--surface2)',color:'var(--muted)',fontSize:13,marginBottom:5,display:'flex',alignItems:'center',gap:8}}>
              <i className="ti ti-minus" style={{fontSize:11}}/>{o.label}
            </div>
          ))}
        </div>
      )}

      {linked.length === 0 && unlinked.length === 0 && (
        <div style={{textAlign:'center',padding:'20px',color:'var(--faint)',fontSize:13}}>
          Esta pregunta no tiene opciones configuradas todavía.
        </div>
      )}
    </div>
  )
}

// ── Recuadro de servicio (misma anchura que las opciones) ─────────────────
function ServiceBox({ icon, color, colorBg, title, subtitle, children }) {
  return (
    <div style={{
      display:'flex',flexDirection:'column',
      border:'0.5px solid var(--border-md)',borderRadius:'var(--radius)',
      background:'var(--surface)',overflow:'hidden',
    }}>
      {/* Header del recuadro */}
      <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 18px',borderBottom:'0.5px solid var(--border)',background:colorBg}}>
        <span style={{width:34,height:34,borderRadius:'50%',flexShrink:0,background:color,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <i className={`ti ${icon}`} style={{fontSize:16,color:'#fff'}}/>
        </span>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:'var(--ink)'}}>{title}</div>
          {subtitle && <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{subtitle}</div>}
        </div>
      </div>
      {/* Cuerpo */}
      <div style={{padding:'14px 18px'}}>{children}</div>
    </div>
  )
}

// ── Hoja: resultado + servicios ───────────────────────────────────────────
function LeafCard({ node, onBack, breadcrumb }) {
  const style = useEnter(node.id)
  const hasPdf      = !!node.pdf
  const hasLink     = !!(node.serviceLinkUrl)
  const hasPaypal   = !!(node.paypalButtonId)
  const hasCalendly = !!(node.calendlyUrl)
  const hasAnyService = hasLink || hasPaypal || hasCalendly

  return (
    <div style={{maxWidth:580,margin:'0 auto',...style}}>

      {/* Botón volver — único enlace de navegación */}
      {breadcrumb.length > 0 && (
        <BackButton label={breadcrumb[breadcrumb.length-1].text} onClick={onBack}/>
      )}

      {/* Checkmark */}
      <div style={{textAlign:'center',marginBottom:20}}>
        <div style={{width:56,height:56,borderRadius:'50%',margin:'0 auto 10px',background:'var(--accent-bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <i className="ti ti-check" style={{fontSize:24,color:'var(--accent)'}}/>
        </div>
        <div style={{fontSize:11,fontWeight:500,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'.08em'}}>Resultado encontrado</div>
      </div>

      {/* Tarjeta principal */}
      <div style={{background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'24px 24px 20px',boxShadow:'0 4px 20px rgba(45,106,79,.08)',marginBottom:16}}>
        <h2 style={{marginBottom:node.description?10:16,lineHeight:1.4,textAlign:'center'}}>{node.text}</h2>
        {node.description && <p style={{color:'var(--muted)',fontSize:14,lineHeight:1.7,marginBottom:16,textAlign:'center'}}>{node.description}</p>}

        {hasPdf ? (
          <>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'var(--surface2)',borderRadius:'var(--radius-sm)',marginBottom:14,border:'0.5px solid var(--border)'}}>
              <i className="ti ti-file-type-pdf" style={{fontSize:22,color:'var(--danger)',flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500}}>{node.pdf.filename}</div>
                {node.pdf.fileSize && <div style={{fontSize:11,color:'var(--faint)'}}>{(node.pdf.fileSize/1024).toFixed(1)} KB</div>}
              </div>
            </div>
            {/* Descarga directa — fetch con blob para evitar bloqueo de autenticación */}
            <div style={{textAlign:'center'}}>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API}/api/v1/nodes/${node.id}/pdf`)
                    if (!res.ok) throw new Error()
                    const blob = await res.blob()
                    const a = Object.assign(document.createElement('a'), {
                      href: URL.createObjectURL(blob),
                      download: node.pdf.filename
                    })
                    document.body.appendChild(a); a.click()
                    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 100)
                  } catch { alert('No se pudo descargar el PDF. Inténtalo de nuevo.') }
                }}
                style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 22px',background:'var(--accent)',color:'#fff',borderRadius:'var(--radius-sm)',fontSize:14,fontWeight:500,border:'none',cursor:'pointer',transition:'background .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--accent-dark)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--accent)'}>
                <i className="ti ti-download"/>
                Descargar documento PDF
              </button>
            </div>
          </>
        ) : (
          <div style={{padding:'18px',background:'var(--surface2)',borderRadius:'var(--radius-sm)',color:'var(--muted)',fontSize:13,textAlign:'center'}}>
            <i className="ti ti-file-off" style={{fontSize:22,display:'block',marginBottom:6,color:'var(--faint)'}}/>
            El documento no está disponible aún.
          </div>
        )}
      </div>

      {/* ── Tres recuadros de servicios ────────────────────────────────── */}
      {hasAnyService && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:'var(--faint)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10,paddingLeft:2}}>
            Servicios adicionales
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>

            {/* Recuadro 1 — Enlace personalizado */}
            {hasLink && (
              <ServiceBox icon="ti-external-link" color="#1d6fb5" colorBg="#eff6ff" title={node.serviceLinkLabel || 'Más información'} subtitle="Accede al recurso externo">
                <a href={node.serviceLinkUrl} target="_blank" rel="noopener noreferrer" style={{
                  display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',
                  background:'#1d6fb5',color:'#fff',borderRadius:'var(--radius-sm)',
                  fontSize:13,fontWeight:500,textDecoration:'none',transition:'background .15s',
                }}
                  onMouseEnter={e=>e.currentTarget.style.background='#155a96'}
                  onMouseLeave={e=>e.currentTarget.style.background='#1d6fb5'}>
                  <i className="ti ti-arrow-right"/>
                  {node.serviceLinkLabel || 'Ir al enlace'}
                </a>
              </ServiceBox>
            )}

            {/* Recuadro 2 — Revisión de documentación (PayPal) */}
            {hasPaypal && (
              <ServiceBox icon="ti-file-check" color="#0070ba" colorBg="#e8f4fd" title="Revisión de documentación" subtitle="Servicio de revisión profesional">
                <p style={{fontSize:13,color:'var(--muted)',lineHeight:1.6,marginBottom:12}}>
                  Nuestro equipo revisará tu documentación y te proporcionará un informe detallado con observaciones y recomendaciones.
                </p>
                {/* Botón PayPal hosted button — se embebe directamente */}
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                  <input type="hidden" name="cmd" value="_s-xclick"/>
                  <input type="hidden" name="hosted_button_id" value={node.paypalButtonId}/>
                  <input type="hidden" name="currency_code" value="EUR"/>
                  <button type="submit" style={{
                    display:'inline-flex',alignItems:'center',gap:8,padding:'9px 18px',
                    background:'#0070ba',color:'#fff',borderRadius:'var(--radius-sm)',
                    fontSize:13,fontWeight:600,border:'none',cursor:'pointer',transition:'background .15s',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background='#005ea6'}
                    onMouseLeave={e=>e.currentTarget.style.background='#0070ba'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.643-8.993 6.643H9.39l-1.167 7.4h3.633a.641.641 0 0 0 .633-.54l.026-.13.502-3.177.032-.176a.641.641 0 0 1 .634-.54h.398c2.58 0 4.598-.943 5.19-3.67.247-1.13.12-2.07-.449-2.73z"/></svg>
                    Pagar con PayPal
                  </button>
                </form>
              </ServiceBox>
            )}

            {/* Recuadro 3 — Gestor de citas (Calendly) */}
            {hasCalendly && (
              <ServiceBox icon="ti-calendar" color="#006bff" colorBg="#eff2ff" title="Reservar cita" subtitle="Elige el horario que mejor te convenga">
                <p style={{fontSize:13,color:'var(--muted)',lineHeight:1.6,marginBottom:12}}>
                  Agenda una consulta personalizada con nuestro equipo. Elige día y hora directamente en el calendario.
                </p>
                <a href={node.calendlyUrl} target="_blank" rel="noopener noreferrer" style={{
                  display:'inline-flex',alignItems:'center',gap:7,padding:'9px 18px',
                  background:'#006bff',color:'#fff',borderRadius:'var(--radius-sm)',
                  fontSize:13,fontWeight:500,textDecoration:'none',transition:'background .15s',
                }}
                  onMouseEnter={e=>e.currentTarget.style.background='#0054cc'}
                  onMouseLeave={e=>e.currentTarget.style.background='#006bff'}>
                  <i className="ti ti-calendar-event"/>
                  Reservar cita
                </a>
              </ServiceBox>
            )}
          </div>
        </div>
      )}

      {/* Recorrido */}
      {breadcrumb.length > 0 && (
        <div style={{marginTop:4,marginBottom:20}}>
          <div style={{fontSize:11,color:'var(--faint)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>Tu recorrido</div>
          <div style={{display:'flex',flexDirection:'column'}}>
            {breadcrumb.map((b,i) => (
              <div key={b.id} style={{display:'flex',alignItems:'flex-start',gap:10}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div style={{width:7,height:7,borderRadius:'50%',marginTop:5,background:'var(--border-md)',flexShrink:0}}/>
                  <div style={{width:1,flex:1,minHeight:12,background:'var(--border)'}}/>
                </div>
                <div style={{paddingBottom:4}}>
                  <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.4}}>{b.text}</div>
                  {b._selectedLabel && <div style={{fontSize:11,color:'var(--accent)',marginTop:1}}>→ {b._selectedLabel}</div>}
                </div>
              </div>
            ))}
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:'var(--accent)',flexShrink:0}}/>
              <div style={{fontSize:12,fontWeight:500,color:'var(--accent)'}}>{node.text}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{textAlign:'center',marginTop:8,paddingTop:16,borderTop:'0.5px solid var(--border)'}}>
        <button onClick={() => onBack(true)} className="btn btn-ghost btn-sm">
          <i className="ti ti-refresh"/> Hacer otra consulta
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────
export default function GuidePage() {
  const [roots, setRoots]           = useState([])
  const [current, setCurrent]       = useState(null)
  const [breadcrumb, setBreadcrumb] = useState([])
  const [status, setStatus]         = useState('loading')

  const loadRoots = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await pub.roots()
      if (!data || data.length === 0) { setStatus('error'); return }
      setRoots(data)
      // Si solo hay una raíz, ir directo a la primera pregunta sin mostrar el picker
      if (data.length === 1) {
        const node = await pub.node(data[0].id)
        setCurrent(node)
        setBreadcrumb([])
        setStatus('node')
      } else {
        setStatus('roots')
      }
    } catch { setStatus('error') }
  }, [])

  useEffect(() => { loadRoots() }, [loadRoots])

  const handleSelectRoot = async (root) => {
    setStatus('loading')
    try {
      const node = await pub.node(root.id)
      setCurrent(node); setBreadcrumb([]); setStatus('node')
    } catch { setStatus('error') }
  }

  const handleAnswer = async (option) => {
    setStatus('loading')
    try {
      const next = await pub.node(option.targetNodeId)
      setBreadcrumb(bc => [...bc, { ...current, _selectedLabel: option.label }])
      setCurrent(next); setStatus('node')
    } catch { setStatus('error') }
  }

  const handleBack = (restart = false) => {
    if (restart || breadcrumb.length === 0) {
      // Si había una sola raíz, volver directo a esa pregunta
      if (!restart && roots.length === 1) {
        pub.node(roots[0].id).then(n => { setCurrent(n); setBreadcrumb([]); setStatus('node') }).catch(()=>setStatus('error'))
        return
      }
      setCurrent(null); setBreadcrumb([]); setStatus(roots.length === 1 ? 'loading' : 'roots')
      if (roots.length === 1) loadRoots()
      return
    }
    const prev = breadcrumb[breadcrumb.length - 1]
    setBreadcrumb(bc => bc.slice(0,-1)); setCurrent(prev); setStatus('node')
  }

  const isLeaf = current?.type === 'leaf'

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg, #eaf5ec 0%, var(--bg) 45%)',display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <header style={{padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'0.5px solid var(--border)',background:'rgba(255,255,255,.85)',backdropFilter:'blur(8px)',position:'sticky',top:0,zIndex:10}}>
        <div style={{fontFamily:'var(--font-serif)',fontSize:20,color:'var(--accent)',display:'flex',alignItems:'center',gap:8}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v4M8 5l4-2 4 2M5 9h14M7 9v3a2 2 0 002 2h6a2 2 0 002-2V9M12 14v3M9 17h6M10 20h4"/>
          </svg>
          ArborQ
        </div>
        <Link to="/login" style={{fontSize:12,color:'var(--muted)',textDecoration:'none',display:'flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:'var(--radius-sm)',border:'0.5px solid var(--border-md)',background:'var(--surface)',transition:'color .15s,border-color .15s'}}
          onMouseEnter={e=>{e.currentTarget.style.color='var(--accent)';e.currentTarget.style.borderColor='var(--accent)'}}
          onMouseLeave={e=>{e.currentTarget.style.color='var(--muted)';e.currentTarget.style.borderColor='var(--border-md)'}}>
          <i className="ti ti-login-2" style={{fontSize:13}}/>
          Acceso administración
        </Link>
      </header>

      {/* Contenido */}
      <div style={{flex:1,padding:'48px 24px 64px',maxWidth:680,margin:'0 auto',width:'100%'}}>
        {(status === 'roots' || (status === 'node' && breadcrumb.length === 0 && !isLeaf && roots.length > 1)) && (
          <h1 style={{marginBottom:36}}>¿En qué podemos ayudarte?</h1>
        )}

        {status === 'loading' && <Loading/>}
        {status === 'error'   && <ErrorScreen onRetry={loadRoots}/>}
        {status === 'roots'   && <RootPicker roots={roots} onSelect={handleSelectRoot}/>}
        {status === 'node' && current && !isLeaf && (
          <QuestionCard node={current} onAnswer={handleAnswer} onBack={handleBack} breadcrumb={breadcrumb}/>
        )}
        {status === 'node' && current && isLeaf && (
          <LeafCard node={current} onBack={handleBack} breadcrumb={breadcrumb}/>
        )}
      </div>

      <footer style={{textAlign:'center',padding:'14px',fontSize:11,color:'var(--faint)',borderTop:'0.5px solid var(--border)'}}>
        ArborQ · Guía interactiva
      </footer>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

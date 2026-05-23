import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { pub } from '../api/client'

// ── Animación de transición ────────────────────────────────────────────────
const FADE = {
  entering: { opacity: 0, transform: 'translateY(12px)' },
  entered:  { opacity: 1, transform: 'translateY(0)',
    transition: 'opacity .28s ease, transform .28s ease' },
}

function useEnter() {
  const [phase, setPhase] = useState('entering')
  useEffect(() => {
    const t = requestAnimationFrame(() => setPhase('entered'))
    return () => cancelAnimationFrame(t)
  }, [])
  return phase
}

// ── Pantalla de carga ─────────────────────────────────────────────────────
function Loading() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'40vh', gap:12, color:'var(--muted)', flexDirection:'column' }}>
      <div style={{
        width:36, height:36, borderRadius:'50%',
        border:'2.5px solid var(--accent-bg)',
        borderTopColor:'var(--accent)',
        animation:'spin .7s linear infinite'
      }}/>
      <span style={{fontSize:13}}>Cargando...</span>
    </div>
  )
}

// ── Pantalla de error ─────────────────────────────────────────────────────
function ErrorScreen({ onRetry }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--muted)' }}>
      <i className="ti ti-wifi-off" style={{fontSize:40, display:'block', marginBottom:12, color:'var(--faint)'}}/>
      <p style={{marginBottom:16}}>No se pudo cargar el árbol de preguntas.</p>
      <button className="btn btn-primary" onClick={onRetry}>Reintentar</button>
    </div>
  )
}

// ── Vista de selección de árbol raíz ─────────────────────────────────────
function RootPicker({ roots, onSelect }) {
  const phase = useEnter()
  return (
    <div style={{ maxWidth:560, margin:'0 auto', ...FADE[phase] }}>
      <p style={{ color:'var(--muted)', marginBottom:28, fontSize:15, lineHeight:1.7 }}>
        Elige un tema para comenzar y te guiaremos paso a paso hasta la respuesta.
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {roots.map((r, i) => (
          <button key={r.id} onClick={() => onSelect(r)}
            style={{
              display:'flex', alignItems:'center', gap:14,
              padding:'16px 20px', background:'var(--surface)',
              border:'0.5px solid var(--border-md)', borderRadius:'var(--radius)',
              cursor:'pointer', textAlign:'left', width:'100%',
              transition:'border-color .15s, box-shadow .15s, transform .1s',
              fontFamily:'var(--font-sans)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(45,106,79,.12)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-md)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'none'
            }}>
            <span style={{
              width:38, height:38, borderRadius:'50%', flexShrink:0,
              background:'var(--accent-bg)', color:'var(--accent-dark)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-serif)', fontSize:16, fontWeight:600
            }}>{i + 1}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:15, fontWeight:500, color:'var(--ink)', lineHeight:1.4}}>{r.text}</div>
              {r.description && <div style={{fontSize:12, color:'var(--muted)', marginTop:3}}>{r.description}</div>}
            </div>
            <i className="ti ti-arrow-right" style={{fontSize:16, color:'var(--accent)', flexShrink:0}}/>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Vista de pregunta ─────────────────────────────────────────────────────
function QuestionCard({ node, onAnswer, onBack, breadcrumb }) {
  const phase = useEnter()
  const linkedOptions  = (node.options || []).filter(o => o.targetNodeId)
  const floatingOptions = (node.options || []).filter(o => !o.targetNodeId)

  return (
    <div style={{ maxWidth:580, margin:'0 auto', ...FADE[phase] }}>

      {/* Breadcrumb / Volver */}
      {breadcrumb.length > 0 && (
        <button onClick={onBack} style={{
          display:'inline-flex', alignItems:'center', gap:6,
          marginBottom:28, padding:'6px 12px',
          background:'transparent', border:'none', cursor:'pointer',
          color:'var(--muted)', fontSize:13, fontFamily:'var(--font-sans)',
          borderRadius:'var(--radius-sm)',
          transition:'color .15s, background .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.background='var(--accent-bg)' }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.background='transparent' }}>
          <i className="ti ti-arrow-left" style={{fontSize:14}}/>
          {breadcrumb[breadcrumb.length - 1].text.length > 36
            ? breadcrumb[breadcrumb.length - 1].text.slice(0, 34) + '…'
            : breadcrumb[breadcrumb.length - 1].text}
        </button>
      )}

      {/* Pregunta */}
      <div style={{
        background:'var(--surface)', border:'0.5px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'28px 28px 24px',
        boxShadow:'var(--shadow)', marginBottom:16
      }}>
        <div style={{
          fontSize:11, fontWeight:500, color:'var(--accent)', textTransform:'uppercase',
          letterSpacing:'.08em', marginBottom:12
        }}>
          Pregunta {breadcrumb.length + 1}
        </div>
        <h2 style={{lineHeight:1.4, marginBottom: node.description ? 10 : 0}}>{node.text}</h2>
        {node.description && (
          <p style={{color:'var(--muted)', fontSize:14, lineHeight:1.6, marginTop:8}}>{node.description}</p>
        )}
      </div>

      {/* Opciones con enlace */}
      {linkedOptions.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:8}}>
          {linkedOptions.map((o, i) => (
            <button key={o.id} onClick={() => onAnswer(o)}
              style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'14px 18px', background:'var(--surface)',
                border:'0.5px solid var(--border-md)', borderRadius:'var(--radius)',
                cursor:'pointer', textAlign:'left', width:'100%',
                transition:'border-color .15s, background .15s, transform .1s, box-shadow .15s',
                fontFamily:'var(--font-sans)',
                animationDelay: `${i * 40}ms`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.background = '#f0faf3'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-md)'
                e.currentTarget.style.background = 'var(--surface)'
                e.currentTarget.style.transform = 'none'
              }}>
              <span style={{
                width:30, height:30, borderRadius:'50%', flexShrink:0,
                background:'var(--surface2)', color:'var(--muted)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:600, transition:'background .15s, color .15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.color='#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.color='var(--muted)' }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{flex:1, fontSize:14, color:'var(--ink)', fontWeight:500}}>{o.label}</span>
              <i className="ti ti-chevron-right" style={{fontSize:14, color:'var(--faint)', flexShrink:0}}/>
            </button>
          ))}
        </div>
      )}

      {/* Opciones sin enlace (informativas) */}
      {floatingOptions.length > 0 && (
        <div style={{marginTop:12}}>
          <div style={{fontSize:11, color:'var(--faint)', marginBottom:8}}>Otras opciones (sin resultado asignado aún)</div>
          {floatingOptions.map(o => (
            <div key={o.id} style={{
              padding:'10px 14px', borderRadius:'var(--radius-sm)',
              background:'var(--surface2)', color:'var(--muted)', fontSize:13,
              marginBottom:6, display:'flex', alignItems:'center', gap:8
            }}>
              <i className="ti ti-minus" style={{fontSize:11}}/>
              {o.label}
            </div>
          ))}
        </div>
      )}

      {linkedOptions.length === 0 && floatingOptions.length === 0 && (
        <div style={{textAlign:'center', padding:'20px', color:'var(--faint)', fontSize:13}}>
          Esta pregunta no tiene opciones configuradas todavía.
        </div>
      )}
    </div>
  )
}

// ── Vista de resultado (hoja PDF) ─────────────────────────────────────────
function LeafCard({ node, onBack, breadcrumb }) {
  const phase = useEnter()
  const hasPdf = !!node.pdf

  return (
    <div style={{ maxWidth:520, margin:'0 auto', ...FADE[phase] }}>

      {/* Volver */}
      {breadcrumb.length > 0 && (
        <button onClick={onBack} style={{
          display:'inline-flex', alignItems:'center', gap:6,
          marginBottom:28, padding:'6px 12px',
          background:'transparent', border:'none', cursor:'pointer',
          color:'var(--muted)', fontSize:13, fontFamily:'var(--font-sans)',
          borderRadius:'var(--radius-sm)', transition:'color .15s, background .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.background='var(--accent-bg)' }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.background='transparent' }}>
          <i className="ti ti-arrow-left" style={{fontSize:14}}/>
          {breadcrumb[breadcrumb.length - 1].text.length > 36
            ? breadcrumb[breadcrumb.length - 1].text.slice(0, 34) + '…'
            : breadcrumb[breadcrumb.length - 1].text}
        </button>
      )}

      {/* Icono de éxito */}
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{
          width:64, height:64, borderRadius:'50%', margin:'0 auto 12px',
          background:'var(--accent-bg)',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <i className="ti ti-check" style={{fontSize:28, color:'var(--accent)'}}/>
        </div>
        <div style={{fontSize:12, fontWeight:500, color:'var(--accent)',
          textTransform:'uppercase', letterSpacing:'.08em'}}>Resultado encontrado</div>
      </div>

      {/* Tarjeta resultado */}
      <div style={{
        background:'var(--surface)', border:'0.5px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'28px',
        boxShadow:'0 4px 20px rgba(45,106,79,.08)', textAlign:'center'
      }}>
        <h2 style={{marginBottom: node.description ? 12 : 20, lineHeight:1.4}}>{node.text}</h2>
        {node.description && (
          <p style={{color:'var(--muted)', fontSize:14, lineHeight:1.7, marginBottom:20}}>{node.description}</p>
        )}

        {hasPdf ? (
          <>
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'12px 16px', background:'var(--surface2)',
              borderRadius:'var(--radius-sm)', marginBottom:20,
              border:'0.5px solid var(--border)'
            }}>
              <i className="ti ti-file-type-pdf" style={{fontSize:24, color:'var(--danger)', flexShrink:0}}/>
              <div style={{flex:1, textAlign:'left'}}>
                <div style={{fontSize:13, fontWeight:500}}>{node.pdf.filename}</div>
                {node.pdf.fileSize && (
                  <div style={{fontSize:11, color:'var(--faint)'}}>{(node.pdf.fileSize / 1024).toFixed(1)} KB</div>
                )}
              </div>
            </div>
            <a
              href={`${import.meta.env.VITE_API_URL ?? ''}/api/v1/nodes/${node.id}/pdf`}
              download={node.pdf.filename}
              style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'11px 24px', background:'var(--accent)', color:'#fff',
                borderRadius:'var(--radius-sm)', fontSize:14, fontWeight:500,
                textDecoration:'none', transition:'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='var(--accent-dark)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--accent)'}>
              <i className="ti ti-download"/>
              Descargar documento PDF
            </a>
          </>
        ) : (
          <div style={{
            padding:'20px', background:'var(--surface2)', borderRadius:'var(--radius-sm)',
            color:'var(--muted)', fontSize:13
          }}>
            <i className="ti ti-file-off" style={{fontSize:24, display:'block', marginBottom:8, color:'var(--faint)'}}/>
            El documento PDF no está disponible aún.
          </div>
        )}
      </div>

      {/* Recorrido del camino */}
      {breadcrumb.length > 0 && (
        <div style={{ marginTop:28 }}>
          <div style={{fontSize:11, color:'var(--faint)', textTransform:'uppercase',
            letterSpacing:'.06em', marginBottom:10}}>Tu recorrido</div>
          <div style={{display:'flex', flexDirection:'column', gap:0}}>
            {breadcrumb.map((b, i) => (
              <div key={b.id} style={{display:'flex', alignItems:'flex-start', gap:10}}>
                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                  <div style={{
                    width:8, height:8, borderRadius:'50%', marginTop:5,
                    background: i === breadcrumb.length - 1 ? 'var(--accent)' : 'var(--border-md)',
                    flexShrink:0
                  }}/>
                  {i < breadcrumb.length - 1 && (
                    <div style={{width:1, height:16, background:'var(--border)'}}/>
                  )}
                </div>
                <div style={{paddingBottom:i < breadcrumb.length - 1 ? 4 : 0}}>
                  <div style={{fontSize:12, color:'var(--muted)', lineHeight:1.4}}>{b.text}</div>
                  {b._selectedLabel && (
                    <div style={{fontSize:11, color:'var(--accent)', marginTop:1}}>
                      → {b._selectedLabel}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{
                width:8, height:8, borderRadius:'50%', marginTop:5,
                background:'var(--accent)', flexShrink:0
              }}/>
              <div style={{fontSize:12, fontWeight:500, color:'var(--accent)'}}>{node.text}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{textAlign:'center', marginTop:28}}>
        <button onClick={() => onBack(true)} className="btn btn-ghost btn-sm">
          <i className="ti ti-refresh"/> Hacer otra consulta
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────
export default function GuidePage() {
  const [roots, setRoots]       = useState([])
  const [current, setCurrent]   = useState(null)   // nodo actualmente visible
  const [breadcrumb, setBreadcrumb] = useState([]) // historial de nodos visitados
  const [status, setStatus]     = useState('loading') // loading | error | roots | node

  const loadRoots = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await pub.roots()
      setRoots(data)
      setStatus(data.length === 0 ? 'error' : 'roots')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => { loadRoots() }, [loadRoots])

  // Navegar a una raíz seleccionada
  const handleSelectRoot = async (root) => {
    setStatus('loading')
    try {
      const node = await pub.node(root.id)
      setCurrent(node)
      setBreadcrumb([])
      setStatus('node')
    } catch { setStatus('error') }
  }

  // Elegir una respuesta y avanzar al nodo destino
  const handleAnswer = async (option) => {
    setStatus('loading')
    try {
      const next = await pub.node(option.targetNodeId)
      // Guardamos el nodo actual en el breadcrumb con la respuesta elegida
      setBreadcrumb(bc => [...bc, { ...current, _selectedLabel: option.label }])
      setCurrent(next)
      setStatus('node')
    } catch { setStatus('error') }
  }

  // Volver al nodo anterior (o al inicio si restart=true)
  const handleBack = (restart = false) => {
    if (restart || breadcrumb.length === 0) {
      setCurrent(null)
      setBreadcrumb([])
      setStatus('roots')
      return
    }
    const prev = breadcrumb[breadcrumb.length - 1]
    setBreadcrumb(bc => bc.slice(0, -1))
    setCurrent(prev)
    setStatus('node')
  }

  const isLeaf = current?.type === 'leaf'

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(160deg, #eaf5ec 0%, var(--bg) 45%)',
      display:'flex', flexDirection:'column',
    }}>
      {/* Header */}
      <header style={{
        padding:'0 24px', height:56,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:'0.5px solid var(--border)', background:'rgba(255,255,255,.85)',
        backdropFilter:'blur(8px)', position:'sticky', top:0, zIndex:10,
      }}>
        <div style={{
          fontFamily:'var(--font-serif)', fontSize:20, color:'var(--accent)',
          display:'flex', alignItems:'center', gap:8
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v4M8 5l4-2 4 2M5 9h14M7 9v3a2 2 0 002 2h6a2 2 0 002-2V9M12 14v3M9 17h6M10 20h4"/>
          </svg>
          ArborQ
        </div>
        <Link to="/login" style={{
          fontSize:12, color:'var(--muted)', textDecoration:'none',
          display:'flex', alignItems:'center', gap:5,
          padding:'5px 10px', borderRadius:'var(--radius-sm)',
          border:'0.5px solid var(--border-md)', background:'var(--surface)',
          transition:'color .15s, border-color .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.borderColor='var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.borderColor='var(--border-md)' }}>
          <i className="ti ti-login-2" style={{fontSize:13}}/>
          Acceso administración
        </Link>
      </header>

      {/* Contenido */}
      <div style={{ flex:1, padding:'48px 24px 64px', maxWidth:680, margin:'0 auto', width:'100%' }}>

        {/* Título dinámico */}
        <div style={{marginBottom:36}}>
          {status === 'roots' && (
            <>
              <h1 style={{marginBottom:8}}>¿En qué podemos ayudarte?</h1>
            </>
          )}
          {status === 'node' && !isLeaf && breadcrumb.length === 0 && (
            <h1 style={{marginBottom:8, fontSize:22, color:'var(--muted)', fontFamily:'var(--font-serif)'}}>
              Responde las preguntas
            </h1>
          )}
        </div>

        {/* Pantallas */}
        {status === 'loading' && <Loading/>}
        {status === 'error'   && <ErrorScreen onRetry={loadRoots}/>}
        {status === 'roots'   && roots.length > 0 && (
          <RootPicker roots={roots} onSelect={handleSelectRoot}/>
        )}
        {status === 'node' && current && !isLeaf && (
          <QuestionCard
            node={current}
            onAnswer={handleAnswer}
            onBack={handleBack}
            breadcrumb={breadcrumb}
          />
        )}
        {status === 'node' && current && isLeaf && (
          <LeafCard
            node={current}
            onBack={handleBack}
            breadcrumb={breadcrumb}
          />
        )}
      </div>

      {/* Footer */}
      <footer style={{
        textAlign:'center', padding:'16px', fontSize:11,
        color:'var(--faint)', borderTop:'0.5px solid var(--border)'
      }}>
        ArborQ · Guía interactiva
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

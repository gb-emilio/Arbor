import { useState, useEffect } from 'react'
import { nodes as api } from '../api/client'

export default function NodeForm({ initial, parentId, onSave, onCancel }) {
  const editing = !!initial?.id
  const [form, setForm] = useState({
    type:            initial?.type           || 'question',
    text:            initial?.text           || '',
    description:     initial?.description    || '',
    options: (initial?.options || []).map(o =>
      typeof o === 'string'
        ? { label: o, targetNodeId: null }
        : { label: o.label, targetNodeId: o.targetNodeId ?? null }
    ),
    parentId:        initial?.parentId       ?? parentId ?? null,
    // Campos de servicios
    serviceLinkUrl:  initial?.serviceLinkUrl  || '',
    serviceLinkLabel:initial?.serviceLinkLabel|| '',
    paypalButtonId:  initial?.paypalButtonId  || '',
    calendlyUrl:     initial?.calendlyUrl     || '',
  })
  const [newOpt, setNewOpt]     = useState('')
  const [allNodes, setAllNodes] = useState([])

  useEffect(() => {
    api.tree().then(tree => setAllNodes(flattenTree(tree))).catch(() => {})
  }, [])

  function flattenTree(nodes, acc = []) {
    for (const n of nodes) { acc.push(n); if (n.children) flattenTree(n.children, acc) }
    return acc
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const addOpt = () => {
    if (!newOpt.trim()) return
    setForm(f => ({ ...f, options: [...f.options, { label: newOpt.trim(), targetNodeId: null }] }))
    setNewOpt('')
  }
  const removeOpt = i => setForm(f => ({ ...f, options: f.options.filter((_,j) => j !== i) }))
  const updateOptLabel  = (i, val) => setForm(f => { const o=[...f.options]; o[i]={...o[i],label:val}; return {...f,options:o} })
  const updateOptTarget = (i, tid) => setForm(f => { const o=[...f.options]; o[i]={...o[i],targetNodeId:tid||null}; return {...f,options:o} })

  const submit = e => { e.preventDefault(); onSave({ ...form }) }

  const targetCandidates = allNodes.filter(n => n.id !== initial?.id)

  const SectionLabel = ({children}) => (
    <div style={{fontSize:11,fontWeight:500,color:'var(--faint)',textTransform:'uppercase',letterSpacing:'.07em',margin:'20px 0 10px',paddingTop:16,borderTop:'0.5px solid var(--border)'}}>
      {children}
    </div>
  )

  return (
    <form onSubmit={submit}>
      <div className="field-group">
        <label className="field-label">Tipo</label>
        <select className="field" value={form.type} onChange={set('type')} disabled={editing}>
          <option value="question">Pregunta (nodo intermedio)</option>
          <option value="leaf">Resultado PDF (hoja)</option>
        </select>
      </div>
      <div className="field-group">
        <label className="field-label">Texto / Título *</label>
        <input className="field" value={form.text} onChange={set('text')} placeholder="Escribe la pregunta o título..." required/>
      </div>
      <div className="field-group">
        <label className="field-label">Descripción</label>
        <textarea className="field" value={form.description} onChange={set('description')} placeholder="Contexto adicional (opcional)"/>
      </div>

      {/* Opciones — solo questions */}
      {form.type === 'question' && (
        <div className="field-group">
          <label className="field-label">Opciones de respuesta</label>
          <div style={{fontSize:11,color:'var(--muted)',marginBottom:8}}>Asigna a cada opción el nodo al que navega el usuario.</div>

          {form.options.map((o,i) => (
            <div key={i} style={{border:'0.5px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'10px 12px',marginBottom:8,background:'var(--surface2)'}}>
              <div style={{display:'flex',gap:6,marginBottom:6}}>
                <input className="field" value={o.label} onChange={e=>updateOptLabel(i,e.target.value)} placeholder={`Opción ${i+1}`} style={{flex:1}}/>
                <button type="button" className="btn btn-danger btn-sm" onClick={()=>removeOpt(i)}><i className="ti ti-x"/></button>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <i className="ti ti-arrow-right" style={{color:'var(--accent)',fontSize:13,flexShrink:0}}/>
                <select className="field" style={{fontSize:12}} value={o.targetNodeId??''} onChange={e=>updateOptTarget(i,e.target.value||null)}>
                  <option value="">— Sin nodo destino —</option>
                  {targetCandidates.map(n => (
                    <option key={n.id} value={n.id}>{n.type==='leaf'?'📄':'❓'} {n.text.length>50?n.text.slice(0,48)+'…':n.text}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div style={{display:'flex',gap:6,marginTop:4}}>
            <input className="field" value={newOpt} onChange={e=>setNewOpt(e.target.value)} placeholder="Nueva opción..." onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addOpt())}/>
            <button type="button" className="btn btn-sm" onClick={addOpt}><i className="ti ti-plus"/></button>
          </div>
        </div>
      )}

      {/* Servicios — solo leafs */}
      {form.type === 'leaf' && (
        <>
          <SectionLabel>Recuadro 1 — Enlace personalizado</SectionLabel>
          <div className="field-group">
            <label className="field-label">URL del enlace</label>
            <input className="field" value={form.serviceLinkUrl} onChange={set('serviceLinkUrl')} placeholder="https://ejemplo.com/mi-servicio" type="url"/>
          </div>
          <div className="field-group">
            <label className="field-label">Texto del botón</label>
            <input className="field" value={form.serviceLinkLabel} onChange={set('serviceLinkLabel')} placeholder="ej: Más información, Contratar servicio…"/>
          </div>

          <SectionLabel>Recuadro 2 — Revisión de documentación (PayPal)</SectionLabel>
          <div style={{fontSize:12,color:'var(--muted)',marginBottom:8,lineHeight:1.5}}>
            Crea un «Hosted Button» en <a href="https://www.paypal.com/buttons" target="_blank" rel="noopener" style={{color:'var(--accent)'}}>paypal.com/buttons</a> y pega aquí el <strong>Hosted Button ID</strong>.
          </div>
          <div className="field-group">
            <label className="field-label">Hosted Button ID de PayPal</label>
            <input className="field" value={form.paypalButtonId} onChange={set('paypalButtonId')} placeholder="ej: ABCDEFGH12345"/>
          </div>

          <SectionLabel>Recuadro 3 — Gestor de citas (Calendly)</SectionLabel>
          <div style={{fontSize:12,color:'var(--muted)',marginBottom:8,lineHeight:1.5}}>
            Pega la URL de tu evento de Calendly. Ej: <code style={{fontSize:11}}>https://calendly.com/tu-usuario/30min</code>
          </div>
          <div className="field-group">
            <label className="field-label">URL de Calendly</label>
            <input className="field" value={form.calendlyUrl} onChange={set('calendlyUrl')} placeholder="https://calendly.com/tu-usuario/nombre-evento" type="url"/>
          </div>
        </>
      )}

      <div className="modal-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary">{editing ? 'Guardar cambios' : 'Crear nodo'}</button>
      </div>
    </form>
  )
}

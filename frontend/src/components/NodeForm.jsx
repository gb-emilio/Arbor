import { useState, useEffect } from 'react'
import { nodes as api } from '../api/client'

export default function NodeForm({ initial, parentId, onSave, onCancel }) {
  const editing = !!initial?.id
  const [form, setForm] = useState({
    type: initial?.type || 'question',
    text: initial?.text || '',
    description: initial?.description || '',
    // Opciones ahora son objetos { label, targetNodeId }
    options: (initial?.options || []).map(o =>
      typeof o === 'string'
        ? { label: o, targetNodeId: null }
        : { label: o.label, targetNodeId: o.targetNodeId ?? null }
    ),
    parentId: initial?.parentId ?? parentId ?? null,
  })
  const [newOpt, setNewOpt] = useState('')
  // Todos los nodos disponibles para enlazar como destino
  const [allNodes, setAllNodes] = useState([])

  useEffect(() => {
    // Cargamos el árbol plano para el selector de destino
    api.tree().then(tree => setAllNodes(flattenTree(tree))).catch(() => {})
  }, [])

  function flattenTree(nodes, acc = []) {
    for (const n of nodes) {
      acc.push(n)
      if (n.children) flattenTree(n.children, acc)
    }
    return acc
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const addOpt = () => {
    if (!newOpt.trim()) return
    setForm(f => ({ ...f, options: [...f.options, { label: newOpt.trim(), targetNodeId: null }] }))
    setNewOpt('')
  }

  const removeOpt = i => setForm(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))

  const updateOptLabel = (i, val) => setForm(f => {
    const opts = [...f.options]
    opts[i] = { ...opts[i], label: val }
    return { ...f, options: opts }
  })

  const updateOptTarget = (i, targetNodeId) => setForm(f => {
    const opts = [...f.options]
    opts[i] = { ...opts[i], targetNodeId: targetNodeId || null }
    return { ...f, options: opts }
  })

  const submit = e => {
    e.preventDefault()
    onSave({ ...form })
  }

  // Nodos que pueden ser destino: todos excepto el propio nodo en edición
  const targetCandidates = allNodes.filter(n => n.id !== initial?.id)

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
        <input className="field" value={form.text} onChange={set('text')}
          placeholder="Escribe la pregunta o título..." required/>
      </div>
      <div className="field-group">
        <label className="field-label">Descripción</label>
        <textarea className="field" value={form.description} onChange={set('description')}
          placeholder="Contexto adicional (opcional)"/>
      </div>

      {form.type === 'question' && (
        <div className="field-group">
          <label className="field-label">Opciones de respuesta</label>
          <div style={{fontSize:11, color:'var(--muted)', marginBottom:8}}>
            Asigna a cada opción el nodo al que navega el usuario cuando la elige.
          </div>

          {form.options.map((o, i) => (
            <div key={i} style={{
              border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '10px 12px', marginBottom: 8, background: 'var(--lift, var(--surface2))'
            }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input className="field" value={o.label}
                  onChange={e => updateOptLabel(i, e.target.value)}
                  placeholder={`Opción ${i + 1}`} style={{flex:1}}/>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeOpt(i)}>
                  <i className="ti ti-x"/>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-arrow-right" style={{color:'var(--accent)', fontSize:13, flexShrink:0}}/>
                <select
                  className="field"
                  style={{fontSize:12}}
                  value={o.targetNodeId ?? ''}
                  onChange={e => updateOptTarget(i, e.target.value || null)}>
                  <option value="">— Sin nodo destino —</option>
                  {targetCandidates.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.type === 'leaf' ? '📄' : '❓'} {n.text.length > 50 ? n.text.slice(0,48)+'…' : n.text}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <input className="field" value={newOpt} onChange={e => setNewOpt(e.target.value)}
              placeholder="Nueva opción..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOpt())}/>
            <button type="button" className="btn btn-sm" onClick={addOpt}>
              <i className="ti ti-plus"/>
            </button>
          </div>
        </div>
      )}

      <div className="modal-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary">
          {editing ? 'Guardar cambios' : 'Crear nodo'}
        </button>
      </div>
    </form>
  )
}

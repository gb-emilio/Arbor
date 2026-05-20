import { useState, useEffect } from 'react'

export default function NodeForm({ initial, parentId, onSave, onCancel }) {
  const editing = !!initial?.id
  const [form, setForm] = useState({
    type: initial?.type || 'question',
    text: initial?.text || '',
    description: initial?.description || '',
    options: initial?.options || [],
    parentId: initial?.parentId ?? parentId ?? null,
  })
  const [newOpt, setNewOpt] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const addOpt = () => {
    if (!newOpt.trim()) return
    setForm(f => ({ ...f, options: [...f.options, newOpt.trim()] }))
    setNewOpt('')
  }
  const removeOpt = i => setForm(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))

  const submit = e => {
    e.preventDefault()
    onSave({ ...form })
  }

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
          {form.options.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input className="field" value={o}
                onChange={e => {
                  const opts = [...form.options]; opts[i] = e.target.value
                  setForm(f => ({ ...f, options: opts }))
                }}/>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeOpt(i)}>
                <i className="ti ti-x"/>
              </button>
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

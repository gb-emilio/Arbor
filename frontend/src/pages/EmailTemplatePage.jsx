import { useState, useEffect } from 'react'
import { emailTemplate as api } from '../api/client'
import Spinner from '../components/Spinner'

const PLACEHOLDERS = [
  ['{{nombre}}', 'Nombre del solicitante'],
  ['{{apellidos}}', 'Apellidos del solicitante'],
  ['{{nombre_completo}}', 'Nombre y apellidos juntos'],
  ['{{nacionalidad}}', 'Nacionalidad indicada'],
  ['{{telefono}}', 'Teléfono indicado'],
  ['{{email}}', 'Email del solicitante'],
  ['{{titulo_documento}}', 'Texto del nodo hoja (título de la solución)'],
]

export default function EmailTemplatePage({ toast }) {
  const [form, setForm] = useState({ subject: '', body: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get()
      .then(t => setForm({ subject: t.subject, body: t.body }))
      .catch(e => toast.err(e.message))
      .finally(() => setLoading(false))
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api.update(form)
      setForm({ subject: updated.subject, body: updated.body })
      toast.ok('Plantilla actualizada')
    } catch (e) { toast.err(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <Spinner full/>

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <div className="page-header">
        <div>
          <h2>Plantilla de email</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Este correo se envía desde cualquier hoja del árbol cuando alguien pulsa
            "Enviar solución a mi email" — es una única plantilla compartida por todas las hojas.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="field-group">
          <label className="field-label">Asunto</label>
          <input className="field" value={form.subject} onChange={set('subject')}
            placeholder="Ej: Tu solución de {{titulo_documento}}"/>
        </div>
        <div className="field-group" style={{ marginBottom: 0 }}>
          <label className="field-label">Cuerpo del email (admite HTML simple)</label>
          <textarea className="field" style={{ minHeight: 280, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}
            value={form.body} onChange={set('body')}
            placeholder="<p>Hola {{nombre}}, ...</p>"/>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--faint)', textTransform: 'uppercase',
          letterSpacing: '.06em', marginBottom: 10 }}>
          Placeholders disponibles
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {PLACEHOLDERS.map(([tag, desc]) => (
            <div key={tag} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 13 }}>
              <code style={{ background: 'var(--cream-dark)', padding: '2px 6px', borderRadius: 4,
                fontSize: 12, color: 'var(--terracotta)', flexShrink: 0 }}>{tag}</code>
              <span style={{ color: 'var(--muted)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving
            ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}/> Guardando…</>
            : <><i className="ti ti-device-floppy"/> Guardar plantilla</>}
        </button>
      </div>
    </div>
  )
}

import { useRef } from 'react'
import { pdf } from '../api/client'

export default function NodeDetail({ node, onEdit, onDelete, onAddChild, onPdfChange, toast }) {
  const fileRef = useRef()
  if (!node) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      height:'100%', gap:12, color:'var(--faint)' }}>
      <i className="ti ti-arrow-left" style={{fontSize:32}}/>
      <p style={{fontSize:14}}>Selecciona un nodo del árbol</p>
    </div>
  )

  const handleUpload = async e => {
    const file = e.target.files[0]; if (!file) return
    try {
      await pdf.upload(node.id, file)
      toast.ok('PDF subido correctamente')
      onPdfChange()
    } catch (err) { toast.err(err.message) }
    fileRef.current.value = ''
  }

  const handleDownload = async () => {
    try { await pdf.download(node.id, node.pdf?.filename) }
    catch (err) { toast.err(err.message) }
  }

  const handleDeletePdf = async () => {
    if (!confirm('¿Eliminar el PDF de este nodo?')) return
    try { await pdf.remove(node.id); toast.ok('PDF eliminado'); onPdfChange() }
    catch (err) { toast.err(err.message) }
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <span className={`badge ${node.type==='leaf' ? 'badge-pdf' : 'badge-q'}`} style={{marginBottom:8}}>
            {node.type==='leaf' ? 'Hoja PDF' : 'Pregunta'}
          </span>
          <h2 style={{marginTop:4}}>{node.text}</h2>
          {node.description && <p style={{color:'var(--muted)', marginTop:6, fontSize:13, lineHeight:1.6}}>{node.description}</p>}
        </div>
        <div style={{ display:'flex', gap:8, flexShrink:0, marginLeft:16 }}>
          <button className="btn btn-sm" onClick={onEdit}><i className="ti ti-edit"/> Editar</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}><i className="ti ti-trash"/></button>
        </div>
      </div>

      {/* Options */}
      {node.type === 'question' && node.options?.length > 0 && (
        <div className="card" style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:500,color:'var(--faint)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>
            Opciones de respuesta
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
            {node.options.map((o,i) => (
              <span key={i} style={{padding:'4px 10px', background:'var(--info-bg)', color:'var(--info)',
                borderRadius:20, fontSize:12}}>{o}</span>
            ))}
          </div>
        </div>
      )}

      {/* Children summary */}
      {node.children?.length > 0 && (
        <div className="card" style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:500,color:'var(--faint)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>
            Nodos hijos ({node.children.length})
          </div>
          {node.children.map(c => (
            <div key={c.id} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',
              borderBottom:'0.5px solid var(--border)'}}>
              <i className={c.type==='leaf' ? 'ti ti-file-text' : 'ti ti-help-circle'}
                style={{color: c.type==='leaf' ? 'var(--accent)' : 'var(--info)', fontSize:13}}/>
              <span style={{fontSize:13, flex:1}}>{c.text}</span>
              <span className={`badge ${c.type==='leaf' ? 'badge-pdf' : 'badge-q'}`} style={{fontSize:10}}>
                {c.type==='leaf' ? 'PDF' : 'Q'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* PDF zone */}
      {node.type === 'leaf' && (
        <div className="card" style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:500,color:'var(--faint)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:12}}>
            Archivo PDF resultado
          </div>
          {node.pdf ? (
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <i className="ti ti-file-type-pdf" style={{fontSize:28, color:'var(--danger)'}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:500, fontSize:13}}>{node.pdf.filename}</div>
                <div style={{fontSize:11, color:'var(--faint)'}}>
                  {node.pdf.fileSize ? `${(node.pdf.fileSize/1024).toFixed(1)} KB` : ''}
                </div>
              </div>
              <button className="btn btn-sm" onClick={handleDownload}><i className="ti ti-download"/> Descargar</button>
              <button className="btn btn-danger btn-sm" onClick={handleDeletePdf}><i className="ti ti-trash"/></button>
            </div>
          ) : (
            <label style={{
              display:'block', border:'1.5px dashed var(--border-md)', borderRadius:'var(--radius)',
              padding:'20px', textAlign:'center', cursor:'pointer', color:'var(--muted)', fontSize:13,
              transition:'border-color .15s, background .15s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border-md)'}>
              <i className="ti ti-cloud-upload" style={{fontSize:28, display:'block', marginBottom:6, color:'var(--accent)'}}/>
              Arrastra un PDF o haz clic para subir
              <input ref={fileRef} type="file" accept=".pdf" style={{display:'none'}} onChange={handleUpload}/>
            </label>
          )}
        </div>
      )}

      {/* Add child */}
      {node.type === 'question' && (
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <button className="btn btn-sm" onClick={() => onAddChild('question')}>
            <i className="ti ti-git-branch"/> Añadir pregunta hija
          </button>
          <button className="btn btn-sm" onClick={() => onAddChild('leaf')}>
            <i className="ti ti-file-plus"/> Añadir hoja PDF
          </button>
        </div>
      )}

      {/* Meta */}
      <div style={{marginTop:20, fontSize:11, color:'var(--faint)'}}>
        ID: <code style={{fontSize:10}}>{node.id}</code>
        {node.updatedAt && <span style={{marginLeft:12}}>
          Actualizado: {new Date(node.updatedAt).toLocaleString('es-ES')}
        </span>}
      </div>
    </div>
  )
}

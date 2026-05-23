import { useState, useEffect, useCallback } from 'react'
import { nodes as api } from '../api/client'
import NodeTree from '../components/NodeTree'
import NodeDetail from '../components/NodeDetail'
import NodeForm from '../components/NodeForm'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

export default function TreePage({ toast }) {
  const [tree, setTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)
  // Historial de navegación para poder volver atrás
  const [navHistory, setNavHistory] = useState([])

  const loadTree = useCallback(async () => {
    try {
      const data = await api.tree()
      setTree(data)
      if (selected) {
        const fresh = findNode(data, selected.id)
        setSelected(fresh || null)
      }
    } catch (err) { toast.err(err.message) }
    finally { setLoading(false) }
  }, [selected?.id])

  useEffect(() => { loadTree() }, [])

  function findNode(nodes, id) {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.children) { const f = findNode(n.children, id); if (f) return f }
    }
    return null
  }

  // Navegar a un nodo por ID (desde clic en opción o en hijo)
  const handleNavigate = (nodeId) => {
    const target = findNode(tree, nodeId)
    if (!target) return
    if (selected) setNavHistory(h => [...h, selected])
    setSelected(target)
  }

  // Selección desde el árbol lateral (resetea historial)
  const handleSelect = node => {
    setNavHistory([])
    setSelected(node)
  }

  // Volver al nodo anterior
  const handleBack = () => {
    if (navHistory.length === 0) return
    const prev = navHistory[navHistory.length - 1]
    setNavHistory(h => h.slice(0, -1))
    setSelected(prev)
  }

  const handleAdd = (parentId, type = 'question') => setModal({ mode: 'create', parentId, type })

  const handleSave = async (form) => {
    try {
      if (modal.mode === 'edit') {
        await api.update(selected.id, form)
        toast.ok('Nodo actualizado')
      } else {
        const created = await api.create(form)
        toast.ok('Nodo creado')
        await loadTree()
        setSelected(created)
        setModal(null)
        return
      }
      setModal(null)
      await loadTree()
    } catch (err) { toast.err(err.message) }
  }

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${selected.text}" y todos sus hijos?`)) return
    try {
      await api.remove(selected.id)
      toast.ok('Nodo eliminado')
      setSelected(null)
      setNavHistory([])
      await loadTree()
    } catch (err) { toast.err(err.message) }
  }

  if (loading) return <Spinner full/>

  return (
    <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', height:'100%' }}>
      {/* Sidebar árbol */}
      <div style={{ borderRight:'0.5px solid var(--border)', overflowY:'auto', background:'var(--surface2)' }}>
        <NodeTree tree={tree} selectedId={selected?.id} onSelect={handleSelect} onAdd={handleAdd}/>
      </div>

      {/* Panel principal */}
      <div style={{ overflowY:'auto', display:'flex', flexDirection:'column' }}>
        {/* Barra de navegación con breadcrumb de historial */}
        {navHistory.length > 0 && (
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'8px 28px', borderBottom:'0.5px solid var(--border)',
            background:'var(--surface2)', fontSize:12, color:'var(--muted)', flexWrap:'wrap'
          }}>
            <button className="btn btn-ghost btn-sm" onClick={handleBack} style={{gap:4}}>
              <i className="ti ti-arrow-left" style={{fontSize:13}}/> Volver
            </button>
            <span style={{color:'var(--border-md)'}}>|</span>
            {navHistory.map((n, i) => (
              <span key={n.id} style={{display:'flex', alignItems:'center', gap:4}}>
                <span
                  style={{color:'var(--accent)', cursor:'pointer', textDecoration:'underline'}}
                  onClick={() => {
                    // Navegar a ese punto del historial
                    setNavHistory(h => h.slice(0, i))
                    setSelected(n)
                  }}>
                  {n.text.length > 30 ? n.text.slice(0,28)+'…' : n.text}
                </span>
                <i className="ti ti-chevron-right" style={{fontSize:10}}/>
              </span>
            ))}
            <span style={{color:'var(--ink)', fontWeight:500}}>
              {selected?.text?.length > 30 ? selected.text.slice(0,28)+'…' : selected?.text}
            </span>
          </div>
        )}

        <div style={{flex:1}}>
          <NodeDetail
            node={selected}
            onEdit={() => setModal({ mode: 'edit' })}
            onDelete={handleDelete}
            onAddChild={(type) => handleAdd(selected.id, type)}
            onPdfChange={loadTree}
            onNavigate={handleNavigate}
            toast={toast}
          />
        </div>
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <Modal
          title={modal.mode === 'edit' ? 'Editar nodo' : 'Nuevo nodo'}
          onClose={() => setModal(null)}>
          <NodeForm
            initial={modal.mode === 'edit' ? selected : { type: modal.type || 'question' }}
            parentId={modal.parentId ?? null}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}

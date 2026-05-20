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
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', parentId, type }

  const loadTree = useCallback(async () => {
    try {
      const data = await api.tree()
      setTree(data)
      // refresh selected node from new tree
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

  const handleSelect = node => setSelected(node)

  const handleAdd = (parentId, type = 'question') => {
    setModal({ mode: 'create', parentId, type })
  }

  const handleSave = async (form) => {
    try {
      if (modal.mode === 'edit') {
        await api.update(selected.id, form)
        toast.ok('Nodo actualizado')
      } else {
        const created = await api.create(form)
        toast.ok('Nodo creado')
        await loadTree()
        // select the new node
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
      await loadTree()
    } catch (err) { toast.err(err.message) }
  }

  if (loading) return <Spinner full/>

  return (
    <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', height:'100%' }}>
      {/* Sidebar tree */}
      <div style={{ borderRight:'0.5px solid var(--border)', overflowY:'auto', background:'var(--surface2)' }}>
        <NodeTree tree={tree} selectedId={selected?.id} onSelect={handleSelect} onAdd={handleAdd}/>
      </div>

      {/* Detail */}
      <div style={{ overflowY:'auto' }}>
        <NodeDetail
          node={selected}
          onEdit={() => setModal({ mode: 'edit' })}
          onDelete={handleDelete}
          onAddChild={(type) => handleAdd(selected.id, type)}
          onPdfChange={loadTree}
          toast={toast}
        />
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

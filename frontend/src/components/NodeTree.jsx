import { useState } from 'react'

function NodeRow({ node, depth, selectedId, onSelect, onAdd, onDelete }) {
  const [open, setOpen] = useState(depth === 0)
  const hasKids = node.children?.length > 0

  return (
    <div>
      <div
        className={`tree-row${selectedId === node.id ? ' active' : ''}`}
        onClick={() => onSelect(node)}
      >
        {Array.from({ length: depth }).map((_, i) => <span key={i} className="t-indent"/>)}
        <span className="t-toggle" style={{ visibility: hasKids ? 'visible' : 'hidden' }}
          onClick={e => { e.stopPropagation(); setOpen(o => !o) }}>
          <i className={`ti ti-chevron-right`} style={{
            fontSize: 11, display: 'block',
            transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s'
          }}/>
        </span>
        <span className="t-icon">
          {node.type === 'leaf'
            ? <i className="ti ti-file-text" style={{ fontSize: 13, color: 'var(--accent)' }}/>
            : <i className="ti ti-help-circle" style={{ fontSize: 13, color: 'var(--info)' }}/>}
        </span>
        <span className="t-label" style={{ fontSize: 12 }}>{node.text}</span>
      </div>
      {open && hasKids && (
        <div>
          {node.children.map(c => (
            <NodeRow key={c.id} node={c} depth={depth + 1}
              selectedId={selectedId} onSelect={onSelect} onAdd={onAdd} onDelete={onDelete}/>
          ))}
        </div>
      )}
    </div>
  )
}

export default function NodeTree({ tree, selectedId, onSelect, onAdd }) {
  return (
    <div>
      <div style={{ padding: '10px 12px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Árbol
        </span>
        <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => onAdd(null)}>
          <i className="ti ti-plus" style={{ fontSize: 12 }}/> Raíz
        </button>
      </div>
      {tree.length === 0
        ? <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--faint)' }}>Sin nodos. Crea una raíz.</div>
        : tree.map(n => (
          <NodeRow key={n.id} node={n} depth={0}
            selectedId={selectedId} onSelect={onSelect} onAdd={onAdd}/>
        ))
      }
    </div>
  )
}

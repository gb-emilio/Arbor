import { useState, useEffect } from 'react'
import { users as api } from '../api/client'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

export default function UsersPage({ toast }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pwdModal, setPwdModal] = useState(null)
  const [newPwd, setNewPwd] = useState('')

  const load = async () => {
    try { setList(await api.list()) }
    catch (e) { toast.err(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const toggle = async id => {
    try { const u = await api.toggle(id); setList(l => l.map(x => x.id===id ? u : x)); toast.ok('Estado actualizado') }
    catch (e) { toast.err(e.message) }
  }
  const changeRole = async (id, role) => {
    try { const u = await api.changeRole(id, role); setList(l => l.map(x => x.id===id ? u : x)); toast.ok('Rol actualizado') }
    catch (e) { toast.err(e.message) }
  }
  const doDelete = async id => {
    if (!confirm('¿Eliminar este usuario?')) return
    try { await api.remove(id); setList(l => l.filter(x => x.id!==id)); toast.ok('Usuario eliminado') }
    catch (e) { toast.err(e.message) }
  }
  const resetPwd = async () => {
    if (newPwd.length < 8) { toast.err('Mínimo 8 caracteres'); return }
    try {
      await api.resetPassword(pwdModal, newPwd)
      toast.ok('Contraseña actualizada'); setPwdModal(null); setNewPwd('')
    } catch (e) { toast.err(e.message) }
  }

  if (loading) return <Spinner full/>

  return (
    <div className="page">
      <div className="page-header">
        <h2>Usuarios</h2>
        <span style={{fontSize:12,color:'var(--faint)'}}>{list.length} registros</span>
      </div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th>
              <th>Creado</th><th style={{textAlign:'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map(u => (
              <tr key={u.id}>
                <td><strong>{u.username}</strong></td>
                <td style={{color:'var(--muted)'}}>{u.email}</td>
                <td>
                  <select
                    style={{fontSize:12,padding:'3px 6px',border:'0.5px solid var(--border-md)',
                      borderRadius:4,background:'transparent',color:'var(--ink)',cursor:'pointer'}}
                    value={u.role}
                    onChange={e => changeRole(u.id, e.target.value)}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td>
                  <span className={`badge ${u.enabled ? 'badge-on' : 'badge-off'}`}>
                    {u.enabled ? 'Activo' : 'Desactivado'}
                  </span>
                </td>
                <td style={{color:'var(--faint)', fontSize:12}}>
                  {new Date(u.createdAt).toLocaleDateString('es-ES')}
                </td>
                <td>
                  <div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                    <button className="btn btn-sm" onClick={() => toggle(u.id)} title={u.enabled ? 'Desactivar' : 'Activar'}>
                      <i className={`ti ${u.enabled ? 'ti-toggle-right' : 'ti-toggle-left'}`}/>
                    </button>
                    <button className="btn btn-sm" onClick={() => { setPwdModal(u.id); setNewPwd('') }} title="Cambiar contraseña">
                      <i className="ti ti-key"/>
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => doDelete(u.id)} title="Eliminar">
                      <i className="ti ti-trash"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pwdModal && (
        <Modal title="Cambiar contraseña" onClose={() => setPwdModal(null)}>
          <div className="field-group">
            <label className="field-label">Nueva contraseña</label>
            <input className="field" type="password" value={newPwd}
              onChange={e => setNewPwd(e.target.value)} placeholder="Mínimo 8 caracteres" autoFocus/>
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={() => setPwdModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={resetPwd}>Actualizar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

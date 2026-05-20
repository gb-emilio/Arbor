import { createContext, useContext, useState, useCallback } from 'react'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('arborq_user')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  const login = useCallback((token, userData) => {
    localStorage.setItem('arborq_token', token)
    localStorage.setItem('arborq_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('arborq_token')
    localStorage.removeItem('arborq_user')
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ user, login, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)

import React, { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext({ user: null })

export default function AuthProvider({ children }){
  const [user, setUser] = useState(null)

  useEffect(() => {
    if(!window.netlifyIdentity) return
    const id = window.netlifyIdentity
    id.on('init', u => setUser(u))
    id.on('login', u => setUser(u))
    id.on('logout', () => setUser(null))
    id.init()
    return () => {
      id.off('init')
      id.off('login')
      id.off('logout')
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

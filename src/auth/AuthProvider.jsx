import React, { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext({ user: null })

export default function AuthProvider({ children }){
  const [user, setUser] = useState(null)

  useEffect(() => {
    if(!window.netlifyIdentity) return
    const id = window.netlifyIdentity
    function normalize(u){
      if(!u) return null
      // netlify identity user contains user_metadata with full_name and avatar_url
      const meta = u.user_metadata || {}
      return {
        email: u.email,
        id: u.id,
        displayName: meta.full_name || meta.display_name || u.email,
        avatarUrl: meta.avatar_url || meta.avatar || null
      }
    }

    id.on('init', u => setUser(normalize(u)))
    id.on('login', u => setUser(normalize(u)))
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

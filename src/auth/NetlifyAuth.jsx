import React, { useEffect, useContext } from 'react'
import { AuthContext } from './AuthProvider'

export default function NetlifyAuth(){
  const { user } = useContext(AuthContext)

  function openModal(){
    if(window.netlifyIdentity) window.netlifyIdentity.open()
  }

  return (
    <div className="netlify-auth">
      {user ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" style={{ width:28, height:28, borderRadius:999 }} /> : null}
          <small>{user.displayName || user.email}</small>
          <button onClick={() => window.netlifyIdentity.logout()}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={openModal}>Sign in / Sign up</button>
        </div>
      )}
    </div>
  )
}

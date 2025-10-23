import React, { useEffect, useState } from 'react'

export default function NetlifyAuth(){
  const [user, setUser] = useState(null)

  useEffect(() => {
    if(!window.netlifyIdentity) return
    const id = window.netlifyIdentity
    id.on('init', user => setUser(user))
    id.on('login', user => setUser(user))
    id.on('logout', () => setUser(null))
    id.init()
    return () => {
      id.off('init')
      id.off('login')
      id.off('logout')
    }
  }, [])

  function openModal(){
    if(window.netlifyIdentity) window.netlifyIdentity.open()
  }

  return (
    <div className="netlify-auth">
      <h3>Auth (email)</h3>
      {user ? (
        <div>
          <p>Signed in as {user.email}</p>
          <button onClick={() => window.netlifyIdentity.logout()}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Sign up / Login with email</p>
          <button onClick={openModal}>Open Sign-in</button>
        </div>
      )}
    </div>
  )
}

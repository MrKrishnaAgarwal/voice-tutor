import React, { useContext, useState } from 'react'
import { AuthContext } from '../auth/AuthProvider'

export default function Profile({ progress }){
  const { user, refreshUser } = useContext(AuthContext)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const lessons = progress || {}
  const badges = Object.keys(lessons).filter(k => (lessons[k].score || 0) >= 1)

  return (
    <div className="card">
      <h3>Profile</h3>
      {user ? (
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" style={{ width:56, height:56, borderRadius:999 }} /> : <div style={{ width:56, height:56, borderRadius:999, background:'#f1f5f9' }} />}
            <div style={{ flex: 1 }}>
              <p style={{ margin:0, fontWeight:700 }}>{user.displayName || user.email}</p>
              <div>
                <small>Badges</small>
                <div className="profile-badges">
                  {badges.length ? badges.map(b => <span key={b} className="badge">{b}</span>) : <small>No badges yet</small>}
                </div>
              </div>
            </div>
            <div>
              <button onClick={() => { setEditing(e => !e); setName(user.displayName || ''); setAvatar(user.avatarUrl || '') }}>{editing ? 'Cancel' : 'Edit'}</button>
            </div>
          </div>

          {editing ? (
            <div style={{ marginTop: 12 }}>
              <label>Display name</label>
              <div><input value={name} onChange={e => setName(e.target.value)} /></div>
              <label>Avatar URL</label>
              <div><input value={avatar} onChange={e => setAvatar(e.target.value)} /></div>
              <div style={{ marginTop:8 }}>
                <button onClick={async () => {
                  if(!window.netlifyIdentity) return
                  const current = window.netlifyIdentity.currentUser()
                  if(!current) return
                  await current.update({ user_metadata: { full_name: name, avatar_url: avatar } })
                  refreshUser()
                  setEditing(false)
                }}>Save</button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p><small>Not signed in</small></p>
      )}
    </div>
  )
}

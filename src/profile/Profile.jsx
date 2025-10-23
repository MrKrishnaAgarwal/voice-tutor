import React, { useContext, useState } from 'react'
import { AuthContext } from '../auth/AuthProvider'

export default function Profile({ progress }){
  const { user, refreshUser, setUser } = useContext(AuthContext)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [uploading, setUploading] = useState(false)
  const lessons = progress || {}
  const badges = Object.keys(lessons).filter(k => (lessons[k].score || 0) >= 1)

  return (
    <div className="card">
      <h3>Profile</h3>
      {user ? (
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {editing ? (
              (avatar || user.avatarUrl) ? <img src={avatar || user.avatarUrl} alt="avatar" style={{ width:56, height:56, borderRadius:999 }} /> : <div style={{ width:56, height:56, borderRadius:999, background:'#f1f5f9' }} />
            ) : (
              user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" style={{ width:56, height:56, borderRadius:999 }} /> : <div style={{ width:56, height:56, borderRadius:999, background:'#f1f5f9' }} />
            )}
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
              <div><input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Or upload an image" /></div>
              <div style={{ marginTop:8 }}>
                <input type="file" accept="image/*" onChange={async e => {
                  const f = e.target.files && e.target.files[0]
                  if(!f) return
                  setUploading(true)
                  const reader = new FileReader()
                  reader.onload = async () => {
                    const dataUrl = reader.result
                    // call Netlify function
                    try{
                      const res = await fetch('/.netlify/functions/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: f.name, data: dataUrl }) })
                      const j = await res.json()
                      if(j.url){ setAvatar(j.url) }
                    }catch(err){ console.error(err) }
                    setUploading(false)
                  }
                  reader.readAsDataURL(f)
                }} /> {uploading ? 'Uploading...' : null}
              </div>
              <div style={{ marginTop:8 }}>
                <button onClick={async () => {
                  if(!window.netlifyIdentity) return
                  const current = window.netlifyIdentity.currentUser()
                  if(!current) return
                  try{
                    const updated = await current.update({ user_metadata: { full_name: name, avatar_url: avatar } })
                    // updated may contain the new user metadata - update local preview and refresh context
                    if(updated && updated.user_metadata){
                      const newAvatar = updated.user_metadata.avatar_url || avatar
                      setAvatar(newAvatar)
                      // optimistic update the global user so profile shows immediately
                      setUser({ ...user, displayName: updated.user_metadata.full_name || name, avatarUrl: newAvatar })
                    }
                    // refresh context user in case Netlify identity needs it
                    refreshUser()
                    setEditing(false)
                  }catch(err){
                    console.error('Failed to update user metadata', err)
                  }
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

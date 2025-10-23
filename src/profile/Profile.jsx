import React, { useContext } from 'react'
import { AuthContext } from '../auth/AuthProvider'

export default function Profile({ progress }){
  const { user } = useContext(AuthContext)
  const lessons = progress || {}
  const badges = Object.keys(lessons).filter(k => (lessons[k].score || 0) >= 1)

  return (
    <div className="card">
      <h3>Profile</h3>
      {user ? (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" style={{ width:56, height:56, borderRadius:999 }} /> : <div style={{ width:56, height:56, borderRadius:999, background:'#f1f5f9' }} />}
          <div>
            <p style={{ margin:0, fontWeight:700 }}>{user.displayName || user.email}</p>
            <div>
              <small>Badges</small>
              <div className="profile-badges">
                {badges.length ? badges.map(b => <span key={b} className="badge">{b}</span>) : <small>No badges yet</small>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p><small>Not signed in</small></p>
      )}
    </div>
  )
}

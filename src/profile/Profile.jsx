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
        <div>
          <p><strong>{user.email}</strong></p>
          <div>
            <small>Badges</small>
            <div className="profile-badges">
              {badges.length ? badges.map(b => <span key={b} className="badge">{b}</span>) : <small>No badges yet</small>}
            </div>
          </div>
        </div>
      ) : (
        <p><small>Not signed in</small></p>
      )}
    </div>
  )
}

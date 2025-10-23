export async function saveProgressRemote(userId, lessonId, stepIndex, score){
  return fetch('/.netlify/functions/saveProgress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, lessonId, stepIndex, score }) })
}

export async function getProgressRemote(userId){
  const res = await fetch(`/.netlify/functions/getProgress?userId=${encodeURIComponent(userId)}`)
  return res.json()
}

export async function saveProfileRemote(userId, email, displayName, avatarUrl){
  const res = await fetch('/.netlify/functions/saveProfile', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ userId, email, displayName, avatarUrl }) })
  return res.json()
}

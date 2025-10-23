export function loadProgress(userId){
  try{
    const raw = localStorage.getItem(`vt:progress:${userId}`)
    return raw ? JSON.parse(raw) : {}
  }catch(e){ return {} }
}

export function saveProgress(userId, progress){
  try{ localStorage.setItem(`vt:progress:${userId}`, JSON.stringify(progress)) }catch(e){}
}

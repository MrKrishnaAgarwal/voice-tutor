const { createClient } = require('@supabase/supabase-js')
const SUPA_URL = process.env.SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supa = createClient(SUPA_URL, SUPA_KEY)

exports.handler = async function(event){
  try{
    if(event.httpMethod !== 'POST') return { statusCode:405, body: 'Method not allowed' }
    const body = JSON.parse(event.body || '{}')
    const { userId, email, displayName, avatarUrl } = body
    if(!userId) return { statusCode:400, body: 'missing userId' }
    const now = new Date().toISOString()
    const { data, error } = await supa.from('users').upsert({ id: userId, email, display_name: displayName, avatar_url: avatarUrl, updated_at: now })
    if(error) throw error
    return { statusCode:200, body: JSON.stringify({ ok: true, data }) }
  }catch(err){
    console.error(err)
    return { statusCode:500, body: JSON.stringify({ error: String(err) }) }
  }
}

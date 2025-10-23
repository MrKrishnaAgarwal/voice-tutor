const { createClient } = require('@supabase/supabase-js')

const SUPA_URL = process.env.SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supa = createClient(SUPA_URL, SUPA_KEY)

exports.handler = async function(event){
  try{
    if(event.httpMethod !== 'POST') return { statusCode:405, body: 'Method not allowed' }
    const body = JSON.parse(event.body || '{}')
    const { userId, lessonId, stepIndex, score } = body
    if(!userId || !lessonId) return { statusCode:400, body: 'missing fields' }

    const now = new Date().toISOString()
    const upsert = await supa.from('progress').upsert({ user_id: userId, lesson_id: lessonId, step_index: stepIndex || 0, score: score || 0, updated_at: now }, { onConflict: ['user_id','lesson_id'] })
    if(upsert.error) throw upsert.error
    return { statusCode:200, body: JSON.stringify({ ok: true }) }
  }catch(err){
    console.error(err)
    return { statusCode:500, body: JSON.stringify({ error: String(err) }) }
  }
}

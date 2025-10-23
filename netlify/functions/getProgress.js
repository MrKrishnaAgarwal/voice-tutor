const { createClient } = require('@supabase/supabase-js')
const SUPA_URL = process.env.SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supa = createClient(SUPA_URL, SUPA_KEY)

exports.handler = async function(event){
  try{
    const qs = event.queryStringParameters || {}
    const { userId } = qs
    if(!userId) return { statusCode:400, body: 'missing userId' }
    const { data, error } = await supa.from('progress').select('*').eq('user_id', userId)
    if(error) throw error
    return { statusCode:200, body: JSON.stringify(data) }
  }catch(err){
    console.error(err)
    return { statusCode:500, body: JSON.stringify({ error: String(err) }) }
  }
}

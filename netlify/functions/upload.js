const allowedTypes = ['image/png','image/jpeg','image/jpg','image/webp']

exports.handler = async function(event, context){
  if(event.httpMethod !== 'POST'){
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try{
    const body = JSON.parse(event.body || '{}')
    const { filename, data } = body
    if(!data) return { statusCode: 400, body: JSON.stringify({ error: 'No data' }) }

    // data is expected to be a data URL: data:<type>;base64,<data>
    const match = data.match(/^data:(.+);base64,(.+)$/)
    if(!match) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid data URL' }) }
    const mime = match[1]
    const b64 = match[2]
    if(!allowedTypes.includes(mime)) return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported image type' }) }

    // For this simple demo we return the same data URL back. A production implementation
    // should upload to persistent storage (S3, Cloudinary, etc.) and return a public URL.
    const dataUrl = `data:${mime};base64,${b64}`

    return {
      statusCode: 200,
      body: JSON.stringify({ url: dataUrl })
    }
  }catch(err){
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}

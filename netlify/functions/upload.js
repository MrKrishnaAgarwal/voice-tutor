const allowedTypes = ['image/png','image/jpeg','image/jpg','image/webp']
const CLOUDINARY_URL = process.env.CLOUDINARY_URL
const S3_BUCKET = process.env.S3_BUCKET

async function uploadToCloudinary(filename, dataUrl){
  // using cloudinary NPM library
  const cloudinary = require('cloudinary').v2
  // CLOUDINARY_URL should be like cloudinary://api_key:api_secret@cloud_name
  // cloudinary library reads from env
  const res = await cloudinary.uploader.upload(dataUrl, { public_id: filename.replace(/\.[^/.]+$/, ''), folder: 'voice-tutor/avatars' })
  return res.secure_url
}

async function uploadToS3(filename, dataUrl){
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/)
  if(!match) throw new Error('Invalid data URL')
  const mime = match[1]
  const b64 = match[2]
  const buffer = Buffer.from(b64, 'base64')
  const client = new S3Client({ region: process.env.AWS_REGION })
  const key = `voice-tutor/avatars/${Date.now()}-${filename}`
  await client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: buffer, ContentType: mime, ACL: 'public-read' }))
  // construct public URL (assuming bucket has public hosting)
  return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`
}

exports.handler = async function(event, context){
  if(event.httpMethod !== 'POST'){
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try{
    const body = JSON.parse(event.body || '{}')
    const { filename, data } = body
    if(!data) return { statusCode: 400, body: JSON.stringify({ error: 'No data' }) }

    const match = data.match(/^data:(.+);base64,(.+)$/)
    if(!match) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid data URL' }) }
    const mime = match[1]
    if(!allowedTypes.includes(mime)) return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported image type' }) }

    let url
    if(CLOUDINARY_URL){
      url = await uploadToCloudinary(filename, data)
    }else if(S3_BUCKET){
      url = await uploadToS3(filename, data)
    }else{
      // fallback to returning data URL (not recommended for production)
      url = data
    }

    return { statusCode: 200, body: JSON.stringify({ url }) }
  }catch(err){
    console.error(err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}

# Voice Tutor (Demo)

Minimal JavaScript React + Vite scaffold for a voice-native tutoring platform (class 8-10) focused on Maths & Science.

Features included in this scaffold:
- React + Vite (JS)
- Simple voice demo using Web Speech API (STT) and SpeechSynthesis (TTS)
- Language switch (English/Hindi)
- Netlify config for deployment

How to run locally:

1. Install dependencies:

```powershell
npm install
```

2. Run dev server:

```powershell
npm run dev
```

Open http://localhost:5173 in a modern browser (Chrome/Edge). For voice, allow microphone access.

Notes:
- This is a minimal starting point. Next: implement Netlify Identity for email auth, lesson JSON schema, and interactive quiz flows.

Netlify Identity setup (email auth)
1. Push this repo to GitHub and connect the repository to Netlify.
2. In Netlify dashboard, open Site settings -> Identity -> Enable Identity.
3. Under Identity -> Services, enable "Email" and configure any SMTP/send settings if you want to customize confirmations.
4. Deploy the site. The client includes the Netlify Identity widget script and a simple UI (`src/auth/NetlifyAuth.jsx`) that opens the sign-in modal.

Notes on local testing:
- Netlify Identity requires the site to be served from a Netlify deployment for full functionality. During local dev, the widget will initialize but login may not persist. Use the deployed Netlify site to test email signup flows.

Image uploads (serverless function)
- There's a demo Netlify Function at `netlify/functions/upload.js` that accepts a POST with a data URL and returns a URL. For simplicity it returns the same data URL; in production replace this with a function that uploads to S3/Cloudinary and returns a public URL.
- The profile editor in the app uses this function when you pick a file.

Cloudinary / S3 upload
- The upload function now supports Cloudinary and S3. Set either of these environment variables in your Netlify site settings:
	- `CLOUDINARY_URL` (recommended) — e.g. `cloudinary://<api_key>:<api_secret>@<cloud_name>`
	- OR `S3_BUCKET` and `AWS_REGION` and configure AWS credentials in Netlify (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- When `CLOUDINARY_URL` is present, uploads will go to Cloudinary and return a secure URL. If `S3_BUCKET` is present, uploads go to S3.

Security note: store credentials in Netlify environment variables and do not commit them to the repo.

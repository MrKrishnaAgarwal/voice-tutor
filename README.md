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

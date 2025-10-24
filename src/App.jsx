import React, { useState, useRef } from 'react'
import VoiceDemo from './voice/VoiceDemo'
import VoiceQuiz from './quiz/VoiceQuiz'
import NetlifyAuth from './auth/NetlifyAuth'
import Profile from './profile/Profile'
import { loadProgress } from './utils/progress'

export default function App(){
  const [lang, setLang] = useState('en-US')

  const progress = loadProgress('anon')

  return (
    <div className="app">
      <header>
        <h1>Voice Tutor</h1>
        <div className="toolbar">
          <div className="lang-select">
            <select value={lang} onChange={e => setLang(e.target.value)}>
              <option value="en-US">English</option>
              <option value="hi-IN">Hindi</option>
            </select>
          </div>
          <NetlifyAuth />
        </div>
      </header>

      <Profile user={null} progress={progress} />

      <div className="card">
        <VoiceDemo lang={lang} />
      </div>

      <div className="card">
        <VoiceQuiz lessonPath={'/lessons/math-linear-equations.json'} lang={lang} />
      </div>

      <div className="card">
        <VoiceQuiz lessonPath={'/lessons/science-motion.json'} lang={lang} />
      </div>

      <footer style={{ marginTop: 12 }}>
        <small>Deployed on Netlify — email auth enabled.</small>
      </footer>
    </div>
  )
}

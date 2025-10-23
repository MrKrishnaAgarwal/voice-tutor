import React, { useState, useRef } from 'react'
import VoiceDemo from './voice/VoiceDemo'
import VoiceQuiz from './quiz/VoiceQuiz'
import NetlifyAuth from './auth/NetlifyAuth'

export default function App(){
  const [lang, setLang] = useState('en-US')

  return (
    <div className="app">
      <header>
        <h1>Voice Tutor (Demo)</h1>
        <div className="lang-select">
          <label>Language: </label>
          <select value={lang} onChange={e => setLang(e.target.value)}>
            <option value="en-US">English</option>
            <option value="hi-IN">Hindi</option>
          </select>
        </div>
      </header>

      <main>
        <NetlifyAuth />
        <VoiceDemo lang={lang} />
        <hr />
        <VoiceQuiz lessonPath={'/lessons/math-linear-equations.json'} lang={lang} />
      </main>

      <footer>
        <p>Netlify deploy + email auth planned.</p>
      </footer>
    </div>
  )
}

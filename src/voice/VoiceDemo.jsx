import React, { useEffect, useRef, useState } from 'react'

export default function VoiceDemo({ lang }){
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if(!SpeechRecognition){
      console.warn('Web Speech API not supported')
      return
    }

    const recog = new SpeechRecognition()
    recog.lang = lang
    recog.interimResults = false
    recog.continuous = false

    recog.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('\n')
      setTranscript(text)
    }

    recog.onend = () => setListening(false)

    recognitionRef.current = recog
  }, [lang])

  function startListening(){
    if(!recognitionRef.current) return
    recognitionRef.current.start()
    setListening(true)
    setTranscript('')
  }

  function speak(text){
    if(!window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    window.speechSynthesis.speak(utter)
  }

  return (
    <div className="voice-demo">
      <h2>Voice lesson demo</h2>
      <p>Press speak to hear a short prompt, then press listen and answer verbally.</p>

      <div className="controls">
        <button onClick={() => speak(lang.startsWith('hi') ? 'नमस्ते, चलिए एक सरल सवाल करते हैं। 5 में से 2 जोड़ें।' : 'Hello, let\'s try a simple question. What is 5 plus 2?')}>Speak</button>
        <button onClick={startListening} disabled={listening}>{listening ? 'Listening...' : 'Listen'}</button>
      </div>

      <div className="transcript">
        <h3>Transcript</h3>
        <div className="box">{transcript || <i>No transcript yet</i>}</div>
      </div>
    </div>
  )
}

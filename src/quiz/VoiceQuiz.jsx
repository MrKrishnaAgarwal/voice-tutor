import React, { useEffect, useRef, useState } from 'react'
import { loadProgress, saveProgress } from '../utils/progress'
import { useContext } from 'react'
import { AuthContext } from '../auth/AuthProvider'

export default function VoiceQuiz({ lessonPath, lang }){
  const [lesson, setLesson] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [status, setStatus] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [score, setScore] = useState(0)
  const { user } = useContext(AuthContext)
  const userId = user ? user.id : 'anon'
  const recognitionRef = useRef(null)

  useEffect(() => {
    fetch(lessonPath).then(r => r.json()).then(data => {
      setLesson(data)
      // load progress
      const p = loadProgress(userId)
      const s = p[data.id] || { stepIndex: 0, score: 0 }
      setStepIndex(s.stepIndex)
      setScore(s.score)
    })
  }, [lessonPath])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if(!SpeechRecognition) return
    const recog = new SpeechRecognition()
    recog.lang = lang
    recog.interimResults = false
    recog.continuous = false

    recog.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('\n').toLowerCase()
      setTranscript(text)
      handleAnswer(text)
    }

    recog.onend = () => {
      setStatus('idle')
    }

    recognitionRef.current = recog
  }, [lang])

  function speak(text){
    if(!window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    window.speechSynthesis.speak(u)
  }

  function startListen(){
    if(!recognitionRef.current) return
    setTranscript('')
    setStatus('listening')
    recognitionRef.current.start()
  }

  function handleStep(){
    if(!lesson) return
    const step = lesson.steps[stepIndex]
    if(!step) return
    if(step.type === 'speak'){
      const t = typeof step.text === 'object' ? (step.text[lang.startsWith('hi') ? 'hi' : 'en']) : step.text
      speak(t)
      const next = stepIndex+1
      setStepIndex(next)
      saveProgress(userId, { ...loadProgress(userId), [lesson.id]: { stepIndex: next, score } })
      if(user && user.id){
        saveProgressRemote(user.id, lesson.id, next, score).catch(console.error)
      }
    }else if(step.type === 'expect-answer'){
      const q = typeof step.text === 'object' ? (step.text[lang.startsWith('hi') ? 'hi' : 'en']) : (step.text || 'Please answer')
      speak(q)
      startListen()
    }
  }

  function handleAnswer(text){
    if(!lesson) return
    const step = lesson.steps[stepIndex]
    if(step.type !== 'expect-answer') return
    const key = lang.startsWith('hi') ? 'hi' : 'en'
    const answers = Array.isArray(step.answers) ? step.answers : (step.answers[key] || [])
    const lowered = answers.map(a => a.toLowerCase())
    const ok = lowered.some(a => text.includes(a))
    if(ok){
      setScore(s => s+1)
      speak(lang.startsWith('hi') ? 'सही जवाब' : 'Correct')
      const next = stepIndex+1
      setStepIndex(next)
      saveProgress(userId, { ...loadProgress(userId), [lesson.id]: { stepIndex: next, score: score+1 } })
      if(user && user.id){
        saveProgressRemote(user.id, lesson.id, next, score+1).catch(console.error)
      }
    } else {
      const hint = typeof step.hint === 'object' ? (step.hint[key] || '') : step.hint
      speak(hint || (lang.startsWith('hi') ? 'कोशिश करें' : 'Try again'))
      // allow retry
    }
  }

  if(!lesson) return <div>Loading lesson...</div>

  return (
    <div className="voice-quiz">
      <h2>{lesson.title}</h2>
      <p>Score: {score}</p>
      <div className="quiz-controls">
        <button onClick={handleStep}>Next</button>
        <button onClick={startListen}>Listen</button>
      </div>

      <div className="transcript">
        <strong>Last answer:</strong> {transcript || '—'}
      </div>
    </div>
  )
}

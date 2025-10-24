import React, { useEffect, useRef, useState } from 'react'
import { loadProgress, saveProgress } from '../utils/progress'
import { useContext } from 'react'
import { AuthContext } from '../auth/AuthProvider'
import { saveProgressRemote } from '../utils/db'

export default function VoiceQuiz({ lessonPath, lang }){
  // derive a short language key used by lesson JSON (we store texts under 'en' and 'hi')
  const currentLang = lang && lang.startsWith && lang.startsWith('hi') ? 'hi' : 'en'
  const [lesson, setLesson] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [status, setStatus] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [score, setScore] = useState(0)
  const { user } = useContext(AuthContext)
  const userId = user ? user.id : 'anon'
  const recognitionRef = useRef(null)
  // track whether recognition is currently active to avoid repeated start() calls
  const isListeningRef = useRef(false)
  const questionMode = lesson && Array.isArray(lesson.questions)

  useEffect(() => {
    setLesson(null)
    setStatus('loading')
    fetch(lessonPath).then(r => {
      if(!r.ok) throw new Error(`Failed to fetch lesson: ${r.status}`)
      return r.json()
    }).then(data => {
      setLesson(data)
      // load progress
      const p = loadProgress(userId)
      const s = p[data.id] || { stepIndex: 0, score: 0 }
      setStepIndex(s.stepIndex)
      // if lesson has questions, set questionIndex from saved progress
      if(Array.isArray(data.questions)) setQuestionIndex(s.stepIndex || 0)
      setScore(s.score)
      setStatus('idle')
    }).catch(err => {
      console.error('Lesson load failed', err)
      setStatus('error')
    })
  }, [lessonPath])

  // When a lesson with questions is loaded, automatically start asking the first question
  useEffect(() => {
    if(lesson && Array.isArray(lesson.questions)){
      // small timeout to let UI settle
      setTimeout(() => askQuestion(questionIndex), 400)
    }
  }, [lesson])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if(!SpeechRecognition) return
    const recog = new SpeechRecognition()
    recog.lang = lang
    recog.interimResults = false
    recog.continuous = false

    // onstart/onend handlers update the listening flag and UI status
    recog.onstart = () => {
      isListeningRef.current = true
      setStatus('listening')
    }

    recog.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('\n').toLowerCase()
      setTranscript(text)
      handleAnswer(text)
    }

    recog.onend = () => {
      isListeningRef.current = false
      setStatus('idle')
    }

    recog.onerror = (err) => {
      // log and reset listening state so future starts are possible
      console.warn('Speech recognition error', err)
      isListeningRef.current = false
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
    // if recognition already active, don't start again
    if(isListeningRef.current) return

    setTranscript('')
    try{
      // mark status tentatively; final status is set in onstart
      setStatus('starting')
      recognitionRef.current.start()
    }catch(err){
      // InvalidStateError or other start errors can happen if start is called twice;
      // make this safe/quiet and reset status
      console.warn('Failed to start recognition', err)
      isListeningRef.current = false
      setStatus('idle')
    }
  }

  // Ask the current question when in question mode
  const askQuestion = (idx = questionIndex) => {
    if(!lesson || !lesson.questions) return
    const q = lesson.questions[idx]
    if(!q) return
    const text = (typeof q.text === 'object') ? (q.text[currentLang] || q.text.en || '') : (q.text || '')
    // If recognition is currently running, abort it before speaking to avoid conflicts
    if(recognitionRef.current && isListeningRef.current){
      try{ recognitionRef.current.abort() }catch(e){ /* ignore */ }
      // let abort settle briefly
    }
    speak(text)
    // automatically start listening after speaking
    // small timeout to allow TTS to begin - if browser blocks simultaneous TTS/STT
    setTimeout(() => startListen(), 700)
  }

  function handleStep(){
    if(!lesson) return
    const step = lesson.steps[stepIndex]
    if(!step) return
    if(step.type === 'speak'){
      const t = typeof step.text === 'object' ? (step.text[lang.startsWith('hi') ? 'hi' : 'en']) : step.text
      // ensure recognition is not running while speaking
      if(recognitionRef.current && isListeningRef.current){
        try{ recognitionRef.current.abort() }catch(e){ /* ignore */ }
      }
      speak(t)
      const next = stepIndex+1
      setStepIndex(next)
      saveProgress(userId, { ...loadProgress(userId), [lesson.id]: { stepIndex: next, score } })
      if(user && user.id){
        saveProgressRemote(user.id, lesson.id, next, score).catch(console.error)
      }
    }else if(step.type === 'expect-answer'){
      // If the expect-answer step carries its own text, use it. Otherwise try to
      // re-use the previous 'speak' step's text (common lesson pattern where a
      // speak step asks the question and the following expect-answer has answers
      // but no text). Fallback to a generic prompt if nothing is available.
      let q = ''
      if(step.text){
        q = (typeof step.text === 'object') ? (step.text[lang.startsWith('hi') ? 'hi' : 'en']) : step.text
      } else {
        const prev = lesson.steps[stepIndex - 1]
        if(prev && prev.type === 'speak'){
          q = (typeof prev.text === 'object') ? (prev.text[lang.startsWith('hi') ? 'hi' : 'en']) : prev.text
        }
      }
      if(!q) q = (currentLang === 'hi' ? 'कृपया उत्तर दें' : 'Please answer')
      // ensure recognition is not running while speaking
      if(recognitionRef.current && isListeningRef.current){
        try{ recognitionRef.current.abort() }catch(e){ /* ignore */ }
      }
      speak(q)
      startListen()
    }
  }

  function handleAnswer(text){
    if(!lesson) return
    // If lesson defines a questions array, handle question-mode answers
    if(questionMode){
      const q = lesson.questions[questionIndex]
      if(!q) return
      const key = currentLang
      const answers = Array.isArray(q.answers) ? q.answers : (q.answers && q.answers[key] ? q.answers[key] : [])
      const lowered = answers.map(a => a.toLowerCase())
      const ok = lowered.some(a => text.includes(a))
      if(ok){
        setScore(s => s+1)
        speak(currentLang === 'hi' ? 'सही जवाब' : 'Correct')
        const nextQ = questionIndex + 1
        setQuestionIndex(nextQ)
        // persist progress: use stepIndex as questionIndex for storage
        saveProgress(userId, { ...loadProgress(userId), [lesson.id]: { stepIndex: nextQ, score: score+1 } })
        if(user && user.id){ saveProgressRemote(user.id, lesson.id, nextQ, score+1).catch(console.error) }
        // automatically ask next question if available
        if(lesson.questions[nextQ]){
          setTimeout(() => askQuestion(nextQ), 800)
        }else{
          speak(currentLang === 'hi' ? 'अभ्यास पूरा हुआ' : 'Quiz complete')
        }
      } else {
        const hint = (typeof q.hint === 'object') ? (q.hint[key] || '') : q.hint
        speak(hint || (currentLang === 'hi' ? 'कोशिश करें' : 'Try again'))
        // allow retry
      }
      return
    }

    // Fallback to original step-based flow
    const step = lesson.steps[stepIndex]
    if(!step || step.type !== 'expect-answer') return
    const key = currentLang
    const answers = Array.isArray(step.answers) ? step.answers : (step.answers && step.answers[key] ? step.answers[key] : [])
    const lowered = answers.map(a => a.toLowerCase())
    const ok = lowered.some(a => text.includes(a))
    if(ok){
      setScore(s => s+1)
      speak(currentLang === 'hi' ? 'सही जवाब' : 'Correct')
      const next = stepIndex+1
      setStepIndex(next)
      saveProgress(userId, { ...loadProgress(userId), [lesson.id]: { stepIndex: next, score: score+1 } })
      if(user && user.id){ saveProgressRemote(user.id, lesson.id, next, score+1).catch(console.error) }
    } else {
      const hint = typeof step.hint === 'object' ? (step.hint[key] || '') : step.hint
      speak(hint || (currentLang === 'hi' ? 'कोशिश करें' : 'Try again'))
    }
  }

  // Handle Next button: in question mode advance to the next question and speak it;
  // otherwise fall back to the step-based handler.
  function handleNext(){
    if(questionMode){
      const nextQ = questionIndex + 1
      // If next question doesn't exist, announce completion
      if(!lesson.questions[nextQ]){
        speak(currentLang === 'hi' ? 'अभ्यास पूरा हुआ' : 'Quiz complete')
        return
      }
      // Update index and persist progress
      setQuestionIndex(nextQ)
      saveProgress(userId, { ...loadProgress(userId), [lesson.id]: { stepIndex: nextQ, score } })
      if(user && user.id){ saveProgressRemote(user.id, lesson.id, nextQ, score).catch(console.error) }
      // Ask the next question after a short delay so the state can settle
      // If recognition is running, abort it before asking next to avoid InvalidStateError
      if(recognitionRef.current && isListeningRef.current){
        try{ recognitionRef.current.abort() }catch(e){ /* ignore */ }
      }
      setTimeout(() => askQuestion(nextQ), 350)
      return
    }
    // non-question mode: reuse existing step handler
    handleStep()
  }

  if(status === 'loading') return <div>Loading lesson...</div>
  if(status === 'error') return <div>Failed to load lesson. Check console or ensure `public/lessons` contains the file.</div>
  if(!lesson) return <div>Loading lesson...</div>
  // safe getter: if a field is an object with language keys, pick the current language;
  // otherwise return the string or an empty fallback.
  const getText = (field) => {
    if(!field) return ''
    if(typeof field === 'string') return field
    if(typeof field === 'object') return field[currentLang] || field.en || Object.values(field)[0] || ''
    return String(field)
  }

  return (
    <div className="voice-quiz">
      {/* Use getText to avoid rendering the whole object (fixes React error) */}
      <h2>{getText(lesson.title)}</h2>
      <p>Score: {score}</p>
      <div className="quiz-controls">
        <button onClick={handleNext}>Next</button>
        <button onClick={startListen}>Listen</button>
      </div>

      <div className="transcript">
        <strong>Last answer:</strong> {transcript || '—'}
      </div>
    </div>
  )
}

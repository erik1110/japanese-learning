import { useState } from 'react'
import { speak, isSpeechSupported } from '../utils/speech.js'

/**
 * A 🔊 button that speaks furigana-markup Japanese text.
 */
export default function SpeakButton({ text, label = '發音', rate = 0.9, className = '' }) {
  const [speaking, setSpeaking] = useState(false)
  const supported = isSpeechSupported()

  function handleClick(e) {
    e.stopPropagation()
    if (!supported) return
    setSpeaking(true)
    speak(text, {
      rate,
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    })
  }

  return (
    <button
      type="button"
      className={`speak-btn ${speaking ? 'speaking' : ''} ${className}`}
      onClick={handleClick}
      disabled={!supported}
      title={supported ? '播放發音' : '此瀏覽器不支援語音合成'}
      aria-label="播放發音"
    >
      <span className="speak-icon">{speaking ? '🔉' : '🔊'}</span>
      {label && <span className="speak-label">{label}</span>}
    </button>
  )
}

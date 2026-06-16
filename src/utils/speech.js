// Text-to-speech using the browser's built-in SpeechSynthesis API.
// No audio files are shipped: the browser renders Japanese on the fly.
import { toReadingText } from './furigana.js'

let cachedJaVoice = null

function pickJapaneseVoice() {
  if (cachedJaVoice) return cachedJaVoice
  const voices = window.speechSynthesis?.getVoices?.() || []
  cachedJaVoice =
    voices.find((v) => v.lang === 'ja-JP') ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('ja')) ||
    null
  return cachedJaVoice
}

// Voices load asynchronously in some browsers; refresh the cache when ready.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedJaVoice = null
    pickJapaneseVoice()
  }
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/**
 * Speak a furigana-markup string in Japanese.
 * @param {string} markup  e.g. "犬{いぬ}が好{す}きです。"
 * @param {object} [opts]  { rate, onEnd }
 * @returns {SpeechSynthesisUtterance|null}
 */
export function speak(markup, opts = {}) {
  if (!isSpeechSupported()) return null
  const synth = window.speechSynthesis
  synth.cancel() // stop anything already playing
  const utterance = new SpeechSynthesisUtterance(toReadingText(markup))
  utterance.lang = 'ja-JP'
  utterance.rate = opts.rate ?? 0.9
  const voice = pickJapaneseVoice()
  if (voice) utterance.voice = voice
  if (opts.onEnd) utterance.onend = opts.onEnd
  if (opts.onError) utterance.onerror = opts.onError
  synth.speak(utterance)
  return utterance
}

export function cancelSpeech() {
  if (isSpeechSupported()) window.speechSynthesis.cancel()
}

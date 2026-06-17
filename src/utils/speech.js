// Text-to-speech using the browser's built-in SpeechSynthesis API.
// No audio files are shipped: the browser renders Japanese on the fly.
//
// A line is split into small pieces and spoken one after another so that we can
//   * speak at a calm, natural pace (a single global rate for every feature),
//   * switch to a second (ideally female) voice for a different speaker in a
//     dialogue — and if no second voice exists, fall back to a clear pause,
//   * pause at punctuation (、 short, 。！？ longer) and between speakers.
import { toReadingText } from './furigana.js'

// One global playback speed used by every feature that plays audio.
// 1.0 is the synth's "normal"; lower is slower/clearer.
export const DEFAULT_RATE = 0.8

// Pause lengths (ms).
const COMMA_PAUSE = 250 // after 、，
const SENT_PAUSE = 450 // after 。！？
const SPEAKER_PAUSE = 700 // between two different speakers

// --- Voice selection ------------------------------------------------------
let cachedVoices = null

const FEMALE_HINTS = ['kyoko', 'female', '女', 'nanami', 'haruka', 'sayaka', 'ayumi', 'mizuki', 'o-ren']
const MALE_HINTS = ['otoya', 'hattori', 'male', '男', 'keita', 'ichiro', 'daichi', 'naoki']

function nameMatches(voice, hints) {
  const n = (voice.name || '').toLowerCase()
  return hints.some((h) => n.includes(h))
}

// Returns an ordered list of Japanese voices: index 0 is the primary speaker,
// index 1 (if available) is a contrasting voice used for the second speaker.
// We try to make the pair male + female so a different speaker clearly differs.
function pickJapaneseVoices() {
  if (cachedVoices) return cachedVoices
  const all = window.speechSynthesis?.getVoices?.() || []
  const ja = all.filter((v) => v.lang && v.lang.toLowerCase().startsWith('ja'))
  if (ja.length === 0) return (cachedVoices = [])

  const female = ja.find((v) => nameMatches(v, FEMALE_HINTS))
  const male = ja.find((v) => nameMatches(v, MALE_HINTS))

  let ordered
  if (male && female) {
    ordered = [male, female]
  } else {
    // De-duplicate by name and keep up to two distinct voices.
    const seen = new Set()
    ordered = ja.filter((v) => (seen.has(v.name) ? false : seen.add(v.name))).slice(0, 2)
  }
  cachedVoices = ordered
  return ordered
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = null
    pickJapaneseVoices()
  }
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// --- Splitting into pieces ------------------------------------------------
function splitByPunctuation(text) {
  const out = []
  let buf = ''
  for (const ch of text) {
    buf += ch
    if ('。！？!?'.includes(ch)) {
      out.push({ text: buf, pause: SENT_PAUSE })
      buf = ''
    } else if ('、，,…'.includes(ch)) {
      out.push({ text: buf, pause: COMMA_PAUSE })
      buf = ''
    }
  }
  if (buf.trim()) out.push({ text: buf, pause: 0 })
  return out
}

// Build the ordered pieces with voice index + trailing pause for one line.
function buildPieces(text, voiceCount) {
  // Split into spans: quoted speaker turns (「…」) and narration in between.
  const spans = []
  const re = /「([^」]*)」/g
  let last = 0
  let m
  let quoteIdx = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) spans.push({ text: text.slice(last, m.index), voiceIdx: 0 })
    // Alternate between the (up to two) available voices for each quote.
    const voiceIdx = voiceCount > 1 ? quoteIdx % 2 : 0
    spans.push({ text: m[1], voiceIdx })
    quoteIdx += 1
    last = re.lastIndex
  }
  if (last < text.length) spans.push({ text: text.slice(last), voiceIdx: 0 })
  if (spans.length === 0) spans.push({ text, voiceIdx: 0 })

  const pieces = []
  spans.forEach((span, si) => {
    const sub = splitByPunctuation(span.text)
    sub.forEach((s, i) => {
      if (!s.text.trim()) return
      const isLastOfSpan = i === sub.length - 1
      let pause = s.pause
      // Add a clear gap when the next span is a different speaker.
      if (isLastOfSpan && si < spans.length - 1) {
        pause = Math.max(pause, SPEAKER_PAUSE)
      }
      pieces.push({ text: s.text, voiceIdx: span.voiceIdx, pause })
    })
  })
  return pieces
}

// --- Playback -------------------------------------------------------------
let playToken = 0 // bumped to invalidate an in-flight sequence
let pendingTimer = null
let activeFinish = null // the current sequence's completion callback

// Run the current sequence's finish callback exactly once. Called both on
// natural completion and when a sequence is superseded/cancelled, so callers
// (e.g. a SpeakButton's spinner) can always reset their state.
function finishActive() {
  const fn = activeFinish
  activeFinish = null
  if (fn) fn()
}

function stopChain() {
  playToken += 1
  if (pendingTimer) {
    clearTimeout(pendingTimer)
    pendingTimer = null
  }
}

/**
 * Speak a furigana-markup string in Japanese.
 * @param {string} markup  e.g. "犬{いぬ}が好{す}きです。"
 * @param {object} [opts]  { rate, onEnd, onError, voiceIndex }
 *   voiceIndex forces a speaker voice for the whole line (e.g. dialogue turns);
 *   otherwise quotes 「…」 alternate voices automatically.
 */
export function speak(markup, opts = {}) {
  if (!isSpeechSupported()) return null
  const synth = window.speechSynthesis
  cancelSpeech() // stop anything playing and invalidate previous sequence
  const token = playToken

  const rate = opts.rate ?? DEFAULT_RATE
  const voices = pickJapaneseVoices()
  const pieces = buildPieces(toReadingText(markup), voices.length)

  if (pieces.length === 0) {
    opts.onEnd?.()
    return null
  }

  activeFinish = opts.onEnd || null

  let idx = 0
  const playNext = () => {
    if (token !== playToken) return // a newer call (or cancel) superseded us
    if (idx >= pieces.length) {
      finishActive()
      return
    }
    const piece = pieces[idx]
    idx += 1
    const u = new SpeechSynthesisUtterance(piece.text)
    u.lang = 'ja-JP'
    u.rate = rate
    const vi = opts.voiceIndex != null ? opts.voiceIndex : piece.voiceIdx
    const voice = voices.length ? voices[vi % voices.length] : null
    if (voice) u.voice = voice
    u.onend = () => {
      if (token !== playToken) return
      if (piece.pause > 0) {
        pendingTimer = setTimeout(playNext, piece.pause)
      } else {
        playNext()
      }
    }
    u.onerror = () => {
      if (token !== playToken) return
      playNext() // skip the failed piece and continue
    }
    synth.speak(u)
  }

  playNext()
  return true
}

export function cancelSpeech() {
  stopChain()
  if (isSpeechSupported()) window.speechSynthesis.cancel()
  finishActive() // let the superseded/stopped caller reset its UI
}

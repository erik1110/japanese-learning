// Furigana markup helpers.
//
// Throughout the data files Japanese text is written with an inline markup:
//
//     私{わたし}は学生{がくせい}です。
//
// A run of kanji is immediately followed by its reading in braces. Everything
// else (kana, punctuation, spaces) is written as-is. This keeps the JSON
// authorable while still giving us per-word readings for <ruby> rendering.

// Matches a run of kanji (CJK ideographs + iteration marks) followed by {reading}.
const FURIGANA_RE = /([一-龯々〆ヶ々]+)\{([^}]+)\}/g

/**
 * Parse a furigana-markup string into an array of tokens.
 * Each token is either { text } (plain) or { text, reading } (kanji + reading).
 */
export function parseFurigana(input) {
  if (!input) return []
  const tokens = []
  let lastIndex = 0
  let match
  FURIGANA_RE.lastIndex = 0
  while ((match = FURIGANA_RE.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: input.slice(lastIndex, match.index) })
    }
    tokens.push({ text: match[1], reading: match[2] })
    lastIndex = FURIGANA_RE.lastIndex
  }
  if (lastIndex < input.length) {
    tokens.push({ text: input.slice(lastIndex) })
  }
  return tokens
}

/** Plain Japanese text with kanji kept and the {reading} markup removed. */
export function toPlainText(input) {
  if (!input) return ''
  return input.replace(FURIGANA_RE, '$1')
}

/** Pure reading: each kanji run replaced by its kana reading. Best for TTS. */
export function toReadingText(input) {
  if (!input) return ''
  return input.replace(FURIGANA_RE, '$2')
}

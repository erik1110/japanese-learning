import { parseFurigana } from '../utils/furigana.js'

/**
 * Renders furigana-markup text. Kanji runs are wrapped in <ruby> with their
 * reading shown above as <rt>, so every kanji always shows its hiragana.
 */
export default function Furigana({ text, className }) {
  const tokens = parseFurigana(text)
  return (
    <span className={className}>
      {tokens.map((tok, i) =>
        tok.reading ? (
          <ruby key={i}>
            {tok.text}
            <rt>{tok.reading}</rt>
          </ruby>
        ) : (
          <span key={i}>{tok.text}</span>
        ),
      )}
    </span>
  )
}

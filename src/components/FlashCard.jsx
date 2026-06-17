import { useState, useEffect } from 'react'
import Furigana from './Furigana.jsx'
import SpeakButton from './SpeakButton.jsx'
import { useHideKanji } from '../utils/useHideKanji.js'

/**
 * A single flippable vocabulary card.
 * Front: the word (with furigana) + a pronunciation button. When "hide kanji"
 *        is on, only the kana reading is shown so the kanji can't be read off.
 * Back: Chinese meaning, a Japanese example sentence (+ its audio) and a
 *       Chinese translation of the example. When kanji is hidden on the front,
 *       the back reveals the actual word so it can be checked.
 */
export default function FlashCard({ word }) {
  const [flipped, setFlipped] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [hideKanji] = useHideKanji()

  // Reset when the card changes (e.g. in review mode).
  useEffect(() => {
    setFlipped(false)
    setShowExample(false)
  }, [word])

  return (
    <div
      className={`flashcard ${flipped ? 'flipped' : ''}`}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className="flashcard-inner">
        {/* Front */}
        <div className="flashcard-face flashcard-front">
          {hideKanji ? (
            <div className="card-word card-word-kana">{word.kana}</div>
          ) : (
            <>
              <div className="card-word">
                <Furigana text={word.word} />
              </div>
              <div className="card-kana">{word.kana}</div>
            </>
          )}
          <SpeakButton text={word.word} label="發音" />
          <div className="flip-hint">
            {hideKanji ? '點擊卡片看漢字與中文意思' : '點擊卡片看中文意思'}
          </div>
        </div>

        {/* Back */}
        <div className="flashcard-face flashcard-back">
          {hideKanji && (
            <div className="card-reveal-word">
              <Furigana text={word.word} />
            </div>
          )}
          <div className="card-meaning-label">中文意思</div>
          <div className="card-meaning">{word.meaning_zh}</div>

          {word.example_jp && (
            <div className="card-example">
              <div className="example-row">
                <button
                  type="button"
                  className="example-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowExample((s) => !s)
                  }}
                >
                  {showExample ? '隱藏例句' : '例句'}
                </button>
                <SpeakButton text={word.example_jp} label="" />
              </div>
              {showExample && (
                <div className="example-body">
                  <div className="example-jp">
                    <Furigana text={word.example_jp} />
                  </div>
                  <div className="example-zh">{word.example_zh}</div>
                </div>
              )}
            </div>
          )}
          <div className="flip-hint">點擊卡片翻回正面</div>
        </div>
      </div>
    </div>
  )
}

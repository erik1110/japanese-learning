import { useState } from 'react'
import { LEVELS, allWordsForLevel } from '../data/index.js'
import FlashCard from '../components/FlashCard.jsx'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Review() {
  const [levelId, setLevelId] = useState(null)
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [known, setKnown] = useState(0)
  const [unknown, setUnknown] = useState(0)
  const [done, setDone] = useState(false)

  function start(id) {
    setLevelId(id)
    setDeck(shuffle(allWordsForLevel(id)))
    setIndex(0)
    setKnown(0)
    setUnknown(0)
    setDone(false)
  }

  function mark(isKnown) {
    if (isKnown) setKnown((n) => n + 1)
    else setUnknown((n) => n + 1)
    if (index + 1 >= deck.length) setDone(true)
    else setIndex((i) => i + 1)
  }

  if (!levelId) {
    return (
      <div className="view">
        <h1 className="view-title">隨機背誦</h1>
        <p className="view-sub">隨機抽出單字卡，翻面背誦並自我評量</p>
        <div className="level-grid">
          {LEVELS.map((lvl) => (
            <button key={lvl.level} className="level-card" onClick={() => start(lvl.level)}>
              <span className="level-badge">{lvl.level}</span>
              <span className="level-name">{lvl.name_zh}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="view quiz-result">
        <h1 className="view-title">背誦完成 🎉</h1>
        <div className="review-summary">
          <div className="rs-item rs-known">
            <span className="rs-num">{known}</span>
            <span>記得了</span>
          </div>
          <div className="rs-item rs-unknown">
            <span className="rs-num">{unknown}</span>
            <span>還沒記得</span>
          </div>
        </div>
        <div className="quiz-actions">
          <button className="btn-primary" onClick={() => start(levelId)}>
            再來一輪
          </button>
          <button className="btn-ghost" onClick={() => setLevelId(null)}>
            換等級
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="view review">
      <div className="quiz-top">
        <button className="back-link" onClick={() => setLevelId(null)}>
          ← 換等級
        </button>
        <div className="quiz-progress">
          {index + 1} / {deck.length}
        </div>
      </div>

      <div className="review-card-wrap">
        <FlashCard word={deck[index]} />
      </div>

      <p className="review-hint">先回想中文意思，再點卡片確認</p>
      <div className="review-actions">
        <button className="btn-unknown" onClick={() => mark(false)}>
          還沒記得
        </button>
        <button className="btn-known" onClick={() => mark(true)}>
          記得了 ✓
        </button>
      </div>
    </div>
  )
}

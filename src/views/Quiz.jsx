import { useState } from 'react'
import { LEVELS, allWordsForLevel } from '../data/index.js'
import Furigana from '../components/Furigana.jsx'
import SpeakButton from '../components/SpeakButton.jsx'

const QUESTION_COUNT = 10

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a quiz: pick QUESTION_COUNT words, give each 1 correct + 3 distractor
// Chinese meanings drawn from the same level.
function buildQuiz(words) {
  const pool = words.filter((w) => w.meaning_zh)
  const picked = shuffle(pool).slice(0, Math.min(QUESTION_COUNT, pool.length))
  return picked.map((word) => {
    const distractors = shuffle(
      pool.filter((w) => w.meaning_zh !== word.meaning_zh),
    )
      .slice(0, 3)
      .map((w) => w.meaning_zh)
    const options = shuffle([word.meaning_zh, ...distractors])
    return { word, options, answer: word.meaning_zh }
  })
}

export default function Quiz() {
  const [levelId, setLevelId] = useState(null)
  const [quiz, setQuiz] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  function start(id) {
    const words = allWordsForLevel(id)
    setLevelId(id)
    setQuiz(buildQuiz(words))
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  function restart() {
    start(levelId)
  }

  function choose(option) {
    if (selected !== null) return // already answered
    setSelected(option)
    if (option === quiz[current].answer) setScore((s) => s + 1)
  }

  function next() {
    if (current + 1 >= quiz.length) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  // Level picker
  if (!levelId) {
    return (
      <div className="view">
        <h1 className="view-title">牛刀小試</h1>
        <p className="view-sub">隨機出題，從四個選項中選出正確的中文意思</p>
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

  // Results
  if (finished) {
    const pct = Math.round((score / quiz.length) * 100)
    return (
      <div className="view quiz-result">
        <h1 className="view-title">測驗結果</h1>
        <div className="result-score">
          {score} / {quiz.length}
        </div>
        <div className="result-pct">{pct} 分</div>
        <p className="result-msg">
          {pct === 100 ? '完美！🎉' : pct >= 60 ? '不錯，繼續加油！💪' : '多多練習就會進步！📚'}
        </p>
        <div className="quiz-actions">
          <button className="btn-primary" onClick={restart}>
            再玩一次
          </button>
          <button className="btn-ghost" onClick={() => setLevelId(null)}>
            換等級
          </button>
        </div>
      </div>
    )
  }

  const q = quiz[current]

  return (
    <div className="view quiz">
      <div className="quiz-top">
        <button className="back-link" onClick={() => setLevelId(null)}>
          ← 換等級
        </button>
        <div className="quiz-progress">
          第 {current + 1} / {quiz.length} 題 · 得分 {score}
        </div>
      </div>

      <div className="quiz-question">
        <div className="quiz-word">
          <Furigana text={q.word.word} />
        </div>
        <SpeakButton text={q.word.word} label="發音" />
        <p className="quiz-prompt">這個單字的中文意思是？</p>
      </div>

      <div className="quiz-options">
        {q.options.map((opt) => {
          let cls = 'quiz-option'
          if (selected !== null) {
            if (opt === q.answer) cls += ' correct'
            else if (opt === selected) cls += ' wrong'
          }
          return (
            <button key={opt} className={cls} onClick={() => choose(opt)} disabled={selected !== null}>
              {opt}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div className="quiz-feedback">
          <p className={selected === q.answer ? 'fb-correct' : 'fb-wrong'}>
            {selected === q.answer ? '✅ 答對了！' : `❌ 正確答案：${q.answer}`}
          </p>
          {q.word.example_jp && (
            <div className="quiz-example">
              <Furigana text={q.word.example_jp} />
              <div className="example-zh">{q.word.example_zh}</div>
            </div>
          )}
          <button className="btn-primary" onClick={next}>
            {current + 1 >= quiz.length ? '看結果' : '下一題'}
          </button>
        </div>
      )}
    </div>
  )
}

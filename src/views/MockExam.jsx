import { useState, useEffect, useRef } from 'react'
import { EXAM_LEVELS } from '../data/index.js'
import Furigana from '../components/Furigana.jsx'
import SpeakButton from '../components/SpeakButton.jsx'

const LEVEL_COLORS = {
  N5: '#22c55e',
  N4: '#3b82f6',
  N3: '#a855f7',
  N2: '#f59e0b',
  N1: '#ef4444',
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Turn a raw question into a runnable item with shuffled options.
function makeOptions(q) {
  const opts = shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })))
  return { opts, answerIndex: opts.findIndex((o) => o.correct) }
}

// Draw a random set of items for one section each time it's started.
function drawSection(section) {
  let items = []
  if (section.kind === 'language') {
    items = shuffle(section.questions)
      .slice(0, section.draw)
      .map((q) => ({
        kind: 'language',
        typeLabel: q.type_zh,
        prompt: q.prompt_zh,
        stem: q.stem,
        explanation: q.explanation_zh,
        ...makeOptions(q),
      }))
  } else if (section.kind === 'reading') {
    const passages = shuffle(section.passages).slice(0, section.draw_passages)
    passages.forEach((p) => {
      p.questions.forEach((q) => {
        items.push({
          kind: 'reading',
          typeLabel: '読解',
          passage: p.passage_jp,
          passageTitle: p.title_zh,
          stem: q.stem,
          explanation: q.explanation_zh,
          ...makeOptions(q),
        })
      })
    })
  } else if (section.kind === 'listening') {
    items = shuffle(section.questions)
      .slice(0, section.draw)
      .map((q) => ({
        kind: 'listening',
        typeLabel: '聴解',
        script: q.script_jp,
        stem: q.question_jp,
        explanation: q.explanation_zh,
        ...makeOptions(q),
      }))
  }
  const timeLimit = items.length * section.time_per_q_sec
  return { items, timeLimit }
}

export default function MockExam() {
  const [level, setLevel] = useState(null)
  const [run, setRun] = useState(null) // { sectionName, items, timeLimit }
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([])
  const [remaining, setRemaining] = useState(0)
  const [finished, setFinished] = useState(false)
  const timedOut = useRef(false)

  useEffect(() => {
    if (!run || finished) return
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [run, finished])

  useEffect(() => {
    if (run && !finished && remaining === 0) {
      timedOut.current = true
      setFinished(true)
    }
  }, [remaining, run, finished])

  function startSection(section) {
    const { items, timeLimit } = drawSection(section)
    timedOut.current = false
    setRun({ sectionName: section.name_zh, sectionId: section.id, items, timeLimit })
    setAnswers(new Array(items.length).fill(null))
    setCurrent(0)
    setRemaining(timeLimit)
    setFinished(false)
  }

  function choose(i) {
    setAnswers((prev) => {
      const next = [...prev]
      next[current] = i
      return next
    })
  }

  function backToSections() {
    setRun(null)
    setFinished(false)
  }

  // ---- Level picker --------------------------------------------------------
  if (!level) {
    return (
      <div className="view">
        <h1 className="view-title">模擬試題</h1>
        <p className="view-sub">仿 JLPT 題型的原創試題，分區應考、每次隨機抽題、限時自動交卷</p>
        <div className="level-grid">
          {EXAM_LEVELS.map((lvl) => (
            <button
              key={lvl.level}
              className="level-card"
              style={{ '--accent': LEVEL_COLORS[lvl.level] }}
              onClick={() => setLevel(lvl)}
            >
              <span className="level-badge">{lvl.level}</span>
              <span className="level-name">{lvl.name_zh}</span>
              <span className="level-count">言語知識・読解・聴解</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ---- Section picker ------------------------------------------------------
  if (!run) {
    return (
      <div className="view">
        <button className="back-link" onClick={() => setLevel(null)}>
          ← 返回等級
        </button>
        <h1 className="view-title">
          選擇科目
          <span className="view-title-tag" style={{ background: LEVEL_COLORS[level.level] }}>
            {level.level}
          </span>
        </h1>
        <p className="view-sub">每次隨機抽題作答，限時內完成、時間到自動交卷</p>
        <div className="category-grid">
          {level.sections.map((s) => {
            const count =
              s.kind === 'reading'
                ? `${s.draw_passages} 篇文章`
                : `${s.draw} 題`
            return (
              <button key={s.id} className="category-card" onClick={() => startSection(s)}>
                <span className="category-icon">{s.icon}</span>
                <span className="category-name">{s.name_zh}</span>
                <span className="category-count">每次隨機 {count}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ---- Results -------------------------------------------------------------
  if (finished) {
    const total = run.items.length
    const score = run.items.reduce((n, it, i) => (answers[i] === it.answerIndex ? n + 1 : n), 0)
    const pct = total ? Math.round((score / total) * 100) : 0
    const used = run.timeLimit - remaining
    return (
      <div className="view">
        <h1 className="view-title">
          {run.sectionName}　結果
          <span className="view-title-tag" style={{ background: LEVEL_COLORS[level.level] }}>
            {level.level}
          </span>
        </h1>

        {timedOut.current && <p className="exam-timeout">⏰ 時間到，已自動交卷</p>}

        <div className="exam-result-summary">
          <div className="result-score">
            {score} / {total}
          </div>
          <div className="result-pct">{pct} 分</div>
          <div className="exam-used-time">作答時間 {fmtTime(used)}</div>
          <p className="result-msg">
            {pct === 100 ? '滿分，太厲害了！🎉' : pct >= 60 ? '及格，繼續加油！💪' : '多複習再挑戰一次！📚'}
          </p>
        </div>

        <div className="exam-review">
          {run.items.map((it, i) => {
            const picked = answers[i]
            const correct = picked === it.answerIndex
            return (
              <div key={i} className={`exam-review-card ${correct ? 'ok' : 'ng'}`}>
                <div className="exam-review-head">
                  <span className="exam-qnum">第 {i + 1} 題</span>
                  <span className="exam-type-tag">{it.typeLabel}</span>
                  <span className={`exam-mark ${correct ? 'ok' : 'ng'}`}>
                    {picked === null ? '未作答' : correct ? '✅ 答對' : '❌ 答錯'}
                  </span>
                </div>
                {it.kind === 'listening' && (
                  <div className="exam-script">
                    <span className="exam-script-label">聽力原文</span>
                    <Furigana text={it.script} />
                  </div>
                )}
                {it.kind === 'reading' && (
                  <div className="exam-passage exam-passage-review">
                    <Furigana text={it.passage} />
                  </div>
                )}
                <div className="exam-stem">
                  <Furigana text={it.stem} />
                </div>
                <div className="exam-review-options">
                  {it.opts.map((o, oi) => {
                    let cls = 'exam-review-opt'
                    if (oi === it.answerIndex) cls += ' correct'
                    else if (oi === picked) cls += ' wrong'
                    return (
                      <div key={oi} className={cls}>
                        <Furigana text={o.text} />
                      </div>
                    )
                  })}
                </div>
                <p className="exam-explain">{it.explanation}</p>
              </div>
            )
          })}
        </div>

        <div className="quiz-actions">
          <button className="btn-primary" onClick={() => startSection(level.sections.find((s) => s.id === run.sectionId))}>
            再考一次
          </button>
          <button className="btn-ghost" onClick={backToSections}>
            換科目
          </button>
        </div>
      </div>
    )
  }

  // ---- In progress ---------------------------------------------------------
  const total = run.items.length
  const it = run.items[current]
  const picked = answers[current]
  const answeredCount = answers.filter((a) => a !== null).length
  const low = remaining <= 60

  return (
    <div className="view exam">
      <div className="exam-top">
        <button className="back-link" onClick={backToSections}>
          ← 離開測驗
        </button>
        <div className={`exam-timer ${low ? 'low' : ''}`}>⏱ {fmtTime(remaining)}</div>
      </div>

      <div className="exam-progress-row">
        <span>
          {run.sectionName}　第 {current + 1} / {total} 題
        </span>
        <span className="exam-answered">已作答 {answeredCount} / {total}</span>
      </div>
      <div className="exam-progress-bar">
        <div className="exam-progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {it.kind === 'listening' && (
        <div className="exam-listen">
          <div className="exam-listen-icon">🎧</div>
          <SpeakButton text={it.script} label="播放音檔" />
          <p className="exam-listen-hint">仔細聆聽後作答，可重複播放（聽力原文作答後才會顯示）</p>
        </div>
      )}

      {it.kind === 'reading' && (
        <div className="exam-passage">
          {it.passageTitle && <div className="exam-passage-title">{it.passageTitle}</div>}
          <Furigana text={it.passage} />
        </div>
      )}

      <div className="exam-question">
        <div className="exam-type-tag">{it.typeLabel}</div>
        {it.prompt && <p className="exam-prompt">{it.prompt}</p>}
        <div className="exam-stem">
          <Furigana text={it.stem} />
        </div>
      </div>

      <div className="exam-options">
        {it.opts.map((o, oi) => (
          <button
            key={oi}
            className={`exam-option ${picked === oi ? 'selected' : ''}`}
            onClick={() => choose(oi)}
          >
            <span className="exam-option-no">{oi + 1}</span>
            <Furigana text={o.text} />
          </button>
        ))}
      </div>

      <div className="exam-nav">
        <button className="btn-ghost" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>
          ← 上一題
        </button>
        {current + 1 < total ? (
          <button className="btn-primary" onClick={() => setCurrent((c) => c + 1)}>
            下一題 →
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setFinished(true)}>
            交卷
          </button>
        )}
      </div>
    </div>
  )
}

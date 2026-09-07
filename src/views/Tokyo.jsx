import { useState, useMemo, useRef, useEffect } from 'react'
import { TOKYO_CHAPTERS, TOKYO_NOTE, getTokyoChapter } from '../data/index.js'
import Furigana from '../components/Furigana.jsx'
import SpeakButton from '../components/SpeakButton.jsx'

// "東京生活篇" — a light choice-driven game layer over situational Japanese.
// Each chapter is a scene (convenience store, train, izakaya, ...) made of
// steps: either a `choice` step (pick the most natural thing to say/do) or a
// `quiz` step (vocabulary check). Nothing is ever "failed" — picking a poor
// option still explains why it lands badly, which is the actual lesson.

// Backdrop per chapter, keyed by its `scene` field. Kept as CSS gradients +
// an emoji rather than artwork so the unit stays self-contained.
const SCENES = {
  store: { emoji: '🏪', sky: 'linear-gradient(160deg,#fef3c7,#fde68a)' },
  station: { emoji: '🚉', sky: 'linear-gradient(160deg,#dbeafe,#bfdbfe)' },
  street: { emoji: '🏙️', sky: 'linear-gradient(160deg,#e0f2fe,#bae6fd)' },
  library: { emoji: '🏛️', sky: 'linear-gradient(160deg,#ede9fe,#ddd6fe)' },
  ramen: { emoji: '🍜', sky: 'linear-gradient(160deg,#ffedd5,#fed7aa)' },
  akiba: { emoji: '🎌', sky: 'linear-gradient(160deg,#fce7f3,#fbcfe8)' },
  cinema: { emoji: '🎦', sky: 'linear-gradient(160deg,#e2e8f0,#cbd5e1)' },
  park: { emoji: '🌸', sky: 'linear-gradient(160deg,#fce7f3,#fbcfe8)' },
  izakaya: { emoji: '🏮', sky: 'linear-gradient(160deg,#fee2e2,#fecaca)' },
  night: { emoji: '🌃', sky: 'linear-gradient(160deg,#c7d2fe,#a5b4fc)' },
  room: { emoji: '🛏️', sky: 'linear-gradient(160deg,#e0e7ff,#c7d2fe)' },
  clinic: { emoji: '🏥', sky: 'linear-gradient(160deg,#dcfce7,#bbf7d0)' },
  office: { emoji: '🏢', sky: 'linear-gradient(160deg,#f1f5f9,#e2e8f0)' },
  salon: { emoji: '💈', sky: 'linear-gradient(160deg,#ffe4e6,#fecdd3)' },
}

// Reward table. Getting it right first try is worth the most, but every step
// pays something — the point is to keep reading, not to farm points.
const EXP_BEST = 20
const EXP_MISS = 5
const COIN_BEST = 50
const COIN_MISS = 10

function sceneOf(chapter) {
  return SCENES[chapter.scene] || SCENES.street
}

export default function Tokyo() {
  const [chapterId, setChapterId] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  // Per-step record: { firstPick, picks: number[], scored: boolean }
  const [progress, setProgress] = useState({})
  const [exp, setExp] = useState(0)
  const [coins, setCoins] = useState(0)
  const [done, setDone] = useState(false)
  const stageRef = useRef(null)

  // Each step is a fresh screen, so bring its top back into view — otherwise
  // advancing from a long step drops the reader into the middle of the next one.
  useEffect(() => {
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [stepIndex, chapterId])

  function openChapter(id) {
    setChapterId(id)
    setStepIndex(0)
    setProgress({})
    setExp(0)
    setCoins(0)
    setDone(false)
  }

  function leaveChapter() {
    setChapterId(null)
    setDone(false)
  }

  if (!chapterId) {
    return <ChapterPicker onPick={openChapter} />
  }

  const chapter = getTokyoChapter(chapterId)
  const step = chapter.steps[stepIndex]
  const record = progress[stepIndex]
  const answered = !!record

  // Record a pick. Only the first pick on a step moves the score; later picks
  // just reveal the other options' explanations.
  function pick(optionIndex, isGood) {
    setProgress((prev) => {
      const cur = prev[stepIndex]
      if (cur) {
        if (cur.picks.includes(optionIndex)) return prev
        return {
          ...prev,
          [stepIndex]: { ...cur, picks: [...cur.picks, optionIndex] },
        }
      }
      return {
        ...prev,
        [stepIndex]: { firstPick: optionIndex, firstGood: isGood, picks: [optionIndex] },
      }
    })
    if (!record) {
      setExp((e) => e + (isGood ? EXP_BEST : EXP_MISS))
      setCoins((c) => c + (isGood ? COIN_BEST : COIN_MISS))
    }
  }

  function next() {
    if (stepIndex + 1 >= chapter.steps.length) setDone(true)
    else setStepIndex((i) => i + 1)
  }

  if (done) {
    return (
      <ChapterResult
        chapter={chapter}
        progress={progress}
        exp={exp}
        coins={coins}
        onRetry={() => openChapter(chapter.id)}
        onExit={leaveChapter}
      />
    )
  }

  const scene = sceneOf(chapter)
  const cleared = chapter.steps.filter((_, i) => progress[i]).length
  const pct = Math.round((cleared / chapter.steps.length) * 100)

  return (
    <div className="view tokyo">
      <button className="back-link" onClick={leaveChapter}>
        ← 返回章節列表
      </button>

      {/* ---------- HUD ---------- */}
      <div className="tk-hud">
        <div className="tk-hud-left">
          <div className="tk-avatar">{chapter.icon}</div>
          <div className="tk-hud-id">
            <div className="tk-hud-title">{chapter.title_zh}</div>
            <div className="tk-xpbar">
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="tk-hud-pct">{pct}%</div>
        </div>
        <div className="tk-hud-goal">
          <span className="tk-hud-label">任務目標</span>
          <span className="tk-hud-goal-text">{chapter.goal_zh}</span>
          <span className="tk-hud-count">
            ({cleared}/{chapter.steps.length})
          </span>
        </div>
        <div className="tk-hud-stats">
          <span className="tk-stat tk-stat-exp">⚡ {exp}</span>
          <span className="tk-stat tk-stat-coin">🪙 {coins}</span>
        </div>
      </div>

      <div className="tk-body">
        {/* ---------- Stage ---------- */}
        <div className="tk-stage" ref={stageRef}>
          <div className="tk-scene" style={{ background: scene.sky }}>
            <span className="tk-scene-emoji">{scene.emoji}</span>
            <span className="tk-scene-tag">
              {chapter.location_zh} · {chapter.time}
            </span>
          </div>

          <div className="tk-step-tag">
            <span className="tk-step-num">{stepIndex + 1}</span>
            {step.task_zh}
          </div>

          {step.type === 'choice' ? (
            <ChoiceStep
              step={step}
              record={record}
              onPick={pick}
              answered={answered}
            />
          ) : (
            <QuizStep step={step} record={record} onPick={pick} answered={answered} />
          )}

          {answered && (
            <button className="btn-primary tk-next" onClick={next}>
              {stepIndex + 1 >= chapter.steps.length ? '完成這一關 →' : '繼續 →'}
            </button>
          )}
        </div>

        {/* ---------- Sidebar ---------- */}
        <aside className="tk-side">
          <div className="tk-card">
            <div className="tk-card-title">任務列表</div>
            <ul className="tk-quests">
              {chapter.steps.map((s, i) => (
                <li
                  key={i}
                  className={`tk-quest ${progress[i] ? 'done' : ''} ${
                    i === stepIndex ? 'current' : ''
                  }`}
                >
                  <span className="tk-quest-mark">{progress[i] ? '✓' : '·'}</span>
                  <span className="tk-quest-name">{s.task_zh}</span>
                  <span className="tk-quest-kind">
                    {s.type === 'quiz' ? '單字' : '選擇'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="tk-card">
            <div className="tk-card-title">學習筆記</div>
            <p className="tk-card-hint">本關單字，可點 🔊 聽發音</p>
            <ul className="tk-vocab">
              {chapter.vocab.map((w, i) => (
                <li key={i} className="tk-vocab-row">
                  <span className="tk-vocab-jp">
                    <Furigana text={w.jp} />
                  </span>
                  <span className="tk-vocab-zh">{w.zh}</span>
                  <span className="tk-vocab-lv">{w.level}</span>
                  <SpeakButton text={w.jp} label="" />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ---------- Chapter picker ----------
function ChapterPicker({ onPick }) {
  // Chapters fall into two arcs: a single day in Tokyo, and the life-admin
  // errands (city hall, hospital, rubbish …) that don't belong to any one day.
  const { groups, totals } = useMemo(() => {
    const byCategory = new Map()
    for (const c of TOKYO_CHAPTERS) {
      const key = c.category_zh || '其他'
      if (!byCategory.has(key)) byCategory.set(key, [])
      byCategory.get(key).push(c)
    }
    return {
      groups: [...byCategory.entries()],
      totals: {
        steps: TOKYO_CHAPTERS.reduce((n, c) => n + c.steps.length, 0),
        vocab: TOKYO_CHAPTERS.reduce((n, c) => n + c.vocab.length, 0),
      },
    }
  }, [])

  return (
    <div className="view">
      <h1 className="view-title">東京生活篇</h1>
      <p className="view-sub">
        {TOKYO_CHAPTERS.length} 個場景 · {totals.steps} 道情境選擇 · {totals.vocab} 個單字 ·
        每個選項都有解說
      </p>
      <p className="anime-note">💡 {TOKYO_NOTE}</p>

      {groups.map(([category, chapters]) => (
        <section key={category} className="tk-group">
          <h2 className="tk-group-title">
            {category}
            <span className="tk-group-count">{chapters.length} 關</span>
          </h2>
          <div className="tk-chapter-grid">
            {chapters.map((c) => {
              const scene = sceneOf(c)
              return (
                <button key={c.id} className="tk-chapter" onClick={() => onPick(c.id)}>
                  <span className="tk-chapter-scene" style={{ background: scene.sky }}>
                    <span className="tk-chapter-emoji">{c.icon}</span>
                    <span className="tk-chapter-time">{c.time}</span>
                  </span>
                  <span className="tk-chapter-body">
                    <span className="tk-chapter-name">{c.title_zh}</span>
                    <span className="tk-chapter-jp">
                      <Furigana text={c.title_jp} />
                    </span>
                    <span className="tk-chapter-meta">
                      <span className="song-tag song-tag-level">{c.level}</span>
                      <span className="tk-chapter-loc">{c.location_zh}</span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

// ---------- Choice step ----------
function ChoiceStep({ step, record, onPick, answered }) {
  const revealed = record?.picks ?? []

  return (
    <>
      <p className="tk-narration">{step.narration_zh}</p>

      {step.npc_jp && (
        <div className="tk-npc">
          <div className="tk-npc-avatar">{step.npc_avatar || '🧑'}</div>
          <div className="tk-bubble">
            <div className="tk-npc-name">{step.npc_name_zh}</div>
            <div className="tk-bubble-jp">
              <Furigana text={step.npc_jp} />
              <SpeakButton text={step.npc_jp} label="" />
            </div>
            <div className="tk-bubble-zh">{step.npc_zh}</div>
          </div>
        </div>
      )}

      <div className="tk-prompt">{step.prompt_zh}</div>

      <div className="tk-choices">
        {step.choices.map((c, i) => {
          const shown = revealed.includes(i)
          const state = !answered ? '' : c.best ? 'good' : shown ? 'bad' : 'dim'
          return (
            <div key={i} className="tk-choice-wrap">
              <button
                className={`tk-choice ${state} ${shown ? 'picked' : ''}`}
                onClick={() => onPick(i, !!c.best)}
              >
                <span className="tk-choice-jp">
                  <Furigana text={c.jp} />
                </span>
                <span className="tk-choice-zh">{c.zh}</span>
                {answered && c.best && <span className="tk-choice-flag">最自然</span>}
              </button>
              {shown && (
                <p className="tk-feedback">
                  <Furigana text={c.feedback_zh} />
                </p>
              )}
            </div>
          )
        })}
      </div>

      {answered && (
        <>
          <p className="tk-reveal-hint">
            點其他選項也能看到它們為什麼不自然（不影響分數）。
          </p>
          <div className="tk-note">
            <div className="tk-note-title">📝 {step.note_title_zh}</div>
            <p className="tk-note-body">
              <Furigana text={step.note_zh} />
            </p>
          </div>
        </>
      )}
    </>
  )
}

// ---------- Vocabulary quiz step ----------
function QuizStep({ step, record, onPick, answered }) {
  const picked = record?.firstPick

  return (
    <>
      <div className="tk-quiz-q">
        <Furigana text={step.q_zh} />
      </div>
      <div className="tk-choices">
        {step.options.map((opt, i) => {
          let state = ''
          if (answered) {
            if (i === step.answer) state = 'good'
            else if (i === picked) state = 'bad'
            else state = 'dim'
          }
          return (
            <button
              key={i}
              className={`tk-choice tk-choice-quiz ${state}`}
              disabled={answered}
              onClick={() => onPick(i, i === step.answer)}
            >
              <Furigana text={opt} />
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="tk-note">
          <div className="tk-note-title">
            {picked === step.answer ? '✅ 答對了！' : '❌ 再看一次：'}
          </div>
          <p className="tk-note-body">
            <Furigana text={step.explain_zh} />
          </p>
        </div>
      )}
    </>
  )
}

// ---------- Result ----------
function ChapterResult({ chapter, progress, exp, coins, onRetry, onExit }) {
  const total = chapter.steps.length
  const perfect = chapter.steps.filter((_, i) => progress[i]?.firstGood).length
  const rate = Math.round((perfect / total) * 100)
  const rank = rate === 100 ? 'S' : rate >= 80 ? 'A' : rate >= 60 ? 'B' : 'C'

  return (
    <div className="view">
      <button className="back-link" onClick={onExit}>
        ← 返回章節列表
      </button>
      <div className="tk-result">
        <div className="tk-result-rank">{rank}</div>
        <h1 className="tk-result-title">
          {chapter.icon} {chapter.title_zh} · 通關
        </h1>
        <div className="tk-result-stats">
          <div className="tk-result-stat">
            <span className="tk-result-num">
              {perfect}/{total}
            </span>
            <span className="tk-result-label">一次答對</span>
          </div>
          <div className="tk-result-stat">
            <span className="tk-result-num">⚡ {exp}</span>
            <span className="tk-result-label">獲得經驗</span>
          </div>
          <div className="tk-result-stat">
            <span className="tk-result-num">🪙 {coins}</span>
            <span className="tk-result-label">獲得金幣</span>
          </div>
        </div>
        <p className="tk-result-outro">{chapter.outro_zh}</p>

        <div className="tk-result-vocab">
          <div className="tk-card-title">本關單字複習（{chapter.vocab.length}）</div>
          <div className="song-vocab-grid">
            {chapter.vocab.map((w, i) => (
              <div key={i} className="song-vocab-card">
                <div className="song-vocab-head">
                  <span className="song-vocab-jp">
                    <Furigana text={w.jp} />
                  </span>
                  <SpeakButton text={w.jp} label="" />
                </div>
                <div className="song-vocab-zh">{w.zh}</div>
                <div className="song-vocab-meta">
                  <span className="song-tag song-tag-level">{w.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tk-result-actions">
          <button className="btn-primary" onClick={onRetry}>
            ↻ 再玩一次
          </button>
          <button className="btn-ghost" onClick={onExit}>
            返回章節列表
          </button>
        </div>
      </div>
    </div>
  )
}

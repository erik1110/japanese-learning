import { useState } from 'react'
import { GRAMMAR_LEVELS, getGrammarLevel } from '../data/index.js'
import Furigana from '../components/Furigana.jsx'
import SpeakButton from '../components/SpeakButton.jsx'

const LEVEL_COLORS = {
  N5: '#22c55e',
  N4: '#3b82f6',
  N3: '#a855f7',
  N2: '#f59e0b',
  N1: '#ef4444',
}

function GrammarCard({ p, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="grammar-card">
      <div className="grammar-head">
        <span className="grammar-num">{index + 1}</span>
        <span className="grammar-pattern">{p.pattern}</span>
      </div>
      <div className="grammar-title">{p.title_zh}</div>
      <p className="grammar-explain">{p.explanation_zh}</p>
      <div className="grammar-example">
        <div className="example-row">
          <div className="example-jp">
            <Furigana text={p.example_jp} />
          </div>
          <SpeakButton text={p.example_jp} label="" />
        </div>
        <div className="example-zh">{p.example_zh}</div>
      </div>
      {p.detail_zh && (
        <div className="grammar-detail-wrap">
          <button
            type="button"
            className="grammar-detail-btn"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? '收起詳細解說 ▲' : '詳細解說 ▼'}
          </button>
          {open && <p className="grammar-detail">{p.detail_zh}</p>}
        </div>
      )}
    </div>
  )
}

export default function Grammar() {
  const [levelId, setLevelId] = useState(null)

  if (!levelId) {
    return (
      <div className="view">
        <h1 className="view-title">文法攻略</h1>
        <p className="view-sub">依 N5–N1 等級整理重點文法，每條皆附例句與發音</p>
        <div className="level-grid">
          {GRAMMAR_LEVELS.map((lvl) => (
            <button
              key={lvl.level}
              className="level-card"
              style={{ '--accent': LEVEL_COLORS[lvl.level] }}
              onClick={() => setLevelId(lvl.level)}
            >
              <span className="level-badge">{lvl.level}</span>
              <span className="level-name">{lvl.name_zh}</span>
              <span className="level-count">{lvl.points.length} 個重點</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const level = getGrammarLevel(levelId)

  return (
    <div className="view">
      <button className="back-link" onClick={() => setLevelId(null)}>
        ← 返回等級
      </button>
      <h1 className="view-title">
        文法攻略
        <span className="view-title-tag" style={{ background: LEVEL_COLORS[levelId] }}>
          {level.level}
        </span>
      </h1>
      <p className="view-sub">{level.points.length} 個重點文法</p>

      <div className="grammar-list">
        {level.points.map((p, i) => (
          <GrammarCard key={i} p={p} index={i} />
        ))}
      </div>
    </div>
  )
}

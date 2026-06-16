import { useState } from 'react'
import { LEVELS, getLevel } from '../data/index.js'
import FlashCard from '../components/FlashCard.jsx'

const LEVEL_COLORS = {
  N5: '#22c55e',
  N4: '#3b82f6',
  N3: '#a855f7',
  N2: '#f59e0b',
  N1: '#ef4444',
}

export default function Flashcards() {
  const [levelId, setLevelId] = useState(null)
  const [categoryId, setCategoryId] = useState(null)

  // Step 1: choose a level
  if (!levelId) {
    return (
      <div className="view">
        <h1 className="view-title">選擇等級</h1>
        <p className="view-sub">JLPT 由 N5（入門）到 N1（最難）</p>
        <div className="level-grid">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.level}
              className="level-card"
              style={{ '--accent': LEVEL_COLORS[lvl.level] }}
              onClick={() => setLevelId(lvl.level)}
            >
              <span className="level-badge">{lvl.level}</span>
              <span className="level-name">{lvl.name_zh}</span>
              <span className="level-count">
                {lvl.categories.reduce((n, c) => n + c.words.length, 0)} 個單字
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const level = getLevel(levelId)

  // Step 2: choose a category
  if (!categoryId) {
    return (
      <div className="view">
        <button className="back-link" onClick={() => setLevelId(null)}>
          ← 返回等級
        </button>
        <h1 className="view-title">{level.level}　選擇類別</h1>
        <div className="category-grid">
          {level.categories.map((cat) => (
            <button
              key={cat.id}
              className="category-card"
              onClick={() => setCategoryId(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name_zh}</span>
              <span className="category-count">{cat.words.length} 個</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Step 3: show the cards
  const category = level.categories.find((c) => c.id === categoryId)
  return (
    <div className="view">
      <button className="back-link" onClick={() => setCategoryId(null)}>
        ← 返回類別
      </button>
      <h1 className="view-title">
        {category.icon} {category.name_zh}
        <span className="view-title-tag">{level.level}</span>
      </h1>
      <p className="view-sub">點擊卡片翻面看中文意思與例句</p>
      <div className="card-grid">
        {category.words.map((word, i) => (
          <FlashCard key={`${categoryId}-${i}`} word={word} />
        ))}
      </div>
    </div>
  )
}

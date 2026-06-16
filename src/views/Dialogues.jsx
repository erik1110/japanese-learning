import { useState, useRef, useEffect } from 'react'
import { DIALOGUE_CATEGORIES, getDialogueCategory } from '../data/index.js'
import Furigana from '../components/Furigana.jsx'
import SpeakButton from '../components/SpeakButton.jsx'
import { speak, cancelSpeech, isSpeechSupported } from '../utils/speech.js'

export default function Dialogues() {
  const [categoryId, setCategoryId] = useState(null)
  const [scenarioId, setScenarioId] = useState(null)

  // Index of the line currently being auto-played, or -1 when idle.
  const [playingIndex, setPlayingIndex] = useState(-1)
  const stopRef = useRef(false)

  // Stop playback whenever we leave a scenario or unmount.
  useEffect(() => {
    return () => {
      stopRef.current = true
      cancelSpeech()
    }
  }, [scenarioId])

  function stopAll() {
    stopRef.current = true
    cancelSpeech()
    setPlayingIndex(-1)
  }

  // Play the whole dialogue, one line after another.
  function playAll(lines) {
    stopRef.current = false
    const playFrom = (i) => {
      if (stopRef.current || i >= lines.length) {
        setPlayingIndex(-1)
        return
      }
      setPlayingIndex(i)
      speak(lines[i].jp, {
        rate: 0.95,
        onEnd: () => playFrom(i + 1),
        onError: () => playFrom(i + 1),
      })
    }
    playFrom(0)
  }

  // Category picker
  if (!categoryId) {
    return (
      <div className="view">
        <h1 className="view-title">情境對話</h1>
        <p className="view-sub">10 大類情境 · 每類 5 種場景 · 可整段或逐句播放</p>
        <div className="category-grid">
          {DIALOGUE_CATEGORIES.map((cat) => (
            <button key={cat.id} className="category-card" onClick={() => setCategoryId(cat.id)}>
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name_zh}</span>
              <span className="category-count">{cat.scenarios.length} 種場景</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const category = getDialogueCategory(categoryId)

  // Scenario picker
  if (!scenarioId) {
    return (
      <div className="view">
        <button className="back-link" onClick={() => setCategoryId(null)}>
          ← 返回類別
        </button>
        <h1 className="view-title">
          {category.icon} {category.name_zh}
        </h1>
        <div className="scenario-list">
          {category.scenarios.map((sc) => (
            <button
              key={sc.id}
              className="scenario-item"
              onClick={() => {
                setScenarioId(sc.id)
                setPlayingIndex(-1)
              }}
            >
              <div className="scenario-title-jp">
                <Furigana text={sc.title_jp} />
              </div>
              <div className="scenario-title-zh">{sc.title_zh}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const scenario = category.scenarios.find((s) => s.id === scenarioId)

  return (
    <div className="view dialogue">
      <button
        className="back-link"
        onClick={() => {
          stopAll()
          setScenarioId(null)
        }}
      >
        ← 返回場景
      </button>
      <h1 className="view-title">
        <Furigana text={scenario.title_jp} />
      </h1>
      <p className="view-sub">{scenario.title_zh}</p>

      <div className="dialogue-controls">
        {playingIndex === -1 ? (
          <button
            className="btn-primary"
            onClick={() => playAll(scenario.lines)}
            disabled={!isSpeechSupported()}
          >
            ▶ 播放整段
          </button>
        ) : (
          <button className="btn-ghost" onClick={stopAll}>
            ⏹ 停止
          </button>
        )}
      </div>

      <div className="dialogue-lines">
        {scenario.lines.map((line, i) => (
          <div
            key={i}
            className={`dialogue-line speaker-${(line.speaker || 'A').toLowerCase()} ${
              playingIndex === i ? 'playing' : ''
            }`}
          >
            <div className="speaker-badge">{line.speaker || 'A'}</div>
            <div className="line-body">
              <div className="line-jp">
                <Furigana text={line.jp} />
              </div>
              <div className="line-zh">{line.zh}</div>
            </div>
            <SpeakButton text={line.jp} label="" />
          </div>
        ))}
      </div>
    </div>
  )
}

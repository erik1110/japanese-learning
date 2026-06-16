import { useState, useRef, useEffect } from 'react'
import { ANIME_WORKS, ANIME_NOTE, getAnimeWork } from '../data/index.js'
import Furigana from '../components/Furigana.jsx'
import SpeakButton from '../components/SpeakButton.jsx'
import { speak, cancelSpeech, isSpeechSupported } from '../utils/speech.js'

// Browse anime practice lines: work → scenario → lines. Every line is an
// original sentence written to fit the work's tone (see ANIME_NOTE), not a
// real quote, so the disclaimer is always shown.
export default function Anime() {
  const [workId, setWorkId] = useState(null)
  const [scenarioIndex, setScenarioIndex] = useState(null)
  const [playingIndex, setPlayingIndex] = useState(-1)
  const stopRef = useRef(false)

  useEffect(() => {
    return () => {
      stopRef.current = true
      cancelSpeech()
    }
  }, [scenarioIndex])

  function stopAll() {
    stopRef.current = true
    cancelSpeech()
    setPlayingIndex(-1)
  }

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

  // Work picker
  if (!workId) {
    return (
      <div className="view">
        <h1 className="view-title">動漫日語</h1>
        <p className="view-sub">22 部作品 · 每部 3 種情境 · 配合作品語氣的原創練習句</p>
        <p className="anime-note">⚠️ {ANIME_NOTE}</p>
        <div className="category-grid">
          {ANIME_WORKS.map((w) => (
            <button key={w.id} className="category-card" onClick={() => setWorkId(w.id)}>
              <span className="category-icon">{w.icon}</span>
              <span className="category-name">{w.title_zh}</span>
              <span className="category-count">{w.scenarios.length} 種情境</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const work = getAnimeWork(workId)

  // Scenario picker
  if (scenarioIndex === null) {
    return (
      <div className="view">
        <button className="back-link" onClick={() => setWorkId(null)}>
          ← 返回作品
        </button>
        <h1 className="view-title">
          {work.icon} {work.title_zh}
        </h1>
        <p className="view-sub">
          <Furigana text={work.title_jp} />
        </p>
        <div className="scenario-list">
          {work.scenarios.map((sc, i) => (
            <button
              key={i}
              className="scenario-item"
              onClick={() => {
                setScenarioIndex(i)
                setPlayingIndex(-1)
              }}
            >
              <div className="scenario-title-zh">{sc.title_zh}</div>
              <div className="scenario-title-jp">{sc.lines.length} 句對話</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const scenario = work.scenarios[scenarioIndex]

  return (
    <div className="view dialogue">
      <button
        className="back-link"
        onClick={() => {
          stopAll()
          setScenarioIndex(null)
        }}
      >
        ← 返回情境
      </button>
      <h1 className="view-title">
        {work.icon} {scenario.title_zh}
      </h1>
      <p className="view-sub">{work.title_zh}</p>
      <p className="anime-note">⚠️ {ANIME_NOTE}</p>

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
          <div key={i} className={`dialogue-line ${playingIndex === i ? 'playing' : ''}`}>
            <div className="anime-speaker">
              <Furigana text={line.speaker_jp} />
              <span className="anime-speaker-zh">{line.speaker_zh}</span>
            </div>
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

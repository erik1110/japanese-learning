import { useState } from 'react'
import { SONGS, SONG_NOTE, getSong } from '../data/index.js'
import Furigana from '../components/Furigana.jsx'
import SpeakButton from '../components/SpeakButton.jsx'
import { toPlainText } from '../utils/furigana.js'

// Song analysis: pick a song → watch the official video → study the grammar and
// vocabulary drawn from it. Only short lyric excerpts are stored (see
// SONG_NOTE); the full lyrics are intentionally left to the official video.
const TABS = [
  { key: 'grammar', label: '文法分析' },
  { key: 'vocab', label: '單字分析' },
  { key: 'lines', label: '歌詞解析' },
  { key: 'quiz', label: '小測驗' },
]

export default function Songs() {
  const [songId, setSongId] = useState(null)
  const [tab, setTab] = useState('grammar')

  // Song picker
  if (!songId) {
    return (
      <div className="view">
        <h1 className="view-title">日文歌分析</h1>
        <p className="view-sub">
          {SONGS.length} 首歌曲 · 逐句文法解析 · 單字整理 · 附官方 MV
        </p>
        <p className="anime-note">⚠️ {SONG_NOTE}</p>
        <div className="category-grid">
          {SONGS.map((s) => (
            <button
              key={s.id}
              className="category-card"
              onClick={() => {
                setSongId(s.id)
                setTab('grammar')
              }}
            >
              <span className="category-icon">{s.icon}</span>
              <span className="category-name">
                <Furigana text={s.title_jp} />
              </span>
              <span className="category-count">
                {s.artist_jp} · {s.level}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const song = getSong(songId)

  return (
    <div className="view">
      <button className="back-link" onClick={() => setSongId(null)}>
        ← 返回歌曲列表
      </button>

      <h1 className="view-title">
        {song.icon} <Furigana text={song.title_jp} />
        <span className="view-title-tag">{song.level}</span>
      </h1>
      <p className="view-sub">
        {song.title_zh} · {song.artist_jp} · {song.year}
      </p>

      <SongVideo song={song} />
      <a
        className="song-yt-link"
        href={song.youtube_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        ▶ 在 YouTube 上觀看完整影片與歌詞
      </a>

      <div className="song-about">
        <div className="song-about-row">
          <span className="song-about-label">主題</span>
          <span>{song.theme_zh}</span>
        </div>
        <p className="song-summary">{song.summary_zh}</p>
        <p className="song-why">
          <strong>為什麼適合學日文？</strong>
          {song.why_zh}
        </p>
        <ul className="song-tips">
          {song.listening_tips_zh.map((t, i) => (
            <li key={i}>
              <Furigana text={t} />
            </li>
          ))}
        </ul>
      </div>

      <div className="song-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`song-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'grammar' && <GrammarTab song={song} />}
      {tab === 'vocab' && <VocabTab song={song} />}
      {tab === 'lines' && <LinesTab song={song} />}
      {tab === 'quiz' && <QuizTab song={song} />}
    </div>
  )
}

// Video card. These official MVs are embed-restricted by the rights holder —
// an <iframe> renders a dead "無法播放影片" player — so the thumbnail links out
// to YouTube instead of trying to play inline.
function SongVideo({ song }) {
  const title = toPlainText(song.title_jp)
  return (
    <a
      className="song-video song-video-facade"
      href={song.youtube_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`在 YouTube 上觀看 ${title} 官方影片`}
    >
      <img
        src={`https://i.ytimg.com/vi/${song.youtube_id}/hqdefault.jpg`}
        alt={`${title} 官方影片縮圖`}
        loading="lazy"
      />
      <span className="song-video-play">▶</span>
      <span className="song-video-hint">在 YouTube 上觀看官方 MV</span>
    </a>
  )
}

// ---------- 文法分析 ----------
function GrammarTab({ song }) {
  return (
    <>
      <p className="song-tab-hint">
        取自本曲的 {song.grammar.length} 個重點句型，每條附說明與另造例句。
      </p>
      <div className="grammar-list">
        {song.grammar.map((g, i) => (
          <div key={i} className="grammar-card">
            <div className="grammar-head">
              <span className="grammar-num">{i + 1}</span>
              <span className="grammar-pattern">
                <Furigana text={g.pattern} />
              </span>
            </div>
            <div className="grammar-title">{g.title_zh}</div>
            <p className="grammar-explain">
              <Furigana text={g.explanation_zh} />
            </p>
            <div className="grammar-example">
              <div className="example-row">
                <span className="example-jp">
                  <Furigana text={g.example_jp} />
                </span>
                <SpeakButton text={g.example_jp} label="" />
              </div>
              <div className="example-zh">{g.example_zh}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ---------- 單字分析 ----------
function VocabTab({ song }) {
  return (
    <>
      <p className="song-tab-hint">
        本曲出現的 {song.vocab.length} 個單字，依歌詞順序排列，可點 🔊 聽發音。
      </p>
      <div className="song-vocab-grid">
        {song.vocab.map((w, i) => (
          <div key={i} className="song-vocab-card">
            <div className="song-vocab-head">
              <span className="song-vocab-jp">
                <Furigana text={w.jp} />
              </span>
              <SpeakButton text={w.jp} label="" />
            </div>
            <div className="song-vocab-zh">{w.zh}</div>
            <div className="song-vocab-meta">
              <span className="song-tag">{w.pos}</span>
              <span className="song-tag song-tag-level">{w.level}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ---------- 歌詞解析 ----------
function LinesTab({ song }) {
  return (
    <>
      <p className="song-tab-hint">
        節錄 {song.lines.length} 句代表性歌詞作為解析範例（非完整歌詞）。
      </p>
      <div className="song-lines">
        {song.lines.map((line, i) => (
          <div key={i} className="song-line">
            <div className="song-line-head">
              <span className="song-line-num">{i + 1}</span>
              <span className="song-line-focus">
                <Furigana text={line.focus} />
              </span>
              <SpeakButton text={line.jp} label="" />
            </div>
            <div className="song-line-jp">
              <Furigana text={line.jp} />
            </div>
            <div className="song-line-zh">{line.zh}</div>
            <p className="song-line-point">
              <Furigana text={line.point_zh} />
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

// ---------- 小測驗 ----------
function QuizTab({ song }) {
  const [picked, setPicked] = useState({})

  return (
    <>
      <p className="song-tab-hint">
        {song.quiz.length} 題選擇題，作答後立即顯示解說。
      </p>
      <div className="song-quiz">
        {song.quiz.map((q, qi) => {
          const chosen = picked[qi]
          const answered = chosen !== undefined
          return (
            <div key={qi} className="song-quiz-card">
              <div className="song-quiz-q">
                <span className="grammar-num">{qi + 1}</span>
                <Furigana text={q.q} />
              </div>
              <div className="song-quiz-options">
                {q.options.map((opt, oi) => {
                  let state = ''
                  if (answered) {
                    if (oi === q.answer) state = 'correct'
                    else if (oi === chosen) state = 'wrong'
                  }
                  return (
                    <button
                      key={oi}
                      className={`song-quiz-option ${state}`}
                      disabled={answered}
                      onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                    >
                      <Furigana text={opt} />
                    </button>
                  )
                })}
              </div>
              {answered && (
                <p className="song-quiz-explain">
                  {chosen === q.answer ? '✅ 答對了！' : '❌ 再看一次：'}{' '}
                  <Furigana text={q.explain_zh} />
                </p>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

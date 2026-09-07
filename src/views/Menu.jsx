import { useState } from 'react'
import { MENUS, MENU_SYMBOLS, MENU_QUIZ, MENU_NOTE } from '../data/index.js'
import Furigana from '../components/Furigana.jsx'
import SpeakButton from '../components/SpeakButton.jsx'

// "菜單解讀" — Japanese menus are full of kanji that only ever appear on menus
// (〆, 時価, 並, 突き出し …), so this unit renders a realistic menu board and
// annotates every line: how it reads, what it means, what it actually is.
const TABS = [
  { key: 'menu', label: '菜單' },
  { key: 'symbols', label: '常見標示' },
  { key: 'quiz', label: '小測驗' },
]

export default function Menu() {
  const [tab, setTab] = useState('menu')
  // Hiding the Chinese turns the board into a self-test: read the real menu.
  const [hideZh, setHideZh] = useState(false)

  const menu = MENUS[0]
  const itemCount = menu.sections.reduce((n, s) => n + s.items.length, 0)

  return (
    <div className="view">
      <h1 className="view-title">
        {menu.icon} 菜單解讀
        <span className="view-title-tag">{menu.title_zh}</span>
      </h1>
      <p className="view-sub">
        {menu.sections.length} 大分類 · {itemCount} 個品項 · {MENU_SYMBOLS.length} 個菜單標示 ·
        每一項都解釋「實際上是什麼」
      </p>
      <p className="anime-note">💡 {MENU_NOTE}</p>

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

      {tab === 'menu' && (
        <MenuBoard menu={menu} hideZh={hideZh} onToggle={() => setHideZh((v) => !v)} />
      )}
      {tab === 'symbols' && <SymbolsTab />}
      {tab === 'quiz' && <QuizTab />}
    </div>
  )
}

// ---------- 菜單 ----------
function MenuBoard({ menu, hideZh, onToggle }) {
  return (
    <>
      <div className="mn-toolbar">
        <p className="song-tab-hint">{menu.intro_zh}</p>
        <button className={`mn-toggle ${hideZh ? 'on' : ''}`} onClick={onToggle}>
          {hideZh ? '👁️ 顯示中文' : '🙈 隱藏中文（自我測驗）'}
        </button>
      </div>

      <div className="mn-board">
        <div className="mn-board-head">
          <span className="mn-board-jp">
            <Furigana text={menu.title_jp} />
          </span>
          <span className="mn-board-sub">{menu.subtitle_zh}</span>
        </div>

        {menu.sections.map((sec, si) => (
          <section key={si} className="mn-section">
            <h2 className="mn-section-head">
              <span className="mn-section-jp">
                <Furigana text={sec.name_jp} />
              </span>
              <span className="mn-section-zh">{sec.name_zh}</span>
            </h2>
            <p className="mn-section-note">
              <Furigana text={sec.note_zh} />
            </p>

            <ul className="mn-items">
              {sec.items.map((it, ii) => (
                <li key={ii} className="mn-item">
                  <div className="mn-item-row">
                    <span className="mn-item-jp">
                      <Furigana text={it.jp} />
                    </span>
                    <span className="mn-item-dots" aria-hidden="true" />
                    <span className="mn-item-price">
                      {it.price === '—' ? '—' : `¥${it.price}`}
                    </span>
                    <SpeakButton text={it.jp} label="" />
                  </div>
                  {!hideZh && (
                    <>
                      <div className="mn-item-zh">{it.zh}</div>
                      <p className="mn-item-note">
                        <Furigana text={it.note_zh} />
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}

// ---------- 常見標示 ----------
function SymbolsTab() {
  return (
    <>
      <p className="song-tab-hint">
        這些字幾乎只出現在菜單與店門口，卻常常查不到、也沒有教科書會教。
      </p>
      <div className="mn-symbol-grid">
        {MENU_SYMBOLS.map((s, i) => (
          <div key={i} className="mn-symbol">
            <div className="mn-symbol-head">
              <span className="mn-symbol-jp">
                <Furigana text={s.jp} />
              </span>
              <SpeakButton text={s.jp} label="" />
            </div>
            <div className="mn-symbol-zh">{s.zh}</div>
            <p className="mn-symbol-note">
              <Furigana text={s.note_zh} />
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

// ---------- 小測驗 ----------
function QuizTab() {
  const [picked, setPicked] = useState({})

  return (
    <>
      <p className="song-tab-hint">{MENU_QUIZ.length} 題選擇題，作答後立即顯示解說。</p>
      <div className="song-quiz">
        {MENU_QUIZ.map((q, qi) => {
          const chosen = picked[qi]
          const answered = chosen !== undefined
          return (
            <div key={qi} className="song-quiz-card">
              <div className="song-quiz-q">
                <span className="grammar-num">{qi + 1}</span>
                <Furigana text={q.q_zh} />
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

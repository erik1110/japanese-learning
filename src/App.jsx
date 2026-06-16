import { useState, useRef, useEffect } from 'react'
import Home from './views/Home.jsx'
import Flashcards from './views/Flashcards.jsx'
import Quiz from './views/Quiz.jsx'
import Review from './views/Review.jsx'
import Dialogues from './views/Dialogues.jsx'
import Grammar from './views/Grammar.jsx'
import Anime from './views/Anime.jsx'
import { cancelSpeech } from './utils/speech.js'

const VIEWS = {
  home: { title: '首頁', component: Home },
  flashcards: { title: '單字卡', component: Flashcards },
  grammar: { title: '文法攻略', component: Grammar },
  quiz: { title: '牛刀小試', component: Quiz },
  review: { title: '隨機背誦', component: Review },
  dialogues: { title: '情境對話', component: Dialogues },
  anime: { title: '動漫日語', component: Anime },
}

const NAV = ['flashcards', 'grammar', 'quiz', 'review', 'dialogues', 'anime']

// External links shown at the end of the nav bar.
const EXTERNAL_LINKS = [
  { title: '個人部落格', href: 'https://erik1110.com/', icon: '🇹🇼' },
  { title: '法文學習', href: 'https://erik1110.com/french-learning/', icon: '🇫🇷' },
]

export default function App() {
  const [view, setView] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close the "其他連結" dropdown when clicking outside of it.
  useEffect(() => {
    if (!menuOpen) return
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  function navigate(next) {
    cancelSpeech() // stop any audio when switching screens
    setView(next)
  }

  const Current = VIEWS[view].component

  return (
    <div className="app">
      <header className="app-header">
        <button className="brand" onClick={() => navigate('home')}>
          <span className="brand-jp">日本語学習</span>
          <span className="brand-en">Japanese Learning</span>
        </button>
        <nav className="app-nav">
          {NAV.map((key) => (
            <button
              key={key}
              className={`nav-link ${view === key ? 'active' : ''}`}
              onClick={() => navigate(key)}
            >
              {VIEWS[key].title}
            </button>
          ))}
          <div className="nav-dropdown" ref={menuRef}>
            <button
              className={`nav-link ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              其他連結 ▾
            </button>
            {menuOpen && (
              <div className="nav-dropdown-menu">
                {EXTERNAL_LINKS.map((link) => (
                  <a
                    key={link.href}
                    className="nav-dropdown-item"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="nav-dropdown-icon">{link.icon}</span>
                    {link.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="app-main">
        <Current navigate={navigate} />
      </main>

      <footer className="app-footer">
        <span>
          JLPT N1–N5 · 單字卡、牛刀小試、隨機背誦、情境對話 · 漢字皆標注假名
        </span>
      </footer>
    </div>
  )
}

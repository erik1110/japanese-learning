import { useState } from 'react'
import Home from './views/Home.jsx'
import Flashcards from './views/Flashcards.jsx'
import Quiz from './views/Quiz.jsx'
import Review from './views/Review.jsx'
import Dialogues from './views/Dialogues.jsx'
import Grammar from './views/Grammar.jsx'
import { cancelSpeech } from './utils/speech.js'

const VIEWS = {
  home: { title: '首頁', component: Home },
  flashcards: { title: '單字卡', component: Flashcards },
  grammar: { title: '文法攻略', component: Grammar },
  quiz: { title: '牛刀小試', component: Quiz },
  review: { title: '隨機背誦', component: Review },
  dialogues: { title: '情境對話', component: Dialogues },
}

const NAV = ['flashcards', 'grammar', 'quiz', 'review', 'dialogues']

export default function App() {
  const [view, setView] = useState('home')

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

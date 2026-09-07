const MODES = [
  {
    key: 'flashcards',
    icon: '🗂️',
    title: '單字卡',
    desc: '依 N1–N5 等級與類別（含片假名外來語、擬聲擬態語）瀏覽單字，可聽發音、看例句與中文。',
  },
  {
    key: 'grammar',
    icon: '📘',
    title: '文法攻略',
    desc: '依 N5–N1 整理重點文法，每條附句型說明、例句與發音。',
  },
  {
    key: 'quiz',
    icon: '✍️',
    title: '牛刀小試',
    desc: '隨機出題，四選一選出正確的中文意思；可開啟「隱藏漢字」只看假名，難度升級。',
  },
  {
    key: 'exam',
    icon: '📝',
    title: '模擬試題',
    desc: '仿 JLPT 言語知識題型（漢字讀音、詞彙、文法、近義詞），限時作答、自動交卷並計分。',
  },
  {
    key: 'review',
    icon: '🔀',
    title: '隨機背誦',
    desc: '隨機抽單字卡，翻面背誦，記得 / 還沒記得自我評量。',
  },
  {
    key: 'dialogues',
    icon: '💬',
    title: '情境對話',
    desc: '10 大類情境、各 5 種場景，可整段播放或逐句聆聽。',
  },
  {
    key: 'anime',
    icon: '🎬',
    title: '動漫日語',
    desc: '22 部人氣動漫、各 3 種情境的原創練習句（非真實台詞），可聽發音。',
  },
  {
    key: 'songs',
    icon: '🎵',
    title: '日文歌分析',
    desc: '從日文歌學文法與單字：重點句型解析、單字整理、逐句解說與小測驗，並附官方 MV。',
  },
  {
    key: 'tokyo',
    icon: '🗼',
    title: '東京生活篇',
    desc: '選擇式情境遊戲：從便利商店到居酒屋，選出當下最自然的說法，每個選項都附中文解說與單字小考。',
  },
  {
    key: 'menu',
    icon: '🍶',
    title: '菜單解讀',
    desc: '看懂日本餐廳的菜單：居酒屋整份菜單逐項解說（怎麼唸、實際是什麼），另附時価・〆・税別等常見標示與小測驗。',
  },
]

export default function Home({ navigate }) {
  return (
    <div className="home">
      <section className="hero">
        <h1>
          <ruby>
            日本語<rt>にほんご</rt>
          </ruby>
          を<ruby>
            学<rt>まな</rt>
          </ruby>
          ぼう！
        </h1>
        <p className="hero-sub">
          JLPT N1–N5 日語學習網站 · 漢字皆標示平假名 · 內建發音
        </p>
      </section>

      <section className="mode-grid">
        {MODES.map((m) => (
          <button key={m.key} className="mode-card" onClick={() => navigate(m.key)}>
            <div className="mode-icon">{m.icon}</div>
            <h2>{m.title}</h2>
            <p>{m.desc}</p>
          </button>
        ))}
      </section>
    </div>
  )
}

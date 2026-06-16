const MODES = [
  {
    key: 'flashcards',
    icon: '🗂️',
    title: '單字卡',
    desc: '依 N1–N5 等級與類別（動物、植物⋯）瀏覽單字，可聽發音、看例句與中文。',
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
    desc: '隨機出題，四選一選出正確的中文意思，立即看到對錯與分數。',
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

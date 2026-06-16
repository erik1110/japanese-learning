# 日本語学習 · Japanese Learning

A static, front-end-only web app for learning Japanese for the JLPT exams
(**N1–N5**). It ships with flashcards, a grammar guide, a quiz, a random
review mode and situational dialogues. **Every kanji is annotated with its
hiragana reading** using HTML `<ruby>`, and all Japanese can be read aloud
through the browser's built-in speech synthesis — no audio files required.

> The UI labels are in Traditional Chinese (the learner's native language) and
> the study content is Japanese with Chinese translations.

## ✨ Features

| Mode | 中文 | Description |
| --- | --- | --- |
| 🗂️ Flashcards | 單字卡 | Vocabulary grouped by **level (N1–N5)** then by **category** (animals, plants, food …). Each card flips to reveal the Chinese meaning, an example sentence and its translation. Pronunciation and example buttons included. |
| 📘 Grammar | 文法攻略 | Key grammar points per level, each with a pattern, a Chinese explanation, an example sentence and pronunciation. |
| ✍️ Quiz | 牛刀小試 | Randomly generated multiple-choice quiz — pick the correct Chinese meaning out of 4 options, with instant feedback and a score. |
| 🔀 Review | 隨機背誦 | Shuffled flashcard deck for spaced self-testing ("I knew it" / "not yet"). |
| 💬 Dialogues | 情境對話 | Situational conversations in **10 categories × 5 scenarios**. Play the whole dialogue or listen line by line. |

- **Furigana everywhere** — kanji always shows its reading above it.
- **Text-to-speech** — uses the Web Speech API (`SpeechSynthesis`). Works best
  in browsers/OSes with a Japanese voice installed (Chrome, Edge, Safari on
  macOS/iOS). If no Japanese voice is available the speak buttons are disabled.

## 🛠️ Tech stack

- [React 18](https://react.dev/)
- [Vite 4](https://vitejs.dev/) for dev server and bundling
- Plain CSS (no UI framework)
- Data stored as plain **JSON** files — no backend, no database

## 🚀 Getting started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# production build (outputs to ./dist)
npm run build

# preview the production build locally
npm run preview
```

> Requires Node.js 16+ for local development. The CI build uses Node 20.

## 📁 Project structure

```
src/
├── components/
│   ├── Furigana.jsx      # renders 漢字{かな} markup as <ruby>
│   ├── FlashCard.jsx     # flippable vocabulary card
│   └── SpeakButton.jsx   # 🔊 text-to-speech button
├── views/
│   ├── Home.jsx          # mode picker
│   ├── Flashcards.jsx    # level → category → cards
│   ├── Grammar.jsx       # grammar guide
│   ├── Quiz.jsx          # multiple-choice quiz
│   ├── Review.jsx        # random review deck
│   └── Dialogues.jsx     # situational dialogue player
├── utils/
│   ├── furigana.js       # parse furigana markup
│   └── speech.js         # SpeechSynthesis helpers
└── data/
    ├── n1.json … n5.json         # vocabulary, one file per level
    ├── grammar-n1.json … n5.json # grammar, one file per level
    └── dialogues.json            # situational dialogues
```

## ✍️ Editing / adding content

All study material lives in `src/data/`. Japanese text uses an inline
**furigana markup**: a run of kanji is immediately followed by its reading in
braces. Everything else (kana, punctuation) is written as-is.

```
私{わたし}は日本語{にほんご}を勉強{べんきょう}しています。
```

This renders as ruby text (reading above each kanji) and is also used to drive
the text-to-speech reading.

### Add a vocabulary word

Open the level file (e.g. `src/data/n5.json`) and add an entry to a category's
`words` array:

```json
{
  "word": "猫{ねこ}",
  "kana": "ねこ",
  "meaning_zh": "貓",
  "example_jp": "猫{ねこ}が好{す}きです。",
  "example_zh": "我喜歡貓。"
}
```

### Add a new category

Add an object to a level's `categories` array:

```json
{
  "id": "weather",
  "name_zh": "天氣",
  "icon": "🌤️",
  "words": [ /* … */ ]
}
```

### Add a dialogue scenario

Edit `src/data/dialogues.json`. Each category has `scenarios`, and each
scenario has `lines` (`speaker` is `"A"` or `"B"`):

```json
{
  "id": "rest-order",
  "title_jp": "レストランで注文{ちゅうもん}する",
  "title_zh": "在餐廳點餐",
  "lines": [
    { "speaker": "A", "jp": "いらっしゃいませ。", "zh": "歡迎光臨。" }
  ]
}
```

## 🌐 Deployment (GitHub Pages)

This repo includes a GitHub Actions workflow at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that builds the
site and deploys it to **GitHub Pages** on every push to `main`.

One-time setup:

1. Push this repository to GitHub.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

The site is served from the **root path** (`/`), which suits a custom domain or
a user/organization Pages site (`https://<username>.github.io/`). If you instead
deploy under a project sub-path (`https://<username>.github.io/<repo>/`), set the
`BASE_PATH` environment variable in the build step, e.g. `BASE_PATH=/<repo>/`.

## 📄 License

MIT — free to use, modify and share for your own studies.

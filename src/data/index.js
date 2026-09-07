// Central data registry. Vocabulary lives in one JSON file per JLPT level so
// each level can be edited independently (n5.json, n4.json, ...). Dialogues
// live in dialogues.json.
import n1 from './n1.json'
import n2 from './n2.json'
import n3 from './n3.json'
import n4 from './n4.json'
import n5 from './n5.json'
import onomatopoeia from './onomatopoeia.json'
import dialogues from './dialogues.json'
import anime from './anime.json'
import songs from './songs.json'
import tokyo from './tokyo.json'
import menu from './menu.json'
import gn1 from './grammar-n1.json'
import gn2 from './grammar-n2.json'
import gn3 from './grammar-n3.json'
import gn4 from './grammar-n4.json'
import gn5 from './grammar-n5.json'
import exams from './exams.json'

// JLPT levels, ordered from easiest to hardest. The onomatopoeia / mimetic
// word library (擬聲・擬態語) is an extra, non-JLPT unit appended at the end so
// it shows up as its own card in the flashcards / quiz / review pickers.
export const LEVELS = [n5, n4, n3, n2, n1, onomatopoeia]

export const ONOMATOPOEIA = onomatopoeia

export const LEVELS_BY_ID = LEVELS.reduce((acc, lvl) => {
  acc[lvl.level] = lvl
  return acc
}, {})

export function getLevel(levelId) {
  return LEVELS_BY_ID[levelId]
}

export function getCategory(levelId, categoryId) {
  return getLevel(levelId)?.categories.find((c) => c.id === categoryId)
}

/** All words of a level, flattened across its categories. */
export function allWordsForLevel(levelId) {
  const level = getLevel(levelId)
  if (!level) return []
  return level.categories.flatMap((c) =>
    c.words.map((w) => ({ ...w, categoryId: c.id, categoryName: c.name_zh })),
  )
}

export const DIALOGUE_CATEGORIES = dialogues.categories

export function getDialogueCategory(categoryId) {
  return DIALOGUE_CATEGORIES.find((c) => c.id === categoryId)
}

// Anime practice lines. NOTE: every line is an *original* sentence written to
// match each work's setting/character tone — not an actual quote from the work.
export const ANIME_WORKS = anime.works
export const ANIME_NOTE = anime.note_zh

export function getAnimeWork(workId) {
  return ANIME_WORKS.find((w) => w.id === workId)
}

// Japanese song analysis. Each song carries only short quoted excerpts used as
// grammar / vocabulary teaching examples (never the full lyric sheet) plus the
// official video link — see SONG_NOTE.
export const SONGS = songs.songs
export const SONG_NOTE = songs.note_zh

export function getSong(songId) {
  return SONGS.find((s) => s.id === songId)
}

// "東京生活篇": choice-driven scenario chapters. Each chapter is a scene made of
// `choice` steps (pick the most natural thing to say/do, every option carries an
// explanation) and `quiz` steps (vocabulary check). All lines are original
// teaching sentences — see TOKYO_NOTE.
export const TOKYO_CHAPTERS = tokyo.chapters
export const TOKYO_NOTE = tokyo.note_zh

export function getTokyoChapter(chapterId) {
  return TOKYO_CHAPTERS.find((c) => c.id === chapterId)
}

// "菜單解讀": annotated restaurant menus. Japanese menus use a closed set of
// kanji and abbreviations that appear almost nowhere else (〆, 時価, 並, 突き出し),
// so each item carries its reading plus a note on what the dish actually is.
// `menus` is an array so more venues can be added later; the view renders the
// first one. Prices are illustrative, not from any real restaurant.
export const MENUS = menu.menus
export const MENU_SYMBOLS = menu.symbols
export const MENU_QUIZ = menu.quiz
export const MENU_NOTE = menu.note_zh

// Grammar, one entry per JLPT level (easiest to hardest).
export const GRAMMAR_LEVELS = [gn5, gn4, gn3, gn2, gn1]

export function getGrammarLevel(levelId) {
  return GRAMMAR_LEVELS.find((g) => g.level === levelId)
}

// JLPT-style mock exams, one entry per level (N5..N1), each with a countdown
// time limit and a set of multiple-choice questions.
export const EXAM_LEVELS = exams.levels

export function getExamLevel(levelId) {
  return EXAM_LEVELS.find((e) => e.level === levelId)
}

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

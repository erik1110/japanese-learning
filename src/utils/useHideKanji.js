// Shared "hide kanji" setting.
//
// When on, study screens hide the kanji and show only the kana reading, so a
// Chinese-speaking learner can't simply guess a word's meaning from its kanji.
// The flag is global (shared across Quiz / Review / Flashcards) and persisted
// in localStorage. We keep a tiny module-level store + listener set so every
// component that calls the hook stays in sync without a Context provider.
import { useState, useEffect, useCallback } from 'react'

const KEY = 'hideKanji'
const listeners = new Set()

let current = false
try {
  current = localStorage.getItem(KEY) === '1'
} catch {
  // localStorage unavailable (e.g. private mode) — fall back to in-memory.
}

export function useHideKanji() {
  const [value, setValue] = useState(current)

  useEffect(() => {
    const listener = (v) => setValue(v)
    listeners.add(listener)
    // Sync in case the value changed between render and effect.
    listener(current)
    return () => listeners.delete(listener)
  }, [])

  const toggle = useCallback(() => {
    current = !current
    try {
      localStorage.setItem(KEY, current ? '1' : '0')
    } catch {
      // ignore persistence failures
    }
    listeners.forEach((l) => l(current))
  }, [])

  return [value, toggle]
}

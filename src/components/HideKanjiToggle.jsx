import { useHideKanji } from '../utils/useHideKanji.js'

/**
 * A checkbox that toggles the global "hide kanji" setting. Drop it on any
 * study screen; all screens share the same value.
 */
export default function HideKanjiToggle({ className = '' }) {
  const [hide, toggle] = useHideKanji()
  return (
    <label className={`hide-kanji-toggle ${className}`}>
      <input type="checkbox" checked={hide} onChange={toggle} />
      <span className="hide-kanji-track" aria-hidden="true">
        <span className="hide-kanji-thumb" />
      </span>
      <span className="hide-kanji-label">
        隱藏漢字{hide ? '（只顯示假名）' : ''}
      </span>
    </label>
  )
}

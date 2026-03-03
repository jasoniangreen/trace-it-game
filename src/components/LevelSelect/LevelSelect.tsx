import { levels } from '../../data/levels'
import type { Level } from '../../types'
import './LevelSelect.css'

export function HomeScreen() {
  return (
    <div className="level-select">
      <h1 className="level-select__title">Trace It</h1>
      <p className="level-select__subtitle">Draw the path</p>
      <div className="level-select__actions">
        <button
          className="level-select__action-btn level-select__action-btn--primary"
          onClick={() => { window.location.hash = '#level-planner' }}
        >
          Build a level and share it
        </button>
        <button
          className="level-select__action-btn"
          onClick={() => { window.location.hash = '#levels' }}
        >
          See example levels
        </button>
      </div>
    </div>
  )
}

interface LevelGridProps {
  onSelect: (level: Level) => void
  isComplete: (levelId: string) => boolean
}

export function LevelGrid({ onSelect, isComplete }: LevelGridProps) {
  return (
    <div className="level-select level-select--grid">
      <div className="level-select__header">
        <button className="level-select__header-back" onClick={() => { window.location.hash = '' }} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="level-select__header-title">Example Levels</h1>
      </div>
      <div className="level-select__grid">
        {levels.map((level, i) => {
          const done = isComplete(level.id)
          return (
            <button
              key={level.id}
              className={`level-card ${done ? 'level-card--done' : ''}`}
              onClick={() => onSelect(level)}
            >
              <span className="level-card__number">{i + 1}</span>
              <span className="level-card__name">{level.name}</span>
              <span className="level-card__size">
                {level.cols}x{level.rows}
              </span>
              {done && <span className="level-card__check">&#10003;</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

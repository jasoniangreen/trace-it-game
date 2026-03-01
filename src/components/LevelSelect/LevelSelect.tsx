import { levels } from '../../data/levels'
import type { Level } from '../../types'
import './LevelSelect.css'

interface LevelSelectProps {
  onSelect: (level: Level) => void
  isComplete: (levelId: string) => boolean
}

export function LevelSelect({ onSelect, isComplete }: LevelSelectProps) {
  return (
    <div className="level-select">
      <h1 className="level-select__title">Trace It</h1>
      <p className="level-select__subtitle">Draw the path</p>
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

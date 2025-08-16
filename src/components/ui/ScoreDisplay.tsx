import { GamePhase } from '../../types/game';

interface ScoreDisplayProps {
  score: number;
  round: number;
  tabCount: number;
  phase: GamePhase;
}

export function ScoreDisplay({ score, round, tabCount, phase }: ScoreDisplayProps) {
  return (
    <div className="win95-window">
      <div className="win95-titlebar">
        <span>Game.exe</span>
      </div>
      <div className="p-2 space-y-2">
        <div className="win95-inset p-2 bg-black">
          <div className="pixel-font text-resource-productivity space-y-1">
            <div>SCORE: {score.toString().padStart(6, '0')}</div>
            <div>ROUND: {round.toString().padStart(2, '0')}</div>
            <div>TABS: {tabCount.toString().padStart(2, '0')}</div>
            <div className="text-xs">
              {phase.toUpperCase()}
            </div>
          </div>
        </div>
        
        <button className="win95-button w-full">
          New Game
        </button>
        <button className="win95-button w-full" disabled>
          Tutorial
        </button>
        <button className="win95-button w-full" disabled>
          High Scores
        </button>
      </div>
    </div>
  );
}
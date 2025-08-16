import { RoundGoal } from '../../types/game';

interface GoalPanelProps {
  goal: RoundGoal;
  currentScore: number;
}

export function GoalPanel({ goal, currentScore }: GoalPanelProps) {
  const progress = Math.min((currentScore / goal.targetScore) * 100, 100);
  const isComplete = currentScore >= goal.targetScore;

  return (
    <div className="win95-window">
      <div className="win95-titlebar">
        <span>Round Goal</span>
      </div>
      <div className="p-2 space-y-2">
        <div className="win95-inset p-2">
          <div className="text-xs font-bold mb-1">{goal.title}</div>
          <div className="text-xs text-win95-darkgray mb-2">
            {goal.description}
          </div>
          <div className="text-xs">
            <div>Target: {goal.targetScore} pts</div>
            <div>Current: {currentScore} pts</div>
            <div>Reward: {goal.reward} pts</div>
            <div className="mt-1">
              <div className="win95-inset p-0.5">
                <div 
                  className={`h-2 transition-all duration-300 ${
                    isComplete ? 'bg-resource-productivity' : 'bg-win95-darkgray'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {isComplete && (
          <div className="text-xs bg-resource-productivity text-white p-1 rounded">
            ✓ Goal Complete! +{goal.reward} bonus points
          </div>
        )}
      </div>
    </div>
  );
}
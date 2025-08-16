import { useGameEngine } from '../../hooks/useGameEngine';
import { TabBrowser } from './TabBrowser';
import { ResourcePanel } from '../ui/ResourcePanel';
import { GoalPanel } from '../ui/GoalPanel';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { RunButton } from './RunButton';

export function GameContainer() {
  const { gameState, isAnimating, lastRunResult, emergentBehaviors, actions } = useGameEngine();

  return (
    <div className="min-h-screen bg-win95-desktop relative overflow-hidden">
      <div className="scanlines absolute inset-0 pointer-events-none"></div>
      
      <div className="p-4 h-screen">
        <div className="win95-window h-full max-w-none">
          <div className="win95-titlebar">
            <span className="flex items-center gap-1">
              <span className="text-xs">🌐</span> Tab Hoarder Simulator
            </span>
          </div>
          
          {/* Main Game Area - Full Height */}
          <div className="grid grid-cols-4 gap-2 p-2 h-full">
            {/* Browser Window - Takes up 3/4 of the space */}
            <div className="col-span-3 h-full">
              <TabBrowser 
                gameState={gameState}
                isAnimating={isAnimating}
                actions={actions}
              />
            </div>
            
            {/* Right Panel - Controls and Status */}
            <div className="space-y-2 h-full flex flex-col">
              <ResourcePanel resources={gameState.resources} />
              
              {gameState.currentGoal && (
                <GoalPanel 
                  goal={gameState.currentGoal}
                  currentScore={gameState.score}
                />
              )}
              
              <ScoreDisplay 
                score={gameState.score}
                round={gameState.round}
                tabCount={gameState.tabs.length}
                phase={gameState.phase}
              />
              
              <RunButton 
                onRun={actions.executeRun}
                disabled={isAnimating || gameState.phase !== 'discovery'}
                isAnimating={isAnimating}
                tabCount={gameState.tabs.length}
              />
              
              {/* Status Info */}
              <div className="win95-window flex-1 min-h-0">
                <div className="win95-titlebar">
                  <span className="text-xs">Status</span>
                </div>
                <div className="p-2 text-xs">
                  {gameState.phase === 'discovery' && '💡 Click links to open tabs, then RUN TABS'}
                  {gameState.phase === 'running' && '⚡ Running tabs...'}
                  {gameState.phase === 'scoring' && `🎯 Run complete! Score: ${lastRunResult?.totalPoints || 0} points`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Emergent Behavior Notifications */}
      {emergentBehaviors.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {emergentBehaviors.slice(-3).map((behavior, index) => (
            <div key={index} className="win95-window p-2 animate-tab-spawn">
              <div className="win95-titlebar mb-1">
                <span className="text-xs">Emergent Behavior Discovered!</span>
              </div>
              <div className="text-xs">
                <div className="font-bold">{behavior.triggeredBehaviors[0]?.name}</div>
                <div className="text-win95-darkgray mt-1">
                  +{behavior.totalBonus} points
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
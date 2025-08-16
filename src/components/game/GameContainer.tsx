import { useGameEngine } from '../../hooks/useGameEngine';
import { TabBrowser } from './TabBrowser';
import { ResourcePanel } from '../ui/ResourcePanel';
import { GoalPanel } from '../ui/GoalPanel';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { RunButton } from './RunButton';
import { SimpleCameraSystem } from '../effects/SimpleCameraSystem';
import { EffectExecutionPopup } from '../effects/EffectExecutionPopup';

export function GameContainer() {
  const { 
    gameState, 
    isAnimating, 
    lastRunResult, 
    emergentBehaviors, 
    currentFocusedTab,
    stepExecutionState,
    actions 
  } = useGameEngine();

  return (
    <div className="min-h-screen bg-win95-desktop relative overflow-auto">
      <div className="scanlines absolute inset-0 pointer-events-none"></div>
      
      <SimpleCameraSystem
        currentFocusedTab={currentFocusedTab}
        gamePhase={gameState.phase}
      >
        <div className="p-4 h-screen flex flex-col">
          <div className="win95-window flex-1 max-w-none flex flex-col">
            <div className="win95-titlebar flex-shrink-0">
              <span className="flex items-center gap-1">
                <span className="text-xs">🌐</span> Tab Hoarder Simulator
              </span>
              {currentFocusedTab && gameState.phase === 'running' && (
                <div className="text-xs bg-yellow-400 text-black px-2 py-1 rounded">
                  Processing: {currentFocusedTab}
                </div>
              )}
            </div>
            
            {/* Main Game Area - Constrained Height */}
            <div className="grid grid-cols-4 gap-2 p-2 flex-1 min-h-0">
              {/* Browser Window - Takes up 3/4 of the space */}
              <div className="col-span-3 h-full">
                <TabBrowser 
                  gameState={gameState}
                  isAnimating={isAnimating}
                  actions={actions}
                />
              </div>
              
              {/* Right Panel - Controls and Status */}
              <div className="space-y-2 flex flex-col min-h-0 overflow-hidden">
                <ResourcePanel resources={gameState.resources} />
                
                {gameState.currentGoal && (
                  <GoalPanel 
                    goal={gameState.currentGoal}
                    currentScore={gameState.score}
                  />
                )}
                
                <RunButton 
                  onRun={actions.executeRun}
                  onStepRun={actions.startStepExecution}
                  disabled={isAnimating || (gameState.phase !== 'discovery' && gameState.phase !== 'step-execution')}
                  isAnimating={isAnimating}
                  tabCount={gameState.tabs.length}
                  gamePhase={gameState.phase}
                />
                
                {/* Current Focus Info */}
                {currentFocusedTab && (
                  <div className="win95-window">
                    <div className="win95-titlebar">
                      <span className="text-xs">Effect Processing</span>
                    </div>
                    <div className="p-2 text-xs">
                      <div className="text-yellow-600 animate-pulse">
                        🎯 Processing: {currentFocusedTab}
                      </div>
                    </div>
                  </div>
                )}
                
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
      </SimpleCameraSystem>
      
      {/* Step Execution Popup */}
      {stepExecutionState && stepExecutionState.isWaitingForUser && (
        <EffectExecutionPopup
          tabId={stepExecutionState.currentTabId || ''}
          effectId={stepExecutionState.currentEffectId || ''}
          tabTitle={gameState.tabs.find(t => t.id === stepExecutionState.currentTabId)?.title || 'Unknown Tab'}
          onContinue={actions.executeNextStep}
          onCancel={actions.cancelStepExecution}
          isVisible={true}
        />
      )}
      
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
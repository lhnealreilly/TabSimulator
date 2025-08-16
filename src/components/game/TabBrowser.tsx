import { GameState } from '../../types/game';
import { GameEngineActions } from '../../hooks/useGameEngine';
import { TabBar } from '../tabs/TabBar';
import { TabContent } from '../tabs/TabContent';

interface TabBrowserProps {
  gameState: GameState;
  isAnimating: boolean;
  actions: GameEngineActions;
  currentExecutingEffect?: string | null;
}

export function TabBrowser({ gameState, isAnimating, actions, currentExecutingEffect }: TabBrowserProps) {
  const activeTab = gameState.tabs.find(tab => tab.isActive);

  return (
    <div className="win95-window h-full flex flex-col">
      <div className="win95-titlebar">
        <span>Browser Tabs</span>
        <div className="text-xs text-win95-silver">
          {gameState.tabs.length}/8 tabs
        </div>
      </div>
      
      <div className="flex flex-col flex-1 p-1 min-h-0">
        {/* Tab Bar */}
        <TabBar 
          tabs={gameState.tabs}
          onSwitchTab={actions.switchTab}
          onCloseTab={actions.closeTab}
          disabled={isAnimating || gameState.phase === 'running'}
        />
        
        {/* Tab Content Area */}
        <div className="win95-inset flex-1 p-2 overflow-y-auto">
          {activeTab ? (
            <TabContent 
              tab={activeTab}
              onOpenTab={actions.openTab}
              gameState={gameState}
              disabled={isAnimating || gameState.phase !== 'discovery'}
              currentExecutingEffect={currentExecutingEffect}
            />
          ) : (
            <div className="text-center mt-8">
              <p className="pixel-font text-win95-darkgray">
                NO TABS OPEN
                <br />
                <span className="animate-blink">_</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Phase Indicator */}
        <div className="flex justify-between items-center mt-1 p-1 bg-win95-gray border-t border-win95-darkgray text-xs">
          <div>
            <span className="text-win95-darkgray">Phase:</span>{' '}
            <span className="font-bold">
              {gameState.phase === 'discovery' && 'Discovery'}
              {gameState.phase === 'running' && 'Running...'}
              {gameState.phase === 'scoring' && 'Scoring'}
            </span>
          </div>
          
          {gameState.phase === 'discovery' && (
            <div className="text-win95-darkgray">
              Click links to open new tabs
            </div>
          )}
          
          {isAnimating && (
            <div className="text-win95-darkgray animate-pulse">
              Processing effects...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
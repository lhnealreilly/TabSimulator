import { Tab } from '../../types/tabs';
import { GameState } from '../../types/game';
import { LinkButton } from './LinkButton';

interface TabContentProps {
  tab: Tab;
  onOpenTab: (linkId: string) => Tab | null;
  gameState: GameState;
  disabled?: boolean;
}

export function TabContent({ tab, onOpenTab, gameState, disabled = false }: TabContentProps) {
  const availableRam = gameState.resources.ram.current;
  console.log('TabContent render:', { 
    tabId: tab.id, 
    availableRam, 
    maxRam: gameState.resources.ram.max,
    linksCount: tab.content.availableLinks.length,
    links: tab.content.availableLinks.map(l => ({ id: l.id, ramCost: l.ramCost }))
  });

  return (
    <div className="space-y-3">
      {/* Tab Header */}
      <div className="border-b border-win95-darkgray pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs">
            {tab.type === 'news' && '📰'}
            {tab.type === 'shopping' && '🛒'}
            {tab.type === 'social' && '💬'}
            {tab.type === 'work' && '💼'}
            {tab.type === 'research' && '📚'}
          </span>
          <h3 className="text-sm font-bold">
            {tab.content.isHijacked ? (
              <span className="text-resource-ram animate-pulse">
                {tab.content.title}
              </span>
            ) : (
              tab.content.title
            )}
          </h3>
          
          {/* Tab Status Indicators */}
          <div className="flex gap-1 ml-auto">
            {tab.content.isHijacked && (
              <span className="text-xs bg-resource-ram text-white px-1 rounded">
                HACKED
              </span>
            )}
            {tab.effects.length > 0 && (
              <span className="text-xs bg-resource-productivity text-white px-1 rounded">
                {tab.effects.length} FX
              </span>
            )}
          </div>
        </div>
        
        <p className="text-xs text-win95-darkgray">
          {tab.content.description}
        </p>
        
        {/* Tab Metadata */}
        <div className="flex justify-between items-center mt-2 text-xs text-win95-darkgray">
          <span>RAM: {tab.ramUsage}MB</span>
          <span>Created: {new Date(tab.createdAt).toLocaleTimeString()}</span>
          {tab.modifiedAt && (
            <span>Modified: {new Date(tab.modifiedAt).toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Discoverable Links */}
      {tab.content.availableLinks.length > 0 ? (
        <div>
          <h4 className="text-xs font-bold mb-2">Available Links:</h4>
          <div className="space-y-1">
            {tab.content.availableLinks.map(link => {
              const canAfford = availableRam >= link.ramCost;
              const isDisabled = disabled || gameState.tabs.length >= 8;
              console.log('Rendering LinkButton:', {
                linkId: link.id,
                availableRam,
                ramCost: link.ramCost,
                canAfford,
                isDisabled,
                tabsLength: gameState.tabs.length
              });
              
              return (
                <LinkButton
                  key={link.id}
                  link={link}
                  onOpenTab={onOpenTab}
                  canAfford={canAfford}
                  disabled={isDisabled}
                  availableRam={availableRam}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-win95-darkgray">
            No discoverable links in this tab
          </p>
        </div>
      )}

      {/* Effects Information */}
      {tab.effects.length > 0 && (
        <div className="border-t border-win95-darkgray pt-2">
          <h4 className="text-xs font-bold mb-1">Active Effects:</h4>
          <div className="grid grid-cols-2 gap-1">
            {tab.effects.map(effectId => (
              <div 
                key={effectId}
                className="text-xs bg-win95-silver px-1 py-0.5 rounded"
                title={effectId}
              >
                {effectId.replace('-', ' ').toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Status */}
      <div className="border-t border-win95-darkgray pt-2">
        <div className="flex justify-between text-xs">
          <span>Available RAM: {availableRam}MB</span>
          <span>Tabs: {gameState.tabs.length}/8</span>
        </div>
        
        <div className="mt-1">
          <div className="win95-inset p-0.5">
            <div 
              className="h-2 bg-resource-ram transition-all duration-300"
              style={{ 
                width: `${((gameState.resources.ram.max - availableRam) / gameState.resources.ram.max) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Phase-specific Messages */}
      {gameState.phase === 'discovery' && !disabled && (
        <div className="bg-win95-silver p-2 rounded">
          <p className="text-xs">
            💡 <strong>Discovery Phase:</strong> Click links to open new tabs. 
            Arrange your tabs strategically before running!
          </p>
        </div>
      )}
      
      {gameState.phase === 'running' && (
        <div className="bg-resource-productivity p-2 rounded">
          <p className="text-xs text-white">
            ⚡ <strong>Run Phase:</strong> Effects are executing...
          </p>
        </div>
      )}
    </div>
  );
}
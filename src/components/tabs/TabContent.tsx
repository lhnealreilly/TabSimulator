import { Tab } from '../../types/tabs';
import { GameState } from '../../types/game';
import { LinkButton } from './LinkButton';
import { effectRegistry } from '../../effects/EffectRegistry';

interface TabContentProps {
  tab: Tab;
  onOpenTab: (linkId: string) => Tab | null;
  gameState: GameState;
  disabled?: boolean;
  currentExecutingEffect?: string | null;
}

export function TabContent({ tab, onOpenTab, gameState, disabled = false, currentExecutingEffect }: TabContentProps) {
  const availableRam = gameState.resources.ram.current;

  // Predict what an effect will do based on current game state
  const getPredictedBehavior = (effect: any, gameState: GameState, sourceTab: Tab): string => {
    const predictions: string[] = [];
    
    switch (effect.id) {
      case 'news-base':
        const otherNewsTabs = gameState.tabs.filter(t => t.type === 'news' && t.id !== sourceTab.id);
        const basePoints = 10;
        const synergyBonus = otherNewsTabs.length * 5;
        predictions.push(`+${basePoints + synergyBonus} points`);
        if (otherNewsTabs.length >= 2) {
          predictions.push('Spawn breaking news tab');
        }
        if (otherNewsTabs.length > 0) {
          predictions.push(`+${synergyBonus} synergy bonus`);
        }
        break;
        
      case 'news-investigative':
        const newsCount = gameState.tabs.filter(t => t.type === 'news').length;
        const researchCount = gameState.tabs.filter(t => t.type === 'research').length;
        if (newsCount >= 2) {
          const multiplier = 1 + (newsCount * 0.2) + (researchCount * 0.3);
          predictions.push(`+${Math.floor(30 * multiplier)} points (${multiplier.toFixed(1)}x multiplier)`);
          predictions.push('+5 focus');
        } else {
          predictions.push('Requires 2+ news tabs');
        }
        break;
        
      case 'shopping-base':
        const otherShoppingTabs = gameState.tabs.filter(t => t.type === 'shopping' && t.id !== sourceTab.id);
        const shoppingBase = 8;
        const dealBonus = otherShoppingTabs.length >= 2 ? 20 : 0;
        predictions.push(`+${shoppingBase + dealBonus} points`);
        predictions.push('-3 willpower');
        if (dealBonus > 0) {
          predictions.push(`+${dealBonus} deal bonus`);
        }
        break;
        
      case 'shopping-cart-abandon':
        if (gameState.resources.willpower < 30) {
          predictions.push('Spawn retargeting ad tab');
          predictions.push('-15 willpower');
        } else {
          predictions.push('Requires willpower < 30');
        }
        break;
        
      case 'social-base':
        predictions.push('+12 points');
        predictions.push('-5 focus, -3 productivity');
        break;
        
      case 'social-viral':
        predictions.push('Waits for news/shopping effects');
        predictions.push('Base: +15 points, -10 focus');
        predictions.push('With news: +35 points');
        predictions.push('With shopping: +25 points');
        predictions.push('With both: +100 points!');
        break;
        
      case 'work-base':
        const workCount = gameState.tabs.filter(t => t.type === 'work').length;
        const collabBonus = workCount >= 2 ? 15 : 0;
        predictions.push(`+${15 + collabBonus} points`);
        predictions.push('+8 focus, +5 productivity');
        if (collabBonus > 0) {
          predictions.push(`+${collabBonus} collaboration bonus`);
        }
        break;
        
      case 'research-base':
        const otherTabsCount = gameState.tabs.filter(t => t.id !== sourceTab.id && t.type !== 'research').length;
        const citationBonus = otherTabsCount * 3;
        predictions.push(`+${8 + citationBonus} points`);
        predictions.push('+3 focus');
        if (citationBonus > 0) {
          predictions.push(`+${citationBonus} citation bonus`);
        }
        break;
        
      case 'hacker-chaos':
        const hackableTabs = gameState.tabs.filter(t => t.id !== sourceTab.id && !t.content.isHijacked);
        if (hackableTabs.length > 0) {
          predictions.push('+25 points');
          predictions.push('-10 willpower');
          predictions.push(`Hijack random tab (${hackableTabs.length} targets)`);
        } else {
          predictions.push('+10 points (no hackable tabs)');
        }
        break;
        
      default:
        predictions.push('Effect behavior not documented');
    }
    
    return predictions.join(', ');
  };

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
            {tab.content.availableLinks.map(link => (
              <LinkButton
                key={link.id}
                link={link}
                onOpenTab={onOpenTab}
                canAfford={availableRam >= link.ramCost}
                disabled={disabled || gameState.tabs.length >= 8}
                availableRam={availableRam}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-win95-darkgray">
            No discoverable links in this tab
          </p>
        </div>
      )}

      {/* Detailed Effects Information */}
      {tab.effects.length > 0 && (
        <div className="border-t border-win95-darkgray pt-2">
          <h4 className="text-xs font-bold mb-2">Active Effects - Run Preview:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto effects-container">
            {tab.effects.map(effectId => {
              const effect = effectRegistry.getEffect(effectId);
              if (!effect) {
                return (
                  <div 
                    key={effectId}
                    className="text-xs bg-win95-silver px-2 py-1 border border-win95-darkgray"
                  >
                    <div className="font-bold text-red-600">Unknown Effect: {effectId}</div>
                  </div>
                );
              }

              // Determine trigger text
              const getTriggerText = () => {
                switch (effect.trigger.type) {
                  case 'immediate': return '⚡ Immediate';
                  case 'conditional': return '❓ Conditional';
                  case 'reactive': return '🔗 Reactive';
                  default: return effect.trigger.type;
                }
              };

              // Determine rarity color
              const getRarityColor = () => {
                switch (effect.rarity) {
                  case 'legendary': return 'text-purple-600';
                  case 'rare': return 'text-blue-600';
                  case 'uncommon': return 'text-green-600';
                  default: return 'text-gray-600';
                }
              };

              const isExecuting = currentExecutingEffect === effectId;

              return (
                <div 
                  key={effectId}
                  className={`
                    text-xs px-2 py-1 border border-win95-darkgray transition-all duration-200
                    ${isExecuting 
                      ? 'effect-executing' 
                      : 'bg-win95-silver'
                    }
                  `}
                >
                  {/* Effect Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{effect.name}</span>
                      <span className={`text-xs ${getRarityColor()}`}>
                        ({effect.rarity})
                      </span>
                    </div>
                    <span className="text-xs bg-win95-gray px-1 rounded">
                      {getTriggerText()}
                    </span>
                  </div>
                  
                  {/* Effect Description */}
                  <div className="text-xs text-win95-darkgray mb-1">
                    {effect.description}
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {effect.tags.map(tag => (
                      <span 
                        key={tag}
                        className="text-xs bg-win95-white px-1 rounded border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Reactive Effects Info */}
                  {effect.trigger.type === 'reactive' && effect.trigger.reactsTo && (
                    <div className="text-xs text-blue-600 mt-1">
                      <strong>Triggers when:</strong> {effect.trigger.reactsTo.join(', ')} executes
                    </div>
                  )}
                  
                  {/* Effect predictions based on current game state */}
                  <div className="text-xs text-green-700 mt-1 font-bold">
                    <strong>When this runs:</strong> {getPredictedBehavior(effect, gameState, tab)}
                  </div>
                </div>
              );
            })}
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
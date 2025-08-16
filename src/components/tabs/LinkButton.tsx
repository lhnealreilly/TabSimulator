import { Link, TabType } from '../../types/tabs';
import { Tab } from '../../types/tabs';

interface LinkButtonProps {
  link: Link;
  onOpenTab: (linkId: string) => Tab | null;
  canAfford: boolean;
  disabled?: boolean;
  availableRam: number;
}

export function LinkButton({ link, onOpenTab, canAfford, disabled = false, availableRam }: LinkButtonProps) {
  const isDisabled = disabled || !canAfford;
  
  const handleClick = () => {
    if (!isDisabled) {
      onOpenTab(link.id);
    }
  };

  const getTabTypeIcon = (type: TabType): string => {
    switch (type) {
      case TabType.NEWS: return '📰';
      case TabType.SHOPPING: return '🛒';
      case TabType.SOCIAL: return '💬';
      case TabType.WORK: return '💼';
      case TabType.RESEARCH: return '📚';
      default: return '📄';
    }
  };

  const getRarityColor = (rarity?: string): string => {
    switch (rarity) {
      case 'legendary': return 'text-resource-willpower';
      case 'rare': return 'text-resource-focus';
      case 'uncommon': return 'text-resource-productivity';
      default: return 'text-win95-blue';
    }
  };

  const getRarityBg = (rarity?: string): string => {
    switch (rarity) {
      case 'legendary': return 'bg-resource-willpower';
      case 'rare': return 'bg-resource-focus';
      case 'uncommon': return 'bg-resource-productivity';
      default: return 'bg-win95-blue';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full text-left p-2 border-2 transition-all duration-150 cursor-pointer
        ${isDisabled 
          ? 'border-win95-darkgray bg-win95-gray text-win95-darkgray' 
          : 'win95-button border-win95-white bg-win95-gray hover:bg-win95-silver active:border-win95-darkgray'
        }
      `}
      title={
        !canAfford 
          ? `Insufficient RAM (need ${link.ramCost}MB, have ${availableRam}MB)`
          : `Open ${link.title} (${link.ramCost}MB RAM)`
      }
    >
      <div className="flex items-center gap-2">
        {/* Link Icon and Type */}
        <div className="flex items-center gap-1">
          <span className="text-sm">{getTabTypeIcon(link.targetTabType)}</span>
          <span className="text-xs text-win95-darkgray uppercase">
            {link.targetTabType}
          </span>
        </div>
        
        {/* Link Title */}
        <div className="flex-1">
          <div className={`text-sm font-bold ${isDisabled ? '' : getRarityColor(link.rarity)}`}>
            → {link.title}
          </div>
          
          {/* Effects Preview */}
          {link.effectsToGrant && link.effectsToGrant.length > 0 && (
            <div className="text-xs text-win95-darkgray mt-1">
              Effects: {link.effectsToGrant.slice(0, 2).join(', ')}
              {link.effectsToGrant.length > 2 && ` +${link.effectsToGrant.length - 2} more`}
            </div>
          )}
        </div>
        
        {/* RAM Cost and Rarity */}
        <div className="flex flex-col items-end gap-1">
          {/* RAM Cost */}
          <div className={`
            text-xs px-1 py-0.5 rounded
            ${canAfford 
              ? 'bg-resource-productivity text-white' 
              : 'bg-resource-ram text-white'
            }
          `}>
            {link.ramCost}MB
          </div>
          
          {/* Rarity Indicator */}
          {link.rarity && link.rarity !== 'common' && (
            <div className={`
              text-xs px-1 py-0.5 rounded text-white font-bold
              ${getRarityBg(link.rarity)}
            `}>
              {link.rarity.toUpperCase()}
            </div>
          )}
          
          {/* Discovery Chance */}
          {link.discoveryChance < 1.0 && (
            <div className="text-xs text-win95-darkgray">
              {Math.round(link.discoveryChance * 100)}%
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden/Special Link Indicators */}
      {link.isHidden && (
        <div className="text-xs text-resource-willpower mt-1">
          🔍 Hidden Link Discovered!
        </div>
      )}
      
      {link.requiresTab && (
        <div className="text-xs text-win95-darkgray mt-1">
          Requires: {link.requiresTab} tab
        </div>
      )}
      
      {/* RAM Warning */}
      {!canAfford && (
        <div className="text-xs text-resource-ram mt-1">
          ⚠️ Need {link.ramCost - availableRam}MB more RAM
        </div>
      )}
    </button>
  );
}
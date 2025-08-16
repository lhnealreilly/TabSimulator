import { Tab } from '../../types/tabs';

interface TabBarProps {
  tabs: Tab[];
  onSwitchTab: (tabId: string) => boolean;
  onCloseTab: (tabId: string) => boolean;
  disabled?: boolean;
}

export function TabBar({ tabs, onSwitchTab, onCloseTab, disabled = false }: TabBarProps) {
  if (tabs.length === 0) {
    return (
      <div className="flex gap-0 mb-0 min-h-[24px] border-b border-win95-darkgray">
        <div className="text-xs text-win95-darkgray p-2">No tabs open</div>
      </div>
    );
  }

  const handleTabClick = (tabId: string) => {
    if (!disabled) {
      onSwitchTab(tabId);
    }
  };

  const handleCloseClick = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!disabled) {
      onCloseTab(tabId);
    }
  };

  // Determine tab size based on number of tabs
  const getTabSize = () => {
    if (tabs.length <= 4) return 'normal';
    if (tabs.length <= 6) return 'compact';
    return 'mini';
  };

  const tabSize = getTabSize();

  return (
    <div className="flex gap-0 mb-0 border-b border-win95-darkgray">
      {/* Scrollable tab container */}
      <div className="flex gap-0 overflow-x-auto flex-1 scrollbar-thin">
        {tabs.map((tab, index) => (
        <div
          key={tab.id}
          data-tab-id={tab.id}
          className={`
            win95-tab cursor-pointer select-none flex items-center relative transition-all duration-200 flex-shrink-0
            ${tab.isActive ? 'win95-tab-active' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-win95-silver'}
            ${tabSize === 'normal' ? 'gap-1 min-w-[120px] max-w-[160px]' : ''}
            ${tabSize === 'compact' ? 'gap-1 min-w-[90px] max-w-[120px]' : ''}
            ${tabSize === 'mini' ? 'gap-0.5 min-w-[70px] max-w-[90px]' : ''}
          `}
          onClick={() => handleTabClick(tab.id)}
          style={{ zIndex: tab.isActive ? 10 : 1 }}
        >
          {/* Tab Icon based on type */}
          <span className="text-xs flex-shrink-0">
            {tab.type === 'news' && '📰'}
            {tab.type === 'shopping' && '🛒'}
            {tab.type === 'social' && '💬'}
            {tab.type === 'work' && '💼'}
            {tab.type === 'research' && '📚'}
          </span>
          
          {/* Tab Title - adaptive sizing */}
          {tabSize !== 'mini' && (
            <span 
              className={`text-xs truncate flex-1 ${tabSize === 'compact' ? 'max-w-[50px]' : 'max-w-[80px]'}`} 
              title={tab.title}
            >
              {tab.title}
            </span>
          )}
          
          {/* RAM Usage Indicator - only show in normal/compact mode */}
          {tabSize === 'normal' && (
            <span className="text-xs text-win95-darkgray flex-shrink-0">
              {tab.ramUsage}MB
            </span>
          )}
          
          {/* Close Button - adaptive sizing */}
          {tabs.length > 1 && (
            <button
              className={`
                win95-close-button flex-shrink-0
                ${tabSize === 'mini' ? 'w-3 h-2 text-xs ml-0.5' : 'ml-1'}
                ${disabled ? 'cursor-not-allowed' : 'hover:bg-win95-darkgray'}
              `}
              onClick={(e) => handleCloseClick(tab.id, e)}
              disabled={disabled}
              title="Close tab"
            >
              ×
            </button>
          )}
          
          {/* Effect Indicators - only show in normal mode */}
          {tab.effects.length > 0 && tabSize === 'normal' && (
            <div className="absolute -top-1 -right-1 flex">
              {tab.effects.slice(0, 2).map((effectId, i) => (
                <div 
                  key={`${effectId}-${i}`}
                  className="w-2 h-2 rounded-full bg-resource-productivity border border-win95-black"
                  style={{ marginLeft: i > 0 ? '-2px' : '0' }}
                  title={`Effect: ${effectId}`}
                />
              ))}
              {tab.effects.length > 2 && (
                <div 
                  className="w-2 h-2 rounded-full bg-win95-darkgray border border-win95-black"
                  style={{ marginLeft: '-2px' }}
                  title={`+${tab.effects.length - 2} more effects`}
                />
              )}
            </div>
          )}
          
          {/* Compact effect indicator - show count only in compact/mini mode */}
          {tab.effects.length > 0 && tabSize !== 'normal' && (
            <div className="absolute -top-1 -right-1">
              <div 
                className="w-3 h-3 rounded-full bg-resource-productivity border border-win95-black flex items-center justify-center"
                title={`${tab.effects.length} effects`}
              >
                <span className="text-xs text-white font-bold leading-none">
                  {tab.effects.length}
                </span>
              </div>
            </div>
          )}
        </div>
        ))}
      </div>
      
      {/* Tab count indicator */}
      <div className="flex-shrink-0 border-b border-win95-darkgray flex items-end justify-end p-1">
        <span className="text-xs text-win95-darkgray">
          {tabs.length}/8
        </span>
      </div>
    </div>
  );
}
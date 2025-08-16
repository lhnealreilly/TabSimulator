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

  return (
    <div className="flex gap-0 mb-0">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          className={`
            win95-tab cursor-pointer select-none flex items-center gap-1 relative
            ${tab.isActive ? 'win95-tab-active' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-win95-silver'}
          `}
          onClick={() => handleTabClick(tab.id)}
          style={{ zIndex: tab.isActive ? 10 : 1 }}
        >
          {/* Tab Icon based on type */}
          <span className="text-xs">
            {tab.type === 'news' && '📰'}
            {tab.type === 'shopping' && '🛒'}
            {tab.type === 'social' && '💬'}
            {tab.type === 'work' && '💼'}
            {tab.type === 'research' && '📚'}
          </span>
          
          {/* Tab Title */}
          <span className="text-xs truncate max-w-[100px]" title={tab.title}>
            {tab.title}
          </span>
          
          {/* RAM Usage Indicator */}
          <span className="text-xs text-win95-darkgray">
            {tab.ramUsage}MB
          </span>
          
          {/* Close Button */}
          {tabs.length > 1 && (
            <button
              className={`
                win95-close-button ml-1
                ${disabled ? 'cursor-not-allowed' : 'hover:bg-win95-darkgray'}
              `}
              onClick={(e) => handleCloseClick(tab.id, e)}
              disabled={disabled}
              title="Close tab"
            >
              ×
            </button>
          )}
          
          {/* Effect Indicators */}
          {tab.effects.length > 0 && (
            <div className="absolute -top-1 -right-1 flex">
              {tab.effects.slice(0, 2).map((effectId, i) => (
                <div 
                  key={effectId}
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
        </div>
      ))}
      
      {/* Tab count indicator */}
      <div className="flex-1 border-b border-win95-darkgray flex items-end justify-end p-1">
        <span className="text-xs text-win95-darkgray">
          {tabs.length}/8 tabs
        </span>
      </div>
    </div>
  );
}
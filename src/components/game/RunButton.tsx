import { RunResult } from '../../types/game';

interface RunButtonProps {
  onRun: () => Promise<RunResult>;
  disabled?: boolean;
  isAnimating?: boolean;
  tabCount: number;
}

export function RunButton({ onRun, disabled = false, isAnimating = false, tabCount }: RunButtonProps) {
  const handleClick = async () => {
    if (!disabled && !isAnimating) {
      try {
        await onRun();
      } catch (error) {
        console.error('Run failed:', error);
      }
    }
  };

  const getButtonText = (): string => {
    if (isAnimating) return 'RUNNING...';
    if (tabCount === 0) return 'NO TABS TO RUN';
    if (disabled) return 'RUN TABS';
    return '▶ RUN TABS';
  };

  const getButtonClass = (): string => {
    const baseClass = 'w-full px-4 py-3 font-bold text-sm transition-all duration-150';
    
    if (isAnimating) {
      return `${baseClass} bg-resource-productivity text-white border-2 border-resource-productivity animate-pulse`;
    }
    
    if (disabled || tabCount === 0) {
      return `${baseClass} bg-win95-gray text-win95-darkgray border-2 border-win95-darkgray cursor-not-allowed`;
    }
    
    return `${baseClass} win95-button hover:bg-win95-silver active:bg-win95-darkgray`;
  };

  return (
    <div className="win95-window">
      <div className="win95-titlebar">
        <span>Run Control</span>
      </div>
      
      <div className="p-2 space-y-2">
        {/* Tab Count Preview */}
        <div className="win95-inset p-2 bg-black">
          <div className="pixel-font text-resource-productivity space-y-1">
            <div>TABS READY: {tabCount.toString().padStart(2, '0')}</div>
            <div>STATUS: {isAnimating ? 'RUNNING' : disabled ? 'WAITING' : 'READY'}</div>
            {isAnimating && (
              <div className="animate-pulse">PROCESSING...</div>
            )}
          </div>
        </div>
        
        {/* Main Run Button */}
        <button
          onClick={handleClick}
          disabled={disabled || isAnimating || tabCount === 0}
          className={getButtonClass()}
          title={
            tabCount === 0 
              ? 'Open some tabs first!'
              : disabled 
                ? 'Complete discovery phase first'
                : 'Execute all tab effects'
          }
        >
          {getButtonText()}
        </button>
        
        {/* Progress Indicator during run */}
        {isAnimating && (
          <div className="win95-inset p-1">
            <div className="win95-progress-bar h-3">
              <div className="absolute inset-0 bg-gradient-to-r from-win95-navy via-resource-focus to-win95-navy animate-pulse" />
            </div>
          </div>
        )}
        
        {/* Help Text */}
        <div className="text-xs text-win95-darkgray">
          {tabCount === 0 && "Open tabs by clicking links"}
          {tabCount > 0 && !disabled && !isAnimating && "Execute all tab effects in order"}
          {disabled && "Complete discovery phase first"}
          {isAnimating && "Effects are executing..."}
        </div>
        
        {/* Quick Stats */}
        {tabCount > 0 && (
          <div className="border-t border-win95-darkgray pt-2 space-y-1">
            <div className="text-xs">
              <span className="text-win95-darkgray">Effects to run:</span>{' '}
              <span className="font-bold">~{tabCount * 2}</span>
            </div>
            <div className="text-xs">
              <span className="text-win95-darkgray">Expected chains:</span>{' '}
              <span className="font-bold">{Math.min(tabCount, 3)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
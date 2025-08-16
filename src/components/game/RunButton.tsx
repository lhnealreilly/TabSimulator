import { RunResult } from '../../types/game';

interface RunButtonProps {
  onRun: () => Promise<RunResult>;
  onStepRun: () => void;
  disabled?: boolean;
  isAnimating?: boolean;
  tabCount: number;
  gamePhase: string;
}

export function RunButton({ onRun, onStepRun, disabled = false, isAnimating = false, tabCount, gamePhase }: RunButtonProps) {
  const handleStepClick = () => {
    if (!disabled && !isAnimating) {
      onStepRun();
    }
  };

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
        
        {/* Run Buttons */}
        <div className="space-y-1">
          {/* Step-by-Step Run Button */}
          <button
            onClick={handleStepClick}
            disabled={disabled || isAnimating || tabCount === 0}
            className={`
              w-full px-4 py-2 font-bold text-sm transition-all duration-150
              ${disabled || tabCount === 0 
                ? 'bg-win95-gray text-win95-darkgray border-2 border-win95-darkgray cursor-not-allowed'
                : 'win95-button hover:bg-win95-silver active:bg-win95-darkgray'
              }
            `}
            title={
              tabCount === 0 
                ? 'Open some tabs first!'
                : disabled 
                  ? 'Complete discovery phase first'
                  : 'Execute effects one by one'
            }
          >
            🔍 STEP THROUGH EFFECTS
          </button>
          
          {/* Auto Run Button */}
          <button
            onClick={handleClick}
            disabled={disabled || isAnimating || tabCount === 0}
            className={getButtonClass()}
            title={
              tabCount === 0 
                ? 'Open some tabs first!'
                : disabled 
                  ? 'Complete discovery phase first'
                  : 'Execute all tab effects automatically'
            }
          >
            {getButtonText()}
          </button>
        </div>
        
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
      </div>
    </div>
  );
}
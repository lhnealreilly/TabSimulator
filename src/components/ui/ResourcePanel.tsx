import { Resources } from '../../types/game';

interface ResourcePanelProps {
  resources: Resources;
}

export function ResourcePanel({ resources }: ResourcePanelProps) {
  return (
    <div className="win95-window">
      <div className="win95-titlebar">
        <span>System Resources</span>
      </div>
      <div className="p-2">
        {/* RAM */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-bold">Available RAM:</span>
            <span className="text-xs font-mono">
              {resources.ram.current}/{resources.ram.max}MB
            </span>
          </div>
          <div className="win95-inset p-0.5">
            <div 
              className="win95-progress-bar h-4"
              style={{ 
                width: `${(resources.ram.current / resources.ram.max) * 100}%` 
              }}
            />
          </div>
          <div className="text-xs text-win95-darkgray mt-1 text-center">
            {Math.round((resources.ram.current / resources.ram.max) * 100)}% Free
          </div>
        </div>
      </div>
    </div>
  );
}
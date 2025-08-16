import { effectRegistry } from '../../effects/EffectRegistry';

interface EffectExecutionPopupProps {
  tabId: string;
  effectId: string;
  tabTitle: string;
  onContinue: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

export function EffectExecutionPopup({ 
  tabId, 
  effectId, 
  tabTitle, 
  onContinue, 
  onCancel, 
  isVisible 
}: EffectExecutionPopupProps) {
  if (!isVisible) return null;

  const effect = effectRegistry.getEffect(effectId);
  
  if (!effect) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="win95-window p-4 max-w-md">
          <div className="win95-titlebar mb-2">
            <span>Effect Execution</span>
          </div>
          <div className="p-2">
            <p className="text-sm text-red-600 mb-4">
              Unknown effect: {effectId}
            </p>
            <div className="flex gap-2 justify-end">
              <button className="win95-button" onClick={onCancel}>
                Cancel Run
              </button>
              <button className="win95-button" onClick={onContinue}>
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="win95-window p-4 max-w-lg">
        <div className="win95-titlebar mb-2">
          <span>⚡ Effect Executing</span>
        </div>
        
        <div className="p-2 space-y-3">
          {/* Tab Info */}
          <div className="bg-win95-silver p-2 border border-win95-darkgray">
            <div className="text-sm">
              <strong>Tab:</strong> {tabTitle}
            </div>
            <div className="text-xs text-win95-darkgray">
              ID: {tabId}
            </div>
          </div>
          
          {/* Effect Info */}
          <div className="bg-win95-silver p-2 border border-win95-darkgray">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold">{effect.name}</div>
              <div className="text-xs bg-win95-gray px-1 rounded">
                {effect.rarity}
              </div>
            </div>
            
            <div className="text-sm text-win95-darkgray mb-2">
              {effect.description}
            </div>
            
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
          </div>
          
          {/* Trigger Info */}
          <div className="bg-win95-inset p-2">
            <div className="text-xs">
              <strong>Trigger:</strong> {effect.trigger.type}
              {effect.trigger.type === 'reactive' && effect.trigger.reactsTo && (
                <span className="ml-2 text-blue-600">
                  (Reacts to: {effect.trigger.reactsTo.join(', ')})
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2 border-t border-win95-darkgray">
            <button 
              className="win95-button px-6"
              onClick={onCancel}
            >
              Cancel Run
            </button>
            <button 
              className="win95-button px-6 font-bold"
              onClick={onContinue}
            >
              Execute Effect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
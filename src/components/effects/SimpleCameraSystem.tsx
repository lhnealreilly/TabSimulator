import { useEffect, useState } from 'react';

interface SimpleCameraSystemProps {
  children: React.ReactNode;
  currentFocusedTab: string | null;
  gamePhase: string;
}

export function SimpleCameraSystem({ children, currentFocusedTab, gamePhase }: SimpleCameraSystemProps) {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setIsRunning(gamePhase === 'running');
  }, [gamePhase]);

  useEffect(() => {
    if (currentFocusedTab && isRunning) {
      // Find and highlight the focused tab
      const tabElement = document.querySelector(`[data-tab-id="${currentFocusedTab}"]`);
      if (tabElement) {
        // Remove previous highlights
        document.querySelectorAll('.camera-focused').forEach(el => {
          el.classList.remove('camera-focused');
        });
        
        // Add highlight to current tab
        tabElement.classList.add('camera-focused');
        
        // Remove highlight after a short time
        setTimeout(() => {
          tabElement.classList.remove('camera-focused');
        }, 800);
      }
    }
  }, [currentFocusedTab, isRunning]);

  return (
    <div className="relative">
      {children}
      
      {/* Running overlay */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 animate-pulse" />
          
          {currentFocusedTab && (
            <div className="absolute top-4 left-4 bg-yellow-400 text-black px-2 py-1 rounded font-bold text-sm animate-pulse">
              👁️ Processing: {currentFocusedTab}
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded text-lg font-bold animate-pulse">
              ⚡ RUNNING EFFECTS
            </div>
          </div>
        </div>
      )}

      {/* CSS for camera-focused effect */}
      <style>{`
        .camera-focused {
          animation: cameraFocus 0.8s ease-in-out;
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(255, 255, 0, 0.8);
          z-index: 10;
          position: relative;
          border: 2px solid #ffff00 !important;
        }
        
        @keyframes cameraFocus {
          0% { 
            transform: scale(1); 
            box-shadow: none; 
            border-color: transparent;
          }
          50% { 
            transform: scale(1.1); 
            box-shadow: 0 0 30px rgba(255, 255, 0, 1);
            border-color: #ffff00;
          }
          100% { 
            transform: scale(1.05); 
            box-shadow: 0 0 20px rgba(255, 255, 0, 0.8);
            border-color: #ffff00;
          }
        }
      `}</style>
    </div>
  );
}
import { useState, useRef, useCallback, useEffect } from 'react';
import { GameState, GamePhase, GameConfig, RunResult, StepExecutionState, PendingEffect } from '../types/game';
import { Tab, TabType } from '../types/tabs';
import { EffectResult } from '../types/effects';
import { GameLoop, GameLoopEvents } from '../engine/GameLoop';
import { EmergentDetectionResult } from '../effects/EmergentBehaviorDetector';
import { effectRegistry } from '../effects/EffectRegistry';

export interface GameEngineActions {
  // Phase Control
  startDiscoveryPhase: () => void;
  executeRun: () => Promise<RunResult>;
  startStepExecution: () => void;
  executeNextStep: () => void;
  cancelStepExecution: () => void;
  
  // Tab Management
  openTab: (linkId: string) => Tab | null;
  closeTab: (tabId: string) => boolean;
  switchTab: (tabId: string) => boolean;
  
  // Utilities
  reset: () => void;
}

export interface GameEngineState {
  gameState: GameState;
  isAnimating: boolean;
  lastRunResult: RunResult | null;
  emergentBehaviors: EmergentDetectionResult[];
  currentFocusedTab: string | null;
  stepExecutionState: StepExecutionState | null;
}

const DEFAULT_CONFIG: GameConfig = {
  baseRamMax: 1000,
  baseProductivity: 100,
  baseFocus: 100,
  baseWillpower: 100,
  tickRate: 60,
  runPhaseDuration: 3000 // 3 seconds for animations
};

const createInitialState = (config: GameConfig): GameState => ({
  tabs: [{
    id: 'welcome-tab',
    type: TabType.WORK,
    title: 'Welcome to Tab Hoarder',
    content: {
      title: 'Getting Started',
      description: 'Welcome to the Tab Hoarder Simulator! Click links below to open new tabs.',
      availableLinks: [
        {
          id: 'news-link-1',
          title: 'Breaking Tech News',
          targetTabType: TabType.NEWS,
          discoveryChance: 1.0,
          ramCost: 45,
          effectsToGrant: ['news-base']
        },
        {
          id: 'shop-link-1', 
          title: 'Online Shopping Deals',
          targetTabType: TabType.SHOPPING,
          discoveryChance: 1.0,
          ramCost: 65,
          effectsToGrant: ['shopping-base']
        },
        {
          id: 'social-link-1',
          title: 'Social Media Feed', 
          targetTabType: TabType.SOCIAL,
          discoveryChance: 1.0,
          ramCost: 55,
          effectsToGrant: ['social-base']
        }
      ],
      runBehavior: {
        basePoints: 10,
        resourceDrain: 0,
        description: 'Welcome tab provides basic points'
      }
    },
    ramUsage: 30,
    isActive: true,
    hasRunThisRound: false,
    burnoutChance: 0,
    effects: ['work-base'],
    effectState: {
      cooldowns: {},
      usageCount: {},
      lastTriggered: {},
      persistentData: {}
    },
    createdAt: Date.now()
  }],
  resources: {
    ram: {
      current: config.baseRamMax - 30, // Available RAM after welcome tab
      max: config.baseRamMax
    },
    productivity: config.baseProductivity,
    focus: config.baseFocus,
    willpower: config.baseWillpower
  },
  upgrades: [],
  currentGoal: {
    id: 'first-goal',
    title: 'First Steps',
    description: 'Open 2 tabs and complete your first run',
    targetScore: 50,
    reward: 100,
    difficulty: 'easy'
  },
  score: 0,
  round: 1,
  phase: 'discovery',
  gameTime: 0,
  isRunning: true
});

export function useGameEngine(config: GameConfig = DEFAULT_CONFIG): GameEngineState & { actions: GameEngineActions } {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(config));
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<RunResult | null>(null);
  const [emergentBehaviors, setEmergentBehaviors] = useState<EmergentDetectionResult[]>([]);
  const [currentFocusedTab, setCurrentFocusedTab] = useState<string | null>(null);
  const [stepExecutionState, setStepExecutionState] = useState<StepExecutionState | null>(null);
  
  const gameLoopRef = useRef<GameLoop | null>(null);


  // Initialize GameLoop
  useEffect(() => {
    const events: GameLoopEvents = {
      onPhaseChange: (phase: GamePhase) => {
        setGameState(prev => ({ ...prev, phase }));
      },
      
      onEffectExecuted: (result: EffectResult) => {
        // Update game state from the loop
        if (gameLoopRef.current) {
          setGameState(gameLoopRef.current.getState());
        }
      },
      
      onEmergentBehavior: (result: EmergentDetectionResult) => {
        setEmergentBehaviors(prev => [...prev, result]);
      },
      
      onRunComplete: (result: RunResult) => {
        setLastRunResult(result);
        setIsAnimating(false);
        
        // Update game state from the loop
        if (gameLoopRef.current) {
          setGameState(gameLoopRef.current.getState());
          
          // Deterministic transition back to discovery phase
          gameLoopRef.current.startDiscoveryPhase();
          setGameState(gameLoopRef.current.getState());
        }
      },
      
      onTabSpawned: (tab: Tab) => {
        // Update game state from the loop
        if (gameLoopRef.current) {
          setGameState(gameLoopRef.current.getState());
        }
      },
      
      onTabModified: (tabId: string, changes: Partial<Tab>) => {
        // Update game state from the loop
        if (gameLoopRef.current) {
          setGameState(gameLoopRef.current.getState());
        }
      },

      onTabFocus: (tabId: string) => {
        setCurrentFocusedTab(tabId);
      }
    };

    const initialState = createInitialState(config);
    gameLoopRef.current = new GameLoop(initialState, config, events);
  }, []); // Only initialize once

  // Actions
  const startDiscoveryPhase = useCallback(() => {
    if (gameLoopRef.current) {
      gameLoopRef.current.startDiscoveryPhase();
    }
  }, []);

  const executeRun = useCallback(async (): Promise<RunResult> => {
    if (!gameLoopRef.current) {
      throw new Error('GameLoop not initialized');
    }

    setIsAnimating(true);
    
    // Execute the deterministic run immediately
    const result = gameLoopRef.current.executeRunPhase();
    
    // Simulate animation time (UI will show animations during this time)
    await new Promise(resolve => setTimeout(resolve, config.runPhaseDuration));
    
    setIsAnimating(false);
    return result;
  }, [config.runPhaseDuration]);

  const openTab = useCallback((linkId: string): Tab | null => {
    if (!gameLoopRef.current) {
      return null;
    }
    
    try {
      const newTab = gameLoopRef.current.openTabFromLink(linkId);
      setGameState(gameLoopRef.current.getState());
      return newTab;
    } catch (error) {
      console.error('Failed to open tab:', error);
      return null;
    }
  }, []);

  const closeTab = useCallback((tabId: string): boolean => {
    if (!gameLoopRef.current) return false;
    
    const success = gameLoopRef.current.closeTab(tabId);
    if (success) {
      setGameState(gameLoopRef.current.getState());
    }
    return success;
  }, []);

  const switchTab = useCallback((tabId: string): boolean => {
    if (!gameLoopRef.current) return false;
    
    const success = gameLoopRef.current.switchToTab(tabId);
    if (success) {
      setGameState(gameLoopRef.current.getState());
    }
    return success;
  }, []);

  // Step Execution Functions
  const startStepExecution = useCallback(() => {
    if (!gameLoopRef.current || gameState.phase !== 'discovery') {
      return;
    }
    
    if (gameState.tabs.length === 0) {
      return;
    }

    // Build list of all effects to execute
    const pendingEffects: PendingEffect[] = [];
    
    gameState.tabs.forEach(tab => {
      tab.effects.forEach(effectId => {
        const effect = effectRegistry.getEffect(effectId);
        if (effect) {
          pendingEffects.push({
            tabId: tab.id,
            effectId,
            effect
          });
        }
      });
    });

    if (pendingEffects.length === 0) {
      return;
    }

    // Transition to step execution phase
    setGameState(prev => ({ ...prev, phase: 'step-execution' }));
    
    setStepExecutionState({
      pendingEffects,
      currentEffectIndex: 0,
      executedEffects: [],
      isWaitingForUser: true,
      currentTabId: pendingEffects[0].tabId,
      currentEffectId: pendingEffects[0].effectId
    });

    // Focus on first tab and switch to it
    setCurrentFocusedTab(pendingEffects[0].tabId);
    
    // Switch to the first tab
    if (gameLoopRef.current) {
      gameLoopRef.current.switchToTab(pendingEffects[0].tabId);
      setGameState(gameLoopRef.current.getState());
    }
  }, [gameState.phase, gameState.tabs]);

  const executeNextStep = useCallback(() => {
    if (!stepExecutionState || !gameLoopRef.current) {
      return;
    }

    const currentEffect = stepExecutionState.pendingEffects[stepExecutionState.currentEffectIndex];
    if (!currentEffect) {
      // No more effects, finish run
      finishStepExecution();
      return;
    }

    // Execute the current effect using effect's execute function
    try {
      // Create a context for this effect
      const context = {
        sourceTabId: currentEffect.tabId,
        runPhaseTime: stepExecutionState.currentEffectIndex,
        previousEffects: stepExecutionState.executedEffects,
        availableTabs: gameState.tabs,
        deltaTime: 0
      };

      // Execute effect
      const originalState = gameState;
      const newGameState = currentEffect.effect.execute(originalState, context);
      
      // Update game state
      setGameState(newGameState);

      // Record executed effect
      const effectResult = {
        tabId: currentEffect.tabId,
        effectId: currentEffect.effectId,
        effect: currentEffect.effect.description,
        pointsGenerated: newGameState.score - originalState.score,
        timestamp: Date.now()
      };

      // Move to next effect
      const nextIndex = stepExecutionState.currentEffectIndex + 1;
      if (nextIndex >= stepExecutionState.pendingEffects.length) {
        // All effects executed
        finishStepExecution();
      } else {
        const nextEffect = stepExecutionState.pendingEffects[nextIndex];
        setStepExecutionState({
          ...stepExecutionState,
          currentEffectIndex: nextIndex,
          executedEffects: [...stepExecutionState.executedEffects, effectResult],
          currentTabId: nextEffect.tabId,
          currentEffectId: nextEffect.effectId
        });
        setCurrentFocusedTab(nextEffect.tabId);
        
        // Switch to the next tab
        if (gameLoopRef.current) {
          gameLoopRef.current.switchToTab(nextEffect.tabId);
          setGameState(gameLoopRef.current.getState());
        }
      }
    } catch (error) {
      console.error('Error executing effect:', error);
      // Skip this effect and move to next
      const nextIndex = stepExecutionState.currentEffectIndex + 1;
      if (nextIndex >= stepExecutionState.pendingEffects.length) {
        finishStepExecution();
      } else {
        const nextEffect = stepExecutionState.pendingEffects[nextIndex];
        setStepExecutionState({
          ...stepExecutionState,
          currentEffectIndex: nextIndex,
          currentTabId: nextEffect.tabId,
          currentEffectId: nextEffect.effectId
        });
        setCurrentFocusedTab(nextEffect.tabId);
        
        // Switch to the next tab (error case)
        if (gameLoopRef.current) {
          gameLoopRef.current.switchToTab(nextEffect.tabId);
          setGameState(gameLoopRef.current.getState());
        }
      }
    }
  }, [stepExecutionState, gameState]);

  const finishStepExecution = useCallback(() => {
    if (!gameLoopRef.current) return;

    // Calculate final results
    const runResult: RunResult = {
      basePoints: 0, // Will be calculated from executed effects
      synergyBonus: 0,
      efficiencyBonus: 0,
      goalBonus: 0,
      totalPoints: stepExecutionState?.executedEffects.reduce((sum, effect) => sum + (effect.pointsGenerated || 0), 0) || 0,
      completedInteractions: [],
      burnedOutTabs: []
    };

    setLastRunResult(runResult);
    setStepExecutionState(null);
    setCurrentFocusedTab(null);

    // Transition to discovery
    if (gameLoopRef.current) {
      gameLoopRef.current.startDiscoveryPhase();
      setGameState(gameLoopRef.current.getState());
    }
  }, [stepExecutionState]);

  const cancelStepExecution = useCallback(() => {
    if (!gameLoopRef.current) return;

    setStepExecutionState(null);
    setCurrentFocusedTab(null);
    
    // Return to discovery phase
    gameLoopRef.current.startDiscoveryPhase();
    setGameState(gameLoopRef.current.getState());
  }, []);

  const reset = useCallback(() => {
    const newState = createInitialState(config);
    setGameState(newState);
    setIsAnimating(false);
    setLastRunResult(null);
    setEmergentBehaviors([]);
    setStepExecutionState(null);
    
    // Reinitialize GameLoop with new state
    if (gameLoopRef.current) {
      const events: GameLoopEvents = {
        onPhaseChange: (phase: GamePhase) => {
          setGameState(prev => ({ ...prev, phase }));
        },
        onEffectExecuted: (result: EffectResult) => {
          if (gameLoopRef.current) {
            setGameState(gameLoopRef.current.getState());
          }
        },
        onEmergentBehavior: (result: EmergentDetectionResult) => {
          setEmergentBehaviors(prev => [...prev, result]);
        },
        onRunComplete: (result: RunResult) => {
          setLastRunResult(result);
          setIsAnimating(false);
          if (gameLoopRef.current) {
            setGameState(gameLoopRef.current.getState());
            
            // Deterministic transition back to discovery phase
            gameLoopRef.current.startDiscoveryPhase();
            setGameState(gameLoopRef.current.getState());
          }
        },
        onTabSpawned: (tab: Tab) => {
          if (gameLoopRef.current) {
            setGameState(gameLoopRef.current.getState());
          }
        },
        onTabModified: (tabId: string, changes: Partial<Tab>) => {
          if (gameLoopRef.current) {
            setGameState(gameLoopRef.current.getState());
          }
        }
      };
      
      gameLoopRef.current = new GameLoop(newState, config, events);
    }
  }, [config]);

  const actions: GameEngineActions = {
    startDiscoveryPhase,
    executeRun,
    startStepExecution,
    executeNextStep,
    cancelStepExecution,
    openTab,
    closeTab,
    switchTab,
    reset
  };

  return {
    gameState,
    isAnimating,
    lastRunResult,
    emergentBehaviors,
    currentFocusedTab,
    stepExecutionState,
    actions
  };
}
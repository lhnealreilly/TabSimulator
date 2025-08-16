import { useState, useRef, useCallback, useEffect } from 'react';
import { GameState, GamePhase, GameConfig, RunResult } from '../types/game';
import { Tab, TabType } from '../types/tabs';
import { EffectResult } from '../types/effects';
import { GameLoop, GameLoopEvents } from '../engine/GameLoop';
import { EmergentDetectionResult } from '../effects/EmergentBehaviorDetector';

export interface GameEngineActions {
  // Phase Control
  startDiscoveryPhase: () => void;
  executeRun: () => Promise<RunResult>;
  
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
        }
      },
      
      onTabSpawned: (tab: Tab) => {
        console.log('Tab spawned event:', tab);
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
      }
    };

    const initialState = createInitialState(config);
    gameLoopRef.current = new GameLoop(initialState, config, events);
    console.log('GameLoop initialized with state:', initialState);
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
    console.log('openTab called with linkId:', linkId);
    if (!gameLoopRef.current) {
      console.log('No gameLoopRef.current');
      return null;
    }
    
    try {
      console.log('Current game state phase:', gameLoopRef.current.getCurrentPhase());
      console.log('Current tabs:', gameLoopRef.current.getState().tabs);
      const newTab = gameLoopRef.current.openTabFromLink(linkId);
      console.log('New tab created:', newTab);
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

  const reset = useCallback(() => {
    const newState = createInitialState(config);
    setGameState(newState);
    setIsAnimating(false);
    setLastRunResult(null);
    setEmergentBehaviors([]);
    
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
    actions
  };
}
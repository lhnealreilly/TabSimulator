import { Tab } from './tabs';
import { Upgrade } from './upgrades';

export type GamePhase = 'discovery' | 'running' | 'scoring' | 'idle';

export interface GameState {
  tabs: Tab[];
  resources: Resources;
  upgrades: Upgrade[];
  currentGoal: RoundGoal | null;
  score: number;
  round: number;
  phase: GamePhase;
  runTimer?: number;
  gameTime: number;
  isRunning: boolean;
}

export interface Resources {
  ram: {
    current: number;
    max: number;
  };
  productivity: number;
  focus: number;
  willpower: number;
}

export interface RoundGoal {
  id: string;
  title: string;
  description: string;
  targetScore: number;
  specialRequirements?: GoalRequirement[];
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GoalRequirement {
  type: 'minTabs' | 'maxTabs' | 'tabType' | 'maxRam' | 'synergy';
  value: number | string;
  description: string;
}

export interface RunResult {
  basePoints: number;
  synergyBonus: number;
  efficiencyBonus: number;
  goalBonus: number;
  totalPoints: number;
  completedInteractions: TabInteraction[];
  burnedOutTabs: string[];
}

export interface TabInteraction {
  sourceTabId: string;
  targetTabId: string;
  interactionType: string;
  pointsGenerated: number;
  description: string;
}

export interface GameConfig {
  baseRamMax: number;
  baseProductivity: number;
  baseFocus: number;
  baseWillpower: number;
  tickRate: number;
  runPhaseDuration: number;
  discoveryPhaseDuration?: number;
}

export interface GameStats {
  totalTabsOpened: number;
  totalTabsClosed: number;
  totalRamRecovered: number;
  highestTabCount: number;
  totalRunsCompleted: number;
  highestScore: number;
  goalsCompleted: number;
  favoriteTabType: string;
}
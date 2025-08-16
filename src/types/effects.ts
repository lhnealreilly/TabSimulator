import { GameState, Resources } from './game';
import { Tab } from './tabs';

export type Effect = (gameState: GameState, context: EffectContext) => GameState;

export interface EffectContext {
  sourceTabId: string;
  runPhaseTime: number;
  previousEffects: EffectResult[];
  availableTabs: Tab[];
  deltaTime: number;
}

export interface EffectResult {
  tabId: string;
  effectId: string;
  effect: string;
  pointsGenerated: number;
  resourcesChanged: Partial<Resources>;
  newTabsSpawned?: Tab[];
  tabsModified?: string[];
  emergentBehaviors?: string[];
  timestamp: number;
}

export interface TabEffect {
  id: string;
  name: string;
  description: string;
  trigger: EffectTrigger;
  execute: Effect;
  rarity: EffectRarity;
  tags: string[];
  cooldown?: number;
  maxUses?: number;
}

export type EffectRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type EffectTrigger = 
  | { type: 'immediate' }
  | { type: 'conditional'; condition: (gameState: GameState) => boolean }
  | { type: 'reactive'; reactsTo: string[] };

export interface EffectRegistry {
  getEffect(id: string): TabEffect | undefined;
  getEffectsByTag(tag: string): TabEffect[];
  getEffectsByRarity(rarity: EffectRarity): TabEffect[];
  getAllEffects(): TabEffect[];
  registerEffect(effect: TabEffect): void;
}

export interface EmergentBehavior {
  id: string;
  name: string;
  description: string;
  conditions: EmergentCondition[];
  bonus: EmergentBonus;
  discoveredAt?: number;
}

export interface EmergentCondition {
  type: 'tabCount' | 'effectSequence' | 'timeWindow' | 'resourceThreshold';
  params: Record<string, any>;
}

export interface EmergentBonus {
  points: number;
  resourceMultiplier?: number;
  unlockEffect?: string;
  description: string;
}

export interface EffectExecution {
  effectId: string;
  tabId: string;
  scheduledTime: number;
  executed: boolean;
  result?: EffectResult;
}
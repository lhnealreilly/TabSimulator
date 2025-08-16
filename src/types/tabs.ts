export enum TabType {
  NEWS = 'news',
  SHOPPING = 'shopping', 
  SOCIAL = 'social',
  WORK = 'work',
  RESEARCH = 'research'
}

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  content: TabContent;
  ramUsage: number;
  isActive: boolean;
  hasRunThisRound: boolean;
  burnoutChance: number;
  effects: string[];
  effectState: TabEffectState;
  createdAt: number;
  modifiedAt?: number;
}

export interface TabContent {
  title: string;
  description: string;
  availableLinks: Link[];
  runBehavior: RunBehavior;
  isHijacked?: boolean;
  originalTitle?: string;
}

export interface TabEffectState {
  cooldowns: Record<string, number>;
  usageCount: Record<string, number>;
  lastTriggered: Record<string, number>;
  persistentData: Record<string, any>;
}

export interface Link {
  id: string;
  title: string;
  targetTabType: TabType;
  discoveryChance: number;
  ramCost: number;
  isHidden?: boolean;
  requiresTab?: TabType;
  effectsToGrant?: string[];
  rarity?: 'common' | 'rare' | 'legendary';
}

export interface RunBehavior {
  basePoints: number;
  resourceDrain: number;
  description: string;
}

export interface TabTemplate {
  type: TabType;
  titleTemplates: string[];
  descriptionTemplates: string[];
  baseRamUsage: number;
  baseEffects: string[];
  linkTemplates: LinkTemplate[];
  spawnWeight: number;
}

export interface LinkTemplate {
  titleTemplate: string;
  targetType: TabType;
  ramCostRange: [number, number];
  discoveryChance: number;
  effectsToGrant?: string[];
}

export interface TabConfig {
  type: TabType;
  baseRamUsage: number;
  baseSpawnChance: number;
  titleTemplates: string[];
  productivityImpact: number;
  focusImpact: number;
}

export interface TabSpawnEvent {
  parentTabId: string;
  spawnedTabType: TabType;
  timestamp: number;
}

export const TAB_CONFIGS: Record<TabType, TabConfig> = {
  [TabType.NEWS]: {
    type: TabType.NEWS,
    baseRamUsage: 50,
    baseSpawnChance: 0.15,
    titleTemplates: ['Breaking News', 'Latest Updates', 'Trending Now'],
    productivityImpact: -5,
    focusImpact: -10
  },
  [TabType.SHOPPING]: {
    type: TabType.SHOPPING,
    baseRamUsage: 75,
    baseSpawnChance: 0.10,
    titleTemplates: ['Flash Sale!', 'Limited Time Offer', 'Your Cart'],
    productivityImpact: -10,
    focusImpact: -15
  },
  [TabType.SOCIAL]: {
    type: TabType.SOCIAL,
    baseRamUsage: 100,
    baseSpawnChance: 0.20,
    titleTemplates: ['New Notification', 'Someone messaged you', 'Check this out'],
    productivityImpact: -15,
    focusImpact: -20
  },
  [TabType.WORK]: {
    type: TabType.WORK,
    baseRamUsage: 40,
    baseSpawnChance: 0.05,
    titleTemplates: ['Project Dashboard', 'Team Meeting', 'Task List'],
    productivityImpact: 10,
    focusImpact: 5
  },
  [TabType.RESEARCH]: {
    type: TabType.RESEARCH,
    baseRamUsage: 30,
    baseSpawnChance: 0.08,
    titleTemplates: ['Documentation', 'Tutorial', 'Stack Overflow'],
    productivityImpact: 5,
    focusImpact: 10
  }
};
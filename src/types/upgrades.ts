export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: UpgradeCost;
  effect: UpgradeEffect;
  purchased: boolean;
  tier: number;
  prerequisites?: string[];
}

export interface UpgradeCost {
  willpower?: number;
  productivity?: number;
  focus?: number;
}

export interface UpgradeEffect {
  ramIncrease?: number;
  maxRamMultiplier?: number;
  spawnRateReduction?: number;
  willpowerRegen?: number;
  focusRegen?: number;
  productivityMultiplier?: number;
  autoCloseEnabled?: boolean;
  autoCloseThreshold?: number;
}

export enum UpgradeCategory {
  MEMORY = 'memory',
  EFFICIENCY = 'efficiency',
  AUTOMATION = 'automation',
  WILLPOWER = 'willpower'
}

export interface UpgradeDefinition extends Upgrade {
  category: UpgradeCategory;
  icon?: string;
  unlockCondition?: UnlockCondition;
}

export interface UnlockCondition {
  minLevel?: number;
  minTabs?: number;
  minGameTime?: number;
  requiredUpgrades?: string[];
}
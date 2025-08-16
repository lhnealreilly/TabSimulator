import { GameState } from '../types/game';
import { EffectResult, EmergentBehavior, EmergentCondition } from '../types/effects';
import { effectRegistry } from './EffectRegistry';

export interface EmergentDetectionResult {
  triggeredBehaviors: EmergentBehavior[];
  newlyDiscovered: EmergentBehavior[];
  totalBonus: number;
  descriptions: string[];
}

export class EmergentBehaviorDetector {
  private discoveredBehaviors: Set<string> = new Set();
  private effectHistory: EffectResult[] = [];
  private maxHistorySize = 50;

  detectEmergentBehaviors(
    gameState: GameState, 
    recentEffects: EffectResult[]
  ): EmergentDetectionResult {
    // Add new effects to history
    this.effectHistory.push(...recentEffects);
    if (this.effectHistory.length > this.maxHistorySize) {
      this.effectHistory = this.effectHistory.slice(-this.maxHistorySize);
    }

    const triggeredBehaviors: EmergentBehavior[] = [];
    const newlyDiscovered: EmergentBehavior[] = [];
    let totalBonus = 0;
    const descriptions: string[] = [];

    const allBehaviors = effectRegistry.getAllEmergentBehaviors();

    for (const behavior of allBehaviors) {
      if (this.checkConditions(behavior.conditions, gameState, recentEffects)) {
        triggeredBehaviors.push(behavior);
        totalBonus += behavior.bonus.points;
        descriptions.push(behavior.bonus.description);

        // Check if this is newly discovered
        if (!this.discoveredBehaviors.has(behavior.id)) {
          this.discoveredBehaviors.add(behavior.id);
          newlyDiscovered.push(behavior);
        }
      }
    }

    return {
      triggeredBehaviors,
      newlyDiscovered,
      totalBonus,
      descriptions
    };
  }

  getDiscoveredBehaviors(): string[] {
    return Array.from(this.discoveredBehaviors);
  }

  private checkConditions(
    conditions: EmergentCondition[], 
    gameState: GameState, 
    recentEffects: EffectResult[]
  ): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'tabCount':
          return this.checkTabCount(condition.params, gameState);
        
        case 'effectSequence':
          return this.checkEffectSequence(condition.params, recentEffects);
        
        case 'timeWindow':
          return this.checkTimeWindow(condition.params, recentEffects);
        
        case 'resourceThreshold':
          return this.checkResourceThreshold(condition.params, gameState);
        
        default:
          return false;
      }
    });
  }

  private checkTabCount(params: any, gameState: GameState): boolean {
    const { tabType, count, minCount, maxCount } = params;
    
    const tabCount = gameState.tabs.filter(tab => 
      tab.type === tabType || (tabType === 'any')
    ).length;

    if (count !== undefined) {
      return tabCount === count;
    }
    
    if (minCount !== undefined && tabCount < minCount) {
      return false;
    }
    
    if (maxCount !== undefined && tabCount > maxCount) {
      return false;
    }
    
    return true;
  }

  private checkEffectSequence(params: any, recentEffects: EffectResult[]): boolean {
    const { effects, order = 'any', within } = params;
    
    if (order === 'strict') {
      // Effects must occur in exact order
      let effectIndex = 0;
      for (const effect of recentEffects) {
        if (effect.effectId === effects[effectIndex]) {
          effectIndex++;
          if (effectIndex >= effects.length) {
            return true;
          }
        }
      }
      return false;
    } else {
      // Effects must all be present, order doesn't matter
      const requiredEffects = new Set(effects);
      const foundEffects = new Set();
      
      for (const effect of recentEffects) {
        if (requiredEffects.has(effect.effectId)) {
          foundEffects.add(effect.effectId);
        }
      }
      
      return foundEffects.size === requiredEffects.size;
    }
  }

  private checkTimeWindow(params: any, recentEffects: EffectResult[]): boolean {
    const { window } = params;
    const now = Date.now();
    
    const effectsInWindow = recentEffects.filter(effect => 
      (now - effect.timestamp) <= window
    );
    
    return effectsInWindow.length >= 2; // At least 2 effects in time window
  }

  private checkResourceThreshold(params: any, gameState: GameState): boolean {
    const { resource, above, below, equals } = params;
    
    let value: number;
    switch (resource) {
      case 'willpower':
        value = gameState.resources.willpower;
        break;
      case 'focus':
        value = gameState.resources.focus;
        break;
      case 'productivity':
        value = gameState.resources.productivity;
        break;
      case 'ram':
        value = gameState.resources.ram.current;
        break;
      case 'ramPercent':
        value = (gameState.resources.ram.current / gameState.resources.ram.max) * 100;
        break;
      default:
        return false;
    }

    if (above !== undefined && value <= above) {
      return false;
    }
    
    if (below !== undefined && value >= below) {
      return false;
    }
    
    if (equals !== undefined && value !== equals) {
      return false;
    }
    
    return true;
  }

  // Advanced pattern detection
  detectPatterns(recentEffects: EffectResult[]): string[] {
    const patterns: string[] = [];
    
    // Detect alternating patterns
    if (this.detectAlternatingPattern(recentEffects)) {
      patterns.push('Alternating work-distraction pattern detected');
    }
    
    // Detect cascading effects
    if (this.detectCascade(recentEffects)) {
      patterns.push('Effect cascade - one action triggered many others');
    }
    
    // Detect resource spiral
    if (this.detectResourceSpiral(recentEffects)) {
      patterns.push('Resource death spiral - negative feedback loop');
    }
    
    return patterns;
  }

  private detectAlternatingPattern(effects: EffectResult[]): boolean {
    if (effects.length < 4) return false;
    
    const recentFour = effects.slice(-4);
    const workPattern = recentFour.filter((_, i) => i % 2 === 0)
      .every(e => e.effectId.includes('work'));
    const distractionPattern = recentFour.filter((_, i) => i % 2 === 1)
      .every(e => e.effectId.includes('social') || e.effectId.includes('shopping'));
    
    return workPattern && distractionPattern;
  }

  private detectCascade(effects: EffectResult[]): boolean {
    if (effects.length < 3) return false;
    
    const timeWindows = effects.map(e => Math.floor(e.timestamp / 1000));
    const uniqueWindows = new Set(timeWindows);
    
    // If many effects happened in few time windows, it's a cascade
    return effects.length >= 5 && uniqueWindows.size <= 2;
  }

  private detectResourceSpiral(effects: EffectResult[]): boolean {
    if (effects.length < 3) return false;
    
    let consecutiveNegative = 0;
    for (const effect of effects.slice(-5)) {
      const hasNegativeResource = Object.values(effect.resourcesChanged).some(v => 
        typeof v === 'number' && v < 0
      );
      
      if (hasNegativeResource) {
        consecutiveNegative++;
      } else {
        consecutiveNegative = 0;
      }
    }
    
    return consecutiveNegative >= 3;
  }

  reset(): void {
    this.discoveredBehaviors.clear();
    this.effectHistory = [];
  }
}
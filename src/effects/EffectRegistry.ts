import { TabEffect, EffectRegistry, EffectRarity, EmergentBehavior } from '../types/effects';
import { BASE_EFFECTS } from './baseEffects';

export class EffectRegistryImpl implements EffectRegistry {
  private effects: Map<string, TabEffect> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private rarityIndex: Map<EffectRarity, Set<string>> = new Map();
  private emergentBehaviors: Map<string, EmergentBehavior> = new Map();

  constructor() {
    this.initializeRarityIndex();
    this.loadBaseEffects();
    this.loadEmergentBehaviors();
  }

  getEffect(id: string): TabEffect | undefined {
    return this.effects.get(id);
  }

  getEffectsByTag(tag: string): TabEffect[] {
    const effectIds = this.tagIndex.get(tag) || new Set();
    return Array.from(effectIds)
      .map(id => this.effects.get(id))
      .filter((effect): effect is TabEffect => effect !== undefined);
  }

  getEffectsByRarity(rarity: EffectRarity): TabEffect[] {
    const effectIds = this.rarityIndex.get(rarity) || new Set();
    return Array.from(effectIds)
      .map(id => this.effects.get(id))
      .filter((effect): effect is TabEffect => effect !== undefined);
  }

  getAllEffects(): TabEffect[] {
    return Array.from(this.effects.values());
  }

  registerEffect(effect: TabEffect): void {
    this.effects.set(effect.id, effect);
    
    // Update tag index
    effect.tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(effect.id);
    });
    
    // Update rarity index
    if (!this.rarityIndex.has(effect.rarity)) {
      this.rarityIndex.set(effect.rarity, new Set());
    }
    this.rarityIndex.get(effect.rarity)!.add(effect.id);
  }

  // Emergent Behavior Management
  getEmergentBehavior(id: string): EmergentBehavior | undefined {
    return this.emergentBehaviors.get(id);
  }

  getAllEmergentBehaviors(): EmergentBehavior[] {
    return Array.from(this.emergentBehaviors.values());
  }

  registerEmergentBehavior(behavior: EmergentBehavior): void {
    this.emergentBehaviors.set(behavior.id, behavior);
  }

  // Random Effect Selection
  getRandomEffectByRarity(rarity: EffectRarity): TabEffect | undefined {
    const effects = this.getEffectsByRarity(rarity);
    if (effects.length === 0) return undefined;
    
    return effects[Math.floor(Math.random() * effects.length)];
  }

  getRandomEffectByTag(tag: string): TabEffect | undefined {
    const effects = this.getEffectsByTag(tag);
    if (effects.length === 0) return undefined;
    
    return effects[Math.floor(Math.random() * effects.length)];
  }

  // Weighted random selection based on rarity
  getRandomEffect(): TabEffect | undefined {
    const rarityWeights = {
      common: 0.6,
      uncommon: 0.25,
      rare: 0.12,
      legendary: 0.03
    };
    
    const random = Math.random();
    let accumulated = 0;
    
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      accumulated += weight;
      if (random <= accumulated) {
        return this.getRandomEffectByRarity(rarity as EffectRarity);
      }
    }
    
    return this.getRandomEffectByRarity('common');
  }

  // Effect Discovery System
  discoverEffectsForTab(tabType: string, currentEffects: string[]): string[] {
    const discovered: string[] = [];
    
    // Base effects for tab type
    const baseEffects = this.getEffectsByTag(tabType.toLowerCase());
    baseEffects.forEach(effect => {
      if (!currentEffects.includes(effect.id)) {
        discovered.push(effect.id);
      }
    });
    
    // Random chance for rare effects
    if (Math.random() < 0.1) {
      const rareEffect = this.getRandomEffectByRarity('rare');
      if (rareEffect && !currentEffects.includes(rareEffect.id)) {
        discovered.push(rareEffect.id);
      }
    }
    
    // Legendary effects have very low chance
    if (Math.random() < 0.01) {
      const legendaryEffect = this.getRandomEffectByRarity('legendary');
      if (legendaryEffect && !currentEffects.includes(legendaryEffect.id)) {
        discovered.push(legendaryEffect.id);
      }
    }
    
    return discovered;
  }

  private initializeRarityIndex(): void {
    this.rarityIndex.set('common', new Set());
    this.rarityIndex.set('uncommon', new Set());
    this.rarityIndex.set('rare', new Set());
    this.rarityIndex.set('legendary', new Set());
  }

  private loadBaseEffects(): void {
    BASE_EFFECTS.forEach(effect => {
      this.registerEffect(effect);
    });
  }

  private loadEmergentBehaviors(): void {
    const behaviors: EmergentBehavior[] = [
      {
        id: 'news-cascade',
        name: 'News Cascade',
        description: 'Multiple news tabs create a information avalanche',
        conditions: [
          { type: 'tabCount', params: { tabType: 'news', count: 4 } }
        ],
        bonus: {
          points: 150,
          resourceMultiplier: 0.8,
          description: 'Information overload reduces focus but generates massive points'
        }
      },
      {
        id: 'productivity-flow',
        name: 'Flow State',
        description: 'Perfect balance of work and research tabs',
        conditions: [
          { type: 'tabCount', params: { tabType: 'work', count: 2 } },
          { type: 'tabCount', params: { tabType: 'research', count: 2 } }
        ],
        bonus: {
          points: 200,
          resourceMultiplier: 1.5,
          description: 'Perfect focus multiplies all resource generation'
        }
      },
      {
        id: 'chaos-theory',
        name: 'Digital Chaos',
        description: 'When everything goes wrong, something beautiful emerges',
        conditions: [
          { type: 'effectSequence', params: { effects: ['hacker-chaos', 'social-viral'] } },
          { type: 'resourceThreshold', params: { resource: 'willpower', below: 20 } }
        ],
        bonus: {
          points: 500,
          unlockEffect: 'chaos-master',
          description: 'Embrace the chaos and unlock new possibilities'
        }
      },
      {
        id: 'viral-economy',
        name: 'Viral Marketing Economy',
        description: 'Social content drives shopping behavior',
        conditions: [
          { type: 'effectSequence', params: { effects: ['social-viral', 'shopping-base'] } },
          { type: 'timeWindow', params: { window: 3000 } }
        ],
        bonus: {
          points: 100,
          resourceMultiplier: 1.2,
          description: 'Viral content creates purchasing impulses'
        }
      }
    ];

    behaviors.forEach(behavior => {
      this.registerEmergentBehavior(behavior);
    });
  }
}

// Global registry instance
export const effectRegistry = new EffectRegistryImpl();
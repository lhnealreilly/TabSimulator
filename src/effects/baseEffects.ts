import { TabEffect, Effect, EffectContext } from '../types/effects';
import { GameState } from '../types/game';
import { TabType } from '../types/tabs';

// News Tab Effects
export const newsBaseEffect: TabEffect = {
  id: 'news-base',
  name: 'Breaking News',
  description: 'Generates base points and synergizes with other news tabs',
  trigger: { type: 'immediate' },
  rarity: 'common',
  tags: ['news', 'base', 'synergy'],
  execute: (gameState: GameState, context: EffectContext): GameState => {
    const otherNewsTabs = gameState.tabs.filter(t => 
      t.type === TabType.NEWS && t.id !== context.sourceTabId
    );
    
    const basePoints = 10;
    const synergyBonus = otherNewsTabs.length * 5;
    
    // Spawn breaking news tab if 3+ news tabs
    let newTabs = gameState.tabs;
    if (otherNewsTabs.length >= 2) {
      const breakingNewsTab = {
        id: `breaking-news-${Date.now()}`,
        type: TabType.NEWS,
        title: 'BREAKING: Major Story Developing',
        content: {
          title: 'Breaking News Alert',
          description: 'Multiple news sources are covering this developing story',
          availableLinks: [],
          runBehavior: { basePoints: 25, resourceDrain: 5, description: 'Breaking news generates high points' }
        },
        ramUsage: 60,
        isActive: false,
        hasRunThisRound: false,
        burnoutChance: 0.3,
        effects: ['news-breaking'],
        effectState: { cooldowns: {}, usageCount: {}, lastTriggered: {}, persistentData: {} },
        createdAt: Date.now()
      };
      newTabs = [...gameState.tabs, breakingNewsTab];
    }
    
    return {
      ...gameState,
      score: gameState.score + basePoints + synergyBonus,
      tabs: newTabs
    };
  }
};

export const newsInvestigativeEffect: TabEffect = {
  id: 'news-investigative',
  name: 'Investigative Journalism',
  description: 'Deep research that pays off when combined with multiple sources',
  trigger: { type: 'conditional', condition: (gs) => gs.tabs.filter(t => t.type === TabType.NEWS).length >= 2 },
  rarity: 'uncommon',
  tags: ['news', 'research', 'conditional'],
  execute: (gameState: GameState, context: EffectContext): GameState => {
    const newsTabCount = gameState.tabs.filter(t => t.type === TabType.NEWS).length;
    const researchTabCount = gameState.tabs.filter(t => t.type === TabType.RESEARCH).length;
    
    const multiplier = 1 + (newsTabCount * 0.2) + (researchTabCount * 0.3);
    const points = Math.floor(30 * multiplier);
    
    return {
      ...gameState,
      score: gameState.score + points,
      resources: {
        ...gameState.resources,
        focus: Math.min(100, gameState.resources.focus + 5)
      }
    };
  }
};

// Shopping Tab Effects
export const shoppingBaseEffect: TabEffect = {
  id: 'shopping-base',
  name: 'Deal Hunter',
  description: 'Finds deals and compares prices with other shopping tabs',
  trigger: { type: 'immediate' },
  rarity: 'common',
  tags: ['shopping', 'base', 'deals'],
  execute: (gameState: GameState, context: EffectContext): GameState => {
    const otherShoppingTabs = gameState.tabs.filter(t => 
      t.type === TabType.SHOPPING && t.id !== context.sourceTabId
    );
    
    const basePoints = 8;
    const dealBonus = otherShoppingTabs.length >= 2 ? 20 : 0;
    
    return {
      ...gameState,
      score: gameState.score + basePoints + dealBonus,
      resources: {
        ...gameState.resources,
        willpower: Math.max(0, gameState.resources.willpower - 3)
      }
    };
  }
};

export const shoppingCartAbandonEffect: TabEffect = {
  id: 'shopping-cart-abandon',
  name: 'Cart Abandonment',
  description: 'High willpower cost but spawns retargeting ads',
  trigger: { type: 'conditional', condition: (gs) => gs.resources.willpower < 30 },
  rarity: 'uncommon',
  tags: ['shopping', 'willpower', 'spawn'],
  execute: (gameState: GameState, context: EffectContext): GameState => {
    // Spawn retargeting ad tabs
    const adTab = {
      id: `retarget-ad-${Date.now()}`,
      type: TabType.SHOPPING,
      title: 'You left items in your cart!',
      content: {
        title: 'Retargeting Advertisement',
        description: 'Come back and complete your purchase!',
        availableLinks: [],
        runBehavior: { basePoints: 5, resourceDrain: 8, description: 'Ads are persistent but annoying' }
      },
      ramUsage: 25,
      isActive: false,
      hasRunThisRound: false,
      burnoutChance: 0.1,
      effects: ['shopping-retarget'],
      effectState: { cooldowns: {}, usageCount: {}, lastTriggered: {}, persistentData: {} },
      createdAt: Date.now()
    };
    
    return {
      ...gameState,
      tabs: [...gameState.tabs, adTab],
      resources: {
        ...gameState.resources,
        willpower: Math.max(0, gameState.resources.willpower - 15)
      }
    };
  }
};

// Social Media Effects
export const socialBaseEffect: TabEffect = {
  id: 'social-base',
  name: 'Social Feed',
  description: 'Generates points but drains focus',
  trigger: { type: 'immediate' },
  rarity: 'common',
  tags: ['social', 'base', 'focus-drain'],
  execute: (gameState: GameState, context: EffectContext): GameState => {
    return {
      ...gameState,
      score: gameState.score + 12,
      resources: {
        ...gameState.resources,
        focus: Math.max(0, gameState.resources.focus - 5),
        productivity: Math.max(0, gameState.resources.productivity - 3)
      }
    };
  }
};

export const socialViralEffect: TabEffect = {
  id: 'social-viral',
  name: 'Viral Content',
  description: 'Creates viral content when combined with news or shopping',
  trigger: { type: 'reactive', reactsTo: ['news-base', 'shopping-base'] },
  rarity: 'rare',
  tags: ['social', 'viral', 'emergent'],
  execute: (gameState: GameState, context: EffectContext): GameState => {
    const hasNews = context.previousEffects.some(e => e.effectId.includes('news'));
    const hasShopping = context.previousEffects.some(e => e.effectId.includes('shopping'));
    
    let bonus = 15;
    let emergentBehavior: string | undefined;
    
    if (hasNews && hasShopping) {
      bonus = 100;
      emergentBehavior = 'Influencer Product Placement - News story drives shopping trend!';
    } else if (hasNews) {
      bonus = 35;
      emergentBehavior = 'News goes viral on social media';
    } else if (hasShopping) {
      bonus = 25;
      emergentBehavior = 'Product recommendation spreads';
    }
    
    return {
      ...gameState,
      score: gameState.score + bonus,
      resources: {
        ...gameState.resources,
        focus: Math.max(0, gameState.resources.focus - 10)
      }
    };
  }
};

// Work Tab Effects
export const workBaseEffect: TabEffect = {
  id: 'work-base',
  name: 'Productivity',
  description: 'Generates points and restores focus',
  trigger: { type: 'immediate' },
  rarity: 'common',
  tags: ['work', 'base', 'focus-restore'],
  execute: (gameState: GameState, context: EffectContext): GameState => {
    const workTabCount = gameState.tabs.filter(t => t.type === TabType.WORK).length;
    const collaborationBonus = workTabCount >= 2 ? 15 : 0;
    
    return {
      ...gameState,
      score: gameState.score + 15 + collaborationBonus,
      resources: {
        ...gameState.resources,
        focus: Math.min(100, gameState.resources.focus + 8),
        productivity: Math.min(100, gameState.resources.productivity + 5)
      }
    };
  }
};

// Research Tab Effects
export const researchBaseEffect: TabEffect = {
  id: 'research-base',
  name: 'Citation Boost',
  description: 'Enhances all other tabs with research citations',
  trigger: { type: 'immediate' },
  rarity: 'common',
  tags: ['research', 'base', 'boost'],
  execute: (gameState: GameState, context: EffectContext): GameState => {
    const otherTabs = gameState.tabs.filter(t => 
      t.id !== context.sourceTabId && t.type !== TabType.RESEARCH
    );
    
    const citationBonus = otherTabs.length * 3;
    
    return {
      ...gameState,
      score: gameState.score + 8 + citationBonus,
      resources: {
        ...gameState.resources,
        focus: Math.min(100, gameState.resources.focus + 3)
      }
    };
  }
};

// Chaos/Special Effects
export const hackerEffect: TabEffect = {
  id: 'hacker-chaos',
  name: 'Tab Hijacker',
  description: 'Randomly hijacks other tabs and changes their behavior',
  trigger: { type: 'immediate' },
  rarity: 'legendary',
  tags: ['chaos', 'modify', 'hijack'],
  execute: (gameState: GameState, context: EffectContext): GameState => {
    const hackableTabds = gameState.tabs.filter(t => 
      t.id !== context.sourceTabId && !t.content.isHijacked
    );
    
    if (hackableTabds.length === 0) {
      return { ...gameState, score: gameState.score + 10 };
    }
    
    const targetTab = hackableTabds[Math.floor(Math.random() * hackableTabds.length)];
    
    const modifiedTabs = gameState.tabs.map(tab => {
      if (tab.id === targetTab.id) {
        return {
          ...tab,
          content: {
            ...tab.content,
            title: `HACKED: ${tab.content.title}`,
            isHijacked: true,
            originalTitle: tab.content.title
          },
          modifiedAt: Date.now()
        };
      }
      return tab;
    });
    
    return {
      ...gameState,
      tabs: modifiedTabs,
      score: gameState.score + 25,
      resources: {
        ...gameState.resources,
        willpower: Math.max(0, gameState.resources.willpower - 10)
      }
    };
  }
};

export const BASE_EFFECTS: TabEffect[] = [
  newsBaseEffect,
  newsInvestigativeEffect,
  shoppingBaseEffect,
  shoppingCartAbandonEffect,
  socialBaseEffect,
  socialViralEffect,
  workBaseEffect,
  researchBaseEffect,
  hackerEffect
];
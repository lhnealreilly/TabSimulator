import { GameState, GamePhase, GameConfig, RunResult, TabInteraction } from '../types/game';
import { Tab, TabType } from '../types/tabs';
import { Effect, EffectContext, EffectResult } from '../types/effects';
import { effectRegistry } from '../effects/EffectRegistry';
import { EmergentBehaviorDetector, EmergentDetectionResult } from '../effects/EmergentBehaviorDetector';

export interface GameLoopEvents {
  onPhaseChange: (phase: GamePhase) => void;
  onEffectExecuted: (result: EffectResult) => void;
  onEmergentBehavior: (result: EmergentDetectionResult) => void;
  onRunComplete: (result: RunResult) => void;
  onTabSpawned: (tab: Tab) => void;
  onTabModified: (tabId: string, changes: Partial<Tab>) => void;
  onTabFocus: (tabId: string) => void; // Simple tab focus event for camera
}

export class GameLoop {
  private gameState: GameState;
  private config: GameConfig;
  private events: Partial<GameLoopEvents>;
  private emergentDetector: EmergentBehaviorDetector;
  
  constructor(initialState: GameState, config: GameConfig, events: Partial<GameLoopEvents> = {}) {
    this.gameState = { ...initialState };
    this.config = config;
    this.events = events;
    this.emergentDetector = new EmergentBehaviorDetector();
  }

  // Public API
  getState(): GameState {
    return { ...this.gameState };
  }

  setState(newState: GameState): void {
    this.gameState = { ...newState };
  }

  getCurrentPhase(): GamePhase {
    return this.gameState.phase;
  }

  // Phase Transitions
  startDiscoveryPhase(): void {
    if (this.gameState.phase !== 'idle' && this.gameState.phase !== 'scoring') {
      throw new Error(`Cannot start discovery from phase: ${this.gameState.phase}`);
    }

    this.gameState = {
      ...this.gameState,
      phase: 'discovery'
    };

    this.events.onPhaseChange?.('discovery');
  }

  executeRunPhase(): RunResult {
    if (this.gameState.phase !== 'discovery') {
      throw new Error(`Cannot start run from phase: ${this.gameState.phase}`);
    }

    if (this.gameState.tabs.length === 0) {
      throw new Error('Cannot run with no tabs');
    }

    // Transition to run phase
    this.gameState = {
      ...this.gameState,
      phase: 'running'
    };

    this.events.onPhaseChange?.('running');

    // Execute all effects in deterministic order with visual switching
    const executedEffects = this.executeEffectChain();

    // Calculate final results
    const runResult = this.calculateRunResult(executedEffects);

    // Apply burnout and cleanup
    this.applyBurnoutAndCleanup(runResult);

    // Transition to scoring phase
    this.gameState = {
      ...this.gameState,
      phase: 'scoring',
      score: this.gameState.score + runResult.totalPoints,
      round: this.gameState.round + 1
    };

    this.events.onRunComplete?.(runResult);
    this.events.onPhaseChange?.('scoring');

    return runResult;
  }

  // Discovery Phase Actions
  openTabFromLink(linkId: string): Tab | null {
    if (this.gameState.phase !== 'discovery') {
      throw new Error('Can only open tabs during discovery phase');
    }

    const activeTab = this.gameState.tabs.find(tab => tab.isActive);
    if (!activeTab) {
      throw new Error('No active tab');
    }

    const link = activeTab.content.availableLinks.find(l => l.id === linkId);
    if (!link) {
      throw new Error('Link not found');
    }

    // Check RAM availability
    const availableRam = this.gameState.resources.ram.current;
    
    if (availableRam < link.ramCost) {
      throw new Error('Insufficient RAM');
    }

    if (this.gameState.tabs.length >= 8) {
      throw new Error('Maximum tabs reached');
    }

    // Create new tab
    const newTab = this.createTabFromLink(link);
    
    // Update game state
    this.gameState = {
      ...this.gameState,
      tabs: [...this.gameState.tabs, newTab],
      resources: {
        ...this.gameState.resources,
        ram: {
          ...this.gameState.resources.ram,
          current: this.gameState.resources.ram.current - link.ramCost
        }
      }
    };

    this.events.onTabSpawned?.(newTab);
    return newTab;
  }

  closeTab(tabId: string): boolean {
    if (this.gameState.phase === 'running') {
      throw new Error('Cannot close tabs during run phase');
    }

    const tabIndex = this.gameState.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) {
      return false;
    }

    const tab = this.gameState.tabs[tabIndex];
    const newTabs = this.gameState.tabs.filter((_, index) => index !== tabIndex);

    // If closing active tab, switch to another
    let newActiveTabId: string | null = null;
    if (tab.isActive && newTabs.length > 0) {
      newActiveTabId = newTabs[0].id;
    }

    this.gameState = {
      ...this.gameState,
      tabs: newTabs.map(t => ({
        ...t,
        isActive: t.id === newActiveTabId
      })),
      resources: {
        ...this.gameState.resources,
        ram: {
          ...this.gameState.resources.ram,
          current: this.gameState.resources.ram.current + tab.ramUsage
        }
      }
    };

    return true;
  }

  switchToTab(tabId: string): boolean {
    // Allow tab switching during step-execution and discovery, but not during running
    if (this.gameState.phase === 'running') {
      return false;
    }

    const targetTab = this.gameState.tabs.find(tab => tab.id === tabId);
    if (!targetTab) {
      return false;
    }

    this.gameState = {
      ...this.gameState,
      tabs: this.gameState.tabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }))
    };

    return true;
  }

  // Private Implementation - Deterministic Effect Chain Execution
  private executeEffectChain(): EffectResult[] {
    const allExecutedEffects: EffectResult[] = [];
    let hasMoreEffects = true;
    let chainIteration = 0;
    const maxIterations = 10; // Prevent infinite loops

    // Continue executing until no more reactive effects are triggered
    while (hasMoreEffects && chainIteration < maxIterations) {
      hasMoreEffects = false;
      chainIteration++;

      // Execute effects for each tab in order (deterministic based on tab array position)
      for (let tabIndex = 0; tabIndex < this.gameState.tabs.length; tabIndex++) {
        const tab = this.gameState.tabs[tabIndex];
        
        // Emit tab focus event for camera system
        this.events.onTabFocus?.(tab.id);
        
        // Execute each effect for this tab
        for (const effectId of tab.effects) {
          const effect = effectRegistry.getEffect(effectId);
          if (!effect) continue;

          // Check if effect should execute
          if (!this.shouldExecuteEffect(effect, tab, allExecutedEffects)) {
            continue;
          }

          // Execute the effect
          const result = this.executeEffect(effect, tab, allExecutedEffects, chainIteration);
          if (result) {
            allExecutedEffects.push(result);
            hasMoreEffects = true; // Might trigger more reactive effects

            // Update tab effect state
            this.updateTabEffectState(tab.id, effectId);
          }
        }
      }

      // Check for emergent behaviors after each chain iteration
      if (allExecutedEffects.length > 0) {
        const recentEffects = allExecutedEffects.slice(-10); // Last 10 effects
        const emergentResult = this.emergentDetector.detectEmergentBehaviors(
          this.gameState,
          recentEffects
        );

        if (emergentResult.triggeredBehaviors.length > 0) {
          this.events.onEmergentBehavior?.(emergentResult);
          
          // Apply emergent bonuses
          this.gameState = {
            ...this.gameState,
            score: this.gameState.score + emergentResult.totalBonus
          };
        }
      }
    }

    return allExecutedEffects;
  }

  private shouldExecuteEffect(effect: any, tab: Tab, executedEffects: EffectResult[]): boolean {
    // Check cooldowns
    const lastTriggered = tab.effectState.lastTriggered[effect.id] || 0;
    const cooldown = effect.cooldown || 0;
    if (Date.now() - lastTriggered < cooldown) {
      return false;
    }

    // Check max uses
    if (effect.maxUses) {
      const usageCount = tab.effectState.usageCount[effect.id] || 0;
      if (usageCount >= effect.maxUses) {
        return false;
      }
    }

    // Check trigger conditions
    switch (effect.trigger.type) {
      case 'immediate':
        // Execute if not already executed this run
        return !executedEffects.some(e => e.effectId === effect.id && e.tabId === tab.id);
      
      case 'conditional':
        return effect.trigger.condition(this.gameState) && 
               !executedEffects.some(e => e.effectId === effect.id && e.tabId === tab.id);
      
      case 'reactive':
        // Check if any of the trigger effects have been executed
        const triggerEffectsExecuted = effect.trigger.reactsTo.some(triggerId =>
          executedEffects.some(e => e.effectId === triggerId)
        );
        return triggerEffectsExecuted && 
               !executedEffects.some(e => e.effectId === effect.id && e.tabId === tab.id);
      
      default:
        return false;
    }
  }

  private executeEffect(effect: any, tab: Tab, executedEffects: EffectResult[], chainIteration: number): EffectResult | null {
    // Create effect context
    const context: EffectContext = {
      sourceTabId: tab.id,
      runPhaseTime: chainIteration, // Use chain iteration instead of time
      previousEffects: executedEffects,
      availableTabs: this.gameState.tabs,
      deltaTime: 0 // Not used in deterministic mode
    };

    try {
      // Store original state for comparison
      const originalState = { ...this.gameState };
      
      // Execute the effect
      const newGameState = effect.execute(this.gameState, context);
      
      // Create result record
      const result: EffectResult = {
        tabId: tab.id,
        effectId: effect.id,
        effect: effect.description,
        pointsGenerated: newGameState.score - originalState.score,
        resourcesChanged: this.calculateResourceChanges(originalState.resources, newGameState.resources),
        timestamp: Date.now()
      };

      // Check for new tabs spawned
      if (newGameState.tabs.length > originalState.tabs.length) {
        const newTabs = newGameState.tabs.slice(originalState.tabs.length);
        result.newTabsSpawned = newTabs;
        newTabs.forEach(tab => this.events.onTabSpawned?.(tab));
      }

      // Check for modified tabs
      const modifiedTabs = this.findModifiedTabs(originalState.tabs, newGameState.tabs);
      if (modifiedTabs.length > 0) {
        result.tabsModified = modifiedTabs.map(t => t.id);
        modifiedTabs.forEach(tab => this.events.onTabModified?.(tab.id, tab));
      }

      // Update game state
      this.gameState = newGameState;

      this.events.onEffectExecuted?.(result);
      return result;

    } catch (error) {
      console.error(`Error executing effect ${effect.id}:`, error);
      return null;
    }
  }

  private calculateRunResult(executedEffects: EffectResult[]): RunResult {
    const basePoints = executedEffects.reduce((sum, result) => sum + result.pointsGenerated, 0);
    
    // Calculate synergy bonus from interactions
    const interactions = this.calculateTabInteractions(executedEffects);
    const synergyBonus = interactions.reduce((sum, interaction) => sum + interaction.pointsGenerated, 0);
    
    // Efficiency bonus based on remaining RAM
    const usedRam = this.gameState.tabs.reduce((sum, tab) => sum + tab.ramUsage, 0);
    const ramEfficiency = (this.gameState.resources.ram.max - usedRam) / this.gameState.resources.ram.max;
    const efficiencyBonus = Math.floor(ramEfficiency * 50);
    
    // Goal bonus
    const goalBonus = this.checkGoalCompletion(basePoints + synergyBonus);
    
    // Determine burnout
    const burnedOutTabs = this.gameState.tabs
      .filter(tab => Math.random() < tab.burnoutChance)
      .map(tab => tab.id);

    return {
      basePoints,
      synergyBonus,
      efficiencyBonus,
      goalBonus,
      totalPoints: basePoints + synergyBonus + efficiencyBonus + goalBonus,
      completedInteractions: interactions,
      burnedOutTabs
    };
  }

  private calculateTabInteractions(executedEffects: EffectResult[]): TabInteraction[] {
    const interactions: TabInteraction[] = [];
    
    // Group effects by type for synergy detection
    const effectGroups = new Map<string, EffectResult[]>();
    
    for (const result of executedEffects) {
      const effectType = result.effectId.split('-')[0]; // e.g., 'news' from 'news-base'
      if (!effectGroups.has(effectType)) {
        effectGroups.set(effectType, []);
      }
      effectGroups.get(effectType)!.push(result);
    }

    // News synergies
    const newsEffects = effectGroups.get('news') || [];
    if (newsEffects.length >= 2) {
      interactions.push({
        sourceTabId: newsEffects[0].tabId,
        targetTabId: newsEffects[1].tabId,
        interactionType: 'news-synergy',
        pointsGenerated: newsEffects.length * 10,
        description: 'Multiple news sources cross-reference stories'
      });
    }

    // Work collaboration
    const workEffects = effectGroups.get('work') || [];
    if (workEffects.length >= 2) {
      interactions.push({
        sourceTabId: workEffects[0].tabId,
        targetTabId: workEffects[1].tabId,
        interactionType: 'work-collaboration',
        pointsGenerated: 25,
        description: 'Team collaboration increases productivity'
      });
    }

    // Viral combinations
    const socialEffects = effectGroups.get('social') || [];
    const shoppingEffects = effectGroups.get('shopping') || [];
    if (socialEffects.length > 0 && (newsEffects.length > 0 || shoppingEffects.length > 0)) {
      const points = newsEffects.length > 0 && shoppingEffects.length > 0 ? 100 : 35;
      interactions.push({
        sourceTabId: socialEffects[0].tabId,
        targetTabId: newsEffects[0]?.tabId || shoppingEffects[0]?.tabId || '',
        interactionType: 'viral-amplification',
        pointsGenerated: points,
        description: 'Social media amplifies content virally'
      });
    }

    return interactions;
  }

  private createTabFromLink(link: any): Tab {
    const effects = effectRegistry.discoverEffectsForTab(link.targetTabType.toString(), link.effectsToGrant || []);
    
    return {
      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: link.targetTabType,
      title: this.generateTabTitle(link.targetTabType),
      content: this.generateTabContent(link.targetTabType),
      ramUsage: link.ramCost,
      isActive: false,
      hasRunThisRound: false,
      burnoutChance: 0.1,
      effects,
      effectState: {
        cooldowns: {},
        usageCount: {},
        lastTriggered: {},
        persistentData: {}
      },
      createdAt: Date.now()
    };
  }

  private generateTabTitle(type: TabType): string {
    const titles = {
      [TabType.NEWS]: ['Breaking News', 'Tech Updates', 'World Headlines'],
      [TabType.SHOPPING]: ['Best Deals', 'Flash Sale', 'Product Reviews'],
      [TabType.SOCIAL]: ['Social Feed', 'Trending Now', 'Friend Updates'],
      [TabType.WORK]: ['Project Board', 'Team Chat', 'Documents'],
      [TabType.RESEARCH]: ['Documentation', 'Tutorial', 'Reference Guide']
    };
    
    const titleList = titles[type];
    return titleList[Math.floor(Math.random() * titleList.length)];
  }

  private generateTabContent(type: TabType): any {
    return {
      title: this.generateTabTitle(type),
      description: `Content for ${type} tab`,
      availableLinks: [],
      runBehavior: {
        basePoints: 15,
        resourceDrain: 3,
        description: `${type} tab behavior`
      }
    };
  }

  private calculateResourceChanges(oldResources: any, newResources: any): any {
    return {
      ram: newResources.ram.current - oldResources.ram.current,
      productivity: newResources.productivity - oldResources.productivity,
      focus: newResources.focus - oldResources.focus,
      willpower: newResources.willpower - oldResources.willpower
    };
  }

  private findModifiedTabs(oldTabs: Tab[], newTabs: Tab[]): Tab[] {
    const modified: Tab[] = [];
    
    for (let i = 0; i < Math.min(oldTabs.length, newTabs.length); i++) {
      const oldTab = oldTabs[i];
      const newTab = newTabs[i];
      
      if (newTab.modifiedAt && newTab.modifiedAt > oldTab.createdAt) {
        modified.push(newTab);
      }
    }
    
    return modified;
  }

  private updateTabEffectState(tabId: string, effectId: string): void {
    const tabIndex = this.gameState.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;
    
    const tab = this.gameState.tabs[tabIndex];
    const newEffectState = {
      ...tab.effectState,
      lastTriggered: {
        ...tab.effectState.lastTriggered,
        [effectId]: Date.now()
      },
      usageCount: {
        ...tab.effectState.usageCount,
        [effectId]: (tab.effectState.usageCount[effectId] || 0) + 1
      }
    };
    
    this.gameState.tabs[tabIndex] = {
      ...tab,
      effectState: newEffectState
    };
  }

  private checkGoalCompletion(totalScore: number): number {
    if (!this.gameState.currentGoal) return 0;
    
    if (totalScore >= this.gameState.currentGoal.targetScore) {
      return this.gameState.currentGoal.reward;
    }
    
    return 0;
  }

  private applyBurnoutAndCleanup(runResult: RunResult): void {
    // Remove burned out tabs
    this.gameState = {
      ...this.gameState,
      tabs: this.gameState.tabs.filter(tab => !runResult.burnedOutTabs.includes(tab.id))
    };
    
    // Reset hasRunThisRound flag
    this.gameState = {
      ...this.gameState,
      tabs: this.gameState.tabs.map(tab => ({
        ...tab,
        hasRunThisRound: true
      }))
    };
  }
}
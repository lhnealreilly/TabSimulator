# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tab Hoarder Simulator - A satirical idle/management game that gamifies browser tab addiction. Built with React 18+, TypeScript, and Vite.

**Current Status**: Planning phase - implementation not yet started. The repository contains comprehensive specifications in Claude.md that should guide development.

## Commands

### Development (Once Implemented)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking and linting
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Core Technology Stack
- **React 18+** with TypeScript (strict mode)
- **Vite** for bundling and dev server
- **Tailwind CSS** for styling
- **React Query/TanStack Query** for state management
- **Vitest** for testing

### Key Architectural Principles
1. **Functional Components Only** - No class components
2. **Strict TypeScript** - No `any` types, comprehensive type definitions
3. **Custom Hooks** - Separate game logic from UI components
4. **Component Composition** - Small, single-purpose components
5. **Immutable State** - Never mutate state directly

### Directory Structure
```
src/
├── components/
│   ├── game/      # Game-specific components (TabManager, ResourcePanel, etc.)
│   ├── ui/        # Reusable UI components
│   └── layout/    # Layout components
├── hooks/         # Custom hooks for game logic
├── types/         # TypeScript type definitions
├── utils/         # Utility functions and game calculations
├── data/          # Static game configurations
└── styles/        # Global styles
```

### Core Game Systems

**Tab Management System**
- Handles tab spawning, lifecycle, and behavior
- Key types: `Tab`, `TabType`, `TabBehavior`
- Located in: `src/components/game/TabManager.tsx` and `src/hooks/useTabManagement.ts`

**Resource System**
- Manages RAM usage, performance metrics
- Implements upgrade mechanics
- Key hooks: `useResources`, `useUpgrades`

**Game Loop**
- Automatic tab spawning based on rates
- Resource consumption calculations
- State persistence to localStorage

### Type System
All game entities have strict TypeScript interfaces defined in `src/types/`:
- `Tab` - Individual tab properties
- `GameState` - Overall game state
- `Resources` - RAM, CPU, performance metrics
- `Upgrades` - Available upgrades and effects

### Development Guidelines

1. **Always define types first** before implementing features
2. **Use custom hooks** for any stateful game logic
3. **Keep components small** - extract logic to hooks or utils
4. **Test game mechanics** - especially resource calculations
5. **Optimize for performance** - use React.memo, useMemo for expensive calculations
6. **Maintain accessibility** - keyboard navigation, ARIA labels

### Testing Approach
- Unit tests for utility functions and game calculations
- Hook tests for custom React hooks
- Component tests for UI behavior
- Integration tests for game systems

### Important Notes
- The existing Claude.md file contains detailed specifications - refer to it for game mechanics and features
- Follow the strict coding standards outlined in the specifications
- Performance is critical due to potentially hundreds of tabs - use virtualization for lists
- State should persist to localStorage for idle game functionality

## Game Design: Tab Ecosystem with Run Cycles

### Core Game Loop

The game operates in three distinct phases that create a strategic resource management puzzle:

#### Phase 1: Discovery Phase (Player Controlled)
- Browse current tab content to find clickable links
- Each tab type has different link discovery mechanics:
  - **News tabs:** Find links to breaking stories, investigations, opinion pieces
  - **Shopping tabs:** Product recommendations, related items, deals
  - **Social tabs:** Trending topics, friend updates, viral content
  - **Work tabs:** Project links, meeting notes, important documents
  - **Research tabs:** Citations, references, documentation
- Resource constraint: Opening new tabs costs RAM, may need to close others
- Strategic decision: Which tabs to keep open for the "run"?

#### Phase 2: Run Phase (Automated)
- Click "RUN TABS" button to start the automated phase
- Each open tab executes its behavior simultaneously
- Tab behaviors during run:
  - **News tabs:** Generate "insights" by cross-referencing with other news tabs
  - **Shopping tabs:** Find "deals" by comparing prices with other shopping tabs
  - **Social tabs:** Create "viral content" by combining trending topics
  - **Work tabs:** Complete "tasks" by connecting with relevant project tabs
  - **Research tabs:** Enhance other tabs with citations and data
- Tab interactions: Tabs can boost each other's effectiveness if related
- Duration: Run lasts 10-30 seconds depending on tab complexity

#### Phase 3: Scoring & Cleanup
- Calculate points based on successful tab interactions
- Some tabs "burn out" and auto-close after running
- Resources regenerate slightly
- New goal appears for next round

### Tab Synergies During Run Phase

Specific tab combinations create powerful bonuses:
- **News + News:** "Investigative Journalism" bonus (2x points if topics related)
- **Shopping + Shopping:** "Price Comparison" bonus (find better deals)
- **Social + News:** "Breaking Story" bonus (news goes viral faster)
- **Work + Work:** "Collaboration" bonus (projects complete faster)
- **Research + Any:** "Citation" bonus (research enhances other tabs)

### Scoring System

- **Base points:** Each tab generates points during run phase
- **Synergy multipliers:** Bonus points for tab interactions
- **Efficiency bonus:** More points for using fewer resources
- **Discovery bonus:** Points for finding rare/hidden links
- **Goal completion:** Large bonus for hitting round targets

### Round Goals (Examples)

- **"Viral News Cycle":** Score 500+ points with at least 3 news tabs
- **"Shopping Spree":** Find 5 deals while staying under 800 RAM
- **"Productivity Sprint":** Complete 3 work tasks in one run
- **"Social Butterfly":** Create viral content with 4+ social media interactions
- **"Research Paper":** Use research tabs to boost 3 different tab types

### Game Balance Considerations

#### Resource Management
- Players can realistically manage 5-8 tabs maximum
- RAM is the hard constraint forcing strategic choices
- Closing tabs should feel strategic, not frustrating
- Some tabs are more RAM-efficient but generate fewer points

#### Discovery Phase Strategy
- Links have discovery chances (some are rare/hidden)
- Opening tabs costs RAM immediately
- Some links only appear when certain tabs are already open
- Players must balance exploration vs. preparation for run phase

#### Run Phase Excitement
- Visual animations show tab interactions
- Sound effects for successful synergies
- Progress bars for ongoing processes
- Clear feedback for point generation

### Progression System

#### Within-Round Progression
- Goals get progressively harder within a session
- New tab types unlock as rounds progress
- Resource costs increase but so do potential rewards

#### Persistent Upgrades (Future Feature)
- RAM capacity increases
- Better link discovery rates
- Reduced tab burnout chances
- New tab synergies unlock

### Critical Implementation Details

## GameEngine Architecture

### Overview
The GameEngine is the single-threaded controller responsible for all game state mutations. It enforces game rules, manages resources, and orchestrates the three-phase game loop. No game state can be modified outside of the GameEngine.

### Core Principles
1. **Single Source of Truth**: All state mutations go through GameEngine
2. **Immutable Updates**: State changes return new objects, never mutate
3. **Command Pattern**: Actions are validated before execution
4. **Event-Driven**: Emits events for UI animations and feedback
5. **Deterministic**: Same inputs always produce same outputs
6. **Error Handling**: Returns Result types with success/error states

### GameEngine Responsibilities

#### State Management
- Maintains the authoritative GameState
- Validates all state transitions
- Ensures state consistency across phases
- Handles save/load operations

#### Phase Control
- **Discovery Phase**: Tab browsing, link discovery, resource planning
- **Run Phase**: Automated tab execution, synergy calculation
- **Scoring Phase**: Point tallying, cleanup, goal evaluation
- Enforces phase transition rules
- Manages phase timers and durations

#### Resource Management
- Tracks RAM usage per tab
- Enforces RAM constraints before tab creation
- Calculates resource regeneration
- Manages resource drain during run phase

#### Tab Lifecycle
- Creates tabs from links with validation
- Manages active tab switching
- Handles tab closure and RAM recovery
- Tracks tab relationships for synergies
- Manages tab burnout after runs

#### Run Orchestration
- Initiates run phase with current tabs
- Calculates base points per tab
- Identifies and applies synergy bonuses
- Processes tab interactions
- Determines burnout and cleanup
- Generates RunResult with scoring breakdown

### GameEngine Public API

```typescript
class GameEngine {
  // Initialization
  constructor(config: GameConfig)
  reset(): GameState
  loadState(state: GameState): void
  
  // Tab Management
  openTab(linkId: string): Result<GameState, GameError>
  closeTab(tabId: string): Result<GameState, GameError>
  switchTab(tabId: string): Result<GameState, GameError>
  
  // Phase Control
  startRun(): Result<RunHandle, GameError>
  tick(deltaTime: number): GameState
  completeRun(): Result<RunResult, GameError>
  
  // Resource Queries
  canAffordTab(link: Link): boolean
  getRemainingRam(): number
  getResourceStatus(): Resources
  
  // State Queries
  getState(): GameState
  getCurrentPhase(): GamePhase
  getActiveTab(): Tab | null
  getCurrentGoal(): RoundGoal | null
  
  // Event Subscription
  on(event: GameEvent, handler: Handler): void
  off(event: GameEvent, handler: Handler): void
}
```

### Event System

The GameEngine emits events for UI updates:
- `tabOpened`: New tab created
- `tabClosed`: Tab removed
- `tabSwitched`: Active tab changed
- `phaseChanged`: Game phase transition
- `resourcesChanged`: RAM or other resources updated
- `runStarted`: Run phase initiated
- `runTick`: Run phase progress update
- `runCompleted`: Run phase finished with results
- `goalCompleted`: Round goal achieved
- `gameOver`: Game ended

### Error Handling

All GameEngine methods that can fail return Result types:
```typescript
type Result<T, E> = { success: true; value: T } | { success: false; error: E }

enum GameError {
  INSUFFICIENT_RAM = 'INSUFFICIENT_RAM',
  TAB_NOT_FOUND = 'TAB_NOT_FOUND',
  INVALID_PHASE = 'INVALID_PHASE',
  LINK_NOT_FOUND = 'LINK_NOT_FOUND',
  RUN_IN_PROGRESS = 'RUN_IN_PROGRESS',
  NO_TABS_TO_RUN = 'NO_TABS_TO_RUN'
}
```

### Integration with React

The GameEngine integrates with React via a custom hook:
```typescript
function useGameEngine(config?: GameConfig) {
  const [gameState, setGameState] = useState<GameState>()
  const engineRef = useRef<GameEngine>()
  
  // Subscribe to engine events
  // Update React state on changes
  // Provide action methods
  
  return {
    gameState,
    actions: {
      openTab,
      closeTab,
      startRun,
      // etc.
    }
  }
}
```

### Performance Considerations

- State updates are batched when possible
- Heavy calculations (synergies) are memoized
- Run phase uses requestAnimationFrame for smooth updates
- Tab limit (8-10) prevents performance degradation
- Virtual scrolling for tab lists if needed

### Testing Strategy

The GameEngine's deterministic design enables comprehensive testing:
- Unit tests for each public method
- Integration tests for phase transitions
- Property-based tests for state consistency
- Snapshot tests for complex scenarios
- Performance tests for run phase calculations

### Critical Implementation Details

## Programmable Tab Effect System

### Overview
Each tab is essentially a programmable function that transforms the game state. This creates a living ecosystem where tabs interact in complex, emergent ways that weren't explicitly programmed.

### Core Architecture: Pure Functional Effects

Every tab behavior is a pure function:
```typescript
type Effect = (gameState: GameState, context: EffectContext) => GameState;
```

**Key Benefits:**
- **Predictable**: Same inputs always produce same outputs
- **Testable**: Easy to unit test each effect in isolation
- **Composable**: Effects can reference and build on other effects
- **Emergent**: Complex behaviors emerge from simple interactions

### Effect System Components

#### 1. Effect Types (`src/types/effects.ts`)
- `Effect`: Pure function signature for all tab behaviors
- `EffectContext`: Provides run phase time, previous effects, available tabs
- `EffectResult`: Tracks points, resource changes, emergent behaviors
- `TabEffect`: Complete effect definition with triggers and metadata
- `EmergentBehavior`: Complex multi-condition interactions

#### 2. Enhanced Tab Structure
```typescript
interface Tab {
  effects: string[];           // Array of effect IDs this tab can execute
  effectState: TabEffectState; // Persistent state for cooldowns, usage tracking
  content: TabContent;         // Can be hijacked/modified by other effects
}
```

#### 3. Effect Triggers
Effects can trigger at different times:
- **Immediate**: Runs as soon as run phase starts
- **Delayed**: Runs X seconds into run phase
- **Conditional**: Runs when game state matches condition
- **Reactive**: Runs after specific other effects execute
- **Periodic**: Runs at regular intervals

### Implementation Files

#### Base Effects (`src/effects/baseEffects.ts`)
Implements 9 core effects with increasing complexity:

**Simple Effects:**
- `news-base`: Generates points + synergy with other news tabs
- `work-base`: Restores focus and productivity
- `social-base`: Points but drains focus (classic social media)

**Complex Effects:**
- `shopping-cart-abandon`: Conditional trigger spawns retargeting ads
- `social-viral`: Reactive effect that creates massive bonuses when combined
- `news-investigative`: Delayed effect enhanced by research tabs

**Chaos Effects:**
- `hacker-chaos`: Legendary effect that hijacks and modifies other tabs

#### Effect Registry (`src/effects/EffectRegistry.ts`)
- **Effect Management**: Stores and indexes all effects by ID, tags, rarity
- **Discovery System**: Determines which effects new tabs can access
- **Weighted Selection**: Rare/legendary effects have low spawn chances
- **Emergent Behavior Registry**: Tracks complex multi-tab interactions

#### Emergent Behavior Detection (`src/effects/EmergentBehaviorDetector.ts`)
Advanced pattern detection system:

**Predefined Emergent Behaviors:**
- **News Cascade**: 4+ news tabs create information overload
- **Flow State**: Perfect work/research balance multiplies everything
- **Digital Chaos**: Hacker + viral effects = 500 point legendary combo
- **Viral Economy**: Social content drives shopping behavior

**Dynamic Pattern Detection:**
- Alternating work-distraction cycles
- Effect cascades (many effects in short time windows)
- Resource death spirals (consecutive negative effects)

### Example Emergent Interactions

#### "Influencer Product Placement" (100+ points)
```
1. News tab generates story
2. Social tab makes it viral (reactive trigger)
3. Shopping tab benefits from viral trend
4. Bonus: Huge points but drains willpower
```

#### "Research Citation Network" (Scaling bonus)
```
1. Research tab activates
2. Provides +3 points per other tab type
3. More diverse tabs = exponentially better research
```

#### "Hacker Chaos Theory" (500 points, legendary)
```
1. Hacker tab hijacks another tab
2. Hijacked tab triggers viral effect
3. Low willpower + chaos combination
4. Unlocks "chaos-master" effect permanently
```

### Effect State Management

#### Tab Effect State
```typescript
interface TabEffectState {
  cooldowns: Record<string, number>;    // Prevent effect spam
  usageCount: Record<string, number>;   // Track effect usage
  lastTriggered: Record<string, number>; // Timing information
  persistentData: Record<string, any>;  // Custom effect data
}
```

#### Effect Results
Every effect execution produces:
- Points generated
- Resource changes (RAM, focus, willpower, productivity)
- New tabs spawned
- Tabs modified
- Emergent behaviors triggered

### Future Expansion Possibilities

#### AI-Generated Effects
- Analyze player behavior patterns
- Generate custom effects that match play style
- Create effects that counter dominant strategies

#### Community Effects
- Players can script custom effects
- Share and vote on community-created effects
- Seasonal events with special effect collections

#### Meta-Effects
- Effects that modify other effects
- "Virus" effects that spread between tabs
- "Mutation" effects that randomly change tab behaviors

### Development Guidelines

#### Creating New Effects
1. **Start Simple**: Basic point generation + resource change
2. **Add Conditions**: Check game state for interesting triggers
3. **Enable Emergence**: Reference other effects in calculations
4. **Test Combinations**: Ensure effects interact meaningfully
5. **Balance Carefully**: Powerful effects need appropriate costs

#### Effect Design Principles
- **Clarity**: Effect description should match actual behavior
- **Feedback**: Players should understand why effects triggered
- **Surprise**: Some effects should create unexpected results
- **Choice**: Players should feel agency in building effect combinations
- **Evolution**: Effect behavior can change based on game context

### Testing Strategy
- **Unit Tests**: Each effect function in isolation
- **Integration Tests**: Effect combinations and emergent behaviors
- **Property Tests**: Verify game state consistency after effects
- **Performance Tests**: Ensure effect execution scales with tab count
- **Emergence Tests**: Verify complex behaviors actually emerge

This programmable effect system transforms the game from a simple resource manager into a **digital ecosystem simulation** where players become effect composers, discovering and orchestrating complex emergent behaviors.

## Deterministic Gameplay Loop

### Core Principle: No Race Conditions
The game execution is completely deterministic with no time-based race conditions. When "RUN TABS" is clicked, all effects execute in a predictable order based on tab positioning.

### Execution Model

#### 1. Tab-Order Based Execution
Effects execute in the order tabs appear in the tabs array:
- Tab 0 executes all its effects first
- Then Tab 1 executes all its effects
- Continue until all tabs have executed
- If reactive effects are triggered, repeat the cycle

#### 2. Effect Chain Iterations
```typescript
// Pseudo-code of execution
let hasMoreEffects = true;
let chainIteration = 0;

while (hasMoreEffects && chainIteration < 10) {
  hasMoreEffects = false;
  
  for (tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
    for (effectId of tabs[tabIndex].effects) {
      if (shouldExecuteEffect(effect, tab, executedEffects)) {
        executeEffect(effect);
        hasMoreEffects = true; // Might trigger reactive effects
      }
    }
  }
  
  chainIteration++;
}
```

#### 3. Effect Trigger Types
- **Immediate**: Executes on first iteration if not already executed
- **Conditional**: Executes if game state condition is met
- **Reactive**: Executes if any trigger effect has been executed this run

#### 4. Animation vs Logic Separation
- **Logic**: All effects execute instantly when "RUN TABS" is clicked
- **Animation**: 3-second timer shows visual effects but doesn't affect game logic
- **UI Updates**: React components show animations while displaying final state

### Benefits of Deterministic Execution

#### Predictable Gameplay
- Same tab setup always produces same results
- Players can develop strategies based on reliable cause-and-effect
- No frustrating RNG in core mechanics

#### Emergent Strategy
- Players discover optimal tab orderings
- Tab positioning becomes a strategic element
- Effect timing is controllable through tab arrangement

#### Testing & Debugging
- Easy to reproduce bugs with same tab setup
- Unit tests can verify exact outcomes
- No flaky tests due to timing issues

#### Player Agency
- Players have complete control over when effects execute
- No arbitrary time limits during discovery phase
- Run phase is a deliberate player action

### Implementation Details

#### GameLoop Class (`src/engine/GameLoop.ts`)
- `executeRunPhase()`: Single function that runs entire effect chain
- `executeEffectChain()`: Deterministic iteration through all effects
- `shouldExecuteEffect()`: Checks triggers without time dependencies
- Chain iteration prevents infinite loops (max 10 iterations)

#### React Integration (`src/hooks/useGameEngine.ts`)
- `executeRun()`: Returns Promise that resolves after animation time
- Game state updates immediately, animations are purely visual
- `isAnimating` flag controls UI behavior during run phase

#### Effect System
- No `delayed` or `periodic` triggers
- Only `immediate`, `conditional`, and `reactive` triggers
- Effects can modify game state, spawn tabs, but not schedule future events

This deterministic model ensures that Tab Hoarder Simulator is a **strategy game** where player decisions have predictable consequences, rather than a luck-based game with timing dependencies.

## Visual Theme & Design System

### Windows 95 Aesthetic
The game uses a strict Windows 95-inspired visual theme with pixelated, retro computing aesthetics:

**Color Palette:**
- Primary gray: `#c0c0c0` (win95-gray)
- Desktop teal: `#008080` (win95-desktop)
- Active titlebar: `#000080` (win95-titlebar-active)
- Button highlights: `#ffffff` (top/left borders)
- Button shadows: `#0a0a0a` (bottom/right borders)
- Resource colors: Pure RGB values (#ff0000, #00ff00, #0000ff, etc.)

**Component Styling:**
- **Windows:** Double borders with 3D effect using light/dark edges
- **Buttons:** win95-button class with inset effect on click
- **Tabs:** Blocky tabs with no rounded corners, active tab connects to content
- **Progress bars:** Striped gradient patterns for resource meters
- **Typography:** MS Sans Serif or fallback Arial at 11px base size

**UI Elements:**
- Classic window chrome with titlebar, minimize/close buttons
- Inset/outset borders for depth perception
- No rounded corners anywhere - everything is rectangular
- Pixelated fonts for game stats (VT323 Google Font)
- Scanline effect overlay for CRT monitor feel

**CSS Classes:**
- `win95-window` - Main window container with 3D borders
- `win95-button` - Classic pushable button
- `win95-tab` - Browser-style tabs
- `win95-inset` - Sunken panel effect
- `win95-titlebar` - Blue gradient titlebar
- `pixel-font` - Pixelated display font

**Important Theming Rules:**
1. Never use modern rounded corners or shadows
2. All interactions should feel "clicky" and mechanical
3. Use system colors only (no gradients except titlebars)
4. Maintain pixel-perfect alignment (no anti-aliasing)
5. Loading states should use classic hourglass cursor or progress bars
6. Error states should use red text on gray backgrounds
7. Success states should use simple checkmarks or "OK" buttons
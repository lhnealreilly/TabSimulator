Tab Hoarder Simulator - Development Guide
Project Overview
A satirical idle/management game that gamifies browser tab addiction. Players manage virtual tabs that multiply, consume resources, and challenge productivity - turning digital hoarding into an engaging game mechanic.
Technology Stack Requirements
Mandatory Technologies

React 18+ with TypeScript (strict mode enabled)
Vite for build tooling and dev server
Tailwind CSS for styling (utility-first approach)
React Query/TanStack Query for state management if needed
Vitest for testing

Architectural Opinions

No class components - functional components with hooks only
Strict TypeScript - no any types, enable all strict compiler options
Component composition over inheritance - build small, reusable pieces
Custom hooks for game logic - separate UI from business logic
Single responsibility principle - each component should do one thing well

Development Principles
Planning Before Coding

Write types first - define your data structures before implementation
Design component hierarchy - sketch out the component tree on paper
Plan state management - identify what state lives where before building
Mock data structures - create sample data to work with during development
Break down features - each PR should be a single, complete feature

Code Quality Standards

No TODO comments - either do it now or create a proper issue
Meaningful variable names - tabCount not tc, isTabActive not active
Error boundaries - wrap major sections in error boundaries
Loading and error states - every async operation needs proper UX
Accessibility first - keyboard navigation, screen reader support, proper ARIA

Critical Implementation Rules

No premature optimization - make it work, then make it fast
Test the game loop first - core mechanics before pretty UI
Mobile-responsive from day one - don't retrofit responsiveness
Performance monitoring - watch for memory leaks in the game simulation
State immutability - never mutate state directly, use proper React patterns

Current Directory Structure
tab-simulator/
├── public/
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameContainer.tsx (main game wrapper)
│   │   │   ├── TabBrowser.tsx (tab management)
│   │   │   ├── TabBar.tsx (tab headers)
│   │   │   └── RunButton.tsx (run phase trigger)
│   │   ├── tabs/
│   │   │   ├── TabContent.tsx (tab details & links)
│   │   │   └── LinkButton.tsx (discoverable links)
│   │   ├── ui/
│   │   │   ├── ResourcePanel.tsx (RAM display)
│   │   │   ├── GoalPanel.tsx (objectives)
│   │   │   └── ScoreDisplay.tsx (points & round)
│   │   └── effects/
│   │       └── SimpleCameraSystem.tsx (visual highlighting)
│   ├── engine/
│   │   └── GameLoop.ts (core game logic)
│   ├── effects/
│   │   ├── EffectRegistry.ts (effect management)
│   │   ├── EmergentBehaviorDetector.ts (pattern detection)
│   │   └── baseEffects.ts (core tab effects)
│   ├── hooks/
│   │   └── useGameEngine.ts (game state hook)
│   ├── types/
│   │   ├── game.ts (core game types)
│   │   ├── tabs.ts (tab & content types)
│   │   ├── effects.ts (effect system types)
│   │   ├── engine.ts
│   │   ├── upgrades.ts
│   │   └── index.ts
│   ├── styles/
│   │   └── index.css (Tailwind + Windows 95 theme)
│   ├── main.tsx
│   └── App.tsx
├── Claude.md (development guide)
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
Current Implementation Status

### Completed Core Systems
- ✅ **GameLoop**: Deterministic effect execution with phase management
- ✅ **Visual System**: SimpleCameraSystem for tab highlighting during run phase
- ✅ **Tab Management**: Full tab lifecycle (open, close, switch, content)
- ✅ **Effect System**: Registry-based effects with emergent behavior detection
- ✅ **Windows 95 UI**: Complete retro theme with authentic styling
- ✅ **Resource Management**: RAM-based gameplay with visual feedback

### Architecture Principles Applied
- **Event-driven design**: GameLoop emits events, UI components listen
- **Strict TypeScript**: All entities properly typed, no `any` usage
- **Component composition**: Small, focused components with single responsibilities
- **Immutable state**: React state updates follow immutability patterns
- **Separation of concerns**: Game logic separate from UI components
- **Deterministic game logic**: No timing-based game logic (timeouts/intervals) except for pure animations

### Performance Optimizations
- **Synchronous execution**: No race conditions or timing dependencies
- **Minimal re-renders**: Strategic state updates and event handling
- **Clean component hierarchy**: Efficient prop passing and state management
- **No memory leaks**: Proper cleanup of timeouts and event listeners

AI Assistant Interaction Guidelines
When working with AI assistants on this project:
Be Specific and Critical

Don't accept generic solutions - ask for TypeScript-specific, React 18+ implementations
Challenge architectural decisions - ask "why this pattern over alternatives?"
Demand performance justification - "how will this scale with 1000+ tabs?"
Request error handling details - "what happens when this fails?"

Productive Questioning

"What are the downsides of this approach?"
"How would you test this component?"
"What accessibility concerns does this have?"
"How does this handle edge cases?"
"What would you refactor if this gets more complex?"

Red Flags to Call Out

Inline styles instead of Tailwind classes
Missing TypeScript types or loose typing
No error boundaries or error handling
Components doing too many things
Missing keys in lists or improper React patterns
Performance anti-patterns (like creating objects in render)

Getting Started

Set up the environment with strict TypeScript config
Create type definitions for all game entities first
Build a minimal playable prototype - single tab that can be opened/closed
Add the game loop - automatic tab spawning and resource management
Iterate on core mechanics before adding polish

Remember: This is a learning project. Prioritize clean architecture and TypeScript mastery over feature completeness. Better to have a small, well-built game than a large, messy one.

## Current Game Implementation

### Core Gameplay Loop
A Windows 95-themed tab management game with three phases:
1. **Discovery Phase**: Click links to open new tabs (costs RAM)
2. **Run Phase**: Execute all tab effects in deterministic order with visual feedback
3. **Scoring Phase**: Calculate points from effects, synergies, and goals

### Architecture Overview

#### Game Engine (`GameLoop.ts`)
- **Deterministic execution**: Effects run in tab order, no randomness or race conditions
- **Phase management**: Strict phase transitions (discovery → running → scoring)
- **Effect system**: Each tab has effects that modify game state
- **Event-driven**: Emits events for UI updates and visual feedback

#### Visual System (`SimpleCameraSystem.tsx`)
- **Tab highlighting**: Visual focus indicator during run phase
- **Run phase overlay**: Shows "⚡ RUNNING EFFECTS" with progress
- **Simple animations**: Yellow border + glow on currently processing tab
- **Clean visual feedback**: No complex attention mechanics

#### Core Types
```typescript
interface Tab {
  id: string;
  type: TabType;
  title: string;
  content: TabContent;
  ramUsage: number;
  isActive: boolean;
  effects: string[];
  effectState: EffectState;
}

interface GameState {
  tabs: Tab[];
  resources: Resources;
  phase: GamePhase; // 'discovery' | 'running' | 'scoring'
  score: number;
  round: number;
}
```

### Run Phase Experience
1. **Visual Processing**: Camera highlights each tab as its effects execute
2. **Order-based execution**: Tab effects run left-to-right, deterministically
3. **Real-time feedback**: UI shows which tab is currently being processed
4. **Effect visualization**: Tab glows yellow with border animation during processing
5. **Emergent behaviors**: System detects patterns in effect combinations

### Key Components
- **GameContainer**: Main game wrapper with SimpleCameraSystem
- **TabBrowser**: Tab management and content display
- **TabBar**: Interactive tab headers with close buttons and status indicators
- **TabContent**: Shows tab details and discoverable links
- **ResourcePanel**: Simplified to show only RAM (the core resource)
- **RunButton**: Triggers the run phase

### Implementation Notes
- **No attention mechanics**: Removed complex attention state management
- **Synchronous execution**: Effects execute immediately, visual timing is separate
- **Event-driven UI**: GameLoop emits `onTabFocus` events for visual highlighting
- **Windows 95 theme**: Consistent retro styling throughout
- **Clean codebase**: All debug logs and unused code removed

This simplified approach focuses on the core "Run Tabs" experience with clean visual feedback, making the effect processing visible and engaging without overwhelming complexity.

### Critical Implementation Rule: No Timing-Based Game Logic

**IMPORTANT**: Game state transitions and logic must NEVER depend on timeouts, intervals, or timing. The only exception is pure visual animations that don't affect game state.

**✅ Allowed:**
- Visual animation timeouts (fade effects, highlighting, transitions)
- UI feedback delays that don't change game state
- CSS animations and transitions

**❌ Forbidden:**
- `setTimeout` or `setInterval` for game state changes
- Timing-based phase transitions
- Delayed effect execution
- Time-dependent resource regeneration
- Auto-save intervals that affect gameplay

**Why:** Timing-based logic creates race conditions, makes testing unreliable, introduces bugs, and makes the game feel unpredictable. All game logic must be deterministic and based on player actions or explicit state changes.

**Example Fix:**
```typescript
// ❌ Bad: Timing-based transition
setTimeout(() => {
  gameLoop.startDiscoveryPhase();
}, 3000);

// ✅ Good: Deterministic transition
onRunComplete: (result) => {
  // Update state immediately
  setLastRunResult(result);
  setIsAnimating(false);
  
  // Immediate deterministic transition
  gameLoop.startDiscoveryPhase();
}
```

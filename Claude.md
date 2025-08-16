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

Directory Structure
tab-hoarder-simulator/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── TabBar.tsx
│   │   │   ├── Tab.tsx
│   │   │   ├── ResourceMeters.tsx
│   │   │   ├── GameArea.tsx
│   │   │   └── UpgradePanel.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Tooltip.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── hooks/
│   │   ├── useGameLoop.ts
│   │   ├── useTabManager.ts
│   │   ├── useResourceManager.ts
│   │   └── useGameState.ts
│   ├── types/
│   │   ├── game.ts
│   │   ├── tabs.ts
│   │   └── resources.ts
│   ├── utils/
│   │   ├── gameLogic.ts
│   │   ├── tabBehaviors.ts
│   │   ├── calculations.ts
│   │   └── constants.ts
│   ├── data/
│   │   ├── tabTypes.ts
│   │   ├── upgrades.ts
│   │   └── achievements.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── docs/
│   ├── GAME_DESIGN.md
│   ├── API.md
│   └── DEPLOYMENT.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── vitest.config.ts
└── README.md
Critical Implementation Guidelines
Game Loop Architecture
typescript// useGameLoop.ts should handle:
- Automatic tab spawning (setInterval)
- Resource depletion calculations
- Tab behavior updates
- Game state persistence
- Performance optimization for long-running games
Type Safety Requirements
typescript// All game entities must be strictly typed
interface Tab {
  id: string;
  type: TabType;
  title: string;
  url: string;
  ramUsage: number;
  spawnRate: number;
  isActive: boolean;
  createdAt: Date;
  lastInteracted?: Date;
}

// No optional properties without good reason
// No union types with 'any'
// Enums for discrete values
Performance Considerations

Virtual scrolling for large tab lists (100+ tabs)
Debounced state updates to prevent excessive re-renders
Memoized calculations for expensive game logic
Cleanup intervals on component unmount
Local storage persistence for game state

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

## Game Design Vision: "Rapid Fire Tab Switching"

### Core Experience
The game captures the visceral, manic experience of frantic tab-switching sessions where your brain tries to process everything simultaneously, creating chaotic but sometimes brilliant connections.

**Theme**: You're in a digital trance state where attention fragments across multiple tabs, creating visual storytelling through rapid camera movements and attention trails.

### Visual Chain Reaction System

#### Tab Switching Animation Mechanics
```typescript
interface TabSwitchChain {
  sequence: Tab[];
  switchSpeed: number; // milliseconds between switches
  visualTrail: boolean; // leave visual breadcrumbs
  momentum: number; // how fast the switching accelerates
  attentionFragmentation: number; // split focus level
}

interface AttentionState {
  focus: number; // 0-100, concentration level
  fragmentation: number; // how split your attention is
  switchSpeed: number; // milliseconds between jumps
  overload: boolean; // switching too fast to process
}
```

#### Run Phase Visual Experience
1. **Camera rapidly jumps between tabs** (like cmd+tab on steroids)
2. **Visual trails connect tabs** that trigger each other
3. **Screen fragments** when multiple tabs activate simultaneously
4. **Attention overlays** show divided focus with multiple cursors
5. **Content bleeding** between tabs during rapid switching

### Chain Reaction Examples

#### "News Rabbit Hole" Chain
Politics → Economic News → Stock Prices → Investment Advice → Retirement Planning → Health News → Medical Research → Conspiracy Theory

**Visual**: Camera pans rapidly, each tab "sparking" the next with animated connections, shared highlighted words flying between tabs.

#### "Shopping Spiral" Chain  
Amazon Product → Reviews → Competitor Comparison → Price History → Coupon Sites → Cashback Apps → Credit Card Rewards → Personal Finance Blog

**Visual**: Price numbers and product images "fly" between tabs, creating a paper trail of decision paralysis.

#### "Social Media Doom Scroll" Chain
Twitter → Drama Thread → Wikipedia → Reddit → YouTube Video → Comments → More Drama → News → Back to Twitter

**Visual**: Notification bubbles cascade like a pinball machine, engagement metrics multiply across tabs.

### Attention/Focus States

#### "Flow State" (High Focus)
- Single tab in sharp focus, others dimmed
- Smooth, purposeful transitions
- Clean, organized visual connections
- Higher quality insights, fewer surprises

#### "Scattered Brain" (Medium Focus)  
- 2-3 tabs visible simultaneously
- Moderate switching with visible trails
- Balanced chaos - still readable
- Sweet spot between control and serendipity

#### "Attention Chaos" (Low Focus)
- Rapid fire switching, barely registering content
- Multiple overlapping visual trails
- Screen fragments into multiple views
- High chance of unexpected connections

#### "Digital Vertigo" (Overload)
- Tabs switching faster than eye can follow
- Kaleidoscope of overlapping content
- Visual static/glitch effects
- Potential for breakthrough insights or complete crash

### Chain Reaction Types

#### Linear Chains
Simple cause-and-effect: A→B→C
**Visual**: Clean arrow trails
**Example**: Recipe → Ingredient Store → Cooking Video → Kitchen Equipment

#### Branching Chains  
One tab triggers multiple others
**Visual**: Tree-like branching with multiple trails
**Example**: Breaking News → 5 opinion pieces + fact-checking + social reactions

#### Feedback Loops
Tabs reinforcing each other cyclically
**Visual**: Circular trails, tabs pulsing in rhythm
**Example**: Stock Price ↔ News ↔ Social Sentiment ↔ Stock Price

#### Cascade Failures
System overload domino effects
**Visual**: Tabs "crashing" in sequence
**Example**: Social media argument spreads across platforms

#### Breakthrough Moments
Rare emergent insights from chaos
**Visual**: All tabs suddenly align, bright flash, moment of clarity
**Example**: Random connection between cooking + chemistry + workout = life optimization insight

### Implementation Strategy

#### Camera System
```typescript
interface CameraBehavior {
  focusTab: (tabId: string, duration: number) => void;
  rapidSwitch: (tabSequence: string[], speed: number) => void;
  splitFocus: (tabIds: string[], layout: 'grid' | 'cascade' | 'chaos') => void;
  overloadEffect: () => void; // visual chaos mode
}
```

#### Visual Effects
- **Attention Trails**: Mouse cursor duplicates showing divided attention
- **Content Bleeding**: Text/images leak between tabs
- **Color Temperature**: Cool = focused, hot = chaotic
- **Screen Shake/Blur**: During rapid switching
- **Tab Overlays**: Previews creating visual noise

#### Sound Design
- Tab switching sounds that accelerate and layer
- Different audio per tab type (news = alerts, shopping = cash register)
- Audio cacophony during overload states  
- Moment of silence before breakthrough insights

#### Strategic Gameplay
- **Focus Management**: Do you control chain reactions or embrace chaos?
- **Attention Resource**: Balance depth vs. breadth of processing
- **Risk/Reward**: Chaos increases chance of breakthroughs but also crashes
- **Emergent Discovery**: Unexpected connections create the most valuable insights

This design makes the non-deterministic effects feel completely natural - because real tab-switching IS chaotic and unpredictable, but sometimes leads to genuine insights through unexpected connections. The manic, overwhelming-but-exciting feeling of browser chaos becomes the core gameplay mechanic.

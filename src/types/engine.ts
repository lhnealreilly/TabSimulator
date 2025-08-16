export type Result<T, E = GameError> = 
  | { success: true; value: T }
  | { success: false; error: E };

export enum GameError {
  INSUFFICIENT_RAM = 'INSUFFICIENT_RAM',
  TAB_NOT_FOUND = 'TAB_NOT_FOUND',
  INVALID_PHASE = 'INVALID_PHASE',
  LINK_NOT_FOUND = 'LINK_NOT_FOUND',
  RUN_IN_PROGRESS = 'RUN_IN_PROGRESS',
  NO_TABS_TO_RUN = 'NO_TABS_TO_RUN',
  MAX_TABS_REACHED = 'MAX_TABS_REACHED',
  INVALID_STATE = 'INVALID_STATE'
}

export type GameEvent = 
  | 'tabOpened'
  | 'tabClosed'
  | 'tabSwitched'
  | 'phaseChanged'
  | 'resourcesChanged'
  | 'runStarted'
  | 'runTick'
  | 'runCompleted'
  | 'goalCompleted'
  | 'gameOver'
  | 'stateChanged';

export interface GameEventData {
  tabOpened: { tab: import('./tabs').Tab };
  tabClosed: { tabId: string; ramRecovered: number };
  tabSwitched: { tabId: string };
  phaseChanged: { phase: import('./game').GamePhase };
  resourcesChanged: { resources: import('./game').Resources };
  runStarted: { duration: number };
  runTick: { progress: number; elapsed: number };
  runCompleted: { result: import('./game').RunResult };
  goalCompleted: { goal: import('./game').RoundGoal; bonus: number };
  gameOver: { finalScore: number };
  stateChanged: { state: import('./game').GameState };
}

export type EventHandler<T extends GameEvent> = (data: GameEventData[T]) => void;

export interface RunHandle {
  id: string;
  startTime: number;
  duration: number;
  participating: string[];
}
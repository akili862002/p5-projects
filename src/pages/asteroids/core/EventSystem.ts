export type EventListener = (data: any) => void;

export class EventSystem {
  private static instance: EventSystem;
  private eventListeners: Map<string, EventListener[]>;

  private constructor() {
    this.eventListeners = new Map<string, EventListener[]>();
  }

  public static getInstance(): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem();
    }
    return EventSystem.instance;
  }

  public addEventListener(eventName: string, listener: EventListener): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(listener);
  }

  public removeEventListener(eventName: string, listener: EventListener): void {
    if (!this.eventListeners.has(eventName)) return;

    const listeners = this.eventListeners.get(eventName)!;
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  public dispatchEvent(eventName: string, data?: any): void {
    if (!this.eventListeners.has(eventName)) return;

    const listeners = this.eventListeners.get(eventName)!;
    for (const listener of listeners) {
      listener(data);
    }
  }
}

// Define common game events
export enum GameEvent {
  GAME_STARTED = "game_started",
  GAME_OVER = "game_over",
  LEVEL_UP = "level_up",
  LEVEL_CHANGED = "level_changed",
  SCORE_CHANGED = "score_changed",
  LIVES_CHANGED = "lives_changed",
  ENTITY_DESTROYED = "entity_destroyed",
  SHIP_HIT = "ship_hit",
  SHIP_DESTROYED = "ship_destroyed",
  ASTEROID_DESTROYED = "asteroid_destroyed",
  BUFF_APPLIED = "buff_applied",
  BUFF_REMOVED = "buff_removed",
}

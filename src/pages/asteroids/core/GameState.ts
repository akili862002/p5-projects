import { EventSystem, GameEvent } from "./EventSystem";
import { LIVES } from "../config";

export class GameState {
  private score: number = 0;
  private lives: number = LIVES;
  private level: number = 1;
  private eventSystem: EventSystem;

  constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.reset();
  }

  /**
   * Reset the game state to default values
   */
  public reset(): void {
    this.score = 0;
    this.lives = LIVES;
    this.level = 1;

    // Dispatch events for the reset values
    this.eventSystem.dispatchEvent(GameEvent.SCORE_CHANGED, {
      score: this.score,
    });
    this.eventSystem.dispatchEvent(GameEvent.LIVES_CHANGED, {
      lives: this.lives,
    });
    this.eventSystem.dispatchEvent(GameEvent.LEVEL_CHANGED, {
      level: this.level,
    });
  }

  /**
   * Update game state
   */
  public update(): void {
    // Check for level progression based on score
    const previousLevel = this.level;
    this.level = Math.floor(this.score / 1000) + 1;

    if (this.level !== previousLevel) {
      this.eventSystem.dispatchEvent(GameEvent.LEVEL_CHANGED, {
        level: this.level,
        previousLevel,
      });
    }
  }

  /**
   * Add points to the score
   */
  public addScore(points: number): void {
    this.score += points;
    this.eventSystem.dispatchEvent(GameEvent.SCORE_CHANGED, {
      score: this.score,
    });
  }

  /**
   * Set the score to a specific value
   */
  public setScore(score: number): void {
    this.score = score;
    this.eventSystem.dispatchEvent(GameEvent.SCORE_CHANGED, {
      score: this.score,
    });
  }

  /**
   * Get the current score
   */
  public getScore(): number {
    return this.score;
  }

  /**
   * Decrement lives by 1
   */
  public decrementLives(): void {
    this.lives = Math.max(0, this.lives - 1);
    this.eventSystem.dispatchEvent(GameEvent.LIVES_CHANGED, {
      lives: this.lives,
    });

    if (this.lives <= 0) {
      this.eventSystem.dispatchEvent(GameEvent.GAME_OVER);
    }
  }

  /**
   * Set lives to a specific value
   */
  public setLives(lives: number): void {
    this.lives = lives;
    this.eventSystem.dispatchEvent(GameEvent.LIVES_CHANGED, {
      lives: this.lives,
    });
  }

  /**
   * Get the current number of lives
   */
  public getLives(): number {
    return this.lives;
  }

  /**
   * Get the current level
   */
  public getLevel(): number {
    return this.level;
  }
}

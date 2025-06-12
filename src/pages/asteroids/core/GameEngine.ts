import P5 from "p5";
import { EntityManager } from "./EntityManager";
import { InputManager } from "./InputManager";
import { EventSystem, GameEvent } from "./EventSystem";
import { SoundManager } from "../sound-manager";
import { ScoreManager } from "../score";
import { GameState } from "./GameState";

export class GameEngine {
  private static instance: GameEngine;
  private p5Instance: P5;
  private entityManager: EntityManager;
  private inputManager: InputManager;
  private eventSystem: EventSystem;
  private soundManager: SoundManager;
  private gameState: GameState;
  private paused: boolean = false;
  private gameOver: boolean = false;
  private score: number = 0;

  private constructor(p5Instance: P5) {
    this.p5Instance = p5Instance;
    this.entityManager = EntityManager.getInstance();
    this.inputManager = InputManager.getInstance();
    this.eventSystem = EventSystem.getInstance();
    this.soundManager = SoundManager.getInstance();
    this.gameState = new GameState();

    // Set up event listeners
    this.setupEventListeners();
  }

  public static getInstance(p5Instance?: P5): GameEngine {
    if (!GameEngine.instance && p5Instance) {
      GameEngine.instance = new GameEngine(p5Instance);
    } else if (!GameEngine.instance) {
      throw new Error("GameEngine must be initialized with a P5 instance");
    }
    return GameEngine.instance;
  }

  private setupEventListeners(): void {
    this.eventSystem.addEventListener(GameEvent.GAME_OVER, () => {
      this.gameOver = true;
    });

    this.eventSystem.addEventListener(GameEvent.SCORE_CHANGED, (data) => {
      if (data && data.score !== undefined) {
        this.score = data.score;
      }
    });
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public setPaused(paused: boolean): void {
    this.paused = paused;
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }

  public getScoreManager(): any {
    // We're returning a simple object that delegates to the static ScoreManager
    return {
      getScore: () => this.score,
      setScore: (score: number) => {
        this.score = score;
        this.eventSystem.dispatchEvent(GameEvent.SCORE_CHANGED, { score });
      },
      addScore: (points: number) => {
        this.score += points;
        this.eventSystem.dispatchEvent(GameEvent.SCORE_CHANGED, {
          score: this.score,
        });
      },
      getHighScore: () => ScoreManager.getHighScore(),
      saveScore: (score: number) => ScoreManager.saveScore(score),
    };
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public setup(): void {
    // Initialize systems
    this.inputManager.setupP5Handlers(this.p5Instance);

    // Reset game state
    this.resetGame();
  }

  public resetGame(): void {
    // Clear existing entities
    this.entityManager.clear();

    // Reset game state
    this.gameState.reset();

    // Reset score
    this.score = 0;
    this.eventSystem.dispatchEvent(GameEvent.SCORE_CHANGED, {
      score: this.score,
    });

    this.gameOver = false;
    this.paused = false;

    // Dispatch game started event
    this.eventSystem.dispatchEvent(GameEvent.GAME_STARTED);
  }

  public update(): void {
    if (this.paused || this.gameOver) return;

    // Update all systems
    this.entityManager.update();
    this.entityManager.checkCollisions();

    // Update game state
    this.gameState.update();
  }

  public draw(): void {
    // Draw all entities
    this.entityManager.draw();
  }

  public handleKeyboard(): void {
    // This will be handled by InputManager, but we keep this for compatibility
    // with existing code during refactoring
  }
}

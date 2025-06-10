import { p, game, stars } from "../sketch";
import { PausedDisplay } from "./pause";
import { GameOverDisplay } from "./game-over";
import { LivesDisplay } from "./lives";
import { LevelDisplay } from "./level";
import { SpeedDisplay } from "./speed";

export class HUD {
  private scoreDisplay: ScoreDisplay;
  private livesDisplay: LivesDisplay;
  private speedDisplay: SpeedDisplay;
  private fpsDisplay: FPSDisplay;
  private gameOverDisplay: GameOverDisplay;
  private pausedDisplay: PausedDisplay;
  private levelDisplay: LevelDisplay;

  constructor() {
    this.initializeComponents();
  }

  private initializeComponents(): void {
    this.scoreDisplay = new ScoreDisplay();
    this.livesDisplay = new LivesDisplay();
    this.speedDisplay = new SpeedDisplay();
    this.fpsDisplay = new FPSDisplay();
    this.gameOverDisplay = new GameOverDisplay();
    this.pausedDisplay = new PausedDisplay();
    this.levelDisplay = new LevelDisplay();
  }

  public update(): void {
    this.scoreDisplay.update();
    this.livesDisplay.update();
    this.speedDisplay.update();
    this.fpsDisplay.update();
    this.levelDisplay.update();
  }

  public render(): void {
    this.scoreDisplay.render();
    this.livesDisplay.render();
    this.speedDisplay.render();
    this.fpsDisplay.render();
    this.levelDisplay.render();

    if (game.paused && !game.isGameOver) {
      this.pausedDisplay.render();
    }
  }

  public renderGameOver(): void {
    this.gameOverDisplay.render();
  }
}

export interface HUDComponent {
  update(): void;
  render(): void;
}

class ScoreDisplay implements HUDComponent {
  private readonly fontSize = 44;
  private readonly position = { x: 20, y: 10 };

  constructor() {
    // No animation initialization needed
  }

  public update(): void {
    // No animation to update
  }

  public render(): void {
    p.fill(111, 215, 237);
    p.textSize(this.fontSize);
    p.textAlign(p.LEFT);
    p.text(`${game.score}`, this.position.x, this.position.y + this.fontSize);
  }
}

class FPSDisplay implements HUDComponent {
  private readonly position = { x: 20, y: p.height - 20 };
  private readonly fontSize = 14;
  private fpsHistory: number[] = [];
  private readonly historyLength = 60; // 1 seconds at 60fps

  public update(): void {
    // Store current frame rate
    this.fpsHistory.push(p.frameRate());

    // Keep only the last 3 seconds of data
    if (this.fpsHistory.length > this.historyLength) {
      this.fpsHistory.shift();
    }
  }

  public render(): void {
    // Calculate average FPS over 3 seconds
    const avgFps =
      this.fpsHistory.length > 0
        ? this.fpsHistory.reduce((sum, fps) => sum + fps, 0) /
          this.fpsHistory.length
        : 0;

    const infos = [
      `FPS: ${avgFps.toFixed(0)}`,
      `Flames: ${game.ship?.flames.length || 0}`,
      `Stars: ${stars.length}`,
    ];

    p.fill(255);
    p.textSize(this.fontSize);
    p.textAlign(p.LEFT);

    let y = this.position.y;
    let gap = 7;
    for (let i = infos.length - 1; i >= 0; i--) {
      p.text(infos[i], this.position.x, y);
      y -= this.fontSize + gap;
    }
  }
}

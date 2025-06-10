import { p, game } from "../sketch";
import { PausedDisplay } from "./pause";
import { GameOverDisplay } from "./game-over";
import { LivesDisplay } from "./lives";

export class HUD {
  private scoreDisplay: ScoreDisplay;
  private livesDisplay: LivesDisplay;
  private speedDisplay: SpeedDisplay;
  private fpsDisplay: FPSDisplay;
  private gameOverDisplay: GameOverDisplay;
  private pausedDisplay: PausedDisplay;

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
  }

  public update(): void {
    this.scoreDisplay.update();
    this.livesDisplay.update();
    this.speedDisplay.update();
    this.fpsDisplay.update();
  }

  public render(): void {
    this.scoreDisplay.render();
    this.livesDisplay.render();
    this.speedDisplay.render();
    this.fpsDisplay.render();

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

// Speed display component
class SpeedDisplay implements HUDComponent {
  private readonly barWidth = 300;
  private readonly barHeight = 10;
  private readonly barPosition = {
    x: p.width - 300 - 10,
    y: p.height - 10 - 10,
  };
  private readonly textOffset = { x: 25, y: 10 };

  public update(): void {
    // Speed doesn't need animation updates
  }

  public render(): void {
    this.renderSpeedBar();
    this.renderSpeedText();
  }

  private renderSpeedBar(): void {
    this.renderBarBackground();
    this.renderBarFill();
  }

  private renderBarBackground(): void {
    p.fill(50);
    p.noStroke();
    p.rect(
      this.barPosition.x,
      this.barPosition.y,
      this.barWidth,
      this.barHeight
    );
  }

  private renderBarFill(): void {
    const fillWidth = this.calculateFillWidth();
    if (fillWidth > 0) {
      p.fill(255);
      p.rect(this.barPosition.x, this.barPosition.y, fillWidth, this.barHeight);
    }
  }

  private calculateFillWidth(): number {
    const speedRatio = game.ship
      ? p.constrain(game.ship.vel.mag() / game.ship.maxSpeed, 0, 1)
      : 0;
    return this.barWidth * speedRatio;
  }

  private renderSpeedText(): void {
    p.fill(255);
    p.textSize(14);
    p.textAlign(p.CENTER);
    const speedValue = game.ship?.vel.mag().toFixed(2) || "0.00";
    p.text(
      speedValue,
      p.width - this.textOffset.x,
      this.barPosition.y - this.textOffset.y
    );
  }
}

class FPSDisplay implements HUDComponent {
  private readonly position = { x: 20, y: p.height - 14 };
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

    p.fill(255);
    p.textSize(this.fontSize);
    p.textAlign(p.LEFT);
    p.text(`FPS: ${avgFps.toFixed(0)}`, this.position.x, this.position.y);
  }
}

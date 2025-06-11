import { p, game } from "../sketch";
import { PausedDisplay } from "./pause";
import { GameOverDisplay } from "./game-over";
import { LivesDisplay } from "./lives";
import { LevelDisplay } from "./level";
import { SpeedDisplay } from "./speed";
import { Toast } from "./toast";
import { FPSDisplay } from "./infos";

export class HUD {
  private scoreDisplay: ScoreDisplay;
  private livesDisplay: LivesDisplay;
  private speedDisplay: SpeedDisplay;
  private fpsDisplay: FPSDisplay;
  private gameOverDisplay: GameOverDisplay;
  private pausedDisplay: PausedDisplay;
  private levelDisplay: LevelDisplay;
  public toast: Toast;

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
    this.toast = new Toast(p);
  }

  public update(): void {
    this.scoreDisplay.update();
    this.livesDisplay.update();
    this.speedDisplay.update();
    this.fpsDisplay.update();
    this.levelDisplay.update();
    this.toast.update();
  }

  public render(): void {
    this.scoreDisplay.render();
    this.livesDisplay.render();
    this.speedDisplay.render();
    this.fpsDisplay.render();
    this.levelDisplay.render();
    this.toast.draw();

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

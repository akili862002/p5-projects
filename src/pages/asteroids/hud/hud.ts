import { p } from "../sketch";
import { GameEngine } from "../core/GameEngine";
import { ScoreManager } from "../score";

export class HUD {
  private gameEngine: GameEngine;

  constructor() {
    this.gameEngine = GameEngine.getInstance();
  }

  public update(): void {
    // Nothing to update yet
  }

  public render(): void {
    this.renderScore();
    this.renderLives();

    if (this.gameEngine.isPaused() && !this.gameEngine.isGameOver()) {
      this.renderPausedScreen();
    }
  }

  public renderGameOver(): void {
    // Draw game over screen
    const width = p.width;
    const height = p.height;

    p.push();
    p.fill(0, 0, 0, 180);
    p.rect(0, 0, width, height);

    p.fill(255);
    p.textSize(64);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("GAME OVER", width / 2, height / 2 - 100);

    const score = this.gameEngine.getGameState().getScore();
    p.textSize(36);
    p.text(`SCORE: ${score}`, width / 2, height / 2);

    const highScore = ScoreManager.getHighScore();
    p.textSize(24);
    p.text(`HIGH SCORE: ${highScore}`, width / 2, height / 2 + 50);

    p.textSize(18);
    p.text("PRESS 'R' TO RESTART", width / 2, height / 2 + 120);
    p.pop();
  }

  private renderScore(): void {
    const score = this.gameEngine.getGameState().getScore();
    const fontSize = 44;

    p.push();
    p.fill(111, 215, 237);
    p.textSize(fontSize);
    p.textAlign(p.LEFT);
    p.text(`${score}`, 20, 10 + fontSize);
    p.pop();
  }

  private renderLives(): void {
    const lives = this.gameEngine.getGameState().getLives();

    p.push();
    p.fill(255);
    p.textSize(18);
    p.textAlign(p.LEFT);
    p.text(`LIVES: ${lives}`, 20, 70);
    p.pop();
  }

  private renderPausedScreen(): void {
    p.push();
    p.fill(0, 0, 0, 180);
    p.rect(0, 0, p.width, p.height);

    p.fill(255);
    p.textSize(48);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("PAUSED", p.width / 2, p.height / 2);

    p.textSize(18);
    p.text("CLICK TO RESUME", p.width / 2, p.height / 2 + 50);
    p.pop();
  }
}

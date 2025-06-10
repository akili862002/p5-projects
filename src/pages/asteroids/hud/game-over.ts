import { HUDComponent } from "./hud";
import { p, game } from "../sketch";
import { ScoreManager } from "../score";

export class GameOverDisplay implements HUDComponent {
  private readonly centerX = p.width / 2;
  private readonly centerY = p.height / 2;
  private readonly maxTopScores = 5;

  public update(): void {
    // Game over screen doesn't need updates
  }

  public render(): void {
    this.renderGameOverText();
    this.renderScoreSection();
    this.renderTopScores();
    this.renderRestartPrompt();
  }

  private renderGameOverText(): void {
    const pulseAmount = p.sin(p.frameCount * 0.1) * 20 + 235;
    p.fill(255, pulseAmount);
    p.textSize(60);
    p.textAlign(p.CENTER);
    p.text("GAME OVER", this.centerX, this.centerY - 100);
  }

  private renderScoreSection(): void {
    const highScore = ScoreManager.getHighScore();
    p.textSize(32);

    if (game.score >= highScore) {
      this.renderNewHighScore();
    } else {
      this.renderRegularScore(highScore);
    }
  }

  private renderNewHighScore(): void {
    p.fill(255, 215, 0);
    p.text(`NEW HIGH SCORE: ${game.score}!`, this.centerX, this.centerY - 40);
  }

  private renderRegularScore(highScore: number): void {
    p.fill(255);
    p.text(`Your Score: ${game.score}`, this.centerX, this.centerY - 40);
    p.text(`High Score: ${highScore}`, this.centerX, this.centerY);
  }

  private renderTopScores(): void {
    const topScores = ScoreManager.getTopScores().slice(0, this.maxTopScores);

    p.fill(200, 200, 255);
    p.textSize(20);
    p.text("TOP SCORES", this.centerX, this.centerY + 40);

    p.textSize(16);
    topScores.forEach((entry, index) => {
      const isCurrentScore = entry.score === game.score;
      p.fill(isCurrentScore ? p.color(255, 255, 0) : p.color(255));
      p.text(
        `${index + 1}. ${entry.playerName}: ${entry.score}`,
        this.centerX,
        this.centerY + 70 + index * 25
      );
    });
  }

  private renderRestartPrompt(): void {
    const flashRate = p.sin(p.frameCount * 0.2) * 127 + 128;
    p.fill(255, flashRate);
    p.textSize(24);
    p.text("Press [Enter] to play again", this.centerX, this.centerY + 300);
  }
}

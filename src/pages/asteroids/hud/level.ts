import { HUDComponent } from "./hud";
import { game, p } from "../sketch";

export class LevelDisplay implements HUDComponent {
  private targetProgress: number = 0;
  private currentProgress: number = 0;
  private readonly easeSpeed: number = 0.1;

  constructor() {}

  public update(): void {
    // Update the target progress based on the current score
    this.targetProgress = game.score / 1000;

    // Smoothly interpolate current progress toward target
    this.currentProgress +=
      (this.targetProgress - this.currentProgress) * this.easeSpeed;
  }

  public render(): void {
    let x = p.width / 2;
    let y = 60;
    p.textSize(36);
    p.textAlign(p.CENTER);
    p.fill(253, 194, 113);
    p.text(`LEVEL ${game.getLevel()}`, x, y);

    p.push();
    p.fill(253, 194, 113);
    p.noStroke();
    p.rectMode(p.CENTER);
    p.translate(p.width / 2, 0);
    p.rect(0, 0, this.currentProgress * p.width, 10);
    p.pop();
  }
}

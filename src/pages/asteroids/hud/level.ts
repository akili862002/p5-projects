import { HUDComponent } from "./hud";
import { game, p } from "../sketch";
import { POINTS_PER_LEVEL } from "../config";

export class LevelDisplay implements HUDComponent {
  private targetProgress: number = 0;
  private currentProgress: number = 0;
  private readonly easeSpeed: number = 0.1;

  constructor() {}

  public update(): void {
    this.targetProgress = (game.score % POINTS_PER_LEVEL) / POINTS_PER_LEVEL;

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

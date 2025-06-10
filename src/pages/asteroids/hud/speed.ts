import { HUDComponent } from "./hud";
import { p, game } from "../sketch";

export class SpeedDisplay implements HUDComponent {
  private readonly barWidth = 300;
  private readonly barHeight = 10;
  private readonly barPosition = {
    x: p.width - 300 - 10,
    y: p.height - 10 - 10,
  };
  private readonly textOffset = { x: 50, y: 10 };

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
    p.textAlign(p.LEFT);
    const speedValue = Number(game.ship?.vel.mag().toFixed(2)) || "0.00";
    p.text(
      speedValue,
      p.width - this.textOffset.x,
      this.barPosition.y - this.textOffset.y
    );
  }
}

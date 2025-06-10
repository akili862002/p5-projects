import { HUDComponent } from "./hud";
import { p } from "../sketch";

export class PausedDisplay implements HUDComponent {
  private readonly centerX = p.width / 2;
  private readonly centerY = p.height / 2;

  public update(): void {
    // Paused screen doesn't need updates
  }

  public render(): void {
    const pulseAmount = p.sin(p.frameCount * 0.1) * 20 + 235;
    p.fill(255, pulseAmount);
    p.textSize(60);
    p.textAlign(p.CENTER);
    p.text("PAUSED", this.centerX, this.centerY);

    const flashRate = p.sin(p.frameCount * 0.2) * 127 + 128;

    p.fill(255, flashRate);
    p.textSize(24);
    p.text(
      "Click on the game or press any key to resume",
      this.centerX,
      this.centerY + 50
    );
  }
}

import { HUDComponent } from "./hud";
import { p, game, heartImage } from "../sketch";
import { LIVES } from "../config";

export class LivesDisplay implements HUDComponent {
  private readonly heartSize = 40;
  private readonly heartGap = 3;
  private readonly position = { y: 10 };
  private readonly activeOpacity = 255;
  private readonly inactiveOpacity = 40;
  private previousLives: number;
  private flashingHeartIndex: number | null = null;
  private flashTimer = 0;
  private readonly flashDuration = 60; // frames (1 second at 60fps)

  constructor() {
    this.previousLives = game?.lives || LIVES;
  }

  public update(): void {
    // Check if we lost a life
    if (game.lives < this.previousLives) {
      // Flash the last remaining heart (leftmost of the active hearts)
      this.flashingHeartIndex = game.lives - 1;
      this.flashTimer = this.flashDuration;
    }

    // Update flash timer
    if (this.flashTimer > 0) {
      this.flashTimer--;
    } else {
      this.flashingHeartIndex = null;
    }

    this.previousLives = game.lives;
  }

  public render(): void {
    for (let i = 0; i < game.maxLives; i++) {
      const heartX = this.calculateHeartX(i);
      this.setHeartOpacity(i);
      p.image(
        heartImage,
        heartX,
        this.position.y,
        this.heartSize,
        this.heartSize
      );
    }
    p.noTint();
  }

  private calculateHeartX(index: number): number {
    return p.width - (index + 1) * (this.heartSize + this.heartGap) - 10;
  }

  private setHeartOpacity(index: number): void {
    if (index === this.flashingHeartIndex) {
      // Flash the leftmost active heart
      const flashRate = p.sin(p.frameCount * 0.5) * 127 + 128;
      p.tint(flashRate); // Red flashing
    } else {
      const opacity =
        index >= game.lives ? this.inactiveOpacity : this.activeOpacity;
      p.tint(255, opacity);
    }
  }
}

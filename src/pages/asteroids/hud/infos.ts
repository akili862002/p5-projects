import { game, p, stars } from "../sketch";
import { HUDComponent } from "./hud";

export class FPSDisplay implements HUDComponent {
  private readonly position = { x: 20, y: p.height - 20 };
  private readonly fontSize = 12;
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
      `FPS  : ${avgFps.toFixed(0)}`,
      `Objs : ${this.countEntities()}`,
      `Buffs: ${game.getBuffs.map((buff) => buff.name).join(", ") || "None"}`,
    ];

    p.push();
    p.fill(255);
    p.textSize(this.fontSize);
    p.textAlign(p.LEFT);
    p.textFont("monospace");

    let y = this.position.y;
    let gap = 7;
    for (let i = infos.length - 1; i >= 0; i--) {
      p.text(infos[i], this.position.x, y);
      y -= this.fontSize + gap;
    }
    p.pop();
  }

  private countEntities(): number {
    const starsCount = stars.length;
    const shipFlamesCount = game.ship?.flames.length || 0;
    const asteroidsCount = game.getAsteroids.length;
    const bulletsCount = game.getBullets.length;
    const rocketsCount = game.getRockets.length;
    const rocketFlamesCount = game.getRockets.reduce(
      (sum, rocket) => sum + rocket.flames.length,
      0
    );
    const explosionEffectsCount = game.getExplosionEffects.reduce(
      (sum, explosion) => sum + explosion.sparks.length,
      0
    );
    const pointIndicatorsCount = game.getPointIndicators.count();

    return (
      starsCount +
      shipFlamesCount +
      asteroidsCount +
      bulletsCount +
      rocketsCount +
      rocketFlamesCount +
      explosionEffectsCount +
      pointIndicatorsCount
    );
  }
}

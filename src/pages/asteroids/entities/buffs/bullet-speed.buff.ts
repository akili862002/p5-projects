import { Game } from "../../game";
import { Ship } from "../ship";
import { IBuff } from "./buff";

export class BulletSpeedBuff implements IBuff {
  private readonly rate: number;
  applied = false;

  constructor(private ship: Ship, percentage: number) {
    this.rate = percentage / 100;
  }

  apply() {
    if (this.applied) return;

    const newSpeed = this.ship.bulletSpeed * (1 + this.rate);
    this.ship.setBulletSpeed(newSpeed);
    this.applied = true;
  }

  remove() {
    if (!this.applied) return;

    const newSpeed = this.ship.bulletSpeed / (1 + this.rate);
    this.ship.setBulletSpeed(newSpeed);
  }

  get name() {
    return `+${this.rate * 100}% Bullet Speed`;
  }
}

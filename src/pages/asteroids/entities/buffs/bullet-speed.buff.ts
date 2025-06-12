import { Game } from "../../game";
import { Ship } from "../ship";
import { IBuff } from "./buff";

export class BulletSpeedBuff implements IBuff {
  private readonly rate: number;

  constructor(private ship: Ship, percentage: number) {
    this.rate = percentage / 100;
  }

  apply() {
    const newSpeed = this.ship.bulletSpeed * (1 + this.rate);
    this.ship.setBulletSpeed(newSpeed);
  }

  remove() {
    const newSpeed = this.ship.bulletSpeed / (1 + this.rate);
    this.ship.setBulletSpeed(newSpeed);
  }

  get name() {
    return "Bullet Speed";
  }
}

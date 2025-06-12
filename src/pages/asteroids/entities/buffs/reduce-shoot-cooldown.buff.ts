import { Ship } from "../ship";
import { IBuff } from "./buff";

export class ReduceShootCooldownBuff implements IBuff {
  private rate: number;

  constructor(private ship: Ship, percentage: number) {
    this.rate = percentage / 100;
  }

  apply() {
    this.ship.shootCooldown = this.ship.shootCooldown * (1 - this.rate);
  }

  remove() {
    this.ship.shootCooldown = this.ship.shootCooldown / (1 - this.rate);
  }

  get name() {
    return `Shoot Faster ${this.rate * 100}%`;
  }
}

import { Ship } from "../ship";
import { IBuff } from "./buff";

export class ReduceShootCooldownBuff implements IBuff {
  private rate: number;
  applied = false;

  constructor(private ship: Ship, percentage: number) {
    this.rate = percentage / 100;
  }

  apply() {
    if (this.applied) return;

    this.ship.shootCooldown = this.ship.shootCooldown * (1 - this.rate);
    this.applied = true;
  }

  remove() {
    if (!this.applied) return;

    this.ship.shootCooldown = this.ship.shootCooldown / (1 - this.rate);
  }

  get name() {
    return `${this.rate * 100}% Faster Firing`;
  }
}

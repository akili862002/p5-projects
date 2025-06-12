import { Ship } from "../ship";
import { IBuff } from "./buff";

export class ReduceKnockbackBuff implements IBuff {
  private rate: number;
  applied = false;

  constructor(private ship: Ship, percentage: number) {
    this.rate = percentage / 100;
  }

  apply() {
    if (this.applied) return;
    this.applied = true;

    const newForce = this.ship.knockbackForce * (1 - this.rate);
    this.ship.setKnockbackForce(newForce);
  }

  remove() {
    if (!this.applied) return;

    const newForce = this.ship.knockbackForce / (1 - this.rate);
    this.ship.setKnockbackForce(newForce);
  }

  get name() {
    return `-${this.rate * 100}% Bullet Knockback`;
  }
}

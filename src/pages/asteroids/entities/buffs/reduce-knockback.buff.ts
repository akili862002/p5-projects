import { Ship } from "../ship";
import { IBuff } from "./buff";

export class ReduceKnockbackBuff implements IBuff {
  private rate: number;
  constructor(private ship: Ship, percentage: number) {
    this.rate = percentage / 100;
  }

  apply() {
    const newForce = this.ship.knockbackForce * (1 - this.rate);
    this.ship.setKnockbackForce(newForce);
  }

  remove() {
    const newForce = this.ship.knockbackForce / (1 - this.rate);
    this.ship.setKnockbackForce(newForce);
  }

  get name() {
    return `Reduce Knockback ${this.rate * 100}%`;
  }
}

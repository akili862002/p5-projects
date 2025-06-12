import { Ship } from "../ship";
import { IBuff } from "./buff";

export class DoubleGunBuff implements IBuff {
  applied = false;

  constructor(private ship: Ship) {}

  apply() {
    if (this.applied) return;

    this.ship.switchGunMode("double");
    this.applied = true;
  }

  remove() {
    if (!this.applied) return;

    this.ship.switchGunMode("single");
  }

  get name() {
    return "Double Gun";
  }
}

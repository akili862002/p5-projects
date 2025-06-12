import { Ship } from "../ship";
import { IBuff } from "./buff";

export class DoubleGunBuff implements IBuff {
  constructor(private ship: Ship) {}

  apply() {
    this.ship.switchGunMode("double");
  }

  remove() {
    this.ship.switchGunMode("single");
  }

  get name() {
    return "Double Gun";
  }
}

import { Game } from "../../game";
import { BuffType, IBuff } from "./buff";

export class HealBuff implements IBuff {
  applied = false;

  constructor(private game: Game) {}

  apply() {
    if (this.applied) return;
    this.applied = true;

    if (this.game.lives < this.game.maxLives) {
      this.game.lives++;
    }
  }

  remove() {
    if (!this.applied) return;
    this.applied = false;
  }

  get name() {
    return "Heal 1 Life";
  }
}

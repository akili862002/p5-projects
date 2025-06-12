import { Game } from "../../game";
import { IBuff } from "./buff";

export class HealBuff implements IBuff {
  constructor(private game: Game) {}

  apply() {
    if (this.game.lives < this.game.maxLives) {
      this.game.lives++;
    }
  }

  remove() {}

  get name() {
    return "Heal";
  }
}

import { LIVES } from "../../config";
import { Game } from "../../game";
import { IBuff } from "./buff";

export class ExtraLiveBuff implements IBuff {
  constructor(private game: Game) {}

  apply() {
    this.game.maxLives++;
  }

  remove() {
    if (this.game.maxLives > LIVES) {
      this.game.maxLives--;
    }
  }

  get name() {
    return "Extra Live";
  }
}

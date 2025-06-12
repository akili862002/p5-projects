import { LIVES } from "../../config";
import { Game } from "../../game";
import { IBuff } from "./buff";

export class ExtraLiveBuff implements IBuff {
  constructor(private game: Game) {}
  applied = false;

  apply() {
    if (this.applied) return;

    this.applied = true;
    this.game.maxLives++;
    this.game.lives++;
  }

  remove() {
    if (this.applied && this.game.maxLives > LIVES) {
      this.game.maxLives--;
    }
  }

  get name() {
    return "Extra Live";
  }
}

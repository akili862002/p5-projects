import P5 from "p5";
import { p } from "../sketch";

export class Flame {
  pos: P5.Vector;
  vel: P5.Vector;
  size = 5;
  heading: number;
  color: P5.Color;

  constructor(args: {
    pos: P5.Vector;
    heading: number;
    vel: P5.Vector;
    color: P5.Color;
  }) {
    this.pos = args.pos.copy();
    this.vel = args.vel.copy();
    this.heading = args.heading;
    this.color = args.color;
  }

  update() {
    // this.pos.add(this.vel);
    this.size -= 0.2;
  }

  draw() {
    p.push();
    p.translate(this.pos.x, this.pos.y);
    p.rotate(this.heading);
    p.fill(this.color);
    // The rect is centered at 0,0 which may not be what you want
    // Try drawing with negative offsets to center the rectangle
    p.rect(-this.size / 2, -this.size / 2, this.size, this.size);
    // Or try drawing a different shape like a triangle for flames
    // p.triangle(-this.size/2, this.size/2, 0, -this.size/2, this.size/2, this.size/2);
    p.pop();
  }

  shouldRemove() {
    return this.size < 0;
  }
}

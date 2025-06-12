import { Asteroid } from "./asteroid";
import { p } from "../sketch";
import P5, { Vector } from "p5";
import { BULLET_COLOR, BULLET_LIFESPAN, BULLET_RADIUS } from "../config";
import { hexToRgb } from "../utils";

export class Bullet {
  pos: P5.Vector;
  vel: P5.Vector;
  r = BULLET_RADIUS;
  lifespan = BULLET_LIFESPAN; // Frames until bullet disappears
  bulletColor = hexToRgb(BULLET_COLOR);

  constructor(args: { x: number; y: number; heading: number; speed: number }) {
    this.pos = p.createVector(args.x, args.y);
    this.vel = Vector.fromAngle(args.heading).mult(args.speed);
  }

  update() {
    this.pos.add(this.vel);
    this.lifespan--;
  }

  draw() {
    p.push();
    p.stroke(this.bulletColor);
    p.strokeWeight(2);

    const scale = 2;
    p.line(
      this.pos.x,
      this.pos.y,
      this.pos.x - this.vel.x * scale,
      this.pos.y - this.vel.y * scale
    );

    p.noStroke();
    p.fill(this.bulletColor);
    p.circle(this.pos.x, this.pos.y, this.r * 2);
    p.pop();
  }

  intersects(asteroid: Asteroid) {
    const d = p.dist(this.pos.x, this.pos.y, asteroid.pos.x, asteroid.pos.y);
    return d < this.r + asteroid.r;
  }

  edges() {
    if (this.pos.x < -this.r) {
      this.pos.x = p.width + this.r;
    } else if (this.pos.x > p.width + this.r) {
      this.pos.x = -this.r;
    }

    if (this.pos.y < -this.r) {
      this.pos.y = p.height + this.r;
    } else if (this.pos.y > p.height + this.r) {
      this.pos.y = -this.r;
    }
  }

  shouldRemove() {
    return this.lifespan <= 0;
  }
}

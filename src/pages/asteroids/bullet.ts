import { Asteroid } from "./asteroid";
import { bulletImg, p } from "./asteroids.sketch";
import P5, { Vector } from "p5";

export class Bullet {
  pos: P5.Vector;
  vel: P5.Vector;
  r = 4;
  lifespan = 70; // Frames until bullet disappears

  constructor(x: number, y: number, heading: number) {
    this.pos = p.createVector(x, y);
    const speed = 10;
    this.vel = Vector.fromAngle(heading).mult(speed);
  }

  update() {
    this.pos.add(this.vel);
    this.lifespan--;
  }

  draw() {
    p.push();
    p.stroke(124, 239, 237);
    p.strokeWeight(2);

    const scale = 2;
    p.line(
      this.pos.x,
      this.pos.y,
      this.pos.x + this.vel.x * scale,
      this.pos.y + this.vel.y * scale
    );
    p.pop();

    // draw bullet
    // p.push();
    // p.imageMode(p.CENTER);
    // p.translate(this.pos.x, this.pos.y);
    // p.rotate(this.vel.heading());
    // p.image(bulletImg, 0, 0, this.r * 2, this.r * 2);
    // p.pop();
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

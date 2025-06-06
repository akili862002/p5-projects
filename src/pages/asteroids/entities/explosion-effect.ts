import P5 from "p5";
import { p } from "../sketch";

export class ExplosionEffect {
  pos: P5.Vector;
  vel: P5.Vector;
  size: number;
  duration: number;
  sparks: Spark[] = [];

  constructor(pos: P5.Vector, vel: P5.Vector, size: number, duration = 2 * 60) {
    this.pos = pos;
    this.vel = vel;
    this.size = size;
    this.duration = duration;

    // Get the angle of the explosion velocity
    const explosionAngle = this.vel.heading();

    // Create more sparks for a bigger explosion effect

    for (let i = 0; i < size; i++) {
      // Create sparks that mostly flow in the direction of the explosion
      // with some random spread
      const angleSpread = p.random(-Math.PI / 6, Math.PI / 6);
      const sparkAngle = explosionAngle + angleSpread;
      const sparkSpeed = p.random(0.5, 3) * (this.size / 10);

      const sparkVel = p.createVector(
        Math.cos(sparkAngle) * sparkSpeed,
        Math.sin(sparkAngle) * sparkSpeed
      );
      sparkVel.mult(0.7);

      // Add some of the original explosion velocity
      //   sparkVel.add(this.vel.copy().mult(0.3));

      //   sparkVel.limit(3);
      const sparkMagnitude = sparkVel.mag();
      const sparkSize = p.map(sparkMagnitude, 0, vel.mag(), 10, 6);

      const spark = new Spark(this.pos.copy(), sparkVel, sparkSize);

      this.sparks.push(spark);
    }
  }

  update() {
    this.duration--;

    for (let i = 0; i < this.sparks.length; i++) {
      this.sparks[i].update();
    }
  }

  draw() {
    for (let i = 0; i < this.sparks.length; i++) {
      this.sparks[i].draw();
    }
  }

  shouldRemove() {
    return this.duration <= 0;
  }
}

export class Spark {
  pos: P5.Vector;
  vel: P5.Vector;
  size: number;
  rotation: number;
  constructor(pos: P5.Vector, vel: P5.Vector, size: number) {
    this.pos = pos;
    this.vel = vel;
    this.size = size;
    this.rotation = p.random(0, Math.PI * 2);
  }

  update() {
    if (this.size > 0) {
      this.size -= 0.05;

      this.pos.add(this.vel);
      this.vel.mult(0.95);
      this.rotation += p.map(this.vel.mag(), 0, 5, 0.01, 0.1);
    }
  }

  draw() {
    if (this.size <= 0) {
      return;
    }

    p.push();
    p.translate(this.pos.x, this.pos.y);
    p.imageMode(p.CENTER);
    p.fill(116, 240, 243);
    p.rotate(this.rotation);
    p.rect(0, 0, this.size, this.size);
    p.pop();
  }
}

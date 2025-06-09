import { Vector } from "p5";
import { p } from "../sketch";
import {
  ROCKET_LIFESPAN,
  ROCKET_MAX_SPEED,
  ROCKET_STEER_FORCE,
} from "../config";
import { rocketImg, firerImg } from "../sketch";
import { Flame } from "./flame";

export class Rocket {
  pos: Vector;
  vel: Vector;
  maxSpeed = ROCKET_MAX_SPEED;
  r = 4;
  lifespan = ROCKET_LIFESPAN;
  allowLaunch = false;
  trackingForce = ROCKET_STEER_FORCE;
  flames: Flame[] = [];

  constructor(x: number, y: number) {
    this.pos = p.createVector(x, y);
    this.vel = p.createVector(0, 0);
  }

  update() {
    if (this.allowLaunch) {
      this.pos.add(this.vel);
      this.vel.limit(this.maxSpeed);
    }
    const allowedLaunchTime = 60 * 3;
    if (this.lifespan < ROCKET_LIFESPAN - allowedLaunchTime) {
      this.allowLaunch = true;
    }

    this.lifespan--;

    for (const flame of this.flames) {
      flame.update();
      if (flame.shouldRemove()) {
        this.flames.splice(this.flames.indexOf(flame), 1);
      }
    }
  }

  draw() {
    p.push();
    p.translate(this.pos.x, this.pos.y);
    const angle = this.vel.heading() + p.PI / 2;
    p.rotate(angle);

    if (!this.allowLaunch) {
      // Draw a red circle to warning the player
      // Create a pulsating effect for the warning circle
      const pulseAmount = p.sin(p.frameCount * 0.1) * 20 + 50; // Values between 30-70
      p.fill(255, 69, 90, pulseAmount);
      p.circle(0, 0, 40);
    }

    // Use the rocket image instead of drawing shapes
    p.imageMode(p.CENTER);
    p.image(rocketImg, 0, 0, 30, 30);

    // const vel = this.vel.mag();
    // if (this.allowLaunch && vel > 1) {
    //   p.translate(0, 20);
    //   p.image(firerImg, 0, 0, 15, 15);
    // }

    p.pop();

    for (const flame of this.flames) {
      flame.draw();
    }
  }

  tracking(target: Vector) {
    const desired = Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    const steer = Vector.sub(desired, this.vel);
    steer.limit(this.trackingForce);
    this.vel.add(steer);

    if (this.vel.mag() > 2 && this.allowLaunch) {
      this.createFlames();
    }
  }

  createFlames() {
    // Create realistic flame particles with randomized properties
    const flameCount = 3;

    // Get position behind the ship
    const shipBackPos = this.pos
      .copy()
      .add(Vector.fromAngle(this.vel.heading() + p.PI).mult(this.r * 0.9));

    const colors = ["#FB511C", "#F9C630", "#FCF6B4"];
    const color = colors[p.floor(p.random(0, colors.length))];

    for (let i = 0; i < flameCount; i++) {
      const offsetAngle = p.random(-1, 1) + this.vel.heading() + p.PI;
      const offsetMagnitude = p.random(0, this.r * 2);
      const flamePos = shipBackPos
        .copy()
        .add(Vector.fromAngle(offsetAngle).mult(offsetMagnitude));

      const flame = new Flame({
        pos: flamePos,
        heading: this.vel.heading() + p.random(-1, 1),
        color: p.color(color),
      });

      // Randomize flame size
      flame.size = p.random(1, 5);

      this.flames.push(flame);
    }
  }

  shouldRemove() {
    return this.lifespan <= 0;
  }

  intersects(entity: { pos: Vector; r: number }) {
    return this.pos.dist(entity.pos) < this.r + entity.r;
  }

  edges() {
    // Wrap around edges of canvas with momentum preservation
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
}

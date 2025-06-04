import { Vector } from "p5";
import { p } from "../sketch";
import { ROCKET_LIFESPAN, ROCKET_MAX_SPEED } from "../config";
import { rocketImg, firerImg } from "../sketch";

export class Rocket {
  pos: Vector;
  vel: Vector;
  maxSpeed = ROCKET_MAX_SPEED;
  r = 4;
  lifespan = ROCKET_LIFESPAN;
  allowLaunch = false;
  trackingForce = 0.04;

  constructor(x: number, y: number) {
    this.pos = p.createVector(x, y);
    this.vel = p.createVector(0, 0);
  }

  update() {
    if (this.allowLaunch) {
      this.pos.add(this.vel);
      this.vel.limit(this.maxSpeed);
    }
    if (this.lifespan < ROCKET_LIFESPAN * (2 / 3)) {
      this.allowLaunch = true;
    }

    this.lifespan--;
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
      p.fill(255, 0, 0, pulseAmount);
      p.circle(0, 0, 40);
    }

    // Use the rocket image instead of drawing shapes
    p.imageMode(p.CENTER);
    p.image(rocketImg, 0, 0, 30, 30);

    const vel = this.vel.mag();
    if (this.allowLaunch && vel > 1) {
      p.translate(0, 20);
      p.image(firerImg, 0, 0, 15, 15);
    }

    p.pop();
  }

  tracking(target: Vector) {
    const desired = Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    const steer = Vector.sub(desired, this.vel);
    steer.limit(this.trackingForce);
    this.vel.add(steer);
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

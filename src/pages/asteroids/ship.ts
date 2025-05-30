import P5, { Vector } from "p5";
import { isBoosting, isDebug, p, shipImg } from "./asteroids.sketch";
import { Asteroid } from "./asteroid";

export class Ship {
  pos: P5.Vector;
  vel: P5.Vector;
  acc: P5.Vector;
  r = 20;
  heading: number;
  rotation = 0;
  maxSpeed = 10;
  friction = 0.99;
  invincible = false;
  invincibleTimer = 0;
  maxRotation = 0.1;

  constructor(x: number, y: number) {
    this.pos = p.createVector(x, y);
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.heading = p.PI / 2;
    this.invincible = true;
    this.invincibleTimer = 120; // Invincible for 2 seconds (60 frames per second)
  }

  update() {
    // Update heading based on rotation
    this.heading += this.rotation;
    this.rotation *= 0.9; // Dampen rotation
    if (Math.abs(this.rotation) > this.maxRotation) {
      this.rotation = this.maxRotation * Math.sign(this.rotation);
    }

    // Update position with physics
    this.vel.add(this.acc);
    this.vel.mult(this.friction);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Handle invincibility timer
    if (this.invincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }
  }

  applyForce(force: P5.Vector) {
    this.acc.add(force);
  }

  draw() {
    p.push();
    p.translate(this.pos.x, this.pos.y);
    p.rotate(this.heading + p.PI / 2); // Add PI/2 to make the ship point up

    // Flash if invincible
    if (this.invincible && p.frameCount % 10 < 5) {
      p.tint(255, 150); // Semi-transparent
    }

    p.imageMode(p.CENTER);
    p.image(shipImg, 0, 0, this.r * 2, this.r * 2);

    // Draw thruster when boosting
    if (isBoosting) {
      p.fill(255, 150, 0);
      p.triangle(-this.r * 0.5, this.r, 0, this.r * 2.5, this.r * 0.5, this.r);
    }

    p.pop();

    if (isDebug) {
      p.push();
      p.noFill();
      p.stroke(0, 255, 0);
      p.circle(this.pos.x, this.pos.y, this.r * 2);
      p.pop();
    }
  }

  boost() {
    const force = Vector.fromAngle(this.heading).mult(0.15);
    this.applyForce(force);
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

  intersects(asteroid: Asteroid) {
    if (this.invincible) return false;

    const d = this.pos.dist(asteroid.pos);
    return d < this.r + asteroid.r;
  }
}

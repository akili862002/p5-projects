import P5, { Vector } from "p5";
import { firerImg, isBoosting, isDebug, p, shipImg } from "../sketch";
import { Asteroid } from "./asteroid";
import {
  SHIP_MAX_SPEED,
  SHIP_FRICTION,
  SHIP_INVINCIBLE_TIME,
  SHIP_MAX_ROTATION,
} from "../config";

export class Ship {
  pos: P5.Vector;
  vel: P5.Vector;
  acc: P5.Vector;
  r = 20;
  heading: number;
  rotation = 0;
  maxSpeed = SHIP_MAX_SPEED;
  friction = SHIP_FRICTION;
  invincible = false;
  invincibleTimer = 0;
  maxRotation = SHIP_MAX_ROTATION;
  positionHistory: P5.Vector[] = [];
  maxHistoryLength = 60; // Store positions for 60 frames

  constructor(x: number, y: number) {
    this.pos = p.createVector(x, y);
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.heading = -p.PI / 2;
    this.invincible = true;
    this.invincibleTimer = SHIP_INVINCIBLE_TIME;
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
      p.push();
      p.translate(0, this.r * 1.8);
      const scale = 1.3;
      p.image(firerImg, 0, 0, this.r * scale, this.r * scale);
      p.pop();
    }

    p.pop();

    if (isDebug) {
      p.push();
      p.noFill();
      p.stroke(0, 255, 0);
      p.circle(this.pos.x, this.pos.y, this.r * 2);
      p.pop();

      // draw velocity vector
      p.push();
      p.noFill();
      p.stroke(255);
      const scale = 10;
      p.line(
        this.pos.x,
        this.pos.y,
        this.pos.x + this.vel.x * scale,
        this.pos.y + this.vel.y * scale
      );
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

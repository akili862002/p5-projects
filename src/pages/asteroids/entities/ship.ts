import P5, { Vector } from "p5";
import { isDebug, p, shipImg } from "../sketch";
import { Asteroid } from "./asteroid";
import {
  SHIP_MAX_SPEED,
  SHIP_FRICTION,
  SHIP_INVINCIBLE_TIME,
  SHIP_MAX_ROTATION,
  SHIP_BOOST_FORCE,
  SHIP_KNOCKBACK_FORCE,
  SHIP_SHOOT_COOLDOWN,
  BULLET_SPEED,
} from "../config";
import { Bullet } from "./bullet";
import { Flame } from "./flame";

type GunMode = "single" | "double";

export class Ship {
  pos: P5.Vector;
  vel: P5.Vector;
  acc: P5.Vector;
  r = 24;
  heading: number;
  rotation = 0;
  maxSpeed = SHIP_MAX_SPEED;
  friction = SHIP_FRICTION;
  invincible = false;
  invincibleTimer = 0;
  maxRotation = SHIP_MAX_ROTATION;
  positionHistory: P5.Vector[] = [];
  maxHistoryLength = 60; // Store positions for 60 frames
  isBoosting = false;
  lastShootTime = 0;
  shootCooldown = SHIP_SHOOT_COOLDOWN;
  knockbackForce = SHIP_KNOCKBACK_FORCE;
  flames: Flame[] = [];
  gunMode: GunMode = "single";
  isDead = false;
  bulletSpeed = BULLET_SPEED;

  constructor(x: number, y: number) {
    this.reset(x, y);
  }

  reset(x: number, y: number) {
    this.pos = p.createVector(x, y);
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.heading = -p.PI / 2;
    this.invincible = true;
    this.invincibleTimer = SHIP_INVINCIBLE_TIME;
    this.flames = [];
    this.lastShootTime = 0;
    this.isBoosting = false;
    this.rotation = 0;
    this.isDead = false;
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

    // Handl e invincibility timer
    if (this.invincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    // Update flames
    for (let flame of this.flames) {
      flame.update();
      if (flame.shouldRemove()) {
        this.flames = this.flames.filter((f) => f !== flame);
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

    // if (this.vel.mag() > 0.1) {
    //   p.fill(116, 239, 248, 50);
    //   p.circle(0, 0, this.r * 3);
    //   p.fill(255, 255, 255, 255);
    // }

    p.imageMode(p.CENTER);
    const width = this.r * 2;
    const aspect = 1;
    const height = width / aspect;
    p.image(shipImg, 0, 0, width, height);

    // Draw thruster when boosting
    if (this.isBoosting) {
      // p.push();
      // p.translate(0, this.r * 1.8);
      // const scale = 1.3;
      // p.image(firerImg, 0, 0, this.r * scale, this.r * scale);
      // p.pop();
      // Create flames
    }

    // Draw flames

    p.pop();

    for (let flame of this.flames) {
      flame.draw();
    }

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
    const force = Vector.fromAngle(this.heading).setMag(SHIP_BOOST_FORCE);
    this.applyForce(force);
    this.createFlames();
  }

  createFlames() {
    // Create realistic flame particles with randomized properties
    const flameCount = 8;

    // Get position behind the ship
    const shipBackPos = this.pos
      .copy()
      .add(Vector.fromAngle(this.heading + p.PI).mult(this.r * 0.9));

    for (let i = 0; i < flameCount; i++) {
      // Add randomness to position
      const offsetAngle = p.random(-1, 1) + this.heading + p.PI;
      const offsetMagnitude = p.random(0, this.r * 0.4);
      const flamePos = shipBackPos
        .copy()
        .add(Vector.fromAngle(offsetAngle).mult(offsetMagnitude));

      let color = p.color(116, 239, 248);

      const flame = new Flame({
        pos: flamePos,
        heading: this.heading + p.random(-0.3, 0.3),
        color: color,
        sizeDecrease: p.random(0.05, 0.2),
      });

      // Randomize flame size
      flame.size = p.random(1, 5);

      this.flames.push(flame);
    }
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

  addRotation(rotation: number) {
    this.rotation += rotation;
  }

  shoot() {
    const now = p.millis();
    if (now - this.lastShootTime < this.shootCooldown) return;
    this.lastShootTime = now;

    // Knockback the ship
    const knockbackForce = Vector.fromAngle(this.heading)
      .mult(-1)
      .setMag(this.knockbackForce);
    this.applyForce(knockbackForce);

    if (this.gunMode === "single") {
      const bulletPos = Vector.fromAngle(this.heading)
        .mult(this.r)
        .add(this.pos);
      const newBullet = new Bullet({
        x: bulletPos.x,
        y: bulletPos.y,
        heading: this.heading,
        speed: this.bulletSpeed,
      });
      newBullet.vel.add(this.vel);

      return [newBullet];
    }
    if (this.gunMode === "double") {
      const bulletPos = Vector.fromAngle(this.heading)
        .mult(this.r)
        .add(this.pos);

      // Create perpendicular vector for correct offset
      const perpVector = Vector.fromAngle(this.heading + Math.PI / 2).mult(5);

      // First bullet - offset to the left
      const newBullet = new Bullet({
        x: bulletPos.x - perpVector.x,
        y: bulletPos.y - perpVector.y,
        heading: this.heading,
        speed: this.bulletSpeed,
      });
      newBullet.vel.add(this.vel);

      // Second bullet - offset to the right
      const newBullet2 = new Bullet({
        x: bulletPos.x + perpVector.x,
        y: bulletPos.y + perpVector.y,
        heading: this.heading,
        speed: this.bulletSpeed,
      });
      newBullet2.vel.add(this.vel);

      return [newBullet, newBullet2];
    }
  }

  switchGunMode(mode: GunMode) {
    this.gunMode = mode;
  }

  die() {
    this.isDead = true;
  }

  setKnockbackForce(force: number) {
    this.knockbackForce = force;
  }

  setBulletSpeed(speed: number) {
    this.bulletSpeed = speed;
  }
}

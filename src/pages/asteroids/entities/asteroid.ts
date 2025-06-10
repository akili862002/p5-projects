import { p, isDebug } from "../sketch";
import P5, { Vector } from "p5";
import { ASTEROID_COLOR, ASTEROID_MAX_SPEED } from "../config";
import { hexToRgb } from "../utils";

export class Asteroid {
  pos: P5.Vector;
  vel: P5.Vector;
  r: number;
  angle = p.random(0, 2 * p.PI);
  vertices: P5.Vector[] = [];
  vertexCount: number;
  rotationSpeed = p.random(-0.03, 0.03);
  maxSpeed = ASTEROID_MAX_SPEED;
  asteroidColor = hexToRgb(ASTEROID_COLOR);

  constructor(x: number, y: number, r: number) {
    this.r = r;
    this.pos = p.createVector(x, y);

    // Random velocity based on size (smaller = faster)
    const speed = p.map(r, 20, 80, 2.5, 1.2);
    this.vel = Vector.random2D().mult(speed);

    // Create jagged shape with vertices
    this.vertexCount = p.floor(p.map(r, 20, 80, 20, 25));
    this.vertices = [];

    for (let i = 0; i < this.vertexCount; i++) {
      const angle = p.map(i, 0, this.vertexCount, 0, p.TWO_PI);
      const offset = p.random(1, 1.3); // Randomize vertex distance from center
      const x = this.r * offset * p.cos(angle);
      const y = this.r * offset * p.sin(angle);
      this.vertices.push(p.createVector(x, y));
    }
  }

  update() {
    this.pos.add(this.vel);
    this.angle += this.rotationSpeed;
    this.vel.limit(this.maxSpeed);
  }

  draw() {
    p.push();
    p.translate(this.pos.x, this.pos.y);
    p.rotate(this.angle);
    p.noStroke();

    // Draw asteroid with gradient shading

    p.beginShape();
    // p.fill(this.asteroidColor);
    p.fill(36, 31, 23);
    p.stroke(this.asteroidColor);
    p.strokeWeight(2);
    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      p.vertex(v.x, v.y);
    }
    p.endShape(p.CLOSE);

    p.pop();

    if (isDebug) {
      p.push();
      p.noFill();
      p.stroke(0, 255, 0);
      p.circle(this.pos.x, this.pos.y, this.r * 2);
      p.pop();
    }
  }

  edges() {
    // Wrap around edges of canvas
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

  intersectsAsteroid(other: Asteroid) {
    const d = this.pos.dist(other.pos);
    return d < this.r + other.r;
  }

  collision(other: Asteroid) {
    // Collision response - elastic collision based on radius (mass)
    const dx = other.pos.x - this.pos.x;
    const dy = other.pos.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate mass based on radius (area proportional to mass)
    const m1 = this.r * this.r;
    const m2 = other.r * other.r;

    // Calculate normal vectors for collision
    const normalX = dx / distance;
    const normalY = dy / distance;

    // Calculate relative velocity along normal
    const relVelX = other.vel.x - this.vel.x;
    const relVelY = other.vel.y - this.vel.y;
    const relVelDotNormal = relVelX * normalX + relVelY * normalY;

    // If asteroids are moving away from each other, skip collision response
    if (relVelDotNormal > 0) return;

    // Calculate impulse scalar
    const impulseScalar = (2 * relVelDotNormal) / (1 / m1 + 1 / m2);

    // Apply impulse to velocities
    const impulseX = normalX * impulseScalar;
    const impulseY = normalY * impulseScalar;

    this.vel.x += impulseX / m1;
    this.vel.y += impulseY / m1;
    other.vel.x -= impulseX / m2;
    other.vel.y -= impulseY / m2;

    // Push asteroids apart slightly to prevent sticking
    const overlap = this.r + other.r - distance;
    if (overlap > 0) {
      const pushRatio1 = m2 / (m1 + m2);
      const pushRatio2 = m1 / (m1 + m2);

      this.pos.x -= normalX * overlap * pushRatio1;
      this.pos.y -= normalY * overlap * pushRatio1;
      other.pos.x += normalX * overlap * pushRatio2;
      other.pos.y += normalY * overlap * pushRatio2;
    }
  }
}

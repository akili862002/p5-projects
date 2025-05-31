import { p, isDebug } from "../sketch";
import P5, { Vector } from "p5";
import { ASTEROID_COLOR } from "../config";
import { hexToRgb } from "../utils";

export class Asteroid {
  pos: P5.Vector;
  vel: P5.Vector;
  r: number;
  angle = p.random(0, 2 * p.PI);
  vertices: P5.Vector[] = [];
  vertexCount: number;
  rotationSpeed = p.random(-0.03, 0.03);
  maxSpeed = 9;
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
    p.fill(this.asteroidColor);
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
}

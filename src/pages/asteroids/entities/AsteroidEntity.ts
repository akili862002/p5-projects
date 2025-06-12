import { Vector } from "p5";
import { Entity } from "../core/Entity";
import { CircleCollider } from "../core/components/Collider";
import { p } from "../sketch";
import { ASTEROID_COLOR, ASTEROID_MAX_SPEED } from "../config";
import { hexToRgb } from "../utils";

export class AsteroidEntity extends Entity {
  private vertexCount: number;
  private vertices: Vector[] = [];
  private angle: number = 0;
  private rotationSpeed: number = 0;
  private asteroidColor: any; // Using any for color to avoid type conflicts
  private collider: CircleCollider;

  constructor(x: number, y: number, radius: number) {
    super(x, y);

    // Initialize components
    this.collider = new CircleCollider(radius);
    this.addComponent(this.collider);

    // Initialize asteroid properties
    this.asteroidColor = p.color(hexToRgb(ASTEROID_COLOR));

    // Create random velocity based on size (smaller = faster)
    const speed = p.map(radius, 20, 80, 2.5, 1.2);
    this.setVelocity(p.random(-speed, speed), p.random(-speed, speed));

    // Set rotation and max speed
    this.rotationSpeed = p.random(-0.03, 0.03);
    this.transform.maxSpeed = ASTEROID_MAX_SPEED;

    // Create jagged shape with vertices
    this.createVertices(radius);
  }

  private createVertices(radius: number): void {
    this.vertexCount = p.floor(p.map(radius, 20, 80, 20, 25));
    this.vertices = [];

    for (let i = 0; i < this.vertexCount; i++) {
      const angle = p.map(i, 0, this.vertexCount, 0, p.TWO_PI);
      const offset = p.random(1, 1.3); // Randomize vertex distance from center
      const x = radius * offset * p.cos(angle);
      const y = radius * offset * p.sin(angle);
      this.vertices.push(p.createVector(x, y));
    }
  }

  public update(): void {
    // Update position and velocity
    this.transform.update();

    // Update rotation
    this.angle += this.rotationSpeed;
  }

  public draw(): void {
    const pos = this.getPosition();

    p.push();
    p.translate(pos.x, pos.y);
    p.rotate(this.angle);
    p.noStroke();

    // Draw asteroid with gradient shading
    p.beginShape();
    p.fill(36, 31, 23);
    p.stroke(this.asteroidColor);
    p.strokeWeight(2);

    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      p.vertex(v.x, v.y);
    }

    p.endShape(p.CLOSE);
    p.pop();

    // Draw debug collider if needed
    this.collider.drawDebug();
  }

  public handleEdges(): void {
    const pos = this.getPosition();
    const r = this.collider.getRadius();

    // Wrap around edges of canvas
    if (pos.x < -r) {
      this.setPosition(p.width + r, pos.y);
    } else if (pos.x > p.width + r) {
      this.setPosition(-r, pos.y);
    }

    if (pos.y < -r) {
      this.setPosition(pos.x, p.height + r);
    } else if (pos.y > p.height + r) {
      this.setPosition(pos.x, -r);
    }
  }

  public handleCollision(other: AsteroidEntity): void {
    // Collision response - elastic collision based on radius (mass)
    const myPos = this.getPosition();
    const otherPos = other.getPosition();
    const dx = otherPos.x - myPos.x;
    const dy = otherPos.y - myPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate mass based on radius (area proportional to mass)
    const r1 = this.collider.getRadius();
    const r2 = other.collider.getRadius();
    const m1 = r1 * r1;
    const m2 = r2 * r2;

    // Calculate normal vectors for collision
    const normalX = dx / distance;
    const normalY = dy / distance;

    // Calculate relative velocity along normal
    const v1 = this.getVelocity();
    const v2 = other.getVelocity();
    const relVelX = v2.x - v1.x;
    const relVelY = v2.y - v1.y;
    const relVelDotNormal = relVelX * normalX + relVelY * normalY;

    // If asteroids are moving away from each other, skip collision response
    if (relVelDotNormal > 0) return;

    // Calculate impulse scalar
    const impulseScalar = (2 * relVelDotNormal) / (1 / m1 + 1 / m2);

    // Apply impulse to velocities
    const impulseX = normalX * impulseScalar;
    const impulseY = normalY * impulseScalar;

    this.setVelocity(v1.x + impulseX / m1, v1.y + impulseY / m1);

    other.setVelocity(v2.x - impulseX / m2, v2.y - impulseY / m2);

    // Push asteroids apart slightly to prevent sticking
    const overlap = r1 + r2 - distance;
    if (overlap > 0) {
      const pushRatio1 = m2 / (m1 + m2);
      const pushRatio2 = m1 / (m1 + m2);

      this.setPosition(
        myPos.x - normalX * overlap * pushRatio1,
        myPos.y - normalY * overlap * pushRatio1
      );

      other.setPosition(
        otherPos.x + normalX * overlap * pushRatio2,
        otherPos.y + normalY * overlap * pushRatio2
      );
    }
  }
}

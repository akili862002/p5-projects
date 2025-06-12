import P5, { Vector } from "p5";
import { p } from "../sketch";
import { Entity } from "../core/Entity";

interface FlameParticle {
  position: Vector;
  velocity: Vector;
  size: number;
  color: P5.Color;
  alpha: number;
  heading: number;
  sizeDecrease: number;
  lifetime: number;
  maxLifetime: number;
}

export class FlameParticleSystem {
  private particles: FlameParticle[] = [];
  private ship: Entity;

  constructor(ship: Entity) {
    this.ship = ship;
  }

  public update(): void {
    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update position
      particle.position.add(particle.velocity);

      // Update size and alpha
      particle.size -= particle.sizeDecrease;
      particle.alpha = p.map(
        particle.lifetime,
        0,
        particle.maxLifetime,
        255,
        0
      );

      // Update lifetime
      particle.lifetime++;

      // Remove if too small or exceeded lifetime
      if (particle.size <= 0 || particle.lifetime >= particle.maxLifetime) {
        this.particles.splice(i, 1);
      }
    }
  }

  public draw(): void {
    for (const particle of this.particles) {
      p.push();
      const c = particle.color;
      p.fill(p.red(c), p.green(c), p.blue(c), particle.alpha);
      p.noStroke();
      p.circle(particle.position.x, particle.position.y, particle.size);
      p.pop();
    }
  }

  public createFlames(): void {
    const flameCount = 8;
    const shipPos = this.ship.getPosition();
    const shipHeading = (this.ship as any).transform.heading;
    const shipRadius = (this.ship as any).collider.getRadius();

    // Get position behind the ship
    const shipBackPos = shipPos
      .copy()
      .add(Vector.fromAngle(shipHeading + p.PI).mult(shipRadius * 0.9));

    for (let i = 0; i < flameCount; i++) {
      // Add randomness to position
      const offsetAngle = p.random(-1, 1) + shipHeading + p.PI;
      const offsetMagnitude = p.random(0, shipRadius * 0.4);
      const flamePos = shipBackPos
        .copy()
        .add(Vector.fromAngle(offsetAngle).mult(offsetMagnitude));

      // Create flame particle
      const flame: FlameParticle = {
        position: flamePos,
        velocity: Vector.fromAngle(
          shipHeading + p.PI + p.random(-0.2, 0.2)
        ).mult(p.random(1, 3)),
        size: p.random(2, 5),
        color: p.color(116, 239, 248),
        alpha: 255,
        heading: shipHeading + p.random(-0.3, 0.3),
        sizeDecrease: p.random(0.05, 0.2),
        lifetime: 0,
        maxLifetime: p.floor(p.random(20, 40)),
      };

      this.particles.push(flame);
    }
  }
}

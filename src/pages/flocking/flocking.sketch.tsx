import P5JS, { Vector } from "p5";

export function sketch(p5: P5JS) {
  // Configuration
  const config = {
    boidCount: 300,
    maxSpeed: 4,
    maxForce: 0.1,
    perception: 50,
    showVectors: false,
  };

  const boids: Boid[] = [];
  let alignSlider: P5JS.Element;
  let cohesionSlider: P5JS.Element;
  let separationSlider: P5JS.Element;
  let showVectorsCheckbox: P5JS.Element;

  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    setupUI();
    createBoids();
  };

  function setupUI() {
    // Create UI elements with labels
    p5.createDiv("Alignment:").position(10, p5.height + 10);
    alignSlider = p5.createSlider(0, 5, 1, 0.1);
    alignSlider.position(90, p5.height + 10);

    p5.createDiv("Cohesion:").position(10, p5.height + 40);
    cohesionSlider = p5.createSlider(0, 5, 1, 0.1);
    cohesionSlider.position(90, p5.height + 40);

    p5.createDiv("Separation:").position(10, p5.height + 70);
    separationSlider = p5.createSlider(0, 5, 1.5, 0.1);
    separationSlider.position(90, p5.height + 70);

    p5.createDiv("Show Vectors:").position(250, p5.height + 10);
    showVectorsCheckbox = p5.createCheckbox("", config.showVectors);
    showVectorsCheckbox.position(340, p5.height + 10);
  }

  function createBoids() {
    // Create boids
    for (let i = 0; i < config.boidCount; i++) {
      boids.push(new Boid());
    }
  }

  p5.draw = () => {
    p5.background(30);

    // Update showVectors configuration from checkbox
    config.showVectors = (showVectorsCheckbox as any).checked();

    for (const boid of boids) {
      boid.edges();
      boid.flock(boids);
      boid.update();
      boid.show();
    }
  };

  class Boid {
    pos: P5JS.Vector;
    vel: P5JS.Vector;
    acc: P5JS.Vector;
    r: number = 3;

    constructor() {
      this.pos = p5.createVector(
        p5.random(0, p5.width),
        p5.random(0, p5.height)
      );
      this.vel = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
      this.acc = p5.createVector();
    }

    update() {
      // Update position and velocity
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      // Limit velocity to max speed
      this.vel.limit(config.maxSpeed);
      // Reset acceleration to 0 each cycle
      this.acc.mult(0);
    }

    show() {
      // Draw boid as a triangle
      p5.push();
      p5.translate(this.pos.x, this.pos.y);
      // Rotate in the direction of velocity
      p5.rotate(this.vel.heading());
      p5.fill(200);
      p5.stroke(200);
      p5.strokeWeight(1);
      // Draw triangle with the point facing in the direction of movement
      p5.triangle(this.r * 2, 0, -this.r, this.r, -this.r, -this.r);
      p5.pop();

      // Optionally draw velocity vector
      if (config.showVectors) {
        p5.stroke(255, 204, 0);
        p5.strokeWeight(1);
        const scale = 10;
        p5.line(
          this.pos.x,
          this.pos.y,
          this.pos.x + this.vel.x * scale,
          this.pos.y + this.vel.y * scale
        );
      }
    }

    edges() {
      // Wrap around edges of canvas
      if (this.pos.x < -this.r) {
        this.pos.x = p5.width + this.r;
      } else if (this.pos.x > p5.width + this.r) {
        this.pos.x = -this.r;
      }

      if (this.pos.y < -this.r) {
        this.pos.y = p5.height + this.r;
      } else if (this.pos.y > p5.height + this.r) {
        this.pos.y = -this.r;
      }
    }

    // Calculate steering force towards target behavior
    private calculateSteering(
      boids: Boid[],
      getDesiredVector: (otherBoids: Boid[], count: number) => P5JS.Vector
    ): P5JS.Vector {
      const nearbyBoids: Boid[] = [];

      // Find nearby boids
      for (const other of boids) {
        const d = p5.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        if (d < config.perception && other !== this) {
          nearbyBoids.push(other);
        }
      }

      // If no nearby boids, return zero vector
      if (nearbyBoids.length === 0) {
        return p5.createVector();
      }

      // Calculate steering based on callback
      const desired = getDesiredVector(nearbyBoids, nearbyBoids.length);

      // Reynolds steering formula: steering = desired - velocity
      if (desired.mag() > 0) {
        desired.setMag(config.maxSpeed);
        const steering = Vector.sub(desired, this.vel);
        steering.limit(config.maxForce);
        return steering;
      }

      return p5.createVector();
    }

    align(boids: Boid[]) {
      return this.calculateSteering(boids, (nearbyBoids, count) => {
        const avg = p5.createVector();
        for (const boid of nearbyBoids) {
          avg.add(boid.vel);
        }
        avg.div(count);
        return avg;
      });
    }

    cohesion(boids: Boid[]) {
      return this.calculateSteering(boids, (nearbyBoids, count) => {
        const center = p5.createVector();
        for (const boid of nearbyBoids) {
          center.add(boid.pos);
        }
        center.div(count);
        return Vector.sub(center, this.pos);
      });
    }

    separation(boids: Boid[]) {
      return this.calculateSteering(boids, (nearbyBoids) => {
        const steering = p5.createVector();
        for (const boid of nearbyBoids) {
          const d = p5.dist(this.pos.x, this.pos.y, boid.pos.x, boid.pos.y);
          if (d > 0) {
            const diff = Vector.sub(this.pos, boid.pos);
            diff.div(d * d); // Weight by distance squared
            steering.add(diff);
          }
        }
        return steering;
      });
    }

    flock(boids: Boid[]) {
      // Calculate forces
      const alignForce = this.align(boids);
      const cohesionForce = this.cohesion(boids);
      const separationForce = this.separation(boids);

      // Apply weights from sliders
      alignForce.mult(Number(alignSlider.value()));
      cohesionForce.mult(Number(cohesionSlider.value()));
      separationForce.mult(Number(separationSlider.value()));

      // Add forces to acceleration
      this.acc.add(alignForce);
      this.acc.add(cohesionForce);
      this.acc.add(separationForce);
    }
  }
}

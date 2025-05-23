import P5JS from "p5";

export function sketch(p5: P5JS) {
  // Sketch variables
  const balls: Ball[] = [];
  const numBalls = 100;
  const width = window.innerWidth;
  const height = window.innerHeight;

  const createBunchOfBalls = (num: number) => {
    // Create balls
    for (let i = 0; i < num; i++) {
      const r = p5.random(10, 30);
      const x = p5.random(r, p5.width - r);
      const y = p5.random(r, p5.height - r);

      // Check for overlap with existing balls
      let overlapping = false;
      for (const ball of balls) {
        const d = p5.dist(x, y, ball.pos.x, ball.pos.y);
        if (d < r + ball.r) {
          overlapping = true;
          break;
        }
      }

      // Only add if not overlapping
      if (!overlapping) {
        balls.push(new Ball(x, y, r));
      }
    }
  };

  p5.setup = () => {
    p5.createCanvas(width, height);
    createBunchOfBalls(numBalls);
  };

  p5.draw = () => {
    p5.background(30);

    // Update and display balls
    for (let i = 0; i < balls.length; i++) {
      balls[i].update();
      balls[i].show();

      for (let j = i + 1; j < balls.length; j++) {
        if (balls[i].isColliding(balls[j])) {
          balls[i].collision(balls[j]);
        }
      }
    }
  };

  // Ball class
  class Ball {
    pos: P5JS.Vector;
    vel: P5JS.Vector;
    r: number;
    color: P5JS.Color;

    constructor(x: number, y: number, r: number) {
      this.pos = p5.createVector(x, y);
      this.vel = p5.createVector(p5.random(-5, 5), p5.random(-5, 5));
      this.r = r;
      this.color = p5.color(
        p5.random(100, 255),
        p5.random(100, 255),
        p5.random(100, 255)
      );
    }

    update() {
      this.pos.add(this.vel);
      this.handleBounce();
    }
    handleBounce() {
      if (this.pos.x < this.r) {
        this.vel.x = Math.abs(this.vel.x); // Ensure velocity is positive (moving right)
        this.pos.x = this.r; // Prevent sticking to the edge
      } else if (this.pos.x > p5.width - this.r) {
        this.vel.x = -Math.abs(this.vel.x); // Ensure velocity is negative (moving left)
        this.pos.x = p5.width - this.r; // Prevent sticking to the edge
      }

      if (this.pos.y < this.r) {
        this.vel.y = Math.abs(this.vel.y); // Ensure velocity is positive (moving down)
        this.pos.y = this.r; // Prevent sticking to the edge
      } else if (this.pos.y > p5.height - this.r) {
        this.vel.y = -Math.abs(this.vel.y); // Ensure velocity is negative (moving up)
        this.pos.y = p5.height - this.r; // Prevent sticking to the edge
      }
    }

    isColliding(other: Ball) {
      const d = p5.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      return d < this.r + other.r;
    }

    collision(other: Ball) {
      // Calculate distance between balls
      const d = p5.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      const sumOfRadii = this.r + other.r;

      // Calculate overlap
      const overlap = sumOfRadii - d;

      // Calculate unit vector in direction of collision
      const dx = (this.pos.x - other.pos.x) / d;
      const dy = (this.pos.y - other.pos.y) / d;

      // Move balls apart to prevent overlap
      this.pos.x += overlap * dx * 0.5;
      this.pos.y += overlap * dy * 0.5;
      other.pos.x -= overlap * dx * 0.5;
      other.pos.y -= overlap * dy * 0.5;

      // Calculate velocity components along collision normal
      const v1n = this.vel.x * dx + this.vel.y * dy;
      const v2n = other.vel.x * dx + other.vel.y * dy;

      // Calculate new normal velocities (elastic collision)
      const m1 = this.r * this.r; // Mass proportional to area
      const m2 = other.r * other.r;
      const v1nAfter = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
      const v2nAfter = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

      // Update velocities
      this.vel.x += (v1nAfter - v1n) * dx;
      this.vel.y += (v1nAfter - v1n) * dy;
      other.vel.x += (v2nAfter - v2n) * dx;
      other.vel.y += (v2nAfter - v2n) * dy;
    }

    show() {
      p5.fill(this.color);
      p5.noStroke();
      p5.circle(this.pos.x, this.pos.y, this.r * 2);

      // this.showVelVector();
    }

    showVelVector() {
      // draw vector line
      p5.stroke(255);
      p5.strokeWeight(1);
      const scale = 5;
      p5.line(
        this.pos.x,
        this.pos.y,
        this.pos.x + this.vel.x * scale,
        this.pos.y + this.vel.y * scale
      );
    }
  }
}

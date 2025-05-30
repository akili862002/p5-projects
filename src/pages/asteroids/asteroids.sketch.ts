import P5, { Vector } from "p5";

export const sketch = (p: P5) => {
  let ship: Ship;
  let isBoosting = false;
  let shipImg: P5.Image;
  let asteroids: Asteroid[] = [];
  let bullets: Bullet[] = [];
  let score = 0;
  let lives = 3;
  let gameOver = false;
  let isDebug = false;
  // let isDebug = true;

  p.preload = () => {
    shipImg = p.loadImage("/game/ship.png");
  };

  p.setup = () => {
    p.createCanvas(innerWidth, innerHeight);
    // p.createCheckbox("Debug").mousePressed(() => (isDebug = !isDebug));
    resetGame();
  };

  const resetGame = () => {
    ship = new Ship(p.width / 2, p.height / 2);
    asteroids = [];
    bullets = [];
    score = 0;
    lives = 3;
    gameOver = false;

    // Create initial asteroids
    for (let i = 0; i < 8; i++) {
      createAsteroid();
    }
  };

  const createAsteroid = (x?: number, y?: number, size?: number) => {
    const newX = x ?? p.random(0, p.width);
    const newY = y ?? p.random(0, p.height);
    const newSize = size ?? p.random(30, 50);

    // Ensure asteroids don't spawn too close to the ship
    const shipDist = p.dist(newX, newY, ship.pos.x, ship.pos.y);
    if (shipDist < 200 && x === undefined) {
      return createAsteroid();
    }

    asteroids.push(new Asteroid(newX, newY, newSize));
  };

  p.draw = () => {
    p.background(20);

    if (gameOver) {
      displayGameOver();
      return;
    }

    // Update and draw ship
    ship.update();
    ship.draw();
    ship.edges();
    if (isBoosting) ship.boost();

    // Update and draw asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      asteroid.update();
      asteroid.draw();
      asteroid.edges();

      // Check for asteroid collisions with other asteroids
      for (let j = i - 1; j >= 0; j--) {
        const other = asteroids[j];
        if (asteroid.intersectsAsteroid(other)) {
          // Collision response - bounce asteroids off each other
          const dx = other.pos.x - asteroid.pos.x;
          const dy = other.pos.y - asteroid.pos.y;
          const angle = Math.atan2(dy, dx);

          // Calculate velocity components
          const v1 = p.createVector(asteroid.vel.x, asteroid.vel.y);
          const v2 = p.createVector(other.vel.x, other.vel.y);

          // Apply bounce effect
          asteroid.vel = v2.copy();
          other.vel = v1.copy();

          // Push asteroids apart slightly to prevent sticking
          const overlap = asteroid.r + other.r - asteroid.pos.dist(other.pos);
          if (overlap > 0) {
            const pushX = overlap * Math.cos(angle) * 0.5;
            const pushY = overlap * Math.sin(angle) * 0.5;
            asteroid.pos.x -= pushX;
            asteroid.pos.y -= pushY;
            other.pos.x += pushX;
            other.pos.y += pushY;
          }
        }
      }

      // Check for ship collision with asteroids
      if (ship.intersects(asteroid)) {
        lives--;
        if (lives <= 0) {
          gameOver = true;
        } else {
          ship = new Ship(p.width / 2, p.height / 2);
        }
        asteroids.splice(i, 1);
        if (asteroids.length < 5) {
          createAsteroid();
        }
      }
    }

    // Update and draw bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.update();
      bullet.draw();

      if (bullet.shouldRemove()) {
        bullets.splice(i, 1);
        continue;
      }

      // Check for bullet collision with asteroids
      for (let j = asteroids.length - 1; j >= 0; j--) {
        const asteroid = asteroids[j];
        if (bullet.intersects(asteroid)) {
          // Remove the bullet
          bullets.splice(i, 1);

          // Break asteroid into smaller pieces
          if (asteroid.r > 20) {
            const newSize = asteroid.r / 2;
            for (let k = 0; k < 2; k++) {
              createAsteroid(asteroid.pos.x, asteroid.pos.y, newSize);
            }
          }

          // Remove the asteroid and update score
          asteroids.splice(j, 1);
          score += Math.floor(100 / asteroid.r);

          // Create new asteroid if too few remain
          if (asteroids.length < 5) {
            createAsteroid();
          }

          break;
        }
      }
    }

    // Handle ship controls
    if (p.keyIsDown(p.LEFT_ARROW)) {
      ship.rotation -= 0.08;
    }
    if (p.keyIsDown(p.RIGHT_ARROW)) {
      ship.rotation += 0.08;
    }

    // Display score and lives
    displayHUD();

    // Create new asteroids periodically
    if (p.frameCount % 300 === 0 && asteroids.length < 12) {
      createAsteroid();
    }
  };

  const displayHUD = () => {
    p.fill(255);
    p.textSize(20);
    p.textAlign(p.LEFT);
    p.text(`Score: ${score}`, 20, 30);
    p.textAlign(p.RIGHT);
    p.text(`Lives: ${lives}`, p.width - 20, 30);
  };

  const displayGameOver = () => {
    p.fill(255);
    p.textSize(50);
    p.textAlign(p.CENTER);
    p.text("GAME OVER", p.width / 2, p.height / 2 - 50);
    p.textSize(30);
    p.text(`Final Score: ${score}`, p.width / 2, p.height / 2 + 20);
    p.textSize(20);
    p.text("Press ENTER to play again", p.width / 2, p.height / 2 + 70);
  };

  p.keyPressed = (e: any) => {
    if (e.key === "ArrowUp") {
      isBoosting = true;
    }
    if (e.key === " ") {
      // Limit bullet count to prevent spamming
      if (bullets.length < 10) {
        // Create bullet at ship's nose
        const bulletPos = Vector.fromAngle(ship.heading)
          .mult(ship.r * 2)
          .add(ship.pos);
        bullets.push(new Bullet(bulletPos.x, bulletPos.y, ship.heading));
      }
    }
    if (e.key === "Enter" && gameOver) {
      resetGame();
    }
  };

  p.keyReleased = (e: any) => {
    if (e.key === "ArrowUp") {
      isBoosting = false;
    }
  };

  class Ship {
    pos: P5.Vector;
    vel: P5.Vector;
    acc: P5.Vector;
    r = 20;
    heading = p.PI / 2;
    rotation = 0;
    maxSpeed = 6;
    friction = 0.98;
    invincible = false;
    invincibleTimer = 0;
    maxRotation = 0.1;

    constructor(x: number, y: number) {
      this.pos = p.createVector(x, y);
      this.vel = p.createVector(0, 0);
      this.acc = p.createVector(0, 0);
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
        p.triangle(
          -this.r * 0.5,
          this.r,
          0,
          this.r * 2.5,
          this.r * 0.5,
          this.r
        );
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

  class Asteroid {
    pos: P5.Vector;
    vel: P5.Vector;
    r: number;
    angle = p.random(0, 2 * p.PI);
    vertices: P5.Vector[] = [];
    vertexCount: number;
    rotationSpeed = p.random(-0.03, 0.03);

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
    }

    draw() {
      p.push();
      p.translate(this.pos.x, this.pos.y);
      p.rotate(this.angle);
      p.noStroke();

      // Draw asteroid with gradient shading
      const c1 = p.color(180, 180, 180);
      const c2 = p.color(100, 100, 100);

      p.beginShape();
      for (let i = 0; i < this.vertices.length; i++) {
        const v = this.vertices[i];
        const normalizedDist = v.mag() / this.r;
        const c = p.lerpColor(c1, c2, normalizedDist);
        p.fill(c);
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

  class Bullet {
    pos: P5.Vector;
    vel: P5.Vector;
    r = 4;
    lifespan = 70; // Frames until bullet disappears

    constructor(x: number, y: number, heading: number) {
      this.pos = p.createVector(x, y);
      const speed = 10;
      this.vel = Vector.fromAngle(heading).mult(speed);
    }

    update() {
      this.pos.add(this.vel);
      this.lifespan--;
    }

    draw() {
      p.push();
      p.noStroke();
      p.fill(255, 255, 200);
      p.ellipse(this.pos.x, this.pos.y, this.r);

      // Add glow effect
      p.fill(255, 255, 100, 150);
      p.ellipse(this.pos.x, this.pos.y, this.r);
      p.pop();
    }

    intersects(asteroid: Asteroid) {
      const d = p.dist(this.pos.x, this.pos.y, asteroid.pos.x, asteroid.pos.y);
      return d < this.r + asteroid.r;
    }

    shouldRemove() {
      // Remove when bullet leaves screen or expires
      return (
        this.lifespan <= 0 ||
        this.pos.x < 0 ||
        this.pos.x > p.width ||
        this.pos.y < 0 ||
        this.pos.y > p.height
      );
    }
  }
};

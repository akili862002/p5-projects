import P5, { Vector } from "p5";
import { Ship } from "./ship";
import { Asteroid } from "./asteroid";
import { Bullet } from "./bullet";
import { hexToRgb } from "./utils";

export let p: P5;
export let ship: Ship;
export let isBoosting = false;
export let shipImg: P5.Image;
export let bulletImg: P5.Image;
export let backgroundColor: P5.Color;
export let isDebug = false;

let score = 0;
let lives = 3;
let gameOver = false;

export const sketch = (p5: P5) => {
  p = p5;
  let asteroids: Asteroid[] = [];
  let bullets: Bullet[] = [];

  // let isDebug = true;

  p.preload = () => {
    shipImg = p.loadImage("/game/ship.png");
    bulletImg = p.loadImage("/game/bullet.png");
  };

  p.setup = () => {
    p.createCanvas(innerWidth, innerHeight);
    backgroundColor = p.color(hexToRgb("#1F102A"));
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

    const newAsteroid = new Asteroid(newX, newY, newSize);
    asteroids.push(newAsteroid);

    return newAsteroid;
  };

  p.draw = () => {
    p.background(backgroundColor);

    if (gameOver) {
      displayGameOver();
      return;
    }

    updateAndDrawShip();
    updateAndDrawBullets();
    updateAndDrawAsteroids();
    handleShipControls();
    displayHUD();

    // Create new asteroids periodically
    if (p.frameCount % 300 === 0 && asteroids.length < 12) {
      createAsteroid();
    }
  };

  const updateAndDrawShip = () => {
    ship.update();
    ship.draw();
    ship.edges();
    if (isBoosting) ship.boost();
  };

  const updateAndDrawBullets = () => {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.update();
      bullet.draw();
      bullet.edges();

      if (bullet.shouldRemove()) {
        bullets.splice(i, 1);
        continue;
      }

      checkBulletAsteroidCollisions(bullet, i);
    }
  };

  const checkBulletAsteroidCollisions = (
    bullet: Bullet,
    bulletIndex: number
  ) => {
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const asteroid = asteroids[j];
      if (bullet.intersects(asteroid)) {
        // Remove the bullet
        bullets.splice(bulletIndex, 1);

        // Break asteroid into smaller pieces
        if (asteroid.r > 20) {
          const newSize = asteroid.r / 2;
          for (let k = 0; k < 2; k++) {
            const newAsteroid = createAsteroid(
              asteroid.pos.x,
              asteroid.pos.y,
              newSize
            );
            newAsteroid.vel.setMag(asteroid.vel.mag() * 1.4);
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
  };

  const updateAndDrawAsteroids = () => {
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      asteroid.update();
      asteroid.draw();
      asteroid.edges();

      checkAsteroidCollisions(asteroid, i);
      checkShipAsteroidCollision(asteroid, i);
    }
  };

  const checkAsteroidCollisions = (
    asteroid: Asteroid,
    asteroidIndex: number
  ) => {
    for (let j = asteroidIndex - 1; j >= 0; j--) {
      const other = asteroids[j];
      if (asteroid.intersectsAsteroid(other)) {
        handleAsteroidCollision(asteroid, other);
      }
    }
  };

  const handleAsteroidCollision = (
    asteroid1: Asteroid,
    asteroid2: Asteroid
  ) => {
    // Collision response - elastic collision based on radius (mass)
    const dx = asteroid2.pos.x - asteroid1.pos.x;
    const dy = asteroid2.pos.y - asteroid1.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate mass based on radius (area proportional to mass)
    const m1 = asteroid1.r * asteroid1.r;
    const m2 = asteroid2.r * asteroid2.r;

    // Calculate normal vectors for collision
    const normalX = dx / distance;
    const normalY = dy / distance;

    // Calculate relative velocity along normal
    const relVelX = asteroid2.vel.x - asteroid1.vel.x;
    const relVelY = asteroid2.vel.y - asteroid1.vel.y;
    const relVelDotNormal = relVelX * normalX + relVelY * normalY;

    // If asteroids are moving away from each other, skip collision response
    if (relVelDotNormal > 0) return;

    // Calculate impulse scalar
    const impulseScalar = (2 * relVelDotNormal) / (1 / m1 + 1 / m2);

    // Apply impulse to velocities
    const impulseX = normalX * impulseScalar;
    const impulseY = normalY * impulseScalar;

    asteroid1.vel.x += impulseX / m1;
    asteroid1.vel.y += impulseY / m1;
    asteroid2.vel.x -= impulseX / m2;
    asteroid2.vel.y -= impulseY / m2;

    // Push asteroids apart slightly to prevent sticking
    const overlap = asteroid1.r + asteroid2.r - distance;
    if (overlap > 0) {
      const pushRatio1 = m2 / (m1 + m2);
      const pushRatio2 = m1 / (m1 + m2);

      asteroid1.pos.x -= normalX * overlap * pushRatio1;
      asteroid1.pos.y -= normalY * overlap * pushRatio1;
      asteroid2.pos.x += normalX * overlap * pushRatio2;
      asteroid2.pos.y += normalY * overlap * pushRatio2;
    }
  };

  const checkShipAsteroidCollision = (
    asteroid: Asteroid,
    asteroidIndex: number
  ) => {
    if (ship.intersects(asteroid)) {
      lives--;
      if (lives <= 0) {
        gameOver = true;
      } else {
        ship = new Ship(p.width / 2, p.height / 2);
      }
      asteroids.splice(asteroidIndex, 1);
      if (asteroids.length < 5) {
        createAsteroid();
      }
    }
  };

  const handleShipControls = () => {
    if (p.keyIsDown(p.LEFT_ARROW)) {
      ship.rotation -= 0.05;
    }
    if (p.keyIsDown(p.RIGHT_ARROW)) {
      ship.rotation += 0.05;
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
          .mult(ship.r)
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
};

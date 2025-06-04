import P5, { Vector } from "p5";
import { Ship } from "./entities/ship";
import { Asteroid } from "./entities/asteroid";
import { Bullet } from "./entities/bullet";
import { displayGameOver, displayHUD } from "./hud";
import {
  BACKGROUND_COLOR,
  DEBUG,
  LIVES,
  SHIP_KNOCKBACK_FORCE,
  ASTEROID_GENERATE_INTERVAL,
  ASTEROID_MAX_GENERATE,
  ROCKET_GENERATE_INTERVAL,
  ROCKET_MAX_GENERATE,
  ASTEROID_INITIAL_COUNT,
  ASTEROID_SPLIT_COUNT,
} from "./config";
import { SoundManager } from "./sound-manager";
import { PointIndicator } from "./point-indicator";
import { Rocket } from "./entities/rocket";

export let p: P5;
export let ship: Ship;
export let isBoosting = false;

// Images
export let shipImg: P5.Image;
export let bulletImg: P5.Image;
export let firerImg: P5.Image;
export let heartImage: P5.Image;
export let rocketImg: P5.Image;

// Colors
export let backgroundColor: P5.Color;

export let isDebug = DEBUG;

export let score = 0;
export let lives = LIVES;
export let gameOver = false;

let pointIndicators: PointIndicator;

// Get sound manager instance
let soundManager: SoundManager;

export function sketch(p5: P5) {
  p = p5;
  let asteroids: Asteroid[] = [];
  let bullets: Bullet[] = [];
  let rockets: Rocket[] = [];

  // let isDebug = true;

  p.preload = () => {
    shipImg = p.loadImage("/game/ship.png");
    firerImg = p.loadImage("/game/firer.png");
    heartImage = p.loadImage("/game/heart.png");
    rocketImg = p.loadImage("/game/rocket.png");
    // shipImg = p.loadImage("/game/black-ship.png");
    // shipImg = p.loadImage("/game/red-ship.png");
    // bulletImg = p.loadImage("/game/bullet.png");
    // shootSound = p.loadSound("/game/shoot.mp3");
  };

  p.setup = () => {
    p.createCanvas(innerWidth, innerHeight);
    backgroundColor = p.color(BACKGROUND_COLOR);
    pointIndicators = new PointIndicator();
    soundManager = SoundManager.getInstance();
    resetGame();
  };

  p.draw = () => {
    p.background(backgroundColor);

    if (gameOver) {
      displayGameOver();
      return;
    }

    updateAndDrawBullets();
    updateAndDrawAsteroids();
    handleShipControls();
    updateAndDrawRockets();
    updateAndDrawShip();
    displayHUD();

    pointIndicators.update();
    pointIndicators.draw();

    // Create new asteroids periodically
    // Create every 5s
    if (
      p.frameCount % ASTEROID_GENERATE_INTERVAL === 0 &&
      asteroids.length < ASTEROID_MAX_GENERATE
    ) {
      createAsteroid();
    }

    if (
      p.frameCount % ROCKET_GENERATE_INTERVAL === 0 &&
      rockets.length < ROCKET_MAX_GENERATE
    ) {
      createRocket();
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

  const updateAndDrawRockets = () => {
    for (let i = rockets.length - 1; i >= 0; i--) {
      const rocket = rockets[i];
      rocket.update();
      rocket.draw();
      rocket.tracking(ship.pos);
      rocket.edges();

      if (rocket.shouldRemove()) {
        rockets.splice(i, 1);
      }

      // Check if rocket collides with ship
      if (rocket.intersects(ship)) {
        rockets.splice(i, 1);
        lives--;
        soundManager.playAsteroidExplosionSound();

        if (lives <= 0) {
          gameOver = true;
        } else {
          ship = new Ship(p.width / 2, p.height / 2);
        }
        continue;
      }

      for (let j = asteroids.length - 1; j >= 0; j--) {
        const asteroid = asteroids[j];
        if (rocket.intersects(asteroid)) {
          rockets.splice(i, 1);

          // Play explosion sound
          soundManager.playAsteroidExplosionSound();

          // Award points based on asteroid size
          const points = Math.floor(150 / asteroid.r);
          score += points;
          pointIndicators.add(points, asteroid.pos.x, asteroid.pos.y);

          // Break asteroid into smaller pieces if large enough
          if (asteroid.r > 20) {
            const newSize = asteroid.r / 2;
            for (let k = 0; k < ASTEROID_SPLIT_COUNT; k++) {
              const angle = p.random(0, p.TWO_PI);
              const newAsteroid = createAsteroid(
                asteroid.pos.x,
                asteroid.pos.y,
                newSize
              );
              newAsteroid.vel = Vector.fromAngle(angle).mult(2);
            }
          }

          asteroids.splice(j, 1);

          // Create new asteroid if too few remain
          if (asteroids.length < 5) {
            createAsteroid();
          }
          break;
        }
      }
    }
  };

  const resetGame = () => {
    ship = new Ship(p.width / 2, p.height / 2);
    asteroids = [];
    bullets = [];
    rockets = [];
    pointIndicators.reset();
    score = 0;
    lives = 3;
    gameOver = false;

    // Create initial asteroids
    for (let i = 0; i < ASTEROID_INITIAL_COUNT; i++) {
      createAsteroid();
    }

    createRocket();
    createRocket();
  };

  const createRocket = () => {
    const newX = p.random(0, p.width);
    const newY = p.random(0, p.height);

    // Ensure rockets don't spawn too close to the ship
    const shipDist = p.dist(newX, newY, ship.pos.x, ship.pos.y);
    if (shipDist < 250) {
      return createRocket();
    }

    const rocket = new Rocket(newX, newY);
    rockets.push(rocket);
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

  const checkBulletAsteroidCollisions = (
    bullet: Bullet,
    bulletIndex: number
  ) => {
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const asteroid = asteroids[j];
      if (bullet.intersects(asteroid)) {
        // Remove the bullet
        bullets.splice(bulletIndex, 1);

        // Play explosion sound
        soundManager.playAsteroidExplosionSound();

        // Break asteroid into smaller pieces
        if (asteroid.r > 20) {
          const newSize = asteroid.r / 2;

          const currentVel = asteroid.vel.copy();
          const bulletVel = bullet.vel.copy();
          const newCombinedVel = currentVel.add(
            bulletVel.setMag(currentVel.mag())
          );
          newCombinedVel.setMag(newCombinedVel.mag() * 1.5);

          for (let k = 0; k < 2; k++) {
            const newAsteroid = createAsteroid(
              asteroid.pos.x,
              asteroid.pos.y,
              newSize
            );

            // Create different angles for the two asteroid pieces
            const angleOffset = k === 0 ? p.PI / 4 : -p.PI / 4;
            const vel = newCombinedVel
              .copy()
              .add(Vector.fromAngle(ship.heading + angleOffset).mult(1.3));

            newAsteroid.vel = vel;
          }
        }

        // Remove the asteroid and update score
        asteroids.splice(j, 1);
        const points = Math.floor(100 / asteroid.r);
        score += points;

        pointIndicators.add(points, bullet.pos.x, bullet.pos.y);

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
    if (p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(65)) {
      ship.rotation -= 0.037;
    }
    if (p.keyIsDown(p.RIGHT_ARROW) || p.keyIsDown(68)) {
      ship.rotation += 0.037;
    }
  };

  p.keyPressed = (e: any) => {
    if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
      isBoosting = true;
    }
    if (e.key === " ") {
      const bullet = fire();
      if (bullet) {
        soundManager.playFireSound();
      }
    }
    if (e.key === "Enter" && gameOver) {
      resetGame();
    }
  };

  const fire = () => {
    if (bullets.length >= 10) {
      return;
    }

    const bulletPos = Vector.fromAngle(ship.heading).mult(ship.r).add(ship.pos);
    const newBullet = new Bullet(bulletPos.x, bulletPos.y, ship.heading);
    newBullet.vel.add(ship.vel);

    bullets.push(newBullet);

    // make the ship block back
    const knockbackForce = Vector.fromAngle(ship.heading).mult(
      -SHIP_KNOCKBACK_FORCE
    );
    ship.applyForce(knockbackForce);

    return newBullet;
  };

  p.keyReleased = (e: any) => {
    if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
      isBoosting = false;
    }
  };
}

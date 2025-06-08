import P5, { Vector } from "p5";
import { Ship } from "./entities/ship";
import { Asteroid } from "./entities/asteroid";
import { Bullet } from "./entities/bullet";
import { displayGameOver, displayHUD } from "./hud";
import {
  BACKGROUND_COLOR,
  DEBUG,
  LIVES,
  ASTEROID_SPAWN_INTERVAL,
  ASTEROID_MAX_GENERATE,
  ROCKET_SPAWN_INTERVAL,
  ROCKET_MAX_GENERATE,
  ASTEROID_INITIAL_COUNT,
  ASTEROID_SPLIT_COUNT,
  SHIP_ROTATION_SPEED,
} from "./config";
import { SoundManager } from "./sound-manager";
import { PointIndicator } from "./point-indicator";
import { Rocket } from "./entities/rocket";
import { ExplosionEffect } from "./entities/explosion-effect";
import { ScoreManager } from "./score";

export let p: P5;
export let ship: Ship | null;

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
export let isGameOver = false;
export let rebornCountdown = 0;

let pointIndicators: PointIndicator;

// Get sound manager instance
let soundManager: SoundManager;

export function sketch(p5: P5) {
  p = p5;
  let asteroids: Asteroid[] = [];
  let bullets: Bullet[] = [];
  let rockets: Rocket[] = [];
  let explosionEffects: ExplosionEffect[] = [];
  let stars: { pos: P5.Vector; size: number }[] = [];

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
    // p5.js can't load fonts from Google Fonts CSS URL directly
    // Instead, set the font family directly - the font should be available from the page's CSS
    p.textFont("Orbitron");
    p.createCanvas(innerWidth, innerHeight);
    backgroundColor = p.color(BACKGROUND_COLOR);
    pointIndicators = new PointIndicator();
    soundManager = SoundManager.getInstance();
    resetGame();

    // Create stars
    for (let i = 0; i < 100; i++) {
      const star = {
        pos: p.createVector(p.random(0, p.width), p.random(0, p.height)),
        size: p.random(0.1, 3),
      };
      stars.push(star);
    }
  };

  p.draw = () => {
    background();

    if (isGameOver) {
      displayGameOver();
      return;
    }

    updateAndDrawBullets();
    updateAndDrawAsteroids();
    updateAndDrawRockets();
    displayHUD();
    updateAndDrawShip();

    pointIndicators.update();
    pointIndicators.draw();

    controls();

    for (let explosionEffect of explosionEffects) {
      explosionEffect.update();
      explosionEffect.draw();
      if (explosionEffect.shouldRemove()) {
        explosionEffects.splice(explosionEffects.indexOf(explosionEffect), 1);
      }
    }

    if (
      p.frameCount % ASTEROID_SPAWN_INTERVAL === 0 &&
      asteroids.length < ASTEROID_MAX_GENERATE
    ) {
      createAsteroid();
    }

    if (
      p.frameCount % ROCKET_SPAWN_INTERVAL === 0 &&
      rockets.length < ROCKET_MAX_GENERATE
    ) {
      createRocket();
    }
  };

  const background = () => {
    p.background(backgroundColor);
    // Draw stars
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const color = p.map(star.size, 0.1, 3, 140, 180);
      p.fill(color);
      p.circle(star.pos.x, star.pos.y, star.size);
    }
  };

  const updateAndDrawShip = () => {
    if (!ship) return;

    ship.update();
    ship.draw();
    ship.edges();
    if (ship.isBoosting) ship.boost();
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
      if (ship) rocket.tracking(ship.pos);
      rocket.edges();

      if (rocket.shouldRemove()) {
        rockets.splice(i, 1);
      }

      // Check if rocket collides with ship
      if (ship && rocket.intersects(ship) && !ship.invincible) {
        shipDestroyed(rocket.vel);
        rockets.splice(i, 1);
        continue;
      }

      // Check if rocket collides with asteroids
      for (let j = asteroids.length - 1; j >= 0; j--) {
        const asteroid = asteroids[j];
        if (rocket.intersects(asteroid)) {
          rockets.splice(i, 1);

          // Play explosion sound
          soundManager.playAsteroidExplosionSound();

          // Award points based on asteroid size
          const points = Math.floor(150 / asteroid.r) * 200;
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
    explosionEffects = [];
    pointIndicators.reset();
    score = 0;
    lives = 3;
    isGameOver = false;

    // Create initial asteroids
    for (let i = 0; i < ASTEROID_INITIAL_COUNT; i++) {
      createAsteroid();
    }
  };

  const createRocket = () => {
    const newX = p.random(0, p.width);
    const newY = p.random(0, p.height);

    // Ensure rockets don't spawn too close to the ship
    if (ship) {
      const shipDist = p.dist(newX, newY, ship.pos.x, ship.pos.y);
      if (shipDist < 250) {
        return createRocket();
      }
    }

    const rocket = new Rocket(newX, newY);
    rockets.push(rocket);
  };

  const createAsteroid = (x?: number, y?: number, size?: number) => {
    const newX = x ?? p.random(0, p.width);
    const newY = y ?? p.random(0, p.height);
    const newSize = size ?? p.random(30, 50);

    // Ensure asteroids don't spawn too close to the ship
    if (ship) {
      const shipDist = p.dist(newX, newY, ship.pos.x, ship.pos.y);
      if (shipDist < 200 && x === undefined) {
        return createAsteroid();
      }
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
              .add(
                Vector.fromAngle(ship?.heading ?? 0 + angleOffset).mult(1.3)
              );

            newAsteroid.vel = vel;
          }
        }

        // Remove the asteroid and update score
        asteroids.splice(j, 1);
        const points = Math.floor(100 / asteroid.r) * 100;
        score += points;

        pointIndicators.add(points, bullet.pos.x, bullet.pos.y);
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
        asteroid.collision(other);
      }
    }
  };

  const checkShipAsteroidCollision = (
    asteroid: Asteroid,
    asteroidIndex: number
  ) => {
    if (!ship) return;
    if (ship.intersects(asteroid)) {
      shipDestroyed(asteroid.vel);
      asteroids.splice(asteroidIndex, 1);
    }
  };

  const shipDestroyed = (force?: Vector) => {
    if (!ship) throw new Error("Ship is not defined");

    lives--;

    // Create explosion effect
    const explosionPos = ship.pos.copy();
    const explosionVel = ship.vel.copy().add(force ?? new Vector(0, 0));
    explosionEffects.push(
      new ExplosionEffect(explosionPos, explosionVel, 100, 180)
    );

    // Play explosion sound
    soundManager.playAsteroidExplosionSound();

    if (lives <= 0) {
      gameOver();
    } else {
      ship = new Ship(p.width / 2, p.height / 2);
    }
  };

  const controls = () => {
    if (!ship) return;

    if (p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(65)) {
      ship.addRotation(-SHIP_ROTATION_SPEED);
    }
    if (p.keyIsDown(p.RIGHT_ARROW) || p.keyIsDown(68)) {
      ship.addRotation(SHIP_ROTATION_SPEED);
    }
    if (p.keyIsDown(32)) {
      const bullet = ship.shoot();
      if (bullet) {
        soundManager.playFireSound();
        bullets.push(bullet);
      }
    }

    const isHoldingUp = p.keyIsDown(p.UP_ARROW) || p.keyIsDown(87);
    if (isHoldingUp) {
      ship.isBoosting = true;
    } else {
      ship.isBoosting = false;
    }
  };

  const gameOver = () => {
    isGameOver = true;

    // Save the score
    ScoreManager.saveScore(score);
  };

  p.keyPressed = (e: any) => {
    if (isGameOver) {
      resetGame();
    }
  };
}

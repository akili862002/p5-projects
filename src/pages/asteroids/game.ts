import P5, { Vector } from "p5";
import { Ship } from "./entities/ship";
import { Asteroid } from "./entities/asteroid";
import { Bullet } from "./entities/bullet";
import { Rocket } from "./entities/rocket";
import { ExplosionEffect } from "./entities/explosion-effect";
import { PointIndicator } from "./point-indicator";
import { SoundManager } from "./sound-manager";
import { ScoreManager } from "./score";
import {
  LIVES,
  ASTEROID_SPAWN_INTERVAL,
  ASTEROID_MAX_GENERATE,
  ROCKET_SPAWN_INTERVAL,
  ROCKET_MAX_GENERATE,
  ASTEROID_INITIAL_COUNT,
  ASTEROID_SPLIT_COUNT,
  SHIP_ROTATION_SPEED,
  SHIP_SPAWN_DELAY_MS,
  POINTS_PER_LEVEL,
  MIN_SPAWN_DISTANCE,
  PROVOCATIONS,
} from "./config";
import { HUD } from "./hud/hud";
import { IBuff } from "./entities/buffs/buff";
import {
  DoubleGunBuff,
  ReduceShootCooldownBuff,
  ReduceKnockbackBuff,
} from "./entities/buffs";
import { HealBuff } from "./entities/buffs/heal.buff";
import { BulletSpeedBuff } from "./entities/buffs/bullet-speed.buff";
import { ExtraLiveBuff } from "./entities/buffs/extra-live.buff";

export class Game {
  private p: P5;
  private soundManager: SoundManager;
  private pointIndicators: PointIndicator;
  private hud: HUD;

  // Game state
  public score = 0;
  public maxLives = LIVES;
  public lives = LIVES;
  public isGameOver = false;
  public ship: Ship;
  public paused = false;

  // Entity collections
  private asteroids: Asteroid[] = [];
  private bullets: Bullet[] = [];
  private rockets: Rocket[] = [];
  private explosionEffects: ExplosionEffect[] = [];
  private lastSpawnedRocketTime = 0;
  private level = 0;
  private buffs: IBuff[] = [];

  constructor(p5: P5) {
    this.p = p5;
    this.soundManager = SoundManager.getInstance();
    this.pointIndicators = new PointIndicator();
    this.hud = new HUD();
  }

  resetGame() {
    this.ship = new Ship(this.p.width / 2, this.p.height / 2);
    this.asteroids = [];
    this.bullets = [];
    this.rockets = [];
    this.explosionEffects = [];
    this.pointIndicators.reset();
    this.score = 0;
    this.maxLives = LIVES;
    this.lives = LIVES;
    this.isGameOver = false;
    this.level = 0;
    this.hud.toast.clean();
    this.buffs = [];

    this.buffs.push(new DoubleGunBuff(this.ship));
    this.buffs.push(new ReduceShootCooldownBuff(this.ship, 10));
    this.buffs.push(new ReduceKnockbackBuff(this.ship, 80));
    this.buffs.push(new BulletSpeedBuff(this.ship, 10));
    this.buffs.push(new ExtraLiveBuff(this));
    this.buffs.push(new ExtraLiveBuff(this));
    this.buffs.push(new HealBuff(this));
    this.applyBuffs();

    // Create initial asteroids
    for (let i = 0; i < ASTEROID_INITIAL_COUNT; i++) {
      this.createAsteroid();
    }
  }

  setup() {
    this.resetGame();
  }

  update() {
    if (this.paused) return;

    this.updateShip();
    this.updateBullets();
    this.updateAsteroids();
    this.updateRockets();
    this.updateExplosionEffects();
    this.pointIndicators.update();
    this.updateLevels();

    this.spawnRocket();
    this.spawnAsteroid();
  }

  draw() {
    this.drawBullets();
    this.drawAsteroids();
    this.drawRockets();
    this.drawShip();
    this.drawExplosionEffects();
    this.pointIndicators.draw();

    // Update and render HUD
    if (this.isGameOver) {
      this.hud.renderGameOver();
    } else {
      this.hud.update();
      this.hud.render();
    }
  }

  // Ship methods
  private updateShip() {
    if (this.ship.isDead) return;

    this.ship.update();
    this.ship.edges();
    if (this.ship.isBoosting) this.ship.boost();
  }

  private drawShip() {
    if (this.ship.isDead) return;
    this.ship.draw();
  }

  // Bullet methods
  private updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update();
      bullet.edges();

      if (bullet.shouldRemove()) {
        this.bullets.splice(i, 1);
        continue;
      }

      this.checkBulletAsteroidCollisions(bullet, i);
    }
  }

  private drawBullets() {
    for (const bullet of this.bullets) {
      bullet.draw();
    }
  }

  private checkBulletAsteroidCollisions(bullet: Bullet, bulletIndex: number) {
    for (let j = this.asteroids.length - 1; j >= 0; j--) {
      const asteroid = this.asteroids[j];

      if (bullet.intersects(asteroid)) {
        // Remove the bullet
        this.bullets.splice(bulletIndex, 1);

        // Play explosion sound
        this.soundManager.playAsteroidExplosionSound();

        // Handle asteroid destruction
        this.destroyAsteroid(asteroid, j, bullet.pos, bullet.vel);
        break;
      }
    }
  }

  // Asteroid methods
  private updateAsteroids() {
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const asteroid = this.asteroids[i];
      asteroid.update();
      asteroid.edges();

      this.checkAsteroidCollisions(asteroid, i);
      this.checkShipAsteroidCollision(asteroid, i);
    }
  }

  private drawAsteroids() {
    for (const asteroid of this.asteroids) {
      asteroid.draw();
    }
  }

  private checkAsteroidCollisions(asteroid: Asteroid, asteroidIndex: number) {
    for (let j = asteroidIndex - 1; j >= 0; j--) {
      const other = this.asteroids[j];
      if (asteroid.intersectsAsteroid(other)) {
        asteroid.collision(other);
      }
    }
  }

  private checkShipAsteroidCollision(
    asteroid: Asteroid,
    asteroidIndex: number
  ) {
    if (this.ship.isDead) return;

    if (this.ship.intersects(asteroid)) {
      this.destroyShip(asteroid.vel);
      this.asteroids.splice(asteroidIndex, 1);
    }
  }

  private destroyAsteroid(
    asteroid: Asteroid,
    asteroidIndex: number,
    explosionPos: Vector,
    impactVel?: Vector
  ) {
    // Break asteroid into smaller pieces if large enough
    if (asteroid.r > 20) {
      const newSize = asteroid.r / 2;
      const currentVel = asteroid.vel.copy();
      const bulletVel = impactVel ? impactVel.copy() : new Vector(0, 0);
      const newCombinedVel = currentVel.add(bulletVel.setMag(currentVel.mag()));
      newCombinedVel.setMag(newCombinedVel.mag() * 1.5);

      for (let k = 0; k < ASTEROID_SPLIT_COUNT; k++) {
        // Add slight offset to starting positions to prevent sticking together
        const posOffset = Vector.random2D().mult(newSize * 0.5);
        const newAsteroid = this.createAsteroid(
          asteroid.pos.x + posOffset.x,
          asteroid.pos.y + posOffset.y,
          newSize
        );

        // Create different angles for the two asteroid pieces
        const angleOffset = k === 0 ? this.p.PI / 2 : -this.p.PI / 2;
        const vel = newCombinedVel
          .copy()
          .add(
            Vector.fromAngle((this.ship?.heading ?? 0) + angleOffset).mult(1.3)
          );

        newAsteroid.vel = vel;
      }
    }

    // Create explosion effect
    this.explosionEffects.push(
      new ExplosionEffect({
        pos: explosionPos.copy(),
        vel: impactVel ? impactVel.copy().setMag(3) : new Vector(0, 0),
        size: 100,
        duration: 180,
        color: this.p.color(243, 197, 123),
      })
    );

    // Remove the asteroid and update score
    this.asteroids.splice(asteroidIndex, 1);
    const points = Math.floor(100 / asteroid.r) * 10;
    this.score += points;

    this.pointIndicators.add(points, explosionPos.x, explosionPos.y);
  }

  // Rocket methods
  private updateRockets() {
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const rocket = this.rockets[i];
      rocket.update();
      if (!this.ship.isDead) rocket.tracking(this.ship.pos);
      rocket.edges();

      if (rocket.shouldRemove()) {
        this.rockets.splice(i, 1);
        continue;
      }

      // Check if rocket collides with ship
      if (
        !this.ship.isDead &&
        rocket.intersects(this.ship) &&
        !this.ship.invincible
      ) {
        this.destroyShip(rocket.vel);
        this.rockets.splice(i, 1);
        continue;
      }

      // Check if rocket collides with asteroids
      this.checkRocketAsteroidCollisions(rocket, i);
    }
  }

  private drawRockets() {
    for (const rocket of this.rockets) {
      rocket.draw();
    }
  }

  private checkRocketAsteroidCollisions(rocket: Rocket, rocketIndex: number) {
    for (let j = this.asteroids.length - 1; j >= 0; j--) {
      const asteroid = this.asteroids[j];

      if (rocket.intersects(asteroid)) {
        this.rockets.splice(rocketIndex, 1);

        // Play explosion sound
        this.soundManager.playAsteroidExplosionSound();

        // Award points based on asteroid size
        const points = Math.floor(100 / asteroid.r) * 15;
        this.score += points;
        this.pointIndicators.add(points, asteroid.pos.x, asteroid.pos.y);

        // Break asteroid into smaller pieces if large enough
        if (asteroid.r > 20) {
          const newSize = asteroid.r / 2;
          for (let k = 0; k < ASTEROID_SPLIT_COUNT; k++) {
            const angle = this.p.random(0, this.p.TWO_PI);
            const newAsteroid = this.createAsteroid(
              asteroid.pos.x,
              asteroid.pos.y,
              newSize
            );
            newAsteroid.vel = Vector.fromAngle(angle).mult(2);
          }
        }

        this.asteroids.splice(j, 1);
        break;
      }
    }
  }

  // Explosion effects
  private updateExplosionEffects() {
    for (let i = this.explosionEffects.length - 1; i >= 0; i--) {
      const effect = this.explosionEffects[i];
      effect.update();

      if (effect.shouldRemove()) {
        this.explosionEffects.splice(i, 1);
      }
    }
  }

  private drawExplosionEffects() {
    for (const effect of this.explosionEffects) {
      effect.draw();
    }
  }

  private updateLevels() {
    const level = this.getLevel();
    if (level > this.level) {
      this.handleLevelUp(level);
    }
    this.level = level;
  }

  private handleLevelUp(lv: number) {
    if (lv === 1) {
      this.hud.toast.add("Welcome to Asteroids, Captain!", 3 * 60);
    } else {
      this.hud.toast.add(`Level Up!`, 100);
    }

    if (lv === 2 && this.ship) {
      this.buffs.push(new DoubleGunBuff(this.ship));
      this.applyBuffs();

      setTimeout(() => {
        this.hud.toast.add(`Level Up!. You got Double Gun!`, 3 * 60);

        setTimeout(() => {
          this.hud.toast.add(`Watchout! Rockets are coming!`, 5 * 60);
        }, 500);
      }, 2000);
    }
  }

  private applyBuffs() {
    for (const buff of this.buffs) {
      buff.apply();
    }
  }

  // Ship destruction
  private destroyShip(force?: Vector) {
    if (this.ship.isDead) throw new Error("Ship is not defined");

    this.lives--;

    // Create explosion effect
    const explosionPos = this.ship.pos.copy();
    const explosionVel = this.ship.vel.copy().add(force ?? new Vector(0, 0));
    this.explosionEffects.push(
      new ExplosionEffect({
        pos: explosionPos,
        vel: explosionVel,
        size: 100,
        duration: 180,
        color: this.p.color(116, 240, 243),
      })
    );

    // Play explosion sound
    this.soundManager.playAsteroidExplosionSound();

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Reset ship
      this.ship.die();
      setTimeout(() => {
        this.ship.reset(this.p.width / 2, this.p.height / 2);
      }, SHIP_SPAWN_DELAY_MS);

      // Show toast
      const message =
        PROVOCATIONS[Math.floor(Math.random() * PROVOCATIONS.length)];
      this.hud.toast.add(message, 3 * 60);
    }
  }

  private spawnRocket() {
    // Calculate adjusted spawn interval based on level
    const adjustedRocketSpawnInterval =
      ROCKET_SPAWN_INTERVAL - this.getLevel() * 60;

    // Check if enough time has passed since last rocket spawn
    const isSpawnTimeElapsed =
      this.p.frameCount - this.lastSpawnedRocketTime >
      Math.max(60, adjustedRocketSpawnInterval);

    // Check all conditions for spawning a new rocket
    if (
      !this.ship.isDead &&
      this.getLevel() >= 2 &&
      isSpawnTimeElapsed &&
      this.rockets.length < ROCKET_MAX_GENERATE
    ) {
      this.createRocket();
      this.lastSpawnedRocketTime = this.p.frameCount;
    }
  }

  private spawnAsteroid() {
    if (
      this.p.frameCount % ASTEROID_SPAWN_INTERVAL === 0 &&
      this.asteroids.length < ASTEROID_MAX_GENERATE
    ) {
      this.createAsteroid();
    }
  }

  private createAsteroid(x?: number, y?: number, size?: number): Asteroid {
    const newX = x ?? this.p.random(0, this.p.width);
    const newY = y ?? this.p.random(0, this.p.height);
    const newSize = size ?? this.p.random(30, 50);

    // Ensure asteroids don't spawn too close to the ship
    if (!this.ship.isDead) {
      const shipDist = this.p.dist(
        newX,
        newY,
        this.ship.pos.x,
        this.ship.pos.y
      );
      if (shipDist < MIN_SPAWN_DISTANCE && x === undefined) {
        return this.createAsteroid();
      }
    }

    const newAsteroid = new Asteroid(newX, newY, newSize);
    this.asteroids.push(newAsteroid);
    return newAsteroid;
  }

  private createRocket() {
    if (this.ship.isDead) return;

    const newX = this.p.random(0, this.p.width);
    const newY = this.p.random(0, this.p.height);

    const shipDist = this.p.dist(newX, newY, this.ship.pos.x, this.ship.pos.y);
    if (shipDist < MIN_SPAWN_DISTANCE) {
      return this.createRocket();
    }

    const rocket = new Rocket(newX, newY);
    this.rockets.push(rocket);
  }

  keyboards() {
    if (this.ship.isDead) return;

    if (this.p.keyIsDown(this.p.LEFT_ARROW) || this.p.keyIsDown(65)) {
      this.ship.addRotation(-SHIP_ROTATION_SPEED);
    }
    if (this.p.keyIsDown(this.p.RIGHT_ARROW) || this.p.keyIsDown(68)) {
      this.ship.addRotation(SHIP_ROTATION_SPEED);
    }
    if (this.p.keyIsDown(32)) {
      const bullets = this.ship.shoot();
      if (bullets) {
        this.soundManager.playFireSound();
        this.bullets.push(...bullets);
      }
    }

    const isHoldingUp =
      this.p.keyIsDown(this.p.UP_ARROW) || this.p.keyIsDown(87);
    this.ship.isBoosting = isHoldingUp;
  }

  private gameOver() {
    this.isGameOver = true;
    this.ship.die();
    ScoreManager.saveScore(this.score);
  }

  onKeyPressed(e: KeyboardEvent) {
    if (this.isGameOver) {
      if (e.key === "Enter") {
        this.resetGame();
        return;
      }
    }

    if (this.paused && (e.key === " " || e.key === "Enter")) {
      this.paused = false;
      return;
    }

    if (!this.paused && (e.key === "p" || e.key === "P")) {
      this.paused = !this.paused;
      return;
    }
  }

  getLevel() {
    return Math.floor(this.score / POINTS_PER_LEVEL) + 1;
  }

  // Getters for read-only access
  get getAsteroids(): readonly Asteroid[] {
    return this.asteroids;
  }

  get getBullets(): readonly Bullet[] {
    return this.bullets;
  }

  get getRockets(): readonly Rocket[] {
    return this.rockets;
  }

  get getExplosionEffects(): readonly ExplosionEffect[] {
    return this.explosionEffects;
  }

  get getPointIndicators(): PointIndicator {
    return this.pointIndicators;
  }

  get getBuffs(): readonly IBuff[] {
    return this.buffs;
  }
}

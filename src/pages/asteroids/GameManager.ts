import P5 from "p5";
import { GameEngine } from "./core/GameEngine";
import { EntityManager } from "./core/EntityManager";
import { EventSystem, GameEvent } from "./core/EventSystem";
import { InputManager } from "./core/InputManager";
import { Entity } from "./core/Entity";
import { AsteroidEntity } from "./entities/AsteroidEntity";
import { BulletEntity } from "./entities/BulletEntity";
import { HUD } from "./hud/hud";
import { SoundManager } from "./sound-manager";
import { Vector } from "p5";
import {
  ASTEROID_INITIAL_COUNT,
  ASTEROID_MAX_GENERATE,
  ASTEROID_SPAWN_INTERVAL,
  ASTEROID_SPLIT_COUNT,
  MIN_SPAWN_DISTANCE,
} from "./config";
import { ScoreManager } from "./score";

// Need to implement a ShipEntity that follows our new Entity base class
// For now, we'll use the existing Ship class with type assertions
interface ShipEntity extends Entity {
  setIsBoosting(boosting: boolean): void;
  addRotation(amount: number): void;
  shoot(): { x: number; y: number; vel: Vector }[] | null;
  isInvincible(): boolean;
  die(): void;
}

export class GameManager {
  private p5Instance: P5;
  private entityManager: EntityManager;
  private eventSystem: EventSystem;
  private inputManager: InputManager;
  private soundManager: SoundManager;
  private gameEngine: GameEngine;
  private hud: HUD;
  private scoreManager: ScoreManager;

  // Game state
  private ship: ShipEntity | null = null;
  private lastAsteroidSpawnTime = 0;

  constructor(p5Instance: P5) {
    this.p5Instance = p5Instance;
    this.entityManager = EntityManager.getInstance();
    this.eventSystem = EventSystem.getInstance();
    this.inputManager = InputManager.getInstance();
    this.gameEngine = GameEngine.getInstance(p5Instance);
    this.soundManager = SoundManager.getInstance();
    this.hud = new HUD();
    this.scoreManager = this.gameEngine.getScoreManager();

    // Setup event listeners
    this.setupEventListeners();
  }

  public getGameEngine(): GameEngine {
    return this.gameEngine;
  }

  private setupEventListeners(): void {
    // Setup collision event listener
    this.eventSystem.addEventListener("collision", (data) => {
      this.handleCollision(data.entityA, data.entityB);
    });

    // Setup keyboard input handlers
    this.setupKeyboardHandlers();
  }

  private setupKeyboardHandlers(): void {
    // Up arrow or W - boost
    this.inputManager.addKeyDownHandler("ArrowUp", () => {
      if (this.ship) this.ship.setIsBoosting(true);
    });

    this.inputManager.addKeyUpHandler("ArrowUp", () => {
      if (this.ship) this.ship.setIsBoosting(false);
    });

    this.inputManager.addKeyDownHandler("KeyW", () => {
      if (this.ship) this.ship.setIsBoosting(true);
    });

    this.inputManager.addKeyUpHandler("KeyW", () => {
      if (this.ship) this.ship.setIsBoosting(false);
    });

    // Left/Right arrows or A/D - rotate
    this.inputManager.addKeyDownHandler("ArrowLeft", () => {
      if (this.ship) this.ship.addRotation(-0.1);
    });

    this.inputManager.addKeyDownHandler("ArrowRight", () => {
      if (this.ship) this.ship.addRotation(0.1);
    });

    this.inputManager.addKeyDownHandler("KeyA", () => {
      if (this.ship) this.ship.addRotation(-0.1);
    });

    this.inputManager.addKeyDownHandler("KeyD", () => {
      if (this.ship) this.ship.addRotation(0.1);
    });

    // Space - shoot
    this.inputManager.addKeyDownHandler("Space", () => {
      this.handleShipShoot();
    });

    // Escape or P - pause
    this.inputManager.addKeyDownHandler("Escape", () => {
      this.togglePause();
    });

    this.inputManager.addKeyDownHandler("KeyP", () => {
      this.togglePause();
    });

    // R - restart game
    this.inputManager.addKeyDownHandler("KeyR", () => {
      if (this.gameEngine.isGameOver()) {
        this.resetGame();
      }
    });
  }

  public setup(): void {
    this.gameEngine.setup();
    this.resetGame();
  }

  public resetGame(): void {
    // Clear entities
    this.entityManager.clear();

    // Create ship - we're using type assertion here since we're in a transitional state
    // In a fully refactored system, we would have a proper ShipEntity class
    try {
      const ShipClass = require("./entities/Ship").Ship;
      this.ship = new ShipClass(
        this.p5Instance.width / 2,
        this.p5Instance.height / 2
      ) as ShipEntity;

      this.entityManager.addEntity(this.ship, "ship");
    } catch (e) {
      console.error("Error creating ship:", e);
    }

    // Create initial asteroids
    for (let i = 0; i < ASTEROID_INITIAL_COUNT; i++) {
      this.createRandomAsteroid();
    }

    // Reset game state
    this.lastAsteroidSpawnTime = this.p5Instance.millis();

    // Reset game engine
    this.gameEngine.resetGame();
  }

  public update(): void {
    if (this.gameEngine.isPaused() || this.gameEngine.isGameOver()) return;

    // Update game engine
    this.gameEngine.update();

    // Update HUD
    this.hud.update();

    // Spawn new asteroids
    this.spawnAsteroid();
  }

  public draw(): void {
    // Draw game entities
    this.gameEngine.draw();

    // Draw HUD
    if (this.gameEngine.isGameOver()) {
      this.hud.renderGameOver();
    } else {
      this.hud.render();
    }
  }

  private handleCollision(entityA: Entity, entityB: Entity): void {
    // Helper to determine entity types
    const isShip = (entity: Entity): entity is ShipEntity => {
      return entity.constructor.name === "Ship";
    };

    const isAsteroid = (entity: Entity): entity is AsteroidEntity => {
      return entity instanceof AsteroidEntity;
    };

    const isBullet = (entity: Entity): entity is BulletEntity => {
      return entity instanceof BulletEntity;
    };

    // Check ship collision with asteroid
    if (
      (isShip(entityA) && isAsteroid(entityB)) ||
      (isAsteroid(entityA) && isShip(entityB))
    ) {
      const ship = isShip(entityA) ? entityA : (entityB as ShipEntity);
      const asteroid = isAsteroid(entityA)
        ? entityA
        : (entityB as AsteroidEntity);

      if (!ship.isInvincible()) {
        this.destroyShip(ship, asteroid.getVelocity());
      }
    }

    // Check bullet collision with asteroid
    if (
      (isBullet(entityA) && isAsteroid(entityB)) ||
      (isAsteroid(entityA) && isBullet(entityB))
    ) {
      const bullet = isBullet(entityA) ? entityA : (entityB as BulletEntity);
      const asteroid = isAsteroid(entityA)
        ? entityA
        : (entityB as AsteroidEntity);

      this.destroyAsteroid(
        asteroid,
        bullet.getPosition(),
        bullet.getVelocity()
      );
      this.entityManager.removeEntity(bullet.getId());
    }

    // Check asteroid-asteroid collision
    if (isAsteroid(entityA) && isAsteroid(entityB)) {
      entityA.handleCollision(entityB);
    }
  }

  private handleShipShoot(): void {
    if (
      !this.ship ||
      this.gameEngine.isPaused() ||
      this.gameEngine.isGameOver()
    )
      return;

    const bullets = this.ship.shoot();
    if (bullets) {
      for (const bulletData of bullets) {
        const bullet = new BulletEntity(
          bulletData.x,
          bulletData.y,
          bulletData.vel
        );
        this.entityManager.addEntity(bullet, "bullet");
      }

      // Play shoot sound - with error handling
      try {
        this.soundManager.playFireSound();
      } catch (error) {
        console.warn("Sound method not available:", error);
      }
    }
  }

  private destroyShip(ship: ShipEntity, asteroidVel?: Vector): void {
    // Create explosion effect
    // ...

    // Play explosion sound
    try {
      this.soundManager.playAsteroidExplosionSound();
    } catch (error) {
      console.warn("Sound method not available:", error);
    }

    // Decrement lives
    const gameState = this.gameEngine.getGameState();
    gameState.decrementLives();

    // Check game over
    if (gameState.getLives() <= 0) {
      this.gameOver();
      return;
    }

    // Mark ship as dead
    ship.die();

    // Create a new ship after delay
    setTimeout(() => {
      this.respawnShip();
    }, 1000);
  }

  private respawnShip(): void {
    if (this.gameEngine.isGameOver()) return;

    // Create new ship
    try {
      const ShipClass = require("./entities/Ship").Ship;
      this.ship = new ShipClass(
        this.p5Instance.width / 2,
        this.p5Instance.height / 2
      ) as ShipEntity;

      this.entityManager.addEntity(this.ship, "ship");
    } catch (e) {
      console.error("Error respawning ship:", e);
    }
  }

  private destroyAsteroid(
    asteroid: AsteroidEntity,
    position: Vector,
    bulletVel?: Vector
  ): void {
    // Add score
    const radius = (asteroid as any).collider.getRadius();
    const points = Math.floor((100 / radius) * 10); // Smaller asteroids worth more
    this.gameEngine.getGameState().addScore(points);

    // Create explosion effect
    // ...

    // Play explosion sound
    try {
      this.soundManager.playAsteroidExplosionSound();
    } catch (error) {
      console.warn("Sound method not available:", error);
    }

    // Split asteroid if large enough
    if (radius > 20) {
      this.splitAsteroid(asteroid, position, bulletVel);
    }

    // Remove asteroid
    this.entityManager.removeEntity(asteroid.getId());
  }

  private splitAsteroid(
    asteroid: AsteroidEntity,
    position: Vector,
    bulletVel?: Vector
  ): void {
    const radius = (asteroid as any).collider.getRadius() / 2;
    const pos = asteroid.getPosition();

    for (let i = 0; i < ASTEROID_SPLIT_COUNT; i++) {
      // Add slight offset to starting positions to prevent sticking together
      const posOffset = Vector.random2D().mult(radius * 0.5);
      const newAsteroid = new AsteroidEntity(
        pos.x + posOffset.x,
        pos.y + posOffset.y,
        radius
      );

      // Adjust velocity based on bullet impact
      if (bulletVel) {
        const currentVel = asteroid.getVelocity().copy();
        const newBulletVel = bulletVel.copy();

        // Create different angles for the asteroid pieces
        const angleOffset =
          i === 0 ? this.p5Instance.PI / 2 : -this.p5Instance.PI / 2;
        const newVel = currentVel
          .copy()
          .add(newBulletVel.rotate(angleOffset))
          .setMag(currentVel.mag() * 1.5);

        newAsteroid.setVelocity(newVel.x, newVel.y);
      }

      this.entityManager.addEntity(newAsteroid, "asteroid");
    }
  }

  private spawnAsteroid(): void {
    const currentTime = this.p5Instance.millis();

    // Check if it's time to spawn a new asteroid
    if (
      currentTime - this.lastAsteroidSpawnTime > ASTEROID_SPAWN_INTERVAL &&
      this.entityManager.getEntitiesByType("asteroid").length <
        ASTEROID_MAX_GENERATE
    ) {
      this.createRandomAsteroid();
      this.lastAsteroidSpawnTime = currentTime;
    }
  }

  private createRandomAsteroid(): void {
    // Create asteroid outside of the screen
    let x, y;
    let isValidPosition = false;

    while (!isValidPosition) {
      // Randomly position at edge of screen
      const side = Math.floor(this.p5Instance.random(4));

      switch (side) {
        case 0: // Top
          x = this.p5Instance.random(this.p5Instance.width);
          y = -30;
          break;
        case 1: // Right
          x = this.p5Instance.width + 30;
          y = this.p5Instance.random(this.p5Instance.height);
          break;
        case 2: // Bottom
          x = this.p5Instance.random(this.p5Instance.width);
          y = this.p5Instance.height + 30;
          break;
        case 3: // Left
          x = -30;
          y = this.p5Instance.random(this.p5Instance.height);
          break;
        default:
          x = -30;
          y = -30;
      }

      // Check distance from ship
      if (this.ship) {
        const distance = this.p5Instance.dist(
          x,
          y,
          this.ship.getPosition().x,
          this.ship.getPosition().y
        );

        if (distance > MIN_SPAWN_DISTANCE) {
          isValidPosition = true;
        }
      } else {
        isValidPosition = true;
      }
    }

    // Create asteroid with random size
    const size = this.p5Instance.random(30, 80);
    const asteroid = new AsteroidEntity(x, y, size);

    // Add to entity manager
    this.entityManager.addEntity(asteroid, "asteroid");
  }

  private togglePause(): void {
    this.gameEngine.setPaused(!this.gameEngine.isPaused());
  }

  private gameOver(): void {
    this.eventSystem.dispatchEvent(GameEvent.GAME_OVER);

    // Save high score
    const score = this.gameEngine.getGameState().getScore();
    ScoreManager.saveScore(score);
  }

  public handleKeyPressed(event: KeyboardEvent): void {
    // This is just a wrapper for compatibility with the old system
    // The actual key handling is done by the InputManager
  }
}

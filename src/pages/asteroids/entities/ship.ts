import { Vector } from "p5";
import { Entity } from "../core/Entity";
import { CircleCollider } from "../core/components/Collider";
import { ImageRenderer } from "../core/components/Renderer";
import { p, shipImg } from "../sketch";
import {
  SHIP_MAX_SPEED,
  SHIP_FRICTION,
  SHIP_BOOST_FORCE,
  SHIP_KNOCKBACK_FORCE,
  SHIP_SHOOT_COOLDOWN,
  BULLET_SPEED,
  SHIP_MAX_ROTATION,
} from "../config";
import { EventSystem } from "../core/EventSystem";
import { FlameParticleSystem } from "./FlameParticleSystem";

// Define the return type for bullets
interface BulletData {
  x: number;
  y: number;
  vel: Vector;
}

export class Ship extends Entity {
  private flameParticleSystem: FlameParticleSystem;
  private invincible: boolean = false;
  private invincibleTimer: number = 0;
  private isBoosting: boolean = false;
  private lastShootTime: number = 0;
  private shootCooldown: number = SHIP_SHOOT_COOLDOWN;
  private knockbackForce: number = SHIP_KNOCKBACK_FORCE;
  private bulletSpeed: number = BULLET_SPEED;
  private gunMode: "single" | "double" = "single";
  private isDead: boolean = false;
  private collider: CircleCollider;
  private renderer: ImageRenderer;

  constructor(x: number, y: number) {
    super(x, y);

    // Initialize components
    this.collider = new CircleCollider(24); // Ship radius
    this.renderer = new ImageRenderer(shipImg, 48, 48); // Ship size
    this.flameParticleSystem = new FlameParticleSystem(this);

    // Add components
    this.addComponent(this.collider);
    this.addComponent(this.renderer);

    // Initialize ship properties
    this.reset(x, y);
  }

  public reset(x: number, y: number): void {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.transform.heading = -p.PI / 2;
    this.transform.friction = SHIP_FRICTION;
    this.transform.maxSpeed = SHIP_MAX_SPEED;
    this.invincible = true;
    this.invincibleTimer = 180; // 3 seconds at 60fps
    this.isBoosting = false;
    this.lastShootTime = 0;
    this.isDead = false;
  }

  public update(): void {
    if (this.isDead) return;

    // Update transform (position, velocity, etc.)
    this.transform.update();

    // Dampen rotation
    this.transform.rotation *= 0.9;
    if (Math.abs(this.transform.rotation) > SHIP_MAX_ROTATION) {
      this.transform.rotation =
        SHIP_MAX_ROTATION * Math.sign(this.transform.rotation);
    }

    // Update invincibility
    if (this.invincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }

      // Flash the ship when invincible
      if (p.frameCount % 10 < 5) {
        this.renderer.setAlpha(150);
      } else {
        this.renderer.setAlpha(255);
      }
    } else {
      this.renderer.setAlpha(255);
    }

    // Handle boosting
    if (this.isBoosting) {
      this.boost();
    }

    // Update flame particles
    this.flameParticleSystem.update();
  }

  public draw(): void {
    if (this.isDead) return;

    // Draw the ship (handled by renderer component)
    this.renderer.render();

    // Draw flame particles
    this.flameParticleSystem.draw();

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

  public boost(): void {
    const force = Vector.fromAngle(this.transform.heading).mult(
      SHIP_BOOST_FORCE
    );
    this.addForce(force);
    this.flameParticleSystem.createFlames();
  }

  public setIsBoosting(boosting: boolean): void {
    this.isBoosting = boosting;
  }

  public addRotation(amount: number): void {
    this.transform.rotation += amount;
  }

  public shoot(): BulletData[] | null {
    const currentTime = p.millis();
    if (currentTime - this.lastShootTime < this.shootCooldown) {
      return null;
    }

    this.lastShootTime = currentTime;

    // Create bullet(s) based on gun mode
    if (this.gunMode === "single") {
      const bulletPos = this.getPosition()
        .copy()
        .add(
          Vector.fromAngle(this.transform.heading).mult(
            this.collider.getRadius() * 1.2
          )
        );
      const bulletVel = Vector.fromAngle(this.transform.heading).mult(
        this.bulletSpeed
      );

      // Apply knockback to ship
      this.applyKnockback(bulletVel);

      // Return the bullet data
      return [
        {
          x: bulletPos.x,
          y: bulletPos.y,
          vel: bulletVel,
        },
      ];
    } else {
      // Double gun mode - create two bullets at an angle
      const bulletOffset = 0.2; // Slight angle offset
      const bullets: BulletData[] = [];

      // First bullet (left)
      const bulletPos1 = this.getPosition()
        .copy()
        .add(
          Vector.fromAngle(this.transform.heading - bulletOffset).mult(
            this.collider.getRadius() * 1.2
          )
        );
      const bulletVel1 = Vector.fromAngle(
        this.transform.heading - bulletOffset
      ).mult(this.bulletSpeed);
      bullets.push({
        x: bulletPos1.x,
        y: bulletPos1.y,
        vel: bulletVel1,
      });

      // Second bullet (right)
      const bulletPos2 = this.getPosition()
        .copy()
        .add(
          Vector.fromAngle(this.transform.heading + bulletOffset).mult(
            this.collider.getRadius() * 1.2
          )
        );
      const bulletVel2 = Vector.fromAngle(
        this.transform.heading + bulletOffset
      ).mult(this.bulletSpeed);
      bullets.push({
        x: bulletPos2.x,
        y: bulletPos2.y,
        vel: bulletVel2,
      });

      // Apply knockback to ship (average of both bullet velocities)
      const avgVel = bulletVel1.copy().add(bulletVel2).div(2);
      this.applyKnockback(avgVel);

      return bullets;
    }
  }

  private applyKnockback(bulletVel: Vector): void {
    const knockback = bulletVel.copy().mult(-this.knockbackForce / 100);
    this.transform.applyImpulse(knockback);
  }

  public switchGunMode(mode: "single" | "double"): void {
    this.gunMode = mode;
  }

  public die(): void {
    this.isDead = true;
    this.setActive(false);
  }

  public setKnockbackForce(force: number): void {
    this.knockbackForce = force;
  }

  public setBulletSpeed(speed: number): void {
    this.bulletSpeed = speed;
  }

  public setShootCooldown(cooldown: number): void {
    this.shootCooldown = cooldown;
  }

  public isInvincible(): boolean {
    return this.invincible;
  }
}

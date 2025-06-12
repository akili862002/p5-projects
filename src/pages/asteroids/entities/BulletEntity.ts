import { Vector } from "p5";
import { Entity } from "../core/Entity";
import { CircleCollider } from "../core/components/Collider";
import { p } from "../sketch";
import { BULLET_LIFESPAN, BULLET_RADIUS } from "../config";

export class BulletEntity extends Entity {
  private lifespan: number = BULLET_LIFESPAN;
  private collider: CircleCollider;

  constructor(x: number, y: number, velocity: Vector) {
    super(x, y);

    // Initialize components
    this.collider = new CircleCollider(BULLET_RADIUS); // Bullet radius
    this.addComponent(this.collider);

    // Set velocity
    this.setVelocity(velocity.x, velocity.y);
  }

  public update(): void {
    // Update position and velocity
    this.transform.update();

    // Decrement lifespan
    this.lifespan--;
  }

  public draw(): void {
    const pos = this.getPosition();

    p.push();
    p.fill(255);
    p.noStroke();
    p.circle(pos.x, pos.y, this.collider.getRadius() * 2);
    p.pop();

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

  public shouldRemove(): boolean {
    return this.lifespan <= 0;
  }
}

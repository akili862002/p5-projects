import { Component } from "../Component";
import { Entity } from "../Entity";
import { p } from "../../sketch";

export abstract class Collider extends Component {
  protected radius: number;
  protected isDebug: boolean = false;

  constructor(radius: number) {
    super("collider");
    this.radius = radius;
  }

  public getRadius(): number {
    return this.radius;
  }

  public setRadius(radius: number): void {
    this.radius = radius;
  }

  public setDebug(debug: boolean): void {
    this.isDebug = debug;
  }

  public intersects(other: Collider): boolean {
    if (!this.getOwner() || !other.getOwner()) return false;

    const myPosition = this.getOwner()!.getPosition();
    const otherPosition = other.getOwner()!.getPosition();
    const distance = myPosition.dist(otherPosition);

    return distance < this.radius + other.radius;
  }

  public update(): void {
    // Nothing to update for base collider
  }

  public drawDebug(): void {
    if (this.isDebug && this.getOwner()) {
      const pos = this.getOwner()!.getPosition();
      p.push();
      p.noFill();
      p.stroke(0, 255, 0);
      p.circle(pos.x, pos.y, this.radius * 2);
      p.pop();
    }
  }
}

export class CircleCollider extends Collider {
  constructor(radius: number) {
    super(radius);
  }
}

import { Vector } from "p5";
import { Component } from "../Component";
import { p } from "../../sketch";

export class Transform extends Component {
  public position: Vector;
  public velocity: Vector;
  public acceleration: Vector;
  public rotation: number = 0;
  public heading: number = 0;
  public rotationSpeed: number = 0;
  public friction: number = 1;
  public maxSpeed: number = 10;

  constructor(x: number, y: number) {
    super("transform");
    this.position = p.createVector(x, y);
    this.velocity = p.createVector(0, 0);
    this.acceleration = p.createVector(0, 0);
  }

  public update(): void {
    // Update heading based on rotation
    this.heading += this.rotation;

    // Apply physics
    this.velocity.add(this.acceleration);
    this.velocity.mult(this.friction);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    // Reset acceleration
    this.acceleration.mult(0);
  }

  public addForce(force: Vector): void {
    this.acceleration.add(force);
  }

  public applyImpulse(impulse: Vector): void {
    this.velocity.add(impulse);
  }
}

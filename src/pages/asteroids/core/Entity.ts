import P5, { Vector } from "p5";
import { Component } from "./Component";
import { Transform } from "./components/Transform";
import { p } from "../sketch";

export abstract class Entity {
  private id: string;
  private components: Map<string, Component>;
  private active: boolean = true;
  protected transform: Transform;

  constructor(x: number, y: number) {
    this.id = `entity_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.components = new Map<string, Component>();
    this.transform = new Transform(x, y);
    this.addComponent(this.transform);
  }

  public getId(): string {
    return this.id;
  }

  public isActive(): boolean {
    return this.active;
  }

  public setActive(active: boolean): void {
    this.active = active;
  }

  public getPosition(): Vector {
    return this.transform.position;
  }

  public setPosition(x: number, y: number): void {
    this.transform.position.set(x, y);
  }

  public getVelocity(): Vector {
    return this.transform.velocity;
  }

  public setVelocity(x: number, y: number): void {
    this.transform.velocity.set(x, y);
  }

  public addForce(force: Vector): void {
    this.transform.addForce(force);
  }

  public addComponent(component: Component): void {
    component.setOwner(this);
    this.components.set(component.getName(), component);
  }

  public getComponent<T extends Component>(name: string): T | undefined {
    return this.components.get(name) as T;
  }

  public removeComponent(name: string): void {
    if (this.components.has(name)) {
      this.components.delete(name);
    }
  }

  public abstract update(): void;
  public abstract draw(): void;
  public abstract handleEdges(): void;
}

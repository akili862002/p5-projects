import { Entity } from "./Entity";

export abstract class Component {
  private owner: Entity | null = null;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public getOwner(): Entity | null {
    return this.owner;
  }

  public setOwner(owner: Entity): void {
    this.owner = owner;
  }

  public abstract update(): void;
}

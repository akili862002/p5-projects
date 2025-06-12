import { Entity } from "../core/Entity";
import { EntityManager } from "../core/EntityManager";
import { EventSystem, GameEvent } from "../core/EventSystem";

export abstract class EntityFactory {
  protected entityManager: EntityManager;
  protected eventSystem: EventSystem;

  constructor() {
    this.entityManager = EntityManager.getInstance();
    this.eventSystem = EventSystem.getInstance();
  }

  protected registerEntity(entity: Entity, type: string): void {
    this.entityManager.addEntity(entity, type);
  }
}

export class ShipFactory extends EntityFactory {
  public createShip(x: number, y: number): Entity {
    // Will be implemented in specific entity classes
    throw new Error("Not implemented");
  }
}

export class AsteroidFactory extends EntityFactory {
  public createAsteroid(x?: number, y?: number, size?: number): Entity {
    // Will be implemented in specific entity classes
    throw new Error("Not implemented");
  }

  public createRandomAsteroid(): Entity {
    // Will be implemented in specific entity classes
    throw new Error("Not implemented");
  }
}

export class BulletFactory extends EntityFactory {
  public createBullet(
    x: number,
    y: number,
    angle: number,
    speed: number
  ): Entity {
    // Will be implemented in specific entity classes
    throw new Error("Not implemented");
  }
}

export class EffectFactory extends EntityFactory {
  public createExplosion(x: number, y: number, size: number): Entity {
    // Will be implemented in specific entity classes
    throw new Error("Not implemented");
  }
}

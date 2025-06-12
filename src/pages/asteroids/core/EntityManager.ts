import { Entity } from "./Entity";
import { Collider } from "./components/Collider";
import { EventSystem, GameEvent } from "./EventSystem";

export class EntityManager {
  private static instance: EntityManager;
  private entities: Map<string, Entity>;
  private entitiesByType: Map<string, Entity[]>;
  private pendingAdditions: Entity[] = [];
  private pendingRemovals: string[] = [];
  private eventSystem: EventSystem;

  private constructor() {
    this.entities = new Map<string, Entity>();
    this.entitiesByType = new Map<string, Entity[]>();
    this.eventSystem = EventSystem.getInstance();
  }

  public static getInstance(): EntityManager {
    if (!EntityManager.instance) {
      EntityManager.instance = new EntityManager();
    }
    return EntityManager.instance;
  }

  public addEntity(entity: Entity, type: string): void {
    this.pendingAdditions.push(entity);

    // Register entity type
    if (!this.entitiesByType.has(type)) {
      this.entitiesByType.set(type, []);
    }
    this.entitiesByType.get(type)!.push(entity);
  }

  public removeEntity(entityId: string): void {
    this.pendingRemovals.push(entityId);
  }

  public getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }

  public getEntitiesByType(type: string): Entity[] {
    return this.entitiesByType.get(type) || [];
  }

  public getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  public clear(): void {
    this.entities.clear();
    this.entitiesByType.clear();
    this.pendingAdditions = [];
    this.pendingRemovals = [];
  }

  public update(): void {
    // Process pending additions
    for (const entity of this.pendingAdditions) {
      this.entities.set(entity.getId(), entity);
    }
    this.pendingAdditions = [];

    // Process pending removals
    for (const entityId of this.pendingRemovals) {
      const entity = this.entities.get(entityId);
      if (entity) {
        this.entities.delete(entityId);

        // Remove from type collections
        for (const [type, entities] of this.entitiesByType.entries()) {
          const index = entities.indexOf(entity);
          if (index !== -1) {
            entities.splice(index, 1);
          }
        }

        // Dispatch event
        this.eventSystem.dispatchEvent(GameEvent.ENTITY_DESTROYED, { entity });
      }
    }
    this.pendingRemovals = [];

    // Update active entities
    for (const entity of this.entities.values()) {
      if (entity.isActive()) {
        entity.update();
        entity.handleEdges();
      }
    }
  }

  public draw(): void {
    for (const entity of this.entities.values()) {
      if (entity.isActive()) {
        entity.draw();
      }
    }
  }

  public checkCollisions(): void {
    // For now, we'll implement a simple O(n²) collision check
    // This can be optimized later with spatial partitioning
    const entities = Array.from(this.entities.values());

    for (let i = 0; i < entities.length; i++) {
      const entityA = entities[i];
      const colliderA = entityA.getComponent<Collider>("collider");

      if (!entityA.isActive() || !colliderA) continue;

      for (let j = i + 1; j < entities.length; j++) {
        const entityB = entities[j];
        const colliderB = entityB.getComponent<Collider>("collider");

        if (!entityB.isActive() || !colliderB) continue;

        if (colliderA.intersects(colliderB)) {
          // Dispatch collision events for both entities
          this.eventSystem.dispatchEvent("collision", {
            entityA,
            entityB,
            colliderA,
            colliderB,
          });
        }
      }
    }
  }
}

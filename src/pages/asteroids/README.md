# Asteroids Game - Refactored Architecture

This is a refactored version of the Asteroids game using proper OOP principles and design patterns to make it more scalable, maintainable, and extensible.

## Core Architecture

### Entity Component System (ECS)

The game uses an Entity Component System architecture:

- **Entities**: Base objects in the game world (Ship, Asteroid, Bullet, etc.)
- **Components**: Reusable modules that add functionality to entities (Transform, Collider, Renderer, etc.)
- **Systems**: Logic that operates on entities with specific components

This approach allows for better code organization, reuse, and separation of concerns.

### Design Patterns Used

1. **Singleton Pattern**

   - Used for manager classes that need global access (GameEngine, EntityManager, EventSystem, etc.)
   - Ensures only one instance exists throughout the application

2. **Factory Pattern**

   - EntityFactory and its subclasses handle the creation of game entities
   - Centralizes entity creation logic and makes it more maintainable

3. **Observer Pattern**

   - EventSystem implements a publish-subscribe pattern
   - Components and systems can subscribe to events without tight coupling

4. **Component Pattern**

   - Entities are composed of interchangeable components
   - Promotes composition over inheritance

5. **Command Pattern**
   - Used in the InputManager to handle keyboard and mouse inputs
   - Allows for easy remapping of controls

## Core Systems

### Entity

The base Entity class that all game objects inherit from. It provides:

- Core functionality like position, velocity, and lifecycle management
- Component attachment and retrieval
- Abstract methods for updating, drawing, and handling edges

### Component

Components add specific behaviors to entities:

- **Transform**: Handles position, velocity, rotation, and physics
- **Collider**: Provides collision detection functionality
- **Renderer**: Manages drawing entities to the screen

### Managers

- **GameEngine**: Orchestrates the entire game loop and systems
- **EntityManager**: Manages all entities in the game
- **EventSystem**: Handles communication between decoupled systems
- **InputManager**: Processes and distributes user input

## Benefits of the New Architecture

1. **Scalability**: Easy to add new entity types, components, and systems
2. **Maintainability**: Well-organized code with clear separation of concerns
3. **Reusability**: Components can be reused across different entity types
4. **Testability**: Systems and components can be tested in isolation
5. **Extensibility**: New features can be added with minimal changes to existing code

## Transitioning from the Old System

The refactoring is being done incrementally:

1. Core infrastructure is built first (Entity, Component, Manager classes)
2. New entity types are created using the new system
3. Game logic is gradually moved from the old system to the new one
4. Finally, the old system will be completely replaced

## Future Improvements

- Add a proper physics system with more advanced collision resolution
- Implement a scene management system for menus, gameplay, etc.
- Create a more comprehensive buff/power-up system
- Add a particle system for visual effects
- Implement a proper asset management system

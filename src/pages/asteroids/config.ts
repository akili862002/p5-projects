// Game
export const LIVES = 3;
// export const DEBUG = true;
export const DEBUG = false;
export const BACKGROUND_COLOR = "#020307";
export const SHIP_SPAWN_DELAY_MS = 500;

// Ship
export const SHIP_MAX_SPEED = 15;
// export const SHIP_FRICTION = 1;
export const SHIP_FRICTION = 0.99;
export const SHIP_KNOCKBACK_FORCE = 0.5;
export const SHIP_INVINCIBLE_TIME = 120; // Invincible for 2 seconds (60 frames per second)
export const SHIP_MAX_ROTATION = 0.1;
export const SHIP_BOOST_FORCE = 0.18;
export const SHIP_ROTATION_SPEED = 0.02;

// Bullet
export const BULLET_COLOR = "#74EFF8";
export const BULLET_LIFESPAN = 70; // Frames until bullet disappears
export const BULLET_SPEED = 10;
export const BULLET_RADIUS = 3;

// Asteroid
export const ASTEROID_COLOR = "#FDC271";
export const ASTEROID_MAX_SPEED = 8;
export const ASTEROID_SPAWN_INTERVAL = 300; // 5 seconds
export const ASTEROID_MAX_GENERATE = 12;
export const ASTEROID_SPLIT_COUNT = 2;
export const ASTEROID_INITIAL_COUNT = 8;

// Point indicator
export const POINT_INDICATOR_COLOR = "#74EFF8";

// Rocket
export const ROCKET_COLOR = "#74EFF8";
export const ROCKET_MAX_SPEED = 7;
export const ROCKET_SPAWN_INTERVAL = 12 * 60; // seconds
export const ROCKET_MAX_GENERATE = 5;
export const ROCKET_LIFESPAN = 850;
export const ROCKET_STEER_FORCE = 0.08;

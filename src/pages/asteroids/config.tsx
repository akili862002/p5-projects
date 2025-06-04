// Game
export const LIVES = 3;
// export const DEBUG = true;
export const DEBUG = false;
export const BACKGROUND_COLOR = "#1e1e1e";

// Ship
export const SHIP_MAX_SPEED = 15;
// export const SHIP_FRICTION = 1;
export const SHIP_FRICTION = 0.99;
export const SHIP_KNOCKBACK_FORCE = 0.5;
export const SHIP_INVINCIBLE_TIME = 120; // Invincible for 2 seconds (60 frames per second)
export const SHIP_MAX_ROTATION = 0.1;
export const SHIP_BOOST_FORCE = 0.15;

// Bullet
export const BULLET_COLOR = "#74EFF8";
export const BULLET_LIFESPAN = 70; // Frames until bullet disappears
export const BULLET_SPEED = 12;
export const BULLET_RADIUS = 3;

// Asteroid
export const ASTEROID_COLOR = "#a8a8a8";
export const ASTEROID_MAX_SPEED = 8;
export const ASTEROID_GENERATE_INTERVAL = 300; // 5 seconds
export const ASTEROID_MAX_GENERATE = 12;

// Point indicator
export const POINT_INDICATOR_COLOR = "#74EFF8";

// Rocket
export const ROCKET_COLOR = "#74EFF8";
export const ROCKET_MAX_SPEED = 10;
export const ROCKET_GENERATE_INTERVAL = 600; // 10 seconds
export const ROCKET_MAX_GENERATE = 5;
export const ROCKET_LIFESPAN = 700;

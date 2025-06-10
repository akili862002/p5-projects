import P5 from "p5";
import { Game } from "./game";
import { BACKGROUND_COLOR, DEBUG } from "./config";

export let p: P5;
export let game: Game;

// Images
export let shipImg: P5.Image;
export let bulletImg: P5.Image;
export let firerImg: P5.Image;
export let heartImage: P5.Image;
export let rocketImg: P5.Image;

// Colors
export let backgroundColor: P5.Color;

export let isDebug = DEBUG;

export function sketch(p5: P5) {
  p = p5;
  let stars: { pos: P5.Vector; size: number }[] = [];

  p.preload = () => {
    shipImg = p.loadImage("/game/ship.png");
    firerImg = p.loadImage("/game/firer.png");
    heartImage = p.loadImage("/game/heart.png");
    rocketImg = p.loadImage("/game/rocket.png");
  };

  p.setup = () => {
    p.textFont("Orbitron");
    const canvas = p.createCanvas(innerWidth, innerHeight);
    backgroundColor = p.color(BACKGROUND_COLOR);

    // Initialize game
    game = new Game(p);
    game.setup();

    // Create stars for background
    createBackgroundStars();

    p.frameRate(60);

    // Add tab visibility event listeners
    window.addEventListener("blur", handleTabInactive);
    window.addEventListener("focus", handleTabActive);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Add canvas click event to resume game
    canvas.elt.addEventListener("click", handleCanvasClick);
  };

  p.draw = () => {
    drawBackground(stars);

    game.update();
    game.draw();

    game.keyboards();
  };

  const createBackgroundStars = () => {
    const starCount = p.map(p.width, 600, 1400, 40, 120);

    for (let i = 0; i < starCount; i++) {
      const star = {
        pos: p.createVector(p.random(0, p.width), p.random(0, p.height)),
        size: p.random(0.1, 3),
      };
      stars.push(star);
    }
  };

  const drawBackground = (stars: { pos: P5.Vector; size: number }[]) => {
    p.background(backgroundColor);

    // Draw stars
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const color = p.map(star.size, 0.1, 3, 140, 180);
      p.fill(color);
      p.circle(star.pos.x, star.pos.y, star.size);
    }
  };

  // Tab visibility handlers
  const handleTabInactive = () => {
    if (!game.isGameOver) {
      game.paused = true;
    }
  };

  const handleTabActive = () => {
    // Don't auto-resume - require a click instead
  };

  const handleVisibilityChange = () => {
    if (document.hidden && !game.isGameOver) {
      game.paused = true;
    }
  };

  const handleCanvasClick = () => {
    if (game.paused && !game.isGameOver) {
      game.paused = false;
    }
  };

  p.keyPressed = (e: any) => {
    game.onKeyPressed(e);
  };
}

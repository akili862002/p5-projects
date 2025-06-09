import { BULLET_COLOR } from "./config";
import { ScoreManager } from "./score";
import { heartImage, lives, p, score, ship } from "./sketch";
import P5 from "p5";

// Add animation variables for score display
let scoreSize = 24;
let scoreColor: P5.Color;
let normalScoreColor: P5.Color;
let highlightScoreColor: P5.Color;
let lastScore = 0;
let targetScoreSize = 20;

export const displayHUD = () => {
  // Initialize colors if needed
  if (!normalScoreColor) {
    normalScoreColor = p.color(255);
    highlightScoreColor = p.color(255, 255, 0); // Yellow highlight
    scoreColor = normalScoreColor;
  }

  updateScoreAnimation();
  displayScore();
  displayLives();
  displaySpeed();
  drawFPS();
};

const updateScoreAnimation = () => {
  if (score > lastScore) {
    targetScoreSize = 60;
    scoreColor = highlightScoreColor;
    lastScore = score;
  }

  scoreSize = p.lerp(scoreSize, targetScoreSize, 0.2);

  if (Math.abs(scoreSize - targetScoreSize) < 0.5 && targetScoreSize > 20) {
    targetScoreSize = 20;
    scoreColor = normalScoreColor;
  }
};

const displayScore = () => {
  p.fill(111, 215, 237);
  const fontSize = 44;
  p.textSize(fontSize);
  p.textAlign(p.LEFT);
  p.text(`${score}`, 20, 10 + fontSize);
};

const displayLives = () => {
  const heartSize = 40;
  const heartY = 10;
  const gap = 3; // Increased gap between hearts
  // Display lives dynamically based on current lives count
  for (let i = 0; i < 3; i++) {
    const heartX = p.width - (i + 1) * (heartSize + gap) - 10;
    // If the heart represents a lost life, set opacity to 40%
    if (i >= lives) {
      p.tint(255, 40);
    } else {
      p.tint(255, 255);
    }
    p.image(heartImage, heartX, heartY, heartSize, heartSize);
  }
  p.noTint(); // Reset tint for other elements
};

const displaySpeed = () => {
  // Speed progress bar
  const barWidth = 300;
  const barHeight = 10;
  const barX = p.width - barWidth - 10;
  const barY = p.height - barHeight - 10;

  // Draw the empty bar background
  p.fill(50);
  p.noStroke();
  p.rect(barX, barY, barWidth, barHeight);

  // Calculate the fill width based on current speed relative to max speed
  const speedRatio = ship
    ? p.constrain(ship.vel.mag() / ship.maxSpeed, 0, 1)
    : 0;
  const fillWidth = barWidth * speedRatio;

  // Draw the filled portion with color gradient from green to red
  if (fillWidth > 0) {
    p.fill(255);
    p.rect(barX, barY, fillWidth, barHeight);
  }

  p.fill(255);
  p.textSize(14);
  p.textAlign(p.CENTER);
  p.text(`${ship?.vel.mag().toFixed(2)}`, p.width - 25, barY - 10);
};
export const displayGameOver = () => {
  const highScore = ScoreManager.getHighScore();
  const topScores = ScoreManager.getTopScores().slice(0, 5);

  // Animate the game over text with a pulsating effect
  const pulseAmount = p.sin(p.frameCount * 0.1) * 20 + 235; // Values between 215-255
  p.fill(255, pulseAmount);
  p.textSize(60);
  p.textAlign(p.CENTER);
  p.text("GAME OVER", p.width / 2, p.height / 2 - 100);

  // Display final score with a highlight if it's a new high score
  p.fill(255);
  p.textSize(32);
  if (score >= highScore) {
    p.fill(255, 215, 0); // Gold color for high score
    p.text(`NEW HIGH SCORE: ${score}!`, p.width / 2, p.height / 2 - 40);
  } else {
    p.text(`Your Score: ${score}`, p.width / 2, p.height / 2 - 40);
    p.text(`High Score: ${highScore}`, p.width / 2, p.height / 2);
  }

  // Display top scores
  p.fill(200, 200, 255);
  p.textSize(20);
  p.text("TOP SCORES", p.width / 2, p.height / 2 + 40);

  p.textSize(16);
  topScores.forEach((entry, index) => {
    p.fill(255);
    if (entry.score === score) p.fill(255, 255, 0); // Highlight current score
    p.text(
      `${index + 1}. ${entry.playerName}: ${entry.score}`,
      p.width / 2,
      p.height / 2 + 70 + index * 25
    );
  });

  // Flashing "Press any key" text
  const flashRate = p.sin(p.frameCount * 0.2) * 127 + 128;
  p.fill(255, flashRate);
  p.textSize(24);
  p.text("Press any key to play again", p.width / 2, p.height / 2 + 300);
};

const drawFPS = () => {
  p.fill(255);
  p.textSize(14);
  p.textAlign(p.LEFT);
  p.text(`FPS: ${p.frameRate().toFixed(0)}`, 20, p.height - 14);
};

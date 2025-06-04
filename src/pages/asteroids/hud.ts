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
  p.fill(255);
  p.textSize(20);
  p.textAlign(p.LEFT);
  p.text(`Score`, 20, p.height - 20);

  p.fill(scoreColor);
  p.textSize(scoreSize);
  p.textAlign(p.LEFT);
  p.text(`${score}`, 80, p.height - 20);
};

const displayLives = () => {
  const heartSize = 40;
  const heartY = 10;
  const gap = -3; // Increased gap between hearts
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
  const speedRatio = p.constrain(ship.vel.mag() / ship.maxSpeed, 0, 1);
  const fillWidth = barWidth * speedRatio;

  // Draw the filled portion with color gradient from green to red
  if (fillWidth > 0) {
    p.fill(255);
    p.rect(barX, barY, fillWidth, barHeight);
  }

  p.fill(255);
  p.textSize(14);
  p.textAlign(p.CENTER);
  p.text(`${ship.vel.mag().toFixed(2)}`, p.width - 25, barY - 10);
};

export const displayGameOver = () => {
  p.fill(255);
  p.textSize(50);
  p.textAlign(p.CENTER);
  p.text("GAME OVER", p.width / 2, p.height / 2 - 50);
  p.textSize(30);
  p.text(`Final Score: ${score}`, p.width / 2, p.height / 2 + 20);
  p.textSize(20);
  p.text("Press ENTER to play again", p.width / 2, p.height / 2 + 70);
};

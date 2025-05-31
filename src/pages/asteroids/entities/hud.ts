import { heartImage, lives, p, score, ship } from "../sketch";
import P5 from "p5";

// Add animation variables for score display
let scoreSize = 20;
let targetScoreSize = 20;
let lastScore = 0;
let scoreColor: P5.Color;
let normalScoreColor: P5.Color;
let highlightScoreColor: P5.Color;

// Add point indicators
interface PointIndicator {
  value: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
}
let pointIndicators: PointIndicator[] = [];

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
  updatePointIndicators();
};

// Add function to update score animation
const updateScoreAnimation = () => {
  // Check if score has changed
  if (score > lastScore) {
    // Calculate points gained
    const pointsGained = score - lastScore;

    // Set target size larger when points are gained
    targetScoreSize = 40;
    // Set highlight color
    scoreColor = highlightScoreColor;

    // Create point indicator
    pointIndicators.push({
      value: pointsGained,
      x: 100, // Position next to score
      y: 30,
      opacity: 255,
      size: 20,
    });

    lastScore = score;
  }

  // Smoothly animate size back to normal
  scoreSize = p.lerp(scoreSize, targetScoreSize, 0.2);

  // Reset target size when animation is nearly complete
  if (Math.abs(scoreSize - targetScoreSize) < 0.5 && targetScoreSize > 20) {
    targetScoreSize = 20;
    // Fade back to normal color
    scoreColor = normalScoreColor;
  }
};

const updatePointIndicators = () => {
  // Update and draw each point indicator
  for (let i = pointIndicators.length - 1; i >= 0; i--) {
    const indicator = pointIndicators[i];

    // Move upward
    indicator.y -= 1;
    // Fade out
    indicator.opacity -= 5;

    // Draw if still visible
    if (indicator.opacity > 0) {
      p.fill(255, 255, 0, indicator.opacity);
      p.textSize(indicator.size);
      p.textAlign(p.LEFT);
      p.text(`+${indicator.value}`, indicator.x, indicator.y);
    } else {
      // Remove if fully faded
      pointIndicators.splice(i, 1);
    }
  }
};

const displayScore = () => {
  p.fill(scoreColor);
  p.textSize(scoreSize);
  p.textAlign(p.LEFT);
  p.text(`Score: ${score}`, 20, 30);
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

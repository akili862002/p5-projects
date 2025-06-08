interface ScoreEntry {
  score: number;
  playerName: string;
  date: string;
}

const STORAGE_KEYS = {
  HIGH_SCORE: "highScore",
  TOP_SCORES: "topScores",
};

const MAX_TOP_SCORES = 10;

export class ScoreManager {
  static getHighScore(): number {
    const highScore = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return highScore ? parseInt(highScore, 10) : 0;
  }

  static getTopScores(): ScoreEntry[] {
    const scoresJson = localStorage.getItem(STORAGE_KEYS.TOP_SCORES);
    if (!scoresJson) return [];

    try {
      return JSON.parse(scoresJson);
    } catch (e) {
      console.error("Error parsing top scores:", e);
      return [];
    }
  }

  static saveScore(score: number, playerName = "Player"): ScoreEntry[] {
    // Update high score if needed
    this.updateHighScoreIfNeeded(score);

    // Get and update top scores
    const topScores = this.getTopScores();
    const newScore: ScoreEntry = {
      score,
      playerName,
      date: new Date().toISOString(),
    };

    const updatedScores = this.addAndSortScore(topScores, newScore);
    localStorage.setItem(
      STORAGE_KEYS.TOP_SCORES,
      JSON.stringify(updatedScores)
    );

    return updatedScores;
  }

  private static updateHighScoreIfNeeded(score: number): void {
    const currentHighScore = this.getHighScore();
    if (score > currentHighScore) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
    }
  }

  private static addAndSortScore(
    scores: ScoreEntry[],
    newScore: ScoreEntry
  ): ScoreEntry[] {
    scores.push(newScore);
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, MAX_TOP_SCORES);
  }
}

import P5 from "p5";

export class SoundManager {
  private static instance: SoundManager;
  private soundPaths = {
    shoot: "/game/sounds/shoot.mp3",
    asteroidExplosion: "/game/sounds/asteroid-explosion.mp3",
  };
  isMuted = true;
  volume = 0.7;
  unmuteIcon: P5.Image;
  muteIcon: P5.Image;

  private constructor() {
    this.loadSounds();
  }

  private loadSounds() {
    for (const [key, path] of Object.entries(this.soundPaths)) {
      const sound = new Audio(path);
      sound.volume = this.volume;
      sound.preload = "auto";
      sound.load();
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public playSound(key: keyof typeof this.soundPaths): void {
    if (this.isMuted) return;

    try {
      const sound = new Audio(this.soundPaths[key]);
      sound.volume = this.volume;
      sound.play().catch((error) => {
        console.error(`Error playing sound ${key}:`, error);
      });
    } catch (error) {
      console.error(`Error playing sound ${key}:`, error);
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
  }

  public playFireSound(): void {
    this.playSound("shoot");
  }

  public playAsteroidExplosionSound(): void {
    this.playSound("asteroidExplosion");
  }
}

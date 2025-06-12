import P5 from "p5";
import { Howl, Howler } from "howler";

export class SoundManager {
  private static instance: SoundManager;
  private sounds: Record<string, Howl> = {};
  private soundPaths = {
    shoot: "/game/sounds/shoot.mp3",
    asteroidExplosion: "/game/sounds/asteroid-explosion.mp3",
  };
  // isMuted = true;
  isMuted = false;
  volume = 0.5;
  unmuteIcon: P5.Image;
  muteIcon: P5.Image;

  private constructor() {
    this.loadSounds();
    Howler.volume(this.volume);
    Howler.mute(this.isMuted);
  }

  private loadSounds() {
    for (const [key, path] of Object.entries(this.soundPaths)) {
      this.sounds[key] = new Howl({
        src: [path],
        preload: true,
        volume: this.volume,
      });
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
      this.sounds[key].play();
    } catch (error) {
      console.error(`Error playing sound ${key}:`, error);
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
  }

  public setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    Howler.volume(this.volume);
  }

  public playFireSound(): void {
    this.playSound("shoot");
  }

  public playAsteroidExplosionSound(): void {
    this.playSound("asteroidExplosion");
  }
}

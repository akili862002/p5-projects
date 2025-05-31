export class SoundManager {
  private static instance: SoundManager;
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private soundPaths = {
    shoot: "/game/sounds/shoot.mp3",
    asteroidExplosion: "/game/sounds/asteroid-explosion.mp3",
  };
  isMuted = false;

  private constructor() {
    // Preload sounds
    Object.entries(this.soundPaths).forEach(([key, path]) => {
      this.preloadSound(key, path);
    });
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public preloadSound(key: string, path: string): void {
    const audio = new Audio(path);
    audio.preload = "auto";

    // Add error handling
    audio.addEventListener("error", (e) => {
      console.error(`Error loading sound ${key} from ${path}:`, e);
    });

    // Load the audio
    audio.load();

    this.sounds[key] = audio;
  }

  public playSound(key: string): void {
    if (this.isMuted || !this.sounds[key]) return;

    try {
      // Clone the audio element to allow overlapping sounds
      const sound = this.sounds[key].cloneNode(true) as HTMLAudioElement;
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

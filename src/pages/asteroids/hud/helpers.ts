import { p } from "../sketch";

// Animation helper class
export class AnimationHelper {
  private currentValue: number;
  private targetValue: number;
  private lerpSpeed: number;

  constructor(initialValue: number, lerpSpeed: number = 0.2) {
    this.currentValue = initialValue;
    this.targetValue = initialValue;
    this.lerpSpeed = lerpSpeed;
  }

  public setTarget(target: number): void {
    this.targetValue = target;
  }

  public update(): void {
    this.currentValue = p.lerp(
      this.currentValue,
      this.targetValue,
      this.lerpSpeed
    );
  }

  public getValue(): number {
    return this.currentValue;
  }

  public isAtTarget(threshold: number = 0.5): boolean {
    return Math.abs(this.currentValue - this.targetValue) < threshold;
  }
}

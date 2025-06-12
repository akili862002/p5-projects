export type BuffType = "permanent" | "one-time";

export interface IBuff {
  get name(): string;
  applied: boolean;
  apply(): void;
  remove(): void;
}

export interface IBuff {
  get name(): string;
  apply(): void;
  remove(): void;
}

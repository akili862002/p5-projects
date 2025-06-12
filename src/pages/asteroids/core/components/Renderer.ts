import P5 from "p5";
import { Component } from "../Component";
import { p } from "../../sketch";

export abstract class Renderer extends Component {
  protected visible: boolean = true;

  constructor() {
    super("renderer");
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public setVisible(visible: boolean): void {
    this.visible = visible;
  }

  public update(): void {
    // Renderers typically don't need updates
  }

  public abstract render(): void;
}

export class ImageRenderer extends Renderer {
  private image: P5.Image;
  private width: number;
  private height: number;
  private alpha: number = 255;

  constructor(image: P5.Image, width: number, height: number) {
    super();
    this.image = image;
    this.width = width;
    this.height = height;
  }

  public setAlpha(alpha: number): void {
    this.alpha = alpha;
  }

  public getAlpha(): number {
    return this.alpha;
  }

  public render(): void {
    if (!this.visible || !this.getOwner()) return;

    const pos = this.getOwner()!.getPosition();
    const transform = this.getOwner()!.getComponent<any>("transform");
    const heading = transform ? transform.heading : 0;

    p.push();
    p.translate(pos.x, pos.y);
    p.rotate(heading + p.PI / 2); // Adjust as needed

    // Apply alpha if needed
    if (this.alpha < 255) {
      p.tint(255, this.alpha);
    }

    p.imageMode(p.CENTER);
    p.image(this.image, 0, 0, this.width, this.height);
    p.pop();
  }
}

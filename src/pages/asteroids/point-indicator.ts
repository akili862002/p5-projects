import { POINT_INDICATOR_COLOR } from "./config";
import { p } from "./sketch";
import { hexToRgbValues } from "./utils";

interface PointIndicatorItem {
  value: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
}

export class PointIndicator {
  items: PointIndicatorItem[] = [];
  color = hexToRgbValues(POINT_INDICATOR_COLOR);

  add(value: number, x: number, y: number) {
    this.items.push({
      value,
      x,
      y,
      opacity: 255,
      size: 16 + value,
    });
  }

  update() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y -= 1;
      item.opacity -= 5;

      if (item.opacity <= 0) {
        this.items.splice(i, 1);
      }
    }
  }

  draw() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      p.fill(this.color.r, this.color.g, this.color.b, item.opacity);
      p.textSize(item.size);
      p.textAlign(p.LEFT);
      p.text(`+${item.value}`, item.x, item.y);
    }
  }

  reset() {
    this.items = [];
  }
}

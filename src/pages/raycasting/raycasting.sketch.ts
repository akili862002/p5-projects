import P5 from "p5";

export const sketch = (p: P5) => {
  let rays: Ray[] = [];
  let walls: Wall[] = [];
  const TOTAL_RAYS = 1000;
  const TOTAL_WALLS = 10;
  let MIN_RAY_WIDTH = 1000;

  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    MIN_RAY_WIDTH = p.dist(0, 0, p.width, p.height);

    for (let i = 0; i < TOTAL_WALLS; i++) {
      walls.push(
        new Wall(
          p.random(0, p.width),
          p.random(0, p.height),
          p.random(0, p.width),
          p.random(0, p.height)
        )
      );
    }

    let angle = 0;
    for (let i = 0; i < TOTAL_RAYS; i++) {
      angle += (4 * p.PI) / TOTAL_RAYS;

      rays.push(new Ray(p.mouseX, p.mouseY, angle));
    }
  };

  p.draw = () => {
    p.background(50);

    for (let wall of walls) {
      wall.show();
    }

    for (let ray of rays) {
      ray.setPosition(p.mouseX, p.mouseY);

      let intersectPoints: P5.Vector[] = [];
      for (let wall of walls) {
        const pt = ray.intersect(wall);
        if (pt) {
          intersectPoints.push(pt);
        }
      }
      if (intersectPoints.length) {
        let closetPoint = intersectPoints[0];
        for (let pt of intersectPoints) {
          let minDist = p.dist(
            ray.pos.x,
            ray.pos.y,
            closetPoint.x,
            closetPoint.y
          );
          let dist = p.dist(ray.pos.x, ray.pos.y, pt.x, pt.y);
          if (dist < minDist) {
            closetPoint = pt;
          }
        }

        ray.show(closetPoint);
      } else {
        ray.show();
      }
    }
  };

  class Ray {
    pos: P5.Vector;
    dir: P5.Vector;

    constructor(x: number, y: number, angle: number) {
      this.pos = p.createVector(x, y);
      this.dir = p.createVector(p.cos(angle), p.sin(angle));
      console.log(this.dir.x, this.dir.y);
    }

    show(distPoint?: P5.Vector) {
      p.push();
      p.stroke(255, 50);
      if (distPoint) {
        p.line(this.pos.x, this.pos.y, distPoint.x, distPoint.y);
      } else {
        p.translate(this.pos.x, this.pos.y);
        p.line(0, 0, this.dir.x * MIN_RAY_WIDTH, this.dir.y * MIN_RAY_WIDTH);
      }
      p.pop();
    }

    setPosition(x: number, y: number) {
      this.pos.x = x;
      this.pos.y = y;
    }

    intersect(wall: Wall) {
      const x1 = wall.p1.x;
      const y1 = wall.p1.y;
      const x2 = wall.p2.x;
      const y2 = wall.p2.y;

      const x3 = this.pos.x;
      const y3 = this.pos.y;
      const x4 = this.pos.x + this.dir.x;
      const y4 = this.pos.y + this.dir.y;

      // Line-line intersection formula
      const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

      // Check if lines are parallel
      if (den === 0) {
        return null;
      }

      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

      // Check if intersection is within the line segments
      if (t > 0 && t < 1 && u > 0) {
        const pt = p.createVector();
        pt.x = x1 + t * (x2 - x1);
        pt.y = y1 + t * (y2 - y1);
        return pt;
      } else {
        return null;
      }
    }
  }

  class Wall {
    p1: P5.Vector;
    p2: P5.Vector;
    constructor(x1: number, y1: number, x2: number, y2: number) {
      this.p1 = p.createVector(x1, y1);
      this.p2 = p.createVector(x2, y2);
    }

    show() {
      p.stroke(255);
      p.line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    }
  }
};

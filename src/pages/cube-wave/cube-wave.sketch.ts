import P5JS from "p5";

export function sketch(p5: P5JS) {
  let angle = 0;
  let num = 20;
  let maxH = 300;
  let w = 20;
  let scaleVal = 0.7;

  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight, p5.WEBGL);
    p5.colorMode(p5.HSB, 255);

    p5.scale(scaleVal);
  };

  p5.draw = () => {
    p5.background(255);
    // p5.ortho();
    p5.orbitControl();
    p5.rotateX(-p5.PI / 4);
    p5.rotateY(p5.PI / 4);

    p5.noStroke();

    for (let z = 0; z < num; z++) {
      for (let x = 0; x < num; x++) {
        p5.push();

        let d = p5.dist(x, z, num / 2, num / 2);
        let offset = p5.map(d, 0, num / 2, 0, p5.PI);

        let h = p5.map(p5.sin(angle + offset), -1, 1, 100, maxH);

        // Color based on height and position

        let gap = -2;

        let xPos = (x - num / 2) * w + x * gap;
        let zPos = (z - num / 2) * w + z * gap;

        p5.translate(xPos, 0, zPos);
        p5.normalMaterial();
        p5.box(w - 2, h, w - 2);

        p5.pop();
      }
    }

    angle += 0.05;
  };
}

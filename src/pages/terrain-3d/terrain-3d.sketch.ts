import P5JS from "p5";

export const sketch = (p: P5JS) => {
  const plateW = 2000;
  const plateH = 2000;
  const scale = 20;
  const cols = plateW / scale;
  const rows = plateH / scale;
  //   const matrix;

  console.log({ rows, cols });

  p.setup = () => {
    // p.createCanvas(window.innerWidth, window.innerHeight);
    p.createCanvas(800, 600, p.WEBGL);
  };

  p.draw = () => {
    p.background(0);
    p.stroke(255);
    p.noFill();

    // p.translate(p.width / 2, p.height / 2);
    p.translate(-plateW / 2, -plateH / 2);
    p.translate(0, 0, -100);
    p.rotateX(p.PI / 3);

    for (let y = 0; y < rows; y++) {
      p.beginShape(p.TRIANGLE_STRIP);
      for (let x = 0; x < cols; x++) {
        p.vertex(x * scale, y * scale, p.map(p.noise(x, y), 0, 1, -10, 10));
        p.vertex(
          x * scale,
          (y + 1) * scale,
          p.map(p.noise(x, y), 0, 1, -10, 10)
        );
      }
      p.endShape();
    }
  };
};

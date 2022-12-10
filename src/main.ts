import { Complex } from "../modules/complex";
import { Polynomial } from "../modules/polynomial";
import { setPixelColor, computePointColor } from "./viz";


const WIDTH = 300;
const HEIGHT = 300;

const canvas: HTMLCanvasElement = document.createElement("canvas");
document.body.append(canvas);
canvas.id = "plane";
canvas.width = WIDTH;
canvas.height = HEIGHT;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;  // ! at end asserts result not null

// ctx.fillStyle = 'green';
// ctx.fillRect(10, 10, 100, 100);

const roots = [1, 3, -5];
const p = new Polynomial(roots, false);
const dp = p.differentiate();

let imgData: ImageData = ctx.createImageData(WIDTH, HEIGHT);
for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
        const c = computePointColor(p, roots, new Complex(x, y), 0, dp);
        setPixelColor(x, y, imgData, c);
    }
}
// imgData.data[0] = 255;
ctx.putImageData(imgData, 0, 0);

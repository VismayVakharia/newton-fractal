import { Complex } from "../modules/complex";
import { Polynomial } from "../modules/polynomial";
import { Color, setPixelColor, computePointColor, JarringColors } from "./viz";
import {closest_root, iterate} from "./utils";


const WIDTH = 600;
const HEIGHT = 600;
const MAX_ITER = 10;

const canvas: HTMLCanvasElement = document.createElement("canvas");
document.body.append(canvas);
canvas.setAttribute("tabindex", "0");
canvas.id = "plane";
canvas.width = WIDTH;
canvas.height = HEIGHT;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;  // ! at end asserts result not null

// ctx.fillStyle = 'green';
// ctx.fillRect(10, 10, 100, 100);

const roots = [new Complex(100, 0), new Complex(100, -60), new Complex(-50, 250), new Complex(0, 0)];
const p = new Polynomial(roots, false);
const dp = p.differentiate();

let imgData: ImageData = ctx.createImageData(WIDTH, HEIGHT);
//function step(): void {
//    console.log(new Date());
//    for (let x = 0; x < WIDTH; x++) {
//        for (let y = 0; y < HEIGHT; y++) {
//            const new_x = (x - WIDTH / 2);
//            const new_y = (y - HEIGHT / 2);
//            const c = computePointColor(p, roots, new Complex(new_x, new_y), iter, dp);
//            setPixelColor(x, y, imgData, c);
//        }
//    }
//    ctx.putImageData(imgData, 0, 0);
//    console.log(new Date());
//    iter++;
//}

// setPixelColor(10 + WIDTH/2, HEIGHT/2, imgData, Color.Black)
// setPixelColor(30 + WIDTH/2, HEIGHT/2, imgData, Color.Yellow)
// setPixelColor(-50 + WIDTH/2, 50 + HEIGHT/2, imgData, Color.Cyan)
// // imgData.data[0] = 255;
// ctx.putImageData(imgData, 0, 0);

//canvas.addEventListener("mousedown", function (ev: MouseEvent): void {
//    // console.log(ev.clientX-canvas.offsetLeft, ev.clientY-canvas.offsetTop);
//    const new_x = ev.clientX-canvas.offsetLeft;
//    const new_y = ev.clientY-canvas.offsetTop;
//    const c = computePointColor(p, roots, new Complex(new_x - WIDTH/2, new_y - HEIGHT/2), 0, dp);
////     console.log(closest_root(new Complex(new_x - WIDTH/2, new_y - HEIGHT/2), roots));
////     console.log(c);
//    step();
//});

//
// canvas.addEventListener("mousedown", blocking);
// canvas.addEventListener("mouseup", () => console.log("mouse up"));

let EventQueue: (MouseEvent | KeyboardEvent)[] = [];
let left = -WIDTH/2, right = WIDTH/2, top = -HEIGHT/2, bottom = HEIGHT/2;

let pixel_iterations: number[] = [];
let pixel_zvalues: Complex[] = [];

// no reuse version

function init(): void {
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
        pixel_iterations.push(-1);
        pixel_zvalues.push(new Complex());
    }
}

function reset(): void {
    for (let i = 0; i < pixel_iterations.length; i++) {
        pixel_iterations[i] = 0;
        // check for off-by-one errors
        const real = left + i % WIDTH;
        const imag = top + Math.floor(i / WIDTH);
        pixel_zvalues[i] = new Complex(real, imag);
    }
    debug("bounds", "left: " + left + " | top: " + top + " | right: " + right + " | bottom: " + bottom);
}

function debug(span_id: string, msg: any): void {
    (document.getElementById(span_id) as HTMLSpanElement).innerText = msg;
}

// step each pixel by one iteration
function step(): void {
    let start: any = new Date();
    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            const index = y*WIDTH + x;
            if (pixel_iterations[index] >= MAX_ITER) continue;

            const z = pixel_zvalues[index];
            const new_z: Complex = iterate(p, z, 1, dp);

            pixel_zvalues[index] = new_z;
            pixel_iterations[index]++;

            const color_idx = closest_root(new_z, roots);
            setPixelColor(x, y, imgData, JarringColors[color_idx]);
        }
    }
    ctx.putImageData(imgData, 0, 0);
    let stop: any = new Date();
    debug("step-duration", stop - start);
}


canvas.addEventListener("keydown", (e) => {EventQueue.push(e);});


// check for any pending events in my_event_queue and handle them (book-keeping) (!blocking!)
// if event queue empty then dispatch worker one time (!blocking!)
function manager(): void {
    while (EventQueue.length > 0) {
        let event = EventQueue.shift();
        if (typeof(event) === "undefined") continue;
        // console.log(event?.key);
        if (event instanceof KeyboardEvent) {
            // keyboard pan event
            if (event.key.indexOf("Arrow") >= 0) {
                switch (event?.key) {
                    case "ArrowLeft":
                        left -= 20; right -= 20; break;
                    case "ArrowRight":
                        left += 20; right += 20; break;
                    case "ArrowUp":
                        top -= 20; bottom -= 20; break;
                    case "ArrowDown":
                        top += 20; bottom += 20; break;
                }
                reset();
            }
        }
    }
    step();
    window.setTimeout(manager, 20);  // todo: find right timing
}

init();
manager();



///////////////////////////////////////////////////////////

// reference: https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#what-is-the-event-loop
//
// var my_event_queue = [];
//
// let left = 0, top = 0, bottom = 0, right = 0;
// const width, height;
//
//
// function worker() { // !blocking!
//     // need to break into multiple possibilities and subroutines (atomic copying)
//     // does one quick iterative deepenening step (say 0.1sec)
// }
//
// // initial call
// window.setTimeout(manager, 100);
//
// // waits 100ms (non-blocking, event_queue can be added to in this time)
//
// manager()
//
// // waits another 100
//
//



//////////////////////////////////////////////////////////////////

/* Worker rough work

Option 1: New worker per step (implied per canvas config)
- (s)-(t)-(s)-(t) even if user doesn't do anything
- params: previous z values, p, dp, (implied canvas config, roots)
- return: new z values, colors (and then gets terminated by main.js)
- example run:
t0: post x0, y0, prez0, roots -> z1
t1: post x0, y0,    z1, roots -> z2
t2: post x1, y1, prez1, roots -> z1'  (don't need to wait for previous worker message return)
- get return value from worker and post message of next step to worker (otherwise need to check if any new canvas changes pending)

Option 2: New worker per canvas config (the chosen one)
- (s)-(t)-(s)-(t) if user scrolls or pans
- (s)---------(t) if user doesn't do anything
- params: canvas config, roots, [p, dp]
- return: colors
- returns as many times as MAX_ITER
- terminate from main.js upon each canvas config

Option 3: Single worker always alive (not possible)
- (s)-----------
- params: canvas config (repeatedly to the same worker whenever canvas changes)
- return: colors
- returns as many times as MAX_ITER unless new canvas config message received in between
- note: worker might need to maintain its own event manager and keep checking for
        new messages with new canvas configs and quit previous canvas computations

*/

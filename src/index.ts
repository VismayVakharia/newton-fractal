import { Complex } from "../modules/complex";
import { Polynomial } from "../modules/polynomial";
import { Color, setPixelColor, computePointColor, JarringColors } from "./viz";
import {closest_root, iterate} from "./utils";


const WIDTH = 600;
const HEIGHT = 600;
const MAX_ITER = 15;

const canvas: HTMLCanvasElement = document.createElement("canvas");
document.body.append(canvas);
canvas.setAttribute("tabindex", "0");
canvas.id = "plane";
canvas.width = WIDTH;
canvas.height = HEIGHT;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;  // ! at end asserts result not null
let currentWorker: Worker | null = null;

const roots = [new Complex(100, 0), new Complex(100, -60), new Complex(-50, 250), new Complex(0, 0)];
// const p = new Polynomial(roots, false);
// const dp = p.differentiate();

let imgData: ImageData = ctx.createImageData(WIDTH, HEIGHT);

canvas.addEventListener("mousedown", () => console.log("mouse down"));

let left = -WIDTH/2, top = -HEIGHT/2, right = WIDTH/2, bottom = HEIGHT/2;


// no reuse version

function debug(span_id: string, msg: any): void {
    (document.getElementById(span_id) as HTMLSpanElement).innerText = msg;
}

canvas.addEventListener("keydown", keydownHandler);


// check for any pending events in my_event_queue and handle them (book-keeping) (!blocking!)
// if event queue empty then dispatch worker one time (!blocking!)
function keydownHandler(event: KeyboardEvent): void {
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
        debug("bounds", "left: " + left + " | top: " + top + " | right: " + right + " | bottom: " + bottom);
        setupWorker();
    }
}


function setupWorker() {
    if (window.Worker) {
        currentWorker?.terminate();
        let worker = new Worker("worker.js");
        currentWorker = worker;

        console.log(currentWorker);
        worker.onmessage = function(ev) {
            for (let x = 0; x < WIDTH; x++) {
                for (let y = 0; y < HEIGHT; y++) {
                    const index = y*WIDTH + x;
                    setPixelColor(x, y, imgData, JarringColors[ev.data[index]]);
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }

        let data: any;
        data = {constants: {}, bounds: {}, poly_params: {}};
        data.constants = {width: WIDTH, height: HEIGHT, max_iter: MAX_ITER};
        data.bounds = {left, top, right, bottom};
        data.roots = roots;

        worker.postMessage(data);
        currentWorker = worker;
    } else {
        debug("general", "your browser does not support web workers")
    }
}



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


//////////////////////////////////////////////////////////////////

/* working setup for workers in ts */

/*

in webpack.config.js
- set `entry` to object, to multiple entries
- add entries for main.js/index.js/bundle.js and worker.js

    entry: {
        bundle: './src/index.ts',
        worker: './src/worker.ts',
    }

- set output per filename as "[name].js", where [name] refers to key name from `entry`


in worker.ts
- add line `let ctx = self as DedicatedWorkerGlobalScope;`


in tsconfig.json
- add `lib` key within compiler options and add "webworker" to in
https://github.com/gibbok/typescript-web-workers/blob/master/tsconfig.json
https://stackoverflow.com/questions/56356655/structuring-a-typescript-project-with-workers

*/

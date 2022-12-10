import { Polynomial } from "../modules/polynomial";
import { Complex } from "../modules/complex";
import { closest_root, iterate } from "./utils";

let ctx = self as DedicatedWorkerGlobalScope;

ctx.onmessage = function(ev: MessageEvent) {
//    console.log("Worker: Message received from main script");
//    console.log(ev.data);

    let { width, height, max_iter } = ev.data.constants;
    let { left, top, right, bottom } = ev.data.bounds;
    let roots = ev.data.roots;
    const p = new Polynomial(roots, false);
    const dp = p.differentiate();

    let start: any = new Date();

    // initialize z values
    let pixel_zvalues: Complex[] = [];
    for (let i = 0; i < width * height; i++) {
        const real = left + i % width;
        const imag = top + Math.floor(i / width);
        pixel_zvalues.push(new Complex(real, imag));
    }

    for (let step = 1; step < max_iter; step++) {
        let color_idx_array = new Uint8Array(width * height);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const index = y*width + x;

                const z = pixel_zvalues[index];
                const new_z: Complex = iterate(p, z, 1, dp);

                pixel_zvalues[index] = new_z;
                color_idx_array[index] = closest_root(new_z, roots);
            }
        }

        // post back results from current step
//        console.log('Worker: Posting message back to main script');
        ctx.postMessage(color_idx_array, [color_idx_array.buffer]);
    }
//    let stop: any = new Date();
//    debug("step-duration", stop - start);
};

function step(): void {
}
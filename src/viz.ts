import {Complex, NumberList} from "../modules/complex";
import {Polynomial} from "../modules/polynomial";
import {iterate, closest_root} from "./utils";

type Vector4 = [number, number, number, number];

export class Color {
    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number = 255) {
    }
    static White = new Color(255, 255, 255, 255);
    static Black = new Color(0, 0, 0, 0);
    static Red = new Color(255, 0, 0, 255);
    static Green = new Color(0, 255, 0, 255);
    static Blue = new Color(0, 0, 255, 255);
    static Yellow = new Color(255, 255, 0, 255);
    static Magenta = new Color(255, 0, 255, 255);
    static Cyan = new Color(0, 255, 255, 255);
}


function getIndexForCoord(x: number, y: number, width: number): number {
    return y * (width * 4) + x * 4;
    //     return [red, red + 1, red + 2, red + 3];
}

function getPixelColor(x: number, y: number, imgData: ImageData): Color {
    const width = imgData.width;
    const index: number = getIndexForCoord(x, y, width);
    // let indices = [0, 0, 0];
    // channels = indices.map((_, idx) => imgData.data[index + idx]) as Vector4;
    return new Color(
        imgData.data[index],
        imgData.data[index+1],
        imgData.data[index+2],
        imgData.data[index+3]
    );
}

export function setPixelColor(x: number, y: number, imgData: ImageData, color: Color): ImageData {
    const width = imgData.width;
    const index: number = getIndexForCoord(x, y, width);
    imgData.data[index] = color.r;
    imgData.data[index+1] = color.g;
    imgData.data[index+2] = color.b;
    imgData.data[index+3] = color.a;
    return imgData;
}

export const JarringColors = [Color.Yellow, Color.Magenta, Color.Cyan, Color.Red, Color.Green, Color.Blue];


export function computePointColor(p: Polynomial, roots: NumberList, z: Complex, num_iter: number, dp? : Polynomial): Color {
    const result = iterate(p, z, num_iter, dp);
    const color_idx = closest_root(result, roots);
    return JarringColors[color_idx];
}

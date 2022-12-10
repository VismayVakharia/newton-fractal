import {Complex} from "../modules/complex";
import {Polynomial} from "../modules/polynomial";
import {iterate, closest_root} from "./utils";

const z1 = new Complex(1, 3);
const z2 = new Complex(5, -2);
console.log("z1", z1);
console.log("z2", z2);
console.log("conjugate(z1)", z1.conjugate());
console.log("mag(z1)", z1.mag());
console.log("z1*z2", z1.mul(z2));
console.log("z1/z2", z1.div(z2));

// x^2 + 2x + 1
let p = new Polynomial([1, 2, 1]);
console.log(p.subsitute(Complex.zero));

const roots = [1, 3, -5]
let p2 = new Polynomial(roots, false);
console.log("p2", "roots:", roots, p2.coeffs);
for (const root of roots) {
    console.log("for root", root, p2.subsitute(new Complex(root)));
}

console.log(new Polynomial([Complex.iota, Complex.iota, Complex.iota], false).differentiate());


let p3 = new Polynomial([1, 0, -1]);
let z = new Complex(-0.2, 0);
console.log(iterate(p3, z, 10));

import { Complex, NumberList } from "../modules/complex";
import { Polynomial } from "../modules/polynomial";

export function iterate(p: Polynomial, z: Complex, num_iter: number, dp? : Polynomial): Complex {
    if (dp == undefined) dp = p.differentiate();
    for (let i = 0; i < num_iter; i++) {
        const step = p.subsitute(z).div(dp.subsitute(z));
        z = z.sub(step);
    }
    return z;
}

export function closest_root(z: Complex, roots: NumberList): number {
    let min_dist = Infinity;
    let closest_idx = 0;  // placeholder closest value
    for (let root_idx = 0; root_idx < roots.length; root_idx++) {
        const root = roots[root_idx];
        const dist = z.dist(root);
        if (dist < min_dist) {
            min_dist = dist;
            closest_idx = root_idx;
        }
    }
    return closest_idx;
}

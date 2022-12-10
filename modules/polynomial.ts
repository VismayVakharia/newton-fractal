import {Complex, NumberList} from "./complex";

// user-defined type guard, we simply need to define a function whose return type is a type predicate
function isNumberList(list: NumberList): list is number[] {
    return (typeof list[0]) === "number";
}

// using generic lists to allow for subsets of any type set/list
function generateSubsets<T>(list: T[], r: number, start: number = 0): T[][] {
    let result: T[][] = [];
    if (r <= 0) return [];  // don't recurse further

    // loop over elements starting at start
    for (let idx=start; idx < list.length; idx++) {
        // if insufficient remaining elements
        // if remaining options (includes current idx) = list.length - (idx - 1) < r
        //      then cannot make subset, so break
        if ((list.length - idx) < r) break;
        // decide first element e at index idx
        const e = list[idx];
        // prepend that element to all possible generateSubsets(list[idx:], r-1);
        const tails = generateSubsets(list, r - 1, idx + 1);

        let subresult: T[][];
        if (tails.length == 0)  // empty tail, thus singleton element
            subresult = [[e]];
        else
            subresult = tails.map(tail => [e].concat(tail));
        result = result.concat(subresult);
    }
    return result;
}

export class Polynomial {
    coeffs: Complex[];
    degree: number;

    // can either be initialized with list of coeffs (highest degree first)
    // or with a list of complex roots
    constructor(params: number[] | Complex[], as_coeffs = true) {
        if (params.length < 1) {
            console.error("Polynomial object cannot be initialized with empty list");
        }
        if (isNumberList(params))  // cast number list to complex
            params = params.map(n => new Complex(n));

        if (as_coeffs) {
            // initialize via coefficients
            this.degree = params.length - 1;
            this.coeffs = params;
        } else {
            this.degree = params.length;
            // initialize via roots (Vieta's formulas)
            // reference: https://en.wikipedia.org/wiki/Vieta%27s_formulas
            this.coeffs = [Complex.one];
            const n = params.length;

            for (let r = 1; r <= n; r++) {
                // obligatory one-liner
                // subsets.map(subset => subset.reduce((x, y) => x.mul(y))).reduce((x, y) => x.add(y));
                let subsets = generateSubsets<Complex>(params, r);
                let sum = Complex.zero;
                for (const subset of subsets) {
                    let prod = Complex.one;
                    for (const element of subset)
                        prod = prod.mul(element);
                    sum = sum.add(prod);
                }
                if (r % 2) sum = sum.mul(-1);  // equivalent to multiply by (-1)^r
                this.coeffs.push(sum)
            }
        }
    }

    subsitute(z: Complex): Complex {
        let value = Complex.zero;
        for (let idx = 0; idx <= this.degree; idx++) {
            const coeff = this.coeffs[idx];
            const exp = this.degree - idx;
            const subvalue = z.pow(exp).mul(coeff);
            value = value.add(subvalue);
        }
        return value;
    }

    differentiate(): Polynomial {
        const new_coeffs = this.coeffs.map((coeff, idx) => coeff.mul(this.degree - idx));
        new_coeffs.pop()
        return new Polynomial(new_coeffs, true);
    }
}

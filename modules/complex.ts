export class Complex {
    constructor(public re = 0, public im = 0) {}

    static zero = new Complex(0, 0);
    static one  = new Complex(1, 0);
    static iota = new Complex(0, 1);

    // scaled(other: number): Complex {
    //     return new Complex(this.re * other, this.im * other);
    // }

    conjugate(): Complex {
        return new Complex(this.re, -this.im);
    }

    mag(): number {
        return Math.sqrt(this.re * this.re + (this.im * this.im));
    }

    copy(): Complex {
        return new Complex(this.re, this.im);
    }

    add(other: Complex | number): Complex {
        if (typeof other === "number")
            other = new Complex(other);  // todo: scope for optimization
        return new Complex(this.re + other.re, this.im + other.im);
    }

    mul(other: Complex | number): Complex {
        if (typeof other === "number")
            other = new Complex(other);  // todo: scope for optimization
        return new Complex(this.re * other.re - this.im * other.im, this.re * other.im + other.re * this.im);
    }


    // multiply by conjugate and divide by modulus squared
    div(other: Complex | number): Complex {
        if (typeof other === "number") {
            return new Complex(this.re / other, this.im / other);
        } else {
            const othermag = other.mag();
            return this.mul(other.conjugate()).div(othermag * othermag);
        }
    }

    sub(other: Complex | number): Complex {
        if (typeof other === "number")
            other = new Complex(other);  // todo: scope for optimization
        return this.add(other.mul(-1));
    }

    // only defined for non-negative exp
    pow(exp: number): Complex {
        let result = Complex.one;
        for (let i = 0; i < exp; i++) {
            result = result.mul(this);  // todo: scope for optimization
        }
        return result;
    }

    dist(other: number | Complex): number {
        if (typeof other === "number")
            other = new Complex(other);  // todo: scope for optimization
        return Math.sqrt(Math.pow(this.re - other.re, 2) + Math.pow(this.im - other.im, 2));
    }


}

export type NumberList = number[] | Complex[];

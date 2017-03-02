/* eslint-disable no-multi-spaces, array-bracket-spacing */
import { toRadians } from './math';

// named indexes into Matrix.mat for a given row/column
const m00 = 0;
const m01 = 1;
const m02 = 2;
const m03 = 3;
const m10 = 4;
const m11 = 5;
const m12 = 6;
const m13 = 7;
const m20 = 8;
const m21 = 9;
const m22 = 10;
const m23 = 11;

export class Matrix {

    constructor(arr) {
        this.mat = arr;
    }

    get(i, j) {
        return this.mat[i * 4 + j];
    }

    /**
     * return [Other] x [this]
     */
    // based on https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L700
    _transformMatrix(other) {
        const a = this.mat; // eslint-disable-line
        const b = other.mat; // eslint-disable-line
        const out = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]; // eslint-disable-line
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]; // eslint-disable-line
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]; // eslint-disable-line
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]; // eslint-disable-line

        // Cache only the current line of the second matrix
        let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3]; // eslint-disable-line
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        return new Matrix(out);
    }

    /**
     * apply the matrix to whatever is passed in (Matrix, Vector, or Array)
     */
    transform(vecListOrMatrix) {
        if (Array.isArray(vecListOrMatrix)) {
            return vecListOrMatrix.map(vec => this.transform(vec));
        } else if (vecListOrMatrix instanceof Matrix) {
            return this._transformMatrix(vecListOrMatrix);
        }

        // else this is a vector
        return vecListOrMatrix.transform(this);
    }

    // arr is an array of Vector. Transform each vector in array, in place,
    // by this matrix
    transformVectorArrayInPlace(arr) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].transformSelf(this);
        }
    }

    translate(x, y, z) {
        if (x instanceof Vector) {
            return this.transform(Matrix.translate(x.x, x.y, x.z));
        }
        return this.transform(Matrix.translate(x, y, z));
    }

    rotateX(degrees) {
        return this.transform(Matrix.rotateX(degrees));
    }

    rotateZ(degrees) {
        return this.transform(Matrix.rotateZ(degrees));
    }

    scale(sx, sy, sz) {
        return this.transform(Matrix.scale(sx, sy, sz));
    }


    static rotateZ(degrees, origin = null) {
        const radians = toRadians(degrees);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        let tx = 0;
        let ty = 0;

        if (origin) {
            const { x, y } = origin;
            tx = x - x * cos + y * sin;
            ty = y - x * sin - y * cos;
        }

        return new Matrix([
            cos, -sin, 0, tx,
            sin,  cos, 0, ty,
            0,      0, 1, 0,
            0,      0, 0, 1,
        ]);
    }

    static rotateX(degrees, origin = null) {
        const radians = toRadians(degrees);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        let tx = 0;
        let ty = 0;

        if (origin) {
            const { x, y } = origin;
            tx = x - x * cos + y * sin;
            ty = y - x * sin - y * cos;
        }

        return new Matrix([
            1,   0,    0, tx,
            0, cos, -sin, ty,
            0, sin,  cos, 0,
            0,   0,    0, 1,
        ]);
    }

    static translate(x, y, z) {
        if (x instanceof Vector) {
            return Matrix.translate(x.x, x.y, x.z);
        }

        return new Matrix([
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1,
        ]);
    }

    static scale(sx, sy, sz) {
        if (sx instanceof Vector) {
            return Matrix.scale(sx.x, sx.y, sx.z);
        }

        return new Matrix([
            sx,  0,  0, 0,
            0,  sy,  0, 0,
            0,   0, sz, 0,
            0,   0,  0, 1,
        ]);
    }

    static identity() {
        return new Matrix([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]);
    }
}

export class Vector {

    constructor(x, y, z = 0) {
        if (x instanceof Object) {
            this.x = x.x;
            this.y = x.y;
            this.z = (x.z || 0);
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    add(vec) {
        if (typeof vec === 'number') {
            return new Vector(this.x + vec, this.y + vec, this.z + vec);
        }
        return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z);
    }

    addXYZ(x, y, z) {
        return new Vector(this.x + x, this.y + y, this.z + z);
    }

    addSelf(vec) {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;

        return this;
    }

    setVec(vec) {
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
    }

    subtractSelf(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
    }

    subtract(vec) {
        if (typeof vec === 'number') {
            return new Vector(this.x - vec, this.y - vec, this.z - vec);
        }
        return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z);
    }

    scale(x, optionalY, optionalZ) {
        if (optionalY !== undefined && optionalZ !== undefined) {
            return new Vector(this.x * x, this.y * optionalY, this.z * optionalZ);
        }
        return new Vector(this.x * x, this.y * x, this.z * x);
    }

    multiply(vec) {
        return new Vector(this.x * vec.x, this.y * vec.y, this.z * vec.z);
    }

    dot(vec) {
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }

    cross(vec) {
        const x = this.y * vec.z - this.z * vec.y;
        const y = this.z * vec.x - this.x * vec.z;
        const z = this.x * vec.y - this.y * vec.x;

        return new Vector(x, y, z);
    }

    distance(vec) {
        const x = this.x - vec.x;
        const y = this.y - vec.y;
        const z = this.z - vec.z;

        return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * rotate around the Z-axis
     */
    rotate(degrees, origin) {
        // same as rotateZ but allows for optional origin
        // Note: most calls don't provide origin so for perf consider splitting
        // into rotateWithOrigin(degrees, origin) and rotate(degrees)
        const matrix = Matrix.rotateZ(degrees);
        if (origin) {
            return this.subtract(origin).transformSelf(matrix).addSelf(origin);
        }
        return this.transform(matrix);
    }

    /**
     * rotate around the Z-axis
     */
    rotateZ(degrees) {
        const matrix = Matrix.rotateZ(degrees);
        return this.transform(matrix);
    }

    rotateZSelf(degrees) {
        const matrix = Matrix.rotateZ(degrees);
        return this.transformSelf(matrix);
    }

    /**
     * rotate around the X-axis
     */
    rotateX(degrees) {
        const matrix = Matrix.rotateX(degrees);
        return this.transform(matrix);
    }

    /**
     * rotate around the X-axis, in place
     */
    rotateXSelf(degrees) {
        const matrix = Matrix.rotateX(degrees);
        return this.transformSelf(matrix);
    }

    transform(matrix) {
        const { x, y, z } = this;
        const mat = matrix.mat;

        return new Vector(
            x * mat[m00] + y * mat[m01] + z * mat[m02] + mat[m03],
            x * mat[m10] + y * mat[m11] + z * mat[m12] + mat[m13],
            x * mat[m20] + y * mat[m21] + z * mat[m22] + mat[m23]
        );
    }

    transformSelf(matrix) {
        const { x, y, z } = this;
        const mat = matrix.mat;

        this.x = x * mat[m00] + y * mat[m01] + z * mat[m02] + mat[m03];
        this.y = x * mat[m10] + y * mat[m11] + z * mat[m12] + mat[m13];
        this.z = x * mat[m20] + y * mat[m21] + z * mat[m22] + mat[m23];
        return this;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize(scaleFactor = 1) {
        return this.scale(scaleFactor / this.length());
    }

    toArray() {
        return [this.x, this.y, this.z];
    }

    equals(other) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }

    getCopy() {
        return new Vector(this.x, this.y, this.z);
    }

    getCopy2() {
        return new Vector(this.x, this.y);
    }

    toString() {
        if (this.z === undefined) {
            return `${this.constructor.name}(${this.x}, ${this.y})`;
        }
        return `${this.constructor.name}(${this.x}, ${this.y}, ${this.z})`;
    }

    static fromObject(obj) {
        return new Vector(obj.x, obj.y, (obj.z || 0));
    }

    /**
     * return a vector describing the direction (normal) for a ray;
     */
    static createRay(elevation, azimuth) {
        // elevation 0 is ground level, 90 is straight up
        // azimuth 180 is due south
        const phi = toRadians((90 - azimuth) % 360);
        const theta = toRadians(90 - elevation);

        return new Vector(
            -Math.sin(theta) * Math.cos(phi), // dx
            -Math.sin(theta) * Math.sin(phi), // dy
            -Math.cos(theta),            // dz
        );
    }
}

// create a strong reference to Vector and Matrix objects so that
// they don't get de-optimized permanently
// see http://benediktmeurer.de/2016/10/11/the-case-of-temporary-objects-in-chrome/
// and https://github.com/folsom-labs/helioscope/issues/724
export const VECTOR_REF_TO_PREVENT_DEOPT = new Vector(0, 1, 1);
export const MATRIX_REF_TO_PREVENT_DEOPT = new Matrix();

// a shorter way to format x,y,z of a vector, useful for debugging
export function fmtVec(v) {
    if (!v) {
        return 'undefined';
    }
    const x = v.x.toFixed(3);
    const y = v.y.toFixed(3);
    const z = v.z.toFixed(3);
    return `${x}, ${y}, ${z}`;
}

// like fmtVec but only for x,y
export function fmtVec2(v) {
    if (!v) {
        return 'undefined';
    }
    const x = v.x.toFixed(3);
    const y = v.y.toFixed(3);
    return `${x}, ${y}`;
}

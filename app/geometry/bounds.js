import { Vector } from './vector';

// re-usable object used to avoid allocating new object if possible
let gBounds;

export class Bounds {

    // we handle arbitrary number of arguments that are Vector/Bounds instances
    // or a single argument that is an array of Vector or Bounds (although in
    // practice I've anly seen an array of Vecotr)
    constructor() {
        // wonky gymnastics because we need to call `super` before `this` can be used
        this.minY = Number.POSITIVE_INFINITY;
        this.maxY = Number.NEGATIVE_INFINITY;

        this.minX = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;

        // if the first and only argument is an array, operate on that instead
        // for perf reasons it's not advisable to pass arguments to other functions
        // so we do things in-line here
        let args = arguments; // eslint-disable-line
        if (args.length === 1 && Array.isArray(args[0])) {
            args = args[0];
        }

        for (let i = 0; i < args.length; i++) {
            this.extend(args[i]);
        }
    }

    clone() {
        const copy = new Bounds();
        copy.minY = this.minY;
        copy.maxY = this.maxY;
        copy.minX = this.minX;
        copy.maxX = this.maxX;
        return copy;
    }

    extend(vecOrBounds) {
        if (vecOrBounds instanceof Bounds) {
            // catch bounds first so that raw objects will fall through
            this.extendBounds(vecOrBounds);
        } else {
            this.extendVector(vecOrBounds);
        }
    }

    extendVector(vec) {
        const { x, y } = vec;
        this.minY = Math.min(this.minY, y);
        this.maxY = Math.max(this.maxY, y);

        this.minX = Math.min(this.minX, x);
        this.maxX = Math.max(this.maxX, x);
    }

    reset() {
        this.minY = Number.POSITIVE_INFINITY;
        this.maxY = Number.NEGATIVE_INFINITY;

        this.minX = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;
    }

    // calculate bounds from an array of Vector objects
    // assumptions: arr has at least 1 element
    resetVectorArray(arr) {
        let minX = arr[0].x;
        let minY = arr[0].y;
        let maxX = minX;
        let maxY = minY;
        for (let i = 1; i < arr.length; i++) {
            const { x, y } = arr[i];
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
        }
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    // reset bounds to be between two points
    // allow re-using a Bounds object inside a loop
    resetVector2(vec1, vec2) {
        this.minX = Math.min(vec1.x, vec2.x);
        this.maxX = Math.max(vec1.x, vec2.x);

        this.minY = Math.min(vec1.y, vec2.y);
        this.maxY = Math.max(vec1.y, vec2.y);
    }

    extendBounds(bounds) {
        this.minY = Math.min(this.minY, bounds.minY);
        this.maxY = Math.max(this.maxY, bounds.maxY);

        this.minX = Math.min(this.minX, bounds.minX);
        this.maxX = Math.max(this.maxX, bounds.maxX);
    }

    expand(horizontal, vertical) {
        this.minX -= horizontal;
        this.maxX += horizontal;
        this.minY -= vertical;
        this.maxY += vertical;
    }

    get topLeft() {
        return new Vector(this.minX, this.maxY);
    }

    get topRight() {
        return new Vector(this.maxX, this.maxY);
    }

    get bottomRight() {
        return new Vector(this.maxX, this.minY);
    }

    get bottomLeft() {
        return new Vector(this.minX, this.minY);
    }

    get path() {
        return [this.topLeft, this.topRight, this.bottomRight, this.bottomLeft];
    }

    get width() {
        return this.maxX - this.minX;
    }

    get height() {
        return this.maxY - this.minY;
    }

    get midpoint() {
        return new Vector((this.minX + this.maxX) / 2, (this.minY + this.maxY) / 2);
    }

    contains(ptOrBounds) {
        if (ptOrBounds instanceof Bounds) {
            return (
                this.minX <= ptOrBounds.minX && ptOrBounds.maxX <= this.maxX &&
                this.minY <= ptOrBounds.minY && ptOrBounds.maxY <= this.maxY
            );
        }
        return this.containsPoint(ptOrBounds);
    }

    containsPoint(pt) {
        return (
            this.minX <= pt.x && pt.x <= this.maxX &&
            this.minY <= pt.y && pt.y <= this.maxY
        );
    }

    findPoint(points) {
        for (let i = 0; i < points.length; i++) {
            if (this.containsPoint(points[i])) {
                return i;
            }
        }
        return -1;
    }

    containsPointsAny(points) {
        return this.findPoint(points) !== -1;
    }

    intersects(otherBox) {
        return !(this.minX > otherBox.maxX
                 || this.maxX < otherBox.minX
                 || this.maxY < otherBox.minY
                 || this.minY > otherBox.maxY);
    }

    equals(otherBox) {
        return (this.minX === otherBox.minX
                 && this.maxX === otherBox.maxX
                 && this.minY === otherBox.minY
                 && this.maxY === otherBox.maxY);
    }

    translate(vec) {
        this.minX += vec.x;
        this.maxX += vec.x;
        this.minY += vec.y;
        this.maxY += vec.y;
    }

    static pathMidPoint(path) {
        gBounds.reset();
        for (let i = 0; i < path.length; i++) {
            gBounds.extendVector(path[i]);
        }
        return gBounds.midpoint;
    }
}

gBounds = new Bounds();

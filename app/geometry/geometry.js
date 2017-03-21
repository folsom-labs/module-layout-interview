import { Vector } from './vector';

/**
 * return true if a point is in the polygon
 * @param  {Vector} point   a vector to test
 * @param  {Arraay{Vector}} polygon [description]
 * @return {boolean}         [description]
 */
export function pointInPolygon(point, polygon) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    const { x, y } = point;

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i].x, yi = polygon[i].y;
        let xj = polygon[j].x, yj = polygon[j].y;

        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

export function signedArea(path) {
    const length = path.length;
    let area = 0;
    let lastPoint = path[length - 1];

    for (let i = 0; i < length; i += 1) {
        const point = path[i];
        area += (lastPoint.x * point.y - point.x * lastPoint.y);
        lastPoint = point;
    }

    return area / 2;
}


/**
 * return the orientation of a path of vectors
 * returns True if the signed area is non-negative (the points are counter clockwise)
 */
export function pathOrientation(path) {
    return signedArea(path) >= 0;
}

/**
 * correct the orientation of a path of vectors
 */
export function correctOrientation(path) {
    return pathOrientation(path) ? path : _.reverse(path);
}

export function rotatedGridVector(source, dest, angle) {
    const gridOffsets = dest.subtract(source);
    const rotatedOffsets = gridOffsets.rotate(-angle);

    return {
        midpoint: source.add(new Vector(rotatedOffsets.x, 0).rotate(angle)),
        distance: Math.abs(rotatedOffsets.x) + Math.abs(rotatedOffsets.y),
    };
}

export function dedupePath(path) {
    let [lastPoint, ...rest] = path;

    const rtn = [lastPoint];

    for (const pt of rest) {
        if (!lastPoint.equals(pt)) {
            rtn.push(pt);
        }

        lastPoint = pt;
    }

    return rtn;
}


export function sanitizePath(path) {
    return correctOrientation(dedupePath(path));
}


/**
 * test for two path intersection by checking if any segments intersect
 * and then checking if either of the shapes is fully enclosed
 *
 * only works for simple polygons, note, does not take into account collinearity
 */
export function pathIntersects(path1, path2) {
    let p1 = path1[path1.length - 1];

    for (let i = 0; i < path1.length; i++) {
        const p2 = path1[i];

        let q1 = path2[path2.length - 1];
        for (let j = 0; j < path2.length; j++) {
            const q2 = path2[j];

            if (segmentIntersects(p1, p2, q1, q2)) {
                return true;
            }

            q1 = q2;
        }

        p1 = p2;
    }

    if (pointInPolygon(path1[0], path2)) {
        return true;
    } else if (pointInPolygon(path2[0], path1)) {
        return true;
    }

    return false;
}

function isCCW(p1, p2, p3) {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
}

/**
 * check if two line segments intersect
 */
function segmentIntersects(p1, p2, p3, p4) {
    return (isCCW(p1, p3, p4) !== isCCW(p2, p3, p4)) && (isCCW(p1, p2, p3) !== isCCW(p1, p2, p4));
}

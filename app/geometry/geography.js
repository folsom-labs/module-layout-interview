import { toRadians, toDegrees } from './math';
import { Vector } from './vector';
import { Bounds } from './bounds';
import { pointInPolygon } from './geometry';

export const RADIUS_OF_EARTH = 6378137; // meters


export function bearingFromVector(vector) {
    return (toDegrees(Math.PI / 2 - Math.atan2(vector.y, vector.x)) + 360) % 360;
}


export class GeoPoint extends google.maps.LatLng {
    constructor(latitude, longitude) {
        if (typeof latitude === 'number') {
            super({lat: latitude, lng: longitude });
        } else if (typeof latitude.latitude === 'number') { // from POJO
            super({lat: latitude.latitude, lng: latitude.longitude });
        } else { // from Google Maps
            super({lat: latitude.lat(), lng: latitude.lng() });
        }
    }

    /**
     * get the distance to another GeoPoint
     *
     * uses the haversine equation: http://en.wikipedia.org/wiki/Haversine_formula
     */
    distance(other) {
        const deltaLat = toRadians(this.latitude - other.latitude);
        const deltaLng = toRadians(this.longitude - other.longitude);

        const x = (
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
             + (Math.cos(toRadians(this.latitude))
                * Math.cos(toRadians(other.latitude))
                * Math.sin(deltaLng / 2)
                * Math.sin(deltaLng / 2))
        );

        const arc = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

        return RADIUS_OF_EARTH * arc;
    }

    /**
     * get the bearing to another GeoPoint
     */
    bearing(other) {
        const deltaLng = toRadians(other.longitude - this.longitude);

        const y = Math.sin(deltaLng) * Math.cos(toRadians(other.latitude));
        const x = (Math.cos(toRadians(this.latitude)) * Math.sin(toRadians(other.latitude))
                   - Math.sin(toRadians(this.latitude)) * Math.cos(toRadians(other.latitude)) * Math.cos(deltaLng));

        return toDegrees(Math.atan2(y, x));
    }

    /**
     * offset the GeoPoint by a vector (X, Y, Z);
     */
    offsetVector(vector, radius = RADIUS_OF_EARTH) {
        const bearing = bearingFromVector(vector);

        // explicitly use the 2d Distance because we only care about distance along the surface
        return this.offset(Math.sqrt(vector.x ** 2 + vector.y ** 2), bearing, radius);
    }

    /**
     * offset this geopoint by X and Y in meters
     */
    offsetXY(x, y) {
        return this.offsetVector(new Vector(x, y));
    }

    /**
     * offset by a a specific distance and heading
     */
    offset(distance, heading, radius = RADIUS_OF_EARTH) {
        const normalizedDistance = distance / radius;
        const headingRad = toRadians(heading);
        const latRad = toRadians(this.latitude);
        const lngRad = toRadians(this.longitude);
        const cosDist = Math.cos(normalizedDistance);
        const sinDist = Math.sin(normalizedDistance);

        const sinLat = Math.sin(latRad);
        const cosLat = Math.cos(latRad);
        const x = cosDist * sinLat + sinDist * cosLat * Math.cos(headingRad);

        return new GeoPoint(
            toDegrees(Math.asin(x)),
            toDegrees(lngRad + Math.atan2(sinDist * cosLat * Math.sin(headingRad), cosDist - sinLat * x))
        );
    }

    /**
     * get a vector representing the distance in meters between this and a different point
     */
    gridOffsets(geopoint) {
        const distance = this.distance(geopoint);
        const bearing = toRadians(this.bearing(geopoint));

        return new Vector(Math.sin(bearing) * distance, Math.cos(bearing) * distance);
    }

    // convenience methods for getting latitude and longitude
    get latitude() {
        return this.lat();
    }

    get longitude() {
        return this.lng();
    }

}

/**
 * get the midpoint of a path of lat/lng.
 *
 * NOTE: breaks down when crossing a longitude of 0/360
 */
export function pathMidpoint(path) {
    const coordSystem = new XYCoordinateSystem(path[0]);

    const xyPath = coordSystem.toXY(path);
    const bounds = new Bounds(xyPath);

    return coordSystem.toLatLng(bounds.midpoint);
}

export function convertToGoogle(geopoint) {
    if(Array.isArray(geopoint)) {
        return geopoint.map(convertToGoogle);
    }

    return geopoint.googleLatLng();
}


export function geopointInPolygon(geopoint, geopolygon) {
    const coordSystem = new XYCoordinateSystem(geopoint);
    const point = coordSystem.toXY(geopoint); // this should always be (0, 0)
    const xyPolygon = coordSystem.toXY(geopolygon);

    return pointInPolygon(point, xyPolygon);
}

/**
 * class for creating a (simpler) cartesian coordinate system from geopoints by
 * providing a center point in Lat/Lng and then siplifying X/Y and Lat/Lng offsets around that point
 */
export class XYCoordinateSystem {
    constructor(centerGeopoint) {
        this.center = centerGeopoint;
    }

    toXY(geopoint) {
        if (Array.isArray(geopoint)) {
            return geopoint.map(gp => this.toXY(gp));
        }

        return this.center.gridOffsets(geopoint);
    }

    toLatLng(vector) {
        if (Array.isArray(vector)) {
            return vector.map(vec => this.toLatLng(vec));
        }

        return this.center.offsetVector(vector);
    }
}


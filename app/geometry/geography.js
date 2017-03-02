import { toRadians, toDegrees } from './math';
import { Vector } from './vector';
import { Bounds } from './bounds';

export const RADIUS_OF_EARTH = 6378137; // meters


export function bearingFromVector(vector) {
    return (toDegrees(Math.PI / 2 - Math.atan2(vector.y, vector.x)) + 360) % 360;
}


export class GeoPoint {
    constructor(latitude, longitude) {
        if (typeof latitude === 'number') {
            this.latitude = latitude;
            this.longitude = longitude;
        } else if (typeof latitude.latitude === 'number') { // from POJO
            this.latitude = latitude.latitude;
            this.longitude = latitude.longitude;
        } else { // from Google Maps
            this.latitude = latitude.lat();
            this.longitude = latitude.lng();
        }
    }

    /**
     * http://en.wikipedia.org/wiki/Haversine_formula
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

    bearing(other) {
        const deltaLng = toRadians(other.longitude - this.longitude);

        const y = Math.sin(deltaLng) * Math.cos(toRadians(other.latitude));
        const x = (Math.cos(toRadians(this.latitude)) * Math.sin(toRadians(other.latitude))
                   - Math.sin(toRadians(this.latitude)) * Math.cos(toRadians(other.latitude)) * Math.cos(deltaLng));

        return toDegrees(Math.atan2(y, x));
    }

    offsetVector(vector, radius = RADIUS_OF_EARTH) {
        const bearing = bearingFromVector(vector);

        // explicitly use the 2d Distance because we only care about distance along the surface
        return this.offset(Math.sqrt(vector.x ** 2 + vector.y ** 2), bearing, radius);
    }

    offsetXY(x, y) {
        return this.offsetVector(new Vector(x, y));
    }

    /**
     * ported from google maps
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

    googleLatLng() {
        if (window.google !== undefined) {
            return new window.google.maps.LatLng(this.latitude, this.longitude);
        }

        console.error('Warning, tried to access google maps, but not loaded yet');
        return null;
    }
}

/**
 * get the midpoint of a path of lat/lng.
 *
 * NOTE: breaks down when crossing a longitude of 0/360
 */
export function pathMidpoint(path) {
    const bounds = new Bounds();

    for (const { latitude, longitude } of path) {
        bounds.extendVector(new Vector(longitude, latitude));
    }

    const { x, y } = bounds.midpoint;

    return new GeoPoint(y, x);
}

export function convertToGoogle(geopoint) {
    if(Array.isArray(geopoint)) {
        return geopoint.map(convertToGoogle);
    }

    return geopoint.googleLatLng();
}


/**
 * class for creating a (simpler) cartesian coordinate system from geopoints by
 * providing a center point in Lat/Lng and then siplifying X/Y and Lat/Lng offsets around that point
 */
class XYCoordinateSystem {
    constructor(centerGeopoint) {
        this.center = center;
    }

    convertToVector(geopoint) {
        if (Array.isArray(geopoint)) {
            return geopoint.map(gp => this.conveterToVector(gp));
        }

        return this.center.gridOffsets(geopoint);
    }

    convertToGeopoint(vector) {
        if (Array.isArray(geopoint)) {
            return vector.map(vec => this.convertToGeopoint(vec));
        }

        return this.center.offsetVector(vector);
    }
}

/*globals google:true */

/*
This is a library of useful geometry helpers that wrap around the Google Maps
API object.
*/

'use strict';
var Geometry = {

    /**
     * get a bounding box enclosing a polygon
     * @param  {google.maps.Polygon} polygon
     * @return {google.maps.LatLngBound}
     */
    bounds: function (polygon) {
        // return a bounding box (google.maps.LatLngBounds) around a google maps polygon
        var bounds = new google.maps.LatLngBounds(),
            paths = polygon.getPaths(),
            path,
            p,
            i;

        for (p = 0; p < paths.getLength(); p += 1) {
            path = paths.getAt(p);
            for (i = 0; i < path.getLength(); i += 1) {
                bounds.extend(path.getAt(i));
            }
        }

        return bounds;
    },

    /**
     * grow a bounds in all directions by a certain distance in meters
     * @param  {google.maps.LatLngBounds} bounds
     * @param  {double} distance (meters)
     */
    bufferBounds: function (bounds, distance) {
        // extend the distance by an additional root 2 to account for the fact that the offset
        // is moving at 45 degrees to the cardinal directions
        bounds.extend(this.offset(bounds.getNorthEast(), distance * Math.sqrt(2), 45));
        bounds.extend(this.offset(bounds.getSouthWest(), distance * Math.sqrt(2), 225));

        return bounds;
    },

    /**
     * return true if a polygon contains a location
     * @param  {google.maps.Polygon} polygon
     * @param  {google.maps.LatLng} latLng  [description]
     * @return {boolean} latLng is in polygon
     */
    containsLocation: function (polygon, latLng) {
        return google.maps.geometry.poly.containsLocation(latLng, polygon);
    },

    /**
     * Return true if a polygon contains all points in the Array 'panelPoints
     * @param  {google.maps.Polygon} polygon
     * @param  {Array of google.maps.LatLng} panelPoints
     * @return {boolean} panelPoints fits in polygon
     */
    containsPanel: function (polygon, panelPoints) {
        return Geometry.containsLocation(polygon, panelPoints[0]) &&
            Geometry.containsLocation(polygon, panelPoints[1]) &&
            Geometry.containsLocation(polygon, panelPoints[2]) &&
            Geometry.containsLocation(polygon, panelPoints[3]);
    },


    /**
     * return a new point that is a specific distance (meters) and heading (degrees)
     * from a start point
     * @param  {google.maps.LatLng} latLng   [description]
     * @param  {float} distance (meters)
     * @param  {fload} heading  (degrees)
     * @return {google.maps.LatLng}
     */
    offset: function (latLng, distance, heading) {
        return google.maps.geometry.spherical.computeOffset(latLng, distance, heading);
    },

    /**
     * return a new point that is offset (x, y) meters from the start point
     * @param  {google.maps.LatLng} latLng
     * @param  {float} x (meters, positive to the east/right)
     * @param  {float} y (meters, positive to the north/up)
     * @return {google.maps.LatLng}
     */
    offsetXY: function (latLng, x, y) {
        var transX = this.offset(latLng, x, 90);
        return this.offset(transX, y, 0);
    },


    /**
     * return the distance in meters between two points
     * @param  {google.maps.LatLng} source
     * @param  {google.maps.LatLng} dest
     * @return {float} (meters)
     */
    distance: function (source, dest) {
        //return the distance between two points
        return google.maps.geometry.spherical.computeDistanceBetween(source, dest);
    },

    /**
     * return the heading between two points – 0º is north, 90º is east, 180º is south, 270º is west
     * @param  {google.maps.LatLng} source
     * @param  {google.maps.LatLng} dest
     * @return {float} (degrees)
     */
    heading: function (source, dest) {
        return google.maps.geometry.spherical.computeHeading(source, dest);
    },
}


/* globals google:true, window:true, document:true */

require("./style.css");

import $ from 'jquery';

import { Vector } from './geometry/vector';
import { Bounds } from './geometry/bounds';
import { pointInPolygon } from './geometry/geometry';
import {
    convertToGoogle,
    GeoPoint,
    pathMidpoint,
    geopointInPolygon,
} from './geometry/geography';


function fillPolygon(boundaryPolygon, layoutRules) {
    // This function currently populated with dummy code to draw a module at an
    // arbitrary location (we've added our own geometry libraries to make spatial
    // operations easier, these are some examples).
    //
    // Update this function with your code to fill the polygon with solar panels.


    const map = boundaryPolygon.getMap();

    // convert the polygon path from raw google LatLng Objects to a more convenient GeoPoint class
    // that extends google maps lat/lngs to expose more useful functions
    const googlePath = boundaryPolygon.getPath().getArray();
    const boundaryPath = googlePath.map(ll => new GeoPoint(ll));

    // get the midpoint of the polygon (the midpoint of a bounding box around the polygon)
    const midpoint = pathMidpoint(boundaryPath);

    // you can work wit latitude/longitude directly using the geopoint object
    // this has convenience functions for offsetting by fixed meters or lat/lngs
    console.log("Midpoint is in polygon?", geopointInPolygon(midpoint, boundaryPath));
    console.log("Midpoint shifted 25m to east is in polygon?", geopointInPolygon(midpoint.offsetXY(25, 0), boundaryPath));

    // construct an arbitrary module path starting at the midpoint
    const modulePath = [
        midpoint, // top left
        midpoint.offsetXY(0, -layoutRules.height), // bottom left
        midpoint.offsetXY(layoutRules.width, -layoutRules.height), // bottom right
        midpoint.offsetXY(layoutRules.width, 0), // top right
    ]

    // draw a polygon for this path
    // the google maps API for drawing a polygon is a little arcane, but, so it is
    new google.maps.Polygon({
        map: map,
        fillColor: 'blue',
        strokeColor: 'blue',
        fillOpacity: 0.5,
        strokeWeight: 2,
        path: modulePath,
    });

    // shift the polygon by 10 meters a bearing of 45 degrees
    new google.maps.Polygon({
        map: map,
        fillColor: 'red',
        strokeColor: 'red',
        fillOpacity: 0.5,
        strokeWeight: 2,
        path: modulePath.map(gp => gp.offset(10, 45)), // shift the path 10m by a bearing of 45
    });
}




// the following is all the glue code to to tie the User Interface to the draw a polygon function


/**
 * have the user input a polygon in the map and call the callback with the finished polygon
 * @param  {google.maps.Map}   map
 * @param  {function} callback
 */
function getPolygon(map, callback) {
    var drawingManager = new google.maps.drawing.DrawingManager({
            map: map,
            drawingControl: false,
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            polygonOptions: {
                fillColor: '#55FF55',
                strokeColor: '#55FF55',
                fillOpacity: 0.2,
                strokeWeight: 5,
                clickable: false,
                editable: false,
                zIndex: 0
            }
        });

    google.maps.event.addListenerOnce(drawingManager, 'polygoncomplete', function (polygon) {
        callback(polygon);

        drawingManager.setMap(null);
    });

}

function initialize() {
    var mapOptions = {
            center: new google.maps.LatLng(37.7833, -122.4167),
            zoom: 21,
            maxZoom: 25,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            tilt: 0,

        };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var button = $('#drawModules');


    button.on('click', function () {
        button.prop('disabled', true);

        getPolygon(map, function(polygon){
            console.log('Got Polygon from User');

            var layoutOptions = {
                width: Number($('#moduleWidth').val()),     // meters
                height: Number($('#moduleHeight').val()),   // meters
                azimuth: Number($('#azimuth').val()),   // degrees
                rowSpacing: Number($('#rowSpacing').val()), // meters
            };

            fillPolygon(polygon, layoutOptions);
            button.prop('disabled', false);
        });
    });
}

google.maps.event.addDomListener(window, 'load', initialize);






/* globals google:true, window:true, document:true */

require("./style.css");

import $ from 'jquery';

import { Vector } from './geometry/vector';
import { Bounds } from './geometry/bounds';
import { GeoPoint, pathMidpoint, convertToGoogle } from './geometry/geography';


function fillPolygon(boundaryPolygon, layoutRules) {
    // This function currently populated with dummy code to draw a module at an
    // arbitrary location.  Update it with your code to fill the polygon with
    // solar panels
    //
    // we've added a fleshed out geometry library, so you can do simple spatial operations
    const map = boundaryPolygon.getMap();

    // convert the polygon path from google Lat Lng Objects to a more convenient GeoPoint class
    const googlePath = boundaryPolygon.getPath().getArray();
    const boundaryPath = googlePath.map(ll => new GeoPoint(ll));

    // just draw an arbitray polgyon in the center of the path, as an example

    const midpoint = pathMidpoint(boundaryPath);

    const topLeft = midpoint.offsetXY(-layoutRules.width / 2, layoutRules.height / 2);
    const bottomLeft = midpoint.offsetXY(-layoutRules.width / 2, -layoutRules.height / 2);
    const bottomRight = midpoint.offsetXY(layoutRules.width / 2, -layoutRules.height / 2);
    const topRight = midpoint.offsetXY(layoutRules.width / 2, layoutRules.height / 2);

    // draw a polygon for a single Module
    var modulePolygon = new google.maps.Polygon({
        map: map,
        fillColor: '#0000FF',
        strokeColor: '#0000FF',
        fillOpacity: 0.5,
        strokeWeight: 2,
        path: convertToGoogle([topLeft, bottomLeft, bottomRight, topRight]),
    });

}

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
                azimuth: Number($('#azimuth').val()),   // meters
                rowSpacing: Number($('#rowSpacing').val()), // meters
            };

            fillPolygon(polygon, layoutOptions);
            button.prop('disabled', false);
        });
    });
}

google.maps.event.addDomListener(window, 'load', initialize);






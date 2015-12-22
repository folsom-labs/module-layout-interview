/*globals google:true, window:true, document:true, google:true, Geometry:true, $:true */
'use strict';


function fillPolygon(boundaryPolygon, layoutRules) {
    var map = boundaryPolygon.getMap(),
        //boundaryPath = boundaryPolygon.getPath(),
        boundingBox = Geometry.bounds(boundaryPolygon),
        corners = [boundingBox.getNorthEast(), boundingBox.getSouthWest()],

        // define the top left of the module as the top left of the bounding box
        topLeft     = new google.maps.LatLng(corners[0].lat(),corners[1].lng()),

        // store the modules we add to the map (don't need this for displaying, just maybe useful to have)
        modules = [];

    // get the module polygon path when given the top left as maps.google.LatLng
    function getModulePath(topLeft) {
        return [
            topLeft,
            Geometry.offsetXY(topLeft, 0,                 -layoutRules.height),
            Geometry.offsetXY(topLeft, layoutRules.width, -layoutRules.height),
            Geometry.offsetXY(topLeft, layoutRules.width, 0),
        ]
    }

    // create a bounding box
    var boundingPolygon = new google.maps.Polygon({
        //map: map,               // uncomment for visible testing bounding box
        fillColor: '#444444',
        strokeColor: '#444444',
        fillOpacity: 0.4,
        strokeWeight: 2,
        path: [
            {lat: corners[0].lat(), lng: corners[1].lng()},
            {lat: corners[1].lat(), lng: corners[1].lng()},
            {lat: corners[1].lat(), lng: corners[0].lng()},
            {lat: corners[0].lat(), lng: corners[0].lng()}
        ]
    });


    var newTL = topLeft;
    while (Geometry.containsLocation(boundingPolygon, newTL)) {
        var successfulRow = false;

        while(Geometry.containsLocation(boundingPolygon, newTL)) {
            var p = getModulePath(newTL);
            if (Geometry.containsPath(boundaryPolygon, p)) {
                modules.push(new google.maps.Polygon({
                    map: map,
                    fillColor: '#0000FF',
                    strokeColor: '#0000FF',
                    fillOpacity: 0.5,
                    strokeWeight: 2,
                    path: getModulePath(newTL)
                }));
                newTL = Geometry.offsetXY(newTL, layoutRules.width, 0);
                successfulRow = true;
            } else {
                newTL = Geometry.offsetXY(newTL, layoutRules.width/4, 0);   // width/4 is arbitrary
            }
        }

        var adjustment = successfulRow ? layoutRules.rowSpacing + layoutRules.height : layoutRules.rowSpacing/2;
        newTL = Geometry.offsetXY(new google.maps.LatLng(newTL.lat(), topLeft.lng()), 0, -adjustment);
    }
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

        },
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions),
        button = $('#drawModules');


    button.on('click', function () {
        button.prop('disabled', true);

        getPolygon(map, function(polygon){
            console.log('Got Polygon from User');

            var layoutOptions = {
                width: parseFloat($('#moduleWidth').val()),     // meters
                height: parseFloat($('#moduleHeight').val()),   // meters
                rowSpacing: parseFloat($('#rowSpacing').val()), // meters
            };

            fillPolygon(polygon, layoutOptions);
            button.prop('disabled', false);
        });
    });
}

google.maps.event.addDomListener(window, 'load', initialize);


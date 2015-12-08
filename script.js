/*globals google:true, window:true, document:true, google:true, Geometry:true, $:true */
'use strict';


function fillPolygon(boundaryPolygon, layoutRules) {
    // This function currently populated with dummy code to draw a module at an
    // arbitrary location.  Update it with your code to fill the polygon with
    // solar panels
    //
    // see google maps reference may be useful
    // https://developers.google.com/maps/documentation/javascript/reference

    // check if module is inside the user drawn polygon
    var bounds = Geometry.bounds(boundaryPolygon),
    start = bounds.getNorthEast(),
    end = bounds.getSouthWest()

    var map = boundaryPolygon.getMap(),
        boundaryPath = boundaryPolygon.getPath()

    var distance = Geometry.distance(start,end),
        angle = Geometry.heading(start,end) + 180

    // convert to radians
    var xDistance = Math.sin(Math.PI/180 * angle) * distance , 
        yDistance = Math.cos(Math.PI/180 * angle) * distance

        // define the four corners of a rectangle starting at the first point, edge of bounds
    console.log(start,xDistance,layoutRules)
    // move over x axis
    for (var x = 0; x > -xDistance; x-= layoutRules.width) {
        // move over y axis 
        for (var y = 0; y > -yDistance; y-= (layoutRules.height + layoutRules.rowSpacing)){
            // in the polygon path
            var topLeft = Geometry.offsetXY(start,x,y),
            // topLeft     = boundaryPath.getAt(0),
            bottomLeft  = Geometry.offsetXY(topLeft, 0,                 -layoutRules.height),
            bottomRight = Geometry.offsetXY(topLeft, layoutRules.width, -layoutRules.height),
            topRight    = Geometry.offsetXY(topLeft, layoutRules.width, 0)
            // find bounds of polygon
            if (checkBounds(boundaryPolygon,topLeft,bottomLeft,bottomRight,topRight)){
                // console.log('is inside the polygon')
                drawModule(topLeft,bottomLeft,bottomRight,topRight,map)
            } else {
                // console.log('outside the bounds')
            }            
        }
    };
}

function checkBounds(boundaryPolygon,topLeft,bottomLeft,bottomRight,topRight){
    return Geometry.containsLocation(boundaryPolygon,topLeft) &&
    Geometry.containsLocation(boundaryPolygon,topRight) &&
    Geometry.containsLocation(boundaryPolygon,bottomLeft) &&
    Geometry.containsLocation(boundaryPolygon,bottomRight) 
}


function drawModule(topLeft,bottomLeft,bottomRight,topRight,map){
    // draw a polygon for a single Module
    var modulePolygon = new google.maps.Polygon({
        map: map,
        fillColor: '#0000FF',
        strokeColor: '#0000FF',
        fillOpacity: 0.5,
        strokeWeight: 2,
        path: [topLeft, bottomLeft, bottomRight, topRight]
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

        },
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions),
        button = $('#drawModules');


    button.on('click', function () {
        button.prop('disabled', true);

        getPolygon(map, function(polygon){
            console.log('Got Polygon from User');

            var layoutOptions = {
                width: $('#moduleWidth').val(),     // meters
                height: $('#moduleHeight').val(),   // meters
                rowSpacing: $('#rowSpacing').val(), // meters
            };

            fillPolygon(polygon, layoutOptions);
            button.prop('disabled', false);
        });
    });
}

google.maps.event.addDomListener(window, 'load', initialize);


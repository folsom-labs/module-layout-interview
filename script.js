/*globals google:true, window:true, document:true, google:true, Geometry:true, $:true */
'use strict';

/**
 * Return an array of the 4 points that make the corners of the solar module.
 * @param  {google.maps.LatLng} bottomLeft corner of the panel
 * @param  {Object} layoutRules. Defines panel height and width
 * @return {Array of google.maps.LatLng} LatLngs in this order: [topLeft, bottomLeft, bottomRight, topRight]
 */
function panelPoints(bottomLeft, layoutRules) {
    var topLeft     = Geometry.offsetXY(bottomLeft, 0, layoutRules.height),
        bottomRight = Geometry.offsetXY(topLeft, layoutRules.width, -layoutRules.height),
        topRight    = Geometry.offsetXY(topLeft, layoutRules.width, 0);
    return [topLeft, bottomLeft, bottomRight, topRight];
}

/**
 * Draw a solar module on 'map'
 * @param  {google.maps.Map} map
 * @param  {Array} path. 4 coordinates of panel.
 */
function drawPanel(map, path) {
     new google.maps.Polygon({
        map: map,
        fillColor: '#0000FF',
        strokeColor: '#0000FF',
        fillOpacity: 0.5,
        strokeWeight: 2,
        path: path
    });
}

/**
 * Fill 'boundaryPolygon' with rows of PV modules
 * @param  {google.maps.Polygon} boundaryPolygon
 * @param  {Object} layoutRules
 */
function fillPolygon(boundaryPolygon, layoutRules) {
    //TODO start at varying heights above the bottom and eventually use the starting height that yields the most panels.

    var map = boundaryPolygon.getMap();
    var bounds = Geometry.bounds(boundaryPolygon);

    //Bottom left corner of the bounding box. This will mark the first bottom left point in a row of panels.
    var startingBottomLeft = bounds.getSouthWest();
    var panel = panelPoints(startingBottomLeft, layoutRules);
    var panelInRow = false; //Used in the while loop below
    var bottomLeft; //Bottom left point of the panel. Used in the while loop below

    //Start at the bottom left of the bounding box and try to draw panels until we hit the top of the bounding box.
    while (bounds.contains(panel[0])) { //panel[0] is the top left corner of the panel
        panelInRow = false;

        //Move to the right in steps of 0.1 meters. If a panel fits in the polygon, draw it. Stop when we get to
        //the right edge of the bounding box.
        while (bounds.contains(panel[2])) { //panel[2] is the bottom right of the panel

            //If the panel fits, draw it and continue drawing panels to the right until you hit a spot where a panel
            //no longer fits in the polygon
            while (Geometry.containsPanel(boundaryPolygon, panel)) {
                drawPanel(map, panel);
                //Move to the right in steps of the width of the panel
                bottomLeft = Geometry.offset(panel[1], layoutRules.width, 90);
                panel = panelPoints(bottomLeft, layoutRules);
                panelInRow = true;
            }
            //Move to the right by 0.1 meters
            bottomLeft = Geometry.offset(panel[1], 0.1, 90);
            panel = panelPoints(bottomLeft, layoutRules);
        }
        //If a panel was drawn at this latitude, move up by (module height) + (row spacing)
        if (panelInRow) {
            startingBottomLeft = Geometry.offset(startingBottomLeft, layoutRules.height + layoutRules.rowSpacing, 0);
        } else { //If no panel was drawn, move up by 0.1 meters
            startingBottomLeft = Geometry.offset(startingBottomLeft, 0.1, 0);
        }
        panel = panelPoints(startingBottomLeft, layoutRules);
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
            center: new google.maps.LatLng(47.6205, -122.3497), //Start at the Space Needle :)
            zoom: 21,
            maxZoom: 25,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            tilt: 0
        },
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions),
        button = $('#drawModules');


    button.on('click', function () {
        button.prop('disabled', true);

        getPolygon(map, function(polygon){
            console.log('Got Polygon from User');

            var layoutOptions = {
                width: parseFloat($('#moduleWidth').val()),     // float. meters
                height: parseFloat($('#moduleHeight').val()),   // float. meters
                rowSpacing: parseFloat($('#rowSpacing').val()) // float. meters
            };

            fillPolygon(polygon, layoutOptions);
            button.prop('disabled', false);
        });
    });
}

google.maps.event.addDomListener(window, 'load', initialize);
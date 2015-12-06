/*globals google:true, window:true, document:true, google:true, Geometry:true, $:true */
'use strict';


function fillPolygon(boundaryPolygon, layoutRules) {
    // This function currently populated with dummy code to draw a module at an
    // arbitrary location.  Update it with your code to fill the polygon with
    // solar panels
    //
    // see google maps reference may be useful
    // https://developers.google.com/maps/documentation/javascript/reference
    var map = boundaryPolygon.getMap(),

        bounds = Geometry.bounds(boundaryPolygon),
        //invisible polygon that corresponds to a bounding rectangle of our bounding polygon
        rectangleBorder = new google.maps.Rectangle({
            visible: false,
            map: map,
            bounds: bounds
        }),
        //coordinates where we start looking in a row
        rowStartLatLng = rectangleBorder.bounds.getNorthEast(),
        //current coordinates where we are trying to place a module
        currentLatLng = rowStartLatLng,
        //current x and y location where we are trying to place a module
        currentX = currentLatLng.lng(),
        currentY = currentLatLng.lat(),
        // x and y location corresponding to the last location we would need to check
        endX = rectangleBorder.bounds.getSouthWest().lng(),
        endY = rectangleBorder.bounds.getSouthWest().lat(),
        verticalOffset = 0,
        //Booleans used to dictate where to check after excedding the bounding rectangle area
        atBottom = false,
        atRight = false,
        moduleInRow = false;

    while(!atBottom || !atRight ){
        //create a module if it fits
        var moduleCreatedBoolean = createModule(boundaryPolygon, map, currentLatLng, layoutRules);
        if (moduleCreatedBoolean) {
            moduleInRow = true;
            //if a module was placed move the current location over one modulw width
            currentLatLng = Geometry.offsetXY(currentLatLng,-layoutRules.width,0);
        }

        currentX = currentLatLng.lng();
        currentY = currentLatLng.lat();

        if(currentX < endX){ 
            atRight = true;
        }
        if(currentY < endY){ 
            atBottom = true;
        }
        if(atRight){
            if(moduleInRow){
                //move down a full module height plus any row spacing and all the way to the left
                currentLatLng = Geometry.offsetXY(rowStartLatLng, 0, -layoutRules.height - layoutRules.rowSpacing);
                rowStartLatLng = currentLatLng;
            }
            else{
                //move down an inch and all the way to the left side
                currentLatLng = Geometry.offsetXY(rowStartLatLng, 0, -0.0254);
                rowStartLatLng = currentLatLng;
            }
            if(!atBottom){
                atRight = false;
            }
            moduleInRow = false;
        
        } else {
            //move right an inch
            currentLatLng = Geometry.offsetXY(currentLatLng, -0.0254, 0);
        }

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

        var rectangle = new google.maps.Rectangle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            bounds: {
                north: 33.685,
                south: 33.671,
                east: -116.234,
                west: -116.251
            }
        });

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

//draws a module on the map if it will fit and returns true if a module is added
var createModule = function(polygon, map, northEastCorner, layoutRules){
    var topLeft     = northEastCorner;
    var bottomLeft  = Geometry.offsetXY(topLeft, 0,                 -layoutRules.height);
    var bottomRight = Geometry.offsetXY(topLeft, layoutRules.width, -layoutRules.height);
    var topRight    = Geometry.offsetXY(topLeft, layoutRules.width, 0);
    
    // draw a polygon for a single Module if it fits in the bounding arear at the current location
    if(moduleFits(polygon,[topLeft, topRight, bottomLeft, bottomRight])){
        var module = new google.maps.Polygon({
            map: map,
            fillColor: '#0000FF',
            strokeColor: '#0000FF',
            fillOpacity: 0.5,
            strokeWeight: 1,
            path: [topLeft, bottomLeft, bottomRight, topRight]
        });
        return true;
    } else {
        return false;
    }
};

//checks if a module will fit in the bounding area
var moduleFits = function(polygon, cornerArray){
    for (var i = 0; i < cornerArray.length; i++) {
        if(!Geometry.containsLocation(polygon, cornerArray[i])){
            return false;
        }
    }
    return true;
};

google.maps.event.addDomListener(window, 'load', initialize);
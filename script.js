/*globals google:true, window:true, document:true, google:true, Geometry:true, $:true */
"use strict"

function fillPolygon(boundaryPolygon, layoutRules) {
  // see google maps reference may be useful
  // https://developers.google.com/maps/documentation/javascript/reference

  var map = boundaryPolygon.getMap(),
    boundaryPath     = boundaryPolygon.getPath(),       // vector path of main polygon
    extendedBoundary = Geometry.bounds(boundaryPolygon) // square boundary containing the main polygon

    function maybeCreateModuleAt(xy, height, width) {
      var topLeft     = xy,
          bottomLeft  = Geometry.offset(topLeft, height, 180),
          bottomRight = Geometry.offset(bottomLeft, width, 90),
          topRight    = Geometry.offset(bottomRight, height, 0)

      var bounds      = new google.maps.LatLngBounds(),
          positions   = [topLeft, topRight, bottomLeft, bottomRight], pos,
          isContained = true

      // determine if each corner of the proposed rectangle is in the boundary polygon
      _.forEach(positions, function(pos, i) {
        if (isContained) {
          isContained = Geometry.containsLocation(boundaryPolygon, pos)

          bounds.extend(pos)
        }
      })
        
      if (isContained) {
        new google.maps.Rectangle({
          map: map,
          fillColor: '#000000',
          strokeColor: '#0000FF',
          fillOpacity: 0.5,
          strokeWeight: 2,
          bounds: bounds
        })
      }
    }

    function createModules() {
      var startXY = boundaryPath.getAt(0)

      var boundNE = extendedBoundary.getNorthEast(),
          boundSW = extendedBoundary.getSouthWest()

      var modHeight = Number(layoutRules.height),
          modWidth  = Number(layoutRules.width)

      // FIXME - has issues if you start in SW corner and head north. seems dependent on starting at NE corner.
      var maxModsX = Math.round(Geometry.distance(startXY, boundNE) / modWidth),
          maxModsY = Math.round(Geometry.distance(startXY, boundSW) / modHeight)

      var yStep = Math.abs(boundSW.lat() - boundNE.lat()) / maxModsY,
          xStep = Math.abs(boundSW.lng() - boundNE.lng()) / maxModsX
      
      for(var x = 0; x < maxModsX; x++) {
        for(var y = 0; y < maxModsY; y++) {
          var offsetX  = boundSW.lng() + (xStep * x),
              offsetY  = boundSW.lat() + (yStep * y),
              offsetXY = new google.maps.LatLng(offsetY, offsetX)

          maybeCreateModuleAt(offsetXY, modHeight, modWidth)
        }
      }
    }

    createModules()
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
    drawingManager = new google.maps.drawing.DrawingManager({
      map: map,
      drawingControl: false,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON,
        ]
      },
      polygonOptions: {
        fillColor: '#55FF55',
        strokeColor: '#55FF55',
        fillOpacity: 0.2,
        strokeWeight: 5,
        clickable: false,
        editable: false,
        zIndex: 0
      }
    }),
    button = $('#drawModules')


  button.on('click', function () {
    button.prop('disabled', true)

    drawingManager.setOptions({
      drawingMode: google.maps.drawing.OverlayType.POLYGON
    })

    google.maps.event.addListenerOnce(drawingManager, 'polygoncomplete', function (polygon) {
      drawingManager.setOptions({
        drawingMode: null
      })

      console.log("Got Polygon")

      fillPolygon(polygon, {
        width: $('#moduleWidth').val(), // meters
        height: $('#moduleHeight').val(),

        rowSpacing: $('#rowSpacing').val(),
        modulesInRow: $('#modulesInRow').val(),

        orientation: $('#orientation').val(),
        tilt: $('#tilt').val(),
        azimuth: $('#azimuth').val()
      })

      button.prop('disabled', false)
    })
  })
}

google.maps.event.addDomListener(window, 'load', initialize)

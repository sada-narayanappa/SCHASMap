// Here are all open street map utility functions

var EPSG_4326 = new OpenLayers.Projection("EPSG:4326");

function findLocation() {
   if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
   } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function xPoint(lon, lat) {
   var point = new OpenLayers.Geometry.Point(lon, lat);
   point.transform(EPSG_4326, map.getProjectionObject());
   return point;
}

function showPosition(pos) {
   console.log(" +++ " + pos.coords.longitude + " "  + pos.coords.latitude)
   point = xPoint(pos.coords.longitude, pos.coords.latitude)
	map.setCenter(point, 14);
}

function showPosition(pos) {
   var p = new OpenLayers.LonLat(pos.coords.longitude, pos.coords.latitude);
   p.transform( EPSG_4326, map.getProjectionObject());
   map.setCenter(p, 14);
}


function getMapBoundedBox(asString) {
   e = map.getExtent()
   e.transform(map.getProjection(), EPSG_4326)

   if ( asString) {
      e = e.left + "," + e.bottom + "," + e.right + "," + e.top
   }
   return e
}


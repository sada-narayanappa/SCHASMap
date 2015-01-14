// Here are all open street map utility functions
//

function findLocation() {
   if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
	var foundPosition = new OpenLayers.LonLat(position.coords.longitude, position.coords.latitude).transform(
              new OpenLayers.Projection("EPSG:4326"),
              new OpenLayers.Projection("EPSG:900913")
      );
	map.setCenter(foundPosition, 14);	
}
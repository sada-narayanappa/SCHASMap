//FILE NAME: userOptions.js

var userOptions = {
   myMobileID:       "",
   myMapView:        [0,0,0,0],
   myLayers:         ["layer1", "layer2"],
   myUserID:         "",
   hideControlPanel: false,
   controlPanelHide: "",
   centerLat: 0,
   centerLon: 0,
   zoom:      10

}

var defaultUserOptions = {
   myMobileID:       "",
   myMapView:        [0,0,0,0],
   myLayers:         ["layer1", "layer2"],
   myUserID:         "",
   hideControlPanel: true
}

// Read the userOptions JSON from cookie named USER_OPTIONS
function getUserOptions() {
   var uo = localStorage.getItem("userOptions");
   console.log("User options: " + uo);
   if ( uo ) {
      eval(uo);
      userOptions = $uo
      console.log( userOptions);
   }
}

// SAVE  userOptions JSON from cookie named USER_OPTIONS
function setUserOptions(map) {
   map.zoom = userOptions.zoom;
   var lonlat = xPoint(userOptions.centerLon, userOptions.centerLat);
   map.setCenter(lonlat, zoom);
}

// SAVE  userOptions JSON from cookie named USER_OPTIONS
function saveUserOptions(map) {
   updateMapLayers(map)
   var uo = "var $uo = " + JSON.stringify(userOptions);
   localStorage.setItem("userOptions", uo);

   userOptions.centerLon = map.center.lon;
   userOptions.centerLat = map.center.lat;
   userOptions.zoom = map.zoom;

   console.log("User options: " + uo);
}

// Get All Map Layers and save it in the userOptions
function updateMapLayers(map) {
   // userOptions.myLayers = ADD CODE TO save it. test it
}

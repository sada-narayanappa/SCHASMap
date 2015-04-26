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
   if ( uo !== "undefined") {
      eval(uo);
      if (typeof($uo) !== "undefined" ) {
         userOptions = $uo
         console.log( "Got USER OPTIONS");
         console.log( userOptions);
      } else {
         console.log("Could not get userOptions")
      }
   }
}
// SAVE  userOptions JSON from cookie named USER_OPTIONS
function setUserOptions(map) {
   map.zoom = userOptions.zoom;
   var cp = cPoint1(userOptions.centerLon, userOptions.centerLat)
   var lonlat = new OpenLayers.LonLat(cp.x, cp.y);
   map.setCenter(lonlat, map.zoom);
   console.log("Center: " + lonlat + " zoom:" + map.zoom + "\n" + map.center );
}
// SAVE  userOptions JSON from cookie named USER_OPTIONS
function saveUserOptions(map) {
   updateMapLayers(map)
   p = cPoint(map.center)
   userOptions.centerLon = p.x;
   userOptions.centerLat = p.y;
   userOptions.zoom = map.zoom;

   var uo = "var $uo = " + JSON.stringify(userOptions);
   localStorage.setItem("userOptions", uo);
   console.log("User options: " + uo + "\n" + map.center);
}

// Get All Map Layers and save it in the userOptions
function updateMapLayers(map) {
   // userOptions.myLayers = ADD CODE TO save it. test it
}

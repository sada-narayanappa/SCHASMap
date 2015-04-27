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
   console.log("called setUserOptions");
   //map.zoom = userOptions.zoom;
   var cp = cPoint1(userOptions.centerLon, userOptions.centerLat)
   var lonlat = new OpenLayers.LonLat(cp.x, cp.y);
   map.setCenter(lonlat, userOptions.zoom);
   setMapLayers(map)
   console.log("Center: " + lonlat + " zoom:" + map.zoom + "\n" + map.center );

}
function setMapLayers(map) {

   for( i= 0;i<userOptions.myLayers.length;i++) {
     // console.log("layers available in  useroptions are "+userOptions.myLayers[i]);
      for ( j = 0; j < map.layers.length; j++) {
         if (map.layers[j].name == userOptions.myLayers[i]) {
            map.layers[j].visibility = true;
            //console.log("visible map layer"+map.layers[j].name);
         }
      }
   }
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
//   console.log("User options: " + uo + "\n" + map.center);

}

// Get All Map Layers and save it in the userOptions
function updateMapLayers(map) {
   userOptions.myLayers=[];
   for( i= 0, j=0;i<map.layers.length;i++) {
      if(map.layers[i].visibility){
         userOptions.myLayers[j]=map.layers[i].name;
         console.log("layers saved to useroptions are "+userOptions.myLayers[j]);
         j++;
      }
   }

}

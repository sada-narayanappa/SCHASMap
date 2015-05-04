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
   //printAllMapLayers(map);
   //printBaseLayers(map)
   for ( j=0;  j < map.layers.length; j++) {
      map.layers[j].setVisibility(false);
   }

   for( i= 0;i<userOptions.myLayers.length;i++) {
   for ( j=0;  j < map.layers.length; j++) {
         if (userOptions.myLayers[i]==map.layers[j].name) {

            if( map.layers[j].isBaseLayer){
               map.baseLayer= map.layers[j]; // set Base layer explicit
              // console.log("set base map layer"+map.layers[j].name);
            }
            map.layers[j].setVisibility(true);

            //console.log("visible map layer"+map.layers[j].name);
            break;
         }
      }
   }
   //printVisibleMapLayers(map);
   printBaseLayers(map);
}

// SAVE  userOptions JSON from cookie named USER_OPTIONS
function saveUserOptions(map) {
   console.log("called saveUserOptions");
   /*printAllMapLayers(map);
   printVisibleMapLayers(map);
   printInVisibleMapLayers(map);*/
   printBaseLayers(map)
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
         //console.log("layers saved to useroptions are "+userOptions.myLayers[j]);
         j++;
      }
   }
   //printUserOptonsLayers();
}

/* HELPER FUNCTIONS FOR DEBUGGING */

function printVisibleMapLayers(map) {
   console.log("******************* Visible Visible Map layers are :******************")
   for (i = 0; i < map.layers.length; i++) {
      if (map.layers[i].visibility) {
         console.log(  map.layers[i].name)
      }
   }
   console.log("******************* End of visible Map layers *****************")
}
function printInVisibleMapLayers(map) {
   console.log("-----------------Invisible  Map layers are :--------------");
   for (i = 0; i < map.layers.length; i++) {
      if (!map.layers[i].visibility) {
         console.log(  map.layers[i].name)
      }
   }
   console.log("----------------End of Invisible Map layers----------------------");
}

function printAllMapLayers(map) {
   console.log(" &&&&&&&&&&&&&&&&&&&&&&&&& All the map layers are &&&&&&&&&&&&&&&&&&&& :")
   for (i = 0; i < map.layers.length; i++) {
         console.log(  map.layers[i].name)
   }
   console.log("&&&&&&&&&&&&&&&&&&&&&&&&& end of all  Map layers are &&&&&&&&&&&&&&&&&&&&");
}
function printUserOptonsLayers() {
   console.log(" !!!!!!!!!!!!!!!!!!!!!!!! User selected layers are !!!!!!!!!!!!!!!!!!!!!!!! :");
   for( i= 0;i<userOptions.myLayers.length;i++) {
      console.log(userOptions.myLayers[i]);
      }
   console.log("!!!!!!!!!!!!!!!!!!!  end of user selected layers !!!!!!!!!!!!!!!!!!!!!!!!");
   }
function printBaseLayers(map) {
   console.log(" ??????????- Printing base layers????????? :")
   //console.log("** No of layers"+map.getNumLayers());
   for (i = 0; i < map.layers.length; i++) {
      if (map.layers[i].isBaseLayer) {
         console.log(map.layers[i].name)
         if (map.layers[i].visibility) {
            console.log("** visibile Base layer is  **" + map.layers[i].name+" and layer index is "+map.getLayerIndex(map.layers[i]));
         }
      }
   }
   console.log("???????????????? End of Base Layer ????????????????????????????????????? ");
}
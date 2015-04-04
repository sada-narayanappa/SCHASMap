var stationLayer
var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
var DB_URL= "http://www.geospaces.org/aura/webroot/db.jsp?api_key=test&";
var PROXY = "../cgi-bin/proxy.py?url=";

function AddStationLayer(map) {
   stationLayer =  new OpenLayers.Layer.Vector( "Weather Stations");
   map.addLayer(stationLayer);

   stationLayerUpdate()
   stationLayer.events.register("visibilitychanged", stationLayer, function(evt) {
      if ( stationLayer.getVisibility() ) {
         stationLayerUpdate()
      }
   })
   map.events.register('moveend', map, function() {
      //stationLayerUpdate()
   });
   stationLayer.setVisibility(true);
   return stationLayer;
}
function radius() {
   radius = (layer.map.zoom < 9) ? 2 : 3;
   return radius;
}

function addPoint(lon, lat, layer, attr, label ) {
   if (layer.map.zoom < 10) {
      label = "";
   }
   radius = (layer.map.zoom < 9) ? 2 : 3;
   sWidth = (layer.map.zoom < 9) ? 0 : 1

   var point = xPoint(lon, lat);
   var marker = {
      strokeColor: "#FF0000",
      fillColor: "#0000FF",
      strokeWidth: sWidth,
      strokeDashstyle: "da}" + "shdot",
      pointRadius: radius,
      pointerEvents: "visiblePainted",
      label: label,
      fontSize: "14px",
      fontFamily: "Calibri",
      fontWeight: "",
      labelYOffset: "-4"
   };
   var pointFeature = new OpenLayers.Feature.Vector(point,null,marker);
   layer.addFeatures(pointFeature);

   return pointFeature;
}

function addFeatures(data, lyr){
   eval(data);
   var locs = $rs["rows"]

   lyr.removeAllFeatures()
   lyr.destroyFeatures();

   console.log("GOT: " + locs.length)
   for(var i=0; i<locs.length; ++i) {
      var lc = locs[i];
      var label = (locs.length > 200) ? "" : lc[2]
      var feat = addPoint(lc[0], lc[1], lyr, ""+lc , label);
   }
}

function stationLayerUpdate() {
   if (map.zoom < 0 || !stationLayer.getVisibility() ) {
      stationLayer.removeAllFeatures()
      stationLayer.destroyFeatures();
      return map.zoom
   }
   e = getMapBoundedBox(true);
   q = "select ST_X(geom) as lon, ST_Y(geom) as lat, station_id " +
       "from weather_stations where geom && ST_MakeEnvelope("+ e+") LIMIT 20000"

   var url = PROXY + DB_URL + "q=" + encodeURIComponent(q);

   console.log( PROXY + DB_URL + "q=" + (q))

   $.ajax({
      type: "GET",
      url:  url,
      timeout: 2000,
      data: 	{},
      contentType: "",
      dataType: "text",
      processdata: true,
      cache: false,
      success: function (data) {
         //somedata=data
         addFeatures(data, stationLayer)
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}



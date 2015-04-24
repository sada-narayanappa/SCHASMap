var stationLayer

function AddStationLayer(map) {
   var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
   renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

   var context = {
      getRadius: function(feature) {
         ret = (map.zoom < 9) ? 2 : 3;
         return ret;
      },
      getLabel: function(feature){
         ret = (map.zoom < 10) ? "" : feature.data.label;
         return ret;
      },
      getStrokeWidth: function(feature){
         ret = (map.zoom < 9) ? 0:1;
         return ret;
      }
   };
   var template = {
      pointRadius: "${getRadius}",
      strokeColor: "#FF0000",
      fillColor: "#0000FF",
      strokeWidth: "${getStrokeWidth}",
      strokeDashstyle: "da}" + "shdot",
      pointerEvents: "visiblePainted",
      label: "${getLabel}",
      fontSize: "12px",
      fontFamily: "Calibri",
      fontWeight: "",
      labelYOffset: "-4"
   };
   var style = new OpenLayers.Style(template, {context: context});
   var layer = new OpenLayers.Layer.Vector('Weather Stations', {
      styleMap: new OpenLayers.StyleMap(style),
      renderers: renderer
   });

   stationLayer = layer;
   map.addLayer(stationLayer);

   stationLayer.setVisibility(true);
   stationLayerUpdate()

   stationLayer.events.register("visibilitychanged", stationLayer, function(evt) {
      if ( stationLayer.getVisibility() ) {
         //stationLayerUpdate()
         map.zoomToExtent(stationLayer.getDataExtent())
      }
   })
   map.events.register('moveend', map, function() {
      //stationLayerUpdate()
   });

   return stationLayer;
}

function addFeatures(data, lyr){
   eval(data);
   var locs = $rs["rows"]

   lyr.removeAllFeatures()
   lyr.destroyFeatures();

   bounds = null;
   //console.log("GOT: " + locs.length)
   for(var i=0; i<locs.length; ++i) {
      var lc = locs[i];
      var point = xPoint(lc[0], lc[1]);
      attr=
      {
         label: lc[2]
      }
      var feat = new OpenLayers.Feature.Vector(point,attr);
      lyr.addFeatures(feat);
      if (!bounds) {
         bounds = feat.geometry.getBounds();
      } else {
         bounds.extend(feat.geometry.getBounds());
      }
   }

   if (true) {
      var b1 = map.calculateBounds();
      //if (!b1.contains(bounds))
      {
         map.zoomToExtent(bounds);
      }
   }
}

function stationLayerUpdate() {
   var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
   var DB_URL= "http://www.geospaces.org/aura/webroot/db.jsp?api_key=test&";
   var PROXY = "../cgi-bin/proxy.py?url=";

   //if (map.zoom < 0 || !stationLayer.getVisibility() ) {
   //   stationLayer.removeAllFeatures()
   //   stationLayer.destroyFeatures();
   //   return map.zoom
   //}
   var e = getMapBoundedBox(true);
   var q = "select ST_X(geom) as lon, ST_Y(geom) as lat, station_id " +
       "from weather_stations where geom && ST_MakeEnvelope("+ e+") LIMIT 1000"

   q = "select ST_X(geom) as lon, ST_Y(geom) as lat, station_id " +
   "from weather_stations WHERE is_interested=TRUE and state='MN'"

   var url = PROXY + DB_URL + "q=" + encodeURIComponent(q);

   //console.log( PROXY + DB_URL + "q=" + (q))

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



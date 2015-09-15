var syntheticStationLayer

function AddSyntheticStationLayer(map) {
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
      fillColor: "#FFA500",
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
   var layer = new OpenLayers.Layer.Vector('Synthetic Stations', {
      styleMap: new OpenLayers.StyleMap(style),
      renderers: renderer
   });

   syntheticStationLayer = layer;
   map.addLayer(syntheticStationLayer);

   syntheticStationLayer.setVisibility(true);
   syntheticStationLayerUpdate()

   syntheticStationLayer.events.register("visibilitychanged", syntheticStationLayer, function(evt) {
      if ( syntheticStationLayer.getVisibility() ) {
         //syntheticStationLayerUpdate()
         map.zoomToExtent(syntheticStationLayer.getDataExtent())
      }
   })
   map.events.register('moveend', map, function() {
      //syntheticStationLayerUpdate()
   });
   
   layer.setVisibility(false);

   return syntheticStationLayer;
}

function syntheticAddFeatures(data, lyr){
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
         label: "Interp"
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

function syntheticStationLayerUpdate() {
   var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
   var DB_URL= "http://www.geospaces.org/aura/webroot/db.jsp?api_key=test&";
   var PROXY = "../cgi-bin/proxy.py?url=";

   //if (map.zoom < 0 || !syntheticStationLayer.getVisibility() ) {
   //   syntheticStationLayer.removeAllFeatures()
   //   syntheticStationLayer.destroyFeatures();
   //   return map.zoom
   //}
   var e = getMapBoundedBox(true);
   var q = "select ST_X(center_geom) as lon, ST_Y(center_geom) as lat, gid " +
       "from weather_delaunay where center_geom && ST_MakeEnvelope("+ e+") LIMIT 1000"

   q = "select ST_X(geom) as lon, ST_Y(geom) as lat " +
   "from (SELECT (ST_Dump(center_geom)).geom FROM weather_delaunay) AS foo"


   var url = PROXY + DB_URL + "q=" + encodeURIComponent(q);
   

   console.log( PROXY + DB_URL + "q=" + (q))
   var myThis = this;
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
         myThis.syntheticAddFeatures(data, syntheticStationLayer)
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}



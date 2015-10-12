var uaestationLayer

function AddUAEStationLayer(map) {
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
   var layer = new OpenLayers.Layer.Vector('Weather Stations UAE', {
      styleMap: new OpenLayers.StyleMap(style),
      renderers: renderer
   });

   uaestationLayer = layer;
   map.addLayer(uaestationLayer);

   uaestationLayer.setVisibility(true);
   uaestationLayerUpdate()

   uaestationLayer.events.register("visibilitychanged", uaestationLayer, function(evt) {
      if ( uaestationLayer.getVisibility() ) {
         //stationLayerUpdate()
         map.zoomToExtent(uaestationLayer.getDataExtent())
      }
   })
   map.events.register('moveend', map, function() {
      //stationLayerUpdate()
   });

   return uaestationLayer;
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

function uaestationLayerUpdate() {
   var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
   var DB_URL= "http://www.geospaces.org/aura/webroot/db.jsp?api_key=test&";
   var PROXY = "../cgi-bin/proxy.py?url=";

   //if (map.zoom < 0 || !stationLayer.getVisibility() ) {
   //   stationLayer.removeAllFeatures()
   //   stationLayer.destroyFeatures();
   //   return map.zoom
   //}
   var e = getMapBoundedBox(true);
   var q = "select ST_X(T1.geom) as lon, ST_Y(T1.geom) as lat, T1.station_id " +
       "from weather_stations T1 INNER JOIN weatherae T2 ON (T1.station_id = T2.station_id) where T1.geom && ST_MakeEnvelope("+ e+") LIMIT 1000"

   q = "select  T1.lon as lon, T1.lat as lat, T1.station_id " +
   "from weather_stationsae T1 INNER JOIN weatherae T2 ON (T1.station_id = T2.station_id) WHERE T1.is_interested=TRUE "

   

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
         addFeatures(data, uaestationLayer)
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}



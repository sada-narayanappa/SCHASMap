var stationLayerVoronoi = function(){
}

stationLayerVoronoi.prototype.layer    = null;
stationLayerVoronoi.prototype.features = null;
stationLayerVoronoi.prototype.map      = null;
stationLayerVoronoi.prototype.bounds   = null;

stationLayerVoronoi.prototype.AddLayer = function(map) {
   this.map = map;
   var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
   renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

   var context = {
      getRadius: function(feature) {
         ret = (map.zoom < 9) ? 2 : 3;
         return ret;
      },
      getLabel: function(feature){
         ret = (map.zoom > 10) ? "" : feature.data.temp_f;
         return ret; //(feature.data.isValid) ? "": "INVALID";;
      },
      getStrokeWidth: function(feature){
         ret = (map.zoom < 9) ? 0:1;
         return ret;
      },
      FillColor: function(feature) {
         c = ["green", "#FFE4C4", "#DEB887",,"#DAA520", "#CD853F",  "#A0522D", "#B22222", "yellow","pink" ];
         r = Math.floor(Math.random() * c.length);

         //return (feature.data.isValid) ? c[r]: "red";
         return c[r];
      }
   };
   var template = {
      pointRadius: "${getRadius}",
      strokeColor: "#000000",
      fillColor: "${FillColor}",
      fillOpacity: 0.4,
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
   var layer = new OpenLayers.Layer.Vector('Weather Sta Voronoi', {
      styleMap: new OpenLayers.StyleMap(style),
      renderers: renderer
   });

   this.layer = layer;
   map.addLayer(layer);

   this.LayerUpdate()

   layer.events.register("visibilitychanged", stationLayer, function(evt) {
      if ( layer.getVisibility() ) {
         //this.LayerUpdate()
      }
   })
   map.events.register('moveend', map, function() {
      //this.LayerUpdate()
   });
   layer.setVisibility(true);

   return layer;
}

stationLayerVoronoi.prototype.AddFeatures = function (data){
   lyr = this.layer;
   eval(data);
   var locs = $rs["rows"]

   lyr.removeAllFeatures()
   lyr.destroyFeatures();

   bounds = null;
   //console.log("GOT: " + locs.length)
   for(var i=0; i<locs.length; ++i) {
      var lc = locs[i];
      eval("var $rss= " + eval(lc[0]));
      if ( !$rss.coordinates||$rss.coordinates[0].length <=0|| $rss.coordinates[0][0].length<=0) {
         return
      }
      var f1 = $rss.coordinates[0][0]
      var points = [];
      for (j=0; j < f1.length; j++) {
         var p = xPoint(f1[j][0], f1[j][1]);
         points.push(p);
      }
      var ring = new OpenLayers.Geometry.LinearRing(points);
      var polygon = new OpenLayers.Geometry.Polygon([ring]);

      attr=
      {
         label:   lc[1],
         isValid: (""+lc[2]).startsWith('f') ? false: true,
         temp_f: lc[3],
         weather: lc[4]
      }
      var feat = new OpenLayers.Feature.Vector(polygon,attr);
      lyr.addFeatures(feat);
      if (!bounds) {
         bounds = feat.geometry.getBounds();
      } else {
         bounds.extend(feat.geometry.getBounds());
      }
   }

   if (true) {
      var b1 = map.calculateBounds();
      //if (!b1.contains(bounds)) {
         map.zoomToExtent(bounds);
      //}
   }
}

stationLayerVoronoi.prototype.LayerUpdate = function() {
   var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
   var DB_URL= "http://www.geospaces.org/aura/webroot/db.jsp?api_key=test&";
   var PROXY = "../cgi-bin/proxy.py?url=";

   e = getMapBoundedBox(true);
   q = "select ST_X(geom) as lon, ST_Y(geom) as lat, station_id " +
       "from weather_stations where geom && ST_MakeEnvelope("+ e+") LIMIT 1000"

   q = "select concat('''',ST_AsGeoJSON(voronoi_geom), '''') as geom, a.station_id ,is_valid, temp_f,  weather_json, DATE(time_gmt) as dt " +
   "from weather_stations a,  weather b WHERE is_interested=TRUE and a.station_id = b.station_id and " +
           " DATE(time_gmt) = (select DATE(max(time_gmt)) from weather) "

   var url = PROXY + DB_URL + "q=" + encodeURIComponent(q);

   console.log( PROXY + DB_URL + "q=" + (q))

   myThis = this;
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
         console.log(data)
         myThis.AddFeatures(data)
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}



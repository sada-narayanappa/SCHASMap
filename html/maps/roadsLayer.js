var roadsLayer = function(){
}

roadsLayer.prototype.layer    = null;
roadsLayer.prototype.features = null;
roadsLayer.prototype.map      = null;
roadsLayer.prototype.bounds   = null;

roadsLayer.prototype.AddLayer = function(map) {
   $self = this;
   this.map = map;
   var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
   renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

   var context = {
      getRadius: function(feature) {
         ret = (map.zoom < 9) ? 2 : 3;
         return ret;
      },
      getLabel: function(feature){
         ret = ""; //(map.zoom < 9) ? "" : feature.data.temp_f;
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
      llabel: "${getLabel}",
      fontSize: "12px",
      fontFamily: "Calibri",
      fontWeight: "",
      labelYOffset: "-4"
   };
   var style = new OpenLayers.Style(template, {context: context});
   var layer = new OpenLayers.Layer.Vector('Roads Network', {
      styleMap: new OpenLayers.StyleMap(style),
      renderers: renderer
   });

   this.layer = layer;
   map.addLayer(layer);

   this.LayerUpdate()

   layer.events.register("visibilitychanged", layer, function(evt) {
      if ( layer.getVisibility() ) {
        //$self.LayerUpdate()
         globalLayer = layer;
         map.zoomToExtent(layer.getDataExtent())
      }
   })
   map.events.register('moveend', map, function() {
      //$self.LayerUpdate()
   });
   layer.setVisibility(true);

   return layer;
}

roadsLayer.prototype.AddFeatures = function (data, zoomToBounds){
   lyr = this.layer;
   eval(data);
   var locs = $rs["rows"]

   lyr.removeAllFeatures()
   lyr.destroyFeatures();

   var bounds = null;
   //console.log("GOT: " + locs.length)
   for(var i=0; i<locs.length; ++i) {
      var lc = locs[i];
      eval("var $rss= " + eval(lc[0]));
      if ( !$rss.coordinates||$rss.coordinates[0].length <=0|| $rss.coordinates[0][0].length<=0) {
         return
      }
      var f1 = $rss.coordinates[0]
      var points = [];
      for (j=0; j < f1.length; j++) {
         var p = xPoint(f1[j][0], f1[j][1]);
         points.push(p);
      }
      //var ring = new OpenLayers.Geometry.LinearRing(points);
      var line = new OpenLayers.Geometry.LineString(points);
      //var polygon = new OpenLayers.Geometry.Polygon([ring]);

      var attr=
      {
         label:   lc[1],
         oneway: lc[3],
         type: lc[2],
         speed: lc[6]
      }
      //var feat = new OpenLayers.Feature.Vector(polygon,attr);
      var feat = new OpenLayers.Feature.Vector(line,attr);
      lyr.addFeatures(feat);
      if (!bounds) {
         bounds = feat.geometry.getBounds();
      } else {
         bounds.extend(feat.geometry.getBounds());
      }
   }

   if (lyr.getVisibility() && locs.length >0) {
      var b1 = map.calculateBounds();
      if (!b1.contains(bounds)) {
         //map.zoomToExtent(bounds);
      }
   }
   return bounds;
}

roadsLayer.prototype.LayerUpdate = function() {

   var LIMIT = "LIMIT 7000"
   if ( map.zoom >= 130)
      LIMIT = ""

   var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
   var DB_URL= "http://www.geospaces.org/aura/webroot/db.jsp?api_key=test&";
   var PROXY = "../cgi-bin/proxy.py?url=";

   var e = getMapBoundedBox(true);
   var q = "select ST_X(geom) as lon, ST_Y(geom) as lat, station_id " +
       "from weather_stations where geom && ST_MakeEnvelope("+ e+") LIMIT 1000"

   var TYPES = "and type in ('residential', 'road', 'tertiary')";
   var NTYPES = ('footway', 'road')
   q = "SELECT concat('''',ST_AsGeoJSON(geom), '''') as geom, name, type, oneway, bridge, tunnel, maxspeed " +
       "FROM roads  "+
       "WHERE geom && ST_MakeEnvelope("+ e+")  and is_interested=TRUE " + LIMIT;

   q = "SELECT concat('''',ST_AsGeoJSON(geom), '''') as geom, name, type, oneway, bridge, tunnel, maxspeed " +
   "FROM roads  "+
   "WHERE is_interested=TRUE " + " " + LIMIT;

   var url = PROXY + DB_URL + "q=" + encodeURIComponent(q);

   console.log( PROXY + DB_URL + "q=" + (q) + " \n\ne= where geom && ST_MakeEnvelope(" + e + ")")

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
         //console.log(data)
         myThis.AddFeatures(data, true)
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}



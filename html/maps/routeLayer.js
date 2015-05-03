var routeLayer = function(){
   var instance = null;
   var start = null;
   var end   = null;
   var route   = null;
}

var layer = null;
routeLayer.prototype.layer    = null;
routeLayer.prototype.features = null;
routeLayer.prototype.map      = null;
routeLayer.prototype.bounds   = null;

routeLayer.clear = function(map) {
   routeLayer.start  = null;
   routeLayer.end    = null;
   routeLayer.route  = null;
   routeLayer.canAddStartPoint = false;
   routeLayer.canAddEndPoint = false

   var lyr = routeLayer.instance.layer;
   lyr.removeAllFeatures()
   lyr.destroyFeatures();
}



routeLayer.prototype.AddLayer = function(map) {
   if ( routeLayer.instance != null ) {
      alert ("Routes Layer Already instantiated")
      return;
   }
   routeLayer.instance = this;

   $self = this;
   this.map = map;
   var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
   renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

   var context = {
      getRadius: function(feature) {
         ret = 10; //(map.zoom < 9) ? 2 : 3;
         return ret;
      },
      getLabel: function(feature){
         ret = "LABEL"; //(map.zoom < 9) ? "" : feature.data.temp_f;
         return ret; //(feature.data.isValid) ? "": "INVALID";;
      },
      getStrokeWidth: function(feature){
         ret = 2; //(map.zoom < 9) ? 0:1;
         return ret;
      },
      FillColor: function(feature) {
         r = "green";
         return r;
      }
   };
   var template = {
      pointRadius: "${getRadius}",
      strokeColor: "purple",
      fillColor: "blue", //${fillcolor}",
      fillOpacity: 0.4,
      strokeWidth: "8",
      strokeDashstyle: "da}" + "shdot",
      pointerEvents: "visiblePainted",
      label: "${label}",
      fontSize: "12px",
      fontFamily: "Calibri",
      fontWeight: "",
      labelYOffset: "-4"
   };
   var style = new OpenLayers.Style(template, {context: context});
   layer = new OpenLayers.Layer.Vector('Routing Layer', {
      styleMap: new OpenLayers.StyleMap(style),
      renderers: renderer
   });

   this.layer = layer;
   map.addLayer(layer);

   routeLayer.start = routeLayer.MakePointFeature(-93.2130,45.0259,"START", "green" );
   routeLayer.end   = routeLayer.MakePointFeature(-93.20599423828163,45.0206,"END", "red" );
   layer.addFeatures([routeLayer.start, routeLayer.end]);
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


   console.log("ROUTE " + routeLayer.start + " " + routeLayer.end );
   return layer;
}

routeLayer.getCanAddStartPoint = function() {
	return routeLayer.canAddStartPoint;	
}

routeLayer.getCanAddEndPoint = function() {
	return routeLayer.canAddEndPoint;
}

routeLayer.setCanAddStartPoint = function(canAddStart){
	//alert("Can now add start point")
	routeLayer.canAddStartPoint	= canAddStart;
	routeLayer.canAddEndPoint = false;
}

routeLayer.setCanAddEndPoint = function(canAddEnd){
	//alert("Can now add end point")
	routeLayer.canAddEndPoint	= canAddEnd;
	routeLayer.canAddStartPoint = false;
}

function routeLayerVisible(){
	//console.log("Layer Visible: ", layer.getVisibility())
	return layer.getVisibility();
}

routeLayer.AddStartPoint = function(lon,lat) {
	layer.removeFeatures(routeLayer.start);
	routeLayer.start = routeLayer.MakePointFeature(lon,lat,"START", "green" );
   layer.addFeatures([routeLayer.start]);
   LayerUpdate()
}

routeLayer.AddEndPoint = function(lon,lat) {
	layer.removeFeatures(routeLayer.end);	
   routeLayer.end   = routeLayer.MakePointFeature(lon,lat,"END", "red" );
   layer.addFeatures([routeLayer.end]);
   LayerUpdate()
}

routeLayer.MakePointFeature = function (lon_4326, lat_4326, label, color) {
   var point = xPoint(lon_4326, lat_4326);
   var pointFeature = new OpenLayers.Feature.Vector(point);

   pointFeature.attributes = {
      fillcolor:  color,
      label: label
   };

   return pointFeature;
}

routeLayer.centerFeatures = function() {
   var lonLat = map.getCenter();
   routeLayer.start.geometry.x = lonLat.lon;
   routeLayer.start.geometry.y = lonLat.lat;
   routeLayer.end.geometry.x = lonLat.lon;
   routeLayer.end.geometry.y = lonLat.lat;

   routeLayer.instance.layer.drawFeature(routeLayer.start);
   routeLayer.instance.layer.drawFeature(routeLayer.end);
   //requestSnapPointFeature(pointFeature);
}

routeLayer.prototype.AddFeatures = function (data, zoomToBounds){
   lyr = this.layer;
   eval(data);
   var locs = $rs["rows"]

   lyr.removeAllFeatures()
   lyr.destroyFeatures();

   var bounds = null;
   //console.log("GOT: " + locs.length)
   for(var i=0; i<locs.length; ++i) {
      var lc = locs[i];
      $rss = JSON.parse(lc[4]);

      if ( !$rss.coordinates||$rss.coordinates[0].length <=0|| $rss.coordinates[0][0].length<=0) {
         return
      }
      var f1;
      if ( $rss.type.startsWith("Multi") ) {
         f1 = $rss.coordinates[0]
      }  else {
         f1 = $rss.coordinates
      }
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
         seq:   lc[0],
         n1:    lc[1],
         n2:    lc[2],
         cost:  lc[3],
         geom:  lc[4]
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
         map.zoomToExtent(bounds);
      }
   }
   lyr.addFeatures([routeLayer.start, routeLayer.end]);

   return bounds;
}

routeLayer.prototype.LayerUpdate = function() {
   var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
   var DB_URL= "http://www.geospaces.org/aura/webroot/db.jsp?api_key=test&";
   var PROXY = "../cgi-bin/proxy.py?url=";

   var e = getMapBoundedBox(true);
   var q;

   q = "" ;

   //var url = PROXY + DB_URL + "qn=13&s=133072&t=71857" ;
   var url = PROXY + DB_URL + "qn=13&s=13001&t=71857";

   console.log(url);
   //console.log( PROXY + DB_URL + "q=" + (q) + " \n\ne= where geom && ST_MakeEnvelope(" + e + ")")

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
         console.log(data)
         myThis.AddFeatures(data, true)
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}



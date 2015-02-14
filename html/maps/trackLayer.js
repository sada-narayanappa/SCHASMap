var trackLayer
//var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
var DB_URL= "http://www.geospaces.org/aura/webroot/db.jsp?qn=1&type=js";
var PROXY = "../cgi-bin/proxy.py?url=";

function AddTrackingLayer(map) {
   trackLayer =  new OpenLayers.Layer.Vector( "User Tracks");
   map.addLayer(trackLayer);

   trackLayerUpdate(trackLayer)
   trackLayer.events.register("visibilitychanged", trackLayer, function(evt) {
      if ( trackLayer.getVisibility() ) {
         trackLayerUpdate(trackLayer)
      }
   })
   map.events.register('moveend', map, function() {
      //trackLayerUpdate(trackLayer)
   });
   trackLayer.setVisibility(false);
   trackLayer.setVisibility(true);
   return trackLayer;
}

function addPoint(lon, lat, layer, attr, label ) {
   if (layer.map.zoom < 10) {
      label = "";
   }
   radius = (layer.map.zoom < 9) ? 2 : 3;
   sWidth = (layer.map.zoom < 9) ? 0 : 1

   var point = xPoint(lon, lat);
   var marker = {
      strokeColor: "#00FF00",
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
   layer.addFeatures(pointFeature, layer);

   return pointFeature;
}

function addFeatures(data, lyr){
   eval(data);
   map = lyr.map;

   var locs = $rs["rows"]
   var cols = $rs["colnames"]

   lati = cols.indexOf("lat");
   loni = cols.indexOf("lon");

   lyr.removeAllFeatures()
   lyr.destroyFeatures();

   locs[locs.length] = locs[0];
   console.log(" : " + locs.length )
   var bounds;
   for(var i=0; i<locs.length; ++i) {
      var lc = locs[i];
      var label = (locs.length > 200) ? "" : lc[2]
      var feat = addPoint(lc[loni], lc[lati], lyr, ""+lc , label);
      if (!bounds) {
         bounds = feat.geometry.getBounds();
      } else {
         bounds.extend(feat.geometry.getBounds());
      }
   }
   var b1 = map.calculateBounds();
   if ( !b1.contains(bounds) ) {
      map.zoomToExtent(bounds);
   }
}

function trackLayerUpdate() {
   if ( !trackLayer.visibility) {
      return;
   }
   map = trackLayer.map;
   if (map.zoom < 8 || !trackLayer.getVisibility() ) {
      trackLayer.removeAllFeatures()
      trackLayer.destroyFeatures();
      return map.zoom
   }
   e = getMapBoundedBox(true);
   q = "select ST_X(the_geom) as lon, ST_Y(the_geom), city as lat from worldcities where the_geom && ST_MakeEnvelope("+ e+") LIMIT 1000"

   var url = PROXY + DB_URL + "q=" + encodeURIComponent(q);
   var url = PROXY + DB_URL ;

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
         //console.log(data)
         somedata=data
         addFeatures(data, trackLayer)
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}



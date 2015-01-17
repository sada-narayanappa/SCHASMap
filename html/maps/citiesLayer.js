/**
 * Created by snarayan on 1/16/15.
 */

var cityLayer
var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
var DB_URL= "http://www.geospaces.org/aura/webroot/future/db.jsp?api_key=test&";
var PROXY = "cgi-bin/proxy.py?url=";

function AddCityLayer(map) {
   cityLayer =  new OpenLayers.Layer.Vector( "Cities");
   map.addLayer(cityLayer);

   cityLayerUpdate()
   cityLayer.events.register("visibilitychanged", cityLayer, function(evt) {
      if ( cityLayer.getVisibility() ) {
         cityLayerUpdate()
      }
   })
   map.events.register('moveend', map, function() {
      cityLayerUpdate()
   });
   cityLayer.setVisibility(false);
   return cityLayer;
}

function addPoint(lon, lat, layer, attr, label ) {
   if (layer.map.zoom < 11) {
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
   layer.addFeatures(pointFeature);

   return pointFeature;
}

function addFeatures(data, lyr){
   eval(data);
   var locs = $rs["rows"]

   lyr.destroyFeatures();

   locs[locs.length] = locs[0];
   for(var i=0; i<locs.length; ++i) {
      var lc = locs[i];
      var feat = addPoint(lc[0], lc[1], lyr, ""+lc , lc[2]);

   }
}

function cityLayerUpdate() {
   if (map.zoom < 8 || !cityLayer.getVisibility() ) {
      cityLayer.removeAllFeatures()
      cityLayer.destroyFeatures();
      return map.zoom
   }
   e = getMapBoundedBox(true);
   q = "select ST_X(the_geom) as lon, ST_Y(the_geom), city as lat from worldcities where the_geom && ST_MakeEnvelope("+ e+") LIMIT 1000"

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
         //console.log(data)
         somedata=data
         addFeatures(data, cityLayer)
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}



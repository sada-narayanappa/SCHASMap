var trackLayer
//var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";

function AddTrackingLayer(map) {
   trackLayer =  new OpenLayers.Layer.Vector( "My Tracks");
   map.addLayer(trackLayer);

   styleMap = new OpenLayers.StyleMap({
      'default': {
         strokeColor: "#00FFFF",
         strokeWidth: 1,
         pointRadius: 3,
         pointerEvents: "visiblePainted",
         label: "${label}",
         fontSize: "14px",
         fontFamily: "Calibri",
         fontWeight: "",
         labelYOffset: "-10",
      },
      select: {
         pointRadius: 5,
         strokeColor: "#00FF00"
      }
   });

   trackLayerUpdate(trackLayer, true, styleMap);

   trackLayer.events.register("visibilitychanged", trackLayer, function(evt) {
      if ( trackLayer.getVisibility() ) {
         trackLayerUpdate(trackLayer, true)
      }
   })
   map.events.register('moveend', map, function() {
      //trackLayerUpdate(trackLayer)
   });

   trackLayer.events.on({
      'featureselected': function (evt) {
         var feature = evt.feature;
         var popup = new OpenLayers.Popup.FramedCloud("popup",
                 OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
                 null,
                 "Latitude,Longitude:" + feature.attributes.Latitude + ", " + feature.attributes.Longitude + "<br>" + "Humidity: " + feature.attributes.Humidity + "<br>" + "Temperature: " + feature.attributes.temp + "<br>" + "Speed: " + feature.attributes.Speed + "<br>" + "Date/Time: " + feature.attributes.DateTime,
                 null,
                 true,
                 null
         );
         popup.autoSize = true;
         popup.maxSize = new OpenLayers.Size(400, 800);
         popup.fixedRelativePosition = true;
         feature.popup = popup;
         map.addPopup(popup);
      },
      'featureunselected': function (evt) {
         var feature = evt.feature;
         map.removePopup(feature.popup);
         feature.popup.destroy();
         feature.popup = null;
      }
   });
//trackLayer.setVisibility(false);
   return trackLayer;
}

function trackAddPoint(lon, lat, layer, attr, label ) {
   if (layer.map.zoom < 10) {
      label = "";
   }
   radius = (layer.map.zoom < 9) ? 2 : 6;
   sWidth = (layer.map.zoom < 9) ? 0 : 2

   var point = xPoint(lon, lat);
   var marker = {
      strokeColor: "#00FFFF",
      strokeWidth: sWidth,
      strokeDashstyle: "da}" + "shdot",
      pointRadius: radius,
      pointerEvents: "visiblePainted",
      label: label,
      fontSize: "14px",
      fontFamily: "Calibri",
      fontWeight: "",
      labelYOffset: "-10"
   };

   //var pointFeature = new OpenLayers.Feature.Vector(point,null,marker);
   //layer.addFeatures(pointFeature, layer);

   var pointFeature = new OpenLayers.Feature.Vector(point);
   pointFeature.attributes = {
      label: "SADA",
      Longitude: -1 * lon,
      Latitude: lat
      //Humidity: dataArray[2],
      //temp: dataArray[1],
      //Speed: dataArray[5] + ", " + dataArray[6] + ", " + dataArray[7],
      //DateTime: dataArray[0]
   };
   layer.addFeatures([pointFeature]);

   return pointFeature;
}

function trackAddPointOld(lon, lat, layer, attr, label ) {
   if (layer.map.zoom < 10) {
      label = "";
   }
   radius = (layer.map.zoom < 9) ? 2 : 6;
   sWidth = (layer.map.zoom < 9) ? 0 : 2

   var point = xPoint(lon, lat);
   var marker = {
      strokeColor: "#00FFFF",
      strokeWidth: sWidth,
      strokeDashstyle: "da}" + "shdot",
      pointRadius: radius,
      pointerEvents: "visiblePainted",
      label: label,
      fontSize: "14px",
      fontFamily: "Calibri",
      fontWeight: "",
      labelYOffset: "-10"
   };
   var pointFeature = new OpenLayers.Feature.Vector(point,null,marker);
   layer.addFeatures(pointFeature, layer);

   return pointFeature;
}

function trackAddLine(lon, lat, layer, attr, label ) {
   if (layer.map.zoom < 10) {
      label = "";
   }
   radius = (layer.map.zoom < 9) ? 2 : 3;
   sWidth = (layer.map.zoom < 9) ? 0 : 1

   var point = xPoint(lon, lat);
   var marker = {
      strokeColor: "#FFFF00",
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

function trackAddFeatures(data, lyr, updateBounds) {
   eval(data);
   map = lyr.map;
   points = new Array();

   var locs = $rs["rows"]
   var cols = $rs["colnames"]

   lati = cols.indexOf("lat");
   loni = cols.indexOf("lon");

   lyr.removeAllFeatures()
   lyr.destroyFeatures();

   if (locs.length == 0 || lati < 0 || loni < 0) {
      return;
   }
   locs[locs.length] = locs[0];
   console.log(" : " + locs.length)
   var bounds;
   for (var i = 0; i < locs.length; ++i) {
      var lc = locs[i];
      var label = (locs.length > 2) ? lc[2].substring(14,19) : lc[2]
      var point = xPoint(lc[loni], lc[lati]);
      points.push(point);

      var feat = trackAddPoint(lc[loni], lc[lati], lyr, "" + lc, label);
      if (!bounds) {
         bounds = feat.geometry.getBounds();
      } else {
         bounds.extend(feat.geometry.getBounds());
      }
   }

   var pline = new OpenLayers.Geometry.LineString(points);
   var style = {
      strokeColor: '#0000ff',
      strokeOpacity: 0.5,
      strokeWidth: 5
   };

   var lineFeature = new OpenLayers.Feature.Vector(pline, null, style);
   lyr.addFeatures([lineFeature]);


   if (updateBounds) {
      var b1 = map.calculateBounds();
      if (!b1.contains(bounds)) {
         //map.zoomToExtent(bounds);
      }
   }
}

function trackLayerUpdate(trackLayer) {
   map = trackLayer.map;
   if (map.zoom < 8 || !trackLayer.getVisibility() ) {
      trackLayer.removeAllFeatures()
      trackLayer.destroyFeatures();
      return map.zoom
   }
   e = getMapBoundedBox(true);
   //q = "select ST_X(the_geom) as lon, ST_Y(the_geom), city as lat from worldcities where the_geom && ST_MakeEnvelope("+ e+") LIMIT 1000"
   //var url = PROXY + DB_URL + "q=" + encodeURIComponent(q);
   var TL_URL= config.WEBS + "/aura/webroot/db.jsp?qn=6&type=js";
   var url = config.PROXY + TL_URL
   var id = $.urlParam("mobile_id");
   var tm = $.urlParam("stored_at");
   var sn = $.urlParam("session_num");

   url = url+ ( (id) ? "&mobile_id="+id : "");
   url = url+ ( (tm) ? "&mobile_id="+tm : "");
   url = url+ ( (sn) ? "&session_num="+sn : "");

   console.log( url)

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
         trackAddFeatures(data, trackLayer, true)
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}



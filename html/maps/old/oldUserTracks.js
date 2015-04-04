var globalPoints = {
}

function computeDistance() {
   if ( !globalPoints.p1) {
      globalPoints.p1  = op;
      pos1 = position;
      //console.log("***** Point P1:" + position);
   } else if ( !globalPoints.p2) {
      globalPoints.p2 = op;

      p1 = globalPoints.p1;
      p2 = globalPoints.p2;

      var point1 = new OpenLayers.Geometry.Point(p1.lon, p1.lat);
      var point2 = new OpenLayers.Geometry.Point(p2.lon, p2.lat);
      dist =  point1.distanceTo(point2);
      dift = dist * 3.28084

      // My method
      pos2 = position;
      df = MyDistance(pos1.lat+"," + pos1.lon, pos2.lat+"," + pos2.lon);
      ft = df + " kms " + df * 1000 * 3.28084 + " ft"

      //console.log("***** Point P2:" + position + " Distance:" + dist + "m : " + dift + "ft " + ft);

      globalPoints.p2 = null;
      globalPoints.p1 = null;
   }

}

function userTracks() {
   var vectorLayer = new OpenLayers.Layer.Vector("User Tracks", {
      styleMap: new OpenLayers.StyleMap({
         'default': {
            strokeColor: "#00FF00",
            strokeOpacity: 1,
            strokeWidth: 2,
            fillColor: "#FF5500",
            fillOpacity: 0.5,
            pointRadius: 3,
            pointerEvents: "visiblePainted",

            // label with \n linebreaks
            //      label : "Humidity: ${Humidity}\n\nTemperature: ${temp}",

            fontColor: "${favColor}",
            fontSize: "12px",
            fontFamily: "Courier New, monospace",
            fontWeight: "bold",
            labelAlign: "${align}",
            labelXOffset: "${xOffset}",
            labelYOffset: "${yOffset}",
            labelOutlineColor: "white",
            labelOutlineWidth: 3
         },
         select: {
            pointRadius: 5,
            strokeColor: "#00FF00"
         }
      }),
      renderers: renderer
   });

   //creating a point
   //document.write("test");
   //fetch text file
   jQuery.get('environmentalData.txt', function (data) {
      //split on new lines
      var lines = data.split('\n');
      //create select
      var dropdown = $('<select>');
      var Point = -91.9181;
      //iterate over lines of file and create a option element
      for (var i = 1; i < lines.length; i++) {
         var dataArray = lines[i].split(",");

         if (dataArray[3] != " " && dataArray[4] != " ") {
            var latString = dataArray[3];
            var lonString = dataArray[4];

            if (!latString || !lonString ) {
               continue;
            }
            var latArray = latString.split(" ");
            var lonArray = lonString.split(" ");

            var lat = +latArray[0] + parseFloat(latArray[2]) / 60;
            var lon = +lonArray[0] + parseFloat(lonArray[2]) / 60;

            var point = new OpenLayers.Geometry.Point(-1 * lon, lat).transform(
                    new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984 //converting from map x,y coordinates to lonlat coordinates.
                    new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator //converting from map x,y coordinates to lonlat coordinates.
            );
            //Giving the point attributes (probably want to use points over markers because of the attributes option)
            var pointFeature = new OpenLayers.Feature.Vector(point);
            pointFeature.attributes = {
               Longitude: -1 * lon,
               Latitude: lat,
               Humidity: dataArray[2],
               temp: dataArray[1],
               Speed: dataArray[5] + ", " + dataArray[6] + ", " + dataArray[7],
               DateTime: dataArray[0]

            };

            //Point = Point + 0.0001
            vectorLayer.addFeatures([pointFeature]);
         }//for the if(dataArray[3]!=" " && dataArray[4] != " ")
      }
      //append select to page
   });

   var zoom = 14;

   var selectCtrl = new OpenLayers.Control.SelectFeature(vectorLayer,
           {
              clickout: true

           }
   );
   map.addControl(selectCtrl);
   selectCtrl.activate();

   vectorLayer.events.on({
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
         if ( feature && feature.popup) {
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
         }
      }
   });

   var layer_SCH = new OpenLayers.Layer.XYZ(
           "SCH",
           "cgi-bin/testSCH.py/${z}/${x}/${y}.png",
           {
              isBaseLayer: false,
              opacity: 0.4,
              sphericalMercator: true
           }
   );
   layer_SCH.setVisibility(false);

   return [vectorLayer, layer_SCH]

}

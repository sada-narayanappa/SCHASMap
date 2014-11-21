function init() {
        map = new OpenLayers.Map("mapdiv");
        var mapnik = new OpenLayers.Layer.OSM();
        map.addLayer(mapnik);
		
		//Code below is used for the marker object (The red marker you can see on HWY 12).
        var lonlat = new OpenLayers.LonLat(-91.9181, 44.8792).transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984 //converting from map x,y coordinates to lonlat coordinates.
            new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator //converting from map x,y coordinates to lonlat coordinates.
          );
		  
		  //Code below is used for the vectorLayer (This determines labels/colors/sizes and such for the point.
		  var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
            renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
            
            var vectorLayer = new OpenLayers.Layer.Vector("Simple Geometry", {
                styleMap: new OpenLayers.StyleMap({'default':{
                    strokeColor: "#00FF00",
                    strokeOpacity: 1,
                    strokeWidth: 3,
                    fillColor: "#FF5500",
                    fillOpacity: 0.5,
                    pointRadius: 6,
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
                }}),
                renderers: renderer
            });
				
			
		  
		  //creating a point
	//document.write("test");
    	//fetch text file
    	jQuery.get('environmentalData.txt', function(data) {
        	//split on new lines
        	var lines = data.split('\n');
        	//create select
        	var dropdown = $('<select>');
			var Point = -91.9181;
        	//iterate over lines of file and create a option element
        	for(var i=1;i<lines.length;i++) {
				var dataArray = lines[i].split(",");
			
			if(dataArray[3]!=" " && dataArray[4] != " "){
				var latString = dataArray[3];
				var lonString = dataArray[4];
				
				var latArray = latString.split(" ");
				var lonArray = lonString.split(" ");
				
				var lat = +latArray[0] + parseFloat(latArray[2])/60;
				var lon = +lonArray[0] + parseFloat(lonArray[2])/60;
				
            	var point = new OpenLayers.Geometry.Point(-1*lon, lat).transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984 //converting from map x,y coordinates to lonlat coordinates. 
            new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator //converting from map x,y coordinates to lonlat coordinates.
          );
			//Giving the point attributes (probably want to use points over markers because of the attributes option)
            	var pointFeature = new OpenLayers.Feature.Vector(point);
            pointFeature.attributes = {
				Longitude: -1*lon,
				Latitude: lat,
                Humidity: dataArray[2],
                temp: dataArray[1],
				Speed: dataArray[5]+", " +dataArray[6] + ", " + dataArray[7],
				DateTime: dataArray[0]
				
            };
			
			//Point = Point + 0.0001
			vectorLayer.addFeatures([pointFeature]); 
			}//for the if(dataArray[3]!=" " && dataArray[4] != " ")
        	} 
			
			
        	//append select to page
    	}); 
		
		/** var point = new OpenLayers.Geometry.Point(-91.9181, 44.874).transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984 //converting from map x,y coordinates to lonlat coordinates. 
            new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator //converting from map x,y coordinates to lonlat coordinates.
          );
		  var pointFeature = new OpenLayers.Feature.Vector(point);
            pointFeature.attributes = {
                Humidity: 30,
                temp: 20,
				
            };
			vectorLayer.addFeatures([pointFeature]); */
			
			
			
		
		 var zoom = 13;
		 
		var selectCtrl = new OpenLayers.Control.SelectFeature(vectorLayer,
             {clickout: true
			 
			 }
			 
        );
        map.addControl(selectCtrl);
		selectCtrl.activate();
		
		vectorLayer.events.on({
		'featureselected':function(evt){
            var feature = evt.feature;
            var popup = new OpenLayers.Popup.FramedCloud("popup",
                OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
                null,
                "Latitude,Longitude:"+feature.attributes.Latitude+", " + feature.attributes.Longitude+"<br>"+"Humidity: " + feature.attributes.Humidity+"<br>"+"Temperature: "+feature.attributes.temp +"<br>"+"Speed: "+feature.attributes.Speed+"<br>"+"Date/Time: "+feature.attributes.DateTime,
                null,
                true,
                null
            );
            popup.autoSize = true;
            popup.maxSize = new OpenLayers.Size(400,800);
            popup.fixedRelativePosition = true;
            feature.popup = popup;
            map.addPopup(popup);
        },
        'featureunselected':function(evt){
            var feature = evt.feature;
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        }
	  });
	  
	  var layerSwitch = new OpenLayers.Control.LayerSwitcher({
    		div: OpenLayers.Util.getElement('layerswitcher')
		});
		map.addControl(layerSwitch)

		layerSwitch = map.getControlsByClass("OpenLayers.Control.LayerSwitcher")[0];
		layerSwitch.dataLbl.innerText = "Layers"
	  
		//adds the vector layer (which allows for adding points)
		map.addLayer(vectorLayer);

		//sets the center to the lonlat variable(which is on menomonie now) and zoom to zoom variable
        map.setCenter(lonlat, zoom);
       
		
      }
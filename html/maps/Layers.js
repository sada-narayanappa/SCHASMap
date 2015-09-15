//Event listener for clicks
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
	defaultHandlerOptions: {
		'single': true,
		'double': false,
		'pixelTolerance': 0,
		'stopSingle': false,
		'stopDouble': false
	},

	initialize: function(options) {
		this.handlerOptions = OpenLayers.Util.extend(
			{}, this.defaultHandlerOptions
		);
		OpenLayers.Control.prototype.initialize.apply(
			this, arguments
		); 
		this.handler = new OpenLayers.Handler.Click(
			this, {
                 'click': this.trigger,
                 'rightclick': this.rightClick,

			}, this.handlerOptions
		);
	},
   rightClick: function(e) {
     console.log("Right Click");
   },

	trigger: function(e) {
		var lonlat = map.getLonLatFromPixel(e.xy).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
		var lat = lonlat.lat;
		var lon = lonlat.lon;
		if(syntheticLayerVisible()){			
			if(confirm("Would you like to add a synthetic data point at " + lonlat.lat + ", " + lonlat.lon +"?")==true)
			{
				var now = new Date().getTime();
				now = Math.floor(now/1000);
				var measuredAt = prompt("Please enter the measured at date:", now );
				var recordType = "SyntheticData";
				var sessionNum = prompt("Please enter the Session:", "1");
				var mobileID = "Synthetic";
				var user_ID = "SyntheticUser";				
				addSyntheticData(measuredAt,recordType,sessionNum,mobileID,user_ID,lat,lon)
			}
		}
		if(routeLayerVisible() && (routeLayer.getCanAddStartPoint() || routeLayer.getCanAddEndPoint())){
			if(routeLayer.getCanAddStartPoint()){
				routeLayer.setCanAddStartPoint(false);
				routeLayer.AddStartPoint(lon,lat);
			}
			else if(routeLayer.getCanAddEndPoint()){
				routeLayer.setCanAddEndPoint(false);
				routeLayer.AddEndPoint(lon,lat);
			}
		}
      if(possibleRoutesLayerVisible() && (possibleRoutesLayer.getCanAddStartPoint() || possibleRoutesLayer.getCanAddEndPoint())){
			if(possibleRoutesLayer.getCanAddStartPoint()){
				possibleRoutesLayer.setCanAddStartPoint(false);
				possibleRoutesLayer.AddStartPoint(lon,lat);
			}
			else if(possibleRoutesLayer.getCanAddEndPoint()){
				possibleRoutesLayer.setCanAddEndPoint(false);
				possibleRoutesLayer.AddEndPoint(lon,lat);
			}
		}
	}
});

//Constructing the maps
var map;
var globalLayer;
function init() {
   //For entering address data
   OpenLayers.ProxyHost = "../cgi-bin/proxy.py?url=";

   map = new OpenLayers.Map( {div: "mapdiv", units: 'm'});   
   var mapnik = new OpenLayers.Layer.OSM();
   mapnik.opacity = 0.5;  // Make background transparent


   map.addLayer(mapnik);
   glayers= [
      new OpenLayers.Layer.Google( "Google Streets", {numZoomLevels: 20}),
      new OpenLayers.Layer.Google("Google Physical", {type: google.maps.MapTypeId.TERRAIN} ),
      new OpenLayers.Layer.Google("Google Hybrid", {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}),
      new OpenLayers.Layer.Google("Google Satellite", {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22})
   ];

   for ( i in glayers) {
      map.addLayer(glayers[i]);
   }

   map.events.register("click", map , function(e){
      var position = this.events.getMousePosition(e);
      var p = map.getLonLatFromPixel(position);
      position = p.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));
      position.lat = Number(position.lat);
      position.lon = Number(position.lon);
   });
	
	
	var click = new OpenLayers.Control.Click();
	map.addControl(click);
	click.activate();

	//BELOW: Map Mouse Position
	map.addControl(
                new OpenLayers.Control.MousePosition({
					      autoActivate: false,
                     prefix:        'coordinates: ',
                     separator:     ' | ',
                     numDigits:     2,
					      projection:    'EPSG:4326',
                     emptyString:   'Mouse is not over map.'
                })
            );
            map.events.register("mousemove", map, function(e) {
               var position = this.events.getMousePosition(e);

               position = map.getLonLatFromPixel(position).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
				   position.lat = Number(position.lat).toFixed(4);
				   position.lon = Number(position.lon).toFixed(4);
               OpenLayers.Util.getElement("coords").innerHTML = position;
            });

   //Code below is used for the vectorLayer (This determines labels/colors/sizes and such for the point.
   var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
   renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;


   var layerSwitch = new OpenLayers.Control.LayerSwitcher({
      div: OpenLayers.Util.getElement('layerswitcher')
   });
   map.addControl(layerSwitch)

   layerSwitch = map.getControlsByClass("OpenLayers.Control.LayerSwitcher")[0];
   layerSwitch.dataLbl.innerText = "Layers"

   var layer_cloud = new OpenLayers.Layer.XYZ(
           "Clouds",
           "http://${s}.tile.openweathermap.org/map/clouds/${z}/${x}/${y}.png",
           {
              isBaseLayer: false,
              opacity: 0.7,
              sphericalMercator: true
           }
   );

   var layer_precipitation = new OpenLayers.Layer.XYZ(
           "Precipitation",
           "http://${s}.tile.openweathermap.org/map/precipitation/${z}/${x}/${y}.png",
           {
              isBaseLayer: false,
              opacity: 0.7,
              sphericalMercator: true
           }
   );

   var layer_temperature = new OpenLayers.Layer.XYZ(
           "Temperature",
           "http://${s}.tile.openweathermap.org/map/temp/${z}/${x}/${y}.png",
           {
              isBaseLayer: false,
              opacity: 0.4,
              sphericalMercator: true
           }
   );

   layer_precipitation.setVisibility(false);
   layer_cloud.setVisibility(false);
   layer_temperature.setVisibility(false);

   map.addLayers([mapnik, layer_precipitation, layer_cloud, layer_temperature]);
   //Code below is used for the marker object (The red marker you can see on HWY 12).
   var lonlat = new OpenLayers.LonLat(-91.9181, 44.8792).transform(
           new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984 //converting from map x,y coordinates to lonlat coordinates.
           new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator //converting from map x,y coordinates to lonlat coordinates.
   );
   //
   map.setCenter(lonlat, 10);

   AddCityLayer(map);
   AddTrackingLayer(map);
   AddSyntheticLayer(map);
   AddStationLayer(map);
   //AddSyntheticStationLayer(map);
   var stv = new stationLayerVoronoi().AddLayer(map);
   var std = new stationLayerDelaunay().AddLayer(map);
   var roads = new roadsLayer(map).AddLayer(map);
   var route = new routeLayer(map).AddLayer(map);
   var routes = new possibleRoutesLayer(map).AddLayer(map);

}//end Init() function

function submitform() {
   var queryString = document.forms[0].query.value;
   OpenLayers.Request.POST({
      url: "http://www.openrouteservice.org/php/OpenLSLUS_Geocode.php",
      scope: this,
      failure: this.requestFailure,
      success: this.requestSuccess,
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      data: "FreeFormAdress=" + encodeURIComponent(queryString) + "&MaxResponse=1"
   });
}//end submitform()
function requestSuccess(response) {
   var format = new OpenLayers.Format.XLS();
   var output = format.read(response.responseXML);
   if (output.responseLists[0]) {
      var geometry = output.responseLists[0].features[0].geometry;
      var foundPosition = new OpenLayers.LonLat(geometry.x, geometry.y).transform(
              new OpenLayers.Projection("EPSG:4326"),
              map.getProjectionObject()
      );
      map.setCenter(foundPosition, 16);
   } else {
      alert("Sorry, no address found");
   }
}//end requestSuccess()
function requestFailure(response) {
   alert("An error occurred while communicating with the OpenLS service.");
}//end requestFailure()


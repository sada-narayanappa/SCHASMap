var possibleRoutesLayer = function(){
   var instance = null;
   var start = null;
   var end   = null;
   var route   = null;
   
}

var possrouteslayer = null;
var possstartLon = -93.2130;
var possstartLat = 45.0259;
var posssourceid = 1;
var possendLon = -93.2181;
var possendLat = 45.0242;
var posstargetid = 1;
var possRoutesLayerAjax = [];
var probabilities = [];
var color1 = "blue, fuchsia, green, #800000, #99CCFF , maroon, navy, olive, orange,purple, red, #7ACC29, purple, #660033";
var colors = color1.split(",");
var totalMiles = [];

possibleRoutesLayer.prototype.layer    = null;
possibleRoutesLayer.prototype.features = null;
possibleRoutesLayer.prototype.map      = null;
possibleRoutesLayer.prototype.bounds   = null;

possibleRoutesLayer.clear = function(map) {
   possibleRoutesLayer.start  = null;
   possibleRoutesLayer.end    = null;
   possibleRoutesLayer.route  = null;   
   possibleRoutesLayer.canAddStartPoint = false;
   possibleRoutesLayer.canAddEndPoint = false;
   

   var lyr = possibleRoutesLayer.instance.layer;
   lyr.removeAllFeatures();
   lyr.destroyFeatures();
}

possibleRoutesLayer.prototype.AddLayer = function(map) {
   if ( possibleRoutesLayer.instance != null ) {
      alert ("Possible Routes Layer Already instantiated")
      return;
   }
   possibleRoutesLayer.instance = this;

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
         if ( feature.attributes.fillcolor) {
            r = feature.attributes.fillcolor;
         }
         return r;
      },
      StrokeColor: function(feature) {
         var idx = feature.attributes.routeNum;
         r = "black"
         if ( idx != undefined )
            r =  colors[idx];
         return r;
      }
   };
   var template = {
      pointRadius: "${getRadius}",
      strokeColor: "${StrokeColor}",
      fillColor: "${FillColor}",
      fillOpacity: 0.4,
      strokeWidth: "4",
      strokeDashstyle: "da}" + "shdot",
      pointerEvents: "visiblePainted",
      label: "${label}",
      fontSize: "10px",
      fontFamily: "Calibri",
      fontWeight: "",
      labelYOffset: "-4"
   };
   var style = new OpenLayers.Style(template, {context: context});
   possrouteslayer = new OpenLayers.Layer.Vector('Possible Routes Layer', {
      styleMap: new OpenLayers.StyleMap(style),
      renderers: renderer
   });

   this.possrouteslayer = possrouteslayer;
   map.addLayer(possrouteslayer);

   possibleRoutesLayer.start = possibleRoutesLayer.MakePointFeature(possstartLon,possstartLat,"S", "yellow" );
   possibleRoutesLayer.end   = possibleRoutesLayer.MakePointFeature(possendLon,possendLat,"T", "cyan" );
   this.getSourceNodeID();
   this.getTargetNodeID();

   possrouteslayer.addFeatures([possibleRoutesLayer.start, possibleRoutesLayer.end]);

   possrouteslayer.events.register("visibilitychanged", possrouteslayer, function(evt) {
      if ( possrouteslayer.getVisibility() ) {
        //$self.LayerUpdate()
         globalLayer = possrouteslayer;
         map.zoomToExtent(possrouteslayer.getDataExtent())
      }
      else
      {
          possibleRoutesLayer.prototype.removePopups();
      }
   })
   map.events.register('moveend', map, function() {
      //$self.LayerUpdate()
   });
   possrouteslayer.setVisibility(true);
   //console.log("ROUTE " + routeLayer.start + " " + routeLayer.end );
   setTimeout(possibleRoutesLayer.prototype.LayerUpdate,2000);
   return possrouteslayer;
}

possibleRoutesLayer.getCanAddStartPoint = function() {
	return possibleRoutesLayer.canAddStartPoint;	
}

possibleRoutesLayer.getCanAddEndPoint = function() {
	return possibleRoutesLayer.canAddEndPoint;
}

possibleRoutesLayer.setCanAddStartPoint = function(canAddStart){
	//alert("Can now add start point")
	possibleRoutesLayer.canAddStartPoint	= canAddStart;
	possibleRoutesLayer.canAddEndPoint = false;
}

possibleRoutesLayer.setCanAddEndPoint = function(canAddEnd){
	//alert("Can now add end point")
	possibleRoutesLayer.canAddEndPoint	= canAddEnd;
	possibleRoutesLayer.canAddStartPoint = false;
}

function possibleRoutesLayerVisible(){
	//console.log("Layer Visible: ", layer.getVisibility())
	return possrouteslayer.getVisibility();
}

possibleRoutesLayer.AddStartPoint = function(lon,lat) {
	possrouteslayer.removeFeatures(possibleRoutesLayer.start);
	possstartLon = lon;
	possstartLat = lat;
	possibleRoutesLayer.start = possibleRoutesLayer.MakePointFeature(lon,lat,"S", "green" );
   possrouteslayer.addFeatures([possibleRoutesLayer.start]);
   possibleRoutesLayer.instance.getSourceNodeID();
   //routeLayer.prototype.LayerUpdate();
}

possibleRoutesLayer.AddEndPoint = function(lon,lat) {
	possrouteslayer.removeFeatures(possibleRoutesLayer.end);	
	possendLon = lon;
	possendLat = lat;
   possibleRoutesLayer.end   = possibleRoutesLayer.MakePointFeature(lon,lat,"T", "red" );
   possrouteslayer.addFeatures([possibleRoutesLayer.end]);
   possibleRoutesLayer.instance.getTargetNodeID();
   //routeLayer.prototype.LayerUpdate();
}

possibleRoutesLayer.MakePointFeature = function (lon_4326, lat_4326, label, color) {
   var point = xPoint(lon_4326, lat_4326);
   var pointFeature = new OpenLayers.Feature.Vector(point);

   pointFeature.attributes = {
      fillcolor:  color,
      label: label
   };

   return pointFeature;
}

possibleRoutesLayer.centerFeatures = function() {
   var lonLat = map.getCenter();
   possibleRoutesLayer.start.geometry.x = lonLat.lon;
   possibleRoutesLayer.start.geometry.y = lonLat.lat;
   possibleRoutesLayer.end.geometry.x = lonLat.lon;
   possibleRoutesLayer.end.geometry.y = lonLat.lat;

   possibleRoutesLayer.instance.layer.drawFeature(possibleRoutesLayer.start);
   possibleRoutesLayer.instance.layer.drawFeature(possibleRoutesLayer.end);
   //requestSnapPointFeature(pointFeature);
}

possibleRoutesLayer.prototype.getSourceNodeID = function() {
   var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
   var DB_URL= config.WEBS + "/aura/webroot/db.jsp?api_key=test&";
   var PROXY = "../cgi-bin/proxy.py?url=";

   var url = PROXY + DB_URL + "qn=12&lon="+possstartLon+"&lat="+ possstartLat;
   //console.log(url);

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
         eval(data);
		 posssourceid = $rs["rows"][0];
		 //console.log(sourceid);
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}

possibleRoutesLayer.prototype.getTargetNodeID = function() {
   var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
   var DB_URL= config.WEBS + "/aura/webroot/db.jsp?api_key=test&";
   var PROXY = "../cgi-bin/proxy.py?url=";
   

   var e = getMapBoundedBox(true);
   var q;

   q = "" ;

   //var url = PROXY + DB_URL + "qn=13&s=133072&t=71857" ;
   var url = PROXY + DB_URL + "qn=12&lon="+possendLon+"&lat="+ possendLat;

   //console.log(url);
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
         //console.log(data)
         eval(data);
		 posstargetid = $rs["rows"][0];
		 //console.log(targetid);
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}

possibleRoutesLayer.prototype.removePopups = function() {
    while( map.popups.length ) {
         map.removePopup(map.popups[0]);
    }
}

possibleRoutesLayer.prototype.AddFeatures = function (data, zoomToBounds){
   lyr = possrouteslayer;
   eval(data);
   var locs = $rs["rows"]
   
   var color1 = "blue, fuchsia, green, #800000, #99CCFF , maroon, navy, olive, orange,purple, red, #7ACC29, purple, #660033"
   var colors = color1.split(",");
   
   probabilities = [];
   totalMiles = [];
   var edgesInRoute = [];
   var overallTotalMiles = 0;
   
   for(var i=0; i<locs.length; ++i){
       
       var locEntry = locs[i];
       edgesInRoute[locEntry[1]] = edgesInRoute[locEntry[1]] || 0;
       edgesInRoute[locEntry[1]]=parseFloat(edgesInRoute[locEntry[1]])+1;
       totalMiles[locEntry[1]] = totalMiles[locEntry[1]] || 0;
       totalMiles[locEntry[1]] = parseFloat(totalMiles[locEntry[1]]) + parseFloat((locEntry[4]*.000621371));
       overallTotalMiles = overallTotalMiles + parseFloat((locEntry[4]*.000621371));
   }
   
   var evenPercentage = parseFloat(100/totalMiles.length);
   var avgRouteLength = parseFloat(overallTotalMiles/totalMiles.length);
   var distFromAvgOfRoute = [];
   var totalAbsDistFromAvg = 0;
   
   if(totalMiles.length===1){
       probabilities[0]=100;
   }
   else{
       for(var i = 0; i<totalMiles.length;i++){
           totalAbsDistFromAvg = totalAbsDistFromAvg + Math.abs(avgRouteLength - totalMiles[i])           
           distFromAvgOfRoute[i] = avgRouteLength - totalMiles[i];
       }
       for(var i = 0; i<totalMiles.length;i++){
           var percDiff = 1+parseFloat(distFromAvgOfRoute[i]/totalAbsDistFromAvg); // distFromAvgOfRoute[i]/avgroute and totalAbsDistFromAvg/totalAverage(totalMiles.length*avgRouteLength)
           //console.log("Even Percent: "+ evenPercentage);
           //console.log("Percent Diff: "+ percDiff)
           //console.log("Total Distance from Average: "+totalAbsDistFromAvg);
           //console.log("Route Distance From Average: "+distFromAvgOfRoute[i]);           
           probabilities[i] = parseFloat(evenPercentage*percDiff);
       }
   }
   
   
   possibleRoutesLayer.prototype.removePopups();
   lyr.removeAllFeatures();
   lyr.destroyFeatures();

   var bounds = null;
   //console.log("GOT: " + locs.length)
   var currentSeq = -1;
   var currentRoute = -1;
   for(var i=0; i<locs.length; ++i) {
      
      
       
      var lc = locs[i];
      
      if(currentRoute != lc[1]){
          currentSeq = 0;
          currentRoute = lc[1];
      }
      
      var middle = false;
      //check to see if current entry is the middle of a route (to display total miles popup)      
      //console.log(edgesInRoute[lc[1]]);
      //console.log(edgesInRoute[lc[1]]/2);
      //console.log(Math.floor(edgesInRoute[lc[1]]/2));
      if(currentSeq === Math.floor(edgesInRoute[lc[1]]/2)){
          middle = true; 
          //console.log("Found middle:" + i);
      }
      
      $rss = JSON.parse(lc[5]);

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
      
      labl = (lc[4]*.000621371).toPrecision(3);//convert from meters to miles
      possibleRoutesLayer.prototype.StoreRoutes(lc[0],lc[1],lc[2],lc[3],lc[4],lc[5],posssourceid,posstargetid);
      
      var attr=
      {
         seq:   lc[0],
         routeNum: lc[1],
         n1:    lc[2],
         n2:    lc[3],
         cost:  lc[4],
         geom:  lc[5],
         label: labl
      }
      //var feat = new OpenLayers.Feature.Vector(polygon,attr);
      var feat = new OpenLayers.Feature.Vector(line,attr);
      
      if(middle && possibleRoutesLayerVisible()){
          var precisionDigElement = document.getElementById("precisionDig");
          var precisionDig = precisionDigElement.value;
          
      var popup = new OpenLayers.Popup("Total Miles",
                 OpenLayers.LonLat.fromString(feat.geometry.getCentroid(true).toShortString()),
                 null,
                 "Total Miles: " + totalMiles[lc[1]].toPrecision(precisionDig) + "<br>Probability: " + probabilities[lc[1]].toPrecision(4) +"%", // + feature.attributes.Latitude + ", " + feature.attributes.Longitude + "<br>" + "Humidity: " + feature.attributes.Humidity + "<br>" + "Temperature: " + feature.attributes.temp + "<br>" + "Speed: " + feature.attributes.Speed + "<br>" + "Date/Time: " + feature.attributes.DateTime,
                 null,
                 true,
                 null
         );
         popup.autoSize = true;
         popup.maxSize = new OpenLayers.Size(400, 800);
         popup.fixedRelativePosition = true;  
         popup.border = "2px solid "+colors[lc[1]];
         feat.popup = popup;
         map.addPopup(popup);
     }
      lyr.addFeatures(feat);
      if (!bounds) {
         bounds = feat.geometry.getBounds();
      } else {
         bounds.extend(feat.geometry.getBounds());
      }
      
      currentSeq = currentSeq + 1;
   }
   
   

   if (lyr.getVisibility() && locs.length >0) {
      var b1 = map.calculateBounds();
      if (!b1.contains(bounds)) {
         map.zoomToExtent(bounds);
      }
   }
   lyr.addFeatures([possibleRoutesLayer.start, possibleRoutesLayer.end]);
   return bounds;
}

possibleRoutesLayer.analyzeRoute = function(){
    console.log("TODO: Analyze route based on SCHASDB request");
    var precisionDigElement = document.getElementById("precisionDig");
    var precisionDig = precisionDigElement.value;
    document.getElementById("ResultsSection").style.display = "block";
    document.getElementById("ResultsParagraph").innerHTML = "";
    
    var routeNumbers = [];
    var stations = [];
    var lengths = [];
   
    
    //get Intersection
    var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
    var DB_URL= config.WEBS + "/aura/webroot/db.jsp?api_key=test&";
    var PROXY = "../cgi-bin/proxy.py?url=";
    var numRoutesElement = document.getElementById("numRoutes");
    var numRoutes = numRoutesElement.value;
    
    var url = PROXY + DB_URL + "qn=24&s="+ posssourceid  +"&t="+posstargetid+"&k="+numRoutes;
    console.log(url);
    
    var myThis = this;
    var ajaxReq = $.ajax({
       type: "GET",
       url:  url,
       timeout: 60000,
       data: 	{},
       contentType: "",
       async: false,
       dataType: "text",
       processdata: true,
       cache: false,
       success: function (data) {
          data = data.trim();
          //console.log(data)
          eval(data);
          var locs = $rs["rows"]
          for(var i=0; i<locs.length; ++i){
            var locEntry = locs[i];
            routeNumbers[i] = locEntry[3];
            console.log("RouteNumber = "+ locEntry[3]);
            stations[i] = locEntry[2];
            console.log("StationID = "+ locEntry[2]);
            lengths[i] = locEntry[1];
            console.log("length = "+ locEntry[1]);
          }
       },
       error: function(xhr, stat, err) {
          console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
       }
    });
    
    
    var routeStationString = [];
    var uniqueStations = [];
    var lengthWithProbs = [];
    var lengthWithEvenProbs = [];
    
    for(var i = 0; i < routeNumbers.length;i++){
        routeStationString[routeNumbers[i]] = routeStationString[routeNumbers[i]] || "";
        routeStationString[routeNumbers[i]] = routeStationString[routeNumbers[i]]+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Length in station " + stations[i]+": " + lengths[i].toPrecision(precisionDig) + "<br>";
        console.log("Route String: " + routeStationString[routeNumbers[i]]);
        if(uniqueStations.indexOf(stations[i])==-1){
            uniqueStations.push(stations[i]);
        }
    }
    for(var i = 0; i < routeNumbers.length;i++){
        var stationPos = uniqueStations.indexOf(stations[i]);
        lengthWithProbs[stationPos] = lengthWithProbs[stationPos] || 0;
        lengthWithProbs[stationPos] = lengthWithProbs[stationPos] + probabilities[routeNumbers[i]]*.01*lengths[i].toPrecision(precisionDig);
        lengthWithEvenProbs[stationPos] = lengthWithEvenProbs[stationPos] || 0;
        lengthWithEvenProbs[stationPos] = lengthWithEvenProbs[stationPos] + (1/numRoutes)*lengths[i].toPrecision(precisionDig);
    }
    
    document.getElementById("ResultsParagraph").innerHTML = "<b> DATA </b> <br>"+"----------------------------------------------------------------<br>";
    for(var i = 0; i< probabilities.length;i++){
    document.getElementById("ResultsParagraph").innerHTML = document.getElementById("ResultsParagraph").innerHTML 
            + "<b>Route "+ i +"</b> <br>" 
            + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Color: " +"<span style=\"color:"+ colors[i] +";font-weight:bold;\">"+ colors[i]+"</span> <br>" 
            + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Probability: " + probabilities[i].toPrecision(4) +"%<br>"
            + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Total length: " + totalMiles[i].toPrecision(precisionDig) +"<br>"
            + routeStationString[i]
            +"----------------------------------------------------------------<br>"; 
    
    //console.log("Route " + i +" finished." )
    }
    document.getElementById("ResultsParagraph").innerHTML = document.getElementById("ResultsParagraph").innerHTML +  "<b> ESTIMATES WITH EVEN PROBABILITIES </b> <br>"    
    for(var i = 0; i < uniqueStations.length; i++ ){
        document.getElementById("ResultsParagraph").innerHTML = document.getElementById("ResultsParagraph").innerHTML 
            + "Estimated length in "+ uniqueStations[i] +": "+ lengthWithEvenProbs[i].toPrecision(precisionDig)+"<br>"; 
    }
    document.getElementById("ResultsParagraph").innerHTML = document.getElementById("ResultsParagraph").innerHTML +"----------------------------------------------------------------<br>" +  "<b> ESTIMATES WITH LENGTH SPECIFIC PROBABILITIES </b> <br>"    
    for(var i = 0; i < uniqueStations.length; i++ ){
        document.getElementById("ResultsParagraph").innerHTML = document.getElementById("ResultsParagraph").innerHTML 
            + "Estimated length in "+ uniqueStations[i] +": "+ lengthWithProbs[i].toPrecision(precisionDig)+"<br>"; 
    }
    
}

possibleRoutesLayer.prototype.CancelButton = function() {
    document.getElementById("computeButton").value = "Compute Route";
    document.getElementById("loading").style.visibility = "hidden";
    for(var i = possRoutesLayerAjax.length-1; i > 0  ; i--){
        var ajaxReq = possRoutesLayerAjax[i];
        ajaxReq.abort();
        possRoutesLayerAjax.pop();
        //console.log("Removed an Ajax Request")
    }
        
}

possibleRoutesLayer.prototype.StoreRoutes = function(seq, route, node, edge, routecost, st_asgeojson) {
   var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
   var DB_URL= config.WEBS + "/aura/webroot/db.jsp?api_key=test&";
   var PROXY = "../cgi-bin/proxy.py?url=";
   
   var url = PROXY + DB_URL + "qn=23&seq="+seq + "&route="+route+"&node="+node+"&edge="+edge+"&rc="+routecost+"&st_asgeojson="+st_asgeojson+"&sourcenode="+posssourceid+"&targetnode="+posstargetid; ;
   //console.log(url);
   
   var myThis = this;
   var ajaxReq = $.ajax({
      type: "GET",
      url:  url,
      timeout: 60000,
      data: 	{},
      contentType: "",
      dataType: "text",
      processdata: true,
      cache: false,
      success: function (data) {          
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
    
}

possibleRoutesLayer.prototype.LayerUpdate = function() {
   var startTime = Date.now();
   if(document.getElementById("computeButton").value === "Cancel"){       
       possibleRoutesLayer.prototype.CancelButton();
       return;
   }
   document.getElementById("loading").style.visibility = "visible";
   document.getElementById("computeButton").value = "Cancel";
   var DB_URL= "http://localhost:8080/aura1/future/db.jsp?api_key=test&";
   var DB_URL= config.WEBS + "/aura/webroot/db.jsp?api_key=test&";
   var PROXY = "../cgi-bin/proxy.py?url=";

   var e = getMapBoundedBox(true);
   var q;
   
   var numRoutesElement = document.getElementById("numRoutes");
   var numRoutes = numRoutesElement.value;
   //numRoutes = 1; //Replace the selected number of routes with 1 for now until drawing is capable of handling multiple routes
   //console.log("number of routes selected" + numRoutes);
   
   //var url = PROXY + DB_URL + "qn=13&s=133072&t=71857" ;
   if (posssourceid == 1 ) {
      possibleRoutesLayer.prototype.getSourceNodeID();
      possibleRoutesLayer.prototype.getTargetNodeID();
   }

   var url = PROXY + DB_URL + "qn=21&s="+ posssourceid  +"&t="+posstargetid+"&k="+numRoutes;

   //console.log(url);
   //console.log( PROXY + DB_URL + "q=" + (q) + " \n\ne= where geom && ST_MakeEnvelope(" + e + ")")

   var myThis = this;
   var ajaxReq = $.ajax({
      type: "GET",
      url:  url,
      timeout: 60000,
      data: 	{},
      contentType: "",
      dataType: "text",
      processdata: true,
      cache: false,
      success: function (data) {
         data = data.trim();
         //console.log(data)
         var endTime = Date.now();
         var elapsedSeconds = (endTime - startTime);         
         document.getElementById("elapsedTime").innerHTML = "Calculation Time: " + elapsedSeconds.toString() + " Milliseconds";
         document.getElementById("computeButton").value = "Compute Route";
         document.getElementById("loading").style.visibility = "hidden";
         possibleRoutesLayer.prototype.AddFeatures(data, true)         
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
   possRoutesLayerAjax.push(ajaxReq);
}



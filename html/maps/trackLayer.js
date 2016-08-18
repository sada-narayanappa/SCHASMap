trackLayer = {
   layer:   null,
   map:     null,
   DB_URL:  "http://localhost:8080/aura1/future/db.jsp?api_key=test&",
   last:    ""
};

STYLEsm = new OpenLayers.StyleMap({
   'default': {
      strokeColor: "${strokecolor}",
      fillColor:  "${fillcolor}",
      strokeWidth: "${strokeWidth}",
      pointRadius: 5,
      pointerEvents: "visiblePainted",
      label: "${label}",
      fontSize: "14px",
      fontFamily: "Calibri",
      fontWeight: "",
      labelYOffset: "-10",
      externalGraphic: "${externalGraphic}",
      graphicZIndex: 3, 
      graphicHeight: "${graphicHeight}",
      graphicWidth: "${graphicWidth}"
   },
   select: {
      pointRadius: 12,
      strokeColor: "#FF0000",
      color: "#0000FF",
      strokeWidth: 2,
      graphicHeight: "${graphicHeightSelected}",
      graphicWidth: "${graphicWidthSelected}"
   }
});

function AddTrackingLayer(map) {
   renderer       = OpenLayers.Util.getParameters(window.location.href).renderer;
   renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

   trackLayer.map = map;
   layer =  new OpenLayers.Layer.Vector( "My Tracks",
                     {  styleMap:   STYLEsm,
                        rendererOptions: { zIndexing: true },
                        renderers:  renderer
                     });
   map.addLayer(layer);
   trackLayer.layer = layer;

   //trackLayerUpdate(); This line seems to be adding all tracks the tracks to the layer despite some users not having permission to view all. Removing for now.

   layer.events.register("visibilitychanged", layer, function(evt) {
      if ( layer.getVisibility() ) {
         //trackLayerUpdate()
         map.zoomToExtent(layer.getDataExtent())
      }
   })
   map.events.register('moveend', map, function() {
      //trackLayerUpdate()
   });

   var highlightCtrl = new OpenLayers.Control.SelectFeature(layer, {
      highlightOnly:  true,
      hover:          true,
      eventListeners: {
          featurehighlighted: function (evt) {
               //var position = this.events.getMousePosition(e);
               //var p = map.getLonLatFromPixel(position);

               var feature = evt.feature;
               //console.log("SELECTED: " + feature);
               obj = (feature.attributes && feature.attributes.obj) || null;
               if ( !obj)
                  return;
               //var popup = new OpenLayers.Popup.FramedCloud("popup",

               //str = (feature.geometry.toShortString) ? feature.geometry.toShortString() :
               var popup = new OpenLayers.Popup("INFO",
                       OpenLayers.LonLat.fromString(feature.geometry.getCentroid(true).toShortString()),
                       null,
                       getPop(obj), // + feature.attributes.Latitude + ", " + feature.attributes.Longitude + "<br>" + "Humidity: " + feature.attributes.Humidity + "<br>" + "Temperature: " + feature.attributes.temp + "<br>" + "Speed: " + feature.attributes.Speed + "<br>" + "Date/Time: " + feature.attributes.DateTime,
                       null,
                       true,
                       null
               );
               popup.autoSize = true;
               popup.maxSize = new OpenLayers.Size(400, 800);
               popup.fixedRelativePosition = true;
               /**popup.events.on({
                  'onmouseout': function(popevt){
                      console.log('Mouse Out');
                      var popfeat = popevt.feature;
                      map.removePopup(popfeat);
                      popfeat.destroy();
                      popfeat = null;
                  } 
               }); */
               feature.popup = popup;
               map.addPopup(popup);
          },
          featureunhighlighted: function (evt) {
                var feature = evt.feature;
                //console.log("UNSELECTED: " + feature)
                if ( feature && feature.popup) {
                   map.removePopup(feature.popup);
                   feature.popup.destroy();
                   feature.popup = null; 
                }
            }      
      }
   });
   var selectCtrl = new OpenLayers.Control.SelectFeature(layer, {
      highlightOnly:  false,
      hover:          false,
      clickout:       true
   });   
   
   map.addControl(highlightCtrl);
   map.addControl(selectCtrl);
   highlightCtrl.activate();
   selectCtrl.activate();

   layer.events.on({
      'featureselected': function (evt) {
          
         var position = this.events.getMousePosition(e);
         var p = map.getLonLatFromPixel(position);

         var feature = evt.feature;
         
         if (feature.popup) {
                   map.removePopup(feature.popup);
                   feature.popup.destroy();
                   feature.popup = null; 
         }
         //console.log("SELECTED: " + feature);
         obj = (feature.attributes && feature.attributes.obj) || null;
         if ( !obj)
            return;
         //var popup = new OpenLayers.Popup.FramedCloud("popup",

         //str = (feature.geometry.toShortString) ? feature.geometry.toShortString() :
         var popup = new OpenLayers.Popup("INFO",
                 OpenLayers.LonLat.fromString(feature.geometry.getCentroid(true).toShortString()),
                 null,
                 getPop(obj), // + feature.attributes.Latitude + ", " + feature.attributes.Longitude + "<br>" + "Humidity: " + feature.attributes.Humidity + "<br>" + "Temperature: " + feature.attributes.temp + "<br>" + "Speed: " + feature.attributes.Speed + "<br>" + "Date/Time: " + feature.attributes.DateTime,
                 null,
                 true,
                 null
         );
         popup.autoSize = true;
         popup.maxSize = new OpenLayers.Size(400, 800);
         popup.fixedRelativePosition = true;
         /**popup.events.on({
            'onmouseout': function(popevt){
                console.log('Mouse Out');
                var popfeat = popevt.feature;
                map.removePopup(popfeat);
                popfeat.destroy();
                popfeat = null;
            } 
         }); */
         feature.popup = popup;
         map.addPopup(popup);
      },
      'featureunselected': function (evt) {
         var feature = evt.feature;
         //console.log("UNSELECTED: " + feature)
         if ( feature && feature.popup) {
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
         }
      }
   });

   trackLayer.ctrlDragFeature = new OpenLayers.Control.DragFeature(layer);
   map.addControl(trackLayer.ctrlDragFeature);
   trackLayer.ctrlDragFeature.onComplete = "console.log('Completed')"
   trackLayer.ctrlDragFeature.deactivate();

   layer.setVisibility(true);
   return layer;
}

function setTrackLayerVisibility(bool){
    trackLayer.layer.setVisibility(bool);
}

function MarkValid(id, measured_at, mobile_id) {
    //Function to manualy mark points as valid points.
    var TL_URL= config.WEBS + "/aura/webroot/db.jsp?qn=42";
    var url = config.PROXY + TL_URL
    url = url+ "&pid="+id;
    

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
          clearAllMapPopups();
          trackMarkValidByID(id)
       },
       error: function(xhr, stat, err) {
          console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
       }
    });//ajax
    
    var TL_URL= config.WEBS + "/aura/webroot/db.jsp?qn=44";
    var url = config.PROXY + TL_URL
    url = url+ "&pid="+id;

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
          clearAllMapPopups();
          trackMarkValidByID(id)
       },
       error: function(xhr, stat, err) {
          console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
       }
    });//ajax
    
    $.ajax({
         type: "GET",
         url: config.PROXY + config.WEBS + "/aura/webroot/db.jsp?cmd=reload",
         contentType: "application/text; charset=utf-8",                   
         error: function(XMLHttpRequest, textStatus, errorThrown) {
             console.log("Data table error: " + XMLHttpRequest+ textStatus+ errorThrown)
         }, 
         success: function(data){

         } // success
     }); // ajax
}

function RemoveThisFeature(id, measured_at, mobile_id) {
//function RemoveThisFeature(id) {
   console.log("Will remove feature: " + id);

   var TL_URL= config.WEBS + "/aura/webroot/db.jsp?qn=8";
   var url = config.PROXY + TL_URL
   url = url+ "&pid="+id;

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
         data = data.replace(/(\r\n|\n|\r)/gm, "");
         console.log(data);
         //alert("Deleted: " + data)
         //trackLayerUpdate(CURRENT_PARMS, false,document.getElementById("invalidCheckbox").checked)
         //location.reload();
         clearAllMapPopups();
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });//ajax
    var TL_URL= config.WEBS + "/aura/webroot/db.jsp?qn=43";
    var url = config.PROXY + TL_URL
    url = url+ "&pid="+id;
    

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
          clearAllMapPopups();
       },
       error: function(xhr, stat, err) {
          console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
       }
    });//ajax
   $.ajax({
        type: "GET",
        url: config.PROXY + config.WEBS + "/aura/webroot/db.jsp?cmd=reload",
        contentType: "application/text; charset=utf-8",                   
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("Data table error: " + XMLHttpRequest+ textStatus+ errorThrown)
        }, 
        success: function(data){
            //trackRemoveFeatureByMobIDAndMeasuredAt(mobile_id, measured_at);
            //var parstring = "mobile_id="+ mobile_id + "&measured_at=" + measured_at;
            //trackLayerUpdate(parstring, true, document.getElementById("invalidCheckbox").checked);
        } // success
    }); // ajax
    if(!document.getElementById("invalidCheckbox").checked){
        trackRemoveFeatureByID(id);
    }else {
        trackMarkInvalidByID(id);
    }
}

function LT(t, lon) {
    t = t+ "+00:00";
    d = new Date(t.toString().split(' ').join('T'))
    if ( isNaN(lon) ) {
      return "NAn:" + lon + " " + t;
   }
   dir = ( lon < 0 ) ? -1 : 1;
   m = dir * Math.round(Math.abs(lon)/15);
    nt = d.getTime();
    nt=nt+ (m * 60 * 60 * 1000)
   dt = new Date(nt);
   return dt.toISOString().replace("T"," ").substr(0,20);
}

function getPop(o) {   
   obj = o;
   var localDate = new Date(o.measured_at.toString().split('.')[0].replace(/-/g, '/'));
   localDate.setHours(localDate.getHours() + o.gmtOffset)
   var bck = (o.id > 0) ? "#9FDAEE" : "lightgreen"
   str = "<div style='background-color: " + bck + " '>" +
         "<table>" +
         "<tr><td>ID :        </td><td>" + o.id                   + "</td></tr>" +
         "<tr><td>Accuracy    </td><td>" + o.accuracy             + "</td></tr>" +
         "<tr><td>Mobile_id:  </td><td>" + o.mobile_id            + "</td></tr>" +
         "<tr><td>Lon:        </td><td>" + o.lon                  + "</td></tr>" +
         "<tr><td>Lat:        </td><td>" + o.lat                  + "</td></tr>" +
         "<tr><td>AT GMT:     </td><td>" + o.measured_at          + "</td></tr>" +
         "<tr><td>AT MST:     </td><td>" + o.mst                  + "</td></tr>" +
         "<tr><td>AT LOCAL:   </td><td>" + localDate.toString().split("GMT")[0] + "</td></tr>" +
       //modified by jihadaj on 16 March 2015
         "<tr><td>SPEED     </td><td>" + Math.round(((o.speed)*2.24) * 100) / 100  + "Mph" + "</td></tr>" +
         "<tr><td>Temperature </td><td>" + o.temperature_min      + "</td></tr>" +
         "<tr><td>Humidity    </td><td>" + o.humidity             + "</td></tr>" +
         "<tr><td>Distance    </td><td>" + o.dist  + "m"          + "</td></tr>" +
         "<tr><td>Marked Validity:    </td><td>" + o.markedvalidity            + "</td></tr>" +
         "<tr><td>Predicted Validity:     </td><td>" + o.predictedvalidity           + "</td></tr>" +
         "</table>" +
         "<input type=button value='Mark Invalid' onclick=\"RemoveThisFeature(\'"+ o.id +"\',\'"+o.measured_at+"\',\'"+o.mobile_id+"\')\" ><br>" +         
         "<input type=button value='Mark Valid' onclick=\"MarkValid(\'"+ o.id +"\',\'"+o.measured_at+"\',\'"+o.mobile_id+"\')\" ><br>" +
         "</div>"

         //"<input type=button value='Remove this' onclick=RemoveThisFeature( "+ o.id +","+o.measured_at+","+o.mobile_id+" )><br>" +
   return str;  
}
colors = " blue, fuchsia, green, #800000, #99CCFF , maroon, navy, olive, orange,purple, red, #7ACC29, purple, #660033"
colors = colors.split(",");
for ( c in colors ) {
   colors[c] = colors[c].trim();
}
function getColor(o) {
   var h = Math.abs((""+o).hashCode());
   //console.log("***** HASH ****" + h);
   var idx = ( h - 1) % colors.length;
   return colors[idx];
}

function getLineStyle(speed){
    if(speed<4){
        return "dot";
    } if(speed<6){
      return "dashdot";
    } if(speed<10){
      return "dash";
    }
    else{
        return "solid";
    }
}

function getExternalGraphic(record_type){    
    if(record_type=="MILD_ATTACK"){        
        return "./mildAttack.png";
    } if(record_type=="MEDIUM_ATTACK"){        
      return "./mediumAttack.png";
    } if(record_type=="SEVERE_ATTACK"){
      return "./severeAttack.png";
    } if(record_type=="INHALER" || record_type=="peakflow"){
      return "./inhaler.png";
    }
    else{
        return "";
    }
}

function trackAddPoint(lon, lat, layer, obj, label, ii, record_type, is_valid ) {
   if (layer.map.zoom < 10) {
      label = "";
   }
   radius = (layer.map.zoom < 9) ? 2 : 6;
   sWidth = (layer.map.zoom < 9) ? 0 : 2

   var point = xPoint(lon, lat);
   
   var pointFeature = new OpenLayers.Feature.Vector(point);
   
   var stkcolor = "black";
   if(obj.predictedvalidity == "1"){
        stkcolor= "green";
   }else if (obj.predictedvalidity == "2"){
       stkcolor= "yellow";
   }
   
   var fcolor = "white";
   if(obj.markedvalidity == "1"){
        fcolor= "green";
   }else if (obj.markedvalidity == "2"){
       fcolor= "yellow";
   }

   pointFeature.attributes = {
      label: label,
      obj:  obj,
      mobile_id:  obj.mobile_id,
      //fillcolor: (ii <=0 ) ? "transparent" : getColor(obj.mobile_id),
      //fillcolor: (ii <=0 ) ? "white" : "white",
      fillcolor: fcolor,
      strokeWidth: (ii <=0 ) ? 5 : 2,
      strokecolor: stkcolor,
      externalGraphic: getExternalGraphic(record_type),
      graphicHeight: 20,
      graphicWidth: 20,
      graphicHeightSelected: 30,
      graphicWidthSelected: 30
      //Humidity: dataArray[2],
      //temp: dataArray[1],
      //Speed: dataArray[5] + ", " + dataArray[6] + ", " + dataArray[7],
      //DateTime: dataArray[0]
   };
   layer.addFeatures([pointFeature]);

   return pointFeature;
}

var DISTANCE = 0.0
var LASTFEATURE = null;
function distance(f) {
   if (!f || !LASTFEATURE) {
      DISTANCE =0.0
      LASTFEATURE = f;
      return;
   }
   var dist = f.geometry.distanceTo(LASTFEATURE.geometry);
   DISTANCE = DISTANCE + dist;
   LASTFEATURE = f;
   return dist;
}

function trackRemoveFeatureByID(id){    
    for(var f=0;f<trackLayer.layer.features.length;f++) {
        if(id == trackLayer.layer.features[f].attributes.obj.id || id == trackLayer.layer.features[f].attributes.obj.fid || id == trackLayer.layer.features[f].attributes.obj.bid) {
            trackLayer.layer.removeFeatures(trackLayer.layer.features[f]);
            f = f-1;            
        }
    }
}

function trackMarkValidByID(id){    
    for(var f=0;f<trackLayer.layer.features.length;f++) {
        if(id == trackLayer.layer.features[f].attributes.obj.id) {
            trackLayer.layer.features[f].attributes.fillcolor = "green";
            trackLayer.layer.features[f].attributes.markedvalidity = "1";
            trackLayer.layer.drawFeature(trackLayer.layer.features[f]);
             break;
        }
    }
}

function trackMarkInvalidByID(id){    
    for(var f=0;f<trackLayer.layer.features.length;f++) {
        if(id == trackLayer.layer.features[f].attributes.obj.id) {
            trackLayer.layer.features[f].attributes.fillcolor = "yellow";
            trackLayer.layer.features[f].attributes.markedvalidity = "2";
            trackLayer.layer.drawFeature(trackLayer.layer.features[f]);
             break;
        }
    }
}

function trackRemoveFeatureByMobIDAndMeasuredAt(mobileID, measured_at){    
    for(var f=0;f<trackLayer.layer.features.length;f++) {
        if(trackLayer.layer.features[f].attributes.obj.mobile_id == mobileID.toString() && trackLayer.layer.features[f].attributes.obj.measured_at.substring(0,10) == measured_at.toString()) {
            trackLayer.layer.removeFeatures(trackLayer.layer.features[f]);
            f = f-1;
        }
    }
}

function getGMTOffset(lon,lat){
    var gmtOffset = 0;
    $.ajax({
        type: "GET",
        url: config.PROXY + "http://api.geonames.org/timezoneJSON?lat="+lat+"&lng="+lon+"&username=schas",
        contentType: "application/text; charset=utf-8",  
        async: false,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("GeoNames getGMTOffset Error: " + XMLHttpRequest+ textStatus+ errorThrown)
        },
        success: function(data){
            gmtOffset = data.gmtOffset;
        }
    }); // ajax
    return gmtOffset;
    
}

function trackAddFeatures(data, lyr, updateBounds) {
   distance(null);
   eval(data);
   map = lyr.map;
   var points = [];
   var speeds = [];
   var timesAtGmt = [];
   var distances = [];
   var pids = []

   var locs = $rs["rows"]
   var cols = $rs["colnames"]

   var lati = cols.indexOf("lat");
   var loni = cols.indexOf("lon");
   var speedi = cols.indexOf("speed");
   var record_typei = cols.indexOf("record_type");
   var is_validi = cols.indexOf("is_valid");
   var msti = cols.indexOf("mst")
   var idi = cols.indexOf("id")

   //lyr.removeAllFeatures()
   //lyr.destroyFeatures();

   if (locs.length == 0 || lati < 0 || loni < 0) {
      return;
   }
   
   var startLon = locs[0][loni];
   var startLat = locs[0][lati];
   
   var gmtOffset = getGMTOffset(startLon,startLat);
   //console.log("GMTOffset: "+gmtOffset)
   //locs[locs.length] = locs[0];
   //console.log(" : " + locs.length)
   var bounds;
   prevObj = null;
   for (var i = 0; i < locs.length; ++i) {
      var lc = locs[i];
      obj = {};
      j = 0;
      for( c in cols) {
         obj[cols[c]] = lc[j++];
      }
      if ( !prevObj ) {
         prevObj = obj;
      }
      
      var localDate = new Date(obj.measured_at.toString().split('.')[0].replace(/-/g, '/'));
      localDate.setHours(localDate.getHours() + gmtOffset)
      
      var label = (locs.length > 2) ? localDate.toString().split(" ")[4].split(":")[0] + ":" + localDate.toString().split(" ")[4].split(":")[1] : lc[2]
      //var label = (locs.length > 2) ? lc[2].split(" ")[1].split(":")[0] + ":" + lc[2].split(" ")[1].split(":")[1] : lc[2]
      var point = xPoint(lc[loni], lc[lati]);
      points.push(point);
      speeds.push(lc[speedi]);
      timesAtGmt.push(lc[msti]);
      pids.push(lc[idi]);
      
      obj.gmtOffset = gmtOffset;

      var feat = trackAddPoint(lc[loni], lc[lati], lyr, obj, label, i,lc[record_typei],lc[is_validi]);
      if (!bounds) {
         bounds = feat.geometry.getBounds();
      } else {
         bounds.extend(feat.geometry.getBounds());
      }
      var dist = distance(feat);
      obj.dist = dist;
      distances.push(dist);
      
      

      if (  obj.mobile_id !== prevObj.mobile_id) {
         addLine(points, prevObj, lyr, speeds, timesAtGmt, distances, pids);
         points = [];
         prevObj = obj;
      }
   }
   addLine(points, obj, lyr, speeds, timesAtGmt, distances, pids);

   if (lyr.getVisibility() && updateBounds) {
      var b1 = map.calculateBounds();
      if (!b1.contains(bounds)) {
         map.zoomToExtent(bounds);
      }
   }
}

function addLine(points, obj , lyr, speeds, timesAtGmt, distances, pids) {
   if ( points.length <= 1) {
      return;
   }
   var k=0;
   while(k<points.length-1){
       
       var secondDifferences = 0;
       var date1 = Date.parse(timesAtGmt[k].toString().split('.')[0].replace(/-/g, '/'));
       var date2 = Date.parse(timesAtGmt[k+1].toString().split('.')[0].replace(/-/g, '/'));
       
       secondDifferences =  date1/1000 - date2/1000;
       //console.log('DEBUG: secondDifference: ' + secondDifferences)
       var distanceDifferences = 0;
       distanceDifferences = distances[k+1];
       
       //Only draw line if the next point is less than 1800 seconds away.
        if(secondDifferences<1800 && distanceDifferences > 100){
            var pline = new OpenLayers.Geometry.LineString(points.slice(k,k+2));
            avgSpeed = (speeds[k]+speeds[k+1])/2;
            var style = {
               strokeColor: '#0000ff',
               fillcolor:    "#ffffff",
               strokeDashstyle: getLineStyle(avgSpeed),
               strokeColor: getColor(obj.mobile_id),
               strokeOpacity: 10, //0.9,
               strokeWidth: 8,
               graphicZIndex: 0
            };

            var lineFeature = new OpenLayers.Feature.Vector(pline, null, style);

            lobj = {};
            lobj.dist = (DISTANCE/1000/1.6).toFixed(2) + " Miles";
            lobj.id = -1;
            lobj.fid = pids[k+1];
            lobj.bid = pids[k];
            lobj.measured_at = obj.measured_at;
            lobj.mobile_id = obj.mobile_id;

            lineFeature.attributes.obj = lobj;
            lyr.addFeatures([lineFeature]);
        }

        k=k+1;
        distance(null);
   }
}
var CURRENT_PARMS = "";

function trackLayerUpdate(parms,bounds,showInvalid) {
   if ( !trackLayer || !trackLayer.map || !trackLayer.layer.getVisibility() ) {
      return;
   }

   if (  trackLayer.map.zoom < 1  ) {
      trackLayer.layer.removeAllFeatures()
      trackLayer.layer.destroyFeatures();
      return trackLayer.map.zoom
   }
   map = trackLayer.map;
   e = getMapBoundedBox(true);
   //q = "select ST_X(the_geom) as lon, ST_Y(the_geom), city as lat from
   // worldcities where the_geom && ST_MakeEnvelope("+ e+") LIMIT 1000"
   //var url = PROXY + DB_URL + "q=" + encodeURIComponent(q);
   var TL_URL= config.WEBS + "/aura/webroot/db.jsp?qn=6&type=js&";
   var url = config.PROXY + TL_URL

   if(showInvalid){
       if (parms) {
           if ( parms.indexOf("session") > 0) {
              //url = url+ parms;         
              TL_URL= config.WEBS + "/aura/webroot/db.jsp?qn=6c&type=js&";
              url = config.PROXY + TL_URL
              url = url+ parms;
           } else {
              TL_URL= config.WEBS + "/aura/webroot/db.jsp?qn=6b&type=js&";
              url = config.PROXY + TL_URL
              url = url+ parms;
           }
           CURRENT_PARMS = parms;
        } else if ( $.urlAllParams()) {
           url = url+ $.urlAllParams();     
        } else {
            return;
           //url = url+ CURRENT_PARMS;
           //console.log(CURRENT_PARMS);
        }
    } else{
        if (parms) {
           if ( parms.indexOf("session") > 0) {
              url = url+ parms;         
           } else {
              TL_URL= config.WEBS + "/aura/webroot/db.jsp?qn=6a&type=js&";
              url = config.PROXY + TL_URL
              url = url+ parms;
           }
           CURRENT_PARMS = parms;
        } else if ( $.urlAllParams()) {
           url = url+ $.urlAllParams();     
        } else {
            return;
           //url = url+ CURRENT_PARMS;
           //console.log(CURRENT_PARMS);
        }
    }


   //console.log( url)

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
         somedata=data
         trackAddFeatures(data, trackLayer.layer, bounds)
      },
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}



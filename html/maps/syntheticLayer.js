var syntheticLayer

function AddSyntheticLayer(map) {         
   var layer = new OpenLayers.Layer.Vector('Synthetic Layer');
   syntheticLayer = layer;
   map.addLayer(syntheticLayer);

   syntheticLayer.setVisibility(false);  
   

   return syntheticLayer;
}

function syntheticLayerVisible(){
	return syntheticLayer.getVisibility();
}


function addSyntheticData(measuredAt,recordType,sessionNum,mobileID,user_ID,lat,lon){
	var DB_URL= "http://www.geospaces.org/aura/webroot/db.jsp?api_key=test&";
   	var PROXY = "../cgi-bin/proxy.py?url=";
	var q = "qn=2&measured_at="+measuredAt+"&record_type="+recordType+"&session_num="+sessionNum+"&mobile_id="+mobileID+"&user_id="+user_ID+"&lat="+lat+"&lon="+lon;
	var url = PROXY + DB_URL + encodeURIComponent(q);
	
	console.log( PROXY + DB_URL  + (q))
	
	$.ajax({
      type: "GET",
      url:  url,
      timeout: 2000,
      data: 	{},
      contentType: "",
      dataType: "text",
      processdata: true,
      cache: false,      
      error: function(xhr, stat, err) {
         console.log(" ERR:  " + xhr + ": " + stat + " " + err + " ]" + xhr.responseText)
      }
   });
}

gutils={};

gutils.starttm = function() {
   gutils.start_time = new Date().getTime();

}
gutils.endtm = function() {
   gutils.end_time = new Date().getTime();
   return gutils.difftm(gutils.end_time, gutils.start_time)
}
gutils.difftm = function(e, s) {
   var d = Math.abs(e -s);
   if ( d < 1000) {
      return d + " ms"
   }
   var ms = d % 1000;
   d = Math.floor(d/1000);
   if (d < 60) {
      ret = d + "." + ms + " ms"
      return ret;
   }
   var ss = d % 60;
   d = Math.floor(d/60);
   if ( d < 60) {
      ret = d + ":" + ss + "." + ms + " ms"
      return ret;
   }
   var mm = d % 60;
   d = Math.floor(d/60);
   if ( d < 12) {
      ret = d + ":" + mm + ":" + ss + "." + ms + " ms"
      return ret;
   }
   return "A big number : " + Math.abs(e -s);
}

//
// Useage:
//
// gutils.getURL("p/p.y", "url", "#form", results1, replaceNewLines, cb, cbParams)
//
gutils.getURL = function(url1, useProxy, formName, results1, replaceNewLines, cb, cbParams) {
   var purl=url1;

   if ( useProxy) {
      var proxy = (useProxy.length > 4) ? useProxy : "pys/proxy.py?";
      proxy = proxy + ( proxy.endsWith("?") ? "" : "?")
      purl=proxy+"url=" + purl;
   }
   encodeURIComponent(purl)
   form = formName || "#form"

   var values = $(form).serialize();
   var results = "#" + (results1 || "results1");

   gutils.starttm();

   $(results).html('<img src="img/spin.gif"/>')
   $.ajax({
      type: "POST",
      url: purl,
      cache: false,
      data: values,
      success: function(ret){
         var end_time = new Date().getTime();
         var d = gutils.endtm();
         var res = "Results: Round trip: "+ d+ '<br/>';

         if ( jQuery.isXMLDoc(ret) ) {
            var xml = (new XMLSerializer()).serializeToString(ret);
            res = res + "<pre>" + xml + "</pre>";
         } else if (typeof(ret) == "object" ) {
            var js = gutils.FormatJSON(ret);
            res = res + "<br/><pre>" + js + "</pre>";
         }else if (replaceNewLines) {
            res = res + ret.replace(/\n/g, "<br/>")
         } else {
            res = res + ret;
         }
         $(results).html(res);
         if ( cb ) {
            cb(res, cbParams, ret);
         } else {
            $(results).html(res);
         }
      },
      error:function(e1, e2){
         $(results).html('Error submitting form ' + e1 + " " + e2);
      }
   });
}

gutils.sortObjectByKey = function(o, arrangeByType) {
   var sorted = {};
   var key;
   var aKeys = [];
   var oaKeys = [];

   for (key in o) {
      if (arrangeByType && typeof o[key] == "object") {
         oaKeys.push(key);
      } else if (o.hasOwnProperty(key)) {
         aKeys.push(key);
      } else {
         // What is this then? Error
      }
   }
   aKeys.sort();
   var r = aKeys;
   for (key = 0; key < r.length; key++) {
      if (typeof o[r[key]] == "object") {
         sorted[r[key]] = gutils.sortObjectByKey(o[r[key]], arrangeByType);
      } else {
         sorted[r[key]] = o[r[key]];
      }
   }
   oaKeys.sort();
   r = oaKeys;
   for (key = 0; key < r.length; key++) {
      if (typeof o[r[key]] == "object") {
         sorted[r[key]] = sortObjectByKey(o[r[key]], arrangeByType);
      } else {
         sorted[r[key]] = o[r[key]];
      }
   }
   return sorted;
}
gutils.FormatJSON = function(v1, arrangeByType, removeNewLines) {
   var v2 = v1;
   var error = "";
   if (typeof v1 == "string") {
      try {
         v2 = JSON.parse(v1);
      } catch (err) {
         v2 = null
         error = err;
      }
   }
   if (!v2) {
      return "Invalid JSON: " + error;
   }
   v2 = gutils.sortObjectByKey(v2, arrangeByType);
   v3 = JSON.stringify(v2, null, (removeNewLines)? 0: 5);
   return v3;
}

//---------------------------------------------------------------------------
// Stupid JQuery convenience - I hope to remember these are here

// HTML CHeck box is checked or not
function isChecked(f) {
   var c = $("#"+f).prop("checked");
}

String.prototype.endsWith = function(suffix) {
   return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

if (typeof String.prototype.startsWith != 'function') {
   // see below for better implementation!
   String.prototype.startsWith = function (str){
      return this.indexOf(str) == 0;
   };
}
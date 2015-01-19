
function log(o) {
   console.log(o)
}
function checkHeaders() {
   if( $('#header').length ) {
      log("header exists");
   } else {
      log("Adding header exists");
      var $headerdiv = $( "<div id='header'/>");
      //$( "body" ).prepend( $headerdiv );
   }
   if( $('#footer').length ) {
      log("footer exists");
   } else {
      log("Adding footer exists");
      var $footerdiv = $( "<div id='footer'/>");
      //$( "body" ).append( $footerdiv );
   }
}

function replace(id, html) {
   $.get(html, function(data) { $(id).html(data); });
}

$(document).ready(function(){
   //checkHeaders();
   //checkHeaders();
   //getURL("../includes/include1.html",null, function(data) { $("body").prepend(data); });
   //$.get("../includes/include1.html", function(data) { $("body").append(data) ; }, false);
   //$.get("../includes/index.html"  , function(data) { $("body").prepend(data); }, false);
   //replace("#header", "../includes/include1.html")
   //replace("#footer", "../index2.html")
});
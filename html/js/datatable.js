var predefinedQueries =[
  "select * from pg_tables where schemaname not like 'information%' and schemaname not like 'pg_%'"
]

function GetDataType(t) {
   var t = t.toLowerCase();
   ret = {type: "string" , class: "center"};
   if ( t == "i" || t.indexOf("float")   >= 0 || t.indexOf("double") >= 0 ||
           t.indexOf("int")  >= 0 || t.startsWith("real") ||
           t.indexOf("long") >= 0 || t.startsWith("numeric")  ) {
      ret = {type: "number", class: "right"}
   } else if (t.indexOf("date") >= 0 || t.indexOf("time") >= 0 ) {
      ret ={ type: "datetime"}
   } else if (t.indexOf("bool") >= 0) {
      ret = {type: "boolean" , class: "center"};
   }
   return ret;
}
function setDataFromJSON(text, divName) {
   divName = divName  || setDataFromJSON.results ;
   text = text.trim();
   if ( !text.startsWith("$") && !text.startsWith("var") ) {
      text = "$rs="+text;
   }
   console.log("==>" + divName);
   console.log(text);
   eval(text);
   var cols = $rs.colnames;
   var type = $rs.coltypes;
   var data = $rs.rows || $rs[Object.keys($rs)[0]];

   var colNames = []
   var colTypes = []
   for (c in cols) {
      console.log(type[c]);
      var t = GetDataType(type[c]);
      colTypes.push(t);
      colNames.push({"title": cols[c] , "class": t.class } );
   }

   var maxColumns = data[0].length;
   if ( colNames.length <= 0 ) {
      colNames = [];
      for (var i=0; i < maxColumns; i++) {
         colNames.push({title: "C_"+i , class: "center"})
      }
   }

   $(divName).empty();
   id = "datatable_" + 2;
   jid = "#" + id;
   html = '<table cellpadding="0" cellspacing="0" border="0" class="display" id="'+ id +'" ></table>'
   $(divName).html(html);
   $(jid ).dataTable( {
      data: data,
      "columns": colNames
   })
   //.makeEditable()

}

function setDataFromText(text, splitBy, divName) {
   splitBy = (splitBy) ? splitBy : ","
   divName = divName  || setDataFromText.results ;

   text = text.replace("\r\n", "\n");
   var lines = text.split("\n");

   if (lines.length <= 0 ) {
      return;
   }

   var cols = "";
   var colNames = [];
   var colTypes = [];
   var data = [];

   if (lines.length > 0 && lines[0].startsWith("#") && lines[1].startsWith("#")) { //Header types Row
      type = lines[1].substring(1).split(",");
   } else {
      type = null;
   }

   if (lines[0].startsWith("#")) { //Header Row
      cols = lines[0].substring(1).split(",");
      for (c in cols) {
         var t = type && type.length >c ? GetDataType(type[c]): {type: "string" , class: "center"};
         colTypes.push(t);
         colNames.push({"title": cols[c] , "class": t.class } );
      }
   }
   console.log(colNames)
   var maxColumns = 0;
   for (l in lines) {
      l = lines[l].trim();
      if (l.startsWith("#") || l.length <= 0) {
         continue;
      }
      d = l.split(splitBy);
      data.push(d);
      maxColumns = Math.max(maxColumns, d.length)
   }
   if ( colNames.length <= 0 ) {
      colNames = [];
      for (var i=0; i < maxColumns; i++) {
         colNames.push({title: "Column "+i , class: "center"})
      }
   }
   $(divName).empty();
   id = "datatable_" + 3;
   html = '<table cellpadding="0" cellspacing="0" border="0" class="display" id="'+ id +'" ></table>'
   $(divName).html(html);

   $("#" + id ).dataTable( {
      data: data,
      "columns": colNames
   })
}

function runQuery(q, cb, divName) {
   console.log($('#q').val())
   q = q || "select city, country, population, latitude, longitude, loc  from worldcities LIMIT 2000";
   setDataFromJSON.results = divName;
   submitForm({URL:"http://www.geospaces.org/aura/webroot/db.jsp", fdata: {"q": q}, CB: cb || setDataFromJSON })
}

function getText(url, cb, divName) {
   console.log(url)
   setDataFromText.results = divName;
   submitForm({get: "GET" , URL:url, fdata:{}, CB: cb || setDataFromText })
}

function getJSON(url,cb, divName ) {
   console.log(url)
   setDataFromJSON.results = divName;
   submitForm({get: "GET", URL:url, fdata:{}, CB: cb|| setDataFromJSON })
}

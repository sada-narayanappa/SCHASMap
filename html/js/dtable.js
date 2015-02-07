/**
 * This expects data as follows:
 * $rs = { data:     [[ d1, d2 ...], [ d1, d2 ...], ],
 *         colNames: [ name1, name2, ....]
 *         colTypes: [type1, type2, ... ]
 */

// string, number, datetime, bool
//
//------------------------------------------------------------------------------
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

//------------------------------------------------------------------------------
function thClick(th) {
   var col = $(th).index();
   var val = $(th).text()
   console.log(th + " Header clicked: " + col + " " + val)
}
//------------------------------------------------------------------------------
function endEditing(table, abort) {
   if ( !table.editing ) {
      return;
   }
   var rr = table.currentTopRow + table.editingRow-1;
   var oval = table.data.rows[rr][table.editingCol];
   if ( abort ) {

   } else {
      var cell = $('table tr:eq(' + table.editingRow  + ') td:eq(' + table.editingCol + ')');

      val = cell[0].firstChild.value;
      cell.html(val);

      table.data.rows[rr][table.editingCol] = val;

      if ( val != oval) {
         table.data.rows[rr].isDirty = true;
         cell.parent().eq(0).addClass("dirty")
      }
      //table.data.rows[rr].push("*")
      //$(table.nav.children()).eq(0).addClass("disabled");
      //addClass("dirty");
   }

   table.editing     = false;
   table.editingCol  = -1;
   table.editingRow  = -1;
}
//------------------------------------------------------------------------------
function updateToServer(li) {
   table = li.table;
   for (c in table.data.rows ) {
      r = table.data.rows[c];
      if (r.isDirty) {
         console.log("Updating " + c + " th row");
         r.isDirty = false;
      }
   }
}
//------------------------------------------------------------------------------
function tdClick(td) {
   var col = $(td).index();
   var row = $(td).parent().index();
   var val = $(td).text()
   //console.log(td + " TD clicked: " + col + " " + row + " " + val)
   t = $(td);

   table = t.parent().parent().parent()[0].table;

   if ( table.editing && table.editingCol == col &&  table.editingRow == row ) {
      return;
   }
   if ( table.editing ) {
      endEditing(table);
   }
   table.editing     = true;
   table.editingCol  = col;
   table.editingRow  = row;
   cl = "style='width: "+ $(td).width() + "px; padding:0; margin:0; display: inline;overflow:hidden;'";
   //cl = "style='width: 10%; padding: 0;'";
   t.css('width', $(td).width())
   var inp =$("<input class='dtable' " + cl + " type=text value='"+val +"' onblur='endEditing(this.table)' />");
   inp[0].table = table;
   inp[0].onkeydown = dtableKey;
   t.html(inp);
}
//------------------------------------------------------------------------------
function dtableKey(evt) {
   if (evt.which === 13) {          // ENTER

   } else if ( evt.which == 27 ) {  //ABORT EDITING
   }
   //console.log(evt.keyCode)
}
//------------------------------------------------------------------------------
function setTableHeaderRow(table, headers, type) {
   var h = []
   for (c in headers) {
      var t = GetDataType(type[c]);
      h.push("<th onclick='thClick(this)'>" + headers[c] + "</th>" );
   }
   table.header = "<tr>"+ h.join()+"</tr>";
}
//------------------------------------------------------------------------------
function setTableRows(table, data, startRow, num) {
   endEditing(table, true);
   num = num || Math.min(num, table.numRowstoShow, data.length, 10);
   startRow = startRow || 0;
   data = data || table.data.rows;

   if (data.length <= startRow) {
      return
   }

   table.currentTopRow = startRow;

   table.empty();
   table.append(table.header)

   var len = Math.min(startRow+num , data.length)
   for (var i=startRow; i <  len; i++) {
      d = []
      di = ""
      if ( data[i].isDirty ) {
         console.log( " Dirty: " + data[i].isDirty)
         di = " style='border-left: 4px solid blue;' "
      }
      for (var j=0; j < data[i].length ; j++) {
         d.push("<td onclick='tdClick(this)'>" + data[i][j] + "</td>")
      }
      var r = "<tr class='color" + i % 2 + "' " + di + "   >" + d.join() + "</tr>"
      table.append(r)
   }
   updateShowing(table)
}
//------------------------------------------------------------------------------
function showNext(a) {
   //console.log("Showing Next: " + a + " " + a.table)
   table = a.table;
   var bot = table.currentTopRow + table.numRowstoShow;
   if ( bot >= table.data.rows.length-1) {
      return;
   }
   var top = table.currentTopRow + table.numRowstoShow;
   setTableRows(table, null, top, table.numRowstoShow)
}
//------------------------------------------------------------------------------
function showPrev(a) {
   //console.log("Showing Prev: " + a + " " + a.table )
   table = a.table;
   if ( table.currentTopRow <= 0) {
      return;
   }

   var top = Math.max(0, table.currentTopRow - table.numRowstoShow);
   setTableRows(table, null, top, table.numRowstoShow)
}
//------------------------------------------------------------------------------
function showPage(a, page) {
   //console.log("Showing Page: " + a + " " + page );

   var top = (page - 1)* a.table.numRowstoShow;
   setTableRows(a.table, null, top, a.table.numRowstoShow)
}
//------------------------------------------------------------------------------
function getData(text) {
   text = text.trim();
   if ( !text.startsWith("$") && !text.startsWith("var") ) {
      text = "$rs="+text;
   }
   eval(text);
   if (!$rs.rows) {
      $rs.rows = $rs[Object.keys($rs)[0]];
   }
   if (!$rs.colnames) {
      $rs.colnames = [];
      for (var i=0; i < $rs.rows[0].length; i++) {
         $rs.colnames.push(" " + i);
      }
   }
   if (!$rs.coltypes) {
      $rs.coltypes = [];
      for (var i=0; i < $rs.rows[0].length; i++) {
         $rs.coltypes.push("str");
      }
   }
   return $rs;
}
//------------------------------------------------------------------------------
function updateShowing(table) {
   var top = table.currentTopRow + 1;
   var bot = Math.min (table.currentTopRow + table.numRowstoShow, table.data.rows.length);
   var lastPage = Math.ceil(table.data.rows.length / table.numRowstoShow);
   var len = table.data.rows.length;

   label = "Showing: " + top + " - " + bot + " / Total: " + len;
   //label = "Total Rows: " + table.data.rows.length;

   table.label.text(label);

   if ( table.nav.children().length <= 0 )
      return;

   page = table.currentTopRow / table.numRowstoShow;

   //console.log(" PAGE: " + page + " last PAge:" + lastPage + " top:" + top + " len: "+ len)

   if ( page == 0 ) {
      $(table.nav.children()).eq(0).addClass("disabled");

   } else {
      $(table.nav.children()).eq(0).removeClass("disabled");
   }

   if ( page == lastPage -1 ) {
      l = $(table.nav.children()).length-1;
      $(table.nav.children()).eq(l).addClass("disabled");

   } else {
      l = $(table.nav.children()).length-1;
      $(table.nav.children()).eq(l).removeClass("disabled");
   }

   if ( table.nav.children().length <= page )
      return;

   for( i=0 ; i < $(table.nav.children()).length; i++) {
      $(table.nav.children()).eq(i).removeClass("current");
   }
   $(table.nav.children()).eq(page+1).addClass("current");
   //for( i=0 ; i < $(table.nav.children()).length; i++) {
   //}
}
//------------------------------------------------------------------------------
function createLinks(table) {
   var top = table.currentTopRow + 1;
   var bot = table.currentTopRow + table.numRowstoShow;

   table.nav.empty();
   var ap = $("<a class='page' href=# onclick='showPrev(this)' > << PREV </a>");
   ap[0].table = table;
   table.nav.append(ap);

   var ni = Math.max(10, table.data.rows.length/table.numRowstoShow);

   for ( var i=1; i < 20; i++) {
      ai = $("<a class='page' href=# onclick='showPage(this," + i +" )' >" + (i)  + " </a>");
      ai[0].table = table;
      table.nav.append(ai);

      var bott = i * table.numRowstoShow;
      if ( bott >= table.data.rows.length) {
         break;
      }
   }

   var an = $("<a class='page' href=# onclick='showNext(this)' > NEXT >> </a>");
   table.nav.append(an);
   an[0].table = table;

   var up = $("<a class='page current' href=# onclick='updateToServer(this)' > UPDATE  </a>");
   table.stat.empty();
   table.stat.append(up);
   up[0].table = table;

}
//------------------------------------------------------------------------------
function createTable(text, divName) {
   divName = divName || createTable.div;
   div = $('#'+divName) ;
   text = text.trim();
   var $rs = null;
   try{
      $rs = eval(text);
   } catch (e) {
      console.log(e);
   }
   if ( !$rs && !text.startsWith("$") && !text.startsWith("var") ) {
      text = "$rs="+text;
      eval(text);
   }
   $rs = getData(text);

   id="k" + Math.floor(Math.random() *100);
   var d = "<tr><td> hello</td></tr>"
   var table = $('<table cellpadding="4" cellspacing="0" class="dtable" width=100% id="'+ id +'" >'+d+'</table>');
   div.empty();
   div.append(table);
   var label = $("<label> #rows: </label>")
   div.append(label);
   var nav   = $('<div style="display: inline; padding-left: 50px;"> Next </div>')
   div.append(nav);
   var stat   = $('<div style="display: inline; padding-left: 50px;"> status </div>')
   div.append(stat);


   table.data = $rs;
   table.label= label;
   table.nav  = nav;
   table.stat  = stat;
   table.numRowstoShow = 10;
   table.currentTopRow = 0;
   table[0].table = table;

   setTableHeaderRow(table, table.data.colnames, table.data.coltypes)
   setTableRows(table, table.data.rows, 0, table.numRowstoShow)
   createLinks(table);
   updateShowing(table);
}
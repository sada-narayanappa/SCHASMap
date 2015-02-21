//--------------------------------------------------------------------------
//Submit the form and get results call user defined fucntion
function submitForm(p) {
   p = p || {};
   var get        = p.get   || "POST"
   var formName   = p.formName      || "#form"
   var callBack   = p.CB
   var callBackErr= p.CBError
   var URL        = p.URL || $(formName).attr('action') || submitForm.__DEFAULT_URL ;
   var debug      = p.debug;
   var fdata      = p.fdata;

   if ( fdata == null) {
      fdata = $(form).serializeArray()
   }

   //console.log(fdata)
   ajax = {
      type:       p.get || "POST",
      url:        URL,
      dataType:   'text',
      data:       fdata,
      cache:      false,
      async:      true,
      success:    function (resp) {
         resp = resp.trim();
         submitForm.result = resp;
         if (callBack && typeof callBack == "function") {
            callBack(resp);
         }
      },
      error:   function (e) {
         if (callBackErr && typeof callBackErr == "function") {
            callBackErr(e);
         } else {
            log("ERROR: An error has occurred: " + e);
         }
      }
   }
   //console.log(ajax)

   $.ajax( ajax );
}
submitForm.__DEFAULT_URL="";

function log(o) {
   console.log(o);
}
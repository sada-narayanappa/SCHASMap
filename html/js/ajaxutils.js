//--------------------------------------------------------------------------
//Submit the form and get results call user defined fucntion
function submitForm(getPost, formName, callback, callbackError){
   type = (getPost)  ? getPost  : "POST";      // default is POST
   form = (formName) ? formName : "#form";     // form Name

   console.log(callback);

   fdata = $(form).serializeArray()
   //console.log(fdata)

   $.ajax({
      type: type,
      url: URL1,
      data: fdata,
      ddataType:"text",
      ccontentType: "text/html",
      success: function(resp){
         resp = resp.trim();
         //console.log(resp);
         if ( callback ) {
            callback(resp);
         }
      },
      error: function(e){
         if ( callbackError ) {
            callbackError(e);
         }
         console.log("ERROR: An error has occurred");
      }
   });
}

#!/usr/local/bin/python

import cgi, cgitb
import tempfile
import datetime

def test():
    form = cgi.FieldStorage()
    o = "";
    for i,j in enumerate(form):
            vals = "VALUE oF FILE"
            if ( not j  ==  'file' ):
                vals = form.getvalue(j);
            c = "{} {} {} \n".format(i, j, vals) #(val[:100]) ) ;
            o += c;    
    print ('''Content-type:text/html\r\n\r\n''' + "<pre>"+o + "</pre>")
    
def do(prefix = ""):
    form = cgi.FieldStorage()
    name = prefix + str(form.getvalue('name'));
    log=datetime.datetime.now().strftime("%Y%m%d-%H:%M:%S")
    
    with (open ("tmp/log.file", "a+") ) as fb:
        fb.write("{} {} {}\n".format(log,name, name)); 

    with (open ("tmp/"+name, "wb") ) as fb:
        fc =form.getvalue('file');
        if ( fc is not None):
            cont = bytes(fc)
            fb.write(cont);
            
    o = "File in tmp/{}".format(name);
    print ('''Content-type:text/html\r\n\r\n''' + o )

do();

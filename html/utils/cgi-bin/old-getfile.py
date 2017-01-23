#!/usr/local/bin/python

import cgi, cgitb
import tempfile
import datetime

suf=datetime.datetime.now().strftime("%Y%m%d-%H:%M:%S.jpeg")

form = cgi.FieldStorage() 
o = ""
with (open ("tmp/log.file", "a+b") ) as fb:
    fb.write(b'\n---------+++++++\n')
    for i,j in enumerate(form):
        c = "{} {} {}  ".format(i, j, j) #(val[:100]) ) ;
        o += c;
        fb.write(bytearray(c, 'utf8'));
        fb.write(b'\n-------------------')
        
        fp = tempfile.NamedTemporaryFile(delete=False, dir="tmp/",suffix=suf)
        o += str(fp.name)
        fp.write(bytes(form.getvalue(j) ));
        fp.flush()
        fp.close()
    


print ('''Content-type:text/html\r\n\r\n''' + o)

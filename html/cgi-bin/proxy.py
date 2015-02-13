#!/usr/bin/python

import urllib2
import cgi
import sys, os

method = os.environ.get("REQUEST_METHOD", "GET");
qs = os.environ.get("QUERY_STRING", "");

d = cgi.parse_qs(qs)
url = d.get("url" ,["http://localhost"])[0];

nqs=qs.replace("url="+url, "")
url=url + nqs;

try:
    host = url.split("/")[2]
    if url.startswith("http://") or url.startswith("https://"):
        if method == "POST":
            length = int(os.environ.get("CONTENT_LENGTH", "0"))
            headers = {"Content-Type": os.environ.get("CONTENT_TYPE", "")}
            body = sys.stdin.read(length)
            r = urllib2.Request(url, body, headers)
            y = urllib2.urlopen(r)
        else:
            print "OPENING ", url;
            y = urllib2.urlopen(url)

        # print content type header
        i = y.info()
        if i.has_key("Content-Type"):
            print "Content-Type: %s" % (i["Content-Type"])
        else:
            print "Content-Type: text/plain"
        print

        print y.read()

        y.close()
    else:
        print "Content-Type: text/plain"
        print
        print "Illegal request."

except Exception, E:
    print "Status: 500 Unexpected Error"
    print "Content-Type: text/plain"
    print
    print "Some unexpected error occurred. Error text was:", E

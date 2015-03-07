#!/usr/bin/python
import urllib, urllib2, json

def requestData():
    
    #Requesting null weather data and putting it into JSON
    geourl = 'http://www.geospaces.org/aura/webroot/db.jsp?'
    geoVals = { 'qn' : '10'
                            }
    geoData = urllib.urlencode(geoVals)
    geoReq = urllib2.Request(geourl+geoData)
    response = urllib2.urlopen(geoReq)
    the_page = response.read()
    
    #Formatting for JSON
    the_page = the_page[35:] #Remove js information 
    the_page = the_page[:1] + '"'+the_page[1:5]+'"' +the_page[5:]
    the_page = the_page[:-760]+'"' + the_page[-760:-752]+ '"' + the_page[-752:-351] + '"' + the_page[-351:-343]+'"'+the_page[-343:]
    the_page = the_page[:-769]+the_page[-768:]
    
    jsonData = json.loads(the_page)
    
    return jsonData
    
    #print jsonData["rows"][0][0]
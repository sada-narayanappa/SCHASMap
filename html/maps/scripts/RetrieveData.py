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
    the_page = the_page[:-739]+'"' + the_page[-739:-731]+ '"' + the_page[-731:-341] + '"' + the_page[-341:-333]+'"'+the_page[-333:]
    the_page = the_page[:-748]+the_page[-747:]
    
    jsonData = json.loads(the_page)
    
    return jsonData
    
    #print jsonData["rows"][0][0]
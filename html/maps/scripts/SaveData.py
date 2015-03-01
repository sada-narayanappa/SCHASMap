#!/usr/bin/python
import urllib, urllib2

url = 'http://www.geospaces.org/aura/webroot/db.jsp?'

#Function to push the data to the database
def SaveData(OWeatherData):

    k=0
    while k <len(OWeatherData):
        
        values = { 'qn' : '5',
                'weather_time' : OWeatherData[k][0],
                'temperature_min' : OWeatherData[k][1],
                'temperature_max' : OWeatherData[k][2],
                'humidity' : OWeatherData[k][3],
                'pressure' : OWeatherData[k][4],
                'wind' : OWeatherData[k][5],
                'pid' : OWeatherData[k][6]             }
                                    
        data = urllib.urlencode(values) #DATA SHOULD GO AT THE END OF THE URL
        req = urllib2.Request(url+data)
        response = urllib2.urlopen(req)
        
        k = k+1
        
    
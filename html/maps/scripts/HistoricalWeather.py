#!/usr/bin/python
import urllib, urllib2, re, json, datetime

#Put the existing historical data into a list
geourl = 'http://www.geospaces.org/aura/webroot/db.jsp?'
geoVals = { 'qn' : '3'
                        }
geoData = urllib.urlencode(geoVals)
geoReq = urllib2.Request(geourl+geoData)
response = urllib2.urlopen(geoReq)
the_page = response.read()
rows = the_page.split('[')

k=2
while k < len(rows)-2:
    
    rowData = rows[k].split(',')
    
    #Checks if weather_time == "null"
    if rowData[11]=="\"null\"":
        entryID = re.sub('\"','',rowData[0]) #gets the id of entry
        entryUnix =  int(re.sub('\"','',rowData[3]))
        lon = rowData[5]
        lat = rowData[6]
        
        #FINDING THE NEAREST STATION TO THE GEO COORD
        findStationURL = 'http://api.openweathermap.org/data/2.5/station/find?'
        latLonValues ={'lat' : str(lat),
                'lon' : str(lon),
                'cnt' : '1',
                'APPID' : '31dbfeee1aca334615ad89b93bf440b6' }    
        data = urllib.urlencode(latLonValues)
        req = urllib2.Request(findStationURL + data)
        response = urllib2.urlopen(req)
        the_page = response.read()
        jsonData = json.loads(the_page)[0]
        stationID = jsonData['station']['id'] #THE nearest station id
    
        #using the station ID to find the weather for the correct time
        url = 'http://api.openweathermap.org/data/2.5/history/station?'
        values = { 'APPID' : '31dbfeee1aca334615ad89b93bf440b6',
                'cnt' : '1',
                'type' : 'hour',
                'start' : str(entryUnix-43200),
                'end' : str(entryUnix+43200),
                'id' : str(stationID)}
        data = urllib.urlencode(values) #DATA SHOULD GO AT THE END OF THE URL
        req = urllib2.Request(url+data)
        response = urllib2.urlopen(req)
    
        the_page = response.read()
        
        #Finding the closest time in the server response
        times = the_page.split('\"dt\":')
        i = 1
        weather_time = 0
        closestTimeID = 0
        timeDiff = 999999999
        while i < len(times):
            tempTimeDiff = abs(int(times[i][:10])-entryUnix)
            
            if tempTimeDiff < timeDiff:
                weather_time = int(times[i][:10])
                timeDiff = tempTimeDiff
                closestTimeID = i
            i=i+1
        
        #Extract the data from the closest match
        onlyEntries = the_page.split('[')
        seperateEntries = onlyEntries[1].split('{\"temp\":')
        closestEntry =  seperateEntries[closestTimeID]
        tempDataBlock = closestEntry.split('\"mi\":')
        tempDataBlock2 = tempDataBlock[1].split(',\"ma\":')
        temperatureMinKelvin = tempDataBlock2[0]
        
        tempDataBlock = closestEntry.split(',\"ma\":')
        tempDataBlock2 = tempDataBlock[1].split('},\"pressure')
        temperatureMaxKelvin = tempDataBlock2[0]
        
        humidDataBlock = closestEntry.split('humidity\":{\"v\":')
        humidDataBlock2 = humidDataBlock[1].split(',\"c\":')
        humidity = humidDataBlock2[0]
        
        pressureDataBlock = closestEntry.split('pressure\":{\"v\":')
        pressureDataBlock2 = pressureDataBlock[1].split(',\"c\":')
        pressure = pressureDataBlock2[0]
        
        windDataBlock = closestEntry.split('wind\":{\"gust\":{\"v\":')
        windDataBlock2 = windDataBlock[1].split(',\"c\":')
        wind = windDataBlock2[0]

        #convert weather_time from unix to standard time
        weather_time = datetime.datetime.fromtimestamp(weather_time).strftime('%Y-%m-%d %H:%M:%S')
        
        #Pushing the data to the server
        url = 'http://www.geospaces.org/aura/webroot/db.jsp?'
        values = { 'qn' : '5',
                'weather_time' : weather_time,
                'temperature_min' : temperatureMinKelvin,
                'temperature_max' : temperatureMaxKelvin,
                'humidity' : humidity,
                'pressure' : pressure,
                'wind' : wind,
                'pid' : entryID             }
                                    
        data = urllib.urlencode(values) #DATA SHOULD GO AT THE END OF THE URL
        req = urllib2.Request(url+data)
        response = urllib2.urlopen(req)
        
        the_page = response.read()
    
    k=k+1


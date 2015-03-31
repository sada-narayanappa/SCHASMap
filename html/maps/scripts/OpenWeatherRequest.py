#!/usr/bin/python
import urllib, urllib2, datetime, time, json

#from RetrieveData import requestData
#
#jsonData = requestData()

#Function takes in a list of the data from func RetrieveData.py
def OpenWeatherRequest(jsonData):
    
    k=0
    OWeatherData = []
    # len(jsonData["rows"])
    while k < 1: #Limited to 1 at a time due to timeout error's with larger amounts.
        OWeatherData.append([]) #new list for the current entry
            
        entryID = jsonData["rows"][k][0]
        entryUnix = int(round(float(time.mktime(datetime.datetime.strptime(jsonData["rows"][k][2], "%Y-%m-%d %H:%M:%S.%f").timetuple()))))
        lat = jsonData["rows"][k][11]
        lon = jsonData["rows"][k][12]
        
        
        if((time.time()-entryUnix) > 3600):
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
            jsonDataStation = json.loads(the_page)[0]
            stationID = jsonDataStation['station']['id'] #THE nearest station id
            
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
            
            serverUp = True
            try:
                response = urllib2.urlopen(req)
            except:
                serverUp = False
                temperatureMinKelvin = None
                temperatureMaxKelvin = None
                humidity = None
                pressure = None
                wind = 'null'
                clouds = 'null'
            
            if serverUp:
                the_page = response.read()
                
                jsonDataOWeather = json.loads(the_page)
                
                
                #Finding the closest time in the server response
                i = 0
                weather_time = 0
                closestTimeID = 0
                timeDiff = 999999999
                while i < len(jsonDataOWeather['list']):
                    tempTimeDiff = abs(int(jsonDataOWeather['list'][i]['dt'])-entryUnix)
                    
                    if tempTimeDiff < timeDiff:
                        weather_time = int(jsonDataOWeather['list'][i]['dt'])
                        timeDiff = tempTimeDiff
                        closestTimeID = i
                    
                    i=i+1    
            
                #Extract the data from the closest match
                
                try:
                    temperatureMinKelvin = jsonDataOWeather['list'][closestTimeID]['temp']['mi']
                except:
                    temperatureMinKelvin = None
                
                try:
                    temperatureMaxKelvin = jsonDataOWeather['list'][closestTimeID]['temp']['ma']
                except:
                    temperatureMaxKelvin = None
                    
                try:
                    humidity = jsonDataOWeather['list'][closestTimeID]['humidity']['v']
                except:
                    humidity = None
                
                try:
                    pressure = jsonDataOWeather['list'][closestTimeID]['pressure']['v']
                except:
                    pressure = None
                
                try:
                    wind = jsonDataOWeather['list'][closestTimeID]['wind']['v']
                except:
                    wind = 'null'
                try:
                    clouds = jsonDataOWeather['list'][closestTimeID]['clouds']['all']
                except:
                    clouds = 'null'
                
        
        if((time.time()-entryUnix) <= 3600):
            url = 'http://api.openweathermap.org/data/2.5/weather?'
            values = { 'APPID' : '31dbfeee1aca334615ad89b93bf440b6',                
                    'lat' : str(lat),
                    'lon' : str(lon)
                    }
            data = urllib.urlencode(values) #DATA SHOULD GO AT THE END OF THE URL
            req = urllib2.Request(url+data)
            response = urllib2.urlopen(req)
            
            the_page = response.read()
            
            jsonDataOWeather = json.loads(the_page)
            
            try:
                temperatureMinKelvin = jsonDataOWeather['main']['temp_min']
            except:
                temperatureMinKelvin = None
            
            try:
                temperatureMaxKelvin = jsonDataOWeather['main']['temp_max']
            except:
                temperatureMaxKelvin = None
                
            try:
                humidity = jsonDataOWeather['main']['humidity']
            except:
                humidity = None
            
            try:
                pressure = jsonDataOWeather['main']['pressure']
            except:
                pressure = None
            
            try:
                wind = jsonDataOWeather['wind']['speed']
            except:
                wind = 'null'
            try:
                clouds = jsonDataOWeather['clouds']['all']
            except:
                clouds = 'null'
            try:
                weather_time = jsonDataOWeather['dt']
            except:
                weather_time = 'null'
            
        
        #convert weather_time from unix to standard time
        if weather_time != 'null':
            weather_time = datetime.datetime.fromtimestamp(weather_time).strftime('%Y-%m-%d %H:%M:%S')
        
        OWeatherData[k].append(weather_time)
        OWeatherData[k].append(temperatureMinKelvin)
        OWeatherData[k].append(temperatureMaxKelvin)
        OWeatherData[k].append(humidity)
        OWeatherData[k].append(pressure)
        OWeatherData[k].append(wind)
        OWeatherData[k].append(entryID)
        #OWeatherData[k].append(clouds)
        
        k=k+1
    
    return OWeatherData
    
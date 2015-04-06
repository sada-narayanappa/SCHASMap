#!/usr/bin/python
import urllib, urllib2, json
import requests
import re
import time
import datetime
from xmlutils.xml2json import xml2json;
import blockspring;
import rfc822;

q1 = "select * from weather_stations where is_interested = 't' LIMIT 10"
#q1 = "select * from weather_stations where state='MN' LIMIT 100"
q2 = "update weather_stations set is_valid = 'f' where station_id='$station_id'"
q3 = "INSERT INTO weather_stations (station_id, json) values('$station_id', '$JSON'";


def runSQL(q, h=None):
    if ( h ):
        for k in h.keys():
            q= q.replace("$"+k, str(h.get(k)))

    #print "Running: " + q;
    url = 'http://www.geospaces.org/aura/webroot/db.jsp?q='+q
    res = requests.get(url).content.strip()
    #print res
    return res;


def getStations():
    the_page = runSQL(q1)
    the_page = re.sub(".*?=", "", the_page)
    #Formatting for JSON
    the_page = the_page.replace('rows','"rows"')
    the_page = the_page.replace('colnames','"colnames"')
    the_page = the_page.replace('coltypes','"coltypes"')
    the_page = the_page.replace('],\n]',']\n]')

    jsonData = json.loads(the_page)
    return jsonData

def updateWeatherStation(st, xml_url):
    wj = "";
    wj = requests.get(xml_url).content.strip();

    if ( not wj.startswith("<?xml")):
        print "*** NOT XML ***" + st + " "+xml_url;
        runSQL(q2, {"station_id": st})
    print "++OK" +xml_url;
    return wj;

def getWeather(st, xml_url, lt, ln, valid):
    wj = "";
    wj = requests.get(xml_url).content.strip();

    if (valid):
        if ( not wj.startswith("<?xml")):
            print "*** NOT XML ***" + st + " "+xml_url;
            wj = "ERROR";
        else:
            ja=blockspring.runParsed("xml-to-json", { "my_xml": wj }).params["converted"]
            jas = json.dumps(ja);
            wj=jas;
    else:
        wj = getOW(lt,ln);

    return wj;

def getOW(lt,ln):
    url="http://api.openweathermap.org/data/2.5/weather?lat="+str(lt)+"&lon="+str(ln);
    res = requests.get(url).content.strip();
    return res;


def insert(st,jstr):
    dt = jstr["observation_time_rfc822"] or jstr["dt"];
    print dt;
    #runSQL(q3, {"station_id": st, "json": jstr })


def run():
    #qt = "select * from weather_stations where station_id = '$station_id'"
    #runSQL(qt, {"station_id": 23})

    d= getStations()

    cols = d["colnames"];
    rows = d["rows"];
    #print d
    idi  = cols.index('station_id')
    xmi = cols.index('xml_url')
    lat = cols.index('lat')
    lon = cols.index('lon')
    val = cols.index('is_valid')

    #print idi, xml_url, cols
    #print rows
    for i, r in enumerate(rows):
        st = r[idi];
        xm = r[xmi];
        lt = r[lat];
        ln = r[lon];
        vl = True if r[val].startswith('t') else False;
        print st, lt, ln,vl, xm;
        w = getWeather(st,xm, lt, ln, vl)
        insert(st, w);
        print w;
        if (i == 4):
            break;

def getDate(str):
    ja = json.loads(str)

    source = 0
    dt = None;
    ds = None;

    if ( ja.get("dt") != None):
        dt =  ja.get("dt")
        ds = dt;
        source = 1
    else:
        if ( ja.get("current_observation") != None ):
            ds = ja.get("current_observation").get("observation_time_rfc822")
            dp= rfc822.parsedate_tz((ds));
            print dp;
            dt = time.mktime((dp));
            source = 2
    if (dt == None):
        return None;

    dttm= datetime.datetime.fromtimestamp(dt)

    print dttm, dt, ds, source
    #print ja1
    #print ja2

def test():
    getDate('{"coord":{"lon":-92.96,"lat":45},"sys":{"message":0.015,"country":"US","sunrise":1428320529,"sunset":1428367565},"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03n"}],"base":"stations","main":{"temp":280.808,"temp_min":280.808,"temp_max":280.808,"pressure":993.29,"sea_level":1027.96,"grnd_level":993.29,"humidity":59},"wind":{"speed":5.94,"deg":84.0001},"clouds":{"all":48},"dt":1428289883,"id":5039587,"name":"North Saint Paul","cod":200}');
    getDate('{"current_observation": {"icon_url_name": "novc.png", "image": {"url": "http://weather.gov/images/xml_logo.gif", "link": "http://weather.gov", "title": "NOAA\'s National Weather Service"}, "privacy_policy_url": "http://weather.gov/notice.html", "weather": "Overcast", "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance", "windchill_c": "2", "ob_url": "http://www.weather.gov/data/METAR/KSTP.1.txt", "windchill_f": "36", "pressure_in": "29.94", "dewpoint_string": "32.0 F (0.0 C)", "suggested_pickup_period": "60", "disclaimer_url": "http://weather.gov/disclaimer.html", "credit": "NOAA\'s National Weather Service", "version": "1.0", "location": "Downtown Holman Field, MN", "dewpoint_c": "0.0", "latitude": "44.93237", "wind_mph": "13.8", "dewpoint_f": "32.0", "temp_f": "43.0", "station_id": "KSTP", "pressure_string": "1014.3 mb", "xmlns:xsd": "http://www.w3.org/2001/XMLSchema", "temp_c": "6.1", "visibility_mi": "10.00", "wind_string": "East at 13.8 MPH (12 KT)", "pressure_mb": "1014.3", "wind_kt": "12", "temperature_string": "43.0 F (6.1 C)", "two_day_history_url": "http://www.weather.gov/data/obhistory/KSTP.html", "wind_dir": "East", "wind_degrees": "70", "copyright_url": "http://weather.gov/disclaimer.html", "icon_url_base": "http://forecast.weather.gov/images/wtf/small/", "xsi:noNamespaceSchemaLocation": "http://www.weather.gov/view/current_observation.xsd", "observation_time": "Last Updated on Apr 5 2015, 8:53 pm CDT", "longitude": "-93.05588", "credit_URL": "http://weather.gov/", "suggested_pickup": "15 minutes after the hour", "relative_humidity": "65", "observation_time_rfc822": "Sun, 05 Apr 2015 20:53:00 -0500", "windchill_string": "36 F (2 C)"}}')


if __name__ == "__main__":
    test();
#!/usr/bin/python
import urllib, urllib2, json
import requests
import re
import time
import datetime
from xmlutils.xml2json import xml2json;
import blockspring;
import rfc822;
import email.utils;

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

def getWeatherLatLon(lt,ln):
    url="http://forecast.weather.gov/MapClick.php?lat="+lt + "&lon=" +ln + "&unit=0&lg=english&FcstType=dwml"
    res = requests.get(url).content.strip();
    return res;


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

def getDate(jstr):
    ja = json.loads(jstr)

    source = 0
    dt = None;
    ds = None;
    off =""
    if ( ja.get("dt") != None):
        dt =  ja.get("dt")
        ds = dt;
        dt = time.mktime(time.gmtime(dt))
        dl = ds;
        source = 1
    else:
        if ( ja.get("current_observation") != None ):
            ds = ja.get("current_observation").get("observation_time_rfc822")
            pd = email.utils.parsedate_tz(ds);
            tz = email.utils.mktime_tz(pd)

            dp= rfc822.parsedate_tz((ds));
            dp1 = list(dp);
            off = dp1[-1];
            dp1.pop();
            #t = datetime.datetime.timetuple(datetime.datetime(dp1[0],dp1[1],dp1[2], dp1[3],dp1[4]))
            dl = time.mktime(dp1) # - off
            print dp1, dl, "\n"
            dt = time.mktime(time.gmtime(dl +off))
            print "===> ",  time.gmtime(dl +off)
            source = 2
    if (dt == None):
        return None;

    ldttm= datetime.datetime.fromtimestamp(dl)
    gdttm= datetime.datetime.fromtimestamp(dt)

    print ldttm, gdttm, dt, off, "===> " + str(ds), source
    #print ja1
    #print ja2

def test():
    tz = email.utils.mktime_tz(email.utils.parsedate_tz("Mon, 06 Apr 2015 15:51:00 -0500"))
    t = datetime.datetime.utcfromtimestamp(tz)
    tz1 = tz - 5 * 60 * 60
    t1 = datetime.datetime.utcfromtimestamp(tz1)
    print tz, tz1, t, t1;
    tz = email.utils.mktime_tz(email.utils.parsedate_tz("Mon, 06 Apr 2015 15:58:00 -0600"))
    t = datetime.datetime.utcfromtimestamp(tz)
    tz1 = tz - 6 * 60 * 60
    t1 = datetime.datetime.utcfromtimestamp(tz1)
    print tz, tz1, t, t1;

    #getDate('{"coord":{"lon":-92.96,"lat":45},"sys":{"message":0.018,"country":"US","sunrise":1428320529,"sunset":1428367565},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"base":"stations","main":{"temp":281.984,"temp_min":281.984,"temp_max":281.984,"pressure":995.78,"sea_level":1029.98,"grnd_level":995.78,"humidity":63},"wind":{"speed":6.56,"deg":80.5052},"clouds":{"all":92},"rain":{"3h":0.18},'
    #        '"dt":1428354173,"id":5039587,"name":"North Saint Paul","cod":200}');
    #getDate('{"current_observation": {"icon_url_name": "novc.png", "image": {"url": "http://weather.gov/images/xml_logo.gif", "link": "http://weather.gov", "title": "NOAA\'s National Weather Service"}, "privacy_policy_url": "http://weather.gov/notice.html", "weather": "Overcast", "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance", "windchill_c": "2", "ob_url": "http://www.weather.gov/data/METAR/KSTP.1.txt", "windchill_f": "36", "pressure_in": "29.94", "dewpoint_string": "32.0 F (0.0 C)", "suggested_pickup_period": "60", "disclaimer_url": "http://weather.gov/disclaimer.html", "credit": "NOAA\'s National Weather Service", "version": "1.0", "location": "Downtown Holman Field, MN", "dewpoint_c": "0.0", "latitude": "44.93237", "wind_mph": "13.8", "dewpoint_f": "32.0", "temp_f": "43.0", "station_id": "KSTP", "pressure_string": "1014.3 mb", "xmlns:xsd": "http://www.w3.org/2001/XMLSchema", "temp_c": "6.1", "visibility_mi": "10.00", "wind_string": "East at 13.8 MPH (12 KT)", "pressure_mb": "1014.3", "wind_kt": "12", "temperature_string": "43.0 F (6.1 C)", "two_day_history_url": "http://www.weather.gov/data/obhistory/KSTP.html", "wind_dir": "East", "wind_degrees": "70", "copyright_url": "http://weather.gov/disclaimer.html", "icon_url_base": "http://forecast.weather.gov/images/wtf/small/", "xsi:noNamespaceSchemaLocation": "http://www.weather.gov/view/current_observation.xsd", "observation_time": "Last Updated on Apr 5 2015, 8:53 pm CDT", "longitude": "-93.05588", "credit_URL": "http://weather.gov/", "suggested_pickup": "15 minutes after the hour", "relative_humidity": "65", '
    #        '"observation_time_rfc822": "Mon, 06 Apr 2015 15:51:00 -0500", "windchill_string": "36 F (2 C)"}}')
    #getDate('{"current_observation": {"icon_url_name": "novc.png", "image": {"url": "http://weather.gov/images/xml_logo.gif", "link": "http://weather.gov", "title": "NOAA\'s National Weather Service"}, "privacy_policy_url": "http://weather.gov/notice.html", "weather": "Overcast", "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance", "windchill_c": "2", "ob_url": "http://www.weather.gov/data/METAR/KSTP.1.txt", "windchill_f": "36", "pressure_in": "29.94", "dewpoint_string": "32.0 F (0.0 C)", "suggested_pickup_period": "60", "disclaimer_url": "http://weather.gov/disclaimer.html", "credit": "NOAA\'s National Weather Service", "version": "1.0", "location": "Downtown Holman Field, MN", "dewpoint_c": "0.0", "latitude": "44.93237", "wind_mph": "13.8", "dewpoint_f": "32.0", "temp_f": "43.0", "station_id": "KSTP", "pressure_string": "1014.3 mb", "xmlns:xsd": "http://www.w3.org/2001/XMLSchema", "temp_c": "6.1", "visibility_mi": "10.00", "wind_string": "East at 13.8 MPH (12 KT)", "pressure_mb": "1014.3", "wind_kt": "12", "temperature_string": "43.0 F (6.1 C)", "two_day_history_url": "http://www.weather.gov/data/obhistory/KSTP.html", "wind_dir": "East", "wind_degrees": "70", "copyright_url": "http://weather.gov/disclaimer.html", "icon_url_base": "http://forecast.weather.gov/images/wtf/small/", "xsi:noNamespaceSchemaLocation": "http://www.weather.gov/view/current_observation.xsd", "observation_time": "Last Updated on Apr 5 2015, 8:53 pm CDT", "longitude": "-93.05588", "credit_URL": "http://weather.gov/", "suggested_pickup": "15 minutes after the hour", "relative_humidity": "65", '
    #        '"observation_time_rfc822": "Mon, 06 Apr 2015 15:58:00 -0600", "windchill_string": "36 F (2 C)"}}')


if __name__ == "__main__":
    test();
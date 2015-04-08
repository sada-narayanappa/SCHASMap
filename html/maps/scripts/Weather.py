#!/usr/bin/python
import calendar
import json
import requests
import re
import time
import datetime
import rfc822;
import email.utils;
import dateutil
from dateutil.parser import parse
from dateutil.tz import tzoffset

q1 = "select * from weather_stations where is_interested = 't' LIMIT 200"
#q1 = "select * from weather_stations where state='MN' LIMIT 100"
q2 = "update weather_stations set is_valid = 'f' where station_id='$station_id'"
q3 = '''
INSERT INTO weather (station_id, weather_json, time_gmt, time_local, raw, temp_f)
VALUES('$station_id', '$JSON', '$TIME_GMT', '$TIME_LOCAL', '$RAW', '$TEMP_F')
''';
q3 = '''
INSERT INTO weather (station_id, weather_json, time_gmt, time_local, temp_f)
VALUES('$station_id', '$JSON', '$TIME_GMT', '$TIME_LOCAL','$TEMP_F')
''';

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

def getWeatherLatLon(lt,ln):
    url="http://forecast.weather.gov/MapClick.php?lat="+ str(lt) + "&lon=" + str(ln) + "&unit=0&FcstType=json"
    print "Getting:", url;
    res = requests.get(url).content.strip();
    jsn = json.loads(res);
    cur = jsn["currentobservation"]
    dat = jsn["creationDate"]
    jas = json.dumps(cur);
    return  dat, jas, cur, jsn;

def fmtDate(dt="2015-04-06T22:39:12-04:00"):
    dt1 = dateutil.parser.parse(dt);            # Local time
    dt2 = dt1.astimezone(tzoffset(None, 0))     # Convert it to GMT Time
    t1  = calendar.timegm(dt1.timetuple())
    t2  = calendar.timegm(dt2.timetuple())
    loc= datetime.datetime.utcfromtimestamp(t1)
    gmt= datetime.datetime.utcfromtimestamp(t2)
    print loc, gmt
    return str(loc), str(gmt);

def insert(st,dat,jstr,jsn, raw):
    loc, gmt = fmtDate(dat);
    if (not dat):
        print "No data for " + jstr;
        return;
    val = {"station_id": st, "JSON": jstr , "TIME_GMT":gmt, "TIME_LOCAL":loc, "RAW": raw,
           "TEMP_F": jsn["Temp"]}
    res = runSQL(q3, val)
    print "INSERTED ROW: ", val
    print res


def run():
    d= getStations()

    cols = d["colnames"];
    rows = d["rows"];
    idi  = cols.index('station_id')
    xmi = cols.index('xml_url')
    lat = cols.index('lat')
    lon = cols.index('lon')
    val = cols.index('is_valid')

    for i, r in enumerate(rows):
        st = r[idi];
        xm = r[xmi];
        lt = r[lat];
        ln = r[lon];
        vl = True if r[val].startswith('t') else False;
        print st, lt, ln,vl, xm;
        dat,jas, jsn, raw = getWeatherLatLon( lt, ln)
        insert(st, dat, jas,jsn, raw);
        #print w;
        if (i == 100):
            break;

def test():
    fmtDate();

if __name__ == "__main__":
    run();
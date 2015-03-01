#!/usr/bin/python
from RetrieveData import requestData

jsonData = requestData()

from OpenWeatherRequest import OpenWeatherRequest

OWeatherData = OpenWeatherRequest(jsonData)

from SaveData import SaveData

SaveData(OWeatherData)
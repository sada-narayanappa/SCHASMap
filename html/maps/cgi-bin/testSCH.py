#!/usr/local/bin/python
import cgi, cgitb
import os, sys, platform;
import shutil
from random import randint
import sys
import matplotlib.pyplot as plt
import numpy as np;
import png

#-----------------------------------------------------------------------------------------
# Sends a default png file to the browser
#
#-----------------------------------------------------------------------------------------
def sendDefault():
    file = '1.png'
    print "Content-type:  image/png\n"
    shutil.copyfileobj(open(file,'rb'), sys.stdout)


def test():
    print "Content-type:text/html\r\n\r\n"
    print "It worked "

def createAndSend():
    f = open('1.png', 'wb')

def process():
    # Create instance of FieldStorage
    form = cgi.FieldStorage()

    # Get data from fields
    first_name = form.getvalue('act')

    print "Content-type:  image/png\r\n\r\n"

    image = Image.new('RGB', (256, 256))

    print "It worked "


sendDefault();
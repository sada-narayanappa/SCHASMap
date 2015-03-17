#!/usr/bin/python
import cgi, cgitb
import os, sys, platform;
import shutil
from random import randint

# Create instance of FieldStorage
form = cgi.FieldStorage()

# Get data from fields
first_name = form.getvalue('act')

print "Content-type:text/html\r\n\r\n"
print "It worked "

#!/usr/local/bin/python
import os, sys, platform;
import shutil
from random import randint
import sys
import matplotlib.pyplot as plt
import numpy as np;
import png

#-----------------------------------------------------------------------------------------
# Create a PNG file
#
#-----------------------------------------------------------------------------------------
def createEmptyPNG(x = 256,y= 256):
    file = 'empty.png'
    f = open(file, 'wb')
    s = ['110010010011',
         '101011010100',
         '110010110101',
         '100010010011']

    s = map(lambda x: map(int, x), s)

    palette=[(0x55,0x55,0x55), (0x99,0x99,0x99)]
    w = png.Writer(len(s[0]), len(s), palette=palette, bitdepth=1)
    w.write(f, s)

    p = [(255,0,0, 0,255,0, 0,0,255),
         (128,0,0, 0,128,0, 0,0,128)]
    f = open('swatch.png', 'wb')
    w = png.Writer(3, 2)
    w.write(f, p) ; f.close()



def test():
    print "test"



createEmptyPNG();
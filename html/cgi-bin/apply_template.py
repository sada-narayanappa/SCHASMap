#!/usr/local/bin/python
from sys import argv
import re
import os;

HF = [
    re.compile(r"(<!--\s*HEAD.*?HEAD_END\s*-->)", re.M|re.DOTALL),
    re.compile(r"(<!--\s*FOOT.*?FOOT_END\s*-->)", re.M|re.DOTALL),
    ];

def getHF() :
    f = open ("../forms/template.html");
    r = f.read();
    f.close();
    m = re.search(HF[0], r);
    h = m.group(0) if m else "";

    m = re.search(HF[1], r);
    f = m.group(0) if m else "";
    return (h,f)

def changeHeadFoot(file,header,footer):
    f = open (file, "r+b");
    r = f.read();
    ro= r;

    r1,c1 = re.subn(HF[0], header, r);
    r2,c2 = re.subn(HF[1], footer, r1);

    if ( (c1+c2) <= 0 ):
        print "-NO HEADR OR FOOTER ", file, " not changing...."
        f.close()
        return
    #print "---", ro , "====", r2, "++++"
    if ( ro == r2 ):
        print "-No changes needed - original was good: ", file
        f.close()
        return

    print('+CHANGING :' + file + " replaced Header:" + str(c1)+ " Footer: " +str(c2))

    fbak = open (file+".bak", "w");
    fbak.write(r)
    fbak.close();

    f.seek(0);
    f.write(r2)
    f.truncate()
    f.close();


def replace():
    head,foot = getHF()
    #print head, foot
    root = "../forms/"
    for dirName, subdirList, fileList in os.walk(root):
        for fname in fileList:
            if (fname.endswith("template.html") or fname.endswith("test.html")  or not fname.endswith(".html") ):
                continue;
            changeHeadFoot(root+fname, head, foot)

def unitTest():
    header,footer = getHF()
    file = "../forms/test.html"
    changeHeadFoot(file,header,footer);
    #print header, footer

    f = open (file,"r+b");
    r = f.read();
    r3 = r;
    r3,c = re.subn(HF[0], "", r3);
    r3,c = re.subn(HF[1], "", r3);
    r3 = r3.lower().strip();
    print "[" + r3 + "]"
    assert("in between" == r3.lower())

unitTest();
replace();


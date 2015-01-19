from sys import argv
import re
import os;

HF = [
    re.compile(r"(<!--\s*HEAD.*?HEAD_END\s*-->)", re.U|re.M|re.DOTALL),
    re.compile(r"(<!--\s*FOOT.*?FOOT_END\s*-->)", re.U|re.M|re.DOTALL),
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
    if ( file.endswith("template.html")  or not file.endswith(".html") ):
        return;
    print('Changing :' + file)
    f = open (file, "r+");
    r = f.read();

    r1,c1 = re.subn(r"(<!--\s*HEAD.*?HEAD_END\s*-->)", header, r);
    r2,c2 = re.subn(r"(<!--\s*FOOT.*?FOOT_END\s*-->)", footer, r1);

    if ( (c1+c2) < 0 ):
        print "HEADR OR FOOTER NOT FOUND"
        f.close()
        return

    fbak = open (file+".bak", "w");
    fbak.write(r)
    fbak.close();

    f.seek(0);
    f.write(r2)
    f.close();

def replace():
    head,foot = getHF()
    #print head, foot
    root = "../forms/"
    for dirName, subdirList, fileList in os.walk(root):
        for fname in fileList:
            changeHeadFoot(root+fname, head, foot)

replace();

import gwcat
import json
import os
import argparse

dataDir='data/'
update=False

if update==True:
    gc=gwcat.GWCat(fileIn=os.path.join(dataDir,'events.json'),dataDir=dataDir)
    # gdb=json.load(open(os.path.join(dataDir,'gracedb.json')))
    # gwoscdata=json.load(open(os.path.join(dataDir,'gwosc.json')))
    gwoscdata=gwcat.gwosc.getGwosc(verbose=True,export=True,dirOut=dataDir)
    gdb=gwcat.gracedb.getSuperevents(verbose=True,export=True,dirOut=dataDir)
    json.dump(gwoscdata,open(os.path.join(dataDir,'gwosc.min.json'),'w'))
    json.dump(gdb,open(os.path.join(dataDir,'gracedb.min.json'),'w'))
    print('importing GWOSC...')
    gc.importGwosc(gwoscdata,verbose=False)
    print('importing GraceDB...')
    gc.importGraceDB(gdb,verbose=False)
else:
    print('importing from local file')
    gc=gwcat.GWCat(fileIn=os.path.join(dataDir,'gwosc_gracedb.json'),dataDir=dataDir)
gc.updateMaps(verbose=False)
gc.plotMapPngs(verbose=True,overwrite=False)

gc.exportJson(os.path.join(dataDir,'gwosc_gracedb.json'))
gcdat=json.load(open(os.path.join(dataDir,'gwosc_gracedb.json')))
json.dump(gcdat,open(os.path.join(dataDir,'gwosc_gracedb.min.json'),'w'))
gwcat.json2jsonp(os.path.join(dataDir,'gwosc_gracedb.json'),os.path.join(dataDir,'gwosc_gracedb.jsonp'))
gwcat.json2jsonp(os.path.join(dataDir,'gwosc_gracedb.min.json'),os.path.join(dataDir,'gwosc_gracedb.min.jsonp'))
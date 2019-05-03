def getSupereventList():
    from ligo.gracedb.rest import GraceDb,GraceDbBasic
    service_url = 'https://gracedb.ligo.org/api/'
    client = GraceDbBasic(service_url)

    # Retrieve an iterator for events matching a query.
    events = client.superevents('far < 1.0e-4')
    # For each event in the search results, add the graceid
    # and chirp mass to a dictionary.
    results = {}
    for event in events:
        sid = event['superevent_id']
        results[sid]={id:event['superevent_id']}
        results[sid]['far']=event['far']
        filename = 'bayestar.fits'
        print('downloading {} for superevent {}'.format(filename,sid))
        clFits=GraceDbBasic(service_url)
        outFilename = '{}_{}'.format(sid,filename)
        fout=open(outFilename,'w')
        r = clFits.files(sid,filename)
        fout.write(r.read())
        fout.close()

    return(results)


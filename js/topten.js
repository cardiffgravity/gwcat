function TopTen(){
    this.init();
    return this;
}
TopTen.prototype.init = function(){
    // add columns
    addColumn('Mratio',calcMratio,{sigfig:2,err:0,name_en:'Mass ratio'})
    addColumn('Mtotal',calcMtotal,{'unit_en':'M_sun',sigfig:2,err:0,name_en:'Total mass'})
    // define lists
    this.lists={
        'mass':{sortcol:'Mchirp',order:'dec',format:'',title:'Chirp Mass',sigfig:1},
        'mratio':{sortcol:'Mratio',order:'dec',format:'',title:'Mass Ratio'},
        'mfinal':{sortcol:'Mfinal',order:'dec',format:'',title:'Final Mass'},
        'loc':{sortcol:'deltaOmega',order:'asc',format:'fixed',title:'Localisation',namelink:true,hoverlink:true},
        'date':{sortcol:'GPS',valcol:'UTC',order:'asc',format:'date',title:'Detection Date'},
        'FAR':{sortcol:'FAR',order:'asc',format:'auto',title:'Certainty'},
        'Erad':{sortcol:'Erad',order:'dec',format:'fixed',title:'Energy'},
        'Lpeak':{sortcol:'lpeak',order:'dec',format:'fixed',title:'Luminosity'},
        'SNR':{sortcol:'rho',order:'dec',format:'fixed',title:'Signal-to-Noise Ratio'},
        'distance':{sortcol:'DL',order:'asc',format:'fixed',title:'Distance'}
    };
    this.makeDivs();
    for (l in this.lists){
        this.popList(l);
        this.makeList(l);
    }
}
TopTen.prototype.makeDivs = function(holderid='top10holder'){
    // make divs for lists
    hd=d3.select((holderid[0]=='#')?holderid:'#'+holderid);
    for (l in this.lists){
        lid='list-'+l;
        hd.append('div')
            .attr('class','top10list')
            .attr('id',lid)
    }
}
TopTen.prototype.popList = function(l){
    // populate list object with events/values
    var listitem=this.lists[l];
    gwcat.orderData(listitem.sortcol,(listitem.order=='dec')?true:false);
    listitem.names=[];
    listitem.values=[];
    listitem.valtypes=[];
    // if (listitem.namelink){listitem.namelinks=[]}
    // if (listitem.vallink){listitem.vallinks=[]}
    // if (listitem.hoverlink){listitem.hoverlinks=[]}
    var num=0;
    for (n in gwcat.dataOrder){
        if (num>=10){continue}
        if (gwcat.getNominal(gwcat.dataOrder[n],listitem.sortcol)){
            listitem.names.push(gwcat.dataOrder[n]);
            listitem.valtypes.push(gwcat.getParamType(gwcat.dataOrder[n],(listitem.valcol)?listitem.valcol:listitem.sortcol));
            listitem.values.push(gwcat.getNominal(gwcat.dataOrder[n],(listitem.valcol)?listitem.valcol:listitem.sortcol))
            num+=1;
        }
    }
    this.lists[l]=listitem;
}
TopTen.prototype.makeList = function(l){
    // add divs for list
    var _t10=this;
    var listitem=this.lists[l];
    lid='list-'+l;
    ldiv=d3.select('#'+lid)
    ldiv.selectAll("*").remove();
    ldiv.append('div')
        .attr('class','list-title')
        .html(this.gettitle(l))
    d3.select('#order-'+l).on("click",function(){
        thisl=this.id.replace('order-','')
        _t10.reorderList(thisl);
    })
    for (n in listitem.names){
        evtype=(listitem.names[n][0]=='G')?'GW':'Cand';
        evodd=(n%2==0)?'even':'odd';
        ldiv.append('div')
            .attr('class','list-item '+evtype+' '+evodd)
            .html(this.gethtml(l,n))
    }
}
TopTen.prototype.gethtml = function(l,n){
    // get html for list item
    listitem=this.lists[l];
    sigfig=(listitem.sigfig)?listitem.sigfig:gwcat.datadict[listitem.sortcol].sigfig;
    if (listitem.format=='fixed'){
        val=listitem.values[n].toFixed(sigfig);
    }else if(listitem.format=='exp'){
        val=listitem.values[n].toExponential(sigfig);
    }else if(listitem.format=='date'){
        reDate=/(.*)T(.*)/g
        val=listitem.values[n]
        val=val.replace(reDate,"$1");
    }else{
        // automatic
        val=listitem.values[n];
        if (typeof val === "number"){
            if (listitem.values[n] > 10**(-sigfig)){
                val=val.toFixed(sigfig);
            }else{
                val=val.toExponential(sigfig);
                reDate=/(.*)e(.*)/g
                val=val.replace(reDate,"$1x10<sup>$2</sup>");
            }
        }
    }
    if (listitem.valtypes[n]=='lower'){val='> '+val}
    else if (listitem.valtypes[n]=='upper'){val='< '+val}
    var namelink='';
    var hoverlink='';
    if (listitem.namelink){
        // get skymaps URL
        if (listitem.sortcol=='deltaOmega'){
            namelink='<a title="Skymaps" href="skymaps.html#'+gwcat.dataOrder[n]+'">';
        }else{
            namelink='';
        }
    }
    // if (listitem.hover){
    //     // get hover url
    //     if (listitem.sortcol=='deltaOmega'){
    //         hovlink=gwcat.getLink(listitem.names[n],'skymap-thumbnail','Cartesian zoomed');
    //         if(hovlink.length>0){
    //             hovref='<a title="'+link[0].text+'" href="'+link[0].url+'">';
    //         }
    //     }
    // }
    htmlname=(namelink) ? '<div class="evname">'+namelink+listitem.names[n]+'</a></div>' : '<div class="evname">'+listitem.names[n]+'</div>';
    htmlval='<div class="evval">'+val+'</div>';
    return(htmlname+htmlval)
}
TopTen.prototype.gettitle = function(l){
    // get title for list
    var listitem=this.lists[l];
    if (listitem.title){
        title=listitem.title;
    }else{
        title=gwcat.paramName((listitem.valcol)?listitem.valcol:listitem.sortcol);
    }
    order=(listitem.order=='asc')?'&uarr;':'&darr;'
    titorder='<div class="listorder" id="order-'+l+'">'+order+'</div>';
    titname='<div class="listname">'+title+'</div>';
    unit=gwcat.paramUnit(listitem.sortcol)
    unit=unit.replace('M_sun','M<sub>☉</sub>')
    reSup=/\^(-?[0-9]*)(?=[\s/]|$)/g
    unit=unit.replace(reSup,"<sup>$1</sup> ");
    titunit='<div class="listunit">'+unit+'</div>';
    return(titorder+titname+titunit)
}
TopTen.prototype.reorderList = function(l){
    // switch ascending or descending
    oldorder=this.lists[l].order;
    neworder = (oldorder=='dec')?'asc':'dec';
    this.lists[l].order=neworder;
    this.popList(l);
    this.makeList(l);
}

function makeTopTen(){
    // make top ten database
    this.Top10=new TopTen();
    if ((gwcat.meta)&&(gwcat.meta.gwosc)){
        document.getElementById('gwosc-build-date').innerHTML = gwcat.meta.gwosc.retrieved
        document.getElementById('gwosc-build-url').setAttribute('href',gwcat.meta.gwosc.src)
    }
    if ((gwcat.meta)&&(gwcat.meta.graceDB)){
        document.getElementById('gracedb-build-date').innerHTML = gwcat.meta.graceDB.retrieved
        document.getElementById('gracedb-build-url').setAttribute('href',gwcat.meta.graceDB.src)
    }
    if ((gwcat.meta)&&(gwcat.meta.manual)){
        document.getElementById('manual-build-date').innerHTML = gwcat.meta.manual.retrieved
        document.getElementById('manual-build-url').setAttribute('href',gwcat.meta.manual.src)
    }
}

function addColumn(colname,fncalc,dict){
    if (typeof fncalc === "function"){
        gwcat.datadict[colname]=dict;
        for (e in gwcat.data){
            ev=gwcat.data[e].name;
            val=fncalc(ev);
            if (val){gwcat.data[e][colname]=val}
        }
    }
}
function calcMratio(ev){
    if (gwcat.getBest(ev,'M2') && gwcat.getBest(ev,'M1')){
        return {'best':gwcat.getBest(ev,'M2')/gwcat.getBest(ev,'M1')}
    }else{return Math.NaN}
}
function calcMtotal(ev){
    if (gwcat.getBest(ev,'M2') && gwcat.getBest(ev,'M1')){
        return {'best':gwcat.getBest(ev,'M2') + gwcat.getBest(ev,'M1')}
    }else{return Math.NaN}
}
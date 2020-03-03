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
        'totmass':{sortcol:'Mtotal',order:'dec',format:'',title:'Total Mass',sigfig:3,icon:'img/mass.svg',icon_unit:10},
        'mratio':{sortcol:'Mratio',order:'dec',format:'',title:'Mass Ratio',bar:'#000000',bar_min:0,bar_max:1},
        'mfinal':{sortcol:'Mfinal',order:'dec',format:'',title:'Final Mass',icon:'img/mass.svg',icon_unit:10},
        'loc':{sortcol:'deltaOmega',order:'asc',format:'fixed',title:'Localisation',namelink:true,hoverlink:true,bar:'#000000',bar_min:1,bar_max:40000,bar_log:true,sigfig:0},
        'date':{sortcol:'GPS',valcol:'UTC',order:'asc',format:'date',title:'Detection Date'},
        'FAR':{sortcol:'FAR',order:'asc',format:'auto',title:'False Alarm Rate'},
        'Erad':{sortcol:'Erad',order:'dec',format:'fixed',title:'Energy',icon:'img/sun.svg',icon_unit:1},
        'Lpeak':{sortcol:'lpeak',order:'dec',format:'fixed',title:'Luminosity',icon:'img/sun.svg',icon_unit:1},
        'SNR':{sortcol:'rho',order:'dec',format:'fixed',title:'Signal-to-Noise Ratio'},
        'distance':{sortcol:'DL',order:'asc',format:'fixed',title:'Distance',bar:'#000000',bar_max:6000}
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
            .attr('id',l+'_'+n)
            .html(this.gethtml(l,n))
        if (listitem.icon){
            this.addicons(l,n);
        }
        if (listitem.bar){
            this.addbar(l,n);
        }
    }
}
TopTen.prototype.gethtml = function(l,n){
    // get html for list item
    listitem=this.lists[l];
    sigfig=(listitem.hasOwnProperty('sigfig'))?listitem.sigfig:gwcat.datadict[listitem.sortcol].sigfig;
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
                val=val.toPrecision(sigfig);
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
    htmlicon='<div class="evgraph">'+''+'</div>';
    htmlval='<div class="evval">'+val+'</div>';
    return(htmlname+htmlicon+htmlval)
}
TopTen.prototype.addicons = function(l,n){
    var listitem = this.lists[l];
    nimg=listitem.values[n]/listitem.icon_unit;
    evdiv=d3.select('#'+l+'_'+n+' > .evgraph');
    for (i=1;i<=nimg;i++){
        evdiv.append('div')
            .attr('class','icon '+l+' '+l+'-'+n)
            .attr('id','icon-'+l+'-'+n+'-'+i)
        .append('img')
            .attr('src',listitem.icon)
    }
    if ((nimg%1)!=0){
        evdiv.append('div')
            .attr('class','icon part '+l+' '+l+'-'+n)
        .append('img')
            .attr('src',listitem.icon)
        partimg=d3.select('.icon.part.'+l+'-'+n);
        partimgwid=(nimg%1)+'em';
        partimg.style('width',partimgwid);
    }

}
TopTen.prototype.addbar = function(l,n){
    var listitem = this.lists[l];
    var bar_log=(listitem.bar_log)?listitem.bar_log:false;
    var bar_min=(listitem.bar_min)?listitem.bar_min:0;
    var bar_max=(listitem.bar_max)?listitem.bar_max:1;
    if (bar_log){
        barlen=100*(Math.log(listitem.values[n])-Math.log(bar_min))/(Math.log(bar_max)-Math.log(bar_min));}
    else{barlen=100*(listitem.values[n]-bar_min)/(bar_max-bar_min);}
    evdiv=d3.select('#'+l+'_'+n+' > .evgraph');
    evdiv.append('div')
        .attr('class','bar-bg '+l+' '+l+'-'+n)
        .attr('id','bar-bg-'+l+'-'+n)
    .append('div')
        .attr('class','bar '+l+' '+l+'-'+n)
        .attr('id','bar-'+l+'-'+n)
        .style('width',(barlen)+'%')

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
function TopTen(){
    this.init();
    return this;
}
TopTen.prototype.init = function(){
    // add columns
    addColumn('Mratio',calcMratio,{sigfig:2,err:0,name_en:'Mass ratio'})
    addColumn('Mtotal',calcMtotal,{'unit_en':'M_sun',sigfig:3,err:0,name_en:'Total mass'})
    // define lists
    this.lists={
        'totmass':{sortcol:'Mtotal',order:'dec',format:'',title:'Total Mass',icon:'img/mass.svg',icon_unit:10},
        'mratio':{sortcol:'Mratio',order:'dec',format:'',title:'Mass Ratio',bar:'#000000',bar_min:0,bar_max:1,show_err:true},
        'mfinal':{sortcol:'Mfinal',order:'dec',format:'',title:'Final Mass',icon:'img/mass.svg',icon_unit:10,show_err:true},
        'loc':{sortcol:'deltaOmega',order:'asc',format:'',title:'Localisation',namelink:false,hoverlink:true,bar:'#000000',bar_min:1,bar_max:40000,bar_log:true},
        'date':{sortcol:'GPS',valcol:'UTC',order:'asc',format:'date',title:'Detection Date'},
        'FAR':{sortcol:'FAR',order:'asc',format:'',title:'False Alarm Rate'},
        'Erad':{sortcol:'Erad',order:'dec',format:'',title:'Energy',icon:'img/sun.svg',icon_unit:1,show_err:true},
        'Lpeak':{sortcol:'lpeak',order:'dec',format:'',title:'Luminosity',icon:'img/bulb.svg',icon_unit:1,show_err:true},
        'SNR':{sortcol:'rho',order:'dec',format:'',title:'Signal-to-Noise Ratio'},
        'distance':{sortcol:'DL',order:'asc',format:'',title:'Distance',bar:'#000000',bar_max:'auto',show_err:true}
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
    listitem.errpos=[];
    listitem.errneg=[];
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
            if (listitem.show_err){
                listitem.errneg.push(
                    gwcat.getMinVal(gwcat.dataOrder[n],(listitem.valcol)?listitem.valcol:listitem.sortcol));
                listitem.errpos.push(gwcat.getMaxVal(gwcat.dataOrder[n],(listitem.valcol)?listitem.valcol:listitem.sortcol));
            }else{
                listitem.errpos.push(Math.NaN);
                listitem.errneg.push(Math.NaN);
            }
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
    val=setPrecision(listitem.values[n],sigfig);
    if (listitem.valtypes[n]=='lower'){val='> '+val}
    else if (listitem.valtypes[n]=='upper'){val='< '+val}
    if (listitem.show_err && listitem.valtypes[n]=='best'){
        errpos=setPrecision(listitem.errpos[n]-listitem.values[n],sigfig)
        errneg=setPrecision(listitem.values[n]-listitem.errneg[n],sigfig)
        htmlerr='<div class="everr pos">+'+errpos+'</div><div class="everr neg">&ndash;'+errneg+'</div>'
    }else{
        htmlerr=''
    }
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
    htmlerr
    return(htmlname+htmlicon+htmlval+htmlerr)
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
            .attr('id','icon-part-'+l+'-'+n)
        .append('img')
            .attr('src',listitem.icon)
            .attr('id','icon-part-img-'+l+'-'+n)
        partimg=d3.select('.icon.part.'+l+'-'+n);
        partimgwid=(document.getElementById('icon-part-img-'+l+'-'+n).naturalWidth*(nimg%1))+'px';
        partimg.style('width',partimgwid);
    }

}
TopTen.prototype.addbar = function(l,n){
    var listitem = this.lists[l];
    var show_err=(listitem.show_err)?listitem.show_err:false;
    var bar_log=(listitem.bar_log)?listitem.bar_log:false;
    var bar_min=(listitem.bar_min)?listitem.bar_min:0;
    var bar_max=(listitem.bar_max)?listitem.bar_max:1;
    if (listitem.bar_max=='auto'){
        if (show_err){
            maxval=Math.max.apply(null,listitem.errpos);
        }else{
            maxval=Math.max.apply(null,listitem.values);
        }
        bar_max=10**Math.floor(Math.log10(maxval))*(Math.floor(maxval/10**Math.floor(Math.log10(maxval)))+1);
        console.log(maxval,Math.log10(maxval),maxval/10**Math.floor(Math.log10(maxval)),bar_max);
    }
    if (bar_log){
        barlen=100*(Math.log(listitem.values[n])-Math.log(bar_min))/(Math.log(bar_max)-Math.log(bar_min));}
    else{barlen=100*(listitem.values[n]-bar_min)/(bar_max-bar_min);}
    if (show_err){

    }
    evdiv=d3.select('#'+l+'_'+n+' > .evgraph');
    evdiv.append('div')
        .attr('class','bar-bg '+l+' '+l+'-'+n)
        .attr('id','bar-bg-'+l+'-'+n)
    .append('div')
        .attr('class','bar '+l+' '+l+'-'+n)
        .attr('id','bar-'+l+'-'+n)
        .style('width',(barlen)+'%');
    if (show_err){
        if (bar_log){
            errmin=100*(Math.log(listitem.errneg[n])-Math.log(bar_min))/(Math.log(bar_max)-Math.log(bar_min));
            errmax=100*(Math.log(listitem.errpos[n])-Math.log(bar_min))/(Math.log(bar_max)-Math.log(bar_min));
        }else{
            errmin=100*(listitem.errneg[n]-bar_min)/(bar_max-bar_min);
            errmax=100*(listitem.errpos[n]-bar_min)/(bar_max-bar_min);
        }
        console.log(errmin,errmax)
        barbg=evdiv.select('.bar-bg')
        barbg.append('div')
            .attr('class','errmin '+l+' '+l+'-'+n)
            .attr('id','errmin-'+l+'-'+n)
            .style('left',(errmin)+'%')
            .style('width',(barlen-errmin)+'%');
        barbg.append('div')
            .attr('class','errmax '+l+' '+l+'-'+n)
            .attr('id','errmax-'+l+'-'+n)
            .style('left',(barlen)+'%')
            .style('width',(errmax-barlen)+'%');
    }
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
        best=gwcat.getBest(ev,'M2')/gwcat.getBest(ev,'M1');
        low=gwcat.getMinVal(ev,'M2')/gwcat.getMaxVal(ev,'M1');
        high=gwcat.getMaxVal(ev,'M2')/gwcat.getMinVal(ev,'M1');
        return {'best':best,'err':[low-best,high-best]}
    }else{return Math.NaN}
}
function calcMtotal(ev){
    if (gwcat.getBest(ev,'M2') && gwcat.getBest(ev,'M1')){
        return {'best':gwcat.getBest(ev,'M2') + gwcat.getBest(ev,'M1')}
    }else{return Math.NaN}
}
function setPrecision(val,sigfig){
    if (listitem.format=='fixed'){
        valOut=val.toFixed(sigfig);
    }else if(listitem.format=='exp'){
        valOut=val.toExponential(sigfig);
    }else if(listitem.format=='date'){
        reDate=/(.*)T(.*)/g
        valOut=val.replace(reDate,"$1");
    }else{
        // automatic
        if (typeof val === "number"){
            prec=Math.floor(Math.log10(Math.abs(val)))+1-sigfig
            if (Math.abs(val) > 10**(-sigfig)){
                valOut=10**prec * Math.round(val/10**prec);
                valOut=(prec<0)?valOut.toFixed(-prec):valOut;
            }else if (val==0){
                valOut=0;
            }else{
                valOut=val.toExponential(sigfig);
                reDate=/(.*)e(.*)/g
                valOut=valOut.replace(reDate,"$1x10<sup>$2</sup>");
            }
        }
    }
    return valOut;
}